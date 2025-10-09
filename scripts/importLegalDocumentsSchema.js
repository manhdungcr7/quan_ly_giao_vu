/**
 * Import legal documents schema
 */

const db = require('../config/database');

async function importSchema() {
    try {
        console.log('📦 Creating legal_documents table...');
        
        await db.query(`
            CREATE TABLE IF NOT EXISTS legal_documents (
              id int(11) NOT NULL AUTO_INCREMENT,
              document_number varchar(100) NOT NULL COMMENT 'Số văn bản',
              title varchar(500) NOT NULL COMMENT 'Tiêu đề/Trích yếu',
              document_type varchar(100) NOT NULL COMMENT 'Loại văn bản: Luật, Nghị định, Thông tư, Quyết định, etc',
              issuing_authority varchar(255) NOT NULL COMMENT 'Cơ quan ban hành',
              issue_date date DEFAULT NULL COMMENT 'Ngày ban hành',
              effective_date date DEFAULT NULL COMMENT 'Ngày có hiệu lực',
              expiry_date date DEFAULT NULL COMMENT 'Ngày hết hiệu lực',
              status enum('Còn hiệu lực','Hết hiệu lực','Bị thay thế','Đang dự thảo') DEFAULT 'Còn hiệu lực',
              subject varchar(255) DEFAULT NULL COMMENT 'Lĩnh vực',
              summary text DEFAULT NULL COMMENT 'Tóm tắt nội dung',
              keywords varchar(500) DEFAULT NULL COMMENT 'Từ khóa',
              replaced_by varchar(100) DEFAULT NULL COMMENT 'Văn bản thay thế',
              related_documents text DEFAULT NULL COMMENT 'Văn bản liên quan',
              created_by int(11) DEFAULT NULL,
              updated_by int(11) DEFAULT NULL,
              created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
              updated_at timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
              PRIMARY KEY (id),
              UNIQUE KEY document_number (document_number),
              KEY idx_type (document_type),
              KEY idx_status (status),
              KEY idx_issue_date (issue_date),
              KEY idx_created_by (created_by)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Quản lý văn bản pháp lý'
        `);
        
        console.log('✅ legal_documents table created');
        
        console.log('📦 Creating legal_document_attachments table...');
        
        await db.query(`
            CREATE TABLE IF NOT EXISTS legal_document_attachments (
              id int(11) NOT NULL AUTO_INCREMENT,
              document_id int(11) NOT NULL,
              filename varchar(255) NOT NULL COMMENT 'Tên file trên server',
              original_name varchar(255) NOT NULL COMMENT 'Tên file gốc',
              file_path varchar(500) NOT NULL COMMENT 'Đường dẫn file',
              file_size bigint(20) DEFAULT NULL COMMENT 'Kích thước file (bytes)',
              mime_type varchar(100) DEFAULT NULL COMMENT 'Loại file',
              uploaded_by int(11) DEFAULT NULL,
              uploaded_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
              PRIMARY KEY (id),
              KEY idx_document_id (document_id),
              KEY idx_uploaded_by (uploaded_by),
              CONSTRAINT fk_legal_attachments_document FOREIGN KEY (document_id) REFERENCES legal_documents (id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='File đính kèm văn bản pháp lý'
        `);
        
        console.log('✅ legal_document_attachments table created');
        
        console.log('📦 Inserting sample data...');
        
        await db.query(`
            INSERT IGNORE INTO legal_documents (document_number, title, document_type, issuing_authority, issue_date, effective_date, status, subject, summary, keywords, created_by) VALUES
            ('QC-QLTL-2025', 'Quy chế quản lý tài liệu', 'Quy định', 'Khoa ANDT', '2025-03-12', '2025-04-01', 'Còn hiệu lực', 'Quản lý tài liệu', 'Quy định về quy trình quản lý, lưu trữ và sử dụng tài liệu trong khoa', 'quy chế, tài liệu, lưu trữ', 1),
            ('12/2025/NQ-HĐQT', 'Nghị quyết về quy định học tập', 'Nghị quyết', 'Hội đồng Quản trị', '2025-02-20', '2025-03-01', 'Còn hiệu lực', 'Đào tạo', 'Quy định về điều kiện, thời gian và hình thức học tập của sinh viên', 'nghị quyết, học tập, đào tạo', 1)
        `);
        
        console.log('✅ Sample data inserted');
        console.log('\n🎉 Schema import completed successfully!\n');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error importing schema:', error);
        process.exit(1);
    }
}

importSchema();
