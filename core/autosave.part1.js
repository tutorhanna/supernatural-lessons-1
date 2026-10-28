
    // ============================================================
    // АВТОСОХРАНЕНИЕ ОТВЕТОВ
    // ============================================================

    function saveAllAnswers() {
        const data = {};
        document.querySelectorAll('input[type="text"], input[type="number"], textarea').forEach(el => {
            if (el.id) data[el.id] = el.value;
        });
        document.querySelectorAll('select').forEach(el => {
            if (el.id) data[el.id] = el.value;
        });
        document.querySelectorAll('input[type="radio"]:checked').forEach(el => {
            if (el.name) data['radio_' + el.name] = el.value;
        });
        document.querySelectorAll('input[type="checkbox"]:not(.progress-check):not(.final-check)').forEach(el => {
            if (el.id) data['cb_' + el.id] = el.checked;
        });
        document.querySelectorAll('.progress-check').forEach(el => {
            if (el.dataset.section) data['progress_' + el.dataset.section] = el.checked;
        });
        document.querySelectorAll('.final-check').forEach(el => {
            if (el.dataset.task) data['final_' + el.dataset.task] = el.checked;
        });
        localStorage.setItem('supernatural_invitation_answers', JSON.stringify(data));
        showAutoSaveIndicator('💾 Сохранено');
    }

    let autoSaveTimeout = null;
    function showAutoSaveIndicator(text) {
        let indicator = document.getElementById('autoSaveIndicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'autoSaveIndicator';
            indicator.style.cssText = `
                position: fixed; bottom: 100px; left: 50%; transform: translateX(-50%);
                background: rgba(10,10,10,0.9); color: #7dcea0; padding: 6px 18px;
                border-radius: 20px; border: 1px solid #27ae60; font-size: 0.8em;
                font-family: 'Cinzel', serif; z-index: 9999; opacity: 0;
                transition: opacity 0.5s ease; pointer-events: none;
            `;
            document.body.appendChild(indicator);
        }
        indicator.textContent = text;
        indicator.style.opacity = '1';
        clearTimeout(autoSaveTimeout);
        autoSaveTimeout = setTimeout(() => { indicator.style.opacity = '0'; }, 2000);
    }

    function restoreAllAnswers() {
        const saved = localStorage.getItem('supernatural_invitation_answers');
        if (!saved) return;
        try {
            const data = JSON.parse(saved);
            let restoredCount = 0;
            document.querySelectorAll('input[type="text"], input[type="number"], textarea').forEach(el => {
                if (el.id && data[el.id] !== undefined) { el.value = data[el.id]; restoredCount++; }
            });
            document.querySelectorAll('select').forEach(el => {
                if (el.id && data[el.id] !== undefined) { el.value = data[el.id]; restoredCount++; }
            });
            document.querySelectorAll('input[type="radio"]').forEach(el => {
                const key = 'radio_' + el.name;
                if (data[key] !== undefined && data[key] === el.value) { el.checked = true; restoredCount++; }
            });
            document.querySelectorAll('input[type="checkbox"]:not(.progress-check):not(.final-check)').forEach(el => {
                const key = 'cb_' + el.id;
                if (data[key] !== undefined) { el.checked = data[key]; restoredCount++; }
            });
            document.querySelectorAll('.progress-check').forEach(el => {
                const key = 'progress_' + el.dataset.section;
                if (data[key] !== undefined) { el.checked = data[key]; restoredCount++; }
            });
            document.querySelectorAll('.final-check').forEach(el => {
                const key = 'final_' + el.dataset.task;
                if (data[key] !== undefined) { el.checked = data[key]; restoredCount++; }
            });
            
if (restoredCount > 0) {
    showAutoSaveIndicator('🔄 Восстановлено ' + restoredCount + ' ответов');
}


        } catch(e) { console.log('Ошибка восстановления:', e); }
    }

    function startAutoSave() {
        document.addEventListener('input', function(e) {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
                showAutoSaveIndicator('💾 Автосохранение...');
                clearTimeout(window._saveTimer);
                window._saveTimer = setTimeout(saveAllAnswers, 800);
            }
        });
        document.addEventListener('change', function(e) {
            if (e.target.tagName === 'INPUT' && (e.target.type === 'checkbox' || e.target.type === 'radio')) {
                showAutoSaveIndicator('💾 Автосохранение...');
                clearTimeout(window._saveTimer);
                window._saveTimer = setTimeout(saveAllAnswers, 800);
            }
        });
        window.addEventListener('beforeunload', saveAllAnswers);
        scrollToLastPosition();
    }

    function scrollToLastPosition() {
        const lastPosition = localStorage.getItem('supernatural_invitation_last_position');
        if (lastPosition) {
            try {
                const pos = parseInt(lastPosition);
                if (pos > 0) {
                    const btn = document.createElement('button');
                    btn.id = 'continueBtn';
                    btn.textContent = '▶ Продолжить с последнего места';
                    btn.style.cssText = `
                        position: fixed; bottom: 150px; left: 50%; transform: translateX(-50%);
                        background: linear-gradient(135deg, #3a1a0a, #1a0a05);
                        border: 2px solid #8b3a2a; border-radius: 30px;
                        color: #d4a060; padding: 12px 30px;
                        font-family: 'Cinzel', serif; font-size: 0.9em;
                        cursor: pointer; z-index: 9999; transition: all 0.3s;
                        box-shadow: 0 0 30px rgba(139,58,42,0.3);
                    `;
                    btn.onmouseover = function() {
                        this.style.borderColor = '#c0392b';
                        this.style.boxShadow = '0 0 50px rgba(139,58,42,0.5)';
                    };
                    btn.onmouseout = function() {
                        this.style.borderColor = '#8b3a2a';
                        this.style.boxShadow = '0 0 30px rgba(139,58,42,0.3)';
                    };
                    btn.onclick = function() {
                        window.scrollTo({top: pos, behavior: 'smooth'});
                        this.remove();
                        localStorage.removeItem('supernatural_invitation_last_position');
                    };
                    document.body.appendChild(btn);
                    setTimeout(() => {
                        if (document.getElementById('continueBtn')) {
                            document.getElementById('continueBtn').remove();
                        }
                    }, 10000);
                }
            } catch(e) {}
        }
        let scrollTimer = null;
        window.addEventListener('scroll', function() {
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(() => {
                localStorage.setItem('supernatural_invitation_last_position', window.scrollY);
            }, 1000);
        });
    }

    // ===== ЗАПУСКАЕМ АВТОСОХРАНЕНИЕ ПРИ ЗАГРУЗКЕ =====
    document.addEventListener('DOMContentLoaded', function() {
        restoreAllAnswers();
        startAutoSave();
    });
