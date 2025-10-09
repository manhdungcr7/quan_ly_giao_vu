const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function enhanceLegalDocuments() {
    let connection;
    
    try {
        console.log('🔄 Connecting to database...');
        
        // Create connection
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'quan_ly_giao_vu',
            multipleStatements: true
        });

        console.log('✅ Connected to database');

        // Read SQL file
        const sqlFile = path.join(__dirname, '../database/legal_documents_enhancements.sql');
        console.log('📖 Reading SQL file:', sqlFile);
        
        const sql = fs.readFileSync(sqlFile, 'utf8');

        // Execute SQL
        console.log('🔄 Executing enhancements...');
        await connection.query(sql);

        console.log('✅ Legal documents enhancements applied successfully!');
        console.log('\n📋 Changes applied:');
        console.log('  • Added signer_name and signer_position fields');
        console.log('  • Added version tracking for documents and files');
        console.log('  • Updated status enum to include "Dự thảo" and "Đã hủy"');
        console.log('  • Created audit_logs table for activity tracking');
        console.log('  • Added file version control with is_current flag');
        console.log('  • Added download_count for attachments');
        console.log('  • Created view v_legal_documents_full for easier queries');
        console.log('  • Enhanced fulltext search indexes');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n✅ Database connection closed');
        }
    }
}

// Run the enhancement
enhanceLegalDocuments();
