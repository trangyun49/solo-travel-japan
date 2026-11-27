(function () {
  'use strict';
  const { qs, qsa, api, params, esc, getMe, requireLogin, placeCard, fmtDate, POST_CAT, showAlert, setFormBusy, toast } = window.STJ;
  const root = qs('#account');
  let cities = [];
  const cityName = (k) => (cities.find((c) => c.key === k) || {}).name || k;

  function switchTab(tab) {
    qsa('[role="tab"]').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === tab)));
    qsa('[data-panel]').forEach((p) => (p.hidden = p.dataset.panel !== tab));
    history.replaceState(null, '', '/account' + (tab === 'profile' ? '' : '?tab=' + tab));
    if (tab === 'favorites') loadFavorites();
    if (tab === 'history') loadHistory();
    if (tab === 'posts') loadPosts();
  }

  function fillProfile(u, stats) {
    qs('#p-avatar').textContent = u.displayName.slice(0, 1);
    qs('#p-name').textContent = u.displayName;
    qs('#p-since').textContent = fmtDate(u.createdAt) + ' 登録';
    qs('#displayName').value = u.displayName;
    qs('#email').value = u.email;
    qs('#homeCity').value = u.homeCity || '';
    qs('#bio').value = u.bio || '';
    if (stats) {
      qs('#s-fav').textContent = stats.favorites;
      qs('#s-posts').textContent = stats.posts;
    }
  }

  async function loadFavorites() {
    const box = qs('#fav-list');
    box.innerHTML = '<div class="spinner"></div>';
    const { places } = await api('/account/favorites');
    const favs = new Set(places.map((p) => p.slug));
    box.innerHTML = places.length
      ? places.map((p) => placeCard(p, { favorites: favs })).join('')
      : '<div class="empty"><b>お気に入りはまだありません</b><a href="/places">スポットを探して</a>、♡ボタンで保存しましょう。</div>';
  }

  async function loadHistory() {
    const box = qs('#history-list');
    box.innerHTML = '<div class="spinner"></div>';
    const { history } = await api('/account/history');
    const today = window.STJ.todayJst();
    box.innerHTML = history.length
      ? history
          .map(
            (h) => `<div class="list-row"><span><b>${esc(cityName(h.from_city))} → ${esc(cityName(h.to_city))}</b><br><span class="note">出発日 ${esc(h.travel_date)}・検索日 ${fmtDate(h.created_at)}</span></span>
            <a class="btn btn-outline btn-sm" href="/search?from=${h.from_city}&to=${h.to_city}${h.travel_date >= today ? '&date=' + h.travel_date : ''}">${h.travel_date >= today ? 'もう一度検索' : '日付を変えて検索'}</a></div>`
          )
          .join('')
      : '<div class="empty"><b>検索履歴はありません</b><a href="/search">旅を検索</a>すると、ここに保存されます。</div>';
  }

  async function loadPosts() {
    const box = qs('#post-list');
    box.innerHTML = '<div class="spinner"></div>';
    const { posts } = await api('/account/posts');
    box.innerHTML = posts.length
      ? posts
          .map(
            (p) => `<div class="list-row"><span><a href="/post?slug=${encodeURIComponent(p.slug)}"><b>${esc(p.title)}</b></a><br><span class="note">${esc(POST_CAT[p.category])}・${fmtDate(p.created_at)}</span></span>
            <span class="post-actions mt0"><a class="btn btn-outline btn-sm" href="/write?slug=${encodeURIComponent(p.slug)}">編集</a><button class="btn btn-danger btn-sm" type="button" data-del="${esc(p.slug)}">削除</button></span></div>`
          )
          .join('')
      : '<div class="empty"><b>まだ記事を投稿していません</b>あなたのひとり旅の体験を<a href="/write">書いてみましょう</a>。</div>';
  }

  qs('#post-list').addEventListener('click', async (e) => {
    const b = e.target.closest('[data-del]');
    if (!b) return;
    if (!confirm('この記事を削除します。元に戻せません。よろしいですか？')) return;
    b.disabled = true;
    try {
      await api('/posts/' + encodeURIComponent(b.dataset.del), { method: 'DELETE', body: {} });
      toast('記事を削除しました');
      loadPosts();
    } catch (err) {
      toast(err.message);
      b.disabled = false;
    }
  });

  document.addEventListener('favchange', () => {
    if (!qs('[data-panel="favorites"]').hidden) loadFavorites();
  });

  qs('#profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const msg = qs('#profile-msg');
    setFormBusy(form, true);
    try {
      const { user } = await api('/account/profile', {
        method: 'PUT',
        body: { displayName: qs('#displayName').value, homeCity: qs('#homeCity').value, bio: qs('#bio').value },
      });
      fillProfile(user);
      getMe(true);
      showAlert(msg, 'プロフィールを保存しました。', 'ok');
      const chip = qs('.user-chip .name');
      if (chip) chip.textContent = user.displayName;
    } catch (err) {
      showAlert(msg, err.message);
    } finally {
      setFormBusy(form, false);
      qs('#email').disabled = true;
    }
  });

  qs('#pw-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const msg = qs('#pw-msg');
    setFormBusy(form, true);
    try {
      await api('/account/password', {
        method: 'PUT',
        body: { currentPassword: qs('#currentPassword').value, newPassword: qs('#newPassword').value },
      });
      form.reset();
      showAlert(msg, 'パスワードを変更しました。', 'ok');
    } catch (err) {
      showAlert(msg, err.message);
    } finally {
      setFormBusy(form, false);
    }
  });

  qs('#logout-all').addEventListener('click', async () => {
    await api('/auth/logout-all', { method: 'POST', body: {} });
    location.href = '/login';
  });

  qs('#delete-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const msg = qs('#delete-msg');
    if (!confirm('本当にアカウントを削除しますか？ この操作は元に戻せません。')) return;
    setFormBusy(form, true);
    try {
      await api('/account', { method: 'DELETE', body: { password: qs('#deletePassword').value } });
      location.href = '/';
    } catch (err) {
      showAlert(msg, err.message);
      setFormBusy(form, false);
    }
  });

  qs('#logout-btn').addEventListener('click', async () => {
    await api('/auth/logout', { method: 'POST', body: {} });
    location.href = '/';
  });

  root.querySelector('.account-nav').addEventListener('click', (e) => {
    const b = e.target.closest('[data-tab]');
    if (b) switchTab(b.dataset.tab);
  });

  async function init() {
    const me = await getMe();
    if (!me) return requireLogin();
    const [acc, c] = await Promise.all([api('/account'), api('/trips/cities')]);
    cities = c.cities;
    qs('#homeCity').insertAdjacentHTML('beforeend', cities.map((x) => `<option value="${x.key}">${esc(x.name)}</option>`).join(''));
    fillProfile(acc.user, acc.stats);
    root.hidden = false;
    const tab = params().get('tab');
    switchTab(['favorites', 'history', 'posts', 'security'].includes(tab) ? tab : 'profile');
  }
  init().catch((err) => {
    if (err.status === 401) return requireLogin();
    toast(err.message);
  });
})();
