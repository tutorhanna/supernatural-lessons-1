



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
