const db = require('../config/database');
const path = require('path');

const DATABASE_NAME = process.env.DB_NAME || 'quan_ly_giao_vu';

async function columnExists(columnName) {
  const rows = await db.query(
    `SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'workbooks' AND COLUMN_NAME = ? LIMIT 1`,
    [DATABASE_NAME, columnName]
  );
  return Array.isArray(rows) && rows.length > 0;
}

async function indexExists(indexName) {
  const rows = await db.query(
    `SELECT 1 FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'workbooks' AND INDEX_NAME = ? LIMIT 1`,
    [DATABASE_NAME, indexName]
  );
  return Array.isArray(rows) && rows.length > 0;
}

async function foreignKeyExists(constraintName) {
  const rows = await db.query(
    `SELECT 1 FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'workbooks' AND CONSTRAINT_NAME = ? AND CONSTRAINT_TYPE = 'FOREIGN KEY' LIMIT 1`,
    [DATABASE_NAME, constraintName]
  );
  return Array.isArray(rows) && rows.length > 0;
}

async function applyMigration() {
  const statements = [];

  const hasApproverId = await columnExists('approver_id');
  const hasRequestedAt = await columnExists('approval_requested_at');
  const hasDecisionAt = await columnExists('approval_decision_at');
  const hasNote = await columnExists('approval_note');

  if (!hasApproverId || !hasRequestedAt || !hasDecisionAt || !hasNote) {
    const clauses = [];
    if (!hasApproverId) {
      clauses.push('ADD COLUMN approver_id INT UNSIGNED NULL AFTER user_id');
    }
    if (!hasRequestedAt) {
      clauses.push('ADD COLUMN approval_requested_at DATETIME NULL AFTER status');
    }
    if (!hasDecisionAt) {
      clauses.push('ADD COLUMN approval_decision_at DATETIME NULL AFTER approval_requested_at');
    }
    if (!hasNote) {
      clauses.push('ADD COLUMN approval_note VARCHAR(255) NULL AFTER approval_decision_at');
    }

    if (clauses.length) {
      statements.push(`ALTER TABLE workbooks\n  ${clauses.join(',\n  ')};`);
    }
  }

  const fkName = 'fk_workbooks_approver';
  if (!(await foreignKeyExists(fkName))) {
    statements.push(`ALTER TABLE workbooks\n  ADD CONSTRAINT ${fkName}\n  FOREIGN KEY (approver_id) REFERENCES users(id)\n  ON DELETE SET NULL;`);
  }

  const indexName = 'idx_workbooks_approver';
  if (!(await indexExists(indexName))) {
    statements.push(`CREATE INDEX ${indexName} ON workbooks (approver_id);`);
  }

  if (!statements.length) {
    console.log('✅ Workbook approvals migration already applied. No changes needed.');
    return;
  }

  console.log('📄 Applying workbook approvals migration...');
  for (const statement of statements) {
    console.log('➡️  Executing:\n', statement);
    await db.query(statement);
  }
  console.log('✅ Migration completed successfully.');
}

applyMigration()
  .catch((error) => {
    console.error('❌ Migration failed:', error.message || error);
    process.exitCode = 1;
  })
  .finally(() => {
    if (db && typeof db.close === 'function') {
      db.close().catch(() => {
        // ignore errors during shutdown
      });
    }
  });
