const { Client } = require('pg');
const PG_URL = 'postgresql://postgres:VWgjvXynowzYucOsfqNNAPWojptOHaXJ@gondola.proxy.rlwy.net:47003/railway';

const article = {
  title: 'Major Events in the Netherlands 2026: A Complete Guide for Visitors and Culture Lovers',
  slug: 'major-events-netherlands-2026-complete-guide',
  category: 'festival',
  image_url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200&q=80',
  meta_description: 'Discover the best events in the Netherlands in 2026 — from Koningsdag and Pinkpop to Holland Festival, ADE and Oerol. Your complete guide to Dutch festivals and cultural events.',
  content: `<p>The Netherlands continues to stand out in 2026 as one of Europe's most vibrant cultural hubs. From world-famous national celebrations to cutting-edge music festivals and historic art events, the country offers a dense calendar of experiences across cities like Amsterdam, Rotterdam, Utrecht, and beyond.</p>

<h2>👑 King's Day (Koningsdag) 2026</h2>
<p>One of the most significant national events is King's Day (Koningsdag), celebrated annually on April 27. In 2026, festivities took place across the country, with the royal family visiting the historic town of Dokkum.</p>
<p><strong>📍 Location:</strong> Dokkum city center, Friesland, Netherlands — and nationwide</p>
<p><strong>What happens:</strong></p>
<ul>
<li>Nationwide street markets ("vrijmarkt")</li>
<li>Open-air concerts and canal parties</li>
<li>Traditional Dutch games and performances</li>
</ul>
<p>King's Day is more than a party — it reflects national identity and unity, with millions dressed in orange filling streets and canals.</p>

<h2>🎭 Holland Festival 2026 — The Netherlands' Premier Arts Event</h2>
<p><strong>📅 Dates:</strong> June 13 – June 26, 2026<br/><strong>📍 Address:</strong> Piet Heinkade 5, 1019 BR Amsterdam, Netherlands</p>
<p>The Holland Festival is the country's largest international performing arts festival, running since 1947. It brings together theatre, opera, dance, and music from world-renowned artists.</p>
<p><strong>Why it matters:</strong></p>
<ul>
<li>Considered one of Europe's top cultural festivals</li>
<li>Attracts global audiences and professionals</li>
<li>Features dozens of performances across Amsterdam</li>
</ul>
<p>This festival transforms the capital into a creative hub for nearly two weeks.</p>

<h2>🎶 Pinkpop Festival 2026 — A Legendary Music Experience</h2>
<p><strong>📅 Dates:</strong> June 18 – June 22, 2026<br/><strong>📍 Location:</strong> Megaland, Landgraaf, Limburg, Netherlands</p>
<p>One of the oldest and most iconic pop/rock festivals in Europe, Pinkpop draws massive crowds each year.</p>
<p><strong>Highlights:</strong></p>
<ul>
<li>International headliners like Foo Fighters and The Cure</li>
<li>Large-scale production and multi-day camping</li>
<li>Strong mix of Dutch and global artists</li>
</ul>
<p>Pinkpop remains a cornerstone of Dutch festival culture, combining tradition with modern music trends.</p>

<h2>🌊 Oerol Festival 2026 — Art in Nature</h2>
<p><strong>📅 Dates:</strong> June 12 – June 21, 2026<br/><strong>📍 Location:</strong> West-Terschelling, Friesland, Netherlands</p>
<p>Unlike typical festivals, Oerol is a unique blend of theatre, landscape art, and performance spread across an entire island.</p>
<p><strong>What makes it special:</strong></p>
<ul>
<li>Performances in dunes, forests, and beaches</li>
<li>Strong focus on environmental storytelling</li>
<li>Immersive, site-specific art</li>
</ul>
<p>It's widely regarded as one of the most creative cultural experiences in Europe.</p>

<h2>🎧 Amsterdam Dance Event (ADE) 2026 — Global Electronic Music Capital</h2>
<p><strong>📅 Dates:</strong> October 21 – October 25, 2026<br/><strong>📍 Location:</strong> Multiple venues across Amsterdam</p>
<p>The Amsterdam Dance Event (ADE) is not just a festival — it's a city-wide takeover involving hundreds of venues.</p>
<p><strong>Key facts:</strong></p>
<ul>
<li>Thousands of artists and DJs</li>
<li>Industry conferences and nightlife events</li>
<li>Genres from techno to experimental electronic</li>
</ul>
<p>Amsterdam becomes the epicenter of global electronic music during ADE.</p>

<h2>🎡 A Day at the Park Festival 2026 — Rotterdam's Outdoor Party</h2>
<p><strong>📅 Date:</strong> September 12, 2026<br/><strong>📍 Location:</strong> Kralingse Bos, Rotterdam, Netherlands</p>
<p>A one-day open-air festival focused on house and tech-house music.</p>
<p><strong>Why attend:</strong></p>
<ul>
<li>Scenic forest setting near the city</li>
<li>International DJs and vibrant crowd</li>
<li>Easy day-to-night festival format</li>
</ul>

<h2>🚤 Varend Corso Westland 2026 — Floating Flower Parade</h2>
<p><strong>📅 Dates:</strong> June 19 – June 21, 2026<br/><strong>📍 Region:</strong> Westland / Delft / Rijnland, South Holland</p>
<p>This unique Dutch event features boats decorated with flowers and vegetables, traveling through canals.</p>
<p><strong>Experience:</strong></p>
<ul>
<li>Moving parade across multiple towns</li>
<li>Strong agricultural and regional identity</li>
<li>Free public viewing areas</li>
</ul>

<h2>💡 Amsterdam Light Festival 2026 — Winter Highlight</h2>
<p><strong>📍 Location:</strong> Amsterdam canals<br/><strong>📅 Season:</strong> Winter 2026</p>
<p>A visually stunning event where international artists illuminate the canals with light installations.</p>
<p><strong>Perfect for:</strong></p>
<ul>
<li>Evening canal tours</li>
<li>Photography and cultural tourism</li>
<li>Winter travel experiences</li>
</ul>

<h2>📊 Why the Netherlands Dominates the Event Scene</h2>
<p>The Dutch event calendar is globally respected for several reasons:</p>
<ul>
<li>High density of festivals across cities</li>
<li>Strong infrastructure and accessibility</li>
<li>Creative production and innovation</li>
<li>Inclusive and international atmosphere</li>
</ul>
<p>The country hosts thousands of events annually, especially in music and arts, making it a leading destination in Europe.</p>

<p><strong>Looking for events to attend or vendors to work with in the Netherlands?</strong> Browse our full listings at <a href="https://festmore.com/events?country=NL">festmore.com/events</a> and find the perfect opportunity for 2026.</p>`
};

async function addArticle() {
  const client = new Client({ connectionString: PG_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();

  // Check if already exists
  const exists = await client.query('SELECT id FROM articles WHERE slug=$1', [article.slug]);
  if (exists.rows.length > 0) {
    console.log('⏭️  Article already exists, updating...');
    await client.query(
      `UPDATE articles SET title=$1, content=$2, excerpt=$3, image_url=$4, status='published' WHERE slug=$5`,
      [article.title, article.content, article.meta_description, article.image_url, article.slug]
    );
    console.log('✅ Article updated!');
  } else {
    await client.query(
      `INSERT INTO articles (title, slug, category, content, excerpt, image_url, author, status, views, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'Festmore', 'published', 0, NOW())`,
      [article.title, article.slug, article.category, article.content, article.meta_description, article.image_url]
    );
    console.log('✅ Article published!');
  }

  console.log('🔗 View at: https://festmore.com/articles/' + article.slug);
  await client.end();
}

addArticle().catch(console.error);
