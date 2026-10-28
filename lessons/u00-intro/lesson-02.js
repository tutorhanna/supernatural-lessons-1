
    // Обновляем прогресс в Roadmap
    document.addEventListener('DOMContentLoaded', function() {
        const roadmapSpan = document.getElementById('roadmapProgress');
        if (!roadmapSpan) return;
        
                function updateRoadmapProgress() {
            const checked = document.querySelectorAll('.progress-check:checked').length;
            const total = document.querySelectorAll('.progress-check').length;
            roadmapSpan.textContent = checked;
            const totalSpan = document.getElementById('roadmapTotal');
            if (totalSpan) totalSpan.textContent = total;
        }
        
        // Обновляем при изменении прогресса
        document.querySelectorAll('.progress-check').forEach(cb => {
            cb.addEventListener('change', updateRoadmapProgress);
        });
        
        // Первоначальное обновление
        setTimeout(updateRoadmapProgress, 500);
    });
