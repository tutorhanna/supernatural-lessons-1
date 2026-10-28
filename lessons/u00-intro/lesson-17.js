
        function clearAllSongAnswers() {
    if (!confirm('🩸 Очистить все ответы в Fill in the Blanks?')) return;
    
    // Очищаем поля ввода
    document.querySelectorAll('#ex9 input[type="text"]').forEach(el => {
        el.value = '';
        el.className = '';
    });
    
    // Очищаем результат
    document.getElementById('result_song_fill').className = 'result';
    document.getElementById('result_song_fill').innerHTML = '';
    
    // Удаляем сохранённые ответы из localStorage
    localStorage.removeItem('supernatural_invitation_answers');
    
    // Также удаляем сохранённую позицию скролла (опционально)
    localStorage.removeItem('supernatural_invitation_last_position');
    
    alert('✅ Все поля очищены! Перезагрузите страницу, чтобы изменения вступили в силу.');
}
   



       // ============================================================
// GRAMMAR 1: THOUGH — EXERCISE 1A (Complete the sentences)
// ============================================================

function checkGrammar1() {
    const checks = [
        { id: 'gram1_1', answers: ["Though I was tired, I finished my work."] },
        { id: 'gram1_2', answers: ["Though it was raining, we went for a walk."] },
        { id: 'gram1_3', answers: ["Though he was scared, he continued."] },
        { id: 'gram1_4', answers: ["Though she was young, she was very wise."] },
        { id: 'gram1_5', answers: ["Though they were enemies, they worked together."] }
    ];

    const resultDiv = document.getElementById('result_gram1');
    let correct = 0;
    let total = checks.length;
    let wrongList = [];

    checks.forEach(check => {
        const el = document.getElementById(check.id);
        if (!el) return;

        let val = el.value.trim().toLowerCase();
        val = val.replace(/\s+/g, ' ').replace(/[.,!?]$/, '');

        let isCorrect = false;
        for (let answer of check.answers) {
            const answerLower = answer.toLowerCase().replace(/\s+/g, ' ').replace(/[.,!?]$/, '');
            if (val === answerLower) {
                isCorrect = true;
                break;
            }
        }

        if (isCorrect && val.length > 0) {
            correct++;
            el.className = 'correct';
        } else {
            el.className = 'wrong';
            wrongList.push({ id: check.id, answers: check.answers });
        }
    });

    if (correct === total) {
        resultDiv.className = 'result show correct';
        resultDiv.innerHTML = '🩸 Perfect! All ' + total + ' answers correct! 🔥';
        return;
    }

    const wrongCount = total - correct;
    resultDiv.className = 'result show wrong';
    resultDiv.innerHTML = '⚠️ ' + wrongCount + ' wrong out of ' + total + '. Try again!<br><span style="font-size:0.8em; color:#b0a890;">Click "👁 Показать ответы" to see the correct ones.</span>';
}

function showGrammar1Answers() {
    const checks = [
        { id: 'gram1_1', answers: ["Though I was tired, I finished my work."] },
        { id: 'gram1_2', answers: ["Though it was raining, we went for a walk."] },
        { id: 'gram1_3', answers: ["Though he was scared, he continued."] },
        { id: 'gram1_4', answers: ["Though she was young, she was very wise."] },
        { id: 'gram1_5', answers: ["Though they were enemies, they worked together."] }
    ];
    const resultDiv = document.getElementById('result_gram1');
    resultDiv.className = 'result show info';
    let msg = '📖 Правильные ответы: ';
    checks.forEach(w => {
        msg += `<br><span class="correct-answer-text">${w.id}: ${w.answers.join(' / ')}</span>`;
        const el = document.getElementById(w.id);
        if (el) {
            el.className = 'show-answer';
            el.value = w.answers[0];
        }
    });
    resultDiv.innerHTML = msg;
    resultDiv.dataset.attempt = '0';
    answerStates['result_gram1'] = true;
}

function hideGrammar1Answers() {
    const resultDiv = document.getElementById('result_gram1');
    resultDiv.className = 'result';
    resultDiv.innerHTML = '';
    const fields = document.querySelectorAll('#ex9 input[id^="gram1_"]');
    fields.forEach(el => { el.className = ''; el.value = ''; });
    answerStates['result_gram1'] = false;
}

function toggleGrammar1Answers() {
    const resultId = 'result_gram1';
    const btn = document.querySelector('#ex9 .btn-show-answers[onclick*="toggleGrammar1Answers"]');
    if (answerStates[resultId]) {
        hideGrammar1Answers();
        if (btn) btn.textContent = '👁 Показать ответы';
    } else {
        showGrammar1Answers();
        if (btn) btn.textContent = '🙈 Скрыть ответы';
    }
}

// ============================================================
// GRAMMAR 1B: THOUGH — EXERCISE 1B (Unscramble & Conjugate)
// ============================================================

function checkGrammar1B() {
    const checks = [
        { id: 'gram1b_1', answers: ["Though she was tired, she continued working."] },
        { id: 'gram1b_2', answers: ["Though it was cold outside, we went out."] },
        { id: 'gram1b_3', answers: ["Though he was scared, he entered the house."] },
        { id: 'gram1b_4', answers: ["Though I was busy, I answered the phone call."] },
        { id: 'gram1b_5', answers: ["Though they were rich, they were unhappy."] }
    ];

    const resultDiv = document.getElementById('result_gram1b');
    let correct = 0;
    let total = checks.length;
    let wrongList = [];

    checks.forEach(check => {
        const el = document.getElementById(check.id);
        if (!el) return;

        let val = el.value.trim().toLowerCase();
        val = val.replace(/\s+/g, ' ').replace(/[.,!?]$/, '');

        let isCorrect = false;
        for (let answer of check.answers) {
            const answerLower = answer.toLowerCase().replace(/\s+/g, ' ').replace(/[.,!?]$/, '');
            if (val === answerLower) {
                isCorrect = true;
                break;
            }
        }

        if (isCorrect && val.length > 0) {
            correct++;
            el.className = 'correct';
        } else {
            el.className = 'wrong';
            wrongList.push({ id: check.id, answers: check.answers });
        }
    });

    if (correct === total) {
        resultDiv.className = 'result show correct';
        resultDiv.innerHTML = '🩸 Perfect! All ' + total + ' answers correct! 🔥';
        return;
    }

    const wrongCount = total - correct;
    resultDiv.className = 'result show wrong';
    resultDiv.innerHTML = '⚠️ ' + wrongCount + ' wrong out of ' + total + '. Try again!<br><span style="font-size:0.8em; color:#b0a890;">Click "👁 Показать ответы" to see the correct ones.</span>';
}

function showGrammar1BAnswers() {
    const checks = [
        { id: 'gram1b_1', answers: ["Though she was tired, she continued working."] },
        { id: 'gram1b_2', answers: ["Though it was cold outside, we went out."] },
        { id: 'gram1b_3', answers: ["Though he was scared, he entered the house."] },
        { id: 'gram1b_4', answers: ["Though I was busy, I answered the phone call."] },
        { id: 'gram1b_5', answers: ["Though they were rich, they were unhappy."] }
    ];
    const resultDiv = document.getElementById('result_gram1b');
    resultDiv.className = 'result show info';
    let msg = '📖 Правильные ответы: ';
    checks.forEach(w => {
        msg += `<br><span class="correct-answer-text">${w.id}: ${w.answers.join(' / ')}</span>`;
        const el = document.getElementById(w.id);
        if (el) {
            el.className = 'show-answer';
            el.value = w.answers[0];
        }
    });
    resultDiv.innerHTML = msg;
    resultDiv.dataset.attempt = '0';
    answerStates['result_gram1b'] = true;
}

function hideGrammar1BAnswers() {
    const resultDiv = document.getElementById('result_gram1b');
    resultDiv.className = 'result';
    resultDiv.innerHTML = '';
    const fields = document.querySelectorAll('#ex9 input[id^="gram1b_"]');
    fields.forEach(el => { el.className = ''; el.value = ''; });
    answerStates['result_gram1b'] = false;
}

function toggleGrammar1BAnswers() {
    const resultId = 'result_gram1b';
    const btn = document.querySelector('#ex9 .btn-show-answers[onclick*="toggleGrammar1BAnswers"]');
    if (answerStates[resultId]) {
        hideGrammar1BAnswers();
        if (btn) btn.textContent = '👁 Показать ответы';
    } else {
        showGrammar1BAnswers();
        if (btn) btn.textContent = '🙈 Скрыть ответы';
    }
}




        // ============================================================
// GRAMMAR 2: SUBJECT vs OBJECT PRONOUNS (THEY vs THEM)
// ============================================================

function checkGrammar2() {
    const checks = [
        { id: 'gram2_1', answers: ['they'] },
        { id: 'gram2_2', answers: ['them'] },
        { id: 'gram2_3', answers: ['they'] },
        { id: 'gram2_4', answers: ['them'] },
        { id: 'gram2_5', answers: ['they'] }
    ];

    const resultDiv = document.getElementById('result_gram2');
    let correct = 0;
    let total = checks.length;
    let wrongList = [];

    checks.forEach(check => {
        const el = document.getElementById(check.id);
        if (!el) return;

        const val = el.value.trim().toLowerCase();

        if (val === check.answers[0]) {
            correct++;
            el.className = 'correct';
        } else {
            el.className = 'wrong';
            wrongList.push({ id: check.id, answer: check.answers[0] });
        }
    });

    if (correct === total) {
        resultDiv.className = 'result show correct';
        resultDiv.innerHTML = '🩸 Perfect! All ' + total + ' answers correct! 🔥';
        return;
    }

    const wrongCount = total - correct;
    resultDiv.className = 'result show wrong';
    resultDiv.innerHTML = '⚠️ ' + wrongCount + ' wrong out of ' + total + '. Try again!<br><span style="font-size:0.8em; color:#b0a890;">Click "👁 Показать ответы" to see the correct ones.</span>';
}

function showGrammar2Answers() {
    const checks = [
        { id: 'gram2_1', answers: ['they'] },
        { id: 'gram2_2', answers: ['them'] },
        { id: 'gram2_3', answers: ['they'] },
        { id: 'gram2_4', answers: ['them'] },
        { id: 'gram2_5', answers: ['they'] }
    ];
    const resultDiv = document.getElementById('result_gram2');
    resultDiv.className = 'result show info';
    let msg = '📖 Правильные ответы: ';
    checks.forEach(w => {
        msg += `<br><span class="correct-answer-text">${w.id}: ${w.answers[0]}</span>`;
        const el = document.getElementById(w.id);
        if (el) {
            el.className = 'show-answer';
            el.value = w.answers[0];
        }
    });
    resultDiv.innerHTML = msg;
    resultDiv.dataset.attempt = '0';
    answerStates['result_gram2'] = true;
}

function hideGrammar2Answers() {
    const resultDiv = document.getElementById('result_gram2');
    resultDiv.className = 'result';
    resultDiv.innerHTML = '';
    const fields = document.querySelectorAll('#ex9 select[id^="gram2_"]');
    fields.forEach(el => { el.className = ''; el.value = ''; });
    answerStates['result_gram2'] = false;
}

function toggleGrammar2Answers() {
    const resultId = 'result_gram2';
    const btn = document.querySelector('#ex9 .btn-show-answers[onclick*="toggleGrammar2Answers"]');
    if (answerStates[resultId]) {
        hideGrammar2Answers();
        if (btn) btn.textContent = '👁 Показать ответы';
    } else {
        showGrammar2Answers();
        if (btn) btn.textContent = '🙈 Скрыть ответы';
    }
}

// ============================================================
// GRAMMAR 2B: COMPLETE THE SENTENCES (they / them)
// ============================================================

function checkGrammar2B() {
    const checks = [
        { id: 'gram2b_1', answers: ['them'] },
        { id: 'gram2b_2', answers: ['them'] },
        { id: 'gram2b_3a', answers: ['they'] },
        { id: 'gram2b_3b', answers: ['them'] },
        { id: 'gram2b_4', answers: ['they'] },
        { id: 'gram2b_5', answers: ['them'] }
    ];

    const resultDiv = document.getElementById('result_gram2b');
    let correct = 0;
    let total = checks.length;
    let wrongList = [];

    checks.forEach(check => {
        const el = document.getElementById(check.id);
        if (!el) return;

        const val = el.value.trim().toLowerCase();

        if (val === check.answers[0]) {
            correct++;
            el.className = 'correct';
        } else {
            el.className = 'wrong';
            wrongList.push({ id: check.id, answer: check.answers[0] });
        }
    });

    if (correct === total) {
        resultDiv.className = 'result show correct';
        resultDiv.innerHTML = '🩸 Perfect! All ' + total + ' answers correct! 🔥';
        return;
    }

    const wrongCount = total - correct;
    resultDiv.className = 'result show wrong';
    resultDiv.innerHTML = '⚠️ ' + wrongCount + ' wrong out of ' + total + '. Try again!<br><span style="font-size:0.8em; color:#b0a890;">Click "👁 Показать ответы" to see the correct ones.</span>';
}

function showGrammar2BAnswers() {
    const checks = [
        { id: 'gram2b_1', answers: ['them'] },
        { id: 'gram2b_2', answers: ['them'] },
        { id: 'gram2b_3a', answers: ['they'] },
        { id: 'gram2b_3b', answers: ['them'] },
        { id: 'gram2b_4', answers: ['they'] },
        { id: 'gram2b_5', answers: ['them'] }
    ];
    const resultDiv = document.getElementById('result_gram2b');
    resultDiv.className = 'result show info';
    let msg = '📖 Правильные ответы: ';
    checks.forEach(w => {
        msg += `<br><span class="correct-answer-text">${w.id}: ${w.answers[0]}</span>`;
        const el = document.getElementById(w.id);
        if (el) {
            el.className = 'show-answer';
            el.value = w.answers[0];
        }
    });
    resultDiv.innerHTML = msg;
    resultDiv.dataset.attempt = '0';
    answerStates['result_gram2b'] = true;
}

function hideGrammar2BAnswers() {
    const resultDiv = document.getElementById('result_gram2b');
    resultDiv.className = 'result';
    resultDiv.innerHTML = '';
    const fields = document.querySelectorAll('#ex9 input[id^="gram2b_"]');
    fields.forEach(el => { el.className = ''; el.value = ''; });
    answerStates['result_gram2b'] = false;
}

function toggleGrammar2BAnswers() {
    const resultId = 'result_gram2b';
    const btn = document.querySelector('#ex9 .btn-show-answers[onclick*="toggleGrammar2BAnswers"]');
    if (answerStates[resultId]) {
        hideGrammar2BAnswers();
        if (btn) btn.textContent = '👁 Показать ответы';
    } else {
        showGrammar2BAnswers();
        if (btn) btn.textContent = '🙈 Скрыть ответы';
    }
}


// ============================================================
// GRAMMAR 3: FUTURE SIMPLE + TIME CLAUSES (UPGRADED FOR B1)
// ============================================================

function checkGrammar3() {
    const checks = [
        { id: 'gram3_1', answers: ['arrives'] },
        { id: 'gram3_2', answers: ['will be'] },
        { id: 'gram3_3', answers: ['finishes'] },
        { id: 'gram3_4', answers: ['leave'] },
        { id: 'gram3_5', answers: ['will be'] }
    ];

    const resultDiv = document.getElementById('result_gram3');
    let correct = 0;
    let total = checks.length;
    let wrongList = [];

    checks.forEach(check => {
        const el = document.getElementById(check.id);
        if (!el) return;

        const val = el.value.trim().toLowerCase();

        if (val === check.answers[0]) {
            correct++;
            el.className = 'correct';
        } else {
            el.className = 'wrong';
            wrongList.push({ id: check.id, answer: check.answers[0] });
        }
    });

    if (correct === total) {
        resultDiv.className = 'result show correct';
        resultDiv.innerHTML = '🩸 Perfect! All ' + total + ' answers correct! 🔥';
        return;
    }

    const wrongCount = total - correct;
    resultDiv.className = 'result show wrong';
    resultDiv.innerHTML = '⚠️ ' + wrongCount + ' wrong out of ' + total + '. Try again!<br><span style="font-size:0.8em; color:#b0a890;">Click "👁 Показать ответы" to see the correct ones.</span>';
}




function showGrammar3Answers() {
    const checks = [
        { id: 'gram3_1', answers: ['arrives'] },
        { id: 'gram3_2', answers: ['will be'] },
        { id: 'gram3_3', answers: ['finishes'] },
        { id: 'gram3_4', answers: ['leave'] },
        { id: 'gram3_5', answers: ['will be'] }
    ];
    const resultDiv = document.getElementById('result_gram3');
    resultDiv.className = 'result show info';
    let msg = '📖 Правильные ответы: ';
    checks.forEach(w => {
        msg += `<br><span class="correct-answer-text">${w.id}: ${w.answers[0]}</span>`;
        const el = document.getElementById(w.id);
        if (el) {
            el.className = 'show-answer';
            el.value = w.answers[0];
        }
    });
    resultDiv.innerHTML = msg;
    resultDiv.dataset.attempt = '0';
    answerStates['result_gram3'] = true;
}

function hideGrammar3Answers() {
    const resultDiv = document.getElementById('result_gram3');
    resultDiv.className = 'result';
    resultDiv.innerHTML = '';
    const fields = document.querySelectorAll('#ex9 select[id^="gram3_"]');
    fields.forEach(el => { el.className = ''; el.value = ''; });
    answerStates['result_gram3'] = false;
}

function toggleGrammar3Answers() {
    const resultId = 'result_gram3';
    const btn = document.querySelector('#ex9 .btn-show-answers[onclick*="toggleGrammar3Answers"]');
    if (answerStates[resultId]) {
        hideGrammar3Answers();
        if (btn) btn.textContent = '👁 Показать ответы';
    } else {
        showGrammar3Answers();
        if (btn) btn.textContent = '🙈 Скрыть ответы';
    }
}







// ============================================================
// GRAMMAR 3B: COMPLETE THE SENTENCES (will / Present Simple)
// ============================================================

function checkGrammar3B() {
    const checks = [
        { id: 'gram3b_1', answers: ['gets'] },
        { id: 'gram3b_2', answers: ['will be'] },
        { id: 'gram3b_3a', answers: ['will stay', 'stays'] },
        { id: 'gram3b_3b', answers: ['comes'] },
        { id: 'gram3b_4a', answers: ['will start', 'start'] },
        { id: 'gram3b_4b', answers: ['buy'] },
        { id: 'gram3b_5a', answers: ['will go', 'goes'] },
        { id: 'gram3b_5b', answers: ['ends'] }
    ];

    const resultDiv = document.getElementById('result_gram3b');
    let correct = 0;
    let total = checks.length;
    let wrongList = [];

    checks.forEach(check => {
        const el = document.getElementById(check.id);
        if (!el) return;

        const val = el.value.trim().toLowerCase();

        let isCorrect = false;
        for (let answer of check.answers) {
            if (val === answer.toLowerCase()) {
                isCorrect = true;
                break;
            }
        }

        if (isCorrect && val.length > 0) {
            correct++;
            el.className = 'correct';
        } else {
            el.className = 'wrong';
            wrongList.push({ id: check.id, answers: check.answers });
        }
    });

    if (correct === total) {
        resultDiv.className = 'result show correct';
        resultDiv.innerHTML = '🩸 Perfect! All ' + total + ' answers correct! 🔥';
        return;
    }

    const wrongCount = total - correct;
    resultDiv.className = 'result show wrong';
    resultDiv.innerHTML = '⚠️ ' + wrongCount + ' wrong out of ' + total + '. Try again!<br><span style="font-size:0.8em; color:#b0a890;">Click "👁 Показать ответы" to see the correct ones.</span>';
}

function showGrammar3BAnswers() {
    const checks = [
        { id: 'gram3b_1', answers: ['gets'] },
        { id: 'gram3b_2', answers: ['will be'] },
        { id: 'gram3b_3a', answers: ['will stay'] },
        { id: 'gram3b_3b', answers: ['comes'] },
        { id: 'gram3b_4a', answers: ['will start'] },
        { id: 'gram3b_4b', answers: ['buy'] },
        { id: 'gram3b_5a', answers: ['will go'] },
        { id: 'gram3b_5b', answers: ['ends'] }
    ];
    const resultDiv = document.getElementById('result_gram3b');
    resultDiv.className = 'result show info';
    let msg = '📖 Правильные ответы: ';
    checks.forEach(w => {
        msg += `<br><span class="correct-answer-text">${w.id}: ${w.answers[0]}</span>`;
        const el = document.getElementById(w.id);
        if (el) {
            el.className = 'show-answer';
            el.value = w.answers[0];
        }
    });
    resultDiv.innerHTML = msg;
    resultDiv.dataset.attempt = '0';
    answerStates['result_gram3b'] = true;
}

function hideGrammar3BAnswers() {
    const resultDiv = document.getElementById('result_gram3b');
    resultDiv.className = 'result';
    resultDiv.innerHTML = '';
    const fields = document.querySelectorAll('#ex9 input[id^="gram3b_"]');
    fields.forEach(el => { el.className = ''; el.value = ''; });
    answerStates['result_gram3b'] = false;
}

function toggleGrammar3BAnswers() {
    const resultId = 'result_gram3b';
    const btn = document.getElementById('btn3B');
    if (answerStates[resultId]) {
        hideGrammar3BAnswers();
        if (btn) btn.textContent = '👁 Показать ответы';
    } else {
        showGrammar3BAnswers();
        if (btn) btn.textContent = '🙈 Скрыть ответы';
    }
}






// ============================================================
// GRAMMAR 3C: PASSIVE STRUCTURES IN TIME CLAUSES
// ============================================================

function checkGrammar3C() {
    const checks = [
        { id: 'gram3c_1', answers: ['is done'] },
        { id: 'gram3c_2', answers: ['are done'] },
        { id: 'gram3c_3', answers: ['are checked'] },
        { id: 'gram3c_4', answers: ['is shut down'] },
        { id: 'gram3c_5', answers: ['is approved'] }
    ];

    const resultDiv = document.getElementById('result_gram3c');
    let correct = 0;
    let total = checks.length;
    let wrongList = [];

    checks.forEach(check => {
        const el = document.getElementById(check.id);
        if (!el) return;

        const val = el.value.trim().toLowerCase().replace(/\s+/g, ' ');

        if (val === check.answers[0]) {
            correct++;
            el.className = 'correct';
        } else {
            el.className = 'wrong';
            wrongList.push({ id: check.id, answer: check.answers[0] });
        }
    });

    if (correct === total) {
        resultDiv.className = 'result show correct';
        resultDiv.innerHTML = '🩸 Perfect! All ' + total + ' answers correct! 🔥';
        return;
    }

    const wrongCount = total - correct;
    resultDiv.className = 'result show wrong';
    resultDiv.innerHTML = '⚠️ ' + wrongCount + ' wrong out of ' + total + '. Try again!<br><span style="font-size:0.8em; color:#b0a890;">Click "👁 Показать ответы" to see the correct ones.</span>';
}

function showGrammar3CAnswers() {
    const checks = [
        { id: 'gram3c_1', answers: ['is done'] },
        { id: 'gram3c_2', answers: ['are done'] },
        { id: 'gram3c_3', answers: ['are checked'] },
        { id: 'gram3c_4', answers: ['is shut down'] },
        { id: 'gram3c_5', answers: ['is approved'] }
    ];
    const resultDiv = document.getElementById('result_gram3c');
    resultDiv.className = 'result show info';
    let msg = '📖 Правильные ответы: ';
    checks.forEach(w => {
        msg += `<br><span class="correct-answer-text">${w.id}: ${w.answers[0]}</span>`;
        const el = document.getElementById(w.id);
        if (el) {
            el.className = 'show-answer';
            el.value = w.answers[0];
        }
    });
    resultDiv.innerHTML = msg;
    resultDiv.dataset.attempt = '0';
    answerStates['result_gram3c'] = true;
}

function hideGrammar3CAnswers() {
    const resultDiv = document.getElementById('result_gram3c');
    resultDiv.className = 'result';
    resultDiv.innerHTML = '';
    const fields = document.querySelectorAll('#ex9 input[id^="gram3c_"]');
    fields.forEach(el => { el.className = ''; el.value = ''; });
    answerStates['result_gram3c'] = false;
}

function toggleGrammar3CAnswers() {
    const resultId = 'result_gram3c';
    const btn = document.getElementById('btn3C');
    if (answerStates[resultId]) {
        hideGrammar3CAnswers();
        if (btn) btn.textContent = '👁 Показать ответы';
    } else {
        showGrammar3CAnswers();
        if (btn) btn.textContent = '🙈 Скрыть ответы';
    }
}


// ============================================================
// GRAMMAR 4: PAST PROCESS vs INTERRUPTION (Exercise 4A)
// ============================================================

function checkGrammar4() {
    const checks = [
        { id: 'gram4_1', answers: ['was driving'] },
        { id: 'gram4_2', answers: ['made'] },
        { id: 'gram4_3', answers: ['was climbing'] },
        { id: 'gram4_4', answers: ['was growing'] },
        { id: 'gram4_5', answers: ['was enjoying'] }
    ];

    const resultDiv = document.getElementById('result_gram4');
    let correct = 0;
    let total = checks.length;

    checks.forEach(check => {
        const el = document.getElementById(check.id);
        if (!el) return;

        const val = el.value.trim().toLowerCase();

        if (val === check.answers[0]) {
            correct++;
            el.className = 'correct';
        } else {
            el.className = 'wrong';
        }
    });

    if (correct === total) {
        resultDiv.className = 'result show correct';
        resultDiv.innerHTML = '🩸 Perfect! All ' + total + ' answers correct! 🔥';
        return;
    }

    const wrongCount = total - correct;
    resultDiv.className = 'result show wrong';
    resultDiv.innerHTML = '⚠️ ' + wrongCount + ' wrong out of ' + total + '. Try again!';
}

function showGrammar4Answers() {
    const checks = [
        { id: 'gram4_1', answers: ['was driving'] },
        { id: 'gram4_2', answers: ['made'] },
        { id: 'gram4_3', answers: ['was climbing'] },
        { id: 'gram4_4', answers: ['was growing'] },
        { id: 'gram4_5', answers: ['was enjoying'] }
    ];
    const resultDiv = document.getElementById('result_gram4');
    resultDiv.className = 'result show info';
    let msg = '📖 Correct answers: ';
    checks.forEach(w => {
        msg += `<br><span class="correct-answer-text">${w.id}: ${w.answers[0]}</span>`;
        const el = document.getElementById(w.id);
        if (el) {
            el.className = 'show-answer';
            el.value = w.answers[0];
        }
    });
    resultDiv.innerHTML = msg;
    answerStates['result_gram4'] = true;
}

function hideGrammar4Answers() {
    const resultDiv = document.getElementById('result_gram4');
    resultDiv.className = 'result';
    resultDiv.innerHTML = '';
    const fields = document.querySelectorAll('#ex9 select[id^="gram4_"]');
    fields.forEach(el => { el.className = ''; el.value = ''; });
    answerStates['result_gram4'] = false;
}

function toggleGrammar4Answers() {
    const resultId = 'result_gram4';
    const btn = document.getElementById('btn4');
    if (answerStates[resultId]) {
        hideGrammar4Answers();
        if (btn) btn.textContent = '👁 Show Answers';
    } else {
        showGrammar4Answers();
        if (btn) btn.textContent = '🙈 Hide Answers';
    }
}

// ============================================================
// GRAMMAR 4B: ADVANCED SENTENCE COMPLETION (Exercise 4B)
// ============================================================

function checkGrammar4B() {
    const checks = [
        { id: 'gram4b_1a', answers: ['was soaring'] },
        { id: 'gram4b_1b', answers: ['flew'] },
        { id: 'gram4b_2a', answers: ['was spending'] },
        { id: 'gram4b_2b', answers: ['ran'] },
        { id: 'gram4b_3a', answers: ['was getting'] },
        { id: 'gram4b_3b', answers: ['forgot'] },
        { id: 'gram4b_4a', answers: ['was becoming'] },
        { id: 'gram4b_4b', answers: ['brought'] },
        { id: 'gram4b_5a', answers: ['was running'] },
        { id: 'gram4b_5b', answers: ['closed'] }
    ];

    const resultDiv = document.getElementById('result_gram4b');
    let correct = 0;
    let total = checks.length;

    checks.forEach(check => {
        const el = document.getElementById(check.id);
        if (!el) return;

        const val = el.value.trim().toLowerCase();

        if (val === check.answers[0]) {
            correct++;
            el.className = 'correct';
        } else {
            el.className = 'wrong';
        }
    });

    if (correct === total) {
        resultDiv.className = 'result show correct';
        resultDiv.innerHTML = '🩸 Perfect! All ' + total + ' answers correct! 🔥';
        return;
    }

    const wrongCount = total - correct;
    resultDiv.className = 'result show wrong';
    resultDiv.innerHTML = '⚠️ ' + wrongCount + ' wrong out of ' + total + '. Try again!';
}

function showGrammar4BAnswers() {
    const checks = [
        { id: 'gram4b_1a', answers: ['was soaring'] },
        { id: 'gram4b_1b', answers: ['flew'] },
        { id: 'gram4b_2a', answers: ['was spending'] },
        { id: 'gram4b_2b', answers: ['ran'] },
        { id: 'gram4b_3a', answers: ['was getting'] },
        { id: 'gram4b_3b', answers: ['forgot'] },
        { id: 'gram4b_4a', answers: ['was becoming'] },
        { id: 'gram4b_4b', answers: ['brought'] },
        { id: 'gram4b_5a', answers: ['was running'] },
        { id: 'gram4b_5b', answers: ['closed'] }
    ];
    const resultDiv = document.getElementById('result_gram4b');
    resultDiv.className = 'result show info';
    let msg = '📖 Correct answers: ';
    checks.forEach(w => {
        msg += `<br><span class="correct-answer-text">${w.id}: ${w.answers[0]}</span>`;
        const el = document.getElementById(w.id);
        if (el) {
            el.className = 'show-answer';
            el.value = w.answers[0];
        }
    });
    resultDiv.innerHTML = msg;
    answerStates['result_gram4b'] = true;
}

function hideGrammar4BAnswers() {
    const resultDiv = document.getElementById('result_gram4b');
    resultDiv.className = 'result';
    resultDiv.innerHTML = '';
    const fields = document.querySelectorAll('#ex9 input[id^="gram4b_"]');
    fields.forEach(el => { el.className = ''; el.value = ''; });
    answerStates['result_gram4b'] = false;
}

function toggleGrammar4BAnswers() {
    const resultId = 'result_gram4b';
    const btn = document.getElementById('btn4B');
    if (answerStates[resultId]) {
        hideGrammar4BAnswers();
        if (btn) btn.textContent = '👁 Show Answers';
    } else {
        showGrammar4BAnswers();
        if (btn) btn.textContent = '🙈 Hide Answers';
    }
}





// ============================================================
// VOCABULARY EXERCISE (UPGRADED CONTEXT)
// ============================================================

function checkVocabulary() {
    const checks = [
        { id: 'vocab1', answers: ['carry on'] },
        { id: 'vocab2', answers: ['wayward'] },
        { id: 'vocab3', answers: ['weary'] },
        { id: 'vocab4', answers: ['masquerading'] },
        { id: 'vocab5', answers: ['tossed about'] }
    ];

    const resultDiv = document.getElementById('result_vocab');
    let correct = 0;
    let total = checks.length;

    checks.forEach(check => {
        const el = document.getElementById(check.id);
        if (!el) return;

        // Нормализуем текст (удаляем двойные пробелы, приводим к нижнему регистру)
        const val = el.value.trim().toLowerCase().replace(/\s+/g, ' ');

        if (val === check.answers[0]) {
            correct++;
            el.className = 'correct';
        } else {
            el.className = 'wrong';
        }
    });

    if (correct === total) {
        resultDiv.className = 'result show correct';
        resultDiv.innerHTML = '🩸 Perfect! All ' + total + ' vocabulary terms placed correctly! 🔥';
        return;
    }

    const wrongCount = total - correct;
    resultDiv.className = 'result show wrong';
    resultDiv.innerHTML = '⚠️ ' + wrongCount + ' incorrect terms out of ' + total + '. Analyze context clues and try again!';
}

function showVocabularyAnswers() {
    const checks = [
        { id: 'vocab1', answers: ['carry on'] },
        { id: 'vocab2', answers: ['wayward'] },
        { id: 'vocab3', answers: ['weary'] },
        { id: 'vocab4', answers: ['masquerading'] },
        { id: 'vocab5', answers: ['tossed about'] }
    ];
    const resultDiv = document.getElementById('result_vocab');
    resultDiv.className = 'result show info';
    let msg = '📖 Correct answers: ';
    checks.forEach(w => {
        msg += `<br><span class="correct-answer-text">${w.id}: ${w.answers[0]}</span>`;
        const el = document.getElementById(w.id);
        if (el) {
            el.className = 'show-answer';
            el.value = w.answers[0];
        }
    });
    resultDiv.innerHTML = msg;
    answerStates['result_vocab'] = true;
}

function hideVocabularyAnswers() {
    const resultDiv = document.getElementById('result_vocab');
    resultDiv.className = 'result';
    resultDiv.innerHTML = '';
    const fields = document.querySelectorAll('#ex9 input[id^="vocab"]');
    fields.forEach(el => { el.className = ''; el.value = ''; });
    answerStates['result_vocab'] = false;
}

function toggleVocabularyAnswers() {
    const resultId = 'result_vocab';
    const btn = document.getElementById('btnVocab');
    if (answerStates[resultId]) {
        hideVocabularyAnswers();
        if (btn) btn.textContent = '👁 Показать ответы';
    } else {
        showVocabularyAnswers();
        if (btn) btn.textContent = '🙈 Скрыть ответы';
    }
}


// ============================================================
// СВОРАЧИВАНИЕ БОКОВОЙ НАВИГАЦИИ
// ============================================================

let sideNavCollapsed = false;

function toggleSideNav() {
    const nav = document.getElementById('sideNav');
    const toggleBtn = nav.querySelector('.nav-toggle');
    
    sideNavCollapsed = !sideNavCollapsed;
    
    if (sideNavCollapsed) {
        nav.classList.add('collapsed');
        toggleBtn.textContent = '▶';
        toggleBtn.title = 'Развернуть навигацию';
        // Сохраняем состояние
        localStorage.setItem('sideNavCollapsed', 'true');
    } else {
        nav.classList.remove('collapsed');
        toggleBtn.textContent = '◀';
        toggleBtn.title = 'Свернуть навигацию';
        localStorage.setItem('sideNavCollapsed', 'false');
    }
}

// Восстанавливаем состояние при загрузке
document.addEventListener('DOMContentLoaded', function() {
    const nav = document.getElementById('sideNav');
    const toggleBtn = nav.querySelector('.nav-toggle');
    const saved = localStorage.getItem('sideNavCollapsed');
    
    if (saved === 'true') {
        nav.classList.add('collapsed');
        toggleBtn.textContent = '▶';
        toggleBtn.title = 'Развернуть навигацию';
        sideNavCollapsed = true;
    } else {
        nav.classList.remove('collapsed');
        toggleBtn.textContent = '◀';
        toggleBtn.title = 'Свернуть навигацию';
        sideNavCollapsed = false;
    }
});







 