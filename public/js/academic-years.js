(function(){
    const panel = document.querySelector('[data-form-panel]');
    const backdrop = document.querySelector('[data-form-backdrop]');
    const toggleButtons = document.querySelectorAll('[data-toggle-form]');
    const closeButtons = document.querySelectorAll('[data-close-form]');
    const tableRoot = document.querySelector('[data-academic-table]');
    const searchInput = document.querySelector('[data-search-input]');
    const filterChips = document.querySelectorAll('[data-status-filter]');
    const rows = tableRoot ? Array.from(tableRoot.querySelectorAll('[data-academic-row]')) : [];
    const resultsCount = document.querySelector('[data-results-count]');
    const emptyState = document.querySelector('[data-empty-state]');

    const overlayQuery = window.matchMedia('(max-width: 1280px)');

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

    const activatePanel = () => {
        if (!panel) return;
        panel.removeAttribute('hidden');
        panel.focus({ preventScroll: true });
        syncBackdrop();
        if (searchInput) searchInput.blur();
    };

    const hidePanel = () => {
        if (!panel) return;
        panel.setAttribute('hidden', '');
        syncBackdrop();
    };

    toggleButtons.forEach((btn) => {
        btn.addEventListener('click', activatePanel);
    });

    closeButtons.forEach((btn) => {
        btn.addEventListener('click', hidePanel);
    });

    if (backdrop) {
        backdrop.addEventListener('click', hidePanel);
    }

    overlayQuery.addEventListener('change', syncBackdrop);

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && panel && !panel.hasAttribute('hidden')) {
            hidePanel();
        }
    });

    const form = panel ? panel.querySelector('form') : null;
    if (form) {
        form.addEventListener('submit', function(event){
            const start = form.querySelector('#start_date').value;
            const end = form.querySelector('#end_date').value;
            if (start && end && start > end) {
                event.preventDefault();
                alert('Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.');
            }
        });
    }

    let activeStatus = 'all';

    const updateVisibility = () => {
        if (!rows.length) return;
        const query = (searchInput?.value || '').toLowerCase().trim();
        let visibleCount = 0;

        rows.forEach((row) => {
            const status = row.getAttribute('data-status');
            const haystack = row.getAttribute('data-search-text') || '';
            const matchesStatus = activeStatus === 'all' || status === activeStatus;
            const matchesQuery = !query || haystack.includes(query);
            const shouldShow = matchesStatus && matchesQuery;
            row.style.display = shouldShow ? '' : 'none';
            if (shouldShow) visibleCount += 1;
        });

        if (resultsCount) {
            resultsCount.textContent = `${visibleCount} năm học`;
        }

        if (emptyState) {
            emptyState.hidden = visibleCount !== 0;
        }
    };

    filterChips.forEach((chip) => {
        chip.addEventListener('click', () => {
            filterChips.forEach((btn) => btn.classList.remove('is-active'));
            chip.classList.add('is-active');
            activeStatus = chip.getAttribute('data-status-filter') || 'all';
            updateVisibility();
        });
    });

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            updateVisibility();
        });
    }

    updateVisibility();
    syncBackdrop();
})();
