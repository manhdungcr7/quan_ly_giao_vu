// ========================================
// SỔ TAY CÔNG TÁC - WORKBOOK MODULE
// Xử lý tất cả các chức năng tương tác
// ========================================

console.log('🚀 Workbook module loading...');

// Global state
let currentWorkbookId = null;
let currentDayOfWeek = null;
let currentWeekStart = null;
let currentWeekEnd = null;

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', function() {
  console.log('✅ DOM loaded, initializing workbook...');
  
  initializeWorkbook();
  attachEventListeners();
  loadProgressBars();
  
  console.log('✅ Workbook initialized successfully');
});

// Initialize workbook
function initializeWorkbook() {
  // Get workbook data from page
  const workbookLayout = document.querySelector('.workbook-layout');
  if (workbookLayout) {
    const firstCard = document.querySelector('.day-card');
    if (firstCard) {
      currentWorkbookId = firstCard.dataset.workbookId;
    }
  }
}

// ========== EVENT LISTENERS ==========
function attachEventListeners() {
  // Week navigation
  attachWeekNavigation();
  
  // Day card edit buttons
  attachDayCardEditors();
  
  // Modal controls
  attachModalControls();
  
  // Form submission
  attachFormSubmission();
  
  // Add task button
  attachAddTaskButton();
  
  // Progress slider
  attachProgressSlider();
  
  // Quick actions
  attachQuickActions();
  
  // Save notes button
  attachSaveNotesButton();
}

// Week Navigation
function attachWeekNavigation() {
  const prevBtn = document.querySelector('[data-action="prev-week"]');
  const nextBtn = document.querySelector('[data-action="next-week"]');
  
  if (prevBtn) {
    prevBtn.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('⬅️ Previous week clicked');
      navigateWeek(-1);
    });
  }
  
  if (nextBtn) {
    nextBtn.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('➡️ Next week clicked');
      navigateWeek(1);
    });
  }
}

// Navigate to previous/next week
function navigateWeek(direction) {
  const weekDates = document.querySelector('.week-dates');
  if (!weekDates) return;
  
  const dateText = weekDates.textContent.trim();
  const dates = dateText.split(' - ');
  
  if (dates.length !== 2) return;
  
  // Parse dates (format: dd/mm)
  const [startDay, startMonth] = dates[0].split('/').map(Number);
  const currentYear = new Date().getFullYear();
  
  const startDate = new Date(currentYear, startMonth - 1, startDay);
  
  // Add/subtract 7 days
  startDate.setDate(startDate.getDate() + (direction * 7));
  
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);
  
  // Reload page with new week
  const url = new URL(window.location.href);
  url.searchParams.set('week_start', startDate.toISOString().split('T')[0]);
  window.location.href = url.toString();
}

// Day Card Editors
function attachDayCardEditors() {
  const editButtons = document.querySelectorAll('.card-edit-btn');
  
  editButtons.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      const dayOfWeek = this.dataset.day || this.getAttribute('data-day');
      const workbookId = this.dataset.workbook || this.getAttribute('data-workbook');
      
      console.log('✏️ Edit day:', dayOfWeek, 'Workbook:', workbookId);
      
      openEditModal(dayOfWeek, workbookId);
    });
  });
}

// Open Edit Modal
function openEditModal(dayOfWeek, workbookId) {
  const modal = document.getElementById('editDayModal');
  if (!modal) {
    console.error('❌ Modal not found');
    return;
  }
  
  currentDayOfWeek = dayOfWeek;
  currentWorkbookId = workbookId;
  
  // Set day name in modal
  const modalDayName = document.getElementById('modalDayName');
  const daysOfWeek = ['', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
  if (modalDayName) {
    modalDayName.textContent = daysOfWeek[dayOfWeek] || `Ngày ${dayOfWeek}`;
  }
  
  // Set hidden fields
  document.getElementById('modalWorkbookId').value = workbookId;
  document.getElementById('modalDayOfWeek').value = dayOfWeek;
  
  // Load existing data
  loadDayData(dayOfWeek);
  
  // Show modal
  modal.style.display = 'flex';
  modal.classList.add('active');
  
  // Trigger animation
  setTimeout(() => {
    const dialog = modal.querySelector('.modal-dialog');
    if (dialog) {
      dialog.style.transform = 'scale(1)';
      dialog.style.opacity = '1';
    }
  }, 10);
  
  console.log('✅ Modal opened for day:', dayOfWeek);
}

// Load day data
function loadDayData(dayOfWeek) {
  console.log('📥 Loading data for day:', dayOfWeek);
  
  // Find the day card
  const dayCard = document.querySelector(`.day-card[data-day="${dayOfWeek}"]`);
  if (!dayCard) {
    console.log('⚠️ Day card not found');
    return;
  }
  
  // Get existing data from card
  const mainFocusEl = dayCard.querySelector('.section-content');
  const tasksEl = dayCard.querySelector('.task-list');
  const notesSection = dayCard.querySelectorAll('.card-section')[2];
  const progressBar = dayCard.querySelector('.progress-fill');
  
  // Populate form
  const mainFocusInput = document.getElementById('mainFocus');
  const notesInput = document.getElementById('notes');
  const progressInput = document.getElementById('progress');
  
  if (mainFocusInput && mainFocusEl && !mainFocusEl.classList.contains('empty')) {
    mainFocusInput.value = mainFocusEl.textContent.trim();
  }
  
  if (notesInput && notesSection) {
    const notesContent = notesSection.querySelector('.section-content');
    if (notesContent && !notesContent.classList.contains('empty')) {
      notesInput.value = notesContent.textContent.trim();
    }
  }
  
  if (progressInput && progressBar) {
    const progress = progressBar.dataset.progress || 0;
    progressInput.value = progress;
    updateProgressDisplay(progress);
  }
  
  // Load tasks
  loadTasksIntoForm(tasksEl);
  
  console.log('✅ Data loaded');
}

// Load tasks into form
function loadTasksIntoForm(tasksEl) {
  const tasksList = document.getElementById('tasksList');
  if (!tasksList) return;
  
  // Clear existing tasks
  tasksList.innerHTML = '';
  
  if (tasksEl) {
    const taskItems = tasksEl.querySelectorAll('li');
    taskItems.forEach(item => {
      addTaskInput(item.textContent.trim());
    });
  }
  
  // Add one empty task if none exist
  if (tasksList.children.length === 0) {
    addTaskInput('');
  }
}

// Modal Controls
function attachModalControls() {
  const modal = document.getElementById('editDayModal');
  if (!modal) return;
  
  // Close buttons
  const closeButtons = modal.querySelectorAll('[data-action="close-modal"]');
  closeButtons.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      closeEditModal();
    });
  });
  
  // Click outside to close
  const backdrop = modal.querySelector('.modal-backdrop');
  if (backdrop) {
    backdrop.addEventListener('click', closeEditModal);
  }
  
  // ESC key to close
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.style.display === 'flex') {
      closeEditModal();
    }
  });
}

// Close Edit Modal
function closeEditModal() {
  const modal = document.getElementById('editDayModal');
  if (!modal) return;
  
  const dialog = modal.querySelector('.modal-dialog');
  if (dialog) {
    dialog.style.transform = 'scale(0.9)';
    dialog.style.opacity = '0';
  }
  
  setTimeout(() => {
    modal.style.display = 'none';
    modal.classList.remove('active');
    
    // Reset form
    const form = document.getElementById('dayEntryForm');
    if (form) form.reset();
    
    // Clear tasks
    const tasksList = document.getElementById('tasksList');
    if (tasksList) tasksList.innerHTML = '';
    
    console.log('✅ Modal closed');
  }, 300);
}

// Form Submission
function attachFormSubmission() {
  const form = document.getElementById('dayEntryForm');
  if (!form) return;
  
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    console.log('💾 Saving day entry...');
    
    saveDayEntry();
  });
}

// Save day entry
async function saveDayEntry() {
  const workbookId = document.getElementById('modalWorkbookId').value;
  const dayOfWeek = document.getElementById('modalDayOfWeek').value;
  const mainFocus = document.getElementById('mainFocus').value.trim();
  const notes = document.getElementById('notes').value.trim();
  const progress = document.getElementById('progress').value;
  
  // Collect tasks
  const taskInputs = document.querySelectorAll('#tasksList input[type="text"]');
  const tasks = [];
  taskInputs.forEach(input => {
    const value = input.value.trim();
    if (value) tasks.push(value);
  });
  
  const data = {
    workbook_id: workbookId,
    day_of_week: dayOfWeek,
    main_focus: mainFocus,
    tasks: JSON.stringify(tasks),
    notes: notes,
    progress: progress
  };
  
  console.log('📤 Sending data:', data);
  
  try {
    const response = await fetch('/workbook/entry', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Saved successfully:', result);
      
      showNotification('Đã lưu thành công!', 'success');
      
      // Update the day card
      updateDayCard(dayOfWeek, data);
      
      // Close modal
      closeEditModal();
    } else {
      const error = await response.json();
      console.error('❌ Save failed:', error);
      showNotification('Lỗi: ' + (error.message || 'Không thể lưu'), 'error');
    }
  } catch (error) {
    console.error('❌ Network error:', error);
    showNotification('Lỗi kết nối. Vui lòng thử lại.', 'error');
  }
}

// Update day card after save
function updateDayCard(dayOfWeek, data) {
  const dayCard = document.querySelector(`.day-card[data-day="${dayOfWeek}"]`);
  if (!dayCard) return;
  
  // Update main focus
  const mainFocusEl = dayCard.querySelector('.section-content');
  if (mainFocusEl) {
    if (data.main_focus) {
      mainFocusEl.textContent = data.main_focus;
      mainFocusEl.classList.remove('empty');
    } else {
      mainFocusEl.textContent = 'Chưa có mục tiêu';
      mainFocusEl.classList.add('empty');
    }
  }
  
  // Update tasks
  const tasksSection = dayCard.querySelectorAll('.card-section')[1];
  if (tasksSection) {
    const tasksList = tasksSection.querySelector('.task-list');
    const tasks = JSON.parse(data.tasks || '[]');
    
    if (tasks.length > 0) {
      let tasksHTML = '<ul class="task-list">';
      tasks.forEach(task => {
        tasksHTML += `<li>${escapeHtml(task)}</li>`;
      });
      tasksHTML += '</ul>';
      
      if (tasksList) {
        tasksList.parentElement.innerHTML = `
          <h4 class="section-title">
            <i class="fas fa-tasks"></i>
            Công việc
          </h4>
          ${tasksHTML}
        `;
      }
    } else {
      if (tasksList) {
        tasksList.parentElement.innerHTML = `
          <h4 class="section-title">
            <i class="fas fa-tasks"></i>
            Công việc
          </h4>
          <p class="section-content empty">
            <i class="fas fa-plus-circle"></i> Thêm công việc
          </p>
        `;
      }
    }
  }
  
  // Update notes
  const notesSection = dayCard.querySelectorAll('.card-section')[2];
  if (notesSection && data.notes) {
    notesSection.innerHTML = `
      <h4 class="section-title">
        <i class="fas fa-sticky-note"></i>
        Ghi chú
      </h4>
      <p class="section-content">${escapeHtml(data.notes)}</p>
    `;
  }
  
  // Update progress
  const progressFill = dayCard.querySelector('.progress-fill');
  const progressText = dayCard.querySelector('.progress-text');
  if (progressFill && progressText) {
    progressFill.style.width = data.progress + '%';
    progressFill.dataset.progress = data.progress;
    progressText.textContent = data.progress + '%';
  }
  
  console.log('✅ Day card updated');
}

// Add Task Button
function attachAddTaskButton() {
  const addTaskBtn = document.querySelector('[data-action="add-task"]');
  if (!addTaskBtn) return;
  
  addTaskBtn.addEventListener('click', function(e) {
    e.preventDefault();
    console.log('➕ Adding new task input');
    addTaskInput('');
  });
}

// Add task input
function addTaskInput(value = '') {
  const tasksList = document.getElementById('tasksList');
  if (!tasksList) return;
  
  const taskGroup = document.createElement('div');
  taskGroup.className = 'task-input-group';
  
  taskGroup.innerHTML = `
    <input 
      type="text" 
      class="form-control task-input" 
      placeholder="Nhập công việc..."
      value="${escapeHtml(value)}">
    <button type="button" class="task-remove-btn" title="Xóa">
      <i class="fas fa-times"></i>
    </button>
  `;
  
  tasksList.appendChild(taskGroup);
  
  // Attach remove button event
  const removeBtn = taskGroup.querySelector('.task-remove-btn');
  removeBtn.addEventListener('click', function() {
    taskGroup.remove();
    console.log('🗑️ Task removed');
  });
  
  // Focus on new input
  const input = taskGroup.querySelector('input');
  input.focus();
}

// Progress Slider
function attachProgressSlider() {
  const progressSlider = document.getElementById('progress');
  const progressDisplay = document.getElementById('progressDisplay');
  
  if (!progressSlider || !progressDisplay) return;
  
  progressSlider.addEventListener('input', function() {
    updateProgressDisplay(this.value);
  });
}

// Update progress display
function updateProgressDisplay(value) {
  const progressDisplay = document.getElementById('progressDisplay');
  if (progressDisplay) {
    progressDisplay.textContent = value + '%';
  }
}

// Load progress bars on page load
function loadProgressBars() {
  const progressFills = document.querySelectorAll('.progress-fill');
  
  progressFills.forEach(fill => {
    const progress = fill.dataset.progress || 0;
    // Animate progress bar
    setTimeout(() => {
      fill.style.width = progress + '%';
    }, 100);
  });
}

// Quick Actions
function attachQuickActions() {
  const addWeekBtn = document.querySelector('[data-action="add-week"]');
  const submitBtn = document.querySelector('[data-action="submit-workbook"]');
  
  if (addWeekBtn) {
    addWeekBtn.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('➕ Add week clicked');
      addWeek();
    });
  }
  
  if (submitBtn) {
    submitBtn.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('📤 Submit workbook clicked');
      submitWorkbook();
    });
  }
}

// Add new week
function addWeek() {
  if (!confirm('Bạn muốn tạo sổ tay cho tuần tiếp theo?')) {
    return;
  }
  
  // Get current week end date and add 1 day
  const weekDates = document.querySelector('.week-dates');
  if (!weekDates) return;
  
  const dateText = weekDates.textContent.trim();
  const dates = dateText.split(' - ');
  
  if (dates.length !== 2) return;
  
  // Parse end date
  const [endDay, endMonth] = dates[1].split('/').map(Number);
  const currentYear = new Date().getFullYear();
  
  const endDate = new Date(currentYear, endMonth - 1, endDay);
  const nextWeekStart = new Date(endDate);
  nextWeekStart.setDate(nextWeekStart.getDate() + 1);
  
  // Redirect to new week
  const url = new URL(window.location.href);
  url.searchParams.set('week_start', nextWeekStart.toISOString().split('T')[0]);
  window.location.href = url.toString();
}

// Submit workbook for approval
async function submitWorkbook() {
  if (!confirm('Bạn muốn gửi sổ tay này để phê duyệt?')) {
    return;
  }
  
  const workbookId = currentWorkbookId;
  if (!workbookId) {
    showNotification('Không tìm thấy sổ tay', 'error');
    return;
  }
  
  try {
    const response = await fetch(`/workbook/${workbookId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      showNotification('Đã gửi sổ tay để phê duyệt!', 'success');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } else {
      const error = await response.json();
      showNotification('Lỗi: ' + (error.message || 'Không thể gửi'), 'error');
    }
  } catch (error) {
    console.error('❌ Submit error:', error);
    showNotification('Lỗi kết nối. Vui lòng thử lại.', 'error');
  }
}

// Save Notes Button
function attachSaveNotesButton() {
  const saveNotesBtn = document.querySelector('.btn-save-notes');
  if (!saveNotesBtn) return;
  
  saveNotesBtn.addEventListener('click', async function(e) {
    e.preventDefault();
    
    const notesTextarea = document.querySelector('.quick-notes');
    if (!notesTextarea) return;
    
    const notes = notesTextarea.value.trim();
    
    console.log('💾 Saving quick notes...');
    
    // Save to localStorage (or send to backend)
    localStorage.setItem('workbook_quick_notes', notes);
    
    showNotification('Đã lưu ghi chú!', 'success');
  });
  
  // Load saved notes
  const notesTextarea = document.querySelector('.quick-notes');
  if (notesTextarea) {
    const savedNotes = localStorage.getItem('workbook_quick_notes');
    if (savedNotes) {
      notesTextarea.value = savedNotes;
    }
  }
}

// ========== UTILITY FUNCTIONS ==========

// Show notification
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  
  const icon = type === 'success' ? 'check-circle' : 
                type === 'error' ? 'exclamation-circle' : 
                'info-circle';
  
  notification.innerHTML = `
    <i class="fas fa-${icon}"></i>
    <span>${message}</span>
  `;
  
  Object.assign(notification.style, {
    position: 'fixed',
    top: '20px',
    right: '20px',
    background: type === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' : 
                type === 'error' ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 
                'linear-gradient(135deg, #3b82f6, #2563eb)',
    color: 'white',
    padding: '1rem 1.5rem',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    zIndex: '10000',
    animation: 'slideInRight 0.3s ease-out',
    fontWeight: '600',
    fontSize: '0.9375rem'
  });
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease-out';
    setTimeout(() => {
      if (notification.parentElement) {
        document.body.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Add notification animations
if (!document.getElementById('workbook-animations')) {
  const style = document.createElement('style');
  style.id = 'workbook-animations';
  style.textContent = `
    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes slideOutRight {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
    
    .modal-dialog {
      transform: scale(0.9);
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .modal.active .modal-dialog {
      transform: scale(1);
      opacity: 1;
    }
  `;
  document.head.appendChild(style);
}

console.log('✅ Workbook module loaded successfully');

console.log('✅ Workbook module loaded successfully');
