// add-photos-columns.js
// Adds photos column to events and vendors tables
// Run once on startup

const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, 'db', 'festmore.db'));

try {
  db.exec(`ALTER TABLE events ADD COLUMN photos TEXT DEFAULT '[]'`);
  console.log('✅ Added photos column to events');
} catch(e) {
  console.log('events.photos already exists');
}

try {
  db.exec(`ALTER TABLE vendors ADD COLUMN photos TEXT DEFAULT '[]'`);
  console.log('✅ Added photos column to vendors');
} catch(e) {
  console.log('vendors.photos already exists');
}

db.close();
console.log('✅ Photos columns ready!');
