// routes/admin.js — COMPLETE ADMIN PANEL
const express = require('express');
const router  = express.Router();
const db      = require('../db');

// ─────────────────────────────────────
// ADMIN MIDDLEWARE — protect all routes
// ─────────────────────────────────────
function requireAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.redirect('/auth/login?error=Admin access required');
  }
  next();
}

// ─────────────────────────────────────
// ADMIN DASHBOARD
// ─────────────────────────────────────
router.get('/', requireAdmin, (req, res) => {
  const stats = {
    events:      db.prepare("SELECT COUNT(*) as n FROM events WHERE status='active'").get().n,
    pending:     db.prepare("SELECT COUNT(*) as n FROM events WHERE status='pending'").get().n,
    vendors:     db.prepare("SELECT COUNT(*) as n FROM vendors WHERE status='active'").get().n,
    articles:    db.prepare("SELECT COUNT(*) as n FROM articles WHERE status='published'").get().n,
    subscribers: db.prepare("SELECT COUNT(*) as n FROM subscribers WHERE active=1").get().n,
    users:       db.prepare("SELECT COUNT(*) as n FROM users").get().n,
    revenue:     db.prepare("SELECT COUNT(*) as n FROM payments WHERE status='completed'").get().n,
    freeListings: db.prepare("SELECT COUNT(*) as n FROM events WHERE payment_status='free'").get().n,
  };

  const recentEvents  = db.prepare("SELECT * FROM events ORDER BY created_at DESC LIMIT 10").all();
  const recentVendors = db.prepare("SELECT * FROM vendors ORDER BY created_at DESC LIMIT 10").all();
  const recentPayments = db.prepare("SELECT * FROM payments ORDER BY created_at DESC LIMIT 10").all();
  const pendingEvents = db.prepare("SELECT * FROM events WHERE status='pending' ORDER BY created_at DESC").all();

  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Admin Panel — Festmore</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="/css/main.css"/>
<style>
  .admin-layout { display:grid; grid-template-columns:240px 1fr; min-height:100vh; }
  .admin-sidebar { background:var(--ink); padding:24px 0; position:fixed; width:240px; height:100vh; overflow-y:auto; }
  .admin-main { margin-left:240px; padding:32px; background:var(--cream); min-height:100vh; }
  .admin-logo { padding:0 20px 24px; border-bottom:1px solid rgba(255,255,255,.1); margin-bottom:16px; }
  .admin-nav-item { display:flex; align-items:center; gap:10px; padding:11px 20px; color:rgba(255,255,255,.65); font-size:13.5px; font-weight:500; transition:all .2s; cursor:pointer; text-decoration:none; }
  .admin-nav-item:hover, .admin-nav-item.active { background:rgba(255,255,255,.08); color:#fff; }
  .admin-nav-section { font-size:10px; font-weight:700; color:rgba(255,255,255,.3); letter-spacing:1.2px; text-transform:uppercase; padding:16px 20px 6px; }
  .stat-card { background:#fff; border:1px solid var(--border); border-radius:16px; padding:22px 24px; }
  .stat-n { font-family:'DM Serif Display',serif; font-size:36px; color:var(--ink); line-height:1; }
  .stat-l { font-size:12px; font-weight:600; color:var(--ink4); text-transform:uppercase; letter-spacing:.5px; margin-top:4px; }
  .admin-table { width:100%; border-collapse:collapse; background:#fff; border-radius:16px; overflow:hidden; border:1px solid var(--border); }
  .admin-table th { text-align:left; padding:12px 16px; font-size:11px; font-weight:700; color:var(--ink4); text-transform:uppercase; letter-spacing:.8px; border-bottom:2px solid var(--border); background:var(--ivory); }
  .admin-table td { padding:12px 16px; font-size:13.5px; border-bottom:1px solid var(--border); vertical-align:middle; }
  .admin-table tr:last-child td { border-bottom:none; }
  .admin-table tr:hover td { background:var(--ivory); }
  .badge-status-active { background:#dcfce7; color:#15803d; padding:3px 10px; border-radius:99px; font-size:11px; font-weight:700; }
  .badge-status-pending { background:#fef9c3; color:#a16207; padding:3px 10px; border-radius:99px; font-size:11px; font-weight:700; }
  .badge-status-free { background:#e0f2fe; color:#0369a1; padding:3px 10px; border-radius:99px; font-size:11px; font-weight:700; }
  .admin-card { background:#fff; border:1px solid var(--border); border-radius:16px; padding:24px; margin-bottom:24px; }
  .admin-card h3 { font-family:'DM Serif Display',serif; font-size:20px; font-weight:400; margin-bottom:18px; }
</style>
</head>
<body>

<!-- SIDEBAR -->
<div class="admin-sidebar">
  <div class="admin-logo">
    <div style="font-family:'DM Serif Display',serif;font-size:22px;color:#fff;font-style:italic;">
      <span style="color:var(--flame);">Fest</span>more
    </div>
    <div style="font-size:11px;color:rgba(255,255,255,.4);margin-top:2px;">Admin Panel</div>
  </div>

  <div class="admin-nav-section">Overview</div>
  <a href="/admin" class="admin-nav-item active">📊 Dashboard</a>

  <div class="admin-nav-section">Content</div>
  <a href="/admin/events" class="admin-nav-item">🎪 Events</a>
  <a href="/admin/events/pending" class="admin-nav-item">⏳ Pending Events ${pendingEvents.length > 0 ? `<span style="background:var(--flame);color:#fff;border-radius:99px;padding:1px 8px;font-size:10px;margin-left:auto;">${pendingEvents.length}</span>` : ''}</a>
  <a href="/admin/vendors" class="admin-nav-item">🏪 Vendors</a>
  <a href="/admin/articles" class="admin-nav-item">📰 Articles</a>

  <div class="admin-nav-section">Users</div>
  <a href="/admin/users" class="admin-nav-item">👥 Users</a>
  <a href="/admin/subscribers" class="admin-nav-item">📧 Subscribers</a>

  <div class="admin-nav-section">Business</div>
  <a href="/admin/payments" class="admin-nav-item">💳 Payments</a>
  <a href="/admin/applications" class="admin-nav-item">📋 Vendor Applications</a>

  <div class="admin-nav-section">Site</div>
  <a href="/" class="admin-nav-item" target="_blank">🌍 View Site</a>
  <a href="/auth/logout" class="admin-nav-item">🚪 Logout</a>
</div>

<!-- MAIN -->
<div class="admin-main">
  <div style="margin-bottom:32px;">
    <h1 style="font-family:'DM Serif Display',serif;font-size:32px;font-weight:400;margin-bottom:4px;">Dashboard</h1>
    <p style="color:var(--ink3);font-size:14px;">Welcome back, ${req.session.user.name}. Here's what's happening on Festmore.</p>
  </div>

  <!-- STATS -->
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:32px;">
    <div class="stat-card"><div class="stat-n" style="color:var(--flame);">${stats.events}</div><div class="stat-l">Live Events</div></div>
    <div class="stat-card"><div class="stat-n" style="color:var(--gold);">${stats.pending}</div><div class="stat-l">Pending Events</div></div>
    <div class="stat-card"><div class="stat-n" style="color:var(--sage);">${stats.vendors}</div><div class="stat-l">Active Vendors</div></div>
    <div class="stat-card"><div class="stat-n">${stats.revenue}</div><div class="stat-l">Payments Made</div></div>
    <div class="stat-card"><div class="stat-n">${stats.articles}</div><div class="stat-l">Articles</div></div>
    <div class="stat-card"><div class="stat-n">${stats.subscribers}</div><div class="stat-l">Subscribers</div></div>
    <div class="stat-card"><div class="stat-n">${stats.users}</div><div class="stat-l">Registered Users</div></div>
    <div class="stat-card"><div class="stat-n" style="color:#0369a1;">${stats.freeListings}</div><div class="stat-l">Free Listings</div></div>
  </div>

  <!-- PENDING EVENTS -->
  ${pendingEvents.length > 0 ? `
  <div class="admin-card">
    <h3>⏳ Pending Events — Need Action</h3>
    <table class="admin-table">
      <thead><tr><th>Event</th><th>City</th><th>Category</th><th>Payment</th><th>Actions</th></tr></thead>
      <tbody>
        ${pendingEvents.map(e => `
        <tr>
          <td><div style="font-weight:600;">${e.title}</div><div style="font-size:12px;color:var(--ink3);">${e.created_at?.substring(0,10)}</div></td>
          <td>${e.city}, ${e.country}</td>
          <td>${e.category}</td>
          <td><span class="${e.payment_status === 'paid' ? 'badge-status-active' : 'badge-status-pending'}">${e.payment_status}</span></td>
          <td style="display:flex;gap:6px;">
            <a href="/admin/events/${e.id}/approve" class="btn btn-primary btn-sm">Approve</a>
            <a href="/admin/events/${e.id}/reject" class="btn btn-ghost btn-sm">Reject</a>
          </td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>` : ''}

  <!-- RECENT EVENTS -->
  <div class="admin-card">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;">
      <h3 style="margin:0;">Recent Events</h3>
      <a href="/admin/events" class="btn btn-outline btn-sm">View All</a>
    </div>
    <table class="admin-table">
      <thead><tr><th>Title</th><th>City</th><th>Status</th><th>Payment</th><th>Views</th><th>Actions</th></tr></thead>
      <tbody>
        ${recentEvents.map(e => `
        <tr>
          <td><a href="/events/${e.slug}" target="_blank" style="font-weight:600;color:var(--flame);">${e.title}</a></td>
          <td>${e.city}, ${e.country}</td>
          <td><span class="${e.status === 'active' ? 'badge-status-active' : 'badge-status-pending'}">${e.status}</span></td>
          <td><span class="${e.payment_status === 'paid' ? 'badge-status-active' : e.payment_status === 'free' ? 'badge-status-free' : 'badge-status-pending'}">${e.payment_status}</span></td>
          <td>${e.views || 0}</td>
          <td><a href="/admin/events/${e.id}/edit" class="btn btn-outline btn-sm">Edit</a></td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>

  <!-- RECENT VENDORS -->
  <div class="admin-card">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;">
      <h3 style="margin:0;">Recent Vendors</h3>
      <a href="/admin/vendors" class="btn btn-outline btn-sm">View All</a>
    </div>
    <table class="admin-table">
      <thead><tr><th>Business</th><th>Category</th><th>City</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>
        ${recentVendors.map(v => `
        <tr>
          <td style="font-weight:600;">${v.business_name}</td>
          <td>${v.category}</td>
          <td>${v.city}, ${v.country}</td>
          <td><span class="${v.status === 'active' ? 'badge-status-active' : 'badge-status-pending'}">${v.status}</span></td>
          <td><a href="/admin/vendors/${v.id}/edit" class="btn btn-outline btn-sm">Edit</a></td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>

</div>
</body></html>`);
});

// ─────────────────────────────────────
// EVENTS LIST
// ─────────────────────────────────────
router.get('/events', requireAdmin, (req, res) => {
  const { status = 'ALL', search = '' } = req.query;
  let where = [];
  let params = [];
  if (status !== 'ALL') { where.push("status=?"); params.push(status); }
  if (search) { where.push("(title LIKE ? OR city LIKE ?)"); params.push(`%${search}%`, `%${search}%`); }
  const whereStr = where.length ? 'WHERE ' + where.join(' AND ') : '';
  const events = db.prepare(`SELECT * FROM events ${whereStr} ORDER BY created_at DESC LIMIT 100`).all(...params);

  res.send(adminPage('Events', `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
      <h1 style="font-family:'DM Serif Display',serif;font-size:28px;font-weight:400;">Events (${events.length})</h1>
      <a href="/events/submit" target="_blank" class="btn btn-primary btn-sm">+ Add Event</a>
    </div>
    <div style="display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap;">
      ${['ALL','active','pending','rejected'].map(s => `<a href="/admin/events?status=${s}" class="btn ${status===s?'btn-primary':'btn-outline'} btn-sm">${s}</a>`).join('')}
      <form method="GET" action="/admin/events" style="display:flex;gap:8px;margin-left:auto;">
        <input type="hidden" name="status" value="${status}"/>
        <input type="text" name="search" value="${search}" placeholder="Search events…" style="padding:8px 14px;border:1.5px solid var(--border2);border-radius:8px;font-size:13px;outline:none;"/>
        <button type="submit" class="btn btn-outline btn-sm">Search</button>
      </form>
    </div>
    <table class="admin-table">
      <thead><tr><th>Title</th><th>Country</th><th>Category</th><th>Status</th><th>Payment</th><th>Featured</th><th>Views</th><th>Actions</th></tr></thead>
      <tbody>
        ${events.map(e => `
        <tr>
          <td><a href="/events/${e.slug}" target="_blank" style="font-weight:600;color:var(--flame);font-size:13px;">${e.title}</a><div style="font-size:11px;color:var(--ink3);">${e.city}</div></td>
          <td>${e.country}</td>
          <td>${e.category}</td>
          <td><span class="${e.status==='active'?'badge-status-active':'badge-status-pending'}">${e.status}</span></td>
          <td><span class="${e.payment_status==='paid'?'badge-status-active':e.payment_status==='free'?'badge-status-free':'badge-status-pending'}">${e.payment_status}</span></td>
          <td>${e.featured ? '⭐' : '—'}</td>
          <td>${e.views||0}</td>
          <td style="display:flex;gap:4px;">
            <a href="/admin/events/${e.id}/approve" class="btn btn-primary btn-sm" style="padding:5px 10px;">✓</a>
            <a href="/admin/events/${e.id}/feature" class="btn btn-ghost btn-sm" style="padding:5px 10px;">⭐</a>
            <a href="/admin/events/${e.id}/delete" class="btn btn-sm" style="padding:5px 10px;background:#fee2e2;color:#dc2626;" onclick="return confirm('Delete this event?')">✕</a>
          </td>
        </tr>`).join('')}
      </tbody>
    </table>
  `, req.session.user));
});

// ─────────────────────────────────────
// APPROVE EVENT
// ─────────────────────────────────────
router.get('/events/:id/approve', requireAdmin, (req, res) => {
  db.prepare("UPDATE events SET status='active' WHERE id=?").run(parseInt(req.params.id));
  res.redirect('/admin/events?success=Event approved');
});

// ─────────────────────────────────────
// FEATURE/UNFEATURE EVENT
// ─────────────────────────────────────
router.get('/events/:id/feature', requireAdmin, (req, res) => {
  const event = db.prepare("SELECT featured FROM events WHERE id=?").get(parseInt(req.params.id));
  if (event) db.prepare("UPDATE events SET featured=? WHERE id=?").run(event.featured ? 0 : 1, parseInt(req.params.id));
  res.redirect('/admin/events');
});

// ─────────────────────────────────────
// REJECT EVENT
// ─────────────────────────────────────
router.get('/events/:id/reject', requireAdmin, (req, res) => {
  db.prepare("UPDATE events SET status='rejected' WHERE id=?").run(parseInt(req.params.id));
  res.redirect('/admin/events');
});

// ─────────────────────────────────────
// DELETE EVENT
// ─────────────────────────────────────
router.get('/events/:id/delete', requireAdmin, (req, res) => {
  db.prepare("DELETE FROM events WHERE id=?").run(parseInt(req.params.id));
  res.redirect('/admin/events');
});

// ─────────────────────────────────────
// VENDORS LIST
// ─────────────────────────────────────
router.get('/vendors', requireAdmin, (req, res) => {
  const vendors = db.prepare("SELECT * FROM vendors ORDER BY created_at DESC LIMIT 100").all();
  res.send(adminPage('Vendors', `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
      <h1 style="font-family:'DM Serif Display',serif;font-size:28px;font-weight:400;">Vendors (${vendors.length})</h1>
    </div>
    <table class="admin-table">
      <thead><tr><th>Business</th><th>Category</th><th>City</th><th>Status</th><th>Payment</th><th>Verified</th><th>Actions</th></tr></thead>
      <tbody>
        ${vendors.map(v => `
        <tr>
          <td style="font-weight:600;">${v.business_name}<div style="font-size:11px;color:var(--ink3);">${v.email||''}</div></td>
          <td>${v.category}</td>
          <td>${v.city}, ${v.country}</td>
          <td><span class="${v.status==='active'?'badge-status-active':'badge-status-pending'}">${v.status}</span></td>
          <td><span class="${v.payment_status==='paid'?'badge-status-active':'badge-status-pending'}">${v.payment_status}</span></td>
          <td>${v.verified ? '✅' : '—'}</td>
          <td style="display:flex;gap:4px;">
            <a href="/admin/vendors/${v.id}/approve" class="btn btn-primary btn-sm" style="padding:5px 10px;">✓ Verify</a>
            <a href="/admin/vendors/${v.id}/delete" class="btn btn-sm" style="padding:5px 10px;background:#fee2e2;color:#dc2626;" onclick="return confirm('Delete?')">✕</a>
          </td>
        </tr>`).join('')}
      </tbody>
    </table>
  `, req.session.user));
});

router.get('/vendors/:id/approve', requireAdmin, (req, res) => {
  db.prepare("UPDATE vendors SET status='active', verified=1 WHERE id=?").run(parseInt(req.params.id));
  res.redirect('/admin/vendors');
});

router.get('/vendors/:id/delete', requireAdmin, (req, res) => {
  db.prepare("DELETE FROM vendors WHERE id=?").run(parseInt(req.params.id));
  res.redirect('/admin/vendors');
});

// ─────────────────────────────────────
// ARTICLES LIST
// ─────────────────────────────────────
router.get('/articles', requireAdmin, (req, res) => {
  const articles = db.prepare("SELECT id,title,slug,category,status,created_at,views FROM articles ORDER BY created_at DESC LIMIT 100").all();
  res.send(adminPage('Articles', `
    <div style="margin-bottom:24px;"><h1 style="font-family:'DM Serif Display',serif;font-size:28px;font-weight:400;">Articles (${articles.length})</h1></div>
    <table class="admin-table">
      <thead><tr><th>Title</th><th>Category</th><th>Status</th><th>Views</th><th>Date</th><th>Actions</th></tr></thead>
      <tbody>
        ${articles.map(a => `
        <tr>
          <td><a href="/articles/${a.slug}" target="_blank" style="font-weight:600;color:var(--flame);font-size:13px;">${a.title}</a></td>
          <td>${a.category||'—'}</td>
          <td><span class="${a.status==='published'?'badge-status-active':'badge-status-pending'}">${a.status}</span></td>
          <td>${a.views||0}</td>
          <td style="font-size:12px;color:var(--ink3);">${a.created_at?.substring(0,10)}</td>
          <td>
            <a href="/admin/articles/${a.id}/delete" class="btn btn-sm" style="padding:5px 10px;background:#fee2e2;color:#dc2626;" onclick="return confirm('Delete?')">✕</a>
          </td>
        </tr>`).join('')}
      </tbody>
    </table>
  `, req.session.user));
});

router.get('/articles/:id/delete', requireAdmin, (req, res) => {
  db.prepare("DELETE FROM articles WHERE id=?").run(parseInt(req.params.id));
  res.redirect('/admin/articles');
});

// ─────────────────────────────────────
// USERS LIST
// ─────────────────────────────────────
router.get('/users', requireAdmin, (req, res) => {
  const users = db.prepare("SELECT id,name,email,role,created_at FROM users ORDER BY created_at DESC").all();
  res.send(adminPage('Users', `
    <div style="margin-bottom:24px;"><h1 style="font-family:'DM Serif Display',serif;font-size:28px;font-weight:400;">Users (${users.length})</h1></div>
    <table class="admin-table">
      <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Actions</th></tr></thead>
      <tbody>
        ${users.map(u => `
        <tr>
          <td style="font-weight:600;">${u.name}</td>
          <td style="color:var(--ink3);font-size:13px;">${u.email}</td>
          <td><span class="${u.role==='admin'?'badge-status-active':u.role==='vendor'?'badge-status-free':'badge-status-pending'}">${u.role}</span></td>
          <td style="font-size:12px;color:var(--ink3);">${u.created_at?.substring(0,10)}</td>
          <td>
            <a href="/admin/users/${u.id}/make-admin" class="btn btn-ghost btn-sm" onclick="return confirm('Make admin?')">Make Admin</a>
          </td>
        </tr>`).join('')}
      </tbody>
    </table>
  `, req.session.user));
});

router.get('/users/:id/make-admin', requireAdmin, (req, res) => {
  db.prepare("UPDATE users SET role='admin' WHERE id=?").run(parseInt(req.params.id));
  res.redirect('/admin/users');
});

// ─────────────────────────────────────
// SUBSCRIBERS
// ─────────────────────────────────────
router.get('/subscribers', requireAdmin, (req, res) => {
  const subs = db.prepare("SELECT * FROM subscribers ORDER BY created_at DESC LIMIT 200").all();
  const total = db.prepare("SELECT COUNT(*) as n FROM subscribers WHERE active=1").get().n;
  res.send(adminPage('Subscribers', `
    <div style="margin-bottom:24px;"><h1 style="font-family:'DM Serif Display',serif;font-size:28px;font-weight:400;">Subscribers (${total} active)</h1></div>
    <table class="admin-table">
      <thead><tr><th>Email</th><th>Name</th><th>Country</th><th>Active</th><th>Joined</th></tr></thead>
      <tbody>
        ${subs.map(s => `
        <tr>
          <td style="font-size:13px;">${s.email}</td>
          <td>${s.name||'—'}</td>
          <td>${s.country||'—'}</td>
          <td>${s.active ? '✅' : '❌'}</td>
          <td style="font-size:12px;color:var(--ink3);">${s.created_at?.substring(0,10)}</td>
        </tr>`).join('')}
      </tbody>
    </table>
  `, req.session.user));
});

// ─────────────────────────────────────
// PAYMENTS
// ─────────────────────────────────────
router.get('/payments', requireAdmin, (req, res) => {
  const payments = db.prepare("SELECT * FROM payments ORDER BY created_at DESC LIMIT 100").all();
  const total = db.prepare("SELECT SUM(amount) as t FROM payments WHERE status='completed'").get().t || 0;
  res.send(adminPage('Payments', `
    <div style="margin-bottom:24px;">
      <h1 style="font-family:'DM Serif Display',serif;font-size:28px;font-weight:400;">Payments</h1>
      <div style="margin-top:12px;background:var(--sage);color:#fff;display:inline-block;padding:10px 20px;border-radius:12px;font-size:15px;font-weight:700;">
        Total Revenue: €${(total/100).toFixed(2)}
      </div>
    </div>
    <table class="admin-table">
      <thead><tr><th>ID</th><th>Type</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
      <tbody>
        ${payments.map(p => `
        <tr>
          <td style="font-size:12px;color:var(--ink3);">${p.stripe_session_id?.substring(0,20)}…</td>
          <td>${p.type}</td>
          <td style="font-weight:700;">€${(p.amount/100).toFixed(2)}</td>
          <td><span class="${p.status==='completed'?'badge-status-active':'badge-status-pending'}">${p.status}</span></td>
          <td style="font-size:12px;color:var(--ink3);">${p.created_at?.substring(0,10)}</td>
        </tr>`).join('')}
      </tbody>
    </table>
  `, req.session.user));
});

// ─────────────────────────────────────
// VENDOR APPLICATIONS
// ─────────────────────────────────────
router.get('/applications', requireAdmin, (req, res) => {
  const apps = db.prepare(`
    SELECT va.*, v.business_name, v.category as vendor_category, v.city as vendor_city,
           e.title as event_title, e.city as event_city
    FROM vendor_applications va
    LEFT JOIN vendors v ON va.vendor_id = v.id
    LEFT JOIN events e ON va.event_id = e.id
    ORDER BY va.created_at DESC
  `).all();

  res.send(adminPage('Vendor Applications', `
    <div style="margin-bottom:24px;"><h1 style="font-family:'DM Serif Display',serif;font-size:28px;font-weight:400;">Vendor Applications (${apps.length})</h1></div>
    ${apps.length === 0 ? '<div class="empty-state"><p>No applications yet.</p></div>' : `
    <table class="admin-table">
      <thead><tr><th>Vendor</th><th>Event</th><th>Message</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
      <tbody>
        ${apps.map(a => `
        <tr>
          <td style="font-weight:600;">${a.business_name||'—'}<div style="font-size:11px;color:var(--ink3);">${a.vendor_city||''}</div></td>
          <td>${a.event_title||'—'}<div style="font-size:11px;color:var(--ink3);">${a.event_city||''}</div></td>
          <td style="font-size:12px;max-width:200px;">${(a.message||'').substring(0,80)}${(a.message||'').length>80?'…':''}</td>
          <td><span class="${a.status==='approved'?'badge-status-active':a.status==='rejected'?'':' badge-status-pending'}">${a.status}</span></td>
          <td style="font-size:12px;color:var(--ink3);">${a.created_at?.substring(0,10)}</td>
          <td style="display:flex;gap:4px;">
            <a href="/admin/applications/${a.id}/approve" class="btn btn-primary btn-sm" style="padding:5px 10px;">✓</a>
            <a href="/admin/applications/${a.id}/reject" class="btn btn-sm" style="padding:5px 10px;background:#fee2e2;color:#dc2626;">✕</a>
          </td>
        </tr>`).join('')}
      </tbody>
    </table>`}
  `, req.session.user));
});

router.get('/applications/:id/approve', requireAdmin, (req, res) => {
  try { db.prepare("UPDATE vendor_applications SET status='approved' WHERE id=?").run(parseInt(req.params.id)); } catch(e) {}
  res.redirect('/admin/applications');
});

router.get('/applications/:id/reject', requireAdmin, (req, res) => {
  try { db.prepare("UPDATE vendor_applications SET status='rejected' WHERE id=?").run(parseInt(req.params.id)); } catch(e) {}
  res.redirect('/admin/applications');
});

module.exports = router;

// ─────────────────────────────────────
// ADMIN PAGE WRAPPER
// ─────────────────────────────────────
function adminPage(title, content, user) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${title} — Festmore Admin</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="/css/main.css"/>
<style>
  .admin-sidebar { background:var(--ink); padding:24px 0; position:fixed; width:240px; height:100vh; overflow-y:auto; top:0; left:0; z-index:100; }
  .admin-main { margin-left:240px; padding:32px; background:var(--cream); min-height:100vh; }
  .admin-logo { padding:0 20px 24px; border-bottom:1px solid rgba(255,255,255,.1); margin-bottom:16px; }
  .admin-nav-item { display:flex; align-items:center; gap:10px; padding:11px 20px; color:rgba(255,255,255,.65); font-size:13.5px; font-weight:500; transition:all .2s; cursor:pointer; text-decoration:none; }
  .admin-nav-item:hover { background:rgba(255,255,255,.08); color:#fff; }
  .admin-nav-section { font-size:10px; font-weight:700; color:rgba(255,255,255,.3); letter-spacing:1.2px; text-transform:uppercase; padding:16px 20px 6px; }
  .admin-table { width:100%; border-collapse:collapse; background:#fff; border-radius:16px; overflow:hidden; border:1px solid var(--border); }
  .admin-table th { text-align:left; padding:12px 16px; font-size:11px; font-weight:700; color:var(--ink4); text-transform:uppercase; letter-spacing:.8px; border-bottom:2px solid var(--border); background:var(--ivory); }
  .admin-table td { padding:12px 16px; font-size:13.5px; border-bottom:1px solid var(--border); vertical-align:middle; }
  .admin-table tr:last-child td { border-bottom:none; }
  .admin-table tr:hover td { background:var(--ivory); }
  .badge-status-active { background:#dcfce7; color:#15803d; padding:3px 10px; border-radius:99px; font-size:11px; font-weight:700; }
  .badge-status-pending { background:#fef9c3; color:#a16207; padding:3px 10px; border-radius:99px; font-size:11px; font-weight:700; }
  .badge-status-free { background:#e0f2fe; color:#0369a1; padding:3px 10px; border-radius:99px; font-size:11px; font-weight:700; }
  .admin-card { background:#fff; border:1px solid var(--border); border-radius:16px; padding:24px; margin-bottom:24px; }
  .admin-card h3 { font-family:'DM Serif Display',serif; font-size:20px; font-weight:400; margin-bottom:18px; }
  .stat-card { background:#fff; border:1px solid var(--border); border-radius:16px; padding:22px 24px; }
  .stat-n { font-family:'DM Serif Display',serif; font-size:36px; color:var(--ink); line-height:1; }
  .stat-l { font-size:12px; font-weight:600; color:var(--ink4); text-transform:uppercase; letter-spacing:.5px; margin-top:4px; }
</style>
</head>
<body>
<div class="admin-sidebar">
  <div class="admin-logo">
    <div style="font-family:'DM Serif Display',serif;font-size:22px;color:#fff;font-style:italic;"><span style="color:var(--flame);">Fest</span>more</div>
    <div style="font-size:11px;color:rgba(255,255,255,.4);margin-top:2px;">Admin Panel</div>
  </div>
  <div class="admin-nav-section">Overview</div>
  <a href="/admin" class="admin-nav-item">📊 Dashboard</a>
  <div class="admin-nav-section">Content</div>
  <a href="/admin/events" class="admin-nav-item">🎪 Events</a>
  <a href="/admin/vendors" class="admin-nav-item">🏪 Vendors</a>
  <a href="/admin/articles" class="admin-nav-item">📰 Articles</a>
  <div class="admin-nav-section">Users</div>
  <a href="/admin/users" class="admin-nav-item">👥 Users</a>
  <a href="/admin/subscribers" class="admin-nav-item">📧 Subscribers</a>
  <div class="admin-nav-section">Business</div>
  <a href="/admin/payments" class="admin-nav-item">💳 Payments</a>
  <a href="/admin/applications" class="admin-nav-item">📋 Vendor Applications</a>
  <div class="admin-nav-section">Site</div>
  <a href="/" class="admin-nav-item" target="_blank">🌍 View Site</a>
  <a href="/auth/logout" class="admin-nav-item">🚪 Logout</a>
</div>
<div class="admin-main">${content}</div>
</body></html>`;
}