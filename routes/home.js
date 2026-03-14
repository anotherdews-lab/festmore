// routes/home.js — COMPLETE FIXED VERSION
const express = require('express');
const router  = express.Router();
const db      = require('../db');

router.get('/', (req, res) => {
  const featured = db.prepare(`SELECT * FROM events WHERE status='active' AND featured=1 ORDER BY views DESC LIMIT 6`).all();
  const recent   = db.prepare(`SELECT * FROM events WHERE status='active' ORDER BY created_at DESC LIMIT 12`).all();
  const articles = db.prepare(`SELECT id,title,slug,excerpt,image_url,category,created_at FROM articles WHERE status='published' ORDER BY created_at DESC LIMIT 6`).all();
  const countryCounts = db.prepare(`SELECT country, COUNT(*) as count FROM events WHERE status='active' GROUP BY country ORDER BY count DESC`).all();
  const catCounts     = db.prepare(`SELECT category, COUNT(*) as count FROM events WHERE status='active' GROUP BY category ORDER BY count DESC`).all();
  const stats = {
    events:      db.prepare("SELECT COUNT(*) as n FROM events WHERE status='active'").get().n,
    vendors:     db.prepare("SELECT COUNT(*) as n FROM vendors WHERE status='active'").get().n,
    articles:    db.prepare("SELECT COUNT(*) as n FROM articles WHERE status='published'").get().n,
    subscribers: db.prepare("SELECT COUNT(*) as n FROM subscribers WHERE active=1").get().n,
  };
  res.send(renderHome({ featured, recent, articles, countryCounts, catCounts, stats, user: req.session.user }));
});

router.post('/subscribe', (req, res) => {
  const { email, name, country } = req.body;
  if (!email) return res.json({ ok: false, msg: 'Email required' });
  try {
    db.prepare(`INSERT OR IGNORE INTO subscribers (email, name, country) VALUES (?, ?, ?)`).run(email, name || '', country || '');
    res.json({ ok: true, msg: 'Subscribed! Welcome to Festmore.' });
  } catch {
    res.json({ ok: false, msg: 'Already subscribed!' });
  }
});

module.exports = router;

const CATS = { festival:'🎪',concert:'🎵',market:'🛍️',christmas:'🎄',exhibition:'🖼️',business:'💼',kids:'🎠',comics:'🎮',flea:'🏺',online:'💻',city:'🏙️',messe:'🏛️' };
const CAT_LABELS = { festival:'Festivals',concert:'Concerts',market:'Markets',christmas:'Xmas Markets',exhibition:'Exhibitions',business:'Business',kids:'Kids Events',comics:'Comics & Gaming',flea:'Flea Markets',online:'Online Events',city:'City Events',messe:'Trade Fairs' };
const FLAGS = { BE:'🇧🇪',CN:'🇨🇳',DK:'🇩🇰',FR:'🇫🇷',DE:'🇩🇪',NL:'🇳🇱',PL:'🇵🇱',SE:'🇸🇪',AE:'🇦🇪',GB:'🇬🇧',US:'🇺🇸' };
const COUNTRY_NAMES = { BE:'Belgium',CN:'China',DK:'Denmark',FR:'France',DE:'Germany',NL:'Netherlands',PL:'Poland',SE:'Sweden',AE:'UAE',GB:'United Kingdom',US:'USA' };
const IMGS = {
  festival:'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&q=75',
  concert:'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=75',
  market:'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=75',
  christmas:'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=600&q=75',
  exhibition:'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=75',
  business:'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=75',
  kids:'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&q=75',
  comics:'https://images.unsplash.com/photo-1608889825205-eebdb9fc5806?w=600&q=75',
  flea:'https://images.unsplash.com/photo-1558402847-7f9d6d65b41c?w=600&q=75',
  online:'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=600&q=75',
  city:'https://images.unsplash.com/photo-1467803738586-46b7eb7b16a1?w=600&q=75',
  messe:'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&q=75',
};

function renderHome({ featured, recent, articles, countryCounts, catCounts, stats, user }) {
  const ev   = stats.events;
  const vn   = stats.vendors;
  const ar   = stats.articles;
  const sb   = stats.subscribers;
  const yr   = new Date().getFullYear();

  const organiserBenefits = [
    'Your event live within 24 hours',
    'Visible in 11 countries worldwide',
    'SEO-optimised page with your own URL',
    'Featured in newsletter to ' + sb + '+ subscribers',
    'Connect with verified vendors',
    'Track views and visitor interest',
  ];

  const vendorBenefits = [
    'Verified vendor badge on your profile',
    'Apply to festivals and markets directly',
    'Discovered by organisers in 11 countries',
    'Featured in our weekly newsletter',
    'See who views your profile',
    'Stand out from unverified competitors',
  ];

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Festmore — World Festival and Event Guide ${yr}</title>
<meta name="description" content="Discover the best festivals, markets, concerts and Christmas markets worldwide. Browse events in Germany, Denmark, UK, France, USA and more."/>
<link rel="canonical" href="https://festmore.com/"/>
<meta property="og:title" content="Festmore — World Festival and Event Guide"/>
<meta property="og:description" content="Discover the world's best festivals, markets and events. Updated daily."/>
<meta property="og:image" content="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200&q=80"/>
<meta property="og:url" content="https://festmore.com"/>
<meta name="twitter:card" content="summary_large_image"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/>
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2486135003689222" crossorigin="anonymous"></script>
<link rel="stylesheet" href="/css/main.css"/>
</head>
<body>

${renderNav(user)}

<!-- TICKER -->
<div class="ticker-bar">
  <span class="ticker-label">Live</span>
  <div class="ticker-track">
    <span class="ticker-item">Christmas Markets season across Europe</span>
    <span class="ticker-dot">*</span>
    <span class="ticker-item">Copenhagen Jazz Festival — 1,000+ concerts across 130 venues</span>
    <span class="ticker-dot">*</span>
    <span class="ticker-item">Hamburg Harbour Festival — 250,000 visitors expected this May</span>
    <span class="ticker-dot">*</span>
    <span class="ticker-item">${ev}+ events live across 11 countries worldwide</span>
    <span class="ticker-dot">*</span>
    <span class="ticker-item">${ar} festival guides published — new articles every day</span>
    <span class="ticker-dot">*</span>
    <span class="ticker-item">${vn}+ verified vendors ready to join your event</span>
    <span class="ticker-dot">*</span>
    <span class="ticker-item">Christmas Markets season across Europe</span>
    <span class="ticker-dot">*</span>
  </div>
</div>

<!-- HERO -->
<section class="hero">
  <div class="hero-inner">
    <div class="hero-left animate-fade-up">
      <div class="hero-eyebrow"><span class="eyebrow-dot"></span> Updated Daily · 11 Countries · All Events</div>
      <h1>Discover the World's<br/><em>Greatest Events</em></h1>
      <p class="hero-sub">From Berlin Christmas markets to London food markets, Copenhagen jazz to Dubai festivals — your global guide to every event worth attending.</p>
      <div class="hero-ctas">
        <a href="/events" class="btn btn-primary btn-lg">Browse Events</a>
        <a href="/events/submit" class="btn btn-outline-dark btn-lg">List Your Event</a>
      </div>
      <div class="hero-stats">
        <div class="hstat"><span class="hstat-n">${ev}+</span><span class="hstat-l">Events</span></div>
        <div class="hstat-div"></div>
        <div class="hstat"><span class="hstat-n">11</span><span class="hstat-l">Countries</span></div>
        <div class="hstat-div"></div>
        <div class="hstat"><span class="hstat-n">${ar}+</span><span class="hstat-l">Articles</span></div>
        <div class="hstat-div"></div>
        <div class="hstat"><span class="hstat-n">${vn}+</span><span class="hstat-l">Vendors</span></div>
      </div>
    </div>
    <div class="hero-right">
      <div class="hero-img-big">
        <img src="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=700&q=80" alt="Festival" loading="eager"/>
        <span class="hero-img-label">Festivals</span>
      </div>
      <div class="hero-imgs-small">
        <div class="hero-img-sm">
          <img src="https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=400&q=75" alt="Christmas Market" loading="eager"/>
          <span class="hero-img-label">Christmas Markets</span>
        </div>
        <div class="hero-img-sm">
          <img src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=75" alt="Markets" loading="eager"/>
          <span class="hero-img-label">Markets</span>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- STATS STRIP -->
<div class="stats-strip">
  <div class="stats-strip-inner">
    <div class="strip-stat"><span class="strip-stat-n">${ev}+</span><span class="strip-stat-l">Events Listed</span></div>
    <div class="strip-div"></div>
    <div class="strip-stat"><span class="strip-stat-n">11</span><span class="strip-stat-l">Countries</span></div>
    <div class="strip-div"></div>
    <div class="strip-stat"><span class="strip-stat-n">${vn}+</span><span class="strip-stat-l">Verified Vendors</span></div>
    <div class="strip-div"></div>
    <div class="strip-stat"><span class="strip-stat-n">${ar}+</span><span class="strip-stat-l">Festival Articles</span></div>
    <div class="strip-div"></div>
    <div class="strip-stat"><span class="strip-stat-n">${sb}+</span><span class="strip-stat-l">Subscribers</span></div>
  </div>
</div>

<!-- ADSENSE -->
<div class="ad-leaderboard"><div class="ad-label-small">Advertisement</div>
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
      ${Object.entries(CATS).map(([k, icon]) => {
        const count = (catCounts.find(c => c.category === k) || { count: 0 }).count;
        return '<a href="/events?category=' + k + '" class="cat-card"><span class="cat-icon">' + icon + '</span><span class="cat-name">' + CAT_LABELS[k] + '</span><span class="cat-count">' + count + ' events</span></a>';
      }).join('')}
    </div>
  </div>
</section>

<!-- FEATURED EVENTS -->
${featured.length ? `
<section class="section section-dark">
  <div class="container">
    <div class="section-header section-header-light">
      <div><h2 class="section-title light">Featured Events</h2><p class="section-sub light">Hand-picked events you cannot miss</p></div>
      <a href="/events" class="section-link light">View all</a>
    </div>
    <div class="events-grid">
      ${featured.map(e => eventCardHTML(e)).join('')}
    </div>
  </div>
</section>` : ''}

<!-- COUNTRIES -->
<section class="section section-warm">
  <div class="container">
    <div class="section-header">
      <div><h2 class="section-title">Browse by Country</h2><p class="section-sub">Events in 11 countries and growing</p></div>
    </div>
    <div class="countries-grid">
      ${countryCounts.map(c => '<a href="/events?country=' + c.country + '" class="country-card"><span class="country-flag">' + (FLAGS[c.country] || '') + '</span><span class="country-name">' + (COUNTRY_NAMES[c.country] || c.country) + '</span><span class="country-count">' + c.count + ' events</span></a>').join('')}
    </div>
  </div>
</section>

<!-- ADSENSE MID -->
<div class="ad-leaderboard"><div class="ad-label-small">Advertisement</div>
<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-2486135003689222" data-ad-format="auto" data-full-width-responsive="true"></ins>
<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
</div>

<!-- ARTICLES -->
${articles.length ? `
<section class="section">
  <div class="container">
    <div class="section-header">
      <div><h2 class="section-title">Festival Guides and News</h2><p class="section-sub">New articles published every day</p></div>
      <a href="/articles" class="section-link">All articles</a>
    </div>
    <div class="articles-grid">
      ${articles.map(a => '<a href="/articles/' + a.slug + '" class="article-card"><div class="article-img"><img src="' + (a.image_url || IMGS.festival) + '" alt="' + a.title + '" loading="lazy"/></div><div class="article-body"><div class="article-cat">' + (CATS[a.category] || '') + ' ' + (a.category || 'Festival Guide') + '</div><h3>' + a.title + '</h3><p>' + (a.excerpt || '') + '</p><span class="article-date">' + new Date(a.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) + '</span></div></a>').join('')}
    </div>
  </div>
</section>` : ''}

<!-- CTA SECTION -->
<section class="cta-section">
  <div class="container">
    <div class="cta-inner">
      <div class="cta-left">
        <h2>Are You an Event Organiser?</h2>
        <p>List your festival, market, concert or event on Festmore and reach thousands of visitors worldwide. From just 79 euro per year.</p>
        <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:28px;">
          <a href="/events/submit" class="btn btn-primary btn-lg">List Your Event — 79/yr</a>
          <a href="/vendors/register" class="btn btn-outline-white btn-lg">Join as Vendor — 49/yr</a>
        </div>
      </div>
      <div class="cta-right">
        <div class="cta-stat"><span>checkmark</span> Your event live within 24 hours</div>
        <div class="cta-stat"><span>globe</span> Seen by visitors in 11 countries</div>
        <div class="cta-stat"><span>email</span> Newsletter to ${sb}+ subscribers</div>
        <div class="cta-stat"><span>search</span> SEO-optimised listing with your own URL</div>
        <div class="cta-stat"><span>shop</span> Connect with ${vn}+ verified vendors</div>
      </div>
    </div>
  </div>
</section>

<!-- NEWSLETTER -->
<section class="section">
  <div class="container">
    <div class="newsletter-box">
      <div class="newsletter-left">
        <h2>Never Miss an Event</h2>
        <p>Get the best festivals and events delivered to your inbox every week. Join ${sb}+ subscribers already signed up.</p>
      </div>
      <form class="newsletter-form" id="newsletter-form">
        <input type="email" name="email" placeholder="Your email address" required class="nl-input"/>
        <select name="country" class="nl-input" style="max-width:200px;">
          <option value="">Favourite country</option>
          ${Object.entries(COUNTRY_NAMES).map(([k, v]) => '<option value="' + k + '">' + (FLAGS[k] || '') + ' ' + v + '</option>').join('')}
        </select>
        <button type="submit" class="btn btn-primary">Subscribe Free</button>
      </form>
    </div>
  </div>
</section>

<!-- RECENT EVENTS -->
<section class="section section-warm">
  <div class="container">
    <div class="section-header">
      <div><h2 class="section-title">Recently Added</h2><p class="section-sub">New events added daily across all countries</p></div>
      <a href="/events" class="section-link">View all ${ev}+ events</a>
    </div>
    <div class="events-grid">
      ${recent.slice(0, 6).map(e => eventCardHTML(e)).join('')}
    </div>
  </div>
</section>

<!-- TWO WAYS TO GROW -->
<section style="background:#fff;padding:80px 0;border-top:1px solid var(--border);">
  <div class="container">
    <div style="text-align:center;margin-bottom:56px;">
      <div style="display:inline-flex;align-items:center;gap:8px;background:rgba(232,71,10,.07);border:1px solid rgba(232,71,10,.18);color:var(--flame);font-size:11px;font-weight:700;padding:4px 14px;border-radius:99px;margin-bottom:16px;letter-spacing:.8px;text-transform:uppercase;">Grow Your Business</div>
      <h2 style="font-family:'DM Serif Display',serif;font-size:clamp(28px,4vw,48px);font-weight:400;margin-bottom:14px;">Two Ways to Grow<br/>with <em style="color:var(--flame);">Festmore</em></h2>
      <p style="color:var(--ink3);font-size:16px;max-width:560px;margin:0 auto;line-height:1.75;">Join event organisers and vendors already using Festmore to reach new customers across Europe and beyond.</p>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;max-width:1100px;margin:0 auto;">

      <div style="background:var(--ink);border-radius:28px;padding:48px 44px;position:relative;overflow:hidden;">
        <div style="position:absolute;top:-40px;right:-40px;width:200px;height:200px;border-radius:50%;background:radial-gradient(circle,rgba(232,71,10,.2) 0%,transparent 70%);pointer-events:none;"></div>
        <div style="position:relative;">
          <div style="font-size:44px;margin-bottom:18px;">🎪</div>
          <div style="font-size:11px;font-weight:700;color:var(--flame);text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">For Event Organisers</div>
          <h3 style="font-family:'DM Serif Display',serif;font-size:30px;font-weight:400;color:#fff;margin-bottom:12px;line-height:1.1;">Get Your Event<br/>Seen by Thousands</h3>
          <p style="color:rgba(255,255,255,.55);font-size:15px;line-height:1.75;margin-bottom:28px;">List your festival, market, concert or fair on Festmore and reach a targeted audience of event-lovers across 11 countries.</p>
          <div style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:20px 22px;margin-bottom:28px;">
            <div style="display:flex;align-items:baseline;gap:6px;margin-bottom:6px;">
              <span style="font-family:'DM Serif Display',serif;font-size:44px;color:#fff;line-height:1;">€79</span>
              <span style="color:rgba(255,255,255,.4);font-size:15px;">/year</span>
            </div>
            <div style="font-size:12px;color:rgba(255,255,255,.4);">Less than 7 euro per month — one-time annual payment</div>
          </div>
          ${organiserBenefits.map(b => '<div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid rgba(255,255,255,.06);font-size:13.5px;color:rgba(255,255,255,.7);">✅ ' + b + '</div>').join('')}
          <a href="/events/submit" class="btn btn-primary btn-lg" style="display:block;text-align:center;margin-top:28px;">List Your Event — €79/year</a>
        </div>
      </div>

      <div style="background:linear-gradient(145deg,#2d5a3d,#1a3d28);border-radius:28px;padding:48px 44px;position:relative;overflow:hidden;">
        <div style="position:absolute;top:-40px;right:-40px;width:200px;height:200px;border-radius:50%;background:radial-gradient(circle,rgba(74,124,89,.4) 0%,transparent 70%);pointer-events:none;"></div>
        <div style="position:relative;">
          <div style="font-size:44px;margin-bottom:18px;">🏪</div>
          <div style="font-size:11px;font-weight:700;color:#7ec99a;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">For Vendors</div>
          <h3 style="font-family:'DM Serif Display',serif;font-size:30px;font-weight:400;color:#fff;margin-bottom:12px;line-height:1.1;">Get Booked at<br/>Europe's Best Events</h3>
          <p style="color:rgba(255,255,255,.55);font-size:15px;line-height:1.75;margin-bottom:28px;">Create your verified vendor profile and get discovered by event organisers actively searching for food vendors, artisans, entertainers and more.</p>
          <div style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:20px 22px;margin-bottom:28px;">
            <div style="display:flex;align-items:baseline;gap:6px;margin-bottom:6px;">
              <span style="font-family:'DM Serif Display',serif;font-size:44px;color:#fff;line-height:1;">€49</span>
              <span style="color:rgba(255,255,255,.4);font-size:15px;">/year</span>
            </div>
            <div style="font-size:12px;color:rgba(255,255,255,.4);">Less than 5 euro per month — one booking pays for the whole year</div>
          </div>
          ${vendorBenefits.map(b => '<div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid rgba(255,255,255,.06);font-size:13.5px;color:rgba(255,255,255,.7);">✅ ' + b + '</div>').join('')}
          <a href="/vendors/register" style="display:block;text-align:center;margin-top:28px;background:#fff;color:#1a3d28;padding:14px 32px;border-radius:14px;font-size:15px;font-weight:700;">Create Vendor Profile — €49/year</a>
        </div>
      </div>

    </div>


  </div>
</section>

<!-- URGENCY STRIP -->
<div style="background:var(--flame);padding:22px 0;">
  <div class="container" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;">
    <div style="color:#fff;">
      <div style="font-family:'DM Serif Display',serif;font-size:20px;">Get your listing live today — ${ev}+ events already on Festmore</div>
      <div style="font-size:13px;color:rgba(255,255,255,.75);margin-top:3px;">Join organisers and vendors already growing with Festmore</div>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;">
      <a href="/events/submit" style="background:#fff;color:var(--flame);padding:12px 24px;border-radius:99px;font-size:13.5px;font-weight:700;white-space:nowrap;">List Event 79 EUR</a>
      <a href="/vendors/register" style="background:rgba(255,255,255,.15);color:#fff;border:1.5px solid rgba(255,255,255,.4);padding:12px 24px;border-radius:99px;font-size:13.5px;font-weight:700;white-space:nowrap;">Join as Vendor 49 EUR</a>
    </div>
  </div>
</div>

${renderFooter(stats)}

<script src="/js/main.js"></script>
<script>
document.getElementById('newsletter-form').addEventListener('submit', function(e) {
  e.preventDefault();
  var data = {};
  new FormData(e.target).forEach(function(v, k) { data[k] = v; });
  fetch('/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    .then(function(r) { return r.json(); })
    .then(function(json) {
      if (json.ok) {
        document.getElementById('newsletter-form').innerHTML = '<p style="color:#4a7c59;font-weight:700;font-size:16px;text-align:center;padding:20px 0;">You are subscribed! Welcome to Festmore.</p>';
      } else {
        alert(json.msg);
      }
    });
});
</script>
</body>
</html>`;
}

function eventCardHTML(e) {
  const img    = IMGS[e.category] || IMGS.festival;
  const flag   = FLAGS[e.country] || '';
  const icon   = CATS[e.category] || '';
  const isFree = e.price_display === 'Free';
  return '<article class="event-card" itemscope itemtype="https://schema.org/Event"><a href="/events/' + e.slug + '"><div class="event-img"><img src="' + img + '" alt="' + e.title + '" loading="lazy" itemprop="image"/><div class="event-img-overlay"></div><div class="event-badges">' + (e.featured ? '<span class="badge badge-feat">Featured</span>' : '') + '<span class="badge badge-cat">' + icon + ' ' + e.category + '</span>' + (isFree ? '<span class="badge badge-free">Free</span>' : '') + '</div></div><div class="event-body"><div class="event-date" itemprop="startDate">' + (e.date_display || e.start_date) + '</div><h3 itemprop="name">' + e.title + '</h3><div class="event-loc" itemprop="location">' + flag + ' ' + e.city + '</div><div class="event-footer"><span class="event-stat">' + (e.attendees || 0).toLocaleString() + ' visitors</span><span class="event-price ' + (isFree ? 'price-free' : 'price-paid') + '">' + e.price_display + '</span></div></div></a></article>';
}

function renderNav(user) {
  var userLinks = user
    ? '<a href="/dashboard" class="btn btn-outline btn-sm">Dashboard</a><a href="/auth/logout" class="btn btn-ghost btn-sm">Logout</a>'
    : '<a href="/auth/login" class="btn btn-outline btn-sm">Login</a><a href="/events/submit" class="btn btn-primary btn-sm">+ List Event</a>';
  var mobileLinks = user
    ? '<a href="/dashboard">Dashboard</a><a href="/auth/logout">Logout</a>'
    : '<a href="/auth/login">Login</a><a href="/auth/register">Register</a>';
  return '<nav class="main-nav"><div class="nav-inner"><a href="/" class="logo"><span class="logo-fest">Fest</span><span class="logo-more">more</span><span class="logo-dot"></span></a><form class="nav-search" action="/events" method="GET"><span style="color:var(--ink4);font-size:15px;">search</span><input type="text" name="q" placeholder="Search events, cities, countries"/></form><div class="nav-right">' + userLinks + '</div><button class="nav-burger" onclick="document.querySelector(\'.nav-mobile\').classList.toggle(\'open\')" aria-label="Menu">menu</button></div><div class="nav-cats-bar"><a href="/events" class="nav-cat">All</a><a href="/events?category=festival" class="nav-cat">Festivals</a><a href="/events?category=market" class="nav-cat">Markets</a><a href="/events?category=christmas" class="nav-cat">Xmas Markets</a><a href="/events?category=concert" class="nav-cat">Concerts</a><a href="/events?category=city" class="nav-cat">City Events</a><a href="/events?category=business" class="nav-cat">Business</a><a href="/events?category=kids" class="nav-cat">Kids</a><a href="/events?category=flea" class="nav-cat">Flea Markets</a><a href="/events?category=messe" class="nav-cat">Trade Fairs</a><a href="/articles" class="nav-cat">Articles</a><a href="/vendors" class="nav-cat">Vendors</a><a href="/about" class="nav-cat">About</a><a href="/contact" class="nav-cat">Contact</a></div><div class="nav-mobile"><a href="/events">All Events</a><a href="/articles">Articles</a><a href="/vendors">Vendors</a><a href="/events/submit">+ List Your Event</a>' + mobileLinks + '</div></nav>';
}

function renderFooter(stats) {
  return '<footer><div class="footer-top"><div class="footer-brand"><div class="logo" style="margin-bottom:14px;"><span class="logo-fest" style="color:#fff;">Fest</span><span class="logo-more">more</span></div><p>Your global guide to festivals, markets, concerts and events. Covering 11 countries worldwide. New events added every day.</p><div class="footer-social"><a href="#" class="social-icon" aria-label="Facebook">f</a><a href="#" class="social-icon" aria-label="Instagram">ig</a><a href="#" class="social-icon" aria-label="X">x</a></div></div><div class="footer-col"><h4>Events</h4><a href="/events?category=festival">Festivals</a><a href="/events?category=market">Markets</a><a href="/events?category=christmas">Christmas Markets</a><a href="/events?category=concert">Concerts</a><a href="/events?category=city">City Events</a><a href="/events?category=kids">Kids Events</a></div><div class="footer-col"><h4>Countries</h4><a href="/events?country=DE">Germany</a><a href="/events?country=DK">Denmark</a><a href="/events?country=GB">United Kingdom</a><a href="/events?country=FR">France</a><a href="/events?country=US">USA</a><a href="/events?country=AE">UAE</a></div><div class="footer-col"><h4>Festmore</h4><a href="/events/submit">Submit Event</a><a href="/vendors/register">Become a Vendor</a><a href="/articles">Festival Guides</a><a href="/about">About Us</a><a href="/contact">Contact</a><a href="/privacy">Privacy Policy</a></div></div><div class="footer-bottom"><span>© ' + new Date().getFullYear() + ' Festmore.com — All rights reserved</span><span>' + stats.events + '+ events · ' + stats.articles + '+ articles · ' + stats.vendors + '+ vendors</span></div></footer>';
}

module.exports.renderNav = renderNav;
module.exports.renderFooter = renderFooter;
module.exports.eventCardHTML = eventCardHTML;
module.exports.IMGS = IMGS;
module.exports.FLAGS = FLAGS;
module.exports.CATS = CATS;
module.exports.COUNTRY_NAMES = COUNTRY_NAMES;