-- ============================================================================
-- EXAMINATION MANAGEMENT SCHEMA
-- Quản lý công tác khảo thí
-- ============================================================================

-- Bảng kỳ thi
CREATE TABLE IF NOT EXISTS examination_periods (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL COMMENT 'Tên kỳ thi',
    semester VARCHAR(50) COMMENT 'Học kỳ',
    academic_year VARCHAR(20) COMMENT 'Năm học',
    start_date DATE COMMENT 'Ngày bắt đầu',
    end_date DATE COMMENT 'Ngày kết thúc',
    status ENUM('draft', 'active', 'completed', 'cancelled') DEFAULT 'draft' COMMENT 'Trạng thái',
    description TEXT COMMENT 'Mô tả',
    created_by INT COMMENT 'Người tạo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_dates (start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Kỳ thi';

-- Bảng môn học
CREATE TABLE IF NOT EXISTS subjects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) UNIQUE NOT NULL COMMENT 'Mã môn học',
    name VARCHAR(255) NOT NULL COMMENT 'Tên môn học',
    credits INT COMMENT 'Số tín chỉ',
    department VARCHAR(100) COMMENT 'Khoa/Bộ môn',
    theory_hours INT COMMENT 'Số giờ lý thuyết',
    practice_hours INT COMMENT 'Số giờ thực hành',
    exam_duration INT DEFAULT 90 COMMENT 'Thời gian thi (phút)',
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_department (department)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Môn học';

-- Bảng lớp học
CREATE TABLE IF NOT EXISTS classes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) UNIQUE NOT NULL COMMENT 'Mã lớp',
    name VARCHAR(255) NOT NULL COMMENT 'Tên lớp',
    subject_id INT COMMENT 'ID môn học',
    teacher_id INT COMMENT 'ID giảng viên',
    semester VARCHAR(50) COMMENT 'Học kỳ',
    academic_year VARCHAR(20) COMMENT 'Năm học',
    student_count INT DEFAULT 0 COMMENT 'Số lượng sinh viên',
    status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL,
    INDEX idx_code (code),
    INDEX idx_semester (semester, academic_year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Lớp học';

-- Bảng ca thi
CREATE TABLE IF NOT EXISTS examination_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    period_id INT NOT NULL COMMENT 'ID kỳ thi',
    subject_id INT NOT NULL COMMENT 'ID môn học',
    class_id INT COMMENT 'ID lớp học',
    exam_code VARCHAR(50) UNIQUE COMMENT 'Mã ca thi',
    exam_name VARCHAR(255) COMMENT 'Tên bài thi',
    exam_date DATE NOT NULL COMMENT 'Ngày thi',
    exam_time TIME NOT NULL COMMENT 'Giờ thi',
    duration INT DEFAULT 90 COMMENT 'Thời lượng (phút)',
    room VARCHAR(100) COMMENT 'Phòng thi',
    building VARCHAR(100) COMMENT 'Tòa nhà',
    student_count INT DEFAULT 0 COMMENT 'Số lượng sinh viên',
    expected_copies INT COMMENT 'Dự kiến số bản cần in',
    actual_copies INT COMMENT 'Số bản thực tế',
    grader_id INT UNSIGNED COMMENT 'ID cán bộ chấm thi',
    grader_manual_name VARCHAR(120) COMMENT 'Tên cán bộ chấm nhập tay',
    grading_deadline DATE COMMENT 'Hạn chấm bài',
    link VARCHAR(500) COMMENT 'Link thi online',
    exam_type ENUM('online', 'offline', 'hybrid') DEFAULT 'offline' COMMENT 'Hình thức thi',
    status ENUM('scheduled', 'in_progress', 'completed', 'cancelled') DEFAULT 'scheduled',
    notes TEXT COMMENT 'Ghi chú',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (period_id) REFERENCES examination_periods(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL,
    FOREIGN KEY (grader_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_exam_date (exam_date),
    INDEX idx_grading_deadline (grading_deadline),
    INDEX idx_status (status),
    INDEX idx_period (period_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Ca thi';

-- Bảng phân công coi thi
CREATE TABLE IF NOT EXISTS examination_invigilators (
    id INT PRIMARY KEY AUTO_INCREMENT,
    session_id INT NOT NULL COMMENT 'ID ca thi',
    staff_id INT NOT NULL COMMENT 'ID cán bộ',
    role ENUM('main', 'assistant', 'supervisor') DEFAULT 'main' COMMENT 'Vai trò',
    assigned_by INT COMMENT 'Người phân công',
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed BOOLEAN DEFAULT FALSE COMMENT 'Đã xác nhận',
    confirmed_at TIMESTAMP NULL,
    notes TEXT COMMENT 'Ghi chú',
    FOREIGN KEY (session_id) REFERENCES examination_sessions(id) ON DELETE CASCADE,
    INDEX idx_session (session_id),
    INDEX idx_staff (staff_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Phân công coi thi';

-- Bảng sinh viên dự thi
CREATE TABLE IF NOT EXISTS examination_students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    session_id INT NOT NULL COMMENT 'ID ca thi',
    student_id INT NOT NULL COMMENT 'ID sinh viên',
    student_code VARCHAR(50) COMMENT 'Mã sinh viên',
    student_name VARCHAR(255) COMMENT 'Tên sinh viên',
    registration_number VARCHAR(50) COMMENT 'Số báo danh',
    seat_number VARCHAR(20) COMMENT 'Số báo danh',
    status ENUM('registered', 'present', 'absent', 'disqualified') DEFAULT 'registered',
    checked_in_at TIMESTAMP NULL COMMENT 'Thời gian check-in',
    notes TEXT COMMENT 'Ghi chú',
    FOREIGN KEY (session_id) REFERENCES examination_sessions(id) ON DELETE CASCADE,
    INDEX idx_session (session_id),
    INDEX idx_student (student_id),
    INDEX idx_student_code (student_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Sinh viên dự thi';

-- Bảng đề thi
CREATE TABLE IF NOT EXISTS examination_papers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    session_id INT NOT NULL COMMENT 'ID ca thi',
    paper_code VARCHAR(50) COMMENT 'Mã đề',
    title VARCHAR(255) COMMENT 'Tiêu đề đề thi',
    file_path VARCHAR(500) COMMENT 'Đường dẫn file',
    file_name VARCHAR(255) COMMENT 'Tên file',
    file_size BIGINT COMMENT 'Kích thước file',
    copies_needed INT COMMENT 'Số bản cần in',
    copies_printed INT DEFAULT 0 COMMENT 'Số bản đã in',
    created_by INT COMMENT 'Người tạo',
    approved_by INT COMMENT 'Người duyệt',
    approved_at TIMESTAMP NULL,
    status ENUM('draft', 'pending', 'approved', 'rejected', 'printed') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES examination_sessions(id) ON DELETE CASCADE,
    INDEX idx_session (session_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Đề thi';

-- Bảng điểm danh coi thi
CREATE TABLE IF NOT EXISTS examination_attendance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    session_id INT NOT NULL COMMENT 'ID ca thi',
    invigilator_id INT NOT NULL COMMENT 'ID người coi thi',
    check_in_time TIMESTAMP NULL COMMENT 'Giờ check-in',
    check_out_time TIMESTAMP NULL COMMENT 'Giờ check-out',
    status ENUM('absent', 'present', 'late') DEFAULT 'present',
    notes TEXT COMMENT 'Ghi chú',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES examination_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (invigilator_id) REFERENCES examination_invigilators(id) ON DELETE CASCADE,
    INDEX idx_session (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Điểm danh coi thi';

-- Insert sample data
INSERT INTO examination_periods (name, semester, academic_year, start_date, end_date, status) VALUES
('Thi kết thúc học kỳ I', 'Học kỳ I', '2024-2025', '2024-12-15', '2024-12-30', 'active'),
('Thi giữa kỳ I', 'Học kỳ I', '2024-2025', '2024-10-20', '2024-10-27', 'completed');

INSERT INTO subjects (code, name, credits, department, exam_duration) VALUES
('LAW101', 'Pháp luật đại cương', 2, 'Tự-nghiên', 120),
('CS0001', 'Tài phương học', 3, 'PGS.Lan Hải G', 75),
('ADM001', 'Luật hành chính', 3, 'Tự-Lan', 110),
('PROC10', 'Tổ hợp kinh tế', 3, 'vầu-đập', 95);

INSERT INTO classes (code, name, subject_id, semester, academic_year, student_count) VALUES
('01A', 'Lớp 01', 1, 'HK I', '2024-2025', 120),
('02A', 'Lớp 02', 2, 'HK I', '2024-2025', 75),
('01B', 'Lớp 01', 3, 'HK I', '2024-2025', 110),
('02B', 'Lớp 02', 4, 'HK I', '2024-2025', 95);
