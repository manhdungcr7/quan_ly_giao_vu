const BaseModel = require('./BaseModel');

class Staff extends BaseModel {
    constructor() {
        super('staff');
        this._schemaInfo = null;
    }

    async getSchemaInfo() {
        if (this._schemaInfo) {
            return this._schemaInfo;
        }

        let schema = { hasCreatedAt: false, hasUpdatedAt: false };

        try {
            const columns = await this.db.findMany('SHOW COLUMNS FROM staff');
            const fields = new Set(columns.map((col) => col.Field));
            schema = {
                hasCreatedAt: fields.has('created_at'),
                hasUpdatedAt: fields.has('updated_at')
            };
        } catch (error) {
            console.warn('Staff.getSchemaInfo: unable to introspect staff columns:', error.message);
        }

        this._schemaInfo = schema;
        return schema;
    }

    // Láº¥y thÃ´ng tin staff vá»›i user vÃ  department
    async findWithDetails(id) {
        try {
            const sql = `
                SELECT s.*, u.username, u.email, u.full_name, u.phone, u.avatar,
                       p.name as position_name, p.code as position_code,
                       d.name as department_name, d.code as department_code
                FROM staff s
                LEFT JOIN users u ON s.user_id = u.id
                LEFT JOIN positions p ON s.position_id = p.id
                LEFT JOIN departments d ON s.department_id = d.id
                WHERE s.id = ?
            `;
            return await this.db.findOne(sql, [id]);
        } catch (error) {
            console.error('Error in Staff findWithDetails:', error);
            throw error;
        }
    }

    // Láº¥y danh sÃ¡ch staff vá»›i thÃ´ng tin chi tiáº¿t
    async getStaffWithDetails(page = 1, limit = 20, filters = {}) {
        const emptyResult = {
            data: [],
            pagination: {
                page,
                limit,
                total: 0,
                totalPages: 1,
                hasNext: false,
                hasPrev: page > 1
            }
        };

        try {
            const offset = (page - 1) * limit;
            let whereClause = 'WHERE 1=1';
            const params = [];

            const schemaInfo = await this.getSchemaInfo();
            const orderByClause = schemaInfo.hasCreatedAt
                ? 's.created_at DESC'
                : schemaInfo.hasUpdatedAt
                    ? 's.updated_at DESC'
                    : 's.id DESC';

            const shouldExcludeTerminated = !filters.status;
            if (shouldExcludeTerminated) {
                whereClause += ' AND s.status != ?';
                params.push('terminated');
            }

            // ThÃªm cÃ¡c bá»™ lá»c
            if (filters.department_id) {
                whereClause += ' AND s.department_id = ?';
                params.push(filters.department_id);
            }

            if (filters.position_id) {
                whereClause += ' AND s.position_id = ?';
                params.push(filters.position_id);
            }

            if (filters.employment_type) {
                whereClause += ' AND s.employment_type = ?';
                params.push(filters.employment_type);
            }

            if (filters.status) {
                whereClause += ' AND s.status = ?';
                params.push(filters.status);
            }

            if (filters.search) {
                whereClause += ' AND (s.staff_code LIKE ? OR u.full_name LIKE ? OR u.email LIKE ?)';
                const searchTerm = `%${filters.search}%`;
                params.push(searchTerm, searchTerm, searchTerm);
            }

            const sql = `
                SELECT s.id, s.staff_code, s.employment_type, s.hire_date, s.salary,
                       s.academic_rank, s.academic_degree, s.status,
                       u.full_name, u.email, u.phone,
                       p.name as position_name,
                       d.name as department_name
                FROM staff s
                LEFT JOIN users u ON s.user_id = u.id
                LEFT JOIN positions p ON s.position_id = p.id
                LEFT JOIN departments d ON s.department_id = d.id
                ${whereClause}
                ORDER BY ${orderByClause}
                LIMIT ? OFFSET ?
            `;
            params.push(limit, offset);

            const staff = await this.db.findMany(sql, params);

            // Äáº¿m tá»•ng sá»‘
            const countSql = `
                SELECT COUNT(*) as total
                FROM staff s
                LEFT JOIN users u ON s.user_id = u.id
                ${whereClause}
            `;
            const countParams = params.slice(0, -2); // Remove limit and offset
            const countResult = await this.db.findOne(countSql, countParams);
            const total = countResult.total;

            return {
                data: staff,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.max(1, Math.ceil(total / limit)),
                    hasNext: page < Math.ceil(total / limit),
                    hasPrev: page > 1
                }
            };
        } catch (error) {
            if (error?.code === 'ER_NO_SUCH_TABLE' || error?.code === 'ER_BAD_FIELD_ERROR') {
                console.warn('Staff.getStaffWithDetails: returning empty dataset due to schema mismatch:', error.message);
                return emptyResult;
            }
            console.error('Error in Staff getStaffWithDetails:', error);
            throw error;
        }
    }

    async getAllForExport(filters = {}) {
        try {
            let whereClause = 'WHERE 1=1';
            const params = [];

            const shouldExcludeTerminated = !filters.status;
            if (shouldExcludeTerminated) {
                whereClause += ' AND s.status != ?';
                params.push('terminated');
            }

            if (filters.department_id) {
                whereClause += ' AND s.department_id = ?';
                params.push(filters.department_id);
            }

            if (filters.position_id) {
                whereClause += ' AND s.position_id = ?';
                params.push(filters.position_id);
            }

            if (filters.employment_type) {
                whereClause += ' AND s.employment_type = ?';
                params.push(filters.employment_type);
            }

            if (filters.status) {
                whereClause += ' AND s.status = ?';
                params.push(filters.status);
            }

            if (filters.search) {
                whereClause += ' AND (s.staff_code LIKE ? OR u.full_name LIKE ? OR u.email LIKE ?)';
                const searchTerm = `%${filters.search}%`;
                params.push(searchTerm, searchTerm, searchTerm);
            }

            const sql = `
                SELECT s.id, s.staff_code, s.employment_type, s.hire_date, s.salary,
                       s.academic_rank, s.academic_degree, s.status,
                       u.full_name, u.email, u.phone,
                       p.name as position_name,
                       d.name as department_name
                FROM staff s
                LEFT JOIN users u ON s.user_id = u.id
                LEFT JOIN positions p ON s.position_id = p.id
                LEFT JOIN departments d ON s.department_id = d.id
                ${whereClause}
                ORDER BY u.full_name ASC
            `;

            return await this.db.findMany(sql, params);
        } catch (error) {
            if (error?.code === 'ER_NO_SUCH_TABLE' || error?.code === 'ER_BAD_FIELD_ERROR') {
                console.warn('Staff.getAllForExport: returning empty dataset due to schema mismatch:', error.message);
                return [];
            }
            console.error('Error in Staff getAllForExport:', error);
            throw error;
        }
    }

    // TÃ¬m staff theo mÃ£ cÃ¡n bá»™
    async findByStaffCode(staffCode) {
        try {
            const sql = 'SELECT * FROM staff WHERE staff_code = ?';
            return await this.db.findOne(sql, [staffCode]);
        } catch (error) {
            console.error('Error in Staff findByStaffCode:', error);
            throw error;
        }
    }

    // TÃ¬m staff theo user_id
    async findByUserId(userId) {
        try {
            const sql = 'SELECT * FROM staff WHERE user_id = ?';
            return await this.db.findOne(sql, [userId]);
        } catch (error) {
            console.error('Error in Staff findByUserId:', error);
            throw error;
        }
    }

    // Láº¥y danh sÃ¡ch staff theo department
    async getByDepartment(departmentId) {
        try {
            const sql = `
                SELECT s.*, u.full_name, p.name as position_name
                FROM staff s
                LEFT JOIN users u ON s.user_id = u.id
                LEFT JOIN positions p ON s.position_id = p.id
                WHERE s.department_id = ? AND s.status = 'active'
                ORDER BY p.level ASC, u.full_name ASC
            `;
            return await this.db.findMany(sql, [departmentId]);
        } catch (error) {
            console.error('Error in Staff getByDepartment:', error);
            throw error;
        }
    }

    // Láº¥y thá»‘ng kÃª staff
    async getStats() {
        const fallback = {
            total_staff: 0,
            active_staff: 0,
            full_time_staff: 0,
            part_time_staff: 0,
            contract_staff: 0,
            avg_experience: null,
            avg_salary: null
        };

        try {
            const sql = `
                SELECT 
                    COUNT(*) as total_staff,
                    SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_staff,
                    SUM(CASE WHEN employment_type = 'full_time' THEN 1 ELSE 0 END) as full_time_staff,
                    SUM(CASE WHEN employment_type = 'part_time' THEN 1 ELSE 0 END) as part_time_staff,
                    SUM(CASE WHEN employment_type = 'contract' THEN 1 ELSE 0 END) as contract_staff,
                    AVG(years_experience) as avg_experience,
                    AVG(salary) as avg_salary
                FROM staff
                WHERE status != 'terminated'
            `;
            return await this.db.findOne(sql) || fallback;
        } catch (error) {
            if (error?.code === 'ER_BAD_FIELD_ERROR' || error?.code === 'ER_NO_SUCH_TABLE') {
                console.warn('Staff.getStats: falling back to defaults due to schema mismatch:', error.message);
                return fallback;
            }
            console.error('Error in Staff getStats:', error);
            throw error;
        }
    }

    // Láº¥y staff theo department vá»›i thá»‘ng kÃª
    async getStatsByDepartment() {
        try {
            const sql = `
                SELECT d.name as department_name,
                       COUNT(s.id) as staff_count,
                       SUM(CASE WHEN s.status = 'active' THEN 1 ELSE 0 END) as active_count,
                       AVG(s.salary) as avg_salary
                FROM departments d
                LEFT JOIN staff s ON d.id = s.department_id AND s.status != 'terminated'
                GROUP BY d.id, d.name
                ORDER BY staff_count DESC
            `;
            return await this.db.findMany(sql);
        } catch (error) {
            if (error?.code === 'ER_NO_SUCH_TABLE' || error?.code === 'ER_BAD_FIELD_ERROR') {
                console.warn('Staff.getStatsByDepartment: no department statistics available:', error.message);
                return [];
            }
            console.error('Error in Staff getStatsByDepartment:', error);
            throw error;
        }
    }

    // Kiá»ƒm tra staff code Ä‘Ã£ tá»“n táº¡i
    async isStaffCodeExists(staffCode, excludeId = null) {
        try {
            let sql = 'SELECT COUNT(*) as count FROM staff WHERE staff_code = ?';
            const params = [staffCode];

            if (excludeId) {
                sql += ' AND id != ?';
                params.push(excludeId);
            }

            const result = await this.db.findOne(sql, params);
            return result.count > 0;
        } catch (error) {
            console.error('Error in Staff isStaffCodeExists:', error);
            throw error;
        }
    }

    // Láº¥y chuyÃªn mÃ´n cá»§a staff
    async getSpecializations(staffId) {
        try {
            const sql = 'SELECT * FROM staff_specializations WHERE staff_id = ? ORDER BY is_primary DESC';
            return await this.db.findMany(sql, [staffId]);
        } catch (error) {
            console.error('Error in Staff getSpecializations:', error);
            throw error;
        }
    }

    // ThÃªm chuyÃªn mÃ´n cho staff
    async addSpecialization(staffId, specialization, isPrimary = false) {
        try {
            const sql = 'INSERT INTO staff_specializations (staff_id, specialization, is_primary) VALUES (?, ?, ?)';
            return await this.db.insert(sql, [staffId, specialization, isPrimary]);
        } catch (error) {
            console.error('Error in Staff addSpecialization:', error);
            throw error;
        }
    }

    // XÃ³a chuyÃªn mÃ´n
    async removeSpecialization(staffId, specializationId) {
        try {
            const sql = 'DELETE FROM staff_specializations WHERE staff_id = ? AND id = ?';
            return await this.db.delete(sql, [staffId, specializationId]);
        } catch (error) {
            console.error('Error in Staff removeSpecialization:', error);
            throw error;
        }
    }

    // Láº¥y sá»Ÿ thÃ­ch nghiÃªn cá»©u
    async getInterests(staffId) {
        try {
            const sql = 'SELECT * FROM staff_interests WHERE staff_id = ?';
            return await this.db.findMany(sql, [staffId]);
        } catch (error) {
            console.error('Error in Staff getInterests:', error);
            throw error;
        }
    }

    // ThÃªm sá»Ÿ thÃ­ch nghiÃªn cá»©u
    async addInterest(staffId, interest) {
        try {
            const sql = 'INSERT INTO staff_interests (staff_id, interest) VALUES (?, ?)';
            return await this.db.insert(sql, [staffId, interest]);
        } catch (error) {
            console.error('Error in Staff addInterest:', error);
            throw error;
        }
    }

    // Láº¥y giáº£i thÆ°á»Ÿng
    async getAwards(staffId) {
        try {
            const sql = 'SELECT * FROM staff_awards WHERE staff_id = ? ORDER BY award_year DESC';
            return await this.db.findMany(sql, [staffId]);
        } catch (error) {
            console.error('Error in Staff getAwards:', error);
            throw error;
        }
    }

    // ThÃªm giáº£i thÆ°á»Ÿng
    async addAward(staffId, awardData) {
        try {
            const sql = 'INSERT INTO staff_awards (staff_id, award_name, award_year, description) VALUES (?, ?, ?, ?)';
            return await this.db.insert(sql, [staffId, awardData.award_name, awardData.award_year, awardData.description]);
        } catch (error) {
            console.error('Error in Staff addAward:', error);
            throw error;
        }
    }

    // Láº¥y danh sÃ¡ch giáº£ng viÃªn
    async getLecturers() {
        try {
            const sql = `
                SELECT s.id, s.staff_code, u.full_name, s.academic_rank, s.academic_degree,
                       p.name as position_name, d.name as department_name
                FROM staff s
                LEFT JOIN users u ON s.user_id = u.id
                LEFT JOIN positions p ON s.position_id = p.id
                LEFT JOIN departments d ON s.department_id = d.id
                WHERE s.status = 'active' 
                AND (p.code LIKE 'GV%' OR s.academic_rank IS NOT NULL)
                ORDER BY s.academic_rank DESC, u.full_name ASC
            `;
            return await this.db.findMany(sql);
        } catch (error) {
            console.error('Error in Staff getLecturers:', error);
            throw error;
        }
    }

    // Thá»‘ng kÃª sá»‘ lÆ°á»£ng theo tráº¡ng thÃ¡i lÃ m viá»‡c
    async getStatusSummary() {
        try {
            const sql = `
                SELECT status, COUNT(*) as total
                FROM staff
                GROUP BY status
            `;
            return await this.db.findMany(sql);
        } catch (error) {
            if (error?.code === 'ER_NO_SUCH_TABLE' || error?.code === 'ER_BAD_FIELD_ERROR') {
                console.warn('Staff.getStatusSummary: staff table unavailable, returning empty summary:', error.message);
                return [];
            }
            console.error('Error in Staff getStatusSummary:', error);
            throw error;
        }
    }

    async getActiveDepartments() {
        try {
            const sql = `
                SELECT id, name
                FROM departments
                WHERE is_active = 1
                ORDER BY name
            `;
            return await this.db.findMany(sql);
        } catch (error) {
            if (error?.code === 'ER_NO_SUCH_TABLE' || error?.code === 'ER_BAD_FIELD_ERROR') {
                console.warn('Staff.getActiveDepartments: departments table missing or outdated:', error.message);
                return [];
            }
            console.error('Error in Staff getActiveDepartments:', error);
            return [];
        }
    }

    async getPositionOptions() {
        try {
            const sql = `
                SELECT id, name
                FROM positions
                WHERE is_active = 1
                ORDER BY level ASC, name ASC
            `;
            return await this.db.findMany(sql);
        } catch (error) {
            if (error?.code === 'ER_NO_SUCH_TABLE' || error?.code === 'ER_BAD_FIELD_ERROR') {
                console.warn('Staff.getPositionOptions: positions table missing or outdated:', error.message);
                return [];
            }
            console.error('Error in Staff getPositionOptions:', error);
            return [];
        }
    }
    
    async createUserForStaff(userData) {
        try {
            const bcrypt = require('bcryptjs');
            const password_hash = await bcrypt.hash(userData.password, 10);

            // Resolve role_id for 'staff' role (fallback to 2)
            let roleRow = null;
            try {
                roleRow = await this.db.findOne('SELECT id FROM roles WHERE name = ? LIMIT 1', [userData.role || 'staff']);
            } catch (_) {}
            const role_id = roleRow?.id || 2;

            const sql = 'INSERT INTO users (username, email, password_hash, full_name, phone, role_id, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)';
            const result = await this.db.insert(sql, [
                userData.username,
                userData.email,
                password_hash,
                userData.full_name,
                userData.phone || null,
                role_id,
                userData.is_active !== false ? 1 : 0
            ]);
            return { id: result.insertId, ...userData, role_id };
        } catch (error) {
            console.error('Error in Staff createUserForStaff:', error);
            throw error;
        }
    }

    async getDepartmentOptions() {
        return await this.getActiveDepartments();
    }
}

module.exports = Staff;
