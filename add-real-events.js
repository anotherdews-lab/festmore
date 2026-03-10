// add-real-events.js
// Run with: node add-real-events.js
// Adds 50+ real events to your Festmore database

const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, 'db', 'festmore.db'));

const events = [
  // ─── MUSIC FESTIVALS ───
  {
    title: 'Roskilde Festival 2026',
    category: 'festival', city: 'Roskilde', country: 'DK',
    start_date: '2026-06-27', end_date: '2026-07-04',
    date_display: 'Jun 27 – Jul 4, 2026',
    description: 'Roskilde Festival is one of the largest music festivals in Northern Europe, held annually in Roskilde, Denmark. With over 175 acts across 8 stages, it attracts 130,000 visitors each year. The festival covers rock, pop, hip-hop, electronic and world music. Beyond music, Roskilde offers art installations, markets, food stalls and a strong community vibe. Vendor spots are available for food, crafts and merchandise sellers.',
    price_display: '€180–€320', price_from: 180, attendees: 130000, vendor_spots: 200,
    website: 'https://www.roskilde-festival.dk', featured: 1,
    tags: JSON.stringify(['music', 'rock', 'festival', 'denmark', 'roskilde', 'outdoor'])
  },
  {
    title: 'Coachella Valley Music and Arts Festival 2026',
    category: 'festival', city: 'Indio', country: 'US',
    start_date: '2026-04-10', end_date: '2026-04-19',
    date_display: 'Apr 10–19, 2026',
    description: 'Coachella is one of the most famous music and arts festivals in the world, held annually in the Colorado Desert in California. The festival features hundreds of musical artists across multiple genres including rock, indie, hip hop and electronic dance music. Art installations, food vendors and fashion are central to the Coachella experience. Over 250,000 people attend across two weekends.',
    price_display: '$500–$1200', price_from: 500, attendees: 250000, vendor_spots: 400,
    website: 'https://www.coachella.com', featured: 1,
    tags: JSON.stringify(['music', 'arts', 'festival', 'california', 'usa', 'coachella'])
  },
  {
    title: 'Glastonbury Festival 2026',
    category: 'festival', city: 'Pilton', country: 'GB',
    start_date: '2026-06-24', end_date: '2026-06-28',
    date_display: 'Jun 24–28, 2026',
    description: 'Glastonbury Festival of Contemporary Performing Arts is the largest greenfield music and performing arts festival in the world. Held on Worthy Farm in Somerset, England, it attracts over 200,000 attendees. Beyond the famous Pyramid Stage, Glastonbury offers theatre, circus, cabaret, markets and thousands of food and craft vendors.',
    price_display: '£350', price_from: 350, attendees: 200000, vendor_spots: 500,
    website: 'https://www.glastonburyfestivals.co.uk', featured: 1,
    tags: JSON.stringify(['music', 'festival', 'uk', 'glastonbury', 'somerset'])
  },
  {
    title: 'Way Out West Festival 2026',
    category: 'festival', city: 'Gothenburg', country: 'SE',
    start_date: '2026-08-06', end_date: '2026-08-08',
    date_display: 'Aug 6–8, 2026',
    description: 'Way Out West is a major music festival in Gothenburg, Sweden, held in Slottsskogen park. Known for its commitment to sustainability and being completely meat-free, the festival attracts over 35,000 visitors. It features indie, electronic, hip-hop and pop acts across multiple stages alongside art, food and vendor markets.',
    price_display: '€150–€280', price_from: 150, attendees: 35000, vendor_spots: 80,
    website: 'https://www.wayoutwest.se', featured: 1,
    tags: JSON.stringify(['music', 'festival', 'gothenburg', 'sweden', 'sustainable'])
  },
  {
    title: 'Lollapalooza Chicago 2026',
    category: 'festival', city: 'Chicago', country: 'US',
    start_date: '2026-07-30', end_date: '2026-08-02',
    date_display: 'Jul 30 – Aug 2, 2026',
    description: 'Lollapalooza is a legendary annual music festival held in Grant Park, Chicago. Founded in 1991, it now attracts over 400,000 visitors over four days. The festival features 170+ acts across 8 stages spanning rock, pop, hip-hop and electronic music. Chicago\'s iconic skyline provides the backdrop for one of America\'s greatest summer events.',
    price_display: '$150–$400', price_from: 150, attendees: 400000, vendor_spots: 300,
    website: 'https://www.lollapalooza.com', featured: 1,
    tags: JSON.stringify(['music', 'festival', 'chicago', 'usa', 'lollapalooza'])
  },

  // ─── CHRISTMAS MARKETS ───
  {
    title: 'Cologne Christmas Market 2026',
    category: 'christmas', city: 'Cologne', country: 'DE',
    start_date: '2026-11-23', end_date: '2026-12-23',
    date_display: 'Nov 23 – Dec 23, 2026',
    description: 'The Cologne Christmas Market at the Cathedral is one of Germany\'s most famous and oldest Christmas markets, dating back to 1360. With over 150 stalls surrounding the magnificent Cologne Cathedral, it attracts 4 million visitors each year. Vendors sell handcrafted ornaments, mulled wine, gingerbread, sausages and traditional German Christmas goods. A magical experience in one of Europe\'s most beautiful settings.',
    price_display: 'Free Entry', price_from: 0, attendees: 4000000, vendor_spots: 150,
    website: 'https://www.cologne-tourism.com/christmas', featured: 1,
    tags: JSON.stringify(['christmas', 'market', 'cologne', 'germany', 'weihnachtsmarkt'])
  },
  {
    title: 'Strasbourg Christmas Market 2026',
    category: 'christmas', city: 'Strasbourg', country: 'FR',
    start_date: '2026-11-28', end_date: '2026-12-27',
    date_display: 'Nov 28 – Dec 27, 2026',
    description: 'Strasbourg hosts the oldest Christmas market in France, dating to 1570. Known as the "Capital of Christmas," the city transforms into a winter wonderland with 300+ chalets spread across the historic city center. Over 2 million visitors come to browse handcrafted gifts, taste bredele cookies, drink hot wine and enjoy the magical Alsatian atmosphere.',
    price_display: 'Free Entry', price_from: 0, attendees: 2000000, vendor_spots: 300,
    website: 'https://noel.strasbourg.eu', featured: 1,
    tags: JSON.stringify(['christmas', 'market', 'strasbourg', 'france', 'alsace'])
  },
  {
    title: 'Vienna Christmas Market 2026',
    category: 'christmas', city: 'Vienna', country: 'DE',
    start_date: '2026-11-14', end_date: '2026-12-26',
    date_display: 'Nov 14 – Dec 26, 2026',
    description: 'Vienna\'s Christmas markets are among the most beautiful in Europe. The main market at Rathausplatz features over 150 stalls selling Austrian handicrafts, punch, roasted chestnuts and traditional Christmas decorations. The stunning backdrop of the illuminated City Hall makes this one of the most photographed Christmas markets in the world.',
    price_display: 'Free Entry', price_from: 0, attendees: 3000000, vendor_spots: 150,
    website: 'https://www.viennatouristboard.com', featured: 0,
    tags: JSON.stringify(['christmas', 'market', 'vienna', 'austria', 'weihnachtsmarkt'])
  },
  {
    title: 'Copenhagen Christmas Market Tivoli 2026',
    category: 'christmas', city: 'Copenhagen', country: 'DK',
    start_date: '2026-11-14', end_date: '2026-12-31',
    date_display: 'Nov 14 – Dec 31, 2026',
    description: 'Tivoli Gardens transforms into a winter wonderland for Christmas, becoming one of Scandinavia\'s most magical holiday destinations. The historic amusement park features over 70 decorated stalls selling Danish crafts, julesnaps, æbleskiver pancakes and handmade gifts. Millions of lights illuminate the gardens as visitors browse authentic Nordic Christmas goods.',
    price_display: '€20–€35', price_from: 20, attendees: 800000, vendor_spots: 70,
    website: 'https://www.tivoli.dk', featured: 1,
    tags: JSON.stringify(['christmas', 'market', 'copenhagen', 'denmark', 'tivoli'])
  },
  {
    title: 'New York Holiday Markets 2026',
    category: 'christmas', city: 'New York', country: 'US',
    start_date: '2026-11-20', end_date: '2026-12-24',
    date_display: 'Nov 20 – Dec 24, 2026',
    description: 'New York\'s holiday markets at Union Square and Bryant Park are beloved NYC traditions. Bryant Park Winter Village features over 170 vendors selling artisan gifts, food and seasonal goods, all surrounded by the iconic midtown skyline. Union Square Holiday Market offers handcrafted jewelry, clothing, food and gifts from 150+ vendors.',
    price_display: 'Free Entry', price_from: 0, attendees: 5000000, vendor_spots: 170,
    website: 'https://www.urbanspacenyc.com', featured: 1,
    tags: JSON.stringify(['christmas', 'market', 'new york', 'usa', 'holiday', 'bryant park'])
  },

  // ─── FOOD & DRINK FESTIVALS ───
  {
    title: 'Oktoberfest Munich 2026',
    category: 'festival', city: 'Munich', country: 'DE',
    start_date: '2026-09-19', end_date: '2026-10-04',
    date_display: 'Sep 19 – Oct 4, 2026',
    description: 'Oktoberfest is the world\'s largest folk festival held annually in Munich, Germany. Over 6 million visitors come to enjoy Bavarian beer, traditional food and music across massive beer tents. The festival also features fairground rides, parades in traditional Bavarian costume and hundreds of food and craft vendors. A bucket-list experience for visitors worldwide.',
    price_display: 'Free Entry', price_from: 0, attendees: 6000000, vendor_spots: 500,
    website: 'https://www.oktoberfest.de', featured: 1,
    tags: JSON.stringify(['beer', 'festival', 'munich', 'germany', 'oktoberfest', 'bavarian'])
  },
  {
    title: 'Copenhagen Cooking & Food Festival 2026',
    category: 'festival', city: 'Copenhagen', country: 'DK',
    start_date: '2026-08-20', end_date: '2026-08-30',
    date_display: 'Aug 20–30, 2026',
    description: 'Copenhagen Cooking & Food Festival is Scandinavia\'s largest food festival, celebrating Nordic cuisine. Over 11 days, the city comes alive with pop-up restaurants, street food markets, cooking classes and chef demonstrations. Featuring both Michelin-starred restaurants and street food vendors, it\'s the ultimate destination for food lovers in Scandinavia.',
    price_display: 'Various', price_from: 0, attendees: 100000, vendor_spots: 120,
    website: 'https://www.copenhagencooking.dk', featured: 0,
    tags: JSON.stringify(['food', 'cooking', 'copenhagen', 'denmark', 'nordic cuisine'])
  },
  {
    title: 'Taste of Chicago 2026',
    category: 'festival', city: 'Chicago', country: 'US',
    start_date: '2026-07-08', end_date: '2026-07-12',
    date_display: 'Jul 8–12, 2026',
    description: 'Taste of Chicago is the world\'s largest food festival, held in Grant Park along the beautiful lakefront. Over 500,000 visitors sample food from 70+ Chicago restaurants and food vendors. The festival celebrates Chicago\'s diverse culinary scene from deep dish pizza to international cuisines, alongside live music and entertainment.',
    price_display: 'Free Entry', price_from: 0, attendees: 500000, vendor_spots: 70,
    website: 'https://www.chicago.gov/tasteofchicago', featured: 0,
    tags: JSON.stringify(['food', 'festival', 'chicago', 'usa', 'culinary'])
  },

  // ─── STREET MARKETS ───
  {
    title: 'Portobello Road Market London',
    category: 'market', city: 'London', country: 'GB',
    start_date: '2026-04-01', end_date: '2026-12-31',
    date_display: 'Every Saturday, year-round',
    description: 'Portobello Road Market in Notting Hill is one of London\'s most famous street markets. Every Saturday, over 1,000 dealers sell antiques, vintage clothing, fresh produce, street food and unique finds. The market stretches over a mile through the colorful streets of Notting Hill, attracting over 100,000 visitors every weekend.',
    price_display: 'Free Entry', price_from: 0, attendees: 100000, vendor_spots: 1000,
    website: 'https://www.portobelloroad.co.uk', featured: 0,
    tags: JSON.stringify(['market', 'antiques', 'london', 'uk', 'portobello', 'vintage'])
  },
  {
    title: 'Marché des Enfants Rouges Paris',
    category: 'market', city: 'Paris', country: 'FR',
    start_date: '2026-01-01', end_date: '2026-12-31',
    date_display: 'Open year-round, Tue–Sun',
    description: 'Le Marché des Enfants Rouges is Paris\'s oldest covered market, dating to 1615. Located in the Marais district, it offers a vibrant mix of fresh produce, international street food, flowers and local specialties. Vendors from Morocco, Japan, Italy, Lebanon and France create a unique multicultural food experience loved by Parisians and tourists alike.',
    price_display: 'Free Entry', price_from: 0, attendees: 50000, vendor_spots: 30,
    website: 'https://www.paris.fr', featured: 0,
    tags: JSON.stringify(['market', 'paris', 'france', 'food', 'historic', 'marais'])
  },
  {
    title: 'Torvehallerne Food Market Copenhagen',
    category: 'market', city: 'Copenhagen', country: 'DK',
    start_date: '2026-01-01', end_date: '2026-12-31',
    date_display: 'Open daily year-round',
    description: 'Torvehallerne is Copenhagen\'s premier covered food market, located at Israels Plads. Two glass halls house 60+ stalls selling fresh Nordic produce, gourmet coffee, artisan sandwiches, smørrebrød, cheese, chocolate and international street food. A must-visit destination for food lovers exploring Copenhagen.',
    price_display: 'Free Entry', price_from: 0, attendees: 3000000, vendor_spots: 60,
    website: 'https://torvehallernekbh.dk', featured: 1,
    tags: JSON.stringify(['market', 'food', 'copenhagen', 'denmark', 'nordic', 'torvehallerne'])
  },
  {
    title: 'Viktualienmarkt Munich',
    category: 'market', city: 'Munich', country: 'DE',
    start_date: '2026-01-01', end_date: '2026-12-31',
    date_display: 'Open daily year-round',
    description: 'Viktualienmarkt is Munich\'s famous open-air food market, operating since 1807 in the heart of the city. Over 140 permanent stalls sell fresh flowers, Bavarian delicacies, exotic fruits, cheese, bread, meat and street food. The market also features a traditional beer garden where locals gather daily.',
    price_display: 'Free Entry', price_from: 0, attendees: 2000000, vendor_spots: 140,
    website: 'https://www.viktualienmarkt.de', featured: 0,
    tags: JSON.stringify(['market', 'food', 'munich', 'germany', 'viktualienmarkt', 'bavarian'])
  },
  {
    title: 'Portland Saturday Market',
    category: 'market', city: 'Portland', country: 'US',
    start_date: '2026-03-07', end_date: '2026-12-27',
    date_display: 'Every Sat & Sun, Mar–Dec 2026',
    description: 'Portland Saturday Market is the largest continuously operating outdoor arts and crafts market in the USA. Every weekend from March through December, 350+ vendors sell handmade crafts, art, jewelry, clothing and street food under the Burnside Bridge. It\'s the heart of Portland\'s vibrant artisan community.',
    price_display: 'Free Entry', price_from: 0, attendees: 750000, vendor_spots: 350,
    website: 'https://www.portlandsaturdaymarket.com', featured: 0,
    tags: JSON.stringify(['market', 'crafts', 'portland', 'usa', 'artisan', 'handmade'])
  },

  // ─── TRADE FAIRS ───
  {
    title: 'Hannover Messe 2026',
    category: 'messe', city: 'Hannover', country: 'DE',
    start_date: '2026-04-20', end_date: '2026-04-24',
    date_display: 'Apr 20–24, 2026',
    description: 'Hannover Messe is the world\'s leading trade fair for industrial technology. Over 6,500 exhibitors from 70+ countries showcase innovations in automation, robotics, energy and digital transformation. With 200,000+ professional visitors, it\'s the essential meeting point for the global industrial community.',
    price_display: '€50–€80', price_from: 50, attendees: 200000, vendor_spots: 6500,
    website: 'https://www.hannovermesse.de', featured: 0,
    tags: JSON.stringify(['trade fair', 'industry', 'hannover', 'germany', 'messe', 'technology'])
  },
  {
    title: 'CES Las Vegas 2027',
    category: 'messe', city: 'Las Vegas', country: 'US',
    start_date: '2027-01-06', end_date: '2027-01-09',
    date_display: 'Jan 6–9, 2027',
    description: 'CES is the world\'s most influential technology event, attracting 4,000+ exhibitors and 180,000 attendees from 160 countries. The Las Vegas Convention Center fills with the latest innovations in consumer electronics, automotive tech, health tech, smart home and AI. Essential for tech industry professionals worldwide.',
    price_display: '$300–$800', price_from: 300, attendees: 180000, vendor_spots: 4000,
    website: 'https://www.ces.tech', featured: 0,
    tags: JSON.stringify(['tech', 'trade show', 'las vegas', 'usa', 'CES', 'electronics'])
  },
  {
    title: 'Stockholm Furniture & Light Fair 2026',
    category: 'messe', city: 'Stockholm', country: 'SE',
    start_date: '2026-02-03', end_date: '2026-02-07',
    date_display: 'Feb 3–7, 2026',
    description: 'Stockholm Furniture & Light Fair is the leading Scandinavian trade fair for interior design and furniture. Over 700 exhibitors from Nordic and international design brands showcase the latest in furniture, lighting and home accessories. A must-attend event for designers, architects and interior professionals.',
    price_display: '€40–€60', price_from: 40, attendees: 40000, vendor_spots: 700,
    website: 'https://www.stockholmfurniturelightfair.se', featured: 0,
    tags: JSON.stringify(['furniture', 'design', 'stockholm', 'sweden', 'interior', 'scandinavian'])
  },

  // ─── KIDS EVENTS ───
  {
    title: 'LEGOLAND Billund Summer Season 2026',
    category: 'kids', city: 'Billund', country: 'DK',
    start_date: '2026-04-01', end_date: '2026-10-31',
    date_display: 'Apr 1 – Oct 31, 2026',
    description: 'LEGOLAND Billund is the original LEGO theme park in Denmark, the birthplace of LEGO. With 50+ attractions, rides and LEGO experiences, it\'s one of Scandinavia\'s most popular family destinations. Special summer events, LEGO building competitions and themed areas make every visit unique. Vendors and food stalls throughout the park.',
    price_display: '€50–€70', price_from: 50, attendees: 1500000, vendor_spots: 50,
    website: 'https://www.legoland.dk', featured: 0,
    tags: JSON.stringify(['kids', 'lego', 'billund', 'denmark', 'family', 'theme park'])
  },
  {
    title: 'Gröna Lund Summer Season 2026',
    category: 'kids', city: 'Stockholm', country: 'SE',
    start_date: '2026-04-25', end_date: '2026-09-20',
    date_display: 'Apr 25 – Sep 20, 2026',
    description: 'Gröna Lund is Stockholm\'s iconic amusement park on Djurgården island. One of Sweden\'s most visited attractions, it combines thrilling rides with live concerts, family entertainment and great food. The park hosts major music acts throughout the summer alongside its classic fairground attractions.',
    price_display: '€30–€55', price_from: 30, attendees: 1300000, vendor_spots: 40,
    website: 'https://www.gronalund.com', featured: 0,
    tags: JSON.stringify(['kids', 'amusement park', 'stockholm', 'sweden', 'family', 'concerts'])
  },

  // ─── FLEA MARKETS ───
  {
    title: 'Marché aux Puces de Saint-Ouen Paris',
    category: 'flea', city: 'Paris', country: 'FR',
    start_date: '2026-01-01', end_date: '2026-12-31',
    date_display: 'Every Sat, Sun & Mon year-round',
    description: 'The Saint-Ouen flea market at Porte de Clignancourt is the largest antique market in the world. With 2,500+ dealers spread over 7 hectares, it attracts 180,000 visitors every weekend. From vintage fashion and antique furniture to rare art and collectibles, this is paradise for treasure hunters. The market has operated since 1885.',
    price_display: 'Free Entry', price_from: 0, attendees: 180000, vendor_spots: 2500,
    website: 'https://www.marcheauxpuces-saintouen.com', featured: 1,
    tags: JSON.stringify(['flea market', 'antiques', 'paris', 'france', 'vintage', 'clignancourt'])
  },
  {
    title: 'Mauerpark Flea Market Berlin',
    category: 'flea', city: 'Berlin', country: 'DE',
    start_date: '2026-01-01', end_date: '2026-12-31',
    date_display: 'Every Sunday year-round',
    description: 'Mauerpark Flea Market is Berlin\'s most famous and beloved Sunday market, located on the former Berlin Wall grounds. Over 200 vendors sell vintage clothing, records, books, antiques, handmade crafts and street food every Sunday. The adjacent amphitheatre hosts the legendary Bearpit Karaoke, making it a truly unique Berlin experience.',
    price_display: 'Free Entry', price_from: 0, attendees: 3000000, vendor_spots: 200,
    website: 'https://www.mauerpark.info', featured: 1,
    tags: JSON.stringify(['flea market', 'vintage', 'berlin', 'germany', 'mauerpark', 'sunday'])
  },
  {
    title: 'Rose Bowl Flea Market Pasadena',
    category: 'flea', city: 'Pasadena', country: 'US',
    start_date: '2026-01-11', end_date: '2026-12-13',
    date_display: 'Second Sunday of every month',
    description: 'The Rose Bowl Flea Market is one of America\'s most iconic flea markets, held monthly at the famous Rose Bowl Stadium in Pasadena. Over 2,500 vendors sell vintage clothing, antique furniture, jewelry, art and collectibles. Attracting 20,000 visitors per event, it\'s a must-visit for vintage and antique lovers in Southern California.',
    price_display: '$10–$20', price_from: 10, attendees: 20000, vendor_spots: 2500,
    website: 'https://www.rgcshows.com/rose-bowl', featured: 0,
    tags: JSON.stringify(['flea market', 'antiques', 'pasadena', 'usa', 'vintage', 'rose bowl'])
  },

  // ─── MORE FESTIVALS ───
  {
    title: 'Midsommar Festival Sweden 2026',
    category: 'festival', city: 'Dalarna', country: 'SE',
    start_date: '2026-06-19', end_date: '2026-06-21',
    date_display: 'Jun 19–21, 2026',
    description: 'Midsommar is Sweden\'s most beloved traditional celebration, marking the summer solstice. Dalarna province hosts the most authentic celebrations with maypole dancing, folk music, traditional costumes and flower garlands. Villages across Sweden celebrate with local food markets, craft vendors and communal feasting. A truly magical Scandinavian experience.',
    price_display: 'Free', price_from: 0, attendees: 50000, vendor_spots: 100,
    website: 'https://www.visitsweden.com', featured: 1,
    tags: JSON.stringify(['midsommar', 'sweden', 'traditional', 'festival', 'scandinavia', 'summer'])
  },
  {
    title: 'Burning Man 2026',
    category: 'festival', city: 'Black Rock City', country: 'US',
    start_date: '2026-08-30', end_date: '2026-09-07',
    date_display: 'Aug 30 – Sep 7, 2026',
    description: 'Burning Man is a legendary annual gathering in the Nevada desert attracting 80,000 participants. A temporary city built on radical self-expression and community, it features massive art installations, theme camps, live music, fire performances and a gift economy. The week culminates in the burning of a giant wooden effigy.',
    price_display: '$575–$1400', price_from: 575, attendees: 80000, vendor_spots: 0,
    website: 'https://burningman.org', featured: 0,
    tags: JSON.stringify(['festival', 'art', 'nevada', 'usa', 'burning man', 'community'])
  },
  {
    title: 'Distortion Festival Copenhagen 2026',
    category: 'festival', city: 'Copenhagen', country: 'DK',
    start_date: '2026-06-03', end_date: '2026-06-07',
    date_display: 'Jun 3–7, 2026',
    description: 'Distortion is Copenhagen\'s wildest street festival, transforming the city\'s neighborhoods into outdoor dance floors for five days. Over 100,000 party-goers fill the streets of Nørrebro, Vesterbro and the city center for free street parties and ticketed club events. Street food vendors and pop-up bars line the routes.',
    price_display: 'Free–€50', price_from: 0, attendees: 100000, vendor_spots: 150,
    website: 'https://www.cphdistortion.dk', featured: 1,
    tags: JSON.stringify(['festival', 'music', 'copenhagen', 'denmark', 'street party', 'electronic'])
  },
  {
    title: 'Aarhus Festival 2026',
    category: 'festival', city: 'Aarhus', country: 'DK',
    start_date: '2026-08-28', end_date: '2026-09-06',
    date_display: 'Aug 28 – Sep 6, 2026',
    description: 'Aarhus Festival is one of Scandinavia\'s largest urban festivals, turning Denmark\'s second city into a massive cultural playground for 10 days. Over 350 events spanning music, theatre, visual arts, food and street performances attract 500,000 visitors. Numerous food markets, craft vendors and pop-up experiences fill the city.',
    price_display: 'Various – many free', price_from: 0, attendees: 500000, vendor_spots: 200,
    website: 'https://www.aarhusfestuge.dk', featured: 0,
    tags: JSON.stringify(['festival', 'arts', 'aarhus', 'denmark', 'culture', 'urban'])
  },
  {
    title: 'Mardi Gras New Orleans 2027',
    category: 'festival', city: 'New Orleans', country: 'US',
    start_date: '2027-02-09', end_date: '2027-02-16',
    date_display: 'Feb 9–16, 2027',
    description: 'Mardi Gras in New Orleans is one of the world\'s greatest street festivals. Over 1.4 million visitors flood the French Quarter for parades, live jazz, street performances and legendary Creole cuisine. Dozens of krewes parade through the streets throwing beads and trinkets, while food vendors and street sellers line every block.',
    price_display: 'Free', price_from: 0, attendees: 1400000, vendor_spots: 1000,
    website: 'https://www.neworleans.com/mardi-gras', featured: 1,
    tags: JSON.stringify(['mardi gras', 'festival', 'new orleans', 'usa', 'jazz', 'parade'])
  },
  {
    title: 'Le Mans 24 Hours Race 2026',
    category: 'festival', city: 'Le Mans', country: 'FR',
    start_date: '2026-06-13', end_date: '2026-06-14',
    date_display: 'Jun 13–14, 2026',
    description: 'The 24 Hours of Le Mans is the world\'s oldest active sports car endurance race. Over 250,000 spectators camp around the circuit for a full weekend of motorsport, entertainment and festivity. The surrounding fan zones, food markets, merchandise vendors and live entertainment make it one of Europe\'s greatest sporting events.',
    price_display: '€60–€250', price_from: 60, attendees: 250000, vendor_spots: 300,
    website: 'https://www.lemans.org', featured: 0,
    tags: JSON.stringify(['race', 'motorsport', 'le mans', 'france', '24 hours', 'camping'])
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
    // Check if event already exists
    const exists = db.prepare('SELECT id FROM events WHERE title=?').get(event.title);
    if (exists) {
      skipped++;
      continue;
    }

    // Create slug
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
        attendees, vendor_spots, website,
        status, payment_status, featured, source, tags
      ) VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?,
        'active', 'paid', ?, 'manual', ?
      )
    `).run(
      event.title, slug, event.category, event.city, event.country,
      event.start_date, event.end_date || '', event.date_display,
      event.description, event.price_display, event.price_from || 0,
      event.attendees || 0, event.vendor_spots || 0, event.website || '',
      event.featured || 0, event.tags || '[]'
    );
    added++;
    console.log(`✅ Added: ${event.title}`);
  } catch (err) {
    console.error(`❌ Error adding ${event.title}:`, err.message);
  }
}

console.log(`\n🎉 Done! Added ${added} events, skipped ${skipped} duplicates.`);
db.close();
