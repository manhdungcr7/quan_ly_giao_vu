/**
 * Main JavaScript for Quan Ly Giao Vu MVC Application
 * This file contains global functions and utilities
 */

// Global application object
const App = {
    // Configuration
    config: {
        baseUrl: window.location.origin,
        apiUrl: window.location.origin + '/api',
        csrfToken: document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
        language: 'vi'
    },

    // Initialize application
    init: function() {
        this.setupSidebar();
        this.setupConfirmations();
        this.setupFormValidation();
        this.setupAutoLogout();
        this.setupCollapsibles();
        this.setupDropdowns();
        this.setupAlertsDismiss();
        this.setupModals();
        
        console.log('Application initialized');
    },

    // Setup sidebar functionality
    setupSidebar: function() {
        const sidebarToggle = document.getElementById('sidebarToggle');
        const sidebar = document.getElementById('sidebar');
        const contentWrapper = document.getElementById('content-wrapper');

        if (sidebarToggle && sidebar && contentWrapper) {
            sidebarToggle.addEventListener('click', function() {
                sidebar.classList.toggle('collapsed');
                contentWrapper.classList.toggle('expanded');
                
                // Save sidebar state to localStorage
                const isCollapsed = sidebar.classList.contains('collapsed');
                localStorage.setItem('sidebarCollapsed', isCollapsed);
            });

            // Restore sidebar state from localStorage
            const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
            if (isCollapsed) {
                sidebar.classList.add('collapsed');
                contentWrapper.classList.add('expanded');
            }
        }

        const mobileSidebarToggle = document.getElementById('mobileSidebarToggle');
        if (mobileSidebarToggle && sidebar) {
            mobileSidebarToggle.addEventListener('click', function() {
                sidebar.classList.toggle('open');
            });

            document.addEventListener('click', function(e) {
                if (window.innerWidth <= 768) {
                    if (!sidebar.contains(e.target) && !mobileSidebarToggle.contains(e.target)) {
                        sidebar.classList.remove('open');
                    }
                }
            });
        }
    },

    // Setup confirmation dialogs
    setupConfirmations: function() {
        document.addEventListener('click', function(e) {
            const target = e.target.closest('[data-confirm]');
            if (target) {
                e.preventDefault();
                const message = target.getAttribute('data-confirm');
                if (confirm(message)) {
                    if (target.tagName === 'FORM') {
                        target.submit();
                    } else if (target.href) {
                        window.location.href = target.href;
                    } else if (target.onclick) {
                        target.onclick();
                    }
                }
            }
        });
    },

    // Setup form validation
    setupFormValidation: function() {
        const forms = document.querySelectorAll('.needs-validation');
        Array.prototype.slice.call(forms).forEach(function(form) {
            form.addEventListener('submit', function(event) {
                if (!form.checkValidity()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                form.classList.add('was-validated');
            }, false);
        });

        // Custom validation rules
        this.addCustomValidationRules();
    },

    // Add custom validation rules
    addCustomValidationRules: function() {
        // Phone number validation
        const phoneInputs = document.querySelectorAll('input[type="tel"]');
        phoneInputs.forEach(function(input) {
            input.addEventListener('input', function() {
                const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
                if (this.value && !phoneRegex.test(this.value)) {
                    this.setCustomValidity('Số điện thoại không hợp lệ');
                } else {
                    this.setCustomValidity('');
                }
            });
        });

        // Password confirmation validation
        const passwordConfirmInputs = document.querySelectorAll('input[name="password_confirm"]');
        passwordConfirmInputs.forEach(function(confirmInput) {
            const form = confirmInput.closest('form');
            const passwordInput = form.querySelector('input[name="password"]');
            
            if (passwordInput) {
                function validatePasswordMatch() {
                    if (confirmInput.value !== passwordInput.value) {
                        confirmInput.setCustomValidity('Mật khẩu xác nhận không khớp');
                    } else {
                        confirmInput.setCustomValidity('');
                    }
                }
                
                confirmInput.addEventListener('input', validatePasswordMatch);
                passwordInput.addEventListener('input', validatePasswordMatch);
            }
        });
    },

    // Setup AJAX loading indicators
    setupAjaxLoading: function() {
        console.warn('setupAjaxLoading is deprecated. Loading overlay handled via fetch wrappers.');
    },

    // Setup auto logout
    setupAutoLogout: function() {
        let idleTime = 0;
        const maxIdleTime = 30; // minutes

        // Increment idle time counter every minute
        const idleInterval = setInterval(function() {
            idleTime++;
            if (idleTime >= maxIdleTime) {
                App.showAlert('Phiên làm việc đã hết hạn do không hoạt động.', 'warning');
                setTimeout(() => {
                    window.location.href = '/auth/logout';
                }, 3000);
                clearInterval(idleInterval);
            }
        }, 60000); // 1 minute

        // Reset idle time on user activity
        document.addEventListener('mousemove', () => idleTime = 0);
        document.addEventListener('keypress', () => idleTime = 0);
        document.addEventListener('click', () => idleTime = 0);
        document.addEventListener('scroll', () => idleTime = 0);
    },

    setupCollapsibles: function() {
        document.querySelectorAll('[data-bs-toggle="collapse"]').forEach(toggle => {
            const targetSelector = toggle.getAttribute('data-bs-target');
            const target = document.querySelector(targetSelector);
            if (!target) return;

            toggle.addEventListener('click', () => {
                const isOpen = target.classList.toggle('is-open');
                toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            });
        });
    },

    setupDropdowns: function() {
        const dropdownToggles = document.querySelectorAll('[data-bs-toggle="dropdown"]');
        const closeAll = () => {
            document.querySelectorAll('.dropdown-menu.show').forEach(menu => menu.classList.remove('show'));
        };

        dropdownToggles.forEach(toggle => {
            const menu = toggle.nextElementSibling;
            if (!menu) return;

            toggle.addEventListener('click', (event) => {
                event.preventDefault();
                const isOpen = menu.classList.contains('show');
                closeAll();
                if (!isOpen) {
                    menu.classList.add('show');
                }
            });
        });

        document.addEventListener('click', (event) => {
            if (!event.target.closest('.dropdown')) {
                closeAll();
            }
        });
    },

    setupAlertsDismiss: function() {
        document.addEventListener('click', (event) => {
            const dismissBtn = event.target.closest('[data-bs-dismiss="alert"]');
            if (!dismissBtn) return;

            const alert = dismissBtn.closest('.alert');
            if (alert) {
                alert.classList.add('is-hiding');
                setTimeout(() => alert.remove(), 200);
            }
        });
    },

    setupModals: function() {
        const openModal = (modal) => {
            modal.classList.add('is-open');
            document.body.dataset.modalOpen = 'true';
            document.body.style.overflow = 'hidden';
        };

        const closeModal = (modal) => {
            modal.classList.remove('is-open');
            if (!document.querySelector('.modal.is-open')) {
                document.body.dataset.modalOpen = 'false';
                document.body.style.overflow = '';
            }
        };

        document.querySelectorAll('[data-bs-toggle="modal"]').forEach(trigger => {
            const targetSelector = trigger.getAttribute('data-bs-target');
            const modal = document.querySelector(targetSelector);
            if (!modal) return;

            trigger.addEventListener('click', (event) => {
                event.preventDefault();
                openModal(modal);
            });
        });

        document.addEventListener('click', (event) => {
            const dismiss = event.target.closest('[data-bs-dismiss="modal"], .modal .btn-close');
            if (dismiss) {
                const modal = dismiss.closest('.modal');
                if (modal) closeModal(modal);
                return;
            }

            const modalOverlay = event.target.classList.contains('modal') ? event.target : null;
            if (modalOverlay) {
                closeModal(modalOverlay);
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                document.querySelectorAll('.modal.is-open').forEach(closeModal);
            }
        });
    },

    // Utility functions
    showLoading: function(element = null) {
        if (element) {
            element.classList.add('loading');
        } else {
            // Show global loading overlay
            let loadingOverlay = document.getElementById('loadingOverlay');
            if (!loadingOverlay) {
                loadingOverlay = document.createElement('div');
                loadingOverlay.id = 'loadingOverlay';
                loadingOverlay.className = 'loading-overlay';
                loadingOverlay.innerHTML = `
                    <div class="loading-spinner">
                        <div class="loading-spinner__circle"></div>
                        <div class="loading-text">Đang xử lý...</div>
                    </div>
                `;
                document.body.appendChild(loadingOverlay);
            }
            loadingOverlay.style.display = 'flex';
        }
    },

    hideLoading: function(element = null) {
        if (element) {
            element.classList.remove('loading');
        } else {
            const loadingOverlay = document.getElementById('loadingOverlay');
            if (loadingOverlay) {
                loadingOverlay.style.display = 'none';
            }
        }
    },

    showAlert: function(message, type = 'info', duration = 5000) {
        const alertContainer = document.getElementById('alertContainer') || document.body;
        const alertId = 'alert-' + Date.now();
        
        const alert = document.createElement('div');
        alert.className = `app-alert app-alert--${type}`;
        alert.id = alertId;
        alert.innerHTML = `
            <span class="app-alert__message">${message}</span>
            <button type="button" class="app-alert__close" aria-label="Đóng">&times;</button>
        `;

        alert.querySelector('.app-alert__close').addEventListener('click', () => {
            alert.classList.add('is-hiding');
            setTimeout(() => alert.remove(), 200);
        });

        alertContainer.insertAdjacentElement('afterbegin', alert);

        if (duration > 0) {
            setTimeout(() => {
                if (alert.isConnected) {
                    alert.classList.add('is-hiding');
                    setTimeout(() => alert.remove(), 200);
                }
            }, duration);
        }
    },

    // API helper functions
    api: {
        get: function(url, options = {}) {
            App.showLoading();
            return fetch(App.config.apiUrl + url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': App.config.csrfToken,
                    ...options.headers
                },
                ...options
            })
                .then(App.handleResponse)
                .catch(App.handleError)
                .finally(() => App.hideLoading());
        },

        post: function(url, data = {}, options = {}) {
            App.showLoading();
            return fetch(App.config.apiUrl + url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': App.config.csrfToken,
                    ...options.headers
                },
                body: JSON.stringify(data),
                ...options
            })
                .then(App.handleResponse)
                .catch(App.handleError)
                .finally(() => App.hideLoading());
        },

        put: function(url, data = {}, options = {}) {
            App.showLoading();
            return fetch(App.config.apiUrl + url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': App.config.csrfToken,
                    ...options.headers
                },
                body: JSON.stringify(data),
                ...options
            })
                .then(App.handleResponse)
                .catch(App.handleError)
                .finally(() => App.hideLoading());
        },

        delete: function(url, options = {}) {
            App.showLoading();
            return fetch(App.config.apiUrl + url, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': App.config.csrfToken,
                    ...options.headers
                },
                ...options
            })
                .then(App.handleResponse)
                .catch(App.handleError)
                .finally(() => App.hideLoading());
        }
    },

    handleResponse: function(response) {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    },

    handleError: function(error) {
        console.error('API error:', error);
        App.showAlert('Đã xảy ra lỗi khi kết nối máy chủ. Vui lòng thử lại sau.', 'danger');
        throw error;
    },

    // Date and time utilities
    formatDate: function(date, format = 'dd/mm/yyyy') {
        if (!(date instanceof Date)) {
            date = new Date(date);
        }
        
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        
        return format
            .replace('dd', day)
            .replace('mm', month)
            .replace('yyyy', year);
    },

    formatDateTime: function(date, format = 'dd/mm/yyyy HH:MM') {
        if (!(date instanceof Date)) {
            date = new Date(date);
        }
        
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return this.formatDate(date, format)
            .replace('HH', hours)
            .replace('MM', minutes);
    },

    // File size formatter
    formatFileSize: function(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    // Number formatter
    formatNumber: function(number, locale = 'vi-VN') {
        return new Intl.NumberFormat(locale).format(number);
    }
};

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    App.init();
});

// Add loading overlay styles
const loadingStyles = `
    <style>
        .loading-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        }
        
        .loading-spinner {
            display: flex;
            flex-direction: column;
            align-items: center;
            color: #e2e8f0;
            gap: 12px;
        }

        .loading-spinner__circle {
            width: 52px;
            height: 52px;
            border-radius: 50%;
            border: 4px solid rgba(255, 255, 255, 0.25);
            border-top-color: #60a5fa;
            animation: loading-spin 1s linear infinite;
        }

        @keyframes loading-spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }

        .loading-text {
            font-size: 1rem;
            letter-spacing: 0.02em;
        }

        .loading {
            position: relative;
            pointer-events: none;
            opacity: 0.7;
        }

        .app-alert {
            position: relative;
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 16px;
            border-radius: 12px;
            margin: 12px;
            color: #0f172a;
            background: #e2e8f0;
            box-shadow: 0 12px 24px rgba(15, 23, 42, 0.1);
            transition: transform 0.2s ease, opacity 0.2s ease;
        }

        .app-alert--info { background: rgba(59, 130, 246, 0.12); color: #1d4ed8; }
        .app-alert--success { background: rgba(34, 197, 94, 0.12); color: #15803d; }
        .app-alert--warning { background: rgba(245, 158, 11, 0.16); color: #b45309; }
        .app-alert--danger { background: rgba(248, 113, 113, 0.16); color: #b91c1c; }

        .app-alert__close {
            margin-left: auto;
            background: none;
            border: none;
            color: inherit;
            font-size: 20px;
            line-height: 1;
            cursor: pointer;
        }

        .app-alert.is-hiding {
            opacity: 0;
            transform: translateY(-6px);
        }
    </style>
`;

document.head.insertAdjacentHTML('beforeend', loadingStyles);

// Export for use in other files
window.App = App;