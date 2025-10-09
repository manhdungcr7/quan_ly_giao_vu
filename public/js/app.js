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
})();
