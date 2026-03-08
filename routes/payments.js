// routes/payments.js — Stripe webhook handler
const express = require('express');
const router  = express.Router();
const db      = require('../db');
const stripe  = require('stripe')(process.env.STRIPE_SECRET_KEY||'sk_test_placeholder');

// Stripe webhook — confirms payments automatically
router.post('/webhook', express.raw({type:'application/json'}), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET||'');
  } catch { return res.status(400).send('Webhook error'); }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { type, event_id, vendor_id } = session.metadata||{};
    if (type==='event_listing' && event_id) {
      db.prepare("UPDATE events SET status='active',payment_status='paid' WHERE id=?").run(parseInt(event_id));
    }
    if (type==='vendor_profile' && vendor_id) {
      db.prepare("UPDATE vendors SET status='active',payment_status='paid',verified=1 WHERE id=?").run(parseInt(vendor_id));
    }
    db.prepare("UPDATE payments SET status='completed' WHERE stripe_session_id=?").run(session.id);
  }
  res.json({received:true});
});

module.exports = router;
