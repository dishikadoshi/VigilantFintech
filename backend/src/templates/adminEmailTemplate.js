/**
 * adminEmailTemplate.js
 * ──────────────────────
 * Rich HTML email sent to the Vigilant Fintech admin inbox
 * whenever a new contact form is submitted.
 * Designed to match the Vigilant Fintech brand (navy + gold).
 */

function adminEmailTemplate(record) {
  const subject = `🔔 New Audit Enquiry — ${record.firstName} ${record.lastName} from ${record.company} [${record.id}]`;

  const reasonBadgeColor = {
    'Free cost audit'       : '#2045a0',
    'Vendor renegotiation'  : '#c4870a',
    'SaaS optimization'     : '#122158',
    'Energy & utilities'    : '#16a34a',
    'General enquiry'       : '#6b7280',
  }[record.reason] || '#2045a0';

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>New Enquiry — ${record.firstName} ${record.lastName}</title>
</head>
<body style="margin:0;padding:0;background:#f0f2f7;font-family:'Segoe UI',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">

<!-- Wrapper -->
<table width="100%" cellpadding="0" cellspacing="0" role="presentation"
       style="background:#f0f2f7;padding:40px 16px;">
  <tr><td align="center">

    <!-- Card -->
    <table width="600" cellpadding="0" cellspacing="0" role="presentation"
           style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;
                  overflow:hidden;box-shadow:0 8px 40px rgba(13,27,62,.12);">

      <!-- Header -->
      <tr>
        <td style="background:linear-gradient(135deg,#050e24 0%,#0d1b3e 60%,#122158 100%);
                   padding:36px 40px;">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
            <tr>
              <td>
                <div style="display:inline-block;background:rgba(255,255,255,.1);
                            border-radius:10px;padding:8px 14px;margin-bottom:20px;">
                  <span style="color:#e8a020;font-size:11px;font-weight:700;
                               letter-spacing:.14em;text-transform:uppercase;">
                    Vigilant Fintech · Cost Intelligence
                  </span>
                </div>
                <h1 style="margin:0 0 8px;color:#ffffff;font-size:26px;
                           font-weight:700;letter-spacing:-.02em;line-height:1.2;">
                  New Audit Enquiry
                </h1>
                <p style="margin:0;color:rgba(255,255,255,.55);font-size:14px;
                          font-weight:300;line-height:1.6;">
                  Submitted ${new Date(record.timestamp).toLocaleString('en-US', {
                    weekday:'long', year:'numeric', month:'long', day:'numeric',
                    hour:'2-digit', minute:'2-digit', timeZoneName:'short'
                  })}
                </p>
              </td>
              <td align="right" style="vertical-align:top;padding-top:4px;">
                <div style="background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);
                            border-radius:8px;padding:10px 16px;text-align:center;">
                  <span style="color:rgba(255,255,255,.4);font-size:10px;font-weight:600;
                               letter-spacing:.1em;text-transform:uppercase;display:block;
                               margin-bottom:4px;">Ref ID</span>
                  <span style="color:#e8a020;font-size:13px;font-weight:700;
                               font-family:'Courier New',monospace;">${record.id}</span>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Reason badge -->
      <tr>
        <td style="padding:0 40px;">
          <div style="margin-top:-1px;padding:14px 0;border-bottom:1px solid #e2e6ef;">
            <span style="background:${reasonBadgeColor};color:#fff;
                         border-radius:100px;padding:5px 14px;font-size:12px;
                         font-weight:700;letter-spacing:.06em;">
              ${record.reason || 'Not specified'}
            </span>
          </div>
        </td>
      </tr>

      <!-- Contact details -->
      <tr>
        <td style="padding:32px 40px 0;">
          <h2 style="margin:0 0 20px;color:#0d1b3e;font-size:14px;font-weight:700;
                     letter-spacing:.12em;text-transform:uppercase;">
            Contact Details
          </h2>
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
            ${detailRow('👤', 'Full Name',  `${record.firstName} ${record.lastName}`)}
            ${detailRow('🏢', 'Company',    record.company)}
            ${detailRow('✉️', 'Email',      `<a href="mailto:${record.email}" style="color:#2045a0;text-decoration:none;font-weight:600;">${record.email}</a>`)}
            ${detailRow('📞', 'Phone',      record.phone || '<span style="color:#b0b9d0;">Not provided</span>')}
            ${detailRow('💬', 'SMS Opt-in', record.smsConsent ? '<span style="color:#16a34a;">Yes</span>' : 'No')}
          </table>
        </td>
      </tr>

      <!-- Message -->
      <tr>
        <td style="padding:28px 40px 0;">
          <h2 style="margin:0 0 12px;color:#0d1b3e;font-size:14px;font-weight:700;
                     letter-spacing:.12em;text-transform:uppercase;">
            Message
          </h2>
          <div style="background:#f0f2f7;border-left:3px solid #c4870a;border-radius:0 8px 8px 0;
                      padding:18px 20px;">
            <p style="margin:0;color:#374269;font-size:15px;line-height:1.75;font-weight:300;">
              ${record.message
                ? record.message.replace(/\n/g, '<br/>')
                : '<em style="color:#b0b9d0;">No message provided.</em>'}
            </p>
          </div>
        </td>
      </tr>

      <!-- Action buttons -->
      <tr>
        <td style="padding:32px 40px;">
          <table cellpadding="0" cellspacing="0" role="presentation">
            <tr>
              <td style="padding-right:12px;">
                <a href="mailto:${record.email}?subject=Re: Your Vigilant Fintech Audit Enquiry [${record.id}]"
                   style="display:inline-block;background:#0d1b3e;color:#ffffff;
                          font-size:14px;font-weight:600;padding:12px 24px;
                          border-radius:10px;text-decoration:none;letter-spacing:-.01em;">
                  Reply to ${record.firstName} →
                </a>
              </td>
              <td>
                <a href="https://calendar.google.com"
                   style="display:inline-block;background:transparent;color:#0d1b3e;
                          font-size:14px;font-weight:600;padding:11px 24px;
                          border-radius:10px;text-decoration:none;letter-spacing:-.01em;
                          border:1.5px solid #c8d0e4;">
                  Schedule Call
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background:#f0f2f7;padding:24px 40px;border-top:1px solid #e2e6ef;">
          <p style="margin:0;color:#7a86a8;font-size:12px;line-height:1.6;font-weight:300;">
            This is an automated notification from the Vigilant Fintech website contact form.<br/>
            Submitted via <strong style="color:#374269;">vigilantfintech.com</strong> · 
            Source: <strong style="color:#374269;">${record.source}</strong>
          </p>
        </td>
      </tr>

    </table>
    <!-- /Card -->

  </td></tr>
</table>

</body>
</html>`;

  const text = `
NEW AUDIT ENQUIRY [${record.id}]
================================
Submitted: ${record.timestamp}

Name    : ${record.firstName} ${record.lastName}
Company : ${record.company}
Email   : ${record.email}
Phone   : ${record.phone || 'Not provided'}
SMS Opt-in: ${record.smsConsent ? 'Yes' : 'No'}
Reason  : ${record.reason}

Message:
${record.message || 'No message provided.'}
`.trim();

  return { subject, html, text };
}

function detailRow(icon, label, value) {
  return `
    <tr>
      <td style="padding:0 0 14px;width:32px;vertical-align:top;">
        <span style="font-size:16px;">${icon}</span>
      </td>
      <td style="padding:0 0 14px;width:100px;vertical-align:top;">
        <span style="color:#7a86a8;font-size:12px;font-weight:600;
                     letter-spacing:.08em;text-transform:uppercase;">${label}</span>
      </td>
      <td style="padding:0 0 14px;vertical-align:top;">
        <span style="color:#0d1b3e;font-size:15px;font-weight:500;">${value}</span>
      </td>
    </tr>`;
}

module.exports = { adminEmailTemplate };