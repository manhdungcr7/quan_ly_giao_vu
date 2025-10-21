const Project = require('../models/Project');
const Staff = require('../models/Staff');
const StudentResearch = require('../models/StudentResearch');

class ResearchManagementController {
  constructor() {
    this.projectModel = new Project();
    this.staffModel = new Staff();
    this.studentResearchModel = new StudentResearch();

    this.saveProject = this.saveProject.bind(this);
    this.deleteProject = this.deleteProject.bind(this);
    this.saveStudentProject = this.saveStudentProject.bind(this);
    this.deleteStudentProject = this.deleteStudentProject.bind(this);
    this.saveStudentOutput = this.saveStudentOutput.bind(this);
    this.deleteStudentOutput = this.deleteStudentOutput.bind(this);
  }

  generateCode(prefix) {
    const now = new Date();
    const pad = (num) => num.toString().padStart(2, '0');
    return [
      prefix,
      now.getFullYear(),
      pad(now.getMonth() + 1),
      pad(now.getDate()),
      pad(now.getHours()),
      pad(now.getMinutes())
    ].join('-');
  }

  clampNumber(value, min, max) {
    const num = Number(value);
    if (Number.isNaN(num)) return min;
    return Math.min(Math.max(num, min), max);
  }

  normalizeDate(value) {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString().slice(0, 10);
  }

  async manage(req, res) {
    let projects = [];
    let categories = [];
    let staffMembers = [];
    let studentProjects = [];
    let studentOutputs = [];

    try {
      const projectSql = `
        SELECT p.*, pc.name AS category_name, u.full_name AS leader_name
        FROM projects p
        LEFT JOIN project_categories pc ON p.category_id = pc.id
        LEFT JOIN staff s ON p.leader_id = s.id
        LEFT JOIN users u ON s.user_id = u.id
        ORDER BY p.created_at DESC
        LIMIT 200
      `;
      projects = await this.projectModel.db.findMany(projectSql);
    } catch (error) {
      console.warn('ResearchManagement.manage: unable to load projects:', error.message);
    }

    try {
      categories = await this.projectModel.listCategories();
    } catch (error) {
      console.warn('ResearchManagement.manage: unable to load categories:', error.message);
    }

    try {
      const staffSql = `
        SELECT s.id, s.staff_code, u.full_name
        FROM staff s
        LEFT JOIN users u ON s.user_id = u.id
        WHERE s.status != 'terminated'
        ORDER BY u.full_name ASC
        LIMIT 200
      `;
      staffMembers = await this.staffModel.db.findMany(staffSql);
    } catch (error) {
      console.warn('ResearchManagement.manage: unable to load staff list:', error.message);
    }

    const hasStudentProjects = await StudentResearch.tableExists('student_research_projects');
    const hasStudentOutputs = await StudentResearch.tableExists('student_research_outputs');

    if (hasStudentProjects) {
      try {
        const studentSql = `
          SELECT *
          FROM student_research_projects
          ORDER BY created_at DESC
          LIMIT 200
        `;
        studentProjects = await this.studentResearchModel.db.findMany(studentSql);
      } catch (error) {
        console.warn('ResearchManagement.manage: unable to load student projects:', error.message);
      }
    }

    if (hasStudentOutputs && hasStudentProjects) {
      try {
        const outputSql = `
          SELECT o.*, p.title AS project_title
          FROM student_research_outputs o
          LEFT JOIN student_research_projects p ON o.project_id = p.id
          ORDER BY o.publish_date DESC
          LIMIT 200
        `;
        studentOutputs = await this.studentResearchModel.db.findMany(outputSql);
      } catch (error) {
        console.warn('ResearchManagement.manage: unable to load student outputs:', error.message);
      }
    }

    const projectStatuses = [
      { value: 'planning', label: 'Đang lập kế hoạch' },
      { value: 'active', label: 'Đang triển khai' },
      { value: 'completed', label: 'Đã nghiệm thu' },
      { value: 'paused', label: 'Tạm dừng' },
      { value: 'cancelled', label: 'Ngừng triển khai' }
    ];

    const studentStatuses = [
      { value: 'proposal', label: 'Đề xuất' },
      { value: 'in_progress', label: 'Đang thực hiện' },
      { value: 'completed', label: 'Đã hoàn thành' },
      { value: 'archived', label: 'Lưu trữ' }
    ];

    const outputTypes = [
      { value: 'paper', label: 'Bài báo' },
      { value: 'presentation', label: 'Báo cáo / Hội nghị' },
      { value: 'award', label: 'Giải thưởng' },
      { value: 'patent', label: 'Bằng sáng chế' },
      { value: 'other', label: 'Khác' }
    ];

    res.render('research/manage', {
      title: 'Quản lý dữ liệu nghiên cứu',
      user: req.session.user,
      projects,
      categories,
      staffMembers,
      projectStatuses,
      studentProjects,
      studentStatuses,
      studentOutputs,
      outputTypes
    });
  }

  validateProjectPayload(body) {
    const errors = [];
    const payload = {
      id: body.id ? Number(body.id) : null,
      project_code: (body.project_code || '').trim(),
      title: (body.title || '').trim(),
      category_id: body.category_id ? Number(body.category_id) : null,
      leader_id: body.leader_id ? Number(body.leader_id) : null,
      start_date: this.normalizeDate(body.start_date),
      end_date: this.normalizeDate(body.end_date),
      status: body.status || 'planning',
      progress: this.clampNumber(body.progress ?? 0, 0, 100),
      budget: Number(body.budget || 0) || 0,
      description: body.description ? body.description.trim() : null,
      objectives: body.objectives ? body.objectives.trim() : null,
      results_summary: body.results_summary ? body.results_summary.trim() : null
    };

    if (!payload.project_code) {
      payload.project_code = this.generateCode('PRJ');
    }

    if (!payload.title) {
      errors.push('Vui lòng nhập tên đề tài.');
    }

    if (!payload.leader_id) {
      errors.push('Vui lòng chọn giảng viên chủ trì.');
    }

    if (!payload.start_date) {
      errors.push('Vui lòng chọn ngày bắt đầu.');
    }

    if (!payload.end_date) {
      errors.push('Vui lòng chọn ngày kết thúc.');
    }

    return { errors, payload };
  }

  async saveProject(req, res) {
    const { errors, payload } = this.validateProjectPayload(req.body);

    if (errors.length) {
      req.flash('error', errors);
      return res.redirect('/research/manage');
    }

    payload.created_by = req.session.user?.id || null;

    try {
      if (payload.id) {
        await this.projectModel.updateProject(payload.id, payload);
        req.flash('success', 'Cập nhật đề tài nghiên cứu thành công.');
      } else {
        await this.projectModel.createProject(payload);
        req.flash('success', 'Thêm đề tài nghiên cứu mới thành công.');
      }
    } catch (error) {
      console.error('ResearchManagement.saveProject error:', error);
      req.flash('error', error.message || 'Không thể lưu đề tài nghiên cứu.');
    }

    return res.redirect('/research/manage');
  }

  async deleteProject(req, res) {
    const { id } = req.params;
    if (!id) {
      req.flash('error', 'Không xác định được đề tài cần xoá.');
      return res.redirect('/research/manage');
    }

    try {
      await this.projectModel.deleteProject(Number(id));
      req.flash('success', 'Đã xoá đề tài nghiên cứu.');
    } catch (error) {
      console.error('ResearchManagement.deleteProject error:', error);
      req.flash('error', 'Không thể xoá đề tài nghiên cứu.');
    }

    return res.redirect('/research/manage');
  }

  validateStudentProjectPayload(body) {
    const errors = [];
    const payload = {
      id: body.id ? Number(body.id) : null,
      project_code: (body.project_code || '').trim(),
      title: (body.title || '').trim(),
      field: body.field ? body.field.trim() : null,
      supervisor_id: body.supervisor_id ? Number(body.supervisor_id) : null,
      supervisor_name: body.supervisor_name ? body.supervisor_name.trim() : null,
      lead_student: body.lead_student ? body.lead_student.trim() : null,
      team_size: this.clampNumber(body.team_size || 1, 1, 20),
      status: body.status || 'proposal',
      progress: this.clampNumber(body.progress ?? 0, 0, 100),
      start_date: this.normalizeDate(body.start_date),
      end_date: this.normalizeDate(body.end_date),
      summary: body.summary ? body.summary.trim() : null,
      achievements: body.achievements ? body.achievements.trim() : null,
      reference_url: body.reference_url ? body.reference_url.trim() : null
    };

    if (!payload.project_code) {
      payload.project_code = this.generateCode('SVR');
    }

    if (!payload.title) {
      errors.push('Vui lòng nhập tên đề tài sinh viên.');
    }

    if (!payload.lead_student) {
      errors.push('Vui lòng nhập tên sinh viên phụ trách.');
    }

    return { errors, payload };
  }

  async saveStudentProject(req, res) {
    const hasStudentProjects = await StudentResearch.tableExists('student_research_projects');
    if (!hasStudentProjects) {
      req.flash('error', 'Không thể lưu vì thiếu bảng student_research_projects. Vui lòng tạo bảng trước.');
      return res.redirect('/research/manage');
    }

    const { errors, payload } = this.validateStudentProjectPayload(req.body);

    if (errors.length) {
      req.flash('error', errors);
      return res.redirect('/research/manage');
    }

    try {
      if (payload.id) {
        await this.studentResearchModel.updateProject(payload.id, payload);
        req.flash('success', 'Cập nhật đề tài sinh viên thành công.');
      } else {
        await this.studentResearchModel.createProject(payload);
        req.flash('success', 'Thêm đề tài sinh viên mới thành công.');
      }
    } catch (error) {
      console.error('ResearchManagement.saveStudentProject error:', error);
      req.flash('error', error.message || 'Không thể lưu đề tài sinh viên.');
    }

    return res.redirect('/research/manage');
  }

  async deleteStudentProject(req, res) {
    const hasStudentProjects = await StudentResearch.tableExists('student_research_projects');
    if (!hasStudentProjects) {
      req.flash('error', 'Không thể xoá vì thiếu bảng student_research_projects.');
      return res.redirect('/research/manage');
    }

    const { id } = req.params;
    if (!id) {
      req.flash('error', 'Không xác định được đề tài sinh viên cần xoá.');
      return res.redirect('/research/manage');
    }

    try {
      await this.studentResearchModel.deleteProject(Number(id));
      req.flash('success', 'Đã xoá đề tài sinh viên.');
    } catch (error) {
      console.error('ResearchManagement.deleteStudentProject error:', error);
      req.flash('error', 'Không thể xoá đề tài sinh viên.');
    }

    return res.redirect('/research/manage');
  }

  validateStudentOutputPayload(body) {
    const errors = [];
    const payload = {
      id: body.id ? Number(body.id) : null,
      project_id: body.project_id ? Number(body.project_id) : null,
      type: body.type || 'other',
      title: (body.title || '').trim(),
      description: body.description ? body.description.trim() : null,
      publish_date: this.normalizeDate(body.publish_date),
      lead_author: body.lead_author ? body.lead_author.trim() : null,
      reference_url: body.reference_url ? body.reference_url.trim() : null
    };

    if (!payload.title) {
      errors.push('Vui lòng nhập tên kết quả khoa học.');
    }

    return { errors, payload };
  }

  async saveStudentOutput(req, res) {
    const hasProjects = await StudentResearch.tableExists('student_research_projects');
    const hasOutputs = await StudentResearch.tableExists('student_research_outputs');
    if (!hasProjects || !hasOutputs) {
      req.flash('error', 'Không thể lưu kết quả vì thiếu bảng dữ liệu sinh viên.');
      return res.redirect('/research/manage');
    }

    const { errors, payload } = this.validateStudentOutputPayload(req.body);

    if (errors.length) {
      req.flash('error', errors);
      return res.redirect('/research/manage');
    }

    try {
      if (payload.id) {
        await this.studentResearchModel.updateOutput(payload.id, payload);
        req.flash('success', 'Cập nhật kết quả khoa học thành công.');
      } else {
        await this.studentResearchModel.createOutput(payload);
        req.flash('success', 'Thêm kết quả khoa học mới thành công.');
      }
    } catch (error) {
      console.error('ResearchManagement.saveStudentOutput error:', error);
      req.flash('error', error.message || 'Không thể lưu kết quả khoa học.');
    }

    return res.redirect('/research/manage');
  }

  async deleteStudentOutput(req, res) {
    const hasOutputs = await StudentResearch.tableExists('student_research_outputs');
    if (!hasOutputs) {
      req.flash('error', 'Không thể xoá vì thiếu bảng student_research_outputs.');
      return res.redirect('/research/manage');
    }

    const { id } = req.params;
    if (!id) {
      req.flash('error', 'Không xác định được kết quả khoa học cần xoá.');
      return res.redirect('/research/manage');
    }

    try {
      await this.studentResearchModel.deleteOutput(Number(id));
      req.flash('success', 'Đã xoá kết quả khoa học.');
    } catch (error) {
      console.error('ResearchManagement.deleteStudentOutput error:', error);
      req.flash('error', 'Không thể xoá kết quả khoa học.');
    }

    return res.redirect('/research/manage');
  }
}

module.exports = ResearchManagementController;
