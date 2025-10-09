require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkTables() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });
  
  const [tables] = await conn.query("SHOW TABLES LIKE 'work_schedules'");
  console.log('Tables found:', tables.length);
  
  if (tables.length > 0) {
    const [columns] = await conn.query("DESCRIBE work_schedules");
    console.log('\nColumns in work_schedules:');
    columns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });
  }
  
  await conn.end();
}

checkTables().catch(console.error);
