// add-holland-flea-markets.js
// Run with: node add-holland-flea-markets.js
// Adds 10 real Dutch flea markets with full SEO descriptions

const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, 'db', 'festmore.db'));

const events = [
  {
    title: 'Waterlooplein Flea Market Amsterdam 2025',
    category: 'flea',
    city: 'Amsterdam',
    country: 'NL',
    start_date: '2025-01-01',
    end_date: '2025-12-31',
    date_display: 'Open Monday to Saturday, year-round',
    description: `Waterlooplein Flea Market is Amsterdam's most famous and beloved open-air market, operating continuously since 1886 on the square adjacent to the Dutch National Opera and Ballet. This legendary market is one of the oldest flea markets in the world and a true Amsterdam institution that locals and tourists have been visiting for over 130 years.

Spread across Waterlooplein square in the heart of Amsterdam's Jewish Quarter, the market hosts over 300 stalls selling an extraordinary range of goods: vintage clothing and leather jackets, military surplus, secondhand books and vinyl records, bicycle parts, antique jewellery, tools, electronics, art prints, curiosities and all manner of unexpected treasures. It is the quintessential Amsterdam flea market experience.

The market occupies one of Amsterdam's most historically significant locations. The square was the centre of Amsterdam's Jewish community for centuries and was the site of the city's original fish market before being cleared in the early 20th century. Today it sits between the Joods Historisch Museum, the Portuguese Synagogue and the Muziektheater — making a visit to Waterlooplein a cultural experience as much as a shopping trip.

Vendors at Waterlooplein are a mix of professional secondhand dealers, artists and private sellers. The quality and price range vary enormously — experienced market visitors know that the best finds require patience, an early arrival and a willingness to dig through the rails and boxes. Bargaining is expected and part of the fun.

Whether you are hunting for a vintage Amsterdam cycling jacket, a Dutch antique, secondhand vinyl or simply the atmosphere of one of Europe's great urban markets, Waterlooplein delivers an experience that cannot be found in any shop or online marketplace.`,
    price_display: 'Free Entry',
    price_from: 0,
    attendees: 15000,
    vendor_spots: 300,
    website: 'https://www.waterlooplein.amsterdam',
    ticket_url: '',
    address: 'Waterlooplein, 1011 PG Amsterdam, Netherlands',
    featured: 1,
    tags: JSON.stringify(['flea market', 'amsterdam', 'netherlands', 'waterlooplein', 'vintage', 'antiques', 'secondhand', 'holland']),
    image_url: 'https://images.unsplash.com/photo-1558402847-7f9d6d65b41c?w=800&q=80',
    meta_title: 'Waterlooplein Flea Market Amsterdam 2025 — Guide & Info | Festmore',
    meta_desc: 'Waterlooplein Flea Market Amsterdam: 300+ stalls of vintage clothing, antiques and treasures open Monday-Saturday. Amsterdam\'s oldest and most famous flea market since 1886.',
  },
  {
    title: 'IJ-Hallen Flea Market Amsterdam 2025',
    category: 'flea',
    city: 'Amsterdam',
    country: 'NL',
    start_date: '2025-03-01',
    end_date: '2025-11-30',
    date_display: 'Monthly, March–November 2025',
    description: `IJ-Hallen is Europe's largest indoor flea market, held once a month in a vast former shipyard on the north bank of the IJ waterway in Amsterdam. With over 750 stalls spread across 18,000 square metres of industrial warehouse space, IJ-Hallen is a truly extraordinary flea market experience unlike anything else in the Netherlands or Europe.

The market takes place in the historic NDSM shipyard — a massive industrial complex that has been transformed into one of Amsterdam's most creative cultural destinations. The combination of the dramatic industrial architecture, the waterfront location and the sheer scale of the market creates an atmosphere that is genuinely unique. Reaching the market by the free ferry from Amsterdam Centraal Station, watching the city's famous skyline recede as you cross the IJ, is part of the experience.

The range of goods at IJ-Hallen is staggering. Hundreds of professional dealers and private sellers offer vintage furniture, designer clothing and accessories, antique glassware and ceramics, vinyl records, books, art, electronics, bicycles, toys, mid-century modern pieces, industrial objects and every imaginable category of secondhand goods. The market attracts serious antique and vintage collectors from across Europe who make the monthly pilgrimage specifically for its scale and quality.

IJ-Hallen is held on two consecutive days each month — typically a Saturday and Sunday — from early morning until late afternoon. Arrive as early as possible for the best selection; the most knowledgeable dealers arrive at opening time. Food stalls and coffee vendors are spread throughout the market, making it easy to spend the entire day browsing.

The surrounding NDSM area is also worth exploring — the wharf hosts restaurants, street art, artist studios and cultural venues that make it one of Amsterdam's most interesting neighbourhoods. Combined with the ferry crossing and the extraordinary scale of the market itself, IJ-Hallen offers one of Amsterdam's most complete and memorable experiences.`,
    price_display: '€5 entry',
    price_from: 5,
    attendees: 40000,
    vendor_spots: 750,
    website: 'https://www.ijhallen.nl',
    ticket_url: 'https://www.ijhallen.nl/tickets',
    address: 'TT Neveritaweg 15, 1033 WB Amsterdam, Netherlands',
    featured: 1,
    tags: JSON.stringify(['flea market', 'amsterdam', 'netherlands', 'IJ-hallen', 'NDSM', 'vintage', 'indoor market', 'europe largest flea market']),
    image_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80',
    meta_title: 'IJ-Hallen Amsterdam 2025 — Europe\'s Largest Flea Market | Festmore',
    meta_desc: 'IJ-Hallen Amsterdam: Europe\'s largest flea market with 750+ stalls in a historic shipyard. Monthly events March-November 2025. Vintage, antiques, furniture and more.',
  },
  {
    title: 'Rommelmarkt Rotterdam Binnenrotte 2025',
    category: 'flea',
    city: 'Rotterdam',
    country: 'NL',
    start_date: '2025-01-01',
    end_date: '2025-12-31',
    date_display: 'Every Tuesday and Saturday, year-round',
    description: `The Binnenrotte market in Rotterdam is one of the largest outdoor markets in the Netherlands, taking place twice weekly on the vast open square at the heart of Rotterdam's city centre. On Saturdays, the market transforms into a vibrant mix of fresh produce, flowers, clothing and secondhand goods that draws tens of thousands of Rotterdam residents and visitors.

Rotterdam's city centre market has a distinctive character shaped by the city's history. Unlike Amsterdam, Rotterdam was almost entirely rebuilt after devastating bombing in May 1940, and the city's bold modernist architecture — including the extraordinary Markthal food hall that overlooks the market square — creates a unique urban backdrop. Shopping at Binnenrotte feels unmistakably Rotterdam: direct, diverse and unpretentious.

The secondhand and flea market section of Binnenrotte offers a constantly changing selection of vintage clothing, household goods, books, electronics, tools, ceramics and antiques. Local dealers set up alongside private sellers clearing out their homes, creating the mix of quality and unpredictability that makes a great flea market. Prices are generally lower than Amsterdam's markets, reflecting Rotterdam's more working-class market culture.

The surrounding area enhances the experience considerably. The Markthal — a spectacular horseshoe-shaped building with a ceiling covered in an enormous food-themed artwork — contains dozens of specialty food stalls. The Cube Houses (Kubuswoningen) and the Laurenskerk medieval church are within walking distance. Rotterdam's extraordinary contemporary architecture makes the whole city worth exploring on market day.

The market runs in all weather. Dress appropriately for Dutch conditions — rain is common and the square can be exposed to wind from the nearby Maas river. The reward for braving the elements is a genuine local experience that most tourists to the Netherlands never encounter.`,
    price_display: 'Free Entry',
    price_from: 0,
    attendees: 25000,
    vendor_spots: 400,
    website: 'https://www.rotterdam.nl/markt',
    ticket_url: '',
    address: 'Binnenrotte, 3011 Rotterdam, Netherlands',
    featured: 0,
    tags: JSON.stringify(['flea market', 'rotterdam', 'netherlands', 'binnenrotte', 'rommelmarkt', 'secondhand', 'outdoor market', 'holland']),
    image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    meta_title: 'Rotterdam Binnenrotte Flea Market 2025 — Every Tuesday & Saturday | Festmore',
    meta_desc: 'Binnenrotte market Rotterdam: one of the Netherlands\' largest outdoor markets open every Tuesday and Saturday. Vintage, secondhand and flea market goods year-round.',
  },
  {
    title: 'Bevrijdingsmarkt Utrecht 2025',
    category: 'flea',
    city: 'Utrecht',
    country: 'NL',
    start_date: '2025-05-05',
    end_date: '2025-05-05',
    date_display: '5 May 2025 — Liberation Day',
    description: `The Bevrijdingsmarkt — Liberation Day Market — is one of the Netherlands' most beloved and uniquely Dutch traditions, taking place every year on 5 May to mark the anniversary of the liberation of the Netherlands from Nazi occupation in 1945. On this national holiday, the entire country transforms into one enormous flea market as millions of Dutch people set up stalls outside their homes, in streets, parks and squares to sell secondhand goods.

Utrecht's Liberation Day market is one of the largest and most atmospheric in the country, transforming the city's beautiful medieval centre into a vast open-air market stretching from the iconic Dom Tower through the historic canal-lined streets of the Binnenstad. The combination of Utrecht's extraordinary medieval architecture — its canals, Gothic churches and ancient university buildings — with the festive atmosphere of a national holiday creates something genuinely special.

Liberation Day in the Netherlands carries deep emotional significance. The tradition of selling secondhand goods on this day began as a way of celebrating freedom and the return to normal life after five years of occupation. Today it has evolved into a joyful national tradition in which participation feels like a civic act as much as a commercial one. The atmosphere throughout Utrecht on 5 May is festive and communal — street musicians play, cafés set up outdoor terraces and the city's residents take collective pride in their shared public spaces.

The range of goods on offer is the full spectrum of Dutch domestic life: vintage bicycles (naturally), household items, clothing, books, vinyl records, children's toys, artwork and all manner of domestic objects being passed from one home to another. Prices are generally very low — this is not a professional antiques market but a genuine community event.

For visitors to the Netherlands, timing a visit to coincide with Bevrijdingsmarkt on 5 May offers an incomparable insight into Dutch culture, history and the uniquely Dutch relationship with public space and community. Book accommodation well in advance as Utrecht fills up on this national holiday.`,
    price_display: 'Free Entry',
    price_from: 0,
    attendees: 100000,
    vendor_spots: 2000,
    website: 'https://www.bevrijdingsdag.nl',
    ticket_url: '',
    address: 'Domplein and city centre, Utrecht, Netherlands',
    featured: 1,
    tags: JSON.stringify(['flea market', 'utrecht', 'netherlands', 'liberation day', 'bevrijdingsmarkt', 'national holiday', '5 mei', 'vintage']),
    image_url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80',
    meta_title: 'Utrecht Liberation Day Flea Market 2025 — 5 May | Festmore',
    meta_desc: 'Utrecht Bevrijdingsmarkt 5 May 2025: The Netherlands\' famous Liberation Day flea market transforms Utrecht\'s medieval centre into a massive open-air market.',
  },
  {
    title: 'Antiekmarkt De Looier Amsterdam 2025',
    category: 'flea',
    city: 'Amsterdam',
    country: 'NL',
    start_date: '2025-01-01',
    end_date: '2025-12-31',
    date_display: 'Open Wednesday to Sunday, year-round',
    description: `Antiekmarkt De Looier is Amsterdam's premier indoor antique market, occupying a labyrinthine complex of interconnected warehouses in the Jordaan neighbourhood — one of Amsterdam's most charming and historic districts. With over 80 permanent dealers spread across multiple floors and rooms, De Looier offers a curated, high-quality antiques shopping experience that is quite different from the outdoor flea markets.

De Looier has been operating since 1978 and has built a reputation as one of the Netherlands' most respected antique markets. The permanent dealers specialise in a wide range of periods and categories: Dutch Golden Age paintings and prints, Delftware pottery, Art Deco and Art Nouveau furniture and objects, vintage silverware, antique maps and engravings, Dutch tiles, Jugendstil jewellery, vintage fashion, rare books and paper ephemera. The quality is consistently high and the dealers are knowledgeable and passionate about their specialties.

The Jordaan setting adds enormously to the De Looier experience. The neighbourhood's narrow streets, independent galleries, specialist food shops and brown cafés (bruine kroegen) make it one of Amsterdam's most rewarding areas to explore. Many visitors combine a morning at De Looier with lunch at one of the excellent neighbourhood restaurants and an afternoon exploring the Jordaan's independent boutiques and galleries.

Unlike the outdoor markets, De Looier is entirely weatherproof and comfortable in all seasons. The covered warren of rooms, each filled with its own dealer's carefully arranged collection, creates an atmosphere of discovery that rewards unhurried browsing. Pieces range in price from affordable vintage finds to significant collector's items — De Looier caters to both browsers and serious collectors.

On Saturdays, additional sellers set up in the main hall, expanding the range and bringing a more flea-market atmosphere to the usually more formal indoor space. For first-time visitors, a Saturday visit offers the most complete De Looier experience.`,
    price_display: 'Free Entry',
    price_from: 0,
    attendees: 3000,
    vendor_spots: 80,
    website: 'https://www.antiekmarktdelooier.nl',
    ticket_url: '',
    address: 'Elandsgracht 109, 1016 TZ Amsterdam, Netherlands',
    featured: 0,
    tags: JSON.stringify(['antique market', 'amsterdam', 'netherlands', 'de looier', 'jordaan', 'antiques', 'vintage', 'indoor market']),
    image_url: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=800&q=80',
    meta_title: 'Antiekmarkt De Looier Amsterdam 2025 — Indoor Antique Market | Festmore',
    meta_desc: 'De Looier Amsterdam: premier indoor antique market in the Jordaan with 80+ specialist dealers. Open Wed-Sun year-round. Dutch antiques, Art Deco, Delftware and more.',
  },
  {
    title: 'Haagse Markt Den Haag 2025',
    category: 'flea',
    city: 'Den Haag',
    country: 'NL',
    start_date: '2025-01-01',
    end_date: '2025-12-31',
    date_display: 'Every Monday, Wednesday, Friday and Saturday',
    description: `The Haagse Markt in Den Haag (The Hague) is one of the largest and most culturally diverse open-air markets in Western Europe, and one of the Netherlands' most extraordinary market experiences. Operating four days per week on the vast Herman Costerstraat in the Transvaal neighbourhood, the market reflects the extraordinary multicultural character of Den Haag — one of Europe's most diverse cities.

With over 700 stalls spread across several streets, the Haagse Markt is enormous. The main market covers fresh produce, international food, clothing and household goods, but woven throughout are secondhand and flea market stalls offering vintage clothing, antiques, ceramics, books, electronics and the full range of pre-owned goods. The flea market element is particularly strong on Saturdays when additional private sellers join the regular dealers.

What makes the Haagse Markt truly special is its cultural diversity. Surinamese, Indonesian, Moroccan, Turkish, Antillean and Dutch vendors sell side by side, creating a sensory landscape unlike any other market in the Netherlands. The food alone is extraordinary — fresh stroopwafels, Surinamese roti, Indonesian satay, Moroccan pastries and Dutch herring are all available within a short walk. For food lovers, the Haagse Markt is one of the best culinary destinations in the Netherlands.

Den Haag's status as the seat of the Dutch government and home to the International Court of Justice gives it a distinctive character — more formal and international than Amsterdam, with extraordinary museums including the Mauritshuis (home to Vermeer's Girl with a Pearl Earring) and the Gemeentemuseum. Combining a visit to the Haagse Markt with the Mauritshuis makes for an exceptional day in one of the Netherlands' most underappreciated cities.

The market runs in all weather and is genuinely local — unlike Amsterdam's tourist-oriented markets, the Haagse Markt is primarily where Den Haag residents do their weekly shopping. This gives it an authenticity and energy that is increasingly rare in European city markets.`,
    price_display: 'Free Entry',
    price_from: 0,
    attendees: 30000,
    vendor_spots: 700,
    website: 'https://www.denhaag.nl/haagse-markt',
    ticket_url: '',
    address: 'Herman Costerstraat, 2531 Den Haag, Netherlands',
    featured: 0,
    tags: JSON.stringify(['flea market', 'den haag', 'the hague', 'netherlands', 'haagse markt', 'outdoor market', 'multicultural', 'secondhand']),
    image_url: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800&q=80',
    meta_title: 'Haagse Markt Den Haag 2025 — The Hague\'s Largest Market | Festmore',
    meta_desc: 'Haagse Markt Den Haag: one of Europe\'s largest outdoor markets with 700+ stalls open 4 days a week. Fresh food, vintage, flea market and incredible multicultural atmosphere.',
  },
  {
    title: 'Spui Antique Book Market Amsterdam 2025',
    category: 'flea',
    city: 'Amsterdam',
    country: 'NL',
    start_date: '2025-03-01',
    end_date: '2025-11-30',
    date_display: 'Every Friday, March–November 2025',
    description: `The Spui Antique Book Market is one of Amsterdam's most civilised and charming weekly events, transforming the beautiful Spui square in the heart of the city centre into an open-air secondhand and antiquarian book market every Friday from spring through autumn. For book lovers, it is one of Amsterdam's essential experiences.

The Spui itself is one of Amsterdam's most attractive squares — a quiet, car-free space surrounded by independent bookshops, the historic Begijnhof courtyard (a hidden medieval sanctuary just steps from the square) and several excellent café-bars with outdoor terraces. The Friday book market adds another dimension to what is already a perfect Amsterdam setting.

Around 25 specialist booksellers set up their stalls each Friday, offering a wide range of Dutch and international books: antiquarian volumes, first editions, illustrated art books, vintage travel guides, rare maps, academic texts, Dutch children's classics, philosophy, history and fiction in multiple languages. The standard is high — these are serious booksellers with genuine expertise in their specialties, not merely people selling boxes of books from their attic.

For Dutch-language readers, the Spui book market is an excellent source for classic Dutch literature, rare editions of Dutch Golden Age texts and out-of-print Dutch titles. For international visitors, the art books, vintage travel guides, maps and illustrated volumes offer accessible collecting regardless of language. English-language books are well represented across most of the stalls.

The Spui location makes it easy to combine the book market with a visit to the nearby Amsterdam Museum, the Begijnhof or a coffee at one of the cafés overlooking the square. Amsterdammers have been coming to browse books on the Spui for decades — joining this weekly ritual connects you to the city's deep literary culture in a way that no tourist attraction can replicate.`,
    price_display: 'Free Entry',
    price_from: 0,
    attendees: 2000,
    vendor_spots: 25,
    website: 'https://www.boekenmarktophetspui.nl',
    ticket_url: '',
    address: 'Spui, 1012 WX Amsterdam, Netherlands',
    featured: 0,
    tags: JSON.stringify(['book market', 'amsterdam', 'netherlands', 'spui', 'antiquarian books', 'secondhand books', 'vintage books', 'friday market']),
    image_url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80',
    meta_title: 'Spui Antique Book Market Amsterdam 2025 — Every Friday | Festmore',
    meta_desc: 'Amsterdam\'s Spui Book Market: 25 antiquarian booksellers every Friday March-November on Amsterdam\'s most beautiful square. Rare books, maps, first editions.',
  },
  {
    title: 'Koningsdag Vrijmarkt Amsterdam 2025',
    category: 'flea',
    city: 'Amsterdam',
    country: 'NL',
    start_date: '2025-04-26',
    end_date: '2025-04-27',
    date_display: '26–27 April 2025 — King\'s Day',
    description: `Koningsdag — King's Day — is the Netherlands' most exuberant national celebration, and the Vrijmarkt (Free Market) that accompanies it is one of the most extraordinary flea market events in the world. Every year on 27 April (or 26 April if the 27th falls on a Sunday), the entire Netherlands turns orange and millions of people take to the streets to celebrate the King's birthday — and sell their unwanted possessions.

Amsterdam's King's Day celebrations are legendary. The city's canals fill with orange-clad boat parties. Every street, park, bridge and canal-side becomes a spontaneous outdoor market as residents young and old set up stalls to sell secondhand clothes, toys, books, household goods and anything else they want to clear out. Children sell lemonade and their old toys. Families spread blankets and lay out their worldly excess. The atmosphere is simultaneously festive, chaotic and uniquely Dutch.

The Amsterdam Vrijmarkt is officially free — anyone can sell anywhere without a permit, making it the most democratic market imaginable. Prices are negotiable and often very low. The best treasures — vintage Amsterdam cycling jerseys, Dutch design objects, antique Delftware, rare vinyl and unexpected curiosities — go quickly, so serious hunters arrive in the early morning hours.

Beyond the market itself, Amsterdam on King's Day is a spectacle. The canals are packed with boats carrying sound systems playing Dutch pop. Orange is everywhere — clothing, wigs, face paint. Street performers, DJs and musicians fill every square. The city's usual elegant restraint is entirely abandoned in favour of collective joy.

King's Day in Amsterdam is an absolutely essential Dutch experience. If you are visiting the Netherlands in late April, arranging your trip to coincide with Koningsdag is one of the best decisions you can make. Book accommodation many months in advance — Amsterdam fills completely for King's Day weekend.`,
    price_display: 'Free Entry',
    price_from: 0,
    attendees: 800000,
    vendor_spots: 10000,
    website: 'https://www.iamsterdam.com/koningsdag',
    ticket_url: '',
    address: 'Throughout Amsterdam city centre, Netherlands',
    featured: 1,
    tags: JSON.stringify(['koningsdag', 'kings day', 'vrijmarkt', 'amsterdam', 'netherlands', 'national holiday', 'flea market', 'orange']),
    image_url: 'https://images.unsplash.com/photo-1467803738586-46b7eb7b16a1?w=800&q=80',
    meta_title: 'Amsterdam King\'s Day Vrijmarkt 2025 — 26-27 April | Festmore',
    meta_desc: 'Amsterdam Koningsdag Vrijmarkt 2025: The world\'s most unique flea market on King\'s Day 26-27 April. 800,000 visitors, entire city turns orange, everyone sells everything.',
  },
  {
    title: 'Maastricht Antiques and Art Fair TEFAF 2026',
    category: 'exhibition',
    city: 'Maastricht',
    country: 'NL',
    start_date: '2026-03-07',
    end_date: '2026-03-16',
    date_display: '7–16 March 2026',
    description: `TEFAF Maastricht — The European Fine Art Fair — is the most prestigious art and antiques fair in the world, held annually in the beautiful southern Dutch city of Maastricht. For ten days each March, the city's MECC exhibition centre becomes the global meeting point for the world's leading art dealers, collectors, museum curators and cultural institutions.

With around 270 exhibitors from 20 countries presenting works spanning 7,000 years of art history — from ancient Egyptian artefacts to contemporary paintings, medieval manuscripts to Impressionist masterpieces — TEFAF represents the very pinnacle of the art market. The standard of vetting is extraordinary: every object is examined by a panel of experts before the fair opens, ensuring that nothing misattributed or in questionable condition appears on the stands.

TEFAF attracts over 70,000 visitors during its ten-day run, including museum directors and curators from the world's greatest institutions, major collectors and serious buyers from across the globe. Major acquisitions for public collections regularly take place at TEFAF — it is estimated that over €1 billion in art and antiques changes hands during the fair each year.

Beyond the commercial fair, TEFAF offers an extraordinary public experience. Walking through the booths of 270 world-class dealers is a museum visit of unparalleled quality. Old Master paintings hang alongside ancient sculpture. Renaissance jewellery sits next to post-war photography. The breadth and depth of human artistic achievement on display in a single space is breathtaking.

Maastricht itself enhances the TEFAF experience enormously. The city's historic centre — with its Roman origins, medieval fortifications, extraordinary Romanesque churches and excellent restaurants — is one of the Netherlands' most beautiful and sophisticated. The combination of TEFAF and a few days exploring Maastricht's extraordinary cultural heritage makes for one of Europe's most complete cultural trips.`,
    price_display: '€35–€50',
    price_from: 35,
    attendees: 70000,
    vendor_spots: 270,
    website: 'https://www.tefaf.com',
    ticket_url: 'https://www.tefaf.com/tickets',
    address: 'MECC Maastricht, Forum 100, 6229 GV Maastricht, Netherlands',
    featured: 1,
    tags: JSON.stringify(['TEFAF', 'maastricht', 'netherlands', 'art fair', 'antiques', 'fine art', 'collectors', 'world class']),
    image_url: 'https://images.unsplash.com/photo-1580136579312-94651dfd596d?w=800&q=80',
    meta_title: 'TEFAF Maastricht 2026 — World\'s Greatest Art and Antiques Fair | Festmore',
    meta_desc: 'TEFAF Maastricht 2026: The world\'s most prestigious art and antiques fair with 270 dealers from 20 countries. Mar 7-16, 2026 in Maastricht, Netherlands.',
  },
  {
    title: 'Noordermarkt Amsterdam Flea Market 2025',
    category: 'flea',
    city: 'Amsterdam',
    country: 'NL',
    start_date: '2025-01-01',
    end_date: '2025-12-31',
    date_display: 'Every Monday morning, year-round',
    description: `The Noordermarkt Monday flea market is one of Amsterdam's best-kept secrets and most authentically local market experiences. Every Monday morning from the early hours until early afternoon, the square surrounding the beautiful 17th-century Noorderkerk (North Church) in the heart of the Jordaan neighbourhood fills with vendors selling vintage clothing, antiques, secondhand books, vinyl records, household items and the full range of pre-owned goods.

The Noordermarkt has a distinctly local character that contrasts sharply with Amsterdam's more tourist-oriented markets. The vendors are predominantly Amsterdam residents and professional secondhand dealers who know their stock well. Prices are negotiable and reflect genuine secondhand values rather than tourist premiums. Early arrivals — the market opens around 9am — find the best selection before the dealers and collectors arrive.

The Jordaan setting is one of Amsterdam's most intimate and beautiful. The neighbourhood's narrow streets, canal-side houses and independent shops create a village-within-a-city atmosphere that is authentically Amsterdam. The Noorderkerk itself — built in 1623 — is one of the oldest Protestant churches in Amsterdam and provides a magnificent architectural centrepiece for the market.

On Saturdays, the Noordermarkt transforms into a farmers market (Boerenmarkt) selling organic produce, artisan cheeses, fresh bread and Dutch specialty foods. Combining a Monday flea market visit with a Saturday food market visit gives a complete picture of how the Jordaan's most beloved square functions across the week.

After browsing the market, the surrounding Jordaan streets reward exploration. The neighbourhood contains some of Amsterdam's best independent restaurants, gallery spaces, vintage shops and the extraordinary Amsterdam Tulip Museum. Café Papeneiland on the nearby Prinsengracht, serving apple pie since 1642, is the ideal place to rest after a morning of market hunting.`,
    price_display: 'Free Entry',
    price_from: 0,
    attendees: 5000,
    vendor_spots: 100,
    website: 'https://www.noordermarkt-amsterdam.nl',
    ticket_url: '',
    address: 'Noordermarkt, 1015 MV Amsterdam, Netherlands',
    featured: 0,
    tags: JSON.stringify(['flea market', 'amsterdam', 'netherlands', 'noordermarkt', 'jordaan', 'vintage', 'monday market', 'antiques']),
    image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
    meta_title: 'Noordermarkt Amsterdam Flea Market 2025 — Every Monday | Festmore',
    meta_desc: 'Noordermarkt Amsterdam: authentic local flea market every Monday in the Jordaan neighbourhood. Vintage clothing, antiques, books and vinyl. Free entry year-round.',
  },
];

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
      console.log('Skipping duplicate: ' + event.title);
      skipped++;
      continue;
    }

    let slug = slugify(event.title);
    let i = 1;
    while (db.prepare('SELECT id FROM events WHERE slug=?').get(slug)) {
      slug = slugify(event.title) + '-' + i++;
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
      event.attendees || 0, event.vendor_spots || 0,
      event.website || '', event.ticket_url || '', event.address || '',
      event.featured || 0, event.tags || '[]',
      event.image_url || '', event.meta_title || '', event.meta_desc || ''
    );

    added++;
    console.log('Added: ' + event.title);
  } catch (err) {
    console.error('Error adding ' + event.title + ': ' + err.message);
  }
}

console.log('\nDone! Added ' + added + ' Dutch flea markets, skipped ' + skipped + ' duplicates.');
db.close();
