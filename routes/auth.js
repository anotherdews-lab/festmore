// routes/auth.js — POLISHED VERSION
const express  = require('express');
const router   = express.Router();
const db       = require('../db');
const bcrypt   = require('bcryptjs');

router.get('/login', (req, res) => {
  res.send(authPage('Login', req.query.error, req.query.redirect));
});

router.post('/login', async (req, res) => {
  const { email, password, redirect = '' } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE email=?").get(email);
  if (!user || !await bcrypt.compare(password, user.password)) {
    return res.redirect('/auth/login?error=Invalid email or password');
  }
  req.session.user = { id: user.id, email: user.email, name: user.name, role: user.role };
  res.redirect(redirect || '/dashboard');
});

router.get('/register', (req, res) => {
  res.send(registerPage(req.query.error));
});

router.post('/register', async (req, res) => {
  const { name, email, password, role = 'visitor' } = req.body;
  if (!name || !email || !password) return res.redirect('/auth/register?error=All fields required');
  if (password.length < 8) return res.redirect('/auth/register?error=Password must be at least 8 characters');
  const exists = db.prepare("SELECT id FROM users WHERE email=?").get(email);
  if (exists) return res.redirect('/auth/register?error=Email already registered');
  const hash = await bcrypt.hash(password, 12);
  const result = db.prepare("INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)").run(name, email, hash, role);
  req.session.user = { id: result.lastInsertRowid, email, name, role };
  res.redirect('/dashboard');
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;

// ─────────────────────────────────────
// LOGIN PAGE
// ─────────────────────────────────────
function authPage(title, error, redirect = '') {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>${title} — Festmore</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="/css/main.css"/>
</head>
<body>

<nav class="main-nav">
  <div class="nav-inner">
    <a href="/" class="logo">
      <span class="logo-fest">Fest</span><span class="logo-more">more</span><span class="logo-dot"></span>
    </a>
  </div>
</nav>

<div class="auth-page">
  <div style="display:grid;grid-template-columns:1fr 1fr;max-width:900px;width:100%;gap:0;border-radius:24px;overflow:hidden;box-shadow:var(--shadow-xl);">

    <!-- LEFT PANEL -->
    <div style="background:var(--ink);padding:52px 44px;display:flex;flex-direction:column;justify-content:center;position:relative;overflow:hidden;">
      <div style="position:absolute;top:-60px;right:-60px;width:240px;height:240px;border-radius:50%;background:radial-gradient(circle,rgba(232,71,10,.2) 0%,transparent 70%);"></div>
      <div class="logo" style="margin-bottom:36px;">
        <span class="logo-fest" style="color:#fff;">Fest</span><span class="logo-more">more</span>
      </div>
      <h2 style="font-family:'DM Serif Display',serif;font-size:28px;font-weight:400;color:#fff;margin-bottom:12px;">Your global event guide</h2>
      <p style="color:rgba(255,255,255,.5);font-size:14px;line-height:1.75;margin-bottom:32px;">Login to manage your events, track views, and control your vendor profile.</p>
      ${[
        ['🎪', 'List & manage events'],
        ['🏪', 'Control vendor profile'],
        ['📊', 'Track views & stats'],
        ['📧', 'Manage newsletter'],
      ].map(([icon, text]) => `
        <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,.07);font-size:13.5px;color:rgba(255,255,255,.65);">
          <span style="font-size:18px;">${icon}</span> ${text}
        </div>`).join('')}
    </div>

    <!-- RIGHT PANEL (FORM) -->
    <div style="background:#fff;padding:52px 44px;">
      ${error ? `<div class="alert alert-error" style="margin-bottom:20px;">⚠️ ${error}</div>` : ''}
      <h1 style="font-family:'DM Serif Display',serif;font-size:30px;font-weight:400;margin-bottom:6px;">Welcome back</h1>
      <p style="color:var(--ink3);font-size:14px;margin-bottom:28px;">Login to your Festmore account</p>
      <form method="POST" action="/auth/login${redirect ? '?redirect=' + encodeURIComponent(redirect) : ''}">
        <div class="form-group" style="margin-bottom:16px;">
          <label class="form-label">Email Address</label>
          <input class="form-input" type="email" name="email" required placeholder="your@email.com" autofocus/>
        </div>
        <div class="form-group" style="margin-bottom:24px;">
          <label class="form-label">Password</label>
          <input class="form-input" type="password" name="password" required placeholder="Your password"/>
        </div>
        <button type="submit" class="btn btn-primary" style="width:100%;padding:14px;font-size:15px;border-radius:10px;">Login to Dashboard →</button>
      </form>
      <p style="text-align:center;margin-top:20px;font-size:13.5px;color:var(--ink3);">
        Don't have an account? <a href="/auth/register" style="color:var(--flame);font-weight:700;">Register free</a>
      </p>
    </div>

  </div>
</div>

</body>
</html>`;
}

// ─────────────────────────────────────
// REGISTER PAGE
// ─────────────────────────────────────
function registerPage(error) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Create Account — Festmore</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="/css/main.css"/>
</head>
<body>

<nav class="main-nav">
  <div class="nav-inner">
    <a href="/" class="logo">
      <span class="logo-fest">Fest</span><span class="logo-more">more</span><span class="logo-dot"></span>
    </a>
  </div>
</nav>

<div class="auth-page">
  <div style="display:grid;grid-template-columns:1fr 1fr;max-width:900px;width:100%;gap:0;border-radius:24px;overflow:hidden;box-shadow:var(--shadow-xl);">

    <!-- LEFT PANEL -->
    <div style="background:var(--ink);padding:52px 44px;display:flex;flex-direction:column;justify-content:center;position:relative;overflow:hidden;">
      <div style="position:absolute;bottom:-60px;left:-60px;width:240px;height:240px;border-radius:50%;background:radial-gradient(circle,rgba(232,71,10,.15) 0%,transparent 70%);"></div>
      <div class="logo" style="margin-bottom:36px;">
        <span class="logo-fest" style="color:#fff;">Fest</span><span class="logo-more">more</span>
      </div>
      <h2 style="font-family:'DM Serif Display',serif;font-size:28px;font-weight:400;color:#fff;margin-bottom:12px;">Join Festmore today</h2>
      <p style="color:rgba(255,255,255,.5);font-size:14px;line-height:1.75;margin-bottom:32px;">Create your free account and start listing events or building your vendor profile.</p>

      <!-- PRICING CARDS -->
      <div style="display:flex;flex-direction:column;gap:10px;">
        <div style="background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:14px 18px;">
          <div style="font-size:12px;font-weight:700;color:rgba(255,255,255,.5);text-transform:uppercase;letter-spacing:.8px;margin-bottom:4px;">Event Organiser</div>
          <div style="font-size:20px;font-family:'DM Serif Display',serif;color:#fff;">€79 <span style="font-size:13px;color:rgba(255,255,255,.45);font-family:'DM Sans',sans-serif;">/ year</span></div>
          <div style="font-size:12.5px;color:rgba(255,255,255,.45);margin-top:3px;">List unlimited events</div>
        </div>
        <div style="background:rgba(232,71,10,.12);border:1px solid rgba(232,71,10,.25);border-radius:12px;padding:14px 18px;">
          <div style="font-size:12px;font-weight:700;color:var(--flame2);text-transform:uppercase;letter-spacing:.8px;margin-bottom:4px;">Vendor</div>
          <div style="font-size:20px;font-family:'DM Serif Display',serif;color:#fff;">€49 <span style="font-size:13px;color:rgba(255,255,255,.45);font-family:'DM Sans',sans-serif;">/ year</span></div>
          <div style="font-size:12.5px;color:rgba(255,255,255,.45);margin-top:3px;">Verified profile + event applications</div>
        </div>
      </div>
    </div>

    <!-- RIGHT PANEL (FORM) -->
    <div style="background:#fff;padding:52px 44px;">
      ${error ? `<div class="alert alert-error" style="margin-bottom:20px;">⚠️ ${error}</div>` : ''}
      <h1 style="font-family:'DM Serif Display',serif;font-size:30px;font-weight:400;margin-bottom:6px;">Create your account</h1>
      <p style="color:var(--ink3);font-size:14px;margin-bottom:28px;">Free to register — pay only when you list</p>
      <form method="POST" action="/auth/register">
        <div class="form-group" style="margin-bottom:14px;">
          <label class="form-label">Full Name</label>
          <input class="form-input" type="text" name="name" required placeholder="Your name" autofocus/>
        </div>
        <div class="form-group" style="margin-bottom:14px;">
          <label class="form-label">Email Address</label>
          <input class="form-input" type="email" name="email" required placeholder="your@email.com"/>
        </div>
        <div class="form-group" style="margin-bottom:14px;">
          <label class="form-label">Password</label>
          <input class="form-input" type="password" name="password" required placeholder="At least 8 characters"/>
        </div>
        <div class="form-group" style="margin-bottom:24px;">
          <label class="form-label">I am a…</label>
          <select class="form-input" name="role">
            <option value="visitor">👀 Visitor — Just browsing events (Free)</option>
            <option value="organiser">🎪 Event Organiser — I want to list events (€79/yr)</option>
            <option value="vendor">🏪 Vendor — I want to work at events (€49/yr)</option>
          </select>
        </div>
        <button type="submit" class="btn btn-primary" style="width:100%;padding:14px;font-size:15px;border-radius:10px;">Create Account →</button>
      </form>
      <p style="text-align:center;margin-top:20px;font-size:13.5px;color:var(--ink3);">
        Already have an account? <a href="/auth/login" style="color:var(--flame);font-weight:700;">Login</a>
      </p>
    </div>

  </div>
</div>

</body>
</html>`;
}