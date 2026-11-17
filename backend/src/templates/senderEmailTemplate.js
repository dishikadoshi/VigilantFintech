/**
 * senderEmailTemplate.js
 * ───────────────────────
 * Confirmation email sent to the person who submitted the form.
 * Warm, professional, on-brand.
 */

function senderEmailTemplate(record) {
  const firstName = record.firstName;
  const subject   = `We've received your enquiry, ${firstName} — Vigilant Fintech`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Your Enquiry — Vigilant Fintech</title>
</head>
<body style="margin:0;padding:0;background:#f0f2f7;
             font-family:'Segoe UI',Helvetica,Arial,sans-serif;
             -webkit-font-smoothing:antialiased;">

<table width="100%" cellpadding="0" cellspacing="0" role="presentation"
       style="background:#f0f2f7;padding:40px 16px;">
  <tr><td align="center">

    <table width="600" cellpadding="0" cellspacing="0" role="presentation"
           style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;
                  overflow:hidden;box-shadow:0 8px 40px rgba(13,27,62,.12);">

      <!-- Header with logo area -->
      <tr>
        <td style="background:linear-gradient(135deg,#050e24 0%,#0d1b3e 60%,#122158 100%);
                   padding:40px 40px 36px;text-align:center;">
          <!-- Logo mark -->
          <div style="display:inline-block;background:rgba(255,255,255,.1);
                      border-radius:12px;padding:12px 20px;margin-bottom:24px;">
            <span style="color:#e8a020;font-size:18px;font-weight:800;
                         letter-spacing:-.02em;">Vigilant Fintech</span>
            <span style="color:rgba(255,255,255,.4);margin:0 8px;font-size:12px;">|</span>
            <span style="color:rgba(255,255,255,.5);font-size:10px;font-weight:600;
                         letter-spacing:.14em;text-transform:uppercase;">Cost Intelligence</span>
          </div>

          <!-- Checkmark icon -->
          <div style="width:64px;height:64px;background:rgba(196,135,10,.15);
                      border:2px solid rgba(196,135,10,.4);border-radius:50%;
                      margin:0 auto 20px;display:flex;align-items:center;
                      justify-content:center;line-height:64px;text-align:center;">
            <span style="color:#e8a020;font-size:28px;line-height:64px;">✓</span>
          </div>

          <h1 style="margin:0 0 10px;color:#ffffff;font-size:28px;font-weight:700;
                     letter-spacing:-.025em;line-height:1.2;">
            Enquiry Received!
          </h1>
          <p style="margin:0;color:rgba(255,255,255,.55);font-size:15px;
                    font-weight:300;line-height:1.6;">
            We'll be in touch within one business day.
          </p>
        </td>
      </tr>

      <!-- Greeting -->
      <tr>
        <td style="padding:36px 40px 0;">
          <p style="margin:0 0 16px;color:#0d1b3e;font-size:17px;font-weight:500;
                    line-height:1.7;">
            Hi ${firstName},
          </p>
          <p style="margin:0 0 16px;color:#374269;font-size:15px;font-weight:300;
                    line-height:1.8;">
            Thank you for reaching out to <strong style="color:#0d1b3e;">Vigilant Fintech</strong>. 
            We've received your enquiry and our team will review it carefully.
          </p>
          <p style="margin:0;color:#374269;font-size:15px;font-weight:300;line-height:1.8;">
            A cost strategist will be in contact with you within
            <strong style="color:#0d1b3e;">one business day</strong> to discuss your specific 
            situation and how we can help identify savings for 
            <strong style="color:#0d1b3e;">${record.company}</strong>.
          </p>
        </td>
      </tr>

      <!-- Summary card -->
      <tr>
        <td style="padding:28px 40px 0;">
          <div style="background:#f0f2f7;border-radius:12px;padding:24px;
                      border:1px solid #e2e6ef;">
            <h3 style="margin:0 0 16px;color:#0d1b3e;font-size:12px;font-weight:700;
                       letter-spacing:.14em;text-transform:uppercase;">
              Your Submission Summary
            </h3>
            ${summaryRow('Ref ID',    record.id, true)}
            ${summaryRow('Company',   record.company)}
            ${summaryRow('Enquiry',   record.reason)}
            ${summaryRow('Submitted', new Date(record.timestamp).toLocaleString('en-US', {
              month:'long', day:'numeric', year:'numeric',
              hour:'2-digit', minute:'2-digit'
            }))}
          </div>
        </td>
      </tr>

      <!-- What happens next -->
      <tr>
        <td style="padding:28px 40px 0;">
          <h2 style="margin:0 0 20px;color:#0d1b3e;font-size:14px;font-weight:700;
                     letter-spacing:.12em;text-transform:uppercase;">
            What Happens Next
          </h2>
          ${nextStep('1', '#2045a0', 'Review',
            'Our team reviews your enquiry and prepares specific questions tailored to your business.')}
          ${nextStep('2', '#c4870a', 'Initial Call',
            'A cost strategist reaches out to schedule your free 30-minute diagnostic call.')}
          ${nextStep('3', '#122158', 'Your Audit',
            'We dive into your cost structure and identify savings opportunities — typically 15–30%.')}
        </td>
      </tr>

      <!-- CTA -->
      <tr>
        <td style="padding:32px 40px;text-align:center;">
          <p style="margin:0 0 20px;color:#7a86a8;font-size:13px;font-weight:300;">
            While you wait, explore our case studies to see how we've helped businesses like yours.
          </p>
          <a href="https://vigilantfintech.com"
             style="display:inline-block;background:#0d1b3e;color:#ffffff;font-size:14px;
                    font-weight:600;padding:14px 32px;border-radius:10px;
                    text-decoration:none;letter-spacing:-.01em;">
            View Case Studies →
          </a>
        </td>
      </tr>

      <!-- Divider -->
      <tr>
        <td style="padding:0 40px;">
          <div style="height:1px;background:#e2e6ef;"></div>
        </td>
      </tr>

      <!-- Contact info -->
      <tr>
        <td style="padding:24px 40px;">
          <p style="margin:0 0 8px;color:#374269;font-size:14px;font-weight:400;
                    line-height:1.6;">
            Have urgent questions? Contact us directly:
          </p>
          <p style="margin:0;color:#374269;font-size:14px;line-height:1.8;font-weight:300;">
            📧 <a href="mailto:vigilantfintech@gmail.com"
                  style="color:#2045a0;text-decoration:none;font-weight:600;">
                  vigilantfintech@gmail.com</a><br/>
            📞 <a href="tel:+917597703903"
                  style="color:#2045a0;text-decoration:none;font-weight:600;">
                  +91 7597703903</a>
          </p>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background:#050e24;padding:24px 40px;border-radius:0 0 16px 16px;">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
            <tr>
              <td>
                <p style="margin:0;color:rgba(255,255,255,.35);font-size:12px;
                          font-weight:300;line-height:1.6;">
                  © ${new Date().getFullYear()} Vigilant Fintech. All rights reserved.<br/>
                  123 Financial District, Suite 800, New York, NY 10004
                </p>
              </td>
              <td align="right">
                <p style="margin:0;color:rgba(196,135,10,.6);font-size:12px;
                          font-style:italic;font-weight:300;">
                  Built for ambitious SMBs
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>

    </table>
  </td></tr>
</table>

</body>
</html>`;

  const text = `
Hi ${firstName},

Thank you for reaching out to Vigilant Fintech!

We've received your enquiry and a cost strategist will be in touch 
within one business day to discuss your situation.

SUBMISSION SUMMARY
──────────────────
Ref ID    : ${record.id}
Company   : ${record.company}
Enquiry   : ${record.reason}
Submitted : ${record.timestamp}

WHAT HAPPENS NEXT
─────────────────
1. Our team reviews your enquiry.
2. A strategist schedules your free 30-min diagnostic call.
3. We identify savings — typically 15–30% of total spend.

Questions? Contact us:
  Email : vigilantfintech@gmail.com
  Phone : +91 7597703903

Best regards,
The Vigilant Fintech Team
`.trim();

  return { subject, html, text };
}

function summaryRow(label, value, mono = false) {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
           style="margin-bottom:10px;">
      <tr>
        <td style="width:100px;vertical-align:top;">
          <span style="color:#7a86a8;font-size:12px;font-weight:600;
                       letter-spacing:.08em;text-transform:uppercase;">${label}</span>
        </td>
        <td style="vertical-align:top;">
          <span style="color:#0d1b3e;font-size:${mono ? '13px' : '14px'};
                       font-weight:600;
                       font-family:${mono ? "'Courier New',monospace" : 'inherit'};
                       color:${mono ? '#c4870a' : '#0d1b3e'};">
            ${value}
          </span>
        </td>
      </tr>
    </table>`;
}

function nextStep(num, color, title, desc) {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
           style="margin-bottom:16px;">
      <tr>
        <td style="width:36px;vertical-align:top;padding-top:2px;">
          <div style="width:28px;height:28px;background:${color};border-radius:50%;
                      text-align:center;line-height:28px;">
            <span style="color:#fff;font-size:13px;font-weight:700;">${num}</span>
          </div>
        </td>
        <td style="padding-left:12px;vertical-align:top;">
          <p style="margin:0 0 4px;color:#0d1b3e;font-size:14px;font-weight:700;">${title}</p>
          <p style="margin:0;color:#374269;font-size:13px;font-weight:300;line-height:1.65;">${desc}</p>
        </td>
      </tr>
    </table>`;
}

module.exports = { senderEmailTemplate };
