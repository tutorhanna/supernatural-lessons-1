
    // Подсветка текущего раздела
    document.addEventListener('DOMContentLoaded', function() {
        const navLinks = document.querySelectorAll('.nav-link');
        const sections = document.querySelectorAll('h2[id], .section[id]');
        function updateActiveNav() {
            let currentSection = '';
            sections.forEach(section => {
                const rect = section.getBoundingClientRect();
                if (rect.top <= 150 && rect.bottom >= 150) currentSection = section.id;
            });
            navLinks.forEach(link => {
                const linkSection = link.getAttribute('data-section');
                link.style.color = '#6a5a4a';
                link.style.background = 'transparent';
                if (linkSection === currentSection) {
                    link.style.color = '#6b2a1a';
                    link.style.background = 'rgba(139,58,42,0.15)';
                }
            });
        }
        window.addEventListener('scroll', updateActiveNav);
        window.addEventListener('resize', updateActiveNav);
        updateActiveNav();

        // Сворачивание
        const saved = localStorage.getItem('tgSideNavCollapsed');
        const nav = document.getElementById('sideNav');
        const btn = nav.querySelector('.nav-toggle');
        if (saved === 'true') {
            nav.classList.add('collapsed');
            btn.textContent = '▶';
        }
    });

    function toggleSideNav() {
        const nav = document.getElementById('sideNav');
        const btn = nav.querySelector('.nav-toggle');
        nav.classList.toggle('collapsed');
        const isCollapsed = nav.classList.contains('collapsed');
        btn.textContent = isCollapsed ? '▶' : '◀';
        localStorage.setItem('tgSideNavCollapsed', isCollapsed);
    }

    // Кнопка «наверх»
    window.addEventListener('scroll', function() {
        const btn = document.getElementById('scrollTopBtn');
        if (window.scrollY > 400) {
            btn.style.opacity = '1';
            btn.style.visibility = 'visible';
            btn.style.transform = 'scale(1)';
        } else {
            btn.style.opacity = '0';
            btn.style.visibility = 'hidden';
            btn.style.transform = 'scale(0.8)';
        }
    });
