const { Client } = require('pg');
const PG_URL = 'postgresql://postgres:VWgjvXynowzYucOsfqNNAPWojptOHaXJ@gondola.proxy.rlwy.net:47003/railway';

const artist = {
  name: 'G.Dews',
  slug: 'g-dews-painter-copenhagen',
  genre: 'Circus / Performance',  // closest to visual artist - we'll update genre list
  subgenre: 'Painter / Visual Artist',
  city: 'Copenhagen',
  country: 'DK',
  short_bio: 'Copenhagen-based painter whose work explores deep philosophical themes through 10 years of meaningful visual storytelling.',
  bio: `G.Dews is a Copenhagen-based painter whose canvases are never merely decorative — each work is a question, a provocation, or a quiet meditation on the human condition.

Over the past ten years, Dews has developed a distinctive visual language in which every painting carries philosophical weight. The subjects vary — figures, abstractions, fragments of the world around us — but the intention remains constant: to create images that demand to be looked at slowly, that reward careful attention with layers of meaning that reveal themselves over time.

Dews' practice is rooted in the conviction that art should mean something. In an era of rapid consumption and visual noise, his paintings insist on depth — on the kind of engagement that lingers after you have left the room, that returns to you days later when something you see or read suddenly connects with what you experienced in front of the canvas.

Based in Copenhagen — a city with one of the world's richest traditions of thoughtful, humanist art — Dews draws on the Nordic tradition of restraint and intentionality while pushing towards something more urgent and universal. The philosophical foundations of his work are broad: existentialism, questions of identity and belonging, the relationship between the individual and the collective, the tension between the visible and the invisible.

G.Dews is available for commissions, exhibitions, event installations and collaborations with festivals and cultural events across Europe. Each commissioned work is developed in close dialogue with the client, ensuring that the philosophical depth and personal significance that define his practice are embedded in every piece.`,
  email: 'anotherdews@gmail.com',
  booking_email: 'anotherdews@gmail.com',
  instagram: 'https://www.instagram.com/2012dews',
  website: null,
  youtube: null,
  spotify: null,
  soundcloud: null,
  image_url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&q=80', // painter at work placeholder
  photo_2: null,
  photo_3: null,
  fee_display: 'Contact for commission',
  languages: 'Danish, English, Arabic',
  tags: JSON.stringify(['painter','visual artist','Copenhagen','Denmark','philosophy','contemporary art','commissions','exhibitions','installations']),
  payment_status: 'paid',
  verified: 1,
  featured: 1,
  status: 'active',
};

async function addArtist() {
  const client = new Client({ connectionString: PG_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();

  // Ensure table exists
  await client.query(`
    CREATE TABLE IF NOT EXISTS artists (
      id SERIAL PRIMARY KEY, name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL,
      genre TEXT NOT NULL, subgenre TEXT, city TEXT NOT NULL, country TEXT NOT NULL,
      bio TEXT, short_bio TEXT, website TEXT, instagram TEXT, youtube TEXT,
      spotify TEXT, soundcloud TEXT, email TEXT NOT NULL, phone TEXT,
      booking_email TEXT, image_url TEXT, photo_2 TEXT, photo_3 TEXT,
      fee_display TEXT DEFAULT 'Contact for fee', languages TEXT, tags TEXT,
      status TEXT DEFAULT 'active', payment_status TEXT DEFAULT 'free',
      verified INTEGER DEFAULT 0, featured INTEGER DEFAULT 0,
      views INTEGER DEFAULT 0, stripe_id TEXT, created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  const exists = await client.query('SELECT id FROM artists WHERE slug=$1', [artist.slug]);
  if (exists.rows.length > 0) {
    // Update existing
    await client.query(`
      UPDATE artists SET name=$1, bio=$2, short_bio=$3, instagram=$4, verified=$5,
      featured=$6, payment_status=$7, languages=$8, fee_display=$9, subgenre=$10
      WHERE slug=$11`,
      [artist.name, artist.bio, artist.short_bio, artist.instagram, artist.verified,
       artist.featured, artist.payment_status, artist.languages, artist.fee_display,
       artist.subgenre, artist.slug]
    );
    console.log('✅ Updated G.Dews profile');
  } else {
    await client.query(`
      INSERT INTO artists (name,slug,genre,subgenre,city,country,bio,short_bio,email,
        booking_email,website,instagram,youtube,spotify,soundcloud,image_url,photo_2,photo_3,
        fee_display,languages,tags,status,payment_status,verified,featured)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25)`,
      [artist.name, artist.slug, artist.genre, artist.subgenre, artist.city, artist.country,
       artist.bio, artist.short_bio, artist.email, artist.booking_email, artist.website,
       artist.instagram, artist.youtube, artist.spotify, artist.soundcloud, artist.image_url,
       artist.photo_2, artist.photo_3, artist.fee_display, artist.languages, artist.tags,
       artist.status, artist.payment_status, artist.verified, artist.featured]
    );
    console.log('✅ Added G.Dews as first Festmore artist!');
  }

  console.log('🔗 View at: https://festmore.com/artists/g-dews-painter-copenhagen');
  await client.end();
}

addArtist().catch(console.error);
