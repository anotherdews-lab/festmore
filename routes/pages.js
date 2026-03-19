// routes/pages.js — Contact, About & Privacy pages
const express    = require('express');
const router     = express.Router();
const db         = require('../db');
const nodemailer = require('nodemailer');

// ─────────────────────────────────────
// ABOUT PAGE
// ─────────────────────────────────────
router.get('/about', (req, res) => {
  const stats = {
    events:      db.prepare("SELECT COUNT(*) as n FROM events WHERE status='active'").get().n,
    vendors:     db.prepare("SELECT COUNT(*) as n FROM vendors WHERE status='active'").get().n,
    articles:    db.prepare("SELECT COUNT(*) as n FROM articles WHERE status='published'").get().n,
    subscribers: db.prepare("SELECT COUNT(*) as n FROM subscribers WHERE active=1").get().n,
  };
  res.send(`<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>About Festmore — Europe's Festival & Event Platform</title>
<meta name="description" content="Festmore is Europe's festival and vendor marketplace connecting event organisers with verified vendors across 11 countries."/>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="/css/main.css"/>
</head><body>
${renderNav(req.session.user)}
<div style="background:var(--ink);padding:80px 0;position:relative;overflow:hidden;">
  <div style="position:absolute;inset:0;background:radial-gradient(ellipse 60% 80% at 70% 50%,rgba(232,71,10,.12) 0%,transparent 70%);"></div>
  <div class="container" style="position:relative;max-width:820px;">
    <h1 style="font-family:'DM Serif Display',serif;font-size:clamp(36px,5vw,60px);font-weight:400;color:#fff;margin-bottom:18px;">The World's Events,<br/><em style="color:var(--flame);">All in One Place</em></h1>
    <p style="color:rgba(255,255,255,.55);font-size:17px;line-height:1.8;max-width:600px;">Festmore was built to make it easier to discover events and connect organisers with the best vendors across Europe and beyond.</p>
  </div>
</div>
<div class="stats-strip">
  <div class="stats-strip-inner">
    <div class="strip-stat"><span class="strip-stat-n">${stats.events}+</span><span class="strip-stat-l">Events Listed</span></div>
    <div class="strip-div"></div>
    <div class="strip-stat"><span class="strip-stat-n">11</span><span class="strip-stat-l">Countries</span></div>
    <div class="strip-div"></div>
    <div class="strip-stat"><span class="strip-stat-n">${stats.vendors}+</span><span class="strip-stat-l">Verified Vendors</span></div>
    <div class="strip-div"></div>
    <div class="strip-stat"><span class="strip-stat-n">${stats.subscribers}+</span><span class="strip-stat-l">Subscribers</span></div>
  </div>
</div>
<section class="section"><div class="container" style="max-width:900px;">
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;">
    <div>
      <h2 style="font-family:'DM Serif Display',serif;font-size:clamp(26px,3vw,38px);font-weight:400;margin-bottom:16px;">Why We Built Festmore</h2>
      <p style="color:var(--ink3);font-size:15.5px;line-height:1.8;margin-bottom:16px;">Finding great events used to mean hours of searching across dozens of different websites in different languages. Festmore brings everything together.</p>
      <p style="color:var(--ink3);font-size:15.5px;line-height:1.8;">We cover festivals, markets, concerts, exhibitions and trade fairs across 11 countries. New events added every single day.</p>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
      ${[['🎪','Festivals','From local fests to massive international events'],['🛍️','Markets','Street markets, food markets, Christmas markets'],['🎵','Concerts','Live music events across all genres'],['🏛️','Trade Fairs','Business events and professional expos']].map(([i,t,d])=>`<div style="background:#fff;border:1px solid var(--border);border-radius:16px;padding:22px 18px;"><div style="font-size:28px;margin-bottom:10px;">${i}</div><div style="font-size:14px;font-weight:700;color:var(--ink);margin-bottom:6px;">${t}</div><div style="font-size:12.5px;color:var(--ink3);line-height:1.55;">${d}</div></div>`).join('')}
    </div>
  </div>
</div></section>
<section class="cta-section"><div class="container" style="text-align:center;max-width:680px;">
  <h2 style="font-family:'DM Serif Display',serif;font-size:clamp(26px,3.5vw,44px);font-weight:400;color:#fff;margin-bottom:14px;">Ready to Get Started?</h2>
  <p style="color:rgba(255,255,255,.55);font-size:16px;line-height:1.75;margin-bottom:32px;">List your event, create a vendor profile or browse thousands of events for free.</p>
  <div style="display:flex;gap:14px;justify-content:center;flex-wrap:wrap;">
    <a href="/events" class="btn btn-primary btn-lg">Browse Events →</a>
    <a href="/events/submit" class="btn btn-outline-white btn-lg">List Your Event</a>
    <a href="/vendors/register" class="btn btn-outline-white btn-lg">Become a Vendor</a>
  </div>
</div></section>
${renderFooterSimple()}
</body></html>`);
});

// ─────────────────────────────────────
// CONTACT — GET
// ─────────────────────────────────────
router.get('/contact', (req, res) => {
  res.send(contactPage(req.session.user, req.query.success, req.query.error, req.query.type || ''));
});

// ─────────────────────────────────────
// CONTACT — POST
// ─────────────────────────────────────
router.post('/contact', async (req, res) => {
  const { name, email, subject, message, type, phone } = req.body;
  if (!name || !email || !message) {
    return res.redirect('/contact?error=Please fill in all required fields');
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });

    // Email TO you with full details
    await transporter.sendMail({
      from: `"Festmore Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: `[Festmore] ${type || 'Enquiry'} from ${name}`,
      html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#1a1612;padding:24px 32px;border-radius:12px 12px 0 0;">
          <div style="font-size:22px;color:#e8470a;font-weight:700;">Festmore</div>
          <div style="font-size:12px;color:rgba(255,255,255,.4);margin-top:2px;">New Contact Form Submission</div>
        </div>
        <div style="background:#fff;padding:32px;border:1px solid #e8e2d9;">
          <h2 style="font-size:20px;color:#1a1612;margin-bottom:20px;">📬 New message from ${name}</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:10px 0;border-bottom:1px solid #f0ece4;font-size:12px;font-weight:700;color:#b5ada6;text-transform:uppercase;width:120px;">Type</td><td style="padding:10px 0;border-bottom:1px solid #f0ece4;font-size:14px;color:#1a1612;">${type || 'General'}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #f0ece4;font-size:12px;font-weight:700;color:#b5ada6;text-transform:uppercase;">Name</td><td style="padding:10px 0;border-bottom:1px solid #f0ece4;font-size:14px;">${name}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #f0ece4;font-size:12px;font-weight:700;color:#b5ada6;text-transform:uppercase;">Email</td><td style="padding:10px 0;border-bottom:1px solid #f0ece4;font-size:14px;"><a href="mailto:${email}" style="color:#e8470a;">${email}</a></td></tr>
            ${phone ? `<tr><td style="padding:10px 0;border-bottom:1px solid #f0ece4;font-size:12px;font-weight:700;color:#b5ada6;text-transform:uppercase;">Phone</td><td style="padding:10px 0;border-bottom:1px solid #f0ece4;font-size:14px;">${phone}</td></tr>` : ''}
            <tr><td style="padding:10px 0;border-bottom:1px solid #f0ece4;font-size:12px;font-weight:700;color:#b5ada6;text-transform:uppercase;">Subject</td><td style="padding:10px 0;border-bottom:1px solid #f0ece4;font-size:14px;">${subject || '—'}</td></tr>
          </table>
          <div style="margin-top:24px;background:#faf8f3;border-radius:10px;padding:20px;border-left:3px solid #e8470a;">
            <div style="font-size:12px;font-weight:700;color:#b5ada6;text-transform:uppercase;margin-bottom:10px;">Message</div>
            <div style="font-size:15px;color:#3d3530;line-height:1.75;">${message.replace(/\n/g,'<br/>')}</div>
          </div>
          <div style="margin-top:24px;text-align:center;">
            <a href="mailto:${email}" style="display:inline-block;background:#e8470a;color:#fff;padding:12px 28px;border-radius:99px;text-decoration:none;font-weight:700;font-size:14px;">Reply to ${name} →</a>
          </div>
        </div>
        <div style="background:#f2ede4;padding:16px 32px;border-radius:0 0 12px 12px;border:1px solid #e8e2d9;border-top:none;font-size:12px;color:#b5ada6;text-align:center;">
          Received: ${new Date().toLocaleString('en-GB',{timeZone:'Europe/Copenhagen'})}
        </div>
      </div>`
    });

    // Auto-reply to the sender
    await transporter.sendMail({
      from: `"Festmore" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `We received your message — Festmore`,
      html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#1a1612;padding:24px 32px;border-radius:12px 12px 0 0;">
          <div style="font-size:22px;color:#e8470a;font-weight:700;">Festmore</div>
        </div>
        <div style="background:#fff;padding:32px;border:1px solid #e8e2d9;">
          <h2 style="font-size:20px;color:#1a1612;margin-bottom:12px;">Hi ${name}, we got your message! 👋</h2>
          <p style="font-size:15px;color:#3d3530;line-height:1.75;margin-bottom:16px;">Thank you for contacting Festmore. We typically reply within 24 hours (Mon–Fri, 9am–6pm CET).</p>
          <div style="background:#faf8f3;border-left:3px solid #e8470a;padding:16px 20px;border-radius:0 10px 10px 0;margin-bottom:24px;">
            <div style="font-size:12px;font-weight:700;color:#b5ada6;text-transform:uppercase;margin-bottom:6px;">Your message</div>
            <div style="font-size:14px;color:#3d3530;line-height:1.7;">${message.substring(0,200)}${message.length>200?'…':''}</div>
          </div>
          <p style="font-size:14px;color:#7a6f68;margin-bottom:16px;">While you wait, you might want to:</p>
          <div style="display:flex;gap:10px;flex-wrap:wrap;">
            <a href="https://festmore.com/events" style="background:#e8470a;color:#fff;padding:10px 20px;border-radius:99px;text-decoration:none;font-size:13px;font-weight:700;">Browse Events</a>
            <a href="https://festmore.com/events/pricing" style="background:#1a1612;color:#fff;padding:10px 20px;border-radius:99px;text-decoration:none;font-size:13px;font-weight:700;">See Pricing</a>
          </div>
        </div>
        <div style="background:#f2ede4;padding:16px 32px;border-radius:0 0 12px 12px;border:1px solid #e8e2d9;border-top:none;font-size:12px;color:#b5ada6;text-align:center;">
          © ${new Date().getFullYear()} Festmore.com
        </div>
      </div>`
    });

    res.redirect('/contact?success=Message sent! We will reply within 24 hours. Check your inbox for confirmation.');
  } catch (err) {
    console.error('Contact email error:', err.message);
    res.redirect('/contact?error=Could not send message. Please email us directly at ' + (process.env.EMAIL_USER || 'hello@festmore.com'));
  }
});

// ─────────────────────────────────────
// PRIVACY PAGE
// ─────────────────────────────────────
router.get('/privacy', (req, res) => {
  const em = process.env.EMAIL_USER || 'hello@festmore.com';
  res.send(`<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Privacy Policy — Festmore</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="/css/main.css"/>
</head><body>
${renderNav(req.session.user)}
<div class="page-hero-small"><div class="container"><h1>Privacy Policy</h1><p>Last updated: January 2025</p></div></div>
<div class="container" style="padding:56px 0;max-width:760px;">
  <div style="background:#fff;border:1px solid var(--border);border-radius:20px;padding:40px 48px;" class="article-content">
    <h2>1. What We Collect</h2><p>When you use Festmore, we may collect your name, email address, and payment information (processed securely by Stripe). We also collect usage data such as pages visited and events viewed.</p>
    <h2>2. How We Use Your Data</h2><p>We use your data to operate the website, process payments, send newsletters (only if you subscribe), and improve our service. We never sell your personal data to third parties.</p>
    <h2>3. Cookies</h2><p>We use cookies to keep you logged in and to serve Google AdSense advertisements. You can disable cookies in your browser settings.</p>
    <h2>4. Google AdSense</h2><p>We use Google AdSense to display advertisements. Google may use cookies to serve ads based on your prior visits. You can opt out at <a href="https://www.google.com/settings/ads" style="color:var(--flame);">google.com/settings/ads</a>.</p>
    <h2>5. Stripe Payments</h2><p>All payments are processed securely by Stripe. We do not store your full card details on our servers.</p>
    <h2>6. Your Rights</h2><p>You have the right to access, correct or delete your personal data. Contact us at <a href="mailto:${em}" style="color:var(--flame);">${em}</a>.</p>
    <h2>7. Contact</h2><p>For privacy questions: <a href="mailto:${em}" style="color:var(--flame);">${em}</a></p>
  </div>
</div>
${renderFooterSimple()}
</body></html>`);
});

module.exports = router;

// ─────────────────────────────────────
// CONTACT PAGE HTML
// ─────────────────────────────────────
function contactPage(user, success, error, preselect) {
  const em = process.env.EMAIL_USER || 'hello@festmore.com';
  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Contact Festmore — Get in Touch</title>
<meta name="description" content="Contact the Festmore team. Questions about listing your event, vendor profiles or anything else — we reply within 24 hours."/>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/>
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2486135003689222" crossorigin="anonymous"></script>
<link rel="stylesheet" href="/css/main.css"/>
<style>
.contact-hero{background:#0a0a0a;padding:80px 0;position:relative;overflow:hidden;}
.contact-hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 50% 80% at 80% 50%,rgba(232,71,10,.15) 0%,transparent 70%);}
.contact-grid{display:grid;grid-template-columns:1fr 380px;gap:48px;align-items:start;padding:64px 0;}
.contact-card{background:#fff;border:1px solid var(--border);border-radius:24px;padding:40px;}
.form-field{margin-bottom:20px;}
.form-field label{display:block;font-size:12px;font-weight:700;color:var(--ink3);text-transform:uppercase;letter-spacing:.8px;margin-bottom:8px;}
.form-field input,.form-field textarea,.form-field select{width:100%;background:var(--ivory);border:1.5px solid var(--border2);border-radius:10px;padding:12px 16px;font-size:14px;color:var(--ink);font-family:inherit;outline:none;transition:border-color .2s;box-sizing:border-box;}
.form-field input:focus,.form-field textarea:focus,.form-field select:focus{border-color:var(--flame);background:#fff;}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
.info-card{background:#fff;border:1px solid var(--border);border-radius:20px;padding:28px;margin-bottom:16px;}
.info-item{display:flex;align-items:flex-start;gap:14px;padding:14px 0;border-bottom:1px solid var(--border);}
.info-item:last-child{border-bottom:none;}
.info-icon{width:40px;height:40px;border-radius:10px;background:rgba(232,71,10,.08);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;}
.info-label{font-size:11px;font-weight:700;color:var(--ink4);text-transform:uppercase;letter-spacing:.8px;margin-bottom:3px;}
.info-value{font-size:14px;color:var(--ink2);line-height:1.5;}
.faq-item{padding:16px 0;border-bottom:1px solid var(--border);}
.faq-item:last-child{border-bottom:none;}
.faq-q{font-size:14px;font-weight:700;color:var(--ink);margin-bottom:5px;}
.faq-a{font-size:13px;color:var(--ink3);line-height:1.65;}
.quick-bar{background:#f2ede4;border-bottom:1px solid var(--border);overflow-x:auto;}
.quick-bar-inner{display:flex;max-width:1100px;margin:0 auto;}
.quick-link{display:flex;align-items:center;gap:8px;padding:14px 24px;font-size:13px;font-weight:600;color:var(--ink2);border-right:1px solid var(--border);white-space:nowrap;text-decoration:none;transition:all .2s;}
.quick-link:hover{background:#fff;color:var(--flame);}
@media(max-width:900px){.contact-grid{grid-template-columns:1fr;}.form-row{grid-template-columns:1fr;}}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:.6;transform:scale(1.2);}}
</style>
</head><body>
${renderNav(user)}

<div class="contact-hero">
  <div class="container" style="position:relative;max-width:760px;">
    <div style="display:inline-flex;align-items:center;gap:8px;background:rgba(232,71,10,.12);border:1px solid rgba(232,71,10,.25);color:#ff7043;font-size:11px;font-weight:700;padding:4px 14px;border-radius:99px;margin-bottom:20px;letter-spacing:.8px;text-transform:uppercase;">
      <span style="width:5px;height:5px;border-radius:50%;background:#ff7043;display:inline-block;animation:pulse 2s ease infinite;"></span>
      We reply within 24 hours
    </div>
    <h1 style="font-family:'DM Serif Display',serif;font-size:clamp(36px,5vw,56px);font-weight:400;color:#fff;margin-bottom:16px;line-height:1.08;">How Can We <em style="color:#e8470a;">Help You?</em></h1>
    <p style="color:rgba(255,255,255,.5);font-size:17px;line-height:1.75;max-width:540px;">Whether you have a question about listing your event, your vendor profile, a payment or anything else — our team is here to help.</p>
  </div>
</div>

<div class="quick-bar">
  <div class="quick-bar-inner">
    ${[['🎪','List an Event','/events/submit'],['🏪','Become a Vendor','/vendors/register'],['💳','Payment Help','/contact?type=Payment+Issue'],['🤝','Partnership','/contact?type=Partnership'],['📰','Press','/contact?type=Press'],['❓','FAQ','/contact#faq']].map(([i,l,h])=>`<a href="${h}" class="quick-link">${i} ${l}</a>`).join('')}
  </div>
</div>

<div class="container" style="max-width:1100px;">
  <div class="contact-grid">

    <div class="contact-card">
      <h2 style="font-family:'DM Serif Display',serif;font-size:28px;font-weight:400;margin-bottom:8px;">Send Us a Message</h2>
      <p style="font-size:15px;color:var(--ink3);margin-bottom:32px;line-height:1.65;">Fill in the form and we'll get back to you within 24 hours. You'll receive a confirmation email immediately.</p>

      ${success?`<div class="alert alert-success" style="margin-bottom:24px;">✅ ${success}</div>`:''}
      ${error?`<div class="alert alert-error" style="margin-bottom:24px;">⚠️ ${error}</div>`:''}

      <form method="POST" action="/contact">
        <div class="form-row">
          <div class="form-field"><label>Your Name *</label><input type="text" name="name" required placeholder="e.g. Marcus Weber"/></div>
          <div class="form-field"><label>Your Email *</label><input type="email" name="email" required placeholder="your@email.com"/></div>
        </div>
        <div class="form-row">
          <div class="form-field">
            <label>What is this about?</label>
            <select name="type">
              ${[['General Enquiry','General Enquiry'],['Event Listing Question','Event Listing Question'],['Vendor Profile Question','Vendor Profile Question'],['Payment Issue','Payment Issue'],['Technical Problem','Technical Problem'],['Partnership','Partnership / Advertising'],['Press','Press Enquiry'],['Other','Other']].map(([v,l])=>`<option value="${v}" ${preselect===v?'selected':''}>${l}</option>`).join('')}
            </select>
          </div>
          <div class="form-field"><label>Phone (optional)</label><input type="tel" name="phone" placeholder="+49 123 456 789"/></div>
        </div>
        <div class="form-field"><label>Subject</label><input type="text" name="subject" placeholder="Brief subject line"/></div>
        <div class="form-field"><label>Message *</label><textarea name="message" rows="6" required placeholder="Tell us how we can help. The more detail you give, the faster we can assist…"></textarea></div>
        <button type="submit" class="btn btn-primary btn-lg" style="width:100%;font-size:16px;padding:16px;">Send Message →</button>
        <p style="font-size:12px;color:var(--ink4);text-align:center;margin-top:12px;">🔒 Your details are secure. We never share your information.</p>
      </form>
    </div>

    <aside>
      <div class="info-card">
        <h3 style="font-family:'DM Serif Display',serif;font-size:20px;font-weight:400;margin-bottom:4px;">Contact Information</h3>
        <p style="font-size:13px;color:var(--ink3);margin-bottom:20px;">Multiple ways to reach us</p>
        ${[['📧','Email',`<a href="mailto:${em}" style="color:var(--flame);">${em}</a>`],['⏱️','Response Time','Within 24 hours (Mon–Fri)'],['🌍','Coverage','11 countries across Europe & beyond'],['🕐','Office Hours','Mon–Fri, 9am–6pm CET'],['💬','Languages','EN, DE, DK, NL, FR, SE, AR, ZH']].map(([i,l,v])=>`<div class="info-item"><div class="info-icon">${i}</div><div><div class="info-label">${l}</div><div class="info-value">${v}</div></div></div>`).join('')}
      </div>

      <div class="info-card" id="faq">
        <h3 style="font-family:'DM Serif Display',serif;font-size:20px;font-weight:400;margin-bottom:20px;">Quick Answers</h3>
        ${[['How do I list my event?','Go to Events → Submit Event. Free listings go live immediately. Paid Standard listings (€79/yr) within minutes.'],['How much is a vendor profile?','A verified vendor profile is €49/year — less than €5/month. One festival booking pays for years.'],['What countries do you cover?','Germany, Denmark, Netherlands, UK, France, Sweden, Belgium, Poland, UAE, USA and China.'],['Can I get a refund?','Yes — 14-day refund policy on all paid listings. Contact us within 14 days of purchase.'],['Do you offer partnerships?','Yes! We offer newsletter sponsorships, featured placements and co-marketing. Email us to discuss.']].map(([q,a])=>`<div class="faq-item"><div class="faq-q">${q}</div><div class="faq-a">${a}</div></div>`).join('')}
      </div>

      <div style="background:var(--ink);border-radius:20px;padding:28px;color:#fff;">
        <h3 style="font-family:'DM Serif Display',serif;font-size:18px;font-weight:400;margin-bottom:8px;">Ready to list?</h3>
        <p style="font-size:13px;color:rgba(255,255,255,.5);margin-bottom:20px;">Get your event or vendor profile live today.</p>
        <a href="/events/pricing" class="btn btn-primary" style="display:block;text-align:center;margin-bottom:10px;">View Pricing Plans →</a>
        <a href="/events/submit" style="display:block;text-align:center;background:rgba(255,255,255,.08);color:#fff;padding:12px;border-radius:10px;font-size:13px;font-weight:600;text-decoration:none;">List Event for Free →</a>
      </div>
    </aside>

  </div>
</div>

<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-2486135003689222" data-ad-format="auto" data-full-width-responsive="true"></ins>
<script>(adsbygoogle=window.adsbygoogle||[]).push({});</script>

${renderFooterSimple()}
</body></html>`;
}

function renderNav(user) {
  return `<nav class="main-nav"><div class="nav-inner"><a href="/" class="logo"><span class="logo-fest">Fest</span><span class="logo-more">more</span><span class="logo-dot"></span></a><form class="nav-search" action="/events" method="GET"><span style="color:var(--ink4);font-size:15px;">🔍</span><input type="text" name="q" placeholder="Search events…"/></form><div class="nav-right">${user?`<a href="/dashboard" class="btn btn-outline btn-sm">Dashboard</a><a href="/auth/logout" class="btn btn-ghost btn-sm">Logout</a>`:`<a href="/auth/login" class="btn btn-outline btn-sm">Login</a><a href="/events/submit" class="btn btn-primary btn-sm">+ List Event</a>`}</div><button class="nav-burger" onclick="document.querySelector('.nav-mobile').classList.toggle('open')">☰</button></div><div class="nav-cats-bar"><a href="/events" class="nav-cat">🌍 All</a><a href="/events?category=festival" class="nav-cat">🎪 Festivals</a><a href="/events?category=market" class="nav-cat">🛍️ Markets</a><a href="/events?category=christmas" class="nav-cat">🎄 Xmas Markets</a><a href="/events?category=concert" class="nav-cat">🎵 Concerts</a><a href="/articles" class="nav-cat">📰 Articles</a><a href="/vendors" class="nav-cat">🏪 Vendors</a><a href="/about" class="nav-cat">ℹ️ About</a><a href="/contact" class="nav-cat">✉️ Contact</a></div><div class="nav-mobile"><a href="/events">All Events</a><a href="/articles">Articles</a><a href="/vendors">Vendors</a><a href="/about">About</a><a href="/contact">Contact</a><a href="/events/submit">+ List Event</a>${user?`<a href="/dashboard">Dashboard</a><a href="/auth/logout">Logout</a>`:`<a href="/auth/login">Login</a>`}</div></nav>`;
}

function renderFooterSimple() {
  return `<footer><div class="footer-bottom"><span>© ${new Date().getFullYear()} Festmore.com — All rights reserved</span><div style="display:flex;gap:20px;flex-wrap:wrap;"><a href="/" style="color:rgba(255,255,255,.35);font-size:13px;">Home</a><a href="/events" style="color:rgba(255,255,255,.35);font-size:13px;">Events</a><a href="/vendors" style="color:rgba(255,255,255,.35);font-size:13px;">Vendors</a><a href="/about" style="color:rgba(255,255,255,.35);font-size:13px;">About</a><a href="/contact" style="color:rgba(255,255,255,.35);font-size:13px;">Contact</a><a href="/privacy" style="color:rgba(255,255,255,.35);font-size:13px;">Privacy</a></div></div></footer>`;
}