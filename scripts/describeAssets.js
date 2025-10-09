/**
 * Lightweight helper to inspect the current `assets` table shape.
 * Run with: `node scripts/describeAssets.js`
 */
const db = require('../config/database');

async function describeAssets() {
  const rows = await db.query('DESCRIBE assets');
  console.table(rows.map(({ Field, Type, Null, Key, Default }) => ({ Field, Type, Null, Key, Default })));
}

if (require.main === module) {
  describeAssets()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('DESCRIBE assets failed:', error);
      process.exit(1);
    });
} else {
  module.exports = describeAssets;
}
