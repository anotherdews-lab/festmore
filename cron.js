// cron.js — Weekly Newsletter Automation
// Place this file in the ROOT of your project (same level as server.js)
// Then add ONE line to server.js: require('./cron');

const db = require('./db');

async function sendEmail(to, subject, html) {
  try {
    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'Festmore <onboarding@resend.dev>',
      to, subject, html
    });
    return true;
  } catch(err) {
    console.error('Cron email error to', to, ':', err.message);
    return false;
  }
}

function getAllRecipients() {
  const seen = new Set();
  const list = [];
  const add = (email, name, type) => {
    if (!email || !email.includes('@')) return;
    const key = email.toLowerCase().trim();
    if (seen.has(key)) return;
    seen.add(key);
    list.push({ email: key, name: name || '', type });
  };
  try { db.prepare("SELECT email, name FROM subscribers WHERE active=1").all().forEach(s => add(s.email, s.name, 'subscriber')); } catch(e){}
  try { db.prepare("SELECT email, business_name FROM vendors WHERE status='active'").all().forEach(v => add(v.email, v.business_name, 'vendor')); } catch(e){}
  try { db.prepare("SELECT DISTINCT organiser_email FROM events WHERE status='active' AND organiser_email IS NOT NULL AND organiser_email != ''").all().forEach(o => add(o.organiser_email, '', 'organiser')); } catch(e){}
  return list;
}

async function sendWeeklyNewsletter() {
  console.log('📧 [CRON] Starting weekly newsletter...');

  // Don't send if already sent in last 6 days
  try {
    const lastSent = db.prepare("SELECT sent_at FROM newsletter_campaigns WHERE status='sent' ORDER BY sent_at DESC LIMIT 1").get();
    if (lastSent) {
      const daysSince = (Date.now() - new Date(lastSent.sent_at).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince < 6) {
        console.log('📧 [CRON] Already sent ' + Math.round(daysSince) + ' days ago — skipping');
        return;
      }
    }
  } catch(e) {}

  const recipients = getAllRecipients();
  if (recipients.length === 0) {
    console.log('📧 [CRON] No recipients found');
    return;
  }

  const topEvents  = db.prepare("SELECT * FROM events WHERE status='active' ORDER BY featured DESC, attendees DESC LIMIT 6").all();
  const topVendors = db.prepare("SELECT * FROM vendors WHERE status='active' AND payment_status='paid' ORDER BY verified DESC LIMIT 3").all();
  const articles   = db.prepare("SELECT * FROM articles WHERE status='published' ORDER BY created_at DESC LIMIT 2").all();

  const FLAGS = { BE:'🇧🇪',CN:'🇨🇳',DK:'🇩🇰',FR:'🇫🇷',DE:'🇩🇪',NL:'🇳🇱',GB:'🇬🇧',US:'🇺🇸',IT:'🇮🇹',ES:'🇪🇸',JP:'🇯🇵',IN:'🇮🇳',AU:'🇦🇺',CA:'🇨🇦',BR:'🇧🇷',NO:'🇳🇴',SE:'🇸🇪',FI:'🇫🇮',PT:'🇵🇹',IE:'🇮🇪' };
  const month = new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  const year  = new Date().getFullYear();
  const subject = '🎪 This Week on Festmore — ' + month;

  const eventsHTML = topEvents.slice(0, 4).map(e =>
    '<table width="48%" cellpadding="0" cellspacing="0" style="display:inline-table;vertical-align:top;margin:0 1% 16px;"><tr><td>' +
    '<a href="https://festmore.com/events/' + e.slug + '" style="text-decoration:none;">' +
    '<img src="' + (e.image_url || 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&q=70') + '" width="100%" style="border-radius:10px;display:block;margin-bottom:10px;height:130px;object-fit:cover;"/>' +
    '<div style="font-size:10px;font-weight:700;color:#e8470a;text-transform:uppercase;">' + (FLAGS[e.country]||'🌍') + ' ' + e.city + '</div>' +
    '<div style="font-size:14px;font-weight:700;color:#1a1612;margin:3px 0;line-height:1.3;">' + e.title + '</div>' +
    '<div style="font-size:12px;color:#7a6f68;">📅 ' + (e.date_display||e.start_date) + '</div>' +
    '<div style="font-size:12px;color:#e8470a;font-weight:700;margin-top:6px;">View event →</div>' +
    '</a></td></tr></table>'
  ).join('');

  const vendorsHTML = topVendors.slice(0, 3).map(v => {
    let img = v.image_url || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=70';
    try { const p = JSON.parse(v.photos||'[]'); if(p.length) img = p[0]; } catch(e){}
    return '<table width="31%" cellpadding="0" cellspacing="0" style="display:inline-table;vertical-align:top;margin:0 1% 16px;"><tr><td style="background:#f5f0e8;border-radius:12px;padding:16px;text-align:center;">' +
    '<img src="' + img + '" width="60" height="60" style="border-radius:10px;object-fit:cover;margin-bottom:10px;"/>' +
    '<div style="font-size:10px;font-weight:700;color:#4a7c59;text-transform:uppercase;margin-bottom:3px;">' + v.category + '</div>' +
    '<div style="font-size:14px;font-weight:700;color:#1a1612;margin-bottom:3px;">' + v.business_name + '</div>' +
    '<div style="font-size:11px;color:#7a6f68;margin-bottom:10px;">' + (FLAGS[v.country]||'🌍') + ' ' + v.city + '</div>' +
    '<a href="https://festmore.com/vendors/profile/' + v.id + '" style="display:inline-block;background:#4a7c59;color:#fff;padding:6px 16px;border-radius:8px;font-size:12px;font-weight:700;text-decoration:none;">View Profile</a>' +
    '</td></tr></table>';
  }).join('');

  function makeHTML(name, email) {
    return '<!DOCTYPE html><html><head><meta charset="UTF-8"/></head>' +
    '<body style="margin:0;padding:0;background:#f5f0e8;font-family:Helvetica Neue,Arial,sans-serif;">' +
    '<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;padding:32px 16px;"><tr><td align="center">' +
    '<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">' +

    '<tr><td style="background:#0a1a0f;border-radius:20px 20px 0 0;padding:36px 48px;text-align:center;">' +
    '<span style="font-size:26px;font-weight:800;color:#fff;">Fest<span style="color:#e8470a;">more</span></span>' +
    '<div style="font-size:13px;color:rgba(255,255,255,.4);margin-top:6px;">' + month + '</div>' +
    '<h1 style="font-size:24px;font-weight:400;color:#fff;margin:16px 0 0;font-family:Georgia,serif;">🎪 This Week on Festmore</h1>' +
    '</td></tr>' +

    '<tr><td style="background:#fff;padding:40px 48px;">' +
    '<p style="font-size:15px;color:#6b5f58;line-height:1.8;margin:0 0 28px;">Hi ' + (name||'there') + ',<br/><br/>Here is what is new on Festmore this week — new events, featured vendors and the latest festival guides.</p>' +

    (topEvents.length ? '<h2 style="font-size:20px;font-weight:700;color:#1a1612;margin:0 0 16px;">🎪 Events This Week</h2><table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">' + eventsHTML + '</table><table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;"><tr><td align="center"><a href="https://festmore.com/events" style="display:inline-block;background:#e8470a;color:#fff;padding:13px 32px;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none;">Browse All Events</a></td></tr></table>' : '') +

    (topVendors.length ? '<h2 style="font-size:20px;font-weight:700;color:#1a1612;margin:0 0 16px;">🏪 Featured Vendors</h2><table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">' + vendorsHTML + '</table><table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;"><tr><td align="center"><a href="https://festmore.com/vendors" style="display:inline-block;background:#4a7c59;color:#fff;padding:13px 32px;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none;">Browse All Vendors</a></td></tr></table>' : '') +

    (articles.length ? '<div style="background:#f5f0e8;border-radius:14px;padding:24px;margin-bottom:28px;"><h2 style="font-size:18px;font-weight:700;color:#1a1612;margin:0 0 14px;">📰 Latest Guides</h2>' + articles.map(a => '<div style="margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid rgba(26,22,18,.08);"><a href="https://festmore.com/articles/' + a.slug + '" style="font-size:14px;font-weight:700;color:#e8470a;text-decoration:none;">' + a.title + '</a></div>').join('') + '</div>' : '') +

    '<div style="background:linear-gradient(135deg,#0d1f15,#1a3d28);border-radius:14px;padding:24px;text-align:center;margin-bottom:20px;">' +
    '<h3 style="font-size:17px;font-weight:700;color:#fff;margin:0 0 8px;">🏪 Are you a vendor?</h3>' +
    '<p style="font-size:13px;color:rgba(255,255,255,.6);margin:0 0 14px;">Get discovered by event organisers worldwide. €49/year.</p>' +
    '<a href="https://festmore.com/vendors/register" style="display:inline-block;background:#4a7c59;color:#fff;padding:11px 24px;border-radius:10px;font-size:13px;font-weight:700;text-decoration:none;">Become a Vendor</a>' +
    '</div>' +

    '<div style="background:#fff7ed;border:1px solid rgba(232,71,10,.2);border-radius:14px;padding:24px;text-align:center;">' +
    '<h3 style="font-size:17px;font-weight:700;color:#1a1612;margin:0 0 8px;">🎪 Have an event to list?</h3>' +
    '<p style="font-size:13px;color:#7a6f68;margin:0 0 14px;">Free listings available. Standard from €79/yr.</p>' +
    '<a href="https://festmore.com/events/submit" style="display:inline-block;background:#e8470a;color:#fff;padding:11px 24px;border-radius:10px;font-size:13px;font-weight:700;text-decoration:none;">List Your Event</a>' +
    '</div>' +
    '</td></tr>' +

    '<tr><td style="background:#1a1612;border-radius:0 0 20px 20px;padding:24px 48px;text-align:center;">' +
    '<span style="font-size:16px;font-weight:800;color:#fff;">Fest<span style="color:#e8470a;">more</span></span>' +
    '<p style="font-size:11px;color:rgba(255,255,255,.3);margin:10px 0 0;line-height:1.6;">© ' + year + ' Festmore.com<br/>' +
    '<a href="https://festmore.com/newsletter/unsubscribe?email=' + encodeURIComponent(email) + '" style="color:rgba(255,255,255,.3);">Unsubscribe</a>' +
    '</p></td></tr>' +
    '</table></td></tr></table></body></html>';
  }

  // Save campaign
  try {
    db.prepare("INSERT INTO newsletter_campaigns (subject, body_html, status, sent_count, sent_at) VALUES (?, ?, 'sending', ?, datetime('now'))")
      .run(subject, makeHTML('there', 'preview@festmore.com'), recipients.length);
  } catch(e) {}

  // Send in batches of 10
  let sent = 0, failed = 0;
  for (let i = 0; i < recipients.length; i += 10) {
    const batch = recipients.slice(i, i + 10);
    await Promise.all(batch.map(async r => {
      const ok = await sendEmail(r.email, subject, makeHTML(r.name, r.email));
      if (ok) sent++; else failed++;
    }));
    await new Promise(resolve => setTimeout(resolve, 400));
  }

  try { db.prepare("UPDATE newsletter_campaigns SET status='sent', sent_count=? WHERE status='sending'").run(sent); } catch(e){}
  console.log('📧 [CRON] Weekly newsletter complete — sent: ' + sent + ' / failed: ' + failed);
}

// ─── Welcome email for new subscribers ───────────────────────────
async function sendWelcomeEmail(email, name) {
  const year = new Date().getFullYear();
  const html = '<!DOCTYPE html><html><head><meta charset="UTF-8"/></head>' +
  '<body style="margin:0;padding:0;background:#f5f0e8;font-family:Helvetica Neue,Arial,sans-serif;">' +
  '<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;padding:32px 16px;"><tr><td align="center">' +
  '<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">' +
  '<tr><td style="background:#0a1a0f;border-radius:20px 20px 0 0;padding:40px 48px;text-align:center;">' +
  '<span style="font-size:26px;font-weight:800;color:#fff;">Fest<span style="color:#e8470a;">more</span></span>' +
  '<div style="font-size:52px;margin:20px 0;">🎪</div>' +
  '<h1 style="font-size:28px;font-weight:400;color:#fff;margin:0;font-family:Georgia,serif;">Welcome to Festmore!</h1>' +
  '</td></tr>' +
  '<tr><td style="background:#fff;padding:40px 48px;">' +
  '<p style="font-size:16px;color:#1a1612;margin-bottom:16px;">Hi ' + (name||'there') + ',</p>' +
  '<p style="font-size:15px;color:#6b5f58;line-height:1.8;margin-bottom:24px;">You are now subscribed to the Festmore weekly newsletter — the best festivals, markets, vendor opportunities and event news delivered every Sunday.</p>' +
  '<div style="background:#f5f0e8;border-radius:14px;padding:24px;margin-bottom:28px;">' +
  '<div style="font-size:14px;font-weight:700;color:#1a1612;margin-bottom:12px;">Every week you will receive:</div>' +
  '<div style="font-size:14px;color:#6b5f58;line-height:2.0;">' +
  '🎪 New and featured events across 26 countries<br/>' +
  '🏪 Spotlight on verified vendors<br/>' +
  '📰 Festival guides and event news<br/>' +
  '💡 Vendor opportunities and open spots' +
  '</div></div>' +
  '<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;"><tr>' +
  '<td width="48%" style="padding-right:8px;"><a href="https://festmore.com/events" style="display:block;background:#e8470a;color:#fff;padding:13px 20px;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none;text-align:center;">Browse Events →</a></td>' +
  '<td width="48%" style="padding-left:8px;"><a href="https://festmore.com/vendors" style="display:block;background:#4a7c59;color:#fff;padding:13px 20px;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none;text-align:center;">Find Vendors →</a></td>' +
  '</tr></table>' +
  '<p style="font-size:13px;color:#7a6f68;line-height:1.7;">Questions? Just reply to this email and we will get back to you personally within a few hours.</p>' +
  '</td></tr>' +
  '<tr><td style="background:#1a1612;border-radius:0 0 20px 20px;padding:24px 48px;text-align:center;">' +
  '<span style="font-size:16px;font-weight:800;color:#fff;">Fest<span style="color:#e8470a;">more</span></span>' +
  '<p style="font-size:11px;color:rgba(255,255,255,.3);margin:10px 0 0;line-height:1.6;">© ' + year + ' Festmore.com<br/>' +
  '<a href="https://festmore.com/newsletter/unsubscribe?email=' + encodeURIComponent(email) + '" style="color:rgba(255,255,255,.3);">Unsubscribe</a>' +
  '</p></td></tr>' +
  '</table></td></tr></table></body></html>';

  return sendEmail(email, '🎪 Welcome to Festmore — You are subscribed!', html);
}

// ─── SCHEDULE: Check every hour, send every Sunday 9am UTC ───────
function startCron() {
  const HOUR = 60 * 60 * 1000;

  setInterval(async () => {
    const now  = new Date();
    const day  = now.getUTCDay();   // 0 = Sunday
    const hour = now.getUTCHours();
    if (day === 0 && hour === 9) {
      await sendWeeklyNewsletter();
    }
  }, HOUR);

  console.log('⏰ Newsletter cron started — fires every Sunday at 9am UTC');
}

startCron();
module.exports = { sendWeeklyNewsletter, sendWelcomeEmail };
