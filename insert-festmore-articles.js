const { Client } = require('pg');
const { article1, article2, article3, article4, article5 } = require('./festmore-articles-5.js');

const PG_URL = process.env.DATABASE_URL || 'postgresql://postgres:VWgjvXynowzYucOsfqNNAPWojptOHaXJ@gondola.proxy.rlwy.net:47003/railway';

async function run() {
  const client = new Client({ connectionString: PG_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log('Connected\n');

  const articles = [article1, article2, article3, article4, article5];

  for (const a of articles) {
    const exists = await client.query('SELECT id FROM articles WHERE slug=$1', [a.slug]);
    if (exists.rows.length > 0) {
      await client.query(
        'UPDATE articles SET title=$1, excerpt=$2, content=$3, image_url=$4, category=$5 WHERE slug=$6',
        [a.title, a.excerpt, a.body, a.image_url, a.category, a.slug]
      );
      console.log('Updated:', a.slug);
    } else {
      await client.query(
        `INSERT INTO articles (title, slug, excerpt, content, image_url, category, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, 'published', NOW())`,
        [a.title, a.slug, a.excerpt, a.body, a.image_url, a.category]
      );
      console.log('Added:', a.slug);
    }
  }

  await client.end();
  console.log('\nDone — 5 articles live on Festmore');
}

run().catch(console.error);
