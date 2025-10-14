-- =======================================================
-- MIGRATION: User Approval System
-- Description: Add account approval workflow fields to users table
--              and update roles table with permission fields
-- Date: 2025-10-11
-- =======================================================

-- Backup recommendation: Run backup before executing this migration
-- Example: mysqldump -u root -p quan_ly_giao_vu > backup_before_approval_system.sql

USE quan_ly_giao_vu;

-- =======================================================
-- STEP 1: ALTER users TABLE
-- =======================================================

-- Add account_status field (pending, approved, rejected, suspended)
ALTER TABLE users 
ADD COLUMN account_status ENUM('pending', 'approved', 'rejected', 'suspended') 
    NOT NULL DEFAULT 'approved' 
    COMMENT 'Trạng thái tài khoản: pending=chờ duyệt, approved=đã duyệt, rejected=bị từ chối, suspended=bị đình chỉ'
    AFTER is_active;

-- Add approval tracking fields
ALTER TABLE users 
ADD COLUMN approved_by INT UNSIGNED NULL 
    COMMENT 'ID quản trị viên phê duyệt'
    AFTER account_status;

ALTER TABLE users 
ADD COLUMN approved_at DATETIME NULL 
    COMMENT 'Thời điểm phê duyệt/từ chối'
    AFTER approved_by;

ALTER TABLE users 
ADD COLUMN registration_note TEXT NULL 
    COMMENT 'Lý do đăng ký / ghi chú từ người dùng'
    AFTER approved_at;

ALTER TABLE users 
ADD COLUMN rejection_reason TEXT NULL 
    COMMENT 'Lý do từ chối (nếu có)'
    AFTER registration_note;

-- Add index for better query performance
ALTER TABLE users 
ADD INDEX idx_account_status (account_status);

-- Add foreign key for approved_by
ALTER TABLE users 
ADD CONSTRAINT fk_users_approved_by 
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL;

-- Set existing users to 'approved' status (backward compatibility)
UPDATE users 
SET account_status = 'approved', 
    approved_at = created_at 
WHERE account_status = 'approved' AND is_active = TRUE;

-- =======================================================
-- STEP 2: ALTER roles TABLE
-- =======================================================

-- Add priority field for role hierarchy (lower number = higher priority)
ALTER TABLE roles 
ADD COLUMN priority INT UNSIGNED NOT NULL DEFAULT 100 
    COMMENT 'Thứ tự ưu tiên vai trò: số càng nhỏ càng cao cấp (1 = cao nhất)'
    AFTER level;

-- Add permission flags
ALTER TABLE roles 
ADD COLUMN can_approve_users BOOLEAN NOT NULL DEFAULT FALSE
    COMMENT 'Vai trò này có quyền phê duyệt tài khoản mới không'
    AFTER priority;

ALTER TABLE roles 
ADD COLUMN can_assign_roles BOOLEAN NOT NULL DEFAULT FALSE
    COMMENT 'Vai trò này có quyền phân quyền cho người khác không'
    AFTER can_approve_users;

-- =======================================================
-- STEP 3: UPDATE EXISTING ROLES (If any)
-- =======================================================

-- Update existing roles with priority values (if they exist)
UPDATE roles SET priority = 1, can_approve_users = TRUE, can_assign_roles = TRUE WHERE name = 'administrator';
UPDATE roles SET priority = 2, can_approve_users = TRUE, can_assign_roles = FALSE WHERE name = 'board_of_directors';
UPDATE roles SET priority = 3, can_approve_users = TRUE, can_assign_roles = FALSE WHERE name = 'dean';
UPDATE roles SET priority = 4, can_approve_users = FALSE, can_assign_roles = FALSE WHERE name = 'vice_dean';
UPDATE roles SET priority = 5, can_approve_users = FALSE, can_assign_roles = FALSE WHERE name = 'lecturer';
UPDATE roles SET priority = 6, can_approve_users = FALSE, can_assign_roles = FALSE WHERE name = 'staff';
UPDATE roles SET priority = 10, can_approve_users = FALSE, can_assign_roles = FALSE WHERE name = 'guest';

-- =======================================================
-- VERIFICATION QUERIES
-- =======================================================

-- Check users table structure
SELECT 
    COLUMN_NAME, 
    COLUMN_TYPE, 
    IS_NULLABLE, 
    COLUMN_DEFAULT, 
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'quan_ly_giao_vu' 
    AND TABLE_NAME = 'users' 
    AND COLUMN_NAME IN ('account_status', 'approved_by', 'approved_at', 'registration_note', 'rejection_reason')
ORDER BY ORDINAL_POSITION;

-- Check roles table structure
SELECT 
    COLUMN_NAME, 
    COLUMN_TYPE, 
    IS_NULLABLE, 
    COLUMN_DEFAULT, 
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'quan_ly_giao_vu' 
    AND TABLE_NAME = 'roles' 
    AND COLUMN_NAME IN ('priority', 'can_approve_users', 'can_assign_roles')
ORDER BY ORDINAL_POSITION;

-- Check foreign key constraint
SELECT 
    CONSTRAINT_NAME, 
    TABLE_NAME, 
    COLUMN_NAME, 
    REFERENCED_TABLE_NAME, 
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'quan_ly_giao_vu'
    AND CONSTRAINT_NAME = 'fk_users_approved_by';

-- Count users by status
SELECT account_status, COUNT(*) as count
FROM users
GROUP BY account_status;

-- =======================================================
-- ROLLBACK SCRIPT (IF NEEDED)
-- =======================================================
/*
-- CAUTION: This will drop all approval data!
-- Only use if migration failed and needs rollback

ALTER TABLE users DROP FOREIGN KEY fk_users_approved_by;
ALTER TABLE users DROP INDEX idx_account_status;
ALTER TABLE users DROP COLUMN rejection_reason;
ALTER TABLE users DROP COLUMN registration_note;
ALTER TABLE users DROP COLUMN approved_at;
ALTER TABLE users DROP COLUMN approved_by;
ALTER TABLE users DROP COLUMN account_status;

ALTER TABLE roles DROP COLUMN can_assign_roles;
ALTER TABLE roles DROP COLUMN can_approve_users;
ALTER TABLE roles DROP COLUMN priority;
*/

-- =======================================================
-- END OF MIGRATION
-- =======================================================

SELECT 'Migration 001_add_user_approval_system.sql completed successfully!' AS Status;
