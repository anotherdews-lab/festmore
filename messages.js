// routes/messages.js — COMPLETE MESSAGING SYSTEM
// ✅ Vendors and organisers can message each other
// ✅ Inbox with unread count
// ✅ Thread view
// ✅ Reply system
// ✅ Mark as read

const express = require('express');
const router  = express.Router();
const db      = require('../db');

function requireLogin(req, res, next) {
  if (!req.session.user) return res.redirect('/auth/login?redirect=' + req.originalUrl);
  next();
}

// ─────────────────────────────────────
// INBOX — GET /messages
// ─────────────────────────────────────
router.get('/', requireLogin, (req, res) => {
  const userId = req.session.user.id;
  const user = req.session.user;

  // Get all messages involving this user, grouped by thread
  const messages = db.prepare(`
    SELECT m.*,
           u_from.name as from_name, u_from.email as from_email,
           u_to.name as to_name, u_to.email as to_email
    FROM messages m
    LEFT JOIN users u_from ON m.from_user_id = u_from.id
    LEFT JOIN users u_to ON m.to_user_id = u_to.id
    WHERE m.from_user_id = ? OR m.to_user_id = ?
    ORDER BY m.created_at DESC
    LIMIT 100
  `).all(userId, userId);

  // Group by thread
  const threads = {};
  messages.forEach(m => {
    const tid = m.thread_id || 'msg_' + m.id;
    if (!threads[tid]) {
      threads[tid] = { messages: [], unread: 0, latest: m };
    }
    threads[tid].messages.push(m);
    if (!m.read && m.to_user_id === userId) threads[tid].unread++;
  });

  const threadList = Object.values(threads).sort((a, b) =>
    new Date(b.latest.created_at) - new Date(a.latest.created_at)
  );

  const unreadTotal = threadList.reduce((s, t) => s + t.unread, 0);

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
    <div class="nav-right"><span style="font-size:13px;color:var(--ink3);">${user.name}</span><a href="/auth/logout" class="btn btn-ghost btn-sm">Logout</a></div>
  </div>
  <div class="nav-cats-bar">
    <a href="/dashboard" class="nav-cat">📊 Dashboard</a>
    <a href="/applications/my" class="nav-cat">📋 Applications</a>
    <a href="/messages" class="nav-cat" style="color:var(--flame);border-bottom:2px solid var(--flame);">💬 Messages ${unreadTotal > 0 ? `<span style="background:var(--flame);color:#fff;border-radius:99px;padding:2px 7px;font-size:11px;font-weight:700;">${unreadTotal}</span>` : ''}</a>
    <a href="/events" class="nav-cat">🌍 Browse Events</a>
  </div>
</nav>

<div class="container" style="padding:44px 0 80px;max-width:900px;">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:32px;flex-wrap:wrap;gap:16px;">
    <div>
      <h1 style="font-family:'DM Serif Display',serif;font-size:32px;font-weight:400;margin-bottom:6px;">
        Messages ${unreadTotal > 0 ? `<span style="background:var(--flame);color:#fff;border-radius:99px;padding:4px 14px;font-size:16px;font-weight:700;">${unreadTotal} new</span>` : ''}
      </h1>
      <p style="color:var(--ink3);">Your conversations with event organisers and vendors.</p>
    </div>
    <button onclick="document.getElementById('compose-modal').style.display='flex'" class="btn btn-primary">+ New Message</button>
  </div>

  ${threadList.length === 0 ? `
  <div style="background:#fff;border:1px solid var(--border);border-radius:20px;padding:64px;text-align:center;">
    <div style="font-size:48px;margin-bottom:16px;">💬</div>
    <h2 style="font-family:'DM Serif Display',serif;font-size:24px;font-weight:400;margin-bottom:8px;">No messages yet</h2>
    <p style="color:var(--ink3);margin-bottom:24px;">Start a conversation with an event organiser or vendor.</p>
    <button onclick="document.getElementById('compose-modal').style.display='flex'" class="btn btn-primary">Send First Message</button>
  </div>` : `
  <div style="background:#fff;border:1px solid var(--border);border-radius:20px;overflow:hidden;">
    ${threadList.map((thread, i) => {
      const m = thread.latest;
      const isFromMe = m.from_user_id === userId;
      const otherName = isFromMe ? m.to_name : m.from_name;
      const otherEmail = isFromMe ? m.to_email : m.from_email;
      const hasUnread = thread.unread > 0;
      return `
    <a href="/messages/thread/${m.thread_id || m.id}" style="display:flex;gap:16px;padding:20px 24px;border-bottom:${i < threadList.length-1 ? '1px solid var(--border)' : 'none'};text-decoration:none;background:${hasUnread ? 'rgba(232,71,10,.03)' : '#fff'};transition:background .2s;" onmouseover="this.style.background='var(--ivory)'" onmouseout="this.style.background='${hasUnread ? 'rgba(232,71,10,.03)' : '#fff'}'">
      <div style="width:44px;height:44px;border-radius:50%;background:${hasUnread ? 'var(--flame)' : 'var(--ivory)'};display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;color:${hasUnread ? '#fff' : 'var(--ink3)'};">
        ${otherName ? otherName.charAt(0).toUpperCase() : '?'}
      </div>
      <div style="flex:1;min-width:0;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
          <div style="font-weight:${hasUnread ? '700' : '600'};font-size:14px;color:var(--ink);">${otherName || otherEmail}</div>
          <div style="font-size:12px;color:var(--ink4);">${new Date(m.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</div>
        </div>
        <div style="font-size:13px;font-weight:${hasUnread ? '600' : '400'};color:${hasUnread ? 'var(--ink)' : 'var(--ink3)'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
          ${m.subject || m.body.substring(0, 60) + '...'}
        </div>
      </div>
      ${hasUnread ? `<div style="width:8px;height:8px;border-radius:50%;background:var(--flame);flex-shrink:0;margin-top:4px;"></div>` : ''}
    </a>`;
    }).join('')}
  </div>`}
</div>

<!-- COMPOSE MODAL -->
<div id="compose-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:1000;align-items:center;justify-content:center;padding:20px;">
  <div style="background:#fff;border-radius:20px;padding:32px;max-width:560px;width:100%;max-height:90vh;overflow-y:auto;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
      <h2 style="font-family:'DM Serif Display',serif;font-size:22px;font-weight:400;margin:0;">New Message</h2>
      <button onclick="document.getElementById('compose-modal').style.display='none'" style="background:none;border:none;font-size:24px;cursor:pointer;color:var(--ink3);">✕</button>
    </div>
    <form onsubmit="sendMessage(event)">
      <div style="margin-bottom:16px;">
        <label style="font-size:12px;font-weight:700;color:var(--ink3);text-transform:uppercase;letter-spacing:.8px;display:block;margin-bottom:6px;">To (email address)</label>
        <input type="email" id="msg-to" required placeholder="recipient@email.com" style="width:100%;border:1.5px solid var(--border2);border-radius:10px;padding:11px 14px;font-size:14px;outline:none;box-sizing:border-box;"/>
      </div>
      <div style="margin-bottom:16px;">
        <label style="font-size:12px;font-weight:700;color:var(--ink3);text-transform:uppercase;letter-spacing:.8px;display:block;margin-bottom:6px;">Subject</label>
        <input type="text" id="msg-subject" required placeholder="e.g. Vendor inquiry for your festival" style="width:100%;border:1.5px solid var(--border2);border-radius:10px;padding:11px 14px;font-size:14px;outline:none;box-sizing:border-box;"/>
      </div>
      <div style="margin-bottom:20px;">
        <label style="font-size:12px;font-weight:700;color:var(--ink3);text-transform:uppercase;letter-spacing:.8px;display:block;margin-bottom:6px;">Message</label>
        <textarea id="msg-body" required rows="5" placeholder="Write your message..." style="width:100%;border:1.5px solid var(--border2);border-radius:10px;padding:11px 14px;font-size:14px;outline:none;resize:vertical;font-family:inherit;box-sizing:border-box;"></textarea>
      </div>
      <div id="compose-result" style="margin-bottom:12px;display:none;"></div>
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
  result.innerHTML = '<div style="color:var(--ink3);font-size:13px;">Sending...</div>';
  const r = await fetch('/messages/send', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({
      to_email: document.getElementById('msg-to').value,
      subject: document.getElementById('msg-subject').value,
      body: document.getElementById('msg-body').value,
    })
  });
  const d = await r.json();
  if (d.ok) {
    result.innerHTML = '<div style="background:#dcfce7;border-radius:8px;padding:10px;font-size:13px;color:#15803d;">✅ Message sent!</div>';
    setTimeout(() => { document.getElementById('compose-modal').style.display='none'; location.reload(); }, 1500);
  } else {
    result.innerHTML = '<div style="background:#fee2e2;border-radius:8px;padding:10px;font-size:13px;color:#dc2626;">❌ ' + d.msg + '</div>';
  }
}
</script>
<footer><div class="footer-bottom"><span>© ${new Date().getFullYear()} Festmore.com</span></div></footer>
</body></html>`);
});

// ─────────────────────────────────────
// THREAD VIEW — GET /messages/thread/:id
// ─────────────────────────────────────
router.get('/thread/:id', requireLogin, (req, res) => {
  const userId = req.session.user.id;
  const user = req.session.user;
  const threadId = req.params.id;

  let messages;
  // Try as thread_id first, then as message id
  try {
    messages = db.prepare(`
      SELECT m.*,
             u_from.name as from_name, u_from.email as from_email,
             u_to.name as to_name, u_to.email as to_email
      FROM messages m
      LEFT JOIN users u_from ON m.from_user_id = u_from.id
      LEFT JOIN users u_to ON m.to_user_id = u_to.id
      WHERE (m.thread_id = ? OR m.id = ?)
      AND (m.from_user_id = ? OR m.to_user_id = ?)
      ORDER BY m.created_at ASC
    `).all(threadId, parseInt(threadId)||0, userId, userId);
  } catch(e) {
    messages = [];
  }

  if (!messages.length) return res.redirect('/messages');

  // Mark as read
  try {
    db.prepare('UPDATE messages SET read=TRUE WHERE (thread_id=? OR id=?) AND to_user_id=?')
      .run(threadId, parseInt(threadId)||0, userId);
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
  <div style="margin-bottom:24px;">
    <a href="/messages" style="font-size:13px;color:var(--ink3);">← Back to Messages</a>
  </div>

  <div style="background:#fff;border:1px solid var(--border);border-radius:20px;overflow:hidden;">
    <!-- Thread Header -->
    <div style="padding:24px 28px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:16px;">
      <div style="width:44px;height:44px;border-radius:50%;background:var(--ivory);display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;color:var(--ink2);">
        ${otherUser.name ? otherUser.name.charAt(0).toUpperCase() : '?'}
      </div>
      <div>
        <div style="font-weight:700;font-size:15px;">${otherUser.name || otherUser.email}</div>
        <div style="font-size:13px;color:var(--ink3);">${otherUser.email}</div>
      </div>
    </div>

    <!-- Messages -->
    <div style="padding:24px 28px;display:flex;flex-direction:column;gap:20px;max-height:500px;overflow-y:auto;" id="thread-messages">
      ${messages.map(m => {
        const isMe = m.from_user_id === userId;
        return `
      <div style="display:flex;${isMe ? 'justify-content:flex-end;' : ''}">
        <div style="max-width:75%;background:${isMe ? 'var(--flame)' : 'var(--ivory)'};color:${isMe ? '#fff' : 'var(--ink)'};border-radius:${isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px'};padding:14px 18px;">
          ${m.subject ? `<div style="font-size:12px;font-weight:700;opacity:.7;margin-bottom:4px;text-transform:uppercase;letter-spacing:.5px;">${m.subject}</div>` : ''}
          <div style="font-size:14px;line-height:1.6;">${m.body.replace(/\n/g,'<br/>')}</div>
          <div style="font-size:11px;opacity:.6;margin-top:8px;">${new Date(m.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}</div>
        </div>
      </div>`;
      }).join('')}
    </div>

    <!-- Reply Box -->
    <div style="padding:20px 28px;border-top:1px solid var(--border);background:var(--ivory);">
      <form onsubmit="sendReply(event, '${threadId}', ${otherUser.id})">
        <textarea id="reply-body" placeholder="Write a reply..." rows="3" required style="width:100%;border:1.5px solid var(--border2);border-radius:10px;padding:11px 14px;font-size:14px;outline:none;resize:none;font-family:inherit;box-sizing:border-box;margin-bottom:10px;"></textarea>
        <div id="reply-result" style="display:none;margin-bottom:10px;"></div>
        <button type="submit" class="btn btn-primary" style="width:100%;">Send Reply →</button>
      </form>
    </div>
  </div>
</div>

<script>
// Scroll to bottom of messages
const msgs = document.getElementById('thread-messages');
msgs.scrollTop = msgs.scrollHeight;

async function sendReply(e, threadId, toUserId) {
  e.preventDefault();
  const body = document.getElementById('reply-body').value;
  const result = document.getElementById('reply-result');
  result.style.display = 'block';
  result.innerHTML = '<div style="font-size:13px;color:var(--ink3);">Sending...</div>';
  const r = await fetch('/messages/send', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ to_user_id: toUserId, body, thread_id: threadId })
  });
  const d = await r.json();
  if (d.ok) {
    result.innerHTML = '<div style="color:#15803d;font-size:13px;">✅ Sent!</div>';
    setTimeout(() => location.reload(), 800);
  } else {
    result.innerHTML = '<div style="color:#dc2626;font-size:13px;">❌ ' + d.msg + '</div>';
  }
}
</script>
<footer><div class="footer-bottom"><span>© ${new Date().getFullYear()} Festmore.com</span></div></footer>
</body></html>`);
});

// ─────────────────────────────────────
// SEND MESSAGE — POST /messages/send
// ─────────────────────────────────────
router.post('/send', requireLogin, async (req, res) => {
  const { to_email, to_user_id, subject, body, thread_id } = req.body;
  const fromUser = req.session.user;

  if (!body) return res.json({ ok: false, msg: 'Message body is required' });

  let toUser;
  if (to_user_id) {
    toUser = db.prepare('SELECT id, name, email FROM users WHERE id=?').get(parseInt(to_user_id));
  } else if (to_email) {
    toUser = db.prepare('SELECT id, name, email FROM users WHERE email=?').get(to_email);
  }

  if (!toUser) return res.json({ ok: false, msg: 'Recipient not found. Make sure the email address is registered on Festmore.' });
  if (toUser.id === fromUser.id) return res.json({ ok: false, msg: 'You cannot message yourself.' });

  const tid = thread_id || ('thread_' + fromUser.id + '_' + toUser.id + '_' + Date.now());

  try {
    db.prepare('INSERT INTO messages (from_user_id, to_user_id, subject, body, thread_id) VALUES (?,?,?,?,?)')
      .run(fromUser.id, toUser.id, subject||'', body, tid);
  } catch(err) {
    return res.json({ ok: false, msg: 'Failed to send message. Please try again.' });
  }

  // Send email notification
  try {
    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'Festmore <contact@festmore.com>',
      to: toUser.email,
      subject: `New message from ${fromUser.name} — Festmore`,
      html: `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head>
<body style="font-family:'Helvetica Neue',Arial,sans-serif;background:#f5f0e8;margin:0;padding:40px 20px;">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:20px;overflow:hidden;">
  <div style="background:#0a1a0f;padding:28px 36px;">
    <span style="font-size:20px;font-weight:800;"><span style="color:#fff;">Fest</span><span style="color:#e8470a;">more</span></span>
  </div>
  <div style="padding:36px;">
    <h2 style="font-family:Georgia,serif;font-size:20px;font-weight:400;color:#1a1612;margin:0 0 16px;">You have a new message from ${fromUser.name}</h2>
    ${subject ? `<div style="font-size:13px;font-weight:700;color:var(--ink3);margin-bottom:8px;">Subject: ${subject}</div>` : ''}
    <div style="background:#f5f0e8;border-radius:12px;padding:20px;font-size:15px;color:#1a1612;line-height:1.7;margin-bottom:20px;">${body.replace(/\n/g,'<br/>')}</div>
    <a href="https://festmore.com/messages" style="display:inline-block;background:#e8470a;color:#fff;padding:14px 28px;border-radius:12px;font-size:14px;font-weight:700;text-decoration:none;">Reply on Festmore →</a>
  </div>
  <div style="background:#f1ede8;padding:20px;text-align:center;font-size:12px;color:#9b8f88;">© ${new Date().getFullYear()} Festmore.com</div>
</div></body></html>`
    });
  } catch(e) { console.error('Message email error:', e.message); }

  res.json({ ok: true, msg: 'Message sent!' });
});

module.exports = router;
