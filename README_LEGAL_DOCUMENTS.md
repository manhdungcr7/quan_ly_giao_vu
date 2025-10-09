# 📜 Module Văn bản Pháp lý

## ✅ Hoàn thành

Module quản lý văn bản pháp lý đã được xây dựng hoàn chỉnh với giao diện giống hệt module "Văn bản đến"!

### **Tính năng**

#### 1. **Danh sách văn bản**
- ✅ Hiển thị danh sách với tabs và filters
- ✅ Tìm kiếm theo số hiệu, tiêu đề, cơ quan ban hành
- ✅ Lọc theo:
  - Loại văn bản (Luật, Nghị định, Thông tư, Quyết định, Quy định, Nghị quyết)
  - Trạng thái (Còn hiệu lực, Hết hiệu lực, Bị thay thế, Đang dự thảo)
  - Khoảng thời gian (từ ngày - đến ngày)
- ✅ Phân trang
- ✅ Thống kê tổng quan (Tổng số, Còn hiệu lực, Hết hiệu lực, Bị thay thế)

#### 2. **Chi tiết văn bản**
- ✅ Hiển thị đầy đủ thông tin:
  - Số hiệu, Tiêu đề
  - Loại văn bản, Cơ quan ban hành
  - Ngày ban hành, Ngày có hiệu lực, Ngày hết hiệu lực
  - Trạng thái, Lĩnh vực
  - Tóm tắt nội dung, Từ khóa
  - Văn bản thay thế, Văn bản liên quan
- ✅ Danh sách file đính kèm với preview/download
  - Hỗ trợ Word, PDF, RAR, ảnh, text
  - Icon phân loại theo loại file
  - Preview inline cho PDF, ảnh, text
  - Google Docs Viewer cho Word

#### 3. **Thêm/Sửa/Xóa**
- ✅ Form tạo mới với validation
- ✅ Form chỉnh sửa
- ✅ Xóa văn bản (với xác nhận)
- ✅ Upload file đính kèm (nhiều files)
- ✅ Tracking người tạo, người cập nhật

---

## 📂 Cấu trúc

### **Database**

**Table: `legal_documents`**
```sql
- id (PK)
- document_number (UNIQUE) - Số văn bản
- title - Tiêu đề
- document_type - Loại văn bản
- issuing_authority - Cơ quan ban hành
- issue_date - Ngày ban hành
- effective_date - Ngày có hiệu lực
- expiry_date - Ngày hết hiệu lực
- status - Trạng thái (enum)
- subject - Lĩnh vực
- summary - Tóm tắt
- keywords - Từ khóa
- replaced_by - Văn bản thay thế
- related_documents - Văn bản liên quan
- created_by, updated_by
- created_at, updated_at
```

**Table: `legal_document_attachments`**
```sql
- id (PK)
- document_id (FK → legal_documents)
- filename - Tên file trên server
- original_name - Tên file gốc
- file_path - Đường dẫn
- file_size - Kích thước (bytes)
- mime_type - Loại file
- uploaded_by
- uploaded_at
```

### **Files**

#### **Backend:**
- ✅ `app/controllers/LegalDocumentController.js` - Controller chính
  - index() - Danh sách
  - show() - Chi tiết
  - create(), store() - Tạo mới
  - edit(), update() - Cập nhật
  - destroy() - Xóa
  - files(), previewFile(), previewInfo(), downloadFile() - File management

- ✅ `scripts/importLegalDocumentsSchema.js` - Import schema

#### **Frontend:**
- ✅ `views/legal-documents/list.ejs` - Danh sách
- ✅ `views/legal-documents/show.ejs` - Chi tiết
- ✅ `views/legal-documents/create.ejs` - Form tạo
- ✅ `views/legal-documents/edit.ejs` - Form sửa

#### **Routes:**
```javascript
GET    /legal-documents              - Danh sách
GET    /legal-documents/create       - Form tạo
POST   /legal-documents              - Lưu mới
GET    /legal-documents/:id          - Chi tiết
GET    /legal-documents/:id/edit     - Form sửa
POST   /legal-documents/:id          - Cập nhật
DELETE /legal-documents/:id          - Xóa

// Files
GET    /legal-documents/:id/files                - API list files
GET    /legal-documents/files/:fileId/preview-info  - Metadata
GET    /legal-documents/files/:fileId/preview       - Preview
GET    /legal-documents/files/:fileId/download      - Download
```

---

## 🚀 Cách sử dụng

### **Bước 1: Import database schema**
```bash
node scripts/importLegalDocumentsSchema.js
```

### **Bước 2: Khởi động server**
```bash
npm run dev
```

### **Bước 3: Truy cập**
```
http://localhost:3000/legal-documents
```

### **Bước 4: Thêm văn bản**
1. Click "Thêm văn bản mới"
2. Điền thông tin:
   - Số hiệu (bắt buộc, unique)
   - Tiêu đề (bắt buộc)
   - Loại văn bản, Cơ quan ban hành
   - Ngày ban hành, Ngày có hiệu lực
   - Trạng thái, Lĩnh vực
   - Tóm tắt, Từ khóa
3. Upload files đính kèm (nếu có)
4. Nhấn "Lưu văn bản"

---

## 🎨 Giao diện

### **Giống hệt "Văn bản đến":**
- ✅ Header với title + nút "Thêm văn bản mới"
- ✅ Statistics cards (4 cards màu sắc khác nhau)
- ✅ Filters panel (tìm kiếm, loại, trạng thái, ngày)
- ✅ Table với các cột: Số hiệu, Tiêu đề, Loại, Cơ quan, Ngày, Trạng thái, Thao tác
- ✅ Action buttons (Xem, Sửa, Xóa) với màu sắc riêng
- ✅ Pagination
- ✅ Responsive design

### **Chi tiết văn bản:**
- ✅ Layout 2 cột
- ✅ Section: Thông tin cơ bản
- ✅ Section: Thông tin chi tiết
- ✅ Section: Files đính kèm (với icon màu sắc)
- ✅ Preview modal cho files

---

## 🔧 Đã xử lý

### **Path handling:**
- ✅ Normalize leading slash trong file_path
- ✅ Secure validation (uploadRoot base)
- ✅ Preview/download cho Word, PDF, RAR

### **Data:**
- ✅ Sample data: 2 văn bản mẫu
- ✅ Foreign key cascade delete

---

## 📝 TODO (Tùy chọn)

- [ ] Fulltext search (MySQL FULLTEXT INDEX đã có)
- [ ] Versioning (lưu lịch sử thay đổi)
- [ ] Workflow phê duyệt
- [ ] Export/Import Excel
- [ ] Advanced filters (nhiều điều kiện)
- [ ] Related documents linking (UI)

---

## 🎯 So sánh với "Văn bản đến"

| Tính năng | Văn bản đến | Văn bản pháp lý |
|-----------|-------------|-----------------|
| Danh sách + Filters | ✅ | ✅ |
| Statistics cards | ✅ | ✅ |
| CRUD | ✅ | ✅ |
| File attachments | ✅ | ✅ |
| Preview/Download | ✅ | ✅ |
| Tabs (Văn bản đến/đi) | ✅ | ❌ (Không cần) |
| Chỉ đạo/Phê duyệt | ✅ | ❌ (Chưa cần) |
| **Fields riêng** | | |
| - Loại văn bản | ❌ | ✅ |
| - Cơ quan ban hành | ❌ | ✅ |
| - Ngày có hiệu lực | ❌ | ✅ |
| - Văn bản thay thế | ❌ | ✅ |
| - Lĩnh vực | ❌ | ✅ |

---

## 📊 Kết quả

✅ **Module đã hoàn chỉnh và sẵn sàng sử dụng!**

- Server: Running ✅
- Database: Schema imported ✅
- Routes: Configured ✅
- Views: Created ✅
- Files: Upload/Preview/Download working ✅

---

**Maintained by**: Development Team  
**Date**: October 1, 2025  
**Version**: 1.0.0
