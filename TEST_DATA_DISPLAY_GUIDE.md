# 🧪 HƯỚNG DẪN TEST: Kiểm tra dữ liệu không hiển thị

## 🎯 Mục tiêu
Kiểm tra xem tại sao dữ liệu không hiển thị sau khi nhấn "Lưu thay đổi"

## ⚙️ Chuẩn bị

### 1. Server đang chạy
✅ Server hiện đang chạy trên: **http://localhost:3003**

### 2. Các thay đổi đã áp dụng

#### Frontend (`public/js/examination-enhanced.js`):
- ✅ Thêm logs chi tiết khi lưu
- ✅ Tăng thời gian reload từ 1s → 1.5s
- ✅ Log URL và trạng thái

#### Backend (`app/models/ExaminationSession.js`):
- ✅ Thêm `file_count` subquery vào findAll()

#### View (`views/examination/list.ejs`):
- ✅ Thêm debug logs để xem data nhận được

## 📋 Các bước test

### Bước 1: Mở trang danh sách

1. Mở trình duyệt
2. Mở **Developer Tools** (nhấn F12)
3. Chọn tab **Console**
4. Truy cập: **http://localhost:3003/examination**

### Bước 2: Kiểm tra logs ban đầu

Trong Console, bạn sẽ thấy:

```javascript
🎨 View Debug Info:
📊 Sessions received: [...]  // Danh sách hiện tại
📈 Total sessions: X          // Số lượng
🔍 Filters: {...}            // Bộ lọc
```

**❓ Câu hỏi**: Có bao nhiêu sessions hiện tại? _______

### Bước 3: Tạo/Sửa ca thi

1. Nhấn nút **"Tạo ca thi mới"** hoặc **"Sửa"** một ca thi
2. Điền đầy đủ thông tin:
   - ✅ Mã ca thi (bắt buộc)
   - ✅ Tên ca thi (bắt buộc)
   - ✅ Kỳ thi (bắt buộc)
   - ✅ Môn học (bắt buộc)
   - ✅ Ngày thi (bắt buộc)
   - ✅ Giờ thi (bắt buộc)

### Bước 4: Nhấn "Lưu thay đổi"

Quan sát Console, bạn sẽ thấy:

```javascript
💾 Saving examination session: {...}    // Dữ liệu gửi đi
📤 Request: PUT http://localhost:3003/api/examination/XX  // URL request
📥 Response: {success: true/false, ...} // Kết quả

// Nếu thành công:
✅ Save successful, reloading in 1.5 seconds...
📍 Current URL: http://localhost:3003/examination
🔄 Reloading page now...
```

### Bước 5: Kiểm tra sau khi reload

Sau khi trang reload, Console sẽ hiển thị lại:

```javascript
🎨 View Debug Info:
📊 Sessions received: [...]
📈 Total sessions: Y          // ← Số này PHẢI tăng lên (nếu tạo mới)
```

**❓ Câu hỏi**: Số sessions có tăng không? Có / Không

### Bước 6: Kiểm tra giao diện

Xem bảng danh sách:
- [ ] Ca thi mới có xuất hiện không?
- [ ] Thông tin hiển thị đúng không?
- [ ] File count hiển thị đúng không?

## 🔍 Phân tích kết quả

### Trường hợp 1: Console báo lỗi khi lưu

**Ví dụ lỗi**:
```javascript
📥 Response: {
  success: false,
  message: "Lỗi khi tạo ca thi",
  error: "..."
}
```

**Nguyên nhân**:
- Thiếu trường bắt buộc
- Foreign key không hợp lệ
- Lỗi database

**Giải pháp**:
1. Đọc message lỗi
2. Kiểm tra dữ liệu gửi đi (`💾 Saving examination session`)
3. Sửa theo yêu cầu

### Trường hợp 2: Lưu thành công nhưng không reload

**Triệu chứng**:
```javascript
✅ Save successful, reloading in 1.5 seconds...
// Nhưng không có "🔄 Reloading page now..."
```

**Nguyên nhân**: JavaScript bị lỗi hoặc trang bị redirect

**Giải pháp**: Reload thủ công (F5)

### Trường hợp 3: Reload nhưng không có data mới

**Triệu chứng**:
```javascript
📈 Total sessions: X  // Số không đổi
```

**Nguyên nhân**: 
- Data không được lưu vào DB
- Query findAll() lỗi
- Cache browser

**Giải pháp**:
1. Xem server logs (terminal)
2. Check database trực tiếp
3. Clear cache (Ctrl+Shift+Delete)

### Trường hợp 4: Có data nhưng không hiển thị

**Triệu chứng**:
```javascript
📈 Total sessions: Y  // Số tăng
// Nhưng bảng vẫn trống hoặc không có record mới
```

**Nguyên nhân**: Lỗi render trong view

**Giải pháp**: Kiểm tra lỗi trong tab Console

## 🐛 Debug sâu hơn

### Check 1: Xem Server Logs

Trong terminal đang chạy server, tìm các logs:

```
🚨🚨🚨 EXAMINATION INDEX CALLED 🚨🚨🚨
📋 Examination index - Start
📋 Filters: {...}
📋 Sessions retrieved: X
📋 Sessions array: [...]
📋 Render completed successfully
```

### Check 2: Xem Network Tab

1. F12 → Tab **Network**
2. Nhấn "Lưu thay đổi"
3. Tìm request `/api/examination` hoặc `/api/examination/XX`
4. Click vào → Tab **Response**
5. Xem kết quả JSON

### Check 3: Kiểm tra Database

Mở MySQL Workbench hoặc command line:

```sql
-- Xem tất cả ca thi
SELECT id, exam_code, exam_name, created_at 
FROM examination_sessions 
ORDER BY created_at DESC 
LIMIT 10;

-- Đếm tổng số
SELECT COUNT(*) as total FROM examination_sessions;
```

## 📊 Báo cáo kết quả

Sau khi test, hãy ghi lại:

### Thông tin cơ bản
- **Thời gian test**: _________________
- **Browser**: Chrome / Firefox / Edge
- **URL**: http://localhost:3003/examination

### Console Logs

**Trước khi lưu**:
```
📈 Total sessions: ____
```

**Sau khi nhấn "Lưu"**:
```javascript
// Copy logs từ Console vào đây
```

**Sau khi reload**:
```
📈 Total sessions: ____
```

### Giao diện
- [ ] Ca thi mới có hiển thị
- [ ] Thông tin đầy đủ
- [ ] Không có lỗi

### Nếu có vấn đề

**Screenshot**:
1. Console với logs
2. Giao diện danh sách
3. Server terminal

**Mô tả**:
- Thao tác đã làm: _________________
- Kết quả mong đợi: _________________
- Kết quả thực tế: _________________

---

## 🎯 Kết luận

Sau khi test theo hướng dẫn này, bạn sẽ biết chính xác:
1. ✅ Dữ liệu có được lưu vào DB không?
2. ✅ API có trả về success không?
3. ✅ Reload có hoạt động không?
4. ✅ Data có được load lại không?
5. ✅ View có render đúng không?

Nếu vẫn có vấn đề, gửi cho tôi báo cáo chi tiết!

---

**Created**: 2025-10-05  
**Server**: http://localhost:3003  
**Status**: READY TO TEST
