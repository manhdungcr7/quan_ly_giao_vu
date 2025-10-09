const fs = require('fs');
const path = require('path');

const content = `<% contentFor('css', '<link rel="stylesheet" href="/css/workbook-new.css?v=3">') %>

<div class="workbook-layout">
  <!-- Left Sidebar -->
  <aside class="workbook-sidebar">
    <!-- Week Selector -->
    <div class="sidebar-card">
      <h3 class="sidebar-card-title">
        <i class="fas fa-calendar-week"></i>
        Chọn tuần
      </h3>
      <div class="week-selector">
        <button class="week-nav-btn" data-action="prev-week">
          <i class="fas fa-chevron-left"></i>
        </button>
        <div class="current-week">
          <div class="week-label">Tuần hiện tại</div>
          <div class="week-dates">
            <%= new Date(weekStart).toLocaleDateString('vi-VN', {day: '2-digit', month: '2-digit'}) %> - 
            <%= new Date(weekEnd).toLocaleDateString('vi-VN', {day: '2-digit', month: '2-digit'}) %>
          </div>
        </div>
        <button class="week-nav-btn" data-action="next-week">
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>

    <!-- Personal Info -->
    <div class="sidebar-card">
      <h3 class="sidebar-card-title">
        <i class="fas fa-user"></i>
        Thông tin
      </h3>
      <div class="info-list">
        <div class="info-item">
          <span class="info-label">Cá nhân:</span>
          <span class="info-value"><%= user.full_name || user.username %></span>
        </div>
        <div class="info-item">
          <span class="info-label">Trạng thái:</span>
          <span class="status-badge status-draft">Bản nháp</span>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="sidebar-card">
      <h3 class="sidebar-card-title">
        <i class="fas fa-bolt"></i>
        Thao tác
      </h3>
      <div class="action-buttons">
        <button class="action-btn btn-add" data-action="add-week">
          <i class="fas fa-plus-circle"></i>
          <span>Thêm tuần</span>
        </button>
        <button class="action-btn btn-submit" data-action="submit-workbook">
          <i class="fas fa-paper-plane"></i>
          <span>Gửi duyệt</span>
        </button>
      </div>
    </div>
  </aside>

  <!-- Main Content -->
  <main class="workbook-main">
    <div class="main-header">
      <h2 class="page-title">
        <i class="fas fa-book-open"></i>
        Kế hoạch công tác tuần
      </h2>
      <div class="view-toggle">
        <button class="toggle-btn active" data-view="grid">
          <i class="fas fa-th-large"></i>
        </button>
        <button class="toggle-btn" data-view="list">
          <i class="fas fa-list"></i>
        </button>
      </div>
    </div>

    <!-- Days Grid -->
    <div class="days-grid">
      <% 
        const daysOfWeek = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
        const entryMap = {};
        entries.forEach(entry => {
          entryMap[entry.day_of_week] = entry;
        });
        
        for(let day = 1; day <= 7; day++) {
          const entry = entryMap[day] || {};
          const currentDate = new Date(weekStart);
          currentDate.setDate(currentDate.getDate() + (day - 1));
          const progressValue = entry.progress || 0;
          const dateStr = currentDate.toLocaleDateString('vi-VN', {day: '2-digit', month: '2-digit'});
      %>
      <div class="day-card" data-day="<%= day %>" data-workbook-id="<%= workbook.id %>">
        <div class="day-card-header">
          <div class="day-info">
            <h3 class="day-title"><%= daysOfWeek[day - 1] %></h3>
            <span class="day-date"><%= dateStr %></span>
          </div>
          <button class="card-edit-btn" data-day="<%= day %>" data-workbook="<%= workbook.id %>">
            <i class="fas fa-edit"></i>
          </button>
        </div>

        <div class="progress-bar-container">
          <div class="progress-bar">
            <div class="progress-fill" data-progress="<%= progressValue %>"></div>
          </div>
          <span class="progress-text"><%= progressValue %>%</span>
        </div>

        <div class="day-card-body">
          <div class="card-section">
            <h4 class="section-title">
              <i class="fas fa-bullseye"></i>
              Main Focus
            </h4>
            <p class="section-content <%= entry.main_focus ? '' : 'empty' %>">
              <%= entry.main_focus || 'Chưa có mục tiêu' %>
            </p>
          </div>

          <div class="card-section">
            <h4 class="section-title">
              <i class="fas fa-tasks"></i>
              Công việc
            </h4>
            <% if(entry.tasks) { 
              const tasks = typeof entry.tasks === 'string' ? JSON.parse(entry.tasks) : entry.tasks;
              if(Array.isArray(tasks) && tasks.length > 0) {
            %>
              <ul class="task-list">
                <% tasks.forEach(task => { %>
                  <li><%= task %></li>
                <% }); %>
              </ul>
            <% } else { %>
              <p class="section-content empty">Chưa có công việc</p>
            <% } 
            } else { %>
              <p class="section-content empty">
                <i class="fas fa-plus-circle"></i> Thêm công việc
              </p>
            <% } %>
          </div>

          <% if(entry.notes) { %>
          <div class="card-section">
            <h4 class="section-title">
              <i class="fas fa-sticky-note"></i>
              Ghi chú
            </h4>
            <p class="section-content"><%= entry.notes %></p>
          </div>
          <% } %>
        </div>
      </div>
      <% } %>
    </div>
  </main>

  <!-- Right Panel -->
  <aside class="workbook-stats">
    <div class="stats-card">
      <h3 class="stats-card-title">
        <i class="fas fa-chart-line"></i>
        Tiến độ tuần
      </h3>
      <div class="progress-circle-large">
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="50" stroke="#e5e7eb" stroke-width="8" fill="none"/>
          <circle cx="60" cy="60" r="50" 
                  stroke="#3b82f6" 
                  stroke-width="8" 
                  fill="none"
                  stroke-dasharray="314.16" 
                  data-offset="<%= 314.16 - (progress.average * 314.16 / 100) %>"
                  transform="rotate(-90 60 60)"
                  stroke-linecap="round"/>
          <text x="60" y="70" text-anchor="middle" font-size="24" font-weight="bold" fill="#1f2937">
            <%= Math.round(progress.average) %>%
          </text>
        </svg>
      </div>
      <div class="stats-summary">
        <div class="stat-item">
          <span class="stat-value"><%= progress.completed %></span>
          <span class="stat-label">Hoàn thành</span>
        </div>
        <div class="stat-item">
          <span class="stat-value"><%= progress.inProgress %></span>
          <span class="stat-label">Đang làm</span>
        </div>
        <div class="stat-item">
          <span class="stat-value"><%= progress.total %></span>
          <span class="stat-label">Tổng số</span>
        </div>
      </div>
    </div>

    <div class="stats-card">
      <h3 class="stats-card-title">
        <i class="fas fa-lightbulb"></i>
        Ghi chú nhanh
      </h3>
      <textarea 
        class="quick-notes" 
        placeholder="Ghi chú nhanh cho tuần này..."
        rows="6"></textarea>
      <button class="btn-save-notes">
        <i class="fas fa-save"></i>
        Lưu ghi chú
      </button>
    </div>

    <div class="stats-card">
      <h3 class="stats-card-title">
        <i class="fas fa-bell"></i>
        Thông báo
      </h3>
      <div class="notification-list">
        <div class="notification-item">
          <i class="fas fa-info-circle"></i>
          <span>Hạn nộp: Thứ 6 tuần này</span>
        </div>
      </div>
    </div>
  </aside>
</div>

<div id="editDayModal" class="modal" style="display: none;">
  <div class="modal-backdrop"></div>
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">
          <i class="fas fa-edit"></i>
          Chi tiết công việc - <span id="modalDayName"></span>
        </h3>
        <button type="button" class="modal-close" data-action="close-modal">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <form id="dayEntryForm">
        <div class="modal-body">
          <input type="hidden" id="modalWorkbookId" name="workbook_id">
          <input type="hidden" id="modalDayOfWeek" name="day_of_week">
          
          <div class="form-group">
            <label for="mainFocus">
              <i class="fas fa-bullseye"></i>
              Mục tiêu chính trong ngày
            </label>
            <input 
              type="text" 
              id="mainFocus" 
              name="main_focus"
              class="form-control"
              placeholder="VD: Hoàn thành báo cáo tháng"
              maxlength="200">
          </div>
          
          <div class="form-group">
            <label>
              <i class="fas fa-tasks"></i>
              Danh sách công việc
            </label>
            <div id="tasksList" class="tasks-container">
            </div>
            <button type="button" class="btn btn-secondary btn-sm" data-action="add-task">
              <i class="fas fa-plus"></i>
              Thêm công việc
            </button>
          </div>
          
          <div class="form-group">
            <label for="notes">
              <i class="fas fa-sticky-note"></i>
              Ghi chú
            </label>
            <textarea 
              id="notes" 
              name="notes"
              class="form-control"
              rows="3"
              placeholder="Ghi chú bổ sung..."></textarea>
          </div>
          
          <div class="form-group">
            <label for="progress">
              <i class="fas fa-chart-line"></i>
              Tiến độ hoàn thành
            </label>
            <div class="progress-input-group">
              <input 
                type="range" 
                id="progress" 
                name="progress"
                class="progress-slider"
                min="0" 
                max="100" 
                value="0">
              <span id="progressDisplay" class="progress-display">0%</span>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-action="close-modal">
            <i class="fas fa-times"></i>
            Hủy
          </button>
          <button type="submit" class="btn btn-primary">
            <i class="fas fa-save"></i>
            Lưu
          </button>
        </div>
      </form>
    </div>
  </div>
</div>

<% contentFor('js', '<script src="/js/workbook.js?v=3"></script>') %>
`;

const targetPath = path.join(__dirname, 'views', 'workbook', 'index.ejs');
fs.writeFileSync(targetPath, content, 'utf8');
console.log('✅ File created successfully:', targetPath);
