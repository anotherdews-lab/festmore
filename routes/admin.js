// routes/admin.js
const express = require('express');
const router  = express.Router();
const db      = require('../db');

function requireAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.redirect('/auth/login');
  }
  next();
}

router.get('/', requireAdmin, (req, res) => {
  const stats = {
    events:      db.prepare("SELECT COUNT(*) as n FROM events").get().n,
    active:      db.prepare("SELECT COUNT(*) as n FROM events WHERE status='active'").get().n,
    pending:     db.prepare("SELECT COUNT(*) as n FROM events WHERE status='pending'").get().n,
    vendors:     db.prepare("SELECT COUNT(*) as n FROM vendors").get().n,
    articles:    db.prepare("SELECT COUNT(*) as n FROM articles").get().n,
    subscribers: db.prepare("SELECT COUNT(*) as n FROM subscribers WHERE active=1").get().n,
    revenue:     db.prepare("SELECT SUM(amount) as n FROM payments WHERE status='completed'").get().n || 0,
  };
  const pending = db.prepare("SELECT * FROM events WHERE status='pending' ORDER BY created_at DESC LIMIT 20").all();
  res.send(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Admin — Festmore</title><link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet"/><link rel="stylesheet" href="/css/main.css"/></head><body>
  <nav class="main-nav"><div class="nav-inner"><a href="/" class="logo"><span class="logo-fest">Fest</span><span class="logo-more">more</span></a><div class="nav-right"><span style="color:var(--flame);font-weight:700;">⚙️ Admin</span><a href="/auth/logout" class="btn btn-ghost" style="margin-left:8px;">Logout</a></div></div></nav>
  <div class="container" style="padding:40px 0;">
    <h1 style="font-size:32px;margin-bottom:24px;">🎛️ Admin Dashboard</h1>
    <div class="dashboard-stat-grid" style="margin-bottom:32px;">
      <div class="dashboard-stat"><div class="dash-stat-n">${stats.events}</div><div class="dash-stat-l">Total Events</div></div>
      <div class="dashboard-stat"><div class="dash-stat-n" style="color:var(--sage);">${stats.active}</div><div class="dash-stat-l">Live Events</div></div>
      <div class="dashboard-stat"><div class="dash-stat-n" style="color:var(--gold);">${stats.pending}</div><div class="dash-stat-l">Pending Review</div></div>
      <div class="dashboard-stat"><div class="dash-stat-n">${stats.vendors}</div><div class="dash-stat-l">Vendors</div></div>
      <div class="dashboard-stat"><div class="dash-stat-n">${stats.articles}</div><div class="dash-stat-l">Articles</div></div>
      <div class="dashboard-stat"><div class="dash-stat-n">${stats.subscribers}</div><div class="dash-stat-l">Subscribers</div></div>
      <div class="dashboard-stat"><div class="dash-stat-n" style="color:var(--sage);">€${(stats.revenue/100).toFixed(2)}</div><div class="dash-stat-l">Total Revenue</div></div>
    </div>
    <div style="display:flex;gap:12px;margin-bottom:32px;flex-wrap:wrap;">
      <a href="/admin/run-automation" class="btn btn-primary" onclick="return confirm('Run AI automation now? This writes 10 new articles.')">🤖 Run AI Now</a>
      <a href="/admin/events" class="btn btn-outline">All Events</a>
      <a href="/admin/articles" class="btn btn-outline">All Articles</a>
      <a href="/admin/subscribers" class="btn btn-outline">Subscribers</a>
    </div>
    ${pending.length?`<div style="background:#fff;border:1px solid var(--border);border-radius:16px;padding:24px;">
      <h3 style="font-family:'Playfair Display',serif;font-size:20px;margin-bottom:16px;">⏳ Pending Events (${pending.length})</h3>
      ${pending.map(e=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid var(--border);">
        <div><div style="font-weight:700;">${e.title}</div><div style="font-size:12px;color:var(--ink3);">${e.city} · ${e.category} · Payment: ${e.payment_status}</div></div>
        <div style="display:flex;gap:8px;">
          <a href="/admin/approve/${e.id}" class="btn btn-primary" style="padding:5px 12px;font-size:12px;">✅ Approve</a>
          <a href="/admin/reject/${e.id}" class="btn btn-outline" style="padding:5px 12px;font-size:12px;">❌ Reject</a>
        </div>
      </div>`).join('')}
    </div>`:'<p style="color:var(--ink3);">No pending events 🎉</p>'}
  </div>
  <footer><div class="footer-bottom" style="border-top:1px solid rgba(255,255,255,0.08);"><span>© 2025 Festmore Admin</span></div></footer>
  </body></html>`);
});

router.get('/approve/:id', requireAdmin, (req, res) => {
  db.prepare("UPDATE events SET status='active' WHERE id=?").run(parseInt(req.params.id));
  res.redirect('/admin');
});

router.get('/reject/:id', requireAdmin, (req, res) => {
  db.prepare("UPDATE events SET status='rejected' WHERE id=?").run(parseInt(req.params.id));
  res.redirect('/admin');
});

router.get('/run-automation', requireAdmin, async (req, res) => {
  try {
    const daily = require('../automation/daily');
    daily.run(); // run async in background
    res.redirect('/admin?msg=Automation started! Check back in a few minutes.');
  } catch(err) {
    res.redirect('/admin?error=' + err.message);
  }
});

module.exports = router;
