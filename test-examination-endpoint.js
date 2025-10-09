/**
 * Test Examination Endpoint
 * Kiểm tra xem endpoint có hoạt động không
 */

const http = require('http');

function testExamination() {
  console.log('🧪 Testing examination endpoint...\n');
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/examination',
    method: 'GET',
    headers: {
      'Cookie': 'connect.sid=test' // Mock session
    }
  };
  
  const req = http.request(options, (res) => {
    console.log(`✅ Status Code: ${res.statusCode}`);
    console.log(`📋 Headers:`, res.headers);
    
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`\n📄 Response length: ${data.length} bytes`);
      
      if (res.statusCode === 200) {
        console.log('✅ SUCCESS: Page loaded successfully!');
        
        // Check if data contains expected content
        if (data.includes('Công tác khảo thí')) {
          console.log('✅ Page contains correct title');
        }
        
        if (data.includes('Chưa có ca thi nào') || data.includes('<tr>')) {
          console.log('✅ Page contains table or empty message');
        }
      } else if (res.statusCode === 302) {
        console.log('⚠️  REDIRECT: Need to login first');
        console.log('   Redirect to:', res.headers.location);
      } else if (res.statusCode === 500) {
        console.log('❌ ERROR 500: Server error');
        console.log('   Response preview:', data.substring(0, 200));
      } else {
        console.log(`⚠️  Unexpected status: ${res.statusCode}`);
      }
    });
  });
  
  req.on('error', (error) => {
    console.error('❌ Request failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Tip: Make sure server is running on port 3000');
      console.log('   Run: node server.js');
    }
  });
  
  req.end();
}

// Run test
console.log('🚀 Starting examination endpoint test...\n');
console.log('⏳ Waiting 2 seconds for server to be ready...');

setTimeout(() => {
  testExamination();
}, 2000);
