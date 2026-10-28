
    // ============================================================
    // TOP NAV — LESSON DROPDOWNS
    // ============================================================
    let openDropdown = null;

    function toggleLessonDropdown(lessonId) {
        const dropdown = document.getElementById('dropdown-' + lessonId);
        if (openDropdown && openDropdown !== dropdown) {
            openDropdown.classList.remove('show');
        }
        dropdown.classList.toggle('show');
        openDropdown = dropdown.classList.contains('show') ? dropdown : null;
    }

    // Закрыть dropdown при клике вне навигации
    document.addEventListener('click', function(e) {
        if (!e.target.closest('#topNav')) {
            document.querySelectorAll('#topNav .dropdown').forEach(d => d.classList.remove('show'));
            openDropdown = null;
        }
    });

    // Закрыть dropdown при клике на ссылку
    document.querySelectorAll('#topNav .dropdown a').forEach(link => {
        link.addEventListener('click', function() {
            document.querySelectorAll('#topNav .dropdown').forEach(d => d.classList.remove('show'));
            openDropdown = null;
        });
    });

    // Сворачивание верхней навигации
    let topNavCollapsed = false;

    function toggleTopNavCollapse() {
        const nav = document.getElementById('topNav');
        const toggle = document.getElementById('topNavToggle');
        topNavCollapsed = !topNavCollapsed;
        nav.classList.toggle('collapsed', topNavCollapsed);
        toggle.textContent = topNavCollapsed ? '▾' : '▴';
    }

    // Плавный скролл с учётом высоты topNav
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const topNavHeight = 70;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - topNavHeight;
                window.scrollTo({ top: targetPosition, behavior: 'smooth' });
            }
        });
    });
