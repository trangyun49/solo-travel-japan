'use strict';
/**
 * Database adapter.
 *  - DATABASE_URL set  → PostgreSQL (production: Neon / Render / Supabase …)
 *  - otherwise         → SQLite file via Node's built-in `node:sqlite` (local development)
 * All SQL in the app is written with Postgres-style `$1, $2` placeholders and
 * portable types so the same queries run on both engines.
 */
const path = require('path');
const fs = require('fs');

const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL || '';
const isPg = Boolean(DATABASE_URL);

let pool = null;
let sqlite = null;

function initDriver() {
  if (isPg) {
    if (pool) return;
    const { Pool } = require('pg');
    const local = /localhost|127\.0\.0\.1/.test(DATABASE_URL);
    pool = new Pool({
      connectionString: DATABASE_URL,
      ssl: local ? false : { rejectUnauthorized: true },
      max: Number(process.env.PG_POOL_MAX || 3),
      idleTimeoutMillis: 10_000,
    });
  } else {
    if (sqlite) return;
    if (process.env.VERCEL) throw new Error('DATABASE_URL (PostgreSQL) is required on Vercel.');
    // Suppress the one-time ExperimentalWarning for node:sqlite
    const origEmit = process.emitWarning;
    process.emitWarning = (w, ...a) => (String(w).includes('SQLite') ? undefined : origEmit.call(process, w, ...a));
    const { DatabaseSync } = require('node:sqlite');
    process.emitWarning = origEmit;
    const file = process.env.SQLITE_FILE || path.join(__dirname, '..', 'data', 'app.db');
    if (file !== ':memory:') fs.mkdirSync(path.dirname(file), { recursive: true });
    sqlite = new DatabaseSync(file);
    sqlite.exec('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;');
  }
}

/** Convert `$1` placeholders to SQLite `?1`. */
function toSqlite(sql) {
  return sql.replace(/\$(\d+)/g, '?$1');
}

async function query(sql, params = []) {
  initDriver();
  if (isPg) {
    const res = await pool.query(sql, params);
    return res.rows;
  }
  const stmt = sqlite.prepare(toSqlite(sql));
  const p = params.map((v) => (v === undefined ? null : typeof v === 'boolean' ? (v ? 1 : 0) : v));
  if (/^\s*(select|with)\b/i.test(sql) || /\breturning\b/i.test(sql)) return stmt.all(...p);
  stmt.run(...p);
  return [];
}

async function one(sql, params) {
  const rows = await query(sql, params);
  return rows[0] || null;
}

/** Run a multi-statement script (schema). */
async function exec(script) {
  initDriver();
  if (isPg) {
    await pool.query(script);
  } else {
    sqlite.exec(script);
  }
}

module.exports = { query, one, exec, isPg };
