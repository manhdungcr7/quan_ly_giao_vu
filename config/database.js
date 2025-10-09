const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration (only valid mysql2 pool options)
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'quan_ly_giao_vu',
    charset: 'utf8mb4',
    timezone: '+07:00',
    waitForConnections: true,
    connectionLimit: parseInt(process.env.DB_POOL_LIMIT || '10', 10),
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Database helper class
class Database {
    constructor() {
        this.pool = pool;
    }

    // Execute query with parameters
    async query(sql, params = []) {
        try {
            const [results] = await this.pool.execute(sql, params);
            return results;
        } catch (error) {
            console.error('Database query error:', error);
            throw error;
        }
    }

    // Execute prepared statement
    async execute(sql, params = []) {
        try {
            const [results] = await this.pool.execute(sql, params);
            return results;
        } catch (error) {
            console.error('Database execute error:', error);
            throw error;
        }
    }

    // Get single record
    async findOne(sql, params = []) {
        try {
            const [results] = await this.pool.execute(sql, params);
            return results.length > 0 ? results[0] : null;
        } catch (error) {
            console.error('Database findOne error:', error);
            throw error;
        }
    }

    // Get multiple records
    async findMany(sql, params = []) {
        try {
            const [results] = await this.pool.execute(sql, params);
            return results;
        } catch (error) {
            console.error('Database findMany error:', error);
            throw error;
        }
    }

    // Insert record and return insertId
    async insert(sql, params = []) {
        try {
            const [result] = await this.pool.execute(sql, params);
            return {
                insertId: result.insertId,
                affectedRows: result.affectedRows
            };
        } catch (error) {
            console.error('Database insert error:', error);
            throw error;
        }
    }

    // Update records
    async update(sql, params = []) {
        try {
            const [result] = await this.pool.execute(sql, params);
            return {
                affectedRows: result.affectedRows,
                changedRows: result.changedRows
            };
        } catch (error) {
            console.error('Database update error:', error);
            throw error;
        }
    }

    // Delete records
    async delete(sql, params = []) {
        try {
            const [result] = await this.pool.execute(sql, params);
            return {
                affectedRows: result.affectedRows
            };
        } catch (error) {
            console.error('Database delete error:', error);
            throw error;
        }
    }

    // Begin transaction
    async beginTransaction() {
        const connection = await this.pool.getConnection();
        await connection.beginTransaction();
        return connection;
    }

    // Commit transaction
    async commit(connection) {
        await connection.commit();
        connection.release();
    }

    // Rollback transaction
    async rollback(connection) {
        await connection.rollback();
        connection.release();
    }

    // Test database connection
    async testConnection() {
        try {
            const connection = await this.pool.getConnection();
            await connection.ping();
            connection.release();
            console.log('✅ Database connected successfully');
            return true;
        } catch (error) {
            console.error('❌ Database connection failed:', error.message);
            return false;
        }
    }

    // Close all connections
    async close() {
        await this.pool.end();
        console.log('Database connections closed');
    }
}

// Create and export database instance
const db = new Database();

// Test connection on startup (non-blocking)
db.testConnection();

module.exports = db;