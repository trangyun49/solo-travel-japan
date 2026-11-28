'use strict';
const express = require('express');
const db = require('../db');
const v = require('../validate');
const { requireAdmin } = require('../auth');

const router = express.Router();
router.use(requireAdmin);

const n = (row) => Number((row && row.n) || 0);

router.get('/stats', async (_req, res) => {
  const [users] = await db.query('SELECT COUNT(*) AS n FROM users');
  const [admins] = await db.query("SELECT COUNT(*) AS n FROM users WHERE role = 'admin'");
  const [posts] = await db.query('SELECT COUNT(*) AS n FROM posts WHERE author_id IS NOT NULL');
  const [favs] = await db.query('SELECT COUNT(*) AS n FROM favorites');
  const [searches] = await db.query('SELECT COUNT(*) AS n FROM search_history');
  const [places] = await db.query('SELECT COUNT(*) AS n FROM places');
  const topRoutes = await db.query(
    `SELECT from_city, to_city, COUNT(*) AS n FROM search_history GROUP BY from_city, to_city ORDER BY n DESC LIMIT 5`
  );
  res.json({
    users: n(users), admins: n(admins), userPosts: n(posts), favorites: n(favs), searches: n(searches), places: n(places),
    topRoutes: topRoutes.map((r) => ({ from: r.from_city, to: r.to_city, n: Number(r.n) })),
  });
});

router.get('/users', async (_req, res) => {
  const rows = await db.query(
    `SELECT u.id, u.email, u.display_name, u.role, u.created_at,
            (SELECT COUNT(*) FROM posts p WHERE p.author_id = u.id) AS posts,
            (SELECT COUNT(*) FROM favorites f WHERE f.user_id = u.id) AS favorites
       FROM users u ORDER BY u.id DESC LIMIT 500`
  );
  res.json({
    users: rows.map((u) => ({
      id: u.id, email: u.email, displayName: u.display_name, role: u.role === 'admin' ? 'admin' : 'user',
      createdAt: u.created_at, posts: Number(u.posts), favorites: Number(u.favorites),
    })),
  });
});

router.get('/posts', async (_req, res) => {
  const rows = await db.query(
    `SELECT p.slug, p.title, p.lang, p.created_at, u.display_name AS author_name, u.email AS author_email
       FROM posts p JOIN users u ON u.id = p.author_id ORDER BY p.created_at DESC LIMIT 500`
  );
  res.json({ posts: rows });
});

router.put('/users/:id/role', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw new v.HttpError(400, '不正なリクエストです。');
  if (id === Number(req.user.id)) throw new v.HttpError(400, '自分の権限は変更できません。');
  const role = v.oneOf(req.body.role, ['admin', 'user'], '権限');
  const target = await db.one('SELECT id FROM users WHERE id = $1', [id]);
  if (!target) throw new v.HttpError(404, 'ユーザーが見つかりません。');
  await db.query('UPDATE users SET role = $1, updated_at = $2 WHERE id = $3', [role, new Date().toISOString(), id]);
  res.json({ ok: true, role });
});

module.exports = router;
