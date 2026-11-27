(function () {
  'use strict';
  const { qs, api, params, icon, esc, placeCard, getMe, REGION } = window.STJ;
  const out = qs('#results');
  const MODE_ICON = { flight: 'plane', bus: 'bus', train: 'train' };
  const yen = (n) => '¥' + Number(n).toLocaleString('ja-JP');
  const hm = (min) => (min ? `${Math.floor(min / 60)}時間${min % 60 ? (min % 60) + '分' : ''}` : '');
  const timeOf = (s) => (s ? String(s).slice(11, 16) : '');

  function linkList(links) {
    return `<div class="link-list">${links
      .map(
        (l) => `<a class="link-item" href="${esc(l.url)}" target="_blank" rel="noopener noreferrer">
          <span><b>${esc(l.provider)}</b><span>${esc(l.label)}</span></span>${icon('ext')}</a>`
      )
      .join('')}</div>`;
  }

  function flightPanel(d) {
    const f = d.flights;
    const links = d.links.flight;
    if (!links.length) {
      const reason = !d.from.airports.length || !d.to.airports.length ? '出発地または目的地の近くに空港がないため、' : '同じ空港圏内の移動のため、';
      return `<section class="panel" data-mode="flight"><div class="panel-head"><h2>${icon('plane')} 航空券</h2></div>
        <div class="panel-body"><p class="note">${reason}この区間は飛行機の対象外です。鉄道・バスをご利用ください。</p></div></section>`;
    }
    let body = '';
    const notes = [d.from.airportNote, d.to.airportNote].filter(Boolean).map((n) => `<p class="note">${esc(n)}</p>`).join('');
    if (f.available) {
      const rows = f.results.length
        ? f.results
            .map(
              (r) => `<div class="flight-row">
          ${r.logo ? `<img src="${esc(r.logo)}" alt="" loading="lazy">` : '<span></span>'}
          <div>
            <div class="flight-times">${esc(timeOf(r.departure.time))} ${esc(r.departure.airport || '')} → ${esc(timeOf(r.arrival.time))} ${esc(r.arrival.airport || '')}</div>
            <div class="flight-sub">${esc(r.airlines.join(' / '))}${r.flightNumbers.length ? '（' + esc(r.flightNumbers.join(', ')) + '）' : ''}・${hm(r.totalMinutes)}・${r.stops ? '乗継' + r.stops + '回' : '直行便'}</div>
          </div>
          <div class="price">${yen(r.price)}<small>大人1名・片道</small></div>
        </div>`
            )
            .join('')
        : '<p class="note">この日の便は見つかりませんでした。日付を変えるか、下の予約サイトでご確認ください。</p>';
      const fetched = new Date(f.fetchedAt).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
      body = `<p class="note">Google フライトの最新運賃（${esc(fetched)} 取得）。価格は変動するため、予約サイトで最終確認してください。</p>${rows}
        ${f.searchUrl ? `<p class="note"><a href="${esc(f.searchUrl)}" target="_blank" rel="noopener noreferrer">Google フライトで全ての便を見る</a></p>` : ''}`;
    } else {
      const why =
        f.reason === 'provider_error'
          ? `リアルタイム運賃の取得に失敗しました（${esc(f.message || '')}）。下の予約サイトで最新の運賃をご確認ください。`
          : 'このサイトでは運賃の推測値は表示していません。下の予約サイトで、この区間・日付・大人1名の最新運賃と空席を確認できます。';
      body = `<p class="alert alert-info">${why}</p>`;
    }
    return `<section class="panel" data-mode="flight">
      <div class="panel-head"><h2>${icon('plane')} 航空券</h2>${f.available && f.lowest ? `<span class="note">最安 ${yen(f.lowest)}〜</span>` : ''}</div>
      <div class="panel-body">${notes}${body}<h3 class="sr-only">予約サイト</h3><div class="mt">${linkList(links)}</div></div>
    </section>`;
  }

  function simplePanel(mode, title, links, emptyMsg, note) {
    return `<section class="panel" data-mode="${mode}">
      <div class="panel-head"><h2>${icon(MODE_ICON[mode])} ${title}</h2></div>
      <div class="panel-body">${links.length ? (note ? `<p class="note mb">${note}</p>` : '') + linkList(links) : `<p class="note">${emptyMsg}</p>`}</div>
    </section>`;
  }

  async function run() {
    const p = params();
    if (!p.get('from') || !p.get('to') || !p.get('date')) return;
    out.innerHTML = '<div class="spinner" role="status" aria-label="検索中"></div>';
    let d;
    try {
      d = await api(`/trips/search?from=${encodeURIComponent(p.get('from'))}&to=${encodeURIComponent(p.get('to'))}&date=${encodeURIComponent(p.get('date'))}`);
    } catch (err) {
      out.innerHTML = `<div class="alert alert-error">${esc(err.message)}</div>`;
      return;
    }
    document.title = `${d.from.name} → ${d.to.name}｜旅を検索｜ひとり旅ジャパン`;
    const dateLabel = new Date(d.date + 'T00:00:00').toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });

    const suggest = d.suggestions
      .map((s) => `<div class="suggest-item"><span class="mode-icon">${icon(MODE_ICON[s.mode])}</span><span><b>${esc(s.title)}</b><span>${esc(s.note)}</span></span></div>`)
      .join('');

    out.innerHTML = `
      <div class="route-summary">
        <div class="cities">${esc(d.from.name)} ${icon('plane')} ${esc(d.to.name)}</div>
        <div class="meta"><span>${icon('clock')} ${esc(dateLabel)}</span><span>${icon('solo')} 大人1名・片道</span><span>${icon('map')} 直線距離 約${d.distanceKm.toLocaleString()}km</span></div>
      </div>
      <div class="mode-tabs chips" role="group" aria-label="表示する移動手段">
        <button class="chip" type="button" data-show="all" aria-pressed="true">すべて</button>
        <button class="chip" type="button" data-show="flight" aria-pressed="false">飛行機</button>
        <button class="chip" type="button" data-show="bus" aria-pressed="false">高速バス</button>
        <button class="chip" type="button" data-show="train" aria-pressed="false">新幹線・鉄道</button>
      </div>
      <div class="results-layout">
        <div>
          <section class="panel" data-mode="all">
            <div class="panel-head"><h2>移動手段の目安</h2><span class="note">距離から判定した参考情報です</span></div>
            <div class="panel-body"><div class="suggest">${suggest}</div></div>
          </section>
          ${flightPanel(d)}
          ${simplePanel('bus', '高速バス・夜行バス', d.links.bus, 'この区間は高速バスの対象外です（海を渡る区間など）。', '日付指定で各社の便・運賃・残席を比較できます。')}
          ${simplePanel('train', '新幹線・鉄道', d.links.train, 'この区間は鉄道でつながっていません。', '乗換案内で時刻・所要時間・運賃を確認し、予約サイトで指定席を予約できます。')}
        </div>
        <aside>
          <section class="panel">
            <div class="panel-head"><h2>${icon('hotel')} ${esc(d.to.name)}の宿</h2></div>
            <div class="panel-body"><p class="note mb">チェックイン ${esc(d.date)}・1泊・大人1名で検索します。</p>${linkList(d.links.hotel)}</div>
          </section>
          <section class="panel">
            <div class="panel-head"><h2>${esc(REGION[d.to.region])}のスポット</h2></div>
            <div class="panel-body" id="dest-places"><div class="spinner"></div></div>
          </section>
          <section class="panel" id="history-panel" hidden>
            <div class="panel-head"><h2>最近の検索</h2></div>
            <div class="panel-body" id="history-list"></div>
          </section>
        </aside>
      </div>`;

    out.querySelector('.mode-tabs').addEventListener('click', (e) => {
      const b = e.target.closest('[data-show]');
      if (!b) return;
      const mode = b.dataset.show;
      out.querySelectorAll('.mode-tabs .chip').forEach((c) => c.setAttribute('aria-pressed', String(c === b)));
      out.querySelectorAll('.results-layout > div > .panel').forEach((panel) => {
        panel.hidden = mode !== 'all' && panel.dataset.mode !== mode;
      });
    });

    api(`/places?region=${d.to.region}&sort=solo&limit=3`).then(({ places }) => {
      qs('#dest-places').innerHTML = places.length
        ? `<div class="grid">${places.map((x) => placeCard(x)).join('')}</div>`
        : '<p class="note">このエリアのスポットはまだありません。</p>';
    });

    const me = await getMe();
    if (me) {
      const { history } = await api('/account/history');
      const cities = await window.STJ.citiesReady;
      const name = (k) => (cities.find((c) => c.key === k) || {}).name || k;
      if (history.length) {
        qs('#history-panel').hidden = false;
        qs('#history-list').innerHTML = history
          .slice(0, 5)
          .map((h) => `<div class="list-row"><a href="/search?from=${h.from_city}&to=${h.to_city}${h.travel_date >= window.STJ.todayJst() ? '&date=' + h.travel_date : ''}">${esc(name(h.from_city))} → ${esc(name(h.to_city))}</a><span class="note">${esc(h.travel_date)}</span></div>`)
          .join('');
      }
    }
  }

  document.addEventListener('tripsearch', run);
  window.addEventListener('popstate', () => location.reload());
  run();
})();
