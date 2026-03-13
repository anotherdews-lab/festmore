// routes/vendors.js — POLISHED VERSION
const express = require('express');
const router  = express.Router();
const db      = require('../db');
const stripe  = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_live_placeholder');

const VENDOR_IMGS = [
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=75',
  'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=400&q=75',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=75',
  'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=400&q=75',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=75',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=75',
];

function vendorImg(id) {
  return VENDOR_IMGS[id % VENDOR_IMGS.length];
}

// ─────────────────────────────────────
// VENDOR LISTING PAGE
// ─────────────────────────────────────
router.get('/', (req, res) => {
  const { category = 'ALL', country = 'ALL', q = '' } = req.query;
  let where = ["status='active'"];
  let params = [];
  if (category !== 'ALL') { where.push("category=?"); params.push(category); }
  if (country !== 'ALL')  { where.push("country=?");  params.push(country); }
  if (q) { where.push("(business_name LIKE ? OR description LIKE ? OR city LIKE ?)"); params.push(`%${q}%`,`%${q}%`,`%${q}%`); }
  const vendors = db.prepare(`SELECT * FROM vendors WHERE ${where.join(' AND ')} ORDER BY premium DESC, rating DESC, events_attended DESC LIMIT 48`).all(...params);

  const cats = ['Food & Drinks','Artisan Crafts','Technology','Event Decor','Entertainment','Photography','Kids Activities','Fashion & Apparel','Art & Prints','Live Music','Retail','Services'];
  const COUNTRY_NAMES = { BE:'Belgium',CN:'China',DK:'Denmark',FR:'France',DE:'Germany',NL:'Netherlands',PL:'Poland',SE:'Sweden',AE:'UAE',GB:'United Kingdom',US:'USA' };
  const FLAGS = { BE:'🇧🇪',CN:'🇨🇳',DK:'🇩🇰',FR:'🇫🇷',DE:'🇩🇪',NL:'🇳🇱',PL:'🇵🇱',SE:'🇸🇪',AE:'🇦🇪',GB:'🇬🇧',US:'🇺🇸' };

  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Verified Vendors for Events & Festivals | Festmore</title>
<meta name="description" content="Browse ${vendors.length}+ verified vendors for your festival, market or event. Food vendors, artisans, entertainers and more across Europe."/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/>
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2486135003689222" crossorigin="anonymous"></script>
<link rel="stylesheet" href="/css/main.css"/>
</head>
<body>

${renderNav(req.session.user)}

<!-- PAGE HERO -->
<div class="page-hero-small">
  <div class="container">
    <h1>🏪 Verified Vendors</h1>
    <p>${vendors.length} vendors ready to join your event</p>
  </div>
</div>

<div class="container" style="padding:40px 0;">

  <!-- FILTERS -->
  <form style="background:#fff;border:1px solid var(--border);border-radius:16px;padding:22px 28px;display:flex;gap:14px;align-items:flex-end;flex-wrap:wrap;margin-bottom:32px;box-shadow:var(--shadow);" method="GET" action="/vendors">
    <div style="display:flex;flex-direction:column;gap:5px;flex:2;min-width:180px;">
      <label style="font-size:10px;font-weight:700;color:var(--ink4);letter-spacing:1px;text-transform:uppercase;">Search</label>
      <input style="background:var(--ivory);border:1.5px solid var(--border2);border-radius:9px;padding:10px 13px;font-size:13.5px;color:var(--ink);outline:none;" type="text" name="q" value="${q}" placeholder="Business name, city…"/>
    </div>
    <div style="display:flex;flex-direction:column;gap:5px;flex:1;min-width:150px;">
      <label style="font-size:10px;font-weight:700;color:var(--ink4);letter-spacing:1px;text-transform:uppercase;">Category</label>
      <select style="background:var(--ivory);border:1.5px solid var(--border2);border-radius:9px;padding:10px 13px;font-size:13.5px;color:var(--ink);outline:none;" name="category">
        <option value="ALL" ${category==='ALL'?'selected':''}>All Categories</option>
        ${cats.map(c=>`<option value="${c}" ${category===c?'selected':''}>${c}</option>`).join('')}
      </select>
    </div>
    <div style="display:flex;flex-direction:column;gap:5px;flex:1;min-width:150px;">
      <label style="font-size:10px;font-weight:700;color:var(--ink4);letter-spacing:1px;text-transform:uppercase;">Country</label>
      <select style="background:var(--ivory);border:1.5px solid var(--border2);border-radius:9px;padding:10px 13px;font-size:13.5px;color:var(--ink);outline:none;" name="country">
        <option value="ALL" ${country==='ALL'?'selected':''}>All Countries</option>
        ${Object.entries(COUNTRY_NAMES).map(([k,v])=>`<option value="${k}" ${country===k?'selected':''}>${FLAGS[k]} ${v}</option>`).join('')}
      </select>
    </div>
    <button type="submit" class="btn btn-primary" style="align-self:flex-end;padding:11px 26px;">Search</button>
  </form>

  <!-- AD -->
  <div style="margin-bottom:32px;"><div class="ad-label-small">Advertisement</div>
  <ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-2486135003689222" data-ad-format="auto" data-full-width-responsive="true"></ins>
  <script>(adsbygoogle = window.adsbygoogle || []).push({});</script></div>

  <!-- VENDOR GRID -->
  ${vendors.length === 0 ? `
    <div class="empty-state">
      <div style="font-size:52px;margin-bottom:16px;">🏪</div>
      <h2>No vendors found</h2>
      <p>Try different filters or <a href="/vendors" style="color:var(--flame);">clear all filters</a></p>
    </div>` : `
  <div class="events-grid">
    ${vendors.map(v => `
    <div class="vendor-card">
      <div class="vendor-img">
        <img src="${vendorImg(v.id)}" alt="${v.business_name}" loading="lazy"/>
        ${v.premium ? '<span style="position:absolute;top:12px;right:12px;background:var(--gold);color:#fff;padding:3px 10px;border-radius:99px;font-size:10px;font-weight:700;">💎 Premium</span>' : ''}
        ${v.verified ? '<span style="position:absolute;top:12px;left:12px;background:var(--sage);color:#fff;padding:3px 10px;border-radius:99px;font-size:10px;font-weight:700;">✓ Verified</span>' : ''}
      </div>
      <div class="vendor-body">
        <div class="vendor-category">${v.category}</div>
        <div class="vendor-name">${v.business_name}</div>
        <div class="vendor-loc">📍 ${v.city}${v.country ? ', ' + (FLAGS[v.country] || '') : ''}</div>
        <div class="vendor-stats">
          <span>🎪 ${v.events_attended || 0} events</span>
          <span>⭐ ${v.rating || 'New'}</span>
        </div>
        ${v.description ? `<p style="font-size:12.5px;color:var(--ink3);margin-top:10px;line-height:1.55;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${v.description}</p>` : ''}
      </div>
    </div>`).join('')}
  </div>`}

  <!-- VENDOR CTA BANNER -->
  <div class="vendor-cta-banner">
    <h2>Are You a Vendor?</h2>
    <p>Create your verified vendor profile and start applying to festivals, markets and events across Europe and beyond. One listing, unlimited opportunities.</p>
    <a href="/vendors/register" class="btn btn-primary btn-lg" style="display:inline-flex;">Create Vendor Profile — €49/year →</a>
    <div class="vendor-features">
      ${[
        ['✅','Verified Badge','Stand out with official verification'],
        ['🎪','Event Applications','Apply to festivals & markets directly'],
        ['🌍','Europe-wide','Visible to organisers in 11 countries'],
        ['📊','Profile Analytics','See who views your profile'],
      ].map(([icon, title, desc]) => `
        <div class="vendor-feature">
          <span class="vendor-feature-icon">${icon}</span>
          <div class="vendor-feature-title">${title}</div>
          <div class="vendor-feature-desc">${desc}</div>
        </div>`).join('')}
    </div>
  </div>

  <!-- AD BOTTOM -->
  <div style="margin-top:48px;"><div class="ad-label-small">Advertisement</div>
  <ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-2486135003689222" data-ad-format="auto" data-full-width-responsive="true"></ins>
  <script>(adsbygoogle = window.adsbygoogle || []).push({});</script></div>
</div>

${renderFooterSimple()}
</body>
</html>`);
});

// ─────────────────────────────────────
// REGISTER PAGE
// ─────────────────────────────────────
router.get('/register', (req, res) => {
  const error = req.query.error || '';
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Become a Verified Vendor — Festmore</title>
<meta name="description" content="Create your vendor profile on Festmore and get discovered by event organisers across Europe. €49/year."/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="/css/main.css"/>
</head>
<body>

${renderNav(req.session.user)}

<div class="page-hero-small" style="background:linear-gradient(135deg,#2d5a3d,#1a3d28);">
  <div class="container">
    <h1>🏪 Become a Verified Vendor</h1>
    <p>Create your profile and get discovered by event organisers — €49/year</p>
  </div>
</div>

<div class="container" style="padding:48px 0;display:grid;grid-template-columns:1fr 380px;gap:48px;align-items:start;max-width:1100px;">

  <!-- FORM -->
  <div>
    ${error ? `<div class="alert alert-error">⚠️ ${error}</div>` : ''}
    <div class="form-card">
      <div class="form-card-header">
        <h2>Vendor Profile</h2>
        <div class="price-badge">€49 / year</div>
      </div>
      <form method="POST" action="/vendors/register">
        <div class="form-grid">
          <div class="form-group full">
            <label class="form-label">Business Name *</label>
            <input class="form-input" type="text" name="business_name" required placeholder="e.g. Bratwurst Brothers"/>
          </div>
          <div class="form-group">
            <label class="form-label">Category *</label>
            <select class="form-input" name="category" required>
              <option value="">Select…</option>
              ${['Food & Drinks','Artisan Crafts','Technology','Event Decor','Entertainment','Photography','Kids Activities','Fashion & Apparel','Art & Prints','Live Music','Retail','Services'].map(c=>`<option>${c}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Country *</label>
            <select class="form-input" name="country" required>
              <option value="">Select…</option>
              ${Object.entries({BE:'Belgium',CN:'China',DK:'Denmark',FR:'France',DE:'Germany',NL:'Netherlands',PL:'Poland',SE:'Sweden',AE:'UAE',GB:'United Kingdom',US:'USA'}).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">City *</label>
            <input class="form-input" type="text" name="city" required placeholder="Your city"/>
          </div>
          <div class="form-group">
            <label class="form-label">Your Email *</label>
            <input class="form-input" type="email" name="email" required placeholder="you@example.com"/>
          </div>
          <div class="form-group">
            <label class="form-label">Website</label>
            <input class="form-input" type="url" name="website" placeholder="https://"/>
          </div>
          <div class="form-group full">
            <label class="form-label">About Your Business *</label>
            <textarea class="form-input" name="description" rows="4" required placeholder="What do you offer? What events are you looking for? What makes your business special? (min. 50 words recommended)"></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Events Attended So Far</label>
            <input class="form-input" type="number" name="events_attended" placeholder="0" value="0" min="0"/>
          </div>
        </div>
        <div class="form-submit-area">
          <div class="price-summary">
            <strong>€49 / year</strong>
            <span>Verified badge · Unlimited event applications</span>
          </div>
          <button type="submit" class="btn btn-primary btn-xl" style="max-width:260px;">Continue to Payment →</button>
        </div>
        <div class="trust-bar">
          <div class="trust-item"><span class="trust-icon">🔒</span> Secure Stripe payment</div>
          <div class="trust-item"><span class="trust-icon">✅</span> Live within 24 hours</div>
          <div class="trust-item"><span class="trust-icon">🔄</span> Annual renewal</div>
        </div>
      </form>
    </div>
  </div>

  <!-- SIDEBAR -->
  <aside>
    <div style="background:var(--ink);border-radius:20px;padding:28px;color:#fff;position:sticky;top:90px;">
      <div style="font-size:32px;margin-bottom:12px;">🏪</div>
      <h3 style="font-family:'DM Serif Display',serif;font-size:20px;font-weight:400;margin-bottom:10px;">Why join as a Vendor?</h3>
      <p style="color:rgba(255,255,255,.55);font-size:13.5px;line-height:1.7;margin-bottom:20px;">Get discovered by event organisers actively searching for vendors like you.</p>
      ${[
        ['✅','Verified badge on your profile'],
        ['🎪','Apply to events & festivals directly'],
        ['🌍','Visible in 11 countries across Europe'],
        ['📧','Included in weekly newsletter'],
        ['📊','Profile view analytics'],
        ['🏆','Featured in vendor search results'],
      ].map(([icon, text]) => `
        <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,.07);font-size:13.5px;color:rgba(255,255,255,.75);">
          <span style="font-size:16px;flex-shrink:0;">${icon}</span> ${text}
        </div>`).join('')}
      <div style="margin-top:20px;padding:16px;background:rgba(232,71,10,.12);border:1px solid rgba(232,71,10,.25);border-radius:12px;text-align:center;">
        <div style="font-size:28px;font-family:'DM Serif Display',serif;color:#fff;">€49</div>
        <div style="font-size:12px;color:rgba(255,255,255,.5);margin-top:2px;">per year · less than €5/month</div>
      </div>
    </div>
  </aside>
</div>

${renderFooterSimple()}
</body>
</html>`);
});

// ─────────────────────────────────────
// REGISTER POST
// ─────────────────────────────────────
router.post('/register', async (req, res) => {
  const { business_name, category, city, country, email, description, website, events_attended } = req.body;
  const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-');
  let slug = slugify(business_name + '-' + city);
  let i = 1;
  while (db.prepare('SELECT id FROM vendors WHERE slug=?').get(slug)) { slug = slugify(business_name + '-' + city) + '-' + i++; }
  const result = db.prepare(`INSERT INTO vendors (business_name,slug,category,city,country,email,description,website,events_attended,status,payment_status) VALUES (?,?,?,?,?,?,?,?,?,'pending','unpaid')`).run(business_name, slug, category, city, country, email || '', description || '', website || '', parseInt(events_attended) || 0);
  const vendorId = result.lastInsertRowid;
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price_data: { currency: 'eur', product_data: { name: `Festmore Vendor Profile — ${business_name}`, description: 'Annual vendor profile on Festmore.com. Verified badge + event applications.' }, unit_amount: parseInt(process.env.PRICE_VENDOR_YEARLY) || 4900 }, quantity: 1 }],
      mode: 'payment',
      success_url: `${process.env.SITE_URL || 'http://localhost:3000'}/vendors/payment-success?vendor_id=${vendorId}`,
      cancel_url: `${process.env.SITE_URL || 'http://localhost:3000'}/vendors/register?error=Payment cancelled`,
      metadata: { vendor_id: String(vendorId), type: 'vendor_profile' },
      customer_email: email || undefined,
    });
    res.redirect(session.url);
  } catch (err) {
    console.error('Stripe error:', err.message);
    res.redirect('/vendors/register?error=Payment unavailable. Please try again or contact us.');
  }
});

// ─────────────────────────────────────
// PAYMENT SUCCESS
// ─────────────────────────────────────
router.get('/payment-success', (req, res) => {
  const { vendor_id } = req.query;
  if (vendor_id) {
    db.prepare("UPDATE vendors SET payment_status='paid',status='active',verified=1 WHERE id=?").run(parseInt(vendor_id));
  }
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Welcome to Festmore Vendors!</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="/css/main.css"/>
</head>
<body style="background:var(--cream);min-height:100vh;display:flex;align-items:center;justify-content:center;">
  <div style="max-width:560px;margin:0 auto;text-align:center;padding:48px 32px;">
    <div style="width:88px;height:88px;background:rgba(74,124,89,.1);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 24px;font-size:44px;">🎉</div>
    <h1 style="font-family:'DM Serif Display',serif;font-size:36px;font-weight:400;margin-bottom:12px;">You're a Verified Vendor!</h1>
    <p style="color:var(--ink3);font-size:16px;line-height:1.75;margin-bottom:32px;">Your profile is now live on Festmore. Event organisers across Europe can find you and you can start applying to events.</p>
    <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
      <a href="/vendors" class="btn btn-primary btn-lg">View All Vendors →</a>
      <a href="/events" class="btn btn-outline btn-lg">Browse Events</a>
    </div>
    <div style="margin-top:36px;padding:20px;background:#fff;border:1px solid var(--border);border-radius:14px;display:flex;justify-content:center;gap:28px;flex-wrap:wrap;">
      ${[['✅','Profile Live'],['🌍','11 Countries'],['📧','In Newsletter']].map(([icon, label]) => `
        <div style="text-align:center;">
          <div style="font-size:22px;">${icon}</div>
          <div style="font-size:12px;font-weight:600;color:var(--ink3);margin-top:4px;">${label}</div>
        </div>`).join('')}
    </div>
  </div>
</body>
</html>`);
});

module.exports = router;

// ─────────────────────────────────────
// SHARED HELPERS
// ─────────────────────────────────────
function renderNav(user) {
  return `<nav class="main-nav">
  <div class="nav-inner">
    <a href="/" class="logo"><span class="logo-fest">Fest</span><span class="logo-more">more</span><span class="logo-dot"></span></a>
    <form class="nav-search" action="/events" method="GET">
      <span style="color:var(--ink4);font-size:15px;">🔍</span>
      <input type="text" name="q" placeholder="Search events…"/>
    </form>
    <div class="nav-right">
      ${user
        ? `<a href="/dashboard" class="btn btn-outline btn-sm">Dashboard</a><a href="/auth/logout" class="btn btn-ghost btn-sm">Logout</a>`
        : `<a href="/auth/login" class="btn btn-outline btn-sm">Login</a><a href="/events/submit" class="btn btn-primary btn-sm">+ List Event</a>`
      }
    </div>
    <button class="nav-burger" onclick="document.querySelector('.nav-mobile').classList.toggle('open')">☰</button>
  </div>
  <div class="nav-cats-bar">
    <a href="/events" class="nav-cat">🌍 All</a>
    <a href="/events?category=festival" class="nav-cat">🎪 Festivals</a>
    <a href="/events?category=market" class="nav-cat">🛍️ Markets</a>
    <a href="/events?category=christmas" class="nav-cat">🎄 Xmas Markets</a>
    <a href="/events?category=concert" class="nav-cat">🎵 Concerts</a>
    <a href="/events?category=city" class="nav-cat">🏙️ City Events</a>
    <a href="/articles" class="nav-cat">📰 Articles</a>
    <a href="/vendors" class="nav-cat" style="color:var(--flame);border-bottom:2px solid var(--flame);">🏪 Vendors</a>
  </div>
  <div class="nav-mobile">
    <a href="/events">🌍 All Events</a>
    <a href="/articles">📰 Articles</a>
    <a href="/vendors">🏪 Vendors</a>
    <a href="/events/submit">+ List Your Event</a>
    ${user ? `<a href="/dashboard">Dashboard</a><a href="/auth/logout">Logout</a>` : `<a href="/auth/login">Login</a>`}
  </div>
</nav>`;
}

function renderFooterSimple() {
  return `<footer>
  <div class="footer-bottom">
    <span>© ${new Date().getFullYear()} Festmore.com — All rights reserved</span>
    <div style="display:flex;gap:20px;">
      <a href="/" style="color:rgba(255,255,255,.35);font-size:13px;">Home</a>
      <a href="/events" style="color:rgba(255,255,255,.35);font-size:13px;">Events</a>
      <a href="/vendors" style="color:rgba(255,255,255,.35);font-size:13px;">Vendors</a>
      <a href="/articles" style="color:rgba(255,255,255,.35);font-size:13px;">Articles</a>
      <a href="/privacy" style="color:rgba(255,255,255,.35);font-size:13px;">Privacy</a>
    </div>
  </div>
</footer>`;
}