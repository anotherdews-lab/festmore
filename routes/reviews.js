// routes/reviews.js — PostgreSQL version
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
  const { reviewer_name, reviewer_email, reviewer_role, rating, title, body } = req.body;

  if (!reviewer_name || !rating || !body) {
    return res.redirect(`/vendors/profile/${vendorId}?error=Please fill in name, rating and review`);
  }

  const ratingNum = parseInt(rating);
  if (ratingNum < 1 || ratingNum > 5) {
    return res.redirect(`/vendors/profile/${vendorId}?error=Invalid rating`);
  }

  try {
    const { Client } = require('pg');
    const client = new Client({
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres:VWgjvXynowzYucOsfqNNAPWojptOHaXJ@gondola.proxy.rlwy.net:47003/railway',
      ssl: { rejectUnauthorized: false }
    });
    await client.connect();

    await client.query(`
      INSERT INTO reviews (vendor_id, reviewer_name, reviewer_email, reviewer_role, rating, title, body, status, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'approved', NOW())
    `, [
      vendorId,
      reviewer_name,
      reviewer_email || '',
      reviewer_role || 'Event Organiser',
      ratingNum,
      title || '',
      body
    ]);

    // Update vendor avg_rating
    await client.query(`
      UPDATE vendors SET
        avg_rating = (SELECT AVG(rating) FROM reviews WHERE vendor_id=$1 AND status='approved'),
        review_count = (SELECT COUNT(*) FROM reviews WHERE vendor_id=$1 AND status='approved')
      WHERE id=$1
    `, [vendorId]);

    await client.end();
    res.redirect(`/vendors/profile/${vendorId}?success=Thank you for your review!`);

  } catch(err) {
    console.error('Review error:', err.message);
    res.redirect(`/vendors/profile/${vendorId}?error=Failed to submit review: ${err.message}`);
  }
});

// ─── ADMIN — LIST ALL REVIEWS ────────────────────────────────────
router.get('/admin', requireAdmin, async (req, res) => {
  try {
    const { Client } = require('pg');
    const client = new Client({
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres:VWgjvXynowzYucOsfqNNAPWojptOHaXJ@gondola.proxy.rlwy.net:47003/railway',
      ssl: { rejectUnauthorized: false }
    });
    await client.connect();

    const result = await client.query(`
      SELECT r.*, v.business_name
      FROM reviews r
      LEFT JOIN vendors v ON r.vendor_id = v.id
      ORDER BY r.created_at DESC
      LIMIT 100
    `);
    const reviews = result.rows;
    await client.end();

    res.send(`<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Reviews — Festmore Admin</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="/css/main.css"/>
</head><body style="background:var(--cream);">
<nav class="main-nav"><div class="nav-inner">
  <a href="/" class="logo"><span class="logo-fest">Fest</span><span class="logo-more">more</span></a>
  <div style="flex:1;"></div>
  <a href="/dashboard" class="btn btn-outline btn-sm">← Dashboard</a>
</div></nav>
<div class="container" style="padding:40px 0;max-width:1000px;">
  <h1 style="font-family:'DM Serif Display',serif;font-size:32px;font-weight:400;margin-bottom:8px;">⭐ Reviews</h1>
  <p style="color:var(--ink3);margin-bottom:28px;">${reviews.length} total reviews</p>

  ${req.query.success ? `<div style="background:#dcfce7;border:1px solid #86efac;border-radius:12px;padding:14px 18px;margin-bottom:20px;color:#15803d;font-weight:600;">✅ ${req.query.success}</div>` : ''}

  ${reviews.length === 0 ? `
  <div style="background:#fff;border:1px solid var(--border);border-radius:20px;padding:64px;text-align:center;">
    <div style="font-size:48px;margin-bottom:16px;">⭐</div>
    <h2 style="font-family:'DM Serif Display',serif;font-size:24px;font-weight:400;">No reviews yet</h2>
    <p style="color:var(--ink3);">Reviews submitted on vendor profiles will appear here.</p>
  </div>` : reviews.map(r => `
  <div style="background:#fff;border:1px solid var(--border);border-radius:16px;padding:20px 24px;margin-bottom:12px;">
    <div style="display:flex;justify-content:space-between;align-items:start;flex-wrap:wrap;gap:12px;">
      <div style="flex:1;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
          <div style="font-weight:700;font-size:15px;">${r.reviewer_name}</div>
          <span style="font-size:12px;color:var(--ink3);">${r.reviewer_role || 'Reviewer'}</span>
          <span style="background:${r.status==='approved'?'#dcfce7':'#fef9c3'};color:${r.status==='approved'?'#15803d':'#a16207'};padding:2px 8px;border-radius:99px;font-size:11px;font-weight:700;">${r.status}</span>
        </div>
        <div style="color:#e8470a;font-size:16px;margin-bottom:4px;">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</div>
        <div style="font-size:13px;color:var(--ink3);margin-bottom:4px;">for <a href="/vendors/profile/${r.vendor_id}" style="color:var(--flame);">${r.business_name || 'Unknown Vendor'}</a></div>
        ${r.title ? `<div style="font-weight:700;font-size:14px;margin-bottom:4px;">"${r.title}"</div>` : ''}
        <div style="font-size:13px;color:var(--ink2);line-height:1.6;">${r.body}</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px;flex-shrink:0;">
        <div style="font-size:12px;color:var(--ink4);">${new Date(r.created_at).toLocaleDateString('en-GB')}</div>
        <form method="POST" action="/reviews/admin/${r.id}/delete" onsubmit="return confirm('Delete this review?')">
          <button class="btn btn-outline btn-sm" style="color:#dc2626;border-color:#dc2626;">Delete</button>
        </form>
      </div>
    </div>
  </div>`).join('')}
</div>
<footer><div class="footer-bottom"><span>© ${new Date().getFullYear()} Festmore Admin</span></div></footer>
</body></html>`);

  } catch(err) {
    res.send('Error loading reviews: ' + err.message);
  }
});

// ─── DELETE REVIEW ────────────────────────────────────────────────
router.post('/admin/:id/delete', requireAdmin, async (req, res) => {
  try {
    const { Client } = require('pg');
    const client = new Client({
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres:VWgjvXynowzYucOsfqNNAPWojptOHaXJ@gondola.proxy.rlwy.net:47003/railway',
      ssl: { rejectUnauthorized: false }
    });
    await client.connect();
    const review = await client.query('SELECT vendor_id FROM reviews WHERE id=$1', [parseInt(req.params.id)]);
    await client.query('DELETE FROM reviews WHERE id=$1', [parseInt(req.params.id)]);
    if (review.rows[0]) {
      const vid = review.rows[0].vendor_id;
      await client.query(`UPDATE vendors SET avg_rating=(SELECT AVG(rating) FROM reviews WHERE vendor_id=$1 AND status='approved'), review_count=(SELECT COUNT(*) FROM reviews WHERE vendor_id=$1 AND status='approved') WHERE id=$1`, [vid]);
    }
    await client.end();
    res.redirect('/reviews/admin?success=Review deleted.');
  } catch(err) {
    res.redirect('/reviews/admin?error=' + err.message);
  }
});

module.exports = router;
