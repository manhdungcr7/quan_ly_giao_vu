# Hướng dẫn sử dụng trang Sổ tay công tác

## Tổng quan
Trang "Sổ tay công tác" đã được phát triển theo thiết kế trong hình 2, bao gồm:

### ✅ Tính năng đã hoàn thành:
1. **Giao diện chính**: Hiển thị roadmap, kế hoạch triển khai và hành động tiếp theo
2. **Timeline tuần**: Hiển thị 7 ngày trong tuần với progress circle
3. **Chi tiết từng ngày**: Modal để nhập main focus, tasks và notes
4. **Lưu trữ dữ liệu**: Lưu vào localStorage và có thể mở rộng lưu vào database
5. **Responsive design**: Tương thích trên mobile và desktop

### 🎯 Cách truy cập:
- URL: `http://localhost:3000/workbook`
- Menu sidebar: **Nghiệp vụ giảng dạy > Sổ tay công tác**

### 📋 Cách sử dụng:

#### 1. Xem kế hoạch tuần
- Trang chính hiển thị timeline của 7 ngày trong tuần
- Mỗi ngày có progress circle hiển thị % hoàn thành
- Hiển thị preview của main focus, tasks và notes

#### 2. Chỉnh sửa chi tiết ngày
- Click vào thẻ ngày bất kỳ để mở modal chi tiết
- Hoặc click vào icon edit ở góc phải thẻ ngày
- Điền thông tin:
  - **Main Focus**: Mục tiêu chính trong ngày
  - **Công việc**: Danh sách tasks cần làm
  - **Notes**: Ghi chú bổ sung

#### 3. Lưu và theo dõi tiến độ
- Click "Lưu" để lưu thông tin
- Progress tự động tính toán: 33% main focus + 33% tasks + 34% notes
- Dữ liệu hiện tại lưu trong localStorage (có thể mở rộng database)

### 🛠️ Các file đã tạo:

#### Views:
- `views/workbook/index.ejs` - Trang chính sổ tay công tác

#### CSS:
- `public/css/workbook.css` - Styles cho giao diện workbook

#### JavaScript:
- `public/js/workbook.js` - Logic xử lý tương tác frontend

#### Backend (MVC):
- `app/controllers/WorkbookController.js` - Controller xử lý logic
- `app/models/Workbook.js` - Model cho bảng workbooks  
- `app/models/WorkbookEntry.js` - Model cho bảng workbook_entries
- `database/workbook_schema.sql` - Schema database

#### Routes:
- Routes đã được thêm vào `app/routes/web.js`:
  - `GET /workbook` - Trang chính
  - `POST /workbook/entry` - Lưu entry ngày
  - `GET /workbook/entry` - Lấy entry ngày
  - `GET /workbook/history` - Lịch sử các tuần
  - `GET /workbook/:id` - Chi tiết tuần cụ thể

### 🗄️ Database Schema:
- **workbooks**: Lưu thông tin tuần (user_id, week_start, week_end, status)
- **workbook_entries**: Lưu chi tiết từng ngày (workbook_id, day_of_week, main_focus, tasks, notes, progress)

### 🔄 Tích hợp với hệ thống:
- Menu sidebar đã được cập nhật
- Routes đã được khai báo
- CSS và JS đã được link trong layout
- Server đã khởi động thành công

### 🎨 Design highlights:
- Gradient background tím xanh như mockup
- Cards với shadow và hover effects
- Progress circles với SVG animation
- Modal popup responsive
- Badge và status indicators
- Font Awesome icons

### 📱 Responsive:
- Mobile: Single column layout
- Tablet: 2-column grid  
- Desktop: 3-column grid với sidebar

Trang đã sẵn sàng sử dụng! Truy cập `http://localhost:3000/workbook` để xem kết quả.