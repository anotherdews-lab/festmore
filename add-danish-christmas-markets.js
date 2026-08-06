const { Client } = require('pg');
const PG_URL = process.env.DATABASE_URL || 'postgresql://postgres:VWgjvXynowzYucOsfqNNAPWojptOHaXJ@gondola.proxy.rlwy.net:47003/railway';

const markets = [
  {
    title: 'Jul på FÆNGSLET 2026',
    slug: 'jul-paa-faengslet-horsens-2026',
    city: 'Horsens',
    country: 'DK',
    start_date: '2026-11-13',
    end_date: '2026-11-22',
    date_display: '13-15. og 20-22. november 2026 · FÆNGSLET, Horsens',
    price_display: 'Billetter i døren',
    website: 'https://www.faengslet.dk/det-sker/jul-paa-faengslet/',
    ticket_url: 'https://www.faengslet.dk/det-sker/jul-paa-faengslet/',
    attendees: 40000,
    vendor_spots: 200,
    address: 'FÆNGSLET, Horsens, Denmark',
    image_url: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=800&q=75',
    tags: JSON.stringify(['Jul på FÆNGSLET','Horsens','julemarked','christmas market','Denmark','2026','november','200 boder','æbleskiver','julemanden','fakkeloptog','40000 besøgende']),
    description: `Jul på FÆNGSLET er et af Danmarks første og største julemarkeder, afholdt hvert år i november i de unikke historiske rammer på FÆNGSLET i Horsens. I 2026 afholdes julemarkedet den 13.-15. og 20.-22. november.

Med 40.000 besøgende i 2025 er Jul på FÆNGSLET blevet en stærk familietradition og et af Østjyllands mest populære julemarkeder. Kom og mærk den særlige atmosfære, når de rå fængselsrammer og ægte julehygge fusionerer til noget helt unikt.

🎄 OPLEV JULEMARKEDET
Gå på opdagelse i mere end 200 boder med julepynt, kunsthåndværk og de bedste gaveideer inden for design, vintage og brugskunst. Julemarkedet åbner med et stemningsfuldt fakkeloptog, møde med Julemanden og Julepatruljen, og den store lysfacade tændes med mere end 20.000 dioder.

🍎 MAD OG JULEHYGGE
Nyd æbleskiver, risengrød, brændte mandler og meget mere i det hyggelige spiseområde i Fængselsgården, eller indendørs i Spisesalen med skøn julemusik.

🎡 AKTIVITETER FOR HELE FAMILIEN
Tag en tur med Polarekspressen, kør hestevogn, besøg nissebyen Snekøbing, prøv kælkebakken, og tag årets julefoto foran den 5x5 meter store julelyskugle.

Jul på FÆNGSLET er arrangeret i samarbejde med Habengut Marked. Billetter kan købes i døren ved porten til fængslets indergård.`
  },
  {
    title: 'Julen i Aarhus 2026',
    slug: 'julen-i-aarhus-2026',
    city: 'Aarhus',
    country: 'DK',
    start_date: '2026-11-13',
    end_date: '2026-12-22',
    date_display: '13. november – 22. december 2026 · Aarhus centrum',
    price_display: 'Gratis adgang',
    website: 'https://www.visitaarhus.com/aarhus/christmas-in-aarhus',
    ticket_url: 'https://www.visitaarhus.com/aarhus/christmas-in-aarhus',
    attendees: 100000,
    vendor_spots: 50,
    address: 'Aarhus centrum, Denmark',
    image_url: 'https://images.unsplash.com/photo-1576919228236-a097c32a5cd4?w=800&q=75',
    tags: JSON.stringify(['Julen i Aarhus','Aarhus','julemarked','christmas','Denmark','2026','november','december','gratis','familievenligt']),
    description: `Julen i Aarhus er Danmarks næststørste bys store julefejring — fra midt i november til få dage før jul fylder julemarkeder, lys og aktiviteter gaderne i Aarhus centrum.

🎄 JULEMARKED OG JULEBELYSNING
Oplev stemningsfulde julemarkeder med håndlavede produkter, lokale producenter og julestemning midt i byens hjerte. Aarhus tænder for den smukke julebelysning og skaber en magisk ramme om shopping, hygge og juleoplevelser.

🎡 FOR HELE FAMILIEN
Julen i Aarhus byder på aktiviteter for hele familien — fra julemanden til caféer med varmt gløgg og æbleskiver, koncerter og judeevents i hele adventstiden.

📍 Find julemarkederne i Aarhus centrum fra midt november til den 22. december 2026.`
  },
  {
    title: 'Julemarked på Kragerup Gods 2026',
    slug: 'julemarked-kragerup-gods-2026',
    city: 'Kalundborg',
    country: 'DK',
    start_date: '2026-11-14',
    end_date: '2026-11-15',
    date_display: '14-15. november 2026 · Kragerup Gods, Kalundborg',
    price_display: 'Se hjemmeside',
    website: 'https://www.kragerup.dk',
    ticket_url: 'https://www.kragerup.dk',
    attendees: 3000,
    vendor_spots: 30,
    address: 'Kragerup Gods, Kalundborg, Denmark',
    image_url: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=800&q=75',
    tags: JSON.stringify(['Kragerup Gods','Kalundborg','julemarked','gods','christmas market','Denmark','2026','november','håndlavede produkter','historiske rammer']),
    description: `Julemarked på Kragerup Gods er en eksklusiv juleoplevelse på et af Sjællands smukkeste godser i Kalundborg kommune. De historiske rammer danner den perfekte baggrund for en unik og autentisk julemarkedsoplevelse.

🏰 HISTORISKE RAMMER
Kragerup Gods er et af de bedst bevarede herregårde på Sjælland, og julemarkedet udnytter de smukke bygninger og den idylliske natur til fulde. Det giver en stemning og en autenticitet, som man sjældent oplever på moderne julemarkedet.

🎄 HÅNDLAVEDE PRODUKTER OG LOKALE PRODUCENTER
Markedet samler udvalgte udstillere med fokus på håndværk, lokale specialiteter og unikke produkter — perfekte til årets julegaver. Her finder du noget, du ikke finder i de store butikker.

Julemarked på Kragerup Gods afholdes den 14-15. november 2026. Se mere på godsens hjemmeside.`
  },
  {
    title: 'Jul på Haughus Gods 2026',
    slug: 'jul-paa-haughus-gods-2026',
    city: 'Vejle',
    country: 'DK',
    start_date: '2026-11-14',
    end_date: '2026-11-29',
    date_display: 'November 2026 — tre weekender · Haughus Gods, Vejle',
    price_display: 'Se hjemmeside',
    website: 'https://www.haughus.dk',
    ticket_url: 'https://www.haughus.dk',
    attendees: 5000,
    vendor_spots: 40,
    address: 'Haughus Gods, Vejle, Denmark',
    image_url: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=800&q=75',
    tags: JSON.stringify(['Haughus Gods','Vejle','julemarked','gods','christmas market','Denmark','2026','november','håndlavede produkter','naturskønt']),
    description: `Jul på Haughus Gods er et smukt og stemningsfuldt julemarked afholdt på Haughus Gods — en af Vejle-egnens mest naturskønne herregårde. I 2026 afholdes julemarkedet over tre weekender i november.

🏡 UNIK GODSSTEMNING
Haughus Gods' pittoreske bygninger og den omgivende natur skaber en julestemning, der er svær at finde andre steder. Her kan du gå i ro og fred og nyde julens stemning i autentiske historiske rammer.

🎄 UDSTILLERE OG AKTIVITETER  
Markedet samler håndplukkede udstillere med fokus på kvalitet, håndværk og lokale produkter. Der er mulighed for mad og varme drikke, og markedet er familievenligt med aktiviteter for børn.

Jul på Haughus Gods afholdes den 14-15., 21-22. og 28-29. november 2026.`
  },
  {
    title: 'Stort Julemarked på Godsbanen Aarhus 2026',
    slug: 'julemarked-godsbanen-aarhus-2026',
    city: 'Aarhus',
    country: 'DK',
    start_date: '2026-12-12',
    end_date: '2026-12-12',
    date_display: '12. december 2026 · Godsbanen, Aarhus',
    price_display: 'Gratis adgang',
    website: 'https://godsbanen.dk',
    ticket_url: 'https://godsbanen.dk',
    attendees: 5000,
    vendor_spots: 60,
    address: 'Godsbanen, Skovgaardsgade 3, 8000 Aarhus C, Denmark',
    image_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=75',
    tags: JSON.stringify(['Godsbanen','Aarhus','julemarked','christmas market','Denmark','2026','december','kreativt','lokale producenter','street food']),
    description: `Stort julemarked på Godsbanen er et af Aarhus' mest populære julemarkedsarrangementer — afholdt i det kreative og pulserende kulturhus Godsbanen i hjertet af Aarhus.

🎨 KREATIVT JULEMARKED
Godsbanen er hjemsted for byens kreative miljø, og det afspejler sig i julemarkedet. Her finder du håndlavede produkter, unikke kunstgenstande og produkter fra lokale producenter og designere — perfekte som julegaver med en personlig touch.

🍕 MAD OG DRIKKE
Som altid på Godsbanen er der fokus på god mad — fra lokale street food-producenter til varmt gløgg og æbleskiver. Et besøg på julemarkedet byder på en kulinarisk oplevelse af høj kvalitet.

📍 Godsbanen ligger centralt i Aarhus ved Banegårdspladsen. Julemarkedet afholdes lørdag den 12. december 2026.`
  },
  {
    title: 'Musicon Julemarked Roskilde 2026',
    slug: 'musicon-julemarked-roskilde-2026',
    city: 'Roskilde',
    country: 'DK',
    start_date: '2026-12-12',
    end_date: '2026-12-13',
    date_display: '12-13. december 2026 · Musicon, Roskilde',
    price_display: 'Gratis adgang',
    website: 'https://www.musicon.dk',
    ticket_url: 'https://www.musicon.dk',
    attendees: 4000,
    vendor_spots: 50,
    address: 'Musicon, Roskilde, Denmark',
    image_url: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=800&q=75',
    tags: JSON.stringify(['Musicon','Roskilde','julemarked','christmas market','Denmark','2026','december','kreativt','lokale','håndlavede produkter']),
    description: `Musicon Julemarked er et af Roskildes mest elskede julemarkedsarrangementer, afholdt i det kreative og sprudlende Musicon-kvarter — Roskildes svar på et kreativt kulturmiljø.

🎭 KREATIVT KVARTER MED JULESTEMNING
Musicon er Roskildes kreative hjerte, og julemarkedet afspejler dette med et stærkt fokus på lokale kunstnere, designere og håndværkere. Her finder du produkter, du ikke finder i de almindelige butikker.

🎄 MARKED OG ATMOSFÆRE
Julemarkedet samler lokale og regionale udstillere med julepynt, gaver, mad og drikke. Den hyggelige og uformelle atmosfære i Musicon-kvarteret giver en alternativ og personlig julemarkedsoplevelse.

Musicon Julemarked afholdes den 12-13. december 2026 i Roskilde.`
  },
  {
    title: 'Julekræmmermarked i Hårlev Hallen 2026',
    slug: 'julekraemmermarked-harlev-hallen-2026',
    city: 'Hårlev',
    country: 'DK',
    start_date: '2026-11-07',
    end_date: '2026-11-08',
    date_display: '7-8. november 2026 · Hårlev Hallen, Stevns',
    price_display: 'Se hjemmeside',
    website: 'https://www.stevns.dk',
    ticket_url: 'https://www.stevns.dk',
    attendees: 1500,
    vendor_spots: 30,
    address: 'Hårlev Hallen, Stevns, Denmark',
    image_url: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=800&q=75',
    tags: JSON.stringify(['Hårlev','Stevns','julemarked','christmas market','Denmark','2026','november','kræmmermarked','lokalt']),
    description: `Julekræmmermarked i Hårlev Hallen er et hyggeligt og lokalt julemarked i Stevns kommune på sydsjælland. Et autentisk dansk julemarked med god stemning og mange boder.

Et populært lokalt arrangement der hvert år samler lokalsamfundet og julemarkedsentusiaster fra hele Stevns-egnen. Her finder du lokale udstillere med håndlavede produkter, julepynt og sæsonvarer.

Julekræmmermarkedet afholdes den 7-8. november 2026 i Hårlev Hallen.`
  },
  {
    title: 'Julemarked i Viby Sjælland 2026',
    slug: 'julemarked-viby-sjaelland-2026',
    city: 'Viby Sjælland',
    country: 'DK',
    start_date: '2026-11-29',
    end_date: '2026-11-29',
    date_display: '29. november 2026 · Viby Sjælland, Roskilde',
    price_display: 'Gratis adgang',
    website: 'https://www.roskilde.dk',
    ticket_url: 'https://www.roskilde.dk',
    attendees: 1000,
    vendor_spots: 20,
    address: 'Viby Sjælland, Roskilde kommune, Denmark',
    image_url: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=800&q=75',
    tags: JSON.stringify(['Viby Sjælland','Roskilde','julemarked','christmas market','Denmark','2026','november','lokalt']),
    description: `Julemarked i Viby Sjælland er et hyggeligt lokalt julemarked i Roskilde kommune. Et godt alternativ til de store byjulemarkeder med en nærværende og lokal stemning.

Markedet samler lokale udstillere og sælgere og er et perfekt sted at finde unikke julegaver og nyde julestemningen uden de store folkemasser. Afholdes søndag den 29. november 2026.`
  },
  {
    title: 'Hvalpsund Julemarked 2026',
    slug: 'hvalpsund-julemarked-2026',
    city: 'Hvalpsund',
    country: 'DK',
    start_date: '2026-11-22',
    end_date: '2026-11-22',
    date_display: '22. november 2026 · Hvalpsund, Vesthimmerland',
    price_display: 'Gratis adgang',
    website: 'https://www.vesthimmerland.dk',
    ticket_url: 'https://www.vesthimmerland.dk',
    attendees: 800,
    vendor_spots: 20,
    address: 'Hvalpsund, Vesthimmerland, Denmark',
    image_url: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=800&q=75',
    tags: JSON.stringify(['Hvalpsund','Vesthimmerland','julemarked','christmas market','Denmark','2026','november','fjord','lokalt']),
    description: `Hvalpsund Julemarked er et charmerende lokalt julemarked ved Limfjorden i Vesthimmerland. Den smukke beliggenhed ved fjorden og det lokale fællesskab giver en hyggelig og autentisk julemarkedsoplevelse.

Et populært arrangement for hele lokalsamfundet og for folk fra hele Vesthimmerlands-egnen. Afholdes søndag den 22. november 2026.`
  },
  {
    title: 'Brenderup Julemarked 2026',
    slug: 'brenderup-julemarked-2026',
    city: 'Brenderup',
    country: 'DK',
    start_date: '2026-11-22',
    end_date: '2026-11-22',
    date_display: '22. november 2026 · Brenderup, Middelfart',
    price_display: 'Gratis adgang',
    website: 'https://www.middelfart.dk',
    ticket_url: 'https://www.middelfart.dk',
    attendees: 800,
    vendor_spots: 20,
    address: 'Brenderup, Middelfart kommune, Denmark',
    image_url: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=800&q=75',
    tags: JSON.stringify(['Brenderup','Middelfart','julemarked','christmas market','Denmark','2026','november','lokalt','Fyn']),
    description: `Brenderup Julemarked er et hyggeligt og lokalt julemarked på Fyn i Middelfart kommune. En god mulighed for at opleve autentisk dansk julehygge uden de store masser.

Markedet samler lokale udstillere og tilbyder en nærværende juleoplevelse for hele familien. Afholdes søndag den 22. november 2026 i Brenderup.`
  }
];

async function run() {
  const client = new Client({ connectionString: PG_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log('Connected — adding Danish Christmas markets from original sources...\n');

  let added = 0, updated = 0;

  for (const m of markets) {
    const exists = await client.query('SELECT id FROM events WHERE slug=$1', [m.slug]);
    if (exists.rows.length > 0) {
      await client.query(
        'UPDATE events SET title=$1, description=$2, date_display=$3, website=$4, attendees=$5 WHERE slug=$6',
        [m.title, m.description, m.date_display, m.website, m.attendees, m.slug]
      );
      updated++;
      console.log('Updated:', m.title);
    } else {
      await client.query(`
        INSERT INTO events (title,slug,category,city,country,start_date,end_date,date_display,
          description,price_display,website,ticket_url,attendees,vendor_spots,address,image_url,
          tags,status,payment_status,featured,verified,source,views,organiser_email,created_at)
        VALUES ($1,$2,'christmas',$3,$4,$5,$6,$7,$8,$9,$10,$10,$11,$12,$13,$14,$15,
          'active','free',0,1,'manual',0,'hello@festmore.com',NOW())`,
        [m.title, m.slug, m.city, m.country, m.start_date, m.end_date,
         m.date_display, m.description, m.price_display, m.website,
         m.attendees, m.vendor_spots, m.address, m.image_url, m.tags]
      );
      added++;
      console.log('Added:', m.title);
    }
  }

  await client.end();
  console.log(`\n✅ Done — ${added} added, ${updated} updated`);
  console.log('View at: https://festmore.com/christmas');
}

run().catch(console.error);
