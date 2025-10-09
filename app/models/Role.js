const BaseModel = require('./BaseModel');

class Role extends BaseModel {
    constructor() {
        super('roles');
    }

    async getActiveRoles() {
        try {
            const sql = 'SELECT id, name FROM roles WHERE is_active = 1 ORDER BY id ASC';
            return await this.db.findMany(sql);
        } catch (error) {
            console.error('Error in Role getActiveRoles:', error);
            throw error;
        }
    }
}

module.exports = Role;
