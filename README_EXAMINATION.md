# 📋 HỆ THỐNG QUẢN LÝ CÔNG TÁC KHẢO THÍ

## 📖 TỔNG QUAN DỰ ÁN

Hệ thống quản lý công tác khảo thí cho đơn vị giảng dạy, giúp số hóa quy trình tổ chức kỳ thi từ lên lịch, phân công giám thị, quản lý đề thi đến điểm danh và báo cáo.

**Trạng thái**: ✅ MVP hoàn thành (4/10/2025)  
**Công nghệ**: Node.js + Express + MySQL + EJS  
**URL**: http://localhost:3000/examination

---

## 🗂️ CẤU TRÚC TÀI LIỆU

### 📘 Cho người mới bắt đầu
1. **[EXAMINATION_QUICK_START.md](EXAMINATION_QUICK_START.md)**
   - Hướng dẫn triển khai trong 2.5 giờ
   - Step-by-step instructions
   - Code mẫu copy-paste

### 📗 Cho đội ngũ phát triển
2. **[EXAMINATION_DEVELOPMENT_ROADMAP.md](EXAMINATION_DEVELOPMENT_ROADMAP.md)**
   - Lộ trình phát triển 10-14 ngày
   - 9 phases chi tiết
   - Advanced features & best practices

3. **[EXAMINATION_DEVELOPMENT_ADVICE.md](EXAMINATION_DEVELOPMENT_ADVICE.md)**
   - Góp ý từ Senior Developer
   - Architecture patterns
   - Security & Performance optimization

### 📙 Cho Product Owner / Khách hàng
4. **[EXAMINATION_ENHANCEMENT_PROPOSAL.md](EXAMINATION_ENHANCEMENT_PROPOSAL.md)**
   - Đề xuất hoàn thiện chi tiết
   - 4 cấp độ ưu tiên
   - UX improvements
   - Testing & Deployment strategy

### 📕 Status Report
5. **[EXAMINATION_COMPLETED_MVP.md](EXAMINATION_COMPLETED_MVP.md)**
   - Báo cáo MVP hoàn thành
   - Checklist tính năng
   - Bước tiếp theo

---

## 🎯 TÍNH NĂNG HIỆN TẠI

### ✅ Đã hoàn thành
- [x] Database schema (8 tables)
- [x] Model: ExaminationSession với CRUD
- [x] Controller: 7 methods RESTful
- [x] View: List page với filter/search
- [x] Sample data: 10 ca thi mẫu
- [x] Delete function with confirmation

### 🔄 Đang phát triển
- [ ] Form tạo/sửa ca thi
- [ ] Phân công giám thị
- [ ] Quản lý đề thi
- [ ] Export Excel

---

## 🚀 CÁCH SỬ DỤNG

### 1. Import Database
```bash
cd d:\PHAN` MEM\quan_ly_giao_vu_new\quan_ly_giao_vu_mvc
node scripts/importExaminationSchema.js
```

### 2. Seed Sample Data
```bash
node scripts/seedExaminationDataSimple.js
```

### 3. Start Server
```bash
node server.js
```

### 4. Truy cập
```
http://localhost:3000/examination
```

---

## 📊 DATABASE SCHEMA

### Bảng chính
1. **examination_periods** - Kỳ thi (giữa kỳ, cuối kỳ)
2. **subjects** - Môn học
3. **classes** - Lớp học
4. **examination_sessions** - Ca thi (core table)

### Bảng phụ trợ
5. **examination_invigilators** - Phân công giám thị
6. **examination_students** - Sinh viên dự thi
7. **examination_papers** - Đề thi
8. **examination_attendance** - Điểm danh

---

## 🗺️ ROADMAP

### Phase 1: Core CRUD (Tuần 1-2) ⏳
- [x] List view
- [ ] Create form
- [ ] Edit form  
- [ ] Validation

### Phase 2: Advanced Features (Tuần 3-4)
- [ ] Phân công giám thị
- [ ] Quản lý đề thi
- [ ] Export Excel
- [ ] Import Excel

### Phase 3: User Experience (Tuần 5-6)
- [ ] Dashboard thống kê
- [ ] Email notifications
- [ ] Mobile responsive
- [ ] Calendar view

### Phase 4: Enterprise (Tuần 7+)
- [ ] AI lịch thi tối ưu
- [ ] QR Code check-in
- [ ] Video call giám sát
- [ ] Tích hợp hệ thống chấm điểm

---

## 👥 VAI TRÒ & QUYỀN HẠN

### Roles
1. **SUPER_ADMIN** - Toàn quyền
2. **EXAM_MANAGER** - Quản lý khảo thí
3. **EXAM_STAFF** - Nhân viên khảo thí
4. **INVIGILATOR** - Giám thị
5. **TEACHER** - Giảng viên
6. **STUDENT** - Sinh viên

### Permissions
- EXAM_MANAGER: CRUD kỳ thi, ca thi, phân công
- EXAM_STAFF: CRUD ca thi, xem lịch
- INVIGILATOR: Xem lịch coi thi, điểm danh
- TEACHER: Upload đề thi, xem lịch thi môn mình dạy
- STUDENT: Xem lịch thi của mình

---

## 🛠️ CÔNG NGHỆ

### Backend
- **Framework**: Express.js 4.x
- **Database**: MySQL 8.x
- **ORM**: Raw queries (có thể nâng cấp lên Sequelize/TypeORM)
- **Authentication**: Express-session

### Frontend
- **Template Engine**: EJS
- **CSS**: Custom CSS (có thể nâng cấp lên Tailwind/Bootstrap)
- **JavaScript**: Vanilla JS (có thể nâng cấp lên Vue/React)

### Dev Tools
- **Validation**: express-validator
- **File Upload**: multer
- **Excel**: exceljs
- **Email**: nodemailer
- **Testing**: Jest (recommended)

---

## 📁 CẤU TRÚC THƯ MỤC

```
quan_ly_giao_vu_mvc/
├── app/
│   ├── models/
│   │   └── ExaminationSession.js      ← Model chính
│   ├── controllers/
│   │   └── ExaminationController.js   ← Controller với 7 methods
│   ├── middleware/
│   │   └── examinationAuth.js         ← (sẽ tạo) Authorization
│   └── routes/
│       └── web.js                      ← Routes RESTful
│
├── views/
│   └── examination/
│       ├── index.ejs                   ← Placeholder cũ
│       ├── list.ejs                    ← View chính (active)
│       └── form.ejs                    ← (sẽ tạo) Create/Edit form
│
├── database/
│   └── examination_schema.sql          ← Schema SQL
│
├── scripts/
│   ├── importExaminationSchema.js      ← Import script
│   └── seedExaminationDataSimple.js    ← Seed data
│
└── docs/ (tài liệu này)
    ├── EXAMINATION_QUICK_START.md
    ├── EXAMINATION_DEVELOPMENT_ROADMAP.md
    ├── EXAMINATION_DEVELOPMENT_ADVICE.md
    ├── EXAMINATION_ENHANCEMENT_PROPOSAL.md
    ├── EXAMINATION_COMPLETED_MVP.md
    └── README_EXAMINATION.md               ← File này
```

---

## 🔗 API ENDPOINTS

### RESTful Routes
```
GET    /examination              → Danh sách ca thi (list view)
GET    /examination/create       → Form tạo mới (chưa có)
POST   /examination              → Lưu ca thi mới (chưa có)
GET    /examination/:id          → Chi tiết ca thi (chưa có)
GET    /examination/:id/edit     → Form sửa (chưa có)
PUT    /examination/:id          → Cập nhật ca thi (chưa có)
DELETE /examination/:id          → Xóa ca thi (có)
```

### API Response Format
```json
{
  "success": true,
  "message": "Tạo ca thi thành công",
  "session_id": 123
}
```

---

## 🧪 TESTING

### Test Commands
```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# Coverage
npm run test:coverage
```

### Manual Testing Checklist
- [ ] Tạo ca thi mới
- [ ] Sửa ca thi
- [ ] Xóa ca thi (có confirm)
- [ ] Filter theo kỳ thi
- [ ] Filter theo trạng thái
- [ ] Search theo tên môn
- [ ] Kiểm tra validation
- [ ] Kiểm tra xung đột lịch

---

## 📝 CODING STANDARDS

### Naming Conventions
- **Variables**: camelCase (`examSession`, `studentCount`)
- **Classes**: PascalCase (`ExaminationSession`, `ExamController`)
- **Files**: kebab-case (`examination-session.js`)
- **Database**: snake_case (`examination_sessions`, `student_count`)

### Code Style
- **Indentation**: 2 spaces
- **Quotes**: Single quotes for strings
- **Semicolons**: Required
- **Comments**: JSDoc format

---

## 🐛 TROUBLESHOOTING

### Lỗi thường gặp

#### 1. Database connection failed
```bash
# Check MySQL service
mysql -u root -p

# Verify .env file
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=quan_ly_giao_vu
```

#### 2. Port 3000 đã được sử dụng
```bash
# Windows
Get-Process -Name node | Stop-Process -Force

# Linux/Mac
killall node
```

#### 3. Module not found
```bash
npm install
```

#### 4. Data không hiển thị
```bash
# Re-seed database
node scripts/seedExaminationDataSimple.js
```

---

## 🤝 ĐÓNG GÓP

### Quy trình
1. Fork repository
2. Tạo branch: `git checkout -b feature/ten-tinh-nang`
3. Commit: `git commit -m "Add: mô tả tính năng"`
4. Push: `git push origin feature/ten-tinh-nang`
5. Tạo Pull Request

### Commit Message Format
```
Add: Thêm tính năng mới
Fix: Sửa lỗi
Update: Cập nhật tính năng
Refactor: Tái cấu trúc code
Docs: Cập nhật tài liệu
Test: Thêm/sửa tests
```

---

## 📞 HỖ TRỢ

### Tài liệu kỹ thuật
- [Express.js Docs](https://expressjs.com/)
- [MySQL Docs](https://dev.mysql.com/doc/)
- [EJS Docs](https://ejs.co/)

### Contact
- **Technical Lead**: [Tên developer]
- **Product Owner**: [Tên PO từ phòng khảo thí]
- **Email**: [support@example.com]

---

## 📜 LICENSE

[MIT License hoặc license của tổ chức]

---

## 🎉 CREDITS

Được phát triển bởi **Đội ngũ phát triển Hệ thống Quản lý Giáo vụ**  
Dành cho **Khoa An ninh điều tra**

---

*Cập nhật lần cuối: 4 tháng 10, 2025*
