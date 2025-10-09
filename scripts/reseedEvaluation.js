// Safe reseed script for evaluation criteria with proper UTF-8
// Usage (PowerShell):
//   node scripts/reseedEvaluation.js

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

(async () => {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const yes = args.includes('-y') || args.includes('--yes');

  if (!yes) {
    console.error('Safety check: This will TRUNCATE evaluation tables. Re-run with --yes to proceed. Optional: --dry-run to preview.');
    process.exit(2);
  }
  const sqlFile = path.join(__dirname, '..', 'database', 'staff_evaluation_system.sql');
  if (!fs.existsSync(sqlFile)) {
    console.error('❌ SQL file not found:', sqlFile);
    process.exit(1);
  }

  const cfg = {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'quan_ly_giao_vu',
    charset: 'utf8mb4',
    multipleStatements: true
  };

  let conn;
  try {
    console.log('🔌 Connecting to MySQL...', cfg.host, cfg.database);
    conn = await mysql.createConnection(cfg);

    // Force session to use utf8mb4
    await conn.query("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci");
    await conn.query("SET CHARACTER SET utf8mb4");
    await conn.query("SET collation_connection = 'utf8mb4_unicode_ci'");

    // Backup counts before reseed
    const [cnt1] = await conn.query("SELECT COUNT(*) AS n FROM evaluation_criteria").catch(() => [{ n: 0 }]);
    const [cnt2] = await conn.query("SELECT COUNT(*) AS n FROM evaluation_periods").catch(() => [{ n: 0 }]);
    console.log(`📦 Before: criteria=${cnt1?.[0]?.n ?? 0}, periods=${cnt2?.[0]?.n ?? 0}`);

    if (dryRun) {
      console.log('🧪 Dry-run mode: will not modify database. Listing first Vietnamese fields for inspection.');
      const [p] = await conn.query("SELECT id, name FROM evaluation_periods ORDER BY id LIMIT 3").catch(() => [ [] ]);
      const [c] = await conn.query("SELECT id, name, category FROM evaluation_criteria ORDER BY id LIMIT 5").catch(() => [ [] ]);
      console.table(p);
      console.table(c);
      return;
    }

    // Truncate (keep structures, remove data)
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');
    await conn.query('TRUNCATE TABLE evaluation_period_criteria').catch(()=>{});
    await conn.query('TRUNCATE TABLE staff_evaluations').catch(()=>{});
    await conn.query('TRUNCATE TABLE staff_evaluation_summary').catch(()=>{});
    await conn.query('TRUNCATE TABLE evaluation_periods').catch(()=>{});
    await conn.query('TRUNCATE TABLE evaluation_criteria').catch(()=>{});
    await conn.query('SET FOREIGN_KEY_CHECKS = 1');

    // Import entire file with multi-statement support
    const raw = fs.readFileSync(sqlFile, 'utf8');
    console.log('🧾 Executing SQL file (multi-statement)...');
    await conn.query(raw);

    const [after1] = await conn.query("SELECT COUNT(*) AS n FROM evaluation_criteria");
    const [after2] = await conn.query("SELECT COUNT(*) AS n FROM evaluation_periods");
    console.log(`✅ After: criteria=${after1[0].n}, periods=${after2[0].n}`);

    // Spot-check one Vietnamese string
    const [rows] = await conn.query("SELECT name FROM evaluation_periods ORDER BY id LIMIT 1");
    console.log('🔎 Sample period name:', rows?.[0]?.name);

    console.log('\n🎉 Reseed done. Please refresh the Evaluation Criteria page.');
  } catch (e) {
    console.error('❌ Error:', e.message);
    process.exitCode = 1;
  } finally {
    if (conn) await conn.end();
  }
})();
