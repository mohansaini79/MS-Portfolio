// ═══════════════════════════════════════════════════
//  server.js — Node.js + Express Portfolio Server
//  Serves Mohan Saini Portfolio static assets, Three.js vendor modules,
//  Resume PDF, portrait image routes, and POST /api/contact
//  powered by Nodemailer + Brevo SMTP.
// ═══════════════════════════════════════════════════

import 'dotenv/config';
import dns from 'dns';
import https from 'https';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import nodemailer from 'nodemailer';
import {
  validateContactForm,
  createBrevoSmtpConfig,
  buildBrevoMailOptions
} from './portfolio-logic.js';

// Force IPv4 resolution first so Brevo never receives an unrecognized IPv6 (2600:1900:...) egress address
if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Brevo + Nodemailer Configuration (using ONLY EMAIL_USER & BREVO_PASS) ──
const initialSmtpConfig = createBrevoSmtpConfig(process.env);

console.log(`\n🚀  Portfolio server → http://0.0.0.0:${PORT}`);
console.log(
  `    Email service: ${
    initialSmtpConfig.isConfigured
      ? `✅ Configured (${initialSmtpConfig.emailUser})`
      : '⚠️ Missing EMAIL_USER or BREVO_PASS in environment'
  }\n`
);

// ── Middleware ──
app.use(cors());
app.use(express.json({ limit: '64kb' }));
app.use(express.urlencoded({ extended: true, limit: '64kb' }));
app.use('/vendor/three', express.static(path.join(__dirname, 'node_modules/three')));
app.use(express.static(path.join(__dirname)));

// ── Simple Per-IP Rate Limiter for Spam Protection ──
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX_REQUESTS = 6;

function isRateLimited(ip) {
  const now = Date.now();
  const key = String(ip || 'unknown');
  const timestamps = (rateLimitStore.get(key) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (timestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    rateLimitStore.set(key, timestamps);
    return true;
  }
  timestamps.push(now);
  rateLimitStore.set(key, timestamps);
  return false;
}

// ── Send Email via Brevo using EMAIL_USER and BREVO_PASS (xkeysib-...) over IPv4 ──
function sendBrevoEmail(contactData, smtpConfig, mailOptions) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      sender: {
        name: 'Mohan Saini Portfolio',
        email: smtpConfig.emailUser
      },
      to: [{ email: smtpConfig.emailUser, name: 'Mohan Saini' }],
      replyTo: {
        email: contactData.email,
        name: contactData.name
      },
      subject: mailOptions.subject,
      htmlContent: mailOptions.html,
      textContent: mailOptions.text
    });

    const req = https.request(
      'https://api.brevo.com/v3/smtp/email',
      {
        method: 'POST',
        family: 4, // Force IPv4 so Brevo never receives an IPv6 address
        timeout: 12000,
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          'content-length': Buffer.byteLength(payload),
          'api-key': smtpConfig.brevoPass
        }
      },
      (res) => {
        let rawBody = '';
        res.on('data', (chunk) => {
          rawBody += chunk;
        });
        res.on('end', () => {
          let parsed = {};
          try {
            parsed = JSON.parse(rawBody || '{}');
          } catch {
            parsed = {};
          }
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            const err = new Error(parsed.message || `Brevo responded with status ${res.statusCode}`);
            err.statusCode = res.statusCode;
            err.brevoCode = parsed.code || '';
            reject(err);
          }
        });
      }
    );

    req.on('error', (err) => reject(err));
    req.on('timeout', () => {
      req.destroy(new Error('Connection to Brevo timed out'));
    });
    req.write(payload);
    req.end();
  });
}

// ── POST /api/contact — Contact Endpoint using ONLY EMAIL_USER and BREVO_PASS ──
app.post('/api/contact', async (req, res) => {
  try {
    const clientIp =
      req.headers['x-forwarded-for']?.toString().split(',')[0]?.trim() ||
      req.socket?.remoteAddress ||
      'unknown';

    if (isRateLimited(clientIp)) {
      return res.status(429).json({
        ok: false,
        success: false,
        error: 'Too many messages sent recently. Please wait a few minutes before trying again.'
      });
    }

    const validation = validateContactForm(req.body || {});
    if (!validation.valid) {
      return res.status(400).json({
        ok: false,
        success: false,
        error: validation.error
      });
    }

    const smtpConfig = createBrevoSmtpConfig(process.env);
    if (!smtpConfig.isConfigured) {
      console.warn('⚠️ [POST /api/contact] Missing EMAIL_USER or BREVO_PASS in environment.');
      return res.status(503).json({
        ok: false,
        success: false,
        error: 'Email service is not configured on the server (missing EMAIL_USER or BREVO_PASS).'
      });
    }

    const transporter = nodemailer.createTransport({
      ...smtpConfig.transportOptions,
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000
    });

    const mailOptions = buildBrevoMailOptions(validation.data, smtpConfig);

    // When BREVO_PASS starts with xkeysib- (as configured in Render with EMAIL_USER + BREVO_PASS),
    // deliver via sendBrevoEmail first, with Nodemailer SMTP fallback
    if (smtpConfig.isRestApiKey) {
      try {
        const apiResult = await sendBrevoEmail(validation.data, smtpConfig, mailOptions);
        return res.status(200).json({
          ok: true,
          success: true,
          messageId: apiResult.messageId || null,
          message: 'Thank you! Your message has been sent directly to Mohan Saini.'
        });
      } catch (brevoErr) {
        const msg = String(brevoErr.message || '');
        console.warn('⚠️ [POST /api/contact] Brevo notice:', msg);
        return res.status(502).json({
          ok: false,
          success: false,
          error: msg.includes('authorised_ips')
            ? `${msg} (Please authorize this IP or disable IP blocking at https://app.brevo.com/security/authorised_ips)`
            : `Failed to send email via Brevo: ${msg}`
        });
      }
    }

    // Standard Nodemailer SMTP delivery (smtp-relay.brevo.com:587) using EMAIL_USER & BREVO_PASS
    try {
      const info = await transporter.sendMail(mailOptions);
      return res.status(200).json({
        ok: true,
        success: true,
        messageId: info.messageId,
        message: 'Thank you! Your message has been sent directly to Mohan Saini.'
      });
    } catch (smtpError) {
      console.warn('⚠️ [POST /api/contact] Brevo SMTP notice:', smtpError.message);
      return res.status(502).json({
        ok: false,
        success: false,
        error: `Failed to send email via Brevo SMTP: ${smtpError.message}`
      });
    }
  } catch (err) {
    console.warn('⚠️ [POST /api/contact] Unexpected error:', err.message);
    return res.status(500).json({
      ok: false,
      success: false,
      error: 'An unexpected server error occurred while sending your message. Please try again later.'
    });
  }
});

// ── Resume download — case-insensitive fix for Linux (Railway / Render) ──
const resumeFilePath = path.join(__dirname, 'Resume.PDF');
app.get(['/resume.pdf', '/Resume.pdf', '/Resume.PDF'], (req, res) => {
  if (req.query.download === '1') {
    return res.download(resumeFilePath, 'Mohan_Saini_Resume.pdf', (err) => {
      if (err && !res.headersSent) res.status(404).send('Resume not found');
    });
  }
  res.sendFile(resumeFilePath, (err) => {
    if (err && !res.headersSent) res.status(404).send('Resume not found');
  });
});

// ── Portrait image route — supports both mohan2.png and mohan2.jpg seamlessly ──
app.get(['/mohan2.png', '/mohan2.jpg', '/Mohan2.png', '/Mohan2.jpg'], (_req, res) => {
  const pngPath = path.join(__dirname, 'mohan2.png');
  const jpgPath = path.join(__dirname, 'mohan2.jpg');
  const targetPath = fs.existsSync(pngPath) ? pngPath : jpgPath;
  res.sendFile(targetPath, (err) => {
    if (err && !res.headersSent) res.status(404).send('Portrait image not found');
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

