// routes/home.js — CONVERSION-FOCUSED REBUILD
// Designed to make organisers and vendors want to pay immediately
const express = require('express');
const router  = express.Router();
const db      = require('../db');

router.get('/', (req, res) => {
  const featured      = db.prepare(`SELECT * FROM events WHERE status='active' AND featured=1 ORDER BY views DESC LIMIT 6`).all();
  const recent        = db.prepare(`SELECT * FROM events WHERE status='active' ORDER BY created_at DESC LIMIT 6`).all();
  const articles      = db.prepare(`SELECT id,title,slug,excerpt,image_url,category,created_at FROM articles WHERE status='published' ORDER BY created_at DESC LIMIT 3`).all();
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
  const ev = stats.events;
  const vn = stats.vendors;
  const ar = stats.articles;
  const sb = stats.subscribers;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Festmore — Europe's Festival & Event Platform for Organisers and Vendors</title>
<meta name="description" content="List your festival, market or event on Festmore and reach thousands of visitors. Verified vendor profiles connect you with event organisers across 11 countries."/>
<link rel="canonical" href="https://festmore.com/"/>
<meta property="og:title" content="Festmore — Europe's Festival & Event Platform"/>
<meta property="og:description" content="List your event or create a vendor profile. Reach thousands of visitors across Europe."/>
<meta property="og:image" content="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200&q=80"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;500;600;700;800&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/>
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2486135003689222" crossorigin="anonymous"></script>
<link rel="stylesheet" href="/css/main.css"/>
<style>
/* ── HOMEPAGE SPECIFIC STYLES ── */
body { font-family: 'Bricolage Grotesque', sans-serif; }

/* HERO */
.fm-hero {
  background: #0a0a0a;
  min-height: 92vh;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
}
.fm-hero-bg {
  position: absolute; inset: 0;
  background-image: url('https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1400&q=60');
  background-size: cover; background-position: center;
  opacity: 0.25;
}
.fm-hero-gradient {
  position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(10,10,10,.98) 0%, rgba(10,10,10,.7) 50%, rgba(232,71,10,.15) 100%);
}
.fm-hero-content {
  position: relative; z-index: 2;
  max-width: 1440px; margin: 0 auto; padding: 80px 40px;
  display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 80px; align-items: center;
}
.fm-hero-left { animation: fadeUp .8s cubic-bezier(.22,1,.36,1) both; }
.fm-hero-badge {
  display: inline-flex; align-items: center; gap: 8px;
  background: rgba(232,71,10,.15); border: 1px solid rgba(232,71,10,.3);
  color: #ff7043; font-size: 12px; font-weight: 700;
  padding: 6px 16px; border-radius: 99px; margin-bottom: 28px;
  letter-spacing: .8px; text-transform: uppercase;
}
.fm-hero-badge-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: #ff7043; animation: pulse 2s ease infinite;
}
.fm-hero h1 {
  font-family: 'DM Serif Display', serif;
  font-size: clamp(40px, 5.5vw, 72px);
  color: #fff; line-height: 1.05;
  margin-bottom: 20px; font-weight: 400;
}
.fm-hero h1 em { color: #e8470a; font-style: italic; }
.fm-hero-sub {
  font-size: 17px; color: rgba(255,255,255,.6);
  line-height: 1.75; max-width: 520px; margin-bottom: 36px;
}
.fm-hero-ctas {
  display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 52px;
}
.fm-cta-primary {
  display: inline-flex; align-items: center; gap: 8px;
  background: #e8470a; color: #fff; padding: 15px 32px;
  border-radius: 12px; font-size: 15px; font-weight: 700;
  transition: all .2s; box-shadow: 0 8px 32px rgba(232,71,10,.4);
  text-decoration: none;
}
.fm-cta-primary:hover { background: #c23d09; transform: translateY(-2px); box-shadow: 0 12px 40px rgba(232,71,10,.5); }
.fm-cta-secondary {
  display: inline-flex; align-items: center; gap: 8px;
  background: rgba(255,255,255,.08); color: #fff;
  border: 1.5px solid rgba(255,255,255,.2);
  padding: 15px 32px; border-radius: 12px; font-size: 15px; font-weight: 600;
  transition: all .2s; text-decoration: none;
}
.fm-cta-secondary:hover { background: rgba(255,255,255,.14); border-color: rgba(255,255,255,.4); }

/* Hero stats */
.fm-hero-stats {
  display: flex; gap: 0; flex-wrap: wrap;
  background: rgba(255,255,255,.05);
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 16px; overflow: hidden;
}
.fm-hstat {
  flex: 1; padding: 18px 24px; text-align: center;
  border-right: 1px solid rgba(255,255,255,.08);
  min-width: 100px;
}
.fm-hstat:last-child { border-right: none; }
.fm-hstat-n {
  font-family: 'DM Serif Display', serif;
  font-size: 28px; color: #fff; display: block; line-height: 1;
}
.fm-hstat-l { font-size: 11px; color: rgba(255,255,255,.4); font-weight: 600; letter-spacing: .8px; text-transform: uppercase; margin-top: 4px; display: block; }

/* Hero right - floating cards */
.fm-hero-right { position: relative; height: 480px; }
.fm-float-card {
  position: absolute; background: rgba(255,255,255,.06);
  backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,.12);
  border-radius: 20px; padding: 20px 22px;
  animation: float 4s ease-in-out infinite;
}
.fm-float-card:nth-child(2) { animation-delay: -1.5s; }
.fm-float-card:nth-child(3) { animation-delay: -3s; }
.fm-card-1 { top: 0; right: 20px; width: 260px; }
.fm-card-2 { top: 160px; left: 0; width: 240px; animation-delay: -2s; }
.fm-card-3 { bottom: 40px; right: 40px; width: 220px; }
.fm-card-icon { font-size: 28px; margin-bottom: 10px; display: block; }
.fm-card-title { font-size: 13px; font-weight: 700; color: #fff; margin-bottom: 4px; }
.fm-card-sub { font-size: 12px; color: rgba(255,255,255,.5); line-height: 1.5; }
.fm-card-price {
  display: inline-block; margin-top: 12px;
  background: #e8470a; color: #fff;
  padding: 4px 12px; border-radius: 99px;
  font-size: 12px; font-weight: 700;
}
.fm-card-green { background: #4a7c59; }

/* TRUST BAR */
.fm-trust {
  background: #111; border-bottom: 1px solid #1a1a1a;
  padding: 16px 0;
}
.fm-trust-inner {
  max-width: 1440px; margin: 0 auto; padding: 0 40px;
  display: flex; align-items: center; justify-content: center;
  gap: 40px; flex-wrap: wrap;
}
.fm-trust-item {
  display: flex; align-items: center; gap: 8px;
  font-size: 13px; font-weight: 600; color: rgba(255,255,255,.5);
}
.fm-trust-dot { color: #e8470a; font-size: 16px; }

/* WHY FESTMORE */
.fm-why { background: #fff; padding: 96px 0; }
.fm-why-inner { max-width: 1440px; margin: 0 auto; padding: 0 40px; }
.fm-section-tag {
  display: inline-flex; align-items: center; gap: 6px;
  background: rgba(232,71,10,.07); border: 1px solid rgba(232,71,10,.15);
  color: #e8470a; font-size: 11px; font-weight: 800;
  padding: 4px 14px; border-radius: 99px; margin-bottom: 16px;
  letter-spacing: 1px; text-transform: uppercase;
}
.fm-section-h { font-family: 'DM Serif Display', serif; font-size: clamp(28px,4vw,48px); font-weight: 400; margin-bottom: 14px; }
.fm-section-sub { font-size: 16px; color: #7a6f68; max-width: 560px; line-height: 1.75; }

.fm-why-grid {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 24px; margin-top: 56px;
}
.fm-why-card {
  background: #faf8f3; border: 1px solid #e8e2d9;
  border-radius: 20px; padding: 32px 28px;
  transition: all .25s;
}
.fm-why-card:hover { border-color: #e8470a; box-shadow: 0 20px 60px rgba(26,22,18,.1); transform: translateY(-4px); }
.fm-why-icon { font-size: 36px; margin-bottom: 16px; display: block; }
.fm-why-title { font-size: 18px; font-weight: 700; color: #1a1612; margin-bottom: 8px; }
.fm-why-desc { font-size: 14px; color: #7a6f68; line-height: 1.7; }

/* DUAL CTA SECTION */
.fm-dual { background: #0a0a0a; padding: 96px 0; position: relative; overflow: hidden; }
.fm-dual::before {
  content: ''; position: absolute; top: -200px; right: -200px;
  width: 600px; height: 600px; border-radius: 50%;
  background: radial-gradient(circle, rgba(232,71,10,.12) 0%, transparent 70%);
}
.fm-dual-inner { max-width: 1200px; margin: 0 auto; padding: 0 40px; }
.fm-dual-header { text-align: center; margin-bottom: 56px; }
.fm-dual-header h2 { font-family: 'DM Serif Display', serif; font-size: clamp(28px,4vw,52px); font-weight: 400; color: #fff; margin-bottom: 14px; }
.fm-dual-header p { font-size: 16px; color: rgba(255,255,255,.5); max-width: 520px; margin: 0 auto; line-height: 1.75; }

.fm-dual-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

.fm-plan-card {
  border-radius: 24px; padding: 44px 40px;
  position: relative; overflow: hidden;
}
.fm-plan-organiser {
  background: linear-gradient(145deg, #1a1612, #2d2520);
  border: 1px solid rgba(232,71,10,.25);
}
.fm-plan-vendor {
  background: linear-gradient(145deg, #0d1f15, #1a3d28);
  border: 1px solid rgba(74,124,89,.3);
}
.fm-plan-glow-org {
  position: absolute; top: -60px; right: -60px;
  width: 220px; height: 220px; border-radius: 50%;
  background: radial-gradient(circle, rgba(232,71,10,.2) 0%, transparent 70%);
}
.fm-plan-glow-ven {
  position: absolute; top: -60px; right: -60px;
  width: 220px; height: 220px; border-radius: 50%;
  background: radial-gradient(circle, rgba(74,124,89,.3) 0%, transparent 70%);
}
.fm-plan-tag {
  display: inline-block; font-size: 11px; font-weight: 800;
  text-transform: uppercase; letter-spacing: 1px;
  padding: 4px 14px; border-radius: 99px; margin-bottom: 20px;
}
.fm-tag-org { background: rgba(232,71,10,.2); color: #ff7043; }
.fm-tag-ven { background: rgba(74,124,89,.25); color: #7ec99a; }
.fm-plan-emoji { font-size: 48px; margin-bottom: 16px; display: block; }
.fm-plan-h { font-family: 'DM Serif Display', serif; font-size: 28px; font-weight: 400; color: #fff; margin-bottom: 10px; line-height: 1.15; }
.fm-plan-sub { font-size: 14.5px; color: rgba(255,255,255,.5); line-height: 1.75; margin-bottom: 28px; }
.fm-plan-price {
  background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1);
  border-radius: 14px; padding: 18px 20px; margin-bottom: 28px;
}
.fm-plan-price-n { font-family: 'DM Serif Display', serif; font-size: 42px; color: #fff; line-height: 1; }
.fm-plan-price-per { color: rgba(255,255,255,.4); font-size: 14px; margin-left: 4px; }
.fm-plan-price-note { font-size: 12px; color: rgba(255,255,255,.35); margin-top: 4px; }
.fm-plan-benefit {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 0; border-bottom: 1px solid rgba(255,255,255,.06);
  font-size: 13.5px; color: rgba(255,255,255,.72);
}
.fm-plan-benefit:last-of-type { border-bottom: none; }
.fm-plan-cta-org {
  display: block; text-align: center; margin-top: 28px;
  background: #e8470a; color: #fff; padding: 14px 28px;
  border-radius: 12px; font-size: 15px; font-weight: 700;
  transition: all .2s; text-decoration: none;
  box-shadow: 0 8px 24px rgba(232,71,10,.35);
}
.fm-plan-cta-org:hover { background: #c23d09; transform: translateY(-2px); }
.fm-plan-cta-ven {
  display: block; text-align: center; margin-top: 28px;
  background: #fff; color: #1a3d28; padding: 14px 28px;
  border-radius: 12px; font-size: 15px; font-weight: 700;
  transition: all .2s; text-decoration: none;
}
.fm-plan-cta-ven:hover { background: #f0f0f0; transform: translateY(-2px); }

/* SOCIAL PROOF */
.fm-proof { background: #faf8f3; padding: 80px 0; }
.fm-proof-inner { max-width: 1100px; margin: 0 auto; padding: 0 40px; text-align: center; }
.fm-proof-stats {
  display: flex; justify-content: center; gap: 0;
  background: #fff; border: 1px solid #e8e2d9;
  border-radius: 20px; overflow: hidden;
  box-shadow: 0 8px 32px rgba(26,22,18,.06);
  margin-bottom: 56px;
}
.fm-proof-stat {
  flex: 1; padding: 32px 24px; text-align: center;
  border-right: 1px solid #e8e2d9;
}
.fm-proof-stat:last-child { border-right: none; }
.fm-proof-n { font-family: 'DM Serif Display', serif; font-size: 44px; color: #1a1612; line-height: 1; display: block; }
.fm-proof-l { font-size: 12px; font-weight: 700; color: #b5ada6; text-transform: uppercase; letter-spacing: .8px; margin-top: 6px; display: block; }

/* TESTIMONIALS */
.fm-testimonials { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; text-align: left; }
.fm-testi {
  background: #fff; border: 1px solid #e8e2d9; border-radius: 16px;
  padding: 24px 26px;
}
.fm-testi-stars { color: #e8470a; font-size: 14px; margin-bottom: 12px; letter-spacing: 2px; }
.fm-testi-text { font-size: 14px; color: #3d3530; line-height: 1.75; margin-bottom: 16px; font-style: italic; }
.fm-testi-author { display: flex; align-items: center; gap: 10px; }
.fm-testi-avatar {
  width: 40px; height: 40px; border-radius: 50%;
  background: #e8470a; display: flex; align-items: center; justify-content: center;
  font-size: 16px; color: #fff; font-weight: 700; flex-shrink: 0;
}
.fm-testi-name { font-size: 13px; font-weight: 700; color: #1a1612; }
.fm-testi-role { font-size: 11px; color: #b5ada6; }

/* HOW IT WORKS */
.fm-how { background: #fff; padding: 96px 0; }
.fm-how-inner { max-width: 1100px; margin: 0 auto; padding: 0 40px; }
.fm-how-steps { display: grid; grid-template-columns: repeat(4,1fr); gap: 24px; margin-top: 56px; }
.fm-step {
  text-align: center; padding: 28px 20px;
  border: 1px solid #e8e2d9; border-radius: 20px;
  background: #faf8f3; position: relative;
}
.fm-step-num {
  width: 48px; height: 48px; border-radius: 50%;
  background: #e8470a; color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; font-weight: 800; margin: 0 auto 16px;
}
.fm-step-title { font-size: 16px; font-weight: 700; color: #1a1612; margin-bottom: 8px; }
.fm-step-desc { font-size: 13px; color: #7a6f68; line-height: 1.65; }

/* URGENCY BANNER */
.fm-urgency {
  background: linear-gradient(135deg, #e8470a, #c23d09);
  padding: 28px 0; position: relative; overflow: hidden;
}
.fm-urgency::before {
  content: ''; position: absolute; inset: 0;
  background: url('https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1400&q=20') center/cover;
  opacity: .08;
}
.fm-urgency-inner {
  max-width: 1440px; margin: 0 auto; padding: 0 40px;
  display: flex; justify-content: space-between; align-items: center;
  flex-wrap: wrap; gap: 20px; position: relative;
}
.fm-urgency-text h3 { font-family: 'DM Serif Display', serif; font-size: 22px; font-weight: 400; color: #fff; margin-bottom: 4px; }
.fm-urgency-text p { font-size: 14px; color: rgba(255,255,255,.75); }
.fm-urgency-btns { display: flex; gap: 10px; flex-wrap: wrap; }
.fm-urgency-btn-w {
  background: #fff; color: #e8470a; padding: 12px 24px;
  border-radius: 99px; font-size: 13.5px; font-weight: 700;
  text-decoration: none; white-space: nowrap; transition: all .2s;
}
.fm-urgency-btn-w:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,.2); }
.fm-urgency-btn-t {
  background: rgba(255,255,255,.15); color: #fff;
  border: 1.5px solid rgba(255,255,255,.4);
  padding: 12px 24px; border-radius: 99px;
  font-size: 13.5px; font-weight: 700;
  text-decoration: none; white-space: nowrap; transition: all .2s;
}
.fm-urgency-btn-t:hover { background: rgba(255,255,255,.25); }

@keyframes fadeUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
@keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-10px); } }
@keyframes pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:.6; transform:scale(1.2); } }

@media (max-width: 900px) {
  .fm-hero-content { grid-template-columns: 1fr; gap: 40px; padding: 60px 24px; }
  .fm-hero-right { display: none; }
  .fm-why-grid { grid-template-columns: 1fr; }
  .fm-dual-cards { grid-template-columns: 1fr; }
  .fm-proof-stats { flex-direction: column; }
  .fm-testimonials { grid-template-columns: 1fr; }
  .fm-how-steps { grid-template-columns: 1fr 1fr; }
  .fm-dual-inner, .fm-why-inner, .fm-proof-inner, .fm-how-inner { padding: 0 24px; }
  .fm-urgency-inner { padding: 0 24px; }
  .fm-trust-inner { padding: 0 24px; gap: 20px; }
}
</style>
</head>
<body>

${renderNav(user)}

<!-- ═══════════════════════════════════════
     HERO — Speaks to BOTH audiences
═══════════════════════════════════════ -->
<section class="fm-hero">
  <div class="fm-hero-bg"></div>
  <div class="fm-hero-gradient"></div>
  <div class="fm-hero-content">
    <div class="fm-hero-left">
      <div class="fm-hero-badge">
        <span class="fm-hero-badge-dot"></span>
        Europe's #1 Festival & Vendor Platform
      </div>
      <h1>Where Events<br/>Meet Their<br/><em>Perfect Vendors</em></h1>
      <p class="fm-hero-sub">Festmore connects event organisers with verified vendors across 11 countries. List your festival, find vendor spots, or discover the world's best events — all in one place.</p>
      <div class="fm-hero-ctas">
        <a href="/events/submit" class="fm-cta-primary">🎪 List Your Event — from Free</a>
        <a href="/vendors/register" class="fm-cta-secondary">🏪 Become a Vendor — €49/yr</a>
      </div>
      <div class="fm-hero-stats">
        <div class="fm-hstat"><span class="fm-hstat-n">${ev}+</span><span class="fm-hstat-l">Events</span></div>
        <div class="fm-hstat"><span class="fm-hstat-n">${vn}+</span><span class="fm-hstat-l">Vendors</span></div>
        <div class="fm-hstat"><span class="fm-hstat-n">11</span><span class="fm-hstat-l">Countries</span></div>
        <div class="fm-hstat"><span class="fm-hstat-n">${sb}+</span><span class="fm-hstat-l">Subscribers</span></div>
      </div>
    </div>
    <div class="fm-hero-right">
      <div class="fm-float-card fm-card-1">
        <span class="fm-card-icon">🎪</span>
        <div class="fm-card-title">Berlin Christmas Market 2025</div>
        <div class="fm-card-sub">4M visitors expected · 200 vendor spots</div>
        <span class="fm-card-price">✅ Verified Listing</span>
      </div>
      <div class="fm-float-card fm-card-2">
        <span class="fm-card-icon">🏪</span>
        <div class="fm-card-title">Bratwurst Brothers</div>
        <div class="fm-card-sub">Munich · Food & Drinks · 84 events attended</div>
        <span class="fm-card-price fm-card-green">✅ Verified Vendor</span>
      </div>
      <div class="fm-float-card fm-card-3">
        <span class="fm-card-icon">💰</span>
        <div class="fm-card-title">New Application!</div>
        <div class="fm-card-sub">Nordic Street Food applied to Roskilde Festival 2026</div>
      </div>
    </div>
  </div>
</section>

<!-- TRUST BAR -->
<div class="fm-trust">
  <div class="fm-trust-inner">
    <div class="fm-trust-item"><span class="fm-trust-dot">✓</span> Secure Stripe Payments</div>
    <div class="fm-trust-item"><span class="fm-trust-dot">✓</span> Verified Vendor Profiles</div>
    <div class="fm-trust-item"><span class="fm-trust-dot">✓</span> 11 Countries Covered</div>
    <div class="fm-trust-item"><span class="fm-trust-dot">✓</span> Free Listings Available</div>
    <div class="fm-trust-item"><span class="fm-trust-dot">✓</span> Daily New Events Added</div>
    <div class="fm-trust-item"><span class="fm-trust-dot">✓</span> ${sb}+ Newsletter Subscribers</div>
  </div>
</div>

<!-- ADSENSE -->
<div class="ad-leaderboard"><div class="ad-label-small">Advertisement</div>
<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-2486135003689222" data-ad-format="auto" data-full-width-responsive="true"></ins>
<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
</div>

<!-- WHY FESTMORE -->
<section class="fm-why">
  <div class="fm-why-inner">
    <div style="text-align:center;margin-bottom:0;">
      <div class="fm-section-tag">Why Festmore</div>
      <h2 class="fm-section-h" style="text-align:center;">Everything You Need to<br/>Grow Your Event Business</h2>
      <p class="fm-section-sub" style="margin:0 auto;text-align:center;">Whether you're an event organiser looking for vendors or a vendor looking for events — Festmore makes the connection simple, fast and profitable.</p>
    </div>
    <div class="fm-why-grid">
      ${[
        ['🌍', 'Reach 11 Countries', 'Your listing is visible to visitors, organisers and vendors across Germany, Denmark, Netherlands, UK, France, Sweden, Belgium, Poland, UAE, USA and China.'],
        ['🔍', 'SEO-Optimised Pages', 'Every listing gets its own SEO-optimised page that ranks on Google. Visitors searching for events in your city find you directly.'],
        ['📧', 'Newsletter to ' + sb + '+ Subscribers', 'Paid listings are featured in our weekly newsletter to ' + sb + '+ subscribers who are actively looking for events and vendors to work with.'],
        ['✅', 'Verified Badge System', 'Paid vendors and events get a Verified badge that builds trust with organisers and visitors. Stand out from unverified listings.'],
        ['🏪', 'Vendor Marketplace', 'The only European platform where vendors can apply directly to events with available spots. Organisers find exactly the vendors they need.'],
        ['📊', 'Real Analytics', 'Track how many people view your listing, where they come from and how they engage. Data that helps you make better decisions.'],
      ].map(([icon, title, desc]) => `
      <div class="fm-why-card">
        <span class="fm-why-icon">${icon}</span>
        <div class="fm-why-title">${title}</div>
        <div class="fm-why-desc">${desc}</div>
      </div>`).join('')}
    </div>
  </div>
</section>

<!-- DUAL PRICING CARDS -->
<section class="fm-dual">
  <div class="fm-dual-inner">
    <div class="fm-dual-header">
      <div class="fm-section-tag" style="background:rgba(232,71,10,.15);color:#ff7043;">Simple Pricing</div>
      <h2>Start Free. Grow Fast.<br/>Pay Only When You're Ready.</h2>
      <p>No hidden fees. No long contracts. Cancel anytime.</p>
    </div>
    <div class="fm-dual-cards">

      <!-- ORGANISER CARD -->
      <div class="fm-plan-card fm-plan-organiser">
        <div class="fm-plan-glow-org"></div>
        <span class="fm-plan-tag fm-tag-org">For Event Organisers</span>
        <span class="fm-plan-emoji">🎪</span>
        <h3 class="fm-plan-h">Get Your Event in Front of Thousands of Visitors</h3>
        <p class="fm-plan-sub">Choose your plan — start free and upgrade when you want more visibility.</p>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:28px;">
          ${[
            ['Free', '€0', 'Basic listing'],
            ['Standard', '€79/yr', 'Full featured'],
            ['Premium', '€149/yr', 'Top placement'],
          ].map(([name, price, desc]) => `
          <div style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:14px 12px;text-align:center;">
            <div style="font-size:11px;font-weight:700;color:rgba(255,255,255,.5);text-transform:uppercase;letter-spacing:.6px;margin-bottom:4px;">${name}</div>
            <div style="font-family:'DM Serif Display',serif;font-size:20px;color:#fff;">${price}</div>
            <div style="font-size:11px;color:rgba(255,255,255,.35);margin-top:2px;">${desc}</div>
          </div>`).join('')}
        </div>
        ${['Live within 24 hours','Visible in 11 countries','SEO page with your own URL','Weekly newsletter inclusion','Connect with verified vendors','Track views and analytics'].map(b => `<div class="fm-plan-benefit">✅ ${b}</div>`).join('')}
        <a href="/events/pricing" class="fm-plan-cta-org">List Your Event — Start Free →</a>
      </div>

      <!-- VENDOR CARD -->
      <div class="fm-plan-card fm-plan-vendor">
        <div class="fm-plan-glow-ven"></div>
        <span class="fm-plan-tag fm-tag-ven">For Vendors</span>
        <span class="fm-plan-emoji">🏪</span>
        <h3 class="fm-plan-h">Get Booked at Europe's Best Festivals and Markets</h3>
        <p class="fm-plan-sub">One verified profile. Unlimited opportunities. Less than €5 per month.</p>
        <div class="fm-plan-price">
          <div>
            <span class="fm-plan-price-n">€49</span>
            <span class="fm-plan-price-per">/year</span>
          </div>
          <div class="fm-plan-price-note">Less than €5/month · One booking pays for years</div>
        </div>
        ${['Verified badge on your profile','Apply directly to festivals and markets','Discovered by organisers in 11 countries','Featured in weekly newsletter','See who views your profile','Stand out from unverified competitors'].map(b => `<div class="fm-plan-benefit">✅ ${b}</div>`).join('')}
        <a href="/vendors/register" class="fm-plan-cta-ven">Create Vendor Profile — €49/year →</a>
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
      <div class="fm-proof-stat"><span class="fm-proof-n">${ev}+</span><span class="fm-proof-l">Events Listed</span></div>
      <div class="fm-proof-stat"><span class="fm-proof-n">${vn}+</span><span class="fm-proof-l">Verified Vendors</span></div>
      <div class="fm-proof-stat"><span class="fm-proof-n">11</span><span class="fm-proof-l">Countries</span></div>
      <div class="fm-proof-stat"><span class="fm-proof-n">${sb}+</span><span class="fm-proof-l">Subscribers</span></div>
      <div class="fm-proof-stat"><span class="fm-proof-n">${ar}+</span><span class="fm-proof-l">Articles</span></div>
    </div>

    <!-- TESTIMONIALS -->
    <div class="fm-testimonials" style="margin-top:48px;">
      ${[
        ['M', 'Marcus Weber', 'Event Organiser, Berlin', '"Festmore gave our Christmas market incredible online visibility. We received vendor applications within the first week of listing."'],
        ['A', 'Anna Lindqvist', 'Street Food Vendor, Stockholm', '"As a vendor, finding the right events used to take hours of research. Festmore makes it simple — I found 3 new bookings in my first month."'],
        ['P', 'Pieter van den Berg', 'Market Organiser, Amsterdam', '"The vendor marketplace is genuinely useful. We found exactly the food vendors we needed for our spring market through Festmore."'],
      ].map(([initial, name, role, quote]) => `
      <div class="fm-testi">
        <div class="fm-testi-stars">★★★★★</div>
        <div class="fm-testi-text">${quote}</div>
        <div class="fm-testi-author">
          <div class="fm-testi-avatar">${initial}</div>
          <div>
            <div class="fm-testi-name">${name}</div>
            <div class="fm-testi-role">${role}</div>
          </div>
        </div>
      </div>`).join('')}
    </div>
  </div>
</section>

<!-- HOW IT WORKS -->
<section class="fm-how">
  <div class="fm-how-inner">
    <div style="text-align:center;">
      <div class="fm-section-tag">Simple Process</div>
      <h2 class="fm-section-h" style="text-align:center;">Live in Minutes</h2>
    </div>
    <div class="fm-how-steps">
      ${[
        ['1', '📝', 'Fill in your details', 'Add your event or vendor profile information — takes less than 5 minutes.'],
        ['2', '💳', 'Choose your plan', 'Start free or choose Standard/Premium for maximum visibility. Secure Stripe payment.'],
        ['3', '✅', 'Go live instantly', 'Free listings go live immediately. Paid listings within minutes of payment.'],
        ['4', '📈', 'Start getting discovered', 'Visitors, organisers and vendors across 11 countries can now find you on Festmore and Google.'],
      ].map(([num, icon, title, desc]) => `
      <div class="fm-step">
        <div class="fm-step-num">${num}</div>
        <div style="font-size:28px;margin-bottom:12px;">${icon}</div>
        <div class="fm-step-title">${title}</div>
        <div class="fm-step-desc">${desc}</div>
      </div>`).join('')}
    </div>
  </div>
</section>

<!-- ADSENSE MID -->
<div class="ad-leaderboard"><div class="ad-label-small">Advertisement</div>
<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-2486135003689222" data-ad-format="auto" data-full-width-responsive="true"></ins>
<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
</div>

<!-- BROWSE CATEGORIES -->
<section class="section section-warm">
  <div class="container">
    <div class="section-header">
      <div><h2 class="section-title">Browse Events</h2><p class="section-sub">Find exactly the type of event you love</p></div>
      <a href="/events" class="section-link">View all ${ev}+ events →</a>
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
      <a href="/events" class="section-link light">View all →</a>
    </div>
    <div class="events-grid">
      ${featured.map(e => eventCardHTML(e)).join('')}
    </div>
  </div>
</section>` : ''}

<!-- COUNTRIES -->
<section class="section">
  <div class="container">
    <div class="section-header">
      <div><h2 class="section-title">Browse by Country</h2><p class="section-sub">Events across 11 countries</p></div>
    </div>
    <div class="countries-grid">
      ${countryCounts.map(c => '<a href="/events?country=' + c.country + '" class="country-card"><span class="country-flag">' + (FLAGS[c.country] || '') + '</span><span class="country-name">' + (COUNTRY_NAMES[c.country] || c.country) + '</span><span class="country-count">' + c.count + ' events</span></a>').join('')}
    </div>
  </div>
</section>

<!-- ARTICLES -->
${articles.length ? `
<section class="section section-warm">
  <div class="container">
    <div class="section-header">
      <div><h2 class="section-title">Festival Guides</h2><p class="section-sub">Expert guides updated daily</p></div>
      <a href="/articles" class="section-link">All ${ar}+ articles →</a>
    </div>
    <div class="articles-grid">
      ${articles.map(a => '<a href="/articles/' + a.slug + '" class="article-card"><div class="article-img"><img src="' + (a.image_url || IMGS.festival) + '" alt="' + a.title + '" loading="lazy"/></div><div class="article-body"><div class="article-cat">' + (CATS[a.category] || '') + ' ' + (a.category || 'Guide') + '</div><h3>' + a.title + '</h3><p>' + (a.excerpt || '').substring(0, 100) + '…</p><span class="article-date">' + new Date(a.created_at).toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric'}) + '</span></div></a>').join('')}
    </div>
  </div>
</section>` : ''}

<!-- NEWSLETTER -->
<section class="section">
  <div class="container">
    <div class="newsletter-box">
      <div class="newsletter-left">
        <h2>Never Miss an Event</h2>
        <p>Get the best festivals and vendor opportunities delivered every week. Join ${sb}+ subscribers.</p>
      </div>
      <form class="newsletter-form" id="newsletter-form">
        <input type="email" name="email" placeholder="Your email address" required class="nl-input"/>
        <button type="submit" class="btn btn-primary">Subscribe Free →</button>
      </form>
    </div>
  </div>
</section>

<!-- URGENCY STRIP -->
<div class="fm-urgency">
  <div class="fm-urgency-inner">
    <div class="fm-urgency-text">
      <h3>🔥 Join ${ev}+ events and ${vn}+ vendors already on Festmore</h3>
      <p>Start free today — upgrade when you're ready. No commitment required.</p>
    </div>
    <div class="fm-urgency-btns">
      <a href="/events/submit" class="fm-urgency-btn-w">List Your Event →</a>
      <a href="/vendors/register" class="fm-urgency-btn-t">Become a Vendor →</a>
    </div>
  </div>
</div>

${renderFooter(stats)}

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
      } else { alert(json.msg); }
    });
});
</script>
</body>
</html>`;
}

function eventCardHTML(e) {
  const img    = e.image_url || IMGS[e.category] || IMGS.festival;
  const flag   = FLAGS[e.country] || '';
  const icon   = CATS[e.category] || '';
  const isFree = e.price_display === 'Free';
  return '<article class="event-card" itemscope itemtype="https://schema.org/Event"><a href="/events/' + e.slug + '"><div class="event-img"><img src="' + img + '" alt="' + e.title + '" loading="lazy"/><div class="event-img-overlay"></div><div class="event-badges">' + (e.featured ? '<span class="badge badge-feat">★ Featured</span>' : '') + '<span class="badge badge-cat">' + icon + ' ' + e.category + '</span>' + (isFree ? '<span class="badge badge-free">Free</span>' : '') + '</div></div><div class="event-body"><div class="event-date">' + (e.date_display || e.start_date) + '</div><h3>' + e.title + '</h3><div class="event-loc">' + flag + ' ' + e.city + '</div><div class="event-footer"><span class="event-stat">' + (e.attendees || 0).toLocaleString() + ' visitors</span><span class="event-price ' + (isFree ? 'price-free' : 'price-paid') + '">' + e.price_display + '</span></div></div></a></article>';
}

function renderNav(user) {
  var userLinks = user
    ? '<a href="/dashboard" class="btn btn-outline btn-sm">Dashboard</a><a href="/auth/logout" class="btn btn-ghost btn-sm">Logout</a>'
    : '<a href="/auth/login" class="btn btn-outline btn-sm">Login</a><a href="/events/submit" class="btn btn-primary btn-sm">+ List Event</a>';
  var mobileLinks = user
    ? '<a href="/dashboard">Dashboard</a><a href="/auth/logout">Logout</a>'
    : '<a href="/auth/login">Login</a><a href="/auth/register">Register</a>';
  return '<nav class="main-nav"><div class="nav-inner"><a href="/" class="logo"><span class="logo-fest">Fest</span><span class="logo-more">more</span><span class="logo-dot"></span></a><form class="nav-search" action="/events" method="GET"><span style="color:var(--ink4);font-size:15px;">🔍</span><input type="text" name="q" placeholder="Search events, cities, countries…"/></form><div class="nav-right">' + userLinks + '</div><button class="nav-burger" onclick="document.querySelector(\'.nav-mobile\').classList.toggle(\'open\')" aria-label="Menu">☰</button></div><div class="nav-cats-bar"><a href="/events" class="nav-cat">🌍 All</a><a href="/events?category=festival" class="nav-cat">🎪 Festivals</a><a href="/events?category=market" class="nav-cat">🛍️ Markets</a><a href="/events?category=christmas" class="nav-cat">🎄 Xmas Markets</a><a href="/events?category=concert" class="nav-cat">🎵 Concerts</a><a href="/events?category=city" class="nav-cat">🏙️ City</a><a href="/events?category=flea" class="nav-cat">🏺 Flea Markets</a><a href="/articles" class="nav-cat">📰 Articles</a><a href="/vendors" class="nav-cat">🏪 Vendors</a><a href="/events/pricing" class="nav-cat" style="color:var(--flame);font-weight:700;">💰 Pricing</a></div><div class="nav-mobile"><a href="/events">All Events</a><a href="/articles">Articles</a><a href="/vendors">Vendors</a><a href="/events/submit">+ List Event</a><a href="/vendors/register">Become Vendor</a><a href="/events/pricing">Pricing</a>' + mobileLinks + '</div></nav>';
}

function renderFooter(stats) {
  return '<footer><div class="footer-top"><div class="footer-brand"><div class="logo" style="margin-bottom:14px;"><span class="logo-fest" style="color:#fff;">Fest</span><span class="logo-more">more</span></div><p>Europe\'s festival and vendor marketplace. Connecting event organisers with verified vendors across 11 countries.</p><div class="footer-social"><a href="#" class="social-icon">f</a><a href="#" class="social-icon">ig</a><a href="#" class="social-icon">x</a></div></div><div class="footer-col"><h4>For Organisers</h4><a href="/events/submit">List Your Event</a><a href="/events/pricing">Pricing Plans</a><a href="/vendors">Find Vendors</a><a href="/events">Browse Events</a></div><div class="footer-col"><h4>For Vendors</h4><a href="/vendors/register">Create Profile</a><a href="/events">Browse Events</a><a href="/articles/festival-vendor-guide-europe-2026">Vendor Guide</a><a href="/contact">Contact Us</a></div><div class="footer-col"><h4>Festmore</h4><a href="/about">About Us</a><a href="/articles">Festival Guides</a><a href="/contact">Contact</a><a href="/privacy">Privacy Policy</a></div></div><div class="footer-bottom"><span>© ' + new Date().getFullYear() + ' Festmore.com — All rights reserved</span><span>' + stats.events + '+ events · ' + stats.vendors + '+ vendors · ' + stats.articles + '+ articles</span></div></footer>';
}

module.exports.renderNav = renderNav;
module.exports.renderFooter = renderFooter;
module.exports.eventCardHTML = eventCardHTML;
module.exports.IMGS = IMGS;
module.exports.FLAGS = FLAGS;
module.exports.CATS = CATS;
module.exports.COUNTRY_NAMES = COUNTRY_NAMES;