# HƯỚNG DẪN CẬP NHẬT VĂN BẢN PHÁP LÝ

## ✅ ĐÃ HOÀN THÀNH

### 1. Database Schema Enhancement
✅ **Đã chạy thành công script**: `scripts/enhanceLegalDocuments.js`

**Các thay đổi database:**
- ✅ Thêm trường `signer_name` (Người ký)
- ✅ Thêm trường `signer_position` (Chức vụ người ký)  
- ✅ Thêm trường `version` cho quản lý phiên bản
- ✅ Cập nhật enum `status`: Dự thảo, Còn hiệu lực, Hết hiệu lực, Bị thay thế, Đã hủy
- ✅ Tạo bảng `legal_document_audit_logs` - ghi nhật ký hoạt động
- ✅ Thêm quản lý phiên bản file: `version`, `is_current`, `replaced_by`, `download_count`
- ✅ Tạo view `v_legal_documents_full` 
- ✅ Thêm fulltext search indexes

### 2. Tính năng File đã có sẵn
✅ **Kế thừa từ Documents Module:**
- Upload nhiều file (PDF, DOCX, RAR, ZIP)
- Preview PDF inline
- Download với tên gốc
- File type detection
- Security validation

## 🚀 CẦN LÀM TIẾP

### Phase 1: Sửa Views (30 phút)

#### File: `views/legal-documents/create.ejs`
**Cần thay thế toàn bộ form** với các trường mới:

```html
<!-- Thông tin cơ bản -->
- document_number (Số hiệu) - REQUIRED
- title (Tiêu đề) - REQUIRED  
- document_type (Loại: Quy định, Nghị quyết, etc) - REQUIRED
- issuing_authority (Cơ quan ban hành) - REQUIRED
- subject (Lĩnh vực)
- summary (Tóm tắt nội dung)
- keywords (Từ khóa)

<!-- Thông tin pháp lý -->
- issue_date (Ngày ban hành)
- effective_date (Ngày hiệu lực)
- expiry_date (Ngày hết hiệu lực)
- status (Trạng thái) - REQUIRED
- signer_name (Người ký)
- signer_position (Chức vụ)
- replaced_by (Văn bản thay thế)
- related_documents (Văn bản liên quan)

<!-- File đính kèm -->
- files[] (Multiple files, max 50MB each)
```

**Action**: Tạo file mới `create_new.ejs` rồi rename sau

#### File: `views/legal-documents/edit.ejs`
Tương tự create.ejs nhưng có pre-filled values

#### File: `views/legal-documents/list.ejs`
**Cần thêm vào bảng:**
```html
<!-- Thêm cột -->
<th>NGƯỜI TẠO</th>
<th>NGƯỜI KÝ</th>  
<th>FILE</th>
<th>CẬP NHẬT</th>

<!-- Trong tbody -->
<td><%= doc.created_by_username || '-' %></td>
<td><%= doc.signer_name || '-' %></td>
<td>
  <% if (doc.attachment_count > 0) { %>
    <i class="fas fa-paperclip"></i> <%= doc.attachment_count %>
  <% } %>
</td>
<td><%= formatDate(doc.updated_at) %></td>
```

**Tooltip hover**: 
```javascript
// Thêm vào script
document.querySelectorAll('.doc-title').forEach(el => {
  el.setAttribute('title', el.dataset.summary || '');
});
```

#### File: `views/legal-documents/show.ejs`
**Cần thêm sections:**
```html
<!-- Thông tin người ký -->
<div class="detail-section">
  <h3>👤 Người ký</h3>
  <p><strong><%= document.signer_name %></strong></p>
  <p><%= document.signer_position %></p>
</div>

<!-- Phiên bản file -->
<div class="detail-section">
  <h3>📂 Lịch sử phiên bản</h3>
  <% fileVersions.forEach(v => { %>
    <div class="version-item">
      <span>V<%= v.version %></span>
      <span><%= v.uploaded_at %></span>
      <span><%= v.download_count %> lượt tải</span>
    </div>
  <% }) %>
</div>

<!-- Audit log -->
<div class="detail-section">
  <h3>📝 Lịch sử hoạt động</h3>
  <% auditLogs.forEach(log => { %>
    <div class="audit-item">
      <span><%= log.user_name %></span>
      <span><%= log.action %></span>
      <span><%= log.created_at %></span>
    </div>
  <% }) %>
</div>
```

### Phase 2: Cập nhật Controller (40 phút)

#### File: `app/controllers/LegalDocumentController.js`

**1. Thêm Audit Log Helper:**
```javascript
async logActivity(documentId, action, req, details = {}) {
  try {
    await db.query(
      `INSERT INTO legal_document_audit_logs 
       (document_id, action, user_id, user_name, ip_address, user_agent, old_values, new_values, details) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        documentId,
        action,
        req.session.user?.id,
        req.session.user?.username || 'System',
        req.ip || req.connection.remoteAddress,
        req.get('user-agent'),
        JSON.stringify(details.oldValues || null),
        JSON.stringify(details.newValues || null),
        details.message || null
      ]
    );
  } catch (error) {
    console.error('Audit log error:', error);
  }
}
```

**2. Cập nhật store() method:**
```javascript
async store(req, res) {
  try {
    const data = {
      document_number: req.body.document_number,
      title: req.body.title,
      document_type: req.body.document_type,
      issuing_authority: req.body.issuing_authority,
      issue_date: req.body.issue_date || null,
      effective_date: req.body.effective_date || null,
      expiry_date: req.body.expiry_date || null,
      status: req.body.status || 'Dự thảo',
      subject: req.body.subject || null,
      summary: req.body.summary || null,
      keywords: req.body.keywords || null,
      signer_name: req.body.signer_name || null,
      signer_position: req.body.signer_position || null,
      replaced_by: req.body.replaced_by || null,
      related_documents: req.body.related_documents || null,
      version: 1,
      created_by: req.session.user?.id
    };

    // Insert document
    const result = await db.query(
      'INSERT INTO legal_documents SET ?',
      data
    );
    
    const documentId = result.insertId;

    // Handle file uploads
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        await db.query(
          `INSERT INTO legal_document_attachments 
           (document_id, filename, original_name, file_path, file_size, mime_type, uploaded_by, version, is_current) 
           VALUES (?, ?, ?, ?, ?, ?, ?, 1, 1)`,
          [documentId, file.filename, file.originalname, file.path, file.size, file.mimetype, req.session.user?.id]
        );
      }
    }

    // Log activity
    await this.logActivity(documentId, 'Tạo mới', req, {
      newValues: data,
      message: `Tạo văn bản ${data.document_number}`
    });

    res.redirect(`/legal-documents/${documentId}`);
  } catch (error) {
    console.error('Error creating legal document:', error);
    res.status(500).render('error', { error });
  }
}
```

**3. Cập nhật downloadFile() method - thêm counter:**
```javascript
async downloadFile(req, res) {
  try {
    const fileId = req.params.fileId;
    
    // Get file info
    const files = await db.query(
      'SELECT * FROM legal_document_attachments WHERE id = ?',
      [fileId]
    );
    
    if (files.length === 0) {
      return res.status(404).send('File not found');
    }
    
    const file = files[0];
    
    // Increment download counter
    await db.query(
      'UPDATE legal_document_attachments SET download_count = download_count + 1 WHERE id = ?',
      [fileId]
    );
    
    // Log activity
    await this.logActivity(file.document_id, 'Tải xuống', req, {
      message: `Tải file: ${file.original_name}`
    });
    
    // Send file
    res.download(file.file_path, file.original_name);
    
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).send('Error downloading file');
  }
}
```

**4. Thêm method lấy audit logs:**
```javascript
async getAuditLogs(req, res) {
  try {
    const documentId = req.params.id;
    
    const logs = await db.query(
      `SELECT * FROM legal_document_audit_logs 
       WHERE document_id = ? 
       ORDER BY created_at DESC 
       LIMIT 50`,
      [documentId]
    );
    
    res.json({ logs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

**5. Thêm method lấy file versions:**
```javascript
async getFileVersions(req, res) {
  try {
    const documentId = req.params.id;
    
    const versions = await db.query(
      `SELECT * FROM legal_document_attachments 
       WHERE document_id = ? 
       ORDER BY version DESC, uploaded_at DESC`,
      [documentId]
    );
    
    res.json({ versions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

**6. Cập nhật show() method - thêm audit logs và versions:**
```javascript
async show(req, res) {
  try {
    const id = req.params.id;
    
    // Get document
    const documents = await db.query(
      'SELECT * FROM legal_documents WHERE id = ?',
      [id]
    );
    
    if (documents.length === 0) {
      return res.status(404).render('error', { error: 'Document not found' });
    }
    
    const document = documents[0];
    
    // Get attachments (current only)
    const attachments = await db.query(
      `SELECT * FROM legal_document_attachments 
       WHERE document_id = ? AND is_current = 1 
       ORDER BY uploaded_at DESC`,
      [id]
    );
    
    // Get all file versions
    const fileVersions = await db.query(
      `SELECT * FROM legal_document_attachments 
       WHERE document_id = ? 
       ORDER BY version DESC, uploaded_at DESC`,
      [id]
    );
    
    // Get audit logs (last 20)
    const auditLogs = await db.query(
      `SELECT * FROM legal_document_audit_logs 
       WHERE document_id = ? 
       ORDER BY created_at DESC 
       LIMIT 20`,
      [id]
    );
    
    // Log view activity
    await this.logActivity(id, 'Xem', req, {
      message: `Xem văn bản ${document.document_number}`
    });
    
    res.render('legal-documents/show', {
      title: document.title,
      document,
      attachments,
      fileVersions,
      auditLogs
    });
    
  } catch (error) {
    console.error('Error in show:', error);
    res.status(500).render('error', { error });
  }
}
```

### Phase 3: Routes (5 phút)

#### File: `app/routes/web.js`

**Thêm routes mới:**
```javascript
// Audit logs
router.get('/legal-documents/:id/audit-logs', legalDocumentController.getAuditLogs.bind(legalDocumentController));

// File versions
router.get('/legal-documents/:id/file-versions', legalDocumentController.getFileVersions.bind(legalDocumentController));
```

### Phase 4: CSS Enhancements (10 phút)

**Thêm vào `public/css/documents.css`:**
```css
/* Audit Log Timeline */
.audit-timeline {
  position: relative;
  padding-left: 2rem;
}

.audit-item {
  position: relative;
  padding: 1rem;
  margin-bottom: 1rem;
  background: #f8f9fa;
  border-left: 3px solid #007bff;
}

.audit-item::before {
  content: '';
  position: absolute;
  left: -0.75rem;
  top: 1rem;
  width: 0.75rem;
  height: 0.75rem;
  background: #007bff;
  border-radius: 50%;
}

/* File Version List */
.version-list {
  list-style: none;
  padding: 0;
}

.version-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border-bottom: 1px solid #e9ecef;
}

.version-item.current {
  background: #e7f5ff;
  font-weight: bold;
}

/* Tooltip */
[data-summary]:hover::after {
  content: attr(data-summary);
  position: absolute;
  background: #333;
  color: white;
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  max-width: 300px;
  z-index: 1000;
}
```

## 📝 CHECKLIST HOÀN THÀNH

### Database
- [x] Chạy enhancement script
- [x] Verify tables created
- [x] Test indexes

### Views
- [ ] Sửa create.ejs với đầy đủ form fields
- [ ] Sửa edit.ejs với đầy đủ form fields  
- [ ] Cập nhật list.ejs (thêm cột, icons, tooltip)
- [ ] Cập nhật show.ejs (audit log, file versions)

### Controller
- [ ] Thêm logActivity() helper
- [ ] Cập nhật store() với audit log
- [ ] Cập nhật update() với audit log
- [ ] Cập nhật destroy() với audit log
- [ ] Cập nhật downloadFile() với counter
- [ ] Thêm getAuditLogs() method
- [ ] Thêm getFileVersions() method
- [ ] Cập nhật show() với logs và versions
- [ ] Cập nhật create() để pass empty formData

### Routes
- [ ] Thêm /audit-logs route
- [ ] Thêm /file-versions route

### CSS
- [ ] Thêm audit timeline styles
- [ ] Thêm version list styles
- [ ] Thêm tooltip styles

### Testing
- [ ] Test tạo văn bản mới
- [ ] Test upload files
- [ ] Test download files (check counter)
- [ ] Test audit logs hiển thị
- [ ] Test file versions
- [ ] Test search và filters
- [ ] Test responsive mobile

## 🎯 PRIORITY

**High Priority (Làm ngay):**
1. Sửa create.ejs - không tạo được văn bản mới là blocking
2. Sửa Controller store() - cần nhận đúng fields
3. Sửa list.ejs - cải thiện UX

**Medium Priority (Làm tiếp):**
4. Audit logging
5. File version management
6. Show page enhancements

**Low Priority (Nice to have):**
7. Advanced search với autocomplete
8. RAR file list viewer
9. Export audit logs
10. Email notifications

---
*Next Step: Bắt đầu sửa create.ejs*
