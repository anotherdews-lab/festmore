const { Client } = require('pg');
const PG_URL = 'postgresql://postgres:VWgjvXynowzYucOsfqNNAPWojptOHaXJ@gondola.proxy.rlwy.net:47003/railway';

async function run() {
  const client = new Client({ connectionString: PG_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();

  const description = `The Polish Jazz Festival returns to London for its second edition following a sold-out and critically acclaimed debut in 2025 — the UK's only festival dedicated exclusively to Polish jazz, presenting 17 days of extraordinary music across Cadogan Hall, Union Chapel and Kings Place.

"The aim of the festival is not simply to present Polish artists in London, but to place Polish jazz within a wider international conversation. It is a tradition with a rich history and a distinctive voice, yet one that remains less familiar to UK audiences than many other European jazz traditions."
— Łukasz Droździel, Festival Director

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FULL PROGRAMME
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Friday 11 September · Cadogan Hall
EABS & Wojtek Mazolewski Quintet — Opening Gala

The festival opens with two of the most influential forces in contemporary Polish jazz. Acclaimed collective EABS present the first-ever live performance of Wstęp Wzbroniony — the landmark collaboration between Tomasz Stańko and Andrzej Trzaskowski — in a world premiere of profound musical and historical significance. Bassist and composer Wojtek Mazolewski and his quintet then premiere new material alongside special guests in an opening night of extraordinary ambition.

Saturday 12 September · Cadogan Hall
Kayah — Jazzayah

One of Poland's most celebrated artists reimagines her repertoire through the lens of jazz. Blending original material, reworked classics and jazz standards, Jazzayah presents a new chapter from a performer whose remarkable career has spanned pop, soul, world music and beyond — arriving now at jazz with the full weight of her artistry behind her.

Saturday 12 September · Cadogan Hall
Urszula Dudziak

A rare London appearance from one of the most influential vocalists in European jazz. Across a career spanning more than six decades, Dudziak has collaborated with Krzysztof Komeda, Herbie Hancock, Bobby McFerrin and Sting, establishing herself as a singular and irreplaceable voice in international jazz. The subject of the acclaimed 2023 documentary Ula, her London appearance is not to be missed.

Sunday 13 September · Union Chapel
Warsaw Jazz Takeover

A celebration of one of Europe's most dynamic music cities — Warsaw. Featuring the virtuosic Marcin Masecki Trio, rising jazz outfit HVMBLE and the internationally acclaimed Warsaw Village Band (BBC World Music Award winners for Best Newcomer), whose innovative approach to Polish folk music has earned worldwide recognition. An evening of performance and discussion reflecting Warsaw's long-standing role as a centre for musical innovation and cultural exchange.

Saturday 26 September · Cadogan Hall
Chopin Residue — UK Premiere

The UK premiere of an ambitious multidisciplinary project reimagining the music of Frédéric Chopin through experimental electronics, improvisation and contemporary composition. Created by producer and writer Mariusz Szypura, the project features an extraordinary international cast including Adrian Utley (Portishead), John Stanier (Battles) and Sean O'Hagan (The High Llamas) — a collision of Polish classical heritage and contemporary experimental music of remarkable creative ambition.

Saturday 26 September · Cadogan Hall
Leszek Możdżer: An Evening with Komeda

One of Europe's leading jazz pianists pays tribute to Krzysztof Komeda — the legendary composer whose work helped define a distinctly European jazz aesthetic and whose film scores for Roman Polański's Rosemary's Baby and Knife in the Water introduced his music to international audiences. A deeply personal evening from one of the finest pianists of his generation.

Sunday 27 September · Kings Place
Kosmonauci

One of the most exciting young groups to emerge from Poland's new jazz generation. Drawing on jazz, hip-hop, drum and bass and improvisation, the quartet has rapidly built a reputation across the European festival circuit for its adventurous, high-energy performances — representing the future of Polish jazz with extraordinary confidence.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
THE TRADITION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Since the 1950s, Polish jazz has been a recognised cultural movement in its own right — from the pioneering achievements of Krzysztof Komeda, Tomasz Stańko and Michał Urbaniak to contemporary masters including Leszek Możdżer, Wojtek Mazolewski and Marcin Masecki. For more than half a century, Polish jazz has maintained a distinctive and influential voice within international jazz while continually evolving through new generations of musicians.

The Polish Jazz Festival was established to bring this extraordinary tradition to UK audiences — creating a platform not only for leading Polish musicians but for a wider celebration of Polish culture and artistic exchange between Poland and the United Kingdom.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VENUES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏛️ Cadogan Hall, Chelsea — Opening Gala, Kayah, Urszula Dudziak, Chopin Residue, Możdżer
⛪ Union Chapel, Islington — Warsaw Jazz Takeover (13 September)
🎵 Kings Place, King's Cross — Kosmonauci (27 September)

Press enquiries: pauline@baxterpr.com · joe@baxterpr.com · alice@baxterpr.com · tom@baxterpr.com
Full programme and tickets: polishjazzfestival.co.uk`;

  const tags = '["Polish Jazz Festival","London","UK","2026","September","jazz","EABS","Urszula Dudziak","Leszek Mozdzyer","Wojtek Mazolewski Quintet","Kayah","Jazzayah","Warsaw Village Band","Marcin Masecki Trio","Kosmonauci","HVMBLE","Wstep Wzbroniony","Tomasz Stanko","Andrzej Trzaskowski","Krzysztof Komeda","Chopin Residue","Adrian Utley","Portishead","John Stanier","Battles","Sean OHagan","Warsaw Jazz Takeover","Cadogan Hall","Kings Place","Union Chapel","world premiere","UK premiere","BBC World Music Award","sold out 2025","Polish culture","European jazz"]';

  const exists = await client.query('SELECT id FROM events WHERE slug=$1', ['polish-jazz-festival-london-2026']);

  if (exists.rows.length > 0) {
    await client.query(`
      UPDATE events SET
        description=$1,
        date_display='11–27 September 2026 · Cadogan Hall · Union Chapel · Kings Place, London',
        tags=$2,
        attendees=9000,
        verified=1
      WHERE slug='polish-jazz-festival-london-2026'`, [description, tags]);
    console.log('✅ Updated with complete programme details');
  } else {
    await client.query(`
      INSERT INTO events (title,slug,category,city,country,start_date,end_date,date_display,
        description,price_display,website,ticket_url,attendees,vendor_spots,address,image_url,
        tags,status,payment_status,featured,verified,source,views,organiser_email,created_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,'active','free',0,1,'manual',0,$18,NOW())`,
      ['Polish Jazz Festival London 2026','polish-jazz-festival-london-2026','festival','London','GB',
       '2026-09-11','2026-09-27',
       '11–27 September 2026 · Cadogan Hall · Union Chapel · Kings Place, London',
       description,'From £15 · Various venues','https://www.polishjazzfestival.co.uk',
       'https://www.polishjazzfestival.co.uk/tickets',9000,0,
       'Cadogan Hall, Union Chapel & Kings Place, London, United Kingdom',
       'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=1200&q=80',
       tags,'pauline@baxterpr.com']);
    console.log('✅ Added Polish Jazz Festival London 2026');
  }

  await client.end();
  console.log('\nView at: https://festmore.com/events/polish-jazz-festival-london-2026');
}

run().catch(console.error);
