# 🎬 QNK Media Downloader - Công Cụ Tải Video Đa Nền Tảng

Ứng dụng web tải video đa nền tảng (**TikTok không logo, Facebook HD, YouTube, Instagram, Twitter/X...**) hoạt động **100% Client-Side** trên trình duyệt, được tối ưu hóa đặc biệt để triển khai hoàn toàn miễn phí lên **GitHub Pages**.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![GitHub Pages](https://img.shields.io/badge/deploy-GitHub%20Pages-success.svg)

---

## 🌟 Tính Năng Nổi Bật

- **TikTok Siêu Nhanh & Không Logo**:
  - Tự động tách và tải video HD không watermark / logo.
  - Tách tải file nhạc nền MP3 gốc của video.
  - Xem trước video và ảnh bìa ngay trên web.
- **Hỗ Trợ Đa Nền Tảng (Facebook, YouTube, Instagram, X...)**:
  - Hỗ trợ Facebook (Watch, Reels, Video nhóm/cá nhân công khai).
  - Hỗ trợ YouTube (Video, Shorts) với tùy chọn chất lượng lên đến 1080p.
  - Hỗ trợ các nền tảng mạng xã hội khác: Twitter/X, Instagram Reels/Post, Reddit...
- **Kiến Trúc Multi-Engine & Auto-Failover**:
  - Kết hợp nhiều API Engine độc lập (TikWM Engine, Cobalt Engine đa máy chủ).
  - Tự động chuyển máy chủ dự phòng nếu một máy chủ bị quá tải.
  - Tích hợp sẵn **Cổng Dự Phòng 1-Click (Fallback Mirrors)** giúp bạn không bao giờ bị gián đoạn.
- **Giao Diện Hiện Đại (Cyber Glassmorphism)**:
  - Hỗ trợ Dark Mode & Light Mode linh hoạt.
  - Tự động nhận diện nền tảng khi dán link (Paste from Clipboard).
  - Trình phát video xem trước trực tiếp (Preview Player).
  - Lưu lịch sử tải video trên thiết bị (`localStorage`).
  - Kiểm tra độ trễ (Ping) các máy chủ và cho phép cấu hình Custom Cobalt API Instance.

---

## 📂 Cấu Trúc Thư Mục

```text
qnk-tools/
├── index.html                  # Giao diện chính của ứng dụng
├── css/
│   └── style.css               # Phong cách Cyber Glassmorphism, Dark/Light Mode
├── js/
│   ├── config.js               # Cấu hình danh sách API endpoints, regex nền tảng
│   ├── api.js                  # Bộ xử lý Multi-Engine API và Fallback logic
│   └── app.js                  # Điều khiển giao diện, clipboard, lịch sử, player
├── .github/
│   └── workflows/
│       └── deploy.yml          # Workflow tự động deploy lên GitHub Pages
├── .gitignore
└── README.md
```

---

## 🚀 Hướng Dẫn Triển Khai Lên GitHub Pages

Dự án này là web tĩnh thuần (Static Web: HTML5, CSS3, JavaScript ES6), không cần `npm install` hay `build` phức tạp.

### Bước 1: Khởi tạo Git và Commit mã nguồn

Mở Terminal tại thư mục `d:\projects\qnk-tools` và chạy các lệnh:

```bash
# 1. Khởi tạo kho lưu trữ git
git init

# 2. Thêm toàn bộ file vào git
git add .

# 3. Tạo commit đầu tiên
git commit -m "feat: Khoi tao du an QNK Media Downloader chay tren GitHub Pages"
```

### Bước 2: Tạo Repository trên GitHub và Đẩy mã nguồn

1. Truy cập [github.com/new](https://github.com/new) và tạo một Repository mới (ví dụ: `qnk-tools`).
2. Liên kết và đẩy code lên:

```bash
# Đổi tên nhánh chính thành main
git branch -M main

# Liên kết với repo của bạn (thay username/repo tương ứng)
git remote add origin https://github.com/<your-username>/qnk-tools.git

# Đẩy code lên GitHub
git push -u origin main
```

### Bước 3: Kích hoạt GitHub Pages

Có 2 cách kích hoạt, bạn chọn 1 trong 2:

- **Cách 1: Sử dụng GitHub Actions tự động (Khuyên dùng)**:
  - Dự án đã tích hợp sẵn file `.github/workflows/deploy.yml`.
  - Bạn chỉ cần vào **Settings** của repo trên GitHub -> Mục **Pages** (ở menu bên trái).
  - Tại phần **Build and deployment** > **Source**, chọn: **GitHub Actions**.
  - GitHub sẽ tự động chạy workflow và cung cấp đường dẫn web (ví dụ: `https://<your-username>.github.io/qnk-tools/`).

- **Cách 2: Triển khai từ nhánh `main` trực tiếp**:
  - Vào **Settings** -> **Pages**.
  - Tại **Build and deployment** > **Source**, chọn **Deploy from a branch**.
  - Nhánh (Branch): chọn **`main`**, thư mục chọn **`/ (root)`**, sau đó bấm **Save**.
  - Sau khoảng 1-2 phút, trang web sẽ chính thức online!

---

## 💻 Chạy Thử Tại Máy Cục Bộ (Local)

Bạn có thể mở trực tiếp file `index.html` bằng bất kỳ trình duyệt nào:
- Nhấp đúp chuột vào file `index.html` trong File Explorer.
- Hoặc sử dụng extension **Live Server** trong VS Code / Antigravity.

---

## ⚖️ Tuyên Bố Miễn Trừ Trách Nhiệm (Disclaimer)

Công cụ này được tạo ra cho mục đích học tập và phục vụ nhu cầu lưu trữ cá nhân đối với các nội dung mà bạn sở hữu bản quyền hoặc được tác giả cho phép chia sẻ công khai. Vui lòng tôn trọng quyền sở hữu trí tuệ và Điều khoản dịch vụ của từng nền tảng mạng xã hội.
