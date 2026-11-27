(function () {
  'use strict';
  const { qs, api, placeCard, postCard, currentMonthJst, seasonOf, SEASON, loadFavoriteSet, esc } = window.STJ;

  const monthsEl = qs('#months');
  const grid = qs('#month-places');
  const title = qs('#month-title');
  const more = qs('#month-more');
  const nowMonth = currentMonthJst();
  let favs = new Set();

  let html = '';
  for (let m = 1; m <= 12; m++) {
    const s = seasonOf(m);
    html += `<button type="button" class="month${m === nowMonth ? ' is-now' : ''}" data-month="${m}" data-season="${s}" aria-pressed="false">${m}月<small>${SEASON[s]}</small></button>`;
  }
  monthsEl.innerHTML = html;

  async function show(m) {
    monthsEl.querySelectorAll('.month').forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.month) === m)));
    title.textContent = `${m}月のおすすめスポット`;
    more.href = `/places?month=${m}`;
    grid.innerHTML = '<div class="spinner" role="status" aria-label="読み込み中"></div>';
    try {
      const { places } = await api(`/places?month=${m}&sort=solo&limit=8`);
      grid.innerHTML = places.length
        ? places.map((p) => placeCard(p, { favorites: favs })).join('')
        : '<div class="empty"><b>この月のスポットはまだありません</b>ほかの月を選んでみてください。</div>';
    } catch (err) {
      grid.innerHTML = `<div class="empty"><b>読み込めませんでした</b>${esc(err.message)}</div>`;
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
      qs('#home-posts').innerHTML = `<div class="empty"><b>記事を読み込めませんでした</b>${esc(err.message)}</div>`;
    });
})();
