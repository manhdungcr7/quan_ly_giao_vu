const express = require('express');
const router = express.Router();

// Import controllers
const AuthController = require('../controllers/AuthController');
const { redirectIfAuthenticated, requireAuth } = require('../middleware/auth');
const { loginValidationRules, checkValidationResult } = require('../middleware/validation');

// Initialize controllers
const authController = new AuthController();

// GET /auth/login - Hiển thị form đăng nhập
router.get('/login', redirectIfAuthenticated, (req, res) => {
    authController.showLogin(req, res);
});

// POST /auth/login - Xử lý đăng nhập
router.post('/login', 
    redirectIfAuthenticated,
    loginValidationRules,
    checkValidationResult,
    (req, res) => {
        authController.login(req, res);
    }
);

// GET /auth/register - Hiển thị form đăng ký (chỉ admin)
router.get('/register', (req, res) => {
    authController.showRegister(req, res);
});

// POST /auth/register - Xử lý đăng ký
router.post('/register', (req, res) => {
    authController.register(req, res);
});

// GET /auth/logout - Đăng xuất
router.get('/logout', (req, res) => {
    authController.logout(req, res);
});

// POST /auth/logout - Đăng xuất (POST method)
router.post('/logout', (req, res) => {
    authController.logout(req, res);
});

// GET /auth/change-password - Hiển thị form đổi mật khẩu
router.get('/change-password', requireAuth, (req, res) => {
    authController.showChangePassword(req, res);
});

// POST /auth/change-password - Xử lý đổi mật khẩu
router.post('/change-password', requireAuth, (req, res) => {
    authController.changePassword(req, res);
});

// GET /auth/forgot-password - Hiển thị form quên mật khẩu
router.get('/forgot-password', redirectIfAuthenticated, (req, res) => {
    authController.showForgotPassword(req, res);
});

// POST /auth/forgot-password - Xử lý quên mật khẩu
router.post('/forgot-password', redirectIfAuthenticated, (req, res) => {
    authController.forgotPassword(req, res);
});

module.exports = router;