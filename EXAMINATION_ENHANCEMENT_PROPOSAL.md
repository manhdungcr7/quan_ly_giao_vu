# 📊 GÓP Ý HOÀN THIỆN TRANG CÔNG TÁC KHẢO THÍ
## Dành cho Đơn vị giảng dạy phụ trách công tác khảo thí

*Ngày: 4 tháng 10, 2025*  
*Người góp ý: Đội ngũ phát triển hệ thống*

---

## 🎯 ĐÁNH GIÁ HIỆN TRẠNG

### ✅ ĐIỂM MẠNH (Đã hoàn thành)

1. **Giao diện trực quan**
   - ✅ Header rõ ràng với icon và tiêu đề
   - ✅ Button "Thêm ca thi" đặt vị trí nổi bật  
   - ✅ Toolbar lọc 3 trường: Kỳ thi, Trạng thái, Tìm kiếm
   - ✅ Table hiển thị đầy đủ thông tin quan trọng

2. **Dữ liệu mẫu**
   - ✅ 2 kỳ thi (Giữa kỳ + Cuối kỳ HK I 2024-2025)
   - ✅ 6 môn học đa dạng (Luật, CNTT, Hành chính, Kinh tế, An ninh, Chính trị)
   - ✅ 10 ca thi với thông tin đầy đủ

3. **Tính năng cơ bản**
   - ✅ Hiển thị danh sách ca thi
   - ✅ Filter theo kỳ thi, trạng thái
   - ✅ Tìm kiếm text
   - ✅ Actions: Sửa, Xóa, Sao lưu

---

## 🚀 ĐỀ XUẤT HOÀN THIỆN (Theo mức độ ưu tiên)

### 🔴 CẤP BÁC 1: KHẨN CẤP (Tuần 1-2)

#### 1.1. **Form Thêm/Sửa Ca Thi** ⭐⭐⭐⭐⭐
**Vấn đề**: Button "Thêm ca thi" chưa có form thực sự  
**Tác động**: Không thể tạo ca thi mới → Phải nhập thủ công vào database

**Giải pháp**:
```
📝 Tạo file: views/examination/form.ejs
Bao gồm:
- Dropdown chọn Kỳ thi (examination_periods)
- Dropdown chọn Môn học (subjects)  
- Dropdown chọn Lớp học (classes)
- Input: Mã ca thi, Tên ca thi
- Date picker: Ngày thi
- Time picker: Giờ thi
- Input: Thời lượng (phút)
- Input: Phòng thi
- Input: Số lượng SV
- Input: Số đề dự kiến
- Input: Link (cho thi online/hybrid)
- Radio: Loại hình thi (offline/online/hybrid)
- Select: Trạng thái
- Button: Lưu / Hủy
```

**Code mẫu** (xem file `EXAMINATION_QUICK_START.md` section "Bước 4")

---

#### 1.2. **Phân công coi thi** ⭐⭐⭐⭐⭐
**Vấn đề**: Chưa có chức năng phân công giám thị  
**Tác động**: Công tác quan trọng nhất chưa được số hóa

**Giải pháp**:
```
1. Tạo bảng staff (nếu chưa có) để lưu danh sách cán bộ
2. Tạo giao diện phân công:
   - Xem danh sách giám thị đã phân cho mỗi ca thi
   - Thêm/xóa giám thị
   - Phân vai trò: Giám thị chính, Giám thị phụ
   - Ghi chú đặc biệt (nếu có)
3. Tính năng tự động:
   - Gợi ý giám thị theo lịch rảnh
   - Cảnh báo trùng lịch
   - Đảm bảo mỗi ca thi có đủ 2 giám thị
```

**Database đã có sẵn**: `examination_invigilators` table

---

#### 1.3. **Xuất báo cáo Excel** ⭐⭐⭐⭐
**Vấn đề**: Chưa có tính năng export  
**Tác động**: Phải copy thủ công để báo cáo lãnh đạo

**Giải pháp**:
```javascript
// Cài đặt package
npm install exceljs

// Tạo controller method
async exportToExcel(req, res) {
  const ExcelJS = require('exceljs');
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Lịch thi');
  
  // Header
  worksheet.columns = [
    { header: 'STT', key: 'stt', width: 5 },
    { header: 'Mã ca thi', key: 'exam_code', width: 15 },
    { header: 'Môn học', key: 'subject_name', width: 30 },
    { header: 'Ngày thi', key: 'exam_date', width: 12 },
    { header: 'Giờ thi', key: 'exam_time', width: 10 },
    { header: 'Phòng', key: 'room', width: 10 },
    { header: 'SL SV', key: 'student_count', width: 8 },
    { header: 'Link', key: 'link', width: 40 }
  ];
  
  // Data
  const sessions = await ExaminationSession.findAll(req.query);
  sessions.forEach((session, index) => {
    worksheet.addRow({
      stt: index + 1,
      exam_code: session.exam_code,
      subject_name: session.subject_name,
      exam_date: new Date(session.exam_date).toLocaleDateString('vi-VN'),
      exam_time: session.exam_time,
      room: session.room,
      student_count: session.student_count,
      link: session.link || ''
    });
  });
  
  // Style
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFD3D3D3' }
  };
  
  // Send file
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=lich-thi-${Date.now()}.xlsx`);
  
  await workbook.xlsx.write(res);
  res.end();
}
```

**Thêm button trong view**:
```html
<button onclick="exportExcel()" class="btn btn-success">
  <i class="fas fa-file-excel"></i> Xuất Excel
</button>

<script>
function exportExcel() {
  const params = new URLSearchParams(window.location.search);
  window.location.href = '/examination/export?' + params.toString();
}
</script>
```

---

#### 1.4. **Validation dữ liệu** ⭐⭐⭐⭐
**Vấn đề**: Không có validation khi nhập liệu  
**Tác động**: Dữ liệu sai, trùng lặp, xung đột

**Giải pháp**:
```javascript
// File: app/middleware/examinationValidation.js
const { body, validationResult } = require('express-validator');

exports.validateExaminationSession = [
  body('period_id')
    .notEmpty().withMessage('Kỳ thi không được để trống')
    .isInt().withMessage('Kỳ thi không hợp lệ'),
    
  body('subject_id')
    .notEmpty().withMessage('Môn học không được để trống')
    .isInt().withMessage('Môn học không hợp lệ'),
    
  body('exam_code')
    .notEmpty().withMessage('Mã ca thi không được để trống')
    .isLength({ max: 50 }).withMessage('Mã ca thi tối đa 50 ký tự')
    .matches(/^[A-Z0-9-]+$/).withMessage('Mã ca thi chỉ chứa chữ in hoa, số và dấu gạch ngang'),
    
  body('exam_name')
    .notEmpty().withMessage('Tên ca thi không được để trống')
    .isLength({ max: 255 }).withMessage('Tên ca thi tối đa 255 ký tự'),
    
  body('exam_date')
    .notEmpty().withMessage('Ngày thi không được để trống')
    .isDate().withMessage('Ngày thi không hợp lệ')
    .custom((value) => {
      const examDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (examDate < today) {
        throw new Error('Ngày thi không được là ngày quá khứ');
      }
      return true;
    }),
    
  body('exam_time')
    .notEmpty().withMessage('Giờ thi không được để trống')
    .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Giờ thi không hợp lệ (HH:MM)'),
    
  body('duration')
    .notEmpty().withMessage('Thời lượng không được để trống')
    .isInt({ min: 30, max: 300 }).withMessage('Thời lượng từ 30-300 phút'),
    
  body('room')
    .notEmpty().withMessage('Phòng thi không được để trống')
    .isLength({ max: 50 }).withMessage('Phòng thi tối đa 50 ký tự'),
    
  body('student_count')
    .isInt({ min: 0, max: 500 }).withMessage('Số lượng SV từ 0-500'),
    
  body('link')
    .optional()
    .isURL().withMessage('Link không hợp lệ'),
    
  body('exam_type')
    .isIn(['offline', 'online', 'hybrid']).withMessage('Loại hình thi không hợp lệ'),
    
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  }
];

// Kiểm tra xung đột lịch thi
exports.checkConflicts = async (req, res, next) => {
  const { exam_date, exam_time, room, id } = req.body;
  
  const [conflicts] = await db.query(`
    SELECT * FROM examination_sessions 
    WHERE exam_date = ? 
    AND exam_time = ? 
    AND room = ?
    AND id != ?
  `, [exam_date, exam_time, room, id || 0]);
  
  if (conflicts.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Phòng ${room} đã có ca thi vào ${exam_date} lúc ${exam_time}`
    });
  }
  
  next();
};
```

**Sử dụng trong routes**:
```javascript
const { validateExaminationSession, checkConflicts } = require('../middleware/examinationValidation');

router.post('/examination', 
  requireAuth, 
  validateExaminationSession,
  checkConflicts,
  (req, res) => ExaminationController.store(req, res)
);
```

---

### 🟠 CẤP BÁC 2: CAO (Tuần 3-4)

#### 2.1. **Quản lý đề thi** ⭐⭐⭐⭐
**Chức năng**:
- Upload file đề thi (PDF, Word)
- Quản lý phiên bản đề (Đề chính, Đề dự phòng)
- Bảo mật đề thi (chỉ admin mới xem được trước ngày thi)
- Ghi log người truy cập đề

**Database đã có**: `examination_papers` table

---

#### 2.2. **Điểm danh sinh viên** ⭐⭐⭐⭐
**Chức năng**:
- Danh sách sinh viên dự thi
- Check-in khi vào phòng thi
- Check-out khi nộp bài
- Ghi chú (vắng có phép, vắng không phép, vi phạm quy chế)

**Database đã có**: `examination_attendance` table

---

#### 2.3. **Dashboard thống kê** ⭐⭐⭐
**Hiển thị**:
- Tổng số ca thi theo kỳ
- Số ca thi hôm nay/tuần này
- Biểu đồ: Tỉ lệ thi online vs offline
- Top 5 môn học có nhiều ca thi nhất
- Giám thị có số lượng phân công nhiều nhất

---

#### 2.4. **Thông báo tự động** ⭐⭐⭐
**Email/SMS cho**:
- Giám thị: Lịch coi thi (trước 3 ngày)
- Sinh viên: Thông tin ca thi (trước 1 tuần)
- Admin: Cảnh báo ca thi chưa có giám thị

---

### 🟡 CẤP BÁC 3: TRUNG BÌNH (Tuần 5-6)

#### 3.1. **Import từ Excel** ⭐⭐⭐
Cho phép giáo vụ upload file Excel để tạo hàng loạt ca thi

#### 3.2. **Lịch sử thay đổi** ⭐⭐
Audit log: Ai đã sửa gì, khi nào

#### 3.3. **Mobile responsive** ⭐⭐⭐
Tối ưu giao diện cho điện thoại

#### 3.4. **In biên bản coi thi** ⭐⭐⭐
Template PDF có chữ ký điện tử

---

### 🟢 CẤP BÁC 4: NÂNG CAO (Tuần 7+)

#### 4.1. **AI gợi ý lịch thi tối ưu** ⭐
Thuật toán tự động sắp xếp lịch thi tránh xung đột

#### 4.2. **Tích hợp với hệ thống chấm điểm** ⭐
Tự động tạo cột điểm sau khi thi xong

#### 4.3. **QR Code check-in** ⭐⭐
Sinh viên quét mã QR để điểm danh

#### 4.4. **Video call giám sát** ⭐
Tích hợp Zoom/Google Meet để giám thị từ xa

---

## 💡 CẢI TIẾN TRẢI NGHIỆM NGƯỜI DÙNG (UX)

### 1. **Cải thiện Filter**
```javascript
// Thêm filter nâng cao
- Range ngày thi (từ - đến)
- Loại hình thi (offline/online/hybrid)
- Môn học (multi-select)
- Lọc ca thi chưa có giám thị
- Lọc ca thi trong ngày
```

### 2. **Bulk Actions**
```html
<input type="checkbox" class="select-all">
<button onclick="bulkDelete()">Xóa nhiều</button>
<button onclick="bulkExport()">Xuất nhiều</button>
<button onclick="bulkAssignInvigilator()">Phân công hàng loạt</button>
```

### 3. **Inline Editing**
Click trực tiếp vào cell trong table để sửa nhanh

### 4. **Drag & Drop**
Kéo thả để sắp xếp thứ tự ca thi

### 5. **Calendar View**
Xem lịch thi dạng lịch (tuần/tháng)

### 6. **Notifications**
Toast thông báo thay vì alert()

---

## 🔒 BẢO MẬT & PHÂN QUYỀN

### Roles cần thiết:
```javascript
1. SUPER_ADMIN
   - Toàn quyền

2. EXAM_MANAGER (Trưởng phòng khảo thí)
   - Tạo/sửa/xóa kỳ thi, ca thi
   - Phân công giám thị
   - Xem báo cáo

3. EXAM_STAFF (Nhân viên khảo thí)
   - Tạo/sửa ca thi
   - Xem lịch coi thi
   - Điểm danh

4. INVIGILATOR (Giám thị)
   - Xem lịch coi thi của mình
   - Điểm danh sinh viên
   - Xem đề thi (chỉ trong giờ thi)

5. TEACHER (Giảng viên)
   - Xem ca thi môn mình dạy
   - Upload đề thi

6. STUDENT (Sinh viên)
   - Xem lịch thi của mình
```

### Middleware kiểm tra quyền:
```javascript
// app/middleware/examinationAuth.js
exports.canManageExamination = (req, res, next) => {
  if (!['SUPER_ADMIN', 'EXAM_MANAGER', 'EXAM_STAFF'].includes(req.session.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Bạn không có quyền quản lý khảo thí'
    });
  }
  next();
};

exports.canViewExamination = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({
      success: false,
      message: 'Vui lòng đăng nhập'
    });
  }
  next();
};
```

---

## 📊 METRICS & KPIs

### Chỉ số cần theo dõi:
1. **Hiệu suất hệ thống**
   - Thời gian load trang (< 2s)
   - Thời gian query database (< 500ms)
   - Uptime (> 99.9%)

2. **Sử dụng**
   - Số ca thi tạo mới/ngày
   - Số lượt truy cập/ngày
   - Số lỗi validation/ngày

3. **Chất lượng dữ liệu**
   - % ca thi đã phân công giám thị
   - % ca thi có link (cho online/hybrid)
   - % ca thi đã có đề thi

---

## 🧪 TESTING

### Test cases quan trọng:
```javascript
// 1. Tạo ca thi
✅ Tạo thành công với dữ liệu hợp lệ
❌ Tạo thất bại khi thiếu trường bắt buộc
❌ Tạo thất bại khi mã ca thi trùng
❌ Tạo thất bại khi ngày thi là quá khứ
❌ Tạo thất bại khi phòng thi bị trùng giờ

// 2. Sửa ca thi
✅ Sửa thành công
❌ Sửa thất bại khi ID không tồn tại
❌ Sửa thất bại khi không có quyền

// 3. Xóa ca thi
✅ Xóa thành công
❌ Xóa thất bại khi ca thi đã diễn ra
⚠️ Confirm trước khi xóa

// 4. Filter & Search
✅ Filter theo kỳ thi
✅ Filter theo trạng thái
✅ Search theo tên môn học
✅ Kết hợp nhiều filter

// 5. Phân công giám thị
✅ Phân công thành công
❌ Phân công thất bại khi giám thị đã có lịch trùng
⚠️ Cảnh báo khi một giám thị được phân quá nhiều ca

// 6. Export Excel
✅ Export thành công
✅ File Excel đúng format
✅ Dữ liệu trong Excel chính xác
```

---

## 📝 CHECKLIST TRIỂN KHAI

### Phase 1: Core Features (2 tuần)
- [ ] Form tạo/sửa ca thi
- [ ] Validation đầy đủ
- [ ] Kiểm tra xung đột lịch
- [ ] Export Excel cơ bản

### Phase 2: Advanced Features (2 tuần)
- [ ] Phân công giám thị
- [ ] Quản lý đề thi
- [ ] Điểm danh sinh viên
- [ ] Dashboard thống kê

### Phase 3: Enhancement (2 tuần)
- [ ] Import từ Excel
- [ ] Thông báo email
- [ ] Mobile responsive
- [ ] In biên bản

### Phase 4: Polish (1 tuần)
- [ ] UI/UX improvements
- [ ] Performance optimization
- [ ] Security hardening
- [ ] Documentation

---

## 🎓 KẾT LUẬN & KHUYẾN NGHỊ

### Ưu tiên cao nhất:
1. ✅ **Form tạo/sửa ca thi** - Không có form thì không thể sử dụng
2. ✅ **Phân công giám thị** - Công việc cốt lõi của khảo thí
3. ✅ **Export Excel** - Báo cáo lãnh đạo
4. ✅ **Validation** - Đảm bảo chất lượng dữ liệu

### Lộ trình đề xuất:
- **Tuần 1-2**: Hoàn thiện CRUD cơ bản
- **Tuần 3-4**: Phân công giám thí + Export
- **Tuần 5-6**: Quản lý đề thi + Điểm danh
- **Tuần 7+**: Tính năng nâng cao

### Nguồn lực cần:
- 1 Full-stack Developer (lead)
- 1 Frontend Developer  
- 1 QA Tester
- 1 Product Owner (từ phòng khảo thí)

### Công nghệ:
- ✅ Backend: Node.js + Express (hiện tại)
- ✅ Database: MySQL (hiện tại)
- ➕ Thêm: ExcelJS (export), Nodemailer (email), Socket.io (realtime)

---

## 📞 HỖ TRỢ

Nếu cần hỗ trợ kỹ thuật hoặc có câu hỏi, vui lòng tham khảo:
- `EXAMINATION_QUICK_START.md` - Hướng dẫn bắt đầu
- `EXAMINATION_DEVELOPMENT_ROADMAP.md` - Lộ trình chi tiết
- `EXAMINATION_DEVELOPMENT_ADVICE.md` - Best practices

---

*Tài liệu này được tạo bởi đội ngũ phát triển với mục đích hỗ trợ đơn vị giảng dạy hoàn thiện hệ thống quản lý công tác khảo thí một cách hiệu quả và chuyên nghiệp.*
