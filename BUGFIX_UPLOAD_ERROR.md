# 🔧 LỖI ĐÃ SỬA: Upload file trong Văn bản pháp lý

## ❌ Lỗi gốc
```
Database insert error: Error: Bind parameters must be array if namedPlaceholders parameter is not enabled
    at Database.insert (D:\...\config\database.js:76:46)
    at LegalDocumentController.update (D:\...\LegalDocumentController.js:420:30)

ReferenceError: id is not defined
    at LegalDocumentController.update (D:\...\LegalDocumentController.js:438:46)
```

## ✅ Nguyên nhân & cách sửa

### 1. **Lỗi trong `update()` method**
- **Vấn đề:** `const id` được khai báo bên trong `try`, nhưng `catch` block cần dùng `id` → ReferenceError
- **Vấn đề 2:** Gọi `db.insert('legal_document_attachments', {...})` với object literal, nhưng `db.insert()` của bạn không hỗ trợ cú pháp này (chỉ hỗ trợ raw SQL + array params)
- **Giải pháp:**
  - Di chuyển `const id = req.params.id;` ra **ngoài** try block
  - Thay `db.insert(...)` bằng `db.query(INSERT INTO ... VALUES (?,...), [...])`

### 2. **Code đã sửa**
```javascript
// Cập nhật văn bản
async update(req, res) {
    const id = req.params.id; // ← Di chuyển ra ngoài try để catch dùng được
    try {
        const { document_number, title, ... } = req.body;
        const userId = req.session.user.id;

        // Update document info
        await db.query(`UPDATE legal_documents SET ... WHERE id = ?`, [..., id]);

        // Handle new file uploads
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const relPath = file.path.replace(/\\/g, '/').replace(process.cwd().replace(/\\/g, '/'), '').replace(/^\//, '');
                
                // ✅ Dùng db.query() thay vì db.insert()
                await db.query(
                    `INSERT INTO legal_document_attachments 
                     (document_id, filename, original_name, file_path, file_size, mime_type, uploaded_by, version, is_current) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, 1, 1)`,
                    [id, file.filename, file.originalname, relPath, file.size, file.mimetype, userId]
                );
            }
        }

        req.flash('success', 'Cập nhật văn bản thành công');
        res.redirect(`/legal-documents/${id}`);
    } catch (error) {
        console.error('Error in LegalDocumentController update:', error);
        req.flash('error', 'Không thể cập nhật văn bản');
        res.redirect(`/legal-documents/${id}/edit`); // ← id giờ có sẵn
    }
}
```

## 🧪 Test ngay

1. **Truy cập trang CREATE:**
   ```
   http://localhost:3000/legal-documents/create
   ```
   - Điền thông tin văn bản
   - Chọn file PDF/Word/ZIP < 10MB
   - Xem preview xuất hiện
   - Click "Lưu văn bản"
   - **Kết quả:** Redirect đến `/legal-documents/:id` (trang chi tiết văn bản vừa tạo)

2. **Hoặc test trang EDIT:**
   ```
   http://localhost:3000/legal-documents/1/edit
   ```
   - Chọn thêm file mới
   - Click "Cập nhật văn bản"
   - **Kết quả:** Redirect đến `/legal-documents/1` (trang chi tiết)

3. **Kiểm tra DB:**
   ```sql
   SELECT * FROM legal_document_attachments ORDER BY id DESC LIMIT 5;
   ```
   - Phải thấy record với `filename`, `original_name`, `file_path`, `mime_type`

## 📊 Logs mong đợi (server console)

### Khi upload thành công (CREATE):
```
=== LegalDocument Store Start ===
Body: { document_number: 'TEST-001', title: '...', ... }
Files: 1
File 0: { originalname: 'TÀI LIỆU LỚP CÔNG AN.pdf', ... }
Document inserted with ID: 123
Processing file uploads...
Inserting file attachment: { documentId: 123, ... }
File uploads processed successfully
=== LegalDocument Store Success ===
```

### Khi upload thành công (UPDATE):
```
File accepted: TÀI LIỆU LỚP CÔNG AN.pdf
Document upload destination: D:\...\public\uploads\documents
Generated filename: doc_1759391460772-580725446_...
Processing file uploads for document: 1
Inserting attachment: { document_id: 1, ... }
```

## 🐛 Nếu vẫn lỗi

Kiểm tra:

1. **Encoding filename:**
   - Log hiện "TÃI LIá»U" → file name bị garbled (UTF-8 issue)
   - Không ảnh hưởng upload nhưng nên rename file test thành ASCII: `test-file.pdf`

2. **Database schema:**
   ```sql
   DESCRIBE legal_document_attachments;
   ```
   - Đảm bảo có các cột: `document_id`, `filename`, `original_name`, `file_path`, `file_size`, `mime_type`, `uploaded_by`, `version`, `is_current`

3. **File permissions:**
   - Thư mục `public/uploads/documents/` phải writable

## ✅ Server đã restart

Server đang chạy bình thường. Chỉ cần test lại form.

---
**Files đã sửa:**
- `app/controllers/LegalDocumentController.js` (method `update`)

**Thời gian:** 2025-10-02
