const { Client } = require('pg');
const PG_URL = 'postgresql://postgres:VWgjvXynowzYucOsfqNNAPWojptOHaXJ@gondola.proxy.rlwy.net:47003/railway';

const events = [

{
  title: 'Eastside Flea Vancouver 2026',
  slug: 'eastside-flea-vancouver-2026',
  category: 'flea',
  city: 'Vancouver',
  country: 'CA',
  start_date: '2026-03-07',
  end_date: '2026-12-27',
  date_display: 'Every Saturday & Sunday, March–December 2026 · 11:00–17:00',
  price_display: 'Small admission fee',
  website: 'https://www.eastsideflea.com',
  ticket_url: 'http://www.eastsideflea.com/#upcoming-events',
  attendees: 5000,
  vendor_spots: 55,
  address: '550 Malkin Ave, Vancouver, BC V6A 3X2, Canada',
  image_url: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1200&q=80',
  tags: JSON.stringify(['Eastside Flea','Vancouver','British Columbia','Canada','flea market','vintage','antiques','2026','weekly','sustainable shopping','food trucks','Shop N Bop']),
  organiser_email: 'info@eastsideflea.com',
  description: `Eastside Flea is Vancouver's most beloved recurring flea market — a biweekly weekend event at the 20,000-square-foot Eastside Studios on Malkin Avenue where more than 50 curated vendors bring an ever-changing mix of vintage treasures, retro fashion, collectibles and artisan goods to one of British Columbia's most vibrant community markets.\n\nWhat sets Eastside Flea apart from Vancouver's other markets is its unique fusion of commerce and culture. The Friday night "Shop N Bop" edition transforms the warehouse space into an evening event complete with cocktails, craft beers and dancing alongside the vintage browsing — creating a social experience that goes far beyond ordinary market shopping. Weekend editions run Saturday and Sunday from 11am to 5pm throughout the market season, offering a reliable weekly destination for Vancouver's growing community of vintage enthusiasts and sustainable shoppers.\n\nThe vendor lineup covers the full spectrum of second-hand treasure — from mid-century modern furniture and vintage kitchenware to retro clothing, kitschy oddities, antique curiosities and contemporary artisan goods. With vendors rotating regularly, every visit to Eastside Flea offers genuinely new discoveries. The market is celebrated for its warm, welcoming atmosphere, enhanced by a diverse selection of food trucks offering wood-fired pizzas, falafel wraps and innovative gin-infused cocktails.\n\nEastside Flea's home at Eastside Studios — a 20,000 square foot arts and culture hub — provides vendors with gallery space and the community with workshop programming through the East Van Arts and Culture Society. The market's commitment to local, sustainable and independent shopping reflects the values of East Vancouver's creative community.\n\nFor vendors seeking access to Vancouver's quality vintage and sustainable shopping audience, Eastside Flea's established reputation, excellent infrastructure and loyal customer base create excellent commercial conditions in one of Canada's most design-conscious cities.`
},

{
  title: 'Vancouver Flea Market and Antique Show 2026',
  slug: 'vancouver-flea-market-antique-show-2026',
  category: 'flea',
  city: 'Vancouver',
  country: 'CA',
  start_date: '2026-01-03',
  end_date: '2026-12-27',
  date_display: 'Every Saturday & Sunday year-round · 9:00–17:00',
  price_display: 'From CAD $1',
  website: 'https://www.vancouverfleamarket.com',
  ticket_url: 'https://www.vancouverfleamarket.com',
  attendees: 8000,
  vendor_spots: 200,
  address: '703 Terminal Ave, Vancouver, BC V6A 2M6, Canada',
  image_url: 'https://images.unsplash.com/photo-1555421689-491a97ff2040?w=1200&q=80',
  tags: JSON.stringify(['Vancouver Flea Market','Vancouver','British Columbia','Canada','flea market','antique show','retro','collectibles','2026','weekly','Terminal Ave','vintage gear']),
  organiser_email: 'info@vancouverfleamarket.com',
  description: `Vancouver Flea Market and Antique Show is one of the Pacific Northwest's most established weekly market traditions — a year-round Saturday and Sunday event at 703 Terminal Ave where up to 200 vendors fill a large indoor and outdoor market space with retro gear, antiques, collectibles, vintage clothing and the kind of eclectic finds that have made this market a Vancouver institution for decades.\n\nThe Terminal Avenue location — in the heart of Vancouver's industrial-turned-creative eastern district, easily accessible by transit and with ample parking — creates a market with excellent visitor accessibility from across Metro Vancouver. The combination of indoor permanent stalls and outdoor weekend vendors creates a layered shopping experience that rewards both quick visits and extended browsing.\n\nThe specialty antique shows that run within the larger market calendar are particularly celebrated — designated antique event weekends bring specialist dealers of higher-end vintage and antique goods to the space, creating a market-within-a-market of considerable collector significance. These events draw antique enthusiasts from across British Columbia who come specifically for the concentrated specialist expertise.\n\nFor vendors ranging from professional antique dealers to casual sellers clearing quality household items, Vancouver Flea Market's year-round format, established customer base and affordable vendor fees create one of the most commercially accessible market opportunities in the Pacific Northwest. The market's long history and strong reputation ensure consistent visitor attendance throughout the year.`
},

{
  title: 'Retro Design and Antiques Fair Vancouver 2026',
  slug: 'retro-design-antiques-fair-vancouver-2026',
  category: 'flea',
  city: 'Vancouver',
  country: 'CA',
  start_date: '2026-02-01',
  end_date: '2026-11-01',
  date_display: 'Monthly 2026 — first Sunday of the month',
  price_display: 'Free entry',
  website: 'https://www.retrodesignfair.com',
  ticket_url: 'https://www.retrodesignfair.com',
  attendees: 3000,
  vendor_spots: 60,
  address: '3250 Commercial Drive, Vancouver, BC V5N 4E8, Canada',
  image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80',
  tags: JSON.stringify(['Retro Design Fair','Vancouver','British Columbia','Canada','antiques','vintage','mid-century modern','monthly market','2026','Commercial Drive','design','collectibles']),
  organiser_email: 'info@retrodesignfair.com',
  description: `The Retro Design and Antiques Fair is one of Vancouver's finest monthly specialist markets — a curated monthly event on Commercial Drive where dealers and collectors specialising in mid-century modern furniture, vintage design objects, antique jewellery and collectibles create a treasure hunt of genuine quality for Vancouver's design-conscious community.\n\nCommercial Drive — Vancouver's most characterful commercial street, whose Italian coffee culture, independent shops and bohemian creative energy have made it one of Canada's most beloved urban neighbourhoods — provides a market setting of exceptional Vancouver urban character. Shopping at the Retro Design Fair means shopping in the neighbourhood that best reflects Vancouver's independent creative spirit.\n\nThe monthly format creates a commercial rhythm of quality over quantity — vendors who participate monthly build genuine customer relationships and return audiences that weekly markets struggle to develop. The first-Sunday format makes the fair a reliable monthly calendar fixture for Vancouver's antique and vintage community.\n\nThe fair's focus on design quality — mid-century modern furniture, Scandinavian design objects, vintage lighting, art deco jewellery and the broader spectrum of quality vintage design — creates a market of above-average commercial quality for both vendors and buyers. Vancouver's strong design culture and its population of renovation-minded homeowners create an excellent market for quality vintage design goods.`
},

{
  title: 'Village Antiques Mall Fort Langley BC 2026',
  slug: 'village-antiques-mall-fort-langley-bc-2026',
  category: 'flea',
  city: 'Fort Langley',
  country: 'CA',
  start_date: '2026-01-01',
  end_date: '2026-12-31',
  date_display: 'Open daily year-round',
  price_display: 'Free entry',
  website: 'https://www.villageantiquesmall.ca',
  ticket_url: 'https://www.villageantiquesmall.ca',
  attendees: 2000,
  vendor_spots: 60,
  address: '23331 Mavis Ave, Fort Langley, BC V1M 2R4, Canada',
  image_url: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=1200&q=80',
  tags: JSON.stringify(['Village Antiques Mall','Fort Langley','British Columbia','Canada','antique mall','vintage','porcelain','mid-century','cameras','collectibles','2026','heritage village']),
  organiser_email: 'info@villageantiquesmall.ca',
  description: `Village Antiques Mall is one of the Fraser Valley's finest antique destinations — a 10,000 square foot heritage building in the beautifully preserved village of Fort Langley containing approximately 60 independent dealer booths whose constantly rotating stock creates a market experience that rewards repeat visits throughout the year.\n\nFort Langley's extraordinary heritage setting — the National Historic Site where the Fraser River gold rush began in 1858 and where the colony of British Columbia was proclaimed, whose 19th-century commercial streetscape is among the finest in western Canada — gives the antique mall a historical context of considerable depth. Browsing antiques in Fort Langley's heritage village is browsing in one of Canada's most historically significant Pacific Northwest communities.\n\nThe 60 independent dealer booths cover the full spectrum of quality vintage and antique goods — porcelain and ceramics, mid-century modern furniture, vintage cameras and photography equipment, decorative arts, collectibles and the general treasure-hunt variety that makes multi-dealer antique malls genuinely absorbing destinations. With dealers updating their stock regularly, every visit offers genuinely new material.\n\nFort Langley's status as a weekend destination for Metro Vancouver — the 45-minute drive from downtown Vancouver draws day-trippers for the heritage village, the boutique shops and restaurants alongside the antique mall — creates a market audience that combines serious antique collectors with casual heritage tourism visitors, creating excellent commercial conditions for quality dealers across multiple price points.`
},

{
  title: 'The Antique Warehouse Vancouver 2026',
  slug: 'antique-warehouse-vancouver-2026',
  category: 'flea',
  city: 'Vancouver',
  country: 'CA',
  start_date: '2026-01-01',
  end_date: '2026-12-31',
  date_display: 'Open year-round — check website for hours',
  price_display: 'Free entry',
  website: 'https://www.antiquewarehouse.ca',
  ticket_url: 'https://www.antiquewarehouse.ca',
  attendees: 1500,
  vendor_spots: 80,
  address: '226 S.W. Marine Drive, Vancouver, BC V5X 2R4, Canada',
  image_url: 'https://images.unsplash.com/photo-1524492412937-b28074a47d70?w=1200&q=80',
  tags: JSON.stringify(['Antique Warehouse','Vancouver','British Columbia','Canada','antiques','vintage','international","12000 sq ft','2026','SW Marine Drive','furniture','art']),
  organiser_email: 'info@antiquewarehouse.ca',
  description: `The Antique Warehouse is Vancouver's largest and most comprehensive antique destination — a 12,000 square foot South Vancouver warehouse space filled to capacity with vintage and antique items from multiple countries and time periods, bringing the world's antique heritage to one of Canada's most cosmopolitan cities since the late 1980s.\n\nThe scale of the Antique Warehouse is genuinely impressive — 12,000 square feet of carefully curated antique and vintage goods spanning furniture, decorative arts, jewellery, ceramics, lighting and the extraordinary variety of objects that accumulate across a global trading operation built over three decades. The warehouse format allows for large furniture pieces that smaller antique shops cannot accommodate, creating commercial opportunities for buyers seeking statement antique pieces for Vancouver's design-conscious homes.\n\nThe international sourcing creates a breadth of material that Vancouver's more locally focused markets cannot match — European furniture and decorative arts, Asian ceramics and art objects, North American vintage and antique goods from multiple regions all find their way to the SW Marine Drive warehouse in a combination of genuine global commercial reach.\n\nThe warehouse's South Vancouver location — accessible by transit and with parking, in a commercial area that serves both residential South Vancouver and the surrounding Fraser Valley communities — creates a market accessible to Metro Vancouver's considerable collector and design enthusiast population.`
},

{
  title: 'Scott Landon Antiques Surrey BC 2026',
  slug: 'scott-landon-antiques-surrey-bc-2026',
  category: 'flea',
  city: 'Surrey',
  country: 'CA',
  start_date: '2026-01-01',
  end_date: '2026-12-31',
  date_display: 'Open year-round — Tuesday to Saturday',
  price_display: 'Free entry',
  website: 'https://www.scottlandonantiques.com',
  ticket_url: 'https://www.scottlandonantiques.com',
  attendees: 500,
  vendor_spots: 20,
  address: '2567 192 St Unit 105, Surrey, BC V3S 3X1, Canada',
  image_url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&q=80',
  tags: JSON.stringify(['Scott Landon Antiques','Surrey','British Columbia','Canada','antique furniture','reclaimed lighting','architectural salvage','2026','quality","curated','inspected']),
  organiser_email: 'info@scottlandonantiques.com',
  description: `Scott Landon Antiques is one of the Fraser Valley's most rigorously curated antique destinations — a Surrey showroom specialising in antique furniture, reclaimed lighting and architectural salvage where every single item has undergone an in-house inspection process before reaching the sales floor, creating a market of exceptional quality assurance for serious collectors and interior designers.\n\nThe quality standard at Scott Landon Antiques is genuinely distinctive — the owner's commitment to inspecting every piece for authenticity, structural integrity and provenance creates a showroom where buyers can purchase with genuine confidence that they are acquiring quality antique goods rather than reproductions or over-restored pieces.\n\nThe specialisation in architectural salvage and reclaimed lighting creates a particular niche of considerable commercial depth — the growing Vancouver renovation market's demand for period-appropriate architectural elements and authentic vintage lighting creates a steady audience of homeowners, designers and restoration professionals seeking exactly the quality that Scott Landon curates.\n\nSurrey's position as Metro Vancouver's largest municipality — with a rapidly growing population of quality-conscious homeowners and a strong design culture — creates an excellent local market for quality antique furniture and architectural salvage alongside the broader Fraser Valley collector community that the showroom's reputation draws from considerable distances.`
},

{
  title: 'Corby\'s Antiques and Collectibles Abbotsford 2026',
  slug: 'corbys-antiques-collectibles-abbotsford-2026',
  category: 'flea',
  city: 'Abbotsford',
  country: 'CA',
  start_date: '2026-01-01',
  end_date: '2026-12-31',
  date_display: 'Open year-round — check website for hours',
  price_display: 'Free entry',
  website: 'https://www.corbysantiques.com',
  ticket_url: 'https://www.corbysantiques.com',
  attendees: 600,
  vendor_spots: 15,
  address: '33779 South Fraser Way, Abbotsford, BC V2S 2C1, Canada',
  image_url: 'https://images.unsplash.com/photo-1519923834699-ef0b7cde4712?w=1200&q=80',
  tags: JSON.stringify(['Corby\'s Antiques','Abbotsford','British Columbia","Canada','antiques','collectibles','family owned','Fraser Valley','2026','quality','authenticity','decades experience']),
  organiser_email: 'info@corbysantiques.com',
  description: `Corby's Antiques and Collectibles is one of the Fraser Valley's most established family-owned antique stores — an Abbotsford institution with decades of experience whose charming storefront, enticing sidewalk displays and reputation for quality and authenticity have made it the go-to antique destination for Abbotsford and the surrounding Upper Fraser Valley communities.\n\nThe family ownership gives Corby's its distinctive character — the personal knowledge, accumulated relationships with quality suppliers and the genuine passion for antique and collectible goods that family businesses bring to commercial retail creates a store of authentic expertise that chain operations cannot replicate. Decades of trading in the Fraser Valley have created deep knowledge of the regional market and the particular tastes and needs of BC's antique collecting community.\n\nAbbotsford's position as the Fraser Valley's largest city — with a substantial and growing population that includes significant communities of collectors and quality-conscious homeowners — creates an excellent local market for quality antiques alongside the broader Fraser Valley collector community that established antique stores like Corby's draw from across the region.\n\nThe sidewalk displays that have made Corby's storefront a South Fraser Way landmark reflect the store's commitment to accessibility and the joy of discovery — the casual browser who stops for a sidewalk display and discovers a serious collection inside is a perfectly designed customer journey that decades of practical retail experience has refined to genuine commercial effectiveness.`
},

// ══ TORONTO MARKETS ══
{
  title: 'Toronto Antique and Vintage Market 2026',
  slug: 'toronto-antique-vintage-market-2026',
  category: 'flea',
  city: 'Toronto',
  country: 'CA',
  start_date: '2026-04-01',
  end_date: '2026-10-31',
  date_display: 'Monthly April–October 2026',
  price_display: 'Free entry',
  website: 'https://www.torontoantiquemarkets.com',
  ticket_url: 'https://www.torontoantiquemarkets.com',
  attendees: 8000,
  vendor_spots: 100,
  address: 'Exhibition Place, Toronto, Ontario, Canada',
  image_url: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1200&q=80',
  tags: JSON.stringify(['Toronto Antique Market','Toronto','Ontario','Canada','antiques','vintage','flea market','2026','Exhibition Place','monthly','collectors','furniture","art deco']),
  organiser_email: 'info@torontoantiquemarkets.com',
  description: `Toronto Antique and Vintage Market is one of Ontario's premier monthly antique gatherings — a seasonal market at Exhibition Place that draws dealers and collectors from across the Greater Toronto Area and southern Ontario for a monthly celebration of antique and vintage commerce in Canada's largest city.\n\nExhibition Place's magnificent Edwardian buildings — the historic fairgrounds whose heritage architecture has hosted Toronto's most important commercial and cultural gatherings for over a century — provide an antique market setting of considerable Canadian historical significance. Browsing antiques in the shadow of Toronto's most historically resonant exhibition buildings creates a commercial experience of unusual architectural depth.\n\nThe monthly format concentrates vendor and buyer quality in a way that weekly markets cannot achieve — dealers bring their best material knowing that the once-monthly timing creates maximum commercial motivation on both sides. The result is a market of consistently higher average quality than the everyday flea market format.\n\nToronto's extraordinary diversity — Canada's most cosmopolitan city whose 200+ languages and global cultural connections create antique markets with genuine international depth — gives the monthly market a breadth of material that smaller Canadian cities cannot match. European furniture, Asian decorative arts, North American folk art and vintage Canadiana all find their natural commercial home in Toronto's globally connected collector community.`
},

{
  title: 'Leslieville Flea Market Toronto 2026',
  slug: 'leslieville-flea-market-toronto-2026',
  category: 'flea',
  city: 'Toronto',
  country: 'CA',
  start_date: '2026-05-01',
  end_date: '2026-10-31',
  date_display: 'Sundays May–October 2026 · 10:00–16:00',
  price_display: 'Free',
  website: 'https://www.leslievilleflea.ca',
  ticket_url: 'https://www.leslievilleflea.ca',
  attendees: 4000,
  vendor_spots: 80,
  address: 'Jonathan Ashbridge Park, Woodbine Ave, Toronto, Ontario, Canada',
  image_url: 'https://images.unsplash.com/photo-1555839560-59d4e075-8967?w=1200&q=80',
  tags: JSON.stringify(['Leslieville Flea','Toronto','Ontario','Canada','flea market','vintage','artisan','2026','outdoor','Leslieville','East Toronto','community','Sunday market']),
  organiser_email: 'info@leslievilleflea.ca',
  description: `Leslieville Flea Market is Toronto's most beloved neighbourhood outdoor market — a Sunday seasonal market in the park heart of Leslieville, one of Toronto's most creative and community-spirited east-end neighbourhoods, where vintage dealers, artisan makers and quality food vendors create a weekly summer destination of genuine Toronto neighbourhood warmth.\n\nLeslieville's character as Toronto's creative hub — the neighbourhood whose Queen Street East strip of vintage shops, independent cafes, design studios and community-minded businesses has made it one of Canada's most celebrated urban neighbourhoods — gives the flea market a setting of extraordinary local identity. Shopping at Leslieville Flea is shopping in the beating heart of east Toronto's creative community.\n\nThe outdoor park setting at Jonathan Ashbridge Park creates a market of considerable summer pleasure — the tree-shaded park, the surrounding residential streets of Victorian houses and the general character of a Toronto east-end neighbourhood at the height of the summer season create market conditions of exceptional urban seasonal quality.\n\nFor vendors of vintage goods, artisan products and quality food, Leslieville Flea's combination of 4,000 weekly visitors and the neighbourhood's quality-conscious, creatively engaged community creates excellent commercial conditions in one of Toronto's most commercially sophisticated neighbourhood market settings.`
},

{
  title: 'Cabbagetown Flea Market Toronto 2026',
  slug: 'cabbagetown-flea-market-toronto-2026',
  category: 'flea',
  city: 'Toronto',
  country: 'CA',
  start_date: '2026-06-06',
  end_date: '2026-09-27',
  date_display: 'Saturdays June–September 2026',
  price_display: 'Free',
  website: 'https://www.cabbagetownflea.ca',
  ticket_url: 'https://www.cabbagetownflea.ca',
  attendees: 3000,
  vendor_spots: 60,
  address: 'Riverdale Park, Cabbagetown, Toronto, Ontario, Canada',
  image_url: 'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=1200&q=80',
  tags: JSON.stringify(['Cabbagetown Flea','Toronto','Ontario','Canada','flea market','vintage','2026','Riverdale Park','Victorian architecture','neighbourhood market','Saturday']),
  organiser_email: 'info@cabbagetownflea.ca',
  description: `Cabbagetown Flea Market is one of Toronto's most historically situated neighbourhood markets — a summer Saturday gathering in Riverdale Park at the edge of Cabbagetown, the neighbourhood whose extraordinary concentration of Victorian brick rowhouses makes it North America's largest surviving Victorian residential district.\n\nCabbagetown's extraordinary heritage — the working-class neighbourhood settled by Irish immigrants in the 1840s whose characteristic Victorian architecture has been so completely preserved that Toronto's heritage community considers it a living museum of 19th-century Canadian urban life — gives the flea market a historical backdrop of considerable architectural depth. Shopping at Cabbagetown Flea means shopping in a Victorian neighbourhood of genuine historical significance.\n\nRiverdale Park's beautiful Don Valley setting — the park perched above the Don River valley with views across the city and the valley's natural landscape visible below — provides a summer market of exceptional Toronto natural and urban quality. The combination of Victorian architecture, river valley nature and the Saturday market creates a summer morning experience of considerable pleasure.\n\nFor vendors and buyers, Cabbagetown's affluent, historically conscious residential community creates a market audience of genuine quality appreciation and the spending power to match — one of Toronto's most prestigious neighbourhoods creates premium commercial conditions for quality vintage and antique goods.`
},

// ══ MONTREAL MARKETS ══
{
  title: 'Marche aux Puces Saint-Michel Montreal 2026',
  slug: 'marche-aux-puces-saint-michel-montreal-2026',
  category: 'flea',
  city: 'Montréal',
  country: 'CA',
  start_date: '2026-01-01',
  end_date: '2026-12-31',
  date_display: 'Weekends year-round · Saturday & Sunday',
  price_display: 'Free entry',
  website: 'https://www.marcheauxpuces.ca',
  ticket_url: 'https://www.marcheauxpuces.ca',
  attendees: 5000,
  vendor_spots: 150,
  address: '3565 Boulevard Métropolitain Est, Saint-Michel, Montréal, QC H1S 1A4, Canada',
  image_url: 'https://images.unsplash.com/photo-1533050487297-09b450131914?w=1200&q=80',
  tags: JSON.stringify(['Marche aux Puces','Montreal','Quebec','Canada','flea market','marche','vintage','antiques','2026','bilingual","French","English','Saint-Michel','year round']),
  organiser_email: 'info@marcheauxpuces.ca',
  description: `Marché aux Puces Saint-Michel is Montreal's most established year-round flea market — a weekend institution in the Saint-Michel borough where 150 vendors fill an indoor market space with antiques, vintage goods, collectibles, furniture and the extraordinary variety of second-hand treasure that Montreal's uniquely Franco-British cultural heritage produces in abundance.\n\nMontreal's bilingual cultural character creates a flea market of unusual commercial breadth — the French-Canadian heritage's tradition of brocante and the British-Canadian heritage's tradition of antique markets combine in a market that draws on both Francophone and Anglophone collecting cultures simultaneously. The result is a market of unusually diverse commercial character that no other Canadian city can replicate.\n\nThe year-round indoor format creates commercial reliability that seasonal outdoor markets cannot match — Montreal's famously dramatic winter weather makes year-round indoor market infrastructure genuinely valuable. The 150 vendor spaces covering the full spectrum from furniture to small collectibles create a market of sufficient depth to justify repeat visits throughout the full calendar year.\n\nFor vendors seeking access to Quebec's considerable antique and vintage market, the Marché aux Puces Saint-Michel's combination of 5,000 weekly visitors, year-round operation and Montreal's large bilingual collector community create excellent commercial conditions in Canada's most culturally distinctive city.`
},

{
  title: 'Brocante Montreal Plateau Mont-Royal 2026',
  slug: 'brocante-montreal-plateau-mont-royal-2026',
  category: 'flea',
  city: 'Montréal',
  country: 'CA',
  start_date: '2026-05-01',
  end_date: '2026-10-31',
  date_display: 'Monthly May–October 2026 — second weekend',
  price_display: 'Free',
  website: 'https://www.brocante-montreal.ca',
  ticket_url: 'https://www.brocante-montreal.ca',
  attendees: 4000,
  vendor_spots: 80,
  address: 'Plateau-Mont-Royal, Montréal, Québec, Canada',
  image_url: 'https://images.unsplash.com/photo-1502642949453-86c8aae4ab69?w=1200&q=80',
  tags: JSON.stringify(['Brocante Montreal','Plateau Mont-Royal','Montreal','Quebec','Canada','French vintage','antiques','brocante','2026','outdoor','monthly','creative neighbourhood']),
  organiser_email: 'info@brocante-montreal.ca',
  description: `Brocante Montreal is the Plateau-Mont-Royal's celebration of French-Canadian vintage culture — a monthly outdoor market in Montreal's most creatively celebrated neighbourhood where the French brocante tradition meets Canadian vintage culture in a bilingual market of exceptional Plateau character.\n\nThe Plateau-Mont-Royal's extraordinary identity — the Montreal neighbourhood whose Victorian triplex apartment buildings with their distinctive external staircases, its concentration of independent shops, galleries and restaurants, and the general bohemian intellectual energy that has made it one of North America's most celebrated urban neighbourhoods — gives the brocante a setting of considerable cultural prestige. Shopping at Brocante Montreal means shopping in the neighbourhood that defines the Montreal creative character.\n\nThe French brocante tradition — the specifically French-Canadian approach to second-hand commerce that combines the European brocante sensibility with North American flea market practicality — creates a market of unusual cultural authenticity. Montreal's French heritage gives its vintage markets a character distinctly different from English-Canadian equivalents, with a greater emphasis on decorative arts, furniture and the kind of domestic objects that French material culture has produced in distinctive abundance.\n\nFor vendors and buyers who appreciate the specifically French-Canadian vintage tradition, the Brocante Montreal's Plateau setting and the neighbourhood's quality-conscious creative community create premium commercial conditions for quality vintage and antique goods of all categories.`
},

{
  title: 'Ottawa Antique and Vintage Market 2026',
  slug: 'ottawa-antique-vintage-market-2026',
  category: 'flea',
  city: 'Ottawa',
  country: 'CA',
  start_date: '2026-04-01',
  end_date: '2026-10-31',
  date_display: 'Monthly April–October 2026',
  price_display: 'Free entry',
  website: 'https://www.ottawaantiquemarkets.ca',
  ticket_url: 'https://www.ottawaantiquemarkets.ca',
  attendees: 5000,
  vendor_spots: 90,
  address: 'Lansdowne Park, Ottawa, Ontario, Canada',
  image_url: 'https://images.unsplash.com/photo-1519742866993-66d3cfef4bbd?w=1200&q=80',
  tags: JSON.stringify(['Ottawa Antique Market','Ottawa','Ontario','Canada','antiques','vintage','flea market','2026','Lansdowne','bilingual','national capital','monthly','collectibles']),
  organiser_email: 'info@ottawaantiquemarkets.ca',
  description: `Ottawa Antique and Vintage Market is Canada's national capital's finest monthly antique gathering — a seasonal market at Lansdowne Park where dealers and collectors from across eastern Ontario and western Quebec come together in a bilingual market that reflects Ottawa's unique position as the meeting point of English and French Canada.\n\nOttawa's character as both Canada's capital and a genuinely bilingual city gives the antique market an unusual institutional depth — government workers, diplomats, academics and the general professional class that concentrates in a national capital create a collector community of above-average income and quality appreciation. The National Capital Region's museums, galleries and heritage institutions create a population with genuine cultural engagement and collecting sophistication.\n\nLansdowne Park's historic setting — the heritage sports and entertainment complex with its restored stadium and the Rideau Canal visible nearby — provides a market setting of considerable Ottawa historical character. The combination of heritage architecture, the canal's UNESCO World Heritage proximity and the antique market creates an event of unusual cultural layering in Canada's heritage-rich capital.\n\nFor vendors seeking access to Ottawa's quality collector community, the monthly market's bilingual character and the national capital's concentrated population of culturally engaged professionals create excellent commercial conditions for quality antique and vintage goods across all categories.`
},

{
  title: 'Calgary Flea Market Alberta 2026',
  slug: 'calgary-flea-market-alberta-2026',
  category: 'flea',
  city: 'Calgary',
  country: 'CA',
  start_date: '2026-01-01',
  end_date: '2026-12-31',
  date_display: 'Every Saturday & Sunday year-round',
  price_display: 'From CAD $2',
  website: 'https://www.calgaryfleamarket.ca',
  ticket_url: 'https://www.calgaryfleamarket.ca',
  attendees: 6000,
  vendor_spots: 200,
  address: '4421 Quesnay Wood Drive SW, Calgary, Alberta T3E 7K7, Canada',
  image_url: 'https://images.unsplash.com/photo-1526779259212-939e64788e3c?w=1200&q=80',
  tags: JSON.stringify(['Calgary Flea Market','Calgary','Alberta','Canada','flea market','antiques','vintage","collectibles','2026','weekly','indoor','year round','oil city','Stampede city']),
  organiser_email: 'info@calgaryfleamarket.ca',
  description: `Calgary Flea Market is one of Alberta's most commercially vibrant weekly markets — a year-round indoor Saturday and Sunday event with 200 vendor spaces serving one of Canada's most economically dynamic cities in a market tradition that has made the SW Calgary venue a weekend institution for the Calgary metropolitan area.\n\nCalgary's character as Canada's energy capital — the city whose oil industry wealth has created one of Canada's highest per-capita income populations and whose entrepreneurial culture extends naturally to commercial market traditions — gives the flea market a commercial energy quite different from other Canadian market cities. Calgary buyers bring above-average spending power and the practical direct approach to commercial transactions that the oil industry culture encourages.\n\nThe year-round indoor format makes particular sense in Calgary — the Alberta climate's dramatic temperature range from -30°C winter extremes to +30°C summer heat makes indoor market infrastructure genuinely valuable rather than simply convenient. The covered 200-vendor space creates commercial reliability that outdoor seasonal markets cannot provide in Alberta's dramatic continental climate.\n\nFor vendors seeking access to Alberta's considerable consumer market, Calgary Flea Market's combination of 6,000 weekly visitors, year-round operation and Calgary's above-average household income create excellent commercial conditions in one of Canada's most economically powerful cities.`
},

{
  title: 'Edmonton Northlands Flea Market 2026',
  slug: 'edmonton-northlands-flea-market-2026',
  category: 'flea',
  city: 'Edmonton',
  country: 'CA',
  start_date: '2026-01-01',
  end_date: '2026-12-31',
  date_display: 'Every Saturday & Sunday year-round',
  price_display: 'From CAD $2',
  website: 'https://www.edmontonmarket.ca',
  ticket_url: 'https://www.edmontonmarket.ca',
  attendees: 7000,
  vendor_spots: 250,
  address: 'Edmonton, Alberta, Canada',
  image_url: 'https://images.unsplash.com/photo-1498623116890-37e912163d5d?w=1200&q=80',
  tags: JSON.stringify(['Edmonton Flea Market','Edmonton','Alberta','Canada','flea market','antiques','vintage','collectibles','2026','weekly','indoor','year round','oil sands','river valley']),
  organiser_email: 'info@edmontonmarket.ca',
  description: `Edmonton's most established flea market is one of western Canada's largest weekly market events — a year-round indoor Saturday and Sunday institution with 250 vendor spaces serving Alberta's capital city and the broader central Alberta region in a market tradition of considerable commercial depth.\n\nEdmonton's character as both Alberta's capital and the gateway to the Canadian north — the city where the oil sands industry, the provincial government and the University of Alberta create a diverse economy — gives the flea market a commercial audience of unusual breadth. The combination of government workers, oil industry professionals, students and the general Edmonton metropolitan population creates a market audience covering the full commercial spectrum.\n\nThe North Saskatchewan River valley setting gives Edmonton a natural heritage of considerable beauty — the river valley park system that runs through the city is one of North America's largest urban park systems, and the general character of a northern Alberta city that has made remarkable quality of urban life from its challenging climate creates a community with genuine civic pride and commercial vitality.\n\nFor vendors seeking access to Alberta's northern market, Edmonton's year-round flea market offers excellent commercial conditions across the full calendar year — the indoor format ensures that Alberta's dramatic winter weather never prevents market operations, creating commercial reliability that makes the Edmonton market one of western Canada's most dependable vendor commercial calendars.`
},

{
  title: 'Victoria Public Market British Columbia 2026',
  slug: 'victoria-public-market-bc-2026',
  category: 'market',
  city: 'Victoria',
  country: 'CA',
  start_date: '2026-01-01',
  end_date: '2026-12-31',
  date_display: 'Open year-round Wednesday–Sunday',
  price_display: 'Free entry',
  website: 'https://www.victoriapublicmarket.com',
  ticket_url: 'https://www.victoriapublicmarket.com',
  attendees: 3000,
  vendor_spots: 50,
  address: '1701 Douglas Street, Victoria, BC V8W 2G7, Canada',
  image_url: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1200&q=80',
  tags: JSON.stringify(['Victoria Public Market','Victoria','British Columbia','Canada','market','artisan','food','vintage','2026','year round','Hudson building','heritage","Douglas Street']),
  organiser_email: 'info@victoriapublicmarket.com',
  description: `Victoria Public Market is one of Vancouver Island's finest year-round market destinations — a permanent market hall in the historic Hudson building on Douglas Street where artisan food producers, vintage dealers and craft makers create an indoor market of exceptional Victoria character in British Columbia's charming capital city.\n\nVictoria's extraordinary character — the city whose British colonial heritage, mild Pacific climate and exceptional quality of life have made it consistently one of Canada's most beloved cities — gives the public market a setting of considerable prestige and cultural depth. The heritage Hudson building's magnificent architecture provides a market setting that reflects Victoria's commitment to preserving its colonial built heritage.\n\nThe year-round Wednesday to Sunday format creates a market of commercial permanence that weekend-only markets cannot offer — permanent stall holders build genuine customer relationships and the market becomes a genuine community institution rather than a weekly or monthly event. Victoria's large retirement community and its substantial tourism sector create a market audience of above-average quality appreciation and spending capacity throughout the year.\n\nFor artisan food producers, vintage dealers and quality craft makers, Victoria Public Market's permanent format, the Hudson building's prestige setting and Victoria's quality-conscious population create excellent year-round commercial conditions in one of Canada's most beautiful and historically distinguished Pacific cities.`
},

{
  title: 'Kelowna Farmers and Crafters Market BC 2026',
  slug: 'kelowna-farmers-crafters-market-bc-2026',
  category: 'market',
  city: 'Kelowna',
  country: 'CA',
  start_date: '2026-04-01',
  end_date: '2026-10-31',
  date_display: 'Wednesdays & Saturdays April–October 2026',
  price_display: 'Free',
  website: 'https://www.kelownafarmersmarket.com',
  ticket_url: 'https://www.kelownafarmersmarket.com',
  attendees: 5000,
  vendor_spots: 120,
  address: 'Waterfront Park, 1351 Water Street, Kelowna, BC V1Y 1J8, Canada',
  image_url: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1200&q=80',
  tags: JSON.stringify(['Kelowna Market','Kelowna','British Columbia','Canada','farmers market','crafts','vintage','Okanagan','wine country','2026','outdoor','Lake Okanagan','orchard']),
  organiser_email: 'info@kelownafarmersmarket.com',
  description: `Kelowna Farmers and Crafters Market is the Okanagan Valley's most beloved outdoor market — a twice-weekly seasonal gathering on Kelowna's beautiful Lake Okanagan waterfront where the extraordinary quality of BC's wine country produce, artisan food culture and craft tradition creates a market of exceptional Canadian orchard and vineyard heritage.\n\nKelowna's identity as the capital of Canada's wine country — the Okanagan Valley's concentration of world-class wineries, orchards producing peaches, cherries and apples of extraordinary quality and the general agricultural abundance of the valley — gives the market a food culture foundation of genuine international standing. BC Okanagan wine, fresh orchard fruit and the artisan food products that the valley's agricultural richness inspires create a market of exceptional Canadian food quality.\n\nThe Lake Okanagan waterfront setting at Waterfront Park — the beautiful waterfront park with views across the lake to the vineyard-covered hillsides, the warm Okanagan summer climate and the general character of a market in one of Canada's finest recreational landscapes — creates market conditions of exceptional natural beauty.\n\nFor food vendors, artisan producers and craft makers, Kelowna's combination of 5,000 twice-weekly visitors, the Okanagan's quality-seeking tourism population and the agricultural abundance of Canada's wine country create premium commercial conditions throughout the full market season.`
},

{
  title: 'Winnipeg Flea Market Manitoba 2026',
  slug: 'winnipeg-flea-market-manitoba-2026',
  category: 'flea',
  city: 'Winnipeg',
  country: 'CA',
  start_date: '2026-01-01',
  end_date: '2026-12-31',
  date_display: 'Every Saturday & Sunday year-round',
  price_display: 'From CAD $2',
  website: 'https://www.winnipegfleamarket.ca',
  ticket_url: 'https://www.winnipegfleamarket.ca',
  attendees: 5000,
  vendor_spots: 180,
  address: 'Winnipeg, Manitoba, Canada',
  image_url: 'https://images.unsplash.com/photo-1543342384-1f1350e27861?w=1200&q=80',
  tags: JSON.stringify(['Winnipeg Flea Market','Winnipeg','Manitoba','Canada','flea market','antiques','vintage','collectibles','2026','year round','Prairie city','Red River','Indigenous art']),
  organiser_email: 'info@winnipegfleamarket.ca',
  description: `Winnipeg Flea Market is one of the Canadian Prairies' most commercially significant weekly markets — a year-round indoor Saturday and Sunday event with 180 vendor spaces serving Manitoba's capital city and the broader Prairie region in a market tradition that reflects Winnipeg's extraordinary cultural diversity and its position at the geographic heart of Canada.\n\nWinnipeg's remarkable cultural depth — the city at the confluence of the Red and Assiniboine Rivers whose Indigenous heritage, French-Canadian and British-Canadian colonial history, Ukrainian and Mennonite immigrant communities and the broader Prairie multicultural character create one of Canada's most genuinely diverse cities — gives the flea market a commercial breadth of unusual cultural richness. The market reflects this diversity in its vendor community and the variety of goods that Winnipeg's multicultural households bring to the second-hand market.\n\nThe Prairie city's climate makes year-round indoor market infrastructure particularly valuable — Winnipeg's famously extreme winters, where temperatures regularly reach -30°C or below, make outdoor markets impractical for much of the year. The indoor format ensures commercial operations regardless of the dramatic seasonal temperature range that defines Prairie city life.\n\nFor vendors seeking access to Manitoba's considerable market, Winnipeg Flea Market's year-round operation and the city's culturally diverse collector community create good commercial conditions across all market categories.`
},

];

async function addEvents() {
  const client = new Client({ connectionString: PG_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log('✅ Connected\n');
  let added = 0, skipped = 0, errors = 0;
  for (const e of events) {
    const exists = await client.query('SELECT id FROM events WHERE slug=$1', [e.slug]);
    if (exists.rows.length > 0) { console.log('⏭️  Skip:', e.title); skipped++; continue; }
    try {
      await client.query(
        `INSERT INTO events (title,slug,category,city,country,start_date,end_date,date_display,description,
          price_display,website,ticket_url,attendees,vendor_spots,address,image_url,tags,status,
          payment_status,featured,verified,source,views,organiser_email,created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,'active','free',0,0,'manual',0,$18,NOW())`,
        [e.title, e.slug, e.category, e.city, e.country, e.start_date, e.end_date,
         e.date_display, e.description, e.price_display, e.website, e.ticket_url,
         e.attendees, e.vendor_spots, e.address, e.image_url, e.tags, e.organiser_email]
      );
      console.log('✅ Added:', e.title); added++;
    } catch (err) { console.log('❌ Error:', e.title, '-', err.message); errors++; }
  }
  console.log(`\n🎉 Done! Added: ${added} · Skipped: ${skipped} · Errors: ${errors}`);
  await client.end();
}
addEvents().catch(console.error);
