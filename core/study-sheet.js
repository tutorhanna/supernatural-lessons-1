// ============================================================
// ПОЛНЫЙ КОНСПЕКТ: файл (HTML → можно открыть, распечатать или сохранить в PDF), где для каждого задания есть
// вопрос, ответ ученика, правильный ответ (где он есть в уроке) и пояснения/примеры из «Показать ответы».
// Правильные ответы берутся тем же способом, что и кнопка «Показать ответы» (временно показываем и скрываем —
// то, что вписал ученик, возвращается на место).
// ============================================================
(function () {
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const clean = s => String(s || '').replace(/\s+/g, ' ').trim();
  const SKIP = el => el.classList.contains('legacy-field') || el.closest('#wbRoot,#studentLoginScreen,#teacherLoginScreen,.status-bar,#seAnsLayer,#roomListOverlay') || el.type === 'password' || /^(user|se_)/.test(el.id || '');

  function ctx(el) {                                   // текст вопроса вокруг поля
    let p = el.closest('.options-group') || el.parentElement;
    for (let i = 0; i < 5 && p && p !== document.body; i++, p = p.parentElement) {
      const c = p.cloneNode(true);
      c.querySelectorAll('input.intro-gap').forEach(x => x.replaceWith(document.createTextNode(' ____ ')));   // пропуск остаётся видимым в вопросе
      c.querySelectorAll('input,select,textarea,option,button,script,style,.result,.btn-group').forEach(x => x.remove());
      const t = clean(c.textContent); if (t.length >= 6 && t.length <= 280) return t;
    }
    return el.placeholder || el.id || el.name || '';
  }
  const heading = el => { let h = el; while (h && h !== document.body) { let s = h.previousElementSibling; while (s) { const t = s.matches('h2,h3') ? s : s.querySelector('h2,h3'); if (t) return clean(t.textContent); s = s.previousElementSibling; } h = h.parentElement; } return ''; };

  function collectKeys() {                             // правильные ответы: временно «показать» → прочитать → «скрыть»
    const keys = {}, notes = [];
    Object.getOwnPropertyNames(window).filter(n => /^toggle\w*Answers$/.test(n)).forEach(fn => {
      try {
        const btn = document.querySelector('button[onclick*="' + fn + '("]'); if (!btn) return;
        let box = btn.parentElement; while (box && box !== document.body && !box.querySelector('.result')) box = box.parentElement;
        const results = box ? [...box.querySelectorAll('.result')] : [];
        const fields = [...document.querySelectorAll('input[type=text],textarea,select')];
        const before = fields.map(f => f.className);
        window[fn]();                                  // показать
        fields.forEach((f, i) => { if (f.id && f.classList.contains('show-answer') && !/show-answer/.test(before[i])) keys[f.id] = f.tagName === 'SELECT' ? (f.options[f.selectedIndex] || {}).text : f.value; });
        const txt = results.map(d => clean(d.innerText)).filter(t => /📖|Правильные|ответы|примеры/i.test(t)).join(' ');
        if (txt) notes.push({ title: heading(btn), text: txt });
        window[fn]();                                  // скрыть (ответ ученика возвращается)
      } catch (e) { console.warn('study-sheet key', fn, e); }
    });
    return { keys, notes };
  }

  window.exportStudySheet = function () {
    const who = ((typeof userName !== 'undefined' ? userName : '') + ' ' + (typeof userSurname !== 'undefined' ? userSurname : '')).trim();
    const { keys, notes } = collectKeys();
    let h2 = '', h3 = '', body = '', seenRadio = {}, qn = 0, ok = 0, bad = 0, lastQ = '';
    document.querySelectorAll('h2,h3,input[type=text],textarea,select,input[type=radio]').forEach(el => {
      if (/^H[23]$/.test(el.tagName)) { if (SKIP(el)) return; const t = clean(el.textContent); if (!t) return;
        if (el.tagName === 'H2') { h2 = t; h3 = ''; body += '<h2>' + esc(t) + '</h2>'; } else { h3 = t; body += '<h3>' + esc(t) + '</h3>'; } return; }
      if (SKIP(el) || !(el.id || el.name)) return;
      let ans = '', key = keys[el.id], q;
      if (el.type === 'radio') { if (seenRadio[el.name]) return; seenRadio[el.name] = 1;
        const c = document.querySelector('input[type=radio][name="' + el.name + '"]:checked'); ans = c ? clean((c.closest('label') || {}).textContent || c.value) : ''; key = undefined; }
      else if (el.tagName === 'SELECT') ans = el.selectedIndex > 0 || el.value ? clean((el.options[el.selectedIndex] || {}).text) : '';
      else ans = clean(el.value);
      if (!ans && key === undefined) { q = ctx(el); if (!q) return; }
      q = q || ctx(el); qn++;
      const gap = el.classList.contains('intro-gap'), label = gap ? 'Пропуск' : (q === lastQ ? 'Свой ответ' : 'Твой ответ'); lastQ = q;
      let mark = '';
      if (key !== undefined && ans) { const good = ans.toLowerCase() === clean(key).toLowerCase(); mark = good ? ' ✓' : ' ✗'; good ? ok++ : bad++; }
      body += '<div class="q"><div class="qt">' + esc(q) + '</div><div class="a">' + label + ': <b>' + esc(ans || '—') + '</b>' + mark +
        (key !== undefined && clean(key) && (mark.includes('✗') || !ans) ? '<br><span class="k">Правильно: ' + esc(key) + '</span>' : '') + '</div></div>';
    });
    const notesHtml = notes.length ? '<h2>📖 Ответы, примеры и пояснения из урока</h2>' + notes.map(n => '<div class="note"><b>' + esc(n.title) + '</b><br>' + esc(n.text) + '</div>').join('') : '';
    const html = '<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><title>Конспект урока</title><style>body{font:15px/1.5 Georgia,serif;max-width:820px;margin:30px auto;padding:0 18px;color:#222}h1{margin:0 0 4px}h2{margin:30px 0 8px;border-bottom:2px solid #8b3a2a;padding-bottom:4px;color:#6b2a1a}h3{margin:18px 0 6px;color:#444}.q{margin:6px 0;padding:6px 10px;border-left:3px solid #ccc;background:#fafafa;page-break-inside:avoid}.qt{color:#555;font-size:.92em}.a{margin-top:2px}.k{color:#1e7a46}.note{margin:8px 0;padding:8px 12px;background:#f6f1e7;border-radius:6px;font-size:.92em;page-break-inside:avoid}.meta{color:#777;font-size:.9em}@media print{.noprint{display:none}}</style></head><body>' +
      '<h1>🩸 Supernatural English — конспект урока</h1><div class="meta">' + esc(who || 'Ученик') + ' · ' + new Date().toLocaleDateString() + (ok + bad ? ' · проверяемые задания: ' + ok + ' верно, ' + bad + ' с ошибкой' : '') + '</div>' +
      '<p class="noprint"><button onclick="window.print()">🖨 Печать / Сохранить в PDF</button></p>' + body + notesHtml + '</body></html>';
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' }), a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'Supernatural_Study_Sheet_' + new Date().toISOString().slice(0, 10) + '.html';
    document.body.appendChild(a); a.click(); document.body.removeChild(a); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    return html;
  };
})();
