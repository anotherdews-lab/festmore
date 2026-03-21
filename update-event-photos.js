// update-event-photos.js
// Assigns unique, relevant photos to every event based on title, category and country
// Uses Unsplash photos — all free to use

const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, 'db', 'festmore.db'));

// ─── SPECIFIC EVENT PHOTOS ───
// Matched by title keyword — most specific match wins
const SPECIFIC = [
  // Poland / Pol'and'Rock
  { match: ['polandrock', "pol'and'rock", 'woodstock poland', 'poland rock'], url: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&q=80' },
  // Roskilde
  { match: ['roskilde'], url: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&q=80' },
  // Glastonbury
  { match: ['glastonbury'], url: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&q=80' },
  // Tomorrowland
  { match: ['tomorrowland'], url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80' },
  // Rock am Ring
  { match: ['rock am ring', 'rock im park'], url: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=800&q=80' },
  // Oktoberfest
  { match: ['oktoberfest'], url: 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800&q=80' },
  // Carnival / Venice
  { match: ['carnival', 'carnaval', 'karneval', 'venice carnival'], url: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&q=80' },
  // Christmas markets Germany/Berlin/Vienna
  { match: ['berlin christmas', 'vienna christmas', 'christmas market', 'weihnachtsmarkt', 'julmarket', 'kerstmarkt', 'marché de noël', 'prague christmas', 'budapest christmas', 'torvehallerne christmas', 'tivoli christmas'], url: 'https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=800&q=80' },
  // Sziget
  { match: ['sziget'], url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80' },
  // Primavera Sound
  { match: ['primavera sound'], url: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80' },
  // Ultra Europe / EDM
  { match: ['ultra europe', 'ultra festival', 'tomorrowland', 'zurich street parade', 'street parade'], url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80' },
  // Montreux Jazz
  { match: ['montreux jazz', 'umbria jazz', 'oslo jazz', 'jazz festival'], url: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800&q=80' },
  // Fuji Rock
  { match: ['fuji rock', 'fuji festival'], url: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&q=80' },
  // Gion Matsuri / Japanese festivals
  { match: ['gion matsuri', 'nebuta', 'awa odori'], url: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80' },
  // Sapporo Snow Festival
  { match: ['sapporo snow', 'snow festival', 'ice sculpture'], url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80' },
  // Cherry Blossom
  { match: ['cherry blossom', 'sakura', 'hanami'], url: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=800&q=80' },
  // Diwali
  { match: ['diwali', 'festival of lights', 'deepavali'], url: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=800&q=80' },
  // Holi
  { match: ['holi', 'festival of colours', 'festival of colors'], url: 'https://images.unsplash.com/photo-1520543787272-4f130c533898?w=800&q=80' },
  // Kumbh Mela
  { match: ['kumbh mela', 'kumbh'], url: 'https://images.unsplash.com/photo-1609766857970-6f9b7a4699da?w=800&q=80' },
  // Rann Utsav / Desert
  { match: ['rann utsav', 'rann of kutch', 'desert festival'], url: 'https://images.unsplash.com/photo-1542401886-65d6c61db217?w=800&q=80' },
  // Sunburn Goa / Beach party
  { match: ['sunburn', 'full moon party', 'beach party', 'koh phangan'], url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80' },
  // Songkran water festival
  { match: ['songkran', 'water festival'], url: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80' },
  // Yi Peng lanterns
  { match: ['yi peng', 'lantern festival', 'loy krathong', 'floating lights'], url: 'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=800&q=80' },
  // Pushkar Camel Fair
  { match: ['pushkar', 'camel fair', 'camel festival'], url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80' },
  // San Fermin / Running of the bulls
  { match: ['san fermin', 'running of the bulls', 'pamplona'], url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80' },
  // La Tomatina
  { match: ['tomatina', 'tomato festival'], url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80' },
  // Feria de Abril / Flamenco
  { match: ['feria de abril', 'flamenco', 'seville'], url: 'https://images.unsplash.com/photo-1543783207-ec64e4d3a5c2?w=800&q=80' },
  // St Patrick's Day
  { match: ["st patrick", "saint patrick", "paddy's day"], url: 'https://images.unsplash.com/photo-1491933382434-500287f9b54b?w=800&q=80' },
  // Electric Picnic
  { match: ['electric picnic'], url: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&q=80' },
  // Palio di Siena
  { match: ['palio di siena', 'palio', 'siena'], url: 'https://images.unsplash.com/photo-1476304884326-cd2c88572c5f?w=800&q=80' },
  // Oslo / Nordic festivals
  { match: ['oslo', 'oyafestivalen', 'øya festival'], url: 'https://images.unsplash.com/photo-1531804894-39b2d87e2942?w=800&q=80' },
  // Bergen
  { match: ['bergen international'], url: 'https://images.unsplash.com/photo-1531804894-39b2d87e2942?w=800&q=80' },
  // Salzburg
  { match: ['salzburg'], url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80' },
  // Budapest Wine
  { match: ['budapest wine', 'wine festival'], url: 'https://images.unsplash.com/photo-1528823872057-9c018a7a7553?w=800&q=80' },
  // Helsinki / Flow Festival
  { match: ['flow festival', 'helsinki festival'], url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80' },
  // Ruisrock / Finland festival
  { match: ['ruisrock', 'turku'], url: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&q=80' },
  // Colours of Ostrava
  { match: ['colours of ostrava', 'ostrava'], url: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&q=80' },
  // Prague Spring Music
  { match: ['prague spring', 'prague music'], url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80' },
  // Athens Epidaurus
  { match: ['athens epidaurus', 'ancient theatre', 'epidaurus'], url: 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=800&q=80' },
  // Thessaloniki Film Festival
  { match: ['thessaloniki film', 'film festival'], url: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&q=80' },
  // INmusic Zagreb
  { match: ['inmusic', 'zagreb'], url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80' },
  // NOS Alive
  { match: ['nos alive', 'lisbon festival'], url: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&q=80' },
  // Festa São João Porto
  { match: ['são joão', 'porto festival', 'sao joao'], url: 'https://images.unsplash.com/photo-1498036882173-b41c28a8ba34?w=800&q=80' },
  // Galway Arts
  { match: ['galway', 'galway arts'], url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80' },
  // Distortion Copenhagen
  { match: ['distortion'], url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80' },
  // Copenhagen Jazz
  { match: ['copenhagen jazz'], url: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800&q=80' },
  // Smukfest
  { match: ['smukfest', 'skanderborg'], url: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&q=80' },
  // NorthSide
  { match: ['northside', 'north side'], url: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&q=80' },
  // Aarhus Festival
  { match: ['aarhus festival', 'aarhus'], url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80' },
  // Tønder Festival
  { match: ['tønder', 'tonder festival'], url: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800&q=80' },
  // Vlaggetjesdag
  { match: ['vlaggetjesdag', 'scheveningen', 'herring'], url: 'https://images.unsplash.com/photo-1534008897995-27a23e859048?w=800&q=80' },
  // Frederiksberg Flea Market
  { match: ['flea market', 'loppemarked', 'vlooienmarkt', 'flohmarkt', 'loppmarkt'], url: 'https://images.unsplash.com/photo-1558402847-7f9d6d65b41c?w=800&q=80' },
  // Food festivals
  { match: ['food festival', 'street food', 'food market', 'cooking festival', 'gastronomic'], url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80' },
  // Garbage band
  { match: ['garbage', 'shirley manson'], url: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=800&q=80' },
  // Midsummer
  { match: ['midsummer', 'midsommar', 'juhannus', 'summer solstice'], url: 'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=800&q=80' },
  // Constitution Day Norway
  { match: ['constitution day', 'national day norway', '17 mai', '17 may'], url: 'https://images.unsplash.com/photo-1531804894-39b2d87e2942?w=800&q=80' },
  // Copenhagen Pride
  { match: ['pride', 'lgbtq', 'rainbow'], url: 'https://images.unsplash.com/photo-1561906011-91b8e2e72bb4?w=800&q=80' },
  // Copenhagen Marathon
  { match: ['marathon', 'running', 'race event'], url: 'https://images.unsplash.com/photo-1502904550040-7534597429ae?w=800&q=80' },
  // Cooking/Food Copenhagen
  { match: ['cooking festival', 'food festival copenhagen'], url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80' },
];

// ─── CATEGORY PHOTOS (fallback by category) ───
const CATEGORY_PHOTOS = {
  festival: [
    'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&q=80',
    'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&q=80',
    'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&q=80',
    'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80',
    'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80',
    'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=800&q=80',
  ],
  concert: [
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
    'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&q=80',
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
    'https://images.unsplash.com/photo-1468359601543-843bfaef291a?w=800&q=80',
  ],
  market: [
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80',
    'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&q=80',
    'https://images.unsplash.com/photo-1498036882173-b41c28a8ba34?w=800&q=80',
    'https://images.unsplash.com/photo-1534008897995-27a23e859048?w=800&q=80',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
  ],
  christmas: [
    'https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=800&q=80',
    'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=800&q=80',
    'https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=800&q=80',
    'https://images.unsplash.com/photo-1576919228236-a097c32a5cd4?w=800&q=80',
  ],
  exhibition: [
    'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80',
    'https://images.unsplash.com/photo-1594122230689-45899d9e6f69?w=800&q=80',
    'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&q=80',
  ],
  business: [
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
    'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80',
    'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&q=80',
  ],
  city: [
    'https://images.unsplash.com/photo-1467803738586-46b7eb7b16a1?w=800&q=80',
    'https://images.unsplash.com/photo-1476309432998-ea9d6f00ed70?w=800&q=80',
    'https://images.unsplash.com/photo-1498036882173-b41c28a8ba34?w=800&q=80',
    'https://images.unsplash.com/photo-1534008897995-27a23e859048?w=800&q=80',
  ],
  kids: [
    'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80',
    'https://images.unsplash.com/photo-1472745942893-4b9f730c7668?w=800&q=80',
  ],
  flea: [
    'https://images.unsplash.com/photo-1558402847-7f9d6d65b41c?w=800&q=80',
    'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&q=80',
    'https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=800&q=80',
  ],
  messe: [
    'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
  ],
  online: [
    'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=800&q=80',
  ],
};

// ─── COUNTRY FALLBACK PHOTOS ───
const COUNTRY_PHOTOS = {
  DE: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&q=80',
  DK: 'https://images.unsplash.com/photo-1531804894-39b2d87e2942?w=800&q=80',
  NL: 'https://images.unsplash.com/photo-1534008897995-27a23e859048?w=800&q=80',
  GB: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80',
  FR: 'https://images.unsplash.com/photo-1499856871958-5b9357976b82?w=800&q=80',
  SE: 'https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=800&q=80',
  PL: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&q=80',
  BE: 'https://images.unsplash.com/photo-1491557345352-5929e343eb89?w=800&q=80',
  NO: 'https://images.unsplash.com/photo-1531804894-39b2d87e2942?w=800&q=80',
  FI: 'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=800&q=80',
  AT: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80',
  CH: 'https://images.unsplash.com/photo-1527095009-9b403cb78eb1?w=800&q=80',
  IT: 'https://images.unsplash.com/photo-1515542622106-078bda21d78d?w=800&q=80',
  ES: 'https://images.unsplash.com/photo-1543783207-ec64e4d3a5c2?w=800&q=80',
  PT: 'https://images.unsplash.com/photo-1558642891-54be180ea339?w=800&q=80',
  IE: 'https://images.unsplash.com/photo-1591951425600-1890bab87f0e?w=800&q=80',
  CZ: 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=800&q=80',
  HU: 'https://images.unsplash.com/photo-1541969359765-0b5fd6c99f4d?w=800&q=80',
  GR: 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=800&q=80',
  HR: 'https://images.unsplash.com/photo-1555990793-da11153b5d37?w=800&q=80',
  IN: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&q=80',
  TH: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80',
  JP: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80',
  AE: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80',
  US: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&q=80',
};

// ─── FIND BEST PHOTO FOR EVENT ───
function getBestPhoto(event, usedPhotos) {
  const titleLower = (event.title || '').toLowerCase();

  // 1. Check specific matches first
  for (const item of SPECIFIC) {
    if (item.match.some(keyword => titleLower.includes(keyword))) {
      // Avoid using same photo as last event if possible
      if (!usedPhotos.has(item.url) || SPECIFIC.length < 5) {
        usedPhotos.add(item.url);
        return item.url;
      }
    }
  }

  // 2. Category photos — pick one not recently used
  const catPhotos = CATEGORY_PHOTOS[event.category] || CATEGORY_PHOTOS.festival;
  for (const photo of catPhotos) {
    if (!usedPhotos.has(photo)) {
      usedPhotos.add(photo);
      return photo;
    }
  }

  // 3. Country fallback
  if (COUNTRY_PHOTOS[event.country]) {
    const photo = COUNTRY_PHOTOS[event.country];
    usedPhotos.add(photo);
    return photo;
  }

  // 4. Last resort — pick from category but allow repeats
  const fallback = catPhotos[Math.floor(Math.random() * catPhotos.length)];
  return fallback;
}

// ─── UPDATE ALL EVENTS ───
const events = db.prepare(`SELECT id, title, category, country, image_url FROM events WHERE status='active' ORDER BY id`).all();

console.log(`Found ${events.length} events to update...`);

let updated = 0;
let skipped = 0;
const usedPhotos = new Set();

// Track category photo indices for round-robin assignment
const catIndex = {};

for (const event of events) {
  const titleLower = (event.title || '').toLowerCase();

  // Find specific match
  let newPhoto = null;

  for (const item of SPECIFIC) {
    if (item.match.some(keyword => titleLower.includes(keyword))) {
      newPhoto = item.url;
      break;
    }
  }

  // No specific match — use category round-robin
  if (!newPhoto) {
    const cat = event.category || 'festival';
    const photos = CATEGORY_PHOTOS[cat] || CATEGORY_PHOTOS.festival;
    const idx = catIndex[cat] || 0;
    newPhoto = photos[idx % photos.length];
    catIndex[cat] = idx + 1;
  }

  if (newPhoto && newPhoto !== event.image_url) {
    db.prepare(`UPDATE events SET image_url=? WHERE id=?`).run(newPhoto, event.id);
    updated++;
    console.log(`✅ Updated: ${event.title.substring(0, 50)}`);
  } else if (event.image_url && event.image_url.includes('unsplash')) {
    skipped++;
  } else {
    // Has no image at all — assign one
    const cat = event.category || 'festival';
    const photos = CATEGORY_PHOTOS[cat] || CATEGORY_PHOTOS.festival;
    const idx = catIndex[cat] || 0;
    newPhoto = photos[idx % photos.length];
    catIndex[cat] = idx + 1;
    db.prepare(`UPDATE events SET image_url=? WHERE id=?`).run(newPhoto, event.id);
    updated++;
    console.log(`📸 Assigned: ${event.title.substring(0, 50)}`);
  }
}

console.log(`\n✅ Done!`);
console.log(`Updated: ${updated} events`);
console.log(`Skipped: ${skipped} events (already had unique photo)`);
db.close();
