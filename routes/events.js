// routes/events.js — COMPLETE WITH ADMIN NOTIFICATIONS
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
const CATS = { festival:'🎪',concert:'🎵',market:'🛍️',christmas:'🎄',exhibition:'🖼️',business:'💼',kids:'🎠',comics:'🎮',flea:'🏺',online:'💻',city:'🏙️',messe:'🏛️' };
const CAT_NAMES = { festival:'Festivals',concert:'Concerts',market:'Markets',christmas:'Christmas Markets',exhibition:'Exhibitions',business:'Business & Fairs',kids:'Kids Events',comics:'Comics & Gaming',flea:'Flea Markets',online:'Online Events',city:'City Events',messe:'Trade Fairs' };
const FLAGS = {
  BE:'🇧🇪',CN:'🇨🇳',DK:'🇩🇰',FR:'🇫🇷',DE:'🇩🇪',NL:'🇳🇱',PL:'🇵🇱',SE:'🇸🇪',AE:'🇦🇪',GB:'🇬🇧',US:'🇺🇸',
  NO:'🇳🇴',FI:'🇫🇮',AT:'🇦🇹',CH:'🇨🇭',IT:'🇮🇹',ES:'🇪🇸',PT:'🇵🇹',IE:'🇮🇪',CZ:'🇨🇿',HU:'🇭🇺',
  GR:'🇬🇷',HR:'🇭🇷',IN:'🇮🇳',TH:'🇹🇭',JP:'🇯🇵',
  AU:'🇦🇺',CA:'🇨🇦',BR:'🇧🇷',MX:'🇲🇽',KR:'🇰🇷',ZA:'🇿🇦',AR:'🇦🇷',MA:'🇲🇦',SG:'🇸🇬',RO:'🇷🇴',
};
const COUNTRY_NAMES = {
  BE:'Belgium',CN:'China',DK:'Denmark',FR:'France',DE:'Germany',NL:'Netherlands',PL:'Poland',SE:'Sweden',
  AE:'UAE',GB:'United Kingdom',US:'USA',NO:'Norway',FI:'Finland',AT:'Austria',CH:'Switzerland',IT:'Italy',
  ES:'Spain',PT:'Portugal',IE:'Ireland',CZ:'Czech Republic',HU:'Hungary',GR:'Greece',HR:'Croatia',
  IN:'India',TH:'Thailand',JP:'Japan',
  AU:'Australia',CA:'Canada',BR:'Brazil',MX:'Mexico',KR:'South Korea',ZA:'South Africa',
  AR:'Argentina',MA:'Morocco',SG:'Singapore',RO:'Romania',
};

// ─── ADMIN EMAIL NOTIFICATION ─────────────────────────────────────
async function notifyAdmin(type, title, city, country, email, plan, slug) {
  try {
    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    const flag = FLAGS[country] || '🌍';
    const planBadge = plan === 'premium' ? '⭐ PREMIUM €149' : plan === 'standard' ? '💰 STANDARD €79' : '🆓 FREE';
    await resend.emails.send({
      from: 'Festmore <onboarding@resend.dev>',
      to: 'anotherdews@gmail.com',
      subject: '🎪 New Event: ' + title,
      html: '<div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">'
        + '<div style="background:#0a1a0f;padding:20px 28px;"><span style="font-size:18px;font-weight:800;color:#fff;">Fest<span style="color:#e8470a;">more</span></span><div style="color:rgba(255,255,255,.5);font-size:12px;margin-top:4px;">New Event Notification</div></div>'
        + '<div style="padding:24px 28px;">'
        + '<div style="font-size:22px;margin-bottom:12px;">🎪 New Event Listed!</div>'
        + '<table style="width:100%;border-collapse:collapse;font-size:14px;">'
        + '<tr><td style="padding:8px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;width:100px;">Event</td><td style="padding:8px 0;border-bottom:1px solid #f3f4f6;font-weight:700;">' + title + '</td></tr>'
        + '<tr><td style="padding:8px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;">Location</td><td style="padding:8px 0;border-bottom:1px solid #f3f4f6;">' + flag + ' ' + city + ', ' + (COUNTRY_NAMES[country]||country) + '</td></tr>'
        + '<tr><td style="padding:8px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;">Plan</td><td style="padding:8px 0;border-bottom:1px solid #f3f4f6;font-weight:700;color:#e8470a;">' + planBadge + '</td></tr>'
        + '<tr><td style="padding:8px 0;color:#6b7280;">Email</td><td style="padding:8px 0;">' + (email||'Not provided') + '</td></tr>'
        + '</table>'
        + '<div style="margin-top:20px;display:flex;gap:10px;">'
        + (slug ? '<a href="https://festmore.com/events/' + slug + '" style="display:inline-block;background:#e8470a;color:#fff;padding:10px 18px;border-radius:8px;font-size:13px;font-weight:700;text-decoration:none;">View Event →</a>' : '')
        + '<a href="https://festmore.com/admin" style="display:inline-block;background:#1a1612;color:#fff;padding:10px 18px;border-radius:8px;font-size:13px;font-weight:700;text-decoration:none;">Admin Panel →</a>'
        + '</div></div></div>'
    });
    console.log('✅ Admin notified:', title);
  } catch(e) { console.error('Admin notify error:', e.message); }
}

// ─── EVENTS LISTING PAGE ──────────────────────────────────────────
router.get('/', (req, res) => {
  const { q='', country='ALL', category='ALL', price='ALL', sort='featured', page=1, when='', city='' } = req.query;
  const perPage = 12;
  const offset = (parseInt(page)-1) * perPage;
  let where = ["e.status='active'"], params = [];
  if (country !== 'ALL') { where.push("e.country=?"); params.push(country); }
  if (category !== 'ALL') { where.push("e.category=?"); params.push(category); }
  if (price === 'free') { where.push("e.price_display='Free'"); }
  if (price === 'paid') { where.push("e.price_display!='Free'"); }
  if (city) { where.push("(e.city LIKE ? OR e.country LIKE ?)"); params.push('%'+city+'%','%'+city+'%'); }
  const now = new Date();
  if (when==='weekend'){const fri=new Date(now);fri.setDate(now.getDate()+(5-now.getDay()));const sun=new Date(fri);sun.setDate(fri.getDate()+2);where.push("e.start_date>=? AND e.start_date<=?");params.push(fri.toISOString().split('T')[0],sun.toISOString().split('T')[0]);}
  else if (when==='week'){const w=new Date(now);w.setDate(now.getDate()+7);where.push("e.start_date>=? AND e.start_date<=?");params.push(now.toISOString().split('T')[0],w.toISOString().split('T')[0]);}
  else if (when==='month'){const m=new Date(now);m.setDate(now.getDate()+30);where.push("e.start_date>=? AND e.start_date<=?");params.push(now.toISOString().split('T')[0],m.toISOString().split('T')[0]);}
  else if (when==='summer'){where.push("e.start_date>=? AND e.start_date<=?");params.push('2026-06-01','2026-08-31');}
  if (q) { where.push("(e.title LIKE ? OR e.city LIKE ? OR e.description LIKE ? OR e.tags LIKE ?)"); params.push('%'+q+'%','%'+q+'%','%'+q+'%','%'+q+'%'); }
  const whereStr = where.join(' AND ');
  let orderBy = 'e.featured DESC, e.verified DESC, e.views DESC';
  if (sort === 'date') orderBy = 'e.start_date ASC';
  if (sort === 'visitors') orderBy = 'e.attendees DESC';
  const total = db.prepare('SELECT COUNT(*) as n FROM events e WHERE '+whereStr).get(...params).n;
  const events = db.prepare('SELECT * FROM events e WHERE '+whereStr+' ORDER BY '+orderBy+' LIMIT ? OFFSET ?').all(...params, perPage, offset);
  const totalPages = Math.ceil(total / perPage);
  res.send(renderEventsPage({ events, total, totalPages, page: parseInt(page), q, country, category, price, sort, user: req.session.user }));
});

// ─── PRICING PAGE ─────────────────────────────────────────────────
router.get('/pricing', (req, res) => {
  res.send(renderPricingPage(req.session.user, req.query.error));
});

// ─── SUBMIT PAGE ──────────────────────────────────────────────────
router.get('/submit', (req, res) => {
  res.send(renderSubmitPage(req.session.user, req.query.success, req.query.error, req.query.plan || ''));
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
  let slug = baseSlug, i = 1;
  while (db.prepare('SELECT id FROM events WHERE slug=?').get(slug)) { slug = baseSlug + '-' + (i++); }

  if (plan === 'free') {
    db.prepare(`INSERT INTO events (title,slug,category,city,country,start_date,end_date,date_display,description,price_display,website,ticket_url,attendees,vendor_spots,address,tags,status,payment_status,source,featured,organiser_email) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'active','free','manual',0,?)`)
      .run(title,slug,category,city,country,start_date,end_date||'',date_display||'',description||'',price_display||'Free',website||'',ticket_url||'',parseInt(attendees)||0,parseInt(vendor_spots)||0,address||'',tags||'[]',email||'');
    await notifyAdmin('Free event listed', title, city, country, email, 'free', slug);
await sendWelcomeToOrganiser(email, title, slug, 'free');
return res.redirect('/events/submit-success?plan=free&slug=' + slug);
  }

  const isPremium = plan === 'premium';
  const amount = isPremium ? 14900 : 7900;
  const planName = isPremium ? 'Premium' : 'Standard';

  const result = db.prepare(`INSERT INTO events (title,slug,category,city,country,start_date,end_date,date_display,description,price_display,website,ticket_url,attendees,vendor_spots,address,tags,status,payment_status,source,featured,organiser_email) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'pending','unpaid','manual',?,?)`)
    .run(title,slug,category,city,country,start_date,end_date||'',date_display||'',description||'',price_display||'Free',website||'',ticket_url||'',parseInt(attendees)||0,parseInt(vendor_spots)||0,address||'',tags||'[]',isPremium?1:0,email||'');
  const eventId = result.lastInsertRowid;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price_data: { currency: 'eur', product_data: { name: 'Festmore ' + planName + ' Event Listing', description: planName + ' annual listing for "' + title + '" on Festmore.com' }, unit_amount: amount }, quantity: 1 }],
      mode: 'payment',
      success_url: 'https://festmore.com/events/payment-success?event_id=' + eventId + '&plan=' + plan,
      cancel_url: 'https://festmore.com/events/submit?error=Payment+cancelled&plan=' + plan,
      metadata: { event_id: String(eventId), type: 'event_listing', plan },
      customer_email: email || undefined,
    });
    db.prepare(`INSERT INTO payments (stripe_session_id,amount,type,status,reference_id) VALUES (?,?,?,?,?) ON CONFLICT (stripe_session_id) DO NOTHING`)
      .run(session.id, amount, 'event_listing', 'pending', eventId);
    res.redirect(session.url);
  } catch (err) {
    console.error('Stripe error:', err.message);
    res.redirect('/events/submit?error=Payment+unavailable.+Please+try+again.&plan=' + plan);
  }
});

// ─── SUBMIT SUCCESS ───────────────────────────────────────────────
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
  <h1 style="font-family:'DM Serif Display',serif;font-size:36px;font-weight:400;margin-bottom:12px;">${plan === 'free' ? 'Your Event is Live!' : 'Payment Successful!'}</h1>
  <p style="color:var(--ink3);font-size:16px;line-height:1.75;margin-bottom:28px;">${plan === 'free' ? 'Your free listing is now live on Festmore. Upgrade anytime for featured placement and newsletter inclusion.' : 'Your event is now featured on Festmore and visible to thousands of visitors worldwide.'}</p>
  <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
    <a href="/events/${slug || ''}" class="btn btn-primary btn-lg">View Your Event →</a>
    <a href="/events" class="btn btn-outline btn-lg">Browse Events</a>
  </div>
</div></body></html>`);
});

// ─── PAYMENT SUCCESS ──────────────────────────────────────────────
router.get('/payment-success', async (req, res) => {
  const { event_id, plan } = req.query;
  if (event_id) {
    const isPremium = plan === 'premium';
    if (isPremium) {
      db.prepare("UPDATE events SET payment_status='premium', status='active', featured=1, verified=1 WHERE id=?").run(parseInt(event_id));
    } else {
      db.prepare("UPDATE events SET payment_status='paid', status='active', featured=0, verified=1 WHERE id=?").run(parseInt(event_id));
    }
    db.prepare("UPDATE payments SET status='completed' WHERE reference_id=?").run(parseInt(event_id));
    const event = db.prepare("SELECT * FROM events WHERE id=?").get(parseInt(event_id));
    if (event) await notifyAdmin('Paid event confirmed', event.title, event.city, event.country, event.organiser_email||'', plan, event.slug);
    if (event) await sendWelcomeToOrganiser(event.organiser_email, event.title, event.slug, plan);
  }
  const event = event_id ? db.prepare("SELECT * FROM events WHERE id=?").get(parseInt(event_id)) : null;
  res.redirect('/events/submit-success?plan=' + (plan||'standard') + '&slug=' + (event ? event.slug : ''));
});

async function sendWelcomeToOrganiser(email, title, slug, plan) {
  if (!email) return;
  try {
    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    const isPaid = plan !== 'free';
    await resend.emails.send({
      from: 'Festmore <onboarding@resend.dev>',
      to: email,
      subject: isPaid ? '🎉 Your event is live on Festmore!' : '✅ Your event is listed on Festmore!',
      html: '<!DOCTYPE html><html><head><meta charset="UTF-8"/></head>'
        + '<body style="margin:0;padding:0;background:#f5f0e8;font-family:Helvetica Neue,Arial,sans-serif;">'
        + '<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;padding:32px 16px;"><tr><td align="center">'
        + '<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">'
        + '<tr><td style="background:#0a1a0f;border-radius:20px 20px 0 0;padding:40px 48px;text-align:center;">'
        + '<span style="font-size:26px;font-weight:800;color:#fff;">Fest<span style="color:#e8470a;">more</span></span>'
        + '<div style="font-size:52px;margin:20px 0;">' + (isPaid ? '🎉' : '✅') + '</div>'
        + '<h1 style="font-size:26px;font-weight:400;color:#fff;margin:0;font-family:Georgia,serif;">'
        + (isPaid ? 'Your event is live!' : 'Your event is listed!') + '</h1>'
        + '</td></tr>'
        + '<tr><td style="background:#fff;padding:40px 48px;">'
        + '<p style="font-size:16px;color:#1a1612;margin-bottom:16px;">Hi there,</p>'
        + '<p style="font-size:15px;color:#6b5f58;line-height:1.8;margin-bottom:24px;">'
        + 'Your event <strong>' + title + '</strong> is now ' + (isPaid ? 'featured' : 'listed') + ' on Festmore and visible to thousands of visitors and vendors across Europe and worldwide.'
        + '</p>'
        + '<div style="background:#f5f0e8;border-radius:14px;padding:24px;margin-bottom:28px;">'
        + '<div style="font-size:14px;font-weight:700;color:#1a1612;margin-bottom:12px;">What happens next:</div>'
        + '<div style="font-size:14px;color:#6b5f58;line-height:2.0;">'
        + '🎪 Your event is searchable by visitors worldwide<br/>'
        + '🏪 Vendors can find and apply to your event<br/>'
        + '📧 ' + (isPaid ? 'Your event is included in our weekly newsletter' : 'Upgrade to Standard to be included in our newsletter') + '<br/>'
        + '📊 Track your event views from your dashboard'
        + '</div></div>'
        + '<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;"><tr>'
        + '<td width="48%" style="padding-right:8px;"><a href="https://festmore.com/events/' + slug + '" style="display:block;background:#e8470a;color:#fff;padding:13px 20px;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none;text-align:center;">View Your Event →</a></td>'
        + '<td width="48%" style="padding-left:8px;"><a href="https://festmore.com/vendors" style="display:block;background:#4a7c59;color:#fff;padding:13px 20px;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none;text-align:center;">Find Vendors →</a></td>'
        + '</tr></table>'
        + (plan === 'free' ? '<div style="background:#fff7ed;border:1px solid rgba(232,71,10,.2);border-radius:12px;padding:20px;margin-bottom:24px;text-align:center;"><div style="font-size:14px;font-weight:700;color:#1a1612;margin-bottom:8px;">Want more visibility?</div><div style="font-size:13px;color:#6b5f58;margin-bottom:14px;">Upgrade to Standard (€79/yr) for featured placement, newsletter inclusion and SEO boost.</div><a href="https://festmore.com/events/pricing" style="display:inline-block;background:#e8470a;color:#fff;padding:11px 24px;border-radius:10px;font-size:13px;font-weight:700;text-decoration:none;">Upgrade Now →</a></div>' : '')
        + '<p style="font-size:13px;color:#7a6f68;line-height:1.7;">Questions? Reply to this email and we will get back to you personally.</p>'
        + '</td></tr>'
        + '<tr><td style="background:#1a1612;border-radius:0 0 20px 20px;padding:24px 48px;text-align:center;">'
        + '<span style="font-size:16px;font-weight:800;color:#fff;">Fest<span style="color:#e8470a;">more</span></span>'
        + '<p style="font-size:11px;color:rgba(255,255,255,.3);margin:10px 0 0;">© ' + new Date().getFullYear() + ' Festmore.com</p>'
        + '</td></tr></table></td></tr></table></body></html>'
    });
    console.log('✅ Welcome email sent to organiser:', email);
  } catch(e) { console.error('Organiser welcome email error:', e.message); }
}




// ─── EVENT DETAIL PAGE ────────────────────────────────────────────
router.get('/:slug', (req, res) => {
  const event = db.prepare("SELECT * FROM events WHERE slug=? AND status='active'").get(req.params.slug);
  if (!event) return res.status(404).redirect('/events?error=Event not found');
  db.prepare("UPDATE events SET views=views+1 WHERE id=?").run(event.id);
  const related = db.prepare("SELECT * FROM events WHERE status='active' AND category=? AND id!=? ORDER BY featured DESC, views DESC LIMIT 4").all(event.category, event.id);
  res.send(renderEventDetail(event, related, req.session.user));
});

module.exports = router;

// ═══════════════════════════════════════
// RENDER FUNCTIONS
// ═══════════════════════════════════════

function renderPricingPage(user, error) {
  const plans = [
    { name:'Free', price:'€0', period:'forever', color:'var(--sage)', cta:'List for Free', plan:'free', highlight:false, features:[['✅','Your event live within 24 hours'],['✅','Basic event listing page'],['✅','Visible in search results'],['✅','Event details and links'],['❌','Featured placement'],['❌','Newsletter inclusion'],['❌','SEO optimised title & meta'],['❌','Priority support']] },
    { name:'Standard', price:'€79', period:'/year', color:'var(--flame)', cta:'Get Standard', plan:'standard', highlight:true, features:[['✅','Your event live within 24 hours'],['✅','Full SEO-optimised listing page'],['✅','Featured in search results'],['✅','Included in weekly newsletter'],['✅','Your own URL on Festmore'],['✅','Track views and analytics'],['✅','Connect with verified vendors'],['✅','Priority support']] },
    { name:'Premium', price:'€149', period:'/year', color:'var(--gold)', cta:'Get Premium', plan:'premium', highlight:false, features:[['✅','Everything in Standard'],['⭐','Top of search results'],['⭐','Featured on homepage'],['⭐','Dedicated newsletter feature'],['⭐','Bold featured badge'],['⭐','Social media promotion'],['⭐','Monthly performance report'],['⭐','Dedicated account manager']] },
  ];
  return '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Event Listing Plans — Festmore</title><link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/><link rel="stylesheet" href="/css/main.css"/></head><body>'
    + renderNavSimple(user)
    + '<div class="page-hero-small"><div class="container"><h1>List Your Event on Festmore</h1><p>Choose the plan that works for you — start free, upgrade anytime</p></div></div>'
    + '<div class="container" style="padding:64px 0;max-width:1100px;">'
    + (error ? '<div class="alert alert-error" style="margin-bottom:32px;">⚠️ ' + error + '</div>' : '')
    + '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:24px;margin-bottom:56px;">'
    + plans.map(p => '<div style="background:#fff;border:2px solid ' + (p.highlight?'var(--flame)':'var(--border)') + ';border-radius:24px;padding:36px 32px;position:relative;' + (p.highlight?'box-shadow:0 20px 60px rgba(232,71,10,.15);':'') + '">'
      + (p.highlight?'<div style="position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:var(--flame);color:#fff;padding:4px 20px;border-radius:99px;font-size:12px;font-weight:700;">Most Popular</div>':'')
      + '<div style="font-size:13px;font-weight:700;color:' + p.color + ';text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">' + p.name + '</div>'
      + '<div style="display:flex;align-items:baseline;gap:4px;margin-bottom:6px;"><span style="font-family:\'DM Serif Display\',serif;font-size:48px;color:var(--ink);line-height:1;">' + p.price + '</span><span style="color:var(--ink4);font-size:15px;">' + p.period + '</span></div>'
      + '<p style="font-size:13px;color:var(--ink4);margin-bottom:28px;">' + (p.name==='Free'?'Perfect to get started':p.name==='Standard'?'Best for most events':'Maximum visibility') + '</p>'
      + p.features.map(([icon,text]) => '<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);font-size:13.5px;color:var(--ink2);">' + icon + ' ' + text + '</div>').join('')
      + '<a href="/events/submit?plan=' + p.plan + '" class="btn ' + (p.highlight?'btn-primary':'btn-outline') + '" style="display:block;text-align:center;margin-top:24px;padding:13px 24px;font-size:15px;">' + p.cta + ' →</a></div>'
    ).join('')
    + '</div></div>' + renderFooterSimple() + '</body></html>';
}

function renderEventsPage({ events, total, totalPages, page, q, country, category, price, sort, user }) {
  const params = new URLSearchParams({ q, country, category, price, sort });
  return '<!DOCTYPE html><html lang="en"><head>'
    + '<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/>'
    + '<title>' + (category!=='ALL'?CAT_NAMES[category]+' — ':'') + (country!=='ALL'?COUNTRY_NAMES[country]+' ':'') + 'Events ' + new Date().getFullYear() + ' | Festmore</title>'
    + '<meta name="description" content="Browse ' + total + '+ ' + (category!=='ALL'?CAT_NAMES[category]:'') + ' events' + (country!=='ALL'?' in '+COUNTRY_NAMES[country]:'worldwide') + '."/>'
    + '<link rel="canonical" href="https://festmore.com/events' + (country!=='ALL'?'?country='+country:category!=='ALL'?'?category='+category:'') + '"/>'
    + '<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/>'
    + '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2486135003689222" crossorigin="anonymous"></script>'
    + '<link rel="stylesheet" href="/css/main.css"/></head><body>'
    + renderNavSimple(user)
    + '<div class="page-hero-small"><div class="container">'
    + '<h1>' + (category!=='ALL'?CATS[category]+' '+CAT_NAMES[category]:country!=='ALL'?(FLAGS[country]||'🌍')+' Events in '+COUNTRY_NAMES[country]:'🌍 All Events') + '</h1>'
    + '<p>' + total + ' events found' + (q?' for "'+q+'"':'') + '</p>'
    + '</div></div>'
    + '<div class="container" style="padding-top:32px;">'
    + '<form class="filter-bar" method="GET" action="/events">'
    + '<div class="filter-group"><label class="filter-label">Search</label><input class="filter-input" type="text" name="q" value="' + q + '" placeholder="Event name, city…"/></div>'
    + '<div class="filter-group"><label class="filter-label">Country</label><select class="filter-select" name="country"><option value="ALL" ' + (country==='ALL'?'selected':'') + '>All Countries</option>' + Object.entries(COUNTRY_NAMES).map(([k,v]) => '<option value="' + k + '" ' + (country===k?'selected':'') + '>' + (FLAGS[k]||'🌍') + ' ' + v + '</option>').join('') + '</select></div>'
    + '<div class="filter-group"><label class="filter-label">Category</label><select class="filter-select" name="category"><option value="ALL" ' + (category==='ALL'?'selected':'') + '>All Types</option>' + Object.entries(CAT_NAMES).map(([k,v]) => '<option value="' + k + '" ' + (category===k?'selected':'') + '>' + CATS[k] + ' ' + v + '</option>').join('') + '</select></div>'
    + '<div class="filter-group"><label class="filter-label">Price</label><select class="filter-select" name="price"><option value="ALL" ' + (price==='ALL'?'selected':'') + '>Any Price</option><option value="free" ' + (price==='free'?'selected':'') + '>Free Only</option><option value="paid" ' + (price==='paid'?'selected':'') + '>Paid Events</option></select></div>'
    + '<div class="filter-group"><label class="filter-label">Sort By</label><select class="filter-select" name="sort"><option value="featured" ' + (sort==='featured'?'selected':'') + '>Featured</option><option value="date" ' + (sort==='date'?'selected':'') + '>Soonest</option><option value="visitors" ' + (sort==='visitors'?'selected':'') + '>Most Popular</option></select></div>'
    + '<button type="submit" class="btn btn-primary filter-btn">Filter</button></form>'
    + '<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-2486135003689222" data-ad-format="auto" data-full-width-responsive="true"></ins><script>(adsbygoogle = window.adsbygoogle || []).push({});</script>'
    + (events.length === 0
      ? '<div class="empty-state"><div style="font-size:48px;margin-bottom:16px;">🔍</div><h2>No events found</h2><p>Try different filters or <a href="/events">clear all filters</a></p></div>'
      : '<div class="events-grid" style="margin-bottom:40px;">' + events.map(e => eventCardHTMLFull(e)).join('') + '</div>')
    + (totalPages > 1 ? '<div class="pagination">'
      + (page > 1 ? '<a href="/events?' + new URLSearchParams({...Object.fromEntries(params),page:page-1}) + '" class="page-btn">‹ Prev</a>' : '')
      + Array.from({length:Math.min(totalPages,7)},(_,i)=>i+1).map(p => '<a href="/events?' + new URLSearchParams({...Object.fromEntries(params),page:p}) + '" class="page-btn ' + (p===page?'active':'') + '">' + p + '</a>').join('')
      + (page < totalPages ? '<a href="/events?' + new URLSearchParams({...Object.fromEntries(params),page:page+1}) + '" class="page-btn">Next ›</a>' : '')
      + '</div>' : '')
    + '</div>' + renderFooterSimple() + '</body></html>';
}

function renderSubmitPage(user, success, error, selectedPlan) {
  const plan = selectedPlan || 'standard';
  const IS = 'width:100%;background:#fff;border:1.5px solid var(--border2);border-radius:10px;padding:12px 14px;font-size:14px;outline:none;box-sizing:border-box;font-family:inherit;';
  const LS = 'font-size:12px;font-weight:700;color:var(--ink3);text-transform:uppercase;letter-spacing:.8px;display:block;margin-bottom:6px;';
  const GS = 'margin-bottom:20px;';
  const SS = 'background:#fff;border:1px solid var(--border);border-radius:20px;padding:32px;margin-bottom:20px;';
  const countryOptions = Object.entries(COUNTRY_NAMES).map(([k,v]) => '<option value="' + k + '">' + (FLAGS[k]||'') + ' ' + v + '</option>').join('');
  return '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/>'
    + '<title>List Your Event on Festmore</title>'
    + '<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/>'
    + '<link rel="stylesheet" href="/css/main.css"/>'
    + '<style>.plan-card{border:2px solid var(--border);background:#fff;border-radius:18px;padding:22px 20px;cursor:pointer;transition:all .2s;text-align:center;position:relative;}.plan-card.active-free{border-color:var(--sage);}.plan-card.active-standard{border-color:var(--flame);}.plan-card.active-premium{border-color:var(--gold);}.plan-popular{position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:var(--flame);color:#fff;font-size:10px;font-weight:800;padding:3px 12px;border-radius:99px;}.plan-features{background:var(--ivory);border-radius:12px;padding:16px 20px;margin-bottom:28px;display:none;}.plan-features.visible{display:block;}textarea{resize:vertical;}</style>'
    + '</head><body>' + renderNavSimple(user)
    + '<div style="background:linear-gradient(135deg,#1a0a00,#3d1200);padding:64px 0;"><div class="container" style="max-width:860px;text-align:center;"><h1 style="font-family:\'DM Serif Display\',serif;font-size:clamp(28px,4vw,52px);font-weight:400;color:#fff;margin-bottom:14px;">Get Your Event in Front of Thousands</h1><p style="color:rgba(255,255,255,.55);font-size:16px;">Free listing available. Upgrade for maximum visibility.</p></div></div>'
    + '<div class="container" style="padding:48px 0;max-width:880px;">'
    + (error ? '<div class="alert alert-error" style="margin-bottom:24px;">⚠️ ' + error + '</div>' : '')
    + (success ? '<div class="alert alert-success" style="margin-bottom:24px;">✅ ' + success + '</div>' : '')
    + '<h2 style="font-family:\'DM Serif Display\',serif;font-size:22px;font-weight:400;margin-bottom:20px;">Choose Your Plan</h2>'
    + '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;margin-bottom:12px;">'
    + [{id:'free',label:'Free',price:'€0',period:'forever',color:'var(--sage)',desc:'Get started today',popular:false},{id:'standard',label:'Standard',price:'€79',period:'/year',color:'var(--flame)',desc:'Most popular',popular:true},{id:'premium',label:'Premium',price:'€149',period:'/year',color:'var(--gold)',desc:'Maximum exposure',popular:false}].map(p =>
      '<div class="plan-card ' + (plan===p.id?'active-'+p.id:'') + '" id="plan-' + p.id + '" onclick="selectPlan(\'' + p.id + '\')">'
      + (p.popular?'<div class="plan-popular">Most Popular</div>':'')
      + '<div style="font-size:12px;font-weight:700;color:' + p.color + ';text-transform:uppercase;margin-bottom:6px;">' + p.label + '</div>'
      + '<div style="font-family:\'DM Serif Display\',serif;font-size:32px;color:var(--ink);line-height:1;">' + p.price + '</div>'
      + '<div style="font-size:12px;color:var(--ink4);margin-bottom:8px;">' + p.period + '</div>'
      + '<div style="font-size:12px;color:var(--ink3);">' + p.desc + '</div></div>'
    ).join('')
    + '</div>'
    + [{id:'free',color:'rgba(74,124,89,.07)',border:'rgba(74,124,89,.2)',tc:'var(--sage)',title:'Free Plan:',desc:'✅ Basic listing · ✅ Visible in search · ❌ No featured · ❌ No newsletter'},{id:'standard',color:'rgba(232,71,10,.05)',border:'rgba(232,71,10,.2)',tc:'var(--flame)',title:'Standard — €79/year:',desc:'✅ Full SEO · ✅ Featured · ✅ Newsletter · ✅ Connect vendors'},{id:'premium',color:'rgba(201,146,42,.05)',border:'rgba(201,146,42,.25)',tc:'var(--gold)',title:'Premium — €149/year:',desc:'⭐ Everything in Standard · ⭐ Top placement · ⭐ Homepage · ⭐ Social media'}].map(p =>
      '<div id="plan-info-' + p.id + '" class="plan-features ' + (plan===p.id?'visible':'') + '" style="background:' + p.color + ';border:1px solid ' + p.border + ';"><div style="font-weight:700;color:' + p.tc + ';margin-bottom:6px;">' + p.title + '</div><div style="font-size:13.5px;color:var(--ink2);">' + p.desc + '</div></div>'
    ).join('')
    + '<form method="POST" action="/events/submit"><input type="hidden" name="plan" id="plan-input" value="' + plan + '"/>'
    + '<div style="' + SS + '"><h2 style="font-family:\'DM Serif Display\',serif;font-size:22px;font-weight:400;margin-bottom:20px;">1. Event Details</h2>'
    + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">'
    + '<div style="' + GS + 'grid-column:1/-1;"><label style="' + LS + '">Event Name *</label><input type="text" name="title" required placeholder="e.g. Berlin Christmas Market 2026" style="' + IS + '"/></div>'
    + '<div style="' + GS + '"><label style="' + LS + '">Category *</label><select name="category" required style="' + IS + '"><option value="">Select category…</option><option value="festival">🎪 Festival</option><option value="concert">🎵 Concert</option><option value="market">🛍️ Market</option><option value="christmas">🎄 Christmas Market</option><option value="exhibition">🖼️ Exhibition</option><option value="business">💼 Business / Fair</option><option value="kids">🎠 Kids Event</option><option value="comics">🎮 Comics & Gaming</option><option value="flea">🏺 Flea Market</option><option value="online">💻 Online Event</option><option value="city">🏙️ City Event</option><option value="messe">🏛️ Trade Fair</option></select></div>'
    + '<div style="' + GS + '"><label style="' + LS + '">Country *</label><select name="country" required style="' + IS + '"><option value="">Select country…</option>' + countryOptions + '</select></div>'
    + '<div style="' + GS + '"><label style="' + LS + '">City *</label><input type="text" name="city" required placeholder="e.g. Berlin" style="' + IS + '"/></div>'
    + '<div style="' + GS + '"><label style="' + LS + '">Venue / Address</label><input type="text" name="address" placeholder="e.g. Gendarmenmarkt Square" style="' + IS + '"/></div>'
    + '<div style="' + GS + '"><label style="' + LS + '">Entry Price</label><input type="text" name="price_display" placeholder="Free, €12, From €25…" style="' + IS + '"/></div>'
    + '<div style="' + GS + '"><label style="' + LS + '">Start Date *</label><input type="date" name="start_date" required style="' + IS + '"/></div>'
    + '<div style="' + GS + '"><label style="' + LS + '">End Date</label><input type="date" name="end_date" style="' + IS + '"/></div>'
    + '<div style="' + GS + '"><label style="' + LS + '">Date Display</label><input type="text" name="date_display" placeholder="e.g. 27 Nov – 24 Dec 2026" style="' + IS + '"/></div>'
    + '<div style="' + GS + '"><label style="' + LS + '">Event Website</label><input type="url" name="website" placeholder="https://your-event.com" style="' + IS + '"/></div>'
    + '<div style="' + GS + '"><label style="' + LS + '">Ticket Link</label><input type="url" name="ticket_url" placeholder="https://ticketmaster.com/..." style="' + IS + '"/></div>'
    + '<div style="' + GS + '"><label style="' + LS + '">Expected Visitors</label><input type="number" name="attendees" placeholder="e.g. 5000" style="' + IS + '"/></div>'
    + '<div style="' + GS + '"><label style="' + LS + '">Vendor Spots Available</label><input type="number" name="vendor_spots" placeholder="e.g. 50" style="' + IS + '"/></div>'
    + '<div style="' + GS + 'grid-column:1/-1;"><label style="' + LS + '">Event Description *</label><textarea name="description" required placeholder="Describe your event in detail…" style="' + IS + '" rows="6"></textarea></div>'
    + '</div></div>'
    + '<div style="' + SS + '"><h2 style="font-family:\'DM Serif Display\',serif;font-size:22px;font-weight:400;margin-bottom:20px;">2. Your Contact Details</h2>'
    + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">'
    + '<div style="' + GS + '"><label style="' + LS + '">Your Name *</label><input type="text" name="name" required placeholder="Your full name" style="' + IS + '"/></div>'
    + '<div style="' + GS + '"><label style="' + LS + '">Your Email *</label><input type="email" name="email" required placeholder="your@email.com" style="' + IS + '"/></div>'
    + '</div></div>'
    + '<div style="background:#fff;border:1px solid var(--border);border-radius:20px;padding:24px;margin-bottom:20px;"><label style="display:flex;align-items:flex-start;gap:12px;cursor:pointer;"><input type="checkbox" name="terms_agreed" value="1" required style="margin-top:2px;accent-color:var(--flame);width:18px;height:18px;flex-shrink:0;"/><span style="font-size:13px;color:var(--ink2);line-height:1.6;">I agree to the Terms and Conditions including the no refund policy.</span></label></div>'
    + '<div style="background:var(--ink);border-radius:20px;padding:36px;margin-bottom:24px;">'
    + '<div style="display:grid;grid-template-columns:1fr auto;gap:24px;align-items:center;">'
    + '<div><h3 style="font-family:\'DM Serif Display\',serif;font-size:26px;font-weight:400;color:#fff;margin-bottom:8px;">Ready to get discovered?</h3><p style="color:rgba(255,255,255,.5);font-size:14px;line-height:1.6;margin-bottom:0;" id="plan-desc-text">' + (plan==='free'?'Free listing — goes live within 24 hours.':plan==='premium'?'Premium — top placement, homepage feature, dedicated newsletter.':'Standard — full SEO, newsletter, featured placement.') + '</p></div>'
    + '<div style="text-align:center;flex-shrink:0;"><div style="font-family:\'DM Serif Display\',serif;font-size:52px;color:#fff;line-height:1;" id="price-display">' + (plan==='free'?'€0':plan==='premium'?'€149':'€79') + '</div><div style="color:rgba(255,255,255,.4);font-size:13px;margin-bottom:16px;" id="price-period">' + (plan==='free'?'free forever':'/year') + '</div><button type="submit" id="submit-btn" style="background:' + (plan==='free'?'#4a7c59':'#e8470a') + ';color:#fff;border:none;padding:16px 36px;border-radius:12px;font-size:16px;font-weight:700;cursor:pointer;font-family:inherit;">' + (plan==='free'?'List for Free →':'Continue to Payment →') + '</button><div style="color:rgba(255,255,255,.3);font-size:12px;margin-top:10px;">' + (plan==='free'?'No credit card required':'🔒 Secure payment via Stripe') + '</div></div>'
    + '</div></div></form></div>'
    + renderFooterSimple()
    + '<script>function selectPlan(plan){["free","standard","premium"].forEach(p=>{document.getElementById("plan-"+p).className="plan-card"+(p===plan?" active-"+p:"");document.getElementById("plan-info-"+p).classList.toggle("visible",p===plan);});document.getElementById("plan-input").value=plan;const prices={free:"€0",standard:"€79",premium:"€149"};const periods={free:"free forever",standard:"/year",premium:"/year"};const btns={free:"List for Free →",standard:"Continue to Payment →",premium:"Continue to Payment →"};const colors={free:"#4a7c59",standard:"#e8470a",premium:"#c9922a"};const descs={free:"Free listing — goes live within 24 hours.",standard:"Standard — full SEO, newsletter, featured placement.",premium:"Premium — top placement, homepage feature, dedicated newsletter."};document.getElementById("price-display").textContent=prices[plan];document.getElementById("price-period").textContent=periods[plan];document.getElementById("submit-btn").textContent=btns[plan];document.getElementById("submit-btn").style.background=colors[plan];document.getElementById("plan-desc-text").textContent=descs[plan];}</script>'
    + '</body></html>';
}

function renderEventDetail(e, related, user) {
  const img  = e.image_url || IMGS[e.category] || IMGS.festival;
  const flag = FLAGS[e.country] || '🌍';
  const icon = CATS[e.category] || '🎪';
  const isFree = e.payment_status === 'free';
  let tags = [];
  try { tags = JSON.parse(e.tags||'[]'); if (typeof tags === 'string') tags = []; } catch(x) { tags = []; }
  const applySection = user
    ? '<div id="apply-section"><button onclick="toggleApply()" class="btn btn-primary" style="width:100%;margin-bottom:8px;">Apply to This Event →</button><div id="apply-form" style="display:none;margin-top:12px;"><textarea id="apply-message" placeholder="Tell the organiser about your business..." rows="4" style="width:100%;background:rgba(255,255,255,.08);border:1.5px solid rgba(255,255,255,.2);border-radius:10px;padding:10px 14px;font-size:13px;color:#fff;outline:none;resize:vertical;font-family:inherit;box-sizing:border-box;margin-bottom:10px;"></textarea><div id="apply-result" style="display:none;margin-bottom:10px;"></div><button onclick="submitApplication(' + e.id + ')" class="btn btn-primary" style="width:100%;background:#4a7c59;">Submit Application →</button></div></div>'
    : '<a href="/auth/login?redirect=/events/' + e.slug + '" class="btn btn-primary" style="display:block;text-align:center;margin-bottom:8px;">Login to Apply →</a><a href="/vendors/register" style="display:block;text-align:center;font-size:13px;color:rgba(255,255,255,.5);margin-top:8px;">Not a vendor yet? Register here →</a>';

  const schemaData = JSON.stringify({
    "@context":"https://schema.org","@type":"Event",
    "name":e.title,"description":(e.description||"").substring(0,500),"image":[img],
    "startDate":e.start_date?e.start_date+"T00:00:00":null,
    "endDate":e.end_date?e.end_date+"T23:59:00":e.start_date+"T23:59:00",
    "eventStatus":"https://schema.org/EventScheduled",
    "eventAttendanceMode":"https://schema.org/OfflineEventAttendanceMode",
    "location":{"@type":"Place","name":e.address||e.city||"TBC","address":{"@type":"PostalAddress","streetAddress":e.address||"","addressLocality":e.city||"","addressCountry":e.country||""}},
    "organizer":{"@type":"Organization","name":e.organiser_name||"Festmore","url":e.website||"https://festmore.com"},
    "offers":{"@type":"Offer","price":"0","priceCurrency":"EUR","url":e.ticket_url||e.website||"https://festmore.com/events/"+e.slug},
    "performer":{"@type":"PerformingGroup","name":e.title},
    "isAccessibleForFree":e.price_display==="Free"||e.price_display==="Free Entry"
  });

  return '<!DOCTYPE html><html lang="en"><head>'
    + '<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/>'
    + '<title>' + e.title + ' ' + new Date(e.start_date).getFullYear() + ' — ' + e.city + ' | Festmore</title>'
    + '<meta name="description" content="' + (e.description||'').substring(0,155) + '"/>'
    + '<meta property="og:title" content="' + e.title + ' — Festmore"/>'
    + '<meta property="og:image" content="' + img + '"/>'
    + '<link rel="canonical" href="https://festmore.com/events/' + e.slug + '"/>'
    + '<script type="application/ld+json">' + schemaData + '</script>'
    + '<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/>'
    + '<link rel="stylesheet" href="/css/main.css"/></head><body>'
    + renderNavSimple(user)
    + '<div class="event-detail-hero" style="background-image:linear-gradient(to right, rgba(26,22,18,0.92) 50%, rgba(26,22,18,0.4)), url(\'' + img + '\');"><div class="container">'
    + '<div class="event-detail-meta"><span class="badge badge-cat">' + icon + ' ' + (CAT_NAMES[e.category]||e.category) + '</span>' + (e.featured?'<span class="badge badge-feat">★ Featured</span>':'') + (e.price_display==='Free'?'<span class="badge badge-free">Free Entry</span>':'') + (isFree?'<span class="badge" style="background:rgba(255,255,255,.2);color:#fff;">Basic Listing</span>':'') + '</div>'
    + '<h1 style="font-family:\'DM Serif Display\',serif;font-size:clamp(28px,5vw,52px);font-weight:400;color:#fff;margin:12px 0;">' + e.title + '</h1>'
    + '<div style="display:flex;gap:20px;flex-wrap:wrap;color:rgba(255,255,255,0.7);font-size:15px;"><span>📍 ' + flag + ' ' + e.city + ', ' + (COUNTRY_NAMES[e.country]||e.country) + '</span><span>📅 ' + (e.date_display||e.start_date) + '</span><span>🎟️ ' + e.price_display + '</span></div>'
    + '</div></div>'
    + '<div class="container" style="padding:40px 0;display:grid;grid-template-columns:1fr 340px;gap:40px;align-items:start;">'
    + '<div>'
    + '<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-2486135003689222" data-ad-format="auto" data-full-width-responsive="true"></ins><script>(adsbygoogle = window.adsbygoogle || []).push({});</script>'
    + '<div class="event-detail-card"><h2 style="font-family:\'DM Serif Display\',serif;font-size:26px;font-weight:400;margin-bottom:16px;">About This Event</h2>'
    + '<div style="font-size:16px;line-height:1.85;color:var(--ink2);">' + (e.description||'No description available.').replace(/\n/g,'<br/>') + '</div>'
    + (tags.length ? '<div style="margin-top:20px;display:flex;gap:8px;flex-wrap:wrap;">' + tags.map(t => '<a href="/events?q=' + encodeURIComponent(t) + '" class="tag">' + t + '</a>').join('') + '</div>' : '')
    + '</div>'
    + (related.length ? '<div style="margin-top:40px;"><h3 style="font-family:\'DM Serif Display\',serif;font-size:22px;font-weight:400;margin-bottom:20px;">Similar Events</h3><div class="events-grid-small">' + related.map(r => eventCardHTMLFull(r)).join('') + '</div></div>' : '')
    + '</div>'
    + '<aside>'
    + '<div class="detail-sidebar-card"><h3 style="font-family:\'DM Serif Display\',serif;font-size:18px;font-weight:400;margin-bottom:16px;border-bottom:2px solid var(--ink);padding-bottom:12px;">Event Details</h3>'
    + '<div class="detail-row"><span class="detail-label">📅 Dates</span><span>' + (e.date_display||e.start_date) + '</span></div>'
    + '<div class="detail-row"><span class="detail-label">📍 Location</span><span>' + e.city + ', ' + (COUNTRY_NAMES[e.country]||e.country) + '</span></div>'
    + (e.address ? '<div class="detail-row"><span class="detail-label">🗺️ Address</span><span>' + e.address + '</span></div>' : '')
    + '<div class="detail-row"><span class="detail-label">🎟️ Entry</span><span style="font-weight:700;color:' + (e.price_display==='Free'?'var(--sage)':'var(--gold)') + ';">' + e.price_display + '</span></div>'
    + '<div class="detail-row"><span class="detail-label">👥 Expected</span><span>' + (e.attendees||0).toLocaleString() + ' visitors</span></div>'
    + (e.vendor_spots ? '<div class="detail-row"><span class="detail-label">🏪 Vendors</span><span>' + e.vendor_spots + ' spots available</span></div>' : '')
    + (e.website ? '<a href="' + e.website + '" target="_blank" rel="nofollow noopener" class="btn btn-primary" style="display:block;text-align:center;margin-top:16px;">Visit Official Website →</a>' : '')
    + (e.ticket_url ? '<a href="' + e.ticket_url + '" target="_blank" rel="nofollow noopener" class="btn btn-outline" style="display:block;text-align:center;margin-top:8px;">Buy Tickets →</a>' : '')
    + '<button onclick="shareEvent()" class="btn btn-ghost" style="width:100%;margin-top:8px;">Share This Event 🔗</button></div>'
    + (isFree ? '<div style="margin-top:16px;background:var(--ivory);border:1px solid var(--border);border-radius:16px;padding:22px;text-align:center;"><div style="font-size:13px;color:var(--ink3);margin-bottom:12px;">Are you the organiser of this event?</div><a href="/events/pricing" class="btn btn-primary btn-sm" style="display:block;">Upgrade for More Visibility →</a></div>' : '')
    + '<ins class="adsbygoogle" style="display:block;margin-top:16px;" data-ad-client="ca-pub-2486135003689222" data-ad-format="auto" data-full-width-responsive="true"></ins><script>(adsbygoogle = window.adsbygoogle || []).push({});</script>'
    + '<div style="margin-top:16px;background:var(--ink);border-radius:16px;padding:24px;color:#fff;"><h4 style="font-family:\'DM Serif Display\',serif;font-size:18px;font-weight:400;margin-bottom:8px;">🏪 Are you a vendor?</h4><p style="font-size:13px;color:rgba(255,255,255,0.6);margin-bottom:16px;">Apply to participate at this event with your vendor profile.</p>' + applySection + '</div>'
    + '</aside></div>'
    + renderFooterSimple()
    + '<script>function toggleApply(){const f=document.getElementById("apply-form");f.style.display=f.style.display==="none"?"block":"none";}async function submitApplication(eventId){const message=document.getElementById("apply-message").value;const result=document.getElementById("apply-result");result.style.display="block";result.innerHTML=\'<div style="font-size:13px;color:rgba(255,255,255,.6);">Submitting...</div>\';const vendorRes=await fetch("/api/my-vendor");const vendorData=await vendorRes.json();if(!vendorData.vendor_id){result.innerHTML=\'<div style="background:rgba(220,38,38,.2);border-radius:8px;padding:10px;font-size:13px;color:#fca5a5;">You need a paid vendor profile to apply. <a href="/vendors/register" style="color:#fff;font-weight:700;">Register here →</a></div>\';return;}const r=await fetch("/applications/apply",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({vendor_id:vendorData.vendor_id,event_id:eventId,message})});const d=await r.json();result.innerHTML=d.ok?\'<div style="background:rgba(74,124,89,.3);border-radius:8px;padding:10px;font-size:13px;color:#86efac;">✅ \'+d.msg+\'</div>\':\'<div style="background:rgba(220,38,38,.2);border-radius:8px;padding:10px;font-size:13px;color:#fca5a5;">❌ \'+d.msg+\'</div>\';}function shareEvent(){if(navigator.share){navigator.share({title:"' + e.title.replace(/"/g,'\\"') + '",url:window.location.href});}else{navigator.clipboard.writeText(window.location.href);alert("Link copied!");}}</script>'
    + '</body></html>';
}

function eventCardHTMLFull(e) {
  const img  = e.image_url || IMGS[e.category] || IMGS.festival;
  const flag = FLAGS[e.country] || '🌍';
  const icon = CATS[e.category] || '🎪';
  const isFree = e.price_display === 'Free';
  const isFreeList = e.payment_status === 'free';
  return '<article class="event-card" itemscope itemtype="https://schema.org/Event"><a href="/events/' + e.slug + '">'
    + '<div class="event-img"><img src="' + img + '" alt="' + e.title + ' — ' + e.city + '" loading="lazy" itemprop="image"/><div class="event-img-overlay"></div>'
    + '<div class="event-badges">' + (e.featured?'<span class="badge badge-feat">★ Featured</span>':'') + '<span class="badge badge-cat">' + icon + ' ' + e.category + '</span>' + (isFree?'<span class="badge badge-free">Free</span>':'') + (isFreeList?'<span class="badge" style="background:rgba(0,0,0,.4);color:#fff;">🔓 Unverified</span>':'<span class="badge" style="background:#4a7c59;color:#fff;">✅ Verified</span>') + '</div></div>'
    + '<div class="event-body"><div class="event-date">' + (e.date_display||e.start_date) + '</div><h3 itemprop="name">' + e.title + '</h3><div class="event-loc">' + flag + ' ' + e.city + '</div>'
    + '<div class="event-footer"><span class="event-stat">👥 ' + (e.attendees||0).toLocaleString() + '</span><span class="event-price ' + (isFree?'price-free':'price-paid') + '">' + e.price_display + '</span></div>'
    + '</div></a></article>';
}

function renderNavSimple(user) {
  return '<nav class="main-nav"><div class="nav-inner">'
    + '<a href="/" class="logo"><span class="logo-fest">Fest</span><span class="logo-more">more</span><span class="logo-dot"></span></a>'
    + '<form class="nav-search" action="/events" method="GET"><span style="color:var(--ink4);font-size:15px;">🔍</span><input type="text" name="q" placeholder="Search events…"/></form>'
    + '<div class="nav-right">' + (user ? '<a href="/dashboard" class="btn btn-outline btn-sm">Dashboard</a><a href="/auth/logout" class="btn btn-ghost btn-sm">Logout</a>' : '<a href="/auth/login" class="btn btn-outline btn-sm">Login</a><a href="/events/submit" class="btn btn-primary btn-sm">+ List Event</a>') + '</div>'
    + '<button class="nav-burger" onclick="document.querySelector(\'.nav-mobile\').classList.toggle(\'open\')">☰</button></div>'
    + '<div class="nav-cats-bar"><a href="/events" class="nav-cat">🌍 All</a><a href="/events?category=festival" class="nav-cat">🎪 Festivals</a><a href="/events?category=market" class="nav-cat">🛍️ Markets</a><a href="/events?category=christmas" class="nav-cat">🎄 Xmas Markets</a><a href="/events?category=concert" class="nav-cat">🎵 Concerts</a><a href="/events?category=city" class="nav-cat">🏙️ City Events</a><a href="/articles" class="nav-cat">📰 Articles</a><a href="/vendors" class="nav-cat">🏪 Vendors</a><a href="/about" class="nav-cat">ℹ️ About</a><a href="/contact" class="nav-cat">✉️ Contact</a></div>'
    + '<div class="nav-mobile"><a href="/events">🌍 All Events</a><a href="/articles">📰 Articles</a><a href="/vendors">🏪 Vendors</a><a href="/events/submit">+ List Event</a>' + (user ? '<a href="/dashboard">Dashboard</a><a href="/auth/logout">Logout</a>' : '<a href="/auth/login">Login</a>') + '</div></nav>';
}

function renderFooterSimple() {
  return '<footer><div class="footer-bottom"><span>© ' + new Date().getFullYear() + ' Festmore.com — All rights reserved</span><div style="display:flex;gap:16px;"><a href="/" style="color:rgba(255,255,255,.35);font-size:13px;">Home</a><a href="/events" style="color:rgba(255,255,255,.35);font-size:13px;">Events</a><a href="/events/pricing" style="color:rgba(255,255,255,.35);font-size:13px;">Pricing</a><a href="/vendors" style="color:rgba(255,255,255,.35);font-size:13px;">Vendors</a><a href="/privacy" style="color:rgba(255,255,255,.35);font-size:13px;">Privacy</a></div></div></footer>';
}
