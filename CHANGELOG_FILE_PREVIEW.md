# Changelog - Hệ thống Preview Files

## [1.2.0] - 2025-10-01

### ✨ Tính năng mới

#### **Hỗ trợ đầy đủ Word, PDF và RAR**

- ✅ **Tải lên (Upload):**
  - PDF (`.pdf`)
  - Word (`.doc`, `.docx`)
  - Excel (`.xls`, `.xlsx`)
  - PowerPoint (`.ppt`, `.pptx`)
  - Hình ảnh (`.jpg`, `.png`, `.gif`, `.webp`)
  - Text (`.txt`)
  - File nén (`.zip`, `.rar`, `.7z`)

- ✅ **Xem trước (Preview):**
  - **PDF**: Hiển thị inline với iframe
  - **Hình ảnh**: Hiển thị ảnh full-size
  - **Text**: Hiển thị nội dung với syntax highlighting
  - **Word**: Tùy chọn tải xuống hoặc xem qua Google Docs Viewer
  - **RAR/ZIP**: Thông báo không hỗ trợ + nút tải xuống trực tiếp

#### **Giao diện cải tiến**

- 🎨 **Icon phân loại theo loại file:**
  - PDF: 📕 (màu đỏ)
  - Word: 📘 (màu xanh dương)
  - Excel: 📗 (màu xanh lá)
  - Hình ảnh: 🖼️ (màu tím)
  - File nén: 📦 (màu cam)
  - Text: 📄 (màu xám)

- 💡 **Preview Modal nâng cao:**
  - Hiển thị loại file và hướng dẫn cụ thể
  - Tích hợp Google Docs Viewer cho Word (khi có URL public)
  - Responsive trên mobile

### 🛠️ Sửa lỗi

#### **Path Resolution Security**

- ✅ **Đã sửa:** Lỗi "Đường dẫn không hợp lệ" khi preview/download
  - Nguyên nhân: Validation path sử dụng `process.cwd()` thay vì upload root
  - Giải pháp: Sử dụng `config.upload.uploadPath` làm base directory
  - Thêm logging để debug path rejected

- ✅ **Đã sửa:** Field `size` undefined trong preview-info
  - Nguyên nhân: Dùng `file.size` thay vì `file.file_size`
  - Giải pháp: Map đúng column từ database

#### **File Type Detection**

- ✅ **Cải thiện:** Phát hiện MIME type chính xác hơn
  - Word: Hỗ trợ cả `.doc` (msword) và `.docx` (openxml)
  - RAR: Nhận diện `application/x-rar-compressed`
  - ZIP: Hỗ trợ cả `application/zip` và `application/x-zip-compressed`

### 📦 Thay đổi kỹ thuật

#### **Backend**

**`app/controllers/DocumentController.js`:**

```javascript
// Import config để lấy upload path
const config = require('../../config/app');

// previewFile() - Thêm Word vào danh sách previewable
const previewable = [
  'application/pdf',
  'text/plain',
  'image/png','image/jpeg','image/jpg','image/gif','image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

// Secure path validation
const uploadRoot = path.resolve(config.upload.uploadPath);
const absPath = path.isAbsolute(file.file_path)
  ? path.resolve(file.file_path)
  : path.resolve(process.cwd(), file.file_path);
if (!absPath.startsWith(uploadRoot)) {
  console.warn('Blocked preview outside upload root:', { filePath, absPath, uploadRoot });
  return res.status(400).send('Đường dẫn không hợp lệ');
}
```

**`app/controllers/DocumentController.js` - previewInfo():**

```javascript
// Phân loại file type
let type = 'other';
if (file.mime_type === 'application/pdf') type = 'pdf';
else if (file.mime_type && file.mime_type.startsWith('image/')) type = 'image';
else if (file.mime_type === 'text/plain') type = 'text';
else if (file.mime_type === 'application/msword' || 
         file.mime_type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
  type = 'word';
}
else if (file.mime_type === 'application/x-rar-compressed' || 
         file.mime_type === 'application/zip' || 
         file.mime_type === 'application/x-zip-compressed') {
  type = 'archive';
}

// Trả về thông tin đầy đủ
return res.json({
  success: true,
  filename: file.original_name,
  type,
  size: file.file_size,  // ✅ Sửa từ file.size → file.file_size
  previewable: previewable.includes(file.mime_type),
  content: type === 'text' ? content : null,
  message: type === 'archive' ? 'File nén không hỗ trợ xem trước, vui lòng tải xuống' : null
});
```

**Utility mới:**

- **`app/utils/fileTypeHelper.js`**: Helper functions cho xử lý file types
  - `getFileTypeCategory(mimeType)`: Trả về category
  - `getFileIcon(mimeType)`: Trả về FontAwesome class
  - `isPreviewable(mimeType)`: Check xem có preview được không
  - `getFileTypeName(mimeType)`: Tên người dùng đọc được
  - `formatFileSize(bytes)`: Format size readable

#### **Frontend**

**`views/documents/show.ejs` - Icon logic:**

```javascript
<% 
let iconClass = 'fa-file';
let fileTypeClass = '';
if (file.mime_type) {
  if (file.mime_type === 'application/pdf') {
    iconClass = 'fa-file-pdf';
    fileTypeClass = 'pdf';
  } else if (file.mime_type.includes('word')) {
    iconClass = 'fa-file-word';
    fileTypeClass = 'word';
  } else if (file.mime_type.includes('zip') || file.mime_type.includes('rar')) {
    iconClass = 'fa-file-archive';
    fileTypeClass = 'archive';
  }
  // ... other types
}
%>
<i class="file-icon <%= fileTypeClass %> fas <%= iconClass %>"></i>
```

**`views/documents/show.ejs` - Preview modal:**

```javascript
function previewFile(fileId) {
  fetch(`/documents/files/${fileId}/preview-info`)
    .then(response => response.json())
    .then(data => {
      if (data.type === 'word' && data.previewable) {
        // Hiển thị option: Tải xuống hoặc Google Docs
        previewContent.innerHTML = `
          <div style="text-align: center; padding: 20px;">
            <p><i class="fas fa-file-word" style="font-size: 48px; color: #2b579a;"></i></p>
            <p><strong>${data.filename}</strong></p>
            <p>Chọn cách xem:</p>
            <div>
              <a href="/documents/files/${fileId}/download" class="btn btn-primary">
                <i class="fas fa-download"></i> Tải xuống để xem
              </a>
              <button onclick="openGoogleDocsViewer('${fileId}')" class="btn btn-info">
                <i class="fas fa-external-link-alt"></i> Xem qua Google Docs
              </button>
            </div>
          </div>`;
      } else if (data.type === 'archive') {
        // RAR/ZIP: Chỉ download
        previewContent.innerHTML = `
          <div style="text-align: center; padding: 30px;">
            <p><i class="fas fa-file-archive" style="font-size: 48px; color: #ffa500;"></i></p>
            <p>${data.message || 'File nén không hỗ trợ xem trước'}</p>
            <a href="/documents/files/${fileId}/download" class="btn btn-success">
              <i class="fas fa-download"></i> Tải xuống
            </a>
          </div>`;
      }
      // ... PDF, image, text cases
    });
}

function openGoogleDocsViewer(fileId) {
  const downloadUrl = window.location.origin + '/documents/files/' + fileId + '/download';
  const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(downloadUrl)}&embedded=true`;
  window.open(viewerUrl, '_blank');
}
```

**`views/documents/list.ejs`:** Cập nhật tương tự

**CSS:**

```css
/* File type specific icons */
.file-icon.pdf { background:#fee2e2; color:#dc2626; }
.file-icon.word { background:#dbeafe; color:#1e40af; }
.file-icon.excel { background:#d1fae5; color:#065f46; }
.file-icon.image { background:#f3e8ff; color:#7e22ce; }
.file-icon.archive { background:#fff7ed; color:#ea580c; }
.file-icon.text { background:#f1f5f9; color:#475569; }
```

### 📚 Tài liệu

- ✅ Thêm `HUONG_DAN_FILE_PREVIEW.md`: Hướng dẫn chi tiết người dùng
- ✅ Thêm `CHANGELOG_FILE_PREVIEW.md`: Lịch sử thay đổi

### ⚠️ Breaking Changes

Không có.

### 🔄 Migration Required

Không cần migration. Hệ thống tương thích ngược với dữ liệu cũ.

### 📝 TODO / Future Enhancements

- [ ] Chuyển đổi Word → PDF server-side để preview inline (yêu cầu LibreOffice)
- [ ] Thêm thumbnail cho file Word/Excel
- [ ] Hỗ trợ preview video/audio
- [ ] Batch download nhiều files
- [ ] Compression/optimization ảnh trước khi lưu
- [ ] Virus scanning cho uploaded files
- [ ] CDN integration cho files lớn

---

## [1.1.0] - 2025-09-30

### Tính năng
- Thêm hệ thống upload file đính kèm
- Preview cơ bản cho PDF và ảnh
- Download file với tên gốc

### Sửa lỗi
- Fix schema mismatch (document_files vs document_attachments)
- Fix SQL errors (unknown columns)
- Fix controller corruption sau refactor

---

## [1.0.0] - 2025-09-28

### Tính năng
- CRUD văn bản cơ bản
- Hệ thống chỉ đạo và phê duyệt
- Lịch sử thay đổi chỉ đạo
- Authentication & authorization

---

**Maintained by**: Development Team  
**Last Updated**: October 1, 2025
