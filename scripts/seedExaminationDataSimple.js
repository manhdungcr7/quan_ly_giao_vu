/**
 * Seed Simple Examination Data
 * Tạo dữ liệu mẫu đơn giản cho hệ thống khảo thí
 */

const db = require('../config/database');

async function seedData() {
  try {
    console.log('🌱 Seeding examination data...\n');

    // 1. Periods
    await db.query(`
      INSERT INTO examination_periods (id, name, semester, academic_year, start_date, end_date, status)
      VALUES 
        (1, 'Kỳ thi giữa kỳ HK I 2024-2025', 'HK I', '2024-2025', '2024-11-01', '2024-11-15', 'active'),
        (2, 'Kỳ thi cuối kỳ HK I 2024-2025', 'HK I', '2024-2025', '2024-12-20', '2025-01-10', 'draft')
      ON DUPLICATE KEY UPDATE name=name
    `);
    console.log('✅ Created periods');

    // 2. Subjects
    await db.query(`
      INSERT INTO subjects (id, code, name, credits, department, exam_duration)
      VALUES 
        (1, 'LAW101', 'Pháp luật đại cương', 2, 'Khoa Luật', 120),
        (2, 'CS201', 'Lập trình OOP', 3, 'Khoa CNTT', 90),
        (3, 'ADM301', 'Quản trị nhà nước', 3, 'Khoa Hành chính', 120),
        (4, 'ECO101', 'Kinh tế vi mô', 3, 'Khoa Kinh tế', 90),
        (5, 'SEC401', 'An ninh mạng', 3, 'Khoa An ninh', 120),
        (6, 'POL201', 'Lý luận chính trị', 2, 'Khoa Chính trị', 90)
      ON DUPLICATE KEY UPDATE code=code
    `);
    console.log('✅ Created subjects');

    // 3. Sessions
    await db.query(`
      INSERT INTO examination_sessions 
      (period_id, subject_id, exam_code, exam_name, exam_date, exam_time, duration, room, student_count, expected_copies, link, exam_type, status)
      VALUES 
        (1, 1, 'LAW101-GK-01', 'Thi giữa kỳ Pháp luật đại cương', '2024-11-05', '08:00:00', 120, 'A101', 45, 50, 'https://meet.google.com/law-101', 'offline', 'scheduled'),
        (1, 2, 'CS201-GK-01', 'Thi giữa kỳ Lập trình OOP', '2024-11-06', '08:00:00', 90, 'B201', 35, 40, 'https://meet.google.com/cs-201', 'online', 'scheduled'),
        (1, 3, 'ADM301-GK-01', 'Thi giữa kỳ Quản trị nhà nước', '2024-11-07', '08:00:00', 120, 'C301', 50, 55, NULL, 'offline', 'scheduled'),
        (1, 4, 'ECO101-GK-01', 'Thi giữa kỳ Kinh tế vi mô', '2024-11-08', '13:30:00', 90, 'D101', 48, 50, 'https://meet.google.com/eco-101', 'hybrid', 'scheduled'),
        (1, 5, 'SEC401-GK-01', 'Thi giữa kỳ An ninh mạng', '2024-11-09', '08:00:00', 120, 'E401', 32, 35, NULL, 'offline', 'scheduled'),
        (1, 6, 'POL201-GK-01', 'Thi giữa kỳ Lý luận chính trị', '2024-11-10', '08:00:00', 90, 'F201', 55, 60, NULL, 'offline', 'scheduled'),
        (2, 1, 'LAW101-CK-01', 'Thi cuối kỳ Pháp luật đại cương', '2024-12-25', '08:00:00', 120, 'A101', 45, 50, NULL, 'offline', 'scheduled'),
        (2, 2, 'CS201-CK-01', 'Thi cuối kỳ Lập trình OOP', '2024-12-26', '08:00:00', 90, 'B201', 35, 40, 'https://meet.google.com/cs-final', 'online', 'scheduled'),
        (2, 3, 'ADM301-CK-01', 'Thi cuối kỳ Quản trị nhà nước', '2024-12-27', '08:00:00', 120, 'C301', 50, 55, NULL, 'offline', 'scheduled'),
        (2, 5, 'SEC401-CK-01', 'Thi cuối kỳ An ninh mạng', '2024-12-28', '13:30:00', 120, 'E401', 32, 35, NULL, 'offline', 'scheduled')
      ON DUPLICATE KEY UPDATE exam_code=exam_code
    `);
    console.log('✅ Created 10 examination sessions');

    console.log('\n✅ Data seeded successfully!');
    console.log('🎯 View at: http://localhost:3000/examination\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    if (db.pool) {
      await db.pool.end();
    }
    process.exit(0);
  }
}

seedData();
