
        function resetAllAnswers() {
            if (!confirm('🩸 Are you sure you want to reset ALL answers and progress?')) return;
            document.querySelectorAll('input[type="text"]').forEach(el => { el.value = ''; el.className = ''; });
            document.querySelectorAll('textarea').forEach(el => { el.value = ''; el.className = ''; });
            document.querySelectorAll('input[type="radio"]').forEach(el => { el.checked = false; });
            document.querySelectorAll('select').forEach(el => { el.value = ''; el.className = ''; });
            document.querySelectorAll('input[type="checkbox"]:not(.progress-check)').forEach(el => { el.checked = false; });
            document.querySelectorAll('.result').forEach(el => { el.className = 'result'; el.innerHTML = ''; el.dataset.attempt = '0'; });
            document.querySelectorAll('.progress-check').forEach(el => { el.checked = false; localStorage.removeItem('firstlesson_progress_' + el.dataset.section); });
            document.querySelectorAll('.final-check').forEach(el => { el.checked = false; localStorage.removeItem('final_check_' + el.dataset.task); });
            const counter = document.getElementById('progressCount');
            const barFill = document.getElementById('progressBarFill');
            if (counter) counter.textContent = '0 / 8';
            if (barFill) barFill.style.width = '0%';
            for (let key in answerStates) answerStates[key] = false;
            alert('🩸 All answers have been reset. Ready for a new hunt!');
        }

        function exportResults() {
            let output = '🩸 SUPERNATURAL ENGLISH - Unit 1A\n';
            output += '═'.repeat(50) + '\n\n';
            const textInputs = document.querySelectorAll('input[type="text"]');
            if (textInputs.length > 0) {
                output += '📝 TEXT ANSWERS:\n';
                output += '─'.repeat(40) + '\n';
                textInputs.forEach(el => { output += '  ' + (el.id||'unnamed') + ': ' + (el.value||'(empty)') + '\n'; });
                output += '\n';
            }
            const selects = document.querySelectorAll('select');
            if (selects.length > 0) {
                output += '📋 SELECTED ANSWERS:\n';
                output += '─'.repeat(40) + '\n';
                selects.forEach(el => { output += '  ' + (el.id||'unnamed') + ': ' + (el.options[el.selectedIndex]?.text||'(not selected)') + '\n'; });
                output += '\n';
            }
            const radios = document.querySelectorAll('input[type="radio"]:checked');
            if (radios.length > 0) {
                output += '🔘 RADIO SELECTIONS:\n';
                output += '─'.repeat(40) + '\n';
                radios.forEach(el => { output += '  ' + (el.name||'unnamed') + ': ' + (el.value||'(selected)') + '\n'; });
                output += '\n';
            }
            const checked = document.querySelectorAll('.progress-check:checked').length;
            const total = document.querySelectorAll('.progress-check').length;
            output += '📊 PROGRESS: ' + checked + '/' + total + ' (' + Math.round((checked/total)*100) + '%)\n\n';
            output += '📅 ' + new Date().toLocaleString() + '\n';
            output += '═'.repeat(50) + '\n';
            output += '🩸 Hunt well, hunters!\n';
            const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'Supernatural_Unit1A_FirstLesson_' + new Date().toISOString().slice(0,10) + '.txt';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        }
    