


// Показать ⏸ учителю, если он в комнате (при любом раскладе)
window.addEventListener('load', function() {
    // Проверяем каждую секунду — вдруг isTeacher меняется позже
    const pauseWatcher = setInterval(function() {
        if (typeof isTeacher !== 'undefined' && isTeacher) {
            const pauseBtn = document.getElementById('syncPauseBtn');
            if (pauseBtn && pauseBtn.style.display === 'none') {
                pauseBtn.style.display = 'flex';
            }
            clearInterval(pauseWatcher);
        }
    }, 500);
});

// ============================================================
// TEACHER BAR — свернуть/развернуть верхнюю панель учителя
// ============================================================
function toggleTeacherBar() {
    const bar = document.getElementById('teacherInfoBlock');
    const btn = document.getElementById('teacherBarToggle');
    if (!bar || !btn) return;

    const isCollapsed = bar.classList.toggle('collapsed');
    document.body.classList.toggle('teacher-bar-collapsed', isCollapsed);

    btn.textContent = isCollapsed ? '▴' : '▾';
    btn.title = isCollapsed ? 'Развернуть панель' : 'Свернуть панель';

    // Сохраняем состояние
    localStorage.setItem('teacherBarCollapsed', isCollapsed ? 'true' : 'false');
}

// Восстанавливаем состояние при загрузке
window.addEventListener('load', function() {
    setTimeout(function() {
        const collapsed = localStorage.getItem('teacherBarCollapsed') === 'true';
        const bar = document.getElementById('teacherInfoBlock');
        const btn = document.getElementById('teacherBarToggle');
        if (bar && btn && bar.style.display !== 'none') {
            if (collapsed) {
                bar.classList.add('collapsed');
                document.body.classList.add('teacher-bar-collapsed');
                btn.textContent = '▴';
            }
        }
    }, 1000);
});
