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

module.exports = router;
