// Quick test to verify asset layout fixes
// Run: node test-asset-layout.js

const http = require('http');

const testUrl = 'http://localhost:3000/assets';

console.log('🧪 Testing asset layout fixes...\n');
console.log(`📍 URL: ${testUrl}`);
console.log('🔄 Fetching page...\n');

http.get(testUrl, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        console.log('✅ Page loaded successfully');
        console.log(`📊 Status Code: ${res.statusCode}`);
        console.log(`📦 Content Length: ${data.length} bytes\n`);
        
        // Check if new CSS version is present
        if (data.includes('assets-management.css?v=20241006_v2')) {
            console.log('✅ New CSS version detected (v=20241006_v2)');
        } else if (data.includes('assets-management.css?v=20241005')) {
            console.log('⚠️  Old CSS version still present (v=20241005)');
            console.log('   Please hard refresh the browser (Ctrl+Shift+R)');
        } else {
            console.log('❌ CSS link not found in page');
        }
        
        // Check for asset page structure
        if (data.includes('asset-page')) {
            console.log('✅ Asset page container found');
        }
        
        if (data.includes('asset-main-layout')) {
            console.log('✅ Main layout structure found');
        }
        
        if (data.includes('asset-hero-metrics')) {
            console.log('✅ Hero metrics section found');
        }
        
        console.log('\n📝 Next steps:');
        console.log('   1. Open browser and navigate to: http://localhost:3000/assets');
        console.log('   2. Press Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac) to hard refresh');
        console.log('   3. Open DevTools (F12) and check:');
        console.log('      - .asset-page should NOT have max-width: 1340px');
        console.log('      - .asset-main-layout should have grid-template-columns: 1fr 380px');
        console.log('   4. Verify layout is now using full width with balanced columns');
    });
}).on('error', (err) => {
    console.error('❌ Error fetching page:', err.message);
    console.log('\n💡 Make sure the server is running on port 3000');
    console.log('   Try: npm start or node server.js');
});
