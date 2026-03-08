// routes/auth.js
const express  = require('express');
const router   = express.Router();
const db       = require('../db');
const bcrypt   = require('bcryptjs');

router.get('/login', (req, res) => {
  res.send(authPage('Login', req.query.error, req.query.redirect));
});

router.post('/login', async (req, res) => {
  const { email, password, redirect='' } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE email=?").get(email);
  if (!user || !await bcrypt.compare(password, user.password)) {
    return res.redirect('/auth/login?error=Invalid email or password');
  }
  req.session.user = { id:user.id, email:user.email, name:user.name, role:user.role };
  res.redirect(redirect || '/dashboard');
});

router.get('/register', (req, res) => {
  res.send(registerPage(req.query.error));
});

router.post('/register', async (req, res) => {
  const { name, email, password, role='visitor' } = req.body;
  if (!name || !email || !password) return res.redirect('/auth/register?error=All fields required');
  if (password.length < 8) return res.redirect('/auth/register?error=Password must be at least 8 characters');
  const exists = db.prepare("SELECT id FROM users WHERE email=?").get(email);
  if (exists) return res.redirect('/auth/register?error=Email already registered');
  const hash = await bcrypt.hash(password, 12);
  const result = db.prepare("INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)").run(name, email, hash, role);
  req.session.user = { id:result.lastInsertRowid, email, name, role };
  res.redirect('/dashboard');
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;

function authPage(title, error, redirect='') {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>${title} — Festmore</title><link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet"/><link rel="stylesheet" href="/css/main.css"/></head><body>
<nav class="main-nav"><div class="nav-inner"><a href="/" class="logo"><span class="logo-fest">Fest</span><span class="logo-more">more</span><span class="logo-dot"></span></a></div></nav>
<div class="auth-page"><div class="auth-card">
${error?`<div class="alert alert-error">⚠️ ${error}</div>`:''}
<h1>${title} to Festmore</h1>
<p class="auth-sub">Manage your events and vendor profile</p>
<form method="POST" action="/auth/login${redirect?'?redirect='+encodeURIComponent(redirect):''}">
  <div class="form-group" style="margin-bottom:14px;"><label class="form-label">Email Address</label><input class="form-input" type="email" name="email" required placeholder="your@email.com"/></div>
  <div class="form-group" style="margin-bottom:20px;"><label class="form-label">Password</label><input class="form-input" type="password" name="password" required placeholder="Your password"/></div>
  <button type="submit" class="btn btn-primary" style="width:100%;padding:14px;font-size:15px;border-radius:10px;">Login →</button>
</form>
<p style="text-align:center;margin-top:16px;font-size:13px;color:var(--ink3);">Don't have an account? <a href="/auth/register" style="color:var(--flame);font-weight:700;">Register free</a></p>
</div></div></body></html>`;
}

function registerPage(error) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>Create Account — Festmore</title><link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet"/><link rel="stylesheet" href="/css/main.css"/></head><body>
<nav class="main-nav"><div class="nav-inner"><a href="/" class="logo"><span class="logo-fest">Fest</span><span class="logo-more">more</span><span class="logo-dot"></span></a></div></nav>
<div class="auth-page"><div class="auth-card">
${error?`<div class="alert alert-error">⚠️ ${error}</div>`:''}
<h1>Join Festmore</h1><p class="auth-sub">Create your free account</p>
<form method="POST" action="/auth/register">
  <div class="form-group" style="margin-bottom:14px;"><label class="form-label">Full Name</label><input class="form-input" type="text" name="name" required placeholder="Your name"/></div>
  <div class="form-group" style="margin-bottom:14px;"><label class="form-label">Email Address</label><input class="form-input" type="email" name="email" required placeholder="your@email.com"/></div>
  <div class="form-group" style="margin-bottom:14px;"><label class="form-label">Password</label><input class="form-input" type="password" name="password" required placeholder="At least 8 characters"/></div>
  <div class="form-group" style="margin-bottom:20px;"><label class="form-label">I am a…</label>
    <select class="form-input" name="role">
      <option value="visitor">Visitor — Just browsing events (Free)</option>
      <option value="organiser">Event Organiser — I want to list events (€79/yr)</option>
      <option value="vendor">Vendor — I want to work at events (€49/yr)</option>
    </select>
  </div>
  <button type="submit" class="btn btn-primary" style="width:100%;padding:14px;font-size:15px;border-radius:10px;">Create Account →</button>
</form>
<p style="text-align:center;margin-top:16px;font-size:13px;color:var(--ink3);">Already have an account? <a href="/auth/login" style="color:var(--flame);font-weight:700;">Login</a></p>
</div></div></body></html>`;
}
