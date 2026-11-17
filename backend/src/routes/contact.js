/**
 * contact.js (route)
 * ──────────────────
 * POST /api/contact  — receive a form submission
 * GET  /api/contact/ping — smoke-test this endpoint
 */

const express   = require('express');
const rateLimit = require('express-rate-limit');
const { submitContact  } = require('../services/contactService');
const { validateContact} = require('../middleware/validateContact');

const router = express.Router();

// ── Rate limit: 5 submissions per IP per 15 min ──────────────────
const limiter = rateLimit({
  windowMs       : (parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES) || 15) * 60 * 1_000,
  max            : parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 5,
  standardHeaders: true,
  legacyHeaders  : false,
  message: {
    success: false,
    message: 'Too many requests. Please wait a few minutes before trying again.',
  },
  skip: () => process.env.NODE_ENV === 'test',
});

// POST /api/contact
router.post('/', limiter, validateContact, async (req, res, next) => {
  try {
    const result = await submitContact(req.body);
    return res.status(200).json({
      success : true,
      message : "Your enquiry has been received. We'll be in touch within one business day.",
      id      : result.id,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/contact/ping
router.get('/ping', (_req, res) => {
  res.json({ success: true, message: 'Contact endpoint alive' });
});

module.exports = router;
