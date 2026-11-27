'use strict';
/**
 * Cities supported by the trip search.
 *  airports : IATA codes used for flight search (first = main airport)
 *  tripCode : Trip.com city code
 *  bus      : prefecture slug used by バス比較なび (bushikaku.net)
 *  station  : main station / hub used for rail directions
 *  island   : reachable only by air (or ferry) from the mainland
 * Coordinates are approximate city-centre positions, used only to compute straight-line distance.
 */
const CITIES = [
  { key: 'sapporo',   name: '札幌',   en: 'Sapporo',   region: 'hokkaido', lat: 43.068, lng: 141.350, airports: ['CTS'], tripCode: 'spk', bus: 'hokkaido', station: '札幌駅' },
  { key: 'hakodate',  name: '函館',   en: 'Hakodate',  region: 'hokkaido', lat: 41.773, lng: 140.726, airports: ['HKD'], tripCode: 'hkd', bus: 'hokkaido', station: '函館駅' },
  { key: 'aomori',    name: '青森',   en: 'Aomori',    region: 'tohoku',   lat: 40.828, lng: 140.734, airports: ['AOJ'], tripCode: 'aoj', bus: 'aomori', station: '新青森駅' },
  { key: 'akita',     name: '秋田',   en: 'Akita',     region: 'tohoku',   lat: 39.717, lng: 140.129, airports: ['AXT'], tripCode: 'axt', bus: 'akita', station: '秋田駅' },
  { key: 'sendai',    name: '仙台',   en: 'Sendai',    region: 'tohoku',   lat: 38.260, lng: 140.882, airports: ['SDJ'], tripCode: 'sdj', bus: 'miyagi', station: '仙台駅' },
  { key: 'tokyo',     name: '東京',   en: 'Tokyo',     region: 'kanto',    lat: 35.681, lng: 139.767, airports: ['HND', 'NRT'], tripCode: 'tyo', bus: 'tokyo', station: '東京駅' },
  { key: 'yokohama',  name: '横浜',   en: 'Yokohama',  region: 'kanto',    lat: 35.466, lng: 139.622, airports: ['HND'], tripCode: 'tyo', bus: 'kanagawa', station: '横浜駅' },
  { key: 'niigata',   name: '新潟',   en: 'Niigata',   region: 'chubu',    lat: 37.912, lng: 139.061, airports: ['KIJ'], tripCode: 'kij', bus: 'niigata', station: '新潟駅' },
  { key: 'kanazawa',  name: '金沢',   en: 'Kanazawa',  region: 'chubu',    lat: 36.578, lng: 136.648, airports: ['KMQ'], tripCode: 'kmq', bus: 'ishikawa', station: '金沢駅' },
  { key: 'matsumoto', name: '松本',   en: 'Matsumoto', region: 'chubu',    lat: 36.231, lng: 137.964, airports: ['MMJ'], tripCode: 'mmj', bus: 'nagano', station: '松本駅' },
  { key: 'takayama',  name: '高山',   en: 'Takayama',  region: 'chubu',    lat: 36.141, lng: 137.252, airports: [], tripCode: '', bus: 'gifu', station: '高山駅' },
  { key: 'kawaguchiko', name: '河口湖', en: 'Kawaguchiko', region: 'chubu', lat: 35.498, lng: 138.769, airports: [], tripCode: '', bus: 'yamanashi', station: '河口湖駅' },
  { key: 'nagoya',    name: '名古屋', en: 'Nagoya',    region: 'chubu',    lat: 35.170, lng: 136.881, airports: ['NGO'], tripCode: 'ngo', bus: 'aichi', station: '名古屋駅' },
  { key: 'kyoto',     name: '京都',   en: 'Kyoto',     region: 'kansai',   lat: 34.985, lng: 135.758, airports: ['ITM', 'KIX'], tripCode: 'osa', bus: 'kyoto', station: '京都駅', airportNote: '京都に空港はないため、大阪（伊丹・関西）の空港で検索します。' },
  { key: 'osaka',     name: '大阪',   en: 'Osaka',     region: 'kansai',   lat: 34.702, lng: 135.495, airports: ['ITM', 'KIX'], tripCode: 'osa', bus: 'osaka', station: '大阪駅' },
  { key: 'kobe',      name: '神戸',   en: 'Kobe',      region: 'kansai',   lat: 34.694, lng: 135.195, airports: ['UKB'], tripCode: 'ukb', bus: 'hyogo', station: '三ノ宮駅' },
  { key: 'nara',      name: '奈良',   en: 'Nara',      region: 'kansai',   lat: 34.685, lng: 135.805, airports: ['ITM', 'KIX'], tripCode: 'osa', bus: 'nara', station: '近鉄奈良駅', airportNote: '奈良に空港はないため、大阪（伊丹・関西）の空港で検索します。' },
  { key: 'okayama',   name: '岡山',   en: 'Okayama',   region: 'chugoku',  lat: 34.666, lng: 133.918, airports: ['OKJ'], tripCode: 'okj', bus: 'okayama', station: '岡山駅' },
  { key: 'hiroshima', name: '広島',   en: 'Hiroshima', region: 'chugoku',  lat: 34.397, lng: 132.475, airports: ['HIJ'], tripCode: 'hij', bus: 'hiroshima', station: '広島駅' },
  { key: 'takamatsu', name: '高松',   en: 'Takamatsu', region: 'shikoku',  lat: 34.351, lng: 134.047, airports: ['TAK'], tripCode: 'tak', bus: 'kagawa', station: '高松駅' },
  { key: 'matsuyama', name: '松山',   en: 'Matsuyama', region: 'shikoku',  lat: 33.837, lng: 132.751, airports: ['MYJ'], tripCode: 'myj', bus: 'ehime', station: '松山駅' },
  { key: 'kochi',     name: '高知',   en: 'Kochi',     region: 'shikoku',  lat: 33.567, lng: 133.544, airports: ['KCZ'], tripCode: 'kcz', bus: 'kochi', station: '高知駅' },
  { key: 'fukuoka',   name: '福岡',   en: 'Fukuoka',   region: 'kyushu',   lat: 33.590, lng: 130.421, airports: ['FUK'], tripCode: 'fuk', bus: 'fukuoka', station: '博多駅' },
  { key: 'nagasaki',  name: '長崎',   en: 'Nagasaki',  region: 'kyushu',   lat: 32.752, lng: 129.870, airports: ['NGS'], tripCode: 'ngs', bus: 'nagasaki', station: '長崎駅' },
  { key: 'kumamoto',  name: '熊本',   en: 'Kumamoto',  region: 'kyushu',   lat: 32.790, lng: 130.689, airports: ['KMJ'], tripCode: 'kmj', bus: 'kumamoto', station: '熊本駅' },
  { key: 'oita',      name: '大分・別府', en: 'Oita', region: 'kyushu',    lat: 33.233, lng: 131.606, airports: ['OIT'], tripCode: 'oit', bus: 'oita', station: '大分駅' },
  { key: 'miyazaki',  name: '宮崎',   en: 'Miyazaki',  region: 'kyushu',   lat: 31.915, lng: 131.432, airports: ['KMI'], tripCode: 'kmi', bus: 'miyazaki', station: '宮崎駅' },
  { key: 'kagoshima', name: '鹿児島', en: 'Kagoshima', region: 'kyushu',   lat: 31.584, lng: 130.541, airports: ['KOJ'], tripCode: 'koj', bus: 'kagoshima', station: '鹿児島中央駅' },
  { key: 'naha',      name: '那覇（沖縄）', en: 'Naha', region: 'okinawa', lat: 26.212, lng: 127.679, airports: ['OKA'], tripCode: 'oka', bus: '', station: '那覇空港', island: true },
  { key: 'ishigaki',  name: '石垣島', en: 'Ishigaki',  region: 'okinawa',  lat: 24.340, lng: 124.156, airports: ['ISG'], tripCode: 'isg', bus: '', station: '石垣空港', island: true },
];

const byKey = Object.fromEntries(CITIES.map((c) => [c.key, c]));

function distanceKm(a, b) {
  const R = 6371;
  const rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}

module.exports = { CITIES, byKey, distanceKm };
