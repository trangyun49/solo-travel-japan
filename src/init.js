'use strict';
const crypto = require('crypto');
const db = require('./db');
const places = require('./data/places');
const posts = require('./data/posts');
const photos = require('./data/photos');
const placesI18n = require('./data/places-i18n');
const postsI18n = require('./data/posts-i18n');

// Bump when seed content in src/data changes so deployed DBs get refreshed.
const SEED_VERSION = '2026-11-28.3';

const PK = db.isPg ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT';

const SCHEMA = `
CREATE TABLE IF NOT EXISTS app_meta (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS users (
  id            ${PK},
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name  TEXT NOT NULL,
  home_city     TEXT NOT NULL DEFAULT '',
  bio           TEXT NOT NULL DEFAULT '',
  token_version INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS places (
  id          ${PK},
  slug        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  name_en     TEXT NOT NULL DEFAULT '',
  region      TEXT NOT NULL,
  prefecture  TEXT NOT NULL,
  area        TEXT NOT NULL DEFAULT '',
  category    TEXT NOT NULL,
  months      TEXT NOT NULL,
  solo_score  INTEGER NOT NULL DEFAULT 3,
  featured    INTEGER NOT NULL DEFAULT 0,
  summary     TEXT NOT NULL,
  description TEXT NOT NULL,
  solo_tips   TEXT NOT NULL DEFAULT '',
  access      TEXT NOT NULL DEFAULT '',
  budget      TEXT NOT NULL DEFAULT '',
  tags        TEXT NOT NULL DEFAULT '',
  image       TEXT NOT NULL DEFAULT '',
  city        TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS posts (
  id          ${PK},
  slug        TEXT NOT NULL UNIQUE,
  author_id   INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  category    TEXT NOT NULL,
  region      TEXT NOT NULL DEFAULT '',
  season      TEXT NOT NULL DEFAULT 'all',
  cover       TEXT NOT NULL DEFAULT '',
  excerpt     TEXT NOT NULL DEFAULT '',
  body        TEXT NOT NULL,
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS favorites (
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  place_id   INTEGER NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  PRIMARY KEY (user_id, place_id)
);
CREATE TABLE IF NOT EXISTS search_history (
  id         ${PK},
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  from_city  TEXT NOT NULL,
  to_city    TEXT NOT NULL,
  travel_date TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_places_region ON places(region);
CREATE INDEX IF NOT EXISTS idx_places_category ON places(category);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at);
CREATE INDEX IF NOT EXISTS idx_history_user ON search_history(user_id);
`;

// Columns added after the first release (ALTER is idempotent via try/catch on both engines).
const MIGRATIONS = [
  ['places', 'name_vi', "TEXT NOT NULL DEFAULT ''"],
  ['places', 'summary_en', "TEXT NOT NULL DEFAULT ''"],
  ['places', 'summary_vi', "TEXT NOT NULL DEFAULT ''"],
  ['places', 'tips_en', "TEXT NOT NULL DEFAULT ''"],
  ['places', 'tips_vi', "TEXT NOT NULL DEFAULT ''"],
  ['places', 'credit', "TEXT NOT NULL DEFAULT ''"],
  ['places', 'credit_url', "TEXT NOT NULL DEFAULT ''"],
  ['posts', 'title_en', "TEXT NOT NULL DEFAULT ''"],
  ['posts', 'title_vi', "TEXT NOT NULL DEFAULT ''"],
  ['posts', 'excerpt_en', "TEXT NOT NULL DEFAULT ''"],
  ['posts', 'excerpt_vi', "TEXT NOT NULL DEFAULT ''"],
];

async function migrate() {
  for (const [table, col, type] of MIGRATIONS) {
    try {
      await db.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${type}`);
    } catch (err) {
      if (!/duplicate column|already exists/i.test(err.message)) throw err;
    }
  }
}

async function getMeta(key) {
  const row = await db.one('SELECT value FROM app_meta WHERE key = $1', [key]);
  return row ? row.value : null;
}
async function setMeta(key, value) {
  await db.query(
    'INSERT INTO app_meta (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value',
    [key, value]
  );
}

async function seed() {
  for (const p of places) {
    const photo = photos[p.slug] || {};
    const tr = placesI18n[p.slug] || {};
    const en = tr.en || [];
    const vi = tr.vi || [];
    await db.query(
      `INSERT INTO places (slug, name, name_en, region, prefecture, area, category, months, solo_score, featured,
                           summary, description, solo_tips, access, budget, tags, image, city,
                           name_vi, summary_en, summary_vi, tips_en, tips_vi, credit, credit_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25)
       ON CONFLICT (slug) DO UPDATE SET
         name=EXCLUDED.name, name_en=EXCLUDED.name_en, region=EXCLUDED.region, prefecture=EXCLUDED.prefecture,
         area=EXCLUDED.area, category=EXCLUDED.category, months=EXCLUDED.months, solo_score=EXCLUDED.solo_score,
         featured=EXCLUDED.featured, summary=EXCLUDED.summary, description=EXCLUDED.description,
         solo_tips=EXCLUDED.solo_tips, access=EXCLUDED.access, budget=EXCLUDED.budget, tags=EXCLUDED.tags,
         image=EXCLUDED.image, city=EXCLUDED.city, name_vi=EXCLUDED.name_vi, summary_en=EXCLUDED.summary_en,
         summary_vi=EXCLUDED.summary_vi, tips_en=EXCLUDED.tips_en, tips_vi=EXCLUDED.tips_vi, credit=EXCLUDED.credit,
         credit_url=EXCLUDED.credit_url`,
      [
        p.slug, p.name, p.name_en || '', p.region, p.prefecture, p.area || '', p.category,
        ',' + p.months.join(',') + ',', p.solo_score || 3, p.featured ? 1 : 0,
        p.summary, p.description, p.solo_tips || '', p.access || '', p.budget || '',
        (p.tags || []).join(','), photo.image || p.image || '', p.city || '',
        vi[0] || '', en[1] || '', vi[1] || '', en[2] || '', vi[2] || '', photo.credit || '', photo.creditUrl || '',
      ]
    );
  }
  for (const b of posts) {
    const pt = postsI18n[b.slug] || {};
    await db.query(
      `INSERT INTO posts (slug, author_id, title, category, region, season, cover, excerpt, body, created_at, updated_at,
                          title_en, title_vi, excerpt_en, excerpt_vi)
       VALUES ($1, NULL, $2, $3, $4, $5, $6, $7, $8, $9, $9, $10, $11, $12, $13)
       ON CONFLICT (slug) DO UPDATE SET title=EXCLUDED.title, category=EXCLUDED.category, region=EXCLUDED.region,
         season=EXCLUDED.season, cover=EXCLUDED.cover, excerpt=EXCLUDED.excerpt, body=EXCLUDED.body,
         updated_at=EXCLUDED.updated_at, title_en=EXCLUDED.title_en, title_vi=EXCLUDED.title_vi,
         excerpt_en=EXCLUDED.excerpt_en, excerpt_vi=EXCLUDED.excerpt_vi`,
      [b.slug, b.title, b.category, b.region || '', b.season || 'all', b.cover || '', b.excerpt, b.body, b.date,
       (pt.en || [])[0] || '', (pt.vi || [])[0] || '', (pt.en || [])[1] || '', (pt.vi || [])[1] || '']
    );
  }
}

let readyPromise = null;
let jwtSecret = null;

async function init() {
  await db.exec(SCHEMA);
  await migrate();
  if ((await getMeta('seed_version')) !== SEED_VERSION) {
    await seed();
    await setMeta('seed_version', SEED_VERSION);
  }
  // JWT secret: prefer env var; otherwise generate once and persist in the DB
  // so it is never committed to source and survives restarts / serverless cold starts.
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32) {
    jwtSecret = process.env.JWT_SECRET;
  } else {
    await db.query('INSERT INTO app_meta (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING', [
      'jwt_secret',
      crypto.randomBytes(48).toString('hex'),
    ]);
    jwtSecret = await getMeta('jwt_secret');
  }
}

function ready() {
  if (!readyPromise) {
    readyPromise = init().catch((err) => {
      readyPromise = null; // allow retry on next request
      throw err;
    });
  }
  return readyPromise;
}

function getJwtSecret() {
  if (!jwtSecret) throw new Error('Database not initialised');
  return jwtSecret;
}

module.exports = { ready, getJwtSecret, SEED_VERSION };
