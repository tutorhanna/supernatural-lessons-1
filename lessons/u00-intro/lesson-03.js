
        document.addEventListener('DOMContentLoaded', function() {
            const checkboxes = document.querySelectorAll('.progress-check');
            const counter = document.getElementById('progressCount');
            const barFill = document.getElementById('progressBarFill');
            checkboxes.forEach(cb => {
                const saved = localStorage.getItem('firstlesson_progress_' + cb.dataset.section);
                if (saved === 'true') cb.checked = true;
                cb.addEventListener('change', function() {
                    localStorage.setItem('firstlesson_progress_' + this.dataset.section, this.checked);
                    updateProgress();
                    if (typeof sendProgressUpdate === 'function') sendProgressUpdate();
                });
            });
            function updateProgress() {
                const checked = document.querySelectorAll('.progress-check:checked').length;
                const total = document.querySelectorAll('.progress-check').length;
                const percent = Math.round((checked / total) * 100);
                counter.textContent = checked + ' / ' + total;
                barFill.style.width = percent + '%';
            }
            
            updateProgress();
        });
   

 