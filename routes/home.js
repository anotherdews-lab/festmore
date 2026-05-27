// routes/home.js — FESTMORE v3 REDESIGN
// ✅ 4-way split hero (Organiser / Vendor / Artist / Visitor)
// ✅ Gold badge commercial tier
// ✅ Artist subcategories (Musicians, DJs, Comedians, Painters, etc.)
// ✅ All existing Stripe, DB, routes, events, articles preserved
// ✅ Performance: pre-compiled statements + 5min stats cache

const express = require('express');
const router  = express.Router();
const db      = require('../db');
const { t, getLang, langSwitcher } = require('../utils/i18n');

// ─── PRE-COMPILE STATEMENTS ONCE ─────────────────────────────────────────────
const stmts = {
  topEvents:      db.prepare(`SELECT id,title,slug,category,city,country,start_date,date_display,price_display,image_url,attendees,featured,payment_status FROM events WHERE status='active' ORDER BY featured DESC, attendees DESC, id DESC LIMIT 6`),
  featuredEvents: db.prepare(`SELECT id,title,slug,category,city,country,start_date,date_display,image_url,attendees FROM events WHERE status='active' AND featured=1 ORDER BY attendees DESC LIMIT 3`),
  articles:       db.prepare(`SELECT id,title,slug,excerpt,image_url,category,created_at FROM articles WHERE status='published' ORDER BY created_at DESC LIMIT 3`),
  countryCounts:  db.prepare(`SELECT country, COUNT(*) as count FROM events WHERE status='active' GROUP BY country ORDER BY count DESC`),
  catCounts:      db.prepare(`SELECT category, COUNT(*) as count FROM events WHERE status='active' GROUP BY category ORDER BY count DESC`),
  vendors:        db.prepare(`SELECT id,business_name,category,city,country,avg_rating,total_applications,photos,image_url FROM vendors WHERE status='active' AND payment_status='paid' ORDER BY avg_rating DESC, total_applications DESC, id DESC LIMIT 6`),
  statsEvents:    db.prepare(`SELECT COUNT(*) as n FROM events WHERE status='active'`),
  statsVendors:   db.prepare(`SELECT COUNT(*) as n FROM vendors WHERE status='active'`),
  statsArticles:  db.prepare(`SELECT COUNT(*) as n FROM articles WHERE status='published'`),
  statsSubs:      db.prepare(`SELECT COUNT(*) as n FROM subscribers WHERE active=1`),
};

// ─── STATS CACHE (5 min) ──────────────────────────────────────────────────────
let _statsCache = null, _statsCacheTime = 0;
const STATS_TTL = 5 * 60 * 1000;
function getCachedStats() {
  const now = Date.now();
  if (_statsCache && (now - _statsCacheTime) < STATS_TTL) return _statsCache;
  _statsCache = {
    events:      stmts.statsEvents.get().n,
    vendors:     stmts.statsVendors.get().n,
    articles:    stmts.statsArticles.get().n,
    subscribers: stmts.statsSubs.get().n,
  };
  _statsCacheTime = now;
  return _statsCache;
}

router.get('/', (req, res) => {
  const topEvents      = stmts.topEvents.all();
  const featuredEvents = stmts.featuredEvents.all();
  const articles       = stmts.articles.all();
  const countryCounts  = stmts.countryCounts.all();
  const catCounts      = stmts.catCounts.all();
  const vendors        = stmts.vendors.all();
  const cachedStats    = getCachedStats();
  const stats = { ...cachedStats, countries: countryCounts.length };
  const tr   = t(req);
  const lang = getLang(req);
  res.send(renderHome({ topEvents, featuredEvents, articles, countryCounts, catCounts, stats, vendors, user: req.session.user, tr, lang, langHtml: langSwitcher(req) }));
});

router.get('/set-lang/:lang', (req, res) => {
  if (req.session) req.session.lang = req.params.lang;
  res.redirect(req.headers.referer || '/');
});

module.exports = router;

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const FLAGS = {
  BE:'🇧🇪',CN:'🇨🇳',DK:'🇩🇰',FR:'🇫🇷',DE:'🇩🇪',NL:'🇳🇱',PL:'🇵🇱',SE:'🇸🇪',
  AE:'🇦🇪',GB:'🇬🇧',US:'🇺🇸',NO:'🇳🇴',FI:'🇫🇮',AT:'🇦🇹',CH:'🇨🇭',IT:'🇮🇹',
  ES:'🇪🇸',PT:'🇵🇹',IE:'🇮🇪',CZ:'🇨🇿',HU:'🇭🇺',GR:'🇬🇷',HR:'🇭🇷',
  IN:'🇮🇳',TH:'🇹🇭',JP:'🇯🇵',AU:'🇦🇺',CA:'🇨🇦',BR:'🇧🇷',MX:'🇲🇽',
  KR:'🇰🇷',ZA:'🇿🇦',AR:'🇦🇷',MA:'🇲🇦',SG:'🇸🇬',RO:'🇷🇴',EE:'🇪🇪',RS:'🇷🇸',AL:'🇦🇱',
};
const COUNTRY_NAMES = {
  BE:'Belgium',CN:'China',DK:'Denmark',FR:'France',DE:'Germany',NL:'Netherlands',
  PL:'Poland',SE:'Sweden',AE:'UAE',GB:'United Kingdom',US:'USA',NO:'Norway',
  FI:'Finland',AT:'Austria',CH:'Switzerland',IT:'Italy',ES:'Spain',PT:'Portugal',
  IE:'Ireland',CZ:'Czech Republic',HU:'Hungary',GR:'Greece',HR:'Croatia',
  IN:'India',TH:'Thailand',JP:'Japan',AU:'Australia',CA:'Canada',BR:'Brazil',
  MX:'Mexico',KR:'South Korea',ZA:'South Africa',AR:'Argentina',MA:'Morocco',
  SG:'Singapore',RO:'Romania',EE:'Estonia',RS:'Serbia',AL:'Albania',
};
const CATS = { festival:'🎪',concert:'🎵',market:'🛍️',christmas:'🎄',exhibition:'🖼️',business:'💼',kids:'🎠',comics:'🎮',flea:'🏺',online:'💻',city:'🏙️',messe:'🏛️' };
const IMGS = {
  festival:'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&q=75',
  concert:'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=75',
  market:'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=75',
  christmas:'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=600&q=75',
  exhibition:'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=75',
  business:'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=75',
  kids:'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&q=75',
  flea:'https://images.unsplash.com/photo-1558402847-7f9d6d65b41c?w=600&q=75',
  city:'https://images.unsplash.com/photo-1467803738586-46b7eb7b16a1?w=600&q=75',
  messe:'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&q=75',
  comics:'https://images.unsplash.com/photo-1608889825205-eebdb9fc5806?w=600&q=75',
  online:'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=600&q=75',
};

// ─── MAIN RENDER ─────────────────────────────────────────────────────────────
function renderHome({ topEvents, featuredEvents, articles, countryCounts, catCounts, stats, vendors, user, tr, lang, langHtml }) {
  const ev = stats.events, vn = stats.vendors, ar = stats.articles, sb = stats.subscribers, cn = stats.countries;

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Festmore — Find Events, Book Vendors &amp; Discover Artists Worldwide</title>
<meta name="description" content="Festmore is the global marketplace for events, vendors and artists. ${ev}+ events across ${cn} countries. Find your next festival, book a vendor or get discovered as an artist."/>
<link rel="canonical" href="https://festmore.com/"/>
<meta property="og:type" content="website"/>
<meta property="og:title" content="Festmore — Events, Vendors &amp; Artists Worldwide"/>
<meta property="og:description" content="${ev}+ events · ${vn}+ vendors · ${cn} countries"/>
<meta property="og:image" content="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200&q=80"/>
<meta property="og:url" content="https://festmore.com/"/>
<meta name="twitter:card" content="summary_large_image"/>
<script type="application/ld+json">{"@context":"https://schema.org","@type":"WebSite","name":"Festmore","url":"https://festmore.com","potentialAction":{"@type":"SearchAction","target":{"@type":"EntryPoint","urlTemplate":"https://festmore.com/events?q={search_term_string}"},"query-input":"required name=search_term_string"}}</script>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet"/>
<script>window.addEventListener("load",function(){var s=document.createElement("script");s.async=true;s.src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2486135003689222";s.crossOrigin="anonymous";document.head.appendChild(s);});</script>
<link rel="stylesheet" href="/css/main.css"/>
<style>
:root {
  --flame:#e8470a; --flame2:#c23d09; --gold:#f5a623; --gold2:#e8940a;
  --ink:#0d0d0d; --ink2:#1a1612; --ink3:#3d3530; --ink4:#7a6f68; --ink5:#b5ada6;
  --cream:#faf8f3; --white:#fff; --border:#e8e2d9;
  --green:#4a7c59; --purple:#7c3aed;
  --font-display:'Instrument Serif',serif; --font-body:'Syne',sans-serif;
}
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:var(--font-body);background:var(--white);color:var(--ink2);}
a{text-decoration:none;}

/* ── NAV ── */
.nav{position:sticky;top:0;z-index:100;background:rgba(13,13,13,.97);backdrop-filter:blur(20px);border-bottom:1px solid rgba(255,255,255,.08);}
.nav-inner{max-width:1300px;margin:0 auto;padding:0 32px;height:64px;display:flex;align-items:center;gap:24px;}
.nav-logo{font-family:var(--font-display);font-size:24px;color:var(--white);font-weight:400;letter-spacing:-.5px;flex-shrink:0;}
.nav-logo span{color:var(--flame);}
.nav-search-wrap{flex:1;max-width:420px;}
.nav-search{display:flex;align-items:center;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:0 14px;height:40px;gap:8px;transition:all .2s;}
.nav-search:focus-within{border-color:rgba(232,71,10,.5);background:rgba(255,255,255,.1);}
.nav-search input{flex:1;border:none;background:transparent;color:var(--white);font-family:var(--font-body);font-size:14px;outline:none;}
.nav-search input::placeholder{color:rgba(255,255,255,.35);}
.nav-links{display:flex;align-items:center;gap:4px;margin-left:auto;}
.nav-link{color:rgba(255,255,255,.6);font-size:13px;font-weight:600;padding:7px 14px;border-radius:8px;transition:all .2s;}
.nav-link:hover{color:var(--white);background:rgba(255,255,255,.08);}
.nav-btn{background:var(--flame);color:var(--white);font-size:13px;font-weight:700;padding:8px 20px;border-radius:8px;transition:all .2s;border:none;cursor:pointer;font-family:var(--font-body);}
.nav-btn:hover{background:var(--flame2);}
.nav-burger{display:none;background:none;border:none;color:var(--white);font-size:22px;cursor:pointer;margin-left:auto;}
.nav-mobile{display:none;flex-direction:column;background:var(--ink);padding:16px 24px;gap:4px;}
.nav-mobile a{color:rgba(255,255,255,.7);font-size:15px;font-weight:600;padding:10px 0;border-bottom:1px solid rgba(255,255,255,.06);}
.nav-mobile a:last-child{border-bottom:none;}

/* ── HERO ── */
.hero{background:var(--ink);min-height:100vh;display:flex;flex-direction:column;justify-content:center;position:relative;overflow:hidden;padding:100px 32px 80px;}
.hero-bg{position:absolute;inset:0;background-image:url('https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1600&q=50');background-size:cover;background-position:center top;opacity:.25;}
.hero-gradient{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(13,13,13,.85) 0%,rgba(13,13,13,.6) 40%,rgba(13,13,13,.92) 100%);}
.hero-grain{position:absolute;inset:0;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.03'/%3E%3C/svg%3E");opacity:.5;}
.hero-glow{position:absolute;bottom:-100px;left:50%;transform:translateX(-50%);width:1000px;height:600px;border-radius:50%;background:radial-gradient(ellipse,rgba(232,71,10,.15) 0%,transparent 65%);}
.hero-inner{position:relative;z-index:2;max-width:1200px;margin:0 auto;width:100%;text-align:center;}
.hero-eyebrow{display:inline-flex;align-items:center;gap:8px;background:rgba(232,71,10,.12);border:1px solid rgba(232,71,10,.3);color:#ff7043;font-size:11px;font-weight:700;padding:6px 18px;border-radius:99px;margin-bottom:32px;letter-spacing:1.5px;text-transform:uppercase;}
.hero-dot{width:5px;height:5px;border-radius:50%;background:#ff7043;animation:blink 2s ease infinite;}
.hero-h1{font-family:var(--font-display);font-size:clamp(52px,8.5vw,110px);color:var(--white);line-height:.95;margin-bottom:24px;font-weight:400;letter-spacing:-2px;}
.hero-h1 em{color:var(--flame);font-style:italic;}
.hero-sub{font-size:clamp(15px,1.8vw,20px);color:rgba(255,255,255,.5);margin-bottom:60px;max-width:580px;margin-left:auto;margin-right:auto;line-height:1.6;}

/* ── 4-WAY SPLIT ── */
.split-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;max-width:1160px;margin:0 auto 60px;}
.split-card{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:24px;padding:36px 24px;text-align:center;cursor:pointer;transition:all .35s;text-decoration:none;display:flex;flex-direction:column;align-items:center;gap:14px;position:relative;overflow:hidden;backdrop-filter:blur(10px);}
.split-card::before{content:'';position:absolute;inset:0;opacity:0;transition:opacity .3s;border-radius:20px;}
.split-card:hover{transform:translateY(-6px);border-color:var(--card-color,var(--flame));}
.split-card:hover::before{opacity:1;}
.split-card-events{--card-color:#e8470a;}
.split-card-events::before{background:linear-gradient(135deg,rgba(232,71,10,.12),transparent);}
.split-card-vendors{--card-color:#4a7c59;}
.split-card-vendors::before{background:linear-gradient(135deg,rgba(74,124,89,.12),transparent);}
.split-card-artists{--card-color:#7c3aed;}
.split-card-artists::before{background:linear-gradient(135deg,rgba(124,58,237,.12),transparent);}
.split-card-organisers{--card-color:#f5a623;}
.split-card-organisers::before{background:linear-gradient(135deg,rgba(245,166,35,.12),transparent);}
.split-icon{font-size:48px;display:block;filter:drop-shadow(0 4px 12px rgba(0,0,0,.3));}
.split-label{font-size:18px;font-weight:700;color:var(--white);position:relative;letter-spacing:-.3px;}
.split-desc{font-size:12px;color:rgba(255,255,255,.4);line-height:1.5;position:relative;}
.split-count{font-size:11px;font-weight:700;color:var(--card-color,var(--flame));background:rgba(255,255,255,.07);padding:3px 10px;border-radius:99px;position:relative;}
.split-arrow{font-size:18px;color:var(--card-color,var(--flame));transition:transform .3s;position:relative;}
.split-card:hover .split-arrow{transform:translateX(4px);}

/* ── SEARCH ── */
.hero-search-wrap{max-width:700px;margin:0 auto;}
.hero-search{display:flex;background:var(--white);border-radius:16px;overflow:hidden;box-shadow:0 32px 80px rgba(0,0,0,.5);}
.hero-search-input{flex:1;border:none;outline:none;font-size:17px;font-family:var(--font-body);color:var(--ink2);padding:20px 24px;}
.hero-search-divider{width:1px;background:var(--border);margin:14px 0;flex-shrink:0;}
.hero-search-loc{border:none;outline:none;font-size:15px;font-family:var(--font-body);color:var(--ink2);padding:18px 20px;width:160px;flex-shrink:0;}
.hero-search-btn{background:var(--flame);color:var(--white);border:none;padding:0 36px;font-size:16px;font-weight:700;cursor:pointer;font-family:var(--font-body);transition:background .2s;white-space:nowrap;}
.hero-search-btn:hover{background:var(--flame2);}
.hero-stats{display:flex;justify-content:center;gap:0;margin-top:36px;}
.hstat{padding:14px 28px;text-align:center;border-right:1px solid rgba(255,255,255,.08);}
.hstat:last-child{border-right:none;}
.hstat-n{font-family:var(--font-display);font-size:28px;color:var(--white);display:block;line-height:1;}
.hstat-l{font-size:10px;color:rgba(255,255,255,.35);font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-top:4px;display:block;}

/* ── SECTION ── */
.section{padding:80px 32px;}
.section-inner{max-width:1300px;margin:0 auto;}
.section-top{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:36px;flex-wrap:wrap;gap:16px;}
.section-left{}
.section-tag{display:inline-flex;align-items:center;gap:6px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;padding:4px 14px;border-radius:99px;margin-bottom:12px;}
.tag-flame{background:rgba(232,71,10,.08);border:1px solid rgba(232,71,10,.15);color:var(--flame);}
.tag-green{background:rgba(74,124,89,.08);border:1px solid rgba(74,124,89,.15);color:var(--green);}
.tag-purple{background:rgba(124,58,237,.08);border:1px solid rgba(124,58,237,.15);color:var(--purple);}
.tag-gold{background:rgba(245,166,35,.1);border:1px solid rgba(245,166,35,.25);color:var(--gold2);}
.tag-dark{background:rgba(13,13,13,.06);border:1px solid rgba(13,13,13,.1);color:var(--ink3);}
.section-h{font-family:var(--font-display);font-size:clamp(28px,3.5vw,48px);font-weight:400;color:var(--ink2);line-height:1.1;margin-bottom:8px;}
.section-sub{font-size:14px;color:var(--ink4);line-height:1.65;max-width:480px;}
.section-link{font-size:13px;font-weight:700;color:var(--flame);white-space:nowrap;padding:10px 20px;border:1px solid rgba(232,71,10,.2);border-radius:10px;transition:all .2s;}
.section-link:hover{background:var(--flame);color:var(--white);}
.section-link-green{color:var(--green);border-color:rgba(74,124,89,.2);}
.section-link-green:hover{background:var(--green);}
.section-link-purple{color:var(--purple);border-color:rgba(124,58,237,.2);}
.section-link-purple:hover{background:var(--purple);}

/* ── EVENT CARDS ── */
.events-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px;}
.ecard{background:var(--white);border:1px solid var(--border);border-radius:20px;overflow:hidden;transition:all .3s;cursor:pointer;display:flex;flex-direction:column;}
.ecard:hover{border-color:var(--flame);box-shadow:0 24px 64px rgba(26,22,18,.12);transform:translateY(-5px);}
.ecard-img{height:220px;position:relative;overflow:hidden;flex-shrink:0;}
.ecard-img img{width:100%;height:100%;object-fit:cover;transition:transform .4s;}
.ecard:hover .ecard-img img{transform:scale(1.07);}
.ecard-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(13,13,13,.6) 0%,transparent 55%);}
.ecard-badges{position:absolute;top:12px;left:12px;display:flex;gap:6px;flex-wrap:wrap;}
.ecard-badge{padding:4px 10px;border-radius:99px;font-size:10px;font-weight:700;backdrop-filter:blur(8px);}
.ecard-price{position:absolute;top:12px;right:12px;padding:5px 12px;border-radius:99px;font-size:11px;font-weight:800;backdrop-filter:blur(8px);}
.price-free{background:#dcfce7;color:#15803d;}
.price-paid{background:rgba(13,13,13,.7);color:var(--white);}
.ecard-body{padding:20px;flex:1;display:flex;flex-direction:column;}
.ecard-date{font-size:11px;font-weight:700;color:var(--flame);text-transform:uppercase;letter-spacing:.8px;margin-bottom:8px;}
.ecard-title{font-family:var(--font-display);font-size:20px;color:var(--ink2);margin-bottom:6px;line-height:1.2;flex:1;}
.ecard-loc{font-size:13px;color:var(--ink4);margin-bottom:auto;padding-bottom:14px;}
.ecard-footer{display:flex;justify-content:space-between;align-items:center;padding-top:14px;border-top:1px solid #f0ece4;margin-top:auto;}
.ecard-att{font-size:12px;color:var(--ink5);}
.ecard-cta{font-size:13px;font-weight:700;color:var(--flame);}

/* ── VENDOR CARDS ── */
.vgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px;}
.vcard{background:var(--white);border:1px solid var(--border);border-radius:20px;overflow:hidden;transition:all .3s;text-decoration:none;display:flex;flex-direction:column;position:relative;}
.vcard:hover{border-color:var(--green);box-shadow:0 24px 64px rgba(26,22,18,.1);transform:translateY(-5px);}
.vcard-img{height:190px;position:relative;overflow:hidden;background:var(--cream);}
.vcard-img img{width:100%;height:100%;object-fit:cover;transition:transform .4s;}
.vcard:hover .vcard-img img{transform:scale(1.07);}
.vcard-placeholder{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:52px;background:linear-gradient(135deg,#f5f0e8,#e8e2d9);}

/* ── GOLD BADGE ── */
.badge-gold{background:linear-gradient(135deg,#f5a623,#e8940a);color:var(--white);padding:5px 12px;border-radius:99px;font-size:11px;font-weight:800;display:inline-flex;align-items:center;gap:5px;box-shadow:0 2px 12px rgba(245,166,35,.4);}
.badge-verified{background:var(--green);color:var(--white);padding:5px 12px;border-radius:99px;font-size:11px;font-weight:800;display:inline-flex;align-items:center;gap:5px;}
.badge-free-tier{background:rgba(13,13,13,.08);color:var(--ink4);padding:5px 12px;border-radius:99px;font-size:11px;font-weight:700;}
.vcard-badge-wrap{position:absolute;top:10px;left:10px;}
.vcard-body{padding:18px;flex:1;display:flex;flex-direction:column;}
.vcard-cat{font-size:11px;font-weight:700;color:var(--green);text-transform:uppercase;letter-spacing:.8px;margin-bottom:5px;}
.vcard-name{font-family:var(--font-display);font-size:19px;color:var(--ink2);margin-bottom:4px;}
.vcard-loc{font-size:13px;color:var(--ink4);margin-bottom:10px;}
.vcard-stars{color:var(--flame);letter-spacing:1px;font-size:13px;}
.vcard-footer{display:flex;justify-content:space-between;align-items:center;padding-top:12px;border-top:1px solid #f0ece4;margin-top:auto;}
.vcard-apps{font-size:12px;color:var(--ink5);}
.vcard-cta{font-size:13px;font-weight:700;color:var(--green);}

/* ── ARTIST CATEGORIES ── */
.artist-cats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;}
.acat-card{border-radius:18px;padding:24px 20px;text-decoration:none;display:flex;flex-direction:column;align-items:center;gap:10px;text-align:center;transition:all .3s;border:1px solid transparent;background:var(--cream);}
.acat-card:hover{transform:translateY(-4px);box-shadow:0 16px 48px rgba(26,22,18,.1);border-color:var(--purple);}
.acat-icon{font-size:36px;}
.acat-name{font-size:14px;font-weight:700;color:var(--ink2);}
.acat-desc{font-size:11px;color:var(--ink4);line-height:1.5;}
.acat-cta{font-size:11px;font-weight:700;color:var(--purple);margin-top:4px;}

/* ── PRICING ── */
.pricing-dark{background:var(--ink);padding:80px 32px;}
.pricing-inner{max-width:1100px;margin:0 auto;}
.pricing-header{text-align:center;margin-bottom:52px;}
.pricing-header h2{font-family:var(--font-display);font-size:clamp(28px,4vw,52px);color:var(--white);margin-bottom:12px;font-weight:400;}
.pricing-header p{font-size:16px;color:rgba(255,255,255,.4);max-width:440px;margin:0 auto;}
.pricing-tabs{display:flex;justify-content:center;gap:10px;margin-bottom:40px;}
.ptab{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:rgba(255,255,255,.5);padding:10px 24px;border-radius:99px;font-size:13px;font-weight:700;cursor:pointer;transition:all .2s;font-family:var(--font-body);}
.ptab.active,.ptab:hover{background:var(--flame);border-color:var(--flame);color:var(--white);}
.pricing-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;}
.pcard{border-radius:20px;padding:32px;position:relative;overflow:hidden;}
.pcard-free{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);}
.pcard-standard{background:linear-gradient(145deg,#1a1612,#2d1a08);border:1px solid rgba(232,71,10,.3);}
.pcard-gold{background:linear-gradient(145deg,#1a1200,#2d2000);border:1px solid rgba(245,166,35,.4);}
.pcard-gold::before{content:'';position:absolute;top:-60px;right:-60px;width:200px;height:200px;border-radius:50%;background:radial-gradient(circle,rgba(245,166,35,.2) 0%,transparent 70%);}
.pcard-standard::before{content:'';position:absolute;top:-60px;right:-60px;width:200px;height:200px;border-radius:50%;background:radial-gradient(circle,rgba(232,71,10,.15) 0%,transparent 70%);}
.pcard-popular{position:absolute;top:16px;right:16px;background:var(--flame);color:var(--white);font-size:10px;font-weight:800;padding:3px 12px;border-radius:99px;letter-spacing:.8px;text-transform:uppercase;}
.pcard-badge-display{margin-bottom:18px;}
.pcard-tier{font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;}
.pcard-free .pcard-tier{color:rgba(255,255,255,.4);}
.pcard-standard .pcard-tier{color:#ff7043;}
.pcard-gold .pcard-tier{color:var(--gold);}
.pcard-price{font-family:var(--font-display);font-size:48px;color:var(--white);line-height:1;margin-bottom:4px;}
.pcard-period{font-size:13px;color:rgba(255,255,255,.3);}
.pcard-note{font-size:11px;color:rgba(255,255,255,.25);margin-bottom:24px;margin-top:4px;}
.pcard-feature{display:flex;align-items:flex-start;gap:10px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.05);font-size:13px;color:rgba(255,255,255,.65);}
.pcard-feature:last-of-type{border-bottom:none;}
.pcard-feature-icon{flex-shrink:0;margin-top:1px;}
.pcard-cta{display:block;text-align:center;padding:14px;border-radius:12px;font-size:14px;font-weight:700;margin-top:24px;transition:all .2s;font-family:var(--font-body);}
.pcard-free .pcard-cta{background:rgba(255,255,255,.08);color:rgba(255,255,255,.6);border:1px solid rgba(255,255,255,.1);}
.pcard-free .pcard-cta:hover{background:rgba(255,255,255,.12);color:var(--white);}
.pcard-standard .pcard-cta{background:var(--flame);color:var(--white);}
.pcard-standard .pcard-cta:hover{background:var(--flame2);transform:translateY(-2px);}
.pcard-gold .pcard-cta{background:linear-gradient(135deg,var(--gold),var(--gold2));color:var(--ink);font-weight:800;}
.pcard-gold .pcard-cta:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(245,166,35,.4);}

/* ── ARTICLES ── */
.agrid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px;}
.acard{background:var(--white);border:1px solid var(--border);border-radius:20px;overflow:hidden;text-decoration:none;display:flex;flex-direction:column;transition:all .3s;}
.acard:hover{border-color:var(--flame);box-shadow:0 20px 60px rgba(26,22,18,.1);transform:translateY(-4px);}
.acard-img{height:200px;overflow:hidden;position:relative;}
.acard-img img{width:100%;height:100%;object-fit:cover;transition:transform .4s;}
.acard:hover .acard-img img{transform:scale(1.06);}
.acard-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(13,13,13,.4) 0%,transparent 60%);}
.acard-cat{position:absolute;top:12px;left:12px;padding:4px 12px;border-radius:99px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:var(--white);}
.acard-body{padding:22px;flex:1;display:flex;flex-direction:column;}
.acard-title{font-family:var(--font-display);font-size:20px;color:var(--ink2);margin-bottom:8px;line-height:1.25;flex:1;}
.acard-excerpt{font-size:13px;color:var(--ink4);line-height:1.65;margin-bottom:16px;}
.acard-footer{display:flex;justify-content:space-between;align-items:center;padding-top:14px;border-top:1px solid #f0ece4;}
.acard-date{font-size:11px;color:var(--ink5);}
.acard-cta{font-size:13px;font-weight:700;color:var(--flame);}

/* ── COUNTRIES ── */
.countries-bg{background:var(--cream);}
.cgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:10px;}
.ccard{background:var(--white);border:1px solid var(--border);border-radius:12px;padding:14px;text-decoration:none;text-align:center;transition:all .2s;}
.ccard:hover{border-color:var(--flame);transform:translateY(-2px);}
.cflag{font-size:24px;display:block;margin-bottom:4px;}
.cname{font-size:12px;font-weight:600;color:var(--ink2);display:block;margin-bottom:2px;}
.ccount{font-size:11px;color:var(--ink5);}

/* ── WHY ── */
.why-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:48px;}
.why-card{background:var(--cream);border:1px solid var(--border);border-radius:20px;padding:28px;transition:all .3s;}
.why-card:hover{border-color:var(--flame);box-shadow:0 16px 48px rgba(26,22,18,.07);transform:translateY(-3px);}
.why-icon{font-size:32px;margin-bottom:14px;display:block;}
.why-title{font-size:16px;font-weight:700;color:var(--ink2);margin-bottom:8px;}
.why-desc{font-size:13px;color:var(--ink4);line-height:1.7;}

/* ── FEATURED BANNER ── */
.featured-banner{background:linear-gradient(135deg,#1a0a00,#2d1200);padding:52px 32px;border-bottom:1px solid rgba(232,71,10,.15);}
.fbinner{max-width:1300px;margin:0 auto;}
.fbgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;}
.fbcard{background:rgba(255,255,255,.04);border:1px solid rgba(232,71,10,.2);border-radius:16px;overflow:hidden;text-decoration:none;display:flex;flex-direction:column;transition:all .3s;}
.fbcard:hover{border-color:var(--flame);transform:translateY(-3px);box-shadow:0 16px 48px rgba(232,71,10,.2);}
.fbcard-img{height:160px;overflow:hidden;position:relative;}
.fbcard-img img{width:100%;height:100%;object-fit:cover;transition:transform .4s;}
.fbcard:hover .fbcard-img img{transform:scale(1.06);}
.fbcard-body{padding:16px;flex:1;}
.fbcard-title{font-family:var(--font-display);font-size:17px;color:var(--white);margin-bottom:5px;line-height:1.2;}
.fbcard-meta{font-size:12px;color:rgba(255,255,255,.45);}
.fbcard-cta{font-size:12px;font-weight:700;color:var(--flame);padding:0 16px 14px;}

/* ── URGENCY STRIP ── */
.urgency{background:linear-gradient(135deg,var(--flame),var(--flame2));padding:28px 32px;}
.urgency-inner{max-width:1200px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:20px;}
.urgency h3{font-family:var(--font-display);font-size:22px;color:var(--white);font-weight:400;margin-bottom:4px;}
.urgency p{font-size:13px;color:rgba(255,255,255,.7);}
.urgency-btns{display:flex;gap:10px;flex-wrap:wrap;}
.ubtn-w{background:var(--white);color:var(--flame);padding:12px 24px;border-radius:99px;font-size:13px;font-weight:700;transition:all .2s;}
.ubtn-w:hover{transform:translateY(-2px);}
.ubtn-t{background:rgba(255,255,255,.15);color:var(--white);border:1.5px solid rgba(255,255,255,.4);padding:12px 24px;border-radius:99px;font-size:13px;font-weight:700;}

/* ── TRUST BAR ── */
.trust{background:#111;border-bottom:1px solid rgba(255,255,255,.07);padding:14px 32px;}
.trust-inner{max-width:1200px;margin:0 auto;display:flex;align-items:center;justify-content:center;gap:32px;flex-wrap:wrap;}
.trust-item{display:flex;align-items:center;gap:7px;font-size:12px;font-weight:600;color:rgba(255,255,255,.4);}
.trust-check{color:var(--flame);}

/* ── HOW IT WORKS ── */
.how-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;margin-top:48px;}
.how-step{text-align:center;padding:28px 20px;border:1px solid var(--border);border-radius:18px;background:var(--cream);}
.how-num{width:48px;height:48px;border-radius:50%;background:var(--flame);color:var(--white);display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:800;margin:0 auto 16px;}
.how-icon{font-size:28px;margin-bottom:12px;display:block;}
.how-title{font-size:14px;font-weight:700;color:var(--ink2);margin-bottom:7px;}
.how-desc{font-size:12px;color:var(--ink4);line-height:1.65;}

/* ── NEWSLETTER ── */
.nl-section{background:var(--white);padding:72px 32px;}
.nl-inner{max-width:1000px;margin:0 auto;}
.nl-box{background:linear-gradient(135deg,#0d0d0d,#1a1612);border-radius:24px;padding:52px 48px;display:flex;justify-content:space-between;align-items:center;gap:32px;flex-wrap:wrap;}
.nl-left h2{font-family:var(--font-display);font-size:32px;color:var(--white);font-weight:400;margin-bottom:8px;}
.nl-left p{font-size:14px;color:rgba(255,255,255,.4);max-width:340px;line-height:1.6;}
.nl-form{display:flex;gap:10px;flex-wrap:wrap;}
.nl-input{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.1);color:var(--white);padding:14px 18px;border-radius:10px;font-family:var(--font-body);font-size:14px;outline:none;width:280px;transition:all .2s;}
.nl-input::placeholder{color:rgba(255,255,255,.3);}
.nl-input:focus{border-color:rgba(232,71,10,.5);background:rgba(255,255,255,.1);}
.nl-btn{background:var(--flame);color:var(--white);border:none;padding:14px 24px;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;font-family:var(--font-body);transition:all .2s;white-space:nowrap;}
.nl-btn:hover{background:var(--flame2);}

/* ── TESTIMONIALS ── */
.tgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;}
.tcard{background:var(--white);border:1px solid var(--border);border-radius:16px;padding:24px;}
.tcard-stars{color:var(--flame);font-size:13px;letter-spacing:2px;margin-bottom:12px;}
.tcard-text{font-size:13px;color:var(--ink3);line-height:1.75;margin-bottom:16px;font-style:italic;}
.tcard-author{display:flex;align-items:center;gap:10px;}
.tcard-avatar{width:40px;height:40px;border-radius:50%;background:var(--flame);display:flex;align-items:center;justify-content:center;color:var(--white);font-size:15px;font-weight:700;flex-shrink:0;}
.tcard-name{font-size:13px;font-weight:700;color:var(--ink2);}
.tcard-role{font-size:11px;color:var(--ink5);}

/* ── PROOF STATS ── */
.proof-stats{display:flex;background:var(--white);border:1px solid var(--border);border-radius:20px;overflow:hidden;}
.pstat{flex:1;padding:28px 20px;text-align:center;border-right:1px solid var(--border);}
.pstat:last-child{border-right:none;}
.pstat-n{font-family:var(--font-display);font-size:42px;color:var(--ink2);display:block;line-height:1;}
.pstat-l{font-size:10px;font-weight:700;color:var(--ink5);text-transform:uppercase;letter-spacing:1px;margin-top:5px;display:block;}

/* ── FOOTER ── */
footer{background:var(--ink);padding:60px 32px 32px;}
.footer-inner{max-width:1300px;margin:0 auto;}
.footer-top{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:48px;margin-bottom:48px;padding-bottom:48px;border-bottom:1px solid rgba(255,255,255,.07);}
.footer-brand p{font-size:13px;color:rgba(255,255,255,.35);line-height:1.7;margin-top:12px;max-width:280px;}
.footer-logo{font-family:var(--font-display);font-size:26px;color:var(--white);}
.footer-logo span{color:var(--flame);}
.footer-col h4{font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:rgba(255,255,255,.3);margin-bottom:16px;}
.footer-col a{display:block;color:rgba(255,255,255,.5);font-size:13px;margin-bottom:10px;transition:color .2s;}
.footer-col a:hover{color:var(--white);}
.footer-bottom{display:flex;justify-content:space-between;align-items:center;font-size:12px;color:rgba(255,255,255,.2);flex-wrap:wrap;gap:10px;}

@keyframes blink{0%,100%{opacity:1;transform:scale(1);}50%{opacity:.5;transform:scale(1.3);}}

/* ── RESPONSIVE ── */
@media(max-width:1024px){
  .split-grid{grid-template-columns:repeat(2,1fr);}
  .events-grid,.vgrid,.agrid,.fbgrid,.tgrid{grid-template-columns:repeat(2,1fr);}
  .artist-cats-grid{grid-template-columns:repeat(4,1fr);}
  .pricing-grid{grid-template-columns:1fr;}
  .how-grid{grid-template-columns:repeat(2,1fr);}
  .footer-top{grid-template-columns:1fr 1fr;}
}
@media(max-width:768px){
  .nav-links,.nav-search-wrap{display:none;}
  .nav-burger{display:block;}
  .nav-mobile{display:flex;}
  .hero{padding:60px 20px 40px;min-height:auto;}
  .split-grid{grid-template-columns:repeat(2,1fr);gap:10px;}
  .split-card{padding:20px 14px;}
  .hero-search{flex-direction:column;border-radius:12px;}
  .hero-search-divider{width:100%;height:1px;margin:0;}
  .hero-search-loc{width:100%;}
  .hero-search-btn{padding:16px;text-align:center;}
  .events-grid,.vgrid,.agrid,.artist-cats-grid,.fbgrid,.tgrid{grid-template-columns:1fr;}
  .pricing-grid{grid-template-columns:1fr;}
  .how-grid{grid-template-columns:1fr;}
  .footer-top{grid-template-columns:1fr;}
  .proof-stats{flex-direction:column;}
  .pstat{border-right:none;border-bottom:1px solid var(--border);}
  .nl-box{padding:32px 24px;}
  .nl-input{width:100%;}
  .section{padding:52px 20px;}
}
</style>
</head>
<body>

${renderNav(user, tr, langHtml)}

<!-- ══ HERO ══════════════════════════════════════════════════════════ -->
<section class="hero">
  <div class="hero-bg"></div>
  <div class="hero-gradient"></div>
  <div class="hero-grain"></div>
  <div class="hero-glow"></div>
  <div class="hero-inner">

    <div class="hero-eyebrow">
      <span class="hero-dot"></span>
      The Global Events &amp; Talent Marketplace
    </div>

    <h1 class="hero-h1">
      Events. Vendors.<br/><em>Artists.</em> All in One Place.
    </h1>
    <p class="hero-sub">
      The only platform connecting event organisers, vendors and artists worldwide.
      ${ev}+ events across ${cn} countries.
    </p>

    <!-- 4-WAY SPLIT -->
    <div class="split-grid">
      <a href="/events" class="split-card split-card-events">
        <span class="split-icon">🎪</span>
        <span class="split-label">Events</span>
        <span class="split-desc">Festivals, markets, concerts &amp; more</span>
        <span class="split-count">${ev}+ events</span>
        <span class="split-arrow">→</span>
      </a>
      <a href="/vendors" class="split-card split-card-vendors">
        <span class="split-icon">🏪</span>
        <span class="split-label">Vendors</span>
        <span class="split-desc">Food stalls, craft vendors &amp; services</span>
        <span class="split-count">${vn}+ vendors</span>
        <span class="split-arrow">→</span>
      </a>
      <a href="/artists" class="split-card split-card-artists">
        <span class="split-icon">🎤</span>
        <span class="split-label">Artists</span>
        <span class="split-desc">Musicians, DJs, comedians &amp; more</span>
        <span class="split-count">All genres</span>
        <span class="split-arrow">→</span>
      </a>
      <a href="/events/submit" class="split-card split-card-organisers">
        <span class="split-icon">📋</span>
        <span class="split-label">Organisers</span>
        <span class="split-desc">List your event &amp; find vendors</span>
        <span class="split-count">Free to start</span>
        <span class="split-arrow">→</span>
      </a>
    </div>

    <!-- SEARCH -->
    <div class="hero-search-wrap">
      <form class="hero-search" action="/events" method="GET">
        <input class="hero-search-input" type="text" name="q" placeholder="🔍  Search festivals, markets, concerts…"/>
        <div class="hero-search-divider"></div>
        <input class="hero-search-loc" type="text" name="city" placeholder="📍 City or country"/>
        <button class="hero-search-btn" type="submit">Search</button>
      </form>
    </div>

    <!-- STATS -->
    <div class="hero-stats">
      <div class="hstat"><span class="hstat-n">${ev}+</span><span class="hstat-l">Events</span></div>
      <div class="hstat"><span class="hstat-n">${vn}+</span><span class="hstat-l">Vendors</span></div>
      <div class="hstat"><span class="hstat-n">${cn}</span><span class="hstat-l">Countries</span></div>
      <div class="hstat"><span class="hstat-n">${sb}+</span><span class="hstat-l">Subscribers</span></div>
      <div class="hstat"><span class="hstat-n">${ar}+</span><span class="hstat-l">Articles</span></div>
    </div>

  </div>
</section>

<!-- ══ TRUST BAR ══════════════════════════════════════════════════════ -->
<div class="trust">
  <div class="trust-inner">
    ${['Free Event Listings','Verified Vendors','Gold Badge Artists',cn+' Countries','Secure Stripe Payments','Direct Applications'].map(t => `<div class="trust-item"><span class="trust-check">✓</span>${t}</div>`).join('')}
  </div>
</div>

<!-- ══ FEATURED EVENTS ════════════════════════════════════════════════ -->
${featuredEvents.length > 0 ? `
<section class="featured-banner">
  <div class="fbinner">
    <div class="section-top" style="margin-bottom:24px;">
      <div>
        <div class="section-tag tag-flame">⭐ Featured Events</div>
        <h2 style="font-family:var(--font-display);font-size:32px;color:var(--white);font-weight:400;">Promoted by Organisers</h2>
      </div>
      <a href="/events?sort=featured" style="font-size:13px;font-weight:700;color:#ff7043;">View all featured →</a>
    </div>
    <div class="fbgrid">
      ${featuredEvents.map(e => `
      <a href="/events/${e.slug}" class="fbcard">
        <div class="fbcard-img"><img src="${e.image_url || IMGS[e.category] || IMGS.festival}" alt="${e.title}" loading="lazy"/></div>
        <div class="fbcard-body">
          <div class="fbcard-title">${e.title}</div>
          <div class="fbcard-meta">${FLAGS[e.country]||'🌍'} ${e.city} · ${e.date_display||e.start_date}</div>
        </div>
        <div class="fbcard-cta">View event →</div>
      </a>`).join('')}
    </div>
    <p style="text-align:center;margin-top:20px;font-size:12px;color:rgba(255,255,255,.3);">Want your event featured? <a href="/events/pricing" style="color:#ff7043;font-weight:700;">Upgrade to Featured — €79/yr →</a></p>
  </div>
</section>` : ''}

<!-- ══ EVENTS ════════════════════════════════════════════════════════ -->
<section class="section" style="background:var(--cream);">
  <div class="section-inner">
    <div class="section-top">
      <div>
        <div class="section-tag tag-flame">🔥 Must-See Events</div>
        <h2 class="section-h">Events You Cannot Miss</h2>
        <p class="section-sub">The world's biggest festivals, markets and concerts — all in one place</p>
      </div>
      <a href="/events" class="section-link">View all ${ev}+ events →</a>
    </div>
    <div class="events-grid">
      ${topEvents.map(e => eventCard(e)).join('')}
    </div>
    <div style="text-align:center;margin-top:36px;">
      <a href="/events" style="display:inline-flex;align-items:center;gap:10px;background:var(--flame);color:var(--white);padding:16px 48px;border-radius:12px;font-size:16px;font-weight:700;text-decoration:none;box-shadow:0 8px 32px rgba(232,71,10,.3);">
        Browse All ${ev}+ Events →
      </a>
    </div>
  </div>
</section>

<!-- ══ VENDORS ════════════════════════════════════════════════════════ -->
<section class="section" style="background:var(--white);">
  <div class="section-inner">
    <div class="section-top">
      <div>
        <div class="section-tag tag-green">🏪 Verified Vendors</div>
        <h2 class="section-h">Find the Perfect Vendor</h2>
        <p class="section-sub">Food trucks, artisan crafts, entertainment services and more — ready to make your event unforgettable</p>
      </div>
      <a href="/vendors" class="section-link section-link-green">View all ${vn}+ vendors →</a>
    </div>

    ${vendors.length > 0 ? `
    <div class="vgrid">
      ${vendors.map(v => {
        let photos = []; try { photos = JSON.parse(v.photos||'[]'); } catch(e) {}
        const photo = photos[0] || v.image_url || '';
        const rating = parseFloat(v.avg_rating) || 5.0;
        const stars = '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
        const isGold = v.payment_status === 'gold';
        const apps = parseInt(v.total_applications) || 0;
        return `<a href="/vendors/profile/${v.id}" class="vcard">
          <div class="vcard-img">
            ${photo ? `<img src="${photo}" alt="${v.business_name}" loading="lazy"/>` : `<div class="vcard-placeholder">🏪</div>`}
            <div class="vcard-badge-wrap">
              ${isGold ? `<span class="badge-gold">🥇 Gold Verified</span>` : `<span class="badge-verified">✅ Verified</span>`}
            </div>
          </div>
          <div class="vcard-body">
            <div class="vcard-cat">${v.category||'Vendor'}</div>
            <div class="vcard-name">${v.business_name}</div>
            <div class="vcard-loc">📍 ${v.city}${v.country?', '+(COUNTRY_NAMES[v.country]||v.country):''}</div>
            <div class="vcard-stars">${stars} <span style="font-size:12px;color:var(--ink4);font-family:var(--font-body);">${rating.toFixed(1)}</span></div>
            <div class="vcard-footer">
              <span class="vcard-apps">${apps > 0 ? apps+' applications' : 'New vendor'}</span>
              <span class="vcard-cta">View profile →</span>
            </div>
          </div>
        </a>`;
      }).join('')}
    </div>` : `
    <div style="background:var(--cream);border:1px solid var(--border);border-radius:20px;padding:48px;text-align:center;">
      <div style="font-size:52px;margin-bottom:16px;">🏪</div>
      <h3 style="font-family:var(--font-display);font-size:26px;margin-bottom:8px;">Be the First Verified Vendor</h3>
      <p style="color:var(--ink4);margin-bottom:24px;">Join Festmore and get discovered by organisers across ${cn} countries.</p>
      <a href="/vendors/register" style="display:inline-block;background:var(--green);color:var(--white);padding:14px 32px;border-radius:12px;font-size:15px;font-weight:700;">Register as Vendor — €49/yr</a>
    </div>`}

    <div style="text-align:center;margin-top:36px;">
      <a href="/vendors/register" style="display:inline-flex;align-items:center;gap:10px;background:var(--green);color:var(--white);padding:16px 40px;border-radius:12px;font-size:15px;font-weight:700;text-decoration:none;box-shadow:0 8px 32px rgba(74,124,89,.3);">
        🏪 Become a Vendor
      </a>
      <span style="display:inline-block;margin:0 16px;color:var(--ink5);font-size:14px;">or</span>
      <a href="/vendors" style="display:inline-flex;align-items:center;gap:10px;background:var(--cream);color:var(--green);border:2px solid var(--green);padding:16px 40px;border-radius:12px;font-size:15px;font-weight:700;text-decoration:none;">
        Browse All Vendors →
      </a>
    </div>
    <div style="text-align:center;margin-top:12px;font-size:12px;color:var(--ink5);">Food Trucks · Artisan Crafts · Entertainment · Market Stalls · Photography · Catering</div>
  </div>
</section>

<!-- ══ ARTISTS ════════════════════════════════════════════════════════ -->
<section class="section" style="background:linear-gradient(135deg,#0d0820 0%,#1a1035 100%);">
  <div class="section-inner">
    <div class="section-top">
      <div>
        <div class="section-tag tag-purple">🎤 Artists &amp; Performers</div>
        <h2 class="section-h" style="color:var(--white);">Book Incredible Talent</h2>
        <p class="section-sub" style="color:rgba(255,255,255,.45);">Musicians, DJs, comedians, painters, dancers and more — browse verified artists from ${cn} countries</p>
      </div>
      <a href="/artists" class="section-link section-link-purple" style="border-color:rgba(124,58,237,.3);color:#a78bfa;">View all artists →</a>
    </div>

    <!-- ARTIST SUBCATEGORIES -->
    <div class="artist-cats-grid" style="margin-bottom:40px;">
      ${[
        {icon:'🎵',name:'Musicians & Bands',desc:'Live music for every occasion',slug:'musicians'},
        {icon:'🎛️',name:'DJs',desc:'Electronic, house, pop & more',slug:'djs'},
        {icon:'🎭',name:'Comedians',desc:'Stand-up & improv performers',slug:'comedians'},
        {icon:'🎨',name:'Visual Artists',desc:'Live painting & illustration',slug:'painters'},
        {icon:'💃',name:'Dancers',desc:'Dance groups & performers',slug:'dancers'},
        {icon:'📸',name:'Photographers',desc:'Event & festival photography',slug:'photographers'},
        {icon:'🎪',name:'Circus & Street',desc:'Fire, acrobatics & street acts',slug:'circus'},
        {icon:'🎙️',name:'Hosts & MCs',desc:'Presenters & event hosts',slug:'hosts'},
      ].map(c => `
      <a href="/artists?type=${c.slug}" class="acat-card" style="background:rgba(255,255,255,.04);border-color:rgba(255,255,255,.08);">
        <span class="acat-icon">${c.icon}</span>
        <span class="acat-name" style="color:var(--white);">${c.name}</span>
        <span class="acat-desc" style="color:rgba(255,255,255,.4);">${c.desc}</span>
        <span class="acat-cta" style="color:#a78bfa;">Browse →</span>
      </a>`).join('')}
    </div>

    <div style="text-align:center;">
      <a href="/artists" style="display:inline-flex;align-items:center;gap:10px;background:var(--purple);color:var(--white);padding:16px 40px;border-radius:12px;font-size:15px;font-weight:700;text-decoration:none;box-shadow:0 8px 32px rgba(124,58,237,.35);">
        🔍 Browse All Artists
      </a>
      <span style="display:inline-block;margin:0 16px;color:rgba(255,255,255,.3);font-size:14px;">or</span>
      <a href="/artists/register" style="display:inline-flex;align-items:center;gap:10px;background:rgba(255,255,255,.08);color:var(--white);border:2px solid rgba(255,255,255,.2);padding:16px 40px;border-radius:12px;font-size:15px;font-weight:700;text-decoration:none;">
        🎤 List Your Act Free
      </a>
    </div>
  </div>
</section>

<!-- ══ PRICING ════════════════════════════════════════════════════════ -->
<section class="pricing-dark">
  <div class="pricing-inner">
    <div class="pricing-header">
      <div class="section-tag tag-gold" style="margin-bottom:16px;">💰 Transparent Pricing</div>
      <h2>Simple Plans. Real Results.</h2>
      <p>Start free. Upgrade when you're ready. No hidden fees.</p>
    </div>

    <!-- VENDOR PRICING -->
    <h3 style="font-family:var(--font-display);font-size:22px;color:rgba(255,255,255,.6);font-weight:400;text-align:center;margin-bottom:24px;">For Vendors &amp; Artists</h3>
    <div class="pricing-grid" style="margin-bottom:52px;">

      <div class="pcard pcard-free">
        <div class="pcard-tier">Free</div>
        <div class="pcard-badge-display"><span class="badge-free-tier">No badge</span></div>
        <div class="pcard-price">€0</div>
        <div class="pcard-note">Forever free</div>
        ${['Business name & category','City & country','Basic profile visible','Browse events'].map(f => `<div class="pcard-feature"><span class="pcard-feature-icon">○</span>${f}</div>`).join('')}
        <a href="/vendors/register" class="pcard-cta">Get Started Free</a>
      </div>

      <div class="pcard pcard-standard">
        <div class="pcard-popular">Most Popular</div>
        <div class="pcard-tier">Standard</div>
        <div class="pcard-badge-display"><span class="badge-verified">✅ Verified</span></div>
        <div class="pcard-price">€49</div>
        <div class="pcard-period">/year · less than €5/month</div>
        <div class="pcard-note">One booking pays for years</div>
        ${['Blue Verified badge on profile','Full profile with photos & bio','Your website link displayed','Apply directly to events','Appear in vendor search','Weekly newsletter inclusion'].map(f => `<div class="pcard-feature"><span class="pcard-feature-icon" style="color:#4a7c59;">✅</span>${f}</div>`).join('')}
        <a href="/vendors/register" class="pcard-cta">Get Verified — €49/yr</a>
      </div>

      <div class="pcard pcard-gold">
        <div class="pcard-tier">Gold</div>
        <div class="pcard-badge-display"><span class="badge-gold">🥇 Gold Verified</span></div>
        <div class="pcard-price">€99</div>
        <div class="pcard-period">/year · less than €9/month</div>
        <div class="pcard-note">Maximum visibility &amp; trust</div>
        ${['Gold badge — stands out instantly','Priority placement in search','Featured on homepage','Dedicated profile page','Direct contact button','Analytics dashboard','All Standard features included'].map(f => `<div class="pcard-feature"><span class="pcard-feature-icon" style="color:var(--gold);">🥇</span>${f}</div>`).join('')}
        <a href="/vendors/register" class="pcard-cta">Get Gold — €99/yr</a>
      </div>

    </div>

    <!-- ORGANISER PRICING -->
    <h3 style="font-family:var(--font-display);font-size:22px;color:rgba(255,255,255,.6);font-weight:400;text-align:center;margin-bottom:24px;">For Event Organisers</h3>
    <div class="pricing-grid">

      <div class="pcard pcard-free">
        <div class="pcard-tier">Free Listing</div>
        <div class="pcard-price">€0</div>
        <div class="pcard-note">Always free to list</div>
        ${['Event page with full details','Vendor applications inbox','Appear in search results','SEO page on Festmore'].map(f => `<div class="pcard-feature"><span class="pcard-feature-icon">○</span>${f}</div>`).join('')}
        <a href="/events/submit" class="pcard-cta">List Event Free</a>
      </div>

      <div class="pcard pcard-standard">
        <div class="pcard-popular">Best Value</div>
        <div class="pcard-tier">Featured</div>
        <div class="pcard-price">€79</div>
        <div class="pcard-period">/year per event</div>
        <div class="pcard-note">Appear above free listings</div>
        ${['Featured tag on event card','Homepage banner placement','Priority in search results','Newsletter to '+sb+'+ subscribers','Vendor application priority','All Free features'].map(f => `<div class="pcard-feature"><span class="pcard-feature-icon" style="color:var(--flame);">✅</span>${f}</div>`).join('')}
        <a href="/events/pricing" class="pcard-cta">Get Featured — €79/yr</a>
      </div>

      <div class="pcard pcard-gold">
        <div class="pcard-tier">Premium</div>
        <div class="pcard-price">€149</div>
        <div class="pcard-period">/year per event</div>
        <div class="pcard-note">Maximum event exposure</div>
        ${['Gold border on event card','Top of all search results','Social media promotion','Dedicated event article','Organiser verified badge','All Featured features'].map(f => `<div class="pcard-feature"><span class="pcard-feature-icon" style="color:var(--gold);">🥇</span>${f}</div>`).join('')}
        <a href="/events/pricing" class="pcard-cta">Go Premium — €149/yr</a>
      </div>

    </div>
  </div>
</section>

<!-- ══ WHY FESTMORE ══════════════════════════════════════════════════ -->
<section class="section" style="background:var(--white);">
  <div class="section-inner">
    <div style="text-align:center;margin-bottom:16px;">
      <div class="section-tag tag-dark" style="margin-bottom:12px;">Why Festmore</div>
      <h2 class="section-h" style="text-align:center;">Better Than Any Alternative</h2>
      <p style="font-size:15px;color:var(--ink4);max-width:500px;margin:0 auto;line-height:1.75;">The only platform built for everyone in the live events industry — all in one place.</p>
    </div>
    <div class="why-grid">
      ${[
        ['🌍','${cn} Countries','The largest event discovery platform in Europe with events from Sweden to Thailand, USA to Australia.'],
        ['🥇','Gold Badge System','Stand out instantly with our Gold Verified badge — the mark that organisers and visitors trust most.'],
        ['🔍','Ranks on Google','Every listing gets its own SEO-optimised page. Get found directly on Google by people searching right now.'],
        ['🏪','Direct Applications','Vendors apply to events, organisers review profiles — no agency fees, no middleman, direct connections.'],
        ['🎤','All Artist Types','Musicians, DJs, comedians, painters, dancers, photographers — every performance category covered.'],
        ['📊','Real Analytics','See exactly how many people view your listing, where they come from and which events are growing fastest.'],
      ].map(([icon,title,desc]) => `<div class="why-card"><span class="why-icon">${icon}</span><div class="why-title">${title.replace('${cn}', cn)}</div><div class="why-desc">${desc}</div></div>`).join('')}
    </div>
  </div>
</section>

<!-- ══ HOW IT WORKS ══════════════════════════════════════════════════ -->
<section class="section" style="background:var(--cream);">
  <div class="section-inner">
    <div style="text-align:center;">
      <div class="section-tag tag-dark">How It Works</div>
      <h2 class="section-h" style="text-align:center;">Up and Running in Minutes</h2>
    </div>
    <div class="how-grid">
      ${[
        ['1','📝','Create Your Profile','Vendors, artists and organisers each get their own profile type. Takes under 5 minutes.'],
        ['2','🔍','Get Discovered','Your profile appears in search results across ${cn} countries instantly.'],
        ['3','📩','Connect Directly','Vendors apply to events. Organisers browse talent. Direct messaging, no middleman.'],
        ['4','📈','Grow Together','More bookings for vendors, better events for organisers. The platform grows with you.'],
      ].map(([n,icon,title,desc]) => `<div class="how-step"><div class="how-num">${n}</div><span class="how-icon">${icon}</span><div class="how-title">${title}</div><div class="how-desc">${desc.replace('${cn}', cn)}</div></div>`).join('')}
    </div>
  </div>
</section>

<!-- ══ SOCIAL PROOF ══════════════════════════════════════════════════ -->
<section class="section" style="background:var(--white);">
  <div class="section-inner" style="text-align:center;">
    <div class="section-tag tag-dark" style="margin-bottom:12px;">By the Numbers</div>
    <h2 class="section-h" style="text-align:center;margin-bottom:36px;">A Platform You Can Trust</h2>
    <div class="proof-stats" style="margin-bottom:48px;">
      <div class="pstat"><span class="pstat-n">${ev}+</span><span class="pstat-l">Events</span></div>
      <div class="pstat"><span class="pstat-n">${vn}+</span><span class="pstat-l">Vendors</span></div>
      <div class="pstat"><span class="pstat-n">${cn}</span><span class="pstat-l">Countries</span></div>
      <div class="pstat"><span class="pstat-n">${sb}+</span><span class="pstat-l">Subscribers</span></div>
      <div class="pstat"><span class="pstat-n">${ar}+</span><span class="pstat-l">Articles</span></div>
    </div>
    <div class="tgrid">
      ${[
        ['M','Marcus Weber','Event Organiser, Berlin','"Festmore gave our Christmas market incredible visibility. We received vendor applications within the first week of listing."'],
        ['A','Anna Lindqvist','Street Food Vendor, Sweden','"Finding the right events used to take hours of emailing. Festmore makes it effortless — I found 3 new bookings in my first month."'],
        ['P','Pieter van den Berg','Market Organiser, Amsterdam','"The vendor marketplace is genuinely useful. We found exactly the food vendors we needed for our spring market in minutes."'],
      ].map(([i,n,r,q]) => `<div class="tcard"><div class="tcard-stars">★★★★★</div><div class="tcard-text">${q}</div><div class="tcard-author"><div class="tcard-avatar">${i}</div><div><div class="tcard-name">${n}</div><div class="tcard-role">${r}</div></div></div></div>`).join('')}
    </div>
  </div>
</section>

<!-- ══ ARTICLES ════════════════════════════════════════════════════════ -->
${articles.length ? `
<section class="section" style="background:var(--cream);">
  <div class="section-inner">
    <div class="section-top">
      <div>
        <div class="section-tag tag-flame">📰 Latest Articles</div>
        <h2 class="section-h">Guides &amp; Inspiration</h2>
        <p class="section-sub">Expert guides for vendors, organisers and festival lovers</p>
      </div>
      <a href="/articles" class="section-link">Read all ${ar}+ articles →</a>
    </div>
    <div class="agrid">
      ${articles.map(a => {
        const catColors = {festival:'#4a7c59',guide:'#c9922a',christmas:'#1a6b8a',market:'#7c4a59',default:'var(--flame)'};
        const cc = catColors[a.category] || catColors.default;
        const ds = new Date(a.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});
        return `<a href="/articles/${a.slug}" class="acard">
          <div class="acard-img"><img src="${a.image_url||IMGS.festival}" alt="${a.title}" loading="lazy"/><div class="acard-overlay"></div><span class="acard-cat" style="background:${cc};">${a.category||'Guide'}</span></div>
          <div class="acard-body">
            <h3 class="acard-title">${a.title}</h3>
            <p class="acard-excerpt">${(a.excerpt||'').substring(0,110)}…</p>
            <div class="acard-footer"><span class="acard-date">${ds}</span><span class="acard-cta">Read more →</span></div>
          </div>
        </a>`;
      }).join('')}
    </div>
  </div>
</section>` : ''}

<!-- ══ COUNTRIES ═════════════════════════════════════════════════════ -->
<section class="section countries-bg">
  <div class="section-inner">
    <div class="section-top">
      <div>
        <div class="section-tag tag-dark">🌍 ${cn} Countries</div>
        <h2 class="section-h">Browse by Country</h2>
        <p class="section-sub">Events and vendors from across Europe, Americas, Asia and beyond</p>
      </div>
    </div>
    <div class="cgrid">
      ${countryCounts.map(c => `<a href="/events?country=${c.country}" class="ccard"><span class="cflag">${FLAGS[c.country]||'🌍'}</span><span class="cname">${COUNTRY_NAMES[c.country]||c.country}</span><span class="ccount">${c.count} events</span></a>`).join('')}
    </div>
  </div>
</section>

<!-- ══ NEWSLETTER ═════════════════════════════════════════════════════ -->
<section class="nl-section">
  <div class="nl-inner">
    <div class="nl-box">
      <div class="nl-left">
        <h2>Stay in the Loop</h2>
        <p>New events, vendor opportunities and festival guides delivered weekly to ${sb}+ subscribers.</p>
      </div>
      <form class="nl-form" id="newsletter-form">
        <input type="email" name="email" placeholder="Your email address" required class="nl-input"/>
        <button type="submit" class="nl-btn">Subscribe Free →</button>
      </form>
    </div>
  </div>
</section>

<!-- ══ URGENCY CTA ════════════════════════════════════════════════════ -->
<div class="urgency">
  <div class="urgency-inner">
    <div>
      <h3>Ready to Join ${ev}+ Events &amp; ${vn}+ Vendors?</h3>
      <p>Start free today — no credit card required. Upgrade whenever you're ready.</p>
    </div>
    <div class="urgency-btns">
      <a href="/events/submit" class="ubtn-w">List Your Event Free</a>
      <a href="/vendors/register" class="ubtn-t">Become a Vendor</a>
    </div>
  </div>
</div>

${renderFooter(stats, tr)}

<script>
document.getElementById('newsletter-form').addEventListener('submit', function(e) {
  e.preventDefault();
  var data = {};
  new FormData(e.target).forEach(function(v, k) { data[k] = v; });
  fetch('/newsletter/subscribe', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) })
    .then(r => r.json())
    .then(json => {
      if (json.ok) {
        document.getElementById('newsletter-form').innerHTML = '<p style="color:#4a7c59;font-weight:700;font-size:16px;padding:12px 0;">✅ You\'re subscribed! Welcome to Festmore.</p>';
      } else { alert(json.msg); }
    });
});
</script>
</body></html>`;
}

// ─── EVENT CARD ───────────────────────────────────────────────────────────────
function eventCard(e) {
  const img = e.image_url || IMGS[e.category] || IMGS.festival;
  const flag = FLAGS[e.country] || '';
  const icon = CATS[e.category] || '🎪';
  const isFree = e.price_display === 'Free' || e.price_display === 'Free Entry';
  const price = isFree ? '🟢 Free' : (e.price_display || 'See website');
  return `<article class="ecard" onclick="window.location='/events/${e.slug}'">
  <div class="ecard-img">
    <img src="${img}" alt="${e.title}" loading="lazy"/>
    <div class="ecard-overlay"></div>
    <div class="ecard-badges">
      ${e.featured ? '<span class="ecard-badge" style="background:var(--flame);color:var(--white);">★ Featured</span>' : ''}
      <span class="ecard-badge" style="background:rgba(0,0,0,.55);color:var(--white);">${icon} ${e.category}</span>
    </div>
    <div class="ecard-price ${isFree?'price-free':'price-paid'}">${price}</div>
  </div>
  <div class="ecard-body">
    <div class="ecard-date">${e.date_display || e.start_date || ''}</div>
    <h3 class="ecard-title">${e.title}</h3>
    <div class="ecard-loc">📍 ${e.city}${e.country ? ', '+(COUNTRY_NAMES[e.country]||e.country) : ''} ${flag}</div>
    <div class="ecard-footer">
      <span class="ecard-att">${e.attendees ? '👥 '+parseInt(e.attendees).toLocaleString() : ''}</span>
      <span class="ecard-cta">View details →</span>
    </div>
  </div>
</article>`;
}

function eventCardHTML(e) {
  const img = e.image_url || IMGS[e.category] || IMGS.festival;
  const flag = FLAGS[e.country] || '';
  const icon = CATS[e.category] || '';
  const isFree = e.price_display === 'Free';
  const isFL = e.payment_status === 'free';
  return `<article class="event-card"><a href="/events/${e.slug}">
    <div class="event-img"><img src="${img}" alt="${e.title}" loading="lazy"/><div class="event-img-overlay"></div>
      <div class="event-badges">
        ${e.featured ? '<span class="badge badge-feat">★ Featured</span>' : ''}
        <span class="badge badge-cat">${icon} ${e.category}</span>
        ${isFree ? '<span class="badge badge-free">Free</span>' : ''}
        ${isFL ? '<span class="badge" style="background:rgba(0,0,0,.4);color:#fff;">🔓 Unverified</span>' : '<span class="badge" style="background:#4a7c59;color:#fff;">✅ Verified</span>'}
      </div>
    </div>
    <div class="event-body">
      <div class="event-date">${e.date_display||e.start_date}</div>
      <h3>${e.title}</h3>
      <div class="event-loc">${flag} ${e.city}</div>
      <div class="event-footer">
        <span class="event-stat">${(e.attendees||0).toLocaleString()} visitors</span>
        <span class="event-price ${isFree?'price-free':'price-paid'}">${e.price_display}</span>
      </div>
    </div>
  </a></article>`;
}

function renderNav(user, tr, langHtml) {
  const userLinks = user
    ? `<a href="/dashboard" class="nav-btn" style="background:rgba(255,255,255,.1);">Dashboard</a><a href="/auth/logout" class="nav-link">Logout</a>`
    : `<a href="/auth/login" class="nav-link">Login</a><a href="/events/submit" class="nav-btn">+ List Free</a>`;
  return `<nav class="nav">
    <div class="nav-inner">
      <a href="/" class="nav-logo"><span>Fest</span>more</a>
      <div class="nav-search-wrap">
        <form class="nav-search" action="/events" method="GET">
          <span style="color:rgba(255,255,255,.35);font-size:14px;">🔍</span>
          <input type="text" name="q" placeholder="Search events, vendors, artists…"/>
        </form>
      </div>
      <div class="nav-links">
        <a href="/events" class="nav-link">Events</a>
        <a href="/vendors" class="nav-link">Vendors</a>
        <a href="/artists" class="nav-link">Artists</a>
        <a href="/articles" class="nav-link">Articles</a>
        ${langHtml}
        ${userLinks}
      </div>
      <button class="nav-burger" onclick="document.querySelector('.nav-mobile').classList.toggle('open')" aria-label="Menu">☰</button>
    </div>
    <div class="nav-mobile">
      <a href="/events">🎪 Events</a>
      <a href="/vendors">🏪 Vendors</a>
      <a href="/artists">🎤 Artists</a>
      <a href="/articles">📰 Articles</a>
      <a href="/events/submit">+ List Event Free</a>
      <a href="/vendors/register">Become a Vendor — €49/yr</a>
      <a href="/artists/register">List Your Act Free</a>
      ${user ? `<a href="/dashboard">Dashboard</a><a href="/auth/logout">Logout</a>` : `<a href="/auth/login">Login</a>`}
    </div>
  </nav>`;
}

function renderFooter(stats, tr) {
  return `<footer>
    <div class="footer-inner">
      <div class="footer-top">
        <div class="footer-brand">
          <div class="footer-logo"><span>Fest</span>more</div>
          <p>The global marketplace connecting event organisers, vendors and artists. ${stats.events}+ events across ${stats.countries} countries worldwide.</p>
        </div>
        <div class="footer-col">
          <h4>For Organisers</h4>
          <a href="/events/submit">List Event Free</a>
          <a href="/events/pricing">Pricing</a>
          <a href="/vendors">Find Vendors</a>
          <a href="/artists">Find Artists</a>
          <a href="/events">Browse Events</a>
        </div>
        <div class="footer-col">
          <h4>For Vendors</h4>
          <a href="/vendors/register">Register — €49/yr</a>
          <a href="/vendors">Browse Vendors</a>
          <a href="/artists/register">List Artist — Free</a>
          <a href="/contact">Contact Us</a>
        </div>
        <div class="footer-col">
          <h4>Company</h4>
          <a href="/about">About</a>
          <a href="/articles">Articles</a>
          <a href="/contact">Contact</a>
          <a href="/privacy">Privacy Policy</a>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© ${new Date().getFullYear()} Festmore.com — All rights reserved</span>
        <span>${stats.events}+ Events · ${stats.vendors}+ Vendors · ${stats.countries} Countries</span>
      </div>
    </div>
  </footer>`;
}

module.exports.renderNav     = renderNav;
module.exports.renderFooter  = renderFooter;
module.exports.eventCardHTML = eventCardHTML;
module.exports.fmEventCard   = eventCard;
module.exports.IMGS          = IMGS;
module.exports.FLAGS         = FLAGS;
module.exports.CATS          = CATS;
module.exports.COUNTRY_NAMES = COUNTRY_NAMES;
