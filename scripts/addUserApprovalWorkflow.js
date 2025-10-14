#!/usr/bin/env node
/**
 * Migration script: introduce user approval workflow columns and seed missing roles
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const db = require('../config/database');

(async () => {
    console.log('🚀 Starting user approval workflow migration...');

    try {
        const columns = [
            {
                name: 'approval_status',
                checkSql: "SHOW COLUMNS FROM users LIKE 'approval_status'",
                alterSql: "ALTER TABLE users ADD COLUMN approval_status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending' AFTER is_active"
            },
            {
                name: 'approved_by',
                checkSql: "SHOW COLUMNS FROM users LIKE 'approved_by'",
                alterSql: 'ALTER TABLE users ADD COLUMN approved_by INT UNSIGNED NULL AFTER approval_status'
            },
            {
                name: 'approved_at',
                checkSql: "SHOW COLUMNS FROM users LIKE 'approved_at'",
                alterSql: 'ALTER TABLE users ADD COLUMN approved_at DATETIME NULL AFTER approved_by'
            },
            {
                name: 'rejected_reason',
                checkSql: "SHOW COLUMNS FROM users LIKE 'rejected_reason'",
                alterSql: 'ALTER TABLE users ADD COLUMN rejected_reason VARCHAR(255) NULL AFTER approved_at'
            }
        ];

        for (const column of columns) {
            const exists = await db.findOne(column.checkSql);
            if (!exists) {
                console.log(`➕ Adding column ${column.name}...`);
                await db.query(column.alterSql);
            } else {
                console.log(`ℹ️ Column ${column.name} already exists, skipping`);
            }
        }

        const indexes = [
            { name: 'idx_approval_status', sql: 'ALTER TABLE users ADD INDEX idx_approval_status (approval_status)' },
            { name: 'idx_approved_by', sql: 'ALTER TABLE users ADD INDEX idx_approved_by (approved_by)' }
        ];

        for (const idx of indexes) {
            const exists = await db.findOne(
                'SHOW INDEX FROM users WHERE Key_name = ?',
                [idx.name]
            );
            if (!exists) {
                console.log(`➕ Creating index ${idx.name}...`);
                await db.query(idx.sql);
            } else {
                console.log(`ℹ️ Index ${idx.name} already exists, skipping`);
            }
        }

        const fkExists = await db.findOne(`
            SELECT CONSTRAINT_NAME
            FROM information_schema.KEY_COLUMN_USAGE
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'users'
              AND COLUMN_NAME = 'approved_by'
              AND REFERENCED_TABLE_NAME = 'users'
        `);

        if (!fkExists) {
            console.log('➕ Creating foreign key fk_users_approved_by...');
            await db.query(`
                ALTER TABLE users
                ADD CONSTRAINT fk_users_approved_by
                FOREIGN KEY (approved_by) REFERENCES users(id)
                ON DELETE SET NULL
            `);
        } else {
            console.log('ℹ️ Foreign key for approved_by already exists, skipping');
        }

        console.log('🛠 Normalising existing user records...');
        await db.query(`
            UPDATE users
            SET approval_status = 'approved',
                approved_at = COALESCE(approved_at, NOW())
            WHERE approval_status IS NULL AND is_active = 1
        `);
        await db.query(`
            UPDATE users
            SET approval_status = 'pending',
                approved_at = NULL,
                approved_by = NULL
            WHERE approval_status IS NULL
        `);

        const rolesToEnsure = [
            {
                name: 'guest',
                description: 'Guest account with limited permissions',
                permissions: '["read"]'
            },
            {
                name: 'department_head',
                description: 'Trưởng khoa',
                permissions: '["read", "write_own", "approve_department"]'
            },
            {
                name: 'deputy_department_head',
                description: 'Phó trưởng khoa',
                permissions: '["read", "write_own", "assist_department"]'
            },
            {
                name: 'board',
                description: 'Ban giám hiệu',
                permissions: '["read", "write_own", "approve_all"]'
            }
        ];

        for (const role of rolesToEnsure) {
            const exists = await db.findOne('SELECT id FROM roles WHERE name = ?', [role.name]);
            if (!exists) {
                console.log(`➕ Seeding missing role "${role.name}"...`);
                await db.insert(
                    'INSERT INTO roles (name, description, permissions, is_active, created_at) VALUES (?, ?, ?, 1, NOW())',
                    [role.name, role.description, role.permissions]
                );
            } else {
                console.log(`ℹ️ Role "${role.name}" already exists, skipping`);
            }
        }

        console.log('✅ User approval workflow migration completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error.message || error);
        process.exit(1);
    }
})();
