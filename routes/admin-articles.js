// routes/admin-articles.js
// Admin article management — create, edit, delete articles
// GET  /admin/articles           — list all articles
// GET  /admin/articles/new       — new article form
// POST /admin/articles/new       — save new article
// GET  /admin/articles/:id/edit  — edit article form
// POST /admin/articles/:id/edit  — save edits
// POST /admin/articles/:id/delete — delete article

const express = require('express');
const router  = express.Router();
const db      = require('../db');

function requireAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/auth/login');
  next();
}

function slugify(text) {
  return text.toLowerCase()
    .replace(/[àáâãäå]/g,'a').replace(/[èéêë]/g,'e').replace(/[ìíîï]/g,'i')
    .replace(/[òóôõö]/g,'o').replace(/[ùúûü]/g,'u').replace(/[ñ]/g,'n')
    .replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
}

const CATEGORIES = ['festival','market','guide','vendor','christmas','news','travel','food','music','art'];

const IS = `width:100%;background:#fff;border:1.5px solid var(--border2);border-radius:10px;padding:12px 14px;font-size:14px;outline:none;box-sizing:border-box;font-family:inherit;`;
const LS = `font-size:12px;font-weight:700;color:var(--ink3);text-transform:uppercase;letter-spacing:.8px;display:block;margin-bottom:6px;`;

// ─── LIST ALL ARTICLES ────────────────────────────────────────────
router.get('/', requireAdmin, (req, res) => {
  const articles = db.prepare(`SELECT id,title,slug,category,status,created_at FROM articles ORDER BY created_at DESC`).all();
  const published = articles.filter(a => a.status === 'published').length;
  const drafts = articles.filter(a => a.status !== 'published').length;

  res.send(`<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Articles — Festmore Admin</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="/css/main.css"/>
</head><body style="background:var(--cream);">
<nav class="main-nav"><div class="nav-inner">
  <a href="/" class="logo"><span class="logo-fest">Fest</span><span class="logo-more">more</span><span class="logo-dot"></span></a>
  <div style="flex:1;"></div>
  <div class="nav-right">
    <a href="/dashboard" class="btn btn-outline btn-sm">← Dashboard</a>
    <a href="/admin/articles/new" class="btn btn-primary btn-sm">+ New Article</a>
  </div>
</div></nav>

<div class="container" style="padding:40px 0;max-width:1000px;">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;flex-wrap:wrap;gap:16px;">
    <div>
      <h1 style="font-family:'DM Serif Display',serif;font-size:32px;font-weight:400;margin-bottom:4px;">📰 Articles</h1>
      <p style="color:var(--ink3);font-size:14px;">${published} published · ${drafts} drafts · ${articles.length} total</p>
    </div>
    <a href="/admin/articles/new" class="btn btn-primary">+ Write New Article →</a>
  </div>

  ${req.query.success ? `<div style="background:#dcfce7;border:1px solid #86efac;border-radius:12px;padding:14px 18px;margin-bottom:20px;color:#15803d;font-weight:600;">✅ ${req.query.success}</div>` : ''}

  <div style="background:#fff;border:1px solid var(--border);border-radius:20px;overflow:hidden;">
    <table style="width:100%;border-collapse:collapse;">
      <thead>
        <tr style="background:var(--ivory);border-bottom:2px solid var(--border);">
          <th style="text-align:left;padding:14px 20px;font-size:12px;font-weight:700;color:var(--ink4);text-transform:uppercase;">Title</th>
          <th style="text-align:left;padding:14px 12px;font-size:12px;font-weight:700;color:var(--ink4);text-transform:uppercase;">Category</th>
          <th style="text-align:left;padding:14px 12px;font-size:12px;font-weight:700;color:var(--ink4);text-transform:uppercase;">Status</th>
          <th style="text-align:left;padding:14px 12px;font-size:12px;font-weight:700;color:var(--ink4);text-transform:uppercase;">Date</th>
          <th style="padding:14px 12px;"></th>
        </tr>
      </thead>
      <tbody>
        ${articles.map(a => `
        <tr style="border-bottom:1px solid var(--border);" onmouseover="this.style.background='var(--ivory)'" onmouseout="this.style.background=''">
          <td style="padding:14px 20px;">
            <div style="font-weight:600;font-size:14px;color:var(--ink);">${a.title}</div>
            <div style="font-size:12px;color:var(--ink4);margin-top:2px;">/articles/${a.slug}</div>
          </td>
          <td style="padding:14px 12px;">
            <span style="background:var(--ivory);border:1px solid var(--border);padding:3px 10px;border-radius:99px;font-size:11px;font-weight:700;">${a.category}</span>
          </td>
          <td style="padding:14px 12px;">
            <span style="background:${a.status==='published'?'#dcfce7':'#fef9c3'};color:${a.status==='published'?'#15803d':'#a16207'};padding:3px 10px;border-radius:99px;font-size:11px;font-weight:700;">
              ${a.status==='published'?'✅ Published':'📝 Draft'}
            </span>
          </td>
          <td style="padding:14px 12px;font-size:13px;color:var(--ink3);">${new Date(a.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</td>
          <td style="padding:14px 12px;">
            <div style="display:flex;gap:6px;justify-content:flex-end;">
              <a href="/articles/${a.slug}" target="_blank" class="btn btn-outline btn-sm">View</a>
              <a href="/admin/articles/${a.id}/edit" class="btn btn-primary btn-sm">Edit</a>
              <form method="POST" action="/admin/articles/${a.id}/delete" onsubmit="return confirm('Delete this article?')" style="display:inline;">
                <button class="btn btn-outline btn-sm" style="color:#dc2626;border-color:#dc2626;">Delete</button>
              </form>
            </div>
          </td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>
</div>
<footer><div class="footer-bottom"><span>© ${new Date().getFullYear()} Festmore Admin</span></div></footer>
</body></html>`);
});

// ─── NEW ARTICLE FORM ─────────────────────────────────────────────
router.get('/new', requireAdmin, (req, res) => {
  res.send(renderArticleForm(null, req.query.error));
});

// ─── SAVE NEW ARTICLE ─────────────────────────────────────────────
router.post('/new', requireAdmin, (req, res) => {
  const { title, category, excerpt, body, image_url, status, meta_title, meta_description } = req.body;

  if (!title || !body) {
    return res.redirect('/admin/articles/new?error=Title and content are required');
  }

  let slug = slugify(title);
  let i = 1;
  while (db.prepare('SELECT id FROM articles WHERE slug=?').get(slug)) {
    slug = slugify(title) + '-' + i++;
  }

  try {
    db.prepare(`
      INSERT INTO articles (title, slug, category, excerpt, body, image_url, status, meta_title, meta_description, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `).run(
      title, slug, category || 'guide',
      excerpt || title,
      body,
      image_url || '',
      status || 'published',
      meta_title || title,
      meta_description || excerpt || ''
    );
    res.redirect('/admin/articles?success=Article published successfully!');
  } catch(err) {
    console.error('Article save error:', err.message);
    res.redirect('/admin/articles/new?error=Failed to save. Please try again.');
  }
});

// ─── EDIT ARTICLE FORM ────────────────────────────────────────────
router.get('/:id/edit', requireAdmin, (req, res) => {
  const article = db.prepare('SELECT * FROM articles WHERE id=?').get(parseInt(req.params.id));
  if (!article) return res.redirect('/admin/articles');
  res.send(renderArticleForm(article, req.query.error, req.query.success));
});

// ─── SAVE ARTICLE EDITS ──────────────────────────────────────────
router.post('/:id/edit', requireAdmin, (req, res) => {
  const { title, category, excerpt, body, image_url, status, meta_title, meta_description } = req.body;
  const id = parseInt(req.params.id);

  if (!title || !body) {
    return res.redirect('/admin/articles/' + id + '/edit?error=Title and content are required');
  }

  try {
    db.prepare(`
      UPDATE articles SET
        title=?, category=?, excerpt=?, body=?, image_url=?,
        status=?, meta_title=?, meta_description=?, updated_at=NOW()
      WHERE id=?
    `).run(
      title, category || 'guide',
      excerpt || '',
      body,
      image_url || '',
      status || 'published',
      meta_title || title,
      meta_description || excerpt || '',
      id
    );
    res.redirect('/admin/articles/' + id + '/edit?success=Article updated!');
  } catch(err) {
    console.error('Article update error:', err.message);
    res.redirect('/admin/articles/' + id + '/edit?error=Failed to update.');
  }
});

// ─── DELETE ARTICLE ───────────────────────────────────────────────
router.post('/:id/delete', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM articles WHERE id=?').run(parseInt(req.params.id));
  res.redirect('/admin/articles?success=Article deleted.');
});

// ─── RENDER ARTICLE FORM ─────────────────────────────────────────
function renderArticleForm(article, error, success) {
  const isEdit = !!article;
  const title = isEdit ? 'Edit Article' : 'Write New Article';

  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${title} — Festmore Admin</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="/css/main.css"/>
<style>
.editor-wrap { position:relative; }
.editor { width:100%; min-height:500px; background:#fff; border:1.5px solid var(--border2); border-radius:10px; padding:16px; font-size:15px; line-height:1.8; outline:none; box-sizing:border-box; font-family:'DM Sans',sans-serif; resize:vertical; }
.toolbar { display:flex; gap:6px; flex-wrap:wrap; margin-bottom:8px; }
.toolbar-btn { background:#fff; border:1.5px solid var(--border); border-radius:8px; padding:6px 12px; font-size:13px; font-weight:600; cursor:pointer; font-family:inherit; transition:all .2s; }
.toolbar-btn:hover { background:var(--ivory); border-color:var(--flame); color:var(--flame); }
.char-count { font-size:12px; color:var(--ink4); text-align:right; margin-top:4px; }
.preview-box { background:var(--ivory); border:1px solid var(--border); border-radius:12px; padding:24px; margin-top:12px; display:none; font-size:15px; line-height:1.8; color:var(--ink); }
.seo-score { display:flex; align-items:center; gap:8px; background:var(--ivory); border-radius:10px; padding:12px 16px; margin-top:8px; }
</style>
</head><body style="background:var(--cream);">
<nav class="main-nav"><div class="nav-inner">
  <a href="/" class="logo"><span class="logo-fest">Fest</span><span class="logo-more">more</span><span class="logo-dot"></span></a>
  <div style="flex:1;"></div>
  <div class="nav-right">
    <a href="/admin/articles" class="btn btn-outline btn-sm">← Articles</a>
    ${isEdit ? `<a href="/articles/${article.slug}" target="_blank" class="btn btn-outline btn-sm">View Live</a>` : ''}
  </div>
</div></nav>

<div class="container" style="padding:40px 0 80px;max-width:900px;">
  <h1 style="font-family:'DM Serif Display',serif;font-size:32px;font-weight:400;margin-bottom:24px;">${title}</h1>

  ${error ? `<div style="background:#fee2e2;border:1px solid #fca5a5;border-radius:12px;padding:14px 18px;margin-bottom:20px;color:#dc2626;font-weight:600;">⚠️ ${error}</div>` : ''}
  ${success ? `<div style="background:#dcfce7;border:1px solid #86efac;border-radius:12px;padding:14px 18px;margin-bottom:20px;color:#15803d;font-weight:600;">✅ ${success}</div>` : ''}

  <form method="POST" action="${isEdit ? '/admin/articles/'+article.id+'/edit' : '/admin/articles/new'}" id="article-form">

    <!-- MAIN CONTENT -->
    <div style="background:#fff;border:1px solid var(--border);border-radius:20px;padding:28px;margin-bottom:20px;">
      <h2 style="font-family:'DM Serif Display',serif;font-size:20px;font-weight:400;margin-bottom:20px;padding-bottom:14px;border-bottom:1px solid var(--border);">Article Content</h2>

      <div style="margin-bottom:20px;">
        <label style="${LS}">Title *</label>
        <input type="text" name="title" id="title-input" required
          value="${isEdit ? article.title.replace(/"/g,'&quot;') : ''}"
          placeholder="e.g. The Best Food Festivals in Europe 2026"
          style="${IS}font-size:18px;font-weight:600;"
          oninput="updateSlug(this.value); updateSEOScore();"/>
        <div style="font-size:12px;color:var(--ink4);margin-top:4px;">URL: /articles/<span id="slug-preview">${isEdit ? article.slug : 'your-title-here'}</span></div>
      </div>

      <div style="margin-bottom:20px;">
        <label style="${LS}">Excerpt / Summary</label>
        <textarea name="excerpt" id="excerpt-input" placeholder="A 1-2 sentence summary shown in search results and article cards..." style="${IS}" rows="2" oninput="updateSEOScore()">${isEdit ? (article.excerpt||'') : ''}</textarea>
        <div style="font-size:12px;color:var(--ink4);margin-top:4px;">Shown on article cards and in Google search results. Aim for 120-160 characters.</div>
      </div>

      <div style="margin-bottom:8px;">
        <label style="${LS}">Article Content *</label>
        <div class="toolbar">
          <button type="button" class="toolbar-btn" onclick="insertText('**','**')"><b>Bold</b></button>
          <button type="button" class="toolbar-btn" onclick="insertText('*','*')"><i>Italic</i></button>
          <button type="button" class="toolbar-btn" onclick="insertHeading()">H2 Heading</button>
          <button type="button" class="toolbar-btn" onclick="insertText('\\n- ','')">• List</button>
          <button type="button" class="toolbar-btn" onclick="insertText('\\n\\n---\\n\\n','')">Divider</button>
          <button type="button" class="toolbar-btn" onclick="togglePreview()">👁 Preview</button>
          <span style="font-size:12px;color:var(--ink4);align-self:center;margin-left:8px;">Supports basic Markdown</span>
        </div>
        <div class="editor-wrap">
          <textarea name="body" id="body-editor" class="editor" required
            placeholder="Write your article here...

Use ## for headings
Use **bold** for emphasis
Use - for bullet points

Write naturally and cover the topic thoroughly. Aim for at least 500 words for good SEO."
            oninput="updateCharCount(); updateSEOScore()">${isEdit ? (article.body||'') : ''}</textarea>
        </div>
        <div class="char-count"><span id="char-count">0</span> characters · <span id="word-count">0</span> words</div>
        <div id="preview-box" class="preview-box"></div>
      </div>
    </div>

    <!-- SETTINGS -->
    <div style="background:#fff;border:1px solid var(--border);border-radius:20px;padding:28px;margin-bottom:20px;">
      <h2 style="font-family:'DM Serif Display',serif;font-size:20px;font-weight:400;margin-bottom:20px;padding-bottom:14px;border-bottom:1px solid var(--border);">Settings</h2>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
        <div style="margin-bottom:16px;">
          <label style="${LS}">Category</label>
          <select name="category" style="${IS}">
            ${CATEGORIES.map(c => `<option value="${c}" ${(isEdit&&article.category===c)?'selected':''}>${c.charAt(0).toUpperCase()+c.slice(1)}</option>`).join('')}
          </select>
        </div>
        <div style="margin-bottom:16px;">
          <label style="${LS}">Status</label>
          <select name="status" style="${IS}">
            <option value="published" ${!isEdit||article.status==='published'?'selected':''}>✅ Published — visible on site</option>
            <option value="draft" ${isEdit&&article.status==='draft'?'selected':''}>📝 Draft — hidden from site</option>
          </select>
        </div>
        <div style="margin-bottom:16px;grid-column:1/-1;">
          <label style="${LS}">Featured Image URL</label>
          <input type="url" name="image_url" id="image-url-input"
            value="${isEdit ? (article.image_url||'') : ''}"
            placeholder="https://images.unsplash.com/photo-...?w=1200&q=80"
            style="${IS}"
            oninput="updateImagePreview(this.value)"/>
          <div style="font-size:12px;color:var(--ink4);margin-top:4px;">
            Get free images from <a href="https://unsplash.com" target="_blank" style="color:var(--flame);">unsplash.com</a> — right-click any image → Copy image address
          </div>
          <div id="image-preview" style="margin-top:12px;display:${isEdit&&article.image_url?'block':'none'};">
            <img id="preview-img" src="${isEdit&&article.image_url?article.image_url:''}" style="width:100%;max-height:200px;object-fit:cover;border-radius:10px;" alt="Preview"/>
          </div>
        </div>
      </div>
    </div>

    <!-- SEO -->
    <div style="background:#fff;border:1px solid var(--border);border-radius:20px;padding:28px;margin-bottom:20px;">
      <h2 style="font-family:'DM Serif Display',serif;font-size:20px;font-weight:400;margin-bottom:6px;padding-bottom:14px;border-bottom:1px solid var(--border);">SEO Settings</h2>

      <div id="seo-score-box" style="background:var(--ivory);border-radius:12px;padding:16px;margin-bottom:20px;">
        <div style="font-size:13px;font-weight:700;margin-bottom:8px;">SEO Score</div>
        <div id="seo-items" style="font-size:13px;color:var(--ink3);line-height:2;"></div>
      </div>

      <div style="margin-bottom:16px;">
        <label style="${LS}">Meta Title <span style="font-weight:400;text-transform:none;">(shown in Google — max 60 chars)</span></label>
        <input type="text" name="meta_title" id="meta-title"
          value="${isEdit ? (article.meta_title||article.title||'').replace(/"/g,'&quot;') : ''}"
          placeholder="Same as title or more keyword-focused"
          maxlength="60"
          style="${IS}"/>
        <div style="font-size:12px;color:var(--ink4);margin-top:4px;"><span id="meta-title-count">0</span>/60 characters</div>
      </div>
      <div style="margin-bottom:16px;">
        <label style="${LS}">Meta Description <span style="font-weight:400;text-transform:none;">(shown in Google — max 160 chars)</span></label>
        <textarea name="meta_description" id="meta-desc"
          placeholder="Describe what this article is about in 120-160 characters..."
          maxlength="160"
          style="${IS}" rows="2">${isEdit ? (article.meta_description||'') : ''}</textarea>
        <div style="font-size:12px;color:var(--ink4);margin-top:4px;"><span id="meta-desc-count">0</span>/160 characters</div>
      </div>

      <!-- Google Preview -->
      <div>
        <div style="font-size:12px;font-weight:700;color:var(--ink4);text-transform:uppercase;margin-bottom:8px;">Google Preview</div>
        <div style="background:#fff;border:1px solid var(--border);border-radius:10px;padding:16px 20px;">
          <div id="gp-title" style="font-size:18px;color:#1a0dab;font-weight:400;margin-bottom:2px;">${isEdit ? article.title : 'Your Article Title'}</div>
          <div id="gp-url" style="font-size:13px;color:#006621;margin-bottom:4px;">festmore.com › articles › ${isEdit ? article.slug : 'your-article-slug'}</div>
          <div id="gp-desc" style="font-size:14px;color:#545454;line-height:1.5;">${isEdit ? (article.meta_description||article.excerpt||'Article description will appear here') : 'Your meta description will appear here in Google search results.'}</div>
        </div>
      </div>
    </div>

    <!-- SUBMIT -->
    <div style="display:flex;gap:12px;justify-content:flex-end;">
      <a href="/admin/articles" class="btn btn-outline btn-lg">Cancel</a>
      <button type="submit" name="status" value="draft" class="btn btn-outline btn-lg">Save as Draft</button>
      <button type="submit" name="status" value="published" class="btn btn-primary btn-lg" style="padding:14px 40px;font-size:16px;">
        ${isEdit ? 'Update Article →' : 'Publish Article →'}
      </button>
    </div>

  </form>
</div>

<footer><div class="footer-bottom"><span>© ${new Date().getFullYear()} Festmore Admin</span></div></footer>

<script>
// ── Slug generator ──
function updateSlug(title) {
  const slug = title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'');
  document.getElementById('slug-preview').textContent = slug || 'your-title-here';
  document.getElementById('gp-url').textContent = 'festmore.com › articles › ' + (slug || 'your-article-slug');
  const mt = document.getElementById('meta-title');
  if (!mt.value || mt.value === mt.dataset.last) { mt.value = title; mt.dataset.last = title; }
  updateMetaCounts();
  updateGooglePreview();
}

// ── Word/char counter ──
function updateCharCount() {
  const body = document.getElementById('body-editor').value;
  const chars = body.length;
  const words = body.trim() ? body.trim().split(/\s+/).length : 0;
  document.getElementById('char-count').textContent = chars.toLocaleString();
  document.getElementById('word-count').textContent = words.toLocaleString();
}

// ── Meta counters ──
function updateMetaCounts() {
  const mt = document.getElementById('meta-title');
  const md = document.getElementById('meta-desc');
  if (mt) document.getElementById('meta-title-count').textContent = mt.value.length;
  if (md) document.getElementById('meta-desc-count').textContent = md.value.length;
}
document.getElementById('meta-title').addEventListener('input', function() { updateMetaCounts(); updateGooglePreview(); });
document.getElementById('meta-desc').addEventListener('input', function() { updateMetaCounts(); updateGooglePreview(); });

// ── Google preview ──
function updateGooglePreview() {
  const t = document.getElementById('meta-title').value || document.getElementById('title-input').value || 'Your Article Title';
  const d = document.getElementById('meta-desc').value || document.getElementById('excerpt-input').value || 'Your meta description will appear here.';
  document.getElementById('gp-title').textContent = t;
  document.getElementById('gp-desc').textContent = d;
}

// ── SEO Score ──
function updateSEOScore() {
  const title = document.getElementById('title-input').value;
  const excerpt = document.getElementById('excerpt-input').value;
  const body = document.getElementById('body-editor').value;
  const words = body.trim() ? body.trim().split(/\\s+/).length : 0;
  const checks = [
    [title.length >= 20, '✅ Title is long enough (20+ chars)', '❌ Title too short — aim for 20+ characters'],
    [title.length <= 70, '✅ Title length good (under 70 chars)', '⚠️ Title too long — keep under 70 characters'],
    [excerpt.length >= 80, '✅ Excerpt is descriptive', '❌ Add a longer excerpt (80+ chars) for SEO'],
    [words >= 300, '✅ Good content length (' + words + ' words)', '❌ Add more content — aim for 300+ words (currently ' + words + ')'],
    [words >= 600, '✅ Excellent content length (' + words + ' words)', ''],
    [body.includes('##'), '✅ Has headings (good for SEO)', '⚠️ Add H2 headings with ## to improve SEO'],
    [document.getElementById('image-url-input').value.length > 0, '✅ Has featured image', '⚠️ Add a featured image'],
  ].filter(c => c[0] || c[1]);
  
  const score = checks.filter(c => c[0]).length;
  const total = checks.length;
  const pct = Math.round(score/total*100);
  const color = pct >= 80 ? '#15803d' : pct >= 50 ? '#d97706' : '#dc2626';
  
  document.getElementById('seo-score-box').style.background = pct >= 80 ? '#f0fdf4' : pct >= 50 ? '#fffbeb' : '#fef2f2';
  document.getElementById('seo-items').innerHTML = 
    '<div style="font-size:16px;font-weight:800;color:' + color + ';margin-bottom:8px;">SEO Score: ' + pct + '% (' + score + '/' + total + ')</div>' +
    checks.map(c => '<div>' + (c[0] ? c[1] : c[2]) + '</div>').filter(Boolean).join('');
}

// ── Image preview ──
function updateImagePreview(url) {
  const p = document.getElementById('image-preview');
  const img = document.getElementById('preview-img');
  if (url && url.startsWith('http')) {
    img.src = url;
    p.style.display = 'block';
  } else {
    p.style.display = 'none';
  }
}

// ── Toolbar helpers ──
function insertText(before, after) {
  const ta = document.getElementById('body-editor');
  const start = ta.selectionStart, end = ta.selectionEnd;
  const selected = ta.value.substring(start, end);
  ta.value = ta.value.substring(0,start) + before + selected + after + ta.value.substring(end);
  ta.selectionStart = start + before.length;
  ta.selectionEnd = start + before.length + selected.length;
  ta.focus();
  updateCharCount();
}

function insertHeading() {
  const ta = document.getElementById('body-editor');
  const pos = ta.selectionStart;
  const before = ta.value.substring(0, pos);
  const after = ta.value.substring(pos);
  ta.value = before + '\\n## Your Heading Here\\n' + after;
  ta.focus();
  updateCharCount();
}

function togglePreview() {
  const preview = document.getElementById('preview-box');
  const body = document.getElementById('body-editor').value;
  if (preview.style.display === 'none' || !preview.style.display) {
    // Simple markdown to HTML conversion
    let html = body
      .replace(/## (.+)/g, '<h2 style="font-family:serif;font-size:22px;margin:20px 0 10px;">$1</h2>')
      .replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>')
      .replace(/\\*(.+?)\\*/g, '<em>$1</em>')
      .replace(/^- (.+)/gm, '<li>$1</li>')
      .replace(/\\n/g, '<br/>');
    preview.innerHTML = html;
    preview.style.display = 'block';
  } else {
    preview.style.display = 'none';
  }
}

// ── Init ──
updateCharCount();
updateMetaCounts();
updateSEOScore();
updateGooglePreview();
</script>
</body></html>`;
}

module.exports = router;
