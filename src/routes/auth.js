'use strict';
const express = require('express');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const db = require('../db');
const v = require('../validate');
const { issueSession, clearSession, requireAuth, publicUser } = require('../auth');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (req, res) => {
    const { langOf, translate } = require('../i18n');
    res.status(429).json({ error: translate('試行回数が多すぎます。しばらくしてから再度お試しください。', langOf(req)) });
  },
});

const now = () => new Date().toISOString();

router.post('/register', authLimiter, async (req, res) => {
  const email = v.email(req.body.email);
  const password = v.password(req.body.password);
  const displayName = v.str(req.body.displayName, { field: 'ニックネーム', min: 1, max: 40, required: true });

  const exists = await db.one('SELECT id FROM users WHERE email = $1', [email]);
  if (exists) throw new v.HttpError(409, 'このメールアドレスは既に登録されています。');

  const hash = await bcrypt.hash(password, 10);
  const t = now();
  const [user] = await db.query(
    `INSERT INTO users (email, password_hash, display_name, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $4)
     RETURNING id, email, display_name, home_city, bio, token_version, created_at`,
    [email, hash, displayName, t]
  );
  issueSession(res, user);
  res.status(201).json({ user: publicUser(user) });
});

router.post('/login', authLimiter, async (req, res) => {
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  if (!email || !password) throw new v.HttpError(400, 'メールアドレスとパスワードを入力してください。');

  const user = await db.one('SELECT * FROM users WHERE email = $1', [email]);
  // Always run bcrypt to keep timing similar whether or not the user exists.
  const ok = await bcrypt.compare(password, user ? user.password_hash : '$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinv');
  if (!user || !ok) throw new v.HttpError(401, 'メールアドレスまたはパスワードが正しくありません。');

  issueSession(res, user);
  res.json({ user: publicUser(user) });
});

router.post('/logout', (req, res) => {
  clearSession(res);
  res.json({ ok: true });
});

/** Sign out from every device by rotating the token version. */
router.post('/logout-all', requireAuth, async (req, res) => {
  await db.query('UPDATE users SET token_version = token_version + 1 WHERE id = $1', [req.user.id]);
  clearSession(res);
  res.json({ ok: true });
});

router.get('/me', (req, res) => {
  res.json({ user: req.user ? publicUser(req.user) : null });
});

module.exports = router;
