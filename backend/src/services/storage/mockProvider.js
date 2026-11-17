/**
 * mockProvider.js
 * ────────────────
 * In-memory storage for local development.
 * No credentials required. Data is lost on server restart.
 * Use STORAGE_PROVIDER=mock in .env when developing without Google Sheets.
 */

const store = [];

async function save(record) {
  store.push({ ...record });
  console.log(`[MockStorage] Saved submission ${record.id}  (total in memory: ${store.length})`);
  console.log('[MockStorage]', JSON.stringify(record, null, 2));
  return { id: record.id };
}

async function validate() {
  console.log('[MockStorage] Mock provider ready — no credentials needed.');
}

/** Dev-only: read everything stored so far. */
function getAll() {
  return [...store];
}

module.exports = { save, validate, getAll };
