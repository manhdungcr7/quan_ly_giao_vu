const db = require('../../config/database');
const path = require('path');

class LegalDocumentController {
    // Hiển thị danh sách văn bản pháp lý
    async index(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = 10;
            const offset = (page - 1) * limit;

            // Filters
            const search = req.query.search || '';
            const type = req.query.type || '';
            const status = req.query.status || '';
            const dateFrom = req.query.dateFrom || '';
            const dateTo = req.query.dateTo || '';

            // Build WHERE clause
            let whereConditions = ['1=1'];
            let params = [];

            if (search) {
                whereConditions.push('(document_number LIKE ? OR title LIKE ? OR issuing_authority LIKE ?)');
                const searchPattern = `%${search}%`;
                params.push(searchPattern, searchPattern, searchPattern);
            }

            if (type) {
                whereConditions.push('document_type = ?');
                params.push(type);
            }

            if (status) {
                whereConditions.push('status = ?');
                params.push(status);
            }

            if (dateFrom) {
                whereConditions.push('issue_date >= ?');
                params.push(dateFrom);
            }

            if (dateTo) {
                whereConditions.push('issue_date <= ?');
                params.push(dateTo);
            }

            const whereClause = whereConditions.join(' AND ');

            // Get total count
            const countResult = await db.query(
                `SELECT COUNT(*) as total FROM legal_documents WHERE ${whereClause}`,
                params
            );
            const total = countResult[0].total;
            const totalPages = Math.ceil(total / limit);

            // Get documents - use direct LIMIT/OFFSET instead of parameters
            const documents = await db.query(
                `SELECT * FROM legal_documents 
                WHERE ${whereClause} 
                ORDER BY issue_date DESC, id DESC 
                LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`,
                params
            );

            // Get statistics
            const stats = await this.getStatistics();

            res.render('legal-documents/list', {
                title: 'Văn bản pháp lý',
                documents,
                stats,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages
                },
                filters: {
                    search,
                    type,
                    status,
                    dateFrom,
                    dateTo
                },
                user: req.session.user
            });
        } catch (error) {
            console.error('Error in LegalDocumentController index:', error);
            req.flash('error', 'Không thể tải danh sách văn bản');
            res.redirect('/dashboard');
        }
    }

    // Thống kê
    async getStatistics() {
        try {
            const stats = await db.query(`
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'Còn hiệu lực' THEN 1 ELSE 0 END) as valid,
                    SUM(CASE WHEN status = 'Hết hiệu lực' THEN 1 ELSE 0 END) as expired,
                    SUM(CASE WHEN status = 'Bị thay thế' THEN 1 ELSE 0 END) as replaced
                FROM legal_documents
            `);
            return stats[0] || { total: 0, valid: 0, expired: 0, replaced: 0 };
        } catch (error) {
            console.error('Error getting statistics:', error);
            return { total: 0, valid: 0, expired: 0, replaced: 0 };
        }
    }

    // Xem chi tiết văn bản
    async show(req, res) {
        try {
            const id = req.params.id;
            const documents = await db.query('SELECT * FROM legal_documents WHERE id = ?', [id]);

            if (documents.length === 0) {
                req.flash('error', 'Không tìm thấy văn bản');
                return res.redirect('/legal-documents');
            }

            const document = documents[0];

            // Get current attachments only
            const attachments = await db.query(
                'SELECT * FROM legal_document_attachments WHERE document_id = ? AND is_current = 1 ORDER BY uploaded_at DESC',
                [id]
            );

            // Get all file versions
            const fileVersions = await db.query(
                'SELECT * FROM legal_document_attachments WHERE document_id = ? ORDER BY version DESC, uploaded_at DESC',
                [id]
            );

            // Get audit logs (last 20)
            const auditLogs = await db.query(
                'SELECT * FROM legal_document_audit_logs WHERE document_id = ? ORDER BY created_at DESC LIMIT 20',
                [id]
            );

            // Map attachments for display
            document.files = attachments.map(f => ({
                id: f.id,
                original_name: f.original_name,
                filename: f.filename,
                mime_type: f.mime_type,
                size: f.file_size,
                file_path: f.file_path,
                version: f.version,
                download_count: f.download_count,
                uploaded_at: f.uploaded_at
            }));

            // Log view activity
            await this.logActivity(id, 'Xem', req, {
                message: `Xem văn bản ${document.document_number}`
            });

            res.render('legal-documents/show', {
                title: 'Chi tiết văn bản',
                document,
                fileVersions,
                auditLogs,
                user: req.session.user,
                success: req.flash('success'),
                error: req.flash('error')
            });
        } catch (error) {
            console.error('Error in LegalDocumentController show:', error);
            req.flash('error', 'Không thể tải chi tiết văn bản');
            res.redirect('/legal-documents');
        }
    }

    // Form tạo mới
    async create(req, res) {
        const storedForm = req.flash('formData')[0];
        let formData = {};
        try { if (storedForm) formData = typeof storedForm === 'string' ? JSON.parse(storedForm) : storedForm; } catch(_) {}
        res.render('legal-documents/create', {
            title: 'Thêm văn bản pháp lý',
            user: req.session.user,
            formData,
            success: req.flash('success'),
            error: req.flash('error') || ''
        });
    }

    // Audit logging helper
    async logActivity(documentId, action, req, details = {}) {
        try {
            await db.query(
                `INSERT INTO legal_document_audit_logs 
                 (document_id, action, user_id, user_name, ip_address, user_agent, old_values, new_values, details) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    documentId,
                    action,
                    req.session.user?.id || null,
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

    // Lưu văn bản mới
    async store(req, res) {
        try {
            console.log('=== LegalDocument Store Start ===');
            console.log('Body:', req.body);
            console.log('Files:', req.files ? req.files.length : 0);
            if (req.files) {
                req.files.forEach((file, idx) => {
                    console.log(`File ${idx}:`, {
                        originalname: file.originalname,
                        filename: file.filename,
                        size: file.size,
                        mimetype: file.mimetype,
                        path: file.path
                    });
                });
            }

            const {
                document_number,
                title,
                document_type,
                issuing_authority,
                issue_date,
                effective_date,
                expiry_date,
                status,
                subject,
                summary,
                keywords,
                signer_name,
                signer_position,
                replaced_by,
                related_documents
            } = req.body;

            const userId = req.session.user?.id || 1;

            // Prepare data
            const data = {
                document_number,
                title,
                document_type,
                issuing_authority,
                issue_date: issue_date || null,
                effective_date: effective_date || null,
                expiry_date: expiry_date || null,
                status: status || 'Dự thảo',
                subject: subject || null,
                summary: summary || null,
                keywords: keywords || null,
                signer_name: signer_name || null,
                signer_position: signer_position || null,
                replaced_by: replaced_by || null,
                related_documents: related_documents || null,
                version: 1,
                created_by: userId
            };

            console.log('Data to insert:', data);

            // Insert document
            // IMPORTANT: pool.execute() (used in db.query) không hỗ trợ cú pháp 'INSERT ... SET ?' với object.
            // Cần build danh sách cột + placeholders thủ công để tránh lỗi và đảm bảo tương thích.
            const columns = Object.keys(data);
            const placeholders = columns.map(() => '?').join(',');
            const values = columns.map(k => data[k]);

            const insertSql = `INSERT INTO legal_documents (${columns.join(',')}) VALUES (${placeholders})`;
            const result = await db.query(insertSql, values);

            const documentId = result.insertId;
            console.log('Document inserted with ID:', documentId);

            // Handle file uploads
            if (req.files && req.files.length > 0) {
                console.log('Processing file uploads...');
                for (const file of req.files) {
                    const relPath = file.path.replace(/\\/g, '/').replace(process.cwd().replace(/\\/g, '/'), '').replace(/^\//, '');
                    
                    console.log('Inserting file attachment:', {
                        documentId,
                        filename: file.filename,
                        originalname: file.originalname,
                        relPath,
                        size: file.size,
                        mimetype: file.mimetype
                    });

                    await db.query(
                        `INSERT INTO legal_document_attachments 
                         (document_id, filename, original_name, file_path, file_size, mime_type, uploaded_by, version, is_current) 
                         VALUES (?, ?, ?, ?, ?, ?, ?, 1, 1)`,
                        [documentId, file.filename, file.originalname, relPath, file.size, file.mimetype, userId]
                    );
                }
                console.log('File uploads processed successfully');
            } else {
                console.log('No files to upload');
            }

            // Log activity
            await this.logActivity(documentId, 'Tạo mới', req, {
                newValues: data,
                message: `Tạo văn bản ${data.document_number}`
            });

            console.log('=== LegalDocument Store Success ===');
            req.flash('success', 'Thêm văn bản thành công');
            res.redirect(`/legal-documents/${documentId}`);
        } catch (error) {
            console.error('=== LegalDocument Store Error ===');
            console.error('Error details:', error);
            console.error('Error stack:', error.stack);
            // Lưu lại dữ liệu người dùng đã nhập để không phải nhập lại
            try { req.flash('formData', JSON.stringify(req.body)); } catch(_) { req.flash('formData', req.body); }
            req.flash('error', 'Không thể thêm văn bản: ' + error.message);
            res.redirect('/legal-documents/create');
        }
    }

    // Form chỉnh sửa
    async edit(req, res) {
        try {
            const id = req.params.id;
            const documents = await db.query('SELECT * FROM legal_documents WHERE id = ?', [id]);

            if (!documents || documents.length === 0) {
                req.flash('error', 'Không tìm thấy văn bản');
                return res.redirect('/legal-documents');
            }

            const document = documents[0];

            res.render('legal-documents/edit', {
                title: 'Chỉnh sửa văn bản',
                document,
                user: req.session.user,
                success: req.flash('success'),
                error: req.flash('error')
            });
        } catch (error) {
            console.error('Error in LegalDocumentController edit:', error);
            req.flash('error', 'Không thể tải form chỉnh sửa');
            res.redirect('/legal-documents');
        }
    }

    // Cập nhật văn bản
    async update(req, res) {
        const id = req.params.id;
        try {
            const {
                document_number,
                title,
                document_type,
                issuing_authority,
                issue_date,
                effective_date,
                expiry_date,
                status,
                subject,
                summary,
                keywords,
                replaced_by,
                related_documents
            } = req.body;

            const userId = req.session.user.id;

            await db.query(
                `UPDATE legal_documents SET 
                    document_number = ?, 
                    title = ?,
                    document_type = ?,
                    issuing_authority = ?,
                    issue_date = ?,
                    effective_date = ?,
                    expiry_date = ?,
                    status = ?,
                    subject = ?,
                    summary = ?,
                    keywords = ?,
                    replaced_by = ?,
                    related_documents = ?,
                    updated_by = ?,
                    updated_at = NOW()
                WHERE id = ?`,
                [
                    document_number, title, document_type, issuing_authority,
                    issue_date || null, effective_date || null, expiry_date || null,
                    status, subject || null, summary || null, keywords || null,
                    replaced_by || null, related_documents || null,
                    userId, id
                ]
            );

            // Handle new file uploads
            if (req.files && req.files.length > 0) {
                console.log('Processing file uploads for document:', id);
                for (const file of req.files) {
                    const relPath = file.path.replace(/\\/g, '/').replace(process.cwd().replace(/\\/g, '/'), '').replace(/^\//, '');
                    
                    console.log('Inserting attachment:', {
                        document_id: id,
                        filename: file.filename,
                        original_name: file.originalname
                    });

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
            res.redirect(`/legal-documents/${id}/edit`);
        }
    }

    // Xóa văn bản
    async destroy(req, res) {
        try {
            const id = req.params.id;
            
            const document = await db.findOne('SELECT document_number FROM legal_documents WHERE id = ?', [id]);
            if (!document) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy văn bản' });
            }

            await db.query('DELETE FROM legal_documents WHERE id = ?', [id]);

            res.json({ success: true, message: 'Đã xóa văn bản thành công' });
        } catch (error) {
            console.error('Error in LegalDocumentController destroy:', error);
            res.status(500).json({ success: false, message: 'Không thể xóa văn bản' });
        }
    }

    // API: Danh sách files đính kèm
    async files(req, res) {
        try {
            const id = req.params.id;
            const files = await db.findMany(
                'SELECT id, original_name, filename, file_path, file_size, mime_type, uploaded_at FROM legal_document_attachments WHERE document_id = ? ORDER BY id DESC',
                [id]
            );
            const mapped = files.map(f => ({
                id: f.id,
                original_name: f.original_name,
                filename: f.filename,
                mime_type: f.mime_type,
                size: f.file_size,
                uploaded_at: f.uploaded_at
            }));
            res.json({ success: true, data: mapped });
        } catch (e) {
            console.error('files error:', e);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    // Preview file
    async previewFile(req, res) {
        try {
            const fileId = req.params.fileId;
            const file = await db.findOne('SELECT * FROM legal_document_attachments WHERE id = ?', [fileId]);
            if (!file) return res.status(404).send('Không tìm thấy file');

            const config = require('../../config/app');
            const uploadRoot = path.resolve(config.upload.uploadPath);
            
            let filePath = file.file_path;
            if (filePath.startsWith('/')) {
                filePath = filePath.substring(1);
            }
            
            const absPath = path.isAbsolute(filePath)
                ? path.resolve(filePath)
                : path.resolve(process.cwd(), filePath);
            if (!absPath.startsWith(uploadRoot)) {
                console.warn('Blocked preview outside upload root:', { filePath: file.file_path, absPath, uploadRoot });
                return res.status(400).send('Đường dẫn không hợp lệ');
            }

            const previewable = [
                'application/pdf',
                'text/plain',
                'image/png','image/jpeg','image/jpg','image/gif','image/webp',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ];
            if (!previewable.includes(file.mime_type)) {
                return res.status(415).send('File không hỗ trợ xem trước trực tiếp. Vui lòng tải xuống.');
            }
            
            res.setHeader('Content-Type', file.mime_type);
            res.sendFile(absPath);
        } catch (e) {
            console.error('previewFile error:', e);
            res.status(500).send('Lỗi server');
        }
    }

    // Preview info
    async previewInfo(req, res) {
        try {
            const fileId = req.params.fileId;
            const file = await db.findOne('SELECT * FROM legal_document_attachments WHERE id = ?', [fileId]);
            if (!file) return res.status(404).json({ success: false, message: 'Không tìm thấy file' });

            const previewable = [
                'application/pdf','text/plain',
                'image/png','image/jpeg','image/jpg','image/gif','image/webp',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ];
            
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

            const config = require('../../config/app');
            const uploadRoot = path.resolve(config.upload.uploadPath);
            
            let filePath = file.file_path;
            if (filePath.startsWith('/')) {
                filePath = filePath.substring(1);
            }
            
            const absPath = path.isAbsolute(filePath)
                ? path.resolve(filePath)
                : path.resolve(process.cwd(), filePath);
            if (!absPath.startsWith(uploadRoot)) {
                return res.json({ success:false, message:'Đường dẫn không hợp lệ', previewable:false });
            }
            
            let content = null;
            if (type === 'text') {
                try {
                    content = require('fs').readFileSync(absPath, 'utf8');
                } catch (e) {
                    content = null;
                }
            }

            return res.json({
                success: true,
                filename: file.original_name,
                type,
                size: file.file_size,
                previewable: previewable.includes(file.mime_type),
                content: type === 'text' ? content : null,
                message: type === 'archive' ? 'File nén không hỗ trợ xem trước, vui lòng tải xuống' : null
            });
        } catch (e) {
            console.error('previewInfo error:', e);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    // Download file
    async downloadFile(req, res) {
        try {
            const fileId = req.params.fileId;
            const files = await db.query('SELECT * FROM legal_document_attachments WHERE id = ?', [fileId]);
            
            if (files.length === 0) {
                return res.status(404).send('Không tìm thấy file');
            }
            
            const file = files[0];
            
            const config = require('../../config/app');
            const uploadRoot = path.resolve(config.upload.uploadPath);
            
            let filePath = file.file_path;
            if (filePath.startsWith('/')) {
                filePath = filePath.substring(1);
            }
            
            const absPath = path.isAbsolute(filePath)
                ? path.resolve(filePath)
                : path.resolve(process.cwd(), filePath);
            
            if (!absPath.startsWith(uploadRoot)) {
                console.warn('Blocked download outside upload root:', { filePath: file.file_path, absPath, uploadRoot });
                return res.status(400).send('Đường dẫn không hợp lệ');
            }
            
            if (!require('fs').existsSync(absPath)) {
                console.error('File not found on disk:', absPath);
                return res.status(404).send('File không tồn tại trên hệ thống');
            }
            
            // Increment download counter
            await db.query(
                'UPDATE legal_document_attachments SET download_count = download_count + 1 WHERE id = ?',
                [fileId]
            );
            
            // Log activity
            await this.logActivity(file.document_id, 'Tải xuống', req, {
                message: `Tải file: ${file.original_name}`
            });
            
            res.download(absPath, file.original_name);
        } catch (e) {
            console.error('downloadFile error:', e);
            res.status(500).send('Lỗi server');
        }
    }
}

module.exports = LegalDocumentController;
