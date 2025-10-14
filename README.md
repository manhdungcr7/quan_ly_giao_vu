# Hệ thống Quản lý Giáo vụ - MVC

Hệ thống quản lý giáo vụ được xây dựng theo mô hình MVC sử dụng Node.js và Express.js.

## Tính năng chính

- **Quản lý người dùng**: Đăng ký, đăng nhập, phân quyền
- **Quản lý cán bộ**: Thông tin cán bộ, phòng ban
- **Quản lý tài liệu**: Tải lên, phân loại, tìm kiếm tài liệu
- **Quản lý tài sản**: Theo dõi tài sản, thiết bị
- **Quản lý dự án**: Lập kế hoạch, theo dõi tiến độ
- **Quản lý lịch trình**: Lịch làm việc, cuộc họp
- **Dashboard**: Thống kê, báo cáo tổng quan

## Công nghệ sử dụng

- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Template Engine**: EJS
- **Frontend**: Bootstrap 5, jQuery
- **Security**: bcryptjs, helmet, express-rate-limit
- **File Upload**: multer
- **Validation**: express-validator

## Cài đặt

### Yêu cầu hệ thống

- Node.js >= 14.0.0
- MySQL >= 5.7
- npm >= 6.0.0

### Bước 1: Clone project

```bash
git clone <repository-url>
cd quan_ly_giao_vu_mvc
```

### Bước 2: Cài đặt dependencies

```bash
npm install
```

### Bước 3: Cấu hình database

1. Tạo database MySQL:
```sql
CREATE DATABASE quan_ly_giao_vu;
```

2. Import schema:
```bash
mysql -u username -p quan_ly_giao_vu < database/schema_optimized.sql
```

3. Cập nhật thông tin database trong `config/database.js`:
```javascript
module.exports = {
    host: 'localhost',
    user: 'your_username',
    password: 'your_password',
    database: 'quan_ly_giao_vu',
    // ...
};
```

### Bước 4: Cấu hình môi trường

Tạo file `.env` từ `.env.example`:
```bash
cp .env.example .env
```

Cập nhật các biến môi trường:
```env
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=quan_ly_giao_vu

# Session
SESSION_SECRET=your_session_secret_key

# File Upload
UPLOAD_MAX_SIZE=10485760
UPLOAD_ALLOWED_TYPES=jpg,jpeg,png,gif,pdf,doc,docx,xls,xlsx
```

### Bước 5: Khởi tạo dữ liệu người dùng

```bash
npm run seed:roles
npm run seed:admin
```

### Bước 6: Chạy ứng dụng

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

Ứng dụng sẽ chạy tại: http://localhost:3000

## Cấu trúc thư mục

```
quan_ly_giao_vu_mvc/
├── app/
│   ├── controllers/        # Controllers xử lý logic nghiệp vụ
│   ├── middleware/         # Middleware cho authentication, validation
│   ├── models/            # Models tương tác với database
│   └── routes/            # Route definitions
├── config/                # Configuration files
├── database/              # Database schema và migrations
├── public/                # Static files (CSS, JS, images)
├── views/                 # EJS templates
├── uploads/               # File uploads directory
├── server.js             # Entry point
└── package.json
```

## API Endpoints

### Authentication
- `POST /auth/login` - Đăng nhập
- `POST /auth/logout` - Đăng xuất
- `POST /auth/change-password` - Đổi mật khẩu

### Users Management
- `GET /api/users` - Lấy danh sách người dùng
- `POST /api/users` - Tạo người dùng mới
- `GET /api/users/:id` - Lấy thông tin người dùng
- `PUT /api/users/:id` - Cập nhật người dùng
- `DELETE /api/users/:id` - Xóa người dùng

### Staff Management
- `GET /api/staff` - Lấy danh sách cán bộ
- `POST /api/staff` - Thêm cán bộ mới
- `PUT /api/staff/:id` - Cập nhật thông tin cán bộ
- `DELETE /api/staff/:id` - Xóa cán bộ

### Documents Management
- `GET /api/documents` - Lấy danh sách tài liệu
- `POST /api/documents` - Tải lên tài liệu mới
- `GET /api/documents/:id` - Tải xuống tài liệu
- `DELETE /api/documents/:id` - Xóa tài liệu

## Database Schema

### Bảng chính

- `users` - Thông tin người dùng
- `staff` - Thông tin cán bộ
- `documents` - Tài liệu
- `assets` - Tài sản
- `projects` - Dự án
- `schedules` - Lịch trình

Chi tiết schema xem tại `database/schema_optimized.sql`

## Bảo mật

- **Password Hashing**: bcryptjs
- **Session Management**: express-session với secure cookies
- **CSRF Protection**: csurf middleware
- **Rate Limiting**: express-rate-limit
- **Input Validation**: express-validator
- **Security Headers**: helmet
- **File Upload Security**: multer với file type validation

## Phân quyền

Hệ thống có 3 loại vai trò chính:
- **admin**: Toàn quyền quản trị hệ thống.
- **faculty_lead**: Lãnh đạo khoa, có quyền phê duyệt và điều phối (giới hạn tối đa 5 tài khoản đang hoạt động).
- **lecturer**: Giảng viên, quản lý lớp học và tài liệu giảng dạy.

> ⚠️  Số lượng tài khoản **faculty_lead** đang hoạt động bị giới hạn tối đa 5 người. Khi đạt giới hạn, cần vô hiệu hóa một tài khoản hiện có trước khi tạo mới.

## Logging

- Application logs: `logs/app.log`
- Error logs: `logs/error.log`
- Access logs: `logs/access.log`

## Testing

Chạy test:
```bash
npm test
```

## Deployment

### Production Setup

1. Set NODE_ENV=production
2. Configure reverse proxy (nginx)
3. Setup process manager (PM2)
4. Configure SSL certificates
5. Setup database backup

### PM2 Deployment

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start ecosystem.config.js

# Monitor
pm2 monit

# Logs
pm2 logs
```

## Troubleshooting

### Lỗi thường gặp

1. **Database connection failed**
   - Kiểm tra thông tin database trong config
   - Đảm bảo MySQL service đang chạy

2. **File upload failed**
   - Kiểm tra quyền write cho thư mục uploads
   - Kiểm tra file size limit

3. **Session not working**
   - Kiểm tra SESSION_SECRET trong .env
   - Kiểm tra cookie settings

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License

This project is licensed under the MIT License.

## Support

Liên hệ hỗ trợ:
- Email: support@example.com
- Phone: +84 123 456 789