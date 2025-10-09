const User = require('../models/User');
const CONSTANTS = require('../../config/constants');
const Role = require('../models/Role');

class AuthController {
    constructor() {
        this.userModel = new User();
        this.roleModel = new Role();
    }

    async getDefaultStaffRole() {
        try {
            const role = await this.roleModel.findOne({
                name: CONSTANTS.ROLES.STAFF,
                is_active: 1
            });
            if (role) {
                return role;
            }
        } catch (error) {
            console.warn('Unable to load default staff role:', error.message || error);
        }
        return null;
    }

    // Hiển thị trang đăng nhập
    async showLogin(req, res) {
        try {
            // Nếu đã đăng nhập, chuyển hướng đến dashboard
            if (req.session.user) {
                return res.redirect('/dashboard');
            }

            res.render('auth/login', {
                title: 'Đăng nhập',
                error: req.flash('error'),
                success: req.flash('success')
            });
        } catch (error) {
            console.error('Error in AuthController showLogin:', error);
            res.status(500).render('error', {
                title: 'Lỗi hệ thống',
                message: 'Đã xảy ra lỗi khi tải trang đăng nhập'
            });
        }
    }

    // Xử lý đăng nhập
    async login(req, res) {
        try {
            const { username, password, remember } = req.body;

            // Validate input
            if (!username || !password) {
                req.flash('error', 'Vui lòng nhập đầy đủ thông tin đăng nhập');
                return res.redirect('/auth/login');
            }

            // Authenticate user
            const user = await this.userModel.authenticate(username, password);
            if (!user) {
                req.flash('error', CONSTANTS.MESSAGES.ERROR.INVALID_CREDENTIALS);
                return res.redirect('/auth/login');
            }

            // Get user with role information
            const userWithRole = await this.userModel.findWithRole(user.id);
            if (!userWithRole) {
                req.flash('error', 'Không thể tải thông tin người dùng');
                return res.redirect('/auth/login');
            }

            // Build permissions array safely (handle JSON, CSV, or plain token)
            let permissions = [];
            const rawPermissions = userWithRole.role_permissions;
            if (rawPermissions) {
                if (Array.isArray(rawPermissions)) {
                    permissions = rawPermissions;
                } else if (typeof rawPermissions === 'string') {
                    const trimmed = rawPermissions.trim();
                    if (trimmed) {
                        try {
                            const parsed = JSON.parse(trimmed);
                            if (Array.isArray(parsed)) {
                                permissions = parsed;
                            } else if (parsed && typeof parsed === 'object') {
                                permissions = Object.keys(parsed).filter(key => parsed[key]);
                            }
                        } catch (err) {
                            if (trimmed.toLowerCase() === 'all') {
                                permissions = ['all'];
                            } else if (trimmed.includes(',')) {
                                permissions = trimmed.split(',').map(p => p.trim()).filter(Boolean);
                            }
                        }
                    }
                }
            }

            // Set session
            req.session.user = {
                id: userWithRole.id,
                username: userWithRole.username,
                full_name: userWithRole.full_name,
                email: userWithRole.email,
                role_id: userWithRole.role_id,
                role_name: userWithRole.role_name,
                permissions
            };

            // Set remember me cookie if requested
            if (remember) {
                req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
            }

            req.flash('success', CONSTANTS.MESSAGES.SUCCESS.LOGIN);
            res.redirect('/dashboard');

        } catch (error) {
            console.error('Error in AuthController login:', error);
            req.flash('error', CONSTANTS.MESSAGES.ERROR.SERVER_ERROR);
            res.redirect('/auth/login');
        }
    }

    // Hiển thị trang đăng ký
    async showRegister(req, res) {
        try {
            let roles = [];
            const currentUser = req.session ? req.session.user : null;
            const isAdmin = currentUser && currentUser.role_name === CONSTANTS.ROLES.ADMIN;

            if (currentUser && !isAdmin) {
                req.flash('error', 'Bạn đã đăng nhập và không thể truy cập trang đăng ký.');
                return res.redirect('/dashboard');
            }

            let defaultRole = await this.getDefaultStaffRole();

            if (!defaultRole) {
                try {
                    defaultRole = await this.roleModel.findOne({ is_active: 1 });
                } catch (error) {
                    console.warn('Cannot load fallback role:', error.message || error);
                }
            }

            if (isAdmin) {
                try {
                    roles = await this.roleModel.getActiveRoles();
                } catch (e) {
                    console.warn('Cannot load roles list:', e.message || e);
                }
            }

            res.render('auth/register', {
                title: 'Đăng ký tài khoản',
                roles,
                isAdmin,
                defaultRole,
                error: req.flash('error'),
                success: req.flash('success')
            });
        } catch (error) {
            console.error('Error in AuthController showRegister:', error);
            res.status(500).render('error', {
                title: 'Lỗi hệ thống',
                message: 'Đã xảy ra lỗi khi tải trang đăng ký'
            });
        }
    }

    // Xử lý đăng ký
    async register(req, res) {
        try {
            const { username, email, password, confirm_password, full_name, role_id } = req.body;
            const currentUser = req.session ? req.session.user : null;
            const isAdmin = currentUser && currentUser.role_name === CONSTANTS.ROLES.ADMIN;

            console.info('[Auth] Register attempt', {
                username,
                email,
                isAdmin,
                hasCurrentUser: !!currentUser
            });

            if (currentUser && !isAdmin) {
                req.flash('error', 'Bạn không có quyền tạo thêm tài khoản.');
                return res.redirect('/dashboard');
            }

            // Validate input
            if (!username || !email || !password || !confirm_password || !full_name) {
                req.flash('error', 'Vui lòng nhập đầy đủ thông tin');
                return res.redirect('/auth/register');
            }

            if (password !== confirm_password) {
                req.flash('error', 'Mật khẩu xác nhận không khớp');
                return res.redirect('/auth/register');
            }

            if (password.length < CONSTANTS.VALIDATION.PASSWORD_MIN_LENGTH) {
                req.flash('error', `Mật khẩu phải có ít nhất ${CONSTANTS.VALIDATION.PASSWORD_MIN_LENGTH} ký tự`);
                return res.redirect('/auth/register');
            }

            // Check if username exists
            const existingUsername = await this.userModel.isUsernameExists(username);
            if (existingUsername) {
                req.flash('error', 'Tên đăng nhập đã tồn tại');
                return res.redirect('/auth/register');
            }

            // Check if email exists
            const existingEmail = await this.userModel.isEmailExists(email);
            if (existingEmail) {
                req.flash('error', 'Email đã tồn tại');
                return res.redirect('/auth/register');
            }

            // Create user
            const userData = {
                username,
                email,
                password,
                full_name,
                role_id: null
            };

            if (isAdmin) {
                const parsedRoleId = parseInt(role_id, 10);
                if (Number.isNaN(parsedRoleId)) {
                    req.flash('error', 'Vai trò không hợp lệ');
                    return res.redirect('/auth/register');
                }

                const targetRole = await this.roleModel.findById(parsedRoleId);
                if (!targetRole || targetRole.is_active === 0) {
                    req.flash('error', 'Vai trò không tồn tại hoặc đã bị vô hiệu hóa');
                    return res.redirect('/auth/register');
                }

                userData.role_id = parsedRoleId;
            } else {
                let defaultRole = await this.getDefaultStaffRole();

                if (!defaultRole) {
                    defaultRole = await this.roleModel.findOne({ is_active: 1 });
                }

                if (!defaultRole || !defaultRole.id) {
                    req.flash('error', 'Không tìm thấy vai trò mặc định cho người dùng mới. Vui lòng liên hệ quản trị viên.');
                    return res.redirect('/auth/register');
                }

                userData.role_id = defaultRole.id;
            }

            const result = await this.userModel.create(userData);
            if (result.insertId) {
                console.info('[Auth] Register success', { userId: result.insertId, username });
                if (isAdmin) {
                    req.flash('success', 'Tạo tài khoản thành công');
                    return res.redirect('/users');
                } else {
                    req.flash('success', 'Đăng ký tài khoản thành công. Vui lòng đăng nhập để tiếp tục.');
                    return res.redirect('/auth/login');
                }
            } else {
                req.flash('error', 'Không thể tạo tài khoản');
                return res.redirect('/auth/register');
            }

        } catch (error) {
            console.error('Error in AuthController register:', error);
            if (error.code === 'ER_DUP_ENTRY') {
                if (error.message.includes('username')) {
                    req.flash('error', 'Tên đăng nhập đã tồn tại, vui lòng chọn tên khác.');
                } else if (error.message.includes('email')) {
                    req.flash('error', 'Email đã được sử dụng, vui lòng kiểm tra lại.');
                } else {
                    req.flash('error', 'Thông tin đã tồn tại trong hệ thống.');
                }
            } else if (error.code === 'ER_BAD_NULL_ERROR') {
                req.flash('error', 'Dữ liệu đăng ký thiếu thông tin bắt buộc. Vui lòng kiểm tra lại.');
            } else if (error.code === 'ER_NO_REFERENCED_ROW_2') {
                req.flash('error', 'Vai trò được chọn không tồn tại. Vui lòng chọn vai trò khác hoặc liên hệ quản trị viên.');
            } else {
                const message = process.env.NODE_ENV !== 'production' && error.message
                    ? `Đăng ký không thành công: ${error.message}`
                    : CONSTANTS.MESSAGES.ERROR.SERVER_ERROR;
                req.flash('error', message);
            }
            return res.redirect('/auth/register');
        }
    }

    // Đăng xuất
    async logout(req, res) {
        try {
            req.session.destroy((err) => {
                if (err) {
                    console.error('Error destroying session:', err);
                    req.flash('error', 'Lỗi khi đăng xuất');
                    return res.redirect('/dashboard');
                }

                res.clearCookie('connect.sid');
                res.redirect('/auth/login');
            });
        } catch (error) {
            console.error('Error in AuthController logout:', error);
            res.redirect('/dashboard');
        }
    }

    // Hiển thị trang đổi mật khẩu
    async showChangePassword(req, res) {
        try {
            res.render('auth/change-password', {
                title: 'Đổi mật khẩu',
                user: req.session.user,
                error: req.flash('error'),
                success: req.flash('success')
            });
        } catch (error) {
            console.error('Error in AuthController showChangePassword:', error);
            res.status(500).render('error', {
                title: 'Lỗi hệ thống',
                message: 'Đã xảy ra lỗi khi tải trang đổi mật khẩu'
            });
        }
    }

    // Xử lý đổi mật khẩu
    async changePassword(req, res) {
        try {
            const { current_password, new_password, confirm_password } = req.body;
            const userId = req.session.user.id;

            // Validate input
            if (!current_password || !new_password || !confirm_password) {
                req.flash('error', 'Vui lòng nhập đầy đủ thông tin');
                return res.redirect('/auth/change-password');
            }

            if (new_password !== confirm_password) {
                req.flash('error', 'Mật khẩu mới không khớp');
                return res.redirect('/auth/change-password');
            }

            if (new_password.length < CONSTANTS.VALIDATION.PASSWORD_MIN_LENGTH) {
                req.flash('error', `Mật khẩu mới phải có ít nhất ${CONSTANTS.VALIDATION.PASSWORD_MIN_LENGTH} ký tự`);
                return res.redirect('/auth/change-password');
            }

            // Change password
            await this.userModel.changePassword(userId, current_password, new_password);
            
            req.flash('success', 'Đổi mật khẩu thành công');
            res.redirect('/dashboard');

        } catch (error) {
            console.error('Error in AuthController changePassword:', error);
            
            if (error.message === 'Invalid old password') {
                req.flash('error', 'Mật khẩu hiện tại không đúng');
            } else {
                req.flash('error', CONSTANTS.MESSAGES.ERROR.SERVER_ERROR);
            }
            
            res.redirect('/auth/change-password');
        }
    }

    // Hiển thị trang quên mật khẩu
    async showForgotPassword(req, res) {
        try {
            res.render('auth/forgot-password', {
                title: 'Quên mật khẩu',
                error: req.flash('error'),
                success: req.flash('success')
            });
        } catch (error) {
            console.error('Error in AuthController showForgotPassword:', error);
            res.status(500).render('error', {
                title: 'Lỗi hệ thống',
                message: 'Đã xảy ra lỗi khi tải trang quên mật khẩu'
            });
        }
    }

    // Xử lý quên mật khẩu (chức năng cơ bản)
    async forgotPassword(req, res) {
        try {
            const { email } = req.body;

            if (!email) {
                req.flash('error', 'Vui lòng nhập email');
                return res.redirect('/auth/forgot-password');
            }

            const user = await this.userModel.findByEmail(email);
            if (!user) {
                req.flash('error', 'Email không tồn tại trong hệ thống');
                return res.redirect('/auth/forgot-password');
            }

            // TODO: Implement email sending logic here
            // For now, just show a message
            req.flash('success', 'Vui lòng liên hệ quản trị viên để reset mật khẩu');
            res.redirect('/auth/login');

        } catch (error) {
            console.error('Error in AuthController forgotPassword:', error);
            req.flash('error', CONSTANTS.MESSAGES.ERROR.SERVER_ERROR);
            res.redirect('/auth/forgot-password');
        }
    }
}

module.exports = AuthController;