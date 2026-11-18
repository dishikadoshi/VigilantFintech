/**
 * site.js — the one place to edit company details.
 *
 * Everything here can also be set with environment variables
 * (see .env.example) so no code change is needed per deployment.
 * Contact options that are left empty are simply not shown — no
 * broken links, no placeholder numbers.
 */
const env = process.env;

export const SITE = {
  name: env.REACT_APP_COMPANY_NAME || 'Vigilant Fintech',
  tagline: 'Your Business. Our Support. Shared Success.',
  url: (env.REACT_APP_SITE_URL || 'https://www.vigilantfintech.com').replace(/\/$/, ''),
  email: env.REACT_APP_CONTACT_EMAIL || 'info@vigilantfintech.com',
  phone: (env.REACT_APP_CONTACT_PHONE || '7597703903').replace(/\D/g, ''),
  phoneDisplay: '+91 7597703903',
  whatsapp: (env.REACT_APP_WHATSAPP_NUMBER || '917597703903').replace(/\D/g, ''), // +91 7597703903
  linkedin: env.REACT_APP_LINKEDIN_URL || '',
  address: env.REACT_APP_BUSINESS_ADDRESS || '',
  // Optional external booking page (Calendly, Cal.com, etc.). When empty,
  // "Book a Free Consultation" opens the contact form instead.
  booking: env.REACT_APP_BOOKING_URL || '',
};

// Cal.com booking popup (the floating calendar icon). CAL_LINK is
// "username/event-slug" — the part of your booking URL after cal.com/.
// Leave it empty and the calendar icon is simply not shown.
export const CAL = {
  link: (env.REACT_APP_CAL_LINK || '').replace(/^https?:\/\/[^/]+\//, '').replace(/^\/|\/$/g, ''),
  // Use https://app.cal.eu if your Cal.com account is on the EU region.
  origin: (env.REACT_APP_CAL_ORIGIN || 'https://app.cal.com').replace(/\/$/, ''),
  theme: env.REACT_APP_CAL_THEME === 'light' ? 'light' : 'dark',
  brandColor: env.REACT_APP_CAL_BRAND_COLOR || '',
};

export const API_BASE = (env.REACT_APP_API_URL || 'http://localhost:4000').replace(/\/api\/?$/, '');

// ── Contact link helpers ─────────────────────────────────────────
// Phone in international format, e.g. +917597703903
export const phoneE164 = () => (SITE.phone ? `+${SITE.phone.length === 10 ? '91' : ''}${SITE.phone}` : '');
export const telHref = () => (SITE.phone ? `tel:${phoneE164()}` : '');

const enc = encodeURIComponent;
const qs = (o) => Object.entries(o).filter(([, v]) => v).map(([k, v]) => `${k}=${enc(v)}`).join('&');

// mailto: opens the visitor's default mail app (phones, Outlook, Apple Mail…)
export const mailtoHref = ({ subject, body } = {}) =>
  SITE.email ? `mailto:${SITE.email}${subject || body ? `?${qs({ subject, body })}` : ''}` : '';

// Gmail compose — opens in the browser for anyone signed in to Gmail
export const gmailHref = ({ subject, body } = {}) =>
  SITE.email ? `https://mail.google.com/mail/?${qs({ view: 'cm', fs: '1', to: SITE.email, su: subject, body })}` : '';

export const isMobileDevice = () => {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return /Android|iPhone|iPad|iPod|Mobile|Windows Phone/i.test(ua) ||
    (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1); // iPadOS reports as a Mac
};

export const whatsappHref = (text = 'Hello! I would like to discuss my business support requirements.') =>
  SITE.whatsapp ? `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}` : '';

// Every item scrolls to a block on the landing page (see sections/*).
export const NAV = [
  { label: 'Home', to: '#home' },
  { label: 'About', to: '#about' },
  { label: 'Services', to: '#services' },
  { label: 'Industries', to: '#industries' },
  { label: 'Pricing', to: '#pricing' },
  { label: 'Contact', to: '#contact' },
];

export const CONSULT_TO = '#contact';
