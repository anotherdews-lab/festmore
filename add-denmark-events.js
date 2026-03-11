// add-denmark-events.js
// Run with: node add-denmark-events.js
// Adds comprehensive Danish festivals and events with unique photos and SEO descriptions

const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, 'db', 'festmore.db'));

const events = [
  {
    title: 'Roskilde Festival 2026',
    slug: 'roskilde-festival-2026',
    category: 'festival',
    city: 'Roskilde',
    country: 'DK',
    start_date: '2026-06-27',
    end_date: '2026-07-04',
    date_display: 'Jun 27 – Jul 4, 2026',
    image_url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&q=70',
    price_display: '€280–€380',
    price_from: 280,
    attendees: 130000,
    vendor_spots: 200,
    featured: 1,
    website: 'https://www.roskilde-festival.dk',
    tags: JSON.stringify(['roskilde festival', 'music festival denmark', 'danish festival', 'summer festival', 'rock festival']),
    meta_title: 'Roskilde Festival 2026 — Denmark\'s Biggest Music Festival',
    meta_desc: 'Roskilde Festival 2026 — Northern Europe\'s largest music festival. 130,000 visitors, 175+ acts, 8 stages. Buy tickets and find vendor spots at Roskilde.',
    description: `Roskilde Festival is Northern Europe's most iconic music festival, held annually just outside Copenhagen in Roskilde, Denmark. Since 1971, the festival has grown into one of the world's most celebrated music events, attracting over 130,000 visitors across 8 days of non-stop music, art and community.

With over 175 acts performing across 8 stages, Roskilde covers every genre imaginable — from rock and pop to hip-hop, electronic, world music and jazz. Past headliners include Bob Dylan, The Rolling Stones, Kendrick Lamar, Beyoncé and David Bowie.

Beyond the music, Roskilde is famous for its unique community spirit. The festival is run entirely by volunteers and all profits go to humanitarian causes. Camping is central to the experience, with thousands of festival-goers setting up creative camp villages for the week.

**For Vendors & Traders**
Roskilde Festival offers over 200 vendor spots for food sellers, craftspeople and merchandise traders. Competition for spots is high — apply early through the official vendor portal. Food vendors must meet strict sustainability standards, with the festival committed to 100% organic food options.

**Getting There**
Roskilde is 35km west of Copenhagen and easily accessible by train from Copenhagen Central Station (30 minutes). Festival buses run from Roskilde station to the grounds.

**What to Bring**
Camping gear, rain gear (Danish summer weather can be unpredictable), reusable cups and bags (mandatory at the festival), and comfortable walking shoes.

Roskilde Festival is a bucket-list event for music lovers worldwide. Book accommodation and tickets months in advance — the festival sells out every year.`
  },
  {
    title: 'Copenhagen Jazz Festival 2026',
    slug: 'copenhagen-jazz-festival-2026',
    category: 'concert',
    city: 'Copenhagen',
    country: 'DK',
    start_date: '2026-07-03',
    end_date: '2026-07-12',
    date_display: 'Jul 3–12, 2026',
    image_url: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600&q=70',
    price_display: 'Free–€90',
    price_from: 0,
    attendees: 250000,
    vendor_spots: 80,
    featured: 1,
    website: 'https://www.jazzfestival.dk',
    tags: JSON.stringify(['copenhagen jazz festival', 'jazz denmark', 'copenhagen events', 'music festival copenhagen', 'free concerts denmark']),
    meta_title: 'Copenhagen Jazz Festival 2026 — 1,000+ Concerts in 10 Days',
    meta_desc: 'Copenhagen Jazz Festival 2026: Over 1,000 jazz concerts across 130 venues in 10 days. Many free outdoor concerts. The world\'s greatest urban jazz festival.',
    description: `The Copenhagen Jazz Festival is one of the world's greatest urban music festivals, transforming Denmark's beautiful capital into a jazz paradise for 10 incredible days every summer.

Since 1979, the festival has grown into a global phenomenon attracting over 250,000 visitors and featuring more than 1,000 concerts across 130 venues — from world-class concert halls to intimate jazz clubs, rooftop bars, harbor stages and the city's many beautiful squares.

What makes Copenhagen Jazz Festival truly special is its accessibility. Hundreds of concerts are completely free, performed outdoors in parks, squares and pedestrian streets. The city itself becomes the stage, with music drifting from every corner of the Danish capital.

**Musical Highlights**
The festival covers the full spectrum of jazz — from traditional New Orleans swing and bebop to modern fusion, Scandinavian jazz and electronic improvisation. International stars share stages with Denmark's finest jazz musicians.

**Best Free Concert Locations**
- Nytorv Square (city center)
- Strøget pedestrian street
- Nørreport Station square
- Copenhagen Harbor stages
- Tivoli Gardens (some free performances)

**For Vendors & Food Traders**
The festival creates excellent trading opportunities across the city. Street food vendors, pop-up bars and craft sellers can apply for spots near the main outdoor stages.

**Practical Information**
Copenhagen Jazz Festival runs across the entire city — download the festival app for the full program and use the Copenhagen Metro and S-train to get between venues. The festival coincides with the best weather of the Danish summer.

This is one of the world's most unique festival experiences — a city-wide celebration of jazz that must be experienced to be believed.`
  },
  {
    title: 'Distortion Festival Copenhagen 2026',
    slug: 'distortion-festival-copenhagen-2026',
    category: 'festival',
    city: 'Copenhagen',
    country: 'DK',
    start_date: '2026-06-03',
    end_date: '2026-06-07',
    date_display: 'Jun 3–7, 2026',
    image_url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=70',
    price_display: 'Free–€55',
    price_from: 0,
    attendees: 100000,
    vendor_spots: 150,
    featured: 1,
    website: 'https://www.cphdistortion.dk',
    tags: JSON.stringify(['distortion festival', 'copenhagen street party', 'cph distortion', 'electronic music denmark', 'street festival copenhagen']),
    meta_title: 'Distortion Festival Copenhagen 2026 — Europe\'s Wildest Street Party',
    meta_desc: 'Distortion Festival Copenhagen 2026: 5 days of street parties, club nights and electronic music across Copenhagen\'s coolest neighborhoods. Free street events daily.',
    description: `CPH Distortion is Copenhagen's wildest and most beloved street festival, transforming the city's hippest neighborhoods into massive outdoor dance floors for five extraordinary days every June.

Since 1998, Distortion has grown from a small underground party into one of Europe's most talked-about urban festivals, attracting over 100,000 party-goers from across Scandinavia and beyond. The festival is famous for its raw, inclusive energy and its commitment to keeping street events free and accessible.

**How Distortion Works**
Each day of the festival focuses on a different Copenhagen neighborhood:
- **Day 1:** Nørrebro — the city's most multicultural and vibrant district
- **Day 2:** Vesterbro — Copenhagen's coolest neighborhood with its meatpacking district
- **Day 3:** Frederiksberg — elegant parks transformed into dance floors
- **Day 4:** The Harbor — Copenhagen's stunning waterfront
- **Day 5:** Final Party — massive ticketed closing event at a secret location

**Music & Atmosphere**
Distortion is primarily an electronic music festival, with DJs and live acts spanning house, techno, drum & bass, afrobeat and everything in between. Hundreds of sound systems, pop-up bars and food vendors line the streets.

**For Vendors & Traders**
Street food vendors, mobile bars and merchandise sellers can apply for pitch spots along the festival routes. With 100,000+ party-goers passing through each day, trading opportunities are exceptional.

**Practical Tips**
- Wear comfortable shoes — you'll walk miles
- Bring cash for street vendors
- The free street parties start around noon and run until midnight
- Book accommodation months in advance — hotels sell out fast

Distortion is unlike any other festival in the world. It's Copenhagen at its most joyful, chaotic and brilliant.`
  },
  {
    title: 'Aarhus Festival 2026',
    slug: 'aarhus-festival-2026',
    category: 'festival',
    city: 'Aarhus',
    country: 'DK',
    start_date: '2026-08-28',
    end_date: '2026-09-06',
    date_display: 'Aug 28 – Sep 6, 2026',
    image_url: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=600&q=70',
    price_display: 'Free – Various',
    price_from: 0,
    attendees: 500000,
    vendor_spots: 200,
    featured: 1,
    website: 'https://www.aarhusfestuge.dk',
    tags: JSON.stringify(['aarhus festival', 'denmark arts festival', 'aarhus events', 'danish culture festival', 'aarhus festuge']),
    meta_title: 'Aarhus Festival 2026 — Denmark\'s Largest Urban Arts Festival',
    meta_desc: 'Aarhus Festival 2026: 10 days, 350+ events, 500,000 visitors. Denmark\'s second city transforms into a massive cultural playground every September.',
    description: `Aarhus Festival — known in Danish as Aarhus Festuge — is one of Scandinavia's largest and most diverse urban festivals, turning Denmark's vibrant second city into a non-stop cultural playground for 10 extraordinary days every autumn.

With over 350 events spanning music, theatre, dance, visual arts, food, street performances and interactive installations, Aarhus Festival attracts over 500,000 visitors and represents the very best of Danish creative culture.

**What to Expect**
The festival transforms the entire city of Aarhus into one giant venue. The harbor, city parks, museums, concert halls, restaurants and streets all become stages for an incredible variety of performances and experiences.

Musical programming spans everything from classical concerts at Musikhuset Aarhus to outdoor rock stages, jazz performances in the Latin Quarter and electronic music events along the waterfront.

**Food & Market Experiences**
Aarhus Festival features some of the best food markets in Denmark, with dozens of pop-up restaurants, street food stalls and craft beer bars appearing throughout the city. Local and international food vendors create a vibrant culinary scene.

**Arts & Culture**
Visual art installations appear throughout the city streets. Theatre performances, dance shows and circus acts take over public spaces. Many of Denmark's finest artists debut new works at the festival.

**For Vendors & Traders**
With 500,000 visitors over 10 days, Aarhus Festival is one of Denmark's best trading opportunities. Food vendors, craftspeople, artisans and merchandise sellers can apply for spots in multiple festival zones.

**Getting to Aarhus**
Aarhus is 3 hours from Copenhagen by train. The city has excellent transport links and a compact, walkable center. Book accommodation early — the festival fills hotels across the region.`
  },
  {
    title: 'Smukfest — Skanderborg Festival 2026',
    slug: 'smukfest-skanderborg-2026',
    category: 'festival',
    city: 'Skanderborg',
    country: 'DK',
    start_date: '2026-08-05',
    end_date: '2026-08-09',
    date_display: 'Aug 5–9, 2026',
    image_url: 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=600&q=70',
    price_display: '€220–€290',
    price_from: 220,
    attendees: 50000,
    vendor_spots: 100,
    featured: 1,
    website: 'https://www.smukfest.dk',
    tags: JSON.stringify(['smukfest', 'skanderborg festival', 'danish music festival', 'forest festival denmark', 'smukfest 2026']),
    meta_title: 'Smukfest Skanderborg 2026 — Denmark\'s Most Beautiful Festival',
    meta_desc: 'Smukfest 2026 in Skanderborg: Denmark\'s most beautiful music festival set in a stunning forest. 50,000 visitors, world-class music, unique forest atmosphere.',
    description: `Smukfest — which translates to "Beautiful Festival" in Danish — is widely regarded as Denmark's most beautiful and intimate major music festival. Set in the stunning Søhøjlandet forest near Skanderborg in central Jutland, Smukfest offers a unique festival experience unlike anywhere else in the world.

Since 1980, the festival has carved out a special place in Danish culture as the festival with the most authentic community atmosphere. With 50,000 attendees camping in and around a beautiful Danish forest, Smukfest has an intimacy and magic that larger festivals simply cannot replicate.

**The Forest Setting**
What makes Smukfest truly unique is its extraordinary natural setting. Stages are built among ancient trees, with the forest canopy creating natural acoustic chambers. Walking between stages means wandering through beautiful Danish woodland, creating an almost fairy-tale atmosphere — especially at night when the forest is illuminated.

**Music Programming**
Despite its relatively intimate size, Smukfest attracts major international headliners alongside the best Danish and Scandinavian artists. The programming spans rock, pop, electronic, hip-hop and world music across 6 stages.

**Community & Culture**
Smukfest is famous for its creative camping culture. Festival-goers build elaborate camp villages decorated with lights, artwork and imaginative themes. The "smukkeste lejr" (most beautiful camp) competition drives incredible creativity.

**Food & Vendors**
The festival features an excellent selection of food vendors with a strong focus on Danish and Nordic cuisine. Craft beer, organic options and international street food are all well represented. Vendor spots are available for traders meeting the festival's quality standards.

**Getting There**
Skanderborg is in central Jutland, accessible by train from both Copenhagen (2.5 hours) and Aarhus (30 minutes). Festival buses run from Skanderborg station.`
  },
  {
    title: 'NorthSide Festival Aarhus 2026',
    slug: 'northside-festival-aarhus-2026',
    category: 'festival',
    city: 'Aarhus',
    country: 'DK',
    start_date: '2026-06-04',
    end_date: '2026-06-06',
    date_display: 'Jun 4–6, 2026',
    image_url: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&q=70',
    price_display: '€160–€220',
    price_from: 160,
    attendees: 30000,
    vendor_spots: 60,
    featured: 0,
    website: 'https://www.northside.dk',
    tags: JSON.stringify(['northside festival', 'aarhus music festival', 'denmark indie festival', 'northside 2026', 'sustainable festival denmark']),
    meta_title: 'NorthSide Festival Aarhus 2026 — Denmark\'s Greenest Music Festival',
    meta_desc: 'NorthSide Festival 2026 in Aarhus: Denmark\'s greenest music festival. 3 days, 30,000 visitors, world-class indie and pop acts. 100% renewable energy.',
    description: `NorthSide Festival is Aarhus's premier music festival and one of Denmark's most progressive and environmentally conscious events. Held over three days in the beautiful Eskelund park along the Aarhus River, NorthSide combines world-class music with a genuine commitment to sustainability.

Since its launch in 2011, NorthSide has quickly established itself as one of Scandinavia's most respected festivals, punching well above its weight in terms of musical programming and overall experience.

**Sustainability First**
NorthSide was one of the world's first festivals to achieve certification as a sustainable event. The festival runs on 100% renewable energy, serves exclusively organic and sustainable food, has eliminated single-use plastics and operates a comprehensive recycling and composting program. It's a model for how music festivals can operate responsibly.

**Music Programming**
Despite its relatively modest size of 30,000 attendees, NorthSide consistently books major international headliners alongside emerging indie, pop, rock and electronic acts. The intimate size means excellent sightlines and a fantastic festival atmosphere.

**Location**
Eskelund park sits right beside the Aarhus River in the heart of the city, making NorthSide uniquely accessible. Unlike most festivals requiring long journeys from the city center, NorthSide is walkable from Aarhus city center and hotels.

**For Vendors**
All food and drink vendors at NorthSide must meet strict sustainability criteria — organic, locally sourced ingredients and zero single-use plastics. The festival is an excellent showcase opportunity for sustainable food businesses.`
  },
  {
    title: 'Tønder Festival 2026',
    slug: 'tonder-festival-2026',
    category: 'festival',
    city: 'Tønder',
    country: 'DK',
    start_date: '2026-08-26',
    end_date: '2026-08-30',
    date_display: 'Aug 26–30, 2026',
    image_url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&q=70',
    price_display: '€180–€250',
    price_from: 180,
    attendees: 20000,
    vendor_spots: 50,
    featured: 0,
    website: 'https://www.tf.dk',
    tags: JSON.stringify(['tonder festival', 'folk music denmark', 'danish folk festival', 'world music festival', 'tønder festival 2026']),
    meta_title: 'Tønder Festival 2026 — Denmark\'s Premier Folk & World Music Festival',
    meta_desc: 'Tønder Festival 2026: Denmark\'s most celebrated folk and world music festival in the charming town of Tønder. 5 days of outstanding music near the German border.',
    description: `Tønder Festival is Denmark's most celebrated folk and world music festival, held every August in the charming historic town of Tønder in southern Jutland, just kilometers from the German border.

Since 1975, the Tønder Festival has built an international reputation as one of Europe's finest folk and roots music events, attracting music lovers from across Denmark, Germany, Sweden and beyond. The festival's intimate small-town setting creates an uniquely warm and welcoming atmosphere that keeps visitors returning year after year.

**Musical Heritage**
Tønder Festival specializes in folk, roots, country, bluegrass, Celtic and world music — genres rarely celebrated at scale in Scandinavia. The programming brings together the finest traditional and contemporary folk musicians from Denmark, the British Isles, North America and beyond.

**The Town of Tønder**
The festival takes full advantage of Tønder's beautiful historic town center. Stages are set up in the main square, along cobbled streets and in the town's parks. The entire town becomes a festival venue, with music spilling from every corner.

**Craft & Food Markets**
Tønder Festival features excellent artisan craft markets alongside traditional Danish and international food vendors. The market atmosphere reflects the festival's folk heritage, with handmade goods, traditional crafts and artisan food producers.

**Getting There**
Tønder is accessible by train from both Esbjerg and the German city of Niebüll. Many German visitors cross the border specifically for the festival, giving it a lovely international character.`
  },
  {
    title: 'Copenhagen Pride 2026',
    slug: 'copenhagen-pride-2026',
    category: 'city',
    city: 'Copenhagen',
    country: 'DK',
    start_date: '2026-08-15',
    end_date: '2026-08-23',
    date_display: 'Aug 15–23, 2026',
    image_url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&q=70',
    price_display: 'Free',
    price_from: 0,
    attendees: 300000,
    vendor_spots: 100,
    featured: 1,
    website: 'https://www.copenhagenpride.dk',
    tags: JSON.stringify(['copenhagen pride', 'pride denmark', 'lgbtq festival copenhagen', 'pride parade denmark', 'copenhagen events august']),
    meta_title: 'Copenhagen Pride 2026 — Scandinavia\'s Biggest Pride Festival',
    meta_desc: 'Copenhagen Pride 2026: Scandinavia\'s largest Pride festival. 300,000 visitors, iconic parade, free concerts and events across the Danish capital for 9 days.',
    description: `Copenhagen Pride is Scandinavia's largest and most celebrated LGBTQ+ festival, welcoming over 300,000 visitors to the Danish capital for nine days of parades, concerts, parties and cultural events every August.

Denmark has long been a global leader in LGBTQ+ rights — it was the first country in the world to legally recognize same-sex partnerships in 1989. Copenhagen Pride reflects this progressive heritage, offering one of the world's most joyful and inclusive Pride celebrations.

**The Pride Parade**
The highlight of Copenhagen Pride is the spectacular Pride Parade through the city center, attracting over 100,000 spectators who line the streets to cheer on participants. Floats, marching bands, community groups and thousands of individuals celebrate in a carnival of color and joy.

**WorldPride Legacy**
Copenhagen has hosted WorldPride twice — in 1996 and 2021 — cementing its status as one of the world's great Pride destinations. The city's infrastructure, public transport and welcoming culture make it an ideal destination for international Pride visitors.

**Events & Programming**
Beyond the parade, Copenhagen Pride features free outdoor concerts, club events, film screenings, art exhibitions, debates and community gatherings across the city. The main festival area at rådhuspladsen (City Hall Square) hosts daily free entertainment.

**For Vendors & Traders**
Copenhagen Pride creates exceptional trading opportunities. Food vendors, merchandise sellers, LGBTQ+-friendly businesses and craft traders can apply for spots in the festival areas. The diverse and enthusiastic crowd creates a fantastic trading atmosphere.`
  },
  {
    title: 'Copenhagen Cooking & Food Festival 2026',
    slug: 'copenhagen-cooking-food-festival-2026',
    category: 'festival',
    city: 'Copenhagen',
    country: 'DK',
    start_date: '2026-08-20',
    end_date: '2026-08-30',
    date_display: 'Aug 20–30, 2026',
    image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=70',
    price_display: 'Free – Various',
    price_from: 0,
    attendees: 100000,
    vendor_spots: 120,
    featured: 0,
    website: 'https://www.copenhagencooking.dk',
    tags: JSON.stringify(['copenhagen food festival', 'nordic cuisine', 'danish food events', 'cooking festival denmark', 'new nordic food']),
    meta_title: 'Copenhagen Cooking & Food Festival 2026 — Scandinavia\'s Largest Food Festival',
    meta_desc: 'Copenhagen Cooking & Food Festival 2026: 11 days celebrating Nordic cuisine. Pop-up restaurants, street food markets, chef demos. Scandinavia\'s biggest food event.',
    description: `Copenhagen Cooking & Food Festival is Scandinavia's largest and most prestigious food festival, celebrating the extraordinary culinary culture of Denmark and the Nordic region across 11 spectacular days every August.

Copenhagen has become one of the world's great food cities, home to multiple Michelin-starred restaurants and the birthplace of the New Nordic cuisine movement pioneered by Noma. The Cooking & Food Festival showcases this world-class culinary scene in an accessible, celebratory format.

**What Happens During the Festival**
Over 11 days, Copenhagen transforms into a food lover's paradise. Pop-up restaurants take over unusual locations across the city. Street food markets appear in parks and harbor areas. World-renowned chefs give demonstrations and masterclasses. Food producers from across Denmark and Scandinavia showcase their finest products.

**New Nordic Cuisine**
The festival is deeply connected to the New Nordic food philosophy — celebrating local, seasonal and sustainable ingredients from Scandinavia. Foraging, fermentation, smoking and preservation techniques central to Danish food culture are explored and celebrated.

**Street Food Markets**
The festival's street food markets are among the most exciting in Europe, featuring both established Copenhagen restaurants operating pop-up kitchens and talented street food vendors. Smørrebrød, æbleskiver, Danish pastries, smoked fish and innovative Nordic fusion dishes sit alongside international street food.

**For Food Vendors**
The Copenhagen Cooking & Food Festival actively seeks high-quality food vendors, particularly those working with Nordic ingredients and sustainable practices. It's an extraordinary showcase opportunity for food businesses targeting the premium Danish market.`
  },
  {
    title: 'Torvehallerne Christmas Market Copenhagen 2026',
    slug: 'torvehallerne-christmas-market-2026',
    category: 'christmas',
    city: 'Copenhagen',
    country: 'DK',
    start_date: '2026-11-28',
    end_date: '2026-12-23',
    date_display: 'Nov 28 – Dec 23, 2026',
    image_url: 'https://images.unsplash.com/photo-1543872084-c7bd3822856f?w=600&q=70',
    price_display: 'Free Entry',
    price_from: 0,
    attendees: 500000,
    vendor_spots: 80,
    featured: 1,
    website: 'https://torvehallernekbh.dk',
    tags: JSON.stringify(['copenhagen christmas market', 'danish christmas market', 'torvehallerne jul', 'copenhagen december events', 'hygge christmas denmark']),
    meta_title: 'Torvehallerne Christmas Market Copenhagen 2026 — Ultimate Danish Christmas',
    meta_desc: 'Torvehallerne Christmas Market Copenhagen 2026: Experience authentic Danish Christmas hygge. 80+ stalls, traditional Danish food, handcrafted gifts. Free entry.',
    description: `The Torvehallerne Christmas Market is one of Copenhagen's most beloved and authentic Christmas experiences, transforming the city's premier food market into a magical Danish Christmas wonderland every December.

Torvehallerne — Copenhagen's stunning glass-roofed food market at Israels Plads — is already one of the city's most popular destinations. During Christmas, it becomes something truly special, with outdoor stalls, festive decorations, warm lighting and the irresistible smells of traditional Danish Christmas food creating the perfect hygge atmosphere.

**The Spirit of Danish Christmas**
Danish Christmas — Jul — is one of the world's great festive traditions, centered around the concept of hygge: warmth, coziness, togetherness and good food. The Torvehallerne Christmas Market embodies this spirit perfectly, offering visitors an authentic Danish Christmas experience rather than a generic commercialized event.

**What to Find at the Market**
The market features both the indoor Torvehallerne halls and outdoor stalls in the surrounding square. Visitors can browse:
- Handcrafted Danish Christmas decorations and nisser (Christmas elves)
- Traditional æbleskiver (Danish Christmas pancakes) with jam and powdered sugar
- Gløgg (Danish mulled wine) in ceramic cups to keep
- Smoked and cured Danish fish and meats
- Artisan Danish chocolates and confectionery
- Handmade jewelry and gifts from Danish designers
- Fresh Nordic produce and seasonal specialties

**The Hygge Experience**
Fire pits and outdoor heaters create warmth around the outdoor stalls. The smell of cinnamon, cardamom and roasting almonds fills the air. This is Christmas as the Danes do it — intimate, warm, beautifully designed and utterly delicious.

**Location & Getting There**
Torvehallerne is centrally located at Nørreport, Copenhagen's busiest transport hub. All Metro lines and S-trains stop at Nørreport — the market is just 2 minutes' walk from the station.`
  },
  {
    title: 'Tivoli Gardens Christmas 2026',
    slug: 'tivoli-gardens-christmas-2026',
    category: 'christmas',
    city: 'Copenhagen',
    country: 'DK',
    start_date: '2026-11-14',
    end_date: '2026-12-31',
    date_display: 'Nov 14 – Dec 31, 2026',
    image_url: 'https://images.unsplash.com/photo-1576919228236-a097c32a5cd4?w=600&q=70',
    price_display: '€18–€32',
    price_from: 18,
    attendees: 1000000,
    vendor_spots: 70,
    featured: 1,
    website: 'https://www.tivoli.dk',
    tags: JSON.stringify(['tivoli christmas', 'tivoli jul', 'copenhagen christmas', 'tivoli gardens winter', 'denmark christmas 2026']),
    meta_title: 'Tivoli Gardens Christmas 2026 — Copenhagen\'s Most Magical Winter Experience',
    meta_desc: 'Tivoli Gardens Christmas 2026: Copenhagen\'s most magical Christmas destination. 3 million lights, 70 market stalls, rides and entertainment. Open Nov 14 – Dec 31.',
    description: `Tivoli Gardens at Christmas is one of the most magical experiences in all of Europe — a true winter wonderland in the heart of Copenhagen that has enchanted visitors since 1843.

When Denmark's beloved historic amusement park transforms for Christmas, it becomes something genuinely extraordinary. Over 3 million lights illuminate the park's beautiful Victorian gardens, historic buildings and ancient trees, creating an atmosphere of pure Christmas magic that simply cannot be replicated anywhere else.

**A Christmas Tradition Since 1994**
Tivoli Gardens has celebrated Christmas since 1994, and the event has grown into one of Copenhagen's most cherished seasonal traditions. Over 1 million visitors pass through the park's gates during the Christmas season, making it one of the most visited Christmas events in all of Scandinavia.

**The Market**
Tivoli's Christmas market features over 70 beautifully decorated wooden stalls selling traditional Danish Christmas goods including:
- Hand-painted Danish Christmas ornaments and decorations
- Traditional nisser (Danish Christmas elves) and julehjerter (Christmas hearts)
- Æbleskiver, gløgg and traditional Danish Christmas treats
- Handcrafted jewelry, toys and gifts from Danish artisans
- International Christmas foods and specialties

**Entertainment & Atmosphere**
Beyond the market, Tivoli Christmas offers a full program of entertainment including ballet performances, concerts, pantomime theatre and rides. The park's famous roller coasters and classic attractions continue operating throughout the Christmas season.

**The Tivoli Light Experience**
After dark, Tivoli becomes truly breathtaking. The combination of 3 million twinkling lights, frost on the trees, the smell of roasting almonds and the sounds of Christmas music creates an atmosphere that epitomizes Danish hygge at its finest.

**Practical Information**
Tivoli Gardens is located in the heart of Copenhagen, directly opposite the Central Station. Evening visits are particularly magical — arrive after dark to experience the full effect of the illuminations.`
  },
  {
    title: 'Odense Flower Festival 2026',
    slug: 'odense-flower-festival-2026',
    category: 'city',
    city: 'Odense',
    country: 'DK',
    start_date: '2026-08-14',
    end_date: '2026-08-23',
    date_display: 'Aug 14–23, 2026',
    image_url: 'https://images.unsplash.com/photo-1490750967868-88df5691cc4a?w=600&q=70',
    price_display: 'Free',
    price_from: 0,
    attendees: 150000,
    vendor_spots: 60,
    featured: 0,
    website: 'https://www.odenseblomsterfestival.dk',
    tags: JSON.stringify(['odense flower festival', 'denmark flower festival', 'odense events', 'hans christian andersen city', 'odense august']),
    meta_title: 'Odense Flower Festival 2026 — Denmark\'s Most Colorful Summer Event',
    meta_desc: 'Odense Flower Festival 2026: Denmark\'s most colorful festival transforms Hans Christian Andersen\'s birthplace with stunning floral displays. Free entry, 10 days.',
    description: `The Odense Flower Festival is one of Denmark's most visually spectacular events, transforming the charming city of Odense — birthplace of fairy tale author Hans Christian Andersen — into a breathtaking outdoor gallery of floral art and creativity every August.

For 10 days, the streets, squares and canals of Odense's beautiful historic city center are decorated with extraordinary floral installations, living sculptures, flower-covered buildings and themed garden displays created by professional floral designers from across Denmark and internationally.

**A City in Bloom**
The festival transforms Odense's already charming city center into something truly extraordinary. Major landmarks including the Hans Christian Andersen Museum, Odense Cathedral and Flakhaven Square become canvases for spectacular floral art. The city's canals are decorated with floating flower arrangements.

**Floral Art Competitions**
Professional and amateur floral designers compete in multiple categories, with their creations displayed throughout the city for visitors to view and vote on. The quality and creativity of entries is consistently remarkable.

**Markets & Food**
The festival creates a wonderful market atmosphere throughout the city center. Local food producers, craft vendors, flower sellers and artisans set up stalls alongside the floral displays, creating a vibrant summer marketplace.

**Hans Christian Andersen Connection**
Odense's identity as the birthplace of Hans Christian Andersen runs through the festival — many floral installations take inspiration from his famous fairy tales, creating magical scenes from The Little Mermaid, The Snow Queen, Thumbelina and more.

**Getting to Odense**
Odense is centrally located on the island of Funen, making it easily accessible from both Copenhagen (1.5 hours by train) and the Jutland mainland. It's an ideal stop on a tour of Denmark.`
  },
  {
    title: 'Aalborg Carnival 2026',
    slug: 'aalborg-carnival-2026',
    category: 'city',
    city: 'Aalborg',
    country: 'DK',
    start_date: '2026-05-20',
    end_date: '2026-05-24',
    date_display: 'May 20–24, 2026',
    image_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=70',
    price_display: 'Free',
    price_from: 0,
    attendees: 100000,
    vendor_spots: 80,
    featured: 0,
    website: 'https://www.aalborg-karneval.dk',
    tags: JSON.stringify(['aalborg carnival', 'denmark carnival', 'aalborg events', 'north jutland festival', 'aalborg karneval']),
    meta_title: 'Aalborg Carnival 2026 — Scandinavia\'s Largest Carnival',
    meta_desc: 'Aalborg Carnival 2026: Scandinavia\'s largest carnival with 100,000+ visitors. Spectacular parades, costumes and street parties in northern Denmark. Free entry.',
    description: `Aalborg Carnival is Scandinavia's largest carnival, transforming the vibrant northern Danish city of Aalborg into a riot of color, music and spectacular costumes for five extraordinary days every May.

Since 1982, Aalborg Carnival has grown from a small local celebration into a major Scandinavian event attracting over 100,000 visitors and featuring participants from across Denmark, Europe and beyond. The carnival's combination of spectacular parades, street parties, music and a genuinely festive atmosphere makes it one of northern Denmark's most beloved annual events.

**The Grand Parade**
The centerpiece of Aalborg Carnival is the spectacular Grand Parade through the city center, featuring hundreds of elaborately costumed groups, samba dancers, marching bands, giant floats and performers from across Scandinavia. The parade route is lined with thousands of spectators cheering on participants.

**School Carnival**
A unique feature of Aalborg Carnival is the Children's School Carnival, where thousands of Danish schoolchildren parade through the streets in fantastic homemade costumes. This family-friendly event is one of the most charming aspects of the whole celebration.

**Street Parties & Music**
Throughout the carnival period, Aalborg's city center comes alive with outdoor stages, live music, food markets and street entertainment. The party atmosphere continues well into the evening with club events and concerts.

**For Vendors**
Aalborg Carnival creates excellent trading opportunities for food vendors, costume sellers, craft traders and merchandise businesses. With 100,000+ visitors over 5 days, the potential for sales is significant.

**Getting to Aalborg**
Aalborg is northern Jutland's largest city, accessible by train from Copenhagen (approximately 3 hours) and Aarhus (1.5 hours). The city has a lively student population and a reputation for being one of Denmark's most fun cities.`
  },
  {
    title: 'Copenhagen Marathon 2026',
    slug: 'copenhagen-marathon-2026',
    category: 'city',
    city: 'Copenhagen',
    country: 'DK',
    start_date: '2026-05-17',
    end_date: '2026-05-17',
    date_display: 'May 17, 2026',
    image_url: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600&q=70',
    price_display: '€85–€120',
    price_from: 85,
    attendees: 200000,
    vendor_spots: 40,
    featured: 0,
    website: 'https://www.copenhagenmarathon.dk',
    tags: JSON.stringify(['copenhagen marathon', 'denmark marathon', 'running event copenhagen', 'copenhagen sports event', 'marathon 2026']),
    meta_title: 'Copenhagen Marathon 2026 — Run Through the World\'s Most Beautiful Capital',
    meta_desc: 'Copenhagen Marathon 2026: Run through one of the world\'s most beautiful cities. 15,000 runners, iconic route past palaces and harbors. Register now for May 17.',
    description: `The Copenhagen Marathon is one of Europe's most scenic and popular marathons, taking 15,000 runners on a spectacular route through the heart of one of the world's most beautiful and livable cities.

Since its launch in 1980, the Copenhagen Marathon has grown into a major international running event, attracting participants from over 80 countries who come to experience Denmark's capital in the most direct way possible — on foot, at pace, through its most iconic streets and neighborhoods.

**The Route**
The Copenhagen Marathon route is renowned for its beauty and variety. Runners pass through the city's most iconic locations including:
- Rådhuspladsen (City Hall Square) — the start and finish line
- The beautiful lakes (Søerne) in the city's heart
- The famous Frederiksberg Gardens
- Copenhagen's stunning harbor front
- The colorful houses of Nyhavn
- The impressive Royal Palace at Amalienborg
- The iconic Little Mermaid statue

**A City That Supports Running**
Copenhagen's cycling and running culture means the city genuinely embraces the marathon. Locals turn out in massive numbers to cheer runners along the route, creating an electric atmosphere throughout the city.

**For Spectators & Vendors**
With 200,000+ spectators lining the route and gathering at the finish line festival area, the Copenhagen Marathon creates excellent opportunities for food and merchandise vendors. The finish line festival at Rådhuspladsen runs for several hours after the race.

**Registration**
The Copenhagen Marathon sells out months in advance. Register early through the official website to secure your place.`
  },
  {
    title: 'Frederiksberg Rundfart Flea Market 2026',
    slug: 'frederiksberg-rundfart-flea-market-2026',
    category: 'flea',
    city: 'Copenhagen',
    country: 'DK',
    start_date: '2026-05-03',
    end_date: '2026-05-03',
    date_display: 'May 3, 2026',
    image_url: 'https://images.unsplash.com/photo-1567225557594-88d73e55f2cb?w=600&q=70',
    price_display: 'Free Entry',
    price_from: 0,
    attendees: 30000,
    vendor_spots: 500,
    featured: 0,
    website: 'https://www.rundfart.dk',
    tags: JSON.stringify(['frederiksberg flea market', 'copenhagen flea market', 'loppemarked denmark', 'vintage market copenhagen', 'danish flea market']),
    meta_title: 'Frederiksberg Rundfart Flea Market 2026 — Copenhagen\'s Biggest Flea Market',
    meta_desc: 'Frederiksberg Rundfart 2026: Copenhagen\'s biggest annual flea market with 500+ sellers. Vintage treasures, antiques and second-hand finds in beautiful Frederiksberg.',
    description: `Frederiksberg Rundfart is Copenhagen's most beloved annual flea market event, transforming the elegant streets of Frederiksberg into a massive treasure hunt for antiques, vintage finds, second-hand goods and unique curiosities.

Held on a single Sunday in early May, Rundfart (which means "round trip" in Danish) sees over 500 sellers set up stalls along Frederiksberg's beautiful tree-lined streets and in the parks surrounding Frederiksberg Palace. With 30,000+ visitors browsing the stalls, it's one of the most festive and social days in the Copenhagen calendar.

**What to Find**
Frederiksberg Rundfart reflects the character of the neighborhood — elegant, design-conscious and full of quality. Sellers include:
- Danish design classics from Georg Jensen, Royal Copenhagen and Holmegaard
- Mid-century modern furniture and lighting
- Vintage Danish clothing and textiles
- Books, records and art prints
- Antique silverware and porcelain
- Children's toys and games
- General household second-hand items

**The Frederiksberg Setting**
Frederiksberg is one of Copenhagen's most beautiful neighborhoods — a municipality within the city characterized by grand apartment buildings, wide boulevards and beautiful parks. The Rundfart event makes excellent use of this elegant setting.

**For Sellers**
Stall registration for Frederiksberg Rundfart opens several months before the event and fills up quickly. Sellers can register for pitches along the designated streets through the official website.

**Getting There**
Frederiksberg is easily accessible from central Copenhagen by Metro (Frederiksberg Station) or bus. The market area is walkable from multiple transport connections.`
  },
];

// Insert or update events
let added = 0;
let updated = 0;
let skipped = 0;

const slugify = (str) => str.toLowerCase()
  .replace(/[^a-z0-9\s-]/g, '')
  .replace(/\s+/g, '-')
  .replace(/-+/g, '-')
  .trim();

for (const event of events) {
  try {
    const exists = db.prepare('SELECT id FROM events WHERE slug=?').get(event.slug);
    
    if (exists) {
      // Update existing event with better content
      db.prepare(`
        UPDATE events SET 
          description=?, image_url=?, meta_title=?, meta_desc=?,
          attendees=?, vendor_spots=?, featured=?, website=?,
          date_display=?, price_display=?, tags=?
        WHERE slug=?
      `).run(
        event.description, event.image_url, event.meta_title, event.meta_desc,
        event.attendees, event.vendor_spots, event.featured, event.website,
        event.date_display, event.price_display, event.tags,
        event.slug
      );
      updated++;
      console.log(`🔄 Updated: ${event.title}`);
    } else {
      // Insert new event
      let slug = event.slug;
      db.prepare(`
        INSERT INTO events (
          title, slug, category, city, country,
          start_date, end_date, date_display,
          description, price_display, price_from,
          attendees, vendor_spots, website,
          image_url, tags, meta_title, meta_desc,
          status, payment_status, featured, source
        ) VALUES (
          ?, ?, ?, ?, ?,
          ?, ?, ?,
          ?, ?, ?,
          ?, ?, ?,
          ?, ?, ?, ?,
          'active', 'paid', ?, 'manual'
        )
      `).run(
        event.title, slug, event.category, event.city, event.country,
        event.start_date, event.end_date || '', event.date_display,
        event.description, event.price_display, event.price_from || 0,
        event.attendees || 0, event.vendor_spots || 0, event.website || '',
        event.image_url, event.tags || '[]', event.meta_title || '', event.meta_desc || '',
        event.featured || 0
      );
      added++;
      console.log(`✅ Added: ${event.title}`);
    }
  } catch (err) {
    console.error(`❌ Error with ${event.title}:`, err.message);
    skipped++;
  }
}

console.log(`\n🎉 Done!`);
console.log(`   ✅ Added: ${added} new events`);
console.log(`   🔄 Updated: ${updated} existing events`);
console.log(`   ❌ Skipped: ${skipped} errors`);
console.log(`\n🇩🇰 Danish events are ready!`);
db.close();
