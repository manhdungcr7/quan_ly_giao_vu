// Application constants
const CONSTANTS = {
    // User roles
    ROLES: {
        ADMIN: 'admin',
        STAFF: 'staff',
        LECTURER: 'lecturer',
        VIEWER: 'viewer'
    },

    // Document status
    DOCUMENT_STATUS: {
        DRAFT: 'draft',
        PENDING: 'pending',
        PROCESSING: 'processing',
        COMPLETED: 'completed',
        ARCHIVED: 'archived'
    },

    // Document direction
    DOCUMENT_DIRECTION: {
        INCOMING: 'incoming',
        OUTGOING: 'outgoing'
    },

    // Priority levels
    PRIORITY: {
        LOW: 'low',
        MEDIUM: 'medium',
        HIGH: 'high',
        URGENT: 'urgent'
    },

    // Asset status
    ASSET_STATUS: {
        AVAILABLE: 'available',
        IN_USE: 'in_use',
        MAINTENANCE: 'maintenance',
        RETIRED: 'retired',
        DISPOSED: 'disposed'
    },

    // Asset condition
    ASSET_CONDITION: {
        EXCELLENT: 'excellent',
        GOOD: 'good',
        FAIR: 'fair',
        POOR: 'poor',
        BROKEN: 'broken'
    },

    // Project status
    PROJECT_STATUS: {
        PLANNING: 'planning',
        ACTIVE: 'active',
        COMPLETED: 'completed',
        PAUSED: 'paused',
        CANCELLED: 'cancelled'
    },

    // Employment types
    EMPLOYMENT_TYPE: {
        FULL_TIME: 'full_time',
        PART_TIME: 'part_time',
        CONTRACT: 'contract',
        TEMPORARY: 'temporary'
    },

    // Staff status
    STAFF_STATUS: {
        ACTIVE: 'active',
        INACTIVE: 'inactive',
        ON_LEAVE: 'on_leave',
        TERMINATED: 'terminated'
    },

    // Gender
    GENDER: {
        MALE: 'M',
        FEMALE: 'F',
        OTHER: 'O'
    },

    // Schedule status
    SCHEDULE_STATUS: {
        SCHEDULED: 'scheduled',
        ONGOING: 'ongoing',
        COMPLETED: 'completed',
        CANCELLED: 'cancelled'
    },

    // Reminder status
    REMINDER_STATUS: {
        PENDING: 'pending',
        COMPLETED: 'completed',
        CANCELLED: 'cancelled',
        OVERDUE: 'overdue'
    },

    // Report status
    REPORT_STATUS: {
        DRAFT: 'draft',
        SUBMITTED: 'submitted',
        REVIEWED: 'reviewed',
        APPROVED: 'approved',
        PUBLISHED: 'published'
    },

    // Exam types
    EXAM_TYPE: {
        MIDTERM: 'midterm',
        FINAL: 'final',
        MAKEUP: 'makeup',
        SPECIAL: 'special'
    },

    // Days of week
    DAYS_OF_WEEK: {
        1: 'Thứ 2',
        2: 'Thứ 3',
        3: 'Thứ 4',
        4: 'Thứ 5',
        5: 'Thứ 6',
        6: 'Thứ 7',
        0: 'Chủ nhật'
    },

    // Messages
    MESSAGES: {
        SUCCESS: {
            CREATED: 'Tạo mới thành công',
            UPDATED: 'Cập nhật thành công',
            DELETED: 'Xóa thành công',
            LOGIN: 'Đăng nhập thành công',
            LOGOUT: 'Đăng xuất thành công'
        },
        ERROR: {
            NOT_FOUND: 'Không tìm thấy dữ liệu',
            UNAUTHORIZED: 'Không có quyền truy cập',
            INVALID_CREDENTIALS: 'Thông tin đăng nhập không chính xác',
            VALIDATION_FAILED: 'Dữ liệu không hợp lệ',
            SERVER_ERROR: 'Lỗi máy chủ',
            FILE_TOO_LARGE: 'File quá lớn',
            INVALID_FILE_TYPE: 'Loại file không được hỗ trợ'
        }
    },

    // Validation rules
    VALIDATION: {
        PASSWORD_MIN_LENGTH: 6,
        USERNAME_MIN_LENGTH: 3,
        PHONE_PATTERN: /^[0-9]{10,11}$/,
        EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },

    // File extensions
    ALLOWED_FILE_EXTENSIONS: {
        IMAGES: ['.jpg', '.jpeg', '.png', '.gif'],
        DOCUMENTS: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt'],
        ARCHIVES: ['.zip', '.rar', '.7z']
    },

    // Date formats
    DATE_FORMATS: {
        DISPLAY: 'DD/MM/YYYY',
        DATETIME_DISPLAY: 'DD/MM/YYYY HH:mm',
        DATABASE: 'YYYY-MM-DD',
        DATETIME_DATABASE: 'YYYY-MM-DD HH:mm:ss'
    }
};

module.exports = CONSTANTS;