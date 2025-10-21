/**
 * ExaminationController
 * Quản lý công tác khảo thí
 */

const ExaminationSession = require('../models/ExaminationSession');
const db = require('../../config/database');
const path = require('path');
const fs = require('fs').promises;
const XLSX = require('xlsx');
const PDFDocument = require('pdfkit');
const { ensurePdfFonts } = require('../utils/pdfFonts');

const IMPORT_HEADER_MAP = {
  'mã ca thi': 'exam_code',
  'ma ca thi': 'exam_code',
  'exam code': 'exam_code',
  'exam_code': 'exam_code',
  'tên ca thi': 'exam_name',
  'ten ca thi': 'exam_name',
  'exam name': 'exam_name',
  'exam_name': 'exam_name',
  'kỳ thi': 'period_name',
  'ky thi': 'period_name',
  'period': 'period_name',
  'period name': 'period_name',
  'period_id': 'period_id',
  'môn học': 'subject_name',
  'mon hoc': 'subject_name',
  'học phần': 'subject_name',
  'hoc phan': 'subject_name',
  'subject name': 'subject_name',
  'subject_name': 'subject_name',
  'subject id': 'subject_id',
  'subject_id': 'subject_id',
  'mã môn': 'subject_code',
  'ma mon': 'subject_code',
  'subject code': 'subject_code',
  'subject_code': 'subject_code',
  'tín chỉ': 'subject_credits',
  'tin chi': 'subject_credits',
  'credits': 'subject_credits',
  'class': 'class_code',
  'lớp': 'class_code',
  'lop': 'class_code',
  'class code': 'class_code',
  'class_code': 'class_code',
  'class id': 'class_id',
  'class_id': 'class_id',
  'class name': 'class_name',
  'class_name': 'class_name',
  'exam date': 'exam_date',
  'ngày thi': 'exam_date',
  'ngay thi': 'exam_date',
  'exam_date': 'exam_date',
  'exam time': 'exam_time',
  'giờ thi': 'exam_time',
  'gio thi': 'exam_time',
  'exam_time': 'exam_time',
  'duration': 'duration',
  'thời lượng': 'duration',
  'thoi luong': 'duration',
  'phòng': 'room',
  'phong': 'room',
  'room': 'room',
  'building': 'building',
  'tòa nhà': 'building',
  'toa nha': 'building',
  'số sv': 'student_count',
  'số sinh viên': 'student_count',
  'so sv': 'student_count',
  'so sinh vien': 'student_count',
  'student count': 'student_count',
  'student_count': 'student_count',
  'expected copies': 'expected_copies',
  'ban in': 'expected_copies',
  'bản in dự kiến': 'expected_copies',
  'ban in du kien': 'expected_copies',
  'grader': 'grader_name',
  'cbct1': 'grader_name',
  'cán bộ chấm 1': 'grader_name',
  'can bo cham 1': 'grader_name',
  'grader name': 'grader_name',
  'grader_name': 'grader_name',
  'grader manual': 'grader_manual_name',
  'grader_manual_name': 'grader_manual_name',
  'grader id': 'grader_id',
  'grader_id': 'grader_id',
  'grader2': 'grader2_name',
  'grader 2': 'grader2_name',
  'cbct2': 'grader2_name',
  'cán bộ chấm 2': 'grader2_name',
  'can bo cham 2': 'grader2_name',
  'grader2 name': 'grader2_name',
  'grader2_name': 'grader2_name',
  'grader2 manual': 'grader2_manual_name',
  'grader2_manual_name': 'grader2_manual_name',
  'grader2 id': 'grader2_id',
  'grader2_id': 'grader2_id',
  'grading deadline': 'grading_deadline',
  'hạn chấm': 'grading_deadline',
  'han cham': 'grading_deadline',
  'grading_deadline': 'grading_deadline',
  'link': 'link',
  'exam type': 'exam_type',
  'exam_type': 'exam_type',
  'hình thức thi': 'exam_type',
  'status': 'status',
  'trạng thái': 'status',
  'trang thai': 'status',
  'notes': 'notes',
  'ghi chú': 'notes',
  'ghi chu': 'notes'
};

const STATUS_LABELS = {
  scheduled: 'Đã lên lịch',
  in_progress: 'Đang diễn ra',
  completed: 'Hoàn thành',
  cancelled: 'Hủy',
  pending: 'Đang cập nhật',
  unknown: 'Không xác định'
};

const PDF_FIELD_DEFINITIONS = {
  exam_code: {
    label: 'Mã ca thi',
    getValue: (session) => session.exam_code || ''
  },
  exam_name: {
    label: 'Tên ca thi',
    getValue: (session) => session.exam_name || session.subject_name || ''
  },
  period_name: {
    label: 'Kỳ thi',
    getValue: (session) => session.period_name || ''
  },
  subject_code: {
    label: 'Mã học phần',
    getValue: (session) => session.subject_code || ''
  },
  subject_name: {
    label: 'Học phần',
    getValue: (session) => session.subject_name || ''
  },
  subject_credits: {
    label: 'Tín chỉ',
    getValue: (session) => (session.subject_credits !== undefined && session.subject_credits !== null) ? String(session.subject_credits) : ''
  },
  class_code: {
    label: 'Lớp',
    getValue: (session) => session.class_code || ''
  },
  class_name: {
    label: 'Tên lớp',
    getValue: (session) => session.class_name || ''
  },
  exam_date: {
    label: 'Ngày thi',
    getValue: (session) => formatDateDisplay(session.exam_date)
  },
  exam_time: {
    label: 'Giờ thi',
    getValue: (session) => formatTimeDisplay(session.exam_time)
  },
  duration: {
    label: 'Thời lượng',
    getValue: (session) => session.duration ? `${session.duration} phút` : ''
  },
  room: {
    label: 'Phòng',
    getValue: (session) => session.room || ''
  },
  building: {
    label: 'Tòa nhà',
    getValue: (session) => session.building || ''
  },
  student_count: {
    label: 'Số SV',
    getValue: (session) => (session.student_count !== undefined && session.student_count !== null) ? String(session.student_count) : ''
  },
  expected_copies: {
    label: 'Bản in dự kiến',
    getValue: (session) => (session.expected_copies !== undefined && session.expected_copies !== null) ? String(session.expected_copies) : ''
  },
  grader_name: {
    label: 'CBCT 1',
    getValue: (session) => session.grader_name || session.grader_manual_name || ''
  },
  grader2_name: {
    label: 'CBCT 2',
    getValue: (session) => session.grader2_name || session.grader2_manual_name || ''
  },
  grading_deadline: {
    label: 'Hạn chấm',
    getValue: (session) => formatDateDisplay(session.grading_deadline)
  },
  status: {
    label: 'Trạng thái',
    getValue: (session) => STATUS_LABELS[session.status] || STATUS_LABELS.unknown
  },
  exam_type: {
    label: 'Hình thức thi',
    getValue: (session) => session.exam_type ? session.exam_type.toUpperCase() : ''
  },
  link: {
    label: 'Liên kết',
    getValue: (session) => session.link || ''
  },
  notes: {
    label: 'Ghi chú',
    getValue: (session) => session.notes || ''
  }
};

const DEFAULT_PDF_FIELDS = ['exam_name', 'class_code', 'exam_date', 'exam_time', 'grader_name', 'status'];

function normalizeHeaderKey(key) {
  if (!key && key !== 0) {
    return '';
  }
  return String(key).trim().toLowerCase();
}

function cleanString(value) {
  if (value === null || value === undefined) {
    return undefined;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : undefined;
  }
  if (typeof value === 'number' && !Number.isNaN(value)) {
    return String(value);
  }
  return undefined;
}

function parseDateLike(value) {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }

  if (value instanceof Date) {
    if (!Number.isNaN(value.getTime())) {
      return value.toISOString().substring(0, 10);
    }
    return undefined;
  }

  if (typeof value === 'number' && !Number.isNaN(value)) {
    const parsed = XLSX.SSF && XLSX.SSF.parse_date_code ? XLSX.SSF.parse_date_code(value) : null;
    if (parsed) {
      const jsDate = new Date(Date.UTC(parsed.y, (parsed.m || 1) - 1, parsed.d || 1));
      if (!Number.isNaN(jsDate.getTime())) {
        return jsDate.toISOString().substring(0, 10);
      }
    }
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return undefined;
    }

    // Try native Date first (supports ISO strings)
    const native = new Date(trimmed);
    if (!Number.isNaN(native.getTime())) {
      return native.toISOString().substring(0, 10);
    }

    // Handle dd/mm/yyyy or dd-mm-yyyy
    const match = trimmed.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/);
    if (match) {
      let [, day, month, year] = match;
      if (year.length === 2) {
        year = `20${year}`;
      }
      const jsDate = new Date(Number(year), Number(month) - 1, Number(day));
      if (!Number.isNaN(jsDate.getTime())) {
        return jsDate.toISOString().substring(0, 10);
      }
    }
  }

  return undefined;
}

function toTwoDigits(value) {
  return value < 10 ? `0${value}` : String(value);
}

function parseTimeLike(value) {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }

  if (value instanceof Date) {
    if (!Number.isNaN(value.getTime())) {
      return value.toTimeString().substring(0, 5);
    }
    return undefined;
  }

  if (typeof value === 'number' && !Number.isNaN(value)) {
    const totalMinutes = Math.round(value * 24 * 60);
    const hours = Math.floor(totalMinutes / 60) % 24;
    const minutes = totalMinutes % 60;
    return `${toTwoDigits(hours)}:${toTwoDigits(minutes)}`;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return undefined;
    }

    const colonMatch = trimmed.match(/^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/);
    if (colonMatch) {
      const hours = Math.min(Number(colonMatch[1]), 23);
      const minutes = Math.min(Number(colonMatch[2]), 59);
      return `${toTwoDigits(hours)}:${toTwoDigits(minutes)}`;
    }

    const letterMatch = trimmed.match(/^(\d{1,2})h(\d{1,2})?$/i);
    if (letterMatch) {
      const hours = Math.min(Number(letterMatch[1]), 23);
      const minutes = letterMatch[2] ? Math.min(Number(letterMatch[2]), 59) : 0;
      return `${toTwoDigits(hours)}:${toTwoDigits(minutes)}`;
    }
  }

  return undefined;
}

function safeInteger(value) {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }

  const num = Number(value);
  if (!Number.isFinite(num)) {
    return undefined;
  }
  return Math.round(num);
}

function formatDateDisplay(value) {
  const iso = parseDateLike(value || null);
  if (!iso) {
    return '';
  }
  try {
    const date = new Date(iso);
    return date.toLocaleDateString('vi-VN');
  } catch (error) {
    return iso;
  }
}

function formatTimeDisplay(value) {
  const time = parseTimeLike(value || null);
  return time || '';
}

function normalizeStatusValue(value) {
  const cleaned = cleanString(value);
  if (!cleaned) {
    return undefined;
  }

  const normalized = cleaned.toLowerCase();
  if (['scheduled', 'đã lên lịch', 'da len lich', 'len lich', 'planned'].includes(normalized)) {
    return 'scheduled';
  }
  if (['in_progress', 'đang thi', 'dang thi', 'in progress', 'ongoing'].includes(normalized)) {
    return 'in_progress';
  }
  if (['completed', 'hoàn thành', 'hoan thanh', 'done', 'finished'].includes(normalized)) {
    return 'completed';
  }
  if (['cancelled', 'canceled', 'hủy', 'huy'].includes(normalized)) {
    return 'cancelled';
  }
  if (['pending', 'đang cập nhật', 'dang cap nhat'].includes(normalized)) {
    return 'pending';
  }
  return undefined;
}

class ExaminationController {
  constructor() {
    this.db = db;
  }

  /**
   * Trang danh sách ca thi (thay thế placeholder)
   */
  async index(req, res) {
    console.log('🚨🚨🚨 EXAMINATION INDEX CALLED 🚨🚨🚨');
    console.log('User:', req.session?.user?.username);
    console.log('Query:', req.query);
    
    try {
      console.log('📋 Examination index - Start');
      
      const graderQuery = typeof req.query.grader === 'string' ? req.query.grader.trim() : undefined;

      const filters = {
        period_id: req.query.period_id,
        status: req.query.status,
        search: req.query.search,
        grader: graderQuery || undefined
      };
      
      console.log('📋 Filters:', filters);
      
      let sessions = await ExaminationSession.findAll(filters);
      // Coerce to array in case a single object is returned by mistake
      if (!Array.isArray(sessions)) {
        sessions = sessions ? [sessions] : [];
      }
      console.log('📋 Sessions retrieved:', Array.isArray(sessions) ? sessions.length : 'not-array');

      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const sevenDaysFromNow = new Date(startOfToday);
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

      const statusCounts = { scheduled: 0, in_progress: 0, completed: 0, other: 0 };
      const unassignedSessions = [];
      const upcomingSessions = [];
      const overdueGrading = [];
      const gradingDueSoon = [];

      sessions.forEach((session) => {
        const statusKey = session.status || 'other';
        if (statusCounts[statusKey] !== undefined) {
          statusCounts[statusKey] += 1;
        } else {
          statusCounts.other += 1;
        }

    const graderNotAssigned = !session.grader_id && !session.grader_manual_name && !session.grader2_id && !session.grader2_manual_name;
        if (graderNotAssigned) {
          unassignedSessions.push(session);
        }

        const examDate = session.exam_date ? new Date(session.exam_date) : null;
        if (examDate && !Number.isNaN(examDate.getTime())) {
          upcomingSessions.push({ ...session, examDate });
        }

        const gradingDeadline = session.grading_deadline ? new Date(session.grading_deadline) : null;
        if (gradingDeadline && !Number.isNaN(gradingDeadline.getTime()) && session.status !== 'completed') {
          const deadlineDate = new Date(gradingDeadline.getFullYear(), gradingDeadline.getMonth(), gradingDeadline.getDate());
          if (deadlineDate < startOfToday) {
            overdueGrading.push(session);
          } else if (deadlineDate <= sevenDaysFromNow) {
            gradingDueSoon.push(session);
          }
        }
      });

      upcomingSessions.sort((a, b) => a.examDate - b.examDate);
      const nextUpcoming = upcomingSessions.find((item) => item.examDate >= startOfToday) || null;

      const insights = {
        totalSessions: sessions.length,
        statusCounts,
        unassignedCount: unassignedSessions.length,
        nextUpcoming: nextUpcoming
          ? {
              id: nextUpcoming.id,
              name: nextUpcoming.exam_name || nextUpcoming.subject_name,
              classCode: nextUpcoming.class_code,
              date: nextUpcoming.examDate,
              time: nextUpcoming.exam_time,
              status: nextUpcoming.status || 'scheduled'
            }
          : null,
        overdueGradingCount: overdueGrading.length,
        gradingDueSoonCount: gradingDueSoon.length
      };

      const alerts = {
        overdueGrading,
        gradingDueSoon,
        unassignedSessions: unassignedSessions.slice(0, 5)
      };
      
      const fieldOrder = Array.from(new Set([
        ...DEFAULT_PDF_FIELDS,
        ...Object.keys(PDF_FIELD_DEFINITIONS)
      ]));
      const pdfFieldOptions = fieldOrder
        .filter((key) => PDF_FIELD_DEFINITIONS[key])
        .map((key) => ({
          key,
          label: PDF_FIELD_DEFINITIONS[key].label
        }));

  // Load periods cho dropdown filter
  const periods = await this.db.query('SELECT id, name FROM examination_periods ORDER BY created_at DESC');
      const graders = await this.db.query(
        'SELECT id, full_name, email FROM users WHERE role_id IN (1, 2) AND is_active = 1 ORDER BY full_name'
      );
      
      console.log('📋 About to render view...');
      console.log('📋 Sessions array length:', sessions.length);
      console.log('📋 User:', req.session.user ? req.session.user.username : 'No user');
      
      // Prevent caching the list page to ensure newly saved/updated data shows immediately
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');

      res.render('examination/list', {
        title: 'Công tác khảo thí',
        user: req.session.user,
        sessions: sessions || [],
        periods: periods || [],
        graders: graders || [],
        filters: {
          period_id: filters.period_id || '',
          status: filters.status || '',
          search: req.query.search || '',
          grader: graderQuery || ''
        },
        isAuthenticated: !!req.session.user,
        appName: 'Quản lý Giáo vụ',
        insights,
        alerts,
        pdfFieldOptions,
        defaultPdfFields: DEFAULT_PDF_FIELDS
      });
      
      console.log('📋 Render completed successfully');
    } catch (error) {
      console.error('❌ Error loading examination list:', error);
      console.error('❌ Stack:', error.stack);
      res.status(500).render('error', {
        message: 'Không thể tải danh sách ca thi',
        error: error
      });
    }
  }

  /**
   * Form tạo ca thi mới
   */
  async create(req, res) {
    try {
      // Load periods
      const periods = await this.db.query('SELECT * FROM examination_periods WHERE status = ? ORDER BY created_at DESC', ['active']);
      
      // Load subjects
      const subjects = await this.db.query('SELECT * FROM subjects WHERE status = ? ORDER BY name', ['active']);
      
      // Load classes
      const classes = await this.db.query('SELECT * FROM classes WHERE status = ? ORDER BY code', ['active']);
      
      // Load graders (users with role admin or staff)
      const graders = await this.db.query(
        'SELECT id, full_name, email FROM users WHERE role_id IN (1, 2) AND is_active = 1 ORDER BY full_name'
      );
      
      res.render('examination/form', {
        title: 'Tạo ca thi mới',
        user: req.session.user,
        session: null,
        periods: periods || [],
        subjects: subjects || [],
        classes: classes || [],
  graders: graders || [],
        isAuthenticated: !!req.session.user,
        appName: 'Quản lý Giáo vụ'
      });
    } catch (error) {
      console.error('Error loading create form:', error);
      res.status(500).render('error', {
        message: 'Không thể tải form',
        error: error
      });
    }
  }

  /**
   * Lưu ca thi mới
   */
  async store(req, res) {
    try {
      const { createData } = await this.buildCreatePayload(req.body);
      const sessionId = await ExaminationSession.create(createData);
      
      res.json({
        success: true,
        message: 'Tạo ca thi thành công',
        session_id: sessionId
      });
    } catch (error) {
      console.error('Error creating session:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi tạo ca thi',
        error: error.message
      });
    }
  }

  async buildCreatePayload(rawData = {}) {
    const data = { ...rawData };

    if (data.period_id === '') {
      data.period_id = null;
    }

    if (data.period_id !== null && data.period_id !== undefined) {
      const numericId = Number(data.period_id);
      data.period_id = Number.isNaN(numericId) ? null : numericId;
    }

    const periodName = cleanString(data.period_name);
    if (!data.period_id && periodName) {
      const existingPeriod = await this.db.query(
        'SELECT id FROM examination_periods WHERE name = ? LIMIT 1',
        [periodName]
      );

      if (existingPeriod.length > 0) {
        data.period_id = existingPeriod[0].id;
      } else {
        const result = await this.db.query(
          'INSERT INTO examination_periods (name, status) VALUES (?, ?)',
          [periodName, 'active']
        );
        data.period_id = result.insertId;
      }
    }

    await this.resolveSubjectInput(data);
    await this.resolveClassInput(data);
    await this.resolveGraderInput(data);

    const supportsSecondary = await ExaminationSession.supportsSecondaryGrader();
    if (!supportsSecondary) {
      data.grader2_id = null;
      data.grader2_manual_name = null;
    }

    const textFields = ['exam_code', 'exam_name', 'room', 'building', 'link', 'notes'];
    textFields.forEach((field) => {
      if (data[field] !== undefined && data[field] !== null) {
        const cleaned = cleanString(data[field]);
        data[field] = cleaned !== undefined ? cleaned : null;
      }
    });

    const normalizedExamDate = parseDateLike(data.exam_date);
    data.exam_date = normalizedExamDate || null;

    const normalizedDeadline = parseDateLike(data.grading_deadline);
    data.grading_deadline = normalizedDeadline || null;

    const normalizedTime = parseTimeLike(data.exam_time);
    data.exam_time = normalizedTime || null;

    const durationValue = safeInteger(data.duration);
    data.duration = durationValue !== undefined ? Math.max(durationValue, 0) : null;

    const studentCountValue = safeInteger(data.student_count);
    data.student_count = studentCountValue !== undefined ? Math.max(studentCountValue, 0) : 0;

    const expectedCopiesValue = safeInteger(data.expected_copies);
    data.expected_copies = expectedCopiesValue !== undefined ? Math.max(expectedCopiesValue, 0) : null;

    const examType = cleanString(data.exam_type);
    if (examType) {
      const normalizedType = examType.toLowerCase();
      data.exam_type = ['offline', 'online', 'hybrid'].includes(normalizedType) ? normalizedType : 'offline';
    } else {
      data.exam_type = 'offline';
    }

    const normalizedStatus = normalizeStatusValue(data.status);
    data.status = normalizedStatus || 'scheduled';

    if (!data.period_id) {
      throw new Error('Thiếu thông tin kỳ thi (period_id hoặc period_name).');
    }

    if (!data.subject_id) {
      throw new Error('Thiếu thông tin học phần (subject_id hoặc subject_name).');
    }

    data.exam_name = cleanString(data.exam_name);
    if (!data.exam_name) {
      throw new Error('Thiếu tên ca thi (exam_name).');
    }

    if (!data.exam_date) {
      throw new Error('Thiếu ngày thi hợp lệ (exam_date).');
    }

    data.exam_code = cleanString(data.exam_code);
    if (!data.exam_code) {
      data.exam_code = `EXAM-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Date.now().toString().slice(-4)}`;
    }

    delete data.period_name;
    delete data.subject_name;
    delete data.class_name;
    delete data.class_code;
    delete data.grader_name;
    delete data.grader2_name;
    delete data.subject_credits;

    if (data.grader_manual_name && data.grader_manual_name.length > 120) {
      data.grader_manual_name = data.grader_manual_name.substring(0, 120);
    }

    if (data.grader2_manual_name && data.grader2_manual_name.length > 120) {
      data.grader2_manual_name = data.grader2_manual_name.substring(0, 120);
    }

    const allowed = [
      'period_id','subject_id','class_id','exam_code','exam_name','exam_date','exam_time','duration',
      'room','building','student_count','expected_copies','grader_id','grader_manual_name','grader2_id','grader2_manual_name','grading_deadline','link','exam_type','status','notes'
    ];

    const createData = {};
    allowed.forEach((key) => {
      if (data[key] !== undefined) {
        createData[key] = data[key];
      }
    });

    if (createData.student_count === undefined) {
      createData.student_count = 0;
    }

    return { createData };
  }

  async importExcel(req, res) {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn file Excel (.xlsx) để nhập dữ liệu'
      });
    }

    const stats = {
      totalRows: 0,
      processed: 0,
      inserted: 0,
      skipped: 0,
      errors: []
    };

    const dateFields = new Set(['exam_date', 'grading_deadline']);
    const timeFields = new Set(['exam_time']);
    const numericFields = new Set(['period_id', 'subject_id', 'class_id', 'student_count', 'expected_copies', 'duration', 'grader_id', 'grader2_id', 'subject_credits']);

    try {
      const excelMimeTypes = new Set([
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ]);
      const allowedExtensions = ['.xlsx', '.xls'];
      const fileExtension = path.extname(req.file.originalname || '').toLowerCase();
      const isValidMime = excelMimeTypes.has(req.file.mimetype);
      const isValidExt = allowedExtensions.includes(fileExtension);
      if (!isValidMime && !isValidExt) {
        throw new Error('Vui lòng chọn file Excel hợp lệ (.xlsx hoặc .xls).');
      }

      const workbook = XLSX.readFile(req.file.path, { cellDates: true });
      const firstSheetName = workbook.SheetNames[0];

      if (!firstSheetName) {
        throw new Error('File Excel không chứa sheet dữ liệu hợp lệ');
      }

      const sheet = workbook.Sheets[firstSheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        raw: true,
        blankrows: false
      });

      if (!rows.length) {
        throw new Error('File Excel không có dữ liệu để nhập');
      }

      const headerRow = rows[0];
      console.log('📋 Excel header row:', headerRow);
      
      const columnMap = headerRow.map((cell) => {
        const normalized = normalizeHeaderKey(cell);
        if (!normalized) {
          return null;
        }
        return IMPORT_HEADER_MAP[normalized] || normalized;
      });
      
      console.log('📋 Column mapping:', columnMap);

      const recognizedColumns = columnMap.filter(Boolean);
      console.log('📋 Recognized columns:', recognizedColumns);
      
      if (!recognizedColumns.length) {
        throw new Error('Không nhận diện được cột dữ liệu hợp lệ trong file Excel.');
      }

      stats.totalRows = rows.length - 1;

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];

        if (!Array.isArray(row)) {
          stats.skipped += 1;
          continue;
        }

        const hasContent = row.some((cell) => {
          if (cell === null || cell === undefined) {
            return false;
          }
          if (typeof cell === 'string') {
            return cell.trim().length > 0;
          }
          return true;
        });

        if (!hasContent) {
          stats.skipped += 1;
          continue;
        }

        stats.processed += 1;

        try {
          const rawData = {};

          row.forEach((cell, idx) => {
            const key = columnMap[idx];
            if (!key || cell === null || cell === undefined) {
              return;
            }

            if (dateFields.has(key) || timeFields.has(key)) {
              rawData[key] = cell;
              return;
            }

            if (numericFields.has(key)) {
              rawData[key] = cell;
              return;
            }

            if (typeof cell === 'string') {
              const trimmed = cell.trim();
              if (trimmed.length > 0) {
                rawData[key] = trimmed;
              }
            } else if (cell instanceof Date) {
              rawData[key] = cell;
            } else {
              rawData[key] = String(cell).trim();
            }
          });

          if (Object.keys(rawData).length === 0) {
            stats.skipped += 1;
            continue;
          }

          console.log(`📋 Processing row ${i + 1}, raw data:`, rawData);
          
          const { createData } = await this.buildCreatePayload(rawData);
          console.log(`📋 Create payload for row ${i + 1}:`, createData);
          
          const sessionId = await ExaminationSession.create(createData);
          console.log(`✅ Created examination session #${sessionId} from Excel row ${i + 1}`);
          stats.inserted += 1;
        } catch (rowError) {
          console.error(`❌ Error importing row ${i + 1}:`, rowError.message);
          if (stats.errors.length < 50) {
            stats.errors.push({
              row: i + 1,
              message: rowError.message || 'Không rõ lỗi'
            });
          }
        }
      }

      console.log(`📊 Import completed: ${stats.inserted} inserted, ${stats.skipped} skipped, ${stats.errors.length} errors`);

      res.json({
        success: stats.errors.length === 0,
        message: stats.errors.length === 0 ? 'Nhập dữ liệu thành công' : 'Hoàn tất nhập liệu với một số cảnh báo',
        stats
      });
    } catch (error) {
      console.error('Error importing examination Excel:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi khi nhập dữ liệu từ Excel'
      });
    } finally {
      if (req.file && req.file.path) {
        await fs.unlink(req.file.path).catch(() => {});
      }
    }
  }

  async exportPdf(req, res) {
    let doc;
    try {
      const body = (req.body && typeof req.body === 'object') ? req.body : {};
      const requestedFields = Array.isArray(body.fields) ? body.fields : [];

      const normalizedFields = requestedFields
        .map((key) => {
          if (typeof key === 'string') {
            return key.trim();
          }
          if (key === null || key === undefined) {
            return '';
          }
          return String(key).trim();
        })
        .filter((key) => key && PDF_FIELD_DEFINITIONS[key]);

      const fields = normalizedFields.length ? normalizedFields : DEFAULT_PDF_FIELDS;
      const fieldConfigs = fields.map((key) => ({
        key,
        label: PDF_FIELD_DEFINITIONS[key].label,
        getValue: PDF_FIELD_DEFINITIONS[key].getValue || ((session) => {
          const value = session[key];
          return value === undefined || value === null ? '' : String(value);
        })
      }));

      if (!fieldConfigs.length) {
        return res.status(400).json({
          success: false,
          message: 'Không có trường dữ liệu hợp lệ được chọn để xuất.'
        });
      }

      const incomingFilters = (body.filters && typeof body.filters === 'object') ? body.filters : {};
      const filters = {
        period_id: incomingFilters.period_id || undefined,
        status: incomingFilters.status || undefined,
        search: incomingFilters.search || undefined,
        grader: incomingFilters.grader || undefined
      };

      let sessions = await ExaminationSession.findAll(filters);
      if (!Array.isArray(sessions)) {
        sessions = sessions ? [sessions] : [];
      }

      const orientation = body.layout?.orientation === 'landscape' ? 'landscape' : 'portrait';
      const fontPaths = await ensurePdfFonts();

      const now = new Date();
      const safeTimestamp = now.toISOString().slice(0, 19).replace(/[:T]/g, '-');
      const filename = `lich-thi_${safeTimestamp}.pdf`;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      doc = new PDFDocument({ size: 'A4', margin: 42, layout: orientation });
      doc.pipe(res);

      let regularFont = 'Helvetica';
      let boldFont = 'Helvetica-Bold';

      if (fontPaths.regular) {
        try {
          doc.registerFont('Exam-Regular', fontPaths.regular);
          regularFont = 'Exam-Regular';
        } catch (fontError) {
          console.warn('Không thể đăng ký font PDF (regular):', fontError.message || fontError);
        }
      }

      if (fontPaths.bold) {
        try {
          doc.registerFont('Exam-Bold', fontPaths.bold);
          boldFont = 'Exam-Bold';
        } catch (fontError) {
          console.warn('Không thể đăng ký font PDF (bold):', fontError.message || fontError);
        }
      }

      doc.font(boldFont).fontSize(18).fillColor('#1f2937').text('Lịch thi - Công tác khảo thí', { align: 'center' });
      doc.moveDown(0.5);
      doc.font(regularFont).fontSize(10).fillColor('#374151').text(`Ngày xuất: ${now.toLocaleString('vi-VN', { hour12: false })}`);
      doc.moveDown(0.25);

      const filterSummary = [];
      if (filters.period_id) {
        filterSummary.push(`Kỳ thi #${filters.period_id}`);
      }
      if (filters.status) {
        filterSummary.push(`Trạng thái: ${STATUS_LABELS[filters.status] || filters.status}`);
      }
      if (filters.grader) {
        filterSummary.push(`Cán bộ: ${filters.grader}`);
      }
      if (filters.search) {
        filterSummary.push(`Từ khóa: "${filters.search}"`);
      }

      if (filterSummary.length) {
        doc.font(regularFont).fontSize(10).fillColor('#4b5563').text(`Bộ lọc: ${filterSummary.join(' | ')}`);
        doc.moveDown(0.25);
      }

      doc.font(regularFont).fontSize(10).fillColor('#111827').text(`Tổng số ca thi: ${sessions.length}`);
      doc.moveDown(0.75);

      const tableLeft = doc.page.margins.left;
      const tableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
      const columnWidth = tableWidth / fieldConfigs.length;

      doc.font(boldFont).fontSize(11);
      const headerHeight = doc.heightOfString('Header', { width: columnWidth, align: 'left' });

      const drawHeader = () => {
        const headerY = doc.y;
        doc.font(boldFont).fontSize(11).fillColor('#1f2937');
        fieldConfigs.forEach((column, idx) => {
          doc.text(column.label, tableLeft + idx * columnWidth, headerY, {
            width: columnWidth,
            align: 'left'
          });
        });
        const separatorY = headerY + headerHeight + 4;
        doc.moveTo(tableLeft, separatorY).lineTo(tableLeft + tableWidth, separatorY).strokeColor('#6f42c1').lineWidth(1).stroke();
        doc.y = separatorY + 6;
        doc.font(regularFont).fontSize(10).fillColor('#111827');
      };

      const ensureSpaceFor = (expectedHeight) => {
        const bottomLimit = doc.page.height - doc.page.margins.bottom;
        if (doc.y + expectedHeight > bottomLimit) {
          doc.addPage({ layout: orientation });
          drawHeader();
        }
      };

      drawHeader();

      if (!sessions.length) {
        doc.moveDown(1);
        doc.font(regularFont).fontSize(12).fillColor('#6b7280').text('Không có dữ liệu phù hợp với bộ lọc hiện tại.', { align: 'center' });
        doc.moveDown(1);
  doc.font(regularFont).fontSize(9).fillColor('#9ca3af').text('Xuất bởi Hệ thống Quản lý Giáo vụ', { align: 'right' });
        doc.end();
        return;
      }

      sessions.forEach((session) => {
        const values = fieldConfigs.map((column) => {
          try {
            return column.getValue(session) || '';
          } catch (fieldError) {
            console.warn('Không thể lấy giá trị trường PDF:', column.key, fieldError.message || fieldError);
            const raw = session[column.key];
            return raw === undefined || raw === null ? '' : String(raw);
          }
        });

        doc.font(regularFont).fontSize(10);

        const cellHeights = values.map((value) => doc.heightOfString(String(value), {
          width: columnWidth,
          align: 'left'
        }));
        const rowHeight = Math.max(...cellHeights, 14);

        ensureSpaceFor(rowHeight + 14);

        const rowTop = doc.y;
        values.forEach((value, idx) => {
          doc.text(String(value), tableLeft + idx * columnWidth, rowTop, {
            width: columnWidth,
            align: 'left'
          });
        });

        const rowBottom = rowTop + rowHeight;
        doc.moveTo(tableLeft, rowBottom + 4).lineTo(tableLeft + tableWidth, rowBottom + 4).strokeColor('#e5e7eb').lineWidth(0.5).stroke();
        doc.y = rowBottom + 8;
      });

      doc.moveDown(0.5);
  doc.font(regularFont).fontSize(9).fillColor('#9ca3af').text('Xuất bởi Hệ thống Quản lý Giáo vụ', { align: 'right' });

      doc.end();
    } catch (error) {
      console.error('Error exporting examination PDF:', error);
      if (doc) {
        try {
          doc.end();
        } catch (endError) {
          console.warn('Không thể kết thúc luồng PDF sau lỗi:', endError.message || endError);
        }
      }
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: error.message || 'Không thể xuất PDF'
        });
      } else {
        res.end();
      }
    }
  }

  async downloadImportTemplate(req, res) {
    try {
      const columns = [
        { header: 'Mã ca thi', example: 'CT-001', note: 'Có thể bỏ trống, hệ thống sẽ tự tạo nếu để trống.' },
        { header: 'Tên ca thi', example: 'Ca thi Điều tra cơ bản', note: 'Tên hiển thị trong danh sách.' },
        { header: 'Kỳ thi', example: 'Học kỳ I 2025-2026', note: 'Tên kỳ thi. Nếu chưa tồn tại sẽ được tạo mới.' },
        { header: 'Mã môn', example: 'AN101', note: 'Mã học phần (tùy chọn nhưng nên có để nhận diện).' },
        { header: 'Học phần', example: 'Điều tra cơ bản', note: 'Tên học phần. Nếu chưa có sẽ tạo mới.' },
        { header: 'Tín chỉ', example: '3', note: 'Số tín chỉ (tùy chọn).' },
        { header: 'Lớp', example: '01B', note: 'Mã hoặc tên lớp. Hệ thống sẽ dò tìm hoặc tạo mới.' },
        { header: 'Ngày thi', example: '20/10/2025', note: 'Định dạng dd/mm/yyyy hoặc yyyy-mm-dd.' },
        { header: 'Giờ thi', example: '13:30', note: 'Định dạng hh:mm (24 giờ).' },
        { header: 'Thời lượng', example: '90', note: 'Số phút làm bài (số nguyên ≥ 0).' },
        { header: 'Phòng', example: 'P201', note: 'Phòng thi (tùy chọn).' },
        { header: 'Tòa nhà', example: 'A2', note: 'Tòa nhà (tùy chọn).' },
        { header: 'Số SV', example: '45', note: 'Số lượng sinh viên tham dự (số nguyên ≥ 0).' },
        { header: 'Bản in dự kiến', example: '50', note: 'Số lượng bản in dự kiến (số nguyên ≥ 0).' },
        { header: 'CBCT1', example: 'Nguyễn Văn A', note: 'Nhập tên hoặc "Tên (email@domain)".' },
        { header: 'CBCT2', example: 'Trần Thị B', note: 'Tùy chọn. Nhập tên hoặc "Tên (email@domain)".' },
        { header: 'Hạn chấm', example: '25/10/2025', note: 'Định dạng dd/mm/yyyy hoặc yyyy-mm-dd.' },
        { header: 'Hình thức thi', example: 'offline', note: 'Giá trị hợp lệ: offline | online | hybrid.' },
        { header: 'Trạng thái', example: 'scheduled', note: 'Giá trị hợp lệ: scheduled | in_progress | completed | cancelled | pending.' },
        { header: 'Link', example: 'https://exam.example.com', note: 'Liên kết thi online (tùy chọn).' },
        { header: 'Ghi chú', example: 'Chuẩn bị đề dự phòng', note: 'Thông tin bổ sung (tùy chọn).' }
      ];

      const headerRow = columns.map((column) => column.header);
      const exampleRow = columns.map((column) => column.example || '');
      const noteRow = columns.map((column) => column.note || '');

      const sheetData = [headerRow, exampleRow, noteRow];
      const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
      worksheet['!cols'] = columns.map(() => ({ wch: 24 }));

      // Highlight note row to make instruction clearer
      noteRow.forEach((note, index) => {
        const cellRef = XLSX.utils.encode_cell({ r: 2, c: index });
        if (worksheet[cellRef]) {
          worksheet[cellRef].s = {
            font: { italic: true, color: { rgb: '555555' } }
          };
        }
      });

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Nhap_lich_thi');

      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="mau-nhap-lich-thi.xlsx"');
      res.send(buffer);
    } catch (error) {
      console.error('Error generating examination template:', error);
      res.status(500).json({
        success: false,
        message: 'Không thể tạo file mẫu Excel. Vui lòng thử lại sau.'
      });
    }
  }

  /**
   * Chi tiết ca thi
   */
  async show(req, res) {
    try {
      const session = await ExaminationSession.findById(req.params.id);
      
      if (!session) {
        return res.status(404).render('error', {
          message: 'Không tìm thấy ca thi'
        });
      }
      
      res.render('examination/detail', {
        title: 'Chi tiết ca thi',
        user: req.session.user,
        session
      });
    } catch (error) {
      console.error('Error loading session detail:', error);
      res.status(500).render('error', {
        message: 'Không thể tải thông tin ca thi',
        error: error
      });
    }
  }

  /**
   * Form chỉnh sửa
   */
  async edit(req, res) {
    try {
      const session = await ExaminationSession.findById(req.params.id);
      
      if (!session) {
        return res.status(404).render('error', {
          message: 'Không tìm thấy ca thi'
        });
      }
      
      // Load periods
      const periods = await this.db.query('SELECT * FROM examination_periods ORDER BY created_at DESC');
      
      // Load subjects
      const subjects = await this.db.query('SELECT * FROM subjects WHERE status = ? ORDER BY name', ['active']);
      
      // Load classes
      const classes = await this.db.query('SELECT * FROM classes WHERE status = ? ORDER BY code', ['active']);
      
      // Load graders
      const graders = await this.db.query(
        'SELECT id, full_name, email FROM users WHERE role_id IN (1, 2) AND is_active = 1 ORDER BY full_name'
      );
      
      res.render('examination/form', {
        title: 'Chỉnh sửa ca thi',
        user: req.session.user,
        session,
        periods: periods || [],
        subjects: subjects || [],
        classes: classes || [],
        graders: graders || [],
        isAuthenticated: !!req.session.user,
        appName: 'Quản lý Giáo vụ'
      });
    } catch (error) {
      console.error('Error loading edit form:', error);
      res.status(500).render('error', {
        message: 'Không thể tải form chỉnh sửa',
        error: error
      });
    }
  }

  /**
   * Cập nhật ca thi
   */
  async update(req, res) {
    try {
      // Handle manual input fields (same as store)
      const data = { ...req.body };

      // Period handling
      if (data.period_name && !data.period_id) {
        const existingPeriod = await this.db.query(
          'SELECT id FROM examination_periods WHERE name = ?',
          [data.period_name]
        );
        if (existingPeriod.length > 0) {
          data.period_id = existingPeriod[0].id;
        } else {
          const result = await this.db.query(
            'INSERT INTO examination_periods (name, status) VALUES (?, ?)',
            [data.period_name, 'active']
          );
          data.period_id = result.insertId;
        }
      }

      await this.resolveSubjectInput(data);

      await this.resolveClassInput(data);

      // Convert empty date strings to null to prevent MySQL errors
      if (data.exam_date === '') data.exam_date = null;
      if (data.grading_deadline === '') data.grading_deadline = null;
      if (data.exam_time === '') data.exam_time = null;
      if (data.duration !== undefined) data.duration = data.duration === '' ? null : Number(data.duration);
      if (data.student_count !== undefined) data.student_count = data.student_count === '' ? 0 : Number(data.student_count);
      if (data.expected_copies !== undefined) data.expected_copies = data.expected_copies === '' ? null : Number(data.expected_copies);

      await this.resolveGraderInput(data);

      const supportsSecondary = await ExaminationSession.supportsSecondaryGrader();
      if (!supportsSecondary) {
        delete data.grader2_id;
        delete data.grader2_manual_name;
      }

      // Remove helper fields (names) so dynamic update doesn't try to set non-existent columns
      delete data.period_name;
      delete data.subject_name;
  delete data.class_name;
    delete data.class_code;
      delete data.grader_name;
      delete data.grader2_name;
  delete data.subject_credits;

      // Whitelist fields for update to avoid unexpected keys
      const allowed = new Set([
        'period_id','subject_id','class_id','exam_code','exam_name','exam_date','exam_time','duration',
        'room','building','student_count','expected_copies','grader_id','grader_manual_name','grader2_id','grader2_manual_name','grading_deadline','link','exam_type','status','notes'
      ]);
      const sanitized = {};
      for (const [k,v] of Object.entries(data)) {
        if (allowed.has(k)) sanitized[k] = v;
      }

      await ExaminationSession.update(req.params.id, sanitized);
      
      res.json({
        success: true,
        message: 'Cập nhật ca thi thành công'
      });
    } catch (error) {
      console.error('Error updating session:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi cập nhật ca thi',
        error: error.message
      });
    }
  }

  parseSubjectCredits(value) {
    if (value === undefined || value === null || value === '') {
      return null;
    }

    const numeric = Number(value);
    return Number.isNaN(numeric) ? null : numeric;
  }

  async resolveSubjectInput(data) {
    if (!data) {
      return;
    }

    const subjectCredits = this.parseSubjectCredits(data.subject_credits);
    data.subject_credits = subjectCredits;

    if (data.subject_id === '') {
      data.subject_id = null;
    }

    if (data.subject_id !== null && data.subject_id !== undefined) {
      const numericId = Number(data.subject_id);
      data.subject_id = Number.isNaN(numericId) ? null : numericId;
    }

    const rawSubjectCode = cleanString(data.subject_code);
    let subjectName = cleanString(data.subject_name);

    // If only a subject code is supplied, try to resolve the subject first
    if (!subjectName && rawSubjectCode && !data.subject_id) {
      const existingByCode = await this.db.query(
        'SELECT id, name, credits FROM subjects WHERE code = ? LIMIT 1',
        [rawSubjectCode]
      );
      if (existingByCode.length > 0) {
        const subjectRow = existingByCode[0];
        data.subject_id = subjectRow.id;
        subjectName = subjectRow.name ? String(subjectRow.name).trim() : subjectName;
        if (subjectCredits !== null && subjectRow.credits !== subjectCredits) {
          await this.db.query(
            'UPDATE subjects SET credits = ? WHERE id = ? LIMIT 1',
            [subjectCredits, subjectRow.id]
          );
        }
      }
    }

    if (subjectName && !data.subject_id) {
      let code = rawSubjectCode || null;
      let name = subjectName;

      const separatorIndex = subjectName.indexOf(' - ');
      if (!code && separatorIndex !== -1) {
        code = subjectName.slice(0, separatorIndex).trim();
        name = subjectName.slice(separatorIndex + 3).trim();
      }

      if (!code || code.length === 0) {
        code = subjectName.replace(/\s+/g, '').substring(0, 20).toUpperCase();
      }

      const existingSubject = await this.db.query(
        'SELECT id, code, credits FROM subjects WHERE code = ? OR name = ? LIMIT 1',
        [code, name]
      );

      if (existingSubject.length > 0) {
        const subjectRow = existingSubject[0];
        data.subject_id = subjectRow.id;

        // Keep subject code in sync if the upload provided a different one
        if (rawSubjectCode && subjectRow.code !== rawSubjectCode) {
          const trimmedCode = rawSubjectCode.substring(0, 20);
          const conflicts = await this.db.query(
            'SELECT id FROM subjects WHERE code = ? AND id <> ? LIMIT 1',
            [trimmedCode, subjectRow.id]
          );
          if (!conflicts.length) {
            await this.db.query(
              'UPDATE subjects SET code = ? WHERE id = ? LIMIT 1',
              [trimmedCode, subjectRow.id]
            );
          }
        }

        if (subjectCredits !== null && subjectRow.credits !== subjectCredits) {
          await this.db.query(
            'UPDATE subjects SET credits = ? WHERE id = ? LIMIT 1',
            [subjectCredits, subjectRow.id]
          );
        }
      } else {
        const codeForInsert = (rawSubjectCode || code || '').substring(0, 20) || null;
        const result = await this.db.query(
          'INSERT INTO subjects (code, name, credits, status) VALUES (?, ?, ?, ?)',
          [codeForInsert, name, subjectCredits, 'active']
        );
        data.subject_id = result.insertId;
      }
    } else if (data.subject_id && subjectCredits !== null) {
      await this.db.query(
        'UPDATE subjects SET credits = ? WHERE id = ? LIMIT 1',
        [subjectCredits, data.subject_id]
      );

      if (rawSubjectCode) {
        const trimmedCode = rawSubjectCode.substring(0, 20);
        const conflicts = await this.db.query(
          'SELECT id FROM subjects WHERE code = ? AND id <> ? LIMIT 1',
          [trimmedCode, data.subject_id]
        );
        if (!conflicts.length) {
          await this.db.query(
            'UPDATE subjects SET code = ? WHERE id = ? LIMIT 1',
            [trimmedCode, data.subject_id]
          );
        }
      }
    }

    if (rawSubjectCode) {
      data.subject_code = rawSubjectCode.substring(0, 20);
    }
  }

  async resolveClassInput(data) {
    if (!data) {
      return;
    }

    if (data.class_id === '') {
      data.class_id = null;
    }

    if (data.class_id !== null && data.class_id !== undefined) {
      const numericId = Number(data.class_id);
      data.class_id = Number.isNaN(numericId) ? null : numericId;
    }

    let classCode = cleanString(data.class_code);
    let className = cleanString(data.class_name);

    if (className && !classCode) {
      const match = className.match(/^([A-Za-z0-9._-]+)\s*-\s*(.+)$/);
      if (match) {
        classCode = match[1];
        className = match[2];
      }
    }

    if (!className && classCode) {
      className = classCode;
    }

    if (!classCode && className) {
      classCode = className.replace(/\s+/g, '').substring(0, 10).toUpperCase();
    }

    if ((classCode || className) && !data.class_id) {
      let existingClass = [];
      if (classCode && className) {
        existingClass = await this.db.query(
          'SELECT id FROM classes WHERE code = ? OR name = ? LIMIT 1',
          [classCode, className]
        );
      } else if (classCode) {
        existingClass = await this.db.query(
          'SELECT id FROM classes WHERE code = ? LIMIT 1',
          [classCode]
        );
      } else if (className) {
        existingClass = await this.db.query(
          'SELECT id FROM classes WHERE name = ? LIMIT 1',
          [className]
        );
      }

      if (existingClass.length > 0) {
        data.class_id = existingClass[0].id;
      } else {
        const codeForInsert = (classCode || className || '').substring(0, 20) || null;
        const nameForInsert = className || classCode;

        if (nameForInsert) {
          const result = await this.db.query(
            'INSERT INTO classes (code, name, status) VALUES (?, ?, ?)',
            [codeForInsert, nameForInsert, 'active']
          );
          data.class_id = result.insertId;
        }
      }
    }

    data.class_code = classCode || null;
    data.class_name = className || null;
  }

  async resolveGraderInput(data) {
    if (!data) {
      return;
    }

    const hasSecondaryInput = () => {
      const raw = [data.grader2_id, data.grader2_name, data.grader2_manual_name];
      return raw.some((value) => {
        if (value === undefined || value === null) return false;
        if (typeof value === 'string') return value.trim().length > 0;
        return true;
      });
    };

    const resolveGrader = async (idKey, nameKey, manualKey) => {
      if (data[idKey] === '') {
        data[idKey] = null;
      }

      const trimmedName = (data[nameKey] || '').trim();
      let resolvedId = null;

      if (data[idKey] !== undefined && data[idKey] !== null) {
        const numericId = Number(data[idKey]);
        if (!Number.isNaN(numericId) && numericId > 0) {
          resolvedId = numericId;
        } else {
          data[idKey] = null;
        }
      }

      const emailMatch = trimmedName ? trimmedName.match(/\(([^)]+)\)\s*$/) : null;
      const email = emailMatch ? emailMatch[1].trim() : null;
      const nameOnly = trimmedName ? trimmedName.replace(/\(([^)]+)\)\s*$/, '').trim() : '';

      if (!resolvedId && email) {
        const byEmail = await this.db.query(
          'SELECT id FROM users WHERE email = ? LIMIT 1',
          [email]
        );
        if (byEmail.length) {
          resolvedId = byEmail[0].id;
        }
      }

      if (!resolvedId && nameOnly) {
        const byName = await this.db.query(
          'SELECT id FROM users WHERE full_name = ? LIMIT 1',
          [nameOnly]
        );
        if (byName.length) {
          resolvedId = byName[0].id;
        }
      }

      if (resolvedId) {
        data[idKey] = resolvedId;
        data[manualKey] = null;
      } else if (trimmedName) {
        data[idKey] = null;
        data[manualKey] = trimmedName.substring(0, 120);
      } else {
        data[idKey] = null;
        data[manualKey] = null;
      }
    };

    await resolveGrader('grader_id', 'grader_name', 'grader_manual_name');

    let secondarySupported = await ExaminationSession.supportsSecondaryGrader();

    if (!secondarySupported && hasSecondaryInput()) {
      try {
        const altered = await ExaminationSession.ensureSecondaryGraderColumns();
        if (altered) {
          secondarySupported = await ExaminationSession.supportsSecondaryGrader({ forceRefresh: true });
        }
      } catch (columnError) {
        console.error('Failed to ensure secondary grader support:', columnError);
        secondarySupported = false;
      }
    }

    if (secondarySupported) {
      await resolveGrader('grader2_id', 'grader2_name', 'grader2_manual_name');
    } else {
      // Ensure helper fields don't leak into whitelisted payload when feature is unavailable
      data.grader2_id = null;
      data.grader2_manual_name = null;
    }
  }

  /**
   * Xóa ca thi
   */
  async destroy(req, res) {
    try {
      await ExaminationSession.delete(req.params.id);
      
      res.json({
        success: true,
        message: 'Xóa ca thi thành công'
      });
    } catch (error) {
      console.error('Error deleting session:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi xóa ca thi',
        error: error.message
      });
    }
  }

  /**
   * Gửi nhắc việc cho cán bộ chấm thi
   */
  async sendReminder(req, res) {
    try {
      await ExaminationSession.sendReminder(req.params.id, req.session.user.id);
      
      res.json({
        success: true,
        message: 'Đã gửi nhắc việc thành công'
      });
    } catch (error) {
      console.error('Error sending reminder:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi khi gửi nhắc việc'
      });
    }
  }

  /**
   * Placeholder cho các chức năng sẽ phát triển (giữ lại cho tương lai)
   */
  async comingSoon(req, res) {
    res.json({
      success: false,
      message: 'Chức năng đang được phát triển',
      status: 'under_development'
    });
  }

  // ==================== FILE UPLOAD API ENDPOINTS ====================

  /**
   * Get reference data for dropdowns
   */
  async getReferenceData(req, res) {
    try {
      const type = req.params.type; // periods, subjects, classes, graders

      let data = [];
      switch (type) {
        case 'periods':
          data = await this.db.query(
            'SELECT id, name, start_date, end_date FROM examination_periods WHERE status = ? ORDER BY created_at DESC',
            ['active']
          );
          break;
        
        case 'subjects':
          data = await this.db.query(
            'SELECT id, code, name FROM subjects WHERE status = ? ORDER BY code',
            ['active']
          );
          break;
        
        case 'classes':
          data = await this.db.query(
            'SELECT id, code, name FROM classes WHERE status = ? ORDER BY code',
            ['active']
          );
          break;
        
        case 'graders':
          data = await this.db.query(
            'SELECT id, full_name, email FROM users WHERE role_id IN (1, 2) AND is_active = 1 ORDER BY full_name'
          );
          break;
        
        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid reference type'
          });
      }

      res.json({
        success: true,
        data: data || []
      });
    } catch (error) {
      console.error('Error getting reference data:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi tải dữ liệu tham chiếu',
        error: error.message
      });
    }
  }

  /**
   * Get session by ID (API)
   */
  async getSession(req, res) {
    try {
      const session = await ExaminationSession.findById(req.params.id);
      
      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy ca thi'
        });
      }

      // Load related data
      const periods = await this.db.query('SELECT * FROM examination_periods WHERE id = ?', [session.period_id]);
      const subjects = await this.db.query('SELECT * FROM subjects WHERE id = ?', [session.subject_id]);
      const classes = session.class_id ? await this.db.query('SELECT * FROM classes WHERE id = ?', [session.class_id]) : [];
  const graders = session.grader_id ? await this.db.query('SELECT id, full_name, email FROM users WHERE id = ?', [session.grader_id]) : [];
  const grader2 = session.grader2_id ? await this.db.query('SELECT id, full_name, email FROM users WHERE id = ?', [session.grader2_id]) : [];

      res.json({
        success: true,
        session: {
          ...session,
          period_name: periods[0]?.name,
          subject_name: subjects[0]?.name,
          class_name: classes[0]?.name,
          grader_name: graders[0]?.full_name,
          grader_email: graders[0]?.email,
          grader_manual_name: session.grader_manual_name,
          grader2_name: grader2[0]?.full_name,
          grader2_email: grader2[0]?.email,
          grader2_manual_name: session.grader2_manual_name
        }
      });
    } catch (error) {
      console.error('Error getting session:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy thông tin ca thi',
        error: error.message
      });
    }
  }

  /**
   * Get files for a session
   */
  async getSessionFiles(req, res) {
    try {
      const sessionId = req.params.id;
      let hasFilesTable = await ExaminationSession.tableExists('examination_files');
      if (!hasFilesTable) {
        hasFilesTable = await ExaminationSession.tableExists('examination_files', { forceRefresh: true });
      }

      if (!hasFilesTable) {
        return res.json({
          success: true,
          files: []
        });
      }
      
      const files = await this.db.query(
        `SELECT * FROM examination_files 
         WHERE session_id = ? AND status = 'active' 
         ORDER BY is_primary DESC, uploaded_at DESC`,
        [sessionId]
      );

      res.json({
        success: true,
        files: files || []
      });
    } catch (error) {
      console.error('Error getting files:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi tải danh sách file',
        error: error.message
      });
    }
  }

  /**
   * Upload file for session
   */
  async uploadFile(req, res) {
    try {
      const sessionId = req.params.id;
      const file = req.file;
      const description = req.body.description || '';

      let hasFilesTable = await ExaminationSession.tableExists('examination_files');
      if (!hasFilesTable) {
        hasFilesTable = await ExaminationSession.tableExists('examination_files', { forceRefresh: true });
      }

      if (!hasFilesTable) {
        return res.status(503).json({
          success: false,
          message: 'Chức năng lưu tài liệu khảo thí chưa sẵn sàng (thiếu bảng examination_files). Hãy áp dụng migration tương ứng hoặc khôi phục backup.'
        });
      }

      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'Không có file được upload'
        });
      }

      // Check if session exists
      const session = await ExaminationSession.findById(sessionId);
      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy ca thi'
        });
      }

      // Get file info
      const fileExtension = path.extname(file.originalname);
      const fileName = file.originalname;
      const filePath = file.path.replace(/\\/g, '/'); // Normalize path
      const fileSize = file.size;
      const fileType = file.mimetype;
      const uploadedBy = req.session.user?.id || 1;

      // Check if this is the first file (set as primary)
      const existingFiles = await this.db.query(
        'SELECT COUNT(*) as count FROM examination_files WHERE session_id = ? AND status = ?',
        [sessionId, 'active']
      );
      const isPrimary = existingFiles[0].count === 0 ? 1 : 0;

      // Insert file record
      const result = await this.db.query(
        `INSERT INTO examination_files 
         (session_id, file_name, file_path, file_size, file_type, file_extension, 
          uploaded_by, is_primary, description, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [sessionId, fileName, filePath, fileSize, fileType, fileExtension, 
         uploadedBy, isPrimary, description, 'active']
      );

      const fileId = result.insertId;

      // Get the inserted file
      const insertedFile = await this.db.query(
        'SELECT * FROM examination_files WHERE id = ?',
        [fileId]
      );

      res.json({
        success: true,
        message: 'Upload file thành công',
        file: insertedFile[0]
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi upload file',
        error: error.message
      });
    }
  }

  /**
   * Delete file
   */
  async deleteFile(req, res) {
    try {
      const fileId = req.params.fileId;

      let hasFilesTable = await ExaminationSession.tableExists('examination_files');
      if (!hasFilesTable) {
        hasFilesTable = await ExaminationSession.tableExists('examination_files', { forceRefresh: true });
      }
      if (!hasFilesTable) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy tài liệu (bảng examination_files chưa tồn tại).'
        });
      }

      // Get file info
      const files = await this.db.query(
        'SELECT * FROM examination_files WHERE id = ?',
        [fileId]
      );

      if (files.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy file'
        });
      }

      const file = files[0];

      // Soft delete
      await this.db.query(
        'UPDATE examination_files SET status = ?, deleted_at = NOW() WHERE id = ?',
        ['deleted', fileId]
      );

      // Delete physical file
      try {
        await fs.unlink(file.file_path);
      } catch (err) {
        console.error('Error deleting physical file:', err);
        // Continue even if physical file deletion fails
      }

      res.json({
        success: true,
        message: 'Đã xóa file'
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi xóa file',
        error: error.message
      });
    }
  }

  /**
   * Set primary file
   */
  async setPrimaryFile(req, res) {
    try {
      const fileId = req.params.fileId;

      let hasFilesTable = await ExaminationSession.tableExists('examination_files');
      if (!hasFilesTable) {
        hasFilesTable = await ExaminationSession.tableExists('examination_files', { forceRefresh: true });
      }
      if (!hasFilesTable) {
        return res.status(404).json({
          success: false,
          message: 'Không thể đánh dấu tài liệu chính khi bảng examination_files chưa tồn tại.'
        });
      }

      // Get file to check session_id
      const files = await this.db.query(
        'SELECT session_id FROM examination_files WHERE id = ?',
        [fileId]
      );

      if (files.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy file'
        });
      }

      const sessionId = files[0].session_id;

      // Remove primary flag from all files of this session
      await this.db.query(
        'UPDATE examination_files SET is_primary = 0 WHERE session_id = ?',
        [sessionId]
      );

      // Set this file as primary
      await this.db.query(
        'UPDATE examination_files SET is_primary = 1 WHERE id = ?',
        [fileId]
      );

      res.json({
        success: true,
        message: 'Đã đặt làm file chính'
      });
    } catch (error) {
      console.error('Error setting primary file:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi đặt file chính',
        error: error.message
      });
    }
  }

  /**
   * Download file
   */
  async downloadFile(req, res) {
    try {
      const fileId = req.params.fileId;

      let hasFilesTable = await ExaminationSession.tableExists('examination_files');
      if (!hasFilesTable) {
        hasFilesTable = await ExaminationSession.tableExists('examination_files', { forceRefresh: true });
      }
      if (!hasFilesTable) {
        return res.status(404).render('error', {
          message: 'Không tìm thấy tài liệu để tải xuống. Hãy tạo bảng examination_files trước.'
        });
      }

      const files = await this.db.query(
        'SELECT * FROM examination_files WHERE id = ?',
        [fileId]
      );

      if (files.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy file'
        });
      }

      const file = files[0];

      // Increment download count
      await this.db.query(
        'UPDATE examination_files SET download_count = download_count + 1 WHERE id = ?',
        [fileId]
      );

      // Send file
      res.download(file.file_path, file.file_name);
    } catch (error) {
      console.error('Error downloading file:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi tải file',
        error: error.message
      });
    }
  }
}

module.exports = ExaminationController;
