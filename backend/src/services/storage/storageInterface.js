/**
 * storageInterface.js
 * ───────────────────
 * Documents the contract every storage provider MUST implement.
 * This file is documentation only — it is never `require()`-d at runtime.
 *
 * To add a new provider:
 *   1. Create  src/services/storage/<name>Provider.js
 *   2. Export:  { save, validate }   — both must be async functions
 *   3. Add a case in storageFactory.js
 *   4. Set STORAGE_PROVIDER=<name> in .env
 *
 * ─── Required exports ────────────────────────────────────────────
 *
 * async save(record) → { id: string }
 *   Persist one contact-form submission.
 *   `record` shape:
 *     {
 *       id        : string,   // e.g. "SB-1717000000000"
 *       timestamp : string,   // formatted EST string
 *       firstName : string,
 *       lastName  : string,
 *       company   : string,
 *       email     : string,
 *       countryCode: string,
 *       phone     : string,
 *       reason    : string,
 *       message   : string,
 *       status    : string,   // always "new" on first insert
 *       source    : string,   // always "website_form"
 *     }
 *
 * async validate() → void   (throws on misconfiguration)
 *   Called once at server startup to catch credential errors early.
 */
