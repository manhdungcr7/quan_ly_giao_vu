const BaseModel = require('./BaseModel');

class EvaluationPeriod extends BaseModel {
  constructor() {
    super('evaluation_periods');
  }

  /**
   * Lấy đợt đánh giá đang active
   */
  async getActivePeriod() {
    try {
      const sql = `
        SELECT * FROM evaluation_periods 
        WHERE status = 'active' 
        ORDER BY start_date DESC 
        LIMIT 1
      `;
      return await this.db.findOne(sql);
    } catch (error) {
      console.error('Error in EvaluationPeriod.getActivePeriod:', error);
      return null;
    }
  }

  /**
   * Lấy tất cả đợt đánh giá
   */
  async getAllPeriods(academicYear = null) {
    try {
      let sql = 'SELECT * FROM evaluation_periods';
      const params = [];

      if (academicYear) {
        sql += ' WHERE academic_year = ?';
        params.push(academicYear);
      }

      sql += ' ORDER BY start_date DESC';

      return await this.db.findMany(sql, params);
    } catch (error) {
      console.error('Error in EvaluationPeriod.getAllPeriods:', error);
      return [];
    }
  }

  /**
   * Tạo đợt đánh giá mới và sao chép tiêu chí từ template
   */
  async createPeriodWithCriteria(periodData, copyFromPeriodId = null) {
    const connection = await this.db.getConnection();
    
    try {
      await connection.beginTransaction();

      // Tạo period mới
      const [periodResult] = await connection.query(
        `INSERT INTO evaluation_periods (name, academic_year, semester, start_date, end_date, evaluation_deadline, status, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          periodData.name,
          periodData.academic_year,
          periodData.semester,
          periodData.start_date,
          periodData.end_date,
          periodData.evaluation_deadline,
          periodData.status || 'draft',
          periodData.notes
        ]
      );

      const newPeriodId = periodResult.insertId;

      // Sao chép tiêu chí từ period khác hoặc từ tiêu chí mặc định
      if (copyFromPeriodId) {
        await connection.query(
          `INSERT INTO evaluation_period_criteria (period_id, criteria_id, weight, target_value, excellent_value, is_required)
           SELECT ?, criteria_id, weight, target_value, excellent_value, is_required
           FROM evaluation_period_criteria
           WHERE period_id = ?`,
          [newPeriodId, copyFromPeriodId]
        );
      } else {
        // Sao chép tất cả tiêu chí active với cấu hình mặc định
        await connection.query(
          `INSERT INTO evaluation_period_criteria (period_id, criteria_id, weight, is_required)
           SELECT ?, id, weight, is_required
           FROM evaluation_criteria
           WHERE is_active = TRUE`,
          [newPeriodId]
        );
      }

      await connection.commit();
      return { id: newPeriodId, ...periodData };
    } catch (error) {
      await connection.rollback();
      console.error('Error in EvaluationPeriod.createPeriodWithCriteria:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Thêm một tiêu chí vào đợt đánh giá
   */
  async addCriteriaToPeriod(periodId, criteriaId, config = {}) {
    try {
      const sql = `
        INSERT INTO evaluation_period_criteria
          (period_id, criteria_id, weight, target_value, excellent_value, is_required, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          weight = VALUES(weight),
          target_value = VALUES(target_value),
          excellent_value = VALUES(excellent_value),
          is_required = VALUES(is_required),
          notes = VALUES(notes)
      `;

      const params = [
        periodId,
        criteriaId,
        config.weight ?? 0,
        config.target_value ?? null,
        config.excellent_value ?? null,
        config.is_required ? 1 : 0,
        config.notes ?? null
      ];

      await this.db.execute(sql, params);
      return true;
    } catch (error) {
      console.error('Error in EvaluationPeriod.addCriteriaToPeriod:', error);
      throw error;
    }
  }
}

module.exports = EvaluationPeriod;
