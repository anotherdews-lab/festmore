// routes/dashboard.js — WITH PHOTO UPLOAD
const express = require('express');
const router  = express.Router();
const db      = require('../db');

// Load photo helpers
let photoUploadHTML, photoGalleryHTML;
try {
  const photos = require('./photos');
  photoUploadHTML  = photos.photoUploadHTML;
  photoGalleryHTML = photos.photoGalleryHTML;
} catch(e) {
  photoUploadHTML  = () => '';
  photoGalleryHTML = () => '';
}

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

// ─────────────────────────────────────
// MAIN DASHBOARD
// ─────────────────────────────────────
router.get('/', requireLogin, (req, res) => {
  const user       = req.session.user;
  const myEvents   = db.prepare("SELECT * FROM events WHERE user_id=? ORDER BY created_at DESC").all(user.id);
  const myVendors  = db.prepare("SELECT * FROM vendors WHERE user_id=? ORDER BY created_at DESC").all(user.id);
  const totalViews = myEvents.reduce((s, e) => s + (e.views || 0), 0);

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
      <a href="/vendors/register" class="btn btn-outline">+ Add Vendor Profile</a>
    </div>
  </div>

  <div class="dashboard-stat-grid" style="margin-bottom:40px;">
    <div class="dashboard-stat"><div class="dash-stat-n">${myEvents.length}</div><div class="dash-stat-l">My Events</div></div>
    <div class="dashboard-stat"><div class="dash-stat-n" style="color:var(--sage);">${myEvents.filter(e=>e.status==='active').length}</div><div class="dash-stat-l">Live Events</div></div>
    <div class="dashboard-stat"><div class="dash-stat-n">${totalViews.toLocaleString()}</div><div class="dash-stat-l">Total Views</div></div>
    <div class="dashboard-stat"><div class="dash-stat-n" style="color:var(--flame);">${myVendors.length}</div><div class="dash-stat-l">Vendor Profiles</div></div>
  </div>

  <!-- MY EVENTS -->
  <div style="background:#fff;border:1px solid var(--border);border-radius:20px;padding:28px 32px;margin-bottom:28px;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:22px;">
      <h2 style="font-family:'DM Serif Display',serif;font-size:22px;font-weight:400;">My Events</h2>
      <a href="/events/submit" class="btn btn-primary btn-sm">+ New Event</a>
    </div>
    ${myEvents.length ? `
    <div style="overflow-x:auto;">
      <table style="width:100%;border-collapse:collapse;">
        <thead><tr style="border-bottom:2px solid var(--border);">
          <th style="text-align:left;padding:10px 12px;font-size:11px;font-weight:700;color:var(--ink4);text-transform:uppercase;">Event</th>
          <th style="text-align:left;padding:10px 12px;font-size:11px;font-weight:700;color:var(--ink4);text-transform:uppercase;">Date</th>
          <th style="text-align:left;padding:10px 12px;font-size:11px;font-weight:700;color:var(--ink4);text-transform:uppercase;">Views</th>
          <th style="text-align:left;padding:10px 12px;font-size:11px;font-weight:700;color:var(--ink4);text-transform:uppercase;">Photos</th>
          <th style="text-align:left;padding:10px 12px;font-size:11px;font-weight:700;color:var(--ink4);text-transform:uppercase;">Status</th>
          <th style="padding:10px 12px;"></th>
        </tr></thead>
        <tbody>
          ${myEvents.map(e => {
            let photoCount = 0;
            try { photoCount = JSON.parse(e.photos||'[]').length; } catch(x) {}
            return `
          <tr style="border-bottom:1px solid var(--border);" onmouseover="this.style.background='var(--ivory)'" onmouseout="this.style.background=''">
            <td style="padding:14px 12px;">
              <div style="font-weight:600;font-size:14px;">${e.title}</div>
              <div style="font-size:12px;color:var(--ink3);">📍 ${e.city}</div>
            </td>
            <td style="padding:14px 12px;font-size:13px;color:var(--ink2);">${e.date_display||e.start_date}</td>
            <td style="padding:14px 12px;font-size:14px;font-weight:600;">👁 ${(e.views||0).toLocaleString()}</td>
            <td style="padding:14px 12px;">
              <span style="font-size:13px;color:${photoCount>0?'var(--sage)':'var(--ink4)'};">
                📸 ${photoCount} photo${photoCount!==1?'s':''}
              </span>
            </td>
            <td style="padding:14px 12px;">
              <span style="padding:4px 12px;border-radius:99px;font-size:11px;font-weight:700;
                background:${e.status==='active'?'#dcfce7':e.status==='pending'?'#fef9c3':'#fee2e2'};
                color:${e.status==='active'?'#15803d':e.status==='pending'?'#a16207':'#dc2626'};">
                ${e.status==='active'?'✅ Live':e.status==='pending'?'⏳ Pending':'❌ '+e.status}
              </span>
            </td>
            <td style="padding:14px 12px;">
              <div style="display:flex;gap:6px;">
                <a href="/events/${e.slug}" class="btn btn-outline btn-sm">View</a>
                <a href="/dashboard/event/${e.id}" class="btn btn-primary btn-sm">Edit & Photos</a>
              </div>
            </td>
          </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>` : `
    <div style="text-align:center;padding:48px 0;">
      <div style="font-size:44px;margin-bottom:14px;">🎪</div>
      <p style="color:var(--ink3);margin-bottom:18px;">You haven't listed any events yet</p>
      <a href="/events/submit" class="btn btn-primary btn-lg">List Your First Event →</a>
    </div>`}
  </div>

  <!-- MY VENDORS -->
  <div style="background:#fff;border:1px solid var(--border);border-radius:20px;padding:28px 32px;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:22px;">
      <h2 style="font-family:'DM Serif Display',serif;font-size:22px;font-weight:400;">My Vendor Profiles</h2>
      <a href="/vendors/register" class="btn btn-primary btn-sm">+ New Profile</a>
    </div>
    ${myVendors.length ? `
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:18px;">
      ${myVendors.map(v => {
        let photoCount = 0;
        try { photoCount = JSON.parse(v.photos||'[]').length; } catch(x) {}
        return `
      <div style="border:1px solid var(--border);border-radius:16px;overflow:hidden;">
        ${v.image_url ? `<div style="height:140px;overflow:hidden;"><img src="${v.image_url}" alt="${v.business_name}" style="width:100%;height:100%;object-fit:cover;"/></div>` : ''}
        <div style="padding:18px;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
            <div>
              <div style="font-size:10px;font-weight:700;color:var(--ink4);text-transform:uppercase;letter-spacing:.8px;margin-bottom:4px;">${v.category}</div>
              <div style="font-family:'DM Serif Display',serif;font-size:18px;font-weight:400;">${v.business_name}</div>
            </div>
            ${v.verified?'<span style="background:#dcfce7;color:#15803d;padding:3px 10px;border-radius:99px;font-size:10px;font-weight:700;">✓ Verified</span>':'<span style="background:#fef9c3;color:#a16207;padding:3px 10px;border-radius:99px;font-size:10px;font-weight:700;">⏳ Pending</span>'}
          </div>
          <div style="font-size:13px;color:var(--ink3);margin-bottom:4px;">📍 ${v.city}</div>
          <div style="font-size:13px;color:${photoCount>0?'var(--sage)':'var(--ink4)'};margin-bottom:14px;">📸 ${photoCount} photo${photoCount!==1?'s':''}</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <a href="/vendors/profile/${v.id}" class="btn btn-outline btn-sm">View</a>
            <a href="/dashboard/vendor/${v.id}" class="btn btn-primary btn-sm">Edit & Photos</a>
            ${v.payment_status!=='paid'?`<a href="/vendors/register" class="btn btn-ghost btn-sm">Pay Now</a>`:''}
          </div>
        </div>
      </div>`;
      }).join('')}
    </div>` : `
    <div style="text-align:center;padding:48px 0;">
      <div style="font-size:44px;margin-bottom:14px;">🏪</div>
      <p style="color:var(--ink3);margin-bottom:18px;">No vendor profiles yet</p>
      <a href="/vendors/register" class="btn btn-primary btn-lg">Create Vendor Profile — €49/yr →</a>
    </div>`}
  </div>

</div>
${renderFooterSimple()}
</body></html>`);
});

// ─────────────────────────────────────
// EVENT EDIT PAGE — WITH PHOTOS
// ─────────────────────────────────────
router.get('/event/:id', requireLogin, (req, res) => {
  const event = db.prepare("SELECT * FROM events WHERE id=? AND user_id=?").get(parseInt(req.params.id), req.session.user.id);
  if (!event) return res.redirect('/dashboard?error=Event not found');

  let photos = [];
  try { photos = JSON.parse(event.photos || '[]'); } catch(e) {}

  res.send(`<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Edit Event — ${event.title} | Festmore</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="/css/main.css"/>
</head><body>
${renderDashNav(req.session.user)}
<div class="container" style="padding:44px 0;max-width:860px;">
  <div style="margin-bottom:24px;display:flex;align-items:center;gap:12px;">
    <a href="/dashboard" style="color:var(--ink3);font-size:14px;">← Dashboard</a>
    <span style="color:var(--ink4);">›</span>
    <span style="font-size:14px;color:var(--ink);">Edit Event</span>
  </div>

  ${req.query.success?`<div class="alert alert-success" style="margin-bottom:20px;">✅ ${req.query.success}</div>`:''}
  ${req.query.error?`<div class="alert alert-error" style="margin-bottom:20px;">⚠️ ${req.query.error}</div>`:''}

  <div style="display:grid;grid-template-columns:1fr 300px;gap:24px;align-items:start;">

    <!-- MAIN FORM -->
    <div>
      <div class="form-card">
        <div class="form-card-header">
          <h2>Edit Event Details</h2>
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
            <div class="form-group"><label class="form-label">Expected Visitors</label><input class="form-input" type="number" name="attendees" value="${event.attendees||0}"/></div>
            <div class="form-group"><label class="form-label">Vendor Spots</label><input class="form-input" type="number" name="vendor_spots" value="${event.vendor_spots||0}"/></div>
            <div class="form-group full"><label class="form-label">Description</label><textarea class="form-input" name="description" rows="5">${event.description||''}</textarea></div>
          </div>
          <div style="margin-top:20px;"><button type="submit" class="btn btn-primary btn-lg">Save Changes →</button></div>
        </form>
      </div>

      <!-- PHOTO UPLOAD -->
      <div class="form-card" style="margin-top:20px;">
        <div class="form-card-header">
          <h2>📸 Event Photos</h2>
          <span style="font-size:13px;color:var(--ink3);">${photos.length}/6 uploaded</span>
        </div>
        <p style="font-size:14px;color:var(--ink3);margin-bottom:20px;line-height:1.65;">
          Upload photos of your event, venue, flyer or past editions. The first photo becomes your main cover image shown in search results.
        </p>
        ${photoUploadHTML('event', event.id, photos, 6)}
      </div>
    </div>

    <!-- SIDEBAR -->
    <aside>
      <!-- EVENT PREVIEW -->
      <div style="background:#fff;border:1px solid var(--border);border-radius:16px;overflow:hidden;margin-bottom:16px;">
        ${(photos.length>0||event.image_url)?`<div style="height:180px;overflow:hidden;"><img src="${photos.length>0?photos[0].url:event.image_url}" alt="${event.title}" style="width:100%;height:100%;object-fit:cover;"/></div>`:'<div style="height:120px;background:var(--ivory);display:flex;align-items:center;justify-content:center;font-size:40px;">🎪</div>'}
        <div style="padding:16px;">
          <div style="font-size:11px;font-weight:700;color:var(--flame);text-transform:uppercase;letter-spacing:.6px;margin-bottom:4px;">${event.category}</div>
          <div style="font-family:'DM Serif Display',serif;font-size:16px;margin-bottom:6px;">${event.title}</div>
          <div style="font-size:13px;color:var(--ink3);margin-bottom:4px;">📍 ${event.city}</div>
          <div style="font-size:13px;color:var(--ink3);">📅 ${event.date_display||event.start_date}</div>
        </div>
      </div>

      <!-- QUICK ACTIONS -->
      <div style="background:#fff;border:1px solid var(--border);border-radius:16px;padding:20px;">
        <h4 style="font-family:'DM Serif Display',serif;font-size:16px;font-weight:400;margin-bottom:14px;">Quick Actions</h4>
        <div style="display:flex;flex-direction:column;gap:8px;">
          <a href="/events/${event.slug}" target="_blank" class="btn btn-outline" style="text-align:center;font-size:13px;">View Live Listing →</a>
          ${event.payment_status!=='paid'?`<a href="/events/pricing" class="btn btn-primary" style="text-align:center;font-size:13px;">Upgrade to Paid →</a>`:''}
          <a href="/dashboard" class="btn btn-ghost" style="text-align:center;font-size:13px;">← Back to Dashboard</a>
        </div>
      </div>

      <!-- PHOTO TIPS -->
      <div style="background:rgba(74,124,89,.07);border:1px solid rgba(74,124,89,.2);border-radius:14px;padding:18px;margin-top:16px;">
        <div style="font-size:13px;font-weight:700;color:var(--sage);margin-bottom:8px;">📸 Photo Tips</div>
        <ul style="font-size:12.5px;color:var(--ink3);line-height:1.8;margin:0;padding-left:16px;">
          <li>Use landscape photos (wider than tall)</li>
          <li>Show your venue and atmosphere</li>
          <li>Upload your event flyer as photo 1</li>
          <li>Real photos get 3x more clicks</li>
          <li>Max 10MB per photo</li>
        </ul>
      </div>
    </aside>
  </div>
</div>
${renderFooterSimple()}
</body></html>`);
});

// ─────────────────────────────────────
// EVENT EDIT POST
// ─────────────────────────────────────
router.post('/event/:id', requireLogin, (req, res) => {
  const { title, city, date_display, price_display, website, ticket_url, attendees, vendor_spots, description } = req.body;
  const eventId = parseInt(req.params.id);
  const event = db.prepare("SELECT id FROM events WHERE id=? AND user_id=?").get(eventId, req.session.user.id);
  if (!event) return res.redirect('/dashboard');
  db.prepare(`UPDATE events SET title=?,city=?,date_display=?,price_display=?,website=?,ticket_url=?,attendees=?,vendor_spots=?,description=? WHERE id=?`)
    .run(title, city, date_display||'', price_display||'Free', website||'', ticket_url||'', parseInt(attendees)||0, parseInt(vendor_spots)||0, description||'', eventId);
  res.redirect(`/dashboard/event/${eventId}?success=Event updated successfully!`);
});

// ─────────────────────────────────────
// VENDOR EDIT PAGE — WITH PHOTOS
// ─────────────────────────────────────
router.get('/vendor/:id', requireLogin, (req, res) => {
  const vendor = db.prepare("SELECT * FROM vendors WHERE id=? AND user_id=?").get(parseInt(req.params.id), req.session.user.id);
  if (!vendor) return res.redirect('/dashboard?error=Vendor not found');

  let photos = [];
  try { photos = JSON.parse(vendor.photos || '[]'); } catch(e) {}

  res.send(`<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Edit Vendor — ${vendor.business_name} | Festmore</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="/css/main.css"/>
</head><body>
${renderDashNav(req.session.user)}
<div class="container" style="padding:44px 0;max-width:860px;">
  <div style="margin-bottom:24px;display:flex;align-items:center;gap:12px;">
    <a href="/dashboard" style="color:var(--ink3);font-size:14px;">← Dashboard</a>
    <span style="color:var(--ink4);">›</span>
    <span style="font-size:14px;color:var(--ink);">Edit Vendor Profile</span>
  </div>

  ${req.query.success?`<div class="alert alert-success" style="margin-bottom:20px;">✅ ${req.query.success}</div>`:''}
  ${req.query.error?`<div class="alert alert-error" style="margin-bottom:20px;">⚠️ ${req.query.error}</div>`:''}

  <div style="display:grid;grid-template-columns:1fr 300px;gap:24px;align-items:start;">

    <!-- MAIN FORM -->
    <div>
      <div class="form-card">
        <div class="form-card-header">
          <h2>Edit Profile Details</h2>
          ${vendor.verified?'<span style="background:#dcfce7;color:#15803d;padding:4px 14px;border-radius:99px;font-size:12px;font-weight:700;">✓ Verified</span>':'<span style="background:#fef9c3;color:#a16207;padding:4px 14px;border-radius:99px;font-size:12px;font-weight:700;">⏳ Pending</span>'}
        </div>
        <form method="POST" action="/dashboard/vendor/${vendor.id}">
          <div class="form-grid">
            <div class="form-group full"><label class="form-label">Business Name *</label><input class="form-input" type="text" name="business_name" required value="${vendor.business_name}"/></div>
            <div class="form-group"><label class="form-label">Category *</label>
              <select class="form-input" name="category" required>
                ${['Food & Drinks','Artisan Crafts','Technology','Event Decor','Entertainment','Photography','Kids Activities','Fashion & Apparel','Art & Prints','Live Music','Retail','Services'].map(c=>`<option value="${c}" ${vendor.category===c?'selected':''}>${c}</option>`).join('')}
              </select>
            </div>
            <div class="form-group"><label class="form-label">Country</label>
              <select class="form-input" name="country">
                ${Object.entries(COUNTRY_NAMES).map(([k,v])=>`<option value="${k}" ${vendor.country===k?'selected':''}>${v}</option>`).join('')}
              </select>
            </div>
            <div class="form-group"><label class="form-label">City</label><input class="form-input" type="text" name="city" value="${vendor.city}"/></div>
            <div class="form-group"><label class="form-label">Email</label><input class="form-input" type="email" name="email" value="${vendor.email||''}"/></div>
            <div class="form-group"><label class="form-label">Phone</label><input class="form-input" type="tel" name="phone" value="${vendor.phone||''}"/></div>
            <div class="form-group"><label class="form-label">Website</label><input class="form-input" type="url" name="website" value="${vendor.website||''}" placeholder="https://"/></div>
            <div class="form-group"><label class="form-label">Year Founded</label><input class="form-input" type="number" name="founded_year" value="${vendor.founded_year||''}"/></div>
            <div class="form-group full"><label class="form-label">About Your Business</label><textarea class="form-input" name="description" rows="5">${vendor.description||''}</textarea></div>
            <div class="form-group"><label class="form-label">Events Attended</label><input class="form-input" type="number" name="events_attended" value="${vendor.events_attended||0}" min="0"/></div>
          </div>
          <div style="margin-top:20px;"><button type="submit" class="btn btn-primary btn-lg" style="background:#4a7c59;">Save Changes →</button></div>
        </form>
      </div>

      <!-- PHOTO UPLOAD -->
      <div class="form-card" style="margin-top:20px;">
        <div class="form-card-header">
          <h2>📸 Business Photos</h2>
          <span style="font-size:13px;color:var(--ink3);">${photos.length}/6 uploaded</span>
        </div>
        <p style="font-size:14px;color:var(--ink3);margin-bottom:20px;line-height:1.65;">
          Show event organisers your stall, trailer, products and setup. Vendors with photos get booked significantly more often than those without.
        </p>
        ${photoUploadHTML('vendor', vendor.id, photos, 6)}
      </div>
    </div>

    <!-- SIDEBAR -->
    <aside>
      <!-- VENDOR PREVIEW -->
      <div style="background:#fff;border:1px solid var(--border);border-radius:16px;overflow:hidden;margin-bottom:16px;">
        ${(photos.length>0||vendor.image_url)?`<div style="height:180px;overflow:hidden;"><img src="${photos.length>0?photos[0].url:vendor.image_url}" alt="${vendor.business_name}" style="width:100%;height:100%;object-fit:cover;"/></div>`:'<div style="height:120px;background:var(--ivory);display:flex;align-items:center;justify-content:center;font-size:40px;">🏪</div>'}
        <div style="padding:16px;">
          <div style="font-size:11px;font-weight:700;color:var(--flame);text-transform:uppercase;letter-spacing:.6px;margin-bottom:4px;">${vendor.category}</div>
          <div style="font-family:'DM Serif Display',serif;font-size:16px;margin-bottom:6px;">${vendor.business_name}</div>
          <div style="font-size:13px;color:var(--ink3);">📍 ${vendor.city}</div>
        </div>
      </div>

      <!-- QUICK ACTIONS -->
      <div style="background:#fff;border:1px solid var(--border);border-radius:16px;padding:20px;margin-bottom:16px;">
        <h4 style="font-family:'DM Serif Display',serif;font-size:16px;font-weight:400;margin-bottom:14px;">Quick Actions</h4>
        <div style="display:flex;flex-direction:column;gap:8px;">
          <a href="/vendors/profile/${vendor.id}" target="_blank" class="btn btn-outline" style="text-align:center;font-size:13px;">View Profile →</a>
          <a href="/events" class="btn btn-primary" style="text-align:center;font-size:13px;background:#4a7c59;">Browse Events →</a>
          <a href="/dashboard" class="btn btn-ghost" style="text-align:center;font-size:13px;">← Dashboard</a>
        </div>
      </div>

      <!-- SUBSCRIPTION -->
      <div style="background:#fff;border:1px solid var(--border);border-radius:16px;padding:20px;">
        <h4 style="font-family:'DM Serif Display',serif;font-size:16px;font-weight:400;margin-bottom:12px;">Subscription</h4>
        <div style="font-size:14px;font-weight:600;color:var(--ink);margin-bottom:4px;">
          ${vendor.payment_status==='paid'?'✅ Active — Verified Vendor':'⚠️ Payment Required'}
        </div>
        <div style="font-size:13px;color:var(--ink3);margin-bottom:14px;">
          ${vendor.payment_status==='paid'?'Your profile is live and visible to event organisers.':'Complete payment to activate your profile.'}
        </div>
        ${vendor.payment_status!=='paid'?`<a href="/vendors/register" class="btn btn-primary" style="display:block;text-align:center;font-size:13px;">Pay €49 to Activate →</a>`:''}
      </div>

      <!-- PHOTO TIPS -->
      <div style="background:rgba(74,124,89,.07);border:1px solid rgba(74,124,89,.2);border-radius:14px;padding:18px;margin-top:16px;">
        <div style="font-size:13px;font-weight:700;color:var(--sage);margin-bottom:8px;">📸 Photo Tips</div>
        <ul style="font-size:12.5px;color:var(--ink3);line-height:1.8;margin:0;padding-left:16px;">
          <li>Show your stall/trailer setup</li>
          <li>Include product close-ups</li>
          <li>Action shots from events work great</li>
          <li>Good lighting is everything</li>
          <li>Max 10MB per photo, JPG or PNG</li>
        </ul>
      </div>
    </aside>
  </div>
</div>
${renderFooterSimple()}
</body></html>`);
});

// ─────────────────────────────────────
// VENDOR EDIT POST
// ─────────────────────────────────────
router.post('/vendor/:id', requireLogin, (req, res) => {
  const { business_name, category, city, country, email, phone, description, website, founded_year, events_attended } = req.body;
  const vendorId = parseInt(req.params.id);
  const vendor = db.prepare("SELECT id FROM vendors WHERE id=? AND user_id=?").get(vendorId, req.session.user.id);
  if (!vendor) return res.redirect('/dashboard');
  db.prepare(`UPDATE vendors SET business_name=?,category=?,city=?,country=?,email=?,phone=?,description=?,website=?,founded_year=?,events_attended=? WHERE id=?`)
    .run(business_name, category, city, country, email||'', phone||'', description||'', website||'', parseInt(founded_year)||0, parseInt(events_attended)||0, vendorId);
  res.redirect(`/dashboard/vendor/${vendorId}?success=Profile updated successfully!`);
});

module.exports = router;

function renderDashNav(user) {
  return `<nav class="main-nav"><div class="nav-inner"><a href="/" class="logo"><span class="logo-fest">Fest</span><span class="logo-more">more</span><span class="logo-dot"></span></a><div style="flex:1;"></div><div class="nav-right"><span style="font-size:13.5px;color:var(--ink3);font-weight:500;">${user.name}</span><a href="/auth/logout" class="btn btn-ghost btn-sm">Logout</a></div></div><div class="nav-cats-bar"><a href="/dashboard" class="nav-cat" style="color:var(--flame);border-bottom:2px solid var(--flame);">📊 Dashboard</a><a href="/events/submit" class="nav-cat">+ List Event</a><a href="/vendors/register" class="nav-cat">+ Vendor Profile</a><a href="/events" class="nav-cat">🌍 Browse Events</a><a href="/vendors" class="nav-cat">🏪 Vendors</a></div></nav>`;
}

function renderFooterSimple() {
  return `<footer><div class="footer-bottom"><span>© ${new Date().getFullYear()} Festmore.com — All rights reserved</span><div style="display:flex;gap:20px;"><a href="/" style="color:rgba(255,255,255,.35);font-size:13px;">Home</a><a href="/events" style="color:rgba(255,255,255,.35);font-size:13px;">Events</a><a href="/vendors" style="color:rgba(255,255,255,.35);font-size:13px;">Vendors</a></div></div></footer>`;
}