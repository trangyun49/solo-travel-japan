/* Trip search form (home + search page). Always searches for 1 adult. */
(function () {
  'use strict';
  const { qs, api, params, todayJst, addDays, getMe, REGION, showAlert } = window.STJ;
  const form = qs('#trip-form');
  if (!form) return;
  const from = qs('#from', form);
  const to = qs('#to', form);
  const date = qs('#date', form);
  const err = qs('#trip-error', form);

  const today = todayJst();
  date.min = today;
  date.max = addDays(today, 330);

  window.STJ.citiesReady = api('/trips/cities').then(async ({ cities }) => {
    const groups = {};
    cities.forEach((c) => (groups[c.region] = groups[c.region] || []).push(c));
    const html =
      '<option value="">選択してください</option>' +
      Object.keys(REGION)
        .filter((r) => groups[r])
        .map((r) => `<optgroup label="${REGION[r]}">${groups[r].map((c) => `<option value="${c.key}">${c.name}</option>`).join('')}</optgroup>`)
        .join('');
    from.innerHTML = html;
    to.innerHTML = html;

    const p = params();
    const keys = new Set(cities.map((c) => c.key));
    let f = p.get('from');
    if (!keys.has(f)) {
      const me = await getMe();
      f = me && keys.has(me.homeCity) ? me.homeCity : 'tokyo';
    }
    from.value = f;
    to.value = keys.has(p.get('to')) ? p.get('to') : f === 'osaka' ? 'tokyo' : 'osaka';
    const d = p.get('date');
    date.value = d && d >= today ? d : addDays(today, 7);
    return cities;
  });

  qs('#swap', form).addEventListener('click', () => {
    const t = from.value;
    from.value = to.value;
    to.value = t;
  });

  form.addEventListener('submit', (e) => {
    let msg = '';
    if (!from.value) msg = '出発地を選択してください。';
    else if (!to.value) msg = '目的地を選択してください。';
    else if (from.value === to.value) msg = '出発地と目的地が同じです。';
    else if (!date.value || date.value < today) msg = '出発日は今日以降を選択してください。';
    else if (date.value > date.max) msg = '出発日は約11か月先までを選択してください。';
    if (msg) {
      e.preventDefault();
      showAlert(err, msg);
      return;
    }
    showAlert(err, '');
    if (form.dataset.spa === '1') {
      e.preventDefault();
      const q = new URLSearchParams({ from: from.value, to: to.value, date: date.value });
      history.pushState(null, '', '/search?' + q);
      document.dispatchEvent(new Event('tripsearch'));
    }
  });
})();
