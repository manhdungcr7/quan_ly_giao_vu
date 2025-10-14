const User = require('../models/User');
const Role = require('../models/Role');
const CONSTANTS = require('../../config/constants');

class UserController {
    constructor() {
        this.userModel = new User();
        this.roleModel = new Role();
    }

    // Hiển thị danh sách user
    async index(req, res) {
        try {
            const successFlash = req.flash('success') || [];
            const errorFlash = req.flash('error') || [];

            const page = parseInt(req.query.page, 10) || 1;
            const limit = parseInt(req.query.limit, 10) || 20;
            const search = req.query.search ? req.query.search.trim() : '';
            const statusFilter = req.query.status ? req.query.status.trim() : '';
            const approvalFilter = req.query.approval_status ? req.query.approval_status.trim() : '';
            const rawRoleFilter = req.query.role ? req.query.role.trim() : '';

            const roles = await this.roleModel.getActiveRoles();

            let roleIdFilter = null;
            let roleNameFilter = '';

            if (rawRoleFilter) {
                const matchedRole = roles.find(role => String(role.id) === rawRoleFilter || role.name === rawRoleFilter);
                if (matchedRole) {
                    roleIdFilter = matchedRole.id;
                } else if (!Number.isNaN(Number(rawRoleFilter))) {
                    roleIdFilter = Number(rawRoleFilter);
                } else {
                    roleNameFilter = rawRoleFilter;
                }
            }

            const filters = {
                status: ['active', 'inactive'].includes(statusFilter) ? statusFilter : '',
                approvalStatus: Object.values(CONSTANTS.USER_APPROVAL_STATUS).includes(approvalFilter) ? approvalFilter : '',
                roleId: roleIdFilter,
                roleName: roleNameFilter
            };

            const result = await this.userModel.getUsersWithRole(page, limit, search, filters);

            let pendingCount = 0;
            if (!filters.approvalStatus || filters.approvalStatus === CONSTANTS.USER_APPROVAL_STATUS.PENDING) {
                const pendingFilters = {
                    ...filters,
                    approvalStatus: CONSTANTS.USER_APPROVAL_STATUS.PENDING
                };
                pendingCount = await this.userModel.countByFilters(search, pendingFilters);
            }

            res.render('users/index', {
                title: 'Quản lý người dùng',
                user: req.session.user,
                users: result.data,
                pagination: result.pagination,
                search,
                filters: {
                    status: filters.status,
                    approval: filters.approvalStatus,
                    role: rawRoleFilter
                },
                roleOptions: roles,
                approvalStatuses: CONSTANTS.USER_APPROVAL_STATUS,
                roleLabels: CONSTANTS.USER_ROLE_LABELS,
                pendingCount,
                success: successFlash.length ? successFlash : res.locals.success,
                error: errorFlash.length ? errorFlash : res.locals.error
            });

        } catch (error) {
            console.error('Error in UserController index:', error);
            req.flash('error', CONSTANTS.MESSAGES.ERROR.SERVER_ERROR);
            res.redirect('/dashboard');
        }
    }

    // Hiển thị form tạo user mới
    async create(req, res) {
        try {
            // Kiểm tra quyền admin
            if (req.session.user.role_name !== 'admin') {
                req.flash('error', CONSTANTS.MESSAGES.ERROR.UNAUTHORIZED);
                return res.redirect('/users');
            }

            // Lấy danh sách roles
            const roles = await this.userModel.query('SELECT * FROM roles WHERE is_active = 1');

            res.render('users/create', {
                title: 'Tạo người dùng mới',
                user: req.session.user,
                roles: roles,
                error: res.locals.error,
                success: res.locals.success
            });

        } catch (error) {
            console.error('Error in UserController create:', error);
            req.flash('error', CONSTANTS.MESSAGES.ERROR.SERVER_ERROR);
            res.redirect('/users');
        }
    }

    // Xử lý tạo user mới
    async store(req, res) {
        try {
            // Kiểm tra quyền admin
            if (req.session.user.role_name !== 'admin') {
                req.flash('error', CONSTANTS.MESSAGES.ERROR.UNAUTHORIZED);
                return res.redirect('/users');
            }

            const { username, email, password, confirm_password, full_name, role_id, phone } = req.body;

            // Validate input
            if (!username || !email || !password || !confirm_password || !full_name || !role_id) {
                req.flash('error', 'Vui lòng nhập đầy đủ thông tin bắt buộc');
                return res.redirect('/users/create');
            }

            if (password !== confirm_password) {
                req.flash('error', 'Mật khẩu xác nhận không khớp');
                return res.redirect('/users/create');
            }

            if (password.length < CONSTANTS.VALIDATION.PASSWORD_MIN_LENGTH) {
                req.flash('error', `Mật khẩu phải có ít nhất ${CONSTANTS.VALIDATION.PASSWORD_MIN_LENGTH} ký tự`);
                return res.redirect('/users/create');
            }

            // Check if username exists
            const existingUsername = await this.userModel.isUsernameExists(username);
            if (existingUsername) {
                req.flash('error', 'Tên đăng nhập đã tồn tại');
                return res.redirect('/users/create');
            }

            // Check if email exists
            const existingEmail = await this.userModel.isEmailExists(email);
            if (existingEmail) {
                req.flash('error', 'Email đã tồn tại');
                return res.redirect('/users/create');
            }

            // Create user
            const userData = {
                username,
                email,
                password,
                full_name,
                role_id: parseInt(role_id),
                phone: phone || null,
                approval_status: CONSTANTS.USER_APPROVAL_STATUS.APPROVED,
                is_active: true,
                approved_by: req.session.user.id,
                approved_at: new Date()
            };

            const result = await this.userModel.create(userData);
            if (result.insertId) {
                req.flash('success', CONSTANTS.MESSAGES.SUCCESS.CREATED);
                res.redirect('/users');
            } else {
                req.flash('error', 'Không thể tạo người dùng');
                res.redirect('/users/create');
            }

        } catch (error) {
            console.error('Error in UserController store:', error);
            req.flash('error', CONSTANTS.MESSAGES.ERROR.SERVER_ERROR);
            res.redirect('/users/create');
        }
    }

    // Hiển thị chi tiết user
    async show(req, res) {
        try {
            const userId = parseInt(req.params.id);
            const user = await this.userModel.findWithRole(userId);

            if (!user) {
                req.flash('error', CONSTANTS.MESSAGES.ERROR.NOT_FOUND);
                return res.redirect('/users');
            }

            res.render('users/show', {
                title: 'Chi tiết người dùng',
                user: req.session.user,
                userDetail: user,
                success: res.locals.success,
                error: res.locals.error
            });

        } catch (error) {
            console.error('Error in UserController show:', error);
            req.flash('error', CONSTANTS.MESSAGES.ERROR.SERVER_ERROR);
            res.redirect('/users');
        }
    }

    // Hiển thị form chỉnh sửa user
    async edit(req, res) {
        try {
            const userId = parseInt(req.params.id);
            
            // Kiểm tra quyền: admin hoặc chính user đó
            if (req.session.user.role_name !== 'admin' && req.session.user.id !== userId) {
                req.flash('error', CONSTANTS.MESSAGES.ERROR.UNAUTHORIZED);
                return res.redirect('/users');
            }

            const user = await this.userModel.findWithRole(userId);
            if (!user) {
                req.flash('error', CONSTANTS.MESSAGES.ERROR.NOT_FOUND);
                return res.redirect('/users');
            }

            // Lấy danh sách roles (chỉ admin mới được thay đổi role)
            let roles = [];
            if (req.session.user.role_name === 'admin') {
                roles = await this.userModel.query('SELECT * FROM roles WHERE is_active = 1');
            }

            res.render('users/edit', {
                title: 'Chỉnh sửa người dùng',
                user: req.session.user,
                userDetail: user,
                roles: roles,
                error: res.locals.error,
                success: res.locals.success
            });

        } catch (error) {
            console.error('Error in UserController edit:', error);
            req.flash('error', CONSTANTS.MESSAGES.ERROR.SERVER_ERROR);
            res.redirect('/users');
        }
    }

    // Xử lý cập nhật user
    async update(req, res) {
        try {
            const userId = parseInt(req.params.id);
            
            // Kiểm tra quyền: admin hoặc chính user đó
            if (req.session.user.role_name !== 'admin' && req.session.user.id !== userId) {
                req.flash('error', CONSTANTS.MESSAGES.ERROR.UNAUTHORIZED);
                return res.redirect('/users');
            }

            const { email, full_name, role_id, phone } = req.body;

            // Validate input
            if (!email || !full_name) {
                req.flash('error', 'Vui lòng nhập đầy đủ thông tin bắt buộc');
                return res.redirect(`/users/${userId}/edit`);
            }

            // Check if email exists (exclude current user)
            const existingEmail = await this.userModel.isEmailExists(email, userId);
            if (existingEmail) {
                req.flash('error', 'Email đã tồn tại');
                return res.redirect(`/users/${userId}/edit`);
            }

            // Prepare update data
            const updateData = {
                email,
                full_name,
                phone: phone || null
            };

            // Chỉ admin mới được thay đổi role
            if (req.session.user.role_name === 'admin' && role_id) {
                updateData.role_id = parseInt(role_id);
            }

            const result = await this.userModel.update(userId, updateData);
            
            if (result.affectedRows > 0) {
                // Cập nhật session nếu user chỉnh sửa chính mình
                if (req.session.user.id === userId) {
                    req.session.user.email = email;
                    req.session.user.full_name = full_name;
                }

                req.flash('success', CONSTANTS.MESSAGES.SUCCESS.UPDATED);
                res.redirect('/users');
            } else {
                req.flash('error', 'Không có thay đổi nào được thực hiện');
                res.redirect(`/users/${userId}/edit`);
            }

        } catch (error) {
            console.error('Error in UserController update:', error);
            req.flash('error', CONSTANTS.MESSAGES.ERROR.SERVER_ERROR);
            res.redirect(`/users/${req.params.id}/edit`);
        }
    }

    // Xóa user (soft delete)
    async destroy(req, res) {
        try {
            // Kiểm tra quyền admin
            if (req.session.user.role_name !== 'admin') {
                req.flash('error', CONSTANTS.MESSAGES.ERROR.UNAUTHORIZED);
                return res.redirect('/users');
            }

            const userId = parseInt(req.params.id);

            // Không cho phép xóa chính mình
            if (req.session.user.id === userId) {
                req.flash('error', 'Không thể xóa chính mình');
                return res.redirect('/users');
            }

            const result = await this.userModel.softDelete(userId);
            
            if (result.affectedRows > 0) {
                req.flash('success', CONSTANTS.MESSAGES.SUCCESS.DELETED);
            } else {
                req.flash('error', 'Không thể xóa người dùng');
            }

            res.redirect('/users');

        } catch (error) {
            console.error('Error in UserController destroy:', error);
            req.flash('error', CONSTANTS.MESSAGES.ERROR.SERVER_ERROR);
            res.redirect('/users');
        }
    }

    async approve(req, res) {
        try {
            if (req.session.user.role_name !== CONSTANTS.ROLES.ADMIN) {
                req.flash('error', CONSTANTS.MESSAGES.ERROR.UNAUTHORIZED);
                return res.redirect('/users');
            }

            const userId = parseInt(req.params.id, 10);
            const roleId = parseInt(req.body.role_id, 10);

            if (!Number.isInteger(userId) || userId <= 0) {
                req.flash('error', 'Tài khoản không hợp lệ');
                return res.redirect('/users');
            }

            if (!Number.isInteger(roleId) || roleId <= 0) {
                req.flash('error', 'Vui lòng chọn vai trò trước khi phê duyệt.');
                return res.redirect('/users');
            }

            if (req.session.user.id === userId) {
                req.flash('error', 'Không thể thay đổi trạng thái phê duyệt của chính mình.');
                return res.redirect('/users');
            }

            const [targetUser, targetRole] = await Promise.all([
                this.userModel.findById(userId),
                this.roleModel.findById(roleId)
            ]);

            if (!targetUser) {
                req.flash('error', CONSTANTS.MESSAGES.ERROR.NOT_FOUND);
                return res.redirect('/users');
            }

            if (!targetRole || targetRole.is_active === 0) {
                req.flash('error', 'Vai trò không hợp lệ hoặc đã bị vô hiệu hóa.');
                return res.redirect('/users');
            }

            if (targetUser.approval_status === CONSTANTS.USER_APPROVAL_STATUS.APPROVED) {
                req.flash('info', 'Tài khoản này đã được phê duyệt trước đó.');
                return res.redirect('/users');
            }

            await this.userModel.approveUser(userId, req.session.user.id, roleId);

            req.flash('success', 'Đã phê duyệt tài khoản và cấp quyền truy cập.');
            res.redirect('/users');
        } catch (error) {
            console.error('Error in UserController approve:', error);
            req.flash('error', CONSTANTS.MESSAGES.ERROR.SERVER_ERROR);
            res.redirect('/users');
        }
    }

    async reject(req, res) {
        try {
            if (req.session.user.role_name !== CONSTANTS.ROLES.ADMIN) {
                req.flash('error', CONSTANTS.MESSAGES.ERROR.UNAUTHORIZED);
                return res.redirect('/users');
            }

            const userId = parseInt(req.params.id, 10);
            if (!Number.isInteger(userId) || userId <= 0) {
                req.flash('error', 'Tài khoản không hợp lệ');
                return res.redirect('/users');
            }

            if (req.session.user.id === userId) {
                req.flash('error', 'Không thể thay đổi trạng thái phê duyệt của chính mình.');
                return res.redirect('/users');
            }

            const reason = req.body.reason ? req.body.reason.trim() : '';
            const targetUser = await this.userModel.findById(userId);

            if (!targetUser) {
                req.flash('error', CONSTANTS.MESSAGES.ERROR.NOT_FOUND);
                return res.redirect('/users');
            }

            if (targetUser.approval_status === CONSTANTS.USER_APPROVAL_STATUS.REJECTED) {
                req.flash('info', 'Tài khoản này đã bị từ chối trước đó.');
                return res.redirect('/users');
            }

            if (targetUser.approval_status === CONSTANTS.USER_APPROVAL_STATUS.APPROVED) {
                req.flash('error', 'Tài khoản đã được phê duyệt, vui lòng vô hiệu hóa nếu cần khóa truy cập.');
                return res.redirect('/users');
            }

            await this.userModel.rejectUser(userId, req.session.user.id, reason);

            req.flash('success', 'Đã từ chối yêu cầu kích hoạt tài khoản.');
            res.redirect('/users');
        } catch (error) {
            console.error('Error in UserController reject:', error);
            req.flash('error', CONSTANTS.MESSAGES.ERROR.SERVER_ERROR);
            res.redirect('/users');
        }
    }

    // Reset password user
    async resetPassword(req, res) {
        try {
            // Kiểm tra quyền admin
            if (req.session.user.role_name !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: CONSTANTS.MESSAGES.ERROR.UNAUTHORIZED
                });
            }

            const userId = parseInt(req.params.id);
            const { new_password } = req.body;

            if (!new_password || new_password.length < CONSTANTS.VALIDATION.PASSWORD_MIN_LENGTH) {
                return res.status(400).json({
                    success: false,
                    message: `Mật khẩu phải có ít nhất ${CONSTANTS.VALIDATION.PASSWORD_MIN_LENGTH} ký tự`
                });
            }

            await this.userModel.resetPassword(userId, new_password);

            res.json({
                success: true,
                message: 'Reset mật khẩu thành công'
            });

        } catch (error) {
            console.error('Error in UserController resetPassword:', error);
            res.status(500).json({
                success: false,
                message: CONSTANTS.MESSAGES.ERROR.SERVER_ERROR
            });
        }
    }

    // API: Lấy danh sách user cho select dropdown
    async getUsers(req, res) {
        try {
            const search = req.query.search || '';
            const limit = parseInt(req.query.limit) || 10;

            let sql = `
                SELECT id, username, full_name, email
                FROM users 
                WHERE is_active = 1 AND approval_status = ?
            `;
            const params = [CONSTANTS.USER_APPROVAL_STATUS.APPROVED];

            if (search) {
                sql += ' AND (username LIKE ? OR full_name LIKE ? OR email LIKE ?)';
                const searchTerm = `%${search}%`;
                params.push(searchTerm, searchTerm, searchTerm);
            }

            sql += ' ORDER BY full_name ASC LIMIT ?';
            params.push(limit);

            const users = await this.userModel.query(sql, params);

            res.json({
                success: true,
                data: users
            });

        } catch (error) {
            console.error('Error in UserController getUsers:', error);
            res.status(500).json({
                success: false,
                message: CONSTANTS.MESSAGES.ERROR.SERVER_ERROR
            });
        }
    }
}

module.exports = UserController;