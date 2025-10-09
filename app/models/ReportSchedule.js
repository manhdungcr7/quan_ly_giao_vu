const BaseModel = require('./BaseModel');

const STATUS_PRIORITY = {
  pending: 1,
  in_progress: 2,
  planning: 3,
  draft: 4,
  on_hold: 5
};

const STATUS_ORDER_FRAGMENT = Object.entries(STATUS_PRIORITY)
  .map(([status, priority]) => `WHEN rs.status='${status}' THEN ${priority}`)
  .join('\n          ');

class ReportSchedule extends BaseModel {
  constructor() {
    super('report_schedules');
  }

  parseTags(value) {
    if (!value) {
      return [];
    }

    if (Array.isArray(value)) {
      return value;
    }

    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (error) {
        // Ignore JSON parse errors, fallback to comma split
      }

      return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    }

    if (typeof value === 'object') {
      return Object.values(value).filter(Boolean);
    }

    return [];
  }

  parseRecurrence(value) {
    if (!value) {
      return null;
    }

    if (typeof value === 'object') {
      return value;
    }

    try {
      return JSON.parse(value);
    } catch (error) {
      return null;
    }
  }

  buildDueLabel(record, recurrence) {
    if (record.due_label) {
      return record.due_label;
    }

    if (!recurrence || typeof recurrence !== 'object') {
      return 'Định kỳ';
    }

    switch (recurrence.type) {
      case 'weekly':
        return 'Hàng tuần';
      case 'monthly':
        return `Ngày ${recurrence.dayOfMonth || '--'} hàng tháng`;
      case 'quarterly':
        return `Hạn quý (${recurrence.month || '--'}/${recurrence.day || '--'})`;
      case 'annual':
        return `Ngày ${recurrence.day || '--'} tháng ${recurrence.month || '--'} hằng năm`;
      case 'custom':
        return recurrence.note || 'Tùy chỉnh';
      default:
        return 'Định kỳ';
    }
  }

  formatRecord(record) {
    if (!record) {
      return null;
    }

    const tags = this.parseTags(record.tags);
    const recurrence = this.parseRecurrence(record.recurrence_pattern);

    return {
      id: record.id,
      identifier: record.identifier || `schedule-${record.id}`,
      title: record.title,
      frequency: record.frequency || 'monthly',
      ownerUnitId: record.owner_unit_id,
      ownerCustom: record.owner_custom,
      owner: record.owner_custom || record.department_name || 'Chưa phân công',
      channel: record.channel || 'Chưa thiết lập',
      scope: record.scope || '',
      status: record.status || 'planning',
      progress: Number.parseInt(record.progress, 10) || 0,
      completionRate: Number.parseInt(record.completion_rate, 10) || 0,
      remindBeforeHours: Number.parseInt(record.remind_before_hours, 10) || 48,
      nextDueDate: record.next_due_date || null,
      dueLabel: this.buildDueLabel(record, recurrence),
      dueLabelRaw: record.due_label || null,
      attachments: Number.parseInt(record.attachments_expected, 10) || 0,
      tags,
      recurrencePattern: recurrence,
      lastSubmittedAt: record.last_submitted_at || null,
      isActive: record.is_active === undefined ? true : Boolean(record.is_active),
      createdBy: record.created_by || null,
      createdAt: record.created_at || null,
      updatedAt: record.updated_at || null,
      departmentName: record.department_name || null,
      departmentCode: record.department_code || null
    };
  }

  async listActiveWithDepartments() {
    const sql = `
      SELECT rs.*, d.name AS department_name, d.code AS department_code
      FROM report_schedules rs
      LEFT JOIN departments d ON rs.owner_unit_id = d.id
      WHERE rs.is_active = 1
      ORDER BY
        CASE WHEN rs.next_due_date IS NULL THEN 1 ELSE 0 END,
        rs.next_due_date ASC,
        CASE
          ${STATUS_ORDER_FRAGMENT}
          ELSE 999
        END,
        rs.id DESC
    `;

    const rows = await this.db.findMany(sql);
    return rows.map((row) => this.formatRecord(row));
  }

  async findByIdWithDepartment(id) {
    const sql = `
      SELECT rs.*, d.name AS department_name, d.code AS department_code
      FROM report_schedules rs
      LEFT JOIN departments d ON rs.owner_unit_id = d.id
      WHERE rs.id = ?
      LIMIT 1
    `;

    const record = await this.db.findOne(sql, [id]);
    return record ? this.formatRecord(record) : null;
  }
}

module.exports = ReportSchedule;
