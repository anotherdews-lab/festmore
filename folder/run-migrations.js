// run-migrations.js
// Run once to add reviews table and organiser features
// node run-migrations.js

const { Client } = require('pg');
const PG_URL = 'postgresql://postgres:VWgjvXynowzYucOsfqNNAPWojptOHaXJ@gondola.proxy.rlwy.net:47003/railway';

async function migrate() {
  const client = new Client({ connectionString: PG_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log('✅ Connected\n');

  // Reviews table
  await client.query(`
    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      vendor_id INTEGER NOT NULL,
      event_id INTEGER,
      reviewer_name TEXT NOT NULL,
      reviewer_email TEXT,
      reviewer_role TEXT DEFAULT 'Event Organiser',
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      title TEXT,
      body TEXT NOT NULL,
      verified BOOLEAN DEFAULT false,
      status TEXT DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log('✅ Reviews table ready');

  // Newsletter campaigns table
  await client.query(`
    CREATE TABLE IF NOT EXISTS newsletter_campaigns (
      id SERIAL PRIMARY KEY,
      subject TEXT NOT NULL,
      body_html TEXT NOT NULL,
      status TEXT DEFAULT 'draft',
      sent_count INTEGER DEFAULT 0,
      sent_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log('✅ Newsletter campaigns table ready');

  // Add avg_rating and review_count to vendors if not exists
  try {
    await client.query(`ALTER TABLE vendors ADD COLUMN IF NOT EXISTS avg_rating DECIMAL(3,2) DEFAULT 5.0`);
    await client.query(`ALTER TABLE vendors ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0`);
    await client.query(`ALTER TABLE vendors ADD COLUMN IF NOT EXISTS total_applications INTEGER DEFAULT 0`);
    console.log('✅ Vendor columns added');
  } catch(e) { console.log('⚠️ Vendor columns:', e.message); }

  // Add organiser_email to events if not exists
  try {
    await client.query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS organiser_email TEXT`);
    await client.query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS organiser_name TEXT`);
    console.log('✅ Event organiser columns added');
  } catch(e) { console.log('⚠️ Event columns:', e.message); }

  console.log('\n🎉 All migrations complete!');
  await client.end();
}

migrate().catch(console.error);
