const BaseModel = require('./BaseModel');
const bcrypt = require('bcryptjs');
const CONSTANTS = require('../../config/constants');

class User extends BaseModel {
    constructor() {
        super('users');
    }

    // Xây dựng điều kiện lọc chung cho các truy vấn người dùng
    _buildFilterQuery(search = '', filters = {}) {
        const params = [];
        const whereParts = [];

        const trimmedSearch = typeof search === 'string' ? search.trim() : '';
        if (trimmedSearch) {
            const searchTerm = `%${trimmedSearch}%`;
            whereParts.push('(u.username LIKE ? OR u.full_name LIKE ? OR u.email LIKE ?)');
            params.push(searchTerm, searchTerm, searchTerm);
        }

        const statusFilter = filters.status;
        if (statusFilter === 'active') {
            whereParts.push('u.is_active = 1');
        } else if (statusFilter === 'inactive') {
            whereParts.push('u.is_active = 0');
        }

        if (filters.approvalStatus) {
            whereParts.push('u.approval_status = ?');
            params.push(filters.approvalStatus);
        }

        if (filters.roleId) {
            whereParts.push('u.role_id = ?');
            params.push(filters.roleId);
        } else if (filters.roleName) {
            whereParts.push('r.name = ?');
            params.push(filters.roleName);
        }

        return {
            whereClause: whereParts.length ? `WHERE ${whereParts.join(' AND ')}` : '',
            params
        };
    }

    // Tìm user theo username
    async findByUsername(username, options = {}) {
        try {
            const includeInactive = Boolean(options.includeInactive);
            const includeAllStatuses = Boolean(options.includeAllStatuses);

            const conditions = ['username = ?'];
            const params = [username];

            if (!includeInactive) {
                conditions.push('is_active = 1');
            }

            if (!includeAllStatuses) {
                conditions.push('approval_status = ?');
                params.push(CONSTANTS.USER_APPROVAL_STATUS.APPROVED);
            }

            const sql = `SELECT * FROM users WHERE ${conditions.join(' AND ')}`;
            return await this.db.findOne(sql, params);
        } catch (error) {
            console.error('Error in User findByUsername:', error);
            throw error;
        }
    }

    // Tìm user theo email
    async findByEmail(email, options = {}) {
        try {
            const includeInactive = Boolean(options.includeInactive);
            const includeAllStatuses = Boolean(options.includeAllStatuses);

            const conditions = ['email = ?'];
            const params = [email];

            if (!includeInactive) {
                conditions.push('is_active = 1');
            }

            if (!includeAllStatuses) {
                conditions.push('approval_status = ?');
                params.push(CONSTANTS.USER_APPROVAL_STATUS.APPROVED);
            }

            const sql = `SELECT * FROM users WHERE ${conditions.join(' AND ')}`;
            return await this.db.findOne(sql, params);
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

            const desiredApproval = userData.approval_status || CONSTANTS.USER_APPROVAL_STATUS.PENDING;
            userData.approval_status = desiredApproval;

            const isApproved = desiredApproval === CONSTANTS.USER_APPROVAL_STATUS.APPROVED;
            const hasExplicitActiveFlag = userData.is_active !== undefined && userData.is_active !== null;
            userData.is_active = hasExplicitActiveFlag ? (userData.is_active ? 1 : 0) : (isApproved ? 1 : 0);

            if (!Object.prototype.hasOwnProperty.call(userData, 'approved_at')) {
                userData.approved_at = isApproved ? new Date() : null;
            }

            if (desiredApproval !== CONSTANTS.USER_APPROVAL_STATUS.REJECTED && !Object.prototype.hasOwnProperty.call(userData, 'rejected_reason')) {
                userData.rejected_reason = null;
            }

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

            if (Object.prototype.hasOwnProperty.call(userData, 'approval_status')) {
                const status = userData.approval_status;
                const isApproved = status === CONSTANTS.USER_APPROVAL_STATUS.APPROVED;

                if (!Object.prototype.hasOwnProperty.call(userData, 'approved_at')) {
                    userData.approved_at = isApproved ? new Date() : null;
                }

                if (status !== CONSTANTS.USER_APPROVAL_STATUS.REJECTED && !Object.prototype.hasOwnProperty.call(userData, 'rejected_reason')) {
                    userData.rejected_reason = null;
                }

                if (!Object.prototype.hasOwnProperty.call(userData, 'is_active')) {
                    userData.is_active = isApproved ? 1 : 0;
                }
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
            const user = await this.db.findOne('SELECT * FROM users WHERE username = ?', [username]);
            if (!user) {
                return { success: false, reason: 'not_found' };
            }

            const isValidPassword = await bcrypt.compare(password, user.password_hash);
            if (!isValidPassword) {
                return { success: false, reason: 'invalid_password' };
            }

            if (!user.is_active) {
                return { success: false, reason: 'inactive' };
            }

            const hasApprovalColumn = Object.prototype.hasOwnProperty.call(user, 'approval_status');
            const effectiveApprovalStatus = hasApprovalColumn
                ? (user.approval_status || CONSTANTS.USER_APPROVAL_STATUS.PENDING)
                : CONSTANTS.USER_APPROVAL_STATUS.APPROVED;

            if (effectiveApprovalStatus !== CONSTANTS.USER_APPROVAL_STATUS.APPROVED) {
                return { success: false, reason: effectiveApprovalStatus };
            }

            await this.update(user.id, { last_login: new Date() });

            delete user.password_hash;
            if (!hasApprovalColumn) {
                user.approval_status = CONSTANTS.USER_APPROVAL_STATUS.APPROVED;
            }
            return { success: true, user };
        } catch (error) {
            console.error('Error in User authenticate:', error);
            throw error;
        }
    }

    // Lấy user với thông tin role
    async findWithRole(id, options = {}) {
        try {
            const includeInactive = Boolean(options.includeInactive);
            const includeAllStatuses = Boolean(options.includeAllStatuses);

            const conditions = ['u.id = ?'];
            const params = [id];

            if (!includeInactive) {
                conditions.push('u.is_active = 1');
            }

            if (!includeAllStatuses) {
                conditions.push('u.approval_status = ?');
                params.push(CONSTANTS.USER_APPROVAL_STATUS.APPROVED);
            }

            const sql = `
                SELECT u.*, r.name as role_name, r.permissions as role_permissions,
                       approver.full_name AS approver_name
                FROM users u
                LEFT JOIN roles r ON u.role_id = r.id
                LEFT JOIN users approver ON u.approved_by = approver.id
                WHERE ${conditions.join(' AND ')}
                LIMIT 1
            `;
            return await this.db.findOne(sql, params);
        } catch (error) {
            console.error('Error in User findWithRole:', error);
            throw error;
        }
    }

    // Lấy danh sách user với thông tin role và phân trang
    async getUsersWithRole(page = 1, limit = 20, search = '', filters = {}) {
        try {
            const parsedPage = Number.parseInt(page, 10);
            const pageNumber = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;

            const parsedLimit = Number.parseInt(limit, 10);
            const perPage = Number.isInteger(parsedLimit) && parsedLimit > 0 ? parsedLimit : 20;

            const offset = (pageNumber - 1) * perPage;

            const { whereClause, params } = this._buildFilterQuery(search, filters);
            const baseFromClause = `
                FROM users u
                LEFT JOIN roles r ON u.role_id = r.id
                LEFT JOIN users approver ON u.approved_by = approver.id
            `;

            const dataSql = `
                SELECT u.id, u.username, u.email, u.full_name, u.phone, u.is_active,
                       u.approval_status, u.approved_at, u.rejected_reason,
                       u.last_login, u.created_at, u.updated_at,
                       u.role_id, r.name AS role_name,
                       approver.full_name AS approver_name
                ${baseFromClause}
                ${whereClause}
                ORDER BY u.created_at DESC
                LIMIT ${perPage} OFFSET ${offset}
            `;

            const users = await this.db.findMany(dataSql, params);

            const countSql = `
                SELECT COUNT(*) AS total
                ${baseFromClause}
                ${whereClause}
            `;
            const countResult = await this.db.findOne(countSql, params);
            const total = countResult ? Number(countResult.total) : 0;
            const totalPages = perPage ? Math.ceil(total / perPage) : 0;

            return {
                data: users,
                pagination: {
                    page: pageNumber,
                    limit: perPage,
                    total,
                    totalPages,
                    hasNext: pageNumber < totalPages,
                    hasPrev: pageNumber > 1
                }
            };
        } catch (error) {
            console.error('Error in User getUsersWithRole:', error);
            throw error;
        }
    }

    // Đếm số lượng người dùng theo điều kiện lọc
    async countByFilters(search = '', filters = {}) {
        try {
            const { whereClause, params } = this._buildFilterQuery(search, filters);
            const baseFromClause = `
                FROM users u
                LEFT JOIN roles r ON u.role_id = r.id
                LEFT JOIN users approver ON u.approved_by = approver.id
            `;

            const countSql = `
                SELECT COUNT(*) AS total
                ${baseFromClause}
                ${whereClause}
            `;

            const result = await this.db.findOne(countSql, params);
            return result ? Number(result.total) : 0;
        } catch (error) {
            console.error('Error in User countByFilters:', error);
            throw error;
        }
    }

    async getEligibleApprovers(currentRoleName, excludeUserId = null) {
        try {
            const hierarchy = Array.isArray(CONSTANTS.ROLE_HIERARCHY) ? CONSTANTS.ROLE_HIERARCHY : [];
            const normalizedRole = (currentRoleName || '').toString().trim().toLowerCase();
            const currentIndex = hierarchy.indexOf(normalizedRole);

            if (currentIndex === -1) {
                return [];
            }

            const higherRoles = hierarchy.slice(0, currentIndex);
            if (!higherRoles.length) {
                return [];
            }

            const inPlaceholders = higherRoles.map(() => '?').join(', ');
            const orderPlaceholders = higherRoles.map(() => '?').join(', ');
            const params = [...higherRoles, CONSTANTS.USER_APPROVAL_STATUS.APPROVED];

            let excludeClause = '';
            if (excludeUserId) {
                excludeClause = ' AND u.id != ?';
                params.push(excludeUserId);
            }

            const sql = `
                SELECT u.id, u.full_name, u.username, u.email, u.role_id,
                       r.name AS role_name, r.description AS role_description
                FROM users u
                INNER JOIN roles r ON u.role_id = r.id
                WHERE r.name IN (${inPlaceholders})
                  AND u.is_active = 1
                  AND u.approval_status = ?
                  ${excludeClause}
                ORDER BY FIELD(r.name, ${orderPlaceholders}) ASC, u.full_name ASC
            `;

            params.push(...higherRoles);

            return await this.db.findMany(sql, params);
        } catch (error) {
            console.error('Error in User getEligibleApprovers:', error);
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

    async approveUser(userId, adminId, roleId = null) {
        try {
            const updateData = {
                approval_status: CONSTANTS.USER_APPROVAL_STATUS.APPROVED,
                approved_by: adminId || null,
                approved_at: new Date(),
                rejected_reason: null,
                is_active: 1,
                updated_at: new Date()
            };

            if (roleId) {
                updateData.role_id = roleId;
            }

            return await super.update(userId, updateData);
        } catch (error) {
            console.error('Error in User approveUser:', error);
            throw error;
        }
    }

    async rejectUser(userId, adminId, reason = null) {
        try {
            return await super.update(userId, {
                approval_status: CONSTANTS.USER_APPROVAL_STATUS.REJECTED,
                approved_by: adminId || null,
                approved_at: null,
                rejected_reason: reason || null,
                is_active: 0,
                updated_at: new Date()
            });
        } catch (error) {
            console.error('Error in User rejectUser:', error);
            throw error;
        }
    }

    async markPending(userId) {
        try {
            return await super.update(userId, {
                approval_status: CONSTANTS.USER_APPROVAL_STATUS.PENDING,
                approved_by: null,
                approved_at: null,
                rejected_reason: null,
                is_active: 0,
                updated_at: new Date()
            });
        } catch (error) {
            console.error('Error in User markPending:', error);
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
                    SUM(CASE WHEN approval_status = '${CONSTANTS.USER_APPROVAL_STATUS.APPROVED}' THEN 1 ELSE 0 END) as approved_users,
                    SUM(CASE WHEN approval_status = '${CONSTANTS.USER_APPROVAL_STATUS.PENDING}' THEN 1 ELSE 0 END) as pending_users,
                    SUM(CASE WHEN approval_status = '${CONSTANTS.USER_APPROVAL_STATUS.REJECTED}' THEN 1 ELSE 0 END) as rejected_users,
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