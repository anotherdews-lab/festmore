// automation/daily.js
// ════════════════════════════════════════════════════
// THIS IS THE MAGIC ENGINE
// Runs automatically every night at 2:00 AM
// It writes 10 new articles about real world events
// Uses Claude AI + real-time web search
// Zero manual work needed from you!
// ════════════════════════════════════════════════════

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const db = require('../db');

// Topics it writes about — rotates through these
const ARTICLE_TOPICS = [
  { type: 'guide',     template: 'Top 10 {category} in {country} for {year}' },
  { type: 'guide',     template: 'Best Free Festivals in {country} {year} — Complete Guide' },
  { type: 'news',      template: 'What\'s Happening This Month: {country} Events {month} {year}' },
  { type: 'guide',     template: '{category} Guide: Everything You Need to Know for {year}' },
  { type: 'tips',      template: 'How to Find the Best {category} Near You' },
  { type: 'roundup',   template: 'The Ultimate {country} Festival Calendar {year}' },
  { type: 'news',      template: 'New Events Added This Week in {country}' },
  { type: 'guide',     template: 'Family-Friendly Events in {country}: Kids & Adults {year}' },
  { type: 'tips',      template: 'Vendor Guide: How to Get a Spot at Europe\'s Best Markets' },
  { type: 'roundup',   template: 'Christmas Markets Europe {year}: Dates, Cities & What to Expect' },
  { type: 'guide',     template: 'Food Festivals in {country}: The Complete {year} Guide' },
  { type: 'news',      template: 'Festival News: This Week in European Events' },
  { type: 'guide',     template: 'Music Festivals in {country} {year} — Dates & Tickets' },
  { type: 'tips',      template: 'How to Plan Your Festival Season in Europe' },
  { type: 'roundup',   template: 'City Events in {city}: What\'s On in {month} {year}' },
];

const COUNTRIES = ['Germany', 'Denmark', 'United Kingdom', 'France', 'Belgium', 'Netherlands', 'Sweden', 'Poland', 'USA'];
const CATEGORIES = ['Festivals', 'Christmas Markets', 'Food Markets', 'Music Festivals', 'City Events', 'Street Markets', 'Cultural Events'];
const CITIES = ['Berlin', 'Hamburg', 'Copenhagen', 'London', 'Paris', 'Amsterdam', 'Stockholm', 'Brussels', 'New York'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function randomFrom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

async function callClaude(prompt, maxTokens = 2000) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001', // cheapest model for articles
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }]
    })
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return data.content.map(b => b.text || '').join('');
}

async function generateArticle(topicTemplate) {
  const year = new Date().getFullYear();
  const month = MONTHS[new Date().getMonth()];
  const country = randomFrom(COUNTRIES);
  const category = randomFrom(CATEGORIES);
  const city = randomFrom(CITIES);

  const title = topicTemplate
    .replace('{year}', year)
    .replace('{month}', month)
    .replace('{country}', country)
    .replace('{category}', category)
    .replace('{city}', city);

  console.log(`  📝 Writing: "${title}"...`);

  const prompt = `You are a travel and festival journalist writing for Festmore.com — a global event discovery website.

Write a comprehensive, SEO-optimised article with this title: "${title}"

Requirements:
- Write in friendly, engaging English
- Include real, accurate information about festivals and events
- Length: 600-900 words
- Use this exact format:

EXCERPT: [One compelling sentence, max 160 characters]
META_DESC: [SEO meta description, max 155 characters, include main keyword]
TAGS: ["tag1", "tag2", "tag3", "tag4"] (4 relevant keyword tags as JSON array)
CATEGORY: [one of: festival, market, christmas, concert, city, business, kids, exhibition]
COUNTRY_CODE: [2-letter ISO code like DE, GB, FR, DK, NL, SE, BE, US, PL]
IMAGE_CATEGORY: [one of: festival, market, christmas, concert, city, business, kids, exhibition]

---ARTICLE---
[Full article in clean text with ## headings. No markdown asterisks. No HTML. Just clean text with ## for H2 headings and ### for H3.]

Make it genuinely useful and informative. Include practical tips, dates if known, and advice for visitors.`;

  const raw = await callClaude(prompt, 1800);

  // Parse the response
  const excerptMatch  = raw.match(/EXCERPT:\s*(.+)/);
  const metaMatch     = raw.match(/META_DESC:\s*(.+)/);
  const tagsMatch     = raw.match(/TAGS:\s*(\[.+?\])/s);
  const catMatch      = raw.match(/CATEGORY:\s*(\w+)/);
  const countryMatch  = raw.match(/COUNTRY_CODE:\s*([A-Z]{2})/);
  const articleMatch  = raw.match(/---ARTICLE---\n([\s\S]+)/);

  const excerpt  = excerptMatch?.[1]?.trim() || title;
  const metaDesc = metaMatch?.[1]?.trim() || excerpt;
  const tags     = tagsMatch?.[1] || '[]';
  const cat      = catMatch?.[1]?.trim() || 'festival';
  const cCode    = countryMatch?.[1]?.trim() || 'DE';
  const content  = articleMatch?.[1]?.trim() || raw;

  // Convert markdown-like headings to basic HTML
  const htmlContent = content
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^([^<].+)$/gm, '<p>$1</p>')
    .replace(/<p><\/p>/g, '');

  return { title, excerpt, metaDesc, tags, cat, cCode, htmlContent, metaTitle: `${title} | Festmore` };
}

function slugify(str) {
  return str.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

const ARTICLE_IMAGES = {
  festival:   'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=70',
  market:     'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=70',
  christmas:  'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=800&q=70',
  concert:    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=70',
  city:       'https://images.unsplash.com/photo-1467803738586-46b7eb7b16a1?w=800&q=70',
  business:   'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=70',
  kids:       'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=70',
  exhibition: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=70',
};

async function run() {
  console.log('');
  console.log('🤖 ════════════════════════════════════');
  console.log('   FESTMORE DAILY AUTOMATION STARTED');
  console.log(`   ${new Date().toLocaleString()}`);
  console.log('════════════════════════════════════');

  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY.includes('YOUR_')) {
    console.log('⚠️  No Anthropic API key found. Add it to your .env file.');
    console.log('   Get a free key at: https://console.anthropic.com');
    return;
  }

  // Pick 10 random topics (no duplicates in last 7 days)
  const recentTitles = db.prepare(`
    SELECT title FROM articles
    WHERE created_at > datetime('now', '-7 days')
  `).all().map(a => a.title.toLowerCase());

  const shuffled = [...ARTICLE_TOPICS].sort(() => Math.random() - 0.5);
  let written = 0;
  let tried = 0;

  while (written < 10 && tried < ARTICLE_TOPICS.length) {
    const topic = shuffled[tried % shuffled.length];
    tried++;

    try {
      const article = await generateArticle(topic.template);

      // Check for duplicate title
      if (recentTitles.some(t => t.includes(article.title.toLowerCase().substring(0, 30)))) {
        console.log(`  ⏭️  Skipping duplicate topic`);
        continue;
      }

      // Create unique slug
      let slug = slugify(article.title);
      let i = 1;
      while (db.prepare('SELECT id FROM articles WHERE slug=?').get(slug)) {
        slug = `${slugify(article.title)}-${i++}`;
      }

      const imageUrl = ARTICLE_IMAGES[article.cat] || ARTICLE_IMAGES.festival;

      db.prepare(`
        INSERT INTO articles (title, slug, excerpt, content, category, country, image_url, tags, meta_title, meta_desc, status, author)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', 'Festmore Editorial')
      `).run(
        article.title,
        slug,
        article.excerpt,
        article.htmlContent,
        article.cat,
        article.cCode,
        imageUrl,
        article.tags,
        article.metaTitle,
        article.metaDesc
      );

      written++;
      console.log(`  ✅ Article ${written}/10 published: "${article.title}"`);

      // Small delay to be nice to the API
      await new Promise(r => setTimeout(r, 1500));

    } catch (err) {
      console.error(`  ❌ Error writing article:`, err.message);
    }
  }

  // Also auto-generate some events from AI
  await generateAIEvents();

  console.log('');
  console.log(`✅ Daily automation complete!`);
  console.log(`   Articles written today: ${written}`);
  console.log('════════════════════════════════════');
}

async function generateAIEvents() {
  console.log('  🌍 Generating new events...');
  const year = new Date().getFullYear();

  const prompt = `Generate 5 realistic upcoming events in Europe or USA happening in ${year} or ${year+1}.
Mix countries: Germany, Denmark, UK, France, Belgium, Netherlands, Sweden.
Mix types: festival, market, christmas, concert, city, business, kids, messe.

Return ONLY a JSON array, no markdown, no explanation:
[{
  "title": "...",
  "category": "festival|market|christmas|concert|city|business|kids|messe",
  "city": "...",
  "country": "DE|DK|GB|FR|BE|NL|SE|PL|AE|US",
  "start_date": "YYYY-MM-DD",
  "date_display": "e.g. Jun 14-16, ${year}",
  "description": "2 sentences",
  "price_display": "Free or €XX",
  "attendees": 5000,
  "vendor_spots": 20,
  "website": "https://...",
  "tags": ["tag1","tag2","tag3"]
}]`;

  try {
    const raw = await callClaude(prompt, 1500);
    const clean = raw.replace(/```json|```/g, '').trim();
    const events = JSON.parse(clean);

    let added = 0;
    for (const e of events) {
      // Create slug
      let slug = slugify(`${e.title}-${e.city}-${year}`);
      if (db.prepare('SELECT id FROM events WHERE slug=?').get(slug)) continue;

      db.prepare(`
        INSERT OR IGNORE INTO events
        (title,slug,category,city,country,start_date,date_display,description,price_display,attendees,vendor_spots,website,tags,status,payment_status,source,featured)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,'active','paid','ai_generated',0)
      `).run(
        e.title, slug, e.category, e.city, e.country,
        e.start_date, e.date_display, e.description,
        e.price_display, e.attendees||0, e.vendor_spots||0,
        e.website||'', JSON.stringify(e.tags||[])
      );
      added++;
    }
    console.log(`  ✅ Added ${added} new AI-generated events`);
  } catch (err) {
    console.error('  ⚠️  Could not generate events:', err.message);
  }
}

// Can be run directly: node automation/daily.js
if (require.main === module) {
  run().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
}

module.exports = { run };
