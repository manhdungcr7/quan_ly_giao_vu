-- =====================================================================
-- Optimized Database Schema for Work Management System
-- Khoa An ninh điều tra - Normalized 3NF Design
-- =====================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Drop and create database
DROP DATABASE IF EXISTS quan_ly_giao_vu;
CREATE DATABASE quan_ly_giao_vu 
    CHARACTER SET utf8mb4 
    COLLATE utf8mb4_unicode_ci;

USE quan_ly_giao_vu;

-- =====================================================
-- 1. REFERENCE TABLES (Lookup tables)
-- =====================================================

CREATE TABLE academic_years (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    year_code VARCHAR(9) NOT NULL UNIQUE,
    display_name VARCHAR(32) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('active','inactive','planned') DEFAULT 'active',
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_start_date (start_date)
) ENGINE=InnoDB;

-- Roles table for user permissions
CREATE TABLE roles (
    id MEDIUMINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(30) NOT NULL UNIQUE,
    description VARCHAR(100) NULL,
    permissions JSON NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_name (name),
    INDEX idx_active (is_active)
) ENGINE=InnoDB;

-- Departments/Units
CREATE TABLE departments (
    id MEDIUMINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(60) NOT NULL,
    code VARCHAR(10) NOT NULL UNIQUE,
    parent_id MEDIUMINT UNSIGNED NULL,
    head_id INT UNSIGNED NULL,
    description TEXT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (parent_id) REFERENCES departments(id) ON DELETE SET NULL,
    
    INDEX idx_code (code),
    INDEX idx_parent (parent_id),
    INDEX idx_active (is_active)
) ENGINE=InnoDB;

-- Positions
CREATE TABLE positions (
    id MEDIUMINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    code VARCHAR(10) NOT NULL UNIQUE,
    level TINYINT UNSIGNED DEFAULT 0,
    department_id MEDIUMINT UNSIGNED NULL,
    salary_min DECIMAL(12,2) DEFAULT 0,
    salary_max DECIMAL(12,2) DEFAULT 0,
    description TEXT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    
    INDEX idx_code (code),
    INDEX idx_level (level),
    INDEX idx_dept (department_id),
    INDEX idx_active (is_active)
) ENGINE=InnoDB;

-- Document types
CREATE TABLE document_types (
    id MEDIUMINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    code VARCHAR(10) NOT NULL UNIQUE,
    description TEXT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_code (code),
    INDEX idx_active (is_active)
) ENGINE=InnoDB;

-- Organizations (for document senders/receivers)
CREATE TABLE organizations (
    id MEDIUMINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NULL,
    address TEXT NULL,
    phone VARCHAR(20) NULL,
    email VARCHAR(50) NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_name (name),
    INDEX idx_code (code),
    INDEX idx_active (is_active)
) ENGINE=InnoDB;

-- Asset categories
CREATE TABLE asset_categories (
    id MEDIUMINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    code VARCHAR(10) NOT NULL UNIQUE,
    description TEXT NULL,
    depreciation_rate DECIMAL(5,2) DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_code (code),
    INDEX idx_active (is_active)
) ENGINE=InnoDB;

-- =====================================================
-- 2. USERS TABLE
-- =====================================================
CREATE TABLE users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(30) NOT NULL UNIQUE,
    email VARCHAR(60) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(60) NOT NULL,
    role_id MEDIUMINT UNSIGNED NOT NULL,
    avatar VARCHAR(255) NULL,
    phone VARCHAR(15) NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    approval_status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
    approved_by INT UNSIGNED NULL,
    approved_at DATETIME NULL,
    rejected_reason VARCHAR(255) NULL,
    last_login DATETIME NULL,
    email_verified_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role_id),
    INDEX idx_active (is_active),
    INDEX idx_approval_status (approval_status),
    INDEX idx_approved_by (approved_by),
    INDEX idx_last_login (last_login)
) ENGINE=InnoDB;

-- =====================================================
-- 3. STAFF TABLE (Normalized from Users)
-- =====================================================
-- Lưu ý khởi tạo: cần đảm bảo các bảng users, positions, departments đã tồn tại và đều dùng InnoDB + utf8mb4
-- Nếu gặp lỗi 1215 (Cannot add foreign key), kiểm tra:
-- 1. Kiểu & unsigned của cột tham chiếu trùng khớp
-- 2. Engine của bảng nguồn & đích đều là InnoDB
-- 3. Collation giống nhau
-- 4. Bảng nguồn đã tồn tại tại thời điểm CREATE TABLE
CREATE TABLE staff (
    id INT UNSIGNED AUTO_INCREMENT,
    user_id INT UNSIGNED NOT NULL,
    staff_code VARCHAR(20) NOT NULL,
    position_id MEDIUMINT UNSIGNED NULL,
    department_id MEDIUMINT UNSIGNED NULL,
    employment_type ENUM('full_time', 'part_time', 'contract', 'temporary') NOT NULL DEFAULT 'full_time',
    hire_date DATE NOT NULL,
    end_date DATE NULL,
    t04_start_date DATE NULL,
    faculty_start_date DATE NULL,
    birth_date DATE NULL,
    gender ENUM('M','F','O') NULL,
    id_number VARCHAR(30) NULL,
    address TEXT NULL,
    salary DECIMAL(12,2) NOT NULL DEFAULT 0,
    academic_rank VARCHAR(50) NULL,
    academic_degree VARCHAR(50) NULL,
    years_experience SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    language_skills JSON NULL,
    it_skills JSON NULL,
    party_card_number VARCHAR(50) NULL,
    service_number VARCHAR(50) NULL,
    party_join_date DATE NULL,
    publications_count SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    status ENUM('active','inactive','on_leave','terminated') NOT NULL DEFAULT 'active',
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Ràng buộc
    CONSTRAINT pk_staff PRIMARY KEY (id),
    CONSTRAINT uq_staff_user UNIQUE (user_id),
    CONSTRAINT uq_staff_code UNIQUE (staff_code),
    CONSTRAINT fk_staff_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_staff_position FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE SET NULL,
    CONSTRAINT fk_staff_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    
    -- Index phục vụ truy vấn
    INDEX idx_staff_code (staff_code),
    INDEX idx_staff_position (position_id),
    INDEX idx_staff_department (department_id),
    INDEX idx_staff_status (status),
    INDEX idx_staff_hire_date (hire_date),
    INDEX idx_staff_service_number (service_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE staff_documents (
    id INT UNSIGNED AUTO_INCREMENT,
    staff_id INT UNSIGNED NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    stored_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(120) NOT NULL,
    file_size BIGINT UNSIGNED NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_staff_documents PRIMARY KEY (id),
    CONSTRAINT fk_staff_documents_staff FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE,
    INDEX idx_staff_documents_staff_id (staff_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Staff specializations (4NF normalization)
CREATE TABLE staff_specializations (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    staff_id INT UNSIGNED NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    
    FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_staff_specialization (staff_id, specialization),
    INDEX idx_staff (staff_id)
) ENGINE=InnoDB;

-- Staff research interests (4NF normalization)
CREATE TABLE staff_interests (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    staff_id INT UNSIGNED NOT NULL,
    interest VARCHAR(100) NOT NULL,
    
    FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_staff_interest (staff_id, interest),
    INDEX idx_staff (staff_id)
) ENGINE=InnoDB;

-- Staff awards (4NF normalization)
CREATE TABLE staff_awards (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    staff_id INT UNSIGNED NOT NULL,
    award_name VARCHAR(100) NOT NULL,
    award_year YEAR NULL,
    description TEXT NULL,
    
    FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE,
    
    INDEX idx_staff (staff_id),
    INDEX idx_year (award_year)
) ENGINE=InnoDB;

-- =====================================================
-- 4. DOCUMENTS TABLE
-- =====================================================
CREATE TABLE documents (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    document_number VARCHAR(30) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    type_id MEDIUMINT UNSIGNED NULL,
    direction ENUM('incoming', 'outgoing') NOT NULL,
    category ENUM('administrative', 'party') NOT NULL DEFAULT 'administrative',
    from_org_id MEDIUMINT UNSIGNED NULL,
    to_org_id MEDIUMINT UNSIGNED NULL,
    issue_date DATE NOT NULL,
    received_date DATE NULL,
    processing_deadline DATE NULL,
    priority ENUM('low', 'medium', 'high', 'urgent') NOT NULL DEFAULT 'medium',
    status ENUM('draft', 'pending', 'processing', 'completed', 'approved', 'archived', 'overdue') NOT NULL DEFAULT 'pending',
    confidential_level ENUM('public', 'internal', 'confidential', 'secret') DEFAULT 'internal',
    content_summary TEXT NULL,
    results_link VARCHAR(255) NULL,
    created_by INT UNSIGNED NOT NULL,
    assigned_to INT UNSIGNED NULL,
    approved_by INT UNSIGNED NULL,
    approved_at DATETIME NULL,
    remarks TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (type_id) REFERENCES document_types(id) ON DELETE SET NULL,
    FOREIGN KEY (from_org_id) REFERENCES organizations(id) ON DELETE SET NULL,
    FOREIGN KEY (to_org_id) REFERENCES organizations(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_number (document_number),
    INDEX idx_direction (direction),
    INDEX idx_category (category),
    INDEX idx_issue_date (issue_date),
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_created_by (created_by),
    INDEX idx_assigned_to (assigned_to),
    FULLTEXT idx_search (title, content_summary)
) ENGINE=InnoDB;

-- Document attachments (separate table for multiple files)
CREATE TABLE document_attachments (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    document_id INT UNSIGNED NOT NULL,
    filename VARCHAR(100) NOT NULL,
    original_name VARCHAR(100) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_size INT UNSIGNED DEFAULT 0,
    mime_type VARCHAR(255) NULL,
    uploaded_by INT UNSIGNED NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE RESTRICT,
    
    INDEX idx_document (document_id)
) ENGINE=InnoDB;

-- =====================================================
-- 5. ASSETS TABLE
-- =====================================================
CREATE TABLE assets (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    asset_code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    category_id MEDIUMINT UNSIGNED NULL,
    description TEXT NULL,
    serial_number VARCHAR(50) NULL,
    brand VARCHAR(50) NULL,
    model VARCHAR(50) NULL,
    purchase_date DATE NULL,
    purchase_price DECIMAL(12,2) DEFAULT 0,
    current_value DECIMAL(12,2) DEFAULT 0,
    warranty_expiry DATE NULL,
    location VARCHAR(100) NULL,
    assigned_to INT UNSIGNED NULL,
    status ENUM('available', 'in_use', 'maintenance', 'retired', 'disposed') NOT NULL DEFAULT 'available',
    condition_rating ENUM('excellent', 'good', 'fair', 'poor', 'broken') NOT NULL DEFAULT 'good',
    notes TEXT NULL,
    created_by INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (category_id) REFERENCES asset_categories(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_to) REFERENCES staff(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    
    INDEX idx_code (asset_code),
    INDEX idx_category (category_id),
    INDEX idx_status (status),
    INDEX idx_assigned (assigned_to),
    INDEX idx_serial (serial_number),
    FULLTEXT idx_search (name, description, brand, model)
) ENGINE=InnoDB;

-- Asset maintenance history
CREATE TABLE asset_maintenance (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    asset_id INT UNSIGNED NOT NULL,
    maintenance_date DATE NOT NULL,
    type ENUM('routine', 'repair', 'upgrade', 'inspection') NOT NULL,
    description TEXT NOT NULL,
    cost DECIMAL(10,2) DEFAULT 0,
    performed_by VARCHAR(100) NULL,
    next_maintenance_date DATE NULL,
    created_by INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    
    INDEX idx_asset (asset_id),
    INDEX idx_date (maintenance_date),
    INDEX idx_type (type)
) ENGINE=InnoDB;

-- =====================================================
-- 6. COURSES & EXAMS
-- =====================================================
CREATE TABLE courses (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    course_code VARCHAR(15) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    credits TINYINT UNSIGNED DEFAULT 0,
    semester VARCHAR(10) NULL,
    academic_year VARCHAR(10) NULL,
    description TEXT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_code (course_code),
    INDEX idx_semester (semester),
    INDEX idx_year (academic_year),
    INDEX idx_active (is_active)
) ENGINE=InnoDB;

-- Course lecturers (many-to-many)
CREATE TABLE course_lecturers (
    course_id INT UNSIGNED NOT NULL,
    staff_id INT UNSIGNED NOT NULL,
    role ENUM('primary', 'assistant', 'guest') DEFAULT 'primary',
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (course_id, staff_id),
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE,
    
    INDEX idx_course (course_id),
    INDEX idx_staff (staff_id)
) ENGINE=InnoDB;

CREATE TABLE exams (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    exam_code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    course_id INT UNSIGNED NULL,
    exam_date DATE NOT NULL,
    start_time TIME NOT NULL,
    duration_minutes SMALLINT UNSIGNED DEFAULT 90,
    room VARCHAR(30) NULL,
    type ENUM('midterm', 'final', 'makeup', 'special') DEFAULT 'final',
    max_score DECIMAL(5,2) DEFAULT 100,
    status ENUM('scheduled', 'ongoing', 'completed', 'cancelled') DEFAULT 'scheduled',
    instructions TEXT NULL,
    created_by INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    
    INDEX idx_code (exam_code),
    INDEX idx_date (exam_date),
    INDEX idx_course (course_id),
    INDEX idx_status (status)
) ENGINE=InnoDB;

-- Exam invigilators (many-to-many)
CREATE TABLE exam_invigilators (
    exam_id INT UNSIGNED NOT NULL,
    staff_id INT UNSIGNED NOT NULL,
    role ENUM('chief', 'assistant') DEFAULT 'assistant',
    
    PRIMARY KEY (exam_id, staff_id),
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
    FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE,
    
    INDEX idx_exam (exam_id),
    INDEX idx_staff (staff_id)
) ENGINE=InnoDB;

-- =====================================================
-- 7. PROJECTS & RESEARCH
-- =====================================================
CREATE TABLE project_categories (
    id MEDIUMINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    code VARCHAR(10) NOT NULL UNIQUE,
    description TEXT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    
    INDEX idx_code (code),
    INDEX idx_active (is_active)
) ENGINE=InnoDB;

CREATE TABLE projects (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    project_code VARCHAR(20) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    category_id MEDIUMINT UNSIGNED NULL,
    leader_id INT UNSIGNED NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    budget DECIMAL(15,2) DEFAULT 0,
    status ENUM('planning', 'active', 'completed', 'paused', 'cancelled') NOT NULL DEFAULT 'planning',
    progress TINYINT UNSIGNED DEFAULT 0,
    description TEXT NULL,
    objectives TEXT NULL,
    results_summary TEXT NULL,
    created_by INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (category_id) REFERENCES project_categories(id) ON DELETE SET NULL,
    FOREIGN KEY (leader_id) REFERENCES staff(id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    
    INDEX idx_code (project_code),
    INDEX idx_category (category_id),
    INDEX idx_leader (leader_id),
    INDEX idx_status (status),
    INDEX idx_dates (start_date, end_date),
    FULLTEXT idx_search (title, description, objectives)
) ENGINE=InnoDB;

-- Project team members (many-to-many)
CREATE TABLE project_members (
    project_id INT UNSIGNED NOT NULL,
    staff_id INT UNSIGNED NOT NULL,
    role ENUM('leader', 'member', 'advisor') DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (project_id, staff_id),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE,
    
    INDEX idx_project (project_id),
    INDEX idx_staff (staff_id)
) ENGINE=InnoDB;

-- Project milestones
CREATE TABLE project_milestones (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    project_id INT UNSIGNED NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT NULL,
    due_date DATE NOT NULL,
    status ENUM('pending', 'in_progress', 'completed', 'overdue') DEFAULT 'pending',
    progress TINYINT UNSIGNED DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    
    INDEX idx_project (project_id),
    INDEX idx_due_date (due_date),
    INDEX idx_status (status)
) ENGINE=InnoDB;

-- =====================================================
-- 8. SCHEDULES
-- =====================================================
CREATE TABLE schedule_types (
    id MEDIUMINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(30) NOT NULL,
    code VARCHAR(10) NOT NULL UNIQUE,
    color VARCHAR(7) DEFAULT '#3B82F6',
    description TEXT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    
    INDEX idx_code (code),
    INDEX idx_active (is_active)
) ENGINE=InnoDB;

-- Teaching schedules
CREATE TABLE teaching_schedules (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    lecturer_id INT UNSIGNED NOT NULL,
    course_id INT UNSIGNED NULL,
    class_name VARCHAR(50) NULL,
    subject VARCHAR(100) NULL,
    lesson VARCHAR(100) NULL,
    date DATE NOT NULL,
    day_of_week TINYINT NOT NULL,
    periods VARCHAR(20) NULL,
    room VARCHAR(30) NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (lecturer_id) REFERENCES staff(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL,
    
    INDEX idx_lecturer (lecturer_id),
    INDEX idx_date (date),
    INDEX idx_course (course_id)
) ENGINE=InnoDB;

-- Work schedules/events
CREATE TABLE work_schedules (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT NULL,
    type_id MEDIUMINT UNSIGNED NULL,
    start_datetime DATETIME NOT NULL,
    end_datetime DATETIME NOT NULL,
    is_all_day BOOLEAN DEFAULT FALSE,
    location VARCHAR(100) NULL,
    organizer_id INT UNSIGNED NULL,
    status ENUM('scheduled', 'ongoing', 'completed', 'cancelled') DEFAULT 'scheduled',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_rule TEXT NULL,
    created_by INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (type_id) REFERENCES schedule_types(id) ON DELETE SET NULL,
    FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    
    INDEX idx_start (start_datetime),
    INDEX idx_end (end_datetime),
    INDEX idx_type (type_id),
    INDEX idx_status (status),
    INDEX idx_organizer (organizer_id)
) ENGINE=InnoDB;

-- Schedule participants (many-to-many)
CREATE TABLE schedule_participants (
    schedule_id INT UNSIGNED NOT NULL,
    user_id INT UNSIGNED NOT NULL,
    response ENUM('pending', 'accepted', 'declined', 'tentative') DEFAULT 'pending',
    
    PRIMARY KEY (schedule_id, user_id),
    FOREIGN KEY (schedule_id) REFERENCES work_schedules(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_schedule (schedule_id),
    INDEX idx_user (user_id)
) ENGINE=InnoDB;

-- Custom lecturers for teaching schedules
CREATE TABLE teaching_custom_lecturers (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL COMMENT 'Tên hiển thị của giảng viên',
    email VARCHAR(255) DEFAULT NULL COMMENT 'Email liên hệ',
    note TEXT COMMENT 'Ghi chú bổ sung',
    anchor_key VARCHAR(255) DEFAULT NULL COMMENT 'Khóa neo vào giảng viên khác',
    created_by INT UNSIGNED NOT NULL COMMENT 'Người tạo',
    updated_by INT UNSIGNED DEFAULT NULL COMMENT 'Người cập nhật cuối',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_teaching_custom_anchor (anchor_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 9.quan_ly_giao_vu_mvc/
├── app/
│   ├── controllers/
│   │   ├── AuthController.js
│   │   ├── DashboardController.js
│   │   ├── UserController.js
│   │   ├── StaffController.js
│   │   ├── DocumentController.js
│   │   ├── AssetController.js
│   │   ├── ProjectController.js
│   │   ├── ScheduleController.js
│   │   └── ReportController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Staff.js
│   │   ├── Document.js
│   │   ├── Asset.js
│   │   ├── Project.js
│   │   └── Schedule.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── validation.js
│   │   └── upload.js
│   └── routes/
│       ├── api.js
│       ├── web.js
│       ├── auth.js
│       └── admin.js
├── config/
│   ├── database.js
│   ├── app.js
│   └── constants.js
├── public/
│   ├── css/
│   ├── js/
│   ├── images/
│   └── uploads/
├── views/
│   ├── layouts/
│   ├── partials/
│   ├── auth/
│   ├── dashboard/
│   ├── users/
│   ├── documents/
│   └── reports/
├── database/
│   └── schema_optimized.sql
├── .env
├── package.json
└── server.js
-- =====================================================
CREATE TABLE work_journals (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    location VARCHAR(100) NULL,
    weekly_report TEXT NULL,
    status ENUM('draft', 'submitted', 'reviewed', 'approved') DEFAULT 'draft',
    reviewer_id INT UNSIGNED NULL,
    review_comment TEXT NULL,
    head_comment TEXT NULL,
    submitted_at DATETIME NULL,
    reviewed_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE SET NULL,
    
    UNIQUE KEY unique_user_week (user_id, week_start),
    INDEX idx_user (user_id),
    INDEX idx_week (week_start),
    INDEX idx_status (status)
) ENGINE=InnoDB;

CREATE TABLE work_journal_days (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    journal_id INT UNSIGNED NOT NULL,
    day_of_week TINYINT NOT NULL,
    main_focus TEXT NULL,
    notes TEXT NULL,
    progress TINYINT UNSIGNED DEFAULT 0,
    
    FOREIGN KEY (journal_id) REFERENCES work_journals(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_journal_day (journal_id, day_of_week),
    INDEX idx_journal (journal_id)
) ENGINE=InnoDB;

CREATE TABLE work_journal_tasks (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    day_id INT UNSIGNED NOT NULL,
    task_name VARCHAR(200) NOT NULL,
    location VARCHAR(100) NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    order_index TINYINT UNSIGNED DEFAULT 0,
    
    FOREIGN KEY (day_id) REFERENCES work_journal_days(id) ON DELETE CASCADE,
    
    INDEX idx_day (day_id)
) ENGINE=InnoDB;

-- =====================================================
-- 10. REMINDERS
-- =====================================================
CREATE TABLE reminders (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    deadline DATETIME NOT NULL,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    status ENUM('pending', 'completed', 'cancelled', 'overdue') DEFAULT 'pending',
    created_by INT UNSIGNED NOT NULL,
    assigned_to INT UNSIGNED NOT NULL,
    completed_at DATETIME NULL,
    reminder_before_minutes SMALLINT UNSIGNED DEFAULT 15,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_rule TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_assigned (assigned_to),
    INDEX idx_deadline (deadline),
    INDEX idx_status (status),
    INDEX idx_priority (priority)
) ENGINE=InnoDB;

-- =====================================================
-- 11. REPORTS
-- =====================================================
CREATE TABLE report_types (
    id MEDIUMINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    code VARCHAR(10) NOT NULL UNIQUE,
    description TEXT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    
    INDEX idx_code (code),
    INDEX idx_active (is_active)
) ENGINE=InnoDB;

CREATE TABLE reports (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    type_id MEDIUMINT UNSIGNED NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    unit_id MEDIUMINT UNSIGNED NULL,
    author_id INT UNSIGNED NOT NULL,
    status ENUM('draft', 'submitted', 'reviewed', 'approved', 'published') DEFAULT 'draft',
    summary TEXT NULL,
    file_path VARCHAR(255) NULL,
    submitted_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (type_id) REFERENCES report_types(id) ON DELETE SET NULL,
    FOREIGN KEY (unit_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE RESTRICT,
    
    INDEX idx_type (type_id),
    INDEX idx_period (period_start, period_end),
    INDEX idx_unit (unit_id),
    INDEX idx_author (author_id),
    INDEX idx_status (status)
) ENGINE=InnoDB;

CREATE TABLE report_schedules (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    frequency ENUM('weekly','monthly','quarterly','annual','custom') NOT NULL DEFAULT 'monthly',
    owner_unit_id MEDIUMINT UNSIGNED NULL,
    owner_custom VARCHAR(120) NULL,
    channel VARCHAR(150) NULL,
    scope TEXT NULL,
    status ENUM('planning','pending','in_progress','draft','on_hold') NOT NULL DEFAULT 'planning',
    progress TINYINT UNSIGNED NOT NULL DEFAULT 0,
    completion_rate TINYINT UNSIGNED NOT NULL DEFAULT 0,
    remind_before_hours SMALLINT UNSIGNED NOT NULL DEFAULT 48,
    next_due_date DATE NULL,
    due_label VARCHAR(150) NULL,
    recurrence_pattern JSON NULL,
    attachments_expected TINYINT UNSIGNED NOT NULL DEFAULT 0,
    tags JSON NULL,
    last_submitted_at DATE NULL,
    created_by INT UNSIGNED NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (owner_unit_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,

    INDEX idx_frequency (frequency),
    INDEX idx_status_report (status),
    INDEX idx_next_due (next_due_date),
    INDEX idx_owner_unit (owner_unit_id),
    INDEX idx_active_schedule (is_active)
) ENGINE=InnoDB;

CREATE TABLE report_reviews (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    report_id INT UNSIGNED NOT NULL,
    reviewer_id INT UNSIGNED NOT NULL,
    review_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    decision ENUM('approved', 'rejected', 'needs_revision') NOT NULL,
    comments TEXT NULL,
    
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE RESTRICT,
    
    INDEX idx_report (report_id),
    INDEX idx_reviewer (reviewer_id)
) ENGINE=InnoDB;

-- =====================================================
-- 12. ACTIVITY LOGS
-- =====================================================
CREATE TABLE activity_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NULL,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(30) NOT NULL,
    entity_id INT UNSIGNED NULL,
    old_values JSON NULL,
    new_values JSON NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_user (user_id),
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_action (action),
    INDEX idx_created (created_at)
) ENGINE=InnoDB;

-- =====================================================
-- INITIAL DATA
-- =====================================================

-- Insert default roles
INSERT INTO roles (name, description, permissions) VALUES
('admin', 'System Administrator', '["all"]'),
('staff', 'Staff Member', '["read", "write_own"]'),
('lecturer', 'Lecturer', '["read", "write_own", "teach"]'),
('viewer', 'Read Only', '["read"]'),
('guest', 'Guest account with limited permissions', '["read"]'),
('department_head', 'Trưởng khoa', '["read", "write_own", "approve_department"]'),
('deputy_department_head', 'Phó trưởng khoa', '["read", "write_own", "assist_department"]'),
('board', 'Ban giám hiệu', '["read", "write_own", "approve_all"]');

-- Insert default departments
INSERT INTO departments (name, code, description) VALUES
('Khoa An ninh điều tra', 'KANDI', 'Khoa An ninh điều tra - Trường Đại học An ninh nhân dân'),
('Bộ môn Lý thuyết An ninh', 'BMLT', 'Bộ môn Lý thuyết An ninh'),
('Bộ môn Pháp luật Hình sự', 'BMPL', 'Bộ môn Pháp luật Hình sự'),
('Bộ môn Kỹ thuật điều tra', 'BMKT', 'Bộ môn Kỹ thuật điều tra'),
('Văn phòng Khoa', 'VP', 'Văn phòng Khoa An ninh điều tra');

-- Insert default positions
INSERT INTO positions (name, code, level, department_id) VALUES
('Trưởng khoa', 'TK', 1, 1),
('Phó trưởng khoa', 'PTK', 2, 1),
('Trưởng bộ môn', 'TBM', 3, NULL),
('Phó trưởng bộ môn', 'PTBM', 4, NULL),
('Giảng viên chính', 'GVC', 5, NULL),
('Giảng viên', 'GV', 6, NULL),
('Cán bộ hành chính', 'CBHC', 7, NULL);

-- Insert document types
INSERT INTO document_types (name, code) VALUES
('Công văn', 'CV'),
('Thông báo', 'TB'),
('Quyết định', 'QD'),
('Hướng dẫn', 'HD'),
('Báo cáo', 'BC');

-- Insert asset categories
INSERT INTO asset_categories (name, code, depreciation_rate) VALUES
('Máy tính', 'MT', 20.00),
('Thiết bị văn phòng', 'TBVP', 15.00),
('Nội thất', 'NT', 10.00),
('Thiết bị giảng dạy', 'TBGD', 12.00);

-- Insert schedule types
INSERT INTO schedule_types (name, code, color) VALUES
('Họp khoa', 'HK', '#3B82F6'),
('Hội nghị', 'HN', '#10B981'),
('Đào tạo', 'DT', '#F59E0B'),
('Thi cử', 'TC', '#EF4444'),
('Sự kiện khác', 'SK', '#8B5CF6');

-- Insert project categories
INSERT INTO project_categories (name, code) VALUES
('Nghiên cứu cấp khoa', 'NCK'),
('Nghiên cứu cấp trường', 'NCT'),
('Nghiên cứu cấp bộ', 'NCB'),
('Dự án phát triển', 'DPT');

-- Insert report types
INSERT INTO report_types (name, code) VALUES
('Báo cáo tháng', 'BCT'),
('Báo cáo quý', 'BCQ'),
('Báo cáo năm', 'BCN'),
('Báo cáo chuyên đề', 'BCCD');

-- Create default admin user
INSERT INTO users (username, email, password_hash, full_name, role_id) VALUES
('admin', 'admin@khoa-anninh.edu.vn', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Quản trị viên', 1);

-- Add foreign key constraint for department head after users table is populated
ALTER TABLE departments ADD CONSTRAINT fk_dept_head FOREIGN KEY (head_id) REFERENCES users(id) ON DELETE SET NULL;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- VIEWS FOR REPORTING
-- =====================================================

-- View for staff with full information
CREATE VIEW v_staff_full AS
SELECT 
    s.id,
    s.staff_code,
    u.full_name,
    u.email,
    u.phone,
    p.name AS position_name,
    d.name AS department_name,
    s.employment_type,
    s.hire_date,
    s.academic_rank,
    s.academic_degree,
    s.years_experience,
    s.publications_count,
    s.status,
    s.created_at
FROM staff s
    LEFT JOIN users u ON s.user_id = u.id
    LEFT JOIN positions p ON s.position_id = p.id
    LEFT JOIN departments d ON s.department_id = d.id;

-- View for documents with organization names
CREATE VIEW v_documents_full AS
SELECT 
    d.id,
    d.document_number,
    d.title,
    dt.name AS document_type,
    d.direction,
    org_from.name AS from_organization,
    org_to.name AS to_organization,
    d.issue_date,
    d.received_date,
    d.priority,
    d.status,
    u_created.full_name AS created_by_name,
    u_assigned.full_name AS assigned_to_name,
    d.created_at
FROM documents d
    LEFT JOIN document_types dt ON d.type_id = dt.id
    LEFT JOIN organizations org_from ON d.from_org_id = org_from.id
    LEFT JOIN organizations org_to ON d.to_org_id = org_to.id
    LEFT JOIN users u_created ON d.created_by = u_created.id
    LEFT JOIN users u_assigned ON d.assigned_to = u_assigned.id;

-- View for projects with team information
CREATE VIEW v_projects_full AS
SELECT 
    p.id,
    p.project_code,
    p.title,
    pc.name AS category_name,
    s.staff_code AS leader_code,
    u.full_name AS leader_name,
    p.start_date,
    p.end_date,
    p.budget,
    p.status,
    p.progress,
    COUNT(pm.staff_id) AS team_size
FROM projects p
    LEFT JOIN project_categories pc ON p.category_id = pc.id
    LEFT JOIN staff s ON p.leader_id = s.id
    LEFT JOIN users u ON s.user_id = u.id
    LEFT JOIN project_members pm ON p.id = pm.project_id
GROUP BY p.id, p.project_code, p.title, pc.name, s.staff_code, u.full_name, p.start_date, p.end_date, p.budget, p.status, p.progress;

-- =====================================================
-- STORED PROCEDURES FOR COMMON OPERATIONS
-- =====================================================

DELIMITER $$

-- Procedure to get user dashboard statistics
CREATE PROCEDURE GetDashboardStats(IN user_id INT)
BEGIN
    SELECT 
        (SELECT COUNT(*) FROM documents WHERE assigned_to = user_id AND status IN ('pending', 'processing')) AS pending_documents,
        (SELECT COUNT(*) FROM reminders WHERE assigned_to = user_id AND status = 'pending' AND deadline >= NOW()) AS active_reminders,
        (SELECT COUNT(*) FROM projects WHERE leader_id IN (SELECT id FROM staff WHERE user_id = user_id) AND status = 'active') AS active_projects,
        (SELECT COUNT(*) FROM work_schedules ws JOIN schedule_participants sp ON ws.id = sp.schedule_id WHERE sp.user_id = user_id AND ws.start_datetime >= CURDATE()) AS upcoming_events;
END$$

-- Procedure to update asset depreciation
CREATE PROCEDURE UpdateAssetDepreciation()
BEGIN
    UPDATE assets a
    JOIN asset_categories ac ON a.category_id = ac.id
    SET a.current_value = GREATEST(
        a.purchase_price * POWER(1 - (ac.depreciation_rate / 100), TIMESTAMPDIFF(YEAR, a.purchase_date, CURDATE())),
        a.purchase_price * 0.1
    )
    WHERE a.purchase_date IS NOT NULL 
    AND ac.depreciation_rate > 0
    AND a.current_value > a.purchase_price * 0.1;
END$$

DELIMITER ;

-- =====================================================
-- TRIGGERS FOR AUDIT LOGGING
-- =====================================================

DELIMITER $$

-- Trigger for user updates
CREATE TRIGGER tr_users_update
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    INSERT INTO activity_logs (user_id, action, entity_type, entity_id, old_values, new_values)
    VALUES (NEW.id, 'UPDATE', 'users', NEW.id,
        JSON_OBJECT('username', OLD.username, 'email', OLD.email, 'full_name', OLD.full_name),
        JSON_OBJECT('username', NEW.username, 'email', NEW.email, 'full_name', NEW.full_name));
END$$

-- Trigger for document status changes
CREATE TRIGGER tr_documents_status_update
AFTER UPDATE ON documents
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO activity_logs (user_id, action, entity_type, entity_id, old_values, new_values)
        VALUES (NEW.assigned_to, 'STATUS_CHANGE', 'documents', NEW.id,
            JSON_OBJECT('status', OLD.status),
            JSON_OBJECT('status', NEW.status));
    END IF;
END$$

DELIMITER ;

-- =====================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- =====================================================

-- Additional composite indexes for common queries
CREATE INDEX idx_documents_status_date ON documents(status, issue_date);
CREATE INDEX idx_documents_assigned_status ON documents(assigned_to, status);
CREATE INDEX idx_reminders_assigned_deadline ON reminders(assigned_to, deadline);
CREATE INDEX idx_projects_status_dates ON projects(status, start_date, end_date);
CREATE INDEX idx_schedules_user_date ON work_schedules(created_by, start_datetime);

-- Full-text search indexes
ALTER TABLE documents ADD FULLTEXT(title, content_summary);
ALTER TABLE projects ADD FULLTEXT(title, description, objectives);
ALTER TABLE assets ADD FULLTEXT(name, description, brand, model);

-- =====================================================
-- END OF SCHEMA
-- =====================================================

SHOW DATABASES LIKE 'quan_ly_cong_viec_mvc';
USE quan_ly_cong_viec_mvc;
SHOW TABLES;