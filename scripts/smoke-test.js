'use strict';
/* End-to-end API smoke test. Runs against an in-memory SQLite DB unless DATABASE_URL is set.
   Usage: npm test */
process.env.SQLITE_FILE = process.env.SQLITE_FILE || ':memory:';
const assert = require('assert');
const app = require('../src/app');

(async () => {
  const server = app.listen(0);
  const base = `http://127.0.0.1:${server.address().port}/api`;
  let cookie = '';
  async function call(path, { method = 'GET', body } = {}) {
    const res = await fetch(base + path, {
      method,
      headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(cookie ? { Cookie: cookie } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
    const set = res.headers.get('set-cookie');
    if (set) cookie = set.split(';')[0];
    return { status: res.status, data: await res.json() };
  }
  const ok = (name) => console.log('  ✓ ' + name);
  const email = `smoke${Date.now()}@example.com`;
  const date = new Date(Date.now() + 9 * 3600e3 + 14 * 86400e3).toISOString().slice(0, 10);
  try {
    assert.equal((await call('/health')).status, 200); ok('health');
    assert.equal((await call('/auth/register', { method: 'POST', body: { email, password: 'short', displayName: 'x' } })).status, 400); ok('weak password rejected');
    assert.equal((await call('/auth/register', { method: 'POST', body: { email, password: 'abcd1234', displayName: 'スモーク' } })).status, 201); ok('register');
    assert.equal((await call('/auth/me')).data.user.email, email); ok('session cookie');
    await call('/auth/logout', { method: 'POST', body: {} });
    assert.equal((await call('/auth/me')).data.user, null); ok('logout');
    assert.equal((await call('/auth/login', { method: 'POST', body: { email, password: 'wrong999' } })).status, 401); ok('wrong password rejected');
    assert.equal((await call('/auth/login', { method: 'POST', body: { email, password: 'abcd1234' } })).status, 200); ok('login');
    assert.equal((await call('/account/profile', { method: 'PUT', body: { displayName: '更新', homeCity: 'osaka', bio: '' } })).data.user.homeCity, 'osaka'); ok('profile update');
    const places = (await call('/places?season=winter&region=hokkaido')).data.places;
    assert(places.length > 0); ok(`place filters (${places.length})`);
    assert.equal((await call('/account/favorites/' + places[0].slug, { method: 'POST', body: {} })).status, 200);
    assert.equal((await call('/account/favorites')).data.places.length, 1); ok('favorites');
    const trip = (await call(`/trips/search?from=tokyo&to=fukuoka&date=${date}`)).data;
    assert.equal(trip.passengers, 1);
    assert(trip.links.flight.length && trip.links.train.length && trip.links.hotel.length); ok('trip search');
    assert.equal((await call('/account/history')).data.history.length, 1); ok('search history');
    const created = await call('/posts', { method: 'POST', body: { title: 'スモークテスト', category: 'tips', body: 'これはスモークテストの本文です。三十文字以上になるように書いています。' } });
    assert.equal(created.status, 201);
    assert.equal((await call('/posts/' + created.data.slug)).data.canEdit, true); ok('create post');
    assert.equal((await call('/posts/' + created.data.slug, { method: 'DELETE', body: {} })).status, 200); ok('delete post');
    // admin role
    const post2 = await call('/posts', { method: 'POST', body: { title: '管理テスト用の記事', category: 'tips', body: 'これは管理者による削除をテストするための本文です。三十文字以上あります。' } });
    assert.equal(post2.status, 201);
    assert.equal((await call('/admin/stats')).status, 403); ok('non-admin blocked from /admin');
    const userA = (await call('/auth/me')).data.user;
    await call('/auth/logout', { method: 'POST', body: {} });
    const adminEmail = 'admin' + email;
    await call('/auth/register', { method: 'POST', body: { email: adminEmail, password: 'abcd1234', displayName: '管理' } });
    const db = require('../src/db');
    await db.query("UPDATE users SET role = 'admin' WHERE email = $1", [adminEmail]);
    assert.equal((await call('/auth/me')).data.user.role, 'admin');
    const stats = (await call('/admin/stats')).data;
    assert(stats.users >= 2 && stats.admins === 1); ok('admin stats');
    assert((await call('/admin/users')).data.users.length >= 2); ok('admin user list');
    assert.equal((await call('/posts/' + post2.data.slug)).data.canDelete, true);
    assert.equal((await call('/posts/' + post2.data.slug, { method: 'PUT', body: { title: '乗っ取り', category: 'tips', body: 'x'.repeat(40) } })).status, 403); ok('admin cannot edit others\' posts');
    assert.equal((await call('/posts/' + post2.data.slug, { method: 'DELETE', body: {} })).status, 200); ok('admin deletes any post');
    assert.equal((await call(`/admin/users/${userA.id}/role`, { method: 'PUT', body: { role: 'admin' } })).status, 200);
    assert.equal((await call(`/admin/users/${userA.id}/role`, { method: 'PUT', body: { role: 'user' } })).status, 200); ok('admin changes roles');
    const self = (await call('/auth/me')).data.user;
    assert.equal((await call(`/admin/users/${self.id}/role`, { method: 'PUT', body: { role: 'user' } })).status, 400); ok('admin cannot demote self');
    await call('/account', { method: 'DELETE', body: { password: 'abcd1234' } });
    await call('/auth/login', { method: 'POST', body: { email, password: 'abcd1234' } });
    assert.equal((await call('/account', { method: 'DELETE', body: { password: 'abcd1234' } })).status, 200); ok('delete account');
    console.log('All smoke tests passed.');
  } catch (err) {
    console.error('Smoke test failed:', err);
    process.exitCode = 1;
  } finally {
    server.close();
    setTimeout(() => process.exit(), 200);
  }
})();
