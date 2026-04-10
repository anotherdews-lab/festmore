// routes/reviews.js
// Reviews and ratings system for vendors
// GET  /reviews/vendor/:id       — show reviews for a vendor
// POST /reviews/vendor/:id/add   — submit a review
// GET  /reviews/admin            — admin manage reviews

const express = require('express');
const router  = express.Router();
const db      = require('../db');

function requireAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/auth/login');
  next();
}

// ─── SUBMIT REVIEW ───────────────────────────────────────────────
router.post('/vendor/:id/add', async (req, res) => {
  const vendorId = parseInt(req.params.id);
  const { reviewer_name, reviewer_email, reviewer_role, rating, title, body, event_id } = req.body;

  if (!reviewer_name || !rating || !body) {
    return res.redirect(`/vendors/profile/${vendorId}?error=Please fill in all required fields`);
  }

  const ratingNum = parseInt(rating);
  if (ratingNum < 1 || ratingNum > 5) {
    return res.redirect(`/vendors/profile/${vendorId}?error=Invalid rating`);
  }

  try {
    await db.prepare(`
      INSERT INTO reviews (vendor_id, event_id, reviewer_name, reviewer_email, reviewer_role, rating, title, body, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'approved')
    `).run(
      vendorId,
      event_id ? parseInt(event_id) : null,
      reviewer_name,
      reviewer_email || '',
      reviewer_role || 'Event Organiser',
      ratingNum,
      title || '',
      body
    );

    // Update vendor avg_rating and review_count
    updateVendorRating(vendorId);

    res.redirect(`/vendors/profile/${vendorId}?success=Thank you for your review!`);
  } catch(err) {
    console.error('Review error:', err.message);
    res.redirect(`/vendors/profile/${vendorId}?error=Failed to submit review. Please try again.`);
  }
});

// ─── ADMIN — LIST ALL REVIEWS ────────────────────────────────────
router.get('/admin', requireAdmin, (req, res) => {
  const reviews = db.prepare(`
    SELECT r.*, v.business_name
    FROM reviews r
    LEFT JOIN vendors v ON r.vendor_id = v.id
    ORDER BY r.created_at DESC
    LIMIT 100
  `).all();

  res.send(`<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Reviews — Festmore Admin</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="/css/main.css"/>
</head><body style="background:var(--cream);">
<nav class="main-nav"><div class="nav-inner">
  <a href="/" class="logo"><span class="logo-fest">Fest</span><span class="logo-more">more</span></a>
  <div style="flex:1;"></div>
  <a href="/admin" class="btn btn-outline btn-sm">← Admin</a>
</div></nav>
<div class="container" style="padding:40px 0;max-width:1000px;">
  <h1 style="font-family:'DM Serif Display',serif;font-size:32px;font-weight:400;margin-bottom:24px;">⭐ Reviews Management</h1>
  ${reviews.map(r => `
  <div style="background:#fff;border:1px solid var(--border);border-radius:16px;padding:20px;margin-bottom:12px;">
    <div style="display:flex;justify-content:space-between;align-items:start;flex-wrap:wrap;gap:12px;">
      <div>
        <div style="font-weight:700;font-size:15px;">${r.reviewer_name} <span style="font-size:12px;color:var(--ink3);">(${r.reviewer_role})</span></div>
        <div style="font-size:13px;color:var(--ink3);">for <a href="/vendors/profile/${r.vendor_id}" style="color:var(--flame);">${r.business_name}</a></div>
        <div style="color:#e8470a;font-size:16px;margin:6px 0;">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</div>
        ${r.title ? `<div style="font-weight:700;font-size:14px;">"${r.title}"</div>` : ''}
        <div style="font-size:13px;color:var(--ink2);margin-top:4px;">${r.body}</div>
      </div>
      <div style="text-align:right;">
        <span style="background:${r.status==='approved'?'#dcfce7':'#fef9c3'};color:${r.status==='approved'?'#15803d':'#a16207'};padding:3px 10px;border-radius:99px;font-size:11px;font-weight:700;">${r.status}</span>
        <div style="display:flex;gap:8px;margin-top:8px;justify-content:flex-end;">
          ${r.status !== 'approved' ? `<form method="POST" action="/reviews/admin/${r.id}/approve"><button class="btn btn-primary btn-sm">Approve</button></form>` : ''}
          <form method="POST" action="/reviews/admin/${r.id}/delete" onsubmit="return confirm('Delete?')"><button class="btn btn-outline btn-sm" style="color:red;border-color:red;">Delete</button></form>
        </div>
      </div>
    </div>
  </div>`).join('')}
</div>
<footer><div class="footer-bottom"><span>© ${new Date().getFullYear()} Festmore Admin</span></div></footer>
</body></html>`);
});

router.post('/admin/:id/approve', requireAdmin, (req, res) => {
  const id = parseInt(req.params.id);
  const review = db.prepare('SELECT vendor_id FROM reviews WHERE id=?').get(id);
  db.prepare("UPDATE reviews SET status='approved' WHERE id=?").run(id);
  if (review) updateVendorRating(review.vendor_id);
  res.redirect('/reviews/admin');
});

router.post('/admin/:id/delete', requireAdmin, (req, res) => {
  const id = parseInt(req.params.id);
  const review = db.prepare('SELECT vendor_id FROM reviews WHERE id=?').get(id);
  db.prepare('DELETE FROM reviews WHERE id=?').run(id);
  if (review) updateVendorRating(review.vendor_id);
  res.redirect('/reviews/admin');
});

// ─── HELPER ──────────────────────────────────────────────────────
function updateVendorRating(vendorId) {
  try {
    const stats = db.prepare(`
      SELECT AVG(rating) as avg, COUNT(*) as cnt
      FROM reviews
      WHERE vendor_id=? AND status='approved'
    `).get(vendorId);

    if (stats && stats.cnt > 0) {
      db.prepare(`
        UPDATE vendors SET avg_rating=?, review_count=? WHERE id=?
      `).run(
        parseFloat(stats.avg).toFixed(2),
        stats.cnt,
        vendorId
      );
    }
  } catch(e) {
    console.error('Rating update error:', e.message);
  }
}

module.exports = router;
module.exports.updateVendorRating = updateVendorRating;
