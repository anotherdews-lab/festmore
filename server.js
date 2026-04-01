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
// REDIRECT GHOST WORDPRESS URLS
// ─────────────────────────────────────
app.get('/', (req, res, next) => {
  if (req.query.mep_events) {
    return res.redirect(301, '/events/' + req.query.mep_events);
  }
  next();
});

// ─────────────────────────────────────
// TEMP ROUTE — fix toto login
// Remove after use
// ─────────────────────────────────────
app.get('/admin/fix-toto-login', (req, res) => {
  const db = require('./db');
  const bcrypt = require('bcryptjs');
  try {
    const hash = bcrypt.hashSync('toto9274', 10);
    db.prepare('INSERT OR IGNORE INTO users (email, password, name, role) VALUES (?,?,?,?)').run('info@totovinoecucina.nl', hash, 'Toto Vino e Cucina', 'vendor');
    db.prepare('UPDATE users SET password=?, role=? WHERE email=?').run(hash, 'vendor', 'info@totovinoecucina.nl');
    const user = db.prepare('SELECT id, email, role FROM users WHERE email=?').get('info@totovinoecucina.nl');
    res.send('Done: ' + JSON.stringify(user));
  } catch(err) {
    res.send('Error: ' + err.message);
  }
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
app.use('/admin',        require('./routes/admin'));
app.use('/applications', require('./routes/applications'));
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
      to: process.env.EMAIL_USER,
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
  res.status(404).send('<!DOCTYPE html><html><head><title>Page Not Found — Festmore</title><meta name="viewport" content="width=device-width,initial-scale=1"/><link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;600&display=swap" rel="stylesheet"/><style>body{font-family:"DM Sans",sans-serif;background:#faf8f3;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;}.box{text-align:center;padding:48px;}h1{font-family:"DM Serif Display",serif;font-size:80px;color:#e8470a;margin:0;font-weight:400;}h2{font-size:24px;margin:8px 0 16px;color:#1a1612;}p{color:#7a6f68;margin-bottom:24px;}a{background:#e8470a;color:#fff;padding:12px 28px;border-radius:99px;text-decoration:none;font-weight:700;}</style></head><body><div class="box"><h1>404</h1><h2>Page not found</h2><p>The event might have ended, or this page does not exist.</p><a href="/">Back to Festmore</a></div></body></html>');
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
    if (fs.existsSync('./' + file)) {
      require('./' + file);
      console.log('OK ' + label);
    } else {
      console.log('SKIP ' + label + ' not found');
    }
  } catch(err) {
    console.log('WARN ' + label + ': ' + err.message);
  }
}

// ─────────────────────────────────────
// STARTUP — SMART SEEDING
// ─────────────────────────────────────
try {
  const db = require('./db');
  const eventCount = db.prepare('SELECT COUNT(*) as n FROM events').get().n;

  console.log('Database: ' + eventCount + ' events found');

  if (eventCount < 50) {
    console.log('Empty database detected — seeding now...');

    runScript('add-photos-columns.js',           'Photos columns');
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
    runScript('add-trending-articles.js',        'Trending articles');
    runScript('add-seo-articles.js',             'SEO articles');
    runScript('add-seo-articles-2026.js',        'SEO articles 2026');
    runScript('add-subscribers.js',              'Subscribers');
    runScript('update-dates-2026.js',            'Update dates to 2026');
    runScript('update-event-photos.js',          'Update event photos');

    console.log('Seeding complete!');

  } else {
    console.log('Database populated — skipping ALL scripts');
  }

   // ALWAYS ensure admin account exists
  try {
    const bcrypt = require('bcryptjs');
    const adminHash = bcrypt.hashSync('Festmore2026!', 10);
    db.prepare('INSERT OR IGNORE INTO users (email, password, name, role) VALUES (?,?,?,?)').run('gha44ar@aim.com', adminHash, 'Ghaffar', 'admin');
    db.prepare('UPDATE users SET role=? WHERE email=?').run('admin', 'gha44ar@aim.com');
  } catch(e) {}

} catch(err) {
  console.log('Startup check error: ' + err.message);
  try {
    console.log('Running database setup...');
    require('./db/setup');
    console.log('Database setup complete');
  } catch(e) {
    console.log('Setup error: ' + e.message);
  }
}

// ─────────────────────────────────────
// START SERVER
// ─────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log('FESTMORE is running on port ' + PORT);
});

module.exports = app;