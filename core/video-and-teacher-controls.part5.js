
// ============================================================
// КНОПКА ПАУЗЫ СИНХРОНИЗАЦИИ (учитель)
// ============================================================
function toggleSyncPause() {
    syncPaused = !syncPaused;
    const btn = document.getElementById('syncPauseBtn');
    if (!btn) return;

    if (syncPaused) {
        btn.textContent = '▶';
        btn.style.background = 'linear-gradient(135deg,#3a1a1a,#2a0a0a)';
        btn.style.borderColor = '#c0392b';
        btn.style.color = '#e74c3c';
        btn.style.boxShadow = '0 0 30px rgba(192,57,43,0.5)';
        btn.title = 'Возобновить синхронизацию';
    } else {
        btn.textContent = '⏸';
        btn.style.background = 'linear-gradient(135deg,#1a3a1a,#0a2a0a)';
        btn.style.borderColor = '#27ae60';
        btn.style.color = '#7dcea0';
        btn.style.boxShadow = '0 0 30px rgba(39,174,96,0.4)';
        btn.title = 'Пауза синхронизации';
        // Догоняем учеников на текущую позицию
        if (fb && roomId) {
            fb.set(fb.ref(fb.db, `rooms/${roomId}/scrollCommand`), Object.assign(scrollAnchorAt(Math.round(window.scrollY)), { at: Date.now() })).catch(() => {});
        }
    }
}

