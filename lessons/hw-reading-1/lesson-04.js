
    // ============================================================
    // WORD COUNTER
    // ============================================================
    const diaryTextarea = document.getElementById('diaryEntry');
    const wordCountEl = document.getElementById('wordCount');

    function countWords(text) {
        return text.trim().split(/\s+/).filter(w => w.length > 0).length;
    }

    function updateWordCount() {
        if (!diaryTextarea || !wordCountEl) return;
        const text = diaryTextarea.value;
        const count = text.trim() === '' ? 0 : countWords(text);
        wordCountEl.textContent = count;
        if (count >= 200 && count <= 300) {
            wordCountEl.style.color = '#2d4a2a';
        } else if (count > 300) {
            wordCountEl.style.color = '#b8860b';
        } else {
            wordCountEl.style.color = '#8a7a6a';
        }
    }

    // ============================================================
    // AUTO-SAVE
    // ============================================================
    const AUTO_SAVE_KEY = 'sn_homework_diary_entry';
    const CHECKLIST_KEY = 'sn_homework_checklist';
    let autoSaveTimeout = null;

    function saveDiary() {
        localStorage.setItem(AUTO_SAVE_KEY, diaryTextarea.value);
        showAutoSave();
    }

    function saveChecklist() {
        const checks = {};
        document.querySelectorAll('.checklist input[type="checkbox"]').forEach(cb => {
            checks[cb.id] = cb.checked;
        });
        localStorage.setItem(CHECKLIST_KEY, JSON.stringify(checks));
    }

    function showAutoSave() {
        const indicator = document.getElementById('autoSaveIndicator');
        if (!indicator) return;
        indicator.classList.add('show');
        clearTimeout(autoSaveTimeout);
        autoSaveTimeout = setTimeout(() => {
            indicator.classList.remove('show');
        }, 1500);
    }

    function restoreAll() {
        const savedDiary = localStorage.getItem(AUTO_SAVE_KEY);
        if (savedDiary && diaryTextarea) {
            diaryTextarea.value = savedDiary;
            updateWordCount();
        }
        const savedChecks = localStorage.getItem(CHECKLIST_KEY);
        if (savedChecks) {
            try {
                const checks = JSON.parse(savedChecks);
                Object.keys(checks).forEach(id => {
                    const cb = document.getElementById(id);
                    if (cb) cb.checked = checks[id];
                });
            } catch(e) {}
        }
    }

    // ============================================================
    // EVENT LISTENERS
    // ============================================================
    if (diaryTextarea) {
        diaryTextarea.addEventListener('input', function() {
            updateWordCount();
            clearTimeout(window._diarySaveTimer);
            window._diarySaveTimer = setTimeout(saveDiary, 800);
        });
    }

    document.querySelectorAll('.checklist input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', saveChecklist);
    });

    // ============================================================
    // EXPORT DIARY (only)
    // ============================================================
    function exportDiary() {
        const text = diaryTextarea.value.trim();
        if (text.length === 0) {
            alert('Your diary is empty. Please write something before exporting.');
            return;
        }

        const wordCount = countWords(text);

        let output = '';
        output += '════════════════════════════════════════════════════════════\n';
        output += '  SUPERNATURAL — HOMEWORK\n';
        output += '  Hunter\'s Journal — First Entry\n';
        output += '════════════════════════════════════════════════════════════\n\n';
        output += 'Word count: ' + wordCount + ' words\n';
        output += 'Date: ' + new Date().toLocaleString() + '\n\n';
        output += '────────────────────────────────────────────────────────────\n';
        output += '  DIARY ENTRY\n';
        output += '────────────────────────────────────────────────────────────\n\n';
        output += text + '\n\n';
        output += '────────────────────────────────────────────────────────────\n';
        output += '  CHECKLIST\n';
        output += '────────────────────────────────────────────────────────────\n';

        document.querySelectorAll('.checklist li').forEach(li => {
            const cb = li.querySelector('input[type="checkbox"]');
            const label = li.querySelector('label');
            const labelText = label ? label.textContent.trim() : '';
            const mark = cb && cb.checked ? '[✓]' : '[ ]';
            output += mark + ' ' + labelText + '\n';
        });

        output += '\n════════════════════════════════════════════════════════════\n';
        output += '  End of homework\n';
        output += '════════════════════════════════════════════════════════════\n';

        const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'Supernatural_Homework_HuntersJournal_' + new Date().toISOString().slice(0,10) + '.txt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    }

    // ============================================================
    // COPY DIARY
    // ============================================================
    function copyDiary() {
        const text = diaryTextarea.value.trim();
        if (text.length === 0) {
            alert('Your diary is empty. Please write something before copying.');
            return;
        }
        navigator.clipboard.writeText(text).then(() => {
            alert('✅ Copied! Your diary entry is now in your clipboard.');
        }).catch(() => {
            diaryTextarea.select();
            document.execCommand('copy');
            alert('✅ Copied!');
        });
    }

    // ============================================================
    // RESET DIARY
    // ============================================================
    function resetDiary() {
        if (!confirm('Are you sure you want to reset? Your diary entry and checklist will be deleted.')) return;
        diaryTextarea.value = '';
        localStorage.removeItem(AUTO_SAVE_KEY);
        localStorage.removeItem(CHECKLIST_KEY);
        document.querySelectorAll('.checklist input[type="checkbox"]').forEach(cb => cb.checked = false);
        updateWordCount();
    }

    // ============================================================
    // EXTRA TASKS — CHECKING FUNCTIONS
    // ============================================================

    function checkQ(name, correctValue) {
        const resultDiv = document.getElementById('result_' + name);
        const selected = document.querySelector('input[name="' + name + '"]:checked');
        if (!selected) {
            resultDiv.style.display = 'block';
            resultDiv.style.background = 'rgba(184,134,11,0.08)';
            resultDiv.style.borderLeft = '4px solid #b8860b';
            resultDiv.style.color = '#7a5a08';
            resultDiv.innerHTML = '⚠️ Please select an answer first.';
            return;
        }
        if (selected.value === correctValue) {
            resultDiv.style.display = 'block';
            resultDiv.style.background = 'rgba(45,74,42,0.08)';
            resultDiv.style.borderLeft = '4px solid #2d4a2a';
            resultDiv.style.color = '#1a3a1a';
            resultDiv.innerHTML = '✅ Correct!';
        } else {
            resultDiv.style.display = 'block';
            resultDiv.style.background = 'rgba(139,30,30,0.08)';
            resultDiv.style.borderLeft = '4px solid #8b1e1e';
            resultDiv.style.color = '#6b1010';
            resultDiv.innerHTML = '❌ Not quite. Try again, or click "Show Model Answer".';
        }
    }

    function toggleModel(id) {
        const el = document.getElementById(id);
        const btn = event.target;
        if (el.style.display === 'none' || el.style.display === '') {
            el.style.display = 'block';
            btn.textContent = '🙈 Hide Model Answer';
        } else {
            el.style.display = 'none';
            btn.textContent = '👁 Show Model Answer';
        }
    }

    // ===== MATCH =====
        // ===== MATCH ANSWERS FOR THE NEW HUNTING VOCABULARY =====
    const matchAnswers = {
        match_1: 'c', match_2: 'f', match_3: 'a', match_4: 'h', match_5: 'b',
        match_6: 'e', match_7: 'k', match_8: 'd', match_9: 'i', match_10: 'm',
        match_11: 'j', match_12: 'o', match_13: 'g', match_14: 'l', match_15: 'n'
    };


    function checkMatch() {
        const result = document.getElementById('result_match');
        let correct = 0, total = Object.keys(matchAnswers).length, details = [];
        for (let id in matchAnswers) {
            const el = document.getElementById(id);
            if (!el) continue;
            const val = el.value.trim().toLowerCase();
            if (val === matchAnswers[id]) {
                correct++;
                el.style.borderColor = '#2d4a2a';
                el.style.background = 'rgba(45,74,42,0.08)';
            } else {
                el.style.borderColor = '#8b1e1e';
                el.style.background = 'rgba(139,30,30,0.08)';
                details.push(id.replace('match_', 'Item ') + ': you wrote "' + el.value + '"');
            }
        }
        result.style.display = 'block';
        if (correct === total) {
            result.style.background = 'rgba(45,74,42,0.08)';
            result.style.borderLeft = '4px solid #2d4a2a';
            result.style.color = '#1a3a1a';
            result.innerHTML = '✅ Perfect! All ' + total + ' correct!';
        } else {
            result.style.background = 'rgba(184,134,11,0.08)';
            result.style.borderLeft = '4px solid #b8860b';
            result.style.color = '#7a5a08';
            result.innerHTML = '📝 ' + correct + '/' + total + ' correct.<br>' + details.join('<br>');
        }
    }

    function toggleMatchAnswers() {
        const result = document.getElementById('result_match');
        const btn = event.target;
        const showing = btn.dataset.showing === 'true';
        if (showing) {
            for (let id in matchAnswers) {
                const el = document.getElementById(id);
                if (el) {
                    el.value = '';
                    el.style.borderColor = '#d4c9b8';
                    el.style.background = '#faf7f0';
                }
            }
            result.style.display = 'none';
            btn.dataset.showing = 'false';
            btn.textContent = '👁 Show Answers';
        } else {
            for (let id in matchAnswers) {
                const el = document.getElementById(id);
                if (el) {
                    el.value = matchAnswers[id];
                    el.style.borderColor = '#b8860b';
                    el.style.background = 'rgba(184,134,11,0.08)';
                }
            }
            result.style.display = 'block';
            result.style.background = 'rgba(184,134,11,0.08)';
            result.style.borderLeft = '4px solid #b8860b';
            result.style.color = '#7a5a08';
            result.innerHTML = '👁 Answers shown above. Click "Show Answers" again to hide.';
            btn.dataset.showing = 'true';
            btn.textContent = '🙈 Hide Answers';
        }
    }

    // ===== GAPS =====
       // ===== GAPS ANSWERS FOR THE NEW CINEMATIC SENTENCES =====
    const gapsAnswers = {
        gap_1: 'wrecked', gap_2: 'footage', gap_3: 'blurred', gap_4: 'djinn',
        gap_5: 'sulfur', gap_6: 'out of your depth', gap_7: 'measured breath', gap_8: 'rock-solid',
        gap_9: 'panic attack', gap_10: 'anchor', gap_11: 'courteous', gap_12: 'frankly',
        gap_13: 'heart in your mouth', gap_14: 'compromised'
    };


    function checkGaps() {
        const result = document.getElementById('result_gaps');
        let correct = 0, total = Object.keys(gapsAnswers).length, details = [];
        for (let id in gapsAnswers) {
            const el = document.getElementById(id);
            if (!el) continue;
            const val = el.value.trim().toLowerCase();
            if (val === gapsAnswers[id]) {
                correct++;
                el.style.borderColor = '#2d4a2a';
                el.style.background = 'rgba(45,74,42,0.08)';
            } else {
                el.style.borderColor = '#8b1e1e';
                el.style.background = 'rgba(139,30,30,0.08)';
                details.push('Gap ' + id.replace('gap_', '') + ': you wrote "' + el.value + '"');
            }
        }
        result.style.display = 'block';
        if (correct === total) {
            result.style.background = 'rgba(45,74,42,0.08)';
            result.style.borderLeft = '4px solid #2d4a2a';
            result.style.color = '#1a3a1a';
            result.innerHTML = '✅ Perfect! All ' + total + ' correct!';
        } else {
            result.style.background = 'rgba(184,134,11,0.08)';
            result.style.borderLeft = '4px solid #b8860b';
            result.style.color = '#7a5a08';
            result.innerHTML = '📝 ' + correct + '/' + total + ' correct.<br>' + details.join('<br>');
        }
    }

    function toggleGapsAnswers() {
        const result = document.getElementById('result_gaps');
        const btn = event.target;
        const showing = btn.dataset.showing === 'true';
        if (showing) {
            for (let id in gapsAnswers) {
                const el = document.getElementById(id);
                if (el) {
                    el.value = '';
                    el.style.borderColor = '#d4c9b8';
                    el.style.background = '#faf7f0';
                }
            }
            result.style.display = 'none';
            btn.dataset.showing = 'false';
            btn.textContent = '👁 Show Answers';
        } else {
            for (let id in gapsAnswers) {
                const el = document.getElementById(id);
                if (el) {
                    el.value = gapsAnswers[id];
                    el.style.borderColor = '#b8860b';
                    el.style.background = 'rgba(184,134,11,0.08)';
                }
            }
            result.style.display = 'block';
            result.style.background = 'rgba(184,134,11,0.08)';
            result.style.borderLeft = '4px solid #b8860b';
            result.style.color = '#7a5a08';
            result.innerHTML = '👁 Answers shown above. Click "Show Answers" again to hide.';
            btn.dataset.showing = 'true';
            btn.textContent = '🙈 Hide Answers';
        }
    }

    // ===== GRAMMAR ANSWERS =====
    const g1Answers = {
        g1_1: 'might be', g1_2: 'might not be', g1_3: 'might come',
        g1_4: 'might find', g1_5: 'might not survive'
    };

    const g2Answers = {
        g2_1: 'do', g2_2: 'does', g2_3: 'did', g2_4: 'does', g2_5: 'do'
    };

    const g3Answers = {
        g3_1: 'were taken', g3_2: 'was hidden', g3_3: 'was drawn',
        g3_4: 'will be killed', g3_5: 'has been cleaned'
    };

    

    

    function checkG1() { checkSimple('result_g1', g1Answers); }
    function checkG2() { checkSimple('result_g2', g2Answers); }
    function checkG3() { checkSimple('result_g3', g3Answers); }
    

    function checkSimple(resultId, answers) {
        const result = document.getElementById(resultId);
        let correct = 0, total = Object.keys(answers).length, details = [];
        for (let id in answers) {
            const el = document.getElementById(id);
            if (!el) continue;
            const val = el.value.trim().toLowerCase().replace(/[.,!?;]/g, '');
            const correctVal = answers[id].toLowerCase().replace(/[.,!?;]/g, '');
            if (val === correctVal) {
                correct++;
                el.style.borderColor = '#2d4a2a';
                el.style.background = 'rgba(45,74,42,0.08)';
            } else {
                el.style.borderColor = '#8b1e1e';
                el.style.background = 'rgba(139,30,30,0.08)';
                details.push(id + ': you wrote "' + el.value + '"');
            }
        }
        result.style.display = 'block';
        if (correct === total) {
            result.style.background = 'rgba(45,74,42,0.08)';
            result.style.borderLeft = '4px solid #2d4a2a';
            result.style.color = '#1a3a1a';
            result.innerHTML = '✅ Perfect! All ' + total + ' correct!';
        } else {
            result.style.background = 'rgba(184,134,11,0.08)';
            result.style.borderLeft = '4px solid #b8860b';
            result.style.color = '#7a5a08';
            result.innerHTML = '📝 ' + correct + '/' + total + ' correct.<br>' + details.join('<br>');
        }
    }

    function toggleSimpleAnswers(resultId, answers, prefix) {
        const result = document.getElementById(resultId);
        const btn = event.target;
        const showing = btn.dataset.showing === 'true';
        if (showing) {
            for (let id in answers) {
                const el = document.getElementById(id);
                if (el) {
                    el.value = '';
                    el.style.borderColor = '#d4c9b8';
                    el.style.background = '#faf7f0';
                }
            }
            result.style.display = 'none';
            btn.dataset.showing = 'false';
            btn.textContent = '👁 Show Answers';
        } else {
            for (let id in answers) {
                const el = document.getElementById(id);
                if (el) {
                    el.value = answers[id];
                    el.style.borderColor = '#b8860b';
                    el.style.background = 'rgba(184,134,11,0.08)';
                }
            }
            result.style.display = 'block';
            result.style.background = 'rgba(184,134,11,0.08)';
            result.style.borderLeft = '4px solid #b8860b';
            result.style.color = '#7a5a08';
            result.innerHTML = '👁 Answers shown above. Click "Show Answers" again to hide.';
            btn.dataset.showing = 'true';
            btn.textContent = '🙈 Hide Answers';
        }
    }

    // ============================================================
    // EXPORT EVERYTHING — Final Step
    // ============================================================

    function collectExtraTasksOutput() {
        let output = '';

        // ===== EXTRA TASK 1 =====
        output += '────────────────────────────────────────────────────────────\n';
        output += '  EXTRA TASK 1 — READING COMPREHENSION & REACTIONS\n';
        output += '────────────────────────────────────────────────────────────\n\n';

        output += '  Part A — Comprehension\n\n';
        const partA = [
            { name: 'q1', label: 'A1 — What was the last entry in your father\'s journal?', correct: 'b' },
            { name: 'q2', label: 'A2 — What did the security cameras show?', correct: 'b' },
            { name: 'q3', label: 'A3 — What did Sam reveal about your father?', correct: 'b' },
            { name: 'q4', label: 'A4 — What is the djinn mark, and what does it mean?', correct: 'a' }
        ];
        partA.forEach(q => {
            const sel = document.querySelector('input[name="' + q.name + '"]:checked');
            const chosen = sel ? sel.value : '(not answered)';
            const mark = chosen === q.correct ? '✅' : '❌';
            output += '  ' + q.label + '\n';
            output += '    Your answer: ' + chosen + ' ' + mark + '\n';
            output += '    Correct:     ' + q.correct + '\n\n';
        });

        output += '  Part B — Reactions\n\n';
        const partB = [
            { name: 'b1', label: 'B1 — You found the hidden box. What do you do?', correct: 'b' },
            { name: 'b2', label: 'B2 — Dean asks: "Did you touch anything?"', correct: 'b' },
            { name: 'b3', label: 'B3 — Sam asks: "Are you ready to help us?"', correct: 'b' },
            { name: 'b4', label: 'B4 — Dean asks: "Your dad. What was he like?"', correct: 'b' },
            { name: 'b5', label: 'B5 — 3 AM. Dean is asleep. What do you do?', correct: 'b' }
        ];
        partB.forEach(q => {
            const sel = document.querySelector('input[name="' + q.name + '"]:checked');
            const chosen = sel ? sel.value : '(not answered)';
            const mark = chosen === q.correct ? '✅' : '❌';
            output += '  ' + q.label + '\n';
            output += '    Your answer: ' + chosen + ' ' + mark + '\n';
            output += '    Best answer: ' + q.correct + '\n\n';
        });

        // ===== EXTRA TASK 2 =====
        output += '────────────────────────────────────────────────────────────\n';
        output += '  EXTRA TASK 2 — VOCABULARY\n';
        output += '────────────────────────────────────────────────────────────\n\n';

        output += '  A — Match the Word to Its Meaning\n\n';
        for (let id in matchAnswers) {
            const el = document.getElementById(id);
            if (!el) continue;
            const num = id.replace('match_', '');
            const val = el.value.trim().toLowerCase();
            const mark = val === matchAnswers[id] ? '✅' : '❌';
            output += '    ' + num + '. "' + val + '" ' + mark + ' (correct: ' + matchAnswers[id] + ')\n';
        }
        output += '\n';

        output += '  B — Fill in the Gaps\n\n';
        for (let id in gapsAnswers) {
            const el = document.getElementById(id);
            if (!el) continue;
            const num = id.replace('gap_', '');
            const val = el.value.trim().toLowerCase();
            const mark = val === gapsAnswers[id] ? '✅' : '❌';
            output += '    ' + num + '. "' + val + '" ' + mark + ' (correct: ' + gapsAnswers[id] + ')\n';
        }
        output += '\n';

        // ===== EXTRA TASK 3 =====
        output += '────────────────────────────────────────────────────────────\n';
        output += '  EXTRA TASK 3 — GRAMMAR\n';
        output += '────────────────────────────────────────────────────────────\n\n';

        const grammarGroups = [
            { label: 'G1 — Might + infinitive', answers: g1Answers },
            { label: 'G2 — Emphatic do/does/did', answers: g2Answers },
            { label: 'G3 — Passive Voice', answers: g3Answers },
            { label: 'G4 — Adjective + infinitive', answers: g4Answers },
            { label: 'G5 — Contraction you\'d', answers: g5Answers }
        ];
        grammarGroups.forEach(group => {
            output += '  ' + group.label + '\n\n';
            for (let id in group.answers) {
                const el = document.getElementById(id);
                if (!el) continue;
                const val = el.value.trim();
                const correct = group.answers[id];
                const valNorm = val.toLowerCase().replace(/[.,!?;]/g, '');
                const correctNorm = correct.toLowerCase().replace(/[.,!?;]/g, '');
                const mark = valNorm === correctNorm ? '✅' : '❌';
                output += '    ' + id + ': "' + val + '" ' + mark + ' (correct: ' + correct + ')\n';
            }
            output += '\n';
        });

        return output;
    }

    function exportEverything() {
        const text = diaryTextarea.value.trim();
        if (text.length === 0) {
            const proceed = confirm('Your diary is empty. Do you want to export just the Extra Tasks answers?');
            if (!proceed) return;
        }

        const wordCount = text.length === 0 ? 0 : countWords(text);

        let output = '';
        output += '════════════════════════════════════════════════════════════\n';
        output += '  SUPERNATURAL — HOMEWORK — FULL SUBMISSION\n';
        output += '  Hunter\'s Journal · First Entry + Extra Tasks\n';
        output += '════════════════════════════════════════════════════════════\n\n';
        output += 'Word count (diary): ' + wordCount + ' words\n';
        output += 'Date: ' + new Date().toLocaleString() + '\n\n';

        output += '────────────────────────────────────────────────────────────\n';
        output += '  DIARY ENTRY\n';
        output += '────────────────────────────────────────────────────────────\n\n';
        if (text.length === 0) {
            output += '  (empty)\n\n';
        } else {
            output += text + '\n\n';
        }

        output += collectExtraTasksOutput();

        output += '────────────────────────────────────────────────────────────\n';
        output += '  CHECKLIST\n';
        output += '────────────────────────────────────────────────────────────\n';

        document.querySelectorAll('.checklist li').forEach(li => {
            const cb = li.querySelector('input[type="checkbox"]');
            const label = li.querySelector('label');
            const labelText = label ? label.textContent.trim() : '';
            const mark = cb && cb.checked ? '[✓]' : '[ ]';
            output += mark + ' ' + labelText + '\n';
        });

        output += '\n════════════════════════════════════════════════════════════\n';
        output += '  End of full submission\n';
        output += '════════════════════════════════════════════════════════════\n';

        const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'Supernatural_Homework_FULL_' + new Date().toISOString().slice(0,10) + '.txt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    }

    function copyEverything() {
        const text = diaryTextarea.value.trim();
        if (text.length === 0) {
            const proceed = confirm('Your diary is empty. Do you want to copy just the Extra Tasks answers?');
            if (!proceed) return;
        }

        let output = 'DIARY ENTRY:\n\n';
        output += text.length === 0 ? '(empty)\n\n' : text + '\n\n';
        output += collectExtraTasksOutput();

        navigator.clipboard.writeText(output).then(() => {
            alert('✅ Copied! All your answers are now in your clipboard.');
        }).catch(() => {
            const ta = document.createElement('textarea');
            ta.value = output;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            alert('✅ Copied!');
        });
    }

    function resetEverything() {
        if (!confirm('⚠️ This will delete EVERYTHING: your diary entry, all Extra Tasks answers, and the checklist. Are you sure?')) return;

        diaryTextarea.value = '';
        localStorage.removeItem(AUTO_SAVE_KEY);
        localStorage.removeItem(CHECKLIST_KEY);
        document.querySelectorAll('.checklist input[type="checkbox"]').forEach(cb => cb.checked = false);

        document.querySelectorAll('.options-group input[type="radio"]').forEach(r => r.checked = false);

        for (let id in matchAnswers) {
            const el = document.getElementById(id);
            if (el) { el.value = ''; el.style.borderColor = '#d4c9b8'; el.style.background = '#faf7f0'; }
        }
        for (let id in gapsAnswers) {
            const el = document.getElementById(id);
            if (el) { el.value = ''; el.style.borderColor = '#d4c9b8'; el.style.background = '#faf7f0'; }
        }
        [g1Answers, g2Answers, g3Answers].forEach(group => {
            for (let id in group) {
                const el = document.getElementById(id);
                if (el) { el.value = ''; el.style.borderColor = '#d4c9b8'; el.style.background = '#faf7f0'; }
            }
        });

        document.querySelectorAll('.result').forEach(r => {
            r.style.display = 'none';
            r.innerHTML = '';
        });

        document.querySelectorAll('[id^="model_"]').forEach(el => {
            el.style.display = 'none';
        });

        document.querySelectorAll('button[data-showing="true"]').forEach(btn => {
            btn.dataset.showing = 'false';
            const text = btn.textContent.trim();
            if (text.includes('Hide Model Answer')) btn.textContent = '👁 Show Model Answer';
            else if (text.includes('Hide Answers')) btn.textContent = '👁 Show Answers';
        });

        updateWordCount();
        alert('🩸 Everything has been reset. Ready for a new start!');
    }

    // ============================================================
    // INIT
    // ============================================================
    document.addEventListener('DOMContentLoaded', function() {
        restoreAll();
        updateWordCount();
    });
