/**
 * Manual test for legal document upload
 * Run this while server is running to test upload functionality
 */

console.log('📝 Manual Upload Test Guide');
console.log('=========================\n');

console.log('1. Start the server:');
console.log('   npm start  (or)  node server.js\n');

console.log('2. Open browser and go to:');
console.log('   http://localhost:3000/login  (or port shown in console)\n');

console.log('3. Login with admin credentials:');
console.log('   Username: admin');
console.log('   Password: admin123  (check database for actual password)\n');

console.log('4. Navigate to Legal Documents:');
console.log('   Click "Văn bản pháp lý" in sidebar\n');

console.log('5. Create new document:');
console.log('   Click "Thêm văn bản mới" button\n');

console.log('6. Fill required fields:');
console.log('   - Số hiệu văn bản: TEST-001');
console.log('   - Tiêu đề: Test Upload Document');
console.log('   - Loại văn bản: Select any option');
console.log('   - Cơ quan ban hành: Test Department\n');

console.log('7. Select files to upload:');
console.log('   - Click "Chọn file" button');
console.log('   - Choose PDF, Word, or ZIP files');
console.log('   - Max 10MB per file\n');

console.log('8. Check file preview:');
console.log('   - Files should appear below the file input');
console.log('   - Should show file name, size, and icon');
console.log('   - Red text indicates file too large\n');

console.log('9. Submit form:');
console.log('   - Click "Lưu văn bản" button');
console.log('   - Should redirect to document detail page');
console.log('   - Check server console for debug logs\n');

console.log('🛠️  Troubleshooting:');
console.log('- Open F12 Developer Tools to check for JavaScript errors');
console.log('- Check server console for detailed logs');
console.log('- Verify upload directory exists: public/uploads/documents');
console.log('- Check database table: legal_documents & legal_document_attachments\n');

console.log('📋 Quick checks:');

// Check upload directory
const fs = require('fs');
const path = require('path');

const uploadDir = path.join(__dirname, 'public', 'uploads', 'documents');
console.log(`Upload directory: ${uploadDir}`);
console.log(`Directory exists: ${fs.existsSync(uploadDir) ? '✅' : '❌'}`);

if (!fs.existsSync(uploadDir)) {
    console.log('Creating upload directory...');
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`Created: ${fs.existsSync(uploadDir) ? '✅' : '❌'}`);
}

// Check config
const config = require('./config/app');
console.log(`Max file size: ${(config.upload.maxFileSize / 1024 / 1024).toFixed(2)} MB`);
console.log(`Upload path: ${config.upload.uploadPath}`);

console.log('\n🚀 Ready to test!');