// server.js
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path    = require('path');
const cron    = require('node-cron');
const fs      = require('fs');

const app  = express();
const PORT = process.env.PORT || 3000;

// ─────────────────────────────────────
// MIDDLEWARE
// ─────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'festmore-dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 7 * 24 * 60 * 60 * 1000 }
}));

app.use((req, res, next) => {
  res.locals.user      = req.session.user || null;
  res.locals.siteUrl   = process.env.SITE_URL || 'http://localhost:3000';
  res.locals.adsenseId = process.env.ADSENSE_ID || '';
  res.locals.stripePub = process.env.STRIPE_PUBLISHABLE_KEY || '';
  next();
});

// ─────────────────────────────────────
// ROUTES
// ─────────────────────────────────────
app.use('/',             require('./routes/home'));
app.use('/events/in',    require('./routes/cities'));
app.use('/events',       require('./routes/events'));
app.use('/vendors',      require('./routes/vendors'));
app.use('/articles',     require('./routes/articles'));
app.use('/auth',         require('./routes/auth'));
app.use('/dashboard',    require('./routes/dashboard'));
app.use('/payments',     require('./routes/payments'));
app.use('/api',          require('./routes/api'));
// TEMP DEBUG ROUTE — remove after use
app.get('/admin/activate-vendor', (req, res) => {
  const db = require('./db');
  const vendors = db.prepare("SELECT id, business_name, email, status, payment_status FROM vendors ORDER BY id DESC LIMIT 10").all();
  res.send('<pre>' + JSON.stringify(vendors, null, 2) + '</pre>');
});

app.get('/admin/create-toto-vendor', (req, res) => {
  const db = require('./db');
  try {
    const result = db.prepare(`
      INSERT INTO vendors (
        business_name, slug, category, city, country,
        description, email, status, payment_status, verified, premium
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?)
    `).run(
      'Toto Vino e Cucina',
      'toto-vino-e-cucina',
      'Food & Drinks',
      'Netherlands',
      'NL',
      'Italian food and wine vendor',
      'info@totovinoecucina.nl',
      'active',
      'paid',
      1,
      0
    );
    res.send('✅ Vendor created! ID: ' + result.lastInsertRowid + ' — Now remove this route!');
  } catch(err) {
    res.send('❌ Error: ' + err.message);
  }
});
app.use('/admin',        require('./routes/admin'));
app.use('/applications', require('./routes/applications'));
// app.use('/photos', require('./routes/photos'));
app.use('/festival',     require('./routes/landing'));
app.use('/',             require('./routes/sitemap'));
app.use('/',             require('./routes/pages'));


// ─────────────────────────────────────
// REDIRECT GHOST WORDPRESS URLS
// ─────────────────────────────────────
app.get('/', (req, res, next) => {
  if (req.query.mep_events) {
    return res.redirect(301, '/events/' + req.query.mep_events);
  }
  next();
});

// ─────────────────────────────────────
// ROUTES
// ─────────────────────────────────────
app.use('/',             require('./routes/home'));

// ─────────────────────────────────────
// EMAIL TEST ROUTE
// ─────────────────────────────────────
app.get('/test-email', async (req, res) => {
  try {
    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'Festmore <onboarding@resend.dev>',
      to: process.env.EMAIL_USER,
      subject: 'Festmore Email Test',
      text: 'Email is working! Sent via Resend.'
    });
    res.send('✅ Email sent! Check inbox and spam.');
  } catch(err) {
    res.send('❌ Error: ' + err.message);
  }
});

// ─────────────────────────────────────
// 404 PAGE
// ─────────────────────────────────────
app.use((req, res) => {
  res.status(404).send(`<!DOCTYPE html>
<html><head><title>Page Not Found — Festmore</title>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;600&display=swap" rel="stylesheet"/>
<style>
body{font-family:'DM Sans',sans-serif;background:#faf8f3;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;}
.box{text-align:center;padding:48px;}
h1{font-family:'DM Serif Display',serif;font-size:80px;color:#e8470a;margin:0;font-weight:400;}
h2{font-size:24px;margin:8px 0 16px;color:#1a1612;}
p{color:#7a6f68;margin-bottom:24px;}
a{background:#e8470a;color:#fff;padding:12px 28px;border-radius:99px;text-decoration:none;font-weight:700;}
</style></head>
<body><div class="box">
<h1>404</h1>
<h2>Page not found</h2>
<p>The event might have ended, or this page doesn't exist.</p>
<a href="/">Back to Festmore</a>
</div></body></html>`);
});

// ─────────────────────────────────────
// AUTOMATED DAILY JOB — 2AM every night
// ─────────────────────────────────────
cron.schedule('0 2 * * *', async () => {
  console.log('⏰ Daily automation starting...');
  try {
    const daily = require('./automation/daily');
    await daily.run();
    console.log('✅ Daily automation complete!');
  } catch (err) {
    console.error('❌ Automation error:', err.message);
  }
});

// ─────────────────────────────────────
// HELPER — run a seed script safely
// ─────────────────────────────────────
function runScript(file, label) {
  try {
    if (fs.existsSync('./' + file)) {
      require('./' + file);
      console.log('✅ ' + label);
    } else {
      console.log('⏭️  ' + label + ' — not found, skipping');
    }
  } catch(err) {
    console.log('⚠️  ' + label + ':', err.message);
  }
}

// ─────────────────────────────────────
// STARTUP — SMART SEEDING
//
// THE KEY FIX FOR GOOGLE:
// We check if the database already has data before seeding.
// If it does — we skip ALL seed scripts so Railway never
// wipes your events between deploys.
// Google can now index your pages permanently.
// ─────────────────────────────────────
try {
  const db = require('./db');
  const eventCount = db.prepare('SELECT COUNT(*) as n FROM events').get().n;

  console.log(`\n📊 Database: ${eventCount} events found`);

  if (eventCount < 50) {
    // ── FIRST BOOT or empty database — seed everything ──
    console.log('🌱 Empty database detected — seeding now...\n');

    // STEP 1 — columns
    runScript('add-photos-columns.js',           'Photos columns');

    // STEP 2 — events & vendors
    runScript('add-us-city-events.js',           'US city events');
    runScript('add-sample-vendors.js',           'Sample vendors');
    runScript('add-bhatti-catering.js',          'Bhatti Catering');
    runScript('add-holland-flea-markets.js',     'Holland flea markets');
    runScript('add-europe-events.js',            'Europe events');
    runScript('add-new-countries.js',            'New countries events');
    runScript('add-high-traffic-events.js',      'High traffic events');
    runScript('add-new-country-content.js',      'New country content');
    runScript('add-high-traffic-events-2026.js', 'High traffic events 2026');
    runScript('add-kløften-festival.js',         'Kløften Festival');

    // STEP 3 — articles
    runScript('add-trending-articles.js',        'Trending articles');
    runScript('add-seo-articles.js',             'SEO articles');
    runScript('add-seo-articles-2026.js',        'SEO articles 2026');

    // STEP 4 — subscribers
    runScript('add-subscribers.js',              'Subscribers');

    // STEP 5 — fix data after seeding
    runScript('update-dates-2026.js',            'Update dates to 2026');
    runScript('update-event-photos.js',          'Update event photos');

    console.log('\n✅ Seeding complete!\n');

 } else {
    console.log('✅ Database populated — skipping ALL scripts');
    console.log('🎉 Pages preserved!\n');
  }

} catch(err) {
  console.log('⚠️  Startup check error:', err.message);
  // If table doesn't exist yet, run setup first
  try {
    console.log('Running database setup...');
    require('./db/setup');
    console.log('✅ Database setup complete');
  } catch(e) {
    console.log('Setup error:', e.message);
  }
}

// ─────────────────────────────────────
// START SERVER
// ─────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('🎪 ════════════════════════════════════');
  console.log('   FESTMORE is running!');
  console.log(`   Open: http://localhost:${PORT}`);
  console.log('   ════════════════════════════════════');
  console.log('');
});

module.exports = app;