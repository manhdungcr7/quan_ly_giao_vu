const ReportSchedule = require('../models/ReportSchedule');
const Department = require('../models/Department');

const FREQUENCY_OPTIONS = [
  { value: 'weekly', label: 'Báo cáo tuần' },
  { value: 'monthly', label: 'Báo cáo tháng' },
  { value: 'quarterly', label: 'Báo cáo quý' },
  { value: 'annual', label: 'Báo cáo năm' },
  { value: 'custom', label: 'Tùy chỉnh' }
];

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Chờ nộp' },
  { value: 'in_progress', label: 'Đang thực hiện' },
  { value: 'planning', label: 'Lên kế hoạch' },
  { value: 'draft', label: 'Bản nháp' },
  { value: 'on_hold', label: 'Tạm hoãn' }
];

const REMINDER_PRESETS = [
  { value: 24, label: '24 giờ trước hạn' },
  { value: 48, label: '48 giờ trước hạn' },
  { value: 72, label: '72 giờ trước hạn' },
  { value: 168, label: '7 ngày trước hạn' }
];

const WEEKDAY_OPTIONS = [
  { value: 1, label: 'Thứ hai' },
  { value: 2, label: 'Thứ ba' },
  { value: 3, label: 'Thứ tư' },
  { value: 4, label: 'Thứ năm' },
  { value: 5, label: 'Thứ sáu' },
  { value: 6, label: 'Thứ bảy' },
  { value: 7, label: 'Chủ nhật' }
];

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, index) => ({
  value: index + 1,
  label: `Tháng ${index + 1}`
}));

const DAY_OPTIONS = Array.from({ length: 31 }, (_, index) => index + 1);

const WEEKDAY_LABELS = {
  1: 'Thứ hai',
  2: 'Thứ ba',
  3: 'Thứ tư',
  4: 'Thứ năm',
  5: 'Thứ sáu',
  6: 'Thứ bảy',
  7: 'Chủ nhật'
};

class ReportController {
  constructor() {
    this.today = this.startOfDay(new Date());
    this.scheduleModel = new ReportSchedule();
    this.departmentModel = new Department();
  }

  startOfDay(date) {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  }

  addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  toISODate(date) {
    return date.toISOString().split('T')[0];
  }

  parseISO(value) {
    if (!value) return null;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  formatDateValue(value) {
    if (!value) return null;
    if (value instanceof Date) {
      return this.toISODate(value);
    }
    const parsed = this.parseISO(value);
    return parsed ? this.toISODate(parsed) : null;
  }

  daysUntil(value) {
    const target = this.parseISO(value);
    if (!target) return null;
    const diff = this.startOfDay(target).getTime() - this.today.getTime();
    return Math.round(diff / (24 * 60 * 60 * 1000));
  }

  padNumber(value) {
    return value ? String(value).padStart(2, '0') : '--';
  }

  generateDueLabel(frequency, recurrence, existingLabel, nextDueDate) {
    if (existingLabel) {
      return existingLabel;
    }

    if (!recurrence || typeof recurrence !== 'object') {
      if (nextDueDate) {
        const localized = new Date(`${nextDueDate}T00:00:00`).toLocaleDateString('vi-VN');
        return `Hạn tiếp theo: ${localized}`;
      }
      return 'Định kỳ';
    }

    switch (frequency) {
      case 'weekly': {
        const label = WEEKDAY_LABELS[recurrence.dayOfWeek] || 'Hàng tuần';
        return `${label} hàng tuần`;
      }
      case 'monthly':
        return `Ngày ${recurrence.dayOfMonth || '--'} hàng tháng`;
      case 'quarterly':
        return `Hạn quý: ${this.padNumber(recurrence.day)}/${this.padNumber(recurrence.month)}`;
      case 'annual':
        return `Ngày ${this.padNumber(recurrence.day)} tháng ${this.padNumber(recurrence.month)} hằng năm`;
      case 'custom':
        return recurrence.note || 'Tùy chỉnh';
      default:
        return 'Định kỳ';
    }
  }

  normalizeScheduleRecord(record, source = 'database') {
    if (!record) return null;

    const tags = Array.isArray(record.tags)
      ? record.tags
      : record.tags
        ? String(record.tags)
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean)
        : [];

    const recurrence = record.recurrence || record.recurrence_pattern || null;
    const nextDueDate = this.formatDateValue(record.nextDueDate ?? record.next_due_date);
    const lastSubmittedAt = this.formatDateValue(record.lastSubmittedAt ?? record.last_submitted_at);

    return {
      id: record.identifier || record.id || `schedule-${Math.random().toString(36).slice(2, 8)}`,
      dbId: record.id || null,
      title: record.title,
      frequency: record.frequency || 'monthly',
      owner: record.owner || record.owner_custom || record.departmentName || record.ownerName || 'Chưa phân công',
      channel: record.channel || 'Chưa thiết lập',
      scope: record.scope || '',
      status: record.status || 'planning',
      progress: Number.isFinite(Number(record.progress)) ? Number(record.progress) : 0,
      completionRate: Number.isFinite(Number(record.completionRate ?? record.completion_rate))
        ? Number(record.completionRate ?? record.completion_rate)
        : 0,
      remindBeforeHours: Number.isFinite(Number(record.remindBeforeHours ?? record.remind_before_hours))
        ? Number(record.remindBeforeHours ?? record.remind_before_hours)
        : 48,
      nextDueDate,
      dueLabel: this.generateDueLabel(record.frequency, recurrence, record.dueLabel ?? record.due_label, nextDueDate),
      attachments: Number.isFinite(Number(record.attachments ?? record.attachments_expected))
        ? Number(record.attachments ?? record.attachments_expected)
        : 0,
      tags,
      lastSubmittedAt,
      source
    };
  }

  async fetchScheduleData() {
    try {
      const schedules = await this.scheduleModel.listActiveWithDepartments();
      if (Array.isArray(schedules) && schedules.length > 0) {
        return schedules.map((record) => this.normalizeScheduleRecord(record, 'database'));
      }
    } catch (error) {
      console.error('ReportController.fetchScheduleData error:', error);
    }

    return this.buildScheduleBlueprint().map((record) => this.normalizeScheduleRecord(record, 'fallback'));
  }

  buildScheduleBlueprint() {
    const base = this.today;
    return [
      {
        id: 'weekly-operational',
        title: 'Báo cáo tuần công tác',
        frequency: 'weekly',
        owner: 'Văn phòng Khoa',
        channel: 'SharePoint nội bộ',
        nextDueDate: this.toISODate(this.addDays(base, 2)),
        dueLabel: 'Thứ sáu hàng tuần',
        scope: 'Tổng hợp tiến độ các phòng ban và lịch làm việc trọng tâm',
        status: 'pending',
        completionRate: 92,
        progress: 65,
        lastSubmittedAt: this.toISODate(this.addDays(base, -5)),
        attachments: 5,
        tags: ['Định kỳ', 'Lãnh đạo khoa'],
        remindBeforeHours: 48
      },
      {
        id: 'monthly-quality',
        title: 'Báo cáo chất lượng đào tạo tháng',
        frequency: 'monthly',
        owner: 'Phòng Đảm bảo chất lượng',
        channel: 'Kho dữ liệu đào tạo',
        nextDueDate: this.toISODate(this.addDays(base, 14)),
        dueLabel: 'Ngày 18 hàng tháng',
        scope: 'Theo dõi tỷ lệ hoàn thành kế hoạch giảng dạy, tình trạng lớp học',
        status: 'in_progress',
        completionRate: 87,
        progress: 48,
        lastSubmittedAt: this.toISODate(this.addDays(base, -20)),
        attachments: 8,
        tags: ['Định kỳ', 'Đào tạo'],
        remindBeforeHours: 48
      },
      {
        id: 'quarterly-audit',
        title: 'Báo cáo tổng hợp quý IV/2025',
        frequency: 'quarterly',
        owner: 'Phòng Thanh tra - Kiểm tra',
        channel: 'Kho dữ liệu báo cáo',
        nextDueDate: this.toISODate(this.addDays(base, 36)),
        dueLabel: 'Hạn nộp: 05/11/2025',
        scope: 'Đánh giá chỉ tiêu kế hoạch, ngân sách, công tác phối hợp đơn vị',
        status: 'planning',
        completionRate: 74,
        progress: 25,
        lastSubmittedAt: this.toISODate(this.addDays(base, -80)),
        attachments: 3,
        tags: ['Chiến lược', 'Tổng hợp'],
        remindBeforeHours: 72
      },
      {
        id: 'annual-report',
        title: 'Báo cáo tổng kết năm học 2024-2025',
        frequency: 'annual',
        owner: 'Ban Chủ nhiệm Khoa',
        channel: 'Kho dữ liệu báo cáo',
        nextDueDate: this.toISODate(this.addDays(base, 72)),
        dueLabel: 'Hạn trình: 10/12/2025',
        scope: 'Tổng hợp kết quả toàn diện, đề xuất kế hoạch 2026',
        status: 'draft',
        completionRate: 58,
        progress: 15,
        lastSubmittedAt: null,
        attachments: 0,
        tags: ['Chiến lược', 'Ban giám hiệu'],
        remindBeforeHours: 168
      }
    ];
  }

  buildDepartmentSnapshots() {
    return [
      {
        department: 'Văn phòng Khoa',
        lead: 'ThS. Nguyễn Thị Bích',
        activeSchedules: 6,
        dueSoon: 2,
        overdue: 0,
        completionRate: 94,
        highlight: 'Luồng phê duyệt mới giúp rút ngắn 1.5 ngày xử lý'
      },
      {
        department: 'Phòng Đảm bảo chất lượng',
        lead: 'TS. Lê Quốc Thịnh',
        activeSchedules: 4,
        dueSoon: 1,
        overdue: 1,
        completionRate: 88,
        highlight: 'Cần bổ sung dữ liệu tham chiếu từ hệ thống LMS'
      },
      {
        department: 'Phòng Thanh tra - Kiểm tra',
        lead: 'ThS. Trần Minh Hà',
        activeSchedules: 3,
        dueSoon: 0,
        overdue: 0,
        completionRate: 91,
        highlight: 'Đã chuẩn hóa checklist kiểm tra định kỳ'
      },
      {
        department: 'Ban Chủ nhiệm Khoa',
        lead: 'PGS.TS. Lê Hữu Vinh',
        activeSchedules: 2,
        dueSoon: 0,
        overdue: 0,
        completionRate: 96,
        highlight: 'Hoàn thành báo cáo chiến lược giai đoạn 2025-2030'
      }
    ];
  }

  buildTimeline() {
    return [
      {
        label: 'Tuần 41',
        dateRange: '07 - 13/10',
        focus: 'Khóa sổ các báo cáo tuần',
        owner: 'Văn phòng Khoa',
        status: 'in_progress'
      },
      {
        label: 'Tuần 42',
        dateRange: '14 - 20/10',
        focus: 'Rà soát số liệu đào tạo tháng 9',
        owner: 'Phòng ĐBCL',
        status: 'planning'
      },
      {
        label: 'Tuần 44',
        dateRange: '28/10 - 03/11',
        focus: 'Kết xuất báo cáo quý IV sơ bộ',
        owner: 'Phòng Thanh tra',
        status: 'pending'
      },
      {
        label: 'Tuần 48',
        dateRange: '25/11 - 01/12',
        focus: 'Hoàn thiện báo cáo tổng kết năm',
        owner: 'Ban Chủ nhiệm',
        status: 'upcoming'
      }
    ];
  }

  buildReportLibrary() {
    return [
      {
        code: 'BC-WEEK-39',
        title: 'Báo cáo tuần 39/2025',
        frequency: 'weekly',
        owner: 'Văn phòng Khoa',
        lastUpdated: this.toISODate(this.addDays(this.today, -9)),
        status: 'approved',
        summary: 'Tổng hợp 32 sự kiện, 5 kiến nghị xử lý trong tuần. Đã triển khai 4/5 kiến nghị.',
        attachments: 3,
        tags: ['Định kỳ', 'Tác nghiệp']
      },
      {
        code: 'BC-MON-09',
        title: 'Báo cáo đào tạo tháng 9/2025',
        frequency: 'monthly',
        owner: 'Phòng ĐBCL',
        lastUpdated: this.toISODate(this.addDays(this.today, -18)),
        status: 'review',
        summary: 'Tỷ lệ hoàn thành đề cương giảng dạy đạt 96%, cần bổ sung minh chứng thực hành.',
        attachments: 6,
        tags: ['Đào tạo', 'Định kỳ']
      },
      {
        code: 'BC-QUARTER-III',
        title: 'Báo cáo tổng hợp quý III/2025',
        frequency: 'quarterly',
        owner: 'Phòng Thanh tra',
        lastUpdated: this.toISODate(this.addDays(this.today, -40)),
        status: 'archived',
        summary: 'Hoàn thành 18/20 chỉ tiêu, 2 chỉ tiêu chuyển sang quý IV để theo dõi bổ sung.',
        attachments: 4,
        tags: ['Chiến lược', 'Tổng hợp']
      },
      {
        code: 'BC-ANNUAL-2024',
        title: 'Báo cáo tổng kết năm học 2023-2024',
        frequency: 'annual',
        owner: 'Ban Chủ nhiệm',
        lastUpdated: '2024-12-15',
        status: 'archived',
        summary: 'Được phê duyệt ngày 20/12/2024, là cơ sở xây dựng kế hoạch giai đoạn 2025-2030.',
        attachments: 9,
        tags: ['Ban giám hiệu', 'Chiến lược']
      }
    ];
  }

  buildInsights(schedules) {
    const safeSchedules = Array.isArray(schedules) ? schedules : [];

    const dueSoon = safeSchedules
      .map((item) => ({ ...item, dueInDays: this.daysUntil(item.nextDueDate) }))
      .filter((item) => item.dueInDays !== null && item.dueInDays >= 0 && item.dueInDays <= 7)
      .sort((a, b) => a.dueInDays - b.dueInDays);

    const overdue = safeSchedules
      .map((item) => ({ ...item, overdueDays: this.daysUntil(item.nextDueDate) }))
      .filter((item) => item.overdueDays !== null && item.overdueDays < 0)
      .sort((a, b) => a.overdueDays - b.overdueDays);

    return {
      dueSoon,
      overdue,
      keyNotes: [
        'Ưu tiên chuẩn hóa biểu mẫu để đồng bộ dữ liệu lên kho báo cáo tập trung.',
        'Đề xuất triển khai tự động nhắc hạn qua email và MS Teams cho báo cáo tuần, tháng.',
        'Tăng cường thu thập minh chứng ngay từ đầu kỳ để giảm thời gian rà soát.'
      ]
    };
  }

  buildSummaryMetrics(schedules, insights) {
    const totalActive = schedules.length;
    const dueSoon = insights.dueSoon.length;
    const overdue = insights.overdue.length;
    const avgCompletion = Math.round(
      schedules.reduce((acc, item) => acc + (Number(item.completionRate) || 0), 0) / (totalActive || 1)
    );

    return [
      {
        key: 'activeSchedules',
        label: 'Lịch báo cáo đang chạy',
        value: totalActive,
        tone: 'primary',
        trend: totalActive > 0 ? '+2 lịch mới' : 'Chờ thiết lập',
        hint: 'Đã thiết lập cho toàn bộ nhóm báo cáo định kỳ.'
      },
      {
        key: 'dueSoon',
        label: 'Đến hạn trong 7 ngày',
        value: dueSoon,
        tone: dueSoon > 0 ? 'warning' : 'success',
        trend: dueSoon > 0 ? 'Cần xử lý sớm' : 'Đã kiểm soát tốt',
        hint: 'Tự động gửi nhắc hạn trước hạn theo cấu hình.'
      },
      {
        key: 'overdue',
        label: 'Trễ hạn',
        value: overdue,
        tone: overdue > 0 ? 'danger' : 'success',
        trend: overdue > 0 ? `${overdue} báo cáo cần hỗ trợ` : 'Không có báo cáo trễ hạn',
        hint: 'Theo dõi sát để tránh ảnh hưởng tổng hợp quý.'
      },
      {
        key: 'completionRate',
        label: 'Tỷ lệ hoàn thành đúng hạn',
        value: `${avgCompletion}%`,
        tone: avgCompletion >= 90 ? 'success' : 'info',
        trend: avgCompletion >= 90 ? '+3% so với tháng trước' : 'Đang cải thiện',
        hint: 'Giá trị trung bình dựa trên các lịch báo cáo trọng tâm.'
      }
    ];
  }

  async loadDepartments() {
    try {
      return await this.departmentModel.listActive();
    } catch (error) {
      console.error('ReportController.loadDepartments error:', error);
      return [];
    }
  }

  defaultFormData() {
    return {
      title: '',
      frequency: 'monthly',
      owner_unit_id: '',
      owner_custom: '',
      channel: '',
      scope: '',
      status: 'pending',
      progress: 0,
      completion_rate: 0,
      remind_before_hours: 48,
      next_due_date: '',
      due_label: '',
      monthly_day: 18,
      weekly_day: 5,
      quarter_day: 5,
      quarter_month: 11,
      annual_day: 10,
      annual_month: 12,
      attachments_expected: 0,
      tags: '',
      custom_recurrence: ''
    };
  }

  parseInteger(value) {
    if (value === undefined || value === null || value === '') {
      return null;
    }
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? null : parsed;
  }

  clampNumber(value, min, max, defaultValue = min) {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed)) {
      return defaultValue;
    }
    return Math.min(Math.max(parsed, min), max);
  }

  validateScheduleForm(body, currentUser) {
    const errors = [];
    const formData = { ...this.defaultFormData(), ...body };

    formData.title = (formData.title || '').trim();
    formData.channel = (formData.channel || '').trim();
    formData.scope = (formData.scope || '').trim();
    formData.owner_custom = (formData.owner_custom || '').trim();
    formData.due_label = (formData.due_label || '').trim();
    formData.tags = (formData.tags || '').trim();
    formData.custom_recurrence = (formData.custom_recurrence || '').trim();

    if (!formData.title) {
      errors.push('Vui lòng nhập tên báo cáo.');
    }

    const frequencyValues = FREQUENCY_OPTIONS.map((item) => item.value);
    if (!frequencyValues.includes(formData.frequency)) {
      errors.push('Tần suất báo cáo không hợp lệ.');
    }

    const statusValues = STATUS_OPTIONS.map((item) => item.value);
    if (!statusValues.includes(formData.status)) {
      errors.push('Trạng thái khởi tạo không hợp lệ.');
    }

    const ownerUnitId = this.parseInteger(formData.owner_unit_id);
    if (!ownerUnitId && !formData.owner_custom) {
      errors.push('Vui lòng chọn đơn vị phụ trách hoặc nhập tên đơn vị.');
    }

    const nextDue = formData.next_due_date ? this.parseISO(formData.next_due_date) : null;
    if (formData.next_due_date && !nextDue) {
      errors.push('Ngày đến hạn đầu tiên không hợp lệ.');
    }

    const progress = this.clampNumber(formData.progress, 0, 100, 0);
    const completionRate = this.clampNumber(formData.completion_rate, 0, 100, 0);
    const remindBeforeHours = this.clampNumber(formData.remind_before_hours, 0, 24 * 14, 48);
    const attachmentsExpected = Math.max(this.clampNumber(formData.attachments_expected, 0, 50, 0), 0);

    let recurrence = null;
    switch (formData.frequency) {
      case 'weekly': {
        const day = this.clampNumber(formData.weekly_day, 1, 7, 5);
        formData.weekly_day = day;
        recurrence = { type: 'weekly', dayOfWeek: day };
        break;
      }
      case 'monthly': {
        const day = this.clampNumber(formData.monthly_day, 1, 31, 18);
        formData.monthly_day = day;
        recurrence = { type: 'monthly', dayOfMonth: day };
        break;
      }
      case 'quarterly': {
        const day = this.clampNumber(formData.quarter_day, 1, 31, 5);
        const month = this.clampNumber(formData.quarter_month, 1, 12, 11);
        formData.quarter_day = day;
        formData.quarter_month = month;
        recurrence = { type: 'quarterly', day, month };
        break;
      }
      case 'annual': {
        const day = this.clampNumber(formData.annual_day, 1, 31, 10);
        const month = this.clampNumber(formData.annual_month, 1, 12, 12);
        formData.annual_day = day;
        formData.annual_month = month;
        recurrence = { type: 'annual', day, month };
        break;
      }
      case 'custom': {
        if (!formData.custom_recurrence) {
          errors.push('Vui lòng mô tả chu kỳ báo cáo tùy chỉnh.');
        }
        recurrence = { type: 'custom', note: formData.custom_recurrence };
        break;
      }
      default:
        break;
    }

    const tagsArray = formData.tags
      ? formData.tags
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
      : [];

    const dueLabel = this.generateDueLabel(
      formData.frequency,
      recurrence,
      formData.due_label,
      nextDue ? this.toISODate(nextDue) : null
    );

    if (errors.length > 0) {
      return { errors, formData };
    }

    const payload = {
      title: formData.title,
      frequency: formData.frequency,
      owner_unit_id: ownerUnitId,
      owner_custom: ownerUnitId ? null : formData.owner_custom || null,
      channel: formData.channel || null,
      scope: formData.scope || null,
      status: formData.status,
      progress,
      completion_rate: completionRate,
      remind_before_hours: remindBeforeHours,
      next_due_date: nextDue ? this.toISODate(nextDue) : null,
      due_label: dueLabel,
      recurrence_pattern: recurrence ? JSON.stringify(recurrence) : null,
      attachments_expected: attachmentsExpected,
      tags: tagsArray.length ? JSON.stringify(tagsArray) : null,
      last_submitted_at: null,
      created_by: currentUser?.id || null,
      is_active: true
    };

    return { errors, formData, payload };
  }

  async index(req, res) {
    const scheduleBlueprint = await this.fetchScheduleData();
    const insights = this.buildInsights(scheduleBlueprint);
    const summaryMetrics = this.buildSummaryMetrics(scheduleBlueprint, insights);
    const departmentSnapshots = this.buildDepartmentSnapshots();
    const timeline = this.buildTimeline();
    const reportLibrary = this.buildReportLibrary();

    return res.render('reports/index', {
      title: 'Báo cáo tổng hợp',
      user: req.session.user,
      summaryMetrics,
      scheduleBlueprint,
      insights,
      departmentSnapshots,
      timeline,
      reportLibrary
    });
  }

  async create(req, res) {
    const departments = await this.loadDepartments();
    return res.render('reports/create', {
      title: 'Thiết lập lịch báo cáo mới',
      user: req.session.user,
      departments,
      frequencyOptions: FREQUENCY_OPTIONS,
      statusOptions: STATUS_OPTIONS,
      reminderOptions: REMINDER_PRESETS,
      weekdayOptions: WEEKDAY_OPTIONS,
      monthOptions: MONTH_OPTIONS,
      dayOptions: DAY_OPTIONS,
      errors: [],
      formData: this.defaultFormData()
    });
  }

  async store(req, res) {
    const { errors, formData, payload } = this.validateScheduleForm(req.body, req.session.user);

    if (errors.length > 0 || !payload) {
      const departments = await this.loadDepartments();
      return res.status(422).render('reports/create', {
        title: 'Thiết lập lịch báo cáo mới',
        user: req.session.user,
        departments,
        frequencyOptions: FREQUENCY_OPTIONS,
        statusOptions: STATUS_OPTIONS,
        reminderOptions: REMINDER_PRESETS,
        weekdayOptions: WEEKDAY_OPTIONS,
        monthOptions: MONTH_OPTIONS,
        dayOptions: DAY_OPTIONS,
        errors,
        formData
      });
    }

    try {
      await this.scheduleModel.create(payload);
      req.flash('success', 'Đã thiết lập lịch báo cáo mới thành công.');
      return res.redirect('/reports');
    } catch (error) {
      console.error('ReportController.store error:', error);
      const departments = await this.loadDepartments();
      return res.status(500).render('reports/create', {
        title: 'Thiết lập lịch báo cáo mới',
        user: req.session.user,
        departments,
        frequencyOptions: FREQUENCY_OPTIONS,
        statusOptions: STATUS_OPTIONS,
        reminderOptions: REMINDER_PRESETS,
        weekdayOptions: WEEKDAY_OPTIONS,
        monthOptions: MONTH_OPTIONS,
        dayOptions: DAY_OPTIONS,
        errors: ['Không thể lưu lịch báo cáo. Vui lòng thử lại.'],
        formData
      });
    }
  }

  async show(req, res) {
    const scheduleId = Number.parseInt(req.params.id, 10);
    if (!Number.isFinite(scheduleId)) {
      req.flash('error', 'Lịch báo cáo không tồn tại.');
      return res.redirect('/reports');
    }

    const schedule = await this.scheduleModel.findByIdWithDepartment(scheduleId);
    if (!schedule) {
      req.flash('error', 'Không tìm thấy lịch báo cáo.');
      return res.redirect('/reports');
    }

    return res.render('reports/show', {
      title: 'Chi tiết lịch báo cáo',
      user: req.session.user,
      schedule,
      frequencyOptions: FREQUENCY_OPTIONS,
      statusOptions: STATUS_OPTIONS
    });
  }

  async edit(req, res) {
    const scheduleId = Number.parseInt(req.params.id, 10);
    if (!Number.isFinite(scheduleId)) {
      req.flash('error', 'Lịch báo cáo không tồn tại.');
      return res.redirect('/reports');
    }

    const schedule = await this.scheduleModel.findByIdWithDepartment(scheduleId);
    if (!schedule) {
      req.flash('error', 'Không tìm thấy lịch báo cáo.');
      return res.redirect('/reports');
    }

    const departments = await this.loadDepartments();
    const formData = {
      ...this.defaultFormData(),
      title: schedule.title,
      frequency: schedule.frequency,
      owner_unit_id: schedule.ownerUnitId || '',
      owner_custom: schedule.ownerCustom || '',
      channel: schedule.channel || '',
      scope: schedule.scope || '',
      status: schedule.status,
      progress: schedule.progress,
      completion_rate: schedule.completionRate,
      remind_before_hours: schedule.remindBeforeHours,
      next_due_date: schedule.nextDueDate || '',
      due_label: schedule.dueLabelRaw || '',
      attachments_expected: schedule.attachments,
      tags: schedule.tags.join(', '),
      custom_recurrence: schedule.recurrencePattern?.note || ''
    };

    if (schedule.recurrencePattern) {
      const recurrence = schedule.recurrencePattern;
      switch (schedule.frequency) {
        case 'weekly':
          formData.weekly_day = recurrence.dayOfWeek || formData.weekly_day;
          break;
        case 'monthly':
          formData.monthly_day = recurrence.dayOfMonth || formData.monthly_day;
          break;
        case 'quarterly':
          formData.quarter_day = recurrence.day || formData.quarter_day;
          formData.quarter_month = recurrence.month || formData.quarter_month;
          break;
        case 'annual':
          formData.annual_day = recurrence.day || formData.annual_day;
          formData.annual_month = recurrence.month || formData.annual_month;
          break;
        default:
          break;
      }
    }

    return res.render('reports/edit', {
      title: 'Cập nhật lịch báo cáo',
      user: req.session.user,
      departments,
      frequencyOptions: FREQUENCY_OPTIONS,
      statusOptions: STATUS_OPTIONS,
      reminderOptions: REMINDER_PRESETS,
      weekdayOptions: WEEKDAY_OPTIONS,
      monthOptions: MONTH_OPTIONS,
      dayOptions: DAY_OPTIONS,
      errors: [],
      formData,
      scheduleId
    });
  }

  async update(req, res) {
    const scheduleId = Number.parseInt(req.params.id, 10);
    if (!Number.isFinite(scheduleId)) {
      req.flash('error', 'Lịch báo cáo không tồn tại.');
      return res.redirect('/reports');
    }

    const existing = await this.scheduleModel.findByIdWithDepartment(scheduleId);
    if (!existing) {
      req.flash('error', 'Không tìm thấy lịch báo cáo.');
      return res.redirect('/reports');
    }

    const { errors, formData, payload } = this.validateScheduleForm(req.body, req.session.user);

    if (errors.length > 0 || !payload) {
      const departments = await this.loadDepartments();
      return res.status(422).render('reports/edit', {
        title: 'Cập nhật lịch báo cáo',
        user: req.session.user,
        departments,
        frequencyOptions: FREQUENCY_OPTIONS,
        statusOptions: STATUS_OPTIONS,
        reminderOptions: REMINDER_PRESETS,
        weekdayOptions: WEEKDAY_OPTIONS,
        monthOptions: MONTH_OPTIONS,
        dayOptions: DAY_OPTIONS,
        errors,
        formData,
        scheduleId
      });
    }

    try {
      const updatePayload = {
        ...payload,
        created_by: existing.createdBy || null,
        last_submitted_at: existing.lastSubmittedAt || null,
  is_active: existing.isActive ? 1 : 0,
  updated_at: new Date()
      };

      delete updatePayload.created_at;
      delete updatePayload.createdBy;

      await this.scheduleModel.update(scheduleId, updatePayload);
  req.flash('success', 'Đã cập nhật lịch báo cáo thành công.');
  return res.redirect(`/reports/schedules/${scheduleId}`);
    } catch (error) {
      console.error('ReportController.update error:', error);
      const departments = await this.loadDepartments();
      return res.status(500).render('reports/edit', {
        title: 'Cập nhật lịch báo cáo',
        user: req.session.user,
        departments,
        frequencyOptions: FREQUENCY_OPTIONS,
        statusOptions: STATUS_OPTIONS,
        reminderOptions: REMINDER_PRESETS,
        weekdayOptions: WEEKDAY_OPTIONS,
        monthOptions: MONTH_OPTIONS,
        dayOptions: DAY_OPTIONS,
        errors: ['Không thể lưu thay đổi. Vui lòng thử lại.'],
        formData,
        scheduleId
      });
    }
  }

  async destroy(req, res) {
    const scheduleId = Number.parseInt(req.params.id, 10);
    if (!Number.isFinite(scheduleId)) {
      req.flash('error', 'Lịch báo cáo không tồn tại.');
      return res.redirect('/reports');
    }

    const existing = await this.scheduleModel.findByIdWithDepartment(scheduleId);
    if (!existing) {
      req.flash('error', 'Không tìm thấy lịch báo cáo.');
      return res.redirect('/reports');
    }

    try {
      await this.scheduleModel.softDelete(scheduleId);
      req.flash('success', 'Đã xoá lịch báo cáo khỏi hệ thống.');
    } catch (error) {
      console.error('ReportController.destroy error:', error);
      req.flash('error', 'Không thể xoá lịch báo cáo. Vui lòng thử lại.');
    }

    return res.redirect('/reports');
  }
}

module.exports = ReportController;
