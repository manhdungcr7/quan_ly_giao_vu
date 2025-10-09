const BaseModel = require('./BaseModel');

class Document extends BaseModel {
    constructor() {
        super('documents');
    }

    // Lấy tài liệu với thông tin chi tiết
    async findWithDetails(id) {
        try {
            const sql = `
                SELECT d.*, 
                       dt.name as document_type_name,
                       org_from.name as from_organization_name,
                       org_to.name as to_organization_name,
                       u_created.full_name as created_by_name,
                       u_assigned.full_name as assigned_to_name,
                       u_approved.full_name as approved_by_name
                FROM documents d
                LEFT JOIN document_types dt ON d.type_id = dt.id
                LEFT JOIN organizations org_from ON d.from_org_id = org_from.id
                LEFT JOIN organizations org_to ON d.to_org_id = org_to.id
                LEFT JOIN users u_created ON d.created_by = u_created.id
                LEFT JOIN users u_assigned ON d.assigned_to = u_assigned.id
                LEFT JOIN users u_approved ON d.approved_by = u_approved.id
                WHERE d.id = ?
            `;
            return await this.db.findOne(sql, [id]);
        } catch (error) {
            console.error('Error in Document findWithDetails:', error);
            throw error;
        }
    }

    // Lấy danh sách tài liệu với bộ lọc
    async getDocumentsWithFilters(page = 1, limit = 20, filters = {}) {
        try {
            const offset = (page - 1) * limit;
            let whereClause = 'WHERE 1=1';
            const params = [];

            // Thêm các bộ lọc
            if (filters.direction) {
                whereClause += ' AND d.direction = ?';
                params.push(filters.direction);
            }

            if (filters.type_id) {
                whereClause += ' AND d.type_id = ?';
                params.push(filters.type_id);
            }

            if (filters.status) {
                whereClause += ' AND d.status = ?';
                params.push(filters.status);
            }

            if (filters.priority) {
                whereClause += ' AND d.priority = ?';
                params.push(filters.priority);
            }

            if (filters.assigned_to) {
                whereClause += ' AND d.assigned_to = ?';
                params.push(filters.assigned_to);
            }

            if (filters.from_date) {
                whereClause += ' AND d.issue_date >= ?';
                params.push(filters.from_date);
            }

            if (filters.to_date) {
                whereClause += ' AND d.issue_date <= ?';
                params.push(filters.to_date);
            }

            if (filters.search) {
                whereClause += ' AND (d.document_number LIKE ? OR d.title LIKE ? OR d.content_summary LIKE ?)';
                const searchTerm = `%${filters.search}%`;
                params.push(searchTerm, searchTerm, searchTerm);
            }

            const sql = `
                SELECT d.id, d.document_number, d.title, d.direction, d.issue_date,
                       d.status, d.priority, d.processing_deadline,
                       dt.name as document_type_name,
                       org_from.name as from_organization_name,
                       org_to.name as to_organization_name,
                       u_assigned.full_name as assigned_to_name
                FROM documents d
                LEFT JOIN document_types dt ON d.type_id = dt.id
                LEFT JOIN organizations org_from ON d.from_org_id = org_from.id
                LEFT JOIN organizations org_to ON d.to_org_id = org_to.id
                LEFT JOIN users u_assigned ON d.assigned_to = u_assigned.id
                ${whereClause}
                ORDER BY d.created_at DESC
                LIMIT ? OFFSET ?
            `;
            params.push(limit, offset);

            const documents = await this.db.findMany(sql, params);

            // Đếm tổng số
            const countSql = `
                SELECT COUNT(*) as total
                FROM documents d
                LEFT JOIN document_types dt ON d.type_id = dt.id
                LEFT JOIN organizations org_from ON d.from_org_id = org_from.id
                LEFT JOIN organizations org_to ON d.to_org_id = org_to.id
                ${whereClause}
            `;
            const countParams = params.slice(0, -2); // Remove limit and offset
            const countResult = await this.db.findOne(countSql, countParams);
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
            console.error('Error in Document getDocumentsWithFilters:', error);
            throw error;
        }
    }

    // Tìm tài liệu theo số văn bản
    async findByDocumentNumber(documentNumber) {
        try {
            const sql = 'SELECT * FROM documents WHERE document_number = ?';
            return await this.db.findOne(sql, [documentNumber]);
        } catch (error) {
            console.error('Error in Document findByDocumentNumber:', error);
            throw error;
        }
    }

    // Lấy tài liệu được giao cho user
    async getAssignedDocuments(userId, status = null) {
        try {
            let sql = `
                SELECT d.*, dt.name as document_type_name,
                       org_from.name as from_organization_name
                FROM documents d
                LEFT JOIN document_types dt ON d.type_id = dt.id
                LEFT JOIN organizations org_from ON d.from_org_id = org_from.id
                WHERE d.assigned_to = ?
            `;
            const params = [userId];

            if (status) {
                sql += ' AND d.status = ?';
                params.push(status);
            }

            sql += ' ORDER BY d.priority DESC, d.processing_deadline ASC';

            return await this.db.findMany(sql, params);
        } catch (error) {
            console.error('Error in Document getAssignedDocuments:', error);
            throw error;
        }
    }

    // Lấy tài liệu sắp hết hạn
    async getUpcomingDeadlines(days = 7) {
        try {
            const sql = `
                SELECT d.*, dt.name as document_type_name,
                       u.full_name as assigned_to_name,
                       DATEDIFF(d.processing_deadline, CURDATE()) as days_left
                FROM documents d
                LEFT JOIN document_types dt ON d.type_id = dt.id
                LEFT JOIN users u ON d.assigned_to = u.id
                WHERE d.processing_deadline IS NOT NULL
                AND d.processing_deadline >= CURDATE()
                AND d.processing_deadline <= DATE_ADD(CURDATE(), INTERVAL ? DAY)
                AND d.status IN ('pending', 'processing')
                ORDER BY d.processing_deadline ASC
            `;
            return await this.db.findMany(sql, [days]);
        } catch (error) {
            console.error('Error in Document getUpcomingDeadlines:', error);
            throw error;
        }
    }

    // Lấy tài liệu quá hạn
    async getOverdueDocuments() {
        try {
            const sql = `
                SELECT d.*, dt.name as document_type_name,
                       u.full_name as assigned_to_name,
                       DATEDIFF(CURDATE(), d.processing_deadline) as days_overdue
                FROM documents d
                LEFT JOIN document_types dt ON d.type_id = dt.id
                LEFT JOIN users u ON d.assigned_to = u.id
                WHERE d.processing_deadline IS NOT NULL
                AND d.processing_deadline < CURDATE()
                AND d.status IN ('pending', 'processing')
                ORDER BY d.processing_deadline ASC
            `;
            return await this.db.findMany(sql);
        } catch (error) {
            console.error('Error in Document getOverdueDocuments:', error);
            throw error;
        }
    }

    // Cập nhật trạng thái tài liệu
    async updateStatus(id, status, userId) {
        try {
            const updateData = {
                status: status,
                updated_at: new Date()
            };

            if (status === 'approved') {
                updateData.approved_by = userId;
                updateData.approved_at = new Date();
            }

            return await super.update(id, updateData);
        } catch (error) {
            console.error('Error in Document updateStatus:', error);
            throw error;
        }
    }

    // Lấy thống kê tài liệu
    async getStats(options = {}) {
        try {
            const filters = [];
            const params = [];

            if (options?.timeRange?.startDate) {
                filters.push('created_at >= ?');
                params.push(options.timeRange.startDate instanceof Date ? options.timeRange.startDate : new Date(options.timeRange.startDate));
            }

            if (options?.timeRange?.endDate) {
                filters.push('created_at <= ?');
                params.push(options.timeRange.endDate instanceof Date ? options.timeRange.endDate : new Date(options.timeRange.endDate));
            }

            const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

            const sql = `
                SELECT 
                    COUNT(*) AS total_documents,
                    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending_count,
                    SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) AS processing_count,
                    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed_count,
                    SUM(CASE WHEN direction = 'incoming' THEN 1 ELSE 0 END) AS incoming_count,
                    SUM(CASE WHEN direction = 'outgoing' THEN 1 ELSE 0 END) AS outgoing_count,
                    SUM(CASE WHEN priority = 'urgent' THEN 1 ELSE 0 END) AS urgent_count,
                    SUM(CASE WHEN processing_deadline < CURDATE() AND status IN ('pending', 'processing') THEN 1 ELSE 0 END) AS overdue_count,
                    SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) AS new_last_30_days
                FROM documents
                ${whereClause}
            `;

            return await this.db.findOne(sql, params);
        } catch (error) {
            console.error('Error in Document getStats:', error);
            throw error;
        }
    }

    // Lấy thống kê theo loại tài liệu
    async getStatsByType() {
        try {
            const sql = `
                SELECT dt.name as document_type,
                       COUNT(d.id) as document_count,
                       SUM(CASE WHEN d.status = 'completed' THEN 1 ELSE 0 END) as completed_count
                FROM document_types dt
                LEFT JOIN documents d ON dt.id = d.type_id AND d.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                GROUP BY dt.id, dt.name
                ORDER BY document_count DESC
            `;
            return await this.db.findMany(sql);
        } catch (error) {
            console.error('Error in Document getStatsByType:', error);
            throw error;
        }
    }

    // Kiểm tra số văn bản đã tồn tại
    async isDocumentNumberExists(documentNumber, excludeId = null) {
        try {
            let sql = 'SELECT COUNT(*) as count FROM documents WHERE document_number = ?';
            const params = [documentNumber];

            if (excludeId) {
                sql += ' AND id != ?';
                params.push(excludeId);
            }

            const result = await this.db.findOne(sql, params);
            return result.count > 0;
        } catch (error) {
            console.error('Error in Document isDocumentNumberExists:', error);
            throw error;
        }
    }

    // Lấy file đính kèm của tài liệu
    async getAttachments(documentId) {
        try {
            const sql = `
                SELECT da.*, u.full_name as uploaded_by_name
                FROM document_attachments da
                LEFT JOIN users u ON da.uploaded_by = u.id
                WHERE da.document_id = ?
                ORDER BY da.uploaded_at DESC
            `;
            return await this.db.findMany(sql, [documentId]);
        } catch (error) {
            console.error('Error in Document getAttachments:', error);
            throw error;
        }
    }

    // Thêm file đính kèm
    async addAttachment(documentId, attachmentData) {
        try {
            const sql = `
                INSERT INTO document_attachments 
                (document_id, filename, original_name, file_path, file_size, mime_type, uploaded_by)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            return await this.db.insert(sql, [
                documentId,
                attachmentData.filename,
                attachmentData.original_name,
                attachmentData.file_path,
                attachmentData.file_size,
                attachmentData.mime_type,
                attachmentData.uploaded_by
            ]);
        } catch (error) {
            console.error('Error in Document addAttachment:', error);
            throw error;
        }
    }

    // Xóa file đính kèm
    async removeAttachment(attachmentId) {
        try {
            const sql = 'DELETE FROM document_attachments WHERE id = ?';
            return await this.db.delete(sql, [attachmentId]);
        } catch (error) {
            console.error('Error in Document removeAttachment:', error);
            throw error;
        }
    }
}

module.exports = Document;