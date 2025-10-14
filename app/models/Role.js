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

    async findByName(name) {
        if (!name) return null;
        return this.findOne({ name });
    }

    async upsertByName(name, payload = {}) {
        if (!name) {
            throw new Error('Role name is required for upsert');
        }

        const existing = await this.findByName(name);
        if (existing) {
            if (payload && Object.keys(payload).length) {
                await this.update(existing.id, payload);
            }
            return { id: existing.id, name, wasCreated: false };
        }

        const data = {
            name,
            is_active: 1,
            ...payload
        };

        const result = await this.create(data);
        return { id: result.insertId, name, wasCreated: true };
    }
}

module.exports = Role;
