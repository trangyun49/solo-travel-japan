(function () {
  'use strict';
  const { qs, api, params, esc, icon, thumb, soloMeter, placeCard, REGION, CATEGORY, getMe } = window.STJ;
  const root = qs('#place');
  const slug = params().get('slug');

  async function load() {
    if (!slug) {
      root.innerHTML = '<div class="empty"><b>スポットが指定されていません</b><a href="/places">スポット一覧へ</a></div>';
      return;
    }
    let d;
    try {
      d = await api('/places/' + encodeURIComponent(slug));
    } catch (err) {
      root.innerHTML = `<div class="empty"><b>${esc(err.message)}</b><a href="/places">スポット一覧へ戻る</a></div>`;
      return;
    }
    const p = d.place;
    document.title = `${p.name}｜ひとり旅ジャパン`;
    const me = await getMe();
    const months = Array.from({ length: 12 }, (_, i) => `<span class="${p.months.includes(i + 1) ? 'on' : ''}">${i + 1}</span>`).join('');
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.name.replace(/（.*?）|「.*?」/g, '') + ' ' + p.prefecture)}`;
    const { cities } = await api('/trips/cities');
    const dest = cities.find((c) => c.key === p.city) || cities.find((c) => c.key === 'tokyo');
    const home = me && me.homeCity && me.homeCity !== dest.key ? me.homeCity : dest.key === 'tokyo' ? 'osaka' : 'tokyo';

    root.innerHTML = `
      <nav class="crumbs" aria-label="パンくず"><a href="/">ホーム</a> ／ <a href="/places">スポット</a> ／ <a href="/places?region=${p.region}">${esc(REGION[p.region])}</a> ／ ${esc(p.name)}</nav>
      <div class="section-head">
        <div>
          <h1 class="page-title-lg">${esc(p.name)}</h1>
          <p>${esc(p.name_en)}・${esc(p.prefecture)} ${esc(p.area)}・${esc(CATEGORY[p.category])}</p>
        </div>
        <button class="btn btn-outline" type="button" data-fav="${esc(p.slug)}" aria-pressed="${d.isFavorite}">${icon(d.isFavorite ? 'heartFill' : 'heart')} ${d.isFavorite ? 'お気に入り済み' : 'お気に入りに追加'}</button>
      </div>
      <div class="detail-hero">${thumb(p.image, p.category, p.name_en, p.name)}</div>
      <div class="detail-grid">
        <article class="prose">
          <p class="lead"><strong>${esc(p.summary)}</strong></p>
          <p>${esc(p.description)}</p>
          ${p.solo_tips ? `<div class="tip-box"><h2>${icon('solo')} ひとり旅のポイント</h2><p>${esc(p.solo_tips)}</p></div>` : ''}
          <div class="tags mt">${p.tags.map((t) => `<a class="tag" href="/places?q=${encodeURIComponent(t)}">#${esc(t)}</a>`).join('')}</div>
        </article>
        <aside class="info-card">
          <dl>
            <div><dt>ひとり旅おすすめ度</dt><dd>${soloMeter(p.solo_score)} ${p.solo_score}/5</dd></div>
            <div><dt>ベストシーズン</dt><dd><div class="month-dots" aria-label="おすすめの月">${months}</div></dd></div>
            ${p.access ? `<div><dt>アクセス</dt><dd>${esc(p.access)}</dd></div>` : ''}
            ${p.budget ? `<div><dt>予算の目安</dt><dd>${esc(p.budget)}</dd></div>` : ''}
          </dl>
          <a class="btn btn-outline" href="${mapUrl}" target="_blank" rel="noopener noreferrer">${icon('map')} Googleマップで見る</a>
          <a class="btn btn-primary" href="/search?from=${home}&to=${dest.key}">${icon('search')} ${esc(dest.name)}への行き方を検索</a>
          <p class="note">最寄りの拠点都市：${esc(dest.name)}</p>
          <p class="note">営業時間・料金は変更されることがあります。お出かけ前に公式情報をご確認ください。</p>
        </aside>
      </div>
      ${
        d.related.length
          ? `<section class="section"><div class="section-head"><h2>${esc(REGION[p.region])}のほかのスポット</h2></div><div class="grid">${d.related.map((x) => placeCard(x)).join('')}</div></section>`
          : ''
      }`;
  }
  load();
})();
