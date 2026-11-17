require('dotenv').config();
const express      = require('express');
const helmet       = require('helmet');
const cors         = require('cors');

const contactRouter     = require('./routes/contact');
const healthRouter      = require('./routes/health');
const calcomWebhookRouter = require('./routes/calcomWebhook');
const errorHandler      = require('./middleware/errorHandler');
const requestLogger     = require('./middleware/requestLogger');
const { validateStorageProvider } = require('./services/storage/storageFactory');
const emailService      = require('./services/emailService');

const app  = express();
const PORT = process.env.PORT || 4000;

// Running behind Vercel's proxy — trust the X-Forwarded-For header so
// express-rate-limit (and req.ip generally) sees the real client IP
// instead of Vercel's internal proxy IP.
app.set('trust proxy', 1);

// Security headers
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// Strict CORS — only listed origins
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
  .split(',').map(o => o.trim());

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  methods        : ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders : ['Content-Type', 'Authorization'],
  credentials    : true,
}));

// `verify` keeps the untouched request bytes on req.rawBody — the Cal.com
// webhook signature is computed over them and can't be checked after parsing.
app.use(express.json({ limit: '200kb', verify: (req, _res, buf) => { req.rawBody = buf; } }));
app.use(express.urlencoded({ extended: true, limit: '200kb' }));
app.use(requestLogger);

// Public routes
app.use('/api/health',      healthRouter);
app.use('/api/contact',     contactRouter);
app.use('/api/webhooks/calcom', calcomWebhookRouter);

app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
app.use(errorHandler);

// Guarantees a promise settles within `ms`, even if the underlying call
// never resolves or rejects on its own (e.g. a stalled outbound request
// to Google or an SMTP server). Without this, a single hung call could
// otherwise block startup logging forever — though since this now runs
// in the background at module load (not per-request), it can no longer
// block actual traffic either way.
function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    ),
  ]);
}

async function runStartupChecks() {
  try {
    await withTimeout(validateStorageProvider(), 10_000, '[Storage] validateStorageProvider()');
  } catch (err) {
    console.error(`[Storage] Startup validation failed: ${err.message}`);
    console.error('Check GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_PRIVATE_KEY / GOOGLE_SHEET_ID in backend/.env,');
    console.error('or set STORAGE_PROVIDER=mock for local development without Google Sheets.');
  }
  try {
    await withTimeout(emailService.verifyEmailConfig(), 10_000, '[Email] verifyEmailConfig()');
  } catch (err) {
    console.error(`[Email] Startup validation failed: ${err.message}`);
  }
}

// Local dev: `node src/server.js` / `nodemon src/server.js` runs this directly,
// so require.main === module → start a normal listening server.
// On Vercel (native Express service support): this module is `require`d
// directly as the service entrypoint and only the exported `app` is used —
// require.main !== module, so app.listen() is skipped, matching how
// Vercel's own Express integration expects the module to behave.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n✅  Vigilant Fintech backend running on port ${PORT}`);
    console.log(`    Env  : ${process.env.NODE_ENV || 'development'}`);
    console.log(`    CORS : ${allowedOrigins.join(', ')}\n`);
  });
}

// Runs once per cold start, in the background, without blocking either
// app.listen() (local dev) or the exported `app` (Vercel) from being
// ready immediately. Results just get logged whenever they finish.
runStartupChecks();

module.exports = app;