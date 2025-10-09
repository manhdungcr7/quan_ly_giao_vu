const express = require('express');
const router = express.Router();

// Import controllers
const DashboardController = require('../controllers/DashboardController');
const UserController = require('../controllers/UserController');
const ExaminationController = require('../controllers/ExaminationController');
const ScheduleController = require('../controllers/ScheduleController');
const TeachingImportController = require('../controllers/TeachingImportController');
const TeachingLecturerController = require('../controllers/TeachingLecturerController');
const AssetController = require('../controllers/AssetController');

// Import middleware
const { requireAuth } = require('../middleware/auth');
const { upload, validateFileUpload } = require('../middleware/upload');

// Initialize controllers
const dashboardController = new DashboardController();
const userController = new UserController();
const examinationController = new ExaminationController();
const assetController = new AssetController();

// API prefix: /api

// Dashboard API
router.get('/dashboard/stats', requireAuth, (req, res) => {
    dashboardController.getStatsAPI(req, res);
});

// User API
router.get('/users/search', requireAuth, (req, res) => {
    userController.getUsers(req, res);
});

router.post('/users/:id/reset-password', requireAuth, (req, res) => {
    userController.resetPassword(req, res);
});

// File upload API
router.post('/upload', requireAuth, upload.array('files', 5), validateFileUpload, (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Không có file nào được upload'
            });
        }

        const uploadedFiles = req.files.map(file => ({
            filename: file.filename,
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            path: file.path,
            url: `/uploads/${file.filename}`
        }));

        res.json({
            success: true,
            message: `Đã upload thành công ${uploadedFiles.length} file`,
            files: uploadedFiles
        });
    } catch (error) {
        console.error('Upload processing error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xử lý file upload'
        });
    }
});

// TODO: Add more API routes
// - Staff API
// - Document API
// - Asset API  
// - Project API
// - Schedule API
// - File upload API

// ==================== EXAMINATION API ROUTES ====================
// Get reference data for comboboxes
router.get('/examination/:type(periods|subjects|classes|graders)', requireAuth, (req, res) => {
    examinationController.getReferenceData(req, res);
});

// Get session data (for modal editing)
router.get('/examination/:id', requireAuth, (req, res) => {
    examinationController.getSession(req, res);
});

// Get files for a session
router.get('/examination/:id/files', requireAuth, (req, res) => {
    examinationController.getSessionFiles(req, res);
});

// Upload file for session
router.post('/examination/:id/upload', requireAuth, upload.single('file'), (req, res) => {
    examinationController.uploadFile(req, res);
});

// Delete file
router.delete('/examination/file/:fileId', requireAuth, (req, res) => {
    examinationController.deleteFile(req, res);
});

// Set primary file
router.put('/examination/file/:fileId/primary', requireAuth, (req, res) => {
    examinationController.setPrimaryFile(req, res);
});

// Download file
router.get('/examination/file/:fileId/download', requireAuth, (req, res) => {
    examinationController.downloadFile(req, res);
});

// Update examination session (API)
router.put('/examination/:id', requireAuth, (req, res) => {
    examinationController.update(req, res);
});

// Create examination session (API)
router.post('/examination', requireAuth, (req, res) => {
    examinationController.store(req, res);
});

// ============ SCHEDULE API ============
// Get events for calendar
router.get('/schedule/events', requireAuth, (req, res) => ScheduleController.getEvents(req, res));

// Teaching schedule (weekly grid)
router.get('/schedule/teaching', requireAuth, (req, res) => ScheduleController.getTeachingSchedule(req, res));

// Get schedule detail
router.get('/schedule/:id', requireAuth, (req, res) => ScheduleController.show(req, res));

// Create schedule
router.post('/schedule', requireAuth, (req, res) => ScheduleController.store(req, res));

// Update schedule
router.put('/schedule/:id', requireAuth, (req, res) => ScheduleController.update(req, res));

// Delete schedule
router.delete('/schedule/:id', requireAuth, (req, res) => ScheduleController.destroy(req, res));

// Update status
router.put('/schedule/:id/status', requireAuth, (req, res) => ScheduleController.updateStatus(req, res));

// Participants management
router.post('/schedule/:id/participants', requireAuth, (req, res) => ScheduleController.addParticipant(req, res));
router.delete('/schedule/:id/participants/:userId', requireAuth, (req, res) => ScheduleController.removeParticipant(req, res));
router.put('/schedule/:id/participants/:userId', requireAuth, (req, res) => ScheduleController.updateParticipantStatus(req, res));

// Check conflicts
router.get('/schedule/conflicts', requireAuth, (req, res) => ScheduleController.checkConflicts(req, res));

// Teaching schedule import
router.get('/schedule/teaching/import/template', requireAuth, (req, res) => TeachingImportController.downloadTemplate(req, res));
router.post(
    '/schedule/teaching/import/preview',
    requireAuth,
    upload.single('file'),
    validateFileUpload,
    (req, res) => TeachingImportController.preview(req, res)
);
router.post('/schedule/teaching/import/commit', requireAuth, (req, res) => TeachingImportController.commit(req, res));
router.delete('/schedule/teaching/import/:jobId', requireAuth, (req, res) => TeachingImportController.cancel(req, res));

// Custom teaching lecturers
router.get('/schedule/teaching/custom-lecturers', requireAuth, (req, res) => TeachingLecturerController.index(req, res));
router.post('/schedule/teaching/custom-lecturers', requireAuth, (req, res) => TeachingLecturerController.store(req, res));
router.put('/schedule/teaching/custom-lecturers/:id', requireAuth, (req, res) => TeachingLecturerController.update(req, res));
router.delete('/schedule/teaching/custom-lecturers/:id', requireAuth, (req, res) => TeachingLecturerController.destroy(req, res));

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

module.exports = router;

// ===== ASSET API =====
// Reference data for forms
router.get('/assets/reference', requireAuth, (req, res) => assetController.getReferenceData(req, res));
// Get one asset detail
router.get('/assets/:id', requireAuth, (req, res) => assetController.getOne(req, res));
// Create asset
router.post('/assets', requireAuth, (req, res) => assetController.store(req, res));
// Update asset
router.put('/assets/:id', requireAuth, (req, res) => assetController.updateOne(req, res));
// Delete asset
router.delete('/assets/:id', requireAuth, (req, res) => assetController.destroy(req, res));