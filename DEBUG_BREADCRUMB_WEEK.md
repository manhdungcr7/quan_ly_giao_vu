# Debug Breadcrumb Week Display

## Vấn đề
Breadcrumb vẫn chưa khớp với số tuần hiển thị trong sidebar khi người dùng chọn tuần.

## Debug Steps

### 1. Mở DevTools Console
1. Mở trang Sổ tay công tác
2. Nhấn F12 để mở Developer Tools
3. Chuyển sang tab Console

### 2. Kiểm tra Console Logs
Tìm các log sau:

```
🔍 updateAcademicWeekLabels called: {
  hasLayout: true/false,
  hasCurrentWeekLabel: true/false,
  currentWeekStart: "2025-10-20",
  academicStartDate: Date object hoặc null,
  academicStartISO: "2025-08-04" hoặc null
}

📊 Sidebar week number: 12 hoặc null
📊 Breadcrumb week number: 12 hoặc null
🍞 Breadcrumb element: <span> hoặc null
✅ Breadcrumb updated to: Tuần 12
```

### 3. Các trường hợp có thể xảy ra

#### Case 1: Breadcrumb element không tìm thấy
```
🍞 Breadcrumb element: null
⚠️ Breadcrumb element not found or no weekStart
```

**Nguyên nhân:** Breadcrumb chưa được render hoặc ID không đúng
**Giải pháp:** Kiểm tra HTML có `id="breadcrumb-week"` không

#### Case 2: Academic start date chưa được set
```
academicStartDate: null
academicStartISO: null
📊 Breadcrumb week number: null
⚠️ No week number computed for breadcrumb
```

**Nguyên nhân:** Chưa thiết lập tuần đầu năm học
**Giải pháp:** 
1. Trong sidebar, tìm phần "Tuần học kỳ"
2. Chọn ngày đầu năm học (ví dụ: 04/08/2025)
3. Nhấn "Áp dụng"

#### Case 3: Week number tính ra nhưng không update
```
📊 Breadcrumb week number: 12
⚠️ Breadcrumb element not found
```

**Nguyên nhân:** Selector không tìm thấy element
**Giải pháp:** Kiểm tra lại cấu trúc HTML của breadcrumb

### 4. Kiểm tra HTML Structure

Mở tab Elements trong DevTools và tìm breadcrumb:

```html
<!-- Cấu trúc ĐÚNG -->
<div class="crumb is-current" id="breadcrumb-week">
  <i class="fas fa-calendar-week"></i>
  <span data-breadcrumb-label>Tuần 43</span>
</div>

<!-- Cấu trúc SAI (thiếu id) -->
<div class="crumb is-current">
  <i class="fas fa-calendar-week"></i>
  <span data-breadcrumb-label>Tuần 43</span>
</div>
```

### 5. Test Manual Update

Trong Console, chạy lệnh sau để test:

```javascript
// Kiểm tra element
const el = document.querySelector('#breadcrumb-week [data-breadcrumb-label]');
console.log('Element:', el);

// Kiểm tra workbook layout
const layout = document.querySelector('.workbook-layout');
console.log('Week Start:', layout?.dataset.weekStart);
console.log('Academic Start:', layout?.dataset.academicStart);

// Test update thủ công
if (el) {
  el.textContent = 'Tuần 12';
  console.log('Manual update successful!');
}
```

### 6. Kiểm tra localStorage

```javascript
// Kiểm tra academic start date trong localStorage
const userId = document.querySelector('.workbook-layout')?.dataset.userId;
const key = `workbook-academic-start:${userId}`;
const stored = localStorage.getItem(key);
console.log('Stored academic start:', stored);
```

## Các File Liên Quan

1. **views/workbook/index.ejs** - Khởi tạo breadcrumb với `id: 'breadcrumb-week'`
2. **views/partials/breadcrumb.ejs** - Render breadcrumb với ID và data attribute
3. **public/js/workbook-enhanced.js** - Function `updateAcademicWeekLabels()` cập nhật breadcrumb

## Expected Behavior

### Khi có academic_start_week:
- Sidebar: "Tuần học số 12"
- Breadcrumb: "Tuần 12"
- Week chips: "Tuần 12 · 2025"

### Khi CHƯA có academic_start_week:
- Sidebar: "Tuần 43" (ISO week)
- Breadcrumb: "Tuần 43" (ISO week)
- Week chips: "Tuần 43 · 2025" (ISO week)

## Next Steps

Sau khi chạy debug:
1. Copy toàn bộ console logs
2. Kiểm tra HTML structure của breadcrumb
3. Kiểm tra xem có academic_start_week được set chưa
4. Báo cáo kết quả để điều chỉnh tiếp

---
**Note:** Debug logs sẽ được tự động remove sau khi fix xong
