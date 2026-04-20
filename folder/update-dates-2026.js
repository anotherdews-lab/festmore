// update-dates-2026.js
// Updates all past/2025 events to 2026 equivalent dates
// Keeps the same month and day, just bumps the year

const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, 'db', 'festmore.db'));

const today = new Date().toISOString().split('T')[0]; // e.g. 2026-03-22

// Get all events with 2025 dates or past dates
const events = db.prepare(`
  SELECT id, title, start_date, end_date, date_display
  FROM events
  WHERE status='active'
  AND (
    start_date LIKE '2025%'
    OR start_date < ?
  )
`).all(today);

console.log(`Found ${events.length} events to update...`);

let updated = 0;

for (const event of events) {
  try {
    let newStart    = event.start_date || '';
    let newEnd      = event.end_date || '';
    let newDisplay  = event.date_display || '';

    // Bump start date year
    if (newStart.startsWith('2025')) {
      newStart = newStart.replace('2025', '2026');
    } else if (newStart.startsWith('2024')) {
      newStart = newStart.replace('2024', '2026');
    } else if (newStart < today) {
      // Past date — add 1 year
      const d = new Date(newStart);
      d.setFullYear(d.getFullYear() + 1);
      newStart = d.toISOString().split('T')[0];
    }

    // Bump end date year
    if (newEnd.startsWith('2025')) {
      newEnd = newEnd.replace('2025', '2026');
    } else if (newEnd.startsWith('2024')) {
      newEnd = newEnd.replace('2024', '2026');
    } else if (newEnd && newEnd < today) {
      const d = new Date(newEnd);
      d.setFullYear(d.getFullYear() + 1);
      newEnd = d.toISOString().split('T')[0];
    }

    // Update date_display text — replace 2025 and 2024 with 2026
    newDisplay = newDisplay
      .replace(/2025/g, '2026')
      .replace(/2024/g, '2026');

    db.prepare(`
      UPDATE events
      SET start_date=?, end_date=?, date_display=?
      WHERE id=?
    `).run(newStart, newEnd, newDisplay, event.id);

    updated++;
    console.log(`✅ ${event.title.substring(0, 50)} → ${newStart}`);
  } catch(err) {
    console.error(`❌ Error: ${event.title} — ${err.message}`);
  }
}

console.log(`\n✅ Done! Updated ${updated} events to 2026 dates.`);
db.close();
