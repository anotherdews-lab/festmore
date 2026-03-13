/ routes/pages.js — Contact & About pages
const express = require('express');
const router  = express.Router();
const db      = require('../db');
const nodemailer = require('nodemailer');

// ─────────────────────────────────────
// ABOUT PAGE
// ─────────────────────────────────────
router.get('/about', (req, res) => {
  const stats = {
    events:   db.prepare("SELECT COUNT(*) as n FROM events WHERE status='active'").get().n,
    vendors:  db.prepare("SELECT COUNT(*) as n FROM vendors WHERE status='active'").get().n,
    articles: db.prepare("SELECT COUNT(*) as n FROM articles WHERE status='published'").get().n,
  };

  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>About Festmore — Your Global Event Guide</title>
<meta name="description" content="Festmore is your global guide to festivals, markets, concerts and events across 11 countries. Updated daily with new events and articles."/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/>
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2486135003689222" crossorigin="anonymous"></script>
<link rel="stylesheet" href="/css/main.css"/>
</head>
<body>

${renderNav(req.session.user)}

<!-- HERO -->
<div style="background:var(--ink);padding:80px 0;position:relative;overflow:hidden;">
  <div style="position:absolute;inset:0;background:radial-gradient(ellipse 60% 80% at 70% 50%,rgba(232,71,10,.12) 0%,transparent 70%);"></div>
  <div class="container" style="position:relative;max-width:820px;">
    <div style="display:inline-flex;align-items:center;gap:8px;background:rgba(232,71,10,.12);border:1px solid rgba(232,71,10,.25);color:var(--flame);font-size:11px;font-weight:700;padding:4px 14px;border-radius:99px;margin-bottom:20px;letter-spacing:.8px;text-transform:uppercase;">
      <span style="width:5px;height:5px;border-radius:50%;background:var(--flame);display:inline-block;"></span> Our Story
    </div>
    <h1 style="font-family:'DM Serif Display',serif;font-size:clamp(36px,5vw,60px);font-weight:400;color:#fff;margin-bottom:18px;line-height:1.08;">
      The World's Events,<br/><em style="color:var(--flame);">All in One Place</em>
    </h1>
    <p style="color:rgba(255,255,255,.55);font-size:17px;line-height:1.8;max-width:600px;">
      Festmore was built to make it easier to discover and attend the world's best events — from Christmas markets in Germany to jazz festivals in Copenhagen, food markets in London to trade fairs in Dubai.
    </p>
  </div>
</div>

<!-- STATS STRIP -->
<div class="stats-strip">
  <div class="stats-strip-inner">
    <div class="strip-stat"><span class="strip-stat-n">${stats.events}+</span><span class="strip-stat-l">Events Listed</span></div>
    <div class="strip-div"></div>
    <div class="strip-stat"><span class="strip-stat-n">11</span><span class="strip-stat-l">Countries</span></div>
    <div class="strip-div"></div>
    <div class="strip-stat"><span class="strip-stat-n">${stats.vendors}+</span><span class="strip-stat-l">Verified Vendors</span></div>
    <div class="strip-div"></div>
    <div class="strip-stat"><span class="strip-stat-n">${stats.articles}+</span><span class="strip-stat-l">Articles Published</span></div>
  </div>
</div>

<!-- MISSION -->
<section class="section">
  <div class="container" style="max-width:900px;">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;">
      <div>
        <h2 style="font-family:'DM Serif Display',serif;font-size:clamp(26px,3vw,38px);font-weight:400;margin-bottom:16px;">Why We Built Festmore</h2>
        <p style="color:var(--ink3);font-size:15.5px;line-height:1.8;margin-bottom:16px;">Finding great events used to mean hours of searching across dozens of different websites, social media pages and local guides — all in different languages.</p>
        <p style="color:var(--ink3);font-size:15.5px;line-height:1.8;margin-bottom:16px;">Festmore brings everything together in one place. We cover festivals, markets, concerts, exhibitions, trade fairs and more — across 11 countries and growing.</p>
        <p style="color:var(--ink3);font-size:15.5px;line-height:1.8;">New events and articles are added every single day, automatically, so you never miss what's happening near you or around the world.</p>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
        ${[
          ['🎪','Festivals','From small local fests to massive international events'],
          ['🛍️','Markets','Street markets, food markets, Christmas markets'],
          ['🎵','Concerts','Live music events across all genres'],
          ['🏛️','Trade Fairs','Business events and professional expos'],
        ].map(([icon, title, desc]) => `
          <div style="background:#fff;border:1px solid var(--border);border-radius:16px;padding:22px 18px;">
            <div style="font-size:28px;margin-bottom:10px;">${icon}</div>
            <div style="font-size:14px;font-weight:700;color:var(--ink);margin-bottom:6px;">${title}</div>
            <div style="font-size:12.5px;color:var(--ink3);line-height:1.55;">${desc}</div>
          </div>`).join('')}
      </div>
    </div>
  </div>
</section>

<!-- HOW IT WORKS -->
<section class="section section-warm">
  <div class="container" style="max-width:900px;">
    <div class="section-header">
      <div><h2 class="section-title">How Festmore Works</h2><p class="section-sub">For visitors, organisers and vendors</p></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:24px;">
      ${[
        ['🌍','Discover Events','Browse thousands of events filtered by country, category, date and price. All free to search.'],
        ['🎪','List Your Event','Event organisers can list their festival, market or concert for €79/year and reach visitors worldwide.'],
        ['🏪','Join as Vendor','Vendors create a verified profile for €49/year and get discovered by event organisers across Europe.'],
      ].map(([icon, title, desc], i) => `
        <div style="text-align:center;padding:32px 24px;background:#fff;border:1px solid var(--border);border-radius:20px;">
          <div style="width:56px;height:56px;background:rgba(232,71,10,.08);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:26px;">${icon}</div>
          <div style="font-size:11px;font-weight:700;color:var(--flame);text-transform:uppercase;letter-spacing:.8px;margin-bottom:8px;">Step ${i+1}</div>
          <h3 style="font-family:'DM Serif Display',serif;font-size:18px;font-weight:400;margin-bottom:10px;">${title}</h3>
          <p style="font-size:13.5px;color:var(--ink3);line-height:1.65;">${desc}</p>
        </div>`).join('')}
    </div>
  </div>
</section>

<!-- CTA -->
<section class="cta-section">
  <div class="container" style="text-align:center;max-width:680px;">
    <h2 style="font-family:'DM Serif Display',serif;font-size:clamp(26px,3.5vw,44px);font-weight:400;color:#fff;margin-bottom:14px;">Ready to Get Started?</h2>
    <p style="color:rgba(255,255,255,.55);font-size:16px;line-height:1.75;margin-bottom:32px;">Browse thousands of events for free, or list your own event and reach visitors worldwide.</p>
    <div style="display:flex;gap:14px;justify-content:center;flex-wrap:wrap;">
      <a href="/events" class="btn btn-primary btn-lg">Browse Events →</a>
      <a href="/events/submit" class="btn btn-outline-white btn-lg">List Your Event</a>
      <a href="/vendors/register" class="btn btn-outline-white btn-lg">Become a Vendor</a>
    </div>
  </div>
</section>

<!-- AD -->
<div class="ad-leaderboard"><div class="ad-label-small">Advertisement</div>
<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-2486135003689222" data-ad-format="auto" data-full-width-responsive="true"></ins>
<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
</div>

${renderFooterSimple()}
</body>
</html>`);
});

// ─────────────────────────────────────
// CONTACT PAGE
// ─────────────────────────────────────
router.get('/contact', (req, res) => {
  res.send(contactPage(req.session.user, '', req.query.success, req.query.error));
});

router.post('/contact', async (req, res) => {
  const { name, email, subject, message, type } = req.body;
  if (!name || !email || !message) {
    return res.redirect('/contact?error=Please fill in all required fields');
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `[Festmore Contact] ${subject || type || 'General Enquiry'} — from ${name}`,
      html: `
        <h2>New contact form submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Type:</strong> ${type || 'General'}</p>
        <p><strong>Subject:</strong> ${subject || '—'}</p>
        <hr/>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br/>')}</p>
      `
    });

    res.redirect('/contact?success=Message sent! We will get back to you within 24 hours.');
  } catch (err) {
    console.error('Email error:', err.message);
    res.redirect('/contact?error=Could not send message. Please email us directly at ' + process.env.EMAIL_USER);
  }
});

// ─────────────────────────────────────
// PRIVACY PAGE
// ─────────────────────────────────────
router.get('/privacy', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Privacy Policy — Festmore</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="/css/main.css"/>
</head>
<body>
${renderNav(req.session.user)}
<div class="page-hero-small"><div class="container"><h1>Privacy Policy</h1><p>Last updated: January 2025</p></div></div>
<div class="container" style="padding:56px 0;max-width:760px;">
  <div style="background:#fff;border:1px solid var(--border);border-radius:20px;padding:40px 48px;">
    <div class="article-content">
      <h2>1. What We Collect</h2>
      <p>When you use Festmore, we may collect your name, email address, and payment information (processed securely by Stripe). We also collect usage data such as pages visited and events viewed.</p>
      <h2>2. How We Use Your Data</h2>
      <p>We use your data to operate the website, process payments, send newsletters (only if you subscribe), and improve our service. We never sell your personal data to third parties.</p>
      <h2>3. Cookies</h2>
      <p>We use cookies to keep you logged in and to serve Google AdSense advertisements. You can disable cookies in your browser settings, though this may affect site functionality.</p>
      <h2>4. Google AdSense</h2>
      <p>We use Google AdSense to display advertisements. Google may use cookies to serve ads based on your prior visits to our website or other websites. You can opt out at <a href="https://www.google.com/settings/ads" style="color:var(--flame);">google.com/settings/ads</a>.</p>
      <h2>5. Stripe Payments</h2>
      <p>All payments are processed securely by Stripe. We do not store your full card details on our servers. Stripe's privacy policy applies to payment data.</p>
      <h2>6. Your Rights</h2>
      <p>You have the right to access, correct or delete your personal data. To request this, contact us at <a href="mailto:${process.env.EMAIL_USER || 'hello@festmore.com'}" style="color:var(--flame);">${process.env.EMAIL_USER || 'hello@festmore.com'}</a>.</p>
      <h2>7. Contact</h2>
      <p>For any privacy questions, email us at <a href="mailto:${process.env.EMAIL_USER || 'hello@festmore.com'}" style="color:var(--flame);">${process.env.EMAIL_USER || 'hello@festmore.com'}</a>.</p>
    </div>
  </div>
</div>
${renderFooterSimple()}
</body>
</html>`);
});

module.exports = router;

// ─────────────────────────────────────
// CONTACT PAGE HTML
// ─────────────────────────────────────
function contactPage(user, prefill, success, error) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Contact Festmore — Get in Touch</title>
<meta name="description" content="Contact the Festmore team. Questions about listing your event, vendor profiles or anything else — we're here to help."/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/>
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2486135003689222" crossorigin="anonymous"></script>
<link rel="stylesheet" href="/css/main.css"/>
</head>
<body>

${renderNav(user)}

<div class="page-hero-small">
  <div class="container">
    <h1>Get in Touch</h1>
    <p>We usually reply within 24 hours</p>
  </div>
</div>

<div class="container" style="padding:56px 0;display:grid;grid-template-columns:1fr 380px;gap:48px;align-items:start;max-width:1100px;">

  <!-- FORM -->
  <div>
    ${success ? `<div class="alert alert-success">✅ ${success}</div>` : ''}
    ${error   ? `<div class="alert alert-error">⚠️ ${error}</div>`   : ''}
    <div class="form-card">
      <div class="form-card-header">
        <h2>Send Us a Message</h2>
      </div>
      <form method="POST" action="/contact">
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Your Name *</label>
            <input class="form-input" type="text" name="name" required placeholder="Your full name"/>
          </div>
          <div class="form-group">
            <label class="form-label">Your Email *</label>
            <input class="form-input" type="email" name="email" required placeholder="your@email.com"/>
          </div>
          <div class="form-group full">
            <label class="form-label">What is this about?</label>
            <select class="form-input" name="type">
              <option value="General">General Enquiry</option>
              <option value="Event Listing">Event Listing Question</option>
              <option value="Vendor Profile">Vendor Profile Question</option>
              <option value="Payment Issue">Payment Issue</option>
              <option value="Technical Problem">Technical Problem</option>
              <option value="Partnership">Partnership / Advertising</option>
              <option value="Press">Press Enquiry</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div class="form-group full">
            <label class="form-label">Subject</label>
            <input class="form-input" type="text" name="subject" placeholder="Brief subject line"/>
          </div>
          <div class="form-group full">
            <label class="form-label">Message *</label>
            <textarea class="form-input" name="message" rows="6" required placeholder="Tell us how we can help…"></textarea>
          </div>
        </div>
        <div style="margin-top:24px;">
          <button type="submit" class="btn btn-primary btn-lg" style="width:100%;">Send Message →</button>
        </div>
      </form>
    </div>
  </div>

  <!-- SIDEBAR -->
  <aside>
    <!-- CONTACT INFO -->
    <div style="background:#fff;border:1px solid var(--border);border-radius:20px;padding:28px;margin-bottom:20px;">
      <h3 style="font-family:'DM Serif Display',serif;font-size:20px;font-weight:400;margin-bottom:20px;">Contact Info</h3>
      ${[
        ['📧', 'Email', process.env.EMAIL_USER || 'hello@festmore.com'],
        ['⏱️', 'Response Time', 'Within 24 hours'],
        ['🌍', 'Coverage', '11 countries worldwide'],
        ['🕐', 'Hours', 'Mon–Fri, 9am–6pm CET'],
      ].map(([icon, label, value]) => `
        <div style="display:flex;align-items:flex-start;gap:12px;padding:12px 0;border-bottom:1px solid var(--border);">
          <span style="font-size:20px;flex-shrink:0;">${icon}</span>
          <div>
            <div style="font-size:11px;font-weight:700;color:var(--ink4);text-transform:uppercase;letter-spacing:.8px;margin-bottom:2px;">${label}</div>
            <div style="font-size:14px;color:var(--ink2);">${value}</div>
          </div>
        </div>`).join('')}
    </div>

    <!-- QUICK LINKS -->
    <div style="background:var(--ink);border-radius:20px;padding:28px;color:#fff;">
      <h3 style="font-family:'DM Serif Display',serif;font-size:18px;font-weight:400;margin-bottom:16px;">Quick Links</h3>
      ${[
        ['/events/submit', '🎪 List Your Event — €79/yr'],
        ['/vendors/register', '🏪 Become a Vendor — €49/yr'],
        ['/auth/register', '👤 Create Free Account'],
        ['/about', 'ℹ️ About Festmore'],
        ['/privacy', '🔒 Privacy Policy'],
      ].map(([href, label]) => `
        <a href="${href}" style="display:flex;align-items:center;gap:10px;padding:11px 0;border-bottom:1px solid rgba(255,255,255,.07);font-size:13.5px;color:rgba(255,255,255,.65);transition:color .2s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='rgba(255,255,255,.65)'">${label}</a>`).join('')}
    </div>

    <!-- AD -->
    <div style="margin-top:20px;"><div class="ad-label-small">Advertisement</div>
    <ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-2486135003689222" data-ad-format="auto" data-full-width-responsive="true"></ins>
    <script>(adsbygoogle = window.adsbygoogle || []).push({});</script></div>
  </aside>
</div>

${renderFooterSimple()}
</body>
</html>`;
}

// ─────────────────────────────────────
// HELPERS
// ─────────────────────────────────────
function renderNav(user) {
  return `<nav class="main-nav">
  <div class="nav-inner">
    <a href="/" class="logo"><span class="logo-fest">Fest</span><span class="logo-more">more</span><span class="logo-dot"></span></a>
    <form class="nav-search" action="/events" method="GET">
      <span style="color:var(--ink4);font-size:15px;">🔍</span>
      <input type="text" name="q" placeholder="Search events…"/>
    </form>
    <div class="nav-right">
      ${user
        ? `<a href="/dashboard" class="btn btn-outline btn-sm">Dashboard</a><a href="/auth/logout" class="btn btn-ghost btn-sm">Logout</a>`
        : `<a href="/auth/login" class="btn btn-outline btn-sm">Login</a><a href="/events/submit" class="btn btn-primary btn-sm">+ List Event</a>`
      }
    </div>
    <button class="nav-burger" onclick="document.querySelector('.nav-mobile').classList.toggle('open')">☰</button>
  </div>
  <div class="nav-cats-bar">
    <a href="/events" class="nav-cat">🌍 All</a>
    <a href="/events?category=festival" class="nav-cat">🎪 Festivals</a>
    <a href="/events?category=market" class="nav-cat">🛍️ Markets</a>
    <a href="/events?category=christmas" class="nav-cat">🎄 Xmas Markets</a>
    <a href="/events?category=concert" class="nav-cat">🎵 Concerts</a>
    <a href="/articles" class="nav-cat">📰 Articles</a>
    <a href="/vendors" class="nav-cat">🏪 Vendors</a>
    <a href="/about" class="nav-cat">ℹ️ About</a>
    <a href="/contact" class="nav-cat">✉️ Contact</a>
  </div>
  <div class="nav-mobile">
    <a href="/events">🌍 All Events</a>
    <a href="/articles">📰 Articles</a>
    <a href="/vendors">🏪 Vendors</a>
    <a href="/about">ℹ️ About</a>
    <a href="/contact">✉️ Contact</a>
    <a href="/events/submit">+ List Your Event</a>
    ${user ? `<a href="/dashboard">Dashboard</a><a href="/auth/logout">Logout</a>` : `<a href="/auth/login">Login</a>`}
  </div>
</nav>`;
}

function renderFooterSimple() {
  return `<footer>
  <div class="footer-bottom">
    <span>© ${new Date().getFullYear()} Festmore.com — All rights reserved</span>
    <div style="display:flex;gap:20px;flex-wrap:wrap;">
      <a href="/" style="color:rgba(255,255,255,.35);font-size:13px;">Home</a>
      <a href="/events" style="color:rgba(255,255,255,.35);font-size:13px;">Events</a>
      <a href="/vendors" style="color:rgba(255,255,255,.35);font-size:13px;">Vendors</a>
      <a href="/about" style="color:rgba(255,255,255,.35);font-size:13px;">About</a>
      <a href="/contact" style="color:rgba(255,255,255,.35);font-size:13px;">Contact</a>
      <a href="/privacy" style="color:rgba(255,255,255,.35);font-size:13px;">Privacy</a>
    </div>
  </div>
</footer>`;
}