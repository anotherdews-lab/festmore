// routes/dashboard.js — COMPLETE v3
// ✅ Admin tools panel with all features
// ✅ Newsletter, Social Posts, Reviews, Events, Vendors links
// ✅ Organiser dashboard link
// ✅ Vendor dashboard
// ✅ Event management

const express = require('express');
const router  = express.Router();
const db      = require('../db');

function requireLogin(req, res, next) {
  if (!req.session.user) return res.redirect('/auth/login?redirect=' + req.originalUrl);
  next();
}

const COUNTRY_NAMES = {
  BE:'Belgium',CN:'China',DK:'Denmark',FR:'France',DE:'Germany',
  NL:'Netherlands',PL:'Poland',SE:'Sweden',AE:'UAE',GB:'United Kingdom',US:'USA',
  NO:'Norway',FI:'Finland',AT:'Austria',CH:'Switzerland',IT:'Italy',
  ES:'Spain',PT:'Portugal',IE:'Ireland',CZ:'Czech Republic',HU:'Hungary',
  GR:'Greece',HR:'Croatia',IN:'India',TH:'Thailand',JP:'Japan',
};

router.get('/', requireLogin, (req, res) => {
  const user = req.session.user;
  const myEvents = db.prepare("SELECT * FROM events WHERE user_id=? ORDER BY created_at DESC").all(user.id);
  const myVendors = db.prepare("SELECT * FROM vendors WHERE email=? AND status='active' ORDER BY created_at DESC").all(user.email);
  try { db.prepare("UPDATE vendors SET user_id=? WHERE email=? AND (user_id IS NULL OR user_id=0)").run(user.id, user.email); } catch(e) {}
  const totalViews = myEvents.reduce((s, e) => s + (e.views || 0), 0);
  const isVendor = user.role === 'vendor' || myVendors.length > 0;
  const isAdmin = user.role === 'admin';
  let adminStats = { events:0, vendors:0, subscribers:0, articles:0, pending:0 };
  if (isAdmin) {
    try {
      adminStats = {
        events:      db.prepare("SELECT COUNT(*) as n FROM events WHERE status='active'").get().n,
        vendors:     db.prepare("SELECT COUNT(*) as n FROM vendors WHERE status='active'").get().n,
        subscribers: db.prepare("SELECT COUNT(*) as n FROM subscribers WHERE active=1").get().n,
        articles:    db.prepare("SELECT COUNT(*) as n FROM articles WHERE status='published'").get().n,
        pending:     db.prepare("SELECT COUNT(*) as n FROM applications WHERE status='pending'").get().n,
      };
    } catch(e) {}
  }

  const adminPanel = isAdmin ? `
  <div style="background:linear-gradient(135deg,#0a0a0a,#1a1612);border-radius:24px;padding:32px;margin-bottom:32px;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:12px;">
      <h2 style="font-family:'DM Serif Display',serif;font-size:24px;font-weight:400;color:#fff;margin:0;">⚙️ Admin Control Panel</h2>
      <a href="/admin" style="font-size:13px;color:rgba(255,255,255,.4);text-decoration:none;">Full Admin →</a>
    </div>
    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-bottom:20px;">
      <div style="background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:16px;text-align:center;">
        <div style="font-family:'DM Serif Display',serif;font-size:28px;color:#fff;">${adminStats.events}</div>
        <div style="font-size:11px;color:rgba(255,255,255,.4);text-transform:uppercase;font-weight:700;margin-top:2px;">Events</div>
      </div>
      <div style="background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:16px;text-align:center;">
        <div style="font-family:'DM Serif Display',serif;font-size:28px;color:#7ec99a;">${adminStats.vendors}</div>
        <div style="font-size:11px;color:rgba(255,255,255,.4);text-transform:uppercase;font-weight:700;margin-top:2px;">Vendors</div>
      </div>
      <div style="background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:16px;text-align:center;">
        <div style="font-family:'DM Serif Display',serif;font-size:28px;color:#ff7043;">${adminStats.subscribers}</div>
        <div style="font-size:11px;color:rgba(255,255,255,.4);text-transform:uppercase;font-weight:700;margin-top:2px;">Subscribers</div>
      </div>
      <div style="background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:16px;text-align:center;">
        <div style="font-family:'DM Serif Display',serif;font-size:28px;color:#c9922a;">${adminStats.articles}</div>
        <div style="font-size:11px;color:rgba(255,255,255,.4);text-transform:uppercase;font-weight:700;margin-top:2px;">Articles</div>
      </div>
      <div style="background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:16px;text-align:center;">
        <div style="font-family:'DM Serif Display',serif;font-size:28px;color:${adminStats.pending > 0 ? '#f59e0b' : '#fff'};">${adminStats.pending}</div>
        <div style="font-size:11px;color:rgba(255,255,255,.4);text-transform:uppercase;font-weight:700;margin-top:2px;">Pending Apps</div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;">
      <a href="/newsletter/admin" style="background:rgba(74,124,89,.15);border:1px solid rgba(74,124,89,.3);border-radius:14px;padding:20px;text-decoration:none;display:block;transition:all .2s;" onmouseover="this.style.background='rgba(74,124,89,.25)'" onmouseout="this.style.background='rgba(74,124,89,.15)'">
        <div style="font-size:28px;margin-bottom:10px;">📧</div>
        <div style="font-size:14px;font-weight:700;color:#7ec99a;margin-bottom:4px;">Newsletter</div>
        <div style="font-size:12px;color:rgba(255,255,255,.35);line-height:1.5;">Send to ${adminStats.subscribers} subscribers</div>
      </a>
      <a href="/admin/social-posts" style="background:rgba(124,74,138,.15);border:1px solid rgba(124,74,138,.3);border-radius:14px;padding:20px;text-decoration:none;display:block;transition:all .2s;" onmouseover="this.style.background='rgba(124,74,138,.25)'" onmouseout="this.style.background='rgba(124,74,138,.15)'">
        <div style="font-size:28px;margin-bottom:10px;">📱</div>
        <div style="font-size:14px;font-weight:700;color:#c084fc;margin-bottom:4px;">Social Posts</div>
        <div style="font-size:12px;color:rgba(255,255,255,.35);line-height:1.5;">Instagram &amp; Facebook</div>
      </a>
      <a href="/reviews/admin" style="background:rgba(201,146,42,.15);border:1px solid rgba(201,146,42,.3);border-radius:14px;padding:20px;text-decoration:none;display:block;transition:all .2s;" onmouseover="this.style.background='rgba(201,146,42,.25)'" onmouseout="this.style.background='rgba(201,146,42,.15)'">
        <div style="font-size:28px;margin-bottom:10px;">⭐</div>
        <div style="font-size:14px;font-weight:700;color:#fbbf24;margin-bottom:4px;">Reviews</div>
        <div style="font-size:12px;color:rgba(255,255,255,.35);line-height:1.5;">Manage vendor reviews</div>
      </a>
      <a href="/organiser/dashboard" style="background:rgba(232,71,10,.15);border:1px solid rgba(232,71,10,.3);border-radius:14px;padding:20px;text-decoration:none;display:block;transition:all .2s;" onmouseover="this.style.background='rgba(232,71,10,.25)'" onmouseout="this.style.background='rgba(232,71,10,.15)'">
        <div style="font-size:28px;margin-bottom:10px;">🎪</div>
        <div style="font-size:14px;font-weight:700;color:#ff7043;margin-bottom:4px;">Organiser</div>
        <div style="font-size:12px;color:rgba(255,255,255,.35);line-height:1.5;">Manage applications</div>
      </a>
      <a href="/admin/events" style="background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:20px;text-decoration:none;display:block;transition:all .2s;" onmouseover="this.style.background='rgba(255,255,255,.1)'" onmouseout="this.style.background='rgba(255,255,255,.05)'">
        <div style="font-size:28px;margin-bottom:10px;">📋</div>
        <div style="font-size:14px;font-weight:700;color:#fff;margin-bottom:4px;">All Events</div>
        <div style="font-size:12px;color:rgba(255,255,255,.35);line-height:1.5;">${adminStats.events} total events</div>
      </a>
      <a href="/admin/vendors" style="background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:20px;text-decoration:none;display:block;transition:all .2s;" onmouseover="this.style.background='rgba(255,255,255,.1)'" onmouseout="this.style.background='rgba(255,255,255,.05)'">
        <div style="font-size:28px;margin-bottom:10px;">🏪</div>
        <div style="font-size:14px;font-weight:700;color:#fff;margin-bottom:4px;">All Vendors</div>
        <div style="font-size:12px;color:rgba(255,255,255,.35);line-height:1.5;">${adminStats.vendors} total vendors</div>
      </a>
      <a href="/admin/subscribers" style="background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:20px;text-decoration:none;display:block;transition:all .2s;" onmouseover="this.style.background='rgba(255,255,255,.1)'" onmouseout="this.style.background='rgba(255,255,255,.05)'">
        <div style="font-size:28px;margin-bottom:10px;">👥</div>
        <div style="font-size:14px;font-weight:700;color:#fff;margin-bottom:4px;">Subscribers</div>
        <div style="font-size:12px;color:rgba(255,255,255,.35);line-height:1.5;">${adminStats.subscribers} subscribers</div>
      </a>
      <a href="/admin/articles" style="background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:20px;text-decoration:none;display:block;transition:all .2s;" onmouseover="this.style.background='rgba(255,255,255,.1)'" onmouseout="this.style.background='rgba(255,255,255,.05)'">
        <div style="font-size:28px;margin-bottom:10px;">📰</div>
        <div style="font-size:14px;font-weight:700;color:#fff;margin-bottom:4px;">Articles</div>
        <div style="font-size:12px;color:rgba(255,255,255,.35);line-height:1.5;">${adminStats.articles} articles</div>
      </a>
    </div>
  </div>` : '';

  const vendorSection = myVendors.length > 0 ? `
  <div style="background:#fff;border:1px solid var(--border);border-radius:20px;padding:28px 32px;margin-bottom:28px;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:22px;">
      <h2 style="font-family:'DM Serif Display',serif;font-size:22px;font-weight:400;">My Vendor Profile${myVendors.length!==1?'s':''}</h2>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:18px;">
      ${myVendors.map(v => {
        let photos = [];
        try { photos = JSON.parse(v.photos || '[]'); } catch(e) {}
        const img = photos.length > 0 ? photos[0] : v.image_url;
        return `<div style="border:2px solid ${v.verified?'#86efac':'var(--border)'};border-radius:16px;overflow:hidden;">
          ${img ? `<div style="height:160px;overflow:hidden;"><img src="${img}" alt="${v.business_name}" style="width:100%;height:100%;object-fit:cover;"/></div>` : '<div style="height:100px;background:var(--ivory);display:flex;align-items:center;justify-content:center;font-size:40px;">🏪</div>'}
          <div style="padding:18px;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
              <div>
                <div style="font-size:10px;font-weight:700;color:var(--ink4);text-transform:uppercase;letter-spacing:.8px;margin-bottom:4px;">${v.category}</div>
                <div style="font-family:'DM Serif Display',serif;font-size:18px;font-weight:400;">${v.business_name}</div>
              </div>
              ${v.verified ? '<span style="background:#dcfce7;color:#15803d;padding:3px 10px;border-radius:99px;font-size:10px;font-weight:700;">✅ Verified</span>' : '<span style="background:#fef9c3;color:#a16207;padding:3px 10px;border-radius:99px;font-size:10px;font-weight:700;">⏳ Pending</span>'}
            </div>
            <div style="font-size:13px;color:var(--ink3);margin-bottom:4px;">📍 ${v.city}, ${COUNTRY_NAMES[v.country]||v.country}</div>
            <div style="font-size:13px;color:var(--ink3);margin-bottom:4px;">📸 ${photos.length} photo${photos.length!==1?'s':''}</div>
            <div style="font-size:13px;color:var(--ink3);margin-bottom:14px;">👁️ ${v.views||0} profile views</div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              <a href="/vendors/profile/${v.id}" class="btn btn-outline btn-sm">View Profile</a>
              <a href="/vendors/dashboard/${v.id}" class="btn btn-primary btn-sm" style="background:#4a7c59;">✏️ Edit &amp; Photos</a>
            </div>
          </div>
        </div>`;
      }).join('')}
    </div>
  </div>` : (isVendor ? `
  <div style="background:#fff;border:2px dashed var(--border2);border-radius:20px;padding:48px;text-align:center;margin-bottom:28px;">
    <div style="font-size:48px;margin-bottom:16px;">🏪</div>
    <h2 style="font-family:'DM Serif Display',serif;font-size:24px;font-weight:400;margin-bottom:8px;">No vendor profile found</h2>
    <p style="color:var(--ink3);margin-bottom:24px;max-width:400px;margin-left:auto;margin-right:auto;">If you already paid, please contact us at <a href="mailto:contact@festmore.com" style="color:var(--flame);">contact@festmore.com</a></p>
    <a href="/vendors/register" class="btn btn-primary btn-lg">Create Vendor Profile — €49/yr →</a>
  </div>` : '');

  const eventsSection = (!isVendor || myEvents.length > 0) ? `
  <div style="background:#fff;border:1px solid var(--border);border-radius:20px;padding:28px 32px;margin-bottom:28px;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:22px;">
      <h2 style="font-family:'DM Serif Display',serif;font-size:22px;font-weight:400;">My Events</h2>
      <div style="display:flex;gap:8px;">
        <a href="/organiser/dashboard" class="btn btn-outline btn-sm">Manage Applications</a>
        <a href="/events/submit" class="btn btn-primary btn-sm">+ New Event</a>
      </div>
    </div>
    ${myEvents.length ? `
    <div style="overflow-x:auto;">
      <table style="width:100%;border-collapse:collapse;">
        <thead><tr style="border-bottom:2px solid var(--border);">
          <th style="text-align:left;padding:10px 12px;font-size:11px;font-weight:700;color:var(--ink4);text-transform:uppercase;">Event</th>
          <th style="text-align:left;padding:10px 12px;font-size:11px;font-weight:700;color:var(--ink4);text-transform:uppercase;">Date</th>
          <th style="text-align:left;padding:10px 12px;font-size:11px;font-weight:700;color:var(--ink4);text-transform:uppercase;">Views</th>
          <th style="text-align:left;padding:10px 12px;font-size:11px;font-weight:700;color:var(--ink4);text-transform:uppercase;">Status</th>
          <th style="padding:10px 12px;"></th>
        </tr></thead>
        <tbody>
          ${myEvents.map(e => `
          <tr style="border-bottom:1px solid var(--border);" onmouseover="this.style.background='var(--ivory)'" onmouseout="this.style.background=''">
            <td style="padding:14px 12px;"><div style="font-weight:600;font-size:14px;">${e.title}</div><div style="font-size:12px;color:var(--ink3);">📍 ${e.city}</div></td>
            <td style="padding:14px 12px;font-size:13px;color:var(--ink2);">${e.date_display||e.start_date||''}</td>
            <td style="padding:14px 12px;font-size:14px;font-weight:600;">👁 ${(e.views||0).toLocaleString()}</td>
            <td style="padding:14px 12px;">
              <span style="padding:4px 12px;border-radius:99px;font-size:11px;font-weight:700;background:${e.status==='active'?'#dcfce7':e.status==='pending'?'#fef9c3':'#fee2e2'};color:${e.status==='active'?'#15803d':e.status==='pending'?'#a16207':'#dc2626'};">
                ${e.status==='active'?'✅ Live':e.status==='pending'?'⏳ Pending':'❌ '+e.status}
              </span>
            </td>
            <td style="padding:14px 12px;"><div style="display:flex;gap:6px;"><a href="/events/${e.slug}" class="btn btn-outline btn-sm">View</a><a href="/dashboard/event/${e.id}" class="btn btn-primary btn-sm">Edit</a></div></td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>` : `
    <div style="text-align:center;padding:48px 0;">
      <div style="font-size:44px;margin-bottom:14px;">🎪</div>
      <p style="color:var(--ink3);margin-bottom:18px;">You haven't listed any events yet</p>
      <a href="/events/submit" class="btn btn-primary btn-lg">List Your First Event Free →</a>
    </div>`}
  </div>` : '';

  const vendorCTA = isVendor ? `
  <div style="background:linear-gradient(135deg,#0d1f15,#1a3d28);border-radius:20px;padding:40px;text-align:center;">
    <h2 style="font-family:'DM Serif Display',serif;font-size:26px;font-weight:400;color:#fff;margin-bottom:10px;">Looking for events to join?</h2>
    <p style="color:rgba(255,255,255,.55);font-size:15px;margin-bottom:24px;">Browse festivals and markets looking for vendors like you.</p>
    <a href="/events" class="btn btn-primary btn-lg" style="background:#4a7c59;">Browse Events →</a>
  </div>` : '';

  res.send(`<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Dashboard — Festmore</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="/css/main.css"/>
</head><body>
${renderDashNav(user)}
<div class="container" style="padding:44px 0 80px;">
  <div style="margin-bottom:36px;display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:16px;">
    <div>
      <h1 style="font-family:'DM Serif Display',serif;font-size:36px;font-weight:400;margin-bottom:6px;">Welcome back, ${user.name}! 👋</h1>
      <p style="color:var(--ink3);font-size:15px;">${user.role} account · ${user.email}</p>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;">
      <a href="/events/submit" class="btn btn-primary">+ List New Event</a>
      ${myVendors.length === 0 ? '<a href="/vendors/register" class="btn btn-outline">+ Add Vendor Profile</a>' : ''}
    </div>
  </div>
  <div class="dashboard-stat-grid" style="margin-bottom:40px;">
    ${isVendor ? `
    <div class="dashboard-stat"><div class="dash-stat-n" style="color:var(--flame);">${myVendors.length}</div><div class="dash-stat-l">Vendor Profiles</div></div>
    <div class="dashboard-stat"><div class="dash-stat-n" style="color:var(--sage);">${myVendors.filter(v=>v.verified).length}</div><div class="dash-stat-l">Verified</div></div>
    <div class="dashboard-stat"><div class="dash-stat-n">${myVendors.reduce((s,v)=>s+(v.views||0),0)}</div><div class="dash-stat-l">Profile Views</div></div>
    <div class="dashboard-stat"><div class="dash-stat-n">${myVendors.reduce((s,v)=>s+(v.events_attended||0),0)}</div><div class="dash-stat-l">Events Attended</div></div>
    ` : `
    <div class="dashboard-stat"><div class="dash-stat-n">${myEvents.length}</div><div class="dash-stat-l">My Events</div></div>
    <div class="dashboard-stat"><div class="dash-stat-n" style="color:var(--sage);">${myEvents.filter(e=>e.status==='active').length}</div><div class="dash-stat-l">Live Events</div></div>
    <div class="dashboard-stat"><div class="dash-stat-n">${totalViews.toLocaleString()}</div><div class="dash-stat-l">Total Views</div></div>
    <div class="dashboard-stat"><div class="dash-stat-n" style="color:var(--flame);">${myVendors.length}</div><div class="dash-stat-l">Vendor Profiles</div></div>
    `}
  </div>
  ${adminPanel}
  ${vendorSection}
  ${eventsSection}
  ${vendorCTA}
</div>
${renderFooterSimple()}
</body></html>`);
});

// ─────────────────────────────────────
// EVENT EDIT PAGE
// ─────────────────────────────────────
router.get('/event/:id', requireLogin, (req, res) => {
  const event = db.prepare("SELECT * FROM events WHERE id=? AND user_id=?").get(parseInt(req.params.id), req.session.user.id);
  if (!event) return res.redirect('/dashboard?error=Event not found');
  res.send(`<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Edit Event — ${event.title} | Festmore</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="/css/main.css"/>
</head><body>
${renderDashNav(req.session.user)}
<div class="container" style="padding:44px 0;max-width:860px;">
  <div style="margin-bottom:24px;"><a href="/dashboard" style="color:var(--ink3);font-size:14px;">← Dashboard</a></div>
  ${req.query.success ? `<div class="alert alert-success" style="margin-bottom:20px;">✅ ${req.query.success}</div>` : ''}
  ${req.query.error ? `<div class="alert alert-error" style="margin-bottom:20px;">⚠️ ${req.query.error}</div>` : ''}
  <div class="form-card">
    <div class="form-card-header">
      <h2>Edit Event: ${event.title}</h2>
      <span style="background:${event.status==='active'?'#dcfce7':'#fef9c3'};color:${event.status==='active'?'#15803d':'#a16207'};padding:4px 12px;border-radius:99px;font-size:12px;font-weight:700;">${event.status==='active'?'✅ Live':'⏳ Pending'}</span>
    </div>
    <form method="POST" action="/dashboard/event/${event.id}">
      <div class="form-grid">
        <div class="form-group full"><label class="form-label">Event Name *</label><input class="form-input" type="text" name="title" required value="${event.title}"/></div>
        <div class="form-group"><label class="form-label">City</label><input class="form-input" type="text" name="city" value="${event.city}"/></div>
        <div class="form-group"><label class="form-label">Date Display</label><input class="form-input" type="text" name="date_display" value="${event.date_display||''}"/></div>
        <div class="form-group"><label class="form-label">Entry Price</label><input class="form-input" type="text" name="price_display" value="${event.price_display||''}"/></div>
        <div class="form-group"><label class="form-label">Website</label><input class="form-input" type="url" name="website" value="${event.website||''}"/></div>
        <div class="form-group"><label class="form-label">Ticket URL</label><input class="form-input" type="url" name="ticket_url" value="${event.ticket_url||''}"/></div>
        <div class="form-group full"><label class="form-label">Description</label><textarea class="form-input" name="description" rows="5">${event.description||''}</textarea></div>
      </div>
      <div style="margin-top:20px;display:flex;gap:10px;">
        <button type="submit" class="btn btn-primary btn-lg">Save Changes →</button>
        <a href="/events/${event.slug}" target="_blank" class="btn btn-outline btn-lg">View Live →</a>
      </div>
    </form>
  </div>
</div>
${renderFooterSimple()}
</body></html>`);
});

router.post('/event/:id', requireLogin, (req, res) => {
  const { title, city, date_display, price_display, website, ticket_url, description } = req.body;
  const eventId = parseInt(req.params.id);
  const event = db.prepare("SELECT id FROM events WHERE id=? AND user_id=?").get(eventId, req.session.user.id);
  if (!event) return res.redirect('/dashboard');
  db.prepare("UPDATE events SET title=?,city=?,date_display=?,price_display=?,website=?,ticket_url=?,description=? WHERE id=?")
    .run(title, city, date_display||'', price_display||'Free', website||'', ticket_url||'', description||'', eventId);
  res.redirect('/dashboard/event/' + eventId + '?success=Event updated successfully!');
});

router.get('/vendor/:id', requireLogin, (req, res) => { res.redirect('/vendors/dashboard/' + req.params.id); });
router.post('/vendor/:id', requireLogin, (req, res) => { res.redirect('/vendors/dashboard/' + req.params.id); });

module.exports = router;

function renderDashNav(user) {
  const isAdmin = user.role === 'admin';
  return `<nav class="main-nav">
  <div class="nav-inner">
    <a href="/" class="logo"><span class="logo-fest">Fest</span><span class="logo-more">more</span><span class="logo-dot"></span></a>
    <div style="flex:1;"></div>
    <div class="nav-right">
      <span style="font-size:13.5px;color:var(--ink3);font-weight:500;">${user.name}</span>
      <a href="/auth/logout" class="btn btn-ghost btn-sm">Logout</a>
    </div>
  </div>
  <div class="nav-cats-bar">
    <a href="/dashboard" class="nav-cat" style="color:var(--flame);border-bottom:2px solid var(--flame);">📊 Dashboard</a>
    <a href="/organiser/dashboard" class="nav-cat">🎪 My Events</a>
    <a href="/events" class="nav-cat">🌍 Browse Events</a>
    <a href="/vendors" class="nav-cat">🏪 Vendors</a>
    ${isAdmin ? `
    <a href="/newsletter/admin" class="nav-cat" style="color:#4a7c59;font-weight:700;">📧 Newsletter</a>
    <a href="/admin/social-posts" class="nav-cat" style="color:#c084fc;font-weight:700;">📱 Social</a>
    <a href="/reviews/admin" class="nav-cat" style="color:#fbbf24;font-weight:700;">⭐ Reviews</a>
    <a href="/admin" class="nav-cat" style="font-weight:700;">⚙️ Admin</a>
    ` : ''}
  </div>
</nav>`;
}

function renderFooterSimple() {
  return `<footer><div class="footer-bottom">
  <span>© ${new Date().getFullYear()} Festmore.com — All rights reserved</span>
  <div style="display:flex;gap:20px;">
    <a href="/" style="color:rgba(255,255,255,.35);font-size:13px;">Home</a>
    <a href="/events" style="color:rgba(255,255,255,.35);font-size:13px;">Events</a>
    <a href="/vendors" style="color:rgba(255,255,255,.35);font-size:13px;">Vendors</a>
  </div>
</div></footer>`;
}
