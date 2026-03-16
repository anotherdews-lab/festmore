// utils/seo.js
// Central SEO helper — generates all meta tags, OG tags, structured data
// Used by all routes for consistent SEO across the site

const SITE_URL = process.env.SITE_URL || 'https://festmore.com';
const SITE_NAME = 'Festmore';
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200&q=80';

// ─────────────────────────────────────
// MAIN SEO HEAD GENERATOR
// ─────────────────────────────────────
function seoHead({ title, desc, canonical, image, type = 'website', noindex = false, schema = null }) {
  const fullTitle = title.includes('Festmore') ? title : title + ' | Festmore';
  const fullCanonical = canonical ? (canonical.startsWith('http') ? canonical : SITE_URL + canonical) : null;
  const ogImage = image || DEFAULT_IMAGE;

  return `
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>

<!-- Primary Meta -->
<title>${fullTitle}</title>
<meta name="description" content="${esc(desc)}"/>
<meta name="robots" content="${noindex ? 'noindex,nofollow' : 'index,follow'}"/>
<meta name="googlebot" content="${noindex ? 'noindex,nofollow' : 'index,follow'}"/>
${fullCanonical ? `<link rel="canonical" href="${fullCanonical}"/>` : ''}

<!-- Open Graph (Facebook, LinkedIn) -->
<meta property="og:type" content="${type}"/>
<meta property="og:site_name" content="${SITE_NAME}"/>
<meta property="og:title" content="${esc(fullTitle)}"/>
<meta property="og:description" content="${esc(desc)}"/>
<meta property="og:image" content="${ogImage}"/>
<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="630"/>
${fullCanonical ? `<meta property="og:url" content="${fullCanonical}"/>` : ''}

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:site" content="@festmore"/>
<meta name="twitter:title" content="${esc(fullTitle)}"/>
<meta name="twitter:description" content="${esc(desc)}"/>
<meta name="twitter:image" content="${ogImage}"/>

<!-- Geo targeting -->
<meta name="geo.region" content="EU"/>
<meta name="language" content="English"/>

<!-- Structured Data -->
${schema ? `<script type="application/ld+json">${JSON.stringify(schema, null, 0)}</script>` : ''}

<!-- Organisation Schema (on every page) -->
<script type="application/ld+json">${JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Festmore",
  "url": SITE_URL,
  "logo": SITE_URL + "/logo.png",
  "description": "Europe's festival and vendor marketplace connecting event organisers with verified vendors across 11 countries.",
  "sameAs": [
    "https://www.facebook.com/festmore",
    "https://www.instagram.com/festmore",
    "https://twitter.com/festmore"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "email": "hello@festmore.com",
    "contactType": "customer service"
  }
})}</script>
`.trim();
}

// ─────────────────────────────────────
// EVENT SCHEMA
// ─────────────────────────────────────
function eventSchema(e) {
  const COUNTRY_NAMES = { BE:'Belgium',CN:'China',DK:'Denmark',FR:'France',DE:'Germany',NL:'Netherlands',PL:'Poland',SE:'Sweden',AE:'United Arab Emirates',GB:'United Kingdom',US:'United States' };
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": e.title,
    "description": (e.description || '').substring(0, 300),
    "startDate": e.start_date,
    "endDate": e.end_date || e.start_date,
    "url": SITE_URL + '/events/' + e.slug,
    "image": e.image_url || DEFAULT_IMAGE,
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
    "location": {
      "@type": "Place",
      "name": e.address || e.city,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": e.city,
        "addressCountry": e.country,
        "addressRegion": COUNTRY_NAMES[e.country] || e.country,
      }
    },
    "organizer": {
      "@type": "Organization",
      "name": "Festmore",
      "url": SITE_URL
    },
    "offers": {
      "@type": "Offer",
      "price": e.price_from || 0,
      "priceCurrency": "EUR",
      "availability": "https://schema.org/InStock",
      "url": e.ticket_url || (SITE_URL + '/events/' + e.slug),
      "validFrom": new Date().toISOString().substring(0, 10)
    },
    "audience": {
      "@type": "Audience",
      "audienceType": "General Public"
    }
  };
}

// ─────────────────────────────────────
// ARTICLE SCHEMA
// ─────────────────────────────────────
function articleSchema(a) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": a.title,
    "description": a.excerpt || '',
    "image": a.image_url || DEFAULT_IMAGE,
    "datePublished": a.created_at,
    "dateModified": a.created_at,
    "url": SITE_URL + '/articles/' + a.slug,
    "author": {
      "@type": "Organization",
      "name": a.author || 'Festmore Editorial',
      "url": SITE_URL
    },
    "publisher": {
      "@type": "Organization",
      "name": "Festmore",
      "url": SITE_URL,
      "logo": {
        "@type": "ImageObject",
        "url": SITE_URL + "/logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": SITE_URL + '/articles/' + a.slug
    }
  };
}

// ─────────────────────────────────────
// HOME PAGE SCHEMA
// ─────────────────────────────────────
function homeSchema(stats) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Festmore",
    "url": SITE_URL,
    "description": "Europe's festival and vendor marketplace. Discover " + stats.events + "+ events across 11 countries.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": SITE_URL + "/events?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };
}

// ─────────────────────────────────────
// BREADCRUMB SCHEMA
// ─────────────────────────────────────
function breadcrumbSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": item.name,
      "item": item.url ? (item.url.startsWith('http') ? item.url : SITE_URL + item.url) : undefined
    }))
  };
}

// ─────────────────────────────────────
// FAQ SCHEMA (for article pages)
// ─────────────────────────────────────
function faqSchema(faqs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(f => ({
      "@type": "Question",
      "name": f.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.answer
      }
    }))
  };
}

function esc(str) {
  return (str || '').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

module.exports = { seoHead, eventSchema, articleSchema, homeSchema, breadcrumbSchema, faqSchema, SITE_URL, DEFAULT_IMAGE };