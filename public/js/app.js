// Global app JS for UI helpers and common handlers
(function(){
  // Sidebar toggle for layouts that include sidebar
  const toggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('appSidebar');
  if (toggle && sidebar) {
    toggle.addEventListener('click', function(){
      sidebar.classList.toggle('is-collapsed');
      document.body.classList.toggle('sidebar-collapsed');
    });
  }

  // Flash auto dismiss
  document.querySelectorAll('.alert').forEach((el) => {
    if (el.dataset.autoclose !== 'false') {
      setTimeout(() => el.classList.add('fade'), 3500);
    }
  });

  const userMenus = Array.from(document.querySelectorAll('[data-user-menu]'));
  if (userMenus.length) {
    const closeMenu = (menu) => {
      if (!menu.classList.contains('is-open')) return;
      menu.classList.remove('is-open');
      const toggle = menu.querySelector('[data-user-menu-toggle]');
      const dropdown = menu.querySelector('[data-user-menu-dropdown]');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
      if (dropdown) dropdown.setAttribute('hidden', '');
    };

    const openMenu = (menu) => {
      userMenus.forEach((other) => {
        if (other !== menu) closeMenu(other);
      });
      menu.classList.add('is-open');
      const toggle = menu.querySelector('[data-user-menu-toggle]');
      const dropdown = menu.querySelector('[data-user-menu-dropdown]');
      if (toggle) toggle.setAttribute('aria-expanded', 'true');
      if (dropdown) dropdown.removeAttribute('hidden');
    };

    userMenus.forEach((menu) => {
      const toggle = menu.querySelector('[data-user-menu-toggle]');
      const dropdown = menu.querySelector('[data-user-menu-dropdown]');
      if (!toggle || !dropdown) return;

      toggle.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (menu.classList.contains('is-open')) {
          closeMenu(menu);
        } else {
          openMenu(menu);
        }
      });

      toggle.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          closeMenu(menu);
          toggle.focus();
        }
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          toggle.click();
        }
      });

      dropdown.addEventListener('click', (event) => event.stopPropagation());
      dropdown.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          closeMenu(menu);
          toggle.focus();
        }
      });
    });

    document.addEventListener('click', (event) => {
      userMenus.forEach((menu) => {
        if (!menu.contains(event.target)) closeMenu(menu);
      });
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        userMenus.forEach(closeMenu);
      }
    });
  }
})();
