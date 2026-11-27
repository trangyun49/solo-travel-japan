'use strict';
const express = require('express');
const crypto = require('crypto');
const db = require('../db');
const v = require('../validate');
const { requireAuth } = require('../auth');
const { REGIONS, SEASONS, POST_CATEGORIES, COVERS } = require('../data/meta');

const router = express.Router();
const now = () => new Date().toISOString();

const LIST_SQL = `SELECT p.slug, p.title, p.title_en, p.title_vi, p.excerpt_en, p.excerpt_vi, p.category, p.region, p.season, p.cover, p.excerpt, p.created_at, p.updated_at,
                         p.author_id, COALESCE(u.display_name, '編集部') AS author_name
                    FROM posts p LEFT JOIN users u ON u.id = p.author_id`;

router.get('/', async (req, res) => {
  const where = [];
  const params = [];
  const add = (frag, val) => {
    params.push(val);
    where.push(frag.replace('?', '$' + params.length));
  };
  const q = req.query;
  if (q.category) add('p.category = ?', v.oneOf(q.category, POST_CATEGORIES.map((c) => c.key), 'カテゴリ'));
  if (q.region) add('p.region = ?', v.oneOf(q.region, REGIONS.map((r) => r.key), '地域'));
  if (q.season) {
    v.oneOf(q.season, SEASONS.map((s) => s.key), '季節');
    params.push(q.season);
    where.push(`(p.season = $${params.length} OR p.season = 'all')`);
  }
  if (q.source === 'editorial') where.push('p.author_id IS NULL');
  if (q.source === 'community') where.push('p.author_id IS NOT NULL');
  if (q.q) {
    const kw = v.str(q.q, { field: 'キーワード', max: 50 }).toLowerCase();
    if (kw) {
      params.push(`%${kw}%`);
      const i = params.length;
      where.push(`(LOWER(p.title) LIKE $${i} OR LOWER(p.excerpt) LIKE $${i} OR LOWER(p.body) LIKE $${i} OR LOWER(p.title_en) LIKE $${i} OR LOWER(p.title_vi) LIKE $${i})`);
    }
  }
  const sqlWhere = where;
  const limit = Math.min(Math.max(parseInt(q.limit, 10) || 30, 1), 60);
  const rows = await db.query(
    `${LIST_SQL} ${sqlWhere.length ? 'WHERE ' + sqlWhere.join(' AND ') : ''} ORDER BY p.created_at DESC LIMIT ${limit}`,
    params
  );
  res.json({ posts: rows });
});

router.get('/:slug', async (req, res) => {
  const post = await db.one(
    `SELECT p.*, COALESCE(u.display_name, '編集部') AS author_name FROM posts p LEFT JOIN users u ON u.id = p.author_id WHERE p.slug = $1`,
    [req.params.slug]
  );
  if (!post) throw new v.HttpError(404, '記事が見つかりません。');
  const canEdit = Boolean(req.user && post.author_id && Number(post.author_id) === Number(req.user.id));
  const related = await db.query(
    `${LIST_SQL} WHERE p.slug <> $1 AND (p.category = $2 OR p.region = $3) ORDER BY p.created_at DESC LIMIT 3`,
    [post.slug, post.category, post.region || '__none__']
  );
  res.json({ post, canEdit, related });
});

function readPostBody(body) {
  const title = v.str(body.title, { field: 'タイトル', min: 4, max: 80, required: true });
  const category = v.oneOf(body.category, POST_CATEGORIES.map((c) => c.key), 'カテゴリ');
  const region = body.region ? v.oneOf(body.region, REGIONS.map((r) => r.key), '地域') : '';
  const season = v.oneOf(body.season, ['all', ...SEASONS.map((s) => s.key)], '季節', 'all');
  const cover = body.cover ? v.oneOf(body.cover, COVERS, 'カバー画像') : '';
  const text = v.str(body.body, { field: '本文', min: 30, max: 8000, required: true });
  const excerpt = v.str(body.excerpt, { field: '概要', max: 140 }) || text.replace(/^#+\s*/gm, '').replace(/\s+/g, ' ').slice(0, 110);
  return { title, category, region, season, cover, body: text, excerpt };
}

router.post('/', requireAuth, async (req, res) => {
  const p = readPostBody(req.body);
  const slug = 'u-' + Date.now().toString(36) + '-' + crypto.randomBytes(3).toString('hex');
  const t = now();
  await db.query(
    `INSERT INTO posts (slug, author_id, title, category, region, season, cover, excerpt, body, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$10)`,
    [slug, req.user.id, p.title, p.category, p.region, p.season, p.cover, p.excerpt, p.body, t]
  );
  res.status(201).json({ slug });
});

async function ownPost(req) {
  const post = await db.one('SELECT id, author_id FROM posts WHERE slug = $1', [req.params.slug]);
  if (!post) throw new v.HttpError(404, '記事が見つかりません。');
  if (!post.author_id || Number(post.author_id) !== Number(req.user.id)) throw new v.HttpError(403, 'この記事を編集する権限がありません。');
  return post;
}

router.put('/:slug', requireAuth, async (req, res) => {
  const post = await ownPost(req);
  const p = readPostBody(req.body);
  await db.query(
    `UPDATE posts SET title=$1, category=$2, region=$3, season=$4, cover=$5, excerpt=$6, body=$7, updated_at=$8 WHERE id=$9`,
    [p.title, p.category, p.region, p.season, p.cover, p.excerpt, p.body, now(), post.id]
  );
  res.json({ slug: req.params.slug });
});

router.delete('/:slug', requireAuth, async (req, res) => {
  const post = await ownPost(req);
  await db.query('DELETE FROM posts WHERE id = $1', [post.id]);
  res.json({ ok: true });
});

module.exports = router;
