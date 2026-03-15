// routes/applications.js
// Vendor apply-to-event system with email confirmations

const express      = require('express');
const router       = express.Router();
const db           = require('../db');
const nodemailer   = require('nodemailer');

// ─────────────────────────────────────
// CREATE APPLICATIONS TABLE IF MISSING
// ─────────────────────────────────────
try {
  db.exec(`CREATE TABLE IF NOT EXISTS vendor_applications (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    vendor_id   INTEGER NOT NULL,
    event_id    INTEGER NOT NULL,
    message     TEXT,
    status      TEXT DEFAULT 'pending',
    created_at  TEXT DEFAULT (datetime('now')),
    UNIQUE(vendor_id, event_id)
  )`);
} catch(e) {}

// ─────────────────────────────────────
// EMAIL HELPER
// ─────────────────────────────────────
async function sendEmail(to, subject, html) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    await transporter.sendMail({
      from: `"Festmore" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log('Email sent to:', to);
  } catch (err) {
    console.error('Email error:', err.message);
  }
}

// ─────────────────────────────────────
// EMAIL TEMPLATES
// ─────────────────────────────────────
function emailBase(content) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<style>
  body { font-family: 'DM Sans', Arial, sans-serif; background:#faf8f3; margin:0; padding:0; }
  .wrapper { max-width:600px; margin:40px auto; }
  .header { background:#1a1612; padding:28px 36px; border-radius:16px 16px 0 0; }
  .logo { font-size:24px; color:#e8470a; font-weight:700; }
  .body { background:#fff; padding:36px; border-left:1px solid #e8e2d9; border-right:1px solid #e8e2d9; }
  .footer { background:#f2ede4; padding:20px 36px; border-radius:0 0 16px 16px; font-size:12px; color:#7a6f68; border:1px solid #e8e2d9; border-top:none; }
  .btn { display:inline-block; background:#e8470a; color:#fff; padding:13px 28px; border-radius:99px; text-decoration:none; font-weight:700; font-size:14px; margin-top:20px; }
  h2 { color:#1a1612; font-size:22px; margin-bottom:12px; }
  p { color:#3d3530; line-height:1.7; font-size:15px; margin-bottom:12px; }
  .highlight { background:#faf8f3; border-left:3px solid #e8470a; padding:14px 18px; border-radius:0 8px 8px 0; margin:20px 0; }
</style></head><body>
<div class="wrapper">
  <div class="header"><div class="logo">Festmore</div></div>
  <div class="body">${content}</div>
  <div class="footer">© ${new Date().getFullYear()} Festmore.com — Your Global Event Guide<br/>
  <a href="https://festmore.com" style="color:#e8470a;">festmore.com</a></div>
</div></body></html>`;
}

// ─────────────────────────────────────
// APPLY TO EVENT — POST
// ─────────────────────────────────────
router.post('/apply', async (req, res) => {
  const { vendor_id, event_id, message } = req.body;

  if (!vendor_id || !event_id) {
    return res.json({ ok: false, msg: 'Missing vendor or event ID' });
  }

  // Get vendor and event
  const vendor = db.prepare("SELECT * FROM vendors WHERE id=?").get(parseInt(vendor_id));
  const event  = db.prepare("SELECT * FROM events WHERE id=?").get(parseInt(event_id));

  if (!vendor || !event) {
    return res.json({ ok: false, msg: 'Vendor or event not found' });
  }

  // Check vendor is verified and paid
  if (vendor.payment_status !== 'paid' || vendor.status !== 'active') {
    return res.json({ ok: false, msg: 'You need an active paid vendor profile to apply. <a href="/vendors/register">Upgrade now →</a>' });
  }

  // Check event allows applications
  if (!event.vendor_spots || event.vendor_spots === 0) {
    return res.json({ ok: false, msg: 'This event is not accepting vendor applications.' });
  }

  // Check not already applied
  const existing = db.prepare("SELECT id FROM vendor_applications WHERE vendor_id=? AND event_id=?").get(parseInt(vendor_id), parseInt(event_id));
  if (existing) {
    return res.json({ ok: false, msg: 'You have already applied to this event.' });
  }

  // Insert application
  db.prepare("INSERT INTO vendor_applications (vendor_id, event_id, message) VALUES (?,?,?)")
    .run(parseInt(vendor_id), parseInt(event_id), message || '');

  // Send confirmation email to vendor
  if (vendor.email) {
    await sendEmail(
      vendor.email,
      `Application Submitted — ${event.title} | Festmore`,
      emailBase(`
        <h2>Application Submitted! 🎉</h2>
        <p>Hi ${vendor.business_name},</p>
        <p>Your application to participate as a vendor at <strong>${event.title}</strong> has been submitted successfully.</p>
        <div class="highlight">
          <strong>Event:</strong> ${event.title}<br/>
          <strong>Location:</strong> ${event.city}, ${event.country}<br/>
          <strong>Dates:</strong> ${event.date_display || event.start_date}<br/>
          <strong>Your message:</strong> ${message || 'No message provided'}
        </div>
        <p>The event organiser will review your application and get in touch directly. Applications are typically reviewed within 3–5 working days.</p>
        <p>You can view and manage your applications from your dashboard.</p>
        <a href="https://festmore.com/dashboard" class="btn">View Dashboard →</a>
      `)
    );
  }

  // Send notification email to admin
  await sendEmail(
    process.env.EMAIL_USER,
    `New Vendor Application — ${vendor.business_name} → ${event.title}`,
    emailBase(`
      <h2>New Vendor Application</h2>
      <div class="highlight">
        <strong>Vendor:</strong> ${vendor.business_name} (${vendor.city})<br/>
        <strong>Category:</strong> ${vendor.category}<br/>
        <strong>Email:</strong> ${vendor.email}<br/>
        <strong>Event:</strong> ${event.title}<br/>
        <strong>Event City:</strong> ${event.city}<br/>
        <strong>Message:</strong> ${message || 'No message'}
      </div>
      <a href="https://festmore.com/admin/applications" class="btn">Review in Admin →</a>
    `)
  );

  res.json({ ok: true, msg: 'Application submitted! The organiser will be in touch.' });
});

// ─────────────────────────────────────
// GET VENDOR'S APPLICATIONS
// ─────────────────────────────────────
router.get('/my/:vendor_id', (req, res) => {
  const apps = db.prepare(`
    SELECT va.*, e.title as event_title, e.city as event_city,
           e.date_display, e.slug as event_slug
    FROM vendor_applications va
    LEFT JOIN events e ON va.event_id = e.id
    WHERE va.vendor_id = ?
    ORDER BY va.created_at DESC
  `).all(parseInt(req.params.vendor_id));
  res.json(apps);
});

module.exports = router;

// ─────────────────────────────────────
// PAYMENT CONFIRMATION EMAILS
// Export for use in events.js and vendors.js
// ─────────────────────────────────────
module.exports.sendPaymentConfirmation = async function(type, data) {
  if (!data.email) return;

  let subject, html;

  if (type === 'event') {
    subject = `Your Event is Live on Festmore! — ${data.title}`;
    html = emailBase(`
      <h2>Your Event is Now Live! 🎉</h2>
      <p>Great news! Your event listing on Festmore is now live and visible to thousands of visitors worldwide.</p>
      <div class="highlight">
        <strong>Event:</strong> ${data.title}<br/>
        <strong>Location:</strong> ${data.city}<br/>
        <strong>Dates:</strong> ${data.date_display || data.start_date}<br/>
        <strong>Plan:</strong> ${data.plan || 'Standard'}<br/>
        <strong>Your URL:</strong> <a href="https://festmore.com/events/${data.slug}" style="color:#e8470a;">festmore.com/events/${data.slug}</a>
      </div>
      <p>Your event is now indexed by search engines and included in our weekly newsletter to ${data.subscribers || '500'}+ subscribers.</p>
      <a href="https://festmore.com/events/${data.slug}" class="btn">View Your Event →</a>
    `);
  } else if (type === 'vendor') {
    subject = `Welcome to Festmore Vendors! — ${data.business_name}`;
    html = emailBase(`
      <h2>You're a Verified Vendor! ✅</h2>
      <p>Welcome to Festmore, ${data.business_name}!</p>
      <p>Your vendor profile is now live and verified. Event organisers across Europe can now find you and you can start applying to events.</p>
      <div class="highlight">
        <strong>Business:</strong> ${data.business_name}<br/>
        <strong>Category:</strong> ${data.category}<br/>
        <strong>Location:</strong> ${data.city}<br/>
        <strong>Status:</strong> ✅ Verified
      </div>
      <p>Start browsing events and applying for vendor spots from your dashboard.</p>
      <a href="https://festmore.com/events" class="btn">Browse Events to Apply →</a>
    `);
  }

  await sendEmail(data.email, subject, html);
};

module.exports.sendEmail = sendEmail;
module.exports.emailBase = emailBase;