// Test Schedule API
const axios = require('axios');

const BASE_URL = 'http://localhost:3005/api/schedule';

async function testScheduleAPI() {
  console.log('🧪 Testing Schedule API...\n');

  try {
    // 1. Test get events
    console.log('1️⃣ GET /api/schedule/events');
    const eventsRes = await axios.get(`${BASE_URL}/events`, {
      params: {
        start: '2025-10-01',
        end: '2025-10-31'
      }
    });
    console.log(`✅ Found ${eventsRes.data.length} events`);
    console.log('   First event:', eventsRes.data[0]?.title);
    console.log('');

    // 2. Test get detail
    if (eventsRes.data.length > 0) {
      const eventId = eventsRes.data[0].id;
      console.log(`2️⃣ GET /api/schedule/${eventId}`);
      const detailRes = await axios.get(`${BASE_URL}/${eventId}`);
      console.log(`✅ Event: ${detailRes.data.title}`);
      console.log(`   Type: ${detailRes.data.event_type}`);
      console.log(`   Organizer: ${detailRes.data.organizer_name}`);
      console.log(`   Participants: ${detailRes.data.participants?.length || 0}`);
      console.log('');
    }

    // 3. Test create
    console.log('3️⃣ POST /api/schedule');
    const newEvent = {
      title: 'Test API Event',
      description: 'Created via API test',
      event_type: 'meeting',
      start_datetime: '2025-10-25T14:00:00',
      end_datetime: '2025-10-25T15:00:00',
      location: 'Test Room',
      organizer_id: 1,
      status: 'confirmed',
      priority: 'normal',
      color: '#3b82f6'
    };
    const createRes = await axios.post(BASE_URL, newEvent);
    console.log(`✅ Created: ID ${createRes.data.id}`);
    const newEventId = createRes.data.id;
    console.log('');

    // 4. Test update
    console.log(`4️⃣ PUT /api/schedule/${newEventId}`);
    const updateRes = await axios.put(`${BASE_URL}/${newEventId}`, {
      title: 'Updated Test Event',
      priority: 'high'
    });
    console.log(`✅ Updated successfully`);
    console.log('');

    // 5. Test conflicts
    console.log('5️⃣ GET /api/schedule/conflicts');
    const conflictsRes = await axios.get(`${BASE_URL}/conflicts`, {
      params: {
        user_id: 1,
        start_datetime: '2025-10-25T14:00:00',
        end_datetime: '2025-10-25T15:00:00',
        exclude_id: newEventId
      }
    });
    console.log(`✅ Has conflict: ${conflictsRes.data.hasConflict}`);
    console.log(`   Conflicts count: ${conflictsRes.data.conflicts.length}`);
    console.log('');

    // 6. Test delete
    console.log(`6️⃣ DELETE /api/schedule/${newEventId}`);
    const deleteRes = await axios.delete(`${BASE_URL}/${newEventId}`);
    console.log(`✅ Deleted successfully`);
    console.log('');

    console.log('✅ ALL TESTS PASSED!');
    console.log('');
    console.log('🌐 Open browser: http://localhost:3005/schedule');

  } catch (error) {
    console.error('❌ TEST FAILED:', error.response?.data || error.message);
    process.exit(1);
  }
}

testScheduleAPI();
