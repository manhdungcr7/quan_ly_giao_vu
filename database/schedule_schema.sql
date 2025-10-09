-- ============================================================================
-- WORK SCHEDULE MANAGEMENT SCHEMA
-- Quản lý lịch công tác
-- ============================================================================

-- Bảng lịch công tác
CREATE TABLE IF NOT EXISTS work_schedules (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL COMMENT 'Tiêu đề sự kiện',
    description TEXT COMMENT 'Mô tả chi tiết',
    event_type ENUM('meeting', 'teaching', 'exam', 'admin', 'ceremony', 'training', 'other') 
        DEFAULT 'other' COMMENT 'Loại sự kiện',
    
    -- Thời gian
    start_datetime DATETIME NOT NULL COMMENT 'Thời gian bắt đầu',
    end_datetime DATETIME NOT NULL COMMENT 'Thời gian kết thúc',
    is_all_day BOOLEAN DEFAULT FALSE COMMENT 'Sự kiện cả ngày',
    timezone VARCHAR(50) DEFAULT 'Asia/Ho_Chi_Minh' COMMENT 'Múi giờ',
    
    -- Lặp lại
    recurrence_rule VARCHAR(255) COMMENT 'Quy tắc lặp lại (iCal RRULE)',
    recurrence_end_date DATE COMMENT 'Ngày kết thúc lặp',
    
    -- Địa điểm
    location VARCHAR(255) COMMENT 'Địa điểm',
    room VARCHAR(100) COMMENT 'Phòng',
    building VARCHAR(100) COMMENT 'Tòa nhà',
    online_meeting_url VARCHAR(500) COMMENT 'Link họp online',
    
    -- Người tổ chức
    organizer_id INT UNSIGNED NOT NULL COMMENT 'Người tổ chức',
    
    -- Trạng thái
    status ENUM('draft', 'confirmed', 'cancelled', 'completed', 'postponed') 
        DEFAULT 'confirmed' COMMENT 'Trạng thái',
    priority ENUM('low', 'normal', 'high', 'urgent') 
        DEFAULT 'normal' COMMENT 'Độ ưu tiên',
    
    -- Tuỳ chỉnh hiển thị
    color VARCHAR(20) COMMENT 'Màu sắc (hex)',
    icon VARCHAR(50) COMMENT 'Icon (FontAwesome class)',
    tags JSON COMMENT 'Tags/Labels',
    
    -- Thông báo
    reminder_minutes INT DEFAULT 15 COMMENT 'Nhắc trước (phút)',
    reminder_sent BOOLEAN DEFAULT FALSE COMMENT 'Đã gửi nhắc nhở',
    reminder_sent_at DATETIME COMMENT 'Thời điểm gửi nhắc',
    
    -- Tài liệu
    attachments JSON COMMENT 'File đính kèm',
    
    -- Ghi chú
    notes TEXT COMMENT 'Ghi chú nội bộ',
    public_notes TEXT COMMENT 'Ghi chú công khai',
    
    -- Metadata
    created_by INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_datetime (start_datetime, end_datetime),
    INDEX idx_type (event_type),
    INDEX idx_status (status),
    INDEX idx_organizer (organizer_id),
    INDEX idx_date_range (start_datetime, end_datetime, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Lịch công tác';

-- Bảng người tham gia
CREATE TABLE IF NOT EXISTS schedule_participants (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    schedule_id INT UNSIGNED NOT NULL COMMENT 'ID lịch công tác',
    user_id INT UNSIGNED NOT NULL COMMENT 'ID người tham gia',
    role ENUM('organizer', 'required', 'optional', 'viewer') 
        DEFAULT 'required' COMMENT 'Vai trò',
    status ENUM('pending', 'accepted', 'declined', 'tentative', 'no_response') 
        DEFAULT 'pending' COMMENT 'Trạng thái tham gia',
    response_at TIMESTAMP NULL COMMENT 'Thời gian phản hồi',
    notes TEXT COMMENT 'Ghi chú của người tham gia',
    notification_sent BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (schedule_id) REFERENCES work_schedules(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_participant (schedule_id, user_id),
    INDEX idx_user (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Người tham gia lịch';

-- Bảng ngoại lệ lặp lại
CREATE TABLE IF NOT EXISTS schedule_exceptions (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    schedule_id INT UNSIGNED NOT NULL COMMENT 'ID lịch gốc',
    exception_date DATE NOT NULL COMMENT 'Ngày ngoại lệ',
    action ENUM('skip', 'modify') DEFAULT 'skip' COMMENT 'Hành động',
    modified_data JSON COMMENT 'Dữ liệu thay đổi',
    reason TEXT COMMENT 'Lý do',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_exception (schedule_id, exception_date),
    INDEX idx_schedule_id (schedule_id),
    CONSTRAINT fk_exception_schedule FOREIGN KEY (schedule_id) REFERENCES work_schedules(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Ngoại lệ lịch lặp';

-- Bảng lịch sử thay đổi
CREATE TABLE IF NOT EXISTS schedule_history (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    schedule_id INT UNSIGNED NOT NULL,
    action ENUM('created', 'updated', 'cancelled', 'rescheduled', 'deleted') NOT NULL,
    changed_by INT UNSIGNED NOT NULL,
    old_data JSON COMMENT 'Dữ liệu cũ',
    new_data JSON COMMENT 'Dữ liệu mới',
    change_summary TEXT COMMENT 'Tóm tắt thay đổi',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_schedule (schedule_id),
    INDEX idx_date (created_at),
    CONSTRAINT fk_history_schedule FOREIGN KEY (schedule_id) REFERENCES work_schedules(id) ON DELETE CASCADE,
    CONSTRAINT fk_history_user FOREIGN KEY (changed_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Lịch sử thay đổi';

-- Bảng mẫu sự kiện
CREATE TABLE IF NOT EXISTS schedule_templates (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    template_data JSON NOT NULL COMMENT 'Dữ liệu mẫu',
    category VARCHAR(100),
    is_public BOOLEAN DEFAULT FALSE,
    usage_count INT DEFAULT 0,
    
    created_by INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Mẫu sự kiện';

-- Bảng giảng viên tùy chỉnh cho lịch giảng
CREATE TABLE IF NOT EXISTS teaching_custom_lecturers (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL COMMENT 'Tên hiển thị của giảng viên',
    email VARCHAR(255) DEFAULT NULL COMMENT 'Email liên hệ',
    note TEXT COMMENT 'Ghi chú bổ sung',
    anchor_key VARCHAR(255) DEFAULT NULL COMMENT 'Khóa neo vào giảng viên khác (id:..., name:..., custom:...)',
    created_by INT UNSIGNED NOT NULL COMMENT 'Người tạo',
    updated_by INT UNSIGNED DEFAULT NULL COMMENT 'Người chỉnh sửa cuối',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_teaching_custom_lecturers_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_teaching_custom_lecturers_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_teaching_custom_lecturers_anchor (anchor_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Giảng viên tùy chỉnh cho lịch giảng';
