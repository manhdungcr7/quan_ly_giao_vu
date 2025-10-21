# Hướng Dẫn Test Breadcrumb Week Update

## Thay Đổi Mới Nhất

### 1. Thêm Debug Logs
File `public/js/workbook-enhanced.js` đã được cập nhật với các console logs chi tiết để debug.

### 2. Thêm Fallback Selector  
Nếu selector chính `#breadcrumb-week [data-breadcrumb-label]` không tìm thấy, hệ thống sẽ tự động dùng selector dự phòng để tìm breadcrumb item cuối cùng.

## Cách Test

### Bước 1: Khởi động lại server (nếu cần)
```powershell
# Stop server nếu đang chạy
# Ctrl + C

# Start lại server
npm start
```

### Bước 2: Mở trang Sổ tay công tác
1. Đăng nhập vào hệ thống
2. Vào trang "Sổ tay công tác"

### Bước 3: Mở DevTools Console
1. Nhấn **F12** trên keyboard
2. Chuyển sang tab **Console**

### Bước 4: Quan sát Console Logs

Bạn sẽ thấy các log như sau:

```javascript
🔍 updateAcademicWeekLabels called: {
  hasLayout: true,
  hasCurrentWeekLabel: true,
  currentWeekStart: "2025-10-20",
  academicStartDate: Mon Aug 04 2025 00:00:00 GMT+0700,
  academicStartISO: "2025-08-04"
}

📊 Sidebar week number: 12
🍞 Breadcrumb element: <span data-breadcrumb-label>​Tuần 43​</span>​
📊 Breadcrumb week number: 12
✅ Breadcrumb updated to: Tuần 12
```

### Bước 5: Kiểm tra kết quả

#### ✅ THÀNH CÔNG nếu:
- Console hiển thị: `✅ Breadcrumb updated to: Tuần 12`
- Sidebar hiển thị: "Tuần học số 12"
- Breadcrumb hiển thị: "Trang chủ > Sổ tay công tác > **Tuần 12**"

#### ❌ THẤT BẠI nếu:
- Console hiển thị: `⚠️ Breadcrumb element not found`
- Breadcrumb vẫn hiển thị: "Trang chủ > Sổ tay công tác > **Tuần 43**"

## Troubleshooting

### Case 1: Breadcrumb element không tìm thấy

**Console log:**
```
🍞 Breadcrumb element: null
⚠️ Breadcrumb element not found or no weekStart
```

**Giải pháp:**
1. Mở tab **Elements** trong DevTools
2. Tìm breadcrumb HTML (Ctrl+F, search "breadcrumb-week")
3. Kiểm tra xem có `id="breadcrumb-week"` không
4. Copy HTML structure và báo lại

### Case 2: Academic start date chưa được set

**Console log:**
```
academicStartDate: null
academicStartISO: null
📊 Breadcrumb week number: null
```

**Giải pháp:**
1. Trong sidebar, scroll xuống phần **"Tuần học kỳ"**
2. Chọn ngày bắt đầu năm học (ví dụ: 04/08/2025)
3. Nhấn nút **"Áp dụng"**
4. Page sẽ tự động cập nhật

### Case 3: Fallback selector được sử dụng

**Console log:**
```
🔄 Using fallback breadcrumb selector
✅ Breadcrumb updated to: Tuần 12
```

**Ý nghĩa:** Selector chính không tìm thấy nhưng fallback đã hoạt động. Breadcrumb vẫn được cập nhật thành công.

## Các Trường Hợp Test

### Test 1: Xem tuần hiện tại
1. Mở trang Sổ tay công tác
2. Kiểm tra breadcrumb có hiển thị đúng tuần học kỳ không

### Test 2: Chuyển sang tuần khác
1. Trong sidebar, nhấn nút **"Tuần trước"** (◀)
2. Chờ page reload
3. Kiểm tra breadcrumb có cập nhật đúng tuần không

### Test 3: Chọn tuần từ danh sách
1. Nhấn nút **"Hiện danh sách tuần"**
2. Chọn một tuần bất kỳ (ví dụ: "Tuần 10 · 2025")
3. Chờ page reload  
4. Kiểm tra breadcrumb có hiển thị "Tuần 10" không

### Test 4: Chọn ngày cụ thể
1. Trong phần "Chọn tuần khác", chọn một ngày bất kỳ
2. Nhấn "Áp dụng"
3. Chờ page reload
4. Kiểm tra breadcrumb có cập nhật đúng không

## Kết Quả Mong Đợi

| Phần | Hiển thị mong đợi |
|------|-------------------|
| **Sidebar "Tuần hiện tại"** | "Tuần học số 12" |
| **Breadcrumb** | "Trang chủ > Sổ tay công tác > Tuần 12" |
| **Week chips** | "Tuần 12 · 2025" |
| **Title trang** | "Kế hoạch công tác tuần" |

## Báo Lỗi

Nếu vẫn không hoạt động, hãy báo lại với thông tin sau:

1. **Console logs đầy đủ** (copy/paste toàn bộ)
2. **Screenshot** của breadcrumb và sidebar
3. **HTML structure** của element `#breadcrumb-week` (từ tab Elements)
4. **Academic start date** đang được set (nếu có)

## Files Đã Thay Đổi

1. ✅ `views/partials/breadcrumb.ejs` - Thêm `id` và `data-breadcrumb-label`
2. ✅ `views/workbook/index.ejs` - Thêm `id: 'breadcrumb-week'` vào breadcrumb
3. ✅ `public/js/workbook-enhanced.js` - Cập nhật `updateAcademicWeekLabels()` với debug logs và fallback selector

---
**Test ngay bây giờ và báo lại kết quả!** 🚀
