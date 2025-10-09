/**
 * Test workbook quick notes functionality
 * Tests: login -> get workbook ID -> save quick notes -> reload -> verify notes persist
 */
const http = require('http');

let sessionCookie = '';
let workbookId = null;

// Step 1: Login
function login() {
  return new Promise((resolve, reject) => {
    const postData = 'username=admin&password=Admin@123';
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    console.log('🔐 Step 1: Logging in...');
    
    const req = http.request(options, (res) => {
      const cookies = res.headers['set-cookie'];
      console.log('   Status:', res.statusCode);
      
      if (cookies && cookies.length > 0) {
        sessionCookie = cookies[0].split(';')[0];
        console.log('   ✅ Login successful! Session:', sessionCookie);
        resolve(sessionCookie);
      } else {
        reject(new Error('No session cookie received'));
      }
    });
    
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// Step 2: Get workbook page (extract workbook ID from HTML)
function getWorkbook() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/workbook',
      method: 'GET',
      headers: {
        'Cookie': sessionCookie
      }
    };
    
    console.log('\n📄 Step 2: Getting workbook page...');
    
    const req = http.request(options, (res) => {
      console.log('   Status:', res.statusCode);
      
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        // Extract workbook ID from HTML
        const match = data.match(/data-workbook-id="(\d+)"/);
        if (match) {
          workbookId = match[1];
          console.log('   ✅ Found workbook ID:', workbookId);
          resolve(workbookId);
        } else {
          reject(new Error('Could not find workbook ID'));
        }
      });
    });
    
    req.on('error', reject);
    req.end();
  });
}

// Step 3: Save quick notes
function saveQuickNotes(notes) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ notes: notes });
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: `/workbook/${workbookId}/notes`,
      method: 'PUT',
      headers: {
        'Cookie': sessionCookie,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    console.log('\n💾 Step 3: Saving quick notes...');
    console.log('   Notes:', notes.substring(0, 50) + '...');
    
    const req = http.request(options, (res) => {
      console.log('   Status:', res.statusCode);
      
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('   Response:', response);
          
          if (response.success) {
            console.log('   ✅ Quick notes saved successfully!');
            resolve(response);
          } else {
            reject(new Error(response.message || 'Failed to save notes'));
          }
        } catch (error) {
          reject(error);
        }
      });
    });
    
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// Step 4: Load quick notes (verify persistence)
function loadQuickNotes() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: `/workbook/${workbookId}/notes`,
      method: 'GET',
      headers: {
        'Cookie': sessionCookie
      }
    };
    
    console.log('\n📥 Step 4: Loading quick notes...');
    
    const req = http.request(options, (res) => {
      console.log('   Status:', res.statusCode);
      
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('   Response:', response);
          
          if (response.success) {
            console.log('   ✅ Quick notes loaded successfully!');
            console.log('   📝 Notes:', response.notes || '(empty)');
            resolve(response.notes);
          } else {
            reject(new Error(response.message || 'Failed to load notes'));
          }
        } catch (error) {
          reject(error);
        }
      });
    });
    
    req.on('error', reject);
    req.end();
  });
}

// Run test
(async () => {
  try {
    console.log('🧪 Testing workbook quick notes feature...\n');
    console.log('='.repeat(60));
    
    // Login
    await login();
    
    // Get workbook
    await getWorkbook();
    
    // Save notes
    const testNotes = `Test quick notes at ${new Date().toISOString()}
- Họp ban lãnh đạo sáng thứ 2
- Chuẩn bị tài liệu giảng dạy
- Viết báo cáo tuần`;
    
    await saveQuickNotes(testNotes);
    
    // Wait a bit
    console.log('\n⏳ Waiting 1 second...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Load notes (verify)
    const loadedNotes = await loadQuickNotes();
    
    // Verify
    console.log('\n' + '='.repeat(60));
    console.log('🎯 VERIFICATION:');
    
    if (loadedNotes === testNotes) {
      console.log('✅ SUCCESS! Quick notes are persisted to database.');
      console.log('✅ Data saved and loaded correctly.');
    } else {
      console.log('❌ MISMATCH! Loaded notes differ from saved notes.');
      console.log('   Expected:', testNotes);
      console.log('   Got:', loadedNotes);
    }
    
    console.log('\n✅ All tests completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error);
    process.exit(1);
  }
})();
