// routes/home.js — FESTMORE v4 — THE MARKETPLACE
// ✅ "Wanted" postings front and centre
// ✅ Premium magazine feel — 3 clear audiences
// ✅ Artists spotlighted properly
// ✅ Vendors with real commercial context
// ✅ All existing DB, Stripe, cache preserved

const express = require('express');
const router  = express.Router();
const db      = require('../db');
const { t, getLang, langSwitcher } = require('../utils/i18n');

// ─── PRE-COMPILE STATEMENTS ───────────────────────────────────────────────────
const stmts = {
  topEvents:      db.prepare(`SELECT id,title,slug,category,city,country,start_date,date_display,price_display,image_url,attendees,featured,payment_status FROM events WHERE status='active' ORDER BY featured DESC, attendees DESC, id DESC LIMIT 6`),
  wantedEvents:   db.prepare(`SELECT id,title,slug,category,city,country,start_date,date_display,attendees,vendor_spots,image_url,payment_status,featured FROM events WHERE status='active' AND vendor_spots > 0 ORDER BY featured DESC, CASE payment_status WHEN 'premium' THEN 3 WHEN 'standard' THEN 2 WHEN 'featured' THEN 2 ELSE 1 END DESC, attendees DESC, id DESC LIMIT 6`),
  featuredPaid:   db.prepare(`SELECT id,title,slug,category,city,country,start_date,date_display,attendees,image_url,payment_status FROM events WHERE status='active' AND (payment_status IN ('standard','premium','featured') OR featured=1) ORDER BY CASE payment_status WHEN 'premium' THEN 3 WHEN 'standard' THEN 2 ELSE 1 END DESC, attendees DESC LIMIT 3`),
  artists:        db.prepare(`SELECT id,name,slug,genre,city,country,image_url,fee_display,payment_status,verified FROM artists WHERE status='active' ORDER BY payment_status DESC, verified DESC, id DESC LIMIT 8`),
  vendors:        db.prepare(`SELECT id,business_name,category,city,country,avg_rating,total_applications,photos,image_url,payment_status FROM vendors WHERE status='active' AND payment_status='paid' ORDER BY avg_rating DESC, id DESC LIMIT 6`),
  articles:       db.prepare(`SELECT id,title,slug,excerpt,image_url,category,created_at FROM articles WHERE status='published' ORDER BY created_at DESC LIMIT 3`),
  countryCounts:  db.prepare(`SELECT country, COUNT(*) as count FROM events WHERE status='active' GROUP BY country ORDER BY count DESC LIMIT 30`),
  statsEvents:    db.prepare(`SELECT COUNT(*) as n FROM events WHERE status='active'`),
  statsVendors:   db.prepare(`SELECT COUNT(*) as n FROM vendors WHERE status='active'`),
  statsArticles:  db.prepare(`SELECT COUNT(*) as n FROM articles WHERE status='published'`),
  statsSubs:      db.prepare(`SELECT COUNT(*) as n FROM subscribers WHERE active=1`),
};

let _cache = null, _cacheTime = 0;
const TTL = 30 * 1000;
function getStats() {
  const now = Date.now();
  if (_cache && (now - _cacheTime) < TTL) return _cache;
  _cache = {
    events:      stmts.statsEvents.get().n,
    vendors:     stmts.statsVendors.get().n,
    articles:    stmts.statsArticles.get().n,
    subscribers: stmts.statsSubs.get().n,
  };
  _cacheTime = now;
  return _cache;
}

router.get('/', (req, res) => {
  const stats        = getStats();
  const topEvents    = stmts.topEvents.all();
  const wantedEvents = stmts.wantedEvents.all();
  let featuredPaid = [];
  try { featuredPaid = stmts.featuredPaid.all(); } catch(e) {}
  const artists      = stmts.artists.all();
  const vendors      = stmts.vendors.all();
  const articles     = stmts.articles.all();
  const countries    = stmts.countryCounts.all();
  const lang         = getLang(req);
  const langHtml     = langSwitcher(req);
  res.send(render({ stats, topEvents, wantedEvents, featuredPaid, artists, vendors, articles, countries, user: req.session.user, lang, langHtml }));
});

router.get('/set-lang/:lang', (req, res) => {
  if (req.session) req.session.lang = req.params.lang;
  res.redirect(req.headers.referer || '/');
});

module.exports = router;

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const FLAGS = { BE:'🇧🇪',CN:'🇨🇳',DK:'🇩🇰',FR:'🇫🇷',DE:'🇩🇪',NL:'🇳🇱',PL:'🇵🇱',SE:'🇸🇪',AE:'🇦🇪',GB:'🇬🇧',US:'🇺🇸',NO:'🇳🇴',FI:'🇫🇮',AT:'🇦🇹',CH:'🇨🇭',IT:'🇮🇹',ES:'🇪🇸',PT:'🇵🇹',IE:'🇮🇪',CZ:'🇨🇿',HU:'🇭🇺',GR:'🇬🇷',HR:'🇭🇷',IN:'🇮🇳',TH:'🇹🇭',JP:'🇯🇵',AU:'🇦🇺',CA:'🇨🇦',BR:'🇧🇷',MX:'🇲🇽',KR:'🇰🇷',ZA:'🇿🇦',AR:'🇦🇷',MA:'🇲🇦',SG:'🇸🇬',RO:'🇷🇴',EE:'🇪🇪',RS:'🇷🇸',AL:'🇦🇱',DZ:'🇩🇿',TN:'🇹🇳' };
const CNAMES = { BE:'Belgium',CN:'China',DK:'Denmark',FR:'France',DE:'Germany',NL:'Netherlands',PL:'Poland',SE:'Sweden',AE:'UAE',GB:'United Kingdom',US:'USA',NO:'Norway',FI:'Finland',AT:'Austria',CH:'Switzerland',IT:'Italy',ES:'Spain',PT:'Portugal',IE:'Ireland',CZ:'Czech Republic',HU:'Hungary',GR:'Greece',HR:'Croatia',IN:'India',TH:'Thailand',JP:'Japan',AU:'Australia',CA:'Canada',BR:'Brazil',MX:'Mexico',KR:'South Korea',ZA:'South Africa',AR:'Argentina',MA:'Morocco',SG:'Singapore',RO:'Romania',EE:'Estonia',RS:'Serbia',AL:'Albania' };
const IMGS = { festival:'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=75',concert:'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=75',market:'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=75',christmas:'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=800&q=75',exhibition:'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=75',business:'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=75',default:'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=75' };
const CATS = { festival:'🎪',concert:'🎵',market:'🛍️',christmas:'🎄',exhibition:'🖼️',business:'💼',flea:'🏺',online:'💻' };

// ─── MAIN RENDER ──────────────────────────────────────────────────────────────
function render({ stats, topEvents, wantedEvents, featuredPaid, artists, vendors, articles, countries, user, lang, langHtml }) {
  const ev = stats.events, vn = stats.vendors, ar = stats.articles, sb = stats.subscribers;
  const cn = countries.length;

  return `<!DOCTYPE html>
<html lang="${lang||'en'}">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Festmore — Where Events, Vendors &amp; Artists Connect</title>
<meta name="description" content="The marketplace connecting event organisers with vendors and artists. ${ev}+ events · ${vn}+ vendors · ${cn} countries. Find opportunities, get booked, grow your business."/>
<link rel="canonical" href="https://festmore.com/"/>
<meta property="og:type" content="website"/>
<meta property="og:title" content="Festmore — Events · Vendors · Artists"/>
<meta property="og:description" content="${ev}+ events · ${vn}+ vendors · ${cn} countries"/>
<meta property="og:image" content="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200&q=80"/>
<script type="application/ld+json">{"@context":"https://schema.org","@type":"WebSite","name":"Festmore","url":"https://festmore.com","potentialAction":{"@type":"SearchAction","target":{"@type":"EntryPoint","urlTemplate":"https://festmore.com/events?q={search_term_string}"},"query-input":"required name=search_term_string"}}</script>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,600&display=swap" rel="stylesheet"/>
<script>window.addEventListener('load',function(){var s=document.createElement('script');s.async=true;s.src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2486135003689222';s.crossOrigin='anonymous';document.head.appendChild(s);});</script>
<link rel="stylesheet" href="/css/main.css"/>
<style>
/* ── TOKENS ── */
:root {
  --ink:#0a0a0a; --ink2:#1c1917; --ink3:#44403c; --ink4:#78716c; --ink5:#a8a29e;
  --cream:#fafaf8; --warm:#f5f0e8; --border:#e7e5e4; --white:#ffffff;
  --flame:#e8470a; --flame2:#c23d09; --flame-soft:rgba(232,71,10,.08);
  --gold:#d4a017; --gold2:#b8860b; --gold-soft:rgba(212,160,23,.1);
  --sage:#4a7060; --sage2:#3a5a50; --sage-soft:rgba(74,112,96,.08);
  --purple:#6b3fa0; --purple-soft:rgba(107,63,160,.08);
  --display:'Playfair Display',Georgia,serif;
  --body:'Syne',system-ui,sans-serif;
  --r:14px; --r-lg:20px; --r-xl:28px;
}
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:var(--body);background:var(--cream);color:var(--ink2);line-height:1.6;}
a{text-decoration:none;color:inherit;}
img{display:block;}

/* ── NAV ── */
.nav{position:sticky;top:0;z-index:100;background:rgba(10,10,10,.97);backdrop-filter:blur(20px);border-bottom:1px solid rgba(255,255,255,.06);}
.nav-inner{max-width:1320px;margin:0 auto;padding:0 28px;height:62px;display:flex;align-items:center;gap:20px;}
.nav-logo{font-family:var(--display);font-size:22px;color:#fff;font-style:italic;flex-shrink:0;letter-spacing:-.3px;}
.nav-logo strong{color:var(--flame);font-style:normal;}
.nav-search{flex:1;max-width:380px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:10px;display:flex;align-items:center;gap:8px;padding:0 14px;height:38px;transition:all .2s;}
.nav-search:focus-within{border-color:rgba(232,71,10,.4);background:rgba(255,255,255,.1);}
.nav-search input{flex:1;border:none;background:transparent;color:#fff;font-family:var(--body);font-size:13px;outline:none;}
.nav-search input::placeholder{color:rgba(255,255,255,.3);}
.nav-links{display:flex;align-items:center;gap:2px;margin-left:auto;}
.nav-link{color:rgba(255,255,255,.55);font-size:13px;font-weight:600;padding:7px 13px;border-radius:8px;transition:all .2s;white-space:nowrap;}
.nav-link:hover{color:#fff;background:rgba(255,255,255,.07);}
.nav-cta{background:var(--flame);color:#fff;font-size:13px;font-weight:700;padding:8px 18px;border-radius:8px;transition:all .2s;white-space:nowrap;}
.nav-cta:hover{background:var(--flame2);}
.nav-burger{display:none;background:none;border:none;color:#fff;font-size:20px;cursor:pointer;margin-left:auto;padding:8px;}
.mobile-menu{display:none;background:var(--ink);flex-direction:column;padding:12px 20px 20px;}
.mobile-menu a{color:rgba(255,255,255,.65);font-size:15px;font-weight:600;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.05);}
.mobile-menu a:last-child{border:none;}
.mobile-menu.open{display:flex;}

/* ── HERO ── */
.hero{background:var(--ink);position:relative;overflow:hidden;padding:90px 28px 72px;}
.hero-bg{position:absolute;inset:0;background:url('https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1600&q=50') center/cover;opacity:.18;}
.hero-gradient{position:absolute;inset:0;background:linear-gradient(135deg,rgba(10,10,10,.95) 0%,rgba(10,10,10,.7) 50%,rgba(10,10,10,.95) 100%);}
.hero-inner{position:relative;z-index:2;max-width:1320px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center;}
.hero-left{}
.hero-tag{display:inline-flex;align-items:center;gap:7px;background:rgba(232,71,10,.1);border:1px solid rgba(232,71,10,.2);color:#ff6b35;font-size:10px;font-weight:700;padding:5px 14px;border-radius:99px;margin-bottom:24px;letter-spacing:1.5px;text-transform:uppercase;}
.hero-dot{width:5px;height:5px;border-radius:50%;background:#ff6b35;animation:pulse 2s ease infinite;}
.hero-h1{font-family:var(--display);font-size:clamp(38px,4.5vw,66px);color:#fff;line-height:1.05;margin-bottom:18px;font-weight:700;}
.hero-h1 em{color:var(--flame);font-style:italic;}
.hero-p{font-size:16px;color:rgba(255,255,255,.45);line-height:1.7;margin-bottom:36px;max-width:480px;}
.hero-actions{display:flex;flex-direction:column;gap:12px;}
.hero-primary-btns{display:flex;gap:10px;flex-wrap:wrap;}
.hero-btn{display:inline-flex;align-items:center;gap:8px;padding:14px 24px;border-radius:11px;font-size:14px;font-weight:700;transition:all .25s;white-space:nowrap;font-family:var(--body);}
.hbtn-flame{background:var(--flame);color:#fff;box-shadow:0 4px 20px rgba(232,71,10,.35);}
.hbtn-flame:hover{background:var(--flame2);transform:translateY(-2px);box-shadow:0 8px 28px rgba(232,71,10,.45);}
.hbtn-sage{background:var(--sage);color:#fff;box-shadow:0 4px 20px rgba(74,112,96,.3);}
.hbtn-sage:hover{background:var(--sage2);transform:translateY(-2px);}
.hbtn-purple{background:var(--purple);color:#fff;box-shadow:0 4px 20px rgba(107,63,160,.3);}
.hbtn-purple:hover{background:#5a3490;transform:translateY(-2px);}
.hbtn-outline{background:rgba(255,255,255,.07);color:rgba(255,255,255,.6);border:1px solid rgba(255,255,255,.15);}
.hbtn-outline:hover{background:rgba(255,255,255,.12);color:#fff;}
.hero-browse{display:flex;align-items:center;gap:14px;margin-top:16px;}
.hero-browse-link{color:rgba(255,255,255,.4);font-size:13px;font-weight:600;transition:color .2s;}
.hero-browse-link:hover{color:rgba(255,255,255,.8);}
.hero-browse-sep{color:rgba(255,255,255,.15);font-size:12px;}
.hero-stats{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;}
.hstat{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:var(--r);padding:18px 20px;}
.hstat-n{font-family:var(--display);font-size:32px;color:#fff;line-height:1;font-weight:700;}
.hstat-n span{font-size:18px;color:var(--flame);}
.hstat-l{font-size:11px;color:rgba(255,255,255,.35);font-weight:600;letter-spacing:.8px;text-transform:uppercase;margin-top:5px;}
.hstat-sub{font-size:12px;color:rgba(255,255,255,.2);margin-top:3px;}

/* ── WANTED STRIP ── */
.wanted{background:linear-gradient(135deg,#0a0a0a,#1a0800);border-top:1px solid rgba(232,71,10,.15);border-bottom:1px solid rgba(232,71,10,.15);padding:52px 28px;}
.wanted-inner{max-width:1320px;margin:0 auto;}
.wanted-header{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:28px;flex-wrap:wrap;gap:16px;}
.wanted-title-wrap{}
.section-eyebrow{display:inline-flex;align-items:center;gap:6px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;padding:4px 12px;border-radius:99px;margin-bottom:10px;}
.ey-flame{background:rgba(232,71,10,.12);border:1px solid rgba(232,71,10,.2);color:#ff6b35;}
.ey-sage{background:rgba(74,112,96,.12);border:1px solid rgba(74,112,96,.2);color:#6db89a;}
.ey-purple{background:rgba(107,63,160,.12);border:1px solid rgba(107,63,160,.2);color:#b08de0;}
.ey-gold{background:rgba(212,160,23,.12);border:1px solid rgba(212,160,23,.2);color:var(--gold);}
.ey-neutral{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:rgba(255,255,255,.4);}
.section-h{font-family:var(--display);font-size:clamp(24px,3vw,40px);color:#fff;font-weight:700;line-height:1.1;}
.section-h.dark{color:var(--ink2);}
.section-sub{font-size:14px;color:rgba(255,255,255,.35);margin-top:6px;max-width:420px;}
.section-sub.dark{color:var(--ink4);}
.section-link{font-size:13px;font-weight:700;color:var(--flame);padding:9px 18px;border:1px solid rgba(232,71,10,.25);border-radius:9px;transition:all .2s;white-space:nowrap;}
.section-link:hover{background:var(--flame);color:#fff;}
.section-link.sage{color:var(--sage);border-color:rgba(74,112,96,.25);}
.section-link.sage:hover{background:var(--sage);color:#fff;}
.section-link.purple{color:var(--purple);border-color:rgba(107,63,160,.25);}
.section-link.purple:hover{background:var(--purple);color:#fff;}

/* Wanted cards */
.wanted-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;}
.wcard{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:var(--r-lg);overflow:hidden;transition:all .3s;text-decoration:none;display:flex;flex-direction:column;position:relative;}
.wcard:hover{border-color:rgba(232,71,10,.4);transform:translateY(-4px);box-shadow:0 20px 48px rgba(232,71,10,.15);}
.wcard-img{height:160px;overflow:hidden;position:relative;flex-shrink:0;}
.wcard-img img{width:100%;height:100%;object-fit:cover;transition:transform .4s;}
.wcard:hover .wcard-img img{transform:scale(1.06);}
.wcard-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(10,10,10,.7) 0%,transparent 60%);}
.wcard-spots{position:absolute;top:10px;right:10px;background:var(--flame);color:#fff;font-size:11px;font-weight:800;padding:4px 10px;border-radius:99px;}
.wcard-cat{position:absolute;top:10px;left:10px;background:rgba(0,0,0,.6);color:#fff;font-size:10px;font-weight:700;padding:3px 10px;border-radius:99px;backdrop-filter:blur(8px);}
.wcard-body{padding:16px;flex:1;display:flex;flex-direction:column;}
.wcard-title{font-family:var(--display);font-size:16px;color:#fff;margin-bottom:6px;line-height:1.25;font-weight:600;}
.wcard-meta{font-size:12px;color:rgba(255,255,255,.4);margin-bottom:auto;}
.wcard-footer{display:flex;justify-content:space-between;align-items:center;padding-top:12px;border-top:1px solid rgba(255,255,255,.07);margin-top:12px;}
.wcard-date{font-size:11px;color:rgba(255,255,255,.3);}
.wcard-apply{font-size:12px;font-weight:700;color:var(--flame);}
.wanted-cta{text-align:center;margin-top:28px;padding:28px;background:rgba(232,71,10,.06);border:1px dashed rgba(232,71,10,.2);border-radius:var(--r-lg);}
.wanted-cta p{color:rgba(255,255,255,.4);font-size:14px;margin-bottom:14px;}
.wanted-cta p strong{color:#fff;}
.wanted-cta-btns{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;}

/* ── SECTIONS ── */
.section{padding:72px 28px;}
.section-inner{max-width:1320px;margin:0 auto;}
.sec-top{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:32px;flex-wrap:wrap;gap:16px;}

/* ── EVENTS GRID ── */
.events-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;}
.ecard{background:#fff;border:1px solid var(--border);border-radius:var(--r-lg);overflow:hidden;transition:all .3s;cursor:pointer;display:flex;flex-direction:column;}
.ecard:hover{border-color:var(--flame);box-shadow:0 20px 52px rgba(10,10,10,.1);transform:translateY(-4px);}
.ecard-img{height:210px;position:relative;overflow:hidden;flex-shrink:0;}
.ecard-img img{width:100%;height:100%;object-fit:cover;transition:transform .4s;}
.ecard:hover .ecard-img img{transform:scale(1.06);}
.ecard-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(10,10,10,.55) 0%,transparent 60%);}
.ecard-badges{position:absolute;top:10px;left:10px;display:flex;gap:5px;}
.ebadge{padding:3px 9px;border-radius:99px;font-size:10px;font-weight:700;backdrop-filter:blur(8px);}
.ebadge-cat{background:rgba(0,0,0,.5);color:#fff;}
.ebadge-feat{background:var(--flame);color:#fff;}
.ebadge-free{background:#dcfce7;color:#15803d;}
.ecard-body{padding:18px;flex:1;display:flex;flex-direction:column;}
.ecard-date{font-size:11px;font-weight:700;color:var(--flame);text-transform:uppercase;letter-spacing:.7px;margin-bottom:6px;}
.ecard-title{font-family:var(--display);font-size:18px;color:var(--ink2);margin-bottom:5px;line-height:1.2;flex:1;font-weight:600;}
.ecard-loc{font-size:13px;color:var(--ink4);margin-bottom:auto;padding-bottom:12px;}
.ecard-footer{display:flex;justify-content:space-between;align-items:center;padding-top:12px;border-top:1px solid #f0ece4;margin-top:auto;}
.ecard-att{font-size:12px;color:var(--ink5);}
.ecard-cta{font-size:12px;font-weight:700;color:var(--flame);}

/* ── ARTISTS ── */
.artists-dark{background:linear-gradient(135deg,#080514,#120a24);padding:72px 28px;}
.artists-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;}
.acard{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:var(--r-lg);overflow:hidden;transition:all .3s;text-decoration:none;display:flex;flex-direction:column;}
.acard:hover{border-color:rgba(107,63,160,.5);transform:translateY(-5px);box-shadow:0 24px 56px rgba(107,63,160,.2);}
.acard-img{height:220px;overflow:hidden;position:relative;flex-shrink:0;}
.acard-img img{width:100%;height:100%;object-fit:cover;transition:transform .4s;}
.acard:hover .acard-img img{transform:scale(1.07);}
.acard-img-placeholder{width:100%;height:220px;background:linear-gradient(135deg,rgba(107,63,160,.2),rgba(107,63,160,.05));display:flex;align-items:center;justify-content:center;font-size:56px;}
.acard-badge{position:absolute;top:10px;right:10px;}
.badge-gold{background:linear-gradient(135deg,#d4a017,#b8860b);color:#fff;padding:4px 10px;border-radius:99px;font-size:10px;font-weight:800;display:inline-flex;align-items:center;gap:4px;}
.badge-verified{background:var(--sage);color:#fff;padding:4px 10px;border-radius:99px;font-size:10px;font-weight:800;}
.acard-body{padding:16px;flex:1;display:flex;flex-direction:column;}
.acard-genre{font-size:11px;font-weight:700;color:#b08de0;text-transform:uppercase;letter-spacing:.7px;margin-bottom:5px;}
.acard-name{font-family:var(--display);font-size:17px;color:#fff;margin-bottom:4px;font-weight:600;}
.acard-loc{font-size:12px;color:rgba(255,255,255,.35);margin-bottom:auto;padding-bottom:10px;}
.acard-footer{display:flex;justify-content:space-between;align-items:center;padding-top:10px;border-top:1px solid rgba(255,255,255,.07);margin-top:auto;}
.acard-fee{font-size:12px;color:rgba(255,255,255,.3);}
.acard-cta{font-size:12px;font-weight:700;color:#b08de0;}
.artists-cta-row{text-align:center;margin-top:32px;display:flex;gap:12px;justify-content:center;flex-wrap:wrap;}

/* ── VENDORS ── */
.vendors-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;}
.vcard{background:#fff;border:1px solid var(--border);border-radius:var(--r-lg);overflow:hidden;transition:all .3s;text-decoration:none;display:flex;flex-direction:column;position:relative;}
.vcard:hover{border-color:var(--sage);box-shadow:0 20px 52px rgba(10,10,10,.09);transform:translateY(-4px);}
.vcard-img{height:180px;overflow:hidden;position:relative;background:var(--warm);flex-shrink:0;}
.vcard-img img{width:100%;height:100%;object-fit:cover;transition:transform .4s;}
.vcard:hover .vcard-img img{transform:scale(1.06);}
.vcard-placeholder{width:100%;height:180px;background:linear-gradient(135deg,var(--warm),var(--border));display:flex;align-items:center;justify-content:center;font-size:48px;}
.vcard-badge-pos{position:absolute;top:10px;left:10px;}
.vcard-body{padding:16px;flex:1;display:flex;flex-direction:column;}
.vcard-cat{font-size:11px;font-weight:700;color:var(--sage);text-transform:uppercase;letter-spacing:.7px;margin-bottom:4px;}
.vcard-name{font-family:var(--display);font-size:17px;color:var(--ink2);margin-bottom:4px;font-weight:600;}
.vcard-loc{font-size:12px;color:var(--ink4);margin-bottom:auto;padding-bottom:10px;}
.vcard-footer{display:flex;justify-content:space-between;align-items:center;padding-top:10px;border-top:1px solid #f0ece4;margin-top:auto;}
.vcard-apps{font-size:12px;color:var(--ink5);}
.vcard-cta{font-size:12px;font-weight:700;color:var(--sage);}

/* ── HOW IT WORKS ── */
.how-bg{background:var(--warm);}
.how-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:40px;}
.how-card{background:#fff;border:1px solid var(--border);border-radius:var(--r-lg);padding:28px;position:relative;}
.how-num{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;margin-bottom:16px;}
.how-num-flame{background:var(--flame-soft);color:var(--flame);}
.how-num-sage{background:var(--sage-soft);color:var(--sage);}
.how-num-purple{background:var(--purple-soft);color:var(--purple);}
.how-icon{font-size:28px;margin-bottom:12px;display:block;}
.how-label{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1.2px;color:var(--ink5);margin-bottom:6px;}
.how-title{font-size:16px;font-weight:700;color:var(--ink2);margin-bottom:8px;}
.how-desc{font-size:13px;color:var(--ink4);line-height:1.7;}
.how-arrow{position:absolute;right:-12px;top:50%;transform:translateY(-50%);width:24px;height:24px;background:#fff;border:1px solid var(--border);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;color:var(--ink5);z-index:1;}

/* ── PRICING ── */
.pricing-bg{background:var(--ink);}
.pricing-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:40px;}
.pcard{border-radius:var(--r-lg);padding:28px;position:relative;overflow:hidden;}
.pcard-free{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);}
.pcard-standard{background:linear-gradient(145deg,#0f1a10,#1a2d1a);border:1px solid rgba(74,112,96,.3);}
.pcard-gold{background:linear-gradient(145deg,#1a1400,#2a2000);border:1px solid rgba(212,160,23,.35);}
.pcard-glow{position:absolute;top:-60px;right:-60px;width:180px;height:180px;border-radius:50%;}
.pcard-glow-sage{background:radial-gradient(circle,rgba(74,112,96,.2) 0%,transparent 70%);}
.pcard-glow-gold{background:radial-gradient(circle,rgba(212,160,23,.2) 0%,transparent 70%);}
.pcard-pop{position:absolute;top:14px;right:14px;font-size:10px;font-weight:800;padding:3px 10px;border-radius:99px;text-transform:uppercase;letter-spacing:.8px;}
.pcard-pop-sage{background:var(--sage);color:#fff;}
.pcard-pop-gold{background:var(--gold);color:#000;}
.pcard-tier{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1.2px;margin-bottom:8px;}
.pcard-free .pcard-tier{color:rgba(255,255,255,.3);}
.pcard-standard .pcard-tier{color:#6db89a;}
.pcard-gold .pcard-tier{color:var(--gold);}
.pcard-price{font-family:var(--display);font-size:44px;color:#fff;line-height:1;font-weight:700;margin-bottom:4px;}
.pcard-period{font-size:13px;color:rgba(255,255,255,.3);margin-bottom:20px;}
.pcard-feature{display:flex;align-items:flex-start;gap:9px;padding:7px 0;border-bottom:1px solid rgba(255,255,255,.05);font-size:13px;color:rgba(255,255,255,.6);}
.pcard-feature:last-of-type{border-bottom:none;}
.pcard-fi{flex-shrink:0;margin-top:2px;}
.pcard-cta{display:block;text-align:center;padding:13px;border-radius:10px;font-size:14px;font-weight:700;margin-top:20px;transition:all .2s;font-family:var(--body);}
.pcard-free .pcard-cta{background:rgba(255,255,255,.07);color:rgba(255,255,255,.5);border:1px solid rgba(255,255,255,.1);}
.pcard-free .pcard-cta:hover{background:rgba(255,255,255,.1);color:#fff;}
.pcard-standard .pcard-cta{background:var(--sage);color:#fff;}
.pcard-standard .pcard-cta:hover{background:var(--sage2);transform:translateY(-2px);}
.pcard-gold .pcard-cta{background:linear-gradient(135deg,var(--gold),var(--gold2));color:#000;font-weight:800;}
.pcard-gold .pcard-cta:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(212,160,23,.35);}

/* ── ARTICLES ── */
.articles-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;}
.artcard{background:#fff;border:1px solid var(--border);border-radius:var(--r-lg);overflow:hidden;text-decoration:none;display:flex;flex-direction:column;transition:all .3s;}
.artcard:hover{border-color:var(--flame);box-shadow:0 20px 52px rgba(10,10,10,.08);transform:translateY(-4px);}
.artcard-img{height:190px;overflow:hidden;position:relative;}
.artcard-img img{width:100%;height:100%;object-fit:cover;transition:transform .4s;}
.artcard:hover .artcard-img img{transform:scale(1.06);}
.artcard-catbadge{position:absolute;top:10px;left:10px;padding:3px 10px;border-radius:99px;font-size:10px;font-weight:700;text-transform:uppercase;color:#fff;}
.artcard-body{padding:20px;flex:1;display:flex;flex-direction:column;}
.artcard-title{font-family:var(--display);font-size:17px;color:var(--ink2);margin-bottom:7px;line-height:1.3;flex:1;font-weight:600;}
.artcard-excerpt{font-size:13px;color:var(--ink4);line-height:1.65;margin-bottom:14px;}
.artcard-footer{display:flex;justify-content:space-between;align-items:center;padding-top:12px;border-top:1px solid #f0ece4;}
.artcard-date{font-size:11px;color:var(--ink5);}
.artcard-cta{font-size:12px;font-weight:700;color:var(--flame);}

/* ── COUNTRIES ── */
.countries-bg{background:var(--warm);}
.countries-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:8px;}
.ccard{background:#fff;border:1px solid var(--border);border-radius:var(--r);padding:12px;text-decoration:none;text-align:center;transition:all .2s;}
.ccard:hover{border-color:var(--flame);transform:translateY(-2px);}
.ccard-flag{font-size:22px;display:block;margin-bottom:4px;}
.ccard-name{font-size:11px;font-weight:600;color:var(--ink2);display:block;margin-bottom:2px;}
.ccard-count{font-size:10px;color:var(--ink5);}

/* ── NEWSLETTER ── */
.nl-bg{background:#fff;padding:72px 28px;}
.nl-box{max-width:960px;margin:0 auto;background:linear-gradient(135deg,var(--ink),#1a0800);border-radius:var(--r-xl);padding:52px 48px;display:flex;justify-content:space-between;align-items:center;gap:32px;flex-wrap:wrap;}
.nl-left h2{font-family:var(--display);font-size:28px;color:#fff;font-weight:700;margin-bottom:6px;}
.nl-left p{font-size:14px;color:rgba(255,255,255,.35);max-width:320px;line-height:1.6;}
.nl-form{display:flex;gap:10px;flex-wrap:wrap;}
.nl-input{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.1);color:#fff;padding:13px 16px;border-radius:9px;font-family:var(--body);font-size:14px;outline:none;width:260px;transition:all .2s;}
.nl-input::placeholder{color:rgba(255,255,255,.25);}
.nl-input:focus{border-color:rgba(232,71,10,.4);}
.nl-btn{background:var(--flame);color:#fff;border:none;padding:13px 22px;border-radius:9px;font-size:14px;font-weight:700;cursor:pointer;font-family:var(--body);transition:all .2s;}
.nl-btn:hover{background:var(--flame2);}

/* ── TRUST BAR ── */
.trust{background:#111;border-bottom:1px solid rgba(255,255,255,.06);padding:14px 28px;}
.trust-inner{max-width:1320px;margin:0 auto;display:flex;align-items:center;justify-content:center;gap:28px;flex-wrap:wrap;}
.trust-item{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:600;color:rgba(255,255,255,.35);}
.trust-check{color:var(--flame);}

/* ── URGENCY ── */
.urgency{background:linear-gradient(135deg,var(--flame),var(--flame2));padding:28px;}
.urgency-inner{max-width:1200px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:20px;}
.urgency h3{font-family:var(--display);font-size:20px;color:#fff;font-weight:700;margin-bottom:4px;}
.urgency p{font-size:13px;color:rgba(255,255,255,.7);}
.urgency-btns{display:flex;gap:10px;flex-wrap:wrap;}
.ubtn-w{background:#fff;color:var(--flame);padding:11px 22px;border-radius:99px;font-size:13px;font-weight:700;transition:all .2s;}
.ubtn-w:hover{transform:translateY(-2px);}
.ubtn-t{background:rgba(255,255,255,.15);color:#fff;border:1.5px solid rgba(255,255,255,.35);padding:11px 22px;border-radius:99px;font-size:13px;font-weight:700;}

/* ── FOOTER ── */
footer{background:var(--ink);padding:56px 28px 28px;}
.footer-inner{max-width:1320px;margin:0 auto;}
.footer-grid{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:44px;margin-bottom:44px;padding-bottom:44px;border-bottom:1px solid rgba(255,255,255,.06);}
.footer-logo{font-family:var(--display);font-size:22px;color:#fff;font-style:italic;margin-bottom:10px;}
.footer-logo strong{color:var(--flame);font-style:normal;}
.footer-brand p{font-size:13px;color:rgba(255,255,255,.3);line-height:1.7;max-width:260px;}
.footer-col h4{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1.2px;color:rgba(255,255,255,.25);margin-bottom:14px;}
.footer-col a{display:block;color:rgba(255,255,255,.45);font-size:13px;margin-bottom:9px;transition:color .2s;}
.footer-col a:hover{color:#fff;}
.footer-bottom{display:flex;justify-content:space-between;align-items:center;font-size:12px;color:rgba(255,255,255,.2);flex-wrap:wrap;gap:10px;}

@keyframes pulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:.5;transform:scale(1.4);}}

/* ── RESPONSIVE ── */
@media(max-width:1024px){
  .hero-inner{grid-template-columns:1fr;gap:40px;}
  .hero-stats{grid-template-columns:repeat(4,1fr);}
  .wanted-grid,.events-grid,.vendors-grid,.articles-grid{grid-template-columns:repeat(2,1fr);}
  .artists-grid{grid-template-columns:repeat(2,1fr);}
  .how-grid,.pricing-grid{grid-template-columns:1fr;}
  .how-arrow{display:none;}
  .footer-grid{grid-template-columns:1fr 1fr;}
}
@media(max-width:768px){
  .nav-links,.nav-search{display:none;}
  .nav-burger{display:block;}
  .hero{padding:60px 20px 48px;}
  .hero-stats{grid-template-columns:repeat(2,1fr);}
  .hero-primary-btns{flex-direction:column;}
  .wanted-grid,.events-grid,.artists-grid,.vendors-grid,.articles-grid{grid-template-columns:1fr;}
  .section{padding:48px 20px;}
  .wanted{padding:48px 20px;}
  .artists-dark{padding:48px 20px;}
  .nl-box{padding:32px 24px;}
  .nl-input{width:100%;}
  .footer-grid{grid-template-columns:1fr;}
  .trust-inner{gap:16px;}
}
</style>
</head>
<body>

${renderNav(user, langHtml)}

<!-- ═══ HERO ═══════════════════════════════════════════════════════════════ -->
<section class="hero">
  <div class="hero-bg"></div>
  <div class="hero-gradient"></div>
  <div class="hero-inner">

    <div class="hero-left">
      <div class="hero-tag"><span class="hero-dot"></span> The Live Events Marketplace</div>
      <h1 class="hero-h1">
        Find Events.<br/>
        Book <em>Vendors.</em><br/>
        Hire Artists.
      </h1>
      <p class="hero-p">
        The professional platform where event organisers, vendors and artists connect directly.
        ${ev.toLocaleString()}+ events across ${cn} countries.
      </p>
      <div class="hero-actions">
        <div class="hero-primary-btns">
          <a href="/events/submit" class="hero-btn hbtn-flame">🎪 List Your Event — Free</a>
          <a href="/vendors/register" class="hero-btn hbtn-sage">🏪 Register as Vendor — €49/yr</a>
          <a href="/artists/register" class="hero-btn hbtn-purple">🎨 Register as Artist — Free</a>
        </div>
        <div class="hero-browse">
          <a href="/events" class="hero-browse-link">Browse ${ev.toLocaleString()}+ events</a>
          <span class="hero-browse-sep">·</span>
          <a href="/vendors" class="hero-browse-link">Find vendors</a>
          <span class="hero-browse-sep">·</span>
          <a href="/artists" class="hero-browse-link">Discover artists</a>
        </div>
      </div>
    </div>

    <div class="hero-stats">
      <div class="hstat">
        <div class="hstat-n">${ev.toLocaleString()}<span>+</span></div>
        <div class="hstat-l">Events Listed</div>
        <div class="hstat-sub">Festivals · Markets · Concerts</div>
      </div>
      <div class="hstat">
        <div class="hstat-n">${cn}<span>+</span></div>
        <div class="hstat-l">Countries</div>
        <div class="hstat-sub">Europe · Americas · Asia</div>
      </div>
      <div class="hstat">
        <div class="hstat-n">${vn}<span>+</span></div>
        <div class="hstat-l">Active Vendors</div>
        <div class="hstat-sub">Food · Crafts · Services</div>
      </div>
      <div class="hstat">
        <div class="hstat-n">${sb}<span>+</span></div>
        <div class="hstat-l">Subscribers</div>
        <div class="hstat-sub">Industry professionals</div>
      </div>
    </div>

  </div>
</section>

<!-- ═══ TRUST BAR ══════════════════════════════════════════════════════════ -->
<div class="trust">
  <div class="trust-inner">
    ${['Free Event Listings','Verified Vendors','Gold Badge Artists',cn+' Countries','Stripe Secure Payments','Direct Applications','No Agency Fees'].map(t=>`<div class="trust-item"><span class="trust-check">✓</span>${t}</div>`).join('')}
  </div>
</div>

<!-- ═══ CHRISTMAS MARKETS BANNER ══════════════════════════════════════════ -->
<section style="background:#061a0a;padding:56px 28px;border-top:1px solid rgba(212,160,23,.15);border-bottom:1px solid rgba(212,160,23,.15);position:relative;overflow:hidden;">
  <div style="position:absolute;inset:0;background:url('https://images.unsplash.com/photo-1576919228236-a097c32a5cd4?w=1600&q=80') center/cover;opacity:.4;"></div>
  <div style="position:absolute;inset:0;background:linear-gradient(135deg,rgba(4,18,8,.95) 0%,rgba(6,26,10,.80) 40%,rgba(4,18,8,.92) 100%);"></div>
  <div style="position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,transparent,#d4a017,#c41e3a,#d4a017,transparent);"></div>
  <div style="position:absolute;bottom:0;left:0;right:0;height:3px;background:linear-gradient(90deg,transparent,#d4a017,#c41e3a,#d4a017,transparent);"></div>
  <div style="position:absolute;top:-60px;right:-60px;width:300px;height:300px;background:radial-gradient(circle,rgba(212,160,23,.08) 0%,transparent 70%);"></div>
  <div style="position:absolute;bottom:-40px;left:10%;width:200px;height:200px;background:radial-gradient(circle,rgba(196,30,58,.06) 0%,transparent 70%);"></div>
  <div style="max-width:1200px;margin:0 auto;display:grid;grid-template-columns:1fr auto;gap:48px;align-items:center;position:relative;z-index:1;">
    <div>
      <div style="display:inline-flex;align-items:center;gap:8px;background:rgba(196,30,58,.2);border:1px solid rgba(196,30,58,.4);color:#ff8c9a;font-size:10px;font-weight:800;padding:5px 14px;border-radius:99px;margin-bottom:20px;letter-spacing:1.5px;text-transform:uppercase;">🎄 Founding Price — This Season Only</div>
      <h2 style="font-family:'Playfair Display',Georgia,serif;font-size:clamp(26px,4vw,48px);color:#fff;line-height:1.05;margin-bottom:14px;font-weight:700;">The World's Christmas Markets<br/><em style="color:#d4a017;font-style:italic;">All in One Place</em></h2>
      <p style="font-size:15px;color:rgba(255,255,255,.5);line-height:1.7;margin-bottom:10px;max-width:520px;">Europe, Asia, North America, Australia, the Middle East — we are building the world's first global Christmas market discovery platform. Be part of it from the very beginning.</p>
      <p style="font-size:14px;color:rgba(255,255,255,.35);line-height:1.6;margin-bottom:28px;max-width:520px;">Featured listing is <strong style="color:#d4a017;">€29 for the entire 2026 Christmas season</strong> — a founding price that will never be offered again. From 2027 the price is €79.</p>
      <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;">
        <a href="/christmas" style="display:inline-flex;align-items:center;gap:8px;background:#c41e3a;color:#fff;padding:14px 28px;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none;box-shadow:0 4px 24px rgba(196,30,58,.35);">🎄 Explore All Markets →</a>
        <a href="/events/submit?plan=standard" style="display:inline-flex;align-items:center;gap:8px;background:linear-gradient(135deg,rgba(212,160,23,.2),rgba(212,160,23,.08));color:#d4a017;border:1px solid rgba(212,160,23,.4);padding:14px 28px;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none;">List Your Market — €29 →</a>
      </div>
      <div style="display:flex;gap:20px;margin-top:20px;flex-wrap:wrap;">
        <span style="font-size:12px;color:rgba(255,255,255,.25);">✓ Free listing always available</span>
        <span style="font-size:12px;color:rgba(255,255,255,.25);">✓ No contract · Cancel anytime</span>
        <span style="font-size:12px;color:rgba(255,255,255,.25);">✓ Founding price — never again at €29</span>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;min-width:260px;">
      <div style="background:rgba(255,255,255,.04);border:1px solid rgba(212,160,23,.15);border-radius:14px;padding:20px;text-align:center;">
        <div style="font-size:32px;font-weight:800;color:#fff;font-family:Georgia,serif;">1,800<span style="color:#d4a017;">+</span></div>
        <div style="font-size:10px;color:rgba(255,255,255,.3);text-transform:uppercase;letter-spacing:1px;margin-top:4px;">Events Listed</div>
      </div>
      <div style="background:rgba(255,255,255,.04);border:1px solid rgba(212,160,23,.15);border-radius:14px;padding:20px;text-align:center;">
        <div style="font-size:32px;font-weight:800;color:#fff;font-family:Georgia,serif;">42<span style="color:#d4a017;">+</span></div>
        <div style="font-size:10px;color:rgba(255,255,255,.3);text-transform:uppercase;letter-spacing:1px;margin-top:4px;">Countries</div>
      </div>
      <div style="background:linear-gradient(135deg,rgba(196,30,58,.25),rgba(196,30,58,.08));border:1px solid rgba(196,30,58,.35);border-radius:14px;padding:20px;text-align:center;">
        <div style="font-size:13px;color:rgba(255,255,255,.3);text-decoration:line-through;margin-bottom:2px;">€79</div>
        <div style="font-size:32px;font-weight:800;color:#d4a017;font-family:Georgia,serif;">€29</div>
        <div style="font-size:10px;color:rgba(255,255,255,.3);text-transform:uppercase;letter-spacing:1px;margin-top:2px;">2026 Only</div>
      </div>
      <div style="background:rgba(255,255,255,.04);border:1px solid rgba(212,160,23,.15);border-radius:14px;padding:20px;text-align:center;">
        <div style="font-size:32px;">🌍</div>
        <div style="font-size:10px;color:rgba(255,255,255,.3);text-transform:uppercase;letter-spacing:1px;margin-top:4px;">Worldwide</div>
      </div>
    </div>
  </div>
</section>

<!-- ═══ WANTED POSTINGS ════════════════════════════════════════════════════ -->
<section class="wanted">
  <div class="wanted-inner">
    <div class="wanted-header">
      <div class="wanted-title-wrap">
        <div class="section-eyebrow ey-flame">🔥 Vendor &amp; Artist Spots Available</div>
        <h2 class="section-h">Events Looking for You</h2>
        <p class="section-sub">These events have open spots for vendors and artists. Apply directly — no middleman.</p>
      </div>
      <a href="/events?spots=available" class="section-link">View all open spots →</a>
    </div>

    <div class="wanted-grid">
      ${wantedEvents.length > 0 ? wantedEvents.map(e => {
        const img = e.image_url || IMGS[e.category] || IMGS.default;
        const flag = FLAGS[e.country] || '🌍';
        const icon = CATS[e.category] || '🎪';
        const spots = e.vendor_spots || 0;
        return `<a href="/events/${e.slug}" class="wcard">
          <div class="wcard-img">
            <img src="${img}" alt="${e.title}" loading="lazy"/>
            <div class="wcard-overlay"></div>
            <div class="wcard-cat">${icon} ${e.category}</div>
            <div class="wcard-spots">${spots} spot${spots!==1?'s':''} open</div>
          </div>
          <div class="wcard-body">
            <div class="wcard-title">${e.title}</div>
            <div class="wcard-meta">📍 ${flag} ${e.city}${e.country?', '+(CNAMES[e.country]||e.country):''}</div>
            <div class="wcard-footer">
              <span class="wcard-date">📅 ${e.date_display||e.start_date||'Date TBC'}</span>
              <span class="wcard-apply">Apply now →</span>
            </div>
          </div>
        </a>`;
      }).join('') : `
        <div style="grid-column:1/-1;text-align:center;padding:48px;color:rgba(255,255,255,.3);">
          <div style="font-size:48px;margin-bottom:16px;">🎪</div>
          <p style="font-size:15px;">Event listings with open vendor spots will appear here.</p>
          <p style="font-size:13px;margin-top:8px;">Are you an organiser? <a href="/events/submit" style="color:var(--flame);font-weight:700;">List your event and find vendors →</a></p>
        </div>`}
    </div>

    <div class="wanted-cta">
      <p><strong>Are you an event organiser?</strong> List your event and specify how many vendor and artist spots you have available. Vendors and artists will apply directly to you.</p>
      <div class="wanted-cta-btns">
        <a href="/events/submit" class="hero-btn hbtn-flame">🎪 List Your Event — Free</a>
        <a href="/vendors" class="hero-btn hbtn-outline">Browse All Vendors →</a>
        <a href="/artists" class="hero-btn hbtn-outline">Browse All Artists →</a>
      </div>
    </div>
  </div>
</section>

<!-- ═══ FEATURED PAID EVENTS ════════════════════════════════════════════ -->
${featuredPaid && featuredPaid.length > 0 ? `
<section style="background:linear-gradient(135deg,#1a0800,#2d1200);padding:40px 28px;border-bottom:1px solid rgba(232,71,10,.15);">
  <div class="section-inner">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
      <div>
        <div style="display:inline-flex;align-items:center;gap:6px;background:rgba(232,71,10,.12);border:1px solid rgba(232,71,10,.2);color:#ff6b35;font-size:10px;font-weight:800;padding:4px 12px;border-radius:99px;margin-bottom:10px;letter-spacing:1.2px;text-transform:uppercase;">⭐ Promoted Events</div>
        <h2 style="font-family:var(--display);font-size:28px;color:#fff;font-weight:700;margin:0;">Featured by Organisers</h2>
      </div>
      <a href="/events?sort=featured" style="font-size:13px;font-weight:700;color:#ff6b35;white-space:nowrap;">View all featured →</a>
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;">
      ${featuredPaid.map(e => {
        const img = e.image_url || IMGS[e.category] || IMGS.default;
        const flag = FLAGS[e.country] || '';
        const isPremium = e.payment_status === 'premium';
        return `<a href="/events/${e.slug}" style="background:rgba(255,255,255,.04);border:1px solid ${isPremium?'rgba(201,146,42,.4)':'rgba(232,71,10,.2)'};border-radius:16px;overflow:hidden;text-decoration:none;display:flex;flex-direction:column;transition:all .3s;">
          <div style="height:150px;overflow:hidden;position:relative;">
            <img src="${img}" alt="${e.title}" loading="lazy" style="width:100%;height:100%;object-fit:cover;"/>
            <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.6),transparent);"></div>
            <span style="position:absolute;top:8px;left:8px;background:${isPremium?'linear-gradient(135deg,#c9922a,#e8b84b)':'var(--flame)'};color:#fff;font-size:10px;font-weight:800;padding:3px 10px;border-radius:99px;">${isPremium?'⭐ Premium':'★ Featured'}</span>
          </div>
          <div style="padding:14px;flex:1;">
            <div style="font-family:var(--display);font-size:16px;color:#fff;margin-bottom:5px;font-weight:600;line-height:1.2;">${e.title}</div>
            <div style="font-size:12px;color:rgba(255,255,255,.4);">${flag} ${e.city} · ${e.date_display||e.start_date||''}</div>
          </div>
          <div style="padding:0 14px 14px;font-size:12px;font-weight:700;color:${isPremium?'#e8b84b':'#ff6b35'};">View event →</div>
        </a>`;
      }).join('')}
    </div>
    <p style="text-align:center;margin-top:18px;font-size:12px;color:rgba(255,255,255,.25);">
      Want your event here? <a href="/events/pricing" style="color:#ff6b35;font-weight:700;">Get Featured — €79/yr →</a>
    </p>
  </div>
</section>` : ''}

<!-- ═══ EVENTS ════════════════════════════════════════════════════════════ -->
<section class="section" style="background:var(--warm);">
  <div class="section-inner">
    <div class="sec-top">
      <div>
        <div class="section-eyebrow ey-flame">🎪 Discover Events</div>
        <h2 class="section-h dark">Events You Cannot Miss</h2>
        <p class="section-sub dark">The world's finest festivals, markets and concerts — all in one place</p>
      </div>
      <a href="/events" class="section-link">View all ${ev.toLocaleString()}+ events →</a>
    </div>
    <div class="events-grid">
      ${topEvents.map(e => eventCard(e)).join('')}
    </div>
    <div style="text-align:center;margin-top:28px;">
      <a href="/events" style="display:inline-flex;align-items:center;gap:8px;background:var(--flame);color:#fff;padding:14px 40px;border-radius:10px;font-size:15px;font-weight:700;box-shadow:0 6px 24px rgba(232,71,10,.3);">Browse All ${ev.toLocaleString()}+ Events →</a>
    </div>
  </div>
</section>

<!-- ═══ ARTISTS ═══════════════════════════════════════════════════════════ -->
<section class="artists-dark">
  <div class="section-inner">
    <div class="sec-top">
      <div>
        <div class="section-eyebrow ey-purple">🎨 Verified Artists &amp; Performers</div>
        <h2 class="section-h">Talent Ready to Be Booked</h2>
        <p class="section-sub">Musicians · DJs · Comedians · Painters · Dancers · Photographers · Circus · Hosts</p>
      </div>
      <a href="/artists" class="section-link purple">Meet all artists →</a>
    </div>
    <div class="artists-grid">
      ${artists.map(a => {
        const img = a.image_url || '';
        const isGold = a.payment_status === 'gold';
        const isPaid = a.payment_status === 'paid';
        return `<a href="/artists/${a.slug}" class="acard">
          <div class="acard-img">
            ${img ? `<img src="${img}" alt="${a.name}" loading="lazy"/>` : `<div class="acard-img-placeholder">🎤</div>`}
            <div class="acard-badge">
              ${isGold ? `<span class="badge-gold">🥇 Gold</span>` : isPaid ? `<span class="badge-verified">✅ Verified</span>` : ''}
            </div>
          </div>
          <div class="acard-body">
            <div class="acard-genre">${a.genre||'Artist'}</div>
            <div class="acard-name">${a.name}</div>
            <div class="acard-loc">📍 ${a.city||''}${a.country?', '+(CNAMES[a.country]||a.country):''}</div>
            <div class="acard-footer">
              <span class="acard-fee">${a.fee_display||'Contact for fee'}</span>
              <span class="acard-cta">View profile →</span>
            </div>
          </div>
        </a>`;
      }).join('')}
    </div>
    <div class="artists-cta-row">
      <a href="/artists" class="hero-btn hbtn-purple">🔍 Browse All Artists</a>
      <a href="/artists/register" class="hero-btn hbtn-outline">🎨 Register as Artist — Free</a>
    </div>
  </div>
</section>

<!-- ═══ VENDORS ════════════════════════════════════════════════════════════ -->
<section class="section" style="background:#fff;">
  <div class="section-inner">
    <div class="sec-top">
      <div>
        <div class="section-eyebrow ey-sage">🏪 Verified Vendors</div>
        <h2 class="section-h dark">Trusted Event Suppliers</h2>
        <p class="section-sub dark">Food trucks · Artisan crafts · Entertainment · Photography · Catering · Market stalls</p>
      </div>
      <a href="/vendors" class="section-link sage">View all vendors →</a>
    </div>
    <div class="vendors-grid">
      ${vendors.length > 0 ? vendors.map(v => {
        let photos = []; try { photos = JSON.parse(v.photos||'[]'); } catch(e) {}
        const photo = photos[0] || v.image_url || '';
        const isGold = v.payment_status === 'gold';
        const apps = parseInt(v.total_applications) || 0;
        return `<a href="/vendors/profile/${v.id}" class="vcard">
          <div class="vcard-img">
            ${photo ? `<img src="${photo}" alt="${v.business_name}" loading="lazy"/>` : `<div class="vcard-placeholder">🏪</div>`}
            <div class="vcard-badge-pos">${isGold ? `<span class="badge-gold">🥇 Gold</span>` : `<span class="badge-verified">✅ Verified</span>`}</div>
          </div>
          <div class="vcard-body">
            <div class="vcard-cat">${v.category||'Vendor'}</div>
            <div class="vcard-name">${v.business_name}</div>
            <div class="vcard-loc">📍 ${v.city||''}${v.country?', '+(CNAMES[v.country]||v.country):''}</div>
            <div class="vcard-footer">
              <span class="vcard-apps">${apps>0?apps+' event applications':'New vendor'}</span>
              <span class="vcard-cta">View profile →</span>
            </div>
          </div>
        </a>`;
      }).join('') : `<div style="grid-column:1/-1;text-align:center;padding:48px;background:var(--warm);border-radius:var(--r-lg);"><div style="font-size:48px;margin-bottom:12px;">🏪</div><h3 style="font-size:20px;margin-bottom:8px;">Be a Founding Vendor</h3><p style="color:var(--ink4);margin-bottom:20px;">Get discovered by event organisers across ${cn} countries.</p><a href="/vendors/register" style="background:var(--sage);color:#fff;padding:12px 28px;border-radius:9px;font-size:14px;font-weight:700;display:inline-block;">Register as Vendor — €49/yr</a></div>`}
    </div>
    <div style="text-align:center;margin-top:28px;display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
      <a href="/vendors/register" style="display:inline-flex;align-items:center;gap:8px;background:var(--sage);color:#fff;padding:14px 32px;border-radius:10px;font-size:14px;font-weight:700;box-shadow:0 6px 24px rgba(74,112,96,.25);">🏪 Become a Verified Vendor</a>
      <a href="/vendors" style="display:inline-flex;align-items:center;gap:8px;background:var(--warm);color:var(--sage);border:2px solid var(--sage);padding:14px 32px;border-radius:10px;font-size:14px;font-weight:700;">Browse All Vendors →</a>
    </div>
  </div>
</section>

<!-- ═══ HOW IT WORKS ══════════════════════════════════════════════════════ -->
<section class="section how-bg">
  <div class="section-inner">
    <div style="text-align:center;margin-bottom:8px;">
      <div class="section-eyebrow ey-neutral" style="margin:0 auto 12px;">How Festmore Works</div>
      <h2 class="section-h dark" style="text-align:center;">Three Paths. One Platform.</h2>
      <p class="section-sub dark" style="text-align:center;margin:8px auto 0;max-width:480px;">Whether you organise events, sell at them or perform at them — Festmore connects you directly.</p>
    </div>
    <div class="how-grid">
      <div class="how-card" style="border-top:3px solid var(--flame);">
        <div class="how-num how-num-flame">1</div>
        <span class="how-icon">🎪</span>
        <div class="how-label" style="color:var(--flame);">For Organisers</div>
        <div class="how-title">List your event, find vendors &amp; artists</div>
        <div class="how-desc">Post your event free. Specify how many vendor spots and artist slots you need. Qualified applicants come to you — reviewed, compared and booked directly.</div>
        <a href="/events/submit" style="display:inline-block;margin-top:16px;color:var(--flame);font-size:13px;font-weight:700;">List event free →</a>
      </div>
      <div class="how-card" style="border-top:3px solid var(--sage);">
        <div class="how-num how-num-sage">2</div>
        <span class="how-icon">🏪</span>
        <div class="how-label" style="color:var(--sage);">For Vendors</div>
        <div class="how-title">Get discovered. Apply to events. Grow your business.</div>
        <div class="how-desc">Create your verified vendor profile. Browse events with open spots. Apply directly to the ones that fit you — no agency, no commission, no middleman.</div>
        <a href="/vendors/register" style="display:inline-block;margin-top:16px;color:var(--sage);font-size:13px;font-weight:700;">Register as vendor →</a>
      </div>
      <div class="how-card" style="border-top:3px solid var(--purple);">
        <div class="how-num how-num-purple">3</div>
        <span class="how-icon">🎨</span>
        <div class="how-label" style="color:var(--purple);">For Artists</div>
        <div class="how-title">Showcase your talent. Get booked.</div>
        <div class="how-desc">Free artist profile with your photos, videos, genre and pricing. Organisers search and contact you directly. Musicians, DJs, comedians, painters, dancers and more.</div>
        <a href="/artists/register" style="display:inline-block;margin-top:16px;color:var(--purple);font-size:13px;font-weight:700;">Register free →</a>
      </div>
    </div>
  </div>
</section>

<!-- ═══ PRICING ═══════════════════════════════════════════════════════════ -->
<section class="section pricing-bg">
  <div class="section-inner">
    <div style="text-align:center;">
      <div class="section-eyebrow ey-gold" style="margin:0 auto 12px;">Transparent Pricing</div>
      <h2 class="section-h" style="text-align:center;">Simple. Fair. No Hidden Fees.</h2>
      <p class="section-sub" style="text-align:center;margin:8px auto 0;">Start free. Upgrade when the value is clear. One booking pays for years.</p>
    </div>
    <div class="pricing-grid">
      <div class="pcard pcard-free">
        <div class="pcard-tier">Free</div>
        <div class="pcard-price">€0</div>
        <div class="pcard-period">Forever free</div>
        ${['Basic artist or event profile','Appear in search results','Browse all events','Contact via Festmore form'].map(f=>`<div class="pcard-feature"><span class="pcard-fi">○</span>${f}</div>`).join('')}
        <a href="/artists/register" class="pcard-cta">Get Started Free</a>
      </div>
      <div class="pcard pcard-standard">
        <div class="pcard-glow pcard-glow-sage"></div>
        <div class="pcard-pop pcard-pop-sage">Best Value</div>
        <div class="pcard-tier">Verified Vendor</div>
        <div class="pcard-price">€49</div>
        <div class="pcard-period">/year · less than €5/month</div>
        ${['✅ Verified badge on profile','Full profile with photos &amp; bio','Your website &amp; contact visible','Apply directly to events','Priority in vendor search','Weekly newsletter inclusion'].map(f=>`<div class="pcard-feature"><span class="pcard-fi" style="color:var(--sage);">✅</span>${f}</div>`).join('')}
        <a href="/vendors/register" class="pcard-cta">Get Verified — €49/yr</a>
      </div>
      <div class="pcard pcard-gold">
        <div class="pcard-glow pcard-glow-gold"></div>
        <div class="pcard-pop pcard-pop-gold">Maximum Visibility</div>
        <div class="pcard-tier">Gold Vendor or Artist</div>
        <div class="pcard-price">€99</div>
        <div class="pcard-period">/year · less than €9/month</div>
        ${['🥇 Gold badge — stands out instantly','Featured on homepage','Top of search results','Dedicated profile page','Direct contact button','Analytics dashboard','All Verified features'].map(f=>`<div class="pcard-feature"><span class="pcard-fi" style="color:var(--gold);">🥇</span>${f}</div>`).join('')}
        <a href="/vendors/register" class="pcard-cta">Get Gold — €99/yr</a>
      </div>
    </div>
  </div>
</section>

<!-- ═══ ARTICLES ══════════════════════════════════════════════════════════ -->
${articles.length ? `
<section class="section" style="background:var(--warm);">
  <div class="section-inner">
    <div class="sec-top">
      <div>
        <div class="section-eyebrow ey-neutral">📰 Guides &amp; Insights</div>
        <h2 class="section-h dark">For Vendors, Artists &amp; Organisers</h2>
      </div>
      <a href="/articles" class="section-link">Read all ${ar}+ articles →</a>
    </div>
    <div class="articles-grid">
      ${articles.map(a => {
        const cc = {festival:'#4a7060',guide:'#c9922a',christmas:'#1a6b8a',market:'#7c4a59'}[a.category] || 'var(--flame)';
        const ds = new Date(a.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});
        return `<a href="/articles/${a.slug}" class="artcard">
          <div class="artcard-img"><img src="${a.image_url||IMGS.default}" alt="${a.title}" loading="lazy"/>
            <span class="artcard-catbadge" style="background:${cc};">${a.category||'Guide'}</span></div>
          <div class="artcard-body">
            <h3 class="artcard-title">${a.title}</h3>
            <p class="artcard-excerpt">${(a.excerpt||'').substring(0,100)}…</p>
            <div class="artcard-footer"><span class="artcard-date">${ds}</span><span class="artcard-cta">Read →</span></div>
          </div>
        </a>`;
      }).join('')}
    </div>
  </div>
</section>` : ''}

<!-- ═══ COUNTRIES ══════════════════════════════════════════════════════════ -->
<section class="section" style="background:#fff;">
  <div class="section-inner">
    <div class="sec-top">
      <div>
        <div class="section-eyebrow ey-neutral">🌍 ${cn} Countries</div>
        <h2 class="section-h dark">Events Everywhere</h2>
      </div>
    </div>
    <div class="countries-grid">
      ${countries.map(c=>`<a href="/events?country=${c.country}" class="ccard"><span class="ccard-flag">${FLAGS[c.country]||'🌍'}</span><span class="ccard-name">${CNAMES[c.country]||c.country}</span><span class="ccard-count">${c.count} events</span></a>`).join('')}
    </div>
  </div>
</section>

<!-- ═══ NEWSLETTER ═════════════════════════════════════════════════════════ -->
<section class="nl-bg">
  <div class="nl-box">
    <div class="nl-left">
      <h2>Stay Ahead of the Market</h2>
      <p>New events, vendor opportunities and booking leads — delivered weekly to ${sb.toLocaleString()}+ industry professionals.</p>
    </div>
    <form class="nl-form" id="nl-form">
      <input type="email" name="email" placeholder="Your email address" required class="nl-input"/>
      <button type="submit" class="nl-btn">Subscribe Free →</button>
    </form>
  </div>
</section>

<!-- ═══ URGENCY ════════════════════════════════════════════════════════════ -->
<div class="urgency">
  <div class="urgency-inner">
    <div>
      <h3>Ready to Grow Your Business?</h3>
      <p>Join ${ev.toLocaleString()}+ events · ${vn}+ vendors · ${cn} countries. Start free, upgrade when you're ready.</p>
    </div>
    <div class="urgency-btns">
      <a href="/events/submit" class="ubtn-w">List Your Event Free</a>
      <a href="/vendors/register" class="ubtn-t">Become a Vendor</a>
    </div>
  </div>
</div>

${renderFooter(stats, cn)}

<script>
document.getElementById('nl-form').addEventListener('submit',function(e){
  e.preventDefault();
  var data={};
  new FormData(e.target).forEach(function(v,k){data[k]=v;});
  fetch('/newsletter/subscribe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)})
    .then(r=>r.json()).then(j=>{
      if(j.ok){document.getElementById('nl-form').innerHTML='<p style="color:#6db89a;font-weight:700;font-size:16px;padding:12px 0;">✅ Subscribed! Welcome to Festmore.</p>';}
      else{alert(j.msg);}
    });
});
document.querySelector('.nav-burger').addEventListener('click',function(){
  document.querySelector('.mobile-menu').classList.toggle('open');
});
</script>
</body></html>`;
}

function eventCard(e) {
  const img = e.image_url || IMGS[e.category] || IMGS.default;
  const flag = FLAGS[e.country] || '';
  const icon = CATS[e.category] || '🎪';
  const isFree = e.price_display==='Free'||e.price_display==='Free Entry';
  return `<article class="ecard" onclick="location.href='/events/${e.slug}'">
  <div class="ecard-img"><img src="${img}" alt="${e.title}" loading="lazy"/>
    <div class="ecard-overlay"></div>
    <div class="ecard-badges">
      ${e.featured?'<span class="ebadge ebadge-feat">★ Featured</span>':''}
      <span class="ebadge ebadge-cat">${icon} ${e.category}</span>
      ${isFree?'<span class="ebadge ebadge-free">Free</span>':''}
    </div>
  </div>
  <div class="ecard-body">
    <div class="ecard-date">${e.date_display||e.start_date||''}</div>
    <h3 class="ecard-title">${e.title}</h3>
    <div class="ecard-loc">📍 ${e.city}${e.country?', '+(CNAMES[e.country]||e.country):''} ${flag}</div>
    <div class="ecard-footer">
      <span class="ecard-att">${e.attendees?'👥 '+parseInt(e.attendees).toLocaleString():''}</span>
      <span class="ecard-cta">View event →</span>
    </div>
  </div>
</article>`;
}

function renderNav(user, langHtml) {
  const userLinks = user
    ? `<a href="/dashboard" class="nav-link">Dashboard</a><a href="/auth/logout" class="nav-link">Logout</a>`
    : `<a href="/auth/login" class="nav-link">Login</a><a href="/events/submit" class="nav-cta">+ List Free</a>`;
  return `<nav class="nav">
  <div class="nav-inner">
    <a href="/" class="nav-logo"><strong>Fest</strong>more</a>
    <form class="nav-search" action="/events" method="GET">
      <span style="color:rgba(255,255,255,.3);font-size:13px;">🔍</span>
      <input type="text" name="q" placeholder="Search events, vendors, artists…"/>
    </form>
    <div class="nav-links">
      <a href="/events" class="nav-link">Events</a>
      <a href="/vendors" class="nav-link">Vendors</a>
      <a href="/artists" class="nav-link">Artists</a>
      <a href="/articles" class="nav-link">Articles</a>
      ${langHtml}
      ${userLinks}
    </div>
    <button class="nav-burger" aria-label="Menu">☰</button>
  </div>
  <div class="mobile-menu">
    <a href="/events">🎪 Events</a>
    <a href="/vendors">🏪 Vendors</a>
    <a href="/artists">🎨 Artists</a>
    <a href="/articles">📰 Articles</a>
    <a href="/events/submit">+ List Event Free</a>
    <a href="/vendors/register">Become a Vendor — €49/yr</a>
    <a href="/artists/register">Register as Artist — Free</a>
    ${user?`<a href="/dashboard">Dashboard</a><a href="/auth/logout">Logout</a>`:`<a href="/auth/login">Login</a>`}
  </div>
</nav>`;
}

function renderFooter(stats, cn) {
  return `<footer>
  <div class="footer-inner">
    <div class="footer-grid">
      <div class="footer-brand">
        <div class="footer-logo"><strong>Fest</strong>more</div>
        <p>The professional marketplace connecting event organisers, vendors and artists. ${stats.events.toLocaleString()}+ events across ${cn} countries worldwide.</p>
      </div>
      <div class="footer-col">
        <h4>For Organisers</h4>
        <a href="/events/submit">List Event Free</a>
        <a href="/events/pricing">Event Pricing</a>
        <a href="/vendors">Find Vendors</a>
        <a href="/artists">Find Artists</a>
      </div>
      <div class="footer-col">
        <h4>For Vendors &amp; Artists</h4>
        <a href="/vendors/register">Register as Vendor</a>
        <a href="/artists/register">Register as Artist</a>
        <a href="/vendors">Browse Vendors</a>
        <a href="/artists">Browse Artists</a>
      </div>
      <div class="footer-col">
        <h4>Company</h4>
        <a href="/about">About Festmore</a>
        <a href="/articles">Articles &amp; Guides</a>
        <a href="/contact">Contact Us</a>
        <a href="/privacy">Privacy Policy</a>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© ${new Date().getFullYear()} Festmore.com</span>
      <span>${stats.events.toLocaleString()}+ Events · ${stats.vendors}+ Vendors · ${cn} Countries</span>
    </div>
  </div>
</footer>`;
}

module.exports.renderNav     = renderNav;
module.exports.renderFooter  = renderFooter;
module.exports.eventCard     = eventCard;
module.exports.FLAGS         = FLAGS;
module.exports.CNAMES        = CNAMES;
module.exports.IMGS          = IMGS;
module.exports.CATS          = CATS;
