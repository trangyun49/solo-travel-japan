'use strict';
/**
 * Server-side message translation (ja → vi / en).
 * Code throws Japanese messages; the error handler translates them for the request language.
 */
const LANGS = ['ja', 'vi', 'en'];

function langOf(req) {
  const h = String(req.get('x-lang') || '').toLowerCase();
  if (LANGS.includes(h)) return h;
  const c = req.cookies && req.cookies.stj_lang;
  return LANGS.includes(c) ? c : 'ja';
}

const FIELDS = {
  メールアドレス: ['email', 'Email'],
  パスワード: ['mật khẩu', 'Password'],
  新しいパスワード: ['mật khẩu mới', 'New password'],
  ニックネーム: ['biệt danh', 'Nickname'],
  出発地: ['điểm xuất phát', 'Departure'],
  目的地: ['điểm đến', 'Destination'],
  自己紹介: ['giới thiệu', 'Bio'],
  タイトル: ['tiêu đề', 'Title'],
  本文: ['nội dung', 'Body'],
  概要: ['tóm tắt', 'Summary'],
  キーワード: ['từ khóa', 'Keyword'],
  カテゴリ: ['danh mục', 'Category'],
  地域: ['khu vực', 'Region'],
  季節: ['mùa', 'Season'],
  カバー画像: ['ảnh bìa', 'Cover image'],
  日付: ['ngày', 'Date'],
  出発日: ['ngày khởi hành', 'Departure date'],
  月: ['tháng', 'Month'],
  言語: ['ngôn ngữ', 'Language'],
};
const f = (name, lang) => (FIELDS[name] ? FIELDS[name][lang === 'vi' ? 0 : 1] : name);

// [regex on Japanese message, vi builder, en builder]
const PATTERNS = [
  [/^(.+)を入力してください。$/, (m) => `Vui lòng nhập ${f(m[1], 'vi')}.`, (m) => `Please enter ${f(m[1], 'en').toLowerCase()}.`],
  [/^(.+)は(\d+)文字以上で入力してください。$/, (m) => `${cap(f(m[1], 'vi'))} phải có ít nhất ${m[2]} ký tự.`, (m) => `${f(m[1], 'en')} must be at least ${m[2]} characters.`],
  [/^(.+)は(\d+)文字以内で入力してください。$/, (m) => `${cap(f(m[1], 'vi'))} tối đa ${m[2]} ký tự.`, (m) => `${f(m[1], 'en')} must be at most ${m[2]} characters.`],
  [/^(.+)の値が正しくありません。$/, (m) => `Giá trị ${f(m[1], 'vi')} không hợp lệ.`, (m) => `Invalid ${f(m[1], 'en').toLowerCase()}.`],
  [/^(.+)の形式が正しくありません。$/, (m) => `Định dạng ${f(m[1], 'vi')} không đúng.`, (m) => `Invalid ${f(m[1], 'en').toLowerCase()} format.`],
  [/^(.+)が正しくありません。$/, (m) => `${cap(f(m[1], 'vi'))} không đúng.`, (m) => `${f(m[1], 'en')} is incorrect.`],
  [/^(.+)には英字と数字を両方含めてください。$/, (m) => `${cap(f(m[1], 'vi'))} phải có cả chữ cái và chữ số.`, (m) => `${f(m[1], 'en')} must contain both letters and numbers.`],
  [/^(.+)を選択してください。$/, (m) => `Vui lòng chọn ${f(m[1], 'vi')}.`, (m) => `Please choose ${f(m[1], 'en').toLowerCase()}.`],
];
function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const EXACT = {
  'ログインが必要です。': ['Bạn cần đăng nhập.', 'Please log in.'],
  'このメールアドレスは既に登録されています。': ['Email này đã được đăng ký.', 'This email is already registered.'],
  'メールアドレスとパスワードを入力してください。': ['Vui lòng nhập email và mật khẩu.', 'Please enter your email and password.'],
  'メールアドレスまたはパスワードが正しくありません。': ['Email hoặc mật khẩu không đúng.', 'Incorrect email or password.'],
  '現在のパスワードが正しくありません。': ['Mật khẩu hiện tại không đúng.', 'Your current password is incorrect.'],
  'スポットが見つかりません。': ['Không tìm thấy địa điểm.', 'Place not found.'],
  '記事が見つかりません。': ['Không tìm thấy bài viết.', 'Post not found.'],
  'この記事を編集する権限がありません。': ['Bạn không có quyền sửa bài viết này.', 'You cannot edit this post.'],
  '不正なリクエストです。': ['Yêu cầu không hợp lệ.', 'Invalid request.'],
  '出発地と目的地が同じです。': ['Điểm xuất phát và điểm đến trùng nhau.', 'Departure and destination are the same.'],
  '出発日は今日以降を選択してください。': ['Vui lòng chọn ngày khởi hành từ hôm nay trở đi.', 'Please choose a departure date from today onwards.'],
  '出発日は約11か月先までを選択してください。': ['Chỉ chọn được ngày trong khoảng 11 tháng tới.', 'Please choose a date within about 11 months.'],
  'JSONの形式が正しくありません。': ['Dữ liệu JSON không hợp lệ.', 'Invalid JSON.'],
  '試行回数が多すぎます。しばらくしてから再度お試しください。': ['Bạn thử quá nhiều lần. Vui lòng đợi một lúc rồi thử lại.', 'Too many attempts. Please wait a while and try again.'],
  'サーバーエラーが発生しました。時間をおいて再度お試しください。': ['Lỗi máy chủ. Vui lòng thử lại sau.', 'Server error. Please try again later.'],
};

function translate(msg, lang) {
  if (lang === 'ja' || typeof msg !== 'string') return msg;
  const i = lang === 'vi' ? 0 : 1;
  if (EXACT[msg]) return EXACT[msg][i];
  for (const [re, vi, en] of PATTERNS) {
    const m = msg.match(re);
    if (m) return (lang === 'vi' ? vi : en)(m);
  }
  return msg;
}

module.exports = { langOf, translate, LANGS };
