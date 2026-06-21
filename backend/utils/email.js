const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return null;
  }

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  return transporter;
}

const BRAND = {
  name: 'Pipeline',
  color: '#ff8a3d',
  bg: '#14161a',
  cardBg: '#1b1e24',
  text: '#eef0f3',
  textDim: '#9aa0ac',
};

function wrapEmail({ heading, bodyHtml, ctaLabel, ctaUrl }) {
  return `
  <div style="background:${BRAND.bg};padding:40px 20px;font-family:'Helvetica Neue',Arial,sans-serif;">
    <div style="max-width:480px;margin:0 auto;background:${BRAND.cardBg};border-radius:12px;padding:36px 32px;border:1px solid #2c3038;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:28px;">
        <span style="color:${BRAND.color};font-weight:700;font-size:18px;">→</span>
        <span style="color:${BRAND.text};font-weight:700;font-size:18px;">${BRAND.name}</span>
      </div>
      <h1 style="color:${BRAND.text};font-size:20px;margin:0 0 16px;">${heading}</h1>
      <div style="color:${BRAND.textDim};font-size:14px;line-height:1.6;">
        ${bodyHtml}
      </div>
      ${ctaUrl ? `
      <div style="margin-top:28px;">
        <a href="${ctaUrl}" style="background:${BRAND.color};color:#1a1208;font-weight:600;font-size:14px;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;">${ctaLabel}</a>
      </div>
      <p style="color:#5e636e;font-size:12px;margin-top:20px;word-break:break-all;">
        Or copy this link: ${ctaUrl}
      </p>
      ` : ''}
      <p style="color:#5e636e;font-size:12px;margin-top:32px;border-top:1px solid #2c3038;padding-top:20px;">
        Sent by Pipeline — track every job application from first click to offer.
      </p>
    </div>
  </div>`;
}

async function sendMail({ to, subject, html }) {
  const t = getTransporter();
  if (!t) {
    console.log(`[email] Skipped sending "${subject}" to ${to} — EMAIL_USER/EMAIL_PASS not configured.`);
    return { skipped: true };
  }

  try {
    await t.sendMail({
      from: `"${BRAND.name}" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    return { sent: true };
  } catch (err) {
    console.error('[email] Send failed:', err.message);
    return { sent: false, error: err.message };
  }
}

async function sendWelcomeEmail(to, name) {
  return sendMail({
    to,
    subject: 'Welcome to Pipeline',
    html: wrapEmail({
      heading: `Welcome, ${name}.`,
      bodyHtml: `
        <p>Your account is ready. Pipeline keeps every job application in one place — log a role the moment you apply, and watch it move toward an offer.</p>
        <p>Here's the move: add your first application, then update its status as things progress.</p>
      `,
      ctaLabel: 'Open your dashboard',
      ctaUrl: `${process.env.CLIENT_URL}/dashboard`,
    }),
  });
}

async function sendVerificationEmail(to, name, token) {
  return sendMail({
    to,
    subject: 'Verify your email — Pipeline',
    html: wrapEmail({
      heading: 'Confirm your email address',
      bodyHtml: `
        <p>Hi ${name}, one quick step before you get started — verify this email address to activate your account.</p>
        <p>This link expires in 24 hours.</p>
      `,
      ctaLabel: 'Verify email',
      ctaUrl: `${process.env.CLIENT_URL}/verify-email/${token}`,
    }),
  });
}

async function sendPasswordResetEmail(to, name, token) {
  return sendMail({
    to,
    subject: 'Reset your password — Pipeline',
    html: wrapEmail({
      heading: 'Reset your password',
      bodyHtml: `
        <p>Hi ${name}, we received a request to reset your password. If this wasn't you, you can safely ignore this email — your password won't change.</p>
        <p>This link expires in 1 hour.</p>
      `,
      ctaLabel: 'Reset password',
      ctaUrl: `${process.env.CLIENT_URL}/reset-password/${token}`,
    }),
  });
}

async function sendStaleApplicationReminder(to, name, jobs) {
  const list = jobs
    .map((j) => `<li style="margin-bottom:6px;"><strong style="color:${BRAND.text};">${j.company}</strong> — ${j.role} <span style="color:#5e636e;">(${j.daysSince} days, no update)</span></li>`)
    .join('');

  return sendMail({
    to,
    subject: `${jobs.length} application${jobs.length === 1 ? '' : 's'} waiting on a follow-up`,
    html: wrapEmail({
      heading: 'Time to follow up',
      bodyHtml: `
        <p>Hi ${name}, these applications have been sitting for a week or more with no status change:</p>
        <ul style="padding-left:18px;">${list}</ul>
        <p>A short follow-up email to the recruiter can keep things moving.</p>
      `,
      ctaLabel: 'View your pipeline',
      ctaUrl: `${process.env.CLIENT_URL}/dashboard`,
    }),
  });
}

module.exports = {
  sendWelcomeEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendStaleApplicationReminder,
};
