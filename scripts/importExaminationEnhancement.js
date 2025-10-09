/**
 * Import Examination Enhancement Schema
 * Chạy script này để thêm các cột mới: grader_id, grading_deadline, reminder_sent
 */

require('dotenv').config();
const db = require('../config/database');
const fs = require('fs');
const path = require('path');

async function importEnhancementSchema() {
    console.log('📦 Importing examination enhancement schema...\n');
    
    try {
        // Đọc file SQL
        const sqlFile = path.join(__dirname, '../database/examination_enhancement.sql');
        let sql = fs.readFileSync(sqlFile, 'utf8');
        
        // Loại bỏ comments
        sql = sql.replace(/--.*$/gm, ''); // Single line comments
        sql = sql.replace(/\/\*[\s\S]*?\*\//g, ''); // Multi-line comments
        
        // Tách các câu lệnh SQL (split by semicolon, nhưng giữ lại cho delimiter trong CREATE VIEW)
        const statements = sql
            .split(/;(?=\s*(?:ALTER|CREATE|INSERT|UPDATE|DELETE|DROP)\s)/i)
            .map(s => s.trim())
            .filter(s => s.length > 0);
        
        console.log(`📋 Found ${statements.length} SQL statements\n`);
        
        // Thực thi từng câu lệnh
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            
            try {
                // Skip comments
                if (statement.startsWith('--') || statement.startsWith('/*')) {
                    continue;
                }
                
                console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
                
                await db.query(statement);
                
                console.log(`✅ Statement ${i + 1} executed successfully\n`);
            } catch (error) {
                // Bỏ qua lỗi cột đã tồn tại
                if (error.code === 'ER_DUP_FIELDNAME') {
                    console.log(`⚠️  Column already exists, skipping...\n`);
                    continue;
                }
                
                // Bỏ qua lỗi view đã tồn tại
                if (error.code === 'ER_TABLE_EXISTS_ERROR') {
                    console.log(`⚠️  View/Table already exists, skipping...\n`);
                    continue;
                }
                
                console.error(`❌ Error in statement ${i + 1}:`, error.message);
                console.error('Statement:', statement.substring(0, 200) + '...\n');
                // Tiếp tục với statement tiếp theo
            }
        }
        
        console.log('✅ Enhancement schema imported successfully!\n');
        console.log('📊 New columns added:');
        console.log('   - grader_id (INT): ID cán bộ chấm thi');
        console.log('   - grading_deadline (DATE): Hạn chấm bài');
        console.log('   - reminder_sent (BOOLEAN): Đã gửi nhắc việc');
        console.log('   - reminder_sent_at (TIMESTAMP): Thời gian gửi nhắc');
        console.log('\n📊 New table created:');
        console.log('   - examination_reminders: Lịch sử nhắc việc');
        console.log('\n📊 New view created:');
        console.log('   - v_examination_sessions_with_grader: Ca thi kèm thông tin chấm');
        
    } catch (error) {
        console.error('❌ Error importing schema:', error.message);
        process.exit(1);
    } finally {
        await db.close();
        process.exit(0);
    }
}

// Run import
importEnhancementSchema();
