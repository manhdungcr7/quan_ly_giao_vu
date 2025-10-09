const BaseModel = require('./BaseModel');

class WorkbookEntry extends BaseModel {
  static tableName = 'workbook_entries';
  static db = require('../../config/database');

  /**
   * Lấy tất cả entries của một workbook
   */
  static async findByWorkbook(workbookId) {
    const query = `
      SELECT * FROM ${WorkbookEntry.tableName}
      WHERE workbook_id = ?
      ORDER BY day_of_week ASC
    `;
    
    const result = await WorkbookEntry.db.query(query, [workbookId]);
    return Array.isArray(result) ? result : [];
  }

  /**
   * Lấy entry theo ngày cụ thể
   */
  static async findByDay(workbookId, dayOfWeek) {
    const query = `
      SELECT * FROM ${WorkbookEntry.tableName}
      WHERE workbook_id = ?
      AND day_of_week = ?
    `;
    
    try {
      const result = await WorkbookEntry.db.query(query, [workbookId, dayOfWeek]);
      
      // Handle mysql2 result format: [rows, fields]
      let rows;
      if (Array.isArray(result)) {
        // Check if it's [rows, fields] format
        if (Array.isArray(result[0])) {
          rows = result[0]; // mysql2 format
        } else {
          rows = result; // Already just rows
        }
      } else {
        rows = [result];
      }
      
      console.log('🔍 findByDay result:', { 
        workbookId, 
        dayOfWeek, 
        foundRows: rows.length,
        firstRow: rows[0] ? { id: rows[0].id, workbook_id: rows[0].workbook_id, day_of_week: rows[0].day_of_week } : null
      });
      
      return rows && rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('❌ Error in findByDay:', error);
      return null;
    }
  }

  /**
   * Tạo hoặc cập nhật entry
   */
  static async createOrUpdate(data) {
    console.log('🔄 createOrUpdate called with:', { 
      workbook_id: data.workbook_id, 
      day_of_week: data.day_of_week,
      tasks_length: data.tasks?.length 
    });
    
    // Kiểm tra xem entry đã tồn tại chưa
    const existing = await this.findByDay(data.workbook_id, data.day_of_week);
    
    console.log('🔍 Existing entry:', existing ? { id: existing.id, workbook_id: existing.workbook_id, day_of_week: existing.day_of_week } : 'NOT FOUND');
    
    if (existing) {
      // Update
      console.log('🔄 Updating existing entry:', existing.id);
      const query = `
        UPDATE ${WorkbookEntry.tableName}
        SET main_focus = ?,
            tasks = ?,
            notes = ?,
            progress = ?,
            updated_at = NOW()
        WHERE id = ?
      `;
      
      await WorkbookEntry.db.query(query, [
        data.main_focus,
        data.tasks,
        data.notes,
        data.progress || 0,
        existing.id
      ]);
      
      console.log('✅ Updated entry:', existing.id);
      return existing.id;
    } else {
      // Create
      console.log('➕ Creating new entry');
      const query = `
        INSERT INTO ${WorkbookEntry.tableName}
        (workbook_id, day_of_week, main_focus, tasks, notes, progress, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;
      
      const result = await WorkbookEntry.db.query(query, [
        data.workbook_id,
        data.day_of_week,
        data.main_focus,
        data.tasks,
        data.notes,
        data.progress || 0
      ]);
      
      // Handle mysql2 result format safely
      const insertResult = Array.isArray(result) ? result[0] : result;
      console.log('✅ Created entry:', insertResult.insertId);
      return insertResult.insertId;
    }
  }

  /**
   * Xóa entry
   */
  static async delete(id) {
    const query = `DELETE FROM ${WorkbookEntry.tableName} WHERE id = ?`;
    await WorkbookEntry.db.query(query, [id]);
    return true;
  }

  /**
   * Cập nhật progress
   */
  static async updateProgress(id, progress) {
    const query = `
      UPDATE ${WorkbookEntry.tableName}
      SET progress = ?,
          updated_at = NOW()
      WHERE id = ?
    `;
    
    await WorkbookEntry.db.query(query, [progress, id]);
    return true;
  }

  /**
   * Lấy thống kê progress của tuần
   */
  static async getWeekProgress(workbookId) {
    const query = `
      SELECT 
        AVG(progress) as avg,
        SUM(CASE WHEN progress = 100 THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN progress > 0 AND progress < 100 THEN 1 ELSE 0 END) as inProgress,
        COUNT(*) as total
      FROM ${WorkbookEntry.tableName}
      WHERE workbook_id = ?
    `;
    
    const dbResult = await WorkbookEntry.db.query(query, [workbookId]);
    // Handle mysql2 result format safely
    const [rows] = Array.isArray(dbResult) ? dbResult : [dbResult];
    const result = rows && rows.length > 0 ? rows[0] : null;
    
    return result || { avg: 0, completed: 0, inProgress: 0, total: 0 };
  }
}

module.exports = WorkbookEntry;
