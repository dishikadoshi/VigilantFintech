/**
 * setupSheets.js
 * ────────────────
 * Auto-provisions the Google Sheet: creates every tab this project
 * needs (if it doesn't already exist) and writes the correct header
 * row into each one. Replaces manually creating tabs/columns by hand.
 *
 * Safe to re-run any time — it only creates what's missing and never
 * touches a tab (or header row) that already exists, so it won't
 * overwrite live data.
 *
 * Usage:
 *   cd backend
 *   npm install
 *   npm run setup:sheets
 *
 * Requires GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, and
 * GOOGLE_SHEET_ID already set in .env, and the sheet already shared
 * with the service account (Editor access) — see GOOGLE_SHEETS_SETUP.md
 * steps 1–3.
 */

require('dotenv').config();
const { getSheetsClient, getSpreadsheetId } = require('../src/config/googleSheetsClient');

const TABS = [
  {
    name: 'Enquiries',
    // NOTE: "SMS" is appended at the END, not inserted between existing
    // columns. This script overwrites row 1 on every run (even for tabs
    // that already have data) — inserting a new header in the *middle*
    // would shift every column after it out of alignment with the data
    // rows already sitting under the old positions. Appending at the end
    // is safe for both a brand-new tab and an already-provisioned one.
    headers: ['ID', 'FIRST NAME', 'LAST NAME', 'COMPANY', 'EMAIL ID', 'COUNTRY CODE', 'CONTACT NO.', 'REASON', 'MESSAGE', 'STATUS', 'SOURCE', 'ADMIN NOTES', 'CREATED AT', 'UPDATED AT', 'SMS'],
  },
  {
    name: 'Bookings',
    // One row per Cal.com meeting, written by the Cal.com webhook
    // (created / rescheduled / cancelled).
    headers: ['ID', 'BOOKING UID', 'NAME', 'EMAIL ID', 'CONTACT NO.', 'NOTES', 'MEETING TIME', 'START TIME UTC', 'END TIME UTC', 'TIMEZONE', 'MEETING URL', 'EVENT TITLE', 'STATUS', 'SOURCE', 'CREATED AT', 'UPDATED AT'],
  },
];

async function main() {
  console.log('── Provisioning Google Sheet tabs ─────────────────────');

  const sheets = getSheetsClient();
  const spreadsheetId = getSpreadsheetId();

  const { data } = await sheets.spreadsheets.get({ spreadsheetId });
  const existingTitles = new Set((data.sheets || []).map(s => s.properties.title));

  // 1. Create any missing tabs in a single batchUpdate call
  const missing = TABS.filter(t => !existingTitles.has(t.name));
  if (missing.length > 0) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: missing.map(t => ({ addSheet: { properties: { title: t.name } } })),
      },
    });
    missing.forEach(t => console.log(`✅  Created tab "${t.name}"`));
  }

  // 2. Overwrite the header row into each tab so it always matches TABS above.
  //    (Previously this skipped tabs that already had a header row — but that
  //    meant re-running the script could never fix/relabel headers you'd
  //    already written once. It still never touches row 2+, so real data
  //    is untouched.)
  for (const tab of TABS) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${tab.name}!A1`,
      valueInputOption: 'RAW',
      requestBody: { values: [tab.headers] },
    });
    console.log(`✅  Wrote header row to "${tab.name}" (${tab.headers.length} columns)`);
  }

  console.log('────────────────────────────────────────────────────');
  console.log('Done. Open the sheet to confirm, then run: npm test');
}

main().catch(err => {
  console.error('❌  setupSheets failed:', err.message);
  console.error('    Check GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_PRIVATE_KEY / GOOGLE_SHEET_ID in .env');
  console.error('    and that the sheet is shared with the service account email (Editor access).');
  process.exit(1);
});