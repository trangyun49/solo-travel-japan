(function () {
  'use strict';
  const { qs, api, esc, getMe, requireLogin, fmtDate, toast, t, lang } = window.STJ;
  let cities = [];
  let me = null;
  const cityName = (k) => {
    const c = cities.find((x) => x.key === k);
    return c ? (lang === 'ja' ? c.name : c.en) : k;
  };

  function renderStats(s) {
    const items = [
      ['st_users', s.users], ['st_admins', s.admins], ['st_posts', s.userPosts],
      ['st_favs', s.favorites], ['st_searches', s.searches], ['st_places', s.places],
    ];
    qs('#stats').innerHTML = items.map(([k, n]) => `<div class="stat-card"><b>${Number(n).toLocaleString()}</b><span>${t(k)}</span></div>`).join('');
    qs('#routes').innerHTML = s.topRoutes.length
      ? `<ol class="route-list">${s.topRoutes.map((r) => `<li><span>${esc(cityName(r.from))} → ${esc(cityName(r.to))}</span><span class="note">${t('times', { n: r.n })}</span></li>`).join('')}</ol>`
      : `<p class="note">${t('no_data')}</p>`;
  }

  function renderUsers(users) {
    qs('#users-count').textContent = String(users.length);
    qs('#users').innerHTML = `<table class="admin-table">
      <thead><tr><th>ID</th><th>${t('col_name')}</th><th>${t('col_email')}</th><th>${t('col_role')}</th><th>${t('col_joined')}</th><th class="num">${t('col_posts')}</th><th class="num">${t('col_favs')}</th><th>${t('col_actions')}</th></tr></thead>
      <tbody>${users
        .map((u) => {
          const self = Number(u.id) === Number(me.id);
          const action = self
            ? `<span class="note">${t('you')}</span>`
            : `<button class="btn btn-outline btn-sm" type="button" data-role="${u.role === 'admin' ? 'user' : 'admin'}" data-id="${u.id}">${t(u.role === 'admin' ? 'make_user' : 'make_admin')}</button>`;
          return `<tr><td>${u.id}</td><td>${esc(u.displayName)}</td><td>${esc(u.email)}</td>
            <td><span class="role-pill${u.role === 'admin' ? ' admin' : ''}">${t(u.role === 'admin' ? 'role_admin' : 'role_user')}</span></td>
            <td>${fmtDate(u.createdAt)}</td><td class="num">${u.posts}</td><td class="num">${u.favorites}</td><td>${action}</td></tr>`;
        })
        .join('')}</tbody></table>`;
  }

  function renderPosts(posts) {
    qs('#posts-count').textContent = String(posts.length);
    qs('#posts').innerHTML = posts.length
      ? `<table class="admin-table">
      <thead><tr><th>${t('col_title')}</th><th>${t('col_author')}</th><th>${t('col_date')}</th><th>${t('col_actions')}</th></tr></thead>
      <tbody>${posts
        .map(
          (p) => `<tr><td class="wrap-cell">${esc(p.title)}</td><td>${esc(p.author_name)}<br><span class="note">${esc(p.author_email)}</span></td><td>${fmtDate(p.created_at)}</td>
          <td><a class="btn btn-outline btn-sm" href="/post?slug=${encodeURIComponent(p.slug)}">${t('view')}</a> <button class="btn btn-danger btn-sm" type="button" data-del="${esc(p.slug)}">${t('del')}</button></td></tr>`
        )
        .join('')}</tbody></table>`
      : `<p class="note">${t('no_data')}</p>`;
  }

  async function load() {
    const [s, u, p] = await Promise.all([api('/admin/stats'), api('/admin/users'), api('/admin/posts')]);
    renderStats(s);
    renderUsers(u.users);
    renderPosts(p.posts);
  }

  document.addEventListener('click', async (e) => {
    const roleBtn = e.target.closest('[data-role]');
    const delBtn = e.target.closest('[data-del]');
    try {
      if (roleBtn) {
        if (!confirm(t('confirm_role'))) return;
        roleBtn.disabled = true;
        await api(`/admin/users/${roleBtn.dataset.id}/role`, { method: 'PUT', body: { role: roleBtn.dataset.role } });
        toast(t('role_changed'));
        await load();
      } else if (delBtn) {
        if (!confirm(t('confirm_delete_post'))) return;
        delBtn.disabled = true;
        await api('/posts/' + encodeURIComponent(delBtn.dataset.del), { method: 'DELETE', body: {} });
        toast(t('post_deleted'));
        await load();
      }
    } catch (err) {
      toast(err.message);
      if (roleBtn) roleBtn.disabled = false;
      if (delBtn) delBtn.disabled = false;
    }
  });

  getMe().then(async (user) => {
    if (!user) return requireLogin();
    if (user.role !== 'admin') {
      qs('#admin-denied').hidden = false;
      return;
    }
    me = user;
    try {
      cities = (await api('/trips/cities')).cities || [];
    } catch (_) {
      cities = [];
    }
    qs('#admin').hidden = false;
    try {
      await load();
    } catch (err) {
      toast(err.message);
    }
  });
})();
