# 📊 HỆ THỐNG QUẢN LÝ CÁN BỘ & ĐÁNH GIÁ HIỆU SUẤT

## ✅ TÍNH NĂNG ĐÃ HOÀN THÀNH

### 1. THÊM CÁN BỘ MỚI

#### Mô tả
Form nhập liệu đầy đủ để thêm cán bộ mới vào hệ thống, tự động tạo tài khoản người dùng.

#### Truy cập
- URL: `/staff/create`
- Hoặc: Từ trang `/staff` → Nút **"Thêm cán bộ"**

#### Các thông tin cần nhập

**Thông tin cơ bản (Bắt buộc)**
- Họ và tên *
- Mã cán bộ * (định danh duy nhất, VD: GV001)
- Email *
- Số điện thoại
- Ngày sinh
- Giới tính
- Số CMND/CCCD
- Địa chỉ thường trú

**Thông tin công tác (Bắt buộc)**
- Phòng/Bộ môn * (dropdown chọn từ danh sách)
- Chức vụ học thuật (dropdown)
- Loại hình công tác * (Cơ hữu, Thỉnh giảng, Hợp đồng...)
- Ngày vào làm *
- Mức lương (VNĐ)
- Trạng thái (Đang công tác, Nghỉ phép, Tạm dừng)

**Thông tin học thuật**
- Học vị (Tiến sĩ, Thạc sĩ...)
- Học hàm (Giáo sư, Phó giáo sư...)
- Số năm kinh nghiệm

**Ghi chú bổ sung**
- Các thông tin đặc biệt, lưu ý

#### Quy trình xử lý
1. **Validation phía client**: Kiểm tra các trường bắt buộc trước khi submit
2. **Validation phía server**: Kiểm tra:
   - Email hợp lệ
   - Mã cán bộ duy nhất
   - Các trường bắt buộc đầy đủ
3. **Tạo tài khoản user**:
   - Username = Mã cán bộ
   - Password mặc định: `staff@123`
   - Role: `staff`
4. **Tạo hồ sơ cán bộ** trong bảng `staff`
5. **Thông báo thành công** và chuyển về trang danh sách

#### Lưu ý quan trọng
- ⚠️ **Mật khẩu mặc định**: `staff@123` - Cần thông báo cho cán bộ đổi mật khẩu
- ⚠️ **Mã cán bộ** không được trùng lặp
- ⚠️ **Email** phải unique trong hệ thống

---

### 2. THIẾT LẬP TIÊU CHÍ ĐÁNH GIÁ

#### Mô tả
Hệ thống quản lý tiêu chí đánh giá hiệu suất công tác của cán bộ theo năm học, bao gồm:
- Quản lý tiêu chí theo 5 nhóm chính
- Cấu hình trọng số, đơn vị đo lường
- Thiết lập đợt đánh giá theo học kỳ

#### Truy cập
- URL: `/staff/evaluation-criteria`
- Hoặc: Từ trang `/staff` → Nút **"Thiết lập tiêu chí đánh giá"**

#### Cấu trúc 5 nhóm tiêu chí

**1. Giảng dạy (Teaching) - 40%**
- Số giờ giảng dạy (15%)
- Chất lượng giảng dạy (10%)
- Tài liệu giảng dạy (5%)
- Đổi mới phương pháp (5%)
- Hướng dẫn sinh viên (5%)

**2. Nghiên cứu khoa học (Research) - 30%**
- Bài báo khoa học (15%)
- Đề tài nghiên cứu (8%)
- Hội nghị, hội thảo (4%)
- Sách chuyên khảo (3%)

**3. Phục vụ cộng đồng (Service) - 15%**
- Tham gia hội đồng (5%)
- Tập huấn, bồi dưỡng (4%)
- Hoạt động xã hội (3%)
- Truyền thông khoa học (3%)

**4. Phát triển nghề nghiệp (Professional) - 10%**
- Đào tạo, bồi dưỡng (4%)
- Chứng chỉ nghề nghiệp (3%)
- Giải thưởng cá nhân (3%)

**5. Kỷ luật & Đạo đức (Other) - 5%**
- Kỷ luật, chuyên cần (3%)
- Đạo đức nghề nghiệp (2%)

#### Loại đo lường
- **Numeric**: Đo bằng số lượng (giờ, bài báo, đề tài...)
- **Percentage**: Phần trăm
- **Grade**: Xếp loại (Xuất sắc, Tốt, TB, Yếu)
- **Boolean**: Có/Không
- **Text**: Văn bản mô tả

#### Cấu trúc database

**Bảng `evaluation_criteria`**
- Danh mục các tiêu chí đánh giá
- Thông tin: tên, mô tả, loại đo lường, trọng số, đơn vị

**Bảng `evaluation_periods`**
- Các đợt đánh giá theo năm học/học kỳ
- Thông tin: tên đợt, thời gian, hạn nộp, trạng thái

**Bảng `evaluation_period_criteria`**
- Liên kết tiêu chí với từng đợt đánh giá
- Cho phép điều chỉnh trọng số và chỉ tiêu riêng

**Bảng `staff_evaluations`**
- Lưu kết quả đánh giá chi tiết
- Tự đánh giá + đánh giá của quản lý

**Bảng `staff_evaluation_summary`**
- Tổng hợp kết quả theo đợt
- Xếp hạng, điểm tổng, nhận xét

---

## 📁 CẤU TRÚC FILE

```
app/
├── controllers/
│   └── StaffController.js          [+3 methods: create, store, evaluationCriteria]
├── models/
│   ├── Staff.js                    [+2 methods: createUserForStaff, getDepartmentOptions]
│   ├── EvaluationCriteria.js       [NEW]
│   └── EvaluationPeriod.js         [NEW]
└── routes/
    └── web.js                      [+4 routes]

views/
└── staff/
    ├── index.ejs                   [Updated: hooked buttons]
    ├── create.ejs                  [NEW]
    └── evaluation-criteria.ejs     [NEW]

database/
└── staff_evaluation_system.sql     [NEW - Complete schema]
```

---

## 🚀 CÁCH SỬ DỤNG

### Thêm cán bộ mới

1. Đăng nhập với quyền Admin
2. Vào menu **"Quản lý cán bộ"**
3. Click nút **"Thêm cán bộ"** (màu xanh dương)
4. Điền đầy đủ thông tin:
   - Các trường có dấu * là bắt buộc
   - Mã cán bộ phải unique
   - Email phải hợp lệ
5. Click **"Thêm cán bộ"**
6. Hệ thống tự động:
   - Tạo tài khoản user (username = mã cán bộ)
   - Gán mật khẩu mặc định: `staff@123`
   - Tạo hồ sơ cán bộ
7. Thông báo cho cán bộ về:
   - Tài khoản: `[mã cán bộ]`
   - Mật khẩu: `staff@123`
   - Link đăng nhập: `http://localhost:3000/login`
   - Yêu cầu đổi mật khẩu ngay sau lần đăng nhập đầu

### Thiết lập tiêu chí đánh giá

1. Vào **"Quản lý cán bộ"** → **"Thiết lập tiêu chí đánh giá"**
2. Chọn tab nhóm tiêu chí cần xem:
   - Giảng dạy
   - Nghiên cứu KH
   - Phục vụ cộng đồng
   - Phát triển nghề nghiệp
   - Kỷ luật & Đạo đức
3. Xem danh sách tiêu chí hiện có:
   - Tên tiêu chí
   - Loại đo lường
   - Đơn vị
   - Trọng số
   - Bắt buộc hay không
4. **[Tính năng sắp ra mắt]**:
   - Thêm tiêu chí mới
   - Chỉnh sửa tiêu chí
   - Xóa tiêu chí

### Tạo đợt đánh giá mới (Backend ready)

```javascript
// Sử dụng API
const EvaluationPeriod = require('./app/models/EvaluationPeriod');
const periodModel = new EvaluationPeriod();

await periodModel.createPeriodWithCriteria({
  name: 'Học kỳ 2 năm học 2024-2025',
  academic_year: '2024-2025',
  semester: 2,
  start_date: '2025-01-16',
  end_date: '2025-06-15',
  evaluation_deadline: '2025-06-20',
  status: 'draft',
  notes: 'Đợt đánh giá HK2'
}, copyFromPeriodId); // Sao chép tiêu chí từ đợt trước (optional)
```

---

## 📊 DATABASE SCHEMA

### Bảng đã được tạo
✅ `evaluation_criteria` - Danh mục tiêu chí  
✅ `evaluation_periods` - Đợt đánh giá  
✅ `evaluation_period_criteria` - Cấu hình tiêu chí theo đợt  
✅ `staff_evaluations` - Kết quả đánh giá chi tiết  
✅ `staff_evaluation_summary` - Tổng hợp kết quả  

### Dữ liệu mẫu đã được seed
✅ 18 tiêu chí đánh giá chuẩn (5 nhóm)  
✅ 3 đợt đánh giá năm học 2024-2025  
✅ Cấu hình tiêu chí cho HK1  

---

## 🎯 TÍNH NĂNG SẮP RA MẮT

### 1. Quản lý tiêu chí (CRUD hoàn chỉnh)
- [ ] Thêm tiêu chí mới
- [ ] Chỉnh sửa tiêu chí
- [ ] Xóa tiêu chí
- [ ] Kéo thả sắp xếp thứ tự

### 2. Quản lý đợt đánh giá
- [ ] Tạo đợt đánh giá mới
- [ ] Chỉnh sửa đợt đánh giá
- [ ] Kích hoạt/đóng đợt
- [ ] Sao chép cấu hình từ đợt trước

### 3. Tự đánh giá (Self-assessment)
- [ ] Cán bộ điền kết quả tự đánh giá
- [ ] Upload file minh chứng
- [ ] Lưu nháp và hoàn thành

### 4. Đánh giá từ quản lý
- [ ] Xem tự đánh giá của cán bộ
- [ ] Điểm đánh giá và nhận xét
- [ ] Phê duyệt kết quả

### 5. Báo cáo & Thống kê
- [ ] Tổng hợp điểm theo cán bộ
- [ ] Xếp hạng trong khoa/toàn trường
- [ ] Xuất báo cáo Excel/PDF
- [ ] Biểu đồ phân tích

### 6. Nhập liệu hàng loạt
- [ ] Import danh sách cán bộ từ Excel
- [ ] Import kết quả đánh giá từ Excel
- [ ] Template chuẩn

---

## ⚙️ CÁC ROUTE MỚI

```javascript
// Staff Management
GET  /staff                         // Danh sách cán bộ
GET  /staff/create                  // Form thêm cán bộ
POST /staff                         // Xử lý thêm cán bộ
GET  /staff/export                  // Xuất CSV
GET  /staff/evaluation-criteria     // Quản lý tiêu chí đánh giá

// Coming soon
GET  /staff/:id                     // Xem chi tiết cán bộ
GET  /staff/:id/edit                // Form sửa cán bộ
PUT  /staff/:id                     // Cập nhật cán bộ
GET  /staff/:id/evaluation          // Đánh giá cán bộ
```

---

## 🔧 TESTING

### Test thêm cán bộ

1. Vào `/staff/create`
2. Điền thông tin test:
   ```
   Họ tên: Nguyễn Văn A
   Mã CB: GV001
   Email: nguyenvana@example.com
   Phone: 0901234567
   Phòng: Khoa Công nghệ thông tin
   Loại hình: Giảng viên cơ hữu
   Ngày vào làm: 2024-09-01
   ```
3. Submit và kiểm tra:
   - Thông báo thành công
   - Cán bộ hiện trong danh sách `/staff`
   - Login với `GV001` / `staff@123`

### Test tiêu chí đánh giá

1. Vào `/staff/evaluation-criteria`
2. Chọn từng tab:
   - Giảng dạy: 5 tiêu chí, tổng 40%
   - Nghiên cứu KH: 4 tiêu chí, tổng 30%
   - Phục vụ cộng đồng: 4 tiêu chí, tổng 15%
   - Phát triển nghề nghiệp: 3 tiêu chí, tổng 10%
   - Kỷ luật & Đạo đức: 2 tiêu chí, tổng 5%
3. Kiểm tra:
   - Tổng 18 tiêu chí
   - Tổng trọng số: 100%
   - Hiển thị đúng loại đo lường, đơn vị

### Test database

```sql
-- Kiểm tra tiêu chí
SELECT category, COUNT(*) as total, SUM(weight) as total_weight
FROM evaluation_criteria
WHERE is_active = TRUE
GROUP BY category;

-- Kiểm tra đợt đánh giá
SELECT * FROM evaluation_periods;

-- Kiểm tra cấu hình
SELECT ep.name, COUNT(epc.id) as criteria_count
FROM evaluation_periods ep
LEFT JOIN evaluation_period_criteria epc ON ep.id = epc.period_id
GROUP BY ep.id, ep.name;
```

---

## 📝 BEST PRACTICES

### Bảo mật
- Mật khẩu mặc định phải được đổi ngay sau lần đăng nhập đầu
- Mã cán bộ và email phải unique
- Validate đầu vào ở cả client và server

### Hiệu suất
- Index đầy đủ trên các cột tìm kiếm
- Cache danh sách department/position options
- Pagination cho danh sách lớn

### UX
- Validation realtime trên form
- Thông báo lỗi rõ ràng
- Loading state khi submit
- Confirmation trước khi xóa

---

## 🐛 TROUBLESHOOTING

### Lỗi: "Mã cán bộ đã tồn tại"
- Kiểm tra database: `SELECT * FROM staff WHERE staff_code = 'GV001'`
- Đổi mã cán bộ khác

### Lỗi: "Email đã tồn tại"
- Kiểm tra: `SELECT * FROM users WHERE email = '...'`
- Sử dụng email khác

### Không tạo được tài khoản
- Kiểm tra table `users` tồn tại
- Kiểm tra bcrypt module: `npm ls bcryptjs`
- Xem log trong console

### Không hiển thị tiêu chí
- Kiểm tra đã import SQL: `SHOW TABLES LIKE 'evaluation%'`
- Kiểm tra dữ liệu: `SELECT COUNT(*) FROM evaluation_criteria`
- Clear cache trình duyệt

---

## 📞 HỖ TRỢ

Nếu gặp vấn đề, hãy kiểm tra:
1. Log trong terminal (nodemon)
2. Console trong trình duyệt (F12)
3. Database connection
4. Routes đã được đăng ký đúng

---

**Phiên bản**: 1.0.0  
**Ngày cập nhật**: 07/10/2024  
**Tác giả**: AI Development Team
