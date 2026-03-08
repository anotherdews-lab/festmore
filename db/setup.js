// db/setup.js
// This file creates your entire database structure
// Run once with: node db/setup.js

const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'festmore.db'));

console.log('🗄️  Setting up Festmore database...');

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`

-- ═══════════════════════════
-- USERS TABLE
-- Stores all registered users
-- ═══════════════════════════
CREATE TABLE IF NOT EXISTS users (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  email       TEXT UNIQUE NOT NULL,
  password    TEXT NOT NULL,
  name        TEXT NOT NULL,
  role        TEXT DEFAULT 'visitor',   -- visitor, organiser, vendor, admin
  avatar      TEXT,
  country     TEXT,
  bio         TEXT,
  website     TEXT,
  stripe_customer_id TEXT,
  subscription_status TEXT DEFAULT 'free', -- free, active, cancelled
  subscription_expires TEXT,
  email_verified INTEGER DEFAULT 0,
  created_at  TEXT DEFAULT (datetime('now')),
  updated_at  TEXT DEFAULT (datetime('now'))
);

-- ═══════════════════════════
-- EVENTS TABLE
-- ═══════════════════════════
CREATE TABLE IF NOT EXISTS events (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER REFERENCES users(id),
  title       TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  category    TEXT NOT NULL,
  city        TEXT NOT NULL,
  country     TEXT NOT NULL,
  address     TEXT,
  start_date  TEXT NOT NULL,
  end_date    TEXT,
  date_display TEXT,
  description TEXT,
  short_desc  TEXT,
  website     TEXT,
  ticket_url  TEXT,
  price_display TEXT DEFAULT 'Free',
  price_from  INTEGER DEFAULT 0,
  attendees   INTEGER DEFAULT 0,
  vendor_spots INTEGER DEFAULT 0,
  image_url   TEXT,
  tags        TEXT,           -- JSON array stored as text
  featured    INTEGER DEFAULT 0,
  status      TEXT DEFAULT 'pending',  -- pending, active, rejected
  payment_status TEXT DEFAULT 'unpaid', -- unpaid, paid
  stripe_payment_id TEXT,
  views       INTEGER DEFAULT 0,
  source      TEXT DEFAULT 'manual',  -- manual, ai_generated, scraped
  created_at  TEXT DEFAULT (datetime('now')),
  updated_at  TEXT DEFAULT (datetime('now'))
);

-- ═══════════════════════════
-- VENDORS TABLE
-- ═══════════════════════════
CREATE TABLE IF NOT EXISTS vendors (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER REFERENCES users(id),
  business_name TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  category    TEXT NOT NULL,
  city        TEXT NOT NULL,
  country     TEXT NOT NULL,
  description TEXT,
  short_desc  TEXT,
  website     TEXT,
  phone       TEXT,
  email       TEXT,
  image_url   TEXT,
  tags        TEXT,
  rating      REAL DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  events_attended INTEGER DEFAULT 0,
  premium     INTEGER DEFAULT 0,
  verified    INTEGER DEFAULT 0,
  status      TEXT DEFAULT 'pending',
  payment_status TEXT DEFAULT 'unpaid',
  stripe_payment_id TEXT,
  founded_year INTEGER,
  views       INTEGER DEFAULT 0,
  created_at  TEXT DEFAULT (datetime('now')),
  updated_at  TEXT DEFAULT (datetime('now'))
);

-- ═══════════════════════════
-- ARTICLES TABLE
-- AI writes these automatically
-- ═══════════════════════════
CREATE TABLE IF NOT EXISTS articles (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  excerpt     TEXT,
  content     TEXT NOT NULL,
  category    TEXT,
  country     TEXT,
  image_url   TEXT,
  tags        TEXT,
  meta_title  TEXT,
  meta_desc   TEXT,
  author      TEXT DEFAULT 'Festmore Editorial',
  status      TEXT DEFAULT 'published',
  source_event_id INTEGER REFERENCES events(id),
  views       INTEGER DEFAULT 0,
  created_at  TEXT DEFAULT (datetime('now'))
);

-- ═══════════════════════════
-- PAYMENTS TABLE
-- Every payment recorded here
-- ═══════════════════════════
CREATE TABLE IF NOT EXISTS payments (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER REFERENCES users(id),
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent TEXT,
  amount      INTEGER NOT NULL,
  currency    TEXT DEFAULT 'eur',
  type        TEXT NOT NULL,  -- event_listing, vendor_profile
  status      TEXT DEFAULT 'pending',
  reference_id INTEGER,       -- event_id or vendor_id
  created_at  TEXT DEFAULT (datetime('now'))
);

-- ═══════════════════════════
-- NEWSLETTER SUBSCRIBERS
-- ═══════════════════════════
CREATE TABLE IF NOT EXISTS subscribers (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  email       TEXT UNIQUE NOT NULL,
  name        TEXT,
  country     TEXT,
  categories  TEXT,
  active      INTEGER DEFAULT 1,
  created_at  TEXT DEFAULT (datetime('now'))
);

-- ═══════════════════════════
-- PAGE VIEWS / ANALYTICS
-- ═══════════════════════════
CREATE TABLE IF NOT EXISTS pageviews (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  path        TEXT,
  country     TEXT,
  referrer    TEXT,
  created_at  TEXT DEFAULT (datetime('now'))
);

-- ═══════════════════════════
-- INDEXES FOR FAST SEARCH
-- ═══════════════════════════
CREATE INDEX IF NOT EXISTS idx_events_country   ON events(country);
CREATE INDEX IF NOT EXISTS idx_events_category  ON events(category);
CREATE INDEX IF NOT EXISTS idx_events_status    ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_featured  ON events(featured);
CREATE INDEX IF NOT EXISTS idx_articles_status  ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_created ON articles(created_at);
CREATE INDEX IF NOT EXISTS idx_vendors_country  ON vendors(country);
CREATE INDEX IF NOT EXISTS idx_vendors_status   ON vendors(status);

`);

// ═══════════════════════════
// SEED SAMPLE DATA
// So the site looks good from day 1
// ═══════════════════════════
const sampleEvents = [
  { title:'Berlin Christmas Market', slug:'berlin-christmas-market-2025', category:'christmas', city:'Berlin', country:'DE', date_display:'Nov 27 – Dec 24, 2025', start_date:'2025-11-27', description:'Berlin\'s legendary Christmas Market transforms the city\'s historic squares into a magical winter wonderland. Over 200 traditional wooden stalls sell handcrafted gifts, mulled wine, and festive food from across Germany. Voted Europe\'s best Christmas market three years running.', price_display:'Free', attendees:120000, vendor_spots:200, featured:1, status:'active', payment_status:'paid', tags:'["christmas market","Berlin","Germany","winter","festive","free event"]', source:'manual' },
  { title:'Copenhagen Jazz Festival', slug:'copenhagen-jazz-festival-2025', category:'concert', city:'Copenhagen', country:'DK', date_display:'Jul 4–13, 2025', start_date:'2025-07-04', description:'One of Europe\'s largest jazz festivals fills Copenhagen\'s streets, clubs and concert halls with world-class musicians for 10 incredible days. Over 1,000 concerts across 130 venues make this an unmissable summer event.', price_display:'€10–€90', attendees:85000, vendor_spots:45, featured:1, status:'active', payment_status:'paid', tags:'["jazz","Copenhagen","Denmark","music festival","summer"]', source:'manual' },
  { title:'Hamburg Harbour Birthday', slug:'hamburg-harbour-birthday-2025', category:'festival', city:'Hamburg', country:'DE', date_display:'May 8–11, 2025', start_date:'2025-05-08', description:'The world\'s biggest harbour festival celebrates Hamburg\'s maritime heritage with spectacular tall ships, live music and non-stop entertainment. Over 300 vessels from around the globe gather on the Elbe for this legendary event.', price_display:'Free', attendees:250000, vendor_spots:150, featured:1, status:'active', payment_status:'paid', tags:'["harbour","Hamburg","Germany","ships","free festival"]', source:'manual' },
  { title:'London Borough Market', slug:'london-borough-market', category:'market', city:'London', country:'GB', date_display:'Every Weekend', start_date:'2025-01-01', description:'London\'s most celebrated food market near London Bridge has operated since 1756, offering the finest artisan produce from around the world. From farmhouse cheeses to street food from every continent — a foodie paradise in the heart of the city.', price_display:'Free', attendees:15000, vendor_spots:100, featured:0, status:'active', payment_status:'paid', tags:'["food market","London","UK","artisan","free","Borough Market"]', source:'manual' },
  { title:'Paris Nuit Blanche', slug:'paris-nuit-blanche-2025', category:'city', city:'Paris', country:'FR', date_display:'Oct 4–5, 2025', start_date:'2025-10-04', description:'Paris\'s legendary all-night art festival transforms museums, parks and streets into free open-air art installations until dawn. An unmissable cultural night celebrating creativity across the City of Light.', price_display:'Free', attendees:300000, vendor_spots:0, featured:1, status:'active', payment_status:'paid', tags:'["art festival","Paris","France","night festival","free event"]', source:'manual' },
  { title:'Frankfurt Book Fair', slug:'frankfurt-book-fair-2025', category:'messe', city:'Frankfurt', country:'DE', date_display:'Oct 15–19, 2025', start_date:'2025-10-15', description:'The world\'s most important trade fair for publishing and media draws over 7,000 exhibitors from 100+ countries. A defining annual event for the global book industry with public days open to everyone.', price_display:'€18', attendees:300000, vendor_spots:400, featured:1, status:'active', payment_status:'paid', tags:'["book fair","Frankfurt","Germany","publishing","trade fair","messe"]', source:'manual' },
  { title:'Dubai Shopping Festival', slug:'dubai-shopping-festival-2026', category:'city', city:'Dubai', country:'AE', date_display:'Jan 15 – Feb 14, 2026', start_date:'2026-01-15', description:'The world\'s largest retail extravaganza transforms Dubai into a shopper\'s paradise with massive discounts, live concerts and spectacular daily fireworks. Drawing millions of visitors from 180 countries each year.', price_display:'Free', attendees:500000, vendor_spots:300, featured:1, status:'active', payment_status:'paid', tags:'["shopping festival","Dubai","UAE","retail","entertainment","free entry"]', source:'manual' },
  { title:'Cologne Carnival', slug:'cologne-carnival-2026', category:'city', city:'Cologne', country:'DE', date_display:'Feb 27 – Mar 4, 2026', start_date:'2026-02-27', description:'Germany\'s most spectacular street party transforms Cologne for six unforgettable days known as the fifth season. Over one million visitors in elaborate costumes fill the streets for the legendary Rose Monday parade.', price_display:'Free', attendees:800000, vendor_spots:300, featured:1, status:'active', payment_status:'paid', tags:'["carnival","Cologne","Germany","street party","Karneval","free"]', source:'manual' },
  { title:'Amsterdam Tulip Market', slug:'amsterdam-tulip-market-2025', category:'market', city:'Amsterdam', country:'NL', date_display:'Mar 15 – Apr 30, 2025', start_date:'2025-03-15', description:'The world-famous Bloemenmarkt — the only floating flower market on earth — bursts into colour during tulip season on Amsterdam\'s historic canals. Thousands of varieties of Dutch bulbs and flowers available direct from growers.', price_display:'Free', attendees:40000, vendor_spots:60, featured:0, status:'active', payment_status:'paid', tags:'["flower market","Amsterdam","Netherlands","tulips","spring","free"]', source:'manual' },
  { title:'New York Comic Con', slug:'new-york-comic-con-2025', category:'comics', city:'New York', country:'US', date_display:'Oct 9–12, 2025', start_date:'2025-10-09', description:'One of the world\'s largest pop culture conventions fills the Jacob Javits Center with thousands of exhibitors, celebrity panels and incredible cosplay. A four-day celebration of comics, TV, film and gaming culture.', price_display:'$35–$80', attendees:200000, vendor_spots:500, featured:1, status:'active', payment_status:'paid', tags:'["comic con","New York","USA","pop culture","cosplay","gaming"]', source:'manual' },
];

const insertEvent = db.prepare(`
  INSERT OR IGNORE INTO events
  (title,slug,category,city,country,date_display,start_date,description,price_display,attendees,vendor_spots,featured,status,payment_status,tags,source)
  VALUES
  (@title,@slug,@category,@city,@country,@date_display,@start_date,@description,@price_display,@attendees,@vendor_spots,@featured,@status,@payment_status,@tags,@source)
`);

sampleEvents.forEach(e => insertEvent.run(e));

// Sample articles
const sampleArticles = [
  {
    title: 'Top 10 Christmas Markets in Europe for 2025',
    slug: 'top-10-christmas-markets-europe-2025',
    excerpt: 'From Berlin to Vienna, Prague to Edinburgh — we rank the best Christmas markets in Europe this winter season.',
    content: `# Top 10 Christmas Markets in Europe for 2025\n\nAs winter approaches, Europe's most magical tradition returns: the Christmas market season. Whether you're looking for handcrafted gifts, mulled wine, festive food or simply the warm glow of thousands of fairy lights, there is no better place to be than a European Christmas market in December.\n\n## 1. Berlin, Germany\nBerlin hosts over 80 Christmas markets across the city, making it the ultimate destination for market lovers. The Gendarmenmarkt market is widely regarded as the most beautiful, set between two magnificent cathedrals in the heart of the city.\n\n## 2. Vienna, Austria\nVienna's Christkindlmarkt at Rathausplatz is one of the oldest in the world, dating back to 1298. The neo-Gothic City Hall provides a stunning backdrop for over 150 stalls.\n\n## 3. Strasbourg, France\nKnown as the Capital of Christmas, Strasbourg's market is the oldest in France, running since 1570. Over 300 wooden chalets fill the cobbled streets of the historic Grande Île.\n\n## 4. Prague, Czech Republic\nOld Town Square transforms into a fairy-tale setting with a towering Christmas tree and dozens of wooden stalls selling traditional Czech crafts, trdelník pastry and mulled wine.\n\n## 5. Cologne, Germany\nCologne runs six different Christmas markets simultaneously, with the one at the Dom Cathedral being the most iconic — the Gothic spires looming dramatically above the festive stalls.\n\nPlan your visit early and book accommodation months in advance — these events sell out fast!`,
    category: 'christmas',
    country: 'EU',
    image_url: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=800&q=75',
    tags: '["christmas markets","Europe","Germany","winter travel","festivals 2025"]',
    meta_title: 'Top 10 Christmas Markets in Europe 2025 | Festmore',
    meta_desc: 'Discover the best Christmas markets in Europe for 2025. From Berlin to Vienna, find the most magical festive markets with our expert guide.',
    status: 'published',
    author: 'Festmore Editorial'
  },
  {
    title: 'Best Free Festivals in Germany 2025 — The Complete Guide',
    slug: 'best-free-festivals-germany-2025',
    excerpt: 'Enjoy Germany\'s best festivals without spending a euro on entry. Our complete guide to free events across the country.',
    content: `# Best Free Festivals in Germany 2025 — The Complete Guide\n\nGermany is home to some of the world's greatest festivals, and the best news? Many of the most spectacular ones are completely free to attend. Here's your guide to the best free festivals in Germany in 2025.\n\n## Hamburg Harbour Birthday (May)\nThe world's largest harbour festival is completely free. Hundreds of tall ships gather on the Elbe, with fireworks, live music and street food everywhere.\n\n## Berlin Festival of Lights (October)\nThe German capital transforms into a breathtaking open-air gallery as iconic buildings are lit up with spectacular projections. Walk freely through the city taking it all in.\n\n## Cologne Carnival (February)\nWhile some events inside cost money, the legendary Rose Monday street parade and most of the outdoor celebrations are free for everyone.\n\n## Rhine in Flames (Various dates)\nFive separate castle-and-fireworks events along the Rhine. Many viewing spots along the riverbank are free.\n\n## Tips for Free Festival-Going in Germany\n- Most German city festivals have free entry to the grounds — you just pay for food and drinks\n- Book accommodation 6+ months in advance for popular events\n- Use Germany's excellent train network to hop between cities\n- Download the DB Navigator app for easy train booking`,
    category: 'festival',
    country: 'DE',
    image_url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=75',
    tags: '["free festivals","Germany","Hamburg","Berlin","Cologne","budget travel"]',
    meta_title: 'Best Free Festivals in Germany 2025 | Festmore',
    meta_desc: 'Complete guide to the best free festivals in Germany 2025. From Hamburg\'s Harbour Birthday to Cologne Carnival — amazing events that cost nothing to enter.',
    status: 'published',
    author: 'Festmore Editorial'
  },
];

const insertArticle = db.prepare(`
  INSERT OR IGNORE INTO articles
  (title,slug,excerpt,content,category,country,image_url,tags,meta_title,meta_desc,status,author)
  VALUES
  (@title,@slug,@excerpt,@content,@category,@country,@image_url,@tags,@meta_title,@meta_desc,@status,@author)
`);

sampleArticles.forEach(a => insertArticle.run(a));

console.log('✅ Database created with sample data!');
console.log('   Tables: users, events, vendors, articles, payments, subscribers');
console.log(`   Sample events: ${sampleEvents.length}`);
console.log(`   Sample articles: ${sampleArticles.length}`);
console.log('\n🚀 Ready to start! Run: npm run dev');

db.close();
