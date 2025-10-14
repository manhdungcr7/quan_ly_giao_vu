const User = require('../models/User');
const Staff = require('../models/Staff');
const Document = require('../models/Document');
const Asset = require('../models/Asset');
const Project = require('../models/Project');
const WorkSchedule = require('../models/WorkSchedule');
const Workbook = require('../models/Workbook');
const AcademicYear = require('../models/AcademicYear');
const CONSTANTS = require('../../config/constants');
const { parseScopeParam, resolveScope, buildScopeOptions, normalizeAcademicYearCode } = require('../utils/timeScopes');

class DashboardController {
    constructor() {
        this.userModel = new User();
        this.staffModel = new Staff();
        this.documentModel = new Document();
        this.assetModel = new Asset();
    this.projectModel = new Project();
        // WorkSchedule sử dụng static methods cho lịch cá nhân
        this.academicYearModel = new AcademicYear();
    }

    async prepareScopeContext(scopeParam) {
        const referenceDate = new Date();
        const parsedScope = parseScopeParam(typeof scopeParam === 'string' ? scopeParam : null);

        let academicYearRecords = [];
        try {
            academicYearRecords = await this.academicYearModel.findAll({
                orderBy: 'start_date',
                orderDirection: 'DESC'
            });
        } catch (error) {
            console.warn('Không thể tải danh sách năm học, sử dụng chế độ mặc định.', error);
        }

        const normalizedRecords = Array.isArray(academicYearRecords) ? academicYearRecords : [];
        const normalizedScope = (() => {
            if (parsedScope) {
                return parsedScope;
            }
            const firstActive = normalizedRecords.find((year) => year.status === 'active');
            const fallback = normalizedRecords[0];
            const candidate = firstActive || fallback;
            const normalizedCode = candidate ? normalizeAcademicYearCode(candidate.year_code || candidate.code) : null;
            if (normalizedCode) {
                return {
                    mode: 'academic_year',
                    academicYear: normalizedCode
                };
            }
            return null;
        })();

        const activeScope = resolveScope(normalizedScope, { referenceDate });
        const scopeOptions = buildScopeOptions(referenceDate, {
            yearRecords: normalizedRecords,
            includeInactiveYears: true
        });

        let adjustedScope = activeScope;
        if (activeScope && normalizedRecords.length) {
            const matchingRecord = normalizedRecords.find((year) => {
                const code = normalizeAcademicYearCode(year.year_code || year.code);
                const activeCode = normalizeAcademicYearCode(activeScope.academicYear);
                return code && activeCode && code === activeCode;
            });
            if (matchingRecord) {
                const startDate = new Date(matchingRecord.start_date);
                const endDate = new Date(matchingRecord.end_date);
                adjustedScope = {
                    ...activeScope,
                    label: matchingRecord.display_name || `Năm học ${normalizeAcademicYearCode(matchingRecord.year_code || matchingRecord.code)}`,
                    startDate: Number.isNaN(startDate.getTime()) ? activeScope.startDate : startDate,
                    endDate: Number.isNaN(endDate.getTime()) ? activeScope.endDate : endDate,
                    selectionValue: `academic_year|${normalizeAcademicYearCode(matchingRecord.year_code || matchingRecord.code)}`
                };
            }
        }

        const formatDisplayDate = (value) => {
            const date = value instanceof Date ? value : new Date(value);
            if (Number.isNaN(date.getTime())) {
                return '';
            }
            return date.toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        };

        const scopeRangeLabel = adjustedScope
            ? `${formatDisplayDate(adjustedScope.startDate)} - ${formatDisplayDate(adjustedScope.endDate)}`
            : '';

        return { activeScope: adjustedScope, scopeOptions, scopeRangeLabel, referenceDate };
    }

    // Hiển thị trang dashboard chính
    async index(req, res) {
        const user = req.session.user;
        try {
            const scopeParam = req.query?.scope;
            const { activeScope, scopeOptions, scopeRangeLabel } = await this.prepareScopeContext(scopeParam);
            const timeRange = activeScope ? { startDate: activeScope.startDate, endDate: activeScope.endDate } : null;

            // Thực hiện song song và không fail toàn bộ nếu 1 phần lỗi
            const [statsResult, personalResult, notificationsResult, activitiesResult] = await Promise.allSettled([
                this.getOverallStats({ timeRange, scope: activeScope }),
                this.getPersonalData(user.id),
                this.getNotifications(user.id),
                this.getRecentActivities(user.id)
            ]);

            // Helper chuyển kết quả Promise.allSettled sang giá trị an toàn
            const getValue = (result, fallback) => result.status === 'fulfilled' && result.value ? result.value : fallback;

            const stats = getValue(statsResult, {
                users: {}, documents: {}, assets: {}, projects: {}, schedules: {},
                _error: statsResult.status === 'rejected' ? statsResult.reason?.message : undefined
            });
            const personalData = getValue(personalResult, {
                assignedDocuments: [], upcomingSchedules: [], staffInfo: null, projects: [],
                _error: personalResult.status === 'rejected' ? personalResult.reason?.message : undefined
            });
            const notifications = getValue(notificationsResult, {
                upcomingDeadlines: [], overdueDocuments: [], totalNotifications: 0,
                _error: notificationsResult.status === 'rejected' ? notificationsResult.reason?.message : undefined
            });
            const recentActivities = getValue(activitiesResult, []);

            // Nếu có bất kỳ lỗi nào, log chi tiết nhưng vẫn render dashboard với dữ liệu rỗng
            if (statsResult.status === 'rejected' || personalResult.status === 'rejected' || notificationsResult.status === 'rejected') {
                console.warn('Dashboard partial load with errors:', {
                    statsError: statsResult.status === 'rejected' ? statsResult.reason : null,
                    personalError: personalResult.status === 'rejected' ? personalResult.reason : null,
                    notificationsError: notificationsResult.status === 'rejected' ? notificationsResult.reason : null
                });
            }

            const viewStats = {
                totalStaff: Number(stats?.staff?.total_staff || stats?.users?.total_users || stats?.users?.totalStaff || 0),
                totalDocuments: Number(stats?.documents?.total_documents || 0),
                completedDocuments: Number(stats?.documents?.completed_count || 0),
                pendingDocuments: Number(stats?.documents?.pending_count || 0),
                processingDocuments: Number(stats?.documents?.processing_count || 0),
                activeProjects: Number(stats?.projects?.active_count || stats?.projects?.activeProjects || 0),
                totalProjects: Number(stats?.projects?.total_projects || stats?.projects?.total || 0),
                totalAssets: Number(stats?.assets?.total_assets || 0),
                availableAssets: Number(stats?.assets?.available_count || 0),
                totalSchedules: Number(stats?.schedules?.total_schedules || 0),
                upcomingSchedules: Number(stats?.schedules?.today_count || 0)
            };

            const recentDocuments = Array.isArray(personalData?.assignedDocuments) ? personalData.assignedDocuments.slice(0, 5) : [];
            const recentProjects = Array.isArray(personalData?.projects) ? personalData.projects.slice(0, 5) : [];

            const summaryCards = [
                {
                    title: 'Tổng quan',
                    value: viewStats.totalStaff + viewStats.totalDocuments + viewStats.totalProjects,
                    subtitle: 'Tổng số thực thể được quản lý',
                    icon: 'fa-layer-group',
                    color: 'primary'
                },
                {
                    title: 'Cán bộ',
                    value: viewStats.totalStaff,
                    subtitle: 'Cán bộ đang hoạt động',
                    icon: 'fa-users',
                    color: 'info'
                },
                {
                    title: 'Tài liệu',
                    value: viewStats.totalDocuments,
                    subtitle: `${viewStats.completedDocuments} hoàn tất`,
                    icon: 'fa-file-lines',
                    color: 'success'
                },
                {
                    title: 'Dự án',
                    value: viewStats.activeProjects,
                    subtitle: `${viewStats.totalProjects} tổng số`,
                    icon: 'fa-diagram-project',
                    color: 'warning'
                },
                {
                    title: 'Tài sản',
                    value: viewStats.totalAssets,
                    subtitle: `${viewStats.availableAssets} sẵn dùng`,
                    icon: 'fa-boxes-stacked',
                    color: 'purple'
                },
                {
                    title: 'Lịch công tác',
                    value: viewStats.totalSchedules,
                    subtitle: `${viewStats.upcomingSchedules} hôm nay`,
                    icon: 'fa-calendar-days',
                    color: 'danger'
                }
            ];

            const calcPercent = (completed, total) => {
                if (!total || total <= 0) return 0;
                const percentage = Math.round((completed / total) * 100);
                return Number.isFinite(percentage) ? Math.min(100, Math.max(0, percentage)) : 0;
            };

            const progressOverview = [
                {
                    title: 'Văn bản',
                    value: `${viewStats.completedDocuments}/${viewStats.totalDocuments}`,
                    percent: calcPercent(viewStats.completedDocuments, viewStats.totalDocuments),
                    color: 'primary'
                },
                {
                    title: 'Dự án',
                    value: `${viewStats.activeProjects}/${viewStats.totalProjects}`,
                    percent: calcPercent(viewStats.activeProjects, viewStats.totalProjects || viewStats.activeProjects || 0),
                    color: 'success'
                },
                {
                    title: 'Lịch công tác tuần này',
                    value: `${viewStats.upcomingSchedules}/${viewStats.totalSchedules}`,
                    percent: calcPercent(viewStats.upcomingSchedules, viewStats.totalSchedules || viewStats.upcomingSchedules || 0),
                    color: 'warning'
                }
            ];

            const quickActions = [
                { label: 'Văn bản', icon: 'fa-file-circle-plus', href: '/documents', color: 'primary' },
                { label: 'Lịch công tác', icon: 'fa-calendar-plus', href: '/schedule', color: 'success' },
                { label: 'Tài sản', icon: 'fa-box-open', href: '/assets', color: 'info' },
                { label: 'Báo cáo', icon: 'fa-chart-pie', href: '/reports', color: 'warning' }
            ];

            if ((user?.role_name || user?.roleName || '').toString().toLowerCase() === CONSTANTS.ROLES.ADMIN) {
                quickActions.unshift({ label: 'Người dùng', icon: 'fa-user-shield', href: '/users', color: 'danger' });
            }

            const normalizeDeadlineLabel = (value) => {
                if (!value) return null;
                try {
                    return new Date(value).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    });
                } catch (error) {
                    return value;
                }
            };

            const computeRelativeLabel = (item) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                let diff = null;
                if (typeof item.days_left === 'number') {
                    diff = item.days_left;
                } else if (typeof item.days_overdue === 'number') {
                    diff = -Math.abs(item.days_overdue);
                } else if (item.processing_deadline) {
                    try {
                        const deadline = new Date(item.processing_deadline);
                        deadline.setHours(0, 0, 0, 0);
                        diff = Math.round((deadline.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
                    } catch (error) {
                        diff = null;
                    }
                }

                if (diff === null || Number.isNaN(diff)) {
                    return { label: 'Chưa xác định hạn', days: null };
                }

                if (diff < 0) {
                    return { label: `Quá hạn ${Math.abs(diff)} ngày`, days: diff };
                }
                if (diff === 0) {
                    return { label: 'Đến hạn hôm nay', days: diff };
                }
                if (diff === 1) {
                    return { label: 'Còn 1 ngày', days: diff };
                }
                return { label: `Còn ${diff} ngày`, days: diff };
            };

            const canQuickComplete = (doc, currentUser) => {
                if (!doc) return false;
                if (!currentUser) return false;
                if (currentUser.role_name === 'admin') return true;
                return doc.assigned_to === currentUser.id || doc.created_by === currentUser.id;
            };

            const reminders = [
                ...(notifications?.upcomingDeadlines || []).map((item) => {
                    const relative = computeRelativeLabel(item);
                    const isCompleted = item.status === 'completed';
                    return {
                        id: item.id,
                        title: item.title || item.document_number || 'Tài liệu',
                        description: item.content_summary || 'Tài liệu sắp đến hạn xử lý',
                        badge: isCompleted ? 'Đã hoàn thành' : 'Sắp hết hạn',
                        badgeColor: isCompleted ? 'success' : 'warning',
                        deadline: item.processing_deadline,
                        deadlineLabel: normalizeDeadlineLabel(item.processing_deadline),
                        relativeLabel: relative.label,
                        isOverdue: relative.days !== null && relative.days < 0,
                        priority: item.priority || 'medium',
                        status: item.status,
                        canComplete: !isCompleted && canQuickComplete(item, user)
                    };
                }),
                ...(notifications?.overdueDocuments || []).map((item) => {
                    const relative = computeRelativeLabel(item);
                    const isCompleted = item.status === 'completed';
                    return {
                        id: item.id,
                        title: item.title || item.document_number || 'Tài liệu',
                        description: 'Tài liệu đã quá hạn, cần xử lý ngay',
                        badge: isCompleted ? 'Đã hoàn thành' : 'Quá hạn',
                        badgeColor: isCompleted ? 'success' : 'danger',
                        deadline: item.processing_deadline,
                        deadlineLabel: normalizeDeadlineLabel(item.processing_deadline),
                        relativeLabel: relative.label,
                        isOverdue: true,
                        priority: item.priority || 'high',
                        status: item.status,
                        canComplete: !isCompleted && canQuickComplete(item, user)
                    };
                })
            ].slice(0, 5);

            const scheduleEvents = Array.isArray(personalData?.upcomingSchedules)
                ? personalData.upcomingSchedules.slice(0, 5).map(event => ({
                    title: event.title || event.subject || 'Lịch làm việc',
                    timeRange: event.start_datetime && event.end_datetime
                        ? `${new Date(event.start_datetime).toLocaleString('vi-VN')} - ${new Date(event.end_datetime).toLocaleTimeString('vi-VN')}`
                        : event.start_datetime || '',
                    location: event.location,
                    type: event.type_name || 'Sự kiện'
                }))
                : [];

            const activityTimeline = Array.isArray(recentActivities)
                ? recentActivities.map(item => ({
                    title: item.action,
                    description: item.description,
                    time: item.time ? new Date(item.time).toLocaleString('vi-VN') : '',
                    type: item.type || 'activity'
                }))
                : [];

            const chartData = {
                labels: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6'],
                datasets: [
                    {
                        label: 'Tài liệu tải lên',
                        data: [12, 19, 8, 15, 22, 18],
                        borderColor: '#4e73df',
                        backgroundColor: 'rgba(78, 115, 223, 0.1)'
                    }
                ]
            };

            res.render('dashboard/main', {
                title: 'Trang chủ',
                appName: 'quản lý giáo vụ Khoa',
                isAuthenticated: true,
                currentPath: req.path,
                isAdmin: user.role === 'admin',
                user,
                stats: viewStats,
                personalData,
                notifications,
                recentActivities: activityTimeline,
                recentDocuments,
                recentProjects,
                summaryCards,
                progressOverview,
                quickActions,
                reminders,
                scheduleEvents,
                activeScope,
                scopeOptions,
                scopeRangeLabel,
                scopeSelectionValue: activeScope?.selectionValue,
                chartData,
                success: req.flash('success'),
                error: req.flash('error')
            });
        } catch (error) {
            console.error('Fatal error in DashboardController index (should rarely happen):', error);
            return res.status(500).render('error', {
                title: 'Lỗi hệ thống',
                message: 'Đã xảy ra lỗi nghiêm trọng khi tải dashboard'
            });
        }
    }

    async completeReminder(req, res) {
        try {
            const documentId = Number(req.params.id);
            if (!documentId || Number.isNaN(documentId)) {
                return res.status(400).json({ success: false, message: 'Mã nhắc việc không hợp lệ' });
            }

            const currentUser = req.session?.user;
            if (!currentUser) {
                return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập lại để tiếp tục' });
            }

            const document = await this.documentModel.findById(documentId);
            if (!document) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy tài liệu' });
            }

            const allowed = currentUser.role_name === 'admin' || document.assigned_to === currentUser.id || document.created_by === currentUser.id;
            if (!allowed) {
                return res.status(403).json({ success: false, message: 'Bạn không được phép cập nhật tài liệu này' });
            }

            if (document.status === 'completed') {
                return res.json({ success: true, message: 'Tài liệu đã được đánh dấu hoàn thành trước đó' });
            }

            await this.documentModel.updateStatus(documentId, 'completed', currentUser.id);

            return res.json({ success: true, message: 'Đã đánh dấu hoàn thành nhắc việc', status: 'completed' });
        } catch (error) {
            console.error('Error in DashboardController.completeReminder:', error);
            return res.status(500).json({ success: false, message: 'Không thể cập nhật trạng thái nhắc việc' });
        }
    }

    // Lấy thống kê tổng quan hệ thống
    async getOverallStats(options = {}) {
        try {
            const timeRange = options?.timeRange;

            // Thực hiện song song nhưng bắt lỗi riêng từng phần để không làm hỏng toàn bộ dashboard
            const [userStatsR, staffStatsR, documentStatsR, assetStatsR, projectStatsR, scheduleStatsR] = await Promise.allSettled([
                this.userModel.getStats(),
                this.staffModel.getStats(),
                this.documentModel.getStats(timeRange ? { timeRange } : undefined),
                this.assetModel.getStats(),
                this.projectModel.getStats(timeRange ? { timeRange } : undefined),
                WorkSchedule.getStats(timeRange ? { timeRange } : undefined)
            ]);

            const safe = (r) => (r.status === 'fulfilled' ? r.value : {});
            if ([userStatsR, staffStatsR, documentStatsR, assetStatsR, projectStatsR, scheduleStatsR].some(r => r.status === 'rejected')) {
                console.warn('getOverallStats partial errors:', {
                    user: userStatsR.status === 'rejected' ? userStatsR.reason?.message : null,
                    staff: staffStatsR.status === 'rejected' ? staffStatsR.reason?.message : null,
                    document: documentStatsR.status === 'rejected' ? documentStatsR.reason?.message : null,
                    asset: assetStatsR.status === 'rejected' ? assetStatsR.reason?.message : null,
                    project: projectStatsR.status === 'rejected' ? projectStatsR.reason?.message : null,
                    schedule: scheduleStatsR.status === 'rejected' ? scheduleStatsR.reason?.message : null
                });
            }

            return {
                users: safe(userStatsR),
                staff: safe(staffStatsR),
                documents: safe(documentStatsR),
                assets: safe(assetStatsR),
                projects: safe(projectStatsR),
                schedules: safe(scheduleStatsR)
            };
        } catch (error) {
            console.error('Error getting overall stats:', error);
            // Trả về object rỗng thay vì null để tránh lỗi view
            return { users: {}, documents: {}, assets: {}, projects: {}, schedules: {}, _error: error.message };
        }
    }

    // Lấy dữ liệu cá nhân của user
    async getPersonalData(userId) {
        try {
            // Lấy tài liệu được giao
            const assignedDocuments = await this.documentModel.getAssignedDocuments(userId, 'processing');

            // Lấy lịch sắp tới - dùng WorkSchedule thay vì Schedule
            const now = new Date();
            const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            const upcomingSchedules = await WorkSchedule.getEventsBetween(
                now.toISOString(),
                nextWeek.toISOString(),
                userId
            );

            // Lấy thông tin staff nếu có
            let staffInfo = null;
            let staffProjects = [];
            try {
                staffInfo = await this.staffModel.findByUserId(userId);
                if (staffInfo) {
                    staffProjects = await this.projectModel.getProjectsByStaff(staffInfo.id);
                }
            } catch (error) {
                // User không phải là staff
                console.log('User is not a staff member:', userId);
            }

            return {
                assignedDocuments: assignedDocuments.slice(0, 5), // Top 5
                upcomingSchedules: upcomingSchedules.slice(0, 5), // Top 5
                staffInfo: staffInfo,
                projects: staffProjects.slice(0, 3) // Top 3
            };
        } catch (error) {
            console.error('Error getting personal data:', error);
            return {
                assignedDocuments: [],
                upcomingSchedules: [],
                staffInfo: null,
                projects: []
            };
        }
    }

    // Lấy thông báo và nhắc nhở
    async getNotifications(userId) {
        try {
            // Lấy tài liệu sắp hết hạn
            const upcomingDeadlines = await this.documentModel.getUpcomingDeadlines(3);

            // Lấy tài liệu quá hạn
            const overdueDocuments = await this.documentModel.getOverdueDocuments();

            const pendingWorkbookApprovalsRaw = await Workbook.getPendingApprovalsForApprover(userId, 5);

            const formatDate = (value) => {
                if (!value) return null;
                try {
                    return new Date(value).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    });
                } catch (error) {
                    return value;
                }
            };

            const formatDateTime = (value) => {
                if (!value) return null;
                try {
                    return new Date(value).toLocaleString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                } catch (error) {
                    return value;
                }
            };

            const formatWeekRange = (start, end) => {
                const startLabel = formatDate(start);
                const endLabel = formatDate(end);
                if (!startLabel && !endLabel) {
                    return '';
                }
                if (!startLabel) {
                    return `Đến ${endLabel}`;
                }
                if (!endLabel) {
                    return `Từ ${startLabel}`;
                }
                return `${startLabel} - ${endLabel}`;
            };

            // Lọc chỉ lấy những tài liệu liên quan đến user
            const userUpcomingDeadlines = upcomingDeadlines.filter(doc => 
                doc.assigned_to === userId || doc.created_by === userId
            );

            const userOverdueDocuments = overdueDocuments.filter(doc => 
                doc.assigned_to === userId || doc.created_by === userId
            );

            const pendingWorkbookApprovals = pendingWorkbookApprovalsRaw.map(workbook => ({
                type: 'workbook',
                id: workbook.id,
                title: workbook.owner_name ? `${workbook.owner_name} · Sổ tay tuần` : 'Sổ tay công tác',
                content_summary: `Tuần: ${formatWeekRange(workbook.week_start, workbook.week_end) || 'Chưa xác định'}`,
                processing_deadline: formatDate(workbook.week_end),
                approval_requested_at: formatDateTime(workbook.approval_requested_at),
                badgeColor: 'is-info',
                badge: 'Chờ duyệt',
                link: `/workbook/${workbook.id}`
            }));

            return {
                upcomingDeadlines: userUpcomingDeadlines,
                overdueDocuments: userOverdueDocuments,
                pendingWorkbooks: pendingWorkbookApprovals,
                totalNotifications: userUpcomingDeadlines.length + userOverdueDocuments.length + pendingWorkbookApprovals.length
            };
        } catch (error) {
            console.error('Error getting notifications:', error);
            return {
                upcomingDeadlines: [],
                overdueDocuments: [],
                totalNotifications: 0
            };
        }
    }

    // Lấy hoạt động gần đây (mock data - có thể implement với activity_logs)
    async getRecentActivities(userId) {
        try {
            // TODO: Implement với bảng activity_logs
            return [
                {
                    action: 'Tạo tài liệu mới',
                    description: 'Công văn số 123/CV-ABC',
                    time: new Date(),
                    type: 'document'
                },
                {
                    action: 'Cập nhật dự án',
                    description: 'Dự án nghiên cứu ABC',
                    time: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
                    type: 'project'
                }
            ];
        } catch (error) {
            console.error('Error getting recent activities:', error);
            return [];
        }
    }

    // API endpoint để lấy dữ liệu thống kê cho charts
    async getStatsAPI(req, res) {
        try {
            const { type, period, scope } = req.query;
            const { activeScope } = await this.prepareScopeContext(scope);
            const timeRange = activeScope ? { startDate: activeScope.startDate, endDate: activeScope.endDate } : null;

            let data = {};

            switch (type) {
                case 'documents':
                    data = await this.getDocumentStats(period);
                    break;
                case 'projects':
                    data = await this.getProjectStatsChart(period);
                    break;
                case 'users':
                    data = await this.getUserStatsChart(period);
                    break;
                default:
                    data = await this.getOverallStats({ timeRange, scope: activeScope });
            }

            res.json({
                success: true,
                data: data
            });

        } catch (error) {
            console.error('Error in DashboardController getStatsAPI:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi lấy dữ liệu thống kê'
            });
        }
    }

    // Lấy thống kê tài liệu cho chart
    async getDocumentStats(period = '30') {
        try {
            const sql = `
                SELECT 
                    DATE(created_at) as date,
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
                    SUM(CASE WHEN direction = 'incoming' THEN 1 ELSE 0 END) as incoming,
                    SUM(CASE WHEN direction = 'outgoing' THEN 1 ELSE 0 END) as outgoing
                FROM documents 
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
                GROUP BY DATE(created_at)
                ORDER BY date ASC
            `;

            return await this.documentModel.query(sql, [parseInt(period)]);
        } catch (error) {
            console.error('Error getting document stats:', error);
            return [];
        }
    }

    // Lấy thống kê dự án cho chart
    async getProjectStatsChart(period = '30') {
        try {
            const sql = `
                SELECT 
                    status,
                    COUNT(*) as count
                FROM projects 
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
                GROUP BY status
            `;

            return await this.projectModel.query(sql, [parseInt(period)]);
        } catch (error) {
            console.error('Error getting project stats:', error);
            return [];
        }
    }

    // Lấy thống kê user cho chart
    async getUserStatsChart(period = '30') {
        try {
            const sql = `
                SELECT 
                    DATE(created_at) as date,
                    COUNT(*) as new_users,
                    SUM(CASE WHEN last_login >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as active_users
                FROM users 
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
                GROUP BY DATE(created_at)
                ORDER BY date ASC
            `;

            return await this.userModel.query(sql, [parseInt(period)]);
        } catch (error) {
            console.error('Error getting user stats:', error);
            return [];
        }
    }

    // Trang dashboard cho admin
    async adminDashboard(req, res) {
        try {
            // Kiểm tra quyền admin
            if (req.session.user.role_name !== 'admin') {
                req.flash('error', 'Không có quyền truy cập');
                return res.redirect('/dashboard');
            }

            // Lấy thống kê chi tiết cho admin
            const adminStats = await this.getAdminStats();

            res.render('dashboard/admin', {
                title: 'Admin Dashboard',
                user: req.session.user,
                stats: adminStats,
                success: req.flash('success'),
                error: req.flash('error')
            });

        } catch (error) {
            console.error('Error in DashboardController adminDashboard:', error);
            res.status(500).render('error', {
                title: 'Lỗi hệ thống',
                message: 'Đã xảy ra lỗi khi tải admin dashboard'
            });
        }
    }

    // Lấy thống kê chi tiết cho admin
    async getAdminStats() {
        try {
            const [
                overallStats,
                staffStatsByDept,
                documentStatsByType,
                systemHealth
            ] = await Promise.all([
                this.getOverallStats(),
                this.staffModel.getStatsByDepartment(),
                this.documentModel.getStatsByType(),
                this.getSystemHealth()
            ]);

            return {
                overall: overallStats,
                staffByDepartment: staffStatsByDept,
                documentsByType: documentStatsByType,
                systemHealth: systemHealth
            };
        } catch (error) {
            console.error('Error getting admin stats:', error);
            return null;
        }
    }

    // Kiểm tra tình trạng hệ thống
    async getSystemHealth() {
        try {
            // Kiểm tra database connection
            const dbHealth = await this.userModel.db.testConnection();

            // Tính toán disk usage (mock)
            const diskUsage = Math.floor(Math.random() * 100);

            // Tính toán memory usage (mock)
            const memoryUsage = Math.floor(Math.random() * 100);

            return {
                database: dbHealth ? 'healthy' : 'error',
                diskUsage: diskUsage,
                memoryUsage: memoryUsage,
                status: dbHealth && diskUsage < 90 && memoryUsage < 90 ? 'healthy' : 'warning'
            };
        } catch (error) {
            console.error('Error getting system health:', error);
            return {
                database: 'error',
                diskUsage: 0,
                memoryUsage: 0,
                status: 'error'
            };
        }
    }
}

module.exports = DashboardController;