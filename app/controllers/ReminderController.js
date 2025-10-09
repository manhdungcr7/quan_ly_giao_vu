const ReportSchedule = require('../models/ReportSchedule');
const Document = require('../models/Document');
const ExaminationSession = require('../models/ExaminationSession');

const TYPE_METADATA = {
  report: {
    label: 'Báo cáo định kỳ',
    tone: 'report',
    icon: 'fa-solid fa-chart-line'
  },
  document: {
    label: 'Văn bản điều hành',
    tone: 'document',
    icon: 'fa-solid fa-file-lines'
  },
  examination: {
    label: 'Khảo thí',
    tone: 'examination',
    icon: 'fa-solid fa-graduation-cap'
  }
};

const PRIORITY_METADATA = {
  critical: { label: 'Ưu tiên khẩn cấp', tone: 'critical' },
  high: { label: 'Ưu tiên cao', tone: 'high' },
  medium: { label: 'Theo dõi', tone: 'medium' },
  low: { label: 'Nhắc nhẹ', tone: 'low' }
};

const REPORT_STATUS_LABELS = {
  pending: 'Chờ nộp',
  in_progress: 'Đang thực hiện',
  planning: 'Lên kế hoạch',
  draft: 'Bản nháp',
  on_hold: 'Tạm hoãn'
};

const DOCUMENT_STATUS_LABELS = {
  pending: 'Chưa xử lý',
  processing: 'Đang xử lý',
  completed: 'Đã hoàn thành',
  archived: 'Lưu trữ',
  rejected: 'Từ chối'
};

const DOCUMENT_PRIORITY_BASE = {
  urgent: 'critical',
  high: 'high',
  normal: 'medium',
  medium: 'medium',
  low: 'low'
};

const EXAM_STATUS_LABELS = {
  scheduled: 'Đã lên lịch',
  grading: 'Đang chấm',
  in_progress: 'Đang thực hiện',
  completed: 'Đã hoàn thành',
  draft: 'Bản nháp',
  cancelled: 'Đã huỷ'
};

class ReminderController {
  constructor() {
    this.reportScheduleModel = new ReportSchedule();
    this.documentModel = new Document();
  }

  startOfDay(date) {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  }

  parseDate(value) {
    if (!value) return null;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      const fallback = new Date(`${value}T00:00:00`);
      return Number.isNaN(fallback.getTime()) ? null : fallback;
    }
    return parsed;
  }

  formatDate(value) {
    const parsed = this.parseDate(value);
    if (!parsed) return 'Chưa xác định';
    return parsed.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  daysUntil(value, today) {
    const target = this.parseDate(value);
    if (!target) return null;
    const diff = this.startOfDay(target).getTime() - today.getTime();
    return Math.round(diff / (24 * 60 * 60 * 1000));
  }

  relativeLabel(days) {
    if (days === null || days === undefined) return 'Chưa có hạn';
    if (days < 0) return `Quá hạn ${Math.abs(days)} ngày`;
    if (days === 0) return 'Đến hạn hôm nay';
    if (days === 1) return 'Còn 1 ngày';
    return `Còn ${days} ngày`;
  }

  priorityFromDays(days, basePriority = 'medium') {
    if (days === null || days === undefined) {
      return basePriority;
    }
    if (days <= 0) {
      return 'critical';
    }
    if (days <= 2) {
      return 'high';
    }
    if (days <= 7) {
      return basePriority === 'critical' ? 'high' : basePriority;
    }
    return basePriority;
  }

  normalizeReportSchedule(record, today) {
    if (!record || !record.nextDueDate) return null;
    const dueDays = this.daysUntil(record.nextDueDate, today);
    const priority = this.priorityFromDays(dueDays);
    const meta = TYPE_METADATA.report;

    return {
      id: `report-${record.id}`,
      rawId: record.id,
      type: 'report',
      typeLabel: meta.label,
      typeTone: meta.tone,
      icon: meta.icon,
      title: record.title,
      dueDate: record.nextDueDate,
      dueDateLabel: this.formatDate(record.nextDueDate),
      daysUntil: dueDays,
      relativeLabel: this.relativeLabel(dueDays),
      statusLabel: REPORT_STATUS_LABELS[record.status] || 'Đang xử lý',
      priority,
      priorityLabel: PRIORITY_METADATA[priority].label,
      priorityTone: PRIORITY_METADATA[priority].tone,
      ownerLabel: record.departmentName || record.owner || record.ownerCustom || 'Chưa phân công',
      link: `/reports/schedules/${record.id}`,
      reference: record.channel || 'Chưa thiết lập kênh chia sẻ',
      context: record.scope || 'Chưa cập nhật phạm vi công việc.',
      tags: Array.isArray(record.tags) ? record.tags : [],
      dueTimestamp: this.parseDate(record.nextDueDate)?.getTime() ?? null,
      accent: 'report',
      badge: record.dueLabel || 'Định kỳ'
    };
  }

  normalizeDocument(record, today, { overdue = false } = {}) {
    if (!record || !record.processing_deadline) return null;
    const basePriority = DOCUMENT_PRIORITY_BASE[record.priority] || 'medium';
    const rawDays = overdue ? -Math.abs(Number(record.days_overdue || 0)) : Number(record.days_left ?? 0);
    const dueDays = Number.isNaN(rawDays) ? this.daysUntil(record.processing_deadline, today) : rawDays;
    const priority = this.priorityFromDays(dueDays, basePriority);
    const meta = TYPE_METADATA.document;

    return {
      id: `document-${record.id}`,
      rawId: record.id,
      type: 'document',
      typeLabel: meta.label,
      typeTone: meta.tone,
      icon: meta.icon,
      title: record.title || record.document_number || 'Văn bản chưa đặt tên',
      dueDate: record.processing_deadline,
      dueDateLabel: this.formatDate(record.processing_deadline),
      daysUntil: dueDays,
      relativeLabel: this.relativeLabel(dueDays),
      statusLabel: DOCUMENT_STATUS_LABELS[record.status] || 'Đang xử lý',
      priority,
      priorityLabel: PRIORITY_METADATA[priority].label,
      priorityTone: PRIORITY_METADATA[priority].tone,
      ownerLabel: record.assigned_to_name || 'Chưa phân công',
      link: `/documents/${record.id}`,
      reference: record.document_type_name || 'Văn bản điều hành',
      context: record.content_summary || 'Chưa có tóm tắt nội dung.',
      tags: [record.priority ? `Ưu tiên: ${record.priority}` : '', record.direction === 'incoming' ? 'Văn bản đến' : record.direction === 'outgoing' ? 'Văn bản đi' : '']
        .filter(Boolean),
      dueTimestamp: this.parseDate(record.processing_deadline)?.getTime() ?? null,
      accent: 'document',
      badge: record.document_number || 'Văn bản điều hành'
    };
  }

  normalizeExamSession(record, today) {
    if (!record || !record.grading_deadline) return null;
    const dueDays = this.daysUntil(record.grading_deadline, today);
    const priority = this.priorityFromDays(dueDays, 'high');
    const meta = TYPE_METADATA.examination;

    return {
      id: `exam-${record.id}`,
      rawId: record.id,
      type: 'examination',
      typeLabel: meta.label,
      typeTone: meta.tone,
      icon: meta.icon,
      title: record.exam_name || 'Ca thi chưa đặt tên',
      dueDate: record.grading_deadline,
      dueDateLabel: this.formatDate(record.grading_deadline),
      daysUntil: dueDays,
      relativeLabel: this.relativeLabel(dueDays),
      statusLabel: EXAM_STATUS_LABELS[record.status] || 'Đang triển khai',
      priority,
      priorityLabel: PRIORITY_METADATA[priority].label,
      priorityTone: PRIORITY_METADATA[priority].tone,
      ownerLabel: record.grader_name || record.grader_manual_name || 'Chưa phân công chấm thi',
      link: `/examination/${record.id}`,
      reference: record.subject_name ? `${record.subject_name}${record.class_name ? ` · Lớp ${record.class_name}` : ''}` : 'Khảo thí',
      context: record.notes || `Hạn chấm bài cho ${record.exam_name || 'ca thi'}.`,
      tags: [record.exam_type ? `Hình thức: ${record.exam_type}` : '', record.period_name ? `Đợt ${record.period_name}` : ''].filter(Boolean),
      dueTimestamp: this.parseDate(record.grading_deadline)?.getTime() ?? null,
      accent: 'examination',
      badge: record.subject_code || 'Khảo thí'
    };
  }

  buildSegments(tasks) {
    const overdue = tasks.filter((task) => task.daysUntil !== null && task.daysUntil < 0);
    const today = tasks.filter((task) => task.daysUntil === 0);
    const upcoming = tasks.filter((task) => task.daysUntil !== null && task.daysUntil > 0);
    return { overdue, today, upcoming };
  }

  buildOverviewMetrics(tasks, segments) {
    const highPriorityCount = tasks.filter((task) => task.priority === 'critical' || task.priority === 'high').length;
    const dueSoonCount = tasks.filter((task) => task.daysUntil !== null && task.daysUntil >= 0 && task.daysUntil <= 7).length;

    return [
      {
        key: 'total',
        label: 'Tổng nhắc việc',
        value: tasks.length,
        tone: 'primary',
        hint: `${segments.upcoming.length} việc sắp đến hạn`
      },
      {
        key: 'dueSoon',
        label: 'Đến hạn trong 7 ngày',
        value: dueSoonCount,
        tone: dueSoonCount > 0 ? 'warning' : 'success',
        hint: dueSoonCount > 0 ? 'Ưu tiên hoàn tất đúng hạn' : 'Không có việc sắp đến hạn'
      },
      {
        key: 'overdue',
        label: 'Đang quá hạn',
        value: segments.overdue.length,
        tone: segments.overdue.length > 0 ? 'danger' : 'success',
        hint: segments.overdue.length > 0 ? 'Cần xử lý ngay' : 'Không có việc quá hạn'
      },
      {
        key: 'highPriority',
        label: 'Ưu tiên cao',
        value: highPriorityCount,
        tone: highPriorityCount > 0 ? 'info' : 'muted',
        hint: 'Tập trung nguồn lực xử lý sớm'
      }
    ];
  }

  buildSourceBreakdown(tasks) {
    const aggregation = tasks.reduce((accumulator, task) => {
      if (!accumulator[task.type]) {
        accumulator[task.type] = {
          type: task.type,
          label: task.typeLabel,
          tone: task.typeTone,
          icon: task.icon,
          total: 0,
          overdue: 0,
          dueSoon: 0
        };
      }
      const bucket = accumulator[task.type];
      bucket.total += 1;
      if (task.daysUntil !== null && task.daysUntil < 0) {
        bucket.overdue += 1;
      }
      if (task.daysUntil !== null && task.daysUntil >= 0 && task.daysUntil <= 3) {
        bucket.dueSoon += 1;
      }
      return accumulator;
    }, {});

    return Object.values(aggregation).sort((a, b) => b.total - a.total);
  }

  buildInsights(tasks, segments) {
    const insights = [];
    const overdue = segments.overdue.length;
    const today = segments.today.length;
    const upcoming = segments.upcoming.length;

    if (overdue > 0) {
      insights.push(`Có ${overdue} nhắc việc đã quá hạn, cần ưu tiên xử lý ngay.`);
    } else {
      insights.push('Không có nhắc việc quá hạn, hãy duy trì tiến độ tốt này.');
    }

    if (today > 0) {
      insights.push(`Có ${today} nhắc việc đến hạn trong hôm nay.`);
    } else {
      insights.push('Không có nhắc việc đến hạn trong hôm nay.');
    }

    const criticalTasks = tasks.filter((task) => task.priority === 'critical');
    if (criticalTasks.length > 0) {
      const topCritical = criticalTasks.slice(0, 2).map((task) => task.title).join(', ');
      insights.push(`Các nhiệm vụ khẩn: ${topCritical}${criticalTasks.length > 2 ? '…' : ''}`);
    } else if (upcoming > 0) {
      insights.push('Các nhắc việc còn lại đều nằm trong tầm kiểm soát.');
    }

    return insights;
  }

  buildTimeline(tasks) {
    return tasks
      .filter((task) => Number.isFinite(task.dueTimestamp))
      .sort((a, b) => a.dueTimestamp - b.dueTimestamp)
      .slice(0, 8)
      .map((task) => ({
        id: task.id,
        title: task.title,
        dueDateLabel: task.dueDateLabel,
        relativeLabel: task.relativeLabel,
        typeLabel: task.typeLabel,
        priorityLabel: task.priorityLabel,
        priorityTone: task.priorityTone,
        ownerLabel: task.ownerLabel,
        link: task.link,
        icon: task.icon,
        accent: task.accent
      }));
  }

  async fetchReportSchedules(today) {
    try {
      const records = await this.reportScheduleModel.listActiveWithDepartments();
      return records
        .map((record) => this.normalizeReportSchedule(record, today))
        .filter(Boolean);
    } catch (error) {
      console.error('ReminderController.fetchReportSchedules error:', error);
      return [];
    }
  }

  async fetchDocuments(today) {
    try {
      const [upcomingResult, overdueResult] = await Promise.all([
        this.documentModel.getUpcomingDeadlines(14),
        this.documentModel.getOverdueDocuments()
      ]);

      const upcoming = (upcomingResult || [])
        .map((record) => this.normalizeDocument(record, today, { overdue: false }))
        .filter(Boolean);
      const overdue = (overdueResult || [])
        .map((record) => this.normalizeDocument(record, today, { overdue: true }))
        .filter(Boolean);

      return [...upcoming, ...overdue];
    } catch (error) {
      console.error('ReminderController.fetchDocuments error:', error);
      return [];
    }
  }

  async fetchExaminations(today) {
    try {
      const records = await ExaminationSession.getGradingDeadlines({ daysAhead: 21, daysBehind: 7 });
      return (records || [])
        .map((record) => this.normalizeExamSession(record, today))
        .filter(Boolean);
    } catch (error) {
      console.error('ReminderController.fetchExaminations error:', error);
      return [];
    }
  }

  async index(req, res) {
    const today = this.startOfDay(new Date());

    const [reportTasks, documentTasks, examTasks] = await Promise.all([
      this.fetchReportSchedules(today),
      this.fetchDocuments(today),
      this.fetchExaminations(today)
    ]);

    const tasks = [...reportTasks, ...documentTasks, ...examTasks].sort((a, b) => {
      if (!Number.isFinite(a.dueTimestamp) && !Number.isFinite(b.dueTimestamp)) return 0;
      if (!Number.isFinite(a.dueTimestamp)) return 1;
      if (!Number.isFinite(b.dueTimestamp)) return -1;
      return a.dueTimestamp - b.dueTimestamp;
    });

    const segments = this.buildSegments(tasks);
    const overviewMetrics = this.buildOverviewMetrics(tasks, segments);
    const sourceBreakdown = this.buildSourceBreakdown(tasks);
    const insights = this.buildInsights(tasks, segments);
    const timelineItems = this.buildTimeline(tasks);

    return res.render('reminders/index', {
      title: 'Nhắc việc',
      user: req.session.user,
      overviewMetrics,
      segments,
      sourceBreakdown,
      insights,
      timelineItems,
      taskCount: tasks.length,
      activeTypes: sourceBreakdown.map((item) => item.type),
      todayLabel: today.toLocaleDateString('vi-VN', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    });
  }
}

module.exports = ReminderController;
