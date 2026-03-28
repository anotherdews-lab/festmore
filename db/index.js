// db/index.js — POSTGRESQL VERSION v2
// Fixed: no temp file trick — uses pg directly with proper path

const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const DATABASE_URL = process.env.DATABASE_URL;

// Write helper to the app directory where pg IS available
const helperPath = path.join(__dirname, '_pg_helper.js');

// Always write fresh helper so it has the right pg path
fs.writeFileSync(helperPath, `
const { Client } = require('${path.join(__dirname, '../node_modules/pg')}');
const data = JSON.parse(process.argv[2]);
const client = new Client({
  connectionString: data.url,
  ssl: { rejectUnauthorized: false }
});
client.connect()
  .then(() => client.query(data.sql, data.params))
  .then(r => {
    process.stdout.write(JSON.stringify({ rows: r.rows, rowCount: r.rowCount }));
    client.end();
  })
  .catch(e => {
    process.stdout.write(JSON.stringify({ error: e.message }));
    client.end();
  });
`);

function pgQuerySync(sql, params = []) {
  if (!DATABASE_URL) {
    console.error('DATABASE_URL not set!');
    return { rows: [], rowCount: 0 };
  }
  try {
    let i = 0;
    const pgSql = sql.replace(/\?/g, () => `$${++i}`);
    const input = JSON.stringify({ url: DATABASE_URL, sql: pgSql, params });
    const result = execFileSync(process.execPath, [helperPath, input], {
      timeout: 15000,
      maxBuffer: 50 * 1024 * 1024,
    });
    const parsed = JSON.parse(result.toString().trim());
    if (parsed.error) {
      console.error('DB Error:', parsed.error, '| SQL:', sql.substring(0, 80));
      return { rows: [], rowCount: 0 };
    }
    return parsed;
  } catch(err) {
    console.error('DB query failed:', err.message.substring(0, 100));
    return { rows: [], rowCount: 0 };
  }
}

const db = {
  prepare: function(sql) {
    const isInsert = sql.trim().toUpperCase().startsWith('INSERT');
    const finalSql = isInsert && !sql.includes('RETURNING')
      ? sql + ' RETURNING id'
      : sql;

    return {
      get: function(...params) {
        const result = pgQuerySync(finalSql, params.flat());
        return result.rows && result.rows[0] ? result.rows[0] : null;
      },
      all: function(...params) {
        const result = pgQuerySync(finalSql, params.flat());
        return result.rows || [];
      },
      run: function(...params) {
        const result = pgQuerySync(finalSql, params.flat());
        const lastInsertRowid = result.rows && result.rows[0] && result.rows[0].id
          ? result.rows[0].id : 0;
        return { lastInsertRowid, changes: result.rowCount || 0 };
      }
    };
  },
  exec: function(sql) {
    const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);
    for (const stmt of statements) pgQuerySync(stmt);
  },
  pragma: function() {},
  query: function(sql, params) { return pgQuerySync(sql, params); }
};

module.exports = db;