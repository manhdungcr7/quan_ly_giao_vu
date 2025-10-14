# Hệ thống Breadcrumb Navigation

## Tổng quan
Hệ thống breadcrumb đã được triển khai để cải thiện trải nghiệm điều hướng người dùng trên toàn bộ website.

## Cấu trúc Files

### 1. CSS Styling
**File:** `public/css/breadcrumb.css`
- Định nghĩa style hiện đại cho breadcrumb
- Responsive design
- Animation effects
- Hover states
- Icon styling cho từng module

### 2. EJS Partial
**File:** `views/partials/breadcrumb.ejs`
- Component tái sử dụng
- Render breadcrumb từ data
- Xử lý logic hiển thị

### 3. Layout Integration
**File:** `views/layouts/main.ejs`
- Đã thêm link CSS: `/css/breadcrumb.css`
- Breadcrumb được include trong `<main class="app-content">`
- Hiển thị trước phần alerts

## Cách sử dụng

### Cú pháp cơ bản

Trong bất kỳ view file nào sử dụng layout `main.ejs`, thêm đoạn code sau **TRƯỚC** `<%- contentFor('content') %>`:

```ejs
<% 
// Define breadcrumb for this page
breadcrumb = [
  { label: 'Trang chủ', url: '/', icon: 'fa-home' },
  { label: 'Tên Module', url: '/module-path', icon: 'fa-icon-name' },
  { label: 'Trang hiện tại', url: '/current-path', icon: 'fa-icon-name' }
];
%>
```

### Ví dụ đã triển khai

#### 1. Danh sách văn bản pháp lý
**File:** `views/legal-documents/list.ejs`
```ejs
<% 
breadcrumb = [
  { label: 'Trang chủ', url: '/', icon: 'fa-home' },
  { label: 'Văn bản pháp lý', url: '/legal-documents', icon: 'fa-balance-scale' }
];
%>
```

#### 2. Thêm văn bản mới
**File:** `views/legal-documents/create.ejs`
```ejs
<% 
breadcrumb = [
  { label: 'Trang chủ', url: '/', icon: 'fa-home' },
  { label: 'Văn bản pháp lý', url: '/legal-documents', icon: 'fa-balance-scale' },
  { label: 'Thêm văn bản mới', url: '/legal-documents/create', icon: 'fa-plus-circle' }
];
%>
```

#### 3. Chỉnh sửa văn bản
**File:** `views/legal-documents/edit.ejs`
```ejs
<% 
breadcrumb = [
  { label: 'Trang chủ', url: '/', icon: 'fa-home' },
  { label: 'Văn bản pháp lý', url: '/legal-documents', icon: 'fa-balance-scale' },
  { label: 'Chỉnh sửa văn bản', url: `/legal-documents/${document.id}/edit`, icon: 'fa-edit' }
];
%>
```

#### 4. Quản lý cán bộ
**File:** `views/staff/index.ejs`
```ejs
<% 
breadcrumb = [
  { label: 'Trang chủ', url: '/', icon: 'fa-home' },
  { label: 'Quản lý cán bộ', url: '/staff', icon: 'fa-users' }
];
%>
```

## Icon Suggestions

### Modules chính
- 🏠 Trang chủ: `fa-home`
- ⚖️ Văn bản pháp lý: `fa-balance-scale`
- 👥 Quản lý cán bộ: `fa-users`
- 📅 Lịch công tác: `fa-calendar`
- 🧪 Nghiên cứu: `fa-flask`
- 📦 Tài sản: `fa-box`
- 🎓 Đào tạo: `fa-graduation-cap`
- 📝 Công tác khảo thí: `fa-file-alt`
- 📊 Sổ tay công tác: `fa-book`

### Actions
- ➕ Thêm mới: `fa-plus-circle`
- ✏️ Chỉnh sửa: `fa-edit`
- 👁️ Xem chi tiết: `fa-eye`
- 📋 Danh sách: `fa-list`
- 🔍 Tìm kiếm: `fa-search`
- ⚙️ Cài đặt: `fa-cog`

## Cấu trúc Data

### Breadcrumb Item Object
```javascript
{
  label: 'Tên hiển thị',     // String (required)
  url: '/path/to/page',      // String (required)
  icon: 'fa-icon-name'       // String (optional, default: 'fa-circle')
}
```

### Lưu ý
- Item cuối cùng sẽ được hiển thị là active (không có link)
- Item đầu tiên (Trang chủ) có styling đặc biệt với background gradient
- Mỗi item phải có `label` và `url`
- Icon là optional nhưng nên có để UI đẹp hơn

## Triển khai cho trang mới

### Bước 1: Kiểm tra layout
Đảm bảo view sử dụng `views/layouts/main.ejs` hoặc layout có include breadcrumb partial.

### Bước 2: Thêm breadcrumb data
Trong view file, thêm definition trước contentFor:

```ejs
<% 
breadcrumb = [
  { label: 'Trang chủ', url: '/', icon: 'fa-home' },
  { label: 'Module của bạn', url: '/your-module', icon: 'fa-your-icon' }
];
%>
```

### Bước 3: Test
- Reload trang
- Breadcrumb sẽ tự động hiển thị
- Click vào các link để test navigation
- Check responsive trên mobile

## Customization

### Thay đổi màu sắc
Edit file `public/css/breadcrumb.css`:

```css
/* Icon màu cho module cụ thể */
.breadcrumb-item .fa-your-icon {
  color: #your-color;
}
```

### Thêm animation mới
```css
.breadcrumb-container {
  animation: yourAnimation 0.3s ease-out;
}

@keyframes yourAnimation {
  /* Your animation keyframes */
}
```

## Troubleshooting

### Breadcrumb không hiển thị
1. Check console cho errors
2. Đảm bảo breadcrumb.css được load
3. Verify layout include breadcrumb partial
4. Check biến `breadcrumb` được define đúng

### Styling không đúng
1. Hard refresh (Ctrl+F5) để clear cache
2. Check cascading order của CSS files
3. Inspect element để xem styles có apply không

### Icon không hiển thị
1. Đảm bảo Font Awesome đã được load
2. Check icon class name đúng format: `fa-icon-name`
3. Verify Font Awesome version compatibility

## Best Practices

1. **Luôn bắt đầu với Trang chủ**
   ```ejs
   { label: 'Trang chủ', url: '/', icon: 'fa-home' }
   ```

2. **Giữ breadcrumb ngắn gọn**
   - Tối đa 4-5 levels
   - Label ngắn, rõ ràng

3. **Sử dụng icon phù hợp**
   - Chọn icon đại diện cho module
   - Nhất quán trong toàn hệ thống

4. **URL chính xác**
   - Sử dụng absolute path từ root
   - Include dynamic IDs khi cần (như trong edit pages)

## Trang đã triển khai

✅ Văn bản pháp lý - Danh sách
✅ Văn bản pháp lý - Thêm mới
✅ Văn bản pháp lý - Chỉnh sửa
✅ Văn bản pháp lý - Chi tiết
✅ Quản lý cán bộ - Danh sách

## Trang cần triển khai

⏳ Examination (list.ejs có layout riêng)
⏳ Dashboard/main (có layout riêng)
⏳ Assets (có layout riêng)
⏳ Schedule
⏳ Research
⏳ Workbook
⏳ Grading

## Support

Nếu cần hỗ trợ hoặc có câu hỏi, vui lòng tham khảo:
- File CSS: `public/css/breadcrumb.css`
- Partial: `views/partials/breadcrumb.ejs`
- Layout: `views/layouts/main.ejs`

---
*Cập nhật lần cuối: 09/10/2025*
