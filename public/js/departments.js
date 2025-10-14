(function(){
  const panel = document.querySelector('[data-department-panel]');
  const backdrop = document.querySelector('[data-panel-backdrop]');
  const openButtons = document.querySelectorAll('[data-open-panel]');
  const closeButtons = document.querySelectorAll('[data-close-panel]');
  const resetButton = document.querySelector('[data-reset-form]');
  const deleteForms = document.querySelectorAll('[data-delete-form]');
  const overlayQuery = window.matchMedia('(max-width: 1280px)');

  const form = panel ? panel.querySelector('form') : null;
  const baseAction = form ? form.getAttribute('data-base-action') || '/departments' : '/departments';
  const submitLabel = panel ? panel.querySelector('[data-submit-label]') : null;
  const panelTitle = panel ? panel.querySelector('[data-panel-title]') : null;
  const panelDescription = panel ? panel.querySelector('[data-panel-description]') : null;

  const idField = panel ? panel.querySelector('#department_id') : null;
  const nameInput = panel ? panel.querySelector('#department_name') : null;
  const codeInput = panel ? panel.querySelector('#department_code') : null;
  const statusSelect = panel ? panel.querySelector('#department_status') : null;
  const parentSelect = panel ? panel.querySelector('#department_parent') : null;
  const headSelect = panel ? panel.querySelector('#department_head') : null;
  const descriptionInput = panel ? panel.querySelector('#department_description') : null;

  const table = document.querySelector('[data-department-table]');
  const rows = table ? Array.from(table.querySelectorAll('[data-department-row]')) : [];
  const statusFilters = document.querySelectorAll('[data-status-filter]');
  const levelFilters = document.querySelectorAll('[data-level-filter]');
  const searchInput = document.querySelector('[data-search-input]');
  const resultsCount = document.querySelector('[data-results-count]');
  const emptyState = document.querySelector('[data-empty-state]');

  const toLower = (value) => (typeof value === 'string' ? value.toLowerCase() : '');
  const decodeField = (value) => {
    if (!value) {
      return '';
    }
    try {
      return decodeURIComponent(value);
    } catch (_error) {
      return value;
    }
  };

  const removeTempOptions = (select) => {
    if (!select) {
      return;
    }
    Array.from(select.querySelectorAll('[data-temp-option]')).forEach((option) => option.remove());
  };

  const ensureOptionValue = (select, value, label) => {
    if (!select || !value) {
      return;
    }
    const exists = Array.from(select.options).some((option) => option.value === value);
    if (exists) {
      return;
    }
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label || `ID ${value}`;
    option.dataset.tempOption = '1';
    select.append(option);
  };

  const syncBackdrop = () => {
    if (!backdrop) {
      return;
    }
    if (panel && !panel.hasAttribute('hidden') && overlayQuery.matches) {
      backdrop.removeAttribute('hidden');
    } else {
      backdrop.setAttribute('hidden', '');
    }
  };

  const setCreateMode = () => {
    if (!form) {
      return;
    }
    form.setAttribute('action', baseAction);
    if (idField) {
      idField.value = '';
    }
    removeTempOptions(parentSelect);
    removeTempOptions(headSelect);
    form.reset();
    if (statusSelect) {
      statusSelect.value = '1';
    }
    if (parentSelect) {
      parentSelect.value = '';
    }
    if (headSelect) {
      headSelect.value = '';
    }
    if (descriptionInput) {
      descriptionInput.value = '';
    }
    if (submitLabel) {
      submitLabel.textContent = 'Lưu khoa';
    }
    if (panelTitle) {
      panelTitle.textContent = 'Thêm khoa';
    }
    if (panelDescription) {
      panelDescription.textContent = 'Tạo đơn vị mới và gán cấp trên, người phụ trách.';
    }
  };

  const setEditMode = (row) => {
    if (!row || !form) {
      return;
    }
    const id = row.dataset.id || '';
    form.setAttribute('action', `${baseAction}/${id}`);
    if (idField) {
      idField.value = id;
    }
    if (submitLabel) {
      submitLabel.textContent = 'Cập nhật';
    }
    if (panelTitle) {
      panelTitle.textContent = 'Chỉnh sửa khoa';
    }
    if (panelDescription) {
      panelDescription.textContent = 'Cập nhật thông tin đơn vị và phân công phụ trách.';
    }
    if (nameInput) {
      nameInput.value = row.dataset.name || '';
    }
    if (codeInput) {
      codeInput.value = row.dataset.code || '';
    }
    if (statusSelect) {
      statusSelect.value = row.dataset.status === 'inactive' ? '0' : '1';
    }

    const parentId = row.dataset.parentId || '';
    const parentLabel = decodeField(row.dataset.parentLabel || '');
    if (parentSelect) {
      removeTempOptions(parentSelect);
      if (parentId && parentLabel) {
        ensureOptionValue(parentSelect, parentId, parentLabel);
      }
      parentSelect.value = parentId;
    }

    const headId = row.dataset.headId || '';
    const headLabel = decodeField(row.dataset.headLabel || '');
    if (headSelect) {
      removeTempOptions(headSelect);
      if (headId && headLabel) {
        ensureOptionValue(headSelect, headId, headLabel);
      }
      headSelect.value = headId;
    }

    if (descriptionInput) {
      descriptionInput.value = decodeField(row.dataset.description || '');
    }
  };

  const openPanel = () => {
    if (!panel) {
      return;
    }
    panel.removeAttribute('hidden');
    if (nameInput) {
      window.requestAnimationFrame(() => {
        nameInput.focus({ preventScroll: true });
      });
    }
    syncBackdrop();
  };

  const closePanel = () => {
    if (!panel) {
      return;
    }
    panel.setAttribute('hidden', '');
    setCreateMode();
    syncBackdrop();
  };

  overlayQuery.addEventListener('change', syncBackdrop);

  openButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      setCreateMode();
      openPanel();
    });
  });

  closeButtons.forEach((btn) => {
    btn.addEventListener('click', closePanel);
  });

  if (backdrop) {
    backdrop.addEventListener('click', closePanel);
  }

  if (resetButton) {
    resetButton.addEventListener('click', () => {
      setCreateMode();
      if (nameInput) {
        nameInput.focus({ preventScroll: true });
      }
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && panel && !panel.hasAttribute('hidden')) {
      event.preventDefault();
      closePanel();
    }
  });

  const editButtons = table ? table.querySelectorAll('[data-edit-department]') : [];
  editButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const row = btn.closest('[data-department-row]');
      if (!row) {
        return;
      }
      setEditMode(row);
      openPanel();
    });
  });

  let activeStatusFilter = 'all';
  let activeLevelFilter = 'all';

  const updateVisibility = () => {
    if (!rows.length) {
      return;
    }
    const query = toLower(searchInput ? searchInput.value.trim() : '');
    let visibleCount = 0;

    rows.forEach((row) => {
      const matchesStatus = activeStatusFilter === 'all' || row.dataset.status === activeStatusFilter;
      const matchesLevel = activeLevelFilter === 'all' || row.dataset.level === activeLevelFilter;
      const haystack = row.dataset.searchText || '';
      const matchesSearch = !query || haystack.indexOf(query) !== -1;
      const shouldShow = matchesStatus && matchesLevel && matchesSearch;
      row.style.display = shouldShow ? '' : 'none';
      if (shouldShow) {
        visibleCount += 1;
      }
    });

    if (resultsCount) {
      resultsCount.textContent = `${visibleCount} đơn vị`;
    }
    if (emptyState) {
      emptyState.hidden = visibleCount !== 0;
    }
  };

  statusFilters.forEach((chip) => {
    chip.addEventListener('click', () => {
      statusFilters.forEach((btn) => btn.classList.remove('is-active'));
      chip.classList.add('is-active');
      activeStatusFilter = chip.getAttribute('data-status-filter') || 'all';
      updateVisibility();
    });
  });

  levelFilters.forEach((chip) => {
    chip.addEventListener('click', () => {
      levelFilters.forEach((btn) => btn.classList.remove('is-active'));
      chip.classList.add('is-active');
      activeLevelFilter = chip.getAttribute('data-level-filter') || 'all';
      updateVisibility();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', updateVisibility);
  }

  updateVisibility();
  syncBackdrop();

  deleteForms.forEach((formElement) => {
    formElement.addEventListener('submit', (event) => {
      const row = formElement.closest('[data-department-row]');
      const unitName = row ? row.dataset.name || 'đơn vị này' : 'đơn vị này';
      const childCount = row ? Number(row.dataset.childCount || '0') : 0;
      const message = childCount > 0
        ? `Xóa ${unitName} sẽ chuyển ${childCount} đơn vị trực thuộc thành khoa cấp 1. Bạn có chắc chắn muốn tiếp tục?`
        : `Bạn có chắc chắn muốn xóa ${unitName}?`;
      if (!window.confirm(message)) {
        event.preventDefault();
      }
    });
  });
})();
