const { Client } = require('pg');
const PG_URL = 'postgresql://postgres:VWgjvXynowzYucOsfqNNAPWojptOHaXJ@gondola.proxy.rlwy.net:47003/railway';

async function findAndUpdate() {
  const client = new Client({ connectionString: PG_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();

  // Find the event
  const find = await client.query(`
    SELECT id, title, slug, city, country, start_date 
    FROM events 
    WHERE title ILIKE '%nowhere%' OR title ILIKE '%elsewhere%' 
       OR title ILIKE '%nobod%' OR title ILIKE '%monegros%'
       OR (country='ES' AND category='festival')
    ORDER BY id DESC LIMIT 20
  `);
  
  console.log('Found events:');
  find.rows.forEach(r => console.log(r.id, '|', r.title, '|', r.city, '|', r.start_date));

  // The new Elsewhere data from nobodies.team
  const newData = {
    title: 'Elsewhere 2026 — Monegros Desert, Spain',
    slug: 'elsewhere-2026-monegros-desert-spain',
    city: 'Sariñena',
    country: 'ES',
    start_date: '2026-07-07',
    end_date: '2026-07-12',
    date_display: '7–12 July 2026',
    price_display: 'From €275 (Wave 1) · €295 (Wave 2) · €315 (Wave 3)',
    website: 'https://nobodies.team',
    ticket_url: 'https://tickets.nobodies.team/events/nobodiescollective/2089167',
    attendees: 4000,
    vendor_spots: 0,
    address: 'Monegros Desert, Sariñena, Huesca, Aragon, Spain',
    image_url: 'https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=1200&q=80',
    tags: JSON.stringify(['Elsewhere','Nobodies Collective','Monegros Desert','Spain','Huesca','Aragon','participatory','Burning Man regional','desert festival','community','2026','July','art installations','gifting economy','radical inclusion']),
    description: `Elsewhere is a participatory arts gathering in the Monegros Desert — a six-day July event in the high desert plain of Aragon, Spain, where the Nobodies Collective builds a temporary city from scratch, populates it with art installations, music, workshops and gifting culture, then dismantles it completely, leaving zero trace behind.\n\nElsewhere is not a festival in any conventional sense. There are no stages managed by corporations, no VIP areas, no bottle service and no passive audiences. Every single ticket holder is expected to volunteer. Nobody gets paid. Nobody gets in free. The cash from tickets covers the practical infrastructure — toilets, safety, site logistics and art grants — while everything else is created by the participants themselves. If you see a dance floor, a meal or a structure, it exists because one of the Nobodies decided to build it.\n\nThe Monegros Desert setting is genuinely extraordinary — the high arid plateau of Aragon, one of Spain's most dramatically austere landscapes, creates the blank canvas on which the temporary city rises each July. The desert sun, the vast flat horizon and the particular quality of Aragonese summer light create conditions for art and community that no managed venue could replicate. Bring water. Bring sunblock. Bring everything you need to survive a week in the desert.\n\nElsewhere runs on the gifting economy — there is no cash on site. The community runs on mutual support, shared effort and the principle that everyone contributes what they can and takes what they need. Theme camps (barrios) create community spaces for music, workshops, meals and conversation. Art installations transform the flat desert into a gallery of extraordinary creative ambition. Fire performances light the desert nights. And at the end, everything disappears.\n\nElsewhere evolved directly from the Nowhere festival community — the European Burning Man regional event that ran from 2004 in the same Monegros landscape before the Nobodies Collective took the tradition forward under the new name. The community that built Nowhere brought its decade of desert city experience to Elsewhere, creating an event that combines the radical participation principles of Burning Man with the particular warmth and creative energy of the European festival community.\n\nTickets are tiered by purchase timing: Wave 1 (€275) rewards early commitment, Wave 2 (€295) is the standard price, and Wave 3 (€315) is the final tier. Low-income tickets and youth rates are available. Maximum two tickets per person. The name on your ticket must match your government-issued photo ID — no exceptions at the gate.\n\nGetting there: Sariñena (Huesca) is the nearest town. Fly into Barcelona or Zaragoza, take the regional train to Sariñena, or join a rideshare with fellow Nobodies. Official coaches run from Barcelona. The exact site location is shared in the Survival Guide sent to all ticket holders before the event.`,
    category: 'festival',
    status: 'active'
  };

  // Update if found, insert if not
  if (find.rows.length > 0) {
    // Try to find one that matches Spain/Nowhere context
    const target = find.rows[0];
    console.log('\nUpdating event ID:', target.id, '→', target.title);
    
    await client.query(`
      UPDATE events SET
        title=$1, slug=$2, city=$3, country=$4,
        start_date=$5, end_date=$6, date_display=$7,
        price_display=$8, website=$9, ticket_url=$10,
        attendees=$11, vendor_spots=$12, address=$13,
        image_url=$14, tags=$15, description=$16
      WHERE id=$17
    `, [
      newData.title, newData.slug, newData.city, newData.country,
      newData.start_date, newData.end_date, newData.date_display,
      newData.price_display, newData.website, newData.ticket_url,
      newData.attendees, newData.vendor_spots, newData.address,
      newData.image_url, newData.tags, newData.description,
      target.id
    ]);
    console.log('✅ Updated! New slug: elsewhere-2026-monegros-desert-spain');
  } else {
    console.log('\nNot found in DB — inserting as new event...');
    await client.query(`
      INSERT INTO events (title,slug,category,city,country,start_date,end_date,date_display,
        description,price_display,website,ticket_url,attendees,vendor_spots,address,
        image_url,tags,status,payment_status,featured,verified,source,views,organiser_email,created_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,'active','free',0,1,'manual',0,'info@nobodies.team',NOW())
    `, [
      newData.title, newData.slug, newData.category, newData.city, newData.country,
      newData.start_date, newData.end_date, newData.date_display,
      newData.description, newData.price_display, newData.website, newData.ticket_url,
      newData.attendees, newData.vendor_spots, newData.address,
      newData.image_url, newData.tags
    ]);
    console.log('✅ Inserted as new event!');
  }

  console.log('\n🔗 View at: https://festmore.com/events/elsewhere-2026-monegros-desert-spain');
  await client.end();
}

findAndUpdate().catch(console.error);
