(function () {
  'use strict';
  const { qs, api, params, esc, icon, thumb, soloMeter, placeCard, REGION, CATEGORY, getMe, t, lang, placeName, placeSummary } = window.STJ;
  const { monthShort, pick } = window.I18N;
  const root = qs('#place');
  const slug = params().get('slug');

  async function load() {
    if (!slug) {
      root.innerHTML = `<div class="empty"><b>${t('no_slug')}</b><a href="/places">${t('back_places')}</a></div>`;
      return;
    }
    let d;
    try {
      d = await api('/places/' + encodeURIComponent(slug));
    } catch (err) {
      root.innerHTML = `<div class="empty"><b>${esc(err.message)}</b><a href="/places">${t('back_places')}</a></div>`;
      return;
    }
    const p = d.place;
    const name = placeName(p);
    document.title = `${name}${t('suffix')}`;
    const me = await getMe();
    const months = Array.from({ length: 12 }, (_, i) => `<span class="${p.months.includes(i + 1) ? 'on' : ''}">${lang === 'ja' ? i + 1 : monthShort(i + 1).replace(/^T/, '')}</span>`).join('');
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((p.name_en || p.name).replace(/\(.*?\)/g, '') + ' ' + p.prefecture)}`;
    const { cities } = await api('/trips/cities');
    const dest = cities.find((c) => c.key === p.city) || cities.find((c) => c.key === 'tokyo');
    const destName = lang === 'ja' ? dest.name : dest.en;
    const home = me && me.homeCity && me.homeCity !== dest.key ? me.homeCity : dest.key === 'tokyo' ? 'osaka' : 'tokyo';
    const tips = pick(p, 'solo_tips', 'tips_en', 'tips_vi');
    const desc = pick(p, 'description', 'desc_en', 'desc_vi');
    const access = pick(p, 'access', 'access_en', 'access_vi');
    const budget = pick(p, 'budget', 'budget_en', 'budget_vi');
    const credit = p.credit
      ? `<figcaption class="photo-credit">${t('photo')}: <a href="${esc(p.credit_url)}" target="_blank" rel="noopener noreferrer">${esc(p.credit)}</a></figcaption>`
      : '';

    root.innerHTML = `
      <nav class="crumbs" aria-label="breadcrumb"><a href="/">${t('home')}</a> ／ <a href="/places">${t('nav_places')}</a> ／ <a href="/places?region=${p.region}">${esc(REGION[p.region])}</a> ／ ${esc(name)}</nav>
      <div class="section-head">
        <div>
          <h1 class="page-title-lg">${esc(name)}</h1>
          <p>${lang === 'ja' ? esc(p.name_en) + ' · ' + esc(p.prefecture) + ' ' + esc(p.area) : esc(REGION[p.region])} · ${esc(CATEGORY[p.category])}</p>
          ${lang !== 'ja' ? `<p class="note">${t('ja_name')}: <span lang="ja">${esc(p.name)}</span></p>` : ''}
        </div>
        <button class="btn btn-outline" type="button" data-fav="${esc(p.slug)}" aria-pressed="${d.isFavorite}">${icon(d.isFavorite ? 'heartFill' : 'heart')} ${d.isFavorite ? t('fav_added') : t('fav_add')}</button>
      </div>
      <figure class="detail-figure"><div class="detail-hero">${thumb(p.image, p.category, p.name_en, name)}</div>${credit}</figure>
      <div class="detail-grid">
        <article class="prose">
          <p class="lead"><strong>${esc(placeSummary(p))}</strong></p>
          ${tips ? `<div class="tip-box"><h2>${icon('solo')} ${t('solo_points')}</h2><p>${esc(tips)}</p></div>` : ''}
          <p class="mt">${esc(desc)}</p>
          ${lang === 'ja' ? `<div class="tags mt">${p.tags.map((x) => `<a class="tag" href="/places?q=${encodeURIComponent(x)}">#${esc(x)}</a>`).join('')}</div>` : ''}
        </article>
        <aside class="info-card">
          <dl>
            <div><dt>${t('solo_score', { n: p.solo_score }).replace(/ ?\d\/5$/, '')}</dt><dd>${soloMeter(p.solo_score)} ${p.solo_score}/5</dd></div>
            <div><dt>${t('best_season')}</dt><dd><div class="month-dots">${months}</div></dd></div>
            ${access ? `<div><dt>${t('access')}</dt><dd>${esc(access)}</dd></div>` : ''}
            ${budget ? `<div><dt>${t('budget')}</dt><dd>${esc(budget)}</dd></div>` : ''}
          </dl>
          <a class="btn btn-outline" href="${mapUrl}" target="_blank" rel="noopener noreferrer">${icon('map')} ${t('map_btn')}</a>
          <a class="btn btn-primary" href="/search?from=${home}&to=${dest.key}">${icon('search')} ${t('route_btn', { c: esc(destName) })}</a>
          <p class="note">${t('nearest_city', { c: esc(destName) })}</p>
          <p class="note">${t('info_note')}</p>
        </aside>
      </div>
      ${
        d.related.length
          ? `<section class="section"><div class="section-head"><h2>${t('other_spots', { r: esc(REGION[p.region]) })}</h2></div><div class="grid">${d.related.map((x) => placeCard(x)).join('')}</div></section>`
          : ''
      }`;
  }
  load();
})();
