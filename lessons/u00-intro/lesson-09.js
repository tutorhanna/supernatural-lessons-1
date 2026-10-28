
        const trunkQuestions = {
            music: {
                q: "Dean loves classic rock. What music <strong>did you listen</strong> to when you were a child? Who is your favorite artist now?",
                hint: "🎯 Грамматический фокус: Past Simple (I listened to...) и Present Simple (Now I love...)."
            },
            badge: {
                q: "The Winchesters pretend to be FBI agents. What is your real job or study major? <strong>Do you like</strong> it?",
                hint: "🎯 Грамматический фокус: Present Simple для описания постоянных состояний и работы."
            },
            salt: {
                q: "Hunters use salt for protection. Imagine you win 1,000,000 dollars tomorrow. What <strong>will you buy</strong> to feel safe and happy?",
                hint: "🎯 Грамматический фокус: Future Simple (I will buy...) для предсказаний и планов."
            },
            map: {
                q: "The brothers travel across the USA. What interesting places or countries <strong>have you already visited</strong> in your life?",
                hint: "🎯 Грамматический фокус: Present Perfect (I have been to... / I have visited...) для описания жизненного опыта."
            },
            laptop: {
                q: "Sam spends hours doing research online. How much time <strong>do you spend</strong> on your phone or computer every day? What do you usually do?",
                hint: "🎯 Грамматический фокус: Present Simple + Исчисляемые/Неисчисляемые существительные (much/many, hours)."
            }
        };

        function openTrunk(itemKey) {
            const modal = document.getElementById('trunkModal');
            const qText = document.getElementById('modalQuestion');
            const hText = document.getElementById('modalHint');
            qText.innerHTML = trunkQuestions[itemKey].q;
            hText.innerText = trunkQuestions[itemKey].hint;
            modal.style.display = 'flex';
        }

        function closeTrunk() {
            document.getElementById('trunkModal').style.display = 'none';
        }

        window.onclick = function(event) {
            const modal = document.getElementById('trunkModal');
            if (event.target == modal) modal.style.display = 'none';
        }
    