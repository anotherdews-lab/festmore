// routes/vendors.js — REBUILT with country tabs, profile pages and better design
const express = require('express');
const router  = express.Router();
const db      = require('../db');
const stripe  = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_live_placeholder');

const FLAGS = { BE:'🇧🇪',CN:'🇨🇳',DK:'🇩🇰',FR:'🇫🇷',DE:'🇩🇪',NL:'🇳🇱',PL:'🇵🇱',SE:'🇸🇪',AE:'🇦🇪',GB:'🇬🇧',US:'🇺🇸',NO:'🇳🇴', FI:'🇫🇮', AT:'🇦🇹', CH:'🇨🇭', IT:'🇮🇹',
ES:'🇪🇸', PT:'🇵🇹', IE:'🇮🇪', CZ:'🇨🇿', HU:'🇭🇺',
GR:'🇬🇷', HR:'🇭🇷', IN:'🇮🇳', TH:'🇹🇭', JP:'🇯🇵', };
const COUNTRY_NAMES = { BE:'Belgium',CN:'China',DK:'Denmark',FR:'France',DE:'Germany',NL:'Netherlands',PL:'Poland',SE:'Sweden',AE:'UAE',GB:'United Kingdom',US:'USA',NO:'Norway', FI:'Finland', AT:'Austria', CH:'Switzerland', IT:'Italy',
ES:'Spain', PT:'Portugal', IE:'Ireland', CZ:'Czech Republic', HU:'Hungary',
GR:'Greece', HR:'Croatia', IN:'India', TH:'Thailand', JP:'Japan', };
const CATS = ['Food & Drinks','Artisan Crafts','Technology','Event Decor','Entertainment','Photography','Kids Activities','Fashion & Apparel','Art & Prints','Live Music','Retail','Services' ];

const CAT_IMGS = {
  'Food & Drinks':     'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=75',
  'Artisan Crafts':    'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=600&q=75',
  'Technology':        'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=75',
  'Event Decor':       'https://images.unsplash.com/photo-1478146059778-26028b07395a?w=600&q=75',
  'Entertainment':     'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=75',
  'Photography':       'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=600&q=75',
  'Kids Activities':   'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&q=75',
  'Fashion & Apparel': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=75',
  'Art & Prints':      'https://images.unsplash.com/photo-1580136579312-94651dfd596d?w=600&q=75',
  'Live Music':        'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&q=75',
  'Retail':            'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=600&q=75',
  'Services':          'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=75',
};

function vendorImg(v) {
  return v.image_url || CAT_IMGS[v.category] || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=75';
}

// ─────────────────────────────────────
// VENDORS LISTING
// ─────────────────────────────────────
router.get('/', (req, res) => {
  const { category = 'ALL', country = 'ALL', q = '' } = req.query;
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
  try { db.prepare("UPDATE vendors SET views=views+1 WHERE id=?").run(vendor.id); } catch(e) {}
  const related = db.prepare("SELECT * FROM vendors WHERE status='active' AND category=? AND id!=? ORDER BY verified DESC LIMIT 4").all(vendor.category, vendor.id);
  res.send(renderVendorProfile(vendor, related, req.session.user));
});

// ─────────────────────────────────────
// REGISTER
// ─────────────────────────────────────
router.get('/register', (req, res) => {
  res.send(renderRegisterPage(req.session.user, req.query.success, req.query.error));
});

router.post('/register', async (req, res) => {
  const { business_name, category, city, country, description, website, phone, email, founded_year } = req.body;
  if (!business_name || !category || !city || !country) {
    return res.redirect('/vendors/register?error=Please fill in all required fields');
  }
  const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  let slug = slugify(business_name + '-' + city);
  let i = 1;
  while (db.prepare('SELECT id FROM vendors WHERE slug=?').get(slug)) { slug = slugify(business_name+'-'+city)+'-'+i++; }
  const result = db.prepare(`INSERT INTO vendors (business_name,slug,category,city,country,description,website,phone,email,founded_year,status,payment_status,verified,premium) VALUES (?,?,?,?,?,?,?,?,?,?,'pending','unpaid',0,0)`)
    .run(business_name,slug,category,city,country,description||'',website||'',phone||'',email||'',parseInt(founded_year)||0);
  const vendorId = result.lastInsertRowid;
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price_data: { currency:'eur', product_data:{ name:'Festmore Verified Vendor Profile', description:`Annual vendor profile for ${business_name}` }, unit_amount: parseInt(process.env.PRICE_VENDOR_YEARLY)||4900 }, quantity:1 }],
      mode: 'payment',
      success_url: 'https://festmore.com/vendors/payment-success?vendor_id=' + vendorId,
      cancel_url: 'https://festmore.com/vendors/register?error=Payment+cancelled',
      metadata: { vendor_id: String(vendorId), type:'vendor_profile' },
      customer_email: email || undefined,
    });
    db.prepare(`INSERT OR IGNORE INTO payments (stripe_session_id,amount,type,status,reference_id) VALUES (?,?,?,?,?)`)
      .run(session.id, parseInt(process.env.PRICE_VENDOR_YEARLY)||4900, 'vendor_profile', 'pending', vendorId);
    res.redirect(session.url);
   } catch (err) {
    console.error('Stripe vendor error:', err.message);
    res.redirect('/vendors/register?error=Payment+unavailable.+Please+try+again.+'+encodeURIComponent(err.message));
  }
});

router.get('/payment-success', (req, res) => {
  const { vendor_id } = req.query;
  if (vendor_id) {
    db.prepare("UPDATE vendors SET status='active',payment_status='paid',verified=1 WHERE id=?").run(parseInt(vendor_id));
    db.prepare("UPDATE payments SET status='completed' WHERE reference_id=?").run(parseInt(vendor_id));
  }
  const vendor = vendor_id ? db.prepare("SELECT * FROM vendors WHERE id=?").get(parseInt(vendor_id)) : null;
  res.send(`<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Welcome to Festmore!</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="/css/main.css"/>
</head><body style="background:var(--cream);min-height:100vh;display:flex;align-items:center;justify-content:center;">
<div style="max-width:560px;margin:0 auto;text-align:center;padding:48px 32px;">
  <div style="font-size:64px;margin-bottom:20px;">🎉</div>
  <h1 style="font-family:'DM Serif Display',serif;font-size:36px;font-weight:400;margin-bottom:12px;">You're a Verified Vendor!</h1>
  <p style="color:var(--ink3);font-size:16px;line-height:1.75;margin-bottom:28px;">Your profile is now live. Event organisers across 11 countries can now find and contact you.</p>
  ${vendor?`<div style="background:#fff;border:1px solid var(--border);border-radius:16px;padding:20px;margin-bottom:24px;text-align:left;">
    <div style="font-weight:700;">${vendor.business_name}</div>
    <div style="font-size:13px;color:var(--ink3);">${vendor.city} · ${vendor.category}</div>
    <div style="margin-top:8px;"><span style="background:#dcfce7;color:#15803d;padding:3px 12px;border-radius:99px;font-size:12px;font-weight:700;">✅ Verified</span></div>
  </div>`:''}
  <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
    ${vendor?`<a href="/vendors/profile/${vendor.id}" class="btn btn-primary btn-lg">View Your Profile →</a>`:''}
    <a href="/events" class="btn btn-outline btn-lg">Browse Events</a>
  </div>
</div></body></html>`);
});

module.exports = router;

// ─────────────────────────────────────
// RENDER VENDOR LIST
// ─────────────────────────────────────
function renderVendorList({ vendors, countryCounts, totalVendors, category, country, q, user }) {
  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Verified Event Vendors Across Europe | Festmore</title>
<meta name="description" content="Browse ${totalVendors}+ verified vendors for festivals, markets and events. Food vendors, artisans, photographers and more across 11 countries."/>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/>
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2486135003689222" crossorigin="anonymous"></script>
<link rel="stylesheet" href="/css/main.css"/>
<style>
.vendor-hero{background:#0a0a0a;padding:72px 0;position:relative;overflow:hidden;}
.vendor-hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 60% 80% at 80% 50%,rgba(74,124,89,.2) 0%,transparent 70%);}
.country-tabs{background:#fff;border-bottom:2px solid var(--border);position:sticky;top:0;z-index:100;box-shadow:0 2px 12px rgba(26,22,18,.06);}
.country-tabs-inner{max-width:1440px;margin:0 auto;padding:0 40px;display:flex;gap:0;overflow-x:auto;scrollbar-width:none;}
.country-tabs-inner::-webkit-scrollbar{display:none;}
.country-tab{display:flex;align-items:center;gap:8px;padding:16px 22px;font-size:13px;font-weight:600;color:var(--ink3);border-bottom:3px solid transparent;margin-bottom:-2px;white-space:nowrap;text-decoration:none;transition:all .2s;flex-shrink:0;}
.country-tab:hover{color:var(--ink);}
.country-tab.active{color:var(--flame);border-bottom-color:var(--flame);}
.tab-count{background:var(--ivory);color:var(--ink4);font-size:10px;font-weight:700;padding:2px 7px;border-radius:99px;}
.country-tab.active .tab-count{background:rgba(232,71,10,.1);color:var(--flame);}
.vendors-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px;}
.vcard{background:#fff;border:1px solid var(--border);border-radius:20px;overflow:hidden;transition:all .25s;cursor:pointer;}
.vcard:hover{border-color:var(--flame);box-shadow:0 20px 60px rgba(26,22,18,.1);transform:translateY(-4px);}
.vcard-img{height:200px;position:relative;overflow:hidden;}
.vcard-img img{width:100%;height:100%;object-fit:cover;transition:transform .4s;}
.vcard:hover .vcard-img img{transform:scale(1.05);}
.vcard-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(26,22,18,.7) 0%,transparent 60%);}
.vcard-country{position:absolute;top:12px;left:12px;background:rgba(255,255,255,.95);backdrop-filter:blur(8px);border-radius:99px;padding:4px 10px;font-size:12px;font-weight:700;display:flex;align-items:center;gap:5px;}
.vcard-badges{position:absolute;top:12px;right:12px;display:flex;flex-direction:column;gap:4px;align-items:flex-end;}
.vcard-body{padding:20px;}
.vcard-cat{font-size:11px;font-weight:700;color:var(--flame);text-transform:uppercase;letter-spacing:.8px;margin-bottom:6px;}
.vcard-name{font-family:'DM Serif Display',serif;font-size:19px;font-weight:400;color:var(--ink);margin-bottom:5px;line-height:1.2;}
.vcard-loc{font-size:13px;color:var(--ink3);margin-bottom:10px;}
.vcard-desc{font-size:13px;color:var(--ink3);line-height:1.6;margin-bottom:14px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
.vcard-footer{display:flex;justify-content:space-between;align-items:center;padding-top:12px;border-top:1px solid var(--border);}
.badge-v{background:#dcfce7;color:#15803d;padding:3px 10px;border-radius:99px;font-size:11px;font-weight:700;}
.badge-p{background:linear-gradient(135deg,#c9922a,#e8b84b);color:#fff;padding:3px 10px;border-radius:99px;font-size:11px;font-weight:700;}
.badge-u{background:#f1f5f9;color:#94a3b8;padding:3px 10px;border-radius:99px;font-size:11px;font-weight:700;}
@media(max-width:768px){.country-tabs-inner{padding:0 16px;}.vendors-grid{grid-template-columns:1fr 1fr;}}
@media(max-width:480px){.vendors-grid{grid-template-columns:1fr;}}
</style>
</head><body>
${renderNav(user)}

<div class="vendor-hero">
  <div class="container" style="position:relative;max-width:900px;">
    <div style="display:inline-flex;align-items:center;gap:8px;background:rgba(74,124,89,.15);border:1px solid rgba(74,124,89,.3);color:#7ec99a;font-size:11px;font-weight:700;padding:4px 14px;border-radius:99px;margin-bottom:20px;letter-spacing:.8px;text-transform:uppercase;">
      <span style="width:5px;height:5px;border-radius:50%;background:#7ec99a;display:inline-block;"></span>
      ${totalVendors}+ Verified Vendors
    </div>
    <h1 style="font-family:'DM Serif Display',serif;font-size:clamp(32px,5vw,56px);font-weight:400;color:#fff;margin-bottom:16px;line-height:1.08;">Find the Perfect Vendor<br/>for <em style="color:#7ec99a;">Your Event</em></h1>
    <p style="color:rgba(255,255,255,.55);font-size:17px;line-height:1.75;max-width:560px;margin-bottom:32px;">Browse verified food vendors, artisans, entertainers, photographers and more — ready to join your festival or market across 11 countries.</p>
    <div style="display:flex;gap:12px;flex-wrap:wrap;">
      <a href="/vendors/register" style="display:inline-flex;align-items:center;gap:8px;background:#4a7c59;color:#fff;padding:13px 28px;border-radius:12px;font-size:14px;font-weight:700;text-decoration:none;">🏪 Become a Vendor — €49/yr</a>
      <a href="/events" style="display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.1);color:#fff;border:1.5px solid rgba(255,255,255,.2);padding:13px 28px;border-radius:12px;font-size:14px;font-weight:600;text-decoration:none;">🎪 Browse Events</a>
    </div>
  </div>
</div>

<!-- COUNTRY TABS -->
<div class="country-tabs">
  <div class="country-tabs-inner">
    <a href="/vendors${category!=='ALL'?'?category='+encodeURIComponent(category):''}" class="country-tab ${country==='ALL'?'active':''}">
      🌍 All <span class="tab-count">${totalVendors}</span>
    </a>
    ${countryCounts.map(c=>`
    <a href="/vendors?country=${c.country}${category!=='ALL'?'&category='+encodeURIComponent(category):''}" class="country-tab ${country===c.country?'active':''}">
      ${FLAGS[c.country]||'🌍'} ${COUNTRY_NAMES[c.country]||c.country} <span class="tab-count">${c.count}</span>
    </a>`).join('')}
  </div>
</div>

<div class="container" style="padding:40px 0;">
  <!-- SEARCH BAR -->
  <form method="GET" action="/vendors" style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-bottom:32px;">
    <input type="hidden" name="country" value="${country}"/>
    <div style="flex:2;min-width:200px;position:relative;">
      <span style="position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--ink4);">🔍</span>
      <input type="text" name="q" value="${q}" placeholder="Search vendors, cities…" style="width:100%;background:#fff;border:1.5px solid var(--border2);border-radius:10px;padding:11px 14px 11px 40px;font-size:14px;outline:none;box-sizing:border-box;"/>
    </div>
    <select name="category" style="background:#fff;border:1.5px solid var(--border2);border-radius:10px;padding:11px 16px;font-size:14px;outline:none;min-width:160px;">
      <option value="ALL" ${category==='ALL'?'selected':''}>All Categories</option>
      ${CATS.map(c=>`<option value="${c}" ${category===c?'selected':''}>${c}</option>`).join('')}
    </select>
    <button type="submit" class="btn btn-primary" style="padding:11px 24px;">Search</button>
    ${q||category!=='ALL'?`<a href="/vendors?country=${country}" style="color:var(--ink3);font-size:13px;">Clear</a>`:''}
  </form>

  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
    <div style="font-size:14px;color:var(--ink3);">
      <strong style="color:var(--ink);">${vendors.length}</strong> vendors
      ${country!=='ALL'?` in <strong>${FLAGS[country]||''} ${COUNTRY_NAMES[country]||country}</strong>`:''}
      ${category!=='ALL'?` — <strong>${category}</strong>`:''}
    </div>
    <a href="/vendors/register" class="btn btn-primary btn-sm">+ Add Your Business</a>
  </div>

  <ins class="adsbygoogle" style="display:block;margin-bottom:24px;" data-ad-client="ca-pub-2486135003689222" data-ad-format="auto" data-full-width-responsive="true"></ins>
  <script>(adsbygoogle=window.adsbygoogle||[]).push({});</script>

  ${vendors.length===0?`
  <div style="text-align:center;padding:80px 20px;background:#fff;border-radius:20px;border:1px solid var(--border);">
    <div style="font-size:48px;margin-bottom:16px;">🔍</div>
    <h2 style="font-family:'DM Serif Display',serif;font-size:24px;font-weight:400;margin-bottom:8px;">No vendors found</h2>
    <p style="color:var(--ink3);margin-bottom:24px;">Be the first vendor in this category!</p>
    <a href="/vendors/register" class="btn btn-primary">Register as Vendor →</a>
  </div>`:`
  <div class="vendors-grid">${vendors.map(v=>vendorCardHTML(v)).join('')}</div>`}

  <!-- CTA -->
  <div style="margin-top:56px;background:var(--ink);border-radius:24px;padding:48px 40px;display:grid;grid-template-columns:1fr auto;gap:32px;align-items:center;">
    <div>
      <h2 style="font-family:'DM Serif Display',serif;font-size:28px;font-weight:400;color:#fff;margin-bottom:10px;">Are you a vendor looking for events?</h2>
      <p style="color:rgba(255,255,255,.5);font-size:15px;line-height:1.7;">Create your verified profile and get discovered by event organisers across 11 countries. €49/year — less than €5/month.</p>
    </div>
    <div style="display:flex;flex-direction:column;gap:10px;flex-shrink:0;">
      <a href="/vendors/register" class="btn btn-primary" style="text-align:center;white-space:nowrap;background:#4a7c59;">Create Vendor Profile →</a>
      <a href="/events/pricing" style="text-align:center;color:rgba(255,255,255,.4);font-size:12px;text-decoration:none;">View all pricing →</a>
    </div>
  </div>
</div>
${renderFooterSimple()}
</body></html>`;
}

function vendorCardHTML(v) {
  const img = vendorImg(v);
  const flag = FLAGS[v.country]||'🌍';
  const cn = COUNTRY_NAMES[v.country]||v.country;
  return `<article class="vcard" onclick="window.location='/vendors/profile/${v.id}'">
  <div class="vcard-img">
    <img src="${img}" alt="${v.business_name}" loading="lazy"/>
    <div class="vcard-overlay"></div>
    <div class="vcard-country">${flag} ${cn}</div>
    <div class="vcard-badges">
      ${v.premium?'<span class="badge-p">⭐ Premium</span>':''}
      ${v.verified?'<span class="badge-v">✅ Verified</span>':'<span class="badge-u">🔓 Unverified</span>'}
    </div>
  </div>
  <div class="vcard-body">
    <div class="vcard-cat">${v.category}</div>
    <div class="vcard-name">${v.business_name}</div>
    <div class="vcard-loc">📍 ${v.city}, ${cn}</div>
    ${v.description?`<div class="vcard-desc">${v.description}</div>`:''}
    <div class="vcard-footer">
      <div style="display:flex;gap:12px;">
        ${v.events_attended?`<span style="font-size:12px;color:var(--ink4);">🎪 ${v.events_attended} events</span>`:''}
        ${v.rating?`<span style="font-size:12px;color:var(--ink4);">⭐ ${v.rating}</span>`:''}
      </div>
      <span style="font-size:12px;color:var(--flame);font-weight:600;">View →</span>
    </div>
  </div>
</article>`;
}

// ─────────────────────────────────────
// VENDOR PROFILE PAGE
// ─────────────────────────────────────
function renderVendorProfile(v, related, user) {
  const img = vendorImg(v);
  const flag = FLAGS[v.country]||'🌍';
  const cn = COUNTRY_NAMES[v.country]||v.country;
  const tags = JSON.parse(v.tags||'[]');
  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${v.business_name} — ${v.city}, ${cn} | Festmore</title>
<meta name="description" content="${v.business_name} is a ${v.category} vendor in ${v.city}, ${cn}. ${(v.description||'').substring(0,120)}"/>
<meta property="og:title" content="${v.business_name} — Festmore Vendor"/>
<meta property="og:image" content="${img}"/>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/>
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2486135003689222" crossorigin="anonymous"></script>
<link rel="stylesheet" href="/css/main.css"/>
<style>
.profile-hero{height:380px;position:relative;overflow:hidden;}
.profile-hero img{width:100%;height:100%;object-fit:cover;}
.profile-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(26,22,18,.95) 0%,rgba(26,22,18,.3) 70%,transparent 100%);}
.profile-content{position:absolute;bottom:0;left:0;right:0;padding:36px 40px;}
.profile-grid{display:grid;grid-template-columns:1fr 340px;gap:40px;padding:48px 0;align-items:start;}
.pcard{background:#fff;border:1px solid var(--border);border-radius:20px;padding:28px;margin-bottom:16px;}
.pstat{display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--border);}
.pstat:last-child{border-bottom:none;}
.pstat-icon{width:36px;height:36px;border-radius:9px;background:rgba(232,71,10,.08);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;}
.pstat-label{font-size:11px;font-weight:700;color:var(--ink4);text-transform:uppercase;letter-spacing:.6px;}
.pstat-value{font-size:14px;color:var(--ink2);font-weight:600;}
@media(max-width:900px){.profile-grid{grid-template-columns:1fr;}.profile-content{padding:24px;}}
</style>
</head><body>
${renderNav(user)}

<!-- BREADCRUMB -->
<div style="background:var(--ivory);border-bottom:1px solid var(--border);padding:12px 0;">
  <div class="container" style="font-size:13px;color:var(--ink3);">
    <a href="/" style="color:var(--ink3);text-decoration:none;">Home</a> →
    <a href="/vendors" style="color:var(--ink3);text-decoration:none;"> Vendors</a> →
    <a href="/vendors?country=${v.country}" style="color:var(--ink3);text-decoration:none;"> ${flag} ${cn}</a> →
    <strong style="color:var(--ink);"> ${v.business_name}</strong>
  </div>
</div>

<!-- HERO -->
<div class="profile-hero">
  <img src="${img}" alt="${v.business_name}"/>
  <div class="profile-overlay"></div>
  <div class="profile-content">
    <div class="container">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;flex-wrap:wrap;">
        <span style="background:rgba(255,255,255,.15);color:#fff;padding:4px 12px;border-radius:99px;font-size:12px;font-weight:700;">${v.category}</span>
        ${v.verified?'<span style="background:#dcfce7;color:#15803d;padding:4px 12px;border-radius:99px;font-size:12px;font-weight:700;">✅ Verified</span>':''}
        ${v.premium?'<span style="background:linear-gradient(135deg,#c9922a,#e8b84b);color:#fff;padding:4px 12px;border-radius:99px;font-size:12px;font-weight:700;">⭐ Premium</span>':''}
      </div>
      <h1 style="font-family:'DM Serif Display',serif;font-size:clamp(28px,4vw,48px);font-weight:400;color:#fff;margin-bottom:10px;">${v.business_name}</h1>
      <div style="display:flex;gap:20px;flex-wrap:wrap;color:rgba(255,255,255,.65);font-size:14px;">
        <span>📍 ${flag} ${v.city}, ${cn}</span>
        ${v.events_attended?`<span>🎪 ${v.events_attended} events</span>`:''}
        ${v.founded_year?`<span>📅 Est. ${v.founded_year}</span>`:''}
        ${v.rating?`<span>⭐ ${v.rating}</span>`:''}
      </div>
    </div>
  </div>
</div>

<div class="container" style="max-width:1100px;">
  <div class="profile-grid">
    <div>
      <ins class="adsbygoogle" style="display:block;margin-bottom:24px;" data-ad-client="ca-pub-2486135003689222" data-ad-format="auto" data-full-width-responsive="true"></ins>
      <script>(adsbygoogle=window.adsbygoogle||[]).push({});</script>

      <div class="pcard">
        <h2 style="font-family:'DM Serif Display',serif;font-size:24px;font-weight:400;margin-bottom:16px;">About ${v.business_name}</h2>
        <div style="font-size:15px;line-height:1.85;color:var(--ink2);">${(v.description||'No description available.').replace(/\n/g,'<br/>')}</div>
        ${tags.length?`<div style="margin-top:16px;display:flex;gap:8px;flex-wrap:wrap;">${tags.map(t=>`<span style="background:var(--ivory);border:1px solid var(--border);color:var(--ink2);padding:4px 12px;border-radius:99px;font-size:12px;">${t}</span>`).join('')}</div>`:''}
      </div>

      ${related.length?`
      <div style="margin-top:32px;">
        <h3 style="font-family:'DM Serif Display',serif;font-size:20px;font-weight:400;margin-bottom:20px;">Similar Vendors</h3>
        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:16px;">
          ${related.map(r=>`
          <a href="/vendors/profile/${r.id}" style="background:#fff;border:1px solid var(--border);border-radius:16px;overflow:hidden;text-decoration:none;display:block;transition:all .2s;" onmouseover="this.style.borderColor='var(--flame)';this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='var(--border)';this.style.transform=''">
            <div style="height:120px;overflow:hidden;"><img src="${vendorImg(r)}" alt="${r.business_name}" style="width:100%;height:100%;object-fit:cover;"/></div>
            <div style="padding:14px;">
              <div style="font-size:11px;font-weight:700;color:var(--flame);text-transform:uppercase;letter-spacing:.6px;margin-bottom:3px;">${r.category}</div>
              <div style="font-size:15px;font-weight:600;color:var(--ink);margin-bottom:2px;">${r.business_name}</div>
              <div style="font-size:12px;color:var(--ink3);">${FLAGS[r.country]||''} ${r.city}</div>
            </div>
          </a>`).join('')}
        </div>
      </div>`:''}
    </div>

    <aside>
      <div class="pcard">
        <h3 style="font-family:'DM Serif Display',serif;font-size:18px;font-weight:400;margin-bottom:16px;border-bottom:2px solid var(--ink);padding-bottom:12px;">Vendor Details</h3>
        <div class="pstat"><div class="pstat-icon">📍</div><div><div class="pstat-label">Location</div><div class="pstat-value">${v.city}, ${cn}</div></div></div>
        <div class="pstat"><div class="pstat-icon">🏷️</div><div><div class="pstat-label">Category</div><div class="pstat-value">${v.category}</div></div></div>
        ${v.founded_year?`<div class="pstat"><div class="pstat-icon">📅</div><div><div class="pstat-label">Founded</div><div class="pstat-value">${v.founded_year}</div></div></div>`:''}
        ${v.events_attended?`<div class="pstat"><div class="pstat-icon">🎪</div><div><div class="pstat-label">Events Attended</div><div class="pstat-value">${v.events_attended}</div></div></div>`:''}
        ${v.rating?`<div class="pstat"><div class="pstat-icon">⭐</div><div><div class="pstat-label">Rating</div><div class="pstat-value">${v.rating}/5</div></div></div>`:''}
        <div class="pstat"><div class="pstat-icon">✅</div><div><div class="pstat-label">Status</div><div class="pstat-value" style="color:${v.verified?'#15803d':'#94a3b8'};">${v.verified?'✅ Verified Vendor':'🔓 Unverified'}</div></div></div>
        ${v.website?`<a href="${v.website}" target="_blank" rel="nofollow noopener" class="btn btn-primary" style="display:block;text-align:center;margin-top:20px;">Visit Website →</a>`:''}
        ${v.phone?`<a href="tel:${v.phone}" class="btn btn-outline" style="display:block;text-align:center;margin-top:8px;">📞 ${v.phone}</a>`:''}
        <button onclick="shareVendor()" class="btn btn-ghost" style="width:100%;margin-top:8px;">Share Profile 🔗</button>
      </div>

      <div style="background:var(--ink);border-radius:16px;padding:24px;color:#fff;margin-bottom:16px;">
        <h4 style="font-family:'DM Serif Display',serif;font-size:17px;font-weight:400;margin-bottom:8px;">Looking for event spots?</h4>
        <p style="font-size:13px;color:rgba(255,255,255,.55);margin-bottom:16px;">Browse events with available vendor spots and apply directly.</p>
        <a href="/events" class="btn btn-primary" style="display:block;text-align:center;font-size:13px;">Browse Events →</a>
      </div>

      <ins class="adsbygoogle" style="display:block;" data-ad-client="ca-pub-2486135003689222" data-ad-format="auto" data-full-width-responsive="true"></ins>
      <script>(adsbygoogle=window.adsbygoogle||[]).push({});</script>
    </aside>
  </div>
</div>

${renderFooterSimple()}
<script>
function shareVendor() {
  if (navigator.share) { navigator.share({ title:'${v.business_name}', url:window.location.href }); }
  else { navigator.clipboard.writeText(window.location.href); alert('Link copied!'); }
}
</script>
</body></html>`;
}

// ─────────────────────────────────────
// REGISTER PAGE
// ─────────────────────────────────────
function renderRegisterPage(user, success, error) {
  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Register as a Vendor — Festmore</title>
<meta name="description" content="Create your verified vendor profile on Festmore for €49/year. Get discovered by event organisers across 11 countries."/>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="/css/main.css"/>
</head><body>
${renderNav(user)}
<div class="page-hero-small" style="background:linear-gradient(135deg,#0d1f15,#1a3d28);">
  <div class="container">
    <h1 style="color:#fff;">Create Your Vendor Profile</h1>
    <p style="color:rgba(255,255,255,.6);">Join verified vendors — €49/year, less than €5/month</p>
  </div>
</div>
<div class="container" style="padding:48px 0;max-width:820px;">
  ${error?`<div class="alert alert-error">⚠️ ${error}</div>`:''}
  ${success?`<div class="alert alert-success">✅ ${success}</div>`:''}
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:36px;">
    ${[['✅','Verified Badge','Stand out with a profile that organisers trust'],['🌍','Worldwide','Visible to organisers across Europe, Asia and beyond'],['🎪','Apply to Events','Apply directly to festivals with vendor spots']].map(([i,t,d])=>`<div style="background:#fff;border:1px solid var(--border);border-radius:16px;padding:20px;text-align:center;"><div style="font-size:24px;margin-bottom:8px;">${i}</div><div style="font-size:14px;font-weight:700;margin-bottom:4px;">${t}</div><div style="font-size:12px;color:var(--ink3);line-height:1.5;">${d}</div></div>`).join('')}
  </div>
  <div class="form-card">
    <div class="form-card-header"><h2>Business Details</h2><div class="price-badge">€49/year</div></div>
    <form method="POST" action="/vendors/register">
      <div class="form-grid">
        <div class="form-group full"><label class="form-label">Business Name *</label><input class="form-input" type="text" name="business_name" required placeholder="e.g. Nordic Street Food Co."/></div>
        <div class="form-group"><label class="form-label">Category *</label>
          <select class="form-input" name="category" required>
            <option value="">Select category…</option>
            ${CATS.map(c=>`<option value="${c}">${c}</option>`).join('')}
          </select>
        </div>
        <div class="form-group"><label class="form-label">Country *</label>
          <select class="form-input" name="country" required>
            <option value="">Select country…</option>
            ${Object.entries(COUNTRY_NAMES).map(([k,v])=>`<option value="${k}">${FLAGS[k]} ${v}</option>`).join('')}
          </select>
        </div>
        <div class="form-group"><label class="form-label">City *</label><input class="form-input" type="text" name="city" required placeholder="e.g. Copenhagen"/></div>
        <div class="form-group"><label class="form-label">Year Founded</label><input class="form-input" type="number" name="founded_year" placeholder="e.g. 2018"/></div>
        <div class="form-group"><label class="form-label">Website</label><input class="form-input" type="url" name="website" placeholder="https://your-business.com"/></div>
        <div class="form-group"><label class="form-label">Phone</label><input class="form-input" type="tel" name="phone" placeholder="+45 12 34 56 78"/></div>
        <div class="form-group"><label class="form-label">Email *</label><input class="form-input" type="email" name="email" required placeholder="your@email.com"/></div>
       
        <div class="form-group full"><label class="form-label">Business Description</label><textarea class="form-input" name="description" rows="4" placeholder="Describe your business, what you offer and what makes you great for events…"></textarea></div>
      </div>

      <!-- PHOTO UPLOAD NOTE -->
      <div style="margin-top:28px;border-top:1px solid var(--border);padding-top:28px;">
        <label style="font-size:12px;font-weight:700;color:var(--ink3);text-transform:uppercase;letter-spacing:.8px;display:block;margin-bottom:8px;">📸 Photos (optional — up to 6)</label>
        <p style="font-size:13px;color:var(--ink4);margin-bottom:16px;line-height:1.5;">Upload photos of your stall, trailer, products and setup. Vendors with photos get booked significantly more often.</p>
        <div style="background:var(--ivory);border:1.5px dashed var(--border2);border-radius:12px;padding:24px;text-align:center;color:var(--ink3);font-size:13px;">
          📷 Photo upload available in your dashboard after your profile is created and payment confirmed
        </div>
      </div>

      <div class="form-submit-area">
        <div class="price-summary"><strong>Verified Vendor Profile — €49/year</strong><span>Secure payment via Stripe · Cancel anytime</span></div>
        <button type="submit" class="btn btn-primary btn-xl" style="max-width:280px;background:#4a7c59;box-shadow:0 8px 24px rgba(74,124,89,.35);">Continue to Payment →</button>
      </div>
    </form>
  </div>
</div>
${renderFooterSimple()}
</body></html>`;
}

function renderNav(user) {
  return `<nav class="main-nav"><div class="nav-inner"><a href="/" class="logo"><span class="logo-fest">Fest</span><span class="logo-more">more</span><span class="logo-dot"></span></a><form class="nav-search" action="/events" method="GET"><span style="color:var(--ink4);font-size:15px;">🔍</span><input type="text" name="q" placeholder="Search events…"/></form><div class="nav-right">${user?`<a href="/dashboard" class="btn btn-outline btn-sm">Dashboard</a><a href="/auth/logout" class="btn btn-ghost btn-sm">Logout</a>`:`<a href="/auth/login" class="btn btn-outline btn-sm">Login</a><a href="/events/submit" class="btn btn-primary btn-sm">+ List Event</a>`}</div><button class="nav-burger" onclick="document.querySelector('.nav-mobile').classList.toggle('open')">☰</button></div><div class="nav-cats-bar"><a href="/events" class="nav-cat">🌍 All</a><a href="/events?category=festival" class="nav-cat">🎪 Festivals</a><a href="/events?category=market" class="nav-cat">🛍️ Markets</a><a href="/events?category=christmas" class="nav-cat">🎄 Xmas Markets</a><a href="/events?category=concert" class="nav-cat">🎵 Concerts</a><a href="/articles" class="nav-cat">📰 Articles</a><a href="/vendors" class="nav-cat">🏪 Vendors</a><a href="/about" class="nav-cat">ℹ️ About</a><a href="/contact" class="nav-cat">✉️ Contact</a></div><div class="nav-mobile"><a href="/events">All Events</a><a href="/articles">Articles</a><a href="/vendors">Vendors</a><a href="/about">About</a><a href="/contact">Contact</a><a href="/events/submit">+ List Event</a>${user?`<a href="/dashboard">Dashboard</a><a href="/auth/logout">Logout</a>`:`<a href="/auth/login">Login</a>`}</div></nav>`;
}

function renderFooterSimple() {
  return `<footer><div class="footer-bottom"><span>© ${new Date().getFullYear()} Festmore.com — All rights reserved</span><div style="display:flex;gap:20px;flex-wrap:wrap;"><a href="/" style="color:rgba(255,255,255,.35);font-size:13px;">Home</a><a href="/events" style="color:rgba(255,255,255,.35);font-size:13px;">Events</a><a href="/vendors" style="color:rgba(255,255,255,.35);font-size:13px;">Vendors</a><a href="/about" style="color:rgba(255,255,255,.35);font-size:13px;">About</a><a href="/contact" style="color:rgba(255,255,255,.35);font-size:13px;">Contact</a><a href="/privacy" style="color:rgba(255,255,255,.35);font-size:13px;">Privacy</a></div></div></footer>`;
}