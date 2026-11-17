/**
 * emailService.js
 * ────────────────
 * Sends two emails on every contact submission:
 *   1. Admin notification  — rich HTML to your inbox
 *   2. Sender confirmation — "we received your enquiry" reply to the user
 *
 * Uses Nodemailer with Gmail SMTP, with a single POOLED transporter
 * reused across every send (see createTransporter() below) — this is
 * what keeps individual sends fast: without pooling, every single
 * email pays for a brand new TLS handshake with Gmail, which is the
 * slowest part of the whole request by far.
 *
 * IMPORTANT: if SMTP credentials are missing OR still set to the
 * placeholder values from .env.example (e.g. "your-gmail@gmail.com"),
 * emails are skipped with a LOUD warning — not a silent skip. Forms
 * still succeed either way (the database write already happened
 * independently of email), but you will see exactly why no email
 * was sent in the backend terminal log.
 */

const nodemailer = require('nodemailer');
const { adminEmailTemplate  } = require('../templates/adminEmailTemplate');
const { senderEmailTemplate } = require('../templates/senderEmailTemplate');

// Catches the case where .env.example was copied to .env but SMTP_USER/
// SMTP_PASS were never actually replaced with real values — a plain
// `!process.env.SMTP_USER` check doesn't catch this, since the
// placeholder string is non-empty and looks "set."
const PLACEHOLDER_VALUES = new Set([
  'your-gmail@gmail.com',
  'your-16-char-app-password',
  '',
  undefined,
]);

function smtpCredentialsLookReal() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (PLACEHOLDER_VALUES.has(user) || PLACEHOLDER_VALUES.has(pass)) return false;
  if (!user || !user.includes('@')) return false;
  if (!pass || pass.replace(/\s/g, '').length < 10) return false; // Gmail app passwords are 16 chars
  return true;
}

function warnCredentialsMissing(context) {
  console.warn(
    `\n⚠️  [Email] Skipping ${context} — SMTP credentials are missing or still ` +
    `set to placeholder values from .env.example.\n` +
    `    Open backend/.env and confirm SMTP_USER is a real Gmail address ` +
    `and SMTP_PASS is a real 16-character Gmail App Password (not your ` +
    `normal Gmail password — see https://myaccount.google.com/apppasswords).\n` +
    `    The form submission itself still succeeded; only the email was skipped.\n`
  );
}

// ── Pooled transporter, created once and reused for every send ──────
// Without `pool: true`, nodemailer opens a brand new TLS connection to
// Gmail for every single sendMail() call — that handshake is typically
// the single slowest part of a form submission. Pooling keeps up to a
// few connections open and reuses them, so the 2nd/3rd/... email in a
// short window is dramatically faster than the 1st.
let _transporter = null;
function createTransporter() {
  if (_transporter) return _transporter;

  // Gmail App Passwords are displayed as "xxxx xxxx xxxx xxxx" but must be
  // used WITHOUT spaces. Strip them automatically so copy-paste always works.
  const smtpPass = (process.env.SMTP_PASS || '').replace(/\s/g, '');
  _transporter = nodemailer.createTransport({
    host  : process.env.SMTP_HOST   || 'smtp.gmail.com',
    port  : parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth  : {
      user: process.env.SMTP_USER,
      pass: smtpPass,
    },
    pool: true,
    maxConnections: 3,
    maxMessages: 100,
    connectionTimeout: 10_000,
    greetingTimeout  : 10_000,
    socketTimeout    : 30_000,
  });
  return _transporter;
}

/**
 * Verifies the SMTP connection actually authenticates, separate from
 * just checking the env vars look plausible. Called once at server
 * startup (see server.js) so a bad app password is caught immediately
 * in the terminal instead of only showing up the first time someone
 * submits the contact form, possibly hours or days later.
 */
async function verifyEmailConfig() {
  if (!smtpCredentialsLookReal()) {
    console.warn(
      '\n⚠️  [Email] SMTP not configured (or still using placeholder values). ' +
      'Enquiry notification and confirmation emails will be ' +
      'skipped until backend/.env has real SMTP_USER/SMTP_PASS values.\n'
    );
    return false;
  }
  try {
    await createTransporter().verify();
    console.log('[Email] SMTP connection verified ✓ — emails will be sent.');
    return true;
  } catch (err) {
    console.error(
      `\n❌  [Email] SMTP credentials are present but authentication FAILED: ${err.message}\n` +
      `    Common causes:\n` +
      `    • Using your normal Gmail password instead of a 16-character App Password\n` +
      `      (Google Account → Security → 2-Step Verification must be ON first,\n` +
      `       then App Passwords → generate one for "Mail")\n` +
      `    • Extra spaces or quotes accidentally left in SMTP_PASS in .env\n` +
      `    • SMTP_USER doesn't match the account the App Password was generated for\n` +
      `    Enquiry form submissions will still succeed and save to the ` +
      `database — only the email notification will silently fail until this is fixed.\n`
    );
    return false;
  }
}

const FROM = () =>
  `"${process.env.EMAIL_FROM_NAME || 'Vigilant Fintech Team'}" <${process.env.EMAIL_FROM_ADDRESS || process.env.SMTP_USER}>`;

// Same address, but with the submitter's name in the display name —
// so admin notifications show "who" at a glance in the inbox list,
// without the From ADDRESS itself ever being anything other than
// the configured From address (changing the address would fail SPF/DKIM/
// DMARC alignment and land back in spam — see chat history).
const FROM_NAMED = (name) =>
  `"${name || 'Website Visitor'} via Vigilant Fintech" <${process.env.EMAIL_FROM_ADDRESS || process.env.SMTP_USER}>`;

async function sendAdminNotification(record) {
  if (!smtpCredentialsLookReal()) { warnCredentialsMissing('admin notification email'); return; }
  const { subject, html, text } = adminEmailTemplate(record);
  const displayName = `${record.firstName || ''} ${record.lastName || ''}`.trim() || record.email;
  const info = await createTransporter().sendMail({
    from   : FROM_NAMED(displayName),
    to     : process.env.ADMIN_EMAIL || process.env.SMTP_USER,
    subject,
    html,
    text,
    replyTo: record.email,
  });
  console.log(`[Email] Admin notification sent → ${info.messageId}`);
  return info;
}

async function sendSenderConfirmation(record) {
  if (!smtpCredentialsLookReal()) { warnCredentialsMissing('sender confirmation email'); return; }
  const { subject, html, text } = senderEmailTemplate(record);
  // NOTE: contact-form records carry firstName/lastName, not `name` —
  // build the display name explicitly so the "To" header is correct.
  const displayName = `${record.firstName || ''} ${record.lastName || ''}`.trim() || record.email;
  const info = await createTransporter().sendMail({
    from   : FROM(),
    to     : `"${displayName}" <${record.email}>`,
    subject,
    html,
    text,
    replyTo: process.env.EMAIL_FROM_ADDRESS || process.env.SMTP_USER,
  });
  console.log(`[Email] Sender confirmation sent → ${info.messageId}`);
  return info;
}

module.exports = {
  sendAdminNotification,
  sendSenderConfirmation,
  verifyEmailConfig,
};
