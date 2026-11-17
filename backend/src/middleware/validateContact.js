const validator = require('validator');

// Service labels offered by the website's contact form (see
// Frontend/src/content/services.js → formLabel). The form sends one or
// more of these joined by ", ".
const ALLOWED_REASONS = [
  'Administrative and Executive Assistance',
  'Customer Support',
  'Digital Marketing',
  'Creative and Design Services',
  'Website and E-commerce Management',
  'Business Operations and Management',
  'Bookkeeping and Accounting Support',
  'General enquiry',
];

// Matches "Other: <at least one non-space char>", capped at 200 chars.
const OTHER_REASON_RE = /^Other:\s+\S.{0,199}$/;

function isAllowedReason(reason) {
  if (reason.length > 400) return false;
  return reason.split(',').map(r => r.trim()).filter(Boolean)
    .every(r => ALLOWED_REASONS.includes(r) || OTHER_REASON_RE.test(r))
    && reason.trim().length > 0;
}

function validateContact(req, res, next) {
  const { firstName, lastName, company, email, countryCode, phone, reason, message, smsConsent } = req.body || {};
  const errors = [];

  if (!firstName || typeof firstName !== 'string' || firstName.trim().length < 2)
    errors.push('First name must be at least 2 characters.');
  else if (firstName.trim().length > 50)
    errors.push('First name must be under 50 characters.');

  // Last name is optional — the website's single "Full Name" field may
  // contain just one word.
  if (lastName && typeof lastName === 'string' && lastName.trim().length > 50)
    errors.push('Last name must be under 50 characters.');

  if (!company || typeof company !== 'string' || company.trim().length < 1)
    errors.push('Company name is required.');
  else if (company.trim().length > 150)
    errors.push('Company name must be under 150 characters.');

  if (!email || typeof email !== 'string')
    errors.push('Email is required.');
  else if (!validator.isEmail(email.trim()))
    errors.push('Please provide a valid email address.');

  if (!reason || typeof reason !== 'string' || !isAllowedReason(reason.trim()))
    errors.push(`Services must be chosen from: ${ALLOWED_REASONS.join(', ')} (or "Other: <your reason>").`);

  // Phone is optional but validate format if provided
  if (phone && typeof phone === 'string' && phone.trim().length > 0) {
    if (!/^[\d\s\-\(\)\.]{4,20}$/.test(phone.trim()))
      errors.push('Phone number format is invalid (digits only, no country code).');
  }

  // Country code optional but validate format if provided
  if (countryCode && typeof countryCode === 'string' && countryCode.trim().length > 0) {
    if (!/^\+\d{1,4}$/.test(countryCode.trim()))
      errors.push('Country code format is invalid.');
  }

  if (message && typeof message === 'string' && message.trim().length > 2000)
    errors.push('Message must be under 2000 characters.');

  if (errors.length > 0)
    return res.status(422).json({ success: false, message: 'Validation failed.', errors });

  const clean = field => (typeof field === 'string') ? validator.escape(field.trim()) : '';

  req.body = {
    firstName  : clean(firstName),
    lastName   : clean(lastName),
    company    : clean(company),
    email      : email.trim().toLowerCase(),
    countryCode: (countryCode || '+1').trim(),
    phone      : clean(phone || ''),
    reason     : clean(reason || ''),
    message    : clean(message || ''),
    // Checkbox on the Contact form — "I agree to receive text messages." Anything truthy is treated as opt-in; missing/
    // falsy (including an unchecked box, which still sends `false`) is
    // treated as opt-out. Stored downstream as the "SMS" column (YES/NO).
    smsConsent : smsConsent === true || smsConsent === 'true',
  };

  next();
}

module.exports = { validateContact };