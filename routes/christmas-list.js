const express = require('express');
const router = express.Router();

// Simple listing page with form + Stripe checkout
router.get('/', (req, res) => {
  res.send(`<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>List Your Christmas Market — Festmore</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Syne:wght@400;600;700&display=swap" rel="stylesheet"/>
<style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:Syne,sans-serif;background:#06200f;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px;}
input,textarea,button{font-family:inherit;}
.box{background:#fff;border-radius:24px;padding:48px;max-width:560px;width:100%;}
.logo{text-align:center;margin-bottom:32px;}<br/>
label{display:block;font-size:11px;font-weight:700;color:#444;text-transform:uppercase;letter-spacing:.5px;margin-bottom:5px;margin-top:14px;}
input{width:100%;border:1.5px solid #e0dbd5;border-radius:8px;padding:11px 14px;font-size:14px;outline:none;}
input:focus{border-color:#c41e3a;}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
.btn{width:100%;background:#c41e3a;color:#fff;border:none;padding:15px;border-radius:10px;font-size:16px;font-weight:700;cursor:pointer;margin-top:24px;}
.btn:hover{background:#a31830;}
.free-link{text-align:center;margin-top:16px;font-size:13px;color:#888;}
.free-link a{color:#c41e3a;font-weight:700;}
.badge{display:inline-block;background:#fef2f2;border:1px solid #fecaca;color:#c41e3a;font-size:11px;font-weight:700;padding:4px 12px;border-radius:99px;margin-bottom:16px;letter-spacing:.8px;text-transform:uppercase;}
.price-box{background:#06200f;border-radius:12px;padding:20px;text-align:center;margin:20px 0;}
</style></head><body>
<div class="box">
  <div class="logo">
    <a href="/" style="font-size:22px;font-weight:800;text-decoration:none;"><span style="color:#0a0a0a;">Fest</span><span style="color:#e8470a;">more</span></a>
  </div>
  <div style="text-align:center;margin-bottom:28px;">
    <div class="badge">🎄 Christmas Markets 2026</div>
    <h1 style="font-family:'Playfair Display',serif;font-size:28px;color:#0a0a0a;margin-bottom:10px;">List Your Christmas Market</h1>
    <p style="font-size:14px;color:#666;line-height:1.6;">Get discovered by vendors and visitors from around the world.</p>
    <div class="price-box">
      <div style="font-size:12px;color:rgba(255,255,255,.4);text-decoration:line-through;margin-bottom:2px;">€79/year from 2027</div>
      <div style="font-size:42px;font-weight:800;color:#d4a017;font-family:'Playfair Display',serif;">€29</div>
      <div style="font-size:12px;color:rgba(255,255,255,.4);">Full 2026 Christmas season · Founding price</div>
    </div>
    <div style="text-align:left;font-size:13px;color:#444;line-height:2;">
      ⭐ Featured badge — top of search results<br/>
      🏠 Homepage placement on Festmore<br/>
      📧 Newsletter to 500+ vendors &amp; visitors<br/>
      🏪 Direct vendor applications to your inbox<br/>
      🌍 Discoverable in 42+ countries
    </div>
  </div>
  <form method="POST" action="/christmas/checkout">
    <label>Your Name *</label>
    <input type="text" name="organiser_name" required placeholder="e.g. Hans Müller"/>
    <label>Email Address *</label>
    <input type="email" name="organiser_email" required placeholder="your@email.com"/>
    <label>Christmas Market Name *</label>
    <input type="text" name="event_title" required placeholder="e.g. Nuremberg Christkindlesmarkt 2026"/>
    <div class="grid">
      <div><label>City *</label><input type="text" name="event_city" required placeholder="e.g. Nuremberg"/></div>
      <div><label>Country *</label><input type="text" name="event_country" required placeholder="e.g. Germany"/></div>
    </div>
    <button type="submit" class="btn">Pay €29 and Get Featured 🎄</button>
  </form>
  <div class="free-link">
    Prefer a free listing? <a href="/events/submit">Submit your market for free →</a>
  </div>
</div>
</body></html>`);
});

module.exports = router;
