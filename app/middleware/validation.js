const { body, validationResult } = require('express-validator');
const CONSTANTS = require('../../config/constants');

// Helper function để format validation errors
function formatValidationErrors(errors) {
    return errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
    }));
}

// Middleware kiểm tra validation result
function checkValidationResult(req, res, next) {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        const formattedErrors = formatValidationErrors(errors);
        
        const acceptsJson = req.xhr || (typeof req.headers.accept === 'string' && req.headers.accept.indexOf('json') > -1);
        if (acceptsJson) {
            return res.status(400).json({
                success: false,
                message: CONSTANTS.MESSAGES.ERROR.VALIDATION_FAILED,
                errors: formattedErrors
            });
        }
        
        // Lưu errors vào flash và redirect về form
        req.flash('error', formattedErrors[0].message);
        req.flash('formData', req.body);
        return res.redirect('back');
    }
    
    next();
}

// Validation rules cho User
const userValidationRules = {
    create: [
        body('username')
            .isLength({ min: CONSTANTS.VALIDATION.USERNAME_MIN_LENGTH })
            .withMessage(`Tên đăng nhập phải có ít nhất ${CONSTANTS.VALIDATION.USERNAME_MIN_LENGTH} ký tự`)
            .matches(/^[a-zA-Z0-9_]+$/)
            .withMessage('Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới'),
        
        body('email')
            .isEmail()
            .withMessage('Email không hợp lệ')
            .normalizeEmail(),
        
        body('password')
            .isLength({ min: CONSTANTS.VALIDATION.PASSWORD_MIN_LENGTH })
            .withMessage(`Mật khẩu phải có ít nhất ${CONSTANTS.VALIDATION.PASSWORD_MIN_LENGTH} ký tự`),
        
        body('confirm_password')
            .custom((value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error('Mật khẩu xác nhận không khớp');
                }
                return value;
            }),
        
        body('full_name')
            .isLength({ min: 2 })
            .withMessage('Họ tên phải có ít nhất 2 ký tự')
            .trim(),
        
        body('phone')
            .optional()
            .matches(CONSTANTS.VALIDATION.PHONE_PATTERN)
            .withMessage('Số điện thoại không hợp lệ'),
        
        body('role_id')
            .isInt({ min: 1 })
            .withMessage('Vai trò không hợp lệ')
    ],
    
    update: [
        body('email')
            .isEmail()
            .withMessage('Email không hợp lệ')
            .normalizeEmail(),
        
        body('full_name')
            .isLength({ min: 2 })
            .withMessage('Họ tên phải có ít nhất 2 ký tự')
            .trim(),
        
        body('phone')
            .optional()
            .matches(CONSTANTS.VALIDATION.PHONE_PATTERN)
            .withMessage('Số điện thoại không hợp lệ'),
        
        body('role_id')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Vai trò không hợp lệ')
    ],
    
    changePassword: [
        body('current_password')
            .notEmpty()
            .withMessage('Vui lòng nhập mật khẩu hiện tại'),
        
        body('new_password')
            .isLength({ min: CONSTANTS.VALIDATION.PASSWORD_MIN_LENGTH })
            .withMessage(`Mật khẩu mới phải có ít nhất ${CONSTANTS.VALIDATION.PASSWORD_MIN_LENGTH} ký tự`),
        
        body('confirm_password')
            .custom((value, { req }) => {
                if (value !== req.body.new_password) {
                    throw new Error('Mật khẩu xác nhận không khớp');
                }
                return value;
            })
    ]
};

// Validation rules cho Document
const documentValidationRules = {
    create: [
        body('document_number')
            .notEmpty()
            .withMessage('Số văn bản không được để trống')
            .trim(),
        
        body('title')
            .isLength({ min: 5 })
            .withMessage('Tiêu đề phải có ít nhất 5 ký tự')
            .trim(),
        
        body('direction')
            .isIn(['incoming', 'outgoing'])
            .withMessage('Chiều văn bản không hợp lệ'),
        
        body('issue_date')
            .isISO8601()
            .withMessage('Ngày ban hành không hợp lệ'),
        
        body('priority')
            .isIn(['low', 'medium', 'high', 'urgent'])
            .withMessage('Độ ưu tiên không hợp lệ'),
        
        body('processing_deadline')
            .optional()
            .isISO8601()
            .withMessage('Hạn xử lý không hợp lệ')
            .custom((value, { req }) => {
                if (value && new Date(value) <= new Date(req.body.issue_date)) {
                    throw new Error('Hạn xử lý phải sau ngày ban hành');
                }
                return value;
            })
    ],
    
    update: [
        body('title')
            .isLength({ min: 5 })
            .withMessage('Tiêu đề phải có ít nhất 5 ký tự')
            .trim(),
        
        body('priority')
            .optional()
            .isIn(['low', 'medium', 'high', 'urgent'])
            .withMessage('Độ ưu tiên không hợp lệ'),
        
        body('status')
            .optional()
            .isIn(['draft', 'pending', 'processing', 'completed', 'archived'])
            .withMessage('Trạng thái không hợp lệ')
    ]
};

// Validation rules cho Staff
const staffValidationRules = {
    create: [
        body('staff_code')
            .notEmpty()
            .withMessage('Mã cán bộ không được để trống')
            .trim(),
        
        body('hire_date')
            .isISO8601()
            .withMessage('Ngày tuyển dụng không hợp lệ')
            .custom((value) => {
                if (new Date(value) > new Date()) {
                    throw new Error('Ngày tuyển dụng không thể trong tương lai');
                }
                return value;
            }),
        
        body('employment_type')
            .isIn(['full_time', 'part_time', 'contract', 'temporary'])
            .withMessage('Loại hợp đồng không hợp lệ'),
        
        body('salary')
            .optional()
            .isFloat({ min: 0 })
            .withMessage('Lương phải là số dương'),
        
        body('years_experience')
            .optional()
            .isInt({ min: 0, max: 50 })
            .withMessage('Số năm kinh nghiệm không hợp lệ')
    ]
};

// Validation rules cho Asset
const assetValidationRules = {
    create: [
        body('asset_code')
            .notEmpty()
            .withMessage('Mã tài sản không được để trống')
            .trim(),
        
        body('name')
            .isLength({ min: 2 })
            .withMessage('Tên tài sản phải có ít nhất 2 ký tự')
            .trim(),
        
        body('purchase_price')
            .optional()
            .isFloat({ min: 0 })
            .withMessage('Giá mua phải là số dương'),
        
        body('purchase_date')
            .optional()
            .isISO8601()
            .withMessage('Ngày mua không hợp lệ'),
        
        body('status')
            .optional()
            .isIn(['available', 'in_use', 'maintenance', 'retired', 'disposed'])
            .withMessage('Trạng thái tài sản không hợp lệ')
    ]
};

// Validation rules cho Project
const projectValidationRules = {
    create: [
        body('project_code')
            .notEmpty()
            .withMessage('Mã dự án không được để trống')
            .trim(),
        
        body('title')
            .isLength({ min: 5 })
            .withMessage('Tiêu đề dự án phải có ít nhất 5 ký tự')
            .trim(),
        
        body('start_date')
            .isISO8601()
            .withMessage('Ngày bắt đầu không hợp lệ'),
        
        body('end_date')
            .isISO8601()
            .withMessage('Ngày kết thúc không hợp lệ')
            .custom((value, { req }) => {
                if (new Date(value) <= new Date(req.body.start_date)) {
                    throw new Error('Ngày kết thúc phải sau ngày bắt đầu');
                }
                return value;
            }),
        
        body('budget')
            .optional()
            .isFloat({ min: 0 })
            .withMessage('Ngân sách phải là số dương')
    ]
};

// Validation rules cho login
const loginValidationRules = [
    body('username')
        .notEmpty()
        .withMessage('Tên đăng nhập không được để trống'),
    
    body('password')
        .notEmpty()
        .withMessage('Mật khẩu không được để trống')
];

module.exports = {
    checkValidationResult,
    userValidationRules,
    documentValidationRules,
    staffValidationRules,
    assetValidationRules,
    projectValidationRules,
    loginValidationRules
};