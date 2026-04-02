// routes/vendors.js — COMPLETE PROFESSIONAL v3
// ✅ Vendor profile auto-created on registration
// ✅ User account auto-created so they can login
// ✅ Welcome email sent automatically after payment
// ✅ Profile activated immediately on payment success
// ✅ Stripe webhook backup activation
// ✅ Admin can see all vendors
// ✅ Owner sees Edit button on their profile
// ✅ Dashboard with photo upload and delete

const express = require('express');
const router  = express.Router();
const db      = require('../db');
const stripe  = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_live_placeholder');

const FLAGS = {
  BE:'🇧🇪',CN:'🇨🇳',DK:'🇩🇰',FR:'🇫🇷',DE:'🇩🇪',NL:'🇳🇱',PL:'🇵🇱',SE:'🇸🇪',AE:'🇦🇪',GB:'🇬🇧',US:'🇺🇸',
  NO:'🇳🇴',FI:'🇫🇮',AT:'🇦🇹',CH:'🇨🇭',IT:'🇮🇹',ES:'🇪🇸',PT:'🇵🇹',IE:'🇮🇪',CZ:'🇨🇿',HU:'🇭🇺',
  GR:'🇬🇷',HR:'🇭🇷',IN:'🇮🇳',TH:'🇹🇭',JP:'🇯🇵',
};
const COUNTRY_NAMES = {
  BE:'Belgium',CN:'China',DK:'Denmark',FR:'France',DE:'Germany',NL:'Netherlands',PL:'Poland',SE:'Sweden',
  AE:'UAE',GB:'United Kingdom',US:'USA',NO:'Norway',FI:'Finland',AT:'Austria',CH:'Switzerland',IT:'Italy',
  ES:'Spain',PT:'Portugal',IE:'Ireland',CZ:'Czech Republic',HU:'Hungary',GR:'Greece',HR:'Croatia',
  IN:'India',TH:'Thailand',JP:'Japan',
};
const CATS = ['Food & Drinks','Artisan Crafts','Technology','Event Decor','Entertainment','Photography',
  'Kids Activities','Fashion & Apparel','Art & Prints','Live Music','Retail','Services'];
const EVENT_TYPES = ['Festivals','Christmas Markets','Street Markets','Corporate Events','Weddings',
  'Food Markets','Flea Markets','Trade Fairs','Private Parties','Outdoor Events','Indoor Events','All Events'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const CAT_IMGS = {
  'Food & Drinks':'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80',
  'Artisan Crafts':'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=800&q=80',
  'Technology':'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
  'Event Decor':'https://images.unsplash.com/photo-1478146059778-26028b07395a?w=800&q=80',
  'Entertainment':'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
  'Photography':'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&q=80',
  'Kids Activities':'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80',
  'Fashion & Apparel':'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
  'Art & Prints':'https://images.unsplash.com/photo-1580136579312-94651dfd596d?w=800&q=80',
  'Live Music':'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80',
  'Retail':'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800&q=80',
  'Services':'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
};

function vendorImg(v) {
  if (v.photos) { try { const p = JSON.parse(v.photos); if (p && p.length) return p[0]; } catch(e){} }
  return v.image_url || CAT_IMGS[v.category] || CAT_IMGS['Food & Drinks'];
}

// ─── SEND WELCOME EMAIL ───────────────────────────────────────────
// ─── SEND WELCOME EMAIL ───────────────────────────────────────────
async function sendWelcomeEmail(vendor, loginPassword) {
  try {
    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    const year = new Date().getFullYear();
    const firstName = vendor.business_name.split(' ')[0];

    await resend.emails.send({
      from: 'Carla Pont at Festmore <contact@festmore.com>',
      to: vendor.email,
      subject: `You're live on Festmore — here are your login details`,
      html: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Welcome to Festmore</title>
</head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">

<!-- WRAPPER -->
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f0e8;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

  <!-- HEADER -->
  <tr>
    <td style="background:#0a1a0f;border-radius:20px 20px 0 0;padding:48px 48px 40px;text-align:center;">
      <!-- Logo -->
      <div style="margin-bottom:32px;">
        <span style="font-size:28px;font-weight:800;letter-spacing:-1px;">
          <span style="color:#ffffff;">Fest</span><span style="color:#e8470a;">more</span><span style="display:inline-block;width:6px;height:6px;background:#e8470a;border-radius:50%;margin-left:2px;vertical-align:middle;"></span>
        </span>
      </div>
      <!-- Badge -->
      <div style="display:inline-block;background:rgba(74,124,89,0.2);border:1px solid rgba(74,124,89,0.4);border-radius:99px;padding:6px 16px;margin-bottom:24px;">
        <span style="color:#7ec99a;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">✓ Verified Vendor</span>
      </div>
      <!-- Headline -->
      <h1 style="font-size:36px;font-weight:400;color:#ffffff;margin:0 0 12px;line-height:1.2;font-family:Georgia,'Times New Roman',serif;">
        You're live on Festmore
      </h1>
      <p style="font-size:16px;color:rgba(255,255,255,0.55);margin:0;line-height:1.6;">
        Your vendor profile is now visible to thousands of<br/>event organisers across Europe and worldwide.
      </p>
    </td>
  </tr>

  <!-- HERO IMAGE BAR -->
  <tr>
    <td style="background:linear-gradient(135deg,#1a3d28,#0d2518);padding:0;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding:28px 48px;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="text-align:center;padding:0 16px;">
                  <div style="font-size:28px;font-weight:800;color:#ffffff;">174+</div>
                  <div style="font-size:11px;color:rgba(255,255,255,0.45);text-transform:uppercase;letter-spacing:1px;margin-top:4px;">Events</div>
                </td>
                <td style="width:1px;background:rgba(255,255,255,0.1);"></td>
                <td style="text-align:center;padding:0 16px;">
                  <div style="font-size:28px;font-weight:800;color:#ffffff;">26</div>
                  <div style="font-size:11px;color:rgba(255,255,255,0.45);text-transform:uppercase;letter-spacing:1px;margin-top:4px;">Countries</div>
                </td>
                <td style="width:1px;background:rgba(255,255,255,0.1);"></td>
                <td style="text-align:center;padding:0 16px;">
                  <div style="font-size:28px;font-weight:800;color:#e8470a;">€49</div>
                  <div style="font-size:11px;color:rgba(255,255,255,0.45);text-transform:uppercase;letter-spacing:1px;margin-top:4px;">Per Year</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- MAIN CONTENT -->
  <tr>
    <td style="background:#ffffff;padding:48px;">

      <!-- Greeting -->
      <p style="font-size:17px;color:#1a1612;line-height:1.7;margin:0 0 16px;">
        Hi <strong>${vendor.business_name}</strong>,
      </p>
      <p style="font-size:15px;color:#6b5f58;line-height:1.8;margin:0 0 32px;">
        Welcome to Festmore — Europe's fastest-growing event vendor marketplace. Your verified profile is now live and searchable by event organisers across the world. We're thrilled to have you on board.
      </p>

      <!-- LOGIN BOX -->
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:2px solid #86efac;border-radius:16px;margin-bottom:32px;">
        <tr>
          <td style="padding:24px 28px;">
            <div style="font-size:13px;font-weight:700;color:#15803d;text-transform:uppercase;letter-spacing:1px;margin-bottom:16px;">🔐 Your Login Details</div>
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:6px 0;">
                  <span style="font-size:13px;color:#6b7280;width:80px;display:inline-block;">Login:</span>
                  <a href="https://festmore.com/auth/login" style="font-size:13px;color:#15803d;font-weight:600;text-decoration:none;">festmore.com/auth/login</a>
                </td>
              </tr>
              <tr>
                <td style="padding:6px 0;">
                  <span style="font-size:13px;color:#6b7280;width:80px;display:inline-block;">Email:</span>
                  <span style="font-size:13px;color:#1a1612;font-weight:600;">${vendor.email}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:6px 0;">
                  <span style="font-size:13px;color:#6b7280;width:80px;display:inline-block;">Password:</span>
                  <span style="font-size:13px;color:#1a1612;font-weight:700;background:#dcfce7;padding:3px 10px;border-radius:6px;font-family:monospace;">${loginPassword}</span>
                </td>
              </tr>
            </table>
            <p style="font-size:12px;color:#6b7280;margin:14px 0 0;">We recommend changing your password after first login from your dashboard settings.</p>
          </td>
        </tr>
      </table>

      <!-- WHAT TO DO NEXT -->
      <h2 style="font-size:18px;font-weight:700;color:#1a1612;margin:0 0 20px;">Get the most out of Festmore</h2>

      <!-- Step 1 -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
        <tr>
          <td width="48" valign="top">
            <div style="width:40px;height:40px;background:#fff7ed;border-radius:10px;text-align:center;line-height:40px;font-size:20px;">📸</div>
          </td>
          <td style="padding-left:16px;">
            <div style="font-size:14px;font-weight:700;color:#1a1612;margin-bottom:4px;">Add photos to your profile</div>
            <div style="font-size:13px;color:#6b5f58;line-height:1.6;">Vendors with photos receive 3× more enquiries. Upload directly from your phone or computer — no technical knowledge needed.</div>
          </td>
        </tr>
      </table>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
        <tr>
          <td width="48" valign="top">
            <div style="width:40px;height:40px;background:#f0fdf4;border-radius:10px;text-align:center;line-height:40px;font-size:20px;">🎪</div>
          </td>
          <td style="padding-left:16px;">
            <div style="font-size:14px;font-weight:700;color:#1a1612;margin-bottom:4px;">Browse events looking for vendors</div>
            <div style="font-size:13px;color:#6b5f58;line-height:1.6;">174+ festivals, markets and events are listed on Festmore. Browse by country, category and date to find your ideal events.</div>
          </td>
        </tr>
      </table>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
        <tr>
          <td width="48" valign="top">
            <div style="width:40px;height:40px;background:#fef3c7;border-radius:10px;text-align:center;line-height:40px;font-size:20px;">📝</div>
          </td>
          <td style="padding-left:16px;">
            <div style="font-size:14px;font-weight:700;color:#1a1612;margin-bottom:4px;">Complete your profile</div>
            <div style="font-size:13px;color:#6b5f58;line-height:1.6;">Add your availability, event types, setup requirements and social media links. A complete profile ranks higher in search results.</div>
          </td>
        </tr>
      </table>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
        <tr>
          <td width="48" valign="top">
            <div style="width:40px;height:40px;background:#fdf2f8;border-radius:10px;text-align:center;line-height:40px;font-size:20px;">🌍</div>
          </td>
          <td style="padding-left:16px;">
            <div style="font-size:14px;font-weight:700;color:#1a1612;margin-bottom:4px;">Get discovered worldwide</div>
            <div style="font-size:13px;color:#6b5f58;line-height:1.6;">Event organisers from 26 countries can now find and contact you directly through your Festmore profile.</div>
          </td>
        </tr>
      </table>

      <!-- CTA BUTTON -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
        <tr>
          <td align="center">
            <a href="https://festmore.com/auth/login" style="display:inline-block;background:#e8470a;color:#ffffff;padding:16px 40px;border-radius:12px;font-size:16px;font-weight:700;text-decoration:none;letter-spacing:0.3px;">
              Go to Your Dashboard →
            </a>
          </td>
        </tr>
      </table>

      <!-- VIEW PROFILE -->
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf8f3;border-radius:12px;margin-bottom:32px;">
        <tr>
          <td style="padding:20px 24px;">
            <div style="font-size:13px;color:#6b5f58;margin-bottom:8px;">Your public profile is live at:</div>
            <a href="https://festmore.com/vendors" style="font-size:14px;color:#e8470a;font-weight:600;text-decoration:none;">festmore.com/vendors → ${vendor.business_name}</a>
          </td>
        </tr>
      </table>

      <!-- PERSONAL NOTE -->
      <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #f1ede8;padding-top:28px;margin-top:8px;">
        <tr>
          <td>
            <p style="font-size:14px;color:#6b5f58;line-height:1.8;margin:0 0 16px;">
              I personally review every vendor profile on Festmore and I'm always here to help. If you have any questions, want to update something or need assistance — just reply to this email and I'll get back to you personally within a few hours.
            </p>
            <p style="font-size:14px;color:#1a1612;margin:0;">
              Wishing you many bookings and great events,<br/><br/>
              <strong style="font-size:15px;">CarlaPont</strong><br/>
              <span style="color:#6b5f58;font-size:13px;">Founder, Festmore.com</span>
            </p>
          </td>
        </tr>
      </table>

    </td>
  </tr>

  <!-- FOOTER -->
  <tr>
    <td style="background:#1a1612;border-radius:0 0 20px 20px;padding:28px 48px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <span style="font-size:18px;font-weight:800;letter-spacing:-0.5px;">
              <span style="color:#ffffff;">Fest</span><span style="color:#e8470a;">more</span>
            </span>
          </td>
          <td align="right">
            <a href="https://festmore.com/events" style="font-size:12px;color:rgba(255,255,255,0.4);text-decoration:none;margin-left:16px;">Events</a>
            <a href="https://festmore.com/vendors" style="font-size:12px;color:rgba(255,255,255,0.4);text-decoration:none;margin-left:16px;">Vendors</a>
            <a href="https://festmore.com/contact" style="font-size:12px;color:rgba(255,255,255,0.4);text-decoration:none;margin-left:16px;">Contact</a>
          </td>
        </tr>
        <tr>
          <td colspan="2" style="padding-top:16px;border-top:1px solid rgba(255,255,255,0.08);margin-top:16px;">
            <p style="font-size:11px;color:rgba(255,255,255,0.25);margin:0;line-height:1.6;">
              © ${year} Festmore.com · Europe's Event Vendor Marketplace<br/>
              You received this email because you registered as a vendor on Festmore.com.<br/>
              Questions? Reply to this email or contact <a href="mailto:contact@festmore.com" style="color:rgba(255,255,255,0.4);text-decoration:none;">contact@festmore.com</a>
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

</table>
</td></tr>
</table>

</body>
</html>`,
    });
    console.log('✅ Welcome email sent to:', vendor.email);
  } catch(err) {
    console.error('❌ Welcome email failed:', err.message);
  }
}

// ─── ACTIVATE VENDOR ─────────────────────────────────────────────
function activateVendor(vendorId) {
  try {
    db.prepare("UPDATE vendors SET status='active', payment_status='paid', verified=1 WHERE id=?").run(parseInt(vendorId));
    db.prepare("UPDATE payments SET status='completed' WHERE reference_id=?").run(parseInt(vendorId));
    console.log('✅ Vendor activated: ID', vendorId);
    return true;
  } catch(err) {
    console.error('❌ Vendor activation error:', err.message);
    return false;
  }
}

// ─────────────────────────────────────
// VENDORS LISTING
// ─────────────────────────────────────
router.get('/', (req, res) => {
  const { category = 'ALL', country = 'ALL', q = '' } = req.query;
  let where = ["status='active'"], params = [];
  if (category !== 'ALL') { where.push("category=?"); params.push(category); }
  if (country !== 'ALL')  { where.push("country=?");  params.push(country); }
  if (q) { where.push("(business_name LIKE ? OR description LIKE ? OR city LIKE ?)"); params.push(`%${q}%`, `%${q}%`, `%${q}%`); }
  const vendors       = db.prepare(`SELECT * FROM vendors WHERE ${where.join(' AND ')} ORDER BY premium DESC, verified DESC, rating DESC LIMIT 96`).all(...params);
  const countryCounts = db.prepare(`SELECT country, COUNT(*) as count FROM vendors WHERE status='active' GROUP BY country ORDER BY count DESC`).all();
  const totalVendors  = db.prepare(`SELECT COUNT(*) as n FROM vendors WHERE status='active'`).get().n;
  res.send(renderVendorList({ vendors, countryCounts, totalVendors, category, country, q, user: req.session.user }));
});

// ─────────────────────────────────────
// VENDOR PROFILE PAGE
// ─────────────────────────────────────
router.get('/profile/:id', (req, res) => {
  const vendor = db.prepare("SELECT * FROM vendors WHERE id=? AND status='active'").get(parseInt(req.params.id));
  if (!vendor) return res.redirect('/vendors');
  try { db.prepare("UPDATE vendors SET views=views+1 WHERE id=?").run(vendor.id); } catch(e){}
  const related = db.prepare("SELECT * FROM vendors WHERE status='active' AND category=? AND id!=? ORDER BY verified DESC LIMIT 4").all(vendor.category, vendor.id);
  res.send(renderVendorProfile(vendor, related, req.session.user));
});

// ─────────────────────────────────────
// VENDOR DASHBOARD — view & edit own profile
// ─────────────────────────────────────
router.get('/dashboard/:id', (req, res) => {
  if (!req.session.user) return res.redirect('/auth/login?error=Please login to access your dashboard');
  const vendor = db.prepare("SELECT * FROM vendors WHERE id=?").get(parseInt(req.params.id));
  if (!vendor) return res.redirect('/vendors');
  // Only owner or admin can access
  if (vendor.email !== req.session.user.email && req.session.user.role !== 'admin') {
    return res.redirect('/vendors/profile/' + vendor.id);
  }
  let photos = [];
  try { photos = JSON.parse(vendor.photos || '[]'); } catch(e){}
  let extra = {};
  try { extra = JSON.parse(vendor.tags || '{}'); } catch(e){}
  res.send(renderVendorDashboard(vendor, photos, extra, req.session.user, req.query.success, req.query.error));
});

// ─────────────────────────────────────
// VENDOR DASHBOARD — save profile edits
// ─────────────────────────────────────
router.post('/dashboard/:id/save', (req, res) => {
  if (!req.session.user) return res.redirect('/auth/login');
  const vendor = db.prepare("SELECT * FROM vendors WHERE id=?").get(parseInt(req.params.id));
  if (!vendor) return res.redirect('/vendors');
  if (vendor.email !== req.session.user.email && req.session.user.role !== 'admin') {
    return res.redirect('/vendors/profile/' + vendor.id);
  }
  const {
    business_name, city, country, category, description, website, phone, founded_year,
    tagline, price_range, space_required, travel_distance, min_event_size, max_event_size,
    needs_electricity, needs_water, what_we_offer, looking_for, instagram, facebook, tiktok,
    video_url, languages, certifications,
  } = req.body;
  const event_types_wanted = req.body.event_types_wanted
    ? (Array.isArray(req.body.event_types_wanted) ? req.body.event_types_wanted : [req.body.event_types_wanted]) : [];
  const availability = req.body.availability
    ? (Array.isArray(req.body.availability) ? req.body.availability : [req.body.availability]) : [];
  const extra = JSON.stringify({
    tagline, price_range, space_required, travel_distance, min_event_size, max_event_size,
    needs_electricity, needs_water, what_we_offer, looking_for, event_types_wanted, availability,
    instagram, facebook, tiktok, video_url, languages, certifications,
  });
  try {
    db.prepare(`UPDATE vendors SET
      business_name=?, city=?, country=?, category=?, description=?,
      website=?, phone=?, founded_year=?, tags=?, updated_at=datetime('now')
      WHERE id=?
    `).run(
      business_name || vendor.business_name,
      city || vendor.city,
      country || vendor.country,
      category || vendor.category,
      description || vendor.description,
      website || '', phone || '',
      parseInt(founded_year) || vendor.founded_year,
      extra, vendor.id
    );
    res.redirect('/vendors/dashboard/' + vendor.id + '?success=Profile updated successfully!');
  } catch(err) {
    console.error('❌ Profile save error:', err.message);
    res.redirect('/vendors/dashboard/' + vendor.id + '?error=Failed to save. Please try again.');
  }
});

// ─────────────────────────────────────
// VENDOR DASHBOARD — add photo (URL)
// ─────────────────────────────────────
router.post('/dashboard/:id/add-photo', (req, res) => {
  if (!req.session.user) return res.redirect('/auth/login');
  const vendor = db.prepare("SELECT * FROM vendors WHERE id=?").get(parseInt(req.params.id));
  if (!vendor || (vendor.email !== req.session.user.email && req.session.user.role !== 'admin')) {
    return res.redirect('/vendors');
  }
  const { photo_url } = req.body;
  if (!photo_url || !photo_url.startsWith('http')) {
    return res.redirect('/vendors/dashboard/' + vendor.id + '?error=Please enter a valid photo URL');
  }
  let photos = [];
  try { photos = JSON.parse(vendor.photos || '[]'); } catch(e){}
  if (photos.length >= 8) {
    return res.redirect('/vendors/dashboard/' + vendor.id + '?error=Maximum 8 photos allowed. Delete one first.');
  }
  photos.push(photo_url.trim());
  db.prepare("UPDATE vendors SET photos=?, updated_at=datetime('now') WHERE id=?").run(JSON.stringify(photos), vendor.id);
  res.redirect('/vendors/dashboard/' + vendor.id + '?success=Photo added successfully!');
});

// ─────────────────────────────────────
// VENDOR DASHBOARD — delete photo
// ─────────────────────────────────────
router.post('/dashboard/:id/delete-photo', (req, res) => {
  if (!req.session.user) return res.redirect('/auth/login');
  const vendor = db.prepare("SELECT * FROM vendors WHERE id=?").get(parseInt(req.params.id));
  if (!vendor || (vendor.email !== req.session.user.email && req.session.user.role !== 'admin')) {
    return res.redirect('/vendors');
  }
  const { photo_index } = req.body;
  let photos = [];
  try { photos = JSON.parse(vendor.photos || '[]'); } catch(e){}
  const idx = parseInt(photo_index);
  if (!isNaN(idx) && idx >= 0 && idx < photos.length) {
    photos.splice(idx, 1);
    db.prepare("UPDATE vendors SET photos=?, updated_at=datetime('now') WHERE id=?").run(JSON.stringify(photos), vendor.id);
  }
  res.redirect('/vendors/dashboard/' + vendor.id + '?success=Photo deleted.');
});

// ─────────────────────────────────────
// REGISTER — GET
// ─────────────────────────────────────
router.get('/register', (req, res) => {
  res.send(renderRegisterPage(req.session.user, req.query.success, req.query.error));
});

// ─────────────────────────────────────
// REGISTER — POST
// ─────────────────────────────────────
router.post('/register', async (req, res) => {
  const {
    business_name, category, city, country, description, website, phone, email, founded_year,
    tagline, price_range, min_event_size, max_event_size, space_required, needs_electricity,
    needs_water, travel_distance, what_we_offer, looking_for, instagram, facebook, tiktok,
    video_url, languages, certifications,
  } = req.body;

  const event_types_wanted = req.body.event_types_wanted
    ? (Array.isArray(req.body.event_types_wanted) ? req.body.event_types_wanted : [req.body.event_types_wanted]) : [];
  const availability = req.body.availability
    ? (Array.isArray(req.body.availability) ? req.body.availability : [req.body.availability]) : [];

  if (!business_name || !category || !city || !country || !email) {
    return res.redirect('/vendors/register?error=Please fill in all required fields including email');
  }

  const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  let slug = slugify(business_name + '-' + city);
  let i = 1;
  while (db.prepare('SELECT id FROM vendors WHERE slug=?').get(slug)) {
    slug = slugify(business_name + '-' + city) + '-' + i++;
  }

  const extra = JSON.stringify({
    tagline, price_range, min_event_size, max_event_size, space_required,
    needs_electricity, needs_water, travel_distance, what_we_offer, looking_for,
    event_types_wanted, availability, instagram, facebook, tiktok, video_url,
    languages, certifications,
  });

  // ── Step 1: CREATE VENDOR PROFILE ──
  let vendorId;
  try {
    const result = db.prepare(`
      INSERT INTO vendors (
        business_name, slug, category, city, country, description, website,
        phone, email, founded_year, status, payment_status, verified, premium, tags
      ) VALUES (?,?,?,?,?,?,?,?,?,?,'pending','unpaid',0,0,?)
    `).run(
      business_name, slug, category, city, country,
      description || '', website || '', phone || '', email || '',
      parseInt(founded_year) || 0, extra
    );
    vendorId = result.lastInsertRowid;
    console.log('✅ Vendor profile created:', business_name, 'ID:', vendorId);
  } catch(err) {
    console.error('❌ Vendor creation failed:', err.message);
    return res.redirect('/vendors/register?error=Something went wrong saving your profile. Please try again or email contact@festmore.com');
  }

  // ── Step 2: CREATE USER ACCOUNT ──
  try {
    const bcrypt = require('bcryptjs');
    const namePart = business_name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase().substring(0, 6);
    const tempPassword = namePart + Math.floor(1000 + Math.random() * 9000);
    const hash = bcrypt.hashSync(tempPassword, 10);
    db.prepare(`INSERT OR IGNORE INTO users (email, password, name, role) VALUES (?,?,?,'vendor')`).run(email, hash, business_name);
    // Store temp password temporarily so we can include it in welcome email
    db.prepare("UPDATE vendors SET short_desc=? WHERE id=?").run(tempPassword, vendorId);
    console.log('✅ User account created for:', email);
  } catch(err) {
    console.error('⚠️ User account creation failed (non-critical):', err.message);
  }

  // ── Step 3: STRIPE PAYMENT ──
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'Festmore Verified Vendor Profile',
            description: `Annual verified vendor profile for ${business_name} on Festmore.com`,
          },
          unit_amount: parseInt(process.env.PRICE_VENDOR_YEARLY) || 4900,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: 'https://festmore.com/vendors/payment-success?vendor_id=' + vendorId,
      cancel_url: 'https://festmore.com/vendors/register?error=Payment+cancelled',
      metadata: { vendor_id: String(vendorId), type: 'vendor_profile' },
      customer_email: email || undefined,
    });
    db.prepare(`INSERT OR IGNORE INTO payments (stripe_session_id,amount,type,status,reference_id) VALUES (?,?,?,?,?)`)
      .run(session.id, parseInt(process.env.PRICE_VENDOR_YEARLY) || 4900, 'vendor_profile', 'pending', vendorId);
    res.redirect(session.url);
  } catch(err) {
    console.error('❌ Stripe error:', err.message);
    res.redirect('/vendors/register?error=Payment+unavailable.+Please+try+again.');
  }
});

// ─────────────────────────────────────
// PAYMENT SUCCESS
// ─────────────────────────────────────
router.get('/payment-success', async (req, res) => {
  const { vendor_id } = req.query;
  if (vendor_id) {
    activateVendor(vendor_id);
    try {
      const vendor = db.prepare("SELECT * FROM vendors WHERE id=?").get(parseInt(vendor_id));
      if (vendor) {
        const loginPassword = vendor.short_desc || 'festmore2026';
        await sendWelcomeEmail(vendor, loginPassword);
        // Clear temp password from short_desc
        try { db.prepare("UPDATE vendors SET short_desc=NULL WHERE id=?").run(parseInt(vendor_id)); } catch(e){}
      }
    } catch(err) {
      console.error('⚠️ Post-payment tasks error:', err.message);
    }
  }
  const vendor = vendor_id ? db.prepare("SELECT * FROM vendors WHERE id=?").get(parseInt(vendor_id)) : null;
  res.send(`<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Welcome to Festmore! 🎉</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="/css/main.css"/>
</head><body style="background:var(--cream);min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px;">
<div style="max-width:620px;width:100%;margin:0 auto;text-align:center;">
  <div style="font-size:72px;margin-bottom:20px;">🎉</div>
  <h1 style="font-family:'DM Serif Display',serif;font-size:40px;font-weight:400;margin-bottom:12px;">You're a Verified Vendor!</h1>
  <p style="color:var(--ink3);font-size:16px;line-height:1.75;margin-bottom:28px;">
    Your professional profile is now live on Festmore.<br/>
    <strong>Check your email</strong> — we've sent your login details to <strong>${vendor?.email || 'your email address'}</strong>.
  </p>
  ${vendor ? `
  <div style="background:#fff;border:1px solid var(--border);border-radius:20px;padding:24px;margin-bottom:20px;text-align:left;">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
      <div style="width:48px;height:48px;border-radius:12px;background:#4a7c59;display:flex;align-items:center;justify-content:center;font-size:20px;">🏪</div>
      <div>
        <div style="font-size:18px;font-weight:700;">${vendor.business_name}</div>
        <div style="font-size:13px;color:var(--ink3);">${vendor.city} · ${vendor.category}</div>
      </div>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;">
      <span style="background:#dcfce7;color:#15803d;padding:4px 14px;border-radius:99px;font-size:12px;font-weight:700;">✅ Verified Profile</span>
      <span style="background:rgba(232,71,10,.08);color:var(--flame);padding:4px 14px;border-radius:99px;font-size:12px;font-weight:700;">🌍 Worldwide Visibility</span>
    </div>
  </div>` : ''}
  <div style="background:var(--ivory);border:1px solid var(--border);border-radius:16px;padding:20px;margin-bottom:28px;text-align:left;">
    <h3 style="font-size:15px;font-weight:700;margin-bottom:14px;">What to do next:</h3>
    ${['Check your email for your login details','Login and add photos to your profile','Browse 174+ events and apply to festivals','Get discovered by event organisers worldwide'].map(s => `
    <div style="display:flex;align-items:center;gap:10px;padding:8px 0;font-size:14px;color:var(--ink2);">
      <span style="color:var(--sage);font-weight:700;font-size:16px;">✅</span> ${s}
    </div>`).join('')}
  </div>
  <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
    <a href="/auth/login" class="btn btn-primary btn-lg">Login to Dashboard →</a>
    ${vendor ? `<a href="/vendors/profile/${vendor.id}" class="btn btn-outline btn-lg">View Your Profile</a>` : ''}
  </div>
</div>
</body></html>`);
});

// ─────────────────────────────────────
// STRIPE WEBHOOK — backup activation
// ─────────────────────────────────────
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch(err) {
    console.error('Webhook error:', err.message);
    return res.status(400).send('Webhook Error');
  }
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const vendorId = session.metadata?.vendor_id;
    if (vendorId && session.metadata?.type === 'vendor_profile') {
      const activated = activateVendor(vendorId);
      if (activated) {
        try {
          const vendor = db.prepare("SELECT * FROM vendors WHERE id=?").get(parseInt(vendorId));
          if (vendor) {
            const loginPassword = vendor.short_desc || 'festmore2026';
            await sendWelcomeEmail(vendor, loginPassword);
            try { db.prepare("UPDATE vendors SET short_desc=NULL WHERE id=?").run(parseInt(vendorId)); } catch(e){}
          }
        } catch(err) { console.error('⚠️ Webhook email error:', err.message); }
      }
    }
  }
  res.json({ received: true });
});

module.exports = router;

// ═══════════════════════════════════════════════════════
// RENDER FUNCTIONS
// ═══════════════════════════════════════════════════════

function renderNav(user) {
  return `<nav class="main-nav">
  <div class="nav-inner">
    <a href="/" class="logo"><span class="logo-fest">Fest</span><span class="logo-more">more</span><span class="logo-dot"></span></a>
    <form class="nav-search" action="/events" method="GET"><span style="color:var(--ink4);font-size:15px;">🔍</span><input type="text" name="q" placeholder="Search events…"/></form>
    <div class="nav-right">
      ${user ? `<a href="/dashboard" class="btn btn-outline btn-sm">Dashboard</a><a href="/auth/logout" class="btn btn-ghost btn-sm">Logout</a>` : `<a href="/auth/login" class="btn btn-outline btn-sm">Login</a><a href="/events/submit" class="btn btn-primary btn-sm">+ List Event</a>`}
    </div>
    <button class="nav-burger" onclick="document.querySelector('.nav-mobile').classList.toggle('open')">☰</button>
  </div>
  <div class="nav-cats-bar">
    <a href="/events" class="nav-cat">🌍 All</a>
    <a href="/events?category=festival" class="nav-cat">🎪 Festivals</a>
    <a href="/events?category=market" class="nav-cat">🛍️ Markets</a>
    <a href="/events?category=christmas" class="nav-cat">🎄 Xmas Markets</a>
    <a href="/events?category=concert" class="nav-cat">🎵 Concerts</a>
    <a href="/articles" class="nav-cat">📰 Articles</a>
    <a href="/vendors" class="nav-cat">🏪 Vendors</a>
    <a href="/about" class="nav-cat">ℹ️ About</a>
    <a href="/contact" class="nav-cat">✉️ Contact</a>
  </div>
  <div class="nav-mobile">
    <a href="/events">All Events</a><a href="/articles">Articles</a><a href="/vendors">Vendors</a>
    <a href="/about">About</a><a href="/contact">Contact</a><a href="/events/submit">+ List Event</a>
    ${user ? `<a href="/dashboard">Dashboard</a><a href="/auth/logout">Logout</a>` : `<a href="/auth/login">Login</a>`}
  </div>
</nav>`;
}

function renderFooterSimple() {
  return `<footer><div class="footer-bottom">
  <span>© ${new Date().getFullYear()} Festmore.com — All rights reserved</span>
  <div style="display:flex;gap:20px;flex-wrap:wrap;">
    <a href="/" style="color:rgba(255,255,255,.35);font-size:13px;">Home</a>
    <a href="/events" style="color:rgba(255,255,255,.35);font-size:13px;">Events</a>
    <a href="/vendors" style="color:rgba(255,255,255,.35);font-size:13px;">Vendors</a>
    <a href="/about" style="color:rgba(255,255,255,.35);font-size:13px;">About</a>
    <a href="/contact" style="color:rgba(255,255,255,.35);font-size:13px;">Contact</a>
    <a href="/privacy" style="color:rgba(255,255,255,.35);font-size:13px;">Privacy</a>
  </div>
</div></footer>`;
}

// ─── VENDOR DASHBOARD PAGE ────────────────────────────────────────
function renderVendorDashboard(vendor, photos, extra, user, success, error) {
  const IS = `width:100%;background:#fff;border:1.5px solid var(--border2);border-radius:10px;padding:12px 14px;font-size:14px;outline:none;box-sizing:border-box;font-family:inherit;`;
  const LS = `font-size:12px;font-weight:700;color:var(--ink3);text-transform:uppercase;letter-spacing:.8px;display:block;margin-bottom:6px;`;
  const img = vendorImg(vendor);
  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Edit Profile — ${vendor.business_name} | Festmore</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="/css/main.css"/>
<style>
.dash-layout{display:grid;grid-template-columns:280px 1fr;gap:32px;padding:40px 0;align-items:start;}
.dash-sidebar{background:#fff;border:1px solid var(--border);border-radius:20px;overflow:hidden;position:sticky;top:20px;}
.dash-nav-item{display:flex;align-items:center;gap:10px;padding:13px 20px;font-size:14px;font-weight:500;color:var(--ink3);text-decoration:none;transition:all .2s;border-left:3px solid transparent;}
.dash-nav-item:hover,.dash-nav-item.active{background:rgba(232,71,10,.04);color:var(--flame);border-left-color:var(--flame);}
.section-card{background:#fff;border:1px solid var(--border);border-radius:20px;padding:28px;margin-bottom:24px;}
.section-title{font-family:'DM Serif Display',serif;font-size:20px;font-weight:400;margin-bottom:20px;padding-bottom:14px;border-bottom:2px solid var(--border);}
.photo-item{position:relative;border-radius:12px;overflow:hidden;aspect-ratio:1;}
.photo-item img{width:100%;height:100%;object-fit:cover;}
.photo-delete{position:absolute;top:6px;right:6px;background:rgba(220,38,38,.9);color:#fff;border:none;border-radius:8px;padding:4px 8px;font-size:11px;font-weight:700;cursor:pointer;}
.photo-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px;}
@media(max-width:900px){.dash-layout{grid-template-columns:1fr;}.photo-grid{grid-template-columns:repeat(3,1fr);}}
textarea{resize:vertical;min-height:100px;}
.checkbox-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:8px;}
.checkbox-item{display:flex;align-items:center;gap:8px;background:var(--ivory);border:1.5px solid var(--border);border-radius:8px;padding:10px 12px;cursor:pointer;}
.checkbox-item input{accent-color:var(--flame);}
</style>
</head><body style="background:var(--cream);">
${renderNav(user)}
<div class="container" style="max-width:1100px;">
  <div style="padding:20px 0 0;font-size:13px;color:var(--ink3);">
    <a href="/vendors" style="color:var(--ink3);text-decoration:none;">Vendors</a> →
    <a href="/vendors/profile/${vendor.id}" style="color:var(--ink3);text-decoration:none;"> ${vendor.business_name}</a> →
    <strong style="color:var(--ink);"> Edit Profile</strong>
  </div>
  <div class="dash-layout">
    <!-- SIDEBAR -->
    <aside class="dash-sidebar">
      <div style="padding:24px;text-align:center;border-bottom:1px solid var(--border);">
        <div style="width:80px;height:80px;border-radius:16px;overflow:hidden;margin:0 auto 12px;border:2px solid var(--border);">
          <img src="${img}" style="width:100%;height:100%;object-fit:cover;" alt="${vendor.business_name}"/>
        </div>
        <div style="font-weight:700;font-size:15px;margin-bottom:4px;">${vendor.business_name}</div>
        <div style="font-size:12px;color:var(--ink3);">${vendor.city} · ${vendor.category}</div>
        <div style="margin-top:10px;">
          ${vendor.verified ? '<span style="background:#dcfce7;color:#15803d;padding:3px 10px;border-radius:99px;font-size:11px;font-weight:700;">✅ Verified</span>' : '<span style="background:#fef9c3;color:#a16207;padding:3px 10px;border-radius:99px;font-size:11px;font-weight:700;">Pending</span>'}
        </div>
      </div>
      <div style="padding:12px 0;">
        <a href="#photos" class="dash-nav-item">📸 Photos</a>
        <a href="#profile" class="dash-nav-item">✏️ Edit Profile</a>
        <a href="#details" class="dash-nav-item">📋 Details & Setup</a>
        <a href="#social" class="dash-nav-item">🔗 Social Media</a>
        <a href="/vendors/profile/${vendor.id}" class="dash-nav-item">👁️ View Public Profile</a>
        <a href="/dashboard" class="dash-nav-item">🏠 My Dashboard</a>
      </div>
      <div style="padding:16px 20px;border-top:1px solid var(--border);">
        <div style="font-size:11px;color:var(--ink4);font-weight:700;text-transform:uppercase;margin-bottom:6px;">Profile Stats</div>
        <div style="font-size:13px;color:var(--ink3);">👁️ ${vendor.views || 0} profile views</div>
        <div style="font-size:13px;color:var(--ink3);">📸 ${photos.length}/8 photos</div>
      </div>
    </aside>

    <!-- MAIN CONTENT -->
    <main>
      ${success ? `<div style="background:#dcfce7;border:1px solid #86efac;border-radius:12px;padding:14px 18px;margin-bottom:20px;font-size:14px;color:#15803d;font-weight:600;">✅ ${success}</div>` : ''}
      ${error ? `<div style="background:#fee2e2;border:1px solid #fca5a5;border-radius:12px;padding:14px 18px;margin-bottom:20px;font-size:14px;color:#dc2626;font-weight:600;">⚠️ ${error}</div>` : ''}

      <!-- PHOTOS SECTION -->
      <div class="section-card" id="photos">
        <h2 class="section-title">📸 Your Photos <span style="font-size:13px;font-weight:400;color:var(--ink3);font-family:'DM Sans',sans-serif;">(${photos.length}/8 uploaded)</span></h2>
        <p style="font-size:13px;color:var(--ink3);margin-bottom:20px;">Vendors with photos get 3× more enquiries. Add photos of your stall, products, food truck or previous events.</p>

        ${photos.length > 0 ? `
        <div class="photo-grid">
          ${photos.map((p, i) => `
          <div class="photo-item">
            <img src="${p}" alt="Photo ${i+1}"/>
            <script>
async function uploadFiles(files, id, type) {
  const prog = document.getElementById('upload-progress-' + id);
  prog.style.display = 'block';
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    prog.innerHTML = '<div style="background:#fff;border:1px solid var(--border);border-radius:10px;padding:12px 16px;font-size:13px;">⏳ Uploading ' + file.name + ' (' + (i+1) + '/' + files.length + ')...</div>';
    const formData = new FormData();
    formData.append('photo', file);
    try {
      const res = await fetch('/upload/vendor/' + id, { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        prog.innerHTML = '<div style="background:#dcfce7;border:1px solid #86efac;border-radius:10px;padding:12px 16px;font-size:13px;color:#15803d;">✅ Uploaded! Refreshing...</div>';
        setTimeout(() => window.location.reload(), 800);
      } else {
        prog.innerHTML = '<div style="background:#fee2e2;border:1px solid #fca5a5;border-radius:10px;padding:12px 16px;font-size:13px;color:#dc2626;">❌ ' + (data.error || 'Upload failed') + '</div>';
      }
    } catch(err) {
      prog.innerHTML = '<div style="background:#fee2e2;border:1px solid #fca5a5;border-radius:10px;padding:12px 16px;font-size:13px;color:#dc2626;">❌ Upload failed. Please try again.</div>';
    }
  }
}
async function handleDrop(event, id, type) {
  event.preventDefault();
  const zone = document.getElementById('upload-zone-' + id);
  if (zone) { zone.style.borderColor = 'var(--border2)'; zone.style.background = 'var(--ivory)'; }
  if (event.dataTransfer.files.length) await uploadFiles(event.dataTransfer.files, id, type);
}
async function deletePhoto(index, id, type) {
  if (!confirm('Delete this photo?')) return;
  const res = await fetch('/upload/' + type + '/' + id + '/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ index })
  });
  const data = await res.json();
  if (data.success) window.location.reload();
  else alert('Failed to delete photo');
}
</script>
           <button class="photo-delete" onclick="deletePhoto(${i},'${vendor.id}','vendor')">✕ Delete</button>
          </div>`).join('')}
        </div>` : `
        <div style="background:var(--ivory);border:1.5px dashed var(--border2);border-radius:12px;padding:32px;text-align:center;margin-bottom:20px;">
          <div style="font-size:36px;margin-bottom:12px;">📸</div>
          <p style="font-size:14px;color:var(--ink3);">No photos yet — add your first photo below</p>
        </div>`}

       ${photos.length < 8 ? `
        <div id="upload-zone-${vendor.id}" style="border:2px dashed var(--border2);border-radius:14px;padding:32px;text-align:center;cursor:pointer;transition:all .2s;background:var(--ivory);" ondragover="event.preventDefault();this.style.borderColor='var(--flame)';this.style.background='rgba(232,71,10,.04)'" ondragleave="this.style.borderColor='var(--border2)';this.style.background='var(--ivory)'" ondrop="handleDrop(event,'${vendor.id}','vendor')">
          <div style="font-size:40px;margin-bottom:12px;">📸</div>
          <div style="font-size:15px;font-weight:700;color:var(--ink);margin-bottom:6px;">Drag & drop photos here</div>
          <div style="font-size:13px;color:var(--ink3);margin-bottom:16px;">or click to select from your computer or phone</div>
          <button type="button" onclick="document.getElementById('fileInput${vendor.id}').click()" class="btn btn-primary" style="padding:12px 28px;">Choose Photos →</button>
          <input type="file" id="fileInput${vendor.id}" accept="image/jpeg,image/png,image/webp" multiple style="display:none;" onchange="uploadFiles(this.files,'${vendor.id}','vendor')"/>
          <div style="font-size:11px;color:var(--ink4);margin-top:12px;">JPG, PNG or WebP · Max 10MB per photo · Up to 8 photos total</div>
        </div>
        <div id="upload-progress-${vendor.id}" style="display:none;margin-top:16px;"></div>` : `
        <div style="background:#fef9c3;border:1px solid #f59e0b;border-radius:10px;padding:12px 16px;font-size:13px;color:#92400e;">
          Maximum 8 photos reached. Delete a photo to add a new one.
        </div>`}
      </div>

      <!-- EDIT PROFILE SECTION -->
      <form method="POST" action="/vendors/dashboard/${vendor.id}/save">
        <div class="section-card" id="profile">
          <h2 class="section-title">✏️ Edit Profile</h2>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
            <div style="grid-column:1/-1;margin-bottom:16px;"><label style="${LS}">Business Name</label><input type="text" name="business_name" value="${vendor.business_name}" style="${IS}"/></div>
            <div style="margin-bottom:16px;"><label style="${LS}">Category</label>
              <select name="category" style="${IS}">${CATS.map(c => `<option value="${c}" ${vendor.category===c?'selected':''}>${c}</option>`).join('')}</select>
            </div>
            <div style="margin-bottom:16px;"><label style="${LS}">Country</label>
              <select name="country" style="${IS}">${Object.entries(COUNTRY_NAMES).map(([k, v]) => `<option value="${k}" ${vendor.country===k?'selected':''}>${FLAGS[k]} ${v}</option>`).join('')}</select>
            </div>
            <div style="margin-bottom:16px;"><label style="${LS}">City</label><input type="text" name="city" value="${vendor.city}" style="${IS}"/></div>
            <div style="margin-bottom:16px;"><label style="${LS}">Year Founded</label><input type="number" name="founded_year" value="${vendor.founded_year||''}" placeholder="e.g. 2015" style="${IS}"/></div>
            <div style="grid-column:1/-1;margin-bottom:16px;"><label style="${LS}">Tagline</label><input type="text" name="tagline" value="${extra.tagline||''}" placeholder="One line that sells you" style="${IS}" maxlength="100"/></div>
            <div style="grid-column:1/-1;margin-bottom:16px;"><label style="${LS}">About Your Business</label><textarea name="description" style="${IS}" rows="5">${vendor.description||''}</textarea></div>
            <div style="grid-column:1/-1;margin-bottom:16px;"><label style="${LS}">What You Offer</label><textarea name="what_we_offer" style="${IS}" rows="4" placeholder="What exactly do you offer at events?">${extra.what_we_offer||''}</textarea></div>
            <div style="grid-column:1/-1;margin-bottom:16px;"><label style="${LS}">What You're Looking For</label><textarea name="looking_for" style="${IS}" rows="3" placeholder="Describe your ideal event">${extra.looking_for||''}</textarea></div>
          </div>
        </div>

        <div class="section-card" id="details">
          <h2 class="section-title">📋 Details & Setup</h2>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
            <div style="margin-bottom:16px;"><label style="${LS}">Price Range</label>
              <select name="price_range" style="${IS}">
                <option value="">Select…</option>
                ${['€ Budget','€€ Mid-range','€€€ Premium','Contact for pricing'].map(p => `<option value="${p}" ${extra.price_range===p?'selected':''}>${p}</option>`).join('')}
              </select>
            </div>
            <div style="margin-bottom:16px;"><label style="${LS}">Travel Distance</label>
              <select name="travel_distance" style="${IS}">
                <option value="">Select…</option>
                ${['Local only (50km)','Regional (200km)','National','Anywhere in Europe','Worldwide'].map(t => `<option value="${t}" ${extra.travel_distance===t?'selected':''}>${t}</option>`).join('')}
              </select>
            </div>
            <div style="margin-bottom:16px;"><label style="${LS}">Space Required</label>
              <select name="space_required" style="${IS}">
                <option value="">Select…</option>
                ${['1×1m (very small)','2×2m (small stall)','3×3m (standard stall)','4×4m (large stall)','6×3m (food truck)','10×5m (large setup)','Flexible'].map(s => `<option value="${s}" ${extra.space_required===s?'selected':''}>${s}</option>`).join('')}
              </select>
            </div>
            <div style="margin-bottom:16px;"><label style="${LS}">Min. Event Size</label><input type="number" name="min_event_size" value="${extra.min_event_size||''}" placeholder="e.g. 500 visitors" style="${IS}"/></div>
            <div style="margin-bottom:16px;"><label style="${LS}">Needs Electricity?</label>
              <select name="needs_electricity" style="${IS}">
                <option value="no" ${extra.needs_electricity!=='yes'?'selected':''}>No electricity needed</option>
                <option value="yes" ${extra.needs_electricity==='yes'?'selected':''}>Yes — needs power</option>
              </select>
            </div>
            <div style="margin-bottom:16px;"><label style="${LS}">Needs Water?</label>
              <select name="needs_water" style="${IS}">
                <option value="no" ${extra.needs_water!=='yes'?'selected':''}>No water needed</option>
                <option value="yes" ${extra.needs_water==='yes'?'selected':''}>Yes — needs water</option>
              </select>
            </div>
            <div style="grid-column:1/-1;margin-bottom:16px;"><label style="${LS}">Languages Spoken</label><input type="text" name="languages" value="${extra.languages||''}" placeholder="e.g. English, Italian, Dutch" style="${IS}"/></div>
            <div style="grid-column:1/-1;margin-bottom:16px;"><label style="${LS}">Certifications & Licences</label><input type="text" name="certifications" value="${extra.certifications||''}" placeholder="e.g. Food hygiene certified, Public liability insurance" style="${IS}"/></div>
          </div>

          <div style="margin-bottom:16px;"><label style="${LS}">Preferred Event Types</label>
            <div class="checkbox-grid">
              ${EVENT_TYPES.map(t => {
                const checked = extra.event_types_wanted && (Array.isArray(extra.event_types_wanted) ? extra.event_types_wanted : [extra.event_types_wanted]).includes(t);
                return `<label class="checkbox-item"><input type="checkbox" name="event_types_wanted" value="${t}" ${checked?'checked':''}/><span style="font-size:13px;">${t}</span></label>`;
              }).join('')}
            </div>
          </div>

          <div style="margin-bottom:16px;"><label style="${LS}">Available Months</label>
            <div class="checkbox-grid">
              ${MONTHS.map(m => {
                const checked = extra.availability && (Array.isArray(extra.availability) ? extra.availability : [extra.availability]).includes(m);
                return `<label class="checkbox-item"><input type="checkbox" name="availability" value="${m}" ${checked?'checked':''}/><span style="font-size:13px;">${m}</span></label>`;
              }).join('')}
            </div>
          </div>
        </div>

        <div class="section-card" id="social">
          <h2 class="section-title">🔗 Contact & Social Media</h2>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
            <div style="margin-bottom:16px;"><label style="${LS}">Website</label><input type="url" name="website" value="${vendor.website||''}" placeholder="https://your-website.com" style="${IS}"/></div>
            <div style="margin-bottom:16px;"><label style="${LS}">Phone</label><input type="tel" name="phone" value="${vendor.phone||''}" placeholder="+31 12 345 6789" style="${IS}"/></div>
            <div style="margin-bottom:16px;"><label style="${LS}">📸 Instagram</label><input type="text" name="instagram" value="${extra.instagram||''}" placeholder="@yourhandle" style="${IS}"/></div>
            <div style="margin-bottom:16px;"><label style="${LS}">👥 Facebook</label><input type="text" name="facebook" value="${extra.facebook||''}" placeholder="facebook.com/yourpage" style="${IS}"/></div>
            <div style="margin-bottom:16px;"><label style="${LS}">🎵 TikTok</label><input type="text" name="tiktok" value="${extra.tiktok||''}" placeholder="@yourhandle" style="${IS}"/></div>
            <div style="margin-bottom:16px;"><label style="${LS}">🎬 Video URL</label><input type="url" name="video_url" value="${extra.video_url||''}" placeholder="https://youtube.com/..." style="${IS}"/></div>
          </div>
        </div>

        <div style="display:flex;gap:12px;justify-content:flex-end;margin-bottom:40px;">
          <a href="/vendors/profile/${vendor.id}" class="btn btn-outline">Cancel</a>
          <button type="submit" class="btn btn-primary" style="padding:14px 36px;font-size:15px;">Save Changes →</button>
        </div>
      </form>
    </main>
  </div>
</div>
${renderFooterSimple()}
</body></html>`;
}

// ─── VENDOR LISTING PAGE ─────────────────────────────────────────
function renderVendorList({ vendors, countryCounts, totalVendors, category, country, q, user }) {
  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Verified Event Vendors Worldwide | Festmore</title>
<meta name="description" content="Browse ${totalVendors}+ verified vendors for festivals, markets and events. Food vendors, artisans, photographers and more worldwide."/>
<meta name="robots" content="index,follow"/>
<link rel="canonical" href="https://festmore.com/vendors"/>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/>
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2486135003689222" crossorigin="anonymous"></script>
<link rel="stylesheet" href="/css/main.css"/>
<style>
.vendor-hero{background:#0a0a0a;padding:72px 0;position:relative;overflow:hidden;}
.vendor-hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 60% 80% at 80% 50%,rgba(74,124,89,.2) 0%,transparent 70%);}
.country-tabs{background:#fff;border-bottom:2px solid var(--border);position:sticky;top:0;z-index:100;box-shadow:0 2px 12px rgba(26,22,18,.06);}
.country-tabs-inner{max-width:1440px;margin:0 auto;padding:0 40px;display:flex;overflow-x:auto;scrollbar-width:none;}
.country-tabs-inner::-webkit-scrollbar{display:none;}
.country-tab{display:flex;align-items:center;gap:8px;padding:16px 22px;font-size:13px;font-weight:600;color:var(--ink3);border-bottom:3px solid transparent;margin-bottom:-2px;white-space:nowrap;text-decoration:none;transition:all .2s;flex-shrink:0;}
.country-tab.active{color:var(--flame);border-bottom-color:var(--flame);}
.tab-count{background:var(--ivory);color:var(--ink4);font-size:10px;font-weight:700;padding:2px 7px;border-radius:99px;}
.country-tab.active .tab-count{background:rgba(232,71,10,.1);color:var(--flame);}
.vendors-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:22px;}
.vcard{background:#fff;border:1px solid var(--border);border-radius:20px;overflow:hidden;transition:all .25s;cursor:pointer;display:flex;flex-direction:column;}
.vcard:hover{border-color:var(--flame);box-shadow:0 20px 60px rgba(26,22,18,.1);transform:translateY(-4px);}
.vcard-img{height:210px;position:relative;overflow:hidden;flex-shrink:0;}
.vcard-img img{width:100%;height:100%;object-fit:cover;transition:transform .4s;}
.vcard:hover .vcard-img img{transform:scale(1.05);}
.vcard-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(26,22,18,.7) 0%,transparent 60%);}
.vcard-country{position:absolute;top:12px;left:12px;background:rgba(255,255,255,.95);backdrop-filter:blur(8px);border-radius:99px;padding:4px 10px;font-size:12px;font-weight:700;}
.vcard-badges{position:absolute;top:12px;right:12px;display:flex;flex-direction:column;gap:4px;align-items:flex-end;}
.vcard-price{position:absolute;bottom:12px;right:12px;background:rgba(26,22,18,.8);color:#fff;padding:3px 10px;border-radius:99px;font-size:11px;font-weight:700;}
.vcard-body{padding:20px;flex:1;display:flex;flex-direction:column;}
.vcard-cat{font-size:11px;font-weight:700;color:var(--flame);text-transform:uppercase;letter-spacing:.8px;margin-bottom:5px;}
.vcard-name{font-family:'DM Serif Display',serif;font-size:20px;font-weight:400;color:var(--ink);margin-bottom:4px;line-height:1.2;}
.vcard-tagline{font-size:13px;color:var(--ink3);font-style:italic;margin-bottom:6px;}
.vcard-loc{font-size:13px;color:var(--ink3);margin-bottom:10px;}
.vcard-desc{font-size:13px;color:var(--ink3);line-height:1.6;margin-bottom:12px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;flex:1;}
.vcard-tags{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:10px;}
.vcard-tag{background:var(--ivory);border:1px solid var(--border);color:var(--ink3);padding:2px 8px;border-radius:99px;font-size:10px;font-weight:600;}
.vcard-footer{display:flex;justify-content:space-between;align-items:center;padding-top:12px;border-top:1px solid var(--border);margin-top:auto;}
@media(max-width:768px){.vendors-grid{grid-template-columns:1fr 1fr;}}
@media(max-width:480px){.vendors-grid{grid-template-columns:1fr;}}
</style>
</head><body>
${renderNav(user)}
<div class="vendor-hero">
  <div class="container" style="position:relative;max-width:900px;">
    <div style="display:inline-flex;align-items:center;gap:8px;background:rgba(74,124,89,.15);border:1px solid rgba(74,124,89,.3);color:#7ec99a;font-size:11px;font-weight:700;padding:4px 14px;border-radius:99px;margin-bottom:20px;letter-spacing:.8px;text-transform:uppercase;">
      <span style="width:5px;height:5px;border-radius:50%;background:#7ec99a;display:inline-block;"></span>
      ${totalVendors}+ Verified Vendors Worldwide
    </div>
    <h1 style="font-family:'DM Serif Display',serif;font-size:clamp(32px,5vw,56px);font-weight:400;color:#fff;margin-bottom:16px;line-height:1.08;">
      Find the Perfect Vendor<br/>for <em style="color:#7ec99a;">Your Event</em>
    </h1>
    <p style="color:rgba(255,255,255,.55);font-size:17px;line-height:1.75;max-width:560px;margin-bottom:32px;">
      Browse verified food vendors, artisans, entertainers, photographers and more — ready to join your festival or market worldwide.
    </p>
    <div style="display:flex;gap:12px;flex-wrap:wrap;">
      <a href="/vendors/register" style="display:inline-flex;align-items:center;gap:8px;background:#4a7c59;color:#fff;padding:13px 28px;border-radius:12px;font-size:14px;font-weight:700;text-decoration:none;">🏪 Become a Vendor — €49/yr</a>
      <a href="/events" style="display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.1);color:#fff;border:1.5px solid rgba(255,255,255,.2);padding:13px 28px;border-radius:12px;font-size:14px;font-weight:600;text-decoration:none;">🎪 Browse Events</a>
    </div>
  </div>
</div>
<div class="country-tabs"><div class="country-tabs-inner">
  <a href="/vendors${category!=='ALL'?'?category='+encodeURIComponent(category):''}" class="country-tab ${country==='ALL'?'active':''}">🌍 All <span class="tab-count">${totalVendors}</span></a>
  ${countryCounts.map(c => `<a href="/vendors?country=${c.country}${category!=='ALL'?'&category='+encodeURIComponent(category):''}" class="country-tab ${country===c.country?'active':''}">${FLAGS[c.country]||'🌍'} ${COUNTRY_NAMES[c.country]||c.country} <span class="tab-count">${c.count}</span></a>`).join('')}
</div></div>
<div class="container" style="padding:40px 0;">
  <form method="GET" action="/vendors" style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-bottom:28px;">
    <input type="hidden" name="country" value="${country}"/>
    <div style="flex:2;min-width:200px;position:relative;">
      <span style="position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--ink4);">🔍</span>
      <input type="text" name="q" value="${q}" placeholder="Search vendors, cities…" style="width:100%;background:#fff;border:1.5px solid var(--border2);border-radius:10px;padding:11px 14px 11px 40px;font-size:14px;outline:none;box-sizing:border-box;"/>
    </div>
    <select name="category" style="background:#fff;border:1.5px solid var(--border2);border-radius:10px;padding:11px 16px;font-size:14px;outline:none;min-width:160px;">
      <option value="ALL" ${category==='ALL'?'selected':''}>All Categories</option>
      ${CATS.map(c => `<option value="${c}" ${category===c?'selected':''}>${c}</option>`).join('')}
    </select>
    <button type="submit" class="btn btn-primary" style="padding:11px 24px;">Search</button>
    ${q||category!=='ALL' ? `<a href="/vendors?country=${country}" style="color:var(--ink3);font-size:13px;">Clear</a>` : ''}
  </form>
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
    <div style="font-size:14px;color:var(--ink3);">
      <strong style="color:var(--ink);">${vendors.length}</strong> vendors
      ${country!=='ALL' ? ` in <strong>${FLAGS[country]||''} ${COUNTRY_NAMES[country]||country}</strong>` : ''}
      ${category!=='ALL' ? ` — <strong>${category}</strong>` : ''}
    </div>
    <a href="/vendors/register" class="btn btn-primary btn-sm">+ Add Your Business</a>
  </div>
  <ins class="adsbygoogle" style="display:block;margin-bottom:24px;" data-ad-client="ca-pub-2486135003689222" data-ad-format="auto" data-full-width-responsive="true"></ins>
  <script>(adsbygoogle=window.adsbygoogle||[]).push({});</script>
  ${vendors.length === 0
    ? `<div style="text-align:center;padding:80px 20px;background:#fff;border-radius:20px;border:1px solid var(--border);">
        <div style="font-size:48px;margin-bottom:16px;">🔍</div>
        <h2 style="font-family:'DM Serif Display',serif;font-size:24px;font-weight:400;margin-bottom:8px;">No vendors found</h2>
        <p style="color:var(--ink3);margin-bottom:24px;">Be the first vendor in this category!</p>
        <a href="/vendors/register" class="btn btn-primary">Register as Vendor →</a>
       </div>`
    : `<div class="vendors-grid">${vendors.map(v => vendorCardHTML(v)).join('')}</div>`}
  <div style="margin-top:56px;background:var(--ink);border-radius:24px;padding:48px 40px;display:grid;grid-template-columns:1fr auto;gap:32px;align-items:center;">
    <div>
      <h2 style="font-family:'DM Serif Display',serif;font-size:28px;font-weight:400;color:#fff;margin-bottom:10px;">Are you a vendor looking for events?</h2>
      <p style="color:rgba(255,255,255,.5);font-size:15px;line-height:1.7;">Create your professional verified profile and get discovered worldwide. €49/year — less than €5/month.</p>
    </div>
    <div style="flex-shrink:0;">
      <a href="/vendors/register" class="btn btn-primary" style="white-space:nowrap;background:#4a7c59;">Create Vendor Profile →</a>
    </div>
  </div>
</div>
${renderFooterSimple()}</body></html>`;
}

function vendorCardHTML(v) {
  const img = vendorImg(v), flag = FLAGS[v.country]||'🌍', cn = COUNTRY_NAMES[v.country]||v.country;
  let extra = {};
  try { extra = JSON.parse(v.tags || '{}'); } catch(e){}
  return `<article class="vcard" onclick="window.location='/vendors/profile/${v.id}'">
  <div class="vcard-img">
    <img src="${img}" alt="${v.business_name}" loading="lazy"/>
    <div class="vcard-overlay"></div>
    <div class="vcard-country">${flag} ${cn}</div>
    <div class="vcard-badges">
      ${v.premium ? '<span style="background:linear-gradient(135deg,#c9922a,#e8b84b);color:#fff;padding:3px 10px;border-radius:99px;font-size:11px;font-weight:700;">⭐ Premium</span>' : ''}
      ${v.verified ? '<span style="background:#dcfce7;color:#15803d;padding:3px 10px;border-radius:99px;font-size:11px;font-weight:700;">✅ Verified</span>' : '<span style="background:#f1f5f9;color:#94a3b8;padding:3px 10px;border-radius:99px;font-size:11px;font-weight:700;">Unverified</span>'}
    </div>
    ${extra.price_range ? `<div class="vcard-price">${extra.price_range}</div>` : ''}
  </div>
  <div class="vcard-body">
    <div class="vcard-cat">${v.category}</div>
    <div class="vcard-name">${v.business_name}</div>
    ${extra.tagline ? `<div class="vcard-tagline">"${extra.tagline}"</div>` : ''}
    <div class="vcard-loc">📍 ${v.city}, ${cn}</div>
    ${v.description ? `<div class="vcard-desc">${v.description}</div>` : ''}
    ${extra.event_types_wanted && extra.event_types_wanted.length ? `<div class="vcard-tags">${(Array.isArray(extra.event_types_wanted)?extra.event_types_wanted:[extra.event_types_wanted]).slice(0,3).map(t=>`<span class="vcard-tag">🎪 ${t}</span>`).join('')}</div>` : ''}
    <div class="vcard-footer">
      <div style="display:flex;gap:8px;">
        ${v.events_attended ? `<span style="font-size:12px;color:var(--ink4);">🎪 ${v.events_attended} events</span>` : ''}
        ${extra.travel_distance ? `<span style="font-size:12px;color:var(--ink4);">✈️ ${extra.travel_distance}</span>` : ''}
      </div>
      <span style="font-size:13px;color:var(--flame);font-weight:700;">View →</span>
    </div>
  </div>
</article>`;
}

// ─── VENDOR PROFILE PAGE ─────────────────────────────────────────
function renderVendorProfile(v, related, user) {
  const img = vendorImg(v), flag = FLAGS[v.country]||'🌍', cn = COUNTRY_NAMES[v.country]||v.country;
  let extra = {};
  try { extra = JSON.parse(v.tags || '{}'); } catch(e){}
  let photos = [];
  try { photos = JSON.parse(v.photos || '[]'); } catch(e){}
  const isOwner = user && (user.email === v.email || user.role === 'admin');

  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${v.business_name} — ${v.category} Vendor in ${v.city} | Festmore</title>
<meta name="description" content="${v.business_name} is a verified ${v.category} vendor in ${v.city}, ${cn}. ${(v.description||'').substring(0,130)}"/>
<meta property="og:title" content="${v.business_name} — Festmore Verified Vendor"/>
<meta property="og:image" content="${img}"/>
<link rel="canonical" href="https://festmore.com/vendors/profile/${v.id}"/>
<script type="application/ld+json">${JSON.stringify({
  "@context":"https://schema.org","@type":"LocalBusiness",
  "name":v.business_name,"description":v.description||'',
  "address":{"@type":"PostalAddress","addressLocality":v.city,"addressCountry":v.country},
  "url":v.website||`https://festmore.com/vendors/profile/${v.id}`,"image":img
})}</script>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/>
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2486135003689222" crossorigin="anonymous"></script>
<link rel="stylesheet" href="/css/main.css"/>
<style>
.profile-hero{height:420px;position:relative;overflow:hidden;}
.profile-hero img{width:100%;height:100%;object-fit:cover;}
.profile-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(26,22,18,.95) 0%,rgba(26,22,18,.3) 70%,transparent 100%);}
.profile-content{position:absolute;bottom:0;left:0;right:0;padding:40px;}
.profile-grid{display:grid;grid-template-columns:1fr 360px;gap:40px;padding:48px 0;align-items:start;}
.pcard{background:#fff;border:1px solid var(--border);border-radius:20px;padding:28px;margin-bottom:16px;}
.pcard-title{font-family:'DM Serif Display',serif;font-size:20px;font-weight:400;margin-bottom:20px;padding-bottom:14px;border-bottom:2px solid var(--border);}
.pstat{display:flex;align-items:flex-start;gap:12px;padding:12px 0;border-bottom:1px solid var(--border);}
.pstat:last-child{border-bottom:none;}
.pstat-icon{width:36px;height:36px;border-radius:9px;background:rgba(232,71,10,.07);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;}
.pstat-label{font-size:11px;font-weight:700;color:var(--ink4);text-transform:uppercase;letter-spacing:.6px;margin-bottom:2px;}
.pstat-value{font-size:14px;color:var(--ink2);font-weight:500;}
.photo-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:16px;}
.photo-grid img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:10px;cursor:pointer;transition:transform .2s;}
.photo-grid img:hover{transform:scale(1.03);}
.info-pill{display:inline-flex;align-items:center;gap:4px;background:var(--ivory);border:1px solid var(--border);color:var(--ink2);padding:5px 12px;border-radius:99px;font-size:12px;font-weight:600;margin:3px;}
.social-link{display:inline-flex;align-items:center;gap:6px;background:var(--ivory);border:1px solid var(--border);color:var(--ink2);padding:8px 14px;border-radius:10px;font-size:13px;font-weight:600;text-decoration:none;transition:all .2s;margin:4px;}
.social-link:hover{border-color:var(--flame);color:var(--flame);}
@media(max-width:900px){.profile-grid{grid-template-columns:1fr;}.profile-content{padding:24px;}.photo-grid{grid-template-columns:repeat(2,1fr);}}
</style>
</head><body>
${renderNav(user)}

<div style="background:var(--ivory);border-bottom:1px solid var(--border);padding:12px 0;">
  <div class="container" style="font-size:13px;color:var(--ink3);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
    <div>
      <a href="/" style="color:var(--ink3);text-decoration:none;">Home</a> →
      <a href="/vendors" style="color:var(--ink3);text-decoration:none;"> Vendors</a> →
      <a href="/vendors?country=${v.country}" style="color:var(--ink3);text-decoration:none;"> ${flag} ${cn}</a> →
      <strong style="color:var(--ink);"> ${v.business_name}</strong>
    </div>
    ${isOwner ? `<a href="/vendors/dashboard/${v.id}" class="btn btn-primary btn-sm">✏️ Edit Your Profile</a>` : ''}
  </div>
</div>

<div class="profile-hero">
  <img src="${img}" alt="${v.business_name}"/>
  <div class="profile-overlay"></div>
  <div class="profile-content"><div class="container">
    <div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap;">
      <span style="background:rgba(255,255,255,.15);color:#fff;padding:4px 12px;border-radius:99px;font-size:12px;font-weight:700;">${v.category}</span>
      ${v.verified ? '<span style="background:#dcfce7;color:#15803d;padding:4px 12px;border-radius:99px;font-size:12px;font-weight:700;">✅ Verified Vendor</span>' : ''}
      ${v.premium ? '<span style="background:linear-gradient(135deg,#c9922a,#e8b84b);color:#fff;padding:4px 12px;border-radius:99px;font-size:12px;font-weight:700;">⭐ Premium</span>' : ''}
      ${extra.price_range ? `<span style="background:rgba(255,255,255,.15);color:#fff;padding:4px 12px;border-radius:99px;font-size:12px;font-weight:700;">${extra.price_range}</span>` : ''}
    </div>
    <h1 style="font-family:'DM Serif Display',serif;font-size:clamp(28px,4vw,52px);font-weight:400;color:#fff;margin-bottom:8px;">${v.business_name}</h1>
    ${extra.tagline ? `<p style="color:rgba(255,255,255,.7);font-size:16px;font-style:italic;margin-bottom:10px;">"${extra.tagline}"</p>` : ''}
    <div style="display:flex;gap:20px;flex-wrap:wrap;color:rgba(255,255,255,.65);font-size:14px;">
      <span>📍 ${flag} ${v.city}, ${cn}</span>
      ${v.events_attended ? `<span>🎪 ${v.events_attended} events</span>` : ''}
      ${v.founded_year ? `<span>📅 Est. ${v.founded_year}</span>` : ''}
      ${extra.travel_distance ? `<span>✈️ ${extra.travel_distance}</span>` : ''}
    </div>
  </div></div>
</div>

<div class="container" style="max-width:1100px;">
  <div class="profile-grid">
    <div>
      <ins class="adsbygoogle" style="display:block;margin-bottom:24px;" data-ad-client="ca-pub-2486135003689222" data-ad-format="auto" data-full-width-responsive="true"></ins>
      <script>(adsbygoogle=window.adsbygoogle||[]).push({});</script>

      ${isOwner ? `
      <div style="background:#fffbeb;border:2px solid #f59e0b;border-radius:16px;padding:20px 24px;margin-bottom:20px;">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
          <div>
            <div style="font-weight:700;font-size:14px;color:#92400e;margin-bottom:4px;">🏪 This is your vendor profile</div>
            <div style="font-size:13px;color:#78350f;">Add photos, update your description and manage everything from your dashboard.</div>
          </div>
          <a href="/vendors/dashboard/${v.id}" class="btn btn-primary btn-sm">✏️ Edit Profile & Add Photos →</a>
        </div>
      </div>` : ''}

      <div class="pcard">
        <h2 class="pcard-title">About ${v.business_name}</h2>
        <div style="font-size:15px;line-height:1.9;color:var(--ink2);">${(v.description || 'No description available.').replace(/\n/g, '<br/>')}</div>
      </div>

      ${extra.what_we_offer ? `
      <div class="pcard">
        <h2 class="pcard-title">What We Offer</h2>
        <div style="font-size:15px;line-height:1.9;color:var(--ink2);">${extra.what_we_offer.replace(/\n/g,'<br/>')}</div>
      </div>` : ''}

      ${photos.length ? `
      <div class="pcard">
        <h2 class="pcard-title">Photos (${photos.length})</h2>
        <div class="photo-grid">
          ${photos.map((p, i) => `<img src="${p}" alt="${v.business_name} photo ${i+1}" loading="lazy" onclick="openPhoto('${p}')"/>`).join('')}
        </div>
      </div>` : ''}

      ${extra.looking_for || (extra.event_types_wanted && extra.event_types_wanted.length) ? `
      <div class="pcard">
        <h2 class="pcard-title">What We're Looking For</h2>
        ${extra.looking_for ? `<div style="font-size:15px;line-height:1.9;color:var(--ink2);margin-bottom:16px;">${extra.looking_for.replace(/\n/g,'<br/>')}</div>` : ''}
        ${extra.event_types_wanted && extra.event_types_wanted.length ? `
        <div style="margin-bottom:16px;">
          <div style="font-size:12px;font-weight:700;color:var(--ink4);text-transform:uppercase;margin-bottom:8px;">Preferred Event Types</div>
          ${(Array.isArray(extra.event_types_wanted)?extra.event_types_wanted:[extra.event_types_wanted]).map(t=>`<span class="info-pill">🎪 ${t}</span>`).join('')}
        </div>` : ''}
        ${extra.availability && extra.availability.length ? `
        <div>
          <div style="font-size:12px;font-weight:700;color:var(--ink4);text-transform:uppercase;margin-bottom:8px;">Available Months</div>
          ${(Array.isArray(extra.availability)?extra.availability:[extra.availability]).map(m=>`<span class="info-pill">📅 ${m}</span>`).join('')}
        </div>` : ''}
      </div>` : ''}

      ${extra.space_required || extra.min_event_size ? `
      <div class="pcard">
        <h2 class="pcard-title">Setup & Requirements</h2>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          ${extra.space_required ? `<div style="background:var(--ivory);border-radius:12px;padding:14px;"><div style="font-size:11px;font-weight:700;color:var(--ink4);text-transform:uppercase;margin-bottom:4px;">Space Required</div><div style="font-size:14px;font-weight:600;">${extra.space_required}</div></div>` : ''}
          ${extra.min_event_size ? `<div style="background:var(--ivory);border-radius:12px;padding:14px;"><div style="font-size:11px;font-weight:700;color:var(--ink4);text-transform:uppercase;margin-bottom:4px;">Min. Event Size</div><div style="font-size:14px;font-weight:600;">${extra.min_event_size} visitors</div></div>` : ''}
          ${extra.max_event_size ? `<div style="background:var(--ivory);border-radius:12px;padding:14px;"><div style="font-size:11px;font-weight:700;color:var(--ink4);text-transform:uppercase;margin-bottom:4px;">Max. Event Size</div><div style="font-size:14px;font-weight:600;">${extra.max_event_size} visitors</div></div>` : ''}
          ${extra.travel_distance ? `<div style="background:var(--ivory);border-radius:12px;padding:14px;"><div style="font-size:11px;font-weight:700;color:var(--ink4);text-transform:uppercase;margin-bottom:4px;">Travel Distance</div><div style="font-size:14px;font-weight:600;">${extra.travel_distance}</div></div>` : ''}
        </div>
        ${extra.needs_electricity === 'yes' || extra.needs_water === 'yes' ? `<div style="margin-top:12px;">${extra.needs_electricity==='yes'?'<span class="info-pill">⚡ Needs Electricity</span>':''}${extra.needs_water==='yes'?'<span class="info-pill">💧 Needs Water</span>':''}</div>` : ''}
      </div>` : ''}

      ${extra.instagram || extra.facebook || extra.tiktok || extra.video_url ? `
      <div class="pcard">
        <h2 class="pcard-title">Find Us Online</h2>
        ${extra.instagram ? `<a href="https://instagram.com/${extra.instagram.replace('@','')}" target="_blank" rel="nofollow noopener" class="social-link">📸 Instagram</a>` : ''}
        ${extra.facebook ? `<a href="${extra.facebook.startsWith('http')?extra.facebook:'https://facebook.com/'+extra.facebook}" target="_blank" rel="nofollow noopener" class="social-link">👥 Facebook</a>` : ''}
        ${extra.tiktok ? `<a href="https://tiktok.com/@${extra.tiktok.replace('@','')}" target="_blank" rel="nofollow noopener" class="social-link">🎵 TikTok</a>` : ''}
        ${extra.video_url ? `<a href="${extra.video_url}" target="_blank" rel="nofollow noopener" class="social-link">🎬 Watch Video</a>` : ''}
      </div>` : ''}

      ${related.length ? `
      <div>
        <h3 style="font-family:'DM Serif Display',serif;font-size:20px;font-weight:400;margin-bottom:20px;">Similar Vendors</h3>
        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:16px;">
          ${related.map(r => `
          <a href="/vendors/profile/${r.id}" style="background:#fff;border:1px solid var(--border);border-radius:16px;overflow:hidden;text-decoration:none;transition:all .2s;" onmouseover="this.style.borderColor='var(--flame)'" onmouseout="this.style.borderColor='var(--border)'">
            <div style="height:120px;overflow:hidden;"><img src="${vendorImg(r)}" alt="${r.business_name}" style="width:100%;height:100%;object-fit:cover;"/></div>
            <div style="padding:14px;">
              <div style="font-size:11px;font-weight:700;color:var(--flame);text-transform:uppercase;margin-bottom:3px;">${r.category}</div>
              <div style="font-size:15px;font-weight:600;color:var(--ink);">${r.business_name}</div>
              <div style="font-size:12px;color:var(--ink3);">${FLAGS[r.country]||''} ${r.city}</div>
            </div>
          </a>`).join('')}
        </div>
      </div>` : ''}
    </div>

    <aside>
      <div class="pcard">
        <h3 class="pcard-title">Vendor Details</h3>
        <div class="pstat"><div class="pstat-icon">📍</div><div><div class="pstat-label">Location</div><div class="pstat-value">${v.city}, ${cn}</div></div></div>
        <div class="pstat"><div class="pstat-icon">🏷️</div><div><div class="pstat-label">Category</div><div class="pstat-value">${v.category}</div></div></div>
        ${extra.price_range ? `<div class="pstat"><div class="pstat-icon">💰</div><div><div class="pstat-label">Price Range</div><div class="pstat-value">${extra.price_range}</div></div></div>` : ''}
        ${v.founded_year ? `<div class="pstat"><div class="pstat-icon">📅</div><div><div class="pstat-label">Founded</div><div class="pstat-value">${v.founded_year}</div></div></div>` : ''}
        ${v.events_attended ? `<div class="pstat"><div class="pstat-icon">🎪</div><div><div class="pstat-label">Events Attended</div><div class="pstat-value">${v.events_attended}</div></div></div>` : ''}
        ${extra.travel_distance ? `<div class="pstat"><div class="pstat-icon">✈️</div><div><div class="pstat-label">Travel Distance</div><div class="pstat-value">${extra.travel_distance}</div></div></div>` : ''}
        ${extra.languages ? `<div class="pstat"><div class="pstat-icon">🗣️</div><div><div class="pstat-label">Languages</div><div class="pstat-value">${extra.languages}</div></div></div>` : ''}
        ${extra.certifications ? `<div class="pstat"><div class="pstat-icon">📋</div><div><div class="pstat-label">Certifications</div><div class="pstat-value">${extra.certifications}</div></div></div>` : ''}
        <div class="pstat"><div class="pstat-icon">✅</div><div><div class="pstat-label">Status</div><div class="pstat-value" style="color:${v.verified?'#15803d':'#94a3b8'};">${v.verified ? '✅ Verified Vendor' : 'Unverified'}</div></div></div>
        ${v.website ? `<a href="${v.website}" target="_blank" rel="nofollow noopener" class="btn btn-primary" style="display:block;text-align:center;margin-top:20px;">Visit Website →</a>` : ''}
        ${v.phone ? `<a href="tel:${v.phone}" class="btn btn-outline" style="display:block;text-align:center;margin-top:8px;">📞 ${v.phone}</a>` : ''}
        <button onclick="shareVendor()" class="btn btn-ghost" style="width:100%;margin-top:8px;">Share Profile 🔗</button>
      </div>

      <div style="background:linear-gradient(135deg,#0d1f15,#1a3d28);border:1px solid rgba(74,124,89,.3);border-radius:16px;padding:24px;margin-bottom:16px;">
        <h4 style="font-family:'DM Serif Display',serif;font-size:17px;font-weight:400;color:#fff;margin-bottom:8px;">Looking for event spots?</h4>
        <p style="font-size:13px;color:rgba(255,255,255,.55);margin-bottom:16px;">Browse events with available vendor spots and apply directly to organisers.</p>
        <a href="/events" class="btn btn-primary" style="display:block;text-align:center;">Browse Events →</a>
      </div>

      <ins class="adsbygoogle" style="display:block;" data-ad-client="ca-pub-2486135003689222" data-ad-format="auto" data-full-width-responsive="true"></ins>
      <script>(adsbygoogle=window.adsbygoogle||[]).push({});</script>
    </aside>
  </div>
</div>

<div id="lightbox" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.95);z-index:9999;align-items:center;justify-content:center;" onclick="this.style.display='none'">
  <img id="lightbox-img" style="max-width:90vw;max-height:90vh;border-radius:12px;"/>
</div>

${renderFooterSimple()}
<script>
function shareVendor() {
  if (navigator.share) { navigator.share({ title: '${v.business_name}', url: window.location.href }); }
  else { navigator.clipboard.writeText(window.location.href); alert('Link copied!'); }
}
function openPhoto(src) {
  document.getElementById('lightbox-img').src = src;
  document.getElementById('lightbox').style.display = 'flex';
}
</script>
</body></html>`;
}

// ─── REGISTER PAGE ───────────────────────────────────────────────
function renderRegisterPage(user, success, error) {
  const IS = `width:100%;background:#fff;border:1.5px solid var(--border2);border-radius:10px;padding:12px 14px;font-size:14px;outline:none;box-sizing:border-box;font-family:inherit;`;
  const LS = `font-size:12px;font-weight:700;color:var(--ink3);text-transform:uppercase;letter-spacing:.8px;display:block;margin-bottom:6px;`;
  const GS = `margin-bottom:20px;`;
  const SS = `background:#fff;border:1px solid var(--border);border-radius:20px;padding:32px;margin-bottom:20px;`;
  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Register as a Vendor — Festmore</title>
<meta name="description" content="Create your professional verified vendor profile on Festmore. Get discovered by event organisers worldwide for just €49/year."/>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="/css/main.css"/>
<style>
.wyg{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:32px;}
.wyg-card{background:#fff;border:1px solid var(--border);border-radius:14px;padding:18px;text-align:center;}
.checkbox-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;}
.checkbox-item{display:flex;align-items:center;gap:8px;background:var(--ivory);border:1.5px solid var(--border);border-radius:8px;padding:10px 12px;cursor:pointer;transition:all .2s;}
.checkbox-item:hover{border-color:var(--flame);}
.checkbox-item input[type=checkbox]{accent-color:var(--flame);}
textarea{resize:vertical;min-height:100px;}
@media(max-width:600px){.wyg{grid-template-columns:1fr;}.checkbox-grid{grid-template-columns:1fr;}}
</style>
</head><body>
${renderNav(user)}
<div style="background:linear-gradient(135deg,#0d1f15,#1a3d28);padding:64px 0;position:relative;overflow:hidden;">
  <div style="position:absolute;inset:0;background:radial-gradient(ellipse 60% 80% at 80% 50%,rgba(74,124,89,.3) 0%,transparent 70%);"></div>
  <div class="container" style="position:relative;max-width:860px;text-align:center;">
    <div style="display:inline-flex;align-items:center;gap:8px;background:rgba(74,124,89,.2);border:1px solid rgba(74,124,89,.4);color:#7ec99a;font-size:11px;font-weight:700;padding:4px 14px;border-radius:99px;margin-bottom:20px;letter-spacing:.8px;text-transform:uppercase;">🏪 Become a Verified Vendor</div>
    <h1 style="font-family:'DM Serif Display',serif;font-size:clamp(28px,4vw,52px);font-weight:400;color:#fff;margin-bottom:14px;">Create Your Professional Vendor Profile</h1>
    <p style="color:rgba(255,255,255,.55);font-size:16px;line-height:1.75;max-width:600px;margin:0 auto;">One profile. Worldwide visibility. Login details sent to your email instantly after payment.</p>
  </div>
</div>
<div class="container" style="padding:48px 0;max-width:860px;">
  ${error ? `<div class="alert alert-error" style="margin-bottom:24px;">⚠️ ${error}</div>` : ''}
  <div class="wyg">
    ${[
      ['✅','Verified Badge','Stand out — organisers trust verified vendors'],
      ['🌍','Worldwide Visibility','Seen by organisers across 26 countries'],
      ['🎪','Apply to Events','Apply directly to festivals with open spots'],
      ['📸','Photo Gallery','Upload up to 8 photos of your business'],
      ['📧','Login Details by Email','Access your dashboard instantly after payment'],
      ['📊','Your Dashboard','Edit profile, add photos, manage everything'],
    ].map(([i, t, d]) => `<div class="wyg-card"><div style="font-size:28px;margin-bottom:8px;">${i}</div><div style="font-size:14px;font-weight:700;margin-bottom:4px;">${t}</div><div style="font-size:12px;color:var(--ink3);line-height:1.5;">${d}</div></div>`).join('')}
  </div>

  <form method="POST" action="/vendors/register">
    <div style="${SS}">
      <h2 style="font-family:'DM Serif Display',serif;font-size:22px;font-weight:400;margin-bottom:6px;">1. Business Identity</h2>
      <p style="font-size:13px;color:var(--ink3);margin-bottom:24px;padding-bottom:20px;border-bottom:1px solid var(--border);">Tell organisers who you are and what makes your business unique.</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
        <div style="${GS}grid-column:1/-1;"><label style="${LS}">Business Name *</label><input type="text" name="business_name" required placeholder="e.g. Nordic Street Food Co." style="${IS}"/></div>
        <div style="${GS}"><label style="${LS}">Category *</label><select name="category" required style="${IS}"><option value="">Select category…</option>${CATS.map(c=>`<option value="${c}">${c}</option>`).join('')}</select></div>
        <div style="${GS}"><label style="${LS}">Price Range</label><select name="price_range" style="${IS}"><option value="">Select…</option><option>€ Budget</option><option>€€ Mid-range</option><option>€€€ Premium</option><option>Contact for pricing</option></select></div>
        <div style="${GS}"><label style="${LS}">Country *</label><select name="country" required style="${IS}"><option value="">Select country…</option>${Object.entries(COUNTRY_NAMES).map(([k,v])=>`<option value="${k}">${FLAGS[k]} ${v}</option>`).join('')}</select></div>
        <div style="${GS}"><label style="${LS}">City *</label><input type="text" name="city" required placeholder="e.g. Amsterdam" style="${IS}"/></div>
        <div style="${GS}"><label style="${LS}">Year Founded</label><input type="number" name="founded_year" placeholder="e.g. 2018" style="${IS}"/></div>
        <div style="${GS}"><label style="${LS}">Languages Spoken</label><input type="text" name="languages" placeholder="e.g. English, Italian, Dutch" style="${IS}"/></div>
        <div style="${GS}grid-column:1/-1;"><label style="${LS}">Tagline</label><input type="text" name="tagline" placeholder="e.g. Authentic Italian wine and food for any event" style="${IS}" maxlength="100"/></div>
        <div style="${GS}grid-column:1/-1;"><label style="${LS}">About Your Business *</label><textarea name="description" required placeholder="Describe your business — your story, products, experience and what makes you stand out…" style="${IS}" rows="4"></textarea></div>
      </div>
    </div>

    <div style="${SS}">
      <h2 style="font-family:'DM Serif Display',serif;font-size:22px;font-weight:400;margin-bottom:6px;">2. What You Offer</h2>
      <p style="font-size:13px;color:var(--ink3);margin-bottom:24px;padding-bottom:20px;border-bottom:1px solid var(--border);">Be specific — organisers want to know exactly what they get when they book you.</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
        <div style="${GS}grid-column:1/-1;"><label style="${LS}">Detailed Description of Your Offer</label><textarea name="what_we_offer" placeholder="What exactly do you offer? Products, services, setup, how it works at an event…" style="${IS}" rows="4"></textarea></div>
        <div style="${GS}"><label style="${LS}">Space Required</label><select name="space_required" style="${IS}"><option value="">Select space…</option><option>1×1m (very small)</option><option>2×2m (small stall)</option><option>3×3m (standard stall)</option><option>4×4m (large stall)</option><option>6×3m (food truck)</option><option>10×5m (large setup)</option><option>Flexible</option></select></div>
        <div style="${GS}"><label style="${LS}">Travel Distance</label><select name="travel_distance" style="${IS}"><option value="">How far will you travel?</option><option>Local only (50km)</option><option>Regional (200km)</option><option>National</option><option>Anywhere in Europe</option><option>Worldwide</option></select></div>
        <div style="${GS}"><label style="${LS}">Minimum Event Size</label><input type="number" name="min_event_size" placeholder="e.g. 500 visitors" style="${IS}"/></div>
        <div style="${GS}"><label style="${LS}">Maximum Event Size</label><input type="number" name="max_event_size" placeholder="e.g. 50000 visitors" style="${IS}"/></div>
        <div style="${GS}"><label style="${LS}">Needs Electricity?</label><select name="needs_electricity" style="${IS}"><option value="no">No electricity needed</option><option value="yes">Yes — needs power</option></select></div>
        <div style="${GS}"><label style="${LS}">Needs Water?</label><select name="needs_water" style="${IS}"><option value="no">No water needed</option><option value="yes">Yes — needs water</option></select></div>
        <div style="${GS}grid-column:1/-1;"><label style="${LS}">Certifications & Licences</label><input type="text" name="certifications" placeholder="e.g. Food hygiene certified, Public liability insurance" style="${IS}"/></div>
      </div>
    </div>

    <div style="${SS}">
      <h2 style="font-family:'DM Serif Display',serif;font-size:22px;font-weight:400;margin-bottom:6px;">3. What You're Looking For</h2>
      <p style="font-size:13px;color:var(--ink3);margin-bottom:24px;padding-bottom:20px;border-bottom:1px solid var(--border);">Help organisers understand if you're the right fit for their event.</p>
      <div style="${GS}"><label style="${LS}">Describe Your Ideal Event</label><textarea name="looking_for" placeholder="e.g. We love outdoor food festivals with 5,000+ visitors across Europe…" style="${IS}" rows="3"></textarea></div>
      <div style="${GS}"><label style="${LS}">Preferred Event Types</label><div class="checkbox-grid">${EVENT_TYPES.map(t=>`<label class="checkbox-item"><input type="checkbox" name="event_types_wanted" value="${t}"/><span style="font-size:13px;">${t}</span></label>`).join('')}</div></div>
      <div style="${GS}margin-top:16px;"><label style="${LS}">Available Months</label><div class="checkbox-grid">${MONTHS.map(m=>`<label class="checkbox-item"><input type="checkbox" name="availability" value="${m}"/><span style="font-size:13px;">${m}</span></label>`).join('')}</div></div>
    </div>

    <div style="${SS}">
      <h2 style="font-family:'DM Serif Display',serif;font-size:22px;font-weight:400;margin-bottom:6px;">4. Contact & Social Media</h2>
      <p style="font-size:13px;color:var(--ink3);margin-bottom:24px;padding-bottom:20px;border-bottom:1px solid var(--border);">
        Your email will be used as your <strong>login username</strong>. Login details are sent automatically after payment.
      </p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
        <div style="${GS}"><label style="${LS}">Email Address * (your login)</label><input type="email" name="email" required placeholder="your@email.com" style="${IS}"/></div>
        <div style="${GS}"><label style="${LS}">Phone Number</label><input type="tel" name="phone" placeholder="+31 12 345 6789" style="${IS}"/></div>
        <div style="${GS}grid-column:1/-1;"><label style="${LS}">Website</label><input type="url" name="website" placeholder="https://your-business.com" style="${IS}"/></div>
        <div style="${GS}"><label style="${LS}">📸 Instagram</label><input type="text" name="instagram" placeholder="@yourhandle" style="${IS}"/></div>
        <div style="${GS}"><label style="${LS}">👥 Facebook</label><input type="text" name="facebook" placeholder="facebook.com/yourpage" style="${IS}"/></div>
        <div style="${GS}"><label style="${LS}">🎵 TikTok</label><input type="text" name="tiktok" placeholder="@yourhandle" style="${IS}"/></div>
        <div style="${GS}"><label style="${LS}">🎬 Video (YouTube/Vimeo)</label><input type="url" name="video_url" placeholder="https://youtube.com/..." style="${IS}"/></div>
      </div>
    </div>

    <div style="${SS}">
      <h2 style="font-family:'DM Serif Display',serif;font-size:22px;font-weight:400;margin-bottom:6px;">5. Photos</h2>
      <p style="font-size:13px;color:var(--ink3);margin-bottom:24px;padding-bottom:20px;border-bottom:1px solid var(--border);">Vendors with photos get 3× more enquiries.</p>
      <div style="background:linear-gradient(135deg,rgba(232,71,10,.04),rgba(232,71,10,.08));border:1.5px dashed rgba(232,71,10,.3);border-radius:14px;padding:28px;text-align:center;">
        <div style="font-size:40px;margin-bottom:12px;">📸</div>
        <h3 style="font-size:16px;font-weight:700;margin-bottom:8px;">Upload up to 8 photos after registration</h3>
        <p style="font-size:13px;color:var(--ink3);line-height:1.6;max-width:480px;margin:0 auto;">After payment, your login details are emailed to you instantly. Login to your dashboard to add photos of your stall, food truck, products and previous events.</p>
      </div>
    </div>

    <div style="background:#fff;border:1px solid var(--border);border-radius:20px;padding:32px;margin-bottom:20px;">
      <h2 style="font-family:'DM Serif Display',serif;font-size:22px;font-weight:400;margin-bottom:6px;">📋 Terms & Conditions</h2>
      <p style="font-size:13px;color:var(--ink3);margin-bottom:24px;padding-bottom:20px;border-bottom:1px solid var(--border);">Please read carefully before submitting.</p>
      <div style="background:rgba(232,71,10,.04);border:1.5px solid rgba(232,71,10,.2);border-radius:14px;padding:20px 24px;margin-bottom:16px;">
        <div style="font-size:14px;font-weight:700;color:var(--ink);margin-bottom:6px;">💳 No Refund Policy</div>
        <p style="font-size:13px;color:var(--ink3);line-height:1.7;margin:0;">All payments are <strong>final and non-refundable</strong>. For profile errors contact <a href="mailto:contact@festmore.com" style="color:var(--flame);">contact@festmore.com</a> and we will correct it free of charge.</p>
      </div>
      <div style="background:rgba(74,124,89,.04);border:1.5px solid rgba(74,124,89,.2);border-radius:14px;padding:20px 24px;margin-bottom:16px;">
        <div style="font-size:14px;font-weight:700;color:var(--ink);margin-bottom:6px;">✅ Accuracy of Information</div>
        <p style="font-size:13px;color:var(--ink3);line-height:1.7;margin:0;">You are responsible for ensuring all information is accurate. Festmore may remove profiles with false information without refund.</p>
      </div>
      <div style="background:rgba(201,146,42,.04);border:1.5px solid rgba(201,146,42,.25);border-radius:14px;padding:20px 24px;margin-bottom:16px;">
        <div style="font-size:14px;font-weight:700;color:var(--ink);margin-bottom:8px;">🚫 Prohibited Content</div>
        <p style="font-size:13px;color:var(--ink3);line-height:1.7;margin:0;">Strictly prohibited: illegal activities · hate content · discrimination · adult content · scams · illegal substances · copyright violations · spam · extremism. Violations result in immediate removal without refund.</p>
      </div>
      <div style="background:var(--ivory);border:1px solid var(--border);border-radius:14px;padding:20px 24px;margin-bottom:20px;">
        <div style="font-size:14px;font-weight:700;color:var(--ink);margin-bottom:6px;">📧 Questions?</div>
        <p style="font-size:13px;color:var(--ink3);line-height:1.7;margin:0;">Contact <a href="mailto:contact@festmore.com" style="color:var(--flame);font-weight:600;">contact@festmore.com</a> — we respond within 24 hours.</p>
      </div>
      <label style="display:flex;align-items:flex-start;gap:12px;cursor:pointer;background:var(--ivory);border:2px solid var(--border);border-radius:12px;padding:16px 18px;" id="terms-label">
        <input type="checkbox" name="terms_agreed" value="1" required style="margin-top:2px;accent-color:var(--flame);width:18px;height:18px;flex-shrink:0;" onchange="document.getElementById('terms-label').style.borderColor=this.checked?'var(--flame)':'var(--border)'"/>
        <span style="font-size:13px;color:var(--ink2);line-height:1.6;">I have read and agree to the <strong>Terms and Conditions</strong> above, including the <strong>no refund policy</strong>. I confirm my vendor profile complies with all applicable laws and Festmore's content rules.</span>
      </label>
    </div>

    <div style="background:var(--ink);border-radius:20px;padding:36px;margin-bottom:24px;">
      <div style="display:grid;grid-template-columns:1fr auto;gap:24px;align-items:center;">
        <div>
          <h3 style="font-family:'DM Serif Display',serif;font-size:26px;font-weight:400;color:#fff;margin-bottom:8px;">Ready to get discovered?</h3>
          <p style="color:rgba(255,255,255,.5);font-size:14px;line-height:1.6;margin-bottom:16px;">Your professional verified vendor profile — one payment, worldwide visibility. Login details emailed instantly.</p>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            ${['✅ Verified badge','🌍 Worldwide','📸 Up to 8 photos','🎪 Apply to events','📧 Login by email','📊 Your dashboard'].map(f=>`<span style="background:rgba(255,255,255,.08);color:rgba(255,255,255,.7);padding:4px 12px;border-radius:99px;font-size:12px;font-weight:600;">${f}</span>`).join('')}
          </div>
        </div>
        <div style="text-align:center;flex-shrink:0;">
          <div style="font-family:'DM Serif Display',serif;font-size:52px;color:#fff;line-height:1;">€49</div>
          <div style="color:rgba(255,255,255,.4);font-size:13px;margin-bottom:16px;">per year · less than €5/month</div>
          <button type="submit" style="background:#4a7c59;color:#fff;border:none;padding:16px 36px;border-radius:12px;font-size:16px;font-weight:700;cursor:pointer;font-family:inherit;box-shadow:0 8px 24px rgba(74,124,89,.4);">Create My Profile →</button>
          <div style="color:rgba(255,255,255,.3);font-size:12px;margin-top:10px;">🔒 Secure payment via Stripe · Login emailed instantly</div>
        </div>
      </div>
    </div>
  </form>
</div>
${renderFooterSimple()}</body></html>`;
}