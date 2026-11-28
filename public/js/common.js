/* Shared helpers: API client, header/footer, auth state, renderers. */
(function () {
  'use strict';

  // ---------- Labels (localized) ----------
  const { t, lang, pick } = window.I18N;
  const labels = (prefix, keys) => Object.fromEntries(keys.map((k) => [k, t(prefix + k)]));
  const REGION = labels('region_', ['hokkaido', 'tohoku', 'kanto', 'chubu', 'kansai', 'chugoku', 'shikoku', 'kyushu', 'okinawa']);
  const CATEGORY = labels('cat_', ['sightseeing', 'gourmet', 'cafe', 'onsen']);
  const CAT_KANJI = { sightseeing: '観', gourmet: '食', cafe: '珈', onsen: '湯' };
  const SEASON = labels('season_', ['spring', 'summer', 'autumn', 'winter', 'all']);
  const SEASON_MONTHS = { spring: [3, 4, 5], summer: [6, 7, 8], autumn: [9, 10, 11], winter: [12, 1, 2] };
  const POST_CAT = labels('pcat_', ['solo', 'tips', 'gourmet', 'sightseeing', 'experience']);
  const placeName = (p) => pick(p, 'name', 'name_en', 'name_vi');
  const placeSummary = (p) => pick(p, 'summary', 'summary_en', 'summary_vi');
  const postTitle = (p) => pick(p, 'title', 'title_en', 'title_vi');
  const postExcerpt = (p) => pick(p, 'excerpt', 'excerpt_en', 'excerpt_vi');
  const authorName = (p) => (p.author_id ? p.author_name : t('editorial'));
  const COVERS = ['tokyo.jpg', 'osaka-castle.jpg', 'otaru.jpg', 'onsen.jpg', 'shibuya-kinkakuji.jpg', 'harajuku-cafe.jpg', 'jr-pass.jpg', 'usj.jpg'];

  function seasonOf(m) {
    return Object.keys(SEASON_MONTHS).find((k) => SEASON_MONTHS[k].includes(m));
  }

  // ---------- Icons (inline SVG, stroke-based) ----------
  const ICONS = {
    plane: '<path d="M2 16l20-6-20-6 3 6-3 6z"/><path d="M5 10h9"/>',
    bus: '<rect x="4" y="3" width="16" height="15" rx="3"/><path d="M4 11h16M8 18v3M16 18v3"/><circle cx="8" cy="14.5" r=".8"/><circle cx="16" cy="14.5" r=".8"/>',
    train: '<rect x="5" y="3" width="14" height="14" rx="4"/><path d="M5 10h14M8 21l2-4M16 21l-2-4"/><circle cx="9" cy="13.5" r=".8"/><circle cx="15" cy="13.5" r=".8"/>',
    hotel: '<path d="M3 20V6M3 13h18v7M21 13a4 4 0 0 0-4-4h-7v4"/><circle cx="6.5" cy="10" r="1.5"/>',
    swap: '<path d="M7 4L3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
    heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
    heartFill: '<path fill="currentColor" d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    pin: '<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    ext: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    pen: '<path d="M4 20h4L19 9l-4-4L4 16v4z"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    list: '<path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/>',
    solo: '<circle cx="12" cy="6" r="3"/><path d="M12 9v6M9 21l3-6 3 6M8 12h8"/>',
    filter: '<path d="M4 5h16l-6 8v6l-4-2v-4z"/>',
    map: '<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/>',
    check: '<path d="M5 12l5 5 9-10"/>',
    star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
    food: '<path d="M4 11h16a8 8 0 0 1-16 0zM8 3v4M12 3v4M16 3v4"/>',
  };
  function icon(name, cls = 'svg') {
    return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;
  }

  // ---------- Utils ----------
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  }
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const params = () => new URLSearchParams(location.search);
  const fmtDate = window.I18N.fmtDate;
  function todayJst() {
    return new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
  }
  function addDays(iso, n) {
    const d = new Date(iso + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() + n);
    return d.toISOString().slice(0, 10);
  }
  function currentMonthJst() {
    return Number(todayJst().slice(5, 7));
  }

  let toastTimer;
  function toast(msg) {
    let el = qs('.toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'toast';
      el.setAttribute('role', 'status');
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (el.hidden = true), 3200);
  }

  // ---------- API ----------
  async function api(path, opts = {}) {
    const init = { method: opts.method || 'GET', headers: { 'X-Lang': lang }, credentials: 'same-origin' };
    if (opts.body !== undefined) {
      init.headers['Content-Type'] = 'application/json';
      init.body = JSON.stringify(opts.body);
    }
    let res;
    try {
      res = await fetch('/api' + path, init);
    } catch (_) {
      throw new Error(t('network_error'));
    }
    let data = {};
    try {
      data = await res.json();
    } catch (_) {}
    if (!res.ok) {
      const err = new Error(data.error || `Error ${res.status}`);
      err.status = res.status;
      throw err;
    }
    return data;
  }

  // ---------- Auth state ----------
  let mePromise = null;
  function getMe(force) {
    if (!mePromise || force) mePromise = api('/auth/me').then((d) => d.user).catch(() => null);
    return mePromise;
  }
  function requireLogin() {
    location.href = '/login?next=' + encodeURIComponent(location.pathname + location.search);
  }

  // ---------- Layout ----------
  const NAV = [
    { href: '/search', label: t('nav_search') },
    { href: '/places', label: t('nav_places') },
    { href: '/places?featured=1', label: t('nav_featured') },
    { href: '/blog', label: t('nav_blog') },
  ];
  function langSwitcher() {
    const L = window.I18N.LANGS;
    const items = Object.keys(L)
      .map((k) => `<li role="none"><button type="button" role="menuitemradio" aria-checked="${k === lang}" data-lang="${k}">${k === lang ? icon('check') : '<span class="svg"></span>'} ${L[k]}</button></li>`)
      .join('');
    return `<div class="lang-switch">
      <button type="button" class="lang-btn" id="lang-btn" aria-haspopup="true" aria-expanded="false" aria-label="${t('language')}">${icon('globe')}<span>${lang.toUpperCase()}</span></button>
      <ul class="lang-menu" id="lang-menu" role="menu" hidden>${items}</ul>
    </div>`;
  }
  function renderHeader() {
    const host = qs('#site-header');
    if (!host) return;
    const path = location.pathname.replace(/\.html$/, '');
    const fullPath = path + location.search;
    const navHtml = NAV.map((n) => {
      const active = n.href.includes('?') ? fullPath === n.href : path === n.href && !location.search.includes('featured=1');
      return `<a href="${n.href}"${active ? ' aria-current="page"' : ''}>${n.label}</a>`;
    }).join('');
    host.outerHTML = `
<header class="site-header">
  <div class="wrap">
    <a class="brand" href="/" aria-label="${t('brand')}">
      <span class="brand-mark"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 7h16" stroke="#e0452b" stroke-width="2.4" stroke-linecap="round"/><path d="M6 10.5h12" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/><path d="M8 7v12M16 7v12" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg></span>
      <span>${t('brand')}<small>${t('brand_sub')}</small></span>
    </a>
    <nav class="nav" id="main-nav" aria-label="Menu">${navHtml}</nav>
    <div class="header-right">
      ${langSwitcher()}
      <div class="header-actions" id="header-actions"></div>
      <button class="menu-btn" id="menu-btn" aria-label="${t('menu_open')}" aria-expanded="false" aria-controls="main-nav">${icon('menu')}</button>
    </div>
  </div>
</header>`;
    const lb = qs('#lang-btn');
    const lm = qs('#lang-menu');
    lb.addEventListener('click', (e) => {
      e.stopPropagation();
      lm.hidden = !lm.hidden;
      lb.setAttribute('aria-expanded', String(!lm.hidden));
    });
    lm.addEventListener('click', (e) => {
      const b = e.target.closest('[data-lang]');
      if (b) window.I18N.setLang(b.dataset.lang);
    });
    document.addEventListener('click', () => {
      lm.hidden = true;
      lb.setAttribute('aria-expanded', 'false');
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') lm.hidden = true;
    });
    qs('#menu-btn').addEventListener('click', (e) => {
      const nav = qs('#main-nav');
      const open = nav.classList.toggle('open');
      e.currentTarget.setAttribute('aria-expanded', String(open));
    });
    getMe().then((user) => {
      const box = qs('#header-actions');
      if (user) {
        const admin = user.role === 'admin';
        box.innerHTML = `${admin ? `<a class="btn btn-admin btn-sm" href="/admin">${icon('lock')} <span>${t('admin_title')}</span></a>` : ''}<a class="user-chip${admin ? ' is-admin' : ''}" href="/account" title="${t('mypage')}"><span class="avatar">${esc(user.displayName.slice(0, 1))}</span><span class="name">${esc(user.displayName)}</span>${admin ? `<span class="badge badge-admin">${t('admin_badge')}</span>` : ''}</a>`;
        if (admin) {
          document.body.classList.add('is-admin');
          qs('.site-header').insertAdjacentHTML('afterbegin', `<div class="admin-bar"><div class="wrap"><span>${icon('lock')} ${t('admin_mode')}</span><a href="/admin">${t('admin_open')}</a></div></div>`);
        }
      } else {
        box.innerHTML = `<a class="btn btn-ghost btn-sm" href="/login">${t('login')}</a><a class="btn btn-primary btn-sm" href="/register">${t('register')}</a>`;
        qs('#main-nav').insertAdjacentHTML('beforeend', `<a class="nav-auth" href="/login">${t('login')}</a><a class="nav-auth" href="/register">${t('register')}</a>`);
      }
    });
  }

  function renderFooter() {
    const host = qs('#site-footer');
    if (!host) return;
    host.outerHTML = `
<footer class="site-footer">
  <div class="wrap">
    <div>
      <h3>${t('brand')}</h3>
      <p>${t('foot_about')}</p>
    </div>
    <div>
      <h3>${t('foot_find')}</h3>
      <ul>
        <li><a href="/search">${t('foot_search')}</a></li>
        <li><a href="/places">${t('foot_places')}</a></li>
        <li><a href="/places?category=gourmet">${CATEGORY.gourmet}</a></li>
        <li><a href="/places?category=sightseeing">${CATEGORY.sightseeing}</a></li>
      </ul>
    </div>
    <div>
      <h3>${t('foot_read')}</h3>
      <ul>
        <li><a href="/blog">${t('nav_blog')}</a></li>
        <li><a href="/blog?category=solo">${t('foot_solo_posts')}</a></li>
        <li><a href="/write">${t('foot_write')}</a></li>
        <li><a href="/account">${t('mypage')}</a></li>
      </ul>
    </div>
    <p class="copy">© ${new Date().getFullYear()} Solo Travel Japan ・ ${t('photo_credit_note')}</p>
  </div>
</footer>`;
  }

  // ---------- Renderers ----------
  function soloMeter(score) {
    let dots = '';
    for (let i = 1; i <= 5; i++) dots += `<i class="${i <= score ? 'on' : ''}"></i>`;
    const label = t('solo_score', { n: score });
    return `<span class="solo-meter" title="${label}" aria-label="${label}">${dots}</span>`;
  }

  function thumb(img, category, nameEn, alt) {
    if (img) return `<img src="${/^https:\/\//.test(img) ? esc(img) : '/img/' + esc(img)}" alt="${esc(alt || '')}" loading="lazy" referrerpolicy="no-referrer">`;
    return `<div class="thumb-fallback cat-${esc(category)}" aria-hidden="true"><span class="kanji">${CAT_KANJI[category] || '旅'}</span><span class="en">${esc(nameEn || '')}</span></div>`;
  }

  function placeCard(p, opts = {}) {
    const badges = [];
    if (p.solo_score >= 5) badges.push(`<span class="badge badge-solo">${t('solo_badge')}</span>`);
    badges.push(`<span class="badge">${esc(CATEGORY[p.category] || '')}</span>`);
    const fav = opts.favorites
      ? `<button class="fav-btn" type="button" data-fav="${esc(p.slug)}" aria-pressed="${opts.favorites.has(p.slug)}" aria-label="${t('favorite')}">${icon(opts.favorites.has(p.slug) ? 'heartFill' : 'heart')}</button>`
      : '';
    return `
<article class="card">
  ${fav}
  <a href="/place?slug=${encodeURIComponent(p.slug)}" class="card-link">
    <div class="thumb">${thumb(p.image, p.category, p.name_en, placeName(p))}<div class="badges">${badges.join('')}</div></div>
    <div class="card-body">
      <div class="card-meta"><span>${icon('pin')} ${esc(REGION[p.region] || '')}${lang === 'ja' ? '・' + esc(p.area || p.prefecture) : ''}</span>${soloMeter(p.solo_score)}</div>
      <h3 class="card-title">${esc(placeName(p))}</h3>
      <p class="card-text">${esc(placeSummary(p))}</p>
    </div>
  </a>
</article>`;
  }

  function postCard(p) {
    const cover = p.cover
      ? `<img src="/img/${esc(p.cover)}" alt="" loading="lazy">`
      : `<div class="thumb-fallback cat-sightseeing" aria-hidden="true"><span class="kanji">記</span><span class="en">${esc(POST_CAT[p.category] || '')}</span></div>`;
    return `
<a class="card post-card" href="/post?slug=${encodeURIComponent(p.slug)}">
  <div class="thumb">${cover}<div class="badges"><span class="badge${p.category === 'solo' ? ' badge-solo' : ''}">${esc(POST_CAT[p.category] || '')}</span>${p.author_id && p.lang && p.lang !== lang ? `<span class="badge">${esc(t('lname_' + p.lang))}</span>` : ''}${p.season && p.season !== 'all' ? `<span class="badge">${SEASON[p.season]}</span>` : ''}</div></div>
  <div class="card-body">
    <div class="card-meta"><span>${esc(authorName(p))}</span><span>${fmtDate(p.created_at)}</span>${p.region ? `<span>${esc(REGION[p.region])}</span>` : ''}</div>
    <h3 class="card-title">${esc(postTitle(p))}</h3>
    <p class="card-text">${esc(postExcerpt(p))}</p>
  </div>
</a>`;
  }

  /** Tiny, safe markdown subset → HTML (input is escaped first). */
  function renderMarkdown(src) {
    const lines = esc(src).replace(/\r\n/g, '\n').split('\n');
    let html = '';
    let para = [];
    let list = null;
    const inline = (t) => t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    const flushPara = () => {
      if (para.length) html += `<p>${inline(para.join('<br>'))}</p>`;
      para = [];
    };
    const flushList = () => {
      if (list) html += `<ul>${list.map((li) => `<li>${inline(li)}</li>`).join('')}</ul>`;
      list = null;
    };
    for (const line of lines) {
      if (/^#{2,3}\s+/.test(line)) {
        flushPara();
        flushList();
        html += `<h2>${inline(line.replace(/^#{2,3}\s+/, ''))}</h2>`;
      } else if (/^[-・]\s+/.test(line)) {
        flushPara();
        (list = list || []).push(line.replace(/^[-・]\s+/, ''));
      } else if (!line.trim()) {
        flushPara();
        flushList();
      } else {
        flushList();
        para.push(line);
      }
    }
    flushPara();
    flushList();
    return html;
  }

  // ---------- Favorites (delegated) ----------
  async function loadFavoriteSet() {
    const me = await getMe();
    if (!me) return new Set();
    try {
      const d = await api('/account/favorites');
      return new Set(d.places.map((p) => p.slug));
    } catch (_) {
      return new Set();
    }
  }
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-fav]');
    if (!btn) return;
    e.preventDefault();
    const me = await getMe();
    if (!me) {
      toast(t('fav_need_login'));
      setTimeout(requireLogin, 900);
      return;
    }
    const slug = btn.dataset.fav;
    const on = btn.getAttribute('aria-pressed') === 'true';
    btn.disabled = true;
    try {
      await api('/account/favorites/' + encodeURIComponent(slug), { method: on ? 'DELETE' : 'POST', body: {} });
      btn.setAttribute('aria-pressed', String(!on));
      if (btn.classList.contains('fav-btn')) btn.innerHTML = icon(on ? 'heart' : 'heartFill');
      else btn.innerHTML = `${icon(on ? 'heart' : 'heartFill')} ${on ? t('fav_add') : t('fav_added')}`;
      toast(on ? t('fav_toast_off') : t('fav_toast_on'));
      document.dispatchEvent(new CustomEvent('favchange', { detail: { slug, on: !on } }));
    } catch (err) {
      toast(err.message);
    } finally {
      btn.disabled = false;
    }
  });

  // ---------- Password visibility toggles ----------
  document.addEventListener('click', (e) => {
    const tg = e.target.closest('.pw-toggle');
    if (!tg) return;
    const input = tg.parentElement.querySelector('input');
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    tg.textContent = show ? window.I18N.t('hide') : window.I18N.t('show');
  });

  function setFormBusy(form, busy) {
    qsa('button, input, select, textarea', form).forEach((el) => (el.disabled = busy));
  }
  function showAlert(el, msg, type = 'error') {
    el.className = `alert alert-${type}`;
    el.textContent = msg;
    el.hidden = !msg;
  }

  window.STJ = {
    REGION, CATEGORY, SEASON, SEASON_MONTHS, POST_CAT, COVERS, CAT_KANJI, t, lang,
    placeName, placeSummary, postTitle, postExcerpt, authorName,
    icon, esc, qs, qsa, params, fmtDate, todayJst, addDays, currentMonthJst, seasonOf, toast,
    api, getMe, requireLogin, placeCard, postCard, thumb, soloMeter, renderMarkdown, loadFavoriteSet,
    setFormBusy, showAlert,
  };

  document.addEventListener('DOMContentLoaded', () => {
    renderHeader();
    renderFooter();
    qsa('[data-icon]').forEach((el) => el.insertAdjacentHTML('afterbegin', icon(el.dataset.icon) + (el.textContent.trim() ? ' ' : '')));
  });
})();
