// routes/payments.js — Stripe webhook handler with email notifications
const express = require('express');
const router  = express.Router();
const db      = require('../db');
const stripe  = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

// ─────────────────────────────────────
// EMAIL HELPER — Resend
// ─────────────────────────────────────
async function sendEmail(to, subject, html) {
  try {
    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'Festmore <onboarding@resend.dev>',
      to,
      subject,
      html,
    });
    console.log('✅ Email sent to:', to);
  } catch (err) {
    console.error('Email error:', err.message);
  }
}

// ─────────────────────────────────────
// STRIPE WEBHOOK
// ─────────────────────────────────────
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET || '');
  } catch {
    return res.status(400).send('Webhook error');
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { type, event_id, vendor_id, plan } = session.metadata || {};
    const amount = session.amount_total || 0;
    const customerEmail = session.customer_email || session.customer_details?.email || '';

    // ── EVENT LISTING PAYMENT ──
    if (type === 'event_listing' && event_id) {
      const isPremium = plan === 'premium';
      db.prepare("UPDATE events SET status='active', payment_status='paid', featured=? WHERE id=?")
        .run(isPremium ? 1 : 0, parseInt(event_id));

      const ev = db.prepare("SELECT * FROM events WHERE id=?").get(parseInt(event_id));

      // Notify YOU
      await sendEmail(
        process.env.EMAIL_USER,
        `💰 New Event Payment — €${(amount/100).toFixed(2)} — ${ev ? ev.title : 'Event #'+event_id}`,
        `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:#1a1612;padding:24px 32px;border-radius:12px 12px 0 0;">
            <div style="font-size:22px;color:#e8470a;font-weight:700;">Festmore</div>
            <div style="font-size:12px;color:rgba(255,255,255,.4);">New Payment Received 💰</div>
          </div>
          <div style="background:#fff;padding:32px;border:1px solid #e8e2d9;">
            <h2 style="color:#1a1612;font-size:20px;margin-bottom:20px;">🎪 New Event Listing Payment!</h2>
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:10px 0;border-bottom:1px solid #f0ece4;font-size:12px;font-weight:700;color:#b5ada6;text-transform:uppercase;width:140px;">Amount</td><td style="padding:10px 0;border-bottom:1px solid #f0ece4;font-size:16px;font-weight:700;color:#4a7c59;">€${(amount/100).toFixed(2)}</td></tr>
              <tr><td style="padding:10px 0;border-bottom:1px solid #f0ece4;font-size:12px;font-weight:700;color:#b5ada6;text-transform:uppercase;">Plan</td><td style="padding:10px 0;border-bottom:1px solid #f0ece4;font-size:14px;">${isPremium ? 'Premium (€149/yr)' : 'Standard (€79/yr)'}</td></tr>
              <tr><td style="padding:10px 0;border-bottom:1px solid #f0ece4;font-size:12px;font-weight:700;color:#b5ada6;text-transform:uppercase;">Event</td><td style="padding:10px 0;border-bottom:1px solid #f0ece4;font-size:14px;">${ev ? ev.title : 'Event #'+event_id}</td></tr>
              <tr><td style="padding:10px 0;border-bottom:1px solid #f0ece4;font-size:12px;font-weight:700;color:#b5ada6;text-transform:uppercase;">City</td><td style="padding:10px 0;border-bottom:1px solid #f0ece4;font-size:14px;">${ev ? ev.city + ', ' + ev.country : '—'}</td></tr>
              <tr><td style="padding:10px 0;font-size:12px;font-weight:700;color:#b5ada6;text-transform:uppercase;">Customer Email</td><td style="padding:10px 0;font-size:14px;">${customerEmail || '—'}</td></tr>
            </table>
            ${ev ? `<div style="margin-top:20px;text-align:center;"><a href="https://festmore.com/events/${ev.slug}" style="background:#e8470a;color:#fff;padding:12px 24px;border-radius:99px;text-decoration:none;font-weight:700;font-size:14px;">View Event →</a></div>` : ''}
          </div>
          <div style="background:#f2ede4;padding:16px 32px;border-radius:0 0 12px 12px;border:1px solid #e8e2d9;border-top:none;font-size:12px;color:#b5ada6;text-align:center;">
            ${new Date().toLocaleString('en-GB', { timeZone: 'Europe/Copenhagen' })}
          </div>
        </div>`
      );

      // Confirm to customer
      if (customerEmail) {
        await sendEmail(
          customerEmail,
          `Your event is live on Festmore! — ${ev ? ev.title : ''}`,
          `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
            <div style="background:#1a1612;padding:24px 32px;border-radius:12px 12px 0 0;">
              <div style="font-size:22px;color:#e8470a;font-weight:700;">Festmore</div>
            </div>
            <div style="background:#fff;padding:32px;border:1px solid #e8e2d9;">
              <h2 style="color:#1a1612;">Your event is now live! 🎉</h2>
              <p style="color:#3d3530;line-height:1.75;">Your event listing on Festmore is now live and visible to thousands of visitors across 11 countries.</p>
              <div style="background:#faf8f3;border-left:3px solid #e8470a;padding:16px 20px;border-radius:0 10px 10px 0;margin:20px 0;">
                <strong>${ev ? ev.title : ''}</strong><br/>
                <span style="color:#7a6f68;font-size:14px;">${ev ? ev.city + ' · ' + ev.date_display : ''}</span>
              </div>
              <p style="color:#3d3530;line-height:1.75;">Your listing is now:</p>
              <p>✅ Visible in search results<br/>✅ Indexed by Google<br/>✅ Featured in our newsletter<br/>✅ Visible to vendors who can apply</p>
              ${ev ? `<div style="text-align:center;margin-top:24px;"><a href="https://festmore.com/events/${ev.slug}" style="background:#e8470a;color:#fff;padding:12px 28px;border-radius:99px;text-decoration:none;font-weight:700;">View Your Listing →</a></div>` : ''}
            </div>
            <div style="background:#f2ede4;padding:16px 32px;border-radius:0 0 12px 12px;border:1px solid #e8e2d9;border-top:none;font-size:12px;color:#b5ada6;text-align:center;">
              Questions? Contact us at <a href="mailto:${process.env.EMAIL_USER}" style="color:#e8470a;">${process.env.EMAIL_USER}</a>
            </div>
          </div>`
        );
      }
    }

    // ── VENDOR PROFILE PAYMENT ──
    if (type === 'vendor_profile' && vendor_id) {
      db.prepare("UPDATE vendors SET status='active', payment_status='paid', verified=1 WHERE id=?")
        .run(parseInt(vendor_id));

      const vendor = db.prepare("SELECT * FROM vendors WHERE id=?").get(parseInt(vendor_id));

      // Notify YOU
      await sendEmail(
        process.env.EMAIL_USER,
        `💰 New Vendor Payment — €${(amount/100).toFixed(2)} — ${vendor ? vendor.business_name : 'Vendor #'+vendor_id}`,
        `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:#1a1612;padding:24px 32px;border-radius:12px 12px 0 0;">
            <div style="font-size:22px;color:#e8470a;font-weight:700;">Festmore</div>
            <div style="font-size:12px;color:rgba(255,255,255,.4);">New Vendor Payment 💰</div>
          </div>
          <div style="background:#fff;padding:32px;border:1px solid #e8e2d9;">
            <h2 style="color:#1a1612;font-size:20px;margin-bottom:20px;">🏪 New Vendor Profile Payment!</h2>
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:10px 0;border-bottom:1px solid #f0ece4;font-size:12px;font-weight:700;color:#b5ada6;text-transform:uppercase;width:140px;">Amount</td><td style="padding:10px 0;border-bottom:1px solid #f0ece4;font-size:16px;font-weight:700;color:#4a7c59;">€${(amount/100).toFixed(2)}</td></tr>
              <tr><td style="padding:10px 0;border-bottom:1px solid #f0ece4;font-size:12px;font-weight:700;color:#b5ada6;text-transform:uppercase;">Business</td><td style="padding:10px 0;border-bottom:1px solid #f0ece4;font-size:14px;">${vendor ? vendor.business_name : '—'}</td></tr>
              <tr><td style="padding:10px 0;border-bottom:1px solid #f0ece4;font-size:12px;font-weight:700;color:#b5ada6;text-transform:uppercase;">Category</td><td style="padding:10px 0;border-bottom:1px solid #f0ece4;font-size:14px;">${vendor ? vendor.category : '—'}</td></tr>
              <tr><td style="padding:10px 0;border-bottom:1px solid #f0ece4;font-size:12px;font-weight:700;color:#b5ada6;text-transform:uppercase;">Location</td><td style="padding:10px 0;border-bottom:1px solid #f0ece4;font-size:14px;">${vendor ? vendor.city + ', ' + vendor.country : '—'}</td></tr>
              <tr><td style="padding:10px 0;font-size:12px;font-weight:700;color:#b5ada6;text-transform:uppercase;">Customer Email</td><td style="padding:10px 0;font-size:14px;">${customerEmail || '—'}</td></tr>
            </table>
            <div style="margin-top:20px;text-align:center;">
              <a href="https://festmore.com/admin/vendors" style="background:#e8470a;color:#fff;padding:12px 24px;border-radius:99px;text-decoration:none;font-weight:700;font-size:14px;">View in Admin →</a>
            </div>
          </div>
          <div style="background:#f2ede4;padding:16px 32px;border-radius:0 0 12px 12px;border:1px solid #e8e2d9;border-top:none;font-size:12px;color:#b5ada6;text-align:center;">
            ${new Date().toLocaleString('en-GB', { timeZone: 'Europe/Copenhagen' })}
          </div>
        </div>`
      );

      // Confirm to vendor
      if (customerEmail) {
        await sendEmail(
          customerEmail,
          `Welcome to Festmore Vendors! Your profile is live ✅`,
          `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
            <div style="background:#1a1612;padding:24px 32px;border-radius:12px 12px 0 0;">
              <div style="font-size:22px;color:#e8470a;font-weight:700;">Festmore</div>
            </div>
            <div style="background:#fff;padding:32px;border:1px solid #e8e2d9;">
              <h2 style="color:#1a1612;">You're a Verified Vendor! ✅</h2>
              <p style="color:#3d3530;line-height:1.75;">Welcome to Festmore, ${vendor ? vendor.business_name : ''}! Your vendor profile is now live and verified.</p>
              <div style="background:#faf8f3;border-left:3px solid #4a7c59;padding:16px 20px;border-radius:0 10px 10px 0;margin:20px 0;">
                <strong>${vendor ? vendor.business_name : ''}</strong><br/>
                <span style="color:#7a6f68;font-size:14px;">${vendor ? vendor.category + ' · ' + vendor.city : ''}</span><br/>
                <span style="color:#4a7c59;font-size:13px;font-weight:700;">✅ Verified Vendor</span>
              </div>
              <p style="color:#3d3530;">Your profile is now:</p>
              <p>✅ Visible to event organisers across 11 countries<br/>✅ Featured with Verified badge<br/>✅ Included in weekly newsletter<br/>✅ You can now apply to events with vendor spots</p>
              <div style="text-align:center;margin-top:24px;">
                <a href="https://festmore.com/events" style="background:#e8470a;color:#fff;padding:12px 28px;border-radius:99px;text-decoration:none;font-weight:700;">Browse Events to Apply →</a>
              </div>
            </div>
            <div style="background:#f2ede4;padding:16px 32px;border-radius:0 0 12px 12px;border:1px solid #e8e2d9;border-top:none;font-size:12px;color:#b5ada6;text-align:center;">
              Questions? <a href="mailto:${process.env.EMAIL_USER}" style="color:#e8470a;">${process.env.EMAIL_USER}</a>
            </div>
          </div>`
        );
      }
    }

    db.prepare("UPDATE payments SET status='completed' WHERE stripe_session_id=?").run(session.id);
  }

  res.json({ received: true });
});

module.exports = router;