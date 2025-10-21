const BaseModel = require('./BaseModel');
const { ensureEvaluationSchema } = require('./helpers/evaluationSchemaEnsurer');

class EvaluationCriteria extends BaseModel {
  constructor() {
    super('evaluation_criteria');
  }

  /**
   * Lấy tất cả tiêu chí đang hoạt động
   */
  async getAllActive(category = null) {
    await ensureEvaluationSchema(this.db);

    const runQuery = async () => {
      let sql = 'SELECT * FROM evaluation_criteria WHERE is_active = TRUE';
      const params = [];

      if (category) {
        sql += ' AND category = ?';
        params.push(category);
      }

      sql += ' ORDER BY display_order ASC, category ASC';

      return await this.db.findMany(sql, params);
    };

    try {
      return await runQuery();
    } catch (error) {
      if (error?.code === 'ER_NO_SUCH_TABLE') {
        const ensured = await ensureEvaluationSchema(this.db, true);
        if (ensured) {
          try {
            return await runQuery();
          } catch (retryError) {
            console.error('Error in EvaluationCriteria.getAllActive after ensure:', retryError);
            return [];
          }
        }
      }
      console.error('Error in EvaluationCriteria.getAllActive:', error);
      return [];
    }
  }

  /**
   * Lấy tiêu chí theo category
   */
  async getByCategory() {
    try {
      const criteria = await this.getAllActive();
      const grouped = {
        teaching: [],
        research: [],
        service: [],
        professional: [],
        other: []
      };

      criteria.forEach(item => {
        if (grouped[item.category]) {
          grouped[item.category].push(item);
        }
      });

      return grouped;
    } catch (error) {
      console.error('Error in EvaluationCriteria.getByCategory:', error);
      return { teaching: [], research: [], service: [], professional: [], other: [] };
    }
  }

  /**
   * Tạo tiêu chí mới
   */
  async createCriteria(data) {
    await ensureEvaluationSchema(this.db);

    try {
      const result = await this.create(data);
      return result;
    } catch (error) {
      if (error?.code === 'ER_NO_SUCH_TABLE') {
        const ensured = await ensureEvaluationSchema(this.db, true);
        if (ensured) {
          return await this.create(data);
        }
      }
      console.error('Error in EvaluationCriteria.createCriteria:', error);
      throw error;
    }
  }

  /**
   * Cập nhật tiêu chí
   */
  async updateCriteria(id, data) {
    await ensureEvaluationSchema(this.db);

    try {
      const result = await this.update(id, data);
      return result;
    } catch (error) {
      if (error?.code === 'ER_NO_SUCH_TABLE') {
        const ensured = await ensureEvaluationSchema(this.db, true);
        if (ensured) {
          return await this.update(id, data);
        }
      }
      console.error('Error in EvaluationCriteria.updateCriteria:', error);
      throw error;
    }
  }

  async deleteCriteria(id) {
    await ensureEvaluationSchema(this.db);

    try {
      return await this.delete(id);
    } catch (error) {
      if (error?.code === 'ER_NO_SUCH_TABLE') {
        const ensured = await ensureEvaluationSchema(this.db, true);
        if (ensured) {
          return await this.delete(id);
        }
      }
      console.error('Error in EvaluationCriteria.deleteCriteria:', error);
      throw error;
    }
  }

  /**
   * Lấy tiêu chí theo period
   */
  async getCriteriaByPeriod(periodId) {
    await ensureEvaluationSchema(this.db);

    try {
      const sql = `
        SELECT ec.*, epc.weight as period_weight, epc.target_value, 
               epc.excellent_value, epc.is_required as period_required
        FROM evaluation_criteria ec
        INNER JOIN evaluation_period_criteria epc ON ec.id = epc.criteria_id
        WHERE epc.period_id = ? AND ec.is_active = TRUE
        ORDER BY ec.display_order ASC
      `;
      return await this.db.findMany(sql, [periodId]);
    } catch (error) {
      if (error?.code === 'ER_NO_SUCH_TABLE') {
        const ensured = await ensureEvaluationSchema(this.db, true);
        if (ensured) {
          return await this.db.findMany(`
            SELECT ec.*, epc.weight as period_weight, epc.target_value, 
                   epc.excellent_value, epc.is_required as period_required
            FROM evaluation_criteria ec
            INNER JOIN evaluation_period_criteria epc ON ec.id = epc.criteria_id
            WHERE epc.period_id = ? AND ec.is_active = TRUE
            ORDER BY ec.display_order ASC
          `, [periodId]);
        }
      }
      console.error('Error in EvaluationCriteria.getCriteriaByPeriod:', error);
      return [];
    }
  }
}

module.exports = EvaluationCriteria;
