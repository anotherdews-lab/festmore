// routes/applications.js — COMPLETE PROFESSIONAL v2
// ✅ Vendor apply to events
// ✅ Organiser manages applications (approve/reject/notes)
// ✅ Email notifications via Resend
// ✅ Application status tracking
// ✅ Withdraw application
// ✅ Admin overview with approve/reject buttons

const express = require('express');
const router  = express.Router();
const db      = require('../db');

function requireLogin(req, res, next) {
  if (!req.session.user) return res.redirect('/auth/login?redirect=' + req.originalUrl);
  next();
}
function requireAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/auth/login');
  next();
}

async function sendEmail(to, subject, html) {
  try {
    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({ from: 'Festmore <contact@festmore.com>', to, subject, html });
    console.log('✅ Email sent:', to);
  } catch(err) { console.error('❌ Email error:', err.message); }
}

function emailWrap(content) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head>
<body style="font-family:'Helvetica Neue',Arial,sans-serif;background:#f5f0e8;margin:0;padding:40px 20px;">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">
  <div style="background:#0a1a0f;padding:32px 40px;">
    <span style="font-size:22px;font-weight:800;"><span style="color:#fff;">Fest</span><span style="color:#e8470a;">more</span></span>
  </div>
  <div style="padding:40px;">${content}</div>
  <div style="background:#f1ede8;padding:20px 40px;text-align:center;font-size:12px;color:#9b8f88;">
    © ${new Date().getFullYear()} Festmore.com · <a href="https://festmore.com" style="color:#e8470a;">festmore.com</a>
  </div>
</div></body></html>`;
}

// ─────────────────────────────────────
// APPLY TO EVENT
// POST /applications/apply
// ─────────────────────────────────────
router.post('/apply', requireLogin, async (req, res) => {
  const { vendor_id, event_id, message } = req.body;
  const user = req.session.user;

  if (!vendor_id || !event_id) return res.json({ ok: false, msg: 'Missing vendor or event ID' });

  const vendor = db.prepare('SELECT * FROM vendors WHERE id=?').get(parseInt(vendor_id));
  const event  = db.prepare('SELECT * FROM events WHERE id=?').get(parseInt(event_id));

  if (!vendor || !event) return res.json({ ok: false, msg: 'Vendor or event not found' });
  if (vendor.email !== user.email && user.role !== 'admin') return res.json({ ok: false, msg: 'You can only apply with your own vendor profile' });
  if (vendor.payment_status !== 'paid' || vendor.status !== 'active') {
    return res.json({ ok: false, msg: 'You need an active paid vendor profile to apply. <a href="/vendors/register" style="color:#e8470a;font-weight:600;">Upgrade now →</a>' });
  }

  const existing = db.prepare('SELECT id FROM vendor_applications WHERE vendor_id=? AND event_id=?').get(parseInt(vendor_id), parseInt(event_id));
  if (existing) return res.json({ ok: false, msg: 'You have already applied to this event.' });

  try {
    db.prepare('INSERT INTO vendor_applications (vendor_id, event_id, message) VALUES (?,?,?)').run(parseInt(vendor_id), parseInt(event_id), message || '');
  } catch(err) {
    return res.json({ ok: false, msg: 'Failed to submit. Please try again.' });
  }

  try { db.prepare('UPDATE vendors SET total_applications = COALESCE(total_applications,0) + 1 WHERE id=?').run(parseInt(vendor_id)); } catch(e) {}

  // Email vendor
  if (vendor.email) {
    await sendEmail(vendor.email, `Application submitted — ${event.title}`, emailWrap(`
      <h2 style="font-family:Georgia,serif;font-size:22px;font-weight:400;color:#1a1612;margin:0 0 16px;">Application Submitted! 🎉</h2>
      <p style="font-size:15px;color:#6b5f58;line-height:1.7;">Hi <strong>${vendor.business_name}</strong>, your application to <strong>${event.title}</strong> has been submitted successfully.</p>
      <div style="background:#f5f0e8;border-radius:12px;padding:20px;margin:20px 0;font-size:14px;color:#1a1612;line-height:2;">
        <div><strong>Event:</strong> ${event.title}</div>
        <div><strong>Location:</strong> ${event.city}, ${event.country}</div>
        <div><strong>Date:</strong> ${event.date_display || event.start_date}</div>
        <div><strong>Status:</strong> ⏳ Pending review</div>
      </div>
      <p style="font-size:14px;color:#6b5f58;">The organiser will review your profile and get in touch. Applications are typically reviewed within 3–5 working days.</p>
      <a href="https://festmore.com/applications/my" style="display:inline-block;background:#e8470a;color:#fff;padding:14px 28px;border-radius:12px;font-size:14px;font-weight:700;text-decoration:none;margin-top:16px;">Track Your Applications →</a>
    `));
  }

  // Email admin
  await sendEmail('contact@festmore.com', `New application: ${vendor.business_name} → ${event.title}`, emailWrap(`
    <h2 style="font-family:Georgia,serif;font-size:22px;font-weight:400;color:#1a1612;margin:0 0 16px;">New Vendor Application</h2>
    <div style="background:#f5f0e8;border-radius:12px;padding:20px;margin:20px 0;font-size:14px;color:#1a1612;line-height:2;">
      <div><strong>Vendor:</strong> ${vendor.business_name} (${vendor.category})</div>
      <div><strong>Location:</strong> ${vendor.city}, ${vendor.country}</div>
      <div><strong>Email:</strong> ${vendor.email}</div>
      <div><strong>Event:</strong> ${event.title} — ${event.city}</div>
      <div><strong>Message:</strong> ${message || 'None'}</div>
    </div>
    <a href="https://festmore.com/applications/admin" style="display:inline-block;background:#e8470a;color:#fff;padding:14px 28px;border-radius:12px;font-size:14px;font-weight:700;text-decoration:none;">Review Application →</a>
  `));

  res.json({ ok: true, msg: '✅ Application submitted! The organiser will review your profile and be in touch soon.' });
});

// ─────────────────────────────────────
// MY APPLICATIONS PAGE
// GET /applications/my
// ─────────────────────────────────────
router.get('/my', requireLogin, (req, res) => {
  const user = req.session.user;
  const vendor = db.prepare('SELECT * FROM vendors WHERE email=?').get(user.email);
  if (!vendor) return res.redirect('/vendors/register');

  const apps = db.prepare(`
    SELECT va.*, e.title as event_title, e.city as event_city,
           e.country as event_country, e.date_display, e.slug as event_slug,
           e.image_url as event_image, e.category as event_category
    FROM vendor_applications va
    LEFT JOIN events e ON va.event_id = e.id
    WHERE va.vendor_id = ?
    ORDER BY va.created_at DESC
  `).all(vendor.id);

  const statusBadge = (s) => {
    const map = {
      pending:  ['#fef9c3','#a16207','⏳ Pending Review'],
      approved: ['#dcfce7','#15803d','✅ Approved'],
      rejected: ['#fee2e2','#dc2626','❌ Unsuccessful'],
    };
    const [bg, color, label] = map[s] || map.pending;
    return `<span style="background:${bg};color:${color};padding:4px 12px;border-radius:99px;font-size:12px;font-weight:700;">${label}</span>`;
  };

  res.send(`<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>My Applications — Festmore</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="/css/main.css"/>
</head><body style="background:var(--cream);">
<nav class="main-nav">
  <div class="nav-inner">
    <a href="/" class="logo"><span class="logo-fest">Fest</span><span class="logo-more">more</span><span class="logo-dot"></span></a>
    <div style="flex:1;"></div>
    <div class="nav-right"><span style="font-size:13px;color:var(--ink3);">${user.name}</span><a href="/auth/logout" class="btn btn-ghost btn-sm">Logout</a></div>
  </div>
  <div class="nav-cats-bar">
    <a href="/dashboard" class="nav-cat">📊 Dashboard</a>
    <a href="/applications/my" class="nav-cat" style="color:var(--flame);border-bottom:2px solid var(--flame);">📋 Applications</a>
    <a href="/messages" class="nav-cat">💬 Messages</a>
    <a href="/events" class="nav-cat">🌍 Browse Events</a>
  </div>
</nav>
<div class="container" style="padding:44px 0 80px;max-width:900px;">
  <div style="margin-bottom:32px;">
    <h1 style="font-family:'DM Serif Display',serif;font-size:32px;font-weight:400;margin-bottom:6px;">My Applications</h1>
    <p style="color:var(--ink3);">Track all your vendor applications to festivals and events worldwide.</p>
  </div>

  <!-- STATS -->
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:32px;">
    ${[
      ['Total', apps.length, '#e8470a'],
      ['⏳ Pending', apps.filter(a=>a.status==='pending').length, '#a16207'],
      ['✅ Approved', apps.filter(a=>a.status==='approved').length, '#15803d'],
    ].map(([l,n,c]) => `
    <div style="background:#fff;border:1px solid var(--border);border-radius:14px;padding:20px;text-align:center;">
      <div style="font-size:28px;font-weight:800;color:${c};">${n}</div>
      <div style="font-size:13px;color:var(--ink3);">${l}</div>
    </div>`).join('')}
  </div>

  ${apps.length === 0 ? `
  <div style="background:#fff;border:1px solid var(--border);border-radius:20px;padding:64px;text-align:center;">
    <div style="font-size:48px;margin-bottom:16px;">📋</div>
    <h2 style="font-family:'DM Serif Display',serif;font-size:24px;font-weight:400;margin-bottom:8px;">No applications yet</h2>
    <p style="color:var(--ink3);margin-bottom:24px;">Browse events and apply to festivals looking for vendors like you.</p>
    <a href="/events" class="btn btn-primary btn-lg">Browse Events →</a>
  </div>` : `
  <div style="display:flex;flex-direction:column;gap:16px;">
    ${apps.map(app => `
    <div style="background:#fff;border:1px solid ${app.status==='approved'?'#86efac':app.status==='rejected'?'#fca5a5':'var(--border)'};border-radius:16px;padding:24px;" id="app-${app.id}">
      <div style="display:grid;grid-template-columns:72px 1fr auto;gap:20px;align-items:start;">
        <div style="width:72px;height:72px;border-radius:12px;overflow:hidden;">
          <img src="${app.event_image || 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=200&q=80'}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div>
          <div style="font-family:'DM Serif Display',serif;font-size:17px;margin-bottom:4px;">${app.event_title}</div>
          <div style="font-size:13px;color:var(--ink3);margin-bottom:8px;">📍 ${app.event_city}, ${app.event_country} &nbsp;·&nbsp; 📅 ${app.date_display || ''}</div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
            ${statusBadge(app.status)}
            <span style="font-size:12px;color:var(--ink4);">Applied ${new Date(app.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</span>
          </div>
          ${app.organiser_notes ? `<div style="margin-top:10px;background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:10px 14px;font-size:13px;color:#15803d;"><strong>Message from organiser:</strong> ${app.organiser_notes}</div>` : ''}
          ${app.message ? `<div style="margin-top:8px;font-size:13px;color:var(--ink3);font-style:italic;">"${app.message}"</div>` : ''}
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          <a href="/events/${app.event_slug}" class="btn btn-outline btn-sm" style="text-align:center;white-space:nowrap;">View Event</a>
          ${app.status === 'pending' ? `<button onclick="withdrawApp(${app.id})" class="btn btn-ghost btn-sm" style="color:#dc2626;border-color:#fca5a5;white-space:nowrap;">Withdraw</button>` : ''}
        </div>
      </div>
    </div>`).join('')}
  </div>`}

  <div style="margin-top:40px;background:linear-gradient(135deg,#0d1f15,#1a3d28);border-radius:20px;padding:40px;text-align:center;">
    <h2 style="font-family:'DM Serif Display',serif;font-size:24px;font-weight:400;color:#fff;margin-bottom:10px;">Find More Events</h2>
    <p style="color:rgba(255,255,255,.55);margin-bottom:20px;">225+ festivals and markets looking for vendors like you.</p>
    <a href="/events" class="btn btn-primary btn-lg">Browse All Events →</a>
  </div>
</div>
<script>
async function withdrawApp(id) {
  if (!confirm('Withdraw this application?')) return;
  const r = await fetch('/applications/withdraw/' + id, {method:'POST',headers:{'Content-Type':'application/json'}});
  const d = await r.json();
  if (d.ok) location.reload();
  else alert(d.msg);
}
</script>
<footer><div class="footer-bottom"><span>© ${new Date().getFullYear()} Festmore.com</span></div></footer>
</body></html>`);
});

// ─────────────────────────────────────
// WITHDRAW APPLICATION
// ─────────────────────────────────────
router.post('/withdraw/:id', requireLogin, (req, res) => {
  const user = req.session.user;
  const app = db.prepare(`
    SELECT va.*, v.email as vendor_email FROM vendor_applications va
    LEFT JOIN vendors v ON va.vendor_id=v.id WHERE va.id=?
  `).get(parseInt(req.params.id));
  if (!app || (app.vendor_email !== user.email && user.role !== 'admin')) {
    return res.json({ ok: false, msg: 'Not authorized' });
  }
  db.prepare('DELETE FROM vendor_applications WHERE id=?').run(parseInt(req.params.id));
  res.json({ ok: true });
});

// ─────────────────────────────────────
// ADMIN — ALL APPLICATIONS
// GET /applications/admin
// ─────────────────────────────────────
router.get('/admin', requireAdmin, (req, res) => {
  const { status = 'all', search = '' } = req.query;
  let where = [], params = [];
  if (status !== 'all') { where.push('va.status=$' + (params.length+1)); params.push(status); }
  if (search) {
    where.push(`(v.business_name ILIKE $${params.length+1} OR e.title ILIKE $${params.length+2})`);
    params.push(`%${search}%`, `%${search}%`);
  }
  const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';

  const apps = db.prepare(`
    SELECT va.*, v.business_name, v.category as vendor_category,
           v.city as vendor_city, v.country as vendor_country,
           v.email as vendor_email, v.photos as vendor_photos, v.id as vendor_id_ref,
           e.title as event_title, e.city as event_city,
           e.date_display, e.slug as event_slug, e.image_url as event_image
    FROM vendor_applications va
    LEFT JOIN vendors v ON va.vendor_id = v.id
    LEFT JOIN events e ON va.event_id = e.id
    ${whereClause}
    ORDER BY va.created_at DESC LIMIT 200
  `).all(...params);

  const counts = db.prepare('SELECT status, COUNT(*) as n FROM vendor_applications GROUP BY status').all();
  const total = counts.reduce((s,c) => s + parseInt(c.n), 0);
  const pending = counts.find(c=>c.status==='pending')?.n || 0;
  const approved = counts.find(c=>c.status==='approved')?.n || 0;
  const rejected = counts.find(c=>c.status==='rejected')?.n || 0;

  res.send(`<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Applications — Admin | Festmore</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="/css/main.css"/>
</head><body style="background:var(--cream);">
<nav class="main-nav">
  <div class="nav-inner">
    <a href="/" class="logo"><span class="logo-fest">Fest</span><span class="logo-more">more</span><span class="logo-dot"></span></a>
    <div style="flex:1;"></div>
    <div class="nav-right"><a href="/admin" class="btn btn-outline btn-sm">← Admin Panel</a></div>
  </div>
</nav>
<div class="container" style="padding:40px 0 80px;">
  <div style="margin-bottom:32px;">
    <h1 style="font-family:'DM Serif Display',serif;font-size:32px;font-weight:400;margin:0 0 6px;">Vendor Applications</h1>
    <p style="color:var(--ink3);">Review and manage all vendor applications to events.</p>
  </div>

  <!-- STATS -->
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:28px;">
    ${[['Total',total,'#e8470a'],['⏳ Pending',pending,'#a16207'],['✅ Approved',approved,'#15803d'],['❌ Rejected',rejected,'#dc2626']].map(([l,n,c])=>`
    <div style="background:#fff;border:1px solid var(--border);border-radius:14px;padding:20px;text-align:center;">
      <div style="font-size:28px;font-weight:800;color:${c};">${n}</div>
      <div style="font-size:13px;color:var(--ink3);">${l}</div>
    </div>`).join('')}
  </div>

  <!-- FILTERS -->
  <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:24px;align-items:center;">
    ${['all','pending','approved','rejected'].map(s=>`
    <a href="/applications/admin?status=${s}" class="btn ${status===s?'btn-primary':'btn-outline'} btn-sm">${s.charAt(0).toUpperCase()+s.slice(1)}</a>`).join('')}
    <form method="GET" action="/applications/admin" style="display:flex;gap:8px;margin-left:auto;">
      <input type="hidden" name="status" value="${status}"/>
      <input type="text" name="search" value="${search}" placeholder="Search..." style="border:1.5px solid var(--border2);border-radius:8px;padding:8px 14px;font-size:13px;outline:none;width:200px;"/>
      <button type="submit" class="btn btn-outline btn-sm">Search</button>
    </form>
  </div>

  <!-- APPLICATIONS -->
  ${apps.length === 0 ? `
  <div style="background:#fff;border:1px solid var(--border);border-radius:20px;padding:48px;text-align:center;">
    <p style="color:var(--ink3);">No applications found.</p>
  </div>` : `
  <div style="display:flex;flex-direction:column;gap:12px;">
    ${apps.map(app => {
      let vendorPhoto = '';
      try { const p = JSON.parse(app.vendor_photos||'[]'); vendorPhoto = p[0]||''; } catch(e){}
      const sc = app.status==='approved'?'#15803d':app.status==='rejected'?'#dc2626':'#a16207';
      const sb = app.status==='approved'?'#dcfce7':app.status==='rejected'?'#fee2e2':'#fef9c3';
      return `
    <div style="background:#fff;border:1px solid var(--border);border-radius:16px;padding:20px;" id="admin-app-${app.id}">
      <div style="display:grid;grid-template-columns:60px 1fr 1fr 160px;gap:16px;align-items:start;">
        <div style="width:56px;height:56px;border-radius:10px;overflow:hidden;background:var(--ivory);display:flex;align-items:center;justify-content:center;">
          ${vendorPhoto ? `<img src="${vendorPhoto}" style="width:100%;height:100%;object-fit:cover;"/>` : '<span style="font-size:24px;">🏪</span>'}
        </div>
        <div>
          <div style="font-weight:700;font-size:15px;margin-bottom:2px;">${app.business_name}</div>
          <div style="font-size:12px;color:var(--ink3);">${app.vendor_category} · ${app.vendor_city}</div>
          <div style="font-size:12px;color:var(--flame);">${app.vendor_email}</div>
          <a href="/vendors/profile/${app.vendor_id_ref}" target="_blank" style="font-size:12px;color:var(--ink4);">View Profile →</a>
          ${app.message ? `<div style="margin-top:6px;font-size:12px;color:var(--ink2);background:var(--ivory);padding:6px 10px;border-radius:6px;font-style:italic;">"${app.message}"</div>` : ''}
        </div>
        <div>
          <div style="font-weight:600;font-size:14px;margin-bottom:2px;">→ ${app.event_title}</div>
          <div style="font-size:12px;color:var(--ink3);">📍 ${app.event_city} · 📅 ${app.date_display||''}</div>
          <div style="font-size:11px;color:var(--ink4);margin-top:4px;">Applied: ${new Date(app.created_at).toLocaleDateString('en-GB')}</div>
          <span style="background:${sb};color:${sc};padding:3px 10px;border-radius:99px;font-size:11px;font-weight:700;display:inline-block;margin-top:6px;">${app.status}</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;">
          <button onclick="updateApp(${app.id},'approved')" style="background:#15803d;color:#fff;border:none;border-radius:8px;padding:8px 12px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;">✅ Approve</button>
          <button onclick="updateApp(${app.id},'rejected')" style="background:#dc2626;color:#fff;border:none;border-radius:8px;padding:8px 12px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;">❌ Reject</button>
          <button onclick="toggleNote(${app.id})" style="background:var(--ivory);border:1px solid var(--border2);border-radius:8px;padding:8px 12px;font-size:12px;cursor:pointer;font-family:inherit;">💬 Add Note</button>
        </div>
      </div>
      <div id="note-${app.id}" style="display:none;margin-top:16px;padding-top:16px;border-top:1px solid var(--border);">
        <textarea id="note-text-${app.id}" placeholder="Optional message to send to vendor..." style="width:100%;border:1.5px solid var(--border2);border-radius:8px;padding:10px;font-size:13px;font-family:inherit;resize:vertical;min-height:80px;box-sizing:border-box;"></textarea>
        <div style="display:flex;gap:8px;margin-top:8px;">
          <button onclick="updateApp(${app.id},'approved',document.getElementById('note-text-${app.id}').value)" style="background:#15803d;color:#fff;border:none;border-radius:8px;padding:10px 18px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;">✅ Approve + Send</button>
          <button onclick="updateApp(${app.id},'rejected',document.getElementById('note-text-${app.id}').value)" style="background:#dc2626;color:#fff;border:none;border-radius:8px;padding:10px 18px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;">❌ Reject + Send</button>
        </div>
      </div>
    </div>`;
    }).join('')}
  </div>`}
</div>
<script>
function toggleNote(id) {
  const el = document.getElementById('note-' + id);
  el.style.display = el.style.display === 'none' ? 'block' : 'none';
}
async function updateApp(id, status, notes) {
  const r = await fetch('/applications/admin/update/' + id, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({status, notes: notes||''})
  });
  const d = await r.json();
  if (d.ok) {
    const el = document.getElementById('admin-app-' + id);
    el.style.borderColor = status === 'approved' ? '#86efac' : '#fca5a5';
    el.style.opacity = '0.7';
    el.innerHTML += '<div style="padding:12px;font-weight:700;color:' + (status==='approved'?'#15803d':'#dc2626') + ';">' + (status==='approved'?'✅ Approved':'❌ Rejected') + ' — Email sent to vendor</div>';
  } else alert(d.msg);
}
</script>
<footer><div class="footer-bottom"><span>© ${new Date().getFullYear()} Festmore.com — Admin</span></div></footer>
</body></html>`);
});

// ─────────────────────────────────────
// UPDATE APPLICATION STATUS (admin)
// POST /applications/admin/update/:id
// ─────────────────────────────────────
router.post('/admin/update/:id', requireAdmin, async (req, res) => {
  const { status, notes } = req.body;
  const appId = parseInt(req.params.id);

  const app = db.prepare(`
    SELECT va.*, v.business_name, v.email as vendor_email,
           e.title as event_title, e.city as event_city, e.date_display, e.slug as event_slug
    FROM vendor_applications va
    LEFT JOIN vendors v ON va.vendor_id = v.id
    LEFT JOIN events e ON va.event_id = e.id
    WHERE va.id=?
  `).get(appId);

  if (!app) return res.json({ ok: false, msg: 'Application not found' });

  db.prepare('UPDATE vendor_applications SET status=?, organiser_notes=? WHERE id=?').run(status, notes||'', appId);

  // Email vendor
  if (app.vendor_email && status !== 'pending') {
    const approved = status === 'approved';
    await sendEmail(app.vendor_email,
      approved ? `🎉 Your application to ${app.event_title} was approved!` : `Update on your application to ${app.event_title}`,
      emailWrap(`
        <h2 style="font-family:Georgia,serif;font-size:22px;font-weight:400;color:#1a1612;margin:0 0 16px;">${approved ? '🎉 Application Approved!' : '📋 Application Update'}</h2>
        <p style="font-size:15px;color:#6b5f58;line-height:1.7;">Hi <strong>${app.business_name}</strong>,</p>
        ${approved
          ? `<p style="font-size:15px;color:#6b5f58;line-height:1.7;">Great news! Your application to <strong>${app.event_title}</strong> has been <strong style="color:#15803d;">approved</strong>. The organiser will be in touch with further details about your participation.</p>`
          : `<p style="font-size:15px;color:#6b5f58;line-height:1.7;">Thank you for applying to <strong>${app.event_title}</strong>. Unfortunately on this occasion your application was not successful. Don't be discouraged — there are hundreds of other events on Festmore looking for vendors like you.</p>`
        }
        <div style="background:#f5f0e8;border-radius:12px;padding:20px;margin:20px 0;font-size:14px;color:#1a1612;line-height:2;">
          <div><strong>Event:</strong> ${app.event_title}</div>
          <div><strong>Location:</strong> ${app.event_city}</div>
          <div><strong>Date:</strong> ${app.date_display||''}</div>
          <div><strong>Status:</strong> ${approved?'✅ Approved':'❌ Unsuccessful'}</div>
          ${notes ? `<div><strong>Message:</strong> ${notes}</div>` : ''}
        </div>
        <a href="https://festmore.com/events" style="display:inline-block;background:${approved?'#4a7c59':'#e8470a'};color:#fff;padding:14px 28px;border-radius:12px;font-size:14px;font-weight:700;text-decoration:none;">
          ${approved ? 'View Event Details →' : 'Browse More Events →'}
        </a>
      `)
    );
  }

  res.json({ ok: true, msg: 'Updated successfully' });
});

// Export email helpers for use in other routes
module.exports = router;
module.exports.sendEmail = sendEmail;
module.exports.emailWrap = emailWrap;
