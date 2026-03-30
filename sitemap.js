// routes/sitemap.js — ENHANCED SITEMAP
// Includes all events, articles, vendors, city pages with proper priorities

const express = require('express');
const router  = express.Router();
const db      = require('../db');

const SITE_URL = process.env.SITE_URL || 'https://festmore.com';

const CITY_SLUGS = [
  'berlin','munich','hamburg','cologne','frankfurt','nuremberg','dusseldorf',
  'stuttgart','dresden','leipzig','copenhagen','aarhus','roskilde','odense',
  'aalborg','amsterdam','rotterdam','the-hague','utrecht','eindhoven','london',
  'manchester','edinburgh','bristol','glasgow','liverpool','paris','lyon',
  'marseille','bordeaux','nice','barcelona','madrid','seville','valencia',
  'bilbao','rome','milan','venice','florence','naples','stockholm','gothenburg',
  'malmo','oslo','bergen','helsinki','tampere','vienna','salzburg','innsbruck',
  'zurich','geneva','montreux','basel','brussels','ghent','bruges','antwerp',
  'lisbon','porto','dublin','galway','prague','brno','budapest','warsaw',
  'krakow','wroclaw','gdansk','poznan','kostrzyn','athens','thessaloniki',
  'zagreb','split','dubrovnik','dubai','abu-dhabi','new-york','los-angeles',
  'chicago','mumbai','delhi','jaipur','goa','varanasi','bangkok','chiang-mai',
  'phuket','tokyo','kyoto','osaka','sapporo'
];

router.get('/sitemap.xml', (req, res) => {
  const events   = db.prepare("SELECT slug, updated_at, created_at FROM events WHERE status='active' ORDER BY created_at DESC").all();
  const articles = db.prepare("SELECT slug, created_at FROM articles WHERE status='published' ORDER BY created_at DESC").all();
  const vendors  = db.prepare("SELECT slug, created_at FROM vendors WHERE status='active' ORDER BY created_at DESC").all();

  const today = new Date().toISOString().substring(0, 10);

  const staticPages = [
    { url: '/',                    priority: '1.0', changefreq: 'daily' },
    { url: '/events',              priority: '0.9', changefreq: 'daily' },
    { url: '/events/pricing',      priority: '0.8', changefreq: 'weekly' },
    { url: '/events/submit',       priority: '0.8', changefreq: 'monthly' },
    { url: '/vendors',             priority: '0.9', changefreq: 'daily' },
    { url: '/vendors/register',    priority: '0.8', changefreq: 'monthly' },
    { url: '/articles',            priority: '0.8', changefreq: 'daily' },
    { url: '/events/in',           priority: '0.8', changefreq: 'weekly' },
    { url: '/about',               priority: '0.5', changefreq: 'monthly' },
    { url: '/contact',             priority: '0.5', changefreq: 'monthly' },
    { url: '/privacy',             priority: '0.3', changefreq: 'yearly' },
    { url: '/events?category=festival',   priority: '0.8', changefreq: 'daily' },
    { url: '/events?category=christmas',  priority: '0.8', changefreq: 'daily' },
    { url: '/events?category=market',     priority: '0.8', changefreq: 'daily' },
    { url: '/events?category=concert',    priority: '0.7', changefreq: 'daily' },
    { url: '/events?category=flea',       priority: '0.7', changefreq: 'daily' },
    { url: '/events?category=city',       priority: '0.7', changefreq: 'daily' },
    { url: '/events?category=business',   priority: '0.7', changefreq: 'daily' },
    { url: '/events?category=kids',       priority: '0.6', changefreq: 'daily' },
    { url: '/events?country=DE', priority: '0.8', changefreq: 'daily' },
    { url: '/events?country=DK', priority: '0.8', changefreq: 'daily' },
    { url: '/events?country=NL', priority: '0.8', changefreq: 'daily' },
    { url: '/events?country=GB', priority: '0.7', changefreq: 'daily' },
    { url: '/events?country=FR', priority: '0.7', changefreq: 'daily' },
    { url: '/events?country=SE', priority: '0.7', changefreq: 'daily' },
    { url: '/events?country=BE', priority: '0.7', changefreq: 'daily' },
    { url: '/events?country=US', priority: '0.7', changefreq: 'daily' },
    { url: '/events?country=AE', priority: '0.6', changefreq: 'daily' },
    { url: '/events?country=PL', priority: '0.8', changefreq: 'daily' },
    { url: '/events?country=IT', priority: '0.7', changefreq: 'daily' },
    { url: '/events?country=ES', priority: '0.7', changefreq: 'daily' },
    { url: '/events?country=PT', priority: '0.6', changefreq: 'daily' },
    { url: '/events?country=IE', priority: '0.6', changefreq: 'daily' },
    { url: '/events?country=AT', priority: '0.6', changefreq: 'daily' },
    { url: '/events?country=CH', priority: '0.6', changefreq: 'daily' },
    { url: '/events?country=NO', priority: '0.6', changefreq: 'daily' },
    { url: '/events?country=FI', priority: '0.6', changefreq: 'daily' },
    { url: '/events?country=JP', priority: '0.6', changefreq: 'daily' },
    { url: '/events?country=TH', priority: '0.6', changefreq: 'daily' },
    { url: '/events?country=IN', priority: '0.6', changefreq: 'daily' },
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

${CITY_SLUGS.map(slug => `  <url>
    <loc>${SITE_URL}/events/in/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
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
