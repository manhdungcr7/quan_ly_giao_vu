/**
 * Seed Sample Examination Data
 * Tạo dữ liệu mẫu c    // Get actual IDs from database
    console.log('🔍 Fetching inserted IDs...');
    const periodsResult = await db.query('SELECT id, name FROM examination_periods ORDER BY id');
    console.log('   Debug periodsResult:', JSON.stringify(periodsResult).substring(0, 200));
    
    const subjectsResult = await db.query('SELECT id, code FROM subjects WHERE code IN ("LAW101", "CS201", "ADM301", "ECO101", "SEC401", "POL201") ORDER BY id');
    const classesResult = await db.query('SELECT id, code FROM classes WHERE code LIKE "LAW101%" OR code LIKE "CS201%" OR code LIKE "ADM301%" OR code LIKE "ECO101%" OR code LIKE "SEC401%" OR code LIKE "POL201%" ORDER BY id');
    
    // Handle both array [rows, fields] and direct rows return
    let periods, subjects, classes;
    
    if (Array.isArray(periodsResult) && Array.isArray(periodsResult[0])) {
      periods = periodsResult[0];
      subjects = subjectsResult[0];
      classes = classesResult[0];
    } else {
      periods = periodsResult;
      subjects = subjectsResult;
      classes = classesResult;
    }
    
    console.log(`   Found ${periods?.length || 0} periods, ${subjects?.length || 0} subjects, ${classes?.length || 0} classes`);hống khảo thí
 */

const db = require('../config/database');

async function seedExaminationData() {
  try {
    console.log('🌱 Starting to seed examination data...\n');

    // 1. Insert Examination Periods (Kỳ thi)
    console.log('📅 Creating examination periods...');
    const periodQuery = `
      INSERT INTO examination_periods (name, semester, academic_year, start_date, end_date, status, description)
      VALUES 
        ('Kỳ thi giữa kỳ HK I 2024-2025', 'HK I', '2024-2025', '2024-11-01', '2024-11-15', 'active', 'Kỳ thi giữa kỳ học kỳ I năm học 2024-2025'),
        ('Kỳ thi cuối kỳ HK I 2024-2025', 'HK I', '2024-2025', '2024-12-20', '2025-01-10', 'draft', 'Kỳ thi cuối kỳ học kỳ I năm học 2024-2025'),
        ('Kỳ thi giữa kỳ HK II 2024-2025', 'HK II', '2024-2025', '2025-03-15', '2025-03-30', 'draft', 'Kỳ thi giữa kỳ học kỳ II năm học 2024-2025')
      ON DUPLICATE KEY UPDATE name=name
    `;
    await db.query(periodQuery);
    console.log('   ✅ Created 3 examination periods\n');

    // 2. Insert Subjects (Môn học)
    console.log('📚 Creating subjects...');
    const subjectQuery = `
      INSERT INTO subjects (code, name, credits, department, theory_hours, practice_hours, exam_duration, status)
      VALUES 
        ('LAW101', 'Pháp luật đại cương', 2, 'Khoa Luật', 24, 6, 120, 'active'),
        ('CS201', 'Lập trình hướng đối tượng', 3, 'Khoa CNTT', 30, 15, 90, 'active'),
        ('ADM301', 'Quản trị nhà nước', 3, 'Khoa Hành chính', 36, 9, 120, 'active'),
        ('ECO101', 'Kinh tế vi mô', 3, 'Khoa Kinh tế', 30, 15, 90, 'active'),
        ('SEC401', 'An ninh mạng', 3, 'Khoa An ninh', 30, 15, 120, 'active'),
        ('POL201', 'Lý luận chính trị', 2, 'Khoa Chính trị', 24, 6, 90, 'active')
      ON DUPLICATE KEY UPDATE code=code
    `;
    await db.query(subjectQuery);
    console.log('   ✅ Created 6 subjects\n');

    // 3. Insert Classes (Lớp học)
    console.log('👥 Creating classes...');
    const classQuery = `
      INSERT INTO classes (code, name, subject_id, semester, academic_year, student_count, status)
      VALUES 
        ('LAW101-01', 'Lớp Pháp luật đại cương 01', 1, 'HK I', '2024-2025', 45, 'active'),
        ('LAW101-02', 'Lớp Pháp luật đại cương 02', 1, 'HK I', '2024-2025', 42, 'active'),
        ('CS201-01', 'Lớp Lập trình OOP 01', 2, 'HK I', '2024-2025', 35, 'active'),
        ('CS201-02', 'Lớp Lập trình OOP 02', 2, 'HK I', '2024-2025', 38, 'active'),
        ('ADM301-01', 'Lớp Quản trị nhà nước 01', 3, 'HK I', '2024-2025', 50, 'active'),
        ('ECO101-01', 'Lớp Kinh tế vi mô 01', 4, 'HK I', '2024-2025', 48, 'active'),
        ('SEC401-01', 'Lớp An ninh mạng 01', 5, 'HK I', '2024-2025', 32, 'active'),
        ('POL201-01', 'Lớp Lý luận chính trị 01', 6, 'HK I', '2024-2025', 55, 'active')
      ON DUPLICATE KEY UPDATE code=code
    `;
    await db.query(classQuery);
    console.log('   ✅ Created 8 classes\n');

    // Get actual IDs from database
    console.log('� Fetching inserted IDs...');
    const [periods] = await db.query('SELECT id, name FROM examination_periods ORDER BY id');
    const [subjects] = await db.query('SELECT id, code FROM subjects ORDER BY id');
    const [classes] = await db.query('SELECT id, code FROM classes ORDER BY id');
    
    console.log(`   Found ${periods.length} periods, ${subjects.length} subjects, ${classes.length} classes\n`);

    // 4. Insert Examination Sessions (Ca thi) - using actual IDs
    console.log('📝 Creating examination sessions...');
    
    // Helper to get ID by code
    const getSubjectId = (code) => subjects.find(s => s.code === code)?.id;
    const getClassId = (code) => classes.find(c => c.code === code)?.id;
    
    const sessions = [
      // Kỳ thi giữa kỳ HK I
      [periods[0].id, getSubjectId('LAW101'), getClassId('LAW101-01'), 'LAW101-GK-01', 'Thi giữa kỳ Pháp luật đại cương - Lớp 01', '2024-11-05', '08:00:00', 120, 'A101', 45, 50, 'https://meet.google.com/law-101-01', 'offline', 'scheduled'],
      [periods[0].id, getSubjectId('LAW101'), getClassId('LAW101-02'), 'LAW101-GK-02', 'Thi giữa kỳ Pháp luật đại cương - Lớp 02', '2024-11-05', '10:30:00', 120, 'A102', 42, 45, 'https://meet.google.com/law-101-02', 'offline', 'scheduled'],
      [periods[0].id, getSubjectId('CS201'), getClassId('CS201-01'), 'CS201-GK-01', 'Thi giữa kỳ Lập trình OOP - Lớp 01', '2024-11-06', '08:00:00', 90, 'B201', 35, 40, 'https://meet.google.com/cs-201-01', 'online', 'scheduled'],
      [periods[0].id, getSubjectId('CS201'), getClassId('CS201-02'), 'CS201-GK-02', 'Thi giữa kỳ Lập trình OOP - Lớp 02', '2024-11-06', '10:00:00', 90, 'B202', 38, 40, 'https://meet.google.com/cs-201-02', 'online', 'scheduled'],
      [periods[0].id, getSubjectId('ADM301'), getClassId('ADM301-01'), 'ADM301-GK-01', 'Thi giữa kỳ Quản trị nhà nước', '2024-11-07', '08:00:00', 120, 'C301', 50, 55, null, 'offline', 'scheduled'],
      [periods[0].id, getSubjectId('ECO101'), getClassId('ECO101-01'), 'ECO101-GK-01', 'Thi giữa kỳ Kinh tế vi mô', '2024-11-08', '13:30:00', 90, 'D101', 48, 50, 'https://meet.google.com/eco-101-01', 'hybrid', 'scheduled'],
      [periods[0].id, getSubjectId('SEC401'), getClassId('SEC401-01'), 'SEC401-GK-01', 'Thi giữa kỳ An ninh mạng', '2024-11-09', '08:00:00', 120, 'E401', 32, 35, null, 'offline', 'scheduled'],
      [periods[0].id, getSubjectId('POL201'), getClassId('POL201-01'), 'POL201-GK-01', 'Thi giữa kỳ Lý luận chính trị', '2024-11-10', '08:00:00', 90, 'F201', 55, 60, null, 'offline', 'scheduled'],
      // Kỳ thi cuối kỳ HK I
      [periods[1].id, getSubjectId('LAW101'), getClassId('LAW101-01'), 'LAW101-CK-01', 'Thi cuối kỳ Pháp luật đại cương - Lớp 01', '2024-12-25', '08:00:00', 120, 'A101', 45, 50, null, 'offline', 'scheduled'],
      [periods[1].id, getSubjectId('CS201'), getClassId('CS201-01'), 'CS201-CK-01', 'Thi cuối kỳ Lập trình OOP - Lớp 01', '2024-12-26', '08:00:00', 90, 'B201', 35, 40, 'https://meet.google.com/cs-201-final', 'online', 'scheduled'],
      [periods[1].id, getSubjectId('ADM301'), getClassId('ADM301-01'), 'ADM301-CK-01', 'Thi cuối kỳ Quản trị nhà nước', '2024-12-27', '08:00:00', 120, 'C301', 50, 55, null, 'offline', 'scheduled'],
      [periods[1].id, getSubjectId('SEC401'), getClassId('SEC401-01'), 'SEC401-CK-01', 'Thi cuối kỳ An ninh mạng', '2024-12-28', '13:30:00', 120, 'E401', 32, 35, null, 'offline', 'scheduled']
    ];
    
    for (const session of sessions) {
      try {
        await db.query(`
          INSERT INTO examination_sessions 
          (period_id, subject_id, class_id, exam_code, exam_name, exam_date, exam_time, duration, room, student_count, expected_copies, link, exam_type, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE exam_code=exam_code
        `, session);
      } catch (err) {
        console.log(`   ⚠️  Skipping ${session[3]} (may already exist)`);
      }
    }
    
    console.log('   ✅ Created 12 examination sessions\n');

    console.log('✅ Examination data seeded successfully!\n');
    console.log('📊 Summary:');
    console.log('   • 3 examination periods');
    console.log('   • 6 subjects');
    console.log('   • 8 classes');
    console.log('   • 12 examination sessions');
    console.log('\n🎯 You can now view the data at: http://localhost:3000/examination');
    
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  } finally {
    if (db.pool) {
      await db.pool.end();
      console.log('\n👋 Database connection closed');
    } else {
      process.exit(0);
    }
  }
}

// Run the seeder
seedExaminationData()
  .then(() => {
    console.log('\n✅ Seeder completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Seeder failed:', error);
    process.exit(1);
  });
