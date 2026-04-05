// routes/sitemap.js — COMPLETE SEO SITEMAP v2
// ✅ Proper XML sitemap index
// ✅ Separate sitemaps for events, articles, vendors
// ✅ robots.txt
// ✅ 301 redirects for bad 404 URLs
// ✅ Never deletes any data

const express = require('express');
const router  = express.Router();
const db      = require('../db');

// ─────────────────────────────────────
// REDIRECT MIDDLEWARE
// Catches old bad URLs and 301 redirects them
// ─────────────────────────────────────
router.use((req, res, next) => {
  try {
    const redirect = db.prepare('SELECT to_path, status_code FROM redirects WHERE from_path=?').get(req.path);
    if (redirect) {
      return res.redirect(redirect.status_code || 301, redirect.to_path);
    }
  } catch(e) {}
  next();
});

// ─────────────────────────────────────
// ROBOTS.TXT
// ─────────────────────────────────────
router.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *
Allow: /
Sitemap: https://festmore.com/sitemap.xml

Disallow: /admin/
Disallow: /auth/
Disallow: /dashboard/
Disallow: /api/
Disallow: /payments/
Disallow: /messages/
Disallow: /applications/
`);
});

// ─────────────────────────────────────
// SITEMAP INDEX
// ─────────────────────────────────────
router.get('/sitemap.xml', (req, res) => {
  const now = new Date().toISOString().split('T')[0];
  res.type('application/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>https://festmore.com/sitemap-pages.xml</loc><lastmod>${now}</lastmod></sitemap>
  <sitemap><loc>https://festmore.com/sitemap-events.xml</loc><lastmod>${now}</lastmod></sitemap>
  <sitemap><loc>https://festmore.com/sitemap-articles.xml</loc><lastmod>${now}</lastmod></sitemap>
  <sitemap><loc>https://festmore.com/sitemap-vendors.xml</loc><lastmod>${now}</lastmod></sitemap>
</sitemapindex>`);
});

// ─────────────────────────────────────
// STATIC PAGES SITEMAP
// ─────────────────────────────────────
router.get('/sitemap-pages.xml', (req, res) => {
  const now = new Date().toISOString().split('T')[0];
  const pages = [
    ['/', '1.0', 'daily'],
    ['/events', '0.9', 'daily'],
    ['/vendors', '0.9', 'daily'],
    ['/articles', '0.8', 'daily'],
    ['/events/submit', '0.8', 'weekly'],
    ['/events/pricing', '0.8', 'weekly'],
    ['/vendors/register', '0.8', 'weekly'],
    ['/about', '0.5', 'monthly'],
    ['/contact', '0.5', 'monthly'],
    ['/privacy', '0.3', 'monthly'],
    ['/events?category=festival', '0.8', 'daily'],
    ['/events?category=market', '0.8', 'daily'],
    ['/events?category=christmas', '0.7', 'daily'],
    ['/events?category=concert', '0.7', 'daily'],
    ['/events?category=flea', '0.7', 'daily'],
    ['/events?category=exhibition', '0.7', 'daily'],
    ['/events?country=DE', '0.8', 'daily'],
    ['/events?country=DK', '0.8', 'daily'],
    ['/events?country=NL', '0.8', 'daily'],
    ['/events?country=GB', '0.8', 'daily'],
    ['/events?country=FR', '0.7', 'daily'],
    ['/events?country=SE', '0.7', 'daily'],
    ['/events?country=BE', '0.7', 'daily'],
    ['/events?country=US', '0.7', 'daily'],
    ['/events?country=IT', '0.7', 'daily'],
    ['/events?country=ES', '0.7', 'daily'],
    ['/events?country=IN', '0.6', 'daily'],
    ['/events?country=JP', '0.6', 'daily'],
    ['/events?country=TH', '0.6', 'daily'],
    ['/events?country=PL', '0.6', 'daily'],
    ['/events?country=NO', '0.6', 'daily'],
    ['/events?country=FI', '0.6', 'daily'],
  ];
  res.type('application/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(([url, priority, freq]) => `  <url>
    <loc>https://festmore.com${url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${freq}</changefreq>
    <priority>${priority}</priority>
  </url>`).join('\n')}
</urlset>`);
});

// ─────────────────────────────────────
// EVENTS SITEMAP
// ─────────────────────────────────────
router.get('/sitemap-events.xml', (req, res) => {
  const events = db.prepare(`
    SELECT slug, updated_at, created_at, featured
    FROM events WHERE status='active'
    ORDER BY featured DESC, created_at DESC
    LIMIT 5000
  `).all();

  res.type('application/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${events.map(e => {
  const d = e.updated_at || e.created_at || new Date().toISOString();
  const lastmod = typeof d === 'string' ? d.substring(0,10) : new Date(d).toISOString().split('T')[0];
  return `  <url>
    <loc>https://festmore.com/events/${e.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${e.featured ? '0.9' : '0.7'}</priority>
  </url>`;
}).join('\n')}
</urlset>`);
});

// ─────────────────────────────────────
// ARTICLES SITEMAP
// ─────────────────────────────────────
router.get('/sitemap-articles.xml', (req, res) => {
  const articles = db.prepare(`
    SELECT slug, updated_at, created_at
    FROM articles WHERE status='published'
    ORDER BY created_at DESC
    LIMIT 5000
  `).all();

  res.type('application/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${articles.map(a => {
  const d = a.updated_at || a.created_at || new Date().toISOString();
  const lastmod = typeof d === 'string' ? d.substring(0,10) : new Date(d).toISOString().split('T')[0];
  return `  <url>
    <loc>https://festmore.com/articles/${a.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
}).join('\n')}
</urlset>`);
});

// ─────────────────────────────────────
// VENDORS SITEMAP
// ─────────────────────────────────────
router.get('/sitemap-vendors.xml', (req, res) => {
  const vendors = db.prepare(`
    SELECT id, updated_at, created_at
    FROM vendors WHERE status='active' AND payment_status='paid'
    ORDER BY created_at DESC LIMIT 5000
  `).all();

  res.type('application/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${vendors.map(v => {
  const d = v.updated_at || v.created_at || new Date().toISOString();
  const lastmod = typeof d === 'string' ? d.substring(0,10) : new Date(d).toISOString().split('T')[0];
  return `  <url>
    <loc>https://festmore.com/vendors/profile/${v.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
}).join('\n')}
</urlset>`);
});

module.exports = router;
