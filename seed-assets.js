const db = require('./config/database');

(async () => {
  try {
    console.log('🔄 Seeding assets data...\n');
    
    // Get any user ID
    const admin = await db.query('SELECT id FROM users ORDER BY id LIMIT 1');
    const adminId = admin[0]?.id || 1;
    
    // Get categories
    const categories = await db.query('SELECT id, name FROM asset_categories ORDER BY id');
    console.log('📦 Available categories:');
    categories.forEach(cat => console.log(`  - ${cat.name} (ID: ${cat.id})`));
    
    // Get some staff members
    const staff = await db.query('SELECT id FROM staff LIMIT 5');
    console.log(`\n👥 Found ${staff.length} staff members for assignment\n`);
    
    // Sample assets data
    const assets = [
      // Computers
      {
        asset_code: 'IT-LAP-001',
        name: 'Laptop Dell Latitude 5420',
        category_id: categories.find(c => c.name.includes('Máy tính'))?.id || 1,
        description: 'Laptop công tác cho giảng viên, Core i5-11th Gen, 16GB RAM, 512GB SSD',
        serial_number: 'DL5420-2024-001',
        brand: 'Dell',
        model: 'Latitude 5420',
        purchase_date: '2024-01-15',
        purchase_price: 25000000,
        current_value: 23000000,
        warranty_expiry: '2027-01-15',
        location: 'Phòng giảng viên P301',
        assigned_to: staff[0]?.id || null,
        status: 'in_use',
        condition_rating: 'excellent',
        notes: 'Máy mới, hiệu năng tốt',
        created_by: adminId
      },
      {
        asset_code: 'IT-LAP-002',
        name: 'Laptop HP ProBook 450 G9',
        category_id: categories.find(c => c.name.includes('Máy tính'))?.id || 1,
        description: 'Laptop dự phòng cho công tác, Core i7, 16GB RAM, 512GB SSD',
        serial_number: 'HP450G9-2024-002',
        brand: 'HP',
        model: 'ProBook 450 G9',
        purchase_date: '2024-02-20',
        purchase_price: 28000000,
        current_value: 26500000,
        warranty_expiry: '2027-02-20',
        location: 'Kho thiết bị IT',
        assigned_to: null,
        status: 'available',
        condition_rating: 'excellent',
        notes: 'Sẵn sàng cấp phát',
        created_by: adminId
      },
      {
        asset_code: 'IT-PC-001',
        name: 'Máy tính để bàn Dell OptiPlex 7090',
        category_id: categories.find(c => c.name.includes('Máy tính'))?.id || 1,
        description: 'PC cho phòng hành chính, Core i5-11th, 8GB RAM, 256GB SSD',
        serial_number: 'DELL7090-2023-001',
        brand: 'Dell',
        model: 'OptiPlex 7090',
        purchase_date: '2023-09-10',
        purchase_price: 18000000,
        current_value: 15000000,
        warranty_expiry: '2026-09-10',
        location: 'Phòng hành chính P201',
        assigned_to: staff[1]?.id || null,
        status: 'in_use',
        condition_rating: 'good',
        notes: 'Hoạt động ổn định',
        created_by: adminId
      },
      
      // Office furniture
      {
        asset_code: 'FUR-DSK-001',
        name: 'Bàn làm việc IKEA BEKANT',
        category_id: categories.find(c => c.name.includes('Nội thất'))?.id || 2,
        description: 'Bàn làm việc điều chỉnh chiều cao, 160x80cm, màu trắng',
        serial_number: 'BEKANT-160-001',
        brand: 'IKEA',
        model: 'BEKANT 160x80',
        purchase_date: '2023-06-01',
        purchase_price: 5000000,
        current_value: 4500000,
        warranty_expiry: '2026-06-01',
        location: 'Phòng giảng viên P302',
        assigned_to: staff[2]?.id || null,
        status: 'in_use',
        condition_rating: 'good',
        notes: 'Tình trạng tốt',
        created_by: adminId
      },
      {
        asset_code: 'FUR-CHR-001',
        name: 'Ghế văn phòng Herman Miller Aeron',
        category_id: categories.find(c => c.name.includes('Nội thất'))?.id || 2,
        description: 'Ghế ergonomic cao cấp, đệm lưới thoáng khí',
        serial_number: 'HM-AERON-2023-001',
        brand: 'Herman Miller',
        model: 'Aeron Size B',
        purchase_date: '2023-06-01',
        purchase_price: 12000000,
        current_value: 11000000,
        warranty_expiry: '2035-06-01',
        location: 'Phòng giảng viên P302',
        assigned_to: staff[2]?.id || null,
        status: 'in_use',
        condition_rating: 'excellent',
        notes: 'Bảo hành 12 năm',
        created_by: adminId
      },
      
      // Equipment
      {
        asset_code: 'EQ-PRJ-001',
        name: 'Máy chiếu Epson EB-2250U',
        category_id: categories.find(c => c.name.includes('Thiết bị'))?.id || 3,
        description: 'Máy chiếu WUXGA 5000 lumens cho phòng học',
        serial_number: 'EPSON-EB2250U-001',
        brand: 'Epson',
        model: 'EB-2250U',
        purchase_date: '2023-08-15',
        purchase_price: 35000000,
        current_value: 32000000,
        warranty_expiry: '2026-08-15',
        location: 'Phòng học A301',
        assigned_to: null,
        status: 'in_use',
        condition_rating: 'good',
        notes: 'Thay bóng đèn lần cuối: 2024-09-01',
        created_by: adminId
      },
      {
        asset_code: 'EQ-PRJ-002',
        name: 'Máy chiếu Sony VPL-FHZ70',
        category_id: categories.find(c => c.name.includes('Thiết bị'))?.id || 3,
        description: 'Máy chiếu laser WUXGA cho hội trường',
        serial_number: 'SONY-VPLFHZ70-001',
        brand: 'Sony',
        model: 'VPL-FHZ70',
        purchase_date: '2024-03-20',
        purchase_price: 85000000,
        current_value: 82000000,
        warranty_expiry: '2027-03-20',
        location: 'Kho thiết bị',
        assigned_to: null,
        status: 'maintenance',
        condition_rating: 'good',
        notes: 'Đang bảo trì định kỳ, dự kiến hoàn thành 2024-10-15',
        created_by: adminId
      },
      {
        asset_code: 'EQ-PRT-001',
        name: 'Máy in HP LaserJet Pro M404dn',
        category_id: categories.find(c => c.name.includes('Thiết bị'))?.id || 3,
        description: 'Máy in laser đen trắng tốc độ cao',
        serial_number: 'HP-M404DN-2023-001',
        brand: 'HP',
        model: 'LaserJet Pro M404dn',
        purchase_date: '2023-05-10',
        purchase_price: 8500000,
        current_value: 7000000,
        warranty_expiry: '2026-05-10',
        location: 'Phòng hành chính P201',
        assigned_to: null,
        status: 'in_use',
        condition_rating: 'good',
        notes: 'Thay mực lần cuối: 2024-09-20',
        created_by: adminId
      },
      
      // Vehicles
      {
        asset_code: 'VEH-CAR-001',
        name: 'Xe ô tô Toyota Innova 2023',
        category_id: categories.find(c => c.name.includes('Phương tiện'))?.id || 4,
        description: 'Xe 7 chỗ phục vụ công tác, màu bạc',
        serial_number: 'INNOVA-2023-VN-001',
        brand: 'Toyota',
        model: 'Innova 2.0E MT',
        purchase_date: '2023-01-20',
        purchase_price: 750000000,
        current_value: 680000000,
        warranty_expiry: '2026-01-20',
        location: 'Bãi đỗ xe khoa',
        assigned_to: null,
        status: 'in_use',
        condition_rating: 'good',
        notes: 'Bảo dưỡng định kỳ lần cuối: 2024-09-10. Biển số: 30A-12345',
        created_by: adminId
      },
      {
        asset_code: 'EQ-AC-001',
        name: 'Máy lạnh Daikin FTKC35UVMV',
        category_id: categories.find(c => c.name.includes('Thiết bị'))?.id || 3,
        description: 'Máy lạnh inverter 1.5HP cho phòng họp',
        serial_number: 'DAIKIN-FTKC35-2022-001',
        brand: 'Daikin',
        model: 'FTKC35UVMV',
        purchase_date: '2022-04-15',
        purchase_price: 12000000,
        current_value: 9000000,
        warranty_expiry: '2024-04-15',
        location: 'Phòng họp P401',
        assigned_to: null,
        status: 'in_use',
        condition_rating: 'fair',
        notes: 'Hết bảo hành, cần lên lịch bảo trì',
        created_by: adminId
      },
      {
        asset_code: 'IT-LAP-003',
        name: 'Laptop Asus ZenBook 14',
        category_id: categories.find(c => c.name.includes('Máy tính'))?.id || 1,
        description: 'Laptop cũ đã hết chu kỳ sử dụng',
        serial_number: 'ASUS-ZB14-2019-001',
        brand: 'Asus',
        model: 'ZenBook 14 UX434',
        purchase_date: '2019-03-10',
        purchase_price: 22000000,
        current_value: 5000000,
        warranty_expiry: '2022-03-10',
        location: 'Kho thiết bị cũ',
        assigned_to: null,
        status: 'retired',
        condition_rating: 'poor',
        notes: 'Đã qua 5 năm sử dụng, chờ thanh lý',
        created_by: adminId
      }
    ];
    
    console.log('🔄 Inserting assets...\n');
    
    let inserted = 0;
    for (const asset of assets) {
      try {
        const columns = Object.keys(asset).join(', ');
        const placeholders = Object.keys(asset).map(() => '?').join(', ');
        const values = Object.values(asset);
        
        await db.query(
          `INSERT INTO assets (${columns}) VALUES (${placeholders})`,
          values
        );
        console.log(`✅ Added: ${asset.name} (${asset.asset_code})`);
        inserted++;
      } catch (err) {
        console.error(`❌ Failed to add ${asset.name}:`, err.message);
      }
    }
    
    console.log(`\n✨ Successfully inserted ${inserted}/${assets.length} assets`);
    
    // Show summary
    const stats = await db.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available,
        SUM(CASE WHEN status = 'in_use' THEN 1 ELSE 0 END) as in_use,
        SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) as maintenance,
        SUM(CASE WHEN status = 'retired' THEN 1 ELSE 0 END) as retired,
        SUM(current_value) as total_value
      FROM assets
    `);
    
    console.log('\n📊 Assets Summary:');
    console.table(stats[0]);
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error(err);
  } finally {
    await db.close();
  }
})();
