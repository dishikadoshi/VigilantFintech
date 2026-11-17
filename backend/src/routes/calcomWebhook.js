/**
 * calcomWebhook.js (route)
 * ────────────────────────
 * POST /api/webhooks/calcom
 *
 * Receives Cal.com webhooks (booking created / rescheduled / cancelled)
 * and mirrors them into the Bookings tab — bookings made in the website's
 * Cal.com popup or on your cal.com page — and keeps the row correct when a
 * meeting is cancelled or moved.
 *
 * Signature: Cal.com sends HMAC-SHA256(secret, rawBody) as hex in the
 * `x-cal-signature-256` header. server.js keeps the raw body on
 * `req.rawBody` for exactly this check.
 */

const express = require('express');
const cal = require('../services/calcomService');
const { handleWebhook } = require('../services/bookingService');

const router = express.Router();

router.post('/', async (req, res) => {
  if (!process.env.CAL_WEBHOOK_SECRET) {
    console.warn('[Cal.com webhook] CAL_WEBHOOK_SECRET is not set — rejecting webhook.');
    return res.status(503).json({ success: false, message: 'Webhook not configured.' });
  }
  if (!cal.verifyWebhook(req.rawBody, req.get('x-cal-signature-256'))) {
    return res.status(401).json({ success: false, message: 'Invalid signature.' });
  }

  // Cal.com sends a tiny test payload when you press "Ping test" — nothing to store.
  const body = req.body || {};
  try {
    const result = await handleWebhook(body);
    console.log(`[Cal.com webhook] ${body.triggerEvent || 'unknown'} → ${result.handled ? 'saved' : 'ignored'}`);
    return res.json({ success: true });
  } catch (err) {
    console.error(`[Cal.com webhook] ${body.triggerEvent} failed: ${err.message}`);
    // 500 makes Cal.com retry later, which is what we want for a transient Sheets error.
    return res.status(500).json({ success: false, message: 'Could not process webhook.' });
  }
});

module.exports = router;
