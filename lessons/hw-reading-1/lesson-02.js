
function selectChoice2(choice) {
    // Скрываем кнопки выбора для второго ветвления
    document.getElementById('options-container-2').style.display = 'none';
    
    // Показываем выбранный результат
    document.getElementById('result-2-' + choice).style.display = 'block';
}
