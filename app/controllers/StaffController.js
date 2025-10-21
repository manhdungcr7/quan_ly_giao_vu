const Staff = require('../models/Staff');
const EvaluationCriteria = require('../models/EvaluationCriteria');
const EvaluationPeriod = require('../models/EvaluationPeriod');
const { getFileInfo } = require('../middleware/upload');

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

const EMPLOYMENT_FORM_OPTIONS = EMPLOYMENT_OPTIONS.filter((opt) => opt.value);
const STATUS_OPTIONS = Object.entries(STATUS_META).map(([value, meta]) => ({ value, label: meta.label }));
const GENDER_OPTIONS = [
  { value: '', label: 'Chưa cập nhật' },
  { value: 'M', label: 'Nam' },
  { value: 'F', label: 'Nữ' },
  { value: 'O', label: 'Khác' }
];

const CRITERIA_CATEGORIES = new Set(['teaching', 'research', 'service', 'professional', 'other']);
const MEASUREMENT_TYPES = new Set(['numeric', 'percentage', 'grade', 'boolean', 'text']);

const parseDecimalField = (rawValue, defaultValue = 0) => {
  if (rawValue === undefined || rawValue === null) {
    return { ok: true, value: defaultValue, isBlank: true };
  }

  if (typeof rawValue === 'number') {
    return { ok: true, value: rawValue, isBlank: false };
  }

  const trimmed = String(rawValue).trim();
  if (!trimmed) {
    return { ok: true, value: defaultValue, isBlank: true };
  }

  const normalized = trimmed.replace(/\s+/g, '').replace(/,/g, '.');
  const parsed = Number.parseFloat(normalized);
  if (!Number.isFinite(parsed)) {
    return { ok: false, value: defaultValue, isBlank: false };
  }

  return { ok: true, value: parsed, isBlank: false };
};

const normalizeBooleanFlag = (value, defaultValue = 0) => {
  if (value === undefined || value === null) {
    return defaultValue ? 1 : 0;
  }

  if (value === true || value === 1) {
    return 1;
  }

  if (value === false || value === 0) {
    return 0;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['1', 'true', 'on', 'yes'].includes(normalized)) {
      return 1;
    }
    if (['0', 'false', 'off', 'no'].includes(normalized)) {
      return 0;
    }
  }

  return defaultValue ? 1 : 0;
};

class StaffController {
  constructor() {
    this.staffModel = new Staff();
    this.evaluationCriteriaModel = new EvaluationCriteria();
    this.evaluationPeriodModel = new EvaluationPeriod();
  }

  buildDocumentPayload(files) {
    if (!Array.isArray(files) || !files.length) {
      return [];
    }

    return files.map((file) => {
      const info = getFileInfo(file);
      const rawPath = info.relativePath || file.path.replace(process.cwd(), '').replace(/\\/g, '/');
      const normalizedPath = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
      return {
        originalName: info.originalName || file.originalname,
        filename: info.filename,
        mimetype: info.mimetype,
        size: info.size,
        relativePath: normalizedPath,
        path: info.path
      };
    });
  }

  formatFileSize(bytes) {
    if (!bytes || Number.isNaN(bytes)) {
      return '0 KB';
    }
    if (bytes < 1024) {
      return `${bytes} B`;
    }
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  prepareDocumentList(documents = []) {
    return documents.map((doc) => {
      const normalized = (doc.file_path || '').replace(/\\/g, '/');
      const publicIndex = normalized.indexOf('/public/');
      const urlPath = publicIndex >= 0
        ? normalized.slice(publicIndex + '/public'.length)
        : normalized;
      const webPath = urlPath.startsWith('/') ? urlPath : `/${urlPath}`;

      return {
        ...doc,
        url: webPath,
        sizeLabel: this.formatFileSize(doc.file_size)
      };
    });
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

    const parseJsonList = (value) => {
      if (!value) return [];
      try {
        const parsed = typeof value === 'string' ? JSON.parse(value) : value;
        return Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        return [];
      }
    };

    const primaryLanguages = parseJsonList(record.language_skills);
    const primaryItSkills = parseJsonList(record.it_skills);

    return {
      id: record.id,
      name: record.full_name || record.name || 'Chưa cập nhật',
      staffCode: record.staff_code || '---',
      email: record.email || 'Chưa có email',
      phone: record.phone || 'Chưa cập nhật',
      position: record.position_name || 'Chưa phân công',
      department: record.department_name || 'Chưa cập nhật',
      employmentType: record.employment_type,
      sectorJoinDate: record.hire_date,
      hireDate: record.hire_date,
      t04StartDate: record.t04_start_date,
      facultyStartDate: record.faculty_start_date,
      languages: primaryLanguages,
      itSkills: primaryItSkills,
      partyCardNumber: record.party_card_number,
      serviceNumber: record.service_number,
      partyJoinDate: record.party_join_date,
      yearsExperience: typeof record.years_experience === 'number' ? record.years_experience : Number(record.years_experience) || 0,
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
      || (Number.isFinite(departmentId) && departmentId > 0)
      || (Number.isFinite(positionId) && positionId > 0)
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
        'Ngày vào ngành',
        'Ngày công tác tại T04',
        'Ngày công tác tại Khoa',
        'Thâm niên (năm)',
        'Email',
        'Điện thoại',
        'Học hàm',
        'Học vị',
        'Lương (VND)',
        'Ngoại ngữ',
        'Tin học',
        'Số thẻ đảng viên',
        'Số hiệu',
        'Ngày vào Đảng'
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
          formatDate(normalized.sectorJoinDate),
          formatDate(normalized.t04StartDate),
          formatDate(normalized.facultyStartDate),
          normalized.yearsExperience || 0,
          normalized.email,
          normalized.phone,
          normalized.academicRank || '',
          normalized.academicDegree || '',
          salaryValue,
          (normalized.languages || []).join('; '),
          (normalized.itSkills || []).join('; '),
          normalized.partyCardNumber || '',
          normalized.serviceNumber || '',
          formatDate(normalized.partyJoinDate)
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
        employmentOptions: EMPLOYMENT_FORM_OPTIONS,
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
        t04_start_date,
        faculty_start_date,
        birth_date,
        gender,
        id_number,
        address,
        salary,
        academic_rank,
        academic_degree,
        years_experience,
        language_skills,
        it_skills,
        status,
        notes,
        party_card_number,
        service_number,
        party_join_date
      } = req.body;

      const toIntOrNull = (value) => {
        if (value === null || value === undefined || value === '') {
          return null;
        }
        const parsed = Number.parseInt(value, 10);
        return Number.isNaN(parsed) ? null : parsed;
      };

      const toNumberOrZero = (value) => {
        if (value === null || value === undefined || value === '') {
          return 0;
        }
        const normalized = typeof value === 'string' ? value.replace(/,/g, '').trim() : value;
        const parsed = Number.parseFloat(normalized);
        return Number.isFinite(parsed) ? parsed : 0;
      };

      const toExperience = (value) => {
        const parsed = Number.parseInt(value, 10);
        if (!Number.isFinite(parsed) || parsed < 0) {
          return 0;
        }
        return Math.min(parsed, 60);
      };

      const departmentIdValue = toIntOrNull(department_id);
      const positionIdValue = toIntOrNull(position_id);

      // Basic validation
      const errors = {};
      if (!full_name || full_name.trim().length < 3) errors.full_name = 'Họ tên phải có ít nhất 3 ký tự';
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Email không hợp lệ';
      if (!staff_code || staff_code.trim().length < 3) errors.staff_code = 'Mã cán bộ phải có ít nhất 3 ký tự';
      if (!departmentIdValue) errors.department_id = 'Vui lòng chọn phòng/bộ môn';
    if (!employment_type) errors.employment_type = 'Vui lòng chọn loại hình công tác';
    if (!hire_date) errors.hire_date = 'Vui lòng nhập ngày vào ngành';
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
      const deptRow = await this.staffModel.db.findOne('SELECT id FROM departments WHERE id = ? AND is_active = 1', [departmentIdValue]);
      if (!deptRow) {
        req.flash('error', 'Phòng/Bộ môn không hợp lệ hoặc đã ngừng hoạt động');
        req.flash('formData', req.body);
        return res.redirect('/staff/create');
      }
      let posId = null;
      if (positionIdValue) {
        const posRow = await this.staffModel.db.findOne('SELECT id FROM positions WHERE id = ? AND is_active = 1', [positionIdValue]);
        if (!posRow) {
          req.flash('error', 'Chức vụ không hợp lệ');
          req.flash('formData', req.body);
          return res.redirect('/staff/create');
        }
        posId = positionIdValue;
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
      const normalizeList = (input) => {
        if (!input) return [];
        const raw = Array.isArray(input) ? input : [input];
        const results = [];
        raw.forEach((entry) => {
          if (!entry) {
            return;
          }
          const segments = String(entry)
            .split(/[\n,;]+/)
            .map((segment) => segment.trim())
            .filter(Boolean);
          segments.forEach((segment) => {
            if (results.length < 5) {
              results.push(segment);
            }
          });
        });
        return results.slice(0, 5);
      };

      const languageList = normalizeList(language_skills);
      const itSkillList = normalizeList(it_skills);

      const allowedStatus = new Set(['active', 'on_leave', 'inactive', 'terminated']);
      const normalizedStatus = allowedStatus.has(status) ? status : 'active';
      const allowedGender = new Set(['M', 'F', 'O']);
      const normalizedGender = allowedGender.has(gender) ? gender : null;

      const staffData = {
        user_id: userResult.id,
        staff_code: staff_code.trim(),
        department_id: departmentIdValue,
        position_id: posId,
        employment_type: normalizedEmployment,
        hire_date,
        birth_date: birth_date || null,
        t04_start_date: t04_start_date || null,
        faculty_start_date: faculty_start_date || null,
        gender: normalizedGender,
        id_number: id_number?.trim() || null,
        address: address?.trim() || null,
        salary: toNumberOrZero(salary),
        academic_rank: academic_rank?.trim() || null,
        academic_degree: academic_degree?.trim() || null,
        years_experience: toExperience(years_experience),
        language_skills: languageList.length ? JSON.stringify(languageList) : null,
        it_skills: itSkillList.length ? JSON.stringify(itSkillList) : null,
        party_card_number: party_card_number?.trim() || null,
        service_number: service_number?.trim() || null,
        party_join_date: party_join_date || null,
        status: normalizedStatus,
        notes: notes?.trim() || null
      };

      try {
        const staffInsert = await this.staffModel.create(staffData);
        const newStaffId = staffInsert?.insertId;

        const uploadedFiles = Array.isArray(req.files) ? req.files : [];
        if (newStaffId && uploadedFiles.length) {
          const documentPayload = this.buildDocumentPayload(uploadedFiles);
          await this.staffModel.addDocuments(newStaffId, documentPayload);
        }
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

  async profile(req, res) {
    const staffId = Number.parseInt(req.params.id, 10);
    if (!Number.isFinite(staffId) || staffId <= 0) {
      req.flash('error', 'ID cán bộ không hợp lệ');
      return res.redirect('/staff');
    }

    try {
      const staffRecord = await this.staffModel.findWithDetails(staffId);
      if (!staffRecord) {
        req.flash('error', 'Không tìm thấy thông tin cán bộ');
        return res.redirect('/staff');
      }

      const normalized = this.formatStaffRecord(staffRecord);
      const [documents, departmentOptions, positionOptions] = await Promise.all([
        this.staffModel.getDocuments(staffId),
        this.staffModel.getDepartmentOptions(),
        this.staffModel.getPositionOptions()
      ]);
      const documentList = this.prepareDocumentList(documents);

      const formatDate = (value) => {
        if (!value) return null;
        try {
          const dt = new Date(value);
          if (!Number.isNaN(dt.getTime())) {
            return dt.toLocaleDateString('vi-VN');
          }
          return typeof value === 'string' ? value : null;
        } catch (error) {
          return typeof value === 'string' ? value : null;
        }
      };

      const formatDateInput = (value) => {
        if (!value) return '';
        const dateValue = value instanceof Date ? value : new Date(value);
        if (Number.isNaN(dateValue.getTime())) {
          return '';
        }
        return dateValue.toISOString().slice(0, 10);
      };

      const baseFormData = {
        staff_code: (staffRecord.staff_code || normalized.staffCode || '').trim(),
        full_name: (staffRecord.full_name || staffRecord.name || normalized.name || '').trim(),
        email: staffRecord.email || '',
        phone: staffRecord.phone || '',
        department_id: staffRecord.department_id ? String(staffRecord.department_id) : '',
        position_id: staffRecord.position_id ? String(staffRecord.position_id) : '',
        employment_type: staffRecord.employment_type || normalized.employmentType || 'full_time',
        status: normalized.status || staffRecord.status || 'active',
        hire_date: formatDateInput(staffRecord.hire_date),
        t04_start_date: formatDateInput(staffRecord.t04_start_date),
        faculty_start_date: formatDateInput(staffRecord.faculty_start_date),
        birth_date: formatDateInput(staffRecord.birth_date),
        gender: staffRecord.gender || '',
        salary: staffRecord.salary !== null && staffRecord.salary !== undefined
          ? String(Number(staffRecord.salary))
          : '',
        academic_rank: staffRecord.academic_rank || '',
        academic_degree: staffRecord.academic_degree || '',
        years_experience: Number.isFinite(Number(staffRecord.years_experience))
          ? String(staffRecord.years_experience)
          : '',
        language_skills: Array.isArray(normalized.languages) && normalized.languages.length
          ? normalized.languages.join(', ')
          : '',
        it_skills: Array.isArray(normalized.itSkills) && normalized.itSkills.length
          ? normalized.itSkills.join(', ')
          : '',
        address: staffRecord.address || '',
        notes: staffRecord.notes || '',
        party_card_number: staffRecord.party_card_number || '',
        service_number: staffRecord.service_number || '',
        party_join_date: formatDateInput(staffRecord.party_join_date)
      };

      const [flashedFormData] = req.flash('formData');
      const [flashedErrors] = req.flash('errors');
      const showEditFormFlash = req.flash('showEditForm');

      const validationErrors = flashedErrors || {};
      const formData = flashedFormData
        ? { ...baseFormData, ...flashedFormData }
        : baseFormData;
      const shouldShowEditForm = Boolean(showEditFormFlash && showEditFormFlash.length
        ? showEditFormFlash.some((value) => value === true || value === 'true')
        : Object.keys(validationErrors).length > 0);

      return res.render('staff/profile', {
        title: `Hồ sơ nhân sự - ${normalized.name}`,
        user: req.session.user,
        staff: normalized,
        staffRaw: staffRecord,
        documents: documentList,
        helpers: { formatDate, formatDateInput },
        departmentOptions,
        positionOptions,
        employmentOptions: EMPLOYMENT_FORM_OPTIONS,
        statusOptions: STATUS_OPTIONS,
        genderOptions: GENDER_OPTIONS,
        formData,
        validationErrors,
        showEditForm: shouldShowEditForm
      });
    } catch (error) {
      console.error('StaffController.profile error:', error);
      req.flash('error', 'Không thể tải hồ sơ cán bộ. Vui lòng thử lại.');
      return res.redirect('/staff');
    }
  }

  async updateProfile(req, res) {
    const staffId = Number.parseInt(req.params.id, 10);
    if (!Number.isFinite(staffId) || staffId <= 0) {
      req.flash('error', 'ID cán bộ không hợp lệ');
      return res.redirect('/staff');
    }

    const toIntOrNull = (value) => {
      if (value === null || value === undefined || value === '') {
        return null;
      }
      const parsed = Number.parseInt(value, 10);
      return Number.isNaN(parsed) ? null : parsed;
    };

    const toPositiveNumberOrZero = (value) => {
      if (value === null || value === undefined || value === '') {
        return 0;
      }
      const normalized = typeof value === 'string' ? value.replace(/,/g, '').trim() : value;
      const parsed = Number.parseFloat(normalized);
      return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
    };

    const toExperience = (value) => {
      const parsed = Number.parseInt(value, 10);
      if (!Number.isFinite(parsed) || parsed < 0) {
        return 0;
      }
      return Math.min(parsed, 60);
    };

    const normalizeList = (input) => {
      if (!input) return [];
      const raw = Array.isArray(input) ? input : [input];
      const results = [];
      raw.forEach((entry) => {
        if (!entry) {
          return;
        }
        const segments = String(entry)
          .split(/[\n,;]+/)
          .map((segment) => segment.trim())
          .filter(Boolean);
        segments.forEach((segment) => {
          if (results.length < 10) {
            results.push(segment);
          }
        });
      });
      return results.slice(0, 10);
    };

    const ensureDateValue = (value) => {
      if (!value) return null;
      const dt = new Date(value);
      return Number.isNaN(dt.getTime()) ? null : value;
    };

    try {
      const staffRecord = await this.staffModel.findWithDetails(staffId);
      if (!staffRecord) {
        req.flash('error', 'Không tìm thấy thông tin cán bộ');
        return res.redirect('/staff');
      }

      const {
        staff_code,
        full_name,
        email,
        phone,
        department_id,
        position_id,
        employment_type,
        status,
        hire_date,
        t04_start_date,
        faculty_start_date,
        birth_date,
        gender,
        salary,
        academic_rank,
        academic_degree,
        years_experience,
        language_skills,
        it_skills,
        address,
        notes,
        party_card_number,
        service_number,
        party_join_date
      } = req.body;

      const errors = {};

      const normalizedName = (full_name || '').trim();
      const normalizedStaffCode = (staff_code || '').trim();
      const normalizedEmail = (email || '').trim();
      const normalizedPhone = (phone || '').trim();
      const normalizedHireDate = (hire_date || '').trim();
      const normalizedEmploymentInput = typeof employment_type === 'string' ? employment_type.trim() : employment_type;
      const employmentIsValid = Boolean(normalizedEmploymentInput && EMPLOYMENT_FORM_OPTIONS.some((opt) => opt.value === normalizedEmploymentInput));
      const normalizedEmployment = employmentIsValid
        ? normalizedEmploymentInput
        : (staffRecord.employment_type || 'full_time');
      const normalizedStatusInput = typeof status === 'string' ? status.trim().toLowerCase() : status;
      const statusIsValid = Boolean(normalizedStatusInput && STATUS_META[normalizedStatusInput]);
      const normalizedStatus = statusIsValid
        ? normalizedStatusInput
        : (staffRecord.status || 'active');
      const normalizedGenderInput = typeof gender === 'string' ? gender.trim().toUpperCase() : gender;
      const normalizedGender = normalizedGenderInput && ['M', 'F', 'O'].includes(normalizedGenderInput)
        ? normalizedGenderInput
        : null;

      const departmentIdValue = toIntOrNull(department_id);
      const positionIdValue = toIntOrNull(position_id);

      if (!normalizedName || normalizedName.length < 3) {
        errors.full_name = 'Họ tên phải có ít nhất 3 ký tự';
      }

      if (!normalizedStaffCode || normalizedStaffCode.length < 3) {
        errors.staff_code = 'Mã cán bộ phải có ít nhất 3 ký tự';
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!normalizedEmail || !emailRegex.test(normalizedEmail)) {
        errors.email = 'Email không hợp lệ';
      }

      if (!departmentIdValue) {
        errors.department_id = 'Vui lòng chọn phòng/bộ môn';
      }

      if (!normalizedHireDate) {
        errors.hire_date = 'Vui lòng nhập ngày vào ngành';
      } else if (Number.isNaN(new Date(normalizedHireDate).getTime())) {
        errors.hire_date = 'Ngày vào ngành không hợp lệ';
      }

      if (!employmentIsValid) {
        errors.employment_type = 'Loại hình công tác không hợp lệ';
      }

      const t04Value = ensureDateValue((t04_start_date || '').trim());
      if (t04_start_date && !t04Value) {
        errors.t04_start_date = 'Ngày công tác T04 không hợp lệ';
      }

      const facultyValue = ensureDateValue((faculty_start_date || '').trim());
      if (faculty_start_date && !facultyValue) {
        errors.faculty_start_date = 'Ngày công tác tại khoa không hợp lệ';
      }

      const birthValue = ensureDateValue((birth_date || '').trim());
      if (birth_date && !birthValue) {
        errors.birth_date = 'Ngày sinh không hợp lệ';
      }

      const partyJoinValue = ensureDateValue((party_join_date || '').trim());
      if (party_join_date && !partyJoinValue) {
        errors.party_join_date = 'Ngày vào Đảng không hợp lệ';
      }

      if (!statusIsValid) {
        errors.status = 'Trạng thái không hợp lệ';
      }

      if (Object.keys(errors).length) {
        req.flash('errors', errors);
        req.flash('formData', req.body);
        req.flash('showEditForm', true);
        return res.redirect(`/staff/${staffId}/profile`);
      }

      if (normalizedStaffCode !== staffRecord.staff_code) {
        const duplicateStaffCode = await this.staffModel.isStaffCodeExists(normalizedStaffCode, staffId);
        if (duplicateStaffCode) {
          errors.staff_code = 'Mã cán bộ đã tồn tại trong hệ thống';
        }
        const duplicateUsername = await this.staffModel.db.findOne(
          'SELECT id FROM users WHERE username = ? AND id != ? LIMIT 1',
          [normalizedStaffCode, staffRecord.user_id]
        );
        if (duplicateUsername) {
          errors.staff_code = 'Tên đăng nhập (mã cán bộ) đã được sử dụng';
        }
      }

      if (normalizedEmail.toLowerCase() !== String(staffRecord.email || '').toLowerCase()) {
        const duplicateEmail = await this.staffModel.db.findOne(
          'SELECT id FROM users WHERE email = ? AND id != ? LIMIT 1',
          [normalizedEmail, staffRecord.user_id]
        );
        if (duplicateEmail) {
          errors.email = 'Email đã được sử dụng bởi tài khoản khác';
        }
      }

      if (Object.keys(errors).length) {
        req.flash('errors', errors);
        req.flash('formData', req.body);
        req.flash('showEditForm', true);
        return res.redirect(`/staff/${staffId}/profile`);
      }

      const deptRow = await this.staffModel.db.findOne('SELECT id FROM departments WHERE id = ? AND is_active = 1', [departmentIdValue]);
      if (!deptRow) {
        req.flash('errors', { department_id: 'Phòng/Bộ môn không hợp lệ hoặc đã ngừng hoạt động' });
        req.flash('formData', req.body);
        req.flash('showEditForm', true);
        return res.redirect(`/staff/${staffId}/profile`);
      }

      let validatedPositionId = null;
      if (positionIdValue) {
        const posRow = await this.staffModel.db.findOne('SELECT id FROM positions WHERE id = ? AND is_active = 1', [positionIdValue]);
        if (!posRow) {
          req.flash('errors', { position_id: 'Chức vụ không hợp lệ' });
          req.flash('formData', req.body);
          req.flash('showEditForm', true);
          return res.redirect(`/staff/${staffId}/profile`);
        }
        validatedPositionId = positionIdValue;
      }

      const languageList = normalizeList(language_skills);
      const itSkillList = normalizeList(it_skills);
      const numericSalary = toPositiveNumberOrZero(salary);
      const normalizedExperience = toExperience(years_experience);

      const staffPayload = {
        staff_code: normalizedStaffCode,
        department_id: departmentIdValue,
        position_id: validatedPositionId,
        employment_type: normalizedEmployment,
        status: normalizedStatus,
        hire_date: normalizedHireDate,
        t04_start_date: t04Value,
        faculty_start_date: facultyValue,
        birth_date: birthValue,
        gender: normalizedGender,
        salary: numericSalary,
        academic_rank: academic_rank ? academic_rank.trim() : null,
        academic_degree: academic_degree ? academic_degree.trim() : null,
        years_experience: normalizedExperience,
        language_skills: languageList.length ? JSON.stringify(languageList) : null,
        it_skills: itSkillList.length ? JSON.stringify(itSkillList) : null,
        address: address ? address.trim() : null,
        notes: notes ? notes.trim() : null,
        party_card_number: party_card_number ? party_card_number.trim() : null,
        service_number: service_number ? service_number.trim() : null,
        party_join_date: partyJoinValue
      };

      await this.staffModel.update(staffId, staffPayload);
      await this.staffModel.db.update(
        'UPDATE users SET username = ?, email = ?, full_name = ?, phone = ? WHERE id = ?',
        [
          normalizedStaffCode,
          normalizedEmail,
          normalizedName,
          normalizedPhone || null,
          staffRecord.user_id
        ]
      );

      req.flash('success', 'Đã cập nhật hồ sơ cán bộ');
      return res.redirect(`/staff/${staffId}/profile`);
    } catch (error) {
      console.error('StaffController.updateProfile error:', error);
      req.flash('error', 'Không thể cập nhật hồ sơ cán bộ. Vui lòng thử lại.');
      req.flash('formData', req.body);
      req.flash('showEditForm', true);
      return res.redirect(`/staff/${staffId}/profile`);
    }
  }

  async uploadProfileFiles(req, res) {
    const staffId = Number.parseInt(req.params.id, 10);
    if (!Number.isFinite(staffId) || staffId <= 0) {
      req.flash('error', 'Không xác định được cán bộ cần cập nhật hồ sơ');
      return res.redirect('/staff');
    }

    try {
      const staffRecord = await this.staffModel.findById(staffId);
      if (!staffRecord) {
        req.flash('error', 'Không tìm thấy cán bộ trong hệ thống');
        return res.redirect('/staff');
      }

      const uploadedFiles = Array.isArray(req.files) ? req.files : [];
      if (!uploadedFiles.length) {
        req.flash('error', 'Vui lòng chọn ít nhất một file hồ sơ để tải lên');
        return res.redirect(`/staff/${staffId}/profile`);
      }

      const payload = this.buildDocumentPayload(uploadedFiles);
      await this.staffModel.addDocuments(staffId, payload);
      req.flash('success', `Đã tải lên ${payload.length} tài liệu hồ sơ cá nhân`);
      return res.redirect(`/staff/${staffId}/profile`);
    } catch (error) {
      console.error('StaffController.uploadProfileFiles error:', error);
      req.flash('error', 'Không thể cập nhật hồ sơ cá nhân. Vui lòng thử lại.');
      return res.redirect(`/staff/${staffId}/profile`);
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

      const normalizedName = typeof name === 'string' ? name.trim() : '';
      const normalizedCode = typeof code === 'string' ? code.trim().toUpperCase() : '';
      const normalizedCategory = typeof category === 'string' ? category.trim() : '';
      const normalizedMeasurement = typeof measurement_type === 'string' ? measurement_type.trim() : '';
      const normalizedUnit = typeof unit === 'string' ? unit.trim() : '';
      const normalizedDescription = typeof description === 'string' ? description.trim() : '';

      const errors = {};
      if (!normalizedName || normalizedName.length < 3) {
        errors.name = 'Tên tiêu chí tối thiểu 3 ký tự';
      }

      if (!normalizedCode || normalizedCode.length < 3) {
        errors.code = 'Mã tiêu chí tối thiểu 3 ký tự';
      }

      if (!normalizedCategory || !CRITERIA_CATEGORIES.has(normalizedCategory)) {
        errors.category = 'Nhóm tiêu chí không hợp lệ';
      }

      if (!normalizedMeasurement || !MEASUREMENT_TYPES.has(normalizedMeasurement)) {
        errors.measurement_type = 'Loại đo lường không hợp lệ';
      }

      const parsedWeight = parseDecimalField(weight, 0);
      if (!parsedWeight.ok) {
        errors.weight = 'Trọng số phải là số hợp lệ';
      }

      const numericWeight = parsedWeight.ok ? parsedWeight.value : 0;
      if (parsedWeight.ok && (numericWeight < 0 || numericWeight > 100)) {
        errors.weight = 'Trọng số phải nằm trong khoảng 0-100';
      }

      if (!errors.code) {
        const duplicate = await this.evaluationCriteriaModel.db.findOne(
          'SELECT id FROM evaluation_criteria WHERE code = ? LIMIT 1',
          [normalizedCode]
        );
        if (duplicate) {
          errors.code = 'Mã tiêu chí đã tồn tại';
        }
      }

      if (Object.keys(errors).length) {
        const firstErrorMessage = Object.values(errors)[0] || 'Dữ liệu không hợp lệ';
        return res.status(422).json({ ok: false, message: firstErrorMessage, errors });
      }

      const normalizedWeight = Math.round(numericWeight * 100) / 100;
      const data = {
        name: normalizedName,
        code: normalizedCode,
        description: normalizedDescription || null,
        category: normalizedCategory,
        measurement_type: normalizedMeasurement,
        unit: normalizedUnit || null,
        weight: normalizedWeight,
        is_required: normalizeBooleanFlag(is_required, 0),
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

  async updateCriteria(req, res) {
    try {
      const rawId = req.params.id;
      const criteriaId = Number.parseInt(rawId, 10);
      if (!Number.isFinite(criteriaId) || criteriaId <= 0) {
        return res.status(400).json({ ok: false, message: 'ID tiêu chí không hợp lệ' });
      }

      const existing = await this.evaluationCriteriaModel.findById(criteriaId);
      if (!existing) {
        return res.status(404).json({ ok: false, message: 'Không tìm thấy tiêu chí' });
      }

      const { name, code, description, category, measurement_type, unit, weight, is_required } = req.body;

      const normalizedName = typeof name === 'string' ? name.trim() : (existing.name || '');
      const normalizedCode = typeof code === 'string' ? code.trim().toUpperCase() : (existing.code || '');
      const normalizedCategory = typeof category === 'string' ? category.trim() : (existing.category || '');
      const normalizedMeasurement = typeof measurement_type === 'string' ? measurement_type.trim() : (existing.measurement_type || '');
      const normalizedUnit = typeof unit === 'string' ? unit.trim() : (existing.unit || '');
      const normalizedDescription = typeof description === 'string' ? description.trim() : (existing.description || '');

      const errors = {};
      if (!normalizedName || normalizedName.length < 3) {
        errors.name = 'Tên tiêu chí tối thiểu 3 ký tự';
      }

      if (!normalizedCode || normalizedCode.length < 3) {
        errors.code = 'Mã tiêu chí tối thiểu 3 ký tự';
      }

      if (!normalizedCategory || !CRITERIA_CATEGORIES.has(normalizedCategory)) {
        errors.category = 'Nhóm tiêu chí không hợp lệ';
      }

      if (!normalizedMeasurement || !MEASUREMENT_TYPES.has(normalizedMeasurement)) {
        errors.measurement_type = 'Loại đo lường không hợp lệ';
      }

      const parsedWeight = parseDecimalField(weight, existing.weight ?? 0);
      if (!parsedWeight.ok) {
        errors.weight = 'Trọng số phải là số hợp lệ';
      }

      const numericWeight = parsedWeight.ok ? parsedWeight.value : Number(existing.weight || 0);
      if (parsedWeight.ok && (numericWeight < 0 || numericWeight > 100)) {
        errors.weight = 'Trọng số phải nằm trong khoảng 0-100';
      }

      if (!errors.code && normalizedCode !== (existing.code || '').toUpperCase()) {
        const duplicate = await this.evaluationCriteriaModel.db.findOne(
          'SELECT id FROM evaluation_criteria WHERE code = ? AND id != ? LIMIT 1',
          [normalizedCode, criteriaId]
        );
        if (duplicate) {
          errors.code = 'Mã tiêu chí đã tồn tại';
        }
      }

      if (Object.keys(errors).length) {
        const firstErrorMessage = Object.values(errors)[0] || 'Dữ liệu không hợp lệ';
        return res.status(422).json({ ok: false, message: firstErrorMessage, errors });
      }

      const normalizedWeight = Math.round(numericWeight * 100) / 100;
      const normalizedRequired = normalizeBooleanFlag(is_required, existing.is_required ? 1 : 0);

      const data = {
        name: normalizedName,
        code: normalizedCode,
        description: normalizedDescription || null,
        category: normalizedCategory,
        measurement_type: normalizedMeasurement,
        unit: normalizedUnit || null,
        weight: normalizedWeight,
        is_required: normalizedRequired,
        is_active: existing.is_active ?? 1
      };

      await this.evaluationCriteriaModel.updateCriteria(criteriaId, data);

      try {
        const activePeriod = await this.evaluationPeriodModel.getActivePeriod();
        if (activePeriod && activePeriod.id) {
          await this.evaluationPeriodModel.addCriteriaToPeriod(activePeriod.id, criteriaId, {
            weight: normalizedWeight,
            is_required: Boolean(normalizedRequired)
          });
        }
      } catch (attachError) {
        console.warn('StaffController.updateCriteria: unable to sync period weight:', attachError.message);
      }

      return res.json({ ok: true, data: { id: criteriaId, ...data } });
    } catch (error) {
      console.error('StaffController.updateCriteria error:', error);
      const conflict = error?.code === 'ER_DUP_ENTRY';
      return res.status(conflict ? 409 : 500).json({ ok: false, message: conflict ? 'Mã tiêu chí đã tồn tại' : 'Không thể cập nhật tiêu chí' });
    }
  }

  async deleteCriteria(req, res) {
    try {
      const rawId = req.params.id;
      const criteriaId = Number.parseInt(rawId, 10);
      if (!Number.isFinite(criteriaId) || criteriaId <= 0) {
        return res.status(400).json({ ok: false, message: 'ID tiêu chí không hợp lệ' });
      }

      const existing = await this.evaluationCriteriaModel.findById(criteriaId);
      if (!existing) {
        return res.status(404).json({ ok: false, message: 'Không tìm thấy tiêu chí' });
      }

      await this.evaluationCriteriaModel.deleteCriteria(criteriaId);
      return res.json({ ok: true });
    } catch (error) {
      console.error('StaffController.deleteCriteria error:', error);
      return res.status(500).json({ ok: false, message: 'Không thể xóa tiêu chí' });
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
