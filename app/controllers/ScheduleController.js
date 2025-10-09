const WorkSchedule = require('../models/WorkSchedule');
const db = require('../../config/database');

function getWeekStart(dateInput) {
  const date = dateInput ? new Date(dateInput) : new Date();
  const result = new Date(date);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day; // move to Monday
  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

function getWeekEnd(weekStart) {
  const end = new Date(weekStart);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

function safeParseJSON(value) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
}

function formatTime(date) {
  return new Date(date).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

function getWeekdayIndex(date) {
  const day = new Date(date).getDay();
  return (day + 6) % 7; // Monday = 0, Sunday = 6
}

class ScheduleController {
  // GET /schedule - Trang calendar
  async index(req, res) {
    try {
      const userId = req.session.user?.id;
      
      // Lấy danh sách users cho dropdown
      const users = await db.query(
        'SELECT id, full_name, email FROM users WHERE is_active = 1 ORDER BY full_name'
      );

      res.render('schedule/index', {
        title: 'Lịch công tác',
        user: req.session.user,
        users
      });
    } catch (error) {
      console.error('Schedule index error:', error);
      res.status(500).render('error', { error: error.message });
    }
  }

  // GET /api/schedule/events - Lấy events cho calendar (API)
  async getEvents(req, res) {
    try {
      const { start, end, user_id } = req.query;
      
      const events = await WorkSchedule.getEventsBetween(
        start || new Date(),
        end || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        user_id || null
      );

      res.json(events);
    } catch (error) {
      console.error('Get events error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getTeachingSchedule(req, res) {
    try {
      const weekStart = req.query.start ? getWeekStart(req.query.start) : getWeekStart(new Date());
      const weekEnd = req.query.end ? new Date(req.query.end) : getWeekEnd(weekStart);

      if (!req.query.end) {
        weekEnd.setHours(23, 59, 59, 999);
      }

      const rawEvents = await WorkSchedule.getTeachingSchedule(
        weekStart.toISOString(),
        weekEnd.toISOString(),
        { includeParticipants: true }
      );

      const formattedEvents = rawEvents.map(event => {
        const rawTags = safeParseJSON(event.tags);
        let normalizedTags = {};
        let className = '';

        if (Array.isArray(rawTags)) {
          normalizedTags = {
            items: rawTags,
            class: rawTags[0] || undefined
          };
          className = rawTags[0] || '';
        } else if (rawTags && typeof rawTags === 'object') {
          normalizedTags = rawTags;
          className = rawTags.class || rawTags.class_name || rawTags.lop || '';
        }

        const participants = Array.isArray(event.participants) ? event.participants : [];
        const lecturer = event.organizer_name
          || normalizedTags.lecturer
          || (participants.find(p => p.role === 'organizer')?.full_name)
          || '';
        const lecturerEmail = event.organizer_email
          || (participants.find(p => p.role === 'organizer')?.email)
          || '';

        return {
          id: event.id,
          title: event.title,
          class_name: className,
          description: event.description,
          location: event.location,
          room: event.room,
          building: event.building,
          organizer: lecturer,
          organizer_id: event.organizer_id,
          organizer_email: lecturerEmail,
          tags: normalizedTags,
          start: event.start_datetime instanceof Date ? event.start_datetime.toISOString() : event.start_datetime,
          end: event.end_datetime instanceof Date ? event.end_datetime.toISOString() : event.end_datetime,
          start_time: formatTime(event.start_datetime),
          end_time: formatTime(event.end_datetime),
          weekday: getWeekdayIndex(event.start_datetime),
          notes: event.public_notes || event.notes || '',
          priority: event.priority,
          status: event.status
        };
      });

      const notes = formattedEvents
        .filter(event => event.notes)
        .map(event => ({
          time: `${event.start_time} - ${event.end_time}`,
          title: event.title,
          content: event.notes
        }));

      res.json({
        start: weekStart.toISOString(),
        end: weekEnd.toISOString(),
        events: formattedEvents,
        notes
      });
    } catch (error) {
      console.error('Get teaching schedule error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/schedule/:id - Chi tiết schedule
  async show(req, res) {
    try {
      const schedule = await WorkSchedule.findById(req.params.id);
      
      if (!schedule) {
        return res.status(404).json({ error: 'Schedule not found' });
      }

      // Parse JSON fields
      if (schedule.tags && typeof schedule.tags === 'string') {
        schedule.tags = JSON.parse(schedule.tags);
      }
      if (schedule.attachments && typeof schedule.attachments === 'string') {
        schedule.attachments = JSON.parse(schedule.attachments);
      }

      res.json(schedule);
    } catch (error) {
      console.error('Show schedule error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // POST /api/schedule - Tạo lịch mới
  async store(req, res) {
    try {
      const userId = req.session.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Validate required fields
      const { title, start_datetime, end_datetime, organizer_id } = req.body;
      
      if (!title || !start_datetime || !end_datetime || !organizer_id) {
        return res.status(400).json({ 
          error: 'Missing required fields: title, start_datetime, end_datetime, organizer_id' 
        });
      }

      // Validate datetime
      if (new Date(start_datetime) >= new Date(end_datetime)) {
        return res.status(400).json({ 
          error: 'End datetime must be after start datetime' 
        });
      }

      // Kiểm tra xung đột lịch
      const conflicts = await WorkSchedule.checkConflicts(
        organizer_id,
        start_datetime,
        end_datetime,
        null,
        {
          eventType: req.body.event_type || 'other',
          room: req.body.room,
          location: req.body.location
        }
      );

      if (conflicts.length > 0) {
        return res.status(409).json({ 
          error: 'Schedule conflict detected',
          conflicts 
        });
      }

      // Prepare data
      const scheduleData = {
        title,
        description: req.body.description,
        event_type: req.body.event_type || 'other',
        start_datetime,
        end_datetime,
        is_all_day: req.body.is_all_day || false,
        timezone: req.body.timezone || 'Asia/Ho_Chi_Minh',
        recurrence_rule: req.body.recurrence_rule,
        recurrence_end_date: req.body.recurrence_end_date,
        location: req.body.location,
        room: req.body.room,
        building: req.body.building,
        online_meeting_url: req.body.online_meeting_url,
        organizer_id,
        status: req.body.status || 'confirmed',
        priority: req.body.priority || 'normal',
        color: req.body.color,
        icon: req.body.icon,
        tags: req.body.tags,
        reminder_minutes: req.body.reminder_minutes || 15,
        attachments: req.body.attachments,
        notes: req.body.notes,
        public_notes: req.body.public_notes,
        created_by: userId
      };

      const scheduleId = await WorkSchedule.create(scheduleData);

      // Add participants if provided
      if (req.body.participants && Array.isArray(req.body.participants)) {
        for (const participant of req.body.participants) {
          await WorkSchedule.addParticipant(
            scheduleId,
            participant.user_id,
            participant.role || 'required'
          );
        }
      }

      // Log history
      await db.query(
        `INSERT INTO schedule_history (schedule_id, action, changed_by, new_data, change_summary)
         VALUES (?, 'created', ?, ?, 'Tạo lịch mới')`,
        [scheduleId, userId, JSON.stringify(scheduleData)]
      );

      res.status(201).json({ 
        message: 'Schedule created successfully',
        id: scheduleId 
      });

    } catch (error) {
      console.error('Store schedule error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // PUT /api/schedule/:id - Cập nhật lịch
  async update(req, res) {
    try {
      const userId = req.session.user?.id;
      const scheduleId = req.params.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Get old data for history
      const oldSchedule = await WorkSchedule.findById(scheduleId);
      if (!oldSchedule) {
        return res.status(404).json({ error: 'Schedule not found' });
      }

      // Validate datetime if updated
      if (req.body.start_datetime && req.body.end_datetime) {
        if (new Date(req.body.start_datetime) >= new Date(req.body.end_datetime)) {
          return res.status(400).json({ 
            error: 'End datetime must be after start datetime' 
          });
        }

        // Check conflicts
        const conflictOptions = {
          eventType: req.body.event_type || oldSchedule.event_type,
          room: req.body.room !== undefined ? req.body.room : oldSchedule.room,
          location: req.body.location !== undefined ? req.body.location : oldSchedule.location
        };

        const conflicts = await WorkSchedule.checkConflicts(
          req.body.organizer_id || oldSchedule.organizer_id,
          req.body.start_datetime,
          req.body.end_datetime,
          scheduleId,
          conflictOptions
        );

        if (conflicts.length > 0) {
          return res.status(409).json({ 
            error: 'Schedule conflict detected',
            conflicts 
          });
        }
      }

      // Update schedule
      const updated = await WorkSchedule.update(scheduleId, req.body);

      if (!updated) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      // Update participants if provided
      if (req.body.participants && Array.isArray(req.body.participants)) {
        // Remove existing participants
        await db.query('DELETE FROM schedule_participants WHERE schedule_id = ?', [scheduleId]);
        
        // Add new participants
        for (const participant of req.body.participants) {
          await WorkSchedule.addParticipant(
            scheduleId,
            participant.user_id,
            participant.role || 'required'
          );
        }
      }

      // Log history
      await db.query(
        `INSERT INTO schedule_history (schedule_id, action, changed_by, old_data, new_data, change_summary)
         VALUES (?, 'updated', ?, ?, ?, 'Cập nhật lịch')`,
        [scheduleId, userId, JSON.stringify(oldSchedule), JSON.stringify(req.body)]
      );

      res.json({ 
        message: 'Schedule updated successfully' 
      });

    } catch (error) {
      console.error('Update schedule error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // DELETE /api/schedule/:id - Xóa lịch
  async destroy(req, res) {
    try {
      const userId = req.session.user?.id;
      const scheduleId = req.params.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Get schedule for history
      const schedule = await WorkSchedule.findById(scheduleId);
      if (!schedule) {
        return res.status(404).json({ error: 'Schedule not found' });
      }

      // Log before delete
      await db.query(
        `INSERT INTO schedule_history (schedule_id, action, changed_by, old_data, change_summary)
         VALUES (?, 'deleted', ?, ?, 'Xóa lịch')`,
        [scheduleId, userId, JSON.stringify(schedule)]
      );

      // Delete schedule
      const deleted = await WorkSchedule.delete(scheduleId);

      if (!deleted) {
        return res.status(404).json({ error: 'Schedule not found' });
      }

      res.json({ message: 'Schedule deleted successfully' });

    } catch (error) {
      console.error('Delete schedule error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // PUT /api/schedule/:id/status - Cập nhật trạng thái
  async updateStatus(req, res) {
    try {
      const userId = req.session.user?.id;
      const { status } = req.body;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!['draft', 'confirmed', 'cancelled', 'completed', 'postponed'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const updated = await WorkSchedule.update(req.params.id, { status });

      if (!updated) {
        return res.status(404).json({ error: 'Schedule not found' });
      }

      res.json({ message: 'Status updated successfully' });

    } catch (error) {
      console.error('Update status error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // POST /api/schedule/:id/participants - Thêm participant
  async addParticipant(req, res) {
    try {
      const { user_id, role } = req.body;

      if (!user_id) {
        return res.status(400).json({ error: 'user_id is required' });
      }

      await WorkSchedule.addParticipant(req.params.id, user_id, role);

      res.json({ message: 'Participant added successfully' });

    } catch (error) {
      console.error('Add participant error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // DELETE /api/schedule/:id/participants/:userId - Xóa participant
  async removeParticipant(req, res) {
    try {
      const { id, userId } = req.params;

      const removed = await WorkSchedule.removeParticipant(id, userId);

      if (!removed) {
        return res.status(404).json({ error: 'Participant not found' });
      }

      res.json({ message: 'Participant removed successfully' });

    } catch (error) {
      console.error('Remove participant error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // PUT /api/schedule/:id/participants/:userId - Cập nhật trạng thái participant
  async updateParticipantStatus(req, res) {
    try {
      const { id, userId } = req.params;
      const { status } = req.body;

      if (!['pending', 'accepted', 'declined', 'tentative', 'no_response'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const updated = await WorkSchedule.updateParticipantStatus(id, userId, status);

      if (!updated) {
        return res.status(404).json({ error: 'Participant not found' });
      }

      res.json({ message: 'Participant status updated successfully' });

    } catch (error) {
      console.error('Update participant status error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/schedule/conflicts - Kiểm tra xung đột
  async checkConflicts(req, res) {
    try {
      const { user_id, start_datetime, end_datetime, exclude_id } = req.query;

      if (!user_id || !start_datetime || !end_datetime) {
        return res.status(400).json({ 
          error: 'Missing required parameters: user_id, start_datetime, end_datetime' 
        });
      }

      const conflictOptions = {
        eventType: req.query.event_type,
        room: req.query.room,
        location: req.query.location
      };

      const conflicts = await WorkSchedule.checkConflicts(
        user_id,
        start_datetime,
        end_datetime,
        exclude_id || null,
        conflictOptions
      );

      res.json({ 
        hasConflict: conflicts.length > 0,
        conflicts 
      });

    } catch (error) {
      console.error('Check conflicts error:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new ScheduleController();
