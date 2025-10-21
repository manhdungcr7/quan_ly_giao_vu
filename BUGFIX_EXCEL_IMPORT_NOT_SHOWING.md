# 🐛 BUGFIX: Dữ liệu từ Excel Import không hiển thị

## 📋 Vấn đề
Khi sử dụng tính năng "Tải mẫu Excel", điền đầy đủ thông tin, sau đó "Nhập Excel" → dữ liệu được lưu vào database nhưng không hiển thị trên giao diện.

## 🔧 Các thay đổi đã thực hiện

### 1. Cập nhật Header Mapping
**File**: `app/controllers/ExaminationController.js`

Thêm mapping cho "Học phần" vì template Excel sử dụng header này:

```javascript
const IMPORT_HEADER_MAP = {
  // ... existing mappings ...
  'môn học': 'subject_name',
  'mon hoc': 'subject_name',
  'học phần': 'subject_name',  // ✅ MỚI THÊM
  'hoc phan': 'subject_name',  // ✅ MỚI THÊM
  'subject name': 'subject_name',
  'subject_name': 'subject_name',
  // ...
};
```

### 2. Tăng cường Cache Control
**File**: `app/controllers/ExaminationController.js` → `index()` method

```javascript
// Prevent caching the list page
res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
res.set('Pragma', 'no-cache');
res.set('Expires', '0');
```

### 3. Cải thiện Reload Logic
**File**: `public/js/examination-enhanced.js`

Thay đổi từ `window.location.reload()` thành:

```javascript
setTimeout(() => {
  window.location.href = `/examination?t=${Date.now()}`;
}, 500);
```

**Lý do**:
- Thêm delay 500ms để đảm bảo database commit xong
- Thêm timestamp `?t=` để tránh browser cache
- Sử dụng `href` thay vì `reload()` để force fresh load

### 4. Thêm Debug Logs
**File**: `app/controllers/ExaminationController.js` → `importExcel()` method

```javascript
console.log('📋 Excel header row:', headerRow);
console.log('📋 Column mapping:', columnMap);
console.log('📋 Recognized columns:', recognizedColumns);
console.log('📋 Processing row X, raw data:', rawData);
console.log('📋 Create payload for row X:', createData);
console.log('✅ Created examination session #ID from Excel row X');
console.log('📊 Import completed: X inserted, Y skipped, Z errors');
```

## 🧪 Cách kiểm tra

### Bước 1: Khởi động lại server
```powershell
cd "d:\PHAN MEM\quan_ly_giao_vu_new\quan_ly_giao_vu_mvc"
npm start
```

### Bước 2: Truy cập trang Công tác khảo thí
```
http://localhost:3000/examination
```

### Bước 3: Tải mẫu Excel
1. Click nút **"Tải mẫu Excel"**
2. File `mau-nhap-lich-thi.xlsx` sẽ được tải về

### Bước 4: Điền thông tin vào Excel

**Lưu ý**: File mẫu có 3 dòng:
- Dòng 1: **Header** (Mã ca thi, Tên ca thi, Kỳ thi, ...)
- Dòng 2: **Ví dụ** (CT-001, Ca thi Điều tra cơ bản, ...)
- Dòng 3: **Ghi chú hướng dẫn**

**XÓA dòng 2 và 3**, chỉ giữ lại dòng header, sau đó điền dữ liệu thật từ dòng 2 trở đi.

Ví dụ nội dung file sau khi sửa:

| Mã ca thi | Tên ca thi | Kỳ thi | Mã môn | Học phần | Tín chỉ | Lớp | Ngày thi | Giờ thi | Thời lượng | ... |
|-----------|------------|--------|---------|----------|---------|-----|----------|---------|------------|-----|
| CT-2025-01 | GV Nguyễn Văn A | HK1-2025 | AN101 | Điều tra cơ bản | 3 | 01B | 25/10/2025 | 13:30 | 90 | ... |
| CT-2025-02 | GV Trần Thị B | HK1-2025 | AN102 | Pháp luật hình sự | 4 | 02A | 26/10/2025 | 09:00 | 120 | ... |

### Bước 5: Nhập Excel
1. Click nút **"Nhập Excel"**
2. Chọn file vừa chỉnh sửa
3. Xác nhận import

### Bước 6: Quan sát logs trong Terminal

Server sẽ hiển thị:
```
📋 Excel header row: [ 'Mã ca thi', 'Tên ca thi', 'Kỳ thi', ... ]
📋 Column mapping: [ 'exam_code', 'exam_name', 'period_name', ... ]
📋 Recognized columns: [ 'exam_code', 'exam_name', 'period_name', ... ]
📋 Processing row 2, raw data: { exam_code: 'CT-2025-01', ... }
📋 Create payload for row 2: { period_id: 1, subject_id: 2, ... }
✅ Created examination session #123 from Excel row 2
📊 Import completed: 2 inserted, 0 skipped, 0 errors
```

### Bước 7: Kiểm tra giao diện

Sau khi import thành công:
- Trang sẽ tự động reload sau 0.5 giây
- Dữ liệu mới sẽ xuất hiện trong bảng danh sách
- Kiểm tra các cột: Làm đề, Ngày thi, Trạng thái, Mã môn, Lớp, Tín chỉ, ...

### Bước 8: Mở Browser DevTools (F12)

**Tab Console**: Xem logs từ JavaScript
```
💾 Import request sent
📥 Response: {success: true, stats: {...}}
```

**Tab Network**: 
- Tìm request `POST /api/examination/import`
- Status: `200 OK`
- Response: `{"success": true, "stats": {...}}`

## 🔍 Troubleshooting

### Vấn đề 1: "Không nhận diện được cột dữ liệu hợp lệ"

**Nguyên nhân**: Header trong Excel không khớp với mapping

**Giải pháp**:
- Đảm bảo dòng đầu tiên là header (Mã ca thi, Tên ca thi, ...)
- Không có dấu cách thừa
- Sử dụng đúng tên cột từ template

### Vấn đề 2: Import thành công nhưng không hiển thị

**Kiểm tra**:

1. **Database có dữ liệu không?**
   ```sql
   SELECT * FROM examination_sessions 
   ORDER BY created_at DESC 
   LIMIT 10;
   ```

2. **Có lỗi trong console không?**
   - Mở F12 → Console tab
   - Tìm lỗi màu đỏ

3. **Clear browser cache**
   - Ctrl + Shift + R (hard refresh)
   - Hoặc Ctrl + F5

4. **Kiểm tra logs server**
   ```
   📋 Sessions retrieved: X
   ```
   Nếu X = 0 → có vấn đề với query
   Nếu X > 0 → có vấn đề với view rendering

### Vấn đề 3: Lỗi "Thiếu thông tin kỳ thi"

**Nguyên nhân**: Cột "Kỳ thi" bị bỏ trống

**Giải pháp**: Điền tên kỳ thi (ví dụ: "HK1-2025-2026")

### Vấn đề 4: Lỗi "Thiếu thông tin học phần"

**Nguyên nhân**: Cột "Học phần" bị bỏ trống

**Giải pháp**: Điền tên học phần (ví dụ: "Điều tra cơ bản")

### Vấn đề 5: Lỗi "Thiếu tên ca thi"

**Nguyên nhân**: Cột "Tên ca thi" bị bỏ trống

**Giải pháp**: Điền tên ca thi (ví dụ: "GV Nguyễn Văn A")

### Vấn đề 6: Lỗi "Thiếu ngày thi hợp lệ"

**Nguyên nhân**: Cột "Ngày thi" không đúng định dạng

**Giải pháp**: Sử dụng định dạng:
- `dd/mm/yyyy` (ví dụ: 25/10/2025)
- `yyyy-mm-dd` (ví dụ: 2025-10-25)

## 📝 Checklist kiểm tra sau khi sửa

- [x] Header mapping có "học phần" và "hoc phan"
- [x] Cache control được thiết lập đúng
- [x] Reload có delay và cache buster
- [x] Debug logs được thêm vào
- [ ] Test import với dữ liệu mẫu
- [ ] Dữ liệu hiển thị ngay sau import
- [ ] Không có lỗi trong console
- [ ] Database có records mới

## ✅ Kết quả mong đợi

Sau khi thực hiện các fix trên:

1. ✅ Tải mẫu Excel thành công
2. ✅ Điền dữ liệu vào Excel
3. ✅ Import Excel thành công (thông báo "Nhập dữ liệu thành công")
4. ✅ Trang tự động reload sau 0.5 giây
5. ✅ Dữ liệu mới hiển thị ngay trên bảng danh sách
6. ✅ Tất cả thông tin hiển thị đầy đủ (Làm đề, Ngày thi, Mã môn, Lớp, Tín chỉ, CBCT1, CBCT2, ...)

## 🚀 Demo Video Steps

1. Vào trang /examination
2. Click "Tải mẫu Excel" → file tải về
3. Mở Excel, xóa dòng ví dụ và ghi chú
4. Điền 2-3 dòng dữ liệu thật
5. Save file
6. Click "Nhập Excel" → chọn file
7. Xác nhận import
8. Thấy thông báo "Nhập dữ liệu thành công"
9. Trang reload tự động
10. Dữ liệu mới xuất hiện trong bảng ✅

## 📞 Hỗ trợ

Nếu vẫn gặp vấn đề, cung cấp:
1. Screenshot console browser (F12)
2. Copy logs từ terminal server
3. File Excel đã sử dụng
4. Screenshot bảng danh sách sau khi import
