const { Client } = require('pg');
const PG_URL = 'postgresql://postgres:VWgjvXynowzYucOsfqNNAPWojptOHaXJ@gondola.proxy.rlwy.net:47003/railway';

const POOLS = {
  festival: [
    'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200&q=80',
    'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=1200&q=80',
    'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&q=80',
    'https://images.unsplash.com/photo-1496337589254-7e19d01cec44?w=1200&q=80',
    'https://images.unsplash.com/photo-1540039155733-5bb30b99b603?w=1200&q=80',
    'https://images.unsplash.com/photo-1563841930606-67e2bce48b78?w=1200&q=80',
    'https://images.unsplash.com/photo-1504680177321-2e6a879aac86?w=1200&q=80',
    'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1200&q=80',
    'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1200&q=80',
    'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=1200&q=80',
    'https://images.unsplash.com/photo-1520483601560-389dff434fdf?w=1200&q=80',
    'https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?w=1200&q=80',
    'https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?w=1200&q=80',
    'https://images.unsplash.com/photo-1464375117522-1311d6a5b81f?w=1200&q=80',
    'https://images.unsplash.com/photo-1555116505-38ab61800975?w=1200&q=80',
  ],
  concert: [
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&q=80',
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&q=80',
    'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200&q=80',
    'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=1200&q=80',
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&q=80',
    'https://images.unsplash.com/photo-1468359601543-843bfaef291a?w=1200&q=80',
    'https://images.unsplash.com/photo-1571737648832-f5dbef21a7e8?w=1200&q=80',
    'https://images.unsplash.com/photo-1537299801658-c8ce6cb2a57f?w=1200&q=80',
    'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=1200&q=80',
    'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1200&q=80',
    'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=1200&q=80',
    'https://images.unsplash.com/photo-1547469797-1f2ff4e2d1c7?w=1200&q=80',
  ],
  market: [
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&q=80',
    'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1200&q=80',
    'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=1200&q=80',
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&q=80',
    'https://images.unsplash.com/photo-1519996529931-28324d5a630e?w=1200&q=80',
    'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&q=80',
    'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=1200&q=80',
    'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1200&q=80',
    'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=1200&q=80',
    'https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=1200&q=80',
    'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=1200&q=80',
    'https://images.unsplash.com/photo-1579113800032-c38bd7635818?w=1200&q=80',
    'https://images.unsplash.com/photo-1601599963565-b7f49ede47b0?w=1200&q=80',
    'https://images.unsplash.com/photo-1559181567-c3190ca9be46?w=1200&q=80',
    'https://images.unsplash.com/photo-1488900128323-21503983a07e?w=1200&q=80',
  ],
  flea: [
    'https://images.unsplash.com/photo-1558402847-7f9d6d65b41c?w=1200&q=80',
    'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=1200&q=80',
    'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=1200&q=80',
    'https://images.unsplash.com/photo-1519923834699-ef0b7cde4712?w=1200&q=80',
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&q=80',
    'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=1200&q=80',
    'https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?w=1200&q=80',
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80',
    'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1200&q=80',
    'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=1200&q=80',
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80',
    'https://images.unsplash.com/photo-1567538096621-38d2284b23ff?w=1200&q=80',
  ],
  christmas: [
    'https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=1200&q=80',
    'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=1200&q=80',
    'https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=1200&q=80',
    'https://images.unsplash.com/photo-1545048702-79362596cdc9?w=1200&q=80',
    'https://images.unsplash.com/photo-1513297887119-d46091b24bcd?w=1200&q=80',
    'https://images.unsplash.com/photo-1576919228236-a097c32a5cd4?w=1200&q=80',
    'https://images.unsplash.com/photo-1510552776732-8b34e99dd4f8?w=1200&q=80',
    'https://images.unsplash.com/photo-1608236415053-8702bb6ac542?w=1200&q=80',
    'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=1200&q=80',
    'https://images.unsplash.com/photo-1575456917131-80e0a4e5c5db?w=1200&q=80',
    'https://images.unsplash.com/photo-1543499759-3b250d87cf2e?w=1200&q=80',
    'https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=1200&q=80',
  ],
  exhibition: [
    'https://images.unsplash.com/photo-1580136579312-94651dfd596d?w=1200&q=80',
    'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&q=80',
    'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=1200&q=80',
    'https://images.unsplash.com/photo-1501446529957-6226b52bac4b?w=1200&q=80',
    'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1200&q=80',
    'https://images.unsplash.com/photo-1531058020387-3be344556be6?w=1200&q=80',
    'https://images.unsplash.com/photo-1547826039-bdbdb3e2d0ac?w=1200&q=80',
    'https://images.unsplash.com/photo-1574182245530-967d9b3831af?w=1200&q=80',
    'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=1200&q=80',
  ],
  business: [
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80',
    'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&q=80',
    'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=1200&q=80',
    'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200&q=80',
    'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1200&q=80',
    'https://images.unsplash.com/photo-1562774053-701939374585?w=1200&q=80',
    'https://images.unsplash.com/photo-1560439514-4e9645039924?w=1200&q=80',
  ],
  kids: [
    'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200&q=80',
    'https://images.unsplash.com/photo-1484544808355-8ec84e534d75?w=1200&q=80',
    'https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=1200&q=80',
    'https://images.unsplash.com/photo-1533228100845-08145b01de14?w=1200&q=80',
    'https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?w=1200&q=80',
    'https://images.unsplash.com/photo-1543342384-1f1350e27861?w=1200&q=80',
  ],
  comics: [
    'https://images.unsplash.com/photo-1608889825205-eebdb9fc5806?w=1200&q=80',
    'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=1200&q=80',
    'https://images.unsplash.com/photo-1560942485-b2a438dd4079?w=1200&q=80',
    'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=1200&q=80',
  ],
  city: [
    'https://images.unsplash.com/photo-1467803738586-46b7eb7b16a1?w=1200&q=80',
    'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&q=80',
    'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=1200&q=80',
    'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200&q=80',
    'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1200&q=80',
    'https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=1200&q=80',
    'https://images.unsplash.com/photo-1506377872008-6645d9d29ef7?w=1200&q=80',
    'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1200&q=80',
    'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1200&q=80',
    'https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2?w=1200&q=80',
  ],
  messe: [
    'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&q=80',
    'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1200&q=80',
    'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=1200&q=80',
    'https://images.unsplash.com/photo-1485217988980-11786ced9454?w=1200&q=80',
  ],
  online: [
    'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=1200&q=80',
    'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=1200&q=80',
    'https://images.unsplash.com/photo-1591453089816-0fbb971b454c?w=1200&q=80',
  ],
};

async function updatePhotos() {
  const client = new Client({ connectionString: PG_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log('✅ Connected\n');

  const events = await client.query(
    `SELECT id, title, category, country FROM events WHERE status='active' ORDER BY id ASC`
  );

  console.log(`📸 Updating photos for ${events.rows.length} events...\n`);

  // Track usage count per photo URL
  const usage = {};
  let updated = 0;

  for (const e of events.rows) {
    const cat = e.category || 'festival';
    const pool = POOLS[cat] || POOLS.festival;

    // Find least used photo in pool
    let best = pool[0];
    let min = Infinity;
    for (const p of pool) {
      const u = usage[p] || 0;
      if (u < min) { min = u; best = p; }
    }

    usage[best] = (usage[best] || 0) + 1;

    await client.query('UPDATE events SET image_url=$1 WHERE id=$2', [best, e.id]);
    updated++;

    if (updated % 100 === 0) console.log(`  ✅ ${updated} / ${events.rows.length} updated...`);
  }

  console.log(`\n✅ Done! Updated ${updated} event photos`);

  // Show new distribution
  const check = await client.query(
    `SELECT image_url, COUNT(*) as n FROM events GROUP BY image_url ORDER BY n DESC LIMIT 5`
  );
  console.log('\n📊 Max repeats after update:');
  check.rows.forEach(r => console.log(`  ${r.n} events share one photo`));
  console.log('\n🎉 Festmore events page now looks varied and professional!');

  await client.end();
}

updatePhotos().catch(console.error);
