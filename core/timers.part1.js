
    // ===== MAIN TIMER =====
    let mainSeconds = 2700, mainInterval = null, mainRunning = false;
    const mainDisplay = document.getElementById('mainDisplay');
    const mainStatus = document.getElementById('mainStatus');

    function mainUpdateDisplay() {
        const mins = String(Math.floor(mainSeconds/60)).padStart(2,'0');
        const secs = String(mainSeconds%60).padStart(2,'0');
        mainDisplay.textContent = mins+':'+secs;
        mainDisplay.classList.remove('warning','danger');
        if (mainSeconds <= 60) mainDisplay.classList.add('danger');
        else if (mainSeconds <= 300) mainDisplay.classList.add('warning');
    }
    function mainSet(minutes) { if (mainRunning) return; mainSeconds = minutes*60; mainUpdateDisplay(); mainStatus.textContent = '⏸ Готов ('+minutes+' мин)'; mainStatus.className = 'timer-status'; }
    function mainStart() {
        if (mainRunning) return;
        if (mainSeconds <= 0) { mainSet(45); return; }
        mainRunning = true;
        mainStatus.textContent = '▶ Идёт...';
        mainStatus.className = 'timer-status running';
        mainInterval = setInterval(() => {
            mainSeconds--;
            mainUpdateDisplay();
            if (mainSeconds <= 0) {
                clearInterval(mainInterval); mainInterval = null; mainRunning = false;
                mainStatus.textContent = '⏰ ВРЕМЯ ВЫШЛО!';
                mainStatus.className = 'timer-status finished';
                if ('vibrate' in navigator) navigator.vibrate(500);
                alert('⏰ Время урока вышло!');
            }
        }, 1000);
    }
    function mainStop() { if (!mainRunning) return; clearInterval(mainInterval); mainInterval = null; mainRunning = false; mainStatus.textContent = '⏸ Остановлен'; mainStatus.className = 'timer-status stopped'; }
    function mainReset() { mainStop(); mainSet(45); }
    function toggleMainTimer() {
        const el = document.getElementById('mainTimer');
        const btn = document.querySelector('.timer-collapse');
        el.classList.toggle('collapsed');
        btn.textContent = el.classList.contains('collapsed') ? '▸' : '▾';
    }

    // ===== MINI TIMER =====
    let miniSeconds = 120, miniInterval = null, miniRunning = false;
    const miniDisplay = document.getElementById('miniDisplay');
    const miniStatus = document.getElementById('miniStatus');
    function miniUpdateDisplay() {
        const mins = String(Math.floor(miniSeconds/60)).padStart(2,'0');
        const secs = String(miniSeconds%60).padStart(2,'0');
        miniDisplay.textContent = mins+':'+secs;
        miniDisplay.classList.remove('warning','danger');
        if (miniSeconds <= 5) miniDisplay.classList.add('danger');
        else if (miniSeconds <= 15) miniDisplay.classList.add('warning');
    }
    function miniSet(seconds) { if (miniRunning) return; miniSeconds = seconds; miniUpdateDisplay(); miniStatus.textContent = '⏸ Готов ('+seconds+'с)'; miniStatus.className = 'mini-status'; document.getElementById('miniTimer').classList.add('visible'); }
    function miniStart() {
        if (miniRunning) return;
        if (miniSeconds <= 0) { miniSet(120); return; }
        miniRunning = true;
        miniStatus.textContent = '▶ Идёт...';
        miniStatus.className = 'mini-status running';
        document.getElementById('miniTimer').classList.add('visible');
        miniInterval = setInterval(() => {
            miniSeconds--;
            miniUpdateDisplay();
            if (miniSeconds <= 0) {
                clearInterval(miniInterval); miniInterval = null; miniRunning = false;
                miniStatus.textContent = '⏰ ВРЕМЯ ВЫШЛО!';
                miniStatus.className = 'mini-status finished';
                if ('vibrate' in navigator) navigator.vibrate(200);
            }
        }, 1000);
    }
    function miniStop() { if (!miniRunning) return; clearInterval(miniInterval); miniInterval = null; miniRunning = false; miniStatus.textContent = '⏸ Остановлен'; miniStatus.className = 'mini-status stopped'; }
    function miniReset() { miniStop(); miniSet(120); }
    function toggleMiniTimer() {
        const el = document.getElementById('miniTimer');
        const btn = document.getElementById('miniToggle');
        el.classList.toggle('visible');
        btn.classList.toggle('active');
        btn.textContent = el.classList.contains('visible') ? '✕' : '⏱';
    }
    document.addEventListener('DOMContentLoaded', function() { mainSet(45); miniSet(120); document.getElementById('miniTimer').classList.remove('visible'); });
    window.addEventListener('beforeunload', function() { if (mainRunning) { localStorage.setItem('main_seconds', mainSeconds); localStorage.setItem('main_running', 'true'); } else { localStorage.removeItem('main_running'); } });
    window.addEventListener('load', function() { const savedSeconds = localStorage.getItem('main_seconds'); const savedRunning = localStorage.getItem('main_running'); if (savedSeconds) { mainSeconds = parseInt(savedSeconds); mainUpdateDisplay(); } if (savedRunning === 'true') mainStart(); });
