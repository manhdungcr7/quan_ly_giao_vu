# Cập nhật Breadcrumb Hiển thị Tuần Học Kỳ

## Vấn đề
Người dùng đang xem **Tuần 12** (tuần học kỳ) nhưng breadcrumb hiển thị **Tuần 43** (tuần ISO trong năm). Điều này gây nhầm lẫn vì:
- Sidebar hiển thị: "TUẦN 12 - 2025" (tuần học kỳ)
- Breadcrumb hiển thị: "Trang chủ > Sổ tay công tác > Tuần 43" (tuần ISO)

## Giải pháp

### 1. Cập nhật Breadcrumb Template
**File:** `views/partials/breadcrumb.ejs`

Thêm khả năng đặt ID và data attribute cho breadcrumb items:
- Thêm thuộc tính `id` cho breadcrumb item
- Thêm `data-breadcrumb-label` để JavaScript có thể cập nhật động

```ejs
<div class="crumb <%= isCurrent ? 'is-current' : '' %>" 
     style="display:flex;align-items:center;gap:8px;" 
     <%= itemId ? `id="${itemId}"` : '' %>>
  <i class="fas <%= icon %>"></i>
  <% if (isCurrent) { %>
    <span data-breadcrumb-label><%= item.label %></span>
  <% } else { %>
    <a href="<%= item.url || '#' %>">
      <span data-breadcrumb-label><%= item.label %></span>
    </a>
    <span class="crumb-sep"><i class="fas fa-chevron-right"></i></span>
  <% } %>
</div>
```

### 2. Cập nhật Breadcrumb trong Workbook Index
**File:** `views/workbook/index.ejs`

Thêm ID `breadcrumb-week` cho breadcrumb item tuần:

```javascript
breadcrumb = [
  { label: 'Trang chủ', url: '/', icon: 'fa-home' },
  { label: 'Sổ tay công tác', url: '/workbook', icon: 'fa-book-open' },
  { label: initialWeekLabel, icon: 'fa-calendar-week', id: 'breadcrumb-week' }
];
```

### 3. Cập nhật JavaScript
**File:** `public/js/workbook-enhanced.js`

Sửa function `updateAcademicWeekLabels()` để cập nhật cả breadcrumb:

```javascript
function updateAcademicWeekLabels() {
  const layout = document.querySelector('.workbook-layout');
  const currentWeekLabel = document.querySelector('[data-current-week-academic]');
  const currentWeekStart = layout ? layout.dataset.weekStart : null;

  // Cập nhật sidebar
  if (currentWeekLabel && currentWeekStart) {
    const defaultLabel = currentWeekLabel.dataset.defaultLabel || currentWeekLabel.textContent;
    const weekNumber = computeAcademicWeekNumber(currentWeekStart);
    if (weekNumber) {
      currentWeekLabel.textContent = `Tuần học số ${weekNumber}`;
    } else {
      currentWeekLabel.textContent = defaultLabel;
    }
  }

  // 🆕 Cập nhật breadcrumb
  const breadcrumbWeekEl = document.querySelector('#breadcrumb-week [data-breadcrumb-label]');
  if (breadcrumbWeekEl && currentWeekStart) {
    const weekNumber = computeAcademicWeekNumber(currentWeekStart);
    if (weekNumber) {
      breadcrumbWeekEl.textContent = `Tuần ${weekNumber}`;
    }
  }

  // Cập nhật week chips
  document.querySelectorAll('[data-week-chip]').forEach((chip) => {
    // ... existing code
  });
}
```

## Cách hoạt động

### 1. Khởi tạo (Server-side)
Khi trang load, breadcrumb được khởi tạo với số tuần ISO (mặc định):
```
Trang chủ > Sổ tay công tác > Tuần 43
```

### 2. Cập nhật động (Client-side)
Sau khi JavaScript load và phát hiện có `academic_start_week` (tuần đầu năm học):
- Function `computeAcademicWeekNumber()` tính số tuần học kỳ dựa trên:
  - `academic_start_week`: Tuần đầu năm học (được lưu trong workbook)
  - `weekStart`: Tuần hiện tại đang xem
  - Công thức: `weeks = (weekStart - academic_start_week) / 7 + 1`

- Function `updateAcademicWeekLabels()` được gọi và cập nhật:
  - Sidebar: "Tuần học số 12"
  - Breadcrumb: "Tuần 12"
  - Week chips: "Tuần 12 · 2025"

### 3. Khi chuyển tuần
Khi người dùng chọn tuần khác (prev/next hoặc chọn từ danh sách):
- Trang reload với workbook mới
- Breadcrumb được khởi tạo lại với tuần ISO
- JavaScript cập nhật lại thành tuần học kỳ

## Kết quả

### Trước khi sửa
```
Trang chủ > Sổ tay công tác > Tuần 43
```

### Sau khi sửa
```
Trang chủ > Sổ tay công tác > Tuần 12
```

Breadcrumb giờ đây đồng bộ với sidebar và hiển thị đúng tuần học kỳ mà người dùng đang xem.

## Lưu ý
- Nếu chưa có `academic_start_week`, breadcrumb sẽ hiển thị số tuần ISO mặc định
- Người dùng có thể thiết lập tuần đầu năm học trong phần "Tuần học kỳ" của sidebar
- Số tuần học kỳ được tính từ 1 (không có tuần 0)

## Files đã thay đổi
1. ✅ `views/partials/breadcrumb.ejs` - Thêm support cho ID và data attribute
2. ✅ `views/workbook/index.ejs` - Thêm ID cho breadcrumb tuần
3. ✅ `public/js/workbook-enhanced.js` - Cập nhật function `updateAcademicWeekLabels()`

## Test
1. Vào trang Sổ tay công tác
2. Kiểm tra breadcrumb có hiển thị số tuần ISO (ví dụ: Tuần 43)
3. Nếu đã có tuần đầu năm học, breadcrumb sẽ tự động cập nhật thành tuần học kỳ (ví dụ: Tuần 12)
4. Chuyển sang tuần khác, kiểm tra breadcrumb có cập nhật đúng không
5. Nếu chưa có tuần đầu năm học, thiết lập trong phần "Tuần học kỳ" và kiểm tra breadcrumb

---
**Ngày cập nhật:** 20/10/2025
**Trạng thái:** ✅ Hoàn thành
