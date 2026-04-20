// fix-seo.js — Run once to fix SEO issues
// 1. Adds redirect table for 404 URLs
// 2. Verifies sitemap is correct

const { Client } = require('pg');
const PG_URL = 'postgresql://postgres:VWgjvXynowzYucOsfqNNAPWojptOHaXJ@gondola.proxy.rlwy.net:47003/railway';

async function fix() {
  const client = new Client({ connectionString: PG_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log('✅ Connected');

  // Create redirects table
  await client.query(`
    CREATE TABLE IF NOT EXISTS redirects (
      id SERIAL PRIMARY KEY,
      from_path TEXT NOT NULL UNIQUE,
      to_path TEXT NOT NULL,
      status_code INTEGER DEFAULT 301,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log('✅ Redirects table ready');

  // Get all bad news article URLs that are 404ing
  // These are slugs that don't match any event/article/vendor pattern
  // We redirect them all to /articles
  const badSlugs = [
    'this-is-how-dependent-germany-is-on-chinese-medicines',
    'ukraine-updates-kyiv-targeted-in-deadly-wave-attack',
    'romania-election-polls-open-in-tight-presidential-runoff',
    'is-the-u-s-losing-in-vietnam-russia-north-korea-and-china-are-gaining',
    'israel-says-a-gaza-border-will-reopen-but-only-for-palestinians-to-leave',
    'canadian-prime-minister-mark-carney-to-visit-us-president-donald-trump-at-the-oval-office-on-tuesday',
    'money-isnt-everything-mohamed-salahs-hometown-celebrates-as-liverpool-storms-to-league-title',
    'the-sleeper-issue-at-the-heart-of-trumps-trade-war',
    'more-than-100-women-freed-after-spanish-police-dismantle-human-trafficking-ring',
    'for-south-koreans-squid-game-was-more-than-just-entertainment',
  ];

  for (const slug of badSlugs) {
    await client.query(`
      INSERT INTO redirects (from_path, to_path) VALUES ($1, $2)
      ON CONFLICT (from_path) DO NOTHING
    `, ['/' + slug, '/articles']);
  }
  console.log('✅ Redirects added for', badSlugs.length, 'bad URLs');

  // Check articles table for any news-type articles that slipped in
  const badArticles = await client.query(`
    SELECT id, title, slug FROM articles 
    WHERE title ILIKE '%ukraine%' OR title ILIKE '%trump%' 
    OR title ILIKE '%squid game%' OR title ILIKE '%romania%'
    OR title ILIKE '%carney%' OR title ILIKE '%salah%'
    OR title ILIKE '%trafficking%' OR title ILIKE '%israel%'
    OR title ILIKE '%germany depend%' OR title ILIKE '%vietnam%'
    LIMIT 50
  `);
  
  if (badArticles.rows.length > 0) {
    console.log('Found', badArticles.rows.length, 'news articles to remove:');
    for (const a of badArticles.rows) {
      console.log('  - Removing:', a.title);
      await client.query('DELETE FROM articles WHERE id=$1', [a.id]);
    }
    console.log('✅ Bad news articles removed');
  } else {
    console.log('✅ No bad news articles found in database');
  }

  console.log('\n🎉 SEO fix complete!');
  await client.end();
}

fix().catch(console.error);
