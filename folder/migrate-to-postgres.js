// migrate-to-postgres.js
// Migrates all data from SQLite to PostgreSQL
// Run once: node migrate-to-postgres.js

const Database = require('better-sqlite3');
const { Client } = require('pg');
const path = require('path');

const PG_URL = 'postgresql://postgres:VWgjvXynowzYucOsfqNNAPWojptOHaXJ@gondola.proxy.rlwy.net:47003/railway';

const sqlite = new Database(path.join(__dirname, 'db', 'festmore.db'));
const pg = new Client({ connectionString: PG_URL, ssl: { rejectUnauthorized: false } });

async function migrate() {
  await pg.connect();
  console.log('✅ Connected to PostgreSQL');

  // ── CREATE TABLES ──────────────────────────────────────
  console.log('\n📋 Creating tables...');

  await pg.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT DEFAULT 'visitor',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await pg.query(`
    CREATE TABLE IF NOT EXISTS events (
      id SERIAL PRIMARY KEY,
      user_id INTEGER,
      title TEXT NOT NULL,
      slug TEXT UNIQUE,
      category TEXT,
      country TEXT,
      city TEXT,
      address TEXT,
      start_date TEXT,
      end_date TEXT,
      date_display TEXT,
      description TEXT,
      image_url TEXT,
      photos TEXT DEFAULT '[]',
      website TEXT,
      ticket_url TEXT,
      price_display TEXT DEFAULT 'Free',
      attendees INTEGER DEFAULT 0,
      vendor_spots INTEGER DEFAULT 0,
      status TEXT DEFAULT 'active',
      payment_status TEXT DEFAULT 'free',
      featured INTEGER DEFAULT 0,
      views INTEGER DEFAULT 0,
      tags TEXT,
      organiser TEXT,
      updated_at TIMESTAMP DEFAULT NOW(),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await pg.query(`
    CREATE TABLE IF NOT EXISTS vendors (
      id SERIAL PRIMARY KEY,
      user_id INTEGER,
      business_name TEXT NOT NULL,
      slug TEXT UNIQUE,
      category TEXT,
      city TEXT,
      country TEXT,
      description TEXT,
      short_desc TEXT,
      website TEXT,
      phone TEXT,
      email TEXT,
      image_url TEXT,
      photos TEXT DEFAULT '[]',
      tags TEXT DEFAULT '{}',
      rating REAL DEFAULT 0,
      review_count INTEGER DEFAULT 0,
      events_attended INTEGER DEFAULT 0,
      premium INTEGER DEFAULT 0,
      verified INTEGER DEFAULT 0,
      status TEXT DEFAULT 'pending',
      payment_status TEXT DEFAULT 'unpaid',
      stripe_payment_id TEXT,
      founded_year INTEGER,
      views INTEGER DEFAULT 0,
      updated_at TIMESTAMP DEFAULT NOW(),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await pg.query(`
    CREATE TABLE IF NOT EXISTS articles (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT UNIQUE,
      category TEXT,
      content TEXT,
      excerpt TEXT,
      image_url TEXT,
      author TEXT DEFAULT 'Festmore Editorial',
      status TEXT DEFAULT 'published',
      views INTEGER DEFAULT 0,
      tags TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await pg.query(`
    CREATE TABLE IF NOT EXISTS payments (
      id SERIAL PRIMARY KEY,
      stripe_session_id TEXT UNIQUE,
      amount INTEGER,
      type TEXT,
      status TEXT DEFAULT 'pending',
      reference_id INTEGER,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await pg.query(`
    CREATE TABLE IF NOT EXISTS subscribers (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE,
      name TEXT,
      country TEXT,
      active INTEGER DEFAULT 1,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await pg.query(`
    CREATE TABLE IF NOT EXISTS vendor_applications (
      id SERIAL PRIMARY KEY,
      vendor_id INTEGER,
      event_id INTEGER,
      message TEXT,
      status TEXT DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  console.log('✅ Tables created');

  // ── MIGRATE DATA ───────────────────────────────────────

  // Users
  console.log('\n👥 Migrating users...');
  const users = sqlite.prepare('SELECT * FROM users').all();
  for (const u of users) {
    try {
      await pg.query(
        'INSERT INTO users (id, name, email, password, role, created_at) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (email) DO NOTHING',
        [u.id, u.name||'', u.email||'', u.password||'', u.role||'visitor', u.created_at||new Date()]
      );
    } catch(e) { console.log('  ⚠️ User skip:', u.email, e.message); }
  }
  console.log('✅ Users:', users.length);

  // Events
  console.log('\n🎪 Migrating events...');
  const events = sqlite.prepare('SELECT * FROM events').all();
  let eventCount = 0;
  for (const e of events) {
    try {
      await pg.query(
        `INSERT INTO events (id, user_id, title, slug, category, country, city, address, start_date, end_date, date_display, description, image_url, photos, website, ticket_url, price_display, attendees, vendor_spots, status, payment_status, featured, views, tags, organiser, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26)
         ON CONFLICT (slug) DO NOTHING`,
        [e.id, e.user_id||null, e.title||'', e.slug||'', e.category||'', e.country||'', e.city||'', e.address||'', e.start_date||'', e.end_date||'', e.date_display||'', e.description||'', e.image_url||'', e.photos||'[]', e.website||'', e.ticket_url||'', e.price_display||'Free', e.attendees||0, e.vendor_spots||0, e.status||'active', e.payment_status||'free', e.featured||0, e.views||0, e.tags||'', e.organiser||'', e.created_at||new Date()]
      );
      eventCount++;
    } catch(e2) { console.log('  ⚠️ Event skip:', e.slug, e2.message); }
  }
  console.log('✅ Events:', eventCount);

  // Vendors
  console.log('\n🏪 Migrating vendors...');
  const vendors = sqlite.prepare('SELECT * FROM vendors').all();
  let vendorCount = 0;
  for (const v of vendors) {
    try {
      await pg.query(
        `INSERT INTO vendors (id, user_id, business_name, slug, category, city, country, description, short_desc, website, phone, email, image_url, photos, tags, rating, review_count, events_attended, premium, verified, status, payment_status, stripe_payment_id, founded_year, views, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26)
         ON CONFLICT (slug) DO NOTHING`,
        [v.id, v.user_id||null, v.business_name||'', v.slug||'', v.category||'', v.city||'', v.country||'', v.description||'', v.short_desc||null, v.website||'', v.phone||'', v.email||'', v.image_url||'', v.photos||'[]', v.tags||'{}', v.rating||0, v.review_count||0, v.events_attended||0, v.premium||0, v.verified||0, v.status||'pending', v.payment_status||'unpaid', v.stripe_payment_id||null, v.founded_year||null, v.views||0, v.created_at||new Date()]
      );
      vendorCount++;
    } catch(e) { console.log('  ⚠️ Vendor skip:', v.slug, e.message); }
  }
  console.log('✅ Vendors:', vendorCount);

  // Articles
  console.log('\n📰 Migrating articles...');
  const articles = sqlite.prepare('SELECT * FROM articles').all();
  let articleCount = 0;
  for (const a of articles) {
    try {
      await pg.query(
        `INSERT INTO articles (id, title, slug, category, content, excerpt, image_url, author, status, views, tags, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
         ON CONFLICT (slug) DO NOTHING`,
        [a.id, a.title||'', a.slug||'', a.category||'', a.content||'', a.excerpt||'', a.image_url||'', a.author||'Festmore Editorial', a.status||'published', a.views||0, a.tags||'', a.created_at||new Date()]
      );
      articleCount++;
    } catch(e) { console.log('  ⚠️ Article skip:', a.slug, e.message); }
  }
  console.log('✅ Articles:', articleCount);

  // Subscribers
  console.log('\n📧 Migrating subscribers...');
  const subscribers = sqlite.prepare('SELECT * FROM subscribers').all();
  let subCount = 0;
  for (const s of subscribers) {
    try {
      await pg.query(
        'INSERT INTO subscribers (id, email, name, country, active, created_at) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (email) DO NOTHING',
        [s.id, s.email||'', s.name||'', s.country||'', s.active||1, s.created_at||new Date()]
      );
      subCount++;
    } catch(e) {}
  }
  console.log('✅ Subscribers:', subCount);

  // Payments
  console.log('\n💳 Migrating payments...');
  const payments = sqlite.prepare('SELECT * FROM payments').all();
  for (const p of payments) {
    try {
      await pg.query(
        'INSERT INTO payments (id, stripe_session_id, amount, type, status, reference_id, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (stripe_session_id) DO NOTHING',
        [p.id, p.stripe_session_id||'', p.amount||0, p.type||'', p.status||'pending', p.reference_id||null, p.created_at||new Date()]
      );
    } catch(e) {}
  }
  console.log('✅ Payments:', payments.length);

  // Fix sequences so new inserts get correct IDs
  console.log('\n🔧 Fixing sequences...');
  await pg.query(`SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 1))`);
  await pg.query(`SELECT setval('events_id_seq', COALESCE((SELECT MAX(id) FROM events), 1))`);
  await pg.query(`SELECT setval('vendors_id_seq', COALESCE((SELECT MAX(id) FROM vendors), 1))`);
  await pg.query(`SELECT setval('articles_id_seq', COALESCE((SELECT MAX(id) FROM articles), 1))`);
  await pg.query(`SELECT setval('subscribers_id_seq', COALESCE((SELECT MAX(id) FROM subscribers), 1))`);
  await pg.query(`SELECT setval('payments_id_seq', COALESCE((SELECT MAX(id) FROM payments), 1))`);

  console.log('\n🎉 MIGRATION COMPLETE!');
  console.log('Events:      ' + eventCount);
  console.log('Vendors:     ' + vendorCount);
  console.log('Articles:    ' + articleCount);
  console.log('Subscribers: ' + subCount);
  console.log('Users:       ' + users.length);

  await pg.end();
  sqlite.close();
}

migrate().catch(err => {
  console.error('❌ Migration failed:', err.message);
  process.exit(1);
});
