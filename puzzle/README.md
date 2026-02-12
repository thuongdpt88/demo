# Sliding Puzzle Game - Trò chơi xếp hình trượt ô

Một trò chơi sliding puzzle (xếp hình trượt ô) đơn giản được xây dựng bằng HTML, CSS và vanilla JavaScript.

## 🎮 Tính năng

- ✨ Puzzle có thể chọn kích thước từ 3×3 đến 6×6
- 🖼️ Sử dụng ảnh mặc định hoặc tải ảnh tùy chỉnh
- 📤 Hỗ trợ kéo và thả (drag & drop) để tải ảnh
- 🔀 Thuật toán shuffle đảm bảo trạng thái có thể giải (solvable)
- 📊 Đếm số bước di chuyển
- ⏱️ Đồng hồ đếm thời gian
- 🎉 Thông báo chúc mừng khi hoàn thành
- 📱 Responsive, tương thích với mobile

## 🚀 Cách chạy

### Cách 1: Mở trực tiếp file HTML
1. Mở file `index.html` trong trình duyệt web (Chrome, Firefox, Safari, Edge...)
2. Click vào file hoặc kéo thả vào trình duyệt

### Cách 2: Chạy với local server
```bash
# Sử dụng Python
python3 -m http.server 8000

# Hoặc sử dụng Node.js
npx http-server

# Sau đó truy cập: http://localhost:8000/puzzle/
```

### Cách 3: Host trên GitHub Pages
1. Push folder `puzzle/` lên GitHub repository
2. Bật GitHub Pages trong repository settings
3. Truy cập `https://<username>.github.io/<repo>/puzzle/`

## 📁 Cấu trúc file

```
puzzle/
├── index.html          # File HTML chính
├── styles.css          # Stylesheet cho giao diện
├── puzzle.js           # Logic game (vanilla JavaScript)
├── README.md           # File hướng dẫn này
└── assets/
    └── sample.jpg      # Ảnh mẫu mặc định
```

## 🎯 Cách chơi

1. **Chọn kích thước lưới**: Chọn từ 3×3 (dễ) đến 6×6 (rất khó)
2. **Chọn ảnh**: Sử dụng ảnh mặc định hoặc tải ảnh tùy chỉnh
   - Click nút "Chọn ảnh" để chọn file
   - Hoặc kéo và thả ảnh vào vùng hiển thị
3. **Bắt đầu chơi**: Click nút "Shuffle" để xáo trộn puzzle
4. **Di chuyển ô**: Click vào các ô gần ô trống để di chuyển
5. **Hoàn thành**: Sắp xếp lại các ô theo đúng vị trí ban đầu

## 🖼️ Thay đổi ảnh mặc định

Để thay đổi ảnh mặc định:
1. Thay file `assets/sample.jpg` bằng ảnh của bạn
2. Hoặc giữ nguyên tên file `sample.jpg` (khuyến nghị kích thước 600×600px)
3. Các định dạng hỗ trợ: JPG, PNG, SVG, GIF

## 🔧 Chi tiết kỹ thuật

### Thuật toán Shuffle
- Sử dụng Fisher-Yates shuffle để xáo trộn ngẫu nhiên
- Kiểm tra tính solvable bằng parity check:
  - Grid lẻ (3×3, 5×5): Số inversions phải chẵn
  - Grid chẵn (4×4, 6×6): (Inversions + vị trí hàng của ô trống) phải lẻ
- Lặp lại shuffle nếu trạng thái không solvable

### Logic di chuyển
- Chỉ cho phép di chuyển ô kề với ô trống (trên, dưới, trái, phải)
- Swap vị trí của ô được click với ô trống
- Kiểm tra hoàn thành sau mỗi bước di chuyển

### Hoàn thành puzzle
- Kiểm tra tất cả các ô đã đúng vị trí
- Dừng timer
- Hiển thị modal với số bước và thời gian
- Cho phép chơi lại với cùng ảnh

## 🌐 Tương thích trình duyệt

- ✅ Chrome/Edge (phiên bản mới)
- ✅ Firefox (phiên bản mới)
- ✅ Safari (phiên bản mới)
- ✅ Opera (phiên bản mới)

## 📝 Lưu ý

- Không cần build step hay dependencies
- Hoàn toàn vanilla JavaScript, không sử dụng framework
- Code đơn giản, dễ đọc với comment tiếng Việt/Anh
- Ảnh mẫu có thể thay thế bất cứ lúc nào

## 🤝 Đóng góp

Mọi đóng góp đều được hoan nghênh! Hãy tạo issue hoặc pull request nếu bạn muốn cải thiện game.

## 📄 License

Free to use and modify.
