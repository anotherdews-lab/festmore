// routes/newsletter.js
// Weekly newsletter system
// GET  /newsletter/admin          — generate and preview newsletter
// POST /newsletter/admin/send     — send to all subscribers

const express = require('express');
const router  = express.Router();
const db      = require('../db');

function requireAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/auth/login');
  next();
}

const FLAGS = { BE:'🇧🇪',DK:'🇩🇰',FR:'🇫🇷',DE:'🇩🇪',NL:'🇳🇱',GB:'🇬🇧',US:'🇺🇸',SE:'🇸🇪',IT:'🇮🇹',ES:'🇪🇸',PL:'🇵🇱',NO:'🇳🇴',FI:'🇫🇮',IN:'🇮🇳',JP:'🇯🇵',TH:'🇹🇭' };
const COUNTRY_NAMES = { BE:'Belgium',DK:'Denmark',FR:'France',DE:'Germany',NL:'Netherlands',GB:'United Kingdom',US:'USA',SE:'Sweden',IT:'Italy',ES:'Spain',PL:'Poland',NO:'Norway',FI:'Finland',IN:'India',JP:'Japan',TH:'Thailand' };

// ─── ADMIN NEWSLETTER PAGE ────────────────────────────────────────
router.get('/admin', requireAdmin, (req, res) => {
  const featuredEvents = db.prepare(`SELECT * FROM events WHERE status='active' AND featured=1 ORDER BY attendees DESC LIMIT 3`).all();
  const topEvents = db.prepare(`SELECT * FROM events WHERE status='active' ORDER BY featured DESC, attendees DESC LIMIT 6`).all();
  const topVendors = db.prepare(`SELECT * FROM vendors WHERE status='active' AND payment_status='paid' ORDER BY avg_rating DESC LIMIT 3`).all();
  const articles = db.prepare(`SELECT * FROM articles WHERE status='published' ORDER BY created_at DESC LIMIT 3`).all();
  const subCount = db.prepare("SELECT COUNT(*) as n FROM subscribers WHERE active=1").get().n;
  const campaigns = db.prepare("SELECT * FROM newsletter_campaigns ORDER BY created_at DESC LIMIT 5").all();

  const previewHtml = generateNewsletterHTML({ featuredEvents, topEvents, topVendors, articles });

  res.send(`<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Newsletter — Festmore Admin</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="/css/main.css"/>
<style>
.preview-frame{border:1px solid var(--border);border-radius:12px;overflow:hidden;max-height:600px;overflow-y:auto;}
</style>
</head><body style="background:var(--cream);">
<nav class="main-nav"><div class="nav-inner">
  <a href="/" class="logo"><span class="logo-fest">Fest</span><span class="logo-more">more</span></a>
  <div style="flex:1;"></div>
  <a href="/admin" class="btn btn-outline btn-sm">← Admin</a>
</div></nav>

<div class="container" style="padding:40px 0;max-width:1000px;">
  <h1 style="font-family:'DM Serif Display',serif;font-size:32px;font-weight:400;margin-bottom:8px;">📧 Weekly Newsletter</h1>
  <p style="color:var(--ink3);margin-bottom:28px;">Send to <strong>${subCount} subscribers</strong> — auto-generates from your current events, vendors and articles.</p>

  ${req.query.success ? `<div style="background:#dcfce7;border:1px solid #86efac;border-radius:12px;padding:14px 18px;margin-bottom:20px;font-size:14px;color:#15803d;font-weight:600;">✅ ${req.query.success}</div>` : ''}
  ${req.query.error ? `<div style="background:#fee2e2;border:1px solid #fca5a5;border-radius:12px;padding:14px 18px;margin-bottom:20px;font-size:14px;color:#dc2626;font-weight:600;">⚠️ ${req.query.error}</div>` : ''}

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:28px;">
    <!-- SEND FORM -->
    <div style="background:#fff;border:1px solid var(--border);border-radius:20px;padding:28px;">
      <h2 style="font-family:'DM Serif Display',serif;font-size:20px;font-weight:400;margin-bottom:20px;">Send This Week's Newsletter</h2>
      <form method="POST" action="/newsletter/admin/send" onsubmit="return confirm('Send newsletter to ${subCount} subscribers?')">
        <div style="margin-bottom:16px;">
          <label style="font-size:12px;font-weight:700;color:var(--ink3);text-transform:uppercase;display:block;margin-bottom:6px;">Subject Line</label>
          <input type="text" name="subject" value="🎪 This Week on Festmore — Best Events &amp; Vendors" style="width:100%;background:#fff;border:1.5px solid var(--border2);border-radius:10px;padding:12px 14px;font-size:14px;outline:none;box-sizing:border-box;font-family:inherit;"/>
        </div>
        <div style="background:var(--ivory);border-radius:12px;padding:16px;margin-bottom:20px;font-size:13px;color:var(--ink3);">
          <strong style="color:var(--ink);">Newsletter includes:</strong><br/>
          ✅ ${featuredEvents.length} featured events<br/>
          ✅ ${topEvents.length} top events<br/>
          ✅ ${topVendors.length} featured vendors<br/>
          ✅ ${articles.length} latest articles<br/>
          📧 Sending to ${subCount} subscribers
        </div>
        <button type="submit" class="btn btn-primary" style="width:100%;padding:14px;font-size:15px;">
          📧 Send to ${subCount} Subscribers →
        </button>
        <div style="font-size:12px;color:var(--ink4);text-align:center;margin-top:8px;">This action cannot be undone</div>
      </form>
    </div>

    <!-- PAST CAMPAIGNS -->
    <div style="background:#fff;border:1px solid var(--border);border-radius:20px;padding:28px;">
      <h2 style="font-family:'DM Serif Display',serif;font-size:20px;font-weight:400;margin-bottom:20px;">Past Campaigns</h2>
      ${campaigns.length === 0 ? `<p style="color:var(--ink3);font-size:14px;">No campaigns sent yet.</p>` :
      campaigns.map(c => `
      <div style="padding:12px 0;border-bottom:1px solid var(--border);">
        <div style="font-weight:600;font-size:14px;color:var(--ink);">${c.subject}</div>
        <div style="font-size:12px;color:var(--ink3);margin-top:2px;">${c.sent_count} sent · ${c.sent_at ? new Date(c.sent_at).toLocaleDateString('en-GB') : 'Draft'}</div>
      </div>`).join('')}
    </div>
  </div>

  <!-- PREVIEW -->
  <div>
    <h2 style="font-family:'DM Serif Display',serif;font-size:20px;font-weight:400;margin-bottom:16px;">📄 Newsletter Preview</h2>
    <div class="preview-frame">
      <iframe srcdoc="${previewHtml.replace(/"/g, '&quot;')}" style="width:100%;height:600px;border:none;"></iframe>
    </div>
  </div>
</div>
<footer><div class="footer-bottom"><span>© ${new Date().getFullYear()} Festmore Admin</span></div></footer>
</body></html>`);
});

// ─── SEND NEWSLETTER ─────────────────────────────────────────────
router.post('/admin/send', requireAdmin, async (req, res) => {
  const { subject } = req.body;

  try {
    const featuredEvents = db.prepare(`SELECT * FROM events WHERE status='active' AND featured=1 ORDER BY attendees DESC LIMIT 3`).all();
    const topEvents = db.prepare(`SELECT * FROM events WHERE status='active' ORDER BY featured DESC, attendees DESC LIMIT 6`).all();
    const topVendors = db.prepare(`SELECT * FROM vendors WHERE status='active' AND payment_status='paid' ORDER BY avg_rating DESC LIMIT 3`).all();
    const articles = db.prepare(`SELECT * FROM articles WHERE status='published' ORDER BY created_at DESC LIMIT 3`).all();
    const subscribers = db.prepare("SELECT email, name FROM subscribers WHERE active=1").all();

    const htmlBody = generateNewsletterHTML({ featuredEvents, topEvents, topVendors, articles });

    // Save campaign
    const campaign = db.prepare(`
      INSERT INTO newsletter_campaigns (subject, body_html, status, sent_count, sent_at)
      VALUES (?, ?, 'sent', ?, NOW())
    `).run(subject || 'Weekly Newsletter from Festmore', htmlBody, subscribers.length);

    // Send emails via Resend
    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    let sent = 0;
    let failed = 0;

    // Send in batches of 10 to avoid rate limits
    for (let i = 0; i < subscribers.length; i += 10) {
      const batch = subscribers.slice(i, i + 10);
      await Promise.all(batch.map(async (sub) => {
        try {
          await resend.emails.send({
            from: 'Festmore Weekly <contact@festmore.com>',
            to: sub.email,
            subject: subject || '🎪 This Week on Festmore — Best Events & Vendors',
            html: htmlBody,
          });
          sent++;
        } catch(e) {
          console.error('Failed to send to:', sub.email, e.message);
          failed++;
        }
      }));
      // Small delay between batches
      await new Promise(r => setTimeout(r, 200));
    }

    console.log(`Newsletter sent: ${sent} success, ${failed} failed`);
    res.redirect(`/newsletter/admin?success=Newsletter sent to ${sent} subscribers! (${failed} failed)`);

  } catch(err) {
    console.error('Newsletter send error:', err.message);
    res.redirect('/newsletter/admin?error=Failed to send newsletter: ' + err.message);
  }
});

// ─── GENERATE NEWSLETTER HTML ─────────────────────────────────────
function generateNewsletterHTML({ featuredEvents, topEvents, topVendors, articles }) {
  const year = new Date().getFullYear();
  const week = getWeekNumber(new Date());

  const eventRows = topEvents.slice(0, 4).map(e => {
    const flag = FLAGS[e.country] || '🌍';
    const img = e.image_url || 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&q=70';
    return `<tr>
      <td style="padding:12px 0;border-bottom:1px solid #f0ece4;">
        <table cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td width="80">
              <img src="${img}" width="72" height="72" style="border-radius:10px;object-fit:cover;display:block;" alt="${e.title}"/>
            </td>
            <td style="padding-left:16px;vertical-align:top;">
              ${e.featured ? '<div style="display:inline-block;background:#e8470a;color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px;margin-bottom:4px;">⭐ FEATURED</div>' : ''}
              <div style="font-size:15px;font-weight:700;color:#1a1612;margin-bottom:4px;">${e.title}</div>
              <div style="font-size:12px;color:#7a6f68;">${flag} ${e.city} · ${e.date_display || e.start_date}</div>
              ${e.vendor_spots ? `<div style="font-size:11px;color:#e8470a;margin-top:2px;font-weight:700;">🏪 ${e.vendor_spots} vendor spots available</div>` : ''}
              <a href="https://festmore.com/events/${e.slug}" style="font-size:12px;color:#e8470a;font-weight:700;text-decoration:none;">View event →</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
  }).join('');

  const vendorRows = topVendors.map(v => {
    let photos = [];
    try { photos = JSON.parse(v.photos || '[]'); } catch(e) {}
    const img = photos[0] || v.image_url || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=70';
    const flag = FLAGS[v.country] || '🌍';
    return `<td width="33%" style="padding:0 8px;vertical-align:top;">
      <img src="${img}" width="160" height="120" style="border-radius:10px;object-fit:cover;display:block;margin-bottom:10px;" alt="${v.business_name}"/>
      <div style="font-size:11px;font-weight:700;color:#4a7c59;text-transform:uppercase;margin-bottom:3px;">${v.category}</div>
      <div style="font-size:14px;font-weight:700;color:#1a1612;margin-bottom:2px;">${v.business_name}</div>
      <div style="font-size:11px;color:#7a6f68;margin-bottom:6px;">${flag} ${v.city}</div>
      <a href="https://festmore.com/vendors/profile/${v.id}" style="font-size:12px;color:#4a7c59;font-weight:700;text-decoration:none;">View profile →</a>
    </td>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Festmore Weekly</title></head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;padding:32px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

  <!-- HEADER -->
  <tr>
    <td style="background:#0a0a0a;border-radius:20px 20px 0 0;padding:32px 40px;text-align:center;">
      <div style="margin-bottom:16px;">
        <span style="font-size:26px;font-weight:800;letter-spacing:-1px;">
          <span style="color:#fff;">Fest</span><span style="color:#e8470a;">more</span>
        </span>
      </div>
      <h1 style="font-size:24px;font-weight:400;color:#fff;margin:0 0 8px;font-family:Georgia,serif;">
        Your Weekly Festival &amp; Vendor Update
      </h1>
      <p style="font-size:13px;color:rgba(255,255,255,.45);margin:0;">Week ${week}, ${year}</p>
    </td>
  </tr>

  <!-- MAIN -->
  <tr>
    <td style="background:#fff;padding:32px 40px;">

      <p style="font-size:15px;color:#3d3530;line-height:1.75;margin:0 0 24px;">
        Hi there! Here are this week's best events and vendors from Festmore — Europe's leading event vendor marketplace.
      </p>

      ${featuredEvents.length > 0 ? `
      <!-- FEATURED -->
      <div style="background:linear-gradient(135deg,#1a0a00,#3d1200);border-radius:14px;padding:20px 24px;margin-bottom:24px;">
        <div style="font-size:11px;font-weight:700;color:#ff7043;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">⭐ Featured Events</div>
        ${featuredEvents.slice(0,2).map(e => `
        <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:12px;">
          <tr>
            <td>
              <a href="https://festmore.com/events/${e.slug}" style="font-size:15px;font-weight:700;color:#fff;text-decoration:none;">${e.title}</a>
              <div style="font-size:12px;color:rgba(255,255,255,.5);margin-top:2px;">${FLAGS[e.country]||'🌍'} ${e.city} · ${e.date_display||e.start_date}</div>
            </td>
          </tr>
        </table>`).join('')}
      </div>` : ''}

      <!-- TOP EVENTS -->
      <h2 style="font-size:18px;font-weight:700;color:#1a1612;margin:0 0 16px;">🎪 Events This Week</h2>
      <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:24px;">
        <tbody>${eventRows}</tbody>
      </table>

      ${topVendors.length > 0 ? `
      <!-- VENDORS -->
      <h2 style="font-size:18px;font-weight:700;color:#1a1612;margin:0 0 16px;">🏪 Featured Vendors</h2>
      <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:24px;">
        <tr>${vendorRows}</tr>
      </table>` : ''}

      ${articles.length > 0 ? `
      <!-- ARTICLES -->
      <h2 style="font-size:18px;font-weight:700;color:#1a1612;margin:0 0 12px;">📰 Latest Articles</h2>
      ${articles.map(a => `
      <div style="padding:12px 0;border-bottom:1px solid #f0ece4;">
        <a href="https://festmore.com/articles/${a.slug}" style="font-size:14px;font-weight:700;color:#1a1612;text-decoration:none;">${a.title}</a>
        <div style="font-size:12px;color:#7a6f68;margin-top:3px;">${(a.excerpt||'').substring(0,100)}…</div>
      </div>`).join('')}` : ''}

      <!-- CTA -->
      <div style="background:#faf8f3;border-radius:14px;padding:24px;text-align:center;margin-top:24px;">
        <div style="font-size:16px;font-weight:700;color:#1a1612;margin-bottom:8px;">Are you a vendor?</div>
        <p style="font-size:13px;color:#7a6f68;margin:0 0 16px;">Get discovered by event organisers worldwide. €49/year.</p>
        <a href="https://festmore.com/vendors/register" style="display:inline-block;background:#4a7c59;color:#fff;padding:12px 28px;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none;">Become a Vendor →</a>
      </div>

    </td>
  </tr>

  <!-- FOOTER -->
  <tr>
    <td style="background:#1a1612;border-radius:0 0 20px 20px;padding:24px 40px;text-align:center;">
      <p style="font-size:12px;color:rgba(255,255,255,.3);margin:0;line-height:1.7;">
        © ${year} Festmore.com · Europe's Event Vendor Marketplace<br/>
        <a href="https://festmore.com/unsubscribe" style="color:rgba(255,255,255,.25);text-decoration:none;">Unsubscribe</a>
      </p>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body></html>`;
}

function getWeekNumber(d) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

module.exports = router;