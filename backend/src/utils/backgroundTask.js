/**
 * backgroundTask.js
 * ────────────────────
 * Runs a promise "in the background" — the caller does NOT await it,
 * so the HTTP response can go out immediately without waiting on slow
 * work like sending emails.
 *
 * The tricky part: on Vercel, a serverless function can be frozen the
 * instant the response is sent, which would silently kill a plain
 * fire-and-forget promise mid-flight. Vercel's own fix for exactly
 * this is `waitUntil()` from the `@vercel/functions` package — it
 * tells the platform "keep this function alive until this promise
 * settles, even though the response already went out."
 *
 * This wrapper uses waitUntil() when it's available and safe to call
 * (i.e. running inside an actual Vercel Function), and transparently
 * falls back to plain fire-and-forget everywhere else (local dev,
 * or any non-Vercel host) — so the exact same code works in both
 * places without needing an environment check.
 */

let _waitUntil = null;
try {
  // Only require()d if the package is installed — safe even if it
  // isn't (e.g. someone strips it out), everything just falls back.
  _waitUntil = require('@vercel/functions').waitUntil;
} catch {
  _waitUntil = null;
}

/**
 * Fire `promise` in the background. Always attaches a .catch() so a
 * rejection never becomes an unhandled promise rejection / crashes
 * the process — errors are logged via `onError` (or console.error by
 * default) instead.
 */
function runInBackground(promise, onError) {
  const safe = promise.catch(err => {
    (onError || ((e) => console.error('[Background task] failed:', e.message)))(err);
  });

  if (_waitUntil) {
    try {
      _waitUntil(safe);
    } catch {
      // Not actually inside a Vercel request context right now (e.g.
      // called during local `node src/server.js`) — that's fine, the
      // promise above is already running fire-and-forget regardless.
    }
  }

  return safe;
}

module.exports = { runInBackground };
