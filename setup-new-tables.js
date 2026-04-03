// setup-new-tables.js
// Run once: node setup-new-tables.js

const { Client } = require('pg');
const PG_URL = 'postgresql://postgres:VWgjvXynowzYucOsfqNNAPWojptOHaXJ@gondola.proxy.rlwy.net:47003/railway';

async function setup() {
  const client = new Client({ connectionString: PG_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log('✅ Connected to PostgreSQL');

  // Upgrade vendor_applications
  await client.query(`CREATE TABLE IF NOT EXISTS vendor_applications (
    id SERIAL PRIMARY KEY, vendor_id INTEGER NOT NULL, event_id INTEGER NOT NULL,
    message TEXT, status TEXT DEFAULT 'pending', organiser_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(vendor_id, event_id)
  )`);
  await client.query(`ALTER TABLE vendor_applications ADD COLUMN IF NOT EXISTS organiser_notes TEXT`).catch(()=>{});
  await client.query(`ALTER TABLE vendor_applications ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()`).catch(()=>{});
  console.log('✅ vendor_applications ready');

  // Messages
  await client.query(`CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY, from_user_id INTEGER NOT NULL, to_user_id INTEGER NOT NULL,
    subject TEXT, body TEXT NOT NULL, read BOOLEAN DEFAULT FALSE,
    thread_id TEXT, created_at TIMESTAMP DEFAULT NOW()
  )`);
  console.log('✅ messages ready');

  // Reviews
  await client.query(`CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY, vendor_id INTEGER NOT NULL, reviewer_id INTEGER NOT NULL,
    event_id INTEGER, rating INTEGER NOT NULL, title TEXT, body TEXT,
    status TEXT DEFAULT 'published', created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(vendor_id, reviewer_id)
  )`);
  console.log('✅ reviews ready');

  // Notifications
  await client.query(`CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL, type TEXT NOT NULL,
    title TEXT NOT NULL, body TEXT, link TEXT, read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
  )`);
  console.log('✅ notifications ready');

  // New columns
  const cols = [
    [`ALTER TABLE events ADD COLUMN IF NOT EXISTS organiser_email TEXT`, 'events.organiser_email'],
    [`ALTER TABLE events ADD COLUMN IF NOT EXISTS organiser_name TEXT`, 'events.organiser_name'],
    [`ALTER TABLE events ADD COLUMN IF NOT EXISTS vendor_fee TEXT`, 'events.vendor_fee'],
    [`ALTER TABLE events ADD COLUMN IF NOT EXISTS vendor_requirements TEXT`, 'events.vendor_requirements'],
    [`ALTER TABLE vendors ADD COLUMN IF NOT EXISTS avg_rating REAL DEFAULT 0`, 'vendors.avg_rating'],
    [`ALTER TABLE vendors ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0`, 'vendors.total_reviews'],
    [`ALTER TABLE vendors ADD COLUMN IF NOT EXISTS total_applications INTEGER DEFAULT 0`, 'vendors.total_applications'],
    [`ALTER TABLE users ADD COLUMN IF NOT EXISTS unread_messages INTEGER DEFAULT 0`, 'users.unread_messages'],
    [`ALTER TABLE users ADD COLUMN IF NOT EXISTS unread_notifications INTEGER DEFAULT 0`, 'users.unread_notifications'],
  ];

  for (const [sql, label] of cols) {
    try { await client.query(sql); console.log('✅', label); } catch(e) { console.log('⏭️', label, 'exists'); }
  }

  console.log('\n🎉 ALL TABLES READY!');
  await client.end();
}

setup().catch(console.error);
