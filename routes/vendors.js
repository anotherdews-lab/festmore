// routes/vendors.js
const express = require('express');
const router  = express.Router();
const db      = require('../db');
const stripe  = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

router.get('/', (req, res) => {
  const vendors = db.prepare("SELECT * FROM vendors WHERE status='active' ORDER BY premium DESC, rating DESC LIMIT 24").all();
  res.send(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Vendors | Festmore</title><link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet"/><link rel="stylesheet" href="/css/main.css"/></head><body>
  <nav class="main-nav"><div class="nav-inner"><a href="/" class="logo"><span class="logo-fest">Fest</span><span class="logo-more">more</span><span class="logo-dot"></span></a><div class="nav-right"><a href="/vendors/register" class="btn btn-primary">+ Become a Vendor</a></div></div></nav>
  <div class="page-hero-small"><div class="container"><h1>🏪 Verified Vendors</h1><p>${vendors.length} vendors ready to join your event</p></div></div>
  <div class="container" style="padding:40px 0;">
  <div class="ad-placeholder" style="margin-bottom:28px;">📢 Google AdSense</div>
  <div class="events-grid">
  ${vendors.map(v=>`<div style="background:#fff;border:1px solid var(--border);border-radius:16px;overflow:hidden;cursor:pointer;transition:all .3s;" onmouseover="this.style.transform='translateY(-4px)';this.style.boxShadow='0 20px 44px rgba(26,22,18,.18)'" onmouseout="this.style.transform='';this.style.boxShadow=''">
    <div style="height:160px;overflow:hidden;background:var(--ivory);"><img src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=70" alt="${v.business_name}" style="width:100%;height:100%;object-fit:cover;" loading="lazy"/></div>
    <div style="padding:16px;">
      ${v.premium?'<span class="badge badge-feat" style="margin-bottom:8px;display:inline-block;">💎 Premium</span>':''}
      <div style="font-size:10px;color:var(--ink4);font-weight:700;letter-spacing:.8px;text-transform:uppercase;margin-bottom:4px;">${v.category}</div>
      <h3 style="font-family:'Playfair Display',serif;font-size:16px;font-weight:700;margin-bottom:6px;">${v.business_name}</h3>
      <div style="font-size:12px;color:var(--ink3);margin-bottom:8px;">📍 ${v.city}</div>
      <div style="font-size:12px;color:var(--ink3);">🎪 ${v.events_attended} events · ⭐ ${v.rating||'New'}</div>
    </div>
  </div>`).join('')}
  ${vendors.length===0?'<p style="color:var(--ink3);padding:40px 0;">No vendors yet. <a href="/vendors/register" style="color:var(--flame);">Be the first!</a></p>':''}
  </div>
  <div style="margin-top:48px;background:var(--ink);border-radius:20px;padding:44px;text-align:center;color:#fff;">
    <h2 style="font-size:30px;font-weight:800;margin-bottom:12px;">Are you a vendor?</h2>
    <p style="color:rgba(255,255,255,0.6);margin-bottom:24px;max-width:500px;margin-left:auto;margin-right:auto;">Create your verified vendor profile and start applying to festivals, markets and events across Europe and beyond.</p>
    <a href="/vendors/register" class="btn btn-primary btn-lg">Create Vendor Profile — €49/year →</a>
  </div>
  </div>
  <footer><div class="footer-bottom" style="border-top:1px solid rgba(255,255,255,0.08);"><span>© 2025 Festmore.com</span></div></footer>
  </body></html>`);
});

router.get('/register', (req, res) => {
  res.send(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Become a Vendor — Festmore</title><link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet"/><link rel="stylesheet" href="/css/main.css"/></head><body>
  <nav class="main-nav"><div class="nav-inner"><a href="/" class="logo"><span class="logo-fest">Fest</span><span class="logo-more">more</span></a></div></nav>
  <div class="page-hero-small" style="background:linear-gradient(135deg,#4a7c59,#2d5a3d);"><div class="container"><h1 style="color:#fff;">🏪 Become a Verified Vendor</h1><p style="color:rgba(255,255,255,0.8);">Create your profile and apply to events — €49/year</p></div></div>
  <div class="container" style="padding:40px 0;max-width:700px;">
  <div class="form-card">
    <div class="form-card-header"><h2>Vendor Profile</h2><div class="price-badge" style="background:#4a7c59;">€49 / year</div></div>
    <form method="POST" action="/vendors/register">
      <div class="form-grid">
        <div class="form-group full"><label class="form-label">Business Name *</label><input class="form-input" type="text" name="business_name" required placeholder="e.g. Bratwurst Brothers"/></div>
        <div class="form-group"><label class="form-label">Category *</label>
          <select class="form-input" name="category" required>
            <option value="">Select…</option>
            ${['Food & Drinks','Artisan Crafts','Technology','Event Decor','Entertainment','Photography','Kids Activities','Fashion & Apparel','Art & Prints','Live Music','Retail','Services'].map(c=>`<option>${c}</option>`).join('')}
          </select>
        </div>
        <div class="form-group"><label class="form-label">Country *</label>
          <select class="form-input" name="country" required>
            ${Object.entries({BE:'Belgium',CN:'China',DK:'Denmark',FR:'France',DE:'Germany',NL:'Netherlands',PL:'Poland',SE:'Sweden',AE:'UAE',GB:'United Kingdom',US:'USA'}).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}
          </select>
        </div>
        <div class="form-group"><label class="form-label">City *</label><input class="form-input" type="text" name="city" required placeholder="Your city"/></div>
        <div class="form-group"><label class="form-label">Your Email *</label><input class="form-input" type="email" name="email" required/></div>
        <div class="form-group full"><label class="form-label">About Your Business *</label><textarea class="form-input" name="description" rows="4" placeholder="What do you offer? What events are you looking for?"></textarea></div>
        <div class="form-group"><label class="form-label">Website</label><input class="form-input" type="url" name="website" placeholder="https://"/></div>
        <div class="form-group"><label class="form-label">Events Attended So Far</label><input class="form-input" type="number" name="events_attended" placeholder="0" value="0"/></div>
      </div>
      <div class="form-submit-area">
        <div class="price-summary"><strong>Vendor Profile: €49/year</strong><span>Verified badge · Unlimited event applications</span></div>
        <button type="submit" class="btn btn-primary btn-xl" style="max-width:280px;">Continue to Payment →</button>
      </div>
    </form>
  </div>
  </div>
  <footer><div class="footer-bottom" style="border-top:1px solid rgba(255,255,255,0.08);"><span>© 2025 Festmore.com</span></div></footer>
  </body></html>`);
});

router.post('/register', async (req, res) => {
  const { business_name, category, city, country, email, description, website, events_attended } = req.body;
  const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9\s]/g,'').replace(/\s+/g,'-');
  let slug = slugify(business_name+'-'+city);
  let i=1; while(db.prepare('SELECT id FROM vendors WHERE slug=?').get(slug)){slug=slugify(business_name+'-'+city)+'-'+i++;}
  const result = db.prepare(`INSERT INTO vendors (business_name,slug,category,city,country,email,description,website,events_attended,status,payment_status) VALUES (?,?,?,?,?,?,?,?,?,'pending','unpaid')`).run(business_name,slug,category,city,country,email||'',description||'',website||'',parseInt(events_attended)||0);
  const vendorId = result.lastInsertRowid;
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types:['card'],
      line_items:[{price_data:{currency:'eur',product_data:{name:`Festmore Vendor Profile — ${business_name}`,description:'Annual vendor profile on Festmore.com'},unit_amount:parseInt(process.env.PRICE_VENDOR_YEARLY)||4900},quantity:1}],
      mode:'payment',
      success_url:`${process.env.SITE_URL||'http://localhost:3000'}/vendors/payment-success?vendor_id=${vendorId}`,
      cancel_url:`${process.env.SITE_URL||'http://localhost:3000'}/vendors/register?error=Payment cancelled`,
      metadata:{vendor_id:String(vendorId),type:'vendor_profile'},
      customer_email: email||undefined,
    });
    res.redirect(session.url);
  } catch(err) {
    console.error('Stripe error:',err.message);
    res.redirect('/vendors/register?error=Payment unavailable. Please contact us.');
  }
});

router.get('/payment-success', (req,res) => {
  const { vendor_id } = req.query;
  if(vendor_id){ db.prepare("UPDATE vendors SET payment_status='paid',status='active',verified=1 WHERE id=?").run(parseInt(vendor_id)); }
  res.send(`<!DOCTYPE html><html><head><title>Welcome to Festmore!</title><link rel="stylesheet" href="/css/main.css"/></head><body><div style="max-width:600px;margin:80px auto;text-align:center;padding:0 24px;"><div style="font-size:64px;margin-bottom:16px;">🎉</div><h1 style="font-family:'Playfair Display',serif;font-size:36px;margin-bottom:12px;">You're now a Verified Vendor!</h1><p style="color:#7a6f68;font-size:16px;margin-bottom:28px;">Your profile is now live on Festmore. Event organisers can find you and you can apply to events.</p><a href="/vendors" style="background:#e8470a;color:#fff;padding:14px 32px;border-radius:99px;text-decoration:none;font-weight:700;">View Your Profile →</a></div></body></html>`);
});

module.exports = router;
