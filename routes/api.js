// routes/api.js — JSON API for search etc
const express = require('express');
const router  = express.Router();
const db      = require('../db');

router.get('/search', (req, res) => {
  const { q='', limit=10 } = req.query;
  if (!q) return res.json([]);
  const events = db.prepare(`SELECT id,title,slug,city,country,category,date_display FROM events WHERE status='active' AND (title LIKE ? OR city LIKE ? OR tags LIKE ?) LIMIT ?`).all(`%${q}%`,`%${q}%`,`%${q}%`,parseInt(limit));
  res.json(events);
});

router.get('/stats', (req, res) => {
  res.json({
    events:   db.prepare("SELECT COUNT(*) as n FROM events WHERE status='active'").get().n,
    vendors:  db.prepare("SELECT COUNT(*) as n FROM vendors WHERE status='active'").get().n,
    articles: db.prepare("SELECT COUNT(*) as n FROM articles WHERE status='published'").get().n,
  });
});
router.get('/my-vendor', (req, res) => {
  if (!req.session.user) return res.json({ vendor_id: null });
  const vendor = db.prepare("SELECT id FROM vendors WHERE email=? AND status='active' AND payment_status='paid'").get(req.session.user.email);
  res.json({ vendor_id: vendor ? vendor.id : null });
});

// Random event for Make.com/social media automation
router.get('/random-event', (req, res) => {
  const events = db.prepare(`
    SELECT id, title, slug, city, country, category, date_display,
           start_date, price_display, attendees, vendor_spots,
           image_url, description
    FROM events
    WHERE status='active'
    WHERE status='active'
ORDER BY RANDOM()
LIMIT 1
    ORDER BY RANDOM()
    LIMIT 1
  `).get();

  if (!events) return res.json({ ok: false, msg: 'No events found' });

  const FLAGS = { BE:'🇧🇪',DK:'🇩🇰',FR:'🇫🇷',DE:'🇩🇪',NL:'🇳🇱',GB:'🇬🇧',US:'🇺🇸',SE:'🇸🇪',IT:'🇮🇹',ES:'🇪🇸',PL:'🇵🇱',NO:'🇳🇴',FI:'🇫🇮',IN:'🇮🇳',JP:'🇯🇵',TH:'🇹🇭',BE:'🇧🇪',HU:'🇭🇺',AT:'🇦🇹',CH:'🇨🇭',AE:'🇦🇪' };
  const COUNTRY_NAMES = { BE:'Belgium',DK:'Denmark',FR:'France',DE:'Germany',NL:'Netherlands',GB:'United Kingdom',US:'USA',SE:'Sweden',IT:'Italy',ES:'Spain',PL:'Poland',NO:'Norway',FI:'Finland',IN:'India',JP:'Japan',TH:'Thailand',HU:'Hungary',AT:'Austria',CH:'Switzerland',AE:'UAE' };
  const CAT_EMOJI = { festival:'🎪',market:'🛍️',christmas:'🎄',concert:'🎵',flea:'🏺',exhibition:'🖼️',business:'💼',kids:'🎠',city:'🏙️',messe:'🏛️' };
  const HASHTAGS = { festival:'#festival #festivals #festivallife #livemusic #summer #eventvendor #vendor #festmore', market:'#market #markets #streetmarket #streetfood #artisan #vendor #eventvendor #festmore', christmas:'#christmas #christmasmarket #xmas #winter #weihnachtsmarkt #kerstmarkt #festmore', concert:'#concert #livemusic #music #musicfestival #festmore', flea:'#fleamarket #vintage #antiques #secondhand #thrift #festmore', default:'#festival #event #events #vendor #eventvendor #festmore' };

  const flag = FLAGS[events.country] || '🌍';
  const emoji = CAT_EMOJI[events.category] || '🎪';
  const country = COUNTRY_NAMES[events.country] || events.country;
  const tags = HASHTAGS[events.category] || HASHTAGS.default;
  const url = 'https://festmore.com/events/' + events.slug;
  const attendees = parseInt(events.attendees) || 0;
  const vendorSpots = parseInt(events.vendor_spots) || 0;

  const caption = emoji + ' ' + events.title + '\n\n' +
    '📍 ' + flag + ' ' + events.city + ', ' + country + '\n' +
    '📅 ' + (events.date_display || events.start_date) + '\n' +
    (attendees > 0 ? '👥 ' + attendees.toLocaleString() + ' expected visitors\n' : '') +
    (vendorSpots > 0 ? '🏪 ' + vendorSpots + ' vendor spots available\n' : '') +
    (events.price_display ? '🎟️ ' + events.price_display + '\n' : '') +
    '\nAre you a vendor? Apply on Festmore 👇\n' +
    '🔗 ' + url + '\n\n' + tags;

  const image = events.image_url ||
    'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1080&q=80';

  res.json({
    ok: true,
    event: {
      title: events.title,
      city: events.city,
      country: country,
      date: events.date_display || events.start_date,
      url: url,
      image_url: image,
      caption: caption,
    }
  });
});

// Vendor callout post for Make.com
router.get('/random-vendor-event', (req, res) => {
  const events = db.prepare(`
    SELECT id, title, slug, city, country, category, date_display,
           start_date, price_display, vendor_spots, image_url
    FROM events
    WHERE status='active'
    WHERE status='active'
ORDER BY RANDOM()
LIMIT 1
    AND vendor_spots > 0
    ORDER BY RANDOM()
    LIMIT 1
  `).get();

  if (!events) return res.json({ ok: false, msg: 'No events with vendor spots found' });

  const FLAGS = { BE:'🇧🇪',DK:'🇩🇰',FR:'🇫🇷',DE:'🇩🇪',NL:'🇳🇱',GB:'🇬🇧',US:'🇺🇸',SE:'🇸🇪',IT:'🇮🇹',ES:'🇪🇸',PL:'🇵🇱',NO:'🇳🇴',FI:'🇫🇮',IN:'🇮🇳',JP:'🇯🇵',TH:'🇹🇭',HU:'🇭🇺',AT:'🇦🇹',CH:'🇨🇭',AE:'🇦🇪' };
  const COUNTRY_NAMES = { BE:'Belgium',DK:'Denmark',FR:'France',DE:'Germany',NL:'Netherlands',GB:'United Kingdom',US:'USA',SE:'Sweden',IT:'Italy',ES:'Spain',PL:'Poland',NO:'Norway',FI:'Finland',IN:'India',JP:'Japan',TH:'Thailand',HU:'Hungary',AT:'Austria',CH:'Switzerland',AE:'UAE' };
  const CAT_EMOJI = { festival:'🎪',market:'🛍️',christmas:'🎄',concert:'🎵',flea:'🏺',exhibition:'🖼️',business:'💼',kids:'🎠',city:'🏙️',messe:'🏛️' };

  const flag = FLAGS[events.country] || '🌍';
  const emoji = CAT_EMOJI[events.category] || '🎪';
  const country = COUNTRY_NAMES[events.country] || events.country;
  const url = 'https://festmore.com/events/' + events.slug;
  const vendorSpots = parseInt(events.vendor_spots) || 0;

  const caption = '🏪 Calling all vendors!\n\n' +
    emoji + ' ' + events.title + ' is looking for vendors!\n\n' +
    '📍 ' + flag + ' ' + events.city + ', ' + country + '\n' +
    '📅 ' + (events.date_display || events.start_date) + '\n' +
    (vendorSpots > 0 ? '✅ ' + vendorSpots + ' spots available\n' : '') +
    '\nFood trucks 🍕, artisan crafts 🎨, market stalls 🛍️ all welcome!\n\n' +
    'Apply on Festmore 👇\n' +
    '🔗 ' + url + '\n\n' +
    '#vendorwanted #vendor #foodtruck #marketstall #festivalvendor #eventvendor #festmore';

  res.json({
    ok: true,
    event: {
      title: events.title,
      city: events.city,
      country: country,
      date: events.date_display || events.start_date,
      url: url,
      image_url: events.image_url || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1080&q=80',
      caption: caption,
    }
  });
});

module.exports = router;
