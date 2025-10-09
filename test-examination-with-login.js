/**
 * Test Login và Examination Endpoint
 */
const http = require('http');

// Step 1: Login để lấy session cookie
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
      console.log('   Cookies:', cookies);
      
      if (cookies && cookies.length > 0) {
        const sessionCookie = cookies[0].split(';')[0];
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

// Step 2: Test examination endpoint với session
function testExamination(sessionCookie) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/examination',
      method: 'GET',
      headers: {
        'Cookie': sessionCookie
      }
    };
    
    console.log('\n🧪 Step 2: Testing /examination...');
    
    const req = http.request(options, (res) => {
      console.log('   Status:', res.statusCode);
      console.log('   Headers:', res.headers);
      
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        console.log('\n📄 Response preview (first 500 chars):');
        console.log(data.substring(0, 500));
        console.log('\n' + '='.repeat(60));
        
        if (res.statusCode === 200) {
          console.log('✅ SUCCESS! Examination page loaded');
          if (data.includes('Công tác khảo thí')) {
            console.log('✅ Page content verified!');
          }
        } else {
          console.log('❌ ERROR: Status', res.statusCode);
        }
        resolve();
      });
    });
    
    req.on('error', reject);
    req.end();
  });
}

// Run test
(async () => {
  try {
    const sessionCookie = await login();
    await testExamination(sessionCookie);
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
})();
