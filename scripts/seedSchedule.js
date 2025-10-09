require('dotenv').config();
const mysql = require('mysql2/promise');

async function seedData() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  console.log('🌱 Seeding Work Schedule Data...');

  try {
    // 1. Lấy user IDs
    const [users] = await connection.query('SELECT id FROM users LIMIT 5');
    if (users.length === 0) {
      throw new Error('No users found. Please seed users first.');
    }

    const userIds = users.map(u => u.id);
    const organizerId = userIds[0];
    const createdBy = userIds[0];

    // 2. Seed work_schedules
    const schedules = [
      {
        title: 'Họp khoa đầu tuần',
        description: 'Họp tổng kết công việc tuần trước và kế hoạch tuần tới',
        event_type: 'meeting',
        start_datetime: '2025-10-06 08:00:00',
        end_datetime: '2025-10-06 10:00:00',
        location: 'Phòng họp A',
        room: 'A101',
        building: 'Nhà A',
        organizer_id: organizerId,
        status: 'confirmed',
        priority: 'high',
        color: '#3b82f6',
        icon: 'fa-users',
        reminder_minutes: 30,
        created_by: createdBy
      },
      {
        title: 'Kiểm tra giữa kỳ - Toán cao cấp',
        description: 'Kiểm tra 45 phút - Chương 1, 2, 3',
        event_type: 'exam',
        start_datetime: '2025-10-08 13:30:00',
        end_datetime: '2025-10-08 15:00:00',
        location: 'Gi강 đường B',
        room: 'B201',
        building: 'Nhà B',
        organizer_id: organizerId,
        status: 'confirmed',
        priority: 'urgent',
        color: '#ef4444',
        icon: 'fa-file-alt',
        reminder_minutes: 60,
        created_by: createdBy
      },
      {
        title: 'Lễ khai giảng năm học mới',
        description: 'Lễ khai giảng và tổng kết năm học',
        event_type: 'ceremony',
        start_datetime: '2025-10-10 07:30:00',
        end_datetime: '2025-10-10 11:00:00',
        is_all_day: false,
        location: 'Hội trường lớn',
        room: 'Hội trường',
        building: 'Nhà C',
        organizer_id: organizerId,
        status: 'confirmed',
        priority: 'high',
        color: '#8b5cf6',
        icon: 'fa-flag',
        reminder_minutes: 120,
        tags: JSON.stringify(['quan-trọng', 'toàn-trường']),
        created_by: createdBy
      },
      {
        title: 'Đào tạo sử dụng phần mềm quản lý',
        description: 'Hướng dẫn sử dụng hệ thống quản lý giáo vụ mới',
        event_type: 'training',
        start_datetime: '2025-10-12 14:00:00',
        end_datetime: '2025-10-12 17:00:00',
        location: 'Phòng máy',
        room: 'PM01',
        building: 'Nhà D',
        online_meeting_url: 'https://meet.google.com/abc-defg-hij',
        organizer_id: organizerId,
        status: 'confirmed',
        priority: 'normal',
        color: '#10b981',
        icon: 'fa-laptop-code',
        reminder_minutes: 45,
        created_by: createdBy
      },
      {
        title: 'Họp Hội đồng khoa học',
        description: 'Xét duyệt đề tài nghiên cứu khoa học',
        event_type: 'admin',
        start_datetime: '2025-10-15 09:00:00',
        end_datetime: '2025-10-15 11:30:00',
        location: 'Phòng Hội đồng',
        room: 'A301',
        building: 'Nhà A',
        organizer_id: organizerId,
        status: 'confirmed',
        priority: 'normal',
        color: '#f59e0b',
        icon: 'fa-briefcase',
        reminder_minutes: 30,
        created_by: createdBy
      },
      {
        title: 'Dạy - Lập trình web',
        description: 'Buổi học JavaScript nâng cao',
        event_type: 'teaching',
        start_datetime: '2025-10-07 13:30:00',
        end_datetime: '2025-10-07 15:30:00',
        recurrence_rule: 'FREQ=WEEKLY;BYDAY=MO,WE,FR',
        recurrence_end_date: '2025-12-31',
        location: 'Phòng học',
        room: 'C102',
        building: 'Nhà C',
        organizer_id: organizerId,
        status: 'confirmed',
        priority: 'normal',
        color: '#06b6d4',
        icon: 'fa-chalkboard-teacher',
        reminder_minutes: 15,
        created_by: createdBy
      }
    ];

    console.log('📝 Inserting schedules...');
    const scheduleIds = [];
    for (const schedule of schedules) {
      const [result] = await connection.query(
        `INSERT INTO work_schedules SET ?`,
        schedule
      );
      scheduleIds.push(result.insertId);
      console.log(`  ✓ Created: ${schedule.title} (ID: ${result.insertId})`);
    }

    // 3. Seed schedule_participants
    console.log('👥 Adding participants...');
    for (const scheduleId of scheduleIds) {
      const participantCount = Math.min(3, userIds.length);
      for (let i = 0; i < participantCount; i++) {
        const userId = userIds[i];
        await connection.query(
          `INSERT INTO schedule_participants (schedule_id, user_id, role, status) 
           VALUES (?, ?, ?, ?)`,
          [scheduleId, userId, i === 0 ? 'organizer' : 'required', i === 0 ? 'accepted' : 'pending']
        );
      }
    }
    console.log(`  ✓ Added participants to ${scheduleIds.length} schedules`);

    // 4. Seed schedule_templates
    console.log('📋 Creating templates...');
    const templates = [
      {
        name: 'Họp khoa',
        description: 'Mẫu họp khoa định kỳ',
        template_data: JSON.stringify({
          event_type: 'meeting',
          duration_minutes: 120,
          location: 'Phòng họp A',
          reminder_minutes: 30,
          color: '#3b82f6'
        }),
        category: 'meeting',
        is_public: true,
        created_by: createdBy
      },
      {
        name: 'Kiểm tra giữa kỳ',
        description: 'Mẫu tổ chức kiểm tra',
        template_data: JSON.stringify({
          event_type: 'exam',
          duration_minutes: 90,
          reminder_minutes: 60,
          priority: 'high',
          color: '#ef4444'
        }),
        category: 'exam',
        is_public: true,
        created_by: createdBy
      }
    ];

    for (const template of templates) {
      await connection.query(`INSERT INTO schedule_templates SET ?`, template);
      console.log(`  ✓ Created template: ${template.name}`);
    }

    await connection.end();
    console.log('✅ Seed completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - ${schedules.length} schedules`);
    console.log(`   - ${scheduleIds.length * Math.min(3, userIds.length)} participants`);
    console.log(`   - ${templates.length} templates`);

  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    console.error(error);
    await connection.end();
    process.exit(1);
  }
}

seedData();
