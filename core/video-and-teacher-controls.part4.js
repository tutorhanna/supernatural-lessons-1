
// ============================================================
// STUDENT FREEZE TOGGLE — ученик может "замереть" и смотреть сам
// ============================================================
function toggleFreeze() {
    studentFrozen = !studentFrozen;
    const btn = document.getElementById('freezeBtn');
    if (!btn) return;

    if (studentFrozen) {
        btn.textContent = '▶ Продолжить за учителем';
        btn.style.borderColor = '#c0392b';
        btn.style.color = '#e74c3c';
        btn.style.boxShadow = '0 0 20px rgba(192,57,43,0.4)';
    } else {
        btn.textContent = '⏸ Стоп — я смотрю сам';
        btn.style.borderColor = '#2980b9';
        btn.style.color = '#5dade2';
        btn.style.boxShadow = '0 0 20px rgba(41,128,185,0.3)';
        // Догоняем учителя на текущую позицию
        if (fb && roomId) {
            fb.get(fb.ref(fb.db, `rooms/${roomId}/scrollCommand`)).then(snap => {
                const cmd = snap.val();
                if (cmd && cmd.y !== undefined) {
                    scrollToAnchor(cmd, true);
                }
            }).catch(() => {});
        }
    }
}

// Кнопку показываем сразу после входа ученика в комнату
function showFreezeBtnIfStudent() {
    const btn = document.getElementById('freezeBtn');
    if (btn && !isTeacher) btn.style.display = 'block';
}
