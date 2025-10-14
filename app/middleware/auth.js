const CONSTANTS = require('../../config/constants');

// Middleware kiểm tra authentication
function requireAuth(req, res, next) {
    if (!req.session || !req.session.user) {
        const acceptsJson = req.xhr || (typeof req.headers.accept === 'string' && req.headers.accept.indexOf('json') > -1);
        if (acceptsJson) {
            return res.status(401).json({
                success: false,
                message: CONSTANTS.MESSAGES.ERROR.UNAUTHORIZED
            });
        }
        
        req.flash('error', 'Vui lòng đăng nhập để tiếp tục');
        return res.redirect('/auth/login');
    }
    
    next();
}

// Middleware kiểm tra quyền admin
function requireAdmin(req, res, next) {
    const sessionUser = req.session ? req.session.user : null;
    const roleValue = sessionUser && (sessionUser.role || sessionUser.role_name || sessionUser.roleName);
    const normalizedRole = roleValue ? roleValue.toString().trim().toLowerCase() : '';

    if (!sessionUser || (normalizedRole !== CONSTANTS.ROLES.ADMIN && !normalizedRole.startsWith('admin'))) {
        const acceptsJson = req.xhr || (typeof req.headers.accept === 'string' && req.headers.accept.indexOf('json') > -1);
        if (acceptsJson) {
            return res.status(403).json({
                success: false,
                message: CONSTANTS.MESSAGES.ERROR.UNAUTHORIZED
            });
        }
        
        req.flash('error', 'Không có quyền truy cập');
        return res.redirect('/dashboard');
    }
    
    next();
}

// Middleware kiểm tra quyền cụ thể
function requirePermission(permission) {
    return (req, res, next) => {
        if (!req.session || !req.session.user) {
            const acceptsJson = req.xhr || (typeof req.headers.accept === 'string' && req.headers.accept.indexOf('json') > -1);
            if (acceptsJson) {
                return res.status(401).json({
                    success: false,
                    message: CONSTANTS.MESSAGES.ERROR.UNAUTHORIZED
                });
            }
            
            req.flash('error', 'Vui lòng đăng nhập để tiếp tục');
            return res.redirect('/auth/login');
        }

        const userPermissions = req.session.user.permissions || [];
        
        // Admin có tất cả quyền
        if (req.session.user.role_name === 'admin' || userPermissions.includes('all')) {
            return next();
        }

        // Kiểm tra quyền cụ thể
        if (!userPermissions.includes(permission)) {
            const acceptsJson = req.xhr || (typeof req.headers.accept === 'string' && req.headers.accept.indexOf('json') > -1);
            if (acceptsJson) {
                return res.status(403).json({
                    success: false,
                    message: CONSTANTS.MESSAGES.ERROR.UNAUTHORIZED
                });
            }
            
            req.flash('error', 'Không có quyền thực hiện hành động này');
            return res.redirect('/dashboard');
        }

        next();
    };
}

// Middleware redirect nếu đã đăng nhập
function redirectIfAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        return res.redirect('/dashboard');
    }
    
    next();
}

// Middleware kiểm tra quyền sở hữu resource
function requireOwnership(getResourceOwnerId) {
    return async (req, res, next) => {
        try {
            // Admin bypass ownership check
            if (req.session.user.role_name === 'admin') {
                return next();
            }

            const resourceOwnerId = await getResourceOwnerId(req);
            
            if (resourceOwnerId !== req.session.user.id) {
                const acceptsJson = req.xhr || (typeof req.headers.accept === 'string' && req.headers.accept.indexOf('json') > -1);
                if (acceptsJson) {
                    return res.status(403).json({
                        success: false,
                        message: CONSTANTS.MESSAGES.ERROR.UNAUTHORIZED
                    });
                }
                
                req.flash('error', 'Không có quyền truy cập tài nguyên này');
                return res.redirect('/dashboard');
            }

            next();
        } catch (error) {
            console.error('Error in requireOwnership middleware:', error);
            
            const acceptsJson = req.xhr || (typeof req.headers.accept === 'string' && req.headers.accept.indexOf('json') > -1);
            if (acceptsJson) {
                return res.status(500).json({
                    success: false,
                    message: CONSTANTS.MESSAGES.ERROR.SERVER_ERROR
                });
            }

            req.flash('error', CONSTANTS.MESSAGES.ERROR.SERVER_ERROR);
            return res.redirect('/dashboard');
        }
    };
}

// Middleware thêm thông tin user vào res.locals để sử dụng trong views
function addUserToLocals(req, res, next) {
    const sessionUser = req.session ? req.session.user : null;
    const rawRoleName = sessionUser && (sessionUser.role || sessionUser.role_name || sessionUser.roleName);
    let normalizedRole = rawRoleName ? rawRoleName.toString().trim().toLowerCase() : '';

    // Align legacy role labels like "Administrator" with the canonical admin role
    if (normalizedRole && normalizedRole.startsWith('admin') && normalizedRole !== CONSTANTS.ROLES.ADMIN) {
        normalizedRole = CONSTANTS.ROLES.ADMIN;
    }

    if (sessionUser) {
        if (normalizedRole && sessionUser.role_name !== normalizedRole) {
            req.session.user.role_name = normalizedRole;
        }
        if (normalizedRole && sessionUser.role !== normalizedRole) {
            req.session.user.role = normalizedRole;
        }
        if (rawRoleName && !sessionUser.roleName) {
            req.session.user.roleName = rawRoleName;
        }
        if (!sessionUser.role_label && normalizedRole && CONSTANTS.USER_ROLE_LABELS) {
            req.session.user.role_label = CONSTANTS.USER_ROLE_LABELS[normalizedRole] || rawRoleName || 'Quản trị viên';
        }
    }

    res.locals.user = req.session ? req.session.user : null;
    res.locals.isAuthenticated = !!(req.session && req.session.user);
    res.locals.isAdmin = normalizedRole === CONSTANTS.ROLES.ADMIN;
    next();
}

// Middleware xử lý lỗi 404
function notFound(req, res, next) {
    res.status(404).render('error', {
        title: 'Không tìm thấy trang',
        message: 'Trang bạn tìm kiếm không tồn tại',
        status: 404
    });
}

// Middleware xử lý lỗi chung
function errorHandler(err, req, res, next) {
    console.error('Application Error:', err);

    // Validation errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Dữ liệu không hợp lệ',
            errors: err.details
        });
    }

    // Database errors
    if (err.code && err.code.startsWith('ER_')) {
        console.error('Database Error:', err);
        return res.status(500).json({
            success: false,
            message: 'Lỗi cơ sở dữ liệu'
        });
    }

    // Default error response
    const status = err.status || 500;
    const message = err.message || CONSTANTS.MESSAGES.ERROR.SERVER_ERROR;

    const acceptsJson = req.xhr || (typeof req.headers.accept === 'string' && req.headers.accept.indexOf('json') > -1);
    if (acceptsJson) {
        return res.status(status).json({
            success: false,
            message: message
        });
    }

    res.status(status).render('error', {
        title: 'Lỗi hệ thống',
        message: message,
        status: status
    });
}

module.exports = {
    requireAuth,
    requireAdmin,
    requirePermission,
    redirectIfAuthenticated,
    requireOwnership,
    addUserToLocals,
    notFound,
    errorHandler
};