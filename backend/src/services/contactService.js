const { getStorageProvider } = require('./storage/storageFactory');
const emailService           = require('./emailService');
const { runInBackground }    = require('../utils/backgroundTask');

async function submitContact(formData) {
  const timestamp = new Date().toLocaleString("en-US", { timeZone: "America/New_York", year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }) + " EST";

  const record = {
    timestamp,
    firstName  : (formData.firstName   || '').trim(),
    lastName   : (formData.lastName    || '').trim(),
    company    : (formData.company     || '').trim(),
    email      : (formData.email       || '').trim().toLowerCase(),
    countryCode: (formData.countryCode || '+1').trim(),
    phone      : (formData.phone       || '').trim(),
    reason     : (formData.reason      || '').trim(),
    message    : (formData.message     || '').trim(),
    smsConsent : !!formData.smsConsent,
    status     : 'new',
    source     : 'website_form',
  };

  // The sheet write is the only thing the visitor actually needs to
  // wait on — it's fast (a single API call) and it's what determines
  // whether their enquiry was actually captured. Also generates the
  // real id (e.g. "EQ-SITE-004"), used below for both emails.
  const storage = getStorageProvider();
  const { id } = await storage.save(record);
  const emailRecord = { ...record, id };

  // Emails are sent in the background — the visitor doesn't need to
  // wait on Gmail's SMTP handshake before seeing "message sent."
  // runInBackground() still guarantees delivery on Vercel via
  // waitUntil() (see utils/backgroundTask.js), it just doesn't block
  // the response to get there.
  runInBackground(
    Promise.allSettled([
      emailService.sendAdminNotification(emailRecord),
      emailService.sendSenderConfirmation(emailRecord),
    ]).then(([adminResult, senderResult]) => {
      if (adminResult.status === 'rejected') {
        console.error('[Email] Admin notification failed:', adminResult.reason?.message);
      }
      if (senderResult.status === 'rejected') {
        console.error('[Email] Sender confirmation failed:', senderResult.reason?.message);
      }
    })
  );

  return { id, timestamp };
}

module.exports = { submitContact };