// ============================================================
// ОТВЕТЫ УЧЕНИКОВ ВОЗЛЕ ЗАДАНИЙ (видит только учитель)
// Читает rooms/<room>/answers/<studentKey>/<fieldId> и students/<key>. Рисует отдельный слой поверх страницы
// и НЕ меняет вёрстку, поэтому скролл-синхрон не сбивается.
// Режимы (кнопка слева внизу): подробно → значки → выкл
//   значки:   у поля маленький кружок с числом ответивших; наведи/нажми — список «имя: ответ»
//   подробно: цветные плашки «имя: ответ» рядом с полем; у вариантов выбора — кружки с инициалами на выбранном варианте
// ============================================================
(function () {
  let answers = {}, students = {}, layer, items = [], pop, pinned = null, queued = false, built = false, curRoom = '', unsubs = [];
  const KEY = 'se_ansMode2', MODES = ['discs', 'full', 'badge', 'off'];
  const mode = () => MODES.includes(localStorage.getItem(KEY)) ? localStorage.getItem(KEY) : 'discs';   // по умолчанию — подробно

  // Следим за комнатой: учитель может выйти в список и зайти в другую комнату без перезагрузки страницы
  setInterval(() => {
    const ok = typeof isTeacher !== 'undefined' && isTeacher && window.__FB && typeof roomId !== 'undefined' && roomId;
    if (!ok) { if (curRoom) leave(); return; }
    if (roomId !== curRoom) join(roomId);
  }, 1000);

  function leave() {
    unsubs.forEach(u => typeof u === 'function' && u()); unsubs = []; curRoom = ''; answers = {}; students = {};
    if (layer) { layer.innerHTML = ''; items = []; } if (pop) pop.style.display = 'none';
    const b = document.getElementById('seAnsBtn'); if (b) b.style.display = 'none';
  }
  function join(rid) {
    leave(); curRoom = rid; if (!built) build(); document.getElementById('seAnsBtn').style.display = '';
    const fb = window.__FB;
    unsubs.push(fb.onValue(fb.ref(fb.db, `rooms/${rid}/answers`), s => { if (rid === curRoom) { answers = s.val() || {}; schedule(); } }));
    unsubs.push(fb.onValue(fb.ref(fb.db, `rooms/${rid}/students`), s => { if (rid === curRoom) { students = s.val() || {}; schedule(); } }));
  }

  function build() {
    built = true;
    layer = document.createElement('div'); layer.id = 'seAnsLayer'; document.body.appendChild(layer);
    pop = document.createElement('div'); pop.id = 'seAnsPop'; document.body.appendChild(pop);
    const st = document.createElement('style');
    st.textContent = `#seAnsLayer{position:absolute;left:0;top:0;width:0;height:0;z-index:60;pointer-events:none}
      .se-ans{position:absolute;display:flex;flex-wrap:wrap;gap:3px;max-width:340px;width:max-content}
      .se-chip{pointer-events:auto;font:600 11.5px/1.25 'Montserrat',sans-serif;padding:2px 7px;border-radius:10px;max-width:210px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;box-shadow:0 1px 4px #0008;cursor:default}
      .se-badge{position:absolute;pointer-events:auto;min-width:18px;height:18px;padding:0 5px;box-sizing:border-box;border-radius:9px;background:#d4a060;color:#1a0f0a;font:700 11px/18px 'Montserrat',sans-serif;text-align:center;cursor:pointer;box-shadow:0 1px 4px #000a}
      .se-discs{position:absolute;display:flex;width:max-content;pointer-events:none}
      .se-fdiscs{position:absolute;display:flex;flex-wrap:wrap;gap:3px;width:max-content;max-width:260px;transform:translateY(-100%);pointer-events:none}
      .se-fd{pointer-events:auto;min-width:18px;height:18px;padding:0 3px;box-sizing:border-box;border-radius:9px;font:700 10px/16px 'Montserrat',sans-serif;text-align:center;box-shadow:0 1px 3px #000a;cursor:pointer}
      .se-disc{pointer-events:auto;width:17px;height:17px;border-radius:50%;margin-left:-4px;font:700 9.5px/15px 'Montserrat',sans-serif;text-align:center;box-shadow:0 1px 3px #000a;cursor:default}
      #seAnsPop{position:absolute;display:none;z-index:70;background:#14110d;border:1px solid #8b3a2a;border-radius:10px;padding:8px 10px;max-width:360px;box-shadow:0 6px 20px #000c;font:12.5px/1.45 'Montserrat',sans-serif;color:#d4c9a8}
      #seAnsPop div{margin:2px 0}#seAnsPop b{font-weight:700}
      #seAnsBtn{position:fixed;left:30px;bottom:130px;z-index:9000;background:rgba(20,18,15,.96);border:1px solid #3a2a1a;color:#d4a060;font-family:'Cinzel',serif;padding:7px 14px;border-radius:20px;cursor:pointer;font-size:.72em}`;
    document.head.appendChild(st);
    const btn = document.createElement('button'); btn.id = 'seAnsBtn';
    const paint = () => { btn.textContent = { discs: '👁 Ответы: кружки', full: '👁 Ответы: подробно', badge: '👁 Ответы: число', off: '👁 Ответы: выкл' }[mode()]; };
    btn.onclick = () => { localStorage.setItem(KEY, MODES[(MODES.indexOf(mode()) + 1) % 3]); paint(); hidePop(true); schedule(); };
    document.body.appendChild(btn); paint();
    document.addEventListener('click', e => { if (pinned && !e.target.closest('.se-badge,.se-fd,#seAnsPop')) hidePop(true); });
    setInterval(position, 900); window.addEventListener('resize', position); window.addEventListener('load', position);
  }

  const schedule = () => { if (queued) return; queued = true; requestAnimationFrame(() => { queued = false; render(); position(); }); };
  const hue = k => { let h = 2166136261; for (const c of String(k)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); h ^= h >>> 16; return (h >>> 0) % 360; };   // цвет ученика: разные ключи → заметно разные цвета
  const SKIP = /^(progress_|final_)/;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function radios(f) { const n = f.slice(6); return [...document.querySelectorAll('input[type=radio]')].filter(r => r.name === n); }
  function target(f) {
    if (f.startsWith('radio_')) { const r = radios(f).pop(); return r ? (r.closest('.options-group') || r.parentElement) : null; }
    if (f.startsWith('cb_')) return document.getElementById(f.slice(3));
    return document.getElementById(f);
  }
  function show(f, a) {                       // человекочитаемый ответ
    if (a.t === 'checkbox' || f.startsWith('cb_')) return a.v ? '✓' : '✗';
    const v = String(a.v == null ? '' : a.v).trim(); if (!v) return '';
    if (f.startsWith('radio_')) { const r = radios(f).find(x => x.value === v); const l = r && r.closest('label'); return l ? l.textContent.trim() : v; }
    const el = document.getElementById(f); if (el && el.tagName === 'SELECT') { const o = [...el.options].find(x => x.value === v); return o ? o.textContent.trim() : v; }
    return v;
  }

  function render() {
    if (!layer) return; layer.innerHTML = ''; items = [];
    if (mode() === 'off') return;
    const by = {};
    Object.keys(answers).forEach(sk => {
      const s = students[sk] || {}, name = (s.name || sk) + (s.surname ? ' ' + String(s.surname)[0] + '.' : '');
      Object.keys(answers[sk] || {}).forEach(f => {
        if (SKIP.test(f)) return; const a = answers[sk][f]; if (!a) return;
        const text = show(f, a); if (!text) return;
        (by[f] = by[f] || []).push({ key: sk, name, text, raw: String(a.v) });
      });
    });
    const names = {};   // ключ ученика -> имя (одно имя на ученика)
    Object.keys(by).forEach(f => by[f].forEach(c => { names[c.key] = c.name.split(' ')[0]; }));
    const ini = {};
    Object.keys(names).forEach(k => {
      const mine = names[k].toLowerCase(); let L = 1;
      while (L < mine.length && Object.keys(names).some(o => o !== k && names[o].toLowerCase().slice(0, L) === mine.slice(0, L))) L++;
      ini[k] = names[k].slice(0, L).replace(/^./, x => x.toUpperCase());
    });
    Object.keys(by).forEach(f => by[f].forEach(c => { c.ini = ini[c.key]; }));
    Object.keys(by).forEach(f => {
      const list = by[f].sort((a, b) => a.name.localeCompare(b.name));
      if (mode() === 'badge') return addBadge(f, list);
      if (mode() === 'discs') return f.startsWith('radio_') ? addDiscs(f, list) : addFieldDiscs(f, list);
      if (f.startsWith('radio_')) return addDiscs(f, list);
      // сколько плашек помещается без наложения на соседние строки; если ответов больше — значок со списком
      const t = target(f), w = t ? t.getBoundingClientRect().width : 0;
      const lim = t && t.tagName === 'TEXTAREA' ? 8 : (w > 480 ? 4 : 3);
      if (list.length > lim) return addBadge(f, list);
      addChips(f, list);
    });
  }

  function addBadge(f, list) {
    const b = document.createElement('div'); b.className = 'se-badge'; b.style.pointerEvents = 'auto'; b.textContent = list.length;
    b.addEventListener('mouseenter', () => showPop(f, b, list)); b.addEventListener('mouseleave', () => { if (!pinned) hidePop(); });
    b.addEventListener('click', e => { e.stopPropagation(); pinned === b ? hidePop(true) : (showPop(f, b, list), pinned = b); });
    layer.appendChild(b); items.push({ el: b, kind: 'badge', rect: () => { const t = target(f); return t && t.offsetParent ? t.getBoundingClientRect() : null; } });
  }
  function showPop(f, anchor, list) {
    pop.innerHTML = list.map(c => `<div><b style="color:hsl(${hue(c.key)} 70% 72%)">${esc(c.name)}</b>: ${esc(c.text)}</div>`).join('');
    pop.style.display = 'block'; const r = anchor.getBoundingClientRect();
    pop.style.left = Math.max(8, Math.round(window.scrollX + r.left - 200)) + 'px'; pop.style.top = Math.round(window.scrollY + r.bottom + 6) + 'px';
  }
  function hidePop(unpin) { pop.style.display = 'none'; if (unpin) pinned = null; }

  function addChips(f, list) {
    const w = document.createElement('div'); w.className = 'se-ans';
    list.forEach(c => {
      const h = hue(c.key), chip = document.createElement('span'); chip.className = 'se-chip';
      chip.style.cssText = `background:hsl(${h} 40% 22%);color:hsl(${h} 70% 88%);border:1px solid hsl(${h} 50% 45%)`;
      chip.textContent = c.name.split(' ')[0] + ': ' + c.text; chip.title = c.name + ': ' + c.text; w.appendChild(chip);
    });
    layer.appendChild(w); items.push({ el: w, kind: 'chips', tag: () => { const t = target(f); return t && t.tagName; }, rect: () => { const t = target(f); return t && t.offsetParent ? t.getBoundingClientRect() : null; } });
  }
  function addFieldDiscs(f, list) {      // по кружку на ученика НАД полем, в ряд, без наложения; ответ — в подсказке
    const w = document.createElement('div'); w.className = 'se-fdiscs';
    list.forEach(c => { const h = hue(c.key), d = document.createElement('div'); d.className = 'se-fd';
      d.style.cssText = `background:hsl(${h} 45% 28%);color:hsl(${h} 75% 90%);border:1px solid hsl(${h} 55% 55%)`; d.textContent = c.ini; d.title = c.name + ': ' + c.text;
      d.addEventListener('mouseenter', () => showPop(f, d, list)); d.addEventListener('mouseleave', () => { if (!pinned) hidePop(); });
      d.addEventListener('click', e => { e.stopPropagation(); showPop(f, d, list); pinned = d; }); w.appendChild(d); });
    layer.appendChild(w); items.push({ el: w, kind: 'fdisc', rect: () => { const t = target(f); return t && t.offsetParent ? t.getBoundingClientRect() : null; } });
  }
  function addDiscs(f, list) {            // кружки с инициалами прямо на выбранном варианте
    const byVal = {}; list.forEach(c => (byVal[c.raw] = byVal[c.raw] || []).push(c));
    Object.keys(byVal).forEach(v => {
      const d = document.createElement('div'); d.className = 'se-discs';
      byVal[v].forEach(c => { const h = hue(c.key), x = document.createElement('div'); x.className = 'se-disc';
        x.style.cssText = `background:hsl(${h} 45% 28%);color:hsl(${h} 75% 90%);border:1px solid hsl(${h} 55% 55%)`; x.textContent = c.ini || c.name[0].toUpperCase(); x.title = c.name + ': ' + c.text; d.appendChild(x); });
      layer.appendChild(d);
      items.push({ el: d, kind: 'disc', rect: () => { const r = radios(f).find(x => x.value === v); const l = r && (r.closest('label') || r); return l && l.offsetParent ? l.getBoundingClientRect() : null; } });
    });
  }

  function position() {
    if (!layer || mode() === 'off') return;
    const sx = window.scrollX, sy = window.scrollY;
    items.forEach(it => {
      const r = it.rect(); if (!r) { it.el.style.display = 'none'; return; }
      it.el.style.display = it.kind === 'badge' ? 'block' : 'flex';
      if (it.kind === 'fdisc') { it.el.style.left = Math.round(sx + r.left) + 'px'; it.el.style.top = Math.round(sy + r.top - 3) + 'px'; }
      else if (it.kind === 'badge') { it.el.style.left = Math.round(sx + r.right - 9) + 'px'; it.el.style.top = Math.round(sy + r.top - 9) + 'px'; }
      else if (it.kind === 'disc') { it.el.style.transform = 'translateX(-50%)'; it.el.style.left = Math.round(sx + r.left + r.width / 2) + 'px'; it.el.style.top = Math.round(sy + r.top - 16) + 'px'; }
      else if (r.width > 480) {
        it.el.style.transform = 'translateX(-100%)'; it.el.style.justifyContent = 'flex-end'; it.el.style.maxWidth = Math.round(r.width * 0.72) + 'px';
        it.el.style.left = Math.round(sx + r.right - 8) + 'px'; it.el.style.top = Math.round(sy + r.top + (it.tag() === 'TEXTAREA' ? 6 : 3)) + 'px';
      } else { it.el.style.transform = 'none'; it.el.style.justifyContent = 'flex-start'; it.el.style.maxWidth = '340px'; it.el.style.left = Math.round(sx + r.right + 8) + 'px'; it.el.style.top = Math.round(sy + r.top) + 'px'; }
    });
  }
})();
