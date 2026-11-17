/**
 * calcomService.js
 * ─────────────────
 * Bookings are made inside Cal.com's own embedded booking window on the
 * website, so the backend never calls the Cal.com API. Its only job is
 * to receive Cal.com's webhooks (routes/calcomWebhook.js) and store the
 * meetings in the "Bookings" sheet tab.
 *
 * Cal.com signs every webhook with HMAC-SHA256 (hex) of the raw request
 * body, sent in the `x-cal-signature-256` header, using the secret you
 * typed into the webhook form (CAL_WEBHOOK_SECRET).
 */

const crypto = require('crypto');

function verifyWebhook(rawBody, signature) {
  const secret = process.env.CAL_WEBHOOK_SECRET;
  if (!secret || !rawBody || !signature) return false;
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(String(signature).trim());
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

module.exports = { verifyWebhook };
