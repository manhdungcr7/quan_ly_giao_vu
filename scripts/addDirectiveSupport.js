#!/usr/bin/env node
/**
 * Migration: add chi_dao column to documents + directive history table
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const db = require('../config/database');

(async () => {
  try {
    console.log('🚀 Running directive migration...');

    // Check column chi_dao
    const existingCol = await db.findOne("SHOW COLUMNS FROM documents LIKE 'chi_dao'");
    if (existingCol) {
      console.log('ℹ️ Column chi_dao already exists');
    } else {
      console.log('➕ Adding column chi_dao ...');
      await db.query('ALTER TABLE documents ADD COLUMN chi_dao TEXT NULL AFTER to_org_id');
      console.log('✅ Column chi_dao added');
    }

    // Create history table (acted_by nullable to allow ON DELETE SET NULL)
    await db.query(`
      CREATE TABLE IF NOT EXISTS document_directive_history (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        document_id INT UNSIGNED NOT NULL,
        old_value TEXT NULL,
        new_value TEXT NULL,
        action ENUM('update','approve') NOT NULL,
        acted_by INT UNSIGNED NULL,
        note VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX (document_id),
        INDEX (acted_by),
        CONSTRAINT fk_ddh_document FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
        CONSTRAINT fk_ddh_user FOREIGN KEY (acted_by) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log('✅ Directive migration completed');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
})();
