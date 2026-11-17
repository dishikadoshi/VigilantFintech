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
