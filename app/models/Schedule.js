const BaseModel = require('./BaseModel');

class Schedule extends BaseModel {
    constructor() {
        super('work_schedules');
    }

    // Lấy lịch làm việc với thông tin chi tiết
    async findWithDetails(id) {
        try {
            const sql = `
                SELECT ws.*, 
                       st.name as type_name, st.color as type_color,
                       u_organizer.full_name as organizer_name,
                       u_created.full_name as created_by_name
                FROM work_schedules ws
                LEFT JOIN schedule_types st ON ws.type_id = st.id
                LEFT JOIN users u_organizer ON ws.organizer_id = u_organizer.id
                LEFT JOIN users u_created ON ws.created_by = u_created.id
                WHERE ws.id = ?
            `;
            return await this.db.findOne(sql, [id]);
        } catch (error) {
            console.error('Error in Schedule findWithDetails:', error);
            throw error;
        }
    }

    // Lấy lịch làm việc theo khoảng thời gian
    async getSchedulesByDateRange(startDate, endDate, userId = null) {
        try {
            let sql = `
                SELECT ws.*, 
                       st.name as type_name, st.color as type_color,
                       u_organizer.full_name as organizer_name
                FROM work_schedules ws
                LEFT JOIN schedule_types st ON ws.type_id = st.id
                LEFT JOIN users u_organizer ON ws.organizer_id = u_organizer.id
                WHERE ws.start_datetime >= ? AND ws.start_datetime <= ?
            `;
            const params = [startDate, endDate];

            if (userId) {
                sql += ` AND (ws.created_by = ? OR ws.organizer_id = ? OR 
                        ws.id IN (SELECT schedule_id FROM schedule_participants WHERE user_id = ?))`;
                params.push(userId, userId, userId);
            }

            sql += ' ORDER BY ws.start_datetime ASC';

            return await this.db.findMany(sql, params);
        } catch (error) {
            console.error('Error in Schedule getSchedulesByDateRange:', error);
            throw error;
        }
    }

    // Lấy lịch của user
    async getUserSchedules(userId, page = 1, limit = 20) {
        try {
            const offset = (page - 1) * limit;
            const sql = `
                SELECT ws.*, 
                       st.name as type_name, st.color as type_color,
                       sp.response as participant_response
                FROM work_schedules ws
                LEFT JOIN schedule_types st ON ws.type_id = st.id
                LEFT JOIN schedule_participants sp ON ws.id = sp.schedule_id AND sp.user_id = ?
                WHERE ws.created_by = ? OR ws.organizer_id = ? OR sp.user_id = ?
                ORDER BY ws.start_datetime DESC
                LIMIT ? OFFSET ?
            `;
            return await this.db.findMany(sql, [userId, userId, userId, userId, limit, offset]);
        } catch (error) {
            console.error('Error in Schedule getUserSchedules:', error);
            throw error;
        }
    }

    // Lấy người tham gia lịch
    async getParticipants(scheduleId) {
        try {
            const sql = `
                SELECT sp.*, u.full_name, u.email
                FROM schedule_participants sp
                LEFT JOIN users u ON sp.user_id = u.id
                WHERE sp.schedule_id = ?
                ORDER BY u.full_name ASC
            `;
            return await this.db.findMany(sql, [scheduleId]);
        } catch (error) {
            console.error('Error in Schedule getParticipants:', error);
            throw error;
        }
    }

    // Thêm người tham gia
    async addParticipant(scheduleId, userId, response = 'pending') {
        try {
            const sql = 'INSERT INTO schedule_participants (schedule_id, user_id, response) VALUES (?, ?, ?)';
            return await this.db.insert(sql, [scheduleId, userId, response]);
        } catch (error) {
            console.error('Error in Schedule addParticipant:', error);
            throw error;
        }
    }

    // Cập nhật phản hồi của người tham gia
    async updateParticipantResponse(scheduleId, userId, response) {
        try {
            const sql = 'UPDATE schedule_participants SET response = ? WHERE schedule_id = ? AND user_id = ?';
            return await this.db.update(sql, [response, scheduleId, userId]);
        } catch (error) {
            console.error('Error in Schedule updateParticipantResponse:', error);
            throw error;
        }
    }

    // Xóa người tham gia
    async removeParticipant(scheduleId, userId) {
        try {
            const sql = 'DELETE FROM schedule_participants WHERE schedule_id = ? AND user_id = ?';
            return await this.db.delete(sql, [scheduleId, userId]);
        } catch (error) {
            console.error('Error in Schedule removeParticipant:', error);
            throw error;
        }
    }

    // Lấy lịch sắp tới
    async getUpcomingSchedules(userId, days = 7) {
        try {
            const sql = `
                SELECT ws.*, 
                       st.name as type_name, st.color as type_color,
                       u_organizer.full_name as organizer_name
                FROM work_schedules ws
                LEFT JOIN schedule_types st ON ws.type_id = st.id
                LEFT JOIN users u_organizer ON ws.organizer_id = u_organizer.id
                LEFT JOIN schedule_participants sp ON ws.id = sp.schedule_id
                WHERE (ws.created_by = ? OR ws.organizer_id = ? OR sp.user_id = ?)
                AND ws.start_datetime >= NOW()
                AND ws.start_datetime <= DATE_ADD(NOW(), INTERVAL ? DAY)
                AND ws.status IN ('scheduled', 'ongoing')
                ORDER BY ws.start_datetime ASC
            `;
            return await this.db.findMany(sql, [userId, userId, userId, days]);
        } catch (error) {
            console.error('Error in Schedule getUpcomingSchedules:', error);
            throw error;
        }
    }

    // Kiểm tra xung đột lịch
    async checkConflict(startDatetime, endDatetime, excludeId = null) {
        try {
            let sql = `
                SELECT COUNT(*) as count
                FROM work_schedules
                WHERE (
                    (start_datetime <= ? AND end_datetime > ?) OR
                    (start_datetime < ? AND end_datetime >= ?) OR
                    (start_datetime >= ? AND end_datetime <= ?)
                )
                AND status IN ('scheduled', 'ongoing')
            `;
            const params = [startDatetime, startDatetime, endDatetime, endDatetime, startDatetime, endDatetime];

            if (excludeId) {
                sql += ' AND id != ?';
                params.push(excludeId);
            }

            const result = await this.db.findOne(sql, params);
            return result.count > 0;
        } catch (error) {
            console.error('Error in Schedule checkConflict:', error);
            throw error;
        }
    }

    // Lấy thống kê lịch làm việc
    async getStats() {
        try {
            const sql = `
                SELECT 
                    COUNT(*) as total_schedules,
                    SUM(CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END) as scheduled_count,
                    SUM(CASE WHEN status = 'ongoing' THEN 1 ELSE 0 END) as ongoing_count,
                    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_count,
                    SUM(CASE WHEN start_datetime >= CURDATE() AND start_datetime < DATE_ADD(CURDATE(), INTERVAL 1 DAY) THEN 1 ELSE 0 END) as today_count,
                    SUM(CASE WHEN start_datetime >= DATE_ADD(CURDATE(), INTERVAL 1 DAY) AND start_datetime < DATE_ADD(CURDATE(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as this_week_count
                FROM work_schedules
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            `;
            return await this.db.findOne(sql);
        } catch (error) {
            console.error('Error in Schedule getStats:', error);
            throw error;
        }
    }
}

// Teaching Schedule Model
class TeachingSchedule extends BaseModel {
    constructor() {
        super('teaching_schedules');
    }

    // Lấy lịch giảng dạy của giảng viên
    async getByLecturer(lecturerId, startDate = null, endDate = null) {
        try {
            let sql = `
                SELECT ts.*, c.name as course_name, c.course_code,
                       s.staff_code, u.full_name as lecturer_name
                FROM teaching_schedules ts
                LEFT JOIN courses c ON ts.course_id = c.id
                LEFT JOIN staff s ON ts.lecturer_id = s.id
                LEFT JOIN users u ON s.user_id = u.id
                WHERE ts.lecturer_id = ?
            `;
            const params = [lecturerId];

            if (startDate && endDate) {
                sql += ' AND ts.date >= ? AND ts.date <= ?';
                params.push(startDate, endDate);
            }

            sql += ' ORDER BY ts.date ASC, ts.periods ASC';

            return await this.db.findMany(sql, params);
        } catch (error) {
            console.error('Error in TeachingSchedule getByLecturer:', error);
            throw error;
        }
    }

    // Lấy lịch giảng dạy theo tuần
    async getWeeklySchedule(startDate, endDate) {
        try {
            const sql = `
                SELECT ts.*, c.name as course_name, c.course_code,
                       u.full_name as lecturer_name
                FROM teaching_schedules ts
                LEFT JOIN courses c ON ts.course_id = c.id
                LEFT JOIN staff s ON ts.lecturer_id = s.id
                LEFT JOIN users u ON s.user_id = u.id
                WHERE ts.date >= ? AND ts.date <= ?
                ORDER BY ts.date ASC, ts.periods ASC
            `;
            return await this.db.findMany(sql, [startDate, endDate]);
        } catch (error) {
            console.error('Error in TeachingSchedule getWeeklySchedule:', error);
            throw error;
        }
    }
}

module.exports = { Schedule, TeachingSchedule };