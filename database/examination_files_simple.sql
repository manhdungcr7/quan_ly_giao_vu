-- ============================================================================
-- EXAMINATION FILE ATTACHMENTS MIGRATION (NO TRIGGERS)
-- Add file upload support to examination sessions
-- ============================================================================

-- Bảng lưu trữ file đính kèm ca thi
CREATE TABLE IF NOT EXISTS examination_files (
    id INT PRIMARY KEY AUTO_INCREMENT,
    session_id INT NOT NULL COMMENT 'ID ca thi',
    file_name VARCHAR(255) NOT NULL COMMENT 'Tên file gốc',
    file_path VARCHAR(500) NOT NULL COMMENT 'Đường dẫn lưu file',
    file_size INT COMMENT 'Kích thước file (bytes)',
    file_type VARCHAR(100) COMMENT 'Loại file (MIME type)',
    file_extension VARCHAR(10) COMMENT 'Phần mở rộng (.pdf, .docx)',
    uploaded_by INT COMMENT 'Người upload',
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_primary BOOLEAN DEFAULT FALSE COMMENT 'File chính',
    description TEXT COMMENT 'Mô tả file',
    download_count INT DEFAULT 0 COMMENT 'Số lần tải xuống',
    status ENUM('active', 'deleted') DEFAULT 'active',
    metadata JSON COMMENT 'Metadata bổ sung',
    FOREIGN KEY (session_id) REFERENCES examination_sessions(id) ON DELETE CASCADE,
    INDEX idx_session (session_id),
    INDEX idx_type (file_type),
    INDEX idx_uploaded_at (uploaded_at),
    INDEX idx_file_status (session_id, status),
    INDEX idx_primary_file (session_id, is_primary)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='File đính kèm ca thi';
