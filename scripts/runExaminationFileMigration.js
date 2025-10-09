/**
 * Run Examination File Attachments Migration
 * Creates examination_files table and triggers
 */

const db = require('../config/database');
const fs = require('fs').promises;
const path = require('path');

async function runMigration() {
  console.log('🚀 Starting examination file attachments migration...\n');

  try {
    // Read SQL file
    const sqlFile = path.join(__dirname, '..', 'database', 'examination_file_attachments.sql');
    const sql = await fs.readFile(sqlFile, 'utf8');

    // Remove DELIMITER commands and split properly
    const cleanSql = sql
      .replace(/DELIMITER\s+\$\$/gi, '')
      .replace(/\$\$/g, ';')
      .replace(/DELIMITER\s+;/gi, '');

    // Split by semicolon and filter empty statements
    const statements = cleanSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Log what we're doing
      if (statement.includes('CREATE TABLE')) {
        const tableName = statement.match(/CREATE TABLE (?:IF NOT EXISTS )?`?(\w+)`?/i)?.[1];
        console.log(`✅ Creating table: ${tableName}`);
      } else if (statement.includes('ALTER TABLE')) {
        const tableName = statement.match(/ALTER TABLE `?(\w+)`?/i)?.[1];
        console.log(`✅ Altering table: ${tableName}`);
      } else if (statement.includes('CREATE TRIGGER')) {
        const triggerName = statement.match(/CREATE TRIGGER `?(\w+)`?/i)?.[1];
        console.log(`✅ Creating trigger: ${triggerName}`);
      } else if (statement.includes('CREATE INDEX')) {
        const indexName = statement.match(/CREATE INDEX `?(\w+)`?/i)?.[1];
        console.log(`✅ Creating index: ${indexName}`);
      } else {
        console.log(`✅ Executing statement ${i + 1}/${statements.length}`);
      }

      try {
        await db.query(statement);
      } catch (error) {
        // Check if error is "already exists" - that's OK
        if (error.message.includes('already exists') || 
            error.message.includes('Duplicate') ||
            error.code === 'ER_TABLE_EXISTS_ERROR' ||
            error.code === 'ER_DUP_FIELDNAME' ||
            error.code === 'ER_TRG_ALREADY_EXISTS') {
          console.log(`   ⚠️  Already exists (skipping)`);
        } else {
          throw error;
        }
      }
    }

    console.log('\n✨ Migration completed successfully!');
    console.log('📊 Database schema updated:\n');
    console.log('   ✓ examination_files table created');
    console.log('   ✓ file_count column added to examination_sessions');
    console.log('   ✓ Triggers for auto-update file_count created');
    console.log('   ✓ Indexes for performance optimization created');
    
    // Verify tables
    console.log('\n🔍 Verifying tables...');
    
    const tables = await db.query("SHOW TABLES LIKE 'examination_%'");
    console.log(`   Found ${tables.length} examination tables:`);
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`   - ${tableName}`);
    });

    // Check if file_count column exists
    const columns = await db.query("SHOW COLUMNS FROM examination_sessions LIKE 'file_count'");
    if (columns.length > 0) {
      console.log('   ✓ file_count column exists in examination_sessions');
    }

    // Check triggers
    const triggers = await db.query("SHOW TRIGGERS WHERE `Table` = 'examination_files'");
    console.log(`\n   Found ${triggers.length} triggers:`);
    triggers.forEach(trigger => {
      console.log(`   - ${trigger.Trigger} (${trigger.Event} ${trigger.Timing})`);
    });

    console.log('\n🎉 All done! You can now use file upload features.\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('   Full error:', error);
    process.exit(1);
  }
}

// Run migration
console.log('═══════════════════════════════════════════════════════');
console.log('   EXAMINATION FILE ATTACHMENTS MIGRATION');
console.log('═══════════════════════════════════════════════════════\n');

runMigration();
