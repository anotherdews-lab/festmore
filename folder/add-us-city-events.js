// add-us-city-events.js
// Run with: node add-us-city-events.js
// Adds 10 real US city events with full SEO descriptions and photos

const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, 'db', 'festmore.db'));

const events = [
  {
    title: 'New York City Summer Streets 2026',
    category: 'city',
    city: 'New York',
    country: 'US',
    start_date: '2026-08-01',
    end_date: '2026-08-15',
    date_display: 'Every Saturday in August 2026',
    description: 'New York City Summer Streets is one of the largest free public events in New York, transforming nearly 7 miles of Park Avenue into a car-free zone for pedestrians, cyclists and runners every Saturday in August. From the Brooklyn Bridge all the way to Central Park, the streets come alive with fitness activities, art installations, live music performances and food vendors. Thousands of New Yorkers and tourists take over the iconic avenues to walk, bike, dance and explore the city in a completely new way. Free yoga classes, climbing walls, water features and interactive art make this a must-do summer experience in the city. Local food vendors and artisan stalls line the route offering everything from fresh juices to handmade crafts. With the backdrop of Manhattan\'s legendary skyline, Summer Streets captures everything that makes New York the most exciting city in the world.',
    price_display: 'Free',
    price_from: 0,
    attendees: 300000,
    vendor_spots: 150,
    website: 'https://www.nyc.gov/summerstreets',
    ticket_url: '',
    address: 'Park Avenue, Manhattan, New York, NY',
    featured: 1,
    tags: JSON.stringify(['new york', 'city event', 'free', 'summer', 'park avenue', 'cycling', 'outdoor', 'manhattan']),
    image_url: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80',
    meta_title: 'NYC Summer Streets 2026 — Free Car-Free Event on Park Avenue | Festmore',
    meta_desc: 'NYC Summer Streets 2026: 7 miles of car-free Park Avenue every August Saturday. Free activities, food vendors, art and live music in Manhattan.',
  },
  {
    title: 'Chicago Jazz Festival 2026',
    category: 'concert',
    city: 'Chicago',
    country: 'US',
    start_date: '2026-09-04',
    end_date: '2026-09-07',
    date_display: 'Sep 4–7, 2026',
    description: 'The Chicago Jazz Festival is one of the oldest and most celebrated free jazz festivals in the United States, held annually over Labor Day weekend in the beautiful Millennium Park and Jay Pritzker Pavilion. Since 1979, the festival has showcased world-class jazz artists from Chicago and around the globe, honoring the city\'s rich musical heritage. With multiple stages across the park, attendees can enjoy everything from classic bebop and blues to avant-garde and contemporary jazz performances. The festival attracts over 300,000 visitors over four days, all completely free of charge. Food vendors from Chicago\'s diverse culinary scene line the park, offering everything from Chicago-style hot dogs to international street food. The dramatic skyline of downtown Chicago provides a stunning backdrop for performances that run from afternoon into the evening. A true celebration of Chicago\'s soul and one of the best free events in America.',
    price_display: 'Free',
    price_from: 0,
    attendees: 300000,
    vendor_spots: 80,
    website: 'https://www.cityofchicago.org/jazzfestival',
    ticket_url: '',
    address: 'Millennium Park, 201 E Randolph St, Chicago, IL 60602',
    featured: 1,
    tags: JSON.stringify(['jazz', 'chicago', 'free', 'music festival', 'millennium park', 'labor day', 'illinois', 'outdoor concert']),
    image_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
    meta_title: 'Chicago Jazz Festival 2026 — Free Jazz in Millennium Park | Festmore',
    meta_desc: 'Chicago Jazz Festival 2026: Free world-class jazz over Labor Day weekend in Millennium Park. 300,000 visitors, multiple stages, food vendors.',
  },
  {
    title: 'San Francisco Outside Lands Music Festival 2026',
    category: 'festival',
    city: 'San Francisco',
    country: 'US',
    start_date: '2026-08-07',
    end_date: '2026-08-09',
    date_display: 'Aug 7–9, 2026',
    description: 'Outside Lands is San Francisco\'s premier music and arts festival, held annually in the legendary Golden Gate Park. Since 2008, it has grown into one of America\'s most beloved festivals, attracting over 220,000 music fans across three days. The festival features five stages with headlining acts spanning rock, pop, hip-hop, electronic and indie music, all set against the stunning natural beauty of Golden Gate Park. Outside Lands is renowned for its exceptional food and drink program — Wine Lands, Beer Lands, Cheese Lands and Cannabis Lands celebrate San Francisco\'s world-class culinary scene. Over 80 of the Bay Area\'s best restaurants and food vendors set up stalls, making it as much a food festival as a music event. Art installations, comedy stages and immersive experiences complete the lineup. With the fog rolling over the hills and the redwoods as a backdrop, Outside Lands captures the unique magic of San Francisco.',
    price_display: '$195–$450',
    price_from: 195,
    attendees: 220000,
    vendor_spots: 200,
    website: 'https://www.sfoutsidelands.com',
    ticket_url: 'https://www.sfoutsidelands.com/tickets',
    address: 'Golden Gate Park, San Francisco, CA 94117',
    featured: 1,
    tags: JSON.stringify(['outside lands', 'san francisco', 'music festival', 'golden gate park', 'california', 'rock', 'food', 'arts']),
    image_url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80',
    meta_title: 'Outside Lands Festival San Francisco 2026 — Golden Gate Park | Festmore',
    meta_desc: 'Outside Lands 2026: San Francisco music and food festival in Golden Gate Park. 220,000 fans, top headliners, 80+ food vendors. Aug 7-9, 2026.',
  },
  {
    title: 'Austin City Limits Music Festival 2026',
    category: 'festival',
    city: 'Austin',
    country: 'US',
    start_date: '2026-10-02',
    end_date: '2026-10-11',
    date_display: 'Oct 2–4 & Oct 9–11, 2026',
    description: 'Austin City Limits Music Festival — known as ACL Fest — is one of the premier music festivals in the United States, held over two consecutive weekends in the beautiful Zilker Park in the heart of Austin, Texas. Named after the iconic public television music show, ACL Fest attracts over 450,000 music fans across its two weekends to see 130+ acts on eight stages. The festival showcases genres spanning rock, country, folk, hip-hop, electronic and everything in between, celebrating Austin\'s reputation as the Live Music Capital of the World. The park setting along the Colorado River provides a stunning backdrop, with the Austin skyline visible across the water. Local food vendors and Austin\'s legendary restaurant scene are well represented throughout the grounds. Art installations, a children\'s area and a dedicated locals program round out the experience. ACL Fest is the essential Texas autumn tradition.',
    price_display: '$150–$375',
    price_from: 150,
    attendees: 450000,
    vendor_spots: 250,
    website: 'https://www.aclfestival.com',
    ticket_url: 'https://www.aclfestival.com/tickets',
    address: 'Zilker Park, 2100 Barton Springs Rd, Austin, TX 78746',
    featured: 1,
    tags: JSON.stringify(['acl fest', 'austin', 'music festival', 'texas', 'zilker park', 'country', 'rock', 'live music capital']),
    image_url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80',
    meta_title: 'Austin City Limits Festival 2026 — ACL Fest in Zilker Park | Festmore',
    meta_desc: 'ACL Fest 2026: Austin City Limits Music Festival in Zilker Park. 130+ acts, 450,000 fans, two weekends. Oct 2-11, 2026 in Austin, Texas.',
  },
  {
    title: 'New Orleans French Quarter Festival 2026',
    category: 'city',
    city: 'New Orleans',
    country: 'US',
    start_date: '2026-04-09',
    end_date: '2026-04-12',
    date_display: 'Apr 9–12, 2026',
    description: 'The French Quarter Festival is the largest free music festival in the American South and one of New Orleans\'s most beloved annual celebrations. Held across the historic French Quarter, the festival features over 1,700 musicians performing on 23 stages over four days. From jazz and blues to zydeco, R&B, gospel and brass band music, every corner of the Quarter pulsates with live sound. Over 700,000 visitors fill the cobblestone streets to experience the best of New Orleans music culture completely free of charge. Local restaurants and food vendors set up over 60 stalls serving authentic Creole and Cajun cuisine — from crawfish étouffée and beignets to po\'boys and red beans and rice. The iconic architecture of the French Quarter, with its wrought iron balconies and vibrant facades, provides an unmatched backdrop for this uniquely New Orleans celebration. A true feast for the senses.',
    price_display: 'Free',
    price_from: 0,
    attendees: 700000,
    vendor_spots: 60,
    website: 'https://www.fqfi.org',
    ticket_url: '',
    address: 'French Quarter, New Orleans, LA 70116',
    featured: 1,
    tags: JSON.stringify(['new orleans', 'french quarter', 'jazz', 'free festival', 'louisiana', 'creole', 'music', 'cajun']),
    image_url: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=800&q=80',
    meta_title: 'New Orleans French Quarter Festival 2026 — Free Jazz & Food | Festmore',
    meta_desc: 'French Quarter Festival 2026: Free music festival in New Orleans with 1,700+ musicians on 23 stages. Jazz, Cajun food & Creole culture. Apr 9-12.',
  },
  {
    title: 'Seattle Seafair Summer Festival 2026',
    category: 'city',
    city: 'Seattle',
    country: 'US',
    start_date: '2026-07-24',
    end_date: '2026-08-02',
    date_display: 'Jul 24 – Aug 2, 2026',
    description: 'Seattle Seafair is the Pacific Northwest\'s most iconic summer celebration, a ten-day festival that has defined Seattle summers since 1950. The festival spans the entire city with a thrilling program of events including hydroplane racing on Lake Washington, the beloved Torchlight Parade through downtown Seattle, air shows featuring the Blue Angels, neighborhood festivals and a vibrant waterfront scene. Over one million people participate in Seafair events throughout the ten days, making it one of the largest civic celebrations in the western United States. Local food vendors, artisan markets and restaurant pop-ups populate the festival grounds around Lake Washington, offering fresh Pacific Northwest seafood, craft beer and local specialties. From the mountains to the water, Seafair celebrates everything that makes Seattle one of America\'s most exciting cities to visit in summer.',
    price_display: 'Free–$50',
    price_from: 0,
    attendees: 1000000,
    vendor_spots: 120,
    website: 'https://www.seafair.org',
    ticket_url: 'https://www.seafair.org/tickets',
    address: 'Lake Washington & Downtown Seattle, WA',
    featured: 0,
    tags: JSON.stringify(['seattle', 'seafair', 'hydroplane', 'blue angels', 'washington', 'summer festival', 'parade', 'lake washington']),
    image_url: 'https://images.unsplash.com/photo-1438401171849-74ac270044ee?w=800&q=80',
    meta_title: 'Seattle Seafair 2026 — Summer Festival on Lake Washington | Festmore',
    meta_desc: 'Seattle Seafair 2026: 10-day summer festival with Blue Angels air show, hydroplane racing and Torchlight Parade. Jul 24 - Aug 2, Seattle WA.',
  },
  {
    title: 'Miami Art Week & Art Basel 2026',
    category: 'exhibition',
    city: 'Miami',
    country: 'US',
    start_date: '2026-12-02',
    end_date: '2026-12-07',
    date_display: 'Dec 2–7, 2026',
    description: 'Miami Art Week culminating in Art Basel Miami Beach is the most important art event in the Western Hemisphere, transforming Miami into the global capital of contemporary art for one week each December. Art Basel Miami Beach presents work by over 4,000 artists from 280 of the world\'s leading galleries, attracting 93,000 collectors, curators and art enthusiasts from 100 countries. Beyond the main fair at the Miami Beach Convention Center, the city hosts over 25 satellite fairs, gallery openings, outdoor installations and cultural events throughout Wynwood, the Design District and South Beach. Street art transforms the walls of Wynwood into an open-air museum. Celebrity-studded parties, exclusive previews and beach events make Art Week a unique fusion of high culture and Miami glamour. Hotels, restaurants and vendors across the city gear up for the influx of international visitors.',
    price_display: '$75–$300',
    price_from: 75,
    attendees: 93000,
    vendor_spots: 50,
    website: 'https://www.artbasel.com/miami-beach',
    ticket_url: 'https://www.artbasel.com/miami-beach/tickets',
    address: 'Miami Beach Convention Center, 1901 Convention Center Dr, Miami Beach, FL 33139',
    featured: 1,
    tags: JSON.stringify(['art basel', 'miami', 'art week', 'contemporary art', 'florida', 'wynwood', 'exhibition', 'galleries']),
    image_url: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?w=800&q=80',
    meta_title: 'Art Basel Miami Beach 2026 — Miami Art Week | Festmore',
    meta_desc: 'Art Basel Miami Beach 2026: World\'s top contemporary art fair with 280 galleries and 4,000 artists. Dec 2-7, 2026 in Miami Beach, Florida.',
  },
  {
    title: 'Boston Freedom Trail Festival 2026',
    category: 'city',
    city: 'Boston',
    country: 'US',
    start_date: '2026-09-11',
    end_date: '2026-09-13',
    date_display: 'Sep 11–13, 2026',
    description: 'The Boston Freedom Trail Festival is a spectacular annual celebration of American history, arts and culture held along the iconic 2.5-mile Freedom Trail through downtown Boston. Over three days, the historic streets between Boston Common and the Bunker Hill Monument come alive with costumed historical performers, colonial craft demonstrations, live folk and traditional music, and educational activities for all ages. The festival celebrates Boston\'s pivotal role in American history with reenactments, storytelling and guided tours of the 16 historic sites along the Freedom Trail. Local artisan vendors, food stalls serving classic New England cuisine and craft beer gardens are set up at key points along the trail. Over 200,000 visitors walk the trail during festival weekend, making it one of New England\'s most popular autumn events. A unique way to experience Boston\'s rich history.',
    price_display: 'Free',
    price_from: 0,
    attendees: 200000,
    vendor_spots: 80,
    website: 'https://www.thefreedomtrail.org',
    ticket_url: '',
    address: 'Freedom Trail, Boston Common, Boston, MA 02108',
    featured: 0,
    tags: JSON.stringify(['boston', 'freedom trail', 'history', 'massachusetts', 'colonial', 'free festival', 'new england', 'culture']),
    image_url: 'https://images.unsplash.com/photo-1501979376754-f8b694f4c475?w=800&q=80',
    meta_title: 'Boston Freedom Trail Festival 2026 — History & Culture | Festmore',
    meta_desc: 'Boston Freedom Trail Festival 2026: Free 3-day celebration of American history along Boston\'s iconic 2.5-mile historic trail. Sep 11-13, 2026.',
  },
  {
    title: 'Portland Rose Festival 2026',
    category: 'city',
    city: 'Portland',
    country: 'US',
    start_date: '2026-05-22',
    end_date: '2026-06-07',
    date_display: 'May 22 – Jun 7, 2026',
    description: 'The Portland Rose Festival is one of the longest-running civic celebrations in the United States, having taken place every year since 1907. Known as the City of Roses, Portland comes alive for three weeks of parades, entertainment, food and floral celebrations. The Grand Floral Parade is one of the largest all-floral parades in the nation, with spectacular floats decorated entirely in fresh flowers winding through downtown Portland. The festival also features the Starlight Parade, CityFair carnival at Tom McCall Waterfront Park, dragon boat races on the Willamette River and the spectacular Fleet Week with Navy ship tours. Over 2 million people participate in Rose Festival events throughout the three weeks. Dozens of food vendors, artisan markets and entertainment stages fill the waterfront park, celebrating Portland\'s vibrant culture, stunning natural surroundings and famously quirky spirit.',
    price_display: 'Free–$20',
    price_from: 0,
    attendees: 2000000,
    vendor_spots: 200,
    website: 'https://www.rosefestival.org',
    ticket_url: 'https://www.rosefestival.org/events',
    address: 'Tom McCall Waterfront Park, Portland, OR 97201',
    featured: 1,
    tags: JSON.stringify(['portland', 'rose festival', 'parade', 'oregon', 'flowers', 'waterfront', 'dragon boat', 'city festival']),
    image_url: 'https://images.unsplash.com/photo-1490750967868-88df5691cc5a?w=800&q=80',
    meta_title: 'Portland Rose Festival 2026 — City of Roses Celebration | Festmore',
    meta_desc: 'Portland Rose Festival 2026: 3 weeks of parades, dragon boat races and floral celebrations. 2 million visitors. May 22 - Jun 7, Portland Oregon.',
  },
  {
    title: 'Nashville Music City July 4th Festival 2026',
    category: 'city',
    city: 'Nashville',
    country: 'US',
    start_date: '2026-07-04',
    end_date: '2026-07-04',
    date_display: 'July 4, 2026',
    description: 'Nashville\'s July 4th celebration on the Cumberland River is one of the biggest and most spectacular Independence Day events in the entire United States, drawing over 200,000 people to the riverfront for a full day of country music, food and the most impressive fireworks show in the South. The event takes place along the Cumberland River with the Nashville skyline as a dramatic backdrop. Top country music artists perform on multiple stages throughout the day, with the main stage hosting nationally known headliners. Food vendors representing the best of Nashville cuisine line the riverfront — from Nashville hot chicken and BBQ ribs to homemade ice cream and craft beer. As night falls, the fireworks spectacular synchronized to live music is a truly unforgettable experience. Free and open to all, this is the ultimate Nashville summer experience and a celebration of American culture at its finest.',
    price_display: 'Free',
    price_from: 0,
    attendees: 200000,
    vendor_spots: 100,
    website: 'https://www.visitmusiccity.com/july4th',
    ticket_url: '',
    address: 'Cumberland Riverfront, Nashville, TN 37201',
    featured: 1,
    tags: JSON.stringify(['nashville', 'july 4th', 'independence day', 'country music', 'tennessee', 'fireworks', 'free', 'riverfront']),
    image_url: 'https://images.unsplash.com/photo-1467803738586-46b7eb7b16a1?w=800&q=80',
    meta_title: 'Nashville July 4th Festival 2026 — Music City Independence Day | Festmore',
    meta_desc: 'Nashville July 4th 2026: Free Independence Day celebration with country music, fireworks and 200,000 visitors on the Cumberland River. Jul 4, 2026.',
  },
];

// Insert events into database
let added = 0;
let skipped = 0;

const slugify = (str) => str.toLowerCase()
  .replace(/[^a-z0-9\s-]/g, '')
  .replace(/\s+/g, '-')
  .replace(/-+/g, '-')
  .trim();

for (const event of events) {
  try {
    const exists = db.prepare('SELECT id FROM events WHERE title=?').get(event.title);
    if (exists) {
      console.log(`⏭️  Skipping duplicate: ${event.title}`);
      skipped++;
      continue;
    }

    let slug = slugify(event.title);
    let i = 1;
    while (db.prepare('SELECT id FROM events WHERE slug=?').get(slug)) {
      slug = `${slugify(event.title)}-${i++}`;
    }

    db.prepare(`
      INSERT INTO events (
        title, slug, category, city, country,
        start_date, end_date, date_display,
        description, price_display, price_from,
        attendees, vendor_spots, website, ticket_url, address,
        status, payment_status, featured, source, tags,
        image_url, meta_title, meta_desc
      ) VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?, ?,
        'active', 'paid', ?, 'manual', ?,
        ?, ?, ?
      )
    `).run(
      event.title, slug, event.category, event.city, event.country,
      event.start_date, event.end_date || '', event.date_display,
      event.description, event.price_display, event.price_from || 0,
      event.attendees || 0, event.vendor_spots || 0, event.website || '', event.ticket_url || '', event.address || '',
      event.featured || 0, event.tags || '[]',
      event.image_url || '', event.meta_title || '', event.meta_desc || ''
    );
    added++;
    console.log(`✅ Added: ${event.title}`);
  } catch (err) {
    console.error(`❌ Error adding ${event.title}:`, err.message);
  }
}

console.log(`\n🎉 Done! Added ${added} US city events, skipped ${skipped} duplicates.`);
db.close();
