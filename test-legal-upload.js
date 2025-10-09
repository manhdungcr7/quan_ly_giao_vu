/**
 * Test Script for Legal Document Upload Feature
 * 
 * This script tests the file upload functionality for legal documents
 */

const path = require('path');
const fs = require('fs');

console.log('=== Testing Legal Document Upload Configuration ===\n');

// 1. Check config
console.log('1. Checking configuration...');
const config = require('./config/app');
console.log('Upload path:', config.upload.uploadPath);
console.log('Max file size:', config.upload.maxFileSize, 'bytes =', (config.upload.maxFileSize / 1024 / 1024).toFixed(2), 'MB');
console.log('Allowed MIME types:', config.upload.allowedTypes.length, 'types');
config.upload.allowedTypes.forEach(type => console.log('  -', type));

// 2. Check CONSTANTS
console.log('\n2. Checking CONSTANTS...');
const CONSTANTS = require('./config/constants');
console.log('Allowed file extensions:');
console.log('  Images:', CONSTANTS.ALLOWED_FILE_EXTENSIONS.IMAGES.join(', '));
console.log('  Documents:', CONSTANTS.ALLOWED_FILE_EXTENSIONS.DOCUMENTS.join(', '));
console.log('  Archives:', CONSTANTS.ALLOWED_FILE_EXTENSIONS.ARCHIVES.join(', '));

// 3. Check upload directory
console.log('\n3. Checking upload directories...');
const documentsPath = path.join(config.upload.uploadPath, 'documents');
console.log('Documents upload path:', documentsPath);
console.log('Directory exists:', fs.existsSync(documentsPath));

if (!fs.existsSync(documentsPath)) {
    console.log('Creating directory...');
    fs.mkdirSync(documentsPath, { recursive: true });
    console.log('Directory created successfully');
}

// Check permissions
try {
    const testFile = path.join(documentsPath, 'test_write_permission.txt');
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    console.log('Directory is writable: ✓');
} catch (error) {
    console.error('Directory is NOT writable: ✗');
    console.error('Error:', error.message);
}

// 4. Check middleware
console.log('\n4. Checking upload middleware...');
try {
    const uploadMiddleware = require('./app/middleware/upload');
    console.log('Upload middleware loaded: ✓');
    console.log('Available exports:', Object.keys(uploadMiddleware).join(', '));
} catch (error) {
    console.error('Upload middleware error: ✗');
    console.error('Error:', error.message);
}

// 5. Check routes
console.log('\n5. Checking routes configuration...');
const routesFile = fs.readFileSync('./app/routes/web.js', 'utf8');
const legalDocRoutes = routesFile.match(/legal-documents.*post/gi);
if (legalDocRoutes) {
    console.log('Legal document routes found:', legalDocRoutes.length);
    legalDocRoutes.forEach(route => console.log('  -', route));
} else {
    console.log('No legal document POST routes found');
}

// 6. Check database table
console.log('\n6. Checking database configuration...');
const db = require('./config/database');
db.query('SHOW TABLES LIKE "legal_document%"')
    .then(tables => {
        console.log('Legal document tables:');
        tables.forEach(table => {
            const tableName = Object.values(table)[0];
            console.log('  -', tableName);
        });

        // Check legal_document_attachments structure
        return db.query('DESCRIBE legal_document_attachments');
    })
    .then(columns => {
        console.log('\nlegal_document_attachments structure:');
        columns.forEach(col => {
            console.log(`  - ${col.Field} (${col.Type})`);
        });

        console.log('\n=== All checks completed ===');
        process.exit(0);
    })
    .catch(error => {
        console.error('Database check error:', error.message);
        process.exit(1);
    });
