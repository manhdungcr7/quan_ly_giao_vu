const db = require('./config/database');

(async () => {
  try {
    console.log('Checking assets table...');
    
    const tables = await db.query('SHOW TABLES LIKE "assets"');
    console.log('Tables found:', tables.length);
    
    if (tables.length > 0) {
      const desc = await db.query('DESCRIBE assets');
      console.log('\nAssets table structure:');
      console.table(desc);
      
      const count = await db.query('SELECT COUNT(*) as total FROM assets');
      console.log('\nTotal assets:', count[0].total);
      
      if (count[0].total > 0) {
        const sample = await db.query('SELECT * FROM assets LIMIT 3');
        console.log('\nSample data:');
        console.table(sample);
      }
    } else {
      console.log('❌ Assets table not found!');
      console.log('Please run the database migration to create the assets table.');
    }
    
    // Check asset_categories
    const catTables = await db.query('SHOW TABLES LIKE "asset_categories"');
    if (catTables.length > 0) {
      const catCount = await db.query('SELECT COUNT(*) as total FROM asset_categories');
      console.log('\nAsset categories:', catCount[0].total);
    } else {
      console.log('❌ asset_categories table not found!');
    }
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error(err);
  } finally {
    await db.close();
  }
})();
