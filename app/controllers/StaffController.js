const Staff = require('../models/Staff');
const EvaluationCriteria = require('../models/EvaluationCriteria');
const EvaluationPeriod = require('../models/EvaluationPeriod');

const STATUS_META = {
  active: { label: 'Đang công tác', tone: 'success' },
  on_leave: { label: 'Nghỉ phép', tone: 'warning' },
  inactive: { label: 'Tạm dừng', tone: 'muted' },
  terminated: { label: 'Đã nghỉ việc', tone: 'danger' }
};

const STATUS_ORDER = ['all', 'active', 'on_leave', 'inactive', 'terminated'];

const EMPLOYMENT_OPTIONS = [
  { value: '', label: 'Tất cả loại hình cán bộ' },
  { value: 'full_time', label: 'Giảng viên cơ hữu' },
  { value: 'part_time', label: 'Giảng viên thỉnh giảng' },
  { value: 'contract', label: 'Hợp đồng/Chuyên gia' },
  { value: 'temporary', label: 'Tạm thời/Thử việc' }
];

class StaffController {
  constructor() {
    this.staffModel = new Staff();
    this.evaluationCriteriaModel = new EvaluationCriteria();
    this.evaluationPeriodModel = new EvaluationPeriod();
  }

  buildFilterLinks(currentSearch, extraParams = {}) {
    const baseParams = new URLSearchParams();
    if (currentSearch) {
      baseParams.set('q', currentSearch);
    }

    Object.entries(extraParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        baseParams.set(key, value);
      }
    });

    const links = {};

    STATUS_ORDER.forEach((statusValue) => {
      const params = new URLSearchParams(baseParams);
      if (statusValue !== 'all') {
        params.set('status', statusValue);
      }

      links[statusValue] = params.toString() ? `?${params.toString()}` : '';
    });

    return links;
  }

  composeStatusSummary(statusCounts, paginationTotal) {
    const counts = {
      all: paginationTotal || 0,
      active: 0,
      on_leave: 0,
      inactive: 0,
      terminated: 0
    };

    (Array.isArray(statusCounts) ? statusCounts : []).forEach((item) => {
      const key = item.status;
      if (counts[key] !== undefined) {
        counts[key] = item.total;
      }
    });

    return counts;
  }

  buildSummaryCards(stats, statusCounts) {
    return [
      {
        key: 'total',
        label: 'Tổng số cán bộ',
        value: stats?.total_staff || 0,
        description: 'Bao gồm toàn bộ cán bộ thuộc quản lý của khoa.',
        tone: 'primary'
      },
      {
        key: 'active',
        label: 'Đang công tác',
        value: statusCounts.active || stats?.active_staff || 0,
        description: 'Hiện đang làm việc tại đơn vị.',
        tone: 'success'
      },
      {
        key: 'on_leave',
        label: 'Nghỉ phép / Tạm nghỉ',
        value: statusCounts.on_leave || 0,
        description: 'Cán bộ tạm thời vắng mặt, theo dõi để cập nhật lại.',
        tone: 'warning'
      },
      {
        key: 'contract',
        label: 'Cán bộ hợp đồng',
        value: stats?.contract_staff || 0,
        description: 'Bao gồm cán bộ hợp đồng và cộng tác.',
        tone: 'info'
      }
    ];
  }

  formatStaffRecord(record) {
    if (!record) return null;

    const statusKey = (record.status || '').toLowerCase();
    const statusMeta = STATUS_META[statusKey] || { label: 'Không xác định', tone: 'muted' };

    const initials = (record.full_name || record.name || '?')
      .split(' ')
      .map((part) => part.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase();

    return {
      id: record.id,
      name: record.full_name || record.name || 'Chưa cập nhật',
      staffCode: record.staff_code || '---',
      email: record.email || 'Chưa có email',
      phone: record.phone || 'Chưa cập nhật',
      position: record.position_name || 'Chưa phân công',
      department: record.department_name || 'Chưa cập nhật',
      employmentType: record.employment_type,
      hireDate: record.hire_date,
      academicRank: record.academic_rank,
      academicDegree: record.academic_degree,
      status: statusKey,
      statusMeta,
      initials
    };
  }

  async index(req, res) {
    const page = Number.parseInt(req.query.page || '1', 10) || 1;
    const limit = 24;
    const rawStatus = (req.query.status || 'all').toLowerCase();
    const searchQuery = (req.query.q || '').trim();
    const departmentId = Number.parseInt(req.query.department_id, 10);
    const positionId = Number.parseInt(req.query.position_id, 10);
    const employmentType = (req.query.employment_type || '').trim();

    const filters = {};
    if (rawStatus && rawStatus !== 'all') {
      filters.status = rawStatus;
    }
    if (searchQuery) {
      filters.search = searchQuery;
    }
    if (Number.isFinite(departmentId) && departmentId > 0) {
      filters.department_id = departmentId;
    }
    if (Number.isFinite(positionId) && positionId > 0) {
      filters.position_id = positionId;
    }
    if (employmentType) {
      filters.employment_type = employmentType;
    }

    const filtersApplied = {
      status: rawStatus,
      search: searchQuery,
      department_id: Number.isFinite(departmentId) && departmentId > 0 ? departmentId : '',
      position_id: Number.isFinite(positionId) && positionId > 0 ? positionId : '',
      employment_type: employmentType
    };

    const hasFilters = Boolean(searchQuery)
      || (rawStatus && rawStatus !== 'all')
      || Number.isFinite(departmentId) && departmentId > 0
      || Number.isFinite(positionId) && positionId > 0
      || Boolean(employmentType);

    const filterLinks = this.buildFilterLinks(searchQuery, {
      department_id: Number.isFinite(departmentId) && departmentId > 0 ? departmentId : undefined,
      position_id: Number.isFinite(positionId) && positionId > 0 ? positionId : undefined,
      employment_type: employmentType || undefined
    });

    const buildBaseQueryString = () => {
      const baseQueryParams = new URLSearchParams();
      if (rawStatus && rawStatus !== 'all') {
        baseQueryParams.set('status', rawStatus);
      }
      if (searchQuery) {
        baseQueryParams.set('q', searchQuery);
      }
      if (Number.isFinite(departmentId) && departmentId > 0) {
        baseQueryParams.set('department_id', departmentId);
      }
      if (Number.isFinite(positionId) && positionId > 0) {
        baseQueryParams.set('position_id', positionId);
      }
      if (employmentType) {
        baseQueryParams.set('employment_type', employmentType);
      }
      return baseQueryParams.toString();
    };

    const baseQueryString = buildBaseQueryString();

    const renderFallbackView = (message) => {
      const summaryCounts = this.composeStatusSummary([], 0);
      const summaryCards = this.buildSummaryCards({}, summaryCounts);

      if (message) {
        req.flash('warning', message);
      }

      return res.render('staff/index', {
        title: 'Quản lý cán bộ',
        user: req.session.user,
        staffList: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 1,
          hasNext: false,
          hasPrev: page > 1
        },
        summaryCards,
        summaryCounts,
        activeStatus: rawStatus,
        statusMeta: STATUS_META,
        filterLinks,
        searchQuery,
        filtersApplied,
        hasFilters,
        baseQueryString,
        statusOrder: STATUS_ORDER,
        stats: {},
        departmentId: filtersApplied.department_id,
        positionId: filtersApplied.position_id,
        employmentType,
        departmentOptions: [],
        positionOptions: [],
        employmentOptions: EMPLOYMENT_OPTIONS,
        teachingSnapshot: [],
        departmentStats: []
      });
    };

    try {
      const [staffResult, stats, statusCounts, departmentStats, departmentOptions, positionOptions] = await Promise.all([
        this.staffModel.getStaffWithDetails(page, limit, filters),
        this.staffModel.getStats(),
        this.staffModel.getStatusSummary().catch((error) => {
          if (error?.code === 'ER_NO_SUCH_TABLE' || error?.code === 'ER_BAD_FIELD_ERROR') {
            console.warn('StaffController: status summary unavailable:', error.message);
            return [];
          }
          throw error;
        }),
        this.staffModel.getStatsByDepartment(),
        this.staffModel.getActiveDepartments(),
        this.staffModel.getPositionOptions()
      ]);

      const fallbackTotal = Array.isArray(staffResult?.data) ? staffResult.data.length : 0;
      const fallbackTotalPages = Math.max(1, Math.ceil(fallbackTotal / limit));
      const pagination = staffResult?.pagination || {
        page,
        limit,
        total: fallbackTotal,
        totalPages: fallbackTotalPages,
        hasNext: page < fallbackTotalPages,
        hasPrev: page > 1
      };

      const summaryCounts = this.composeStatusSummary(statusCounts, pagination.total);
      const safeStats = stats || {};
      const summaryCards = this.buildSummaryCards(safeStats, summaryCounts);
      const staffList = Array.isArray(staffResult?.data)
        ? staffResult.data.map((item) => this.formatStaffRecord(item)).filter(Boolean)
        : [];

      const teachingSnapshot = [
        {
          key: 'full_time',
          label: 'Giảng viên cơ hữu',
          value: safeStats.full_time_staff || 0,
          hint: 'Đang trực tiếp giảng dạy toàn thời gian'
        },
        {
          key: 'part_time',
          label: 'Giảng viên thỉnh giảng',
          value: safeStats.part_time_staff || 0,
          hint: 'Lịch giảng bán thời gian / cộng tác'
        },
        {
          key: 'contract',
          label: 'Chuyên gia hợp đồng',
          value: safeStats.contract_staff || 0,
          hint: 'Hỗ trợ các học phần đặc thù'
        },
        {
          key: 'experience',
          label: 'Kinh nghiệm TB',
          value: safeStats.avg_experience !== null && safeStats.avg_experience !== undefined
            ? `${Number(safeStats.avg_experience).toFixed(1)} năm`
            : 'Chưa có dữ liệu',
          hint: 'Thâm niên giảng dạy trung bình'
        }
      ];

      const topDepartmentStats = Array.isArray(departmentStats)
        ? departmentStats.slice(0, 6)
        : [];

      return res.render('staff/index', {
        title: 'Quản lý cán bộ',
        user: req.session.user,
        staffList,
        pagination,
        summaryCards,
        summaryCounts,
        activeStatus: rawStatus,
        statusMeta: STATUS_META,
        filterLinks,
        searchQuery,
        filtersApplied,
        hasFilters,
        baseQueryString,
        statusOrder: STATUS_ORDER,
        stats: safeStats,
        departmentId: filtersApplied.department_id,
        positionId: filtersApplied.position_id,
        employmentType,
        departmentOptions,
        positionOptions,
        employmentOptions: EMPLOYMENT_OPTIONS,
        teachingSnapshot,
        departmentStats: topDepartmentStats
      });
    } catch (error) {
      console.error('StaffController.index error:', error);
      const message = (error?.code && ['ER_NO_SUCH_TABLE', 'ER_BAD_FIELD_ERROR'].includes(error.code))
        ? 'Dữ liệu cán bộ đang được cập nhật. Một số thống kê chưa khả dụng.'
        : 'Không thể tải dữ liệu cán bộ. Đang hiển thị danh sách trống ở chế độ an toàn.';

      return renderFallbackView(message);
    }
  }

  async exportCsv(req, res) {
    const rawStatus = (req.query.status || 'all').toLowerCase();
    const searchQuery = (req.query.q || '').trim();
    const departmentId = Number.parseInt(req.query.department_id, 10);
    const positionId = Number.parseInt(req.query.position_id, 10);
    const employmentType = (req.query.employment_type || '').trim();

    const filters = {};
    if (rawStatus && rawStatus !== 'all') {
      filters.status = rawStatus;
    }
    if (searchQuery) {
      filters.search = searchQuery;
    }
    if (Number.isFinite(departmentId) && departmentId > 0) {
      filters.department_id = departmentId;
    }
    if (Number.isFinite(positionId) && positionId > 0) {
      filters.position_id = positionId;
    }
    if (employmentType) {
      filters.employment_type = employmentType;
    }

    try {
      const staffData = await this.staffModel.getAllForExport(filters);

      const employmentLabelMap = EMPLOYMENT_OPTIONS.reduce((acc, option) => {
        acc[option.value] = option.label;
        return acc;
      }, {});

      const headers = [
        'Mã cán bộ',
        'Họ và tên',
        'Phòng/Bộ môn',
        'Chức vụ',
        'Loại cán bộ',
        'Trạng thái',
        'Ngày vào làm',
        'Email',
        'Điện thoại',
        'Học hàm',
        'Học vị',
        'Lương (VND)'
      ];

      const formatDate = (value) => {
        if (!value) return '';
        const dt = new Date(value);
        if (Number.isNaN(dt.getTime())) {
          return '';
        }
        return dt.toLocaleDateString('vi-VN');
      };

      const escapeCsv = (value) => {
        if (value === null || value === undefined) {
          return '""';
        }
        const stringValue = String(value).replace(/"/g, '""');
        return `"${stringValue}"`;
      };

      const rows = staffData.map((item) => {
        const normalized = this.formatStaffRecord(item);
        const employmentLabel = employmentLabelMap[normalized.employmentType] || 'Chưa xác định';
        const salaryValue = item.salary !== null && item.salary !== undefined
          ? Number(item.salary).toLocaleString('vi-VN')
          : '';

        return [
          normalized.staffCode,
          normalized.name,
          normalized.department || 'Chưa cập nhật',
          normalized.position || 'Chưa phân công',
          employmentLabel,
          normalized.statusMeta?.label || normalized.status || 'Không xác định',
          formatDate(normalized.hireDate),
          normalized.email,
          normalized.phone,
          normalized.academicRank || '',
          normalized.academicDegree || '',
          salaryValue
        ].map(escapeCsv).join(',');
      });

      const csvContent = ['\ufeff' + headers.map(escapeCsv).join(','), ...rows].join('\n');
      const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const filename = `staff-report-${timestamp}.csv`;

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.send(csvContent);
    } catch (error) {
      console.error('StaffController.exportCsv error:', error);
      req.flash('error', 'Không thể xuất báo cáo nhân sự. Vui lòng thử lại.');
      return res.redirect(req.get('referer') || '/staff');
    }
  }

  /**
   * Hiển thị form thêm cán bộ mới
   */
  async create(req, res) {
    try {
      const departmentOptions = await this.staffModel.getDepartmentOptions();
      const positionOptions = await this.staffModel.getPositionOptions();

      return res.render('staff/create', {
        title: 'Thêm cán bộ mới',
        user: req.session.user,
        departmentOptions,
        positionOptions,
        employmentOptions: EMPLOYMENT_OPTIONS.filter(opt => opt.value),
        formData: req.flash('formData')[0] || {},
        errors: req.flash('errors')[0] || {}
      });
    } catch (error) {
      console.error('StaffController.create error:', error);
      req.flash('error', 'Không thể tải form thêm cán bộ. Vui lòng thử lại.');
      return res.redirect('/staff');
    }
  }

  /**
   * Xử lý thêm cán bộ mới
   */
  async store(req, res) {
    try {
      const {
        full_name,
        email,
        phone,
        staff_code,
        department_id,
        position_id,
        employment_type,
        hire_date,
        birth_date,
        gender,
        id_number,
        address,
        salary,
        academic_rank,
        academic_degree,
        years_experience,
        status,
        notes
      } = req.body;

      // Basic validation
      const errors = {};
      if (!full_name || full_name.trim().length < 3) errors.full_name = 'Họ tên phải có ít nhất 3 ký tự';
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Email không hợp lệ';
      if (!staff_code || staff_code.trim().length < 3) errors.staff_code = 'Mã cán bộ phải có ít nhất 3 ký tự';
      if (!department_id) errors.department_id = 'Vui lòng chọn phòng/bộ môn';
      if (!employment_type) errors.employment_type = 'Vui lòng chọn loại hình công tác';
      if (!hire_date) errors.hire_date = 'Vui lòng nhập ngày vào làm';
      if (Object.keys(errors).length) {
        req.flash('errors', errors);
        req.flash('formData', req.body);
        return res.redirect('/staff/create');
      }

      // Prevent duplicates
      const dupUser = await this.staffModel.db.findOne(
        'SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1',
        [staff_code.trim(), email.trim()]
      );
      if (dupUser) {
        req.flash('error', 'Mã cán bộ (username) hoặc email đã tồn tại trong hệ thống');
        req.flash('formData', req.body);
        return res.redirect('/staff/create');
      }
      const dupStaff = await this.staffModel.findByStaffCode(staff_code.trim());
      if (dupStaff) {
        req.flash('error', 'Mã cán bộ đã tồn tại');
        req.flash('formData', req.body);
        return res.redirect('/staff/create');
      }

      // Validate foreign keys
      const deptRow = await this.staffModel.db.findOne('SELECT id FROM departments WHERE id = ? AND is_active = 1', [department_id]);
      if (!deptRow) {
        req.flash('error', 'Phòng/Bộ môn không hợp lệ hoặc đã ngừng hoạt động');
        req.flash('formData', req.body);
        return res.redirect('/staff/create');
      }
      let posId = null;
      if (position_id) {
        const posRow = await this.staffModel.db.findOne('SELECT id FROM positions WHERE id = ? AND is_active = 1', [position_id]);
        if (!posRow) {
          req.flash('error', 'Chức vụ không hợp lệ');
          req.flash('formData', req.body);
          return res.redirect('/staff/create');
        }
        posId = position_id;
      }

      // Normalize data
      const allowedEmployment = new Set(['full_time','part_time','contract','temporary']);
      const normalizedEmployment = allowedEmployment.has(employment_type) ? employment_type : 'full_time';

      // Create user first
      const userData = {
        username: staff_code.trim(),
        email: email.trim(),
        full_name: full_name.trim(),
        phone: phone?.trim() || null,
        role: 'staff',
        password: 'staff@123',
        is_active: true
      };
      const userResult = await this.staffModel.createUserForStaff(userData);
      if (!userResult || !userResult.id) {
        throw new Error('Không thể tạo tài khoản người dùng');
      }

      // Create staff linked to user; rollback user on failure
      const staffData = {
        user_id: userResult.id,
        staff_code: staff_code.trim(),
        department_id: department_id || null,
        position_id: posId || null,
        employment_type: normalizedEmployment,
        hire_date,
        birth_date: birth_date || null,
        gender: gender || null,
        id_number: id_number?.trim() || null,
        address: address?.trim() || null,
        salary: salary || 0,
        academic_rank: academic_rank?.trim() || null,
        academic_degree: academic_degree?.trim() || null,
        years_experience: years_experience || 0,
        status: status || 'active',
        notes: notes?.trim() || null
      };

      try {
        await this.staffModel.create(staffData);
      } catch (e) {
        try { await this.staffModel.db.delete('DELETE FROM users WHERE id = ?', [userResult.id]); } catch (_) {}
        throw e;
      }

      req.flash('success', `Đã thêm cán bộ ${full_name} thành công! Mật khẩu mặc định: staff@123`);
      return res.redirect('/staff');
    } catch (error) {
      console.error('StaffController.store error:', error);
      const message = error?.code === 'ER_DUP_ENTRY'
        ? 'Mã cán bộ hoặc email đã tồn tại trong hệ thống'
        : 'Không thể thêm cán bộ. Vui lòng kiểm tra lại thông tin.';
      req.flash('error', message);
      req.flash('formData', req.body);
      return res.redirect('/staff/create');
    }
  }

  /**
   * Hiển thị trang cấu hình tiêu chí đánh giá
   */
  async evaluationCriteria(req, res) {
    try {
      const criteriaByCategory = await this.evaluationCriteriaModel.getByCategory();
      const activePeriod = await this.evaluationPeriodModel.getActivePeriod();
      const allPeriods = await this.evaluationPeriodModel.getAllPeriods();

      const categoryLabels = {
        teaching: 'Giảng dạy',
        research: 'Nghiên cứu khoa học',
        service: 'Phục vụ cộng đồng',
        professional: 'Phát triển nghề nghiệp',
        other: 'Kỷ luật & Đạo đức'
      };

      const measurementTypeLabels = {
        numeric: 'Số lượng',
        percentage: 'Phần trăm',
        grade: 'Xếp loại',
        boolean: 'Có/Không',
        text: 'Văn bản'
      };

      return res.render('staff/evaluation-criteria', {
        title: 'Thiết lập tiêu chí đánh giá',
        user: req.session.user,
        criteriaByCategory,
        categoryLabels,
        measurementTypeLabels,
        activePeriod,
        allPeriods
      });
    } catch (error) {
      console.error('StaffController.evaluationCriteria error:', error);
      req.flash('error', 'Không thể tải trang tiêu chí đánh giá');
      return res.redirect('/staff');
    }
  }

  /**
   * API: Lấy danh sách tiêu chí (JSON)
   */
  async apiListCriteria(req, res) {
    try {
      const all = await this.evaluationCriteriaModel.getAllActive();
      return res.json({ ok: true, data: all });
    } catch (error) {
      console.error('StaffController.apiListCriteria error:', error);
      return res.status(500).json({ ok: false, message: 'Không thể tải danh sách tiêu chí' });
    }
  }

  /**
   * POST: Tạo tiêu chí mới
   */
  async createCriteria(req, res) {
    try {
      const { name, code, description, category, measurement_type, unit, weight, is_required } = req.body;

      // Basic validation
      const errors = {};
      if (!name || name.trim().length < 3) errors.name = 'Tên tiêu chí tối thiểu 3 ký tự';
      if (!code || code.trim().length < 3) errors.code = 'Mã tiêu chí tối thiểu 3 ký tự';
      if (!category) errors.category = 'Chọn nhóm tiêu chí';
      if (!measurement_type) errors.measurement_type = 'Chọn loại đo lường';
      const numericWeight = Number(weight || 0);
      if (Number.isNaN(numericWeight) || numericWeight < 0 || numericWeight > 100) errors.weight = 'Trọng số 0-100';

      if (Object.keys(errors).length) {
        return res.status(422).json({ ok: false, errors });
      }

      const data = {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        description: description?.trim() || null,
        category,
        measurement_type,
        unit: unit?.trim() || null,
        weight: numericWeight,
        is_required: is_required ? 1 : 0,
        is_active: 1,
        display_order: 999
      };

      const result = await this.evaluationCriteriaModel.createCriteria(data);
      return res.json({ ok: true, id: result?.insertId, data: { id: result?.insertId, ...data } });
    } catch (error) {
      console.error('StaffController.createCriteria error:', error);
      const conflict = error?.code === 'ER_DUP_ENTRY';
      return res.status(conflict ? 409 : 500).json({ ok: false, message: conflict ? 'Mã tiêu chí đã tồn tại' : 'Không thể tạo tiêu chí mới' });
    }
  }

  /**
   * POST: Gán tiêu chí vào đợt đang hoạt động
   */
  async attachCriteriaToActivePeriod(req, res) {
    try {
      const { criteria_id, weight, target_value, excellent_value, is_required } = req.body;
      const activePeriod = await this.evaluationPeriodModel.getActivePeriod();
      if (!activePeriod) {
        return res.status(400).json({ ok: false, message: 'Chưa có đợt đánh giá đang hoạt động' });
      }

      await this.evaluationPeriodModel.addCriteriaToPeriod(activePeriod.id, Number(criteria_id), {
        weight: Number(weight || 0),
        target_value: target_value ? Number(target_value) : null,
        excellent_value: excellent_value ? Number(excellent_value) : null,
        is_required: !!is_required
      });

      return res.json({ ok: true });
    } catch (error) {
      console.error('StaffController.attachCriteriaToActivePeriod error:', error);
      return res.status(500).json({ ok: false, message: 'Không thể gán tiêu chí vào đợt' });
    }
  }
}

module.exports = StaffController;
