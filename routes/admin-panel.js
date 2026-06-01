// routes/admin-panel.js
// Festmore Admin Panel — Artist, Vendor & Event Management
// Access: /admin-panel (admin only)
// Features:
//   - View all artists with one-click upgrade to Verified / Gold
//   - View all vendors with one-click upgrade
//   - View all events with one-click feature/verify
//   - Quick stats dashboard
//   - Search and filter

const express = require('express');
const router  = express.Router();
const { Client } = require('pg');

const PG_URL = process.env.DATABASE_URL ||
  'postgresql://postgres:VWgjvXynowzYucOsfqNNAPWojptOHaXJ@gondola.proxy.rlwy.net:47003/railway';

async function getDb() {
  const c = new Client({ connectionString: PG_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();
  return c;
}

// ─── AUTH MIDDLEWARE ──────────────────────────────────────────────────────────
function requireAdmin(req, res, next) {
  const user = req.session && req.session.user;
  if (!user || user.role !== 'admin') {
    return res.status(403).send(`
      <div style="font-family:sans-serif;text-align:center;padding:80px;background:#0d0d0d;min-height:100vh;color:#fff;">
        <h1 style="color:#e8470a;">Access Denied</h1>
        <p>Admin login required.</p>
        <a href="/auth/login" style="color:#e8470a;">Login →</a>
      </div>`);
  }
  next();
}

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
router.get('/', requireAdmin, async (req, res) => {
  const db = await getDb();
  const { tab = 'artists', q = '', status = '' } = req.query;

  try {
    // Stats
    const stats = {};
    stats.artists_total  = (await db.query(`SELECT COUNT(*) n FROM artists WHERE status='active'`)).rows[0].n;
    stats.artists_paid   = (await db.query(`SELECT COUNT(*) n FROM artists WHERE status='active' AND payment_status IN ('paid','gold')`)).rows[0].n;
    stats.artists_free   = (await db.query(`SELECT COUNT(*) n FROM artists WHERE status='active' AND payment_status='free'`)).rows[0].n;
    stats.vendors_total  = (await db.query(`SELECT COUNT(*) n FROM vendors WHERE status='active'`)).rows[0].n;
    stats.vendors_paid   = (await db.query(`SELECT COUNT(*) n FROM vendors WHERE status='active' AND payment_status IN ('paid','gold')`)).rows[0].n;
    stats.events_total   = (await db.query(`SELECT COUNT(*) n FROM events WHERE status='active'`)).rows[0].n;
    stats.events_featured= (await db.query(`SELECT COUNT(*) n FROM events WHERE status='active' AND featured=1`)).rows[0].n;

    // Data for current tab
    let rows = [];
    if (tab === 'artists') {
      let where = `WHERE status='active'`;
      const params = [];
      if (q) { where += ` AND (name ILIKE $1 OR city ILIKE $1 OR genre ILIKE $1 OR email ILIKE $1)`; params.push('%'+q+'%'); }
      if (status) { where += ` AND payment_status=$${params.length+1}`; params.push(status); }
      rows = (await db.query(`SELECT id,name,slug,genre,city,country,email,payment_status,verified,created_at,image_url FROM artists ${where} ORDER BY created_at DESC LIMIT 100`, params)).rows;
    } else if (tab === 'vendors') {
      let where = `WHERE status='active'`;
      const params = [];
      if (q) { where += ` AND (business_name ILIKE $1 OR city ILIKE $1 OR category ILIKE $1 OR email ILIKE $1)`; params.push('%'+q+'%'); }
      if (status) { where += ` AND payment_status=$${params.length+1}`; params.push(status); }
      rows = (await db.query(`SELECT id,business_name,category,city,country,email,payment_status,verified,created_at,image_url FROM vendors ${where} ORDER BY created_at DESC LIMIT 100`, params)).rows;
    } else if (tab === 'events') {
      let where = `WHERE status='active'`;
      const params = [];
      if (q) { where += ` AND (title ILIKE $1 OR city ILIKE $1 OR country ILIKE $1)`; params.push('%'+q+'%'); }
      if (status === 'featured') { where += ` AND featured=1`; }
      if (status === 'free') { where += ` AND payment_status='free'`; }
      rows = (await db.query(`SELECT id,title,slug,city,country,start_date,payment_status,featured,attendees,organiser_email FROM events ${where} ORDER BY created_at DESC LIMIT 100`, params)).rows;
    }

    await db.end();
    res.send(renderAdmin({ tab, q, status, stats, rows }));
  } catch(err) {
    await db.end();
    res.send(`<pre>Error: ${err.message}</pre>`);
  }
});

// ─── AJAX ACTIONS (one-click upgrades) ───────────────────────────────────────
router.post('/action', requireAdmin, async (req, res) => {
  const { type, id, action } = req.body;
  const db = await getDb();
  try {
    if (type === 'artist') {
      if (action === 'verify_free')   await db.query(`UPDATE artists SET verified=1, payment_status='free' WHERE id=$1`, [id]);
      if (action === 'verify_paid')   await db.query(`UPDATE artists SET verified=1, payment_status='paid' WHERE id=$1`, [id]);
      if (action === 'verify_gold')   await db.query(`UPDATE artists SET verified=1, payment_status='gold', featured=1 WHERE id=$1`, [id]);
      if (action === 'unverify')      await db.query(`UPDATE artists SET verified=0, payment_status='free' WHERE id=$1`, [id]);
      if (action === 'delete')        await db.query(`UPDATE artists SET status='deleted' WHERE id=$1`, [id]);
    }
    if (type === 'vendor') {
      if (action === 'verify_free')   await db.query(`UPDATE vendors SET verified=0, payment_status='free' WHERE id=$1`, [id]);
      if (action === 'verify_paid')   await db.query(`UPDATE vendors SET verified=1, payment_status='paid' WHERE id=$1`, [id]);
      if (action === 'verify_gold')   await db.query(`UPDATE vendors SET verified=1, payment_status='gold', featured=1 WHERE id=$1`, [id]);
      if (action === 'unverify')      await db.query(`UPDATE vendors SET verified=0, payment_status='free' WHERE id=$1`, [id]);
      if (action === 'delete')        await db.query(`UPDATE vendors SET status='deleted' WHERE id=$1`, [id]);
    }
    if (type === 'event') {
      if (action === 'feature')       await db.query(`UPDATE events SET featured=1, payment_status='featured' WHERE id=$1`, [id]);
      if (action === 'unfeature')     await db.query(`UPDATE events SET featured=0, payment_status='free' WHERE id=$1`, [id]);
      if (action === 'premium')       await db.query(`UPDATE events SET featured=1, payment_status='premium' WHERE id=$1`, [id]);
      if (action === 'delete')        await db.query(`UPDATE events SET status='deleted' WHERE id=$1`, [id]);
    }
    await db.end();
    res.json({ ok: true });
  } catch(err) {
    await db.end();
    res.json({ ok: false, error: err.message });
  }
});

// ─── RENDER ───────────────────────────────────────────────────────────────────
function renderAdmin({ tab, q, status, stats, rows }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Festmore Admin Panel</title>
<style>
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0d0d0d;color:#e8e2d9;min-height:100vh;}
a{color:inherit;text-decoration:none;}

/* NAV */
.admin-nav{background:#111;border-bottom:1px solid #222;padding:0 24px;height:56px;display:flex;align-items:center;justify-content:space-between;}
.admin-logo{font-size:18px;font-weight:700;color:#fff;}.admin-logo span{color:#e8470a;}
.admin-nav-right{display:flex;gap:12px;align-items:center;}
.admin-nav-link{color:rgba(255,255,255,.5);font-size:13px;padding:6px 12px;border-radius:6px;transition:all .2s;}
.admin-nav-link:hover{background:rgba(255,255,255,.08);color:#fff;}

/* STATS ROW */
.stats-row{display:grid;grid-template-columns:repeat(7,1fr);gap:12px;padding:20px 24px;background:#111;border-bottom:1px solid #1a1a1a;}
.stat-box{background:#1a1a1a;border:1px solid #222;border-radius:10px;padding:14px 16px;text-align:center;}
.stat-n{font-size:24px;font-weight:800;color:#fff;display:block;line-height:1;}
.stat-l{font-size:10px;color:rgba(255,255,255,.3);text-transform:uppercase;letter-spacing:1px;margin-top:4px;display:block;}
.stat-box.green .stat-n{color:#4a7c59;}
.stat-box.orange .stat-n{color:#e8470a;}
.stat-box.gold .stat-n{color:#f5a623;}

/* TABS */
.tab-bar{display:flex;gap:0;padding:0 24px;background:#111;border-bottom:1px solid #1a1a1a;}
.tab{padding:14px 20px;font-size:14px;font-weight:600;color:rgba(255,255,255,.4);border-bottom:2px solid transparent;cursor:pointer;transition:all .2s;}
.tab.active{color:#e8470a;border-bottom-color:#e8470a;}
.tab:hover{color:#fff;}

/* FILTERS */
.filters{padding:16px 24px;background:#111;display:flex;gap:10px;align-items:center;border-bottom:1px solid #1a1a1a;}
.filter-input{background:#1a1a1a;border:1px solid #333;color:#fff;padding:9px 14px;border-radius:8px;font-size:14px;outline:none;width:280px;}
.filter-input:focus{border-color:#e8470a;}
.filter-select{background:#1a1a1a;border:1px solid #333;color:#fff;padding:9px 14px;border-radius:8px;font-size:14px;outline:none;cursor:pointer;}
.filter-btn{background:#e8470a;color:#fff;border:none;padding:9px 18px;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;}
.filter-count{font-size:13px;color:rgba(255,255,255,.3);margin-left:auto;}

/* TABLE */
.table-wrap{padding:20px 24px;overflow-x:auto;}
table{width:100%;border-collapse:collapse;}
th{text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:rgba(255,255,255,.3);padding:10px 12px;border-bottom:1px solid #222;}
td{padding:12px;border-bottom:1px solid #1a1a1a;font-size:13px;vertical-align:middle;}
tr:hover td{background:rgba(255,255,255,.02);}

/* BADGES */
.badge{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:99px;font-size:11px;font-weight:700;}
.badge-free{background:rgba(255,255,255,.08);color:rgba(255,255,255,.4);}
.badge-paid{background:rgba(74,124,89,.2);color:#7ec99a;border:1px solid rgba(74,124,89,.3);}
.badge-gold{background:rgba(245,166,35,.15);color:#f5a623;border:1px solid rgba(245,166,35,.3);}
.badge-verified{background:rgba(74,124,89,.15);color:#4a7c59;}
.badge-featured{background:rgba(232,71,10,.15);color:#e8470a;border:1px solid rgba(232,71,10,.2);}

/* AVATAR */
.avatar{width:36px;height:36px;border-radius:8px;object-fit:cover;background:#222;}
.avatar-placeholder{width:36px;height:36px;border-radius:8px;background:#222;display:inline-flex;align-items:center;justify-content:center;font-size:16px;}

/* ACTION BUTTONS */
.actions{display:flex;gap:6px;flex-wrap:wrap;}
.btn-action{border:none;padding:5px 10px;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer;transition:all .2s;white-space:nowrap;}
.btn-verify{background:rgba(74,124,89,.2);color:#7ec99a;border:1px solid rgba(74,124,89,.3);}
.btn-verify:hover{background:#4a7c59;color:#fff;}
.btn-gold{background:rgba(245,166,35,.15);color:#f5a623;border:1px solid rgba(245,166,35,.3);}
.btn-gold:hover{background:#f5a623;color:#111;}
.btn-feature{background:rgba(232,71,10,.15);color:#e8470a;border:1px solid rgba(232,71,10,.2);}
.btn-feature:hover{background:#e8470a;color:#fff;}
.btn-danger{background:rgba(239,68,68,.1);color:#f87171;border:1px solid rgba(239,68,68,.2);}
.btn-danger:hover{background:#ef4444;color:#fff;}
.btn-neutral{background:rgba(255,255,255,.06);color:rgba(255,255,255,.4);border:1px solid rgba(255,255,255,.1);}
.btn-neutral:hover{background:rgba(255,255,255,.12);color:#fff;}

/* TOAST */
.toast{position:fixed;bottom:24px;right:24px;background:#1a1a1a;border:1px solid #333;border-radius:12px;padding:14px 20px;font-size:14px;color:#fff;z-index:999;display:none;box-shadow:0 8px 32px rgba(0,0,0,.5);}
.toast.show{display:block;}
.toast.success{border-color:#4a7c59;color:#7ec99a;}
.toast.error{border-color:#ef4444;color:#f87171;}

.empty{text-align:center;padding:60px;color:rgba(255,255,255,.2);font-size:14px;}
.row-name{font-weight:600;color:#fff;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.row-sub{font-size:11px;color:rgba(255,255,255,.35);margin-top:2px;}
</style>
</head>
<body>

<nav class="admin-nav">
  <div class="admin-logo"><span>Fest</span>more <span style="color:rgba(255,255,255,.3);font-weight:400;font-size:14px;margin-left:8px;">Admin Panel</span></div>
  <div class="admin-nav-right">
    <a href="/" class="admin-nav-link" target="_blank">← View Site</a>
    <a href="/artists" class="admin-nav-link" target="_blank">Artists Page</a>
    <a href="/vendors" class="admin-nav-link" target="_blank">Vendors Page</a>
    <a href="/auth/logout" class="admin-nav-link">Logout</a>
  </div>
</nav>

<!-- STATS -->
<div class="stats-row">
  <div class="stat-box"><span class="stat-n">${stats.events_total}</span><span class="stat-l">Total Events</span></div>
  <div class="stat-box orange"><span class="stat-n">${stats.events_featured}</span><span class="stat-l">Featured Events</span></div>
  <div class="stat-box"><span class="stat-n">${stats.artists_total}</span><span class="stat-l">Total Artists</span></div>
  <div class="stat-box green"><span class="stat-n">${stats.artists_paid}</span><span class="stat-l">Paid Artists</span></div>
  <div class="stat-box"><span class="stat-n">${stats.artists_free}</span><span class="stat-l">Free Artists</span></div>
  <div class="stat-box"><span class="stat-n">${stats.vendors_total}</span><span class="stat-l">Total Vendors</span></div>
  <div class="stat-box gold"><span class="stat-n">${stats.vendors_paid}</span><span class="stat-l">Paid Vendors</span></div>
</div>

<!-- TABS -->
<div class="tab-bar">
  <a href="/admin-panel?tab=artists" class="tab ${tab==='artists'?'active':''}">🎤 Artists (${stats.artists_total})</a>
  <a href="/admin-panel?tab=vendors" class="tab ${tab==='vendors'?'active':''}">🏪 Vendors (${stats.vendors_total})</a>
  <a href="/admin-panel?tab=events" class="tab ${tab==='events'?'active':''}">🎪 Events (${stats.events_total})</a>
</div>

<!-- FILTERS -->
<form class="filters" method="GET" action="/admin-panel">
  <input type="hidden" name="tab" value="${tab}"/>
  <input class="filter-input" type="text" name="q" placeholder="Search name, city, email, genre..." value="${q||''}"/>
  <select class="filter-select" name="status">
    <option value="">All Status</option>
    ${tab !== 'events' ? `
    <option value="free" ${status==='free'?'selected':''}>Free only</option>
    <option value="paid" ${status==='paid'?'selected':''}>Paid (Verified)</option>
    <option value="gold" ${status==='gold'?'selected':''}>Gold</option>` : `
    <option value="free" ${status==='free'?'selected':''}>Free listings</option>
    <option value="featured" ${status==='featured'?'selected':''}>Featured</option>`}
  </select>
  <button class="filter-btn" type="submit">Filter</button>
  ${q||status ? `<a href="/admin-panel?tab=${tab}" style="color:rgba(255,255,255,.4);font-size:13px;">Clear</a>` : ''}
  <span class="filter-count">${rows.length} results</span>
</form>

<!-- TABLE -->
<div class="table-wrap">
${rows.length === 0 ? `<div class="empty">No results found</div>` : ''}

${tab === 'artists' ? `
<table>
  <thead>
    <tr>
      <th style="width:36px;"></th>
      <th>Artist</th>
      <th>Genre / Type</th>
      <th>Location</th>
      <th>Email</th>
      <th>Status</th>
      <th>Joined</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    ${rows.map(r => `
    <tr id="artist-row-${r.id}">
      <td>${r.image_url ? `<img class="avatar" src="${r.image_url}" alt=""/>` : `<div class="avatar-placeholder">🎤</div>`}</td>
      <td>
        <div class="row-name">${r.name}</div>
        <div class="row-sub"><a href="/artists/${r.slug}" target="_blank" style="color:rgba(255,255,255,.3);">view profile →</a></div>
      </td>
      <td style="color:rgba(255,255,255,.5);font-size:12px;">${r.genre||'—'}</td>
      <td style="color:rgba(255,255,255,.5);font-size:12px;">${r.city||'—'}, ${r.country||'—'}</td>
      <td style="color:rgba(255,255,255,.4);font-size:12px;">${r.email||'—'}</td>
      <td>
        <span class="badge badge-${r.payment_status==='gold'?'gold':r.payment_status==='paid'?'paid':'free'}" id="badge-a-${r.id}">
          ${r.payment_status==='gold'?'🥇 Gold':r.payment_status==='paid'?'✅ Verified':'Free'}
        </span>
      </td>
      <td style="color:rgba(255,255,255,.3);font-size:11px;">${r.created_at?new Date(r.created_at).toLocaleDateString('en-GB'):'—'}</td>
      <td>
        <div class="actions">
          ${r.payment_status === 'free' ? `
          <button class="btn-action btn-verify" onclick="doAction('artist',${r.id},'verify_paid',this,'badge-a-${r.id}')">✅ Give Verified</button>
          <button class="btn-action btn-gold" onclick="doAction('artist',${r.id},'verify_gold',this,'badge-a-${r.id}')">🥇 Give Gold</button>
          ` : r.payment_status === 'paid' ? `
          <button class="btn-action btn-gold" onclick="doAction('artist',${r.id},'verify_gold',this,'badge-a-${r.id}')">🥇 Upgrade Gold</button>
          <button class="btn-action btn-neutral" onclick="doAction('artist',${r.id},'unverify',this,'badge-a-${r.id}')">Remove</button>
          ` : `
          <button class="btn-action btn-neutral" onclick="doAction('artist',${r.id},'unverify',this,'badge-a-${r.id}')">Downgrade</button>
          `}
          <button class="btn-action btn-danger" onclick="if(confirm('Delete ${r.name}?'))doAction('artist',${r.id},'delete',this,null)">✕</button>
        </div>
      </td>
    </tr>`).join('')}
  </tbody>
</table>` : ''}

${tab === 'vendors' ? `
<table>
  <thead>
    <tr>
      <th style="width:36px;"></th>
      <th>Vendor</th>
      <th>Category</th>
      <th>Location</th>
      <th>Email</th>
      <th>Status</th>
      <th>Joined</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    ${rows.map(r => `
    <tr id="vendor-row-${r.id}">
      <td>${r.image_url ? `<img class="avatar" src="${r.image_url}" alt=""/>` : `<div class="avatar-placeholder">🏪</div>`}</td>
      <td>
        <div class="row-name">${r.business_name}</div>
        <div class="row-sub"><a href="/vendors/profile/${r.id}" target="_blank" style="color:rgba(255,255,255,.3);">view profile →</a></div>
      </td>
      <td style="color:rgba(255,255,255,.5);font-size:12px;">${r.category||'—'}</td>
      <td style="color:rgba(255,255,255,.5);font-size:12px;">${r.city||'—'}, ${r.country||'—'}</td>
      <td style="color:rgba(255,255,255,.4);font-size:12px;">${r.email||'—'}</td>
      <td>
        <span class="badge badge-${r.payment_status==='gold'?'gold':r.payment_status==='paid'?'paid':'free'}" id="badge-v-${r.id}">
          ${r.payment_status==='gold'?'🥇 Gold':r.payment_status==='paid'?'✅ Verified':'Free'}
        </span>
      </td>
      <td style="color:rgba(255,255,255,.3);font-size:11px;">${r.created_at?new Date(r.created_at).toLocaleDateString('en-GB'):'—'}</td>
      <td>
        <div class="actions">
          ${r.payment_status === 'free' ? `
          <button class="btn-action btn-verify" onclick="doAction('vendor',${r.id},'verify_paid',this,'badge-v-${r.id}')">✅ Give Verified</button>
          <button class="btn-action btn-gold" onclick="doAction('vendor',${r.id},'verify_gold',this,'badge-v-${r.id}')">🥇 Give Gold</button>
          ` : r.payment_status === 'paid' ? `
          <button class="btn-action btn-gold" onclick="doAction('vendor',${r.id},'verify_gold',this,'badge-v-${r.id}')">🥇 Upgrade Gold</button>
          <button class="btn-action btn-neutral" onclick="doAction('vendor',${r.id},'unverify',this,'badge-v-${r.id}')">Remove</button>
          ` : `
          <button class="btn-action btn-neutral" onclick="doAction('vendor',${r.id},'unverify',this,'badge-v-${r.id}')">Downgrade</button>
          `}
          <button class="btn-action btn-danger" onclick="if(confirm('Delete?'))doAction('vendor',${r.id},'delete',this,null)">✕</button>
        </div>
      </td>
    </tr>`).join('')}
  </tbody>
</table>` : ''}

${tab === 'events' ? `
<table>
  <thead>
    <tr>
      <th>Event</th>
      <th>Location</th>
      <th>Date</th>
      <th>Attendees</th>
      <th>Status</th>
      <th>Organiser</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    ${rows.map(r => `
    <tr id="event-row-${r.id}">
      <td>
        <div class="row-name">${r.title}</div>
        <div class="row-sub"><a href="/events/${r.slug}" target="_blank" style="color:rgba(255,255,255,.3);">view event →</a></div>
      </td>
      <td style="color:rgba(255,255,255,.5);font-size:12px;">${r.city||'—'}, ${r.country||'—'}</td>
      <td style="color:rgba(255,255,255,.4);font-size:12px;">${r.start_date||'—'}</td>
      <td style="color:rgba(255,255,255,.4);font-size:12px;">${r.attendees?parseInt(r.attendees).toLocaleString():'—'}</td>
      <td>
        <span class="badge badge-${r.featured?'featured':r.payment_status==='free'?'free':'paid'}" id="badge-e-${r.id}">
          ${r.featured?'⭐ Featured':r.payment_status==='free'?'Free':'Paid'}
        </span>
      </td>
      <td style="color:rgba(255,255,255,.3);font-size:11px;">${r.organiser_email||'—'}</td>
      <td>
        <div class="actions">
          ${!r.featured ? `
          <button class="btn-action btn-feature" onclick="doAction('event',${r.id},'feature',this,'badge-e-${r.id}')">⭐ Feature</button>
          <button class="btn-action btn-gold" onclick="doAction('event',${r.id},'premium',this,'badge-e-${r.id}')">🥇 Premium</button>
          ` : `
          <button class="btn-action btn-neutral" onclick="doAction('event',${r.id},'unfeature',this,'badge-e-${r.id}')">Unfeature</button>
          `}
          <button class="btn-action btn-danger" onclick="if(confirm('Delete event?'))doAction('event',${r.id},'delete',this,null)">✕</button>
        </div>
      </td>
    </tr>`).join('')}
  </tbody>
</table>` : ''}

</div>

<!-- TOAST -->
<div class="toast" id="toast"></div>

<script>
function showToast(msg, type) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show ' + (type||'success');
  setTimeout(() => t.className = 'toast', 3000);
}

function doAction(type, id, action, btn, badgeId) {
  btn.disabled = true;
  btn.textContent = '...';
  fetch('/admin-panel/action', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ type, id, action })
  })
  .then(r => r.json())
  .then(data => {
    if (data.ok) {
      // Update badge
      if (badgeId) {
        const badge = document.getElementById(badgeId);
        if (badge) {
          if (action === 'verify_gold' || action === 'premium') {
            badge.className = 'badge badge-gold';
            badge.textContent = action === 'premium' ? '🥇 Premium' : '🥇 Gold';
          } else if (action === 'verify_paid' || action === 'feature') {
            badge.className = 'badge badge-' + (action === 'feature' ? 'featured' : 'paid');
            badge.textContent = action === 'feature' ? '⭐ Featured' : '✅ Verified';
          } else if (action === 'unverify' || action === 'unfeature') {
            badge.className = 'badge badge-free';
            badge.textContent = 'Free';
          }
        }
      }
      // Remove row if deleted
      if (action === 'delete') {
        const row = document.getElementById(type + '-row-' + id);
        if (row) { row.style.opacity = '0.3'; row.style.pointerEvents = 'none'; }
      }
      showToast('✅ Done!', 'success');
      // Re-enable button with new label
      btn.disabled = false;
      if (action.includes('gold') || action === 'premium') btn.textContent = 'Downgrade';
      else if (action.includes('verify') || action === 'feature') btn.textContent = 'Upgrade Gold';
      else btn.textContent = 'Done';
    } else {
      showToast('❌ Error: ' + data.error, 'error');
      btn.disabled = false;
      btn.textContent = 'Retry';
    }
  })
  .catch(() => { showToast('❌ Network error', 'error'); btn.disabled = false; });
}
</script>
</body>
</html>`;
}

module.exports = router;
