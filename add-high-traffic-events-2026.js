// add-high-traffic-events-2026.js
// 20 events with high Google search volume for 2026
// Covers: Tomorrowland, Glastonbury, Ultra, Oktoberfest, Edinburgh Fringe,
// Montreux Jazz, Sonar, Sziget, Flow Festival, Amsterdam Dance Event and more

const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, 'db', 'festmore.db'));

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

const events = [

  // 1 — TOMORROWLAND
  {
    title: 'Tomorrowland 2026',
    slug: 'tomorrowland-2026',
    category: 'festival',
    city: 'Boom',
    country: 'BE',
    start_date: '2026-07-17',
    end_date: '2026-07-26',
    date_display: '17–19 July & 24–26 July 2026',
    description: `Tomorrowland is the world's greatest electronic music festival — and in 2026 it returns to De Schorre park in Boom, Belgium for two extraordinary weekends under the theme ONE.\n\nWith over 400,000 visitors from more than 200 countries, 16 spectacular themed stages, and a lineup featuring the world's greatest DJs and electronic artists, Tomorrowland is not just a festival — it is a universe unto itself. The stage designs alone take months to construct and are widely considered among the greatest theatrical productions on earth.\n\nHeadliners include The Chainsmokers, Martin Garrix, and Holy Priest alongside hundreds of acts across every genre of electronic music. The DreamVille camping area transforms into a complete city, with its own restaurants, shops, wellness facilities and entertainment.\n\nThis is a bucket list event. Tickets sell out in minutes — register on the Tomorrowland website immediately to be notified when tickets go on sale.`,
    price_display: '€220–€350',
    website: 'https://www.tomorrowland.com',
    attendees: 400000,
    vendor_spots: 0,
    image_url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80',
    featured: 1,
    tags: JSON.stringify(['tomorrowland 2026','tomorrowland belgium','edm festival 2026','electronic music festival','boom festival']),
    meta_title: 'Tomorrowland 2026 — Belgium | Dates, Tickets & Lineup | Festmore',
    meta_desc: 'Tomorrowland 2026 in Boom, Belgium. The world\'s greatest electronic music festival returns 17–19 July & 24–26 July 2026. 400,000 visitors, 16 stages. Get tickets now.',
  },

  // 2 — GLASTONBURY
  {
    title: 'Glastonbury Festival 2026',
    slug: 'glastonbury-festival-2026',
    category: 'festival',
    city: 'Somerset',
    country: 'GB',
    start_date: '2026-06-24',
    end_date: '2026-06-28',
    date_display: '24–28 June 2026',
    description: `Glastonbury Festival of Contemporary Performing Arts is the world's most famous music and arts festival, held at Worthy Farm in Pilton, Somerset since 1970.\n\nThe festival covers 900 acres of Somerset farmland with over 100 stages, hosting approximately 200,000 visitors for five days each June. The Pyramid Stage — Glastonbury's iconic main stage — has hosted some of the most celebrated performances in rock history, from David Bowie and The Rolling Stones to Beyoncé, Paul McCartney and Adele.\n\nBeyond the music, Glastonbury is a complete world unto itself, with areas dedicated to theatre, circus, healing, markets, comedy, film, dance and the arts. The festival is produced by Emily Eavis and her father Michael Eavis, who have maintained Glastonbury's original spirit of adventure, discovery and community through five decades.\n\nTickets sell out within minutes of release each year. Register on the Glastonbury website with a passport photo well in advance — this is the only way to buy tickets when they go on sale.`,
    price_display: '£340–£375',
    website: 'https://www.glastonburyfestivals.co.uk',
    attendees: 200000,
    vendor_spots: 0,
    image_url: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&q=80',
    featured: 1,
    tags: JSON.stringify(['glastonbury 2026','glastonbury festival','pyramid stage','worthy farm','uk festival 2026']),
    meta_title: 'Glastonbury Festival 2026 — Somerset UK | Dates & Tickets | Festmore',
    meta_desc: 'Glastonbury Festival 2026 — 24–28 June at Worthy Farm, Somerset. The world\'s most famous music festival. 200,000 visitors, 100+ stages. Dates, lineup and tickets.',
  },

  // 3 — OKTOBERFEST
  {
    title: 'Oktoberfest 2026 Munich',
    slug: 'oktoberfest-2026-munich',
    category: 'festival',
    city: 'Munich',
    country: 'DE',
    start_date: '2026-09-19',
    end_date: '2026-10-04',
    date_display: '19 September – 4 October 2026',
    description: `Oktoberfest is the world's largest folk festival and beer festival, held annually on the Theresienwiese fairgrounds in Munich, Bavaria. In 2026 it celebrates its 216th anniversary — and for the first time in its history, a special anniversary atmosphere is planned.\n\nSix million visitors from around the world descend on Munich each year for two weeks of Bavarian beer, traditional food, music, parades and fairground rides. The 14 massive beer tents — each holding thousands of visitors — serve millions of litres of specially brewed Märzenbier from Munich's six great breweries: Augustiner, Hacker-Pschorr, Hofbräu, Löwenbräu, Paulaner and Spaten.\n\nKey 2026 events include the Grand Entry of the Oktoberfest Landlords and Breweries on 19 September, the traditional costume and riflemen's parade on 20 September, and family days on 22 and 29 September.\n\nThe Theresienwiese is easily reached by U-Bahn (U4/U5) from Munich city centre. Book accommodation months in advance — the city fills completely during Oktoberfest.`,
    price_display: 'Free entry · Beer from €15',
    website: 'https://www.oktoberfest.de',
    attendees: 6000000,
    vendor_spots: 0,
    image_url: 'https://images.unsplash.com/photo-1567529692333-de9fd6772897?w=800&q=80',
    featured: 1,
    tags: JSON.stringify(['oktoberfest 2026','oktoberfest munich','munich beer festival','bavarian festival','wiesn 2026']),
    meta_title: 'Oktoberfest 2026 Munich — Dates, Beer Tents & Visitor Guide | Festmore',
    meta_desc: 'Oktoberfest 2026 in Munich — 19 September to 4 October. The world\'s largest beer festival. 6 million visitors, 14 beer tents, Bavarian tradition. Complete visitor guide.',
  },

  // 4 — ULTRA EUROPE
  {
    title: 'Ultra Europe 2026 Split',
    slug: 'ultra-europe-2026-split',
    category: 'festival',
    city: 'Split',
    country: 'HR',
    start_date: '2026-07-10',
    end_date: '2026-07-12',
    date_display: '10–12 July 2026',
    description: `Ultra Europe is one of the world's most spectacular electronic music festivals, held in Split on Croatia's stunning Adriatic coast. In 2026 it returns to the Poljud Stadium in Split for three days of world-class electronic music, before expanding into "Destination Ultra" — a week-long circuit of island after-parties across Hvar, Brač and Vis.\n\nThe 2026 lineup features some of the biggest names in electronic music including Amelie Lens, Charlotte de Witte, Joy Orbison, and many more across multiple stages. The contrast between Split's magnificent Roman architecture — including Diocletian's Palace, a UNESCO World Heritage Site — and the laser-lit night skies creates an atmosphere unlike any other festival in the world.\n\nCombine Ultra with Croatia's extraordinary islands for the ultimate summer experience. Ferries run regularly from Split to Hvar, Brač and Vis, where Destination Ultra parties continue throughout the week.\n\nTickets sell out fast. Book your accommodation in Split and on the islands well in advance — summer in Dalmatia is extremely popular.`,
    price_display: '€150–€280',
    website: 'https://ultraeurope.com',
    attendees: 150000,
    vendor_spots: 0,
    image_url: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&q=80',
    featured: 1,
    tags: JSON.stringify(['ultra europe 2026','ultra split','croatia festival 2026','edm festival croatia','destination ultra']),
    meta_title: 'Ultra Europe 2026 Split Croatia — Dates, Lineup & Tickets | Festmore',
    meta_desc: 'Ultra Europe 2026 in Split, Croatia — 10–12 July. World-class electronic music on the Adriatic coast. Destination Ultra island parties on Hvar, Brač and Vis.',
  },

  // 5 — EDINBURGH FRINGE
  {
    title: 'Edinburgh Festival Fringe 2026',
    slug: 'edinburgh-fringe-festival-2026',
    category: 'festival',
    city: 'Edinburgh',
    country: 'GB',
    start_date: '2026-08-07',
    end_date: '2026-08-31',
    date_display: '7–31 August 2026',
    description: `The Edinburgh Festival Fringe is the world's largest arts festival, transforming the Scottish capital into the global centre of performance and creativity every August. In 2026 over 3,000 shows across more than 300 venues fill Edinburgh's streets, parks, pubs, churches and converted spaces with comedy, theatre, dance, circus, music, opera and spoken word.\n\nThe Fringe began in 1947 as an alternative to the Edinburgh International Festival and has grown to become a defining cultural institution. Unlike most festivals, anyone can perform — there is no selection committee. This open-access principle means the Fringe is simultaneously a showcase for established stars and a launchpad for tomorrow's greatest performers.\n\nHighlights of the Fringe calendar include the Royal Mile street performances, the Free Fringe (which offers entirely free shows), the Pleasance, Assembly, Underbelly and Gilded Balloon mega-venues, and the extraordinary atmosphere of a city given over entirely to the arts for a full month.\n\nEdinburgh in August is one of Europe's great cultural experiences. Book accommodation very early — the city is completely full throughout the Fringe.`,
    price_display: 'Free – £35',
    website: 'https://www.edfringe.com',
    attendees: 3000000,
    vendor_spots: 0,
    image_url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80',
    featured: 1,
    tags: JSON.stringify(['edinburgh fringe 2026','edinburgh festival 2026','edinburgh fringe festival','scotland festival','arts festival uk']),
    meta_title: 'Edinburgh Festival Fringe 2026 — Dates, Shows & Tickets | Festmore',
    meta_desc: 'Edinburgh Festival Fringe 2026 — 7–31 August. The world\'s largest arts festival with 3,000+ shows across 300+ venues in Edinburgh. Comedy, theatre, circus and more.',
  },

  // 6 — MONTREUX JAZZ FESTIVAL
  {
    title: 'Montreux Jazz Festival 2026',
    slug: 'montreux-jazz-festival-2026',
    category: 'concert',
    city: 'Montreux',
    country: 'CH',
    start_date: '2026-07-03',
    end_date: '2026-07-18',
    date_display: '3–18 July 2026',
    description: `The Montreux Jazz Festival is one of the world's most prestigious music festivals, celebrating its 60th anniversary in 2026 with what promises to be an extraordinary programme on the shores of Lake Geneva.\n\nFounded in 1967 by Claude Nobs, Montreux has grown from an intimate jazz gathering into a world-class music festival that blends jazz at its core with soul, world music, pop and genre-crossing performances. The setting — on the edge of Lake Geneva with the Alps as a backdrop — is among the most beautiful of any festival in the world.\n\nPast performers at Montreux include Miles Davis, Ray Charles, Nina Simone, David Bowie, Prince, Led Zeppelin, Marvin Gaye, B.B. King, and virtually every great musician of the past six decades. The 60th anniversary edition is expected to feature an especially remarkable lineup.\n\nThe festival features both free outdoor concerts on the lakeside esplanade and ticketed indoor concerts at the Auditorium Stravinski and other venues. The famous Casino de Montreux hosts late-night jam sessions that are among the most cherished traditions of the festival.`,
    price_display: 'Free – CHF 120',
    website: 'https://www.montreuxjazzfestival.com',
    attendees: 250000,
    vendor_spots: 0,
    image_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
    featured: 1,
    tags: JSON.stringify(['montreux jazz festival 2026','montreux 2026','jazz festival switzerland','lake geneva festival','60th anniversary montreux']),
    meta_title: 'Montreux Jazz Festival 2026 — 60th Anniversary | Dates & Tickets | Festmore',
    meta_desc: 'Montreux Jazz Festival 2026 — 3–18 July on Lake Geneva, Switzerland. The 60th anniversary edition of one of the world\'s greatest music festivals. Lineup and tickets.',
  },

  // 7 — SONAR BARCELONA
  {
    title: 'Sónar Festival Barcelona 2026',
    slug: 'sonar-festival-barcelona-2026',
    category: 'festival',
    city: 'Barcelona',
    country: 'ES',
    start_date: '2026-06-18',
    end_date: '2026-06-20',
    date_display: '18–20 June 2026',
    description: `Sónar is Barcelona's legendary festival of advanced music, creativity and technology — now in its 33rd year and still the most artistically ambitious electronic music festival in Europe.\n\nFounded in 1994, Sónar created the blueprint for festivals that celebrate the intersection of music, art and technology. Three decades on, it continues to push the boundaries of what a festival can be, blending world-class DJ sets and live performances with audiovisual art, immersive installations and cultural programming across multiple venues in Barcelona.\n\nThe 2026 lineup features Skepta, Sammy Virji, Nia Archives, Joy Orbison and dozens of acts at the cutting edge of electronic music. Sónar Week — the festival's extended city-wide programme — transforms Barcelona into an international hub of electronic music culture through collaborations with the city's leading promoters and cultural institutions.\n\nBarcelona in June is extraordinary — combine Sónar with the city's architecture, beaches, food and nightlife for one of the great European summer experiences.`,
    price_display: '€75–€195',
    website: 'https://sonar.es',
    attendees: 120000,
    vendor_spots: 0,
    image_url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80',
    featured: 1,
    tags: JSON.stringify(['sonar 2026','sonar barcelona','sonar festival','barcelona festival 2026','electronic music barcelona']),
    meta_title: 'Sónar Festival Barcelona 2026 — Dates, Lineup & Tickets | Festmore',
    meta_desc: 'Sónar 2026 in Barcelona — 18–20 June. The world\'s premier festival of advanced music and creativity. 33rd edition with Skepta, Joy Orbison, Nia Archives and more.',
  },

  // 8 — SZIGET FESTIVAL
  {
    title: 'Sziget Festival 2026 Budapest',
    slug: 'sziget-festival-2026-budapest',
    category: 'festival',
    city: 'Budapest',
    country: 'HU',
    start_date: '2026-08-11',
    end_date: '2026-08-15',
    date_display: '11–15 August 2026',
    description: `Sziget — the Island of Freedom — is one of Europe's greatest music and cultural festivals, held on a beautiful island in the Danube in the heart of Budapest. Over 400,000 visitors from more than 100 countries gather each year for five days of music, art, theatre, circus and unforgettable experiences.\n\nBudapest's Óbudai-sziget island is transformed each August into a temporary city with 60 stages and performance spaces hosting thousands of acts. The main stage has featured some of the world's biggest artists — from Ed Sheeran and Dua Lipa to Billie Eilish and Arctic Monkeys. But Sziget is far more than a music festival: its programme encompasses visual art, circus, theatre, film, wellness, sports and a remarkable range of cultural experiences.\n\nBudapest itself is one of Europe's most beautiful and affordable cities, with extraordinary architecture, thermal baths, ruin bars and vibrant nightlife. Combining Sziget with a few days in Budapest is one of the great European summer experiences.\n\nThe 2026 edition runs from 11–15 August with camping available on the island.`,
    price_display: '€99–€380',
    website: 'https://szigetfestival.com',
    attendees: 400000,
    vendor_spots: 0,
    image_url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80',
    featured: 1,
    tags: JSON.stringify(['sziget 2026','sziget festival','budapest festival 2026','island of freedom','hungary festival']),
    meta_title: 'Sziget Festival 2026 Budapest — Dates, Lineup & Tickets | Festmore',
    meta_desc: 'Sziget Festival 2026 in Budapest — 11–15 August on the Island of Freedom. 400,000 visitors, 60 stages. One of Europe\'s greatest music and cultural festivals.',
  },

  // 9 — FLOW FESTIVAL HELSINKI
  {
    title: 'Flow Festival 2026 Helsinki',
    slug: 'flow-festival-2026-helsinki',
    category: 'festival',
    city: 'Helsinki',
    country: 'FI',
    start_date: '2026-08-14',
    end_date: '2026-08-16',
    date_display: '14–16 August 2026',
    description: `Flow Festival is Finland's premier music festival, held at the stunning Suvilahti power plant area in Helsinki — a former industrial site transformed into one of Europe's most atmospheric festival venues.\n\nThe 2026 lineup is exceptional: PinkPantheress, Florence + The Machine, Zara Larsson, Lykke Li, and Nick Cave & the Bad Seeds are confirmed headliners, alongside a rich programme spanning indie, electronic, hip-hop and alternative music. Flow's consistent ability to combine major international acts with genuinely adventurous programming makes it one of Scandinavia's most respected festivals.\n\nFlow Festival's sustainability credentials are among the strongest in European festival culture — it operates on renewable energy, has achieved near-zero waste, and partners with ethical food vendors. The result is a festival that feels both exciting and responsible.\n\nHelsinki in August offers the extraordinary light of Nordic summer — long golden evenings that make Suvilahti feel magical. The city's design culture, food scene and waterfront are exceptional additions to a festival weekend.`,
    price_display: '€85–€220',
    website: 'https://www.flowfestival.com',
    attendees: 80000,
    vendor_spots: 0,
    image_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
    featured: 0,
    tags: JSON.stringify(['flow festival 2026','flow festival helsinki','helsinki festival','finland festival','florence machine 2026']),
    meta_title: 'Flow Festival 2026 Helsinki — Dates, Lineup & Tickets | Festmore',
    meta_desc: 'Flow Festival 2026 in Helsinki — 14–16 August. Florence + The Machine, Nick Cave, PinkPantheress headline one of Scandinavia\'s greatest music festivals.',
  },

  // 10 — AMSTERDAM DANCE EVENT
  {
    title: 'Amsterdam Dance Event 2026',
    slug: 'amsterdam-dance-event-2026',
    category: 'festival',
    city: 'Amsterdam',
    country: 'NL',
    start_date: '2026-10-21',
    end_date: '2026-10-25',
    date_display: '21–25 October 2026',
    description: `Amsterdam Dance Event (ADE) is the world's leading electronic music conference and festival, transforming Amsterdam into the global capital of electronic music for five days each October.\n\nWith over 2,500 artists performing across more than 200 venues throughout the city — from intimate club spaces to converted warehouses, churches and outdoor stages — ADE is less a single festival and more a complete takeover of one of Europe's most exciting cities. Club nights, label showcases and genre-spanning electronic programming stack across venues from morning until the following morning.\n\nADE attracts over 400,000 visitors and features some of electronic music's greatest names. Past editions have featured Charlotte de Witte, Honey Dijon, Adam Beyer, Ricardo Villalobos, Peggy Gou, Amelie Lens and hundreds more. The 2026 lineup will be announced closer to the event.\n\nADE also includes a major conference component during the day — panels, talks and networking events that make it essential for music industry professionals worldwide. Amsterdam's world-class nightlife scene, canals, museums and food make it one of Europe's great city breaks.`,
    price_display: '€15–€60 per event',
    website: 'https://www.amsterdam-dance-event.nl',
    attendees: 400000,
    vendor_spots: 0,
    image_url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80',
    featured: 0,
    tags: JSON.stringify(['amsterdam dance event 2026','ADE 2026','ade amsterdam','electronic music amsterdam','amsterdam festival october']),
    meta_title: 'Amsterdam Dance Event 2026 — ADE | Dates & Programme | Festmore',
    meta_desc: 'Amsterdam Dance Event 2026 — 21–25 October. The world\'s largest electronic music festival and conference. 2,500+ artists across 200+ venues in Amsterdam.',
  },

  // 11 — PRIMAVERA SOUND
  {
    title: 'Primavera Sound Barcelona 2026',
    slug: 'primavera-sound-barcelona-2026',
    category: 'festival',
    city: 'Barcelona',
    country: 'ES',
    start_date: '2026-06-04',
    end_date: '2026-06-06',
    date_display: '4–6 June 2026',
    description: `Primavera Sound is one of the most artistically respected music festivals in Europe — a Barcelona institution that consistently books the world's greatest artists at the peak of their careers, from indie and alternative rock to electronic, hip-hop and everything in between.\n\nHeld at the Parc del Fòrum on Barcelona's waterfront, Primavera Sound combines spectacular Mediterranean setting with impeccable curation. The festival has earned a global reputation for booking artists that others miss, and for creating an atmosphere that balances scale with genuine music culture.\n\nThe Parc del Fòrum extends to the sea, with multiple stages arranged to allow relatively comfortable movement between artists. The festival runs until 6am, with club nights extending the experience into the Barcelona morning. The city's extraordinary food, architecture and beaches make Primavera Sound one of the truly unmissable European festival weekends.\n\nTickets typically sell out months in advance. Barcelona's accommodation fills quickly around Primavera — book early.`,
    price_display: '€95–€275',
    website: 'https://www.primaverasound.com',
    attendees: 220000,
    vendor_spots: 0,
    image_url: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&q=80',
    featured: 0,
    tags: JSON.stringify(['primavera sound 2026','primavera sound barcelona','barcelona music festival','parc del forum','primavera festival']),
    meta_title: 'Primavera Sound Barcelona 2026 — Dates, Lineup & Tickets | Festmore',
    meta_desc: 'Primavera Sound 2026 in Barcelona — 4–6 June at Parc del Fòrum. One of Europe\'s most respected music festivals on the Mediterranean waterfront. Lineup and tickets.',
  },

  // 12 — ROSKILDE FESTIVAL
  {
    title: 'Roskilde Festival 2026',
    slug: 'roskilde-festival-2026',
    category: 'festival',
    city: 'Roskilde',
    country: 'DK',
    start_date: '2026-06-27',
    end_date: '2026-07-04',
    date_display: '27 June – 4 July 2026',
    description: `Roskilde Festival is Scandinavia's greatest music festival and one of the most beloved events in European culture — a non-profit festival that donates its entire surplus to humanitarian causes, now in its 54th edition.\n\nThe 2026 edition brings together 180 acts including musical artists, authors, performers, speakers, graffiti artists and architects. For one extraordinary week, the Roskilde festival grounds become a temporary city with seven stages and 50,000 tents across the site, hosting 130,000 visitors from across the world.\n\nRoskilde's unique soul comes from its community of 27,000 volunteers who run the festival, its commitment to social causes, and its genuinely adventurous programming that combines major international headliners with emerging artists from around the world. The Orange Stage — one of the largest outdoor stages in the world — has hosted Bruce Springsteen, Beyoncé, Kendrick Lamar and hundreds of the world's greatest performers.\n\nRoskilde is 30 minutes by train from Copenhagen. If time allows, visit the UNESCO-listed Roskilde Cathedral while you are there. Camping equipment can be rented on-site for international visitors.`,
    price_display: '€350–€450',
    website: 'https://www.roskilde-festival.dk',
    attendees: 130000,
    vendor_spots: 50,
    image_url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80',
    featured: 1,
    tags: JSON.stringify(['roskilde festival 2026','roskilde 2026','denmark festival','orange stage','roskilde festival denmark']),
    meta_title: 'Roskilde Festival 2026 Denmark — Dates, Lineup & Tickets | Festmore',
    meta_desc: 'Roskilde Festival 2026 — 27 June to 4 July in Roskilde, Denmark. 180 acts, 7 stages, 130,000 visitors. Scandinavia\'s greatest non-profit music festival.',
  },

  // 13 — LA TOMATINA
  {
    title: 'La Tomatina 2026 Buñol',
    slug: 'la-tomatina-2026-bunol',
    category: 'festival',
    city: 'Buñol',
    country: 'ES',
    start_date: '2026-08-26',
    end_date: '2026-08-26',
    date_display: '26 August 2026',
    description: `La Tomatina is the world's most famous food fight — a chaotic, exhilarating and entirely unique event held on the last Wednesday of August each year in the small Spanish town of Buñol, Valencia.\n\nAt precisely 11am, the signal is given and 20,000 participants hurl 125 tonnes of ripe tomatoes at each other for exactly one hour in the narrow streets of Buñol's old town. The origins of the event are disputed — various legends trace it to the 1940s — but its status as one of the most joyfully ridiculous events on earth is undisputed.\n\nTickets are required and strictly limited to 20,000 participants — the event previously attracted over 50,000 people, causing safety concerns. Tickets typically sell out within hours of going on sale. Bring old clothes you are happy to throw away, goggles to protect your eyes, and shoes you can run in.\n\nBuñol is approximately one hour by bus or train from Valencia. The week around La Tomatina also features a programme of music, parades, fireworks and traditional celebrations.`,
    price_display: '€10',
    website: 'https://www.latomatina.info',
    attendees: 20000,
    vendor_spots: 0,
    image_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80',
    featured: 0,
    tags: JSON.stringify(['la tomatina 2026','tomatina bunol','tomato festival spain','la tomatina spain','bunol festival']),
    meta_title: 'La Tomatina 2026 Buñol Spain — Dates, Tickets & Guide | Festmore',
    meta_desc: 'La Tomatina 2026 in Buñol, Spain — 26 August. The world\'s greatest tomato fight. 20,000 participants, 125 tonnes of tomatoes. Tickets, guide and what to expect.',
  },

  // 14 — DEFQON.1
  {
    title: 'Defqon.1 Festival 2026',
    slug: 'defqon1-festival-2026',
    category: 'festival',
    city: 'Biddinghuizen',
    country: 'NL',
    start_date: '2026-06-26',
    end_date: '2026-06-28',
    date_display: '26–28 June 2026',
    description: `Defqon.1 is the world's largest hardstyle festival, held annually at Walibi Holland in Biddinghuizen in the Netherlands. Over 70,000 visitors gather each June for three days of the most intense electronic music experience in Europe.\n\nThe festival's legendary ENDSHOW — a one-hour synchronized laser, fireworks and pyrotechnics ceremony that closes the event — is widely considered one of the most spectacular moments in European festival culture. It has become a pilgrimage for hardstyle fans from around the world.\n\nDefqon.1 is unapologetically dedicated to hardstyle and hardcore — it does not pretend to be genre-diverse. This single-minded focus has created one of the most passionate and devoted festival communities in music. The production quality is extraordinary, with multiple stages featuring world-class stage design, sound systems and lighting.\n\nTickets sell out very quickly. The festival site is approximately 60km from Amsterdam, with shuttle buses running from Harderwijk train station.`,
    price_display: '€89–€195',
    website: 'https://www.defqon1.com',
    attendees: 70000,
    vendor_spots: 0,
    image_url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80',
    featured: 0,
    tags: JSON.stringify(['defqon.1 2026','defqon1 2026','hardstyle festival','netherlands festival','defqon netherlands']),
    meta_title: 'Defqon.1 Festival 2026 Netherlands — Dates, Lineup & Tickets | Festmore',
    meta_desc: 'Defqon.1 2026 in Biddinghuizen, Netherlands — 26–28 June. The world\'s largest hardstyle festival. 70,000 visitors and the legendary ENDSHOW.',
  },

  // 15 — KINGSDAY AMSTERDAM
  {
    title: 'Kingsday Amsterdam 2026',
    slug: 'kingsday-amsterdam-2026',
    category: 'city',
    city: 'Amsterdam',
    country: 'NL',
    start_date: '2026-04-27',
    end_date: '2026-04-27',
    date_display: '27 April 2026',
    description: `Kingsday (Koningsdag) is the Netherlands' greatest national celebration — a city-wide festival that transforms Amsterdam into an extraordinary spectacle of orange, music, markets and community on 27 April each year, the birthday of King Willem-Alexander.\n\nOn Kingsday, Amsterdam's strict rules on street selling are suspended and the entire city becomes a giant outdoor flea market — the vrijmarkt. Children sell their old toys on the pavements, families set up stalls on bridges and in parks, and the city takes on the character of the world's most joyful car boot sale.\n\nSimultaneously, hundreds of free concerts, DJ sets and performances fill the city's parks, squares and boats. The canals fill with thousands of boats decorated in orange — the Dutch national colour — creating one of the most extraordinary visual spectacles in Europe.\n\nEveryone wears orange. The atmosphere is unlike anything else — genuinely joyful, genuinely communal, genuinely Dutch. Kingsday is free to attend. Simply arrive in Amsterdam on 27 April — but book accommodation months in advance as the city is completely full.`,
    price_display: 'Free',
    website: 'https://www.iamsterdam.com',
    attendees: 800000,
    vendor_spots: 0,
    image_url: 'https://images.unsplash.com/photo-1467803738586-46b7eb7b16a1?w=800&q=80',
    featured: 0,
    tags: JSON.stringify(['kingsday 2026','koningsdag 2026','kingsday amsterdam','amsterdam april festival','dutch kings day']),
    meta_title: 'Kingsday Amsterdam 2026 — Koningsdag | Dates & Guide | Festmore',
    meta_desc: 'Kingsday 2026 in Amsterdam — 27 April. The Netherlands\' greatest national celebration. 800,000 visitors, orange everywhere, canals filled with boats. Free entry.',
  },

  // 16 — BURNING MAN EUROPE (NOWHERE)
  {
    title: 'Nowhere Festival 2026 Spain',
    slug: 'nowhere-festival-2026-spain',
    category: 'festival',
    city: 'Zaragoza',
    country: 'ES',
    start_date: '2026-06-24',
    end_date: '2026-06-29',
    date_display: '24–29 June 2026',
    description: `Nowhere is Europe's answer to Burning Man — a radical experiment in community, art and self-expression held in the desert of Aragon, Spain, approximately 70km from Zaragoza.\n\nLike Burning Man, Nowhere operates on principles of radical self-reliance, gifting and community participation. There are no vendors — everything at Nowhere is free, gifted by participants to each other. The extraordinary art installations, theme camps, music stages and workshops are all created and run by the participants themselves.\n\nNowhere draws approximately 3,000 participants from across Europe and beyond for six days in the Spanish desert. The combination of extreme heat, extraordinary dust storms, astonishing art and genuine community creates an experience that participants describe as transformative.\n\nNowhere is not a spectator event — participants are expected to contribute. Theme camps, art installations, volunteers and active participation are what make the event possible. Tickets are limited and sold through a lottery system on the Nowhere website.`,
    price_display: '€150–€200',
    website: 'https://www.goingnowhere.org',
    attendees: 3000,
    vendor_spots: 0,
    image_url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80',
    featured: 0,
    tags: JSON.stringify(['nowhere festival 2026','nowhere spain','burning man europe','aragon festival','spain desert festival']),
    meta_title: 'Nowhere Festival 2026 Spain — Europe\'s Burning Man | Festmore',
    meta_desc: 'Nowhere Festival 2026 in Aragon, Spain — 24–29 June. Europe\'s answer to Burning Man. 3,000 participants in the Spanish desert. Art, community and radical self-expression.',
  },

  // 17 — COMMONWEALTH GAMES GLASGOW
  {
    title: 'Commonwealth Games Glasgow 2026',
    slug: 'commonwealth-games-glasgow-2026',
    category: 'city',
    city: 'Glasgow',
    country: 'GB',
    start_date: '2026-07-23',
    end_date: '2026-08-02',
    date_display: '23 July – 2 August 2026',
    description: `The 2026 Commonwealth Games comes to Glasgow, Scotland — one of the most celebrated sporting and cultural events on the international calendar, bringing together athletes from over 70 nations for 11 days of world-class competition.\n\nGlasgow previously hosted the Commonwealth Games in 2014 to extraordinary acclaim, and the city returns as host for 2026 with a programme spanning athletics, swimming, cycling, gymnastics, boxing, rugby sevens, netball, lawn bowls and many more disciplines across venues throughout the city and wider Scotland.\n\nBeyond the sport, Glasgow 2026 promises an extraordinary cultural programme celebrating Scottish and international arts, music and creativity. The city's famous friendliness, world-class restaurant scene, and exceptional cultural institutions — including Kelvingrove Art Gallery and the Burrell Collection — make Glasgow one of the most rewarding host cities in recent Commonwealth Games history.\n\nTickets for the most popular events sell out quickly. Glasgow's accommodation fills completely during the Games — book well in advance.`,
    price_display: 'From £10',
    website: 'https://www.glasgow2026.com',
    attendees: 1000000,
    vendor_spots: 0,
    image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
    featured: 0,
    tags: JSON.stringify(['commonwealth games 2026','commonwealth games glasgow','glasgow 2026','scotland 2026 events','glasgow sports 2026']),
    meta_title: 'Commonwealth Games Glasgow 2026 — Dates, Tickets & Guide | Festmore',
    meta_desc: 'Commonwealth Games 2026 in Glasgow — 23 July to 2 August. 70+ nations competing across 11 days of world-class sport and culture in Scotland.',
  },

  // 18 — MILAN CORTINA WINTER OLYMPICS
  {
    title: 'Milan Cortina 2026 Winter Olympics',
    slug: 'milan-cortina-2026-winter-olympics',
    category: 'city',
    city: 'Milan',
    country: 'IT',
    start_date: '2026-02-06',
    end_date: '2026-02-22',
    date_display: '6–22 February 2026',
    description: `The 2026 Winter Olympic Games — officially Milano Cortina 2026 — is one of the world's greatest sporting events, bringing the Winter Olympics to Italy for the first time since Turin 2006. Competition takes place across two main venues: Milan (for indoor sports including ice hockey, figure skating and short track speed skating) and Cortina d'Ampezzo (for alpine skiing, ski jumping, biathlon and other mountain sports).\n\nThe Games feature approximately 3,000 athletes from over 90 nations competing across 116 events in 15 winter sports disciplines. The extraordinary setting of the Italian Alps — among the most dramatic mountain scenery in Europe — combined with Italian style and culture creates an atmosphere unlike any previous Winter Olympics.\n\nMilan itself is one of Europe's great cities, with world-class fashion, design, food and art. The Galleria Vittorio Emanuele II, the Duomo, and La Scala opera house are essential visits. Cortina d'Ampezzo is one of the world's most beautiful alpine resorts.\n\nTickets for the most popular events including figure skating and alpine skiing are in extremely high demand. Book accommodation across both venues well in advance.`,
    price_display: 'From €25',
    website: 'https://www.olympics.com/en/olympic-games/milan-cortina-2026',
    attendees: 2000000,
    vendor_spots: 0,
    image_url: 'https://images.unsplash.com/photo-1551524559-8af4e6624178?w=800&q=80',
    featured: 1,
    tags: JSON.stringify(['milan cortina 2026','winter olympics 2026','milano cortina','winter olympics italy','olympic games 2026']),
    meta_title: 'Milan Cortina 2026 Winter Olympics — Dates, Tickets & Guide | Festmore',
    meta_desc: 'Milan Cortina 2026 Winter Olympics — 6–22 February. The Winter Games come to Italy. 3,000 athletes, 116 events across Milan and the Italian Alps.',
  },

  // 19 — UNTOLD FESTIVAL ROMANIA
  {
    title: 'Untold Festival 2026 Cluj-Napoca',
    slug: 'untold-festival-2026-cluj',
    category: 'festival',
    city: 'Cluj-Napoca',
    country: 'HU',
    start_date: '2026-07-30',
    end_date: '2026-08-02',
    date_display: '30 July – 2 August 2026',
    description: `Untold is Eastern Europe's greatest electronic music festival — and one of Europe's fastest growing, held in Cluj-Napoca, Romania's vibrant university city. The 2026 edition returns with a spectacular lineup including Calvin Harris, Paul van Dyk, and Marshmello headlining a programme that balances stadium EDM with techno and drum and bass.\n\nUntold spans multiple stages across Cluj's arena complex and stadium, creating a festival city that draws over 350,000 visitors from across Europe. Cluj's youthful energy — driven by its enormous student population from one of Romania's leading universities — gives Untold a distinctly passionate and vibrant atmosphere.\n\nFor festival-goers seeking the scale and production quality of Western European events without Western European prices, Untold is the outstanding value proposition in European festival culture. Romania is significantly more affordable than Western Europe for accommodation, food, transport and entertainment.\n\nCluj-Napoca is served by Cluj Airport with connections to major European hubs. The city's medieval old town, vibrant cafe culture and warm hospitality make it a genuinely rewarding destination beyond the festival.`,
    price_display: '€89–€199',
    website: 'https://untoldfestival.com',
    attendees: 350000,
    vendor_spots: 0,
    image_url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80',
    featured: 0,
    tags: JSON.stringify(['untold festival 2026','untold cluj','romania festival 2026','eastern europe festival','calvin harris 2026']),
    meta_title: 'Untold Festival 2026 Cluj-Napoca Romania — Dates & Lineup | Festmore',
    meta_desc: 'Untold Festival 2026 in Cluj-Napoca — 30 July to 2 August. Eastern Europe\'s greatest electronic festival. Calvin Harris, Paul van Dyk. 350,000 visitors.',
  },

  // 20 — ELECTRIC PICNIC IRELAND
  {
    title: 'Electric Picnic 2026 Ireland',
    slug: 'electric-picnic-2026-ireland',
    category: 'festival',
    city: 'Stradbally',
    country: 'IE',
    start_date: '2026-09-04',
    end_date: '2026-09-06',
    date_display: '4–6 September 2026',
    description: `Electric Picnic is Ireland's greatest music and arts festival — a beloved annual gathering at the beautiful Stradbally Estate in County Laois that combines major musical headliners with an extraordinary programme of comedy, theatre, spoken word, food and art.\n\nFounded in 2004, Electric Picnic has become a defining event in the Irish cultural calendar, drawing 70,000 visitors each September to the lush green grounds of Stradbally Estate. The festival's combination of scale and intimacy — it never feels overwhelming despite its size — and its relentlessly creative programming have built one of the most loyal festival audiences in Europe.\n\nBeyond the main stages, Electric Picnic offers an extraordinary range of experiences: the Mindfield spoken word and arts arena, the Body and Soul wellness area, Trailer Park and Hazel Wood for alternative programming, and a food village that sets the standard for festival catering in Ireland.\n\nThe festival takes place just 90 minutes from Dublin by road or bus. Camping is available on-site. Tickets sell out very quickly — register on the Electric Picnic website immediately to receive ticket sale notifications.`,
    price_display: '€229–€280',
    website: 'https://www.electricpicnic.ie',
    attendees: 70000,
    vendor_spots: 30,
    image_url: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&q=80',
    featured: 0,
    tags: JSON.stringify(['electric picnic 2026','electric picnic ireland','stradbally festival','ireland festival 2026','EP2026']),
    meta_title: 'Electric Picnic 2026 Ireland — Dates, Lineup & Tickets | Festmore',
    meta_desc: 'Electric Picnic 2026 in Stradbally, Ireland — 4–6 September. Ireland\'s greatest music and arts festival. 70,000 visitors at Stradbally Estate. Lineup and tickets.',
  },

];

// ─── INSERT ───────────────────────────────────────────────────────────────────
let added = 0, updated = 0, skipped = 0;

for (const e of events) {
  try {
    const exists = db.prepare('SELECT id FROM events WHERE slug=?').get(e.slug);

    if (exists) {
      // Update with better info
      db.prepare(`
        UPDATE events SET
          title=?, category=?, city=?, country=?, start_date=?, end_date=?,
          date_display=?, description=?, price_display=?, website=?,
          attendees=?, vendor_spots=?, image_url=?, featured=?,
          tags=?, meta_title=?, meta_desc=?,
          status='active', payment_status='paid'
        WHERE slug=?
      `).run(
        e.title, e.category, e.city, e.country, e.start_date, e.end_date||'',
        e.date_display, e.description, e.price_display, e.website||'',
        e.attendees||0, e.vendor_spots||0, e.image_url||'', e.featured||0,
        e.tags||'[]', e.meta_title||'', e.meta_desc||'', e.slug
      );
      updated++;
      console.log('🔄 Updated:', e.title.substring(0,55));
    } else {
      db.prepare(`
        INSERT INTO events (
          title, slug, category, city, country, start_date, end_date,
          date_display, description, price_display, website,
          attendees, vendor_spots, image_url, featured,
          tags, meta_title, meta_desc,
          status, payment_status, source, views
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'active','paid','manual',0)
      `).run(
        e.title, e.slug, e.category, e.city, e.country, e.start_date, e.end_date||'',
        e.date_display, e.description, e.price_display, e.website||'',
        e.attendees||0, e.vendor_spots||0, e.image_url||'', e.featured||0,
        e.tags||'[]', e.meta_title||'', e.meta_desc||''
      );
      added++;
      console.log('✅ Added:', e.title.substring(0,55));
    }
  } catch(err) {
    console.error('❌ Error:', e.title.substring(0,40), '—', err.message);
    skipped++;
  }
}

console.log(`\n✅ Done! Added: ${added} · Updated: ${updated} · Skipped: ${skipped}`);
db.close();
