const db = require('../../config/database');

class WorkSchedule {
  // Lấy danh sách lịch với filters
  static async findAll(filters = {}) {
    let query = `
      SELECT 
        ws.*,
        u_org.full_name as organizer_name,
        u_org.email as organizer_email,
        u_creator.full_name as creator_name,
        GROUP_CONCAT(DISTINCT sp.user_id) as participant_ids,
        GROUP_CONCAT(DISTINCT u_part.full_name SEPARATOR ', ') as participants
      FROM work_schedules ws
      LEFT JOIN users u_org ON ws.organizer_id = u_org.id
      LEFT JOIN users u_creator ON ws.created_by = u_creator.id
      LEFT JOIN schedule_participants sp ON ws.id = sp.schedule_id
      LEFT JOIN users u_part ON sp.user_id = u_part.id
      WHERE 1=1
    `;

    const params = [];

    if (filters.start_date) {
      query += ' AND ws.start_datetime >= ?';
      params.push(filters.start_date);
    }

    if (filters.end_date) {
      query += ' AND ws.end_datetime <= ?';
      params.push(filters.end_date);
    }

    if (filters.event_type) {
      query += ' AND ws.event_type = ?';
      params.push(filters.event_type);
    }

    if (filters.status) {
      query += ' AND ws.status = ?';
      params.push(filters.status);
    }

    if (filters.organizer_id) {
      query += ' AND ws.organizer_id = ?';
      params.push(filters.organizer_id);
    }

    if (filters.search) {
      query += ' AND (ws.title LIKE ? OR ws.description LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    query += ' GROUP BY ws.id ORDER BY ws.start_datetime ASC';

    const rows = await db.query(query, params);
    return rows;
  }

  // Lấy chi tiết lịch
  static async findById(id) {
    const query = `
      SELECT 
        ws.*,
        u_org.full_name as organizer_name,
        u_org.email as organizer_email,
        u_creator.full_name as creator_name
      FROM work_schedules ws
      LEFT JOIN users u_org ON ws.organizer_id = u_org.id
      LEFT JOIN users u_creator ON ws.created_by = u_creator.id
      WHERE ws.id = ?
    `;

    const rows = await db.query(query, [id]);

    if (rows.length === 0) return null;

    const schedule = rows[0];

    // Lấy participants
    const participants = await db.query(`
      SELECT 
        sp.*,
        u.full_name,
        u.email
      FROM schedule_participants sp
      JOIN users u ON sp.user_id = u.id
      WHERE sp.schedule_id = ?
    `, [id]);

    schedule.participants = participants;

    return schedule;
  }

  // Tạo lịch mới
  static async create(data = {}) {
    const allowedFields = [
      'title', 'description', 'event_type',
      'start_datetime', 'end_datetime', 'is_all_day', 'timezone',
      'recurrence_rule', 'recurrence_end_date',
      'location', 'room', 'building', 'online_meeting_url',
      'organizer_id', 'status', 'priority',
      'color', 'icon', 'tags',
      'reminder_minutes',
      'attachments', 'notes', 'public_notes',
      'created_by'
    ];

    const jsonFields = ['tags', 'attachments'];
    const columns = [];
    const placeholders = [];
    const values = [];

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(data, field) && data[field] !== undefined) {
        columns.push(field);
        placeholders.push('?');
        if (jsonFields.includes(field) && typeof data[field] === 'object') {
          values.push(JSON.stringify(data[field]));
        } else {
          values.push(data[field]);
        }
      }
    }

    if (columns.length === 0) {
      throw new Error('No valid fields provided for schedule creation');
    }

    const query = `INSERT INTO work_schedules (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`;
    const result = await db.insert(query, values);
    return result.insertId;
  }

  // Cập nhật lịch
  static async update(id, data = {}) {
    const allowedFields = [
      'title', 'description', 'event_type',
      'start_datetime', 'end_datetime', 'is_all_day', 'timezone',
      'recurrence_rule', 'recurrence_end_date',
      'location', 'room', 'building', 'online_meeting_url',
      'organizer_id', 'status', 'priority',
      'color', 'icon', 'tags',
      'reminder_minutes',
      'attachments', 'notes', 'public_notes'
    ];

    const jsonFields = ['tags', 'attachments'];
    const fields = [];
    const values = [];

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(data, field) && data[field] !== undefined) {
        fields.push(`${field} = ?`);
        if (jsonFields.includes(field) && typeof data[field] === 'object') {
          values.push(JSON.stringify(data[field]));
        } else {
          values.push(data[field]);
        }
      }
    }

    if (fields.length === 0) {
      return false;
    }

    values.push(id);
    const query = `UPDATE work_schedules SET ${fields.join(', ')} WHERE id = ?`;
    const result = await db.query(query, values);
    return result.affectedRows > 0;
  }

  // Xóa lịch
  static async delete(id) {
    const result = await db.query('DELETE FROM work_schedules WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  // Thêm participant
  static async addParticipant(scheduleId, userId, role = 'required') {
    const query = `
      INSERT INTO schedule_participants (schedule_id, user_id, role, status)
      VALUES (?, ?, ?, 'pending')
      ON DUPLICATE KEY UPDATE role = VALUES(role)
    `;
    
    await db.query(query, [scheduleId, userId, role]);
    return true;
  }

  // Xóa participant
  static async removeParticipant(scheduleId, userId) {
    const result = await db.query(
      'DELETE FROM schedule_participants WHERE schedule_id = ? AND user_id = ?',
      [scheduleId, userId]
    );
    return result.affectedRows > 0;
  }

  // Cập nhật trạng thái participant
  static async updateParticipantStatus(scheduleId, userId, status) {
    const result = await db.query(
      'UPDATE schedule_participants SET status = ?, response_at = NOW() WHERE schedule_id = ? AND user_id = ?',
      [status, scheduleId, userId]
    );
    return result.affectedRows > 0;
  }

  // Kiểm tra xung đột lịch
  static async checkConflicts(userId, startDatetime, endDatetime, excludeId = null, options = {}) {
    const filters = [];
    const params = [];

    if (userId) {
      filters.push('(ws.organizer_id = ? OR sp.user_id = ?)');
      params.push(userId, userId);
    }

    if (options?.eventType === 'teaching') {
      const room = typeof options.room === 'string' ? options.room.trim() : '';
      const location = typeof options.location === 'string' ? options.location.trim() : '';
      const roomFilters = [];

      if (room) {
        roomFilters.push('(ws.room = ?)');
        params.push(room);
      }

      if (location) {
        roomFilters.push('(ws.location = ?)');
        params.push(location);
      }

      if (roomFilters.length > 0) {
        filters.push(`(ws.event_type = 'teaching' AND (${roomFilters.join(' OR ')}))`);
      }
    }

    if (filters.length === 0) {
      filters.push('ws.organizer_id = ws.organizer_id');
    }

    let query = `
      SELECT 
        ws.id, ws.title, ws.start_datetime, ws.end_datetime,
        ws.organizer_id, ws.event_type, ws.room, ws.location
      FROM work_schedules ws
      LEFT JOIN schedule_participants sp ON ws.id = sp.schedule_id
      WHERE ws.status NOT IN ('cancelled', 'draft')
        AND (${filters.join(' OR ')})
        AND (
          (ws.start_datetime <= ? AND ws.end_datetime >= ?) OR
          (ws.start_datetime <= ? AND ws.end_datetime >= ?) OR
          (ws.start_datetime >= ? AND ws.end_datetime <= ?)
        )
    `;

    params.push(startDatetime, startDatetime, endDatetime, endDatetime, startDatetime, endDatetime);

    if (excludeId) {
      query += ' AND ws.id != ?';
      params.push(excludeId);
    }

    query += ' GROUP BY ws.id';

    const rows = await db.query(query, params);
    return rows;
  }

  static async getTeachingSchedule(startDate, endDate, options = {}) {
    const query = `
      SELECT 
        ws.*,
        u_org.full_name AS organizer_name,
        u_org.email AS organizer_email
      FROM work_schedules ws
      LEFT JOIN users u_org ON ws.organizer_id = u_org.id
      WHERE ws.event_type = 'teaching'
        AND ws.status NOT IN ('cancelled', 'draft')
        AND ws.start_datetime <= ?
        AND ws.end_datetime >= ?
      ORDER BY ws.start_datetime ASC
    `;

    const rows = await db.query(query, [endDate, startDate]);

    if (options.includeParticipants && rows.length > 0) {
      const scheduleIds = rows.map(row => row.id);
      const placeholders = scheduleIds.map(() => '?').join(',');
      const participantsQuery = `
        SELECT 
          sp.schedule_id,
          sp.user_id,
          sp.role,
          sp.status,
          u.full_name,
          u.email
        FROM schedule_participants sp
        JOIN users u ON sp.user_id = u.id
        WHERE sp.schedule_id IN (${placeholders})
      `;

      const participantsRows = await db.query(participantsQuery, scheduleIds);
      const grouped = participantsRows.reduce((acc, item) => {
        if (!acc[item.schedule_id]) {
          acc[item.schedule_id] = [];
        }
        acc[item.schedule_id].push({
          user_id: item.user_id,
          role: item.role,
          status: item.status,
          full_name: item.full_name,
          email: item.email
        });
        return acc;
      }, {});

      rows.forEach(row => {
        row.participants = grouped[row.id] || [];
      });
    }

    return rows;
  }

  // Lấy sự kiện trong khoảng thời gian (dùng cho calendar)
  static async getEventsBetween(startDate, endDate, userId = null) {
    let query = `
      SELECT 
        ws.id,
        ws.title,
        ws.description,
        ws.event_type,
        ws.start_datetime as start,
        ws.end_datetime as end,
        ws.is_all_day as allDay,
        ws.location,
        ws.room,
        ws.building,
        ws.status,
        ws.priority,
        ws.color,
        ws.icon,
        ws.organizer_id,
        u.full_name as organizer_name
      FROM work_schedules ws
      LEFT JOIN users u ON ws.organizer_id = u.id
      WHERE ws.start_datetime <= ? AND ws.end_datetime >= ?
        AND ws.status NOT IN ('cancelled', 'draft')
    `;

    const params = [endDate, startDate];

    if (userId) {
      query += ` AND (ws.organizer_id = ? OR ws.id IN (
        SELECT schedule_id FROM schedule_participants WHERE user_id = ?
      ))`;
      params.push(userId, userId);
    }

    query += ' ORDER BY ws.start_datetime';

    const rows = await db.query(query, params);

    // Parse JSON fields và format cho FullCalendar
    return rows.map(row => ({
      id: row.id,
      title: row.title,
      start: row.start,
      end: row.end,
      allDay: Boolean(row.allDay),
      backgroundColor: row.color || this.getColorByType(row.event_type),
      borderColor: row.color || this.getColorByType(row.event_type),
      extendedProps: {
        description: row.description,
        event_type: row.event_type,
        location: row.location,
        room: row.room,
        building: row.building,
        status: row.status,
        priority: row.priority,
        icon: row.icon,
        organizer_id: row.organizer_id,
        organizer_name: row.organizer_name
      }
    }));
  }

  static async getStats(options = {}) {
    try {
      const filters = [];
      const params = [];
      const startInput = options?.timeRange?.startDate;
      const endInput = options?.timeRange?.endDate;

      if (startInput && endInput) {
        const startDate = startInput instanceof Date ? startInput : new Date(startInput);
        const endDate = endInput instanceof Date ? endInput : new Date(endInput);
        filters.push('(start_datetime <= ? AND end_datetime >= ?)');
        params.push(endDate, startDate);
      } else if (startInput) {
        const startDate = startInput instanceof Date ? startInput : new Date(startInput);
        filters.push('end_datetime >= ?');
        params.push(startDate);
      } else if (endInput) {
        const endDate = endInput instanceof Date ? endInput : new Date(endInput);
        filters.push('start_datetime <= ?');
        params.push(endDate);
      }

      const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

      const sql = `
        SELECT 
          COUNT(*) as total_schedules,
          SUM(CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END) as scheduled_count,
          SUM(CASE WHEN status = 'ongoing' THEN 1 ELSE 0 END) as ongoing_count,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_count,
          SUM(CASE WHEN start_datetime >= CURDATE() AND start_datetime < DATE_ADD(CURDATE(), INTERVAL 1 DAY) THEN 1 ELSE 0 END) as today_count,
          SUM(CASE WHEN start_datetime >= DATE_ADD(CURDATE(), INTERVAL 1 DAY) AND start_datetime < DATE_ADD(CURDATE(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as this_week_count
        FROM work_schedules
        ${whereClause}
      `;

      return await db.findOne(sql, params);
    } catch (error) {
      console.error('Error in WorkSchedule getStats:', error);
      throw error;
    }
  }

  // Màu mặc định theo loại sự kiện
  static getColorByType(type) {
    const colors = {
      meeting: '#3b82f6',      // blue
      teaching: '#06b6d4',     // cyan
      exam: '#ef4444',         // red
      admin: '#f59e0b',        // amber
      ceremony: '#8b5cf6',     // violet
      training: '#10b981',     // green
      other: '#6b7280'         // gray
    };
    return colors[type] || colors.other;
  }
}

module.exports = WorkSchedule;
