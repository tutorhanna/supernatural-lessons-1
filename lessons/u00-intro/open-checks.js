// Открытые задания (нет «правильного» ответа): кнопка «Проверить» проверяет только, что поле заполнено.
// Чтобы не создавать ложное впечатление «верно», показываем нейтральный (золотой) стиль вместо зелёного
// и пояснение. Грамматические проверки с настоящими ответами не затрагиваются.
(function () {
  const NOTE = '<br><span class="open-note" style="font-size:0.8em; color:#b0a890;">ℹ️ Открытое задание: проверяется только то, что поле заполнено. «Правильно/неправильно» здесь нет — разберём вместе на уроке.</span>';
  ['checkID', 'checkBrother', 'checkExitTicket'].forEach(function (fn) {
    const orig = window[fn]; if (typeof orig !== 'function') return;
    window[fn] = function () {
      const r = orig.apply(this, arguments);
      const btn = document.querySelector('button[onclick*="' + fn + '("]');
      const box = btn && (btn.closest('.exercise') || btn.parentElement.parentElement);
      if (!box) return r;
      box.querySelectorAll('input.correct, textarea.correct, select.correct').forEach(function (el) { el.classList.remove('correct'); el.classList.add('answered'); });
      box.querySelectorAll('.result.correct').forEach(function (d) {
        d.classList.remove('correct'); d.classList.add('info');
        if (!d.querySelector('.open-note')) d.insertAdjacentHTML('beforeend', NOTE);
      });
      return r;
    };
  });
})();
