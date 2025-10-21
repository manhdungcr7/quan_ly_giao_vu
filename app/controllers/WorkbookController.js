const Workbook = require('../models/Workbook');
const WorkbookEntry = require('../models/WorkbookEntry');
const User = require('../models/User');
const CONSTANTS = require('../../config/constants');
const db = require('../../config/database');

class WorkbookController {
  constructor() {
    this.userModel = new User();
  }

  normalizeProgressSummary(raw) {
    const toNumber = (value) => {
      const num = Number(value);
      return Number.isFinite(num) ? num : 0;
    };

    const averageRaw = raw?.average ?? raw?.avg ?? 0;
    const completed = Math.max(0, toNumber(raw?.completed));
    const inProgress = Math.max(0, toNumber(raw?.inProgress));
    const total = Math.max(0, toNumber(raw?.total));
  const averageBase = total > 0 ? toNumber(averageRaw) : 0;
  const average = Math.max(0, Math.min(100, averageBase));

    return {
      average,
      completed,
      inProgress,
      total
    };
  }

  getUserRoleName(sessionUser) {
    if (!sessionUser) {
      return '';
    }
    const name = sessionUser.role_name || sessionUser.roleName || '';
    return name.toString().trim().toLowerCase();
  }

  async getEligibleApproversForUser(sessionUser) {
    const roleName = this.getUserRoleName(sessionUser);
    if (!roleName) {
      return [];
    }

    return await this.userModel.getEligibleApprovers(roleName, sessionUser?.id);
  }

  /**
   * Hiển thị trang chính của sổ tay công tác
   */
  async index(req, res) {
    try {
      const userId = req.session.user.id;
      
      // Lấy tuần hiện tại
      const today = new Date();
      const currentWeekStart = this.getWeekStart(today);
      const currentWeekEnd = this.getWeekEnd(currentWeekStart);
      
      // Tìm workbook của tuần hiện tại
      let workbook = await Workbook.findByWeek(
        userId,
        currentWeekStart,
        currentWeekEnd
      );
      
      // Nếu chưa có, tạo mới
      if (!workbook) {
        const workbookId = await Workbook.create({
          user_id: userId,
          week_start: currentWeekStart,
          week_end: currentWeekEnd,
          status: 'draft'
        });
        
        // Tạo workbook object với ID mới
        workbook = {
          id: workbookId,
          user_id: userId,
          week_start: currentWeekStart,
          week_end: currentWeekEnd,
          status: 'draft'
        };
      }

      const storedWeekStart = this.normalizeDateValue(workbook?.week_start);
      const storedWeekEnd = this.normalizeDateValue(workbook?.week_end);
      const normalizedWeekStart = this.getWeekStart(storedWeekStart || workbook?.week_start || currentWeekStart);
      const normalizedWeekEnd = this.getWeekEnd(normalizedWeekStart);

      if (workbook?.id && (storedWeekStart !== normalizedWeekStart || storedWeekEnd !== normalizedWeekEnd)) {
        try {
          await Workbook.updateWeekRange(workbook.id, normalizedWeekStart, normalizedWeekEnd);
          workbook.week_start = normalizedWeekStart;
          workbook.week_end = normalizedWeekEnd;
        } catch (syncError) {
          console.warn('Unable to normalize workbook week range', workbook.id, syncError.message || syncError);
        }
      }

      const normalizedWorkbook = {
        ...workbook,
        week_start: normalizedWeekStart,
        week_end: normalizedWeekEnd
      };

      const isOwner = normalizedWorkbook.user_id === userId;
      const isApprover = normalizedWorkbook.approver_id === userId;

      let approver = null;
      if (normalizedWorkbook?.approver_id) {
        try {
          approver = await this.userModel.findWithRole(normalizedWorkbook.approver_id, {
            includeInactive: true,
            includeAllStatuses: true
          });
        } catch (error) {
          console.warn('Unable to load approver info for workbook', normalizedWorkbook.id, error.message || error);
        }
      }
      
      // Lấy tất cả entries của tuần - ensure it's an array
      let entries = await WorkbookEntry.findByWorkbook(normalizedWorkbook.id);
      
      // Handle mysql2 result format
      if (Array.isArray(entries[0])) {
        entries = entries[0]; // Extract rows from [rows, fields]
      }
      
      // Ensure entries is always an array
      if (!Array.isArray(entries)) {
        entries = [];
      }
      
      // Lấy thống kê progress
  const rawProgress = await WorkbookEntry.getWeekProgress(normalizedWorkbook.id);
  const progress = this.normalizeProgressSummary(rawProgress);
      
      const approverOptions = isOwner
        ? await this.getEligibleApproversForUser(req.session.user)
        : [];

      res.render('workbook/index', {
        title: 'Sổ tay công tác',
        user: req.session.user,
        workbook: normalizedWorkbook,
        entries,
  progress,
        weekStart: normalizedWeekStart,
        weekEnd: normalizedWeekEnd,
        currentPath: '/workbook',
        approver,
        roleLabels: CONSTANTS.USER_ROLE_LABELS,
        approverOptions,
        isOwner,
        isApprover
      });
      
    } catch (error) {
      console.error('Error loading workbook:', error);
      req.flash('error', 'Không thể tải sổ tay công tác');
      res.redirect('/dashboard');
    }
  }

  /**
   * Lưu hoặc cập nhật entry cho một ngày
   */
  async saveEntry(req, res) {
    try {
      const userId = req.session.user.id;
      const { workbook_id, day_of_week, main_focus, tasks, notes, progress } = req.body;
      
      console.log('📝 Saving entry:', { workbook_id, day_of_week, main_focus, tasks: tasks?.substring(0, 50), progress });
      
      // Verify workbook belongs to user
      const result = await db.query('SELECT * FROM workbooks WHERE id = ?', [workbook_id]);
      const workbooks = Array.isArray(result[0]) ? result[0] : result;
      const workbook = workbooks[0];
      
      console.log('🔍 Workbook check:', { 
        workbook_id, 
        found: !!workbook, 
        workbook_user_id: workbook?.user_id, 
        session_user_id: userId 
      });
      
      if (!workbook || workbook.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Không có quyền truy cập'
        });
      }
      
      // Use progress from frontend if provided, otherwise calculate
      let finalProgress = progress !== undefined ? parseInt(progress) : 0;
      if (progress === undefined || progress === null) {
        if (main_focus && main_focus.trim()) finalProgress += 33;
        if (tasks && tasks.trim()) finalProgress += 33;
        if (notes && notes.trim()) finalProgress += 34;
      }
      
      // Ensure tasks is a string (JSON array)
      let tasksString = tasks;
      if (typeof tasks === 'object') {
        tasksString = JSON.stringify(tasks);
      } else if (!tasks) {
        tasksString = '[]';
      }
      
      console.log('💾 Final data:', { finalProgress, tasksString: tasksString.substring(0, 100) });
      
      // Save entry
      const entryId = await WorkbookEntry.createOrUpdate({
        workbook_id,
        day_of_week,
        main_focus: main_focus || '',
        tasks: tasksString,
        notes: notes || '',
        progress: finalProgress
      });
      
      console.log('✅ Entry saved with ID:', entryId);
      
      res.json({
        success: true,
        message: 'Đã lưu thành công',
        entry_id: entryId,
        progress: finalProgress
      });
      
    } catch (error) {
      console.error('❌ Error saving entry:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lưu dữ liệu: ' + error.message
      });
    }
  }

  /**
   * Lấy entry của một ngày
   */
  async getEntry(req, res) {
    try {
      const userId = req.session.user.id;
      const { workbook_id, day_of_week } = req.query;
      
      // Verify workbook belongs to user
      const workbooks = await db.query('SELECT * FROM workbooks WHERE id = ?', [workbook_id]);
      const workbook = Array.isArray(workbooks) ? workbooks[0] : workbooks;
      if (!workbook || workbook.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Không có quyền truy cập'
        });
      }
      
      const entry = await WorkbookEntry.findByDay(workbook_id, day_of_week);
      
      res.json({
        success: true,
        entry: entry || {}
      });
      
    } catch (error) {
      console.error('Error getting entry:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi tải dữ liệu'
      });
    }
  }

  /**
   * Cập nhật trạng thái workbook (draft, submitted, approved)
   */
  async updateStatus(req, res) {
    try {
      const userId = req.session.user.id;
      const { id } = req.params;
      const { status, approver_id: approverId, note } = req.body;
      
      // Verify workbook belongs to user
      const rawResult = await db.query('SELECT * FROM workbooks WHERE id = ?', [id]);
      const workbookRows = Array.isArray(rawResult[0]) ? rawResult[0] : rawResult;
      const workbook = Array.isArray(workbookRows) ? workbookRows[0] : workbookRows;
      if (!workbook) {
        return res.status(403).json({
          success: false,
          message: 'Không có quyền truy cập'
        });
      }

      const isOwner = workbook.user_id === userId;
      const isApprover = workbook.approver_id === userId;

      const ownerAllowedStatuses = new Set(['draft', 'submitted']);
      const approverAllowedStatuses = new Set(['approved', 'rejected']);

      const isOwnerAction = ownerAllowedStatuses.has(status) || (!approverAllowedStatuses.has(status));
      const isApproverAction = approverAllowedStatuses.has(status);

      if ((isOwnerAction && !isOwner) || (isApproverAction && !isApprover)) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không được phép cập nhật trạng thái này'
        });
      }
      
      // Validate status
      const validStatuses = ['draft', 'submitted', 'approved', 'rejected'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Trạng thái không hợp lệ'
        });
      }

      const extraUpdates = {};

      if (status === 'submitted') {
        if (!approverId) {
          return res.status(400).json({
            success: false,
            message: 'Vui lòng chọn người duyệt có chức vụ cao hơn'
          });
        }

        const parsedApproverId = Number.parseInt(approverId, 10);
        if (!Number.isInteger(parsedApproverId) || parsedApproverId <= 0) {
          return res.status(400).json({
            success: false,
            message: 'Người duyệt không hợp lệ'
          });
        }

        const approver = await this.userModel.findWithRole(parsedApproverId, {
          includeInactive: false,
          includeAllStatuses: false
        });

        if (!approver) {
          return res.status(404).json({
            success: false,
            message: 'Không tìm thấy người duyệt được chọn'
          });
        }

        const hierarchy = Array.isArray(CONSTANTS.ROLE_HIERARCHY) ? CONSTANTS.ROLE_HIERARCHY : [];
        const approverRole = (approver.role_name || '').toString().trim().toLowerCase();
        const submitterRole = this.getUserRoleName(req.session.user);
        const approverIndex = hierarchy.indexOf(approverRole);
        const submitterIndex = hierarchy.indexOf(submitterRole);

        if (approverIndex === -1 || submitterIndex === -1 || approverIndex >= submitterIndex) {
          return res.status(400).json({
            success: false,
            message: 'Người duyệt phải có chức vụ cao hơn bạn'
          });
        }

        extraUpdates.approver_id = parsedApproverId;
        extraUpdates.approval_requested_at = new Date();
        extraUpdates.approval_decision_at = null;
        extraUpdates.approval_note = null;
      }

      if (['approved', 'rejected'].includes(status)) {
        extraUpdates.approval_decision_at = new Date();
        extraUpdates.approval_note = note || null;
      }

      if (status === 'draft') {
        extraUpdates.approver_id = null;
        extraUpdates.approval_requested_at = null;
        extraUpdates.approval_decision_at = null;
        extraUpdates.approval_note = null;
      }

      await Workbook.updateStatus(id, status, extraUpdates);
      
      res.json({
        success: true,
        message: 'Đã cập nhật trạng thái'
      });
      
    } catch (error) {
      console.error('Error updating status:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi cập nhật trạng thái'
      });
    }
  }

  async listApproverOptions(req, res) {
    try {
      const approverOptions = await this.getEligibleApproversForUser(req.session.user);
      res.json({ success: true, data: approverOptions });
    } catch (error) {
      console.error('Error loading approver options:', error);
      res.status(500).json({ success: false, message: 'Không thể tải danh sách người duyệt' });
    }
  }

  async listPendingApprovals(req, res) {
    try {
      const approverId = req.session.user.id;
      const pending = await Workbook.getPendingApprovalsForApprover(approverId, 20);
      res.json({ success: true, data: pending });
    } catch (error) {
      console.error('Error loading pending approvals:', error);
      res.status(500).json({ success: false, message: 'Không thể tải danh sách sổ tay chờ duyệt' });
    }
  }

  /**
   * Tạo workbook mới cho tuần chỉ định
   */
  async createWorkbook(req, res) {
    try {
      const userId = req.session.user.id;
  const { week_start, week_end } = req.body;
      
      console.log('📝 Creating new workbook:', { userId, week_start, week_end });
      
      // Validate dates
      if (!week_start || !week_end) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu thông tin ngày bắt đầu/kết thúc'
        });
      }
      
      const normalizedWeekStart = this.getWeekStart(week_start);
      const normalizedWeekEnd = this.getWeekEnd(normalizedWeekStart);

      // Check if workbook already exists for this week
      const existingWorkbook = await Workbook.findByWeek(userId, normalizedWeekStart, normalizedWeekEnd);
      
      if (existingWorkbook) {
        if (
          existingWorkbook.week_start !== normalizedWeekStart ||
          existingWorkbook.week_end !== normalizedWeekEnd
        ) {
          try {
            await Workbook.updateWeekRange(existingWorkbook.id, normalizedWeekStart, normalizedWeekEnd);
          } catch (syncError) {
            console.warn('Unable to sync existing workbook range', existingWorkbook.id, syncError.message || syncError);
          }
        }
        return res.json({
          success: true,
          workbook_id: existingWorkbook.id,
          week_start: normalizedWeekStart,
          week_end: normalizedWeekEnd,
          message: 'Sổ tay cho tuần này đã tồn tại'
        });
      }
      
      // Create new workbook
      const workbookId = await Workbook.create({
        user_id: userId,
        week_start: normalizedWeekStart,
        week_end: normalizedWeekEnd,
        status: 'draft'
      });
      
      console.log('✅ Workbook created:', workbookId);
      
      res.json({
        success: true,
        workbook_id: workbookId,
        week_start: normalizedWeekStart,
        week_end: normalizedWeekEnd,
        message: 'Đã tạo sổ tay mới thành công'
      });
      
    } catch (error) {
      console.error('❌ Error creating workbook:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi tạo sổ tay công tác'
      });
    }
  }

  /**
   * Xem lịch sử các tuần trước
   */
  async history(req, res) {
    try {
      const userId = req.session.user.id;
      const workbooks = await Workbook.findByUser(userId);
      
      res.render('workbook/history', {
        title: 'Lịch sử sổ tay công tác',
        user: req.session.user,
        workbooks
      });
      
    } catch (error) {
      console.error('Error loading history:', error);
      req.flash('error', 'Không thể tải lịch sử');
      res.redirect('/workbook');
    }
  }

  /**
   * Xem chi tiết một tuần cụ thể
   */
  async show(req, res) {
    try {
      const userId = req.session.user.id;
      const { id } = req.params;
      
      console.log('📖 WorkbookController.show - Loading workbook:', { id, userId });
      
      // Query database
  const workbooks = await db.query('SELECT * FROM workbooks WHERE id = ?', [id]);
  const workbookRows = Array.isArray(workbooks[0]) ? workbooks[0] : workbooks;
  const workbook = Array.isArray(workbookRows) ? workbookRows[0] : workbookRows;
      
      console.log('🔍 Workbook query result:', { found: !!workbook, workbook_user: workbook?.user_id, session_user: userId });
      
      if (!workbook || (workbook.user_id !== userId && workbook.approver_id !== userId)) {
        console.log('❌ Workbook not found or unauthorized');
        req.flash('error', 'Không tìm thấy sổ tay công tác');
        return res.redirect('/workbook');
      }
      
      // Get entries - ensure it's an array
      let entries = await WorkbookEntry.findByWorkbook(id);
      
      // Ensure entries is always an array
      if (Array.isArray(entries[0])) {
        entries = entries[0];
      }
      if (!Array.isArray(entries)) {
        entries = [];
      }
      
  const rawProgress = await WorkbookEntry.getWeekProgress(id);
  const progress = this.normalizeProgressSummary(rawProgress);

      const storedWeekStart = this.normalizeDateValue(workbook.week_start);
      const storedWeekEnd = this.normalizeDateValue(workbook.week_end);
      const normalizedWeekStart = this.getWeekStart(storedWeekStart || workbook.week_start || new Date());
      const normalizedWeekEnd = this.getWeekEnd(normalizedWeekStart);

      if (workbook?.id && (storedWeekStart !== normalizedWeekStart || storedWeekEnd !== normalizedWeekEnd)) {
        try {
          await Workbook.updateWeekRange(workbook.id, normalizedWeekStart, normalizedWeekEnd);
          workbook.week_start = normalizedWeekStart;
          workbook.week_end = normalizedWeekEnd;
        } catch (syncError) {
          console.warn('Unable to normalize workbook week range', workbook.id, syncError.message || syncError);
        }
      }

      const normalizedWorkbook = {
        ...workbook,
        week_start: normalizedWeekStart,
        week_end: normalizedWeekEnd
      };

      const isOwner = normalizedWorkbook.user_id === userId;
      const isApprover = normalizedWorkbook.approver_id === userId;

      let approver = null;
      if (normalizedWorkbook?.approver_id) {
        try {
          approver = await this.userModel.findWithRole(normalizedWorkbook.approver_id, {
            includeInactive: true,
            includeAllStatuses: true
          });
        } catch (error) {
          console.warn('Unable to load approver info for workbook', normalizedWorkbook.id, error.message || error);
        }
      }

      console.log('📊 Rendering workbook:', { id, entriesCount: entries.length, progress });
      
      // Render using index view instead of show
      const approverOptions = isOwner
        ? await this.getEligibleApproversForUser(req.session.user)
        : [];

      res.render('workbook/index', {
        title: 'Sổ tay công tác',
        user: req.session.user,
        workbook: normalizedWorkbook,
        entries,
        progress,
        weekStart: normalizedWeekStart,
        weekEnd: normalizedWeekEnd,
        currentPath: '/workbook',
        approver,
        roleLabels: CONSTANTS.USER_ROLE_LABELS,
        approverOptions,
        isOwner,
        isApprover
      });
      
    } catch (error) {
      console.error('❌ Error loading workbook:', error);
      console.error('Error stack:', error.stack);
      req.flash('error', 'Không thể tải sổ tay công tác');
      res.redirect('/workbook');
    }
  }

  /**
   * Tạo workbook mới cho tuần chỉ định
   */
  async createWorkbook(req, res) {
    try {
      const userId = req.session.user.id;
      const { week_start, week_end } = req.body;
      
      console.log('📝 Creating new workbook:', { userId, week_start, week_end });
      
      if (!week_start || !week_end) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu thông tin ngày bắt đầu và kết thúc'
        });
      }
      
      const normalizedWeekStart = this.getWeekStart(week_start);
      const normalizedWeekEnd = this.getWeekEnd(normalizedWeekStart);

      // Check if workbook already exists for this week
      const existingWorkbook = await Workbook.findByWeek(userId, normalizedWeekStart, normalizedWeekEnd);
      
      if (existingWorkbook) {
        if (
          existingWorkbook.week_start !== normalizedWeekStart ||
          existingWorkbook.week_end !== normalizedWeekEnd
        ) {
          try {
            await Workbook.updateWeekRange(existingWorkbook.id, normalizedWeekStart, normalizedWeekEnd);
          } catch (syncError) {
            console.warn('Unable to sync existing workbook range', existingWorkbook.id, syncError.message || syncError);
          }
        }
        return res.json({
          success: true,
          workbook_id: existingWorkbook.id,
          week_start: normalizedWeekStart,
          week_end: normalizedWeekEnd,
          message: 'Sổ tay cho tuần này đã tồn tại'
        });
      }
      
      // Create new workbook
      const workbookId = await Workbook.create({
        user_id: userId,
        week_start: normalizedWeekStart,
        week_end: normalizedWeekEnd,
        status: 'draft'
      });
      
      console.log('✅ Workbook created:', workbookId);
      
      res.json({
        success: true,
        workbook_id: workbookId,
        week_start: normalizedWeekStart,
        week_end: normalizedWeekEnd,
        message: 'Đã tạo sổ tay mới thành công'
      });
      
    } catch (error) {
      console.error('Error creating workbook:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi tạo sổ tay công tác'
      });
    }
  }

  /**
   * Tìm workbook theo tuần
   */
  async findWorkbookByWeek(req, res) {
    try {
      const userId = req.session.user.id;
      const { week_start, week_end } = req.query;
      
      console.log('🔍 Finding workbook:', { userId, week_start, week_end });
      
      if (!week_start || !week_end) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu thông tin ngày'
        });
      }
      
      const normalizedWeekStart = this.getWeekStart(week_start);
      const normalizedWeekEnd = this.getWeekEnd(normalizedWeekStart);

      // Find workbook for this week
      let workbook = await Workbook.findByWeek(userId, normalizedWeekStart, normalizedWeekEnd);

      if (!workbook && (week_start !== normalizedWeekStart || week_end !== normalizedWeekEnd)) {
        workbook = await Workbook.findByWeek(userId, week_start, week_end);
      }
      
      if (workbook) {
        const storedWeekStart = this.normalizeDateValue(workbook.week_start);
        const storedWeekEnd = this.normalizeDateValue(workbook.week_end);

        if (storedWeekStart !== normalizedWeekStart || storedWeekEnd !== normalizedWeekEnd) {
          try {
            await Workbook.updateWeekRange(workbook.id, normalizedWeekStart, normalizedWeekEnd);
            workbook.week_start = normalizedWeekStart;
            workbook.week_end = normalizedWeekEnd;
          } catch (syncError) {
            console.warn('Unable to normalize workbook week range', workbook.id, syncError.message || syncError);
          }
        }

        console.log('✅ Workbook found:', workbook.id);
        return res.json({
          success: true,
          workbook_id: workbook.id,
          workbook: workbook,
          week_start: normalizedWeekStart,
          week_end: normalizedWeekEnd
        });
      } else {
        console.log('ℹ️ No workbook found for this week');
        return res.json({
          success: false,
          message: 'Chưa có sổ tay cho tuần này'
        });
      }
      
    } catch (error) {
      console.error('❌ Error finding workbook:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi tìm sổ tay'
      });
    }
  }

  // Helper methods
  formatDateOnly(date) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
      return null;
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  parseDateInput(value) {
    if (value === null || value === undefined) {
      return null;
    }

    if (value instanceof Date) {
      if (Number.isNaN(value.getTime())) {
        return null;
      }
      return new Date(value.getFullYear(), value.getMonth(), value.getDate());
    }

    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed || trimmed === '0000-00-00') {
        return null;
      }

      const normalized = trimmed.includes('T') ? trimmed.split('T')[0] : trimmed;
      const parts = normalized.split('-').map((part) => Number.parseInt(part, 10));
      if (parts.length === 3 && parts.every((part) => Number.isFinite(part))) {
        const [year, month, day] = parts;
        if (year >= 1000 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
          return new Date(year, month - 1, day);
        }
      }

      const fallback = new Date(trimmed);
      if (!Number.isNaN(fallback.getTime())) {
        return new Date(fallback.getFullYear(), fallback.getMonth(), fallback.getDate());
      }
      return null;
    }

    if (typeof value === 'number') {
      const parsed = new Date(value);
      if (!Number.isNaN(parsed.getTime())) {
        return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
      }
      return null;
    }

    if (value && typeof value.toISOString === 'function') {
      try {
        return this.parseDateInput(value.toISOString());
      } catch (error) {
        // fall through
      }
    }

    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
    }
    return null;
  }

  normalizeDateValue(value) {
    const parsed = this.parseDateInput(value);
    return parsed ? this.formatDateOnly(parsed) : null;
  }

  getWeekStart(date) {
    const parsed = this.parseDateInput(date) || this.parseDateInput(new Date());
    const monday = new Date(parsed);
    const day = monday.getDay();
    const offset = day === 0 ? -6 : 1 - day;
    monday.setDate(monday.getDate() + offset);
    return this.formatDateOnly(monday);
  }

  getWeekEnd(weekStart) {
    const startDate = this.parseDateInput(weekStart) || this.parseDateInput(new Date());
    const sunday = new Date(startDate);
    sunday.setDate(sunday.getDate() + 6);
    return this.formatDateOnly(sunday);
  }

  /**
   * Cập nhật ghi chú nhanh cho workbook
   */
  async updateQuickNotes(req, res) {
    try {
      const userId = req.session.user.id;
      const { id } = req.params;
      const { notes } = req.body;
      
      console.log('💾 Updating quick notes for workbook:', id, 'user:', userId);
      
      // Kiểm tra quyền sở hữu
      const result = await db.query('SELECT * FROM workbooks WHERE id = ?', [id]);
      const workbooks = Array.isArray(result[0]) ? result[0] : result;
      const workbook = workbooks[0];
      
      console.log('🔍 Workbook check:', { found: !!workbook, workbook_user_id: workbook?.user_id, session_user_id: userId });
      
      if (!workbook || workbook.user_id !== userId) {
        return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
      }
      
      await Workbook.updateQuickNotes(id, notes);
      console.log('✅ Quick notes updated successfully');
      
      res.json({ success: true, message: 'Đã lưu ghi chú nhanh!' });
      
    } catch (error) {
      console.error('❌ Error updating quick notes:', error);
      res.status(500).json({ success: false, message: 'Lỗi khi lưu ghi chú' });
    }
  }

  /**
   * Lấy ghi chú nhanh cho workbook
   */
  async getQuickNotes(req, res) {
    try {
      const userId = req.session.user.id;
      const { id } = req.params;
      
      console.log('📥 Getting quick notes for workbook:', id, 'user:', userId);
      
      // Kiểm tra quyền sở hữu
      const result = await db.query('SELECT * FROM workbooks WHERE id = ?', [id]);
      const workbooks = Array.isArray(result[0]) ? result[0] : result;
      const workbook = workbooks[0];
      
      console.log('🔍 Workbook check:', { found: !!workbook, workbook_user_id: workbook?.user_id, session_user_id: userId });
      
      if (!workbook || workbook.user_id !== userId) {
        return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
      }
      
      const notes = await Workbook.getQuickNotes(id);
      console.log('✅ Quick notes retrieved:', notes ? notes.substring(0, 50) + '...' : '(empty)');
      
      res.json({ success: true, notes });
      
    } catch (error) {
      console.error('❌ Error getting quick notes:', error);
      res.status(500).json({ success: false, message: 'Lỗi khi lấy ghi chú' });
    }
  }
}

module.exports = WorkbookController;
