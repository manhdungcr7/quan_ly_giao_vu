/**
 * Check file_path values in database
 */

const db = require('./config/database');

async function checkFilePaths() {
    try {
        console.log('🔍 Checking file_path values in database...\n');
        
        const files = await db.query('SELECT id, filename, original_name, file_path FROM document_attachments LIMIT 5');
        
        if (files.length === 0) {
            console.log('❌ No files found in database');
            process.exit(0);
        }
        
        console.log(`Found ${files.length} file(s):\n`);
        
        files.forEach((file, index) => {
            console.log(`📄 File #${index + 1}:`);
            console.log(`   ID: ${file.id}`);
            console.log(`   Filename: ${file.filename}`);
            console.log(`   Original: ${file.original_name}`);
            console.log(`   Path: ${file.file_path}`);
            console.log(`   Is Absolute: ${require('path').isAbsolute(file.file_path)}`);
            console.log('');
        });
        
        // Check upload root
        const config = require('./config/app');
        const uploadRoot = require('path').resolve(config.upload.uploadPath);
        console.log(`📁 Upload Root: ${uploadRoot}\n`);
        
        // Test path resolution
        const path = require('path');
        const testFile = files[0];
        if (testFile) {
            console.log('🧪 Testing path resolution for first file:');
            const absPath = path.isAbsolute(testFile.file_path)
                ? path.resolve(testFile.file_path)
                : path.resolve(process.cwd(), testFile.file_path);
            
            console.log(`   Resolved: ${absPath}`);
            console.log(`   Starts with upload root: ${absPath.startsWith(uploadRoot)}`);
            console.log(`   File exists: ${require('fs').existsSync(absPath)}`);
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkFilePaths();
