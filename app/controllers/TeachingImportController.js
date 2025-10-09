const fs = require('fs');
const xlsx = require('xlsx');
const moment = require('moment');

const WorkSchedule = require('../models/WorkSchedule');
const TeachingImportService = require('../services/TeachingImportService');
const db = require('../../config/database');

const REQUIRED_FIELDS = [
    { key: 'title', label: 'Tên môn / chủ đề' },
    { key: 'date', label: 'Ngày' },
    { key: 'start_time', label: 'Giờ bắt đầu' },
    { key: 'end_time', label: 'Giờ kết thúc' }
];

const OPTIONAL_FIELDS = [
    { key: 'class_name', label: 'Lớp / Nhóm học' },
    { key: 'lecturer_name', label: 'Giảng viên' },
    { key: 'organizer_email', label: 'Email giảng viên (để gán tài khoản)' },
    { key: 'organizer_id', label: 'ID người tổ chức' },
    { key: 'location', label: 'Địa điểm' },
    { key: 'room', label: 'Phòng học' },
    { key: 'building', label: 'Tòa nhà' },
    { key: 'notes', label: 'Ghi chú' }
];

const ALL_FIELDS = [...REQUIRED_FIELDS, ...OPTIONAL_FIELDS];

function buildWorkbookTemplate() {
    const headers = ALL_FIELDS.map(field => field.label);
    const sampleRow = [
        'Lập trình web - Buổi 1',
        '06/10/2025',
        '13:30',
        '15:30',
        'VB2C-IT01',
        'ThS. Nguyễn Văn A',
        'giaovien@example.com',
        '',
        'Cơ sở C',
        'C102',
        'Tòa nhà K',
        'Ôn tập ES6 + Demo dự án'
    ];

    const worksheet = xlsx.utils.aoa_to_sheet([headers, sampleRow]);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'LichGiang');
    return workbook;
}

function readWorksheet(filePath) {
    const workbook = xlsx.readFile(filePath, {
        cellDates: true,
        dateNF: 'dd/mm/yyyy'
    });

    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
        throw new Error('File không chứa sheet hợp lệ');
    }

    const worksheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(worksheet, {
        defval: '',
        raw: true,
        blankrows: false
    });

    return {
        rows,
        columns: rows.length > 0 ? Object.keys(rows[0]) : []
    };
}

function normalizeDate(value) {
    if (!value) return null;
    if (value instanceof Date) {
        return moment(value).format('YYYY-MM-DD');
    }

    const numericValue = Number(value);
    if (!Number.isNaN(numericValue) && value !== true && value !== false && numericValue > 0) {
        const parsed = xlsx.SSF.parse_date_code(numericValue);
        if (parsed && parsed.y) {
            const date = moment({
                year: parsed.y,
                month: parsed.m - 1,
                day: parsed.d
            });
            if (date.isValid()) {
                return date.format('YYYY-MM-DD');
            }
        }
    }

    const str = String(value).trim();
    if (!str) return null;
    const formats = ['DD/MM/YYYY', 'D/M/YYYY', 'YYYY-MM-DD', 'DD-MM-YYYY', 'D-M-YYYY'];
    for (const format of formats) {
        const parsed = moment(str, format, true);
        if (parsed.isValid()) {
            return parsed.format('YYYY-MM-DD');
        }
    }
    const parsed = moment(str);
    return parsed.isValid() ? parsed.format('YYYY-MM-DD') : null;
}

function normalizeTime(value) {
    if (value === null || value === undefined || value === '') return null;

    if (value instanceof Date) {
        return moment(value).format('HH:mm');
    }

    const numericValue = Number(value);
    if (!Number.isNaN(numericValue) && value !== true && value !== false) {
        const parsed = xlsx.SSF.parse_date_code(numericValue);
        if (parsed) {
            const hours = Number(parsed.H ?? parsed.h ?? 0);
            const minutes = Number(parsed.M ?? 0);
            if (!Number.isNaN(hours) && !Number.isNaN(minutes)) {
                return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
            }
        }

        const totalMinutes = Math.round(numericValue * 24 * 60);
        if (Number.isFinite(totalMinutes)) {
            const hours = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
            const minutes = (totalMinutes % 60).toString().padStart(2, '0');
            return `${hours}:${minutes}`;
        }
    }

    const str = String(value).trim().replace('.', ':');
    if (!str) return null;
    const formats = ['HH:mm', 'H:mm', 'hh:mm A', 'h:mm A'];
    for (const format of formats) {
        const parsed = moment(str, format, true);
        if (parsed.isValid()) {
            return parsed.format('HH:mm');
        }
    }
    const parsed = moment(str);
    return parsed.isValid() ? parsed.format('HH:mm') : null;
}

function buildDateTime(dateStr, timeStr) {
    if (!dateStr || !timeStr) return null;
    const combined = moment(`${dateStr} ${timeStr}`, 'YYYY-MM-DD HH:mm');
    return combined.isValid() ? combined.format('YYYY-MM-DD HH:mm:ss') : null;
}

async function resolveOrganizerId({ organizerEmail, organizerId }, fallbackUserId) {
    if (organizerId) {
        const parsedId = parseInt(organizerId, 10);
        if (!Number.isNaN(parsedId) && parsedId > 0) {
            return parsedId;
        }
    }

    if (organizerEmail) {
        const user = await db.findOne('SELECT id FROM users WHERE email = ? AND is_active = 1', [organizerEmail]);
        if (user) {
            return user.id;
        }
    }

    if (fallbackUserId) {
        const parsedFallback = parseInt(fallbackUserId, 10);
        if (!Number.isNaN(parsedFallback) && parsedFallback > 0) {
            return parsedFallback;
        }
    }

    return null;
}

class TeachingImportController {
    async downloadTemplate(req, res) {
        try {
            const workbook = buildWorkbookTemplate();
            const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
            res.setHeader('Content-Disposition', 'attachment; filename="mau_lich_giang.xlsx"');
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.send(buffer);
        } catch (error) {
            console.error('Download template error:', error);
            res.status(500).json({ error: 'Không thể tạo file mẫu' });
        }
    }

    async preview(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'Vui lòng chọn file Excel (.xlsx)' });
            }

            TeachingImportService.cleanupExpiredJobs();

            const { rows, columns } = readWorksheet(req.file.path);
            if (!rows.length) {
                try {
                    fs.unlinkSync(req.file.path);
                } catch (cleanupError) {
                    console.error('Cleanup empty upload error:', cleanupError);
                }
                return res.status(400).json({ error: 'File không chứa dữ liệu' });
            }

            const jobId = TeachingImportService.createJob(req.file.path, req.file.originalname, columns, rows.length);

            res.json({
                jobId,
                fileName: req.file.originalname,
                columns,
                rowCount: rows.length,
                sample: rows.slice(0, 10)
            });
        } catch (error) {
            console.error('Preview import error:', error);
            if (req.file && req.file.path) {
                try {
                    fs.unlinkSync(req.file.path);
                } catch (unlinkError) {
                    console.error('Failed to remove upload:', unlinkError);
                }
            }
            res.status(500).json({ error: error.message || 'Không thể đọc dữ liệu từ file Excel' });
        }
    }

    async commit(req, res) {
        try {
            const { jobId, mapping, options = {} } = req.body;
            if (!jobId || !mapping) {
                return res.status(400).json({ error: 'Thiếu thông tin job hoặc mapping' });
            }

            const job = TeachingImportService.getJob(jobId);
            if (!job) {
                return res.status(404).json({ error: 'Phiên import đã hết hạn, vui lòng tải lại file' });
            }

            const handlerUserId = req.session.user?.id;
            if (!handlerUserId) {
                return res.status(401).json({ error: 'Phiên đăng nhập đã hết hạn' });
            }

            for (const field of REQUIRED_FIELDS) {
                if (!mapping[field.key]) {
                    return res.status(400).json({ error: `Thiếu mapping cho trường bắt buộc: ${field.label}` });
                }
            }

            TeachingImportService.cleanupExpiredJobs();

            const { rows } = readWorksheet(job.filePath);
            if (!rows.length) {
                TeachingImportService.removeJob(jobId);
                return res.status(400).json({ error: 'File không chứa dữ liệu' });
            }

            const results = {
                total: rows.length,
                success: 0,
                errors: []
            };

            for (let index = 0; index < rows.length; index += 1) {
                const row = rows[index];
                const rowNumber = index + 2; // +2 vì đã có header

                try {
                    const title = String(row[mapping.title] || '').trim();
                    const date = normalizeDate(row[mapping.date]);
                    const startTime = normalizeTime(row[mapping.start_time]);
                    const endTime = normalizeTime(row[mapping.end_time]);

                    if (!title) {
                        throw new Error('Thiếu tên môn / chủ đề');
                    }
                    if (!date) {
                        throw new Error('Ngày không hợp lệ');
                    }
                    if (!startTime || !endTime) {
                        throw new Error('Giờ bắt đầu/kết thúc không hợp lệ');
                    }

                    const startDatetime = buildDateTime(date, startTime);
                    const endDatetime = buildDateTime(date, endTime);

                    if (!startDatetime || !endDatetime) {
                        throw new Error('Không thể ghép thời gian bắt đầu/kết thúc');
                    }

                    if (moment(endDatetime, 'YYYY-MM-DD HH:mm:ss').isSameOrBefore(moment(startDatetime, 'YYYY-MM-DD HH:mm:ss'))) {
                        throw new Error('Giờ kết thúc phải sau giờ bắt đầu');
                    }

                    const className = mapping.class_name ? String(row[mapping.class_name] || '').trim() : '';
                    const lecturerName = mapping.lecturer_name ? String(row[mapping.lecturer_name] || '').trim() : '';
                    const organizerEmail = mapping.organizer_email ? String(row[mapping.organizer_email] || '').trim() : '';
                    const organizerIdRaw = mapping.organizer_id ? row[mapping.organizer_id] : null;
                    const organizerIdValue = organizerIdRaw ? parseInt(String(organizerIdRaw).trim(), 10) : null;
                    const location = mapping.location ? String(row[mapping.location] || '').trim() : '';
                    const room = mapping.room ? String(row[mapping.room] || '').trim() : '';
                    const building = mapping.building ? String(row[mapping.building] || '').trim() : '';
                    const notes = mapping.notes ? String(row[mapping.notes] || '').trim() : '';

                    const organizerId = await resolveOrganizerId({
                        organizerEmail,
                        organizerId: organizerIdValue && Number.isFinite(organizerIdValue) ? organizerIdValue : null
                    }, handlerUserId);

                    if (!organizerId) {
                        throw new Error('Không tìm thấy người tổ chức phù hợp');
                    }

                    const conflicts = await WorkSchedule.checkConflicts(
                        organizerId,
                        startDatetime,
                        endDatetime,
                        null,
                        {
                            eventType: 'teaching',
                            room,
                            location
                        }
                    );

                    const allowConflicts = ['true', true, 1, '1'].includes(options?.allowConflicts);
                    if (conflicts.length && !allowConflicts) {
                        const conflictTitles = conflicts.map(item => item.title).join(', ');
                        throw new Error(`Trùng lịch với: ${conflictTitles}`);
                    }

                    const tags = {};
                    if (className) tags.class = className;
                    if (lecturerName) tags.lecturer = lecturerName;

                    const descriptionParts = [];
                    if (notes) descriptionParts.push(notes);
                    if (className) descriptionParts.push(`Lớp: ${className}`);
                    if (lecturerName) descriptionParts.push(`Giảng viên: ${lecturerName}`);
                    const locationParts = [room, building, location].filter(part => part)
                        .join(' - ');
                    if (locationParts) {
                        descriptionParts.push(`Địa điểm: ${locationParts}`);
                    }
                    const description = descriptionParts.join('\n');

                    await WorkSchedule.create({
                        title,
                        description: description || null,
                        event_type: 'teaching',
                        start_datetime: startDatetime,
                        end_datetime: endDatetime,
                        is_all_day: false,
                        timezone: 'Asia/Ho_Chi_Minh',
                        recurrence_rule: null,
                        recurrence_end_date: null,
                        location: location || null,
                        room: room || null,
                        building: building || null,
                        online_meeting_url: null,
                        organizer_id,
                        status: 'confirmed',
                        priority: 'normal',
                        color: null,
                        icon: null,
                        tags: Object.keys(tags).length ? tags : null,
                        reminder_minutes: 30,
                        attachments: null,
                        notes: notes || null,
                        public_notes: null,
                        created_by: handlerUserId
                    });

                    results.success += 1;
                } catch (error) {
                    results.errors.push({
                        row: rowNumber,
                        message: error.message || 'Dòng dữ liệu không hợp lệ'
                    });
                }
            }

            TeachingImportService.removeJob(jobId);

            res.json({
                total: results.total,
                success: results.success,
                failed: results.errors.length,
                errors: results.errors
            });
        } catch (error) {
            console.error('Commit import error:', error);
            res.status(500).json({ error: error.message || 'Không thể nhập dữ liệu' });
        }
    }

    async cancel(req, res) {
        const { jobId } = req.params;
        if (!jobId) {
            return res.status(400).json({ error: 'Thiếu jobId' });
        }

        TeachingImportService.removeJob(jobId);
        res.json({ success: true });
    }
}

module.exports = new TeachingImportController();
