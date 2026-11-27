'use strict';
/**
 * Extra places stored as language tuples:
 *   ja/en/vi: [name, summary, description, solo tips, access, budget]
 * Converted to the base place shape plus the i18n / detail maps used by the seed.
 */
const list = [...require('./north'), ...require('./west'), ...require('./south')];

const places = [];
const i18n = {};
const detail = {};
for (const p of list) {
  const [name, summary, description, soloTips, access, budget] = p.ja;
  places.push({
    slug: p.slug, city: p.city, name, name_en: p.en[0], region: p.region, prefecture: p.prefecture,
    area: p.area, category: p.category, months: p.months, solo_score: p.solo_score, featured: false,
    summary, description, solo_tips: soloTips, access, budget, tags: p.tags,
  });
  i18n[p.slug] = { en: [p.en[0], p.en[1], p.en[3]], vi: [p.vi[0], p.vi[1], p.vi[3]] };
  detail[p.slug] = { en: [p.en[2], p.en[4], p.en[5]], vi: [p.vi[2], p.vi[4], p.vi[5]] };
}
module.exports = { places, i18n, detail };
