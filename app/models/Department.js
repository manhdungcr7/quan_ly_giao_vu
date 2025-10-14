const BaseModel = require('./BaseModel');

class Department extends BaseModel {
  constructor() {
    super('departments');
  }

  async listActive(options = {}) {
    const sql = `
      SELECT id, name, code
      FROM departments
      WHERE is_active = 1
      ORDER BY ${options.orderBy === 'code' ? 'code' : 'name'} ASC
    `;
    return this.db.findMany(sql);
  }

  async findAllWithDetails() {
    const sql = `
      SELECT d.*, 
             parent.name AS parent_name,
             parent.code AS parent_code,
             u.full_name AS head_name,
             u.email AS head_email,
             u.phone AS head_phone
      FROM departments d
      LEFT JOIN departments parent ON d.parent_id = parent.id
      LEFT JOIN users u ON d.head_id = u.id
      ORDER BY d.is_active DESC, (d.parent_id IS NOT NULL), d.name ASC
    `;
    return this.db.findMany(sql);
  }

  async countByActivity() {
    const rows = await this.db.findMany(
      'SELECT is_active AS active_flag, COUNT(*) AS total FROM departments GROUP BY is_active'
    );
    const summary = { active: 0, inactive: 0 };
    rows.forEach((row) => {
      if (Number(row.active_flag) === 1) {
        summary.active = Number(row.total) || 0;
      } else {
        summary.inactive = Number(row.total) || 0;
      }
    });
    return summary;
  }

  async listSelectableParents(options = {}) {
    const params = [];
    const conditions = [];

    if (!options.includeInactive) {
      conditions.push('is_active = 1');
    }

    if (options.excludeId) {
      conditions.push('id <> ?');
      params.push(options.excludeId);
    }

    let sql = `
      SELECT id, name, code, parent_id
      FROM departments
    `;

    if (conditions.length) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    sql += ' ORDER BY name ASC';
    return this.db.findMany(sql, params);
  }

  async findByCode(code) {
    if (!code) {
      return null;
    }
    return this.findOne({ code });
  }
}

module.exports = Department;
