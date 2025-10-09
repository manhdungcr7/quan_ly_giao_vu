const BaseModel = require('./BaseModel');

class Asset extends BaseModel {
    constructor() {
        super('assets');
    }

    // Láº¥y tÃ i sáº£n vá»›i thÃ´ng tin chi tiáº¿t
    async findWithDetails(id) {
        try {
            const sql = `
                SELECT a.*, 
                       ac.name as category_name,
                       s.staff_code, u.full_name as assigned_to_name,
                       u_created.full_name as created_by_name
                FROM assets a
                LEFT JOIN asset_categories ac ON a.category_id = ac.id
                LEFT JOIN staff s ON a.assigned_to = s.id
                LEFT JOIN users u ON s.user_id = u.id
                LEFT JOIN users u_created ON a.created_by = u_created.id
                WHERE a.id = ?
            `;
            return await this.db.findOne(sql, [id]);
        } catch (error) {
            console.error('Error in Asset findWithDetails:', error);
            throw error;
        }
    }

    // Láº¥y danh sÃ¡ch tÃ i sáº£n vá»›i bá»™ lá»c
    async getAssetsWithFilters(page = 1, limit = 20, filters = {}) {
        try {
            const numericLimit = Number.parseInt(limit, 10) || 20;
            const numericPage = Number.parseInt(page, 10) || 1;
            const offset = (numericPage - 1) * numericLimit;
            let whereClause = 'WHERE 1=1';
            const filterParams = [];

            if (filters.category_id) {
                whereClause += ' AND a.category_id = ?';
                filterParams.push(filters.category_id);
            }

            if (filters.status) {
                whereClause += ' AND a.status = ?';
                filterParams.push(filters.status);
            }

            if (filters.condition_rating) {
                whereClause += ' AND a.condition_rating = ?';
                filterParams.push(filters.condition_rating);
            }

            if (filters.assigned_to) {
                whereClause += ' AND a.assigned_to = ?';
                filterParams.push(filters.assigned_to);
            }

            if (filters.search) {
                whereClause += ' AND (a.asset_code LIKE ? OR a.name LIKE ? OR a.serial_number LIKE ?)';
                const searchTerm = `%${filters.search}%`;
                filterParams.push(searchTerm, searchTerm, searchTerm);
            }

            const sql = `
                SELECT a.id, a.asset_code, a.name, a.status, a.condition_rating,
                       a.purchase_date, a.current_value, a.location,
                       ac.name as category_name,
                       u.full_name as assigned_to_name
                FROM assets a
                LEFT JOIN asset_categories ac ON a.category_id = ac.id
                LEFT JOIN staff s ON a.assigned_to = s.id
                LEFT JOIN users u ON s.user_id = u.id
                ${whereClause}
                ORDER BY a.created_at DESC
                LIMIT ${numericLimit} OFFSET ${offset}
            `;
            const assets = await this.db.findMany(sql, filterParams);

            // Äáº¿m tá»•ng sá»‘
            const countSql = `
                SELECT COUNT(*) as total
                FROM assets a
                ${whereClause}
            `;
            const countResult = await this.db.findOne(countSql, filterParams);
            const total = countResult?.total || 0;

            return {
                data: assets,
                pagination: {
                    page: numericPage,
                    limit: numericLimit,
                    total,
                    totalPages: Math.max(1, Math.ceil(total / numericLimit)),
                    hasNext: numericPage < Math.ceil(total / numericLimit),
                    hasPrev: numericPage > 1
                }
            };
        } catch (error) {
            console.error('Error in Asset getAssetsWithFilters:', error);
            throw error;
        }
    }

    // Láº¥y thá»‘ng kÃª tÃ i sáº£n
    async getStats() {
        try {
            const sql = `
                SELECT 
                    COUNT(*) as total_assets,
                    SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available_count,
                    SUM(CASE WHEN status = 'in_use' THEN 1 ELSE 0 END) as in_use_count,
                    SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) as maintenance_count,
                    SUM(CASE WHEN status = 'retired' THEN 1 ELSE 0 END) as retired_count,
                    SUM(current_value) as total_value,
                    AVG(current_value) as avg_value
                FROM assets
            `;
            return await this.db.findOne(sql);
        } catch (error) {
            console.error('Error in Asset getStats:', error);
            throw error;
        }
    }

    // Láº¥y lá»‹ch sá»­ báº£o trÃ¬
    async getMaintenanceHistory(assetId) {
        try {
            const sql = `
                SELECT am.*, u.full_name as created_by_name
                FROM asset_maintenance am
                LEFT JOIN users u ON am.created_by = u.id
                WHERE am.asset_id = ?
                ORDER BY am.maintenance_date DESC
            `;
            return await this.db.findMany(sql, [assetId]);
        } catch (error) {
            console.error('Error in Asset getMaintenanceHistory:', error);
            throw error;
        }
    }

    // ThÃªm báº£o trÃ¬
    async addMaintenance(maintenanceData) {
        try {
            const sql = `
                INSERT INTO asset_maintenance 
                (asset_id, maintenance_date, type, description, cost, performed_by, next_maintenance_date, created_by)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;
            return await this.db.insert(sql, [
                maintenanceData.asset_id,
                maintenanceData.maintenance_date,
                maintenanceData.type,
                maintenanceData.description,
                maintenanceData.cost || 0,
                maintenanceData.performed_by,
                maintenanceData.next_maintenance_date,
                maintenanceData.created_by
            ]);
        } catch (error) {
            console.error('Error in Asset addMaintenance:', error);
            throw error;
        }
    }
    
    // Lấy danh sách categories
    async getCategories() {
        try {
            const sql = `
                SELECT id, name, description
                FROM asset_categories
                WHERE is_active = 1
                ORDER BY name
            `;
            return await this.db.findMany(sql);
        } catch (error) {
            console.error('Error in Asset getCategories:', error);
            return [];
        }
    }

    // Lấy danh sách departments
    async getDepartments() {
        try {
            const sql = `
                SELECT
                    s.id,
                    s.staff_code,
                    u.full_name,
                    d.name AS department_name,
                    p.name AS position_name
                FROM staff s
                INNER JOIN users u ON s.user_id = u.id
                LEFT JOIN departments d ON s.department_id = d.id
                LEFT JOIN positions p ON s.position_id = p.id
                WHERE s.status = 'active'
                ORDER BY u.full_name
            `;
            return await this.db.findMany(sql);
        } catch (error) {
            console.error('Error in Asset getDepartments:', error);
            return [];
        }
    }

    // Tạo tài sản mới  
    async create(data) {
        try {
            const sql = `INSERT INTO assets (asset_code, name, category_id, serial_number, model, brand, purchase_date, purchase_price, current_value, warranty_expiry, status, condition_rating, location, assigned_to, notes, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`;
            const result = await this.db.insert(sql, [
                data.asset_code,
                data.name,
                data.category_id,
                data.serial_number,
                data.model,
                data.brand,
                data.purchase_date,
                data.purchase_price,
                data.current_value,
                data.warranty_expiry,
                data.status,
                data.condition_rating,
                data.location,
                data.assigned_to,
                data.notes,
                data.created_by
            ]);
            return result;
        } catch (error) {
            console.error('Error in Asset create:', error);
            throw error;
        }
    }

    // Lấy theo ID
    async getById(id) {
        try {
            const sql = `SELECT a.*, ac.name as category_name, s.staff_code, u.full_name as assigned_to_name FROM assets a LEFT JOIN asset_categories ac ON a.category_id = ac.id LEFT JOIN staff s ON a.assigned_to = s.id LEFT JOIN users u ON s.user_id = u.id WHERE a.id = ?`;
            return await this.db.findOne(sql, [id]);
        } catch (error) {
            console.error('Error in Asset getById (primary query):', error);
            try {
                return await this.db.findOne('SELECT * FROM assets WHERE id = ?', [id]);
            } catch (fallbackError) {
                console.error('Error in Asset getById fallback query:', fallbackError);
                throw fallbackError;
            }
        }
    }

    // Cập nhật
    async update(id, data) {
        try {
            const sql = `UPDATE assets SET asset_code = ?, name = ?, category_id = ?, serial_number = ?, model = ?, brand = ?, purchase_date = ?, purchase_price = ?, current_value = ?, warranty_expiry = ?, status = ?, condition_rating = ?, location = ?, assigned_to = ?, notes = ?, updated_at = NOW() WHERE id = ?`;
            return await this.db.update(sql, [data.asset_code, data.name, data.category_id, data.serial_number, data.model, data.brand, data.purchase_date, data.purchase_price, data.current_value, data.warranty_expiry, data.status, data.condition_rating, data.location, data.assigned_to, data.notes, id]);
        } catch (error) {
            console.error('Error in Asset update:', error);
            throw error;
        }
    }

    // Xóa
    async delete(id) {
        try {
            const sql = 'DELETE FROM assets WHERE id = ?';
            return await this.db.delete(sql, [id]);
        } catch (error) {
            console.error('Error in Asset delete:', error);
            throw error;
        }
    }
}

module.exports = Asset;
