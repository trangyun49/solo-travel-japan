/* Lightweight i18n: 日本語 / Tiếng Việt / English. Loaded before common.js. */
(function () {
  'use strict';
  const LANGS = { ja: '日本語', vi: 'Tiếng Việt', en: 'English' };

  function detect() {
    try {
      const s = localStorage.getItem('stj_lang');
      if (LANGS[s]) return s;
    } catch (_) {}
    const m = document.cookie.match(/(?:^|; )stj_lang=(ja|vi|en)/);
    if (m) return m[1];
    const nav = (navigator.language || 'ja').slice(0, 2);
    return LANGS[nav] ? nav : 'ja';
  }
  const lang = detect();
  document.documentElement.lang = lang;

  // key: [ja, vi, en]
  const D = {
    // brand / nav
    brand: ['Solo Travel Japan', 'Solo Travel Japan', 'Solo Travel Japan'],
    brand_sub: ['ひとり旅ガイド', 'Du lịch Nhật một mình', 'Travel Japan your way'],
    nav_search: ['旅を検索', 'Tìm chuyến đi', 'Search trips'],
    nav_places: ['スポット', 'Địa điểm', 'Places'],
    nav_featured: ['おすすめ', 'Nổi bật', 'Featured'],
    nav_blog: ['ブログ', 'Blog', 'Blog'],
    login: ['ログイン', 'Đăng nhập', 'Log in'],
    register: ['新規登録', 'Đăng ký', 'Sign up'],
    menu_open: ['メニューを開く', 'Mở menu', 'Open menu'],
    language: ['言語', 'Ngôn ngữ', 'Language'],
    mypage: ['マイページ', 'Trang cá nhân', 'My page'],
    // footer
    foot_about: ['日本をひとりで旅する人のための、移動検索とスポット・ブログのガイドです。料金・空席は各予約サイトでご確認ください。', 'Hướng dẫn tìm chuyến đi, địa điểm và blog cho người du lịch Nhật Bản một mình. Giá vé và chỗ trống vui lòng xem trên trang đặt vé.', 'Trip search, places and stories for people travelling Japan alone. Check fares and availability on each booking site.'],
    foot_find: ['さがす', 'Khám phá', 'Explore'],
    foot_read: ['読む・書く', 'Đọc & viết', 'Read & write'],
    foot_search: ['旅を検索（航空券・バス・鉄道）', 'Tìm chuyến (máy bay · xe bus · tàu)', 'Search trips (flights · buses · trains)'],
    foot_places: ['スポット一覧', 'Tất cả địa điểm', 'All places'],
    foot_solo_posts: ['ひとり旅の記事', 'Bài viết du lịch một mình', 'Solo travel articles'],
    foot_write: ['体験記を投稿する', 'Viết chia sẻ', 'Share your story'],
    photo_credit_note: ['写真の一部は Wikimedia Commons（CC ライセンス）より', 'Một số ảnh từ Wikimedia Commons (giấy phép CC)', 'Some photos from Wikimedia Commons (CC licences)'],
    // labels
    region_hokkaido: ['北海道', 'Hokkaido', 'Hokkaido'], region_tohoku: ['東北', 'Tohoku', 'Tohoku'], region_kanto: ['関東', 'Kanto', 'Kanto'],
    region_chubu: ['中部', 'Chubu', 'Chubu'], region_kansai: ['関西', 'Kansai', 'Kansai'], region_chugoku: ['中国', 'Chugoku', 'Chugoku'],
    region_shikoku: ['四国', 'Shikoku', 'Shikoku'], region_kyushu: ['九州', 'Kyushu', 'Kyushu'], region_okinawa: ['沖縄', 'Okinawa', 'Okinawa'],
    cat_sightseeing: ['観光スポット', 'Tham quan', 'Sightseeing'], cat_gourmet: ['グルメ', 'Ẩm thực', 'Food'],
    cat_cafe: ['カフェ', 'Cà phê', 'Cafés'], cat_onsen: ['温泉', 'Onsen', 'Hot springs'],
    season_spring: ['春', 'Xuân', 'Spring'], season_summer: ['夏', 'Hạ', 'Summer'], season_autumn: ['秋', 'Thu', 'Autumn'],
    season_winter: ['冬', 'Đông', 'Winter'], season_all: ['通年', 'Quanh năm', 'All year'],
    pcat_solo: ['ひとり旅', 'Đi một mình', 'Solo travel'], pcat_tips: ['旅のコツ', 'Mẹo du lịch', 'Tips'],
    pcat_gourmet: ['グルメ', 'Ẩm thực', 'Food'], pcat_sightseeing: ['観光', 'Tham quan', 'Sightseeing'], pcat_experience: ['体験記', 'Trải nghiệm', 'Stories'],
    month_n: ['{n}月', 'Tháng {n}', '{m}'],
    solo_badge: ['ひとり旅向け', 'Hợp đi một mình', 'Solo-friendly'],
    solo_score: ['ひとり旅おすすめ度 {n}/5', 'Mức hợp đi một mình {n}/5', 'Solo-friendliness {n}/5'],
    favorite: ['お気に入り', 'Yêu thích', 'Favourite'],
    fav_add: ['お気に入りに追加', 'Thêm vào yêu thích', 'Add to favourites'],
    fav_added: ['お気に入り済み', 'Đã yêu thích', 'Saved'],
    fav_toast_on: ['お気に入りに追加しました', 'Đã thêm vào yêu thích', 'Added to favourites'],
    fav_toast_off: ['お気に入りから外しました', 'Đã bỏ khỏi yêu thích', 'Removed from favourites'],
    fav_need_login: ['お気に入りに保存するにはログインしてください', 'Hãy đăng nhập để lưu yêu thích', 'Log in to save favourites'],
    loading: ['読み込み中', 'Đang tải', 'Loading'],
    load_failed: ['読み込めませんでした', 'Không tải được', 'Couldn’t load'],
    network_error: ['通信できませんでした。ネットワーク接続を確認してください。', 'Không kết nối được. Vui lòng kiểm tra mạng.', 'Network error. Please check your connection.'],
    editorial: ['編集部', 'Ban biên tập', 'Editors'],
    ja_only: ['', 'Nội dung chi tiết bằng tiếng Nhật.', 'Details are in Japanese.'],
    // home
    hero_title: ['ひとりで行く日本を、もっと自由に。', 'Du lịch Nhật Bản một mình, tự do hơn.', 'See Japan on your own terms.'],
    hero_lead: ['出発地と目的地を選ぶだけで、航空券・高速バス・鉄道を1名分の条件でまとめて比較。季節に合ったスポットと、ひとりで入りやすいお店も見つかります。', 'Chọn điểm đi và điểm đến để so sánh vé máy bay, xe bus đường dài và tàu cho 1 người. Gợi ý địa điểm theo mùa và quán dễ vào khi đi một mình.', 'Pick where you start and where you’re going to compare flights, highway buses and trains for one adult. Find seasonal spots and places that welcome solo guests.'],
    tab_flight: ['航空券', 'Vé máy bay', 'Flights'], tab_bus: ['高速バス', 'Xe bus', 'Buses'],
    tab_train: ['新幹線・鉄道', 'Shinkansen · tàu', 'Trains'], tab_hotel: ['ホテル', 'Khách sạn', 'Hotels'],
    from: ['出発地', 'Điểm đi', 'From'], to: ['目的地', 'Điểm đến', 'To'], date: ['出発日', 'Ngày đi', 'Date'],
    pax: ['人数', 'Số người', 'Travellers'], pax_one: ['大人1名', '1 người lớn', '1 adult'],
    search_btn: ['検索する', 'Tìm kiếm', 'Search'], swap: ['出発地と目的地を入れ替える', 'Đổi điểm đi và điểm đến', 'Swap from and to'],
    choose: ['選択してください', 'Chọn', 'Select'],
    err_from: ['出発地を選択してください。', 'Vui lòng chọn điểm đi.', 'Please choose where you’re leaving from.'],
    err_to: ['目的地を選択してください。', 'Vui lòng chọn điểm đến.', 'Please choose a destination.'],
    err_same: ['出発地と目的地が同じです。', 'Điểm đi và điểm đến trùng nhau.', 'From and to are the same.'],
    err_date: ['出発日は今日以降を選択してください。', 'Vui lòng chọn ngày từ hôm nay trở đi.', 'Please choose a date from today onwards.'],
    err_date_max: ['出発日は約11か月先までを選択してください。', 'Chỉ chọn được ngày trong khoảng 11 tháng tới.', 'Please choose a date within about 11 months.'],
    season_title: ['いつ行く？ 月ごとのおすすめ', 'Đi tháng nào? Gợi ý theo tháng', 'When are you going? Picks by month'],
    season_caption: ['月を選ぶと、その時期に見頃・食べ頃のスポットに切り替わります。', 'Chọn tháng để xem những nơi đẹp nhất, ngon nhất vào thời điểm đó.', 'Choose a month to see what’s at its best then.'],
    month_title: ['{m}のおすすめスポット', 'Gợi ý cho {m}', 'Top picks for {m}'],
    month_sub: ['ひとり旅のしやすさ（●の数）が高い順に表示しています。', 'Sắp xếp theo mức độ hợp đi một mình (số chấm ●).', 'Sorted by how solo-friendly they are (●).'],
    see_all: ['すべて見る', 'Xem tất cả', 'See all'],
    month_empty: ['この月のスポットはまだありません', 'Chưa có địa điểm cho tháng này', 'No places for this month yet'],
    month_empty2: ['ほかの月を選んでみてください。', 'Hãy thử chọn tháng khác.', 'Try another month.'],
    by_purpose: ['目的から探す', 'Tìm theo mục đích', 'Browse by interest'],
    purpose_featured: ['編集部が選んだ定番と絶景', 'Điểm nổi tiếng & cảnh đẹp được chọn lọc', 'Editors’ classics and views'],
    purpose_gourmet: ['カウンターで気楽にひとりご飯', 'Ăn một mình thoải mái ở quầy', 'Easy counter meals for one'],
    purpose_sightseeing: ['寺社・絶景・街歩き', 'Đền chùa, cảnh đẹp, dạo phố', 'Temples, views and walks'],
    purpose_solo: ['ひとりこそ楽しい場所だけ', 'Những nơi đi một mình còn vui hơn', 'Places that are best alone'],
    blog_title: ['ブログ・旅のヒント', 'Blog & mẹo du lịch', 'Blog & travel tips'],
    blog_sub: ['計画のコツから、旅人の体験記まで。', 'Từ mẹo lên kế hoạch đến chia sẻ của người đi trước.', 'From planning tips to travellers’ stories.'],
    read_more: ['記事をもっと読む', 'Đọc thêm bài viết', 'More articles'],
    // places
    places_title: ['スポットを探す', 'Khám phá địa điểm', 'Find places'],
    places_lead: ['季節やエリアで絞り込んで、ひとり旅で行きたい場所を見つけましょう。●の数はひとり旅のしやすさ（5段階）です。', 'Lọc theo mùa và khu vực để tìm nơi bạn muốn đến. Số chấm ● là mức độ hợp đi một mình (thang 5).', 'Filter by season and area to find where to go. ● shows how solo-friendly a place is (out of 5).'],
    keyword: ['キーワード', 'Từ khóa', 'Keyword'],
    keyword_ph: ['例：京都、ラーメン、夜景', 'VD: Kyoto, ramen, cảnh đêm', 'e.g. Kyoto, ramen, night view'],
    category: ['カテゴリ', 'Danh mục', 'Category'], area: ['エリア', 'Khu vực', 'Area'], season: ['季節', 'Mùa', 'Season'],
    all: ['すべて', 'Tất cả', 'All'], nationwide: ['全国', 'Toàn quốc', 'All Japan'],
    by_month: ['月で選ぶ', 'Theo tháng', 'By month'], any_month: ['指定しない', 'Không chọn', 'Any'],
    only_solo: ['ひとり旅に特におすすめ（●5）のみ', 'Chỉ nơi rất hợp đi một mình (●5)', 'Best for solo only (●5)'],
    only_featured: ['編集部のおすすめのみ', 'Chỉ địa điểm nổi bật', 'Featured only'],
    reset: ['条件をリセット', 'Xóa bộ lọc', 'Reset filters'],
    filters: ['絞り込み', 'Bộ lọc', 'Filters'],
    count_places: ['{n}件のスポット', '{n} địa điểm', '{n} places'],
    places_empty: ['条件に合うスポットが見つかりません', 'Không có địa điểm phù hợp', 'No matching places'],
    places_empty2: ['条件を減らすか、別の季節・エリアを選んでください。', 'Hãy bỏ bớt bộ lọc hoặc chọn mùa/khu vực khác.', 'Try fewer filters or another season or area.'],
    title_spots: ['スポット', 'địa điểm', 'places'],
    // place detail
    home: ['ホーム', 'Trang chủ', 'Home'],
    solo_points: ['ひとり旅のポイント', 'Mẹo khi đi một mình', 'Solo tips'],
    best_season: ['1年のベストシーズン', 'Thời điểm đẹp nhất trong năm', 'Best time of the year'],
    access: ['アクセス', 'Cách đi', 'Getting there'], budget: ['予算の目安', 'Chi phí tham khảo', 'Budget guide'],
    map_btn: ['Googleマップで見る', 'Xem trên Google Maps', 'View on Google Maps'],
    route_btn: ['{c}への行き方を検索', 'Tìm đường đến {c}', 'Search trips to {c}'],
    nearest_city: ['最寄りの拠点都市：{c}', 'Thành phố gần nhất: {c}', 'Nearest hub city: {c}'],
    info_note: ['営業時間・料金は変更されることがあります。お出かけ前に公式情報をご確認ください。', 'Giờ mở cửa và giá có thể thay đổi. Hãy kiểm tra thông tin chính thức trước khi đi.', 'Hours and prices can change. Check official info before you go.'],
    other_spots: ['{r}のほかのスポット', 'Địa điểm khác ở {r}', 'More in {r}'],
    no_slug: ['スポットが指定されていません', 'Chưa chọn địa điểm', 'No place selected'],
    back_places: ['スポット一覧へ戻る', 'Quay lại danh sách', 'Back to places'],
    photo: ['写真', 'Ảnh', 'Photo'],
    // search
    search_title: ['旅を検索', 'Tìm chuyến đi', 'Search trips'],
    search_lead: ['航空券・高速バス・鉄道・ホテルを、大人1名の条件でまとめて比較できます。', 'So sánh vé máy bay, xe bus, tàu và khách sạn cho 1 người lớn.', 'Compare flights, buses, trains and hotels for one adult.'],
    search_empty: ['出発地・目的地・出発日を選んで検索してください', 'Chọn điểm đi, điểm đến và ngày rồi bấm tìm', 'Choose from, to and date, then search'],
    search_empty2: ['検索結果はここに表示されます。', 'Kết quả sẽ hiện ở đây.', 'Results will appear here.'],
    one_way: ['大人1名・片道', '1 người lớn · một chiều', '1 adult · one way'],
    distance: ['直線距離 約{n}km', 'Khoảng cách đường chim bay ~{n} km', '~{n} km straight-line'],
    show_modes: ['表示する移動手段', 'Phương tiện hiển thị', 'Modes shown'],
    m_all: ['すべて', 'Tất cả', 'All'], m_flight: ['飛行機', 'Máy bay', 'Flights'], m_bus: ['高速バス', 'Xe bus', 'Buses'], m_train: ['新幹線・鉄道', 'Shinkansen · tàu', 'Trains'],
    mode_guide: ['移動手段の目安', 'Gợi ý phương tiện', 'Which way to go'],
    mode_guide_note: ['距離から判定した参考情報です', 'Tham khảo dựa trên khoảng cách', 'Guidance based on distance'],
    p_flight: ['航空券', 'Vé máy bay', 'Flights'], p_bus: ['高速バス・夜行バス', 'Xe bus đường dài · xe đêm', 'Highway & night buses'],
    p_train: ['新幹線・鉄道', 'Shinkansen · tàu', 'Shinkansen & trains'],
    lowest_from: ['最安 {p}〜', 'Rẻ nhất từ {p}', 'From {p}'],
    no_airport: ['出発地または目的地の近くに空港がないため、この区間は飛行機の対象外です。鉄道・バスをご利用ください。', 'Không có sân bay gần điểm đi hoặc điểm đến nên chặng này không có máy bay. Hãy đi tàu hoặc xe bus.', 'There’s no airport near one end of this route, so flights don’t apply. Use trains or buses.'],
    same_airport: ['同じ空港圏内の移動のため、この区間は飛行機の対象外です。鉄道・バスをご利用ください。', 'Hai nơi dùng chung sân bay nên chặng này không có máy bay. Hãy đi tàu hoặc xe bus.', 'Both places share an airport, so flights don’t apply. Use trains or buses.'],
    no_fares: ['このサイトでは運賃の推測値は表示していません。下の予約サイトで、この区間・日付・大人1名の最新運賃と空席を確認できます。', 'Trang này không hiển thị giá ước đoán. Xem giá và chỗ trống mới nhất cho chặng, ngày này (1 người lớn) ở các trang đặt vé bên dưới.', 'We don’t show estimated fares. Check live fares and seats for this route, date and one adult on the booking sites below.'],
    fares_error: ['リアルタイム運賃の取得に失敗しました（{m}）。下の予約サイトで最新の運賃をご確認ください。', 'Không lấy được giá thời gian thực ({m}). Hãy xem giá mới nhất trên các trang đặt vé bên dưới.', 'Couldn’t fetch live fares ({m}). Check the booking sites below.'],
    fares_live: ['Google フライトの最新運賃（{t} 取得）。価格は変動するため、予約サイトで最終確認してください。', 'Giá mới nhất từ Google Flights (lấy lúc {t}). Giá có thể thay đổi, hãy xác nhận trên trang đặt vé.', 'Live fares from Google Flights (fetched {t}). Prices change — confirm on the booking site.'],
    no_flights_day: ['この日の便は見つかりませんでした。日付を変えるか、下の予約サイトでご確認ください。', 'Không tìm thấy chuyến bay ngày này. Hãy đổi ngày hoặc xem trên trang đặt vé.', 'No flights found for this day. Try another date or check the booking sites.'],
    all_flights: ['Google フライトで全ての便を見る', 'Xem tất cả chuyến bay trên Google Flights', 'See all flights on Google Flights'],
    per_adult: ['大人1名・片道', '1 người lớn · một chiều', '1 adult · one way'],
    direct: ['直行便', 'Bay thẳng', 'Direct'], stops: ['乗継{n}回', '{n} điểm dừng', '{n} stop(s)'],
    hm: ['{h}時間{m}分', '{h} giờ {m} phút', '{h}h {m}m'],
    bus_empty: ['この区間は高速バスの対象外です（海を渡る区間など）。', 'Chặng này không có xe bus đường dài (ví dụ phải qua biển).', 'No highway buses on this route (e.g. it crosses the sea).'],
    bus_note: ['日付指定で各社の便・運賃・残席を比較できます。', 'So sánh chuyến, giá và chỗ trống của các hãng theo ngày.', 'Compare operators, fares and seats for your date.'],
    train_empty: ['この区間は鉄道でつながっていません。', 'Chặng này không có đường tàu.', 'This route isn’t connected by rail.'],
    train_note: ['乗換案内で時刻・所要時間・運賃を確認し、予約サイトで指定席を予約できます。', 'Xem giờ tàu, thời gian và giá vé, rồi đặt ghế trên trang đặt vé.', 'Check times, duration and fares, then reserve seats on the booking site.'],
    hotels_in: ['{c}の宿', 'Khách sạn ở {c}', 'Stays in {c}'],
    hotel_note: ['チェックイン {d}・1泊・大人1名で検索します。', 'Nhận phòng {d} · 1 đêm · 1 người lớn.', 'Check-in {d} · 1 night · 1 adult.'],
    spots_in: ['{r}のスポット', 'Địa điểm ở {r}', 'Places in {r}'],
    no_spots_area: ['このエリアのスポットはまだありません。', 'Chưa có địa điểm ở khu vực này.', 'No places in this area yet.'],
    recent_searches: ['最近の検索', 'Tìm kiếm gần đây', 'Recent searches'],
    // suggestion keys
    sg_flight_island: [['飛行機がおすすめ', '離島・沖縄方面は飛行機が基本の移動手段です。'], ['Nên đi máy bay', 'Đến Okinawa và các đảo xa, máy bay là phương tiện chính.'], ['Fly', 'Flights are the main way to reach Okinawa and remote islands.']],
    sg_train_short: [['電車・在来線/特急', '近距離のため電車が便利です。'], ['Tàu thường / tàu nhanh', 'Quãng ngắn nên đi tàu là tiện nhất.'], ['Local & limited express trains', 'Short distance — trains are easiest.']],
    sg_bus_short: [['路線バス・高速バス', '乗換が少ない直行バスがある区間も。'], ['Xe bus', 'Một số chặng có xe bus đi thẳng, ít phải đổi xe.'], ['Buses', 'Some routes have direct buses with fewer transfers.']],
    sg_train_mid: [['新幹線・特急', '中距離は鉄道が速くて確実。駅が市街地にあるのも利点です。'], ['Shinkansen · tàu nhanh', 'Quãng trung bình đi tàu nhanh và đúng giờ, ga lại ở ngay trung tâm.'], ['Shinkansen & express', 'Fast and reliable at mid range, and stations are central.']],
    sg_bus_mid: [['高速バス・夜行バス', '費用を抑えたいひとり旅に。女性専用席のある便も。'], ['Xe bus đường dài · xe đêm', 'Tiết kiệm chi phí; một số chuyến có ghế dành cho nữ.'], ['Highway & night buses', 'Budget-friendly; some have women-only seats.']],
    sg_flight_mid: [['飛行機', 'LCCのセール時は鉄道より安いことも。'], ['Máy bay', 'Khi hãng giá rẻ khuyến mãi có thể rẻ hơn tàu.'], ['Flights', 'Low-cost carrier sales can beat the train.']],
    sg_flight_long: [['飛行機がおすすめ', '長距離は飛行機が最速。LCCも就航しています。'], ['Nên đi máy bay', 'Đường xa thì máy bay nhanh nhất, có cả hãng giá rẻ.'], ['Fly', 'Fastest for long distances; low-cost carriers fly too.']],
    sg_train_long: [['新幹線', '乗り換えを含めて時間はかかりますが、景色を楽しめます。'], ['Shinkansen', 'Lâu hơn nếu tính cả đổi tàu, nhưng ngắm cảnh rất thích.'], ['Shinkansen', 'Takes longer with transfers, but the scenery is great.']],
    sg_bus_night: [['夜行バス', '宿泊費を節約できる長距離バス。座席タイプを要確認。'], ['Xe bus đêm', 'Tiết kiệm tiền phòng; nhớ xem loại ghế.'], ['Night bus', 'Saves a night’s stay; check the seat type.']],
    // link kinds
    lk_flight_search: ['航空券を検索', 'Tìm vé máy bay', 'Search flights'],
    lk_flight_compare: ['航空券を比較', 'So sánh vé máy bay', 'Compare flights'],
    lk_bus_compare: ['高速バス・夜行バスを比較', 'So sánh xe bus đường dài', 'Compare highway buses'],
    lk_bus_willer: ['WILLERの高速バスを予約', 'Đặt xe bus WILLER', 'Book WILLER buses'],
    lk_bus_jr: ['JRバス系の高速バスを予約', 'Đặt xe bus của JR', 'Book JR highway buses'],
    lk_train_route: ['乗換ルート・所要時間を確認', 'Xem lộ trình và thời gian', 'Check route and travel time'],
    lk_train_timetable: ['時刻表・運賃を検索', 'Tra giờ tàu và giá vé', 'Timetables and fares'],
    lk_train_east: ['JR東日本の新幹線・特急を予約', 'Đặt Shinkansen/tàu nhanh JR East', 'Book JR East shinkansen'],
    lk_train_west: ['東海道・山陽・九州新幹線を予約', 'Đặt Shinkansen Tokaido · Sanyo · Kyushu', 'Book Tokaido/Sanyo/Kyushu shinkansen'],
    lk_hotel_city: ['{c}のホテル（1泊・大人1名）', 'Khách sạn ở {c} (1 đêm · 1 người)', 'Hotels in {c} (1 night · 1 adult)'],
    lk_hotel_home: ['Trip.comでホテルを探す（目的地・日付は予約サイトで入力）', 'Tìm khách sạn trên Trip.com (nhập điểm đến và ngày trên trang)', 'Find hotels on Trip.com (enter destination and dates there)'],
    // blog
    blog_lead: ['編集部の旅ガイドと、旅人が投稿した体験記。あなたのひとり旅の話も投稿できます。', 'Cẩm nang của ban biên tập và chia sẻ từ người đi trước. Bạn cũng có thể viết về chuyến đi của mình.', 'Guides from our editors and stories from travellers. Share yours too.'],
    write_btn: ['体験記を書く', 'Viết bài chia sẻ', 'Write a story'],
    season_any: ['季節：すべて', 'Mùa: tất cả', 'Season: all'], area_any: ['エリア：すべて', 'Khu vực: tất cả', 'Area: all'],
    author_any: ['投稿者：すべて', 'Người viết: tất cả', 'Author: all'], author_ed: ['編集部', 'Ban biên tập', 'Editors'],
    author_users: ['旅人の投稿', 'Người dùng', 'Travellers'],
    posts_empty: ['条件に合う記事がありません', 'Không có bài viết phù hợp', 'No matching posts'],
    posts_empty2: ['条件を変えるか、最初の体験記を投稿してみませんか。', 'Hãy đổi bộ lọc hoặc viết bài chia sẻ đầu tiên.', 'Change filters, or write the first story.'],
    related_posts: ['関連する記事', 'Bài viết liên quan', 'Related posts'],
    edit: ['編集する', 'Sửa', 'Edit'], del: ['削除する', 'Xóa', 'Delete'],
    confirm_delete_post: ['この記事を削除します。元に戻せません。よろしいですか？', 'Xóa bài viết này? Không thể hoàn tác.', 'Delete this post? This can’t be undone.'],
    post_deleted: ['記事を削除しました', 'Đã xóa bài viết', 'Post deleted'],
    updated: ['{d} 更新', 'cập nhật {d}', 'updated {d}'],
    back_blog: ['ブログ一覧へ戻る', 'Quay lại blog', 'Back to blog'],
    // write
    write_title: ['体験記を書く', 'Viết bài chia sẻ', 'Write a story'],
    edit_title: ['記事を編集', 'Sửa bài viết', 'Edit post'],
    write_lead: ['あなたのひとり旅の経験を、これから旅する人に共有しましょう。投稿した記事はブログに公開され、マイページからいつでも編集・削除できます。', 'Chia sẻ kinh nghiệm đi một mình cho người đi sau. Bài viết sẽ đăng lên blog, bạn có thể sửa/xóa bất cứ lúc nào ở trang cá nhân.', 'Share your solo trip with future travellers. Posts appear on the blog; edit or delete them any time from My page.'],
    f_title: ['タイトル（4〜80文字）', 'Tiêu đề (4–80 ký tự)', 'Title (4–80 characters)'],
    f_region: ['エリア', 'Khu vực', 'Area'], not_set: ['指定しない', 'Không chọn', 'Not set'],
    f_excerpt: ['概要（任意・140文字まで）', 'Tóm tắt (tùy chọn, tối đa 140 ký tự)', 'Summary (optional, up to 140)'],
    f_excerpt_ph: ['空欄なら本文の冒頭を使います', 'Để trống sẽ lấy đoạn đầu bài', 'Leave empty to use the opening'],
    f_cover: ['カバー画像', 'Ảnh bìa', 'Cover image'], no_image: ['画像なし', 'Không ảnh', 'No image'],
    f_body: ['本文（30〜8,000文字）', 'Nội dung (30–8.000 ký tự)', 'Body (30–8,000 characters)'],
    mode_edit: ['編集', 'Soạn', 'Write'], mode_preview: ['プレビュー', 'Xem trước', 'Preview'],
    body_hint: ['「## 」で見出し、「- 」で箇条書き、「**文字**」で太字になります。', '“## ” cho tiêu đề, “- ” cho gạch đầu dòng, “**chữ**” cho in đậm.', '“## ” for headings, “- ” for lists, “**text**” for bold.'],
    preview_empty: ['本文を入力するとプレビューが表示されます。', 'Nhập nội dung để xem trước.', 'Start writing to see a preview.'],
    publish: ['投稿する', 'Đăng bài', 'Publish'], update: ['更新する', 'Cập nhật', 'Update'], cancel: ['キャンセル', 'Hủy', 'Cancel'],
    published: ['記事を投稿しました', 'Đã đăng bài', 'Published'], post_updated: ['記事を更新しました', 'Đã cập nhật bài', 'Post updated'],
    err_title_min: ['タイトルは4文字以上で入力してください。', 'Tiêu đề cần ít nhất 4 ký tự.', 'Title needs at least 4 characters.'],
    err_body_min: ['本文は30文字以上で入力してください。', 'Nội dung cần ít nhất 30 ký tự.', 'Body needs at least 30 characters.'],
    cannot_edit: ['この記事は編集できません', 'Bạn không thể sửa bài này', 'You can’t edit this post'],
    cannot_edit2: ['自分が投稿した記事のみ編集できます。', 'Chỉ sửa được bài của chính bạn.', 'You can only edit your own posts.'],
    // auth
    login_lead: ['お気に入りや検索履歴の保存、体験記の投稿ができます。', 'Lưu yêu thích, lịch sử tìm kiếm và đăng bài chia sẻ.', 'Save favourites and searches, and share your stories.'],
    register_lead: ['無料で登録できます。メールアドレスは公開されません。', 'Đăng ký miễn phí. Email của bạn không bị công khai.', 'Free to join. Your email is never shown.'],
    email: ['メールアドレス', 'Email', 'Email'], password: ['パスワード', 'Mật khẩu', 'Password'],
    nickname: ['ニックネーム（ブログに表示されます）', 'Biệt danh (hiện trên blog)', 'Nickname (shown on the blog)'],
    pw_hint: ['8文字以上で、英字と数字を両方含めてください。', 'Ít nhất 8 ký tự, gồm cả chữ và số.', 'At least 8 characters with letters and numbers.'],
    show: ['表示', 'Hiện', 'Show'], hide: ['隠す', 'Ẩn', 'Hide'], pw_toggle: ['パスワードの表示切替', 'Hiện/ẩn mật khẩu', 'Show or hide password'],
    register_btn: ['登録してはじめる', 'Đăng ký và bắt đầu', 'Create account'],
    no_account: ['アカウントをお持ちでない方は', 'Chưa có tài khoản?', 'No account yet?'],
    have_account: ['すでにアカウントをお持ちの方は', 'Đã có tài khoản?', 'Already have an account?'],
    err_nick: ['ニックネームを入力してください。', 'Vui lòng nhập biệt danh.', 'Please enter a nickname.'],
    err_email: ['メールアドレスの形式が正しくありません。', 'Email không đúng định dạng.', 'Please enter a valid email.'],
    err_pw: ['パスワードは8文字以上で、英字と数字を両方含めてください。', 'Mật khẩu cần ít nhất 8 ký tự, gồm cả chữ và số.', 'Password needs 8+ characters with letters and numbers.'],
    err_login_empty: ['メールアドレスとパスワードを入力してください。', 'Vui lòng nhập email và mật khẩu.', 'Please enter your email and password.'],
    // account
    account_lead: ['プロフィール、お気に入り、検索履歴、投稿した記事を管理できます。', 'Quản lý hồ sơ, yêu thích, lịch sử tìm kiếm và bài viết.', 'Manage your profile, favourites, searches and posts.'],
    tab_profile: ['プロフィール', 'Hồ sơ', 'Profile'], tab_favorites: ['お気に入り', 'Yêu thích', 'Favourites'],
    tab_history: ['検索履歴', 'Lịch sử tìm', 'Search history'], tab_posts: ['投稿した記事', 'Bài đã viết', 'My posts'],
    tab_security: ['セキュリティ', 'Bảo mật', 'Security'], logout: ['ログアウト', 'Đăng xuất', 'Log out'],
    stat_fav: ['お気に入り', 'yêu thích', 'favourites'], stat_posts: ['投稿', 'bài viết', 'posts'],
    joined: ['{d} 登録', 'Tham gia {d}', 'Joined {d}'],
    nickname_short: ['ニックネーム', 'Biệt danh', 'Nickname'], email_fixed: ['メールアドレス（変更不可）', 'Email (không đổi được)', 'Email (can’t be changed)'],
    home_city: ['いつもの出発地', 'Nơi xuất phát quen thuộc', 'Usual departure city'],
    home_city_hint: ['旅の検索フォームの出発地に自動で入ります。', 'Tự điền vào ô điểm đi khi tìm chuyến.', 'Pre-fills the “From” field in trip search.'],
    bio: ['自己紹介（300文字まで）', 'Giới thiệu (tối đa 300 ký tự)', 'About you (up to 300)'],
    save_profile: ['プロフィールを保存', 'Lưu hồ sơ', 'Save profile'], profile_saved: ['プロフィールを保存しました。', 'Đã lưu hồ sơ.', 'Profile saved.'],
    fav_places: ['お気に入りのスポット', 'Địa điểm yêu thích', 'Favourite places'],
    fav_empty: ['お気に入りはまだありません', 'Chưa có địa điểm yêu thích', 'No favourites yet'],
    fav_empty2: ['スポットを探して、♡ボタンで保存しましょう。', 'Tìm địa điểm và bấm ♡ để lưu.', 'Find places and tap ♡ to save them.'],
    clear_history: ['履歴を削除', 'Xóa lịch sử', 'Clear history'],
    history_row: ['出発日 {d}・検索日 {s}', 'Ngày đi {d} · tìm ngày {s}', 'Travel {d} · searched {s}'],
    search_again: ['もう一度検索', 'Tìm lại', 'Search again'], search_new_date: ['日付を変えて検索', 'Tìm với ngày khác', 'Search with a new date'],
    history_empty: ['検索履歴はありません', 'Chưa có lịch sử tìm kiếm', 'No searches yet'],
    history_empty2: ['旅を検索すると、ここに保存されます。', 'Tìm chuyến đi và lịch sử sẽ lưu ở đây.', 'Your trip searches will be saved here.'],
    write_new: ['新しく書く', 'Viết bài mới', 'Write new'],
    my_posts_empty: ['まだ記事を投稿していません', 'Bạn chưa đăng bài nào', 'You haven’t posted yet'],
    my_posts_empty2: ['あなたのひとり旅の体験を書いてみましょう。', 'Hãy viết về chuyến đi một mình của bạn.', 'Write about your solo trip.'],
    pw_change: ['パスワードの変更', 'Đổi mật khẩu', 'Change password'],
    pw_current: ['現在のパスワード', 'Mật khẩu hiện tại', 'Current password'], pw_new: ['新しいパスワード', 'Mật khẩu mới', 'New password'],
    pw_new_hint: ['8文字以上で、英字と数字を両方含めてください。変更すると、ほかの端末ではログアウトされます。', 'Ít nhất 8 ký tự gồm chữ và số. Sau khi đổi, các thiết bị khác sẽ bị đăng xuất.', '8+ characters with letters and numbers. Other devices will be logged out.'],
    pw_change_btn: ['パスワードを変更', 'Đổi mật khẩu', 'Change password'], pw_changed: ['パスワードを変更しました。', 'Đã đổi mật khẩu.', 'Password changed.'],
    logout_all: ['すべての端末からログアウト', 'Đăng xuất khỏi mọi thiết bị', 'Log out everywhere'],
    logout_all_hint: ['ほかの端末で使っているログイン状態もすべて無効にします。', 'Hủy đăng nhập trên tất cả thiết bị khác.', 'Ends sessions on all your other devices too.'],
    delete_account: ['退会（アカウント削除）', 'Xóa tài khoản', 'Delete account'],
    delete_account_hint: ['アカウント、お気に入り、検索履歴、投稿した記事がすべて削除され、元に戻せません。', 'Tài khoản, yêu thích, lịch sử và bài viết sẽ bị xóa vĩnh viễn.', 'Your account, favourites, history and posts will be permanently deleted.'],
    delete_pw: ['確認のためパスワードを入力', 'Nhập mật khẩu để xác nhận', 'Enter your password to confirm'],
    delete_btn: ['アカウントを削除する', 'Xóa tài khoản', 'Delete my account'],
    confirm_delete_account: ['本当にアカウントを削除しますか？ この操作は元に戻せません。', 'Bạn chắc chắn muốn xóa tài khoản? Không thể hoàn tác.', 'Really delete your account? This can’t be undone.'],
    nf_text: ['お探しのページは見つかりませんでした。URLが変わったか、削除された可能性があります。', 'Không tìm thấy trang. Có thể đường dẫn đã thay đổi hoặc bị xóa.', 'We couldn’t find that page. It may have moved or been deleted.'],
    nf_home: ['ホームへ戻る', 'Về trang chủ', 'Go home'],
    // page titles
    t_home: ['Solo Travel Japan｜日本のひとり旅を検索・計画する', 'Solo Travel Japan | Lên kế hoạch du lịch Nhật một mình', 'Solo Travel Japan | Plan your solo trip in Japan'],
    t_search: ['旅を検索｜Solo Travel Japan', 'Tìm chuyến đi | Solo Travel Japan', 'Search trips | Solo Travel Japan'],
    t_places: ['スポットを探す｜Solo Travel Japan', 'Địa điểm | Solo Travel Japan', 'Places | Solo Travel Japan'],
    t_blog: ['ブログ・旅のヒント｜Solo Travel Japan', 'Blog | Solo Travel Japan', 'Blog | Solo Travel Japan'],
    t_login: ['ログイン｜Solo Travel Japan', 'Đăng nhập | Solo Travel Japan', 'Log in | Solo Travel Japan'],
    t_register: ['新規登録｜Solo Travel Japan', 'Đăng ký | Solo Travel Japan', 'Sign up | Solo Travel Japan'],
    t_account: ['マイページ｜Solo Travel Japan', 'Trang cá nhân | Solo Travel Japan', 'My page | Solo Travel Japan'],
    t_write: ['体験記を書く｜Solo Travel Japan', 'Viết bài | Solo Travel Japan', 'Write | Solo Travel Japan'],
    t_404: ['ページが見つかりません｜Solo Travel Japan', 'Không tìm thấy trang | Solo Travel Japan', 'Page not found | Solo Travel Japan'],
    suffix: ['｜Solo Travel Japan', ' | Solo Travel Japan', ' | Solo Travel Japan'],
    choose_month: ['月を選択', 'Chọn tháng', 'Choose a month'],
    filter_places: ['スポットの絞り込み', 'Lọc địa điểm', 'Filter places'],
    filter_posts: ['記事の絞り込み', 'Lọc bài viết', 'Filter posts'],
    account_menu: ['マイページメニュー', 'Menu trang cá nhân', 'My page menu'],
    view_toggle: ['表示切替', 'Chuyển chế độ xem', 'Switch view'],
    body_ph: ['## 見出し\n段落は空行で区切ります。\n- 箇条書きは「- 」で始めます\n**太字** も使えます', '## Tiêu đề\nCác đoạn cách nhau bằng một dòng trống.\n- Gạch đầu dòng bắt đầu bằng “- ”\n**Chữ đậm** cũng dùng được', '## Heading\nSeparate paragraphs with a blank line.\n- Start list items with “- ”\n**Bold** works too'],
    meta_home: ['日本をひとりで旅する人のための旅行サイト。航空券・高速バス・鉄道の検索、季節ごとのおすすめスポット、グルメ、ひとり旅ブログ。', 'Trang du lịch cho người đi Nhật Bản một mình: tìm vé máy bay, xe bus, tàu; địa điểm theo mùa, ẩm thực và blog.', 'A travel site for solo travellers in Japan: search flights, buses and trains, seasonal places, food and stories.'],
    meta_places: ['季節・月・エリア・カテゴリから、ひとり旅におすすめの観光スポット、グルメ、カフェ、温泉を探せます。', 'Tìm điểm tham quan, ẩm thực, cà phê, onsen hợp đi một mình theo mùa, tháng, khu vực.', 'Find solo-friendly sights, food, cafés and hot springs by season, month and area.'],
    meta_blog: ['日本のひとり旅に役立つコツ、グルメ、季節の観光情報、旅人の体験記。', 'Mẹo, ẩm thực, thông tin theo mùa và chia sẻ cho chuyến đi Nhật một mình.', 'Tips, food, seasonal guides and stories for solo travel in Japan.'],
    meta_search: ['日本国内の航空券・高速バス・鉄道を1名分の条件で検索・比較。', 'Tìm và so sánh vé máy bay, xe bus, tàu nội địa Nhật cho 1 người.', 'Search and compare domestic flights, buses and trains in Japan for one adult.'],
    airport_note: ['{c}には空港がないため、大阪（伊丹・関西）の空港で検索します。', '{c} không có sân bay nên sẽ tìm vé qua sân bay Osaka (Itami, Kansai).', '{c} has no airport, so flights are searched from Osaka (Itami, Kansai).'],
    post_lang: ['記事の言語', 'Ngôn ngữ bài viết', 'Post language'],
    original_in: ['この記事は{l}で書かれています。', 'Bài viết này được viết bằng {l}.', 'This post was written in {l}.'],
    translate_btn: ['Google 翻訳で{l}に翻訳', 'Dịch sang {l} bằng Google Dịch', 'Translate to {l} with Google Translate'],
    translate_note: ['（Google 翻訳のページが新しいタブで開きます）', '(Mở trang Google Dịch ở tab mới)', '(Opens Google Translate in a new tab)'],
    lname_ja: ['日本語', 'tiếng Nhật', 'Japanese'], lname_vi: ['ベトナム語', 'tiếng Việt', 'Vietnamese'], lname_en: ['英語', 'tiếng Anh', 'English'],
    now_badge: ['今', 'Nay', 'Now'],
    ja_name: ['', 'Tên tiếng Nhật', 'Japanese name'],
    dest_title: ['{c}で何する？ {m}のおすすめ', 'Ở {c} có gì? Gợi ý cho {m}', 'What to do in {c} in {m}'],
    dest_sub: ['出発日の月に合わせて、目的地のグルメ・カフェ・観光スポット・温泉を表示しています。', 'Gợi ý ẩm thực, cà phê, điểm tham quan và onsen tại điểm đến, theo đúng tháng bạn đi.', 'Food, cafés, sights and hot springs at your destination for the month you travel.'],
    dest_all_city: ['{c}のスポットをすべて見る（{n}件）', 'Xem tất cả địa điểm ở {c} ({n})', 'See all places in {c} ({n})'],
    dest_empty_month: ['{m}におすすめの{c}のスポットはまだありません。ほかの時期のスポットは「すべて見る」から確認できます。', 'Chưa có địa điểm ở {c} hợp với {m}. Xem địa điểm các tháng khác ở nút “Xem tất cả”.', 'No places in {c} are recommended for {m} yet. See other seasons with “See all”.'],
    dest_empty_city: ['{c}のスポットはまだ登録されていません。', 'Chưa có địa điểm nào ở {c}.', 'No places in {c} yet.'],
    city_places: ['{c}のスポット', 'Địa điểm ở {c}', 'Places in {c}'],
    dest_nearby: ['{r}エリアのスポットも含みます', 'Bao gồm cả địa điểm trong vùng {r}', 'Includes places elsewhere in {r}'],
    dest_empty: ['この時期・エリアに該当するスポットはまだありません。', 'Chưa có địa điểm phù hợp với tháng và khu vực này.', 'No places for this month and area yet.'],
    dest_all_places: ['{r}のスポットをすべて見る', 'Xem tất cả địa điểm ở {r}', 'See all places in {r}'],
  };
  const IDX = { ja: 0, vi: 1, en: 2 };
  const EN_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  function t(key, vars) {
    const row = D[key];
    let s = row ? row[IDX[lang]] : key;
    if (s === undefined || s === null) s = row ? row[0] : key;
    if (typeof s === 'string' && vars) {
      s = s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? vars[k] : `{${k}}`));
    }
    return s;
  }
  function monthName(n) {
    if (lang === 'en') return EN_MONTHS[n - 1];
    return t('month_n', { n });
  }
  function monthShort(n) {
    return lang === 'en' ? EN_MONTHS[n - 1].slice(0, 3) : lang === 'vi' ? `T${n}` : `${n}月`;
  }
  function fmtDate(iso) {
    const d = new Date(iso);
    if (lang === 'ja') return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
    return d.toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-GB', { year: 'numeric', month: 'short', day: 'numeric' });
  }
  /** Pick the localized value of a record field: field / field_en / field_vi */
  function pick(obj, field, enField, viField) {
    if (lang === 'ja') return obj[field];
    if (lang === 'vi') return obj[viField] || obj[enField] || obj[field];
    return obj[enField] || obj[field];
  }

  function apply(root = document) {
    root.querySelectorAll('[data-i18n]').forEach((el) => (el.textContent = t(el.dataset.i18n)));
    root.querySelectorAll('[data-i18n-ph]').forEach((el) => el.setAttribute('placeholder', t(el.dataset.i18nPh)));
    root.querySelectorAll('[data-i18n-aria]').forEach((el) => el.setAttribute('aria-label', t(el.dataset.i18nAria)));
    root.querySelectorAll('[data-i18n-content]').forEach((el) => el.setAttribute('content', t(el.dataset.i18nContent)));
  }

  function setLang(l) {
    if (!LANGS[l]) return;
    try {
      localStorage.setItem('stj_lang', l);
    } catch (_) {}
    document.cookie = `stj_lang=${l}; path=/; max-age=31536000; SameSite=Lax`;
    location.reload();
  }

  window.I18N = { lang, LANGS, t, apply, setLang, monthName, monthShort, fmtDate, pick };
  apply();
  document.addEventListener('DOMContentLoaded', () => apply());
})();
