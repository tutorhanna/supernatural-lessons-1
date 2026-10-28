
        document.addEventListener('DOMContentLoaded', function() {
            const checkboxes = document.querySelectorAll('.final-check');
            const doneSpan = document.getElementById('finalDone');
            const totalSpan = document.getElementById('finalTotal');
            const percentSpan = document.getElementById('finalPercent');
            const barFill = document.getElementById('finalBarFill');
            const message = document.getElementById('finalMessage');
            checkboxes.forEach(cb => {
                const saved = localStorage.getItem('final_check_' + cb.dataset.task);
                if (saved === 'true') cb.checked = true;
                cb.addEventListener('change', function() {
                    localStorage.setItem('final_check_' + this.dataset.task, this.checked);
                    updateFinalProgress();
                });
            });
            function updateFinalProgress() {
                const checked = document.querySelectorAll('.final-check:checked').length;
                const total = document.querySelectorAll('.final-check').length;
                const percent = Math.round((checked/total)*100);
                doneSpan.textContent = checked; totalSpan.textContent = total; percentSpan.textContent = percent; barFill.style.width = percent+'%';
            }
            updateFinalProgress();
        });
    