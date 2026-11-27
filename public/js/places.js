(function () {
  'use strict';
  const { qs, qsa, api, params, placeCard, loadFavoriteSet, esc, CATEGORY, REGION, SEASON } = window.STJ;
  const form = qs('#filters');
  const list = qs('#list');
  const count = qs('#count');
  const monthSel = qs('#month');
  for (let m = 1; m <= 12; m++) monthSel.insertAdjacentHTML('beforeend', `<option value="${m}">${m}月</option>`);

  const state = { q: '', category: '', region: '', season: '', month: '', solo: '', featured: '' };
  const p = params();
  Object.keys(state).forEach((k) => (state[k] = p.get(k) || ''));
  if (state.month) state.season = '';
  let favs = new Set();

  function syncUi() {
    qs('#q').value = state.q;
    qsa('[data-group]').forEach((g) => {
      const key = g.dataset.group;
      qsa('.chip', g).forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.value === state[key])));
    });
    monthSel.value = state.month;
    qs('#solo').checked = state.solo === '1';
    qs('#featured').checked = state.featured === '1';
    const parts = [];
    if (state.featured === '1') parts.push('おすすめ');
    if (state.region) parts.push(REGION[state.region]);
    if (state.month) parts.push(`${state.month}月`);
    else if (state.season) parts.push(SEASON[state.season]);
    if (state.solo === '1') parts.push('ひとり旅');
    parts.push(state.category ? CATEGORY[state.category] : 'スポット');
    qs('#page-title').textContent = parts.length > 1 ? parts.join('の') : 'スポットを探す';
  }

  let seq = 0;
  async function load(push = true) {
    syncUi();
    const q = new URLSearchParams();
    Object.entries(state).forEach(([k, v]) => v && q.set(k, v));
    if (push) history.replaceState(null, '', '/places' + (q.toString() ? '?' + q : ''));
    const my = ++seq;
    list.innerHTML = '<div class="spinner" role="status" aria-label="読み込み中"></div>';
    try {
      const { places } = await api('/places?' + q);
      if (my !== seq) return;
      count.textContent = `${places.length}件のスポット`;
      list.innerHTML = places.length
        ? places.map((x) => placeCard(x, { favorites: favs })).join('')
        : '<div class="empty"><b>条件に合うスポットが見つかりません</b>条件を減らすか、別の季節・エリアを選んでください。</div>';
    } catch (err) {
      count.textContent = '';
      list.innerHTML = `<div class="empty"><b>読み込めませんでした</b>${esc(err.message)}</div>`;
    }
  }

  form.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    const key = chip.closest('[data-group]').dataset.group;
    state[key] = chip.dataset.value;
    if (key === 'season') state.month = '';
    load();
  });
  monthSel.addEventListener('change', () => {
    state.month = monthSel.value;
    if (state.month) state.season = '';
    load();
  });
  qs('#solo').addEventListener('change', (e) => {
    state.solo = e.target.checked ? '1' : '';
    load();
  });
  qs('#featured').addEventListener('change', (e) => {
    state.featured = e.target.checked ? '1' : '';
    load();
  });
  let t;
  qs('#q').addEventListener('input', (e) => {
    clearTimeout(t);
    t = setTimeout(() => {
      state.q = e.target.value.trim();
      load();
    }, 300);
  });
  form.addEventListener('submit', (e) => e.preventDefault());
  qs('#reset').addEventListener('click', () => {
    Object.keys(state).forEach((k) => (state[k] = ''));
    load();
  });
  qs('#filter-toggle').addEventListener('click', (e) => {
    const collapsed = form.classList.toggle('collapsed');
    e.currentTarget.setAttribute('aria-expanded', String(!collapsed));
  });

  loadFavoriteSet().then((f) => {
    favs = f;
    load(false);
  });
})();
