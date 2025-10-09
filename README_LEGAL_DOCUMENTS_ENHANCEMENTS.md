# CẬP NHẬT MODULE VĂN BẢN PHÁP LÝ - TỔNG HỢP

## ✅ ĐÃ HOÀN THÀNH

### 1. Database Enhancements
- ✅ Thêm trường `signer_name` (Người ký)
- ✅ Thêm trường `signer_position` (Chức vụ người ký)
- ✅ Thêm trường `version` cho quản lý phiên bản văn bản
- ✅ Cập nhật enum `status` để bao gồm: "Dự thảo", "Còn hiệu lực", "Hết hiệu lực", "Bị thay thế", "Đã hủy"
- ✅ Tạo bảng `legal_document_audit_logs` để ghi nhật ký hoạt động
- ✅ Thêm các trường quản lý phiên bản file: `version`, `is_current`, `replaced_by`, `download_count`
- ✅ Tạo view `v_legal_documents_full` để query dễ dàng hơn
- ✅ Thêm fulltext search indexes cho tìm kiếm nhanh

### 2. Tính năng đã có sẵn từ Documents Module
- ✅ Upload file (PDF, DOCX, RAR/ZIP)
- ✅ Preview file PDF inline
- ✅ Download file với tên gốc
- ✅ Quản lý file đính kèm
- ✅ File type detection và icon display
- ✅ File size validation

## 🔄 ĐANG THỰC HIỆN

### 3. Cập nhật Controller (LegalDocumentController.js)
Cần bổ sung:
- [ ] Audit logging cho mọi thao tác (thêm, sửa, xóa, tải xuống)
- [ ] File version management
- [ ] Download counter
- [ ] Tìm kiếm nâng cao với nhiều tiêu chí

### 4. Cập nhật Views
#### create.ejs & edit.ejs
Cần thêm các trường:
- [ ] Người ký / Chức vụ
- [ ] Trạng thái (bao gồm "Dự thảo" và "Đã hủy")
- [ ] Nội dung tóm tắt (summary)
- [ ] Từ khóa (keywords)
- [ ] Lĩnh vực (subject)
- [ ] Văn bản thay thế (replaced_by)
- [ ] Văn bản liên quan (related_documents)

#### list.ejs
Cần cải tiến:
- [ ] Thêm cột "Người tạo"
- [ ] Thêm cột "Ngày cập nhật"
- [ ] Icon file đính kèm
- [ ] Tooltip hiển thị tóm tắt khi hover
- [ ] Icon thao tác rõ ràng hơn

#### show.ejs
Cần thêm:
- [ ] Hiển thị thông tin người ký
- [ ] Hiển thị lịch sử phiên bản file
- [ ] Hiển thị audit log (ai đã xem, tải xuống)
- [ ] Số lần tải xuống
- [ ] Preview file trực tiếp

## 📋 KẾ HOẠCH TRIỂN KHAI

### Phase 1: Cập nhật Form nhập liệu (15-20 phút)
1. Sửa create.ejs - thêm đầy đủ form fields
2. Sửa edit.ejs - thêm đầy đủ form fields
3. Validation cho các trường mới

### Phase 2: Cập nhật Controller (20-30 phút)
1. Thêm audit logging helper
2. Cập nhật store() - lưu audit log
3. Cập nhật update() - lưu audit log và version
4. Cập nhật destroy() - lưu audit log
5. Cập nhật downloadFile() - tăng counter và audit log
6. Thêm API endpoints: getAuditLogs(), getFileVersions()

### Phase 3: Cải tiến UI (15-20 phút)
1. Cập nhật list.ejs - thêm cột và icon
2. Cập nhật show.ejs - hiển thị đầy đủ thông tin
3. Thêm CSS cho audit log timeline
4. Thêm modal preview file

### Phase 4: Testing (10-15 phút)
1. Test CRUD operations
2. Test file upload/download
3. Test audit logging
4. Test search và filters
5. Test file version management

## 🎯 MỤC TIÊU CỦA CÁC TÍNH NĂNG

### a. Upload & Quản lý file
- Giới hạn: 50MB per file
- Định dạng: PDF, DOCX, RAR, ZIP
- Preview: PDF (inline), DOCX (Google Docs Viewer), RAR/ZIP (download only)
- Quản lý phiên bản: Lưu file cũ, đánh dấu current version

### b. Preview File
- PDF: Xem trực tiếp trong browser
- DOCX: Option để xem qua Google Docs Viewer
- RAR/ZIP: Hiển thị danh sách file bên trong (nếu có thư viện hỗ trợ)
- Toolbar: Zoom in/out, Download, Print

### c. Trạng thái văn bản
- **Dự thảo**: Chưa ban hành, chỉ nội bộ
- **Còn hiệu lực**: Đang áp dụng
- **Hết hiệu lực**: Đã hết thời hạn
- **Bị thay thế**: Có văn bản mới thay thế
- **Đã hủy**: Không còn giá trị

### d. Audit Log
Ghi lại:
- Ai thực hiện (user_id, user_name)
- Thao tác gì (Tạo/Sửa/Xóa/Tải xuống/Xem)
- Khi nào (timestamp)
- Từ đâu (IP address)
- Thay đổi gì (old_values → new_values)

### e. Tìm kiếm nâng cao
Hiện có:
- ✅ Tìm theo số hiệu, tiêu đề, cơ quan
- ✅ Lọc theo loại văn bản
- ✅ Lọc theo trạng thái
- ✅ Lọc theo ngày ban hành

Cần thêm:
- [ ] Tìm theo người tạo
- [ ] Tìm theo người ký
- [ ] Tìm theo từ khóa (keywords)
- [ ] Tìm theo lĩnh vực (subject)
- [ ] Gợi ý từ khóa (autocomplete)

## 🔧 TECHNICAL NOTES

### File Upload Configuration
```javascript
// Giới hạn dung lượng: 50MB
const maxFileSize = 50 * 1024 * 1024;

// Allowed mime types
const allowedMimes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/x-rar-compressed',
  'application/zip',
  'application/x-zip-compressed'
];
```

### Audit Log Function
```javascript
async logActivity(documentId, action, userId, details = {}) {
  const log = {
    document_id: documentId,
    action: action,
    user_id: userId,
    user_name: req.session.user?.username,
    ip_address: req.ip,
    user_agent: req.get('user-agent'),
    old_values: JSON.stringify(details.oldValues),
    new_values: JSON.stringify(details.newValues),
    details: details.message
  };
  
  await db.query(
    'INSERT INTO legal_document_audit_logs SET ?',
    log
  );
}
```

### Version Management
```javascript
// Khi upload file mới thay thế file cũ:
1. Set is_current = 0 cho file cũ
2. Insert file mới với version = max(version) + 1
3. Set replaced_by = new_file_id cho file cũ
4. Log vào audit_logs
```

## 📊 STATUS SUMMARY

**Hoàn thành**: 30%
- ✅ Database schema
- ✅ File upload system (inherited from Documents)
- ✅ Basic CRUD operations

**Còn lại**: 70%
- 🔄 Enhanced form fields
- 🔄 Audit logging
- 🔄 File version management
- 🔄 UI improvements
- 🔄 Advanced search

**Thời gian ước tính**: 60-85 phút để hoàn thành 100%

---
*Updated: 2025-10-01*
