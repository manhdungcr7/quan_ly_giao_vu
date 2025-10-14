const AcademicYear = require('../models/AcademicYear');
const { normalizeAcademicYearCode } = require('../utils/timeScopes');

class AcademicYearController {
    constructor() {
        this.academicYearModel = new AcademicYear();
    }

    async index(req, res) {
        try {
            const academicYears = await this.academicYearModel.findAll({
                orderBy: 'start_date',
                orderDirection: 'DESC'
            });
            res.render('academic-years/index', {
                title: 'Quản lý năm học',
                academicYears
            });
        } catch (error) {
            console.error('Tải danh sách năm học thất bại:', error);
            req.flash('error', 'Không thể tải danh sách năm học. Vui lòng thử lại.');
            res.render('academic-years/index', {
                title: 'Quản lý năm học',
                academicYears: []
            });
        }
    }

    async store(req, res) {
        try {
            const rawCode = req.body.year_code || req.body.yearCode;
            const normalizedCode = normalizeAcademicYearCode(rawCode);
            if (!normalizedCode) {
                req.flash('error', 'Mã năm học không hợp lệ. Định dạng hợp lệ: 2024-2025.');
                return res.redirect('back');
            }

            const existing = await this.academicYearModel.findByCode(normalizedCode);
            if (existing) {
                req.flash('error', `Năm học ${normalizedCode} đã tồn tại.`);
                return res.redirect('back');
            }

            const startDateInput = req.body.start_date || req.body.startDate;
            const endDateInput = req.body.end_date || req.body.endDate;
            const startDate = startDateInput ? new Date(startDateInput) : null;
            const endDate = endDateInput ? new Date(endDateInput) : null;

            if (!startDate || Number.isNaN(startDate.getTime()) || !endDate || Number.isNaN(endDate.getTime())) {
                req.flash('error', 'Ngày bắt đầu hoặc ngày kết thúc không hợp lệ.');
                return res.redirect('back');
            }

            if (startDate > endDate) {
                req.flash('error', 'Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.');
                return res.redirect('back');
            }

            const allowedStatuses = new Set(['active', 'inactive', 'planned']);
            const statusInput = (req.body.status || '').toString().toLowerCase();
            const status = allowedStatuses.has(statusInput) ? statusInput : 'planned';

            const displayName = (req.body.display_name || req.body.displayName || '').trim() || `Năm học ${normalizedCode}`;
            const notes = (req.body.notes || '').trim() || null;

            const createResult = await this.academicYearModel.create({
                year_code: normalizedCode,
                display_name: displayName,
                start_date: startDate.toISOString().slice(0, 10),
                end_date: endDate.toISOString().slice(0, 10),
                status,
                notes
            });

            if (status === 'active' && createResult.insertId) {
                await this.academicYearModel.setExclusiveActive(createResult.insertId);
            }

            req.flash('success', `Đã tạo năm học ${displayName}.`);
            return res.redirect('/academic-years');
        } catch (error) {
            console.error('Tạo năm học thất bại:', error);
            req.flash('error', 'Không thể tạo năm học mới. Vui lòng thử lại.');
            return res.redirect('back');
        }
    }

    async updateStatus(req, res) {
        const { id } = req.params;
        const statusInput = (req.body.status || '').toString().toLowerCase();
        const allowedStatuses = new Set(['active', 'inactive', 'planned']);

        if (!allowedStatuses.has(statusInput)) {
            req.flash('error', 'Trạng thái không hợp lệ.');
            return res.redirect('back');
        }

        try {
            if (statusInput === 'active') {
                await this.academicYearModel.setExclusiveActive(id);
                req.flash('success', 'Đã đặt năm học ở trạng thái hoạt động.');
            } else {
                await this.academicYearModel.update(id, { status: statusInput });
                req.flash('success', 'Đã cập nhật trạng thái năm học.');
            }
        } catch (error) {
            console.error('Cập nhật trạng thái năm học thất bại:', error);
            req.flash('error', 'Không thể cập nhật trạng thái. Vui lòng thử lại.');
        }

        return res.redirect('/academic-years');
    }

    async destroy(req, res) {
        const { id } = req.params;
        try {
            const record = await this.academicYearModel.findById(id);
            if (!record) {
                req.flash('error', 'Không tìm thấy năm học.');
                return res.redirect('/academic-years');
            }

            if (record.status === 'active') {
                req.flash('error', 'Không thể xóa năm học đang hoạt động. Hãy chuyển sang trạng thái khác trước.');
                return res.redirect('/academic-years');
            }

            await this.academicYearModel.delete(id);
            req.flash('success', `Đã xóa năm học ${record.display_name || record.year_code}.`);
        } catch (error) {
            console.error('Xóa năm học thất bại:', error);
            req.flash('error', 'Không thể xóa năm học. Vui lòng thử lại.');
        }

        return res.redirect('/academic-years');
    }
}

module.exports = AcademicYearController;
