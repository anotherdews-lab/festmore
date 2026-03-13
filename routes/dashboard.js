// routes/dashboard.js — POLISHED VERSION with Vendor Dashboard
const express = require('express');
const router  = express.Router();
const db      = require('../db');

function requireLogin(req, res, next) {
  if (!req.session.user) return res.redirect('/auth/login?redirect=' + req.originalUrl);
  next();
}

// ─────────────────────────────────────
// MAIN DASHBOARD
// ─────────────────────────────────────
router.get('/', requireLogin, (req, res) => {
  const user       = req.session.user;
  const myEvents   = db.prepare("SELECT * FROM events WHERE user_id=? ORDER BY created_at DESC").all(user.id);
  const myVendors  = db.prepare("SELECT * FROM vendors WHERE user_id=? ORDER BY created_at DESC").all(user.id);
  const totalViews = myEvents.reduce((s, e) => s + (e.views || 0), 0);

  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Dashboard — Festmore</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="/css/main.css"/>
</head>
<body>

${renderDashNav(user)}

<div class="container" style="padding:44px 0 80px;">

  <!-- HEADER -->
  <div style="margin-bottom:36px;display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:16px;">
    <div>
      <h1 style="font-family:'DM Serif Display',serif;font-size:36px;font-weight:400;margin-bottom:6px;">Welcome back, ${user.name}! 👋</h1>
      <p style="color:var(--ink3);font-size:15px;">${user.role.charAt(0).toUpperCase() + user.role.slice(1)} account &nbsp;·&nbsp; ${user.email}</p>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;">
      <a href="/events/submit" class="btn btn-primary">+ List New Event</a>
      <a href="/vendors/register" class="btn btn-outline">+ Add Vendor Profile</a>
    </div>
  </div>

  <!-- STAT CARDS -->
  <div class="dashboard-stat-grid" style="margin-bottom:40px;">
    <div class="dashboard-stat">
      <div class="dash-stat-n">${myEvents.length}</div>
      <div class="dash-stat-l">My Events</div>
    </div>
    <div class="dashboard-stat">
      <div class="dash-stat-n" style="color:var(--sage);">${myEvents.filter(e => e.status === 'active').length}</div>
      <div class="dash-stat-l">Live Events</div>
    </div>
    <div class="dashboard-stat">
      <div class="dash-stat-n">${totalViews.toLocaleString()}</div>
      <div class="dash-stat-l">Total Views</div>
    </div>
    <div class="dashboard-stat">
      <div class="dash-stat-n" style="color:var(--flame);">${myVendors.length}</div>
      <div class="dash-stat-l">Vendor Profiles</div>
    </div>
  </div>

  <!-- MY EVENTS TABLE -->
  <div style="background:#fff;border:1px solid var(--border);border-radius:20px;padding:28px 32px;margin-bottom:28px;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:22px;">
      <h2 style="font-family:'DM Serif Display',serif;font-size:22px;font-weight:400;">My Events</h2>
      <a href="/events/submit" class="btn btn-primary btn-sm">+ New Event</a>
    </div>
    ${myEvents.length ? `
    <div style="overflow-x:auto;">
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="border-bottom:2px solid var(--border);">
            <th style="text-align:left;padding:10px 12px;font-size:11px;font-weight:700;color:var(--ink4);text-transform:uppercase;letter-spacing:.8px;">Event</th>
            <th style="text-align:left;padding:10px 12px;font-size:11px;font-weight:700;color:var(--ink4);text-transform:uppercase;letter-spacing:.8px;">Date</th>
            <th style="text-align:left;padding:10px 12px;font-size:11px;font-weight:700;color:var(--ink4);text-transform:uppercase;letter-spacing:.8px;">Views</th>
            <th style="text-align:left;padding:10px 12px;font-size:11px;font-weight:700;color:var(--ink4);text-transform:uppercase;letter-spacing:.8px;">Status</th>
            <th style="text-align:left;padding:10px 12px;font-size:11px;font-weight:700;color:var(--ink4);text-transform:uppercase;letter-spacing:.8px;">Payment</th>
            <th style="padding:10px 12px;"></th>
          </tr>
        </thead>
        <tbody>
          ${myEvents.map(e => `
          <tr style="border-bottom:1px solid var(--border);transition:background .15s;" onmouseover="this.style.background='var(--ivory)'" onmouseout="this.style.background=''">
            <td style="padding:14px 12px;">
              <div style="font-weight:600;font-size:14px;color:var(--ink);">${e.title}</div>
              <div style="font-size:12px;color:var(--ink3);margin-top:2px;">📍 ${e.city}</div>
            </td>
            <td style="padding:14px 12px;font-size:13px;color:var(--ink2);">${e.date_display || e.start_date}</td>
            <td style="padding:14px 12px;font-size:14px;font-weight:600;color:var(--ink);">👁 ${(e.views || 0).toLocaleString()}</td>
            <td style="padding:14px 12px;">
              <span style="padding:4px 12px;border-radius:99px;font-size:11px;font-weight:700;
                background:${e.status === 'active' ? '#dcfce7' : e.status === 'pending' ? '#fef9c3' : '#fee2e2'};
                color:${e.status === 'active' ? '#15803d' : e.status === 'pending' ? '#a16207' : '#dc2626'};">
                ${e.status === 'active' ? '✅ Live' : e.status === 'pending' ? '⏳ Pending' : '❌ ' + e.status}
              </span>
            </td>
            <td style="padding:14px 12px;">
              <span style="padding:4px 12px;border-radius:99px;font-size:11px;font-weight:700;
                background:${e.payment_status === 'paid' ? '#dcfce7' : '#fef9c3'};
                color:${e.payment_status === 'paid' ? '#15803d' : '#a16207'};">
                ${e.payment_status === 'paid' ? '💳 Paid' : '⚠️ Unpaid'}
              </span>
            </td>
            <td style="padding:14px 12px;">
              <div style="display:flex;gap:6px;">
                <a href="/events/${e.slug}" class="btn btn-outline btn-sm">View</a>
                ${e.payment_status !== 'paid' ? `<a href="/events/submit" class="btn btn-primary btn-sm">Pay</a>` : ''}
              </div>
            </td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>` : `
    <div style="text-align:center;padding:48px 0;">
      <div style="font-size:44px;margin-bottom:14px;">🎪</div>
      <p style="color:var(--ink3);margin-bottom:18px;font-size:15px;">You haven't listed any events yet</p>
      <a href="/events/submit" class="btn btn-primary btn-lg">List Your First Event →</a>
    </div>`}
  </div>

  <!-- MY VENDOR PROFILES -->
  <div style="background:#fff;border:1px solid var(--border);border-radius:20px;padding:28px 32px;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:22px;">
      <h2 style="font-family:'DM Serif Display',serif;font-size:22px;font-weight:400;">My Vendor Profiles</h2>
      <a href="/vendors/register" class="btn btn-primary btn-sm">+ New Profile</a>
    </div>
    ${myVendors.length ? `
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:18px;">
      ${myVendors.map(v => `
      <div style="border:1px solid var(--border);border-radius:16px;padding:22px;transition:all .25s;" onmouseover="this.style.boxShadow='var(--shadow)'" onmouseout="this.style.boxShadow=''">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;">
          <div>
            <div style="font-size:10px;font-weight:700;color:var(--ink4);text-transform:uppercase;letter-spacing:.8px;margin-bottom:4px;">${v.category}</div>
            <div style="font-family:'DM Serif Display',serif;font-size:18px;font-weight:400;">${v.business_name}</div>
          </div>
          ${v.verified ? '<span style="background:#dcfce7;color:#15803d;padding:3px 10px;border-radius:99px;font-size:10px;font-weight:700;">✓ Verified</span>' : '<span style="background:#fef9c3;color:#a16207;padding:3px 10px;border-radius:99px;font-size:10px;font-weight:700;">⏳ Pending</span>'}
        </div>
        <div style="font-size:13px;color:var(--ink3);margin-bottom:8px;">📍 ${v.city}${v.country ? ', ' + v.country : ''}</div>
        <div style="font-size:13px;color:var(--ink3);margin-bottom:14px;">🎪 ${v.events_attended || 0} events attended</div>
        ${v.description ? `<p style="font-size:12.5px;color:var(--ink3);line-height:1.55;margin-bottom:14px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${v.description}</p>` : ''}
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <a href="/vendors" class="btn btn-outline btn-sm">View Profile</a>
          <a href="/dashboard/vendor/${v.id}" class="btn btn-ghost btn-sm">Edit</a>
          ${v.payment_status !== 'paid' ? `<a href="/vendors/register" class="btn btn-primary btn-sm">Pay Now</a>` : ''}
        </div>
      </div>`).join('')}
    </div>` : `
    <div style="text-align:center;padding:48px 0;">
      <div style="font-size:44px;margin-bottom:14px;">🏪</div>
      <p style="color:var(--ink3);margin-bottom:18px;font-size:15px;">No vendor profiles yet</p>
      <a href="/vendors/register" class="btn btn-primary btn-lg">Create Vendor Profile — €49/yr →</a>
    </div>`}
  </div>

</div>

${renderFooterSimple()}
</body>
</html>`);
});

// ─────────────────────────────────────
// VENDOR EDIT PAGE
// ─────────────────────────────────────
router.get('/vendor/:id', requireLogin, (req, res) => {
  const vendor = db.prepare("SELECT * FROM vendors WHERE id=? AND user_id=?").get(parseInt(req.params.id), req.session.user.id);
  if (!vendor) return res.redirect('/dashboard?error=Vendor not found');

  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Edit Vendor Profile — Festmore</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="/css/main.css"/>
</head>
<body>
${renderDashNav(req.session.user)}
<div class="container" style="padding:44px 0;max-width:780px;">
  <div style="margin-bottom:28px;">
    <a href="/dashboard" style="color:var(--ink3);font-size:14px;">← Back to Dashboard</a>
  </div>
  ${req.query.success ? `<div class="alert alert-success">✅ ${req.query.success}</div>` : ''}
  ${req.query.error ? `<div class="alert alert-error">⚠️ ${req.query.error}</div>` : ''}

  <div class="form-card">
    <div class="form-card-header">
      <h2>Edit Vendor Profile</h2>
      ${vendor.verified ? '<span style="background:#dcfce7;color:#15803d;padding:5px 14px;border-radius:99px;font-size:12px;font-weight:700;">✓ Verified</span>' : ''}
    </div>
    <form method="POST" action="/dashboard/vendor/${vendor.id}">
      <div class="form-grid">
        <div class="form-group full">
          <label class="form-label">Business Name *</label>
          <input class="form-input" type="text" name="business_name" required value="${vendor.business_name}"/>
        </div>
        <div class="form-group">
          <label class="form-label">Category *</label>
          <select class="form-input" name="category" required>
            ${['Food & Drinks','Artisan Crafts','Technology','Event Decor','Entertainment','Photography','Kids Activities','Fashion & Apparel','Art & Prints','Live Music','Retail','Services'].map(c => `<option value="${c}" ${vendor.category === c ? 'selected' : ''}>${c}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Country</label>
          <select class="form-input" name="country">
            ${Object.entries({BE:'Belgium',CN:'China',DK:'Denmark',FR:'France',DE:'Germany',NL:'Netherlands',PL:'Poland',SE:'Sweden',AE:'UAE',GB:'United Kingdom',US:'USA'}).map(([k,v]) => `<option value="${k}" ${vendor.country === k ? 'selected' : ''}>${v}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">City</label>
          <input class="form-input" type="text" name="city" value="${vendor.city}"/>
        </div>
        <div class="form-group">
          <label class="form-label">Email</label>
          <input class="form-input" type="email" name="email" value="${vendor.email}"/>
        </div>
        <div class="form-group">
          <label class="form-label">Website</label>
          <input class="form-input" type="url" name="website" value="${vendor.website || ''}" placeholder="https://"/>
        </div>
        <div class="form-group full">
          <label class="form-label">About Your Business</label>
          <textarea class="form-input" name="description" rows="5">${vendor.description || ''}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Events Attended</label>
          <input class="form-input" type="number" name="events_attended" value="${vendor.events_attended || 0}" min="0"/>
        </div>
      </div>
      <div style="display:flex;gap:12px;margin-top:28px;flex-wrap:wrap;">
        <button type="submit" class="btn btn-primary btn-lg" style="flex:1;max-width:240px;">Save Changes →</button>
        <a href="/dashboard" class="btn btn-outline btn-lg">Cancel</a>
      </div>
    </form>
  </div>

  <!-- SUBSCRIPTION STATUS -->
  <div style="background:#fff;border:1px solid var(--border);border-radius:20px;padding:28px 32px;margin-top:24px;">
    <h3 style="font-family:'DM Serif Display',serif;font-size:20px;font-weight:400;margin-bottom:18px;">Subscription</h3>
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;">
      <div>
        <div style="font-size:14px;font-weight:600;color:var(--ink);margin-bottom:4px;">
          ${vendor.payment_status === 'paid' ? '✅ Active — Annual Vendor Profile' : '⚠️ Payment Required'}
        </div>
        <div style="font-size:13px;color:var(--ink3);">
          ${vendor.payment_status === 'paid' ? 'Your profile is live and visible to event organisers.' : 'Your profile is not yet live. Complete payment to activate it.'}
        </div>
      </div>
      ${vendor.payment_status !== 'paid' ? `<a href="/vendors/register" class="btn btn-primary">Pay €49 to Activate →</a>` : `<span style="background:#dcfce7;color:#15803d;padding:8px 18px;border-radius:99px;font-size:13px;font-weight:700;">Active ✓</span>`}
    </div>
  </div>
</div>
${renderFooterSimple()}
</body>
</html>`);
});

// ─────────────────────────────────────
// VENDOR EDIT POST
// ─────────────────────────────────────
router.post('/vendor/:id', requireLogin, (req, res) => {
  const { business_name, category, city, country, email, description, website, events_attended } = req.body;
  const vendorId = parseInt(req.params.id);
  // Make sure this vendor belongs to this user
  const vendor = db.prepare("SELECT id FROM vendors WHERE id=? AND user_id=?").get(vendorId, req.session.user.id);
  if (!vendor) return res.redirect('/dashboard');
  db.prepare(`UPDATE vendors SET business_name=?,category=?,city=?,country=?,email=?,description=?,website=?,events_attended=? WHERE id=?`)
    .run(business_name, category, city, country, email || '', description || '', website || '', parseInt(events_attended) || 0, vendorId);
  res.redirect(`/dashboard/vendor/${vendorId}?success=Profile updated successfully!`);
});

module.exports = router;

// ─────────────────────────────────────
// HELPERS
// ─────────────────────────────────────
function renderDashNav(user) {
  return `<nav class="main-nav">
  <div class="nav-inner">
    <a href="/" class="logo">
      <span class="logo-fest">Fest</span><span class="logo-more">more</span><span class="logo-dot"></span>
    </a>
    <div style="flex:1;"></div>
    <div class="nav-right">
      <span style="font-size:13.5px;color:var(--ink3);font-weight:500;">${user.name}</span>
      <a href="/auth/logout" class="btn btn-ghost btn-sm">Logout</a>
    </div>
  </div>
  <div class="nav-cats-bar">
    <a href="/dashboard" class="nav-cat" style="color:var(--flame);border-bottom:2px solid var(--flame);">📊 Dashboard</a>
    <a href="/events/submit" class="nav-cat">+ List Event</a>
    <a href="/vendors/register" class="nav-cat">+ Vendor Profile</a>
    <a href="/events" class="nav-cat">🌍 Browse Events</a>
    <a href="/vendors" class="nav-cat">🏪 Vendors</a>
  </div>
</nav>`;
}

function renderFooterSimple() {
  return `<footer>
  <div class="footer-bottom">
    <span>© ${new Date().getFullYear()} Festmore.com — All rights reserved</span>
    <div style="display:flex;gap:20px;">
      <a href="/" style="color:rgba(255,255,255,.35);font-size:13px;">Home</a>
      <a href="/events" style="color:rgba(255,255,255,.35);font-size:13px;">Events</a>
      <a href="/vendors" style="color:rgba(255,255,255,.35);font-size:13px;">Vendors</a>
    </div>
  </div>
</footer>`;
}