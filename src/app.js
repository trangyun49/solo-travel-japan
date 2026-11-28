'use strict';
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { ready } = require('./init');
const { attachUser } = require('./auth');
const { HttpError } = require('./validate');
const meta = require('./data/meta');
const { langOf, translate } = require('./i18n');

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1); // behind Vercel / Render proxies

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        'default-src': ["'self'"],
        'script-src': ["'self'"],
        'style-src': ["'self'", 'https://fonts.googleapis.com'],
        'font-src': ["'self'", 'https://fonts.gstatic.com'],
        'img-src': ["'self'", 'data:', 'https:'],
        'connect-src': ["'self'"],
        'frame-ancestors': ["'none'"],
        'form-action': ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);
app.use(express.json({ limit: '64kb' }));
app.use(cookieParser());

// ---------- API ----------
const api = express.Router();

// Make sure schema + seed are ready (lazy, once per process / serverless instance).
api.use(async (_req, _res, next) => {
  await ready();
  next();
});

// Basic CSRF defence: state-changing requests must be JSON and same-origin.
api.use((req, _res, next) => {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    if (!req.is('application/json')) throw new HttpError(415, 'Content-Type must be application/json');
    const origin = req.get('origin');
    if (origin) {
      const host = req.get('x-forwarded-host') || req.get('host');
      let ok = false;
      try {
        ok = new URL(origin).host === host;
      } catch (_) {}
      if (!ok) throw new HttpError(403, '不正なリクエストです。');
    }
  }
  next();
});

api.use(attachUser);
api.get('/health', (_req, res) => res.json({ ok: true, db: require('./db').isPg ? 'postgres' : 'sqlite' }));
api.get('/meta', (_req, res) => res.json(meta));
api.use('/auth', require('./routes/auth'));
api.use('/account', require('./routes/account'));
api.use('/places', require('./routes/places'));
api.use('/posts', require('./routes/posts'));
api.use('/trips', require('./routes/trips'));
api.use('/admin', require('./routes/admin'));
api.use((_req, _res) => {
  throw new HttpError(404, 'Not found');
});

app.use('/api', api);

// ---------- Static frontend ----------
const pub = path.join(__dirname, '..', 'public');
app.use(
  express.static(pub, {
    extensions: ['html'],
    setHeaders(res, file) {
      if (/\.(jpg|png|webp|svg)$/.test(file)) res.setHeader('Cache-Control', 'public, max-age=604800');
    },
  })
);
app.use((req, res) => {
  res.status(404).sendFile(path.join(pub, '404.html'));
});

// ---------- Errors ----------
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  if (err.type === 'entity.parse.failed') err = new HttpError(400, 'JSONの形式が正しくありません。');
  const status = err.status && err.status < 600 ? err.status : 500;
  if (status >= 500) console.error(err);
  const msg = status >= 500 ? 'サーバーエラーが発生しました。時間をおいて再度お試しください。' : err.message;
  res.status(status).json({ error: translate(msg, langOf(req)) });
});

module.exports = app;
