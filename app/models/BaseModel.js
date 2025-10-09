const db = require('../../config/database');

// Base Model class với các phương thức CRUD cơ bản
class BaseModel {
    constructor(tableName) {
        this.tableName = tableName;
        this.db = db;
    }

    // Lấy tất cả bản ghi
    async findAll(options = {}) {
        try {
            let sql = `SELECT * FROM ${this.tableName}`;
            const params = [];

            // WHERE conditions
            if (options.where) {
                const conditions = [];
                for (const [key, value] of Object.entries(options.where)) {
                    conditions.push(`${key} = ?`);
                    params.push(value);
                }
                if (conditions.length > 0) {
                    sql += ` WHERE ${conditions.join(' AND ')}`;
                }
            }

            // ORDER BY
            if (options.orderBy) {
                sql += ` ORDER BY ${options.orderBy}`;
                if (options.orderDirection) {
                    sql += ` ${options.orderDirection}`;
                }
            }

            // LIMIT
            if (options.limit) {
                sql += ` LIMIT ?`;
                params.push(options.limit);
            }

            // OFFSET
            if (options.offset) {
                sql += ` OFFSET ?`;
                params.push(options.offset);
            }

            return await this.db.findMany(sql, params);
        } catch (error) {
            console.error(`Error in ${this.tableName} findAll:`, error);
            throw error;
        }
    }

    // Lấy một bản ghi theo ID
    async findById(id) {
        try {
            const sql = `SELECT * FROM ${this.tableName} WHERE id = ?`;
            return await this.db.findOne(sql, [id]);
        } catch (error) {
            console.error(`Error in ${this.tableName} findById:`, error);
            throw error;
        }
    }

    // Lấy một bản ghi theo điều kiện
    async findOne(where = {}) {
        try {
            let sql = `SELECT * FROM ${this.tableName}`;
            const params = [];

            if (Object.keys(where).length > 0) {
                const conditions = [];
                for (const [key, value] of Object.entries(where)) {
                    conditions.push(`${key} = ?`);
                    params.push(value);
                }
                sql += ` WHERE ${conditions.join(' AND ')}`;
            }

            sql += ' LIMIT 1';
            return await this.db.findOne(sql, params);
        } catch (error) {
            console.error(`Error in ${this.tableName} findOne:`, error);
            throw error;
        }
    }

    // Tạo bản ghi mới
    async create(data) {
        try {
            const fields = Object.keys(data);
            const values = Object.values(data);
            const placeholders = new Array(fields.length).fill('?').join(', ');

            const sql = `INSERT INTO ${this.tableName} (${fields.join(', ')}) VALUES (${placeholders})`;
            return await this.db.insert(sql, values);
        } catch (error) {
            console.error(`Error in ${this.tableName} create:`, error);
            throw error;
        }
    }

    // Cập nhật bản ghi
    async update(id, data) {
        try {
            const fields = Object.keys(data);
            const values = Object.values(data);
            const setClause = fields.map(field => `${field} = ?`).join(', ');

            const sql = `UPDATE ${this.tableName} SET ${setClause} WHERE id = ?`;
            values.push(id);

            return await this.db.update(sql, values);
        } catch (error) {
            console.error(`Error in ${this.tableName} update:`, error);
            throw error;
        }
    }

    // Xóa bản ghi
    async delete(id) {
        try {
            const sql = `DELETE FROM ${this.tableName} WHERE id = ?`;
            return await this.db.delete(sql, [id]);
        } catch (error) {
            console.error(`Error in ${this.tableName} delete:`, error);
            throw error;
        }
    }

    // Xóa mềm (soft delete) - cập nhật is_active = false
    async softDelete(id) {
        try {
            return await this.update(id, { is_active: false });
        } catch (error) {
            console.error(`Error in ${this.tableName} softDelete:`, error);
            throw error;
        }
    }

    // Đếm số bản ghi
    async count(where = {}) {
        try {
            let sql = `SELECT COUNT(*) as total FROM ${this.tableName}`;
            const params = [];

            if (Object.keys(where).length > 0) {
                const conditions = [];
                for (const [key, value] of Object.entries(where)) {
                    conditions.push(`${key} = ?`);
                    params.push(value);
                }
                sql += ` WHERE ${conditions.join(' AND ')}`;
            }

            const result = await this.db.findOne(sql, params);
            return result ? result.total : 0;
        } catch (error) {
            console.error(`Error in ${this.tableName} count:`, error);
            throw error;
        }
    }

    // Tìm kiếm với phân trang
    async paginate(page = 1, limit = 20, options = {}) {
        try {
            const offset = (page - 1) * limit;
            
            // Lấy dữ liệu
            const data = await this.findAll({
                ...options,
                limit,
                offset
            });

            // Đếm tổng số bản ghi
            const total = await this.count(options.where || {});
            const totalPages = Math.ceil(total / limit);

            return {
                data,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            };
        } catch (error) {
            console.error(`Error in ${this.tableName} paginate:`, error);
            throw error;
        }
    }

    // Kiểm tra bản ghi có tồn tại
    async exists(where = {}) {
        try {
            const count = await this.count(where);
            return count > 0;
        } catch (error) {
            console.error(`Error in ${this.tableName} exists:`, error);
            throw error;
        }
    }

    // Raw query
    async query(sql, params = []) {
        try {
            return await this.db.query(sql, params);
        } catch (error) {
            console.error(`Error in ${this.tableName} query:`, error);
            throw error;
        }
    }
}

module.exports = BaseModel;