// server.js — FESTMORE v4
// ✅ PostgreSQL production database
// ✅ Smart seeding — never overwrites live data
// ✅ Admin account always created on startup
// ✅ Toto vendor account always created on startup
// ✅ All seed scripts included
// ✅ Cloudinary photo upload

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
app.use('/events/in',    require('./routes/cities'));
app.use('/events',       require('./routes/events'));
app.use('/vendors',      require('./routes/vendors'));
app.use('/articles',     require('./routes/articles'));
app.use('/auth',         require('./routes/auth'));
app.use('/dashboard',    require('./routes/dashboard'));
app.use('/payments',     require('./routes/payments'));
app.use('/api',          require('./routes/api'));
app.use('/upload',       require('./routes/upload'));
app.use('/admin',        require('./routes/admin'));
app.use('/admin',        require('./routes/admin-social'));
app.use('/applications', require('./routes/applications'));
app.use('/messages',     require('./routes/messages'));
app.use('/festival',     require('./routes/landing'));
app.use('/',             require('./routes/sitemap'));
app.use('/',             require('./routes/pages'));

// ─────────────────────────────────────
// EMAIL TEST ROUTE
// ─────────────────────────────────────
app.get('/test-email', async (req, res) => {
  try {
    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'Festmore <onboarding@resend.dev>',
      to: process.env.EMAIL_USER || 'gha44ar@aim.com',
      subject: 'Festmore Email Test',
      text: 'Email is working! Sent via Resend.'
    });
    res.send('Email sent! Check inbox and spam.');
  } catch(err) {
    res.send('Error: ' + err.message);
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
body{font-family:"DM Sans",sans-serif;background:#faf8f3;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;}
.box{text-align:center;padding:48px;}
h1{font-family:"DM Serif Display",serif;font-size:80px;color:#e8470a;margin:0;font-weight:400;}
h2{font-size:24px;margin:8px 0 16px;color:#1a1612;}
p{color:#7a6f68;margin-bottom:24px;}
a{background:#e8470a;color:#fff;padding:12px 28px;border-radius:99px;text-decoration:none;font-weight:700;}
</style></head>
<body><div class="box">
<h1>404</h1>
<h2>Page not found</h2>
<p>The event might have ended, or this page does not exist.</p>
<a href="/">Back to Festmore</a>
</div></body></html>`);
});

// ─────────────────────────────────────
// AUTOMATED DAILY JOB — 2AM every night
// ─────────────────────────────────────
cron.schedule('0 2 * * *', async () => {
  console.log('Daily automation starting...');
  try {
    const daily = require('./automation/daily');
    await daily.run();
    console.log('Daily automation complete!');
  } catch (err) {
    console.error('Automation error:', err.message);
  }
});

// ─────────────────────────────────────
// HELPER — run a seed script safely
// ─────────────────────────────────────
function runScript(file, label) {
  try {
    if (fs.existsSync(path.join(__dirname, file))) {
      require('./' + file);
      console.log('✅ ' + label);
    } else {
      console.log('⏭️  SKIP ' + label + ' not found');
    }
  } catch(err) {
    console.log('⚠️  WARN ' + label + ': ' + err.message);
  }
}

// ─────────────────────────────────────
// STARTUP — SMART SEEDING
// ─────────────────────────────────────
try {
  const db = require('./db');

  // Ensure tables exist first
  try {
    db.prepare('SELECT COUNT(*) as n FROM events').get();
  } catch(e) {
    console.log('Tables missing — running setup...');
    require('./db/setup');
    console.log('Setup complete');
  }

  const eventCount   = db.prepare('SELECT COUNT(*) as n FROM events').get().n;
  const articleCount = db.prepare('SELECT COUNT(*) as n FROM articles').get().n;

  console.log('📊 Database: ' + eventCount + ' events, ' + articleCount + ' articles');

  if (eventCount < 150) {
    console.log('🌱 Seeding database with all content...');

    // COLUMNS
    runScript('add-photos-columns.js',           'Photos columns');

    // EVENTS
    runScript('add-real-events.js',              'Real events');
    runScript('add-denmark-events.js',           'Denmark events');
    runScript('add-us-city-events.js',           'US city events');
    runScript('add-europe-events.js',            'Europe events');
    runScript('add-new-countries.js',            'New countries events');
    runScript('add-new-country-content.js',      'New country content');
    runScript('add-high-traffic-events.js',      'High traffic events');
    runScript('add-high-traffic-events-2026.js', 'High traffic events 2026');
    runScript('add-kløften-festival.js',         'Kløften Festival');
    runScript('add-holland-flea-markets.js',     'Holland flea markets');

    // VENDORS
    runScript('add-sample-vendors.js',           'Sample vendors');
    runScript('add-bhatti-catering.js',          'Bhatti Catering');

    // ARTICLES
    runScript('add-trending-articles.js',        'Trending articles');
    runScript('add-seo-articles.js',             'SEO articles');
    runScript('add-seo-articles-2026.js',        'SEO articles 2026');
    runScript('add-traffic-articles-2026.js',    'Traffic articles 2026');

    // SUBSCRIBERS
    runScript('add-subscribers.js',              'Subscribers');

    // UPDATES
    runScript('update-dates-2026.js',            'Update dates to 2026');
    runScript('update-event-photos.js',          'Update event photos');
    runScript('update-polandrock-2026.js',       'Update Polandrock 2026');

    console.log('✅ Seeding complete!');

  } else {
    console.log('✅ Database populated — skipping seed scripts');
  }

  // ALWAYS ensure columns exist — safe to run every time
  try { db.prepare("ALTER TABLE vendors ADD COLUMN photos TEXT DEFAULT '[]'").run(); } catch(e) {}
  try { db.prepare("ALTER TABLE vendors ADD COLUMN image_url TEXT").run(); } catch(e) {}
  try { db.prepare("ALTER TABLE vendors ADD COLUMN short_desc TEXT").run(); } catch(e) {}
  try { db.prepare("ALTER TABLE vendors ADD COLUMN updated_at TEXT").run(); } catch(e) {}
  try { db.prepare("ALTER TABLE events ADD COLUMN photos TEXT DEFAULT '[]'").run(); } catch(e) {}
  try { db.prepare("ALTER TABLE events ADD COLUMN updated_at TEXT").run(); } catch(e) {}

  // ALWAYS ensure admin account exists
  try {
    const bcrypt = require('bcryptjs');
    const adminHash = bcrypt.hashSync('Festmore2026!', 10);
    db.prepare('INSERT INTO users (email, password, name, role) VALUES (?,?,?,?) ON CONFLICT (email) DO NOTHING').run('gha44ar@aim.com', adminHash, 'Ghaffar', 'admin');
    db.prepare('UPDATE users SET password=?, role=? WHERE email=?').run(adminHash, 'admin', 'gha44ar@aim.com');
    console.log('✅ Admin account ready — gha44ar@aim.com / Festmore2026!');
  } catch(e) {
    console.log('⚠️  Admin account error: ' + e.message);
  }

  // ALWAYS ensure Toto vendor account exists
  try {
    const bcrypt = require('bcryptjs');
    const totoHash = bcrypt.hashSync('toto9274', 10);
    db.prepare('INSERT INTO users (email, password, name, role) VALUES (?,?,?,?) ON CONFLICT (email) DO NOTHING').run('info@totovinoecucina.nl', totoHash, 'Totó Vino e Cucina', 'vendor');
    console.log('✅ Toto account ready');
  } catch(e) {
    console.log('⚠️  Toto account error: ' + e.message);
  }

  // ALWAYS ensure Toto vendor profile exists
  try {
    const totoExists = db.prepare("SELECT id FROM vendors WHERE email='info@totovinoecucina.nl'").get();
    if (!totoExists) {
      const photos = JSON.stringify(['https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=768,h=469,fit=crop/dJoBO4E41OcprO2x/toto_homepage_headerimage-mP47eOo3glSrnZPx.jpg','https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=768,h=998,fit=crop/dJoBO4E41OcprO2x/italiaanse-wijnen-FsuBU7Td1EhC62jN.webp','https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=375,h=354,fit=crop/dJoBO4E41OcprO2x/tekengebied-1-kopie-13-ALpOD7zz9EIe6nqD.jpg','https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=375,h=354,fit=crop/dJoBO4E41OcprO2x/tekengebied-1-kopie-12-AVLzG144Ejh4a1XG.jpg','https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=375,h=354,fit=crop/dJoBO4E41OcprO2x/tekengebied-1-kopie-11-mjEQ0qOyZ2fl87aw.jpg','https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=768,h=817,fit=crop/dJoBO4E41OcprO2x/pexels-alina-chernii-18771859-AoP6Z7eV59HGj7x8.jpg']);
      const tags = JSON.stringify({tagline:'Authentic Italian food, wine & catering for unforgettable events',price_range:'€€€ Premium',travel_distance:'Anywhere in Europe',what_we_offer:'Totó Vino e Cucina offers authentic Italian catering, private dining, wine tastings and event catering.',looking_for:'Food festivals, cultural events, corporate events and private parties across the Netherlands and Europe.',event_types_wanted:['Festivals','Food Markets','Corporate Events','Private Parties','Outdoor Events','Indoor Events'],availability:['January','February','March','April','May','June','July','August','September','October','November','December'],languages:'Dutch, English, Italian',certifications:'Professional catering license, Food hygiene certified',needs_electricity:'yes',needs_water:'yes',space_required:'4×4m (large stall)'});
      db.prepare("INSERT INTO vendors (business_name,slug,category,city,country,description,website,phone,email,status,payment_status,verified,premium,tags,photos,image_url) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)").run('Totó Vino e Cucina','toto-vino-e-cucina','Food & Drinks','Haarlem','NL','Totó is a premium Italian catering service based in Haarlem, Netherlands. We specialise in private dining, corporate and event catering, wine tastings and Italian food experiences.','https://totovinoecucina.nl','+31 6 16340363','info@totovinoecucina.nl','active','paid',1,0,tags,photos,'https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=768,h=469,fit=crop/dJoBO4E41OcprO2x/toto_homepage_headerimage-mP47eOo3glSrnZPx.jpg');
      console.log('✅ Toto vendor profile created');
    } else {
      console.log('✅ Toto vendor profile exists — ID: ' + totoExists.id);
    }
  } catch(e) {
    console.log('⚠️  Toto vendor error: ' + e.message);
  }

} catch(err) {
  console.log('⚠️  Startup error: ' + err.message);
  try {
    require('./db/setup');
    console.log('✅ Database setup complete');
  } catch(e) {
    console.log('❌ Setup error: ' + e.message);
  }
}

// ─────────────────────────────────────
// START SERVER
// ─────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('🎪 ════════════════════════════════════');
  console.log('   FESTMORE is running on port ' + PORT);
  console.log('   ════════════════════════════════════');
  console.log('');
});

module.exports = app;