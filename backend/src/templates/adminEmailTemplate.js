/**
 * adminEmailTemplate.js
 * ──────────────────────
 * HTML email sent to the Vigilant Fintech inbox whenever a new contact
 * form is submitted. Uses the real logo + the website's navy/teal theme.
 *
 * Every value that came from the form is HTML-escaped (esc) so a visitor
 * can't inject links or markup into your inbox.
 */

const {
  BRAND, C, FONT, esc, mailtoHref,
  emailLinks, phoneLink, siteLink, button, formatDate, shell,
} = require('./emailShared');

function adminEmailTemplate(record) {
  const firstName = (record.firstName || '').trim();
  const fullName  = `${firstName} ${record.lastName || ''}`.trim() || record.email;
  const company   = (record.company || '').trim();
  const reason    = (record.reason || '').trim() || 'General enquiry';
  const when      = formatDate(record.timestamp, true);

  const subject = `🔔 New Enquiry — ${fullName}${company ? ` from ${company}` : ''} [${record.id}]`;

  // Pre-filled reply (same content for the mailto + Gmail buttons)
  const reply = {
    subject: `Re: Your Vigilant Fintech Enquiry [${record.id}]`,
    body   : `Hi ${firstName || 'there'},\n\nThank you for contacting Vigilant Fintech.\n\n`,
  };

  // One-click Google Calendar event with the lead already added as a guest
  const calendarHref = 'https://calendar.google.com/calendar/render?' + [
    ['action', 'TEMPLATE'],
    ['text',   `Call with ${fullName}${company ? ` (${company})` : ''}`],
    ['details', `Enquiry ${record.id}\nService: ${reason}\nPhone: ${record.phone || 'not provided'}`],
    ['add',    record.email],
  ].map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');

  const hero = `
      <tr>
        <td bgcolor="${C.navy}" class="px"
            style="background-color:${C.navy};background-image:linear-gradient(135deg,${C.navyD} 0%,${C.navy} 60%,${C.navy2} 100%);
                   padding:34px 40px 32px;">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
            <tr>
              <td class="stack" style="vertical-align:top;">
                <span style="display:inline-block;color:${C.teal};font-family:${FONT};font-size:11px;font-weight:700;
                             letter-spacing:.14em;text-transform:uppercase;margin-bottom:14px;">
                  New website enquiry
                </span>
                <h1 class="h1" style="margin:0 0 8px;color:#ffffff;font-family:${FONT};font-size:28px;font-weight:700;
                                      letter-spacing:-.02em;line-height:1.2;">
                  ${esc(fullName)}
                </h1>
                <p style="margin:0;color:rgba(255,255,255,.65);font-family:${FONT};font-size:14px;line-height:1.6;">
                  Submitted ${esc(when)}
                </p>
              </td>
              <td class="stack stack-gap" align="right" style="vertical-align:top;">
                <table cellpadding="0" cellspacing="0" role="presentation"
                       style="background-color:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18);border-radius:10px;">
                  <tr><td style="padding:10px 16px;text-align:center;">
                    <span style="display:block;color:rgba(255,255,255,.55);font-family:${FONT};font-size:10px;font-weight:700;
                                 letter-spacing:.12em;text-transform:uppercase;margin-bottom:4px;">Ref ID</span>
                    <span style="color:${C.teal};font-size:14px;font-weight:700;font-family:'Courier New',monospace;white-space:nowrap;">${esc(record.id)}</span>
                  </td></tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>`;

  const body = `
      <!-- Service requested -->
      <tr>
        <td class="px" style="padding:22px 40px 0;">
          <span style="font-family:${FONT};color:${C.muted};font-size:11px;font-weight:700;letter-spacing:.12em;
                       text-transform:uppercase;">Service requested</span><br/>
          <span style="display:inline-block;margin-top:8px;background-color:${C.tealL};color:#0b6b5e;border:1px solid ${C.teal};
                       border-radius:100px;padding:6px 16px;font-family:${FONT};font-size:13px;font-weight:700;">
            ${esc(reason)}
          </span>
        </td>
      </tr>

      <!-- Contact details -->
      <tr>
        <td class="px" style="padding:30px 40px 0;">
          <h2 style="margin:0 0 18px;color:${C.navyD};font-family:${FONT};font-size:13px;font-weight:700;
                     letter-spacing:.12em;text-transform:uppercase;">Contact Details</h2>
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
            ${detailRow('Full name', esc(fullName))}
            ${detailRow('Company',   esc(company) || notProvided())}
            ${detailRow('Email',     emailLinks(record.email, reply))}
            ${detailRow('Phone',     record.phone ? phoneLink(record.phone) : notProvided())}
            ${detailRow('SMS opt-in', record.smsConsent ? `<span style="color:${C.tealD};font-weight:700;">Yes</span>` : 'No')}
          </table>
        </td>
      </tr>

      <!-- Message -->
      <tr>
        <td class="px" style="padding:14px 40px 0;">
          <h2 style="margin:0 0 12px;color:${C.navyD};font-family:${FONT};font-size:13px;font-weight:700;
                     letter-spacing:.12em;text-transform:uppercase;">Message</h2>
          <div style="background-color:${C.bg};border-left:4px solid ${C.teal};border-radius:0 10px 10px 0;padding:18px 20px;">
            <p style="margin:0;color:${C.body};font-family:${FONT};font-size:15px;line-height:1.75;">
              ${record.message
                ? esc(record.message).replace(/\r?\n/g, '<br/>')
                : `<em style="color:${C.muted};">No message provided.</em>`}
            </p>
          </div>
        </td>
      </tr>

      <!-- Actions -->
      <tr>
        <td class="px" style="padding:30px 40px 20px;">
          ${button(mailtoHref(record.email, reply), `Reply to ${firstName || 'sender'} →`, 'navy')}
          ${button(calendarHref,                    'Schedule Call', 'ghost')}
        </td>
      </tr>`;

  const footer = `
      <tr>
        <td class="px" bgcolor="${C.bg}" style="background-color:${C.bg};padding:22px 40px;border-top:1px solid ${C.line};">
          <p style="margin:0;color:${C.muted};font-family:${FONT};font-size:12px;line-height:1.7;">
            Automated notification from the ${esc(BRAND.name)} website contact form.<br/>
            Submitted via ${siteLink()}${record.source ? ` · Source: <strong style="color:${C.body};">${esc(record.source)}</strong>` : ''}<br/>
            ${esc(BRAND.name)} · <a href="${esc(mailtoHref(BRAND.email))}" style="color:${C.navy2};text-decoration:underline;">${esc(BRAND.email)}</a>
            · ${phoneLink(BRAND.phoneDisplay, BRAND.phone)}
          </p>
        </td>
      </tr>`;

  const html = shell({
    title: `New enquiry — ${fullName}`,
    preheader: `${fullName}${company ? ` (${company})` : ''} · ${reason}`,
    hero, body, footer,
  });

  const text = `
NEW ENQUIRY [${record.id}]
================================
Submitted : ${formatDate(record.timestamp)}

Name      : ${fullName}
Company   : ${company || 'Not provided'}
Email     : ${record.email}
Phone     : ${record.phone || 'Not provided'}
SMS Opt-in: ${record.smsConsent ? 'Yes' : 'No'}
Service   : ${reason}

Message:
${record.message || 'No message provided.'}

Reply            : ${mailtoHref(record.email, reply)}
Schedule a call  : ${calendarHref}

Website: ${BRAND.siteUrl}
`.trim();

  return { subject, html, text };
}

const notProvided = () => `<span style="color:#9aa8bb;">Not provided</span>`;

function detailRow(label, value) {
  return `
            <tr>
              <td style="padding:0 0 16px;width:104px;vertical-align:top;">
                <span style="color:${C.muted};font-family:${FONT};font-size:12px;font-weight:700;letter-spacing:.08em;
                             text-transform:uppercase;line-height:22px;">${label}</span>
              </td>
              <td style="padding:0 0 16px;vertical-align:top;font-family:${FONT};font-size:15px;font-weight:500;
                         color:${C.navyD};line-height:22px;">${value}</td>
            </tr>`;
}

module.exports = { adminEmailTemplate };
