// PASSWORD RESET ROUTES
// Add these to routes/auth.js BEFORE module.exports = router;
// Also need to create the password_resets table in PostgreSQL

// ─────────────────────────────────────
// SETUP — run this ONCE in terminal:
// node -e "
// const{Client}=require('pg');
// const c=new Client({connectionString:'postgresql://postgres:VWgjvXynowzYucOsfqNNAPWojptOHaXJ@gondola.proxy.rlwy.net:47003/railway',ssl:{rejectUnauthorized:false}});
// c.connect().then(()=>c.query('CREATE TABLE IF NOT EXISTS password_resets (id SERIAL PRIMARY KEY, email TEXT NOT NULL, token TEXT NOT NULL, expires_at TIMESTAMP NOT NULL, used BOOLEAN DEFAULT FALSE, created_at TIMESTAMP DEFAULT NOW())'))
// .then(()=>{console.log('done');c.end()});
// "
// ─────────────────────────────────────

// ─────────────────────────────────────
// FORGOT PASSWORD — GET
// ─────────────────────────────────────
router.get('/forgot-password', (req, res) => {
  res.send(forgotPage(req.query.success, req.query.error));
});

// ─────────────────────────────────────
// FORGOT PASSWORD — POST
// ─────────────────────────────────────
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.redirect('/auth/forgot-password?error=Please enter your email address');

  const user = db.prepare('SELECT * FROM users WHERE email=?').get(email.toLowerCase().trim());

  // Always show success even if email not found (security best practice)
  if (!user) {
    return res.redirect('/auth/forgot-password?success=If that email is registered, you will receive a reset link shortly');
  }

  // Generate secure token
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

  // Save token to database
  try {
    db.prepare('INSERT INTO password_resets (email, token, expires_at) VALUES (?,?,?)').run(email.toLowerCase().trim(), token, expires.toISOString());
  } catch(err) {
    console.error('Password reset DB error:', err.message);
    return res.redirect('/auth/forgot-password?error=Something went wrong. Please try again.');
  }

  // Send reset email
  try {
    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    const resetUrl = `https://festmore.com/auth/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    await resend.emails.send({
      from: 'Festmore <contact@festmore.com>',
      to: email,
      subject: 'Reset your Festmore password',
      html: `<!DOCTYPE html>
<html><head><meta charset="UTF-8"/></head>
<body style="font-family:'Helvetica Neue',Arial,sans-serif;background:#f5f0e8;margin:0;padding:40px 20px;">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">
  <div style="background:#0a1a0f;padding:32px 40px;">
    <span style="font-size:22px;font-weight:800;"><span style="color:#fff;">Fest</span><span style="color:#e8470a;">more</span></span>
  </div>
  <div style="padding:40px;">
    <h2 style="font-family:Georgia,serif;font-size:24px;font-weight:400;color:#1a1612;margin:0 0 16px;">Reset Your Password</h2>
    <p style="font-size:15px;color:#6b5f58;line-height:1.7;margin:0 0 24px;">We received a request to reset the password for your Festmore account. Click the button below to set a new password.</p>
    <a href="${resetUrl}" style="display:inline-block;background:#e8470a;color:#fff;padding:14px 32px;border-radius:12px;font-size:15px;font-weight:700;text-decoration:none;margin-bottom:24px;">Reset My Password →</a>
    <p style="font-size:13px;color:#9b8f88;line-height:1.7;margin:0 0 8px;">This link expires in <strong>1 hour</strong>.</p>
    <p style="font-size:13px;color:#9b8f88;line-height:1.7;margin:0;">If you didn't request a password reset, you can safely ignore this email. Your password will not change.</p>
    <div style="margin-top:24px;padding-top:20px;border-top:1px solid #f1ede8;">
      <p style="font-size:12px;color:#c9bdb7;margin:0;">If the button doesn't work, copy and paste this link: <br/><a href="${resetUrl}" style="color:#e8470a;font-size:11px;word-break:break-all;">${resetUrl}</a></p>
    </div>
  </div>
  <div style="background:#f1ede8;padding:20px 40px;text-align:center;font-size:12px;color:#9b8f88;">
    © ${new Date().getFullYear()} Festmore.com · <a href="https://festmore.com" style="color:#e8470a;">festmore.com</a>
  </div>
</div>
</body></html>`
    });
    console.log('✅ Password reset email sent to:', email);
  } catch(err) {
    console.error('❌ Reset email error:', err.message);
  }

  res.redirect('/auth/forgot-password?success=If that email is registered, you will receive a reset link shortly');
});

// ─────────────────────────────────────
// RESET PASSWORD — GET
// ─────────────────────────────────────
router.get('/reset-password', (req, res) => {
  const { token, email } = req.query;
  if (!token || !email) return res.redirect('/auth/forgot-password?error=Invalid reset link');

  // Check token is valid and not expired
  const reset = db.prepare('SELECT * FROM password_resets WHERE token=? AND email=? AND used=FALSE AND expires_at > NOW()').get(token, email.toLowerCase().trim());

  if (!reset) {
    return res.redirect('/auth/forgot-password?error=This reset link has expired or already been used. Please request a new one.');
  }

  res.send(resetPage(token, email, req.query.error));
});

// ─────────────────────────────────────
// RESET PASSWORD — POST
// ─────────────────────────────────────
router.post('/reset-password', async (req, res) => {
  const { token, email, password, password_confirm } = req.body;

  if (!token || !email) return res.redirect('/auth/forgot-password?error=Invalid reset link');
  if (!password || password.length < 8) return res.redirect(`/auth/reset-password?token=${token}&email=${encodeURIComponent(email)}&error=Password must be at least 8 characters`);
  if (password !== password_confirm) return res.redirect(`/auth/reset-password?token=${token}&email=${encodeURIComponent(email)}&error=Passwords do not match`);

  // Verify token again
  const reset = db.prepare('SELECT * FROM password_resets WHERE token=? AND email=? AND used=FALSE AND expires_at > NOW()').get(token, email.toLowerCase().trim());
  if (!reset) {
    return res.redirect('/auth/forgot-password?error=This reset link has expired. Please request a new one.');
  }

  // Update password
  const hash = await bcrypt.hash(password, 12);
  db.prepare('UPDATE users SET password=? WHERE email=?').run(hash, email.toLowerCase().trim());

  // Mark token as used
  db.prepare('UPDATE password_resets SET used=TRUE WHERE token=?').run(token);

  // Log user in automatically
  const user = db.prepare('SELECT * FROM users WHERE email=?').get(email.toLowerCase().trim());
  if (user) {
    req.session.user = { id: user.id, email: user.email, name: user.name, role: user.role };
  }

  res.redirect('/dashboard?success=Password updated successfully! You are now logged in.');
});

// ─────────────────────────────────────
// RENDER — FORGOT PASSWORD PAGE
// ─────────────────────────────────────
function forgotPage(success, error) {
  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Forgot Password — Festmore</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="/css/main.css"/>
</head><body>
<nav class="main-nav"><div class="nav-inner">
  <a href="/" class="logo"><span class="logo-fest">Fest</span><span class="logo-more">more</span><span class="logo-dot"></span></a>
</div></nav>

<div class="auth-page">
  <div style="background:#fff;border-radius:24px;overflow:hidden;box-shadow:var(--shadow-xl);max-width:480px;width:100%;padding:52px 44px;">
    <div style="text-align:center;margin-bottom:32px;">
      <div style="font-size:48px;margin-bottom:16px;">🔑</div>
      <h1 style="font-family:'DM Serif Display',serif;font-size:28px;font-weight:400;margin-bottom:8px;">Forgot your password?</h1>
      <p style="color:var(--ink3);font-size:14px;">Enter your email address and we'll send you a reset link.</p>
    </div>

    ${success ? `<div style="background:#dcfce7;border:1px solid #86efac;border-radius:10px;padding:14px 16px;margin-bottom:20px;font-size:14px;color:#15803d;">✅ ${success}</div>` : ''}
    ${error ? `<div style="background:#fee2e2;border:1px solid #fca5a5;border-radius:10px;padding:14px 16px;margin-bottom:20px;font-size:14px;color:#dc2626;">⚠️ ${error}</div>` : ''}

    <form method="POST" action="/auth/forgot-password">
      <div style="margin-bottom:20px;">
        <label style="font-size:12px;font-weight:700;color:var(--ink3);text-transform:uppercase;letter-spacing:.8px;display:block;margin-bottom:6px;">Email Address</label>
        <input type="email" name="email" required placeholder="your@email.com" autofocus
          style="width:100%;border:1.5px solid var(--border2);border-radius:10px;padding:12px 14px;font-size:14px;outline:none;box-sizing:border-box;"/>
      </div>
      <button type="submit" class="btn btn-primary" style="width:100%;padding:14px;font-size:15px;border-radius:10px;">Send Reset Link →</button>
    </form>

    <div style="text-align:center;margin-top:20px;">
      <a href="/auth/login" style="color:var(--ink3);font-size:13.5px;">← Back to Login</a>
    </div>
  </div>
</div>
</body></html>`;
}

// ─────────────────────────────────────
// RENDER — RESET PASSWORD PAGE
// ─────────────────────────────────────
function resetPage(token, email, error) {
  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Reset Password — Festmore</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="/css/main.css"/>
</head><body>
<nav class="main-nav"><div class="nav-inner">
  <a href="/" class="logo"><span class="logo-fest">Fest</span><span class="logo-more">more</span><span class="logo-dot"></span></a>
</div></nav>

<div class="auth-page">
  <div style="background:#fff;border-radius:24px;overflow:hidden;box-shadow:var(--shadow-xl);max-width:480px;width:100%;padding:52px 44px;">
    <div style="text-align:center;margin-bottom:32px;">
      <div style="font-size:48px;margin-bottom:16px;">🔒</div>
      <h1 style="font-family:'DM Serif Display',serif;font-size:28px;font-weight:400;margin-bottom:8px;">Set New Password</h1>
      <p style="color:var(--ink3);font-size:14px;">Choose a strong password for <strong>${email}</strong></p>
    </div>

    ${error ? `<div style="background:#fee2e2;border:1px solid #fca5a5;border-radius:10px;padding:14px 16px;margin-bottom:20px;font-size:14px;color:#dc2626;">⚠️ ${error}</div>` : ''}

    <form method="POST" action="/auth/reset-password">
      <input type="hidden" name="token" value="${token}"/>
      <input type="hidden" name="email" value="${email}"/>
      <div style="margin-bottom:16px;">
        <label style="font-size:12px;font-weight:700;color:var(--ink3);text-transform:uppercase;letter-spacing:.8px;display:block;margin-bottom:6px;">New Password</label>
        <input type="password" name="password" required placeholder="At least 8 characters" autofocus
          style="width:100%;border:1.5px solid var(--border2);border-radius:10px;padding:12px 14px;font-size:14px;outline:none;box-sizing:border-box;"/>
      </div>
      <div style="margin-bottom:24px;">
        <label style="font-size:12px;font-weight:700;color:var(--ink3);text-transform:uppercase;letter-spacing:.8px;display:block;margin-bottom:6px;">Confirm New Password</label>
        <input type="password" name="password_confirm" required placeholder="Repeat your new password"
          style="width:100%;border:1.5px solid var(--border2);border-radius:10px;padding:12px 14px;font-size:14px;outline:none;box-sizing:border-box;"/>
      </div>
      <button type="submit" class="btn btn-primary" style="width:100%;padding:14px;font-size:15px;border-radius:10px;">Update Password →</button>
    </form>
  </div>
</div>
</body></html>`;
}
