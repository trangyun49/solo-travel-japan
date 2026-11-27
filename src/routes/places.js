'use strict';
const express = require('express');
const db = require('../db');
const v = require('../validate');
const { REGIONS, CATEGORIES, SEASONS } = require('../data/meta');
const { CITIES } = require('../data/cities');

const router = express.Router();

const LIST_COLS = `id, slug, name, name_en, name_vi, region, prefecture, area, category, months, solo_score, featured, summary, summary_en, summary_vi, tags, image, city`;

function shape(p) {
  return {
    ...p,
    months: String(p.months).split(',').filter(Boolean).map(Number),
    tags: p.tags ? String(p.tags).split(',') : [],
    featured: Boolean(Number(p.featured)),
    solo_score: Number(p.solo_score),
  };
}

router.get('/', async (req, res) => {
  const where = [];
  const params = [];
  const add = (sqlFrag, value) => {
    params.push(value);
    where.push(sqlFrag.replace('?', '$' + params.length));
  };
  const q = req.query;

  if (q.region) add('region = ?', v.oneOf(q.region, REGIONS.map((r) => r.key), '地域'));
  if (q.city) add('city = ?', v.oneOf(q.city, CITIES.map((c) => c.key), '目的地'));
  if (q.category) add('category = ?', v.oneOf(q.category, CATEGORIES.map((c) => c.key), 'カテゴリ'));

  let months = null;
  if (q.month) {
    const m = Number(q.month);
    if (!Number.isInteger(m) || m < 1 || m > 12) throw new v.HttpError(400, '月の値が正しくありません。');
    months = [m];
  } else if (q.season) {
    const s = SEASONS.find((x) => x.key === q.season);
    if (!s) throw new v.HttpError(400, '季節の値が正しくありません。');
    months = s.months;
  }
  if (months) {
    const parts = months.map((m) => {
      params.push(`%,${m},%`);
      return `months LIKE $${params.length}`;
    });
    where.push('(' + parts.join(' OR ') + ')');
  }
  if (q.solo === '1') where.push('solo_score >= 5');
  if (q.featured === '1') where.push('featured = 1');
  if (q.q) {
    const kw = v.str(q.q, { field: 'キーワード', max: 50 }).toLowerCase();
    if (kw) {
      params.push(`%${kw}%`);
      const i = params.length;
      where.push(
        `(LOWER(name) LIKE $${i} OR LOWER(name_en) LIKE $${i} OR LOWER(prefecture) LIKE $${i} OR LOWER(area) LIKE $${i} OR LOWER(name_vi) LIKE $${i} OR LOWER(summary) LIKE $${i} OR LOWER(summary_en) LIKE $${i} OR LOWER(summary_vi) LIKE $${i} OR LOWER(tags) LIKE $${i})`
      );
    }
  }

  const order = q.sort === 'solo' ? 'solo_score DESC, featured DESC, id ASC' : 'featured DESC, solo_score DESC, id ASC';
  const limit = Math.min(Math.max(parseInt(q.limit, 10) || 60, 1), 100);
  const sql = `SELECT ${LIST_COLS} FROM places ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY ${order} LIMIT ${limit}`;
  const rows = await db.query(sql, params);
  res.json({ places: rows.map(shape), total: rows.length });
});

router.get('/:slug', async (req, res) => {
  const p = await db.one('SELECT * FROM places WHERE slug = $1', [req.params.slug]);
  if (!p) throw new v.HttpError(404, 'スポットが見つかりません。');
  let isFavorite = false;
  if (req.user) {
    isFavorite = Boolean(
      await db.one('SELECT 1 AS x FROM favorites WHERE user_id = $1 AND place_id = $2', [req.user.id, p.id])
    );
  }
  const related = await db.query(
    `SELECT ${LIST_COLS} FROM places WHERE region = $1 AND id <> $2 ORDER BY solo_score DESC, id ASC LIMIT 4`,
    [p.region, p.id]
  );
  res.json({ place: shape(p), isFavorite, related: related.map(shape) });
});

module.exports = router;
