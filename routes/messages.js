// routes/messages.js — COMPLETE MESSAGING v2
// ✅ Vendors can message event organisers directly
// ✅ Organisers get email notification
// ✅ Full inbox with thread view
// ✅ Reply system
// ✅ No need to know recipient email

const express = require('express');
const router  = express.Router();
const db      = require('../db');

function requireLogin(req, res, next) {
  if (!req.session.user) return res.redirect('/auth/login?redirect=' + req.originalUrl);
  next();
}

async function sendEmail(to, subject, html) {
  try {
    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({ from: 'Festmore <contact@festmore.com>', to, subject, html });
    console.log('✅ Email sent:', to);
  } catch(err) { console.error('❌ Email error:', err.message); }
}

function emailWrap(content) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head>
<body style="font-family:'Helvetica Neue',Arial,sans-serif;background:#f5f0e8;margin:0;padding:40px 20px;">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:20px;overflow:hidden;">
  <div style="background:#0a1a0f;padding:28px 36px;">
    <span style="font-size:20px;font-weight:800;"><span style="color:#fff;">Fest</span><span style="color:#e8470a;">more</span></span>
  </div>
  <div style="padding:36px;">${content}</div>
  <div style="background:#f1ede8;padding:20px 36px;text-align:center;font-size:12px;color:#9b8f88;">
    © ${new Date().getFullYear()} Festmore.com · <a href="https://festmore.com" style="color:#e8470a;">festmore.com</a>
  </div>
</div></body></html>`;
}

// ─── INBOX ───────────────────────────
router.get('/', requireLogin, (req, res) => {
  const userId = req.session.user.id;
  const user = req.session.user;

  const messages = db.prepare(`
    SELECT m.*,
           u_from.name as from_name, u_from.email as from_email,
           u_to.name as to_name, u_to.email as to_email
    FROM messages m
    LEFT JOIN users u_from ON m.from_user_id = u_from.id
    LEFT JOIN users u_to ON m.to_user_id = u_to.id
    WHERE m.from_user_id = ? OR m.to_user_id = ?
    ORDER BY m.created_at DESC LIMIT 200
  `).all(userId, userId);

  const threadMap = {};
  messages.forEach(m => {
    const tid = m.thread_id || ('direct_' + m.id);
    if (!threadMap[tid]) threadMap[tid] = { latest: m, unread: 0, count: 0 };
    threadMap[tid].count++;
    if (!m.read && m.to_user_id === userId) threadMap[tid].unread++;
  });

  const threads = Object.entries(threadMap)
    .map(([tid, t]) => ({ ...t, thread_id: tid }))
    .sort((a, b) => new Date(b.latest.created_at) - new Date(a.latest.created_at));

  const unreadTotal = threads.reduce((s, t) => s + t.unread, 0);

  res.send(`<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Messages — Festmore</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="/css/main.css"/>
</head><body style="background:var(--cream);">
<nav class="main-nav">
  <div class="nav-inner">
    <a href="/" class="logo"><span class="logo-fest">Fest</span><span class="logo-more">more</span><span class="logo-dot"></span></a>
    <div style="flex:1;"></div>
    <div class="nav-right">
      <span style="font-size:13px;color:var(--ink3);">${user.name}</span>
      <a href="/auth/logout" class="btn btn-ghost btn-sm">Logout</a>
    </div>
  </div>
  <div class="nav-cats-bar">
    <a href="/dashboard" class="nav-cat">📊 Dashboard</a>
    <a href="/applications/my" class="nav-cat">📋 Applications</a>
    <a href="/messages" class="nav-cat" style="color:var(--flame);border-bottom:2px solid var(--flame);">💬 Messages ${unreadTotal > 0 ? `<span style="background:var(--flame);color:#fff;border-radius:99px;padding:2px 7px;font-size:11px;font-weight:700;margin-left:4px;">${unreadTotal}</span>` : ''}</a>
    <a href="/events" class="nav-cat">🌍 Browse Events</a>
  </div>
</nav>
<div class="container" style="padding:44px 0 80px;max-width:860px;">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:32px;flex-wrap:wrap;gap:16px;">
    <div>
      <h1 style="font-family:'DM Serif Display',serif;font-size:32px;font-weight:400;margin-bottom:6px;">Messages ${unreadTotal > 0 ? `<span style="background:var(--flame);color:#fff;border-radius:99px;padding:4px 14px;font-size:16px;font-weight:700;margin-left:8px;">${unreadTotal} new</span>` : ''}</h1>
      <p style="color:var(--ink3);">Your conversations with event organisers and vendors.</p>
    </div>
    <button onclick="document.getElementById('compose-modal').style.display='flex'" class="btn btn-primary">+ New Message</button>
  </div>
  ${threads.length === 0 ? `
  <div style="background:#fff;border:1px solid var(--border);border-radius:20px;padding:64px;text-align:center;">
    <div style="font-size:48px;margin-bottom:16px;">💬</div>
    <h2 style="font-family:'DM Serif Display',serif;font-size:24px;font-weight:400;margin-bottom:8px;">No messages yet</h2>
    <p style="color:var(--ink3);margin-bottom:24px;">Browse events and contact an organiser to get started.</p>
    <a href="/events" class="btn btn-primary">Browse Events →</a>
  </div>` : `
  <div style="background:#fff;border:1px solid var(--border);border-radius:20px;overflow:hidden;">
    ${threads.map((thread, i) => {
      const m = thread.latest;
      const isFromMe = m.from_user_id === userId;
      const otherName = isFromMe ? m.to_name : m.from_name;
      const hasUnread = thread.unread > 0;
      const initial = (otherName || '?').charAt(0).toUpperCase();
      return `
    <a href="/messages/thread/${thread.thread_id}" style="display:flex;gap:16px;padding:18px 24px;border-bottom:${i < threads.length-1?'1px solid var(--border)':'none'};text-decoration:none;background:${hasUnread?'rgba(232,71,10,.03)':'#fff'};" onmouseover="this.style.background='var(--ivory)'" onmouseout="this.style.background='${hasUnread?'rgba(232,71,10,.03)':'#fff'}'">
      <div style="width:44px;height:44px;border-radius:50%;background:${hasUnread?'var(--flame)':'var(--ivory)'};display:flex;align-items:center;justify-content:center;font-size:17px;font-weight:700;color:${hasUnread?'#fff':'var(--ink3)'};flex-shrink:0;">${initial}</div>
      <div style="flex:1;min-width:0;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px;">
          <div style="font-weight:${hasUnread?'700':'600'};font-size:14px;color:var(--ink);">${otherName || 'Unknown'}</div>
          <div style="font-size:12px;color:var(--ink4);">${new Date(m.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</div>
        </div>
        <div style="font-size:13px;color:${hasUnread?'var(--ink)':'var(--ink3)'};font-weight:${hasUnread?'600':'400'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
          ${m.subject ? `<strong>${m.subject}</strong> — ` : ''}${m.body ? m.body.substring(0,60)+'...' : ''}
        </div>
      </div>
      ${hasUnread ? `<div style="width:8px;height:8px;border-radius:50%;background:var(--flame);flex-shrink:0;margin-top:6px;"></div>` : ''}
    </a>`;
    }).join('')}
  </div>`}
</div>

<!-- COMPOSE MODAL -->
<div id="compose-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:1000;align-items:center;justify-content:center;padding:20px;">
  <div style="background:#fff;border-radius:20px;padding:32px;max-width:540px;width:100%;max-height:90vh;overflow-y:auto;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
      <h2 style="font-family:'DM Serif Display',serif;font-size:22px;font-weight:400;margin:0;">New Message</h2>
      <button onclick="document.getElementById('compose-modal').style.display='none'" style="background:none;border:none;font-size:24px;cursor:pointer;color:var(--ink3);">✕</button>
    </div>
    <form onsubmit="sendMessage(event)">
      <div style="margin-bottom:14px;">
        <label style="font-size:12px;font-weight:700;color:var(--ink3);text-transform:uppercase;letter-spacing:.8px;display:block;margin-bottom:6px;">To (email address)</label>
        <input type="email" id="msg-to" required placeholder="organiser@email.com" style="width:100%;border:1.5px solid var(--border2);border-radius:10px;padding:11px 14px;font-size:14px;outline:none;box-sizing:border-box;"/>
      </div>
      <div style="margin-bottom:14px;">
        <label style="font-size:12px;font-weight:700;color:var(--ink3);text-transform:uppercase;letter-spacing:.8px;display:block;margin-bottom:6px;">Subject</label>
        <input type="text" id="msg-subject" required placeholder="e.g. Vendor inquiry" style="width:100%;border:1.5px solid var(--border2);border-radius:10px;padding:11px 14px;font-size:14px;outline:none;box-sizing:border-box;"/>
      </div>
      <div style="margin-bottom:20px;">
        <label style="font-size:12px;font-weight:700;color:var(--ink3);text-transform:uppercase;letter-spacing:.8px;display:block;margin-bottom:6px;">Message</label>
        <textarea id="msg-body" required rows="5" placeholder="Write your message..." style="width:100%;border:1.5px solid var(--border2);border-radius:10px;padding:11px 14px;font-size:14px;outline:none;resize:vertical;font-family:inherit;box-sizing:border-box;"></textarea>
      </div>
      <div id="compose-result" style="display:none;margin-bottom:12px;"></div>
      <div style="display:flex;gap:10px;">
        <button type="submit" class="btn btn-primary" style="flex:1;">Send Message →</button>
        <button type="button" onclick="document.getElementById('compose-modal').style.display='none'" class="btn btn-outline">Cancel</button>
      </div>
    </form>
  </div>
</div>

<script>
async function sendMessage(e) {
  e.preventDefault();
  const result = document.getElementById('compose-result');
  result.style.display = 'block';
  result.innerHTML = '<div style="font-size:13px;color:var(--ink3);">Sending...</div>';
  const r = await fetch('/messages/send', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ to_email: document.getElementById('msg-to').value, subject: document.getElementById('msg-subject').value, body: document.getElementById('msg-body').value })
  });
  const d = await r.json();
  if (d.ok) {
    result.innerHTML = '<div style="background:#dcfce7;border-radius:8px;padding:10px;font-size:13px;color:#15803d;">✅ Message sent!</div>';
    setTimeout(() => { document.getElementById('compose-modal').style.display='none'; location.reload(); }, 1200);
  } else {
    result.innerHTML = '<div style="background:#fee2e2;border-radius:8px;padding:10px;font-size:13px;color:#dc2626;">❌ ' + d.msg + '</div>';
  }
}
</script>
<footer><div class="footer-bottom"><span>© ${new Date().getFullYear()} Festmore.com</span></div></footer>
</body></html>`);
});

// ─── THREAD VIEW ─────────────────────
router.get('/thread/:id', requireLogin, (req, res) => {
  const userId = req.session.user.id;
  const user = req.session.user;
  const threadId = req.params.id;

  const messages = db.prepare(`
    SELECT m.*,
           u_from.name as from_name, u_from.email as from_email,
           u_to.name as to_name, u_to.email as to_email
    FROM messages m
    LEFT JOIN users u_from ON m.from_user_id = u_from.id
    LEFT JOIN users u_to ON m.to_user_id = u_to.id
    WHERE (m.thread_id = ? OR m.id::text = ?)
    AND (m.from_user_id = ? OR m.to_user_id = ?)
    ORDER BY m.created_at ASC
  `).all(threadId, threadId, userId, userId);

  if (!messages.length) return res.redirect('/messages');

  try {
    db.prepare('UPDATE messages SET read=TRUE WHERE (thread_id=? OR id::text=?) AND to_user_id=?').run(threadId, threadId, userId);
  } catch(e) {}

  const first = messages[0];
  const otherUser = first.from_user_id === userId
    ? { name: first.to_name, email: first.to_email, id: first.to_user_id }
    : { name: first.from_name, email: first.from_email, id: first.from_user_id };

  res.send(`<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Message — Festmore</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="/css/main.css"/>
</head><body style="background:var(--cream);">
<nav class="main-nav">
  <div class="nav-inner">
    <a href="/" class="logo"><span class="logo-fest">Fest</span><span class="logo-more">more</span><span class="logo-dot"></span></a>
    <div style="flex:1;"></div>
    <div class="nav-right"><a href="/messages" class="btn btn-outline btn-sm">← Inbox</a></div>
  </div>
</nav>
<div class="container" style="padding:44px 0 80px;max-width:760px;">
  <div style="margin-bottom:20px;"><a href="/messages" style="font-size:13px;color:var(--ink3);text-decoration:none;">← Back to Messages</a></div>
  <div style="background:#fff;border:1px solid var(--border);border-radius:20px;overflow:hidden;">
    <div style="padding:20px 28px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:14px;">
      <div style="width:44px;height:44px;border-radius:50%;background:var(--flame);display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;color:#fff;flex-shrink:0;">
        ${(otherUser.name||'?').charAt(0).toUpperCase()}
      </div>
      <div>
        <div style="font-weight:700;font-size:15px;">${otherUser.name || otherUser.email || 'Unknown'}</div>
        <div style="font-size:13px;color:var(--ink3);">${first.subject || 'Conversation'}</div>
      </div>
    </div>
    <div style="padding:24px 28px;display:flex;flex-direction:column;gap:16px;max-height:480px;overflow-y:auto;" id="thread-messages">
      ${messages.map(m => {
        const isMe = m.from_user_id === userId;
        return `
      <div style="display:flex;${isMe?'justify-content:flex-end;':''}">
        <div style="max-width:78%;background:${isMe?'var(--flame)':'var(--ivory)'};color:${isMe?'#fff':'var(--ink)'};border-radius:${isMe?'16px 16px 4px 16px':'16px 16px 16px 4px'};padding:14px 18px;">
          <div style="font-size:14px;line-height:1.6;">${(m.body||'').replace(/\n/g,'<br/>')}</div>
          <div style="font-size:11px;opacity:.6;margin-top:8px;text-align:right;">${new Date(m.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</div>
        </div>
      </div>`;
      }).join('')}
    </div>
    <div style="padding:20px 28px;border-top:1px solid var(--border);background:var(--ivory);">
      <form onsubmit="sendReply(event, '${threadId}', ${otherUser.id||'null'}, '${(otherUser.email||'').replace(/'/g,"\\'")}')">
        <textarea id="reply-body" placeholder="Write a reply..." rows="3" required style="width:100%;border:1.5px solid var(--border2);border-radius:10px;padding:11px 14px;font-size:14px;outline:none;resize:none;font-family:inherit;box-sizing:border-box;margin-bottom:10px;"></textarea>
        <div id="reply-result" style="display:none;margin-bottom:10px;"></div>
        <button type="submit" class="btn btn-primary" style="width:100%;">Send Reply →</button>
      </form>
    </div>
  </div>
</div>
<script>
const msgs = document.getElementById('thread-messages');
if (msgs) msgs.scrollTop = msgs.scrollHeight;
async function sendReply(e, threadId, toUserId, toEmail) {
  e.preventDefault();
  const body = document.getElementById('reply-body').value;
  const result = document.getElementById('reply-result');
  result.style.display = 'block';
  result.innerHTML = '<div style="font-size:13px;color:var(--ink3);">Sending...</div>';
  const r = await fetch('/messages/send', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ to_user_id: toUserId, to_email: toEmail, body, thread_id: threadId })
  });
  const d = await r.json();
  if (d.ok) { result.innerHTML = '<div style="color:#15803d;font-size:13px;">✅ Sent!</div>'; setTimeout(() => location.reload(), 600); }
  else { result.innerHTML = '<div style="color:#dc2626;font-size:13px;">❌ ' + d.msg + '</div>'; }
}
</script>
<footer><div class="footer-bottom"><span>© ${new Date().getFullYear()} Festmore.com</span></div></footer>
</body></html>`);
});

// ─── CONTACT ORGANISER PAGE ───────────
router.get('/event/:event_id', requireLogin, (req, res) => {
  const event = db.prepare('SELECT * FROM events WHERE id=?').get(parseInt(req.params.event_id));
  if (!event) return res.redirect('/events');
  const user = req.session.user;

  res.send(`<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Contact Organiser — Festmore</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="/css/main.css"/>
</head><body style="background:var(--cream);">
<nav class="main-nav">
  <div class="nav-inner">
    <a href="/" class="logo"><span class="logo-fest">Fest</span><span class="logo-more">more</span><span class="logo-dot"></span></a>
    <div style="flex:1;"></div>
    <div class="nav-right"><a href="/events/${event.slug}" class="btn btn-outline btn-sm">← Back to Event</a></div>
  </div>
</nav>
<div class="container" style="padding:44px 0 80px;max-width:640px;">
  <div style="background:#fff;border:1px solid var(--border);border-radius:20px;padding:36px;">
    <div style="display:flex;gap:14px;align-items:center;margin-bottom:28px;padding-bottom:24px;border-bottom:1px solid var(--border);">
      <div style="width:64px;height:64px;border-radius:12px;overflow:hidden;flex-shrink:0;">
        <img src="${event.image_url||'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=200&q=80'}" style="width:100%;height:100%;object-fit:cover;"/>
      </div>
      <div>
        <div style="font-size:12px;font-weight:700;color:var(--flame);text-transform:uppercase;letter-spacing:.8px;margin-bottom:4px;">Contact Organiser</div>
        <div style="font-family:'DM Serif Display',serif;font-size:18px;">${event.title}</div>
        <div style="font-size:13px;color:var(--ink3);">📍 ${event.city} · 📅 ${event.date_display||event.start_date}</div>
      </div>
    </div>
    <h2 style="font-family:'DM Serif Display',serif;font-size:22px;font-weight:400;margin-bottom:20px;">Send a Message</h2>
    <form onsubmit="sendOrgMessage(event)">
      <div style="margin-bottom:16px;">
        <label style="font-size:12px;font-weight:700;color:var(--ink3);text-transform:uppercase;letter-spacing:.8px;display:block;margin-bottom:6px;">Subject</label>
        <input type="text" id="org-subject" required value="Vendor inquiry — ${event.title}" style="width:100%;border:1.5px solid var(--border2);border-radius:10px;padding:11px 14px;font-size:14px;outline:none;box-sizing:border-box;"/>
      </div>
      <div style="margin-bottom:20px;">
        <label style="font-size:12px;font-weight:700;color:var(--ink3);text-transform:uppercase;letter-spacing:.8px;display:block;margin-bottom:6px;">Your Message</label>
        <textarea id="org-body" required rows="6" placeholder="Introduce yourself and your business. Tell the organiser what you offer and why you'd be a great fit..." style="width:100%;border:1.5px solid var(--border2);border-radius:10px;padding:11px 14px;font-size:14px;outline:none;resize:vertical;font-family:inherit;box-sizing:border-box;"></textarea>
      </div>
      <div id="org-result" style="display:none;margin-bottom:14px;"></div>
      <button type="submit" class="btn btn-primary" style="width:100%;padding:14px;font-size:15px;">Send Message →</button>
    </form>
    <p style="font-size:12px;color:var(--ink4);margin-top:14px;text-align:center;">The organiser will receive your message by email and can reply directly.</p>
  </div>
</div>
<script>
async function sendOrgMessage(e) {
  e.preventDefault();
  const result = document.getElementById('org-result');
  result.style.display = 'block';
  result.innerHTML = '<div style="font-size:13px;color:var(--ink3);">Sending...</div>';
  const r = await fetch('/messages/send-to-event', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ event_id: ${event.id}, subject: document.getElementById('org-subject').value, body: document.getElementById('org-body').value })
  });
  const d = await r.json();
  if (d.ok) {
    result.innerHTML = '<div style="background:#dcfce7;border:1px solid #86efac;border-radius:10px;padding:14px;font-size:14px;color:#15803d;font-weight:600;">✅ Message sent! The organiser will be in touch soon.</div>';
    document.querySelector('form').style.display = 'none';
  } else {
    result.innerHTML = '<div style="background:#fee2e2;border:1px solid #fca5a5;border-radius:10px;padding:14px;font-size:13px;color:#dc2626;">❌ ' + d.msg + '</div>';
  }
}
</script>
<footer><div class="footer-bottom"><span>© ${new Date().getFullYear()} Festmore.com</span></div></footer>
</body></html>`);
});

// ─── SEND TO EVENT ORGANISER ──────────
router.post('/send-to-event', requireLogin, async (req, res) => {
  const { event_id, subject, body } = req.body;
  const fromUser = req.session.user;
  if (!body) return res.json({ ok: false, msg: 'Message body is required' });
  const event = db.prepare('SELECT * FROM events WHERE id=?').get(parseInt(event_id));
  if (!event) return res.json({ ok: false, msg: 'Event not found' });

  const organiserEmail = event.organiser_email || 'contact@festmore.com';
  let toUser = db.prepare('SELECT id, name, email FROM users WHERE email=?').get(organiserEmail);
  const toUserId = toUser ? toUser.id : null;
  const tid = 'event_' + event_id + '_' + fromUser.id + '_' + Date.now();

  try {
    db.prepare('INSERT INTO messages (from_user_id, to_user_id, subject, body, thread_id) VALUES (?,?,?,?,?)')
      .run(fromUser.id, toUserId || fromUser.id, subject || '', body, tid);
  } catch(err) {
    return res.json({ ok: false, msg: 'Failed to save message. Please try again.' });
  }

  await sendEmail(organiserEmail, `Message about your event: ${event.title} — Festmore`, emailWrap(`
    <h2 style="font-family:Georgia,serif;font-size:22px;font-weight:400;color:#1a1612;margin:0 0 16px;">New Message About Your Event</h2>
    <p style="font-size:15px;color:#6b5f58;line-height:1.7;"><strong>${fromUser.name}</strong> sent a message about <strong>${event.title}</strong>.</p>
    <div style="background:#f5f0e8;border-radius:12px;padding:20px;margin:16px 0;font-size:15px;color:#1a1612;line-height:1.7;">${body.replace(/\n/g,'<br/>')}</div>
    <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:10px;padding:14px 18px;margin-bottom:20px;">
      <div style="font-size:13px;color:#15803d;font-weight:700;margin-bottom:4px;">Sender:</div>
      <div style="font-size:13px;color:#166534;line-height:1.8;"><strong>Name:</strong> ${fromUser.name}<br/><strong>Email:</strong> ${fromUser.email}</div>
    </div>
    <a href="https://festmore.com/messages" style="display:inline-block;background:#e8470a;color:#fff;padding:14px 28px;border-radius:12px;font-size:14px;font-weight:700;text-decoration:none;">Reply on Festmore →</a>
  `));

  await sendEmail(fromUser.email, `Your message was sent — ${event.title}`, emailWrap(`
    <h2 style="font-family:Georgia,serif;font-size:22px;font-weight:400;color:#1a1612;margin:0 0 16px;">Message Sent ✅</h2>
    <p style="font-size:15px;color:#6b5f58;line-height:1.7;">Your message to the organiser of <strong>${event.title}</strong> was sent successfully.</p>
    <a href="https://festmore.com/messages" style="display:inline-block;background:#e8470a;color:#fff;padding:14px 28px;border-radius:12px;font-size:14px;font-weight:700;text-decoration:none;">View Messages →</a>
  `));

  res.json({ ok: true });
});

// ─── SEND GENERAL MESSAGE ─────────────
router.post('/send', requireLogin, async (req, res) => {
  const { to_email, to_user_id, subject, body, thread_id } = req.body;
  const fromUser = req.session.user;
  if (!body) return res.json({ ok: false, msg: 'Message body is required' });

  let toUser;
  if (to_user_id && parseInt(to_user_id) > 0) toUser = db.prepare('SELECT id, name, email FROM users WHERE id=?').get(parseInt(to_user_id));
  if (!toUser && to_email) toUser = db.prepare('SELECT id, name, email FROM users WHERE email=?').get(to_email);
  if (!toUser) return res.json({ ok: false, msg: 'Recipient not found on Festmore.' });
  if (toUser.id === fromUser.id) return res.json({ ok: false, msg: 'You cannot message yourself.' });

  const tid = thread_id || ('thread_' + fromUser.id + '_' + toUser.id + '_' + Date.now());
  try {
    db.prepare('INSERT INTO messages (from_user_id, to_user_id, subject, body, thread_id) VALUES (?,?,?,?,?)').run(fromUser.id, toUser.id, subject||'', body, tid);
  } catch(err) { return res.json({ ok: false, msg: 'Failed to send. Please try again.' }); }

  await sendEmail(toUser.email, `New message from ${fromUser.name} — Festmore`, emailWrap(`
    <h2 style="font-family:Georgia,serif;font-size:22px;font-weight:400;color:#1a1612;margin:0 0 16px;">New Message from ${fromUser.name}</h2>
    ${subject ? `<div style="font-size:13px;font-weight:700;color:#6b5f58;margin-bottom:10px;">Subject: ${subject}</div>` : ''}
    <div style="background:#f5f0e8;border-radius:12px;padding:20px;font-size:15px;color:#1a1612;line-height:1.7;margin-bottom:20px;">${body.replace(/\n/g,'<br/>')}</div>
    <a href="https://festmore.com/messages" style="display:inline-block;background:#e8470a;color:#fff;padding:14px 28px;border-radius:12px;font-size:14px;font-weight:700;text-decoration:none;">Reply on Festmore →</a>
  `));

  res.json({ ok: true });
});

module.exports = router;