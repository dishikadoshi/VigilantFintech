/**
 * emailShared.js
 * ───────────────
 * Brand constants, safe-escaping, link builders and the common layout
 * (logo header + footer) used by BOTH email templates, so the admin and
 * sender emails always look like the same product.
 *
 * Theme = the website theme: navy + teal, with the real Vigilant Fintech
 * logo (sent as an inline CID attachment — see emailService.js).
 */

const path = require('path');

// Use env value unless it's empty or still a placeholder from .env.example
const envOr = (name, fallback) => {
  const v = (process.env[name] || '').trim();
  return v && !/your-domain|example\.com|your-gmail/i.test(v) ? v : fallback;
};

const BRAND = {
  name        : 'Vigilant Fintech',
  email       : envOr('CONTACT_EMAIL', 'info@vigilantfintech.com'),
  phone       : envOr('CONTACT_PHONE', '+917597703903'),
  phoneDisplay: envOr('CONTACT_PHONE_DISPLAY', '+91 7597703903'),
  siteUrl     : envOr('SITE_URL', 'https://www.vigilantfintech.com').replace(/\/+$/, ''),
  tagline     : 'Your Business. Our Support. Shared Success.',
  address     : envOr('BUSINESS_ADDRESS', ''),          // hidden when empty
  timeZone    : envOr('EMAIL_TIMEZONE', 'Asia/Kolkata'),
  logoCid     : 'vigilant-logo',
  logoPath    : path.join(__dirname, '..', 'assets', 'email', 'vigilant-logo.png'),
};
BRAND.siteDisplay = BRAND.siteUrl.replace(/^https?:\/\//, '');

// Same palette as the website (src/styles.css)
const C = {
  navy : '#0b2a4f', navyD: '#061a33', navy2: '#14466f',
  teal : '#25c3ad', tealD: '#17a08d', tealL : '#d8f5ef',
  bg   : '#f2f5f4', body : '#3b4d66', muted : '#6a7b92', line: '#e1e8e6',
};

const FONT = "'Segoe UI',Helvetica,Arial,sans-serif";

/** HTML-escape anything that came from the contact form. */
const esc = (v) => String(v ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const qs = (obj) => Object.entries(obj)
  .filter(([, v]) => v)
  .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
  .join('&');

/** mailto: — opens the default mail app (phones, Outlook, Apple Mail…) */
const mailtoHref = (to, o = {}) => {
  const q = qs({ subject: o.subject, body: o.body });
  return `mailto:${to}${q ? `?${q}` : ''}`;
};

/** Gmail web/app compose — works in any browser where the user is signed in to Gmail */
const gmailHref = (to, o = {}) =>
  `https://mail.google.com/mail/?${qs({ view: 'cm', fs: '1', to, su: o.subject, body: o.body })}`;

/** tel: — keeps a leading + and strips spaces/dashes/brackets */
const telHref = (p) => {
  const s = String(p || '').trim();
  const digits = s.replace(/\D/g, '');
  return digits ? `tel:${s.startsWith('+') ? '+' : ''}${digits}` : '';
};

const linkStyle = `color:${C.navy2};font-weight:600;text-decoration:underline;`;

/** Email address as a clickable mailto: link. */
function emailLinks(addr, o = {}) {
  return `<a href="${esc(mailtoHref(addr, o))}" style="${linkStyle}">${esc(addr)}</a>`;
}

const phoneLink = (display, raw = display) => {
  const href = telHref(raw);
  return href ? `<a href="${esc(href)}" style="${linkStyle}">${esc(display)}</a>` : esc(display);
};

const siteLink = (label = BRAND.siteDisplay, url = BRAND.siteUrl) =>
  `<a href="${esc(url)}" target="_blank" rel="noopener" style="${linkStyle}">${esc(label)}</a>`;

function button(href, label, kind = 'navy') {
  const s = {
    navy : { bg: C.navy,  fg: '#ffffff', bd: C.navy },
    teal : { bg: C.teal,  fg: C.navyD,   bd: C.teal },
    ghost: { bg: '#ffffff', fg: C.navy,  bd: '#c5d3d0' },
  }[kind];
  return `<a href="${esc(href)}" target="_blank" rel="noopener"
     style="display:inline-block;background:${s.bg};color:${s.fg};font-family:${FONT};
            font-size:14px;font-weight:700;padding:13px 24px;border-radius:10px;
            text-decoration:none;border:1.5px solid ${s.bd};margin:0 10px 10px 0;">${esc(label)}</a>`;
}

function formatDate(ts, withWeekday = false) {
  let d = new Date(ts);
  if (Number.isNaN(d.getTime())) d = new Date();
  return d.toLocaleString('en-US', {
    ...(withWeekday ? { weekday: 'long' } : {}),
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
    timeZone: BRAND.timeZone,
  });
}

/** Logo band + teal accent bar shown at the top of every email. */
function logoHeader() {
  return `
      <tr>
        <td align="center" bgcolor="#ffffff" class="px" style="background-color:#ffffff;padding:26px 40px 22px;">
          <a href="${esc(BRAND.siteUrl)}" target="_blank" rel="noopener" style="text-decoration:none;">
            <img src="cid:${BRAND.logoCid}" alt="${esc(BRAND.name)}" width="200"
                 style="display:block;width:200px;max-width:100%;height:auto;border:0;outline:none;
                        font-family:${FONT};font-size:20px;font-weight:800;color:${C.navy};"/>
          </a>
        </td>
      </tr>
      <tr><td height="4" bgcolor="${C.teal}" style="background-color:${C.teal};font-size:0;line-height:0;">&nbsp;</td></tr>`;
}

/**
 * Wraps content rows in the common page + card.
 * `hero`, `body` and `footer` are strings of <tr>…</tr> rows.
 */
function shell({ title, preheader = '', hero = '', body = '', footer = '' }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<meta name="color-scheme" content="light only"/>
<meta name="supported-color-schemes" content="light only"/>
<title>${esc(title)}</title>
<style>
  @media only screen and (max-width:620px){
    .px{padding-left:22px!important;padding-right:22px!important;}
    .h1{font-size:24px!important;}
    .stack{display:block!important;width:100%!important;text-align:left!important;}
    .stack-gap{padding-top:14px!important;}
  }
</style>
</head>
<body style="margin:0;padding:0;background:${C.bg};font-family:${FONT};-webkit-font-smoothing:antialiased;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;font-size:1px;line-height:1px;color:${C.bg};">${esc(preheader)}</div>

<table width="100%" cellpadding="0" cellspacing="0" role="presentation" bgcolor="${C.bg}"
       style="background-color:${C.bg};padding:32px 12px;">
  <tr><td align="center">

    <table width="600" cellpadding="0" cellspacing="0" role="presentation" bgcolor="#ffffff"
           style="max-width:600px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;
                  box-shadow:0 8px 40px rgba(11,42,79,.14);">
      ${logoHeader()}
      ${hero}
      ${body}
      ${footer}
    </table>

  </td></tr>
</table>
</body>
</html>`;
}

module.exports = {
  BRAND, C, FONT, esc, mailtoHref, gmailHref, telHref,
  emailLinks, phoneLink, siteLink, button, formatDate, shell,
};
