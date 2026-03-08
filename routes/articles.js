// routes/articles.js
const express = require('express');
const router  = express.Router();
const db      = require('../db');

router.get('/', (req, res) => {
  const { category='ALL', country='ALL', page=1 } = req.query;
  const perPage = 12, offset = (parseInt(page)-1)*perPage;
  let where = ["status='published'"], params = [];
  if (category !== 'ALL') { where.push("category=?"); params.push(category); }
  if (country  !== 'ALL') { where.push("country=?");  params.push(country); }
  const total    = db.prepare(`SELECT COUNT(*) as n FROM articles WHERE ${where.join(' AND ')}`).get(...params).n;
  const articles = db.prepare(`SELECT * FROM articles WHERE ${where.join(' AND ')} ORDER BY created_at DESC LIMIT ? OFFSET ?`).all(...params, perPage, offset);
  const totalPages = Math.ceil(total/perPage);
  res.send(renderArticlesList({ articles, total, totalPages, page: parseInt(page), category, country, user: req.session.user }));
});

router.get('/:slug', (req, res) => {
  const article = db.prepare("SELECT * FROM articles WHERE slug=? AND status='published'").get(req.params.slug);
  if (!article) return res.redirect('/articles');
  db.prepare("UPDATE articles SET views=views+1 WHERE id=?").run(article.id);
  const related = db.prepare("SELECT * FROM articles WHERE status='published' AND category=? AND id!=? ORDER BY created_at DESC LIMIT 3").all(article.category, article.id);
  res.send(renderArticleDetail(article, related, req.session.user));
});

module.exports = router;

const IMGS = { festival:'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&q=70', market:'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=70', christmas:'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=600&q=70', concert:'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=70', city:'https://images.unsplash.com/photo-1467803738586-46b7eb7b16a1?w=600&q=70', business:'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=70', kids:'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&q=70', exhibition:'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=70' };

function nav(user) {
  return `<nav class="main-nav"><div class="nav-inner"><a href="/" class="logo"><span class="logo-fest">Fest</span><span class="logo-more">more</span><span class="logo-dot"></span></a><form class="nav-search" action="/events" method="GET"><span>🔍</span><input type="text" name="q" placeholder="Search events…"/></form><div class="nav-right">${user?`<a href="/dashboard" class="btn btn-outline">Dashboard</a>`:`<a href="/auth/login" class="btn btn-outline">Login</a><a href="/events/submit" class="btn btn-primary">+ List Event</a>`}</div><button class="nav-burger" onclick="document.querySelector('.nav-mobile').classList.toggle('open')">☰</button></div><div class="nav-cats-bar"><a href="/events" class="nav-cat">🌍 Events</a><a href="/events?category=festival" class="nav-cat">🎪 Festivals</a><a href="/events?category=christmas" class="nav-cat">🎄 Xmas</a><a href="/articles" class="nav-cat" style="color:var(--flame);border-bottom:2px solid var(--flame);">📰 Articles</a><a href="/vendors" class="nav-cat">🏪 Vendors</a></div><div class="nav-mobile"><a href="/events">Events</a><a href="/articles">Articles</a><a href="/vendors">Vendors</a>${user?`<a href="/dashboard">Dashboard</a>`:`<a href="/auth/login">Login</a>`}</div></nav>`;
}
function foot() {
  return `<footer><div class="footer-bottom" style="border-top:1px solid rgba(255,255,255,0.08);"><span>© 2025 Festmore.com</span><div style="display:flex;gap:16px;"><a href="/" style="color:rgba(255,255,255,0.4);font-size:13px;">Home</a><a href="/events" style="color:rgba(255,255,255,0.4);font-size:13px;">Events</a><a href="/articles" style="color:rgba(255,255,255,0.4);font-size:13px;">Articles</a></div></div></footer>`;
}

function renderArticlesList({ articles, total, totalPages, page, category, country, user }) {
  return `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Festival Guides & Event News ${new Date().getFullYear()} | Festmore</title>
<meta name="description" content="Read the latest festival guides, event news and travel tips. ${total} articles updated daily by AI. Covering events in Germany, Denmark, UK, France and more."/>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;0,900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="/css/main.css"/>
</head><body>
${nav(user)}
<div class="page-hero-small"><div class="container"><h1>📰 Festival Guides & Event News</h1><p>${total} articles — 10 new articles written by AI every single day</p></div></div>
<div class="container" style="padding:40px 0;">
  <div class="ad-placeholder" style="margin-bottom:28px;">📢 Google AdSense</div>
  <div class="articles-grid">
    ${articles.map(a=>`
    <a href="/articles/${a.slug}" class="article-card">
      <div class="article-img"><img src="${a.image_url||IMGS[a.category]||IMGS.festival}" alt="${a.title}" loading="lazy"/></div>
      <div class="article-body">
        <div class="article-cat">${a.category||'Festival Guide'}</div>
        <h3>${a.title}</h3>
        <p>${a.excerpt||''}</p>
        <span class="article-date">${new Date(a.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</span>
      </div>
    </a>`).join('')}
  </div>
  ${totalPages>1?`<div class="pagination">${Array.from({length:Math.min(totalPages,8)},(_,i)=>i+1).map(p=>`<a href="/articles?page=${p}" class="page-btn ${p===page?'active':''}">${p}</a>`).join('')}</div>`:''}
</div>
${foot()}</body></html>`;
}

function renderArticleDetail(a, related, user) {
  const img = a.image_url || IMGS[a.category] || IMGS.festival;
  const tags = JSON.parse(a.tags||'[]');
  return `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>${a.meta_title||a.title+' | Festmore'}</title>
<meta name="description" content="${a.meta_desc||a.excerpt||''}"/>
<meta property="og:title" content="${a.title}"/>
<meta property="og:description" content="${a.excerpt||''}"/>
<meta property="og:image" content="${img}"/>
<link rel="canonical" href="https://festmore.com/articles/${a.slug}"/>
<script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@type":"Article","headline":a.title,"description":a.excerpt||"","image":img,"datePublished":a.created_at,"author":{"@type":"Organization","name":"Festmore Editorial"},"publisher":{"@type":"Organization","name":"Festmore","logo":{"@type":"ImageObject","url":"https://festmore.com/logo.png"}}})}</script>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;0,900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="/css/main.css"/>
</head><body>
${nav(user)}
<div style="max-width:1200px;margin:0 auto;padding:40px 32px;display:grid;grid-template-columns:1fr 320px;gap:48px;align-items:start;">
  <article>
    <div style="margin-bottom:20px;">
      <span style="font-size:12px;font-weight:700;color:var(--flame);text-transform:uppercase;letter-spacing:.8px;">${a.category||'Festival Guide'}</span>
      <span style="color:var(--ink4);font-size:12px;margin-left:12px;">${new Date(a.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}</span>
    </div>
    <h1 style="font-size:clamp(26px,4vw,44px);font-weight:900;margin-bottom:16px;line-height:1.1;">${a.title}</h1>
    ${a.excerpt?`<p style="font-size:18px;color:var(--ink3);margin-bottom:24px;line-height:1.6;font-weight:400;">${a.excerpt}</p>`:''}
    <img src="${img}" alt="${a.title}" style="width:100%;height:400px;object-fit:cover;border-radius:16px;margin-bottom:32px;"/>
    <div class="ad-placeholder" style="margin-bottom:28px;">📢 Google AdSense — In-Article</div>
    <div class="article-content">${a.content}</div>
    ${tags.length?`<div style="margin-top:28px;padding-top:20px;border-top:1px solid var(--border);display:flex;gap:8px;flex-wrap:wrap;">${tags.map(t=>`<a href="/events?q=${encodeURIComponent(t)}" class="tag">${t}</a>`).join('')}</div>`:''}
    <div style="margin-top:32px;background:var(--ivory);border-radius:14px;padding:24px;text-align:center;">
      <p style="font-size:14px;color:var(--ink3);margin-bottom:16px;">Looking for events? Browse our full event listings.</p>
      <a href="/events" class="btn btn-primary">Browse All Events →</a>
    </div>
  </article>
  <aside>
    <div class="ad-placeholder" style="min-height:250px;margin-bottom:20px;">📢 Sidebar Ad</div>
    ${related.length?`<div style="background:#fff;border:1px solid var(--border);border-radius:16px;padding:22px;"><h4 style="font-family:'Playfair Display',serif;font-size:17px;margin-bottom:16px;">More Articles</h4>${related.map(r=>`<a href="/articles/${r.slug}" style="display:flex;gap:12px;margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid var(--border);cursor:pointer;"><img src="${r.image_url||IMGS[r.category]||IMGS.festival}" style="width:64px;height:52px;border-radius:8px;object-fit:cover;flex-shrink:0;" loading="lazy"/><div><div style="font-size:13px;font-weight:600;color:var(--ink);line-height:1.3;margin-bottom:3px;">${r.title}</div><div style="font-size:11px;color:var(--ink4);">${new Date(r.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</div></div></a>`).join('')}</div>`:''}
    <div style="margin-top:20px;background:var(--ink);border-radius:16px;padding:24px;color:#fff;">
      <h4 style="font-family:'Playfair Display',serif;margin-bottom:8px;">📬 Get Weekly Events</h4>
      <p style="font-size:13px;color:rgba(255,255,255,0.6);margin-bottom:14px;">Best festivals in your inbox every week.</p>
      <form onsubmit="event.preventDefault();fetch('/subscribe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:this.email.value})}).then(r=>r.json()).then(d=>alert(d.msg))">
        <input name="email" type="email" placeholder="your@email.com" style="width:100%;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:8px;padding:10px 14px;font-size:13px;color:#fff;outline:none;margin-bottom:8px;"/>
        <button type="submit" class="btn btn-primary" style="width:100%;">Subscribe Free</button>
      </form>
    </div>
  </aside>
</div>
${foot()}</body></html>`;
}
