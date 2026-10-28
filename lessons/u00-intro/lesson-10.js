
        function checkGrammarFull() {
            const answers = {
                'g1':'a','g2':'b','g3':'c','g4':'a','g5':'b','g6':'b','g7':'b','g8':'b','g9':'b','g10':'a',
                'g11':'a','g12':'a','g13':'c','g14':'b','g15':'a','g16':'c','g17':'a','g18':'a','g19':'a','g20':'b'
            };
            const resultDiv = document.getElementById('result_grammar_full');
            let correct = 0, total = Object.keys(answers).length, wrongList = [];
            for (let id in answers) {
                const select = document.getElementById(id);
                if (!select) continue;
                if (select.value === answers[id]) { correct++; select.className = 'correct'; document.getElementById(id+'_status').textContent = '✅'; document.getElementById(id+'_status').className = 'status correct'; }
                else { select.className = 'wrong'; document.getElementById(id+'_status').textContent = '❌'; document.getElementById(id+'_status').className = 'status wrong'; wrongList.push({id:id, answer:answers[id]}); }
            }
            if (correct === total) {
                resultDiv.className = 'result show correct';
                resultDiv.innerHTML = '🩸 Perfect! All 20 answers correct! 🔥<br><span style="font-size:0.8em; color:#b0a890;">Your grammar level is strong. You\'re ready for Unit 1A!</span>';
                return;
            }
            if (correct >= 15) {
                resultDiv.className = 'result show info';
                resultDiv.innerHTML = '📝 Good job! You got ' + correct + '/' + total + ' correct.<br><span style="font-size:0.8em; color:#b0a890;">You have a good level. Let\'s work on the areas where you made mistakes.</span>';
                return;
            }
            resultDiv.className = 'result show wrong';
            resultDiv.innerHTML = '📝 You got ' + correct + '/' + total + ' correct.<br><span style="font-size:0.8em; color:#b0a890;">Don\'t worry! This is just a warm-up. We\'ll practise these rules in Unit 1A.</span>';
        }

        function showGrammarFullAnswers() {
            const correctAnswers = {
                'g1':'am','g2':'goes','g3':'are','g4':"don't",'g5':'Do','g6':'has','g7':'went','g8':'an','g9':'taller','g10':'will go',
                'g11':'was','g12':'have','g13':'best','g14':'much','g15':'will','g16':'were','g17':'was','g18':'used to','g19':'might','g20':'was'
            };
            const resultDiv = document.getElementById('result_grammar_full');
            resultDiv.className = 'result show info';
            let msg = '📖 <strong>Правильные ответы:</strong><br><br>';
            for (let id in correctAnswers) {
                const select = document.getElementById(id);
                if (select) { select.className = 'show-answer'; select.value = {'g1':'a','g2':'b','g3':'c','g4':'a','g5':'b','g6':'b','g7':'b','g8':'b','g9':'b','g10':'a','g11':'a','g12':'a','g13':'c','g14':'b','g15':'a','g16':'c','g17':'a','g18':'a','g19':'a','g20':'b'}[id]; document.getElementById(id+'_status').textContent = '✅ ' + correctAnswers[id]; document.getElementById(id+'_status').className = 'status correct'; }
                msg += `<span style="color:#d4a060;">${id}:</span> <span style="color:#27ae60;">${correctAnswers[id]}</span><br>`;
            }
            resultDiv.innerHTML = msg;
        }

        function hideGrammarFullAnswers() {
            const resultDiv = document.getElementById('result_grammar_full');
            resultDiv.className = 'result';
            resultDiv.innerHTML = '';
            document.querySelectorAll('#ex7 select').forEach(el => { el.className = ''; el.value = ''; });
            document.querySelectorAll('#ex7 .status').forEach(el => { el.textContent = ''; el.className = 'status'; });
        }

        function toggleGrammarFullAnswers() {
            const resultId = 'result_grammar_full';
            if (answerStates[resultId]) { hideGrammarFullAnswers(); answerStates[resultId] = false; document.querySelector('#ex7 .btn-show-answers').textContent = '👁 Показать ответы'; }
            else { showGrammarFullAnswers(); answerStates[resultId] = true; document.querySelector('#ex7 .btn-show-answers').textContent = '🙈 Скрыть ответы'; }
        }



// ===== СБРОС GRAMMAR LEVEL CHECK =====
function resetGrammarFull() {
    if (!confirm('🩸 Сбросить все ответы в Grammar Level Check?')) return;
    
    document.querySelectorAll('#ex7 select').forEach(el => {
        el.value = '';
        el.className = '';
    });
    
    document.querySelectorAll('#ex7 .status').forEach(el => {
        el.textContent = '';
        el.className = 'status';
    });
    
    document.getElementById('result_grammar_full').className = 'result';
    document.getElementById('result_grammar_full').innerHTML = '';
    
    // Сбрасываем состояние
    answerStates['result_grammar_full'] = false;
}
    