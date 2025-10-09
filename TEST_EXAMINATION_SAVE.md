# ✅ HƯỚNG DẪN TEST: Lưu và Hiển thị Ca Thi

## 🎯 Xác nhận đã sửa

### Console logs cho thấy:
```javascript
🎨 View Debug Info:
📊 Sessions received: (10) [{…}, {…}, ...]
📈 Total sessions: 10
🔍 Filters: {}
```

✅ **Dữ liệu đã load thành công!** 10 sessions hiển thị trong danh sách.

---

## 📋 Test Workflow Đầy Đủ

### Bước 1: Truy cập trang
```
http://localhost:3004/examination
```

### Bước 2: Tạo ca thi mới

1. **Nhấn nút "Thêm ca thi"** (góc trên bên phải)
2. **Điền form** (tất cả các trường bắt buộc):
   ```
   ✅ Mã ca thi: TEST-2024-001
   ✅ Tên ca thi: Thi cuối kỳ Test
   ✅ Kỳ thi: Chọn từ dropdown (hoặc nhập thủ công)
   ✅ Môn học: Chọn từ dropdown (hoặc nhập thủ công)
   ✅ Ngày thi: 25/12/2024
   ✅ Giờ thi: 08:00
   ⚪ Thời lượng: 90 (phút)
   ⚪ Số lượng SV: 35
   ```

3. **Nhấn "Lưu thay đổi"**

### Bước 3: Xem Console (F12)

Sau khi nhấn Lưu, bạn sẽ thấy:

```javascript
💾 Saving examination session: {
  exam_code: "TEST-2024-001",
  exam_name: "Thi cuối kỳ Test",
  period_id: 2,
  subject_id: 5,
  exam_date: "2024-12-25",
  exam_time: "08:00",
  duration: 90,
  student_count: 35,
  ...
}

📤 Request: POST http://localhost:3004/api/examination

📥 Response: {
  success: true,
  message: "Tạo ca thi thành công",
  session_id: 11
}

✅ Save successful, reloading in 1.5 seconds...
📍 Current URL: http://localhost:3004/examination
🔄 Reloading page now...
```

### Bước 4: Sau khi reload

**Kiểm tra bảng danh sách:**
- ✅ Bản ghi mới xuất hiện ở đầu/cuối bảng
- ✅ Thông tin hiển thị đúng: Tên, Mã môn, SL SV, Ngày thi
- ✅ Nếu có upload file → Badge hiển thị số file

---

## 🔍 Nếu không thấy bản ghi mới

### Kiểm tra 1: Bộ lọc
- Có thể **filter đang ẩn** bản ghi vừa tạo
- Thử **"Xóa lọc"** hoặc chọn "Tất cả" ở dropdown Kỳ thi/Trạng thái

### Kiểm tra 2: Response có success=true?
```javascript
📥 Response: {success: false, message: "Lỗi...", error: "..."}
```

Nếu `success: false`:
- Đọc `message` và `error` trong Response
- Có thể thiếu trường bắt buộc hoặc foreign key không hợp lệ

### Kiểm tra 3: Database
```sql
-- Mở MySQL Workbench/Command line
SELECT * FROM examination_sessions 
ORDER BY created_at DESC 
LIMIT 5;

-- Xem có record mới không?
-- Kiểm tra exam_code = "TEST-2024-001"
```

---

## 🧪 Test Sửa ca thi

1. **Nhấn nút "Sửa"** (biểu tượng bút chì) trên 1 dòng
2. **Modal mở ra** với dữ liệu cũ đã điền sẵn
3. **Thay đổi** vài trường (ví dụ: tăng số SV từ 35 → 40)
4. **Nhấn "Lưu thay đổi"**
5. **Xem Console:**
   ```javascript
   📤 Request: PUT http://localhost:3004/api/examination/11
   📥 Response: {success: true, message: "Cập nhật ca thi thành công"}
   ```
6. **Sau reload** → Số SV hiển thị 40

---

## 🎯 Các fixes đã áp dụng

### Frontend (`public/js/examination-enhanced.js`)
- ✅ Chuyển `''` → `null` cho exam_date, grading_deadline
- ✅ Tăng delay reload: 1s → 1.5s
- ✅ Thêm logs chi tiết (Saving, Request, Response, Reloading)

### Backend (`app/controllers/ExaminationController.js`)
- ✅ **store()**: Sanitize dates, ép kiểu số, whitelist fields hợp lệ
- ✅ **update()**: Tương tự + xóa các field helper (_name)

### Model (`app/models/ExaminationSession.js`)
- ✅ **findAll()**: Thêm subquery `file_count`
- ✅ **update()**: Bỏ qua undefined, tránh SQL lỗi

### View (`views/examination/list.ejs`)
- ✅ Gỡ bỏ debug logs (đã xác nhận data load OK)
- ✅ Render từ `sessions` variable

---

## 📊 Kết quả mong đợi

| Thao tác | Kết quả |
|----------|---------|
| Tạo ca thi mới | ✅ Bản ghi xuất hiện trong bảng |
| Sửa ca thi | ✅ Thông tin cập nhật đúng |
| Upload file | ✅ Badge hiển thị số file |
| Reload trang | ✅ Data persist từ DB |

---

## 🚀 Server hiện tại

```
Cổng: 3004
URL: http://localhost:3004/examination
Status: ✅ Running
```

---

## 📝 Nếu vẫn có vấn đề

Gửi cho tôi:
1. **Screenshot Console** (toàn bộ logs từ khi nhấn Lưu)
2. **Screenshot Response JSON** (từ tab Network → API request)
3. **Screenshot bảng danh sách** (sau khi reload)
4. **Copy server logs** (từ terminal đang chạy npm start)

Tôi sẽ debug tiếp cho đến khi hoàn toàn OK! 💪

---

**Updated**: 2025-10-05  
**Status**: ✅ DATA LOADING OK (10 sessions)  
**Next**: Verify CREATE/UPDATE workflow
