# Sửa lỗi trùng lặp tên trang Nghiên cứu

## Vấn đề
Trong sidebar có 2 mục với tên gây nhầm lẫn:
- ❌ "Nghiên cứu khoa học" → `/research`
- ❌ "Quản lý nghiên cứu" → `/research/manage`

Người dùng không phân biệt được đây là 2 trang với chức năng khác nhau:
- **Trang 1**: Dashboard/Tổng quan (READ-ONLY) - Xem thống kê, báo cáo
- **Trang 2**: Quản lý dữ liệu (ADMIN) - Thêm/sửa/xóa dữ liệu

## Giải pháp

### 1. Đổi tên trong Sidebar
**File: `views/partials/sidebar.ejs`**

```html
<!-- TRƯỚC -->
<span>Nghiên cứu khoa học</span>     → /research
<span>Quản lý nghiên cứu</span>      → /research/manage

<!-- SAU -->
<span>Tổng quan nghiên cứu</span>    → /research (Dashboard)
<span>Quản lý dữ liệu NC</span>      → /research/manage (CRUD)
```

Icon cũng được cập nhật:
- `/research`: `fa-chart-line` (biểu tượng thống kê)
- `/research/manage`: `fa-database` (biểu tượng quản lý dữ liệu)

### 2. Cập nhật Breadcrumb
**File: `app/utils/breadcrumb.js`**

```javascript
research: {
  label: 'Tổng quan nghiên cứu',
  icon: 'fa-chart-line'
}
```

### 3. Cập nhật Controller Titles
**File: `app/controllers/ResearchController.js`**
```javascript
title: 'Tổng quan nghiên cứu khoa học'
```

**File: `app/controllers/ResearchManagementController.js`**
```javascript
title: 'Quản lý dữ liệu nghiên cứu'
```

### 4. Cập nhật View Headers
**File: `views/research/index.ejs`**
```html
<span class="hero-badge">Chiến lược phát triển</span>
<h1>Tổng quan nghiên cứu khoa học</h1>
<p>Theo dõi hệ sinh thái nghiên cứu...</p>
```

**File: `views/research/manage.ejs`**
```html
<span class="hero-eyebrow">Quản trị dữ liệu</span>
<h1>Quản lý dữ liệu nghiên cứu khoa học</h1>
<p>Thêm mới, chỉnh sửa và xóa dữ liệu...</p>
```

### 5. Cập nhật Routes Description
**File: `app/routes/web.js`**

Thêm mô tả rõ ràng cho 2 route:
```javascript
{
  path: '/research',
  title: 'Tổng quan nghiên cứu khoa học',
  subtitle: 'Dashboard thống kê và báo cáo nghiên cứu khoa học',
  notes: 'Trang dashboard tổng quan (chỉ xem, không chỉnh sửa)'
},
{
  path: '/research/manage',
  title: 'Quản lý dữ liệu nghiên cứu',
  subtitle: 'Thêm, sửa, xóa dữ liệu nghiên cứu khoa học',
  notes: 'Trang quản trị dữ liệu (dành cho admin/quản lý)'
}
```

## Kết quả

### Sidebar sau khi sửa:
```
NGHIÊN CỨU & DỰ ÁN
📊 Tổng quan nghiên cứu      → Dashboard (xem)
🗄️  Quản lý dữ liệu NC        → Admin CRUD (thêm/sửa/xóa)
📁 Quản lý dự án
```

### Phân biệt rõ ràng:

| Trang | URL | Chức năng | Icon | Ai dùng? |
|-------|-----|-----------|------|----------|
| **Tổng quan nghiên cứu** | `/research` | Xem dashboard, thống kê, báo cáo | 📊 chart-line | Mọi người |
| **Quản lý dữ liệu NC** | `/research/manage` | Thêm/sửa/xóa dữ liệu nghiên cứu | 🗄️ database | Admin/Quản lý |

## Chi tiết 2 trang

### Trang 1: `/research` - Tổng quan nghiên cứu
**Controller:** `ResearchController.js`
**View:** `views/research/index.ejs`
**Chức năng:**
- ✅ Xem tổng quan số liệu
- ✅ Thống kê trạng thái đề tài
- ✅ Xem milestone timeline
- ✅ Leaderboard giảng viên
- ✅ Đề tài sinh viên
- ❌ KHÔNG cho phép thêm/sửa/xóa

### Trang 2: `/research/manage` - Quản lý dữ liệu
**Controller:** `ResearchManagementController.js`
**View:** `views/research/manage.ejs`
**Chức năng:**
- ✅ Thêm đề tài giảng viên
- ✅ Sửa đề tài giảng viên
- ✅ Xóa đề tài giảng viên
- ✅ Quản lý đề tài sinh viên
- ✅ Quản lý kết quả nghiên cứu
- ✅ CRUD đầy đủ

## Files đã thay đổi

1. ✅ `views/partials/sidebar.ejs` - Đổi tên menu items
2. ✅ `app/utils/breadcrumb.js` - Cập nhật label breadcrumb
3. ✅ `app/controllers/ResearchController.js` - Đổi title
4. ✅ `app/controllers/ResearchManagementController.js` - Đổi title
5. ✅ `views/research/index.ejs` - Cập nhật header
6. ✅ `views/research/manage.ejs` - Cập nhật header và link
7. ✅ `app/routes/web.js` - Cập nhật mô tả routes

## Kiểm tra

### Test Case 1: Xem sidebar
1. Đăng nhập vào hệ thống
2. Xem sidebar bên trái
3. Tìm phần "NGHIÊN CỨU & DỰ ÁN"
4. Kiểm tra:
   - ✅ "Tổng quan nghiên cứu" (icon 📊)
   - ✅ "Quản lý dữ liệu NC" (icon 🗄️)

### Test Case 2: Truy cập trang Tổng quan
1. Click vào "Tổng quan nghiên cứu"
2. Kiểm tra:
   - ✅ URL: `/research`
   - ✅ Title: "Tổng quan nghiên cứu khoa học"
   - ✅ Có dashboard với thống kê
   - ✅ KHÔNG có form thêm/sửa/xóa
   - ✅ Có nút "Quản lý dữ liệu nghiên cứu" (dành cho admin)

### Test Case 3: Truy cập trang Quản lý dữ liệu
1. Click vào "Quản lý dữ liệu NC"
2. Kiểm tra:
   - ✅ URL: `/research/manage`
   - ✅ Title: "Quản lý dữ liệu nghiên cứu"
   - ✅ Có form thêm đề tài giảng viên
   - ✅ Có form thêm đề tài sinh viên
   - ✅ Có bảng dữ liệu với nút Edit/Delete
   - ✅ Có nút "Xem tổng quan nghiên cứu" (link về dashboard)

### Test Case 4: Breadcrumb
1. Vào `/research`
   - ✅ Breadcrumb: "Trang chủ > Tổng quan nghiên cứu"
2. Vào `/research/manage`
   - ✅ Breadcrumb: "Trang chủ > Tổng quan nghiên cứu > Quản lý"

## Lưu ý quan trọng

### Quyền truy cập
- **Tổng quan nghiên cứu** (`/research`): Mọi người có thể xem
- **Quản lý dữ liệu** (`/research/manage`): Chỉ admin/người có quyền `manage_research`

### Liên kết giữa 2 trang
- Dashboard có nút "Quản lý dữ liệu nghiên cứu" → chuyển sang trang manage
- Trang manage có nút "Xem tổng quan nghiên cứu" → quay về dashboard

### Icon meanings
- 📊 `fa-chart-line` = Thống kê, báo cáo, dashboard
- 🗄️ `fa-database` = Quản lý dữ liệu, CRUD
- 🔬 `fa-flask` = Nghiên cứu khoa học (cũ, đã thay đổi)

---
**Ngày sửa:** 20/10/2025
**Trạng thái:** ✅ Hoàn thành
**Tác động:** Cải thiện UX, phân biệt rõ 2 chức năng khác nhau
