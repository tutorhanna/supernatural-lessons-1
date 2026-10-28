// Упражнение 2 «Getting to Know Each Other»: пропуск в вопросе (______) теперь настоящее поле с проверкой и объяснением.
// Открытые ответы (intro_*) остаются как были. Ключ ниже можно править: a — допустимые слова, why — объяснение.
(function () {
  const KEY = [
    { a: ['name', 'age'], why: 'What\'s your name? — вопрос про имя (age тоже допустимо).' },
    { a: ['do'], why: 'Present Simple: Where do you live? — после where нужен do.' },
    { a: ['do'], why: 'Present Simple: Who do you live with? — вопрос с do.' },
    { a: ['or'], why: 'Выбор из двух вариантов — or: a house or an apartment.' },
    { a: ['do'], why: 'Present Simple: Do you have…? — вопрос про have строится с do.' },
    { a: ['do'], why: 'What do you do? — «Кем вы работаете?»; второй do — глагол.' },
    { a: ['do'], why: 'Present Simple: What kind of music do you like?' },
    { a: ['or'], why: 'Выбор — or: the radio or TV.' },
    { a: ['do'], why: 'Present Simple: What do you do on weekends?' },
    { a: ['out'], why: 'go out — выходить, проводить время вне дома.' },
    { a: ['do'], why: 'Present Simple: What kind of books do you read?' },
    { a: ['visited'], why: 'Present Perfect: Have you ever + V3 → visited.' },
    { a: ['did'], why: 'Речь о прошлом визите → Past Simple: What did you do there?' },
    { a: ['are'], why: 'Present Continuous: Why are you learning English?' },
    { a: ['food', 'movie', 'book'], why: 'Любое из слов подходит: favourite food / movie / book.' }
  ];
  const FULL = [
    "What's your <b>name</b>?", "Where <b>do</b> you live?", "Who <b>do</b> you live with?", "Do you live in a house <b>or</b> an apartment?",
    "<b>Do</b> you have any brothers or sisters?", "What <b>do</b> you do?", "What kind of music <b>do</b> you like?", "Do you listen to the radio <b>or</b> watch TV?",
    "What <b>do</b> you do on weekends?", "Do you go <b>out</b> with friends?", "What kind of books or magazines <b>do</b> you read?", "Have you ever <b>visited</b> a museum?",
    "What <b>did</b> you do there?", "Why <b>are</b> you learning English?", "What's your favourite <b>food</b> / movie / book?"
  ];
  const ids = KEY.map((_, i) => 'intro_g' + (i + 1));

  function inject() {
    const ex = document.getElementById('ex1'); if (!ex || document.getElementById(ids[0])) return;
    let n = 0;
    ex.querySelectorAll('p').forEach(p => {
      [...p.childNodes].forEach(node => {
        if (node.nodeType !== 3 || !node.nodeValue.includes('______')) return;
        const parts = node.nodeValue.split('______'), frag = document.createDocumentFragment();
        parts.forEach((txt, i) => {
          if (txt) frag.appendChild(document.createTextNode(txt));
          if (i < parts.length - 1 && n < KEY.length) {
            const inp = document.createElement('input');
            inp.type = 'text'; inp.id = ids[n]; inp.className = 'intro-gap'; inp.autocomplete = 'off'; inp.placeholder = '…';
            inp.style.cssText = 'display:inline-block; width:92px; padding:2px 8px; margin:0 4px; font-size:0.95em; text-align:center;';
            frag.appendChild(inp); n++;
          } else if (i < parts.length - 1) frag.appendChild(document.createTextNode('______'));
        });
        p.replaceChild(frag, node);
      });
    });
  }
  inject();

  // Раньше под каждым вопросом было ещё одно поле «Your answer…». Теперь вводится только слово в пропуск, лишние поля скрыты.
  const OPEN = ['intro_name', 'intro_live', 'intro_livewith', 'intro_house', 'intro_siblings', 'intro_do', 'intro_music', 'intro_radio', 'intro_weekend', 'intro_out', 'intro_books', 'intro_museum', 'intro_museum_do', 'intro_why', 'intro_favourite'];
  OPEN.forEach(id => { const el = document.getElementById(id); if (el) { el.classList.add('legacy-field'); el.style.display = 'none'; } });

  window.checkIntro = function () {
    const res = document.getElementById('result_intro'); let good = 0; const bad = [];
    KEY.forEach((k, i) => {
      const el = document.getElementById(ids[i]); if (!el) return;
      const v = el.value.trim().toLowerCase();
      if (k.a.includes(v)) { good++; el.className = 'intro-gap correct'; }
      else { el.className = 'intro-gap wrong'; bad.push('<br>❌ ' + (i + 1) + '. ' + (v ? '«' + el.value.trim() + '» — ' : 'пусто — ') + k.why); }
    });
    res.className = 'result show ' + (good === KEY.length ? 'correct' : 'wrong');
    res.innerHTML = '🎯 Правильно: ' + good + ' из ' + KEY.length + (good === KEY.length ? ' — отлично! 🔥' : '') +
      (bad.length ? '<span style="font-size:0.85em; color:#b0a890;">' + bad.join('') + '</span>' : '');
  };

  window.showIntroAnswers = function () {
    KEY.forEach((k, i) => { const el = document.getElementById(ids[i]); if (el) { el.value = k.a[0]; el.className = 'intro-gap show-answer'; } });
    const res = document.getElementById('result_intro'); res.className = 'result show info';
    res.innerHTML = '📖 <strong>Правильные ответы:</strong><br><br>' + FULL.map((s, i) => '<span style="color:#d4a060;">' + (i + 1) + '.</span> <span style="color:#b0a890;">' + s + '</span>' +
      (KEY[i].a.length > 1 ? ' <span style="color:#6a5a4a; font-size:0.85em;">(тоже подходит: ' + KEY[i].a.slice(1).join(' / ') + ')</span>' : '')).join('<br>');
  };
})();
