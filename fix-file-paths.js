/**
 * Fix file_path in database - Remove leading slash from Unix-style paths
 * Run: node fix-file-paths.js
 */

const db = require('./config/database');

async function fixFilePaths() {
    try {
        console.log('🔧 Fixing file_path values in database...\n');
        
        // Get all files with leading slash
        const files = await db.query("SELECT id, file_path FROM document_attachments WHERE file_path LIKE '/%'");
        
        if (files.length === 0) {
            console.log('✅ No files need fixing. All paths are correct!');
            process.exit(0);
        }
        
        console.log(`Found ${files.length} file(s) with leading slash:\n`);
        
        let fixed = 0;
        for (const file of files) {
            const oldPath = file.file_path;
            const newPath = oldPath.substring(1); // Remove leading /
            
            console.log(`📝 Fixing file ID ${file.id}:`);
            console.log(`   Old: ${oldPath}`);
            console.log(`   New: ${newPath}`);
            
            await db.query('UPDATE document_attachments SET file_path = ? WHERE id = ?', [newPath, file.id]);
            fixed++;
        }
        
        console.log(`\n✅ Fixed ${fixed} file path(s)!`);
        console.log('✅ All files should now work correctly.\n');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

fixFilePaths();
