
    // ============================================================
    // INTERACTIVE QUIZ — ОТВЕТЫ И ПРОВЕРКА
    // ============================================================

    const quizAnswers = {
        'quiz1': 'a',
        'quiz2': 'a',
        'quiz3': 'a',
        'quiz4': 'a',
        'quiz5': 'a',
        'quiz6': 'a',
        'quiz7': 'a',
        'quiz8': 'a',
        'quiz9': 'a',
        'quiz10': 'a'
    };

    const quizExplanations = {
        'quiz1': '"Wayward" means difficult to control, going your own way — like the Winchester brothers.',
        'quiz2': '"Weary" means very tired — physically, mentally, and emotionally exhausted.',
        'quiz3': '"Carry on" means continue, keep going despite difficulties.',
        'quiz4': '"Rise above" means ignore problems and stay calm, not letting them affect you.',
        'quiz5': 'A "glimpse" is a quick look at something, not a long, careful study.',
        'quiz6': '"Though" means "although" or "despite the fact that" — it shows a contrast.',
        'quiz7': '"Masquerade as" means pretend to be someone or something you are not.',
        'quiz8': 'A "charade" is a fake show or lie that everyone can see through.',
        'quiz9': '"Tossed about" means thrown around, forced to change by outside forces.',
        'quiz10': '"Set a course for" means plan a direction for your future.'
    };

    function checkQuiz() {
        let correct = 0;
        const total = Object.keys(quizAnswers).length;
        let details = [];

        for (let name in quizAnswers) {
            const selected = document.querySelector(`input[name="${name}"]:checked`);
            const card = document.querySelector(`input[name="${name}"]`)?.closest('.quiz-card');
            const feedback = card ? card.querySelector('.quiz-feedback') : null;
            
            if (selected) {
                if (selected.value === quizAnswers[name]) {
                    correct++;
                    if (feedback) {
                        feedback.style.display = 'block';
                        feedback.style.color = '#27ae60';
                        feedback.innerHTML = '✅ Correct! ' + quizExplanations[name];
                    }
                } else {
                    if (feedback) {
                        feedback.style.display = 'block';
                        feedback.style.color = '#e74c3c';
                        feedback.innerHTML = '❌ Incorrect. ' + quizExplanations[name];
                    }
                }
            } else {
                if (feedback) {
                    feedback.style.display = 'block';
                    feedback.style.color = '#f1c40f';
                    feedback.innerHTML = '⚠️ Please select an answer.';
                }
            }
        }

        const resultDiv = document.getElementById('result_quiz');
        if (correct === total) {
            resultDiv.className = 'result show correct';
            resultDiv.innerHTML = `🩸 Perfect! All ${total} answers correct! 🔥<br><span style="font-size:0.8em; color:#b0a890;">You understand the song well!</span>`;
        } else if (correct >= 7) {
            resultDiv.className = 'result show info';
            resultDiv.innerHTML = `📝 Good job! You got ${correct}/${total} correct.<br><span style="font-size:0.8em; color:#b0a890;">Review the explanations above for the ones you missed.</span>`;
        } else {
            resultDiv.className = 'result show wrong';
            resultDiv.innerHTML = `📝 You got ${correct}/${total} correct.<br><span style="font-size:0.8em; color:#b0a890;">Don't worry! Read the explanations in the Reading section again.</span>`;
        }
    }

    function resetQuiz() {
        document.querySelectorAll('.quiz-radio').forEach(el => {
            el.checked = false;
        });
        document.querySelectorAll('.quiz-feedback').forEach(el => {
            el.style.display = 'none';
            el.innerHTML = '';
        });
        document.getElementById('result_quiz').className = 'result';
        document.getElementById('result_quiz').innerHTML = '';
    }

    document.addEventListener('DOMContentLoaded', function() {
        document.querySelectorAll('.quiz-radio').forEach(radio => {
            radio.addEventListener('change', function() {
                const name = this.name;
                const card = this.closest('.quiz-card');
                const feedback = card ? card.querySelector('.quiz-feedback') : null;
                
                if (feedback) {
                    if (this.value === quizAnswers[name]) {
                        feedback.style.display = 'block';
                        feedback.style.color = '#27ae60';
                        feedback.innerHTML = '✅ Correct! ' + quizExplanations[name];
                    } else {
                        feedback.style.display = 'block';
                        feedback.style.color = '#e74c3c';
                        feedback.innerHTML = '❌ Incorrect. ' + quizExplanations[name];
                    }
                }
            });
        });
    });
