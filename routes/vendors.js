// routes/vendors.js — PROFESSIONAL REBUILD
// Rich vendor profiles, photo upload, detailed forms
// Payment system INTACT — do not modify Stripe section

const express = require('express');
const router  = express.Router();
const db      = require('../db');
const stripe  = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_live_placeholder');

const FLAGS = {
  BE:'🇧🇪',CN:'🇨🇳',DK:'🇩🇰',FR:'🇫🇷',DE:'🇩🇪',NL:'🇳🇱',PL:'🇵🇱',SE:'🇸🇪',AE:'🇦🇪',GB:'🇬🇧',US:'🇺🇸',
  NO:'🇳🇴',FI:'🇫🇮',AT:'🇦🇹',CH:'🇨🇭',IT:'🇮🇹',ES:'🇪🇸',PT:'🇵🇹',IE:'🇮🇪',CZ:'🇨🇿',HU:'🇭🇺',
  GR:'🇬🇷',HR:'🇭🇷',IN:'🇮🇳',TH:'🇹🇭',JP:'🇯🇵',
};
const COUNTRY_NAMES = {
  BE:'Belgium',CN:'China',DK:'Denmark',FR:'France',DE:'Germany',NL:'Netherlands',PL:'Poland',SE:'Sweden',
  AE:'UAE',GB:'United Kingdom',US:'USA',NO:'Norway',FI:'Finland',AT:'Austria',CH:'Switzerland',IT:'Italy',
  ES:'Spain',PT:'Portugal',IE:'Ireland',CZ:'Czech Republic',HU:'Hungary',GR:'Greece',HR:'Croatia',
  IN:'India',TH:'Thailand',JP:'Japan',
};
const CATS = ['Food & Drinks','Artisan Crafts','Technology','Event Decor','Entertainment','Photography',
  'Kids Activities','Fashion & Apparel','Art & Prints','Live Music','Retail','Services'];
const EVENT_TYPES = ['Festivals','Christmas Markets','Street Markets','Corporate Events','Weddings',
  'Food Markets','Flea Markets','Trade Fairs','Private Parties','Outdoor Events','Indoor Events','All Events'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const CAT_IMGS = {
  'Food & Drinks':'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80',
  'Artisan Crafts':'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=800&q=80',
  'Technology':'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
  'Event Decor':'https://images.unsplash.com/photo-1478146059778-26028b07395a?w=800&q=80',
  'Entertainment':'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
  'Photography':'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&q=80',
  'Kids Activities':'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80',
  'Fashion & Apparel':'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
  'Art & Prints':'https://images.unsplash.com/photo-1580136579312-94651dfd596d?w=800&q=80',
  'Live Music':'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80',
  'Retail':'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800&q=80',
  'Services':'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
};

function vendorImg(v) {
  if (v.photos) { try { const p=JSON.parse(v.photos); if(p.length) return p[0]; } catch(e){} }
  return v.image_url || CAT_IMGS[v.category] || CAT_IMGS['Food & Drinks'];
}

// ─────────────────────────────────────
// VENDORS LISTING
// ─────────────────────────────────────
router.get('/', (req, res) => {
  const { category='ALL', country='ALL', q='' } = req.query;
  let where = ["status='active'"], params = [];
  if (category !== 'ALL') { where.push("category=?"); params.push(category); }
  if (country !== 'ALL')  { where.push("country=?");  params.push(country); }
  if (q) { where.push("(business_name LIKE ? OR description LIKE ? OR city LIKE ?)"); params.push(`%${q}%`,`%${q}%`,`%${q}%`); }
  const vendors       = db.prepare(`SELECT * FROM vendors WHERE ${where.join(' AND ')} ORDER BY premium DESC, verified DESC, rating DESC LIMIT 96`).all(...params);
  const countryCounts = db.prepare(`SELECT country, COUNT(*) as count FROM vendors WHERE status='active' GROUP BY country ORDER BY count DESC`).all();
  const totalVendors  = db.prepare(`SELECT COUNT(*) as n FROM vendors WHERE status='active'`).get().n;
  res.send(renderVendorList({ vendors, countryCounts, totalVendors, category, country, q, user: req.session.user }));
});

// ─────────────────────────────────────
// VENDOR PROFILE
// ─────────────────────────────────────
router.get('/profile/:id', (req, res) => {
  const vendor = db.prepare("SELECT * FROM vendors WHERE id=? AND status='active'").get(parseInt(req.params.id));
  if (!vendor) return res.redirect('/vendors');
  try { db.prepare("UPDATE vendors SET views=views+1 WHERE id=?").run(vendor.id); } catch(e){}
  const related = db.prepare("SELECT * FROM vendors WHERE status='active' AND category=? AND id!=? ORDER BY verified DESC LIMIT 4").all(vendor.category, vendor.id);
  res.send(renderVendorProfile(vendor, related, req.session.user));
});

// ─────────────────────────────────────
// REGISTER — GET
// ─────────────────────────────────────
router.get('/register', (req, res) => {
  res.send(renderRegisterPage(req.session.user, req.query.success, req.query.error));
});

// ─────────────────────────────────────
// REGISTER — POST — PAYMENT INTACT
// ─────────────────────────────────────
router.post('/register', async (req, res) => {
  const {
    business_name, category, city, country, description, website, phone, email, founded_year,
    tagline, price_range, min_event_size, max_event_size, space_required, needs_electricity,
    needs_water, travel_distance, what_we_offer, looking_for, instagram, facebook, tiktok,
    video_url, languages, certifications,
  } = req.body;

  // Handle checkbox arrays
  const event_types_wanted = req.body.event_types_wanted
    ? (Array.isArray(req.body.event_types_wanted) ? req.body.event_types_wanted : [req.body.event_types_wanted])
    : [];
  const availability = req.body.availability
    ? (Array.isArray(req.body.availability) ? req.body.availability : [req.body.availability])
    : [];

  if (!business_name || !category || !city || !country || !email) {
    return res.redirect('/vendors/register?error=Please fill in all required fields including email');
  }

  const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  let slug = slugify(business_name + '-' + city);
  let i = 1;
  while (db.prepare('SELECT id FROM vendors WHERE slug=?').get(slug)) { slug = slugify(business_name+'-'+city)+'-'+i++; }

  // Store extra fields as JSON in tags column
  const extra = JSON.stringify({
    tagline, price_range, min_event_size, max_event_size, space_required,
    needs_electricity, needs_water, travel_distance, what_we_offer, looking_for,
    event_types_wanted, availability, instagram, facebook, tiktok, video_url,
    languages, certifications,
  });

  const result = db.prepare(`
    INSERT INTO vendors (
      business_name,slug,category,city,country,description,website,
      phone,email,founded_year,status,payment_status,verified,premium,tags
    ) VALUES (?,?,?,?,?,?,?,?,?,?,'pending','unpaid',0,0,?)
  `).run(
    business_name,slug,category,city,country,
    description||'',website||'',phone||'',email||'',
    parseInt(founded_year)||0, extra
  );

  const vendorId = result.lastInsertRowid;

  // ── STRIPE — DO NOT MODIFY ──
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'Festmore Verified Vendor Profile',
            description: `Annual verified vendor profile for ${business_name} on Festmore.com`,
          },
          unit_amount: parseInt(process.env.PRICE_VENDOR_YEARLY)||4900,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: 'https://festmore.com/vendors/payment-success?vendor_id=' + vendorId,
      cancel_url: 'https://festmore.com/vendors/register?error=Payment+cancelled',
      metadata: { vendor_id: String(vendorId), type: 'vendor_profile' },
      customer_email: email || undefined,
    });
    db.prepare(`INSERT OR IGNORE INTO payments (stripe_session_id,amount,type,status,reference_id) VALUES (?,?,?,?,?)`)
      .run(session.id, parseInt(process.env.PRICE_VENDOR_YEARLY)||4900, 'vendor_profile', 'pending', vendorId);
    res.redirect(session.url);
  } catch (err) {
    console.error('Stripe vendor error:', err.message);
    res.redirect('/vendors/register?error=Payment+unavailable.+Please+try+again.');
  }
});

// ─────────────────────────────────────
// PAYMENT SUCCESS — DO NOT MODIFY
// ─────────────────────────────────────
router.get('/payment-success', (req, res) => {
  const { vendor_id } = req.query;
  if (vendor_id) {
    try {
      db.prepare("UPDATE vendors SET status='active', payment_status='paid', verified=1 WHERE id=?").run(parseInt(vendor_id));
      db.prepare("UPDATE payments SET status='completed' WHERE reference_id=?").run(parseInt(vendor_id));
      console.log('✅ Vendor activated: ID', vendor_id);
    } catch(err) {
      console.error('❌ Vendor activation error:', err.message);
    }
  }
  const vendor = vendor_id ? db.prepare("SELECT * FROM vendors WHERE id=?").get(parseInt(vendor_id)) : null;
  res.send(`<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Welcome to Festmore!</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="/css/main.css"/>
</head><body style="background:var(--cream);min-height:100vh;display:flex;align-items:center;justify-content:center;">
<div style="max-width:600px;margin:0 auto;text-align:center;padding:48px 32px;">
  <div style="font-size:72px;margin-bottom:20px;">🎉</div>
  <h1 style="font-family:'DM Serif Display',serif;font-size:40px;font-weight:400;margin-bottom:12px;">You're a Verified Vendor!</h1>
  <p style="color:var(--ink3);font-size:16px;line-height:1.75;margin-bottom:28px;">Your professional profile is now live on Festmore. Event organisers worldwide can find and contact you directly.</p>
  ${vendor?`
  <div style="background:#fff;border:1px solid var(--border);border-radius:20px;padding:24px;margin-bottom:24px;text-align:left;">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
      <div style="width:48px;height:48px;border-radius:12px;background:var(--flame);display:flex;align-items:center;justify-content:center;font-size:20px;">🏪</div>
      <div><div style="font-size:18px;font-weight:700;">${vendor.business_name}</div><div style="font-size:13px;color:var(--ink3);">${vendor.city} · ${vendor.category}</div></div>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;">
      <span style="background:#dcfce7;color:#15803d;padding:4px 14px;border-radius:99px;font-size:12px;font-weight:700;">✅ Verified Profile</span>
      <span style="background:rgba(232,71,10,.08);color:var(--flame);padding:4px 14px;border-radius:99px;font-size:12px;font-weight:700;">🌍 Worldwide Visibility</span>
    </div>
  </div>
  <div style="background:var(--ivory);border:1px solid var(--border);border-radius:16px;padding:20px;margin-bottom:24px;text-align:left;">
    <h3 style="font-size:15px;font-weight:700;margin-bottom:12px;">What's next?</h3>
    ${['Go to your dashboard and add photos to your profile','Browse events with available vendor spots','Apply directly to festivals and markets','Get discovered by event organisers worldwide'].map(s=>`<div style="display:flex;align-items:center;gap:8px;padding:5px 0;font-size:13px;color:var(--ink2);">✅ ${s}</div>`).join('')}
  </div>`:''}
  <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
    ${vendor?`<a href="/vendors/profile/${vendor.id}" class="btn btn-primary btn-lg">View Your Profile →</a>`:''}
    <a href="/dashboard" class="btn btn-outline btn-lg">Go to Dashboard →</a>
  </div>
</div></body></html>`);
});

// STRIPE WEBHOOK — activates vendor even if redirect fails
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch(err) {
    console.error('Webhook error:', err.message);
    return res.status(400).send('Webhook Error');
  }
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const vendorId = session.metadata?.vendor_id;
    if (vendorId && session.metadata?.type === 'vendor_profile') {
      db.prepare("UPDATE vendors SET status='active', payment_status='paid', verified=1 WHERE id=?").run(parseInt(vendorId));
      db.prepare("UPDATE payments SET status='completed' WHERE reference_id=?").run(parseInt(vendorId));
      console.log('✅ Vendor activated via webhook: ID', vendorId);
    }
  }
  res.json({received: true});
});

module.exports = router;

// ═══════════════════════
// RENDER FUNCTIONS
// ═══════════════════════

function renderVendorList({ vendors, countryCounts, totalVendors, category, country, q, user }) {
  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Verified Event Vendors Worldwide | Festmore</title>
<meta name="description" content="Browse ${totalVendors}+ verified vendors for festivals, markets and events. Food vendors, artisans, photographers and more worldwide."/>
<meta name="robots" content="index,follow"/>
<link rel="canonical" href="https://festmore.com/vendors"/>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/>
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2486135003689222" crossorigin="anonymous"></script>
<link rel="stylesheet" href="/css/main.css"/>
<style>
.vendor-hero{background:#0a0a0a;padding:72px 0;position:relative;overflow:hidden;}
.vendor-hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 60% 80% at 80% 50%,rgba(74,124,89,.2) 0%,transparent 70%);}
.country-tabs{background:#fff;border-bottom:2px solid var(--border);position:sticky;top:0;z-index:100;box-shadow:0 2px 12px rgba(26,22,18,.06);}
.country-tabs-inner{max-width:1440px;margin:0 auto;padding:0 40px;display:flex;overflow-x:auto;scrollbar-width:none;}
.country-tabs-inner::-webkit-scrollbar{display:none;}
.country-tab{display:flex;align-items:center;gap:8px;padding:16px 22px;font-size:13px;font-weight:600;color:var(--ink3);border-bottom:3px solid transparent;margin-bottom:-2px;white-space:nowrap;text-decoration:none;transition:all .2s;flex-shrink:0;}
.country-tab.active{color:var(--flame);border-bottom-color:var(--flame);}
.tab-count{background:var(--ivory);color:var(--ink4);font-size:10px;font-weight:700;padding:2px 7px;border-radius:99px;}
.country-tab.active .tab-count{background:rgba(232,71,10,.1);color:var(--flame);}
.vendors-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:22px;}
.vcard{background:#fff;border:1px solid var(--border);border-radius:20px;overflow:hidden;transition:all .25s;cursor:pointer;display:flex;flex-direction:column;}
.vcard:hover{border-color:var(--flame);box-shadow:0 20px 60px rgba(26,22,18,.1);transform:translateY(-4px);}
.vcard-img{height:210px;position:relative;overflow:hidden;flex-shrink:0;}
.vcard-img img{width:100%;height:100%;object-fit:cover;transition:transform .4s;}
.vcard:hover .vcard-img img{transform:scale(1.05);}
.vcard-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(26,22,18,.7) 0%,transparent 60%);}
.vcard-country{position:absolute;top:12px;left:12px;background:rgba(255,255,255,.95);backdrop-filter:blur(8px);border-radius:99px;padding:4px 10px;font-size:12px;font-weight:700;}
.vcard-badges{position:absolute;top:12px;right:12px;display:flex;flex-direction:column;gap:4px;align-items:flex-end;}
.vcard-price{position:absolute;bottom:12px;right:12px;background:rgba(26,22,18,.8);color:#fff;padding:3px 10px;border-radius:99px;font-size:11px;font-weight:700;}
.vcard-body{padding:20px;flex:1;display:flex;flex-direction:column;}
.vcard-cat{font-size:11px;font-weight:700;color:var(--flame);text-transform:uppercase;letter-spacing:.8px;margin-bottom:5px;}
.vcard-name{font-family:'DM Serif Display',serif;font-size:20px;font-weight:400;color:var(--ink);margin-bottom:4px;line-height:1.2;}
.vcard-tagline{font-size:13px;color:var(--ink3);font-style:italic;margin-bottom:6px;}
.vcard-loc{font-size:13px;color:var(--ink3);margin-bottom:10px;}
.vcard-desc{font-size:13px;color:var(--ink3);line-height:1.6;margin-bottom:12px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;flex:1;}
.vcard-tags{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:10px;}
.vcard-tag{background:var(--ivory);border:1px solid var(--border);color:var(--ink3);padding:2px 8px;border-radius:99px;font-size:10px;font-weight:600;}
.vcard-footer{display:flex;justify-content:space-between;align-items:center;padding-top:12px;border-top:1px solid var(--border);margin-top:auto;}
.badge-v{background:#dcfce7;color:#15803d;padding:3px 10px;border-radius:99px;font-size:11px;font-weight:700;}
.badge-u{background:#f1f5f9;color:#94a3b8;padding:3px 10px;border-radius:99px;font-size:11px;font-weight:700;}
@media(max-width:768px){.vendors-grid{grid-template-columns:1fr 1fr;}}
@media(max-width:480px){.vendors-grid{grid-template-columns:1fr;}}
</style>
</head><body>
${renderNav(user)}
<div class="vendor-hero">
  <div class="container" style="position:relative;max-width:900px;">
    <div style="display:inline-flex;align-items:center;gap:8px;background:rgba(74,124,89,.15);border:1px solid rgba(74,124,89,.3);color:#7ec99a;font-size:11px;font-weight:700;padding:4px 14px;border-radius:99px;margin-bottom:20px;letter-spacing:.8px;text-transform:uppercase;"><span style="width:5px;height:5px;border-radius:50%;background:#7ec99a;display:inline-block;"></span>${totalVendors}+ Verified Vendors Worldwide</div>
    <h1 style="font-family:'DM Serif Display',serif;font-size:clamp(32px,5vw,56px);font-weight:400;color:#fff;margin-bottom:16px;line-height:1.08;">Find the Perfect Vendor<br/>for <em style="color:#7ec99a;">Your Event</em></h1>
    <p style="color:rgba(255,255,255,.55);font-size:17px;line-height:1.75;max-width:560px;margin-bottom:32px;">Browse verified food vendors, artisans, entertainers, photographers and more — ready to join your festival or market worldwide.</p>
    <div style="display:flex;gap:12px;flex-wrap:wrap;">
      <a href="/vendors/register" style="display:inline-flex;align-items:center;gap:8px;background:#4a7c59;color:#fff;padding:13px 28px;border-radius:12px;font-size:14px;font-weight:700;text-decoration:none;">🏪 Become a Vendor — €49/yr</a>
      <a href="/events" style="display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.1);color:#fff;border:1.5px solid rgba(255,255,255,.2);padding:13px 28px;border-radius:12px;font-size:14px;font-weight:600;text-decoration:none;">🎪 Browse Events</a>
    </div>
  </div>
</div>
<div class="country-tabs"><div class="country-tabs-inner">
  <a href="/vendors${category!=='ALL'?'?category='+encodeURIComponent(category):''}" class="country-tab ${country==='ALL'?'active':''}">🌍 All <span class="tab-count">${totalVendors}</span></a>
  ${countryCounts.map(c=>`<a href="/vendors?country=${c.country}${category!=='ALL'?'&category='+encodeURIComponent(category):''}" class="country-tab ${country===c.country?'active':''}">${FLAGS[c.country]||'🌍'} ${COUNTRY_NAMES[c.country]||c.country} <span class="tab-count">${c.count}</span></a>`).join('')}
</div></div>
<div class="container" style="padding:40px 0;">
  <form method="GET" action="/vendors" style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-bottom:28px;">
    <input type="hidden" name="country" value="${country}"/>
    <div style="flex:2;min-width:200px;position:relative;"><span style="position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--ink4);">🔍</span><input type="text" name="q" value="${q}" placeholder="Search vendors, cities…" style="width:100%;background:#fff;border:1.5px solid var(--border2);border-radius:10px;padding:11px 14px 11px 40px;font-size:14px;outline:none;box-sizing:border-box;"/></div>
    <select name="category" style="background:#fff;border:1.5px solid var(--border2);border-radius:10px;padding:11px 16px;font-size:14px;outline:none;min-width:160px;"><option value="ALL" ${category==='ALL'?'selected':''}>All Categories</option>${CATS.map(c=>`<option value="${c}" ${category===c?'selected':''}>${c}</option>`).join('')}</select>
    <button type="submit" class="btn btn-primary" style="padding:11px 24px;">Search</button>
    ${q||category!=='ALL'?`<a href="/vendors?country=${country}" style="color:var(--ink3);font-size:13px;">Clear</a>`:''}
  </form>
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
    <div style="font-size:14px;color:var(--ink3);"><strong style="color:var(--ink);">${vendors.length}</strong> vendors${country!=='ALL'?` in <strong>${FLAGS[country]||''} ${COUNTRY_NAMES[country]||country}</strong>`:''}${category!=='ALL'?` — <strong>${category}</strong>`:''}</div>
    <a href="/vendors/register" class="btn btn-primary btn-sm">+ Add Your Business</a>
  </div>
  <ins class="adsbygoogle" style="display:block;margin-bottom:24px;" data-ad-client="ca-pub-2486135003689222" data-ad-format="auto" data-full-width-responsive="true"></ins>
  <script>(adsbygoogle=window.adsbygoogle||[]).push({});</script>
  ${vendors.length===0?`<div style="text-align:center;padding:80px 20px;background:#fff;border-radius:20px;border:1px solid var(--border);"><div style="font-size:48px;margin-bottom:16px;">🔍</div><h2 style="font-family:'DM Serif Display',serif;font-size:24px;font-weight:400;margin-bottom:8px;">No vendors found</h2><p style="color:var(--ink3);margin-bottom:24px;">Be the first vendor in this category!</p><a href="/vendors/register" class="btn btn-primary">Register as Vendor →</a></div>`:`<div class="vendors-grid">${vendors.map(v=>vendorCardHTML(v)).join('')}</div>`}
  <div style="margin-top:56px;background:var(--ink);border-radius:24px;padding:48px 40px;display:grid;grid-template-columns:1fr auto;gap:32px;align-items:center;">
    <div><h2 style="font-family:'DM Serif Display',serif;font-size:28px;font-weight:400;color:#fff;margin-bottom:10px;">Are you a vendor looking for events?</h2><p style="color:rgba(255,255,255,.5);font-size:15px;line-height:1.7;">Create your professional verified profile and get discovered worldwide. €49/year — less than €5/month.</p></div>
    <div style="display:flex;flex-direction:column;gap:10px;flex-shrink:0;"><a href="/vendors/register" class="btn btn-primary" style="text-align:center;white-space:nowrap;background:#4a7c59;">Create Vendor Profile →</a><a href="/events/pricing" style="text-align:center;color:rgba(255,255,255,.4);font-size:12px;text-decoration:none;">View all pricing →</a></div>
  </div>
</div>
${renderFooterSimple()}</body></html>`;
}

function vendorCardHTML(v) {
  const img=vendorImg(v), flag=FLAGS[v.country]||'🌍', cn=COUNTRY_NAMES[v.country]||v.country;
  let extra={};
  try{extra=JSON.parse(v.tags||'{}');}catch(e){}
  return `<article class="vcard" onclick="window.location='/vendors/profile/${v.id}'">
  <div class="vcard-img"><img src="${img}" alt="${v.business_name}" loading="lazy"/><div class="vcard-overlay"></div>
    <div class="vcard-country">${flag} ${cn}</div>
    <div class="vcard-badges">${v.premium?'<span style="background:linear-gradient(135deg,#c9922a,#e8b84b);color:#fff;padding:3px 10px;border-radius:99px;font-size:11px;font-weight:700;">⭐ Premium</span>':''}${v.verified?'<span class="badge-v">✅ Verified</span>':'<span class="badge-u">Unverified</span>'}</div>
    ${extra.price_range?`<div class="vcard-price">${extra.price_range}</div>`:''}
  </div>
  <div class="vcard-body">
    <div class="vcard-cat">${v.category}</div>
    <div class="vcard-name">${v.business_name}</div>
    ${extra.tagline?`<div class="vcard-tagline">"${extra.tagline}"</div>`:''}
    <div class="vcard-loc">📍 ${v.city}, ${cn}</div>
    ${v.description?`<div class="vcard-desc">${v.description}</div>`:''}
    ${extra.event_types_wanted&&extra.event_types_wanted.length?`<div class="vcard-tags">${(Array.isArray(extra.event_types_wanted)?extra.event_types_wanted:[extra.event_types_wanted]).slice(0,3).map(t=>`<span class="vcard-tag">🎪 ${t}</span>`).join('')}</div>`:''}
    <div class="vcard-footer">
      <div style="display:flex;gap:8px;">${v.events_attended?`<span style="font-size:12px;color:var(--ink4);">🎪 ${v.events_attended} events</span>`:''}${extra.travel_distance?`<span style="font-size:12px;color:var(--ink4);">✈️ ${extra.travel_distance}</span>`:''}</div>
      <span style="font-size:13px;color:var(--flame);font-weight:700;">View →</span>
    </div>
  </div>
</article>`;
}

function renderVendorProfile(v, related, user) {
  const img=vendorImg(v), flag=FLAGS[v.country]||'🌍', cn=COUNTRY_NAMES[v.country]||v.country;
  let extra={};
  try{extra=JSON.parse(v.tags||'{}');}catch(e){}
  let photos=[];
  try{photos=JSON.parse(v.photos||'[]');}catch(e){}

  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${v.business_name} — ${v.category} Vendor in ${v.city} | Festmore</title>
<meta name="description" content="${v.business_name} is a verified ${v.category} vendor in ${v.city}, ${cn}. ${(v.description||'').substring(0,130)}"/>
<meta property="og:title" content="${v.business_name} — Festmore Verified Vendor"/>
<meta property="og:image" content="${img}"/>
<script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@type":"LocalBusiness","name":v.business_name,"description":v.description||'',
"address":{"@type":"PostalAddress","addressLocality":v.city,"addressCountry":v.country},"url":v.website||`https://festmore.com/vendors/profile/${v.id}`,"image":img})}</script>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/>
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2486135003689222" crossorigin="anonymous"></script>
<link rel="stylesheet" href="/css/main.css"/>
<style>
.profile-hero{height:420px;position:relative;overflow:hidden;}
.profile-hero img{width:100%;height:100%;object-fit:cover;}
.profile-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(26,22,18,.95) 0%,rgba(26,22,18,.3) 70%,transparent 100%);}
.profile-content{position:absolute;bottom:0;left:0;right:0;padding:40px;}
.profile-grid{display:grid;grid-template-columns:1fr 360px;gap:40px;padding:48px 0;align-items:start;}
.pcard{background:#fff;border:1px solid var(--border);border-radius:20px;padding:28px;margin-bottom:16px;}
.pcard-title{font-family:'DM Serif Display',serif;font-size:20px;font-weight:400;margin-bottom:20px;padding-bottom:14px;border-bottom:2px solid var(--border);}
.pstat{display:flex;align-items:flex-start;gap:12px;padding:12px 0;border-bottom:1px solid var(--border);}
.pstat:last-child{border-bottom:none;}
.pstat-icon{width:36px;height:36px;border-radius:9px;background:rgba(232,71,10,.07);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;}
.pstat-label{font-size:11px;font-weight:700;color:var(--ink4);text-transform:uppercase;letter-spacing:.6px;margin-bottom:2px;}
.pstat-value{font-size:14px;color:var(--ink2);font-weight:500;}
.photo-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:16px;}
.photo-grid img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:10px;cursor:pointer;transition:transform .2s;}
.photo-grid img:hover{transform:scale(1.03);}
.info-pill{display:inline-flex;align-items:center;gap:4px;background:var(--ivory);border:1px solid var(--border);color:var(--ink2);padding:5px 12px;border-radius:99px;font-size:12px;font-weight:600;margin:3px;}
.social-link{display:inline-flex;align-items:center;gap:6px;background:var(--ivory);border:1px solid var(--border);color:var(--ink2);padding:8px 14px;border-radius:10px;font-size:13px;font-weight:600;text-decoration:none;transition:all .2s;margin:4px;}
.social-link:hover{border-color:var(--flame);color:var(--flame);}
@media(max-width:900px){.profile-grid{grid-template-columns:1fr;}.profile-content{padding:24px;}.photo-grid{grid-template-columns:repeat(2,1fr);}}
</style>
</head><body>
${renderNav(user)}
<div style="background:var(--ivory);border-bottom:1px solid var(--border);padding:12px 0;">
  <div class="container" style="font-size:13px;color:var(--ink3);">
    <a href="/" style="color:var(--ink3);text-decoration:none;">Home</a> →
    <a href="/vendors" style="color:var(--ink3);text-decoration:none;"> Vendors</a> →
    <a href="/vendors?country=${v.country}" style="color:var(--ink3);text-decoration:none;"> ${flag} ${cn}</a> →
    <strong style="color:var(--ink);"> ${v.business_name}</strong>
  </div>
</div>
<div class="profile-hero">
  <img src="${img}" alt="${v.business_name}"/>
  <div class="profile-overlay"></div>
  <div class="profile-content"><div class="container">
    <div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap;">
      <span style="background:rgba(255,255,255,.15);color:#fff;padding:4px 12px;border-radius:99px;font-size:12px;font-weight:700;">${v.category}</span>
      ${v.verified?'<span style="background:#dcfce7;color:#15803d;padding:4px 12px;border-radius:99px;font-size:12px;font-weight:700;">✅ Verified Vendor</span>':''}
      ${v.premium?'<span style="background:linear-gradient(135deg,#c9922a,#e8b84b);color:#fff;padding:4px 12px;border-radius:99px;font-size:12px;font-weight:700;">⭐ Premium</span>':''}
      ${extra.price_range?`<span style="background:rgba(255,255,255,.15);color:#fff;padding:4px 12px;border-radius:99px;font-size:12px;font-weight:700;">${extra.price_range}</span>`:''}
    </div>
    <h1 style="font-family:'DM Serif Display',serif;font-size:clamp(28px,4vw,52px);font-weight:400;color:#fff;margin-bottom:8px;">${v.business_name}</h1>
    ${extra.tagline?`<p style="color:rgba(255,255,255,.7);font-size:16px;font-style:italic;margin-bottom:10px;">"${extra.tagline}"</p>`:''}
    <div style="display:flex;gap:20px;flex-wrap:wrap;color:rgba(255,255,255,.65);font-size:14px;">
      <span>📍 ${flag} ${v.city}, ${cn}</span>
      ${v.events_attended?`<span>🎪 ${v.events_attended} events</span>`:''}
      ${v.founded_year?`<span>📅 Est. ${v.founded_year}</span>`:''}
      ${extra.travel_distance?`<span>✈️ ${extra.travel_distance}</span>`:''}
    </div>
  </div></div>
</div>
<div class="container" style="max-width:1100px;">
  <div class="profile-grid">
    <div>
      <ins class="adsbygoogle" style="display:block;margin-bottom:24px;" data-ad-client="ca-pub-2486135003689222" data-ad-format="auto" data-full-width-responsive="true"></ins>
      <script>(adsbygoogle=window.adsbygoogle||[]).push({});</script>

      <div class="pcard"><h2 class="pcard-title">About ${v.business_name}</h2><div style="font-size:15px;line-height:1.9;color:var(--ink2);">${(v.description||'No description available.').replace(/\n/g,'<br/>')}</div></div>

      ${extra.what_we_offer?`<div class="pcard"><h2 class="pcard-title">What We Offer</h2><div style="font-size:15px;line-height:1.9;color:var(--ink2);">${extra.what_we_offer.replace(/\n/g,'<br/>')}</div></div>`:''}

      ${extra.looking_for||extra.event_types_wanted?`
      <div class="pcard"><h2 class="pcard-title">What We're Looking For</h2>
        ${extra.looking_for?`<div style="font-size:15px;line-height:1.9;color:var(--ink2);margin-bottom:16px;">${extra.looking_for.replace(/\n/g,'<br/>')}</div>`:''}
        ${extra.event_types_wanted&&extra.event_types_wanted.length?`<div style="margin-bottom:16px;"><div style="font-size:12px;font-weight:700;color:var(--ink4);text-transform:uppercase;margin-bottom:8px;">Preferred Event Types</div>${(Array.isArray(extra.event_types_wanted)?extra.event_types_wanted:[extra.event_types_wanted]).map(t=>`<span class="info-pill">🎪 ${t}</span>`).join('')}</div>`:''}
        ${extra.availability&&extra.availability.length?`<div><div style="font-size:12px;font-weight:700;color:var(--ink4);text-transform:uppercase;margin-bottom:8px;">Available Months</div>${(Array.isArray(extra.availability)?extra.availability:[extra.availability]).map(m=>`<span class="info-pill">📅 ${m}</span>`).join('')}</div>`:''}
      </div>`:''}

      ${photos.length?`<div class="pcard"><h2 class="pcard-title">Photos (${photos.length})</h2><div class="photo-grid">${photos.map((p,i)=>`<img src="${p}" alt="${v.business_name} photo ${i+1}" loading="lazy" onclick="openPhoto('${p}')"/>`).join('')}</div></div>`:''}

      ${extra.space_required||extra.min_event_size?`
      <div class="pcard"><h2 class="pcard-title">Setup & Requirements</h2>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          ${extra.space_required?`<div style="background:var(--ivory);border-radius:12px;padding:14px;"><div style="font-size:11px;font-weight:700;color:var(--ink4);text-transform:uppercase;margin-bottom:4px;">Space Required</div><div style="font-size:14px;font-weight:600;">${extra.space_required}</div></div>`:''}
          ${extra.min_event_size?`<div style="background:var(--ivory);border-radius:12px;padding:14px;"><div style="font-size:11px;font-weight:700;color:var(--ink4);text-transform:uppercase;margin-bottom:4px;">Min. Event Size</div><div style="font-size:14px;font-weight:600;">${extra.min_event_size} visitors</div></div>`:''}
          ${extra.max_event_size?`<div style="background:var(--ivory);border-radius:12px;padding:14px;"><div style="font-size:11px;font-weight:700;color:var(--ink4);text-transform:uppercase;margin-bottom:4px;">Max. Event Size</div><div style="font-size:14px;font-weight:600;">${extra.max_event_size} visitors</div></div>`:''}
          ${extra.travel_distance?`<div style="background:var(--ivory);border-radius:12px;padding:14px;"><div style="font-size:11px;font-weight:700;color:var(--ink4);text-transform:uppercase;margin-bottom:4px;">Travel Distance</div><div style="font-size:14px;font-weight:600;">${extra.travel_distance}</div></div>`:''}
        </div>
        ${extra.needs_electricity==='yes'||extra.needs_water==='yes'?`<div style="margin-top:12px;">${extra.needs_electricity==='yes'?'<span class="info-pill">⚡ Needs Electricity</span>':''}${extra.needs_water==='yes'?'<span class="info-pill">💧 Needs Water</span>':''}</div>`:''}
      </div>`:''}

      ${extra.instagram||extra.facebook||extra.tiktok||extra.video_url?`
      <div class="pcard"><h2 class="pcard-title">Find Us Online</h2>
        ${extra.instagram?`<a href="https://instagram.com/${extra.instagram.replace('@','')}" target="_blank" rel="nofollow noopener" class="social-link">📸 Instagram</a>`:''}
        ${extra.facebook?`<a href="${extra.facebook.startsWith('http')?extra.facebook:'https://facebook.com/'+extra.facebook}" target="_blank" rel="nofollow noopener" class="social-link">👥 Facebook</a>`:''}
        ${extra.tiktok?`<a href="https://tiktok.com/@${extra.tiktok.replace('@','')}" target="_blank" rel="nofollow noopener" class="social-link">🎵 TikTok</a>`:''}
        ${extra.video_url?`<a href="${extra.video_url}" target="_blank" rel="nofollow noopener" class="social-link">🎬 Watch Video</a>`:''}
      </div>`:''}

      ${related.length?`
      <div><h3 style="font-family:'DM Serif Display',serif;font-size:20px;font-weight:400;margin-bottom:20px;">Similar Vendors</h3>
        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:16px;">
          ${related.map(r=>`<a href="/vendors/profile/${r.id}" style="background:#fff;border:1px solid var(--border);border-radius:16px;overflow:hidden;text-decoration:none;transition:all .2s;" onmouseover="this.style.borderColor='var(--flame)'" onmouseout="this.style.borderColor='var(--border)'"><div style="height:120px;overflow:hidden;"><img src="${vendorImg(r)}" alt="${r.business_name}" style="width:100%;height:100%;object-fit:cover;"/></div><div style="padding:14px;"><div style="font-size:11px;font-weight:700;color:var(--flame);text-transform:uppercase;margin-bottom:3px;">${r.category}</div><div style="font-size:15px;font-weight:600;color:var(--ink);">${r.business_name}</div><div style="font-size:12px;color:var(--ink3);">${FLAGS[r.country]||''} ${r.city}</div></div></a>`).join('')}
        </div>
      </div>`:''}
    </div>

    <aside>
      <div class="pcard">
        <h3 class="pcard-title">Vendor Details</h3>
        <div class="pstat"><div class="pstat-icon">📍</div><div><div class="pstat-label">Location</div><div class="pstat-value">${v.city}, ${cn}</div></div></div>
        <div class="pstat"><div class="pstat-icon">🏷️</div><div><div class="pstat-label">Category</div><div class="pstat-value">${v.category}</div></div></div>
        ${extra.price_range?`<div class="pstat"><div class="pstat-icon">💰</div><div><div class="pstat-label">Price Range</div><div class="pstat-value">${extra.price_range}</div></div></div>`:''}
        ${v.founded_year?`<div class="pstat"><div class="pstat-icon">📅</div><div><div class="pstat-label">Founded</div><div class="pstat-value">${v.founded_year}</div></div></div>`:''}
        ${v.events_attended?`<div class="pstat"><div class="pstat-icon">🎪</div><div><div class="pstat-label">Events Attended</div><div class="pstat-value">${v.events_attended}</div></div></div>`:''}
        ${extra.travel_distance?`<div class="pstat"><div class="pstat-icon">✈️</div><div><div class="pstat-label">Travel Distance</div><div class="pstat-value">${extra.travel_distance}</div></div></div>`:''}
        ${extra.languages?`<div class="pstat"><div class="pstat-icon">🗣️</div><div><div class="pstat-label">Languages</div><div class="pstat-value">${extra.languages}</div></div></div>`:''}
        ${extra.certifications?`<div class="pstat"><div class="pstat-icon">📋</div><div><div class="pstat-label">Certifications</div><div class="pstat-value">${extra.certifications}</div></div></div>`:''}
        <div class="pstat"><div class="pstat-icon">✅</div><div><div class="pstat-label">Status</div><div class="pstat-value" style="color:${v.verified?'#15803d':'#94a3b8'};">${v.verified?'✅ Verified Vendor':'Unverified'}</div></div></div>
        ${v.website?`<a href="${v.website}" target="_blank" rel="nofollow noopener" class="btn btn-primary" style="display:block;text-align:center;margin-top:20px;">Visit Website →</a>`:''}
        ${v.phone?`<a href="tel:${v.phone}" class="btn btn-outline" style="display:block;text-align:center;margin-top:8px;">📞 ${v.phone}</a>`:''}
        <button onclick="shareVendor()" class="btn btn-ghost" style="width:100%;margin-top:8px;">Share Profile 🔗</button>
      </div>
      <div style="background:linear-gradient(135deg,#0d1f15,#1a3d28);border:1px solid rgba(74,124,89,.3);border-radius:16px;padding:24px;margin-bottom:16px;">
        <h4 style="font-family:'DM Serif Display',serif;font-size:17px;font-weight:400;color:#fff;margin-bottom:8px;">Looking for event spots?</h4>
        <p style="font-size:13px;color:rgba(255,255,255,.55);margin-bottom:16px;">Browse events with available vendor spots and apply directly to organisers.</p>
        <a href="/events" class="btn btn-primary" style="display:block;text-align:center;">Browse Events →</a>
      </div>
      <ins class="adsbygoogle" style="display:block;" data-ad-client="ca-pub-2486135003689222" data-ad-format="auto" data-full-width-responsive="true"></ins>
      <script>(adsbygoogle=window.adsbygoogle||[]).push({});</script>
    </aside>
  </div>
</div>
<div id="lightbox" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.95);z-index:9999;align-items:center;justify-content:center;" onclick="this.style.display='none'">
  <img id="lightbox-img" style="max-width:90vw;max-height:90vh;border-radius:12px;"/>
</div>
${renderFooterSimple()}
<script>
function shareVendor(){if(navigator.share){navigator.share({title:'${v.business_name}',url:window.location.href});}else{navigator.clipboard.writeText(window.location.href);alert('Link copied!');}}
function openPhoto(src){document.getElementById('lightbox-img').src=src;document.getElementById('lightbox').style.display='flex';}
</script>
</body></html>`;
}

function renderRegisterPage(user, success, error) {
  const IS=`width:100%;background:#fff;border:1.5px solid var(--border2);border-radius:10px;padding:12px 14px;font-size:14px;outline:none;box-sizing:border-box;font-family:inherit;`;
  const LS=`font-size:12px;font-weight:700;color:var(--ink3);text-transform:uppercase;letter-spacing:.8px;display:block;margin-bottom:6px;`;
  const GS=`margin-bottom:20px;`;
  const SS=`background:#fff;border:1px solid var(--border);border-radius:20px;padding:32px;margin-bottom:20px;`;
  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Register as a Vendor — Festmore</title>
<meta name="description" content="Create your professional verified vendor profile on Festmore. Get discovered by event organisers worldwide for just €49/year."/>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="/css/main.css"/>
<style>
.wyg{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:32px;}
.wyg-card{background:#fff;border:1px solid var(--border);border-radius:14px;padding:18px;text-align:center;}
.checkbox-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;}
.checkbox-item{display:flex;align-items:center;gap:8px;background:var(--ivory);border:1.5px solid var(--border);border-radius:8px;padding:10px 12px;cursor:pointer;transition:all .2s;}
.checkbox-item:hover{border-color:var(--flame);}
.checkbox-item input[type=checkbox]{accent-color:var(--flame);}
textarea{resize:vertical;min-height:100px;}
@media(max-width:600px){.wyg{grid-template-columns:1fr;}.checkbox-grid{grid-template-columns:1fr;}}
</style>
</head><body>
${renderNav(user)}
<div style="background:linear-gradient(135deg,#0d1f15,#1a3d28);padding:64px 0;position:relative;overflow:hidden;">
  <div style="position:absolute;inset:0;background:radial-gradient(ellipse 60% 80% at 80% 50%,rgba(74,124,89,.3) 0%,transparent 70%);"></div>
  <div class="container" style="position:relative;max-width:860px;text-align:center;">
    <div style="display:inline-flex;align-items:center;gap:8px;background:rgba(74,124,89,.2);border:1px solid rgba(74,124,89,.4);color:#7ec99a;font-size:11px;font-weight:700;padding:4px 14px;border-radius:99px;margin-bottom:20px;letter-spacing:.8px;text-transform:uppercase;">🏪 Become a Verified Vendor</div>
    <h1 style="font-family:'DM Serif Display',serif;font-size:clamp(28px,4vw,52px);font-weight:400;color:#fff;margin-bottom:14px;">Create Your Professional Vendor Profile</h1>
    <p style="color:rgba(255,255,255,.55);font-size:16px;line-height:1.75;max-width:600px;margin:0 auto;">One profile. Worldwide visibility. Get discovered by event organisers running festivals, markets and Christmas markets worldwide.</p>
  </div>
</div>
<div class="container" style="padding:48px 0;max-width:860px;">
  ${error?`<div class="alert alert-error" style="margin-bottom:24px;">⚠️ ${error}</div>`:''}
  <div class="wyg">
    ${[['✅','Verified Badge','Stand out — organisers trust verified vendors'],['🌍','Worldwide Visibility','Seen by organisers across 26 countries'],['🎪','Apply to Events','Apply directly to festivals with open spots'],['📸','Photo Gallery','Show your stall, products and setup'],['📧','Newsletter Feature','Included in our weekly newsletter'],['📊','Profile Analytics','See who views your profile']].map(([i,t,d])=>`<div class="wyg-card"><div style="font-size:28px;margin-bottom:8px;">${i}</div><div style="font-size:14px;font-weight:700;margin-bottom:4px;">${t}</div><div style="font-size:12px;color:var(--ink3);line-height:1.5;">${d}</div></div>`).join('')}
  </div>
  <form method="POST" action="/vendors/register">

    <!-- 1. BUSINESS IDENTITY -->
    <div style="${SS}">
      <h2 style="font-family:'DM Serif Display',serif;font-size:22px;font-weight:400;margin-bottom:6px;">1. Business Identity</h2>
      <p style="font-size:13px;color:var(--ink3);margin-bottom:24px;padding-bottom:20px;border-bottom:1px solid var(--border);">Tell organisers who you are and what makes your business unique.</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
        <div style="${GS}grid-column:1/-1;"><label style="${LS}">Business Name *</label><input type="text" name="business_name" required placeholder="e.g. Nordic Street Food Co." style="${IS}"/></div>
        <div style="${GS}"><label style="${LS}">Category *</label><select name="category" required style="${IS}"><option value="">Select category…</option>${CATS.map(c=>`<option value="${c}">${c}</option>`).join('')}</select></div>
        <div style="${GS}"><label style="${LS}">Price Range</label><select name="price_range" style="${IS}"><option value="">Select…</option><option value="€ Budget">€ Budget</option><option value="€€ Mid-range">€€ Mid-range</option><option value="€€€ Premium">€€€ Premium</option><option value="Contact for pricing">Contact for pricing</option></select></div>
        <div style="${GS}"><label style="${LS}">Country *</label><select name="country" required style="${IS}"><option value="">Select country…</option>${Object.entries(COUNTRY_NAMES).map(([k,v])=>`<option value="${k}">${FLAGS[k]} ${v}</option>`).join('')}</select></div>
        <div style="${GS}"><label style="${LS}">City *</label><input type="text" name="city" required placeholder="e.g. Copenhagen" style="${IS}"/></div>
        <div style="${GS}"><label style="${LS}">Year Founded</label><input type="number" name="founded_year" placeholder="e.g. 2015" style="${IS}"/></div>
        <div style="${GS}"><label style="${LS}">Languages Spoken</label><input type="text" name="languages" placeholder="e.g. English, German, Danish" style="${IS}"/></div>
        <div style="${GS}grid-column:1/-1;"><label style="${LS}">Tagline — One Line That Sells You</label><input type="text" name="tagline" placeholder="e.g. Authentic Danish smørrebrød for any occasion" style="${IS}" maxlength="100"/></div>
        <div style="${GS}grid-column:1/-1;"><label style="${LS}">About Your Business *</label><textarea name="description" required placeholder="Describe your business — your story, what you sell, your experience and what makes you stand out…" style="${IS}" rows="4"></textarea></div>
      </div>
    </div>

    <!-- 2. WHAT YOU OFFER -->
    <div style="${SS}">
      <h2 style="font-family:'DM Serif Display',serif;font-size:22px;font-weight:400;margin-bottom:6px;">2. What You Offer</h2>
      <p style="font-size:13px;color:var(--ink3);margin-bottom:24px;padding-bottom:20px;border-bottom:1px solid var(--border);">Be specific — organisers want to know exactly what they get when they book you.</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
        <div style="${GS}grid-column:1/-1;"><label style="${LS}">Detailed Description of Your Offer</label><textarea name="what_we_offer" placeholder="What exactly do you offer? Menu items, services, products, what's included, setup time, how it works at an event…" style="${IS}" rows="5"></textarea></div>
        <div style="${GS}"><label style="${LS}">Space Required</label><select name="space_required" style="${IS}"><option value="">Select space…</option><option>1×1m (very small)</option><option>2×2m (small stall)</option><option>3×3m (standard stall)</option><option>4×4m (large stall)</option><option>6×3m (food truck)</option><option>10×5m (large setup)</option><option>Flexible</option></select></div>
        <div style="${GS}"><label style="${LS}">Travel Distance</label><select name="travel_distance" style="${IS}"><option value="">How far will you travel?</option><option>Local only (50km)</option><option>Regional (200km)</option><option>National</option><option>Anywhere in Europe</option><option>Worldwide</option></select></div>
        <div style="${GS}"><label style="${LS}">Minimum Event Size</label><input type="number" name="min_event_size" placeholder="e.g. 500 visitors" style="${IS}"/></div>
        <div style="${GS}"><label style="${LS}">Maximum Event Size</label><input type="number" name="max_event_size" placeholder="e.g. 50000 visitors" style="${IS}"/></div>
        <div style="${GS}"><label style="${LS}">Needs Electricity?</label><select name="needs_electricity" style="${IS}"><option value="no">No electricity needed</option><option value="yes">Yes — needs power</option></select></div>
        <div style="${GS}"><label style="${LS}">Needs Water?</label><select name="needs_water" style="${IS}"><option value="no">No water needed</option><option value="yes">Yes — needs water</option></select></div>
        <div style="${GS}grid-column:1/-1;"><label style="${LS}">Certifications & Licences</label><input type="text" name="certifications" placeholder="e.g. Food hygiene certified, Public liability insurance, HACCP" style="${IS}"/></div>
      </div>
    </div>

    <!-- 3. WHAT YOU'RE LOOKING FOR -->
    <div style="${SS}">
      <h2 style="font-family:'DM Serif Display',serif;font-size:22px;font-weight:400;margin-bottom:6px;">3. What You're Looking For</h2>
      <p style="font-size:13px;color:var(--ink3);margin-bottom:24px;padding-bottom:20px;border-bottom:1px solid var(--border);">Help organisers understand if you're the right fit for their event.</p>
      <div style="${GS}"><label style="${LS}">Describe Your Ideal Event</label><textarea name="looking_for" placeholder="e.g. We love outdoor summer festivals with 5,000+ visitors. We're particularly interested in food and music festivals across Scandinavia and Germany…" style="${IS}" rows="4"></textarea></div>
      <div style="${GS}"><label style="${LS}">Preferred Event Types (select all that apply)</label><div class="checkbox-grid">${EVENT_TYPES.map(t=>`<label class="checkbox-item"><input type="checkbox" name="event_types_wanted" value="${t}"/><span style="font-size:13px;">${t}</span></label>`).join('')}</div></div>
      <div style="${GS}margin-top:16px;"><label style="${LS}">Available Months (select all that apply)</label><div class="checkbox-grid">${MONTHS.map(m=>`<label class="checkbox-item"><input type="checkbox" name="availability" value="${m}"/><span style="font-size:13px;">${m}</span></label>`).join('')}</div></div>
    </div>

    <!-- 4. CONTACT & SOCIAL -->
    <div style="${SS}">
      <h2 style="font-family:'DM Serif Display',serif;font-size:22px;font-weight:400;margin-bottom:6px;">4. Contact & Social Media</h2>
      <p style="font-size:13px;color:var(--ink3);margin-bottom:24px;padding-bottom:20px;border-bottom:1px solid var(--border);">How can organisers reach you? Add your social media so people can see your work.</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
        <div style="${GS}"><label style="${LS}">Email Address *</label><input type="email" name="email" required placeholder="your@email.com" style="${IS}"/></div>
        <div style="${GS}"><label style="${LS}">Phone Number</label><input type="tel" name="phone" placeholder="+45 12 34 56 78" style="${IS}"/></div>
        <div style="${GS}grid-column:1/-1;"><label style="${LS}">Website</label><input type="url" name="website" placeholder="https://your-business.com" style="${IS}"/></div>
        <div style="${GS}"><label style="${LS}">📸 Instagram</label><input type="text" name="instagram" placeholder="@yourhandle" style="${IS}"/></div>
        <div style="${GS}"><label style="${LS}">👥 Facebook</label><input type="text" name="facebook" placeholder="facebook.com/yourpage" style="${IS}"/></div>
        <div style="${GS}"><label style="${LS}">🎵 TikTok</label><input type="text" name="tiktok" placeholder="@yourhandle" style="${IS}"/></div>
        <div style="${GS}"><label style="${LS}">🎬 Video (YouTube/Vimeo)</label><input type="url" name="video_url" placeholder="https://youtube.com/..." style="${IS}"/></div>
      </div>
    </div>

    <!-- 5. PHOTOS NOTE -->
    <div style="${SS}">
      <h2 style="font-family:'DM Serif Display',serif;font-size:22px;font-weight:400;margin-bottom:6px;">5. Photos</h2>
      <p style="font-size:13px;color:var(--ink3);margin-bottom:24px;padding-bottom:20px;border-bottom:1px solid var(--border);">Vendors with photos get 3× more enquiries from organisers.</p>
      <div style="background:linear-gradient(135deg,rgba(232,71,10,.04),rgba(232,71,10,.08));border:1.5px dashed rgba(232,71,10,.3);border-radius:14px;padding:28px;text-align:center;">
        <div style="font-size:40px;margin-bottom:12px;">📸</div>
        <h3 style="font-size:16px;font-weight:700;margin-bottom:8px;">Upload up to 8 photos after registration</h3>
        <p style="font-size:13px;color:var(--ink3);line-height:1.6;max-width:480px;margin:0 auto;">Once your payment is confirmed your profile goes live in your dashboard where you can add photos of your stall, food truck, products and previous events.</p>
      </div>
    </div>
     <!-- TERMS & RULES -->
    <div style="background:#fff;border:1px solid var(--border);border-radius:20px;padding:32px;margin-bottom:20px;">
      <h2 style="font-family:'DM Serif Display',serif;font-size:22px;font-weight:400;margin-bottom:6px;">📋 Terms, Rules &amp; Conditions</h2>
      <p style="font-size:13px;color:var(--ink3);margin-bottom:24px;padding-bottom:20px;border-bottom:1px solid var(--border);">Please read carefully before submitting.</p>
      <div style="background:rgba(232,71,10,.04);border:1.5px solid rgba(232,71,10,.2);border-radius:14px;padding:20px 24px;margin-bottom:16px;">
        <div style="font-size:14px;font-weight:700;color:var(--ink);margin-bottom:6px;">💳 No Refund Policy</div>
        <p style="font-size:13px;color:var(--ink3);line-height:1.7;margin:0;">All payments are <strong>final and non-refundable</strong>. Once your profile is live, no refunds will be issued. For errors contact <a href="mailto:contact@festmore.com" style="color:var(--flame);">contact@festmore.com</a> and we will correct it free of charge.</p>
      </div>
      <div style="background:rgba(74,124,89,.04);border:1.5px solid rgba(74,124,89,.2);border-radius:14px;padding:20px 24px;margin-bottom:16px;">
        <div style="font-size:14px;font-weight:700;color:var(--ink);margin-bottom:6px;">✅ Accuracy of Information</div>
        <p style="font-size:13px;color:var(--ink3);line-height:1.7;margin:0;">You are responsible for ensuring all information submitted is accurate and truthful. Festmore reserves the right to remove profiles containing false or misleading information without refund.</p>
      </div>
      <div style="background:rgba(201,146,42,.04);border:1.5px solid rgba(201,146,42,.25);border-radius:14px;padding:20px 24px;margin-bottom:16px;">
        <div style="font-size:14px;font-weight:700;color:var(--ink);margin-bottom:8px;">🚫 Prohibited Content</div>
        <p style="font-size:13px;color:var(--ink3);line-height:1.7;margin:0 0 10px;">The following are strictly prohibited and will result in immediate removal without refund: illegal activities · violence or hate content · discrimination · adult content · scams or fraudulent profiles · illegal substances · copyright violations · spam · political extremism.</p>
      </div>
      <div style="background:var(--ivory);border:1px solid var(--border);border-radius:14px;padding:20px 24px;margin-bottom:20px;">
        <div style="font-size:14px;font-weight:700;color:var(--ink);margin-bottom:6px;">📧 Questions or Issues?</div>
        <p style="font-size:13px;color:var(--ink3);line-height:1.7;margin:0;">Contact us at <a href="mailto:contact@festmore.com" style="color:var(--flame);font-weight:600;">contact@festmore.com</a>. We respond within 24 hours on business days.</p>
      </div>
      <label style="display:flex;align-items:flex-start;gap:12px;cursor:pointer;background:var(--ivory);border:2px solid var(--border);border-radius:12px;padding:16px 18px;" id="terms-label">
        <input type="checkbox" name="terms_agreed" value="1" required style="margin-top:2px;accent-color:var(--flame);width:18px;height:18px;flex-shrink:0;" onchange="document.getElementById('terms-label').style.borderColor=this.checked?'var(--flame)':'var(--border)'"/>
        <span style="font-size:13px;color:var(--ink2);line-height:1.6;">I have read and agree to the <strong>Terms and Conditions</strong> above, including the <strong>no refund policy</strong>. I confirm my vendor profile complies with all applicable laws and Festmore's content rules.</span>
      </label>
    </div>

    <!-- PAYMENT -->
    <div style="background:var(--ink);border-radius:20px;padding:36px;margin-bottom:24px;">
      <div style="display:grid;grid-template-columns:1fr auto;gap:24px;align-items:center;">
        <div>
          <h3 style="font-family:'DM Serif Display',serif;font-size:26px;font-weight:400;color:#fff;margin-bottom:8px;">Ready to get discovered?</h3>
          <p style="color:rgba(255,255,255,.5);font-size:14px;line-height:1.6;margin-bottom:16px;">Your professional verified vendor profile — one payment, one year of worldwide visibility.</p>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">${['✅ Verified badge','🌍 Worldwide','📸 Photo gallery','🎪 Apply to events','📧 Newsletter','📊 Analytics'].map(f=>`<span style="background:rgba(255,255,255,.08);color:rgba(255,255,255,.7);padding:4px 12px;border-radius:99px;font-size:12px;font-weight:600;">${f}</span>`).join('')}</div>
        </div>
        <div style="text-align:center;flex-shrink:0;">
          <div style="font-family:'DM Serif Display',serif;font-size:52px;color:#fff;line-height:1;">€49</div>
          <div style="color:rgba(255,255,255,.4);font-size:13px;margin-bottom:16px;">per year · less than €5/month</div>
          <button type="submit" style="background:#4a7c59;color:#fff;border:none;padding:16px 36px;border-radius:12px;font-size:16px;font-weight:700;cursor:pointer;font-family:inherit;box-shadow:0 8px 24px rgba(74,124,89,.4);">Create My Profile →</button>
          <div style="color:rgba(255,255,255,.3);font-size:12px;margin-top:10px;">🔒 Secure payment via Stripe</div>
        </div>
      </div>
    </div>
  </form>
</div>
${renderFooterSimple()}</body></html>`;
}

function renderNav(user) {
  return `<nav class="main-nav"><div class="nav-inner"><a href="/" class="logo"><span class="logo-fest">Fest</span><span class="logo-more">more</span><span class="logo-dot"></span></a><form class="nav-search" action="/events" method="GET"><span style="color:var(--ink4);font-size:15px;">🔍</span><input type="text" name="q" placeholder="Search events…"/></form><div class="nav-right">${user?`<a href="/dashboard" class="btn btn-outline btn-sm">Dashboard</a><a href="/auth/logout" class="btn btn-ghost btn-sm">Logout</a>`:`<a href="/auth/login" class="btn btn-outline btn-sm">Login</a><a href="/events/submit" class="btn btn-primary btn-sm">+ List Event</a>`}</div><button class="nav-burger" onclick="document.querySelector('.nav-mobile').classList.toggle('open')">☰</button></div><div class="nav-cats-bar"><a href="/events" class="nav-cat">🌍 All</a><a href="/events?category=festival" class="nav-cat">🎪 Festivals</a><a href="/events?category=market" class="nav-cat">🛍️ Markets</a><a href="/events?category=christmas" class="nav-cat">🎄 Xmas Markets</a><a href="/events?category=concert" class="nav-cat">🎵 Concerts</a><a href="/articles" class="nav-cat">📰 Articles</a><a href="/vendors" class="nav-cat">🏪 Vendors</a><a href="/about" class="nav-cat">ℹ️ About</a><a href="/contact" class="nav-cat">✉️ Contact</a></div><div class="nav-mobile"><a href="/events">All Events</a><a href="/articles">Articles</a><a href="/vendors">Vendors</a><a href="/about">About</a><a href="/contact">Contact</a><a href="/events/submit">+ List Event</a>${user?`<a href="/dashboard">Dashboard</a><a href="/auth/logout">Logout</a>`:`<a href="/auth/login">Login</a>`}</div></nav>`;
}

function renderFooterSimple() {
  return `<footer><div class="footer-bottom"><span>© ${new Date().getFullYear()} Festmore.com — All rights reserved</span><div style="display:flex;gap:20px;flex-wrap:wrap;"><a href="/" style="color:rgba(255,255,255,.35);font-size:13px;">Home</a><a href="/events" style="color:rgba(255,255,255,.35);font-size:13px;">Events</a><a href="/vendors" style="color:rgba(255,255,255,.35);font-size:13px;">Vendors</a><a href="/about" style="color:rgba(255,255,255,.35);font-size:13px;">About</a><a href="/contact" style="color:rgba(255,255,255,.35);font-size:13px;">Contact</a><a href="/privacy" style="color:rgba(255,255,255,.35);font-size:13px;">Privacy</a></div></div></footer>`;
}