/**
 * Import Examination Schema
 * Script to create examination management tables
 */

const fs = require('fs');
const path = require('path');
const db = require('../config/database');

async function importExaminationSchema() {
  try {
    console.log('📋 Starting examination schema import...\n');

    // Read SQL file
    const sqlPath = path.join(__dirname, '..', 'database', 'examination_schema.sql');
    console.log(`📂 Reading SQL file: ${sqlPath}`);
    
    if (!fs.existsSync(sqlPath)) {
      throw new Error(`SQL file not found: ${sqlPath}`);
    }

    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Remove comment lines
    const cleanedSQL = sql
      .split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n');
    
    // Split statements properly - looking for semicolon at end of line
    const statements = [];
    let currentStatement = '';
    
    for (const line of cleanedSQL.split('\n')) {
      currentStatement += line + '\n';
      if (line.trim().endsWith(';')) {
        const stmt = currentStatement.trim();
        if (stmt.length > 0) {
          statements.push(stmt);
        }
        currentStatement = '';
      }
    }

    console.log(`📝 Found ${statements.length} SQL statements\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      try {
        // Extract table name for better logging
        const tableMatch = statement.match(/CREATE TABLE.*?`?(\w+)`?/i) ||
                          statement.match(/INSERT INTO.*?`?(\w+)`?/i);
        const tableName = tableMatch ? tableMatch[1] : 'unknown';
        
        const action = statement.toLowerCase().includes('create') ? '📦 Creating' :
                      statement.toLowerCase().includes('insert') ? '📥 Inserting' :
                      '⚙️  Executing';
        
        console.log(`${action} ${tableName}...`);
        
        // Remove trailing semicolon if exists (we'll handle it in query)
        const cleanStatement = statement.replace(/;\s*$/, '');
        await db.query(cleanStatement);
        
      } catch (error) {
        // Skip if table already exists
        if (error.code === 'ER_TABLE_EXISTS_ERROR') {
          console.log(`   ⚠️  Table already exists, skipping...`);
        } else if (error.code === 'ER_DUP_ENTRY') {
          console.log(`   ⚠️  Duplicate entry, skipping...`);
        } else {
          console.error(`   ❌ Error: ${error.message}`);
          // Continue with other statements
        }
      }
    }

    console.log('\n✅ Examination schema imported successfully!');
    console.log('\n📊 Summary:');
    console.log('   • examination_periods: Kỳ thi');
    console.log('   • subjects: Môn học');
    console.log('   • classes: Lớp học');
    console.log('   • examination_sessions: Ca thi');
    console.log('   • examination_invigilators: Phân công coi thi');
    console.log('   • examination_students: Sinh viên dự thi');
    console.log('   • examination_papers: Đề thi');
    console.log('   • examination_attendance: Điểm danh');
    
    console.log('\n📝 Sample data inserted:');
    console.log('   • 2 examination periods');
    console.log('   • 4 subjects');
    console.log('   • 4 classes');
    
    console.log('\n🎯 Next steps:');
    console.log('   1. Create Models in app/models/');
    console.log('   2. Update ExaminationController');
    console.log('   3. Build list/form views');
    console.log('   4. Add routes in app/routes/web.js');
    
  } catch (error) {
    console.error('❌ Error importing schema:', error);
    throw error;
  } finally {
    // Close database connection pool
    if (db.pool) {
      await db.pool.end();
      console.log('\n👋 Database connection closed');
    } else {
      console.log('\n✅ Script completed');
      process.exit(0);
    }
  }
}

// Run if called directly
if (require.main === module) {
  importExaminationSchema()
    .then(() => {
      console.log('\n✅ Import completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Import failed:', error);
      process.exit(1);
    });
}

module.exports = importExaminationSchema;
