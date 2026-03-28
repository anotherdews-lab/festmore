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
const FLAGS = { BE:'🇧🇪',CN:'🇨🇳',DK:'🇩🇰',FR:'🇫🇷',DE:'🇩🇪',NL:'🇳🇱',PL:'🇵🇱',SE:'🇸🇪',AE:'🇦🇪',GB:'🇬🇧',US:'🇺🇸',NO:'🇳🇴', FI:'🇫🇮', AT:'🇦🇹', CH:'🇨🇭', IT:'🇮🇹',
ES:'🇪🇸', PT:'🇵🇹', IE:'🇮🇪', CZ:'🇨🇿', HU:'🇭🇺',
GR:'🇬🇷', HR:'🇭🇷', IN:'🇮🇳', TH:'🇹🇭', JP:'🇯🇵', };
const CATS = { festival:'🎪',concert:'🎵',market:'🛍️',christmas:'🎄',exhibition:'🖼️',business:'💼',kids:'🎠',comics:'🎮',flea:'🏺',online:'💻',city:'🏙️',messe:'🏛️' };
const CAT_NAMES = { festival:'Festivals',concert:'Concerts',market:'Markets',christmas:'Christmas Markets',exhibition:'Exhibitions',business:'Business & Fairs',kids:'Kids Events',comics:'Comics & Gaming',flea:'Flea Markets',online:'Online Events',city:'City Events',messe:'Trade Fairs' };
const COUNTRY_NAMES = { BE:'Belgium',CN:'China',DK:'Denmark',FR:'France',DE:'Germany',NL:'Netherlands',PL:'Poland',SE:'Sweden',AE:'UAE',GB:'United Kingdom',US:'USA',NO:'Norway', FI:'Finland', AT:'Austria', CH:'Switzerland', IT:'Italy',
ES:'Spain', PT:'Portugal', IE:'Ireland', CZ:'Czech Republic', HU:'Hungary',
GR:'Greece', HR:'Croatia', IN:'India', TH:'Thailand', JP:'Japan', };

// ─────────────────────────────────────
// EVENTS LISTING PAGE
// ─────────────────────────────────────
router.get('/', (req, res) => {
  const { q='', country='ALL', category='ALL', price='ALL', sort='featured', page=1, when='', city='' } = req.query;
  const perPage = 12;

  const offset  = (parseInt(page)-1) * perPage;
  let where = ["e.status='active'"];
  let params = [];
  if (country !== 'ALL')   { where.push("e.country=?");   params.push(country); }
  if (category !== 'ALL')  { where.push("e.category=?");  params.push(category); }
  if (price === 'free')    { where.push("e.price_display='Free'"); }
  if (price === 'paid')    { where.push("e.price_display!='Free'"); }
  if (city) { where.push("(e.city LIKE ? OR e.country LIKE ?)"); params.push(`%${city}%`,`%${city}%`); }
const now = new Date();
if (when==='weekend'){const fri=new Date(now);fri.setDate(now.getDate()+(5-now.getDay()));const sun=new Date(fri);sun.setDate(fri.getDate()+2);where.push("e.start_date>=? AND e.start_date<=?");params.push(fri.toISOString().split('T')[0],sun.toISOString().split('T')[0]);}
else if (when==='week'){const w=new Date(now);w.setDate(now.getDate()+7);where.push("e.start_date>=? AND e.start_date<=?");params.push(now.toISOString().split('T')[0],w.toISOString().split('T')[0]);}
else if (when==='month'){const m=new Date(now);m.setDate(now.getDate()+30);where.push("e.start_date>=? AND e.start_date<=?");params.push(now.toISOString().split('T')[0],m.toISOString().split('T')[0]);}
else if (when==='summer'){where.push("e.start_date>=? AND e.start_date<=?");params.push('2026-06-01','2026-08-31');}
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
// PASTE THIS FUNCTION INTO routes/events.js
// Replace the entire renderSubmitPage function (lines 405-536)
// Payment system is INTACT — do not modify the POST handler

function renderSubmitPage(user, success, error, selectedPlan) {
  const plan = selectedPlan || 'standard';
  const IS = `width:100%;background:#fff;border:1.5px solid var(--border2);border-radius:10px;padding:12px 14px;font-size:14px;outline:none;box-sizing:border-box;font-family:inherit;transition:border-color .2s;`;
  const LS = `font-size:12px;font-weight:700;color:var(--ink3);text-transform:uppercase;letter-spacing:.8px;display:block;margin-bottom:6px;`;
  const GS = `margin-bottom:20px;`;
  const SS = `background:#fff;border:1px solid var(--border);border-radius:20px;padding:32px;margin-bottom:20px;`;

  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>List Your Event on Festmore — Get Discovered Worldwide</title>
<meta name="description" content="List your festival, market, concert or event on Festmore. Free listing available — or go Standard for just €79/year. Reach thousands of visitors worldwide."/>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="/css/main.css"/>
<style>
.plan-card{border:2px solid var(--border);background:#fff;border-radius:18px;padding:22px 20px;cursor:pointer;transition:all .2s;text-align:center;position:relative;}
.plan-card:hover{border-color:var(--flame);transform:translateY(-2px);}
.plan-card.active-free{border-color:var(--sage);background:rgba(74,124,89,.04);}
.plan-card.active-standard{border-color:var(--flame);background:rgba(232,71,10,.04);}
.plan-card.active-premium{border-color:var(--gold);background:rgba(201,146,42,.04);}
.plan-popular{position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:var(--flame);color:#fff;font-size:10px;font-weight:800;padding:3px 12px;border-radius:99px;text-transform:uppercase;letter-spacing:.8px;white-space:nowrap;}
.what-you-get{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:32px;}
.wyg-card{background:#fff;border:1px solid var(--border);border-radius:14px;padding:18px;text-align:center;}
.plan-features{background:var(--ivory);border-radius:12px;padding:16px 20px;margin-bottom:28px;display:none;}
.plan-features.visible{display:block;}
.feat-item{display:flex;align-items:center;gap:8px;padding:5px 0;font-size:13.5px;color:var(--ink2);}
textarea{resize:vertical;}
.checkbox-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;}
.checkbox-item{display:flex;align-items:center;gap:8px;background:var(--ivory);border:1.5px solid var(--border);border-radius:8px;padding:10px 12px;cursor:pointer;transition:all .2s;}
.checkbox-item:hover{border-color:var(--flame);}
.checkbox-item input[type=checkbox]{accent-color:var(--flame);}
@media(max-width:600px){.what-you-get{grid-template-columns:1fr;}.checkbox-grid{grid-template-columns:1fr;}}
</style>
</head><body>
${renderNavSimple(user)}

<!-- HERO -->
<div style="background:linear-gradient(135deg,#1a0a00,#3d1200);padding:64px 0;position:relative;overflow:hidden;">
  <div style="position:absolute;inset:0;background:radial-gradient(ellipse 60% 80% at 80% 50%,rgba(232,71,10,.25) 0%,transparent 70%);"></div>
  <div class="container" style="position:relative;max-width:860px;text-align:center;">
    <div style="display:inline-flex;align-items:center;gap:8px;background:rgba(232,71,10,.15);border:1px solid rgba(232,71,10,.35);color:#ff7043;font-size:11px;font-weight:700;padding:4px 14px;border-radius:99px;margin-bottom:20px;letter-spacing:.8px;text-transform:uppercase;">🎪 List Your Event</div>
    <h1 style="font-family:'DM Serif Display',serif;font-size:clamp(28px,4vw,52px);font-weight:400;color:#fff;margin-bottom:14px;">Get Your Event in Front of<br/>Thousands of Visitors</h1>
    <p style="color:rgba(255,255,255,.55);font-size:16px;line-height:1.75;max-width:600px;margin:0 auto;">Free listing available. Upgrade to Standard or Premium for maximum visibility, newsletter inclusion and SEO boost across 26 countries.</p>
  </div>
</div>

<div class="container" style="padding:48px 0;max-width:880px;">
  ${error ? `<div class="alert alert-error" style="margin-bottom:24px;">⚠️ ${error}</div>` : ''}
  ${success ? `<div class="alert alert-success" style="margin-bottom:24px;">✅ ${success}</div>` : ''}

  <!-- WHAT YOU GET -->
  <div class="what-you-get">
    ${[
      ['🌍','Worldwide Visibility','Reach visitors across 26 countries and 90+ city pages'],
      ['🔍','Ranks on Google','Your own SEO page that appears in Google search results'],
      ['📧','Newsletter to 500+ Subscribers','Weekly newsletter to active event-goers and vendors'],
      ['🏪','Vendor Marketplace','Food trucks and vendors can apply directly to your event'],
      ['📊','Real Analytics','Track views, clicks and where your visitors come from'],
      ['✅','Verified Badge','Build trust with the Festmore Verified badge'],
    ].map(([i,t,d]) => `<div class="wyg-card"><div style="font-size:28px;margin-bottom:8px;">${i}</div><div style="font-size:14px;font-weight:700;margin-bottom:4px;">${t}</div><div style="font-size:12px;color:var(--ink3);line-height:1.5;">${d}</div></div>`).join('')}
  </div>

  <!-- PLAN SELECTOR -->
  <h2 style="font-family:'DM Serif Display',serif;font-size:22px;font-weight:400;margin-bottom:20px;">Choose Your Plan</h2>
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;margin-bottom:12px;">
    ${[
      { id:'free', label:'Free', price:'€0', period:'forever', color:'var(--sage)', desc:'Get started today', features:['✅ Live within 24 hours','✅ Basic listing page','✅ Visible in search','❌ Not featured','❌ No newsletter','❌ No SEO boost'] },
      { id:'standard', label:'Standard', price:'€79', period:'/year', color:'var(--flame)', desc:'Most popular', popular:true, features:['✅ Live within 24 hours','✅ Full SEO listing page','✅ Featured in search results','✅ Weekly newsletter','✅ Your own Festmore URL','✅ View analytics & insights','✅ Connect with verified vendors','✅ Priority support'] },
      { id:'premium', label:'Premium', price:'€149', period:'/year', color:'var(--gold)', desc:'Maximum exposure', features:['⭐ Everything in Standard','⭐ Top of all search results','⭐ Homepage featured placement','⭐ Dedicated newsletter feature','⭐ Social media promotion','⭐ Priority listing in 26 countries','⭐ Vendor spotlight in newsletter','⭐ Direct account manager'] },
    ].map(p => `
    <div class="plan-card ${plan===p.id?'active-'+p.id:''}" id="plan-${p.id}" onclick="selectPlan('${p.id}')">
      ${p.popular ? '<div class="plan-popular">Most Popular</div>' : ''}
      <div style="font-size:12px;font-weight:700;color:${p.color};text-transform:uppercase;letter-spacing:.8px;margin-bottom:6px;">${p.label}</div>
      <div style="font-family:'DM Serif Display',serif;font-size:32px;color:var(--ink);line-height:1;">${p.price}</div>
      <div style="font-size:12px;color:var(--ink4);margin-bottom:8px;">${p.period}</div>
      <div style="font-size:12px;color:var(--ink3);">${p.desc}</div>
    </div>`).join('')}
  </div>

  <!-- PLAN FEATURES -->
  ${[
    { id:'free', color:'rgba(74,124,89,.07)', border:'rgba(74,124,89,.2)', titleColor:'var(--sage)', title:'Free Plan — What you get:', features:['✅ Basic event listing · ✅ Visible in search · ❌ Not featured · ❌ No newsletter · ❌ No SEO boost'] },
    { id:'standard', color:'rgba(232,71,10,.05)', border:'rgba(232,71,10,.2)', titleColor:'var(--flame)', title:'Standard Plan — €79/year:', features:['✅ Full SEO listing · ✅ Featured in search · ✅ Weekly newsletter · ✅ Your own URL · ✅ Analytics · ✅ Connect with vendors · ✅ Priority support'] },
    { id:'premium', color:'rgba(201,146,42,.05)', border:'rgba(201,146,42,.25)', titleColor:'var(--gold)', title:'Premium Plan — €149/year:', features:['⭐ Everything in Standard · ⭐ Top placement · ⭐ Homepage featured · ⭐ Dedicated newsletter · ⭐ Social media promotion · ⭐ Account manager'] },
  ].map(p => `
  <div id="plan-info-${p.id}" class="plan-features ${plan===p.id?'visible':''}" style="background:${p.color};border:1px solid ${p.border};">
    <div style="font-weight:700;color:${p.titleColor};margin-bottom:8px;">${p.title}</div>
    <div style="font-size:13.5px;color:var(--ink2);line-height:1.9;">${p.features[0]}</div>
    ${p.id==='free'?'<div style="font-size:12.5px;color:var(--ink3);margin-top:8px;">You can upgrade to Standard or Premium at any time from your dashboard.</div>':''}
  </div>`).join('')}

  <form method="POST" action="/events/submit" id="submit-form">
    <input type="hidden" name="plan" id="plan-input" value="${plan}"/>

    <!-- SECTION 1 — EVENT IDENTITY -->
    <div style="${SS}">
      <h2 style="font-family:'DM Serif Display',serif;font-size:22px;font-weight:400;margin-bottom:6px;">1. Event Identity</h2>
      <p style="font-size:13px;color:var(--ink3);margin-bottom:24px;padding-bottom:20px;border-bottom:1px solid var(--border);">The basics — what is your event and where does it take place?</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
        <div style="${GS}grid-column:1/-1;"><label style="${LS}">Event Name *</label><input type="text" name="title" required placeholder="e.g. Berlin Christmas Market 2026" style="${IS}"/></div>
        <div style="${GS}"><label style="${LS}">Category *</label>
          <select name="category" required style="${IS}">
            <option value="">Select category…</option>
            ${Object.entries({festival:'🎪 Festival',concert:'🎵 Concert',market:'🛍️ Market',christmas:'🎄 Christmas Market',exhibition:'🖼️ Exhibition',business:'💼 Business / Fair',kids:'🎠 Kids Event',comics:'🎮 Comics & Gaming',flea:'🏺 Flea Market',online:'💻 Online Event',city:'🏙️ City Event',messe:'🏛️ Trade Fair'}).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}
          </select>
        </div>
        <div style="${GS}"><label style="${LS}">Country *</label>
          <select name="country" required style="${IS}">
            <option value="">Select country…</option>
            ${Object.entries(COUNTRY_NAMES).map(([k,v])=>`<option value="${k}">${FLAGS[k]} ${v}</option>`).join('')}
          </select>
        </div>
        <div style="${GS}"><label style="${LS}">City *</label><input type="text" name="city" required placeholder="e.g. Berlin" style="${IS}"/></div>
        <div style="${GS}"><label style="${LS}">Venue / Address</label><input type="text" name="address" placeholder="e.g. Gendarmenmarkt Square, Berlin" style="${IS}"/></div>
        <div style="${GS}"><label style="${LS}">Entry Price</label><input type="text" name="price_display" placeholder="Free, €12, €8–€45, From €25…" style="${IS}"/></div>
        <div style="${GS}"><label style="${LS}">Event Website</label><input type="url" name="website" placeholder="https://your-event.com" style="${IS}"/></div>
        <div style="${GS}"><label style="${LS}">Ticket Link</label><input type="url" name="ticket_url" placeholder="https://ticketmaster.com/your-event" style="${IS}"/></div>
      </div>
    </div>

    <!-- SECTION 2 — DATES & TIMES -->
    <div style="${SS}">
      <h2 style="font-family:'DM Serif Display',serif;font-size:22px;font-weight:400;margin-bottom:6px;">2. Dates & Times</h2>
      <p style="font-size:13px;color:var(--ink3);margin-bottom:24px;padding-bottom:20px;border-bottom:1px solid var(--border);">When does your event take place?</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
        <div style="${GS}"><label style="${LS}">Start Date *</label><input type="date" name="start_date" required style="${IS}"/></div>
        <div style="${GS}"><label style="${LS}">End Date</label><input type="date" name="end_date" style="${IS}"/></div>
        <div style="${GS}"><label style="${LS}">Opening Hours</label><input type="text" name="opening_hours" placeholder="e.g. Mon–Sat 10:00–21:00, Sun 11:00–18:00" style="${IS}"/></div>
        <div style="${GS}"><label style="${LS}">Dates as Displayed on Page</label><input type="text" name="date_display" placeholder="e.g. 27 Nov – 24 Dec 2026" style="${IS}"/></div>
      </div>
    </div>

    <!-- SECTION 3 — EVENT DETAILS -->
    <div style="${SS}">
      <h2 style="font-family:'DM Serif Display',serif;font-size:22px;font-weight:400;margin-bottom:6px;">3. Event Details</h2>
      <p style="font-size:13px;color:var(--ink3);margin-bottom:24px;padding-bottom:20px;border-bottom:1px solid var(--border);">Tell visitors and vendors everything they need to know about your event.</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
        <div style="${GS}grid-column:1/-1;"><label style="${LS}">Event Description *</label><textarea name="description" required placeholder="Describe your event in detail — what makes it special, what visitors can expect, entertainment, food, atmosphere, history…" style="${IS}" rows="6"></textarea></div>
        <div style="${GS}"><label style="${LS}">Expected Visitors</label><input type="number" name="attendees" placeholder="e.g. 5000" style="${IS}"/></div>
        <div style="${GS}"><label style="${LS}">Vendor / Exhibitor Spots Available</label><input type="number" name="vendor_spots" placeholder="e.g. 50" style="${IS}"/></div>
        <div style="${GS}"><label style="${LS}">Edition / Year (if recurring)</label><input type="text" name="edition" placeholder="e.g. 32nd edition, Est. 1988" style="${IS}"/></div>
        <div style="${GS}"><label style="${LS}">Languages at Event</label><input type="text" name="event_languages" placeholder="e.g. Danish, English, German" style="${IS}"/></div>
      </div>
    </div>

    <!-- SECTION 4 — HIGHLIGHTS & PROGRAMME -->
    <div style="${SS}">
      <h2 style="font-family:'DM Serif Display',serif;font-size:22px;font-weight:400;margin-bottom:6px;">4. Highlights & Programme</h2>
      <p style="font-size:13px;color:var(--ink3);margin-bottom:24px;padding-bottom:20px;border-bottom:1px solid var(--border);">What makes your event unmissable? This is what convinces people to buy tickets and attend.</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
        <div style="${GS}grid-column:1/-1;"><label style="${LS}">Main Highlights</label><textarea name="highlights" placeholder="e.g. Live music from Kandis and Rasmus Bjerg · 200+ market stalls · Circus and family entertainment · Grand Prix Show · MusikBingo…" style="${IS}" rows="4"></textarea></div>
        <div style="${GS}grid-column:1/-1;"><label style="${LS}">Headliners / Featured Artists / Performers</label><input type="text" name="headliners" placeholder="e.g. Rasmus Bjerg, Kandis, Motor Mille, Gry" style="${IS}"/></div>
        <div style="${GS}"><label style="${LS}">Entertainment Types</label>
          <div class="checkbox-grid" style="margin-top:6px;">
            ${['Live Music','Family Entertainment','Children\'s Activities','Food & Drinks','Market Stalls','Sports','Comedy','Theatre','Art & Culture','Fireworks','Parade','Dance'].map(t=>`<label class="checkbox-item"><input type="checkbox" name="entertainment_types" value="${t}"/><span style="font-size:13px;">${t}</span></label>`).join('')}
          </div>
        </div>
        <div style="${GS}"><label style="${LS}">Visitor Facilities</label>
          <div class="checkbox-grid" style="margin-top:6px;">
            ${['Parking Available','Public Transport','Wheelchair Accessible','Free Entry','Family Friendly','Camping','Pet Friendly','Food Stalls','Toilets','First Aid'].map(t=>`<label class="checkbox-item"><input type="checkbox" name="facilities" value="${t}"/><span style="font-size:13px;">${t}</span></label>`).join('')}
          </div>
        </div>
      </div>
    </div>

    <!-- SECTION 5 — FOR VENDORS -->
    <div style="${SS}">
      <h2 style="font-family:'DM Serif Display',serif;font-size:22px;font-weight:400;margin-bottom:6px;">5. For Vendors & Exhibitors</h2>
      <p style="font-size:13px;color:var(--ink3);margin-bottom:24px;padding-bottom:20px;border-bottom:1px solid var(--border);">Are you looking for food trucks, artisans or other vendors? Tell them what you need.</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
        <div style="${GS}grid-column:1/-1;"><label style="${LS}">What Kind of Vendors Are You Looking For?</label><textarea name="vendor_info" placeholder="e.g. We are looking for food trucks, street food vendors, artisan crafts, clothing stalls and family entertainment. Foodtrucks are especially welcome…" style="${IS}" rows="4"></textarea></div>
        <div style="${GS}"><label style="${LS}">Vendor Application Deadline</label><input type="date" name="vendor_deadline" style="${IS}"/></div>
        <div style="${GS}"><label style="${LS}">Vendor Application Email / Link</label><input type="text" name="vendor_apply" placeholder="vendors@your-event.com or application URL" style="${IS}"/></div>
        <div style="${GS}"><label style="${LS}">Stall Cost for Vendors</label><input type="text" name="vendor_cost" placeholder="e.g. €150–€400 per stall, Contact for pricing" style="${IS}"/></div>
        <div style="${GS}"><label style="${LS}">Space Available per Vendor</label><input type="text" name="vendor_space" placeholder="e.g. 3×3m standard, larger on request" style="${IS}"/></div>
      </div>
    </div>

    <!-- SECTION 6 — SOCIAL & MEDIA -->
    <div style="${SS}">
      <h2 style="font-family:'DM Serif Display',serif;font-size:22px;font-weight:400;margin-bottom:6px;">6. Social Media & Media</h2>
      <p style="font-size:13px;color:var(--ink3);margin-bottom:24px;padding-bottom:20px;border-bottom:1px solid var(--border);">Link your social media so visitors can follow your event.</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
        <div style="${GS}"><label style="${LS}">📸 Instagram</label><input type="text" name="instagram" placeholder="@yourevent" style="${IS}"/></div>
        <div style="${GS}"><label style="${LS}">👥 Facebook Page</label><input type="text" name="facebook" placeholder="facebook.com/yourevent" style="${IS}"/></div>
        <div style="${GS}"><label style="${LS}">🎵 TikTok</label><input type="text" name="tiktok" placeholder="@yourevent" style="${IS}"/></div>
        <div style="${GS}"><label style="${LS}">🎬 Promo Video (YouTube/Vimeo)</label><input type="url" name="video_url" placeholder="https://youtube.com/watch?v=..." style="${IS}"/></div>
      </div>
    </div>

    <!-- SECTION 7 — PHOTOS -->
    <div style="${SS}">
      <h2 style="font-family:'DM Serif Display',serif;font-size:22px;font-weight:400;margin-bottom:6px;">7. Photos</h2>
      <p style="font-size:13px;color:var(--ink3);margin-bottom:24px;padding-bottom:20px;border-bottom:1px solid var(--border);">Events with photos get 5× more clicks than those without.</p>
      <div style="background:linear-gradient(135deg,rgba(232,71,10,.04),rgba(232,71,10,.08));border:1.5px dashed rgba(232,71,10,.3);border-radius:14px;padding:28px;text-align:center;">
        <div style="font-size:40px;margin-bottom:12px;">📸</div>
        <h3 style="font-size:16px;font-weight:700;margin-bottom:8px;">Upload up to 6 photos after listing</h3>
        <p style="font-size:13px;color:var(--ink3);line-height:1.6;max-width:480px;margin:0 auto;">Once your listing is live in your dashboard you can add photos of your event, venue, crowd and past editions. Photos are the #1 factor that makes visitors click on your event.</p>
      </div>
    </div>

    <!-- SECTION 8 — YOUR DETAILS -->
    <div style="${SS}">
      <h2 style="font-family:'DM Serif Display',serif;font-size:22px;font-weight:400;margin-bottom:6px;">8. Your Contact Details</h2>
      <p style="font-size:13px;color:var(--ink3);margin-bottom:24px;padding-bottom:20px;border-bottom:1px solid var(--border);">We'll send your listing confirmation and login details here.</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
        <div style="${GS}"><label style="${LS}">Your Name *</label><input type="text" name="name" required placeholder="Your full name" style="${IS}"/></div>
        <div style="${GS}"><label style="${LS}">Your Email *</label><input type="email" name="email" required placeholder="your@email.com" style="${IS}"/></div>
        <div style="${GS}"><label style="${LS}">Organisation / Company</label><input type="text" name="organisation" placeholder="e.g. Roskilde Market ApS" style="${IS}"/></div>
        <div style="${GS}"><label style="${LS}">Phone</label><input type="tel" name="phone_organiser" placeholder="+45 12 34 56 78" style="${IS}"/></div>
      </div>
    </div>

    <!-- TERMS & RULES -->
    <div style="background:#fff;border:1px solid var(--border);border-radius:20px;padding:32px;margin-bottom:20px;">
      <h2 style="font-family:'DM Serif Display',serif;font-size:22px;font-weight:400;margin-bottom:6px;">📋 Terms, Rules &amp; Conditions</h2>
      <p style="font-size:13px;color:var(--ink3);margin-bottom:24px;padding-bottom:20px;border-bottom:1px solid var(--border);">Please read carefully before submitting.</p>
      <div style="background:rgba(232,71,10,.04);border:1.5px solid rgba(232,71,10,.2);border-radius:14px;padding:20px 24px;margin-bottom:16px;">
        <div style="font-size:14px;font-weight:700;color:var(--ink);margin-bottom:6px;">💳 No Refund Policy</div>
        <p style="font-size:13px;color:var(--ink3);line-height:1.7;margin:0;">All payments are <strong>final and non-refundable</strong>. Once your listing is live, no refunds will be issued. For errors contact <a href="mailto:contact@festmore.com" style="color:var(--flame);">contact@festmore.com</a> and we will correct it free of charge.</p>
      </div>
      <div style="background:rgba(74,124,89,.04);border:1.5px solid rgba(74,124,89,.2);border-radius:14px;padding:20px 24px;margin-bottom:16px;">
        <div style="font-size:14px;font-weight:700;color:var(--ink);margin-bottom:6px;">✅ Accuracy of Information</div>
        <p style="font-size:13px;color:var(--ink3);line-height:1.7;margin:0;">You are responsible for ensuring all information submitted is accurate and truthful. Festmore reserves the right to remove listings containing false or misleading information without refund.</p>
      </div>
      <div style="background:rgba(201,146,42,.04);border:1.5px solid rgba(201,146,42,.25);border-radius:14px;padding:20px 24px;margin-bottom:16px;">
        <div style="font-size:14px;font-weight:700;color:var(--ink);margin-bottom:8px;">🚫 Prohibited Content</div>
        <p style="font-size:13px;color:var(--ink3);line-height:1.7;margin:0 0 10px;">The following are strictly prohibited and will result in immediate removal without refund: illegal events or activities · violence or hate content · discrimination · adult content · scams or fraudulent listings · illegal substances · copyright violations · spam · political extremism.</p>
      </div>
      <div style="background:var(--ivory);border:1px solid var(--border);border-radius:14px;padding:20px 24px;margin-bottom:20px;">
        <div style="font-size:14px;font-weight:700;color:var(--ink);margin-bottom:6px;">📧 Questions or Issues?</div>
        <p style="font-size:13px;color:var(--ink3);line-height:1.7;margin:0;">Contact us at <a href="mailto:contact@festmore.com" style="color:var(--flame);font-weight:600;">contact@festmore.com</a>. We respond within 24 hours on business days.</p>
      </div>
      <label style="display:flex;align-items:flex-start;gap:12px;cursor:pointer;background:var(--ivory);border:2px solid var(--border);border-radius:12px;padding:16px 18px;" id="terms-label">
        <input type="checkbox" name="terms_agreed" value="1" required style="margin-top:2px;accent-color:var(--flame);width:18px;height:18px;flex-shrink:0;" onchange="document.getElementById('terms-label').style.borderColor=this.checked?'var(--flame)':'var(--border)'"/>
        <span style="font-size:13px;color:var(--ink2);line-height:1.6;">I have read and agree to the <strong>Terms and Conditions</strong> above, including the <strong>no refund policy</strong>. I confirm my listing complies with all applicable laws and Festmore's content rules.</span>
      </label>
    </div>
    <!-- PAYMENT SECTION -->
    <div style="background:var(--ink);border-radius:20px;padding:36px;margin-bottom:24px;">
      <div style="display:grid;grid-template-columns:1fr auto;gap:24px;align-items:center;">
        <div>
          <h3 style="font-family:'DM Serif Display',serif;font-size:26px;font-weight:400;color:#fff;margin-bottom:8px;">Ready to get discovered?</h3>
          <p style="color:rgba(255,255,255,.5);font-size:14px;line-height:1.6;margin-bottom:16px;" id="plan-desc-text">${plan==='free'?'Your free listing goes live within 24 hours. Upgrade anytime from your dashboard.':plan==='premium'?'Premium gives you top placement, homepage feature and dedicated newsletter.':'Standard gives you full SEO, newsletter inclusion and featured placement.'}</p>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            ${['🌍 Worldwide visibility','🔍 Google ranking','📧 Newsletter','🏪 Vendor marketplace'].map(f=>`<span style="background:rgba(255,255,255,.08);color:rgba(255,255,255,.7);padding:4px 12px;border-radius:99px;font-size:12px;font-weight:600;">${f}</span>`).join('')}
          </div>
        </div>
        <div style="text-align:center;flex-shrink:0;">
          <div style="font-family:'DM Serif Display',serif;font-size:52px;color:#fff;line-height:1;" id="price-display">${plan==='free'?'€0':plan==='premium'?'€149':'€79'}</div>
          <div style="color:rgba(255,255,255,.4);font-size:13px;margin-bottom:16px;" id="price-period">${plan==='free'?'free forever':'/year'}</div>
          <button type="submit" id="submit-btn" style="background:${plan==='free'?'#4a7c59':'#e8470a'};color:#fff;border:none;padding:16px 36px;border-radius:12px;font-size:16px;font-weight:700;cursor:pointer;font-family:inherit;box-shadow:0 8px 24px rgba(232,71,10,.4);transition:all .2s;" onmouseover="this.style.opacity='.9'" onmouseout="this.style.opacity='1'">
            ${plan==='free'?'List for Free →':'Continue to Payment →'}
          </button>
          <div style="color:rgba(255,255,255,.3);font-size:12px;margin-top:10px;">${plan==='free'?'No credit card required':'🔒 Secure payment via Stripe'}</div>
        </div>
      </div>
    </div>

    <div style="text-align:center;margin-bottom:40px;">
      <a href="/events/pricing" style="color:var(--ink3);font-size:13.5px;">Compare all plans in detail →</a>
    </div>
  </form>
</div>

${renderFooterSimple()}
<script>
function selectPlan(plan) {
  // Update card styles
  document.getElementById('plan-free').className = 'plan-card' + (plan==='free'?' active-free':'');
  document.getElementById('plan-standard').className = 'plan-card' + (plan==='standard'?' active-standard':'');
  document.getElementById('plan-premium').className = 'plan-card' + (plan==='premium'?' active-premium':'');

  // Show/hide features
  ['free','standard','premium'].forEach(p => {
    document.getElementById('plan-info-'+p).classList.toggle('visible', p===plan);
  });

  // Update hidden input
  document.getElementById('plan-input').value = plan;

  // Update payment section
  const prices = {free:'€0', standard:'€79', premium:'€149'};
  const periods = {free:'free forever', standard:'/year', premium:'/year'};
  const btns = {free:'List for Free →', standard:'Continue to Payment →', premium:'Continue to Payment →'};
  const descs = {
    free:'Your free listing goes live within 24 hours. Upgrade anytime from your dashboard.',
    standard:'Standard gives you full SEO, newsletter inclusion and featured placement in search.',
    premium:'Premium gives you top placement, homepage feature and dedicated newsletter spotlight.'
  };
  const colors = {free:'#4a7c59', standard:'#e8470a', premium:'#c9922a'};
  const notes = {free:'No credit card required', standard:'🔒 Secure payment via Stripe', premium:'🔒 Secure payment via Stripe'};

  document.getElementById('price-display').textContent = prices[plan];
  document.getElementById('price-period').textContent = periods[plan];
  document.getElementById('submit-btn').textContent = btns[plan];
  document.getElementById('submit-btn').style.background = colors[plan];
  document.getElementById('plan-desc-text').textContent = descs[plan];
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
        ${isFreeListig ? '<span class="badge" style="background:rgba(0,0,0,.4);color:#fff;">🔓 Unverified</span>' : '<span class="badge" style="background:#4a7c59;color:#fff;">✅ Verified</span>'}
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