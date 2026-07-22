// ═══════════════════════════════════════════════════════════════════
// FESTMORE CHRISTMAS MARKETS HUB — routes/christmas.js
// Dedicated /christmas page + homepage banner patch
// ═══════════════════════════════════════════════════════════════════

const express = require('express');
const router  = express.Router();
const db      = require('../db');

// ── Pre-compile statements ────────────────────────────────────────
const PG_URL = process.env.DATABASE_URL || 'postgresql://postgres:VWgjvXynowzYucOsfqNNAPWojptOHaXJ@gondola.proxy.rlwy.net:47003/railway';

async function getPgClient() {
  const { Client } = require('pg');
  const c = new Client({ connectionString: PG_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();
  return c;
}

// ── /christmas hub page ───────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const c = await getPgClient();

    // Get all christmas markets
    const markets = await c.query(`
      SELECT id,title,slug,city,country,start_date,end_date,date_display,
             price_display,image_url,attendees,vendor_spots,payment_status,featured,tags
      FROM events
      WHERE status='active' AND (category='christmas' OR tags ILIKE '%christmas%' OR tags ILIKE '%julemarked%' OR tags ILIKE '%weihnachtsmarkt%' OR tags ILIKE '%kerstmarkt%')
      ORDER BY CASE payment_status WHEN 'premium' THEN 3 WHEN 'standard' THEN 2 ELSE 1 END DESC,
               featured DESC, attendees DESC
      LIMIT 100
    `);

    // Get articles about christmas markets
    const articles = await c.query(`
      SELECT id,title,slug,excerpt,image_url,created_at
      FROM articles
      WHERE status='published' AND (category='christmas' OR title ILIKE '%christmas%' OR title ILIKE '%jul%')
      ORDER BY created_at DESC LIMIT 3
    `);

    // Count by country
    const counts = await c.query(`
      SELECT country, COUNT(*) as n FROM events
      WHERE status='active' AND (category='christmas' OR tags ILIKE '%christmas%')
      GROUP BY country ORDER BY n DESC
    `);

    await c.end();
    res.send(renderChristmasHub(markets.rows, articles.rows, counts.rows, req.session.user));
  } catch(e) {
    console.log('Christmas hub error:', e.message);
    res.redirect('/events?category=christmas');
  }
});

// ── Apply to market — sends email to organiser ────────────────────
router.post('/apply', async (req, res) => {
  const { event_id, vendor_name, vendor_email, vendor_phone, vendor_description, vendor_website } = req.body;
  try {
    const c = await getPgClient();
    const ev = await c.query('SELECT title, organiser_email, city, country FROM events WHERE id=$1', [event_id]);
    await c.end();

    if (!ev.rows[0]) return res.json({ ok: false, msg: 'Event not found' });
    const event = ev.rows[0];
    const to = event.organiser_email || 'anotherdews@gmail.com';

    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Email to organiser
    await resend.emails.send({
      from: 'Festmore <hello@festmore.com>',
      to: to,
      subject: `New vendor application for ${event.title} — via Festmore`,
      html: `
        <div style="font-family:Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:#0a1a0f;padding:32px;text-align:center;border-radius:12px 12px 0 0;">
            <span style="font-size:24px;font-weight:800;color:#fff;">Fest<span style="color:#e8470a;">more</span></span>
            <p style="color:rgba(255,255,255,.6);margin:8px 0 0;font-size:14px;">New Vendor Application</p>
          </div>
          <div style="background:#fff;padding:32px;border:1px solid #e5e5e5;">
            <h2 style="font-size:20px;color:#0a0a0a;margin:0 0 16px;">You have a new vendor application for <strong>${event.title}</strong></h2>
            <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
              <tr><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#666;">Vendor</td><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:13px;font-weight:700;color:#0a0a0a;">${vendor_name}</td></tr>
              <tr><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#666;">Email</td><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#0a0a0a;"><a href="mailto:${vendor_email}">${vendor_email}</a></td></tr>
              <tr><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#666;">Phone</td><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#0a0a0a;">${vendor_phone||'Not provided'}</td></tr>
              <tr><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#666;">Website</td><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#0a0a0a;">${vendor_website||'Not provided'}</td></tr>
            </table>
            <div style="background:#f9f9f9;border-radius:8px;padding:16px;margin-bottom:24px;">
              <p style="font-size:13px;color:#666;margin:0 0 8px;font-weight:700;">About their business:</p>
              <p style="font-size:14px;color:#0a0a0a;margin:0;line-height:1.6;">${vendor_description}</p>
            </div>
            <p style="font-size:13px;color:#666;line-height:1.6;">Reply directly to this email to get in touch with the vendor. This application was submitted through <a href="https://festmore.com/christmas" style="color:#e8470a;">Festmore Christmas Markets Hub</a>.</p>
          </div>
          <div style="background:#f5f0e8;padding:16px;text-align:center;border-radius:0 0 12px 12px;">
            <p style="font-size:12px;color:#999;margin:0;">Festmore.com · hello@festmore.com</p>
          </div>
        </div>
      `
    });

    // Confirmation to vendor
    await resend.emails.send({
      from: 'Festmore <hello@festmore.com>',
      to: vendor_email,
      subject: `Your application to ${event.title} has been sent ✅`,
      html: `
        <div style="font-family:Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:#0a1a0f;padding:32px;text-align:center;border-radius:12px 12px 0 0;">
            <span style="font-size:24px;font-weight:800;color:#fff;">Fest<span style="color:#e8470a;">more</span></span>
          </div>
          <div style="background:#fff;padding:32px;border:1px solid #e5e5e5;">
            <h2 style="font-size:20px;color:#0a0a0a;">Application sent! 🎄</h2>
            <p style="font-size:14px;color:#666;line-height:1.7;">Your application to participate in <strong>${event.title}</strong> (${event.city}, ${event.country}) has been sent directly to the organiser. They will contact you directly if they are interested.</p>
            <p style="font-size:13px;color:#999;margin-top:24px;">Want to apply to more Christmas markets? Browse all markets on Festmore:</p>
            <div style="text-align:center;margin-top:16px;">
              <a href="https://festmore.com/christmas" style="display:inline-block;background:#c41e3a;color:#fff;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:700;text-decoration:none;">Browse Christmas Markets →</a>
            </div>
          </div>
          <div style="background:#f5f0e8;padding:16px;text-align:center;border-radius:0 0 12px 12px;">
            <p style="font-size:12px;color:#999;margin:0;">Festmore.com · The European Events Marketplace</p>
          </div>
        </div>
      `
    });

    res.json({ ok: true, msg: 'Application sent! The organiser will contact you directly.' });
  } catch(e) {
    console.log('Apply error:', e.message);
    res.json({ ok: false, msg: 'Failed to send application. Please try again.' });
  }
});

module.exports = router;

// ═══════════════════════════════════════════════════════════════════
// RENDER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

const FLAGS = { BE:'🇧🇪',DK:'🇩🇰',FR:'🇫🇷',DE:'🇩🇪',NL:'🇳🇱',PL:'🇵🇱',SE:'🇸🇪',GB:'🇬🇧',AT:'🇦🇹',CH:'🇨🇭',CZ:'🇨🇿',HU:'🇭🇺',NO:'🇳🇴',FI:'🇫🇮',IT:'🇮🇹',ES:'🇪🇸',RO:'🇷🇴' };
const CNAMES = { BE:'Belgium',DK:'Denmark',FR:'France',DE:'Germany',NL:'Netherlands',PL:'Poland',SE:'Sweden',GB:'United Kingdom',AT:'Austria',CH:'Switzerland',CZ:'Czech Republic',HU:'Hungary',NO:'Norway',FI:'Finland',IT:'Italy',ES:'Spain' };

function renderChristmasHub(markets, articles, counts, user) {
  const total = markets.length;
  const countries = [...new Set(markets.map(m => m.country))].length;
  const withSpots = markets.filter(m => m.vendor_spots > 0).length;

  // Group by country
  const byCountry = {};
  markets.forEach(m => {
    if (!byCountry[m.country]) byCountry[m.country] = [];
    byCountry[m.country].push(m);
  });

  const featuredMarkets = markets.filter(m => m.payment_status === 'standard' || m.payment_status === 'premium' || m.featured);
  const freeMarkets = markets.filter(m => m.payment_status === 'free' && !m.featured);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Christmas Markets 2026 — The Complete European Guide | Festmore</title>
<meta name="description" content="The best Christmas markets in Europe 2026 — Germany, Belgium, Denmark, Sweden, Poland, Netherlands and more. ${total}+ markets listed. Find vendor spots and apply directly."/>
<link rel="canonical" href="https://festmore.com/christmas"/>
<meta property="og:title" content="Christmas Markets Europe 2026 — Festmore"/>
<meta property="og:description" content="${total}+ Christmas markets across ${countries} countries. Browse, plan your visit and apply for vendor spots."/>
<meta property="og:image" content="https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=1200&q=80"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,600&family=Syne:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="/css/main.css"/>
<style>
:root{--xmas-red:#c41e3a;--xmas-green:#0a3d1f;--xmas-dark:#06200f;--xmas-gold:#d4a017;--xmas-cream:#fdf8f0;--xmas-light:#e8f5e9;}
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Syne',system-ui,sans-serif;background:var(--xmas-cream);}
a{text-decoration:none;color:inherit;}

/* NAV */
.nav{background:#0a0a0a;padding:0 28px;height:62px;display:flex;align-items:center;gap:20px;position:sticky;top:0;z-index:100;}
.nav-logo{font-family:'Playfair Display',serif;font-size:22px;color:#fff;font-style:italic;}
.nav-logo strong{color:#e8470a;font-style:normal;}
.nav-links{margin-left:auto;display:flex;gap:16px;align-items:center;}
.nav-link{color:rgba(255,255,255,.5);font-size:13px;font-weight:600;}
.nav-link:hover{color:#fff;}
.nav-cta{background:var(--xmas-red);color:#fff;padding:8px 18px;border-radius:8px;font-size:13px;font-weight:700;}

/* HERO */
.hero{position:relative;background:var(--xmas-dark);overflow:hidden;padding:80px 28px 60px;}
.hero-bg{position:absolute;inset:0;background:url('https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=1600&q=40') center/cover;opacity:.2;}
.hero-snow{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 0%,rgba(255,255,255,.05) 0%,transparent 60%);}
.hero-inner{position:relative;z-index:2;max-width:1200px;margin:0 auto;text-align:center;}
.hero-eyebrow{display:inline-flex;align-items:center;gap:8px;background:rgba(196,30,58,.15);border:1px solid rgba(196,30,58,.3);color:#ff6b7a;font-size:11px;font-weight:800;padding:6px 16px;border-radius:99px;margin-bottom:24px;letter-spacing:1.5px;text-transform:uppercase;}
.hero-h1{font-family:'Playfair Display',serif;font-size:clamp(36px,6vw,80px);color:#fff;line-height:1.05;margin-bottom:20px;font-weight:700;}
.hero-h1 em{color:var(--xmas-gold);font-style:italic;}
.hero-sub{font-size:18px;color:rgba(255,255,255,.5);line-height:1.6;max-width:600px;margin:0 auto 40px;}
.hero-stats{display:flex;justify-content:center;gap:40px;margin-bottom:40px;flex-wrap:wrap;}
.hstat{text-align:center;}
.hstat-n{font-family:'Playfair Display',serif;font-size:40px;color:#fff;line-height:1;font-weight:700;}
.hstat-n span{color:var(--xmas-gold);}
.hstat-l{font-size:11px;color:rgba(255,255,255,.35);text-transform:uppercase;letter-spacing:1px;margin-top:4px;}
.hero-btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;}
.hbtn{display:inline-flex;align-items:center;gap:8px;padding:14px 28px;border-radius:10px;font-size:14px;font-weight:700;transition:all .2s;}
.hbtn-red{background:var(--xmas-red);color:#fff;box-shadow:0 4px 20px rgba(196,30,58,.4);}
.hbtn-red:hover{background:#a31830;transform:translateY(-2px);}
.hbtn-gold{background:var(--xmas-gold);color:#000;font-weight:800;}
.hbtn-gold:hover{background:#b8860b;transform:translateY(-2px);}
.hbtn-outline{background:rgba(255,255,255,.08);color:rgba(255,255,255,.7);border:1px solid rgba(255,255,255,.15);}
.hbtn-outline:hover{background:rgba(255,255,255,.15);color:#fff;}

/* OFFER BANNER */
.offer{background:linear-gradient(135deg,var(--xmas-red),#8b0000);padding:20px 28px;}
.offer-inner{max-width:1200px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;}
.offer h3{font-family:'Playfair Display',serif;font-size:20px;color:#fff;font-weight:700;}
.offer p{font-size:13px;color:rgba(255,255,255,.7);margin-top:4px;}
.offer-price{text-align:right;}
.offer-price .old{font-size:13px;color:rgba(255,255,255,.4);text-decoration:line-through;}
.offer-price .new{font-size:32px;font-weight:800;color:var(--xmas-gold);font-family:'Playfair Display',serif;}
.offer-price .period{font-size:12px;color:rgba(255,255,255,.5);}
.offer-btn{background:#fff;color:var(--xmas-red);padding:12px 24px;border-radius:8px;font-size:14px;font-weight:800;white-space:nowrap;}

/* SECTIONS */
.section{padding:64px 28px;}
.section-inner{max-width:1200px;margin:0 auto;}
.section-head{margin-bottom:36px;}
.eyebrow{display:inline-flex;align-items:center;gap:6px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;padding:4px 12px;border-radius:99px;margin-bottom:12px;}
.ey-red{background:rgba(196,30,58,.1);border:1px solid rgba(196,30,58,.2);color:var(--xmas-red);}
.ey-gold{background:rgba(212,160,23,.1);border:1px solid rgba(212,160,23,.2);color:var(--xmas-gold);}
.ey-green{background:rgba(10,61,31,.08);border:1px solid rgba(10,61,31,.15);color:var(--xmas-green);}
.ey-dark{background:rgba(0,0,0,.06);border:1px solid rgba(0,0,0,.1);color:#555;}
.sh{font-family:'Playfair Display',serif;font-size:clamp(24px,3vw,40px);color:#0a0a0a;font-weight:700;line-height:1.1;}
.sh.light{color:#fff;}
.sp{font-size:15px;color:#666;margin-top:8px;max-width:480px;line-height:1.6;}

/* FEATURED MARKETS GRID */
.featured-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;}
.fcard{border-radius:16px;overflow:hidden;position:relative;cursor:pointer;display:flex;flex-direction:column;transition:transform .3s,box-shadow .3s;}
.fcard:hover{transform:translateY(-6px);box-shadow:0 24px 56px rgba(0,0,0,.15);}
.fcard-img{height:220px;position:relative;overflow:hidden;flex-shrink:0;}
.fcard-img img{width:100%;height:100%;object-fit:cover;transition:transform .4s;}
.fcard:hover .fcard-img img{transform:scale(1.06);}
.fcard-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(6,32,15,.85) 0%,rgba(6,32,15,.2) 60%,transparent 100%);}
.fcard-badges{position:absolute;top:12px;left:12px;display:flex;gap:6px;flex-wrap:wrap;}
.fbadge{padding:3px 10px;border-radius:99px;font-size:10px;font-weight:800;backdrop-filter:blur(8px);}
.fbadge-featured{background:var(--xmas-gold);color:#000;}
.fbadge-spots{background:var(--xmas-red);color:#fff;}
.fbadge-free{background:rgba(255,255,255,.2);color:#fff;border:1px solid rgba(255,255,255,.3);}
.fcard-body{background:#fff;padding:20px;flex:1;display:flex;flex-direction:column;border:1px solid #e8e0d5;border-top:none;border-radius:0 0 16px 16px;}
.fcard-country{font-size:11px;font-weight:700;color:var(--xmas-red);text-transform:uppercase;letter-spacing:.8px;margin-bottom:6px;}
.fcard-title{font-family:'Playfair Display',serif;font-size:18px;color:#0a0a0a;margin-bottom:6px;font-weight:600;line-height:1.2;flex:1;}
.fcard-date{font-size:12px;color:#888;margin-bottom:12px;}
.fcard-footer{display:flex;justify-content:space-between;align-items:center;padding-top:12px;border-top:1px solid #f0ece4;margin-top:auto;}
.fcard-spots{font-size:12px;color:var(--xmas-green);font-weight:700;}
.fcard-cta{font-size:12px;font-weight:700;color:var(--xmas-red);}

/* COUNTRIES */
.country-section{margin-bottom:48px;}
.country-header{display:flex;align-items:center;gap:12px;margin-bottom:20px;padding-bottom:16px;border-bottom:2px solid var(--xmas-green);}
.country-flag{font-size:28px;}
.country-name{font-family:'Playfair Display',serif;font-size:24px;color:#0a0a0a;font-weight:700;}
.country-count{font-size:13px;color:#888;margin-left:auto;}
.markets-list{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;}
.mcard{background:#fff;border:1px solid #e8e0d5;border-radius:12px;padding:16px;display:flex;gap:14px;transition:all .2s;cursor:pointer;}
.mcard:hover{border-color:var(--xmas-red);box-shadow:0 8px 24px rgba(196,30,58,.1);}
.mcard-img{width:72px;height:72px;border-radius:8px;overflow:hidden;flex-shrink:0;}
.mcard-img img{width:100%;height:100%;object-fit:cover;}
.mcard-body{flex:1;min-width:0;}
.mcard-title{font-size:14px;font-weight:700;color:#0a0a0a;margin-bottom:4px;line-height:1.3;}
.mcard-date{font-size:12px;color:#888;margin-bottom:6px;}
.mcard-footer{display:flex;gap:6px;flex-wrap:wrap;}
.mcard-tag{font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px;}
.mcard-tag-spots{background:#dcfce7;color:#15803d;}
.mcard-tag-featured{background:#fef9c3;color:#854d0e;}
.mcard-tag-free{background:#f1f5f9;color:#64748b;}

/* APPLY MODAL */
.apply-modal{display:none;position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:1000;align-items:center;justify-content:center;padding:20px;}
.apply-modal.open{display:flex;}
.apply-box{background:#fff;border-radius:20px;padding:36px;max-width:520px;width:100%;max-height:90vh;overflow-y:auto;}
.apply-box h2{font-family:'Playfair Display',serif;font-size:24px;color:#0a0a0a;margin-bottom:6px;}
.apply-box p{font-size:14px;color:#666;margin-bottom:24px;line-height:1.6;}
.apply-field{margin-bottom:16px;}
.apply-field label{display:block;font-size:12px;font-weight:700;color:#444;text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px;}
.apply-field input,.apply-field textarea{width:100%;border:1.5px solid #e0dbd5;border-radius:10px;padding:11px 14px;font-size:14px;font-family:inherit;outline:none;transition:border .2s;}
.apply-field input:focus,.apply-field textarea:focus{border-color:var(--xmas-red);}
.apply-field textarea{height:100px;resize:vertical;}
.apply-btn{width:100%;background:var(--xmas-red);color:#fff;border:none;padding:14px;border-radius:10px;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit;transition:all .2s;}
.apply-btn:hover{background:#a31830;}
.apply-close{float:right;background:none;border:none;font-size:22px;cursor:pointer;color:#888;line-height:1;}
.apply-result{margin-top:16px;padding:14px;border-radius:10px;font-size:14px;text-align:center;}
.apply-result.success{background:#dcfce7;color:#15803d;}
.apply-result.error{background:#fee2e2;color:#dc2626;}

/* LIST YOUR MARKET */
.list-box{background:linear-gradient(135deg,var(--xmas-dark),#0d3520);border-radius:20px;padding:48px;text-align:center;margin:48px 0;}
.list-box h2{font-family:'Playfair Display',serif;font-size:32px;color:#fff;margin-bottom:12px;}
.list-box p{font-size:15px;color:rgba(255,255,255,.55);max-width:480px;margin:0 auto 32px;line-height:1.7;}
.price-cards{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;margin-bottom:32px;}
.pcard{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:24px;min-width:200px;text-align:left;}
.pcard.featured-plan{background:linear-gradient(135deg,rgba(196,30,58,.2),rgba(196,30,58,.05));border-color:rgba(196,30,58,.4);}
.pcard-tier{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:rgba(255,255,255,.4);margin-bottom:8px;}
.pcard.featured-plan .pcard-tier{color:#ff8c9a;}
.pcard-price{font-family:'Playfair Display',serif;font-size:36px;color:#fff;line-height:1;margin-bottom:4px;}
.pcard-price .old{font-size:16px;color:rgba(255,255,255,.3);text-decoration:line-through;margin-right:8px;}
.pcard-period{font-size:12px;color:rgba(255,255,255,.35);margin-bottom:16px;}
.pcard-features{list-style:none;}
.pcard-features li{font-size:13px;color:rgba(255,255,255,.6);padding:4px 0;display:flex;gap:8px;align-items:flex-start;}
.pcard-features li span{color:var(--xmas-gold);flex-shrink:0;}

/* ARTICLES */
.articles-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;}
.acard{background:#fff;border:1px solid #e8e0d5;border-radius:14px;overflow:hidden;transition:all .25s;}
.acard:hover{border-color:var(--xmas-red);transform:translateY(-4px);box-shadow:0 16px 40px rgba(0,0,0,.08);}
.acard-img{height:180px;overflow:hidden;}
.acard-img img{width:100%;height:100%;object-fit:cover;transition:transform .4s;}
.acard:hover .acard-img img{transform:scale(1.06);}
.acard-body{padding:18px;}
.acard-title{font-family:'Playfair Display',serif;font-size:16px;color:#0a0a0a;margin-bottom:8px;line-height:1.3;font-weight:600;}
.acard-excerpt{font-size:13px;color:#666;line-height:1.6;margin-bottom:12px;}
.acard-cta{font-size:12px;font-weight:700;color:var(--xmas-red);}

/* FOOTER */
footer{background:#0a0a0a;padding:40px 28px;text-align:center;}
footer p{font-size:13px;color:rgba(255,255,255,.3);}
footer a{color:rgba(255,255,255,.4);margin:0 8px;}

@media(max-width:768px){
  .featured-grid,.markets-list,.articles-grid{grid-template-columns:1fr;}
  .hero-stats{gap:24px;}
  .price-cards{flex-direction:column;align-items:center;}
  .offer-inner{flex-direction:column;text-align:center;}
  .offer-price{text-align:center;}
}
</style>
</head>
<body>

<!-- NAV -->
<nav class="nav">
  <a href="/" class="nav-logo"><strong>Fest</strong>more</a>
  <div class="nav-links">
    <a href="/events" class="nav-link">All Events</a>
    <a href="/vendors" class="nav-link">Vendors</a>
    <a href="/artists" class="nav-link">Artists</a>
    <a href="/events/submit" class="nav-cta">🎄 List Your Market</a>
    ${user ? `<a href="/dashboard" class="nav-link">Dashboard</a>` : `<a href="/auth/login" class="nav-link">Login</a>`}
  </div>
</nav>

<!-- HERO -->
<section class="hero">
  <div class="hero-bg"></div>
  <div class="hero-snow"></div>
  <div class="hero-inner">
    <div class="hero-eyebrow">🎄 Christmas Markets Guide 2026</div>
    <h1 class="hero-h1">
      Europe's Christmas<br/>
      Markets — <em>All in One Place</em>
    </h1>
    <p class="hero-sub">
      The definitive guide to Christmas markets across Europe in 2026.
      Browse ${total}+ markets, find vendor spots and apply directly to organisers.
    </p>
    <div class="hero-stats">
      <div class="hstat"><div class="hstat-n">${total}<span>+</span></div><div class="hstat-l">Markets Listed</div></div>
      <div class="hstat"><div class="hstat-n">${countries}<span></span></div><div class="hstat-l">Countries</div></div>
      <div class="hstat"><div class="hstat-n">${withSpots}<span></span></div><div class="hstat-l">With Vendor Spots</div></div>
    </div>
    <div class="hero-btns">
      <a href="#markets" class="hbtn hbtn-red">🎄 Browse All Markets</a>
      <a href="#apply-vendor" class="hbtn hbtn-gold">🏪 Find Vendor Spots</a>
      <a href="/list-christmas" class="hbtn hbtn-outline">List Your Market →</a>
    </div>
  </div>
</section>

<!-- SPECIAL OFFER BANNER -->
<div class="offer">
  <div class="offer-inner">
    <div>
      <h3>🎄 Christmas Season Special Offer</h3>
      <p>List your Christmas market as Featured and be discovered by vendors across Europe — at a special 2026 price.</p>
    </div>
    <div class="offer-price">
      <div class="old">€79/yr</div>
      <div class="new">€29</div>
      <div class="period">for the full 2026 Christmas season</div>
    </div>
    <a href="/list-christmas" class="offer-btn">Get Featured — €29 →</a>
  </div>
</div>

<!-- FEATURED MARKETS -->
${featuredMarkets.length > 0 ? `
<section class="section" style="background:#fff;">
  <div class="section-inner">
    <div class="section-head">
      <div class="eyebrow ey-gold">⭐ Featured Markets</div>
      <h2 class="sh">Editor's Picks for 2026</h2>
      <p class="sp">These markets are verified and featured on Festmore — the organisers you can trust.</p>
    </div>
    <div class="featured-grid">
      ${featuredMarkets.slice(0,6).map(m => {
        const img = m.image_url || 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=800&q=75';
        const flag = FLAGS[m.country] || '🌍';
        const cn = CNAMES[m.country] || m.country;
        const spots = parseInt(m.vendor_spots) || 0;
        return `<a href="/events/${m.slug}" class="fcard">
          <div class="fcard-img">
            <img src="${img}" alt="${m.title}" loading="lazy"/>
            <div class="fcard-overlay"></div>
            <div class="fcard-badges">
              <span class="fbadge fbadge-featured">⭐ Featured</span>
              ${spots > 0 ? `<span class="fbadge fbadge-spots">${spots} vendor spots</span>` : ''}
            </div>
          </div>
          <div class="fcard-body">
            <div class="fcard-country">${flag} ${cn}</div>
            <div class="fcard-title">${m.title}</div>
            <div class="fcard-date">📅 ${m.date_display || m.start_date || 'Dates TBC'}</div>
            <div class="fcard-footer">
              <span class="fcard-spots">${spots > 0 ? `🏪 ${spots} spots open` : '🎄 Visit market'}</span>
              <span class="fcard-cta">View →</span>
            </div>
          </div>
        </a>`;
      }).join('')}
    </div>
  </div>
</section>` : ''}

<!-- ALL MARKETS BY COUNTRY -->
<section class="section" id="markets" style="background:var(--xmas-cream);">
  <div class="section-inner">
    <div class="section-head">
      <div class="eyebrow ey-red">🌍 ${countries} Countries</div>
      <h2 class="sh">Christmas Markets by Country</h2>
      <p class="sp">Browse every Christmas market listed on Festmore — from the iconic to the hidden gems.</p>
    </div>

    ${Object.entries(byCountry).sort((a,b) => b[1].length - a[1].length).map(([country, cms]) => {
      const flag = FLAGS[country] || '🌍';
      const cn = CNAMES[country] || country;
      return `
      <div class="country-section">
        <div class="country-header">
          <span class="country-flag">${flag}</span>
          <span class="country-name">${cn}</span>
          <span class="country-count">${cms.length} market${cms.length !== 1 ? 's' : ''}</span>
        </div>
        <div class="markets-list">
          ${cms.map(m => {
            const img = m.image_url || 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=200&q=60';
            const spots = parseInt(m.vendor_spots) || 0;
            const isFeatured = m.payment_status === 'standard' || m.payment_status === 'premium' || m.featured;
            return `<a href="/events/${m.slug}" class="mcard">
              <div class="mcard-img"><img src="${img}" alt="${m.title}" loading="lazy"/></div>
              <div class="mcard-body">
                <div class="mcard-title">${m.title}</div>
                <div class="mcard-date">${m.date_display || m.start_date || 'Dates TBC'}</div>
                <div class="mcard-footer">
                  ${spots > 0 ? `<span class="mcard-tag mcard-tag-spots">🏪 ${spots} vendor spots</span>` : ''}
                  ${isFeatured ? `<span class="mcard-tag mcard-tag-featured">⭐ Featured</span>` : `<span class="mcard-tag mcard-tag-free">Free listing</span>`}
                </div>
              </div>
            </a>`;
          }).join('')}
        </div>
      </div>`;
    }).join('')}
  </div>
</section>

<!-- VENDOR APPLY SECTION -->
<section class="section" id="apply-vendor" style="background:#fff;">
  <div class="section-inner">
    <div class="section-head">
      <div class="eyebrow ey-green">🏪 For Vendors & Stallholders</div>
      <h2 class="sh">Find Your Perfect Christmas Market Spot</h2>
      <p class="sp">Browse markets with open vendor spots and apply directly to the organiser — no middleman, no fees.</p>
    </div>
    <div class="featured-grid">
      ${markets.filter(m => parseInt(m.vendor_spots) > 0).slice(0,6).map(m => {
        const img = m.image_url || 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=800&q=75';
        const flag = FLAGS[m.country] || '🌍';
        const spots = parseInt(m.vendor_spots) || 0;
        return `<div class="fcard" onclick="openApply(${m.id}, '${m.title.replace(/'/g,"\\'")}')">
          <div class="fcard-img">
            <img src="${img}" alt="${m.title}" loading="lazy"/>
            <div class="fcard-overlay"></div>
            <div class="fcard-badges">
              <span class="fbadge fbadge-spots">${spots} vendor spots open</span>
            </div>
          </div>
          <div class="fcard-body">
            <div class="fcard-country">${flag} ${CNAMES[m.country]||m.country}</div>
            <div class="fcard-title">${m.title}</div>
            <div class="fcard-date">📅 ${m.date_display || m.start_date || 'Dates TBC'}</div>
            <div class="fcard-footer">
              <span class="fcard-spots">🏪 ${spots} spots available</span>
              <span class="fcard-cta">Apply now →</span>
            </div>
          </div>
        </div>`;
      }).join('') || `<div style="grid-column:1/-1;text-align:center;padding:48px;background:#f9f9f9;border-radius:16px;">
        <p style="font-size:16px;color:#888;">No vendor spots listed yet — check back soon or <a href="/events?category=christmas" style="color:var(--xmas-red);font-weight:700;">browse all markets</a>.</p>
      </div>`}
    </div>
  </div>
</section>

<!-- LIST YOUR MARKET -->
<section class="section" id="list-market">
  <div class="section-inner">
    <div class="list-box">
      <div class="eyebrow ey-gold" style="margin:0 auto 16px;">🎄 Are You a Market Organiser?</div>
      <h2>List Your Christmas Market on Festmore</h2>
      <p>Get discovered by vendors, artists and visitors from across Europe. Free listing available — Featured listing at a special 2026 Christmas price.</p>
      <div class="price-cards">
        <div class="pcard">
          <div class="pcard-tier">Free Listing</div>
          <div class="pcard-price">€0</div>
          <div class="pcard-period">Always free</div>
          <ul class="pcard-features">
            <li><span>✓</span> Your market listed and searchable</li>
            <li><span>✓</span> Vendors can find and contact you</li>
            <li><span>✓</span> Basic listing page</li>
          </ul>
        </div>
        <div class="pcard featured-plan">
          <div class="pcard-tier">🎄 Featured — 2026 Special</div>
          <div class="pcard-price"><span class="old">€79</span>€29</div>
          <div class="pcard-period">Full 2026 Christmas season · Renews at €79 in 2027</div>
          <ul class="pcard-features">
            <li><span>⭐</span> Featured badge — top of search results</li>
            <li><span>⭐</span> Homepage placement on Festmore</li>
            <li><span>⭐</span> Newsletter to 500+ vendors & visitors</li>
            <li><span>⭐</span> Photos, full description & vendor spots</li>
            <li><span>⭐</span> Direct vendor applications to your inbox</li>
          </ul>
        </div>
      </div>
      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
        <a href="/list-christmas" class="hbtn hbtn-red">🎄 Get Featured — €29 →</a>
        <a href="/events/submit" class="hbtn hbtn-outline">List for Free →</a>
      </div>
    </div>
  </div>
</section>

<!-- ARTICLES -->
${articles.length > 0 ? `
<section class="section" style="background:var(--xmas-cream);">
  <div class="section-inner">
    <div class="section-head">
      <div class="eyebrow ey-dark">📰 Christmas Market Guides</div>
      <h2 class="sh">Read Before You Go</h2>
    </div>
    <div class="articles-grid">
      ${articles.map(a => `
        <a href="/articles/${a.slug}" class="acard">
          <div class="acard-img"><img src="${a.image_url||'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=600&q=70'}" alt="${a.title}" loading="lazy"/></div>
          <div class="acard-body">
            <div class="acard-title">${a.title}</div>
            <div class="acard-excerpt">${(a.excerpt||'').substring(0,100)}…</div>
            <div class="acard-cta">Read guide →</div>
          </div>
        </a>`).join('')}
    </div>
  </div>
</section>` : ''}

<!-- APPLY MODAL -->
<div class="apply-modal" id="applyModal">
  <div class="apply-box">
    <button class="apply-close" onclick="closeApply()">✕</button>
    <h2>🏪 Apply for a Vendor Spot</h2>
    <p id="applyMarketName" style="font-weight:700;color:var(--xmas-red);margin-bottom:16px;"></p>
    <p>Fill in your details and your application will be sent directly to the market organiser.</p>
    <input type="hidden" id="applyEventId"/>
    <div class="apply-field"><label>Your Name / Business Name *</label><input type="text" id="applyName" placeholder="e.g. Uruz Handmade Jewelry" required/></div>
    <div class="apply-field"><label>Email Address *</label><input type="email" id="applyEmail" placeholder="your@email.com" required/></div>
    <div class="apply-field"><label>Phone Number</label><input type="tel" id="applyPhone" placeholder="+32 470 21 43 57"/></div>
    <div class="apply-field"><label>Website or Instagram</label><input type="text" id="applyWebsite" placeholder="https://instagram.com/yourhandle"/></div>
    <div class="apply-field"><label>Tell the organiser about your business *</label><textarea id="applyDesc" placeholder="What do you sell? What makes your stall special? How much space do you need?"></textarea></div>
    <button class="apply-btn" onclick="submitApply()">Send Application →</button>
    <div id="applyResult"></div>
  </div>
</div>

<footer>
  <p><strong style="color:#fff;">Fest<span style="color:#e8470a;">more</span></strong> · The European Events Marketplace · <a href="/events">Events</a> · <a href="/vendors">Vendors</a> · <a href="/artists">Artists</a> · <a href="/about">About</a></p>
  <p style="margin-top:8px;">© ${new Date().getFullYear()} Festmore.com · <a href="/privacy">Privacy</a></p>
</footer>

<script>
function openApply(id, title) {
  document.getElementById('applyEventId').value = id;
  document.getElementById('applyMarketName').textContent = title;
  document.getElementById('applyModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeApply() {
  document.getElementById('applyModal').classList.remove('open');
  document.body.style.overflow = '';
}
document.getElementById('applyModal').addEventListener('click', function(e) {
  if (e.target === this) closeApply();
});
async function submitApply() {
  const name = document.getElementById('applyName').value.trim();
  const email = document.getElementById('applyEmail').value.trim();
  const desc = document.getElementById('applyDesc').value.trim();
  if (!name || !email || !desc) { alert('Please fill in your name, email and description.'); return; }
  const btn = document.querySelector('.apply-btn');
  btn.textContent = 'Sending...';
  btn.disabled = true;
  try {
    const r = await fetch('/christmas/apply', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
        event_id: document.getElementById('applyEventId').value,
        vendor_name: name,
        vendor_email: email,
        vendor_phone: document.getElementById('applyPhone').value,
        vendor_description: desc,
        vendor_website: document.getElementById('applyWebsite').value
      })
    });
    const d = await r.json();
    const res = document.getElementById('applyResult');
    res.className = 'apply-result ' + (d.ok ? 'success' : 'error');
    res.textContent = d.msg;
    if (d.ok) { btn.textContent = '✅ Sent!'; setTimeout(closeApply, 3000); }
    else { btn.textContent = 'Send Application →'; btn.disabled = false; }
  } catch(e) {
    document.getElementById('applyResult').className = 'apply-result error';
    document.getElementById('applyResult').textContent = 'Something went wrong. Please try again.';
    btn.textContent = 'Send Application →';
    btn.disabled = false;
  }
}
</script>
</body>
</html>`;
}
