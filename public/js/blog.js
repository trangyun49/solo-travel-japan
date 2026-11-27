(function () {
  'use strict';
  const { qs, qsa, api, params, postCard, esc, REGION, fmtDate, POST_CAT } = window.STJ;
  const out = qs('#posts');
  const region = qs('#region');
  Object.entries(REGION).forEach(([k, v]) => region.insertAdjacentHTML('beforeend', `<option value="${k}">${v}</option>`));

  const state = { category: '', season: '', region: '', source: '', q: '' };
  const p = params();
  Object.keys(state).forEach((k) => (state[k] = p.get(k) || ''));

  function sync() {
    qsa('[data-group="category"] .chip').forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.value === state.category)));
    qs('#season').value = state.season;
    region.value = state.region;
    qs('#source').value = state.source;
    qs('#q').value = state.q;
  }

  function feature(x) {
    const cover = x.cover ? `<img src="/img/${esc(x.cover)}" alt="" loading="lazy">` : '';
    return `<a class="post-feature" href="/post?slug=${encodeURIComponent(x.slug)}">
      <div class="thumb">${cover}</div>
      <div class="card-body">
        <div class="card-meta"><span class="badge${x.category === 'solo' ? ' badge-solo' : ''}">${esc(POST_CAT[x.category])}</span><span>${esc(x.author_name)}</span><span>${fmtDate(x.created_at)}</span></div>
        <h2 class="card-title">${esc(x.title)}</h2>
        <p class="card-text">${esc(x.excerpt)}</p>
      </div></a>`;
  }

  let seq = 0;
  async function load() {
    sync();
    const q = new URLSearchParams();
    Object.entries(state).forEach(([k, v]) => v && q.set(k, v));
    history.replaceState(null, '', '/blog' + (q.toString() ? '?' + q : ''));
    const my = ++seq;
    out.innerHTML = '<div class="spinner" role="status" aria-label="読み込み中"></div>';
    try {
      const { posts } = await api('/posts?' + q);
      if (my !== seq) return;
      if (!posts.length) {
        out.innerHTML = '<div class="empty"><b>条件に合う記事がありません</b>条件を変えるか、<a href="/write">最初の体験記を投稿</a>してみませんか。</div>';
        return;
      }
      const filtered = Object.values(state).some(Boolean);
      out.innerHTML = filtered
        ? `<div class="post-grid">${posts.map(postCard).join('')}</div>`
        : feature(posts[0]) + `<div class="post-grid">${posts.slice(1).map(postCard).join('')}</div>`;
    } catch (err) {
      out.innerHTML = `<div class="empty"><b>読み込めませんでした</b>${esc(err.message)}</div>`;
    }
  }

  qs('#post-filters').addEventListener('click', (e) => {
    const c = e.target.closest('.chip');
    if (!c) return;
    state.category = c.dataset.value;
    load();
  });
  ['season', 'source'].forEach((id) => qs('#' + id).addEventListener('change', (e) => ((state[id] = e.target.value), load())));
  region.addEventListener('change', (e) => ((state.region = e.target.value), load()));
  let t;
  qs('#q').addEventListener('input', (e) => {
    clearTimeout(t);
    t = setTimeout(() => ((state.q = e.target.value.trim()), load()), 300);
  });
  qs('#post-filters').addEventListener('submit', (e) => e.preventDefault());
  load();
})();
