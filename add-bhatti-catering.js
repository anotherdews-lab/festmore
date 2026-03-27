// add-bhatti-catering.js
// Adds Bhatti Catering as a real verified vendor

const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, 'db', 'festmore.db'));

const extra = JSON.stringify({
  tagline: 'Authentische Asia Street Food Kitchen für Festivals und Events aller Größen',
  price_range: '€€ Mid-range',
  what_we_offer: `Bhatti Catering bietet ein maßgeschneidertes Angebot an Asia Street Food, indischen Spezialitäten und Fingerfood für Festivals und Outdoor-Events jeder Größe.

🍜 Asiatische Spezialitäten
Gebratene Nudeln, knusprige Frühlingsrollen, Entengerichte, thailändische Currys und viele weitere klassische Gerichte der asiatischen Straßenküche — alle frisch zubereitet mit tagesfrischen Zutaten vom Markt. Kein Dosengemüse, kein Convenience-Food, kein Glutamat.

🥟 Fingerfood & Snacks
Eine große Auswahl an Fingerfood zum Mitnehmen — von asiatischen Häppchen bis hin zu herzhaften Snacks, die sich perfekt für Festivals und Märkte eignen.

🌱 Veganes & Vegetarisches Angebot
Wir bieten eine breite Auswahl an veganen und vegetarischen Gerichten — 70–100% unserer Produkte sind biologisch zertifiziert.

🥐 Churros — Echte spanische Churros
Frisch gebackene, echte spanische Churros in höchster Qualität — ein Publikumsmagnet auf jedem Markt und Festival.

🌭 Bratwurst — Echte deutsche Bratwurst
Traditionelle deutsche Bratwurst vom Grill — authentisch und hochwertig.

🍷 Glühwein & Gløgg
Selbst gemachter Glühwein sowie dänischer und schwedischer Gløgg nach original Rezept — perfekt für Weihnachtsmärkte und Winterevents.

🚚 Fahrzeuge & Aufbauten
Je nach Anforderung und Platzverhältnissen setzen wir Pagodenzelte oder Verkaufswagen verschiedener Größen ein. Wir passen uns flexibel an die Gegebenheiten jedes Events an.`,

  looking_for: `Wir suchen Festivals, Weihnachtsmärkte, Straßenmärkte und Outdoor-Events aller Größen in Deutschland, der Schweiz, Österreich und darüber hinaus. Mit über 20 Jahren Erfahrung im Catering sind wir regelmäßig auf großen Festivals und Veranstaltungen in der DACH-Region vertreten. Wir stellen eine kulinarisch interessante Alternative zu den üblichen Anbietern dar und erweitern das Gesamtangebot jedes Events sinnvoll.`,

  event_types_wanted: ['Festivals','Christmas Markets','Street Markets','Outdoor Events','Trade Fairs','All Events'],
  availability: ['January','February','March','April','May','June','July','August','September','October','November','December'],

  space_required: '6×3m (Foodtruck)',
  travel_distance: 'Anywhere in Europe',
  needs_electricity: 'yes',
  needs_water: 'yes',
  certifications: 'HACCP zertifiziert, Lebensmittelhygiene, 20 Jahre Erfahrung, Bio-zertifizierte Produkte (70-100%)',
  languages: 'Deutsch, English',

  instagram: '',
  facebook: '',
  tiktok: '',
  video_url: '',
});

// Photos from their website
const photos = JSON.stringify([
  'https://www.bhatti-catering.de/s/cc_images/teaserbox_18623066.jpg?t=1696433312',
  'https://www.bhatti-catering.de/s/cc_images/teaserbox_18681697.jpeg?t=1701008985',
  'https://www.bhatti-catering.de/s/cc_images/teaserbox_19677326.jpeg?t=1766531815',
  'https://www.bhatti-catering.de/s/cc_images/teaserbox_18681698.jpeg?t=1701009184',
  'https://www.bhatti-catering.de/s/cc_images/teaserbox_7621434.jpg?t=1489521811',
  'https://www.bhatti-catering.de/s/cc_images/teaserbox_17062488.jpg?t=1617470173',
]);

try {
  // Check if already exists
  const exists = db.prepare("SELECT id FROM vendors WHERE slug='bhatti-catering-hamburg'").get();
  if (exists) {
    // Update with full info
    db.prepare(`
      UPDATE vendors SET
        business_name='Bhatti Catering — Asia Street Food Kitchen',
        category='Food & Drinks',
        city='Hamburg',
        country='DE',
        description='Bhatti Catering ist Ihr Spezialist für Asia Street Food, indische Spezialitäten, Churros, Glühwein und Fingerfood auf Festivals und Events in ganz Europa. Mit über 20 Jahren Erfahrung bieten wir frische, hochwertige Gerichte aus tagesfrischen Zutaten — 70–100% biologisch. Kein Glutamat, kein Convenience-Food.',
        website='https://www.bhatti-catering.de',
        phone='+49 40 644 26 980',
        email='J.Bhatti@t-online.de',
        founded_year=2004,
        status='active',
        payment_status='paid',
        verified=1,
        premium=1,
        events_attended=200,
        rating=4.9,
        tags=?,
        photos=?,
        image_url='https://www.bhatti-catering.de/s/cc_images/teaserbox_18623066.jpg?t=1696433312'
      WHERE slug='bhatti-catering-hamburg'
    `).run(extra, photos);
    console.log('✅ Updated Bhatti Catering');
  } else {
    // Insert new
    db.prepare(`
      INSERT INTO vendors (
        business_name, slug, category, city, country,
        description, website, phone, email, founded_year,
        status, payment_status, verified, premium,
        events_attended, rating, tags, photos, image_url
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `).run(
      'Bhatti Catering — Asia Street Food Kitchen',
      'bhatti-catering-hamburg',
      'Food & Drinks',
      'Hamburg',
      'DE',
      'Bhatti Catering ist Ihr Spezialist für Asia Street Food, indische Spezialitäten, Churros, Glühwein und Fingerfood auf Festivals und Events in ganz Europa. Mit über 20 Jahren Erfahrung bieten wir frische, hochwertige Gerichte aus tagesfrischen Zutaten — 70–100% biologisch. Kein Glutamat, kein Convenience-Food.',
      'https://www.bhatti-catering.de',
      '+49 40 644 26 980',
      'J.Bhatti@t-online.de',
      2004,
      'active',
      'paid',
      1,  // verified
      1,  // premium
      200, // events attended
      4.9, // rating
      extra,
      photos,
      'https://www.bhatti-catering.de/s/cc_images/teaserbox_18623066.jpg?t=1696433312'
    );
    console.log('✅ Added Bhatti Catering successfully!');
  }

  const v = db.prepare("SELECT id, business_name, city, verified FROM vendors WHERE slug='bhatti-catering-hamburg'").get();
  console.log('Profile live at: https://festmore.com/vendors/profile/' + v.id);

} catch(err) {
  console.error('❌ Error:', err.message);
}

db.close();
