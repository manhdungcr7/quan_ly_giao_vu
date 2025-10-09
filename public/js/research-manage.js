document.addEventListener('DOMContentLoaded', () => {
  const dom = {
    projectForm: document.querySelector('#projectForm'),
    studentProjectForm: document.querySelector('#studentProjectForm'),
    studentOutputForm: document.querySelector('#studentOutputForm')
  };

  const modeIndicators = new Map();
  document.querySelectorAll('.mode-indicator').forEach((indicator) => {
    const target = indicator.getAttribute('data-mode-label');
    if (target) {
      modeIndicators.set(target, indicator);
    }
  });

  function setMode(form, mode, label) {
    if (!form) return;
    form.dataset.mode = mode;
    const selector = `#${form.id}`;
    const indicator = modeIndicators.get(selector);
    if (indicator && label) {
      indicator.textContent = label;
    }
  }

  function fillForm(form, data) {
    if (!form || !data) return;
    Object.entries(data).forEach(([key, value]) => {
      const field = form.querySelector(`[name="${key}"]`);
      if (!field) return;
      if (field.tagName === 'SELECT') {
        field.value = value ?? '';
        field.dispatchEvent(new Event('change', { bubbles: false }));
      } else if (field.tagName === 'TEXTAREA') {
        field.value = value ?? '';
      } else {
        field.value = value ?? '';
      }
    });
  }

  function resetForm(form, defaultLabel) {
    if (!form) return;
    form.reset();
    if (form.querySelector('[name="id"]')) {
      form.querySelector('[name="id"]').value = '';
    }
    setMode(form, 'create', defaultLabel);
  }

  function parseButtonData(button) {
    const dataset = { ...button.dataset };
    const parsed = {};
    Object.keys(dataset).forEach((key) => {
      const value = dataset[key];
      if (value === undefined) return;
      switch (key) {
        case 'id':
        case 'categoryId':
        case 'leaderId':
        case 'supervisorId':
        case 'teamSize':
        case 'projectId':
          parsed[key.replace(/[A-Z]/g, (match) => `_${match.toLowerCase()}`)] = value ? Number(value) : '';
          break;
        case 'progress':
          parsed.progress = value ? Number(value) : 0;
          break;
        default: {
          const normalizedKey = key.replace(/[A-Z]/g, (match) => `_${match.toLowerCase()}`);
          parsed[normalizedKey] = value;
        }
      }
    });
    return parsed;
  }

  function attachEditHandler(selector, form, labelBuilder) {
    if (!form) return;
    document.querySelectorAll(selector).forEach((button) => {
      button.addEventListener('click', () => {
        const payload = parseButtonData(button);
        fillForm(form, payload);
        const label = labelBuilder(payload);
        setMode(form, 'edit', label);
        const firstField = form.querySelector('input, select, textarea');
        if (firstField) {
          firstField.focus({ preventScroll: false });
        }
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  function attachResetHandlers() {
    document.querySelectorAll('[data-reset-target]').forEach((trigger) => {
      const targetSelector = trigger.getAttribute('data-reset-target');
      if (!targetSelector) return;
      trigger.addEventListener('click', () => {
        const form = document.querySelector(targetSelector);
        const defaultLabel = trigger.dataset.resetLabel || 'Thêm mới';
        resetForm(form, defaultLabel);
        if (form) form.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    [dom.projectForm, dom.studentProjectForm, dom.studentOutputForm].forEach((form) => {
      if (!form) return;
      const defaultLabel = form.id === 'projectForm'
        ? 'Thêm mới đề tài'
        : form.id === 'studentProjectForm'
          ? 'Thêm mới đề tài'
          : 'Thêm mới kết quả';
      form.addEventListener('reset', () => {
        window.setTimeout(() => {
          resetForm(form, defaultLabel);
        }, 0);
      });
    });
  }

  function attachDeleteConfirmation() {
    document.querySelectorAll('form[data-confirm]').forEach((form) => {
      form.addEventListener('submit', (event) => {
        const message = form.getAttribute('data-confirm') || 'Bạn có chắc chắn?';
        if (!window.confirm(message)) {
          event.preventDefault();
        }
      });
    });
  }

  function setupSupervisorSync() {
    if (!dom.studentProjectForm) return;
    const select = dom.studentProjectForm.querySelector('select[name="supervisor_id"]');
    const nameInput = dom.studentProjectForm.querySelector('input[name="supervisor_name"]');
    if (!select || !nameInput) return;

    select.addEventListener('change', () => {
      const option = select.selectedOptions[0];
      if (!option) return;
      const fullName = option.getAttribute('data-full-name');
      if (fullName) {
        nameInput.value = fullName;
      }
    });
  }

  function init() {
    if (dom.projectForm) {
      setMode(dom.projectForm, 'create', 'Thêm mới đề tài');
      attachEditHandler('[data-action="edit-project"]', dom.projectForm, (payload) => `Chỉnh sửa: ${payload.title || ''}`);
    }

    if (dom.studentProjectForm) {
      setMode(dom.studentProjectForm, 'create', 'Thêm mới đề tài');
      attachEditHandler('[data-action="edit-student-project"]', dom.studentProjectForm, (payload) => `Chỉnh sửa: ${payload.title || ''}`);
    }

    if (dom.studentOutputForm) {
      setMode(dom.studentOutputForm, 'create', 'Thêm mới kết quả');
      attachEditHandler('[data-action="edit-student-output"]', dom.studentOutputForm, (payload) => `Chỉnh sửa: ${payload.title || ''}`);
    }

    attachResetHandlers();
    attachDeleteConfirmation();
    setupSupervisorSync();
  }

  init();
});
