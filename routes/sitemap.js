// routes/sitemap.js
// Generates a dynamic XML sitemap for Google
// Accessible at: festmore.com/sitemap.xml

const express = require('express');
const router  = express.Router();
const db      = require('../db');

router.get('/sitemap.xml', (req, res) => {
  const baseUrl = 'https://festmore.com';

  // Get all active events
  const events = db.prepare(`
    SELECT slug, updated_at, created_at FROM events 
    WHERE status='active' ORDER BY created_at DESC
  `).all();

  // Get all published articles
  const articles = db.prepare(`
    SELECT slug, created_at FROM articles 
    WHERE status='published' ORDER BY created_at DESC
  `).all();

  // Get all active vendors
  const vendors = db.prepare(`
    SELECT slug, created_at FROM vendors 
    WHERE status='active' ORDER BY created_at DESC
  `).all();

  const today = new Date().toISOString().split('T')[0];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

  <!-- STATIC PAGES -->
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <lastmod>${today}</lastmod>
  </url>
  <url>
    <loc>${baseUrl}/events</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
    <lastmod>${today}</lastmod>
  </url>
  <url>
    <loc>${baseUrl}/articles</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
    <lastmod>${today}</lastmod>
  </url>
  <url>
    <loc>${baseUrl}/vendors</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <lastmod>${today}</lastmod>
  </url>
  <url>
    <loc>${baseUrl}/events/submit</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/vendors/register</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>

  <!-- CATEGORY PAGES -->
  <url><loc>${baseUrl}/events?category=festival</loc><changefreq>daily</changefreq><priority>0.8</priority></url>
  <url><loc>${baseUrl}/events?category=christmas</loc><changefreq>daily</changefreq><priority>0.8</priority></url>
  <url><loc>${baseUrl}/events?category=concert</loc><changefreq>daily</changefreq><priority>0.8</priority></url>
  <url><loc>${baseUrl}/events?category=market</loc><changefreq>daily</changefreq><priority>0.8</priority></url>
  <url><loc>${baseUrl}/events?category=flea</loc><changefreq>daily</changefreq><priority>0.7</priority></url>
  <url><loc>${baseUrl}/events?category=messe</loc><changefreq>daily</changefreq><priority>0.7</priority></url>
  <url><loc>${baseUrl}/events?category=kids</loc><changefreq>daily</changefreq><priority>0.7</priority></url>
  <url><loc>${baseUrl}/events?category=city</loc><changefreq>daily</changefreq><priority>0.7</priority></url>

  <!-- COUNTRY PAGES -->
  <url><loc>${baseUrl}/events?country=DE</loc><changefreq>daily</changefreq><priority>0.8</priority></url>
  <url><loc>${baseUrl}/events?country=DK</loc><changefreq>daily</changefreq><priority>0.8</priority></url>
  <url><loc>${baseUrl}/events?country=SE</loc><changefreq>daily</changefreq><priority>0.8</priority></url>
  <url><loc>${baseUrl}/events?country=FR</loc><changefreq>daily</changefreq><priority>0.8</priority></url>
  <url><loc>${baseUrl}/events?country=GB</loc><changefreq>daily</changefreq><priority>0.8</priority></url>
  <url><loc>${baseUrl}/events?country=US</loc><changefreq>daily</changefreq><priority>0.8</priority></url>
  <url><loc>${baseUrl}/events?country=NL</loc><changefreq>daily</changefreq><priority>0.7</priority></url>

  <!-- EVENT PAGES -->
  ${events.map(e => `
  <url>
    <loc>${baseUrl}/events/${e.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <lastmod>${(e.updated_at || e.created_at || today).split('T')[0]}</lastmod>
  </url>`).join('')}

  <!-- ARTICLE PAGES -->
  ${articles.map(a => `
  <url>
    <loc>${baseUrl}/articles/${a.slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
    <lastmod>${(a.created_at || today).split('T')[0]}</lastmod>
  </url>`).join('')}

  <!-- VENDOR PAGES -->
  ${vendors.map(v => `
  <url>
    <loc>${baseUrl}/vendors/${v.slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
    <lastmod>${(v.created_at || today).split('T')[0]}</lastmod>
  </url>`).join('')}

</urlset>`;

  res.header('Content-Type', 'application/xml');
  res.send(xml);
});

// Robots.txt
router.get('/robots.txt', (req, res) => {
  res.header('Content-Type', 'text/plain');
  res.send(`User-agent: *
Allow: /

Sitemap: https://festmore.com/sitemap.xml

Disallow: /admin
Disallow: /dashboard
Disallow: /auth
Disallow: /api
`);
});

module.exports = router;
