(function () {
    const rejectButtons = document.querySelectorAll('.js-users-reject');
    if (!rejectButtons.length) {
        return;
    }

    rejectButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            const form = button.closest('form');
            if (!form) {
                return;
            }

            const reasonInput = form.querySelector('input[name="reason"]');
            if (!reasonInput) {
                return;
            }

            const displayName = form.getAttribute('data-user-name') || ''; // done
            const promptText = displayName
                ? 'Nhập lý do từ chối tài khoản "' + displayName + '" (có thể để trống):'
                : 'Nhập lý do từ chối tài khoản (có thể để trống):';

            const reason = window.prompt(promptText, '') || '';
            if (reason === null) {
                return;
            }

            reasonInput.value = reason.trim();
            form.submit();
        });
    });
})();
