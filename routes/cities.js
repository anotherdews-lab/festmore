// routes/cities.js
// SEO City Pages — targets "events in [city] 2026" searches
// Covers 100+ cities across Europe and Asia

const express = require('express');
const router  = express.Router();
const db      = require('../db');

// ─── ALL CITIES DATA ───
const CITIES = [
  // ── GERMANY ──
  { slug:'berlin', name:'Berlin', country:'DE', flag:'🇩🇪', desc:'Germany\'s capital and cultural powerhouse', pop:'3.7M', known:'Techno clubs, Christmas markets, street art', img:'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1200&q=80' },
  { slug:'munich', name:'Munich', country:'DE', flag:'🇩🇪', desc:'Bavaria\'s vibrant capital and home of Oktoberfest', pop:'1.5M', known:'Oktoberfest, beer gardens, Christmas markets', img:'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&q=80' },
  { slug:'hamburg', name:'Hamburg', country:'DE', flag:'🇩🇪', desc:'Germany\'s gateway to the world and music city', pop:'1.8M', known:'Reeperbahn, harbour festivals, music scene', img:'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1200&q=80' },
  { slug:'cologne', name:'Cologne', country:'DE', flag:'🇩🇪', desc:'Rhine city famous for its carnival and Christmas markets', pop:'1.1M', known:'Cologne Carnival, Christmas markets, Cologne Cathedral', img:'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1200&q=80' },
  { slug:'frankfurt', name:'Frankfurt', country:'DE', flag:'🇩🇪', desc:'Germany\'s financial capital with world-class trade fairs', pop:'760K', known:'Book Fair, Motor Show, Christmas market', img:'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1200&q=80' },
  { slug:'nuremberg', name:'Nuremberg', country:'DE', flag:'🇩🇪', desc:'Historic Bavarian city with Germany\'s most famous Christmas market', pop:'515K', known:'Nuremberg Christmas Market, Toy Fair', img:'https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=1200&q=80' },
  { slug:'dusseldorf', name:'Düsseldorf', country:'DE', flag:'🇩🇪', desc:'Fashion and trade fair capital of the Rhine', pop:'620K', known:'Carnival, fashion weeks, trade fairs', img:'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1200&q=80' },
  { slug:'stuttgart', name:'Stuttgart', country:'DE', flag:'🇩🇪', desc:'Swabian city known for wine festivals and automotive culture', pop:'635K', known:'Stuttgart Wine Village, Christmas market', img:'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1200&q=80' },
  { slug:'dresden', name:'Dresden', country:'DE', flag:'🇩🇪', desc:'Baroque jewel on the Elbe with stunning Christmas markets', pop:'560K', known:'Striezelmarkt Christmas market, Semperoper', img:'https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=1200&q=80' },
  { slug:'leipzig', name:'Leipzig', country:'DE', flag:'🇩🇪', desc:'Saxony\'s music and book city', pop:'610K', known:'Leipzig Book Fair, Wave Gothic Festival', img:'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1200&q=80' },

  // ── DENMARK ──
  { slug:'copenhagen', name:'Copenhagen', country:'DK', flag:'🇩🇰', desc:'Denmark\'s vibrant capital — design, food and festivals', pop:'794K', known:'Distortion, Copenhagen Jazz, Roskilde nearby', img:'https://images.unsplash.com/photo-1531804894-39b2d87e2942?w=1200&q=80' },
  { slug:'aarhus', name:'Aarhus', country:'DK', flag:'🇩🇰', desc:'Denmark\'s second city and festival capital', pop:'285K', known:'Aarhus Festival, NorthSide, Smukfest', img:'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200&q=80' },
  { slug:'roskilde', name:'Roskilde', country:'DK', flag:'🇩🇰', desc:'Home of Scandinavia\'s greatest music festival', pop:'52K', known:'Roskilde Festival, Viking Ship Museum', img:'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1200&q=80' },
  { slug:'odense', name:'Odense', country:'DK', flag:'🇩🇰', desc:'Hans Christian Andersen\'s hometown with flower festivals', pop:'180K', known:'Odense Flower Festival, H.C. Andersen Festival', img:'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200&q=80' },
  { slug:'aalborg', name:'Aalborg', country:'DK', flag:'🇩🇰', desc:'North Jutland city famous for its carnival', pop:'115K', known:'Aalborg Carnival, Aalborg Regatta', img:'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200&q=80' },

  // ── NETHERLANDS ──
  { slug:'amsterdam', name:'Amsterdam', country:'NL', flag:'🇳🇱', desc:'The Netherlands\' canal city of festivals and culture', pop:'921K', known:'King\'s Day, Amsterdam Dance Event, Pride', img:'https://images.unsplash.com/photo-1534008897995-27a23e859048?w=1200&q=80' },
  { slug:'rotterdam', name:'Rotterdam', country:'NL', flag:'🇳🇱', desc:'Europe\'s largest port city and architectural marvel', pop:'651K', known:'North Sea Jazz, Rotterdam Marathon', img:'https://images.unsplash.com/photo-1534008897995-27a23e859048?w=1200&q=80' },
  { slug:'the-hague', name:'The Hague', country:'NL', flag:'🇳🇱', desc:'City of peace, justice and Vlaggetjesdag', pop:'548K', known:'Vlaggetjesdag Scheveningen, Tong Tong Fair', img:'https://images.unsplash.com/photo-1534008897995-27a23e859048?w=1200&q=80' },
  { slug:'utrecht', name:'Utrecht', country:'NL', flag:'🇳🇱', desc:'Medieval Dutch city with vibrant cultural scene', pop:'368K', known:'Le Guess Who festival, Utrecht Early Music', img:'https://images.unsplash.com/photo-1534008897995-27a23e859048?w=1200&q=80' },
  { slug:'eindhoven', name:'Eindhoven', country:'NL', flag:'🇳🇱', desc:'Design and technology capital of the Netherlands', pop:'235K', known:'Dutch Design Week, GLOW light festival', img:'https://images.unsplash.com/photo-1534008897995-27a23e859048?w=1200&q=80' },

  // ── UK ──
  { slug:'london', name:'London', country:'GB', flag:'🇬🇧', desc:'The world\'s greatest events city', pop:'9M', known:'Notting Hill Carnival, Glastonbury nearby, Wimbledon', img:'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&q=80' },
  { slug:'manchester', name:'Manchester', country:'GB', flag:'🇬🇧', desc:'England\'s music capital and festival city', pop:'553K', known:'Manchester International Festival, Parklife', img:'https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=1200&q=80' },
  { slug:'edinburgh', name:'Edinburgh', country:'GB', flag:'🇬🇧', desc:'Scotland\'s capital and home of the world\'s greatest arts festival', pop:'524K', known:'Edinburgh Festival Fringe, Hogmanay, Tattoo', img:'https://images.unsplash.com/photo-1506377872008-6645d9d29ef7?w=1200&q=80' },
  { slug:'bristol', name:'Bristol', country:'GB', flag:'🇬🇧', desc:'Creative hub and home of Europe\'s biggest hot air balloon festival', pop:'470K', known:'Bristol Balloon Fiesta, Love Saves the Day', img:'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200&q=80' },
  { slug:'glasgow', name:'Glasgow', country:'GB', flag:'🇬🇧', desc:'Scotland\'s largest city and music powerhouse', pop:'635K', known:'Celtic Connections, TRNSMT Festival', img:'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200&q=80' },
  { slug:'liverpool', name:'Liverpool', country:'GB', flag:'🇬🇧', desc:'Beatles city with legendary music festivals', pop:'500K', known:'Liverpool Sound City, Liverpool Biennial', img:'https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=1200&q=80' },

  // ── FRANCE ──
  { slug:'paris', name:'Paris', country:'FR', flag:'🇫🇷', desc:'The city of lights — fashion, food and festival', pop:'2.1M', known:'Bastille Day, Nuit Blanche, Paris Fashion Week', img:'https://images.unsplash.com/photo-1499856871958-5b9357976b82?w=1200&q=80' },
  { slug:'lyon', name:'Lyon', country:'FR', flag:'🇫🇷', desc:'France\'s gastronomic capital and festival of lights', pop:'516K', known:'Fête des Lumières, Nuits de Fourvière', img:'https://images.unsplash.com/photo-1499856871958-5b9357976b82?w=1200&q=80' },
  { slug:'marseille', name:'Marseille', country:'FR', flag:'🇫🇷', desc:'Mediterranean port city with vibrant cultural scene', pop:'862K', known:'Marseille-Provence festivals, Le Dock des Suds', img:'https://images.unsplash.com/photo-1499856871958-5b9357976b82?w=1200&q=80' },
  { slug:'bordeaux', name:'Bordeaux', country:'FR', flag:'🇫🇷', desc:'Wine capital of the world with magnificent wine festival', pop:'257K', known:'Bordeaux Wine Festival, Fête le Vin', img:'https://images.unsplash.com/photo-1499856871958-5b9357976b82?w=1200&q=80' },
  { slug:'nice', name:'Nice', country:'FR', flag:'🇫🇷', desc:'Riviera city famous for its legendary carnival', pop:'342K', known:'Nice Carnival, Nice Jazz Festival', img:'https://images.unsplash.com/photo-1499856871958-5b9357976b82?w=1200&q=80' },

  // ── SPAIN ──
  { slug:'barcelona', name:'Barcelona', country:'ES', flag:'🇪🇸', desc:'Catalonia\'s vibrant capital of music and architecture', pop:'1.6M', known:'Primavera Sound, Sónar, La Mercè', img:'https://images.unsplash.com/photo-1543783207-ec64e4d3a5c2?w=1200&q=80' },
  { slug:'madrid', name:'Madrid', country:'ES', flag:'🇪🇸', desc:'Spain\'s capital — flamenco, art and nightlife', pop:'3.3M', known:'Mad Cool Festival, San Isidro, Veranos de la Villa', img:'https://images.unsplash.com/photo-1543783207-ec64e4d3a5c2?w=1200&q=80' },
  { slug:'seville', name:'Seville', country:'ES', flag:'🇪🇸', desc:'Home of flamenco and Spain\'s most spectacular festivals', pop:'689K', known:'Feria de Abril, Semana Santa, Seville Jazz', img:'https://images.unsplash.com/photo-1543783207-ec64e4d3a5c2?w=1200&q=80' },
  { slug:'valencia', name:'Valencia', country:'ES', flag:'🇪🇸', desc:'City of fire — home of Las Fallas and La Tomatina', pop:'800K', known:'Las Fallas, La Tomatina nearby, Valencia Marathon', img:'https://images.unsplash.com/photo-1543783207-ec64e4d3a5c2?w=1200&q=80' },
  { slug:'bilbao', name:'Bilbao', country:'ES', flag:'🇪🇸', desc:'Basque city of gastronomy and contemporary art', pop:'346K', known:'Bilbao BBK Live, Aste Nagusia', img:'https://images.unsplash.com/photo-1543783207-ec64e4d3a5c2?w=1200&q=80' },

  // ── ITALY ──
  { slug:'rome', name:'Rome', country:'IT', flag:'🇮🇹', desc:'The Eternal City — history, culture and events', pop:'2.8M', known:'Estate Romana, RomaEuropa Festival', img:'https://images.unsplash.com/photo-1515542622106-078bda21d78d?w=1200&q=80' },
  { slug:'milan', name:'Milan', country:'IT', flag:'🇮🇹', desc:'Italy\'s fashion and design capital', pop:'1.4M', known:'Milan Fashion Week, Salone del Mobile, Milano City Sound', img:'https://images.unsplash.com/photo-1515542622106-078bda21d78d?w=1200&q=80' },
  { slug:'venice', name:'Venice', country:'IT', flag:'🇮🇹', desc:'The floating city — carnival and film festival', pop:'250K', known:'Venice Carnival, Venice Film Festival, Biennale', img:'https://images.unsplash.com/photo-1515542622106-078bda21d78d?w=1200&q=80' },
  { slug:'florence', name:'Florence', country:'IT', flag:'🇮🇹', desc:'Renaissance capital with magnificent Christmas markets', pop:'380K', known:'Florence Christmas Market, Estate Fiesolana', img:'https://images.unsplash.com/photo-1515542622106-078bda21d78d?w=1200&q=80' },
  { slug:'naples', name:'Naples', country:'IT', flag:'🇮🇹', desc:'Southern Italy\'s passionate city of food and music', pop:'960K', known:'Naples Pizza Festival, Napoli Teatro Festival', img:'https://images.unsplash.com/photo-1515542622106-078bda21d78d?w=1200&q=80' },

  // ── SWEDEN ──
  { slug:'stockholm', name:'Stockholm', country:'SE', flag:'🇸🇪', desc:'Scandinavia\'s stylish capital on the water', pop:'975K', known:'Stockholm Jazz Festival, Way Out West nearby, Pride', img:'https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=1200&q=80' },
  { slug:'gothenburg', name:'Gothenburg', country:'SE', flag:'🇸🇪', desc:'Sweden\'s second city and home of Way Out West', pop:'590K', known:'Way Out West, Gothenburg Film Festival', img:'https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=1200&q=80' },
  { slug:'malmo', name:'Malmö', country:'SE', flag:'🇸🇪', desc:'Southern Sweden\'s multicultural festival city', pop:'350K', known:'Malmöfestivalen, Sweden Rock nearby', img:'https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=1200&q=80' },

  // ── NORWAY ──
  { slug:'oslo', name:'Oslo', country:'NO', flag:'🇳🇴', desc:'Norway\'s capital of fjords and festivals', pop:'700K', known:'Øya Festival, Oslo Jazz, Constitution Day', img:'https://images.unsplash.com/photo-1531804894-39b2d87e2942?w=1200&q=80' },
  { slug:'bergen', name:'Bergen', country:'NO', flag:'🇳🇴', desc:'Gateway to the fjords and home of Bergen International Festival', pop:'285K', known:'Bergen International Festival, Bergenfest', img:'https://images.unsplash.com/photo-1531804894-39b2d87e2942?w=1200&q=80' },

  // ── FINLAND ──
  { slug:'helsinki', name:'Helsinki', country:'FI', flag:'🇫🇮', desc:'Finland\'s design capital on the Baltic Sea', pop:'658K', known:'Flow Festival, Helsinki Festival, Tuska', img:'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=1200&q=80' },
  { slug:'tampere', name:'Tampere', country:'FI', flag:'🇫🇮', desc:'Finland\'s second city known for its film and music festivals', pop:'244K', known:'Tampere Film Festival, Tammerfest', img:'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=1200&q=80' },

  // ── AUSTRIA ──
  { slug:'vienna', name:'Vienna', country:'AT', flag:'🇦🇹', desc:'Imperial capital of music, opera and Christmas markets', pop:'1.9M', known:'Vienna Christmas Market, Vienna Philharmonic, Opera Ball', img:'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200&q=80' },
  { slug:'salzburg', name:'Salzburg', country:'AT', flag:'🇦🇹', desc:'Mozart\'s birthplace and home of the world\'s greatest music festival', pop:'155K', known:'Salzburg Festival, Christmas markets', img:'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200&q=80' },
  { slug:'innsbruck', name:'Innsbruck', country:'AT', flag:'🇦🇹', desc:'Alpine city with magical Christmas markets', pop:'132K', known:'Innsbruck Christmas Market, Alpine festivals', img:'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200&q=80' },

  // ── SWITZERLAND ──
  { slug:'zurich', name:'Zurich', country:'CH', flag:'🇨🇭', desc:'Switzerland\'s largest city and Street Parade capital', pop:'434K', known:'Zurich Street Parade, Zurich Film Festival', img:'https://images.unsplash.com/photo-1527095009-9b403cb78eb1?w=1200&q=80' },
  { slug:'geneva', name:'Geneva', country:'CH', flag:'🇨🇭', desc:'International city on Lake Geneva', pop:'203K', known:'Geneva Motor Show, Fête de la Musique', img:'https://images.unsplash.com/photo-1527095009-9b403cb78eb1?w=1200&q=80' },
  { slug:'montreux', name:'Montreux', country:'CH', flag:'🇨🇭', desc:'Lakeside city home of the world\'s greatest jazz festival', pop:'26K', known:'Montreux Jazz Festival, Montreux Christmas Market', img:'https://images.unsplash.com/photo-1527095009-9b403cb78eb1?w=1200&q=80' },
  { slug:'basel', name:'Basel', country:'CH', flag:'🇨🇭', desc:'Switzerland\'s cultural capital on the Rhine', pop:'178K', known:'Art Basel, Basel Fasnacht Carnival, Basel World', img:'https://images.unsplash.com/photo-1527095009-9b403cb78eb1?w=1200&q=80' },

  // ── BELGIUM ──
  { slug:'brussels', name:'Brussels', country:'BE', flag:'🇧🇪', desc:'Capital of Europe with vibrant festival scene', pop:'1.2M', known:'Brussels Jazz Festival, Ommegang, Tomorrowland nearby', img:'https://images.unsplash.com/photo-1491893835020-f3e8c2c731c7?w=1200&q=80' },
  { slug:'ghent', name:'Ghent', country:'BE', flag:'🇧🇪', desc:'Medieval Belgian city home of Ghent Festivities', pop:'265K', known:'Ghent Festivities — one of Europe\'s largest street festivals', img:'https://images.unsplash.com/photo-1491893835020-f3e8c2c731c7?w=1200&q=80' },
  { slug:'bruges', name:'Bruges', country:'BE', flag:'🇧🇪', desc:'Fairy-tale medieval city with magical Christmas market', pop:'118K', known:'Bruges Christmas Market, Bruges Beer Festival', img:'https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=1200&q=80' },
  { slug:'antwerp', name:'Antwerp', country:'BE', flag:'🇧🇪', desc:'Fashion and diamond capital of Belgium near Tomorrowland', pop:'530K', known:'Tomorrowland nearby, Antwerp Pride, Sfinks Festival', img:'https://images.unsplash.com/photo-1491893835020-f3e8c2c731c7?w=1200&q=80' },

  // ── PORTUGAL ──
  { slug:'lisbon', name:'Lisbon', country:'PT', flag:'🇵🇹', desc:'Portugal\'s sun-soaked capital of fado and festivals', pop:'545K', known:'NOS Alive, Festa de Lisboa, Rock in Rio Lisbon', img:'https://images.unsplash.com/photo-1558642891-54be180ea339?w=1200&q=80' },
  { slug:'porto', name:'Porto', country:'PT', flag:'🇵🇹', desc:'Port wine city with incredible street festivals', pop:'237K', known:'Festa de São João, NOS Primavera Sound', img:'https://images.unsplash.com/photo-1558642891-54be180ea339?w=1200&q=80' },

  // ── IRELAND ──
  { slug:'dublin', name:'Dublin', country:'IE', flag:'🇮🇪', desc:'Ireland\'s craic capital — pubs, music and St Patrick\'s Day', pop:'1.2M', known:'St Patrick\'s Day, Electric Picnic nearby, Dublin Fringe', img:'https://images.unsplash.com/photo-1591951425600-1890bab87f0e?w=1200&q=80' },
  { slug:'galway', name:'Galway', country:'IE', flag:'🇮🇪', desc:'Ireland\'s festival city on the wild Atlantic Way', pop:'83K', known:'Galway International Arts Festival, Galway Races', img:'https://images.unsplash.com/photo-1591951425600-1890bab87f0e?w=1200&q=80' },

  // ── CZECH REPUBLIC ──
  { slug:'prague', name:'Prague', country:'CZ', flag:'🇨🇿', desc:'The golden city of a hundred spires and magical Christmas markets', pop:'1.3M', known:'Prague Christmas Market, Prague Spring, Colours of Ostrava', img:'https://images.unsplash.com/photo-1541849546-216549ae216d?w=1200&q=80' },
  { slug:'brno', name:'Brno', country:'CZ', flag:'🇨🇿', desc:'Moravian capital with growing festival scene', pop:'380K', known:'Brno International Music Festival, Motoshow', img:'https://images.unsplash.com/photo-1541849546-216549ae216d?w=1200&q=80' },

  // ── HUNGARY ──
  { slug:'budapest', name:'Budapest', country:'HU', flag:'🇭🇺', desc:'Pearl of the Danube — thermal baths and Sziget Festival', pop:'1.75M', known:'Sziget Festival, Budapest Wine Festival, Christmas Market', img:'https://images.unsplash.com/photo-1541969359765-0b5fd6c99f4d?w=1200&q=80' },

  // ── POLAND ──
  { slug:'warsaw', name:'Warsaw', country:'PL', flag:'🇵🇱', desc:'Poland\'s resilient capital with thriving festival scene', pop:'1.8M', known:'Warsaw Film Festival, Open\'er Festival, Chopin Festival', img:'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=1200&q=80' },
  { slug:'krakow', name:'Kraków', country:'PL', flag:'🇵🇱', desc:'Poland\'s cultural capital and festival heartland', pop:'780K', known:'Kraków Live Music Festival, Jewish Culture Festival', img:'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=1200&q=80' },
  { slug:'wroclaw', name:'Wrocław', country:'PL', flag:'🇵🇱', desc:'City of bridges with vibrant cultural festivals', pop:'640K', known:'Wrocław Industrial Festival, Wrocław Jazz', img:'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=1200&q=80' },
  { slug:'gdansk', name:'Gdańsk', country:'PL', flag:'🇵🇱', desc:'Baltic port city with rich history and summer festivals', pop:'470K', known:'Open\'er Festival, Solidarity of Arts', img:'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=1200&q=80' },
  { slug:'poznan', name:'Poznań', country:'PL', flag:'🇵🇱', desc:'Trade fair capital of Poland', pop:'540K', known:'Poznań International Fair, Malta Festival', img:'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=1200&q=80' },
  { slug:'kostrzyn', name:'Kostrzyn nad Odrą', country:'PL', flag:'🇵🇱', desc:'Home of Pol\'and\'Rock — Europe\'s greatest free festival', pop:'18K', known:"Pol'and'Rock Festival, Woodstock Poland", img:'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=1200&q=80' },

  // ── GREECE ──
  { slug:'athens', name:'Athens', country:'GR', flag:'🇬🇷', desc:'Cradle of civilisation with ancient theatre festivals', pop:'3.7M', known:'Athens Epidaurus Festival, Athens International Film Festival', img:'https://images.unsplash.com/photo-1555993539-1732b0258235?w=1200&q=80' },
  { slug:'thessaloniki', name:'Thessaloniki', country:'GR', flag:'🇬🇷', desc:'Greece\'s food capital and festival city', pop:'1.1M', known:'Thessaloniki Film Festival, Thessaloniki International Fair', img:'https://images.unsplash.com/photo-1555993539-1732b0258235?w=1200&q=80' },

  // ── CROATIA ──
  { slug:'zagreb', name:'Zagreb', country:'HR', flag:'🇭🇷', desc:'Croatia\'s charming capital with Christmas markets and festivals', pop:'800K', known:'INmusic Festival, Zagreb Christmas Market, Cest is d\'Best', img:'https://images.unsplash.com/photo-1555990793-da11153b5d37?w=1200&q=80' },
  { slug:'split', name:'Split', country:'HR', flag:'🇭🇷', desc:'Dalmatian coast city with Ultra Europe festival', pop:'178K', known:'Ultra Europe, Split Summer Festival', img:'https://images.unsplash.com/photo-1555990793-da11153b5d37?w=1200&q=80' },
  { slug:'dubrovnik', name:'Dubrovnik', country:'HR', flag:'🇭🇷', desc:'Pearl of the Adriatic with summer arts festival', pop:'42K', known:'Dubrovnik Summer Festival, Game of Thrones filming location', img:'https://images.unsplash.com/photo-1555990793-da11153b5d37?w=1200&q=80' },

  // ── UAE ──
  { slug:'dubai', name:'Dubai', country:'AE', flag:'🇦🇪', desc:'The city of the future — mega events and luxury festivals', pop:'3.5M', known:'Dubai Shopping Festival, Dubai Food Festival, New Year fireworks', img:'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=80' },
  { slug:'abu-dhabi', name:'Abu Dhabi', country:'AE', flag:'🇦🇪', desc:'UAE\'s capital with world-class cultural events', pop:'1.5M', known:'Abu Dhabi Film Festival, Formula 1 Grand Prix', img:'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=80' },

  // ── USA ──
  { slug:'new-york', name:'New York', country:'US', flag:'🇺🇸', desc:'The city that never sleeps — events 365 days a year', pop:'8.3M', known:'New York Marathon, NYC Pride, Governors Ball', img:'https://images.unsplash.com/photo-1490644658840-3f2e3f8c5625?w=1200&q=80' },
  { slug:'los-angeles', name:'Los Angeles', country:'US', flag:'🇺🇸', desc:'Hollywood\'s entertainment capital', pop:'4M', known:'Coachella nearby, LA Film Festival, LA Pride', img:'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=1200&q=80' },
  { slug:'chicago', name:'Chicago', country:'US', flag:'🇺🇸', desc:'The Windy City of blues, jazz and summer festivals', pop:'2.7M', known:'Lollapalooza, Chicago Jazz Festival, Taste of Chicago', img:'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200&q=80' },

  // ── INDIA ──
  { slug:'mumbai', name:'Mumbai', country:'IN', flag:'🇮🇳', desc:'India\'s maximum city — Bollywood, Diwali and beach festivals', pop:'20M', known:'Diwali, Ganesh Chaturthi, Sunburn Goa nearby', img:'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200&q=80' },
  { slug:'delhi', name:'Delhi', country:'IN', flag:'🇮🇳', desc:'India\'s capital of history, culture and festivals', pop:'32M', known:'Diwali, Holi, Delhi International Arts Festival', img:'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200&q=80' },
  { slug:'jaipur', name:'Jaipur', country:'IN', flag:'🇮🇳', desc:'The Pink City — Rajasthani festivals and culture', pop:'3.1M', known:'Jaipur Literature Festival, Diwali, Jaipur Kite Festival', img:'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200&q=80' },
  { slug:'goa', name:'Goa', country:'IN', flag:'🇮🇳', desc:'India\'s beach paradise and electronic music capital', pop:'1.5M', known:'Sunburn Festival, Goa Carnival, New Year celebrations', img:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80' },
  { slug:'varanasi', name:'Varanasi', country:'IN', flag:'🇮🇳', desc:'India\'s spiritual capital on the sacred Ganges', pop:'1.2M', known:'Dev Deepawali, Ganga Mahotsav, Kashi Utsav', img:'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200&q=80' },

  // ── THAILAND ──
  { slug:'bangkok', name:'Bangkok', country:'TH', flag:'🇹🇭', desc:'Thailand\'s vibrant capital of temples and street festivals', pop:'10.7M', known:'Songkran, Loy Krathong, Bangkok International Film Festival', img:'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1200&q=80' },
  { slug:'chiang-mai', name:'Chiang Mai', country:'TH', flag:'🇹🇭', desc:'Northern Thailand\'s festival capital — lanterns and water fights', pop:'200K', known:'Yi Peng Lantern Festival, Songkran, Flower Festival', img:'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=1200&q=80' },
  { slug:'phuket', name:'Phuket', country:'TH', flag:'🇹🇭', desc:'Thailand\'s island paradise with Full Moon parties and festivals', pop:'400K', known:'Vegetarian Festival, Phuket Old Town Festival, Full Moon Party', img:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80' },

  // ── JAPAN ──
  { slug:'tokyo', name:'Tokyo', country:'JP', flag:'🇯🇵', desc:'Japan\'s electric capital of festivals and cherry blossoms', pop:'14M', known:'Cherry Blossom, Awa Odori, Fuji Rock nearby', img:'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1200&q=80' },
  { slug:'kyoto', name:'Kyoto', country:'JP', flag:'🇯🇵', desc:'Japan\'s ancient capital of temples and Gion Matsuri', pop:'1.5M', known:'Gion Matsuri, Jidai Matsuri, Cherry Blossom', img:'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1200&q=80' },
  { slug:'osaka', name:'Osaka', country:'JP', flag:'🇯🇵', desc:'Japan\'s food capital and vibrant festival city', pop:'2.7M', known:'Tenjin Matsuri, Osaka Jazz Festival, Cherry Blossom', img:'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1200&q=80' },
  { slug:'sapporo', name:'Sapporo', country:'JP', flag:'🇯🇵', desc:'Hokkaido\'s capital famous for its Snow Festival', pop:'1.9M', known:'Sapporo Snow Festival, Yosakoi Soran, Sapporo Autumn Fest', img:'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&q=80' },
];

// Build lookup map
const CITY_MAP = {};
CITIES.forEach(c => { CITY_MAP[c.slug] = c; });

const FLAGS_MAP = {
  DE:'🇩🇪',DK:'🇩🇰',NL:'🇳🇱',GB:'🇬🇧',FR:'🇫🇷',ES:'🇪🇸',IT:'🇮🇹',SE:'🇸🇪',
  NO:'🇳🇴',FI:'🇫🇮',AT:'🇦🇹',CH:'🇨🇭',BE:'🇧🇪',PT:'🇵🇹',IE:'🇮🇪',CZ:'🇨🇿',
  HU:'🇭🇺',PL:'🇵🇱',GR:'🇬🇷',HR:'🇭🇷',AE:'🇦🇪',US:'🇺🇸',IN:'🇮🇳',TH:'🇹🇭',JP:'🇯🇵',
};
const COUNTRY_NAMES_MAP = {
  DE:'Germany',DK:'Denmark',NL:'Netherlands',GB:'United Kingdom',FR:'France',ES:'Spain',
  IT:'Italy',SE:'Sweden',NO:'Norway',FI:'Finland',AT:'Austria',CH:'Switzerland',
  BE:'Belgium',PT:'Portugal',IE:'Ireland',CZ:'Czech Republic',HU:'Hungary',PL:'Poland',
  GR:'Greece',HR:'Croatia',AE:'UAE',US:'USA',IN:'India',TH:'Thailand',JP:'Japan',
};

// ─────────────────────────────────────
// CITY LISTING — /events/in
// ─────────────────────────────────────
router.get('/', (req, res) => {
  const citiesByCountry = {};
  CITIES.forEach(c => {
    if (!citiesByCountry[c.country]) citiesByCountry[c.country] = [];
    citiesByCountry[c.country].push(c);
  });

  res.send(`<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Events by City 2026 — Festivals & Markets Worldwide | Festmore</title>
<meta name="description" content="Find events, festivals and markets in cities across Europe, India, Japan and Thailand. Browse events by city — Berlin, London, Paris, Tokyo and 100+ more cities."/>
<meta name="robots" content="index,follow"/>
<link rel="canonical" href="https://festmore.com/events/in"/>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/>
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2486135003689222" crossorigin="anonymous"></script>
<link rel="stylesheet" href="/css/main.css"/>
</head><body>
${renderNav(req.session.user)}

<div style="background:var(--ink);padding:64px 0;position:relative;overflow:hidden;">
  <div style="position:absolute;inset:0;background:radial-gradient(ellipse 60% 80% at 70% 50%,rgba(232,71,10,.12) 0%,transparent 70%);"></div>
  <div class="container" style="position:relative;text-align:center;">
    <div style="display:inline-flex;align-items:center;gap:8px;background:rgba(232,71,10,.12);border:1px solid rgba(232,71,10,.25);color:#ff7043;font-size:11px;font-weight:700;padding:4px 14px;border-radius:99px;margin-bottom:16px;letter-spacing:.8px;text-transform:uppercase;">🌍 Browse by City</div>
    <h1 style="font-family:'DM Serif Display',serif;font-size:clamp(32px,5vw,56px);font-weight:400;color:#fff;margin-bottom:12px;">Events in Every City</h1>
    <p style="color:rgba(255,255,255,.5);font-size:17px;max-width:560px;margin:0 auto;">Find festivals, markets and events in ${CITIES.length}+ cities across Europe, India, Japan and Thailand.</p>
  </div>
</div>

<div class="container" style="padding:48px 0;">
  ${Object.entries(citiesByCountry).map(([country, cities]) => `
  <div style="margin-bottom:40px;">
    <h2 style="font-family:'DM Serif Display',serif;font-size:22px;font-weight:400;color:var(--ink);margin-bottom:16px;padding-bottom:10px;border-bottom:2px solid var(--border);">
      ${FLAGS_MAP[country] || ''} ${COUNTRY_NAMES_MAP[country] || country}
    </h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;">
      ${cities.map(c => `
      <a href="/events/in/${c.slug}" style="background:#fff;border:1px solid var(--border);border-radius:12px;padding:14px 16px;text-decoration:none;display:flex;align-items:center;gap:10px;transition:all .2s;" onmouseover="this.style.borderColor='var(--flame)';this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='var(--border)';this.style.transform=''">
        <span style="font-size:22px;">${c.flag}</span>
        <div>
          <div style="font-size:14px;font-weight:700;color:var(--ink);">${c.name}</div>
          <div style="font-size:11px;color:var(--ink4);">Events 2026</div>
        </div>
      </a>`).join('')}
    </div>
  </div>`).join('')}
</div>

${renderFooter()}
</body></html>`);
});

// ─────────────────────────────────────
// INDIVIDUAL CITY PAGE — /events/in/:city
// ─────────────────────────────────────
router.get('/:city', (req, res) => {
  const citySlug = req.params.city.toLowerCase();
  const city = CITY_MAP[citySlug];

  if (!city) {
    // Try to find by name
    const found = CITIES.find(c => c.name.toLowerCase() === citySlug.replace(/-/g,' '));
    if (!found) return res.redirect('/events/in');
    return res.redirect('/events/in/' + found.slug);
  }

  // Get events for this city or country
  const cityEvents = db.prepare(`
    SELECT * FROM events
    WHERE status='active'
    AND (
      LOWER(city) LIKE ?
      OR country=?
    )
    ORDER BY featured DESC, attendees DESC
    LIMIT 12
  `).all(`%${city.name.toLowerCase()}%`, city.country);

  // Get nearby cities (same country)
  const nearbyCities = CITIES.filter(c => c.country === city.country && c.slug !== city.slug).slice(0, 6);

  // Get all events in same country as fallback
  const countryEvents = cityEvents.length < 6
    ? db.prepare(`SELECT * FROM events WHERE status='active' AND country=? ORDER BY featured DESC, attendees DESC LIMIT 12`).all(city.country)
    : cityEvents;

  const showEvents = cityEvents.length > 0 ? cityEvents : countryEvents;

  const year = new Date().getFullYear();
  const nextYear = year + 1;

  res.send(renderCityPage({ city, showEvents, nearbyCities, year, nextYear, user: req.session.user }));
});

module.exports = router;
module.exports.CITIES = CITIES;

// ─────────────────────────────────────
// RENDER CITY PAGE
// ─────────────────────────────────────
function renderCityPage({ city, showEvents, nearbyCities, year, nextYear, user }) {
  const IMGS = {
    festival:'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&q=75',
    concert:'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=75',
    market:'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=75',
    christmas:'https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=600&q=75',
    city:'https://images.unsplash.com/photo-1467803738586-46b7eb7b16a1?w=600&q=75',
    festival2:'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=600&q=75',
  };

  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Events in ${city.name} ${nextYear} — Festivals, Markets &amp; Concerts | Festmore</title>
<meta name="description" content="Discover the best events in ${city.name} ${nextYear}. Festivals, markets, concerts and more in ${city.name}, ${COUNTRY_NAMES_MAP[city.country]}. ${city.known}."/>
<meta name="robots" content="index,follow"/>
<link rel="canonical" href="https://festmore.com/events/in/${city.slug}"/>
<meta property="og:title" content="Events in ${city.name} ${nextYear} | Festmore"/>
<meta property="og:description" content="Best events in ${city.name} ${nextYear}: ${city.known}"/>
<meta property="og:image" content="${city.img}"/>
<meta property="og:type" content="website"/>
<script type="application/ld+json">${JSON.stringify({
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": `Events in ${city.name} ${nextYear}`,
  "description": `Best festivals, markets and events in ${city.name} ${nextYear}`,
  "url": `https://festmore.com/events/in/${city.slug}`,
  "numberOfItems": showEvents.length,
  "itemListElement": showEvents.map((e, i) => ({
    "@type": "ListItem",
    "position": i + 1,
    "name": e.title,
    "url": `https://festmore.com/events/${e.slug}`
  }))
})}</script>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/>
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2486135003689222" crossorigin="anonymous"></script>
<link rel="stylesheet" href="/css/main.css"/>
<style>
.city-hero{height:360px;position:relative;overflow:hidden;}
.city-hero img{width:100%;height:100%;object-fit:cover;}
.city-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(10,10,10,.95) 0%,rgba(10,10,10,.4) 60%,transparent 100%);}
.city-hero-content{position:absolute;bottom:0;left:0;right:0;padding:40px;}
.city-grid{display:grid;grid-template-columns:1fr 320px;gap:40px;padding:48px 0;align-items:start;}
.city-event-card{background:#fff;border:1px solid var(--border);border-radius:16px;overflow:hidden;display:flex;gap:0;transition:all .2s;text-decoration:none;margin-bottom:16px;}
.city-event-card:hover{border-color:var(--flame);box-shadow:0 8px 32px rgba(26,22,18,.1);transform:translateY(-2px);}
.city-event-img{width:130px;flex-shrink:0;overflow:hidden;}
.city-event-img img{width:100%;height:100%;object-fit:cover;}
.city-event-body{padding:16px;flex:1;}
.city-event-cat{font-size:11px;font-weight:700;color:var(--flame);text-transform:uppercase;letter-spacing:.6px;margin-bottom:5px;}
.city-event-title{font-family:'DM Serif Display',serif;font-size:17px;font-weight:400;color:var(--ink);margin-bottom:5px;line-height:1.3;}
.city-event-date{font-size:12px;color:var(--ink3);}
.nearby-card{display:flex;align-items:center;gap:10px;padding:12px;border:1px solid var(--border);border-radius:10px;text-decoration:none;transition:all .2s;background:#fff;margin-bottom:8px;}
.nearby-card:hover{border-color:var(--flame);background:rgba(232,71,10,.03);}
@media(max-width:768px){.city-grid{grid-template-columns:1fr;}.city-hero-content{padding:24px;}}
</style>
</head><body>
${renderNav(user)}

<!-- BREADCRUMB -->
<div style="background:var(--ivory);border-bottom:1px solid var(--border);padding:12px 0;">
  <div class="container" style="font-size:13px;color:var(--ink3);">
    <a href="/" style="color:var(--ink3);text-decoration:none;">Home</a> →
    <a href="/events" style="color:var(--ink3);text-decoration:none;"> Events</a> →
    <a href="/events/in" style="color:var(--ink3);text-decoration:none;"> Cities</a> →
    <a href="/events?country=${city.country}" style="color:var(--ink3);text-decoration:none;"> ${FLAGS_MAP[city.country]} ${COUNTRY_NAMES_MAP[city.country]}</a> →
    <strong style="color:var(--ink);"> ${city.name}</strong>
  </div>
</div>

<!-- HERO -->
<div class="city-hero">
  <img src="${city.img}" alt="Events in ${city.name}"/>
  <div class="city-overlay"></div>
  <div class="city-hero-content">
    <div class="container">
      <div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;">
        <span style="background:rgba(255,255,255,.15);color:#fff;padding:4px 12px;border-radius:99px;font-size:12px;font-weight:700;">${city.flag} ${COUNTRY_NAMES_MAP[city.country]}</span>
        <span style="background:#e8470a;color:#fff;padding:4px 12px;border-radius:99px;font-size:12px;font-weight:700;">Events ${nextYear}</span>
      </div>
      <h1 style="font-family:'DM Serif Display',serif;font-size:clamp(28px,5vw,52px);font-weight:400;color:#fff;margin-bottom:8px;">
        Events in ${city.name} ${nextYear}
      </h1>
      <p style="color:rgba(255,255,255,.65);font-size:15px;">
        ${city.desc} · Known for: ${city.known}
      </p>
    </div>
  </div>
</div>

<div class="container" style="max-width:1100px;">
  <div class="city-grid">

    <!-- MAIN CONTENT -->
    <div>

      <!-- QUICK LINKS -->
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:28px;padding-top:28px;">
        <a href="/events?city=${encodeURIComponent(city.name)}" style="background:var(--flame);color:#fff;padding:8px 18px;border-radius:99px;font-size:13px;font-weight:700;text-decoration:none;">All Events</a>
        <a href="/events?category=festival&country=${city.country}" style="background:var(--ivory);border:1px solid var(--border);color:var(--ink2);padding:8px 18px;border-radius:99px;font-size:13px;font-weight:600;text-decoration:none;">🎪 Festivals</a>
        <a href="/events?category=concert&country=${city.country}" style="background:var(--ivory);border:1px solid var(--border);color:var(--ink2);padding:8px 18px;border-radius:99px;font-size:13px;font-weight:600;text-decoration:none;">🎵 Concerts</a>
        <a href="/events?category=market&country=${city.country}" style="background:var(--ivory);border:1px solid var(--border);color:var(--ink2);padding:8px 18px;border-radius:99px;font-size:13px;font-weight:600;text-decoration:none;">🛍️ Markets</a>
        <a href="/events?category=christmas&country=${city.country}" style="background:var(--ivory);border:1px solid var(--border);color:var(--ink2);padding:8px 18px;border-radius:99px;font-size:13px;font-weight:600;text-decoration:none;">🎄 Xmas Markets</a>
        <a href="/events?price=free&country=${city.country}" style="background:var(--ivory);border:1px solid var(--border);color:var(--ink2);padding:8px 18px;border-radius:99px;font-size:13px;font-weight:600;text-decoration:none;">🆓 Free</a>
      </div>

      <ins class="adsbygoogle" style="display:block;margin-bottom:24px;" data-ad-client="ca-pub-2486135003689222" data-ad-format="auto" data-full-width-responsive="true"></ins>
      <script>(adsbygoogle=window.adsbygoogle||[]).push({});</script>

      <!-- EVENTS LIST -->
      <h2 style="font-family:'DM Serif Display',serif;font-size:24px;font-weight:400;margin-bottom:20px;">
        ${showEvents.length > 0 ? `Events in ${city.name} & ${COUNTRY_NAMES_MAP[city.country]} ${nextYear}` : `Upcoming Events in ${COUNTRY_NAMES_MAP[city.country]} ${nextYear}`}
      </h2>

      ${showEvents.length > 0 ? showEvents.map(e => {
        const img = e.image_url || IMGS[e.category] || IMGS.festival;
        const isFree = e.price_display === 'Free' || e.price_display === 'Free Entry';
        return `<a href="/events/${e.slug}" class="city-event-card">
          <div class="city-event-img"><img src="${img}" alt="${e.title}" loading="lazy"/></div>
          <div class="city-event-body">
            <div class="city-event-cat">${e.category}</div>
            <div class="city-event-title">${e.title}</div>
            <div class="city-event-date">📅 ${e.date_display || e.start_date} · 📍 ${e.city}</div>
            <div style="margin-top:8px;display:flex;gap:8px;align-items:center;">
              <span style="background:${isFree?'#dcfce7':'var(--ivory)'};color:${isFree?'#15803d':'var(--ink3)'};padding:3px 10px;border-radius:99px;font-size:11px;font-weight:700;">${isFree?'🟢 Free':e.price_display||'See website'}</span>
              ${e.attendees ? `<span style="font-size:12px;color:var(--ink4);">👥 ${e.attendees.toLocaleString()}</span>` : ''}
            </div>
          </div>
        </a>`;
      }).join('') : `
      <div style="text-align:center;padding:48px;background:#fff;border-radius:16px;border:1px solid var(--border);">
        <div style="font-size:40px;margin-bottom:12px;">🔍</div>
        <h3 style="font-family:'DM Serif Display',serif;font-size:20px;font-weight:400;margin-bottom:8px;">No events listed yet for ${city.name}</h3>
        <p style="color:var(--ink3);margin-bottom:20px;">Be the first to list an event in ${city.name}!</p>
        <a href="/events/submit" class="btn btn-primary">List Your Event →</a>
      </div>`}

      <!-- SEO CONTENT SECTION -->
      <div style="background:#fff;border:1px solid var(--border);border-radius:20px;padding:32px;margin-top:32px;">
        <h2 style="font-family:'DM Serif Display',serif;font-size:22px;font-weight:400;margin-bottom:16px;">
          About Events in ${city.name}
        </h2>
        <div style="font-size:15px;line-height:1.85;color:var(--ink2);">
          <p>${city.name} is ${city.desc}. The city is particularly known for ${city.known}, making it one of ${COUNTRY_NAMES_MAP[city.country]}'s premier destinations for event-goers and festival fans.</p>
          <p>Whether you're looking for music festivals, local markets, Christmas markets or cultural events, ${city.name} offers a rich calendar of events throughout the year. The city's vibrant atmosphere, combined with its unique cultural heritage, makes every event in ${city.name} a special experience.</p>
          <p>Festmore lists festivals, markets, concerts, exhibitions and more in ${city.name} and across ${COUNTRY_NAMES_MAP[city.country]}. Event organisers can list their ${city.name} events for free, or choose a paid plan for maximum visibility.</p>
          <h3 style="font-family:'DM Serif Display',serif;font-size:18px;font-weight:400;margin-top:20px;margin-bottom:10px;">Popular Events in ${city.name}</h3>
          <p>Some of the most popular events and festivals associated with ${city.name} include: ${city.known}. These events attract visitors from across ${COUNTRY_NAMES_MAP[city.country]} and from international destinations, contributing significantly to the city's cultural and economic life.</p>
          <h3 style="font-family:'DM Serif Display',serif;font-size:18px;font-weight:400;margin-top:20px;margin-bottom:10px;">List Your ${city.name} Event on Festmore</h3>
          <p>Are you organising an event in ${city.name}? List it on Festmore and reach thousands of visitors searching for events in ${city.name} and ${COUNTRY_NAMES_MAP[city.country]}. Free listings are available — or choose Standard (€79/yr) or Premium (€149/yr) for maximum visibility.</p>
        </div>
        <div style="margin-top:20px;display:flex;gap:12px;flex-wrap:wrap;">
          <a href="/events/submit" class="btn btn-primary">List Your ${city.name} Event →</a>
          <a href="/events?country=${city.country}" class="btn btn-outline">All ${COUNTRY_NAMES_MAP[city.country]} Events →</a>
        </div>
      </div>
    </div>

    <!-- SIDEBAR -->
    <aside style="padding-top:28px;">
      <!-- NEARBY CITIES -->
      ${nearbyCities.length ? `
      <div style="background:#fff;border:1px solid var(--border);border-radius:16px;padding:22px;margin-bottom:16px;">
        <h3 style="font-family:'DM Serif Display',serif;font-size:17px;font-weight:400;margin-bottom:14px;">
          More Cities in ${FLAGS_MAP[city.country]} ${COUNTRY_NAMES_MAP[city.country]}
        </h3>
        ${nearbyCities.map(nc => `
        <a href="/events/in/${nc.slug}" class="nearby-card">
          <span style="font-size:20px;">${nc.flag}</span>
          <div>
            <div style="font-size:14px;font-weight:700;color:var(--ink);">${nc.name}</div>
            <div style="font-size:12px;color:var(--ink4);">Events ${new Date().getFullYear() + 1}</div>
          </div>
        </a>`).join('')}
      </div>` : ''}

      <!-- LIST EVENT CTA -->
      <div style="background:var(--ink);border-radius:16px;padding:24px;color:#fff;margin-bottom:16px;">
        <h4 style="font-family:'DM Serif Display',serif;font-size:17px;font-weight:400;margin-bottom:8px;">
          Organising an event in ${city.name}?
        </h4>
        <p style="font-size:13px;color:rgba(255,255,255,.5);margin-bottom:16px;">List it on Festmore and get discovered by thousands of visitors searching for events in ${city.name}.</p>
        <a href="/events/submit" class="btn btn-primary" style="display:block;text-align:center;font-size:13px;">List Your Event →</a>
        <a href="/events/pricing" style="display:block;text-align:center;color:rgba(255,255,255,.35);font-size:12px;margin-top:8px;text-decoration:none;">View pricing →</a>
      </div>

      <!-- VENDOR CTA -->
      <div style="background:linear-gradient(135deg,#0d1f15,#1a3d28);border:1px solid rgba(74,124,89,.3);border-radius:16px;padding:24px;color:#fff;margin-bottom:16px;">
        <h4 style="font-family:'DM Serif Display',serif;font-size:17px;font-weight:400;margin-bottom:8px;">
          Are you a vendor in ${city.name}?
        </h4>
        <p style="font-size:13px;color:rgba(255,255,255,.5);margin-bottom:16px;">Get discovered by event organisers looking for vendors in ${city.name}. €49/year.</p>
        <a href="/vendors/register" style="display:block;text-align:center;background:#fff;color:#1a3d28;padding:12px;border-radius:10px;font-size:13px;font-weight:700;text-decoration:none;">Become a Vendor →</a>
      </div>

      <ins class="adsbygoogle" style="display:block;" data-ad-client="ca-pub-2486135003689222" data-ad-format="auto" data-full-width-responsive="true"></ins>
      <script>(adsbygoogle=window.adsbygoogle||[]).push({});</script>
    </aside>
  </div>
</div>

${renderFooter()}
</body></html>`;
}

function renderNav(user) {
  return `<nav class="main-nav"><div class="nav-inner"><a href="/" class="logo"><span class="logo-fest">Fest</span><span class="logo-more">more</span><span class="logo-dot"></span></a><form class="nav-search" action="/events" method="GET"><span style="color:var(--ink4);font-size:15px;">🔍</span><input type="text" name="q" placeholder="Search events…"/></form><div class="nav-right">${user?`<a href="/dashboard" class="btn btn-outline btn-sm">Dashboard</a><a href="/auth/logout" class="btn btn-ghost btn-sm">Logout</a>`:`<a href="/auth/login" class="btn btn-outline btn-sm">Login</a><a href="/events/submit" class="btn btn-primary btn-sm">+ List Event</a>`}</div><button class="nav-burger" onclick="document.querySelector('.nav-mobile').classList.toggle('open')">☰</button></div><div class="nav-cats-bar"><a href="/events" class="nav-cat">🌍 All</a><a href="/events?category=festival" class="nav-cat">🎪 Festivals</a><a href="/events?category=market" class="nav-cat">🛍️ Markets</a><a href="/events?category=christmas" class="nav-cat">🎄 Xmas Markets</a><a href="/events?category=concert" class="nav-cat">🎵 Concerts</a><a href="/articles" class="nav-cat">📰 Articles</a><a href="/vendors" class="nav-cat">🏪 Vendors</a><a href="/events/in" class="nav-cat">📍 Cities</a><a href="/contact" class="nav-cat">✉️ Contact</a></div></nav>`;
}

function renderFooter() {
  return `<footer><div class="footer-bottom"><span>© ${new Date().getFullYear()} Festmore.com — All rights reserved</span><div style="display:flex;gap:20px;flex-wrap:wrap;"><a href="/" style="color:rgba(255,255,255,.35);font-size:13px;">Home</a><a href="/events" style="color:rgba(255,255,255,.35);font-size:13px;">Events</a><a href="/events/in" style="color:rgba(255,255,255,.35);font-size:13px;">Cities</a><a href="/vendors" style="color:rgba(255,255,255,.35);font-size:13px;">Vendors</a><a href="/about" style="color:rgba(255,255,255,.35);font-size:13px;">About</a><a href="/contact" style="color:rgba(255,255,255,.35);font-size:13px;">Contact</a></div></div></footer>`;
}