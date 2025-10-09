SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET collation_connection = 'utf8mb4_unicode_ci';
-- =====================================================
-- HỆ THỐNG TIÊU CHÍ ĐÁNH GIÁ CÁN BỘ
-- =====================================================
-- Thiết kế cho phép quản lý linh hoạt các tiêu chí đánh giá theo năm học

-- Bảng danh mục tiêu chí đánh giá
CREATE TABLE IF NOT EXISTS evaluation_criteria (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    description TEXT NULL,
    category ENUM('teaching', 'research', 'service', 'professional', 'other') NOT NULL DEFAULT 'teaching',
    measurement_type ENUM('numeric', 'percentage', 'grade', 'boolean', 'text') NOT NULL DEFAULT 'numeric',
    min_value DECIMAL(10,2) NULL,
    max_value DECIMAL(10,2) NULL,
    unit VARCHAR(50) NULL COMMENT 'Đơn vị đo: giờ, bài báo, học viên, điểm...',
    weight DECIMAL(5,2) NOT NULL DEFAULT 0 COMMENT 'Trọng số trong tổng điểm (0-100)',
    is_required BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_category (category),
    INDEX idx_active (is_active),
    INDEX idx_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Danh mục các tiêu chí đánh giá cán bộ';

-- Bảng cấu hình tiêu chí theo năm học
CREATE TABLE IF NOT EXISTS evaluation_periods (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT 'Tên đợt đánh giá: HK1 2024-2025',
    academic_year VARCHAR(20) NOT NULL COMMENT 'Năm học: 2024-2025',
    semester TINYINT NULL COMMENT 'Học kỳ: 1, 2, 3 (hè), NULL=cả năm',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    evaluation_deadline DATE NULL COMMENT 'Hạn nộp tự đánh giá',
    status ENUM('draft', 'active', 'closed', 'archived') DEFAULT 'draft',
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_year (academic_year),
    INDEX idx_status (status),
    INDEX idx_dates (start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Các đợt/kỳ đánh giá theo năm học';

-- Bảng liên kết tiêu chí với từng đợt đánh giá
CREATE TABLE IF NOT EXISTS evaluation_period_criteria (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    period_id INT UNSIGNED NOT NULL,
    criteria_id INT UNSIGNED NOT NULL,
    weight DECIMAL(5,2) NOT NULL DEFAULT 0 COMMENT 'Trọng số riêng cho đợt này',
    target_value DECIMAL(10,2) NULL COMMENT 'Chỉ tiêu tối thiểu',
    excellent_value DECIMAL(10,2) NULL COMMENT 'Chỉ tiêu xuất sắc',
    is_required BOOLEAN DEFAULT FALSE,
    notes TEXT NULL,
    
    FOREIGN KEY (period_id) REFERENCES evaluation_periods(id) ON DELETE CASCADE,
    FOREIGN KEY (criteria_id) REFERENCES evaluation_criteria(id) ON DELETE CASCADE,
    UNIQUE KEY unique_period_criteria (period_id, criteria_id),
    INDEX idx_period (period_id),
    INDEX idx_criteria (criteria_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Cấu hình tiêu chí cho từng đợt đánh giá';

-- Bảng lưu kết quả đánh giá của từng cán bộ
CREATE TABLE IF NOT EXISTS staff_evaluations (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    staff_id INT UNSIGNED NOT NULL,
    period_id INT UNSIGNED NOT NULL,
    criteria_id INT UNSIGNED NOT NULL,
    self_assessment_value DECIMAL(10,2) NULL COMMENT 'Tự đánh giá',
    self_assessment_note TEXT NULL,
    self_assessment_date DATETIME NULL,
    manager_assessment_value DECIMAL(10,2) NULL COMMENT 'Đánh giá của quản lý',
    manager_assessment_note TEXT NULL,
    manager_id INT UNSIGNED NULL,
    manager_assessment_date DATETIME NULL,
    final_value DECIMAL(10,2) NULL COMMENT 'Giá trị chính thức',
    grade ENUM('excellent', 'good', 'average', 'poor') NULL,
    evidence_files JSON NULL COMMENT 'Link các file minh chứng',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE,
    FOREIGN KEY (period_id) REFERENCES evaluation_periods(id) ON DELETE CASCADE,
    FOREIGN KEY (criteria_id) REFERENCES evaluation_criteria(id) ON DELETE CASCADE,
    FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_evaluation (staff_id, period_id, criteria_id),
    INDEX idx_staff (staff_id),
    INDEX idx_period (period_id),
    INDEX idx_grade (grade)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Kết quả đánh giá chi tiết theo từng tiêu chí';

-- Bảng tổng hợp kết quả đánh giá
CREATE TABLE IF NOT EXISTS staff_evaluation_summary (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    staff_id INT UNSIGNED NOT NULL,
    period_id INT UNSIGNED NOT NULL,
    total_score DECIMAL(6,2) NULL COMMENT 'Tổng điểm (0-100)',
    final_grade ENUM('excellent', 'good', 'average', 'poor', 'incomplete') NULL,
    ranking_in_department INT NULL COMMENT 'Xếp hạng trong khoa/bộ môn',
    ranking_in_school INT NULL COMMENT 'Xếp hạng toàn trường',
    strengths TEXT NULL COMMENT 'Điểm mạnh',
    weaknesses TEXT NULL COMMENT 'Điểm cần cải thiện',
    recommendations TEXT NULL COMMENT 'Đề xuất phát triển',
    self_assessment_submitted BOOLEAN DEFAULT FALSE,
    manager_review_completed BOOLEAN DEFAULT FALSE,
    final_approved BOOLEAN DEFAULT FALSE,
    approved_by INT UNSIGNED NULL,
    approved_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE,
    FOREIGN KEY (period_id) REFERENCES evaluation_periods(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_staff_period (staff_id, period_id),
    INDEX idx_staff (staff_id),
    INDEX idx_period (period_id),
    INDEX idx_grade (final_grade),
    INDEX idx_score (total_score)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tổng hợp kết quả đánh giá theo đợt';

-- =====================================================
-- DỮ LIỆU MẪU - TIÊU CHÍ ĐÁNH GIÁ CHUẨN
-- =====================================================

INSERT INTO evaluation_criteria (code, name, description, category, measurement_type, min_value, max_value, unit, weight, is_required, display_order) VALUES
-- Nhóm Giảng dạy (40%)
('TEACH_HOURS', 'Số giờ giảng dạy', 'Tổng số giờ giảng dạy trong kỳ (bao gồm lý thuyết, thực hành, hướng dẫn)', 'teaching', 'numeric', 0, 500, 'giờ', 15.00, TRUE, 1),
('TEACH_QUALITY', 'Chất lượng giảng dạy', 'Điểm đánh giá từ sinh viên và phòng Đào tạo', 'teaching', 'numeric', 0, 10, 'điểm', 10.00, TRUE, 2),
('TEACH_MATERIALS', 'Tài liệu giảng dạy', 'Số giáo trình, bài giảng, tài liệu mới biên soạn', 'teaching', 'numeric', 0, 20, 'tài liệu', 5.00, FALSE, 3),
('TEACH_INNOVATION', 'Đổi mới phương pháp', 'Áp dụng phương pháp giảng dạy mới, công nghệ vào giảng dạy', 'teaching', 'grade', NULL, NULL, NULL, 5.00, FALSE, 4),
('STUDENT_SUPERVISION', 'Hướng dẫn sinh viên', 'Số sinh viên NCKH, luận văn, thực tập được hướng dẫn', 'teaching', 'numeric', 0, 50, 'sinh viên', 5.00, FALSE, 5),

-- Nhóm Nghiên cứu khoa học (30%)
('RESEARCH_PAPERS', 'Bài báo khoa học', 'Số bài báo được công bố (ISI, Scopus, ĐHQG)', 'research', 'numeric', 0, 20, 'bài', 15.00, FALSE, 11),
('RESEARCH_PROJECTS', 'Đề tài nghiên cứu', 'Tham gia/chủ trì các đề tài nghiên cứu (cấp cơ sở, Bộ, Nhà nước)', 'research', 'numeric', 0, 10, 'đề tài', 8.00, FALSE, 12),
('RESEARCH_CONFERENCES', 'Hội nghị, hội thảo', 'Tham gia, báo cáo tại hội nghị khoa học', 'research', 'numeric', 0, 15, 'hội thảo', 4.00, FALSE, 13),
('RESEARCH_BOOKS', 'Sách chuyên khảo', 'Xuất bản sách, chương sách chuyên môn', 'research', 'numeric', 0, 5, 'cuốn', 3.00, FALSE, 14),

-- Nhóm Phục vụ cộng đồng (15%)
('SERVICE_COMMITTEES', 'Tham gia hội đồng', 'Tham gia hội đồng khoa học, biên tập, phản biện...', 'service', 'numeric', 0, 10, 'hội đồng', 5.00, FALSE, 21),
('SERVICE_TRAINING', 'Tập huấn, bồi dưỡng', 'Tham gia giảng dạy các khóa bồi dưỡng ngắn hạn', 'service', 'numeric', 0, 20, 'khóa', 4.00, FALSE, 22),
('SERVICE_COMMUNITY', 'Hoạt động xã hội', 'Tham gia hoạt động từ thiện, tư vấn cộng đồng', 'service', 'boolean', NULL, NULL, NULL, 3.00, FALSE, 23),
('SERVICE_MEDIA', 'Truyền thông khoa học', 'Viết bài phổ biến khoa học, tham gia truyền thông', 'service', 'numeric', 0, 10, 'bài', 3.00, FALSE, 24),

-- Nhóm Phát triển nghề nghiệp (10%)
('PROF_TRAINING', 'Đào tạo, bồi dưỡng', 'Tham gia các khóa đào tạo nâng cao năng lực', 'professional', 'numeric', 0, 10, 'khóa', 4.00, FALSE, 31),
('PROF_CERTIFICATIONS', 'Chứng chỉ nghề nghiệp', 'Đạt các chứng chỉ chuyên môn quốc tế, trong nước', 'professional', 'numeric', 0, 5, 'chứng chỉ', 3.00, FALSE, 32),
('PROF_AWARDS', 'Giải thưởng cá nhân', 'Nhận giải thưởng, khen thưởng cá nhân', 'professional', 'numeric', 0, 5, 'giải', 3.00, FALSE, 33),

-- Nhóm Kỷ luật & Đạo đức (5%)
('OTHER_DISCIPLINE', 'Kỷ luật, chuyên cần', 'Chấp hành nội quy, giờ giấc, kỷ luật lao động', 'other', 'grade', NULL, NULL, NULL, 3.00, TRUE, 41),
('OTHER_ETHICS', 'Đạo đức nghề nghiệp', 'Thái độ làm việc, quan hệ đồng nghiệp, sinh viên', 'other', 'grade', NULL, NULL, NULL, 2.00, TRUE, 42);

-- Tạo đợt đánh giá mẫu cho năm học hiện tại
INSERT INTO evaluation_periods (name, academic_year, semester, start_date, end_date, evaluation_deadline, status, notes) VALUES
('Học kỳ 1 năm học 2024-2025', '2024-2025', 1, '2024-09-01', '2025-01-15', '2025-01-20', 'active', 'Đợt đánh giá học kỳ 1 cho toàn bộ giảng viên'),
('Học kỳ 2 năm học 2024-2025', '2024-2025', 2, '2025-01-16', '2025-06-15', '2025-06-20', 'draft', 'Đợt đánh giá học kỳ 2 (dự kiến)'),
('Tổng kết năm học 2024-2025', '2024-2025', NULL, '2024-09-01', '2025-06-30', '2025-07-10', 'draft', 'Đánh giá tổng kết cả năm học');

-- Gán tiêu chí cho đợt đánh giá HK1
INSERT INTO evaluation_period_criteria (period_id, criteria_id, weight, target_value, excellent_value, is_required)
SELECT 1, id, weight, 
    CASE 
        WHEN code = 'TEACH_HOURS' THEN 90.00
        WHEN code = 'TEACH_QUALITY' THEN 7.00
        WHEN code = 'RESEARCH_PAPERS' THEN 1.00
        ELSE NULL
    END,
    CASE 
        WHEN code = 'TEACH_HOURS' THEN 150.00
        WHEN code = 'TEACH_QUALITY' THEN 9.00
        WHEN code = 'RESEARCH_PAPERS' THEN 3.00
        ELSE NULL
    END,
    is_required
FROM evaluation_criteria
WHERE is_active = TRUE;
