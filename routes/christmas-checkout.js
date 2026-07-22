// routes/christmas-checkout.js
// Handles /christmas/checkout and /christmas/success
// Kept separate to avoid template literal conflicts with christmas.js

const express = require('express');
const router = express.Router();

const STRIPE_PRICE_XMAS = 'price_1Tw2K6R9UmtyGci31gLvNOA5';

// ── POST /christmas/checkout — create Stripe session ─────────────
router.post('/checkout', async (req, res) => {
  const { event_title, event_city, event_country, organiser_email, organiser_name } = req.body;
  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: STRIPE_PRICE_XMAS, quantity: 1 }],
      mode: 'payment',
      success_url: (process.env.SITE_URL || 'https://festmore.com') + '/christmas/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: (process.env.SITE_URL || 'https://festmore.com') + '/christmas?cancelled=1',
      customer_email: organiser_email,
      metadata: {
        event_title: event_title || '',
        event_city: event_city || '',
        event_country: event_country || '',
        organiser_email: organiser_email || '',
        organiser_name: organiser_name || '',
        type: 'christmas_featured_2026'
      }
    });
    res.redirect(303, session.url);
  } catch(e) {
    console.log('Christmas checkout error:', e.message);
    res.redirect('/christmas?error=Payment+failed+Please+try+again');
  }
});

// ── GET /christmas/success — confirmation page ────────────────────
router.get('/success', async (req, res) => {
  const { session_id } = req.query;
  let organiserName = 'there', eventTitle = 'your market', organiserEmail = '';

  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(session_id);
    organiserName = session.metadata?.organiser_name || 'there';
    eventTitle    = session.metadata?.event_title    || 'your market';
    organiserEmail = session.metadata?.organiser_email || '';

    // Send emails
    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Confirmation to organiser
    if (organiserEmail) {
      await resend.emails.send({
        from: 'Festmore <hello@festmore.com>',
        to: organiserEmail,
        subject: 'Your Christmas Market is now Featured on Festmore! 🎄',
        html: '<p>Hi ' + organiserName + ',</p>'
          + '<p>Payment confirmed — <strong>' + eventTitle + '</strong> is now a Featured Christmas Market listing on Festmore.</p>'
          + '<p><b>What happens next:</b><br/>'
          + '⭐ Featured badge on your listing<br/>'
          + '🏠 Homepage placement on Festmore<br/>'
          + '📧 Newsletter to 500+ subscribers<br/>'
          + '🏪 Vendors can apply directly to your market</p>'
          + '<p>You paid the founding price of <b>€29</b> for the full 2026 Christmas season. From 2027 the price is €79.</p>'
          + '<p>To complete your listing with photos, full description and dates, please reply to this email and we will set everything up personally.</p>'
          + '<p>View the Christmas Hub: <a href="https://festmore.com/christmas">festmore.com/christmas</a></p>'
          + '<p>Best regards,<br/>The Festmore Team<br/>hello@festmore.com</p>'
      });
    }

    // Admin notification
    await resend.emails.send({
      from: 'Festmore <hello@festmore.com>',
      to: 'anotherdews@gmail.com',
      subject: '💰 New Christmas Market Payment — ' + eventTitle,
      html: '<p><b>' + eventTitle + '</b> — €29 Christmas Featured listing paid.</p>'
        + '<p>Organiser: ' + organiserName + ' · ' + organiserEmail + '</p>'
        + '<p>City: ' + (session.metadata?.event_city || '') + ', ' + (session.metadata?.event_country || '') + '</p>'
        + '<p>Action needed: Create/update their event listing on Festmore and mark as Featured.</p>'
    });

  } catch(e) {
    console.log('Christmas success error:', e.message);
  }

  // Success page
  res.send('<!DOCTYPE html><html><head><meta charset="UTF-8"/>'
    + '<title>Payment Confirmed — Festmore Christmas Markets</title>'
    + '<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Syne:wght@400;600;700&display=swap" rel="stylesheet"/>'
    + '<style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:Syne,sans-serif;background:#06200f;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px;}</style>'
    + '</head><body>'
    + '<div style="background:#fff;border-radius:24px;padding:48px;max-width:520px;width:100%;text-align:center;">'
    + '<div style="font-size:64px;margin-bottom:16px;">🎄</div>'
    + '<h1 style="font-family:Playfair Display,serif;font-size:28px;color:#06200f;margin-bottom:12px;">You are Featured!</h1>'
    + '<p style="font-size:15px;color:#666;line-height:1.7;margin-bottom:24px;"><strong style="color:#06200f;">' + eventTitle + '</strong> is now a Featured Christmas Market on Festmore. A confirmation email has been sent to ' + organiserEmail + '.</p>'
    + '<div style="background:#f5f0e8;border-radius:12px;padding:20px;margin-bottom:24px;">'
    + '<p style="font-size:13px;color:#888;margin-bottom:4px;">Founding price paid</p>'
    + '<p style="font-size:36px;font-weight:800;color:#c41e3a;font-family:Playfair Display,serif;">€29 ✓</p>'
    + '<p style="font-size:12px;color:#999;margin-top:4px;">2026 Christmas season · From 2027 the price is €79</p>'
    + '</div>'
    + '<a href="/christmas" style="display:inline-block;background:#c41e3a;color:#fff;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:700;text-decoration:none;">View Christmas Hub →</a>'
    + '<p style="font-size:13px;color:#999;margin-top:16px;">Reply to the confirmation email to complete your listing with photos and description.</p>'
    + '</div></body></html>');
});

module.exports = router;
