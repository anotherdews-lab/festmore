// routes/events.js — WITH FREE LISTING OPTION
const express = require('express');
const router  = express.Router();
const db      = require('../db');
const stripe  = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_live_placeholder');

const IMGS = {
  festival:'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&q=70',
  concert:'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=70',
  market:'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=70',
  christmas:'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=600&q=70',
  exhibition:'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=70',
  business:'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=70',
  kids:'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&q=70',
  comics:'https://images.unsplash.com/photo-1608889825205-eebdb9fc5806?w=600&q=70',
  flea:'https://images.unsplash.com/photo-1558402847-7f9d6d65b41c?w=600&q=70',
  online:'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=600&q=70',
  city:'https://images.unsplash.com/photo-1467803738586-46b7eb7b16a1?w=600&q=70',
  messe:'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&q=70',
};
const FLAGS = { BE:'🇧🇪',CN:'🇨🇳',DK:'🇩🇰',FR:'🇫🇷',DE:'🇩🇪',NL:'🇳🇱',PL:'🇵🇱',SE:'🇸🇪',AE:'🇦🇪',GB:'🇬🇧',US:'🇺🇸' };
const CATS = { festival:'🎪',concert:'🎵',market:'🛍️',christmas:'🎄',exhibition:'🖼️',business:'💼',kids:'🎠',comics:'🎮',flea:'🏺',online:'💻',city:'🏙️',messe:'🏛️' };
const CAT_NAMES = { festival:'Festivals',concert:'Concerts',market:'Markets',christmas:'Christmas Markets',exhibition:'Exhibitions',business:'Business & Fairs',kids:'Kids Events',comics:'Comics & Gaming',flea:'Flea Markets',online:'Online Events',city:'City Events',messe:'Trade Fairs' };
const COUNTRY_NAMES = { BE:'Belgium',CN:'China',DK:'Denmark',FR:'France',DE:'Germany',NL:'Netherlands',PL:'Poland',SE:'Sweden',AE:'UAE',GB:'United Kingdom',US:'USA' };

// ─────────────────────────────────────
// EVENTS LISTING PAGE
// ─────────────────────────────────────
router.get('/', (req, res) => {
  const { q='', country='ALL', category='ALL', price='ALL', sort='featured', page=1 } = req.query;
  const perPage = 12;
  const offset  = (parseInt(page)-1) * perPage;
  let where = ["e.status='active'"];
  let params = [];
  if (country !== 'ALL')   { where.push("e.country=?");   params.push(country); }
  if (category !== 'ALL')  { where.push("e.category=?");  params.push(category); }
  if (price === 'free')    { where.push("e.price_display='Free'"); }
  if (price === 'paid')    { where.push("e.price_display!='Free'"); }
  if (q) {
    where.push("(e.title LIKE ? OR e.city LIKE ? OR e.description LIKE ? OR e.tags LIKE ?)");
    params.push(`%${q}%`,`%${q}%`,`%${q}%`,`%${q}%`);
  }
  const whereStr = where.join(' AND ');
  let orderBy = 'e.featured DESC, e.views DESC';
  if (sort === 'date')     orderBy = 'e.start_date ASC';
  if (sort === 'visitors') orderBy = 'e.attendees DESC';
  const total = db.prepare(`SELECT COUNT(*) as n FROM events e WHERE ${whereStr}`).get(...params).n;
  const events = db.prepare(`SELECT * FROM events e WHERE ${whereStr} ORDER BY ${orderBy} LIMIT ? OFFSET ?`).all(...params, perPage, offset);
  const totalPages = Math.ceil(total / perPage);
  res.send(renderEventsPage({ events, total, totalPages, page: parseInt(page), q, country, category, price, sort, user: req.session.user }));
});

// ─────────────────────────────────────
// PRICING PAGE — NEW
// ─────────────────────────────────────
router.get('/pricing', (req, res) => {
  res.send(renderPricingPage(req.session.user, req.query.error));
});

// ─────────────────────────────────────
// SUBMIT PAGE — NOW SHOWS PLAN CHOICE
// ─────────────────────────────────────
router.get('/submit', (req, res) => {
  const plan = req.query.plan || '';
  res.send(renderSubmitPage(req.session.user, req.query.success, req.query.error, plan));
});

router.post('/submit', async (req, res) => {
  const { title, category, city, country, start_date, end_date, date_display,
          description, price_display, website, ticket_url, attendees, vendor_spots,
          address, tags, name, email, plan } = req.body;

  if (!title || !category || !city || !country || !start_date) {
    return res.redirect('/events/submit?error=Please fill in all required fields&plan=' + (plan||'free'));
  }

  const slugify = require('slugify');
  const baseSlug = slugify(title + '-' + city + '-' + new Date(start_date).getFullYear(), { lower: true, strict: true });
  let slug = baseSlug;
  let i = 1;
  while (db.prepare('SELECT id FROM events WHERE slug=?').get(slug)) {
    slug = `${baseSlug}-${i++}`;
  }

  // ── FREE PLAN ──
  if (plan === 'free') {
    db.prepare(`
      INSERT INTO events (title,slug,category,city,country,start_date,end_date,date_display,
        description,price_display,website,ticket_url,attendees,vendor_spots,address,tags,
        status,payment_status,source,featured)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'active','free','manual',0)
    `).run(title,slug,category,city,country,start_date,end_date||'',date_display||'',
        description||'',price_display||'Free',website||'',ticket_url||'',
        parseInt(attendees)||0,parseInt(vendor_spots)||0,address||'',tags||'[]');

    return res.redirect('/events/submit-success?plan=free&slug=' + slug);
  }

  // ── STANDARD (€79) or PREMIUM (€149) ──
  const isPremium = plan === 'premium';
  const amount    = isPremium ? 14900 : 7900;
  const planName  = isPremium ? 'Premium' : 'Standard';

  const result = db.prepare(`
    INSERT INTO events (title,slug,category,city,country,start_date,end_date,date_display,
      description,price_display,website,ticket_url,attendees,vendor_spots,address,tags,
      status,payment_status,source,featured)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'pending','unpaid','manual',?)
  `).run(title,slug,category,city,country,start_date,end_date||'',date_display||'',
      description||'',price_display||'Free',website||'',ticket_url||'',
      parseInt(attendees)||0,parseInt(vendor_spots)||0,address||'',tags||'[]',
      isPremium ? 1 : 0);

  const eventId = result.lastInsertRowid;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: `Festmore ${planName} Event Listing`,
            description: `${planName} annual listing for "${title}" on Festmore.com`,
          },
          unit_amount: amount,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: 'https://festmore.com/events/payment-success?event_id=' + eventId + '&plan=' + plan,
      cancel_url: 'https://festmore.com/events/submit?error=Payment+cancelled&plan=' + plan,
      metadata: { event_id: String(eventId), type: 'event_listing', plan },
      customer_email: email || undefined,
    });
    db.prepare(`INSERT OR IGNORE INTO payments (stripe_session_id,amount,type,status,reference_id) VALUES (?,?,?,?,?)`)
      .run(session.id, amount, 'event_listing', 'pending', eventId);
    res.redirect(session.url);
  } catch (err) {
    console.error('Stripe error:', err.message);
    res.redirect('/events/submit?error=Payment+unavailable.+Please+try+again.&plan=' + plan);
  }
});

// ─────────────────────────────────────
// FREE SUBMIT SUCCESS
// ─────────────────────────────────────
router.get('/submit-success', (req, res) => {
  const { plan, slug } = req.query;
  res.send(`<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Event Listed — Festmore</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="/css/main.css"/>
</head><body style="background:var(--cream);min-height:100vh;display:flex;align-items:center;justify-content:center;">
<div style="max-width:580px;margin:0 auto;text-align:center;padding:48px 32px;">
  <div style="font-size:64px;margin-bottom:20px;">${plan === 'free' ? '✅' : '🎉'}</div>
  <h1 style="font-family:'DM Serif Display',serif;font-size:36px;font-weight:400;margin-bottom:12px;">
    ${plan === 'free' ? 'Your Event is Live!' : 'Payment Successful!'}
  </h1>
  <p style="color:var(--ink3);font-size:16px;line-height:1.75;margin-bottom:28px;">
    ${plan === 'free'
      ? 'Your free listing is now live on Festmore. Upgrade to Standard or Premium anytime to get featured placement, SEO boost and newsletter inclusion.'
      : 'Your event is now featured on Festmore and visible to thousands of visitors worldwide.'
    }
  </p>
  ${plan === 'free' ? `
  <div style="background:var(--ivory);border:1px solid var(--border);border-radius:16px;padding:24px;margin-bottom:24px;text-align:left;">
    <h3 style="font-family:'DM Serif Display',serif;font-size:18px;margin-bottom:12px;">Want more visibility?</h3>
    <p style="font-size:14px;color:var(--ink3);margin-bottom:16px;">Upgrade to Standard (€79/yr) or Premium (€149/yr) to get:</p>
    ${['Featured placement in search results','Included in weekly newsletter','SEO-optimised listing page','Priority support'].map(b => '<div style="display:flex;align-items:center;gap:8px;padding:6px 0;font-size:13.5px;color:var(--ink2);">✅ ' + b + '</div>').join('')}
    <a href="/events/pricing" style="display:block;text-align:center;margin-top:16px;" class="btn btn-primary">Upgrade Now →</a>
  </div>` : ''}
  <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
    <a href="/events/${slug || ''}" class="btn btn-primary btn-lg">View Your Event →</a>
    <a href="/events" class="btn btn-outline btn-lg">Browse Events</a>
  </div>
</div></body></html>`);
});

// ─────────────────────────────────────
// PAYMENT SUCCESS
// ─────────────────────────────────────
router.get('/payment-success', (req, res) => {
  const { event_id, plan } = req.query;
  if (event_id) {
    const isPremium = plan === 'premium';
    db.prepare("UPDATE events SET payment_status='paid', status='active', featured=? WHERE id=?")
      .run(isPremium ? 1 : 0, parseInt(event_id));
    db.prepare("UPDATE payments SET status='completed' WHERE reference_id=?").run(parseInt(event_id));
  }
  const event = event_id ? db.prepare("SELECT * FROM events WHERE id=?").get(parseInt(event_id)) : null;
  res.redirect('/events/submit-success?plan=' + (plan||'standard') + '&slug=' + (event ? event.slug : ''));
});

// ─────────────────────────────────────
// EVENT DETAIL PAGE
// ─────────────────────────────────────
router.get('/:slug', (req, res) => {
  const event = db.prepare("SELECT * FROM events WHERE slug=? AND status='active'").get(req.params.slug);
  if (!event) return res.status(404).redirect('/events?error=Event not found');
  db.prepare("UPDATE events SET views=views+1 WHERE id=?").run(event.id);
  const related = db.prepare(`SELECT * FROM events WHERE status='active' AND category=? AND id!=? ORDER BY featured DESC, views DESC LIMIT 4`).all(event.category, event.id);
  res.send(renderEventDetail(event, related, req.session.user));
});

module.exports = router;

// ─────────────────────────────────────
// PRICING PAGE
// ─────────────────────────────────────
function renderPricingPage(user, error) {
  const plans = [
    {
      name: 'Free',
      price: '€0',
      period: 'forever',
      color: 'var(--sage)',
      cta: 'List for Free',
      plan: 'free',
      highlight: false,
      features: [
        ['✅', 'Your event live within 24 hours'],
        ['✅', 'Basic event listing page'],
        ['✅', 'Visible in search results'],
        ['✅', 'Event details and links'],
        ['❌', 'Featured placement'],
        ['❌', 'Newsletter inclusion'],
        ['❌', 'SEO optimised title & meta'],
        ['❌', 'Priority support'],
      ]
    },
    {
      name: 'Standard',
      price: '€79',
      period: '/year',
      color: 'var(--flame)',
      cta: 'Get Standard',
      plan: 'standard',
      highlight: true,
      features: [
        ['✅', 'Your event live within 24 hours'],
        ['✅', 'Full SEO-optimised listing page'],
        ['✅', 'Featured in search results'],
        ['✅', 'Included in weekly newsletter'],
        ['✅', 'Your own URL on Festmore'],
        ['✅', 'Track views and analytics'],
        ['✅', 'Connect with verified vendors'],
        ['✅', 'Priority support'],
      ]
    },
    {
      name: 'Premium',
      price: '€149',
      period: '/year',
      color: 'var(--gold)',
      cta: 'Get Premium',
      plan: 'premium',
      highlight: false,
      features: [
        ['✅', 'Everything in Standard'],
        ['⭐', 'Top of search results'],
        ['⭐', 'Featured on homepage'],
        ['⭐', 'Dedicated newsletter feature'],
        ['⭐', 'Bold featured badge'],
        ['⭐', 'Social media promotion'],
        ['⭐', 'Monthly performance report'],
        ['⭐', 'Dedicated account manager'],
      ]
    },
  ];

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Event Listing Plans — Festmore</title>
<meta name="description" content="List your event on Festmore. Free, Standard (€79/yr) and Premium (€149/yr) plans. Reach thousands of visitors across 11 countries."/>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="/css/main.css"/>
</head>
<body>
${renderNavSimple(user)}

<div class="page-hero-small">
  <div class="container">
    <h1>List Your Event on Festmore</h1>
    <p>Choose the plan that works for you — start free, upgrade anytime</p>
  </div>
</div>

<div class="container" style="padding:64px 0;max-width:1100px;">

  ${error ? `<div class="alert alert-error" style="margin-bottom:32px;">⚠️ ${error}</div>` : ''}

  <!-- PLANS GRID -->
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:24px;margin-bottom:56px;">
    ${plans.map(p => `
    <div style="background:#fff;border:2px solid ${p.highlight ? 'var(--flame)' : 'var(--border)'};border-radius:24px;padding:36px 32px;position:relative;${p.highlight ? 'box-shadow:0 20px 60px rgba(232,71,10,.15);' : ''}">
      ${p.highlight ? '<div style="position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:var(--flame);color:#fff;padding:4px 20px;border-radius:99px;font-size:12px;font-weight:700;white-space:nowrap;">Most Popular</div>' : ''}
      <div style="font-size:13px;font-weight:700;color:${p.color};text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">${p.name}</div>
      <div style="display:flex;align-items:baseline;gap:4px;margin-bottom:6px;">
        <span style="font-family:'DM Serif Display',serif;font-size:48px;color:var(--ink);line-height:1;">${p.price}</span>
        <span style="color:var(--ink4);font-size:15px;">${p.period}</span>
      </div>
      <p style="font-size:13px;color:var(--ink4);margin-bottom:28px;">${p.name === 'Free' ? 'Perfect to get started' : p.name === 'Standard' ? 'Best for most events' : 'Maximum visibility'}</p>
      ${p.features.map(([icon, text]) => `<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);font-size:13.5px;color:var(--ink2);">${icon} ${text}</div>`).join('')}
      <a href="/events/submit?plan=${p.plan}" class="btn ${p.highlight ? 'btn-primary' : 'btn-outline'}" style="display:block;text-align:center;margin-top:24px;padding:13px 24px;font-size:15px;">${p.cta} →</a>
    </div>`).join('')}
  </div>

  <!-- FAQ -->
  <div style="max-width:700px;margin:0 auto;">
    <h2 style="font-family:'DM Serif Display',serif;font-size:30px;font-weight:400;text-align:center;margin-bottom:36px;">Frequently Asked Questions</h2>
    ${[
      ['Can I upgrade from Free to Standard later?', 'Yes! You can upgrade your listing at any time. Just go to your dashboard and click Upgrade. Your event details are already saved.'],
      ['How quickly will my event go live?', 'Free listings go live immediately. Standard and Premium listings go live as soon as payment is confirmed — usually within minutes.'],
      ['What countries can I list events for?', 'You can list events from any of our 11 covered countries: Germany, Denmark, Netherlands, UK, France, Sweden, Belgium, Poland, UAE, USA and China.'],
      ['Can I cancel my listing?', 'Standard and Premium listings are annual. You can request a refund within 14 days of purchase if you are not satisfied.'],
      ['What payment methods do you accept?', 'We accept all major credit and debit cards through our secure Stripe payment system. No PayPal currently.'],
      ['Is the free listing really free forever?', 'Yes — the free tier is free forever. We will never charge you without your consent. You can upgrade whenever you choose.'],
    ].map(([q, a]) => `
    <div style="padding:20px 0;border-bottom:1px solid var(--border);">
      <div style="font-weight:700;font-size:15px;color:var(--ink);margin-bottom:8px;">${q}</div>
      <div style="font-size:14px;color:var(--ink3);line-height:1.7;">${a}</div>
    </div>`).join('')}
  </div>

</div>

${renderFooterSimple()}
</body>
</html>`;
}

// ─────────────────────────────────────
// RENDER EVENTS LIST
// ─────────────────────────────────────
function renderEventsPage({ events, total, totalPages, page, q, country, category, price, sort, user }) {
  const params = new URLSearchParams({ q, country, category, price, sort });
  return `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>${category!=='ALL'?CAT_NAMES[category]+' — ':''}${country!=='ALL'?COUNTRY_NAMES[country]+' ':''}Events ${new Date().getFullYear()} | Festmore</title>
<meta name="description" content="Browse ${total}+ ${category!=='ALL'?CAT_NAMES[category]:''} events${country!=='ALL'?' in '+COUNTRY_NAMES[country]:'worldwide'}. Free and paid events, festivals, markets and more on Festmore."/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/>
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2486135003689222" crossorigin="anonymous"></script>
<link rel="stylesheet" href="/css/main.css"/>
</head><body>
${renderNavSimple(user)}
<div class="page-hero-small">
  <div class="container">
    <h1>${category!=='ALL'?`${CATS[category]} ${CAT_NAMES[category]}`:country!=='ALL'?`${FLAGS[country]} Events in ${COUNTRY_NAMES[country]}`:'🌍 All Events'}</h1>
    <p>${total} events found${q?' for "'+q+'"':''}</p>
  </div>
</div>
<div class="container" style="padding-top:32px;">
  <form class="filter-bar" method="GET" action="/events">
    <div class="filter-group"><label class="filter-label">Search</label><input class="filter-input" type="text" name="q" value="${q}" placeholder="Event name, city…"/></div>
    <div class="filter-group"><label class="filter-label">Country</label>
      <select class="filter-select" name="country">
        <option value="ALL" ${country==='ALL'?'selected':''}>All Countries</option>
        ${Object.entries(COUNTRY_NAMES).map(([k,v])=>`<option value="${k}" ${country===k?'selected':''}>${FLAGS[k]} ${v}</option>`).join('')}
      </select>
    </div>
    <div class="filter-group"><label class="filter-label">Category</label>
      <select class="filter-select" name="category">
        <option value="ALL" ${category==='ALL'?'selected':''}>All Types</option>
        ${Object.entries(CAT_NAMES).map(([k,v])=>`<option value="${k}" ${category===k?'selected':''}>${CATS[k]} ${v}</option>`).join('')}
      </select>
    </div>
    <div class="filter-group"><label class="filter-label">Price</label>
      <select class="filter-select" name="price">
        <option value="ALL" ${price==='ALL'?'selected':''}>Any Price</option>
        <option value="free" ${price==='free'?'selected':''}>Free Only</option>
        <option value="paid" ${price==='paid'?'selected':''}>Paid Events</option>
      </select>
    </div>
    <div class="filter-group"><label class="filter-label">Sort By</label>
      <select class="filter-select" name="sort">
        <option value="featured" ${sort==='featured'?'selected':''}>Featured</option>
        <option value="date" ${sort==='date'?'selected':''}>Soonest</option>
        <option value="visitors" ${sort==='visitors'?'selected':''}>Most Popular</option>
      </select>
    </div>
    <button type="submit" class="btn btn-primary filter-btn">Filter</button>
  </form>
  <ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-2486135003689222" data-ad-format="auto" data-full-width-responsive="true"></ins>
  <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
  ${events.length === 0 ? `<div class="empty-state"><div style="font-size:48px;margin-bottom:16px;">🔍</div><h2>No events found</h2><p>Try different filters or <a href="/events">clear all filters</a></p></div>` : `
  <div class="events-grid" style="margin-bottom:40px;">${events.map(e => eventCardHTMLFull(e)).join('')}</div>`}
  ${totalPages > 1 ? `<div class="pagination">
    ${page > 1 ? `<a href="/events?${new URLSearchParams({...Object.fromEntries(params),page:page-1})}" class="page-btn">‹ Prev</a>` : ''}
    ${Array.from({length:Math.min(totalPages,7)},(_,i)=>i+1).map(p=>`<a href="/events?${new URLSearchParams({...Object.fromEntries(params),page:p})}" class="page-btn ${p===page?'active':''}">${p}</a>`).join('')}
    ${page < totalPages ? `<a href="/events?${new URLSearchParams({...Object.fromEntries(params),page:page+1})}" class="page-btn">Next ›</a>` : ''}
  </div>` : ''}
</div>
${renderFooterSimple()}</body></html>`;
}

// ─────────────────────────────────────
// SUBMIT FORM — WITH PLAN SELECTOR
// ─────────────────────────────────────
function renderSubmitPage(user, success, error, selectedPlan) {
  const plan = selectedPlan || 'standard';
  return `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Submit Your Event — Festmore</title>
<meta name="description" content="List your festival, market, concert or event on Festmore. Free listing available — or go Standard for just €79/year."/>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="/css/main.css"/>
</head><body>
${renderNavSimple(user)}

<div class="page-hero-small" style="background:linear-gradient(135deg,#e8470a,#c2410c);">
  <div class="container">
    <h1 style="color:#fff;">List Your Event on Festmore</h1>
    <p style="color:rgba(255,255,255,.8);">Free, Standard (€79/yr) or Premium (€149/yr) — you choose</p>
  </div>
</div>

<div class="container" style="padding:48px 0;max-width:820px;">
  ${error ? `<div class="alert alert-error">⚠️ ${error}</div>` : ''}
  ${success ? `<div class="alert alert-success">✅ ${success}</div>` : ''}

  <!-- PLAN SELECTOR -->
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;margin-bottom:36px;">
    ${[
      { id:'free', label:'Free', price:'€0', desc:'Basic listing', color:'var(--sage)' },
      { id:'standard', label:'Standard', price:'€79/yr', desc:'Full featured listing', color:'var(--flame)' },
      { id:'premium', label:'Premium', price:'€149/yr', desc:'Top placement + newsletter', color:'var(--gold)' },
    ].map(p => `
    <div onclick="selectPlan('${p.id}')" id="plan-${p.id}" style="border:2px solid ${plan===p.id?p.color:'var(--border)'};background:${plan===p.id?'rgba(232,71,10,.04)':'#fff'};border-radius:16px;padding:18px 16px;cursor:pointer;transition:all .2s;text-align:center;">
      <div style="font-size:12px;font-weight:700;color:${p.color};text-transform:uppercase;letter-spacing:.8px;margin-bottom:4px;">${p.label}</div>
      <div style="font-family:'DM Serif Display',serif;font-size:22px;color:var(--ink);margin-bottom:3px;">${p.price}</div>
      <div style="font-size:12px;color:var(--ink4);">${p.desc}</div>
    </div>`).join('')}
  </div>

  <!-- PLAN COMPARISON -->
  <div id="plan-info-free" style="display:${plan==='free'?'block':'none'};background:rgba(74,124,89,.07);border:1px solid rgba(74,124,89,.2);border-radius:12px;padding:16px 20px;margin-bottom:28px;">
    <div style="font-weight:700;color:var(--sage);margin-bottom:8px;">Free Plan — What you get:</div>
    <div style="font-size:13.5px;color:var(--ink2);line-height:1.9;">✅ Basic event listing · ✅ Visible in search · ❌ Not featured · ❌ No newsletter · ❌ No SEO boost</div>
    <div style="font-size:12.5px;color:var(--ink3);margin-top:8px;">You can upgrade to Standard or Premium at any time from your dashboard.</div>
  </div>
  <div id="plan-info-standard" style="display:${plan==='standard'?'block':'none'};background:rgba(232,71,10,.06);border:1px solid rgba(232,71,10,.2);border-radius:12px;padding:16px 20px;margin-bottom:28px;">
    <div style="font-weight:700;color:var(--flame);margin-bottom:8px;">Standard Plan — €79/year:</div>
    <div style="font-size:13.5px;color:var(--ink2);line-height:1.9;">✅ Full SEO listing · ✅ Featured in search · ✅ Weekly newsletter · ✅ Your own URL · ✅ View analytics · ✅ Priority support</div>
  </div>
  <div id="plan-info-premium" style="display:${plan==='premium'?'block':'none'};background:rgba(201,146,42,.07);border:1px solid rgba(201,146,42,.25);border-radius:12px;padding:16px 20px;margin-bottom:28px;">
    <div style="font-weight:700;color:var(--gold);margin-bottom:8px;">Premium Plan — €149/year:</div>
    <div style="font-size:13.5px;color:var(--ink2);line-height:1.9;">⭐ Everything in Standard · ⭐ Top of search results · ⭐ Homepage featured · ⭐ Dedicated newsletter feature · ⭐ Social media promotion</div>
  </div>

  <div class="form-card">
    <div class="form-card-header">
      <h2>Event Details</h2>
      <div id="price-badge-display" class="price-badge">${plan==='free'?'Free':plan==='premium'?'€149/yr':'€79/yr'}</div>
    </div>
    <form method="POST" action="/events/submit" id="submit-form">
      <input type="hidden" name="plan" id="plan-input" value="${plan}"/>
      <div class="form-grid">
        <div class="form-group full"><label class="form-label">Event Name *</label><input class="form-input" type="text" name="title" placeholder="e.g. Berlin Christmas Market 2025" required/></div>
        <div class="form-group"><label class="form-label">Category *</label>
          <select class="form-input" name="category" required>
            <option value="">Select category…</option>
            ${Object.entries({festival:'🎪 Festival',concert:'🎵 Concert',market:'🛍️ Market',christmas:'🎄 Christmas Market',exhibition:'🖼️ Exhibition',business:'💼 Business / Fair',kids:'🎠 Kids Event',comics:'🎮 Comics & Gaming',flea:'🏺 Flea Market',online:'💻 Online Event',city:'🏙️ City Event',messe:'🏛️ Trade Fair'}).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}
          </select>
        </div>
        <div class="form-group"><label class="form-label">Country *</label>
          <select class="form-input" name="country" required>
            <option value="">Select country…</option>
            ${Object.entries(COUNTRY_NAMES).map(([k,v])=>`<option value="${k}">${FLAGS[k]} ${v}</option>`).join('')}
          </select>
        </div>
        <div class="form-group"><label class="form-label">City *</label><input class="form-input" type="text" name="city" placeholder="e.g. Berlin" required/></div>
        <div class="form-group"><label class="form-label">Address / Venue</label><input class="form-input" type="text" name="address" placeholder="e.g. Gendarmenmarkt Square"/></div>
        <div class="form-group"><label class="form-label">Start Date *</label><input class="form-input" type="date" name="start_date" required/></div>
        <div class="form-group"><label class="form-label">End Date</label><input class="form-input" type="date" name="end_date"/></div>
        <div class="form-group full"><label class="form-label">Dates as Displayed</label><input class="form-input" type="text" name="date_display" placeholder="e.g. Nov 27 – Dec 24, 2025"/></div>
        <div class="form-group"><label class="form-label">Entry Price</label><input class="form-input" type="text" name="price_display" placeholder="Free, €12, €8–€45…"/></div>
        <div class="form-group"><label class="form-label">Expected Visitors</label><input class="form-input" type="number" name="attendees" placeholder="e.g. 5000"/></div>
        <div class="form-group"><label class="form-label">Vendor Spots Available</label><input class="form-input" type="number" name="vendor_spots" placeholder="e.g. 50"/></div>
        <div class="form-group"><label class="form-label">Event Website</label><input class="form-input" type="url" name="website" placeholder="https://your-event.com"/></div>
        <div class="form-group full"><label class="form-label">Event Description *</label><textarea class="form-input" name="description" rows="5" placeholder="Describe your event in detail…"></textarea></div>
        <div class="form-group"><label class="form-label">Your Name</label><input class="form-input" type="text" name="name" placeholder="Your full name"/></div>
        <div class="form-group"><label class="form-label">Your Email</label><input class="form-input" type="email" name="email" placeholder="your@email.com"/></div>
      </div>
      <div class="form-submit-area">
        <div class="price-summary">
          <strong id="submit-price">${plan==='free'?'Free Listing':plan==='premium'?'Premium: €149/year':'Standard: €79/year'}</strong>
          <span>${plan==='free'?'No payment required — upgrade anytime':'Secure payment via Stripe'}</span>
        </div>
        <button type="submit" class="btn btn-primary btn-xl" style="max-width:280px;" id="submit-btn">
          ${plan==='free'?'List for Free →':'Continue to Payment →'}
        </button>
      </div>
    </form>
  </div>

  <div style="text-align:center;margin-top:16px;">
    <a href="/events/pricing" style="color:var(--ink3);font-size:13.5px;">Compare all plans →</a>
  </div>
</div>

${renderFooterSimple()}
<script>
function selectPlan(plan) {
  ['free','standard','premium'].forEach(p => {
    const el = document.getElementById('plan-'+p);
    const info = document.getElementById('plan-info-'+p);
    const colors = {free:'var(--sage)',standard:'var(--flame)',premium:'var(--gold)'};
    if (p === plan) {
      el.style.borderColor = colors[p];
      el.style.background = 'rgba(232,71,10,.04)';
      info.style.display = 'block';
    } else {
      el.style.borderColor = 'var(--border)';
      el.style.background = '#fff';
      info.style.display = 'none';
    }
  });
  document.getElementById('plan-input').value = plan;
  const prices = {free:'Free Listing',standard:'Standard: €79/year',premium:'Premium: €149/year'};
  const badges = {free:'Free',standard:'€79/yr',premium:'€149/yr'};
  const btns = {free:'List for Free →',standard:'Continue to Payment →',premium:'Continue to Payment →'};
  const subs = {free:'No payment required — upgrade anytime',standard:'Secure payment via Stripe',premium:'Secure payment via Stripe'};
  document.getElementById('submit-price').textContent = prices[plan];
  document.getElementById('price-badge-display').textContent = badges[plan];
  document.getElementById('submit-btn').textContent = btns[plan];
  document.querySelector('.price-summary span').textContent = subs[plan];
}
</script>
</body></html>`;
}

// ─────────────────────────────────────
// EVENT DETAIL
// ─────────────────────────────────────
function renderEventDetail(e, related, user) {
  const img  = e.image_url || IMGS[e.category] || IMGS.festival;
  const flag = FLAGS[e.country] || '🌍';
  const icon = CATS[e.category] || '🎪';
  const tags = JSON.parse(e.tags||'[]');
  const isFree = e.payment_status === 'free';

  return `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>${e.meta_title || e.title + ' ' + new Date(e.start_date).getFullYear() + ' — ' + e.city + ' | Festmore'}</title>
<meta name="description" content="${e.meta_desc || e.short_desc || (e.description||'').substring(0,155)}"/>
<meta property="og:title" content="${e.title} — Festmore"/>
<meta property="og:description" content="${(e.description||'').substring(0,200)}"/>
<meta property="og:image" content="${img}"/>
<script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@type":"Event","name":e.title,"startDate":e.start_date,"endDate":e.end_date||e.start_date,"location":{"@type":"Place","name":e.address||e.city,"address":{"@type":"PostalAddress","addressLocality":e.city,"addressCountry":e.country}},"description":e.description||"","image":img,"isAccessibleForFree":e.price_display==="Free"})}</script>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="/css/main.css"/>
</head><body>
${renderNavSimple(user)}
<div class="event-detail-hero" style="background-image:linear-gradient(to right, rgba(26,22,18,0.92) 50%, rgba(26,22,18,0.4)), url('${img}');">
  <div class="container">
    <div class="event-detail-meta">
      <span class="badge badge-cat">${icon} ${CAT_NAMES[e.category]||e.category}</span>
      ${e.featured ? '<span class="badge badge-feat">★ Featured</span>' : ''}
      ${e.price_display==='Free'?'<span class="badge badge-free">Free Entry</span>':''}
      ${isFree ? '<span class="badge" style="background:rgba(255,255,255,.2);color:#fff;">Basic Listing</span>' : ''}
    </div>
    <h1 style="font-family:'DM Serif Display',serif;font-size:clamp(28px,5vw,52px);font-weight:400;color:#fff;margin:12px 0;">${e.title}</h1>
    <div style="display:flex;gap:20px;flex-wrap:wrap;color:rgba(255,255,255,0.7);font-size:15px;">
      <span>📍 ${flag} ${e.city}, ${COUNTRY_NAMES[e.country]||e.country}</span>
      <span>📅 ${e.date_display||e.start_date}</span>
      <span>🎟️ ${e.price_display}</span>
    </div>
  </div>
</div>
<div class="container" style="padding:40px 0;display:grid;grid-template-columns:1fr 340px;gap:40px;align-items:start;">
  <div>
    <ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-2486135003689222" data-ad-format="auto" data-full-width-responsive="true"></ins>
    <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
    <div class="event-detail-card">
      <h2 style="font-family:'DM Serif Display',serif;font-size:26px;font-weight:400;margin-bottom:16px;">About This Event</h2>
      <div style="font-size:16px;line-height:1.85;color:var(--ink2);">${(e.description||'No description available.').replace(/\n/g,'<br/>')}</div>
      ${tags.length ? `<div style="margin-top:20px;display:flex;gap:8px;flex-wrap:wrap;">${tags.map(t=>`<a href="/events?q=${encodeURIComponent(t)}" class="tag">${t}</a>`).join('')}</div>` : ''}
    </div>
    ${related.length ? `
    <div style="margin-top:40px;">
      <h3 style="font-family:'DM Serif Display',serif;font-size:22px;font-weight:400;margin-bottom:20px;">Similar Events</h3>
      <div class="events-grid-small">${related.map(r=>eventCardHTMLFull(r)).join('')}</div>
    </div>` : ''}
  </div>
  <aside>
    <div class="detail-sidebar-card">
      <h3 style="font-family:'DM Serif Display',serif;font-size:18px;font-weight:400;margin-bottom:16px;border-bottom:2px solid var(--ink);padding-bottom:12px;">Event Details</h3>
      <div class="detail-row"><span class="detail-label">📅 Dates</span><span>${e.date_display||e.start_date}</span></div>
      <div class="detail-row"><span class="detail-label">📍 Location</span><span>${e.city}, ${COUNTRY_NAMES[e.country]||e.country}</span></div>
      ${e.address?`<div class="detail-row"><span class="detail-label">🗺️ Address</span><span>${e.address}</span></div>`:''}
      <div class="detail-row"><span class="detail-label">🎟️ Entry</span><span style="font-weight:700;color:${e.price_display==='Free'?'var(--sage)':'var(--gold)'}">${e.price_display}</span></div>
      <div class="detail-row"><span class="detail-label">👥 Expected</span><span>${(e.attendees||0).toLocaleString()} visitors</span></div>
      ${e.vendor_spots?`<div class="detail-row"><span class="detail-label">🏪 Vendors</span><span>${e.vendor_spots} spots available</span></div>`:''}
      ${e.website?`<a href="${e.website}" target="_blank" rel="nofollow noopener" class="btn btn-primary" style="display:block;text-align:center;margin-top:16px;">Visit Official Website →</a>`:''}
      ${e.ticket_url?`<a href="${e.ticket_url}" target="_blank" rel="nofollow noopener" class="btn btn-outline" style="display:block;text-align:center;margin-top:8px;">Buy Tickets →</a>`:''}
      <button onclick="shareEvent()" class="btn btn-ghost" style="width:100%;margin-top:8px;">Share This Event 🔗</button>
    </div>
    ${isFree ? `
    <div style="margin-top:16px;background:var(--ivory);border:1px solid var(--border);border-radius:16px;padding:22px;text-align:center;">
      <div style="font-size:13px;color:var(--ink3);margin-bottom:12px;">Are you the organiser of this event?</div>
      <a href="/events/pricing" class="btn btn-primary btn-sm" style="display:block;">Upgrade for More Visibility →</a>
    </div>` : ''}
    <ins class="adsbygoogle" style="display:block;margin-top:16px;" data-ad-client="ca-pub-2486135003689222" data-ad-format="auto" data-full-width-responsive="true"></ins>
    <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
    <div style="margin-top:16px;background:var(--ink);border-radius:16px;padding:24px;color:#fff;">
      <h4 style="font-family:'DM Serif Display',serif;font-size:18px;font-weight:400;margin-bottom:8px;">Are you a vendor?</h4>
      <p style="font-size:13px;color:rgba(255,255,255,0.6);margin-bottom:16px;">Create your vendor profile and apply for spots at events like this one.</p>
      <a href="/vendors/register" class="btn btn-primary" style="display:block;text-align:center;">Join as Vendor — €49/yr</a>
    </div>
  </aside>
</div>
${renderFooterSimple()}
<script>
function shareEvent() {
  if (navigator.share) {
    navigator.share({ title: '${e.title}', url: window.location.href });
  } else {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied!');
  }
}
</script>
</body></html>`;
}

function eventCardHTMLFull(e) {
  const img    = e.image_url || IMGS[e.category] || IMGS.festival;
  const flag   = FLAGS[e.country] || '🌍';
  const icon   = CATS[e.category] || '🎪';
  const isFree = e.price_display === 'Free';
  const isFreeListig = e.payment_status === 'free';
  return `<article class="event-card" itemscope itemtype="https://schema.org/Event">
  <a href="/events/${e.slug}">
    <div class="event-img">
      <img src="${img}" alt="${e.title} — ${e.city}" loading="lazy" itemprop="image"/>
      <div class="event-img-overlay"></div>
      <div class="event-badges">
        ${e.featured ? '<span class="badge badge-feat">★ Featured</span>' : ''}
        <span class="badge badge-cat">${icon} ${e.category}</span>
        ${isFree ? '<span class="badge badge-free">Free</span>' : ''}
      </div>
    </div>
    <div class="event-body">
      <div class="event-date">${e.date_display||e.start_date}</div>
      <h3 itemprop="name">${e.title}</h3>
      <div class="event-loc">${flag} ${e.city}</div>
      <div class="event-footer">
        <span class="event-stat">👥 ${(e.attendees||0).toLocaleString()}</span>
        <span class="event-price ${isFree?'price-free':'price-paid'}">${e.price_display}</span>
      </div>
    </div>
  </a>
</article>`;
}

function renderNavSimple(user) {
  return `<nav class="main-nav">
  <div class="nav-inner">
    <a href="/" class="logo"><span class="logo-fest">Fest</span><span class="logo-more">more</span><span class="logo-dot"></span></a>
    <form class="nav-search" action="/events" method="GET">
      <span style="color:var(--ink4);font-size:15px;">🔍</span><input type="text" name="q" placeholder="Search events…"/>
    </form>
    <div class="nav-right">
      ${user ? `<a href="/dashboard" class="btn btn-outline btn-sm">Dashboard</a><a href="/auth/logout" class="btn btn-ghost btn-sm">Logout</a>` : `<a href="/auth/login" class="btn btn-outline btn-sm">Login</a><a href="/events/submit" class="btn btn-primary btn-sm">+ List Event</a>`}
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
    <a href="/vendors" class="nav-cat">🏪 Vendors</a>
    <a href="/about" class="nav-cat">ℹ️ About</a>
    <a href="/contact" class="nav-cat">✉️ Contact</a>
  </div>
  <div class="nav-mobile">
    <a href="/events">🌍 All Events</a><a href="/articles">📰 Articles</a>
    <a href="/vendors">🏪 Vendors</a><a href="/events/submit">+ List Event</a>
    ${user ? `<a href="/dashboard">Dashboard</a><a href="/auth/logout">Logout</a>` : `<a href="/auth/login">Login</a>`}
  </div>
</nav>`;
}

function renderFooterSimple() {
  return `<footer><div class="footer-bottom">
  <span>© ${new Date().getFullYear()} Festmore.com — All rights reserved</span>
  <div style="display:flex;gap:16px;">
    <a href="/" style="color:rgba(255,255,255,.35);font-size:13px;">Home</a>
    <a href="/events" style="color:rgba(255,255,255,.35);font-size:13px;">Events</a>
    <a href="/events/pricing" style="color:rgba(255,255,255,.35);font-size:13px;">Pricing</a>
    <a href="/vendors" style="color:rgba(255,255,255,.35);font-size:13px;">Vendors</a>
    <a href="/privacy" style="color:rgba(255,255,255,.35);font-size:13px;">Privacy</a>
  </div>
</div></footer>`;
}