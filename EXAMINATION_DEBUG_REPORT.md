# HƯỚNG DẪN KIỂM TRA TRANG CÔNG TÁC KHẢO THÍ

## ✅ CÁC VẤN ĐỀ ĐÃ SỬA

### Vấn đề 1: Syntax Error (SOLVED ✅)
- **Lỗi**: Duplicate catch block code
- **Nguyên nhân**: String replacement không chính xác
- **Đã sửa**: Loại bỏ code duplicate

### Vấn đề 2: Controller Export (SOLVED ✅)  
- **Lỗi**: `TypeError: ExaminationController is not a constructor`
- **Nguyên nhân**: Export singleton instance thay vì class
- **Đã sửa**: Đổi từ `module.exports = new ExaminationController()` sang `module.exports = ExaminationController`

### Vấn đề 3: Route Configuration (SOLVED ✅)
- **Lỗi**: Routes gọi `ExaminationController.index` thay vì instance method
- **Nguyên nhân**: Chưa khởi tạo controller instance trong routes
- **Đã sửa**: 
  - Thêm `const examinationController = new ExaminationController()`
  - Đổi tất cả routes từ `ExaminationController.method` sang `examinationController.method`

## 🧪 CÁCH KIỂM TRA

### Option 1: Qua Browser (Recommended)

1. **Đảm bảo server đang chạy**
   ```
   Server phải hiển thị:
   ✅ Server started successfully!
   ✅ Database connected successfully
   ```

2. **Đăng nhập**
   - Mở: http://localhost:3000/login
   - Username: `admin`
   - Password: `admin123`

3. **Truy cập trang Examination**
   - Mở: http://localhost:3000/examination
   - **Kỳ vọng**: Trang danh sách ca thi hiển thị
   - **Có thể thấy**: 10 ca thi mẫu (đã seed trước đó)

4. **Kiểm tra server logs**
   ```
   Phải thấy logs:
   🚨🚨🚨 EXAMINATION INDEX CALLED 🚨🚨🚨
   📋 Examination index - Start
   🔍 Fetching examination sessions...
   📊 Total sessions found: X
   📋 Render completed successfully
   ```

### Option 2: Qua Developer Console

1. Mở browser tại http://localhost:3000/examination
2. Mở Developer Tools (F12)
3. Check **Console** tab xem có lỗi JavaScript không
4. Check **Network** tab:
   - Request to `/examination` phải return **200 OK**
   - Response phải là HTML (không phải JSON error)

## 📋 CHECKLIST

- [x] Syntax error đã được sửa
- [x] Controller export đúng format (class)
- [x] Controller instance được khởi tạo trong routes
- [x] Routes đã cập nhật dùng instance methods
- [x] Server khởi động thành công
- [x] Database connection OK
- [x] Enhanced logging đã thêm vào controller

## ⚠️ NẾU VẪN CÒN LỖI

### Kiểm tra logs:
```powershell
# Trong terminal đang chạy server, check xem có thấy:
🚨🚨🚨 EXAMINATION INDEX CALLED 🚨🚨🚨
```

- **Nếu THẤY log**: Controller được gọi, lỗi có thể ở rendering
- **Nếu KHÔNG thấy**: Request chưa đến controller
  - Check auth middleware (có bị redirect về /login không?)
  - Check route configuration
  - Check middleware stack

### Browser hiển thị gì?

- **Redirect về /login**: Auth middleware chặn → Cần đăng nhập
- **Trang trắng**: JavaScript error → Check console
- **Error 500**: Controller throw exception → Check server logs
- **JSON {"success": false}**: Upload middleware bắt lỗi → Check middleware order

## 🎯 MỤC TIÊU TIẾP THEO

Sau khi trang `/examination` hoạt động:

1. ✅ Verify danh sách ca thi hiển thị đúng
2. ⏳ Hoàn thiện form tạo/sửa ca thi
3. ⏳ Implement phân công giám thị
4. ⏳ Export Excel
5. ⏳ Import Excel

## 💡 DEBUGGING TIPS

### Check server logs realtime:
```powershell
# Terminal output sẽ hiển thị:
- Request method: GET
- User info
- Query parameters
- Database queries
- Render success/failure
```

### Common issues:
1. **No logs**: Route không match → Check route order
2. **Auth redirect**: Session expired → Login lại
3. **Database error**: Connection issue → Check MySQL running
4. **Template error**: Missing variables → Check res.render parameters

---

**Current Status**: ✅ All critical issues FIXED! Ready for testing!
