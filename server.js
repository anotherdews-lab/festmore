// server.js
// This is the main file that runs your entire website
// Start it with: npm run dev  (for testing)
//                npm start    (for live)

require('dotenv').config();
const express    = require('express');
const session    = require('express-session');
const path       = require('path');
const cron       = require('node-cron');

const app  = express();
const PORT = process.env.PORT || 3000;

// ─────────────────────────────────────
// MIDDLEWARE
// (things that run on every request)
// ─────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Sessions (keeps users logged in)
app.use(session({
  secret: process.env.SESSION_SECRET || 'festmore-dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 7 * 24 * 60 * 60 * 1000 } // 7 days
}));

// Make user available in all views
app.use((req, res, next) => {
  res.locals.user       = req.session.user || null;
  res.locals.siteUrl    = process.env.SITE_URL || 'http://localhost:3000';
  res.locals.adsenseId  = process.env.ADSENSE_ID || '';
  res.locals.stripePub  = process.env.STRIPE_PUBLISHABLE_KEY || '';
  next();
});

// ─────────────────────────────────────
// ROUTES
// ─────────────────────────────────────
app.use('/',          require('./routes/home'));
app.use('/events',    require('./routes/events'));
app.use('/vendors',   require('./routes/vendors'));
app.use('/articles',  require('./routes/articles'));
app.use('/auth',      require('./routes/auth'));
app.use('/dashboard', require('./routes/dashboard'));
app.use('/payments',  require('./routes/payments'));
app.use('/api',       require('./routes/api'));
app.use('/', require('./routes/sitemap'));
app.use('/admin',     require('./routes/admin'));
app.use('/applications', require('./routes/applications'));
app.use('/', require('./routes/pages'));

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
  res.status(404).send(`
    <!DOCTYPE html>
    <html><head><title>Page Not Found — Festmore</title>
    <meta name="viewport" content="width=device-width,initial-scale=1"/>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Plus+Jakarta+Sans:wght@400;600&display=swap" rel="stylesheet"/>
    <style>
      body{font-family:'Plus Jakarta Sans',sans-serif;background:#faf8f3;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;}
      .box{text-align:center;padding:48px;}
      h1{font-family:'Playfair Display',serif;font-size:80px;color:#e8470a;margin:0;}
      h2{font-size:24px;margin:8px 0 16px;}
      p{color:#7a6f68;margin-bottom:24px;}
      a{background:#e8470a;color:#fff;padding:12px 28px;border-radius:99px;text-decoration:none;font-weight:700;}
    </style></head>
    <body><div class="box">
      <h1>404</h1>
      <h2>Page not found</h2>
      <p>The event might have ended, or this page doesn't exist.</p>
      <a href="/">Back to Festmore</a>
    </div></body></html>
  `);
});

// ─────────────────────────────────────
// AUTOMATED DAILY JOB
// Runs at 2:00 AM every night
// Writes 10 new AI articles automatically
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
// START SERVER
// ─────────────────────────────────────
// Run US city events script once on startup
try {
  const fs = require('fs');
  if (fs.existsSync('./add-us-city-events.js')) {
    require('./add-us-city-events.js');
  }
} catch(err) {
  console.log('Events script:', err.message);
}
try {
  const fs = require('fs');
  if (fs.existsSync('./add-sample-vendors.js')) {
    require('./add-sample-vendors.js');
  }
} catch(err) {
  console.log('Vendors script:', err.message);
}
try {
  if (require('fs').existsSync('./add-trending-articles.js')) {
    require('./add-trending-articles.js');
  }
} catch(err) { console.log('Articles script:', err.message); }

try {
  if (require('fs').existsSync('./add-holland-flea-markets.js')) {
    require('./add-holland-flea-markets.js');
  }
} catch(err) { console.log('Markets script:', err.message); }

try {
  if (require('fs').existsSync('./add-subscribers.js')) {
    require('./add-subscribers.js');
  }
} catch(err) { console.log('Subscribers script:', err.message); }

try {
  if (require('fs').existsSync('./add-europe-events.js')) {
    require('./add-europe-events.js');
  }
} catch(err) { console.log('Europe events:', err.message); }

try {
  if (require('fs').existsSync('./add-seo-articles.js')) {
    require('./add-seo-articles.js');
  }
} catch(err) { console.log('SEO articles:', err.message); }

try {
  if (require('fs').existsSync('./add-new-country-content.js')) {
    require('./add-new-country-content.js');
  }
} catch(err) { console.log('New content:', err.message); }

app.use('/photos', require('./routes/photos'));

try {
  if (require('fs').existsSync('./add-photos-columns.js')) {
    require('./add-photos-columns.js');
  }
} catch(err) { console.log('Photos columns:', err.message); }



app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('🎪 ════════════════════════════════════');
  console.log('   FESTMORE is running!');
  console.log(`   Open in browser: http://localhost:${PORT}`);
  console.log('   ════════════════════════════════════');
  console.log('');
});

module.exports = app;
