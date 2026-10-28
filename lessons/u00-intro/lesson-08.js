
        function checkBrother() {
            const resultDiv = document.getElementById('result_brother');
            const text = document.getElementById('brother_why').value.trim();
            if (text.length > 5) {
                resultDiv.className = 'result show correct';
                resultDiv.innerHTML = '🩸 Great! You\'ve chosen your Winchester side! 🔥<br><span style="font-size:0.8em; color:#b0a890;">Your answer: ' + text + '</span>';
            } else {
                resultDiv.className = 'result show wrong';
                resultDiv.innerHTML = '📝 Please write at least a few sentences explaining which brother you\'re more like.';
            }
        }

        function showBrotherAnswers() {
            const resultDiv = document.getElementById('result_brother');
            resultDiv.className = 'result show info';
            resultDiv.innerHTML = `
                📖 <strong>Примерные ответы:</strong><br><br>
                <span style="color:#b0a890;">"I think I'm more like Dean because I love classic rock, I'm impulsive, and I always protect my friends and family. I also love burgers and pie!"</span><br><br>
                <span style="color:#b0a890;">"I think I'm more like Sam because I'm thoughtful and I like to read and do research. I prefer healthy food and I think carefully before making decisions."</span>
            `;
        }

        function hideBrotherAnswers() {
            document.getElementById('result_brother').className = 'result';
            document.getElementById('result_brother').innerHTML = '';
        }

        function toggleBrotherAnswers() {
            const resultId = 'result_brother';
            if (answerStates[resultId]) { hideBrotherAnswers(); answerStates[resultId] = false; document.querySelector('#ex4 .btn-show-answers').textContent = '👁 Показать примеры'; }
            else { showBrotherAnswers(); answerStates[resultId] = true; document.querySelector('#ex4 .btn-show-answers').textContent = '🙈 Скрыть примеры'; }
        }



    