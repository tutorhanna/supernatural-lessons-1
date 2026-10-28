
    // ===== EXIT TICKET =====
    function checkExitTicket() {
        const fields = [
            { id: 'exit1', name: 'Most difficult part' },
            { id: 'exit2', name: 'New word/phrase' },
            { id: 'exit3', name: 'Dean or Sam?' },
            { id: 'exit4', name: 'Excited about next lesson' }
        ];
        const resultDiv = document.getElementById('result_exit');
        let filled = 0;
        let total = fields.length;
        let details = [];

        fields.forEach(f => {
            const el = document.getElementById(f.id);
            if (!el) return;
            const val = el.value.trim();
            if (val.length > 3) {
                filled++;
                el.style.borderColor = '#27ae60';
                details.push('✅ ' + f.name + ' — answered');
            } else {
                el.style.borderColor = '#c0392b';
                details.push('⚠️ ' + f.name + ' — please write something');
            }
        });

        if (filled === total) {
            resultDiv.className = 'result show correct';
            resultDiv.innerHTML = '🩸 Excellent reflection! You\'re ready for Unit 1A! 🔥<br><span style="font-size:0.8em; color:#b0a890;">' + details.join('<br>') + '</span>';
            // Отмечаем прогресс
            const finalCheck = document.querySelector('.final-check[data-task="reflection"]');
            if (finalCheck) finalCheck.checked = true;
        } else {
            resultDiv.className = 'result show info';
            resultDiv.innerHTML = '📝 Please answer all questions to complete your reflection.<br><span style="font-size:0.8em; color:#b0a890;">' + details.join('<br>') + '</span>';
        }
    }

    function showExitAnswers() {
        const resultDiv = document.getElementById('result_exit');
        resultDiv.className = 'result show info';
        resultDiv.innerHTML = `
            📖 <strong>Примерные ответы:</strong><br><br>
            <span style="color:#d4a060;">1. Most difficult part:</span> <span style="color:#b0a890;">I think grammar was the most difficult because I often confuse Present Simple and Present Continuous.</span><br>
            <span style="color:#d4a060;">2. New word/phrase:</span> <span style="color:#b0a890;">I learned "carry on" — it means to continue despite difficulties. I also learned "wayward" — a rebellious person.</span><br>
            <span style="color:#d4a060;">3. Dean or Sam?</span> <span style="color:#b0a890;">I think I'm more like Sam because I like reading and I'm careful and thoughtful. But I also love burgers like Dean!</span><br>
            <span style="color:#d4a060;">4. Excited about next lesson:</span> <span style="color:#b0a890;">I'm excited to watch Supernatural clips and learn food vocabulary. I also want to practise speaking more.</span>
        `;
    }

    function hideExitAnswers() {
        document.getElementById('result_exit').className = 'result';
        document.getElementById('result_exit').innerHTML = '';
    }

    function toggleExitAnswers() {
        const resultId = 'result_exit';
        if (answerStates[resultId]) {
            hideExitAnswers();
            answerStates[resultId] = false;
            const btn = document.querySelector('#ex8 .btn-show-answers');
            if (btn) btn.textContent = '👁 Показать примеры';
        } else {
            showExitAnswers();
            answerStates[resultId] = true;
            const btn = document.querySelector('#ex8 .btn-show-answers');
            if (btn) btn.textContent = '🙈 Скрыть примеры';
        }
    }

    // Добавляем рефлексию в финальный чек-лист
    document.addEventListener('DOMContentLoaded', function() {
        const finalCheckContainer = document.querySelector('#ex8 .final-check-container');
        if (finalCheckContainer) {
            const label = document.createElement('label');
            label.style.cssText = 'color:#b0a890; font-size:0.85em; cursor:pointer; display:flex; align-items:center; gap:10px;';
            label.innerHTML = `
                <input type="checkbox" class="final-check" data-task="reflection" style="accent-color:#8b3a2a; width:16px; height:16px; cursor:pointer;">
                📝 I completed my reflection (Exit Ticket)
            `;
            finalCheckContainer.appendChild(label);
        }
    });
