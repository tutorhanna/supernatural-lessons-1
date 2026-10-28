















                // ============================================================
        // SONG FILL IN THE BLANKS
        // ============================================================

        function checkSongFill() {
            const checks = [
                { id: 'song_fill1', answers: ['confusion'] },
                { id: 'song_fill2', answers: ['illusion'] },
                { id: 'song_fill3', answers: ['high'] },
                { id: 'song_fill4', answers: ['blind'] },
                { id: 'song_fill5', answers: ['mad'] },
                { id: 'song_fill6', answers: ['voices'] },
                { id: 'song_fill7', answers: ['carry on'] },
                { id: 'song_fill8', answers: ['peace'] },
                { id: 'song_fill9', answers: ['weary'] },
                { id: 'song_fill10', answers: ['more'] },
                { id: 'song_fill11', answers: ['reason'] },
                { id: 'song_fill12', answers: ['charade'] },
                { id: 'song_fill13', answers: ['wise'] },
                { id: 'song_fill14', answers: ['know'] },
                { id: 'song_fill15', answers: ['emotion'] },
                { id: 'song_fill16', answers: ['tossed'] },
                { id: 'song_fill17', answers: ['ship'] },
                { id: 'song_fill18', answers: ['course'] }
            ];

            const resultDiv = document.getElementById('result_song_fill');
            let correct = 0;
            let total = checks.length;
            let wrongList = [];

            checks.forEach(check => {
                const el = document.getElementById(check.id);
                if (!el) return;
                const val = el.value.trim().toLowerCase();
                const isCorrect = check.answers.some(a => val === a.toLowerCase());
                if (isCorrect && val.length > 0) {
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

        function showSongFillAnswers() {
            const checks = [
                { id: 'song_fill1', answers: ['confusion'] },
                { id: 'song_fill2', answers: ['illusion'] },
                { id: 'song_fill3', answers: ['high'] },
                { id: 'song_fill4', answers: ['blind'] },
                { id: 'song_fill5', answers: ['mad'] },
                { id: 'song_fill6', answers: ['voices'] },
                { id: 'song_fill7', answers: ['carry on'] },
                { id: 'song_fill8', answers: ['peace'] },
                { id: 'song_fill9', answers: ['weary'] },
                { id: 'song_fill10', answers: ['more'] },
                { id: 'song_fill11', answers: ['reason'] },
                { id: 'song_fill12', answers: ['charade'] },
                { id: 'song_fill13', answers: ['wise'] },
                { id: 'song_fill14', answers: ['know'] },
                { id: 'song_fill15', answers: ['emotion'] },
                { id: 'song_fill16', answers: ['tossed'] },
                { id: 'song_fill17', answers: ['ship'] },
                { id: 'song_fill18', answers: ['course'] }
            ];
            const resultDiv = document.getElementById('result_song_fill');
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
        }

        function hideSongFillAnswers() {
            const resultDiv = document.getElementById('result_song_fill');
            resultDiv.className = 'result';
            resultDiv.innerHTML = '';
            const fields = document.querySelectorAll('#ex9 input[type="text"]');
            fields.forEach(el => {
                el.className = '';
                el.value = '';
            });
        }

        function toggleSongFillAnswers() {
            const resultId = 'result_song_fill';
            if (answerStates[resultId]) {
                hideSongFillAnswers();
                answerStates[resultId] = false;
                const btn = document.querySelector('#ex9 .btn-show-answers');
                if (btn) btn.textContent = '👁 Показать ответы';
            } else {
                showSongFillAnswers();
                answerStates[resultId] = true;
                const btn = document.querySelector('#ex9 .btn-show-answers');
                if (btn) btn.textContent = '🙈 Скрыть ответы';
            }
        }


        // ============================================================
        // AUDIO — произношение слов
        // ============================================================

        function playSound(word) {
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(word);
                utterance.lang = 'en-US';
                utterance.rate = 0.8;
                speechSynthesis.speak(utterance);
            } else {
                alert(`🔊 Произношение: ${word}`);
            }
        }


    