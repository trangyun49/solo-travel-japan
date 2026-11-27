'use strict';
const jwt = require('jsonwebtoken');
const db = require('./db');
const { getJwtSecret } = require('./init');

const COOKIE = 'stj_session';
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const isProd = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);

function cookieOptions() {
  return { httpOnly: true, secure: isProd, sameSite: 'lax', path: '/', maxAge: MAX_AGE_MS };
}

function issueSession(res, user) {
  const token = jwt.sign({ sub: String(user.id), v: user.token_version }, getJwtSecret(), {
    algorithm: 'HS256',
    expiresIn: '7d',
  });
  res.cookie(COOKIE, token, cookieOptions());
}

function clearSession(res) {
  const { maxAge, ...opts } = cookieOptions();
  res.clearCookie(COOKIE, opts);
}

/** Attach req.user if a valid session cookie is present. Never throws. */
async function attachUser(req, _res, next) {
  req.user = null;
  const token = req.cookies && req.cookies[COOKIE];
  if (!token) return next();
  try {
    const payload = jwt.verify(token, getJwtSecret(), { algorithms: ['HS256'] });
    const user = await db.one(
      'SELECT id, email, display_name, home_city, bio, token_version, created_at FROM users WHERE id = $1',
      [Number(payload.sub)]
    );
    if (user && Number(user.token_version) === Number(payload.v)) req.user = user;
  } catch (_) {
    /* invalid / expired token → anonymous */
  }
  next();
}

function requireAuth(req, res, next) {
  if (!req.user) {
    const { HttpError } = require('./validate');
    throw new HttpError(401, 'ログインが必要です。');
  }
  next();
}

function publicUser(u) {
  return {
    id: u.id,
    email: u.email,
    displayName: u.display_name,
    homeCity: u.home_city,
    bio: u.bio,
    createdAt: u.created_at,
  };
}

module.exports = { issueSession, clearSession, attachUser, requireAuth, publicUser };
