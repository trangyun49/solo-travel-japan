'use strict';
const express = require('express');
const db = require('../db');
const v = require('../validate');
const { CITIES, byKey, distanceKm } = require('../data/cities');

const router = express.Router();

const SERPAPI_KEY = process.env.SERPAPI_KEY || '';
const CACHE_TTL_MS = 10 * 60 * 1000;
const cache = new Map();

router.get('/cities', (_req, res) => {
  res.json({
    cities: CITIES.map(({ key, name, en, region, airports }) => ({ key, name, en, region, hasAirport: airports.length > 0 })),
    liveFlights: Boolean(SERPAPI_KEY),
  });
});

// ---------- helpers ----------
const enc = encodeURIComponent;
function addDays(iso, n) {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
function todayJst() {
  return new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
}

function flightLinks(a, b, date) {
  if (!a.airports.length || !b.airports.length) return [];
  if (a.airports.join() === b.airports.join() || a.airports[0] === b.airports[0]) return [];
  const A = a.airports[0];
  const B = b.airports[0];
  const [y, m, d] = date.split('-');
  const links = [
    {
      provider: 'Trip.com',
      kind: 'flight_search', label: 'Trip.comで航空券を検索',
      url: `https://jp.trip.com/flights/showfarefirst?dcity=${a.tripCode}&acity=${b.tripCode}&ddate=${date}&triptype=ow&class=y&quantity=1&locale=ja-JP&curr=JPY`,
    },
    {
      provider: 'Google Flights',
      kind: 'flight_compare', label: 'Googleフライトで比較',
      url: `https://www.google.com/travel/flights?q=${enc(`Flights from ${A} to ${B} on ${date} one way 1 adult`)}&hl=ja&curr=JPY`,
    },
    {
      provider: 'Skyscanner',
      kind: 'flight_compare', label: 'スカイスキャナーで比較',
      url: `https://www.skyscanner.jp/transport/flights/${A.toLowerCase()}/${B.toLowerCase()}/${y.slice(2)}${m}${d}/?adultsv2=1&cabinclass=economy&rtn=0`,
    },
    {
      provider: 'Traveloka',
      kind: 'flight_search', label: 'Travelokaで検索',
      url: `https://www.traveloka.com/ja-jp/flight/fullsearch?ap=${A}.${B}&dt=${d}-${m}-${y}.NA&ps=1.0.0&sc=ECONOMY`,
    },
  ];
  return links;
}

const crossesHokkaido = (a, b) => (a.region === 'hokkaido') !== (b.region === 'hokkaido');

function busLinks(a, b, date) {
  if (!a.bus || !b.bus || crossesHokkaido(a, b)) return [];
  const ymd = date.replace(/-/g, '');
  return [
    {
      provider: 'バス比較なび',
      kind: 'bus_compare', label: '高速バス・夜行バスを比較',
      url: `https://www.bushikaku.net/search/${a.bus}_${b.bus}/${ymd}/`,
    },
    { provider: 'WILLER EXPRESS', kind: 'bus_willer', label: 'WILLERの高速バスを予約', url: 'https://travel.willer.co.jp/' },
    { provider: '高速バスネット', kind: 'bus_jr', label: 'JRバス系の高速バスを予約', url: 'https://www.kousokubus.net/' },
  ];
}

function trainLinks(a, b, date) {
  if (a.island || b.island) return [];
  const [y, m, d] = date.split('-');
  const links = [
    {
      provider: 'Google Maps',
      kind: 'train_route', label: '乗換ルート・所要時間を確認',
      url: `https://www.google.com/maps/dir/?api=1&origin=${enc(a.station)}&destination=${enc(b.station)}&travelmode=transit`,
    },
    {
      provider: 'NAVITIME',
      kind: 'train_timetable', label: 'NAVITIMEで時刻表・運賃を検索',
      url: `https://www.navitime.co.jp/transfer/searchlist?orvStationName=${enc(a.station.replace(/駅$/, ''))}&dnvStationName=${enc(b.station.replace(/駅$/, ''))}&month=${y}/${m}&day=${d}&hour=8&minute=0&basis=1`,
    },
  ];
  const east = ['hokkaido', 'tohoku', 'kanto', 'chubu'];
  const west = ['kanto', 'chubu', 'kansai', 'chugoku', 'kyushu'];
  if (east.includes(a.region) && east.includes(b.region)) {
    links.push({ provider: 'えきねっと', kind: 'train_east', label: 'JR東日本の新幹線・特急を予約', url: 'https://www.eki-net.com/' });
  }
  if (west.includes(a.region) && west.includes(b.region)) {
    links.push({ provider: 'スマートEX', kind: 'train_west', label: '東海道・山陽・九州新幹線を予約', url: 'https://smart-ex.jp/' });
  }
  return links;
}

function hotelLinks(b, date) {
  const out = addDays(date, 1);
  const agodaSlug = b.agoda || b.key;
  return [
    {
      provider: 'Agoda',
      kind: 'hotel_city', label: `${b.name}のホテル（${date}から1泊・大人1名）`,
      url: `https://www.agoda.com/ja-jp/city/${agodaSlug}-jp.html?checkIn=${date}&los=1&rooms=1&adults=1&children=0`,
    },
    {
      provider: 'Trip.com',
      kind: 'hotel_home', label: 'Trip.comでホテルを探す（目的地・日付は予約サイトで入力）',
      url: 'https://jp.trip.com/hotels/?locale=ja-JP&curr=JPY',
    },
  ];
}

/** Rough mode guidance from straight-line distance (shown to users as 目安). */
function suggestions(a, b, km) {
  const s = [];
  const hasAir = a.airports.length && b.airports.length && a.airports.join() !== b.airports.join();
  if (a.island || b.island) {
    s.push({ key: 'flight_island', mode: 'flight', title: '飛行機がおすすめ', note: '離島・沖縄方面は飛行機が基本の移動手段です。' });
    return s;
  }
  const crossesStrait = crossesHokkaido(a, b);
  if (km < 120) {
    s.push({ key: 'train_short', mode: 'train', title: '電車・在来線/特急', note: '近距離のため電車が便利です。' });
    if (!crossesStrait) s.push({ key: 'bus_short', mode: 'bus', title: '路線バス・高速バス', note: '乗換が少ない直行バスがある区間も。' });
  } else if (km < 450 && !crossesStrait) {
    s.push({ key: 'train_mid', mode: 'train', title: '新幹線・特急', note: '中距離は鉄道が速くて確実。駅が市街地にあるのも利点です。' });
    s.push({ key: 'bus_mid', mode: 'bus', title: '高速バス・夜行バス', note: '費用を抑えたいひとり旅に。女性専用席のある便も。' });
    if (hasAir && km > 300) s.push({ key: 'flight_mid', mode: 'flight', title: '飛行機', note: 'LCCのセール時は鉄道より安いことも。' });
  } else {
    if (hasAir) s.push({ key: 'flight_long', mode: 'flight', title: '飛行機がおすすめ', note: '長距離は飛行機が最速。LCCも就航しています。' });
    if (!crossesStrait || ['hakodate', 'aomori'].includes(a.key) || ['hakodate', 'aomori'].includes(b.key)) {
      s.push({ key: 'train_long', mode: 'train', title: '新幹線', note: '乗り換えを含めて時間はかかりますが、景色を楽しめます。' });
    }
    if (!crossesStrait) s.push({ key: 'bus_night', mode: 'bus', title: '夜行バス', note: '宿泊費を節約できる長距離バス。座席タイプを要確認。' });
  }
  return s;
}

async function liveFlights(a, b, date) {
  if (!SERPAPI_KEY) return { available: false, reason: 'no_api_key' };
  if (!a.airports.length || !b.airports.length) return { available: false, reason: 'no_airport' };
  if (a.airports.join() === b.airports.join() || a.airports[0] === b.airports[0]) return { available: false, reason: 'same_airport' };

  const key = `${a.key}|${b.key}|${date}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.data;

  const params = new URLSearchParams({
    engine: 'google_flights',
    departure_id: a.airports.join(','),
    arrival_id: b.airports.join(','),
    outbound_date: date,
    type: '2', // one-way
    adults: '1',
    currency: 'JPY',
    hl: 'ja',
    gl: 'jp',
    api_key: SERPAPI_KEY,
  });
  let json;
  try {
    const r = await fetch(`https://serpapi.com/search.json?${params}`, { signal: AbortSignal.timeout(20000) });
    json = await r.json();
    if (!r.ok || json.error) {
      return { available: false, reason: 'provider_error', message: json.error || `HTTP ${r.status}` };
    }
  } catch (err) {
    return { available: false, reason: 'provider_error', message: err.name === 'TimeoutError' ? 'タイムアウトしました' : err.message };
  }

  const all = [...(json.best_flights || []), ...(json.other_flights || [])];
  const results = all
    .filter((f) => typeof f.price === 'number')
    .map((f) => {
      const legs = f.flights || [];
      const first = legs[0] || {};
      const last = legs[legs.length - 1] || {};
      return {
        price: f.price,
        totalMinutes: f.total_duration,
        stops: Math.max(legs.length - 1, 0),
        departure: { airport: first.departure_airport?.id, name: first.departure_airport?.name, time: first.departure_airport?.time },
        arrival: { airport: last.arrival_airport?.id, name: last.arrival_airport?.name, time: last.arrival_airport?.time },
        airlines: [...new Set(legs.map((l) => l.airline).filter(Boolean))],
        logo: first.airline_logo || f.airline_logo || '',
        flightNumbers: legs.map((l) => l.flight_number).filter(Boolean),
      };
    })
    .sort((x, y) => x.price - y.price)
    .slice(0, 20);

  const data = {
    available: true,
    provider: 'Google Flights (via SerpApi)',
    fetchedAt: new Date().toISOString(),
    lowest: json.price_insights?.lowest_price ?? (results[0] ? results[0].price : null),
    typicalRange: json.price_insights?.typical_price_range || null,
    searchUrl: json.search_metadata?.google_flights_url || null,
    results,
  };
  cache.set(key, { at: Date.now(), data });
  if (cache.size > 300) cache.delete(cache.keys().next().value);
  return data;
}

router.get('/search', async (req, res) => {
  const a = byKey[req.query.from];
  const b = byKey[req.query.to];
  if (!a) throw new v.HttpError(400, '出発地を選択してください。');
  if (!b) throw new v.HttpError(400, '目的地を選択してください。');
  if (a.key === b.key) throw new v.HttpError(400, '出発地と目的地が同じです。');
  const date = v.isoDate(req.query.date, '出発日');
  const today = todayJst();
  if (date < today) throw new v.HttpError(400, '出発日は今日以降を選択してください。');
  if (date > addDays(today, 330)) throw new v.HttpError(400, '出発日は約11か月先までを選択してください。');

  const km = distanceKm(a, b);
  const flights = await liveFlights(a, b, date);

  if (req.user) {
    await db.query(
      'INSERT INTO search_history (user_id, from_city, to_city, travel_date, created_at) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, a.key, b.key, date, new Date().toISOString()]
    );
  }

  const pick = ({ key, name, en, region, airports, airportNote, station }) => ({ key, name, en, region, airports, airportNote, station });
  res.json({
    from: pick(a),
    to: pick(b),
    date,
    passengers: 1,
    distanceKm: km,
    suggestions: suggestions(a, b, km),
    flights,
    links: {
      flight: flightLinks(a, b, date),
      bus: busLinks(a, b, date),
      train: trainLinks(a, b, date),
      hotel: hotelLinks(b, date),
    },
  });
});

module.exports = router;
