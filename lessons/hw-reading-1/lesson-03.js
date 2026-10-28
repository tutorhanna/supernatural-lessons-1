
function selectFlavourChoice(blockNumber, chosenOption) {
    const options = ['A', 'B', 'C'];
    
    // 1. Находим нужный блок результата на странице
    const selectedResult = document.getElementById(`result-${blockNumber}-${chosenOption}`);
    
    // 2. Находим контейнер с кнопками
    const container = document.getElementById(`options-container-${blockNumber}`);
    if (!container) return;
    const choiceCards = container.getElementsByClassName('branching-option');

    // 3. Проходим по кнопкам (исправлена ошибка с индексом [i])
    for (let i = 0; i < choiceCards.length; i++) {
        const card = choiceCards[i]; // <- Скобочки [i] теперь на месте!
        
        // Удаляем старые подсказки, если они были добавлены ранее
        const oldPrompt = card.querySelector('.try-prompt');
        if (oldPrompt) oldPrompt.remove();
        
        const letterBlock = card.querySelector('.option-letter');
        const currentLetter = letterBlock ? letterBlock.textContent.trim() : '';

        if (currentLetter === chosenOption) {
            // Подсвечиваем выбранную карточку
            card.style.border = '2px solid #b22222';
            card.style.opacity = '1';
            
            // Переносим и отображаем текст результата прямо внутри этой карточки
            if (selectedResult) {
                selectedResult.style.display = 'block';
                card.appendChild(selectedResult);
            }
        } else {
            // Приглушаем остальные карточки
            card.style.border = '1px solid var(--border)';
            card.style.opacity = '0.5';

            // Прячем текст результата, если он был открыт в этой карточке ранее
            const wrongResult = document.getElementById(`result-${blockNumber}-${currentLetter}`);
            if (wrongResult) {
                wrongResult.style.display = 'none';
                // Возвращаем блок на место в подвал (вне кнопок), чтобы структура не ломалась
                container.parentNode.appendChild(wrongResult);
            }

            // Добавляем красивую аккуратную плашку-рамочку на всю ширину
            const prompt = document.createElement('div');
            prompt.className = 'try-prompt';
            prompt.textContent = '⚡ Want to try this path? Click to explore!';
            prompt.style.fontSize = '0.85em';
            prompt.style.color = '#b22222';
            prompt.style.fontWeight = 'bold';
            prompt.style.marginTop = '12px';
            prompt.style.padding = '8px';
            prompt.style.border = '1px dashed #b22222';
            prompt.style.borderRadius = '4px';
            prompt.style.width = '100%';
            prompt.style.boxSizing = 'border-box';
            prompt.style.textAlign = 'center';
            
            card.appendChild(prompt);
        }
    }
}
