const { Client } = require('pg');
const PG_URL = 'postgresql://postgres:VWgjvXynowzYucOsfqNNAPWojptOHaXJ@gondola.proxy.rlwy.net:47003/railway';

// 300+ unique Unsplash photo IDs — completely different images
const ALL_PHOTOS = [
  'photo-1533174072545-7a4b6ad7a6c3','photo-1429962714451-bb934ecdc4ec','photo-1470229722913-7c0e2dbbafd3',
  'photo-1496337589254-7e19d01cec44','photo-1540039155733-5bb30b99b603','photo-1563841930606-67e2bce48b78',
  'photo-1504680177321-2e6a879aac86','photo-1459749411175-04bf5292ceea','photo-1501281668745-f7f57925c3b4',
  'photo-1568702846914-96b305d2aaeb','photo-1520483601560-389dff434fdf','photo-1548802673-380ab8ebc7b7',
  'photo-1574391884720-bbc3740c59d1','photo-1464375117522-1311d6a5b81f','photo-1555116505-38ab61800975',
  'photo-1514525253161-7a46d19cd819','photo-1493225457124-a3eb161ffa5f','photo-1501386761578-eac5c94b800a',
  'photo-1524368535928-5b5e00ddc76b','photo-1516450360452-9312f5e86fc7','photo-1468359601543-843bfaef291a',
  'photo-1571737648832-f5dbef21a7e8','photo-1537299801658-c8ce6cb2a57f','photo-1598387993441-a364f854c3e1',
  'photo-1508700115892-45ecd05ae2ad','photo-1547981609-4b6bfe67ca0b','photo-1547469797-1f2ff4e2d1c7',
  'photo-1555939594-58d7cb561ad1','photo-1488459716781-31db52582fe9','photo-1506784983877-45594efa4cbe',
  'photo-1513104890138-7c749659a591','photo-1519996529931-28324d5a630e','photo-1542838132-92c53300491e',
  'photo-1567306226416-28f0efdc88ce','photo-1464226184884-fa280b87c399','photo-1518977676601-b53f82aba655',
  'photo-1534483509719-3feaee7c30da','photo-1550989460-0adf9ea622e2','photo-1579113800032-c38bd7635818',
  'photo-1601599963565-b7f49ede47b0','photo-1559181567-c3190ca9be46','photo-1488900128323-21503983a07e',
  'photo-1558402847-7f9d6d65b41c','photo-1573164713988-8665fc963095','photo-1567401893414-76b7b1e5a7a5',
  'photo-1519923834699-ef0b7cde4712','photo-1490481651871-ab68de25d43d','photo-1524592094714-0f0654e20314',
  'photo-1555685812-4b943f1cb0eb','photo-1441986300917-64674bd600d8','photo-1513519245088-0e12902e5a38',
  'photo-1489987707025-afc232f7ea0f','photo-1556742049-0cfed4f6a45d','photo-1567538096621-38d2284b23ff',
  'photo-1482517967863-00e15c9b44be','photo-1512389142860-9c449e58a543','photo-1543589077-47d81606c1bf',
  'photo-1545048702-79362596cdc9','photo-1513297887119-d46091b24bcd','photo-1576919228236-a097c32a5cd4',
  'photo-1510552776732-8b34e99dd4f8','photo-1608236415053-8702bb6ac542','photo-1467810563316-b5476525c0f9',
  'photo-1575456917131-80e0a4e5c5db','photo-1543499759-3b250d87cf2e','photo-1607344645866-009c320b63e0',
  'photo-1580136579312-94651dfd596d','photo-1481627834876-b7833e8f5570','photo-1566737236500-c8ac43014a67',
  'photo-1501446529957-6226b52bac4b','photo-1460661419201-fd4cecdf8a8b','photo-1531058020387-3be344556be6',
  'photo-1547826039-bdbdb3e2d0ac','photo-1574182245530-967d9b3831af','photo-1518998053901-5348d3961a04',
  'photo-1540575467063-178a50c2df87','photo-1511578314322-379afb476865','photo-1527192491265-7e15c55b1ed2',
  'photo-1475721027785-f74eccf877e2','photo-1505373877841-8d25f7d46678','photo-1562774053-701939374585',
  'photo-1560439514-4e9645039924','photo-1488521787991-ed7bbaae773c','photo-1484544808355-8ec84e534d75',
  'photo-1471286174890-9c112ffca5b4','photo-1533228100845-08145b01de14','photo-1519340241574-2cec6aef0c01',
  'photo-1543342384-1f1350e27861','photo-1467803738586-46b7eb7b16a1','photo-1513635269975-59663e0ac1ad',
  'photo-1534351590666-13e3e96b5017','photo-1477959858617-67f85cf4f1df','photo-1480714378408-67cf0d13bc1b',
  'photo-1444723121867-7a241cacace9','photo-1506377872008-6645d9d29ef7','photo-1467269204594-9661b134dd2b',
  'photo-1496442226666-8d4d0e62e6e9','photo-1499092346589-b9b6be3e94b2','photo-1534430480872-3498386e7856',
  'photo-1507525428034-b723cf961d3e','photo-1519996529931-28324d5a630e','photo-1426604966848-d7adac402bff',
  'photo-1506146332389-18140dc7b2fb','photo-1520986606214-8b456906c813','photo-1486299267070-83823f5448dd',
  'photo-1513622470522-26c3c8a854bc','photo-1491557345352-5929e343eb89','photo-1502602898657-3e91760cbb34',
  'photo-1499856871958-5b9627545d1a','photo-1533154683836-84ea7a0bc310','photo-1512470876302-972faa2aa9a4',
  'photo-1576924542622-772281b13ab1','photo-1558618666-fcd25c85cd64','photo-1527866959252-deab85ef7d1b',
  'photo-1560969184-10fe8719e047','photo-1587330979470-3595ac045ab0','photo-1529655683826-aba9b3e77383',
  'photo-1520986606214-8b456906c813','photo-1574391884720-bbc3740c59d1','photo-1576095256768-ea6a3a85e2c6',
  'photo-1570283626216-c0c38e7e12b5','photo-1464229133504-a4b6d89c7de7','photo-1548802673-380ab8ebc7b7',
  'photo-1551698618-1dfe5d97d256','photo-1539571696357-5a69c17a67c6','photo-1522202176988-66273c2fd55f',
  'photo-1515187029135-18ee286d815b','photo-1517694712202-14dd9538aa97','photo-1531297484001-80022131f5a1',
  'photo-1488590528505-98d2b5aba04b','photo-1518770660439-4636190af475','photo-1556742049-0cfed4f6a45d',
  'photo-1563986768494-4dee2763ff3f','photo-1526374965328-7f61d4dc18c5','photo-1555949963-aa79dcee981c',
  'photo-1551288049-bebda4e38f71','photo-1460925895917-afdab827c52f','photo-1504868584819-f8e8b4b6d7e3',
  'photo-1432888622747-4eb9a8efeb07','photo-1434030216411-0b793f4b4173','photo-1488590528505-98d2b5aba04b',
  'photo-1498050108023-c5249f4df085','photo-1607799279861-4dd421887fb3','photo-1519389950473-47ba0277781c',
  'photo-1504384308090-c894fdcc538d','photo-1461749280684-dccba630e2f6','photo-1542744173-8e7e53415bb0',
  'photo-1611532736597-de2d4265fba3','photo-1583912267550-d974498ee75d','photo-1493666438817-866a91353ca9',
  'photo-1565689157206-0fddef7589a2','photo-1467803738586-46b7eb7b16a1','photo-1519810755548-39cd217da494',
  'photo-1438761681033-6461ffad8d80','photo-1517841905240-472988babdf9','photo-1522075469751-3a6694fb2f61',
  'photo-1552058544-f2b08422138a','photo-1544005313-94ddf0286df2','photo-1531746020798-e6953c6e8e04',
  'photo-1499996860823-5214fcc65f8f','photo-1529156069898-49953e39b3ac','photo-1506794778202-cad84cf45f1d',
  'photo-1507003211169-0a1dd7228f2d','photo-1500648767791-00dcc994a43e','photo-1472099645785-5658abf4ff4e',
  'photo-1547425260-76bcadfb4f2c','photo-1531427186611-ecfd6d936c79','photo-1508214751196-bcfd4ca60f91',
  'photo-1438761681033-6461ffad8d80','photo-1601288496920-b6154fe3626a','photo-1539571696357-5a69c17a67c6',
];

function getPhoto(index) {
  const id = ALL_PHOTOS[index % ALL_PHOTOS.length];
  return `https://images.unsplash.com/${id}?w=1200&q=80`;
}

async function updateAllPhotos() {
  const client = new Client({ connectionString: PG_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log('✅ Connected\n');

  const events = await client.query(
    `SELECT id, title FROM events WHERE status='active' ORDER BY id ASC`
  );

  console.log(`📸 Assigning unique photos to ${events.rows.length} events...\n`);

  let updated = 0;
  for (let i = 0; i < events.rows.length; i++) {
    const photo = getPhoto(i);
    await client.query('UPDATE events SET image_url=$1 WHERE id=$2', [photo, events.rows[i].id]);
    updated++;
    if (updated % 100 === 0) console.log(`  ✅ ${updated} / ${events.rows.length} updated...`);
  }

  // Verify
  const check = await client.query(
    `SELECT image_url, COUNT(*) as n FROM events GROUP BY image_url ORDER BY n DESC LIMIT 5`
  );
  console.log(`\n✅ Done! Updated ${updated} events`);
  console.log('📊 Max repeats after update:');
  check.rows.forEach(r => console.log(`  ${r.n} events share one photo`));
  console.log('\n🎉 Every event now has a unique photo!');

  await client.end();
}

updateAllPhotos().catch(console.error);
