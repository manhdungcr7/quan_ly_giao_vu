const Document = require('../models/Document');
const db = require('../../config/database');
const path = require('path');
const fs = require('fs');
const config = require('../../config/app');
const crypto = require('crypto');

class DocumentController {
    constructor() {
        this.documentModel = new Document();
    }

    normalizeLabel(value) {
        return typeof value === 'string' ? value.trim() : '';
    }

    stripDiacritics(value) {
        return this.normalizeLabel(value)
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-zA-Z0-9]/g, '')
            .toUpperCase();
    }

    isPositiveInteger(value) {
        return /^\d+$/.test(String(value || '').trim());
    }

    async ensureUniqueCode(table, column, base, fallbackPrefix = 'GEN') {
        let candidate = (base && base.slice(0, 8)) || fallbackPrefix;
        if (!candidate) {
            candidate = fallbackPrefix;
        }

        candidate = candidate.slice(0, 8);
        let suffix = 0;

        while (true) {
            const code = suffix === 0 ? candidate : `${candidate.slice(0, Math.max(0, 8 - suffix.toString().length))}${suffix}`;
            const existing = await db.findOne(`SELECT id FROM ${table} WHERE ${column} = ? LIMIT 1`, [code]);
            if (!existing) {
                return code;
            }
            suffix += 1;
            if (suffix > 999) {
                return `${candidate.slice(0, 5)}${crypto.randomBytes(2).toString('hex').toUpperCase()}`.slice(0, 8);
            }
        }
    }

    async resolveDocumentType(rawValue, labelValue) {
        const raw = this.normalizeLabel(rawValue);
        if (this.isPositiveInteger(raw)) {
            return parseInt(raw, 10);
        }

        const label = this.normalizeLabel(labelValue || raw);
        if (!label) {
            return null;
        }

        const existing = await db.findOne('SELECT id FROM document_types WHERE LOWER(name) = LOWER(?) LIMIT 1', [label]);
        if (existing) {
            return existing.id;
        }

        const baseCode = this.stripDiacritics(label) || 'DOCTYPE';
        const uniqueCode = await this.ensureUniqueCode('document_types', 'code', baseCode, 'DOCTYPE');
        const insertResult = await db.insert(
            'INSERT INTO document_types (name, code, is_active, created_at) VALUES (?, ?, 1, NOW())',
            [label, uniqueCode]
        );

        return insertResult?.insertId || null;
    }

    async resolveOrganization(rawValue, labelValue) {
        const raw = this.normalizeLabel(rawValue);
        if (this.isPositiveInteger(raw)) {
            return parseInt(raw, 10);
        }

        const label = this.normalizeLabel(labelValue || raw);
        if (!label) {
            return null;
        }

        const existing = await db.findOne('SELECT id FROM organizations WHERE LOWER(name) = LOWER(?) LIMIT 1', [label]);
        if (existing) {
            return existing.id;
        }

        const baseCode = this.stripDiacritics(label) || 'ORG';
        const uniqueCode = await this.ensureUniqueCode('organizations', 'code', baseCode, 'ORG');
        const insertResult = await db.insert(
            'INSERT INTO organizations (name, code, is_active, created_at) VALUES (?, ?, 1, NOW())',
            [label, uniqueCode]
        );

        return insertResult?.insertId || null;
    }

    async resolveUserReference(rawValue, labelValue) {
        const raw = this.normalizeLabel(rawValue);
        if (this.isPositiveInteger(raw)) {
            return parseInt(raw, 10);
        }

        const label = this.normalizeLabel(labelValue || raw);
        if (!label) {
            return null;
        }

        const existing = await db.findOne('SELECT id FROM users WHERE LOWER(full_name) = LOWER(?) LIMIT 1', [label]);
        return existing ? existing.id : null;
    }

    async getDirectionStats(direction) {
        try {
            const sql = `SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN status NOT IN ('completed','archived') AND processing_deadline IS NOT NULL AND processing_deadline < CURDATE() THEN 1 ELSE 0 END) as overdue
            FROM documents WHERE direction = ?`;
            return await db.findOne(sql, [direction]);
        } catch (error) {
            console.error('Stats error:', error);
            return { total: 0, pending: 0, processing: 0, completed: 0, overdue: 0 };
        }
    }

    async loadMasterData() {
        try {
            const types = await db.findMany('SELECT id, name FROM document_types ORDER BY name');
            return { types };
        } catch (error) {
            console.error('Master data load error:', error);
            return { types: [] };
        }
    }

    async getSimpleDocuments(direction, page = 1, limit = 20, filters = {}) {
        try {
            const offset = (page - 1) * limit;
            
            // Build WHERE conditions based on filters
            const whereClauses = ['d.direction = ?'];
            const params = [direction];
            
            // Search in document_number, title, content_summary
            if (filters.search && filters.search.trim()) {
                whereClauses.push('(d.document_number LIKE ? OR d.title LIKE ? OR d.content_summary LIKE ?)');
                const searchTerm = `%${filters.search.trim()}%`;
                params.push(searchTerm, searchTerm, searchTerm);
            }
            
            // Filter by status
            if (filters.status && filters.status.trim()) {
                whereClauses.push('d.status = ?');
                params.push(filters.status.trim());
            }
            
            // Filter by document type
            if (filters.type_id && filters.type_id.trim()) {
                whereClauses.push('d.type_id = ?');
                params.push(parseInt(filters.type_id));
            }
            
            // Filter by date range
            if (filters.from_date && filters.from_date.trim()) {
                whereClauses.push('d.issue_date >= ?');
                params.push(filters.from_date.trim());
            }
            
            if (filters.to_date && filters.to_date.trim()) {
                whereClauses.push('d.issue_date <= ?');
                params.push(filters.to_date.trim());
            }
            
            const whereClause = whereClauses.join(' AND ');
            
            const sql = `SELECT d.id, d.document_number, d.title, d.status, d.priority, d.processing_deadline, d.issue_date, d.chi_dao,
                       dt.name AS document_type_name,
                       org_from.name AS from_organization_name,
                       org_to.name AS to_organization_name,
                       u_assigned.full_name AS assigned_to_name
                FROM documents d
                LEFT JOIN document_types dt ON d.type_id = dt.id
                LEFT JOIN organizations org_from ON d.from_org_id = org_from.id
                LEFT JOIN organizations org_to ON d.to_org_id = org_to.id
                LEFT JOIN users u_assigned ON d.assigned_to = u_assigned.id
                WHERE ${whereClause}
                ORDER BY d.created_at DESC
                LIMIT ${limit} OFFSET ${offset}`;
            
            const documents = await db.findMany(sql, params);
            
            const countSql = `SELECT COUNT(*) as total FROM documents d WHERE ${whereClause}`;
            const countResult = await db.findOne(countSql, params);
            const total = countResult.total;
            
            return {
                data: documents,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                    hasNext: page < Math.ceil(total / limit),
                    hasPrev: page > 1
                }
            };
        } catch (error) {
            console.error('Documents query error:', error);
            return { data: [], pagination: { page:1, limit, total:0, totalPages:0, hasNext:false, hasPrev:false } };
        }
    }

    async list(req, res, direction) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            
            // Extract filter parameters from query
            const filters = {
                search: req.query.search || '',
                status: req.query.status || '',
                type_id: req.query.type_id || '',
                from_date: req.query.from_date || '',
                to_date: req.query.to_date || ''
            };

            const result = await this.getSimpleDocuments(direction, page, limit, filters);
            const stats = await this.getDirectionStats(direction);
            const master = await this.loadMasterData();

            res.render('documents/list', {
                title: direction === 'incoming' ? 'Văn bản đến' : 'Văn bản đi',
                user: req.session.user,
                direction,
                documents: result.data,
                pagination: result.pagination,
                filters: filters, // pass filters to template for form repopulation
                stats,
                types: master.types,
                success: req.flash('success'),
                error: req.flash('error')
            });
        } catch (error) {
            console.error('Error in DocumentController list:', error);
            req.flash('error', 'Không thể tải danh sách văn bản');
            res.redirect('/dashboard');
        }
    }

    async incoming(req, res) {
        return this.list(req, res, 'incoming');
    }

    async outgoing(req, res) {
        return this.list(req, res, 'outgoing');
    }

    async create(req, res) {
        try {
            const master = await this.loadMasterData();
            const users = await db.findMany('SELECT id, full_name FROM users WHERE is_active = 1 ORDER BY full_name');
            const organizations = await db.findMany('SELECT id, name FROM organizations WHERE is_active = 1 ORDER BY name');

            res.render('documents/create', {
                title: 'Thêm văn bản mới',
                user: req.session.user,
                types: master.types,
                users,
                organizations,
                formData: req.session.formData || {},
                error: req.flash('error')
            });

            // Clear form data from session
            delete req.session.formData;
        } catch (error) {
            console.error('Error in DocumentController create:', error);
            req.flash('error', 'Không thể tải form tạo văn bản');
            res.redirect('/documents');
        }
    }

    async store(req, res) {
        // Debug nếu cần:
        if (process.env.NODE_ENV === 'development') {
            console.log('📝 [DocumentController.store] Raw body:', req.body);
            if (req.files) {
                console.log('📎 Uploaded files:', req.files.map(f => ({ original: f.originalname, saved: f.filename, size: f.size })));
            }
            console.log('👤 Session user:', req.session?.user && { id: req.session.user.id, username: req.session.user.username });
        }
        try {
            const {
                direction, document_number, title, type_id, type_label, content_summary,
                issue_date, received_date, processing_deadline, priority,
                status, assigned_to, assigned_to_label,
                from_org_id, from_org_label,
                to_org_id, to_org_label,
                chi_dao
            } = req.body;

            // Validate required fields
            if (!direction || !document_number || !title) {
                req.flash('error', 'Vui lòng nhập đầy đủ thông tin bắt buộc (Loại văn bản, Số hiệu, Tiêu đề)');
                req.session.formData = req.body;
                return res.redirect('/documents/create');
            }

            // Check if document number already exists
            const existingDoc = await db.findOne('SELECT id FROM documents WHERE document_number = ?', [document_number]);
            if (existingDoc) {
                req.flash('error', 'Số hiệu văn bản đã tồn tại trong hệ thống');
                req.session.formData = req.body;
                return res.redirect('/documents/create');
            }

            const resolvedTypeId = await this.resolveDocumentType(type_id, type_label);
            const resolvedAssignedTo = await this.resolveUserReference(assigned_to, assigned_to_label);
            const resolvedFromOrg = await this.resolveOrganization(from_org_id, from_org_label);
            const resolvedToOrg = await this.resolveOrganization(to_org_id, to_org_label);

            const allowedStatuses = ['draft', 'pending', 'processing', 'completed', 'approved', 'archived'];
            const normalizedStatus = allowedStatuses.includes(status) ? status : 'pending';

            // Prepare document data - handle empty dates properly
            const documentData = {
                direction,
                document_number: document_number.trim(),
                title: title.trim(),
                type_id: resolvedTypeId || null,
                content_summary: content_summary?.trim() || null,
                issue_date: issue_date && issue_date.trim() ? issue_date : null,
                received_date: received_date && received_date.trim() ? received_date : null,
                processing_deadline: processing_deadline && processing_deadline.trim() ? processing_deadline : null,
                priority: priority || 'medium',
                status: normalizedStatus,
                assigned_to: resolvedAssignedTo || null,
                from_org_id: resolvedFromOrg || null,
                to_org_id: resolvedToOrg || null,
                chi_dao: req.body.chi_dao?.trim() || null,
                created_by: req.session.user.id,
                created_at: new Date()
            };

            // TODO: xử lý lưu file đính kèm (req.files) sau
            // Insert document
            const result = await db.insert(
                `INSERT INTO documents (direction, document_number, title, type_id, content_summary, 
                 issue_date, received_date, processing_deadline, priority, status, assigned_to, 
                 from_org_id, to_org_id, chi_dao, created_by, created_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    documentData.direction, documentData.document_number, documentData.title,
                    documentData.type_id, documentData.content_summary, documentData.issue_date,
                    documentData.received_date, documentData.processing_deadline, documentData.priority,
                    documentData.status, documentData.assigned_to, documentData.from_org_id,
                    documentData.to_org_id, documentData.chi_dao, documentData.created_by, documentData.created_at
                ]
            );

            if (result.insertId) {
                // Save files metadata if any
                if (req.files && req.files.length) {
                    for (const f of req.files) {
                        try {
                            const relPath = require('path').relative(process.cwd(), f.path).replace(/\\/g,'/');
                            await db.insert(
                                `INSERT INTO document_attachments (document_id, filename, original_name, file_path, file_size, mime_type, uploaded_by) VALUES (?,?,?,?,?,?,?)`,
                                [
                                    result.insertId,
                                    f.filename,
                                    f.originalname,
                                    relPath,
                                    f.size,
                                    f.mimetype,
                                    req.session.user.id
                                ]
                            );
                        } catch (fileErr) {
                            console.error('Failed to save file metadata:', fileErr.message);
                        }
                    }
                }
                req.flash('success', 'Tạo văn bản thành công');
                const redirectUrl = direction === 'incoming' ? '/documents/incoming' : '/documents/outgoing';
                res.redirect(redirectUrl);
            } else {
                throw new Error('Failed to insert document');
            }

        } catch (error) {
            console.error('Error in DocumentController store:', error);
            req.flash('error', 'Không thể tạo văn bản. Vui lòng thử lại.');
            req.session.formData = req.body;
            res.redirect('/documents/create');
        }
    }

    // API cập nhật chỉ đạo (chi_dao) và ghi lịch sử
    async updateDirective(req, res) {
        try {
            const id = req.params.id;
            const { chi_dao, note } = req.body;
            if (!chi_dao) return res.status(400).json({ success: false, message: 'Chỉ đạo không được để trống' });
            const old = await db.findOne('SELECT chi_dao FROM documents WHERE id = ?', [id]);
            if (!old) return res.status(404).json({ success: false, message: 'Không tìm thấy văn bản' });
            await db.query('UPDATE documents SET chi_dao = ?, updated_at = NOW() WHERE id = ?', [chi_dao.trim(), id]);
            await db.query(`INSERT INTO document_directive_history (document_id, old_value, new_value, action, acted_by, note) VALUES (?, ?, ?, 'update', ?, ?)`,
                [id, old.chi_dao || null, chi_dao.trim(), req.session.user.id, note || null]);
            res.json({ success: true, message: 'Đã cập nhật chỉ đạo', chi_dao });
        } catch (e) {
            console.error('updateDirective error:', e);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    async approveDirective(req, res) {
        try {
            const id = req.params.id;
            const { note } = req.body;
            const doc = await db.findOne('SELECT chi_dao FROM documents WHERE id=?', [id]);
            if (!doc) return res.status(404).json({ success: false, message: 'Không tìm thấy văn bản' });
            if (!doc.chi_dao) return res.status(400).json({ success: false, message: 'Chưa có nội dung để duyệt' });
            await db.query(`INSERT INTO document_directive_history (document_id, old_value, new_value, action, acted_by, note) VALUES (?, ?, ?, 'approve', ?, ?)`,
                [id, doc.chi_dao, doc.chi_dao, req.session.user.id, note || null]);
            res.json({ success: true, message: 'Đã duyệt chỉ đạo' });
        } catch (e) {
            console.error('approveDirective error:', e);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    // Xem chi tiết văn bản
    async show(req, res) {
        try {
            const id = req.params.id;
            
            const sql = `
                SELECT d.*, 
                       dt.name AS document_type_name,
                       org_from.name AS from_organization_name,
                       org_to.name AS to_organization_name,
                       u_created.full_name AS created_by_name,
                       u_assigned.full_name AS assigned_to_name
                FROM documents d
                LEFT JOIN document_types dt ON d.type_id = dt.id
                LEFT JOIN organizations org_from ON d.from_org_id = org_from.id
                LEFT JOIN organizations org_to ON d.to_org_id = org_to.id
                LEFT JOIN users u_created ON d.created_by = u_created.id
                LEFT JOIN users u_assigned ON d.assigned_to = u_assigned.id
                WHERE d.id = ?
            `;
            
            const document = await db.findOne(sql, [id]);
            
            if (!document) {
                req.flash('error', 'Không tìm thấy văn bản');
                return res.redirect('/documents');
            }

            // Lấy lịch sử chỉ đạo
            const historySQL = `
                SELECT ddh.*, u.full_name AS acted_by_name
                FROM document_directive_history ddh
                LEFT JOIN users u ON ddh.acted_by = u.id
                WHERE ddh.document_id = ?
                ORDER BY ddh.created_at DESC
            `;
            const history = await db.findMany(historySQL, [id]);

            // Lấy files đính kèm
            const filesSQL = `
                SELECT id, original_name, filename, file_size, mime_type, uploaded_at
                FROM document_attachments
                WHERE document_id = ?
                ORDER BY uploaded_at DESC
            `;
            const files = await db.findMany(filesSQL, [id]);
            document.files = files.map(f => ({
                id: f.id,
                original_name: f.original_name,
                size: f.file_size,
                mime_type: f.mime_type,
                filename: f.filename,
                uploaded_at: f.uploaded_at
            }));

            res.render('documents/show', {
                title: `Văn bản: ${document.document_number}`,
                user: req.session.user,
                document,
                history,
                success: req.flash('success'),
                error: req.flash('error')
            });

        } catch (error) {
            console.error('Error in DocumentController show:', error);
            req.flash('error', 'Không thể tải chi tiết văn bản');
            res.redirect('/documents');
        }
    }
    // Hiển thị form sửa văn bản
    async edit(req, res) {
        try {
            const id = req.params.id;
            const document = await db.findOne('SELECT * FROM documents WHERE id = ?', [id]);

            const master = await this.loadMasterData();
            const users = await db.findMany('SELECT id, full_name FROM users WHERE is_active = 1 ORDER BY full_name');
            const organizations = await db.findMany('SELECT id, name FROM organizations WHERE is_active = 1 ORDER BY name');

            res.render('documents/edit', {
                title: 'Sửa văn bản',
                user: req.session.user,
                document,
                types: master.types,
                users,
                organizations,
                error: req.flash('error')
            });

        } catch (error) {
            console.error('Error in DocumentController edit:', error);
            req.flash('error', 'Không thể tải form sửa văn bản');
            res.redirect('/documents');
        }
    }

    // Cập nhật văn bản
    async update(req, res) {
        const documentId = req.params?.id;

        try {
            if (!documentId) {
                req.flash('error', 'Thiếu mã văn bản để cập nhật');
                return res.redirect('/documents');
            }

            const {
                direction, document_number, title, type_id, type_label, content_summary,
                issue_date, received_date, processing_deadline, priority,
                assigned_to, assigned_to_label,
                from_org_id, from_org_label,
                to_org_id, to_org_label,
                chi_dao, status
            } = req.body;

            // Validate required fields
            if (!direction || !document_number || !title) {
                req.flash('error', 'Vui lòng nhập đầy đủ thông tin bắt buộc');
                return res.redirect(`/documents/${documentId}/edit`);
            }

            // Check if document number already exists (exclude current document)
            const existingDoc = await db.findOne('SELECT id FROM documents WHERE document_number = ? AND id != ?', [document_number, documentId]);
            if (existingDoc) {
                req.flash('error', 'Số hiệu văn bản đã tồn tại trong hệ thống');
                return res.redirect(`/documents/${documentId}/edit`);
            }

            // Prepare update data
            const allowedStatuses = ['draft', 'pending', 'processing', 'completed', 'approved', 'archived'];
            const normalizedStatus = allowedStatuses.includes(status) ? status : 'pending';

            const resolvedTypeId = await this.resolveDocumentType(type_id, type_label);
            const resolvedAssignedTo = await this.resolveUserReference(assigned_to, assigned_to_label);
            const resolvedFromOrg = await this.resolveOrganization(from_org_id, from_org_label);
            const resolvedToOrg = await this.resolveOrganization(to_org_id, to_org_label);

            const updateSQL = `
                UPDATE documents SET 
                    direction = ?, document_number = ?, title = ?, type_id = ?,
                    content_summary = ?, issue_date = ?, received_date = ?,
                    processing_deadline = ?, priority = ?, status = ?, assigned_to = ?,
                    from_org_id = ?, to_org_id = ?, chi_dao = ?, updated_at = NOW()
                WHERE id = ?
            `;

            await db.query(updateSQL, [
                direction, document_number.trim(), title.trim(), resolvedTypeId || null,
                content_summary?.trim() || null, 
                issue_date || null, received_date || null,
                processing_deadline || null, priority || 'medium', normalizedStatus,
                resolvedAssignedTo || null, resolvedFromOrg || null, resolvedToOrg || null,
                chi_dao?.trim() || null, documentId
            ]);

            // Save new files metadata if any
            if (req.files && req.files.length) {
                for (const f of req.files) {
                    try {
                        const relPath = require('path').relative(process.cwd(), f.path).replace(/\\/g,'/');
                        await db.insert(
                            `INSERT INTO document_attachments (document_id, filename, original_name, file_path, file_size, mime_type, uploaded_by) VALUES (?,?,?,?,?,?,?)`,
                            [
                                id,
                                f.filename,
                                f.originalname,
                                relPath,
                                f.size,
                                f.mimetype,
                                req.session.user.id
                            ]
                        );
                    } catch (fileErr) {
                        console.error('Failed to save file metadata in update:', fileErr.message);
                    }
                }
            }

            req.flash('success', 'Cập nhật văn bản thành công');
            res.redirect(`/documents/${documentId}`);

        } catch (error) {
            console.error('Error in DocumentController update:', error);
            req.flash('error', 'Không thể cập nhật văn bản');
            if (documentId) {
                res.redirect(`/documents/${documentId}/edit`);
            } else {
                res.redirect('/documents');
            }
        }
    }

    // Xóa văn bản
    async destroy(req, res) {
        try {
            const id = req.params.id;
            
            // Kiểm tra văn bản có tồn tại không
            const document = await db.findOne('SELECT document_number FROM documents WHERE id = ?', [id]);
            if (!document) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy văn bản' });
            }

            // Xóa văn bản (CASCADE sẽ tự động xóa history)
            await db.query('DELETE FROM documents WHERE id = ?', [id]);

            res.json({ success: true, message: 'Đã xóa văn bản thành công' });

        } catch (error) {
            console.error('Error in DocumentController destroy:', error);
            res.status(500).json({ success: false, message: 'Không thể xóa văn bản' });
        }
    }

    // Lấy danh sách file đính kèm (JSON)
    async files(req, res) {
        try {
            const id = req.params.id;
            const files = await db.findMany('SELECT id, original_name, filename, file_path, file_size, mime_type, uploaded_at FROM document_attachments WHERE document_id = ? ORDER BY id DESC', [id]);
            // Chuẩn hóa tên trường cho frontend cũ (nếu còn dùng stored_name/size)
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

    // Xem trước file (hỗ trợ: pdf, hình ảnh, txt, word via Office Online/Google Docs)
    async previewFile(req, res) {
        try {
            const fileId = req.params.fileId;
            const file = await db.findOne('SELECT * FROM document_attachments WHERE id = ?', [fileId]);
            if (!file) return res.status(404).send('Không tìm thấy file');

            const uploadRoot = path.resolve(config.upload.uploadPath);
            
            // Normalize file_path: remove leading slash if present
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

            // Supported inline preview types (thêm Word)
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
            
            // Với Word: trả file để browser xử lý (hoặc dùng Office Online nếu public URL)
            res.setHeader('Content-Type', file.mime_type);
            res.sendFile(absPath);
        } catch (e) {
            console.error('previewFile error:', e);
            res.status(500).send('Lỗi server');
        }
    }

    // Trả thông tin preview ở dạng JSON (phục vụ fetch trước khi mở modal)
    async previewInfo(req, res) {
        try {
            const fileId = req.params.fileId;
            const file = await db.findOne('SELECT * FROM document_attachments WHERE id = ?', [fileId]);
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

            const uploadRoot = path.resolve(config.upload.uploadPath);
            
            // Normalize file_path: remove leading slash if present
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

    async downloadFile(req, res) {
        try {
            const fileId = req.params.fileId;
            const file = await db.findOne('SELECT * FROM document_attachments WHERE id = ?', [fileId]);
            if (!file) return res.status(404).send('Không tìm thấy file');
            
            const uploadRoot = path.resolve(config.upload.uploadPath);
            
            // Normalize file_path: remove leading slash if present (Unix-style path stored on Windows)
            let filePath = file.file_path;
            if (filePath.startsWith('/')) {
                filePath = filePath.substring(1); // Remove leading /
            }
            
            const absPath = path.isAbsolute(filePath)
                ? path.resolve(filePath)
                : path.resolve(process.cwd(), filePath);
            
            console.log('Download Debug:', {
                fileId,
                originalPath: file.file_path,
                normalizedPath: filePath,
                uploadRoot,
                absPath,
                startsWith: absPath.startsWith(uploadRoot)
            });
            
            if (!absPath.startsWith(uploadRoot)) {
                console.warn('Blocked download outside upload root:', { filePath: file.file_path, absPath, uploadRoot });
                return res.status(400).send('Đường dẫn không hợp lệ');
            }
            
            // Check if file exists
            if (!require('fs').existsSync(absPath)) {
                console.error('File not found on disk:', absPath);
                return res.status(404).send('File không tồn tại trên hệ thống');
            }
            
            res.download(absPath, file.original_name);
        } catch (e) {
            console.error('downloadFile error:', e);
            res.status(500).send('Lỗi server');
        }
    }
}

module.exports = DocumentController;
