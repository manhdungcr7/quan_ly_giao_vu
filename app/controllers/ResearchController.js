const Project = require('../models/Project');
const Staff = require('../models/Staff');
const StudentResearch = require('../models/StudentResearch');

class ResearchController {
  constructor() {
    this.projectModel = new Project();
    this.staffModel = new Staff();
    this.studentResearchModel = new StudentResearch();
  }

  async safeCall(callback, fallback) {
    try {
      const result = await callback();
      if (result === undefined || result === null) {
        return typeof fallback === 'function' ? fallback() : fallback;
      }
      return result;
    } catch (error) {
      console.warn('ResearchController.safeCall: returning fallback due to error:', error.message);
      return typeof fallback === 'function' ? fallback() : fallback;
    }
  }

  formatDate(value) {
    if (!value) return 'Chưa cập nhật';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  relativeDays(targetDate) {
    if (!targetDate) return null;
    const target = new Date(targetDate);
    if (Number.isNaN(target.getTime())) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = (target - today) / (1000 * 60 * 60 * 24);
    if (diff === 0) return 'Đến hạn hôm nay';
    if (diff > 0) return `Còn ${Math.round(diff)} ngày`;
    return `Quá hạn ${Math.abs(Math.round(diff))} ngày`;
  }

  async getResearchProjects() {
    try {
      const { data } = await this.projectModel.getProjectsWithFilters(1, 120, {});
      return (data || []).map((item) => ({
        id: item.id,
        code: item.project_code,
        title: item.title,
        status: item.status,
        progress: Number(item.progress || 0),
        startDate: item.start_date,
        endDate: item.end_date,
        category: item.category_name,
        leader: item.leader_name,
        teamSize: item.team_size,
        budget: item.budget
      }));
    } catch (error) {
      console.warn('ResearchController.getResearchProjects: no data available:', error.message);
      return [];
    }
  }

  buildStatusDistribution(projects) {
    const distribution = projects.reduce((acc, project) => {
      acc[project.status] = (acc[project.status] || 0) + 1;
      return acc;
    }, {});

    return [
      { key: 'planning', label: 'Đang lập kế hoạch', value: distribution.planning || 0, tone: 'info' },
      { key: 'active', label: 'Đang triển khai', value: distribution.active || 0, tone: 'primary' },
      { key: 'completed', label: 'Đã nghiệm thu', value: distribution.completed || 0, tone: 'success' },
      { key: 'paused', label: 'Tạm dừng', value: distribution.paused || 0, tone: 'warning' },
      { key: 'cancelled', label: 'Ngừng triển khai', value: distribution.cancelled || 0, tone: 'danger' }
    ];
  }

  async getUpcomingMilestones(limit = 8) {
    try {
      const sql = `
        SELECT m.id, m.project_id, m.title, m.due_date, m.status, m.progress,
               p.project_code, p.title as project_title, u.full_name as leader_name
        FROM project_milestones m
        LEFT JOIN projects p ON m.project_id = p.id
        LEFT JOIN staff s ON p.leader_id = s.id
        LEFT JOIN users u ON s.user_id = u.id
        WHERE m.due_date IS NOT NULL
        ORDER BY m.due_date ASC
        LIMIT ?
      `;
      return await this.projectModel.db.findMany(sql, [limit]);
    } catch (error) {
      console.error('ResearchController.getUpcomingMilestones error:', error);
      return [];
    }
  }

  async getFacultyLeaderboard(limit = 6) {
    try {
      const sql = `
        SELECT 
          u.full_name as leader_name,
          d.name as department_name,
          COUNT(p.id) as total_projects,
          SUM(CASE WHEN p.status = 'completed' THEN 1 ELSE 0 END) as completed_projects,
          AVG(p.progress) as avg_progress,
          MIN(p.start_date) as first_project,
          MAX(p.updated_at) as last_update
        FROM projects p
        LEFT JOIN staff s ON p.leader_id = s.id
        LEFT JOIN users u ON s.user_id = u.id
        LEFT JOIN departments d ON s.department_id = d.id
        GROUP BY u.full_name, d.name
        ORDER BY total_projects DESC, avg_progress DESC
        LIMIT ?
      `;
      const rows = await this.projectModel.db.findMany(sql, [limit]);
      return rows.map((row) => ({
        leaderName: row.leader_name || 'Chưa cập nhật',
        departmentName: row.department_name || 'Không rõ đơn vị',
        totalProjects: Number(row.total_projects || 0),
        completedProjects: Number(row.completed_projects || 0),
        avgProgress: Number(row.avg_progress || 0).toFixed(0),
        lastUpdate: this.formatDate(row.last_update)
      }));
    } catch (error) {
      console.error('ResearchController.getFacultyLeaderboard error:', error);
      return [];
    }
  }

  buildProjectShowcase(projects, limit = 6) {
    return projects
      .sort((a, b) => (b.progress || 0) - (a.progress || 0))
      .slice(0, limit)
      .map((project) => ({
        id: project.id,
        code: project.code,
        title: project.title,
        status: project.status,
        statusLabel: this.statusLabel(project.status),
        progress: project.progress,
        leader: project.leader,
        teamSize: project.teamSize,
        startDateLabel: this.formatDate(project.startDate),
        endDateLabel: this.formatDate(project.endDate)
      }));
  }

  statusLabel(status) {
    switch (status) {
      case 'planning':
        return 'Đang lập kế hoạch';
      case 'active':
        return 'Đang triển khai';
      case 'completed':
        return 'Đã nghiệm thu';
      case 'paused':
        return 'Tạm dừng';
      case 'cancelled':
        return 'Ngừng triển khai';
      default:
        return 'Chưa xác định';
    }
  }

  buildAlerts(projects) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const alerts = [];

    const overdue = projects.filter((project) => {
      if (!project.endDate || project.status === 'completed') return false;
      const end = new Date(project.endDate);
      if (Number.isNaN(end.getTime())) return false;
      end.setHours(0, 0, 0, 0);
      return end < today;
    });

    if (overdue.length) {
      alerts.push({
        tone: 'danger',
        title: `${overdue.length} đề tài đã quá hạn`,
        description: 'Cần rà soát tiến độ và cập nhật thời hạn nghiệm thu hoặc điều chỉnh kế hoạch.',
        items: overdue.slice(0, 3).map((item) => `${item.code} · ${item.title}`)
      });
    }

    const slowProgress = projects.filter((project) => project.status === 'active' && project.progress < 40);
    if (slowProgress.length) {
      alerts.push({
        tone: 'warning',
        title: `${slowProgress.length} đề tài tiến độ thấp`,
        description: 'Xem xét hỗ trợ nguồn lực hoặc tổ chức họp điều phối.',
        items: slowProgress.slice(0, 3).map((item) => `${item.code} · ${item.leader}`)
      });
    }

    return alerts;
  }

  mapStudentProjects(projects) {
    return (projects || []).map((item) => ({
      id: item.id,
      code: item.project_code,
      title: item.title,
      field: item.field,
      status: item.status,
      statusLabel: this.studentStatusLabel(item.status),
      leadStudent: item.lead_student,
      teamSize: item.team_size,
      supervisorName: item.supervisor_name,
      progress: Number(item.progress || 0),
      startDateLabel: this.formatDate(item.start_date),
      endDateLabel: this.formatDate(item.end_date),
      summary: item.summary
    }));
  }

  studentStatusLabel(status) {
    switch (status) {
      case 'proposal':
        return 'Đề xuất';
      case 'in_progress':
        return 'Đang thực hiện';
      case 'completed':
        return 'Đã hoàn thành';
      case 'archived':
        return 'Lưu trữ';
      default:
        return 'Chưa xác định';
    }
  }

  mapStudentOutputs(outputs) {
    return (outputs || []).map((item) => ({
      id: item.id,
      type: item.type,
      typeLabel: this.outputTypeLabel(item.type),
      title: item.title,
      projectTitle: item.project_title,
      leadStudent: item.lead_student,
      publishDateLabel: this.formatDate(item.publish_date),
      description: item.description,
      link: item.reference_url
    }));
  }

  outputTypeLabel(type) {
    switch (type) {
      case 'paper':
        return 'Bài báo';
      case 'presentation':
        return 'Báo cáo / Hội nghị';
      case 'award':
        return 'Giải thưởng';
      case 'patent':
        return 'Bằng sáng chế';
      default:
        return 'Kết quả';
    }
  }

  buildTimeline(milestones) {
    return (milestones || []).map((item) => ({
      id: item.id,
      title: item.title,
      projectTitle: item.project_title,
      leaderName: item.leader_name,
      dueDateLabel: this.formatDate(item.due_date),
      relativeLabel: this.relativeDays(item.due_date),
      status: item.status,
      progress: item.progress,
      projectCode: item.project_code
    }));
  }

  async index(req, res) {
    const projects = await this.safeCall(() => this.getResearchProjects(), []);
    const projectStats = await this.safeCall(() => this.projectModel.getStats(), {
      total_projects: 0,
      planning_count: 0,
      active_count: 0,
      completed_count: 0,
      paused_count: 0,
      total_budget: 0,
      avg_progress: 0
    });
    const milestones = await this.safeCall(() => this.getUpcomingMilestones(), []);
    const facultyLeaderboard = await this.safeCall(() => this.getFacultyLeaderboard(), []);
    const studentStats = await this.safeCall(() => this.studentResearchModel.getStats(), {
      totalProjects: 0,
      activeProjects: 0,
      completedProjects: 0,
      proposalCount: 0,
      inProgressCount: 0,
      teamSizeTotal: 0,
      advisors: 0
    });
    const studentProjects = await this.safeCall(() => this.studentResearchModel.getActiveProjects({ limit: 8 }), []);
    const studentOutputs = await this.safeCall(() => this.studentResearchModel.getRecentOutputs({ limit: 6 }), []);
    const fieldDistribution = await this.safeCall(() => this.studentResearchModel.getFieldDistribution(), []);

    const avgProgress = typeof projectStats?.avg_progress === 'number'
      ? Math.round(Number(projectStats.avg_progress))
      : null;
    const summaryCards = [
      {
        key: 'totalProjects',
        label: 'Tổng số đề tài',
        value: projectStats?.total_projects || 0,
        hint: `${projectStats?.active_count || 0} đề tài đang triển khai`,
        tone: 'primary'
      },
      {
        key: 'completedProjects',
        label: 'Đã nghiệm thu',
        value: projectStats?.completed_count || 0,
        hint: avgProgress !== null ? `${avgProgress}% tiến độ trung bình` : 'Đang cập nhật tiến độ trung bình',
        tone: 'success'
      },
      {
        key: 'budget',
        label: 'Tổng kinh phí',
        value: projectStats?.total_budget ? `${Number(projectStats.total_budget).toLocaleString('vi-VN')} đ` : 'Đang cập nhật',
        hint: 'Bao gồm đề tài cấp khoa, cấp trường, cấp Bộ',
        tone: 'info'
      },
      {
        key: 'studentProjects',
        label: 'Đề tài sinh viên',
        value: studentStats?.totalProjects || 0,
        hint: `${studentStats?.activeProjects || 0} đề tài đang triển khai`,
        tone: 'warning'
      }
    ];

    const statusDistribution = this.buildStatusDistribution(projects);
    const projectShowcase = this.buildProjectShowcase(projects, 6);
    const alerts = this.buildAlerts(projects);
    const mappedStudentProjects = this.mapStudentProjects(studentProjects);
    const mappedOutputs = this.mapStudentOutputs(studentOutputs);
    const timeline = this.buildTimeline(milestones);
    const user = req.session?.user;
    const permissions = Array.isArray(user?.permissions) ? user.permissions : [];
    const canManageResearch = user?.role_name === 'admin' || permissions.includes('manage_research');

    res.render('research/index', {
      title: 'Nghiên cứu khoa học',
      user: req.session.user,
      summaryCards,
      statusDistribution,
      projectShowcase,
      alerts,
      facultyLeaderboard,
      studentStats,
      studentProjects: mappedStudentProjects,
      studentOutputs: mappedOutputs,
      fieldDistribution,
      timeline,
      canManageResearch,
      manageUrl: '/research/manage'
    });
  }
}

module.exports = ResearchController;
