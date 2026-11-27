(function () {
  'use strict';
  const { qs, api, params, icon, esc, placeCard, getMe, REGION, CATEGORY, t, lang, loadFavoriteSet } = window.STJ;
  const { monthName } = window.I18N;
  const out = qs('#results');
  const MODE_ICON = { flight: 'plane', bus: 'bus', train: 'train' };
  const yen = (n) => '¥' + Number(n).toLocaleString('ja-JP');
  const hm = (min) => (min ? t('hm', { h: Math.floor(min / 60), m: min % 60 }) : '');
  const timeOf = (s) => (s ? String(s).slice(11, 16) : '');
  const cn = (c) => (lang === 'ja' ? c.name : c.en || c.name);
  const locale = lang === 'ja' ? 'ja-JP' : lang === 'vi' ? 'vi-VN' : 'en-GB';

  const PROVIDER_LATIN = { 'バス比較なび': 'Bushikaku (バス比較なび)', '高速バスネット': 'Kousokubus.net', 'えきねっと': 'Eki-net (えきねっと)', 'スマートEX': 'SmartEX' };
  const providerName = (p) => (lang === 'ja' ? p : PROVIDER_LATIN[p] || p);

  function linkLabel(l, ctx) {
    if (lang === 'ja') return l.label;
    return t('lk_' + l.kind, { c: cn(ctx.to) });
  }

  function linkList(links, ctx) {
    return `<div class="link-list">${links
      .map(
        (l) => `<a class="link-item" href="${esc(l.url)}" target="_blank" rel="noopener noreferrer">
          <span><b>${esc(providerName(l.provider))}</b><span>${esc(linkLabel(l, ctx))}</span></span>${icon('ext')}</a>`
      )
      .join('')}</div>`;
  }

  function flightPanel(d) {
    const f = d.flights;
    const links = d.links.flight;
    if (!links.length) {
      const reason = !d.from.airports.length || !d.to.airports.length ? t('no_airport') : t('same_airport');
      return `<section class="panel" data-mode="flight"><div class="panel-head"><h2>${icon('plane')} ${t('p_flight')}</h2></div>
        <div class="panel-body"><p class="note">${reason}</p></div></section>`;
    }
    let body = '';
    const notes = lang === 'ja' ? [d.from.airportNote, d.to.airportNote].filter(Boolean).map((n) => `<p class="note">${esc(n)}</p>`).join('') : '';
    if (f.available) {
      const rows = f.results.length
        ? f.results
            .map(
              (r) => `<div class="flight-row">
          ${r.logo ? `<img src="${esc(r.logo)}" alt="" loading="lazy">` : '<span></span>'}
          <div>
            <div class="flight-times">${esc(timeOf(r.departure.time))} ${esc(r.departure.airport || '')} → ${esc(timeOf(r.arrival.time))} ${esc(r.arrival.airport || '')}</div>
            <div class="flight-sub">${esc(r.airlines.join(' / '))}${r.flightNumbers.length ? ' (' + esc(r.flightNumbers.join(', ')) + ')' : ''} · ${hm(r.totalMinutes)} · ${r.stops ? t('stops', { n: r.stops }) : t('direct')}</div>
          </div>
          <div class="price">${yen(r.price)}<small>${t('per_adult')}</small></div>
        </div>`
            )
            .join('')
        : `<p class="note">${t('no_flights_day')}</p>`;
      const fetched = new Date(f.fetchedAt).toLocaleString(locale, { timeZone: 'Asia/Tokyo' });
      body = `<p class="note">${t('fares_live', { t: esc(fetched) })}</p>${rows}
        ${f.searchUrl ? `<p class="note"><a href="${esc(f.searchUrl)}" target="_blank" rel="noopener noreferrer">${t('all_flights')}</a></p>` : ''}`;
    } else {
      const why = f.reason === 'provider_error' ? t('fares_error', { m: esc(f.message || '') }) : t('no_fares');
      body = `<p class="alert alert-info">${why}</p>`;
    }
    return `<section class="panel" data-mode="flight">
      <div class="panel-head"><h2>${icon('plane')} ${t('p_flight')}</h2>${f.available && f.lowest ? `<span class="note">${t('lowest_from', { p: yen(f.lowest) })}</span>` : ''}</div>
      <div class="panel-body">${notes}${body}<div class="mt">${linkList(links, d)}</div></div>
    </section>`;
  }

  function simplePanel(mode, title, links, emptyMsg, note, d) {
    return `<section class="panel" data-mode="${mode}">
      <div class="panel-head"><h2>${icon(MODE_ICON[mode])} ${title}</h2></div>
      <div class="panel-body">${links.length ? `<p class="note mb">${note}</p>` + linkList(links, d) : `<p class="note">${emptyMsg}</p>`}</div>
    </section>`;
  }

  function suggestionText(s) {
    if (lang === 'ja' || !s.key) return [s.title, s.note];
    return t('sg_' + s.key);
  }

  async function run() {
    const p = params();
    if (!p.get('from') || !p.get('to') || !p.get('date')) return;
    out.innerHTML = `<div class="spinner" role="status" aria-label="${t('loading')}"></div>`;
    let d;
    try {
      d = await api(`/trips/search?from=${encodeURIComponent(p.get('from'))}&to=${encodeURIComponent(p.get('to'))}&date=${encodeURIComponent(p.get('date'))}`);
    } catch (err) {
      out.innerHTML = `<div class="alert alert-error">${esc(err.message)}</div>`;
      return;
    }
    document.title = `${cn(d.from)} → ${cn(d.to)}${t('suffix')}`;
    const dateLabel = new Date(d.date + 'T00:00:00').toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });

    const suggest = d.suggestions
      .map((s) => {
        const [title, note] = suggestionText(s);
        return `<div class="suggest-item"><span class="mode-icon">${icon(MODE_ICON[s.mode])}</span><span><b>${esc(title)}</b><span>${esc(note)}</span></span></div>`;
      })
      .join('');

    out.innerHTML = `
      <div class="route-summary">
        <div class="cities">${esc(cn(d.from))} ${icon('plane')} ${esc(cn(d.to))}</div>
        <div class="meta"><span>${icon('clock')} ${esc(dateLabel)}</span><span>${icon('solo')} ${t('one_way')}</span><span>${icon('map')} ${t('distance', { n: d.distanceKm.toLocaleString() })}</span></div>
      </div>
      <div class="mode-tabs chips" role="group" aria-label="${t('show_modes')}">
        <button class="chip" type="button" data-show="all" aria-pressed="true">${t('m_all')}</button>
        <button class="chip" type="button" data-show="flight" aria-pressed="false">${t('m_flight')}</button>
        <button class="chip" type="button" data-show="bus" aria-pressed="false">${t('m_bus')}</button>
        <button class="chip" type="button" data-show="train" aria-pressed="false">${t('m_train')}</button>
      </div>
      <div class="results-layout">
        <div>
          <section class="panel" data-mode="all">
            <div class="panel-head"><h2>${t('mode_guide')}</h2><span class="note">${t('mode_guide_note')}</span></div>
            <div class="panel-body"><div class="suggest">${suggest}</div></div>
          </section>
          ${flightPanel(d)}
          ${simplePanel('bus', t('p_bus'), d.links.bus, t('bus_empty'), t('bus_note'), d)}
          ${simplePanel('train', t('p_train'), d.links.train, t('train_empty'), t('train_note'), d)}
        </div>
        <aside>
          <section class="panel">
            <div class="panel-head"><h2>${icon('hotel')} ${t('hotels_in', { c: esc(cn(d.to)) })}</h2></div>
            <div class="panel-body"><p class="note mb">${t('hotel_note', { d: esc(d.date) })}</p>${linkList(d.links.hotel, d)}</div>
          </section>
          <section class="panel" id="history-panel" hidden>
            <div class="panel-head"><h2>${t('recent_searches')}</h2></div>
            <div class="panel-body" id="history-list"></div>
          </section>
        </aside>
      </div>
      <section class="dest-guide" id="dest-guide" aria-live="polite"><div class="spinner"></div></section>`;

    out.querySelector('.mode-tabs').addEventListener('click', (e) => {
      const b = e.target.closest('[data-show]');
      if (!b) return;
      const mode = b.dataset.show;
      out.querySelectorAll('.mode-tabs .chip').forEach((c) => c.setAttribute('aria-pressed', String(c === b)));
      out.querySelectorAll('.results-layout > div > .panel').forEach((panel) => {
        panel.hidden = mode !== 'all' && panel.dataset.mode !== mode;
      });
    });

    destinationGuide(d);

    const me = await getMe();
    if (me) {
      const { history } = await api('/account/history');
      const cities = await window.STJ.citiesReady;
      const name = (k) => {
        const c = cities.find((x) => x.key === k);
        return c ? cn(c) : k;
      };
      if (history.length) {
        qs('#history-panel').hidden = false;
        qs('#history-list').innerHTML = history
          .slice(0, 5)
          .map((h) => `<div class="list-row"><a href="/search?from=${h.from_city}&to=${h.to_city}${h.travel_date >= window.STJ.todayJst() ? '&date=' + h.travel_date : ''}">${esc(name(h.from_city))} → ${esc(name(h.to_city))}</a><span class="note">${esc(h.travel_date)}</span></div>`)
          .join('');
      }
    }
  }

  /** "What to do at the destination": places near the destination city, in the travel month, by category. */
  async function destinationGuide(d) {
    const box = qs('#dest-guide');
    const month = Number(d.date.slice(5, 7));
    const city = cn(d.to);
    const region = REGION[d.to.region];
    let places = [];
    let favs = new Set();
    try {
      [{ places }, favs] = await Promise.all([api(`/places?region=${d.to.region}&month=${month}&limit=100`), loadFavoriteSet()]);
    } catch (err) {
      box.innerHTML = `<div class="empty"><b>${t('load_failed')}</b>${esc(err.message)}</div>`;
      return;
    }
    // Places whose hub city is the destination first, then the rest of the region.
    places.sort((a, b) => (b.city === d.to.key) - (a.city === d.to.key) || b.solo_score - a.solo_score);
    const nearby = places.some((x) => x.city !== d.to.key);
    const cats = ['gourmet', 'cafe', 'sightseeing', 'onsen'];
    const count = (c) => places.filter((x) => x.category === c).length;
    const tabs = [`<button type="button" class="chip" data-cat="" aria-pressed="true">${t('all')} (${places.length})</button>`]
      .concat(cats.map((c) => `<button type="button" class="chip" data-cat="${c}" aria-pressed="false"${count(c) ? '' : ' disabled'}>${CATEGORY[c]} (${count(c)})</button>`))
      .join('');
    box.innerHTML = `
      <div class="section-head">
        <div>
          <h2>${t('dest_title', { c: esc(city), m: esc(lang === 'vi' ? monthName(month).toLowerCase() : monthName(month)) })}</h2>
          <p>${t('dest_sub')}${nearby ? ' ' + t('dest_nearby', { r: esc(region) }) : ''}</p>
        </div>
        <a class="btn btn-outline" href="/places?region=${d.to.region}&month=${month}">${t('dest_all_places', { r: esc(region) })}</a>
      </div>
      <div class="chips mb" role="group" aria-label="${t('category')}">${tabs}</div>
      <div class="grid" id="dest-grid"></div>`;
    const grid = qs('#dest-grid');
    const show = (cat) => {
      const list = places.filter((x) => !cat || x.category === cat).slice(0, 8);
      grid.innerHTML = list.length
        ? list.map((x) => placeCard(x, { favorites: favs })).join('')
        : `<div class="empty">${t('dest_empty')}</div>`;
    };
    box.querySelector('.chips').addEventListener('click', (e) => {
      const b = e.target.closest('[data-cat]');
      if (!b || b.disabled) return;
      box.querySelectorAll('[data-cat]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      show(b.dataset.cat);
    });
    show('');
  }

  document.addEventListener('tripsearch', run);
  window.addEventListener('popstate', () => location.reload());
  run();
})();
