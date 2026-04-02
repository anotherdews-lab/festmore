// db/index.js — POSTGRESQL ADAPTER
// Connects to PostgreSQL on Railway
// Falls back to SQLite for local development
// Mimics better-sqlite3 synchronous API so no route files need changing

const DATABASE_URL = process.env.DATABASE_URL;

if (DATABASE_URL && DATABASE_URL.startsWith('postgresql')) {

  const { Pool } = require('pg');

  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: DATABASE_URL.includes('railway.internal')
      ? false
      : { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  pool.on('error', (err) => {
    console.error('PostgreSQL pool error:', err.message);
  });

  // Test connection on startup
  pool.connect((err, client, done) => {
    if (err) {
      console.error('❌ PostgreSQL connection failed:', err.message);
    } else {
      console.log('✅ PostgreSQL connected successfully');
      done();
    }
  });

  // Convert SQLite ? placeholders to PostgreSQL $1, $2 etc
function convertSQL(sql) {
    let i = 0;
    // Convert INSERT OR IGNORE to PostgreSQL syntax
    sql = sql.replace(/INSERT OR IGNORE INTO/gi, 'INSERT INTO');
    sql = sql.replace(/INSERT OR REPLACE INTO/gi, 'INSERT INTO');
    // Handle SQLite datetime() function
    sql = sql.replace(/datetime\('now'\)/gi, 'NOW()');
    sql = sql.replace(/datetime\('now',\s*'[^']*'\)/gi, 'NOW()');
    // Convert ? to $1, $2 etc
    sql = sql.replace(/\?/g, () => '$' + (++i));
    return sql;
  }

  // Synchronous query using Atomics + SharedArrayBuffer trick
  // We spawn a worker and wait synchronously
  function syncQuery(sql, params, mode) {
    const { execFileSync } = require('child_process');
    const fs = require('fs');
    const os = require('os');
    const path = require('path');
    const crypto = require('crypto');

    const id = crypto.randomBytes(6).toString('hex');
    const tmpFile = path.join(os.tmpdir(), 'pgquery_' + id + '.json');
    const resultFile = path.join(os.tmpdir(), 'pgresult_' + id + '.json');

    const pgSql = convertSQL(sql);

    // Write query to temp file
    fs.writeFileSync(tmpFile, JSON.stringify({
      sql: pgSql,
      params: params || [],
      mode,
      connectionString: DATABASE_URL,
    }));

    // Run query in child process synchronously
    const workerCode = `
const{Client}=require('pg');
const fs=require('fs');
const q=JSON.parse(fs.readFileSync(process.argv[1]));
const c=new Client({
  connectionString:q.connectionString,
  ssl:q.connectionString.includes('railway.internal')?false:{rejectUnauthorized:false}
});
c.connect()
  .then(()=>c.query(q.sql,q.params))
  .then(r=>{
    let out;
    if(q.mode==='get') out=r.rows[0]||null;
    else if(q.mode==='all') out=r.rows||[];
    else {
      const id=r.rows&&r.rows[0]?r.rows[0].id:null;
      out={lastInsertRowid:id,changes:r.rowCount||0};
    }
    fs.writeFileSync(process.argv[2],JSON.stringify({ok:true,data:out}));
    c.end();
  })
  .catch(e=>{
    fs.writeFileSync(process.argv[2],JSON.stringify({ok:false,error:e.message}));
    c.end();
  });
`;

    try {
      execFileSync(process.execPath, ['-e', workerCode, tmpFile, resultFile], {
        timeout: 15000,
        stdio: 'pipe',
      });

      const result = JSON.parse(fs.readFileSync(resultFile, 'utf8'));

      try { fs.unlinkSync(tmpFile); } catch(e) {}
      try { fs.unlinkSync(resultFile); } catch(e) {}

      if (!result.ok) {
        throw new Error(result.error);
      }

      return result.data;

    } catch(err) {
      try { fs.unlinkSync(tmpFile); } catch(e) {}
      try { fs.unlinkSync(resultFile); } catch(e) {}
      console.error('DB query error:', err.message, '| SQL:', pgSql.substring(0, 100));
      if (mode === 'get') return null;
      if (mode === 'all') return [];
      return { lastInsertRowid: 0, changes: 0 };
    }
  }

  // Return INSERT sql with RETURNING id
  function addReturning(sql) {
    const upper = sql.trim().toUpperCase();
    if (upper.startsWith('INSERT') && !upper.includes('RETURNING')) {
      return sql.trim() + ' RETURNING id';
    }
    return sql;
  }

  // The db object — mimics better-sqlite3 API
  const db = {
    prepare(sql) {
      const originalSql = sql;
      return {
        get(...args) {
          // Handle both .get(params_array) and .get(p1, p2, p3)
          const params = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
          return syncQuery(originalSql, params, 'get');
        },
        all(...args) {
          const params = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
          return syncQuery(originalSql, params, 'all');
        },
        run(...args) {
          const params = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
          const sqlWithReturn = addReturning(originalSql);
          return syncQuery(sqlWithReturn, params, 'run');
        },
      };
    },

    // For raw async queries if needed
    async query(sql, params) {
      const pgSql = convertSQL(sql);
      return pool.query(pgSql, params);
    },

    // Compatibility methods
    pragma() { return null; },
    close() { pool.end(); },
  };

  module.exports = db;

} else {
  // ── LOCAL DEVELOPMENT — use SQLite ──────────────────────
  const Database = require('better-sqlite3');
  const path = require('path');
  const db = new Database(path.join(__dirname, 'festmore.db'));
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  console.log('📁 Using SQLite (local development)');
  module.exports = db;
}