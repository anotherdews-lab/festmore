// routes/notifications.js
// Sends email notifications to vendors when:
// 1. An organiser applies/messages them
// 2. A review is posted on their profile
// 3. An application is accepted/rejected

const express = require('express');
const router  = express.Router();
const db      = require('../db');

async function sendEmail(to, subject, html) {
  try {
    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'Festmore <contact@festmore.com>',
      to, subject, html
    });
    console.log('✅ Email sent to:', to);
    return true;
  } catch(err) {
    console.error('❌ Email error:', err.message);
    return false;
  }
}

// ─── ORGANISER CONTACTS VENDOR ────────────────────────────────────
router.post('/contact-vendor', async (req, res) => {
  const { vendor_id, organiser_name, organiser_email, event_name, message } = req.body;

  if (!vendor_id || !organiser_email || !message) {
    return res.json({ ok: false, msg: 'Missing required fields' });
  }

  try {
    // Get vendor details
    const { Client } = require('pg');
    const client = new Client({
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres:VWgjvXynowzYucOsfqNNAPWojptOHaXJ@gondola.proxy.rlwy.net:47003/railway',
      ssl: { rejectUnauthorized: false }
    });
    await client.connect();

    const vendorRes = await client.query('SELECT * FROM vendors WHERE id=$1', [parseInt(vendor_id)]);
    await client.end();

    if (!vendorRes.rows[0]) return res.json({ ok: false, msg: 'Vendor not found' });
    const vendor = vendorRes.rows[0];

    // Send email to vendor
    await sendEmail(
      vendor.email,
      `🎪 New message from ${organiser_name || 'an event organiser'} — Festmore`,
      `<!DOCTYPE html>
<html><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
  <tr><td style="background:#0a1a0f;border-radius:20px 20px 0 0;padding:40px 48px;text-align:center;">
    <span style="font-size:28px;font-weight:800;color:#fff;">Fest<span style="color:#e8470a;">more</span></span>
    <h1 style="font-size:28px;color:#fff;font-weight:400;margin:20px 0 8px;font-family:Georgia,serif;">You have a new message!</h1>
    <p style="color:rgba(255,255,255,.6);font-size:15px;margin:0;">An event organiser wants to work with you</p>
  </td></tr>
  <tr><td style="background:#fff;padding:40px 48px;">
    <p style="font-size:16px;color:#1a1612;margin-bottom:8px;">Hi <strong>${vendor.business_name}</strong>,</p>
    <p style="font-size:15px;color:#6b5f58;line-height:1.7;margin-bottom:24px;">
      <strong>${organiser_name || 'An event organiser'}</strong> has contacted you through Festmore${event_name ? ` regarding <strong>${event_name}</strong>` : ''}.
    </p>
    <div style="background:#f5f0e8;border-left:4px solid #e8470a;padding:20px 24px;border-radius:0 12px 12px 0;margin-bottom:28px;">
      <div style="font-size:12px;font-weight:700;color:#e8470a;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Their message:</div>
      <p style="font-size:15px;color:#1a1612;line-height:1.7;margin:0;">${message.replace(/\n/g,'<br/>')}</p>
    </div>
    <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:12px;padding:16px 20px;margin-bottom:28px;">
      <div style="font-size:13px;font-weight:700;color:#15803d;margin-bottom:6px;">📧 Reply directly to the organiser:</div>
      <a href="mailto:${organiser_email}" style="font-size:14px;color:#15803d;font-weight:600;">${organiser_email}</a>
    </div>
    <a href="https://festmore.com/vendors/profile/${vendor.id}" style="display:inline-block;background:#e8470a;color:#fff;padding:14px 28px;border-radius:10px;font-size:15px;font-weight:700;text-decoration:none;margin-bottom:16px;">View Your Profile →</a>
    <p style="font-size:13px;color:#6b5f58;line-height:1.7;">This message was sent via <a href="https://festmore.com" style="color:#e8470a;">Festmore.com</a>. Reply directly to ${organiser_email} to respond.</p>
  </td></tr>
  <tr><td style="background:#1a1612;border-radius:0 0 20px 20px;padding:24px 48px;text-align:center;">
    <p style="font-size:12px;color:rgba(255,255,255,.3);margin:0;">© ${new Date().getFullYear()} Festmore.com · <a href="https://festmore.com/vendors/profile/${vendor.id}" style="color:rgba(255,255,255,.4);text-decoration:none;">View your profile</a></p>
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`
    );

    // Also send confirmation to organiser
    await sendEmail(
      organiser_email,
      `✅ Your message was sent to ${vendor.business_name} — Festmore`,
      `<html><body style="font-family:Arial,sans-serif;padding:40px;background:#f5f0e8;">
      <div style="max-width:500px;margin:0 auto;background:#fff;border-radius:16px;padding:32px;">
        <h2 style="color:#1a1612;">Message sent! ✅</h2>
        <p style="color:#6b5f58;">Your message to <strong>${vendor.business_name}</strong> has been delivered. They will reply to you directly at <strong>${organiser_email}</strong>.</p>
        <a href="https://festmore.com/vendors/profile/${vendor.id}" style="display:inline-block;background:#e8470a;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;">View Vendor Profile →</a>
      </div></body></html>`
    );

    res.json({ ok: true, msg: 'Message sent! The vendor will receive an email notification.' });
  } catch(err) {
    console.error('Contact vendor error:', err.message);
    res.json({ ok: false, msg: 'Failed to send message. Please try again.' });
  }
});

// ─── APPLICATION STATUS UPDATE → notify vendor ───────────────────
router.post('/application-update', async (req, res) => {
  const { vendor_id, event_id, status, organiser_message } = req.body;

  try {
    const { Client } = require('pg');
    const client = new Client({
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres:VWgjvXynowzYucOsfqNNAPWojptOHaXJ@gondola.proxy.rlwy.net:47003/railway',
      ssl: { rejectUnauthorized: false }
    });
    await client.connect();

    const vendorRes = await client.query('SELECT * FROM vendors WHERE id=$1', [parseInt(vendor_id)]);
    const eventRes = await client.query('SELECT * FROM events WHERE id=$1', [parseInt(event_id)]);
    await client.end();

    const vendor = vendorRes.rows[0];
    const event = eventRes.rows[0];
    if (!vendor || !event) return res.json({ ok: false, msg: 'Not found' });

    const isAccepted = status === 'accepted';
    const emoji = isAccepted ? '🎉' : '📋';
    const statusText = isAccepted ? 'accepted' : 'reviewed';

    await sendEmail(
      vendor.email,
      `${emoji} Your application to ${event.title} has been ${statusText} — Festmore`,
      `<!DOCTYPE html>
<html><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
  <tr><td style="background:${isAccepted?'#0a1a0f':'#1a0a0a'};border-radius:20px 20px 0 0;padding:40px 48px;text-align:center;">
    <span style="font-size:28px;font-weight:800;color:#fff;">Fest<span style="color:#e8470a;">more</span></span>
    <div style="font-size:52px;margin:20px 0;">${isAccepted ? '🎉' : '📋'}</div>
    <h1 style="font-size:26px;color:#fff;font-weight:400;margin:0;font-family:Georgia,serif;">
      ${isAccepted ? 'Congratulations! Application Accepted!' : 'Application Update'}
    </h1>
  </td></tr>
  <tr><td style="background:#fff;padding:40px 48px;">
    <p style="font-size:16px;color:#1a1612;margin-bottom:16px;">Hi <strong>${vendor.business_name}</strong>,</p>
    <p style="font-size:15px;color:#6b5f58;line-height:1.7;margin-bottom:24px;">
      ${isAccepted
        ? `Great news! Your application to participate at <strong>${event.title}</strong> has been <strong>accepted</strong>. The event organiser wants you as a vendor!`
        : `Your application to <strong>${event.title}</strong> has been reviewed by the event organiser.`
      }
    </p>
    ${organiser_message ? `
    <div style="background:#f5f0e8;border-left:4px solid ${isAccepted?'#4a7c59':'#e8470a'};padding:20px 24px;border-radius:0 12px 12px 0;margin-bottom:28px;">
      <div style="font-size:12px;font-weight:700;color:${isAccepted?'#4a7c59':'#e8470a'};text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Message from organiser:</div>
      <p style="font-size:15px;color:#1a1612;line-height:1.7;margin:0;">${organiser_message}</p>
    </div>` : ''}
    <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:12px;padding:16px 20px;margin-bottom:28px;">
      <div style="font-size:13px;font-weight:700;color:#15803d;margin-bottom:4px;">📍 Event details:</div>
      <div style="font-size:14px;color:#1a1612;"><strong>${event.title}</strong></div>
      <div style="font-size:13px;color:#6b5f58;">${event.date_display || event.start_date} · ${event.city}</div>
      ${event.website ? `<a href="${event.website}" style="font-size:13px;color:#15803d;">${event.website}</a>` : ''}
    </div>
    <a href="https://festmore.com/vendors/dashboard/${vendor.id}" style="display:inline-block;background:#e8470a;color:#fff;padding:14px 28px;border-radius:10px;font-size:15px;font-weight:700;text-decoration:none;">Go to Your Dashboard →</a>
  </td></tr>
  <tr><td style="background:#1a1612;border-radius:0 0 20px 20px;padding:24px 48px;text-align:center;">
    <p style="font-size:12px;color:rgba(255,255,255,.3);margin:0;">© ${new Date().getFullYear()} Festmore.com</p>
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`
    );

    res.json({ ok: true, msg: 'Vendor notified by email.' });
  } catch(err) {
    console.error('Application update notification error:', err.message);
    res.json({ ok: false, msg: 'Failed to send notification.' });
  }
});

module.exports = router;
module.exports.sendEmail = sendEmail;
