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
  let currentStatus = 'draft';
  let currentApproverId = null;
  let isOwnerView = false;
  let canApproveWorkbook = false;
  let academicStartISO = null;
  let academicStartDate = null;
  let academicStorageKey = null;
  let weekRailExpanded = false;

  const apiBaseUrl = window.location.origin;

  function buildApiUrl(path) {
    if (!path) {
      return apiBaseUrl;
    }

    if (/^https?:\/\//i.test(path)) {
      return path;
    }

    if (path.startsWith('/')) {
      return path;
    }

    return `/${path.replace(/^\/+/g, '')}`;
  }

  async function parseJsonResponse(response) {
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(text || 'Máy chủ trả về dữ liệu không hợp lệ');
    }
    return response.json();
  }

  function getLocalStorageItem(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      console.warn('Không thể truy cập localStorage:', error);
      return null;
    }
  }

  function setLocalStorageItem(key, value) {
    try {
      if (value === null || value === undefined) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, value);
      }
    } catch (error) {
      console.warn('Không thể cập nhật localStorage:', error);
    }
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
      currentStatus = workbookElement.dataset.currentStatus || 'draft';
      currentApproverId = workbookElement.dataset.currentApprover || null;
      isOwnerView = workbookElement.dataset.canEdit === 'true';
      canApproveWorkbook = workbookElement.dataset.canApprove === 'true';
    }
    
    // Setup event listeners
    setupEventListeners();

    // Initialize week selector preferences
    initializeWeekPreferences();
    
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

    const toggleWeekRailBtn = document.querySelector('[data-action="toggle-week-rail"]');
    if (toggleWeekRailBtn) {
      toggleWeekRailBtn.addEventListener('click', handleToggleWeekRail);
    }

    const applyAcademicStartBtn = document.querySelector('[data-action="apply-academic-start"]');
    if (applyAcademicStartBtn) {
      applyAcademicStartBtn.addEventListener('click', applyAcademicStart);
    }

    const resetAcademicStartBtn = document.querySelector('[data-action="reset-academic-start"]');
    if (resetAcademicStartBtn) {
      resetAcademicStartBtn.addEventListener('click', resetAcademicStart);
    }

    const academicStartInput = document.querySelector('[data-academic-start-input]');
    if (academicStartInput) {
      academicStartInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          applyAcademicStart();
        }
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

    const approveBtn = document.querySelector('[data-action="approve-workbook"]');
    const rejectBtn = document.querySelector('[data-action="reject-workbook"]');

    if (approveBtn) {
      approveBtn.addEventListener('click', (event) => {
        event.preventDefault();
        handleApprovalDecision('approved');
      });
    }

    if (rejectBtn) {
      rejectBtn.addEventListener('click', (event) => {
        event.preventDefault();
        handleApprovalDecision('rejected');
      });
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
        return;
      }

      const inlineToggleBtn = target.closest('[data-action="toggle-inline-details"]');
      if (inlineToggleBtn) {
        event.preventDefault();
        handleInlineDetailToggle(inlineToggleBtn);
        return;
      }

      const inlineSaveBtn = target.closest('[data-action="save-inline-details"]');
      if (inlineSaveBtn) {
        event.preventDefault();
        handleInlineDetailSave(inlineSaveBtn);
        return;
      }

      const inlineCancelBtn = target.closest('[data-action="cancel-inline-details"]');
      if (inlineCancelBtn) {
        event.preventDefault();
        handleInlineDetailCancel(inlineCancelBtn);
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

    document.addEventListener('input', (event) => {
      const slider = event.target.closest('[data-inline-progress]');
      if (slider) {
        handleInlineProgressInput(slider);
      }
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

  function initializeWeekPreferences() {
    const layout = document.querySelector('.workbook-layout');
    if (!layout) {
      return;
    }

    if (!academicStorageKey) {
      const userId = layout.dataset.userId || 'anonymous';
      academicStorageKey = `workbook-academic-start:${userId}`;
    }

    const stored = academicStorageKey ? getLocalStorageItem(academicStorageKey) : null;
    const fallback = layout.dataset.academicStart || '';
    const iso = stored || fallback;

    if (iso) {
      const parsed = parseISODate(iso);
      if (parsed) {
        const normalized = normalizeToMonday(parsed);
        academicStartDate = normalized;
        academicStartISO = toISODateString(normalized);
        layout.dataset.academicStart = academicStartISO;
      }
    } else {
      layout.dataset.academicStart = '';
    }

    updateAcademicPreferenceWidgets();
    updateAcademicWeekLabels();
    updateWeekRailVisibility();
  }

  function handleToggleWeekRail() {
    weekRailExpanded = !weekRailExpanded;
    updateWeekRailVisibility();
  }

  function updateWeekRailVisibility() {
    const toggleBtn = document.querySelector('[data-action="toggle-week-rail"]');
    const chips = document.querySelectorAll('[data-week-chip]');

    chips.forEach((chip) => {
      const offset = chip.dataset.weekOffset;
      if (!weekRailExpanded && offset !== '0') {
        chip.setAttribute('hidden', 'true');
      } else {
        chip.removeAttribute('hidden');
      }
    });

    if (toggleBtn) {
      toggleBtn.setAttribute('aria-expanded', weekRailExpanded ? 'true' : 'false');
      const labelSpan = toggleBtn.querySelector('span');
      if (labelSpan) {
        labelSpan.textContent = weekRailExpanded ? 'Thu gọn danh sách tuần' : 'Hiện danh sách tuần';
      }
    }
  }

  function applyAcademicStart() {
    const layout = document.querySelector('.workbook-layout');
    const input = document.querySelector('[data-academic-start-input]');
    if (!layout || !input) {
      return;
    }

    const value = input.value;
    const parsed = parseISODate(value);
    if (!parsed) {
      showNotification('❌ Ngày không hợp lệ', 'error');
      return;
    }

    const normalized = normalizeToMonday(parsed);
    academicStartDate = normalized;
    academicStartISO = toISODateString(normalized);
    layout.dataset.academicStart = academicStartISO;
    if (academicStorageKey) {
      setLocalStorageItem(academicStorageKey, academicStartISO);
    }

    updateAcademicPreferenceWidgets();
    updateAcademicWeekLabels();
    showNotification('✅ Đã cập nhật tuần bắt đầu năm học', 'success');
  }

  function resetAcademicStart() {
    const layout = document.querySelector('.workbook-layout');
    if (!layout) {
      return;
    }

    academicStartDate = null;
    academicStartISO = null;
    layout.dataset.academicStart = '';
    if (academicStorageKey) {
      setLocalStorageItem(academicStorageKey, null);
    }

    updateAcademicPreferenceWidgets();
    updateAcademicWeekLabels();
    showNotification('ℹ️ Đã đặt lại tuần đầu năm học', 'info');
  }

  function computeAcademicWeekNumber(weekStartISO) {
    if (!academicStartDate || !weekStartISO) {
      return null;
    }
    const target = parseISODate(weekStartISO);
    if (!target) {
      return null;
    }

    const normalizedTarget = normalizeToMonday(target);
    const diffMs = normalizedTarget.getTime() - academicStartDate.getTime();
    const weeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
    if (Number.isNaN(weeks)) {
      return null;
    }
    return weeks >= 0 ? weeks + 1 : 1;
  }

  function updateAcademicWeekLabels() {
    const layout = document.querySelector('.workbook-layout');
    const currentWeekLabel = document.querySelector('[data-current-week-academic]');
    const currentWeekStart = layout ? layout.dataset.weekStart : null;

    console.log('🔍 updateAcademicWeekLabels called:', {
      hasLayout: !!layout,
      hasCurrentWeekLabel: !!currentWeekLabel,
      currentWeekStart,
      academicStartDate,
      academicStartISO
    });

    if (currentWeekLabel && currentWeekStart) {
      const defaultLabel = currentWeekLabel.dataset.defaultLabel || currentWeekLabel.textContent;
      const weekNumber = computeAcademicWeekNumber(currentWeekStart);
      console.log('📊 Sidebar week number:', weekNumber);
      if (weekNumber) {
        currentWeekLabel.textContent = `Tuần học số ${weekNumber}`;
      } else {
        currentWeekLabel.textContent = defaultLabel;
      }
    }

    // Cập nhật breadcrumb - Thử nhiều selector
    let breadcrumbWeekEl = document.querySelector('#breadcrumb-week [data-breadcrumb-label]');
    
    // Fallback: tìm breadcrumb item cuối cùng
    if (!breadcrumbWeekEl) {
      const breadcrumbItems = document.querySelectorAll('.breadcrumb-pro .crumb.is-current [data-breadcrumb-label]');
      if (breadcrumbItems.length > 0) {
        breadcrumbWeekEl = breadcrumbItems[breadcrumbItems.length - 1];
        console.log('🔄 Using fallback breadcrumb selector');
      }
    }
    
    console.log('🍞 Breadcrumb element:', breadcrumbWeekEl);
    if (breadcrumbWeekEl && currentWeekStart) {
      const weekNumber = computeAcademicWeekNumber(currentWeekStart);
      console.log('📊 Breadcrumb week number:', weekNumber);
      if (weekNumber) {
        breadcrumbWeekEl.textContent = `Tuần ${weekNumber}`;
        console.log('✅ Breadcrumb updated to:', `Tuần ${weekNumber}`);
      } else {
        console.log('⚠️ No week number computed for breadcrumb');
      }
    } else {
      console.log('⚠️ Breadcrumb element not found or no weekStart');
    }

    document.querySelectorAll('[data-week-chip]').forEach((chip) => {
      const labelEl = chip.querySelector('[data-week-label]');
      if (!labelEl) {
        return;
      }
      const defaultLabel = labelEl.dataset.defaultLabel || labelEl.textContent;
      const weekNumber = computeAcademicWeekNumber(chip.dataset.weekStart);
      if (weekNumber) {
        const startDate = parseISODate(chip.dataset.weekStart);
        const yearText = startDate ? startDate.getFullYear() : '';
        labelEl.textContent = yearText ? `Tuần ${weekNumber} · ${yearText}` : `Tuần ${weekNumber}`;
      } else {
        labelEl.textContent = defaultLabel;
      }
    });
  }

  function updateAcademicPreferenceWidgets() {
    const layout = document.querySelector('.workbook-layout');
    const input = document.querySelector('[data-academic-start-input]');
    const displayEl = document.querySelector('[data-academic-start-display]');

    if (input) {
      if (academicStartISO) {
        input.value = academicStartISO;
      } else if (layout && layout.dataset.weekStart) {
        input.value = layout.dataset.weekStart;
      }
    }

    if (displayEl) {
      if (academicStartDate) {
        const { start, end } = getWeekRange(academicStartDate);
        displayEl.textContent = formatWeekRangeLabel(start, end);
      } else {
        displayEl.textContent = 'Theo tuần hiện tại';
      }
    }
  }

  function normalizeTaskArrayData(rawTasks) {
    let parsed = [];

    if (Array.isArray(rawTasks)) {
      parsed = rawTasks;
    } else if (typeof rawTasks === 'string' && rawTasks.trim()) {
      try {
        parsed = JSON.parse(rawTasks);
      } catch (error) {
        parsed = rawTasks.split('\n').map((line) => line.trim()).filter(Boolean);
      }
    } else if (rawTasks && typeof rawTasks === 'object') {
      parsed = [rawTasks];
    }

    const allowedPriorities = new Set(['low', 'medium', 'high']);

    return parsed
      .map((task) => {
        if (typeof task === 'string') {
          const clean = task.trim();
          if (!clean) {
            return null;
          }
          return { text: clean, completed: false, priority: 'medium' };
        }

        if (task && typeof task === 'object') {
          const text = typeof task.text === 'string' ? task.text.trim() : '';
          if (!text) {
            return null;
          }

          const priority = allowedPriorities.has(task.priority) ? task.priority : 'medium';
          return {
            text,
            completed: Boolean(task.completed),
            priority
          };
        }

        return null;
      })
      .filter(Boolean);
  }

  function getPriorityLabel(priority) {
    switch (priority) {
      case 'high':
        return 'Cao';
      case 'low':
        return 'Thấp';
      default:
        return 'Trung bình';
    }
  }

  function computeTaskProgress(tasks) {
    const normalized = normalizeTaskArrayData(tasks);
    if (!normalized.length) {
      return 0;
    }
    const completed = normalized.reduce((count, task) => count + (task.completed ? 1 : 0), 0);
    return Math.round((completed / normalized.length) * 100);
  }

  async function fetchEntryData(workbookId, day) {
    try {
      const res = await fetch(buildApiUrl(`/workbook/entry?workbook_id=${workbookId}&day_of_week=${day}`), {
        credentials: 'same-origin'
      });

      if (!res.ok) {
        return null;
      }

      const data = await res.json();
      if (data.success && data.entry) {
        const normalized = {
          workbook_id: workbookId,
          day_of_week: day,
          main_focus: data.entry.main_focus || '',
          tasks: normalizeTaskArrayData(data.entry.tasks),
          notes: data.entry.notes || '',
          progress: Number.parseInt(data.entry.progress, 10) || 0
        };
        currentEntries[day] = normalized;
        return normalized;
      }
    } catch (error) {
      console.error('fetchEntryData error:', error);
    }

    return null;
  }

  async function ensureEntryData(workbookId, day) {
    const cached = currentEntries[day];
    if (cached) {
      cached.tasks = normalizeTaskArrayData(cached.tasks);
      cached.progress = Number.isFinite(cached.progress) ? cached.progress : 0;
      if (cached.progress < 0) cached.progress = 0;
      if (cached.progress > 100) cached.progress = 100;
      return cached;
    }

    const fetched = await fetchEntryData(workbookId, day);
    if (fetched) {
      return fetched;
    }

    const fallback = {
      workbook_id: workbookId,
      day_of_week: day,
      main_focus: '',
      tasks: [],
      notes: '',
      progress: 0
    };
    currentEntries[day] = fallback;
    return fallback;
  }

  async function persistEntryData(workbookId, day, entry) {
    const normalizedTasks = normalizeTaskArrayData(entry.tasks);
    const progressValue = Number.parseInt(entry.progress, 10) || 0;
    const safeProgress = Math.max(0, Math.min(100, progressValue));

    const payload = {
      workbook_id: workbookId,
      day_of_week: day,
      main_focus: (entry.main_focus || '').trim(),
      tasks: JSON.stringify(normalizedTasks),
      notes: (entry.notes || '').trim(),
      progress: safeProgress
    };

    try {
      const res = await fetch(buildApiUrl('/workbook/entry'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'same-origin',
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Save failed');
      }

      currentEntries[day] = {
        workbook_id: workbookId,
        day_of_week: day,
        main_focus: payload.main_focus,
        tasks: normalizedTasks,
        notes: payload.notes,
        progress: safeProgress
      };

      return true;
    } catch (error) {
      console.error('persistEntryData error:', error);
      showNotification('❌ Lỗi khi lưu công việc', 'error');
      return false;
    }
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

    const approverSelect = document.querySelector('[data-approver-select]');
    const selectedApprover = approverSelect ? approverSelect.value.trim() : '';

    if (!selectedApprover) {
      showNotification('Vui lòng chọn người duyệt trước khi gửi.', 'error');
      if (approverSelect) {
        approverSelect.focus();
      }
      return;
    }

    try {
      showLoading('Đang gửi duyệt...');

      const response = await fetch(buildApiUrl(`/workbook/${currentWorkbookId}/status`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          status: 'submitted',
          approver_id: selectedApprover
        })
      });

      const data = await parseJsonResponse(response);

      if (!response.ok) {
        throw new Error(data?.message || 'Gửi duyệt thất bại');
      }

      hideLoading();

      if (data.success) {
        showNotification('Đã gửi duyệt thành công!', 'success');
        // Update status badge
        const statusBadge = document.querySelector('.status-badge');
        if (statusBadge) {
          statusBadge.textContent = 'Chờ duyệt';
          statusBadge.classList.remove('status-draft', 'status-submitted', 'status-approved', 'status-rejected');
          statusBadge.classList.add('status-submitted');
        }
        currentStatus = 'submitted';
        currentApproverId = selectedApprover;
        setTimeout(() => window.location.reload(), 800);
      } else {
        showNotification(data.message || 'Có lỗi xảy ra', 'error');
      }
    } catch (error) {
      hideLoading();
      console.error('Error submitting workbook:', error);
      showNotification('Lỗi kết nối server', 'error');
    }
  }

  async function handleApprovalDecision(decision) {
    if (!currentWorkbookId) {
      showNotification('Không tìm thấy ID sổ tay', 'error');
      return;
    }

    if (!['approved', 'rejected'].includes(decision)) {
      console.warn('Invalid decision requested:', decision);
      return;
    }

    const noteField = document.querySelector('[data-approver-note]');
    const note = noteField ? noteField.value.trim() : '';

    if (decision === 'rejected' && !note) {
      const confirmReject = confirm('Bạn chưa nhập nhận xét. Bạn có chắc muốn từ chối mà không để lại lời nhắn?');
      if (!confirmReject) {
        if (noteField) {
          noteField.focus();
        }
        return;
      }
    }

    try {
      showLoading(decision === 'approved' ? 'Đang phê duyệt...' : 'Đang từ chối...');

      const response = await fetch(buildApiUrl(`/workbook/${currentWorkbookId}/status`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          status: decision,
          note
        })
      });

      const data = await parseJsonResponse(response);

      hideLoading();

      if (!response.ok) {
        throw new Error(data?.message || 'Không thể cập nhật trạng thái');
      }

      if (data.success) {
        showNotification('Đã cập nhật trạng thái phê duyệt.', 'success');
        setTimeout(() => window.location.reload(), 800);
      } else {
        showNotification(data.message || 'Có lỗi xảy ra', 'error');
      }
    } catch (error) {
      hideLoading();
      console.error('Error deciding workbook:', error);
      showNotification(error.message || 'Lỗi cập nhật trạng thái', 'error');
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

    // Update main focus display & inline input
    const mainFocusDisplay = dayCard.querySelector('[data-main-focus-display]');
    if (mainFocusDisplay) {
      mainFocusDisplay.textContent = data.main_focus || 'Chưa có mục tiêu';
      mainFocusDisplay.classList.toggle('empty', !data.main_focus);
    }
    const mainFocusInput = dayCard.querySelector('[data-inline-main-focus]');
    if (mainFocusInput) {
      mainFocusInput.value = data.main_focus || '';
    }

    // Update notes display & inline input
    const notesDisplay = dayCard.querySelector('[data-notes-display]');
    if (notesDisplay) {
      notesDisplay.textContent = data.notes || 'Chưa có ghi chú';
      notesDisplay.classList.toggle('empty', !data.notes);
    }
    const notesInput = dayCard.querySelector('[data-inline-notes]');
    if (notesInput) {
      notesInput.value = data.notes || '';
    }

    // Update progress
    const progressFill = dayCard.querySelector('.progress-fill');
    const progressText = dayCard.querySelector('.progress-text');
    const progressInput = dayCard.querySelector('[data-inline-progress]');
    const progressDisplay = dayCard.querySelector('[data-inline-progress-display]');
    if (progressFill) {
      progressFill.style.width = data.progress + '%';
      progressFill.setAttribute('data-progress', data.progress);
    }
    if (progressText) {
      progressText.textContent = data.progress + '%';
    }
    if (progressInput) {
      progressInput.value = data.progress;
    }
    if (progressDisplay) {
      progressDisplay.textContent = `${data.progress}%`;
    }
    
    console.log('✅ Day card update complete');
  }

  function getInlinePanel(day, workbookId) {
    return document.querySelector(`.inline-detail-panel[data-day="${day}"][data-workbook="${workbookId}"]`);
  }

  function getInlineToggleButton(day, workbookId) {
    return document.querySelector(`[data-action="toggle-inline-details"][data-day="${day}"][data-workbook="${workbookId}"]`);
  }

  function setInlinePanelVisibility(panel, button, expanded) {
    if (!panel) {
      return;
    }
    if (expanded) {
      panel.removeAttribute('hidden');
    } else {
      panel.setAttribute('hidden', 'true');
    }
    if (button) {
      button.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    }
  }

  async function populateInlinePanel(panel, day, workbookId) {
    if (!panel) {
      return;
    }
    const entry = await ensureEntryData(workbookId, day);
    if (!entry) {
      return;
    }

    const mainInput = panel.querySelector('[data-inline-main-focus]');
    if (mainInput) {
      mainInput.value = entry.main_focus || '';
    }

    const notesInput = panel.querySelector('[data-inline-notes]');
    if (notesInput) {
      notesInput.value = entry.notes || '';
    }

    const progressInput = panel.querySelector('[data-inline-progress]');
    if (progressInput) {
      progressInput.value = entry.progress || 0;
      handleInlineProgressInput(progressInput);
    }
  }

  async function handleInlineDetailToggle(button) {
    const day = parseInt(button.dataset.day, 10);
    const workbookId = parseInt(button.dataset.workbook, 10);
    if (Number.isNaN(day) || Number.isNaN(workbookId)) {
      return;
    }

    const panel = getInlinePanel(day, workbookId);
    if (!panel) {
      return;
    }

    const expanded = button.getAttribute('aria-expanded') === 'true';
    if (expanded) {
      setInlinePanelVisibility(panel, button, false);
      return;
    }

    await populateInlinePanel(panel, day, workbookId);
    setInlinePanelVisibility(panel, button, true);
  }

  async function handleInlineDetailSave(button) {
    const day = parseInt(button.dataset.day, 10);
    const workbookId = parseInt(button.dataset.workbook, 10);
    if (Number.isNaN(day) || Number.isNaN(workbookId)) {
      return;
    }

    const panel = getInlinePanel(day, workbookId);
    if (!panel) {
      return;
    }

    const entry = await ensureEntryData(workbookId, day);
    if (!entry) {
      return;
    }

    const mainInput = panel.querySelector('[data-inline-main-focus]');
    const notesInput = panel.querySelector('[data-inline-notes]');
    const progressInput = panel.querySelector('[data-inline-progress]');

    entry.main_focus = mainInput ? mainInput.value.trim() : '';
    entry.notes = notesInput ? notesInput.value.trim() : '';
    entry.progress = progressInput ? (Number.parseInt(progressInput.value, 10) || 0) : entry.progress;

    const ok = await persistEntryData(workbookId, day, entry);
    if (ok) {
      updateDayCard(day, entry);
      setInlinePanelVisibility(panel, getInlineToggleButton(day, workbookId), false);
      showNotification('✅ Đã lưu chi tiết công việc', 'success');
    }
  }

  async function handleInlineDetailCancel(button) {
    const day = parseInt(button.dataset.day, 10);
    const workbookId = parseInt(button.dataset.workbook, 10);
    if (Number.isNaN(day) || Number.isNaN(workbookId)) {
      return;
    }

    const panel = getInlinePanel(day, workbookId);
    if (!panel) {
      return;
    }

    await populateInlinePanel(panel, day, workbookId);
    setInlinePanelVisibility(panel, getInlineToggleButton(day, workbookId), false);
  }

  function handleInlineProgressInput(slider) {
    if (!slider) {
      return;
    }
    const panel = slider.closest('[data-inline-panel]');
    if (!panel) {
      return;
    }
    const value = Number.parseInt(slider.value, 10) || 0;
    const display = panel.querySelector('[data-inline-progress-display]');
    if (display) {
      display.textContent = `${value}%`;
    }
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

    function renderTaskList(day, workbookId, tasks) {
      const listEl = getTaskListEl(day);
      if (!listEl) return;
      listEl.innerHTML = '';
      const normalized = normalizeTaskArrayData(tasks);
      normalized.forEach((task, index) => {
        const taskText = task.text || '';
        const completed = !!task.completed;
        const priority = task.priority || 'medium';
        const priorityLabel = getPriorityLabel(priority);
        const li = document.createElement('li');
        li.className = `task-item-inline ${completed ? 'completed' : ''}`;
        li.dataset.taskIndex = index;
        li.dataset.day = day;
        li.dataset.workbook = workbookId;
        li.innerHTML = `
          <div class="task-priority-badge priority-${priority}"></div>
          <div class="task-checkbox-wrapper">
            <input type="checkbox" class="task-checkbox" ${completed ? 'checked' : ''}>
          </div>
          <span class="task-text-inline">${taskText.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>
          <span class="task-priority-label priority-${priority}">${priorityLabel}</span>
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
      const entry = await ensureEntryData(workbookId, day);
      entry.tasks.push({ text, completed: false, priority });
      entry.progress = computeTaskProgress(entry.tasks);
      const ok = await persistEntryData(workbookId, day, entry);
      if (ok) {
        renderTaskList(day, workbookId, entry.tasks);
        input.value = '';
        updateDayCard(day, entry);
        showNotification('✅ Đã thêm công việc', 'success');
      }
    }

    async function toggleTask(checkboxEl, day, workbookId, index) {
      const entry = await ensureEntryData(workbookId, day);
      const t = entry.tasks[index];
      if (t === undefined) return;
      if (typeof t === 'object') {
        t.completed = !!checkboxEl.checked;
      } else {
        entry.tasks[index] = { text: String(t), completed: !!checkboxEl.checked };
      }
      entry.progress = computeTaskProgress(entry.tasks);
      const ok = await persistEntryData(workbookId, day, entry);
      if (ok) {
        renderTaskList(day, workbookId, entry.tasks);
        updateDayCard(day, entry);
      }
    }

    async function deleteTask(day, workbookId, index) {
      const entry = await ensureEntryData(workbookId, day);
      entry.tasks.splice(index, 1);
      entry.progress = computeTaskProgress(entry.tasks);
      const ok = await persistEntryData(workbookId, day, entry);
      if (ok) {
        renderTaskList(day, workbookId, entry.tasks);
        updateDayCard(day, entry);
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
        const entry = await ensureEntryData(workbookId, day);
        if (entry.tasks[index] === undefined) return;
        if (typeof entry.tasks[index] === 'object') {
          entry.tasks[index].text = newText;
        } else {
          entry.tasks[index] = newText;
        }
        entry.progress = computeTaskProgress(entry.tasks);
        const ok = await persistEntryData(workbookId, day, entry);
        if (ok) {
          renderTaskList(day, workbookId, entry.tasks);
          updateDayCard(day, entry);
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
      const entry = await ensureEntryData(workbookId, day);
      lines.forEach(t => entry.tasks.push({ text: t, completed: false, priority: 'medium' }));
      entry.progress = computeTaskProgress(entry.tasks);
      const ok = await persistEntryData(workbookId, day, entry);
      if (ok) {
        renderTaskList(day, workbookId, entry.tasks);
        batch.value = '';
        toggleBatchMode(day);
        updateDayCard(day, entry);
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
      const entry = await ensureEntryData(workbookId, day);
      (templates[type] || []).forEach(t => entry.tasks.push({ text: t, completed: false, priority: 'medium' }));
      entry.progress = computeTaskProgress(entry.tasks);
      const ok = await persistEntryData(workbookId, day, entry);
      if (ok) {
        renderTaskList(day, workbookId, entry.tasks);
        updateDayCard(day, entry);
        showNotification('✅ Đã áp dụng mẫu công việc', 'success');
      }
    }
    async function pasteFromClipboard(day, workbookId) {
      try {
        const text = await navigator.clipboard.readText();
        const lines = text.split('\n').map(s => s.replace(/^[-•\s]+/, '').trim()).filter(Boolean);
        if (lines.length) {
          const entry = await ensureEntryData(workbookId, day);
          lines.forEach(t => entry.tasks.push({ text: t, completed: false, priority: 'medium' }));
          entry.progress = computeTaskProgress(entry.tasks);
          const ok = await persistEntryData(workbookId, day, entry);
          if (ok) {
            renderTaskList(day, workbookId, entry.tasks);
            updateDayCard(day, entry);
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
