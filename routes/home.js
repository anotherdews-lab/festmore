// routes/home.js — COMPLETE IMPROVED VERSION
// ✅ Vendor showcase section added
// ✅ Country count pulled from database (not hardcoded)
// ✅ Featured events banner
// ✅ Events free by default, paid for featured
// ✅ All existing data preserved

const express = require('express');
const router  = express.Router();
const db      = require('../db');
const { t, getLang, langSwitcher } = require('./utils/i18n');

router.get('/', (req, res) => {
  const topEvents     = db.prepare(`SELECT * FROM events WHERE status='active' ORDER BY featured DESC, attendees DESC, id DESC LIMIT 6`).all();
  const featuredEvents = db.prepare(`SELECT * FROM events WHERE status='active' AND featured=1 ORDER BY attendees DESC LIMIT 3`).all();
  const articles      = db.prepare(`SELECT id,title,slug,excerpt,image_url,category,created_at FROM articles WHERE status='published' ORDER BY created_at DESC LIMIT 3`).all();
  const countryCounts = db.prepare(`SELECT country, COUNT(*) as count FROM events WHERE status='active' GROUP BY country ORDER BY count DESC`).all();
  const catCounts     = db.prepare(`SELECT category, COUNT(*) as count FROM events WHERE status='active' GROUP BY category ORDER BY count DESC`).all();
  const vendors       = db.prepare(`SELECT * FROM vendors WHERE status='active' AND payment_status='paid' ORDER BY avg_rating DESC, total_applications DESC, id DESC LIMIT 6`).all();
  const stats = {
    events:      db.prepare("SELECT COUNT(*) as n FROM events WHERE status='active'").get().n,
    vendors:     db.prepare("SELECT COUNT(*) as n FROM vendors WHERE status='active'").get().n,
    articles:    db.prepare("SELECT COUNT(*) as n FROM articles WHERE status='published'").get().n,
    subscribers: db.prepare("SELECT COUNT(*) as n FROM subscribers WHERE active=1").get().n,
    countries:   countryCounts.length,
  };
  const tr   = t(req);
  const lang = getLang(req);
  res.send(renderHome({ topEvents, featuredEvents, articles, countryCounts, catCounts, stats, vendors, user: req.session.user, tr, lang, langHtml: langSwitcher(req) }));
});

router.post('/subscribe', (req, res) => {
  const { email, name, country } = req.body;
  if (!email) return res.json({ ok: false, msg: 'Email required' });
  try {
    db.prepare(`INSERT INTO subscribers (email, name, country) VALUES (?, ?, ?) ON CONFLICT (email) DO NOTHING`).run(email, name || '', country || '');
    res.json({ ok: true, msg: 'Subscribed! Welcome to Festmore.' });
  } catch { res.json({ ok: false, msg: 'Already subscribed!' }); }
});

router.get('/set-lang/:lang', (req, res) => {
  if (req.session) req.session.lang = req.params.lang;
  res.redirect(req.headers.referer || '/');
});

module.exports = router;

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const CATS = {
  festival:'🎪', concert:'🎵', market:'🛍️', christmas:'🎄', exhibition:'🖼️',
  business:'💼', kids:'🎠', comics:'🎮', flea:'🏺', online:'💻', city:'🏙️', messe:'🏛️'
};
const CAT_LABELS = {
  festival:'Festivals', concert:'Concerts', market:'Markets', christmas:'Xmas Markets',
  exhibition:'Exhibitions', business:'Business', kids:'Kids Events', comics:'Comics & Gaming',
  flea:'Flea Markets', online:'Online Events', city:'City Events', messe:'Trade Fairs'
};
const CAT_PHOTOS = {
  festival:   'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=600&q=80',
  concert:    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80',
  market:     'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=80',
  christmas:  'https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=600&q=80',
  exhibition: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=80',
  business:   'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80',
  kids:       'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&q=80',
  flea:       'https://images.unsplash.com/photo-1558402847-7f9d6d65b41c?w=600&q=80',
  city:       'https://images.unsplash.com/photo-1467803738586-46b7eb7b16a1?w=600&q=80',
  messe:      'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&q=80',
  comics:     'https://images.unsplash.com/photo-1608889825205-eebdb9fc5806?w=600&q=80',
  online:     'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=600&q=80',
};
const FLAGS = {
  BE:'🇧🇪', CN:'🇨🇳', DK:'🇩🇰', FR:'🇫🇷', DE:'🇩🇪', NL:'🇳🇱', PL:'🇵🇱', SE:'🇸🇪',
  AE:'🇦🇪', GB:'🇬🇧', US:'🇺🇸', NO:'🇳🇴', FI:'🇫🇮', AT:'🇦🇹', CH:'🇨🇭', IT:'🇮🇹',
  ES:'🇪🇸', PT:'🇵🇹', IE:'🇮🇪', CZ:'🇨🇿', HU:'🇭🇺', GR:'🇬🇷', HR:'🇭🇷',
  IN:'🇮🇳', TH:'🇹🇭', JP:'🇯🇵',
  AU:'🇦🇺', CA:'🇨🇦', BR:'🇧🇷', MX:'🇲🇽', KR:'🇰🇷', ZA:'🇿🇦', AR:'🇦🇷',
  MA:'🇲🇦', SG:'🇸🇬', RO:'🇷🇴',
};
const COUNTRY_NAMES = {
  BE:'Belgium', CN:'China', DK:'Denmark', FR:'France', DE:'Germany', NL:'Netherlands',
  PL:'Poland', SE:'Sweden', AE:'UAE', GB:'United Kingdom', US:'USA', NO:'Norway',
  FI:'Finland', AT:'Austria', CH:'Switzerland', IT:'Italy', ES:'Spain', PT:'Portugal',
  IE:'Ireland', CZ:'Czech Republic', HU:'Hungary', GR:'Greece', HR:'Croatia',
  IN:'India', TH:'Thailand', JP:'Japan',
  AU:'Australia', CA:'Canada', BR:'Brazil', MX:'Mexico', KR:'South Korea',
  ZA:'South Africa', AR:'Argentina', MA:'Morocco', SG:'Singapore', RO:'Romania',
};
const IMGS = {
  festival:   'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&q=75',
  concert:    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=75',
  market:     'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=75',
  christmas:  'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=600&q=75',
  exhibition: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=75',
  business:   'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=75',
  kids:       'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&q=75',
  comics:     'https://images.unsplash.com/photo-1608889825205-eebdb9fc5806?w=600&q=75',
  flea:       'https://images.unsplash.com/photo-1558402847-7f9d6d65b41c?w=600&q=75',
  online:     'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=600&q=75',
  city:       'https://images.unsplash.com/photo-1467803738586-46b7eb7b16a1?w=600&q=75',
  messe:      'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&q=75',
};

// ─── MAIN RENDER ─────────────────────────────────────────────────────────────

function renderHome({ topEvents, featuredEvents, articles, countryCounts, catCounts, stats, vendors, user, tr, lang, langHtml }) {
  const ev = stats.events;
  const vn = stats.vendors;
  const ar = stats.articles;
  const sb = stats.subscribers;
  const cn = stats.countries;

  return `<!DOCTYPE html>
<html lang="${lang}" dir="${tr.dir || 'ltr'}">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Festmore — Festivals, Markets &amp; Events Worldwide | Find &amp; List Events</title>
<meta name="description" content="Discover ${ev}+ festivals, markets and events across ${cn} countries. List your event free or find verified vendors for your next festival."/>
<link rel="canonical" href="https://festmore.com/"/>
<meta property="og:type" content="website"/>
<meta property="og:title" content="Festmore — Festivals, Markets &amp; Events Worldwide"/>
<meta property="og:description" content="Discover ${ev}+ festivals, markets and events across ${cn} countries."/>
<meta property="og:image" content="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200&q=80"/>
<meta property="og:url" content="https://festmore.com/"/>
<meta name="twitter:card" content="summary_large_image"/>
<script type="application/ld+json">{"@context":"https://schema.org","@type":"WebSite","name":"Festmore","url":"https://festmore.com","potentialAction":{"@type":"SearchAction","target":{"@type":"EntryPoint","urlTemplate":"https://festmore.com/events?q={search_term_string}"},"query-input":"required name=search_term_string"}}</script>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;500;600;700;800&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/>
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2486135003689222" crossorigin="anonymous"></script>
<link rel="stylesheet" href="/css/main.css"/>
<style>
body { font-family: 'Bricolage Grotesque', sans-serif; }

/* HERO */
.fm-hero { background:#0a0a0a; padding:100px 0 80px; position:relative; overflow:hidden; }
.fm-hero-bg { position:absolute; inset:0; background-image:url('https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1400&q=60'); background-size:cover; background-position:center; opacity:.2; }
.fm-hero-gradient { position:absolute; inset:0; background:linear-gradient(160deg,rgba(10,10,10,.98) 0%,rgba(10,10,10,.75) 60%,rgba(232,71,10,.1) 100%); }
.fm-hero-inner { position:relative; z-index:2; max-width:1100px; margin:0 auto; padding:0 40px; text-align:center; }
.fm-hero-badge { display:inline-flex; align-items:center; gap:8px; background:rgba(232,71,10,.15); border:1px solid rgba(232,71,10,.3); color:#ff7043; font-size:12px; font-weight:700; padding:6px 16px; border-radius:99px; margin-bottom:24px; letter-spacing:.8px; text-transform:uppercase; }
.fm-hero-badge-dot { width:6px; height:6px; border-radius:50%; background:#ff7043; animation:pulse 2s ease infinite; }
.fm-hero h1 { font-family:'DM Serif Display',serif; font-size:clamp(36px,6vw,72px); color:#fff; line-height:1.05; margin-bottom:16px; font-weight:400; }
.fm-hero h1 em { color:#e8470a; font-style:italic; }
.fm-hero-sub { font-size:18px; color:rgba(255,255,255,.55); margin-bottom:32px; max-width:600px; margin-left:auto; margin-right:auto; line-height:1.6; }
.fm-search-wrap { max-width:760px; margin:0 auto 24px; }
.fm-search-bar { background:#fff; border-radius:16px; padding:8px 8px 8px 20px; display:flex; align-items:center; box-shadow:0 24px 80px rgba(0,0,0,.5); }
.fm-search-icon { font-size:18px; flex-shrink:0; margin-right:8px; }
.fm-search-input { flex:1; border:none; outline:none; font-size:16px; color:#1a1612; background:transparent; font-family:inherit; min-width:0; padding:8px 0; }
.fm-search-divider { width:1px; height:32px; background:#e8e2d9; margin:0 16px; flex-shrink:0; }
.fm-search-location { border:none; outline:none; font-size:15px; color:#1a1612; background:transparent; font-family:inherit; width:180px; flex-shrink:0; padding:8px 0; }
.fm-search-btn { background:#e8470a; color:#fff; border:none; border-radius:12px; padding:14px 28px; font-size:15px; font-weight:700; cursor:pointer; white-space:nowrap; transition:background .2s; font-family:inherit; }
.fm-search-btn:hover { background:#c23d09; }
.fm-date-pills { display:flex; gap:8px; flex-wrap:wrap; justify-content:center; margin-bottom:48px; }
.fm-date-pill { background:rgba(255,255,255,.08); color:rgba(255,255,255,.75); border:1px solid rgba(255,255,255,.15); padding:7px 18px; border-radius:99px; font-size:13px; font-weight:600; text-decoration:none; transition:all .2s; white-space:nowrap; }
.fm-date-pill:hover { background:#e8470a; border-color:#e8470a; color:#fff; }
.fm-hero-stats { display:inline-flex; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.1); border-radius:16px; overflow:hidden; }
.fm-hstat { padding:16px 28px; text-align:center; border-right:1px solid rgba(255,255,255,.08); }
.fm-hstat:last-child { border-right:none; }
.fm-hstat-n { font-family:'DM Serif Display',serif; font-size:26px; color:#fff; display:block; line-height:1; }
.fm-hstat-l { font-size:11px; color:rgba(255,255,255,.4); font-weight:600; letter-spacing:.8px; text-transform:uppercase; margin-top:4px; display:block; }

/* TRUST */
.fm-trust { background:#111; border-bottom:1px solid #1a1a1a; padding:14px 0; }
.fm-trust-inner { max-width:1200px; margin:0 auto; padding:0 40px; display:flex; align-items:center; justify-content:center; gap:36px; flex-wrap:wrap; }
.fm-trust-item { display:flex; align-items:center; gap:8px; font-size:13px; font-weight:600; color:rgba(255,255,255,.45); }

/* FEATURED BANNER */
.fm-featured-banner { background:linear-gradient(135deg,#1a0a00,#2d1200); padding:40px 0; border-bottom:1px solid rgba(232,71,10,.2); }
.fm-featured-inner { max-width:1300px; margin:0 auto; padding:0 40px; }
.fm-featured-tag { display:inline-flex; align-items:center; gap:6px; background:rgba(232,71,10,.2); border:1px solid rgba(232,71,10,.4); color:#ff7043; font-size:11px; font-weight:800; padding:4px 14px; border-radius:99px; margin-bottom:16px; letter-spacing:1px; text-transform:uppercase; }
.fm-featured-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
.fm-feat-card { background:rgba(255,255,255,.04); border:1px solid rgba(232,71,10,.25); border-radius:16px; overflow:hidden; text-decoration:none; display:flex; flex-direction:column; transition:all .25s; position:relative; }
.fm-feat-card:hover { border-color:#e8470a; transform:translateY(-3px); box-shadow:0 16px 48px rgba(232,71,10,.2); }
.fm-feat-img { height:160px; overflow:hidden; position:relative; }
.fm-feat-img img { width:100%; height:100%; object-fit:cover; transition:transform .4s; }
.fm-feat-card:hover .fm-feat-img img { transform:scale(1.06); }
.fm-feat-badge { position:absolute; top:10px; left:10px; background:#e8470a; color:#fff; padding:4px 10px; border-radius:99px; font-size:11px; font-weight:800; }
.fm-feat-body { padding:16px; flex:1; }
.fm-feat-title { font-family:'DM Serif Display',serif; font-size:17px; color:#fff; margin-bottom:6px; line-height:1.2; }
.fm-feat-meta { font-size:12px; color:rgba(255,255,255,.5); }
.fm-feat-cta { font-size:12px; font-weight:700; color:#e8470a; padding:0 16px 14px; }

/* EVENTS */
.fm-events-section { background:#faf8f3; padding:64px 0 48px; }
.fm-events-inner { max-width:1300px; margin:0 auto; padding:0 40px; }
.fm-events-header { display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:28px; }
.fm-events-tag { display:inline-flex; align-items:center; gap:6px; background:rgba(232,71,10,.08); border:1px solid rgba(232,71,10,.18); color:#e8470a; font-size:11px; font-weight:800; padding:3px 14px; border-radius:99px; margin-bottom:10px; letter-spacing:1px; text-transform:uppercase; }
.fm-events-title { font-family:'DM Serif Display',serif; font-size:clamp(24px,3vw,38px); font-weight:400; color:#1a1612; margin-bottom:4px; }
.fm-events-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:22px; }
.fm-ec { background:#fff; border:1px solid #e8e2d9; border-radius:20px; overflow:hidden; transition:all .25s; cursor:pointer; display:flex; flex-direction:column; }
.fm-ec:hover { border-color:#e8470a; box-shadow:0 20px 60px rgba(26,22,18,.12); transform:translateY(-4px); }
.fm-ec-img { height:220px; position:relative; overflow:hidden; flex-shrink:0; }
.fm-ec-img img { width:100%; height:100%; object-fit:cover; transition:transform .4s; }
.fm-ec:hover .fm-ec-img img { transform:scale(1.06); }
.fm-ec-overlay { position:absolute; inset:0; background:linear-gradient(to top,rgba(26,22,18,.5) 0%,transparent 50%); }
.fm-ec-top-badges { position:absolute; top:12px; left:12px; display:flex; gap:6px; }
.fm-ec-badge { padding:4px 10px; border-radius:99px; font-size:11px; font-weight:700; }
.fm-ec-price { position:absolute; top:12px; right:12px; padding:5px 12px; border-radius:99px; font-size:12px; font-weight:800; backdrop-filter:blur(8px); }
.fm-ec-price.free { background:#dcfce7; color:#15803d; }
.fm-ec-price.paid { background:rgba(26,22,18,.7); color:#fff; }
.fm-ec-body { padding:20px; display:flex; flex-direction:column; flex:1; }
.fm-ec-date { font-size:12px; font-weight:700; color:#e8470a; text-transform:uppercase; letter-spacing:.5px; margin-bottom:8px; }
.fm-ec-title { font-family:'DM Serif Display',serif; font-size:20px; font-weight:400; color:#1a1612; margin-bottom:6px; line-height:1.2; }
.fm-ec-location { font-size:13px; color:#7a6f68; margin-bottom:auto; padding-bottom:14px; }
.fm-ec-footer { display:flex; justify-content:space-between; align-items:center; padding-top:14px; border-top:1px solid #f0ece4; margin-top:auto; }
.fm-ec-visitors { font-size:12px; color:#b5ada6; }
.fm-ec-cta { font-size:13px; font-weight:700; color:#e8470a; }

/* VENDOR SECTION */
.fm-vendors-section { background:#fff; padding:64px 0; }
.fm-vendors-inner { max-width:1300px; margin:0 auto; padding:0 40px; }
.fm-vendors-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; margin-top:32px; }
.fm-vc { background:#fff; border:1px solid #e8e2d9; border-radius:20px; overflow:hidden; transition:all .25s; text-decoration:none; display:flex; flex-direction:column; }
.fm-vc:hover { border-color:#4a7c59; box-shadow:0 20px 60px rgba(26,22,18,.1); transform:translateY(-4px); }
.fm-vc-img { height:180px; position:relative; overflow:hidden; background:#f5f0e8; }
.fm-vc-img img { width:100%; height:100%; object-fit:cover; transition:transform .4s; }
.fm-vc:hover .fm-vc-img img { transform:scale(1.06); }
.fm-vc-img-placeholder { width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-size:48px; background:linear-gradient(135deg,#f5f0e8,#e8e2d9); }
.fm-vc-badge { position:absolute; top:10px; left:10px; background:#4a7c59; color:#fff; padding:4px 10px; border-radius:99px; font-size:11px; font-weight:800; }
.fm-vc-body { padding:18px; flex:1; display:flex; flex-direction:column; }
.fm-vc-name { font-family:'DM Serif Display',serif; font-size:18px; color:#1a1612; margin-bottom:4px; }
.fm-vc-cat { font-size:12px; font-weight:700; color:#4a7c59; text-transform:uppercase; letter-spacing:.6px; margin-bottom:6px; }
.fm-vc-loc { font-size:13px; color:#7a6f68; margin-bottom:10px; }
.fm-vc-rating { display:flex; align-items:center; gap:6px; font-size:13px; margin-bottom:auto; padding-bottom:12px; }
.fm-vc-stars { color:#e8470a; letter-spacing:1px; }
.fm-vc-footer { display:flex; justify-content:space-between; align-items:center; padding-top:12px; border-top:1px solid #f0ece4; margin-top:auto; }
.fm-vc-apps { font-size:12px; color:#b5ada6; }
.fm-vc-cta { font-size:13px; font-weight:700; color:#4a7c59; }

/* TRENDING */
.fm-trending { background:#1a1612; padding:18px 0; }
.fm-trending-inner { max-width:1200px; margin:0 auto; padding:0 40px; display:flex; align-items:center; gap:14px; flex-wrap:wrap; justify-content:center; }
.fm-trending-label { font-size:12px; font-weight:700; color:rgba(255,255,255,.3); text-transform:uppercase; letter-spacing:.8px; white-space:nowrap; }
.fm-trending-pill { background:rgba(255,255,255,.06); color:rgba(255,255,255,.65); padding:5px 14px; border-radius:99px; font-size:13px; font-weight:600; text-decoration:none; transition:all .2s; border:1px solid rgba(255,255,255,.08); white-space:nowrap; }
.fm-trending-pill:hover { background:rgba(232,71,10,.2); color:#ff7043; border-color:rgba(232,71,10,.3); }

/* ARTICLES */
.fm-articles-section { background:#faf8f3; padding:64px 0; }
.fm-articles-inner { max-width:1300px; margin:0 auto; padding:0 40px; }
.fm-articles-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:24px; }
.fm-acard { background:#fff; border:1px solid #e8e2d9; border-radius:20px; overflow:hidden; text-decoration:none; display:flex; flex-direction:column; transition:all .25s; }
.fm-acard:hover { border-color:#e8470a; box-shadow:0 20px 60px rgba(26,22,18,.1); transform:translateY(-4px); }
.fm-acard-img { height:200px; overflow:hidden; position:relative; }
.fm-acard-img img { width:100%; height:100%; object-fit:cover; transition:transform .4s; }
.fm-acard:hover .fm-acard-img img { transform:scale(1.06); }
.fm-acard-overlay { position:absolute; inset:0; background:linear-gradient(to top,rgba(26,22,18,.4) 0%,transparent 60%); }
.fm-acard-cat { position:absolute; top:12px; left:12px; padding:4px 12px; border-radius:99px; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.6px; color:#fff; }
.fm-acard-body { padding:22px; flex:1; display:flex; flex-direction:column; }
.fm-acard-title { font-family:'DM Serif Display',serif; font-size:19px; font-weight:400; color:#1a1612; margin-bottom:10px; line-height:1.3; flex:1; }
.fm-acard-excerpt { font-size:13px; color:#7a6f68; line-height:1.6; margin-bottom:16px; }
.fm-acard-footer { display:flex; justify-content:space-between; align-items:center; padding-top:14px; border-top:1px solid #f0ece4; }
.fm-acard-date { font-size:11px; color:#b5ada6; }
.fm-acard-cta { font-size:13px; font-weight:700; color:#e8470a; }

/* SECTION HELPERS */
.fm-section-tag { display:inline-flex; align-items:center; gap:6px; background:rgba(232,71,10,.07); border:1px solid rgba(232,71,10,.15); color:#e8470a; font-size:11px; font-weight:800; padding:4px 14px; border-radius:99px; margin-bottom:16px; letter-spacing:1px; text-transform:uppercase; }
.fm-section-h { font-family:'DM Serif Display',serif; font-size:clamp(26px,3.5vw,44px); font-weight:400; margin-bottom:14px; }

/* CATEGORY PHOTOS */
.fm-cat-section { background:#faf8f3; padding:64px 0; }
.fm-cat-inner { max-width:1300px; margin:0 auto; padding:0 40px; }
.fm-cat-photo-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
.fm-cat-photo-card { border-radius:16px; overflow:hidden; position:relative; aspect-ratio:4/3; cursor:pointer; text-decoration:none; display:block; }
.fm-cat-photo-card img { width:100%; height:100%; object-fit:cover; transition:transform .4s; }
.fm-cat-photo-card:hover img { transform:scale(1.06); }
.fm-cat-photo-overlay { position:absolute; inset:0; background:linear-gradient(to top,rgba(26,22,18,.88) 0%,rgba(26,22,18,.1) 60%); }
.fm-cat-photo-content { position:absolute; bottom:0; left:0; right:0; padding:18px; }
.fm-cat-photo-icon { font-size:22px; display:block; margin-bottom:5px; }
.fm-cat-photo-name { font-size:16px; font-weight:700; color:#fff; display:block; margin-bottom:2px; }
.fm-cat-photo-count { font-size:12px; color:rgba(255,255,255,.6); }

/* WHY */
.fm-why { background:#fff; padding:80px 0; }
.fm-why-inner { max-width:1200px; margin:0 auto; padding:0 40px; }
.fm-why-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:22px; margin-top:48px; }
.fm-why-card { background:#faf8f3; border:1px solid #e8e2d9; border-radius:20px; padding:28px; transition:all .25s; }
.fm-why-card:hover { border-color:#e8470a; box-shadow:0 16px 48px rgba(26,22,18,.08); transform:translateY(-3px); }
.fm-why-icon { font-size:32px; margin-bottom:14px; display:block; }
.fm-why-title { font-size:17px; font-weight:700; color:#1a1612; margin-bottom:8px; }
.fm-why-desc { font-size:13.5px; color:#7a6f68; line-height:1.7; }

/* PRICING */
.fm-dual { background:#0a0a0a; padding:80px 0; position:relative; overflow:hidden; }
.fm-dual::before { content:''; position:absolute; top:-200px; right:-200px; width:600px; height:600px; border-radius:50%; background:radial-gradient(circle,rgba(232,71,10,.1) 0%,transparent 70%); }
.fm-dual-inner { max-width:1100px; margin:0 auto; padding:0 40px; }
.fm-dual-header { text-align:center; margin-bottom:48px; }
.fm-dual-header h2 { font-family:'DM Serif Display',serif; font-size:clamp(26px,4vw,48px); font-weight:400; color:#fff; margin-bottom:12px; }
.fm-dual-header p { font-size:16px; color:rgba(255,255,255,.45); max-width:480px; margin:0 auto; }
.fm-dual-cards { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
.fm-plan-card { border-radius:24px; padding:40px; position:relative; overflow:hidden; }
.fm-plan-organiser { background:linear-gradient(145deg,#1a1612,#2d2520); border:1px solid rgba(232,71,10,.2); }
.fm-plan-vendor { background:linear-gradient(145deg,#0d1f15,#1a3d28); border:1px solid rgba(74,124,89,.25); }
.fm-plan-glow-org { position:absolute; top:-60px; right:-60px; width:200px; height:200px; border-radius:50%; background:radial-gradient(circle,rgba(232,71,10,.18) 0%,transparent 70%); }
.fm-plan-glow-ven { position:absolute; top:-60px; right:-60px; width:200px; height:200px; border-radius:50%; background:radial-gradient(circle,rgba(74,124,89,.25) 0%,transparent 70%); }
.fm-plan-tag { display:inline-block; font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:1px; padding:4px 14px; border-radius:99px; margin-bottom:18px; }
.fm-tag-org { background:rgba(232,71,10,.18); color:#ff7043; }
.fm-tag-ven { background:rgba(74,124,89,.22); color:#7ec99a; }
.fm-plan-emoji { font-size:44px; margin-bottom:14px; display:block; }
.fm-plan-h { font-family:'DM Serif Display',serif; font-size:26px; font-weight:400; color:#fff; margin-bottom:10px; line-height:1.15; }
.fm-plan-sub { font-size:14px; color:rgba(255,255,255,.45); line-height:1.7; margin-bottom:24px; }
.fm-plan-price { background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.08); border-radius:12px; padding:16px 18px; margin-bottom:24px; }
.fm-plan-price-n { font-family:'DM Serif Display',serif; font-size:40px; color:#fff; line-height:1; }
.fm-plan-price-per { color:rgba(255,255,255,.35); font-size:14px; margin-left:4px; }
.fm-plan-price-note { font-size:12px; color:rgba(255,255,255,.3); margin-top:4px; }
.fm-plan-benefit { display:flex; align-items:center; gap:10px; padding:8px 0; border-bottom:1px solid rgba(255,255,255,.05); font-size:13px; color:rgba(255,255,255,.68); }
.fm-plan-benefit:last-of-type { border-bottom:none; }
.fm-plan-cta-org { display:block; text-align:center; margin-top:24px; background:#e8470a; color:#fff; padding:14px 24px; border-radius:12px; font-size:15px; font-weight:700; transition:all .2s; text-decoration:none; }
.fm-plan-cta-org:hover { background:#c23d09; transform:translateY(-2px); }
.fm-plan-cta-ven { display:block; text-align:center; margin-top:24px; background:#fff; color:#1a3d28; padding:14px 24px; border-radius:12px; font-size:15px; font-weight:700; transition:all .2s; text-decoration:none; }
.fm-plan-cta-ven:hover { background:#f0f0f0; transform:translateY(-2px); }

/* PROOF */
.fm-proof { background:#faf8f3; padding:72px 0; }
.fm-proof-inner { max-width:1000px; margin:0 auto; padding:0 40px; text-align:center; }
.fm-proof-stats { display:flex; justify-content:center; background:#fff; border:1px solid #e8e2d9; border-radius:20px; overflow:hidden; margin-bottom:48px; }
.fm-proof-stat { flex:1; padding:28px 20px; text-align:center; border-right:1px solid #e8e2d9; }
.fm-proof-stat:last-child { border-right:none; }
.fm-proof-n { font-family:'DM Serif Display',serif; font-size:40px; color:#1a1612; line-height:1; display:block; }
.fm-proof-l { font-size:11px; font-weight:700; color:#b5ada6; text-transform:uppercase; letter-spacing:.8px; margin-top:5px; display:block; }
.fm-testimonials { display:grid; grid-template-columns:repeat(3,1fr); gap:18px; text-align:left; }
.fm-testi { background:#fff; border:1px solid #e8e2d9; border-radius:16px; padding:22px 24px; }
.fm-testi-stars { color:#e8470a; font-size:13px; margin-bottom:10px; letter-spacing:2px; }
.fm-testi-text { font-size:13.5px; color:#3d3530; line-height:1.75; margin-bottom:14px; font-style:italic; }
.fm-testi-author { display:flex; align-items:center; gap:10px; }
.fm-testi-avatar { width:38px; height:38px; border-radius:50%; background:#e8470a; display:flex; align-items:center; justify-content:center; font-size:15px; color:#fff; font-weight:700; flex-shrink:0; }
.fm-testi-name { font-size:13px; font-weight:700; color:#1a1612; }
.fm-testi-role { font-size:11px; color:#b5ada6; }

/* HOW IT WORKS */
.fm-how { background:#fff; padding:72px 0; }
.fm-how-inner { max-width:1000px; margin:0 auto; padding:0 40px; }
.fm-how-steps { display:grid; grid-template-columns:repeat(4,1fr); gap:20px; margin-top:48px; }
.fm-step { text-align:center; padding:24px 18px; border:1px solid #e8e2d9; border-radius:18px; background:#faf8f3; }
.fm-step-num { width:44px; height:44px; border-radius:50%; background:#e8470a; color:#fff; display:flex; align-items:center; justify-content:center; font-size:17px; font-weight:800; margin:0 auto 14px; }
.fm-step-title { font-size:15px; font-weight:700; color:#1a1612; margin-bottom:7px; }
.fm-step-desc { font-size:12.5px; color:#7a6f68; line-height:1.65; }

/* COUNTRIES */
.fm-countries { background:#faf8f3; padding:64px 0; }
.fm-countries-inner { max-width:1300px; margin:0 auto; padding:0 40px; }
.fm-country-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(140px,1fr)); gap:12px; margin-top:28px; }
.fm-country-card { background:#fff; border:1px solid #e8e2d9; border-radius:12px; padding:14px 16px; text-decoration:none; text-align:center; transition:all .2s; }
.fm-country-card:hover { border-color:#e8470a; transform:translateY(-2px); }
.fm-country-flag { font-size:24px; display:block; margin-bottom:5px; }
.fm-country-name { font-size:13px; font-weight:600; color:#1a1612; display:block; margin-bottom:2px; }
.fm-country-count { font-size:11px; color:#b5ada6; }

/* URGENCY */
.fm-urgency { background:linear-gradient(135deg,#e8470a,#c23d09); padding:28px 0; }
.fm-urgency-inner { max-width:1200px; margin:0 auto; padding:0 40px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:20px; }
.fm-urgency-text h3 { font-family:'DM Serif Display',serif; font-size:22px; font-weight:400; color:#fff; margin-bottom:4px; }
.fm-urgency-text p { font-size:14px; color:rgba(255,255,255,.75); }
.fm-urgency-btns { display:flex; gap:10px; flex-wrap:wrap; }
.fm-urgency-btn-w { background:#fff; color:#e8470a; padding:12px 24px; border-radius:99px; font-size:13.5px; font-weight:700; text-decoration:none; white-space:nowrap; transition:all .2s; }
.fm-urgency-btn-w:hover { transform:translateY(-2px); }
.fm-urgency-btn-t { background:rgba(255,255,255,.15); color:#fff; border:1.5px solid rgba(255,255,255,.4); padding:12px 24px; border-radius:99px; font-size:13.5px; font-weight:700; text-decoration:none; white-space:nowrap; }

@keyframes pulse { 0%,100%{opacity:1;transform:scale(1);}50%{opacity:.6;transform:scale(1.2);} }

@media(max-width:900px){
  .fm-hero-inner,.fm-events-inner,.fm-cat-inner,.fm-why-inner,.fm-dual-inner,.fm-proof-inner,.fm-how-inner,.fm-countries-inner,.fm-trust-inner,.fm-trending-inner,.fm-urgency-inner,.fm-articles-inner,.fm-vendors-inner,.fm-featured-inner { padding:0 20px; }
  .fm-events-grid,.fm-cat-photo-grid,.fm-articles-grid,.fm-vendors-grid,.fm-featured-grid { grid-template-columns:1fr 1fr; }
  .fm-why-grid,.fm-dual-cards,.fm-testimonials { grid-template-columns:1fr; }
  .fm-proof-stats { flex-direction:column; }
  .fm-how-steps { grid-template-columns:1fr 1fr; }
  .fm-search-bar { flex-wrap:wrap; padding:12px; border-radius:12px; gap:8px; }
  .fm-search-input,.fm-search-location { width:100%; }
  .fm-search-divider { display:none; }
  .fm-search-btn { width:100%; text-align:center; }
}
@media(max-width:600px){
  .fm-events-grid,.fm-articles-grid,.fm-vendors-grid,.fm-featured-grid { grid-template-columns:1fr; }
  .fm-how-steps { grid-template-columns:1fr; }
  .fm-hero-stats { flex-direction:column; width:100%; max-width:280px; }
  .fm-hstat { border-right:none; border-bottom:1px solid rgba(255,255,255,.08); }
  .fm-hstat:last-child { border-bottom:none; }
}
</style>
</head>
<body>

${renderNav(user, tr, langHtml)}

<!-- 1. HERO -->
<section class="fm-hero">
  <div class="fm-hero-bg"></div>
  <div class="fm-hero-gradient"></div>
  <div class="fm-hero-inner">
    <div class="fm-hero-badge">
      <span class="fm-hero-badge-dot"></span>
      Europe's #1 Vendor Marketplace
    </div>
    <h1>Find Events. <em>Book Vendors.</em><br/>Grow Together.</h1>
    <p class="fm-hero-sub">The world's best platform connecting festival vendors with event organisers. ${ev}+ events across ${cn} countries.</p>

    <div style="display:flex;gap:14px;flex-wrap:wrap;justify-content:center;margin-bottom:36px;">
      <a href="/events/submit" style="display:inline-flex;align-items:center;gap:10px;background:#e8470a;color:#fff;padding:18px 36px;border-radius:14px;font-size:16px;font-weight:700;text-decoration:none;box-shadow:0 8px 32px rgba(232,71,10,.45);transition:all .2s;" onmouseover="this.style.transform='translateY(-3px)'" onmouseout="this.style.transform=''">
        🎪 List Your Event — Free
      </a>
      <a href="/vendors/register" style="display:inline-flex;align-items:center;gap:10px;background:#4a7c59;color:#fff;padding:18px 36px;border-radius:14px;font-size:16px;font-weight:700;text-decoration:none;box-shadow:0 8px 32px rgba(74,124,89,.45);transition:all .2s;" onmouseover="this.style.transform='translateY(-3px)'" onmouseout="this.style.transform=''">
        🏪 Become a Vendor — €49/yr
      </a>
    </div>

    <div class="fm-search-wrap">
      <form class="fm-search-bar" action="/events" method="GET">
        <span class="fm-search-icon">🔍</span>
        <input class="fm-search-input" type="text" name="q" placeholder="Search festivals, concerts, markets…"/>
        <div class="fm-search-divider"></div>
        <input class="fm-search-location" type="text" name="city" placeholder="📍 City or country"/>
        <button class="fm-search-btn" type="submit">Search</button>
      </form>
    </div>

    <div class="fm-date-pills">
      <a href="/events?when=weekend" class="fm-date-pill">This Weekend</a>
      <a href="/events?when=week" class="fm-date-pill">This Week</a>
      <a href="/events?when=month" class="fm-date-pill">This Month</a>
      <a href="/events?when=summer" class="fm-date-pill">☀️ Summer 2026</a>
      <a href="/events?price=free" class="fm-date-pill">🆓 Free Events</a>
      <a href="/events?category=festival" class="fm-date-pill">🎪 Festivals</a>
      <a href="/events?category=christmas" class="fm-date-pill">🎄 Xmas Markets</a>
    </div>

    <div class="fm-hero-stats">
      <div class="fm-hstat"><span class="fm-hstat-n">${ev}+</span><span class="fm-hstat-l">Events</span></div>
      <div class="fm-hstat"><span class="fm-hstat-n">${vn}+</span><span class="fm-hstat-l">Vendors</span></div>
      <div class="fm-hstat"><span class="fm-hstat-n">${cn}</span><span class="fm-hstat-l">Countries</span></div>
      <div class="fm-hstat"><span class="fm-hstat-n">${sb}+</span><span class="fm-hstat-l">Subscribers</span></div>
    </div>
  </div>
</section>

<!-- 2. TRUST BAR -->
<div class="fm-trust">
  <div class="fm-trust-inner">
    <div class="fm-trust-item"><span style="color:#e8470a;">✓</span>Free Event Listings</div>
    <div class="fm-trust-item"><span style="color:#e8470a;">✓</span>Verified Vendors</div>
    <div class="fm-trust-item"><span style="color:#e8470a;">✓</span>${cn} Countries</div>
    <div class="fm-trust-item"><span style="color:#e8470a;">✓</span>Secure Stripe Payments</div>
    <div class="fm-trust-item"><span style="color:#e8470a;">✓</span>Direct Vendor Applications</div>
  </div>
</div>

<!-- 3. FEATURED EVENTS BANNER (paid listings only) -->
${featuredEvents.length > 0 ? `
<section class="fm-featured-banner">
  <div class="fm-featured-inner">
    <div class="fm-featured-tag">⭐ ${tr.featured_events}</div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
      <h2 style="font-family:'DM Serif Display',serif;font-size:28px;font-weight:400;color:#fff;margin:0;">${tr.featured_events}</h2>
      <a href="/events?sort=featured" style="font-size:13px;font-weight:700;color:#ff7043;text-decoration:none;">${tr.view_all} →</a>
    </div>
    <div class="fm-featured-grid">
      ${featuredEvents.map(e => {
        const img = e.image_url || IMGS[e.category] || IMGS.festival;
        const flag = FLAGS[e.country] || '🌍';
        return `<a href="/events/${e.slug}" class="fm-feat-card">
          <div class="fm-feat-img">
            <img src="${img}" alt="${e.title}" loading="lazy"/>
            <span class="fm-feat-badge">⭐ Featured</span>
          </div>
          <div class="fm-feat-body">
            <div class="fm-feat-title">${e.title}</div>
            <div class="fm-feat-meta">${flag} ${e.city} · ${e.date_display || e.start_date}</div>
          </div>
          <div class="fm-feat-cta">View event →</div>
        </a>`;
      }).join('')}
    </div>
    <div style="margin-top:20px;text-align:center;">
      <a href="/events/pricing" style="font-size:13px;color:rgba(255,255,255,.4);text-decoration:none;">Want your event featured here? <strong style="color:#ff7043;">Upgrade for €79/year →</strong></a>
    </div>
  </div>
</section>` : ''}

<!-- 6. VENDOR SHOWCASE -->
<section class="fm-vendors-section">
  <div class="fm-vendors-inner">
    <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:8px;flex-wrap:wrap;gap:16px;">
      <div>
        <div class="fm-section-tag" style="background:rgba(74,124,89,.08);border-color:rgba(74,124,89,.2);color:#4a7c59;">🏪 Verified Vendors</div>
        <h2 class="fm-section-h" style="margin-bottom:4px;">Meet Our Verified Vendors</h2>
        <p style="font-size:14px;color:#7a6f68;">Food trucks, artisan crafts, entertainment and more — ready to make your event unforgettable.</p>
      </div>
      <a href="/vendors" style="font-size:14px;font-weight:700;color:#4a7c59;text-decoration:none;white-space:nowrap;">View all ${vn}+ vendors →</a>
    </div>

    ${vendors.length > 0 ? `
    <div class="fm-vendors-grid">
      ${vendors.map(v => {
        let photos = [];
        try { photos = JSON.parse(v.photos || '[]'); } catch(e) {}
        const photo = photos[0] || v.image_url || '';
        const rating = parseFloat(v.avg_rating) || 5.0;
        const stars = '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
        const apps = parseInt(v.total_applications) || 0;
        return `<a href="/vendors/profile/${v.id}" class="fm-vc">
          <div class="fm-vc-img">
            ${photo
              ? `<img src="${photo}" alt="${v.business_name}" loading="lazy"/>`
              : `<div class="fm-vc-img-placeholder">🏪</div>`
            }
            <span class="fm-vc-badge">✅ Verified</span>
          </div>
          <div class="fm-vc-body">
            <div class="fm-vc-cat">${v.category || 'Vendor'}</div>
            <div class="fm-vc-name">${v.business_name}</div>
            <div class="fm-vc-loc">📍 ${v.city}${v.country ? ', ' + (COUNTRY_NAMES[v.country] || v.country) : ''}</div>
            <div class="fm-vc-rating">
              <span class="fm-vc-stars">${stars}</span>
              <span style="font-size:12px;color:#7a6f68;">${rating.toFixed(1)}</span>
            </div>
            <div class="fm-vc-footer">
              <span class="fm-vc-apps">${apps > 0 ? apps + ' event applications' : 'New vendor'}</span>
              <span class="fm-vc-cta">View profile →</span>
            </div>
          </div>
        </a>`;
      }).join('')}
    </div>
    <div style="text-align:center;margin-top:32px;">
      <a href="/vendors" style="display:inline-flex;align-items:center;gap:10px;background:#4a7c59;color:#fff;padding:16px 48px;border-radius:12px;font-size:16px;font-weight:700;text-decoration:none;box-shadow:0 8px 32px rgba(74,124,89,.35);">
        Browse All ${vn}+ Vendors →
      </a>
      <div style="margin-top:12px;font-size:13px;color:#b5ada6;">Food Trucks · Artisan Crafts · Entertainment · Market Stalls · Photography</div>
    </div>` : `
    <div style="background:#faf8f3;border:1px solid #e8e2d9;border-radius:20px;padding:48px;text-align:center;">
      <div style="font-size:48px;margin-bottom:16px;">🏪</div>
      <h3 style="font-family:'DM Serif Display',serif;font-size:24px;font-weight:400;margin-bottom:8px;">Be the First Vendor</h3>
      <p style="color:#7a6f68;margin-bottom:24px;">Join Festmore and get discovered by event organisers across ${cn} countries.</p>
      <a href="/vendors/register" class="btn btn-primary btn-lg">Register as Vendor — €49/yr →</a>
    </div>`}
  </div>
</section>

<!-- 4. MUST-SEE EVENTS -->
<section class="fm-events-section">
  <div class="fm-events-inner">
    <div class="fm-events-header">
      <div>
        <div class="fm-events-tag">🔥 Must-See Events</div>
        <h2 class="fm-events-title">Events You Cannot Miss</h2>
        <p style="font-size:14px;color:#7a6f68;">The biggest festivals, markets and concerts worldwide</p>
      </div>
      <a href="/events" style="font-size:14px;font-weight:700;color:#e8470a;text-decoration:none;white-space:nowrap;">View all ${ev}+ →</a>
    </div>
    <div class="fm-events-grid">
      ${topEvents.map(e => fmEventCard(e)).join('')}
    </div>
    <div style="text-align:center;margin-top:36px;">
      <a href="/events" style="display:inline-flex;align-items:center;gap:10px;background:#e8470a;color:#fff;padding:16px 48px;border-radius:12px;font-size:16px;font-weight:700;text-decoration:none;box-shadow:0 8px 32px rgba(232,71,10,.35);">
        Explore All ${ev}+ Events →
      </a>
    </div>
  </div>
</section>

<!-- 5. TRENDING -->
<div class="fm-trending">
  <div class="fm-trending-inner">
    <span class="fm-trending-label">🔍 Trending:</span>
    ${[
      ["Pol'and'Rock 2026","/festival/polandrock-2026"],
      ["Glastonbury 2026","/events?q=glastonbury"],
      ["Tomorrowland 2026","/events?q=tomorrowland"],
      ["Roskilde Festival","/events?q=roskilde"],
      ["Diwali India","/events?q=diwali"],
      ["Christmas Markets","/events?category=christmas"],
      ["Free Festivals","/events?price=free"],
      ["Rock am Ring","/events?q=rock+am+ring"],
      ["Yi Peng Thailand","/events?q=yi+peng"],
    ].map(([label,href]) => `<a href="${href}" class="fm-trending-pill">${label}</a>`).join('')}
  </div>
</div>

<!-- 7. LATEST ARTICLES -->
${articles.length ? `
<section class="fm-articles-section">
  <div class="fm-articles-inner">
    <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:32px;flex-wrap:wrap;gap:16px;">
      <div>
        <div class="fm-section-tag">📰 Latest Articles</div>
        <h2 class="fm-section-h" style="margin-bottom:4px;">${tr.festival_guides}</h2>
        <p style="font-size:14px;color:#7a6f68;">Expert guides for vendors, organisers and festival lovers</p>
      </div>
      <a href="/articles" style="font-size:14px;font-weight:700;color:#e8470a;text-decoration:none;white-space:nowrap;">Read all ${ar}+ articles →</a>
    </div>
    <div class="fm-articles-grid">
      ${articles.map(a => {
        const catColors = { festival:'#4a7c59', guide:'#c9922a', christmas:'#1a6b8a', market:'#7c4a59', default:'#e8470a' };
        const catColor = catColors[a.category] || catColors.default;
        const dateStr = new Date(a.created_at).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' });
        return `<a href="/articles/${a.slug}" class="fm-acard">
          <div class="fm-acard-img">
            <img src="${a.image_url || IMGS.festival}" alt="${a.title}" loading="lazy"/>
            <div class="fm-acard-overlay"></div>
            <span class="fm-acard-cat" style="background:${catColor};">${a.category || 'Guide'}</span>
          </div>
          <div class="fm-acard-body">
            <h3 class="fm-acard-title">${a.title}</h3>
            <p class="fm-acard-excerpt">${(a.excerpt || '').substring(0, 110)}…</p>
            <div class="fm-acard-footer">
              <span class="fm-acard-date">${dateStr}</span>
              <span class="fm-acard-cta">Read more →</span>
            </div>
          </div>
        </a>`;
      }).join('')}
    </div>
  </div>
</section>` : ''}

<!-- 8. ADSENSE -->
<div style="max-width:1300px;margin:0 auto;padding:24px 40px 0;">
  <ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-2486135003689222" data-ad-format="auto" data-full-width-responsive="true"></ins>
  <script>(adsbygoogle=window.adsbygoogle||[]).push({});</script>
</div>

<!-- 9. BROWSE BY CATEGORY -->
<section class="fm-cat-section">
  <div class="fm-cat-inner">
    <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:28px;">
      <div>
        <div class="fm-section-tag">${tr.browse_events}</div>
        <h2 class="fm-section-h">${tr.browse_sub}</h2>
      </div>
      <a href="/events" style="font-size:14px;font-weight:700;color:#e8470a;text-decoration:none;">View all →</a>
    </div>
    <div class="fm-cat-photo-grid">
      ${Object.entries(CATS).slice(0, 8).map(([k, icon]) => {
        const count = (catCounts.find(c => c.category === k) || { count: 0 }).count;
        const photo = CAT_PHOTOS[k] || CAT_PHOTOS.festival;
        return `<a href="/events?category=${k}" class="fm-cat-photo-card">
          <img src="${photo}" alt="${CAT_LABELS[k]}" loading="lazy"/>
          <div class="fm-cat-photo-overlay"></div>
          <div class="fm-cat-photo-content">
            <span class="fm-cat-photo-icon">${icon}</span>
            <span class="fm-cat-photo-name">${CAT_LABELS[k]}</span>
            <span class="fm-cat-photo-count">${count} events</span>
          </div>
        </a>`;
      }).join('')}
    </div>
  </div>
</section>

<!-- 10. WHY FESTMORE -->
<section class="fm-why">
  <div class="fm-why-inner">
    <div style="text-align:center;">
      <div class="fm-section-tag">${tr.why_tag}</div>
      <h2 class="fm-section-h" style="text-align:center;">${tr.why_h}</h2>
      <p style="font-size:15px;color:#7a6f68;max-width:520px;margin:0 auto;line-height:1.75;">${tr.why_sub}</p>
    </div>
    <div class="fm-why-grid">
      ${[
        ['🌍','Worldwide Coverage','Visible to visitors, organisers and vendors across Europe, India, Japan, Thailand and beyond.'],
        ['🔍','Ranks on Google','Every listing gets its own SEO page. Visitors searching for events find you directly on Google.'],
        ['📧','Newsletter to '+sb+'+ Subscribers','Paid listings featured in our weekly newsletter to '+sb+'+ active subscribers.'],
        ['✅','Verified Badge System','Paid vendors and events get a Verified badge that builds trust with organisers and visitors.'],
        ['🏪','Direct Vendor Applications','The only platform where vendors can apply directly to events with available spots worldwide.'],
        ['📊','Real Analytics','Track how many people view your listing and where they come from.'],
      ].map(([icon,title,desc]) => `<div class="fm-why-card">
        <span class="fm-why-icon">${icon}</span>
        <div class="fm-why-title">${title}</div>
        <div class="fm-why-desc">${desc}</div>
      </div>`).join('')}
    </div>
  </div>
</section>

<!-- 11. PRICING -->
<section class="fm-dual">
  <div class="fm-dual-inner">
    <div class="fm-dual-header">
      <div class="fm-section-tag" style="background:rgba(232,71,10,.15);color:#ff7043;">${tr.pricing_tag}</div>
      <h2>${tr.pricing_h}</h2>
      <p>${tr.pricing_sub}</p>
    </div>
    <div class="fm-dual-cards">
      <!-- ORGANISER -->
      <div class="fm-plan-card fm-plan-organiser">
        <div class="fm-plan-glow-org"></div>
        <span class="fm-plan-tag fm-tag-org">${tr.for_organisers}</span>
        <span class="fm-plan-emoji">🎪</span>
        <h3 class="fm-plan-h">List Your Event &amp; Find Vendors</h3>
        <p class="fm-plan-sub">Start free. Upgrade when you want more visibility and vendor applications.</p>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:24px;">
          ${[['Free','€0','Basic listing'],['Featured','€79/yr','Homepage + top'],['Premium','€149/yr','Maximum']].map(([n,p,d]) =>
            `<div style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:12px;text-align:center;">
              <div style="font-size:10px;font-weight:700;color:rgba(255,255,255,.4);text-transform:uppercase;margin-bottom:3px;">${n}</div>
              <div style="font-family:'DM Serif Display',serif;font-size:18px;color:#fff;">${p}</div>
              <div style="font-size:10px;color:rgba(255,255,255,.3);margin-top:2px;">${d}</div>
            </div>`
          ).join('')}
        </div>
        ${['Live within minutes — completely free','Vendors can apply directly to your event','Featured events appear on our homepage','Included in weekly newsletter to '+sb+'+ subscribers','Full SEO page with your own Festmore URL'].map(b => `<div class="fm-plan-benefit">✅ ${b}</div>`).join('')}
        <a href="/events/submit" class="fm-plan-cta-org">List Your Event Free →</a>
        <div style="text-align:center;margin-top:10px;font-size:12px;color:rgba(255,255,255,.25);">No credit card required to start</div>
      </div>
      <!-- VENDOR -->
      <div class="fm-plan-card fm-plan-vendor">
        <div class="fm-plan-glow-ven"></div>
        <span class="fm-plan-tag fm-tag-ven">${tr.for_vendors}</span>
        <span class="fm-plan-emoji">🏪</span>
        <h3 class="fm-plan-h">Get Booked at the World's Best Events</h3>
        <p class="fm-plan-sub">One verified profile. Unlimited opportunities. Less than €5/month.</p>
        <div class="fm-plan-price">
          <div><span class="fm-plan-price-n">€49</span><span class="fm-plan-price-per">/year</span></div>
          <div class="fm-plan-price-note">Less than €5/month · One booking pays for years</div>
        </div>
        ${['Verified badge on your profile','Apply directly to festivals and markets','Discovered by ${cn} countries of organisers','Upload photos and portfolio','Featured in weekly newsletter'].map(b => `<div class="fm-plan-benefit">✅ ${b}</div>`).join('')}
        <a href="/vendors/register" class="fm-plan-cta-ven">Become a Vendor — €49/yr →</a>
        <div style="text-align:center;margin-top:10px;font-size:12px;color:rgba(255,255,255,.25);">One booking pays for the entire year</div>
      </div>
    </div>
  </div>
</section>

<!-- 12. SOCIAL PROOF -->
<section class="fm-proof">
  <div class="fm-proof-inner">
    <div class="fm-section-tag">By the Numbers</div>
    <h2 class="fm-section-h">A Growing Platform You Can Trust</h2>
    <div class="fm-proof-stats" style="margin-top:32px;">
      <div class="fm-proof-stat"><span class="fm-proof-n">${ev}+</span><span class="fm-proof-l">Events</span></div>
      <div class="fm-proof-stat"><span class="fm-proof-n">${vn}+</span><span class="fm-proof-l">Vendors</span></div>
      <div class="fm-proof-stat"><span class="fm-proof-n">${cn}</span><span class="fm-proof-l">Countries</span></div>
      <div class="fm-proof-stat"><span class="fm-proof-n">${sb}+</span><span class="fm-proof-l">Subscribers</span></div>
      <div class="fm-proof-stat"><span class="fm-proof-n">${ar}+</span><span class="fm-proof-l">Articles</span></div>
    </div>
    <div class="fm-testimonials" style="margin-top:40px;">
      ${[
        ['M','Marcus Weber','Event Organiser, Berlin','"Festmore gave our Christmas market incredible online visibility. We received vendor applications within the first week."'],
        ['A','Anna Lindqvist','Street Food Vendor, Stockholm','"Finding the right events used to take hours. Festmore makes it simple — I found 3 new bookings in my first month."'],
        ['P','Pieter van den Berg','Market Organiser, Amsterdam','"The vendor marketplace is genuinely useful. We found exactly the food vendors we needed for our spring market."'],
      ].map(([i,n,r,q]) => `<div class="fm-testi">
        <div class="fm-testi-stars">★★★★★</div>
        <div class="fm-testi-text">${q}</div>
        <div class="fm-testi-author">
          <div class="fm-testi-avatar">${i}</div>
          <div><div class="fm-testi-name">${n}</div><div class="fm-testi-role">${r}</div></div>
        </div>
      </div>`).join('')}
    </div>
  </div>
</section>

<!-- 13. HOW IT WORKS -->
<section class="fm-how">
  <div class="fm-how-inner">
    <div style="text-align:center;">
      <div class="fm-section-tag">How It Works</div>
      <h2 class="fm-section-h" style="text-align:center;">Simple for Everyone</h2>
    </div>
    <div class="fm-how-steps">
      <div class="fm-step"><div class="fm-step-num">1</div><div style="font-size:26px;margin-bottom:10px;">📝</div><div class="fm-step-title">Create Your Profile</div><div class="fm-step-desc">Vendors create a profile. Organisers list their event. Both take under 5 minutes.</div></div>
      <div class="fm-step"><div class="fm-step-num">2</div><div style="font-size:26px;margin-bottom:10px;">🔍</div><div class="fm-step-title">Get Discovered</div><div class="fm-step-desc">Your profile or event appears in search results and across our platform worldwide.</div></div>
      <div class="fm-step"><div class="fm-step-num">3</div><div style="font-size:26px;margin-bottom:10px;">📩</div><div class="fm-step-title">Connect Directly</div><div class="fm-step-desc">Vendors apply to events. Organisers browse vendor profiles. Direct messaging included.</div></div>
      <div class="fm-step"><div class="fm-step-num">4</div><div style="font-size:26px;margin-bottom:10px;">📈</div><div class="fm-step-title">Grow Together</div><div class="fm-step-desc">Vendors get more bookings. Events get better vendors. Everyone wins.</div></div>
    </div>
  </div>
</section>

<!-- 14. BROWSE BY COUNTRY -->
<section class="fm-countries">
  <div class="fm-countries-inner">
    <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:8px;flex-wrap:wrap;gap:16px;">
      <div>
        <div class="fm-section-tag">${tr.browse_country}</div>
        <h2 class="fm-section-h" style="margin-bottom:0;">${tr.browse_country} — ${cn} Countries</h2>
      </div>
    </div>
    <div class="fm-country-grid">
      ${countryCounts.map(c => `
      <a href="/events?country=${c.country}" class="fm-country-card">
        <span class="fm-country-flag">${FLAGS[c.country] || '🌍'}</span>
        <span class="fm-country-name">${COUNTRY_NAMES[c.country] || c.country}</span>
        <span class="fm-country-count">${c.count} events</span>
      </a>`).join('')}
    </div>
  </div>
</section>

<!-- 15. NEWSLETTER -->
<section class="section" style="background:#fff;">
  <div class="container">
    <div class="newsletter-box">
      <div class="newsletter-left">
        <h2>${tr.newsletter_h}</h2>
        <p>${tr.newsletter_sub}</p>
      </div>
      <form class="newsletter-form" id="newsletter-form">
        <input type="email" name="email" placeholder="${tr.newsletter_placeholder}" required class="nl-input"/>
        <button type="submit" class="btn btn-primary">${tr.newsletter_btn}</button>
      </form>
    </div>
  </div>
</section>

<!-- 16. URGENCY CTA -->
<div class="fm-urgency">
  <div class="fm-urgency-inner">
    <div class="fm-urgency-text">
      <h3>${tr.urgency_h.replace('{events}', ev).replace('{vendors}', vn)}</h3>
      <p>${tr.urgency_sub}</p>
    </div>
    <div class="fm-urgency-btns">
      <a href="/events/submit" class="fm-urgency-btn-w">${tr.urgency_btn1}</a>
      <a href="/vendors/register" class="fm-urgency-btn-t">${tr.urgency_btn2}</a>
    </div>
  </div>
</div>

${renderFooter(stats, tr)}

<script>
document.getElementById('newsletter-form').addEventListener('submit', function(e) {
  e.preventDefault();
  var data = {};
  new FormData(e.target).forEach(function(v, k) { data[k] = v; });
  fetch('/subscribe', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) })
    .then(r => r.json())
    .then(json => {
      if (json.ok) {
        document.getElementById('newsletter-form').innerHTML = '<p style="color:#4a7c59;font-weight:700;font-size:16px;padding:20px 0;">✅ ${tr.newsletter_success}</p>';
      } else {
        alert(json.msg);
      }
    });
});
</script>
</body></html>`;
}

// ─── EVENT CARD ───────────────────────────────────────────────────────────────
function fmEventCard(e) {
  const img    = e.image_url || IMGS[e.category] || IMGS.festival;
  const flag   = FLAGS[e.country] || '';
  const icon   = CATS[e.category] || '🎪';
  const isFree = e.price_display === 'Free' || e.price_display === 'Free Entry';
  const price  = isFree ? '🟢 Free' : (e.price_display || 'See website');
  return `<article class="fm-ec" onclick="window.location='/events/${e.slug}'">
  <div class="fm-ec-img">
    <img src="${img}" alt="${e.title}" loading="lazy"/>
    <div class="fm-ec-overlay"></div>
    <div class="fm-ec-top-badges">
      ${e.featured ? '<span class="fm-ec-badge" style="background:#e8470a;color:#fff;">★ Featured</span>' : ''}
      <span class="fm-ec-badge" style="background:rgba(0,0,0,.55);color:#fff;">${icon} ${e.category}</span>
    </div>
    <div class="fm-ec-price ${isFree?'free':'paid'}">${price}</div>
  </div>
  <div class="fm-ec-body">
    <div class="fm-ec-date">${e.date_display || e.start_date || ''}</div>
    <h3 class="fm-ec-title">${e.title}</h3>
    <div class="fm-ec-location">📍 ${e.city}${e.country ? ', '+(COUNTRY_NAMES[e.country]||e.country) : ''} ${flag}</div>
    <div class="fm-ec-footer">
      <span class="fm-ec-visitors">${e.attendees ? '👥 '+parseInt(e.attendees).toLocaleString() : ''}</span>
      <span class="fm-ec-cta">View details →</span>
    </div>
  </div>
</article>`;
}

function eventCardHTML(e) {
  const img    = e.image_url || IMGS[e.category] || IMGS.festival;
  const flag   = FLAGS[e.country] || '';
  const icon   = CATS[e.category] || '';
  const isFree = e.price_display === 'Free';
  const isFL   = e.payment_status === 'free';
  return `<article class="event-card"><a href="/events/${e.slug}">
    <div class="event-img">
      <img src="${img}" alt="${e.title}" loading="lazy"/>
      <div class="event-img-overlay"></div>
      <div class="event-badges">
        ${e.featured ? '<span class="badge badge-feat">★ Featured</span>' : ''}
        <span class="badge badge-cat">${icon} ${e.category}</span>
        ${isFree ? '<span class="badge badge-free">Free</span>' : ''}
        ${isFL ? '<span class="badge" style="background:rgba(0,0,0,.4);color:#fff;">🔓 Unverified</span>' : '<span class="badge" style="background:#4a7c59;color:#fff;">✅ Verified</span>'}
      </div>
    </div>
    <div class="event-body">
      <div class="event-date">${e.date_display || e.start_date}</div>
      <h3>${e.title}</h3>
      <div class="event-loc">${flag} ${e.city}</div>
      <div class="event-footer">
        <span class="event-stat">${(e.attendees || 0).toLocaleString()} visitors</span>
        <span class="event-price ${isFree?'price-free':'price-paid'}">${e.price_display}</span>
      </div>
    </div>
  </a></article>`;
}

function renderNav(user, tr, langHtml) {
  const userLinks = user
    ? `<a href="/dashboard" class="btn btn-outline btn-sm">${tr.nav_dashboard}</a><a href="/auth/logout" class="btn btn-ghost btn-sm">${tr.nav_logout}</a>`
    : `<a href="/auth/login" class="btn btn-outline btn-sm">${tr.nav_login}</a><a href="/events/submit" class="btn btn-primary btn-sm">+ List Event Free</a>`;
  return `<nav class="main-nav">
    <div class="nav-inner">
      <a href="/" class="logo"><span class="logo-fest">Fest</span><span class="logo-more">more</span><span class="logo-dot"></span></a>
      <form class="nav-search" action="/events" method="GET"><span style="color:var(--ink4);font-size:15px;">🔍</span><input type="text" name="q" placeholder="${tr.nav_search}"/></form>
      <div class="nav-right" style="display:flex;align-items:center;gap:8px;">${langHtml}${userLinks}</div>
      <button class="nav-burger" onclick="document.querySelector('.nav-mobile').classList.toggle('open')">☰</button>
    </div>
    <div class="nav-cats-bar">
      <a href="/events" class="nav-cat">🌍 All</a>
      <a href="/events?category=festival" class="nav-cat">🎪 Festivals</a>
      <a href="/events?category=market" class="nav-cat">🛍️ Markets</a>
      <a href="/events?category=christmas" class="nav-cat">🎄 Xmas</a>
      <a href="/events?category=concert" class="nav-cat">🎵 Concerts</a>
      <a href="/events?category=flea" class="nav-cat">🏺 Flea Markets</a>
      <a href="/vendors" class="nav-cat">🏪 Vendors</a>
      <a href="/articles" class="nav-cat">📰 Articles</a>
      <a href="/events/submit" class="nav-cat" style="color:var(--flame);font-weight:700;">+ List Event Free</a>
    </div>
    <div class="nav-mobile">
      <a href="/events">All Events</a>
      <a href="/vendors">Vendors</a>
      <a href="/articles">Articles</a>
      <a href="/events/submit">+ List Event Free</a>
      <a href="/vendors/register">Become a Vendor</a>
      ${user ? `<a href="/dashboard">Dashboard</a><a href="/auth/logout">Logout</a>` : `<a href="/auth/login">Login</a>`}
    </div>
  </nav>`;
}

function renderFooter(stats, tr) {
  return `<footer>
    <div class="footer-top">
      <div class="footer-brand">
        <div class="logo" style="margin-bottom:14px;"><span class="logo-fest" style="color:#fff;">Fest</span><span class="logo-more">more</span></div>
        <p>Europe's leading event vendor marketplace. Connecting festivals with vendors across ${stats.countries || 26} countries worldwide.</p>
      </div>
      <div class="footer-col"><h4>${tr.footer_for_org}</h4><a href="/events/submit">${tr.footer_list}</a><a href="/events/pricing">${tr.footer_pricing}</a><a href="/vendors">${tr.footer_find_vendors}</a><a href="/events">${tr.footer_browse}</a></div>
      <div class="footer-col"><h4>${tr.footer_for_ven}</h4><a href="/vendors/register">${tr.footer_create} — €49/yr</a><a href="/events">${tr.footer_find_vendors}</a><a href="/contact">${tr.footer_contact}</a></div>
      <div class="footer-col"><h4>Company</h4><a href="/about">About Us</a><a href="/articles">Articles</a><a href="/contact">Contact</a><a href="/privacy">Privacy Policy</a></div>
    </div>
    <div class="footer-bottom">
      <span>© ${new Date().getFullYear()} Festmore.com — All rights reserved</span>
      <span>${stats.events}+ Events · ${stats.vendors}+ Vendors · ${stats.countries} Countries</span>
    </div>
  </footer>`;
}

module.exports.renderNav     = renderNav;
module.exports.renderFooter  = renderFooter;
module.exports.eventCardHTML = eventCardHTML;
module.exports.fmEventCard   = fmEventCard;
module.exports.IMGS          = IMGS;
module.exports.FLAGS         = FLAGS;
module.exports.CATS          = CATS;
module.exports.COUNTRY_NAMES = COUNTRY_NAMES;
