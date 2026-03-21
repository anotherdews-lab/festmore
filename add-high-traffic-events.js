// add-high-traffic-events.js
// Adds Pol'and'Rock 2026, Woodstock Poland and other high-traffic events
// These are the events people are already searching for on Google

const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, 'db', 'festmore.db'));

const slugify = (str) => str.toLowerCase()
  .replace(/[^a-z0-9\s-]/g, '')
  .replace(/\s+/g, '-')
  .replace(/-+/g, '-')
  .trim();

const events = [
  {
    title: "Pol'and'Rock Festival 2026",
    slug: 'polandrock-festival-2026',
    category: 'festival',
    city: 'Kostrzyn nad Odrą',
    country: 'PL',
    start_date: '2026-07-30',
    end_date: '2026-08-01',
    date_display: 'Jul 30 – Aug 1, 2026',
    description: `Pol'and'Rock Festival — formerly known as Woodstock Poland — is the largest free music festival in Europe and one of the most extraordinary events on earth. Every summer, up to 750,000 people gather at the festival site for three days of rock, metal, indie and alternative music across five stages — all completely free of charge.

The festival was founded in 1995 by Jurek Owsiak as a gesture of gratitude to the volunteers of Poland's Great Orchestra of Christmas Charity. Inspired by the original 1969 Woodstock, it has grown into one of the world's most remarkable cultural events — a gathering defined by freedom, tolerance, brotherhood and above all, music.

The 2026 edition takes place at Czaplinek Lotnisko Broczyno in the Zachodniopomorskie region of Poland from 30 July to 1 August. Previous headliners have included Judas Priest, The Prodigy, Gojira, Arch Enemy, In Flames, Ziggy Marley, Gogol Bordello and hundreds of other major international and Polish acts.

What makes Pol'and'Rock truly unique is its audience — half a million passionate music lovers who camp on site, creating a temporary community with its own culture, values and extraordinary atmosphere. The Academy of Arts offers workshops, lectures and cultural activities alongside the main music programme. Entry is completely free — there are no tickets.`,
    price_display: 'Free',
    attendees: 750000,
    vendor_spots: 500,
    website: 'https://en.polandrockfestival.pl',
    featured: 1,
    image_url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200&q=80',
    tags: JSON.stringify(['polandrock 2026', 'woodstock poland', 'pol and rock', 'free festival', 'poland', 'rock festival', 'kostrzyn', 'jurek owsiak']),
    meta_title: "Pol'and'Rock Festival 2026 — Woodstock Poland | Festmore",
    meta_desc: "Pol'and'Rock Festival 2026 (Woodstock Poland): Jul 30 – Aug 1. Europe's largest free music festival with 750,000 visitors. Dates, lineup and visitor guide.",
  },
  {
    title: "Pol'and'Rock Festival 2025 — Review and What to Expect",
    slug: 'polandrock-festival-2025',
    category: 'festival',
    city: 'Czaplinek',
    country: 'PL',
    start_date: '2025-08-01',
    end_date: '2025-08-03',
    date_display: 'Aug 1–3, 2025',
    description: `Pol'and'Rock Festival 2025 — previously known as Woodstock Poland — continued the tradition of being Europe's greatest free music festival. Held at Lotnisko Czaplinek-Broczyno in northern Poland, the festival drew over half a million visitors for three days of rock, metal and alternative music.

The 2025 edition maintained the festival's core values of love, freedom, tolerance and brotherhood — the principles that have defined Pol'and'Rock since its founding by Jurek Owsiak in 1995. Five stages hosted an eclectic mix of international headliners and Polish acts, with the Academy of Arts running parallel cultural programming throughout the weekend.

The festival remains completely free to attend — no tickets, no entry fee. Camping is available on site for the hundreds of thousands of festival-goers who make the journey to northern Poland for what many consider the world's greatest festival experience.`,
    price_display: 'Free',
    attendees: 500000,
    vendor_spots: 400,
    website: 'https://en.polandrockfestival.pl',
    featured: 0,
    image_url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&q=80',
    tags: JSON.stringify(['polandrock 2025', 'woodstock poland 2025', 'pol and rock 2025', 'free festival poland', 'czaplinek']),
    meta_title: "Pol'and'Rock Festival 2025 — Woodstock Poland Review | Festmore",
    meta_desc: "Pol'and'Rock Festival 2025 review and guide. Europe's largest free music festival in Czaplinek, Poland. What happened and what to expect in 2026.",
  },
  {
    title: 'Garbage Band Live in Europe 2026',
    slug: 'garbage-festival-europe-2026',
    category: 'concert',
    city: 'Multiple Cities',
    country: 'GB',
    start_date: '2026-06-01',
    end_date: '2026-09-30',
    date_display: 'Summer 2026 Tour',
    description: `Garbage — the iconic alternative rock band fronted by Shirley Manson — are touring Europe in 2026, bringing their unique blend of alt-rock, electronic and grunge to festival stages and arenas across the continent. The band, also featuring Butch Vig, Steve Marker and Duke Erikson, are known for their spectacular live shows and decades of classic songs including Stupid Girl, Only Happy When It Rains, Push It and I Think I'm Paranoid.

Garbage have a long history of European festival appearances, including multiple performances at Pol'and'Rock (Woodstock Poland), Glastonbury and other major European events. Their 2026 European tour dates and festival appearances are expected to include stops across the UK, Germany, Poland, France and Scandinavia.

Check the official Garbage website and Festmore for confirmed dates and tickets as they are announced.`,
    price_display: '€35–€85',
    attendees: 5000,
    vendor_spots: 0,
    website: 'https://www.garbage.com',
    featured: 0,
    image_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&q=80',
    tags: JSON.stringify(['garbage', 'garbage band', 'garbage festival', 'shirley manson', 'alternative rock', 'europe tour 2026']),
    meta_title: 'Garbage Band European Tour 2026 — Dates and Festival Appearances | Festmore',
    meta_desc: "Garbage band's European festival appearances and tour dates 2026. Find Garbage concert dates, festival appearances and tickets across Europe.",
  },
  {
    title: 'Vlaggetjesdag Scheveningen 2026',
    slug: 'vlaggetjesdag-scheveningen-2026',
    category: 'city',
    city: 'Scheveningen',
    country: 'NL',
    start_date: '2026-06-06',
    end_date: '2026-06-07',
    date_display: 'Jun 6–7, 2026',
    description: `Vlaggetjesdag — Flag Day — is one of the Netherlands' most beloved and unique annual celebrations, marking the start of the herring fishing season in the historic fishing port of Scheveningen, the beach resort attached to The Hague. The festival has been celebrated for over a century and represents one of the most authentic expressions of Dutch coastal culture and tradition.

The celebration begins when the first new herring of the season arrives at the harbour, traditionally raced from the North Sea fishing grounds at top speed to be the first to deliver the new catch. The harbour fills with traditional fishing vessels dressed with flags and bunting, while the quayside hosts stalls selling the iconic Dutch treat of raw nieuwe haring — new herring eaten by hand, whole, with onions and pickles.

Vlaggetjesdag 2026 takes place on the weekend of 6-7 June in Scheveningen harbour, with the traditional fishing fleet parade, music, street food, craft stalls and the unique atmosphere of a Dutch harbour festival that has barely changed in a century. For visitors to The Hague and the Dutch coast, it is one of the unmissable events of the year.`,
    price_display: 'Free',
    attendees: 100000,
    vendor_spots: 150,
    website: 'https://www.vlaggetjesdag.com',
    featured: 0,
    image_url: 'https://images.unsplash.com/photo-1467803738586-46b7eb7b16a1?w=1200&q=80',
    tags: JSON.stringify(['vlaggetjesdag', 'scheveningen 2026', 'herring festival', 'netherlands', 'the hague', 'flag day', 'fishing']),
    meta_title: 'Vlaggetjesdag Scheveningen 2026 — Dutch Herring Festival | Festmore',
    meta_desc: 'Vlaggetjesdag Scheveningen 2026: Jun 6-7. The Netherlands\' beloved Flag Day herring festival in Scheveningen harbour. Free entry, traditional fishing fleet and nieuwe haring.',
  },
  {
    title: 'Rock am Ring 2026',
    slug: 'rock-am-ring-2026',
    category: 'festival',
    city: 'Nürburg',
    country: 'DE',
    start_date: '2026-06-05',
    end_date: '2026-06-07',
    date_display: 'Jun 5–7, 2026',
    description: `Rock am Ring is Germany's most iconic rock music festival, held at the legendary Nürburgring motor racing circuit in the Eifel region of western Germany since 1985. The festival draws 90,000 fans per day to the spectacular racing circuit setting for three days of rock, metal and alternative music featuring the world's biggest acts.

The festival runs simultaneously with Rock im Park in Nuremberg, with the same lineup playing both venues on the same weekend. Previous headliners have included Rammstein, Metallica, Foo Fighters, Die Toten Hosen, Bring Me the Horizon, System of a Down and virtually every major rock act of the past four decades.

The Nürburgring setting — with its combination of racing circuit infrastructure, dramatic Eifel landscape and the history of German motorsport — gives Rock am Ring a distinctive character that no other European festival can replicate. The infield of the circuit becomes a vast camping city for the weekend, with the main stages set against the backdrop of the famous track.`,
    price_display: '€180–€260',
    attendees: 90000,
    vendor_spots: 200,
    website: 'https://www.rock-am-ring.com',
    featured: 1,
    image_url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200&q=80',
    tags: JSON.stringify(['rock am ring 2026', 'germany', 'nurburgring', 'rock festival', 'metal', 'nürburg']),
    meta_title: 'Rock am Ring 2026 — Germany\'s Most Iconic Rock Festival | Festmore',
    meta_desc: "Rock am Ring 2026: Jun 5-7 at Nürburgring. Germany's most iconic rock festival with 90,000 fans. Dates, lineup and tickets.",
  },
  {
    title: 'Glastonbury Festival 2026',
    slug: 'glastonbury-festival-2026',
    category: 'festival',
    city: 'Pilton',
    country: 'GB',
    start_date: '2026-06-24',
    end_date: '2026-06-28',
    date_display: 'Jun 24–28, 2026',
    description: `Glastonbury Festival of Contemporary Performing Arts is the world's most famous music and arts festival, held at Worthy Farm in Pilton, Somerset since 1970. The festival covers 900 acres of Somerset farmland with over 100 stages, hosting approximately 200,000 visitors for five days each June.

The Pyramid Stage — Glastonbury's iconic main stage — has hosted some of the most celebrated performances in rock history, from David Bowie and The Rolling Stones to Beyoncé, Paul McCartney and Adele. Beyond the music, Glastonbury is a complete world unto itself, with areas dedicated to theatre, circus, healing, markets, comedy, film, dance and the arts.

The festival is produced by Emily Eavis and her father Michael Eavis, who have maintained Glastonbury's original spirit of adventure, discovery and community through five decades of extraordinary change in the music industry. Tickets sell out within minutes and a "fallow year" break makes each edition even more anticipated.`,
    price_display: '£350+',
    attendees: 200000,
    vendor_spots: 500,
    website: 'https://www.glastonburyfestivals.co.uk',
    featured: 1,
    image_url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200&q=80',
    tags: JSON.stringify(['glastonbury 2026', 'glastonbury festival', 'pyramid stage', 'somerset', 'worthy farm', 'uk festival']),
    meta_title: 'Glastonbury Festival 2026 — Complete Guide | Festmore',
    meta_desc: "Glastonbury Festival 2026: Jun 24-28 in Somerset. The world's most famous music festival. Dates, lineup, tickets and visitor guide.",
  },
  {
    title: 'Tomorrowland Belgium 2026',
    slug: 'tomorrowland-2026',
    category: 'festival',
    city: 'Boom',
    country: 'BE',
    start_date: '2026-07-17',
    end_date: '2026-07-26',
    date_display: 'Jul 17–19 & Jul 24–26, 2026',
    description: `Tomorrowland is the world's greatest electronic music festival, held in the small Belgian town of Boom near Antwerp each July. Since its founding in 2005, Tomorrowland has grown into a global phenomenon — a two-weekend event that sells out its 400,000 tickets within minutes and draws visitors from over 200 countries.

The festival is renowned for its extraordinary stage design and production — each year a new theatrical theme is created with a main stage that takes months to construct and represents some of the most spectacular stage design in the history of live music. The 2025 edition attracted 600,000 visitors across two weekends, with headliners including virtually every major name in electronic music.

The unique atmosphere of Tomorrowland — part music festival, part theme park, part global gathering — creates an experience completely unlike any other event in the world. The DreamVille camping area, with its themed accommodations, adds another dimension to what is already the most immersive festival experience available.`,
    price_display: '€250–€350',
    attendees: 200000,
    vendor_spots: 300,
    website: 'https://www.tomorrowland.com',
    featured: 1,
    image_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&q=80',
    tags: JSON.stringify(['tomorrowland 2026', 'belgium', 'boom', 'electronic music', 'EDM', 'tomorrowland tickets']),
    meta_title: 'Tomorrowland 2026 Belgium — World\'s Greatest EDM Festival | Festmore',
    meta_desc: "Tomorrowland 2026: Jul 17-19 & 24-26 in Boom, Belgium. The world's greatest electronic music festival. Tickets, lineup and complete visitor guide.",
  },
  {
    title: 'Roskilde Festival 2026',
    slug: 'roskilde-festival-2026',
    category: 'festival',
    city: 'Roskilde',
    country: 'DK',
    start_date: '2026-06-27',
    end_date: '2026-07-04',
    date_display: 'Jun 27 – Jul 4, 2026',
    description: `Roskilde Festival is Scandinavia's largest and most prestigious music festival, held annually in the Danish city of Roskilde since 1971. The eight-day festival draws 130,000 visitors and features over 175 acts across eight stages, combining massive international headliners with the best of Nordic music and an extraordinary commitment to culture, activism and community.

As a non-profit festival run by volunteers, Roskilde donates its entire surplus to humanitarian and cultural causes — over €50 million has been donated since the festival began. This unique social mission gives Roskilde a distinctive ethos that sets it apart from commercial festivals. The festival's commitment to diversity, sustainability and artistic quality has made it one of the most respected music events in the world.

Previous headliners have included Bruce Springsteen, Kendrick Lamar, Bob Dylan, The Rolling Stones, Radiohead, Beyoncé, Eminem and virtually every major musical act of the past five decades. The Orange Stage — Roskilde's iconic main stage — is one of the largest outdoor stages in the world.`,
    price_display: 'DKK 2,999–3,999',
    attendees: 130000,
    vendor_spots: 300,
    website: 'https://www.roskilde-festival.dk',
    featured: 1,
    image_url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200&q=80',
    tags: JSON.stringify(['roskilde festival 2026', 'denmark', 'roskilde', 'scandinavian festival', 'orange stage', 'non-profit']),
    meta_title: 'Roskilde Festival 2026 — Scandinavia\'s Greatest Music Festival | Festmore',
    meta_desc: "Roskilde Festival 2026: Jun 27 – Jul 4. Scandinavia's largest music festival with 130,000 visitors. Dates, lineup, tickets and complete guide.",
  },
];

// ─── INSERT EVENTS ───
let added = 0, skipped = 0;

for (const event of events) {
  try {
    const exists = db.prepare('SELECT id FROM events WHERE slug=?').get(event.slug);
    if (exists) {
      // Update existing with better content
      db.prepare(`UPDATE events SET description=?, meta_title=?, meta_desc=?, tags=?, featured=?, image_url=?, attendees=?, website=? WHERE slug=?`)
        .run(event.description, event.meta_title, event.meta_desc, event.tags, event.featured, event.image_url, event.attendees, event.website, event.slug);
      console.log('Updated: ' + event.title);
      skipped++;
      continue;
    }

    db.prepare(`
      INSERT INTO events (
        title, slug, category, city, country,
        start_date, end_date, date_display,
        description, price_display, attendees, vendor_spots,
        website, status, payment_status, featured, source,
        tags, image_url, meta_title, meta_desc
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,'active','paid',?,'manual',?,?,?,?)
    `).run(
      event.title, event.slug, event.category, event.city, event.country,
      event.start_date, event.end_date || '', event.date_display,
      event.description, event.price_display, event.attendees, event.vendor_spots,
      event.website, event.featured, event.tags,
      event.image_url, event.meta_title, event.meta_desc
    );
    added++;
    console.log('Added: ' + event.title);
  } catch(err) {
    console.error('Error: ' + event.title + ' — ' + err.message);
  }
}

console.log('\n✅ Done! Added: ' + added + ', Updated: ' + skipped);
db.close();
