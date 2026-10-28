
        document.addEventListener('DOMContentLoaded', function() { initDragDrop(); });

        function initDragDrop() {
            const items = document.querySelectorAll('.drag-item');
            const zones = document.querySelectorAll('.drop-zone');
            items.forEach(item => { 
                item.addEventListener('dragstart', dragStart); 
                item.addEventListener('dragend', dragEnd); 
            });
            zones.forEach(zone => {
                zone.addEventListener('dragover', dragOver);
                zone.addEventListener('dragenter', dragEnter);
                zone.addEventListener('dragleave', dragLeave);
                zone.addEventListener('drop', drop);
            });
        }

        let draggedItem = null;

        function dragStart(e) { 
            draggedItem = this; 
            this.classList.add('dragging'); 
            e.dataTransfer.effectAllowed = 'move'; 
        }
        
        function dragEnd(e) { 
            this.classList.remove('dragging'); 
            document.querySelectorAll('.drop-zone').forEach(z => z.classList.remove('drag-over')); 
        }
        
        function dragOver(e) { 
            e.preventDefault(); 
            e.dataTransfer.dropEffect = 'move'; 
        }
        
        function dragEnter(e) { 
            e.preventDefault(); 
            this.classList.add('drag-over'); 
        }
        
        function dragLeave(e) { 
            this.classList.remove('drag-over'); 
        }

        function drop(e) {
            e.preventDefault();
            this.classList.remove('drag-over');
            
            if (!draggedItem) return;
            if (draggedItem.closest('.drop-zone')) return;
            
            const targetId = draggedItem.dataset.target;
            const zoneId = this.id;
            
            // Проверяем, правильная ли зона
            const isCorrectZone = (targetId === 'dean' && zoneId === 'deanZone') || 
                                  (targetId === 'sam' && zoneId === 'samZone');
            
            if (isCorrectZone) {
                // 1. СОХРАНЯЕМ ТЕКСТ И ТАРГЕТ
                const text = draggedItem.textContent;
                const target = draggedItem.dataset.target;
                
                // 2. УДАЛЯЕМ ОРИГИНАЛ ИЗ ОБЩЕЙ КОЛОНКИ
                draggedItem.remove();
                
                // 3. СОЗДАЁМ НОВУЮ КАРТОЧКУ В ЗОНЕ
                const newItem = document.createElement('div');
                newItem.className = 'drag-item placed';
                newItem.textContent = text;
                newItem.dataset.target = target;
                
                // Добавляем цвет в зависимости от зоны
                if (target === 'dean') {
                    newItem.classList.add('placed-dean');
                } else {
                    newItem.classList.add('placed-sam');
                }
                
                // 4. ВСТАВЛЯЕМ В ЗОНУ (В КОНЕЦ, ПЕРЕД ПОДСКАЗКОЙ)
                // Находим последний элемент в зоне (это может быть подсказка)
                const zone = this;
                const hint = zone.querySelector('p:last-child');
                if (hint) {
                    zone.insertBefore(newItem, hint);
                } else {
                    zone.appendChild(newItem);
                }
                
            } else {
                // Неправильная зона — подсвечиваем красным
                draggedItem.style.borderColor = '#c0392b';
                draggedItem.style.background = 'rgba(192,57,43,0.2)';
                setTimeout(() => { 
                    if (draggedItem) {
                        draggedItem.style.borderColor = '';
                        draggedItem.style.background = '';
                    }
                }, 800);
            }
            
            draggedItem = null;
            checkDragComplete();
        }

        function checkDragComplete() {
            const placed = document.querySelectorAll('.drop-zone .drag-item').length;
            if (placed === 10) {
                document.getElementById('result_dragdrop').className = 'result show correct';
                document.getElementById('result_dragdrop').innerHTML = '🩸 All descriptions placed! Click "Проверить" to check! 🔥';
            }
        }

        function checkDragDrop() {
            const resultDiv = document.getElementById('result_dragdrop');
            const placedItems = document.querySelectorAll('.drop-zone .drag-item');
            
            let correct = 0;
            let wrong = 0;
            let details = [];
            
            // Проверяем размещённые карточки
            placedItems.forEach(el => {
                const target = el.dataset.target;
                const zone = el.closest('.drop-zone');
                const zoneId = zone ? zone.id : '';
                
                let isCorrect = false;
                if (target === 'dean' && zoneId === 'deanZone') {
                    isCorrect = true;
                } else if (target === 'sam' && zoneId === 'samZone') {
                    isCorrect = true;
                }
                
                if (isCorrect) {
                    correct++;
                    el.style.borderColor = '#27ae60';
                    el.style.background = 'rgba(39,174,96,0.2)';
                } else {
                    wrong++;
                    el.style.borderColor = '#c0392b';
                    el.style.background = 'rgba(192,57,43,0.2)';
                    details.push('⚠️ "' + el.textContent.trim() + '" — not in the right place');
                }
            });
            
            // Проверяем, все ли карточки размещены
            const total = 10;
            const placed = placedItems.length;
            
            if (placed < total) {
                resultDiv.className = 'result show wrong';
                resultDiv.innerHTML = '📝 Please place all descriptions (' + placed + '/' + total + ' placed).<br><span style="font-size:0.8em; color:#b0a890;">' + details.join('<br>') + '</span>';
                return;
            }
            
            if (wrong === 0 && placed === total) {
                resultDiv.className = 'result show correct';
                resultDiv.innerHTML = '🩸 Perfect! All descriptions placed correctly! 🔥';
                return;
            }
            
            resultDiv.className = 'result show info';
            resultDiv.innerHTML = '📝 ' + correct + ' correct, ' + wrong + ' wrong.<br><span style="font-size:0.8em; color:#b0a890;">' + details.join('<br>') + '</span>';
        }

        function showDragDropAnswers() {
            const resultDiv = document.getElementById('result_dragdrop');
            resultDiv.className = 'result show info';
            resultDiv.innerHTML = `
                📖 <strong>Правильные ответы:</strong><br><br>
                <span style="color:#e74c3c; font-weight:bold;">🩸 DEAN:</span><br>
                <span style="color:#b0a890;">• Loves burgers and pie</span><br>
                <span style="color:#b0a890;">• Listens to classic rock</span><br>
                <span style="color:#b0a890;">• Carries a gun and a knife</span><br>
                <span style="color:#b0a890;">• Drives a 1967 Chevy Impala</span><br>
                <span style="color:#b0a890;">• Uses humour to cope with stress</span><br><br>
                <span style="color:#5dade2; font-weight:bold;">📚 SAM:</span><br>
                <span style="color:#b0a890;">• Went to Stanford University</span><br>
                <span style="color:#b0a890;">• Prefers healthy food</span><br>
                <span style="color:#b0a890;">• Studies law and wants a normal life</span><br>
                <span style="color:#b0a890;">• Taller and more serious</span><br>
                <span style="color:#b0a890;">• Left hunting to go to college</span>
            `;
        }

        function hideDragDropAnswers() {
            document.getElementById('result_dragdrop').className = 'result';
            document.getElementById('result_dragdrop').innerHTML = '';
        }

        function toggleDragDropAnswers() {
            const resultId = 'result_dragdrop';
            if (answerStates[resultId]) { 
                hideDragDropAnswers(); 
                answerStates[resultId] = false; 
                document.querySelector('#ex3 .btn-show-answers').textContent = '👁 Показать ответы'; 
            } else { 
                showDragDropAnswers(); 
                answerStates[resultId] = true; 
                document.querySelector('#ex3 .btn-show-answers').textContent = '🙈 Скрыть ответы'; 
            }
        }

        function resetDragDrop() {
            // Восстанавливаем все карточки в общую колонку
            const dragItemsContainer = document.getElementById('dragItems');
            if (!dragItemsContainer) return;
            
            // Удаляем все карточки из зон
            document.querySelectorAll('.drop-zone .drag-item').forEach(el => el.remove());
            
            // Восстанавливаем все карточки в общую колонку
            const allDescriptions = [
                '🍔 Loves burgers and pie',
                '📚 Went to Stanford University',
                '🎸 Listens to classic rock',
                '🌱 Prefers healthy food',
                '🔫 Carries a gun and a knife',
                '🧠 Studies law and wants a normal life',
                '🚗 Drives a 1967 Chevy Impala',
                '💪 Taller and more serious',
                '😂 Uses humour to cope with stress',
                '💔 Left hunting to go to college'
            ];
            
            const targets = ['dean', 'sam', 'dean', 'sam', 'dean', 'sam', 'dean', 'sam', 'dean', 'sam'];
            const ids = ['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'd9', 'd10'];
            
            dragItemsContainer.innerHTML = '';
            allDescriptions.forEach((text, index) => {
                const div = document.createElement('div');
                div.className = 'drag-item';
                div.draggable = true;
                div.textContent = text;
                div.dataset.id = ids[index];
                div.dataset.target = targets[index];
                div.addEventListener('dragstart', dragStart);
                div.addEventListener('dragend', dragEnd);
                dragItemsContainer.appendChild(div);
            });
            
            document.getElementById('result_dragdrop').className = 'result';
            document.getElementById('result_dragdrop').innerHTML = '';
}
       
    