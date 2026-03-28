// add-kløften-festival.js
// Adds Kløften Festival 2026 as a real event on Festmore

const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, 'db', 'festmore.db'));

try {
  const exists = db.prepare("SELECT id FROM events WHERE slug='kløften-festival-2026'").get()
              || db.prepare("SELECT id FROM events WHERE slug='kl-ften-festival-2026'").get()
              || db.prepare("SELECT id FROM events WHERE slug LIKE '%kl%ften%2026%'").get();

  if (exists) {
    console.log('⏭️  Kløften Festival already exists, skipping');
    db.close();
    process.exit(0);
  }

  db.prepare(`
    INSERT OR IGNORE INTO events (
      title, slug, category, city, country,
      start_date, end_date, date_display,
      description, price_display, website,
      attendees, vendor_spots, image_url, featured,
      tags, meta_title, meta_desc,
      status, payment_status, source, views
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'active','paid','manual',0)
  `).run(
    'Kløften Festival 2026',
    'kloeften-festival-2026',
    'festival',
    'Haderslev',
    'DK',
    '2026-06-25',
    '2026-06-27',
    '25–27 June 2026',
    `Kløften Festival is one of Denmark's most beloved summer festivals, held in the beautiful natural surroundings near Haderslev in Southern Jutland. Now in its latest edition, Kløften brings together thousands of festival-goers for three days of live music, entertainment, food and community in a spectacular outdoor setting.

The festival is known for its warm, inclusive atmosphere and its commitment to delivering a high-quality experience for visitors of all ages. With multiple stages featuring both established Danish artists and exciting new acts, Kløften has earned its reputation as one of the highlights of the Danish summer festival calendar.

Food is a central part of the Kløften experience — the festival hosts a diverse range of food vendors including authentic Asian street food, traditional Danish food, international cuisine and much more. The food village is one of the most popular areas of the festival grounds.

The festival takes place on the legendary Kløften festival grounds near Haderslev, which offer excellent infrastructure for vendors and visitors alike. Camping is available on-site, and the festival is easily accessible from both Haderslev and the wider Southern Jutland region.

Vendor spots are available for food trucks and market stalls — contact the organisers directly for applications. The deadline for vendor applications is 1 May 2026.`,
    'From DKK 495',
    'https://www.kloften.dk',
    15000,
    40,
    'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80',
    1,
    JSON.stringify(['kløften festival','kløften 2026','festival haderslev','dansk festival','southern jutland festival','festival denmark 2026']),
    'Kløften Festival 2026 Haderslev — Dates, Tickets & Info | Festmore',
    'Kløften Festival 2026 — 25–27 June in Haderslev, Denmark. Live music, food vendors and 3 days of summer festival fun in Southern Jutland. Tickets and info.',
  );

  console.log('✅ Kløften Festival 2026 added successfully!');
  console.log('   festmore.com/events/kloeften-festival-2026');

} catch(err) {
  console.error('❌ Error adding Kløften Festival:', err.message);
}

db.close();
