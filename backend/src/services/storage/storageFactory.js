/**
 * storageFactory.js
 * ─────────────────
 * Returns the active storage provider based on STORAGE_PROVIDER env var.
 *
 * Supported values:
 *   sheets    (default / current — production, Google Sheets)
 *   mock      (dev / test — in-memory, no credentials needed)
 *
 * To add another provider later:
 *   1. Create  src/services/storage/<name>Provider.js
 *      exporting { save, validate }  (see storageInterface.js)
 *   2. Add a case below
 *   3. Set STORAGE_PROVIDER=<name> in .env
 */

let _instance = null;

function getStorageProvider() {
  if (_instance) return _instance;

  const provider = (process.env.STORAGE_PROVIDER || 'sheets').toLowerCase();

  switch (provider) {

    case 'sheets':
    case 'google_sheets':
      _instance = require('./sheetsProvider');
      break;

    case 'mock':
      _instance = require('./mockProvider');
      break;

    default:
      throw new Error(
        `Unknown STORAGE_PROVIDER "${provider}". Supported values: sheets, mock.`
      );
  }

  console.log(`[Storage] Provider loaded: ${provider}`);
  return _instance;
}

/** Call once at startup to catch bad credentials before the first real request. */
async function validateStorageProvider() {
  const p = getStorageProvider();
  if (typeof p.validate === 'function') {
    await p.validate();
  }
}

module.exports = { getStorageProvider, validateStorageProvider };
