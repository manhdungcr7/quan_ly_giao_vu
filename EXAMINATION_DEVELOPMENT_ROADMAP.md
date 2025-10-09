# 📋 LỘ TRÌNH PHÁT TRIỂN HỆ THỐNG CÔNG TÁC KHẢO THÍ

## 🎯 MỤC TIÊU
Phát triển hệ thống quản lý công tác khảo thí đầy đủ từ trang placeholder hiện tại thành hệ thống hoàn chỉnh như trong hình mẫu.

---

## 📊 PHÂN TÍCH HIỆN TRẠNG

### ✅ Đã có (Current State):
- [x] Route `/examination` đã hoạt động
- [x] Controller `ExaminationController.js` cơ bản
- [x] View `examination/index.ejs` với giao diện placeholder đẹp
- [x] Integration vào sidebar menu
- [x] Badge trạng thái "ĐANG PHÁT TRIỂN"

### ❌ Cần phát triển (Requirements):
- [ ] Database schema đầy đủ
- [ ] CRUD operations cho các entity
- [ ] Giao diện danh sách với bảng dữ liệu
- [ ] Bộ lọc và tìm kiếm nâng cao
- [ ] Form tạo/sửa ca thi
- [ ] Phân công coi thi tự động
- [ ] Export/Import dữ liệu
- [ ] Báo cáo thống kê

---

## 🗂️ GIAI ĐOẠN 1: THIẾT KẾ CƠ SỞ DỮ LIỆU (1-2 ngày)

### 1.1. Database Schema
**File đã tạo**: `database/examination_schema.sql`

**Các bảng chính**:
```
examination_periods      → Kỳ thi (HK I, HK II, Thi lại...)
subjects                 → Môn học (LAW101, CS0001...)
classes                  → Lớp học (01, 02, 03...)
examination_sessions     → Ca thi (cụ thể từng buổi thi)
examination_invigilators → Phân công coi thi
examination_students     → Sinh viên dự thi
examination_papers       → Đề thi
examination_attendance   → Điểm danh coi thi
```

### 1.2. Import Schema
```bash
# Chạy script import
cd d:\PHAN MEM\quan_ly_giao_vu_new\quan_ly_giao_vu_mvc
node scripts/importExaminationSchema.js
```

### 1.3. Seed Data Mẫu
- 2 kỳ thi mẫu
- 4 môn học mẫu
- 4 lớp học mẫu
- Sample ca thi với đầy đủ thông tin

---

## 🏗️ GIAI ĐOẠN 2: XÂY DỰNG MODELS (1 ngày)

### 2.1. Tạo các Model Classes

**File cần tạo**:
```
app/models/ExaminationPeriod.js
app/models/Subject.js
app/models/Class.js
app/models/ExaminationSession.js
app/models/ExaminationInvigilator.js
app/models/ExaminationStudent.js
```

**Cấu trúc Model mẫu**:
```javascript
const BaseModel = require('./BaseModel');

class ExaminationSession extends BaseModel {
  static tableName = 'examination_sessions';
  
  // Lấy tất cả ca thi
  static async findAll(filters = {}) {
    let query = `SELECT 
      es.*,
      ep.name as period_name,
      s.code as subject_code,
      s.name as subject_name,
      c.code as class_code
    FROM ${this.tableName} es
    LEFT JOIN examination_periods ep ON es.period_id = ep.id
    LEFT JOIN subjects s ON es.subject_id = s.id
    LEFT JOIN classes c ON es.class_id = c.id
    WHERE 1=1`;
    
    const params = [];
    
    // Apply filters
    if (filters.period_id) {
      query += ' AND es.period_id = ?';
      params.push(filters.period_id);
    }
    
    if (filters.subject_id) {
      query += ' AND es.subject_id = ?';
      params.push(filters.subject_id);
    }
    
    if (filters.exam_date) {
      query += ' AND es.exam_date = ?';
      params.push(filters.exam_date);
    }
    
    if (filters.status) {
      query += ' AND es.status = ?';
      params.push(filters.status);
    }
    
    query += ' ORDER BY es.exam_date DESC, es.exam_time ASC';
    
    const [rows] = await this.db.query(query, params);
    return rows;
  }
  
  // Tạo ca thi mới
  static async create(data) {
    const query = `INSERT INTO ${this.tableName} 
      (period_id, subject_id, class_id, exam_code, exam_name, 
       exam_date, exam_time, duration, room, student_count, 
       expected_copies, link, exam_type, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      
    const [result] = await this.db.query(query, [
      data.period_id,
      data.subject_id,
      data.class_id,
      data.exam_code,
      data.exam_name,
      data.exam_date,
      data.exam_time,
      data.duration || 90,
      data.room,
      data.student_count || 0,
      data.expected_copies,
      data.link,
      data.exam_type || 'offline',
      data.status || 'scheduled'
    ]);
    
    return result.insertId;
  }
  
  // Cập nhật ca thi
  static async update(id, data) {
    const updates = [];
    const params = [];
    
    Object.keys(data).forEach(key => {
      updates.push(`${key} = ?`);
      params.push(data[key]);
    });
    
    params.push(id);
    
    const query = `UPDATE ${this.tableName} 
                   SET ${updates.join(', ')}
                   WHERE id = ?`;
                   
    await this.db.query(query, params);
  }
  
  // Xóa ca thi
  static async delete(id) {
    const query = `DELETE FROM ${this.tableName} WHERE id = ?`;
    await this.db.query(query, [id]);
  }
  
  // Lấy thống kê
  static async getStatistics(periodId) {
    const query = `
      SELECT 
        COUNT(*) as total_sessions,
        SUM(student_count) as total_students,
        COUNT(DISTINCT subject_id) as total_subjects,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_sessions
      FROM ${this.tableName}
      WHERE period_id = ?
    `;
    
    const [rows] = await this.db.query(query, [periodId]);
    return rows[0];
  }
}

module.exports = ExaminationSession;
```

---

## 🎨 GIAI ĐOẠN 3: XÂY DỰNG CONTROLLER (1 ngày)

### 3.1. Cập nhật ExaminationController.js

**Các method cần có**:
```javascript
class ExaminationController {
  // Danh sách ca thi
  async index(req, res) {}
  
  // Form tạo mới
  async create(req, res) {}
  
  // Lưu ca thi mới
  async store(req, res) {}
  
  // Chi tiết ca thi
  async show(req, res) {}
  
  // Form chỉnh sửa
  async edit(req, res) {}
  
  // Cập nhật ca thi
  async update(req, res) {}
  
  // Xóa ca thi
  async destroy(req, res) {}
  
  // Phân công coi thi
  async assignInvigilators(req, res) {}
  
  // Danh sách sinh viên dự thi
  async students(req, res) {}
  
  // Export Excel
  async exportExcel(req, res) {}
  
  // Thống kê
  async statistics(req, res) {}
}
```

---

## 🖼️ GIAI ĐOẠN 4: XÂY DỰNG GIAO DIỆN (2-3 ngày)

### 4.1. Trang Danh Sách (List Page)

**File**: `views/examination/list.ejs`

**Cấu trúc**:
```ejs
<%- include('../layouts/main', { body: 'examination/list' }) %>

<!-- Toolbar với bộ lọc -->
<div class="filter-toolbar">
  <div class="filter-group">
    <label>Kỳ thi</label>
    <select id="filterPeriod">
      <option>Tất cả</option>
      <% periods.forEach(period => { %>
        <option value="<%= period.id %>"><%= period.name %></option>
      <% }) %>
    </select>
  </div>
  
  <div class="filter-group">
    <input type="text" placeholder="Tìm kiếm..." id="searchInput">
  </div>
  
  <button class="btn-primary" onclick="location.href='/examination/create'">
    <i class="fas fa-plus"></i> Thêm ca thi
  </button>
</div>

<!-- Bảng dữ liệu -->
<table class="data-table">
  <thead>
    <tr>
      <th>Tên khóa thi</th>
      <th>Mã môn</th>
      <th>Lớp</th>
      <th>Môn học thi</th>
      <th>SL sinh viên</th>
      <th>Dự án để</th>
      <th>Dự kiến cấp án</th>
      <th>Ngày thi</th>
      <th>Link thi</th>
      <th>Thao tác</th>
    </tr>
  </thead>
  <tbody>
    <% sessions.forEach(session => { %>
      <tr>
        <td><%= session.exam_name %></td>
        <td><%= session.subject_code %></td>
        <td><%= session.class_code %></td>
        <td><%= session.subject_name %></td>
        <td><%= session.student_count %></td>
        <td><%= session.expected_copies %></td>
        <td><%= session.actual_copies || '-' %></td>
        <td><%= formatDate(session.exam_date) %></td>
        <td>
          <% if (session.link) { %>
            <a href="<%= session.link %>" target="_blank">Link</a>
          <% } else { %>
            -
          <% } %>
        </td>
        <td>
          <button class="btn-backup" onclick="backupSession(<%= session.id %>)">
            Sao lưu
          </button>
        </td>
      </tr>
    <% }) %>
  </tbody>
</table>
```

### 4.2. Form Tạo/Sửa (Create/Edit Form)

**File**: `views/examination/form.ejs`

**Các trường chính**:
- Kỳ thi (dropdown)
- Môn học (dropdown với search)
- Lớp học (dropdown)
- Mã ca thi (auto-generate)
- Ngày thi (date picker)
- Giờ thi (time picker)
- Thời lượng (number input)
- Phòng thi (text input)
- Số lượng sinh viên (number)
- Dự kiến số bản (number)
- Link thi online (URL input)
- Hình thức thi (online/offline/hybrid)

### 4.3. Trang Chi Tiết (Detail Page)

**File**: `views/examination/detail.ejs`

**Sections**:
- Thông tin ca thi
- Danh sách giảng viên coi thi
- Danh sách sinh viên dự thi
- Đề thi đã upload
- Lịch sử thay đổi

---

## 🔌 GIAI ĐOẠN 5: API & ROUTES (1 ngày)

### 5.1. Định nghĩa Routes

**File**: `app/routes/web.js`

```javascript
// Examination routes
router.get('/examination', requireAuth, ExaminationController.index);
router.get('/examination/create', requireAuth, ExaminationController.create);
router.post('/examination', requireAuth, ExaminationController.store);
router.get('/examination/:id', requireAuth, ExaminationController.show);
router.get('/examination/:id/edit', requireAuth, ExaminationController.edit);
router.put('/examination/:id', requireAuth, ExaminationController.update);
router.delete('/examination/:id', requireAuth, ExaminationController.destroy);

// Phân công coi thi
router.get('/examination/:id/invigilators', requireAuth, ExaminationController.getInvigilators);
router.post('/examination/:id/invigilators', requireAuth, ExaminationController.assignInvigilators);

// Danh sách sinh viên
router.get('/examination/:id/students', requireAuth, ExaminationController.getStudents);
router.post('/examination/:id/students', requireAuth, ExaminationController.addStudents);

// Export
router.get('/examination/export/excel', requireAuth, ExaminationController.exportExcel);

// Statistics
router.get('/examination/statistics', requireAuth, ExaminationController.statistics);
```

---

## 🎯 GIAI ĐOẠN 6: TÍNH NĂNG NÂNG CAO (2-3 ngày)

### 6.1. Phân Công Coi Thi Tự Động

**Algorithm**:
```javascript
async function autoAssignInvigilators(sessionId) {
  // 1. Lấy thông tin ca thi
  const session = await ExaminationSession.findById(sessionId);
  
  // 2. Tìm giảng viên phù hợp
  const availableStaff = await Staff.findAvailable({
    date: session.exam_date,
    time: session.exam_time,
    excludeSubject: session.subject_id // Không phân công GV dạy môn đó
  });
  
  // 3. Phân công theo tỷ lệ
  // Main: 1 người
  // Assistant: ceil(student_count / 30) người
  
  const mainInvigilator = availableStaff[0];
  const assistantsNeeded = Math.ceil(session.student_count / 30) - 1;
  
  // 4. Lưu phân công
  await ExaminationInvigilator.create({
    session_id: sessionId,
    staff_id: mainInvigilator.id,
    role: 'main'
  });
  
  for (let i = 1; i <= assistantsNeeded; i++) {
    await ExaminationInvigilator.create({
      session_id: sessionId,
      staff_id: availableStaff[i].id,
      role: 'assistant'
    });
  }
}
```

### 6.2. Import/Export Excel

**Library**: `xlsx` hoặc `exceljs`

```javascript
async exportExcel(req, res) {
  const ExcelJS = require('exceljs');
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Ca thi');
  
  // Define columns
  worksheet.columns = [
    { header: 'Mã ca thi', key: 'exam_code', width: 15 },
    { header: 'Môn học', key: 'subject_name', width: 30 },
    { header: 'Ngày thi', key: 'exam_date', width: 15 },
    // ... more columns
  ];
  
  // Fetch data
  const sessions = await ExaminationSession.findAll(req.query);
  
  // Add rows
  sessions.forEach(session => {
    worksheet.addRow({
      exam_code: session.exam_code,
      subject_name: session.subject_name,
      exam_date: formatDate(session.exam_date),
      // ... more fields
    });
  });
  
  // Send file
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=danh-sach-ca-thi.xlsx');
  
  await workbook.xlsx.write(res);
  res.end();
}
```

### 6.3. Báo Cáo Thống Kê

**Dashboard widgets**:
- Tổng số ca thi trong kỳ
- Tổng số sinh viên dự thi
- Số ca thi đã hoàn thành / tổng số
- Số giảng viên đã phân công
- Biểu đồ phân bố ca thi theo ngày
- Top môn học có nhiều ca thi nhất

---

## 🧪 GIAI ĐOẠN 7: TESTING & DEBUGGING (1-2 ngày)

### 7.1. Unit Tests

**File**: `tests/examination.test.js`

```javascript
describe('Examination Management', () => {
  test('Create examination session', async () => {
    const sessionId = await ExaminationSession.create({
      period_id: 1,
      subject_id: 1,
      exam_date: '2025-01-15',
      exam_time: '08:00:00'
    });
    
    expect(sessionId).toBeGreaterThan(0);
  });
  
  test('Auto assign invigilators', async () => {
    const invigilators = await autoAssignInvigilators(1);
    expect(invigilators.length).toBeGreaterThan(0);
  });
});
```

### 7.2. Manual Testing Checklist

- [ ] Tạo ca thi mới
- [ ] Chỉnh sửa thông tin ca thi
- [ ] Xóa ca thi
- [ ] Lọc theo kỳ thi
- [ ] Tìm kiếm theo môn học
- [ ] Phân công coi thi tự động
- [ ] Thêm sinh viên vào ca thi
- [ ] Export Excel
- [ ] Xem báo cáo thống kê

---

## 📝 GIAI ĐOẠN 8: DOCUMENTATION (1 ngày)

### 8.1. User Guide

**File**: `docs/EXAMINATION_USER_GUIDE.md`

**Nội dung**:
- Hướng dẫn sử dụng từng chức năng
- Screenshots minh họa
- Video hướng dẫn (optional)

### 8.2. API Documentation

**File**: `docs/EXAMINATION_API.md`

**Format**: OpenAPI/Swagger

---

## 🚀 GIAI ĐOẠN 9: DEPLOYMENT & TRAINING (1 ngày)

### 9.1. Deployment Checklist

- [ ] Backup database trước khi deploy
- [ ] Run migration scripts
- [ ] Test trên staging environment
- [ ] Deploy lên production
- [ ] Verify tất cả chức năng hoạt động
- [ ] Monitor logs và errors

### 9.2. User Training

- Session 1: Overview và workflow
- Session 2: Hands-on practice
- Session 3: Q&A và troubleshooting

---

## 📊 TỔNG KẾT

### Timeline Tổng Thể: **10-14 ngày**

| Giai đoạn | Thời gian | Độ ưu tiên |
|-----------|-----------|------------|
| 1. Database | 1-2 ngày | CAO |
| 2. Models | 1 ngày | CAO |
| 3. Controller | 1 ngày | CAO |
| 4. Views | 2-3 ngày | CAO |
| 5. Routes | 1 ngày | TRUNG BÌNH |
| 6. Advanced Features | 2-3 ngày | TRUNG BÌNH |
| 7. Testing | 1-2 ngày | CAO |
| 8. Documentation | 1 ngày | THẤP |
| 9. Deployment | 1 ngày | CAO |

### Tech Stack

**Backend**:
- Node.js + Express.js
- MySQL2 với prepared statements
- Validation với express-validator

**Frontend**:
- EJS templates
- Vanilla JavaScript
- Font Awesome icons
- Chart.js cho biểu đồ

**Additional Libraries**:
- exceljs - Export Excel
- moment.js - Date formatting
- axios - API calls

---

## 🎯 BEST PRACTICES

### 1. Security
- Validate tất cả input từ client
- Sử dụng prepared statements
- Implement RBAC (Role-Based Access Control)
- Log tất cả critical actions

### 2. Performance
- Index các cột thường dùng để filter
- Implement pagination cho danh sách lớn
- Cache dữ liệu ít thay đổi
- Optimize SQL queries

### 3. UX/UI
- Loading indicators cho async operations
- Toast notifications cho user actions
- Confirm dialogs cho delete operations
- Keyboard shortcuts cho power users

### 4. Maintainability
- Code comments rõ ràng
- Consistent naming conventions
- Separation of concerns
- Reusable components

---

## 📞 SUPPORT & RESOURCES

**Documentation**:
- MySQL Docs: https://dev.mysql.com/doc/
- Express.js Guide: https://expressjs.com/
- EJS Documentation: https://ejs.co/

**Tools**:
- MySQL Workbench - Database design
- Postman - API testing
- VS Code - Development

---

## ✅ NEXT STEPS

1. **Review schema**: Xem file `database/examination_schema.sql`
2. **Import database**: Chạy script import
3. **Create models**: Bắt đầu với ExaminationSession
4. **Build list page**: UI theo hình mẫu
5. **Implement CRUD**: Từng chức năng một

**Bắt đầu ngay**: 
```bash
cd d:\PHAN MEM\quan_ly_giao_vu_new\quan_ly_giao_vu_mvc
node scripts/importExaminationSchema.js
```
