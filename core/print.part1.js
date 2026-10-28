
    
    window.addEventListener('beforeprint', function() {
        document.querySelectorAll('select').forEach(select => {
            const value = select.options[select.selectedIndex]?.text || '(not selected)';
            let mirror = select.nextElementSibling;
            if (!mirror || !mirror.classList.contains('select-mirror')) {
                mirror = document.createElement('span');
                mirror.className = 'select-mirror';
                select.parentNode.insertBefore(mirror, select.nextSibling);
            }
            mirror.textContent = value;
        });
    });
    window.addEventListener('afterprint', function() {
        document.querySelectorAll('.select-mirror').forEach(el => el.remove());
    });
