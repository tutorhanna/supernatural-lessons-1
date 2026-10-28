
        function checkID() {
            const resultDiv = document.getElementById('result_id');
            const fields = [
                { id: 'id_name', name: 'Name' },
                { id: 'id_location', name: 'Location' },
                { id: 'id_weapon', name: 'Weapon' },
                { id: 'id_monster', name: 'Monster' },
                { id: 'id_goal', name: 'Goal' }
            ];
            let filled = 0, total = fields.length, details = [];
            fields.forEach(f => {
                const el = document.getElementById(f.id);
                if (!el) return;
                const val = el.value.trim();
                if (val.length > 0) { filled++; el.style.borderColor = '#27ae60'; details.push('✅ ' + f.name + ' — filled'); }
                else { el.style.borderColor = '#c0392b'; details.push('⚠️ ' + f.name + ' — please fill in'); }
            });
            if (filled === total) {
                resultDiv.className = 'result show correct';
                resultDiv.innerHTML = '🩸 Your Hunter\'s ID is complete! Welcome to the team! 🔥<br><span style="font-size:0.8em; color:#b0a890;">' + details.join('<br>') + '</span>';
            } else {
                resultDiv.className = 'result show wrong';
                resultDiv.innerHTML = '📝 Please complete all sections of your ID Card.<br><span style="font-size:0.8em; color:#b0a890;">' + details.join('<br>') + '</span>';
            }
        }

        function showIDAnswers() {
            const resultDiv = document.getElementById('result_id');
            resultDiv.className = 'result show info';
            resultDiv.innerHTML = `
                📖 <strong>Примерные ответы:</strong><br><br>
                <span style="color:#d4a060;">Name:</span> <span style="color:#b0a890;">Agent Smith</span><br>
                <span style="color:#d4a060;">Location:</span> <span style="color:#b0a890;">London, UK</span><br>
                <span style="color:#d4a060;">Weapon:</span> <span style="color:#b0a890;">I can solve puzzles quickly and I love coding.</span><br>
                <span style="color:#d4a060;">Monster:</span> <span style="color:#b0a890;">I forget vocabulary and make grammar mistakes.</span><br>
                <span style="color:#d4a060;">Goal:</span> <span style="color:#b0a890;">I want to speak English fluently for my job.</span>
            `;
        }

        function hideIDAnswers() {
            document.getElementById('result_id').className = 'result';
            document.getElementById('result_id').innerHTML = '';
        }
function toggleIDAnswers() {
    const resultId = 'result_id';
    const btn = document.querySelector('button[onclick="toggleIDAnswers()"]');
    if (answerStates[resultId]) { hideIDAnswers(); answerStates[resultId] = false; if (btn) btn.textContent = '👁 Показать примеры'; }
    else { showIDAnswers(); answerStates[resultId] = true; if (btn) btn.textContent = '🙈 Скрыть примеры'; }
}
    