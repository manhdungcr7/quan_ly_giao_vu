/**
 * SỔ TAY CÔNG TÁC - ENHANCED VERSION  
 * Quản lý sổ tay công tác với kết nối database
 * Compatible với Enhanced Modal v2024100307
 */

(function() {
  'use strict';

  // Compatibility check với Enhanced Modal
  let enhancedModalAvailable = false;
  
  // Global state
  let currentWorkbookId = null;
  let currentEntries = {};

  const apiBaseUrl = (() => {
    const { protocol, hostname, port } = window.location;
    if (protocol === 'https:' && (hostname === 'localhost' || hostname === '127.0.0.1')) {
      return `http://${hostname}${port ? `:${port}` : ''}`;
    }
    return `${protocol}//${hostname}${port ? `:${port}` : ''}`;
  })();

  function buildApiUrl(path) {
    if (!path) {
      return apiBaseUrl;
    }

    if (/^https?:\/\//i.test(path)) {
      return path;
    }

    if (!path.startsWith('/')) {
      return `${apiBaseUrl}/${path}`;
    }

    return `${apiBaseUrl}${path}`;
  }
  // Date helpers for week navigation
  function parseISODate(value) {
    if (value instanceof Date) {
      return new Date(value.getFullYear(), value.getMonth(), value.getDate());
    }
    if (typeof value === 'string' && value) {
      const parts = value.split('-').map(Number);
      if (parts.length === 3 && parts.every((num) => !Number.isNaN(num))) {
        const [year, month, day] = parts;
        return new Date(year, month - 1, day);
      }
    }
    return null;
  }

  function toISODateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function addDays(date, days) {
    const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    result.setDate(result.getDate() + days);
    return result;
  }

  function normalizeToMonday(date) {
    const normalized = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const day = normalized.getDay();
    const diff = normalized.getDate() - day + (day === 0 ? -6 : 1);
    normalized.setDate(diff);
    return normalized;
  }

  function getWeekRange(date) {
    const start = normalizeToMonday(date);
    const end = addDays(start, 6);
    return { start, end };
  }

  function formatWeekRangeLabel(startDate, endDate) {
    const startLabel = startDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    const endLabel = endDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    return `${startLabel} - ${endLabel}`;
  }
  
  // Enhanced Modal Compatibility Layer
  function checkEnhancedModal() {
    // Đợi enhanced modal load xong
    setTimeout(() => {
      if (window.enhancedModal && typeof window.enhancedModal === 'object') {
        enhancedModalAvailable = true;
        console.log('✅ Enhanced Modal detected and available');
      } else {
        console.log('ℹ️ Enhanced Modal not detected, using fallback');
      }
    }, 500);
  }

  /**
   * Initialize workbook functionality
   */
  function init() {
    console.log('🚀 Workbook Enhanced v2.0 initialized');
    
    // Check enhanced modal availability
    checkEnhancedModal();
    
    // Get workbook ID from page
    const workbookElement = document.querySelector('[data-workbook-id]');
    if (workbookElement) {
      currentWorkbookId = workbookElement.dataset.workbookId;
    }
    
    // Setup event listeners
    setupEventListeners();
    
    // Load progress bars
    updateAllProgressBars();
    
    // Load entries data
    loadEntriesData();
  }

  /**
   * Setup all event listeners
   */
  function setupEventListeners() {
    console.log('🔧 Setting up event listeners...');
    
    // Week navigation buttons
    const prevWeekBtn = document.querySelector('[data-action="prev-week"]');
    const nextWeekBtn = document.querySelector('[data-action="next-week"]');
    
    console.log('Prev week button:', prevWeekBtn);
    console.log('Next week button:', nextWeekBtn);
    
    if (prevWeekBtn) {
      prevWeekBtn.addEventListener('click', navigateToPreviousWeek);
      console.log('✅ Prev week button listener added');
    }
    if (nextWeekBtn) {
      nextWeekBtn.addEventListener('click', navigateToNextWeek);
      console.log('✅ Next week button listener added');
    }

    // Week chips timeline
    const weekChips = document.querySelectorAll('[data-action="select-week"]');
    weekChips.forEach((chip) => {
      chip.addEventListener('click', (event) => {
        event.preventDefault();
        const weekStart = chip.dataset.weekStart;
        const label = chip.dataset.displayLabel || 'tuần đã chọn';
        navigateToWeekRange(weekStart, {
          label,
          loadingMessage: 'Đang tải tuần được chọn...'
        });
      });
    });

    // Date picker quick navigation
    const weekDateInput = document.querySelector('[data-action="week-date-input"]');
    const weekDateApplyBtn = document.querySelector('[data-action="week-date-apply"]');

    if (weekDateInput) {
      weekDateInput.addEventListener('change', () => {
        handleWeekDateSelection(weekDateInput.value);
      });
      weekDateInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          handleWeekDateSelection(weekDateInput.value);
        }
      });
    }

    if (weekDateApplyBtn && weekDateInput) {
      weekDateApplyBtn.addEventListener('click', (event) => {
        event.preventDefault();
        handleWeekDateSelection(weekDateInput.value);
      });
    }

    // Action buttons
    const addWeekBtn = document.querySelector('[data-action="add-week"]');
    const submitBtn = document.querySelector('[data-action="submit-workbook"]');
    
    console.log('Add week button:', addWeekBtn);
    console.log('Submit button:', submitBtn);
    
    if (addWeekBtn) {
      addWeekBtn.addEventListener('click', addNewWeek);
      console.log('✅ Add week button listener added');
    }
    if (submitBtn) {
      submitBtn.addEventListener('click', submitWorkbook);
      console.log('✅ Submit button listener added');
    }

    // Edit buttons on day cards
    const editButtons = document.querySelectorAll('.card-edit-btn');
    console.log('Edit buttons found:', editButtons.length);
    editButtons.forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const day = this.dataset.day;
        const workbookId = this.dataset.workbook;
        console.log('Edit button clicked for day:', day);
        openEditModal(day, workbookId);
      });
    });

    // Modal close buttons
    const modalCloseButtons = document.querySelectorAll('[data-action="close-modal"]');
    console.log('Modal close buttons found:', modalCloseButtons.length);
    modalCloseButtons.forEach(btn => {
      btn.addEventListener('click', closeModal);
    });

    // Modal form submission
    const dayForm = document.getElementById('dayEntryForm');
    if (dayForm) {
      dayForm.addEventListener('submit', handleFormSubmit);
      console.log('✅ Form submit listener added');
    }

    // Progress slider
    const progressSlider = document.getElementById('progress');
    const progressDisplay = document.getElementById('progressDisplay');
    if (progressSlider && progressDisplay) {
      progressSlider.addEventListener('input', function() {
        progressDisplay.textContent = this.value + '%';
      });
      console.log('✅ Progress slider listener added');
    }

    // Save notes button
    const saveNotesBtn = document.querySelector('.btn-save-notes');
    console.log('Save notes button:', saveNotesBtn);
    if (saveNotesBtn) {
      saveNotesBtn.addEventListener('click', saveQuickNotes);
      console.log('✅ Save notes button listener added');
    }

    // View toggle buttons
    const toggleButtons = document.querySelectorAll('.toggle-btn');
    console.log('Toggle buttons found:', toggleButtons.length);
    toggleButtons.forEach(btn => {
      btn.addEventListener('click', function() {
        toggleButtons.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        const view = this.dataset.view;
        toggleView(view);
      });
    });

    // ESC key to close modal
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        closeModal();
      }
    });

    // Click outside modal to close
    const modal = document.getElementById('editDayModal');
    if (modal) {
      modal.addEventListener('click', function(e) {
        if (e.target === this || e.target.classList.contains('modal-backdrop')) {
          closeModal();
        }
      });
    }
    
    // Delegate task interactions
    document.addEventListener('change', (event) => {
      const checkbox = event.target.closest('.task-checkbox');
      if (checkbox && checkbox.dataset.day) {
        const day = parseInt(checkbox.dataset.day, 10);
        const workbookId = parseInt(checkbox.dataset.workbook, 10);
        const index = parseInt(checkbox.dataset.taskIndex, 10);
        if (!Number.isNaN(day) && !Number.isNaN(workbookId) && !Number.isNaN(index)) {
          quickTaskManager.toggleTask(checkbox, day, workbookId, index);
        }
      }
    });

    document.addEventListener('dblclick', (event) => {
      const textSpan = event.target.closest('[data-action="edit-task"]');
      if (textSpan && textSpan.dataset.day) {
        const day = parseInt(textSpan.dataset.day, 10);
        const workbookId = parseInt(textSpan.dataset.workbook, 10);
        const index = parseInt(textSpan.dataset.taskIndex, 10);
        if (!Number.isNaN(day) && !Number.isNaN(workbookId) && !Number.isNaN(index)) {
          quickTaskManager.editTask(textSpan, day, workbookId, index);
        }
      }
    });

    document.addEventListener('click', (event) => {
      const target = event.target;

      const deleteBtn = target.closest('[data-action="delete-task"]');
      if (deleteBtn) {
        event.preventDefault();
        const day = parseInt(deleteBtn.dataset.day, 10);
        const workbookId = parseInt(deleteBtn.dataset.workbook, 10);
        const index = parseInt(deleteBtn.dataset.taskIndex, 10);
        if (!Number.isNaN(day) && !Number.isNaN(workbookId) && !Number.isNaN(index)) {
          quickTaskManager.deleteTask(day, workbookId, index);
        }
        return;
      }

      const addTaskBtn = target.closest('[data-action="add-task"]');
      if (addTaskBtn) {
        event.preventDefault();
        const day = parseInt(addTaskBtn.dataset.day, 10);
        const workbookId = parseInt(addTaskBtn.dataset.workbook, 10);
        if (!Number.isNaN(day) && !Number.isNaN(workbookId)) {
          quickTaskManager.addTaskEnhanced(day, workbookId);
        }
        return;
      }

      const toggleBatchBtn = target.closest('[data-action="toggle-batch"]');
      if (toggleBatchBtn) {
        event.preventDefault();
        const day = parseInt(toggleBatchBtn.dataset.day, 10);
        if (!Number.isNaN(day)) {
          quickTaskManager.toggleBatchMode(day);
        }
        return;
      }

      const batchCancelBtn = target.closest('[data-action="batch-cancel"]');
      if (batchCancelBtn) {
        event.preventDefault();
        const day = parseInt(batchCancelBtn.dataset.day, 10);
        if (!Number.isNaN(day)) {
          quickTaskManager.toggleBatchMode(day);
        }
        return;
      }

      const batchAddBtn = target.closest('[data-action="batch-add"]');
      if (batchAddBtn) {
        event.preventDefault();
        const day = parseInt(batchAddBtn.dataset.day, 10);
        const workbookId = parseInt(batchAddBtn.dataset.workbook, 10);
        if (!Number.isNaN(day) && !Number.isNaN(workbookId)) {
          quickTaskManager.addBatchTasks(day, workbookId);
        }
        return;
      }

      const showTemplatesBtn = target.closest('[data-action="show-templates"]');
      if (showTemplatesBtn) {
        event.preventDefault();
        const day = parseInt(showTemplatesBtn.dataset.day, 10);
        if (!Number.isNaN(day)) {
          quickTaskManager.showTemplates(day);
        }
        return;
      }

      const closeTemplatesBtn = target.closest('[data-action="close-templates"]');
      if (closeTemplatesBtn) {
        event.preventDefault();
        const day = parseInt(closeTemplatesBtn.dataset.day, 10);
        if (!Number.isNaN(day)) {
          quickTaskManager.closeTemplates(day);
        }
        return;
      }

      const templateItem = target.closest('[data-action="apply-template"]');
      if (templateItem) {
        event.preventDefault();
        const day = parseInt(templateItem.dataset.day, 10);
        const workbookId = parseInt(templateItem.dataset.workbook, 10);
        const templateType = templateItem.dataset.template;
        if (!Number.isNaN(day) && !Number.isNaN(workbookId) && templateType) {
          quickTaskManager.applyQuickTemplate(day, workbookId, templateType);
        }
        return;
      }

      const pasteBtn = target.closest('[data-action="paste-clipboard"]');
      if (pasteBtn) {
        event.preventDefault();
        const day = parseInt(pasteBtn.dataset.day, 10);
        const workbookId = parseInt(pasteBtn.dataset.workbook, 10);
        if (!Number.isNaN(day) && !Number.isNaN(workbookId)) {
          quickTaskManager.pasteFromClipboard(day, workbookId);
        }
      }
    });

    // Quick input interactions
    document.querySelectorAll('.quick-task-input-enhanced').forEach(input => {
      input.addEventListener('keydown', (event) => {
        const day = parseInt(input.dataset.day, 10);
        const workbookId = parseInt(input.dataset.workbook, 10);
        if (!Number.isNaN(day) && !Number.isNaN(workbookId)) {
          quickTaskManager.handleKeyDown(event, day, workbookId);
        }
      });

      input.addEventListener('input', () => {
        const day = parseInt(input.dataset.day, 10);
        if (!Number.isNaN(day)) {
          quickTaskManager.showSuggestions(input, day);
        }
      });
    });

    console.log('✅ All event listeners setup complete');
  }

  /**
   * Navigate to previous week
   */
  async function navigateToPreviousWeek() {
    console.log('📅 Navigating to previous week...');
    const currentWeekStart = getCurrentWeekStart();
    const targetWeekStart = addDays(currentWeekStart, -7);
    const { start, end } = getWeekRange(targetWeekStart);
    const label = formatWeekRangeLabel(start, end);
    await navigateToWeekRange(start, {
      label: 'tuần trước',
      loadingMessage: 'Đang tải tuần trước...',
      createPrompt: `Chưa có sổ tay cho tuần trước (${label}). Bạn có muốn tạo mới không?`
    });
  }

  /**
   * Navigate to next week
   */
  async function navigateToNextWeek() {
    console.log('📅 Navigating to next week...');
    const currentWeekStart = getCurrentWeekStart();
    const targetWeekStart = addDays(currentWeekStart, 7);
    const { start, end } = getWeekRange(targetWeekStart);
    const label = formatWeekRangeLabel(start, end);
    await navigateToWeekRange(start, {
      label: 'tuần sau',
      loadingMessage: 'Đang tải tuần sau...',
      createPrompt: `Chưa có sổ tay cho tuần sau (${label}). Bạn có muốn tạo mới không?`
    });
  }

  async function navigateToWeekRange(startDateLike, options = {}) {
    const {
      label = 'tuần được chọn',
      loadingMessage = 'Đang tải tuần...',
      createPrompt,
      allowCreate = true,
      toastOnMissing = false
    } = options;

    const parsedStart = parseISODate(startDateLike);
    if (!parsedStart || Number.isNaN(parsedStart.getTime())) {
      console.warn('⚠️ Không thể xác định ngày bắt đầu tuần từ:', startDateLike);
      return;
    }

    const { start, end } = getWeekRange(parsedStart);
    const weekStartStr = toISODateString(start);
    const weekEndStr = toISODateString(end);
    const rangeLabel = formatWeekRangeLabel(start, end);

    try {
      showLoading(loadingMessage);
  const response = await fetch(buildApiUrl(`/workbook/find?week_start=${weekStartStr}&week_end=${weekEndStr}`), {
        credentials: 'same-origin'
      });
      const data = await response.json();
      hideLoading();

      if (data.success && data.workbook_id) {
        window.location.href = `/workbook/${data.workbook_id}`;
        return;
      }

      if (allowCreate) {
        const message = createPrompt || `Chưa có sổ tay cho ${label} (${rangeLabel}). Bạn có muốn tạo mới không?`;
        if (confirm(message)) {
          await createWeekWorkbook(weekStartStr, weekEndStr);
        }
      } else if (toastOnMissing) {
        showNotification(`Không tìm thấy sổ tay cho ${rangeLabel}`, 'warning');
      }
    } catch (error) {
      hideLoading();
      console.error('Error navigating to specific week:', error);
      showNotification('❌ Lỗi khi chuyển tuần', 'error');
    }
  }

  function handleWeekDateSelection(value) {
    if (!value) {
      return;
    }
    const selectedDate = parseISODate(value);
    if (!selectedDate) {
      showNotification('❌ Ngày không hợp lệ', 'error');
      return;
    }

    const { start, end } = getWeekRange(selectedDate);
    const label = formatWeekRangeLabel(start, end);
    const weekDateInput = document.querySelector('[data-action="week-date-input"]');
    if (weekDateInput) {
      weekDateInput.value = toISODateString(start);
    }

    navigateToWeekRange(start, {
      label: `tuần ${label}`,
      loadingMessage: 'Đang tải tuần được chọn...'
    });
  }

  /**
   * Get current week start date from page
   */
  function getCurrentWeekStart() {
    // Try to get from data attribute first (most reliable)
    const workbookLayout = document.querySelector('[data-workbook-id]');
    if (workbookLayout && workbookLayout.dataset.weekStart) {
      const parsed = parseISODate(workbookLayout.dataset.weekStart);
      if (parsed) {
        return parsed;
      }
    }
    
    // Try to get from week-dates element
    const weekDatesEl = document.querySelector('.week-dates');
    if (weekDatesEl) {
      const dateText = weekDatesEl.textContent.trim();
      // Match format: DD/MM/YYYY (e.g., "22/10/2025")
      const match = dateText.match(/(\d{2})\/(\d{2})\/(\d{4})/);
      if (match) {
        const day = parseInt(match[1]);
        const month = parseInt(match[2]) - 1; // JS months are 0-indexed
        const year = parseInt(match[3]);
        return new Date(year, month, day);
      }
      
      // Fallback to DD/MM format (without year)
      const matchShort = dateText.match(/(\d{2})\/(\d{2})/);
      if (matchShort) {
        const day = parseInt(matchShort[1]);
        const month = parseInt(matchShort[2]) - 1;
        const year = new Date().getFullYear();
        return new Date(year, month, day);
      }
    }
    
    // Last resort: get from workbook header
    const headerEl = document.querySelector('.workbook-header h2');
    if (headerEl) {
      const headerText = headerEl.textContent;
      const match = headerText.match(/(\d{2})-(\d{2})-(\d{4})/);
      if (match) {
        const day = parseInt(match[1]);
        const month = parseInt(match[2]) - 1;
        const year = parseInt(match[3]);
        return new Date(year, month, day);
      }
    }
    
    // Ultimate fallback: return current Monday
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(today);
    monday.setDate(diff);
    return monday;
  }

  /**
   * Create workbook for specific week
   */
  async function createWeekWorkbook(weekStart, weekEnd) {
    try {
      showLoading('Đang tạo sổ tay...');
      
  const response = await fetch(buildApiUrl('/workbook/create'), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          week_start: weekStart,
          week_end: weekEnd
        })
      });
      
      const data = await response.json();
      
      hideLoading();
      
      if (data.success && data.workbook_id) {
        showNotification('✅ Đã tạo sổ tay mới!', 'success');
        setTimeout(() => {
          window.location.href = '/workbook/' + data.workbook_id;
        }, 500);
      } else {
        showNotification('❌ ' + (data.message || 'Không thể tạo sổ tay'), 'error');
      }
    } catch (error) {
      hideLoading();
      console.error('Error creating workbook:', error);
      showNotification('❌ Lỗi kết nối', 'error');
    }
  }

  /**
   * Add new week
   */
  async function addNewWeek() {
    console.log('➕ Add new week clicked');
    
    const currentWeekStart = getCurrentWeekStart();
    const nextWeekStart = addDays(currentWeekStart, 7);
    const nextWeekEnd = addDays(nextWeekStart, 6);
    const displayLabel = formatWeekRangeLabel(nextWeekStart, nextWeekEnd);

    if (!confirm(`Bạn có muốn tạo sổ tay công tác cho tuần tiếp theo?\n(${displayLabel})`)) {
      return;
    }
    
    try {
      showLoading('Đang tạo tuần mới...');
      
  const response = await fetch(buildApiUrl('/workbook/create'), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          week_start: toISODateString(nextWeekStart),
          week_end: toISODateString(nextWeekEnd)
        })
      });
      
      const data = await response.json();
      
      hideLoading();
      
      if (data.success && data.workbook_id) {
        showNotification('✅ Đã tạo tuần mới thành công!', 'success');
        // Redirect to new workbook
        setTimeout(() => {
          window.location.href = '/workbook/' + data.workbook_id;
        }, 1000);
      } else {
        showNotification('❌ ' + (data.message || 'Không thể tạo tuần mới'), 'error');
      }
    } catch (error) {
      hideLoading();
      console.error('Error creating new week:', error);
      showNotification('❌ Lỗi kết nối server', 'error');
    }
  }

  /**
   * Submit workbook for approval
   */
  async function submitWorkbook() {
    if (!currentWorkbookId) {
      showNotification('Không tìm thấy ID sổ tay', 'error');
      return;
    }

    if (!confirm('Bạn có chắc muốn gửi duyệt sổ tay công tác này?')) {
      return;
    }

    try {
      showLoading('Đang gửi duyệt...');

  const response = await fetch(buildApiUrl(`/workbook/${currentWorkbookId}/status`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'submitted' })
      });

      const data = await response.json();

      hideLoading();

      if (data.success) {
        showNotification('Đã gửi duyệt thành công!', 'success');
        // Update status badge
        const statusBadge = document.querySelector('.status-badge');
        if (statusBadge) {
          statusBadge.textContent = 'Chờ duyệt';
          statusBadge.classList.remove('status-draft');
          statusBadge.classList.add('status-submitted');
        }
      } else {
        showNotification(data.message || 'Có lỗi xảy ra', 'error');
      }
    } catch (error) {
      hideLoading();
      console.error('Error submitting workbook:', error);
      showNotification('Lỗi kết nối server', 'error');
    }
  }

  /**
   * Open edit modal for a specific day
   */
  async function openEditModal(day, workbookId) {
    console.log('📋 Opening modal for day:', day, 'workbook:', workbookId);
    
    const modal = document.getElementById('editDayModal');
    if (!modal) {
      console.error('❌ Modal not found');
      return;
    }

    // Set modal title and date info
    const modalDayName = document.getElementById('modalDayName');
    const modalDateInfo = document.getElementById('modalDateInfo');
    const daysOfWeek = ['', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
    
    if (modalDayName) {
      modalDayName.textContent = daysOfWeek[day] || day;
    }
    
    if (modalDateInfo) {
      const today = new Date();
      modalDateInfo.textContent = today.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long', 
        day: 'numeric'
      });
    }

    // Set hidden fields
    document.getElementById('modalWorkbookId').value = workbookId;
    document.getElementById('modalDayOfWeek').value = day;

    // Load existing data
    try {
  const response = await fetch(buildApiUrl(`/workbook/entry?workbook_id=${workbookId}&day_of_week=${day}`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'same-origin'
      });
      
      if (response.ok) {
        const data = await response.json();

        if (data.success && data.entry) {
          const entry = data.entry;
          
          // Populate form fields
          const mainFocusField = document.getElementById('mainFocus');
          const notesField = document.getElementById('notes');
          const progressField = document.getElementById('progress');
          
          if (mainFocusField) mainFocusField.value = entry.main_focus || '';
          if (notesField) notesField.value = entry.notes || '';
          if (progressField) {
            progressField.value = entry.progress || 0;
            // Update enhanced modal progress if exists
            if (window.enhancedModal) {
              window.enhancedModal.updateProgressVisual();
              window.enhancedModal.updateProgressBadge();
            }
          }

          // Populate tasks
          const tasksList = document.getElementById('tasksList');
          if (tasksList) {
            tasksList.innerHTML = '';
            
            if (entry.tasks) {
              let tasks = [];
              try {
                tasks = JSON.parse(entry.tasks);
              } catch (e) {
                tasks = entry.tasks.split('\n').filter(t => t.trim());
              }
              
              tasks.forEach(task => {
                if (window.enhancedModal && typeof window.enhancedModal.addTaskToContainer === 'function') {
                  window.enhancedModal.addTaskToContainer(task, 'medium');
                } else {
                  addTaskField(task);
                }
              });
            }
          }
          
          // Update counters if enhanced modal is available
          if (window.enhancedModal) {
            window.enhancedModal.updateCharCounter();
            window.enhancedModal.updateNotesCounter();
            window.enhancedModal.updateTaskStats();
          }
        }
      } else {
        console.warn('Response not OK:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('🚨 Error loading entry:', error);
      // Fallback: just open empty modal
      console.log('📝 Opening empty modal...');
    }

    // Show modal
    modal.style.display = 'flex';
    setTimeout(() => {
      modal.classList.add('active');
    }, 10);
  }

  /**
   * Close modal
   */
  function closeModal() {
    const modal = document.getElementById('editDayModal');
    if (!modal) return;

    modal.classList.remove('active');
    setTimeout(() => {
      modal.style.display = 'none';
      // Reset form
      document.getElementById('dayEntryForm').reset();
      document.getElementById('tasksList').innerHTML = '';
    }, 300);
  }

  /**
   * Handle form submission
   */
  async function handleFormSubmit(e) {
    e.preventDefault();
    
    console.log('📝 Form submit triggered');

    const workbookId = document.getElementById('modalWorkbookId').value;
    const dayOfWeek = document.getElementById('modalDayOfWeek').value;
    const mainFocus = document.getElementById('mainFocus').value;
    const notes = document.getElementById('notes').value;
    const progress = document.getElementById('progress').value;

    console.log('📋 Form values:', { workbookId, dayOfWeek, mainFocus, notes, progress });

    // Collect tasks - support multiple structures
    let tasks = [];
    
    // Method 1: Try new enhanced modal structure (.task-item-enhanced .task-text)
    const enhancedTasks = document.querySelectorAll('.task-item-enhanced .task-text');
    if (enhancedTasks.length > 0) {
      tasks = Array.from(enhancedTasks)
        .map(label => label.textContent.trim())
        .filter(task => task.length > 0);
      console.log('📋 Collected tasks from enhanced modal (method 1):', tasks);
    }
    
    // Method 2: Try collecting from .task-input inputs
    if (tasks.length === 0) {
      const taskInputs = document.querySelectorAll('.task-input input, input.task-input');
      if (taskInputs.length > 0) {
        tasks = Array.from(taskInputs)
          .map(input => input.value.trim())
          .filter(task => task.length > 0);
        console.log('📋 Collected tasks from inputs (method 2):', tasks);
      }
    }
    
    // Method 3: Try collecting from any task-related elements
    if (tasks.length === 0) {
      const allTasks = document.querySelectorAll('#tasksList .task-text, #tasksList input[type="text"]');
      if (allTasks.length > 0) {
        tasks = Array.from(allTasks)
          .map(el => el.tagName === 'INPUT' ? el.value.trim() : el.textContent.trim())
          .filter(task => task.length > 0);
        console.log('📋 Collected tasks from any elements (method 3):', tasks);
      }
    }

    const formData = {
      workbook_id: workbookId,
      day_of_week: dayOfWeek,
      main_focus: mainFocus,
      tasks: JSON.stringify(tasks),
      notes: notes,
      progress: parseInt(progress)
    };
    
    console.log('💾 Saving form data:', formData);

    try {
      showLoading('Đang lưu...');

  const response = await fetch(buildApiUrl('/workbook/entry'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      hideLoading();

      if (data.success) {
        showNotification('✅ Đã lưu thành công!', 'success');
        closeModal();
        
        // Update day card display
        updateDayCard(dayOfWeek, {
          main_focus: mainFocus,
          tasks: tasks,
          notes: notes,
          progress: parseInt(progress)
        });
        
        // Reload page to refresh all data
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        showNotification(data.message || 'Có lỗi xảy ra', 'error');
      }
    } catch (error) {
      hideLoading();
      console.error('Error saving entry:', error);
      showNotification('❌ Lỗi kết nối server', 'error');
    }
  }

  /**
   * Add task input field
   */
  function addTaskField(value = '') {
    console.log('➕ Adding task field with value:', value);
    const tasksList = document.getElementById('tasksList');
    if (!tasksList) {
      console.error('❌ tasksList element not found');
      return;
    }

    const taskGroup = document.createElement('div');
    taskGroup.className = 'task-input-group';
    taskGroup.innerHTML = `
      <input type="text" class="form-control task-input" placeholder="Nhập công việc..." value="${value}">
      <button type="button" class="task-remove-btn" onclick="this.parentElement.remove()">
        <i class="fas fa-times"></i>
      </button>
    `;

    tasksList.appendChild(taskGroup);
    console.log('✅ Task field added');
    
    // Focus on new input
    const newInput = taskGroup.querySelector('input');
    if (newInput) {
      newInput.focus();
    }
  }

  /**
   * Update day card display
   */
  function updateDayCard(day, data) {
    console.log('🔄 Updating day card:', day, data);
    
    const dayCard = document.querySelector(`[data-day="${day}"]`);
    if (!dayCard) {
      console.warn('⚠️ Day card not found for day:', day);
      return;
    }

    // Update main focus
    const mainFocusEl = dayCard.querySelector('.card-section .section-content');
    if (mainFocusEl && !mainFocusEl.classList.contains('task-list')) {
      mainFocusEl.textContent = data.main_focus || 'Chưa có mục tiêu';
      mainFocusEl.classList.toggle('empty', !data.main_focus);
      console.log('✅ Updated main focus');
    }

    // Update tasks section
    const tasksSection = Array.from(dayCard.querySelectorAll('.card-section')).find(section => 
      section.querySelector('.section-title')?.textContent.includes('Công việc')
    );
    
    if (tasksSection) {
      // Remove old content
      const oldTaskList = tasksSection.querySelector('.task-list');
      const oldEmptyMsg = tasksSection.querySelector('.section-content.empty');
      
      if (oldTaskList) oldTaskList.remove();
      if (oldEmptyMsg) oldEmptyMsg.remove();
      
      // Add new content
      if (data.tasks && Array.isArray(data.tasks) && data.tasks.length > 0) {
        const taskList = document.createElement('ul');
        taskList.className = 'task-list';
        taskList.innerHTML = data.tasks.map(task => `<li>${task}</li>`).join('');
        tasksSection.appendChild(taskList);
        console.log('✅ Updated tasks:', data.tasks.length, 'tasks');
      } else {
        const emptyMsg = document.createElement('p');
        emptyMsg.className = 'section-content empty';
        emptyMsg.innerHTML = '<i class="fas fa-plus-circle"></i> Thêm công việc';
        tasksSection.appendChild(emptyMsg);
        console.log('ℹ️ No tasks to display');
      }
    }

    // Update progress
    const progressFill = dayCard.querySelector('.progress-fill');
    const progressText = dayCard.querySelector('.progress-text');
    if (progressFill) {
      progressFill.style.width = data.progress + '%';
      progressFill.setAttribute('data-progress', data.progress);
    }
    if (progressText) {
      progressText.textContent = data.progress + '%';
    }
    
    console.log('✅ Day card update complete');
  }

  /**
   * Update all progress bars
   */
  function updateAllProgressBars() {
    const progressBars = document.querySelectorAll('.progress-fill');
    progressBars.forEach(bar => {
      const progress = bar.getAttribute('data-progress') || 0;
      bar.style.width = progress + '%';
    });
  }

  /**
   * Load entries data
   */
  function loadEntriesData() {
    // This is already loaded from server, just need to initialize displays
    updateAllProgressBars();
  }

  /**
   * Save quick notes
   */
  async function saveQuickNotes() {
    console.log('💾 Saving quick notes...');
    const notesTextarea = document.querySelector('.quick-notes');
    if (!notesTextarea) {
      console.error('❌ Quick notes textarea not found');
      return;
    }

    const notes = notesTextarea.value.trim();
    
    if (!currentWorkbookId) {
      showNotification('❌ Không tìm thấy workbook', 'error');
      return;
    }

    try {
      showLoading('Đang lưu ghi chú...');

  const response = await fetch(buildApiUrl(`/workbook/${currentWorkbookId}/notes`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: notes })
      });

      const data = await response.json();
      hideLoading();

      if (data.success) {
        showNotification('✅ Đã lưu ghi chú!', 'success');
      } else {
        showNotification('❌ ' + data.message, 'error');
      }
    } catch (error) {
      hideLoading();
      console.error('Error:', error);
      showNotification('❌ Lỗi kết nối', 'error');
    }
  }

  /**
   * Toggle view (grid/list)
   */
  function toggleView(view) {
    const daysGrid = document.querySelector('.days-grid');
    if (!daysGrid) return;

    if (view === 'list') {
      daysGrid.style.gridTemplateColumns = '1fr';
    } else {
      daysGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(320px, 1fr))';
    }
  }

  /**
   * Show notification
   */
  function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelectorAll('.toast-notification');
    existing.forEach(n => n.remove());

    const notification = document.createElement('div');
    notification.className = `toast-notification toast-${type}`;
    
    const icons = {
      success: 'check-circle',
      error: 'exclamation-circle',
      warning: 'exclamation-triangle',
      info: 'info-circle'
    };

    const colors = {
      success: 'linear-gradient(135deg, #10b981, #059669)',
      error: 'linear-gradient(135deg, #ef4444, #dc2626)',
      warning: 'linear-gradient(135deg, #f59e0b, #d97706)',
      info: 'linear-gradient(135deg, #3b82f6, #2563eb)'
    };

    notification.innerHTML = `
      <i class="fas fa-${icons[type]}"></i>
      <span>${message}</span>
    `;

    Object.assign(notification.style, {
      position: 'fixed',
      top: '24px',
      right: '24px',
      background: colors[type],
      color: 'white',
      padding: '1rem 1.5rem',
      borderRadius: '12px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      zIndex: '10000',
      fontWeight: '600',
      fontSize: '0.9375rem',
      animation: 'slideInRight 0.3s ease-out',
      minWidth: '300px'
    });

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease-out';
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }

  /**
   * Show loading overlay
   */
  function showLoading(message = 'Đang xử lý...') {
    let loading = document.getElementById('loadingOverlay');
    if (!loading) {
      loading = document.createElement('div');
      loading.id = 'loadingOverlay';
      loading.innerHTML = `
        <div class="loading-spinner">
          <i class="fas fa-spinner fa-spin"></i>
          <p>${message}</p>
        </div>
      `;
      
      Object.assign(loading.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: '9999',
        color: 'white',
        fontSize: '1.25rem',
        fontWeight: '600'
      });
      
      const spinner = loading.querySelector('.loading-spinner');
      Object.assign(spinner.style, {
        textAlign: 'center'
      });
      
      document.body.appendChild(loading);
    } else {
      loading.style.display = 'flex';
      loading.querySelector('p').textContent = message;
    }
  }

  /**
   * Hide loading overlay
   */
  function hideLoading() {
    const loading = document.getElementById('loadingOverlay');
    if (loading) {
      loading.style.display = 'none';
    }
  }

  // Add CSS animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideInRight {
      from {
        transform: translateX(400px);
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
        transform: translateX(400px);
        opacity: 0;
      }
    }

    #editDayModal {
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    #editDayModal.active {
      opacity: 1;
    }

    .modal-dialog {
      transform: scale(0.9);
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    #editDayModal.active .modal-dialog {
      transform: scale(1);
    }

    .loading-spinner i {
      font-size: 3rem;
      margin-bottom: 1rem;
      display: block;
    }

    .status-submitted {
      background: linear-gradient(135deg, #3b82f6, #2563eb) !important;
      color: white !important;
    }
  `;
  document.head.appendChild(style);

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  /**
   * ==============================
   * Quick Task Manager (Inline)
   * ==============================
   * Provide add/toggle/edit/delete for tasks directly on day cards
   * and persist to backend using /workbook/entry endpoint.
   */
  const quickTaskManager = (() => {
    // Helpers
    const getTaskListEl = (day) => document.querySelector(`.task-list-interactive[data-day="${day}"]`);
    const getQuickInputEl = (day) => document.querySelector(`.quick-add-single[data-day="${day}"] .quick-task-input-enhanced`);
    const getPriorityEl = (day) => document.querySelector(`.quick-add-single[data-day="${day}"] .priority-select-quick`);

    async function fetchEntry(workbookId, day) {
      try {
  const res = await fetch(buildApiUrl(`/workbook/entry?workbook_id=${workbookId}&day_of_week=${day}`), { credentials: 'same-origin' });
        if (!res.ok) return null;
        const data = await res.json();
        if (data.success && data.entry) {
          // Normalize tasks
          let tasks = [];
          if (data.entry.tasks) {
            try { tasks = JSON.parse(data.entry.tasks); } catch { tasks = []; }
          }
          if (!Array.isArray(tasks)) tasks = [];
          data.entry.tasks = tasks;
          currentEntries[day] = data.entry;
          return data.entry;
        }
      } catch (e) {
        console.error('fetchEntry error:', e);
      }
      // fallback
      const fallback = { workbook_id: workbookId, day_of_week: day, main_focus: '', tasks: [], notes: '', progress: 0 };
      currentEntries[day] = fallback;
      return fallback;
    }

    async function persistEntry(workbookId, day, entry) {
      const payload = {
        workbook_id: workbookId,
        day_of_week: day,
        main_focus: entry.main_focus || '',
        tasks: JSON.stringify(entry.tasks || []),
        notes: entry.notes || '',
        // Keep existing progress to avoid surprises
        progress: typeof entry.progress === 'number' ? entry.progress : 0
      };
      try {
  const res = await fetch(buildApiUrl('/workbook/entry'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || 'Save failed');
        return true;
      } catch (e) {
        console.error('persistEntry error:', e);
        showNotification('❌ Lỗi khi lưu công việc', 'error');
        return false;
      }
    }

    function renderTaskList(day, workbookId, tasks) {
      const listEl = getTaskListEl(day);
      if (!listEl) return;
      listEl.innerHTML = '';
      tasks.forEach((task, index) => {
        const taskText = typeof task === 'object' ? (task.text || '') : String(task || '');
        const completed = typeof task === 'object' ? !!task.completed : false;
        const li = document.createElement('li');
        li.className = `task-item-inline ${completed ? 'completed' : ''}`;
        li.dataset.taskIndex = index;
        li.dataset.day = day;
        li.dataset.workbook = workbookId;
        li.innerHTML = `
          <div class="task-checkbox-wrapper">
            <input type="checkbox" class="task-checkbox" ${completed ? 'checked' : ''}>
          </div>
          <span class="task-text-inline">${taskText.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>
          <button class="task-delete-inline" title="Xóa"><i class="fas fa-times"></i></button>
        `;
        const checkbox = li.querySelector('.task-checkbox');
        checkbox.dataset.day = day;
        checkbox.dataset.workbook = workbookId;
        checkbox.dataset.taskIndex = index;

        const textSpan = li.querySelector('.task-text-inline');
        textSpan.dataset.action = 'edit-task';
        textSpan.dataset.day = day;
        textSpan.dataset.workbook = workbookId;
        textSpan.dataset.taskIndex = index;

        const delBtn = li.querySelector('.task-delete-inline');
        delBtn.dataset.action = 'delete-task';
        delBtn.dataset.day = day;
        delBtn.dataset.workbook = workbookId;
        delBtn.dataset.taskIndex = index;
        listEl.appendChild(li);
      });
    }

    async function addTaskEnhanced(day, workbookId) {
      const input = getQuickInputEl(day);
      if (!input) return;
      const text = input.value.trim();
      if (!text) return;
      const priorityEl = getPriorityEl(day);
      const priority = priorityEl ? priorityEl.value : 'medium';
      const entry = (currentEntries[day]) || await fetchEntry(workbookId, day);
      // Normalize task object
      entry.tasks = Array.isArray(entry.tasks) ? entry.tasks : [];
      entry.tasks.push({ text, completed: false, priority });
      const ok = await persistEntry(workbookId, day, entry);
      if (ok) {
        renderTaskList(day, workbookId, entry.tasks);
        input.value = '';
        showNotification('✅ Đã thêm công việc', 'success');
      }
    }

    async function toggleTask(checkboxEl, day, workbookId, index) {
      const entry = (currentEntries[day]) || await fetchEntry(workbookId, day);
      entry.tasks = Array.isArray(entry.tasks) ? entry.tasks : [];
      const t = entry.tasks[index];
      if (t === undefined) return;
      if (typeof t === 'object') {
        t.completed = !!checkboxEl.checked;
      } else {
        entry.tasks[index] = { text: String(t), completed: !!checkboxEl.checked };
      }
      const ok = await persistEntry(workbookId, day, entry);
      if (ok) {
        renderTaskList(day, workbookId, entry.tasks);
      }
    }

    async function deleteTask(day, workbookId, index) {
      const entry = (currentEntries[day]) || await fetchEntry(workbookId, day);
      entry.tasks = Array.isArray(entry.tasks) ? entry.tasks : [];
      entry.tasks.splice(index, 1);
      const ok = await persistEntry(workbookId, day, entry);
      if (ok) {
        renderTaskList(day, workbookId, entry.tasks);
        showNotification('🗑️ Đã xóa công việc', 'info');
      }
    }

    async function editTask(spanEl, day, workbookId, index) {
      const oldText = spanEl.textContent.trim();
      const input = document.createElement('input');
      input.type = 'text';
      input.value = oldText;
      input.className = 'task-edit-input';
      spanEl.replaceWith(input);
      input.focus();
      const commit = async () => {
        const newText = input.value.trim();
        const entry = (currentEntries[day]) || await fetchEntry(workbookId, day);
        entry.tasks = Array.isArray(entry.tasks) ? entry.tasks : [];
        if (entry.tasks[index] === undefined) return;
        if (typeof entry.tasks[index] === 'object') {
          entry.tasks[index].text = newText;
        } else {
          entry.tasks[index] = newText;
        }
        const ok = await persistEntry(workbookId, day, entry);
        if (ok) {
          renderTaskList(day, workbookId, entry.tasks);
        }
      };
      input.addEventListener('blur', commit);
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); commit(); } });
    }

    function handleKeyDown(e, day, workbookId) {
      if (e.key === 'Enter') {
        e.preventDefault();
        addTaskEnhanced(day, workbookId);
      }
    }

    // Optional helpers (stubs/minimal)
    function showSuggestions() {}
    function toggleBatchMode(day) {
      const single = document.querySelector(`.quick-add-single[data-day="${day}"]`);
      const batch = document.querySelector(`.quick-add-batch[data-day="${day}"]`);
      if (!single || !batch) return;
      const showBatch = batch.style.display === 'none' || batch.style.display === '';
      batch.style.display = showBatch ? 'block' : 'none';
      single.style.display = showBatch ? 'none' : 'flex';
    }
    async function addBatchTasks(day, workbookId) {
      const batch = document.querySelector(`.quick-add-batch[data-day="${day}"] textarea`);
      if (!batch) return;
      const lines = batch.value.split('\n').map(s => s.replace(/^[-•\s]+/, '').trim()).filter(Boolean);
      if (lines.length === 0) return;
      const entry = (currentEntries[day]) || await fetchEntry(workbookId, day);
      entry.tasks = Array.isArray(entry.tasks) ? entry.tasks : [];
      lines.forEach(t => entry.tasks.push({ text: t, completed: false, priority: 'medium' }));
      const ok = await persistEntry(workbookId, day, entry);
      if (ok) {
        renderTaskList(day, workbookId, entry.tasks);
        batch.value = '';
        toggleBatchMode(day);
        showNotification(`✅ Đã thêm ${lines.length} công việc`, 'success');
      }
    }
    async function applyQuickTemplate(day, workbookId, type) {
      const templates = {
        meeting: ['Chuẩn bị tài liệu họp', 'Họp nhóm dự án', 'Ghi biên bản và phân công'],
        teaching: ['Chuẩn bị giáo án', 'Giảng dạy tiết học', 'Chấm bài và phản hồi'],
        research: ['Đọc tài liệu', 'Thực nghiệm/viết báo cáo', 'Trao đổi với nhóm'],
        admin: ['Xử lý công văn', 'Cập nhật hồ sơ', 'Báo cáo định kỳ']
      };
      const entry = (currentEntries[day]) || await fetchEntry(workbookId, day);
      entry.tasks = Array.isArray(entry.tasks) ? entry.tasks : [];
      (templates[type] || []).forEach(t => entry.tasks.push({ text: t, completed: false, priority: 'medium' }));
      const ok = await persistEntry(workbookId, day, entry);
      if (ok) {
        renderTaskList(day, workbookId, entry.tasks);
        showNotification('✅ Đã áp dụng mẫu công việc', 'success');
      }
    }
    async function pasteFromClipboard(day, workbookId) {
      try {
        const text = await navigator.clipboard.readText();
        const lines = text.split('\n').map(s => s.replace(/^[-•\s]+/, '').trim()).filter(Boolean);
        if (lines.length) {
          const entry = (currentEntries[day]) || await fetchEntry(workbookId, day);
          entry.tasks = Array.isArray(entry.tasks) ? entry.tasks : [];
          lines.forEach(t => entry.tasks.push({ text: t, completed: false, priority: 'medium' }));
          const ok = await persistEntry(workbookId, day, entry);
          if (ok) {
            renderTaskList(day, workbookId, entry.tasks);
            showNotification(`✅ Đã dán ${lines.length} công việc`, 'success');
          }
        }
      } catch (e) {
        console.error('pasteFromClipboard error:', e);
      }
    }
    function showTemplates(day) {
      const el = document.querySelector(`.template-selector[data-day="${day}"]`);
      if (el) el.style.display = 'block';
    }
    function closeTemplates(day) {
      const el = document.querySelector(`.template-selector[data-day="${day}"]`);
      if (el) el.style.display = 'none';
    }

    return {
      addTaskEnhanced,
      toggleTask,
      deleteTask,
      editTask,
      handleKeyDown,
      showSuggestions,
      toggleBatchMode,
      addBatchTasks,
      applyQuickTemplate,
      pasteFromClipboard,
      showTemplates,
      closeTemplates
    };
  })();

  // Expose quickTaskManager for inline handlers in EJS
  window.quickTaskManager = quickTaskManager;
  
  /**
   * Load quick notes from database
   */
  async function loadQuickNotes() {
    if (!currentWorkbookId) return;
    
    try {
  const response = await fetch(buildApiUrl(`/workbook/${currentWorkbookId}/notes`), {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        credentials: 'same-origin'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.notes) {
          const notesTextarea = document.querySelector('.quick-notes');
          if (notesTextarea) {
            notesTextarea.value = data.notes;
          }
        }
      }
    } catch (error) {
      console.error('Error loading quick notes:', error);
    }
  }
  
  // Call loadQuickNotes after page init
  setTimeout(() => {
    loadQuickNotes();
  }, 500);

  // Export functions to window for inline onclick handlers
  window.WorkbookApp = {
    openEditModal,
    closeModal,
    addTaskField,
    submitWorkbook,
    saveQuickNotes,
    showNotification
  };

})();
