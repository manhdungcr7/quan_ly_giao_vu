#!/usr/bin/env node
// Migration: create document_files table if not exists
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const db = require('../config/database');

(async () => {
  try {
    console.log('🚀 Running migration: document_files');
    await db.query(`CREATE TABLE IF NOT EXISTS document_files (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      document_id INT UNSIGNED NOT NULL,
      original_name VARCHAR(255) NOT NULL,
      stored_name VARCHAR(255) NOT NULL,
      mime_type VARCHAR(120) NOT NULL,
      size INT UNSIGNED NOT NULL,
      relative_path VARCHAR(500) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX (document_id),
      CONSTRAINT fk_document_files_document FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);
    console.log('✅ document_files table ready');
    process.exit(0);
  } catch (e) {
    console.error('❌ Migration failed:', e.message);
    process.exit(1);
  }
})();