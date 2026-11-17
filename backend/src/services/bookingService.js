/**
 * bookingService.js
 * ──────────────────
 * Everything that touches the "Bookings" tab. Meetings are booked in
 * Cal.com's embedded window on the website (or on your cal.com page);
 * Cal.com then calls our webhook and we mirror each event here:
 *
 *   recordBooking()    insert-or-update by Cal.com booking uid, so a
 *                      booking is never written twice
 *   handleWebhook()    created / requested / rescheduled / cancelled /
 *                      rejected → one row per meeting, status kept current
 */

const sheetsDb = require('./sheetsDb');

const TAB = 'Bookings';

/** "Thu, 12 Nov 2026, 3:30 pm" in the attendee's own timezone. */
function formatMeetingTime(startUtc, timeZone) {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone, weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true, timeZoneName: 'short',
    }).format(new Date(startUtc));
  } catch {
    return new Date(startUtc).toISOString();
  }
}

/** Insert a booking row, or update it if this Cal.com uid is already stored. */
async function recordBooking(b) {
  const existing = b.booking_uid ? await sheetsDb.findOne(TAB, 'booking_uid', b.booking_uid) : null;
  if (existing) {
    // Only overwrite with values we actually have (webhooks can be sparse).
    const updates = Object.fromEntries(Object.entries(b).filter(([k, v]) => v !== undefined && v !== '' && k !== 'source'));
    const saved = await sheetsDb.updateById(TAB, existing.id, updates);
    return saved || existing;
  }
  return sheetsDb.insert(TAB, b);
}

// ── Cal.com webhook ──────────────────────────────────────────────────
// The phone number can arrive as attendee.phoneNumber or as any phone-type
// booking-form field (e.g. "attendeePhoneNumber" or a custom "agent phone"
// question) in `responses`; take the first one that has a value.
function findPhone(attendee, responses) {
  if (attendee.phoneNumber) return attendee.phoneNumber;
  for (const [key, field] of Object.entries(responses || {})) {
    const v = field && typeof field === 'object' ? field.value : field;
    if (/phone/i.test(key) && typeof v === 'string' && v.trim()) return v.trim();
  }
  return '';
}

function fromWebhookPayload(p) {
  const attendee = (p.attendees && p.attendees[0]) || {};
  const tz = attendee.timeZone || p.organizer?.timeZone || 'UTC';
  const startUtc = p.startTime ? new Date(p.startTime).toISOString() : '';
  return {
    booking_uid: p.uid,
    name: attendee.name || '',
    email: (attendee.email || '').toLowerCase(),
    phone: findPhone(attendee, p.responses),
    notes: p.additionalNotes || p.responses?.notes?.value || '',
    meeting_time: startUtc ? formatMeetingTime(startUtc, tz) : '',
    start_time: startUtc,
    end_time: p.endTime ? new Date(p.endTime).toISOString() : '',
    timezone: tz,
    meeting_url: p.metadata?.videoCallUrl || p.videoCallData?.url || (typeof p.location === 'string' && p.location.startsWith('http') ? p.location : ''),
    event_title: p.title || p.eventTitle || '',
  };
}

async function handleWebhook({ triggerEvent, payload }) {
  if (!payload) return { handled: false };

  switch (triggerEvent) {
    case 'BOOKING_CREATED': {
      await recordBooking({ ...fromWebhookPayload(payload), status: 'accepted', source: 'calcom' });
      return { handled: true };
    }

    case 'BOOKING_REQUESTED': {
      await recordBooking({ ...fromWebhookPayload(payload), status: 'pending', source: 'calcom' });
      return { handled: true };
    }

    case 'BOOKING_RESCHEDULED': {
      const next = { ...fromWebhookPayload(payload), status: 'rescheduled' };
      const old = payload.rescheduleUid ? await sheetsDb.findOne(TAB, 'booking_uid', payload.rescheduleUid) : null;
      if (old) {
        await sheetsDb.updateById(TAB, old.id, next);   // same row, new uid + time
      } else {
        await recordBooking({ ...next, source: 'calcom' });
      }
      return { handled: true };
    }

    case 'BOOKING_CANCELLED':
    case 'BOOKING_REJECTED': {
      const row = payload.uid ? await sheetsDb.findOne(TAB, 'booking_uid', payload.uid) : null;
      const status = triggerEvent === 'BOOKING_REJECTED' ? 'rejected' : 'cancelled';
      if (row) await sheetsDb.updateById(TAB, row.id, { status });
      else await recordBooking({ ...fromWebhookPayload(payload), status, source: 'calcom' });
      return { handled: true };
    }

    default:
      return { handled: false };   // e.g. MEETING_ENDED — nothing to store
  }
}

module.exports = { recordBooking, handleWebhook, formatMeetingTime };
