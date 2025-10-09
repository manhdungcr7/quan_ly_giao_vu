const BaseModel = require('./BaseModel');
const bcrypt = require('bcryptjs');
const CONSTANTS = require('../../config/constants');

class User extends BaseModel {
    constructor() {
        super('users');
    }

    // Tìm user theo username
    async findByUsername(username) {
        try {
            const sql = 'SELECT * FROM users WHERE username = ? AND is_active = 1';
            return await this.db.findOne(sql, [username]);
        } catch (error) {
            console.error('Error in User findByUsername:', error);
            throw error;
        }
    }

    // Tìm user theo email
    async findByEmail(email) {
        try {
            const sql = 'SELECT * FROM users WHERE email = ? AND is_active = 1';
            return await this.db.findOne(sql, [email]);
        } catch (error) {
            console.error('Error in User findByEmail:', error);
            throw error;
        }
    }

    // Tạo user mới với mã hóa password
    async create(userData) {
        try {
            // Hash password
            if (userData.password) {
                const salt = await bcrypt.genSalt(CONSTANTS.SECURITY.bcryptRounds);
                userData.password_hash = await bcrypt.hash(userData.password, salt);
                delete userData.password; // Remove plain password
            }

            // Set default values
            userData.is_active = userData.is_active !== undefined ? userData.is_active : true;
            userData.created_at = new Date();

            return await super.create(userData);
        } catch (error) {
            console.error('Error in User create:', error);
            throw error;
        }
    }

    // Cập nhật user với xử lý password
    async update(id, userData) {
        try {
            // Hash password if provided
            if (userData.password) {
                const salt = await bcrypt.genSalt(CONSTANTS.SECURITY.bcryptRounds);
                userData.password_hash = await bcrypt.hash(userData.password, salt);
                delete userData.password; // Remove plain password
            }

            userData.updated_at = new Date();
            return await super.update(id, userData);
        } catch (error) {
            console.error('Error in User update:', error);
            throw error;
        }
    }

    // Xác thực user
    async authenticate(username, password) {
        try {
            const user = await this.findByUsername(username);
            if (!user) {
                return null;
            }

            const isValidPassword = await bcrypt.compare(password, user.password_hash);
            if (!isValidPassword) {
                return null;
            }

            // Cập nhật last_login
            await this.update(user.id, { last_login: new Date() });

            // Loại bỏ password_hash khỏi kết quả trả về
            delete user.password_hash;
            return user;
        } catch (error) {
            console.error('Error in User authenticate:', error);
            throw error;
        }
    }

    // Lấy user với thông tin role
    async findWithRole(id) {
        try {
            const sql = `
                SELECT u.*, r.name as role_name, r.permissions as role_permissions
                FROM users u
                LEFT JOIN roles r ON u.role_id = r.id
                WHERE u.id = ? AND u.is_active = 1
            `;
            return await this.db.findOne(sql, [id]);
        } catch (error) {
            console.error('Error in User findWithRole:', error);
            throw error;
        }
    }

    // Lấy danh sách user với thông tin role và phân trang
    async getUsersWithRole(page = 1, limit = 20, search = '') {
        try {
            const offset = (page - 1) * limit;
            let whereClause = 'WHERE u.is_active = 1';
            const params = [];

            if (search) {
                whereClause += ' AND (u.username LIKE ? OR u.full_name LIKE ? OR u.email LIKE ?)';
                const searchTerm = `%${search}%`;
                params.push(searchTerm, searchTerm, searchTerm);
            }

            const sql = `
                SELECT u.id, u.username, u.email, u.full_name, u.phone, u.is_active, 
                       u.last_login, u.created_at, r.name as role_name
                FROM users u
                LEFT JOIN roles r ON u.role_id = r.id
                ${whereClause}
                ORDER BY u.created_at DESC
                LIMIT ? OFFSET ?
            `;
            params.push(limit, offset);

            const users = await this.db.findMany(sql, params);

            // Đếm tổng số
            const countSql = `
                SELECT COUNT(*) as total
                FROM users u
                ${whereClause}
            `;
            const countParams = search ? [search, search, search] : [];
            const countResult = await this.db.findOne(countSql, countParams);
            const total = countResult.total;

            return {
                data: users,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                    hasNext: page < Math.ceil(total / limit),
                    hasPrev: page > 1
                }
            };
        } catch (error) {
            console.error('Error in User getUsersWithRole:', error);
            throw error;
        }
    }

    // Kiểm tra username đã tồn tại
    async isUsernameExists(username, excludeId = null) {
        try {
            let sql = 'SELECT COUNT(*) as count FROM users WHERE username = ?';
            const params = [username];

            if (excludeId) {
                sql += ' AND id != ?';
                params.push(excludeId);
            }

            const result = await this.db.findOne(sql, params);
            return result.count > 0;
        } catch (error) {
            console.error('Error in User isUsernameExists:', error);
            throw error;
        }
    }

    // Kiểm tra email đã tồn tại
    async isEmailExists(email, excludeId = null) {
        try {
            let sql = 'SELECT COUNT(*) as count FROM users WHERE email = ?';
            const params = [email];

            if (excludeId) {
                sql += ' AND id != ?';
                params.push(excludeId);
            }

            const result = await this.db.findOne(sql, params);
            return result.count > 0;
        } catch (error) {
            console.error('Error in User isEmailExists:', error);
            throw error;
        }
    }

    // Thay đổi password
    async changePassword(id, oldPassword, newPassword) {
        try {
            const user = await this.findById(id);
            if (!user) {
                throw new Error('User not found');
            }

            // Verify old password
            const isValidOldPassword = await bcrypt.compare(oldPassword, user.password_hash);
            if (!isValidOldPassword) {
                throw new Error('Invalid old password');
            }

            // Hash new password
            const salt = await bcrypt.genSalt(CONSTANTS.SECURITY.bcryptRounds);
            const newPasswordHash = await bcrypt.hash(newPassword, salt);

            return await super.update(id, { 
                password_hash: newPasswordHash,
                updated_at: new Date()
            });
        } catch (error) {
            console.error('Error in User changePassword:', error);
            throw error;
        }
    }

    // Reset password (admin function)
    async resetPassword(id, newPassword) {
        try {
            const salt = await bcrypt.genSalt(CONSTANTS.SECURITY.bcryptRounds);
            const passwordHash = await bcrypt.hash(newPassword, salt);

            return await super.update(id, { 
                password_hash: passwordHash,
                updated_at: new Date()
            });
        } catch (error) {
            console.error('Error in User resetPassword:', error);
            throw error;
        }
    }

    // Lấy thống kê user
    async getStats() {
        try {
            const sql = `
                SELECT 
                    COUNT(*) as total_users,
                    SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_users,
                    SUM(CASE WHEN last_login >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as active_last_30_days,
                    SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as new_last_30_days
                FROM users
            `;
            return await this.db.findOne(sql);
        } catch (error) {
            console.error('Error in User getStats:', error);
            throw error;
        }
    }
}

module.exports = User;