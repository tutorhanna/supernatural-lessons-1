
        function checkSupernatural() {
            const resultDiv = document.getElementById('result_supernatural');
            let filled = 0, total = 4, details = [];
            const watched = document.querySelector('input[name="watched"]:checked');
            if (watched) { filled++; details.push('✅ Watched: ' + (watched.value === 'yes' ? 'Yes' : watched.value === 'no' ? 'No' : 'A few episodes')); }
            else { details.push('⚠️ Please select if you watched Supernatural'); }
            const season = document.getElementById('season_select');
            if (season.value) { filled++; details.push('✅ Season: ' + season.options[season.selectedIndex].text); }
            else { details.push('⚠️ Please select a season (or skip if you haven\'t watched)'); }
            const favChar = document.querySelector('input[name="fav_char"]:checked');
            const favWhy = document.getElementById('fav_why').value.trim();
            if (favChar && favWhy.length > 5) { filled++; details.push('✅ Favourite character: ' + favChar.value); }
            else if (favChar) { details.push('⚠️ Please explain why this is your favourite character (2-3 sentences)'); }
            else { details.push('⚠️ Please select a favourite character'); }
            const interest = document.getElementById('interest_why').value.trim();
            if (interest.length > 5) { filled++; details.push('✅ Interest explained'); }
            else { details.push('⚠️ Please write what interests you about Supernatural'); }
            if (filled === total) {
                resultDiv.className = 'result show correct';
                resultDiv.innerHTML = '🩸 Great! Thanks for sharing! 🔥<br><span style="font-size:0.8em; color:#b0a890;">' + details.join('<br>') + '</span>';
            } else {
                resultDiv.className = 'result show info';
                resultDiv.innerHTML = '📝 Please complete all sections.<br><span style="font-size:0.8em; color:#b0a890;">' + details.join('<br>') + '</span>';
            }
        }

        function showSupernaturalAnswers() {
            const resultDiv = document.getElementById('result_supernatural');
            resultDiv.className = 'result show info';
            resultDiv.innerHTML = `
                📖 <strong>Примерные ответы:</strong><br><br>
                <span style="color:#d4a060;">1. Have you ever watched Supernatural?</span> → <span style="color:#b0a890;">Yes, I have watched all 15 seasons!</span><br>
                <span style="color:#d4a060;">2. Which season?</span> → <span style="color:#b0a890;">I watched up to Season 5 (the best season!).</span><br>
                <span style="color:#d4a060;">3. Favourite character and why?</span> → <span style="color:#b0a890;">My favourite character is Dean because he is funny, loyal, and always protects his family. He also has a great taste in music!</span><br>
                <span style="color:#d4a060;">4. What makes you interested?</span> → <span style="color:#b0a890;">I'm interested in Supernatural because of the brother relationship, the humour, and the mix of horror and drama. It's a show about family.</span>
            `;
        }

        function hideSupernaturalAnswers() {
            document.getElementById('result_supernatural').className = 'result';
            document.getElementById('result_supernatural').innerHTML = '';
        }

        function toggleSupernaturalAnswers() {
            const resultId = 'result_supernatural';
            if (answerStates[resultId]) { hideSupernaturalAnswers(); answerStates[resultId] = false; document.querySelector('#ex2 .btn-show-answers').textContent = '👁 Показать примеры'; }
            else { showSupernaturalAnswers(); answerStates[resultId] = true; document.querySelector('#ex2 .btn-show-answers').textContent = '🙈 Скрыть примеры'; }
        }
    