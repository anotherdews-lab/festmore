// routes/admin-social.js
// Admin page to generate and copy Instagram/Facebook posts
// Access: festmore.com/admin/social-posts

const express = require('express');
const router  = express.Router();
const db      = require('../db');

function requireAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/auth/login');
  next();
}

const FLAGS = { BE:'🇧🇪',CN:'🇨🇳',DK:'🇩🇰',FR:'🇫🇷',DE:'🇩🇪',NL:'🇳🇱',PL:'🇵🇱',SE:'🇸🇪',AE:'🇦🇪',GB:'🇬🇧',US:'🇺🇸',NO:'🇳🇴',FI:'🇫🇮',AT:'🇦🇹',CH:'🇨🇭',IT:'🇮🇹',ES:'🇪🇸',PT:'🇵🇹',IE:'🇮🇪',CZ:'🇨🇿',HU:'🇭🇺',GR:'🇬🇷',HR:'🇭🇷',IN:'🇮🇳',TH:'🇹🇭',JP:'🇯🇵' };
const COUNTRY_NAMES = { BE:'Belgium',CN:'China',DK:'Denmark',FR:'France',DE:'Germany',NL:'Netherlands',PL:'Poland',SE:'Sweden',AE:'UAE',GB:'United Kingdom',US:'USA',NO:'Norway',FI:'Finland',AT:'Austria',CH:'Switzerland',IT:'Italy',ES:'Spain',PT:'Portugal',IE:'Ireland',CZ:'Czech Republic',HU:'Hungary',GR:'Greece',HR:'Croatia',IN:'India',TH:'Thailand',JP:'Japan' };
const CAT_EMOJI = { festival:'🎪',market:'🛍️',christmas:'🎄',concert:'🎵',flea:'🏺',exhibition:'🖼️',business:'💼',kids:'🎠',city:'🏙️',messe:'🏛️',online:'💻' };

const HASHTAGS = {
  festival:  '#festival #festivals #festivallife #festivalseason #livemusic #outdoor #summer #festivalvibes #eventvendor #vendor #festmore',
  market:    '#market #markets #streetmarket #streetfood #marketday #artisan #handmade #localmarket #vendor #eventvendor #festmore',
  christmas: '#christmas #christmasmarket #xmas #christmasvibes #winter #holiday #weihnachtsmarkt #kerstmarkt #festmore #vendor',
  concert:   '#concert #livemusic #music #musicfestival #liveperformance #festmore #eventvendor',
  flea:      '#fleamarket #vintage #antiques #secondhand #thrift #fleamarketfinds #retro #festmore #vendor',
  exhibition:'#exhibition #art #gallery #culture #artexhibition #creative #festmore',
  business:  '#business #tradeshow #networking #b2b #businessevent #expo #festmore',
  kids:      '#kidsfestival #familyfun #family #kids #children #familyevent #festmore',
  city:      '#cityevent #festival #outdoor #urban #city #festmore #vendor',
  default:   '#festival #event #events #vendor #eventvendor #festmore #festivals',
};

function generatePosts(event) {
  const flag = FLAGS[event.country] || '🌍';
  const emoji = CAT_EMOJI[event.category] || '🎪';
  const country = COUNTRY_NAMES[event.country] || event.country;
  const tags = HASHTAGS[event.category] || HASHTAGS.default;
  const url = `https://festmore.com/events/${event.slug}`;
  const attendees = parseInt(event.attendees) || 0;
  const vendorSpots = parseInt(event.vendor_spots) || 0;

  return [
    {
      type: 'Event Announcement',
      time: '9:00 AM',
      icon: '📣',
      color: '#e8470a',
      text: `${emoji} ${event.title}

📍 ${flag} ${event.city}, ${country}
📅 ${event.date_display || event.start_date}
${attendees > 0 ? `👥 ${attendees.toLocaleString()} expected visitors\n` : ''}${vendorSpots > 0 ? `🏪 ${vendorSpots} vendor spots available\n` : ''}${event.price_display ? `🎟️ Entry: ${event.price_display}\n` : ''}
Are you a vendor looking to participate? Apply directly on Festmore 👇
🔗 ${url}

${tags}`,
    },
    {
      type: 'Vendor Callout',
      time: '1:30 PM',
      icon: '🏪',
      color: '#4a7c59',
      text: `🏪 Calling all vendors!

${emoji} ${event.title} is looking for vendors!

📍 ${flag} ${event.city}, ${country}
📅 ${event.date_display || event.start_date}
${vendorSpots > 0 ? `✅ ${vendorSpots} spots available\n` : ''}
Food trucks 🍕, artisan crafts 🎨, clothing 👗 and market stalls 🛍️ all welcome!

Apply on Festmore and get discovered by event organisers across Europe 👇
🔗 ${url}

#vendorwanted #vendor #foodtruck #marketstall #artisan #festivalvendor ${tags}`,
    },
    {
      type: 'Discovery Post',
      time: '6:00 PM',
      icon: '🌍',
      color: '#1a3d28',
      text: `Have you heard about this? 👀

${emoji} ${event.title}

📍 ${flag} ${event.city}, ${country}
📅 ${event.date_display || event.start_date}
${event.price_display === 'Free' ? '✅ Free entry!\n' : ''}
Discover thousands of festivals, markets and events on Festmore 🌍

🔗 festmore.com/events

${tags}`,
    },
  ];
}

// ─────────────────────────────────────
// MAIN PAGE — GET /admin/social-posts
// ─────────────────────────────────────
router.get('/social-posts', requireAdmin, (req, res) => {
  const days = parseInt(req.query.days) || 7;
  const now = new Date();
  const future = new Date();
  future.setDate(now.getDate() + 90);

  const events = db.prepare(`
    SELECT * FROM events
    WHERE status='active'
    AND start_date >= ?
    ORDER BY featured DESC, vendor_spots DESC, attendees DESC
    LIMIT ?
  `).all(now.toISOString().split('T')[0], days * 3);

  // Generate posts for each day
  const schedule = [];
  for (let day = 0; day < days; day++) {
    const date = new Date();
    date.setDate(now.getDate() + day + 1);
    const dateStr = date.toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long' });
    const eventsForDay = events.slice(day * 3, (day * 3) + 3);
    if (eventsForDay.length === 0) continue;

    const posts = eventsForDay.map((event, i) => ({
      ...generatePosts(event)[i] || generatePosts(event)[0],
      event,
      date: dateStr,
    }));

    schedule.push({ date: dateStr, posts });
  }

  res.send(`<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Social Posts — Festmore Admin</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="/css/main.css"/>
<style>
.post-card { background:#fff; border:1px solid var(--border); border-radius:16px; padding:24px; margin-bottom:16px; transition:box-shadow .2s; }
.post-card:hover { box-shadow:0 4px 20px rgba(0,0,0,.08); }
.post-text { font-family:monospace; font-size:13px; line-height:1.7; color:var(--ink); background:var(--ivory); border:1px solid var(--border); border-radius:10px; padding:16px; white-space:pre-wrap; word-break:break-word; max-height:220px; overflow-y:auto; margin:12px 0; }
.copy-btn { background:var(--flame); color:#fff; border:none; border-radius:8px; padding:8px 18px; font-size:13px; font-weight:700; cursor:pointer; font-family:inherit; transition:all .2s; display:flex; align-items:center; gap:6px; }
.copy-btn:hover { opacity:.85; transform:translateY(-1px); }
.copy-btn.copied { background:#4a7c59; }
.day-header { font-family:'DM Serif Display',serif; font-size:20px; font-weight:400; margin:32px 0 16px; color:var(--ink); display:flex; align-items:center; gap:12px; }
.day-header::after { content:''; flex:1; height:1px; background:var(--border); }
.time-badge { font-size:11px; font-weight:700; padding:3px 10px; border-radius:99px; color:#fff; }
.type-badge { font-size:11px; font-weight:700; color:var(--ink3); text-transform:uppercase; letter-spacing:.8px; }
.event-thumb { width:48px; height:48px; border-radius:8px; object-fit:cover; flex-shrink:0; }
.stats-bar { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:32px; }
.stat-card { background:#fff; border:1px solid var(--border); border-radius:14px; padding:20px; text-align:center; }
.week-tabs { display:flex; gap:8px; margin-bottom:28px; flex-wrap:wrap; }
.week-tab { padding:8px 16px; border-radius:99px; font-size:13px; font-weight:600; cursor:pointer; border:1.5px solid var(--border); background:#fff; font-family:inherit; transition:all .2s; }
.week-tab:hover, .week-tab.active { background:var(--flame); color:#fff; border-color:var(--flame); }
</style>
</head><body style="background:var(--cream);">

<nav class="main-nav">
  <div class="nav-inner">
    <a href="/" class="logo"><span class="logo-fest">Fest</span><span class="logo-more">more</span><span class="logo-dot"></span></a>
    <div style="flex:1;"></div>
    <div class="nav-right">
      <a href="/admin" class="btn btn-outline btn-sm">← Admin</a>
    </div>
  </div>
</nav>

<div class="container" style="padding:40px 0 80px;max-width:900px;">

  <!-- HEADER -->
  <div style="margin-bottom:32px;">
    <h1 style="font-family:'DM Serif Display',serif;font-size:36px;font-weight:400;margin-bottom:8px;">📱 Social Media Posts</h1>
    <p style="color:var(--ink3);font-size:15px;">Generated posts ready to copy into Meta Business Suite. 3 posts per day — Instagram + Facebook simultaneously.</p>
  </div>

  <!-- STATS -->
  <div class="stats-bar">
    <div class="stat-card">
      <div style="font-size:28px;font-weight:800;color:var(--flame);">${schedule.length * 3}</div>
      <div style="font-size:13px;color:var(--ink3);">Posts Generated</div>
    </div>
    <div class="stat-card">
      <div style="font-size:28px;font-weight:800;color:#4a7c59;">${schedule.length}</div>
      <div style="font-size:13px;color:var(--ink3);">Days Covered</div>
    </div>
    <div class="stat-card">
      <div style="font-size:28px;font-weight:800;color:#1a3d28;">2</div>
      <div style="font-size:13px;color:var(--ink3);">Platforms</div>
    </div>
    <div class="stat-card">
      <div style="font-size:28px;font-weight:800;color:var(--gold);">~20min</div>
      <div style="font-size:13px;color:var(--ink3);">To Schedule All</div>
    </div>
  </div>

  <!-- HOW TO USE -->
  <div style="background:linear-gradient(135deg,#0d1f15,#1a3d28);border-radius:20px;padding:28px 32px;margin-bottom:32px;display:flex;gap:24px;align-items:center;flex-wrap:wrap;">
    <div style="flex:1;">
      <h3 style="font-family:'DM Serif Display',serif;font-size:20px;font-weight:400;color:#fff;margin-bottom:8px;">How to use these posts</h3>
      <div style="font-size:13px;color:rgba(255,255,255,.6);line-height:1.8;">
        1. Click <strong style="color:#fff;">Copy</strong> on any post below<br/>
        2. Go to <strong style="color:#fff;">business.facebook.com</strong><br/>
        3. Click <strong style="color:#fff;">Create Post</strong> → select Instagram + Facebook<br/>
        4. Paste caption → add event image → Schedule<br/>
        5. Repeat for each post — takes ~2 min per post
      </div>
    </div>
    <a href="https://business.facebook.com" target="_blank" class="btn btn-primary" style="white-space:nowrap;flex-shrink:0;">Open Meta Business Suite →</a>
  </div>

  <!-- WEEK SELECTOR -->
  <div class="week-tabs">
    <button class="week-tab ${days===7?'active':''}" onclick="window.location='/admin/social-posts?days=7'">This Week (7 days)</button>
    <button class="week-tab ${days===14?'active':''}" onclick="window.location='/admin/social-posts?days=14'">2 Weeks</button>
    <button class="week-tab ${days===30?'active':''}" onclick="window.location='/admin/social-posts?days=30'">Full Month (30 days)</button>
  </div>

  <!-- COPY ALL BUTTON -->
  <div style="display:flex;justify-content:flex-end;margin-bottom:20px;">
    <button onclick="copyAll()" style="background:var(--ink);color:#fff;border:none;border-radius:10px;padding:10px 20px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;">📋 Copy All Posts as Text</button>
  </div>

  <!-- POSTS SCHEDULE -->
  ${schedule.map(day => `
  <div class="day-header">${day.date}</div>
  ${day.posts.map((post, pi) => `
  <div class="post-card" id="post-${day.date.replace(/[^a-z0-9]/gi,'')}-${pi}">
    <div style="display:flex;justify-content:space-between;align-items:start;gap:16px;flex-wrap:wrap;">
      <div style="display:flex;gap:12px;align-items:center;">
        ${post.event.image_url ? `<img src="${post.event.image_url}" class="event-thumb" alt="${post.event.title}"/>` : `<div style="width:48px;height:48px;border-radius:8px;background:var(--ivory);display:flex;align-items:center;justify-content:center;font-size:22px;">${CAT_EMOJI[post.event.category]||'🎪'}</div>`}
        <div>
          <div style="font-weight:700;font-size:14px;color:var(--ink);">${post.event.title}</div>
          <div style="font-size:12px;color:var(--ink3);">${FLAGS[post.event.country]||'🌍'} ${post.event.city} · ${post.event.date_display||post.event.start_date}</div>
          <div style="display:flex;gap:8px;margin-top:4px;align-items:center;">
            <span class="time-badge" style="background:${post.color};">${post.icon} ${post.time}</span>
            <span class="type-badge">${post.type}</span>
          </div>
        </div>
      </div>
      <button class="copy-btn" id="btn-${day.date.replace(/[^a-z0-9]/gi,'')}-${pi}" onclick="copyPost(this, '${encodeURIComponent(post.text)}')">
        📋 Copy Caption
      </button>
    </div>
    <div class="post-text">${post.text.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div>
    <div style="display:flex;gap:12px;flex-wrap:wrap;">
      <a href="https://festmore.com/events/${post.event.slug}" target="_blank" style="font-size:12px;color:var(--flame);">View Event →</a>
      ${post.event.image_url ? `<a href="${post.event.image_url}" target="_blank" style="font-size:12px;color:var(--ink3);">Download Image →</a>` : ''}
    </div>
  </div>`).join('')}
  `).join('')}

  ${schedule.length === 0 ? `
  <div style="background:#fff;border:1px solid var(--border);border-radius:20px;padding:64px;text-align:center;">
    <div style="font-size:48px;margin-bottom:16px;">📭</div>
    <h2 style="font-family:'DM Serif Display',serif;font-size:24px;font-weight:400;margin-bottom:8px;">No upcoming events found</h2>
    <p style="color:var(--ink3);">Add more events to Festmore to generate social posts.</p>
  </div>` : ''}

</div>

<!-- HIDDEN: All posts text for copy all -->
<textarea id="all-posts-text" style="position:absolute;left:-9999px;" readonly>${
  schedule.map(day =>
    `=== ${day.date} ===\n\n` +
    day.posts.map(p => `--- ${p.time} ${p.type} ---\n${p.text}\n`).join('\n')
  ).join('\n')
}</textarea>

<script>
function copyPost(btn, encoded) {
  const text = decodeURIComponent(encoded);
  navigator.clipboard.writeText(text).then(() => {
    const orig = btn.innerHTML;
    btn.innerHTML = '✅ Copied!';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.innerHTML = orig;
      btn.classList.remove('copied');
    }, 2000);
  }).catch(() => {
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    btn.innerHTML = '✅ Copied!';
    btn.classList.add('copied');
    setTimeout(() => { btn.innerHTML = '📋 Copy Caption'; btn.classList.remove('copied'); }, 2000);
  });
}

function copyAll() {
  const text = document.getElementById('all-posts-text').value;
  navigator.clipboard.writeText(text).then(() => {
    alert('✅ All ' + ${schedule.length * 3} + ' posts copied to clipboard!\\n\\nPaste into a Google Doc or Notes app to schedule them.');
  });
}
</script>

<footer><div class="footer-bottom"><span>© ${new Date().getFullYear()} Festmore.com — Admin</span></div></footer>
</body></html>`);
});

module.exports = router;
