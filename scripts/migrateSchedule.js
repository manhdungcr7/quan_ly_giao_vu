require('dotenv').config();
const mysql = require('mysql2/promise');

async function runMigration() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true
  });

  console.log('🚀 Starting Work Schedule Migration...');

  try {
    // Drop existing tables nếu cần
    console.log('🗑️  Dropping existing tables...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('DROP TABLE IF EXISTS schedule_history');
    await connection.query('DROP TABLE IF EXISTS schedule_exceptions');
    await connection.query('DROP TABLE IF EXISTS schedule_participants');
    await connection.query('DROP TABLE IF EXISTS schedule_templates');
    await connection.query('DROP TABLE IF EXISTS work_schedules');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✓ Old tables dropped');

    // Đọc schema
    const fs = require('fs');
    const path = require('path');
    const schemaPath = path.join(__dirname, '../database/schedule_schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Chạy toàn bộ schema với multipleStatements
    await connection.query(schema);
    console.log('✅ Tables created successfully!');

    // Verify
    const [tables] = await connection.query("SHOW TABLES LIKE 'work_schedules'");
    console.log(`✓ Verified: ${tables.length} table(s) created`);

    await connection.end();
    console.log('✅ Migration completed!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error.stack);
    await connection.end();
    process.exit(1);
  }
}

runMigration();
