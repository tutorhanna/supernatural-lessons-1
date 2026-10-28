
        function checkIntro() {
            const resultDiv = document.getElementById('result_intro');
            const fields = [
                { id: 'intro_name', name: 'What\'s your name?' },
                { id: 'intro_live', name: 'Where do you live?' },
                { id: 'intro_livewith', name: 'Who do you live with?' },
                { id: 'intro_house', name: 'House or apartment?' },
                { id: 'intro_siblings', name: 'Any brothers/sisters?' },
                { id: 'intro_do', name: 'What do you do?' },
                { id: 'intro_music', name: 'What kind of music?' },
                { id: 'intro_radio', name: 'Radio or TV?' },
                { id: 'intro_weekend', name: 'What do you do on weekends?' },
                { id: 'intro_out', name: 'Go out with friends?' },
                { id: 'intro_books', name: 'What do you read?' },
                { id: 'intro_museum', name: 'Ever visited a museum?' },
                { id: 'intro_museum_do', name: 'What did you do there?' },
                { id: 'intro_why', name: 'Why learning English?' },
                { id: 'intro_favourite', name: 'Favourite food?' }
            ];
            let filled = 0, total = fields.length, details = [];
            fields.forEach(f => {
                const el = document.getElementById(f.id);
                if (!el) return;
                const val = el.value.trim();
                if (val.length > 0) { filled++; el.className = 'correct'; details.push('✅ ' + f.name + ' — answered'); }
                else { el.className = 'wrong'; details.push('⚠️ ' + f.name + ' — please write something'); }
            });
            if (filled === total) {
                resultDiv.className = 'result show correct';
                resultDiv.innerHTML = '🩸 Great! All questions answered! 🔥<br><span style="font-size:0.8em; color:#b0a890;">' + details.join('<br>') + '</span>';
            } else {
                resultDiv.className = 'result show wrong';
                resultDiv.innerHTML = '📝 Please answer all questions.<br><span style="font-size:0.8em; color:#b0a890;">' + details.join('<br>') + '</span>';
            }
        }

        function showIntroAnswers() {
            const resultDiv = document.getElementById('result_intro');
            resultDiv.className = 'result show info';
            resultDiv.innerHTML = `
                📖 <strong>Примерные ответы (примеры):</strong><br><br>
                <span style="color:#d4a060;">1. What's your name?</span> → <span style="color:#b0a890;">My name is Anna.</span><br>
                <span style="color:#d4a060;">2. Where do you live?</span> → <span style="color:#b0a890;">I live in Moscow, Russia.</span><br>
                <span style="color:#d4a060;">3. Who do you live with?</span> → <span style="color:#b0a890;">I live with my husband and our cat.</span><br>
                <span style="color:#d4a060;">4. House or apartment?</span> → <span style="color:#b0a890;">I live in an apartment.</span><br>
                <span style="color:#d4a060;">5. Any brothers or sisters?</span> → <span style="color:#b0a890;">Yes, I have one older brother.</span><br>
                <span style="color:#d4a060;">6. What do you do?</span> → <span style="color:#b0a890;">I'm a teacher.</span><br>
                <span style="color:#d4a060;">7. What kind of music do you like?</span> → <span style="color:#b0a890;">I like rock and pop music.</span><br>
                <span style="color:#d4a060;">8. Radio or TV?</span> → <span style="color:#b0a890;">I watch TV sometimes, but I listen to the radio in the car.</span><br>
                <span style="color:#d4a060;">9. What do you do on weekends?</span> → <span style="color:#b0a890;">I go to the cinema or meet my friends.</span><br>
                <span style="color:#d4a060;">10. Go out with friends?</span> → <span style="color:#b0a890;">Yes, I go out with friends on Friday evenings.</span><br>
                <span style="color:#d4a060;">11. What do you read?</span> → <span style="color:#b0a890;">I read fantasy novels and travel magazines.</span><br>
                <span style="color:#d4a060;">12. Ever visited a museum?</span> → <span style="color:#b0a890;">Yes, I have visited many museums.</span><br>
                <span style="color:#d4a060;">13. What did you do there?</span> → <span style="color:#b0a890;">I looked at art and took photos.</span><br>
                <span style="color:#d4a060;">14. Why learning English?</span> → <span style="color:#b0a890;">I'm learning English to travel and watch movies without subtitles.</span><br>
                <span style="color:#d4a060;">15. Favourite food?</span> → <span style="color:#b0a890;">My favourite food is pizza.</span>
            `;
        }

        function hideIntroAnswers() {
            document.getElementById('result_intro').className = 'result';
            document.getElementById('result_intro').innerHTML = '';
        }

        function toggleIntroAnswers() {
            const resultId = 'result_intro';
            if (answerStates[resultId]) { hideIntroAnswers(); answerStates[resultId] = false; document.querySelector('#ex1 .btn-show-answers').textContent = '👁 Показать ответы'; }
            else { showIntroAnswers(); answerStates[resultId] = true; document.querySelector('#ex1 .btn-show-answers').textContent = '🙈 Скрыть ответы'; }
        }
    