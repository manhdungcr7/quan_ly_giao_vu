const BaseModel = require('./BaseModel');

class AcademicYear extends BaseModel {
    constructor() {
        super('academic_years');
    }

    async findActive() {
        return this.findAll({
            where: { status: 'active' },
            orderBy: 'start_date',
            orderDirection: 'DESC'
        });
    }

    async findByCode(code) {
        return this.findOne({ year_code: code });
    }

    async setExclusiveActive(id) {
        const numericId = Number(id);
        if (Number.isNaN(numericId)) {
            throw new Error('Invalid academic year id');
        }
        await this.db.update('UPDATE academic_years SET status = ? WHERE status = ? AND id <> ?', ['inactive', 'active', numericId]);
        await this.db.update('UPDATE academic_years SET status = ? WHERE id = ?', ['active', numericId]);
    }
}

module.exports = AcademicYear;
