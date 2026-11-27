'use strict';

const REGIONS = [
  { key: 'hokkaido', label: '北海道' },
  { key: 'tohoku', label: '東北' },
  { key: 'kanto', label: '関東' },
  { key: 'chubu', label: '中部' },
  { key: 'kansai', label: '関西' },
  { key: 'chugoku', label: '中国' },
  { key: 'shikoku', label: '四国' },
  { key: 'kyushu', label: '九州' },
  { key: 'okinawa', label: '沖縄' },
];

const CATEGORIES = [
  { key: 'sightseeing', label: '観光スポット' },
  { key: 'gourmet', label: 'グルメ' },
  { key: 'cafe', label: 'カフェ' },
  { key: 'onsen', label: '温泉' },
];

const SEASONS = [
  { key: 'spring', label: '春', months: [3, 4, 5] },
  { key: 'summer', label: '夏', months: [6, 7, 8] },
  { key: 'autumn', label: '秋', months: [9, 10, 11] },
  { key: 'winter', label: '冬', months: [12, 1, 2] },
];

const POST_CATEGORIES = [
  { key: 'solo', label: 'ひとり旅' },
  { key: 'tips', label: '旅のコツ' },
  { key: 'gourmet', label: 'グルメ' },
  { key: 'sightseeing', label: '観光' },
  { key: 'experience', label: '体験記' },
];

// Cover images users can pick for their posts (served from /img).
const COVERS = [
  'tokyo.jpg', 'osaka-castle.jpg', 'otaru.jpg', 'onsen.jpg',
  'shibuya-kinkakuji.jpg', 'harajuku-cafe.jpg', 'jr-pass.jpg', 'usj.jpg',
];

module.exports = { REGIONS, CATEGORIES, SEASONS, POST_CATEGORIES, COVERS };
