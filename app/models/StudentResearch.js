const BaseModel = require('./BaseModel');

class StudentResearch extends BaseModel {
  constructor() {
    super('student_research_projects');
  }

    static tablesEnsured = false;

    static async ensureTables() {
      if (this.tablesEnsured) {
        return true;
      }

      const ensureTable = async (tableName, createSql) => {
        const exists = await this.tableExists(tableName);
        if (!exists) {
          await (new this()).db.execute(createSql);
          this.clearTableExistenceCache(tableName);
        }
      };

      const projectsSql = `
        CREATE TABLE IF NOT EXISTS student_research_projects (
          id INT AUTO_INCREMENT PRIMARY KEY,
          project_code VARCHAR(50) NULL,
          title VARCHAR(255) NOT NULL,
          field VARCHAR(255) NULL,
          supervisor_id INT NULL,
          supervisor_name VARCHAR(255) NULL,
          lead_student VARCHAR(255) NULL,
          team_size INT DEFAULT 1,
          status VARCHAR(50) DEFAULT 'proposal',
          progress INT DEFAULT 0,
          start_date DATE NULL,
          end_date DATE NULL,
          summary TEXT NULL,
          achievements TEXT NULL,
          reference_url VARCHAR(255) NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `;

      const outputsSql = `
        CREATE TABLE IF NOT EXISTS student_research_outputs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          project_id INT NULL,
          type VARCHAR(50) DEFAULT 'other',
          title VARCHAR(255) NOT NULL,
          description TEXT NULL,
          publish_date DATE NULL,
          lead_author VARCHAR(255) NULL,
          reference_url VARCHAR(255) NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          CONSTRAINT fk_student_research_outputs_project
            FOREIGN KEY (project_id)
            REFERENCES student_research_projects(id)
            ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `;

      await ensureTable('student_research_projects', projectsSql);
      await ensureTable('student_research_outputs', outputsSql);

      const hasProjects = await this.tableExists('student_research_projects');
      const hasOutputs = await this.tableExists('student_research_outputs');
      this.tablesEnsured = hasProjects && hasOutputs;
      return this.tablesEnsured;
    }

  async safeExecute(callback, fallback) {
    try {
      if (typeof this.constructor.ensureTables === 'function') {
        await this.constructor.ensureTables();
      }
      return await callback();
    } catch (error) {
      if (error?.code === 'ER_NO_SUCH_TABLE' || error?.code === 'ER_BAD_FIELD_ERROR') {
        console.warn('StudentResearch: optional table missing, returning fallback. Detail:', error.message);
        return typeof fallback === 'function' ? fallback() : fallback;
      }
      throw error;
    }
  }

  async getStats() {
    const fallback = {
      totalProjects: 0,
      activeProjects: 0,
      completedProjects: 0,
      proposalCount: 0,
      inProgressCount: 0,
      teamSizeTotal: 0,
      advisors: 0
    };

    return this.safeExecute(async () => {
      if (!(await this.constructor.tableExists('student_research_projects'))) {
        return fallback;
      }

      const sql = `
        SELECT 
          COUNT(*) as totalProjects,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completedProjects,
          SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as activeProjects,
          SUM(CASE WHEN status = 'proposal' THEN 1 ELSE 0 END) as proposalCount,
          SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as inProgressCount,
          SUM(team_size) as teamSizeTotal,
          COUNT(DISTINCT supervisor_id) as advisors
        FROM student_research_projects
      `;
      const stats = await this.db.findOne(sql);
      return {
        totalProjects: stats?.totalProjects || 0,
        activeProjects: stats?.activeProjects || 0,
        completedProjects: stats?.completedProjects || 0,
        proposalCount: stats?.proposalCount || 0,
        inProgressCount: stats?.inProgressCount || 0,
        teamSizeTotal: stats?.teamSizeTotal || 0,
        advisors: stats?.advisors || 0
      };
    }, fallback);
  }

  async getActiveProjects({ limit = 6 } = {}) {
    return this.safeExecute(async () => {
      if (!(await this.constructor.tableExists('student_research_projects'))) {
        return [];
      }
      const safeLimit = Math.max(1, Math.min(parseInt(limit, 10) || 6, 50));
      const sql = `
        SELECT id, project_code, title, field, status, lead_student, team_size, supervisor_name,
               start_date, end_date, progress, summary
        FROM student_research_projects
        ORDER BY progress DESC, start_date DESC
        LIMIT ${safeLimit}
      `;
      return await this.db.findMany(sql);
    }, []);
  }

  async getAllProjects() {
    return this.safeExecute(async () => {
      if (!(await this.constructor.tableExists('student_research_projects'))) {
        return [];
      }
      const sql = `
        SELECT *
        FROM student_research_projects
        ORDER BY created_at DESC
      `;
      return await this.db.findMany(sql);
    }, []);
  }

  async getRecentOutputs({ limit = 6 } = {}) {
    return this.safeExecute(async () => {
      const projectsTable = await this.constructor.tableExists('student_research_projects');
      const outputsTable = await this.constructor.tableExists('student_research_outputs');
      if (!projectsTable || !outputsTable) {
        return [];
      }
      const safeLimit = Math.max(1, Math.min(parseInt(limit, 10) || 6, 50));
      const sql = `
        SELECT o.*, p.title as project_title, p.lead_student
        FROM student_research_outputs o
        LEFT JOIN student_research_projects p ON o.project_id = p.id
        ORDER BY o.publish_date DESC, o.created_at DESC
        LIMIT ${safeLimit}
      `;
      return await this.db.findMany(sql);
    }, []);
  }

  async getAllOutputs() {
    return this.safeExecute(async () => {
      const projectsTable = await this.constructor.tableExists('student_research_projects');
      const outputsTable = await this.constructor.tableExists('student_research_outputs');
      if (!projectsTable || !outputsTable) {
        return [];
      }
      const sql = `
        SELECT o.*, p.title AS project_title
        FROM student_research_outputs o
        LEFT JOIN student_research_projects p ON o.project_id = p.id
        ORDER BY o.publish_date DESC, o.created_at DESC
      `;
      return await this.db.findMany(sql);
    }, []);
  }

  async getFieldDistribution() {
    return this.safeExecute(async () => {
      if (!(await this.constructor.tableExists('student_research_projects'))) {
        return [];
      }
      const sql = `
        SELECT field, COUNT(*) as count
        FROM student_research_projects
        WHERE field IS NOT NULL AND field != ''
        GROUP BY field
        ORDER BY count DESC
      `;
      return await this.db.findMany(sql);
    }, []);
  }

  async createProject(data = {}) {
    try {
      if (!(await this.constructor.tableExists('student_research_projects'))) {
        throw new Error('Bảng student_research_projects chưa được thiết lập.');
      }
      const sql = `
        INSERT INTO student_research_projects (
          project_code, title, field, supervisor_id, supervisor_name,
          lead_student, team_size, status, progress,
          start_date, end_date, summary, achievements, reference_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const result = await this.db.insert(sql, [
        data.project_code || null,
        data.title,
        data.field || null,
        data.supervisor_id || null,
        data.supervisor_name || null,
        data.lead_student || null,
        data.team_size ?? 1,
        data.status || 'proposal',
        data.progress ?? 0,
        data.start_date || null,
        data.end_date || null,
        data.summary || null,
        data.achievements || null,
        data.reference_url || null
      ]);
      return result.insertId;
    } catch (error) {
      console.error('StudentResearch.createProject error:', error);
      throw error;
    }
  }

  async updateProject(id, data = {}) {
    try {
      if (!(await this.constructor.tableExists('student_research_projects'))) {
        throw new Error('Bảng student_research_projects chưa được thiết lập.');
      }
      const sql = `
        UPDATE student_research_projects SET
          project_code = ?,
          title = ?,
          field = ?,
          supervisor_id = ?,
          supervisor_name = ?,
          lead_student = ?,
          team_size = ?,
          status = ?,
          progress = ?,
          start_date = ?,
          end_date = ?,
          summary = ?,
          achievements = ?,
          reference_url = ?,
          updated_at = NOW()
        WHERE id = ?
      `;
      await this.db.update(sql, [
        data.project_code || null,
        data.title,
        data.field || null,
        data.supervisor_id || null,
        data.supervisor_name || null,
        data.lead_student || null,
        data.team_size ?? 1,
        data.status || 'proposal',
        data.progress ?? 0,
        data.start_date || null,
        data.end_date || null,
        data.summary || null,
        data.achievements || null,
        data.reference_url || null,
        id
      ]);
    } catch (error) {
      console.error('StudentResearch.updateProject error:', error);
      throw error;
    }
  }

  async deleteProject(id) {
    try {
      if (!(await this.constructor.tableExists('student_research_projects'))) {
        throw new Error('Bảng student_research_projects chưa được thiết lập.');
      }
      await this.db.delete('DELETE FROM student_research_projects WHERE id = ?', [id]);
    } catch (error) {
      console.error('StudentResearch.deleteProject error:', error);
      throw error;
    }
  }

  async createOutput(data = {}) {
    try {
      const projectsTable = await this.constructor.tableExists('student_research_projects');
      const outputsTable = await this.constructor.tableExists('student_research_outputs');
      if (!projectsTable || !outputsTable) {
        throw new Error('Bảng student_research_outputs hoặc student_research_projects chưa được thiết lập.');
      }
      const sql = `
        INSERT INTO student_research_outputs (
          project_id, type, title, description, publish_date,
          lead_author, reference_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const result = await this.db.insert(sql, [
        data.project_id || null,
        data.type || 'other',
        data.title,
        data.description || null,
        data.publish_date || null,
        data.lead_author || null,
        data.reference_url || null
      ]);
      return result.insertId;
    } catch (error) {
      console.error('StudentResearch.createOutput error:', error);
      throw error;
    }
  }

  async updateOutput(id, data = {}) {
    try {
      const projectsTable = await this.constructor.tableExists('student_research_projects');
      const outputsTable = await this.constructor.tableExists('student_research_outputs');
      if (!projectsTable || !outputsTable) {
        throw new Error('Bảng student_research_outputs hoặc student_research_projects chưa được thiết lập.');
      }
      const sql = `
        UPDATE student_research_outputs SET
          project_id = ?,
          type = ?,
          title = ?,
          description = ?,
          publish_date = ?,
          lead_author = ?,
          reference_url = ?
        WHERE id = ?
      `;
      await this.db.update(sql, [
        data.project_id || null,
        data.type || 'other',
        data.title,
        data.description || null,
        data.publish_date || null,
        data.lead_author || null,
        data.reference_url || null,
        id
      ]);
    } catch (error) {
      console.error('StudentResearch.updateOutput error:', error);
      throw error;
    }
  }

  async deleteOutput(id) {
    try {
      if (!(await this.constructor.tableExists('student_research_outputs'))) {
        throw new Error('Bảng student_research_outputs chưa được thiết lập.');
      }
      await this.db.delete('DELETE FROM student_research_outputs WHERE id = ?', [id]);
    } catch (error) {
      console.error('StudentResearch.deleteOutput error:', error);
      throw error;
    }
  }
}

module.exports = StudentResearch;
