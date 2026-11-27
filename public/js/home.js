(function () {
  'use strict';
  const { qs, api, placeCard, postCard, currentMonthJst, seasonOf, SEASON, loadFavoriteSet, esc, t } = window.STJ;
  const { monthShort, monthName } = window.I18N;

  const monthsEl = qs('#months');
  const grid = qs('#month-places');
  const title = qs('#month-title');
  const more = qs('#month-more');
  const nowMonth = currentMonthJst();
  let favs = new Set();

  let html = '';
  for (let m = 1; m <= 12; m++) {
    const s = seasonOf(m);
    html += `<button type="button" class="month${m === nowMonth ? ' is-now' : ''}" data-now="${t('now_badge')}" data-month="${m}" data-season="${s}" aria-pressed="false">${monthShort(m)}<small>${SEASON[s]}</small></button>`;
  }
  monthsEl.innerHTML = html;

  async function show(m) {
    monthsEl.querySelectorAll('.month').forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.month) === m)));
    title.textContent = t('month_title', { m: monthName(m) });
    more.href = `/places?month=${m}`;
    grid.innerHTML = `<div class="spinner" role="status" aria-label="${t('loading')}"></div>`;
    try {
      const { places } = await api(`/places?month=${m}&sort=solo&limit=8`);
      grid.innerHTML = places.length
        ? places.map((p) => placeCard(p, { favorites: favs })).join('')
        : `<div class="empty"><b>${t('month_empty')}</b>${t('month_empty2')}</div>`;
    } catch (err) {
      grid.innerHTML = `<div class="empty"><b>${t('load_failed')}</b>${esc(err.message)}</div>`;
    }
  }

  monthsEl.addEventListener('click', (e) => {
    const b = e.target.closest('.month');
    if (b) show(Number(b.dataset.month));
  });

  loadFavoriteSet().then((f) => {
    favs = f;
    show(nowMonth);
  });

  api('/posts?limit=3')
    .then(({ posts }) => {
      qs('#home-posts').innerHTML = posts.map(postCard).join('');
    })
    .catch((err) => {
      qs('#home-posts').innerHTML = `<div class="empty"><b>${t('load_failed')}</b>${esc(err.message)}</div>`;
    });
})();
