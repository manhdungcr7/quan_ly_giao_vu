const BaseModel = require('./BaseModel');

class Project extends BaseModel {
    constructor() {
        super('projects');
    }

    async listCategories({ includeInactive = false } = {}) {
        try {
            let sql = 'SELECT id, name FROM project_categories';
            if (!includeInactive) {
                sql += ' WHERE is_active = 1';
            }
            sql += ' ORDER BY name ASC';
            return await this.db.findMany(sql);
        } catch (error) {
            console.error('Error in Project listCategories:', error);
            throw error;
        }
    }

    async createProject(data = {}) {
        try {
            const sql = `
                INSERT INTO projects (
                    project_code, title, category_id, leader_id,
                    start_date, end_date, budget, status, progress,
                    description, objectives, results_summary, created_by
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const result = await this.db.insert(sql, [
                data.project_code,
                data.title,
                data.category_id || null,
                data.leader_id,
                data.start_date,
                data.end_date,
                data.budget ?? 0,
                data.status || 'planning',
                data.progress ?? 0,
                data.description || null,
                data.objectives || null,
                data.results_summary || null,
                data.created_by
            ]);
            return result.insertId;
        } catch (error) {
            console.error('Error in Project createProject:', error);
            throw error;
        }
    }

    async updateProject(id, data = {}) {
        try {
            const sql = `
                UPDATE projects SET
                    project_code = ?,
                    title = ?,
                    category_id = ?,
                    leader_id = ?,
                    start_date = ?,
                    end_date = ?,
                    budget = ?,
                    status = ?,
                    progress = ?,
                    description = ?,
                    objectives = ?,
                    results_summary = ?,
                    updated_at = NOW()
                WHERE id = ?
            `;
            await this.db.update(sql, [
                data.project_code,
                data.title,
                data.category_id || null,
                data.leader_id,
                data.start_date,
                data.end_date,
                data.budget ?? 0,
                data.status || 'planning',
                data.progress ?? 0,
                data.description || null,
                data.objectives || null,
                data.results_summary || null,
                id
            ]);
        } catch (error) {
            console.error('Error in Project updateProject:', error);
            throw error;
        }
    }

    async deleteProject(id) {
        try {
            const sql = 'DELETE FROM projects WHERE id = ?';
            await this.db.delete(sql, [id]);
        } catch (error) {
            console.error('Error in Project deleteProject:', error);
            throw error;
        }
    }

    // Lấy dự án với thông tin chi tiết
    async findWithDetails(id) {
        try {
            const sql = `
                SELECT p.*, 
                       pc.name as category_name,
                       s.staff_code as leader_code, u.full_name as leader_name,
                       u_created.full_name as created_by_name
                FROM projects p
                LEFT JOIN project_categories pc ON p.category_id = pc.id
                LEFT JOIN staff s ON p.leader_id = s.id
                LEFT JOIN users u ON s.user_id = u.id
                LEFT JOIN users u_created ON p.created_by = u_created.id
                WHERE p.id = ?
            `;
            return await this.db.findOne(sql, [id]);
        } catch (error) {
            console.error('Error in Project findWithDetails:', error);
            throw error;
        }
    }

    // Lấy danh sách dự án với bộ lọc
    async getProjectsWithFilters(page = 1, limit = 20, filters = {}) {
        try {
            const offset = (page - 1) * limit;
            let whereClause = 'WHERE 1=1';
            const params = [];

            if (filters.category_id) {
                whereClause += ' AND p.category_id = ?';
                params.push(filters.category_id);
            }

            if (filters.status) {
                whereClause += ' AND p.status = ?';
                params.push(filters.status);
            }

            if (filters.leader_id) {
                whereClause += ' AND p.leader_id = ?';
                params.push(filters.leader_id);
            }

            if (filters.search) {
                whereClause += ' AND (p.project_code LIKE ? OR p.title LIKE ?)';
                const searchTerm = `%${filters.search}%`;
                params.push(searchTerm, searchTerm);
            }

            const sql = `
                SELECT p.id, p.project_code, p.title, p.status, p.progress,
                       p.start_date, p.end_date, p.budget,
                       pc.name as category_name,
                       u.full_name as leader_name,
                       COUNT(pm.staff_id) as team_size
                FROM projects p
                LEFT JOIN project_categories pc ON p.category_id = pc.id
                LEFT JOIN staff s ON p.leader_id = s.id
                LEFT JOIN users u ON s.user_id = u.id
                LEFT JOIN project_members pm ON p.id = pm.project_id
                ${whereClause}
                GROUP BY p.id
                ORDER BY p.created_at DESC
                LIMIT ? OFFSET ?
            `;
            params.push(limit, offset);

            const projects = await this.db.findMany(sql, params);

            // Đếm tổng số
            const countSql = `
                SELECT COUNT(*) as total
                FROM projects p
                ${whereClause}
            `;
            const countParams = params.slice(0, -2);
            const countResult = await this.db.findOne(countSql, countParams);
            const total = countResult.total;

            return {
                data: projects,
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
            console.error('Error in Project getProjectsWithFilters:', error);
            throw error;
        }
    }

    // Lấy thành viên dự án
    async getMembers(projectId) {
        try {
            const sql = `
                SELECT pm.*, s.staff_code, u.full_name, u.email,
                       p.name as position_name, d.name as department_name
                FROM project_members pm
                LEFT JOIN staff s ON pm.staff_id = s.id
                LEFT JOIN users u ON s.user_id = u.id
                LEFT JOIN positions p ON s.position_id = p.id
                LEFT JOIN departments d ON s.department_id = d.id
                WHERE pm.project_id = ?
                ORDER BY pm.role ASC, u.full_name ASC
            `;
            return await this.db.findMany(sql, [projectId]);
        } catch (error) {
            console.error('Error in Project getMembers:', error);
            throw error;
        }
    }

    // Thêm thành viên vào dự án
    async addMember(projectId, staffId, role = 'member') {
        try {
            const sql = 'INSERT INTO project_members (project_id, staff_id, role) VALUES (?, ?, ?)';
            return await this.db.insert(sql, [projectId, staffId, role]);
        } catch (error) {
            console.error('Error in Project addMember:', error);
            throw error;
        }
    }

    // Xóa thành viên khỏi dự án
    async removeMember(projectId, staffId) {
        try {
            const sql = 'DELETE FROM project_members WHERE project_id = ? AND staff_id = ?';
            return await this.db.delete(sql, [projectId, staffId]);
        } catch (error) {
            console.error('Error in Project removeMember:', error);
            throw error;
        }
    }

    // Lấy milestone của dự án
    async getMilestones(projectId) {
        try {
            const sql = `
                SELECT * FROM project_milestones 
                WHERE project_id = ? 
                ORDER BY due_date ASC
            `;
            return await this.db.findMany(sql, [projectId]);
        } catch (error) {
            console.error('Error in Project getMilestones:', error);
            throw error;
        }
    }

    // Thêm milestone
    async addMilestone(milestoneData) {
        try {
            const sql = `
                INSERT INTO project_milestones 
                (project_id, title, description, due_date, status, progress)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            return await this.db.insert(sql, [
                milestoneData.project_id,
                milestoneData.title,
                milestoneData.description,
                milestoneData.due_date,
                milestoneData.status || 'pending',
                milestoneData.progress || 0
            ]);
        } catch (error) {
            console.error('Error in Project addMilestone:', error);
            throw error;
        }
    }

    // Cập nhật milestone
    async updateMilestone(milestoneId, data) {
        try {
            const sql = `
                UPDATE project_milestones 
                SET title = ?, description = ?, due_date = ?, status = ?, progress = ?, updated_at = NOW()
                WHERE id = ?
            `;
            return await this.db.update(sql, [
                data.title,
                data.description,
                data.due_date,
                data.status,
                data.progress,
                milestoneId
            ]);
        } catch (error) {
            console.error('Error in Project updateMilestone:', error);
            throw error;
        }
    }

    // Lấy thống kê dự án
    async getStats(options = {}) {
        try {
            const filters = [];
            const params = [];

            const startInput = options?.timeRange?.startDate;
            const endInput = options?.timeRange?.endDate;

            if (startInput && endInput) {
                const startDate = startInput instanceof Date ? startInput : new Date(startInput);
                const endDate = endInput instanceof Date ? endInput : new Date(endInput);
                filters.push('(start_date <= ? AND end_date >= ?)');
                params.push(endDate, startDate);
            } else if (startInput) {
                const startDate = startInput instanceof Date ? startInput : new Date(startInput);
                filters.push('end_date >= ?');
                params.push(startDate);
            } else if (endInput) {
                const endDate = endInput instanceof Date ? endInput : new Date(endInput);
                filters.push('start_date <= ?');
                params.push(endDate);
            }

            const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

            const sql = `
                SELECT 
                    COUNT(*) as total_projects,
                    SUM(CASE WHEN status = 'planning' THEN 1 ELSE 0 END) as planning_count,
                    SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_count,
                    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_count,
                    SUM(CASE WHEN status = 'paused' THEN 1 ELSE 0 END) as paused_count,
                    SUM(budget) as total_budget,
                    AVG(progress) as avg_progress
                FROM projects
                ${whereClause}
            `;
            return await this.db.findOne(sql, params);
        } catch (error) {
            console.error('Error in Project getStats:', error);
            throw error;
        }
    }

    // Lấy dự án của staff
    async getProjectsByStaff(staffId) {
        try {
            const sql = `
                SELECT p.*, pc.name as category_name, pm.role
                FROM projects p
                LEFT JOIN project_categories pc ON p.category_id = pc.id
                LEFT JOIN project_members pm ON p.id = pm.project_id
                WHERE pm.staff_id = ? OR p.leader_id = ?
                ORDER BY p.start_date DESC
            `;
            return await this.db.findMany(sql, [staffId, staffId]);
        } catch (error) {
            console.error('Error in Project getProjectsByStaff:', error);
            throw error;
        }
    }
}

module.exports = Project;