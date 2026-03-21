// routes/landing.js
// Dedicated SEO landing pages for high-traffic searches
// Pol'and'Rock, Woodstock Poland, Garbage Festival etc.

const express = require('express');
const router  = express.Router();
const db      = require('../db');

const FLAGS = {
  BE:'🇧🇪',CN:'🇨🇳',DK:'🇩🇰',FR:'🇫🇷',DE:'🇩🇪',NL:'🇳🇱',PL:'🇵🇱',SE:'🇸🇪',
  AE:'🇦🇪',GB:'🇬🇧',US:'🇺🇸',NO:'🇳🇴',FI:'🇫🇮',AT:'🇦🇹',CH:'🇨🇭',IT:'🇮🇹',
  ES:'🇪🇸',PT:'🇵🇹',IE:'🇮🇪',CZ:'🇨🇿',HU:'🇭🇺',GR:'🇬🇷',HR:'🇭🇷',IN:'🇮🇳',TH:'🇹🇭',JP:'🇯🇵',
};

// ─────────────────────────────────────
// POL'AND'ROCK / WOODSTOCK POLAND
// Catches: polandrock 2026, woodstock poland, pol and rock
// ─────────────────────────────────────
router.get('/polandrock-2026', (req, res) => {
  const event = db.prepare("SELECT * FROM events WHERE slug='polandrock-festival-2026'").get();
  const related = db.prepare("SELECT * FROM events WHERE country='PL' AND status='active' AND slug!='polandrock-festival-2026' ORDER BY featured DESC LIMIT 4").all();
  res.send(renderLandingPage({
    event,
    related,
    user: req.session.user,
    title: "Pol'and'Rock Festival 2026 — Europe's Greatest Free Festival",
    subtitle: "Woodstock Poland | Jul 30 – Aug 1, 2026 | Kostrzyn nad Odrą",
    breadcrumb: "Pol'and'Rock 2026",
    faq: [
      { q: "When is Pol'and'Rock 2026?", a: "Pol'and'Rock Festival 2026 takes place from 30 July to 1 August 2026 at Czaplinek Lotnisko Broczyno in Poland." },
      { q: "Is Pol'and'Rock free?", a: "Yes — Pol'and'Rock is completely free to attend. There are no tickets and no entry fee. The festival has been free since its founding in 1995." },
      { q: "Where is Pol'and'Rock 2026?", a: "The 2026 edition is held at Lotnisko Czaplinek-Broczyno (Czaplinek airfield) in the Zachodniopomorskie region of northern Poland." },
      { q: "How many people attend Pol'and'Rock?", a: "Pol'and'Rock typically draws between 500,000 and 750,000 visitors over the three-day festival — making it one of the largest music gatherings in the world." },
      { q: "What was Pol'and'Rock called before?", a: "The festival was known as Przystanek Woodstock (Woodstock Poland) until 2017, when it was renamed Pol'and'Rock Festival." },
      { q: "Can you camp at Pol'and'Rock?", a: "Yes — camping is available on site at the festival grounds. Hundreds of thousands of festival-goers camp on site for the full weekend." },
    ]
  }));
});

// Alias routes for different search variations
router.get('/woodstock-poland-2026', (req, res) => res.redirect(301, '/festival/polandrock-2026'));
router.get('/pol-and-rock-2026', (req, res) => res.redirect(301, '/festival/polandrock-2026'));

// ─────────────────────────────────────
// RENDER LANDING PAGE
// ─────────────────────────────────────
function renderLandingPage({ event, related, user, title, subtitle, breadcrumb, faq }) {
  const img = event?.image_url || 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1400&q=80';

  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${event?.meta_title || title} | Festmore</title>
<meta name="description" content="${event?.meta_desc || subtitle}"/>
<meta name="robots" content="index,follow"/>
<link rel="canonical" href="https://festmore.com/festival/polandrock-2026"/>
<meta property="og:title" content="${title}"/>
<meta property="og:description" content="${subtitle}"/>
<meta property="og:image" content="${img}"/>
<meta property="og:type" content="website"/>
<script type="application/ld+json">${JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Event",
  "name": event?.title || title,
  "startDate": event?.start_date || "2026-07-30",
  "endDate": event?.end_date || "2026-08-01",
  "location": {
    "@type": "Place",
    "name": "Czaplinek Lotnisko Broczyno",
    "address": { "@type": "PostalAddress", "addressCountry": "PL", "addressLocality": "Czaplinek" }
  },
  "description": event?.description?.substring(0, 300),
  "image": img,
  "url": "https://festmore.com/festival/polandrock-2026",
  "isAccessibleForFree": true,
  "eventStatus": "https://schema.org/EventScheduled",
  "organizer": { "@type": "Organization", "name": "Jurek Owsiak / WOŚP" }
})}</script>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/>
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2486135003689222" crossorigin="anonymous"></script>
<link rel="stylesheet" href="/css/main.css"/>
<style>
.landing-hero{position:relative;height:480px;overflow:hidden;}
.landing-hero img{width:100%;height:100%;object-fit:cover;}
.landing-hero-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(10,10,10,.95) 0%,rgba(10,10,10,.5) 60%,transparent 100%);}
.landing-hero-content{position:absolute;bottom:0;left:0;right:0;padding:48px 40px;}
.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:28px;}
.info-box{background:#fff;border:1px solid var(--border);border-radius:14px;padding:20px;text-align:center;}
.info-box-label{font-size:11px;font-weight:700;color:var(--ink4);text-transform:uppercase;letter-spacing:.8px;margin-bottom:6px;}
.info-box-value{font-size:20px;font-weight:700;color:var(--ink);}
.faq-item{padding:20px 0;border-bottom:1px solid var(--border);}
.faq-q{font-size:16px;font-weight:700;color:var(--ink);margin-bottom:8px;}
.faq-a{font-size:14px;color:var(--ink3);line-height:1.75;}
@media(max-width:768px){.landing-hero-content{padding:24px;}.info-grid{grid-template-columns:1fr 1fr;}}
</style>
</head><body>
${renderNav(user)}

<!-- BREADCRUMB -->
<div style="background:var(--ivory);border-bottom:1px solid var(--border);padding:12px 0;">
  <div class="container" style="font-size:13px;color:var(--ink3);">
    <a href="/" style="color:var(--ink3);text-decoration:none;">Home</a> →
    <a href="/events?category=festival" style="color:var(--ink3);text-decoration:none;"> Festivals</a> →
    <a href="/events?country=PL" style="color:var(--ink3);text-decoration:none;"> 🇵🇱 Poland</a> →
    <strong style="color:var(--ink);"> ${breadcrumb}</strong>
  </div>
</div>

<!-- HERO -->
<div class="landing-hero">
  <img src="${img}" alt="${title}"/>
  <div class="landing-hero-overlay"></div>
  <div class="landing-hero-content">
    <div class="container">
      <div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap;">
        <span style="background:rgba(255,255,255,.15);color:#fff;padding:4px 14px;border-radius:99px;font-size:12px;font-weight:700;">🎪 Festival</span>
        <span style="background:rgba(255,255,255,.15);color:#fff;padding:4px 14px;border-radius:99px;font-size:12px;font-weight:700;">🇵🇱 Poland</span>
        <span style="background:#4a7c59;color:#fff;padding:4px 14px;border-radius:99px;font-size:12px;font-weight:700;">✅ Free Entry</span>
      </div>
      <h1 style="font-family:'DM Serif Display',serif;font-size:clamp(28px,5vw,56px);font-weight:400;color:#fff;margin-bottom:10px;line-height:1.1;">${title}</h1>
      <p style="color:rgba(255,255,255,.65);font-size:16px;">${subtitle}</p>
    </div>
  </div>
</div>

<div class="container" style="padding:48px 0;max-width:1000px;">
  <div style="display:grid;grid-template-columns:1fr 320px;gap:40px;align-items:start;">

    <!-- MAIN CONTENT -->
    <div>
      <!-- KEY INFO -->
      <div class="info-grid">
        <div class="info-box"><div class="info-box-label">Dates</div><div class="info-box-value" style="font-size:16px;">Jul 30 – Aug 1, 2026</div></div>
        <div class="info-box"><div class="info-box-label">Location</div><div class="info-box-value" style="font-size:15px;">Czaplinek, Poland</div></div>
        <div class="info-box"><div class="info-box-label">Attendance</div><div class="info-box-value">750,000</div></div>
        <div class="info-box"><div class="info-box-label">Entry Price</div><div class="info-box-value" style="color:#4a7c59;">FREE</div></div>
      </div>

      <ins class="adsbygoogle" style="display:block;margin-bottom:28px;" data-ad-client="ca-pub-2486135003689222" data-ad-format="auto" data-full-width-responsive="true"></ins>
      <script>(adsbygoogle=window.adsbygoogle||[]).push({});</script>

      <!-- DESCRIPTION -->
      <div style="background:#fff;border:1px solid var(--border);border-radius:20px;padding:32px;margin-bottom:28px;">
        <h2 style="font-family:'DM Serif Display',serif;font-size:26px;font-weight:400;margin-bottom:20px;">About Pol'and'Rock Festival 2026</h2>
        <div style="font-size:15px;line-height:1.9;color:var(--ink2);">
          ${(event?.description || '').split('\n\n').map(p => `<p style="margin-bottom:16px;">${p}</p>`).join('')}
        </div>
      </div>

      <!-- FAQ -->
      <div style="background:#fff;border:1px solid var(--border);border-radius:20px;padding:32px;margin-bottom:28px;">
        <h2 style="font-family:'DM Serif Display',serif;font-size:26px;font-weight:400;margin-bottom:8px;">Frequently Asked Questions</h2>
        <p style="color:var(--ink3);font-size:14px;margin-bottom:24px;">Everything you need to know about Pol'and'Rock 2026</p>
        <script type="application/ld+json">${JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": faq.map(f => ({
            "@type": "Question",
            "name": f.q,
            "acceptedAnswer": { "@type": "Answer", "text": f.a }
          }))
        })}</script>
        ${faq.map(f => `
        <div class="faq-item">
          <div class="faq-q">${f.q}</div>
          <div class="faq-a">${f.a}</div>
        </div>`).join('')}
      </div>

      <!-- RELATED EVENTS IN POLAND -->
      ${related.length ? `
      <div>
        <h3 style="font-family:'DM Serif Display',serif;font-size:22px;font-weight:400;margin-bottom:20px;">More Events in Poland</h3>
        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:16px;">
          ${related.map(e => `
          <a href="/events/${e.slug}" style="background:#fff;border:1px solid var(--border);border-radius:14px;overflow:hidden;text-decoration:none;display:block;transition:all .2s;" onmouseover="this.style.borderColor='var(--flame)'" onmouseout="this.style.borderColor='var(--border)'">
            <div style="height:120px;overflow:hidden;background:var(--ivory);"><img src="${e.image_url||'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&q=70'}" alt="${e.title}" style="width:100%;height:100%;object-fit:cover;"/></div>
            <div style="padding:14px;">
              <div style="font-size:11px;font-weight:700;color:var(--flame);text-transform:uppercase;margin-bottom:4px;">${e.category}</div>
              <div style="font-size:14px;font-weight:600;color:var(--ink);">${e.title}</div>
              <div style="font-size:12px;color:var(--ink3);margin-top:3px;">📅 ${e.date_display||e.start_date}</div>
            </div>
          </a>`).join('')}
        </div>
      </div>` : ''}
    </div>

    <!-- SIDEBAR -->
    <aside>
      <div style="background:#fff;border:1px solid var(--border);border-radius:20px;padding:24px;margin-bottom:16px;position:sticky;top:80px;">
        <h3 style="font-family:'DM Serif Display',serif;font-size:18px;font-weight:400;margin-bottom:16px;">Festival Info</h3>
        ${[
          ['📅', 'Dates', 'Jul 30 – Aug 1, 2026'],
          ['📍', 'Location', 'Czaplinek, Poland'],
          ['💰', 'Entry', 'FREE — No Tickets'],
          ['👥', 'Attendance', 'Up to 750,000'],
          ['⛺', 'Camping', 'Yes — On Site'],
          ['🎵', 'Stages', '5 Stages'],
        ].map(([icon, label, value]) => `
        <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border);">
          <div style="width:32px;height:32px;background:rgba(232,71,10,.08);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;">${icon}</div>
          <div>
            <div style="font-size:11px;font-weight:700;color:var(--ink4);text-transform:uppercase;letter-spacing:.6px;">${label}</div>
            <div style="font-size:13px;font-weight:600;color:var(--ink2);">${value}</div>
          </div>
        </div>`).join('')}
        <a href="${event?.website || 'https://en.polandrockfestival.pl'}" target="_blank" rel="nofollow noopener" class="btn btn-primary" style="display:block;text-align:center;margin-top:20px;">Official Website →</a>
        <a href="/events?country=PL" class="btn btn-outline" style="display:block;text-align:center;margin-top:8px;">More Poland Events →</a>
      </div>

      <ins class="adsbygoogle" style="display:block;" data-ad-client="ca-pub-2486135003689222" data-ad-format="auto" data-full-width-responsive="true"></ins>
      <script>(adsbygoogle=window.adsbygoogle||[]).push({});</script>
    </aside>
  </div>
</div>

${renderFooter()}
</body></html>`;
}

function renderNav(user) {
  return `<nav class="main-nav"><div class="nav-inner"><a href="/" class="logo"><span class="logo-fest">Fest</span><span class="logo-more">more</span><span class="logo-dot"></span></a><form class="nav-search" action="/events" method="GET"><span style="color:var(--ink4);font-size:15px;">🔍</span><input type="text" name="q" placeholder="Search events…"/></form><div class="nav-right">${user?`<a href="/dashboard" class="btn btn-outline btn-sm">Dashboard</a><a href="/auth/logout" class="btn btn-ghost btn-sm">Logout</a>`:`<a href="/auth/login" class="btn btn-outline btn-sm">Login</a><a href="/events/submit" class="btn btn-primary btn-sm">+ List Event</a>`}</div><button class="nav-burger" onclick="document.querySelector('.nav-mobile').classList.toggle('open')">☰</button></div><div class="nav-cats-bar"><a href="/events" class="nav-cat">🌍 All</a><a href="/events?category=festival" class="nav-cat">🎪 Festivals</a><a href="/events?category=market" class="nav-cat">🛍️ Markets</a><a href="/events?category=christmas" class="nav-cat">🎄 Xmas Markets</a><a href="/events?category=concert" class="nav-cat">🎵 Concerts</a><a href="/articles" class="nav-cat">📰 Articles</a><a href="/vendors" class="nav-cat">🏪 Vendors</a><a href="/contact" class="nav-cat">✉️ Contact</a></div></nav>`;
}

function renderFooter() {
  return `<footer><div class="footer-bottom"><span>© ${new Date().getFullYear()} Festmore.com — All rights reserved</span><div style="display:flex;gap:20px;"><a href="/" style="color:rgba(255,255,255,.35);font-size:13px;">Home</a><a href="/events" style="color:rgba(255,255,255,.35);font-size:13px;">Events</a><a href="/about" style="color:rgba(255,255,255,.35);font-size:13px;">About</a><a href="/contact" style="color:rgba(255,255,255,.35);font-size:13px;">Contact</a><a href="/privacy" style="color:rgba(255,255,255,.35);font-size:13px;">Privacy</a></div></div></footer>`;
}

module.exports = router;