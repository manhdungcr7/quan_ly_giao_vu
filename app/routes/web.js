const express = require('express');
const router = express.Router();

// Import controllers
const DashboardController = require('../controllers/DashboardController');
const UserController = require('../controllers/UserController');
const DocumentController = require('../controllers/DocumentController');
const LegalDocumentController = require('../controllers/LegalDocumentController');
const WorkbookController = require('../controllers/WorkbookController');
const ExaminationController = require('../controllers/ExaminationController');
const ScheduleController = require('../controllers/ScheduleController');
const StaffController = require('../controllers/StaffController');
const AssetController = require('../controllers/AssetController');
const ReportController = require('../controllers/ReportController');
const ReminderController = require('../controllers/ReminderController');
const ResearchController = require('../controllers/ResearchController');
const ResearchManagementController = require('../controllers/ResearchManagementController');

// Import middleware
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { documentUpload, validateFileUpload } = require('../middleware/upload');
const { userValidationRules, checkValidationResult } = require('../middleware/validation');

// Initialize controllers
const dashboardController = new DashboardController();
const userController = new UserController();
const documentController = new DocumentController();
const legalDocumentController = new LegalDocumentController();
const workbookController = new WorkbookController();
const examinationController = new ExaminationController();
const scheduleController = ScheduleController; // Already exported as instance
const staffController = new StaffController();
const assetController = new AssetController();
const reportController = new ReportController();
const reminderController = new ReminderController();
const researchController = new ResearchController();
const researchManagementController = new ResearchManagementController();

const modulePlaceholder = (moduleConfig) => (req, res) => {
    res.render('modules/placeholder', {
        title: moduleConfig.title,
        module: moduleConfig,
        user: req.session.user
    });
};

const moduleRoutes = [
    // Documents module now implemented with real pages, remove placeholder definition
    {
        path: '/projects',
        title: 'Đề án',
        subtitle: 'Tổng quan đề án, nhiệm vụ và tiến độ thực hiện',
        status: 'upcoming',
        statusLabel: 'Đang phát triển',
        highlights: [
            'Danh mục đề án theo giai đoạn và lĩnh vực',
            'Theo dõi tiến độ và nguồn lực tham gia',
            'Báo cáo nhanh các mốc quan trọng'
        ],
        notes: 'Chức năng đang được kết nối với dữ liệu thực tế, dự kiến phát hành trong tháng tới.'
    },
    {
        path: '/research',
        title: 'Nghiên cứu khoa học',
        subtitle: 'Quản lý đề tài khoa học, công bố và sản phẩm nghiên cứu',
        status: 'active',
        statusLabel: 'Đã triển khai',
        highlights: [
            'Theo dõi tiến độ đề tài giảng viên và sinh viên',
            'Bảng điều phối milestone và cảnh báo tiến độ',
            'Tổng hợp kết quả nghiên cứu, bài báo và giải thưởng'
        ],
        notes: 'Trang tổng quan nghiên cứu khoa học đã sẵn sàng sử dụng.'
    },
    {
        path: '/project-management',
        title: 'Quản lý dự án',
        subtitle: 'Điều phối nguồn lực, thời gian và kết quả dự án',
        status: 'upcoming',
        statusLabel: 'Đang phát triển',
        highlights: [
            'Bảng Kanban theo dõi trạng thái công việc',
            'Quản lý rủi ro và thay đổi phạm vi dự án',
            'Báo cáo tổng hợp chi phí, tiến độ'
        ],
        notes: 'Module sẽ tích hợp sau khi hoàn thành nền tảng đề án.'
    },
    {
        path: '/schedule',
        title: 'Lịch công tác',
        subtitle: 'Quản lý lịch họp, công tác, lịch tuần cá nhân và đơn vị',
        status: 'active',
        statusLabel: 'Đã triển khai',
        highlights: [
            'Lịch tháng/tuần/ngày với FullCalendar',
            'Tạo, chỉnh sửa, kéo thả sự kiện trực tiếp',
            'Lọc theo người phụ trách và kiểm tra xung đột'
        ],
        actions: [
            { label: 'Mở lịch công tác', href: '/schedule', disabled: false }
        ],
        notes: 'Phiên bản đầu tiên đã sẵn sàng sử dụng với dữ liệu mẫu.'
    },
    {
        path: '/reminders',
        title: 'Nhắc việc',
        subtitle: 'Theo dõi công việc có hạn xử lý và phân loại mức ưu tiên',
        status: 'active',
        statusLabel: 'Đã triển khai',
        highlights: [
            'Tổng hợp hạn xử lý từ báo cáo, văn bản, khảo thí',
            'Nhóm nhắc việc theo trạng thái: quá hạn, đến hạn, sắp đến hạn',
            'Bộ lọc theo phân hệ và gợi ý điều hành nhanh'
        ],
        notes: 'Phiên bản đầu tiên đã sẵn sàng với dữ liệu thực tế từ các phân hệ.'
    },
    {
        path: '/reports',
        title: 'Báo cáo tổng hợp',
        subtitle: 'Thống kê số liệu và biểu đồ phục vụ điều hành',
        status: 'upcoming',
        statusLabel: 'Đang phát triển',
        highlights: [
            'Báo cáo chuẩn theo tháng/quý/năm',
            'Dashboard thống kê động',
            'Xuất file PDF/Excel nhanh chóng'
        ],
        notes: 'Đang xây dựng kho dữ liệu tổng hợp (data warehouse).'
    },
    {
        path: '/legal-documents',
        title: 'Văn bản pháp lý',
        subtitle: 'Quản lý văn bản pháp lý, quy định và nghị định',
        status: 'upcoming',
        statusLabel: 'Đang phát triển',
        highlights: [
            'Lưu trữ văn bản pháp lý theo loại và lĩnh vực',
            'Tra cứu nhanh theo từ khóa và nội dung',
            'Theo dõi hiệu lực và văn bản thay thế'
        ],
        notes: 'Module sẽ được triển khai sau khi hoàn thành cơ sở dữ liệu văn bản.'
    },
    {
        path: '/examination',
        title: 'Công tác khảo thí',
        subtitle: 'Quản lý tổ chức thi, coi thi và chấm thi',
        status: 'upcoming',
        statusLabel: 'Đang phát triển',
        highlights: [
            'Lập kế hoạch thi theo học kỳ và môn học',
            'Phân công coi thi và chấm thi tự động',
            'Theo dõi kết quả và thống kê chất lượng'
        ],
        notes: 'Đang nghiên cứu tích hợp với hệ thống quản lý sinh viên.'
    },
    {
        path: '/teaching-handbook',
        title: 'Sổ tay công tác',
        subtitle: 'Hướng dẫn quy trình và biểu mẫu công tác giảng dạy',
        status: 'upcoming',
        statusLabel: 'Đang phát triển',
        highlights: [
            'Kho tài liệu hướng dẫn quy trình công tác',
            'Biểu mẫu điện tử có thể tải xuống',
            'Cập nhật thông tin mới nhất từ nhà trường'
        ],
        notes: 'Đang thu thập và số hóa các tài liệu hướng dẫn hiện có.'
    }
];

// Document management routes (must be before moduleRoutes loop to override any placeholder)
router.get('/documents', requireAuth, (req, res) => {
    res.redirect('/documents/incoming');
});
router.get('/documents/incoming', requireAuth, (req, res) => {
    documentController.incoming(req, res);
});
router.get('/documents/outgoing', requireAuth, (req, res) => {
    documentController.outgoing(req, res);
});
router.get('/documents/create', requireAuth, (req, res) => {
    documentController.create(req, res);
});
router.post('/documents', requireAuth, documentUpload.array('attachments', 5), validateFileUpload, (req, res) => {
    documentController.store(req, res);
});

// Document CRUD routes
router.get('/documents/:id', requireAuth, (req, res) => {
    documentController.show(req, res);
});
router.get('/documents/:id/edit', requireAuth, (req, res) => {
    documentController.edit(req, res);
});
router.post('/documents/:id', requireAuth, documentUpload.array('attachments', 5), validateFileUpload, (req, res) => {
    documentController.update(req, res);
});
router.delete('/documents/:id', requireAuth, (req, res) => {
    documentController.destroy(req, res);
});

// Document files
router.get('/documents/:id/files', requireAuth, (req, res) => documentController.files(req, res));
router.get('/documents/files/:fileId/preview-info', requireAuth, (req, res) => documentController.previewInfo(req, res));
router.get('/documents/files/:fileId/preview', requireAuth, (req, res) => documentController.previewFile(req, res));
router.get('/documents/files/:fileId/download', requireAuth, (req, res) => documentController.downloadFile(req, res));

// Directive (chi_dao) APIs (AJAX)
router.post('/documents/:id/directive', requireAuth, (req, res) => documentController.updateDirective(req, res));
router.post('/documents/:id/directive/approve', requireAuth, (req, res) => documentController.approveDirective(req, res));

// Legal Documents routes
router.get('/legal-documents', requireAuth, (req, res) => legalDocumentController.index(req, res));
router.get('/legal-documents/create', requireAuth, (req, res) => legalDocumentController.create(req, res));
router.post('/legal-documents', requireAuth, documentUpload.array('attachments', 5), validateFileUpload, (req, res) => legalDocumentController.store(req, res));
router.get('/legal-documents/:id', requireAuth, (req, res) => legalDocumentController.show(req, res));
router.get('/legal-documents/:id/edit', requireAuth, (req, res) => legalDocumentController.edit(req, res));
router.post('/legal-documents/:id', requireAuth, documentUpload.array('attachments', 5), validateFileUpload, (req, res) => legalDocumentController.update(req, res));
router.delete('/legal-documents/:id', requireAuth, (req, res) => legalDocumentController.destroy(req, res));

// Legal document files
router.get('/legal-documents/:id/files', requireAuth, (req, res) => legalDocumentController.files(req, res));
router.get('/legal-documents/files/:fileId/preview-info', requireAuth, (req, res) => legalDocumentController.previewInfo(req, res));
router.get('/legal-documents/files/:fileId/preview', requireAuth, (req, res) => legalDocumentController.previewFile(req, res));
router.get('/legal-documents/files/:fileId/download', requireAuth, (req, res) => legalDocumentController.downloadFile(req, res));

// Workbook routes
router.get('/workbook', requireAuth, (req, res) => workbookController.index(req, res));
router.get('/workbook/history', requireAuth, (req, res) => workbookController.history(req, res));
router.get('/workbook/find', requireAuth, (req, res) => workbookController.findWorkbookByWeek(req, res));
router.post('/workbook/create', requireAuth, (req, res) => workbookController.createWorkbook(req, res));
router.get('/workbook/:id', requireAuth, (req, res) => workbookController.show(req, res));

// Entry APIs
router.post('/workbook/entry', requireAuth, (req, res) => workbookController.saveEntry(req, res));
router.get('/workbook/entry', requireAuth, (req, res) => workbookController.getEntry(req, res));
router.post('/workbook/:id/status', requireAuth, (req, res) => workbookController.updateStatus(req, res));
router.put('/workbook/:id/status', requireAuth, (req, res) => workbookController.updateStatus(req, res));

// Quick notes APIs
router.put('/workbook/:id/notes', requireAuth, (req, res) => workbookController.updateQuickNotes(req, res));
router.get('/workbook/:id/notes', requireAuth, (req, res) => workbookController.getQuickNotes(req, res));

// Examination routes (Công tác khảo thí) - CRUD operations
router.get('/examination', requireAuth, (req, res) => examinationController.index(req, res));
router.get('/examination/create', requireAuth, (req, res) => examinationController.create(req, res));
router.post('/examination', requireAuth, (req, res) => examinationController.store(req, res));
router.get('/examination/:id', requireAuth, (req, res) => examinationController.show(req, res));
router.get('/examination/:id/edit', requireAuth, (req, res) => examinationController.edit(req, res));
router.put('/examination/:id', requireAuth, (req, res) => examinationController.update(req, res));
router.delete('/examination/:id', requireAuth, (req, res) => examinationController.destroy(req, res));
router.post('/examination/:id/reminder', requireAuth, (req, res) => examinationController.sendReminder(req, res));

// Schedule routes (Lịch công tác)
router.get('/schedule', requireAuth, (req, res) => scheduleController.index(req, res));
router.get('/schedules', requireAuth, (req, res) => res.redirect(301, '/schedule'));

// Research routes (Nghiên cứu khoa học)
router.get('/research', requireAuth, (req, res) => researchController.index(req, res));
router.get('/research/manage', requireAuth, (req, res) => researchManagementController.manage(req, res));
router.post('/research/projects/save', requireAuth, (req, res) => researchManagementController.saveProject(req, res));
router.post('/research/projects/:id/delete', requireAuth, (req, res) => researchManagementController.deleteProject(req, res));
router.post('/research/student-projects/save', requireAuth, (req, res) => researchManagementController.saveStudentProject(req, res));
router.post('/research/student-projects/:id/delete', requireAuth, (req, res) => researchManagementController.deleteStudentProject(req, res));
router.post('/research/student-outputs/save', requireAuth, (req, res) => researchManagementController.saveStudentOutput(req, res));
router.post('/research/student-outputs/:id/delete', requireAuth, (req, res) => researchManagementController.deleteStudentOutput(req, res));

// Reminders routes (Nhắc việc tổng hợp)
router.get('/reminders', requireAuth, (req, res) => reminderController.index(req, res));
router.post('/dashboard/reminders/:id/complete', requireAuth, (req, res) => dashboardController.completeReminder(req, res));

// Reports routes (Báo cáo tổng hợp)
router.get('/reports', requireAuth, (req, res) => reportController.index(req, res));
router.get('/reports/schedules/new', requireAuth, (req, res) => reportController.create(req, res));
router.post('/reports/schedules', requireAuth, (req, res) => reportController.store(req, res));
router.get('/reports/schedules/:id', requireAuth, (req, res) => reportController.show(req, res));
router.get('/reports/schedules/:id/edit', requireAuth, (req, res) => reportController.edit(req, res));
router.post('/reports/schedules/:id', requireAuth, (req, res) => reportController.update(req, res));
router.post('/reports/schedules/:id/delete', requireAuth, (req, res) => reportController.destroy(req, res));

// Staff routes (Quản lý cán bộ)
router.get('/staff', requireAuth, (req, res) => staffController.index(req, res));
router.get('/staff/create', requireAuth, (req, res) => staffController.create(req, res));
router.post('/staff', requireAuth, (req, res) => staffController.store(req, res));
router.get('/staff/evaluation-criteria', requireAuth, (req, res) => staffController.evaluationCriteria(req, res));
router.get('/staff/export', requireAuth, (req, res) => staffController.exportCsv(req, res));
// Criteria APIs
router.get('/api/staff/evaluation-criteria', requireAuth, (req, res) => staffController.apiListCriteria(req, res));
router.post('/api/staff/evaluation-criteria', requireAuth, (req, res) => staffController.createCriteria(req, res));
router.post('/api/staff/evaluation-criteria/attach', requireAuth, (req, res) => staffController.attachCriteriaToActivePeriod(req, res));

// Asset routes (Quản lý tài sản)
router.get('/assets', requireAuth, (req, res) => assetController.index(req, res));

moduleRoutes.forEach((module) => {
    // Skip legal-documents and examination since we now have real routes
    // Skip modules that now have implemented pages
    const implementedPaths = ['/legal-documents', '/teaching-handbook', '/examination', '/schedule', '/staff', '/assets', '/reports', '/reminders', '/research'];
    if (!implementedPaths.includes(module.path)) {
        router.get(module.path, requireAuth, modulePlaceholder(module));
    }
});

// Teaching handbook (alias) -> point to workbook main page
router.get('/teaching-handbook', requireAuth, (req, res) => {
    return res.redirect(301, '/workbook');
});

// Dashboard routes
router.get('/', requireAuth, (req, res) => {
    res.redirect('/dashboard');
});

router.get('/dashboard', requireAuth, (req, res) => {
    dashboardController.index(req, res);
});

router.get('/dashboard/admin', requireAuth, requireAdmin, (req, res) => {
    dashboardController.adminDashboard(req, res);
});

// User management routes
router.get('/users', requireAuth, (req, res) => {
    userController.index(req, res);
});

router.get('/users/create', requireAuth, requireAdmin, (req, res) => {
    userController.create(req, res);
});

router.post('/users', 
    requireAuth, 
    requireAdmin,
    userValidationRules.create,
    checkValidationResult,
    (req, res) => {
        userController.store(req, res);
    }
);

router.get('/users/:id', requireAuth, (req, res) => {
    userController.show(req, res);
});

router.get('/users/:id/edit', requireAuth, (req, res) => {
    userController.edit(req, res);
});

router.post('/users/:id', 
    requireAuth,
    userValidationRules.update,
    checkValidationResult,
    (req, res) => {
        userController.update(req, res);
    }
);

router.delete('/users/:id', requireAuth, requireAdmin, (req, res) => {
    userController.destroy(req, res);
});

// TODO: Add more routes for other modules
// - Staff management
// - Document management
// - Asset management
// - Project management
// - Schedule management
// - Report management

// Test routes (remove in production)
router.get('/test/upload', requireAuth, (req, res) => {
    res.render('test/upload', {
        title: 'Test Upload File',
        user: req.session.user
    });
});

router.get('/test/db', (req, res) => {
    const db = require('../../config/database');
    db.findMany('SHOW TABLES')
        .then(tables => {
            res.json({
                success: true,
                tables: tables.map(t => Object.values(t)[0]),
                message: 'Database connection successful'
            });
        })
        .catch(error => {
            res.status(500).json({
                success: false,
                error: error.message
            });
        });
});



module.exports = router;