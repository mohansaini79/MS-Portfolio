// ═══════════════════════════════════════════════════
//  server.js — Node.js + Express + Nodemailer
//  Contact form backend for Mohan Saini Portfolio
// ═══════════════════════════════════════════════════

import 'dotenv/config';           // ← loads .env automatically
import express from 'express';
import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Read credentials ──
const EMAIL_USER = process.env.EMAIL_USER ? process.env.EMAIL_USER.trim() : undefined;
const EMAIL_PASS = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.trim() : undefined;

// ── Warn clearly if credentials are missing ──
if (!EMAIL_USER || !EMAIL_PASS) {
  console.warn('\n⚠️  ─────────────────────────────────────────────────');
  console.warn('   EMAIL_USER or EMAIL_PASS not found in .env file.');
  console.warn('   Contact form will return an error until you set them.');
  console.warn('   ➜  Copy .env.example → .env and fill in your values.');
  console.warn('─────────────────────────────────────────────────────\n');
}

// ── Middleware ──
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// ── Nodemailer transporter — persistent pool (created once at startup) ──
const transporter = nodemailer.createTransport({
  service: 'gmail',
  pool: true,          // reuse SMTP connection — much faster
  maxConnections: 3,
  maxMessages: 100,
  auth: { user: EMAIL_USER, pass: EMAIL_PASS },
});

// Verify credentials at startup so you know immediately if .env is wrong
if (EMAIL_USER && EMAIL_PASS) {
  transporter.verify().then(() => {
    console.log('✅  SMTP connection verified — ready to send emails');
  }).catch(err => {
    console.warn('⚠️   SMTP verify failed:', err.message);
    console.warn('    Check EMAIL_USER / EMAIL_PASS in your .env file');
  });
}

// ── Contact API route ──
app.post('/api/contact', async (req, res) => {
  // Guard: credentials must be set
  if (!EMAIL_USER || !EMAIL_PASS) {
    return res.status(503).json({
      error: 'Email service not configured. Please contact the site owner directly at mohansaini8772532@gmail.com',
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

  // ── Mail to owner ──
  const ownerMail = {
    from: `"Portfolio Contact" <${EMAIL_USER}>`,
    to:   EMAIL_USER,
    replyTo: email,
    subject: `[Portfolio] ${subject} — from ${name}`,
    html: `
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
          <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:18px;color:#E2E8F0;font-size:14px;line-height:1.75;white-space:pre-wrap">${name.trim()}: ${message.trim()}</div>
          <div style="margin-top:24px">
            <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject)}"
               style="display:inline-block;padding:10px 20px;background:linear-gradient(135deg,#4F46E5,#7C3AED);color:#fff;border-radius:8px;font-size:13px;font-weight:600;text-decoration:none">Reply to ${name}</a>
          </div>
        </div>
        <div style="padding:14px 32px;background:rgba(0,0,0,0.18);text-align:center;font-size:12px;color:#475569">
          Sent from Mohan Saini's Portfolio
        </div>
      </div>
    `,
  };

  // ── Auto-reply to sender ──
  const autoReply = {
    from: `"Mohan Saini" <${EMAIL_USER}>`,
    to:   email,
    subject: `Got your message, ${name}! I'll be in touch soon. 🤝`,
    html: `
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
            <a href="https://github.com/mohansaini79"            style="display:inline-block;padding:8px 16px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:#fff;border-radius:7px;font-size:13px;text-decoration:none">GitHub</a>
            <a href="https://www.linkedin.com/in/mohan-saini-2026ms/" style="display:inline-block;padding:8px 16px;background:rgba(99,102,241,0.12);border:1px solid rgba(99,102,241,0.2);color:#818CF8;border-radius:7px;font-size:13px;text-decoration:none">LinkedIn</a>
          </div>
          <p style="color:#E2E8F0;font-size:14px;margin-top:28px;line-height:1.6">Best regards,<br/><strong style="color:#fff">Mohan Saini</strong><br/><span style="color:#818CF8;font-size:12px">Co-Founder &amp; CTO · The Rising Tribe</span></p>
        </div>
        <div style="padding:14px 32px;background:rgba(0,0,0,0.18);text-align:center;font-size:12px;color:#475569">
          © ${new Date().getFullYear()} Mohan Saini · mohansaini8772532@gmail.com
        </div>
      </div>
    `,
  };

  // ── Send both emails in PARALLEL (not sequential) ──
  try {
    const sendWithTimeout = (mail) => {
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Email timeout after 8s')), 8000)
      );
      return Promise.race([transporter.sendMail(mail), timeout]);
    };

    await Promise.all([
      sendWithTimeout(ownerMail),
      sendWithTimeout(autoReply),
    ]);

    console.log(`✅ Emails sent — from ${name} <${email}>`);
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Nodemailer error:', err.message);
    res.status(500).json({
      error: 'Failed to send email. Please try again or email directly at mohansaini8772532@gmail.com',
    });
  }
});

// ── Serve index.html for all other routes ──
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ── Start ──
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀  Portfolio server → http://0.0.0.0:${PORT}`);
  console.log(`    Email user : ${EMAIL_USER  || '⚠️  NOT SET (add to .env)'}`);
  console.log(`    Email pass : ${EMAIL_PASS  ? '✅ Set' : '⚠️  NOT SET (add to .env)'}\n`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌  Port ${PORT} is already in use.`);
    console.error(`    Run this to fix it, then try again:\n`);
    console.error(`    netstat -ano | findstr :${PORT}`);
    console.error(`    taskkill /F /PID <PID shown above>\n`);
    console.error(`    Or just run:  .\\start.ps1\n`);
    process.exit(1);
  } else {
    throw err;
  }
});
