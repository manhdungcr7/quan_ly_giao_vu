#!/usr/bin/env node
/**
 * Migration: create report_schedules table & seed initial blueprints
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const db = require('../config/database');

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function toISODate(date) {
  if (!date) return null;
  return date.toISOString().split('T')[0];
}

(async () => {
  try {
    console.log('🚀 Running report schedule migration...');
    const tableExists = await db.findOne("SHOW TABLES LIKE 'report_schedules'");

    if (!tableExists) {
      console.log('➕ Creating report_schedules table...');
      await db.query(`
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
      console.log('✅ Table report_schedules created');
    } else {
      console.log('ℹ️ report_schedules table already exists');
    }

    const columnCheck = async (column, definition) => {
      const existing = await db.findOne(`SHOW COLUMNS FROM report_schedules LIKE '${column}'`);
      if (!existing) {
        console.log(`➕ Adding missing column ${column}...`);
        await db.query(`ALTER TABLE report_schedules ADD COLUMN ${definition}`);
        console.log(`✅ Column ${column} added`);
      }
    };

    await columnCheck('owner_custom', "VARCHAR(120) NULL AFTER owner_unit_id");
    await columnCheck('attachments_expected', "TINYINT UNSIGNED NOT NULL DEFAULT 0 AFTER recurrence_pattern");

    const total = await db.findOne('SELECT COUNT(*) AS total FROM report_schedules');
    if ((total?.total ?? 0) === 0) {
      console.log('🌱 Seeding default report schedules...');
      const today = new Date();
      const seeds = [
        {
          title: 'Báo cáo tuần công tác',
          frequency: 'weekly',
          owner_custom: 'Văn phòng Khoa',
          channel: 'SharePoint nội bộ',
          scope: 'Tổng hợp tiến độ các phòng ban và lịch làm việc trọng tâm',
          status: 'pending',
          progress: 65,
          completion_rate: 92,
          next_due_date: toISODate(addDays(today, 2)),
          due_label: 'Thứ sáu hàng tuần',
          recurrence_pattern: JSON.stringify({ type: 'weekly', dayOfWeek: 5 }),
          attachments_expected: 5,
          tags: JSON.stringify(['Định kỳ', 'Lãnh đạo khoa']),
          last_submitted_at: toISODate(addDays(today, -5))
        },
        {
          title: 'Báo cáo chất lượng đào tạo tháng',
          frequency: 'monthly',
          owner_custom: 'Phòng Đảm bảo chất lượng',
          channel: 'Kho dữ liệu đào tạo',
          scope: 'Theo dõi tỷ lệ hoàn thành kế hoạch giảng dạy, tình trạng lớp học',
          status: 'in_progress',
          progress: 48,
          completion_rate: 87,
          next_due_date: toISODate(addDays(today, 14)),
          due_label: 'Ngày 18 hàng tháng',
          recurrence_pattern: JSON.stringify({ type: 'monthly', dayOfMonth: 18 }),
          attachments_expected: 8,
          tags: JSON.stringify(['Định kỳ', 'Đào tạo']),
          last_submitted_at: toISODate(addDays(today, -20))
        },
        {
          title: 'Báo cáo tổng hợp quý IV/2025',
          frequency: 'quarterly',
          owner_custom: 'Phòng Thanh tra - Kiểm tra',
          channel: 'Kho dữ liệu báo cáo',
          scope: 'Đánh giá chỉ tiêu kế hoạch, ngân sách, công tác phối hợp đơn vị',
          status: 'planning',
          progress: 25,
          completion_rate: 74,
          next_due_date: toISODate(addDays(today, 36)),
          due_label: 'Hạn nộp: 05/11/2025',
          recurrence_pattern: JSON.stringify({ type: 'quarterly', month: 11, day: 5 }),
          attachments_expected: 3,
          tags: JSON.stringify(['Chiến lược', 'Tổng hợp']),
          last_submitted_at: toISODate(addDays(today, -80))
        },
        {
          title: 'Báo cáo tổng kết năm học 2024-2025',
          frequency: 'annual',
          owner_custom: 'Ban Chủ nhiệm Khoa',
          channel: 'Kho dữ liệu báo cáo',
          scope: 'Tổng hợp kết quả toàn diện, đề xuất kế hoạch 2026',
          status: 'draft',
          progress: 15,
          completion_rate: 58,
          next_due_date: toISODate(addDays(today, 72)),
          due_label: 'Hạn trình: 10/12/2025',
          recurrence_pattern: JSON.stringify({ type: 'annual', month: 12, day: 10 }),
          attachments_expected: 0,
          tags: JSON.stringify(['Chiến lược', 'Ban giám hiệu']),
          last_submitted_at: null
        }
      ];

      const insertSql = `
        INSERT INTO report_schedules
          (title, frequency, owner_unit_id, owner_custom, channel, scope, status, progress, completion_rate,
           remind_before_hours, next_due_date, due_label, recurrence_pattern, attachments_expected, tags, last_submitted_at,
           created_by, is_active)
        VALUES (?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, TRUE)
      `;

      for (const seed of seeds) {
        await db.insert(insertSql, [
          seed.title,
          seed.frequency,
          seed.owner_custom,
          seed.channel,
          seed.scope,
          seed.status,
          seed.progress,
          seed.completion_rate,
          48,
          seed.next_due_date,
          seed.due_label,
          seed.recurrence_pattern,
          seed.attachments_expected,
          seed.tags,
          seed.last_submitted_at
        ]);
      }
      console.log('✅ Default report schedules inserted');
    } else {
      console.log(`ℹ️ report_schedules already has ${total.total} record(s)`);
    }

    console.log('🎉 Report schedule migration completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Report schedule migration failed:', error.message);
    process.exit(1);
  }
})();
