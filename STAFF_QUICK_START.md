# 🎯 HƯỚNG DẪN NHANH - QUẢN LÝ CÁN BỘ

## ✅ 2 TÍNH NĂNG MỚI ĐÃ HOÀN THÀNH

### 1. THÊM CÁN BỘ MỚI 👤

**Cách sử dụng:**
1. Vào `/staff` → Click nút **"Thêm cán bộ"** (xanh dương)
2. Điền thông tin (các trường có dấu * là bắt buộc):
   - Họ tên, Mã cán bộ, Email ✅
   - Phòng/Bộ môn, Loại hình công tác ✅
   - Ngày vào làm ✅
3. Click **"Thêm cán bộ"**

**Kết quả:**
- ✅ Tài khoản tự động được tạo
- ✅ Username = Mã cán bộ
- ✅ Password mặc định: `staff@123`

---

### 2. THIẾT LẬP TIÊU CHÍ ĐÁNH GIÁ 📊

**Cách sử dụng:**
1. Vào `/staff` → Click **"Thiết lập tiêu chí đánh giá"**
2. Chọn tab nhóm tiêu chí:
   - 🎓 **Giảng dạy** (40%) - 5 tiêu chí
   - 🔬 **Nghiên cứu KH** (30%) - 4 tiêu chí  
   - 🤝 **Phục vụ cộng đồng** (15%) - 4 tiêu chí
   - 📈 **Phát triển nghề nghiệp** (10%) - 3 tiêu chí
   - ⚖️ **Kỷ luật & Đạo đức** (5%) - 2 tiêu chí

**Đã có sẵn:**
- ✅ 18 tiêu chí đánh giá chuẩn
- ✅ 3 đợt đánh giá năm học 2024-2025
- ✅ Database schema hoàn chỉnh

---

## 🚀 DEMO NHANH

### Test thêm cán bộ

```
URL: http://localhost:3000/staff/create

Thông tin test:
- Họ tên: Nguyễn Văn A
- Mã CB: GV001
- Email: test@example.com
- Phòng: Khoa CNTT
- Loại: Giảng viên cơ hữu
- Ngày vào làm: 2024-09-01
```

### Test tiêu chí đánh giá

```
URL: http://localhost:3000/staff/evaluation-criteria

Kiểm tra:
- ✅ 5 tab nhóm tiêu chí
- ✅ Tổng 18 tiêu chí
- ✅ Tổng trọng số 100%
```

---

## 📁 FILES QUAN TRỌNG

```
views/staff/
├── create.ejs                 [NEW] Form thêm cán bộ
└── evaluation-criteria.ejs    [NEW] Quản lý tiêu chí

app/controllers/
└── StaffController.js         [+3 methods]

app/models/
├── Staff.js                   [+2 methods]
├── EvaluationCriteria.js      [NEW]
└── EvaluationPeriod.js        [NEW]

database/
└── staff_evaluation_system.sql [NEW] ✅ Đã import
```

---

## 🔥 ROUTES MỚI

```javascript
GET  /staff/create                  // Form thêm cán bộ
POST /staff                         // Xử lý thêm cán bộ
GET  /staff/evaluation-criteria     // Quản lý tiêu chí
```

---

## 💡 LƯU Ý

⚠️ **Mật khẩu mặc định**: `staff@123` - Yêu cầu cán bộ đổi ngay sau lần đăng nhập đầu

⚠️ **Mã cán bộ** phải unique (không được trùng)

⚠️ **Email** phải unique trong hệ thống

✅ **Database** đã được setup tự động với 18 tiêu chí chuẩn

---

## 📖 TÀI LIỆU CHI TIẾT

Xem file: **`STAFF_MANAGEMENT_COMPLETE.md`**

---

**Version**: 1.0.0 | **Date**: 07/10/2024
