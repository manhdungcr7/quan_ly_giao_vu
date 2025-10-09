-- Simple schema for testing
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP DATABASE IF EXISTS quan_ly_giao_vu;
CREATE DATABASE quan_ly_giao_vu CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE quan_ly_giao_vu;

-- Roles table
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

-- Users table
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
    last_login DATETIME NULL,
    email_verified_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role_id),
    INDEX idx_active (is_active),
    INDEX idx_last_login (last_login)
) ENGINE=InnoDB;

-- Insert default roles
INSERT INTO roles (name, description, permissions, is_active) VALUES
('admin', 'Administrator', '["all"]', 1),
('staff', 'Staff member', '["read", "write"]', 1),
('user', 'Regular user', '["read"]', 1);

SET FOREIGN_KEY_CHECKS = 1;