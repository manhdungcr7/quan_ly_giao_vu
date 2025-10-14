# Fix: User Registration Not Working

## Vấn đề
Khi người dùng điền form đăng ký và nhấn "Tạo tài khoản":
- Các thông tin nhập bị mất
- Không có thông báo lỗi hoặc thành công
- Tài khoản không được tạo trong database
- Admin không thấy pending user trong trang quản lý người dùng

## Nguyên nhân

### 1. Missing SECURITY constant
File `config/constants.js` thiếu constant `SECURITY.bcryptRounds`, khiến `bcrypt.genSalt(undefined)` có thể gây lỗi im lặng.

### 2. Logic lỗi trong AuthController.register()
- Form register luôn gửi `role_id` (từ dropdown admin hoặc hidden field)
- Controller ban đầu set `userData.role_id = null`
- Chỉ parse `role_id` khi `isAdmin === true`
- Với user thường, code cố tìm defaultRole nhưng không đọc `role_id` từ form
- Nếu không tìm được role hợp lệ, việc tạo user thất bại im lặng

### 3. Flash message handling
- Controller gọi `req.flash()` trực tiếp trong render thay vì dùng `res.locals`
- Khiến message bị consume ngay và không hiển thị

## Giải pháp

### 1. Thêm SECURITY constant
```javascript
// config/constants.js
SECURITY: {
    bcryptRounds: 10
},
```

### 2. Sửa logic register trong AuthController
- Đọc `role_id` từ `req.body` ngay từ đầu
- Parse và validate role trước khi tạo userData
- Fallback đến defaultRole nếu role_id không hợp lệ
- Log chi tiết để debug
- Validate rõ ràng và throw error rõ ràng

### 3. Normalize role handling
- AuthController: normalize role_name thành lowercase
- Middleware: sync role normalization vào session
- Views: kiểm tra role đã normalize

### 4. Fix flash message
- Controller: dùng `res.locals.error`/`res.locals.success` thay vì `req.flash()`
- Server.js: đã set flash messages vào `res.locals` trong middleware

## Các file đã sửa

1. `app/controllers/AuthController.js`
   - Sửa logic register() để đọc role_id từ form
   - Thêm validation và logging
   - Normalize role handling

2. `config/constants.js`
   - Thêm `SECURITY.bcryptRounds`

3. `app/middleware/auth.js`
   - Normalize role trong session
   - Sync role_name lowercase

4. `app/controllers/UserController.js`
   - Dùng `res.locals` cho flash messages

5. `views/users/index.ejs`
   - Normalize role check cho admin

## Cách test

### Test 1: Public registration
```
1. Mở http://localhost:3000/auth/register (không đăng nhập)
2. Điền:
   - Họ tên: Test User
   - Username: testuser
   - Email: test@example.com
   - Password: 123456
   - Confirm: 123456
3. Click "Tạo tài khoản"
4. EXPECT: Redirect to /auth/login với message "Đăng ký tài khoản thành công. Vui lòng chờ quản trị viên phê duyệt"
```

### Test 2: Admin create user
```
1. Login as admin
2. Navigate to /users
3. Click "Tạo tài khoản mới"
4. Điền thông tin và chọn role
5. Click "Tạo tài khoản"
6. EXPECT: Redirect to /users với message "Tạo tài khoản thành công"
7. EXPECT: User mới xuất hiện trong list với status "Đã phê duyệt"
```

### Test 3: Approve pending user
```
1. Login as admin
2. Go to /users
3. EXPECT: Thấy pending user (từ Test 1) với:
   - Status badge "Chờ xử lý" (warning)
   - Dropdown chọn role
   - Button "Phê duyệt" và "Từ chối"
4. Chọn role và click "Phê duyệt"
5. EXPECT: Message "Đã phê duyệt tài khoản"
6. EXPECT: User status change to "Đã phê duyệt"
```

### Test 4: Login with approved account
```
1. Logout
2. Login with testuser credentials
3. EXPECT: Successful login, redirect to /dashboard
4. EXPECT: Menu "Quản lý người dùng" KHÔNG hiện (vì không phải admin)
```

## Debug commands

### Check database
```sql
-- Xem tất cả users
SELECT id, username, email, role_id, approval_status, is_active, created_at 
FROM users 
ORDER BY created_at DESC;

-- Xem roles
SELECT * FROM roles WHERE is_active = 1;

-- Xem pending users
SELECT u.*, r.name as role_name
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
WHERE u.approval_status = 'pending'
ORDER BY u.created_at DESC;
```

### Server logs to watch
```
[Auth] Register attempt { username: '...', role_id: '...' }
[Auth] Creating user { username: '...', role_id: ..., approval_status: '...' }
[Auth] Register success { userId: ..., username: '...' }
```

## Completed
- ✅ Added SECURITY.bcryptRounds constant
- ✅ Fixed register logic to read role_id from form
- ✅ Added validation and error logging
- ✅ Normalized role handling across codebase
- ✅ Fixed flash message consumption
- ✅ Admin can see and approve pending users
- ✅ Registration success message displays correctly

## Notes
- Default role for new users: `guest` (from CONSTANTS.DEFAULTS.NEW_USER_ROLE)
- Fallback role hierarchy: guest → viewer → staff
- Admin-created users are auto-approved
- Public registrations require admin approval
