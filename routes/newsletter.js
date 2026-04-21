// routes/newsletter.js — COMPLETE NEWSLETTER SYSTEM v2
// Sends to: subscribers + vendors + event organisers
// Admin can add manual emails
// GET  /newsletter/admin          — dashboard
// POST /newsletter/admin/send     — send newsletter
// POST /newsletter/admin/add-subscriber — manually add email
// POST /newsletter/subscribe      — public signup form

const express = require('express');
const router  = express.Router();
const db      = require('../db');

function requireAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/auth/login');
  next();
}

async function sendEmail(to, subject, html) {
  try {
    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({ from: 'Festmore Newsletter <contact@festmore.com>', to, subject, html });
    return true;
  } catch(err) {
    console.error('Email error to', to, ':', err.message);
    return false;
  }
}

// ─── COLLECT ALL RECIPIENTS ──────────────────────────────────────
function getAllRecipients(includeSubscribers, includeVendors, includeOrganisers) {
  const seen = new Set();
  const list = [];

  const add = (email, name, type) => {
    if (!email || !email.includes('@')) return;
    const key = email.toLowerCase().trim();
    if (seen.has(key)) return;
    seen.add(key);
    list.push({ email: key, name: name || '', type });
  };

  if (includeSubscribers) {
    try {
      db.prepare("SELECT email, name FROM subscribers WHERE active=1").all()
        .forEach(s => add(s.email, s.name, 'subscriber'));
    } catch(e) {}
  }

  if (includeVendors) {
    try {
      db.prepare("SELECT email, business_name FROM vendors WHERE status='active'").all()
        .forEach(v => add(v.email, v.business_name, 'vendor'));
    } catch(e) {}
  }

  if (includeOrganisers) {
    try {
      db.prepare("SELECT DISTINCT organiser_email FROM events WHERE status='active' AND organiser_email IS NOT NULL AND organiser_email != ''").all()
        .forEach(o => add(o.organiser_email, '', 'organiser'));
    } catch(e) {}
  }

  return list;
}

// ─── ADMIN NEWSLETTER DASHBOARD ──────────────────────────────────
router.get('/admin', requireAdmin, (req, res) => {
  const featuredEvents = db.prepare("SELECT * FROM events WHERE status='active' AND featured=1 ORDER BY attendees DESC LIMIT 3").all();
  const topEvents = db.prepare("SELECT * FROM events WHERE status='active' ORDER BY featured DESC, attendees DESC LIMIT 6").all();
  const topVendors = db.prepare("SELECT * FROM vendors WHERE status='active' AND payment_status='paid' ORDER BY verified DESC LIMIT 3").all();
  const articles = db.prepare("SELECT * FROM articles WHERE status='published' ORDER BY created_at DESC LIMIT 2").all();

  let campaigns = [];
  try { campaigns = db.prepare("SELECT * FROM newsletter_campaigns ORDER BY created_at DESC LIMIT 10").all(); } catch(e){}

  const subCount = (() => { try { return db.prepare("SELECT COUNT(*) as n FROM subscribers WHERE active=1").get().n; } catch(e){ return 0; } })();
  const vendorCount = (() => { try { return db.prepare("SELECT COUNT(*) as n FROM vendors WHERE status='active'").get().n; } catch(e){ return 0; } })();
  const organiserCount = (() => { try { return db.prepare("SELECT COUNT(DISTINCT organiser_email) as n FROM events WHERE status='active' AND organiser_email IS NOT NULL AND organiser_email != ''").get().n; } catch(e){ return 0; } })();
  const allRecipients = getAllRecipients(true, true, true);

  res.send(`<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Newsletter — Festmore Admin</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="/css/main.css"/>
</head><body style="background:var(--cream);">
<nav class="main-nav"><div class="nav-inner">
  <a href="/" class="logo"><span class="logo-fest">Fest</span><span class="logo-more">more</span></a>
  <div style="flex:1;"></div>
  <a href="/admin" class="btn btn-outline btn-sm">← Admin</a>
</div></nav>

<div class="container" style="padding:40px 0;max-width:1100px;">
  <h1 style="font-family:'DM Serif Display',serif;font-size:36px;font-weight:400;margin-bottom:8px;">📧 Newsletter System</h1>
  <p style="color:var(--ink3);margin-bottom:32px;">Send weekly newsletters to all your contacts — subscribers, vendors and event organisers.</p>

  ${req.query.success ? '<div style="background:#dcfce7;border:1px solid #86efac;border-radius:12px;padding:14px 18px;margin-bottom:20px;font-size:14px;color:#15803d;font-weight:600;">✅ ' + req.query.success + '</div>' : ''}
  ${req.query.error ? '<div style="background:#fee2e2;border:1px solid #fca5a5;border-radius:12px;padding:14px 18px;margin-bottom:20px;font-size:14px;color:#dc2626;font-weight:600;">⚠️ ' + req.query.error + '</div>' : ''}

  <!-- AUDIENCE STATS -->
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:32px;">
    ${[
      ['📨', 'Total Recipients', allRecipients.length, 'All combined, deduplicated'],
      ['🙋', 'Subscribers', subCount, 'Signed up via website'],
      ['🏪', 'Vendors', vendorCount, 'Active vendor profiles'],
      ['🎪', 'Organisers', organiserCount, 'From event listings'],
    ].map(([icon, label, count, desc]) => `
    <div style="background:#fff;border:1px solid var(--border);border-radius:16px;padding:20px;text-align:center;">
      <div style="font-size:28px;margin-bottom:8px;">${icon}</div>
      <div style="font-family:'DM Serif Display',serif;font-size:32px;color:var(--ink);">${count}</div>
      <div style="font-size:13px;font-weight:700;color:var(--ink);margin-bottom:4px;">${label}</div>
      <div style="font-size:11px;color:var(--ink4);">${desc}</div>
    </div>`).join('')}
  </div>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:32px;">

    <!-- SEND FORM -->
    <div style="background:#fff;border:1px solid var(--border);border-radius:20px;padding:28px;">
      <h2 style="font-family:'DM Serif Display',serif;font-size:22px;font-weight:400;margin-bottom:20px;">📤 Send Newsletter</h2>
      <form method="POST" action="/newsletter/admin/send" onsubmit="return confirm('Send newsletter to ' + document.getElementById('total-count').textContent + ' recipients?')">
        <div style="margin-bottom:16px;">
          <label style="font-size:12px;font-weight:700;color:var(--ink3);text-transform:uppercase;display:block;margin-bottom:6px;">Subject Line *</label>
          <input type="text" name="subject" required value="🎪 This Week on Festmore — Best Events and Vendors" style="width:100%;background:#f9f7f4;border:1.5px solid var(--border2);border-radius:10px;padding:12px 14px;font-size:14px;outline:none;box-sizing:border-box;font-family:inherit;"/>
        </div>
        <div style="margin-bottom:16px;">
          <label style="font-size:12px;font-weight:700;color:var(--ink3);text-transform:uppercase;display:block;margin-bottom:6px;">Newsletter Type</label>
          <select name="newsletter_type" onchange="document.getElementById('custom-box').style.display=this.value==='custom'?'block':'none'" style="width:100%;background:#f9f7f4;border:1.5px solid var(--border2);border-radius:10px;padding:12px 14px;font-size:14px;outline:none;box-sizing:border-box;font-family:inherit;">
            <option value="weekly">📅 Weekly Digest (Events + Vendors + Articles)</option>
            <option value="events_only">🎪 Events Focus Only</option>
            <option value="vendors_only">🏪 Vendor Spotlight Only</option>
            <option value="custom">✏️ Custom Message</option>
          </select>
        </div>
        <div id="custom-box" style="display:none;margin-bottom:16px;">
          <label style="font-size:12px;font-weight:700;color:var(--ink3);text-transform:uppercase;display:block;margin-bottom:6px;">Custom Message</label>
          <textarea name="custom_message" rows="5" placeholder="Write your message here…" style="width:100%;background:#f9f7f4;border:1.5px solid var(--border2);border-radius:10px;padding:12px 14px;font-size:14px;outline:none;box-sizing:border-box;font-family:inherit;resize:vertical;"></textarea>
        </div>
        <div style="margin-bottom:20px;">
          <label style="font-size:12px;font-weight:700;color:var(--ink3);text-transform:uppercase;display:block;margin-bottom:10px;">Send To</label>
          <div style="display:flex;flex-direction:column;gap:8px;">
            <label style="display:flex;align-items:center;gap:10px;cursor:pointer;background:var(--ivory);border:1.5px solid var(--border);border-radius:10px;padding:12px 14px;">
              <input type="checkbox" name="send_to_subscribers" value="1" checked style="accent-color:var(--flame);width:16px;height:16px;"/>
              <span style="font-size:14px;font-weight:600;">🙋 Newsletter Subscribers (${subCount})</span>
            </label>
            <label style="display:flex;align-items:center;gap:10px;cursor:pointer;background:var(--ivory);border:1.5px solid var(--border);border-radius:10px;padding:12px 14px;">
              <input type="checkbox" name="send_to_vendors" value="1" checked style="accent-color:var(--flame);width:16px;height:16px;"/>
              <span style="font-size:14px;font-weight:600;">🏪 Vendors (${vendorCount})</span>
            </label>
            <label style="display:flex;align-items:center;gap:10px;cursor:pointer;background:var(--ivory);border:1.5px solid var(--border);border-radius:10px;padding:12px 14px;">
              <input type="checkbox" name="send_to_organisers" value="1" checked style="accent-color:var(--flame);width:16px;height:16px;"/>
              <span style="font-size:14px;font-weight:600;">🎪 Event Organisers (${organiserCount})</span>
            </label>
          </div>
        </div>
        <div style="background:rgba(232,71,10,.06);border:1.5px solid rgba(232,71,10,.2);border-radius:12px;padding:14px 18px;margin-bottom:20px;">
          <div style="font-size:13px;color:var(--ink2);">📧 Sending to <strong id="total-count">${allRecipients.length}</strong> unique recipients</div>
        </div>
        <button type="submit" class="btn btn-primary" style="width:100%;padding:14px;font-size:15px;">Send Newsletter Now →</button>
        <p style="font-size:12px;color:var(--ink4);text-align:center;margin-top:8px;">Sends in batches — may take a few minutes for large lists</p>
      </form>
    </div>

    <!-- RIGHT COLUMN -->
    <div>
      <!-- ADD SUBSCRIBER -->
      <div style="background:#fff;border:1px solid var(--border);border-radius:20px;padding:28px;margin-bottom:20px;">
        <h2 style="font-family:'DM Serif Display',serif;font-size:20px;font-weight:400;margin-bottom:6px;">➕ Add Subscribers Manually</h2>
        <p style="font-size:13px;color:var(--ink3);margin-bottom:20px;">Add emails one by one or paste a bulk list — one email per line.</p>
        <form method="POST" action="/newsletter/admin/add-subscriber">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;">
            <input type="email" name="email" placeholder="email@example.com" style="background:#f9f7f4;border:1.5px solid var(--border2);border-radius:10px;padding:10px 14px;font-size:14px;outline:none;font-family:inherit;"/>
            <input type="text" name="name" placeholder="Name (optional)" style="background:#f9f7f4;border:1.5px solid var(--border2);border-radius:10px;padding:10px 14px;font-size:14px;outline:none;font-family:inherit;"/>
          </div>
          <textarea name="bulk_emails" rows="4" placeholder="Or paste multiple emails — one per line:&#10;john@example.com&#10;jane@company.com&#10;festival@email.com" style="width:100%;background:#f9f7f4;border:1.5px solid var(--border2);border-radius:10px;padding:10px 14px;font-size:14px;outline:none;box-sizing:border-box;font-family:inherit;resize:vertical;margin-bottom:12px;"></textarea>
          <button type="submit" class="btn btn-primary" style="width:100%;padding:12px;">Add to Subscriber List →</button>
        </form>
      </div>

      <!-- PAST CAMPAIGNS -->
      <div style="background:#fff;border:1px solid var(--border);border-radius:20px;padding:28px;">
        <h2 style="font-family:'DM Serif Display',serif;font-size:20px;font-weight:400;margin-bottom:16px;">📋 Past Campaigns</h2>
        ${campaigns.length === 0
          ? '<p style="color:var(--ink3);font-size:14px;">No campaigns sent yet.</p>'
          : campaigns.map(c => `
          <div style="padding:12px 0;border-bottom:1px solid var(--border);">
            <div style="font-size:14px;font-weight:600;color:var(--ink);margin-bottom:3px;">${c.subject || 'Weekly Newsletter'}</div>
            <div style="font-size:12px;color:var(--ink4);">
              📧 ${c.sent_count || 0} sent · ${c.status === 'sent' ? '✅ Sent' : '⏳ ' + c.status} ·
              ${c.sent_at ? new Date(c.sent_at).toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric'}) : 'Draft'}
            </div>
          </div>`).join('')}
      </div>
    </div>
  </div>

  <!-- RECIPIENTS PREVIEW -->
  <div style="background:#fff;border:1px solid var(--border);border-radius:20px;padding:28px;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
      <h2 style="font-family:'DM Serif Display',serif;font-size:20px;font-weight:400;">👥 All Recipients (${allRecipients.length} total)</h2>
      <span style="font-size:13px;color:var(--ink3);">Duplicates automatically removed</span>
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;max-height:280px;overflow-y:auto;">
      ${allRecipients.slice(0, 60).map(r => `
      <div style="background:var(--ivory);border-radius:8px;padding:8px 12px;font-size:12px;">
        <div style="font-weight:600;color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${r.email}</div>
        <div style="color:var(--ink4);">${r.type === 'vendor' ? '🏪 Vendor' : r.type === 'organiser' ? '🎪 Organiser' : '🙋 Subscriber'}</div>
      </div>`).join('')}
      ${allRecipients.length > 60 ? `<div style="padding:8px 12px;font-size:12px;color:var(--ink4);">+${allRecipients.length - 60} more…</div>` : ''}
    </div>
  </div>
</div>
</body></html>`);
});

// ─── SEND NEWSLETTER ─────────────────────────────────────────────
router.post('/admin/send', requireAdmin, async (req, res) => {
  const { subject, newsletter_type, custom_message, send_to_subscribers, send_to_vendors, send_to_organisers } = req.body;

  const recipients = getAllRecipients(!!send_to_subscribers, !!send_to_vendors, !!send_to_organisers);
  if (recipients.length === 0) return res.redirect('/newsletter/admin?error=No recipients selected');

  const featuredEvents = db.prepare("SELECT * FROM events WHERE status='active' AND featured=1 ORDER BY attendees DESC LIMIT 3").all();
  const topEvents = db.prepare("SELECT * FROM events WHERE status='active' ORDER BY featured DESC, attendees DESC LIMIT 6").all();
  const topVendors = db.prepare("SELECT * FROM vendors WHERE status='active' AND payment_status='paid' ORDER BY verified DESC LIMIT 3").all();
  const articles = db.prepare("SELECT * FROM articles WHERE status='published' ORDER BY created_at DESC LIMIT 2").all();

  const htmlBody = generateNewsletterHTML({ featuredEvents, topEvents, topVendors, articles, type: newsletter_type, customMessage: custom_message });

  try {
    db.prepare("INSERT INTO newsletter_campaigns (subject, body_html, status, sent_count, sent_at) VALUES (?, ?, 'sending', ?, datetime('now'))")
      .run(subject || 'Weekly Newsletter', htmlBody, recipients.length);
  } catch(e) { console.error('Campaign save error:', e.message); }

  let sent = 0, failed = 0;
  for (let i = 0; i < recipients.length; i += 10) {
    const batch = recipients.slice(i, i + 10);
    await Promise.all(batch.map(async (r) => {
      const html = htmlBody.replace(/\{\{NAME\}\}/g, r.name || 'there').replace(/\{\{EMAIL\}\}/g, r.email);
      const ok = await sendEmail(r.email, subject || 'This Week on Festmore', html);
      if (ok) sent++; else failed++;
    }));
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  try { db.prepare("UPDATE newsletter_campaigns SET status='sent', sent_count=? WHERE status='sending'").run(sent); } catch(e){}
  res.redirect('/newsletter/admin?success=Newsletter sent to ' + sent + ' recipients! (' + failed + ' failed)');
});

// ─── ADD SUBSCRIBER MANUALLY ─────────────────────────────────────
router.post('/admin/add-subscriber', requireAdmin, (req, res) => {
  const { email, name, bulk_emails } = req.body;
  let added = 0;

  try { db.prepare("ALTER TABLE subscribers ADD COLUMN name TEXT DEFAULT ''").run(); } catch(e){}

  if (email && email.includes('@')) {
    try {
      db.prepare("INSERT INTO subscribers (email, name, active) VALUES (?, ?, 1) ON CONFLICT (email) DO UPDATE SET active=1, name=excluded.name")
        .run(email.trim().toLowerCase(), name || '');
      added++;
    } catch(e) { console.error(e.message); }
  }

  if (bulk_emails) {
    bulk_emails.split('\n').map(l => l.trim()).filter(l => l.includes('@')).forEach(line => {
      try {
        const parts = line.split(',');
        const e = parts[0].trim().toLowerCase();
        const n = parts[1] ? parts[1].trim() : '';
        db.prepare("INSERT INTO subscribers (email, name, active) VALUES (?, ?, 1) ON CONFLICT (email) DO UPDATE SET active=1").run(e, n);
        added++;
      } catch(e) {}
    });
  }

  res.redirect('/newsletter/admin?success=Added ' + added + ' subscriber' + (added !== 1 ? 's' : '') + ' successfully!');
});

// ─── PUBLIC SUBSCRIBE ─────────────────────────────────────────────
router.post('/subscribe', async (req, res) => {
  const { email, name, country } = req.body;
  if (!email || !email.includes('@')) return res.status(400).json({ ok: false, msg: 'Invalid email' });
  try {
    try { db.prepare("ALTER TABLE subscribers ADD COLUMN name TEXT DEFAULT ''").run(); } catch(e){}
    db.prepare("INSERT INTO subscribers (email, name, country, active) VALUES (?, ?, ?, 1) ON CONFLICT (email) DO UPDATE SET active=1")
      .run(email.trim().toLowerCase(), name || '', country || '');
    await require('./cron').sendWelcomeEmail(email, name || '');
    res.json({ ok: true, msg: 'Subscribed! Check your email for a welcome message.' });
  } catch(err) {
    console.error('Subscribe error:', err.message);
    res.json({ ok: false, msg: 'Failed to subscribe. Please try again.' });
  }
});

// ─── UNSUBSCRIBE ──────────────────────────────────────────────────
router.get('/unsubscribe', (req, res) => {
  const { email } = req.query;
  if (email) {
    try { db.prepare("UPDATE subscribers SET active=0 WHERE email=?").run(email.toLowerCase()); } catch(e){}
  }
  res.send(`<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;text-align:center;padding:80px 20px;background:#f5f0e8;">
  <h2 style="color:#1a1612;">You have been unsubscribed</h2>
  <p style="color:#6b5f58;">You will no longer receive newsletters from Festmore.</p>
  <a href="https://festmore.com" style="color:#e8470a;">Return to Festmore →</a>
  </body></html>`);
});

module.exports = router;

// ═══════════════════════════════════════════════════════
// NEWSLETTER HTML GENERATOR
// ═══════════════════════════════════════════════════════

function generateNewsletterHTML({ featuredEvents, topEvents, topVendors, articles, type, customMessage }) {
  const year = new Date().getFullYear();
  const month = new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  const FLAGS = { BE:'🇧🇪',CN:'🇨🇳',DK:'🇩🇰',FR:'🇫🇷',DE:'🇩🇪',NL:'🇳🇱',PL:'🇵🇱',SE:'🇸🇪',AE:'🇦🇪',GB:'🇬🇧',US:'🇺🇸',NO:'🇳🇴',FI:'🇫🇮',AT:'🇦🇹',CH:'🇨🇭',IT:'🇮🇹',ES:'🇪🇸',PT:'🇵🇹',IE:'🇮🇪',CZ:'🇨🇿',HU:'🇭🇺',GR:'🇬🇷',HR:'🇭🇷',IN:'🇮🇳',TH:'🇹🇭',JP:'🇯🇵',AU:'🇦🇺',CA:'🇨🇦',BR:'🇧🇷',MX:'🇲🇽',KR:'🇰🇷',ZA:'🇿🇦',AR:'🇦🇷',MA:'🇲🇦',SG:'🇸🇬' };

  const eventsHTML = topEvents.slice(0, 4).map(e =>
    '<table width="48%" cellpadding="0" cellspacing="0" style="display:inline-table;vertical-align:top;margin:0 1% 16px;"><tr><td>' +
    '<a href="https://festmore.com/events/' + e.slug + '" style="text-decoration:none;">' +
    '<img src="' + (e.image_url || 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&q=70') + '" width="100%" style="border-radius:10px;display:block;margin-bottom:10px;height:130px;object-fit:cover;" alt="' + e.title + '"/>' +
    '<div style="font-size:10px;font-weight:700;color:#e8470a;text-transform:uppercase;margin-bottom:3px;">' + (FLAGS[e.country]||'🌍') + ' ' + e.city + '</div>' +
    '<div style="font-size:14px;font-weight:700;color:#1a1612;margin-bottom:3px;line-height:1.3;">' + e.title + '</div>' +
    '<div style="font-size:12px;color:#7a6f68;">📅 ' + (e.date_display || e.start_date) + '</div>' +
    '<div style="font-size:12px;color:#e8470a;font-weight:700;margin-top:6px;">View event →</div>' +
    '</a></td></tr></table>'
  ).join('');

  const vendorsHTML = topVendors.slice(0, 3).map(v => {
    let img = v.image_url || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=70';
    try { const p = JSON.parse(v.photos||'[]'); if(p.length) img = p[0]; } catch(e){}
    return '<table width="31%" cellpadding="0" cellspacing="0" style="display:inline-table;vertical-align:top;margin:0 1% 16px;"><tr><td style="background:#f5f0e8;border-radius:12px;padding:16px;text-align:center;">' +
      '<img src="' + img + '" width="60" height="60" style="border-radius:10px;object-fit:cover;margin-bottom:10px;" alt="' + v.business_name + '"/>' +
      '<div style="font-size:10px;font-weight:700;color:#4a7c59;text-transform:uppercase;margin-bottom:3px;">' + v.category + '</div>' +
      '<div style="font-size:14px;font-weight:700;color:#1a1612;margin-bottom:3px;">' + v.business_name + '</div>' +
      '<div style="font-size:11px;color:#7a6f68;margin-bottom:10px;">' + (FLAGS[v.country]||'🌍') + ' ' + v.city + '</div>' +
      '<a href="https://festmore.com/vendors/profile/' + v.id + '" style="display:inline-block;background:#4a7c59;color:#fff;padding:6px 16px;border-radius:8px;font-size:12px;font-weight:700;text-decoration:none;">View Profile</a>' +
      '</td></tr></table>';
  }).join('');

  const title = type === 'events_only' ? "This Week's Best Events" :
                type === 'vendors_only' ? 'Featured Vendors This Week' :
                type === 'custom' ? 'Message from Festmore' :
                'This Week on Festmore';

  return '<!DOCTYPE html><html><head><meta charset="UTF-8"/></head>' +
  '<body style="margin:0;padding:0;background:#f5f0e8;font-family:Helvetica Neue,Arial,sans-serif;">' +
  '<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;padding:32px 16px;"><tr><td align="center">' +
  '<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">' +

  // HEADER
  '<tr><td style="background:#0a1a0f;border-radius:20px 20px 0 0;padding:36px 48px;text-align:center;">' +
  '<span style="font-size:26px;font-weight:800;color:#fff;">Fest<span style="color:#e8470a;">more</span></span>' +
  '<div style="font-size:13px;color:rgba(255,255,255,.4);margin-top:6px;">' + month + ' Newsletter</div>' +
  '<h1 style="font-size:24px;font-weight:400;color:#fff;margin:16px 0 0;font-family:Georgia,serif;">🎪 ' + title + '</h1>' +
  '</td></tr>' +

  // BODY
  '<tr><td style="background:#ffffff;padding:40px 48px;">' +
  '<p style="font-size:15px;color:#6b5f58;line-height:1.8;margin:0 0 28px;">Hi {{NAME}},<br/><br/>' +
  (type === 'custom' && customMessage ? 'We have a message for you from the Festmore team.' : "Here is what is happening on Festmore this week.") +
  '</p>' +

  (customMessage ? '<div style="background:#fff7ed;border-left:4px solid #e8470a;border-radius:0 12px 12px 0;padding:20px 24px;margin-bottom:28px;font-size:15px;color:#1a1612;line-height:1.8;">' + customMessage.replace(/\n/g,'<br/>') + '</div>' : '') +

  (type !== 'vendors_only' && topEvents.length ? '<h2 style="font-size:20px;font-weight:700;color:#1a1612;margin:0 0 16px;">🎪 Events This Week</h2><table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">' + eventsHTML + '</table><table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;"><tr><td align="center"><a href="https://festmore.com/events" style="display:inline-block;background:#e8470a;color:#fff;padding:13px 32px;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none;">Browse All Events</a></td></tr></table>' : '') +

  (type !== 'events_only' && topVendors.length ? '<h2 style="font-size:20px;font-weight:700;color:#1a1612;margin:0 0 16px;">🏪 Featured Vendors</h2><table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">' + vendorsHTML + '</table><table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;"><tr><td align="center"><a href="https://festmore.com/vendors" style="display:inline-block;background:#4a7c59;color:#fff;padding:13px 32px;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none;">Browse All Vendors</a></td></tr></table>' : '') +

  (articles.length ? '<div style="background:#f5f0e8;border-radius:14px;padding:24px;margin-bottom:28px;"><h2 style="font-size:18px;font-weight:700;color:#1a1612;margin:0 0 14px;">📰 Latest Guides</h2>' + articles.map(a => '<div style="margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid rgba(26,22,18,.08);"><a href="https://festmore.com/articles/' + a.slug + '" style="font-size:14px;font-weight:700;color:#e8470a;text-decoration:none;">' + a.title + '</a><div style="font-size:13px;color:#7a6f68;margin-top:2px;">' + (a.excerpt||'').substring(0,90) + '…</div></div>').join('') + '</div>' : '') +

  '<div style="background:linear-gradient(135deg,#0d1f15,#1a3d28);border-radius:14px;padding:28px;text-align:center;margin-bottom:20px;">' +
  '<h3 style="font-size:18px;font-weight:700;color:#fff;margin:0 0 8px;">🏪 Are you a vendor?</h3>' +
  '<p style="font-size:13px;color:rgba(255,255,255,.6);margin:0 0 16px;">Get discovered by event organisers worldwide. €49/year.</p>' +
  '<a href="https://festmore.com/vendors/register" style="display:inline-block;background:#4a7c59;color:#fff;padding:12px 28px;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none;">Become a Vendor</a>' +
  '</div>' +

  '<div style="background:#fff7ed;border:1px solid rgba(232,71,10,.2);border-radius:14px;padding:24px;text-align:center;">' +
  '<h3 style="font-size:18px;font-weight:700;color:#1a1612;margin:0 0 8px;">🎪 Have an event to list?</h3>' +
  '<p style="font-size:13px;color:#7a6f68;margin:0 0 16px;">Free listings available. Standard from €79/yr.</p>' +
  '<a href="https://festmore.com/events/submit" style="display:inline-block;background:#e8470a;color:#fff;padding:12px 28px;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none;">List Your Event</a>' +
  '</div>' +
  '</td></tr>' +

  // FOOTER
  '<tr><td style="background:#1a1612;border-radius:0 0 20px 20px;padding:24px 48px;text-align:center;">' +
  '<span style="font-size:18px;font-weight:800;color:#fff;">Fest<span style="color:#e8470a;">more</span></span>' +
  '<p style="font-size:11px;color:rgba(255,255,255,.3);margin:12px 0 0;line-height:1.6;">' +
  '© ' + year + ' Festmore.com · Europe\'s Event Vendor Marketplace<br/>' +
  '<a href="https://festmore.com/newsletter/unsubscribe?email={{EMAIL}}" style="color:rgba(255,255,255,.3);text-decoration:underline;">Unsubscribe</a>' +
  '</p></td></tr>' +

  '</table></td></tr></table></body></html>';
}
