# ひとり旅ジャパン — Solo Travel Japan

Website du lịch dành cho người đi du lịch một mình tại Nhật Bản: tìm hành trình (máy bay / xe bus đường dài / tàu Shinkansen / khách sạn), gợi ý địa điểm theo mùa – tháng – khu vực, blog chia sẻ kinh nghiệm và tài khoản người dùng.

Giao diện 3 ngôn ngữ (日本語 / Tiếng Việt / English, nút quả cầu ở góc phải trên). Ảnh địa điểm lấy từ Wikimedia Commons (giấy phép CC, có ghi nguồn ở trang chi tiết).

## Công nghệ

| Phần | Công nghệ |
|---|---|
| Frontend | HTML + CSS + JavaScript thuần (không framework, không CDN script), responsive PC / tablet / điện thoại |
| Backend | Node.js 22+, Express 5 (REST API `/api/*`) |
| Database | PostgreSQL (production – Neon/Vercel Postgres/Render…) · SQLite tích hợp sẵn của Node (`node:sqlite`) khi chạy local |
| Bảo mật | bcrypt (băm mật khẩu), JWT trong cookie `httpOnly` + `SameSite=Lax` (+ `Secure` khi production), Helmet (CSP, các header bảo mật), giới hạn số lần đăng nhập (rate limit), kiểm tra Origin + chỉ nhận JSON cho các request thay đổi dữ liệu, kiểm tra dữ liệu đầu vào phía server |
| Giá vé máy bay thời gian thực (tuỳ chọn) | Google Flights qua **SerpApi** (`SERPAPI_KEY`) |
| Liên kết tìm vé | Trip.com, Google Flights, Skyscanner, Traveloka (máy bay) · バス比較なび, WILLER EXPRESS, 高速バスネット (xe bus) · Google Maps, NAVITIME, えきねっと, スマートEX (tàu) · Agoda (khách sạn, theo thành phố + ngày + 1 người), Trip.com (trang khách sạn) |

## Chạy local

Yêu cầu: **Node.js 22.5 trở lên** (để có `node:sqlite`).

```bash
npm install
cp .env.example .env      # tuỳ chọn – có thể để trống tất cả
npm start                 # http://localhost:3000
npm test                  # chạy smoke test toàn bộ API (DB tạm trong bộ nhớ)
```

Không cần cài database khi chạy local: dữ liệu được lưu vào `data/app.db` (SQLite) và tự tạo bảng + dữ liệu mẫu (140 địa điểm ở 30 thành phố, 8 bài blog) ở lần chạy đầu.
Muốn dùng PostgreSQL local: đặt `DATABASE_URL=postgres://user:pass@localhost:5432/dbname` trong `.env`.

## Biến môi trường

| Biến | Bắt buộc | Ý nghĩa |
|---|---|---|
| `DATABASE_URL` | Có (trên cloud) | Chuỗi kết nối PostgreSQL. Trên Vercel được điền tự động khi gắn database Neon. |
| `JWT_SECRET` | Không | Khoá ký phiên đăng nhập (≥ 32 ký tự). Nếu bỏ trống, server tự sinh ngẫu nhiên một lần và lưu trong DB (không nằm trong source code). |
| `SERPAPI_KEY` | Không | Bật hiển thị giá vé máy bay thời gian thực. Không có key → chỉ hiển thị liên kết tìm kiếm trực tiếp (không hiển thị giá giả). |

Không có API key hay mật khẩu nào nằm trong source code; `.env` đã được đưa vào `.gitignore`.

## Deploy lên Vercel + Neon (miễn phí)

1. Đẩy thư mục này lên một repository GitHub.
2. Vercel → **Add New → Project** → chọn repository → **Deploy** (không cần chỉnh build settings; `vercel.json` đã cấu hình sẵn).
3. Trong project trên Vercel → **Storage → Create Database → Neon (Postgres)** → **Connect** vào project. Vercel tự thêm `DATABASE_URL`.
4. (Tuỳ chọn) **Settings → Environment Variables**: thêm `JWT_SECRET`, `SERPAPI_KEY`.
5. **Deployments → Redeploy**. Mở `https://<tên-project>.vercel.app/api/health` → phải trả về `{"ok":true,"db":"postgres"}`.

Có thể deploy lên Render/Railway như một Node web service thông thường: build `npm install`, start `npm start`, đặt `DATABASE_URL`.

## Cấu trúc

```
server.js            # chạy local / Render (app.listen)
api/index.js         # entry serverless cho Vercel
vercel.json
src/
  app.js             # Express app, bảo mật, định tuyến
  db.js              # adapter PostgreSQL / SQLite
  init.js            # tạo bảng, seed dữ liệu, JWT secret
  auth.js            # phiên đăng nhập (JWT cookie)
  validate.js
  routes/            # auth, account, places, posts, trips
  data/              # cities, places, more/ (địa điểm bổ sung JA/EN/VI), posts, photos (Wikimedia), *-i18n, meta
  i18n.js            # dịch thông báo lỗi API theo ngôn ngữ (header X-Lang / cookie stj_lang)
public/              # trang HTML, css/app.css, js/i18n.js (từ điển giao diện), js/*.js, img/
scripts/smoke-test.js
```

## API chính

| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/api/auth/register` · `/login` · `/logout` · `/logout-all` | Đăng ký, đăng nhập, đăng xuất, đăng xuất mọi thiết bị |
| GET | `/api/auth/me` | Người dùng hiện tại |
| GET/PUT/DELETE | `/api/account`, `/account/profile`, `/account/password` | Thông tin, sửa hồ sơ, đổi mật khẩu, xoá tài khoản |
| GET/POST/DELETE | `/api/account/favorites[/:slug]` | Địa điểm yêu thích |
| GET/DELETE | `/api/account/history` | Lịch sử tìm kiếm |
| GET | `/api/places?region=&category=&season=&month=&solo=1&featured=1&q=` | Lọc địa điểm |
| GET | `/api/places/:slug` | Chi tiết địa điểm |
| GET/POST/PUT/DELETE | `/api/posts[/:slug]` | Blog (lọc theo category/season/region/source/q; người dùng viết/sửa/xoá bài của mình) |
| GET | `/api/trips/cities` · `/api/trips/search?from=&to=&date=` | Tìm hành trình (luôn 1 người lớn) |

## Tài khoản quản trị (admin)

Tài khoản có `role = 'admin'` trong bảng `users` sẽ thấy thanh xanh "管理者としてログイン中", nút **管理画面** và trang `/admin` (thống kê, danh sách người dùng, cấp/bỏ quyền, xoá bài của người dùng). Không thể tự đăng ký thành admin từ giao diện.

Cấp quyền cho một tài khoản đã đăng ký:

- Trên Neon (SQL Editor): `UPDATE users SET role = 'admin' WHERE email = 'ban@example.com';`
- Hoặc bằng lệnh (dùng `DATABASE_URL` trong `.env` nếu có, không thì SQLite local): `npm run make-admin -- ban@example.com` (thêm `--remove` để bỏ quyền).
