
require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const contactRouter = require('./routes/contact');
const healthRouter = require('./routes/health');
const calcomWebhookRouter = require('./routes/calcomWebhook');

const errorHandler = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');

const {
  validateStorageProvider
} = require('./services/storage/storageFactory');

const emailService = require('./services/emailService');

const app = express();

const PORT = process.env.PORT || 4000;

// Running behind Vercel's proxy.
app.set('trust proxy', 1);

// Security headers.
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: {
      policy: 'cross-origin',
    },
  })
);

// Strict CORS configuration.
const allowedOrigins = (
  process.env.ALLOWED_ORIGINS ||
  'http://localhost:3000'
)
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error(`CORS: origin ${origin} not allowed`)
      );
    },

    methods: [
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'OPTIONS',
    ],

    allowedHeaders: [
      'Content-Type',
      'Authorization',
    ],

    credentials: true,
  })
);

// Preserve original request bytes for Cal.com webhook verification.
app.use(
  express.json({
    limit: '200kb',

    verify: (req, res, buffer) => {
      req.rawBody = buffer;
    },
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: '200kb',
  })
);

app.use(requestLogger);

// API routes.
app.use('/api/health', healthRouter);

app.use('/api/contact', contactRouter);

app.use(
  '/api/webhooks/calcom',
  calcomWebhookRouter
);

// Not found handler.
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Global error handler.
app.use(errorHandler);

/**
 * Prevent startup checks from hanging indefinitely.
 */
function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,

    new Promise((_, reject) => {
      setTimeout(
        () => reject(
          new Error(`${label} timed out after ${ms}ms`)
        ),
        ms
      );
    }),
  ]);
}

/**
 * Local startup validation.
 */
async function runStartupChecks() {
  try {
    await withTimeout(
      validateStorageProvider(),
      10000,
      '[Storage] validateStorageProvider()'
    );
  } catch (err) {
    console.error(
      `[Storage] Startup validation failed: ${err.message}`
    );

    console.error(
      'Check GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_PRIVATE_KEY / GOOGLE_SHEET_ID in backend/.env,'
    );

    console.error(
      'or set STORAGE_PROVIDER=mock for local development without Google Sheets.'
    );
  }

  try {
    await withTimeout(
      emailService.verifyEmailConfig(),
      10000,
      '[Email] verifyEmailConfig()'
    );
  } catch (err) {
    console.error(
      `[Email] Startup validation failed: ${err.message}`
    );
  }
}

// Local development: start Express normally.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(
      `\n✅ Vigilant Fintech backend running on port ${PORT}`
    );

    console.log(
      `    Env  : ${process.env.NODE_ENV || 'development'}`
    );

    console.log(
      `    CORS : ${allowedOrigins.join(', ')}\n`
    );
  });
}

// Vercel: do not perform external authentication checks
// during cold start. Google WIF authentication happens
// lazily when a request actually uses Google Sheets.
if (
  process.env.VERCEL === '1' ||
  process.env.VERCEL_ENV
) {
  console.log(
    '[Startup] Skipping external Google Sheets and SMTP checks on Vercel; services are checked when used by requests.'
  );
} else {
  runStartupChecks();
}

module.exports = app;
