const db = require('../config/database');

async function seedOrganizations() {
    console.log('🌱 Seeding organizations...');
    
    try {
        // Kiểm tra xem có dữ liệu chưa
        const existing = await db.findMany('SELECT COUNT(*) as count FROM organizations');
        if (existing[0].count > 0) {
            console.log('✅ Organizations already exist, skipping seed');
            return;
        }

        // Thêm các cơ quan mẫu
        const organizations = [
            { name: 'Trường Đại học Bách khoa Hà Nội', code: 'HUST', is_active: 1 },
            { name: 'Bộ Giáo dục và Đào tạo', code: 'MOET', is_active: 1 },
            { name: 'Viện Khoa học và Công nghệ Việt Nam', code: 'VAST', is_active: 1 },
            { name: 'Trường Đại học Quốc gia Hà Nội', code: 'VNU', is_active: 1 },
            { name: 'Trường Đại học Kinh tế Quốc dân', code: 'NEU', is_active: 1 },
            { name: 'Trường Đại học Y Hà Nội', code: 'HMU', is_active: 1 },
            { name: 'Phòng Đào tạo', code: 'EDUCATION', is_active: 1 },
            { name: 'Phòng Khoa học và Công nghệ', code: 'SCIENCE', is_active: 1 },
            { name: 'Phòng Tài chính Kế toán', code: 'FINANCE', is_active: 1 },
            { name: 'Ban Giám hiệu', code: 'ADMIN', is_active: 1 }
        ];

        for (const org of organizations) {
            await db.insert(
                'INSERT INTO organizations (name, code, is_active, created_at) VALUES (?, ?, ?, NOW())',
                [org.name, org.code, org.is_active]
            );
        }

        console.log(`✅ Successfully seeded ${organizations.length} organizations`);

        // Thêm các loại văn bản mẫu
        const docTypes = await db.findMany('SELECT COUNT(*) as count FROM document_types');
        if (docTypes[0].count === 0) {
            const types = [
                { name: 'Công văn', code: 'CV', is_active: 1 },
                { name: 'Quyết định', code: 'QD', is_active: 1 },
                { name: 'Thông báo', code: 'TB', is_active: 1 },
                { name: 'Hướng dẫn', code: 'HD', is_active: 1 },
                { name: 'Báo cáo', code: 'BC', is_active: 1 },
                { name: 'Kế hoạch', code: 'KH', is_active: 1 },
                { name: 'Đề án', code: 'DA', is_active: 1 },
                { name: 'Tờ trình', code: 'TT', is_active: 1 }
            ];

            for (const type of types) {
                await db.insert(
                    'INSERT INTO document_types (name, code, is_active, created_at) VALUES (?, ?, ?, NOW())',
                    [type.name, type.code, type.is_active]
                );
            }

            console.log(`✅ Successfully seeded ${types.length} document types`);
        }

        console.log('🎉 Seed completed successfully!');
        
    } catch (error) {
        console.error('❌ Error seeding organizations:', error);
        throw error;
    }
}

// Run if called directly
if (require.main === module) {
    seedOrganizations()
        .then(() => {
            console.log('Script completed');
            process.exit(0);
        })
        .catch(error => {
            console.error('Script failed:', error);
            process.exit(1);
        });
}

module.exports = seedOrganizations;