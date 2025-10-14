-- =======================================================
-- SEED DATA: Roles with Permission Hierarchy
-- Description: Complete role definitions for the educational management system
-- Date: 2025-10-11
-- =======================================================

USE quan_ly_giao_vu;

-- Clear existing roles (CAUTION: This will reset all roles)
-- Comment out if you want to preserve existing data
-- TRUNCATE TABLE roles;

-- If TRUNCATE is not used, delete existing roles
DELETE FROM roles;

-- Reset auto increment
ALTER TABLE roles AUTO_INCREMENT = 1;

-- =======================================================
-- INSERT ROLES WITH HIERARCHY
-- =======================================================

INSERT INTO roles 
(name, display_name, description, level, priority, can_approve_users, can_assign_roles, is_active) 
VALUES

-- 1. ADMINISTRATOR - Highest level
(
    'administrator', 
    'Quản trị viên', 
    'Quản trị toàn bộ hệ thống, phê duyệt tài khoản, phân quyền cho tất cả vai trò. Có toàn quyền truy cập và quản lý mọi chức năng.', 
    100,    -- level (highest)
    1,      -- priority (1 = highest)
    TRUE,   -- can_approve_users
    TRUE,   -- can_assign_roles
    TRUE    -- is_active
),

-- 2. BOARD OF DIRECTORS - Leadership level
(
    'board_of_directors', 
    'Ban giám hiệu', 
    'Lãnh đạo cấp cao của nhà trường. Có quyền phê duyệt tài khoản, xem báo cáo tổng hợp, quản lý các đơn vị. Không thể phân quyền.', 
    90,     -- level
    2,      -- priority
    TRUE,   -- can_approve_users
    FALSE,  -- can_assign_roles
    TRUE    -- is_active
),

-- 3. DEAN - Department leadership
(
    'dean', 
    'Trưởng khoa', 
    'Quản lý khoa, có quyền phê duyệt tài khoản giảng viên thuộc khoa. Quản lý lịch giảng dạy, phân công công việc trong khoa.', 
    80,     -- level
    3,      -- priority
    TRUE,   -- can_approve_users (limited to their department)
    FALSE,  -- can_assign_roles
    TRUE    -- is_active
),

-- 4. VICE DEAN - Assistant department leadership
(
    'vice_dean', 
    'Phó trưởng khoa', 
    'Hỗ trợ trưởng khoa trong công tác quản lý. Có quyền xem và chỉnh sửa dữ liệu trong khoa, nhưng không phê duyệt tài khoản.', 
    70,     -- level
    4,      -- priority
    FALSE,  -- can_approve_users
    FALSE,  -- can_assign_roles
    TRUE    -- is_active
),

-- 5. LECTURER - Teaching staff
(
    'lecturer', 
    'Giảng viên', 
    'Giảng viên giảng dạy các môn học. Có quyền quản lý lớp học được phân công, nhập điểm, xem thông tin sinh viên trong lớp.', 
    50,     -- level
    5,      -- priority
    FALSE,  -- can_approve_users
    FALSE,  -- can_assign_roles
    TRUE    -- is_active
),

-- 6. STAFF - Administrative staff
(
    'staff', 
    'Cán bộ', 
    'Nhân viên hành chính, văn phòng khoa. Có quyền quản lý văn bản, thời khóa biểu, tài sản, nhưng không can thiệp vào học tập.', 
    40,     -- level
    6,      -- priority
    FALSE,  -- can_approve_users
    FALSE,  -- can_assign_roles
    TRUE    -- is_active
),

-- 7. GUEST - Limited access
(
    'guest', 
    'Khách', 
    'Quyền xem hạn chế, không thể thao tác. Dùng cho tài khoản mới đăng ký trước khi được cấp vai trò chính thức.', 
    10,     -- level (lowest)
    10,     -- priority (lowest)
    FALSE,  -- can_approve_users
    FALSE,  -- can_assign_roles
    TRUE    -- is_active
);

-- =======================================================
-- VERIFICATION
-- =======================================================

-- Display all roles with hierarchy
SELECT 
    id,
    name,
    display_name,
    level,
    priority,
    can_approve_users AS 'Phê duyệt',
    can_assign_roles AS 'Phân quyền',
    is_active AS 'Kích hoạt'
FROM roles
ORDER BY priority ASC;

-- Count roles
SELECT COUNT(*) AS 'Total Roles' FROM roles;

-- Show permission summary
SELECT 
    CASE 
        WHEN can_approve_users = TRUE AND can_assign_roles = TRUE THEN 'Full Admin'
        WHEN can_approve_users = TRUE THEN 'Can Approve'
        ELSE 'Standard User'
    END AS 'Permission Level',
    COUNT(*) AS 'Count'
FROM roles
GROUP BY can_approve_users, can_assign_roles;

-- =======================================================
-- ROLE HIERARCHY EXPLANATION
-- =======================================================
/*

HIERARCHY (Priority: 1 = Highest):

1. ADMINISTRATOR (Priority 1)
   └─ Full control over system
   └─ Can approve all users
   └─ Can assign any role

2. BOARD OF DIRECTORS (Priority 2)
   └─ Leadership oversight
   └─ Can approve users
   └─ Cannot assign roles

3. DEAN (Priority 3)
   └─ Department management
   └─ Can approve lecturers in their department
   └─ Cannot assign roles

4. VICE DEAN (Priority 4)
   └─ Department support
   └─ Cannot approve or assign

5. LECTURER (Priority 5)
   └─ Teaching & class management
   └─ Cannot approve or assign

6. STAFF (Priority 6)
   └─ Administrative tasks
   └─ Cannot approve or assign

7. GUEST (Priority 10)
   └─ Read-only, limited access
   └─ Cannot approve or assign

*/

-- =======================================================
-- DEFAULT ADMIN ACCOUNT RECOMMENDATION
-- =======================================================
/*
After running this seed, you should have at least one admin account.
If not, manually create one:

INSERT INTO users 
(username, email, password_hash, full_name, role_id, account_status, is_active, created_at)
VALUES
(
    'admin',
    'admin@khoa-anninh.edu.vn',
    -- Password: Admin@123 (hashed with bcrypt, 12 rounds)
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5Y7BK5NBh5x3C',
    'Quản trị viên hệ thống',
    1,  -- role_id = administrator
    'approved',
    TRUE,
    NOW()
);

-- Remember to change the password after first login!
*/

-- =======================================================
-- END OF SEED DATA
-- =======================================================

SELECT 'Seed 002_roles_hierarchy.sql completed successfully!' AS Status;
