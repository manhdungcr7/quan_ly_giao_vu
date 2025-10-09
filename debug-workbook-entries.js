/**
 * Debug script - Kiểm tra workbook entries trong DB
 */

const db = require('./config/database');

async function checkWorkbookEntries() {
  try {
    console.log('🔍 Checking workbook entries in database...\n');
    
    // 1. Lấy tất cả workbooks của user admin (id = 1)
    const result = await db.query(`
      SELECT id, user_id, week_start, week_end, status, created_at
      FROM workbooks
      WHERE user_id = 1
      ORDER BY created_at DESC
      LIMIT 10
    `);
    
    const workbooks = Array.isArray(result[0]) ? result[0] : result;
    
    console.log('📋 Recent workbooks for user 1:');
    workbooks.forEach((wb, i) => {
      console.log(`${i + 1}. ID: ${wb.id}, Week: ${wb.week_start} to ${wb.week_end}, Status: ${wb.status}`);
    });
    
    if (workbooks.length === 0) {
      console.log('❌ No workbooks found for user 1');
      return;
    }
    
    // 2. Lấy entries của 3 workbook gần nhất
    for (let i = 0; i < Math.min(3, workbooks.length); i++) {
      const workbook = workbooks[i];
      console.log(`\n🔍 Workbook ${workbook.id} (${workbook.week_start} to ${workbook.week_end}):`);
      
      const entryResult = await db.query(`
        SELECT id, workbook_id, day_of_week, 
               LEFT(main_focus, 50) as main_focus_preview,
               LEFT(tasks, 100) as tasks_preview,
               progress
        FROM workbook_entries
        WHERE workbook_id = ?
        ORDER BY day_of_week
      `, [workbook.id]);
      
      const entries = Array.isArray(entryResult[0]) ? entryResult[0] : entryResult;
      
      if (entries.length === 0) {
        console.log('  ❌ No entries found');
      } else {
        console.log(`  ✅ Found ${entries.length} entries:`);
        entries.forEach(entry => {
          console.log(`    - Day ${entry.day_of_week}: ${entry.tasks_preview || '(no tasks)'}`);
        });
      }
    }
    
    // 3. Kiểm tra duplicate workbooks
    console.log('\n🔍 Checking for duplicate workbooks (same week):');
    const dupResult = await db.query(`
      SELECT week_start, week_end, COUNT(*) as count, GROUP_CONCAT(id) as ids
      FROM workbooks
      WHERE user_id = 1
      GROUP BY week_start, week_end
      HAVING count > 1
    `);
    
    const duplicates = Array.isArray(dupResult[0]) ? dupResult[0] : dupResult;
    
    if (duplicates.length > 0) {
      console.log('⚠️ Found duplicate workbooks:');
      duplicates.forEach(dup => {
        console.log(`  Week ${dup.week_start} to ${dup.week_end}: ${dup.count} workbooks (IDs: ${dup.ids})`);
      });
    } else {
      console.log('✅ No duplicate workbooks found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

checkWorkbookEntries();
