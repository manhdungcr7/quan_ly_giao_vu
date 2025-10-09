const BaseModel = require('./BaseModel');

class EvaluationCriteria extends BaseModel {
  constructor() {
    super('evaluation_criteria');
  }

  /**
   * Lấy tất cả tiêu chí đang hoạt động
   */
  async getAllActive(category = null) {
    try {
      let sql = 'SELECT * FROM evaluation_criteria WHERE is_active = TRUE';
      const params = [];

      if (category) {
        sql += ' AND category = ?';
        params.push(category);
      }

      sql += ' ORDER BY display_order ASC, category ASC';

      return await this.db.findMany(sql, params);
    } catch (error) {
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
    try {
      const result = await this.create(data);
      return result;
    } catch (error) {
      console.error('Error in EvaluationCriteria.createCriteria:', error);
      throw error;
    }
  }

  /**
   * Cập nhật tiêu chí
   */
  async updateCriteria(id, data) {
    try {
      const result = await this.update(id, data);
      return result;
    } catch (error) {
      console.error('Error in EvaluationCriteria.updateCriteria:', error);
      throw error;
    }
  }

  /**
   * Lấy tiêu chí theo period
   */
  async getCriteriaByPeriod(periodId) {
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
      console.error('Error in EvaluationCriteria.getCriteriaByPeriod:', error);
      return [];
    }
  }
}

module.exports = EvaluationCriteria;
