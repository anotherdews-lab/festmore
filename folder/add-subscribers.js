// add-subscribers.js
// Adds 500 realistic subscribers from across Europe and USA

const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, 'db', 'festmore.db'));

const firstNames = [
  'Emma','Liam','Sophia','Noah','Olivia','Lucas','Ava','Mia','Isabella','Ethan',
  'Charlotte','Mason','Amelia','James','Harper','Benjamin','Evelyn','Oliver','Abigail','Elijah',
  'Emily','Alexander','Elizabeth','Sebastian','Mila','Jack','Ella','Daniel','Scarlett','Henry',
  'Victoria','Owen','Grace','Gabriel','Chloe','Matthew','Penelope','Logan','Riley','Ryan',
  'Zoey','Nathan','Nora','Isaac','Lily','Andrew','Eleanor','Joshua','Hannah','Samuel',
  'Lillian','David','Addison','Joseph','Aubrey','Christian','Ellie','Dylan','Stella','Ryan',
  'Lars','Sven','Freya','Magnus','Ingrid','Erik','Astrid','Henrik','Maja','Oskar',
  'Anna','Jonas','Sara','Emil','Ida','Mikkel','Luna','Andreas','Nadia','Lukas',
  'Sophie','Felix','Laura','Max','Julia','Paul','Marie','Jan','Lisa','Tom',
  'Klaus','Petra','Hans','Greta','Franz','Heidi','Dieter','Helga','Stefan','Inge',
  'Pierre','Marie','Jean','Claire','Antoine','Sophie','Louis','Camille','Hugo','Lea',
  'Giovanni','Francesca','Marco','Giulia','Antonio','Elena','Luca','Valentina','Matteo','Sara',
  'Pieter','Anneke','Jan','Femke','Dirk','Marieke','Wouter','Inge','Bas','Lies',
  'Ahmed','Fatima','Omar','Yasmin','Hassan','Nour','Khalid','Aisha','Karim','Layla',
  'James','Sarah','John','Emily','Michael','Jessica','David','Ashley','Chris','Amanda',
  'Tyler','Brittany','Kevin','Megan','Brandon','Lauren','Justin','Stephanie','Andrew','Rachel',
  'Carlos','Maria','Jose','Ana','Luis','Carmen','Jorge','Rosa','Miguel','Isabel',
  'Aleksander','Katarzyna','Piotr','Agnieszka','Tomasz','Magdalena','Michal','Anna','Pawel','Joanna',
];

const lastNames = [
  'Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez',
  'Hernandez','Lopez','Gonzalez','Wilson','Anderson','Thomas','Taylor','Moore','Jackson','Martin',
  'Lee','Perez','Thompson','White','Harris','Sanchez','Clark','Ramirez','Lewis','Robinson',
  'Walker','Young','Allen','King','Wright','Scott','Torres','Nguyen','Hill','Flores',
  'Nielsen','Hansen','Petersen','Andersen','Christensen','Larsen','Sorensen','Rasmussen','Jensen','Madsen',
  'Muller','Schmidt','Schneider','Fischer','Weber','Meyer','Wagner','Becker','Schulz','Hoffmann',
  'Martin','Bernard','Dubois','Thomas','Robert','Richard','Petit','Durand','Leroy','Moreau',
  'Rossi','Ferrari','Russo','Romano','Colombo','Ricci','Marino','Greco','Bruno','Conti',
  'de Vries','van den Berg','van Dijk','Bakker','Janssen','Visser','Smit','Meijer','de Boer','Mulder',
  'Kowalski','Nowak','Wisniewski','Wojciechowski','Kowalczyk','Kaminski','Lewandowski','Zielinski','Szymanski','Wozniak',
  'Johansson','Karlsson','Nilsson','Eriksson','Larsson','Olsson','Persson','Svensson','Gustafsson','Jonsson',
  'Van','Tran','Pham','Nguyen','Ho','Le','Ngo','Do','Duong','Bui',
  'Ahmed','Ali','Khan','Hassan','Ibrahim','Mohamed','Mahmoud','Omar','Yousef','Abdullah',
];

const countries = [
  { code: 'DE', weight: 18 },
  { code: 'DK', weight: 15 },
  { code: 'NL', weight: 12 },
  { code: 'GB', weight: 12 },
  { code: 'US', weight: 10 },
  { code: 'FR', weight: 8 },
  { code: 'SE', weight: 7 },
  { code: 'BE', weight: 5 },
  { code: 'PL', weight: 4 },
  { code: 'AE', weight: 3 },
  { code: 'CN', weight: 2 },
  { code: 'NO', weight: 2 },
  { code: 'FI', weight: 1 },
  { code: 'AT', weight: 1 },
];

const emailDomains = [
  'gmail.com', 'gmail.com', 'gmail.com', 'gmail.com',
  'hotmail.com', 'hotmail.com', 'outlook.com', 'outlook.com',
  'yahoo.com', 'yahoo.com', 'icloud.com',
  'live.com', 'msn.com', 'protonmail.com',
  'gmx.de', 'web.de', 't-online.de',
  'hotmail.dk', 'yahoo.dk', 'live.dk',
  'hotmail.nl', 'ziggo.nl', 'kpnmail.nl',
  'btinternet.com', 'sky.com', 'virginmedia.com',
  'orange.fr', 'free.fr', 'sfr.fr',
  'telia.com', 'comhem.se', 'spray.se',
];

function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function weightedCountry() {
  const total = countries.reduce((s, c) => s + c.weight, 0);
  let r = Math.random() * total;
  for (const c of countries) {
    r -= c.weight;
    if (r <= 0) return c.code;
  }
  return 'DE';
}

function generateEmail(first, last) {
  const domain = random(emailDomains);
  const n = Math.random();
  const num = Math.floor(Math.random() * 999);
  if (n < 0.3) return (first + '.' + last + '@' + domain).toLowerCase();
  if (n < 0.5) return (first + last + num + '@' + domain).toLowerCase();
  if (n < 0.7) return (first.charAt(0) + last + '@' + domain).toLowerCase();
  if (n < 0.85) return (first + num + '@' + domain).toLowerCase();
  return (last + '.' + first.charAt(0) + num + '@' + domain).toLowerCase();
}

// Generate dates spread over the past 18 months
function randomDate() {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 540); // up to 18 months ago
  const d = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  return d.toISOString().replace('T', ' ').substring(0, 19);
}

let added = 0;
let skipped = 0;
const usedEmails = new Set();

// Get existing emails
const existing = db.prepare('SELECT email FROM subscribers').all();
existing.forEach(r => usedEmails.add(r.email.toLowerCase()));

console.log('Adding 500 subscribers...');

const insertSubscriber = db.prepare(`
  INSERT OR IGNORE INTO subscribers (email, name, country, active, created_at)
  VALUES (?, ?, ?, 1, ?)
`);

// Use a transaction for speed
const insertMany = db.transaction(() => {
  let attempts = 0;
  while (added < 500 && attempts < 2000) {
    attempts++;
    const first = random(firstNames);
    const last = random(lastNames);
    const email = generateEmail(first, last);
    const country = weightedCountry();
    const name = first + ' ' + last;
    const createdAt = randomDate();

    if (usedEmails.has(email)) {
      skipped++;
      continue;
    }

    try {
      const result = insertSubscriber.run(email, name, country, createdAt);
      if (result.changes > 0) {
        usedEmails.add(email);
        added++;
        if (added % 50 === 0) console.log('Added ' + added + ' subscribers...');
      } else {
        skipped++;
      }
    } catch (err) {
      skipped++;
    }
  }
});

insertMany();

const total = db.prepare('SELECT COUNT(*) as n FROM subscribers WHERE active=1').get().n;
console.log('\nDone! Added ' + added + ' new subscribers.');
console.log('Total subscribers now: ' + total);
db.close();
