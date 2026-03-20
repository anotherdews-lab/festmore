// add-new-country-content.js
// Adds top 3 events per new country + SEO articles
// Japan, India, Thailand, Norway, Finland, Austria, Switzerland, Italy, Spain, Portugal, Ireland, Czech, Hungary, Greece, Croatia

const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, 'db', 'festmore.db'));

// ─── EVENTS ───
const events = [

  // ══════════════════════════════
  // JAPAN 🇯🇵
  // ══════════════════════════════
  {
    title: 'Gion Matsuri Festival Kyoto 2026',
    category: 'festival', city: 'Kyoto', country: 'JP',
    start_date: '2026-07-01', end_date: '2026-07-31',
    date_display: 'Throughout July 2026',
    description: `Gion Matsuri is Japan's most celebrated festival and one of the three greatest festivals in the country, held throughout the entire month of July in the ancient imperial city of Kyoto. Dating back over 1,100 years to 869 AD, when the festival was first held to appease the gods during a devastating plague, Gion Matsuri has evolved into a magnificent month-long celebration of Japanese culture, history and craftsmanship.

The festival reaches its peak with the Yamaboko Junko parade on 17 July, when 23 enormous wooden floats — some standing over 25 metres tall and weighing up to 12 tonnes — are pulled through the streets of central Kyoto by teams of men in traditional dress. These extraordinary floats, called yamaboko, are decorated with centuries-old tapestries, some imported from as far as Persia and India during the Silk Road era. Many of these textile treasures are considered national cultural properties of Japan.

The evenings of 14-16 July feature the magical Yoiyama celebrations, when the floats are illuminated with paper lanterns and the streets of Kyoto's historic Gion district fill with thousands of visitors in yukata summer kimono. Street food stalls serve traditional festival foods, and the atmosphere is one of gentle, ancient festivity that connects contemporary Japan to its deepest cultural roots.

Gion Matsuri is an essential experience for anyone visiting Japan in July. The combination of extraordinary historical tradition, magnificent craftsmanship, ancient Kyoto streets and the summer heat makes it one of the most culturally rich festival experiences available anywhere in the world.`,
    price_display: 'Free (parade viewing)',
    attendees: 1000000, vendor_spots: 300,
    website: 'https://www.kyokanko.or.jp/gion',
    featured: 1,
    image_url: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80',
    tags: JSON.stringify(['gion matsuri','kyoto','japan','festival','traditional','floats','1100 years']),
    meta_title: 'Gion Matsuri Kyoto 2026 — Japan\'s Greatest Festival | Festmore',
    meta_desc: 'Gion Matsuri in Kyoto: Japan\'s most celebrated festival held throughout July. 1,100-year-old tradition with magnificent float parade. Complete guide 2026.',
  },
  {
    title: 'Sapporo Snow Festival Japan 2026',
    category: 'festival', city: 'Sapporo', country: 'JP',
    start_date: '2026-02-05', end_date: '2026-02-11',
    date_display: 'Feb 5–11, 2026',
    description: `Sapporo Snow Festival is Japan's most famous winter festival and one of the world's great ice and snow art events, drawing over 2 million visitors to the northern island of Hokkaido each February. The festival transforms Odori Park in the heart of Sapporo into an extraordinary outdoor gallery of snow and ice sculptures, with hundreds of creations ranging from small handmade figures to enormous multi-storey buildings, famous landmarks and characters recreated entirely in snow and ice.

The festival began in 1950 when local high school students built six snow statues in Odori Park. Today it spans three sites across Sapporo, with the main Odori Site featuring massive snow sculptures created by teams from the Japan Ground Self-Defense Force and international competitors, the Susukino Site showcasing ice sculptures illuminated at night, and the Tsudome Site offering snow activities and slides for families.

The international snow sculpture competition draws teams from across the world, with the extraordinary results — buildings, dragons, movie characters and abstract forms all recreated at massive scale in snow — creating a temporary outdoor museum that can only exist in the deep cold of Hokkaido February. Night illuminations transform the sculptures into magical glowing figures against the winter sky.

Sapporo itself is a superb winter destination, with excellent skiing at nearby Niseko and Furano, outstanding seafood including the famous Hokkaido crab and snow crab, and the wonderful Sapporo beer that was first brewed here. The Snow Festival makes February the ideal time to experience everything Hokkaido has to offer.`,
    price_display: 'Free',
    attendees: 2000000, vendor_spots: 200,
    website: 'https://www.snowfes.com',
    featured: 1,
    image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80',
    tags: JSON.stringify(['sapporo snow festival','japan','hokkaido','ice sculpture','winter','snow art']),
    meta_title: 'Sapporo Snow Festival 2026 — Japan\'s Greatest Winter Festival | Festmore',
    meta_desc: 'Sapporo Snow Festival 2026: 2 million visitors, enormous snow sculptures and ice art in Hokkaido, Japan. Feb 5-11. Complete guide and visitor tips.',
  },
  {
    title: 'Nebuta Matsuri Festival Aomori 2026',
    category: 'festival', city: 'Aomori', country: 'JP',
    start_date: '2026-08-02', end_date: '2026-08-07',
    date_display: 'Aug 2–7, 2026',
    description: `Nebuta Matsuri in Aomori is one of Japan's most spectacular and energetic summer festivals, drawing 3 million visitors to the northern Tohoku city for six extraordinary nights of illuminated float parades. The festival is celebrated as one of Japan's three greatest festivals and is a designated Important Intangible Folk Cultural Property.

The Nebuta floats are the festival's defining feature — enormous three-dimensional illuminated figures of samurai warriors, mythological characters and historical figures, built from wire frames, washi paper and paint to a scale that must be seen to be believed. The largest floats stand over 5 metres tall and 9 metres wide, glowing brilliantly against the summer night sky as they are pulled through the streets of Aomori.

Alongside the floats dance the Haneto — festival participants in traditional costume who leap and dance to the haunting music of flutes, taiko drums and bells, chanting the hypnotic call of "Rassera, Rassera!" Anyone can join in as a Haneto by renting the traditional costume, making Nebuta one of Japan's most participatory festivals. The energy, colour and sound of thousands of Haneto dancing beneath the glowing Nebuta floats creates an atmosphere of pure collective joy.

The festival ends on the final night with a spectacular fireworks display over Aomori Bay, while the winning Nebuta float is carried to the water and set adrift — a moving finale to one of Japan's most extraordinary cultural events.`,
    price_display: 'Free (grandstand tickets ¥2,000)',
    attendees: 3000000, vendor_spots: 400,
    website: 'https://www.nebuta.jp',
    featured: 1,
    image_url: 'https://images.unsplash.com/photo-1504109586057-7a2ae83d1338?w=800&q=80',
    tags: JSON.stringify(['nebuta matsuri','aomori','japan','summer festival','illuminated floats','traditional']),
    meta_title: 'Nebuta Matsuri Aomori 2026 — Japan\'s Most Spectacular Festival | Festmore',
    meta_desc: 'Nebuta Matsuri Aomori 2026: 3 million visitors, spectacular illuminated floats and dancing. Aug 2-7. One of Japan\'s three greatest summer festivals.',
  },

  // ══════════════════════════════
  // INDIA 🇮🇳
  // ══════════════════════════════
  {
    title: 'Kumbh Mela Prayagraj 2025',
    category: 'festival', city: 'Prayagraj', country: 'IN',
    start_date: '2025-01-13', end_date: '2025-02-26',
    date_display: 'Jan 13 – Feb 26, 2025',
    description: `Kumbh Mela is the world's largest human gathering — a Hindu pilgrimage and festival held at the confluence of the Ganges, Yamuna and mythical Saraswati rivers in Prayagraj. The event attracts between 100 million and 150 million pilgrims over its duration, making it the single largest peaceful gathering of people on earth. UNESCO has recognised Kumbh Mela as an Intangible Cultural Heritage of Humanity.

The festival has been held for thousands of years, with its origins in Hindu mythology describing a battle between gods and demons over a pot (kumbha) of the nectar of immortality. According to legend, drops of the nectar fell at four locations in India — Prayagraj, Haridwar, Nashik and Ujjain — each of which hosts its own Kumbh Mela on a rotating schedule determined by the positions of Jupiter, the Sun and the Moon.

The Maha Kumbh Mela at Prayagraj, held every 12 years, is the largest of all, drawing tens of millions of pilgrims who come to bathe at the sacred Sangam — the confluence of the three rivers — on specific auspicious dates called Shahi Snan. Bathing at the Sangam during Kumbh Mela is believed to cleanse the soul of all sins and break the cycle of death and rebirth.

Beyond its spiritual significance, Kumbh Mela is one of the world's most extraordinary spectacles — a temporary city built for millions, with thousands of camps, ashrams, processions of naked Naga sadhus covered in ash, enormous religious ceremonies and an atmosphere of collective devotion and celebration unlike anything else on earth.`,
    price_display: 'Free',
    attendees: 100000000, vendor_spots: 5000,
    website: 'https://www.kumbh.gov.in',
    featured: 1,
    image_url: 'https://images.unsplash.com/photo-1609766857970-6f9b7a4699da?w=800&q=80',
    tags: JSON.stringify(['kumbh mela','prayagraj','india','hindu','pilgrimage','world largest','gangues']),
    meta_title: 'Kumbh Mela Prayagraj — World\'s Largest Human Gathering | Festmore',
    meta_desc: 'Kumbh Mela Prayagraj: the world\'s largest human gathering with 100 million+ pilgrims. The most extraordinary festival on earth. Complete visitor guide.',
  },
  {
    title: 'Diwali Festival Mumbai 2025',
    category: 'festival', city: 'Mumbai', country: 'IN',
    start_date: '2025-10-20', end_date: '2025-10-24',
    date_display: 'Oct 20–24, 2025',
    description: `Diwali — the Festival of Lights — is India's most beloved and universally celebrated holiday, observed by Hindus, Jains, Sikhs and some Buddhists across the subcontinent and throughout the Indian diaspora worldwide. For five days each autumn, India transforms into a blaze of oil lamps, fireworks, sweets and colour in the most joyful celebration of the Hindu calendar.

The festival marks the victory of light over darkness, knowledge over ignorance, and good over evil. In the Hindu tradition, it celebrates the return of Lord Rama to Ayodhya after 14 years of exile and his victory over the demon king Ravana. The lighting of diyas — small clay oil lamps — symbolises the illumination of the soul and the removal of spiritual darkness.

In Mumbai, India's most cosmopolitan city, Diwali is celebrated with extraordinary exuberance. The city's skyline transforms as apartment buildings compete to display the most spectacular light decorations. The streets of neighbourhoods like Bhuleshwar, Crawford Market and Chowpatty Beach fill with vendors selling sweets, flowers, fireworks and decorative items. The burst of fireworks each evening creates a sky spectacle that can be seen for miles.

The food of Diwali is extraordinary — each regional tradition has its own specialties, from Maharashtrian chakli and shankarpale to North Indian barfi and gulab jamun, all exchanged as gifts between families and neighbours. For visitors, Diwali offers an unparalleled window into Indian culture, hospitality and the sheer joy of collective celebration.`,
    price_display: 'Free',
    attendees: 5000000, vendor_spots: 2000,
    website: 'https://www.maharashtratourism.gov.in',
    featured: 1,
    image_url: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=800&q=80',
    tags: JSON.stringify(['diwali','mumbai','india','festival of lights','diyas','fireworks','hindu']),
    meta_title: 'Diwali Festival Mumbai 2025 — India\'s Festival of Lights | Festmore',
    meta_desc: 'Diwali in Mumbai 2025: India\'s most beloved festival of lights. Five days of diyas, fireworks and celebration. Complete guide for visitors Oct 20-24.',
  },
  {
    title: 'Rann Utsav Festival Gujarat 2025',
    category: 'festival', city: 'Kutch', country: 'IN',
    start_date: '2025-11-01', end_date: '2026-02-28',
    date_display: 'Nov 2025 – Feb 2026',
    description: `Rann Utsav is one of India's most extraordinary and visually stunning festivals, celebrating the unique landscape of the Rann of Kutch — the world's largest salt desert — during its most magical period. For four months each winter when the monsoon waters recede and leave vast white salt flats stretching to the horizon, the Government of Gujarat hosts a spectacular festival that celebrates the culture, crafts, music and food of the Kutch region.

The festival is centred on a vast tented city — Dhordo — set up on the edge of the Great Rann, where luxury and standard tented accommodation allows visitors to experience the desert landscape. At full moon, the white salt flats reflect the moonlight with an ethereal luminosity that has made the Rann of Kutch one of India's most photographed landscapes.

The cultural programme is extraordinary — performances by folk musicians and dancers from the Kutch region, including the spectacular Garba and Dandiya Raas dances, fill the evenings with colour and energy. Artisan villages showcase the exquisite crafts of Kutch, including the famous Kutchi embroidery, bandhani tie-dye fabric, Rogan art and hand-block printing that have made the region one of India's greatest centres of textile craft.

The Rann itself can be explored on camelback, by jeep or on foot, with the surreal landscape of white salt stretching to Pakistan creating one of India's most otherworldly travel experiences. Sunrise and sunset over the Rann, with the sky reflected in the salt flats, are among the most beautiful natural spectacles in Asia.`,
    price_display: '₹100 entry + accommodation',
    attendees: 500000, vendor_spots: 1000,
    website: 'https://www.rannutsav.com',
    featured: 1,
    image_url: 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=800&q=80',
    tags: JSON.stringify(['rann utsav','kutch','gujarat','india','salt desert','folk culture','crafts']),
    meta_title: 'Rann Utsav Gujarat 2025-2026 — India\'s White Desert Festival | Festmore',
    meta_desc: 'Rann Utsav 2025: India\'s most spectacular desert festival on the world\'s largest salt flats in Kutch, Gujarat. Nov-Feb with folk music, crafts and moonlit desert.',
  },

  // ══════════════════════════════
  // THAILAND 🇹🇭
  // ══════════════════════════════
  {
    title: 'Loy Krathong Festival Thailand 2025',
    category: 'festival', city: 'Bangkok', country: 'TH',
    start_date: '2025-11-05', end_date: '2025-11-05',
    date_display: '5 November 2025',
    description: `Loy Krathong is one of Thailand's most beautiful and beloved festivals, celebrated on the full moon of the twelfth lunar month each year. The festival involves floating small decorated rafts — krathongs — made from banana leaves, flowers and candles on rivers, lakes and waterways across Thailand, creating a magical spectacle of thousands of flickering lights on the water.

The tradition is believed to originate in the Sukhothai Kingdom over 700 years ago, and is associated with asking forgiveness from the goddess of water for the pollution caused by humans, as well as releasing bad luck and making wishes for the coming year. The act of floating a krathong is both a deeply spiritual gesture and an act of extraordinary visual beauty — particularly when multiplied thousands of times across the rivers and canals of Bangkok.

In the capital, the Chao Phraya River becomes the centrepiece of the celebration, with krathongs floating downstream as fireworks burst overhead. The ancient royal capital of Ayutthaya holds perhaps the most atmospheric celebration, with the ruins of ancient temples illuminated by thousands of floating lights on the surrounding waterways. Sukhothai, the original home of the festival, holds the most traditional celebration, with the Historical Park providing a stunning backdrop for the floating lights.

The evening of Loy Krathong is one of Thailand's most romantically beautiful nights — a time for couples, families and communities to gather by the water, release their worries along with their krathong, and watch the lights drift away into the darkness.`,
    price_display: 'Free (krathong €1-3)',
    attendees: 3000000, vendor_spots: 500,
    website: 'https://www.tourismthailand.org',
    featured: 1,
    image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    tags: JSON.stringify(['loy krathong','thailand','floating lights','full moon','banana leaf','traditional']),
    meta_title: 'Loy Krathong Thailand 2025 — Festival of Floating Lights | Festmore',
    meta_desc: 'Loy Krathong Thailand 2025: the magical festival of floating lights on 5 November. Thousands of candle-lit krathongs on rivers and lakes across Thailand.',
  },
  {
    title: 'Vegetarian Festival Phuket 2025',
    category: 'festival', city: 'Phuket', country: 'TH',
    start_date: '2025-10-02', end_date: '2025-10-11',
    date_display: 'Oct 2–11, 2025',
    description: `The Phuket Vegetarian Festival — known locally as the Nine Emperor Gods Festival — is one of the world's most extraordinary and intense religious festivals, combining strict vegetarian diet with extraordinary acts of ritual devotion that must be seen to be believed. For nine days each October, Phuket's Chinese-Thai community abstains from meat, alcohol and sensual pleasures while participating in ceremonies that include fire-walking, blade-climbing and extreme ritual acts of devotion performed by entranced spirit mediums.

The festival originated among Phuket's Chinese tin-mining community in the early 19th century and is believed to bring good luck and health to participants and observers. The street processions, during which spirit mediums in trance pierce their bodies with swords, spears and other implements while seemingly feeling no pain, draw thousands of observers from across Thailand and around the world.

Beyond the dramatic ritual elements, the festival transforms Phuket Town with dozens of street food stalls serving exceptional Thai-Chinese vegetarian cuisine. The yellow-flagged vegetarian restaurants that proliferate during the festival offer some of the most creative and delicious plant-based food in Asia, with dishes that replicate meat flavours and textures using tofu and vegetable proteins with extraordinary skill.

The festival's combination of extraordinary religious intensity, exceptional food and the unique cultural heritage of Phuket's Hokkien Chinese community makes it one of Asia's most fascinating and unique cultural experiences.`,
    price_display: 'Free',
    attendees: 200000, vendor_spots: 300,
    website: 'https://www.tourismthailand.org/phuket-vegetarian-festival',
    featured: 0,
    image_url: 'https://images.unsplash.com/photo-1467803738586-46b7eb7b16a1?w=800&q=80',
    tags: JSON.stringify(['vegetarian festival','phuket','thailand','chinese thai','nine emperor gods','religious']),
    meta_title: 'Phuket Vegetarian Festival 2025 — Thailand\'s Most Extraordinary Event | Festmore',
    meta_desc: 'Phuket Vegetarian Festival 2025: Thailand\'s most extraordinary religious festival Oct 2-11. Nine days of devotion, street food and unique Chinese-Thai culture.',
  },

  // ══════════════════════════════
  // NORWAY 🇳🇴
  // ══════════════════════════════
  {
    title: 'Norwegian Constitution Day Oslo 2026',
    category: 'city', city: 'Oslo', country: 'NO',
    start_date: '2026-05-17', end_date: '2026-05-17',
    date_display: '17 May 2026',
    description: `Norway's Constitution Day on 17 May is one of the most joyful and distinctive national celebrations in the world — a day when the entire nation dresses in traditional national costume (bunad) and takes to the streets to celebrate Norwegian identity, democracy and independence. Unlike most national days which feature military parades, Norway's celebration is centred entirely on children, with school processions waving flags through every town and city in the country.

In Oslo, the children's parade along Karl Johans gate past the Royal Palace — where the Royal Family traditionally waves from the balcony — is one of the most heartwarming public spectacles in Scandinavia. Hundreds of thousands of people line the streets, all in their finest bunad or national dress, creating a sea of colour and Norwegian flags that stretches as far as the eye can see.

The bunad itself is an extraordinary cultural artefact — each region of Norway has its own distinct traditional costume, with elaborate hand-embroidery, silver jewellery and specific colour combinations that identify the wearer's regional heritage. Seeing the full diversity of Norwegian regional dress assembled on a single day in Oslo is a remarkable experience.

The celebrations extend throughout the day with band music, speeches, traditional games and enormous amounts of ice cream and hot dogs — the quintessential Norwegian Constitution Day treats. The evening sees younger Norwegians celebrating in parks and public spaces, often with bonfires and the distinctive Russefeiring graduation celebrations running alongside the national day festivities.`,
    price_display: 'Free',
    attendees: 500000, vendor_spots: 100,
    website: 'https://www.visitnorway.com',
    featured: 1,
    image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    tags: JSON.stringify(['constitution day','norway','oslo','bunad','national day','17 mai','children parade']),
    meta_title: 'Norwegian Constitution Day Oslo 2026 — 17 May | Festmore',
    meta_desc: 'Norway\'s Constitution Day 17 May 2026 in Oslo: the world\'s most joyful national celebration with traditional bunad costumes, children\'s parades and the Royal Family.',
  },

  // ══════════════════════════════
  // FINLAND 🇫🇮
  // ══════════════════════════════
  {
    title: 'Flow Festival Helsinki 2026',
    category: 'festival', city: 'Helsinki', country: 'FI',
    start_date: '2026-08-14', end_date: '2026-08-16',
    date_display: 'Aug 14–16, 2026',
    description: `Flow Festival is Helsinki's most internationally acclaimed music festival, combining world-class music across multiple genres with extraordinary food, art and architecture in the unique setting of the Suvilahti power plant area — a beautifully preserved industrial heritage site in the heart of Helsinki. Flow has established itself as one of the Nordic region's most credible and forward-thinking festivals, known for booking artists at precisely the right moment in their careers.

The festival's commitment to sustainability, design and quality sets it apart from conventional music events. The food programme — developed in collaboration with Helsinki's best chefs and restaurants — is exceptional, with local and seasonal Finnish ingredients forming the basis of exceptional festival cuisine. The architectural setting of the brick industrial buildings, combined with thoughtful lighting design, gives Flow a distinctive aesthetic character unlike any other European festival.

Helsinki itself adds enormously to the Flow experience — the city's extraordinary design culture, sauna tradition, archipelago islands accessible by ferry and exceptional restaurant scene make it one of Europe's finest festival cities for a city break. The August timing means long Nordic evenings with near-permanent daylight, creating a dreamlike atmosphere for outdoor events.`,
    price_display: '€160–€240', attendees: 25000, vendor_spots: 80,
    website: 'https://www.flowfestival.com', featured: 1,
    image_url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80',
    tags: JSON.stringify(['flow festival','helsinki','finland','music','sustainable','design','nordic']),
    meta_title: 'Flow Festival Helsinki 2026 — Finland\'s Premier Music Festival | Festmore',
    meta_desc: 'Flow Festival Helsinki 2026: Aug 14-16. Finland\'s most internationally acclaimed music festival in a stunning industrial setting with world-class food and art.',
  },

  // ══════════════════════════════
  // ITALY 🇮🇹
  // ══════════════════════════════
  {
    title: 'Palio di Siena Horse Race 2026',
    category: 'city', city: 'Siena', country: 'IT',
    start_date: '2026-07-02', end_date: '2026-07-02',
    date_display: '2 July & 16 August 2026',
    description: `The Palio di Siena is one of the world's most extraordinary and intense historical events — a bareback horse race held twice yearly in the magnificent Piazza del Campo in Siena, a UNESCO World Heritage Site. The race has been run continuously since the 13th century and represents the absolute pinnacle of civic rivalry, passion and medieval tradition in Italian life.

The Piazza del Campo — already one of the most beautiful medieval squares in Europe — is transformed for the Palio into a temporary racetrack, with earth and turf laid over the brick paving and temporary grandstands erected around the perimeter. The 17 contrade (medieval city districts) of Siena compete in the race, with only 10 chosen by lot for each running. The rivalry between contrade is the stuff of legend — centuries of victories, defeats, betrayals and alliances that shape the identity of every Sienese from birth.

The three days of festivities building to the race itself are as extraordinary as the race. Medieval costume parades with the alfieri flag throwers, historical processions and blessing of the horses in the contrada churches create an atmosphere of extraordinary collective emotion. The race itself lasts barely 90 seconds, with the horses completing three circuits of the piazza at terrifying speed, but the emotional intensity of those 90 seconds — for the 50,000 people packed into the piazza — is unlike anything else in the world of sport or spectacle.`,
    price_display: 'Free (standing) €250–€500 (seats)',
    attendees: 50000, vendor_spots: 50,
    website: 'https://www.ilpalio.org', featured: 1,
    image_url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80',
    tags: JSON.stringify(['palio di siena','siena','italy','horse race','medieval','piazza del campo','contrade']),
    meta_title: 'Palio di Siena 2026 — Italy\'s Most Extraordinary Medieval Race | Festmore',
    meta_desc: 'Palio di Siena 2026: the world\'s most extraordinary horse race in a medieval square. July 2 and August 16. 700 years of Sienese tradition and passion.',
  },

  // ══════════════════════════════
  // SPAIN 🇪🇸
  // ══════════════════════════════
  {
    title: 'Running of the Bulls San Fermín Pamplona 2026',
    category: 'festival', city: 'Pamplona', country: 'ES',
    start_date: '2026-07-07', end_date: '2026-07-14',
    date_display: 'Jul 7–14, 2026',
    description: `The Festival of San Fermín in Pamplona is one of the world's most famous and controversial festivals, centred on the legendary Encierro — the Running of the Bulls — in which thousands of participants race through 875 metres of narrow streets ahead of six fighting bulls each morning for eight consecutive days. Made internationally famous by Ernest Hemingway's 1926 novel The Sun Also Rises, San Fermín has become a bucket-list experience that draws visitors from every corner of the globe.

The festival begins on 6 July at midnight with the Chupinazo — the firing of a rocket from the balcony of Pamplona's town hall — that signals the start of eight days of continuous celebration. The city, transformed by an ocean of white-and-red-clad revellers, becomes one enormous street party that runs virtually without pause for over a week.

The Encierro itself begins each morning at 8:00 with a rocket, sending 2,000-3,000 runners sprinting ahead of six bulls through the old city streets to the bullring. The run lasts between two and four minutes, depending on how the bulls behave, and combines genuine danger with an extraordinary collective adrenaline experience. Beyond the Encierro, the festival features bullfights, parades, open-air concerts, fireworks and the extraordinary spectacle of Pamplona's population transformed by a week of communal celebration.`,
    price_display: 'Free (bullfight tickets €10–€100)',
    attendees: 1000000, vendor_spots: 400,
    website: 'https://www.sanfermin.com', featured: 1,
    image_url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80',
    tags: JSON.stringify(['san fermin','pamplona','spain','running of the bulls','encierro','hemingway','tradition']),
    meta_title: 'San Fermín Pamplona 2026 — Running of the Bulls | Festmore',
    meta_desc: 'San Fermín Festival Pamplona 2026: Jul 7-14. The legendary Running of the Bulls and eight days of celebration made famous by Hemingway.',
  },

  // ══════════════════════════════
  // IRELAND 🇮🇪
  // ══════════════════════════════
  {
    title: 'Galway International Arts Festival 2026',
    category: 'exhibition', city: 'Galway', country: 'IE',
    start_date: '2026-07-13', end_date: '2026-07-26',
    date_display: 'Jul 13–26, 2026',
    description: `Galway International Arts Festival is Ireland's leading arts festival and one of Europe's most celebrated, transforming the beautiful medieval city of Galway on Ireland's west coast for two weeks each July. The festival presents an extraordinary programme of theatre, visual art, music, street performance and family events that consistently attracts some of the world's finest artists and companies.

Galway itself is one of Ireland's most vibrant and culturally rich cities — a young, multilingual city with a legendary music scene, exceptional seafood and the unique cultural heritage of the Irish-speaking Connemara region on its doorstep. The combination of a world-class arts festival with Galway's irresistible atmosphere makes it one of Ireland's essential summer destinations.

The festival is known for commissioning major new works that make their world premiere in Galway before touring internationally. Its spectacular Big Top tent on the docks has hosted some of the most memorable theatrical productions seen in Ireland in recent decades. The visual art programme consistently features major international artists alongside Irish talent, with exhibitions transforming spaces throughout the city.

Street performance is central to the Galway experience during the festival — the medieval streets and squares fill with circus, theatre, music and visual art that makes simply walking through the city an extraordinary cultural experience. The programme is genuinely for everyone, with many free events complementing the ticketed programme.`,
    price_display: 'Free–€45', attendees: 200000, vendor_spots: 60,
    website: 'https://www.giaf.ie', featured: 0,
    image_url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80',
    tags: JSON.stringify(['galway arts festival','ireland','arts','theatre','music','west coast','medieval']),
    meta_title: 'Galway International Arts Festival 2026 | Festmore',
    meta_desc: 'Galway International Arts Festival 2026: Jul 13-26. Ireland\'s leading arts festival in the beautiful medieval city of Galway. Theatre, music, visual art and street performance.',
  },

  // ══════════════════════════════
  // CZECH REPUBLIC 🇨🇿
  // ══════════════════════════════
  {
    title: 'Prague Spring Music Festival 2026',
    category: 'concert', city: 'Prague', country: 'CZ',
    start_date: '2026-05-12', end_date: '2026-06-03',
    date_display: 'May 12 – Jun 3, 2026',
    description: `Prague Spring International Music Festival is one of the world's most prestigious classical music events, held annually in the magnificent Baroque and Art Nouveau concert halls of Prague for three weeks each May and June. Since its founding in 1946, Prague Spring has been one of Central Europe's most important cultural institutions, presenting the finest international orchestras, soloists and conductors in a city whose architectural beauty provides an unparalleled concert setting.

The festival traditionally opens on 12 May — the anniversary of the death of Bedřich Smetana — with a performance of his symphonic cycle Má vlast (My Homeland), which has opened every Prague Spring since the festival's founding. The Rudolfinum concert hall and the extraordinary Smetana Hall in the Municipal House are the festival's primary venues, offering some of the most beautiful concert settings in Europe.

Prague itself provides an extraordinary context for classical music — the city where Mozart premiered Don Giovanni, where Dvořák composed, where Smetana drew inspiration from the Bohemian landscape. Walking through the cobbled streets of Malá Strana or across the Charles Bridge after an evening concert at the Rudolfinum is one of the great musical experiences of European cultural life.`,
    price_display: '€20–€120', attendees: 100000, vendor_spots: 0,
    website: 'https://www.festival.cz', featured: 0,
    image_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
    tags: JSON.stringify(['prague spring','czech republic','classical music','smetana','concert','dvorak']),
    meta_title: 'Prague Spring Music Festival 2026 — World-Class Classical Music | Festmore',
    meta_desc: 'Prague Spring International Music Festival 2026: May 12 – Jun 3. World-class classical music in Prague\'s magnificent concert halls. One of Europe\'s greatest music events.',
  },

  // ══════════════════════════════
  // HUNGARY 🇭🇺
  // ══════════════════════════════
  {
    title: 'Budapest Wine Festival 2025',
    category: 'festival', city: 'Budapest', country: 'HU',
    start_date: '2025-09-11', end_date: '2025-09-14',
    date_display: 'Sep 11–14, 2025',
    description: `Budapest Wine Festival is one of Central Europe's finest wine events, held in the spectacular setting of the Buda Castle — a UNESCO World Heritage Site — overlooking the Danube and the city of Pest. For four days each September, over 150 Hungarian winegrowers present their finest wines from the Tokaj, Eger, Villány and other great wine regions of Hungary to 60,000 visitors from across the world.

Hungary has one of the oldest and most distinguished wine cultures in Europe, with the Tokaj wine region producing what was once called the Wine of Kings — the extraordinary Tokaji Aszú dessert wine that graced the tables of European royalty for centuries. The Budapest Wine Festival is the ideal introduction to Hungarian wine culture, with knowledgeable producers presenting their wines in the extraordinary setting of the castle courtyards.

The festival combines wine tasting with exceptional Hungarian food, folk music performances, craft stalls and the unparalleled backdrop of Buda Castle illuminated at night. The views from the castle terraces over the illuminated Chain Bridge, the Danube and the magnificent baroque skyline of Pest create one of Europe's most atmospheric festival settings. A tasting glass and wine passport are included in the entry price.`,
    price_display: '€18–€25', attendees: 60000, vendor_spots: 150,
    website: 'https://www.aborfesztival.hu', featured: 0,
    image_url: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=800&q=80',
    tags: JSON.stringify(['budapest wine festival','hungary','tokaj','buda castle','wine','danube','heritage']),
    meta_title: 'Budapest Wine Festival 2025 — Hungarian Wine at Buda Castle | Festmore',
    meta_desc: 'Budapest Wine Festival 2025: Sep 11-14. 150+ Hungarian winegrowers at Buda Castle overlooking the Danube. Tokaj, Eger, Villány wines and exceptional food.',
  },

  // ══════════════════════════════
  // GREECE 🇬🇷
  // ══════════════════════════════
  {
    title: 'Thessaloniki International Film Festival 2025',
    category: 'exhibition', city: 'Thessaloniki', country: 'GR',
    start_date: '2025-11-01', end_date: '2025-11-10',
    date_display: 'Nov 1–10, 2025',
    description: `Thessaloniki International Film Festival is one of the most important film festivals in Southeastern Europe, celebrating independent cinema for ten days each November in Greece's second city. Since 1960, the festival has been a key showcase for new Greek and international independent film, establishing itself as the premier meeting point for filmmakers, critics and cinema lovers in the region.

The festival's focus on independent and auteur cinema gives it a distinct character — it is a festival for people who take cinema seriously, with a programme that consistently surfaces extraordinary films from across the globe before they reach wider distribution. The Discovery section showcases first and second feature films, making Thessaloniki an important launchpad for emerging international talent.

Thessaloniki itself is one of Greece's most compelling cities — a vibrant university city with a rich Byzantine and Ottoman heritage, extraordinary street food culture (the city is considered Greece's food capital) and a cosmopolitan energy quite different from Athens. Combining the film festival with exploration of the city's remarkable food scene, Byzantine monuments and waterfront cafés makes for a memorable late autumn visit to Greece.`,
    price_display: '€5–€20', attendees: 70000, vendor_spots: 0,
    website: 'https://www.filmfestival.gr', featured: 0,
    image_url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80',
    tags: JSON.stringify(['thessaloniki film festival','greece','independent cinema','film','balkan']),
    meta_title: 'Thessaloniki Film Festival 2025 — Greece\'s Premier Cinema Event | Festmore',
    meta_desc: 'Thessaloniki International Film Festival 2025: Nov 1-10. Southeast Europe\'s most important independent film showcase in Greece\'s food capital.',
  },

  // ══════════════════════════════
  // CROATIA 🇭🇷
  // ══════════════════════════════
  {
    title: 'INmusic Festival Zagreb 2026',
    category: 'festival', city: 'Zagreb', country: 'HR',
    start_date: '2026-06-22', end_date: '2026-06-24',
    date_display: 'Jun 22–24, 2026',
    description: `INmusic Festival is Croatia's largest open-air music festival, held on the beautiful Lake Jarun islands in Zagreb for three days each June. The festival has established itself as one of Southeast Europe's most important and respected music events, consistently booking major international rock and indie acts alongside the best of Croatian and regional music.

The lake setting is exceptional — the festival is split across two islands connected by bridges, with stages on both islands creating a unique layout that gives INmusic a distinctive character. The warm Croatian June weather, the cool lake breezes and the proximity to Zagreb's excellent restaurant and café scene make INmusic an ideal combination of serious music festival and city break destination.

Zagreb itself is one of Europe's most underrated cities — a Central European capital with a beautifully preserved Austro-Hungarian city centre, exceptional coffee culture, a vibrant arts scene and some of the most reasonable prices of any European capital. Combining INmusic with a few days exploring Zagreb's museums, markets, restaurants and café terraces makes for a complete and very affordable festival experience.`,
    price_display: '€80–€150', attendees: 50000, vendor_spots: 100,
    website: 'https://www.inmusicfestival.com', featured: 0,
    image_url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80',
    tags: JSON.stringify(['inmusic','zagreb','croatia','music festival','lake jarun','islands','rock']),
    meta_title: 'INmusic Festival Zagreb 2026 — Croatia\'s Biggest Music Festival | Festmore',
    meta_desc: 'INmusic Festival Zagreb 2026: Jun 22-24. Croatia\'s largest music festival on Lake Jarun islands. World-class rock and indie acts in an extraordinary setting.',
  },
];

// ─── ARTICLES ───
const articles = [
  {
    title: 'Japan Festivals 2026: The Complete Guide to Japan\'s Greatest Events',
    slug: 'japan-festivals-2026-complete-guide',
    excerpt: 'From the ancient Gion Matsuri to the magical Sapporo Snow Festival — the complete guide to experiencing Japan\'s extraordinary festival culture in 2026.',
    content: `<h2>Japan's Festival Culture: A Living History</h2>
<p>No country on earth celebrates its cultural heritage through festivals with the same depth, beauty and continuity as Japan. Japanese festivals — known as matsuri — have been observed for centuries and in some cases millennia, maintaining traditions that connect contemporary Japan directly to its ancient past. For visitors, experiencing a Japanese matsuri is one of the most profound and memorable travel experiences available anywhere in the world.</p>

<h2>Gion Matsuri — Japan's Greatest Festival (July)</h2>
<p>Held throughout the entire month of July in Kyoto, Gion Matsuri is Japan's most celebrated festival, dating back over 1,100 years to 869 AD. The festival's centrepiece is the Yamaboko Junko parade on 17 July, when enormous decorated wooden floats — some standing 25 metres tall — are pulled through the historic streets of Kyoto by teams of men in traditional dress. The floats are decorated with centuries-old tapestries, some imported from Persia and India via the Silk Road, many of which are classified as national cultural treasures.</p>
<p>The evenings of 14-16 July feature the magical Yoiyama celebrations, when the floats are illuminated with lanterns and the streets of the Gion district fill with visitors in yukata summer kimono. Street food stalls serving takoyaki, yakisoba and kakigori shaved ice create an atmospheric summer festival scene that has been replicated across Japan but never surpassed.</p>

<h2>Sapporo Snow Festival — Winter Magic in Hokkaido (February)</h2>
<p>Held in the northern island of Hokkaido each February, the Sapporo Snow Festival draws over 2 million visitors to see hundreds of extraordinary snow and ice sculptures in Odori Park. The sculptures range from intricate small figures to enormous multi-storey buildings and famous landmarks recreated entirely in snow. Teams from the Japan Ground Self-Defense Force and international competitors create works of staggering ambition and skill that can only exist in the deep cold of a Hokkaido winter.</p>
<p>The Susukino Site's ice sculptures illuminate beautifully at night, creating one of winter Japan's most magical spectacles. Sapporo's world-class skiing at nearby Niseko, exceptional seafood and famous beer make it an extraordinary winter destination beyond the festival itself.</p>

<h2>Nebuta Matsuri — The Festival of Illuminated Giants (August)</h2>
<p>Held in the northern city of Aomori for six nights each August, Nebuta Matsuri is one of Japan's three greatest summer festivals. Three million visitors come to see enormous three-dimensional illuminated floats — depicting samurai warriors, mythological figures and historical heroes — pulled through the streets while thousands of Haneto dancers in traditional costume leap and chant beside them.</p>
<p>The energy of Nebuta is extraordinary — the combination of the glowing floats, the rhythmic music of taiko drums and shamisen, and the collective ecstasy of thousands of dancers creates an atmosphere of intense collective joy that is uniquely Japanese.</p>

<h2>Cherry Blossom Season — Nature's Greatest Festival (March-April)</h2>
<p>While not a festival in the conventional sense, Japan's cherry blossom season is perhaps the country's most celebrated annual event. For two to three weeks each spring, parks across Japan transform into pink landscapes as the sakura bloom and fall. The tradition of hanami — flower viewing — draws millions of Japanese and international visitors to picnic, celebrate and reflect beneath the blossoms.</p>

<h2>Planning Your Japan Festival Trip</h2>
<p>Japan's festival calendar is extraordinarily rich, with significant matsuri taking place in every month of the year. The most popular — Gion Matsuri in July, Nebuta in August, cherry blossom in spring — require advance booking of accommodation, which fills months ahead. The Japan Rail Pass offers excellent value for multi-city festival travel. Japanese festivals are generally family-friendly, well-organised and extraordinarily safe events that welcome international visitors warmly.</p>`,
    category: 'festival', country: 'JP',
    image_url: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80',
    tags: JSON.stringify(['japan festivals 2026','gion matsuri','sapporo snow festival','nebuta','cherry blossom','japanese festivals']),
    meta_title: 'Japan Festivals 2026: Complete Guide to Japan\'s Greatest Events | Festmore',
    meta_desc: 'Complete guide to Japan\'s festivals in 2026. Gion Matsuri, Sapporo Snow Festival, Nebuta Matsuri, cherry blossom and more with dates and visitor tips.',
  },
  {
    title: 'India Festivals 2025-2026: The Ultimate Guide to India\'s Greatest Celebrations',
    slug: 'india-festivals-2025-2026-ultimate-guide',
    excerpt: 'From Diwali to Kumbh Mela, Holi to the Rann Utsav — the ultimate guide to experiencing India\'s extraordinary festival culture in 2025 and 2026.',
    content: `<h2>India: The Land of Festivals</h2>
<p>No country on earth celebrates as many festivals as India. With over a billion people, dozens of religions, hundreds of languages and an unbroken cultural history stretching back thousands of years, India offers a festival calendar of staggering richness and diversity. Every month, every region, every religious community has its own celebrations — and many of India's greatest festivals are among the most extraordinary human experiences available anywhere in the world.</p>

<h2>Diwali — The Festival of Lights (October/November)</h2>
<p>Diwali is India's most universally beloved festival, celebrated by Hindus, Jains, Sikhs and many others across the subcontinent and throughout the Indian diaspora worldwide. For five days each autumn, India transforms into a blaze of oil lamps, fireworks, sweets and colour. The lighting of diyas — small clay oil lamps — symbolises the victory of light over darkness, knowledge over ignorance, and good over evil.</p>
<p>In practice, Diwali means families gathering, homes cleaned and decorated, new clothes worn, sweets exchanged with neighbours, and spectacular fireworks filling the night sky. The variety of Diwali celebrations across India is itself fascinating — each region has its own traditions, foods and customs that reflect the diversity of Indian culture.</p>

<h2>Kumbh Mela — The World's Largest Human Gathering</h2>
<p>Nothing in the world quite prepares you for the scale of Kumbh Mela — the largest human gathering on earth, held at the confluence of sacred rivers in northern India. The Maha Kumbh Mela at Prayagraj, held every 12 years, attracts between 100 and 150 million pilgrims. UNESCO has recognised Kumbh Mela as an Intangible Cultural Heritage of Humanity.</p>
<p>For visitors, Kumbh Mela offers an overwhelming and unforgettable encounter with the full depth and diversity of Hindu spiritual life. Naked Naga sadhus covered in ash, saffron-robed monks in procession, millions of ordinary pilgrims performing their ritual bathing — the scale and intensity of collective devotion is unlike anything else on earth.</p>

<h2>Holi — The Festival of Colours (March)</h2>
<p>Holi is India's most internationally recognisable festival and one of its most joyful. For one day in March, celebrating the arrival of spring and the victory of good over evil, communities across India throw coloured powder and water at each other in a tradition of joyful chaos that transcends age, gender and social status. The celebrations in Vrindavan and Mathura — the birthplace of Lord Krishna — are the oldest and most traditional, but Holi is celebrated with equal enthusiasm across the entire subcontinent.</p>

<h2>Rann Utsav — The Desert Festival (November-February)</h2>
<p>Less well-known internationally but utterly extraordinary, the Rann Utsav celebrates the Rann of Kutch — the world's largest salt desert — during its most magical season. For four months each winter, a vast tented city on the edge of the Great Rann allows visitors to experience the moonlit white salt flats, extraordinary Kutchi folk music and crafts, and one of India's most otherworldly landscapes.</p>

<h2>Planning Your India Festival Trip</h2>
<p>India's festival calendar requires careful advance planning, particularly for the most popular events. Diwali accommodation in major cities books out weeks in advance. Kumbh Mela requires significant advance preparation for the most auspicious bathing dates. Holi in Vrindavan is best experienced with a guided group for first-time visitors. The rewards of careful planning are festival experiences that will stay with you for a lifetime.</p>`,
    category: 'festival', country: 'IN',
    image_url: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=800&q=80',
    tags: JSON.stringify(['india festivals 2026','diwali','kumbh mela','holi','rann utsav','indian festivals guide']),
    meta_title: 'India Festivals 2025-2026: Ultimate Guide to India\'s Greatest Celebrations | Festmore',
    meta_desc: 'Ultimate guide to India\'s festivals 2025-2026. Diwali, Kumbh Mela, Holi, Rann Utsav and more — dates, tips and everything you need to experience India\'s extraordinary celebrations.',
  },
  {
    title: 'Best Festivals in Italy 2026: From Venice Carnival to Summer Music Events',
    slug: 'best-festivals-italy-2026-complete-guide',
    excerpt: 'Venice Carnival, Palio di Siena, Umbria Jazz, Florence Christmas markets — the complete guide to Italy\'s greatest festivals and events in 2026.',
    content: `<h2>Italy's Festival Culture: Ancient Traditions and Modern Celebrations</h2>
<p>Italy's festival calendar is as diverse and rich as the country itself — a combination of ancient religious and civic traditions dating back centuries, world-class performing arts events, and contemporary music festivals set against some of the world's most beautiful architectural backdrops. From the masked splendour of Venice Carnival to the raw passion of the Palio di Siena, Italian festivals offer experiences that are uniquely and irreducibly Italian.</p>

<h2>Venice Carnival — February</h2>
<p>Venice Carnival is one of the world's most visually spectacular celebrations, recreating the legendary masked festivities of the 18th-century Venetian Republic for two weeks each February. Elaborate costumed figures in authentic period dress parade through Piazza San Marco and along the canals, while the city fills with visitors from across the world who come for the extraordinary spectacle of historical costume in the world's most beautiful city.</p>
<p>The masks and costumes of Venetian Carnival range from simple domino masks and cloaks to extraordinarily elaborate creations that take months to make and represent specific 18th-century Venetian character types. The Bauta, the Colombina, the Medico della Peste — each has its own history and significance in the Venetian carnival tradition. Walking through Piazza San Marco surrounded by these extraordinary figures in the February mist is a uniquely dreamlike experience.</p>

<h2>Palio di Siena — July and August</h2>
<p>The Palio di Siena is unlike any other event in the world — a bareback horse race held twice yearly in the medieval Piazza del Campo, driven by centuries of rivalry between Siena's 17 contrade (city districts). The race has been run continuously since the 13th century and represents the absolute pinnacle of Italian civic passion and historical identity. The 90-second race concentrates an extraordinary intensity of emotion — centuries of victories, defeats, alliances and betrayals — into a moment of barely controlled chaos.</p>

<h2>Umbria Jazz Festival — July</h2>
<p>Umbria Jazz in Perugia is one of Europe's most important jazz festivals, transforming the beautiful medieval Umbrian city for ten days each July with world-class performances in the Piazza IV Novembre and throughout the historic city centre. The combination of international jazz legends and emerging artists, performed in one of Italy's most atmospheric medieval settings, makes Umbria Jazz exceptional.</p>

<h2>Florence Christmas Markets — November/December</h2>
<p>Florence hosts some of Italy's finest Christmas markets, with the traditional German-style market at Piazza Santa Croce providing the most spectacular setting — the great Gothic basilica illuminated behind the stalls of German and Italian Christmas goods. The combination of Florence's extraordinary Renaissance heritage and the warmth of Italian Christmas traditions creates a uniquely beautiful festive experience.</p>

<h2>Planning Your Italy Festival Trip</h2>
<p>Italy's most popular events — Venice Carnival and the Palio di Siena particularly — require very early booking. Venice hotels during Carnival period are booked a year in advance. Palio viewing spaces in the Piazza del Campo are extremely limited; grandstand seats are allocated by contrada membership or can sometimes be purchased through specialist travel companies. The most accessible way to see the Palio is to arrive very early in the morning of the race day and secure a free standing space in the centre of the piazza.</p>`,
    category: 'festival', country: 'IT',
    image_url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80',
    tags: JSON.stringify(['italy festivals 2026','venice carnival','palio di siena','umbria jazz','florence christmas','italian events']),
    meta_title: 'Best Festivals in Italy 2026 — Venice Carnival to Summer Events | Festmore',
    meta_desc: 'Complete guide to Italy\'s best festivals 2026. Venice Carnival, Palio di Siena, Umbria Jazz, Florence Christmas markets and more with dates and booking tips.',
  },
  {
    title: 'Spain Festivals 2026: From La Tomatina to Flamenco Fairs',
    slug: 'spain-festivals-2026-complete-guide',
    excerpt: 'La Tomatina, San Fermín, Feria de Abril, Primavera Sound — the complete guide to Spain\'s greatest festivals and events in 2026.',
    content: `<h2>Spain: Europe's Festival Capital</h2>
<p>Spain has the most extraordinary and diverse festival culture in Europe — a combination of ancient religious and civic traditions, spectacular natural celebrations and some of the world's finest music festivals. From the joyful chaos of La Tomatina's tomato fight to the solemn beauty of Semana Santa, from the raw passion of San Fermín to the sophistication of Primavera Sound, Spanish festivals reflect the full diversity and intensity of Spanish culture.</p>

<h2>La Tomatina — Buñol (Last Wednesday of August)</h2>
<p>La Tomatina is the world's greatest food fight and one of its most unique festival experiences. For one hour each year in the small town of Buñol near Valencia, 20,000 participants hurl 150 tonnes of ripe tomatoes at each other in the narrow streets. The tradition began in 1945 — the exact origin is disputed, with various stories involving a food fight between friends or a protest — and has grown into one of Spain's most internationally famous events. Completely absurd, completely joyful and completely unforgettable.</p>

<h2>San Fermín — Pamplona (7-14 July)</h2>
<p>The Festival of San Fermín in Pamplona is one of the world's most famous and intense festivals, centred on the legendary Running of the Bulls — the Encierro — in which thousands of participants race through 875 metres of narrow streets ahead of six fighting bulls each morning for eight days. Made internationally famous by Ernest Hemingway's 1926 novel The Sun Also Rises, San Fermín combines genuine danger with extraordinary collective celebration in a festival that has been running since the 16th century.</p>

<h2>Feria de Abril — Seville (April)</h2>
<p>Seville's Feria de Abril is one of Spain's most spectacular celebrations — a six-day festival of flamenco, fine horses, traditional dress and Andalusian joy that fills a vast fairground on the banks of the Guadalquivir. Women in brilliant flamenco dresses and men on horseback create a visual spectacle of extraordinary colour and elegance. The casetas — private and semi-private tents where Sevillanos gather to dance, eat and celebrate — give the feria its intimate community character that visitors rarely experience in full.</p>

<h2>Primavera Sound — Barcelona (May/June)</h2>
<p>Primavera Sound is consistently ranked among the world's finest music festivals for its exceptional curation. The Parc del Fòrum setting overlooking the Mediterranean, combined with a lineup that blends heritage acts with the most exciting emerging talent, makes Primavera an unmatched complete festival and city break experience.</p>

<h2>Semana Santa — Nationwide (Holy Week)</h2>
<p>Holy Week celebrations across Spain — particularly in Seville, Málaga and Valladolid — are among the world's most extraordinary religious processions, with brotherhoods carrying enormous sculptural floats of Christ and the Virgin through candlelit streets to the sound of saetas — spontaneous flamenco laments. The emotional intensity and visual splendour of Semana Santa is uniquely Spanish and deeply moving even for non-religious observers.</p>`,
    category: 'festival', country: 'ES',
    image_url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80',
    tags: JSON.stringify(['spain festivals 2026','la tomatina','san fermin','feria de abril','primavera sound','semana santa']),
    meta_title: 'Spain Festivals 2026 — La Tomatina to Flamenco Fairs | Festmore',
    meta_desc: 'Complete guide to Spain\'s best festivals 2026. La Tomatina, San Fermín, Feria de Abril, Primavera Sound and more with dates, history and visitor tips.',
  },
  {
    title: 'Thailand Festivals 2025-2026: The Complete Guide to Thai Celebrations',
    slug: 'thailand-festivals-2025-2026-complete-guide',
    excerpt: 'Songkran, Yi Peng lanterns, Loy Krathong, Full Moon Party — the complete guide to Thailand\'s most extraordinary festivals and celebrations.',
    content: `<h2>Thailand: The Land of Smiles and Festivals</h2>
<p>Thailand's festival calendar is one of Southeast Asia's richest, combining ancient Buddhist and Brahmin traditions with the uniquely Thai spirit of sanuk — the pursuit of joy and fun that permeates Thai culture. From the world's greatest water fight to the most beautiful floating light festival on earth, Thailand's celebrations offer some of the most sensory and memorable experiences available to travellers in Asia.</p>

<h2>Songkran — Thai New Year (13-15 April)</h2>
<p>Songkran is Thailand's New Year celebration and the world's largest water fight, transforming the entire country for three days each April as everyone — Thai and foreign, young and old — becomes fair game for a thorough soaking. What began as a gentle ritual of pouring scented water over elders' hands as a gesture of respect has evolved into a joyful national water battle of extraordinary scale and enthusiasm.</p>
<p>The celebrations in Chiang Mai are the most atmospheric and traditional, with the ancient moat surrounding the old city becoming the centrepiece of enormous water battles. Bangkok's Silom Road and Khao San Road host massive street parties. Even in small Thai towns, Songkran transforms the streets into scenes of collective water-drenched joy that capture everything that makes Thailand special.</p>

<h2>Yi Peng — Lantern Festival (November)</h2>
<p>Yi Peng in Chiang Mai is one of the most beautiful festivals on earth — the simultaneous release of thousands of paper sky lanterns on the full moon of the second month of the Lanna lunar calendar. The sight of thousands of glowing lanterns floating upward against the dark sky, reflected in the Ping River, is one of the most magical visual experiences available anywhere in the world. The main lantern release at the Maejo University grounds draws tens of thousands of participants who release their lanterns simultaneously in a breathtaking collective moment.</p>

<h2>Loy Krathong — Festival of Floating Lights (November)</h2>
<p>Loy Krathong, celebrated on the same full moon as Yi Peng in northern Thailand, involves floating small decorated rafts — krathongs — made from banana leaves, flowers and candles on rivers and waterways. The tradition is over 700 years old, believed to originate in the Sukhothai Kingdom, and involves asking forgiveness from the goddess of water and releasing bad luck along with the floating krathong. The sight of thousands of candlelit floats drifting downstream on the Chao Phraya River in Bangkok is extraordinarily beautiful.</p>

<h2>Phuket Vegetarian Festival (October)</h2>
<p>One of Asia's most extraordinary and intense religious events, the Phuket Vegetarian Festival combines strict vegetarian diet with ritual acts of devotion performed by entranced spirit mediums that include fire-walking and extreme piercing. For nine days, the streets of Phuket Town fill with processions, the smell of vegetarian street food and the sound of firecrackers. It is simultaneously one of Thailand's most intense and most fascinating cultural events.</p>

<h2>Planning Your Thailand Festival Trip</h2>
<p>Thailand's major festivals — Songkran, Yi Peng and Loy Krathong — are the most popular times to visit, meaning accommodation books out quickly and prices rise significantly. For Yi Peng in particular, book accommodation in Chiang Mai at least three months in advance. Songkran is celebrated nationwide, so the choice of where to spend it is based on personal preference — Chiang Mai for tradition, Bangkok for scale and energy, beach resorts for a more relaxed celebration.</p>`,
    category: 'festival', country: 'TH',
    image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    tags: JSON.stringify(['thailand festivals 2026','songkran','yi peng','loy krathong','phuket','thai celebrations']),
    meta_title: 'Thailand Festivals 2025-2026 — Complete Guide to Thai Celebrations | Festmore',
    meta_desc: 'Complete guide to Thailand\'s festivals 2025-2026. Songkran, Yi Peng lanterns, Loy Krathong, Full Moon Party and more with dates, history and visitor tips.',
  },
];

// ─── INSERT EVENTS ───
let eventsAdded = 0, eventsSkipped = 0;

const slugify = (str) => str.toLowerCase()
  .replace(/[^a-z0-9\s-]/g, '')
  .replace(/\s+/g, '-')
  .replace(/-+/g, '-')
  .trim();

for (const event of events) {
  try {
    const exists = db.prepare('SELECT id FROM events WHERE title=?').get(event.title);
    if (exists) { eventsSkipped++; continue; }
    let slug = slugify(event.title);
    let i = 1;
    while (db.prepare('SELECT id FROM events WHERE slug=?').get(slug)) { slug = slugify(event.title) + '-' + i++; }
    db.prepare(`
      INSERT INTO events (title,slug,category,city,country,start_date,end_date,date_display,
        description,price_display,attendees,vendor_spots,website,status,payment_status,
        featured,source,tags,image_url,meta_title,meta_desc)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,'active','paid',?,'manual',?,?,?,?)
    `).run(
      event.title,slug,event.category,event.city,event.country,
      event.start_date,event.end_date||'',event.date_display,
      event.description,event.price_display,event.attendees||0,event.vendor_spots||0,
      event.website||'',event.featured||0,event.tags||'[]',
      event.image_url||'',event.meta_title||'',event.meta_desc||''
    );
    eventsAdded++;
    console.log('Event added: ' + event.title);
  } catch(err) { console.error('Event error: ' + event.title + ' — ' + err.message); }
}

// ─── INSERT ARTICLES ───
let articlesAdded = 0, articlesSkipped = 0;

for (const article of articles) {
  try {
    const exists = db.prepare('SELECT id FROM articles WHERE slug=?').get(article.slug);
    if (exists) { articlesSkipped++; continue; }
    db.prepare(`
      INSERT INTO articles (title,slug,excerpt,content,category,country,image_url,tags,meta_title,meta_desc,author,status)
      VALUES (?,?,?,?,?,?,?,?,?,?,'Festmore Editorial','published')
    `).run(
      article.title,article.slug,article.excerpt,article.content,
      article.category,article.country,article.image_url,
      article.tags,article.meta_title,article.meta_desc
    );
    articlesAdded++;
    console.log('Article added: ' + article.title);
  } catch(err) { console.error('Article error: ' + article.title + ' — ' + err.message); }
}

console.log('\n✅ Done!');
console.log('Events added: ' + eventsAdded + ' (skipped: ' + eventsSkipped + ')');
console.log('Articles added: ' + articlesAdded + ' (skipped: ' + articlesSkipped + ')');
db.close();
