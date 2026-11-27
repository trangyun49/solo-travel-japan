'use strict';
const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const v = require('../validate');
const { requireAuth, publicUser, issueSession, clearSession } = require('../auth');
const { CITIES } = require('../data/cities');

const router = express.Router();
router.use(requireAuth);

const now = () => new Date().toISOString();

router.get('/', async (req, res) => {
  const [fav] = await db.query('SELECT COUNT(*) AS n FROM favorites WHERE user_id = $1', [req.user.id]);
  const [pst] = await db.query('SELECT COUNT(*) AS n FROM posts WHERE author_id = $1', [req.user.id]);
  res.json({ user: publicUser(req.user), stats: { favorites: Number(fav.n), posts: Number(pst.n) } });
});

router.put('/profile', async (req, res) => {
  const displayName = v.str(req.body.displayName, { field: 'ニックネーム', min: 1, max: 40, required: true });
  const homeCity = v.str(req.body.homeCity, { field: '出発地', max: 40 });
  if (homeCity && !CITIES.some((c) => c.key === homeCity)) throw new v.HttpError(400, '出発地の値が正しくありません。');
  const bio = v.str(req.body.bio, { field: '自己紹介', max: 300 });
  const [user] = await db.query(
    `UPDATE users SET display_name = $1, home_city = $2, bio = $3, updated_at = $4 WHERE id = $5
     RETURNING id, email, display_name, home_city, bio, token_version, created_at`,
    [displayName, homeCity, bio, now(), req.user.id]
  );
  res.json({ user: publicUser(user) });
});

router.put('/password', async (req, res) => {
  const current = typeof req.body.currentPassword === 'string' ? req.body.currentPassword : '';
  const next = v.password(req.body.newPassword, '新しいパスワード');
  const row = await db.one('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
  if (!(await bcrypt.compare(current, row.password_hash))) throw new v.HttpError(400, '現在のパスワードが正しくありません。');
  const hash = await bcrypt.hash(next, 10);
  // Rotate token_version → all other sessions are signed out; keep this one signed in.
  const [user] = await db.query(
    `UPDATE users SET password_hash = $1, token_version = token_version + 1, updated_at = $2 WHERE id = $3
     RETURNING id, token_version`,
    [hash, now(), req.user.id]
  );
  issueSession(res, user);
  res.json({ ok: true });
});

router.delete('/', async (req, res) => {
  const pw = typeof req.body.password === 'string' ? req.body.password : '';
  const row = await db.one('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
  if (!(await bcrypt.compare(pw, row.password_hash))) throw new v.HttpError(400, 'パスワードが正しくありません。');
  // Explicit deletes so SQLite without FK cascade support also stays clean.
  await db.query('DELETE FROM favorites WHERE user_id = $1', [req.user.id]);
  await db.query('DELETE FROM search_history WHERE user_id = $1', [req.user.id]);
  await db.query('DELETE FROM posts WHERE author_id = $1', [req.user.id]);
  await db.query('DELETE FROM users WHERE id = $1', [req.user.id]);
  clearSession(res);
  res.json({ ok: true });
});

// ---------- Favorites ----------
router.get('/favorites', async (req, res) => {
  const rows = await db.query(
    `SELECT p.slug, p.name, p.name_en, p.region, p.prefecture, p.area, p.category, p.summary, p.image, p.solo_score
       FROM favorites f JOIN places p ON p.id = f.place_id
      WHERE f.user_id = $1 ORDER BY f.created_at DESC`,
    [req.user.id]
  );
  res.json({ places: rows });
});

router.post('/favorites/:slug', async (req, res) => {
  const place = await db.one('SELECT id FROM places WHERE slug = $1', [req.params.slug]);
  if (!place) throw new v.HttpError(404, 'スポットが見つかりません。');
  await db.query(
    'INSERT INTO favorites (user_id, place_id, created_at) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
    [req.user.id, place.id, now()]
  );
  res.json({ favorite: true });
});

router.delete('/favorites/:slug', async (req, res) => {
  const place = await db.one('SELECT id FROM places WHERE slug = $1', [req.params.slug]);
  if (place) await db.query('DELETE FROM favorites WHERE user_id = $1 AND place_id = $2', [req.user.id, place.id]);
  res.json({ favorite: false });
});

// ---------- Search history ----------
router.get('/history', async (req, res) => {
  const rows = await db.query(
    `SELECT id, from_city, to_city, travel_date, created_at FROM search_history
      WHERE user_id = $1 ORDER BY id DESC LIMIT 20`,
    [req.user.id]
  );
  res.json({ history: rows });
});

router.delete('/history', async (req, res) => {
  await db.query('DELETE FROM search_history WHERE user_id = $1', [req.user.id]);
  res.json({ ok: true });
});

// ---------- My posts ----------
router.get('/posts', async (req, res) => {
  const rows = await db.query(
    `SELECT slug, title, category, region, season, cover, excerpt, created_at, updated_at
       FROM posts WHERE author_id = $1 ORDER BY created_at DESC`,
    [req.user.id]
  );
  res.json({ posts: rows });
});

module.exports = router;
