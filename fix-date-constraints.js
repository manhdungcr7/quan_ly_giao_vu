// Fix issue_date constraint - make date fields nullable
const db = require('./config/database');
require('dotenv').config();

async function fixDateConstraints() {
    try {
        console.log('🔧 Fixing date column constraints...');
        
        // First check current schema
        const columns = await db.findMany("SHOW COLUMNS FROM documents WHERE Field IN ('issue_date', 'received_date', 'processing_deadline')");
        console.log('📋 Current date columns:', columns.map(c => ({ field: c.Field, type: c.Type, null: c.Null })));
        
        // Make date columns nullable if they aren't already
        await db.query("ALTER TABLE documents MODIFY COLUMN issue_date DATE NULL");
        await db.query("ALTER TABLE documents MODIFY COLUMN received_date DATE NULL"); 
        await db.query("ALTER TABLE documents MODIFY COLUMN processing_deadline DATE NULL");
        
        console.log('✅ Date columns are now nullable');
        
        // Verify the changes
        const updatedColumns = await db.findMany("SHOW COLUMNS FROM documents WHERE Field IN ('issue_date', 'received_date', 'processing_deadline')");
        console.log('📋 Updated date columns:', updatedColumns.map(c => ({ field: c.Field, type: c.Type, null: c.Null })));
        
    } catch (error) {
        console.error('❌ Error fixing date constraints:', error);
    }
}

fixDateConstraints();