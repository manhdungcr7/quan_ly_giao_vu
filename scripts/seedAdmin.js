require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../config/database');

async function seedAdmin() {
    console.log('🌱 Starting admin seeding...');
    
    try {
        // Lấy role admin (đã có sẵn từ schema)
        let adminRole = await db.findOne('SELECT * FROM roles WHERE name = ?', ['admin']);
        
        if (!adminRole) {
            console.log('❌ Admin role not found in database!');
            process.exit(1);
        }
        
        console.log('✅ Found admin role with ID:', adminRole.id);

        // Kiểm tra user admin đã tồn tại
        const adminUsername = process.env.ADMIN_USERNAME || 'admin';
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
        
        const existingAdmin = await db.findOne(
            'SELECT * FROM users WHERE username = ? OR email = ?', 
            [adminUsername, adminEmail]
        );
        
        if (existingAdmin) {
            console.log('⚠️  Admin user already exists:', existingAdmin.username);
            console.log('📧 Email:', existingAdmin.email);
            return;
        }

        // Tạo user admin
        console.log('👤 Creating admin user...');
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        
        const adminResult = await db.insert(
            'INSERT INTO users (username, email, password_hash, full_name, role_id, is_active, approval_status, approved_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
            [
                adminUsername,
                adminEmail,
                hashedPassword,
                'Administrator',
                adminRole.id,
                1,
                'approved'
            ]
        );

        console.log('✅ Admin user created successfully!');
        console.log('📋 Login details:');
        console.log('   Username:', adminUsername);
        console.log('   Email:', adminEmail);
        console.log('   Password:', adminPassword);
        console.log('   User ID:', adminResult.insertId);
        console.log('');
        console.log('🌐 Access: http://localhost:3000/auth/login');
        console.log('⚠️  Remember to change the default password after first login!');

    } catch (error) {
        console.error('❌ Error seeding admin:', error.message);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

// Chạy seed nếu file được thực thi trực tiếp
if (require.main === module) {
    seedAdmin();
}

module.exports = seedAdmin;