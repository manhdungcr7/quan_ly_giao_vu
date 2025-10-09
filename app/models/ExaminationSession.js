const BaseModel = require('./BaseModel');

class ExaminationSession extends BaseModel {
  static tableName = 'examination_sessions';
  static db = require('../../config/database');

  /**
   * Lấy tất cả ca thi với filter (dùng view mới có grader info)
   */
  static async findAll(filters = {}) {
    let query = `
      SELECT 
        es.*,
        ep.name as period_name,
        s.code as subject_code,
        s.name as subject_name,
    c.code as class_code,
    c.name as class_name,
    u.full_name as grader_name,
    u.email as grader_email,
    es.grader_manual_name,
        DATEDIFF(es.grading_deadline, CURDATE()) as days_until_deadline,
        (SELECT COUNT(*) FROM examination_files ef 
         WHERE ef.session_id = es.id AND ef.status = 'active') as file_count
      FROM ${this.tableName} es
      LEFT JOIN examination_periods ep ON es.period_id = ep.id
      LEFT JOIN subjects s ON es.subject_id = s.id
      LEFT JOIN classes c ON es.class_id = c.id
      LEFT JOIN users u ON es.grader_id = u.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (filters.period_id) {
      query += ' AND es.period_id = ?';
      params.push(filters.period_id);
    }
    
    if (filters.status) {
      query += ' AND es.status = ?';
      params.push(filters.status);
    }
    
    if (filters.search) {
      query += ' AND (es.exam_name LIKE ? OR s.name LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    if (filters.grader) {
      query += ' AND ((u.full_name LIKE ?) OR (es.grader_manual_name LIKE ?))';
      params.push(`%${filters.grader}%`, `%${filters.grader}%`);
    }
    
    query += ' ORDER BY es.exam_date DESC, es.exam_time ASC';
    
    const rows = await this.db.query(query, params);
    return rows;
  }

  /**
   * Lấy một ca thi theo ID (với thông tin grader)
   */
  static async findById(id) {
    const query = `
      SELECT 
        es.*,
        ep.name as period_name,
        s.code as subject_code,
    s.name as subject_name,
    c.code as class_code,
    c.name as class_name,
    u.full_name as grader_name,
    u.email as grader_email,
    es.grader_manual_name
      FROM ${this.tableName} es
      LEFT JOIN examination_periods ep ON es.period_id = ep.id
      LEFT JOIN subjects s ON es.subject_id = s.id
      LEFT JOIN classes c ON es.class_id = c.id
      LEFT JOIN users u ON es.grader_id = u.id
      WHERE es.id = ?
    `;
    
    const rows = await this.db.query(query, [id]);
    return rows && rows.length ? rows[0] : null;
  }

  /**
   * Tạo ca thi mới (hỗ trợ grader_id và grading_deadline)
   */
  static async create(data) {
    const query = `
      INSERT INTO ${this.tableName} 
      (period_id, subject_id, class_id, exam_code, exam_name, 
       exam_date, exam_time, duration, room, building, student_count, 
       expected_copies, grader_id, grader_manual_name, grading_deadline, link, exam_type, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const insertResult = await this.db.insert(query, [
      data.period_id,
      data.subject_id,
      data.class_id || null,
      data.exam_code,
      data.exam_name,
      data.exam_date,
      data.exam_time,
      data.duration || 90,
      data.room || null,
      data.building || null,
      data.student_count || 0,
      data.expected_copies || null,
      data.grader_id || null,
      data.grader_manual_name || null,
      data.grading_deadline || null,
      data.link || null,
      data.exam_type || 'offline',
      data.status || 'scheduled',
      data.notes || null
    ]);
    
    return insertResult.insertId;
  }

  /**
   * Cập nhật ca thi
   */
  static async update(id, data) {
    const updates = [];
    const params = [];
    
    Object.keys(data).forEach(key => {
      // Skip undefined to avoid setting columns to undefined
      if (typeof data[key] === 'undefined') return;
      updates.push(`${key} = ?`);
      params.push(data[key]);
    });
    
    if (updates.length === 0) return; // nothing to update

    params.push(id);
    
    const query = `UPDATE ${this.tableName} SET ${updates.join(', ')} WHERE id = ?`;
    await this.db.update(query, params);
  }

  /**
   * Xóa ca thi
   */
  static async delete(id) {
    const query = `DELETE FROM ${this.tableName} WHERE id = ?`;
    await this.db.delete(query, [id]);
  }

  /**
   * Gửi nhắc việc cho cán bộ chấm thi
   */
  static async sendReminder(sessionId, sentBy) {
    // Lấy thông tin ca thi và grader
    const session = await this.findById(sessionId);
    
    if (!session || !session.grader_id) {
      throw new Error('Không tìm thấy ca thi hoặc chưa phân công cán bộ chấm');
    }
    
    // Lưu lịch sử nhắc việc
    const query = `
      INSERT INTO examination_reminders 
      (session_id, reminder_type, recipient_id, recipient_email, subject, message, status, sent_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const subject = `Nhắc việc: Hạn chấm bài thi - ${session.exam_name}`;
    const message = `Kính gửi ${session.grader_name},\n\nĐây là nhắc việc về ca thi:\n- Môn: ${session.subject_name}\n- Ngày thi: ${new Date(session.exam_date).toLocaleDateString('vi-VN')}\n- Hạn chấm: ${session.grading_deadline ? new Date(session.grading_deadline).toLocaleDateString('vi-VN') : 'Chưa xác định'}\n\nVui lòng hoàn thành chấm bài đúng hạn.\n\nTrân trọng.`;
    
    await this.db.insert(query, [
      sessionId,
      'grading',
      session.grader_id,
      session.grader_email,
      subject,
      message,
      'sent',
      sentBy
    ]);
    
    // Cập nhật trạng thái đã gửi nhắc
    await this.db.update(
      `UPDATE ${this.tableName} SET reminder_sent = TRUE, reminder_sent_at = NOW() WHERE id = ?`,
      [sessionId]
    );
    
    return true;
  }

  /**
   * Lấy danh sách ca thi cần nhắc việc
   */
  static async getSessionsNeedingReminder() {
    const query = `
      SELECT 
        es.*,
        u.full_name as grader_name,
        u.email as grader_email,
        DATEDIFF(es.grading_deadline, CURDATE()) as days_until_deadline
      FROM ${this.tableName} es
      LEFT JOIN users u ON es.grader_id = u.id
      WHERE es.grader_id IS NOT NULL
        AND es.grading_deadline IS NOT NULL
        AND es.reminder_sent = FALSE
        AND DATEDIFF(es.grading_deadline, CURDATE()) <= 3
        AND DATEDIFF(es.grading_deadline, CURDATE()) >= 0
      ORDER BY es.grading_deadline ASC
    `;
    
    const rows = await this.db.query(query);
    return rows;
  }

  /**
   * Lấy danh sách ca thi có hạn chấm bài trong khoảng thời gian cho trang nhắc việc
   * @param {Object} options
   * @param {number} options.daysAhead - Số ngày tới để lấy hạn (mặc định 14)
   * @param {number} options.daysBehind - Số ngày đã trễ vẫn hiển thị (mặc định 7)
   */
  static async getGradingDeadlines({ daysAhead = 14, daysBehind = 7 } = {}) {
    const query = `
      SELECT 
        es.*,
        u.full_name as grader_name,
        u.email as grader_email,
        DATEDIFF(es.grading_deadline, CURDATE()) as days_until_deadline
      FROM ${this.tableName} es
      LEFT JOIN users u ON es.grader_id = u.id
      WHERE es.grading_deadline IS NOT NULL
        AND (es.status IS NULL OR es.status NOT IN ('completed', 'cancelled', 'archived'))
        AND DATEDIFF(es.grading_deadline, CURDATE()) <= ?
        AND DATEDIFF(es.grading_deadline, CURDATE()) >= -?
      ORDER BY es.grading_deadline ASC
    `;

    const rows = await this.db.query(query, [daysAhead, daysBehind]);
    return rows;
  }
}

module.exports = ExaminationSession;
