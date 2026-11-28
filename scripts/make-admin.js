'use strict';
/**
 * Grant (or remove) admin rights for an existing account.
 *   npm run make-admin -- you@example.com          → admin
 *   npm run make-admin -- you@example.com --remove → normal user
 * Uses DATABASE_URL from .env / environment (Neon in production), otherwise the local SQLite file.
 */
try { require('fs').readFileSync('.env', 'utf8').split('\n').forEach((l) => { const m = l.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, ''); }); } catch (_) {}
const { ready } = require('../src/init');
const db = require('../src/db');

(async () => {
  const email = (process.argv[2] || '').trim().toLowerCase();
  const role = process.argv.includes('--remove') ? 'user' : 'admin';
  if (!email || !email.includes('@')) {
    console.error('Usage: npm run make-admin -- you@example.com [--remove]');
    process.exit(1);
  }
  await ready();
  const user = await db.one('SELECT id, display_name FROM users WHERE lower(email) = $1', [email]);
  if (!user) {
    console.error(`No account with email ${email}. Register on the site first.`);
    process.exit(1);
  }
  await db.query('UPDATE users SET role = $1 WHERE id = $2', [role, user.id]);
  console.log(`${user.display_name} <${email}> is now: ${role}`);
  process.exit(0);
})().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
