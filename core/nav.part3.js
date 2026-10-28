
    document.addEventListener('DOMContentLoaded', function() {
        const navLinks = document.querySelectorAll('.nav-link');
        const sections = document.querySelectorAll('h2[id^="sec-"], div#sec-reflection');
        function updateActiveNav() {
            let currentSection = '';
            sections.forEach(section => {
                const rect = section.getBoundingClientRect();
                if (rect.top <= 150 && rect.bottom >= 0) currentSection = section.id;
            });
            navLinks.forEach(link => {
                const linkSection = link.getAttribute('data-section');
                link.style.color = '#6a5a4a';
                link.style.background = 'transparent';
                link.style.borderLeft = 'none';
                if (linkSection === currentSection) {
                    link.style.color = '#d4a060';
                    link.style.background = 'rgba(139,58,42,0.25)';
                    link.style.borderLeft = '2px solid #8b3a2a';
                    link.style.paddingLeft = '3px';
                } else {
                    link.style.borderLeft = 'none';
                    link.style.paddingLeft = '5px';
                }
            });
        }
        window.addEventListener('scroll', updateActiveNav);
        window.addEventListener('resize', updateActiveNav);
        updateActiveNav();
    });
