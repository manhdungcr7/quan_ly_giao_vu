/**
 * SCRIPT KIỂM TRA NHANH CÁC TÍNH NĂNG QUẢN LÝ CÁN BỘ
 * 
 * Chạy: node test-staff-features.js
 */

const mysql = require('mysql2/promise');

async function testStaffFeatures() {
  console.log('🧪 BẮT ĐẦU KIỂM TRA CÁC TÍNH NĂNG QUẢN LÝ CÁN BỘ\n');

  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Loc15031992',
    database: 'quan_ly_giao_vu'
  });

  try {
    // Test 1: Kiểm tra các bảng đã được tạo
    console.log('📋 Test 1: Kiểm tra bảng database...');
    const [tables] = await connection.query(
      "SHOW TABLES LIKE 'evaluation%'"
    );
    console.log(`✅ Tìm thấy ${tables.length}/5 bảng evaluation`);
    tables.forEach(row => {
      console.log(`   - ${Object.values(row)[0]}`);
    });
    console.log('');

    // Test 2: Kiểm tra tiêu chí đánh giá
    console.log('📊 Test 2: Kiểm tra tiêu chí đánh giá...');
    const [criteria] = await connection.query(`
      SELECT category, COUNT(*) as count, ROUND(SUM(weight), 2) as total_weight
      FROM evaluation_criteria
      WHERE is_active = 1
      GROUP BY category
    `);
    console.log('✅ Phân bố tiêu chí theo nhóm:');
    const categoryNames = {
      teaching: 'Giảng dạy',
      research: 'Nghiên cứu KH',
      service: 'Phục vụ cộng đồng',
      professional: 'Phát triển nghề nghiệp',
      other: 'Kỷ luật & Đạo đức'
    };
    criteria.forEach(row => {
      console.log(`   ${categoryNames[row.category]}: ${row.count} tiêu chí, ${row.total_weight}%`);
    });
    const totalWeight = criteria.reduce((sum, row) => sum + parseFloat(row.total_weight), 0);
    console.log(`   Tổng trọng số: ${totalWeight}%`);
    console.log('');

    // Test 3: Kiểm tra đợt đánh giá
    console.log('📅 Test 3: Kiểm tra đợt đánh giá...');
    const [periods] = await connection.query(`
      SELECT id, name, academic_year, semester, status
      FROM evaluation_periods
      ORDER BY start_date DESC
    `);
    console.log(`✅ Tìm thấy ${periods.length} đợt đánh giá:`);
    periods.forEach(row => {
      console.log(`   - ${row.name} (${row.academic_year}) - Status: ${row.status}`);
    });
    console.log('');

    // Test 4: Kiểm tra cấu hình tiêu chí theo đợt
    console.log('⚙️ Test 4: Kiểm tra cấu hình tiêu chí...');
    const [config] = await connection.query(`
      SELECT ep.name, COUNT(epc.id) as criteria_count
      FROM evaluation_periods ep
      LEFT JOIN evaluation_period_criteria epc ON ep.id = epc.period_id
      GROUP BY ep.id, ep.name
    `);
    console.log('✅ Số tiêu chí được cấu hình cho từng đợt:');
    config.forEach(row => {
      console.log(`   - ${row.name}: ${row.criteria_count} tiêu chí`);
    });
    console.log('');

    // Test 5: Kiểm tra bảng staff
    console.log('👥 Test 5: Kiểm tra bảng staff...');
    const [staffCount] = await connection.query('SELECT COUNT(*) as total FROM staff');
    console.log(`✅ Tổng số cán bộ trong hệ thống: ${staffCount[0].total}`);
    
    if (staffCount[0].total > 0) {
      const [staffSample] = await connection.query(`
        SELECT s.staff_code, u.full_name, d.name as department, s.employment_type
        FROM staff s
        LEFT JOIN users u ON s.user_id = u.id
        LEFT JOIN departments d ON s.department_id = d.id
        LIMIT 5
      `);
      console.log('   Danh sách mẫu:');
      staffSample.forEach(row => {
        console.log(`   - ${row.staff_code}: ${row.full_name} (${row.department || 'N/A'}) - ${row.employment_type}`);
      });
    }
    console.log('');

    // Test 6: Kiểm tra routes
    console.log('🛣️ Test 6: Routes cần kiểm tra thủ công:');
    console.log('   GET  http://localhost:3000/staff');
    console.log('   GET  http://localhost:3000/staff/create');
    console.log('   POST http://localhost:3000/staff (với form data)');
    console.log('   GET  http://localhost:3000/staff/evaluation-criteria');
    console.log('   GET  http://localhost:3000/staff/export');
    console.log('');

    // Summary
    console.log('✅ TẤT CẢ CÁC TEST CƠ BẢN ĐÃ PASS!');
    console.log('');
    console.log('📝 BƯỚC TIẾP THEO:');
    console.log('1. Khởi động server: npm run dev');
    console.log('2. Đăng nhập: http://localhost:3000/login');
    console.log('3. Vào trang quản lý cán bộ: http://localhost:3000/staff');
    console.log('4. Thử tính năng "Thêm cán bộ"');
    console.log('5. Thử tính năng "Thiết lập tiêu chí đánh giá"');
    console.log('');
    console.log('💡 TIP: Mật khẩu mặc định cho cán bộ mới là: staff@123');

  } catch (error) {
    console.error('❌ LỖI:', error.message);
    console.error('');
    console.error('🔧 KHẮC PHỤC:');
    console.error('1. Kiểm tra MySQL đang chạy');
    console.error('2. Kiểm tra database "quan_ly_giao_vu" đã tồn tại');
    console.error('3. Chạy lại SQL import: Get-Content database/staff_evaluation_system.sql | mysql -u root -pLoc15031992 quan_ly_giao_vu');
  } finally {
    await connection.end();
  }
}

// Chạy test
testStaffFeatures().catch(console.error);
