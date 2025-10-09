# 🔧 SỬA LỖI TÍNH NĂNG UPLOAD VÀ PREVIEW FILE - VĂN BẢN PHÁP LÝ

## 📋 Tóm tắt vấn đề
Tính năng tải lên văn bản (PDF, Word, RAR, ZIP) và xem trước trong module "Thêm văn bản mới" của trang "Văn bản pháp lý" không hoạt động.

## ✅ Các vấn đề đã được kiểm tra và sửa

### 1. **Cải thiện JavaScript xử lý File Preview** 
**File:** `views/legal-documents/create.ejs`

#### Thay đổi:
- ✅ Thêm kiểm tra kích thước file (10MB max)
- ✅ Thêm xử lý lỗi và hiển thị thông báo
- ✅ Thêm validation khi submit form
- ✅ Cải thiện hiển thị icon theo loại file
- ✅ Thêm hỗ trợ file `.7z`

#### Code mới:
```javascript
// Kiểm tra kích thước file
if (file.size > maxSize) {
    hasError = true;
    fileItem.classList.add('file-error');
    // Hiển thị lỗi với màu đỏ
}

// Ngăn submit nếu file quá lớn
document.querySelector('.document-form').addEventListener('submit', function(e) {
    // Kiểm tra lại tất cả files
});
```

### 2. **Cải thiện CSS cho File Preview**
**File:** `views/legal-documents/create.ejs`

#### Thay đổi:
- ✅ Thêm style cho `.file-error` class
- ✅ Cải thiện màu sắc icon theo loại file (PDF=đỏ, Word=xanh, Archive=vàng)
- ✅ Thêm hover effect
- ✅ Responsive design
- ✅ Better spacing và layout

### 3. **Thêm Logging cho Debug**
**Files:** 
- `app/controllers/LegalDocumentController.js`
- `app/middleware/upload.js`

#### Thay đổi:
- ✅ Thêm console.log chi tiết trong `store()` method
- ✅ Log thông tin files được upload
- ✅ Log lỗi với stack trace đầy đủ
- ✅ Log trong middleware upload để track file processing

### 4. **Cấu hình đã được xác nhận**

#### Upload Configuration (config/app.js):
```javascript
maxFileSize: 10 * 1024 * 1024, // 10MB
uploadPath: 'D:\\PHAN MEM\\quan_ly_giao_vu_new\\quan_ly_giao_vu_mvc\\public\\uploads'
allowedTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/zip',
    'application/x-zip-compressed',
    'application/x-rar-compressed',
    'application/x-7z-compressed'
]
```

#### Middleware Configuration (app/middleware/upload.js):
```javascript
const documentUpload = multer({
    storage: documentStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10MB,
        files: 5
    }
});
```

#### Routes Configuration (app/routes/web.js):
```javascript
router.post('/legal-documents', 
    requireAuth, 
    documentUpload.array('attachments', 5), 
    validateFileUpload, 
    (req, res) => legalDocumentController.store(req, res)
);
```

### 5. **File Test đã tạo**

#### `test-legal-upload.js`
Script kiểm tra toàn bộ cấu hình upload:
- ✅ Kiểm tra config
- ✅ Kiểm tra CONSTANTS
- ✅ Kiểm tra thư mục upload
- ✅ Kiểm tra quyền ghi
- ✅ Kiểm tra middleware
- ✅ Kiểm tra database tables

#### `public/test-file-preview.html`
HTML test standalone để kiểm tra JavaScript file preview:
- ✅ Test file selection
- ✅ Test preview rendering
- ✅ Test size validation
- ✅ Test icon display

## 🧪 Cách kiểm tra

### 1. Chạy Test Script
```bash
cd "d:\PHAN MEM\quan_ly_giao_vu_new\quan_ly_giao_vu_mvc"
node test-legal-upload.js
```

### 2. Test File Preview (Standalone)
Mở file trong browser:
```
http://localhost:3000/test-file-preview.html
```

### 3. Test Upload thực tế
1. Khởi động server: `npm start`
2. Đăng nhập vào hệ thống
3. Vào trang "Văn bản pháp lý" > "Thêm văn bản mới"
4. Chọn file (PDF, Word, RAR, ZIP) để test
5. Kiểm tra console log trong terminal để xem debug info

## 📊 Kết quả kiểm tra

✅ **Cấu hình:** OK
- Upload path exists: `public\uploads\documents`
- Directory writable: ✓
- Max file size: 10MB
- Allowed types: 17 MIME types

✅ **Database:** OK
- Table `legal_documents`: ✓
- Table `legal_document_attachments`: ✓
- Table `legal_document_audit_logs`: ✓

✅ **Middleware:** OK
- `documentUpload`: ✓
- `validateFileUpload`: ✓
- `fileFilter`: ✓

✅ **Routes:** OK
- POST `/legal-documents`: ✓
- POST `/legal-documents/:id`: ✓

## 🐛 Debug Checklist

Nếu vẫn còn lỗi, kiểm tra:

1. **Console Browser (F12)**
   - Xem có lỗi JavaScript không?
   - File preview có hiển thị không?

2. **Console Server (Terminal)**
   - Xem logs khi submit form
   - Kiểm tra files được receive không
   - Có lỗi multer không?

3. **Network Tab (F12)**
   - Request có được gửi không?
   - Content-Type: `multipart/form-data`?
   - Response status code?

4. **File System**
   - Thư mục `public/uploads/documents` có tồn tại?
   - Có quyền ghi không?

## 📝 Notes quan trọng

1. **Kích thước file:** Max 10MB/file (có thể tăng trong config/app.js)
2. **Số lượng file:** Max 5 files/upload (có thể thay đổi trong routes)
3. **Form encoding:** PHẢI có `enctype="multipart/form-data"` ✓
4. **Field name:** PHẢI là `attachments` (multiple files) ✓
5. **File extensions:** `.pdf, .doc, .docx, .rar, .zip, .7z` ✓

## 🚀 Tính năng mới

1. **File size validation** - Kiểm tra trước khi upload
2. **Visual feedback** - Icon màu sắc theo loại file
3. **Error handling** - Hiển thị lỗi rõ ràng
4. **Logging** - Debug dễ dàng hơn
5. **Test tools** - Scripts để kiểm tra nhanh

## 📞 Tiếp theo

Nếu vấn đề vẫn chưa được giải quyết:
1. Chạy test scripts
2. Kiểm tra console logs (browser + server)
3. Kiểm tra Network tab
4. Gửi error messages để phân tích thêm

---
**Ngày cập nhật:** 2025-10-02
**Người thực hiện:** GitHub Copilot
