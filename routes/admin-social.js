const express = require('express');
const router  = express.Router();
const db      = require('../db');

function requireAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/auth/login');
  next();
}

const FLAGS = { BE:'🇧🇪',DK:'🇩🇰',FR:'🇫🇷',DE:'🇩🇪',NL:'🇳🇱',GB:'🇬🇧',US:'🇺🇸',SE:'🇸🇪',IT:'🇮🇹',ES:'🇪🇸',PL:'🇵🇱',NO:'🇳🇴',FI:'🇫🇮',BE:'🇧🇪',IN:'🇮🇳',JP:'🇯🇵',TH:'🇹🇭' };
const COUNTRY_NAMES = { BE:'Belgium',DK:'Denmark',FR:'France',DE:'Germany',NL:'Netherlands',GB:'United Kingdom',US:'USA',SE:'Sweden',IT:'Italy',ES:'Spain',PL:'Poland',NO:'Norway',FI:'Finland',IN:'India',JP:'Japan',TH:'Thailand' };
const CAT_EMOJI = { festival:'🎪',market:'🛍️',christmas:'🎄',concert:'🎵',flea:'🏺',exhibition:'🖼️',business:'💼',kids:'🎠',city:'🏙️',messe:'🏛️' };
const HASHTAGS = {
  festival:'#festival #festivals #festivallife #livemusic #summer #festivalvibes #eventvendor #vendor #festmore',
  market:'#market #markets #streetmarket #streetfood #artisan #handmade #vendor #eventvendor #festmore',
  christmas:'#christmas #christmasmarket #xmas #winter #holiday #weihnachtsmarkt #kerstmarkt #festmore',
  concert:'#concert #livemusic #music #musicfestival #festmore #eventvendor',
  flea:'#fleamarket #vintage #antiques #secondhand #thrift #festmore #vendor',
  default:'#festival #event #events #vendor #eventvendor #festmore #festivals',
};

function generatePosts(event) {
  const flag = FLAGS[event.country] || '🌍';
  const emoji = CAT_EMOJI[event.category] || '🎪';
  const country = COUNTRY_NAMES[event.country] || event.country;
  const tags = HASHTAGS[event.category] || HASHTAGS.default;
  const url = 'https://festmore.com/events/' + event.slug;
  const attendees = parseInt(event.attendees) || 0;
  const vendorSpots = parseInt(event.vendor_spots) || 0;

  return [
    {
      type: 'Event Announcement', time: '9:00 AM', icon: '📣', color: '#e8470a',
      text: emoji + ' ' + event.title + '\n\n📍 ' + flag + ' ' + event.city + ', ' + country + '\n📅 ' + (event.date_display || event.start_date) + '\n' + (attendees > 0 ? '👥 ' + attendees.toLocaleString() + ' expected visitors\n' : '') + (vendorSpots > 0 ? '🏪 ' + vendorSpots + ' vendor spots available\n' : '') + (event.price_display ? '🎟️ Entry: ' + event.price_display + '\n' : '') + '\nAre you a vendor? Apply directly on Festmore 👇\n🔗 ' + url + '\n\n' + tags,
    },
    {
      type: 'Vendor Callout', time: '1:30 PM', icon: '🏪', color: '#4a7c59',
      text: '🏪 Calling all vendors!\n\n' + emoji + ' ' + event.title + ' is looking for vendors!\n\n📍 ' + flag + ' ' + event.city + ', ' + country + '\n📅 ' + (event.date_display || event.start_date) + '\n' + (vendorSpots > 0 ? '✅ ' + vendorSpots + ' spots available\n' : '') + '\nFood trucks 🍕, artisan crafts 🎨, market stalls 🛍️ welcome!\n\nApply on Festmore 👇\n🔗 ' + url + '\n\n#vendorwanted #foodtruck #marketstall #artisan ' + tags,
    },
    {
      type: 'Discovery Post', time: '6:00 PM', icon: '🌍', color: '#1a3d28',
      text: 'Have you heard about this? 👀\n\n' + emoji + ' ' + event.title + '\n\n📍 ' + flag + ' ' + event.city + ', ' + country + '\n📅 ' + (event.date_display || event.start_date) + '\n' + (event.price_display === 'Free' ? '✅ Free entry!\n' : '') + '\nDiscover thousands of events on Festmore 🌍\n🔗 festmore.com/events\n\n' + tags,
    },
  ];
}

router.get('/social-posts', requireAdmin, (req, res) => {
  const days = parseInt(req.query.days) || 7;
  const now = new Date();

  const events = db.prepare("SELECT * FROM events WHERE status='active' AND start_date >= ? ORDER BY featured DESC, vendor_spots DESC, attendees DESC LIMIT ?").all(now.toISOString().split('T')[0], days * 3);

  const schedule = [];
  for (let day = 0; day < days; day++) {
    const date = new Date();
    date.setDate(now.getDate() + day + 1);
    const dateStr = date.toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long' });
    const eventsForDay = events.slice(day * 3, (day * 3) + 3);
    if (eventsForDay.length === 0) continue;
    const posts = eventsForDay.map((event, i) => ({ ...generatePosts(event)[i] || generatePosts(event)[0], event, date: dateStr }));
    schedule.push({ date: dateStr, posts });
  }

  let html = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Social Posts — Festmore Admin</title><link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/><link rel="stylesheet" href="/css/main.css"/><style>.post-card{background:#fff;border:1px solid var(--border);border-radius:16px;padding:24px;margin-bottom:16px;}.post-text{font-family:monospace;font-size:13px;line-height:1.7;color:var(--ink);background:var(--ivory);border:1px solid var(--border);border-radius:10px;padding:16px;white-space:pre-wrap;word-break:break-word;max-height:200px;overflow-y:auto;margin:12px 0;}.copy-btn{background:var(--flame);color:#fff;border:none;border-radius:8px;padding:8px 18px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;}.copy-btn.copied{background:#4a7c59;}.day-header{font-family:"DM Serif Display",serif;font-size:20px;font-weight:400;margin:32px 0 16px;color:var(--ink);}</style></head><body style="background:var(--cream);">';

  html += '<nav class="main-nav"><div class="nav-inner"><a href="/" class="logo"><span class="logo-fest">Fest</span><span class="logo-more">more</span><span class="logo-dot"></span></a><div style="flex:1;"></div><div class="nav-right"><a href="/admin" class="btn btn-outline btn-sm">← Admin</a></div></div></nav>';

  html += '<div class="container" style="padding:40px 0 80px;max-width:900px;">';
  html += '<h1 style="font-family:\'DM Serif Display\',serif;font-size:36px;font-weight:400;margin-bottom:8px;">📱 Social Media Posts</h1>';
  html += '<p style="color:var(--ink3);margin-bottom:24px;">Copy captions into Meta Business Suite to schedule on Instagram + Facebook.</p>';

  html += '<div style="background:linear-gradient(135deg,#0d1f15,#1a3d28);border-radius:20px;padding:24px 28px;margin-bottom:28px;display:flex;gap:20px;align-items:center;flex-wrap:wrap;">';
  html += '<div style="flex:1;font-size:13px;color:rgba(255,255,255,.6);line-height:1.8;"><strong style="color:#fff;">How to use:</strong> 1. Copy any post below &nbsp;2. Go to business.facebook.com &nbsp;3. Create Post → Instagram + Facebook &nbsp;4. Paste → Schedule</div>';
  html += '<a href="https://business.facebook.com" target="_blank" class="btn btn-primary" style="white-space:nowrap;flex-shrink:0;">Open Meta Business Suite →</a></div>';

  html += '<div style="display:flex;gap:8px;margin-bottom:24px;">';
  html += '<a href="/admin/social-posts?days=7" class="btn ' + (days===7?'btn-primary':'btn-outline') + ' btn-sm">7 Days</a>';
  html += '<a href="/admin/social-posts?days=14" class="btn ' + (days===14?'btn-primary':'btn-outline') + ' btn-sm">14 Days</a>';
  html += '<a href="/admin/social-posts?days=30" class="btn ' + (days===30?'btn-primary':'btn-outline') + ' btn-sm">30 Days</a></div>';

  schedule.forEach(day => {
    html += '<div class="day-header">' + day.date + '</div>';
    day.posts.forEach((post, pi) => {
      const safeText = post.text.replace(/\\/g,'\\\\').replace(/`/g,'\\`').replace(/\$/g,'\\$');
      html += '<div class="post-card">';
      html += '<div style="display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap;margin-bottom:8px;">';
      html += '<div><span style="background:' + post.color + ';color:#fff;padding:3px 10px;border-radius:99px;font-size:11px;font-weight:700;">' + post.icon + ' ' + post.time + '</span> <span style="font-size:12px;color:var(--ink3);font-weight:700;">' + post.type + '</span></div>';
      html += '<button class="copy-btn" id="btn' + pi + day.date.replace(/[^a-z0-9]/gi,'') + '" onclick="copyPost(this, `' + safeText + '`)">📋 Copy</button></div>';
      html += '<div style="font-size:13px;font-weight:600;color:var(--ink);margin-bottom:6px;">' + post.event.title + ' — ' + (post.event.city||'') + '</div>';
      html += '<div class="post-text">' + post.text.replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</div>';
      html += '</div>';
    });
  });

  if (schedule.length === 0) {
    html += '<div style="background:#fff;border:1px solid var(--border);border-radius:20px;padding:48px;text-align:center;"><div style="font-size:48px;margin-bottom:16px;">📭</div><h2 style="font-family:\'DM Serif Display\',serif;font-size:24px;font-weight:400;">No upcoming events found</h2></div>';
  }

  html += '</div>';
  html += '<script>function copyPost(btn,text){navigator.clipboard.writeText(text).then(()=>{const o=btn.innerHTML;btn.innerHTML="✅ Copied!";btn.classList.add("copied");setTimeout(()=>{btn.innerHTML=o;btn.classList.remove("copied");},2000);}).catch(()=>{const ta=document.createElement("textarea");ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand("copy");document.body.removeChild(ta);btn.innerHTML="✅ Copied!";setTimeout(()=>{btn.innerHTML="📋 Copy";},2000);});}</script>';
  html += '<footer><div class="footer-bottom"><span>© ' + new Date().getFullYear() + ' Festmore.com</span></div></footer>';
  html += '</body></html>';

  res.send(html);
});

module.exports = router;
