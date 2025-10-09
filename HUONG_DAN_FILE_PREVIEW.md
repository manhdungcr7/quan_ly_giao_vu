# Hướng dẫn: Hệ thống tải lên và xem trước tài liệu

## Các loại file được hỗ trợ

### 1. **Tải lên (Upload)**
Hệ thống cho phép tải lên các định dạng sau:

- **PDF** - `application/pdf`
- **Word** - `.doc`, `.docx`
- **Excel** - `.xls`, `.xlsx`
- **PowerPoint** - `.ppt`, `.pptx`
- **Hình ảnh** - `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`
- **Văn bản** - `.txt`
- **File nén** - `.zip`, `.rar`, `.7z`

### 2. **Xem trước (Preview)**

#### ✅ **Xem trực tiếp trong trình duyệt:**
- **PDF** - Hiển thị trong iframe
- **Hình ảnh** - Hiển thị ảnh gốc
- **Text** - Hiển thị nội dung văn bản

#### 📄 **Xem qua Google Docs Viewer:**
- **Word (.doc, .docx)** - Nhấn "Xem qua Google Docs"
  - ⚠️ **Lưu ý**: File cần có URL public để Google truy cập
  - Nếu server chạy localhost, chỉ có thể tải xuống để xem

#### ❌ **Không hỗ trợ xem trước:**
- **File nén (RAR/ZIP/7z)** - Chỉ có thể tải xuống
- **Excel, PowerPoint** - Chỉ có thể tải xuống (hoặc dùng Google Viewer nếu public)

---

## Cách sử dụng

### **A. Tải file lên**

1. Vào trang **Tạo văn bản mới** hoặc **Chỉnh sửa văn bản**
2. Kéo thả file vào ô "Files đính kèm" hoặc nhấn **Browse** để chọn file
3. Có thể tải nhiều file cùng lúc
4. Nhấn **Lưu văn bản** để hoàn tất

### **B. Xem trước file**

#### **Từ trang chi tiết văn bản:**

1. Mở văn bản cần xem
2. Cuộn xuống phần **"Files đính kèm"**
3. Nhấn nút **"Xem trước"** bên cạnh tên file

**Màn hình xem trước sẽ hiển thị:**

- **PDF**: Iframe với nội dung PDF
- **Hình ảnh**: Ảnh đầy đủ
- **Text**: Nội dung văn bản
- **Word**: Lựa chọn:
  - **Tải xuống**: Mở bằng MS Word hoặc LibreOffice
  - **Xem qua Google Docs**: Mở trong tab mới (chỉ khi server public)
- **File nén (RAR/ZIP)**: Thông báo không hỗ trợ xem trước + nút tải xuống

#### **Từ danh sách văn bản:**

1. Nhấn vào icon **📎** (file đính kèm) trên dòng văn bản
2. Modal sẽ hiển thị danh sách files
3. Nhấn **"Xem trước"** hoặc **"Tải về"**

### **C. Tải file về**

- Nhấn nút **"Tải về"** bên cạnh file
- File sẽ được tải về với **tên gốc** (bao gồm ký tự Unicode/tiếng Việt)

---

## Icon hiển thị theo loại file

Hệ thống tự động nhận diện và hiển thị icon:

| Icon | Loại file | Màu nền |
|------|-----------|---------|
| 📕 | PDF | Đỏ nhạt |
| 📘 | Word | Xanh dương |
| 📗 | Excel | Xanh lá |
| 🖼️ | Hình ảnh | Tím nhạt |
| 📦 | File nén (RAR/ZIP) | Cam nhạt |
| 📄 | Text | Xám nhạt |

---

## Giới hạn & Lưu ý

### **Kích thước file:**
- Tối đa **10 MB** mỗi file (có thể điều chỉnh trong `.env` với `MAX_FILE_SIZE`)

### **Bảo mật:**
- Mọi file được lưu trong thư mục `public/uploads/documents/`
- Tên file được mã hóa unique: `doc_<timestamp>_<random>_<ten_goc>.ext`
- Chỉ người dùng đã đăng nhập mới có thể tải lên/xem file

### **Xem trước Word qua Google Docs:**
- **Chỉ hoạt động khi:**
  - Server có địa chỉ public (không phải `localhost`)
  - File có thể truy cập qua Internet
- **Trên localhost**: Chỉ có thể tải xuống để xem

### **Encoding tên file:**
- Tên file tiếng Việt được hỗ trợ đầy đủ (UTF-8)
- Khi tải về, tên file giữ nguyên ký tự đặc biệt

---

## Xử lý lỗi thường gặp

### **"Đường dẫn không hợp lệ"**
- **Nguyên nhân**: File không nằm trong thư mục upload được phép
- **Giải pháp**: Liên hệ admin kiểm tra cấu hình `UPLOAD_PATH` trong `.env`

### **"File không hỗ trợ xem trước"**
- **Nguyên nhân**: Loại file không thuộc danh sách previewable
- **Giải pháp**: Tải file về để xem bằng ứng dụng tương ứng

### **Google Docs Viewer không mở được Word**
- **Nguyên nhân**: Server chạy localhost hoặc file không public
- **Giải pháp**: Tải file về và mở bằng MS Word/LibreOffice

### **Upload thất bại**
- **Kiểm tra**:
  - File có vượt quá 10MB không?
  - Định dạng file có được phép không?
  - Thư mục `public/uploads/documents/` có quyền ghi không?

---

## API Endpoints (Developer)

### **Upload file (khi tạo/sửa văn bản):**
```
POST /documents (tạo mới)
POST /documents/:id (cập nhật)
Content-Type: multipart/form-data
Field: attachments[]
```

### **Lấy danh sách files:**
```
GET /documents/files/:documentId
Response: { success: true, data: [...] }
```

### **Xem thông tin preview:**
```
GET /documents/files/:fileId/preview-info
Response: {
  success: true,
  filename: "...",
  type: "pdf|word|image|text|archive|other",
  size: 12345,
  previewable: true/false,
  content: "..." (chỉ với text)
}
```

### **Stream file preview:**
```
GET /documents/files/:fileId/preview
Headers: Content-Type: <mime_type>
```

### **Tải file:**
```
GET /documents/files/:fileId/download
Headers: Content-Disposition: attachment; filename*=UTF-8''<encoded_name>
```

---

## Cấu hình nâng cao

### **Tăng giới hạn kích thước file:**

Sửa file `.env`:
```env
MAX_FILE_SIZE=20971520  # 20MB (tính bằng bytes)
```

### **Thêm định dạng file mới:**

1. Mở `config/app.js`
2. Thêm MIME type vào `allowedTypes`:
```javascript
allowedTypes: [
  'application/vnd.ms-access',  // MS Access
  // ...
]
```

3. Cập nhật `app/utils/fileTypeHelper.js` nếu muốn thêm icon riêng

### **Kích hoạt xem Word trực tiếp (nâng cao):**

Yêu cầu:
- Cài thêm thư viện chuyển đổi (ví dụ: `libreoffice-convert`, `mammoth`)
- Xử lý chuyển Word → HTML hoặc PDF trước khi preview

---

**Phiên bản**: 1.0  
**Cập nhật**: Tháng 10/2025
