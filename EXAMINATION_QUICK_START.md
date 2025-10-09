# 🚀 QUICK START: PHÁT TRIỂN HỆ THỐNG CÔNG TÁC KHẢO THÍ

## 📋 CHUẨN BỊ

### Files đã có sẵn:
✅ `database/examination_schema.sql` - Database schema
✅ `scripts/importExaminationSchema.js` - Import script  
✅ `EXAMINATION_DEVELOPMENT_ROADMAP.md` - Lộ trình chi tiết
✅ `EXAMINATION_DEVELOPMENT_ADVICE.md` - Góp ý kỹ thuật

---

## 🎯 BƯỚC 1: IMPORT DATABASE (5 phút)

```bash
# Khởi động MySQL server trước

# Import schema
cd d:\PHAN MEM\quan_ly_giao_vu_new\quan_ly_giao_vu_mvc
node scripts/importExaminationSchema.js
```

**Kết quả mong đợi**:
```
✅ Examination schema imported successfully!

📊 Summary:
   • examination_periods: Kỳ thi
   • subjects: Môn học
   • classes: Lớp học
   • examination_sessions: Ca thi
   • examination_invigilators: Phân công coi thi
   • examination_students: Sinh viên dự thi
   • examination_papers: Đề thi
   • examination_attendance: Điểm danh

📝 Sample data inserted:
   • 2 examination periods
   • 4 subjects
   • 4 classes
```

---

## 🏗️ BƯỚC 2: TẠO MODEL (30 phút)

### 2.1. Tạo ExaminationSession Model

Tạo file: `app/models/ExaminationSession.js`

```javascript
const BaseModel = require('./BaseModel');

class ExaminationSession extends BaseModel {
  static tableName = 'examination_sessions';
  static db = require('../../config/database');

  /**
   * Lấy tất cả ca thi với filter
   */
  static async findAll(filters = {}) {
    let query = `
      SELECT 
        es.*,
        ep.name as period_name,
        s.code as subject_code,
        s.name as subject_name,
        c.code as class_code,
        c.name as class_name
      FROM ${this.tableName} es
      LEFT JOIN examination_periods ep ON es.period_id = ep.id
      LEFT JOIN subjects s ON es.subject_id = s.id
      LEFT JOIN classes c ON es.class_id = c.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (filters.period_id) {
      query += ' AND es.period_id = ?';
      params.push(filters.period_id);
    }
    
    if (filters.status) {
      query += ' AND es.status = ?';
      params.push(filters.status);
    }
    
    if (filters.search) {
      query += ' AND (es.exam_name LIKE ? OR s.name LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }
    
    query += ' ORDER BY es.exam_date DESC, es.exam_time ASC';
    
    const [rows] = await this.db.query(query, params);
    return rows;
  }

  /**
   * Lấy một ca thi theo ID
   */
  static async findById(id) {
    const query = `
      SELECT 
        es.*,
        ep.name as period_name,
        s.code as subject_code,
        s.name as subject_name,
        c.code as class_code,
        c.name as class_name
      FROM ${this.tableName} es
      LEFT JOIN examination_periods ep ON es.period_id = ep.id
      LEFT JOIN subjects s ON es.subject_id = s.id
      LEFT JOIN classes c ON es.class_id = c.id
      WHERE es.id = ?
    `;
    
    const [rows] = await this.db.query(query, [id]);
    return rows[0] || null;
  }

  /**
   * Tạo ca thi mới
   */
  static async create(data) {
    const query = `
      INSERT INTO ${this.tableName} 
      (period_id, subject_id, class_id, exam_code, exam_name, 
       exam_date, exam_time, duration, room, student_count, 
       expected_copies, link, exam_type, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
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

  /**
   * Cập nhật ca thi
   */
  static async update(id, data) {
    const updates = [];
    const params = [];
    
    Object.keys(data).forEach(key => {
      updates.push(`${key} = ?`);
      params.push(data[key]);
    });
    
    params.push(id);
    
    const query = `UPDATE ${this.tableName} SET ${updates.join(', ')} WHERE id = ?`;
    await this.db.query(query, params);
  }

  /**
   * Xóa ca thi
   */
  static async delete(id) {
    const query = `DELETE FROM ${this.tableName} WHERE id = ?`;
    await this.db.query(query, [id]);
  }
}

module.exports = ExaminationSession;
```

---

## 🎨 BƯỚC 3: CẬP NHẬT CONTROLLER (30 phút)

Cập nhật file: `app/controllers/ExaminationController.js`

```javascript
const ExaminationSession = require('../models/ExaminationSession');

class ExaminationController {
  /**
   * Trang danh sách ca thi (sẽ thay thế placeholder)
   */
  async index(req, res) {
    try {
      const filters = {
        period_id: req.query.period_id,
        status: req.query.status,
        search: req.query.search
      };
      
      const sessions = await ExaminationSession.findAll(filters);
      
      // TODO: Load periods cho dropdown filter
      const periods = []; // await ExaminationPeriod.findAll();
      
      res.render('examination/list', {
        title: 'Công tác khảo thí',
        user: req.session.user,
        sessions,
        periods,
        filters
      });
    } catch (error) {
      console.error('Error loading examination list:', error);
      res.status(500).render('error', {
        message: 'Không thể tải danh sách ca thi',
        error: error
      });
    }
  }

  /**
   * Form tạo ca thi mới
   */
  async create(req, res) {
    try {
      // TODO: Load data cho dropdowns
      res.render('examination/form', {
        title: 'Tạo ca thi mới',
        user: req.session.user,
        session: null
      });
    } catch (error) {
      console.error('Error loading create form:', error);
      res.status(500).render('error', {
        message: 'Không thể tải form',
        error: error
      });
    }
  }

  /**
   * Lưu ca thi mới
   */
  async store(req, res) {
    try {
      const sessionId = await ExaminationSession.create(req.body);
      
      res.json({
        success: true,
        message: 'Tạo ca thi thành công',
        session_id: sessionId
      });
    } catch (error) {
      console.error('Error creating session:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi tạo ca thi',
        error: error.message
      });
    }
  }

  /**
   * Chi tiết ca thi
   */
  async show(req, res) {
    try {
      const session = await ExaminationSession.findById(req.params.id);
      
      if (!session) {
        return res.status(404).render('error', {
          message: 'Không tìm thấy ca thi'
        });
      }
      
      res.render('examination/detail', {
        title: 'Chi tiết ca thi',
        user: req.session.user,
        session
      });
    } catch (error) {
      console.error('Error loading session detail:', error);
      res.status(500).render('error', {
        message: 'Không thể tải thông tin ca thi',
        error: error
      });
    }
  }

  /**
   * Form chỉnh sửa
   */
  async edit(req, res) {
    try {
      const session = await ExaminationSession.findById(req.params.id);
      
      if (!session) {
        return res.status(404).render('error', {
          message: 'Không tìm thấy ca thi'
        });
      }
      
      res.render('examination/form', {
        title: 'Chỉnh sửa ca thi',
        user: req.session.user,
        session
      });
    } catch (error) {
      console.error('Error loading edit form:', error);
      res.status(500).render('error', {
        message: 'Không thể tải form chỉnh sửa',
        error: error
      });
    }
  }

  /**
   * Cập nhật ca thi
   */
  async update(req, res) {
    try {
      await ExaminationSession.update(req.params.id, req.body);
      
      res.json({
        success: true,
        message: 'Cập nhật ca thi thành công'
      });
    } catch (error) {
      console.error('Error updating session:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi cập nhật ca thi',
        error: error.message
      });
    }
  }

  /**
   * Xóa ca thi
   */
  async destroy(req, res) {
    try {
      await ExaminationSession.delete(req.params.id);
      
      res.json({
        success: true,
        message: 'Xóa ca thi thành công'
      });
    } catch (error) {
      console.error('Error deleting session:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi xóa ca thi',
        error: error.message
      });
    }
  }
}

module.exports = new ExaminationController();
```

---

## 🖼️ BƯỚC 4: TẠO VIEW DANH SÁCH (45 phút)

Tạo file: `views/examination/list.ejs`

```ejs
<%- include('../layouts/main') %>

<div class="page-header">
  <h1 class="page-title">
    <i class="fas fa-clipboard-check"></i>
    Công tác khảo thí
  </h1>
  <div class="page-actions">
    <a href="/examination/create" class="btn btn-primary">
      <i class="fas fa-plus"></i>
      Thêm ca thi
    </a>
  </div>
</div>

<!-- Filter Toolbar -->
<div class="filter-toolbar">
  <form method="GET" action="/examination" class="filter-form">
    <div class="filter-group">
      <label>Kỳ thi</label>
      <select name="period_id" class="form-control">
        <option value="">Tất cả</option>
        <% periods.forEach(period => { %>
          <option value="<%= period.id %>" <%= filters.period_id == period.id ? 'selected' : '' %>>
            <%= period.name %>
          </option>
        <% }) %>
      </select>
    </div>

    <div class="filter-group">
      <label>Trạng thái</label>
      <select name="status" class="form-control">
        <option value="">Tất cả</option>
        <option value="scheduled" <%= filters.status === 'scheduled' ? 'selected' : '' %>>Đã lên lịch</option>
        <option value="in_progress" <%= filters.status === 'in_progress' ? 'selected' : '' %>>Đang thi</option>
        <option value="completed" <%= filters.status === 'completed' ? 'selected' : '' %>>Đã hoàn thành</option>
      </select>
    </div>

    <div class="filter-group flex-grow">
      <label>Tìm kiếm</label>
      <input type="text" name="search" class="form-control" 
             placeholder="Tìm theo tên ca thi, môn học..." 
             value="<%= filters.search || '' %>">
    </div>

    <div class="filter-actions">
      <button type="submit" class="btn btn-primary">
        <i class="fas fa-search"></i> Lọc
      </button>
      <a href="/examination" class="btn btn-secondary">
        <i class="fas fa-times"></i> Xóa lọc
      </a>
    </div>
  </form>
</div>

<!-- Data Table -->
<div class="card">
  <div class="card-body">
    <div class="table-responsive">
      <table class="table table-hover">
        <thead>
          <tr>
            <th>Tên ca thi</th>
            <th>Mã môn</th>
            <th>Lớp</th>
            <th>Môn học</th>
            <th class="text-center">SL SV</th>
            <th class="text-center">Dự án</th>
            <th>Ngày thi</th>
            <th>Link</th>
            <th class="text-center">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <% if (sessions.length === 0) { %>
            <tr>
              <td colspan="9" class="text-center text-muted py-5">
                <i class="fas fa-inbox fa-3x mb-3"></i>
                <p>Chưa có ca thi nào</p>
              </td>
            </tr>
          <% } else { %>
            <% sessions.forEach(session => { %>
              <tr>
                <td>
                  <a href="/examination/<%= session.id %>">
                    <%= session.exam_name || session.subject_name %>
                  </a>
                </td>
                <td><%= session.subject_code %></td>
                <td><%= session.class_code %></td>
                <td><%= session.subject_name %></td>
                <td class="text-center"><%= session.student_count %></td>
                <td class="text-center"><%= session.expected_copies || '-' %></td>
                <td>
                  <%= new Date(session.exam_date).toLocaleDateString('vi-VN') %>
                  <small class="text-muted d-block">
                    <%= session.exam_time.substring(0, 5) %>
                  </small>
                </td>
                <td>
                  <% if (session.link) { %>
                    <a href="<%= session.link %>" target="_blank" class="btn btn-sm btn-link">
                      <i class="fas fa-external-link-alt"></i>
                    </a>
                  <% } else { %>
                    -
                  <% } %>
                </td>
                <td class="text-center">
                  <div class="btn-group">
                    <a href="/examination/<%= session.id %>/edit" 
                       class="btn btn-sm btn-outline-primary" 
                       title="Sửa">
                      <i class="fas fa-edit"></i>
                    </a>
                    <button onclick="deleteSession(<%= session.id %>)" 
                            class="btn btn-sm btn-outline-danger" 
                            title="Xóa">
                      <i class="fas fa-trash"></i>
                    </button>
                    <button onclick="backupSession(<%= session.id %>)" 
                            class="btn btn-sm btn-outline-success" 
                            title="Sao lưu">
                      <i class="fas fa-save"></i>
                    </button>
                  </div>
                </td>
              </tr>
            <% }) %>
          <% } %>
        </tbody>
      </table>
    </div>
  </div>
</div>

<script>
async function deleteSession(id) {
  if (!confirm('Bạn có chắc chắn muốn xóa ca thi này?')) return;
  
  try {
    const response = await fetch(`/examination/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const data = await response.json();
    
    if (data.success) {
      alert('Xóa thành công!');
      location.reload();
    } else {
      alert('Lỗi: ' + data.message);
    }
  } catch (error) {
    alert('Lỗi khi xóa ca thi');
    console.error(error);
  }
}

async function backupSession(id) {
  alert('Chức năng sao lưu đang được phát triển');
}
</script>

<style>
.filter-toolbar {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.filter-form {
  display: flex;
  gap: 15px;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  min-width: 150px;
}

.filter-group.flex-grow {
  flex-grow: 1;
}

.filter-group label {
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 5px;
  color: #6c757d;
}

.filter-actions {
  display: flex;
  gap: 10px;
}
</style>
```

---

## 🔌 BƯỚC 5: CẬP NHẬT ROUTES (10 phút)

Cập nhật file: `app/routes/web.js`

```javascript
// Examination routes - Thay thế route cũ
router.get('/examination', requireAuth, (req, res) => ExaminationController.index(req, res));
router.get('/examination/create', requireAuth, (req, res) => ExaminationController.create(req, res));
router.post('/examination', requireAuth, (req, res) => ExaminationController.store(req, res));
router.get('/examination/:id', requireAuth, (req, res) => ExaminationController.show(req, res));
router.get('/examination/:id/edit', requireAuth, (req, res) => ExaminationController.edit(req, res));
router.put('/examination/:id', requireAuth, (req, res) => ExaminationController.update(req, res));
router.delete('/examination/:id', requireAuth, (req, res) => ExaminationController.destroy(req, res));
```

---

## ✅ BƯỚC 6: TEST (15 phút)

```bash
# Khởi động server
cd d:\PHAN MEM\quan_ly_giao_vu_new\quan_ly_giao_vu_mvc
node server.js

# Truy cập: http://localhost:3000/examination
```

**Checklist**:
- [ ] Trang danh sách hiển thị
- [ ] Bộ lọc hoạt động
- [ ] Tìm kiếm hoạt động
- [ ] Click vào "Thêm ca thi"
- [ ] Xóa ca thi hoạt động

---

## 📊 TIẾN ĐỘ

**Sau quick start (~ 2.5 giờ)**:
- ✅ Database schema imported
- ✅ ExaminationSession model created
- ✅ Controller với CRUD operations
- ✅ List view với filter/search
- ✅ Routes configured

**Còn lại**:
- [ ] Form tạo/sửa ca thi
- [ ] Chi tiết ca thi
- [ ] Phân công coi thi
- [ ] Export Excel
- [ ] Statistics dashboard

---

## 🎯 NEXT STEPS

1. **Tạo thêm models**:
   - ExaminationPeriod
   - Subject
   - Class

2. **Hoàn thiện form tạo/sửa**:
   - Dropdowns cho các trường
   - Date/time pickers
   - Validation

3. **Tính năng nâng cao**:
   - Phân công coi thi tự động
   - Import/Export Excel
   - Email notifications

---

## 📚 TÀI LIỆU THAM KHẢO

- `EXAMINATION_DEVELOPMENT_ROADMAP.md` - Lộ trình chi tiết 10-14 ngày
- `EXAMINATION_DEVELOPMENT_ADVICE.md` - Góp ý từ Senior Dev
- `database/examination_schema.sql` - Database schema

---

## 🆘 TROUBLESHOOTING

**Lỗi kết nối database**:
```bash
# Check MySQL đang chạy
mysql -u root -p

# Check .env file
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=education_db
```

**Lỗi module not found**:
```bash
npm install
```

**Port đang được sử dụng**:
```bash
# Stop process trên port 3000
Get-Process -Name node | Stop-Process -Force
```

---

Good luck! 🚀
