// ============================================================
// «ПОКАЗАТЬ / СКРЫТЬ ОТВЕТЫ»: при повторном нажатии убирает показанные ответы (внизу и в самих полях)
// и ВОЗВРАЩАЕТ то, что ученик вписал до этого (раньше поля просто очищались и ответ ученика пропадал).
// Работает для всех функций вида toggle*Answers, не меняя их логику.
// ============================================================
(function () {
  const saved = {};   // имя функции -> [{el, value, cls, chk, shown}]
  const snap = box => [...box.querySelectorAll('input,textarea,select')].map(el => ({ el, value: el.value, cls: el.className, chk: el.checked }));

  function wrap(fn) {
    const orig = window[fn]; if (typeof orig !== 'function' || orig.__seWrapped) return;
    const w = function () {
      const btn = document.querySelector('button[onclick*="' + fn + '("]');
      const box = (btn && (btn.closest('.exercise') || btn.closest('[id^="ex"]'))) || document.body;
      const pre = snap(box), before = Object.assign({}, window.answerStates || {});
      const untouched = (saved[fn] || []).filter(c => c.el.value === c.shown);     // что ученик не менял после показа
      const r = orig.apply(this, arguments);
      const states = window.answerStates || {};
      const key = Object.keys(states).find(k => !!states[k] !== !!before[k]);
      if (key && states[key]) {                                                    // ПОКАЗАЛИ: запоминаем, что изменилось
        saved[fn] = pre.filter(s => s.el.value !== s.el.__x && (s.el.value !== s.value || s.el.className !== s.cls || s.el.checked !== s.chk))
                       .map(s => ({ el: s.el, value: s.value, cls: s.cls, chk: s.chk, shown: s.el.value }));
      } else if (key && !states[key]) {                                            // СКРЫЛИ: возвращаем вписанное учеником
        untouched.forEach(c => { c.el.value = c.value; c.el.className = c.cls; if ('checked' in c.el) c.el.checked = c.chk; });
        saved[fn] = null;
      }
      return r;
    };
    w.__seWrapped = true; window[fn] = w;
  }
  Object.getOwnPropertyNames(window).filter(n => /^toggle\w*Answers$/.test(n)).forEach(wrap);
})();
