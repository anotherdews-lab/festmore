// routes/upload.js — CLOUDINARY PHOTO UPLOAD
// Handles photo uploads for both vendors and events
// Uses multer + cloudinary for professional file handling

const express    = require('express');
const router     = express.Router();
const db         = require('../db');
const cloudinary = require('cloudinary').v2;
const multer     = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer + Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'festmore/' + (req.params.type || 'general'),
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 900, crop: 'limit', quality: 'auto' }],
    public_id: req.params.type + '_' + req.params.id + '_' + Date.now(),
  }),
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG and WebP images are allowed'));
    }
  },
});

function requireLogin(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: 'Login required' });
  next();
}

// ─────────────────────────────────────
// UPLOAD PHOTO — POST /upload/:type/:id
// type = 'vendor' or 'event'
// id   = vendor or event ID
// ─────────────────────────────────────
router.post('/:type/:id', requireLogin, (req, res) => {
  const { type, id } = req.params;
  const userId    = req.session.user.id;
  const userEmail = req.session.user.email;
  const userRole  = req.session.user.role;

  // Verify ownership
  let record;
  if (type === 'vendor') {
    record = db.prepare('SELECT * FROM vendors WHERE id=?').get(parseInt(id));
    if (!record) return res.status(404).json({ error: 'Vendor not found' });
    if (record.email !== userEmail && userRole !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
  } else if (type === 'event') {
    record = db.prepare('SELECT * FROM events WHERE id=?').get(parseInt(id));
    if (!record) return res.status(404).json({ error: 'Event not found' });
    if (record.user_id !== userId && userRole !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
  } else {
    return res.status(400).json({ error: 'Invalid type' });
  }

  // Check photo limit
  let photos = [];
  try { photos = JSON.parse(record.photos || '[]'); } catch(e) {}
  if (photos.length >= 8) {
    return res.status(400).json({ error: 'Maximum 8 photos allowed. Delete one first.' });
  }

  // Upload to Cloudinary via multer
  upload.single('photo')(req, res, (err) => {
    if (err) {
      console.error('Upload error:', err.message);
      return res.status(400).json({ error: err.message || 'Upload failed' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No file received' });
    }

    const photoUrl = req.file.path || req.file.secure_url;
    photos.push(photoUrl);

    try {
      if (type === 'vendor') {
        db.prepare("UPDATE vendors SET photos=?, updated_at=datetime('now') WHERE id=?").run(JSON.stringify(photos), parseInt(id));
      } else {
        db.prepare("UPDATE events SET photos=?, updated_at=datetime('now') WHERE id=?").run(JSON.stringify(photos), parseInt(id));
      }
      console.log('Photo uploaded:', photoUrl);
      res.json({ success: true, url: photoUrl, total: photos.length });
    } catch(dbErr) {
      console.error('DB error:', dbErr.message);
      res.status(500).json({ error: 'Failed to save photo to database' });
    }
  });
});

// ─────────────────────────────────────
// DELETE PHOTO — POST /upload/:type/:id/delete
// ─────────────────────────────────────
router.post('/:type/:id/delete', requireLogin, (req, res) => {
  const { type, id } = req.params;
  const { index }    = req.body;
  const userEmail    = req.session.user.email;
  const userId       = req.session.user.id;
  const userRole     = req.session.user.role;

  let record;
  if (type === 'vendor') {
    record = db.prepare('SELECT * FROM vendors WHERE id=?').get(parseInt(id));
    if (!record || (record.email !== userEmail && userRole !== 'admin')) {
      return res.status(403).json({ error: 'Not authorized' });
    }
  } else {
    record = db.prepare('SELECT * FROM events WHERE id=?').get(parseInt(id));
    if (!record || (record.user_id !== userId && userRole !== 'admin')) {
      return res.status(403).json({ error: 'Not authorized' });
    }
  }

  let photos = [];
  try { photos = JSON.parse(record.photos || '[]'); } catch(e) {}

  const idx = parseInt(index);
  if (isNaN(idx) || idx < 0 || idx >= photos.length) {
    return res.status(400).json({ error: 'Invalid photo index' });
  }

  // Try to delete from Cloudinary
  try {
    const url = photos[idx];
    const parts = url.split('/');
    const filename = parts[parts.length - 1].replace(/\.[^/.]+$/, '');
    const folder = parts[parts.length - 2];
    cloudinary.uploader.destroy('festmore/' + folder + '/' + filename).catch(() => {});
  } catch(e) {}

  photos.splice(idx, 1);

  try {
    if (type === 'vendor') {
      db.prepare("UPDATE vendors SET photos=?, updated_at=datetime('now') WHERE id=?").run(JSON.stringify(photos), parseInt(id));
    } else {
      db.prepare("UPDATE events SET photos=?, updated_at=datetime('now') WHERE id=?").run(JSON.stringify(photos), parseInt(id));
    }
    res.json({ success: true, total: photos.length });
  } catch(e) {
    res.status(500).json({ error: 'Failed to delete photo' });
  }
});

module.exports = router;
