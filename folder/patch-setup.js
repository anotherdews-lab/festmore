// patch-setup.js
// Run once: node patch-setup.js
const fs = require('fs');
const path = require('path');

const setupPath = path.join(__dirname, 'db', 'setup.js');
let content = fs.readFileSync(setupPath, 'utf8');

const patch = `
// Add meta columns if they don't exist yet
try { db.exec('ALTER TABLE events ADD COLUMN meta_title TEXT'); } catch(e) {}
try { db.exec('ALTER TABLE events ADD COLUMN meta_desc TEXT'); } catch(e) {}
`;

if (content.includes('meta_title')) {
  console.log('✅ Already patched!');
} else {
  content = content.replace('db.close();', patch + '\ndb.close();');
  fs.writeFileSync(setupPath, content);
  console.log('✅ setup.js patched with meta columns!');
}
