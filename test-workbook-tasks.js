/**
 * Test script để kiểm tra việc lưu công việc vào các thẻ ngày
 * Mô phỏng user nhập công việc vào Thứ 2, Thứ 3, etc.
 */

const http = require('http');

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };
    
    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          ok: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          headers: res.headers,
          text: () => Promise.resolve(data),
          json: () => Promise.resolve(JSON.parse(data))
        });
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

const BASE_URL = 'http://localhost:3002';
const testUser = { username: 'admin', password: 'admin123' };

let sessionCookie = '';

async function login() {
  console.log('🔐 Đăng nhập...');
  const response = await makeRequest(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `username=${testUser.username}&password=${testUser.password}`
  });

  const setCookie = response.headers['set-cookie'];
  if (setCookie) {
    sessionCookie = Array.isArray(setCookie) ? setCookie[0].split(';')[0] : setCookie.split(';')[0];
    console.log('✅ Đăng nhập thành công');
    return true;
  }
  
  console.error('❌ Đăng nhập thất bại');
  return false;
}

async function getWorkbookId() {
  console.log('📋 Lấy workbook ID...');
  const response = await makeRequest(`${BASE_URL}/workbook`, {
    headers: { Cookie: sessionCookie }
  });
  
  const html = await response.text();
  const match = html.match(/data-workbook-id="(\d+)"/);
  
  if (match && match[1]) {
    const workbookId = match[1];
    console.log('✅ Workbook ID:', workbookId);
    return workbookId;
  }
  
  console.error('❌ Không tìm thấy workbook ID');
  return null;
}

async function addTaskToDay(workbookId, day, tasks) {
  console.log(`\n📝 Thêm ${tasks.length} công việc vào ngày ${day}...`);
  
  // Lấy entry hiện tại (nếu có)
  const getResponse = await makeRequest(
    `${BASE_URL}/workbook/entry?workbook_id=${workbookId}&day_of_week=${day}`,
    { headers: { Cookie: sessionCookie } }
  );
  
  let existingEntry = { main_focus: '', tasks: [], notes: '', progress: 0 };
  if (getResponse.ok) {
    const data = await getResponse.json();
    if (data.success && data.entry) {
      existingEntry = data.entry;
      if (typeof existingEntry.tasks === 'string') {
        try {
          existingEntry.tasks = JSON.parse(existingEntry.tasks);
        } catch {
          existingEntry.tasks = [];
        }
      }
    }
  }
  
  console.log('📊 Entry hiện tại:', {
    tasksCount: existingEntry.tasks.length,
    progress: existingEntry.progress
  });
  
  // Thêm tasks mới
  const allTasks = [...existingEntry.tasks, ...tasks];
  
  // Lưu vào DB
  const saveResponse = await makeRequest(`${BASE_URL}/workbook/entry`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: sessionCookie
    },
    body: JSON.stringify({
      workbook_id: workbookId,
      day_of_week: day,
      main_focus: existingEntry.main_focus || `Công việc ngày ${day}`,
      tasks: JSON.stringify(allTasks),
      notes: existingEntry.notes || '',
      progress: Math.min(allTasks.length * 10, 100) // Tự động tính progress
    })
  });
  
  const result = await saveResponse.json();
  
  console.log('📤 Response:', {
    status: saveResponse.status,
    success: result.success,
    message: result.message
  });
  
  if (result.success) {
    console.log('✅ Đã lưu thành công!');
    return true;
  } else {
    console.error('❌ Lỗi:', result.message);
    return false;
  }
}

async function verifyTasks(workbookId, day, expectedTasks) {
  console.log(`\n🔍 Kiểm tra công việc ngày ${day}...`);
  
  const response = await makeRequest(
    `${BASE_URL}/workbook/entry?workbook_id=${workbookId}&day_of_week=${day}`,
    { headers: { Cookie: sessionCookie } }
  );
  
  if (!response.ok) {
    console.error('❌ Không thể lấy dữ liệu');
    return false;
  }
  
  const data = await response.json();
  if (!data.success || !data.entry) {
    console.error('❌ Entry không tồn tại');
    return false;
  }
  
  let tasks = [];
  if (typeof data.entry.tasks === 'string') {
    try {
      tasks = JSON.parse(data.entry.tasks);
    } catch {
      tasks = [];
    }
  } else if (Array.isArray(data.entry.tasks)) {
    tasks = data.entry.tasks;
  }
  
  console.log('📊 Dữ liệu từ DB:', {
    tasksCount: tasks.length,
    tasks: tasks.map(t => typeof t === 'object' ? t.text : t).slice(0, 5),
    progress: data.entry.progress
  });
  
  // Kiểm tra số lượng tasks
  if (tasks.length >= expectedTasks.length) {
    console.log('✅ Số lượng tasks đúng!');
    return true;
  } else {
    console.error(`❌ Số lượng tasks không khớp: có ${tasks.length}, mong đợi ${expectedTasks.length}`);
    return false;
  }
}

async function runTest() {
  console.log('🚀 Bắt đầu test lưu công việc vào thẻ ngày...\n');
  
  try {
    // 1. Đăng nhập
    const loginSuccess = await login();
    if (!loginSuccess) {
      throw new Error('Login failed');
    }
    
    // 2. Lấy workbook ID
    const workbookId = await getWorkbookId();
    if (!workbookId) {
      throw new Error('Cannot get workbook ID');
    }
    
    // 3. Test thêm công việc vào Thứ 2
    const day2Tasks = [
      { text: 'zzzzzzzzzzzzz', completed: false, priority: 'medium' },
      { text: 'aaaaaaaaaaaaa', completed: false, priority: 'medium' }
    ];
    
    const saveSuccess = await addTaskToDay(workbookId, 2, day2Tasks);
    if (!saveSuccess) {
      throw new Error('Failed to save tasks');
    }
    
    // 4. Đợi một chút để DB cập nhật
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 5. Kiểm tra dữ liệu đã được lưu
    const verifySuccess = await verifyTasks(workbookId, 2, day2Tasks);
    
    if (verifySuccess) {
      console.log('\n✅✅✅ TEST THÀNH CÔNG! ✅✅✅');
      console.log('Công việc đã được lưu vào DB và có thể reload lại!');
    } else {
      console.log('\n❌❌❌ TEST THẤT BẠI! ❌❌❌');
      console.log('Dữ liệu không được lưu đúng vào DB');
    }
    
  } catch (error) {
    console.error('\n💥 Lỗi:', error.message);
    console.error(error.stack);
  }
}

// Chạy test
runTest().then(() => {
  console.log('\n🏁 Test hoàn tất');
  process.exit(0);
}).catch(err => {
  console.error('💥 Uncaught error:', err);
  process.exit(1);
});
