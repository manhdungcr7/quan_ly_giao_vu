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
}

module.exports = Department;
