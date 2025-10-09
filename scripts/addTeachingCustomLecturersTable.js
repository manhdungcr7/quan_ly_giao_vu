const db = require('../config/database');

async function ensureTeachingCustomLecturersTable() {
  const createTableSql = `
    CREATE TABLE IF NOT EXISTS teaching_custom_lecturers (
      id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL COMMENT 'Tên hiển thị của giảng viên',
      email VARCHAR(255) DEFAULT NULL COMMENT 'Email liên hệ',
      note TEXT COMMENT 'Ghi chú bổ sung',
      anchor_key VARCHAR(255) DEFAULT NULL COMMENT 'Khóa neo vào giảng viên khác',
      created_by INT UNSIGNED NOT NULL COMMENT 'Người tạo',
      updated_by INT UNSIGNED DEFAULT NULL COMMENT 'Người cập nhật cuối',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_tcl_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT fk_tcl_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
      INDEX idx_tcl_anchor (anchor_key)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Giảng viên tùy chỉnh cho lịch giảng';
  `;

  console.log('🔧 Ensuring teaching_custom_lecturers table exists...');
  await db.query(createTableSql);
  console.log('✅ teaching_custom_lecturers table is ready.');
}

async function main() {
  try {
    await ensureTeachingCustomLecturersTable();
  } catch (error) {
    console.error('❌ Failed to ensure teaching_custom_lecturers table:', error);
    process.exitCode = 1;
  } finally {
    try {
      await db.close();
    } catch (closeError) {
      console.error('⚠️ Failed to close database connections:', closeError);
    }
  }
}

main();
