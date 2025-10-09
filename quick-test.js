/**
 * Simple test to check legal document upload functionality
 */

console.log('=== Testing Legal Document Upload ===\n');

// Test 1: Check if server is running
console.log('1. Checking server status...');

const testURL = async (url) => {
    try {
        const https = require('https');
        const http = require('http');
        
        const client = url.startsWith('https') ? https : http;
        
        return new Promise((resolve, reject) => {
            const req = client.get(url, (res) => {
                console.log(`   ${url}: Status ${res.statusCode}`);
                resolve(res.statusCode);
            });
            
            req.on('error', (err) => {
                console.log(`   ${url}: Error - ${err.message}`);
                reject(err);
            });
            
            req.setTimeout(5000, () => {
                req.destroy();
                reject(new Error('Timeout'));
            });
        });
    } catch (error) {
        console.log(`   ${url}: Failed - ${error.message}`);
        return false;
    }
};

const runTests = async () => {
    // Test server ports
    const ports = [3000, 3001, 3002];
    let serverURL = null;
    
    for (const port of ports) {
        try {
            const status = await testURL(`http://localhost:${port}/health`);
            if (status === 200) {
                serverURL = `http://localhost:${port}`;
                console.log(`   ✅ Server running at: ${serverURL}`);
                break;
            }
        } catch (error) {
            console.log(`   ❌ Port ${port} not available`);
        }
    }
    
    if (!serverURL) {
        console.log('\n❌ No server found. Please start the server first.');
        return;
    }
    
    // Test 2: Check upload directory
    console.log('\n2. Checking upload directory...');
    const fs = require('fs');
    const path = require('path');
    
    const uploadDir = path.join(__dirname, 'public', 'uploads', 'documents');
    console.log(`   Upload directory: ${uploadDir}`);
    console.log(`   Directory exists: ${fs.existsSync(uploadDir) ? '✅' : '❌'}`);
    
    if (!fs.existsSync(uploadDir)) {
        console.log('   Creating upload directory...');
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log(`   Directory created: ${fs.existsSync(uploadDir) ? '✅' : '❌'}`);
    }
    
    // Test 3: Check write permissions
    console.log('\n3. Testing write permissions...');
    try {
        const testFile = path.join(uploadDir, 'test_write.tmp');
        fs.writeFileSync(testFile, 'test');
        fs.unlinkSync(testFile);
        console.log('   Write permission: ✅');
    } catch (error) {
        console.log('   Write permission: ❌', error.message);
    }
    
    // Test 4: Check database connection
    console.log('\n4. Testing database connection...');
    try {
        const db = require('./config/database');
        const result = await db.query('SELECT 1 as test');
        console.log('   Database connection: ✅');
        console.log('   Query result:', result[0]);
    } catch (error) {
        console.log('   Database connection: ❌', error.message);
    }
    
    // Test 5: Check legal_documents table
    console.log('\n5. Checking database tables...');
    try {
        const db = require('./config/database');
        const tables = await db.query("SHOW TABLES LIKE 'legal%'");
        console.log('   Legal document tables found:', tables.length);
        tables.forEach(table => {
            const tableName = Object.values(table)[0];
            console.log(`   - ${tableName}`);
        });
    } catch (error) {
        console.log('   Table check: ❌', error.message);
    }
    
    // Test 6: Check routes
    console.log('\n6. Testing routes...');
    try {
        // Test legal-documents route (should redirect to login if not authenticated)
        const status = await testURL(`${serverURL}/legal-documents`);
        console.log(`   /legal-documents: ${status === 302 ? '✅ (redirects to login)' : status === 200 ? '✅ (accessible)' : '❌'}`);
    } catch (error) {
        console.log('   Route test: ❌', error.message);
    }
    
    console.log('\n=== Test Summary ===');
    console.log(`Server: ${serverURL ? '✅ Running' : '❌ Not running'}`);
    console.log(`Upload Directory: ${fs.existsSync(uploadDir) ? '✅ Available' : '❌ Missing'}`);
    
    if (serverURL) {
        console.log(`\n🔗 Next steps:`);
        console.log(`1. Open browser: ${serverURL}/login`);
        console.log(`2. Login with admin credentials`);
        console.log(`3. Go to: ${serverURL}/legal-documents/create`);
        console.log(`4. Test file upload functionality`);
        console.log(`\n📝 Admin credentials (check .env or database):`);
        console.log(`   Username: admin`);
        console.log(`   Password: admin123 (or as configured)`);
    }
};

runTests().catch(console.error);