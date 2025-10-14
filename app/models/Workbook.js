const BaseModel = require('./BaseModel');

class Workbook extends BaseModel {
  static tableName = 'workbooks';
  static db = require('../../config/database');

  static async findById(id) {
    const query = `SELECT * FROM ${Workbook.tableName} WHERE id = ? LIMIT 1`;
    const result = await Workbook.db.query(query, [id]);
    const rows = Array.isArray(result[0]) ? result[0] : result;
    return Array.isArray(rows) && rows.length ? rows[0] : null;
  }

  static async findByUser(userId, options = {}) {
    const { weekStart, weekEnd } = options;
    
    let query = `
      SELECT * FROM ${Workbook.tableName}
      WHERE user_id = ?
    `;
    
    const params = [userId];
    
    if (weekStart) {
      query += ' AND week_start >= ?';
      params.push(weekStart);
    }
    
    if (weekEnd) {
      query += ' AND week_end <= ?';
      params.push(weekEnd);
    }
    
    query += ' ORDER BY week_start DESC';
    
    const result = await Workbook.db.query(query, params);
    const rows = Array.isArray(result[0]) ? result[0] : result;
    return rows;
  }

  static async findByWeek(userId, weekStart, weekEnd) {
    console.log(' Workbook.findByWeek:', { userId, weekStart, weekEnd });
    const query = `
      SELECT * FROM ${Workbook.tableName}
      WHERE user_id = ?
      AND week_start = ?
      AND week_end = ?
      ORDER BY created_at DESC
      LIMIT 1
    `;
    
    const result = await Workbook.db.query(query, [userId, weekStart, weekEnd]);
    
    let rows;
    if (Array.isArray(result)) {
      if (Array.isArray(result[0])) {
        rows = result[0];
      } else {
        rows = result;
      }
    } else {
      rows = [result];
    }
    
    console.log(' findByWeek result:', { foundRows: rows.length, firstId: rows[0]?.id });
    return rows && rows.length > 0 ? rows[0] : null;
  }

  static async create(data) {
    const query = `
      INSERT INTO ${Workbook.tableName}
      (user_id, week_start, week_end, status, quick_notes, approver_id,
       approval_requested_at, approval_decision_at, approval_note,
       created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    
    const result = await Workbook.db.query(query, [
      data.user_id,
      data.week_start,
      data.week_end,
      data.status || 'draft',
      data.quick_notes || null,
      data.approver_id || null,
      data.approval_requested_at || null,
      data.approval_decision_at || null,
      data.approval_note || null
    ]);
    
    const insertResult = Array.isArray(result) ? result[0] : result;
    return insertResult.insertId;
  }

  static async updateQuickNotes(id, notes) {
    console.log(' Model: Updating quick notes for workbook:', id, 'notes length:', notes?.length);
    const query = `
      UPDATE ${Workbook.tableName}
      SET quick_notes = ?, updated_at = NOW()
      WHERE id = ?
    `;
    const result = await Workbook.db.query(query, [notes, id]);
    console.log(' Model: Quick notes update result:', result);
    return true;
  }

  static async getQuickNotes(id) {
    console.log(' Model: Getting quick notes for workbook:', id);
    const query = `SELECT quick_notes FROM ${Workbook.tableName} WHERE id = ?`;
    const result = await Workbook.db.query(query, [id]);
    const rows = Array.isArray(result[0]) ? result[0] : result;
    console.log(' Model: Query result:', rows);
    const notes = rows && rows.length > 0 ? rows[0].quick_notes : '';
    console.log(' Model: Returning notes:', notes ? notes.substring(0, 50) + '...' : '(empty)');
    return notes || '';
  }

  static async updateStatus(id, status, extraUpdates = {}) {
    const setClauses = ['status = ?', 'updated_at = NOW()'];
    const params = [status];

    if (Object.prototype.hasOwnProperty.call(extraUpdates, 'approver_id')) {
      setClauses.push('approver_id = ?');
      params.push(extraUpdates.approver_id);
    }

    if (Object.prototype.hasOwnProperty.call(extraUpdates, 'approval_requested_at')) {
      setClauses.push('approval_requested_at = ?');
      params.push(extraUpdates.approval_requested_at);
    }

    if (Object.prototype.hasOwnProperty.call(extraUpdates, 'approval_decision_at')) {
      setClauses.push('approval_decision_at = ?');
      params.push(extraUpdates.approval_decision_at);
    }

    if (Object.prototype.hasOwnProperty.call(extraUpdates, 'approval_note')) {
      setClauses.push('approval_note = ?');
      params.push(extraUpdates.approval_note);
    }

    const query = `
      UPDATE ${Workbook.tableName}
      SET ${setClauses.join(', ')}
      WHERE id = ?
    `;

    params.push(id);

    await Workbook.db.query(query, params);
    return true;
  }

  static async getPendingApprovalsForApprover(approverId, limit = 10) {
    if (!approverId) {
      return [];
    }

    const limitNumber = Number.isFinite(Number(limit)) ? Number(limit) : 10;
    const limitValue = Math.max(1, Math.min(50, Math.floor(limitNumber)));

    const query = `
      SELECT w.*, u.full_name AS owner_name,
             r.name AS owner_role
      FROM ${Workbook.tableName} w
      INNER JOIN users u ON w.user_id = u.id
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE w.approver_id = ?
        AND w.status = 'submitted'
      ORDER BY w.approval_requested_at DESC
      LIMIT ${limitValue}
    `;

    const result = await Workbook.db.query(query, [approverId]);
    return Array.isArray(result[0]) ? result[0] : result;
  }

  static async delete(id) {
    const query = `DELETE FROM ${Workbook.tableName} WHERE id = ?`;
    await Workbook.db.query(query, [id]);
    return true;
  }
}

module.exports = Workbook;
