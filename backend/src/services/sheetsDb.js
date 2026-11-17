/**
 * sheetsDb.js
 * ────────────
 * Generic "table" helper that treats a single tab (worksheet) inside
 * the Google Sheet as a database table:
 *   - Row 1        = column headers
 *   - Every row after = one record
 *   - The `id` column is treated as the primary key — and holds a
 *     short, readable, sequential ID like "EQ-SITE-001" (not a UUID).
 *
 * This is the module every route/service uses instead of Supabase's
 * `.from('table').select()/.insert()/.update()/.delete()` calls.
 *
 * JSON fields (bullets, metrics) are stored as JSON strings in the
 * cell and are automatically parsed back into arrays on read.
 * Numeric fields (rating, sort_order) are automatically parsed back
 * into numbers on read.
 *
 * PERFORMANCE: reads are cached in-memory for a few seconds
 * (READ_CACHE_TTL_MS) and invalidated immediately on any write to
 * that tab. This is what makes admin-dashboard page-hopping feel
 * instant instead of re-fetching the whole tab from Google on every
 * click — while writes are still always fully fresh.
 */

const { getSheetsClient, getSpreadsheetId } = require('../config/googleSheetsClient');

const JSON_FIELDS = new Set();
const NUMERIC_FIELDS = new Set();

// Short, readable ID prefixes per tab — e.g. "EQ-SITE-001".
// Any tab not listed here falls back to a plain incrementing number
// with no prefix, so a new tab still works without code changes.
const ID_PREFIXES = {
  Enquiries: 'EQ',
  Bookings: 'BK',
};

// ── Header text  ↔  canonical field key ──────────────────────────────
// The sheet's row-1 text is just a LABEL for humans. The actual code
// (providers, insert/updateById below) always reads/writes records
// using the canonical snake_case field key on the right (e.g. `role_title`,
// `created_at`) — never the label itself. That's what lets you rename a
// header's capitalization/spacing in the sheet UI (ROLE TITLE, Role Title,
// role_title …) without breaking submissions: whatever's actually typed
// in row 1 gets matched, case/spacing-insensitively, back to the field
// key the rest of the app already uses.
const HEADER_MAPS = {
  Enquiries: {
    id: 'ID', first_name: 'FIRST NAME', last_name: 'LAST NAME', company: 'COMPANY',
    email: 'EMAIL ID', country_code: 'COUNTRY CODE', phone: 'CONTACT NO.', reason: 'REASON',
    message: 'MESSAGE', sms: 'SMS', status: 'STATUS', source: 'SOURCE', admin_notes: 'ADMIN NOTES',
    created_at: 'CREATED AT', updated_at: 'UPDATED AT',
  },
  // Cal.com meeting bookings — written by services/bookingService.js from
  // the Cal.com webhook (routes/calcomWebhook.js).
  Bookings: {
    id: 'ID', booking_uid: 'BOOKING UID', name: 'NAME', email: 'EMAIL ID', phone: 'CONTACT NO.',
    notes: 'NOTES', meeting_time: 'MEETING TIME', start_time: 'START TIME UTC', end_time: 'END TIME UTC',
    timezone: 'TIMEZONE', meeting_url: 'MEETING URL', event_title: 'EVENT TITLE', status: 'STATUS',
    source: 'SOURCE', created_at: 'CREATED AT', updated_at: 'UPDATED AT',
  },
};

/** Uppercases + collapses spaces/underscores so "role_title", "ROLE TITLE"
 *  and "Role Title" all compare equal. */
function normalizeHeaderText(h) {
  return (h || '').trim().toUpperCase().replace(/[_\s]+/g, ' ');
}

/** Resolves whatever text is actually in a header cell back to the
 *  canonical field key the rest of the app uses. Falls back to
 *  slugifying the header itself for any column not in HEADER_MAPS
 *  (e.g. a tab added later), so nothing is silently dropped. */
function resolveFieldKey(tabName, rawHeader) {
  const norm = normalizeHeaderText(rawHeader);
  const map = HEADER_MAPS[tabName];
  if (map) {
    const hit = Object.entries(map).find(([, label]) => normalizeHeaderText(label) === norm);
    if (hit) return hit[0];
  }
  return norm.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

// ── In-memory read cache (per warm process / per warm serverless instance) ──
const READ_CACHE_TTL_MS = 8_000;
const _cache = new Map(); // tabName -> { at: number, data: { headers, records } }

function invalidateCache(tabName) {
  _cache.delete(tabName);
}

// ── Local-dev fallback: in-memory tables ─────────────────────────────
// When Google credentials are not configured (typical on a fresh local
// checkout), the app would otherwise throw "GOOGLE_SERVICE_ACCOUNT_EMAIL
// is not set" on every request. In that situation — and only outside
// production, or when STORAGE_PROVIDER=mock is set explicitly — rows are
// kept in memory instead (lost on restart). Production never falls back:
// missing credentials there should fail loudly.
function useMemory() {
  const provider = (process.env.STORAGE_PROVIDER || 'sheets').toLowerCase();
  if (provider === 'mock') return true;
  const isProd = (process.env.NODE_ENV || 'development') === 'production';
  return !isProd && !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
}

const _mem = new Map(); // tabName -> { headers, records }
let _memWarned = false;

function memTab(tabName) {
  if (!_memWarned) {
    _memWarned = true;
    console.warn('[Storage] Google Sheets credentials not set — using IN-MEMORY storage (local dev only; data is lost on restart).');
  }
  if (!_mem.has(tabName)) {
    const map = HEADER_MAPS[tabName] || { id: 'ID', created_at: 'CREATED AT', updated_at: 'UPDATED AT' };
    _mem.set(tabName, { headers: Object.keys(map), records: [] });
  }
  return _mem.get(tabName);
}

// Cache of tab title -> numeric sheetId (gid), needed for row deletion.
// This never changes for the lifetime of the sheet, so no TTL needed.
let _sheetIdCache = null;

async function getSheetGid(tabName) {
  if (_sheetIdCache && _sheetIdCache[tabName] !== undefined) return _sheetIdCache[tabName];

  const sheets = getSheetsClient();
  const { data } = await sheets.spreadsheets.get({ spreadsheetId: getSpreadsheetId() });

  _sheetIdCache = {};
  for (const sheet of data.sheets || []) {
    _sheetIdCache[sheet.properties.title] = sheet.properties.sheetId;
  }

  if (_sheetIdCache[tabName] === undefined) {
    throw new Error(
      `[Sheets] Tab "${tabName}" not found in the spreadsheet. ` +
      `Check GOOGLE_SHEET_ID and that a tab with this exact name exists.`
    );
  }
  return _sheetIdCache[tabName];
}

/** US-style timestamp, easy to read at a glance: "07/26/2026, 09:12:03 AM EDT" */
function nowUS() {
  return new Date().toLocaleString('en-US', {
    timeZone: 'America/New_York',
    month: '2-digit', day: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: true,
    timeZoneName: 'short',
  });
}

/** Converts a raw cell string into its JS value based on the column name. */
function decodeCell(header, raw) {
  if (raw === undefined || raw === null || raw === '') {
    return JSON_FIELDS.has(header) ? [] : '';
  }
  if (JSON_FIELDS.has(header)) {
    try { return JSON.parse(raw); } catch { return []; }
  }
  if (NUMERIC_FIELDS.has(header)) {
    const n = Number(raw);
    return Number.isNaN(n) ? raw : n;
  }
  return raw;
}

/** Converts a JS value back into a string safe to write into a cell. */
function encodeCell(header, value) {
  if (value === undefined || value === null) return '';
  if (JSON_FIELDS.has(header)) return JSON.stringify(Array.isArray(value) ? value : []);
  return String(value);
}

/**
 * Reads an entire tab. Served from the short-lived in-memory cache
 * when possible — pass { fresh: true } to force a real network read
 * (used before generating a new sequential ID, so two near-simultaneous
 * submissions are less likely to collide).
 *
 * Returns { headers, records } where each record is a plain object
 * plus a non-enumerable-ish `_row` field (1-based sheet row number,
 * header row = 1, so first data row = 2) used internally for updates/deletes.
 */
async function readTab(tabName, { fresh = false } = {}) {
  if (useMemory()) return memTab(tabName);
  if (!fresh) {
    const cached = _cache.get(tabName);
    if (cached && (Date.now() - cached.at) < READ_CACHE_TTL_MS) {
      return cached.data;
    }
  }

  const sheets = getSheetsClient();
  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId: getSpreadsheetId(),
    range: tabName,
  });

  const values = data.values || [];
  let result;
  if (values.length === 0) {
    result = { headers: [], records: [] };
  } else {
    // `headers` here is the canonical field key for each column (e.g.
    // `role_title`), resolved from whatever text is actually typed in
    // row 1 — NOT that literal display text. This is what lets someone
    // rename a header's capitalization/spacing in the Sheet UI without
    // breaking reads/writes: see resolveFieldKey() above.
    const headers = values[0].map(h => resolveFieldKey(tabName, h));
    const records = values.slice(1)
      .map((row, i) => {
        // Skip fully blank rows (e.g. leftover empty rows in the sheet)
        if (row.every(cell => cell === undefined || cell === '')) return null;
        const obj = {};
        headers.forEach((h, idx) => { if (h) obj[h] = decodeCell(h, row[idx]); });
        obj._row = i + 2;
        return obj;
      })
      .filter(Boolean);
    result = { headers, records };
  }

  _cache.set(tabName, { at: Date.now(), data: result });
  return result;
}

/** Returns all records in a tab, newest first if a created_at column exists. */
async function getAll(tabName, { sortDesc = true } = {}) {
  const { records } = await readTab(tabName);
  if (sortDesc && records.length && 'created_at' in records[0]) {
    records.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }
  return records;
}

/** Finds a single record by any field (defaults to `id`). Returns null if not found. */
async function findOne(tabName, field, value) {
  const { records } = await readTab(tabName);
  return records.find(r => String(r[field]) === String(value)) || null;
}

/**
 * Computes the next short sequential ID for a tab, e.g. "EQ-SITE-004".
 * Scans existing ids matching the pattern and takes max+1 — so it's
 * correct even if rows were deleted in between (never reuses a number).
 *
 * NOTE: Google Sheets has no atomic counter, so two submissions in the
 * same instant could theoretically compute the same next number. For
 * this site's volume that risk is negligible; if it ever matters, the
 * fix is a dedicated counter cell with a batchUpdate + retry loop.
 */
function computeNextId(tabName, records) {
  const prefix = ID_PREFIXES[tabName];
  if (!prefix) return null;

  const re = new RegExp(`^${prefix}-SITE-(\\d+)$`);
  let max = 0;
  for (const r of records) {
    const m = re.exec(r.id || '');
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return `${prefix}-SITE-${String(max + 1).padStart(3, '0')}`;
}

/**
 * Appends a new row. `record` should NOT include `id` / `created_at` /
 * `updated_at` — those are generated here automatically if the tab has
 * those columns.
 */
async function insert(tabName, record) {
  if (useMemory()) {
    const tab = memTab(tabName);
    const full = { ...record };
    if (!full.id) full.id = computeNextId(tabName, tab.records) || `ROW-${tab.records.length + 1}`;
    if (!full.created_at) full.created_at = nowUS();
    full.updated_at = nowUS();
    tab.records.push({ ...full, _row: tab.records.length + 2 });
    return full;
  }
  const sheets = getSheetsClient();
  // Force a fresh (non-cached) read here — this is the read the new ID
  // number is computed from, so it needs to reflect anything written
  // moments ago, not a stale cached snapshot.
  const { headers, records } = await readTab(tabName, { fresh: true });

  const full = { ...record };
  if (headers.includes('id') && !full.id) {
    full.id = computeNextId(tabName, records) || `ROW-${records.length + 1}`;
  }
  if (headers.includes('created_at') && !full.created_at) full.created_at = nowUS();
  if (headers.includes('updated_at')) full.updated_at = nowUS();

  const row = headers.map(h => encodeCell(h, full[h]));

  await sheets.spreadsheets.values.append({
    spreadsheetId: getSpreadsheetId(),
    range: tabName,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [row] },
  });

  invalidateCache(tabName);
  return full;
}

/**
 * Updates fields on the record whose `id` column matches `id`.
 * Only the keys present in `updates` are changed; everything else on
 * the row is preserved. Returns the full merged record, or null if
 * no record with that id exists.
 */
async function updateById(tabName, id, updates) {
  if (useMemory()) {
    const tab = memTab(tabName);
    const idx = tab.records.findIndex(r => String(r.id) === String(id));
    if (idx === -1) return null;
    tab.records[idx] = { ...tab.records[idx], ...updates, updated_at: nowUS() };
    const { _row, ...out } = tab.records[idx];
    return out;
  }
  const sheets = getSheetsClient();
  const { headers, records } = await readTab(tabName);
  const existing = records.find(r => String(r.id) === String(id));
  if (!existing) return null;

  const merged = { ...existing, ...updates };
  if (headers.includes('updated_at')) merged.updated_at = nowUS();

  const row = headers.map(h => encodeCell(h, merged[h]));
  const lastCol = columnLetter(headers.length);

  await sheets.spreadsheets.values.update({
    spreadsheetId: getSpreadsheetId(),
    range: `${tabName}!A${existing._row}:${lastCol}${existing._row}`,
    valueInputOption: 'RAW',
    requestBody: { values: [row] },
  });

  invalidateCache(tabName);
  delete merged._row;
  return merged;
}

/** Deletes the row whose `id` column matches `id`. Returns true if a row was deleted. */
async function deleteById(tabName, id) {
  if (useMemory()) {
    const tab = memTab(tabName);
    const before = tab.records.length;
    tab.records = tab.records.filter(r => String(r.id) !== String(id));
    return tab.records.length < before;
  }
  const sheets = getSheetsClient();
  const { records } = await readTab(tabName);
  const existing = records.find(r => String(r.id) === String(id));
  if (!existing) return false;

  const sheetId = await getSheetGid(tabName);

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: getSpreadsheetId(),
    requestBody: {
      requests: [{
        deleteDimension: {
          range: {
            sheetId,
            dimension: 'ROWS',
            startIndex: existing._row - 1, // 0-based
            endIndex: existing._row,
          },
        },
      }],
    },
  });

  invalidateCache(tabName);
  return true;
}

/** Converts a 1-based column number into a spreadsheet column letter (1 -> A, 27 -> AA). */
function columnLetter(colNumber) {
  let letter = '';
  let n = colNumber;
  while (n > 0) {
    const rem = (n - 1) % 26;
    letter = String.fromCharCode(65 + rem) + letter;
    n = Math.floor((n - 1) / 26);
  }
  return letter;
}

/** Quick connectivity + tab-existence check, used by test-connection.js and startup validation. */
async function validateTabs(tabNames) {
  if (useMemory()) { tabNames.forEach(memTab); return; }
  for (const tab of tabNames) {
    await readTab(tab, { fresh: true });
  }
}

module.exports = { readTab, getAll, findOne, insert, updateById, deleteById, validateTabs, nowUS };