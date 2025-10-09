-- ============================================================================
-- EXAMINATION ENHANCEMENT - Thêm chức năng chấm thi và nhắc việc
-- ============================================================================

-- Thêm cột grader_id (Cán bộ chấm thi) vào examination_sessions
ALTER TABLE examination_sessions 
ADD COLUMN grader_id INT COMMENT 'ID cán bộ chấm thi' AFTER actual_copies,
ADD COLUMN grading_deadline DATE COMMENT 'Hạn chấm bài' AFTER grader_id,
ADD COLUMN reminder_sent BOOLEAN DEFAULT FALSE COMMENT 'Đã gửi nhắc việc' AFTER grading_deadline,
ADD COLUMN reminder_sent_at TIMESTAMP NULL COMMENT 'Thời gian gửi nhắc việc' AFTER reminder_sent,
ADD INDEX idx_grader (grader_id),
ADD INDEX idx_grading_deadline (grading_deadline);

-- Comment: grader_id tham chiếu đến bảng users (cán bộ)
-- Không tạo foreign key để linh hoạt trong trường hợp cán bộ bị xóa

-- Bảng lịch sử nhắc việc
CREATE TABLE IF NOT EXISTS examination_reminders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    session_id INT NOT NULL COMMENT 'ID ca thi',
    reminder_type ENUM('grading', 'invigilator', 'paper', 'other') DEFAULT 'grading' COMMENT 'Loại nhắc việc',
    recipient_id INT NOT NULL COMMENT 'ID người nhận',
    recipient_email VARCHAR(255) COMMENT 'Email người nhận',
    subject VARCHAR(500) COMMENT 'Tiêu đề',
    message TEXT COMMENT 'Nội dung',
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian gửi',
    status ENUM('sent', 'failed', 'pending') DEFAULT 'pending' COMMENT 'Trạng thái',
    sent_by INT COMMENT 'Người gửi',
    FOREIGN KEY (session_id) REFERENCES examination_sessions(id) ON DELETE CASCADE,
    INDEX idx_session (session_id),
    INDEX idx_recipient (recipient_id),
    INDEX idx_sent_at (sent_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Lịch sử nhắc việc';

-- View để lấy thông tin ca thi kèm cán bộ chấm
CREATE OR REPLACE VIEW v_examination_sessions_with_grader AS
SELECT 
    es.*,
    ep.name as period_name,
    s.code as subject_code,
    s.name as subject_name,
    c.code as class_code,
    c.name as class_name,
    u.full_name as grader_name,
    u.email as grader_email,
    DATEDIFF(es.grading_deadline, CURDATE()) as days_until_deadline,
    CASE 
        WHEN es.grading_deadline IS NULL THEN 'no_deadline'
        WHEN CURDATE() > es.grading_deadline THEN 'overdue'
        WHEN DATEDIFF(es.grading_deadline, CURDATE()) <= 3 THEN 'urgent'
        WHEN DATEDIFF(es.grading_deadline, CURDATE()) <= 7 THEN 'soon'
        ELSE 'normal'
    END as deadline_status
FROM examination_sessions es
LEFT JOIN examination_periods ep ON es.period_id = ep.id
LEFT JOIN subjects s ON es.subject_id = s.id
LEFT JOIN classes c ON es.class_id = c.id
LEFT JOIN users u ON es.grader_id = u.id;
