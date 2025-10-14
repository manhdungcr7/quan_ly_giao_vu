/**
 * ExaminationController
 * Quản lý công tác khảo thí
 */

const ExaminationSession = require('../models/ExaminationSession');
const db = require('../../config/database');
const path = require('path');
const fs = require('fs').promises;

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
      
  // Load periods cho dropdown filter
  const periods = await this.db.query('SELECT id, name FROM examination_periods ORDER BY created_at DESC');
      const graders = await this.db.query(
        'SELECT id, full_name, email FROM users WHERE role_id IN (1, 2) AND is_active = 1 ORDER BY full_name'
      );
      
      console.log('📋 About to render view...');
      console.log('📋 Sessions array:', JSON.stringify(sessions).substring(0, 200));
      console.log('📋 User:', req.session.user ? req.session.user.username : 'No user');
      // Prevent caching the list page to ensure newly saved/updated data shows immediately
      res.set('Cache-Control', 'no-store');

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
        alerts
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
      // Handle manual input fields (create if needed)
      const data = { ...req.body };

      // If period_name provided but no period_id, create new period
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

      // If subject_name provided but no subject_id, create new subject
      if (data.subject_name && !data.subject_id) {
        // Extract code if format is "CODE - Name"
        const match = data.subject_name.match(/^([A-Z0-9]+)\s*-\s*(.+)$/);
        const code = match ? match[1] : data.subject_name.substring(0, 10).toUpperCase();
        const name = match ? match[2] : data.subject_name;

        const existingSubject = await this.db.query(
          'SELECT id FROM subjects WHERE code = ? OR name = ?',
          [code, name]
        );
        if (existingSubject.length > 0) {
          data.subject_id = existingSubject[0].id;
        } else {
          const result = await this.db.query(
            'INSERT INTO subjects (code, name, status) VALUES (?, ?, ?)',
            [code, name, 'active']
          );
          data.subject_id = result.insertId;
        }
      }

      // If class_name provided but no class_id, create new class
      if (data.class_name && !data.class_id) {
        const match = data.class_name.match(/^([A-Z0-9]+)\s*-\s*(.+)$/);
        const code = match ? match[1] : data.class_name.substring(0, 10).toUpperCase();
        const name = match ? match[2] : data.class_name;

        const existingClass = await this.db.query(
          'SELECT id FROM classes WHERE code = ? OR name = ?',
          [code, name]
        );
        if (existingClass.length > 0) {
          data.class_id = existingClass[0].id;
        } else {
          const result = await this.db.query(
            'INSERT INTO classes (code, name, status) VALUES (?, ?, ?)',
            [code, name, 'active']
          );
          data.class_id = result.insertId;
        }
      }

      await this.resolveGraderInput(data);

      const supportsSecondary = await ExaminationSession.supportsSecondaryGrader();
      if (!supportsSecondary) {
        delete data.grader2_id;
        delete data.grader2_manual_name;
      }
      delete data.grader_name;
      delete data.grader2_name;

      // Normalize and sanitize payload before create
      if (data.exam_date === '') data.exam_date = null;
      if (data.grading_deadline === '') data.grading_deadline = null;
      if (data.exam_time === '') data.exam_time = null;
      if (data.duration !== undefined) data.duration = data.duration === '' ? null : Number(data.duration);
      if (data.student_count !== undefined) data.student_count = data.student_count === '' ? 0 : Number(data.student_count);
      if (data.expected_copies !== undefined) data.expected_copies = data.expected_copies === '' ? null : Number(data.expected_copies);

      // Whitelist fields for create (create ignores extra fields but keep it clean)
      const allowed = [
        'period_id','subject_id','class_id','exam_code','exam_name','exam_date','exam_time','duration',
        'room','building','student_count','expected_copies','grader_id','grader_manual_name','grader2_id','grader2_manual_name','grading_deadline','link','exam_type','status','notes'
      ];
      const createData = {};
      for (const k of allowed) {
        if (k in data) createData[k] = data[k];
      }

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

      // Subject handling
      if (data.subject_name && !data.subject_id) {
        const match = data.subject_name.match(/^([A-Z0-9]+)\s*-\s*(.+)$/);
        const code = match ? match[1] : data.subject_name.substring(0, 10).toUpperCase();
        const name = match ? match[2] : data.subject_name;

        const existingSubject = await this.db.query(
          'SELECT id FROM subjects WHERE code = ? OR name = ?',
          [code, name]
        );
        if (existingSubject.length > 0) {
          data.subject_id = existingSubject[0].id;
        } else {
          const result = await this.db.query(
            'INSERT INTO subjects (code, name, status) VALUES (?, ?, ?)',
            [code, name, 'active']
          );
          data.subject_id = result.insertId;
        }
      }

      // Class handling
      if (data.class_name && !data.class_id) {
        const match = data.class_name.match(/^([A-Z0-9]+)\s*-\s*(.+)$/);
        const code = match ? match[1] : data.class_name.substring(0, 10).toUpperCase();
        const name = match ? match[2] : data.class_name;

        const existingClass = await this.db.query(
          'SELECT id FROM classes WHERE code = ? OR name = ?',
          [code, name]
        );
        if (existingClass.length > 0) {
          data.class_id = existingClass[0].id;
        } else {
          const result = await this.db.query(
            'INSERT INTO classes (code, name, status) VALUES (?, ?, ?)',
            [code, name, 'active']
          );
          data.class_id = result.insertId;
        }
      }

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
      delete data.grader_name;
      delete data.grader2_name;

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

  async resolveGraderInput(data) {
    if (!data) {
      return;
    }

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

    if (await ExaminationSession.supportsSecondaryGrader()) {
      await resolveGrader('grader2_id', 'grader2_name', 'grader2_manual_name');
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
