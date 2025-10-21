const BaseModel = require('./BaseModel');

class ExaminationSession extends BaseModel {
  static tableName = 'examination_sessions';
  static db = require('../../config/database');

  /**
   * Lấy tất cả ca thi với filter (dùng view mới có grader info)
   */
  static async findAll(filters = {}) {
    const hasFilesTable = await this.tableExists('examination_files');
    const fileCountSelect = hasFilesTable
      ? `(SELECT COUNT(*) FROM examination_files ef WHERE ef.session_id = es.id AND ef.status = 'active')`
      : '0';

    const supportsSecondaryGrader = await this.supportsSecondaryGrader();

    const selectFields = [
      'es.*',
      'ep.name as period_name',
      's.code as subject_code',
      's.name as subject_name',
  's.credits as subject_credits',
      'c.code as class_code',
      'c.name as class_name',
      'u.full_name as grader_name',
      'u.email as grader_email',
      'es.grader_manual_name',
      'DATEDIFF(es.grading_deadline, CURDATE()) as days_until_deadline',
      `${fileCountSelect} as file_count`
    ];

    if (supportsSecondaryGrader) {
      selectFields.push(
        'es.grader2_id',
        'es.grader2_manual_name',
        'u2.full_name as grader2_name',
        'u2.email as grader2_email'
      );
    } else {
      selectFields.push(
        'NULL as grader2_id',
        'NULL as grader2_manual_name',
        'NULL as grader2_name',
        'NULL as grader2_email'
      );
    }

    let query = `
      SELECT 
        ${selectFields.join(',\n        ')}
      FROM ${this.tableName} es
      LEFT JOIN examination_periods ep ON es.period_id = ep.id
      LEFT JOIN subjects s ON es.subject_id = s.id
      LEFT JOIN classes c ON es.class_id = c.id
      LEFT JOIN users u ON es.grader_id = u.id
      ${supportsSecondaryGrader ? 'LEFT JOIN users u2 ON es.grader2_id = u2.id' : ''}
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
      if (supportsSecondaryGrader) {
        query += ' AND ((u.full_name LIKE ?) OR (es.grader_manual_name LIKE ?) OR (u2.full_name LIKE ?) OR (es.grader2_manual_name LIKE ?))';
        params.push(`%${filters.grader}%`, `%${filters.grader}%`, `%${filters.grader}%`, `%${filters.grader}%`);
      } else {
        query += ' AND ((u.full_name LIKE ?) OR (es.grader_manual_name LIKE ?))';
        params.push(`%${filters.grader}%`, `%${filters.grader}%`);
      }
    }
    
    query += ' ORDER BY es.exam_date DESC, es.exam_time ASC';
    
    const rows = await this.db.query(query, params);
    return rows;
  }

  /**
   * Lấy một ca thi theo ID (với thông tin grader)
   */
  static async findById(id) {
    const supportsSecondaryGrader = await this.supportsSecondaryGrader();

    const selectFields = [
      'es.*',
      'ep.name as period_name',
      's.code as subject_code',
      's.name as subject_name',
  's.credits as subject_credits',
      'c.code as class_code',
      'c.name as class_name',
      'u.full_name as grader_name',
      'u.email as grader_email',
      'es.grader_manual_name'
    ];

    if (supportsSecondaryGrader) {
      selectFields.push(
        'es.grader2_id',
        'es.grader2_manual_name',
        'u2.full_name as grader2_name',
        'u2.email as grader2_email'
      );
    } else {
      selectFields.push(
        'NULL as grader2_id',
        'NULL as grader2_manual_name',
        'NULL as grader2_name',
        'NULL as grader2_email'
      );
    }

    const query = `
      SELECT 
        ${selectFields.join(',\n        ')}
      FROM ${this.tableName} es
      LEFT JOIN examination_periods ep ON es.period_id = ep.id
      LEFT JOIN subjects s ON es.subject_id = s.id
      LEFT JOIN classes c ON es.class_id = c.id
      LEFT JOIN users u ON es.grader_id = u.id
      ${supportsSecondaryGrader ? 'LEFT JOIN users u2 ON es.grader2_id = u2.id' : ''}
      WHERE es.id = ?
    `;
    
    const rows = await this.db.query(query, [id]);
    return rows && rows.length ? rows[0] : null;
  }

  /**
   * Tạo ca thi mới (hỗ trợ grader_id và grading_deadline)
   */
  static async create(data) {
    const supportsSecondaryGrader = await this.supportsSecondaryGrader();

    const columns = [
      'period_id','subject_id','class_id','exam_code','exam_name',
      'exam_date','exam_time','duration','room','building','student_count',
      'expected_copies','grader_id','grader_manual_name','grading_deadline','link','exam_type','status','notes'
    ];
    const values = [
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
    ];

    if (supportsSecondaryGrader) {
      columns.push('grader2_id', 'grader2_manual_name');
      values.push(data.grader2_id || null, data.grader2_manual_name || null);
    }

    const placeholders = columns.map(() => '?').join(', ');
    const query = `
      INSERT INTO ${this.tableName} (${columns.join(', ')})
      VALUES (${placeholders})
    `;
    
    const insertResult = await this.db.insert(query, values);
    
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
   * Kiểm tra bảng có tồn tại hay không (có cache nhẹ tránh query lặp lại)
   */
  static async tableExists(tableName, options = {}) {
    const { forceRefresh = false } = options;

    if (!this._tableExistCache) {
      this._tableExistCache = new Map();
    }

    const now = Date.now();
    let cacheEntry = this._tableExistCache.get(tableName);
    if (typeof cacheEntry === 'boolean') {
      cacheEntry = { exists: cacheEntry, checkedAt: 0 };
    }
    const positiveTtl = 5 * 60 * 1000; // cache positive lookups for 5 minutes
    const negativeTtl = 30 * 1000; // retry missing tables every 30 seconds

    if (!forceRefresh && cacheEntry) {
      const ttl = cacheEntry.exists ? positiveTtl : negativeTtl;
      if (now - cacheEntry.checkedAt < ttl) {
        return cacheEntry.exists;
      }
    }

    const result = await this.db.query(
      'SELECT 1 FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? LIMIT 1',
      [tableName]
    );
    const exists = Array.isArray(result) && result.length > 0;
    this._tableExistCache.set(tableName, { exists, checkedAt: now });
    return exists;
  }

  static async columnExists(tableName, columnName, options = {}) {
    const { forceRefresh = false } = options;

    if (!this._columnExistCache) {
      this._columnExistCache = new Map();
    }

    const cacheKey = `${tableName}.${columnName}`;
    let cacheEntry = this._columnExistCache.get(cacheKey);
    if (typeof cacheEntry === 'boolean') {
      cacheEntry = { exists: cacheEntry, checkedAt: 0 };
    }

    const now = Date.now();
    const positiveTtl = 5 * 60 * 1000;
    const negativeTtl = 30 * 1000;

    if (!forceRefresh && cacheEntry) {
      const ttl = cacheEntry.exists ? positiveTtl : negativeTtl;
      if (now - cacheEntry.checkedAt < ttl) {
        return cacheEntry.exists;
      }
    }

    const result = await this.db.query(
      `SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ? LIMIT 1`,
      [tableName, columnName]
    );
    const exists = Array.isArray(result) && result.length > 0;
    this._columnExistCache.set(cacheKey, { exists, checkedAt: now });
    return exists;
  }

  static async supportsSecondaryGrader(options = {}) {
    if (options.forceRefresh && this._supportsSecondaryGrader !== undefined) {
      delete this._supportsSecondaryGrader;
    }

    if (this._supportsSecondaryGrader === undefined) {
      const hasId = await this.columnExists(this.tableName, 'grader2_id');
      const hasManual = await this.columnExists(this.tableName, 'grader2_manual_name');
      this._supportsSecondaryGrader = hasId && hasManual;
    }

    return this._supportsSecondaryGrader;
  }

  static async ensureSecondaryGraderColumns() {
    const table = this.tableName;
    const hasId = await this.columnExists(table, 'grader2_id');
    const hasManual = await this.columnExists(table, 'grader2_manual_name');

    const alterParts = [];

    if (!hasId) {
      alterParts.push('ADD COLUMN `grader2_id` INT NULL DEFAULT NULL COMMENT "ID cán bộ chấm thi phụ" AFTER `grader_manual_name`');
      alterParts.push('ADD INDEX `idx_grader2` (`grader2_id`)');
    }

    if (!hasManual) {
      alterParts.push('ADD COLUMN `grader2_manual_name` VARCHAR(120) NULL DEFAULT NULL COMMENT "Tên cán bộ chấm thi phụ nhập tay" AFTER `grader2_id`');
    }

    if (!alterParts.length) {
      return false;
    }

    const alterSql = `ALTER TABLE ${table} ${alterParts.join(', ')}`;
    try {
      await this.db.query(alterSql);
    } catch (error) {
      // Ignore duplicate column/index errors caused by concurrent migrations
      const duplicateCodes = new Set(['ER_DUP_FIELDNAME', 'ER_DUP_KEYNAME', 'ER_DUP_KEY']);
      if (!duplicateCodes.has(error.code)) {
        throw error;
      }
    }

    if (this._columnExistCache) {
      this._columnExistCache.delete(`${table}.grader2_id`);
      this._columnExistCache.delete(`${table}.grader2_manual_name`);
    }

    await this.supportsSecondaryGrader({ forceRefresh: true });
    return true;
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
