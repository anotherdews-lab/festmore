// update-polandrock-2026.js — FIXED VERSION
const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, 'db', 'festmore.db'));

const title = "Pol'and'Rock Festival 2026";

const description = `Pol and Rock Festival — known as the Most Beautiful Festival in the World — returns for its 32nd edition from 30 July to 1 August 2026 at the Czaplinek-Broczyno Airfield in northwestern Poland. With free entry for everyone and an expected crowd of up to 750,000 people, this is the largest free music festival in Europe.

2026 CONFIRMED LINEUP
Godsmack — The American hard rock legends from Massachusetts headline Pol and Rock 2026. Known for hits including I Stand Alone, Voodoo and Keep Away, Godsmack bring one of the most powerful live shows in rock music to the massive main stage. Additional artists will be announced throughout spring 2026.

Previous editions featured: Judas Priest, The Prodigy, Dropkick Murphys, Sabaton, Gojira, Arch Enemy, Skunk Anansie, Nothing But Thieves, In Flames, Ziggy Marley, Trivium and Amon Amarth.

DATES AND LOCATION
Dates: 30 July to 1 August 2026
Location: Czaplinek-Broczyno Airfield, Broczyno 45, 78-550 Czaplinek, Poland
Entry: Completely free — no tickets required
Camping: Free on-site camping available

HOW TO GET THERE
By Train: Special Music Trains run from Warsaw, Krakow, Poznan and Gdansk directly to Czaplinek during the festival.
By Car: From Berlin approximately 2.5 hours. Nearest airports are Szczecin (115km) and Poznan (150km).
Parking: Designated parking near the airfield for approximately 15-25 EUR for the full festival.

ABOUT THE FESTIVAL
Founded in 1995 by Jurek Owsiak, the festival has no VIP areas and no corporate branding. Five stages cover metal, punk, folk, reggae and electronic music. The Academy of the Finest Arts programme runs workshops and talks throughout the festival. Free entry, free camping, 750,000 people united by music.`;

const tags = JSON.stringify([
  'polandrock 2026', 'poland rock 2026', 'pol and rock 2026',
  'woodstock poland 2026', 'polandrock lineup 2026', 'godsmack',
  'free festival poland', 'czaplinek festival', 'polandrock festival 2026'
]);

const metaTitle = "Pol'and'Rock 2026 Lineup — Godsmack Confirmed | Festmore";
const metaDesc = "Pol'and'Rock Festival 2026 — 30 July to 1 August in Czaplinek, Poland. Godsmack confirmed! Free entry, 750,000 visitors. Lineup, camping and travel guide.";

try {
  const event = db.prepare(
    "SELECT * FROM events WHERE slug LIKE '%polandrock%' OR slug LIKE '%poland-rock%'"
  ).get();

  if (!event) {
    console.log('Event not found — creating it...');
    db.prepare(`
      INSERT OR IGNORE INTO events
      (title,slug,category,city,country,start_date,end_date,date_display,
       description,price_display,website,attendees,vendor_spots,image_url,
       featured,tags,meta_title,meta_desc,status,payment_status,source,views)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'active','paid','manual',0)
    `).run(
      title,'polandrock-2026','festival','Czaplinek','PL',
      '2026-07-30','2026-08-01','30 July - 1 August 2026',
      description,'Free','https://polandrock.pl',
      750000,0,
      'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&q=80',
      1,tags,metaTitle,metaDesc
    );
    console.log("✅ Created Pol'and'Rock Festival 2026!");
  } else {
    console.log('Found:', event.title, '| slug:', event.slug);
    db.prepare(`
      UPDATE events SET
        title=?, description=?, date_display=?,
        start_date=?, end_date=?, city=?, country=?,
        price_display=?, website=?, attendees=?,
        featured=1, status='active', payment_status='paid',
        image_url=?, tags=?, meta_title=?, meta_desc=?
      WHERE id=?
    `).run(
      title, description, '30 July - 1 August 2026',
      '2026-07-30', '2026-08-01', 'Czaplinek', 'PL',
      'Free', 'https://polandrock.pl', 750000,
      'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&q=80',
      tags, metaTitle, metaDesc,
      event.id
    );
    console.log("✅ Updated Pol'and'Rock Festival 2026!");
    console.log('   Lineup: Godsmack confirmed');
    console.log('   Attendance: 750,000');
    console.log('   URL: festmore.com/events/' + event.slug);
  }
} catch(err) {
  console.error('Error:', err.message);
}

db.close();
