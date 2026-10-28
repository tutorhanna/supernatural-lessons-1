// Главный таймер: любая длительность («90», «7:30», «1:20:00») и секундомер «с нуля». Остальная логика таймера не меняется.
(function () {
  if (typeof mainSeconds === 'undefined') return;
  const origSet = window.mainSet, origUpdate = window.mainUpdateDisplay, origStart = window.mainStart;
  let sw = false, last = parseInt(localStorage.getItem('se_mainLast') || '2700', 10) || 2700;
  let booting = document.readyState === 'loading';           // при загрузке урок сам ставит 45 минут — не даём ему затереть выбранное тобой время
  const fmt = s => { const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
    return (h ? String(h).padStart(2, '0') + ':' : '') + String(h ? m : Math.floor(s / 60)).padStart(2, '0') + ':' + String(x).padStart(2, '0'); };
  const status = (txt, cls) => { mainStatus.textContent = txt; mainStatus.className = 'timer-status' + (cls ? ' ' + cls : ''); };

  window.mainUpdateDisplay = function () {
    if (!sw) return origUpdate();
    mainDisplay.textContent = String(Math.floor(mainSeconds / 60)).padStart(2, '0') + ':' + String(mainSeconds % 60).padStart(2, '0');
    mainDisplay.classList.remove('warning', 'danger');
  };
  function setSeconds(sec) {                                   // обычный обратный отсчёт на sec секунд
    if (booting) return; if (mainRunning) return; sw = false; last = sec; localStorage.setItem('se_mainLast', String(sec));
    mainSeconds = sec; origUpdate(); status('⏸ Готов (' + (sec % 60 ? fmt(sec) : (sec / 60) + ' мин') + ')');
  }
  window.mainSet = function (minutes) { setSeconds(Math.round(minutes * 60)); };
  window.mainSetCustom = function () {
    const inp = document.getElementById('mainCustom'); const s = String(inp.value || '').trim().replace(',', '.');
    let sec = NaN;
    if (/^\d+(:\d{1,2}){1,2}$/.test(s)) { const p = s.split(':').map(Number); sec = p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p[0] * 60 + p[1]; }
    else if (/^\d+(\.\d+)?$/.test(s)) sec = Math.round(parseFloat(s) * 60);
    if (!(sec >= 1 && sec <= 6 * 3600)) { inp.style.borderColor = '#c0392b'; inp.placeholder = 'пример: 90 или 7:30'; return; }
    inp.style.borderColor = ''; inp.value = ''; if (mainRunning) mainStop(); setSeconds(sec);
  };
  window.mainStopwatch = function () {                         // секундомер: считает ВВЕРХ от 00:00
    if (mainRunning) mainStop(); sw = true; mainSeconds = 0; window.mainUpdateDisplay(); status('⏱ Секундомер: нажми ▶');
  };
  window.mainStart = function () {
    if (!sw) return origStart();
    if (mainRunning) return; mainRunning = true; status('▶ Идёт (секундомер)', 'running');
    mainInterval = setInterval(() => { mainSeconds++; window.mainUpdateDisplay(); }, 1000);
  };
  window.mainReset = function () {
    mainStop();
    if (sw) { mainSeconds = 0; window.mainUpdateDisplay(); status('⏱ Секундомер: нажми ▶'); } else setSeconds(last);
  };

  function build() {
    booting = false;
    const body = document.querySelector('#mainTimer .timer-body'); if (!body || document.getElementById('mainCustom')) return;
    const row = document.createElement('div'); row.className = 'timer-row'; row.style.cssText = 'gap:3px; margin-top:4px;';
    row.innerHTML = '<input id="mainCustom" type="text" placeholder="мин или мм:сс" style="width:84px; font-size:0.55em; padding:2px 5px; border-radius:6px; border:1px solid #5a3a2a; background:#150f0b; color:#d4c9a8;" onkeydown="if(event.key===\'Enter\')mainSetCustom()">' +
      '<button class="timer-btn" onclick="mainSetCustom()" style="font-size:0.5em;" title="Задать свою длительность">Задать</button>' +
      '<button class="timer-btn" onclick="mainStopwatch()" style="font-size:0.5em;" title="Считать вверх с нуля">⏱ с нуля ↑</button>';
    body.insertBefore(row, document.getElementById('mainStatus'));
    if (last !== 2700 && !mainRunning) { mainSeconds = last; origUpdate(); status('⏸ Готов (' + (last % 60 ? fmt(last) : (last / 60) + ' мин') + ')'); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
