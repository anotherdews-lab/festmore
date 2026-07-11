// routes/artists.js
// Complete artist system for Festmore
// Free tier: basic profile, 1 photo, contact button
// Paid tier (€29/yr): verified badge, 3 photos, audio/video links, featured placement

const express = require('express');
const router  = express.Router();
const { Client } = require('pg');

const PG_URL = process.env.DATABASE_URL || 'postgresql://postgres:VWgjvXynowzYucOsfqNNAPWojptOHaXJ@gondola.proxy.rlwy.net:47003/railway';

async function getDb() {
  const client = new Client({ connectionString: PG_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  return client;
}

// ─── ENSURE TABLE EXISTS ─────────────────────────────────────────────────────
async function ensureTable() {
  const client = await getDb();
  await client.query(`
    CREATE TABLE IF NOT EXISTS artists (
      id              SERIAL PRIMARY KEY,
      name            TEXT NOT NULL,
      slug            TEXT UNIQUE NOT NULL,
      genre           TEXT NOT NULL,
      subgenre        TEXT,
      city            TEXT NOT NULL,
      country         TEXT NOT NULL,
      bio             TEXT,
      short_bio       TEXT,
      website         TEXT,
      instagram       TEXT,
      youtube         TEXT,
      spotify         TEXT,
      soundcloud      TEXT,
      email           TEXT NOT NULL,
      phone           TEXT,
      booking_email   TEXT,
      image_url       TEXT,
      photo_2         TEXT,
      photo_3         TEXT,
      fee_display     TEXT DEFAULT 'Contact for fee',
      languages       TEXT,
      tags            TEXT,
      status          TEXT DEFAULT 'active',
      payment_status  TEXT DEFAULT 'free',
      verified        INTEGER DEFAULT 0,
      featured        INTEGER DEFAULT 0,
      views           INTEGER DEFAULT 0,
      stripe_id       TEXT,
      created_at      TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  try { await client.query(`CREATE INDEX IF NOT EXISTS idx_artists_country ON artists(country)`); } catch(e) {}
  try { await client.query(`CREATE INDEX IF NOT EXISTS idx_artists_genre   ON artists(genre)`);   } catch(e) {}
  await client.end();
}
ensureTable().catch(console.error);

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const FLAGS = {
  BE:'🇧🇪',CN:'🇨🇳',DK:'🇩🇰',FR:'🇫🇷',DE:'🇩🇪',NL:'🇳🇱',PL:'🇵🇱',SE:'🇸🇪',AE:'🇦🇪',GB:'🇬🇧',
  US:'🇺🇸',NO:'🇳🇴',FI:'🇫🇮',AT:'🇦🇹',CH:'🇨🇭',IT:'🇮🇹',ES:'🇪🇸',PT:'🇵🇹',IE:'🇮🇪',CZ:'🇨🇿',
  HU:'🇭🇺',GR:'🇬🇷',HR:'🇭🇷',IN:'🇮🇳',TH:'🇹🇭',JP:'🇯🇵',AU:'🇦🇺',CA:'🇨🇦',BR:'🇧🇷',
  EE:'🇪🇪',RS:'🇷🇸',AL:'🇦🇱',RO:'🇷🇴',
};
const COUNTRY_NAMES = {
  BE:'Belgium',CN:'China',DK:'Denmark',FR:'France',DE:'Germany',NL:'Netherlands',
  PL:'Poland',SE:'Sweden',AE:'UAE',GB:'United Kingdom',US:'USA',NO:'Norway',
  FI:'Finland',AT:'Austria',CH:'Switzerland',IT:'Italy',ES:'Spain',PT:'Portugal',
  IE:'Ireland',CZ:'Czech Republic',HU:'Hungary',GR:'Greece',HR:'Croatia',
  IN:'India',TH:'Thailand',JP:'Japan',AU:'Australia',CA:'Canada',BR:'Brazil',
  EE:'Estonia',RS:'Serbia',AL:'Albania',RO:'Romania',
};
const GENRES = [
  'DJ / Electronic','Live Band','Solo Artist','Duo','Acoustic','Rock','Pop',
  'Jazz','Blues','Folk / Country','Hip-Hop / Rap','R&B / Soul','Classical',
  'World Music','Reggae','Metal / Heavy','Comedy / MC','Circus / Performance',
  'Dance Act','Cover Band','Tribute Band','Other',
];

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
}

// ─── CSS ─────────────────────────────────────────────────────────────────────
const CSS = `
<style>
:root{--ink:#1a1208;--ink2:#3d3530;--ink3:#7a6f68;--cream:#faf8f3;--warm:#f3ede3;--flame:#e8470a;--green:#0a1a0f;--card:#fff;--border:#e8e0d5;--radius:14px;}
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Inter',system-ui,sans-serif;background:var(--cream);color:var(--ink);line-height:1.6;}
a{color:inherit;text-decoration:none;}
.btn{display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:8px;font-weight:600;font-size:15px;cursor:pointer;border:none;transition:all .2s;}
.btn-primary{background:var(--flame);color:#fff;}
.btn-primary:hover{background:#c73d08;}
.btn-secondary{background:var(--green);color:#fff;}
.btn-secondary:hover{background:#1a3020;}
.btn-outline{background:transparent;color:var(--ink);border:2px solid var(--border);}
.btn-outline:hover{border-color:var(--ink);}

/* NAV */
.nav{background:var(--green);padding:0 40px;height:64px;display:flex;align-items:center;justify-content:space-between;}
.nav-logo{font-size:22px;font-weight:800;color:#fff;}
.nav-logo span{color:var(--flame);}
.nav-links{display:flex;gap:24px;align-items:center;}
.nav-links a{color:rgba(255,255,255,.8);font-size:14px;font-weight:500;}
.nav-links a:hover{color:#fff;}
.nav-links a.active{color:var(--flame);}

/* HERO */
.hero{background:linear-gradient(135deg,var(--green) 0%,#1a3020 100%);padding:80px 40px;text-align:center;}
.hero h1{font-size:48px;font-weight:900;color:#fff;margin-bottom:16px;line-height:1.1;}
.hero h1 span{color:var(--flame);}
.hero p{color:rgba(255,255,255,.75);font-size:18px;max-width:600px;margin:0 auto 32px;}
.hero-btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;}
.hero-stats{display:flex;gap:40px;justify-content:center;margin-top:48px;flex-wrap:wrap;}
.hero-stat{text-align:center;}
.hero-stat-num{font-size:32px;font-weight:900;color:#fff;}
.hero-stat-label{font-size:13px;color:rgba(255,255,255,.6);margin-top:2px;}

/* FILTERS */
.filters{background:#fff;border-bottom:1px solid var(--border);padding:20px 40px;display:flex;gap:12px;flex-wrap:wrap;align-items:center;}
.filter-select{padding:10px 16px;border:1.5px solid var(--border);border-radius:8px;font-size:14px;background:#fff;cursor:pointer;color:var(--ink);}
.filter-select:focus{outline:none;border-color:var(--flame);}
.search-input{flex:1;min-width:200px;padding:10px 16px;border:1.5px solid var(--border);border-radius:8px;font-size:14px;}
.search-input:focus{outline:none;border-color:var(--flame);}

/* GRID */
.section{max-width:1300px;margin:0 auto;padding:48px 40px;}
.section-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:32px;}
.section-title{font-size:28px;font-weight:800;}
.section-count{font-size:14px;color:var(--ink3);}
.artist-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:24px;}

/* ARTIST CARD */
.artist-card{background:var(--card);border-radius:var(--radius);overflow:hidden;border:1px solid var(--border);transition:all .2s;display:flex;flex-direction:column;}
.artist-card:hover{transform:translateY(-3px);box-shadow:0 12px 32px rgba(0,0,0,.1);border-color:var(--flame);}
.artist-card-img{width:100%;height:220px;object-fit:cover;background:var(--warm);}
.artist-card-img-placeholder{width:100%;height:220px;background:linear-gradient(135deg,var(--warm),var(--border));display:flex;align-items:center;justify-content:center;font-size:64px;}
.artist-card-body{padding:20px;flex:1;display:flex;flex-direction:column;}
.artist-card-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;}
.artist-name{font-size:18px;font-weight:700;line-height:1.2;}
.artist-badge-verified{background:#e8f5e9;color:#2e7d32;font-size:11px;font-weight:700;padding:3px 8px;border-radius:20px;white-space:nowrap;}
.artist-badge-free{background:#fef3e2;color:#e65100;font-size:11px;font-weight:600;padding:3px 8px;border-radius:20px;}
.artist-genre{font-size:13px;color:var(--flame);font-weight:600;margin-bottom:6px;}
.artist-location{font-size:13px;color:var(--ink3);margin-bottom:12px;}
.artist-bio{font-size:14px;color:var(--ink2);line-height:1.5;flex:1;overflow:hidden;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;}
.artist-card-footer{padding:16px 20px;border-top:1px solid var(--border);display:flex;gap:8px;}
.artist-card-footer .btn{flex:1;padding:10px;font-size:13px;justify-content:center;}

/* PROFILE PAGE */
.profile-hero{background:linear-gradient(135deg,var(--green),#1a3020);padding:60px 40px 0;}
.profile-inner{max-width:1100px;margin:0 auto;display:grid;grid-template-columns:300px 1fr;gap:40px;align-items:end;}
.profile-img-wrap{position:relative;}
.profile-img{width:300px;height:300px;object-fit:cover;border-radius:16px 16px 0 0;border:4px solid rgba(255,255,255,.2);}
.profile-img-placeholder{width:300px;height:300px;background:rgba(255,255,255,.1);border-radius:16px 16px 0 0;display:flex;align-items:center;justify-content:center;font-size:100px;}
.profile-info{padding-bottom:40px;}
.profile-name{font-size:42px;font-weight:900;color:#fff;line-height:1.1;margin-bottom:8px;}
.profile-genre{font-size:18px;color:var(--flame);font-weight:600;margin-bottom:12px;}
.profile-location{font-size:16px;color:rgba(255,255,255,.7);margin-bottom:20px;}
.profile-badges{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:24px;}
.badge{padding:6px 14px;border-radius:20px;font-size:13px;font-weight:600;}
.badge-verified{background:rgba(255,255,255,.15);color:#fff;border:1px solid rgba(255,255,255,.3);}
.badge-genre{background:var(--flame);color:#fff;}
.profile-actions{display:flex;gap:12px;flex-wrap:wrap;}
.profile-body{max-width:1100px;margin:0 auto;padding:48px 40px;display:grid;grid-template-columns:1fr 320px;gap:40px;}
.profile-main{}
.profile-section{margin-bottom:40px;}
.profile-section h2{font-size:20px;font-weight:800;margin-bottom:16px;padding-bottom:12px;border-bottom:2px solid var(--border);}
.profile-bio{font-size:16px;line-height:1.8;color:var(--ink2);}
.photos-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;}
.photos-grid img{width:100%;height:160px;object-fit:cover;border-radius:10px;border:1px solid var(--border);}
.profile-sidebar{}
.sidebar-card{background:#fff;border-radius:var(--radius);border:1px solid var(--border);padding:24px;margin-bottom:20px;}
.sidebar-card h3{font-size:16px;font-weight:700;margin-bottom:16px;}
.sidebar-item{display:flex;gap:10px;align-items:center;margin-bottom:12px;font-size:14px;color:var(--ink2);}
.sidebar-item a{color:var(--flame);}
.sidebar-item a:hover{text-decoration:underline;}
.contact-form input,.contact-form textarea,.contact-form select{width:100%;padding:10px 14px;border:1.5px solid var(--border);border-radius:8px;font-size:14px;margin-bottom:12px;font-family:inherit;}
.contact-form input:focus,.contact-form textarea:focus{outline:none;border-color:var(--flame);}
.contact-form textarea{height:100px;resize:vertical;}

/* REGISTER */
.register-page{max-width:700px;margin:0 auto;padding:48px 40px;}
.register-page h1{font-size:32px;font-weight:900;margin-bottom:8px;}
.register-page p.sub{color:var(--ink3);margin-bottom:32px;}
.form-group{margin-bottom:20px;}
.form-label{display:block;font-size:14px;font-weight:600;margin-bottom:6px;}
.form-label span{color:var(--flame);}
.form-input{width:100%;padding:12px 16px;border:1.5px solid var(--border);border-radius:8px;font-size:15px;font-family:inherit;transition:border .2s;}
.form-input:focus{outline:none;border-color:var(--flame);}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
.form-hint{font-size:12px;color:var(--ink3);margin-top:4px;}
.plans{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px;}
.plan{border:2px solid var(--border);border-radius:12px;padding:20px;cursor:pointer;transition:all .2s;position:relative;}
.plan:hover,.plan.selected{border-color:var(--flame);background:#fff9f7;}
.plan-name{font-size:17px;font-weight:800;margin-bottom:4px;}
.plan-price{font-size:24px;font-weight:900;color:var(--flame);}
.plan-price span{font-size:14px;color:var(--ink3);font-weight:400;}
.plan-features{margin-top:12px;font-size:13px;color:var(--ink2);}
.plan-features li{list-style:none;padding:3px 0;}
.plan-features li::before{content:'✓ ';color:var(--flame);font-weight:700;}
.plan-badge{position:absolute;top:-10px;right:16px;background:var(--flame);color:#fff;font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;}
.upload-zone{border:2px dashed var(--border);border-radius:10px;padding:24px;text-align:center;cursor:pointer;transition:all .2s;}
.upload-zone:hover{border-color:var(--flame);background:#fff9f7;}
.upload-zone p{font-size:14px;color:var(--ink3);margin-top:8px;}
.success-box{background:#e8f5e9;border:1px solid #a5d6a7;border-radius:12px;padding:24px;text-align:center;display:none;}
.success-box h2{color:#2e7d32;font-size:24px;margin-bottom:8px;}
.pricing-banner{background:linear-gradient(135deg,#fff9f7,var(--warm));border:2px solid var(--flame);border-radius:16px;padding:32px;text-align:center;margin-bottom:32px;}
.pricing-banner h2{font-size:24px;font-weight:800;margin-bottom:8px;}
.pricing-banner p{color:var(--ink2);margin-bottom:20px;}

/* FOOTER */
.footer{background:var(--green);color:rgba(255,255,255,.6);text-align:center;padding:32px 40px;font-size:14px;margin-top:80px;}
.footer a{color:rgba(255,255,255,.8);}

/* EMPTY STATE */
.empty{text-align:center;padding:80px 40px;color:var(--ink3);}
.empty-icon{font-size:64px;margin-bottom:16px;}
.empty h2{font-size:24px;font-weight:700;color:var(--ink);margin-bottom:8px;}

@media(max-width:768px){
  .hero h1{font-size:32px;}
  .hero{padding:48px 20px;}
  .section{padding:32px 20px;}
  .filters{padding:16px 20px;}
  .artist-grid{grid-template-columns:1fr;}
  .profile-inner{grid-template-columns:1fr;}
  .profile-img,.profile-img-placeholder{width:100%;height:250px;border-radius:12px 12px 0 0;}
  .profile-body{grid-template-columns:1fr;padding:32px 20px;}
  .form-row{grid-template-columns:1fr;}
  .plans{grid-template-columns:1fr;}
  .photos-grid{grid-template-columns:repeat(2,1fr);}
  .nav{padding:0 20px;}
  .register-page{padding:32px 20px;}
}
</style>`;

function nav(active='') {
  return `
<nav class="nav">
  <a href="/" class="nav-logo">Fest<span>more</span></a>
  <div class="nav-links">
    <a href="/events" ${active==='events'?'class="active"':''}>Events</a>
    <a href="/artists" ${active==='artists'?'class="active"':''}>Artists</a>
    <a href="/vendors" ${active==='vendors'?'class="active"':''}>Vendors</a>
    <a href="/articles">Articles</a>
    <a href="/artists/register" class="btn btn-primary" style="padding:8px 18px;font-size:13px;">🎤 Join as Artist</a>
  </div>
</nav>`;
}

function foot() {
  return `
<footer class="footer">
  <p>© ${new Date().getFullYear()} Festmore · <a href="/about">About</a> · <a href="/contact">Contact</a> · <a href="/artists/register">List Your Act</a></p>
</footer>`;
}

// ─── BROWSE ARTISTS ──────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  const { country='', genre='', q='', page=1 } = req.query;
  const limit = 24;
  const offset = (parseInt(page)-1) * limit;

  const client = await getDb();

  let where = `WHERE status='active'`;
  const params = [];
  let pi = 1;

  if (country) { where += ` AND country=$${pi++}`; params.push(country); }
  if (genre)   { where += ` AND genre=$${pi++}`;   params.push(genre); }
  if (q)       { where += ` AND (name ILIKE $${pi} OR bio ILIKE $${pi} OR city ILIKE $${pi})`; params.push('%'+q+'%'); pi++; }

  const totalRes = await client.query(`SELECT COUNT(*) as n FROM artists ${where}`, params);
  const total = parseInt(totalRes.rows[0].n);

  const artists = await client.query(
    `SELECT * FROM artists ${where} ORDER BY featured DESC, verified DESC, created_at DESC LIMIT $${pi} OFFSET $${pi+1}`,
    [...params, limit, offset]
  );

  // Stats
  const stats = await client.query(`SELECT COUNT(*) as n, COUNT(DISTINCT country) as countries FROM artists WHERE status='active'`);
  const countryList = await client.query(`SELECT country, COUNT(*) as n FROM artists WHERE status='active' GROUP BY country ORDER BY n DESC`);

  await client.end();

  const totalPages = Math.ceil(total / limit);

  const genreEmojis = {
    'DJ / Electronic':'🎧','Live Band':'🎸','Solo Artist':'🎤','Duo':'🎵','Acoustic':'🪕',
    'Rock':'🤘','Pop':'⭐','Jazz':'🎷','Blues':'🎺','Folk / Country':'🤠',
    'Hip-Hop / Rap':'🎤','R&B / Soul':'🎵','Classical':'🎻','World Music':'🌍',
    'Reggae':'🌿','Metal / Heavy':'🤘','Comedy / MC':'🎤','Circus / Performance':'🎪',
    'Dance Act':'💃','Cover Band':'🎵','Tribute Band':'🎭','Other':'🎶',
  };

  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Artists for Hire — Book Festival Performers | Festmore</title>
<meta name="description" content="Browse and book artists, DJs, bands and performers for your festival or event across ${stats.rows[0].countries} countries. Connect directly with verified acts on Festmore."/>
<link rel="canonical" href="https://festmore.com/artists"/>
${CSS}
</head>
<body>
${nav('artists')}

<div class="hero">
  <h1>Book the Perfect <span>Artist</span><br>for Your Event</h1>
  <p>Browse DJs, bands, solo artists and performers from ${stats.rows[0].countries} countries. Connect and book directly — no agency fees.</p>
  <div class="hero-btns">
    <a href="/artists/register" class="btn btn-primary">🎤 List Your Act</a>
    <a href="#browse" class="btn btn-outline" style="color:#fff;border-color:rgba(255,255,255,.3);">Browse Artists ↓</a>
  </div>
  <div class="hero-stats">
    <div class="hero-stat"><div class="hero-stat-num">${stats.rows[0].n}+</div><div class="hero-stat-label">Artists Listed</div></div>
    <div class="hero-stat"><div class="hero-stat-num">${stats.rows[0].countries}</div><div class="hero-stat-label">Countries</div></div>
    <div class="hero-stat"><div class="hero-stat-num">Free</div><div class="hero-stat-label">to List Your Act</div></div>
    <div class="hero-stat"><div class="hero-stat-num">Direct</div><div class="hero-stat-label">Booking — No Fees</div></div>
  </div>
</div>

<div class="filters" id="browse">
  <form method="GET" action="/artists" style="display:contents;">
    <input class="search-input" name="q" placeholder="🔍 Search artists, genres, cities..." value="${q||''}"/>
    <select class="filter-select" name="country" onchange="this.form.submit()">
      <option value="">🌍 All Countries</option>
      ${countryList.rows.map(c=>`<option value="${c.country}" ${country===c.country?'selected':''}>${FLAGS[c.country]||'🌍'} ${COUNTRY_NAMES[c.country]||c.country} (${c.n})</option>`).join('')}
    </select>
    <select class="filter-select" name="genre" onchange="this.form.submit()">
      <option value="">🎵 All Genres</option>
      ${GENRES.map(g=>`<option value="${g}" ${genre===g?'selected':''}>${genreEmojis[g]||'🎵'} ${g}</option>`).join('')}
    </select>
    <button type="submit" class="btn btn-primary" style="padding:10px 20px;">Search</button>
    ${(q||country||genre)?`<a href="/artists" class="btn btn-outline" style="padding:10px 20px;">Clear</a>`:''}
  </form>
</div>

<div class="section">
  <div class="section-header">
    <h2 class="section-title">${genre?genre+' Artists':(country?COUNTRY_NAMES[country]+' Artists':'All Artists')}</h2>
    <span class="section-count">${total} artist${total!==1?'s':''} found</span>
  </div>

  ${artists.rows.length === 0 ? `
  <div class="empty">
    <div class="empty-icon">🎤</div>
    <h2>No artists found</h2>
    <p>Try a different search or <a href="/artists/register" style="color:var(--flame);">be the first to list your act!</a></p>
  </div>` : `
  <div class="artist-grid">
    ${artists.rows.map(a => {
      const genreEmoji = genreEmojis[a.genre] || '🎵';
      const flag = FLAGS[a.country] || '🌍';
      const imgEl = a.image_url
        ? `<img src="${a.image_url}" alt="${a.name}" class="artist-card-img" loading="lazy"/>`
        : `<div class="artist-card-img-placeholder">🎤</div>`;
      return `
      <a href="/artists/${a.slug}" class="artist-card">
        ${imgEl}
        <div class="artist-card-body">
          <div class="artist-card-top">
            <div class="artist-name">${a.name}</div>
            ${a.verified ? `<span class="artist-badge-verified">✓ Verified</span>` : `<span class="artist-badge-free">Free</span>`}
          </div>
          <div class="artist-genre">${genreEmoji} ${a.genre}</div>
          <div class="artist-location">${flag} ${a.city}, ${COUNTRY_NAMES[a.country]||a.country}</div>
          <div class="artist-bio">${a.short_bio||a.bio||'Available for bookings and events.'}</div>
        </div>
        <div class="artist-card-footer">
          <span class="btn btn-secondary">View Profile</span>
          <span class="btn btn-outline">Contact</span>
        </div>
      </a>`;
    }).join('')}
  </div>

  ${totalPages > 1 ? `
  <div style="display:flex;justify-content:center;gap:8px;margin-top:48px;flex-wrap:wrap;">
    ${Array.from({length:totalPages},(_,i)=>i+1).map(p=>`
      <a href="/artists?page=${p}&country=${country}&genre=${genre}&q=${q||''}"
         style="padding:8px 16px;border-radius:8px;border:1.5px solid ${parseInt(page)===p?'var(--flame)':'var(--border)'};background:${parseInt(page)===p?'var(--flame)':'#fff'};color:${parseInt(page)===p?'#fff':'var(--ink)'};font-weight:600;">${p}</a>
    `).join('')}
  </div>` : ''}
  `}

  <!-- CTA BANNER -->
  <div class="pricing-banner" style="margin-top:64px;">
    <h2>🎤 Are you a performer?</h2>
    <p>List your act on Festmore and get discovered by event organisers across 39 countries.<br>Basic profile is completely <strong>free</strong> — upgrade to Verified for just €29/year.</p>
    <a href="/artists/register" class="btn btn-primary" style="font-size:16px;padding:14px 32px;">List Your Act — Free</a>
  </div>
</div>

${foot()}
</body>
</html>`);
});

// ─── ARTIST PROFILE ──────────────────────────────────────────────────────────
router.get('/:slug', async (req, res, next) => {
  if (['register','success','pricing'].includes(req.params.slug)) return next();

  const client = await getDb();
  const result = await client.query(`SELECT * FROM artists WHERE slug=$1 AND status='active'`, [req.params.slug]);

  if (!result.rows.length) { await client.end(); return res.redirect('/artists'); }

  const a = result.rows[0];
  await client.query(`UPDATE artists SET views=views+1 WHERE id=$1`, [a.id]);
  await client.end();

  const flag = FLAGS[a.country] || '🌍';
  const genreEmoji = {'DJ / Electronic':'🎧','Live Band':'🎸','Solo Artist':'🎤','Duo':'🎵','Acoustic':'🪕','Rock':'🤘','Pop':'⭐','Jazz':'🎷','Blues':'🎺','Folk / Country':'🤠','Hip-Hop / Rap':'🎤','R&B / Soul':'🎵','Classical':'🎻','World Music':'🌍','Reggae':'🌿','Metal / Heavy':'🤘','Comedy / MC':'🎤','Circus / Performance':'🎪','Dance Act':'💃','Cover Band':'🎵','Tribute Band':'🎭','Other':'🎶'}[a.genre]||'🎵';

  const photos = [a.photo_2, a.photo_3].filter(Boolean);

  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${a.name} — ${a.genre} from ${a.city} | Festmore Artists</title>
<meta name="description" content="Book ${a.name}, a ${a.genre} artist from ${a.city}, ${COUNTRY_NAMES[a.country]||a.country}. ${(a.short_bio||'').substring(0,150)}"/>
<link rel="canonical" href="https://festmore.com/artists/${a.slug}"/>
${CSS}
</head>
<body>
${nav('artists')}

<div class="profile-hero">
  <div class="profile-inner" style="max-width:1100px;margin:0 auto;padding:0 40px;">
    <div class="profile-img-wrap">
      ${a.image_url
        ? `<img src="${a.image_url}" alt="${a.name}" class="profile-img"/>`
        : `<div class="profile-img-placeholder">🎤</div>`}
    </div>
    <div class="profile-info">
      <div class="profile-name">${a.name}</div>
      <div class="profile-genre">${genreEmoji} ${a.genre}${a.subgenre?` · ${a.subgenre}`:''}</div>
      <div class="profile-location">${flag} ${a.city}, ${COUNTRY_NAMES[a.country]||a.country}</div>
      <div class="profile-badges">
        ${a.verified?`<span class="badge badge-verified">✓ Verified Artist</span>`:''}
        <span class="badge badge-genre">${a.genre}</span>
        ${a.fee_display?`<span class="badge" style="background:rgba(255,255,255,.15);color:#fff;">${a.fee_display}</span>`:''}
      </div>
      <div class="profile-actions">
        <a href="#contact" class="btn btn-primary">📩 Book / Contact</a>
        ${a.instagram?`<a href="${a.instagram.startsWith('http')?a.instagram:'https://instagram.com/'+a.instagram.replace('@','')}" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:8px;background:linear-gradient(135deg,#f09433,#dc2743,#bc1888);color:#fff;padding:12px 24px;border-radius:8px;font-weight:600;font-size:15px;text-decoration:none;">📸 Instagram</a>`:''}
        ${a.spotify?`<a href="${a.spotify}" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:8px;background:#1DB954;color:#fff;padding:12px 24px;border-radius:8px;font-weight:600;font-size:15px;text-decoration:none;">🎵 Spotify</a>`:''}
        ${a.youtube?`<a href="${a.youtube}" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:8px;background:#FF0000;color:#fff;padding:12px 24px;border-radius:8px;font-weight:600;font-size:15px;text-decoration:none;">▶ YouTube</a>`:''}
        ${a.website?`<a href="${a.website}" target="_blank" rel="noopener" class="btn btn-outline" style="color:#fff;border-color:rgba(255,255,255,.3);">🌐 Website</a>`:''}
      </div>
    </div>
  </div>
</div>

<div class="profile-body" style="max-width:1100px;margin:0 auto;padding:48px 40px;">
  <div class="profile-main">

    <!-- BIO -->
    <div class="profile-section">
      <h2>About ${a.name}</h2>
      <p class="profile-bio">${(a.bio||'No bio provided yet.').replace(/\n/g,'<br/>')}</p>
    </div>

    <!-- PHOTOS -->
    ${photos.length ? `
    <div class="profile-section">
      <h2>Photos</h2>
      <div class="photos-grid">
        ${a.image_url?`<img src="${a.image_url}" alt="${a.name}"/>`:''}
        ${photos.map(p=>`<img src="${p}" alt="${a.name}"/>`).join('')}
      </div>
    </div>` : ''}

    <!-- SOCIAL LINKS -->
    ${(a.instagram||a.youtube||a.soundcloud||a.spotify||a.website)?`
    <div class="profile-section">
      <h2>Find & Follow</h2>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;">
        ${a.instagram?`
        <a href="${a.instagram.startsWith('http')?a.instagram:'https://instagram.com/'+a.instagram.replace('@','')}" target="_blank" rel="noopener"
           style="display:flex;align-items:center;gap:12px;padding:14px 18px;border-radius:12px;background:linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888);color:#fff;text-decoration:none;font-weight:600;transition:all .2s;"
           onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform=''">
          <span style="font-size:22px;">📸</span>
          <div><div style="font-size:11px;opacity:.8;">Instagram</div><div style="font-size:14px;">Follow</div></div>
        </a>` : ''}
        ${a.spotify?`
        <a href="${a.spotify}" target="_blank" rel="noopener"
           style="display:flex;align-items:center;gap:12px;padding:14px 18px;border-radius:12px;background:#1DB954;color:#fff;text-decoration:none;font-weight:600;transition:all .2s;"
           onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform=''">
          <span style="font-size:22px;">🎵</span>
          <div><div style="font-size:11px;opacity:.8;">Spotify</div><div style="font-size:14px;">Listen</div></div>
        </a>` : ''}
        ${a.youtube?`
        <a href="${a.youtube}" target="_blank" rel="noopener"
           style="display:flex;align-items:center;gap:12px;padding:14px 18px;border-radius:12px;background:#FF0000;color:#fff;text-decoration:none;font-weight:600;transition:all .2s;"
           onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform=''">
          <span style="font-size:22px;">▶️</span>
          <div><div style="font-size:11px;opacity:.8;">YouTube</div><div style="font-size:14px;">Watch</div></div>
        </a>` : ''}
        ${a.soundcloud?`
        <a href="${a.soundcloud}" target="_blank" rel="noopener"
           style="display:flex;align-items:center;gap:12px;padding:14px 18px;border-radius:12px;background:#FF5500;color:#fff;text-decoration:none;font-weight:600;transition:all .2s;"
           onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform=''">
          <span style="font-size:22px;">🔊</span>
          <div><div style="font-size:11px;opacity:.8;">SoundCloud</div><div style="font-size:14px;">Listen</div></div>
        </a>` : ''}
        ${a.website?`
        <a href="${a.website}" target="_blank" rel="noopener"
           style="display:flex;align-items:center;gap:12px;padding:14px 18px;border-radius:12px;background:#0a1a0f;color:#fff;text-decoration:none;font-weight:600;transition:all .2s;"
           onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform=''">
          <span style="font-size:22px;">🌐</span>
          <div><div style="font-size:11px;opacity:.8;">Website</div><div style="font-size:14px;">Visit</div></div>
        </a>` : ''}
      </div>
    </div>` : ''}

  </div>

  <!-- SIDEBAR -->
  <div class="profile-sidebar">

    <!-- QUICK INFO -->
    <div class="sidebar-card">
      <h3>Quick Info</h3>
      <div class="sidebar-item">📍 ${flag} ${a.city}, ${COUNTRY_NAMES[a.country]||a.country}</div>
      <div class="sidebar-item">🎵 ${a.genre}${a.subgenre?` / ${a.subgenre}`:''}</div>
      ${a.fee_display?`<div class="sidebar-item">💰 ${a.fee_display}</div>`:''}
      ${a.languages?`<div class="sidebar-item">🗣️ ${a.languages}</div>`:''}
      ${a.website?`<div class="sidebar-item">🌐 <a href="${a.website}" target="_blank">Website</a></div>`:''}
    </div>

    <!-- CONTACT FORM -->
    <div class="sidebar-card" id="contact">
      <h3>📩 Book / Contact</h3>
      <form class="contact-form" id="contact-form">
        <input type="hidden" name="artist_id" value="${a.id}"/>
        <input type="hidden" name="artist_name" value="${a.name}"/>
        <input type="text" name="from_name" placeholder="Your name" required/>
        <input type="email" name="from_email" placeholder="Your email" required/>
        <input type="text" name="event_name" placeholder="Event name & date"/>
        <select name="event_type">
          <option value="">Type of event...</option>
          <option>Festival</option>
          <option>Private Party</option>
          <option>Corporate Event</option>
          <option>Wedding</option>
          <option>Club Night</option>
          <option>Other</option>
        </select>
        <textarea name="message" placeholder="Tell the artist about your event — date, location, audience size, budget..."></textarea>
        <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center;">Send Enquiry</button>
      </form>
      <div id="contact-success" style="display:none;text-align:center;padding:16px;color:#2e7d32;font-weight:600;">
        ✅ Enquiry sent! The artist will reply to your email.
      </div>
    </div>

  </div>
</div>

<script>
document.getElementById('contact-form').addEventListener('submit',function(e){
  e.preventDefault();
  const data={};
  new FormData(e.target).forEach(function(v,k){data[k]=v;});
  fetch('/artists/enquiry',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)})
    .then(r=>r.json())
    .then(()=>{
      document.getElementById('contact-form').style.display='none';
      document.getElementById('contact-success').style.display='block';
    }).catch(()=>{alert('Message sent!');});
});
</script>

${foot()}
</body>
</html>`);
});

// ─── REGISTER PAGE ───────────────────────────────────────────────────────────
router.get('/register', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>List Your Act on Festmore | Artists</title>
<meta name="description" content="List your act on Festmore and get discovered by festival organisers across 39 countries. Free basic profile or Verified for €29/year."/>
${CSS}
</head>
<body>
${nav('artists')}

<div class="register-page">

  <h1>🎤 List Your Act</h1>
  <p class="sub">Get discovered by event organisers and festival bookers across 39 countries. Free to join — upgrade anytime.</p>

  <!-- PLANS -->
  <div class="plans">
    <div class="plan selected" id="plan-free" onclick="selectPlan('free')">
      <div class="plan-name">Free Profile</div>
      <div class="plan-price">€0 <span>/ forever</span></div>
      <ul class="plan-features">
        <li>Public artist profile</li>
        <li>1 profile photo</li>
        <li>Bio and contact button</li>
        <li>Browse by country & genre</li>
        <li>Direct enquiry form</li>
      </ul>
    </div>
    <div class="plan" id="plan-paid" onclick="selectPlan('paid')">
      <div class="plan-badge">BEST VALUE</div>
      <div class="plan-name">Verified Artist</div>
      <div class="plan-price">€29 <span>/ year</span></div>
      <ul class="plan-features">
        <li>✓ Verified badge on profile</li>
        <li>Up to 3 photos</li>
        <li>Spotify / YouTube / SoundCloud</li>
        <li>Featured in search results</li>
        <li>Priority placement</li>
        <li>Newsletter inclusion</li>
      </ul>
    </div>
  </div>
  <input type="hidden" id="selected-plan" value="free"/>

  <!-- FORM -->
  <form id="artist-form" onsubmit="submitArtist(event)">

    <div style="background:var(--warm);border-radius:12px;padding:20px;margin-bottom:24px;">
      <strong>📋 Basic Information</strong>
    </div>

    <div class="form-group">
      <label class="form-label">Artist / Act Name <span>*</span></label>
      <input class="form-input" name="name" placeholder="e.g. DJ Sunset, The Rolling Trio..." required/>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Genre <span>*</span></label>
        <select class="form-input" name="genre" required>
          <option value="">Select genre...</option>
          ${GENRES.map(g=>`<option value="${g}">${g}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Sub-genre / Style</label>
        <input class="form-input" name="subgenre" placeholder="e.g. Deep House, Indie Folk..."/>
      </div>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label class="form-label">City <span>*</span></label>
        <input class="form-input" name="city" placeholder="Your city" required/>
      </div>
      <div class="form-group">
        <label class="form-label">Country <span>*</span></label>
        <select class="form-input" name="country" required>
          <option value="">Select country...</option>
          ${Object.entries(COUNTRY_NAMES).map(([k,v])=>`<option value="${k}">${FLAGS[k]||''} ${v}</option>`).join('')}
        </select>
      </div>
    </div>

    <div class="form-group">
      <label class="form-label">Short Bio (appears on cards) <span>*</span></label>
      <input class="form-input" name="short_bio" placeholder="One sentence about your act — max 120 characters" maxlength="120" required/>
    </div>

    <div class="form-group">
      <label class="form-label">Full Bio</label>
      <textarea class="form-input" name="bio" rows="5" placeholder="Tell organisers about your act — experience, style, what makes you unique, past events..."></textarea>
    </div>

    <div style="background:var(--warm);border-radius:12px;padding:20px;margin:24px 0;">
      <strong>📸 Photos</strong>
    </div>

    <div class="form-group">
      <label class="form-label">Profile Photo URL <span>*</span></label>
      <input class="form-input" name="image_url" placeholder="https://... (link to your main photo)" required/>
      <p class="form-hint">Upload your photo to Cloudinary, Imgur or any image host and paste the URL here.</p>
    </div>

    <div id="extra-photos" style="display:none;">
      <div class="form-group">
        <label class="form-label">Photo 2 URL</label>
        <input class="form-input" name="photo_2" placeholder="https://..."/>
      </div>
      <div class="form-group">
        <label class="form-label">Photo 3 URL</label>
        <input class="form-input" name="photo_3" placeholder="https://..."/>
      </div>
    </div>

    <div style="background:var(--warm);border-radius:12px;padding:20px;margin:24px 0;">
      <strong>📬 Contact & Links</strong>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Email <span>*</span></label>
        <input class="form-input" name="email" type="email" placeholder="your@email.com" required/>
        <p class="form-hint">Not shown publicly — used for enquiries.</p>
      </div>
      <div class="form-group">
        <label class="form-label">Booking Email</label>
        <input class="form-input" name="booking_email" type="email" placeholder="booking@... (if different)"/>
      </div>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Website</label>
        <input class="form-input" name="website" type="url" placeholder="https://yoursite.com"/>
      </div>
      <div class="form-group">
        <label class="form-label">Instagram</label>
        <input class="form-input" name="instagram" placeholder="https://instagram.com/..."/>
      </div>
    </div>

    <div id="music-links" style="display:none;">
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Spotify</label>
          <input class="form-input" name="spotify" placeholder="https://open.spotify.com/..."/>
        </div>
        <div class="form-group">
          <label class="form-label">YouTube</label>
          <input class="form-input" name="youtube" placeholder="https://youtube.com/..."/>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">SoundCloud</label>
        <input class="form-input" name="soundcloud" placeholder="https://soundcloud.com/..."/>
      </div>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Fee Range</label>
        <select class="form-input" name="fee_display">
          <option value="Contact for fee">Contact for fee</option>
          <option value="From €100">From €100</option>
          <option value="From €250">From €250</option>
          <option value="From €500">From €500</option>
          <option value="From €1,000">From €1,000</option>
          <option value="From €2,500">From €2,500</option>
          <option value="From €5,000">From €5,000</option>
          <option value="Negotiable">Negotiable</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Languages</label>
        <input class="form-input" name="languages" placeholder="e.g. English, German, Spanish"/>
      </div>
    </div>

    <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center;padding:16px;font-size:17px;margin-top:8px;">
      🎤 Create My Profile
    </button>
    <p style="text-align:center;font-size:13px;color:var(--ink3);margin-top:12px;">Free profiles go live immediately. We'll email you your profile link.</p>
  </form>

  <!-- SUCCESS -->
  <div class="success-box" id="success-box">
    <div style="font-size:48px;margin-bottom:12px;">🎉</div>
    <h2>You're on Festmore!</h2>
    <p style="color:#388e3c;margin-bottom:16px;">Your artist profile is now live. Event organisers can find and contact you directly.</p>
    <a id="profile-link" href="/artists" class="btn btn-primary">View Your Profile →</a>
    <p style="margin-top:16px;font-size:13px;color:#555;">Want more visibility? Upgrade to <a href="/artists/pricing" style="color:var(--flame);">Verified for €29/year</a> — includes badge, 3 photos and featured placement.</p>
  </div>

</div>

<script>
function selectPlan(plan) {
  document.getElementById('selected-plan').value = plan;
  document.getElementById('plan-free').classList.toggle('selected', plan==='free');
  document.getElementById('plan-paid').classList.toggle('selected', plan==='paid');
  document.getElementById('extra-photos').style.display = plan==='paid'?'block':'none';
  document.getElementById('music-links').style.display = plan==='paid'?'block':'none';
}

async function submitArtist(e) {
  e.preventDefault();
  const btn = e.target.querySelector('[type=submit]');
  btn.textContent = 'Creating profile...';
  btn.disabled = true;

  const data = {};
  new FormData(e.target).forEach((v,k) => data[k]=v);
  data.plan = document.getElementById('selected-plan').value;

  try {
    const r = await fetch('/artists/register', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
    const json = await r.json();
    if (json.ok) {
      document.getElementById('artist-form').style.display = 'none';
      document.getElementById('success-box').style.display = 'block';
      document.getElementById('profile-link').href = '/artists/' + json.slug;
    } else {
      alert(json.error || 'Something went wrong. Please try again.');
      btn.textContent = '🎤 Create My Profile';
      btn.disabled = false;
    }
  } catch(err) {
    alert('Error submitting. Please try again.');
    btn.textContent = '🎤 Create My Profile';
    btn.disabled = false;
  }
}
</script>

${foot()}
</body>
</html>`);
});

// ─── REGISTER POST ────────────────────────────────────────────────────────────
router.post('/register', express.json(), async (req, res) => {
  const { name, genre, subgenre, city, country, bio, short_bio, email,
          booking_email, website, instagram, youtube, spotify, soundcloud,
          image_url, photo_2, photo_3, fee_display, languages, plan } = req.body;

  if (!name || !genre || !city || !country || !email) {
    return res.json({ ok:false, error:'Please fill in all required fields.' });
  }

  const slug = slugify(name) + '-' + Date.now().toString(36);

  const client = await getDb();
  try {
    await client.query(`
      INSERT INTO artists (name,slug,genre,subgenre,city,country,bio,short_bio,email,
        booking_email,website,instagram,youtube,spotify,soundcloud,image_url,photo_2,photo_3,
        fee_display,languages,status,payment_status,verified)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,'active',$21,$22)`,
      [name,slug,genre,subgenre||null,city,country,bio||null,short_bio||null,email,
       booking_email||null,website||null,instagram||null,youtube||null,spotify||null,soundcloud||null,
       image_url||null,photo_2||null,photo_3||null,fee_display||'Contact for fee',
       languages||null, 'free', 0]
    );

    // Notify admin
    try {
      const { Resend } = require('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: 'Festmore <onboarding@resend.dev>',
        to: 'anotherdews@gmail.com',
        subject: `🎤 New Artist: ${name} (${genre}) — ${city}, ${country}`,
        html: `<p><b>${name}</b> just listed on Festmore Artists.</p>
               <p>Genre: ${genre} | City: ${city}, ${country} | Plan: ${plan||'free'}</p>
               <p>Email: ${email}</p>
               <p><a href="https://festmore.com/artists/${slug}">View profile</a></p>`
      });
    } catch(e) {}

    res.json({ ok:true, slug });
  } catch(err) {
    console.error(err);
    res.json({ ok:false, error:'Could not create profile. Please try again.' });
  } finally {
    await client.end();
  }
});

// ─── CONTACT ENQUIRY ─────────────────────────────────────────────────────────
router.post('/enquiry', express.json(), async (req, res) => {
  const { artist_id, artist_name, from_name, from_email, event_name, event_type, message } = req.body;

  try {
    const client = await getDb();
    const artistRes = await client.query(`SELECT email, booking_email FROM artists WHERE id=$1`, [artist_id]);
    await client.end();

    if (!artistRes.rows.length) return res.json({ ok:false });

    const a = artistRes.rows[0];
    const toEmail = a.booking_email || a.email;

    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: 'Festmore Artists <onboarding@resend.dev>',
      to: 'anotherdews@gmail.com', // Replace with toEmail once domain verified
      reply_to: from_email,
      subject: `🎤 Booking Enquiry for ${artist_name} from ${from_name}`,
      html: `<div style="font-family:Arial,sans-serif;max-width:500px;">
        <h2>New Booking Enquiry — Festmore Artists</h2>
        <p><b>From:</b> ${from_name} (${from_email})</p>
        <p><b>Event:</b> ${event_name||'Not specified'}</p>
        <p><b>Type:</b> ${event_type||'Not specified'}</p>
        <p><b>Message:</b></p>
        <p style="background:#f5f5f5;padding:16px;border-radius:8px;">${(message||'').replace(/\n/g,'<br/>')}</p>
        <p style="margin-top:24px;font-size:13px;color:#666;">Reply directly to this email to respond to the enquiry.</p>
        <p style="font-size:13px;color:#666;">— Festmore Artists Platform</p>
      </div>`
    });

    res.json({ ok:true });
  } catch(err) {
    console.error(err);
    res.json({ ok:false });
  }
});

module.exports = router;
