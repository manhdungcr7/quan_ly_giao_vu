# Hệ Thống Phê Duyệt Tài Khoản & Phân Quyền

## 📋 Tổng Quan Ý Tưởng

Xây dựng hệ thống quản lý người dùng với luồng phê duyệt và phân quyền theo cấp bậc:

### Yêu Cầu Chính
1. **Đăng ký tài khoản** → Trạng thái chờ phê duyệt
2. **Quản trị viên phê duyệt** → Tài khoản được kích hoạt
3. **Phân vai trò** → Quản trị viên gán vai trò cho từng tài khoản
4. **Các vai trò hệ thống**:
   - Khách (Guest)
   - Giảng viên (Lecturer)
   - Trưởng khoa (Dean)
   - Phó trưởng khoa (Vice Dean)
   - Ban giám hiệu (Board of Directors)
   - Quản trị viên (Administrator)

---

## 🏗️ Phân Tích Hệ Thống Hiện Tại

### Database Schema Hiện Có

```sql
CREATE TABLE users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(30) NOT NULL UNIQUE,
    email VARCHAR(60) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(60) NOT NULL,
    role_id MEDIUMINT UNSIGNED NOT NULL,
    avatar VARCHAR(255) NULL,
    phone VARCHAR(15) NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,  -- ✅ Đã có
    last_login DATETIME NULL,
    email_verified_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
);

CREATE TABLE roles (
    id MEDIUMINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description VARCHAR(255) NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    level TINYINT UNSIGNED NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Quy Trình Đăng Ký Hiện Tại

**Hiện tại**:
- Chỉ admin có thể tạo tài khoản (qua `/auth/register`)
- Tài khoản được tạo → `is_active = TRUE` ngay lập tức
- Không có luồng phê duyệt

**Vấn Đề**:
- ❌ Người dùng thường không thể tự đăng ký
- ❌ Không có trạng thái "pending approval"
- ❌ Không có giao diện quản lý yêu cầu tài khoản

---

## 🎯 Đề Xuất Giải Pháp

### 1. Cải Tiến Database

#### 1.1 Thêm Trường Vào Bảng `users`

```sql
ALTER TABLE users 
ADD COLUMN account_status ENUM('pending', 'approved', 'rejected', 'suspended') 
    NOT NULL DEFAULT 'pending' 
    AFTER is_active,
ADD COLUMN approved_by INT UNSIGNED NULL 
    AFTER account_status,
ADD COLUMN approved_at DATETIME NULL 
    AFTER approved_by,
ADD COLUMN registration_note TEXT NULL 
    COMMENT 'Lý do đăng ký / ghi chú từ người dùng'
    AFTER approved_at,
ADD COLUMN rejection_reason TEXT NULL 
    COMMENT 'Lý do từ chối (nếu có)'
    AFTER registration_note,
ADD INDEX idx_account_status (account_status),
ADD CONSTRAINT fk_users_approved_by 
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL;
```

**Giải thích các trạng thái**:
| Status | Mô tả | `is_active` | Có thể đăng nhập? |
|--------|-------|-------------|-------------------|
| `pending` | Chờ phê duyệt | `FALSE` | ❌ Không |
| `approved` | Đã phê duyệt | `TRUE` | ✅ Có |
| `rejected` | Bị từ chối | `FALSE` | ❌ Không |
| `suspended` | Bị đình chỉ | `FALSE` | ❌ Không |

#### 1.2 Cập Nhật Bảng `roles`

```sql
-- Thêm trường priority để xác định thứ tự phân cấp
ALTER TABLE roles 
ADD COLUMN priority INT UNSIGNED NOT NULL DEFAULT 100 
    COMMENT 'Số càng nhỏ càng cao cấp (1 = cao nhất)'
    AFTER level,
ADD COLUMN can_approve_users BOOLEAN NOT NULL DEFAULT FALSE
    COMMENT 'Vai trò này có quyền phê duyệt tài khoản mới không'
    AFTER priority,
ADD COLUMN can_assign_roles BOOLEAN NOT NULL DEFAULT FALSE
    COMMENT 'Vai trò này có quyền phân quyền không'
    AFTER can_approve_users;
```

#### 1.3 Seed Data Vai Trò Mới

```sql
-- Xóa và tạo lại roles với cấu trúc mới
TRUNCATE TABLE roles;

INSERT INTO roles 
(name, display_name, description, level, priority, can_approve_users, can_assign_roles, is_active) 
VALUES
('administrator', 'Quản trị viên', 
 'Quản trị toàn hệ thống, phê duyệt tài khoản, phân quyền', 
 100, 1, TRUE, TRUE, TRUE),
 
('board_of_directors', 'Ban giám hiệu', 
 'Lãnh đạo cấp cao, có quyền phê duyệt một số tài khoản', 
 90, 2, TRUE, FALSE, TRUE),
 
('dean', 'Trưởng khoa', 
 'Quản lý khoa, có quyền phê duyệt giảng viên thuộc khoa', 
 80, 3, TRUE, FALSE, TRUE),
 
('vice_dean', 'Phó trưởng khoa', 
 'Hỗ trợ trưởng khoa, quyền hạn giới hạn hơn', 
 70, 4, FALSE, FALSE, TRUE),
 
('lecturer', 'Giảng viên', 
 'Giảng viên, quản lý lớp học và điểm số', 
 50, 5, FALSE, FALSE, TRUE),
 
('staff', 'Cán bộ', 
 'Nhân viên hành chính', 
 40, 6, FALSE, FALSE, TRUE),
 
('guest', 'Khách', 
 'Quyền xem hạn chế, không thể thao tác', 
 10, 10, FALSE, FALSE, TRUE);
```

---

### 2. Luồng Đăng Ký Mới

#### 2.1 Quy Trình

```
┌──────────────────┐
│ Người dùng mới   │
│ truy cập trang   │
│ đăng ký công khai│
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────────┐
│ Form đăng ký (không cần đăng nhập)   │
│ - Tên đăng nhập                       │
│ - Email                               │
│ - Mật khẩu                            │
│ - Họ tên đầy đủ                       │
│ - Số điện thoại (tuỳ chọn)           │
│ - Ghi chú đăng ký (lý do, vai trò    │
│   mong muốn...)                       │
└────────┬─────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────┐
│ Tạo tài khoản với:                     │
│ - account_status = 'pending'           │
│ - is_active = FALSE                    │
│ - role_id = NULL hoặc 'guest'          │
│ - Gửi email thông báo đến admin       │
└────────┬───────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────┐
│ Thông báo cho người dùng:              │
│ "Tài khoản đã được tạo. Vui lòng chờ   │
│  quản trị viên phê duyệt."             │
└────────────────────────────────────────┘

         │
         ▼
┌────────────────────────────────────────┐
│ ADMIN: Xem danh sách tài khoản pending│
│ - Hiển thị thông tin đăng ký          │
│ - Xem ghi chú từ người dùng           │
│ - Kiểm tra email, tên                 │
└────────┬───────────────────────────────┘
         │
         ├─────────────┬─────────────┐
         │             │             │
         ▼             ▼             ▼
    ┌────────┐   ┌────────┐   ┌────────┐
    │ Phê    │   │ Từ chối│   │ Tạm    │
    │ duyệt  │   │        │   │ hoãn   │
    └────┬───┘   └───┬────┘   └────────┘
         │           │
         ▼           ▼
┌─────────────┐ ┌──────────────┐
│ - Chọn role │ │ - Nhập lý do │
│ - Kích hoạt │ │   từ chối    │
│ is_active   │ │ - Gửi email  │
│ = TRUE      │ │   thông báo  │
│ - Gửi email │ └──────────────┘
│   chào mừng │
└─────────────┘
```

#### 2.2 Email Template

**Khi đăng ký**:
```
Chào [Họ tên],

Tài khoản của bạn đã được tạo thành công và đang chờ phê duyệt từ quản trị viên.

Thông tin tài khoản:
- Tên đăng nhập: [username]
- Email: [email]

Bạn sẽ nhận được email thông báo khi tài khoản được phê duyệt.

Trân trọng,
Hệ thống Quản lý Giáo vụ - Khoa An ninh điều tra
```

**Khi được phê duyệt**:
```
Chào [Họ tên],

Tài khoản của bạn đã được phê duyệt!

Thông tin đăng nhập:
- Tên đăng nhập: [username]
- Vai trò: [role_display_name]
- Link đăng nhập: [domain]/auth/login

Vui lòng đăng nhập và bắt đầu sử dụng hệ thống.

Trân trọng,
Quản trị viên: [admin_name]
```

**Khi bị từ chối**:
```
Chào [Họ tên],

Rất tiếc, yêu cầu tạo tài khoản của bạn đã bị từ chối.

Lý do: [rejection_reason]

Nếu bạn cho rằng đây là nhầm lẫn, vui lòng liên hệ:
Email: admin@khoa-anninh.edu.vn
Điện thoại: [SĐT]

Trân trọng,
Hệ thống Quản lý Giáo vụ
```

---

### 3. Giao Diện Quản Lý

#### 3.1 Trang Đăng Ký Công Khai

**Route**: `GET /auth/register-public` (không cần đăng nhập)

**Form Fields**:
```html
<form method="POST" action="/auth/register-public">
  <input type="text" name="username" required placeholder="Tên đăng nhập">
  <input type="email" name="email" required placeholder="Email">
  <input type="password" name="password" required placeholder="Mật khẩu">
  <input type="password" name="confirm_password" required placeholder="Xác nhận mật khẩu">
  <input type="text" name="full_name" required placeholder="Họ và tên đầy đủ">
  <input type="tel" name="phone" placeholder="Số điện thoại (tuỳ chọn)">
  <textarea name="registration_note" 
            placeholder="Lý do đăng ký, vai trò mong muốn (VD: Tôi là giảng viên khoa CNTT)"></textarea>
  <button type="submit">Đăng ký</button>
</form>
```

#### 3.2 Trang Quản Lý Tài Khoản Chờ Duyệt (Admin)

**Route**: `GET /admin/users/pending` (chỉ admin)

**Giao diện**:
```
┌─────────────────────────────────────────────────────────────┐
│ QUẢN LÝ TÀI KHOẢN CHỜ PHÊ DUYỆT                             │
├─────────────────────────────────────────────────────────────┤
│ [Filter: Tất cả ▼] [Tìm kiếm: ___________] [Tìm]           │
├──────┬─────────────┬─────────────┬──────────┬──────────────┤
│ STT  │ Tên đăng    │ Họ tên      │ Email    │ Ngày đăng ký │
│      │ nhập        │             │          │ Thao tác     │
├──────┼─────────────┼─────────────┼──────────┼──────────────┤
│ 1    │ nguyenvana  │ Nguyễn Văn A│ a@x.com  │ 10/10/2025   │
│      │ [Xem chi tiết]  [Phê duyệt]  [Từ chối]              │
├──────┼─────────────┼─────────────┼──────────┼──────────────┤
│ 2    │ tranthib    │ Trần Thị B  │ b@x.com  │ 09/10/2025   │
│      │ [Xem chi tiết]  [Phê duyệt]  [Từ chối]              │
└──────┴─────────────┴─────────────┴──────────┴──────────────┘
```

**Modal Phê Duyệt**:
```html
<div class="modal" id="approveModal">
  <h3>Phê duyệt tài khoản: [username]</h3>
  
  <div class="info">
    <p><strong>Họ tên:</strong> [full_name]</p>
    <p><strong>Email:</strong> [email]</p>
    <p><strong>Ghi chú đăng ký:</strong> [registration_note]</p>
  </div>
  
  <form method="POST" action="/admin/users/approve/:id">
    <label>Chọn vai trò:</label>
    <select name="role_id" required>
      <option value="">-- Chọn vai trò --</option>
      <option value="5">Giảng viên</option>
      <option value="6">Cán bộ</option>
      <option value="7">Khách</option>
      ...
    </select>
    
    <label>Ghi chú (tuỳ chọn):</label>
    <textarea name="approval_note"></textarea>
    
    <button type="submit" class="btn-success">Phê duyệt</button>
    <button type="button" class="btn-secondary" data-dismiss="modal">Hủy</button>
  </form>
</div>
```

**Modal Từ Chối**:
```html
<div class="modal" id="rejectModal">
  <h3>Từ chối tài khoản: [username]</h3>
  
  <form method="POST" action="/admin/users/reject/:id">
    <label>Lý do từ chối: <span class="required">*</span></label>
    <textarea name="rejection_reason" required 
              placeholder="VD: Email không hợp lệ, không thuộc đơn vị..."></textarea>
    
    <label>
      <input type="checkbox" name="send_email" value="1" checked>
      Gửi email thông báo cho người dùng
    </label>
    
    <button type="submit" class="btn-danger">Từ chối</button>
    <button type="button" class="btn-secondary" data-dismiss="modal">Hủy</button>
  </form>
</div>
```

#### 3.3 Dashboard Admin - Widget Thông Báo

```html
<div class="widget widget-pending-users">
  <div class="widget-header">
    <i class="fas fa-user-clock"></i>
    <h3>Tài khoản chờ duyệt</h3>
  </div>
  <div class="widget-body">
    <div class="stat-number">[số lượng]</div>
    <a href="/admin/users/pending" class="widget-link">
      Xem danh sách →
    </a>
  </div>
</div>
```

---

### 4. Controller & Route

#### 4.1 Public Registration Controller

**File**: `app/controllers/PublicRegistrationController.js`

```javascript
const db = require('../../config/database');
const bcrypt = require('bcrypt');
const mailer = require('../../utils/mailer'); // Tạo utility gửi email

class PublicRegistrationController {
    
    // Hiển thị form đăng ký công khai
    async showRegisterForm(req, res) {
        res.render('auth/register-public', {
            title: 'Đăng ký tài khoản',
            error: req.flash('error'),
            success: req.flash('success'),
            formData: req.session.formData || {}
        });
        delete req.session.formData;
    }
    
    // Xử lý đăng ký
    async handleRegister(req, res) {
        try {
            const { username, email, password, confirm_password, full_name, phone, registration_note } = req.body;
            
            // Validation
            if (!username || !email || !password || !full_name) {
                req.flash('error', 'Vui lòng nhập đầy đủ thông tin bắt buộc');
                req.session.formData = req.body;
                return res.redirect('/auth/register-public');
            }
            
            if (password !== confirm_password) {
                req.flash('error', 'Mật khẩu xác nhận không khớp');
                req.session.formData = req.body;
                return res.redirect('/auth/register-public');
            }
            
            if (password.length < 8) {
                req.flash('error', 'Mật khẩu phải có ít nhất 8 ký tự');
                req.session.formData = req.body;
                return res.redirect('/auth/register-public');
            }
            
            // Check duplicate
            const existingUser = await db.findOne(
                'SELECT id FROM users WHERE username = ? OR email = ?',
                [username, email]
            );
            
            if (existingUser) {
                req.flash('error', 'Tên đăng nhập hoặc email đã tồn tại');
                req.session.formData = req.body;
                return res.redirect('/auth/register-public');
            }
            
            // Hash password
            const password_hash = await bcrypt.hash(password, 12);
            
            // Get guest role as default
            const guestRole = await db.findOne('SELECT id FROM roles WHERE name = ? LIMIT 1', ['guest']);
            
            // Insert user with pending status
            const result = await db.insert(
                `INSERT INTO users 
                (username, email, password_hash, full_name, phone, role_id, 
                 account_status, is_active, registration_note, created_at)
                VALUES (?, ?, ?, ?, ?, ?, 'pending', FALSE, ?, NOW())`,
                [username, email, password_hash, full_name, phone || null, guestRole.id, registration_note || null]
            );
            
            if (result.insertId) {
                // Gửi email thông báo cho admin
                await this.notifyAdminNewRegistration({
                    id: result.insertId,
                    username,
                    email,
                    full_name,
                    registration_note
                });
                
                // Gửi email xác nhận cho người dùng
                await mailer.sendRegistrationPending({
                    to: email,
                    full_name,
                    username
                });
                
                req.flash('success', 
                    'Đăng ký thành công! Tài khoản của bạn đang chờ phê duyệt. ' +
                    'Bạn sẽ nhận được email thông báo khi tài khoản được kích hoạt.'
                );
                return res.redirect('/auth/login');
            }
            
        } catch (error) {
            console.error('[PublicRegistration] Error:', error);
            req.flash('error', 'Đã xảy ra lỗi. Vui lòng thử lại sau.');
            req.session.formData = req.body;
            return res.redirect('/auth/register-public');
        }
    }
    
    async notifyAdminNewRegistration(user) {
        try {
            // Get all admin emails
            const admins = await db.findMany(
                `SELECT u.email, u.full_name 
                 FROM users u 
                 JOIN roles r ON u.role_id = r.id 
                 WHERE r.name = 'administrator' AND u.is_active = TRUE`
            );
            
            for (const admin of admins) {
                await mailer.sendNewUserPendingNotification({
                    to: admin.email,
                    admin_name: admin.full_name,
                    user
                });
            }
        } catch (error) {
            console.error('[PublicRegistration] Notify admin error:', error);
        }
    }
}

module.exports = PublicRegistrationController;
```

#### 4.2 User Approval Controller

**File**: `app/controllers/UserApprovalController.js`

```javascript
const db = require('../../config/database');
const mailer = require('../../utils/mailer');

class UserApprovalController {
    
    // Danh sách tài khoản chờ duyệt
    async listPending(req, res) {
        try {
            const pendingUsers = await db.findMany(
                `SELECT u.id, u.username, u.email, u.full_name, u.phone, 
                        u.registration_note, u.created_at
                 FROM users u
                 WHERE u.account_status = 'pending'
                 ORDER BY u.created_at DESC`
            );
            
            res.render('admin/users/pending', {
                title: 'Tài khoản chờ phê duyệt',
                user: req.session.user,
                pendingUsers,
                success: req.flash('success'),
                error: req.flash('error')
            });
        } catch (error) {
            console.error('[UserApproval] List pending error:', error);
            req.flash('error', 'Không thể tải danh sách tài khoản');
            res.redirect('/dashboard');
        }
    }
    
    // Phê duyệt tài khoản
    async approve(req, res) {
        try {
            const userId = parseInt(req.params.id);
            const { role_id, approval_note } = req.body;
            const adminId = req.session.user.id;
            
            if (!role_id) {
                req.flash('error', 'Vui lòng chọn vai trò cho tài khoản');
                return res.redirect('/admin/users/pending');
            }
            
            // Validate role exists
            const role = await db.findOne('SELECT * FROM roles WHERE id = ? AND is_active = TRUE', [role_id]);
            if (!role) {
                req.flash('error', 'Vai trò không hợp lệ');
                return res.redirect('/admin/users/pending');
            }
            
            // Get user info
            const user = await db.findOne('SELECT * FROM users WHERE id = ?', [userId]);
            if (!user || user.account_status !== 'pending') {
                req.flash('error', 'Tài khoản không tồn tại hoặc đã được xử lý');
                return res.redirect('/admin/users/pending');
            }
            
            // Update user
            await db.update(
                `UPDATE users 
                 SET account_status = 'approved', 
                     is_active = TRUE, 
                     role_id = ?,
                     approved_by = ?,
                     approved_at = NOW()
                 WHERE id = ?`,
                [role_id, adminId, userId]
            );
            
            // Send approval email
            await mailer.sendAccountApproved({
                to: user.email,
                full_name: user.full_name,
                username: user.username,
                role_name: role.display_name,
                admin_name: req.session.user.full_name
            });
            
            req.flash('success', `Đã phê duyệt tài khoản ${user.username}`);
            res.redirect('/admin/users/pending');
            
        } catch (error) {
            console.error('[UserApproval] Approve error:', error);
            req.flash('error', 'Không thể phê duyệt tài khoản');
            res.redirect('/admin/users/pending');
        }
    }
    
    // Từ chối tài khoản
    async reject(req, res) {
        try {
            const userId = parseInt(req.params.id);
            const { rejection_reason, send_email } = req.body;
            
            if (!rejection_reason || rejection_reason.trim().length === 0) {
                req.flash('error', 'Vui lòng nhập lý do từ chối');
                return res.redirect('/admin/users/pending');
            }
            
            // Get user info
            const user = await db.findOne('SELECT * FROM users WHERE id = ?', [userId]);
            if (!user || user.account_status !== 'pending') {
                req.flash('error', 'Tài khoản không tồn tại hoặc đã được xử lý');
                return res.redirect('/admin/users/pending');
            }
            
            // Update user status
            await db.update(
                `UPDATE users 
                 SET account_status = 'rejected', 
                     rejection_reason = ?,
                     approved_by = ?,
                     approved_at = NOW()
                 WHERE id = ?`,
                [rejection_reason, req.session.user.id, userId]
            );
            
            // Send rejection email if requested
            if (send_email === '1') {
                await mailer.sendAccountRejected({
                    to: user.email,
                    full_name: user.full_name,
                    rejection_reason
                });
            }
            
            req.flash('success', `Đã từ chối tài khoản ${user.username}`);
            res.redirect('/admin/users/pending');
            
        } catch (error) {
            console.error('[UserApproval] Reject error:', error);
            req.flash('error', 'Không thể từ chối tài khoản');
            res.redirect('/admin/users/pending');
        }
    }
}

module.exports = UserApprovalController;
```

#### 4.3 Routes

**File**: `app/routes/web.js`

```javascript
const PublicRegistrationController = require('../controllers/PublicRegistrationController');
const UserApprovalController = require('../controllers/UserApprovalController');

const publicRegController = new PublicRegistrationController();
const userApprovalController = new UserApprovalController();

// Public registration (không cần login)
router.get('/auth/register-public', (req, res) => publicRegController.showRegisterForm(req, res));
router.post('/auth/register-public', (req, res) => publicRegController.handleRegister(req, res));

// Admin: Quản lý tài khoản chờ duyệt
router.get('/admin/users/pending', requireAuth, requireAdmin, (req, res) => 
    userApprovalController.listPending(req, res)
);
router.post('/admin/users/approve/:id', requireAuth, requireAdmin, (req, res) => 
    userApprovalController.approve(req, res)
);
router.post('/admin/users/reject/:id', requireAuth, requireAdmin, (req, res) => 
    userApprovalController.reject(req, res)
);
```

---

### 5. Email Service

**File**: `utils/mailer.js`

```javascript
const nodemailer = require('nodemailer');
const config = require('../config/app');

class Mailer {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }
    
    async sendRegistrationPending({ to, full_name, username }) {
        const html = `
            <h2>Chào ${full_name},</h2>
            <p>Tài khoản của bạn đã được tạo thành công và đang chờ phê duyệt từ quản trị viên.</p>
            
            <h3>Thông tin tài khoản:</h3>
            <ul>
                <li><strong>Tên đăng nhập:</strong> ${username}</li>
                <li><strong>Email:</strong> ${to}</li>
            </ul>
            
            <p>Bạn sẽ nhận được email thông báo khi tài khoản được phê duyệt.</p>
            
            <p>Trân trọng,<br>
            Hệ thống Quản lý Giáo vụ - Khoa An ninh điều tra</p>
        `;
        
        return this.send({
            to,
            subject: 'Xác nhận đăng ký tài khoản',
            html
        });
    }
    
    async sendAccountApproved({ to, full_name, username, role_name, admin_name }) {
        const loginUrl = `${process.env.APP_URL || 'http://localhost:3000'}/auth/login`;
        
        const html = `
            <h2>Chào ${full_name},</h2>
            <p>Tài khoản của bạn đã được phê duyệt!</p>
            
            <h3>Thông tin đăng nhập:</h3>
            <ul>
                <li><strong>Tên đăng nhập:</strong> ${username}</li>
                <li><strong>Vai trò:</strong> ${role_name}</li>
                <li><strong>Link đăng nhập:</strong> <a href="${loginUrl}">${loginUrl}</a></li>
            </ul>
            
            <p>Vui lòng đăng nhập và bắt đầu sử dụng hệ thống.</p>
            
            <p>Trân trọng,<br>
            Quản trị viên: ${admin_name}</p>
        `;
        
        return this.send({
            to,
            subject: 'Tài khoản đã được phê duyệt',
            html
        });
    }
    
    async sendAccountRejected({ to, full_name, rejection_reason }) {
        const html = `
            <h2>Chào ${full_name},</h2>
            <p>Rất tiếc, yêu cầu tạo tài khoản của bạn đã bị từ chối.</p>
            
            <h3>Lý do:</h3>
            <p>${rejection_reason}</p>
            
            <p>Nếu bạn cho rằng đây là nhầm lẫn, vui lòng liên hệ:</p>
            <ul>
                <li><strong>Email:</strong> admin@khoa-anninh.edu.vn</li>
                <li><strong>Điện thoại:</strong> [SĐT văn phòng]</li>
            </ul>
            
            <p>Trân trọng,<br>
            Hệ thống Quản lý Giáo vụ</p>
        `;
        
        return this.send({
            to,
            subject: 'Thông báo về yêu cầu tài khoản',
            html
        });
    }
    
    async sendNewUserPendingNotification({ to, admin_name, user }) {
        const approvalUrl = `${process.env.APP_URL || 'http://localhost:3000'}/admin/users/pending`;
        
        const html = `
            <h2>Chào ${admin_name},</h2>
            <p>Có yêu cầu tạo tài khoản mới cần phê duyệt:</p>
            
            <h3>Thông tin người đăng ký:</h3>
            <ul>
                <li><strong>Tên đăng nhập:</strong> ${user.username}</li>
                <li><strong>Họ tên:</strong> ${user.full_name}</li>
                <li><strong>Email:</strong> ${user.email}</li>
                <li><strong>Ghi chú:</strong> ${user.registration_note || '(Không có)'}</li>
            </ul>
            
            <p><a href="${approvalUrl}">Nhấn vào đây để phê duyệt</a></p>
            
            <p>Hệ thống Quản lý Giáo vụ - Khoa An ninh điều tra</p>
        `;
        
        return this.send({
            to,
            subject: '[Cần phê duyệt] Tài khoản mới đăng ký',
            html
        });
    }
    
    async send({ to, subject, html }) {
        try {
            await this.transporter.sendMail({
                from: `"${config.appName}" <${process.env.SMTP_USER}>`,
                to,
                subject,
                html
            });
            console.log('[Mailer] Email sent to:', to);
        } catch (error) {
            console.error('[Mailer] Send error:', error);
            throw error;
        }
    }
}

module.exports = new Mailer();
```

---

### 6. Middleware Phân Quyền

**File**: `app/middleware/requireAdmin.js`

```javascript
module.exports = function requireAdmin(req, res, next) {
    if (!req.session || !req.session.user) {
        req.flash('error', 'Vui lòng đăng nhập');
        return res.redirect('/auth/login');
    }
    
    const userRoleName = req.session.user.role_name;
    
    if (userRoleName !== 'administrator') {
        req.flash('error', 'Bạn không có quyền truy cập trang này');
        return res.redirect('/dashboard');
    }
    
    next();
};
```

---

### 7. Views

#### 7.1 Form Đăng Ký Công Khai

**File**: `views/auth/register-public.ejs`

```html
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Đăng ký tài khoản - Khoa An ninh điều tra</title>
    <link href="/css/auth.css" rel="stylesheet">
</head>
<body class="auth-page">
    <div class="auth-container">
        <div class="auth-box">
            <div class="auth-header">
                <h1>Đăng ký tài khoản</h1>
                <p>Tạo tài khoản mới để sử dụng hệ thống quản lý giáo vụ</p>
            </div>
            
            <%- include('../partials/alerts') %>
            
            <form method="POST" action="/auth/register-public" class="auth-form">
                <div class="form-group">
                    <label for="username">Tên đăng nhập <span class="required">*</span></label>
                    <input type="text" id="username" name="username" 
                           value="<%= formData.username || '' %>"
                           pattern="[a-zA-Z0-9_]{3,30}"
                           title="Chỉ chấp nhận chữ, số và dấu gạch dưới (3-30 ký tự)"
                           required autofocus>
                    <small>Chỉ chấp nhận chữ, số và dấu gạch dưới (3-30 ký tự)</small>
                </div>
                
                <div class="form-group">
                    <label for="email">Email <span class="required">*</span></label>
                    <input type="email" id="email" name="email" 
                           value="<%= formData.email || '' %>"
                           required>
                    <small>Email sẽ dùng để nhận thông báo và khôi phục mật khẩu</small>
                </div>
                
                <div class="form-group">
                    <label for="full_name">Họ và tên đầy đủ <span class="required">*</span></label>
                    <input type="text" id="full_name" name="full_name" 
                           value="<%= formData.full_name || '' %>"
                           required>
                </div>
                
                <div class="form-group">
                    <label for="phone">Số điện thoại</label>
                    <input type="tel" id="phone" name="phone" 
                           value="<%= formData.phone || '' %>"
                           pattern="[0-9]{10,11}"
                           title="Số điện thoại 10-11 số">
                </div>
                
                <div class="form-group">
                    <label for="password">Mật khẩu <span class="required">*</span></label>
                    <input type="password" id="password" name="password" 
                           minlength="8" required>
                    <small>Tối thiểu 8 ký tự</small>
                </div>
                
                <div class="form-group">
                    <label for="confirm_password">Xác nhận mật khẩu <span class="required">*</span></label>
                    <input type="password" id="confirm_password" name="confirm_password" 
                           minlength="8" required>
                </div>
                
                <div class="form-group">
                    <label for="registration_note">Ghi chú đăng ký</label>
                    <textarea id="registration_note" name="registration_note" rows="3"
                              placeholder="VD: Tôi là giảng viên khoa CNTT, cần tài khoản để quản lý lớp học..."><%= formData.registration_note || '' %></textarea>
                    <small>Vui lòng ghi rõ lý do đăng ký và vai trò mong muốn</small>
                </div>
                
                <button type="submit" class="btn btn-primary btn-block">
                    <i class="fas fa-user-plus"></i> Đăng ký
                </button>
            </form>
            
            <div class="auth-footer">
                <p>Đã có tài khoản? <a href="/auth/login">Đăng nhập</a></p>
            </div>
        </div>
    </div>
    
    <script>
    // Validate password match
    document.querySelector('.auth-form').addEventListener('submit', function(e) {
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm_password').value;
        
        if (password !== confirmPassword) {
            e.preventDefault();
            alert('Mật khẩu xác nhận không khớp');
            document.getElementById('confirm_password').focus();
        }
    });
    </script>
</body>
</html>
```

#### 7.2 Trang Quản Lý Tài Khoản Chờ Duyệt

**File**: `views/admin/users/pending.ejs`

```html
<%- contentFor('css') %>
<link rel="stylesheet" href="/css/users.css">

<%- contentFor('content') %>
<%- include('../../partials/alerts') %>

<div class="page-header">
    <div>
        <h1 class="page-title">Tài khoản chờ phê duyệt</h1>
        <p class="page-subtitle">Quản lý các yêu cầu tạo tài khoản mới</p>
    </div>
    <div class="page-actions">
        <a href="/users" class="btn btn-secondary">
            <i class="fas fa-arrow-left"></i> Quay lại danh sách
        </a>
    </div>
</div>

<% if (pendingUsers && pendingUsers.length > 0) { %>
<div class="table-wrapper">
    <table class="data-table">
        <thead>
            <tr>
                <th style="width:50px">STT</th>
                <th style="width:150px">Tên đăng nhập</th>
                <th>Họ tên</th>
                <th style="width:200px">Email</th>
                <th style="width:120px">Số điện thoại</th>
                <th style="width:130px">Ngày đăng ký</th>
                <th style="width:250px">Thao tác</th>
            </tr>
        </thead>
        <tbody>
            <% pendingUsers.forEach((user, index) => { %>
            <tr>
                <td><%= index + 1 %></td>
                <td><strong><%= user.username %></strong></td>
                <td><%= user.full_name %></td>
                <td><%= user.email %></td>
                <td><%= user.phone || '-' %></td>
                <td><%= new Date(user.created_at).toLocaleDateString('vi-VN') %></td>
                <td class="actions">
                    <button class="btn btn-sm btn-info" 
                            onclick="viewDetails(<%= user.id %>)"
                            title="Xem chi tiết">
                        <i class="fas fa-eye"></i> Chi tiết
                    </button>
                    <button class="btn btn-sm btn-success" 
                            onclick="approveUser(<%= user.id %>, '<%= user.username %>')"
                            title="Phê duyệt">
                        <i class="fas fa-check"></i> Duyệt
                    </button>
                    <button class="btn btn-sm btn-danger" 
                            onclick="rejectUser(<%= user.id %>, '<%= user.username %>')"
                            title="Từ chối">
                        <i class="fas fa-times"></i> Từ chối
                    </button>
                </td>
            </tr>
            <% }) %>
        </tbody>
    </table>
</div>
<% } else { %>
<div class="empty-state">
    <i class="fas fa-inbox fa-3x"></i>
    <p>Không có tài khoản nào chờ phê duyệt</p>
</div>
<% } %>

<!-- Modal Chi tiết -->
<div class="modal" id="detailModal">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">Chi tiết tài khoản</h3>
                <button type="button" class="close" data-dismiss="modal">&times;</button>
            </div>
            <div class="modal-body" id="detailContent">
                <!-- Content loaded by JS -->
            </div>
        </div>
    </div>
</div>

<!-- Modal Phê duyệt -->
<div class="modal" id="approveModal">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">Phê duyệt tài khoản: <span id="approveUsername"></span></h3>
                <button type="button" class="close" data-dismiss="modal">&times;</button>
            </div>
            <form method="POST" id="approveForm">
                <div class="modal-body">
                    <div class="form-group">
                        <label>Chọn vai trò <span class="required">*</span></label>
                        <select name="role_id" required>
                            <option value="">-- Chọn vai trò --</option>
                            <!-- Load from server -->
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Ghi chú (tuỳ chọn)</label>
                        <textarea name="approval_note" rows="3"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="submit" class="btn btn-success">
                        <i class="fas fa-check"></i> Phê duyệt
                    </button>
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Hủy</button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- Modal Từ chối -->
<div class="modal" id="rejectModal">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">Từ chối tài khoản: <span id="rejectUsername"></span></h3>
                <button type="button" class="close" data-dismiss="modal">&times;</button>
            </div>
            <form method="POST" id="rejectForm">
                <div class="modal-body">
                    <div class="form-group">
                        <label>Lý do từ chối <span class="required">*</span></label>
                        <textarea name="rejection_reason" rows="4" required 
                                  placeholder="VD: Email không hợp lệ, không thuộc đơn vị..."></textarea>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" name="send_email" value="1" checked>
                            Gửi email thông báo cho người dùng
                        </label>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="submit" class="btn btn-danger">
                        <i class="fas fa-times"></i> Từ chối
                    </button>
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Hủy</button>
                </div>
            </form>
        </div>
    </div>
</div>

<script src="/js/user-approval.js"></script>
```

---

### 8. Tóm Tắt Các Bước Triển Khai

#### Phase 1: Database (1-2 giờ)
1. Chạy script ALTER TABLE để thêm các trường mới
2. Update seed data cho bảng roles
3. Backup database trước khi thay đổi

#### Phase 2: Backend (3-4 giờ)
1. Tạo `PublicRegistrationController.js`
2. Tạo `UserApprovalController.js`
3. Tạo `utils/mailer.js`
4. Cập nhật routes
5. Tạo middleware `requireAdmin.js`

#### Phase 3: Frontend (2-3 giờ)
1. Tạo view `auth/register-public.ejs`
2. Tạo view `admin/users/pending.ejs`
3. Tạo CSS cho form đăng ký và quản lý
4. Tạo JavaScript xử lý modal

#### Phase 4: Testing (2-3 giờ)
1. Test luồng đăng ký công khai
2. Test phê duyệt/từ chối
3. Test gửi email
4. Test phân quyền

---

### 9. Lợi Ích

✅ **Bảo mật**: Chỉ tài khoản được phê duyệt mới có thể đăng nhập  
✅ **Kiểm soát**: Admin kiểm tra từng tài khoản trước khi kích hoạt  
✅ **Linh hoạt**: Có thể gán vai trò phù hợp ngay khi phê duyệt  
✅ **Minh bạch**: Người dùng biết rõ trạng thái tài khoản qua email  
✅ **Quản lý tốt**: Dashboard hiển thị số lượng tài khoản chờ duyệt  
✅ **Audit trail**: Lưu lại ai phê duyệt, khi nào, lý do gì  

---

### 10. Mở Rộng Tương Lai

1. **Phê duyệt đa cấp**: Trưởng khoa phê duyệt giảng viên thuộc khoa
2. **Tự động phê duyệt**: Email thuộc domain nội bộ → tự động approve
3. **Workflow phức tạp**: Yêu cầu → Trưởng khoa → Ban giám hiệu → Admin
4. **OTP/2FA**: Bảo mật tăng cường khi đăng ký
5. **Dashboard thống kê**: Biểu đồ theo dõi tài khoản đăng ký theo thời gian

---

**Tác giả**: GitHub Copilot  
**Ngày tạo**: 2025-10-11  
**Trạng thái**: 📝 Đề xuất - Chờ triển khai
