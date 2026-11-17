/**
 * test-connection.js
 * ────────────────────
 * Quick standalone check that your .env is set up correctly before you
 * start the server: Google Sheets access (Enquiries + Bookings tabs),
 * the Cal.com webhook secret, and SMTP email.
 *
 * Run with: npm test   (or)   node src/test-connection.js
 */

require('dotenv').config();
const { validateStorageProvider } = require('./services/storage/storageFactory');
const sheetsDb = require('./services/sheetsDb');
const emailService = require('./services/emailService');

const REQUIRED_TABS = ['Enquiries', 'Bookings'];

async function main() {
  console.log('── Testing Google Sheets connection ──────────────────');

  try {
    await validateStorageProvider();
    console.log('✅  Storage provider connection OK');
  } catch (err) {
    console.error('❌  Storage provider connection FAILED:', err.message);
    process.exitCode = 1;
  }

  for (const tab of REQUIRED_TABS) {
    try {
      const { records } = await sheetsDb.readTab(tab);
      console.log(`✅  Tab "${tab}" reachable (${records.length} row${records.length === 1 ? '' : 's'})`);
    } catch (err) {
      console.error(`❌  Tab "${tab}" check FAILED:`, err.message);
      console.error('    Run: npm run setup:sheets');
      process.exitCode = 1;
    }
  }

  console.log('── Testing Cal.com webhook settings ───────────────────');
  if (process.env.CAL_WEBHOOK_SECRET) {
    console.log('✅  CAL_WEBHOOK_SECRET is set');
  } else {
    console.warn('⚠️  CAL_WEBHOOK_SECRET is not set — bookings will not be saved to the Bookings tab until it is.');
  }

  console.log('── Testing email (SMTP) ───────────────────────────────');
  const ok = await emailService.verifyEmailConfig();
  if (!ok) process.exitCode = 1;

  console.log('────────────────────────────────────────────────────');
  if (process.exitCode === 1) console.log('See GOOGLE_SHEETS_SETUP.md for setup steps.');
}

main();
