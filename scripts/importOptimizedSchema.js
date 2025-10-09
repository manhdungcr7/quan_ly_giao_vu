/**
 * Script: importOptimizedSchema.js
 * Purpose: Import the optimized normalized schema (database/schema_optimized.sql)
 * Usage:
 *   node scripts/importOptimizedSchema.js              # normal import (runs the whole file)
 *   FORCE=1 node scripts/importOptimizedSchema.js      # force (drop + recreate) – schema script already does this
 *
 * Notes:
 *  - The schema file already contains DROP/CREATE DATABASE and USE statements.
 *  - We stream & split on SQL delimiters ; and handle DELIMITER $$ blocks for procedures/triggers.
 *  - Requires MySQL user with privileges to create database, triggers, procedures.
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// The optimized schema sits one level above (../database/) in current workspace structure
const SCHEMA_FILE = path.resolve(__dirname, '..', '..', 'database', 'schema_optimized.sql');

async function loadFile() {
	if (!fs.existsSync(SCHEMA_FILE)) {
		throw new Error(`Schema file not found: ${SCHEMA_FILE}`);
	}
	return fs.readFileSync(SCHEMA_FILE, 'utf8');
}

function splitStatements(sql) {
	// We need to treat DELIMITER changes. We'll parse manually.
	const statements = [];
	let current = [];
	let delimiter = ';';
	const lines = sql.split(/\r?\n/);
	for (let rawLine of lines) {
		const line = rawLine.trimEnd();
		// Skip comments (keep DELIMITER lines)
		if (/^--/.test(line)) {
			continue;
		}
		if (/^DELIMITER\s+\$\$/.test(line)) {
			// flush any pending statement (unlikely mid delimiter change)
			if (current.length) {
				const stmt = current.join('\n').trim();
				if (stmt) statements.push(stmt);
				current = [];
			}
			delimiter = '$$';
			continue;
		}
		if (/^DELIMITER\s+;/.test(line)) {
			if (current.length) {
				const stmt = current.join('\n').trim();
				if (stmt) statements.push(stmt);
				current = [];
			}
			delimiter = ';';
			continue;
		}
		current.push(rawLine); // keep original spacing for procedure bodies
		if (line.endsWith(delimiter)) {
			let stmt = current.join('\n');
			// remove trailing delimiter
			stmt = stmt.slice(0, -delimiter.length).trim();
			if (stmt) statements.push(stmt);
			current = [];
		}
	}
	// any trailing
	const last = current.join('\n').trim();
	if (last) statements.push(last);
	return statements;
}

async function run() {
	console.log('📥 Importing optimized schema...');
	console.log('   File:', SCHEMA_FILE);
	const sql = await loadFile();
	const statements = splitStatements(sql);
	console.log(`🔍 Parsed ${statements.length} executable statements.`);

	const connection = await mysql.createConnection({
		host: process.env.DB_HOST || 'localhost',
		port: process.env.DB_PORT || 3306,
		user: process.env.DB_USER || 'root',
		password: process.env.DB_PASSWORD || '',
		multipleStatements: true, // safety: we still execute individually
		charset: 'utf8mb4'
	});

	let success = 0;
	for (const [i, stmt] of statements.entries()) {
		try {
			// Skip empty or SHOW statements at end (optional) but we allow them
			await connection.query(stmt);
			success++;
			if (i % 25 === 0) {
				console.log(`   ✅ Executed ${success}/${statements.length} ...`);
			}
		} catch (err) {
			console.error('\n❌ Error at statement', i + 1);
			console.error(stmt.substring(0, 400) + (stmt.length > 400 ? ' ...' : ''));
			console.error('Message:', err.message);
			await connection.end();
			process.exit(1);
		}
	}

	await connection.end();
	console.log(`✅ Schema import completed successfully. (${success} statements)`);
	console.log('ℹ️  Now you can run:  npm run seed:admin');
}

run().catch(err => {
	console.error('Fatal import error:', err.message);
	process.exit(1);
});

