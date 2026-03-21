// routes/home.js — MULTI-LANGUAGE VERSION
const express = require('express');
const router  = express.Router();
const db      = require('../db');
const { t, getLang, langSwitcher } = require('./utils/i18n');

router.get('/', (req, res) => {
  const featured      = db.prepare(`SELECT * FROM events WHERE status='active' AND featured=1 ORDER BY views DESC LIMIT 6`).all();
const recent = db.prepare(`SELECT * FROM events WHERE status='active' ORDER BY featured DESC, views DESC, id DESC LIMIT 6`).all();
  const articles      = db.prepare(`SELECT id,title,slug,excerpt,image_url,category,created_at FROM articles WHERE status='published' ORDER BY created_at DESC LIMIT 3`).all();
  const countryCounts = db.prepare(`SELECT country, COUNT(*) as count FROM events WHERE status='active' GROUP BY country ORDER BY count DESC`).all();
  const catCounts     = db.prepare(`SELECT category, COUNT(*) as count FROM events WHERE status='active' GROUP BY category ORDER BY count DESC`).all();
  const stats = {
    events:      db.prepare("SELECT COUNT(*) as n FROM events WHERE status='active'").get().n,
    vendors:     db.prepare("SELECT COUNT(*) as n FROM vendors WHERE status='active'").get().n,
    articles:    db.prepare("SELECT COUNT(*) as n FROM articles WHERE status='published'").get().n,
    subscribers: db.prepare("SELECT COUNT(*) as n FROM subscribers WHERE active=1").get().n,
  };
  const tr   = t(req);
  const lang = getLang(req);
  res.send(renderHome({ featured, recent, articles, countryCounts, catCounts, stats, user: req.session.user, tr, lang, langHtml: langSwitcher(req) }));
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

// Set language via cookie
router.get('/set-lang/:lang', (req, res) => {
  if (req.session) req.session.lang = req.params.lang;
  const back = req.headers.referer || '/';
  res.redirect(back);
});

module.exports = router;

const CATS = { festival:'🎪',concert:'🎵',market:'🛍️',christmas:'🎄',exhibition:'🖼️',business:'💼',kids:'🎠',comics:'🎮',flea:'🏺',online:'💻',city:'🏙️',messe:'🏛️' };
const CAT_LABELS = { festival:'Festivals',concert:'Concerts',market:'Markets',christmas:'Xmas Markets',exhibition:'Exhibitions',business:'Business',kids:'Kids Events',comics:'Comics & Gaming',flea:'Flea Markets',online:'Online Events',city:'City Events',messe:'Trade Fairs' };
const FLAGS = { BE:'🇧🇪',CN:'🇨🇳',DK:'🇩🇰',FR:'🇫🇷',DE:'🇩🇪',NL:'🇳🇱',PL:'🇵🇱',SE:'🇸🇪',AE:'🇦🇪',GB:'🇬🇧',US:'🇺🇸',NO:'🇳🇴', FI:'🇫🇮', AT:'🇦🇹', CH:'🇨🇭', IT:'🇮🇹',
ES:'🇪🇸', PT:'🇵🇹', IE:'🇮🇪', CZ:'🇨🇿', HU:'🇭🇺',
GR:'🇬🇷', HR:'🇭🇷', IN:'🇮🇳', TH:'🇹🇭', JP:'🇯🇵', };
const COUNTRY_NAMES = { BE:'Belgium',CN:'China',DK:'Denmark',FR:'France',DE:'Germany',NL:'Netherlands',PL:'Poland',SE:'Sweden',AE:'UAE',GB:'United Kingdom',US:'USA',NO:'Norway', FI:'Finland', AT:'Austria', CH:'Switzerland', IT:'Italy',
ES:'Spain', PT:'Portugal', IE:'Ireland', CZ:'Czech Republic', HU:'Hungary',
GR:'Greece', HR:'Croatia', IN:'India', TH:'Thailand', JP:'Japan', };
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

function renderHome({ featured, recent, articles, countryCounts, catCounts, stats, user, tr, lang, langHtml }) {
  const ev = stats.events;
  const vn = stats.vendors;
  const ar = stats.articles;
  const sb = stats.subscribers;
  const isRtl = tr.dir === 'rtl';

  return `<!DOCTYPE html>
<html lang="${lang}" dir="${tr.dir || 'ltr'}">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Festmore — Europe's Festival &amp; Event Platform for Organisers and Vendors</title>
<meta name="description" content="List your festival, market or event on Festmore and reach thousands of visitors. Verified vendor profiles connect you with event organisers across 11 countries."/>
<link rel="alternate" hreflang="en" href="https://festmore.com/?lang=en"/>
<link rel="alternate" hreflang="de" href="https://festmore.com/?lang=de"/>
<link rel="alternate" hreflang="da" href="https://festmore.com/?lang=dk"/>
<link rel="alternate" hreflang="nl" href="https://festmore.com/?lang=nl"/>
<link rel="alternate" hreflang="fr" href="https://festmore.com/?lang=fr"/>
<link rel="alternate" hreflang="sv" href="https://festmore.com/?lang=se"/>
<link rel="alternate" hreflang="ar" href="https://festmore.com/?lang=ar"/>
<link rel="alternate" hreflang="zh" href="https://festmore.com/?lang=zh"/>
<link rel="alternate" hreflang="x-default" href="https://festmore.com/"/>
<meta name="robots" content="index,follow"/>
<meta name="robots" content="index,follow"/>
<link rel="canonical" href="https://festmore.com/"/>
<meta property="og:type" content="website"/>
<meta property="og:site_name" content="Festmore"/>
<meta property="og:title" content="Festmore — Europe's Festival &amp; Event Platform"/>
<meta property="og:description" content="List your festival or create a verified vendor profile. Reach thousands of visitors across 11 countries."/>
<meta property="og:image" content="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200&q=80"/>
<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="630"/>
<meta property="og:url" content="https://festmore.com/"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="Festmore — Europe's Festival &amp; Event Platform"/>
<meta name="twitter:description" content="List your festival or create a verified vendor profile."/>
<meta name="twitter:image" content="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200&q=80"/>
<script type="application/ld+json">{"@context":"https://schema.org","@type":"WebSite","name":"Festmore","url":"https://festmore.com","potentialAction":{"@type":"SearchAction","target":{"@type":"EntryPoint","urlTemplate":"https://festmore.com/events?q={search_term_string}"},"query-input":"required name=search_term_string"}}</script>
<script type="application/ld+json">{"@context":"https://schema.org","@type":"Organization","name":"Festmore","url":"https://festmore.com","description":"Europe's festival and vendor marketplace","contactPoint":{"@type":"ContactPoint","email":"hello@festmore.com","contactType":"customer service"}}</script>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;500;600;700;800&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/>
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2486135003689222" crossorigin="anonymous"></script>
<link rel="stylesheet" href="/css/main.css"/>
${isRtl ? '<style>body{font-family:\'Bricolage Grotesque\',sans-serif;} .fm-hero-content,.fm-dual-cards,.fm-why-grid,.fm-how-steps{direction:rtl;} .fm-hero-stats{direction:rtl;}</style>' : ''}
<style>
body { font-family: 'Bricolage Grotesque', sans-serif; }
.fm-hero { background:#0a0a0a; min-height:92vh; display:flex; align-items:center; position:relative; overflow:hidden; }
.fm-hero-bg { position:absolute;inset:0;background-image:url('https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1400&q=60');background-size:cover;background-position:center;opacity:.25; }
.fm-hero-gradient { position:absolute;inset:0;background:linear-gradient(135deg,rgba(10,10,10,.98) 0%,rgba(10,10,10,.7) 50%,rgba(232,71,10,.15) 100%); }
.fm-hero-content { position:relative;z-index:2;max-width:1440px;margin:0 auto;padding:80px 40px;display:grid;grid-template-columns:1.1fr 0.9fr;gap:80px;align-items:center; }
.fm-hero-badge { display:inline-flex;align-items:center;gap:8px;background:rgba(232,71,10,.15);border:1px solid rgba(232,71,10,.3);color:#ff7043;font-size:12px;font-weight:700;padding:6px 16px;border-radius:99px;margin-bottom:28px;letter-spacing:.8px;text-transform:uppercase; }
.fm-hero-badge-dot { width:6px;height:6px;border-radius:50%;background:#ff7043;animation:pulse 2s ease infinite; }
.fm-hero h1 { font-family:'DM Serif Display',serif;font-size:clamp(40px,5.5vw,72px);color:#fff;line-height:1.05;margin-bottom:20px;font-weight:400; }
.fm-hero h1 em { color:#e8470a;font-style:italic; }
.fm-hero-sub { font-size:17px;color:rgba(255,255,255,.6);line-height:1.75;max-width:520px;margin-bottom:36px; }
.fm-hero-ctas { display:flex;gap:12px;flex-wrap:wrap;margin-bottom:52px; }
.fm-cta-primary { display:inline-flex;align-items:center;gap:8px;background:#e8470a;color:#fff;padding:15px 32px;border-radius:12px;font-size:15px;font-weight:700;transition:all .2s;box-shadow:0 8px 32px rgba(232,71,10,.4);text-decoration:none; }
.fm-cta-primary:hover { background:#c23d09;transform:translateY(-2px); }
.fm-cta-secondary { display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.08);color:#fff;border:1.5px solid rgba(255,255,255,.2);padding:15px 32px;border-radius:12px;font-size:15px;font-weight:600;transition:all .2s;text-decoration:none; }
.fm-cta-secondary:hover { background:rgba(255,255,255,.14); }
.fm-hero-stats { display:flex;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:16px;overflow:hidden; }
.fm-hstat { flex:1;padding:18px 24px;text-align:center;border-right:1px solid rgba(255,255,255,.08);min-width:90px; }
.fm-hstat:last-child { border-right:none; }
.fm-hstat-n { font-family:'DM Serif Display',serif;font-size:28px;color:#fff;display:block;line-height:1; }
.fm-hstat-l { font-size:11px;color:rgba(255,255,255,.4);font-weight:600;letter-spacing:.8px;text-transform:uppercase;margin-top:4px;display:block; }
.fm-hero-right { position:relative;height:480px; }
.fm-float-card { position:absolute;background:rgba(255,255,255,.06);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,.12);border-radius:20px;padding:20px 22px;animation:float 4s ease-in-out infinite; }
.fm-float-card:nth-child(2) { animation-delay:-1.5s; }
.fm-float-card:nth-child(3) { animation-delay:-3s; }
.fm-card-1 { top:0;right:20px;width:260px; }
.fm-card-2 { top:160px;left:0;width:240px;animation-delay:-2s; }
.fm-card-3 { bottom:40px;right:40px;width:220px; }
.fm-card-icon { font-size:28px;margin-bottom:10px;display:block; }
.fm-card-title { font-size:13px;font-weight:700;color:#fff;margin-bottom:4px; }
.fm-card-sub { font-size:12px;color:rgba(255,255,255,.5);line-height:1.5; }
.fm-card-price { display:inline-block;margin-top:12px;background:#e8470a;color:#fff;padding:4px 12px;border-radius:99px;font-size:12px;font-weight:700; }
.fm-card-green { background:#4a7c59; }
.fm-trust { background:#111;border-bottom:1px solid #1a1a1a;padding:16px 0; }
.fm-trust-inner { max-width:1440px;margin:0 auto;padding:0 40px;display:flex;align-items:center;justify-content:center;gap:40px;flex-wrap:wrap; }
.fm-trust-item { display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:rgba(255,255,255,.5); }
.fm-trust-dot { color:#e8470a;font-size:16px; }
.fm-why { background:#fff;padding:96px 0; }
.fm-why-inner { max-width:1440px;margin:0 auto;padding:0 40px; }
.fm-section-tag { display:inline-flex;align-items:center;gap:6px;background:rgba(232,71,10,.07);border:1px solid rgba(232,71,10,.15);color:#e8470a;font-size:11px;font-weight:800;padding:4px 14px;border-radius:99px;margin-bottom:16px;letter-spacing:1px;text-transform:uppercase; }
.fm-section-h { font-family:'DM Serif Display',serif;font-size:clamp(28px,4vw,48px);font-weight:400;margin-bottom:14px; }
.fm-why-grid { display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-top:56px; }
.fm-why-card { background:#faf8f3;border:1px solid #e8e2d9;border-radius:20px;padding:32px 28px;transition:all .25s; }
.fm-why-card:hover { border-color:#e8470a;box-shadow:0 20px 60px rgba(26,22,18,.1);transform:translateY(-4px); }
.fm-why-icon { font-size:36px;margin-bottom:16px;display:block; }
.fm-why-title { font-size:18px;font-weight:700;color:#1a1612;margin-bottom:8px; }
.fm-why-desc { font-size:14px;color:#7a6f68;line-height:1.7; }
.fm-dual { background:#0a0a0a;padding:96px 0;position:relative;overflow:hidden; }
.fm-dual::before { content:'';position:absolute;top:-200px;right:-200px;width:600px;height:600px;border-radius:50%;background:radial-gradient(circle,rgba(232,71,10,.12) 0%,transparent 70%); }
.fm-dual-inner { max-width:1200px;margin:0 auto;padding:0 40px; }
.fm-dual-header { text-align:center;margin-bottom:56px; }
.fm-dual-header h2 { font-family:'DM Serif Display',serif;font-size:clamp(28px,4vw,52px);font-weight:400;color:#fff;margin-bottom:14px; }
.fm-dual-header p { font-size:16px;color:rgba(255,255,255,.5);max-width:520px;margin:0 auto;line-height:1.75; }
.fm-dual-cards { display:grid;grid-template-columns:1fr 1fr;gap:20px; }
.fm-plan-card { border-radius:24px;padding:44px 40px;position:relative;overflow:hidden; }
.fm-plan-organiser { background:linear-gradient(145deg,#1a1612,#2d2520);border:1px solid rgba(232,71,10,.25); }
.fm-plan-vendor { background:linear-gradient(145deg,#0d1f15,#1a3d28);border:1px solid rgba(74,124,89,.3); }
.fm-plan-glow-org { position:absolute;top:-60px;right:-60px;width:220px;height:220px;border-radius:50%;background:radial-gradient(circle,rgba(232,71,10,.2) 0%,transparent 70%); }
.fm-plan-glow-ven { position:absolute;top:-60px;right:-60px;width:220px;height:220px;border-radius:50%;background:radial-gradient(circle,rgba(74,124,89,.3) 0%,transparent 70%); }
.fm-plan-tag { display:inline-block;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1px;padding:4px 14px;border-radius:99px;margin-bottom:20px; }
.fm-tag-org { background:rgba(232,71,10,.2);color:#ff7043; }
.fm-tag-ven { background:rgba(74,124,89,.25);color:#7ec99a; }
.fm-plan-emoji { font-size:48px;margin-bottom:16px;display:block; }
.fm-plan-h { font-family:'DM Serif Display',serif;font-size:28px;font-weight:400;color:#fff;margin-bottom:10px;line-height:1.15; }
.fm-plan-sub { font-size:14.5px;color:rgba(255,255,255,.5);line-height:1.75;margin-bottom:28px; }
.fm-plan-price { background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:18px 20px;margin-bottom:28px; }
.fm-plan-price-n { font-family:'DM Serif Display',serif;font-size:42px;color:#fff;line-height:1; }
.fm-plan-price-per { color:rgba(255,255,255,.4);font-size:14px;margin-left:4px; }
.fm-plan-price-note { font-size:12px;color:rgba(255,255,255,.35);margin-top:4px; }
.fm-plan-benefit { display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid rgba(255,255,255,.06);font-size:13.5px;color:rgba(255,255,255,.72); }
.fm-plan-benefit:last-of-type { border-bottom:none; }
.fm-plan-cta-org { display:block;text-align:center;margin-top:28px;background:#e8470a;color:#fff;padding:14px 28px;border-radius:12px;font-size:15px;font-weight:700;transition:all .2s;text-decoration:none;box-shadow:0 8px 24px rgba(232,71,10,.35); }
.fm-plan-cta-org:hover { background:#c23d09;transform:translateY(-2px); }
.fm-plan-cta-ven { display:block;text-align:center;margin-top:28px;background:#fff;color:#1a3d28;padding:14px 28px;border-radius:12px;font-size:15px;font-weight:700;transition:all .2s;text-decoration:none; }
.fm-plan-cta-ven:hover { background:#f0f0f0;transform:translateY(-2px); }
.fm-proof { background:#faf8f3;padding:80px 0; }
.fm-proof-inner { max-width:1100px;margin:0 auto;padding:0 40px;text-align:center; }
.fm-proof-stats { display:flex;justify-content:center;background:#fff;border:1px solid #e8e2d9;border-radius:20px;overflow:hidden;box-shadow:0 8px 32px rgba(26,22,18,.06);margin-bottom:56px; }
.fm-proof-stat { flex:1;padding:32px 24px;text-align:center;border-right:1px solid #e8e2d9; }
.fm-proof-stat:last-child { border-right:none; }
.fm-proof-n { font-family:'DM Serif Display',serif;font-size:44px;color:#1a1612;line-height:1;display:block; }
.fm-proof-l { font-size:12px;font-weight:700;color:#b5ada6;text-transform:uppercase;letter-spacing:.8px;margin-top:6px;display:block; }
.fm-testimonials { display:grid;grid-template-columns:repeat(3,1fr);gap:20px;text-align:left; }
.fm-testi { background:#fff;border:1px solid #e8e2d9;border-radius:16px;padding:24px 26px; }
.fm-testi-stars { color:#e8470a;font-size:14px;margin-bottom:12px;letter-spacing:2px; }
.fm-testi-text { font-size:14px;color:#3d3530;line-height:1.75;margin-bottom:16px;font-style:italic; }
.fm-testi-author { display:flex;align-items:center;gap:10px; }
.fm-testi-avatar { width:40px;height:40px;border-radius:50%;background:#e8470a;display:flex;align-items:center;justify-content:center;font-size:16px;color:#fff;font-weight:700;flex-shrink:0; }
.fm-testi-name { font-size:13px;font-weight:700;color:#1a1612; }
.fm-testi-role { font-size:11px;color:#b5ada6; }
.fm-how { background:#fff;padding:96px 0; }
.fm-how-inner { max-width:1100px;margin:0 auto;padding:0 40px; }
.fm-how-steps { display:grid;grid-template-columns:repeat(4,1fr);gap:24px;margin-top:56px; }
.fm-step { text-align:center;padding:28px 20px;border:1px solid #e8e2d9;border-radius:20px;background:#faf8f3; }
.fm-step-num { width:48px;height:48px;border-radius:50%;background:#e8470a;color:#fff;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:800;margin:0 auto 16px; }
.fm-step-title { font-size:16px;font-weight:700;color:#1a1612;margin-bottom:8px; }
.fm-step-desc { font-size:13px;color:#7a6f68;line-height:1.65; }
.fm-urgency { background:linear-gradient(135deg,#e8470a,#c23d09);padding:28px 0;position:relative;overflow:hidden; }
.fm-urgency-inner { max-width:1440px;margin:0 auto;padding:0 40px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:20px;position:relative; }
.fm-urgency-text h3 { font-family:'DM Serif Display',serif;font-size:22px;font-weight:400;color:#fff;margin-bottom:4px; }
.fm-urgency-text p { font-size:14px;color:rgba(255,255,255,.75); }
.fm-urgency-btns { display:flex;gap:10px;flex-wrap:wrap; }
.fm-urgency-btn-w { background:#fff;color:#e8470a;padding:12px 24px;border-radius:99px;font-size:13.5px;font-weight:700;text-decoration:none;white-space:nowrap;transition:all .2s; }
.fm-urgency-btn-w:hover { transform:translateY(-2px);box-shadow:0 8px 20px rgba(0,0,0,.2); }
.fm-urgency-btn-t { background:rgba(255,255,255,.15);color:#fff;border:1.5px solid rgba(255,255,255,.4);padding:12px 24px;border-radius:99px;font-size:13.5px;font-weight:700;text-decoration:none;white-space:nowrap;transition:all .2s; }
.fm-urgency-btn-t:hover { background:rgba(255,255,255,.25); }
@keyframes fadeUp { from{opacity:0;transform:translateY(30px);}to{opacity:1;transform:translateY(0);} }
@keyframes float { 0%,100%{transform:translateY(0);}50%{transform:translateY(-10px);} }
@keyframes pulse { 0%,100%{opacity:1;transform:scale(1);}50%{opacity:.6;transform:scale(1.2);} }
@media(max-width:900px){.fm-hero-content{grid-template-columns:1fr;gap:40px;padding:60px 24px;}.fm-hero-right{display:none;}.fm-why-grid{grid-template-columns:1fr;}.fm-dual-cards{grid-template-columns:1fr;}.fm-proof-stats{flex-direction:column;}.fm-testimonials{grid-template-columns:1fr;}.fm-how-steps{grid-template-columns:1fr 1fr;}.fm-dual-inner,.fm-why-inner,.fm-proof-inner,.fm-how-inner{padding:0 24px;}.fm-urgency-inner{padding:0 24px;}.fm-trust-inner{padding:0 24px;gap:20px;}}
</style>
</head>
<body>

${renderNav(user, tr, langHtml)}

<!-- HERO -->
<section class="fm-hero">
  <div class="fm-hero-bg"></div>
  <div class="fm-hero-gradient"></div>
  <div class="fm-hero-content">
    <div class="fm-hero-left">
      <div class="fm-hero-badge"><span class="fm-hero-badge-dot"></span>${tr.hero_badge}</div>
      <h1>${tr.hero_h1_1}<br/>${tr.hero_h1_2}<br/><em>${tr.hero_h1_3}</em></h1>
      <p class="fm-hero-sub">${tr.hero_sub}</p>
      <div class="fm-hero-ctas">
        <a href="/events/submit" class="fm-cta-primary">${tr.hero_cta1}</a>
        <a href="/vendors/register" class="fm-cta-secondary">${tr.hero_cta2}</a>
      </div>
      <div class="fm-hero-stats">
        <div class="fm-hstat"><span class="fm-hstat-n">${ev}+</span><span class="fm-hstat-l">${tr.stat_events}</span></div>
        <div class="fm-hstat"><span class="fm-hstat-n">${vn}+</span><span class="fm-hstat-l">${tr.stat_vendors}</span></div>
        <div class="fm-hstat"><span class="fm-hstat-n">11</span><span class="fm-hstat-l">${tr.stat_countries}</span></div>
        <div class="fm-hstat"><span class="fm-hstat-n">${sb}+</span><span class="fm-hstat-l">${tr.stat_subscribers}</span></div>
      </div>
    </div>
    <div class="fm-hero-right">
      <div class="fm-float-card fm-card-1"><span class="fm-card-icon">🎪</span><div class="fm-card-title">Berlin Christmas Market 2025</div><div class="fm-card-sub">4M visitors expected · 200 vendor spots</div><span class="fm-card-price">✅ Verified Listing</span></div>
      <div class="fm-float-card fm-card-2"><span class="fm-card-icon">🏪</span><div class="fm-card-title">Bratwurst Brothers</div><div class="fm-card-sub">Munich · Food & Drinks · 84 events attended</div><span class="fm-card-price fm-card-green">✅ Verified Vendor</span></div>
      <div class="fm-float-card fm-card-3"><span class="fm-card-icon">💰</span><div class="fm-card-title">New Application!</div><div class="fm-card-sub">Nordic Street Food applied to Roskilde Festival 2026</div></div>
    </div>
  </div>
</section>

<!-- TRUST BAR -->
<div class="fm-trust">
  <div class="fm-trust-inner">
    <div class="fm-trust-item"><span class="fm-trust-dot">✓</span>${tr.trust_1}</div>
    <div class="fm-trust-item"><span class="fm-trust-dot">✓</span>${tr.trust_2}</div>
    <div class="fm-trust-item"><span class="fm-trust-dot">✓</span>${tr.trust_3}</div>
    <div class="fm-trust-item"><span class="fm-trust-dot">✓</span>${tr.trust_4}</div>
    <div class="fm-trust-item"><span class="fm-trust-dot">✓</span>${tr.trust_5}</div>
  </div>
</div>

<div class="ad-leaderboard"><ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-2486135003689222" data-ad-format="auto" data-full-width-responsive="true"></ins><script>(adsbygoogle=window.adsbygoogle||[]).push({});</script></div>

<!-- WHY FESTMORE -->
<section class="fm-why">
  <div class="fm-why-inner">
    <div style="text-align:center;">
      <div class="fm-section-tag">${tr.why_tag}</div>
      <h2 class="fm-section-h" style="text-align:center;">${tr.why_h}</h2>
      <p style="font-size:16px;color:#7a6f68;max-width:560px;margin:0 auto;line-height:1.75;">${tr.why_sub}</p>
    </div>
    <div class="fm-why-grid">
      ${[
        ['🌍','Reach 11 Countries','Your listing is visible to visitors, organisers and vendors across Germany, Denmark, Netherlands, UK, France, Sweden, Belgium, Poland, UAE, USA and China.'],
        ['🔍','SEO-Optimised Pages','Every listing gets its own SEO page that ranks on Google. Visitors searching for events in your city find you directly.'],
        ['📧','Newsletter to '+sb+'+ Subscribers','Paid listings are featured in our weekly newsletter to '+sb+'+ subscribers actively looking for events and vendors.'],
        ['✅','Verified Badge System','Paid vendors and events get a Verified badge that builds trust with organisers and visitors.'],
        ['🏪','Vendor Marketplace','The only European platform where vendors can apply directly to events with available spots.'],
        ['📊','Real Analytics','Track how many people view your listing and where they come from.'],
      ].map(([icon,title,desc]) => `<div class="fm-why-card"><span class="fm-why-icon">${icon}</span><div class="fm-why-title">${title}</div><div class="fm-why-desc">${desc}</div></div>`).join('')}
    </div>
  </div>
</section>

<!-- PRICING -->
<section class="fm-dual">
  <div class="fm-dual-inner">
    <div class="fm-dual-header">
      <div class="fm-section-tag" style="background:rgba(232,71,10,.15);color:#ff7043;">${tr.pricing_tag}</div>
      <h2>${tr.pricing_h.replace('\n','<br/>')}</h2>
      <p>${tr.pricing_sub}</p>
    </div>
    <div class="fm-dual-cards">
      <div class="fm-plan-card fm-plan-organiser">
        <div class="fm-plan-glow-org"></div>
        <span class="fm-plan-tag fm-tag-org">${tr.for_organisers}</span>
        <span class="fm-plan-emoji">🎪</span>
        <h3 class="fm-plan-h">Get Your Event in Front of Thousands of Visitors</h3>
        <p class="fm-plan-sub">Choose your plan — start free and upgrade when you want more visibility.</p>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:28px;">
          ${[['Free','€0','Basic'],['Standard','€79/yr','Full'],['Premium','€149/yr','Top']].map(([n,p,d])=>`<div style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:14px 12px;text-align:center;"><div style="font-size:11px;font-weight:700;color:rgba(255,255,255,.5);text-transform:uppercase;letter-spacing:.6px;margin-bottom:4px;">${n}</div><div style="font-family:'DM Serif Display',serif;font-size:20px;color:#fff;">${p}</div><div style="font-size:11px;color:rgba(255,255,255,.35);margin-top:2px;">${d}</div></div>`).join('')}
        </div>
        ${['Live within 24 hours','Visible in 11 countries','SEO page with your own URL','Weekly newsletter inclusion','Connect with verified vendors','Track views and analytics'].map(b=>`<div class="fm-plan-benefit">✅ ${b}</div>`).join('')}
        <a href="/events/pricing" class="fm-plan-cta-org">${tr.list_event_cta}</a>
      </div>
      <div class="fm-plan-card fm-plan-vendor">
        <div class="fm-plan-glow-ven"></div>
        <span class="fm-plan-tag fm-tag-ven">${tr.for_vendors}</span>
        <span class="fm-plan-emoji">🏪</span>
        <h3 class="fm-plan-h">Get Booked at Europe's Best Festivals and Markets</h3>
        <p class="fm-plan-sub">One verified profile. Unlimited opportunities. Less than €5/month.</p>
        <div class="fm-plan-price"><div><span class="fm-plan-price-n">€49</span><span class="fm-plan-price-per">/year</span></div><div class="fm-plan-price-note">Less than €5/month · One booking pays for years</div></div>
        ${['Verified badge on your profile','Apply directly to festivals and markets','Discovered by organisers in 11 countries','Featured in weekly newsletter','See who views your profile','Stand out from unverified competitors'].map(b=>`<div class="fm-plan-benefit">✅ ${b}</div>`).join('')}
        <a href="/vendors/register" class="fm-plan-cta-ven">${tr.vendor_cta}</a>
      </div>
    </div>
  </div>
</section>

<!-- SOCIAL PROOF -->
<section class="fm-proof">
  <div class="fm-proof-inner">
    <div class="fm-section-tag">By the Numbers</div>
    <h2 class="fm-section-h">A Growing Platform You Can Trust</h2>
    <div class="fm-proof-stats" style="margin-top:36px;">
      <div class="fm-proof-stat"><span class="fm-proof-n">${ev}+</span><span class="fm-proof-l">${tr.stat_events}</span></div>
      <div class="fm-proof-stat"><span class="fm-proof-n">${vn}+</span><span class="fm-proof-l">${tr.stat_vendors}</span></div>
      <div class="fm-proof-stat"><span class="fm-proof-n">11</span><span class="fm-proof-l">${tr.stat_countries}</span></div>
      <div class="fm-proof-stat"><span class="fm-proof-n">${sb}+</span><span class="fm-proof-l">${tr.stat_subscribers}</span></div>
      <div class="fm-proof-stat"><span class="fm-proof-n">${ar}+</span><span class="fm-proof-l">Articles</span></div>
    </div>
    <div class="fm-testimonials" style="margin-top:48px;">
      ${[
        ['M','Marcus Weber','Event Organiser, Berlin','"Festmore gave our Christmas market incredible online visibility. We received vendor applications within the first week of listing."'],
        ['A','Anna Lindqvist','Street Food Vendor, Stockholm','"As a vendor, finding the right events used to take hours. Festmore makes it simple — I found 3 new bookings in my first month."'],
        ['P','Pieter van den Berg','Market Organiser, Amsterdam','"The vendor marketplace is genuinely useful. We found exactly the food vendors we needed for our spring market through Festmore."'],
      ].map(([i,n,r,q])=>`<div class="fm-testi"><div class="fm-testi-stars">★★★★★</div><div class="fm-testi-text">${q}</div><div class="fm-testi-author"><div class="fm-testi-avatar">${i}</div><div><div class="fm-testi-name">${n}</div><div class="fm-testi-role">${r}</div></div></div></div>`).join('')}
    </div>
  </div>
</section>

<!-- HOW IT WORKS -->
<section class="fm-how">
  <div class="fm-how-inner">
    <div style="text-align:center;">
      <div class="fm-section-tag">${tr.how_tag}</div>
      <h2 class="fm-section-h" style="text-align:center;">${tr.how_h}</h2>
    </div>
    <div class="fm-how-steps">
      <div class="fm-step"><div class="fm-step-num">1</div><div style="font-size:28px;margin-bottom:12px;">📝</div><div class="fm-step-title">${tr.step1_title}</div><div class="fm-step-desc">${tr.step1_desc}</div></div>
      <div class="fm-step"><div class="fm-step-num">2</div><div style="font-size:28px;margin-bottom:12px;">💳</div><div class="fm-step-title">${tr.step2_title}</div><div class="fm-step-desc">${tr.step2_desc}</div></div>
      <div class="fm-step"><div class="fm-step-num">3</div><div style="font-size:28px;margin-bottom:12px;">✅</div><div class="fm-step-title">${tr.step3_title}</div><div class="fm-step-desc">${tr.step3_desc}</div></div>
      <div class="fm-step"><div class="fm-step-num">4</div><div style="font-size:28px;margin-bottom:12px;">📈</div><div class="fm-step-title">${tr.step4_title}</div><div class="fm-step-desc">${tr.step4_desc}</div></div>
    </div>
  </div>
</section>

<div class="ad-leaderboard"><ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-2486135003689222" data-ad-format="auto" data-full-width-responsive="true"></ins><script>(adsbygoogle=window.adsbygoogle||[]).push({});</script></div>

<!-- HAPPENING SOON — REAL EVENTS -->
<section class="section" style="padding-top:56px;padding-bottom:40px;">
  <div class="container">
    <div class="section-header">
      <div>
        <div style="display:inline-flex;align-items:center;gap:6px;background:rgba(232,71,10,.08);border:1px solid rgba(232,71,10,.15);color:var(--flame);font-size:11px;font-weight:800;padding:3px 12px;border-radius:99px;margin-bottom:10px;letter-spacing:1px;text-transform:uppercase;">🔥 Happening Soon</div>
        <h2 class="section-title">Events You Cannot Miss</h2>
        <p class="section-sub">Hand-picked upcoming events across Europe and beyond</p>
      </div>
      <a href="/events" class="section-link">${tr.view_all} ${ev}+ ${tr.events_label} →</a>
    </div>
    <div class="events-grid">
     ${(recent.length ? recent : featured).map(e=>eventCardHTML(e)).join('')}
    </div>
    <div style="text-align:center;margin-top:32px;">
      <a href="/events" class="btn btn-primary btn-lg" style="padding:16px 48px;font-size:16px;">
        Explore All ${ev}+ Events →
      </a>
      <div style="margin-top:12px;font-size:13px;color:var(--ink4);">
        Festivals · Markets · Concerts · Christmas Markets · and more
      </div>
    </div>
  </div>
</section>

<!-- TOP SEARCHES THIS WEEK -->
<section style="background:var(--ink);padding:32px 0;">
  <div class="container">
    <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;justify-content:center;">
      <span style="font-size:13px;font-weight:700;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:.8px;">🔍 Trending:</span>
      ${[
        ["Pol'and'Rock 2026", "/festival/polandrock-2026"],
        ["Glastonbury 2026", "/events?q=glastonbury"],
        ["Tomorrowland 2026", "/events?q=tomorrowland"],
        ["Roskilde Festival", "/events?q=roskilde"],
        ["Christmas Markets", "/events?category=christmas"],
        ["Free Festivals", "/events?price=free"],
        ["Rock am Ring 2026", "/events?q=rock+am+ring"],
      ].map(([label, href]) => `
      <a href="${href}" style="background:rgba(255,255,255,.08);color:rgba(255,255,255,.75);padding:7px 16px;border-radius:99px;font-size:13px;font-weight:600;text-decoration:none;transition:all .2s;border:1px solid rgba(255,255,255,.1);" onmouseover="this.style.background='rgba(255,255,255,.15)';this.style.color='#fff'" onmouseout="this.style.background='rgba(255,255,255,.08)';this.style.color='rgba(255,255,255,.75)'">${label}</a>`).join('')}
    </div>
  </div>
</section>

<!-- BROWSE CATEGORIES -->
<section class="section section-warm">
  <div class="container">
    <div class="section-header">
      <div><h2 class="section-title">${tr.browse_events}</h2><p class="section-sub">${tr.browse_sub}</p></div>
      <a href="/events" class="section-link">${tr.view_all} ${ev}+ ${tr.events_label} →</a>
    </div>
    <div class="cats-grid">
      ${Object.entries(CATS).map(([k,icon]) => {
        const count = (catCounts.find(c => c.category===k)||{count:0}).count;
        return '<a href="/events?category='+k+'" class="cat-card"><span class="cat-icon">'+icon+'</span><span class="cat-name">'+CAT_LABELS[k]+'</span><span class="cat-count">'+count+' '+tr.events_label+'</span></a>';
      }).join('')}
    </div>
  </div>
</section>

${featured.length ? `
<section class="section section-dark">
  <div class="container">
    <div class="section-header section-header-light">
      <div><h2 class="section-title light">${tr.featured_events}</h2><p class="section-sub light">${tr.featured_sub}</p></div>
      <a href="/events" class="section-link light">${tr.view_all} →</a>
    </div>
    <div class="events-grid">${featured.map(e=>eventCardHTML(e)).join('')}</div>
  </div>
</section>` : ''}

<section class="section">
  <div class="container">
    <div class="section-header">
      <div><h2 class="section-title">${tr.browse_country}</h2></div>
    </div>
    <div class="countries-grid">
      ${countryCounts.map(c=>'<a href="/events?country='+c.country+'" class="country-card"><span class="country-flag">'+(FLAGS[c.country]||'')+'</span><span class="country-name">'+(COUNTRY_NAMES[c.country]||c.country)+'</span><span class="country-count">'+c.count+' '+tr.events_label+'</span></a>').join('')}
    </div>
  </div>
</section>

${articles.length ? `
<section class="section section-warm">
  <div class="container">
    <div class="section-header">
      <div><h2 class="section-title">${tr.festival_guides}</h2><p class="section-sub">${tr.guides_sub}</p></div>
      <a href="/articles" class="section-link">${tr.view_all} ${ar}+ ${tr.all_articles} →</a>
    </div>
    <div class="articles-grid">
      ${articles.map(a=>'<a href="/articles/'+a.slug+'" class="article-card"><div class="article-img"><img src="'+(a.image_url||IMGS.festival)+'" alt="'+a.title+'" loading="lazy"/></div><div class="article-body"><div class="article-cat">'+(CATS[a.category]||'')+' '+(a.category||'Guide')+'</div><h3>'+a.title+'</h3><p>'+(a.excerpt||'').substring(0,100)+'…</p></div></a>').join('')}
    </div>
  </div>
</section>` : ''}

<!-- NEWSLETTER -->
<section class="section">
  <div class="container">
    <div class="newsletter-box">
      <div class="newsletter-left">
        <h2>${tr.newsletter_h}</h2>
        <p>${tr.newsletter_sub} ${sb}+ subscribers.</p>
      </div>
      <form class="newsletter-form" id="newsletter-form">
        <input type="email" name="email" placeholder="${tr.newsletter_placeholder}" required class="nl-input"/>
        <button type="submit" class="btn btn-primary">${tr.newsletter_btn}</button>
      </form>
    </div>
  </div>
</section>

<!-- URGENCY -->
<div class="fm-urgency">
  <div class="fm-urgency-inner">
    <div class="fm-urgency-text">
      <h3>${tr.urgency_h.replace('{events}',ev).replace('{vendors}',vn)}</h3>
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
document.getElementById('newsletter-form').addEventListener('submit',function(e){
  e.preventDefault();
  var data={};
  new FormData(e.target).forEach(function(v,k){data[k]=v;});
  fetch('/subscribe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)})
    .then(function(r){return r.json();})
    .then(function(json){
      if(json.ok){document.getElementById('newsletter-form').innerHTML='<p style="color:#4a7c59;font-weight:700;font-size:16px;padding:20px 0;">${tr.newsletter_success}</p>';}
      else{alert(json.msg);}
    });
});
</script>
</body>
</html>`;
}

function eventCardHTML(e) {
  const img = e.image_url || IMGS[e.category] || IMGS.festival;
  const flag = FLAGS[e.country] || '';
  const icon = CATS[e.category] || '';
  const isFree = e.price_display === 'Free';
  const isFL = e.payment_status === 'free';
  return '<article class="event-card"><a href="/events/'+e.slug+'"><div class="event-img"><img src="'+img+'" alt="'+e.title+'" loading="lazy"/><div class="event-img-overlay"></div><div class="event-badges">'+(e.featured?'<span class="badge badge-feat">★ Featured</span>':'')+'<span class="badge badge-cat">'+icon+' '+e.category+'</span>'+(isFree?'<span class="badge badge-free">Free</span>':'')+(isFL?'<span class="badge" style="background:rgba(0,0,0,.4);color:#fff;">🔓 Unverified</span>':'<span class="badge" style="background:#4a7c59;color:#fff;">✅ Verified</span>')+'</div></div><div class="event-body"><div class="event-date">'+(e.date_display||e.start_date)+'</div><h3>'+e.title+'</h3><div class="event-loc">'+flag+' '+e.city+'</div><div class="event-footer"><span class="event-stat">'+(e.attendees||0).toLocaleString()+' visitors</span><span class="event-price '+(isFree?'price-free':'price-paid')+'">'+e.price_display+'</span></div></div></a></article>';
}

function renderNav(user, tr, langHtml) {
  const userLinks = user
    ? '<a href="/dashboard" class="btn btn-outline btn-sm">'+tr.nav_dashboard+'</a><a href="/auth/logout" class="btn btn-ghost btn-sm">'+tr.nav_logout+'</a>'
    : '<a href="/auth/login" class="btn btn-outline btn-sm">'+tr.nav_login+'</a><a href="/events/submit" class="btn btn-primary btn-sm">'+tr.nav_list_event+'</a>';
  return '<nav class="main-nav"><div class="nav-inner"><a href="/" class="logo"><span class="logo-fest">Fest</span><span class="logo-more">more</span><span class="logo-dot"></span></a><form class="nav-search" action="/events" method="GET"><span style="color:var(--ink4);font-size:15px;">🔍</span><input type="text" name="q" placeholder="'+tr.nav_search+'"/></form><div class="nav-right" style="display:flex;align-items:center;gap:8px;">'+langHtml+userLinks+'</div><button class="nav-burger" onclick="document.querySelector(\'.nav-mobile\').classList.toggle(\'open\')">☰</button></div><div class="nav-cats-bar"><a href="/events" class="nav-cat">🌍 '+tr.nav_all+'</a><a href="/events?category=festival" class="nav-cat">🎪 '+tr.nav_festivals+'</a><a href="/events?category=market" class="nav-cat">🛍️ '+tr.nav_markets+'</a><a href="/events?category=christmas" class="nav-cat">🎄 '+tr.nav_xmas+'</a><a href="/events?category=concert" class="nav-cat">🎵 '+tr.nav_concerts+'</a><a href="/events?category=city" class="nav-cat">🏙️ '+tr.nav_city+'</a><a href="/events?category=flea" class="nav-cat">🏺 '+tr.nav_flea+'</a><a href="/articles" class="nav-cat">📰 '+tr.nav_articles+'</a><a href="/vendors" class="nav-cat">🏪 '+tr.nav_vendors+'</a><a href="/events/pricing" class="nav-cat" style="color:var(--flame);font-weight:700;">'+tr.nav_pricing+'</a></div><div class="nav-mobile"><a href="/events">'+tr.nav_all+'</a><a href="/articles">'+tr.nav_articles+'</a><a href="/vendors">'+tr.nav_vendors+'</a><a href="/events/submit">'+tr.nav_list_event+'</a><a href="/vendors/register">'+tr.nav_become_vendor+'</a><a href="/events/pricing">'+tr.nav_pricing+'</a>'+(user?'<a href="/dashboard">'+tr.nav_dashboard+'</a><a href="/auth/logout">'+tr.nav_logout+'</a>':'<a href="/auth/login">'+tr.nav_login+'</a>')+'</div></nav>';
}

function renderFooter(stats, tr) {
  return '<footer><div class="footer-top"><div class="footer-brand"><div class="logo" style="margin-bottom:14px;"><span class="logo-fest" style="color:#fff;">Fest</span><span class="logo-more">more</span></div><p>'+tr.footer_desc+'</p></div><div class="footer-col"><h4>'+tr.footer_for_org+'</h4><a href="/events/submit">'+tr.footer_list+'</a><a href="/events/pricing">'+tr.footer_pricing+'</a><a href="/vendors">'+tr.footer_find_vendors+'</a><a href="/events">'+tr.footer_browse+'</a></div><div class="footer-col"><h4>'+tr.footer_for_ven+'</h4><a href="/vendors/register">'+tr.footer_create+'</a><a href="/events">'+tr.footer_browse+'</a><a href="/contact">'+tr.footer_contact+'</a></div><div class="footer-col"><h4>'+tr.footer_about+'</h4><a href="/about">'+tr.footer_about_us+'</a><a href="/articles">'+tr.footer_articles+'</a><a href="/contact">'+tr.footer_contact+'</a><a href="/privacy">'+tr.footer_privacy+'</a></div></div><div class="footer-bottom"><span>© '+new Date().getFullYear()+' Festmore.com — '+tr.footer_rights+'</span><span>'+stats.events+'+ '+tr.stat_events+' · '+stats.vendors+'+ '+tr.stat_vendors+'</span></div></footer>';
}

module.exports.renderNav = renderNav;
module.exports.renderFooter = renderFooter;
module.exports.eventCardHTML = eventCardHTML;
module.exports.IMGS = IMGS;
module.exports.FLAGS = FLAGS;
module.exports.CATS = CATS;
module.exports.COUNTRY_NAMES = COUNTRY_NAMES;