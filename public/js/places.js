(function () {
  'use strict';
  const { qs, qsa, api, params, placeCard, loadFavoriteSet, esc, CATEGORY, REGION, SEASON, t, lang } = window.STJ;
  const { monthName } = window.I18N;
  const form = qs('#filters');
  const list = qs('#list');
  const count = qs('#count');
  const monthSel = qs('#month');
  for (let m = 1; m <= 12; m++) monthSel.insertAdjacentHTML('beforeend', `<option value="${m}">${monthName(m)}</option>`);

  const state = { q: '', city: '', category: '', region: '', season: '', month: '', solo: '', featured: '' };
  let cityName = '';
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
    if (state.city) {
      qs('#page-title').textContent = t('city_places', { c: cityName || state.city });
      return;
    }
    const parts = [];
    if (state.featured === '1') parts.push(t('nav_featured'));
    if (state.region) parts.push(REGION[state.region]);
    if (state.month) parts.push(monthName(Number(state.month)));
    else if (state.season) parts.push(SEASON[state.season]);
    if (state.solo === '1') parts.push(t('pcat_solo'));
    if (lang === 'ja') {
      parts.push(state.category ? CATEGORY[state.category] : t('title_spots'));
      qs('#page-title').textContent = parts.length > 1 ? parts.join('の') : t('places_title');
    } else {
      if (state.category) parts.push(CATEGORY[state.category]);
      qs('#page-title').textContent = parts.length ? `${t('places_title')}: ${parts.join(' · ')}` : t('places_title');
    }
  }

  let seq = 0;
  async function load(push = true) {
    syncUi();
    const q = new URLSearchParams();
    Object.entries(state).forEach(([k, v]) => v && q.set(k, v));
    if (push) history.replaceState(null, '', '/places' + (q.toString() ? '?' + q : ''));
    const my = ++seq;
    list.innerHTML = `<div class="spinner" role="status" aria-label="${t('loading')}"></div>`;
    try {
      const { places } = await api('/places?' + q + (q.toString() ? '&' : '') + 'limit=200');
      if (my !== seq) return;
      count.textContent = t('count_places', { n: places.length });
      list.innerHTML = places.length
        ? places.map((x) => placeCard(x, { favorites: favs })).join('')
        : `<div class="empty"><b>${t('places_empty')}</b>${t('places_empty2')}</div>`;
    } catch (err) {
      count.textContent = '';
      list.innerHTML = `<div class="empty"><b>${t('load_failed')}</b>${esc(err.message)}</div>`;
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
  let timer;
  qs('#q').addEventListener('input', (e) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
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

  Promise.all([loadFavoriteSet(), state.city ? api('/trips/cities') : null]).then(([f, c]) => {
    favs = f;
    if (c) {
      const hit = c.cities.find((x) => x.key === state.city);
      if (hit) cityName = lang === 'ja' ? hit.name : hit.en;
    }
    load(false);
  });
})();
