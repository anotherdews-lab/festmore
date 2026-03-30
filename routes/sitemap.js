// routes/sitemap.js — ENHANCED SITEMAP
// Includes all events, articles, vendors with proper priorities

const express = require('express');
const router  = express.Router();
const db      = require('../db');

const SITE_URL = process.env.SITE_URL || 'https://festmore.com';

router.get('/sitemap.xml', (req, res) => {
  const events   = db.prepare("SELECT slug, updated_at, created_at FROM events WHERE status='active' ORDER BY created_at DESC").all();
  const articles = db.prepare("SELECT slug, created_at FROM articles WHERE status='published' ORDER BY created_at DESC").all();
  const vendors  = db.prepare("SELECT slug, created_at FROM vendors WHERE status='active' ORDER BY created_at DESC").all();
const { CITIES } = require('./cities');
  const today = new Date().toISOString().substring(0, 10);

  // Static pages with priorities
  const staticPages = [
    { url: '/',                    priority: '1.0', changefreq: 'daily' },
    { url: '/events',              priority: '0.9', changefreq: 'daily' },
    { url: '/events/pricing',      priority: '0.8', changefreq: 'weekly' },
    { url: '/events/submit',       priority: '0.8', changefreq: 'monthly' },
    { url: '/vendors',             priority: '0.9', changefreq: 'daily' },
    { url: '/vendors/register',    priority: '0.8', changefreq: 'monthly' },
    { url: '/articles',            priority: '0.8', changefreq: 'daily' },
    { url: '/about',               priority: '0.5', changefreq: 'monthly' },
    { url: '/contact',             priority: '0.5', changefreq: 'monthly' },
    { url: '/privacy',             priority: '0.3', changefreq: 'yearly' },
    // Category pages
    { url: '/events?category=festival',   priority: '0.8', changefreq: 'daily' },
    { url: '/events?category=christmas',  priority: '0.8', changefreq: 'daily' },
    { url: '/events?category=market',     priority: '0.8', changefreq: 'daily' },
    { url: '/events?category=concert',    priority: '0.7', changefreq: 'daily' },
    { url: '/events?category=flea',       priority: '0.7', changefreq: 'daily' },
    { url: '/events?category=city',       priority: '0.7', changefreq: 'daily' },
    { url: '/events?category=business',   priority: '0.7', changefreq: 'daily' },
    { url: '/events?category=kids',       priority: '0.6', changefreq: 'daily' },
    // Country pages
    { url: '/events?country=DE', priority: '0.8', changefreq: 'daily' },
    { url: '/events?country=DK', priority: '0.8', changefreq: 'daily' },
    { url: '/events?country=NL', priority: '0.8', changefreq: 'daily' },
    { url: '/events?country=GB', priority: '0.7', changefreq: 'daily' },
    { url: '/events?country=FR', priority: '0.7', changefreq: 'daily' },
    { url: '/events?country=SE', priority: '0.7', changefreq: 'daily' },
    { url: '/events?country=BE', priority: '0.7', changefreq: 'daily' },
    { url: '/events?country=US', priority: '0.7', changefreq: 'daily' },
    { url: '/events?country=AE', priority: '0.6', changefreq: 'daily' },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

${staticPages.map(p => `  <url>
    <loc>${SITE_URL}${p.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}

${events.map(e => `  <url>
    <loc>${SITE_URL}/events/${e.slug}</loc>
    <lastmod>${(e.updated_at || e.created_at || today).substring(0, 10)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n')}

${articles.map(a => `  <url>
    <loc>${SITE_URL}/articles/${a.slug}</loc>
    <lastmod>${(a.created_at || today).substring(0, 10)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`).join('\n')}

${vendors.map(v => `  <url>
    <loc>${SITE_URL}/vendors/${v.slug}</loc>
    <lastmod>${(v.created_at || today).substring(0, 10)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>`).join('\n')}
  <url>
    <loc>${SITE_URL}/events/in</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>

${CITIES.map(c => `  <url>
    <loc>${SITE_URL}/events/in/${c.slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n')}
</urlset>`;

  res.header('Content-Type', 'application/xml');
  res.header('Cache-Control', 'public, max-age=3600');
  res.send(xml);
});

// robots.txt
router.get('/robots.txt', (req, res) => {
  res.header('Content-Type', 'text/plain');
  res.send(`# Festmore.com robots.txt
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /dashboard/
Disallow: /auth/
Disallow: /api/
Disallow: /payments/

# Sitemaps
Sitemap: ${SITE_URL}/sitemap.xml

# Crawl-delay
Crawl-delay: 1
`);
});

module.exports = router;