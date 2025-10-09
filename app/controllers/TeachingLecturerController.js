const TeachingCustomLecturer = require('../models/TeachingCustomLecturer');

function sanitizeString(value, { maxLength = 255, allowEmpty = false } = {}) {
  if (value === undefined || value === null) {
    return allowEmpty ? '' : null;
  }

  const trimmed = String(value).trim();
  if (!trimmed && !allowEmpty) {
    return null;
  }

  if (trimmed.length > maxLength) {
    return trimmed.slice(0, maxLength);
  }

  return trimmed;
}

function formatLecturer(record) {
  if (!record) return null;
  return {
    id: record.id,
    name: record.name,
    email: record.email,
    note: record.note,
    anchorKey: record.anchor_key,
    created_at: record.created_at,
    updated_at: record.updated_at,
    created_by: record.created_by,
    created_by_name: record.created_by_name || null,
    updated_by: record.updated_by,
    updated_by_name: record.updated_by_name || null
  };
}

class TeachingLecturerController {
  async index(req, res) {
    try {
      const rows = await TeachingCustomLecturer.getAll();
      res.json({
        lecturers: rows.map(formatLecturer)
      });
    } catch (error) {
      console.error('TeachingLecturerController.index error:', error);
      res.status(500).json({ error: 'Không thể tải danh sách giảng viên tùy chỉnh.' });
    }
  }

  async store(req, res) {
    try {
      const userId = req.session.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Bạn cần đăng nhập để thực hiện thao tác này.' });
      }

      const name = sanitizeString(req.body.name, { maxLength: 255 });
      if (!name) {
        return res.status(400).json({ error: 'Tên giảng viên là bắt buộc.' });
      }

      const email = sanitizeString(req.body.email, { maxLength: 255, allowEmpty: true }) || null;
      const note = sanitizeString(req.body.note, { maxLength: 1000, allowEmpty: true }) || null;
      const anchorKey = sanitizeString(req.body.anchorKey ?? req.body.anchor_key, {
        maxLength: 255,
        allowEmpty: true
      }) || null;

      const created = await TeachingCustomLecturer.create({
        name,
        email,
        note,
        anchorKey,
        userId
      });

      res.status(201).json({ lecturer: formatLecturer(created) });
    } catch (error) {
      console.error('TeachingLecturerController.store error:', error);
      res.status(500).json({ error: 'Không thể tạo giảng viên tùy chỉnh.' });
    }
  }

  async update(req, res) {
    try {
      const userId = req.session.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Bạn cần đăng nhập để thực hiện thao tác này.' });
      }

      const id = Number.parseInt(req.params.id, 10);
      if (!Number.isInteger(id)) {
        return res.status(400).json({ error: 'Định danh giảng viên không hợp lệ.' });
      }

      const existing = await TeachingCustomLecturer.findById(id);
      if (!existing) {
        return res.status(404).json({ error: 'Không tìm thấy giảng viên cần cập nhật.' });
      }

      const payload = { userId };
      let hasChanges = false;

      if (req.body.name !== undefined) {
        const name = sanitizeString(req.body.name, { maxLength: 255 });
        if (!name) {
          return res.status(400).json({ error: 'Tên giảng viên là bắt buộc.' });
        }
        payload.name = name;
        hasChanges = true;
      }

      if (req.body.email !== undefined) {
        payload.email = sanitizeString(req.body.email, { maxLength: 255, allowEmpty: true }) || null;
        hasChanges = true;
      }

      if (req.body.note !== undefined) {
        payload.note = sanitizeString(req.body.note, { maxLength: 1000, allowEmpty: true }) || null;
        hasChanges = true;
      }

      if (req.body.anchorKey !== undefined || req.body.anchor_key !== undefined) {
        payload.anchorKey = sanitizeString(req.body.anchorKey ?? req.body.anchor_key, {
          maxLength: 255,
          allowEmpty: true
        }) || null;
        hasChanges = true;
      }

      if (!hasChanges) {
        return res.status(400).json({ error: 'Không có dữ liệu nào để cập nhật.' });
      }

      const updated = await TeachingCustomLecturer.update(id, payload);
      if (!updated) {
        return res.status(500).json({ error: 'Không thể cập nhật giảng viên tùy chỉnh.' });
      }

      res.json({ lecturer: formatLecturer(updated) });
    } catch (error) {
      console.error('TeachingLecturerController.update error:', error);
      res.status(500).json({ error: 'Không thể cập nhật giảng viên tùy chỉnh.' });
    }
  }

  async destroy(req, res) {
    try {
      const userId = req.session.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Bạn cần đăng nhập để thực hiện thao tác này.' });
      }

      const id = Number.parseInt(req.params.id, 10);
      if (!Number.isInteger(id)) {
        return res.status(400).json({ error: 'Định danh giảng viên không hợp lệ.' });
      }

      const existing = await TeachingCustomLecturer.findById(id);
      if (!existing) {
        return res.status(404).json({ error: 'Không tìm thấy giảng viên cần xóa.' });
      }

      const removalKey = `custom:${existing.id}`;
      const fallbackAnchor = existing.anchor_key || null;

      await TeachingCustomLecturer.reassignAnchors(removalKey, fallbackAnchor);

      const removed = await TeachingCustomLecturer.remove(id);
      if (!removed) {
        return res.status(500).json({ error: 'Không thể xóa giảng viên tùy chỉnh.' });
      }

      res.json({
        success: true,
        removedId: id,
        reassignTo: fallbackAnchor
      });
    } catch (error) {
      console.error('TeachingLecturerController.destroy error:', error);
      res.status(500).json({ error: 'Không thể xóa giảng viên tùy chỉnh.' });
    }
  }
}

module.exports = new TeachingLecturerController();
