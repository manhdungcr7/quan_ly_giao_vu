require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function importWorkbookSchema() {
  let connection;
  
  try {
    console.log('🔄 Đang kết nối database...');
    
    // Tạo kết nối
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'quan_ly_giao_vu',
      multipleStatements: true
    });

    console.log('✅ Đã kết nối database');

    // Đọc file schema
    const schemaPath = path.join(__dirname, '../database/workbook_schema.sql');
    console.log('📖 Đọc file schema từ:', schemaPath);
    
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Thực thi schema
    console.log('🔨 Đang tạo bảng workbooks và workbook_entries...');
    await connection.query(schema);

    console.log('✅ Import workbook schema thành công!');
    console.log('📊 Các bảng đã tạo:');
    console.log('   - workbooks (sổ tay công tác theo tuần)');
    console.log('   - workbook_entries (chi tiết công việc từng ngày)');

  } catch (error) {
    console.error('❌ Lỗi khi import schema:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔒 Đã đóng kết nối database');
    }
  }
}

// Chạy script
importWorkbookSchema()
  .then(() => {
    console.log('✅ Hoàn tất!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script thất bại:', error);
    process.exit(1);
  });
