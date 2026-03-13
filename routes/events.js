// routes/events.js
const express = require('express');
const router  = express.Router();
const db      = require('../db');
const stripe  = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

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
// SUBMIT EVENT FORM
// ─────────────────────────────────────
router.get('/submit', (req, res) => {
  res.send(renderSubmitPage(req.session.user, req.query.success, req.query.error));
});

router.post('/submit', async (req, res) => {
  const { title, category, city, country, start_date, end_date, date_display, description, price_display, website, ticket_url, attendees, vendor_spots, address, tags, name, email } = req.body;

  if (!title || !category || !city || !country || !start_date) {
    return res.redirect('/events/submit?error=Please fill in all required fields');
  }

  // Create slug
  const slugify = require('slugify');
  const baseSlug = slugify(title + '-' + city + '-' + new Date(start_date).getFullYear(), { lower: true, strict: true });
  let slug = baseSlug;
  let i = 1;
  while (db.prepare('SELECT id FROM events WHERE slug=?').get(slug)) {
    slug = `${baseSlug}-${i++}`;
  }

  // Save event as pending (needs payment to go live)
  const result = db.prepare(`
    INSERT INTO events (title,slug,category,city,country,start_date,end_date,date_display,description,price_display,website,ticket_url,attendees,vendor_spots,address,tags,status,payment_status,source)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'pending','unpaid','manual')
  `).run(title,slug,category,city,country,start_date,end_date||'',date_display||'',description||'',price_display||'Free',website||'',ticket_url||'',parseInt(attendees)||0,parseInt(vendor_spots)||0,address||'',tags||'[]');

  const eventId = result.lastInsertRowid;

  // Create Stripe checkout session
  try {
    const safeTitle = title.replace(/[^\x00-\x7F]/g, '');
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: `Festmore Event Listing - ${safeTitle}`,
            description: `Annual listing on Festmore.com. Your event will be live within 24 hours.`,
          },
          unit_amount: parseInt(process.env.PRICE_EVENT_YEARLY) || 7900,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `https://festmore.com/events/payment-success?session_id={CHECKOUT_SESSION_ID}&event_id=${eventId}`,
      cancel_url: `https://festmore.com/events/submit?error=Payment+cancelled`,
      metadata: { event_id: String(eventId), type: 'event_listing', email: email || '' },
      customer_email: email || undefined,
    });

    // Save payment record
    db.prepare(`INSERT INTO payments (stripe_session_id,amount,type,status,reference_id) VALUES (?,?,?,?,?)`)
      .run(session.id, 7900, 'event_listing', 'pending', eventId);

    res.redirect(session.url);
  } catch (err) {
    console.error('Stripe error:', err.message);
    res.redirect(`/events/submit?error=Payment system temporarily unavailable. We saved your event — please contact us to complete listing.`);
  }
});

// Payment success
router.get('/payment-success', (req, res) => {
  const { event_id } = req.query;
  if (event_id) {
    db.prepare("UPDATE events SET payment_status='paid', status='active' WHERE id=?").run(parseInt(event_id));
    db.prepare("UPDATE payments SET status='completed' WHERE reference_id=?").run(parseInt(event_id));
  }
  const event = event_id ? db.prepare("SELECT * FROM events WHERE id=?").get(parseInt(event_id)) : null;
  res.send(`<!DOCTYPE html><html><head><title>Payment Successful — Festmore</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Plus+Jakarta+Sans:wght@400;600&display=swap" rel="stylesheet"/>
  <link rel="stylesheet" href="/css/main.css"/></head><body>
  ${require('./home').renderNavExport ? '' : ''}
  <div style="max-width:600px;margin:80px auto;padding:0 24px;text-align:center;">
    <div style="font-size:64px;margin-bottom:16px;">🎉</div>
    <h1 style="font-family:'Playfair Display',serif;font-size:36px;margin-bottom:12px;">Payment Successful!</h1>
    <p style="color:#7a6f68;font-size:16px;line-height:1.7;margin-bottom:28px;">
      Your event <strong>${event ? event.title : ''}</strong> is now live on Festmore!<br/>
      It will appear in search results within minutes.
    </p>
    <a href="/events/${event ? event.slug : ''}" style="background:#e8470a;color:#fff;padding:14px 32px;border-radius:99px;text-decoration:none;font-weight:700;font-size:15px;">View Your Event →</a>
    <br/><br/><a href="/" style="color:#7a6f68;font-size:14px;">Back to Home</a>
  </div></body></html>`);
});

// ─────────────────────────────────────
// EVENT DETAIL PAGE
// ─────────────────────────────────────
router.get('/:slug', (req, res) => {
  const event = db.prepare("SELECT * FROM events WHERE slug=? AND status='active'").get(req.params.slug);
  if (!event) return res.status(404).redirect('/events?error=Event not found');

  // Increment view count
  db.prepare("UPDATE events SET views=views+1 WHERE id=?").run(event.id);

  // Related events
  const related = db.prepare(`
    SELECT * FROM events WHERE status='active' AND category=? AND id!=? ORDER BY featured DESC, views DESC LIMIT 4
  `).all(event.category, event.id);

  res.send(renderEventDetail(event, related, req.session.user));
});

module.exports = router;

// ─────────────────────────────────────
// RENDER FUNCTIONS
// ─────────────────────────────────────
function renderEventsPage({ events, total, totalPages, page, q, country, category, price, sort, user }) {
  const params = new URLSearchParams({ q, country, category, price, sort });

  return `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>${category!=='ALL'?CAT_NAMES[category]+' — ':''}${country!=='ALL'?COUNTRY_NAMES[country]+' ':''}Events ${new Date().getFullYear()} | Festmore</title>
<meta name="description" content="Browse ${total}+ ${category!=='ALL'?CAT_NAMES[category]:''} events${country!=='ALL'?' in '+COUNTRY_NAMES[country]:'worldwide'}. Free and paid events, festivals, markets and more on Festmore."/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
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
  <!-- FILTERS -->
  <form class="filter-bar" method="GET" action="/events">
    <div class="filter-group">
      <label class="filter-label">Search</label>
      <input class="filter-input" type="text" name="q" value="${q}" placeholder="Event name, city…"/>
    </div>
    <div class="filter-group">
      <label class="filter-label">Country</label>
      <select class="filter-select" name="country">
        <option value="ALL" ${country==='ALL'?'selected':''}>All Countries</option>
        ${Object.entries(COUNTRY_NAMES).map(([k,v])=>`<option value="${k}" ${country===k?'selected':''}>${FLAGS[k]} ${v}</option>`).join('')}
      </select>
    </div>
    <div class="filter-group">
      <label class="filter-label">Category</label>
      <select class="filter-select" name="category">
        <option value="ALL" ${category==='ALL'?'selected':''}>All Types</option>
        ${Object.entries(CAT_NAMES).map(([k,v])=>`<option value="${k}" ${category===k?'selected':''}>${CATS[k]} ${v}</option>`).join('')}
      </select>
    </div>
    <div class="filter-group">
      <label class="filter-label">Price</label>
      <select class="filter-select" name="price">
        <option value="ALL" ${price==='ALL'?'selected':''}>Any Price</option>
        <option value="free" ${price==='free'?'selected':''}>Free Only</option>
        <option value="paid" ${price==='paid'?'selected':''}>Paid Events</option>
      </select>
    </div>
    <div class="filter-group">
      <label class="filter-label">Sort By</label>
      <select class="filter-select" name="sort">
        <option value="featured" ${sort==='featured'?'selected':''}>Featured</option>
        <option value="date" ${sort==='date'?'selected':''}>Soonest</option>
        <option value="visitors" ${sort==='visitors'?'selected':''}>Most Popular</option>
      </select>
    </div>
    <button type="submit" class="btn btn-primary filter-btn">Filter</button>
  </form>

  <!-- AD -->
  <ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-2486135003689222" data-ad-format="auto" data-full-width-responsive="true"></ins><script>(adsbygoogle = window.adsbygoogle || []).push({});</script>

  <!-- RESULTS -->
  ${events.length === 0 ? `
    <div class="empty-state">
      <div style="font-size:48px;margin-bottom:16px;">🔍</div>
      <h2>No events found</h2>
      <p>Try different filters or <a href="/events">clear all filters</a></p>
    </div>` : `
    <div class="events-grid" style="margin-bottom:40px;">
      ${events.map(e => eventCardHTMLFull(e)).join('')}
    </div>
  `}

  <!-- PAGINATION -->
  ${totalPages > 1 ? `<div class="pagination">
    ${page > 1 ? `<a href="/events?${new URLSearchParams({...Object.fromEntries(params),page:page-1})}" class="page-btn">‹ Prev</a>` : ''}
    ${Array.from({length:Math.min(totalPages,7)},(_,i)=>i+1).map(p=>`<a href="/events?${new URLSearchParams({...Object.fromEntries(params),page:p})}" class="page-btn ${p===page?'active':''}">${p}</a>`).join('')}
    ${page < totalPages ? `<a href="/events?${new URLSearchParams({...Object.fromEntries(params),page:page+1})}" class="page-btn">Next ›</a>` : ''}
  </div>` : ''}
</div>
${renderFooterSimple()}</body></html>`;
}

function renderEventDetail(e, related, user) {
  const img = IMGS[e.category] || IMGS.festival;
  const flag = FLAGS[e.country] || '🌍';
  const icon = CATS[e.category] || '🎪';
  const tags = JSON.parse(e.tags||'[]');

  return `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>${e.title} ${new Date(e.start_date).getFullYear()} — ${e.city} | Festmore</title>
<meta name="description" content="${e.short_desc || (e.description||'').substring(0,155)}"/>
<meta property="og:title" content="${e.title} — Festmore"/>
<meta property="og:description" content="${(e.description||'').substring(0,200)}"/>
<meta property="og:image" content="${img}"/>
<script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@type":"Event","name":e.title,"startDate":e.start_date,"endDate":e.end_date||e.start_date,"location":{"@type":"Place","name":e.city,"address":{"@type":"PostalAddress","addressLocality":e.city,"addressCountry":e.country}},"description":e.description||"","image":img,"isAccessibleForFree":e.price_display==="Free","offers":{"@type":"Offer","price":e.price_from||0,"priceCurrency":"EUR"}})}</script>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;0,900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="/css/main.css"/>
</head><body>
${renderNavSimple(user)}
<div class="event-detail-hero" style="background-image:linear-gradient(to right, rgba(26,22,18,0.92) 50%, rgba(26,22,18,0.4)), url('${img}');">
  <div class="container">
    <div class="event-detail-meta">
      <span class="badge badge-cat" style="font-size:13px;padding:5px 14px;">${icon} ${CAT_NAMES[e.category]||e.category}</span>
      ${e.featured ? '<span class="badge badge-feat" style="font-size:13px;padding:5px 14px;">★ Featured</span>' : ''}
      ${e.price_display==='Free'?'<span class="badge badge-free" style="font-size:13px;padding:5px 14px;">Free Entry</span>':''}
    </div>
    <h1 style="font-size:clamp(28px,5vw,52px);font-weight:900;color:#fff;margin:12px 0;">${e.title}</h1>
    <div style="display:flex;gap:20px;flex-wrap:wrap;color:rgba(255,255,255,0.7);font-size:15px;">
      <span>📍 ${flag} ${e.city}, ${COUNTRY_NAMES[e.country]||e.country}</span>
      <span>📅 ${e.date_display||e.start_date}</span>
      <span>🎟️ ${e.price_display}</span>
    </div>
  </div>
</div>
<div class="container" style="padding:40px 0;display:grid;grid-template-columns:1fr 340px;gap:40px;align-items:start;">
  <div>
    <ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-2486135003689222" data-ad-format="auto" data-full-width-responsive="true"></ins><script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
    <div class="event-detail-card">
      <h2 style="font-family:'Playfair Display',serif;font-size:24px;margin-bottom:16px;">About This Event</h2>
      <p style="font-size:16px;line-height:1.8;color:#3d3530;">${(e.description||'No description available.').replace(/\n/g,'<br/>')}</p>
      ${tags.length ? `<div style="margin-top:20px;display:flex;gap:8px;flex-wrap:wrap;">${tags.map(t=>`<a href="/events?q=${encodeURIComponent(t)}" class="tag">${t}</a>`).join('')}</div>` : ''}
    </div>
    ${related.length ? `
    <div style="margin-top:40px;">
      <h3 style="font-family:'Playfair Display',serif;font-size:22px;margin-bottom:20px;">Similar Events</h3>
      <div class="events-grid-small">${related.map(r=>eventCardHTMLFull(r)).join('')}</div>
    </div>` : ''}
  </div>
  <aside>
    <div class="detail-sidebar-card">
      <h3 style="font-family:'Playfair Display',serif;font-size:18px;margin-bottom:16px;border-bottom:2px solid #1a1612;padding-bottom:12px;">Event Details</h3>
      <div class="detail-row"><span class="detail-label">📅 Dates</span><span>${e.date_display||e.start_date}</span></div>
      <div class="detail-row"><span class="detail-label">📍 Location</span><span>${e.city}, ${COUNTRY_NAMES[e.country]||e.country}</span></div>
      ${e.address?`<div class="detail-row"><span class="detail-label">🗺️ Address</span><span>${e.address}</span></div>`:''}
      <div class="detail-row"><span class="detail-label">🎟️ Entry</span><span style="font-weight:700;color:${e.price_display==='Free'?'#4a7c59':'#c9922a'}">${e.price_display}</span></div>
      <div class="detail-row"><span class="detail-label">👥 Expected</span><span>${(e.attendees||0).toLocaleString()} visitors</span></div>
      <div class="detail-row"><span class="detail-label">🏪 Vendors</span><span>${e.vendor_spots||0} spots available</span></div>
      ${e.website?`<a href="${e.website}" target="_blank" rel="nofollow noopener" class="btn btn-primary" style="display:block;text-align:center;margin-top:16px;">Visit Official Website →</a>`:''}
      ${e.ticket_url?`<a href="${e.ticket_url}" target="_blank" rel="nofollow noopener" class="btn btn-outline" style="display:block;text-align:center;margin-top:8px;">Buy Tickets →</a>`:''}
      <button onclick="shareEvent()" class="btn btn-ghost" style="width:100%;margin-top:8px;">Share This Event 🔗</button>
    </div>
    <ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-2486135003689222" data-ad-format="auto" data-full-width-responsive="true"></ins><script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
    <div style="margin-top:20px;background:#1a1612;border-radius:16px;padding:24px;color:#fff;">
      <h4 style="font-family:'Playfair Display',serif;margin-bottom:8px;">Are you a vendor?</h4>
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
    alert('Link copied to clipboard!');
  }
}
</script>
</body></html>`;
}

function renderSubmitPage(user, success, error) {
  return `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Submit Your Event — Festmore</title>
<meta name="description" content="List your festival, market, concert or event on Festmore and reach thousands of visitors worldwide."/>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;0,900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="/css/main.css"/>
</head><body>
${renderNavSimple(user)}
<div class="page-hero-small" style="background:linear-gradient(135deg,#e8470a,#c2410c);">
  <div class="container">
    <h1 style="color:#fff;">🎪 List Your Event on Festmore</h1>
    <p style="color:rgba(255,255,255,0.8);">Reach thousands of visitors worldwide for just €79/year</p>
  </div>
</div>
<div class="container" style="padding:40px 0;max-width:760px;">
  ${error ? `<div class="alert alert-error">⚠️ ${error}</div>` : ''}
  ${success ? `<div class="alert alert-success">✅ ${success}</div>` : ''}

  <div class="submit-benefits">
    ${['Your event live within 24 hours','Seen by visitors in 11 countries','SEO-optimised listing with your own URL','Listed in weekly newsletter to 1,000+ subscribers','Connect with professional vendors','Annual listing — renews each year'].map(b=>`<div class="benefit-item">✅ ${b}</div>`).join('')}
  </div>

  <div class="form-card">
    <div class="form-card-header">
      <h2>Event Details</h2>
      <div class="price-badge">€79 / year</div>
    </div>
    <form method="POST" action="/events/submit">
      <div class="form-grid">
        <div class="form-group full">
          <label class="form-label">Event Name *</label>
          <input class="form-input" type="text" name="title" placeholder="e.g. Berlin Christmas Market 2025" required/>
        </div>
        <div class="form-group">
          <label class="form-label">Category *</label>
          <select class="form-input" name="category" required>
            <option value="">Select category…</option>
            ${Object.entries({festival:'🎪 Festival',concert:'🎵 Concert',market:'🛍️ Market',christmas:'🎄 Christmas Market',exhibition:'🖼️ Exhibition',business:'💼 Business / Fair',kids:'🎠 Kids Event',comics:'🎮 Comics & Gaming',flea:'🏺 Flea Market',online:'💻 Online Event',city:'🏙️ City Event',messe:'🏛️ Trade Fair / Messe'}).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Country *</label>
          <select class="form-input" name="country" required>
            <option value="">Select country…</option>
            ${Object.entries(COUNTRY_NAMES).map(([k,v])=>`<option value="${k}">${FLAGS[k]} ${v}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">City *</label>
          <input class="form-input" type="text" name="city" placeholder="e.g. Berlin" required/>
        </div>
        <div class="form-group">
          <label class="form-label">Address / Venue</label>
          <input class="form-input" type="text" name="address" placeholder="e.g. Gendarmenmarkt Square"/>
        </div>
        <div class="form-group">
          <label class="form-label">Start Date *</label>
          <input class="form-input" type="date" name="start_date" required/>
        </div>
        <div class="form-group">
          <label class="form-label">End Date</label>
          <input class="form-input" type="date" name="end_date"/>
        </div>
        <div class="form-group full">
          <label class="form-label">Dates as Displayed (e.g. "Nov 27 – Dec 24, 2025")</label>
          <input class="form-input" type="text" name="date_display" placeholder="Nov 27 – Dec 24, 2025"/>
        </div>
        <div class="form-group">
          <label class="form-label">Entry Price</label>
          <input class="form-input" type="text" name="price_display" placeholder="Free, €12, €8–€45…"/>
        </div>
        <div class="form-group">
          <label class="form-label">Expected Visitors</label>
          <input class="form-input" type="number" name="attendees" placeholder="e.g. 5000"/>
        </div>
        <div class="form-group">
          <label class="form-label">Vendor Spots Available</label>
          <input class="form-input" type="number" name="vendor_spots" placeholder="e.g. 50"/>
        </div>
        <div class="form-group">
          <label class="form-label">Event Website</label>
          <input class="form-input" type="url" name="website" placeholder="https://your-event.com"/>
        </div>
        <div class="form-group full">
          <label class="form-label">Event Description *</label>
          <textarea class="form-input" name="description" rows="5" placeholder="Describe your event. What makes it special? What can visitors expect? (at least 100 words for best SEO)"></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Your Name</label>
          <input class="form-input" type="text" name="name" placeholder="Your full name"/>
        </div>
        <div class="form-group">
          <label class="form-label">Your Email</label>
          <input class="form-input" type="email" name="email" placeholder="your@email.com"/>
        </div>
      </div>
      <div class="form-submit-area">
        <div class="price-summary">
          <strong>Annual Listing: €79/year</strong>
          <span>Secure payment via Stripe · Cancel anytime</span>
        </div>
        <button type="submit" class="btn btn-primary btn-xl">Continue to Payment →</button>
      </div>
    </form>
  </div>
</div>
${renderFooterSimple()}</body></html>`;
}

function eventCardHTMLFull(e) {
  const img = IMGS[e.category] || IMGS.festival;
  const flag = FLAGS[e.country] || '🌍';
  const icon = CATS[e.category] || '🎪';
  const isFree = e.price_display === 'Free';
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
    <a href="/" class="logo"><img src="/logo.png" alt="Festmore" style="height:48px;width:auto;"/></a>
    <form class="nav-search" action="/events" method="GET">
      <span>🔍</span><input type="text" name="q" placeholder="Search events…"/>
    </form>
    <div class="nav-right">
      ${user ? `<a href="/dashboard" class="btn btn-outline">Dashboard</a><a href="/auth/logout" class="btn btn-ghost">Logout</a>` : `<a href="/auth/login" class="btn btn-outline">Login</a><a href="/events/submit" class="btn btn-primary">+ List Event</a>`}
    </div>
    <button class="nav-burger" onclick="document.querySelector('.nav-mobile').classList.toggle('open')">☰</button>
  </div>
  <div class="nav-cats-bar">
    <a href="/events" class="nav-cat">🌍 All</a>
    <a href="/events?category=festival" class="nav-cat">🎪 Festivals</a>
    <a href="/events?category=market" class="nav-cat">🛍️ Markets</a>
    <a href="/events?category=christmas" class="nav-cat">🎄 Xmas</a>
    <a href="/events?category=concert" class="nav-cat">🎵 Concerts</a>
    <a href="/events?category=city" class="nav-cat">🏙️ City</a>
    <a href="/articles" class="nav-cat">📰 Articles</a>
    <a href="/vendors" class="nav-cat">🏪 Vendors</a>
  </div>
  <div class="nav-mobile">
    <a href="/events">Events</a><a href="/articles">Articles</a>
    <a href="/vendors">Vendors</a><a href="/events/submit">+ List Event</a>
    ${user ? `<a href="/dashboard">Dashboard</a><a href="/auth/logout">Logout</a>` : `<a href="/auth/login">Login</a>`}
  </div>
</nav>`;
}

function renderFooterSimple() {
  return `<footer><div class="footer-bottom" style="border-top:1px solid rgba(255,255,255,0.08);">
  <span>© 2025 Festmore.com — All rights reserved</span>
  <div style="display:flex;gap:16px;">
    <a href="/" style="color:rgba(255,255,255,0.4);font-size:13px;">Home</a>
    <a href="/events" style="color:rgba(255,255,255,0.4);font-size:13px;">Events</a>
    <a href="/articles" style="color:rgba(255,255,255,0.4);font-size:13px;">Articles</a>
    <a href="/privacy" style="color:rgba(255,255,255,0.4);font-size:13px;">Privacy</a>
  </div>
</div></footer>`;
}
