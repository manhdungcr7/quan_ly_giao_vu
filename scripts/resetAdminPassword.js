require('dotenv').config();
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

(async () => {
  const username = process.env.ADMIN_USERNAME || 'admin';
  const newPassword = process.env.ADMIN_RESET_PASSWORD || 'Admin@123';
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'quan_ly_giao_vu'
    });
    const [rows] = await conn.query('SELECT id FROM users WHERE username = ?', [username]);
    if (!rows.length) {
      console.log('❌ User not found:', username);
      process.exit(1);
    }
    const hash = await bcrypt.hash(newPassword, 10);
    await conn.query('UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?', [hash, rows[0].id]);
    console.log('✅ Password reset successfully');
    console.log('   Username:', username);
    console.log('   New Password:', newPassword);
    await conn.end();
  } catch (e) {
    console.error('❌ Reset error:', e.message);
    process.exit(1);
  }
})();
