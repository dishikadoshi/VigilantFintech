/**
 * senderEmailTemplate.js
 * ───────────────────────
 * Confirmation email sent to the person who submitted the form.
 * Real logo + the website's navy/teal theme. Wording matches the site
 * (remote business support), and everything from the form is escaped.
 */

const {
  BRAND, C, FONT, esc, mailtoHref,
  emailLinks, phoneLink, siteLink, button, formatDate, shell,
} = require('./emailShared');

function senderEmailTemplate(record) {
  const firstName = (record.firstName || '').trim() || 'there';
  const company   = (record.company || '').trim();
  const reason    = (record.reason || '').trim() || 'General enquiry';
  const subject   = `We've received your enquiry, ${firstName} — ${BRAND.name}`;

  const hero = `
      <tr>
        <td align="center" bgcolor="${C.navy}" class="px"
            style="background-color:${C.navy};background-image:linear-gradient(135deg,${C.navyD} 0%,${C.navy} 60%,${C.navy2} 100%);
                   padding:38px 40px 36px;text-align:center;">
          <!-- check mark (table-based so it renders in Outlook too) -->
          <table cellpadding="0" cellspacing="0" role="presentation" align="center" style="margin:0 auto 20px;">
            <tr>
              <td width="64" height="64" align="center" valign="middle" bgcolor="#123c63"
                  style="width:64px;height:64px;border-radius:50%;background-color:#123c63;border:2px solid ${C.teal};
                         color:${C.teal};font-family:${FONT};font-size:30px;font-weight:700;line-height:64px;text-align:center;">
                &#10003;
              </td>
            </tr>
          </table>
          <h1 class="h1" style="margin:0 0 10px;color:#ffffff;font-family:${FONT};font-size:30px;font-weight:700;
                                letter-spacing:-.025em;line-height:1.2;">Enquiry Received!</h1>
          <p style="margin:0;color:rgba(255,255,255,.72);font-family:${FONT};font-size:15px;line-height:1.6;">
            We'll be in touch within one business day.
          </p>
        </td>
      </tr>`;

  const body = `
      <!-- Greeting -->
      <tr>
        <td class="px" style="padding:34px 40px 0;">
          <p style="margin:0 0 16px;color:${C.navyD};font-family:${FONT};font-size:18px;font-weight:600;line-height:1.6;">
            Hi ${esc(firstName)},
          </p>
          <p style="margin:0 0 16px;color:${C.body};font-family:${FONT};font-size:15px;line-height:1.8;">
            Thank you for reaching out to <strong style="color:${C.navyD};">${esc(BRAND.name)}</strong>.
            We've received your enquiry and our team will review it carefully.
          </p>
          <p style="margin:0;color:${C.body};font-family:${FONT};font-size:15px;line-height:1.8;">
            A member of our team will contact you within <strong style="color:${C.navyD};">one business day</strong>
            to discuss your requirements and how we can support
            ${company ? `<strong style="color:${C.navyD};">${esc(company)}</strong>` : 'your business'}.
          </p>
        </td>
      </tr>

      <!-- Summary -->
      <tr>
        <td class="px" style="padding:28px 40px 0;">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" bgcolor="${C.bg}"
                 style="background-color:${C.bg};border:1px solid ${C.line};border-radius:12px;">
            <tr><td style="padding:22px 24px 12px;">
              <h3 style="margin:0 0 16px;color:${C.navyD};font-family:${FONT};font-size:12px;font-weight:700;
                         letter-spacing:.14em;text-transform:uppercase;">Your Submission Summary</h3>
              ${summaryRow('Ref ID', esc(record.id), true)}
              ${company ? summaryRow('Company', esc(company)) : ''}
              ${summaryRow('Enquiry', esc(reason))}
              ${summaryRow('Submitted', esc(formatDate(record.timestamp)))}
            </td></tr>
          </table>
        </td>
      </tr>

      <!-- What happens next -->
      <tr>
        <td class="px" style="padding:30px 40px 0;">
          <h2 style="margin:0 0 20px;color:${C.navyD};font-family:${FONT};font-size:13px;font-weight:700;
                     letter-spacing:.12em;text-transform:uppercase;">What Happens Next</h2>
          ${nextStep('1', C.navy,  'Review',
            'Our team reviews your enquiry and the requirements you shared.')}
          ${nextStep('2', C.tealD, 'Free Consultation',
            'We get in touch to schedule your free, no-obligation consultation.')}
          ${nextStep('3', C.navy2, 'Your Proposal',
            'We recommend the right support for your workload and share a customised proposal.')}
        </td>
      </tr>

      <!-- CTA -->
      <tr>
        <td class="px" align="center" style="padding:26px 40px 34px;text-align:center;">
          <p style="margin:0 0 20px;color:${C.muted};font-family:${FONT};font-size:13px;line-height:1.7;">
            While you wait, take a look around our website to see how we support businesses like yours.
          </p>
          ${button(BRAND.siteUrl, 'Explore Website →', 'teal')}
        </td>
      </tr>

      <!-- Divider -->
      <tr><td class="px" style="padding:0 40px;"><div style="height:1px;line-height:1px;font-size:0;background-color:${C.line};">&nbsp;</div></td></tr>

      <!-- Contact -->
      <tr>
        <td class="px" style="padding:24px 40px 28px;">
          <p style="margin:0 0 14px;color:${C.body};font-family:${FONT};font-size:14px;font-weight:600;line-height:1.6;">
            Have urgent questions? Contact us directly:
          </p>
          <table cellpadding="0" cellspacing="0" role="presentation">
            ${contactRow('Email',   emailLinks(BRAND.email, { subject: `Question about my enquiry [${record.id}]` }))}
            ${contactRow('Phone',   phoneLink(BRAND.phoneDisplay, BRAND.phone))}
            ${contactRow('Website', siteLink())}
          </table>
        </td>
      </tr>`;

  const footer = `
      <tr>
        <td class="px" align="center" bgcolor="${C.navyD}" style="background-color:${C.navyD};padding:24px 40px;text-align:center;">
          <p style="margin:0 0 6px;color:${C.teal};font-family:${FONT};font-size:12px;font-style:italic;line-height:1.6;">
            ${esc(BRAND.tagline)}
          </p>
          <p style="margin:0;color:rgba(255,255,255,.55);font-family:${FONT};font-size:12px;line-height:1.7;">
            © ${new Date().getFullYear()} ${esc(BRAND.name)}. All rights reserved.<br/>
            <a href="${esc(BRAND.siteUrl)}" target="_blank" rel="noopener" style="color:rgba(255,255,255,.8);text-decoration:underline;">${esc(BRAND.siteDisplay)}</a>
            · <a href="${esc(mailtoHref(BRAND.email))}" style="color:rgba(255,255,255,.8);text-decoration:underline;">${esc(BRAND.email)}</a>
            ${BRAND.address ? `<br/>${esc(BRAND.address)}` : ''}
          </p>
        </td>
      </tr>`;

  const html = shell({
    title: `Your enquiry — ${BRAND.name}`,
    preheader: `We've received your enquiry (ref ${record.id}) and will be in touch within one business day.`,
    hero, body, footer,
  });

  const text = `
Hi ${firstName},

Thank you for reaching out to ${BRAND.name}!

We've received your enquiry and a member of our team will be in touch
within one business day to discuss your requirements.

SUBMISSION SUMMARY
──────────────────
Ref ID    : ${record.id}
${company ? `Company   : ${company}\n` : ''}Enquiry   : ${reason}
Submitted : ${formatDate(record.timestamp)}

WHAT HAPPENS NEXT
─────────────────
1. Our team reviews your enquiry.
2. We get in touch to schedule your free consultation.
3. We recommend the right support and share a customised proposal.

Explore our website: ${BRAND.siteUrl}

Questions? Contact us:
  Email   : ${BRAND.email}
  Phone   : ${BRAND.phoneDisplay}
  Website : ${BRAND.siteUrl}

Best regards,
The ${BRAND.name} Team
${BRAND.tagline}
`.trim();

  return { subject, html, text };
}

function summaryRow(label, value, mono = false) {
  return `
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:10px;">
                <tr>
                  <td style="width:100px;vertical-align:top;">
                    <span style="color:${C.muted};font-family:${FONT};font-size:12px;font-weight:700;
                                 letter-spacing:.08em;text-transform:uppercase;">${label}</span>
                  </td>
                  <td style="vertical-align:top;">
                    <span style="font-size:${mono ? '13px' : '14px'};font-weight:700;
                                 font-family:${mono ? "'Courier New',monospace" : FONT};
                                 color:${mono ? C.tealD : C.navyD};">${value}</span>
                  </td>
                </tr>
              </table>`;
}

function nextStep(num, color, title, desc) {
  return `
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:16px;">
            <tr>
              <td width="40" style="width:40px;vertical-align:top;padding-top:2px;">
                <table cellpadding="0" cellspacing="0" role="presentation"><tr>
                  <td width="28" height="28" align="center" valign="middle" bgcolor="${color}"
                      style="width:28px;height:28px;background-color:${color};border-radius:50%;color:#ffffff;
                             font-family:${FONT};font-size:13px;font-weight:700;line-height:28px;text-align:center;">${num}</td>
                </tr></table>
              </td>
              <td style="padding-left:6px;vertical-align:top;">
                <p style="margin:0 0 4px;color:${C.navyD};font-family:${FONT};font-size:14px;font-weight:700;">${title}</p>
                <p style="margin:0;color:${C.body};font-family:${FONT};font-size:13px;line-height:1.65;">${desc}</p>
              </td>
            </tr>
          </table>`;
}

function contactRow(label, value) {
  return `
            <tr>
              <td style="padding:0 18px 12px 0;vertical-align:top;">
                <span style="color:${C.muted};font-family:${FONT};font-size:12px;font-weight:700;
                             letter-spacing:.08em;text-transform:uppercase;line-height:22px;">${label}</span>
              </td>
              <td style="padding:0 0 12px;vertical-align:top;font-family:${FONT};font-size:14px;line-height:22px;">${value}</td>
            </tr>`;
}

module.exports = { senderEmailTemplate };
