const db = require('../../config/database');

class TeachingCustomLecturer {
  static async getAll() {
    const query = `
      SELECT
        tcl.id,
        tcl.name,
        tcl.email,
        tcl.note,
        tcl.anchor_key,
        tcl.created_by,
        tcl.updated_by,
        tcl.created_at,
        tcl.updated_at,
        creator.full_name AS created_by_name,
        updater.full_name AS updated_by_name
      FROM teaching_custom_lecturers tcl
      LEFT JOIN users creator ON tcl.created_by = creator.id
      LEFT JOIN users updater ON tcl.updated_by = updater.id
      ORDER BY tcl.created_at ASC, tcl.id ASC
    `;

    return db.query(query);
  }

  static async findById(id) {
    const rows = await db.query(
      `
        SELECT
          tcl.id,
          tcl.name,
          tcl.email,
          tcl.note,
          tcl.anchor_key,
          tcl.created_by,
          tcl.updated_by,
          tcl.created_at,
          tcl.updated_at,
          creator.full_name AS created_by_name,
          updater.full_name AS updated_by_name
        FROM teaching_custom_lecturers tcl
        LEFT JOIN users creator ON tcl.created_by = creator.id
        LEFT JOIN users updater ON tcl.updated_by = updater.id
        WHERE tcl.id = ?
      `,
      [id]
    );

    return rows.length ? rows[0] : null;
  }

  static async create({ name, email = null, note = null, anchorKey = null, userId }) {
    const result = await db.query(
      `
        INSERT INTO teaching_custom_lecturers (name, email, note, anchor_key, created_by, updated_by)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      [name, email || null, note || null, anchorKey || null, userId, userId]
    );

    return this.findById(result.insertId);
  }

  static async update(id, { name, email = null, note = null, anchorKey = undefined, userId = null }) {
    const fields = [];
    const values = [];

    if (name !== undefined) {
      fields.push('name = ?');
      values.push(name);
    }

    if (email !== undefined) {
      fields.push('email = ?');
      values.push(email || null);
    }

    if (note !== undefined) {
      fields.push('note = ?');
      values.push(note || null);
    }

    if (anchorKey !== undefined) {
      fields.push('anchor_key = ?');
      values.push(anchorKey || null);
    }

    if (!fields.length) {
      return false;
    }

    if (userId) {
      fields.push('updated_by = ?');
      values.push(userId);
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');

    values.push(id);

    const query = `UPDATE teaching_custom_lecturers SET ${fields.join(', ')} WHERE id = ?`;
    const result = await db.query(query, values);

    if (!result.affectedRows) {
      return false;
    }

    return this.findById(id);
  }

  static async remove(id) {
    const result = await db.query('DELETE FROM teaching_custom_lecturers WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async reassignAnchors(oldAnchorKey, newAnchorKey = null) {
    if (!oldAnchorKey) return 0;
    const query = 'UPDATE teaching_custom_lecturers SET anchor_key = ? WHERE anchor_key = ?';
    const result = await db.query(query, [newAnchorKey || null, oldAnchorKey]);
    return result.affectedRows || 0;
  }
}

module.exports = TeachingCustomLecturer;
