# Sửa lỗi layout không cân đối - Trang Quản lý Tài sản

## Ngày: 06/10/2024

## Vấn đề
Trang "Quản lý tài sản" bị dồn về bên trái, để lại khoảng trống lớn ở trung tâm và bên phải. Giao diện không sử dụng hết không gian có sẵn.

## Nguyên nhân
1. **Container bị giới hạn `max-width`**: `.asset-page` có `max-width: 1340px` và `margin: 0 auto`, khiến nội dung bị căn giữa và thu hẹp lại
2. **Grid layout không tối ưu**: Sử dụng `minmax(0, 2fr)` thay vì chiều rộng cố định cho cột chính
3. **App content có ràng buộc**: `.app-content` không có width và max-width được định nghĩa rõ ràng

## Giải pháp đã áp dụng

### 1. CSS cho trang tài sản (`assets-management.css`)

```css
/* Đảm bảo full-width cho trang assets */
body.app-auth .app-content {
  width: 100%;
  max-width: none;
}

.asset-page {
  /* Loại bỏ max-width và margin: 0 auto */
  width: 100%;
  /* Giữ nguyên các thuộc tính khác */
}

.asset-main-layout {
  /* Thay đổi từ minmax(0, 2fr) minmax(320px, 1fr) */
  grid-template-columns: 1fr 380px;
  /* Cột chính chiếm không gian còn lại, sidebar cố định 380px */
}

.asset-grid {
  /* Thay đổi từ auto-fit sang auto-fill */
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  /* Tăng min-width từ 280px lên 320px để card rộng hơn */
}

.asset-hero-metrics {
  /* Tăng min-width từ 220px lên 240px */
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.asset-summary {
  /* Tăng min-width từ 220px lên 240px */
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.asset-insights {
  /* Tăng min-width từ 200px lên 220px */
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}
```

### 2. CSS cho layout chính (`layout.css`)

```css
.app-content {
    flex: 1;
    overflow-y: auto;
    padding: 36px 40px 48px;
    background: var(--layout-bg);
    width: 100%; /* Thêm */
    max-width: none; /* Thêm */
}
```

### 3. Cập nhật responsive breakpoints

```css
@media (max-width: 1360px) {
  .asset-main-layout {
    grid-template-columns: 1fr 340px;
    /* Giảm sidebar từ 380px xuống 340px */
  }
}

@media (max-width: 1180px) {
  /* Chuyển sang layout 1 cột */
  .asset-main-layout {
    grid-template-columns: 1fr;
  }
  
  .asset-hero-metrics {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
}
```

### 4. Tăng version CSS cache

```ejs
<% contentFor('css', '<link rel="stylesheet" href="/css/assets-management.css?v=20241006_v2">') %>
```

## Kết quả mong đợi
- ✅ Giao diện sử dụng toàn bộ không gian có sẵn (trừ padding)
- ✅ Sidebar phải có chiều rộng cố định hợp lý (380px)
- ✅ Cột chính mở rộng để chứa nhiều asset cards trên một hàng
- ✅ Các grid sections (hero metrics, summary, insights) tự động điều chỉnh số cột
- ✅ Responsive tốt trên các màn hình khác nhau

## Cách kiểm tra
1. Hard refresh trang (Ctrl+Shift+R hoặc Cmd+Shift+R)
2. Kiểm tra DevTools:
   - `.asset-page` không có `max-width: 1340px`
   - `.asset-main-layout` có `grid-template-columns: 1fr 380px`
   - Cards asset có kích thước rộng hơn và phân bổ đều
3. Resize cửa sổ trình duyệt để kiểm tra responsive

## Files đã thay đổi
- ✅ `public/css/assets-management.css`
- ✅ `public/css/layout.css`
- ✅ `views/assets/index.ejs` (tăng version CSS)

## Lưu ý
- Nếu vẫn thấy layout cũ, hãy clear browser cache hoặc hard refresh
- Kiểm tra không có CSS conflicting từ các file khác (app.css, style.css)
- Grid layout sẽ tự động điều chỉnh số cột dựa trên không gian có sẵn
