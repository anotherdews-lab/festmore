// routes/home.js
const express = require('express');
const router  = express.Router();
const db      = require('../db');

router.get('/', (req, res) => {
  // Get featured events
  const featured = db.prepare(`
    SELECT * FROM events
    WHERE status='active' AND featured=1
    ORDER BY views DESC LIMIT 6
  `).all();

  // Get recent events
  const recent = db.prepare(`
    SELECT * FROM events
    WHERE status='active'
    ORDER BY created_at DESC LIMIT 12
  `).all();

  // Get latest articles
  const articles = db.prepare(`
    SELECT id,title,slug,excerpt,image_url,category,created_at
    FROM articles WHERE status='published'
    ORDER BY created_at DESC LIMIT 6
  `).all();

  // Get event counts per country
  const countryCounts = db.prepare(`
    SELECT country, COUNT(*) as count
    FROM events WHERE status='active'
    GROUP BY country ORDER BY count DESC
  `).all();

  // Get category counts
  const catCounts = db.prepare(`
    SELECT category, COUNT(*) as count
    FROM events WHERE status='active'
    GROUP BY category ORDER BY count DESC
  `).all();

  // Total stats
  const stats = {
    events:      db.prepare("SELECT COUNT(*) as n FROM events WHERE status='active'").get().n,
    vendors:     db.prepare("SELECT COUNT(*) as n FROM vendors WHERE status='active'").get().n,
    articles:    db.prepare("SELECT COUNT(*) as n FROM articles WHERE status='published'").get().n,
    subscribers: db.prepare("SELECT COUNT(*) as n FROM subscribers WHERE active=1").get().n,
  };

  res.send(renderHome({ featured, recent, articles, countryCounts, catCounts, stats, user: req.session.user }));
});

// Newsletter signup
router.post('/subscribe', (req, res) => {
  const { email, name, country } = req.body;
  if (!email) return res.json({ ok: false, msg: 'Email required' });
  try {
    db.prepare(`
      INSERT OR IGNORE INTO subscribers (email, name, country)
      VALUES (?, ?, ?)
    `).run(email, name || '', country || '');
    res.json({ ok: true, msg: 'Subscribed! Check your inbox for a welcome email.' });
  } catch {
    res.json({ ok: false, msg: 'Already subscribed!' });
  }
});

module.exports = router;

// ─────────────────────────────────────
// HOME PAGE HTML
// ─────────────────────────────────────
function renderHome({ featured, recent, articles, countryCounts, catCounts, stats, user }) {
  const CATS = {
    festival:'🎪',concert:'🎵',market:'🛍️',christmas:'🎄',
    exhibition:'🖼️',business:'💼',kids:'🎠',comics:'🎮',
    flea:'🏺',online:'💻',city:'🏙️',messe:'🏛️'
  };
  const FLAGS = {
    BE:'🇧🇪',CN:'🇨🇳',DK:'🇩🇰',FR:'🇫🇷',DE:'🇩🇪',
    NL:'🇳🇱',PL:'🇵🇱',SE:'🇸🇪',AE:'🇦🇪',GB:'🇬🇧',US:'🇺🇸'
  };
  const COUNTRY_NAMES = {
    BE:'Belgium',CN:'China',DK:'Denmark',FR:'France',DE:'Germany',
    NL:'Netherlands',PL:'Poland',SE:'Sweden',AE:'UAE',GB:'United Kingdom',US:'USA'
  };
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

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Festmore — World Festival & Event Guide 2025–2026</title>
<meta name="description" content="Discover the best festivals, markets, concerts and Christmas markets worldwide. Browse events in Germany, Denmark, UK, France, USA and more."/>
<meta name="keywords" content="festivals 2025, events near me, christmas markets, music festivals, city events, Germany festivals, UK events, Denmark festivals"/>
<link rel="canonical" href="https://festmore.com/"/>
<meta property="og:title" content="Festmore — World Festival & Event Guide"/>
<meta property="og:description" content="Discover the world's best festivals, markets and events. Updated daily."/>
<meta property="og:image" content="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200&q=80"/>
<meta property="og:url" content="https://festmore.com"/>
<meta name="twitter:card" content="summary_large_image"/>
<script type="application/ld+json">{"@context":"https://schema.org","@type":"WebSite","name":"Festmore","url":"https://festmore.com","potentialAction":{"@type":"SearchAction","target":"https://festmore.com/events?q={search_term_string}","query-input":"required name=search_term_string"}}</script>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2486135003689222" crossorigin="anonymous"></script>
<link rel="stylesheet" href="/css/main.css"/>
</head>
<body>

${renderNav(user)}

<!-- TICKER -->
<div class="ticker-bar">
  <span class="ticker-label">🔥 LIVE</span>
  <div class="ticker-track">
    <span class="ticker-item">🎄 Christmas Markets season opening across Europe — book accommodation now</span>
    <span class="ticker-dot">●</span>
    <span class="ticker-item">🎵 Copenhagen Jazz Festival 2025 — 1,000+ concerts across 130 venues</span>
    <span class="ticker-dot">●</span>
    <span class="ticker-item">🎪 Hamburg Harbour Festival — 250,000 visitors expected this May</span>
    <span class="ticker-dot">●</span>
    <span class="ticker-item">🌍 New events added daily in ${stats.events}+ cities worldwide</span>
    <span class="ticker-dot">●</span>
    <span class="ticker-item">📰 ${stats.articles} festival guides & articles — updated daily by AI</span>
    <span class="ticker-dot">●</span>
    <span class="ticker-item">🎄 Christmas Markets season opening across Europe — book accommodation now</span>
    <span class="ticker-dot">●</span>
    <span class="ticker-item">🎵 Copenhagen Jazz Festival 2025 — 1,000+ concerts across 130 venues</span>
    <span class="ticker-dot">●</span>
  </div>
</div>

<!-- HERO -->
<section class="hero">
  <div class="hero-inner">
    <div class="hero-left">
      <div class="hero-eyebrow"><span class="eyebrow-dot"></span> Updated Daily · 11 Countries · All Events</div>
      <h1>Discover the World's<br/><em>Greatest Events</em></h1>
      <p class="hero-sub">From Berlin Christmas markets to London food markets, Copenhagen jazz to Dubai festivals — Festmore is your global guide to every event worth attending.</p>
      <div class="hero-ctas">
        <a href="/events" class="btn btn-primary btn-lg">Browse Events →</a>
        <a href="/events/submit" class="btn btn-outline-dark btn-lg">List Your Event</a>
      </div>
      <div class="hero-stats">
        <div class="hstat"><span class="hstat-n">${stats.events}+</span><span class="hstat-l">Events</span></div>
        <div class="hstat-div"></div>
        <div class="hstat"><span class="hstat-n">11</span><span class="hstat-l">Countries</span></div>
        <div class="hstat-div"></div>
        <div class="hstat"><span class="hstat-n">${stats.articles}+</span><span class="hstat-l">Articles</span></div>
        <div class="hstat-div"></div>
        <div class="hstat"><span class="hstat-n">${stats.vendors}+</span><span class="hstat-l">Vendors</span></div>
      </div>
    </div>
    <div class="hero-right">
      <div class="hero-img-big"><img src="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=700&q=80" alt="Festival" loading="eager"/><span class="hero-img-label">🎪 Festivals</span></div>
      <div class="hero-imgs-small">
        <div class="hero-img-sm"><img src="https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=400&q=70" alt="Christmas Market" loading="eager"/><span class="hero-img-label">🎄 Christmas Markets</span></div>
        <div class="hero-img-sm"><img src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=70" alt="Markets" loading="eager"/><span class="hero-img-label">🛍️ Markets</span></div>
      </div>
    </div>
  </div>
</section>

<!-- ADSENSE LEADERBOARD -->
<div class="ad-leaderboard"><div class="ad-label-small">Advertisement</div>
<!-- PASTE YOUR ADSENSE CODE HERE -->
<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-2486135003689222" data-ad-format="auto" data-full-width-responsive="true"></ins>
<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
</div>

<!-- CATEGORIES -->
<section class="section">
  <div class="container">
    <div class="section-header">
      <div><h2 class="section-title">Browse by Category</h2><p class="section-sub">Find exactly the type of event you love</p></div>
    </div>
    <div class="cats-grid">
      ${Object.entries(CATS).map(([k,icon])=>{
        const count = (catCounts.find(c=>c.category===k)||{count:0}).count;
        const labels = {festival:'Festivals',concert:'Concerts',market:'Markets',christmas:'Xmas Markets',exhibition:'Exhibitions',business:'Business',kids:'Kids Events',comics:'Comics & Gaming',flea:'Flea Markets',online:'Online Events',city:'City Events',messe:'Trade Fairs'};
        return `<a href="/events?category=${k}" class="cat-card">
          <span class="cat-icon">${icon}</span>
          <span class="cat-name">${labels[k]}</span>
          <span class="cat-count">${count} events</span>
        </a>`;
      }).join('')}
    </div>
  </div>
</section>

<!-- FEATURED EVENTS -->
${featured.length ? `
<section class="section section-dark">
  <div class="container">
    <div class="section-header section-header-light">
      <div><h2 class="section-title light">Featured Events</h2><p class="section-sub light">Hand-picked events you can't miss</p></div>
      <a href="/events?featured=1" class="section-link light">View all →</a>
    </div>
    <div class="events-grid">
      ${featured.map(e => eventCardHTML(e, IMGS, FLAGS, CATS)).join('')}
    </div>
  </div>
</section>` : ''}

<!-- COUNTRIES -->
<section class="section">
  <div class="container">
    <div class="section-header">
      <div><h2 class="section-title">Browse by Country</h2><p class="section-sub">Events in 11 countries and growing</p></div>
    </div>
    <div class="countries-grid">
      ${countryCounts.map(c => `
        <a href="/events?country=${c.country}" class="country-card">
          <span class="country-flag">${FLAGS[c.country]||'🌍'}</span>
          <span class="country-name">${COUNTRY_NAMES[c.country]||c.country}</span>
          <span class="country-count">${c.count} events</span>
        </a>`).join('')}
    </div>
  </div>
</section>

<!-- MID ADSENSE -->
<div class="ad-leaderboard"><div class="ad-label-small">Advertisement</div>
<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-2486135003689222" data-ad-format="auto" data-full-width-responsive="true"></ins>
<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
```

Then in VS Code terminal:
```
cd ~/Desktop/festmore-2
git add .
git commit -m "add adsense ads"
git push
</div>

<!-- LATEST ARTICLES -->
${articles.length ? `
<section class="section">
  <div class="container">
    <div class="section-header">
      <div><h2 class="section-title">Festival Guides & News</h2><p class="section-sub">10 new articles written by AI every single day</p></div>
      <a href="/articles" class="section-link">All articles →</a>
    </div>
    <div class="articles-grid">
      ${articles.map(a => `
        <a href="/articles/${a.slug}" class="article-card">
          <div class="article-img"><img src="${a.image_url||'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&q=70'}" alt="${a.title}" loading="lazy"/></div>
          <div class="article-body">
            <div class="article-cat">${CATS[a.category]||'📰'} ${a.category||'Festival Guide'}</div>
            <h3>${a.title}</h3>
            <p>${a.excerpt||''}</p>
            <span class="article-date">${new Date(a.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</span>
          </div>
        </a>`).join('')}
    </div>
  </div>
</section>` : ''}

<!-- LIST YOUR EVENT CTA -->
<section class="cta-section">
  <div class="container">
    <div class="cta-inner">
      <div class="cta-left">
        <h2>Are you an Event Organiser?</h2>
        <p>List your festival, market, concert or event on Festmore and reach thousands of visitors worldwide. Basic listings just €79/year.</p>
        <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:24px;">
          <a href="/events/submit" class="btn btn-primary btn-lg">List Your Event — €79/yr →</a>
          <a href="/vendors/register" class="btn btn-outline btn-lg">Join as Vendor — €49/yr</a>
        </div>
      </div>
      <div class="cta-right">
        <div class="cta-stat"><span>✅</span> Your event live within 24 hours</div>
        <div class="cta-stat"><span>🌍</span> Seen by visitors in 11 countries</div>
        <div class="cta-stat"><span>📧</span> Newsletter to ${stats.subscribers}+ subscribers</div>
        <div class="cta-stat"><span>🔍</span> SEO-optimised listing page</div>
        <div class="cta-stat"><span>🏪</span> Connect with verified vendors</div>
      </div>
    </div>
  </div>
</section>

<!-- NEWSLETTER -->
<section class="section section-warm">
  <div class="container">
    <div class="newsletter-box">
      <div class="newsletter-left">
        <h2>📬 Never Miss an Event</h2>
        <p>Get the best festivals and events delivered to your inbox every week. ${stats.subscribers.toLocaleString()} subscribers already signed up.</p>
      </div>
      <form class="newsletter-form" id="newsletter-form">
        <input type="email" name="email" placeholder="Your email address" required class="nl-input"/>
        <select name="country" class="nl-input" style="max-width:180px;">
          <option value="">Favourite country</option>
          ${Object.entries(COUNTRY_NAMES).map(([k,v])=>`<option value="${k}">${FLAGS[k]} ${v}</option>`).join('')}
        </select>
        <button type="submit" class="btn btn-primary">Subscribe Free</button>
      </form>
    </div>
  </div>
</section>

<!-- RECENT EVENTS -->
<section class="section">
  <div class="container">
    <div class="section-header">
      <div><h2 class="section-title">Recently Added Events</h2><p class="section-sub">New events added daily across all countries</p></div>
      <a href="/events" class="section-link">View all ${stats.events}+ events →</a>
    </div>
    <div class="events-grid">
      ${recent.slice(0,6).map(e => eventCardHTML(e, IMGS, FLAGS, CATS)).join('')}
    </div>
  </div>
</section>

${renderFooter(stats)}

<script src="/js/main.js"></script>
<script>
// Newsletter form
document.getElementById('newsletter-form')?.addEventListener('submit', async e => {
  e.preventDefault();
  const data = new FormData(e.target);
  const res = await fetch('/subscribe', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(Object.fromEntries(data)) });
  const json = await res.json();
  alert(json.msg);
  if (json.ok) e.target.reset();
});
</script>
</body></html>`;
}

function eventCardHTML(e, IMGS, FLAGS, CATS) {
  const img = IMGS[e.category] || IMGS.festival;
  const flag = FLAGS[e.country] || '🌍';
  const icon = CATS[e.category] || '🎪';
  const isFree = e.price_display === 'Free';
  return `
<article class="event-card" itemscope itemtype="https://schema.org/Event">
  <a href="/events/${e.slug}">
    <div class="event-img">
      <img src="${img}" alt="${e.title}" loading="lazy" itemprop="image"/>
      <div class="event-img-overlay"></div>
      <div class="event-badges">
        ${e.featured ? '<span class="badge badge-feat">★ Featured</span>' : ''}
        <span class="badge badge-cat">${icon} ${e.category}</span>
        ${isFree ? '<span class="badge badge-free">Free</span>' : ''}
      </div>
    </div>
    <div class="event-body">
      <div class="event-date" itemprop="startDate">${e.date_display || e.start_date}</div>
      <h3 itemprop="name">${e.title}</h3>
      <div class="event-loc" itemprop="location">${flag} ${e.city}</div>
      <div class="event-footer">
        <div class="event-stats">
          <span>👥 ${(e.attendees||0).toLocaleString()}</span>
          <span>🏪 ${e.vendor_spots||0} spots</span>
        </div>
        <span class="event-price ${isFree?'price-free':'price-paid'}">${e.price_display}</span>
      </div>
    </div>
  </a>
</article>`;
}

function renderNav(user) {
  return `<nav class="main-nav">
  <div class="nav-inner">
    <a href="/" class="logo"><span class="logo-fest">Fest</span><span class="logo-more">more</span><span class="logo-dot"></span></a>
    <form class="nav-search" action="/events" method="GET">
      <span>🔍</span>
      <input type="text" name="q" placeholder="Search events, cities, countries…"/>
    </form>
    <div class="nav-right">
      ${user ? `
        <a href="/dashboard" class="btn btn-outline">Dashboard</a>
        <a href="/auth/logout" class="btn btn-ghost">Logout</a>
      ` : `
        <a href="/auth/login" class="btn btn-outline">Login</a>
        <a href="/events/submit" class="btn btn-primary">+ List Event</a>
      `}
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
    <a href="/events?category=business" class="nav-cat">💼 Business</a>
    <a href="/events?category=kids" class="nav-cat">🎠 Kids</a>
    <a href="/events?category=flea" class="nav-cat">🏺 Flea Markets</a>
    <a href="/events?category=messe" class="nav-cat">🏛️ Trade Fairs</a>
    <a href="/articles" class="nav-cat">📰 Articles</a>
    <a href="/vendors" class="nav-cat">🏪 Vendors</a>
  </div>
  <div class="nav-mobile">
    <a href="/events">🌍 All Events</a>
    <a href="/articles">📰 Articles & News</a>
    <a href="/vendors">🏪 Vendors</a>
    <a href="/events/submit">+ List Your Event</a>
    ${user ? `<a href="/dashboard">Dashboard</a><a href="/auth/logout">Logout</a>` : `<a href="/auth/login">Login</a><a href="/auth/register">Register</a>`}
  </div>
</nav>`;
}

function renderFooter(stats) {
  return `<footer>
  <div class="footer-top">
    <div class="footer-brand">
      <div class="logo" style="margin-bottom:12px;"><span class="logo-fest" style="color:#fff;">Fest</span><span class="logo-more">more</span></div>
      <p>Your global guide to festivals, markets, concerts and events. Covering 11 countries worldwide. New events added every day.</p>
      <div class="footer-social">
        <a href="#" class="social-icon">f</a>
        <a href="#" class="social-icon">📷</a>
        <a href="#" class="social-icon">𝕏</a>
      </div>
    </div>
    <div class="footer-col">
      <h4>Events</h4>
      <a href="/events?category=festival">Festivals</a>
      <a href="/events?category=market">Markets</a>
      <a href="/events?category=christmas">Christmas Markets</a>
      <a href="/events?category=concert">Concerts</a>
      <a href="/events?category=city">City Events</a>
      <a href="/events?category=kids">Kids Events</a>
    </div>
    <div class="footer-col">
      <h4>Countries</h4>
      <a href="/events?country=DE">🇩🇪 Germany</a>
      <a href="/events?country=DK">🇩🇰 Denmark</a>
      <a href="/events?country=GB">🇬🇧 United Kingdom</a>
      <a href="/events?country=FR">🇫🇷 France</a>
      <a href="/events?country=US">🇺🇸 USA</a>
      <a href="/events?country=AE">🇦🇪 UAE</a>
    </div>
    <div class="footer-col">
      <h4>Festmore</h4>
      <a href="/about">About Us</a>
      <a href="/events/submit">Submit Event</a>
      <a href="/vendors/register">Become a Vendor</a>
      <a href="/articles">Festival Guides</a>
      <a href="/contact">Contact</a>
      <a href="/privacy">Privacy Policy</a>
    </div>
  </div>
  <div class="footer-bottom">
    <span>© 2025 Festmore.com — All rights reserved</span>
    <span>${stats.events}+ events · ${stats.articles}+ articles · ${stats.vendors}+ vendors</span>
  </div>
</footer>`;
}
