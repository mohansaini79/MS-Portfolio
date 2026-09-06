// ═══════════════════════════════════════════════════
//  server.js — Node.js + Express + Brevo HTTP API
//  Contact form backend for Mohan Saini Portfolio
//  Uses Brevo REST API (HTTPS port 443) — works on Railway
//  Railway blocks ALL SMTP ports (465, 587) — HTTP API is the fix
// ═══════════════════════════════════════════════════

import 'dotenv/config';
import express from 'express';
import path    from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Credentials ──
const EMAIL_USER = process.env.EMAIL_USER ? process.env.EMAIL_USER.trim() : undefined;
const BREVO_KEY  = (process.env.BREVO_PASS || process.env.BREVO_KEY || '').trim(); // xsmtpsib-... key

// ── Startup log ──
console.log(`\n🚀  Portfolio server → http://0.0.0.0:${PORT}`);
console.log(`    Gmail inbox : ${EMAIL_USER || '⚠️  NOT SET — add EMAIL_USER variable'}`);
console.log(`    Brevo key   : ${BREVO_KEY  ? '✅ Set'  : '⚠️  NOT SET — add BREVO_PASS variable'}`);
console.log(`    Email mode  : ${BREVO_KEY  ? '✅ Brevo HTTP API (Railway-compatible)' : '❌ Not configured'}\n`);

if (!EMAIL_USER || !BREVO_KEY) {
  console.warn('⚠️  Contact form disabled — add EMAIL_USER and BREVO_PASS in Railway Variables.\n');
}

// ── Middleware ──
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// ══════════════════════════════════════════════════════
//  Brevo HTTP API email sender
//  Uses HTTPS (port 443) — Railway NEVER blocks this
//  BREVO_PASS (xsmtpsib-... key) works as the API key
// ══════════════════════════════════════════════════════
async function sendBrevoEmail({ to, toName, subject, html, replyTo }) {
  const body = {
    sender:      { name: 'Mohan Saini Portfolio', email: EMAIL_USER },
    to:          [{ email: to, name: toName || to }],
    replyTo:     replyTo ? { email: replyTo } : undefined,
    subject,
    htmlContent: html,
  };

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method:  'POST',
    headers: {
      'accept':       'application/json',
      'api-key':      BREVO_KEY,
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Brevo API error ${res.status}`);
  }
  return res.json();
}

// ── Contact API route ──
app.post('/api/contact', async (req, res) => {
  if (!EMAIL_USER || !BREVO_KEY) {
    return res.status(503).json({
      error: 'Email service not configured. Contact directly at mohansaini8772532@gmail.com',
    });
  }

  const { name, email, subject, message } = req.body;

  // Validation
  if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }
  if (message.trim().length < 10) {
    return res.status(400).json({ error: 'Message is too short (min 10 chars).' });
  }

  // ── Email to owner (Mohan) ──
  const ownerHtml = `
    <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;background:#0F172A;color:#E2E8F0;border-radius:12px;overflow:hidden;border:1px solid rgba(255,255,255,0.08)">
      <div style="background:linear-gradient(135deg,#4F46E5,#7C3AED);padding:24px 32px">
        <h1 style="margin:0;font-size:18px;font-weight:700;color:#fff">📬 New Portfolio Message</h1>
      </div>
      <div style="padding:28px 32px">
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
          <tr><td style="padding:7px 0;color:#94A3B8;font-size:13px;width:75px;vertical-align:top">From</td><td style="padding:7px 0;font-weight:600;color:#fff;font-size:14px">${name}</td></tr>
          <tr><td style="padding:7px 0;color:#94A3B8;font-size:13px;vertical-align:top">Email</td><td style="padding:7px 0;font-size:14px"><a href="mailto:${email}" style="color:#818CF8;text-decoration:none">${email}</a></td></tr>
          <tr><td style="padding:7px 0;color:#94A3B8;font-size:13px;vertical-align:top">Subject</td><td style="padding:7px 0;color:#E2E8F0;font-size:14px">${subject}</td></tr>
        </table>
        <hr style="border:none;border-top:1px solid rgba(255,255,255,0.07);margin-bottom:20px"/>
        <p style="color:#94A3B8;font-size:12px;margin:0 0 10px;text-transform:uppercase;letter-spacing:.06em">Message</p>
        <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:18px;color:#E2E8F0;font-size:14px;line-height:1.75;white-space:pre-wrap">${message.trim()}</div>
        <div style="margin-top:24px">
          <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject)}"
             style="display:inline-block;padding:10px 20px;background:linear-gradient(135deg,#4F46E5,#7C3AED);color:#fff;border-radius:8px;font-size:13px;font-weight:600;text-decoration:none">Reply to ${name}</a>
        </div>
      </div>
      <div style="padding:14px 32px;background:rgba(0,0,0,0.18);text-align:center;font-size:12px;color:#475569">
        Sent from Mohan Saini's Portfolio
      </div>
    </div>
  `;

  // ── Auto-reply to sender ──
  const autoHtml = `
    <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;background:#0F172A;color:#E2E8F0;border-radius:12px;overflow:hidden;border:1px solid rgba(255,255,255,0.08)">
      <div style="background:linear-gradient(135deg,#4F46E5,#7C3AED);padding:24px 32px">
        <h1 style="margin:0;font-size:18px;font-weight:700;color:#fff">Hey ${name}! 👋</h1>
      </div>
      <div style="padding:28px 32px">
        <p style="color:#E2E8F0;font-size:15px;line-height:1.75;margin:0 0 18px">Thanks for reaching out through my portfolio. I've received your message and will get back to you within <strong style="color:#fff">24–48 hours</strong>.</p>
        <div style="background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.18);border-radius:8px;padding:16px;margin-bottom:22px">
          <p style="color:#94A3B8;font-size:11px;text-transform:uppercase;letter-spacing:.06em;margin:0 0 8px">Your message</p>
          <p style="color:#C7D2FE;font-size:13px;line-height:1.65;margin:0;white-space:pre-wrap">${message.trim()}</p>
        </div>
        <p style="color:#64748B;font-size:13px;margin:0 0 14px">While you wait, feel free to explore my work:</p>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <a href="https://github.com/mohansaini79" style="display:inline-block;padding:8px 16px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:#fff;border-radius:7px;font-size:13px;text-decoration:none">GitHub</a>
          <a href="https://www.linkedin.com/in/mohan-saini-2026ms/" style="display:inline-block;padding:8px 16px;background:rgba(99,102,241,0.12);border:1px solid rgba(99,102,241,0.2);color:#818CF8;border-radius:7px;font-size:13px;text-decoration:none">LinkedIn</a>
        </div>
        <p style="color:#E2E8F0;font-size:14px;margin-top:28px;line-height:1.6">Best regards,<br/><strong style="color:#fff">Mohan Saini</strong><br/><span style="color:#818CF8;font-size:12px">Co-Founder &amp; CTO · The Rising Tribe</span></p>
      </div>
      <div style="padding:14px 32px;background:rgba(0,0,0,0.18);text-align:center;font-size:12px;color:#475569">
        © ${new Date().getFullYear()} Mohan Saini · mohansaini8772532@gmail.com
      </div>
    </div>
  `;

  try {
    // Send both emails in parallel via Brevo HTTP API
    await Promise.all([
      sendBrevoEmail({
        to: EMAIL_USER,
        toName: 'Mohan Saini',
        subject: `[Portfolio] ${subject} — from ${name}`,
        html: ownerHtml,
        replyTo: email,
      }),
      sendBrevoEmail({
        to: email,
        toName: name,
        subject: `Got your message, ${name}! I'll be in touch soon. 🤝`,
        html: autoHtml,
      }),
    ]);

    console.log(`✅ Emails sent via Brevo API — from ${name} <${email}>`);
    res.json({ success: true });

  } catch (err) {
    console.error('❌ Brevo API error:', err.message);
    res.status(500).json({
      error: 'Failed to send email. Please try again or email directly at mohansaini8772532@gmail.com',
    });
  }
});

// ── Resume download — case-insensitive fix for Linux (Railway) ──
app.get('/resume.pdf', (_req, res) => {
  res.download(path.join(__dirname, 'Resume.pdf'), 'Mohan_Saini_Resume.pdf', (err) => {
    if (err && !res.headersSent) res.status(404).send('Resume not found');
  });
});
app.get('/Resume.pdf', (_req, res) => {
  res.download(path.join(__dirname, 'Resume.pdf'), 'Mohan_Saini_Resume.pdf', (err) => {
    if (err && !res.headersSent) res.status(404).send('Resume not found');
  });
});

// ── Serve index.html for all other routes ──
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ── Start server ──
const server = app.listen(PORT, '0.0.0.0', () => {
  // startup log already printed above
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌  Port ${PORT} already in use. Run: .\\start.ps1\n`);
    process.exit(1);
  } else {
    throw err;
  }
});
