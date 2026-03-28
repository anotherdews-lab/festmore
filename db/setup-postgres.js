// db/setup-postgres.js
// Creates all Festmore tables in PostgreSQL
// Run once after adding PostgreSQL to Railway
// This replaces db/setup.js for PostgreSQL

const { Client } = require('pg');

async function setup() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  console.log('✅ Connected to PostgreSQL');

  await client.query(`

-- USERS
CREATE TABLE IF NOT EXISTS users (
  id                    SERIAL PRIMARY KEY,
  email                 TEXT UNIQUE NOT NULL,
  password              TEXT NOT NULL,
  name                  TEXT NOT NULL,
  role                  TEXT DEFAULT 'visitor',
  avatar                TEXT,
  country               TEXT,
  bio                   TEXT,
  website               TEXT,
  stripe_customer_id    TEXT,
  subscription_status   TEXT DEFAULT 'free',
  subscription_expires  TEXT,
  email_verified        INTEGER DEFAULT 0,
  created_at            TEXT DEFAULT to_char(now(), 'YYYY-MM-DD HH24:MI:SS'),
  updated_at            TEXT DEFAULT to_char(now(), 'YYYY-MM-DD HH24:MI:SS')
);

-- EVENTS
CREATE TABLE IF NOT EXISTS events (
  id             SERIAL PRIMARY KEY,
  user_id        INTEGER REFERENCES users(id),
  title          TEXT NOT NULL,
  slug           TEXT UNIQUE NOT NULL,
  category       TEXT NOT NULL,
  city           TEXT NOT NULL,
  country        TEXT NOT NULL,
  address        TEXT,
  start_date     TEXT NOT NULL,
  end_date       TEXT,
  date_display   TEXT,
  description    TEXT,
  short_desc     TEXT,
  website        TEXT,
  ticket_url     TEXT,
  price_display  TEXT DEFAULT 'Free',
  price_from     INTEGER DEFAULT 0,
  attendees      INTEGER DEFAULT 0,
  vendor_spots   INTEGER DEFAULT 0,
  image_url      TEXT,
  photos         TEXT,
  tags           TEXT,
  featured       INTEGER DEFAULT 0,
  status         TEXT DEFAULT 'pending',
  payment_status TEXT DEFAULT 'unpaid',
  stripe_payment_id TEXT,
  views          INTEGER DEFAULT 0,
  source         TEXT DEFAULT 'manual',
  meta_title     TEXT,
  meta_desc      TEXT,
  opening_hours  TEXT,
  headliners     TEXT,
  highlights     TEXT,
  instagram      TEXT,
  facebook       TEXT,
  video_url      TEXT,
  created_at     TEXT DEFAULT to_char(now(), 'YYYY-MM-DD HH24:MI:SS'),
  updated_at     TEXT DEFAULT to_char(now(), 'YYYY-MM-DD HH24:MI:SS')
);

-- VENDORS
CREATE TABLE IF NOT EXISTS vendors (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER REFERENCES users(id),
  business_name   TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  category        TEXT NOT NULL,
  city            TEXT NOT NULL,
  country         TEXT NOT NULL,
  description     TEXT,
  short_desc      TEXT,
  website         TEXT,
  phone           TEXT,
  email           TEXT,
  image_url       TEXT,
  photos          TEXT,
  tags            TEXT,
  rating          REAL DEFAULT 0,
  review_count    INTEGER DEFAULT 0,
  events_attended INTEGER DEFAULT 0,
  premium         INTEGER DEFAULT 0,
  verified        INTEGER DEFAULT 0,
  status          TEXT DEFAULT 'pending',
  payment_status  TEXT DEFAULT 'unpaid',
  stripe_payment_id TEXT,
  founded_year    INTEGER,
  views           INTEGER DEFAULT 0,
  created_at      TEXT DEFAULT to_char(now(), 'YYYY-MM-DD HH24:MI:SS'),
  updated_at      TEXT DEFAULT to_char(now(), 'YYYY-MM-DD HH24:MI:SS')
);

-- ARTICLES
CREATE TABLE IF NOT EXISTS articles (
  id              SERIAL PRIMARY KEY,
  title           TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  excerpt         TEXT,
  content         TEXT NOT NULL,
  category        TEXT,
  country         TEXT,
  image_url       TEXT,
  tags            TEXT,
  meta_title      TEXT,
  meta_desc       TEXT,
  author          TEXT DEFAULT 'Festmore Editorial',
  status          TEXT DEFAULT 'published',
  source_event_id INTEGER REFERENCES events(id),
  views           INTEGER DEFAULT 0,
  created_at      TEXT DEFAULT to_char(now(), 'YYYY-MM-DD HH24:MI:SS')
);

-- PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
  id                     SERIAL PRIMARY KEY,
  user_id                INTEGER REFERENCES users(id),
  stripe_session_id      TEXT UNIQUE,
  stripe_payment_intent  TEXT,
  amount                 INTEGER NOT NULL,
  currency               TEXT DEFAULT 'eur',
  type                   TEXT NOT NULL,
  status                 TEXT DEFAULT 'pending',
  reference_id           INTEGER,
  created_at             TEXT DEFAULT to_char(now(), 'YYYY-MM-DD HH24:MI:SS')
);

-- SUBSCRIBERS
CREATE TABLE IF NOT EXISTS subscribers (
  id         SERIAL PRIMARY KEY,
  email      TEXT UNIQUE NOT NULL,
  name       TEXT,
  country    TEXT,
  categories TEXT,
  active     INTEGER DEFAULT 1,
  created_at TEXT DEFAULT to_char(now(), 'YYYY-MM-DD HH24:MI:SS')
);

-- PAGEVIEWS
CREATE TABLE IF NOT EXISTS pageviews (
  id         SERIAL PRIMARY KEY,
  path       TEXT,
  country    TEXT,
  referrer   TEXT,
  created_at TEXT DEFAULT to_char(now(), 'YYYY-MM-DD HH24:MI:SS')
);

-- APPLICATIONS
CREATE TABLE IF NOT EXISTS applications (
  id          SERIAL PRIMARY KEY,
  vendor_id   INTEGER REFERENCES vendors(id),
  event_id    INTEGER REFERENCES events(id),
  message     TEXT,
  status      TEXT DEFAULT 'pending',
  created_at  TEXT DEFAULT to_char(now(), 'YYYY-MM-DD HH24:MI:SS')
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_events_country   ON events(country);
CREATE INDEX IF NOT EXISTS idx_events_category  ON events(category);
CREATE INDEX IF NOT EXISTS idx_events_status    ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_featured  ON events(featured);
CREATE INDEX IF NOT EXISTS idx_articles_status  ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_created ON articles(created_at);
CREATE INDEX IF NOT EXISTS idx_vendors_country  ON vendors(country);
CREATE INDEX IF NOT EXISTS idx_vendors_status   ON vendors(status);

  `);

  console.log('✅ All PostgreSQL tables created!');
  await client.end();
}

setup().catch(err => {
  console.error('❌ Setup failed:', err.message);
  process.exit(1);
});