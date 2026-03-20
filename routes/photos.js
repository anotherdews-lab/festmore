// routes/photos.js
// Handles photo uploads for events and vendors via Cloudinary

const express = require('express');
const router  = express.Router();
const db      = require('../db');

// ─────────────────────────────────────
// UPLOAD MIDDLEWARE SETUP
// ─────────────────────────────────────
let uploadEventPhotos, uploadVendorPhotos, handleUpload;

try {
  const uploadUtils = require('../utils/upload');
  uploadEventPhotos  = uploadUtils.uploadEventPhotos;
  uploadVendorPhotos = uploadUtils.uploadVendorPhotos;
  handleUpload       = uploadUtils.handleUpload;
} catch(e) {
  console.log('⚠️ Cloudinary not configured:', e.message);
}

// ─────────────────────────────────────
// UPLOAD EVENT PHOTOS
// POST /photos/event/:id
// ─────────────────────────────────────
router.post('/event/:id', async (req, res) => {
  if (!uploadEventPhotos) return res.json({ ok: false, msg: 'Upload not configured' });

  const eventId = parseInt(req.params.id);
  const event   = db.prepare('SELECT * FROM events WHERE id=?').get(eventId);
  if (!event) return res.json({ ok: false, msg: 'Event not found' });

  try {
    const files = await handleUpload(uploadEventPhotos, req, res);
    if (!files || files.length === 0) return res.json({ ok: false, msg: 'No files uploaded' });

    // Get existing photos
    let photos = [];
    try { photos = JSON.parse(event.photos || '[]'); } catch(e) { photos = []; }

    // Add new photos (max 6 total)
    const newPhotos = files.map(f => ({
      url:       f.path || f.secure_url,
      public_id: f.filename || f.public_id,
      name:      f.originalname || '',
    }));

    photos = [...photos, ...newPhotos].slice(0, 6);

    // Update event — set first photo as main image_url if none set
    const updates = { photos: JSON.stringify(photos) };
    if (!event.image_url && photos.length > 0) {
      updates.image_url = photos[0].url;
    }

    db.prepare('UPDATE events SET photos=? WHERE id=?').run(JSON.stringify(photos), eventId);
    if (updates.image_url) {
      db.prepare('UPDATE events SET image_url=? WHERE id=?').run(updates.image_url, eventId);
    }

    res.json({ ok: true, photos, msg: `${files.length} photo(s) uploaded successfully!` });
  } catch(err) {
    console.error('Upload error:', err.message);
    res.json({ ok: false, msg: 'Upload failed: ' + err.message });
  }
});

// ─────────────────────────────────────
// UPLOAD VENDOR PHOTOS
// POST /photos/vendor/:id
// ─────────────────────────────────────
router.post('/vendor/:id', async (req, res) => {
  if (!uploadVendorPhotos) return res.json({ ok: false, msg: 'Upload not configured' });

  const vendorId = parseInt(req.params.id);
  const vendor   = db.prepare('SELECT * FROM vendors WHERE id=?').get(vendorId);
  if (!vendor) return res.json({ ok: false, msg: 'Vendor not found' });

  try {
    const files = await handleUpload(uploadVendorPhotos, req, res);
    if (!files || files.length === 0) return res.json({ ok: false, msg: 'No files uploaded' });

    let photos = [];
    try { photos = JSON.parse(vendor.photos || '[]'); } catch(e) { photos = []; }

    const newPhotos = files.map(f => ({
      url:       f.path || f.secure_url,
      public_id: f.filename || f.public_id,
      name:      f.originalname || '',
    }));

    photos = [...photos, ...newPhotos].slice(0, 6);

    db.prepare('UPDATE vendors SET photos=? WHERE id=?').run(JSON.stringify(photos), vendorId);
    if (!vendor.image_url && photos.length > 0) {
      db.prepare('UPDATE vendors SET image_url=? WHERE id=?').run(photos[0].url, vendorId);
    }

    res.json({ ok: true, photos, msg: `${files.length} photo(s) uploaded successfully!` });
  } catch(err) {
    console.error('Upload error:', err.message);
    res.json({ ok: false, msg: 'Upload failed: ' + err.message });
  }
});

// ─────────────────────────────────────
// DELETE PHOTO
// DELETE /photos/event/:id/:index
// ─────────────────────────────────────
router.post('/event/:id/delete/:index', (req, res) => {
  const event = db.prepare('SELECT * FROM events WHERE id=?').get(parseInt(req.params.id));
  if (!event) return res.json({ ok: false });
  let photos = [];
  try { photos = JSON.parse(event.photos || '[]'); } catch(e) {}
  photos.splice(parseInt(req.params.index), 1);
  db.prepare('UPDATE events SET photos=? WHERE id=?').run(JSON.stringify(photos), parseInt(req.params.id));
  if (photos.length > 0) {
    db.prepare('UPDATE events SET image_url=? WHERE id=?').run(photos[0].url, parseInt(req.params.id));
  }
  res.json({ ok: true, photos });
});

router.post('/vendor/:id/delete/:index', (req, res) => {
  const vendor = db.prepare('SELECT * FROM vendors WHERE id=?').get(parseInt(req.params.id));
  if (!vendor) return res.json({ ok: false });
  let photos = [];
  try { photos = JSON.parse(vendor.photos || '[]'); } catch(e) {}
  photos.splice(parseInt(req.params.index), 1);
  db.prepare('UPDATE vendors SET photos=? WHERE id=?').run(JSON.stringify(photos), parseInt(req.params.id));
  if (photos.length > 0) {
    db.prepare('UPDATE vendors SET image_url=? WHERE id=?').run(photos[0].url, parseInt(req.params.id));
  }
  res.json({ ok: true, photos });
});

module.exports = router;

// ─────────────────────────────────────
// PHOTO UPLOAD HTML COMPONENT
// Call this function to render the upload widget
// ─────────────────────────────────────
module.exports.photoUploadHTML = function(type, id, existingPhotos = [], maxPhotos = 6) {
  const photos = Array.isArray(existingPhotos) ? existingPhotos : [];
  const slots  = Array.from({ length: maxPhotos }, (_, i) => photos[i] || null);

  return `
<div class="photo-upload-section" id="photo-upload-section">
  <label class="photo-upload-label">
    📸 Photos (up to ${maxPhotos})
    ${photos.length > 0 ? `<span style="background:#dcfce7;color:#15803d;padding:2px 8px;border-radius:99px;font-size:10px;font-weight:700;margin-left:8px;">${photos.length} uploaded</span>` : ''}
  </label>
  <p class="photo-upload-sub">
    Upload photos of your ${type === 'event' ? 'event, venue, flyer or past editions' : 'stall, trailer, products or setup'}.
    First photo becomes your main cover image. Max 10MB per photo. JPG, PNG or WebP.
  </p>

  <div class="photo-upload-grid" id="photo-grid">
    ${slots.map((photo, i) => `
    <div class="photo-upload-slot ${photo ? 'has-photo' : ''}" id="slot-${i}">
      ${photo ? `
        <img src="${photo.url}" alt="Photo ${i+1}" id="preview-${i}"/>
        <div class="slot-overlay">
          <span style="color:#fff;font-size:12px;font-weight:600;">Click to replace</span>
        </div>
        ${i === 0 ? '<span class="photo-primary-badge">Cover Photo</span>' : ''}
        <button type="button" class="photo-remove-btn" onclick="removePhoto('${type}', ${id||0}, ${i}, event)">×</button>
        <input type="file" accept="image/*" onchange="uploadPhoto(this, '${type}', ${id||0}, ${i})" style="position:absolute;inset:0;opacity:0;cursor:pointer;"/>
      ` : `
        <span class="photo-upload-icon">📷</span>
        <span class="photo-upload-text">${i === 0 ? 'Cover Photo' : `Photo ${i+1}`}<br/><span style="font-size:10px;color:var(--ink4);">Click to upload</span></span>
        <input type="file" accept="image/*" onchange="uploadPhoto(this, '${type}', ${id||0}, ${i})"/>
      `}
    </div>`).join('')}
  </div>

  <div class="photo-upload-tips">
    💡 <strong>Tips for great photos:</strong> Use landscape orientation (wider than tall) · Good lighting makes a huge difference · Show your setup, products and atmosphere · Real photos convert much better than stock images
  </div>

  <div id="upload-status" style="display:none;margin-top:12px;padding:12px 16px;border-radius:10px;font-size:14px;font-weight:600;"></div>
</div>

<style>
.photo-upload-section{margin-top:28px;border-top:1px solid var(--border);padding-top:28px;}
.photo-upload-label{font-size:12px;font-weight:700;color:var(--ink3);text-transform:uppercase;letter-spacing:.8px;display:block;margin-bottom:8px;}
.photo-upload-sub{font-size:13px;color:var(--ink4);margin-bottom:16px;line-height:1.5;}
.photo-upload-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px;}
.photo-upload-slot{aspect-ratio:4/3;border:2px dashed var(--border2);border-radius:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;transition:all .2s;position:relative;overflow:hidden;background:var(--ivory);}
.photo-upload-slot:hover{border-color:var(--flame);background:rgba(232,71,10,.04);}
.photo-upload-slot.has-photo{border-style:solid;border-color:var(--sage);}
.photo-upload-slot img{width:100%;height:100%;object-fit:cover;position:absolute;inset:0;}
.slot-overlay{position:absolute;inset:0;background:rgba(26,22,18,.5);display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .2s;}
.photo-upload-slot:hover .slot-overlay{opacity:1;}
.photo-upload-icon{font-size:24px;margin-bottom:6px;display:block;}
.photo-upload-text{font-size:11px;font-weight:600;color:var(--ink3);text-align:center;}
.photo-upload-slot input[type="file"]{position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%;}
.photo-remove-btn{position:absolute;top:6px;right:6px;background:rgba(220,38,38,.9);color:#fff;border:none;border-radius:50%;width:24px;height:24px;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:10;line-height:1;}
.photo-primary-badge{position:absolute;bottom:6px;left:6px;background:var(--flame);color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px;}
.photo-upload-tips{background:rgba(74,124,89,.07);border:1px solid rgba(74,124,89,.2);border-radius:10px;padding:12px 16px;font-size:12.5px;color:var(--ink3);line-height:1.6;}
@media(max-width:600px){.photo-upload-grid{grid-template-columns:repeat(2,1fr);}}
</style>

<script>
// Current photos state
var currentPhotos = ${JSON.stringify(photos)};
var entityId = ${id || 0};
var entityType = '${type}';

async function uploadPhoto(input, type, id, slotIndex) {
  if (!input.files || !input.files[0]) return;

  const file = input.files[0];
  if (file.size > 10 * 1024 * 1024) {
    showStatus('❌ File too large. Maximum size is 10MB.', false);
    return;
  }

  const slot = document.getElementById('slot-' + slotIndex);
  slot.innerHTML = '<span style="font-size:24px;animation:spin 1s linear infinite;display:block;">⏳</span><span style="font-size:11px;color:var(--ink3);">Uploading...</span>';

  const formData = new FormData();
  formData.append('photos', file);

  try {
    const res = await fetch('/photos/' + type + '/' + id, {
      method: 'POST',
      body: formData
    });
    const data = await res.json();

    if (data.ok && data.photos) {
      currentPhotos = data.photos;
      refreshPhotoGrid(type, id, data.photos);
      showStatus('✅ ' + data.msg, true);
    } else {
      slot.innerHTML = '<span class="photo-upload-icon">📷</span><span class="photo-upload-text">Click to upload</span><input type="file" accept="image/*" onchange="uploadPhoto(this, \\''+type+'\\', '+id+', '+slotIndex+')"/>';
      showStatus('❌ ' + (data.msg || 'Upload failed'), false);
    }
  } catch(err) {
    slot.innerHTML = '<span class="photo-upload-icon">📷</span><span class="photo-upload-text">Click to upload</span><input type="file" accept="image/*" onchange="uploadPhoto(this, \\''+type+'\\', '+id+', '+slotIndex+')"/>';
    showStatus('❌ Upload failed. Please try again.', false);
  }
}

async function removePhoto(type, id, index, e) {
  e.stopPropagation();
  if (!confirm('Remove this photo?')) return;

  const res = await fetch('/photos/' + type + '/' + id + '/delete/' + index, { method: 'POST' });
  const data = await res.json();
  if (data.ok) {
    currentPhotos = data.photos || [];
    refreshPhotoGrid(type, id, currentPhotos);
    showStatus('Photo removed.', true);
  }
}

function refreshPhotoGrid(type, id, photos) {
  const grid = document.getElementById('photo-grid');
  const maxPhotos = ${maxPhotos};
  const slots = Array.from({ length: maxPhotos }, (_, i) => photos[i] || null);

  grid.innerHTML = slots.map((photo, i) => {
    if (photo) {
      return '<div class="photo-upload-slot has-photo" id="slot-'+i+'">' +
        '<img src="'+photo.url+'" alt="Photo '+(i+1)+'"/>' +
        '<div class="slot-overlay"><span style="color:#fff;font-size:12px;font-weight:600;">Click to replace</span></div>' +
        (i===0?'<span class="photo-primary-badge">Cover Photo</span>':'') +
        '<button type="button" class="photo-remove-btn" onclick="removePhoto(\\''+type+'\\','+id+','+i+',event)">×</button>' +
        '<input type="file" accept="image/*" onchange="uploadPhoto(this,\\''+type+'\\','+id+','+i+')" style="position:absolute;inset:0;opacity:0;cursor:pointer;"/>' +
        '</div>';
    } else {
      return '<div class="photo-upload-slot" id="slot-'+i+'">' +
        '<span class="photo-upload-icon">📷</span>' +
        '<span class="photo-upload-text">'+(i===0?'Cover Photo':'Photo '+(i+1))+'<br/><span style="font-size:10px;color:var(--ink4);">Click to upload</span></span>' +
        '<input type="file" accept="image/*" onchange="uploadPhoto(this,\\''+type+'\\','+id+','+i+')"/>' +
        '</div>';
    }
  }).join('');
}

function showStatus(msg, ok) {
  var el = document.getElementById('upload-status');
  el.style.display = 'block';
  el.style.background = ok ? '#dcfce7' : '#fee2e2';
  el.style.color = ok ? '#15803d' : '#dc2626';
  el.textContent = msg;
  setTimeout(function(){ el.style.display='none'; }, 4000);
}

// Spin animation
var style = document.createElement('style');
style.textContent = '@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}';
document.head.appendChild(style);
</script>`;
};

// ─────────────────────────────────────
// PHOTO GALLERY HTML
// Shows uploaded photos on profile/detail pages
// ─────────────────────────────────────
module.exports.photoGalleryHTML = function(photosJson, title) {
  let photos = [];
  try { photos = JSON.parse(photosJson || '[]'); } catch(e) {}
  if (!photos || photos.length === 0) return '';

  return `
<div style="margin-top:28px;">
  <h3 style="font-family:'DM Serif Display',serif;font-size:20px;font-weight:400;margin-bottom:16px;">📸 Photos</h3>
  <div style="display:grid;grid-template-columns:repeat(${Math.min(photos.length, 3)},1fr);gap:10px;">
    ${photos.map((p, i) => `
    <div style="aspect-ratio:4/3;border-radius:12px;overflow:hidden;cursor:pointer;position:relative;" onclick="openLightbox(${i})">
      <img src="${p.url}" alt="${title} photo ${i+1}" loading="lazy" style="width:100%;height:100%;object-fit:cover;transition:transform .3s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'"/>
      ${i === 0 ? '<span style="position:absolute;bottom:8px;left:8px;background:var(--flame);color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px;">Cover</span>' : ''}
    </div>`).join('')}
  </div>
</div>

<!-- LIGHTBOX -->
<div id="lightbox" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.95);z-index:9999;align-items:center;justify-content:center;" onclick="closeLightbox()">
  <button onclick="prevPhoto(event)" style="position:absolute;left:20px;top:50%;transform:translateY(-50%);background:rgba(255,255,255,.2);border:none;color:#fff;font-size:32px;padding:10px 16px;border-radius:50%;cursor:pointer;">‹</button>
  <img id="lightbox-img" src="" alt="" style="max-width:90vw;max-height:90vh;object-fit:contain;border-radius:8px;"/>
  <button onclick="nextPhoto(event)" style="position:absolute;right:20px;top:50%;transform:translateY(-50%);background:rgba(255,255,255,.2);border:none;color:#fff;font-size:32px;padding:10px 16px;border-radius:50%;cursor:pointer;">›</button>
  <button onclick="closeLightbox()" style="position:absolute;top:20px;right:20px;background:rgba(255,255,255,.2);border:none;color:#fff;font-size:20px;padding:8px 14px;border-radius:50%;cursor:pointer;">×</button>
  <div id="lightbox-counter" style="position:absolute;bottom:20px;left:50%;transform:translateX(-50%);color:rgba(255,255,255,.6);font-size:13px;"></div>
</div>

<script>
var galleryPhotos = ${JSON.stringify(photos)};
var currentPhotoIndex = 0;

function openLightbox(index) {
  currentPhotoIndex = index;
  document.getElementById('lightbox-img').src = galleryPhotos[index].url;
  document.getElementById('lightbox-counter').textContent = (index+1) + ' / ' + galleryPhotos.length;
  document.getElementById('lightbox').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  document.getElementById('lightbox').style.display = 'none';
  document.body.style.overflow = '';
}

function prevPhoto(e) {
  e.stopPropagation();
  currentPhotoIndex = (currentPhotoIndex - 1 + galleryPhotos.length) % galleryPhotos.length;
  document.getElementById('lightbox-img').src = galleryPhotos[currentPhotoIndex].url;
  document.getElementById('lightbox-counter').textContent = (currentPhotoIndex+1) + ' / ' + galleryPhotos.length;
}

function nextPhoto(e) {
  e.stopPropagation();
  currentPhotoIndex = (currentPhotoIndex + 1) % galleryPhotos.length;
  document.getElementById('lightbox-img').src = galleryPhotos[currentPhotoIndex].url;
  document.getElementById('lightbox-counter').textContent = (currentPhotoIndex+1) + ' / ' + galleryPhotos.length;
}

document.addEventListener('keydown', function(e) {
  if (document.getElementById('lightbox').style.display === 'flex') {
    if (e.key === 'ArrowLeft') prevPhoto(e);
    if (e.key === 'ArrowRight') nextPhoto(e);
    if (e.key === 'Escape') closeLightbox();
  }
});
</script>`;
};