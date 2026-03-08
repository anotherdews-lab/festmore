# 🎪 FESTMORE — Your Complete Setup Guide
## Read this from top to bottom. Every step explained simply.

---

## STEP 1 — Install 2 Free Programs on Your Mac

### Program 1: Node.js (the engine that runs your website)
1. Open your browser and go to: **https://nodejs.org**
2. Click the big green button that says **"LTS — Recommended"**
3. Download and install it like any normal Mac app (just keep clicking Next/Continue)
4. ✅ Done! This is the engine your website runs on.

### Program 2: VS Code (a free text editor for code)
1. Go to: **https://code.visualstudio.com**
2. Download and install it (free, made by Microsoft)
3. ✅ Done! This lets you edit files and run commands easily.

---

## STEP 2 — Put the Festmore Files on Your Mac

1. Download the **festmore** folder from this session (the zip file)
2. Put it on your Desktop or in your Documents folder
3. Open **VS Code**
4. Go to **File → Open Folder** and select the **festmore** folder
5. ✅ You should now see all the files in the left panel

---

## STEP 3 — Open the Terminal (the command window)

In VS Code, at the top menu click: **Terminal → New Terminal**

A black panel appears at the bottom. This is where you type commands.

**Don't be scared of it** — you'll only type simple things here.

---

## STEP 4 — Install the Website's Dependencies

In the Terminal, type exactly this and press Enter:
```
npm install
```

You'll see text scrolling. Wait about 1-2 minutes.
When it says "added XXX packages", it's done. ✅

---

## STEP 5 — Set Up Your Secret Keys

In VS Code, look at the file list on the left.
Find the file called **.env.example**

1. Right-click it → **Rename** → change the name to **.env** (remove .example)
2. Open the **.env** file
3. Fill in your details:

### Your .env file — fill these in:

**SITE_URL** — Leave as http://localhost:3000 for now (change later when live)

**SESSION_SECRET** — Type any random text, like: `festmore2025mysecretkey123xyz`

**STRIPE_SECRET_KEY** and **STRIPE_PUBLISHABLE_KEY**:
- Go to: https://stripe.com → Create a free account
- Go to Developers → API Keys
- Copy your **test** keys (start with sk_test_ and pk_test_)
- Paste them in

**ANTHROPIC_API_KEY** (for AI articles):
- Go to: https://console.anthropic.com
- Create account → API Keys → Create new key
- Copy and paste it in
- Add €5-10 credit (this runs ~300 articles)

**ADSENSE_ID**:
- Find your Google AdSense publisher ID
- It looks like: ca-pub-1234567890123456
- Paste it in

---

## STEP 6 — Create Your Database

In the Terminal, type:
```
node db/setup.js
```

You'll see:
```
✅ Database created with sample data!
```

This creates your database with 10 sample events and 2 articles already in it. ✅

---

## STEP 7 — Start Your Website!

In the Terminal, type:
```
npm run dev
```

You'll see:
```
🎪 ════════════════════════════════════
   FESTMORE is running!
   Open in browser: http://localhost:3000
```

Now open your browser and go to: **http://localhost:3000**

🎉 **YOUR WEBSITE IS RUNNING!**

---

## STEP 8 — Make Yourself an Admin

To access the admin panel at /admin, you need to:

1. Go to: http://localhost:3000/auth/register
2. Create an account with your email
3. In VS Code terminal, type:
```
node -e "const db=require('./db');db.prepare(\"UPDATE users SET role='admin' WHERE email=?\").run('YOUR-EMAIL@HERE.COM')"
```
(Replace YOUR-EMAIL@HERE.COM with your actual email)

4. Now go to: http://localhost:3000/admin
5. You'll see your admin panel! ✅

---

## STEP 9 — Test the AI Articles

To manually run the AI (normally runs at 2am automatically):
```
node automation/daily.js
```

This will write 10 new articles automatically. Check http://localhost:3000/articles after!

---

## STEP 10 — Put It Live on SiteGround (Replace WordPress)

**First — backup your WordPress site** (in SiteGround → Backup)

### On SiteGround:
1. Log in to your SiteGround account
2. Go to **Site Tools** for festmore.com
3. Click **Devs → Node.js**
4. Click **Create Application**
5. Set **Node.js version**: 20 (or latest)
6. Set **Application Root**: public_html
7. Set **Application URL**: festmore.com
8. Set **Start file**: server.js
9. Click **Create**

### Upload your files:
1. In SiteGround → **File Manager** → go to public_html
2. Delete all the WordPress files (wp-content, wp-admin, etc.)
3. Upload ALL your festmore files here
4. Make sure you upload the **.env** file too (with your real SITE_URL set to https://festmore.com)

### Install packages on server:
In SiteGround → **Devs → SSH Terminal** (or use your FTP tool's terminal):
```
cd public_html
npm install --production
node db/setup.js
```

5. Click **Restart** on your Node.js application
6. Go to **festmore.com** in your browser

🌍 **YOUR WEBSITE IS NOW LIVE!**

---

## HOW THE AUTOMATION WORKS

Every night at **2:00 AM automatically**:
1. 🤖 Claude AI writes **10 new articles** about festivals and events
2. 🌍 AI generates **5 new events** from across the world
3. All of it **auto-publishes** to your website
4. Your Google AdSense shows ads on all this new content
5. More content = more Google traffic = more AdSense money

**You don't need to do anything.** Wake up every morning to new content!

---

## HOW YOU MAKE MONEY

### 1. Google AdSense (already connected!)
- Every page has 3-4 ad slots
- More visitors = more money
- The AI articles drive traffic from Google searches

### 2. Event Listings — €79/year
- Event organisers fill in the form at /events/submit
- They pay €79 via Stripe
- Their event goes live automatically
- You get the money directly in your Stripe account

### 3. Vendor Profiles — €49/year  
- Vendors create a profile at /vendors/register
- They pay €49 via Stripe
- Profile goes live with verified badge
- You get paid automatically

### 4. Growth Plan
- Month 1-3: Set up, get first events listed, AI writes ~900 articles
- Month 4-6: Google starts ranking your articles, traffic grows
- Month 7-12: Regular organic traffic, subscribers growing
- Year 2+: Scale to more countries, add premium features

---

## ADDING YOUR ADSENSE CODE

Open the file: **routes/home.js**
Search for this text: `<!-- PASTE YOUR ADSENSE CODE HERE -->`
Replace the ad-placeholder divs with your real AdSense code like:
```html
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-YOUR-ID"
     data-ad-slot="YOUR-SLOT-ID"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
```

Do the same in routes/articles.js and routes/events.js

---

## NEED HELP?

Come back here any time and I'll help you with any step!

Common things to ask me:
- "Help me deploy to SiteGround"
- "My npm install shows an error — here's what it says: [paste error]"
- "How do I add more countries?"
- "How do I change the design?"
- "Can you add a feature where..."

---

## YOUR WEBSITE STRUCTURE

```
festmore/
├── server.js          ← Main file (starts everything)
├── package.json       ← Project info
├── .env               ← YOUR SECRET KEYS (never share!)
├── db/
│   ├── setup.js       ← Creates database
│   └── festmore.db    ← Your database (created automatically)
├── routes/
│   ├── home.js        ← Homepage
│   ├── events.js      ← Event pages + Stripe payment
│   ├── articles.js    ← Article pages
│   ├── vendors.js     ← Vendor pages + Stripe payment
│   ├── auth.js        ← Login/Register
│   ├── dashboard.js   ← User dashboard
│   ├── admin.js       ← Your admin panel
│   └── payments.js    ← Stripe webhooks
├── automation/
│   └── daily.js       ← 🤖 AI writes articles every night
└── public/
    ├── css/main.css   ← All styling
    └── js/main.js     ← Frontend code
```

---

Good luck! You're building something great. 🚀
