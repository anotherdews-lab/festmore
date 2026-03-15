// routes/articles.js — POLISHED VERSION
const express = require('express');
const router  = express.Router();
const db      = require('../db');

router.get('/', (req, res) => {
  const { category='ALL', country='ALL', page=1 } = req.query;
  const perPage = 24, offset = (parseInt(page)-1)*perPage;
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

const IMGS = {
  festival:   'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&q=75',
  market:     'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=75',
  christmas:  'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=600&q=75',
  concert:    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=75',
  city:       'https://images.unsplash.com/photo-1467803738586-46b7eb7b16a1?w=600&q=75',
  business:   'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=75',
  kids:       'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&q=75',
  exhibition: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=75',
};

const CAT_LABELS = {
  festival:'Festivals', market:'Markets', christmas:'Christmas Markets',
  concert:'Concerts', city:'City Events', business:'Business', kids:'Kids Events', exhibition:'Exhibitions'
};

function nav(user) {
  return `<nav class="main-nav">
  <div class="nav-inner">
    <a href="/" class="logo"><span class="logo-fest">Fest</span><span class="logo-more">more</span><span class="logo-dot"></span></a>
    <form class="nav-search" action="/events" method="GET">
      <span style="color:var(--ink4);font-size:15px;">🔍</span>
      <input type="text" name="q" placeholder="Search events…"/>
    </form>
    <div class="nav-right">
      ${user
        ? `<a href="/dashboard" class="btn btn-outline btn-sm">Dashboard</a><a href="/auth/logout" class="btn btn-ghost btn-sm">Logout</a>`
        : `<a href="/auth/login" class="btn btn-outline btn-sm">Login</a><a href="/events/submit" class="btn btn-primary btn-sm">+ List Event</a>`
      }
    </div>
    <button class="nav-burger" onclick="document.querySelector('.nav-mobile').classList.toggle('open')">☰</button>
  </div>
  <div class="nav-cats-bar">
    <a href="/events" class="nav-cat">🌍 All Events</a>
    <a href="/events?category=festival" class="nav-cat">🎪 Festivals</a>
    <a href="/events?category=market" class="nav-cat">🛍️ Markets</a>
    <a href="/events?category=christmas" class="nav-cat">🎄 Xmas Markets</a>
    <a href="/events?category=concert" class="nav-cat">🎵 Concerts</a>
    <a href="/articles" class="nav-cat" style="color:var(--flame);border-bottom:2px solid var(--flame);">📰 Articles</a>
    <a href="/vendors" class="nav-cat">🏪 Vendors</a>
    <a href="/about" class="nav-cat">ℹ️ About</a>
    <a href="/contact" class="nav-cat">✉️ Contact</a>
  </div>
  <div class="nav-mobile">
    <a href="/events">🌍 All Events</a>
    <a href="/articles">📰 Articles</a>
    <a href="/vendors">🏪 Vendors</a>
    <a href="/events/submit">+ List Your Event</a>
    ${user ? `<a href="/dashboard">Dashboard</a><a href="/auth/logout">Logout</a>` : `<a href="/auth/login">Login</a>`}
  </div>
</nav>`;
}

function foot() {
  return `<footer>
  <div class="footer-bottom">
    <span>© ${new Date().getFullYear()} Festmore.com — All rights reserved</span>
    <div style="display:flex;gap:20px;flex-wrap:wrap;">
      <a href="/" style="color:rgba(255,255,255,.35);font-size:13px;">Home</a>
      <a href="/events" style="color:rgba(255,255,255,.35);font-size:13px;">Events</a>
      <a href="/articles" style="color:rgba(255,255,255,.35);font-size:13px;">Articles</a>
      <a href="/about" style="color:rgba(255,255,255,.35);font-size:13px;">About</a>
      <a href="/contact" style="color:rgba(255,255,255,.35);font-size:13px;">Contact</a>
      <a href="/privacy" style="color:rgba(255,255,255,.35);font-size:13px;">Privacy</a>
    </div>
  </div>
</footer>`;
}

// ─────────────────────────────────────
// ARTICLES LIST PAGE
// ─────────────────────────────────────
function renderArticlesList({ articles, total, totalPages, page, category, country, user }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Festival Guides & Event News ${new Date().getFullYear()} | Festmore</title>
<meta name="description" content="Read the latest festival guides, event news and travel tips. ${total} articles covering festivals and events in Germany, Denmark, UK, France and more."/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/>
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2486135003689222" crossorigin="anonymous"></script>
<link rel="stylesheet" href="/css/main.css"/>
</head>
<body>

${nav(user)}

<div class="page-hero-small">
  <div class="container">
    <h1>📰 Festival Guides & Event News</h1>
    <p>${total} articles covering events worldwide — updated daily</p>
  </div>
</div>

<div class="container" style="padding:40px 0;">

  <!-- CATEGORY FILTER -->
  <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:32px;">
    <a href="/articles" class="btn ${category==='ALL'?'btn-primary':'btn-outline'} btn-sm">All</a>
    ${Object.entries(CAT_LABELS).map(([k,v]) =>
      `<a href="/articles?category=${k}" class="btn ${category===k?'btn-primary':'btn-outline'} btn-sm">${v}</a>`
    ).join('')}
  </div>

  <!-- AD -->
  <div style="margin-bottom:32px;"><div class="ad-label-small">Advertisement</div>
  <ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-2486135003689222" data-ad-format="auto" data-full-width-responsive="true"></ins>
  <script>(adsbygoogle = window.adsbygoogle || []).push({});</script></div>

  <!-- ARTICLES GRID -->
  ${articles.length === 0 ? `
  <div class="empty-state">
    <div style="font-size:48px;margin-bottom:16px;">📰</div>
    <h2>No articles yet</h2>
    <p>Check back soon — new articles are added daily.</p>
  </div>` : `
  <div class="articles-grid">
    ${articles.map(a => `
    <a href="/articles/${a.slug}" class="article-card">
      <div class="article-img">
        <img src="${a.image_url || IMGS[a.category] || IMGS.festival}" alt="${a.title}" loading="lazy"/>
      </div>
      <div class="article-body">
        <div class="article-cat">${CAT_LABELS[a.category] || 'Festival Guide'}</div>
        <h3>${a.title}</h3>
        <p>${a.excerpt || ''}</p>
        <span class="article-date">${new Date(a.created_at).toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric'})}</span>
      </div>
    </a>`).join('')}
  </div>`}

  <!-- PAGINATION -->
  ${totalPages > 1 ? `
  <div class="pagination">
    ${page > 1 ? `<a href="/articles?category=${category}&page=${page-1}" class="page-btn">‹ Prev</a>` : ''}
    ${Array.from({length: Math.min(totalPages, 8)}, (_, i) => i+1).map(p =>
      `<a href="/articles?category=${category}&page=${p}" class="page-btn ${p===page?'active':''}">${p}</a>`
    ).join('')}
    ${page < totalPages ? `<a href="/articles?category=${category}&page=${page+1}" class="page-btn">Next ›</a>` : ''}
  </div>` : ''}

  <!-- AD BOTTOM -->
  <div style="margin-top:48px;"><div class="ad-label-small">Advertisement</div>
  <ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-2486135003689222" data-ad-format="auto" data-full-width-responsive="true"></ins>
  <script>(adsbygoogle = window.adsbygoogle || []).push({});</script></div>

</div>

${foot()}
</body>
</html>`;
}

// ─────────────────────────────────────
// ARTICLE DETAIL PAGE
// ─────────────────────────────────────
function renderArticleDetail(a, related, user) {
  const img  = a.image_url || IMGS[a.category] || IMGS.festival;
  const tags = JSON.parse(a.tags || '[]');
  const dateStr = new Date(a.created_at).toLocaleDateString('en-GB', {day:'numeric', month:'long', year:'numeric'});

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>${a.meta_title || a.title + ' | Festmore'}</title>
<meta name="description" content="${a.meta_desc || a.excerpt || ''}"/>
<meta property="og:title" content="${a.title}"/>
<meta property="og:description" content="${a.excerpt || ''}"/>
<meta property="og:image" content="${img}"/>
<link rel="canonical" href="https://festmore.com/articles/${a.slug}"/>
<script type="application/ld+json">${JSON.stringify({
  "@context":"https://schema.org",
  "@type":"Article",
  "headline": a.title,
  "description": a.excerpt || "",
  "image": img,
  "datePublished": a.created_at,
  "author": {"@type":"Organization","name":"Festmore Editorial"},
  "publisher": {"@type":"Organization","name":"Festmore","logo":{"@type":"ImageObject","url":"https://festmore.com/logo.png"}}
})}</script>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/>
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2486135003689222" crossorigin="anonymous"></script>
<link rel="stylesheet" href="/css/main.css"/>
</head>
<body>

${nav(user)}

<div style="max-width:1200px;margin:0 auto;padding:44px 40px 80px;display:grid;grid-template-columns:1fr 320px;gap:56px;align-items:start;">

  <!-- MAIN ARTICLE -->
  <article>
    <!-- BREADCRUMB -->
    <div style="font-size:13px;color:var(--ink4);margin-bottom:20px;">
      <a href="/" style="color:var(--ink4);">Home</a> &rsaquo;
      <a href="/articles" style="color:var(--ink4);">Articles</a> &rsaquo;
      <span style="color:var(--ink3);">${CAT_LABELS[a.category] || 'Guide'}</span>
    </div>

    <!-- META -->
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px;flex-wrap:wrap;">
      <span style="font-size:11px;font-weight:700;color:var(--flame);text-transform:uppercase;letter-spacing:1px;background:rgba(232,71,10,.08);padding:4px 12px;border-radius:99px;">${CAT_LABELS[a.category] || 'Festival Guide'}</span>
      <span style="color:var(--ink4);font-size:13px;">📅 ${dateStr}</span>
      <span style="color:var(--ink4);font-size:13px;">✍️ Festmore Editorial</span>
    </div>

    <!-- TITLE -->
    <h1 style="font-family:'DM Serif Display',serif;font-size:clamp(26px,4vw,46px);font-weight:400;margin-bottom:16px;line-height:1.1;">${a.title}</h1>

    <!-- EXCERPT -->
    ${a.excerpt ? `<p style="font-size:18px;color:var(--ink3);margin-bottom:28px;line-height:1.7;font-weight:400;border-left:3px solid var(--flame);padding-left:18px;">${a.excerpt}</p>` : ''}

    <!-- HERO IMAGE -->
    <img src="${img}" alt="${a.title}" style="width:100%;height:420px;object-fit:cover;border-radius:20px;margin-bottom:36px;"/>

    <!-- AD IN ARTICLE -->
    <div style="margin-bottom:32px;"><div class="ad-label-small">Advertisement</div>
    <ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-2486135003689222" data-ad-format="auto" data-full-width-responsive="true"></ins>
    <script>(adsbygoogle = window.adsbygoogle || []).push({});</script></div>

    <!-- CONTENT -->
    <div class="article-content">${a.content}</div>

    <!-- TAGS -->
    ${tags.length ? `
    <div style="margin-top:32px;padding-top:22px;border-top:1px solid var(--border);display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
      <span style="font-size:12px;font-weight:700;color:var(--ink4);text-transform:uppercase;letter-spacing:.8px;">Tags:</span>
      ${tags.map(t => `<a href="/events?q=${encodeURIComponent(t)}" class="tag">${t}</a>`).join('')}
    </div>` : ''}

    <!-- CTA BOX -->
    <div style="margin-top:40px;background:var(--ink);border-radius:20px;padding:32px 36px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:20px;">
      <div>
        <h3 style="font-family:'DM Serif Display',serif;font-size:22px;font-weight:400;color:#fff;margin-bottom:6px;">Looking for events?</h3>
        <p style="color:rgba(255,255,255,.5);font-size:14px;">Browse thousands of festivals, markets and events worldwide.</p>
      </div>
      <a href="/events" class="btn btn-primary btn-lg">Browse All Events →</a>
    </div>
  </article>

  <!-- SIDEBAR -->
  <aside style="position:sticky;top:90px;">

    <!-- AD -->
    <div style="margin-bottom:24px;"><div class="ad-label-small">Advertisement</div>
    <ins class="adsbygoogle" style="display:block;min-height:250px;" data-ad-client="ca-pub-2486135003689222" data-ad-format="auto" data-full-width-responsive="true"></ins>
    <script>(adsbygoogle = window.adsbygoogle || []).push({});</script></div>

    <!-- RELATED ARTICLES -->
    ${related.length ? `
    <div style="background:#fff;border:1px solid var(--border);border-radius:20px;padding:24px;margin-bottom:20px;">
      <h4 style="font-family:'DM Serif Display',serif;font-size:18px;font-weight:400;margin-bottom:18px;">More Articles</h4>
      ${related.map(r => `
      <a href="/articles/${r.slug}" style="display:flex;gap:12px;margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid var(--border);">
        <img src="${r.image_url || IMGS[r.category] || IMGS.festival}" style="width:68px;height:56px;border-radius:10px;object-fit:cover;flex-shrink:0;" loading="lazy"/>
        <div>
          <div style="font-size:13px;font-weight:600;color:var(--ink);line-height:1.3;margin-bottom:4px;">${r.title}</div>
          <div style="font-size:11px;color:var(--ink4);">${new Date(r.created_at).toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric'})}</div>
        </div>
      </a>`).join('')}
    </div>` : ''}

    <!-- NEWSLETTER -->
    <div style="background:var(--ink);border-radius:20px;padding:26px;color:#fff;">
      <h4 style="font-family:'DM Serif Display',serif;font-size:18px;font-weight:400;margin-bottom:8px;">📬 Weekly Events</h4>
      <p style="font-size:13px;color:rgba(255,255,255,.5);margin-bottom:16px;">Get the best festivals delivered to your inbox every week.</p>
      <form onsubmit="event.preventDefault();fetch('/subscribe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:this.email.value})}).then(r=>r.json()).then(d=>{if(d.ok){this.innerHTML='<p style=color:#4a7c59;font-weight:600;>✅ Subscribed!</p>'}else{alert(d.msg)}})">
        <input name="email" type="email" placeholder="your@email.com" required style="width:100%;background:rgba(255,255,255,.08);border:1.5px solid rgba(255,255,255,.14);border-radius:9px;padding:11px 14px;font-size:13px;color:#fff;outline:none;margin-bottom:10px;"/>
        <button type="submit" class="btn btn-primary" style="width:100%;">Subscribe Free →</button>
      </form>
    </div>

    <!-- LIST EVENT CTA -->
    <div style="margin-top:16px;background:var(--flame);border-radius:20px;padding:24px;color:#fff;text-align:center;">
      <div style="font-size:28px;margin-bottom:10px;">🎪</div>
      <h4 style="font-family:'DM Serif Display',serif;font-size:17px;font-weight:400;margin-bottom:6px;">Got an Event?</h4>
      <p style="font-size:12.5px;color:rgba(255,255,255,.75);margin-bottom:16px;">List your festival or market and reach thousands of visitors.</p>
      <a href="/events/submit" style="display:block;background:#fff;color:var(--flame);padding:10px 20px;border-radius:99px;font-size:13px;font-weight:700;">List Event — €79/yr →</a>
    </div>

  </aside>
</div>

${foot()}
</body>
</html>`;
}