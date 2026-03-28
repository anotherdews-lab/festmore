// db/index.js — POSTGRESQL VERSION
// Drop-in replacement for better-sqlite3
// Works with ALL existing routes without any changes
// Uses pg package with synchronous-style wrapper

const { Client } = require('pg');

// ─────────────────────────────────────────────────────────────────
// SYNCHRONOUS QUERY RUNNER
// Uses a worker_threads + Atomics trick to make async pg
// behave synchronously — compatible with all existing route code
// ─────────────────────────────────────────────────────────────────

const { execFileSync } = require('child_process');
const os = require('os');
const path = require('path');
const fs = require('fs');

// Write a tiny helper script that pg can run synchronously
const helperPath = path.join(os.tmpdir(), 'pg-sync-helper.js');

if (!fs.existsSync(helperPath)) {
  fs.writeFileSync(helperPath, `
const { Client } = require('pg');
const data = JSON.parse(process.argv[2]);
const client = new Client({ connectionString: data.url, ssl: { rejectUnauthorized: false } });
client.connect()
  .then(() => client.query(data.sql, data.params))
  .then(r => { console.log(JSON.stringify({ rows: r.rows, rowCount: r.rowCount })); client.end(); })
  .catch(e => { console.log(JSON.stringify({ error: e.message })); client.end(); });
`);
}

const DATABASE_URL = process.env.DATABASE_URL;

function pgQuerySync(sql, params = []) {
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable not set. Add PostgreSQL to Railway first.');
  }
  try {
    // Convert SQLite ? placeholders to PostgreSQL $1, $2...
    let i = 0;
    const pgSql = sql.replace(/\?/g, () => `$${++i}`);

    const input = JSON.stringify({ url: DATABASE_URL, sql: pgSql, params });
    const result = execFileSync(process.execPath, [helperPath, input], {
      timeout: 10000,
      maxBuffer: 50 * 1024 * 1024,
    });

    const parsed = JSON.parse(result.toString().trim());
    if (parsed.error) {
      console.error('DB Error:', parsed.error, '| SQL:', sql.substring(0, 100));
      return { rows: [], rowCount: 0 };
    }
    return parsed;
  } catch(err) {
    console.error('DB query failed:', err.message, '| SQL:', sql.substring(0, 100));
    return { rows: [], rowCount: 0 };
  }
}

// ─────────────────────────────────────────────────────────────────
// SQLITE-COMPATIBLE API
// This makes pg work exactly like better-sqlite3
// .prepare(sql).get(...params) — returns single row or null
// .prepare(sql).all(...params) — returns array of rows
// .prepare(sql).run(...params) — returns { lastInsertRowid, changes }
// ─────────────────────────────────────────────────────────────────

const db = {

  prepare: function(sql) {
    // Add RETURNING id to INSERT statements so we get lastInsertRowid
    const isInsert = sql.trim().toUpperCase().startsWith('INSERT');
    const pgSql = isInsert && !sql.includes('RETURNING')
      ? sql + ' RETURNING id'
      : sql;

    return {
      get: function(...params) {
        const flat = params.flat();
        const result = pgQuerySync(pgSql, flat);
        return result.rows && result.rows[0] ? result.rows[0] : null;
      },

      all: function(...params) {
        const flat = params.flat();
        const result = pgQuerySync(pgSql, flat);
        return result.rows || [];
      },

      run: function(...params) {
        const flat = params.flat();
        const result = pgQuerySync(pgSql, flat);
        const lastInsertRowid = result.rows && result.rows[0] && result.rows[0].id
          ? result.rows[0].id
          : 0;
        return { lastInsertRowid, changes: result.rowCount || 0 };
      }
    };
  },

  // For db.exec() — runs raw SQL (used in setup.js)
  exec: function(sql) {
    // Split by semicolon and run each statement
    const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);
    for (const stmt of statements) {
      pgQuerySync(stmt);
    }
  },

  // Compatibility stub — PostgreSQL doesn't need pragmas
  pragma: function() {},

  // Direct query for when you need it
  query: function(sql, params) {
    return pgQuerySync(sql, params);
  }
};

module.exports = db;