const{Client}=require('pg');
const c=new Client({connectionString:process.env.DATABASE_URL||'postgresql://postgres:VWgjvXynowzYucOsfqNNAPWojptOHaXJ@gondola.proxy.rlwy.net:47003/railway',ssl:{rejectUnauthorized:false}});
c.connect().then(async()=>{
  const exists=await c.query("SELECT id FROM events WHERE slug='roskilde-festival-2027'");
  if(exists.rows.length>0){
    await c.query("UPDATE events SET featured=1, payment_status='standard' WHERE slug='roskilde-festival-2027'");
    console.log('Updated to Featured');
  } else {
    await c.query("INSERT INTO events (title,slug,category,city,country,start_date,end_date,date_display,description,price_display,website,ticket_url,attendees,vendor_spots,address,image_url,tags,status,payment_status,featured,verified,source,views,organiser_email,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,'active','standard',1,1,'manual',0,$18,NOW())",
    ['Roskilde Festival 2027','roskilde-festival-2027','festival','Roskilde','DK','2027-06-26','2027-07-03',
    '26 June - 3 July 2027 - Roskilde, Denmark',
    'Roskilde Festival 2027 is Northern Europe largest music and arts festival. 130,000 visitors. Non-profit. 30,000 volunteers. Full festival tickets already sold out.',
    'Smart Ticket from DKK 2,995','https://www.roskilde-festival.dk',
    'https://ticket.roskilde-festival.dk',130000,80,
    'Roskilde Festival Grounds, 4000 Roskilde, Denmark',
    'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200&q=80',
    '["Roskilde Festival","RF27","Denmark","2027"]','info@roskilde-festival.dk']);
    console.log('Added Roskilde 2027 as Featured');
  }
  c.end();
});
