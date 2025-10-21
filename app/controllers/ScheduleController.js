const PDFDocument = require('pdfkit');
const WorkSchedule = require('../models/WorkSchedule');
const db = require('../../config/database');
const { ensurePdfFonts } = require('../utils/pdfFonts');

function getWeekStart(dateInput) {
  const date = dateInput ? new Date(dateInput) : new Date();
  const result = new Date(date);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day; // move to Monday
  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

function getWeekEnd(weekStart) {
  const end = new Date(weekStart);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

function safeParseJSON(value) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
}

function formatDateKey(date) {
  const normalized = new Date(date);
  if (Number.isNaN(normalized.getTime())) {
    return '';
  }
  return normalized.toISOString().split('T')[0];
}

function formatDateLabel(date) {
  const normalized = new Date(date);
  return new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(normalized);
}

function formatDateRangeDisplay(start, end) {
  const formatter = new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  return `${formatter.format(start)} - ${formatter.format(end)}`;
}

const CLASS_TOKEN_PATTERN = /(?:^|\b)(?:lớp|lop|class)\s*[:\-]?\s*([A-Za-z0-9 ,._\-/()]+)/i;
const CLASS_CODE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9 ,._\-/()]{1,40}$/;
const CLASS_IGNORED_PATTERN = /(giảng viên|g[\. ]?v|email|phòng|room|địa điểm|location)/i;

function normalizeClassCandidate(value) {
  if (typeof value !== 'string') {
    return '';
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  const hintMatch = trimmed.match(CLASS_TOKEN_PATTERN);
  if (hintMatch && hintMatch[1]) {
    return hintMatch[1].trim();
  }

  const singleLine = trimmed.split(/\r?\n/)[0].trim();

  if (CLASS_IGNORED_PATTERN.test(singleLine)) {
    return '';
  }

  if (CLASS_CODE_PATTERN.test(singleLine) && /\d/.test(singleLine)) {
    return singleLine;
  }

  if (/\b(?:k|cn|dh|da|th|lt|sh|tn)[A-Za-z0-9]*\d+/i.test(singleLine)) {
    return singleLine;
  }

  return '';
}

function determineClassName(event, rawTags) {
  const candidates = [];

  if (event && typeof event.class_name === 'string') {
    candidates.push(event.class_name);
  }

  if (event && typeof event.class === 'string') {
    candidates.push(event.class);
  }

  if (Array.isArray(rawTags)) {
    candidates.push(...rawTags);
  } else if (rawTags && typeof rawTags === 'object') {
    const possibleKeys = ['class', 'class_name', 'lop', 'group', 'group_name', 'section'];
    for (const key of possibleKeys) {
      if (typeof rawTags[key] === 'string') {
        candidates.push(rawTags[key]);
      }
    }
    if (Array.isArray(rawTags.items)) {
      candidates.push(...rawTags.items);
    }
  }

  const textFields = [event?.description, event?.public_notes, event?.notes, event?.title];
  for (const field of textFields) {
    if (typeof field === 'string' && field) {
      candidates.push(field);
    }
  }

  for (const candidate of candidates) {
    const className = normalizeClassCandidate(candidate);
    if (className) {
      return className;
    }
  }

  return '';
}

const STATUS_LABELS = {
  draft: 'Nháp',
  confirmed: 'Đã xác nhận',
  scheduled: 'Đã lên lịch',
  ongoing: 'Đang diễn ra',
  in_progress: 'Đang thực hiện',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
  postponed: 'Hoãn',
  rescheduled: 'Đã dời lịch'
};

const PRIORITY_LABELS = {
  low: 'Thấp',
  normal: 'Bình thường',
  medium: 'Trung bình',
  high: 'Cao',
  critical: 'Khẩn cấp',
  urgent: 'Khẩn'
};

const TYPE_LABELS = {
  teaching: 'Giảng dạy',
  meeting: 'Cuộc họp',
  exam: 'Khảo thí',
  admin: 'Hành chính',
  ceremony: 'Sự kiện',
  training: 'Tập huấn',
  other: 'Khác'
};

function formatTime(date) {
  return new Date(date).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

function getWeekdayIndex(date) {
  const day = new Date(date).getDay();
  return (day + 6) % 7; // Monday = 0, Sunday = 6
}

class ScheduleController {
  transformTeachingEvents(rawEvents = []) {
    return rawEvents.map(event => {
      const rawTags = safeParseJSON(event.tags);
      let normalizedTags = {};

      if (Array.isArray(rawTags)) {
        normalizedTags = {
          items: rawTags.slice()
        };
      } else if (rawTags && typeof rawTags === 'object') {
        normalizedTags = {
          ...rawTags
        };

        if (Array.isArray(rawTags.items)) {
          normalizedTags.items = rawTags.items.slice();
        }
      }

      const className = determineClassName(event, rawTags);

      if (className) {
        if (!normalizedTags.class) {
          normalizedTags.class = className;
        }
        if (!normalizedTags.class_name) {
          normalizedTags.class_name = className;
        }
        if (!normalizedTags.lop) {
          normalizedTags.lop = className;
        }
      }

      const participants = Array.isArray(event.participants) ? event.participants : [];
      const startDate = event.start_datetime instanceof Date ? event.start_datetime : new Date(event.start_datetime);
      const endDate = event.end_datetime instanceof Date ? event.end_datetime : new Date(event.end_datetime);

      const lecturer = event.organizer_name
        || normalizedTags.lecturer
        || (participants.find(p => p.role === 'organizer')?.full_name)
        || '';

      const lecturerEmail = event.organizer_email
        || (participants.find(p => p.role === 'organizer')?.email)
        || '';

      return {
        id: event.id,
        identifier: event.identifier || `teaching-${event.id}`,
        title: event.title,
  class_name: className,
        description: event.description,
        location: event.location,
        room: event.room,
        building: event.building,
        organizer: lecturer,
        organizer_id: event.organizer_id,
        organizer_email: lecturerEmail,
        tags: normalizedTags,
        start: startDate instanceof Date ? startDate.toISOString() : event.start_datetime,
        end: endDate instanceof Date ? endDate.toISOString() : event.end_datetime,
        start_time: formatTime(startDate),
        end_time: formatTime(endDate),
        weekday: getWeekdayIndex(startDate),
        notes: event.public_notes || event.notes || '',
        priority: event.priority,
        status: event.status,
        participants,
        is_all_day: Boolean(event.is_all_day),
        timezone: event.timezone || 'Asia/Ho_Chi_Minh'
      };
    });
  }

  // GET /schedule - Trang calendar
  async index(req, res) {
    try {
      const userId = req.session.user?.id;
      
      // Lấy danh sách users cho dropdown
      const users = await db.query(
        'SELECT id, full_name, email FROM users WHERE is_active = 1 ORDER BY full_name'
      );

      res.render('schedule/index', {
        title: 'Lịch công tác',
        user: req.session.user,
        users
      });
    } catch (error) {
      console.error('Schedule index error:', error);
      res.status(500).render('error', { error: error.message });
    }
  }

  // GET /api/schedule/events - Lấy events cho calendar (API)
  async getEvents(req, res) {
    try {
      const { start, end, user_id } = req.query;
      
      const events = await WorkSchedule.getEventsBetween(
        start || new Date(),
        end || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        user_id || null
      );

      res.json(events);
    } catch (error) {
      console.error('Get events error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getTeachingSchedule(req, res) {
    try {
      const weekStart = req.query.start ? getWeekStart(req.query.start) : getWeekStart(new Date());
      const weekEnd = req.query.end ? new Date(req.query.end) : getWeekEnd(weekStart);

      if (!req.query.end) {
        weekEnd.setHours(23, 59, 59, 999);
      }

      const rawEvents = await WorkSchedule.getTeachingSchedule(
        weekStart.toISOString(),
        weekEnd.toISOString(),
        { includeParticipants: true }
      );
      const formattedEvents = this.transformTeachingEvents(rawEvents);

      const notes = formattedEvents
        .filter(event => event.notes)
        .map(event => ({
          time: `${event.start_time} - ${event.end_time}`,
          title: event.title,
          content: event.notes
        }));

      res.json({
        start: weekStart.toISOString(),
        end: weekEnd.toISOString(),
        events: formattedEvents,
        notes
      });
    } catch (error) {
      console.error('Get teaching schedule error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async exportPdf(req, res) {
    try {
      const userIdParam = req.query.user_id ? parseInt(req.query.user_id, 10) : null;
      let startDate = req.query.start ? new Date(req.query.start) : getWeekStart(new Date());

      if (Number.isNaN(startDate.getTime())) {
        startDate = getWeekStart(new Date());
      }

      let endDate = req.query.end ? new Date(req.query.end) : getWeekEnd(startDate);

      if (!req.query.end) {
        endDate.setHours(23, 59, 59, 999);
      } else {
        // FullCalendar end date is exclusive -> adjust to previous millisecond
        endDate = new Date(endDate.getTime() - 1);
      }

      if (Number.isNaN(endDate.getTime()) || endDate < startDate) {
        endDate = getWeekEnd(startDate);
      }

      const startIso = startDate.toISOString();
      const endIso = endDate.toISOString();

      const [rawTeaching, calendarEvents, userFilter] = await Promise.all([
        WorkSchedule.getTeachingSchedule(startIso, endIso, { includeParticipants: true }),
        WorkSchedule.getEventsBetween(startIso, endIso, userIdParam || null),
        userIdParam ? db.findOne('SELECT full_name, email FROM users WHERE id = ?', [userIdParam]) : Promise.resolve(null)
      ]);

      let teachingEvents = this.transformTeachingEvents(rawTeaching);

      if (userIdParam) {
        teachingEvents = teachingEvents.filter(event => {
          if (Number(event.organizer_id) === userIdParam) {
            return true;
          }
          if (Array.isArray(event.participants)) {
            return event.participants.some(participant => Number(participant.user_id) === userIdParam);
          }
          return false;
        });
      }

      const otherEvents = calendarEvents
        .filter(event => (event.extendedProps?.event_type || 'other') !== 'teaching')
        .map(event => {
          const start = event.start ? new Date(event.start) : null;
          const end = event.end ? new Date(event.end) : null;
          return {
            title: event.title,
            event_type: event.extendedProps?.event_type || 'other',
            start,
            end,
            allDay: Boolean(event.allDay),
            location: event.extendedProps?.location || '',
            room: event.extendedProps?.room || '',
            building: event.extendedProps?.building || '',
            organizer: event.extendedProps?.organizer_name || '',
            status: event.extendedProps?.status || '',
            priority: event.extendedProps?.priority || '',
            description: event.extendedProps?.description || ''
          };
        })
        .filter(event => event.start && !Number.isNaN(event.start.getTime()))
        .sort((a, b) => a.start - b.start);

      const summaryByType = [...teachingEvents.map(() => 'teaching'), ...otherEvents.map(ev => ev.event_type)]
        .reduce((acc, type) => {
          const key = type || 'other';
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {});

      const groupByDate = (items, getDate) => {
        const groups = new Map();
        items.forEach(item => {
          const date = getDate(item);
          if (!date || Number.isNaN(date.getTime())) {
            return;
          }
          const key = formatDateKey(date);
          if (!groups.has(key)) {
            groups.set(key, { date, items: [] });
          }
          groups.get(key).items.push(item);
        });
        return Array.from(groups.values()).sort((a, b) => a.date - b.date);
      };

      const teachingGroups = groupByDate(teachingEvents, event => new Date(event.start));
      const otherGroups = groupByDate(otherEvents, event => event.start);

      const fontPaths = await ensurePdfFonts();

      const doc = new PDFDocument({ size: 'A4', margin: 48 });
      const startKey = formatDateKey(startDate).replace(/-/g, '') || 'start';
      const endKey = formatDateKey(endDate).replace(/-/g, '') || 'end';

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="lich-cong-tac_${startKey}_${endKey}.pdf"`
      );

      doc.pipe(res);

      let regularFontName = null;
      let boldFontName = null;

      if (fontPaths.regular) {
        try {
          doc.registerFont('Schedule-Regular', fontPaths.regular);
          regularFontName = 'Schedule-Regular';
        } catch (fontError) {
          console.warn('Unable to register custom PDF font:', fontError.message || fontError);
        }
      }

      if (fontPaths.bold) {
        try {
          doc.registerFont('Schedule-Bold', fontPaths.bold);
          boldFontName = 'Schedule-Bold';
        } catch (fontError) {
          console.warn('Unable to register bold PDF font:', fontError.message || fontError);
        }
      }

      const useRegular = () => {
        if (regularFontName) {
          doc.font(regularFontName);
        } else {
          doc.font('Helvetica');
        }
      };

      const useBold = () => {
        if (boldFontName) {
          doc.font(boldFontName);
        } else if (regularFontName) {
          doc.font(regularFontName);
        } else {
          doc.font('Helvetica-Bold');
        }
      };

      useBold();
      doc.fontSize(18).fillColor('#1f2937').text('LỊCH CÔNG TÁC TỔNG HỢP', { align: 'center' });
      useRegular();
      doc.moveDown(0.35);
      doc.fontSize(12).fillColor('#4b5563').text(
        `Thời gian: ${formatDateRangeDisplay(startDate, endDate)}`,
        { align: 'center' }
      );
      doc.moveDown(0.2);
      doc.fontSize(10).fillColor('#6b7280').text(
        `Xuất lúc: ${new Date().toLocaleString('vi-VN')}`,
        { align: 'center' }
      );

      if (userIdParam) {
        doc.moveDown(0.2);
        useRegular();
        doc.fontSize(10).fillColor('#6b7280').text(
          `Bộ lọc: ${filterLabel}`,
          { align: 'center' }
        );
      }

      doc.moveDown();
      useRegular();
      doc.fontSize(12).fillColor('#1f2937').text(
        `Tổng số lịch giảng: ${teachingEvents.length}`
      );
      doc.fontSize(12).fillColor('#1f2937').text(
        `Tổng số lịch công tác khác: ${otherEvents.length}`
      );

      if (Object.keys(summaryByType).length > 0) {
        doc.moveDown(0.5);
  doc.fontSize(12).fillColor('#1f2937').text('Phân bố theo loại sự kiện:');
        Object.entries(summaryByType)
          .sort((a, b) => a[0].localeCompare(b[0]))
          .forEach(([type, count]) => {
            const label = TYPE_LABELS[type] || type;
            doc.fontSize(11).fillColor('#374151').text(`• ${label}: ${count}`);
          });
      }

      const writeEventMeta = (label, value) => {
        if (!value) {
          return;
        }
        doc.fontSize(10).fillColor('#4b5563').text(`   - ${label}: ${value}`);
      };

      doc.moveDown(1);
  useBold();
  doc.fontSize(14).fillColor('#1f2937').text('I. Lịch giảng dạy', { underline: true });
  useRegular();

      if (teachingGroups.length === 0) {
        doc.moveDown(0.3);
        doc.fontSize(11).fillColor('#6b7280').text('Không có lịch giảng dạy trong giai đoạn này.');
      } else {
        teachingGroups.forEach(group => {
          doc.moveDown(0.5);
    doc.fontSize(12).fillColor('#2563eb');
    useBold();
    doc.text(formatDateLabel(group.date));
    useRegular();
          group.items
            .sort((a, b) => new Date(a.start) - new Date(b.start))
            .forEach(event => {
              doc.moveDown(0.15);
              const timeRange = `${event.start_time} - ${event.end_time}`;
              doc.fontSize(11).fillColor('#111827');
              useBold();
              doc.text(`• ${timeRange} | ${event.title || 'Chưa đặt tên'}`);
              useRegular();

              const locationParts = [event.room, event.location, event.building]
                .filter(Boolean)
                .join(' - ');

              writeEventMeta('Lớp', event.class_name);
              writeEventMeta('Giảng viên', event.organizer);
              writeEventMeta('Địa điểm', locationParts);
              writeEventMeta('Trạng thái', STATUS_LABELS[event.status] || event.status);
              writeEventMeta('Ưu tiên', PRIORITY_LABELS[event.priority] || event.priority);
              if (event.notes) {
                writeEventMeta('Ghi chú', event.notes);
              }
            });
        });
      }

      doc.moveDown(1);
  useBold();
  doc.fontSize(14).fillColor('#1f2937').text('II. Lịch công tác khác', { underline: true });
  useRegular();

      if (otherGroups.length === 0) {
        doc.moveDown(0.3);
        doc.fontSize(11).fillColor('#6b7280').text('Không có lịch công tác nào khác trong giai đoạn này.');
      } else {
        otherGroups.forEach(group => {
          doc.moveDown(0.5);
    doc.fontSize(12).fillColor('#059669');
    useBold();
    doc.text(formatDateLabel(group.date));
    useRegular();
          group.items.forEach(event => {
            doc.moveDown(0.15);
            const hasTime = !event.allDay;
            const timeRange = hasTime
              ? `${formatTime(event.start)} - ${formatTime(event.end || event.start)}`
              : 'Cả ngày';
            const typeLabel = TYPE_LABELS[event.event_type] || event.event_type;
            doc.fontSize(11).fillColor('#111827');
            useBold();
            doc.text(`• ${timeRange} | ${event.title || 'Chưa đặt tên'} (${typeLabel})`);
            useRegular();

            const locationParts = [event.room, event.location, event.building]
              .filter(Boolean)
              .join(' - ');

            writeEventMeta('Phụ trách', event.organizer);
            writeEventMeta('Địa điểm', locationParts);
            writeEventMeta('Trạng thái', STATUS_LABELS[event.status] || event.status);
            writeEventMeta('Ưu tiên', PRIORITY_LABELS[event.priority] || event.priority);
            if (event.description) {
              writeEventMeta('Nội dung', event.description);
            }
          });
        });
      }

      doc.moveDown(1);
      doc.fontSize(11).fillColor('#6b7280').text(
        'Biểu mẫu được tạo tự động từ hệ thống quản lý giáo vụ. Vui lòng kiểm tra lại khi cần đối chiếu chính thức.'
      );

      doc.end();
    } catch (error) {
      console.error('Export schedule PDF error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Không thể xuất PDF. Vui lòng thử lại sau.' });
      } else {
        res.end();
      }
    }
  }

  // GET /api/schedule/:id - Chi tiết schedule
  async show(req, res) {
    try {
      const schedule = await WorkSchedule.findById(req.params.id);
      
      if (!schedule) {
        return res.status(404).json({ error: 'Schedule not found' });
      }

      // Parse JSON fields
      if (schedule.tags && typeof schedule.tags === 'string') {
        schedule.tags = JSON.parse(schedule.tags);
      }
      if (schedule.attachments && typeof schedule.attachments === 'string') {
        schedule.attachments = JSON.parse(schedule.attachments);
      }

      res.json(schedule);
    } catch (error) {
      console.error('Show schedule error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // POST /api/schedule - Tạo lịch mới
  async store(req, res) {
    try {
      const userId = req.session.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Validate required fields
      const { title, start_datetime, end_datetime, organizer_id } = req.body;
      
      if (!title || !start_datetime || !end_datetime || !organizer_id) {
        return res.status(400).json({ 
          error: 'Missing required fields: title, start_datetime, end_datetime, organizer_id' 
        });
      }

      // Validate datetime
      if (new Date(start_datetime) >= new Date(end_datetime)) {
        return res.status(400).json({ 
          error: 'End datetime must be after start datetime' 
        });
      }

      // Kiểm tra xung đột lịch
      const conflicts = await WorkSchedule.checkConflicts(
        organizer_id,
        start_datetime,
        end_datetime,
        null,
        {
          eventType: req.body.event_type || 'other',
          room: req.body.room,
          location: req.body.location
        }
      );

      if (conflicts.length > 0) {
        return res.status(409).json({ 
          error: 'Schedule conflict detected',
          conflicts 
        });
      }

      // Prepare data
      const scheduleData = {
        title,
        description: req.body.description,
        event_type: req.body.event_type || 'other',
        start_datetime,
        end_datetime,
        is_all_day: req.body.is_all_day || false,
        timezone: req.body.timezone || 'Asia/Ho_Chi_Minh',
        recurrence_rule: req.body.recurrence_rule,
        recurrence_end_date: req.body.recurrence_end_date,
        location: req.body.location,
        room: req.body.room,
        building: req.body.building,
        online_meeting_url: req.body.online_meeting_url,
        organizer_id,
        status: req.body.status || 'confirmed',
        priority: req.body.priority || 'normal',
        color: req.body.color,
        icon: req.body.icon,
        tags: req.body.tags,
        reminder_minutes: req.body.reminder_minutes || 15,
        attachments: req.body.attachments,
        notes: req.body.notes,
        public_notes: req.body.public_notes,
        created_by: userId
      };

      const scheduleId = await WorkSchedule.create(scheduleData);

      // Add participants if provided
      if (req.body.participants && Array.isArray(req.body.participants)) {
        for (const participant of req.body.participants) {
          await WorkSchedule.addParticipant(
            scheduleId,
            participant.user_id,
            participant.role || 'required'
          );
        }
      }

      // Log history
      await db.query(
        `INSERT INTO schedule_history (schedule_id, action, changed_by, new_data, change_summary)
         VALUES (?, 'created', ?, ?, 'Tạo lịch mới')`,
        [scheduleId, userId, JSON.stringify(scheduleData)]
      );

      res.status(201).json({ 
        message: 'Schedule created successfully',
        id: scheduleId 
      });

    } catch (error) {
      console.error('Store schedule error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // PUT /api/schedule/:id - Cập nhật lịch
  async update(req, res) {
    try {
      const userId = req.session.user?.id;
      const scheduleId = req.params.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Get old data for history
      const oldSchedule = await WorkSchedule.findById(scheduleId);
      if (!oldSchedule) {
        return res.status(404).json({ error: 'Schedule not found' });
      }

      // Validate datetime if updated
      if (req.body.start_datetime && req.body.end_datetime) {
        if (new Date(req.body.start_datetime) >= new Date(req.body.end_datetime)) {
          return res.status(400).json({ 
            error: 'End datetime must be after start datetime' 
          });
        }

        // Check conflicts
        const conflictOptions = {
          eventType: req.body.event_type || oldSchedule.event_type,
          room: req.body.room !== undefined ? req.body.room : oldSchedule.room,
          location: req.body.location !== undefined ? req.body.location : oldSchedule.location
        };

        const conflicts = await WorkSchedule.checkConflicts(
          req.body.organizer_id || oldSchedule.organizer_id,
          req.body.start_datetime,
          req.body.end_datetime,
          scheduleId,
          conflictOptions
        );

        if (conflicts.length > 0) {
          return res.status(409).json({ 
            error: 'Schedule conflict detected',
            conflicts 
          });
        }
      }

      // Update schedule
      const updated = await WorkSchedule.update(scheduleId, req.body);

      if (!updated) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      // Update participants if provided
      if (req.body.participants && Array.isArray(req.body.participants)) {
        // Remove existing participants
        await db.query('DELETE FROM schedule_participants WHERE schedule_id = ?', [scheduleId]);
        
        // Add new participants
        for (const participant of req.body.participants) {
          await WorkSchedule.addParticipant(
            scheduleId,
            participant.user_id,
            participant.role || 'required'
          );
        }
      }

      // Log history
      await db.query(
        `INSERT INTO schedule_history (schedule_id, action, changed_by, old_data, new_data, change_summary)
         VALUES (?, 'updated', ?, ?, ?, 'Cập nhật lịch')`,
        [scheduleId, userId, JSON.stringify(oldSchedule), JSON.stringify(req.body)]
      );

      res.json({ 
        message: 'Schedule updated successfully' 
      });

    } catch (error) {
      console.error('Update schedule error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // DELETE /api/schedule/:id - Xóa lịch
  async destroy(req, res) {
    try {
      const userId = req.session.user?.id;
      const scheduleId = req.params.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Get schedule for history
      const schedule = await WorkSchedule.findById(scheduleId);
      if (!schedule) {
        return res.status(404).json({ error: 'Schedule not found' });
      }

      // Log before delete
      await db.query(
        `INSERT INTO schedule_history (schedule_id, action, changed_by, old_data, change_summary)
         VALUES (?, 'deleted', ?, ?, 'Xóa lịch')`,
        [scheduleId, userId, JSON.stringify(schedule)]
      );

      // Delete schedule
      const deleted = await WorkSchedule.delete(scheduleId);

      if (!deleted) {
        return res.status(404).json({ error: 'Schedule not found' });
      }

      res.json({ message: 'Schedule deleted successfully' });

    } catch (error) {
      console.error('Delete schedule error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // PUT /api/schedule/:id/status - Cập nhật trạng thái
  async updateStatus(req, res) {
    try {
      const userId = req.session.user?.id;
      const { status } = req.body;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!['draft', 'confirmed', 'cancelled', 'completed', 'postponed'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const updated = await WorkSchedule.update(req.params.id, { status });

      if (!updated) {
        return res.status(404).json({ error: 'Schedule not found' });
      }

      res.json({ message: 'Status updated successfully' });

    } catch (error) {
      console.error('Update status error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // POST /api/schedule/:id/participants - Thêm participant
  async addParticipant(req, res) {
    try {
      const { user_id, role } = req.body;

      if (!user_id) {
        return res.status(400).json({ error: 'user_id is required' });
      }

      await WorkSchedule.addParticipant(req.params.id, user_id, role);

      res.json({ message: 'Participant added successfully' });

    } catch (error) {
      console.error('Add participant error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // DELETE /api/schedule/:id/participants/:userId - Xóa participant
  async removeParticipant(req, res) {
    try {
      const { id, userId } = req.params;

      const removed = await WorkSchedule.removeParticipant(id, userId);

      if (!removed) {
        return res.status(404).json({ error: 'Participant not found' });
      }

      res.json({ message: 'Participant removed successfully' });

    } catch (error) {
      console.error('Remove participant error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // PUT /api/schedule/:id/participants/:userId - Cập nhật trạng thái participant
  async updateParticipantStatus(req, res) {
    try {
      const { id, userId } = req.params;
      const { status } = req.body;

      if (!['pending', 'accepted', 'declined', 'tentative', 'no_response'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const updated = await WorkSchedule.updateParticipantStatus(id, userId, status);

      if (!updated) {
        return res.status(404).json({ error: 'Participant not found' });
      }

      res.json({ message: 'Participant status updated successfully' });

    } catch (error) {
      console.error('Update participant status error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/schedule/conflicts - Kiểm tra xung đột
  async checkConflicts(req, res) {
    try {
      const { user_id, start_datetime, end_datetime, exclude_id } = req.query;

      if (!user_id || !start_datetime || !end_datetime) {
        return res.status(400).json({ 
          error: 'Missing required parameters: user_id, start_datetime, end_datetime' 
        });
      }

      const conflictOptions = {
        eventType: req.query.event_type,
        room: req.query.room,
        location: req.query.location
      };

      const conflicts = await WorkSchedule.checkConflicts(
        user_id,
        start_datetime,
        end_datetime,
        exclude_id || null,
        conflictOptions
      );

      res.json({ 
        hasConflict: conflicts.length > 0,
        conflicts 
      });

    } catch (error) {
      console.error('Check conflicts error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // POST /api/schedule/export/pdf - Xuất PDF với tùy chỉnh trường
  async exportPdfCustom(req, res) {
    try {
      const { fields, orientation, start, end, user_id } = req.body;
      
      // Parse fields if it's a string
      const selectedFields = typeof fields === 'string' ? JSON.parse(fields) : fields || [];
      
      // Validate có ít nhất 1 field
      if (!selectedFields || selectedFields.length === 0) {
        return res.status(400).json({ 
          success: false,
          message: 'Vui lòng chọn ít nhất một trường thông tin để xuất PDF.' 
        });
      }

      // Set query parameters for the existing exportPdf method
      req.query = {
        start: start || req.query.start,
        end: end || req.query.end,
        user_id: user_id || req.query.user_id
      };

      // Store custom options in request object
      req.pdfCustomOptions = {
        fields: selectedFields,
        orientation: orientation || 'portrait'
      };

      // Call existing exportPdf method
      await this.exportPdfEnhanced(req, res);

    } catch (error) {
      console.error('Export custom PDF error:', error);
      if (!res.headersSent) {
        res.status(500).json({ 
          success: false,
          message: 'Không thể xuất PDF. Vui lòng thử lại sau.' 
        });
      }
    }
  }

  // Enhanced PDF export with field customization
  async exportPdfEnhanced(req, res) {
    try {
      const customOptions = req.pdfCustomOptions || {};
      const selectedFields = customOptions.fields || ['title', 'event_type', 'datetime', 'organizer', 'location', 'status'];
      const pdfOrientation = customOptions.orientation || 'portrait';

      const userIdParam = req.query.user_id ? parseInt(req.query.user_id, 10) : null;
      let startDate = req.query.start ? new Date(req.query.start) : getWeekStart(new Date());

      if (Number.isNaN(startDate.getTime())) {
        startDate = getWeekStart(new Date());
      }

      let endDate = req.query.end ? new Date(req.query.end) : getWeekEnd(startDate);

      if (!req.query.end) {
        endDate.setHours(23, 59, 59, 999);
      } else {
        endDate = new Date(endDate.getTime() - 1);
      }

      if (Number.isNaN(endDate.getTime()) || endDate < startDate) {
        endDate = getWeekEnd(startDate);
      }

      const startIso = startDate.toISOString();
      const endIso = endDate.toISOString();

      const [rawTeaching, calendarEvents, userFilter] = await Promise.all([
        WorkSchedule.getTeachingSchedule(startIso, endIso, { includeParticipants: true }),
        WorkSchedule.getEventsBetween(startIso, endIso, userIdParam || null),
        userIdParam ? db.findOne('SELECT full_name, email FROM users WHERE id = ?', [userIdParam]) : Promise.resolve(null)
      ]);

      let teachingEvents = this.transformTeachingEvents(rawTeaching);

      if (userIdParam) {
        teachingEvents = teachingEvents.filter(event => {
          if (Number(event.organizer_id) === userIdParam) {
            return true;
          }
          if (Array.isArray(event.participants)) {
            return event.participants.some(participant => Number(participant.user_id) === userIdParam);
          }
          return false;
        });
      }

      const otherEvents = calendarEvents
        .filter(event => (event.extendedProps?.event_type || 'other') !== 'teaching')
        .map(event => {
          const start = event.start ? new Date(event.start) : null;
          const end = event.end ? new Date(event.end) : null;
          return {
            title: event.title,
            event_type: event.extendedProps?.event_type || 'other',
            start,
            end,
            allDay: Boolean(event.allDay),
            location: event.extendedProps?.location || '',
            room: event.extendedProps?.room || '',
            building: event.extendedProps?.building || '',
            organizer: event.extendedProps?.organizer_name || '',
            status: event.extendedProps?.status || '',
            priority: event.extendedProps?.priority || '',
            description: event.extendedProps?.description || '',
            class_name: event.extendedProps?.class_name || '',
            notes: event.extendedProps?.notes || ''
          };
        })
        .filter(event => event.start && !Number.isNaN(event.start.getTime()))
        .sort((a, b) => a.start - b.start);

      const summaryByType = [...teachingEvents.map(() => 'teaching'), ...otherEvents.map(ev => ev.event_type)]
        .reduce((acc, type) => {
          const key = type || 'other';
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {});

      const fontPaths = await ensurePdfFonts();

      const doc = new PDFDocument({ 
        size: 'A4', 
        margin: pdfOrientation === 'landscape' ? 30 : 40,
        layout: pdfOrientation
      });
      
      const startKey = formatDateKey(startDate).replace(/-/g, '') || 'start';
      const endKey = formatDateKey(endDate).replace(/-/g, '') || 'end';

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="lich-cong-tac_${startKey}_${endKey}.pdf"`
      );

      doc.pipe(res);

      let regularFontName = null;
      let boldFontName = null;

      if (fontPaths.regular) {
        try {
          doc.registerFont('Schedule-Regular', fontPaths.regular);
          regularFontName = 'Schedule-Regular';
        } catch (fontError) {
          console.warn('Unable to register custom PDF font:', fontError.message || fontError);
        }
      }

      if (fontPaths.bold) {
        try {
          doc.registerFont('Schedule-Bold', fontPaths.bold);
          boldFontName = 'Schedule-Bold';
        } catch (fontError) {
          console.warn('Unable to register bold PDF font:', fontError.message || fontError);
        }
      }

      const useRegular = () => {
        if (regularFontName) {
          doc.font(regularFontName);
        } else {
          doc.font('Helvetica');
        }
      };

      const useBold = () => {
        if (boldFontName) {
          doc.font(boldFontName);
        } else if (regularFontName) {
          doc.font(regularFontName);
        } else {
          doc.font('Helvetica-Bold');
        }
      };

      // Helper function to draw table
      const drawTable = (events, columns, startY) => {
        const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
        const tableLeft = doc.page.margins.left;
        const columnWidths = columns.map(col => col.width || pageWidth / columns.length);
        
        let currentY = startY;
        
        // Draw header row background first
        doc.save();
        doc.rect(tableLeft, currentY, pageWidth, 24)
           .fillAndStroke('#667eea', '#5568d3');
        doc.restore();
        
        // Draw header text on top
        useBold();
        doc.fontSize(9).fillColor('#ffffff');
        let currentX = tableLeft;
        columns.forEach((col, idx) => {
          doc.text(
            col.header,
            currentX + 4,
            currentY + 7,
            { width: columnWidths[idx] - 8, align: col.align || 'left', lineBreak: false }
          );
          currentX += columnWidths[idx];
        });
        
        currentY += 24;
        
        // Draw data rows
        events.forEach((event, rowIndex) => {
          const rowHeight = this.calculateRowHeight(doc, event, columns, columnWidths);
          
          // Check if need new page
          if (currentY + rowHeight > doc.page.height - doc.page.margins.bottom - 20) {
            doc.addPage({ layout: pdfOrientation });
            currentY = doc.page.margins.top;
            
            // Redraw header background
            doc.save();
            doc.rect(tableLeft, currentY, pageWidth, 24)
               .fillAndStroke('#667eea', '#5568d3');
            doc.restore();
            
            // Redraw header text
            useBold();
            doc.fontSize(9).fillColor('#ffffff');
            currentX = tableLeft;
            columns.forEach((col, idx) => {
              doc.text(
                col.header,
                currentX + 4,
                currentY + 7,
                { width: columnWidths[idx] - 8, align: col.align || 'left', lineBreak: false }
              );
              currentX += columnWidths[idx];
            });
            currentY += 24;
          }
          
          // Draw row background
          const bgColor = rowIndex % 2 === 0 ? '#f8f9fa' : '#ffffff';
          doc.save();
          doc.rect(tableLeft, currentY, pageWidth, rowHeight)
             .fillAndStroke(bgColor, '#e9ecef');
          doc.restore();
          
          // Draw cell content on top
          useRegular();
          doc.fontSize(8).fillColor('#2c3e50');
          currentX = tableLeft;
          columns.forEach((col, idx) => {
            const cellValue = col.getValue(event);
            doc.text(
              cellValue,
              currentX + 4,
              currentY + 4,
              { width: columnWidths[idx] - 8, align: col.align || 'left' }
            );
            currentX += columnWidths[idx];
          });
          
          currentY += rowHeight;
        });
        
        return currentY;
      };

      // Header
      useBold();
      doc.fontSize(16).fillColor('#1f2937').text('LỊCH CÔNG TÁC TỔNG HỢP', { align: 'center' });
      useRegular();
      doc.moveDown(0.3);
      doc.fontSize(10).fillColor('#4b5563').text(
        `Thời gian: ${formatDateRangeDisplay(startDate, endDate)}`,
        { align: 'center' }
      );
      doc.moveDown(0.15);
      doc.fontSize(9).fillColor('#6b7280').text(
        `Xuất lúc: ${new Date().toLocaleString('vi-VN')}`,
        { align: 'center' }
      );

      if (userIdParam) {
        doc.moveDown(0.15);
        useRegular();
        const filterLabel = userFilter
          ? `${userFilter.full_name} (${userFilter.email})`
          : `ID người dùng: ${userIdParam}`;
        doc.fontSize(9).fillColor('#6b7280').text(
          `Bộ lọc: ${filterLabel}`,
          { align: 'center' }
        );
      }

      doc.moveDown(0.5);
      
      // Summary
      useRegular();
      doc.fontSize(10).fillColor('#1f2937');
      doc.text(`📊 Tổng số lịch giảng: ${teachingEvents.length}  |  Tổng số lịch công tác khác: ${otherEvents.length}`);
      
      if (Object.keys(summaryByType).length > 0) {
        doc.moveDown(0.3);
        doc.fontSize(9).fillColor('#374151');
        const summary = Object.entries(summaryByType)
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([type, count]) => `${TYPE_LABELS[type] || type}: ${count}`)
          .join('  |  ');
        doc.text(`Phân bố: ${summary}`);
      }

      doc.moveDown(0.7);

      // Define columns based on selected fields
      const buildColumns = () => {
        const availableColumns = {
          datetime: { 
            header: 'Ngày giờ', 
            width: pdfOrientation === 'landscape' ? 100 : 85,
            getValue: (event) => {
              if (event.start_time) {
                return `${formatDateKey(new Date(event.start || ''))}\n${event.start_time}-${event.end_time}`;
              }
              const hasTime = !event.allDay;
              if (hasTime) {
                return `${formatDateKey(event.start)}\n${formatTime(event.start)}-${formatTime(event.end || event.start)}`;
              }
              return `${formatDateKey(event.start)}\nCả ngày`;
            }
          },
          title: { 
            header: 'Tiêu đề', 
            width: pdfOrientation === 'landscape' ? 150 : 120,
            getValue: (event) => event.title || event.exam_name || 'Chưa đặt tên'
          },
          event_type: { 
            header: 'Loại', 
            width: 60,
            getValue: (event) => TYPE_LABELS[event.event_type] || 'Khác'
          },
          organizer: { 
            header: 'Người tổ chức', 
            width: pdfOrientation === 'landscape' ? 100 : 80,
            getValue: (event) => event.organizer || ''
          },
          class_name: { 
            header: 'Lớp', 
            width: 50,
            getValue: (event) => event.class_name || ''
          },
          location: { 
            header: 'Địa điểm', 
            width: pdfOrientation === 'landscape' ? 90 : 70,
            getValue: (event) => {
              const parts = [];
              if (event.room) parts.push(event.room);
              if (event.location) parts.push(event.location);
              if (event.building) parts.push(event.building);
              return parts.join(' - ') || '';
            }
          },
          room: { 
            header: 'Phòng', 
            width: 50,
            getValue: (event) => event.room || ''
          },
          building: { 
            header: 'Tòa', 
            width: 40,
            getValue: (event) => event.building || ''
          },
          status: { 
            header: 'Trạng thái', 
            width: 70,
            getValue: (event) => STATUS_LABELS[event.status] || ''
          },
          priority: { 
            header: 'Ưu tiên', 
            width: 60,
            getValue: (event) => PRIORITY_LABELS[event.priority] || ''
          },
          description: { 
            header: 'Mô tả', 
            width: pdfOrientation === 'landscape' ? 120 : 100,
            getValue: (event) => (event.description || '').substring(0, 100)
          },
          notes: { 
            header: 'Ghi chú', 
            width: pdfOrientation === 'landscape' ? 100 : 80,
            getValue: (event) => (event.notes || '').substring(0, 80)
          }
        };
        
        return selectedFields
          .filter(field => availableColumns[field])
          .map(field => availableColumns[field]);
      };

      const columns = buildColumns();
      
      if (columns.length === 0) {
        // Fallback if no valid columns
        columns.push(
          { header: 'Ngày giờ', width: 100, getValue: (e) => formatDateKey(e.start || e.exam_date) },
          { header: 'Tiêu đề', width: 200, getValue: (e) => e.title || e.exam_name }
        );
      }

      // Section 1: Teaching schedule
      if (teachingEvents.length > 0) {
        useBold();
        doc.fontSize(12).fillColor('#1f2937').text('I. LỊCH GIẢNG DẠY', { underline: true });
        doc.moveDown(0.3);
        
        const currentY = drawTable(teachingEvents, columns, doc.y);
        doc.y = currentY + 10;
      } else {
        useBold();
        doc.fontSize(12).fillColor('#1f2937').text('I. LỊCH GIẢNG DẠY', { underline: true });
        doc.moveDown(0.3);
        useRegular();
        doc.fontSize(9).fillColor('#6b7280').text('Không có lịch giảng dạy trong giai đoạn này.');
        doc.moveDown(0.5);
      }

      // Section 2: Other schedules
      if (otherEvents.length > 0) {
        useBold();
        doc.fontSize(12).fillColor('#1f2937').text('II. LỊCH CÔNG TÁC KHÁC', { underline: true });
        doc.moveDown(0.3);
        
        const currentY = drawTable(otherEvents, columns, doc.y);
        doc.y = currentY + 10;
      } else {
        useBold();
        doc.fontSize(12).fillColor('#1f2937').text('II. LỊCH CÔNG TÁC KHÁC', { underline: true });
        doc.moveDown(0.3);
        useRegular();
        doc.fontSize(9).fillColor('#6b7280').text('Không có lịch công tác nào khác trong giai đoạn này.');
        doc.moveDown(0.5);
      }

      // Footer
      doc.moveDown(0.5);
      useRegular();
      doc.fontSize(8).fillColor('#9ca3af').text(
        'Biểu mẫu được tạo tự động từ hệ thống quản lý giáo vụ.',
        { align: 'center' }
      );

      doc.end();
    } catch (error) {
      console.error('Export enhanced PDF error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Không thể xuất PDF. Vui lòng thử lại sau.' });
      } else {
        res.end();
      }
    }
  }

  // Helper to calculate row height for table
  calculateRowHeight(doc, event, columns, columnWidths) {
    let maxHeight = 20; // Minimum height
    
    columns.forEach((col, idx) => {
      const text = col.getValue(event);
      const textHeight = doc.heightOfString(text, { 
        width: columnWidths[idx] - 8,
        align: col.align || 'left'
      });
      maxHeight = Math.max(maxHeight, textHeight + 8);
    });
    
    return Math.min(maxHeight, 60); // Cap at 60px
  }
}

module.exports = new ScheduleController();
