// fix-seo-complete.js
// Fixes ALL Google Search Console issues:
// 1. Creates redirects table for 404 bad URLs
// 2. Removes news articles that cause 404s
// 3. Never touches festival/market/vendor articles
// Run: node fix-seo-complete.js

const { Client } = require('pg');
const PG_URL = 'postgresql://postgres:VWgjvXynowzYucOsfqNNAPWojptOHaXJ@gondola.proxy.rlwy.net:47003/railway';

// Keywords that identify BAD news articles (not festival content)
const NEWS_KEYWORDS = [
  'ukraine', 'trump', 'squid game', 'romania election', 'carney',
  'salah', 'trafficking', 'israel gaza', 'vietnam russia',
  'dependent germany chinese medicines', 'sleeper issue trade war',
  'south korean squid', 'liverpool storms league',
  'presidential runoff', 'oval office', 'donald trump',
  'kyiv targeted', 'deadly wave attack', 'human trafficking ring',
  'spanish police dismantle', 'mark carney', 'trade war',
];

// Keywords that identify GOOD festival articles (keep these)
const GOOD_KEYWORDS = [
  'festival', 'market', 'vendor', 'event', 'concert', 'christmas',
  'carnival', 'tomorrowland', 'coachella', 'glastonbury', 'oktoberfest',
  'edinburgh', 'carnival', 'flea market', 'street market', 'craft',
  'amsterdam', 'berlin', 'copenhagen', 'paris', 'london',
  'how to become', 'how to find', 'guide to', 'complete guide',
];

async function fixSEO() {
  const client = new Client({ connectionString: PG_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log('✅ Connected to PostgreSQL\n');

  // ── 1. Create redirects table ──
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

  // ── 2. Get all articles ──
  const allArticles = await client.query('SELECT id, title, slug, category FROM articles');
  console.log(`\n📰 Total articles found: ${allArticles.rows.length}`);

  let kept = 0, removed = 0, redirected = 0;

  for (const article of allArticles.rows) {
    const titleLower = article.title.toLowerCase();

    // Check if it's a bad news article
    const isBadNews = NEWS_KEYWORDS.some(kw => titleLower.includes(kw));

    // Check if it's a good festival article
    const isGoodContent = GOOD_KEYWORDS.some(kw => titleLower.includes(kw));

    if (isBadNews && !isGoodContent) {
      // Add redirect from this URL to /articles
      await client.query(`
        INSERT INTO redirects (from_path, to_path, status_code)
        VALUES ($1, '/articles', 301)
        ON CONFLICT (from_path) DO NOTHING
      `, [`/articles/${article.slug}`]);

      // Remove from database (it was causing 404s because it was never a real page)
      await client.query('DELETE FROM articles WHERE id=$1', [article.id]);
      console.log(`  ❌ Removed news article: "${article.title}"`);
      removed++;
      redirected++;
    } else {
      console.log(`  ✅ Keeping: "${article.title}"`);
      kept++;
    }
  }

  console.log(`\n📊 Results:`);
  console.log(`  ✅ Kept: ${kept} festival/market/vendor articles`);
  console.log(`  ❌ Removed: ${removed} news articles`);
  console.log(`  🔄 Redirects added: ${redirected}`);

  // ── 3. Add redirects for the known bad news URLs from Search Console ──
  const knownBadUrls = [
    '/this-is-how-dependent-germany-is-on-chinese-medicines',
    '/ukraine-updates-kyiv-targeted-in-deadly-wave-attack',
    '/romania-election-polls-open-in-tight-presidential-runoff',
    '/is-the-u-s-losing-in-vietnam-russia-north-korea-and-china-are-gaining',
    '/israel-says-a-gaza-border-will-reopen-but-only-for-palestinians-to-leave',
    '/canadian-prime-minister-mark-carney-to-visit-us-president-donald-trump-at-the-oval-office-on-tuesday',
    '/money-isnt-everything-mohamed-salahs-hometown-celebrates-as-liverpool-storms-to-league-title',
    '/the-sleeper-issue-at-the-heart-of-trumps-trade-war',
    '/more-than-100-women-freed-after-spanish-police-dismantle-human-trafficking-ring',
    '/for-south-koreanssquid-game-was-more-than-just-entertainment',
    '/for-south-koreans-squid-game-was-more-than-just-entertainment',
  ];

  for (const url of knownBadUrls) {
    await client.query(`
      INSERT INTO redirects (from_path, to_path, status_code)
      VALUES ($1, '/articles', 301)
      ON CONFLICT (from_path) DO NOTHING
    `, [url]);
  }
  console.log(`\n✅ Added ${knownBadUrls.length} redirects for known bad URLs`);

  // ── 4. Final count ──
  const finalCount = await client.query("SELECT COUNT(*) as n FROM articles WHERE status='published'");
  const redirectCount = await client.query("SELECT COUNT(*) as n FROM redirects");
  console.log(`\n🎉 DONE!`);
  console.log(`  📰 Articles remaining: ${finalCount.rows[0].n}`);
  console.log(`  🔄 Total redirects: ${redirectCount.rows[0].n}`);
  console.log(`\n  Next: Push the new sitemap.js and submit sitemap to Google Search Console`);

  await client.end();
}

fixSEO().catch(console.error);
