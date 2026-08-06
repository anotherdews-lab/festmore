const { Client } = require('pg');
const PG_URL = process.env.DATABASE_URL || 'postgresql://postgres:VWgjvXynowzYucOsfqNNAPWojptOHaXJ@gondola.proxy.rlwy.net:47003/railway';

async function run() {
  const client = new Client({ connectionString: PG_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();

  const event = {
    title: 'Julemarked på Koldinghus 2026',
    slug: 'julemarked-paa-koldinghus-2026',
    category: 'christmas',
    city: 'Kolding',
    country: 'DK',
    start_date: '2026-12-04',
    end_date: '2026-12-06',
    date_display: 'Fredag 4. december & lørdag 5. december kl. 10.00-16.30, søndag 6. december kl. 10.00-16.00',
    price_display: '80 kr. | Gratis for under 18 år og KLUB-medlemmer',
    website: 'https://denkongeligesamling.dk/koldinghus/kalender/julemarked-paa-koldinghus/',
    ticket_url: 'https://denkongeligesamling.dk/koldinghus/billetter/',
    attendees: 5000,
    vendor_spots: 0,
    address: 'Koldinghus 1, 6000 Kolding, Denmark',
    image_url: 'https://denkongeligesamling.dk/media/00zhhx2z/julemarked_2023_jens_ole_jacobsen_030_50.jpg',
    organiser_email: 'nss@kosa.dk',
    tags: '["Julemarked Koldinghus","Kolding","Danmark","julemarket","2026","december","Den Kongelige Samling","Royal Danish Collection","håndlavede gaver","kunsthåndværk","gløgg","æbleskiver","familievenligt","historiske rammer","slot"]',
    description: `Når Koldinghus slår portene op til julemarkedet, mødes gæsterne af et overflødighedshorn af julehyggerier — fra boderne foran slottet og i teltet i Slotsgården til de mange sale inde på det historiske slot.

Julemarkedet på Koldinghus er et af Danmarks smukkeste og mest stemningsfulde julemarkeder, afholdt i de historiske rammer af et af landets best bevarede middelalderslotte. Markedet samler håndplukkede udstillere med fokus på bæredygtighed, lokal tilknytning og unikke produkter med kant.

🎄 HÅNDLAVEDE GAVER OG KUNSTHÅNDVÆRK
Gå på opdagelse blandt et væld af unikke produkter — fra finurlig julepynt og kunsthåndværk til smukke smykker, varm beklædning og naturlig hudpleje. Hver bod er fyldt med passion og kreativitet, og du finder gaver der ikke bare glæder, men også fortæller en historie.

🍎 MAD OG DRIKKE
Forkæl dig selv med varm gløgg og æbleskiver, hjemmelavede delikatesser, søde sager og varme drikke der luner både hænder og hjerte.

🎵 UNDERHOLDNING FOR HELE FAMILIEN
Nyd stemningsfuld julemusik og deltag i hyggelige workshops, hvor både børn og voksne kan lave deres egne julekreationer. Og som traditionen byder, vrimler slottet med nisser der spreder juleglæde.

PRAKTISK INFO
📍 Koldinghus 1, 6000 Kolding
🎟️ 80 kr. | Gratis for KLUB-medlemmer og alle under 18 år
🅿️ Begrænset parkering — se alternativ parkering på parkering.kolding.dk
♿ Tilgængeligt med kørestol og rollator — elevator til rådighed
👶 Barnevogne ikke tilladt indendørs — kan stilles i Slotsgården

Billetter skal købes på forhånd på hjemmesiden. Årskortsindehavere og erhvervsklubmedlemmer får automatisk rabat ved billetkøbet.

Arrangeret af Den Kongelige Samling / The Royal Danish Collection.`
  };

  const exists = await client.query('SELECT id FROM events WHERE slug=$1', [event.slug]);

  if (exists.rows.length > 0) {
    await client.query(`UPDATE events SET title=$1, description=$2, date_display=$3, image_url=$4, tags=$5, updated_at=NOW() WHERE slug=$6`,
      [event.title, event.description, event.date_display, event.image_url, event.tags, event.slug]);
    console.log('✅ Updated:', event.title);
  } else {
    await client.query(`
      INSERT INTO events (title,slug,category,city,country,start_date,end_date,date_display,
        description,price_display,website,ticket_url,attendees,vendor_spots,address,image_url,
        tags,status,payment_status,featured,verified,source,views,organiser_email,created_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,'active','free',0,1,'manual',0,$18,NOW())`,
      [event.title,event.slug,event.category,event.city,event.country,
       event.start_date,event.end_date,event.date_display,event.description,
       event.price_display,event.website,event.ticket_url,event.attendees,
       event.vendor_spots,event.address,event.image_url,event.tags,event.organiser_email]);
    console.log('✅ Added:', event.title);
  }

  await client.end();
  console.log('\nView at: https://festmore.com/events/julemarked-paa-koldinghus-2026');
}

run().catch(console.error);
