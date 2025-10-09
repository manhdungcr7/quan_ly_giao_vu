#!/usr/bin/env node
// Migration: add manual grader support to examination_sessions
require('dotenv').config();
const db = require('../config/database');

(async () => {
  try {
    console.log('🚀 Running migration: add manual grader columns');

    const hasManualName = await db.query("SHOW COLUMNS FROM examination_sessions LIKE 'grader_manual_name'");
    if (!hasManualName.length) {
      await db.query(`ALTER TABLE examination_sessions
        ADD COLUMN grader_manual_name VARCHAR(120) NULL AFTER grader_id`);
      console.log('✅ Added grader_manual_name column');
    } else {
      console.log('ℹ️ grader_manual_name column already exists');
    }

    console.log('✅ Migration completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
})();
