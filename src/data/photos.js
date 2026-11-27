'use strict';
/**
 * Real photos for places, hot-linked from Wikimedia Commons (free licences).
 * [file path under commons/thumb, licence, author]  → URL and credit link are built below.
 */
const P = {
  'kiyosumi-shirakawa': ['d/df/Bluebottlejapan-opening-outsidebuilding-feb8-2015.jpg', 'CC BY-SA 3.0', 'Nesnad'],
  'dogo-onsen': ['8/83/D%C5%8Dgo_Onsen.jpg', 'CC BY 2.0', 'Arnaud Malon'],
  churaumi: ['7/7f/Whale_Shark_-_Churaumi_aquarium%2C_Okinawa%2C_Japan.jpg', 'CC BY-SA 2.0', 'pelican from Tokyo, Japan'],
  'kumamoto-castle': ['f/ff/Kumamoto_Castle_Keep_Tower_20221022-3.jpg', 'CC BY-SA 4.0', 'Suicasmo'],
  'otaru-canal': ['f/fd/Otaru_Hokkaido_Japan.jpg', 'CC BY 2.0', 'Chi ing (Flickr)'],
  'nijo-market': ['f/fc/Nijo_fish_Market_2014.jpg', 'CC BY 3.0', 'Wing1990hk'],
  'sapporo-ramen-yokocho': ['2/25/Sapporo_miso_ramen.jpg', 'CC BY 3.0', 'Schellack'],
  'furano-lavender': ['4/47/Farm-Tomita.Irodori-no-Hatake01.JPG', 'CC BY 3.0', 'RJD'],
  'hirosaki-castle': ['f/f3/Hirosaki-castle_Aomori_with_Sakura_blossoms.jpg', 'CC BY-SA 3.0', 'Si-take.'],
  'hakodate-mt': ['c/c1/Wide_view_of_Mount_Hakodate_from_Mashu-Maru.jpg', 'CC BY-SA 4.0', '掬茶'],
  sensoji: ['8/8d/Asakusa_Senso-ji_2021-12_ac_%282%29.jpg', 'CC BY-SA 4.0', 'Asturio Cantabrio'],
  noboribetsu: ['5/51/Noboribetsu_hot_spring_jigokudani.JPG', 'CC BY-SA 3.0', '欅'],
  'shibuya-sky': ['4/45/SHIBUYA_SCRAMBLE_SQUARE_East_Tower.jpg', 'CC BY-SA 4.0', 'Sakura Torch'],
  'chureito-pagoda': ['6/66/Chuurei-tou_Fujiyoshida_17025277650_c59733d6ba_o.jpg', 'CC BY 2.0', 'reggiepen (Flickr)'],
  'ginzan-onsen': ['0/0b/Evening_twilight_in_Ginzan_Onsen_town_January_2022_A.jpg', 'CC BY-SA 4.0', 'さかおり'],
  'omoide-yokocho': ['9/9d/Shinjuku-West_Omoide-Yokocho.jpg', 'CC BY-SA 4.0', 'MaedaAkihiko'],
  nikko: ['b/b5/Nikko_Toshogu_Yomeimon_Gate_2024.jpg', 'CC BY-SA 4.0', 'Jpatokal'],
  matsushima: ['e/e9/Matsushima_miyagi_z.JPG', 'CC BY-SA 4.0', 'Chensiyuan'],
  hakone: ['b/b5/View_of_Mount_Fuji_from_Lake_Ashi.jpg', 'CC0', 'Quercus acuta'],
  'omicho-market': ['3/33/Omicho-ichiba_%E8%BF%91%E6%B1%9F%E7%94%BA%E5%B8%82%E5%A0%B4_A091185.JPG', 'CC BY-SA 3.0', '松岡明芳'],
  shirakawago: ['a/a2/Shirakawa-go_%282017-07-22%29.jpg', 'CC BY-SA 4.0', 'Alpsdake'],
  kenrokuen: ['f/fc/Kenrokuen10-r.jpg', 'CC BY 2.5', 'Oilstreet'],
  'meiji-jingu': ['e/ed/Courtyard_of_Meiji_Shrine_20190717.jpg', 'CC BY-SA 4.0', 'Tokuzo in Edomura'],
  'tsukiji-outer-market': ['f/fd/2018_Tsukiji_fish_market.jpg', 'CC BY-SA 4.0', 'Kakidai'],
  kawaguchiko: ['3/36/Lake_Kawaguchiko_Sakura_Mount_Fuji_4.JPG', 'CC BY 3.0', 'Midori'],
  'kuromon-market': ['4/42/%E9%BB%92%E9%96%80%E5%B8%82%E5%A0%B4_2024%281%29.jpg', 'CC0', 'ほっきー'],
  'matsumoto-castle': ['4/4c/Matsumoto_Castle_1-1.jpg', 'CC BY-SA 3.0', '柑橘類'],
  'fushimi-inari': ['6/64/Fushimiinari-taisha%2C_gehaiden-1.jpg', 'CC0', 'Saigen Jiro'],
  'ichiran-booth': ['c/c2/Hakataramen222.jpg', 'CC BY-SA 3.0', 'Hykw-a4'],
  yakushima: ['c/cc/Shiratani_Unsui_Gorge_11.jpg', 'CC BY 3.0', 'Σ64'],
  'kyoto-kissaten': ['0/08/Inoda6770.JPG', 'CC BY 3.0', 'mariemon'],
  'nishiki-market': ['c/ce/Nishiki_Ichiba_by_matsuyuki.jpg', 'CC BY-SA 2.0', 'matsuyuki'],
  okonomimura: ['5/59/Okonomiyaki_001.jpg', 'CC BY 2.0', 'ume-y'],
  kiyomizudera: ['a/ae/Kiyomizu-dera%2C_Kyoto%2C_November_2016_-02.jpg', 'CC BY-SA 4.0', 'Martin Falbisoner'],
  'udon-takamatsu': ['f/f9/Kama-age_sanuki_udon_by_sekido_in_Takamatsu%2C_Kagawa.jpg', 'CC BY 2.0', 'sekido'],
  'beppu-jigoku': ['c/c9/Beppu_Chinoike-jigoku03n3200.jpg', 'CC BY 2.5', '663highland'],
  'tottori-dunes': ['e/e1/Tottori-Sakyu_Tottori_Japan.JPG', 'CC BY-SA 3.0', 'Hashi photo'],
  'nagasaki-night': ['1/12/Mt.Inasa_2010.jpg', 'CC BY-SA 3.0', 'ぱちょぴ'],
  'hiroshima-peace': ['7/77/Genbaku_Dome04-r.JPG', 'CC BY 2.5', 'Oilstreet'],
  'fukuoka-yatai': ['4/43/Yomise%28Yatai%29.JPG', 'CC BY-SA 3.0', 'Tomomarusan'],
  'tateyama-snow-wall': ['d/da/Tateyama_Toll_Road_and_Yuki-no-otani.jpg', 'CC BY-SA 4.0', 'Alpsdake'],
  arashiyama: ['c/c1/Arashiyama_%288741759830%29.jpg', 'CC BY 2.0', 'Takeshi Kuboki'],
  'kabira-bay': ['9/90/Kabira-Bay-Kabira-park-2019.jpg', 'CC BY-SA 4.0', 'Tokyo-Good'],
  naoshima: ['6/60/Beachside_Torii%2C_Naoshima.jpg', 'CC BY-SA 3.0', 'Japanexperterna.se'],
  'nara-park': ['6/69/Five-storied_Pagoda%2C_Kofuku-ji_-_Nara%2C_Japan_-_DSC07497.jpg', 'CC0', 'Daderot'],
  miyajima: ['e/ef/Itsukushima_Shrine_Torii_Gate_%2813890465459%29.jpg', 'CC BY-SA 2.0', 'redlegsfan21'],
  dotonbori: ['f/f4/Osaka_Dotonbori_Ebisu_Bridge.jpg', 'CC BY-SA 3.0', 'Type specimen'],
  kamakura: ['b/b6/230128_Kamakura_Daibutsu_Japan01s3.jpg', 'CC BY-SA 4.0', '663highland'],
  takayama: ['9/91/Kamisannomachi%2C_Takayama_City_2015.jpg', 'CC BY-SA 4.0', 'Tomio344456'],
  'arabica-arashiyama': ['d/df/Togetsukyo_in_Kyoto_Arashiyama.jpg', 'CC BY 2.0', 'Blue Lotus'],
};

const photos = {};
Object.assign(P, require('./more/photos'));
for (const [slug, [path, licence, author, original]] of Object.entries(P)) {
  const file = path.split('/').pop();
  photos[slug] = {
    image: original
      ? `https://upload.wikimedia.org/wikipedia/commons/${path}`
      : `https://upload.wikimedia.org/wikipedia/commons/thumb/${path}/960px-${file}`,
    credit: `${author} / ${licence} / Wikimedia Commons`,
    creditUrl: `https://commons.wikimedia.org/wiki/File:${file}`,
  };
}
module.exports = photos;
