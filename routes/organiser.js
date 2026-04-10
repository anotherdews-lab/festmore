// routes/organiser.js
// Organiser dashboard — manage their events and vendor applications
// GET /organiser/dashboard        — list their events
// GET /organiser/event/:id        — manage one event's applications

const express = require('express');
const router  = express.Router();
const db      = require('../db');

function requireLogin(req, res, next) {
  if (!req.session.user) return res.redirect('/auth/login?redirect=/organiser/dashboard');
  next();
}

const FLAGS = { BE:'🇧🇪',DK:'🇩🇰',FR:'🇫🇷',DE:'🇩🇪',NL:'🇳🇱',GB:'🇬🇧',US:'🇺🇸',SE:'🇸🇪',IT:'🇮🇹',ES:'🇪🇸',PL:'🇵🇱',NO:'🇳🇴',FI:'🇫🇮',IN:'🇮🇳',JP:'🇯🇵',TH:'🇹🇭',HU:'🇭🇺',AT:'🇦🇹',CH:'🇨🇭',AE:'🇦🇪',BE:'🇧🇪' };
const COUNTRY_NAMES = { BE:'Belgium',DK:'Denmark',FR:'France',DE:'Germany',NL:'Netherlands',GB:'United Kingdom',US:'USA',SE:'Sweden',IT:'Italy',ES:'Spain',PL:'Poland',NO:'Norway',FI:'Finland',IN:'India',JP:'Japan',TH:'Thailand',HU:'Hungary',AT:'Austria',CH:'Switzerland',AE:'UAE' };

// ─── ORGANISER DASHBOARD ─────────────────────────────────────────
router.get('/dashboard', requireLogin, (req, res) => {
  const user = req.session.user;

  // Get events by this organiser (by email)
  let events = [];
  try {
    events = db.prepare(`
      SELECT e.*,
        (SELECT COUNT(*) FROM applications a WHERE a.event_id = e.id) as app_count,
        (SELECT COUNT(*) FROM applications a WHERE a.event_id = e.id AND a.status = 'pending') as pending_count
      FROM events e
      WHERE e.organiser_email = ? OR e.email = ?
      ORDER BY e.created_at DESC
    `).all(user.email, user.email);
  } catch(e) {
    // Try without email column
    try {
      events = db.prepare(`
        SELECT e.*,
          (SELECT COUNT(*) FROM applications a WHERE a.event_id = e.id) as app_count,
          (SELECT COUNT(*) FROM applications a WHERE a.event_id = e.id AND a.status = 'pending') as pending_count
        FROM events e
        WHERE e.email = ?
        ORDER BY e.created_at DESC
      `).all(user.email);
    } catch(e2) { events = []; }
  }

  const totalApps = events.reduce((sum, e) => sum + (parseInt(e.app_count) || 0), 0);
  const totalPending = events.reduce((sum, e) => sum + (parseInt(e.pending_count) || 0), 0);

  res.send(`<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Organiser Dashboard — Festmore</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="/css/main.css"/>
<style>
.od-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:32px;}
.od-stat{background:#fff;border:1px solid var(--border);border-radius:16px;padding:20px;text-align:center;}
.od-stat-n{font-family:'DM Serif Display',serif;font-size:36px;color:var(--ink);line-height:1;display:block;}
.od-stat-l{font-size:12px;color:var(--ink4);font-weight:700;text-transform:uppercase;letter-spacing:.8px;margin-top:4px;display:block;}
.event-row{background:#fff;border:1px solid var(--border);border-radius:16px;padding:20px 24px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap;}
.event-row:hover{border-color:var(--flame);box-shadow:0 4px 16px rgba(0,0,0,.06);}
@media(max-width:700px){.od-grid{grid-template-columns:1fr 1fr;}}
</style>
</head><body style="background:var(--cream);">
<nav class="main-nav"><div class="nav-inner">
  <a href="/" class="logo"><span class="logo-fest">Fest</span><span class="logo-more">more</span><span class="logo-dot"></span></a>
  <div style="flex:1;"></div>
  <div class="nav-right">
    <a href="/events/submit" class="btn btn-primary btn-sm">+ Add Event</a>
    <a href="/auth/logout" class="btn btn-ghost btn-sm">Logout</a>
  </div>
</div></nav>

<div class="container" style="padding:40px 0;max-width:1000px;">
  <div style="margin-bottom:28px;">
    <h1 style="font-family:'DM Serif Display',serif;font-size:36px;font-weight:400;margin-bottom:6px;">Organiser Dashboard</h1>
    <p style="color:var(--ink3);font-size:15px;">Welcome back, <strong>${user.name || user.email}</strong> — manage your events and vendor applications.</p>
  </div>

  <div class="od-grid">
    <div class="od-stat"><span class="od-stat-n">${events.length}</span><span class="od-stat-l">Your Events</span></div>
    <div class="od-stat"><span class="od-stat-n">${totalApps}</span><span class="od-stat-l">Total Applications</span></div>
    <div class="od-stat"><span class="od-stat-n" style="color:${totalPending>0?'var(--flame)':'var(--ink)'};">${totalPending}</span><span class="od-stat-l">Pending Review</span></div>
    <div class="od-stat"><span class="od-stat-n">🌍</span><span class="od-stat-l">Worldwide Reach</span></div>
  </div>

  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
    <h2 style="font-family:'DM Serif Display',serif;font-size:22px;font-weight:400;">Your Events</h2>
    <a href="/events/submit" class="btn btn-primary btn-sm">+ List New Event</a>
  </div>

  ${events.length === 0 ? `
  <div style="background:#fff;border:1px solid var(--border);border-radius:20px;padding:64px;text-align:center;">
    <div style="font-size:48px;margin-bottom:16px;">🎪</div>
    <h2 style="font-family:'DM Serif Display',serif;font-size:24px;font-weight:400;margin-bottom:8px;">No events yet</h2>
    <p style="color:var(--ink3);margin-bottom:24px;">List your first event — it's free and takes 5 minutes.</p>
    <a href="/events/submit" class="btn btn-primary btn-lg">List Your Event Free →</a>
  </div>` : events.map(e => `
  <div class="event-row">
    <div style="flex:1;">
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:6px;">
        <span style="background:${e.status==='active'?'#dcfce7':'#fef9c3'};color:${e.status==='active'?'#15803d':'#a16207'};padding:2px 8px;border-radius:99px;font-size:11px;font-weight:700;">${e.status}</span>
        <span style="background:${e.featured?'rgba(232,71,10,.1)':'var(--ivory)'};color:${e.featured?'var(--flame)':'var(--ink3)'};padding:2px 8px;border-radius:99px;font-size:11px;font-weight:700;">${e.featured?'⭐ Featured':'Free Listing'}</span>
        ${parseInt(e.pending_count) > 0 ? `<span style="background:#fef3c7;color:#d97706;padding:2px 8px;border-radius:99px;font-size:11px;font-weight:700;">🔔 ${e.pending_count} new applications</span>` : ''}
      </div>
      <div style="font-family:'DM Serif Display',serif;font-size:18px;color:var(--ink);margin-bottom:4px;">${e.title}</div>
      <div style="font-size:13px;color:var(--ink3);">📍 ${e.city} · 📅 ${e.date_display || e.start_date} · 👥 ${parseInt(e.attendees||0).toLocaleString()} visitors · 🏪 ${parseInt(e.vendor_spots||0)} vendor spots</div>
    </div>
    <div style="display:flex;gap:8px;flex-shrink:0;flex-wrap:wrap;">
      <a href="/organiser/event/${e.id}" class="btn btn-primary btn-sm">
        Manage Applications ${parseInt(e.app_count)>0?`(${e.app_count})`:''}
      </a>
      <a href="/events/${e.slug}" class="btn btn-outline btn-sm">View</a>
      ${!e.featured ? `<a href="/events/pricing" class="btn btn-outline btn-sm" style="color:var(--flame);border-color:var(--flame);">⭐ Upgrade €79</a>` : ''}
    </div>
  </div>`).join('')}

  <div style="margin-top:32px;background:linear-gradient(135deg,#0a0a0a,#1a1612);border-radius:20px;padding:32px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:20px;">
    <div>
      <h3 style="font-family:'DM Serif Display',serif;font-size:22px;font-weight:400;color:#fff;margin-bottom:6px;">Get more vendor applications</h3>
      <p style="color:rgba(255,255,255,.5);font-size:14px;">Upgrade to Featured — homepage banner, top placement, newsletter inclusion.</p>
    </div>
    <a href="/events/pricing" class="btn btn-primary" style="white-space:nowrap;">Upgrade to Featured — €79/yr →</a>
  </div>
</div>
<footer><div class="footer-bottom"><span>© ${new Date().getFullYear()} Festmore.com</span></div></footer>
</body></html>`);
});

// ─── MANAGE EVENT APPLICATIONS ───────────────────────────────────
router.get('/event/:id', requireLogin, (req, res) => {
  const user = req.session.user;
  const eventId = parseInt(req.params.id);

  const event = db.prepare("SELECT * FROM events WHERE id=?").get(eventId);
  if (!event) return res.redirect('/organiser/dashboard');

  // Check ownership
  const isOwner = event.organiser_email === user.email ||
                  event.email === user.email ||
                  user.role === 'admin';
  if (!isOwner) return res.redirect('/organiser/dashboard');

  // Get applications with vendor info
  let applications = [];
  try {
    applications = db.prepare(`
      SELECT a.*, v.business_name, v.category, v.city, v.country,
             v.description, v.photos, v.verified, v.avg_rating, v.review_count,
             v.tags as vendor_tags
      FROM applications a
      LEFT JOIN vendors v ON a.vendor_id = v.id
      WHERE a.event_id = ?
      ORDER BY a.created_at DESC
    `).all(eventId);
  } catch(e) { applications = []; }

  const pending = applications.filter(a => a.status === 'pending');
  const accepted = applications.filter(a => a.status === 'accepted');
  const rejected = applications.filter(a => a.status === 'rejected');

  res.send(`<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Manage Applications — ${event.title} | Festmore</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="/css/main.css"/>
<style>
.app-card{background:#fff;border:1px solid var(--border);border-radius:16px;padding:20px 24px;margin-bottom:12px;transition:all .2s;}
.app-card:hover{box-shadow:0 4px 16px rgba(0,0,0,.08);}
.app-card.accepted{border-left:4px solid #4a7c59;}
.app-card.rejected{border-left:4px solid #dc2626;opacity:.7;}
.app-card.pending{border-left:4px solid #f59e0b;}
.tab{padding:10px 20px;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;border:none;font-family:inherit;transition:all .2s;}
.tab.active{background:var(--flame);color:#fff;}
.tab.inactive{background:#fff;color:var(--ink3);border:1px solid var(--border);}
</style>
</head><body style="background:var(--cream);">
<nav class="main-nav"><div class="nav-inner">
  <a href="/" class="logo"><span class="logo-fest">Fest</span><span class="logo-more">more</span><span class="logo-dot"></span></a>
  <div style="flex:1;"></div>
  <div class="nav-right">
    <a href="/organiser/dashboard" class="btn btn-outline btn-sm">← Dashboard</a>
    <a href="/auth/logout" class="btn btn-ghost btn-sm">Logout</a>
  </div>
</div></nav>

<div class="container" style="padding:40px 0;max-width:900px;">

  <!-- EVENT HEADER -->
  <div style="background:#fff;border:1px solid var(--border);border-radius:20px;padding:24px 28px;margin-bottom:28px;">
    <div style="display:flex;justify-content:space-between;align-items:start;flex-wrap:wrap;gap:16px;">
      <div>
        <h1 style="font-family:'DM Serif Display',serif;font-size:28px;font-weight:400;margin-bottom:6px;">${event.title}</h1>
        <div style="font-size:14px;color:var(--ink3);">📍 ${event.city} · 📅 ${event.date_display || event.start_date} · 🏪 ${event.vendor_spots || 0} vendor spots</div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <a href="/events/${event.slug}" class="btn btn-outline btn-sm">View Event</a>
        ${!event.featured ? `<a href="/events/pricing" class="btn btn-primary btn-sm">⭐ Get Featured</a>` : ''}
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:20px;">
      <div style="background:var(--ivory);border-radius:12px;padding:14px;text-align:center;">
        <div style="font-family:'DM Serif Display',serif;font-size:28px;color:var(--flame);">${applications.length}</div>
        <div style="font-size:12px;color:var(--ink4);font-weight:700;text-transform:uppercase;">Total Applications</div>
      </div>
      <div style="background:#fef3c7;border-radius:12px;padding:14px;text-align:center;">
        <div style="font-family:'DM Serif Display',serif;font-size:28px;color:#d97706;">${pending.length}</div>
        <div style="font-size:12px;color:#92400e;font-weight:700;text-transform:uppercase;">Pending Review</div>
      </div>
      <div style="background:#dcfce7;border-radius:12px;padding:14px;text-align:center;">
        <div style="font-family:'DM Serif Display',serif;font-size:28px;color:#15803d;">${accepted.length}</div>
        <div style="font-size:12px;color:#166534;font-weight:700;text-transform:uppercase;">Accepted</div>
      </div>
    </div>
  </div>

  <!-- TABS -->
  <div style="display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap;">
    <button class="tab active" onclick="showTab('pending', this)">🔔 Pending (${pending.length})</button>
    <button class="tab inactive" onclick="showTab('accepted', this)">✅ Accepted (${accepted.length})</button>
    <button class="tab inactive" onclick="showTab('rejected', this)">❌ Rejected (${rejected.length})</button>
    <button class="tab inactive" onclick="showTab('all', this)">📋 All (${applications.length})</button>
  </div>

  <!-- APPLICATIONS -->
  ${applications.length === 0 ? `
  <div style="background:#fff;border:1px solid var(--border);border-radius:20px;padding:64px;text-align:center;">
    <div style="font-size:48px;margin-bottom:16px;">📭</div>
    <h2 style="font-family:'DM Serif Display',serif;font-size:24px;font-weight:400;margin-bottom:8px;">No applications yet</h2>
    <p style="color:var(--ink3);margin-bottom:24px;">Upgrade to Featured to get more visibility and more vendor applications.</p>
    <a href="/events/pricing" class="btn btn-primary">Get Featured — €79/yr →</a>
  </div>` : `
  <div id="tab-pending">
    ${pending.length === 0 ? `<div style="background:#fff;border:1px solid var(--border);border-radius:16px;padding:32px;text-align:center;color:var(--ink3);">No pending applications</div>` :
    pending.map(a => applicationCard(a, eventId)).join('')}
  </div>
  <div id="tab-accepted" style="display:none;">
    ${accepted.length === 0 ? `<div style="background:#fff;border:1px solid var(--border);border-radius:16px;padding:32px;text-align:center;color:var(--ink3);">No accepted applications yet</div>` :
    accepted.map(a => applicationCard(a, eventId)).join('')}
  </div>
  <div id="tab-rejected" style="display:none;">
    ${rejected.length === 0 ? `<div style="background:#fff;border:1px solid var(--border);border-radius:16px;padding:32px;text-align:center;color:var(--ink3);">No rejected applications</div>` :
    rejected.map(a => applicationCard(a, eventId)).join('')}
  </div>
  <div id="tab-all" style="display:none;">
    ${applications.map(a => applicationCard(a, eventId)).join('')}
  </div>`}
</div>

<script>
function showTab(name, btn) {
  ['pending','accepted','rejected','all'].forEach(t => {
    const el = document.getElementById('tab-'+t);
    if (el) el.style.display = t === name ? 'block' : 'none';
  });
  document.querySelectorAll('.tab').forEach(b => {
    b.className = b === btn ? 'tab active' : 'tab inactive';
  });
}
</script>
<footer><div class="footer-bottom"><span>© ${new Date().getFullYear()} Festmore.com</span></div></footer>
</body></html>`);
});

// ─── ACCEPT/REJECT APPLICATION ───────────────────────────────────
router.post('/application/:id/accept', requireLogin, (req, res) => {
  const appId = parseInt(req.params.id);
  const app = db.prepare('SELECT * FROM applications WHERE id=?').get(appId);
  if (!app) return res.redirect('/organiser/dashboard');
  db.prepare("UPDATE applications SET status='accepted' WHERE id=?").run(appId);
  // Update vendor total_applications
  try { db.prepare("UPDATE vendors SET total_applications=COALESCE(total_applications,0)+1 WHERE id=?").run(app.vendor_id); } catch(e){}
  res.redirect('/organiser/event/' + app.event_id + '?success=Application accepted!');
});

router.post('/application/:id/reject', requireLogin, (req, res) => {
  const appId = parseInt(req.params.id);
  const app = db.prepare('SELECT * FROM applications WHERE id=?').get(appId);
  if (!app) return res.redirect('/organiser/dashboard');
  db.prepare("UPDATE applications SET status='rejected' WHERE id=?").run(appId);
  res.redirect('/organiser/event/' + app.event_id + '?success=Application rejected.');
});

// ─── APPLICATION CARD HTML ────────────────────────────────────────
function applicationCard(a, eventId) {
  let photos = [];
  try { photos = JSON.parse(a.photos || '[]'); } catch(e) {}
  let extra = {};
  try { extra = JSON.parse(a.vendor_tags || '{}'); } catch(e) {}

  const photo = photos[0] || '';
  const rating = parseFloat(a.avg_rating) || 0;
  const stars = rating > 0 ? '★'.repeat(Math.round(rating)) + '☆'.repeat(5-Math.round(rating)) : '';

  return `<div class="app-card ${a.status}">
  <div style="display:flex;gap:16px;align-items:start;flex-wrap:wrap;">
    ${photo ? `<img src="${photo}" style="width:64px;height:64px;border-radius:12px;object-fit:cover;flex-shrink:0;" alt="${a.business_name}"/>` :
    `<div style="width:64px;height:64px;border-radius:12px;background:var(--ivory);display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0;">🏪</div>`}
    <div style="flex:1;">
      <div style="display:flex;justify-content:space-between;align-items:start;flex-wrap:wrap;gap:8px;">
        <div>
          <div style="font-weight:700;font-size:16px;color:var(--ink);">${a.business_name || 'Unknown Vendor'}</div>
          <div style="font-size:13px;color:var(--ink3);">${a.category || ''} · ${a.city || ''}</div>
          ${stars ? `<div style="color:#e8470a;font-size:13px;margin-top:2px;">${stars} <span style="color:var(--ink3);font-size:12px;">(${a.review_count || 0} reviews)</span></div>` : ''}
        </div>
        <span style="background:${a.status==='accepted'?'#dcfce7':a.status==='rejected'?'#fee2e2':'#fef3c7'};color:${a.status==='accepted'?'#15803d':a.status==='rejected'?'#dc2626':'#d97706'};padding:3px 10px;border-radius:99px;font-size:11px;font-weight:700;">${a.status}</span>
      </div>
      ${a.message ? `<div style="background:var(--ivory);border-radius:10px;padding:10px 14px;margin-top:10px;font-size:13px;color:var(--ink2);line-height:1.6;font-style:italic;">"${a.message}"</div>` : ''}
      ${extra.price_range ? `<div style="margin-top:6px;font-size:12px;color:var(--ink3);">💰 ${extra.price_range}</div>` : ''}
      <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;">
        <a href="/vendors/profile/${a.vendor_id}" target="_blank" class="btn btn-outline btn-sm">View Profile</a>
        ${a.status === 'pending' ? `
        <form method="POST" action="/organiser/application/${a.id}/accept" style="display:inline;">
          <button class="btn btn-primary btn-sm" style="background:#4a7c59;">✅ Accept</button>
        </form>
        <form method="POST" action="/organiser/application/${a.id}/reject" style="display:inline;">
          <button class="btn btn-outline btn-sm" style="color:#dc2626;border-color:#dc2626;">❌ Decline</button>
        </form>` : ''}
      </div>
    </div>
  </div>
</div>`;
}

module.exports = router;