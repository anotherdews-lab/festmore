// routes/dashboard.js
const express = require('express');
const router  = express.Router();
const db      = require('../db');

function requireLogin(req, res, next) {
  if (!req.session.user) return res.redirect('/auth/login?redirect=' + req.originalUrl);
  next();
}

router.get('/', requireLogin, (req, res) => {
  const user = req.session.user;
  const myEvents  = db.prepare("SELECT * FROM events WHERE user_id=? ORDER BY created_at DESC").all(user.id);
  const myVendors = db.prepare("SELECT * FROM vendors WHERE user_id=? ORDER BY created_at DESC").all(user.id);
  const totalViews = myEvents.reduce((s,e)=>s+(e.views||0),0);
  res.send(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Dashboard — Festmore</title><link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet"/><link rel="stylesheet" href="/css/main.css"/></head><body>
  <nav class="main-nav"><div class="nav-inner"><a href="/" class="logo"><span class="logo-fest">Fest</span><span class="logo-more">more</span></a><div class="nav-right"><a href="/auth/logout" class="btn btn-ghost">Logout</a></div></div></nav>
  <div class="container" style="padding:40px 0;">
    <div style="margin-bottom:32px;"><h1 style="font-size:32px;font-weight:800;">Welcome back, ${user.name}! 👋</h1><p style="color:var(--ink3);">${user.role.charAt(0).toUpperCase()+user.role.slice(1)} account</p></div>
    <div class="dashboard-stat-grid">
      <div class="dashboard-stat"><div class="dash-stat-n">${myEvents.length}</div><div class="dash-stat-l">My Events</div></div>
      <div class="dashboard-stat"><div class="dash-stat-n">${myEvents.filter(e=>e.status==='active').length}</div><div class="dash-stat-l">Live Events</div></div>
      <div class="dashboard-stat"><div class="dash-stat-n">${totalViews.toLocaleString()}</div><div class="dash-stat-l">Total Views</div></div>
      <div class="dashboard-stat"><div class="dash-stat-n">${myVendors.length}</div><div class="dash-stat-l">Vendor Profiles</div></div>
    </div>
    <div style="display:flex;gap:12px;margin-bottom:32px;flex-wrap:wrap;">
      <a href="/events/submit" class="btn btn-primary">+ List New Event</a>
      <a href="/vendors/register" class="btn btn-outline">+ Add Vendor Profile</a>
    </div>
    ${myEvents.length?`<div style="background:#fff;border:1px solid var(--border);border-radius:16px;padding:24px;margin-bottom:24px;">
      <h3 style="font-family:'Playfair Display',serif;font-size:20px;margin-bottom:16px;">My Events</h3>
      ${myEvents.map(e=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid var(--border);">
        <div><div style="font-weight:700;">${e.title}</div><div style="font-size:12px;color:var(--ink3);">${e.city} · ${e.date_display||e.start_date} · ${e.views||0} views</div></div>
        <div style="display:flex;gap:8px;align-items:center;">
          <span style="padding:3px 10px;border-radius:99px;font-size:11px;font-weight:700;background:${e.status==='active'?'#dcfce7':'#fef9c3'};color:${e.status==='active'?'#15803d':'#a16207'}">${e.status}</span>
          <a href="/events/${e.slug}" class="btn btn-outline" style="padding:5px 12px;font-size:12px;">View</a>
        </div>
      </div>`).join('')}
    </div>`:'<div style="background:#fff;border:1px solid var(--border);border-radius:16px;padding:40px;text-align:center;"><p style="color:var(--ink3);margin-bottom:16px;">No events yet</p><a href="/events/submit" class="btn btn-primary">List Your First Event →</a></div>'}
  </div>
  <footer><div class="footer-bottom" style="border-top:1px solid rgba(255,255,255,0.08);"><span>© 2025 Festmore.com</span></div></footer>
  </body></html>`);
});

module.exports = router;
