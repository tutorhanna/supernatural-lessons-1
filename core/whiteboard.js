// ============================================================
// SHARED WHITEBOARD v2 — рисование + текст + фото + видео/аудио-ссылки, общая для комнаты, экспорт в PDF
// Данные: rooms/<roomId>/whiteboard/{meta, pages/<n>/{strokes,objs}/<key>}
// ============================================================
(function () {
  const W = 1600, H = 900;
  const FBV = 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js';
  const PDFLIB = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
  const COLORS = ['#111111', '#c0392b', '#2471a3', '#1e8449', '#d68910'];
  const SIZES = [3, 6, 12], FONTS = [28, 40, 60];

  const S = { open: false, page: 0, count: 1, studentsDraw: true, tool: 'pen', color: COLORS[0], size: SIZES[1], k: 1,
              pages: {}, ready: false, listeners: {}, unsubs: [], ver: undefined, room: '', metaUnsub: null, redrawQueued: false, drawing: null, me: null, focusNew: null };
  let fb, fbx, root, wrap, main, mctx, over, octx, layer, fileIn, audioIn, ui = {}, els = {};

  const isT = () => typeof isTeacher !== 'undefined' && !!isTeacher;
  const rid = () => (typeof roomId !== 'undefined' && roomId) || localStorage.getItem('se_roomId') || '';
  const inRoom = () => !!rid() && (isT() || (typeof userKey !== 'undefined' && !!userKey));
  const base = () => `rooms/${rid()}/whiteboard`;
  const R = p => fb.ref(fb.db, `${base()}/${p}`);
  const canDraw = () => isT() || S.studentsDraw;

  async function init() {
    if (S.ready) return true;
    for (let i = 0; i < 80 && !window.__FB; i++) await new Promise(r => setTimeout(r, 100));
    if (!window.__FB) return false;
    fb = window.__FB; fbx = Object.assign({}, await import(FBV), { set: fb.set, update: fb.update, push: fb.push });
    S.me = (typeof userKey !== 'undefined' && userKey) || 'u' + Math.random().toString(36).slice(2, 8);
    S.room = rid(); S.metaUnsub = fbx.onValue(R('meta'), s => {
      const m = s.val() || {}; S.meta = m; sweep();
      const ver = m.ver || 0, reset = S.ver !== undefined && ver !== S.ver; S.ver = ver;
      S.count = m.count || 1; S.studentsDraw = m.studentsDraw !== false;
      if (reset) {                                   // страницу удалили → сбрасываем кэш и переподписываемся
        S.unsubs.forEach(u => typeof u === 'function' && u()); S.unsubs = []; S.pages = {}; S.listeners = {}; els = {}; if (layer) layer.innerHTML = '';
        S.page = Math.max(0, Math.min(isT() ? S.page : (typeof m.current === 'number' ? m.current : S.page), S.count - 1));
        attach(S.page); if (S.open) { redraw(); renderAllObjs(); }
      }
      if (!isT() && typeof m.current === 'number' && m.current !== S.page) goPage(m.current, true);
      applyMode(); updateUI();
    });
    attach(0); S.ready = true; return true;
  }

  const PC = '-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz';
  const keyTime = k => { let n = 0; for (let i = 0; i < 8; i++) n = n * 64 + PC.indexOf(k[i]); return n; };
  const clrOf = p => (S.meta && S.meta['clr' + p]) || 0;
  const stale = (p, k) => keyTime(k) < clrOf(p);
  function teardown() {            // другая комната → отписываемся от старой и начинаем с нуля
    S.unsubs.forEach(u => typeof u === 'function' && u()); if (typeof S.metaUnsub === 'function') S.metaUnsub();
    S.unsubs = []; S.metaUnsub = null; S.pages = {}; S.listeners = {}; S.ready = false; S.ver = undefined; S.meta = null; S.room = '';
    S.page = 0; S.count = 1; els = {}; if (layer) layer.innerHTML = ''; if (mctx) whiteFill(mctx);
  }
  const pageObj = p => S.pages[p] || (S.pages[p] = { strokes: {}, order: [], objs: {} });
  function attach(p) {
    if (S.listeners[p]) return; S.listeners[p] = true;
    const pg = pageObj(p), rs = R(`pages/${p}/strokes`), ro = R(`pages/${p}/objs`);
    const U = S.unsubs;
    U.push(fbx.onChildAdded(rs, s => { if (pg.strokes[s.key]) return; if (stale(p, s.key)) { fbx.remove(R(`pages/${p}/strokes/${s.key}`)); return; }
      const last = pg.order[pg.order.length - 1]; pg.strokes[s.key] = s.val(); pg.order.push(s.key);
      if (S.open && p === S.page) { if (last && s.key < last) queueRedraw(); else drawStroke(mctx, s.val()); } }));
    U.push(fbx.onChildRemoved(rs, s => { delete pg.strokes[s.key]; pg.order = pg.order.filter(k => k !== s.key); if (p === S.page) queueRedraw(); }));
    U.push(fbx.onChildAdded(ro, s => { if (stale(p, s.key)) { fbx.remove(R(`pages/${p}/objs/${s.key}`)); return; } pg.objs[s.key] = s.val(); if (p === S.page) renderObj(s.key); }));
    U.push(fbx.onChildChanged(ro, s => { pg.objs[s.key] = s.val(); if (p === S.page) renderObj(s.key); }));
    U.push(fbx.onChildRemoved(ro, s => { delete pg.objs[s.key]; if (els[s.key]) { els[s.key].remove(); delete els[s.key]; } }));
  }

  // после «Очистить» всё, что нарисовано раньше метки очистки (в т.ч. штрихи из-за обрыва связи), удаляется
  function sweep() {
    Object.keys(S.pages).forEach(p => { const pg = S.pages[p]; let ch = false;
      Object.keys(pg.strokes).forEach(k => { if (stale(p, k)) { delete pg.strokes[k]; ch = true; fbx.remove(R(`pages/${p}/strokes/${k}`)); } });
      pg.order = pg.order.filter(k => pg.strokes[k]);
      Object.keys(pg.objs).forEach(k => { if (stale(p, k)) { delete pg.objs[k]; if (els[k] && +p === S.page) { els[k].remove(); delete els[k]; } fbx.remove(R(`pages/${p}/objs/${k}`)); } });
      if (ch && +p === S.page) queueRedraw(); });
  }
  // ---------- штрихи ----------
  function drawStroke(ctx, st) {
    const p = st.p; if (!p || p.length < 2) return;
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = st.e ? '#ffffff' : st.c; ctx.lineWidth = st.e ? st.w * 4 : st.w;
    ctx.beginPath(); ctx.moveTo(p[0], p[1]); if (p.length === 2) ctx.lineTo(p[0] + 0.01, p[1]);
    for (let i = 2; i < p.length - 2; i += 2) ctx.quadraticCurveTo(p[i], p[i + 1], (p[i] + p[i + 2]) / 2, (p[i + 1] + p[i + 3]) / 2);
    if (p.length >= 4) ctx.lineTo(p[p.length - 2], p[p.length - 1]);
    ctx.stroke(); ctx.restore();
  }
  const whiteFill = ctx => { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H); };
  function redraw() { whiteFill(mctx); const pg = pageObj(S.page); Object.keys(pg.strokes).sort().forEach(k => drawStroke(mctx, pg.strokes[k])); }
  function queueRedraw() { if (S.redrawQueued) return; S.redrawQueued = true; requestAnimationFrame(() => { S.redrawQueued = false; redraw(); }); }
  function pos(e) { const b = over.getBoundingClientRect(); return [Math.round((e.clientX - b.left) * W / b.width), Math.round((e.clientY - b.top) * H / b.height)]; }
  function down(e) {
    if (!canDraw()) return; e.preventDefault();
    if (S.tool === 'text') { const [x, y] = pos(e); createText(x, y); return; }
    over.setPointerCapture(e.pointerId);
    const [x, y] = pos(e); S.drawing = { c: S.color, w: S.size, e: S.tool === 'eraser' ? 1 : 0, p: [x, y], u: S.me, t: Date.now() };
    octx.clearRect(0, 0, W, H); drawStroke(octx, S.drawing);
  }
  function move(e) {
    if (!S.drawing) return; e.preventDefault();
    const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e], d = S.drawing.p;
    evs.forEach(ev => { const [x, y] = pos(ev); if (Math.abs(x - d[d.length - 2]) + Math.abs(y - d[d.length - 1]) >= 3) d.push(x, y); });
    octx.clearRect(0, 0, W, H); drawStroke(octx, S.drawing);
  }
  function up() {
    if (!S.drawing) return; const st = S.drawing; S.drawing = null;
    fbx.push(R(`pages/${S.page}/strokes`), st); setTimeout(() => octx.clearRect(0, 0, W, H), 30);
  }
  function undoMine() {
    const pg = pageObj(S.page);
    for (let i = pg.order.length - 1; i >= 0; i--) { const k = pg.order[i]; if (pg.strokes[k].u === S.me) { fbx.remove(R(`pages/${S.page}/strokes/${k}`)); return; } }
  }
  function clearPage() {
    if (isT() && confirm('Очистить эту страницу доски для всех (рисунки, текст, фото)?')) { fbx.update(R('meta'), { ['clr' + S.page]: fb.serverTimestamp() }); fbx.remove(R(`pages/${S.page}/strokes`)); fbx.remove(R(`pages/${S.page}/objs`)); }
  }

  // ---------- объекты: текст / фото / медиа ----------
  const OP = id => R(`pages/${S.page}/objs/${id}`);
  function freeSlot(w, h) {
    const rs = Object.values(pageObj(S.page).objs).map(o => [o.x - 16, o.y - 50, o.x + o.w + 16, o.y + o.h + 16]);
    for (let y = 70; y + h <= H - 20; y += 20) for (let x = 40; x + w <= W - 40; x += 20)
      if (!rs.some(r => x < r[2] && x + w > r[0] && y < r[3] && y + h > r[1])) return { x, y };
    return nextPos();
  }
  function nextPos() { const n = Object.keys(pageObj(S.page).objs).length % 8; return { x: 80 + n * 45, y: 80 + n * 40 }; }
  function newObj(o) { const r = fbx.push(R(`pages/${S.page}/objs`)); o.u = S.me; o.t0 = Date.now(); fbx.set(r, o); return r.key; }
  function createText(x, y) {
    const fs = FONTS[Math.max(0, SIZES.indexOf(S.size))];
    const id = fbx.push(R(`pages/${S.page}/objs`)).key; S.focusNew = id;
    fbx.set(OP(id), { t: 'text', x: Math.min(x, W - 300), y: Math.min(y, H - 120), w: 520, h: fs * 2.2, text: '', fs, c: S.color, u: S.me, t0: Date.now() });
    setTool('select');
  }
  function parseEmbed(url) {
    url = url.trim(); let m;
    if ((m = url.match(/(?:youtu\.be\/|[?&]v=|embed\/|shorts\/)([\w-]{11})/))) return { kind: 'iframe', src: 'https://www.youtube.com/embed/' + m[1], w: 640, h: 360 };
    if (/video_ext\.php/.test(url)) return { kind: 'iframe', src: url.replace('vk.ru', 'vk.com'), w: 640, h: 360 };
    if (/\.(mp3|m4a|ogg|wav|aac)(\?|$)/i.test(url)) return { kind: 'audio', src: url, w: 520, h: 70 };
    if (/\.(mp4|webm|mov)(\?|$)/i.test(url)) return { kind: 'video', src: url, w: 640, h: 360 };
    if (/^https?:\/\//i.test(url)) return { kind: 'link', src: url, w: 520, h: 60 };
    return null;
  }
  function addEmbed() {
    if (!canDraw()) return;
    const url = prompt('Ссылка на видео (YouTube, VK video_ext), аудио (mp3/m4a/ogg) или любую страницу:'); if (!url) return;
    const e = parseEmbed(url); if (!e) { alert('Нужна ссылка, начинающаяся с https://'); return; }
    newObj(Object.assign({ t: 'embed', kind: e.kind, src: e.src, w: e.w, h: e.h }, freeSlot(e.w, e.h)));
  }
  const AUDIO_MAX = 2.5 * 1024 * 1024;
  function addAudioFile(file) {
    if (!canDraw() || !file) return;
    if (!/^audio\//.test(file.type) && !/\.(mp3|m4a|ogg|wav|aac)$/i.test(file.name)) { alert('Это не аудиофайл'); return; }
    if (file.size > AUDIO_MAX) { alert('Файл больше 2,5 МБ. Для коротких фрагментов подойдёт, а целую песню лучше положить на сайт в assets/audio и вставить ссылкой (кнопка «▶ Видео/аудио»).'); return; }
    const fr = new FileReader(); fr.onload = () => newObj(Object.assign({ t: 'embed', kind: 'audio', src: fr.result, name: file.name, w: 520, h: 70 }, freeSlot(520, 70))); fr.readAsDataURL(file);
  }
  function compressImage(file) {
    return new Promise((ok, no) => {
      const fr = new FileReader(); fr.onerror = no;
      fr.onload = () => { const im = new Image(); im.onerror = no; im.onload = () => {
        let max = 1100, q = 0.8, url, w, h;
        do { const sc = Math.min(1, max / Math.max(im.width, im.height)); w = Math.round(im.width * sc); h = Math.round(im.height * sc);
          const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); x.drawImage(im, 0, 0, w, h);
          url = c.toDataURL('image/jpeg', q); max *= 0.8; q = Math.max(0.5, q - 0.08); } while (url.length > 260000 && max > 300);
        ok({ src: url, w, h }); }; im.src = fr.result; };
      fr.readAsDataURL(file);
    });
  }
  async function addImageFile(file) {
    if (!canDraw() || !file || !/^image\//.test(file.type)) return;
    try {
      const r = await compressImage(file), sc = Math.min(1, 460 / r.w, 320 / r.h);
      const iw = Math.round(r.w * sc / 20) * 20 || 20, ih = Math.round(iw * r.h / r.w); newObj(Object.assign({ t: 'img', src: r.src, w: iw, h: ih }, freeSlot(iw, ih)));
    } catch (e) { alert('Не удалось добавить картинку'); }
  }

  function renderObj(id) {
    const o = pageObj(S.page).objs[id]; if (!o) return;
    let el = els[id];
    if (!el) {
      el = els[id] = document.createElement('div'); el.className = 'wbo ' + (o.t === 'text' ? 'txt' : 'media'); el.dataset.id = id;
      el.innerHTML = '<div class="wbh"><span class="wbg" title="Перетащить">✥</span><span class="wbx" title="Удалить">🗑</span></div><div class="wbc"></div><div class="wbr" title="Размер"></div>';
      layer.appendChild(el); bindObj(el, id);
    }
    el.style.left = o.x + 'px'; el.style.top = o.y + 'px'; el.style.width = o.w + 'px'; el.style.height = o.h + 'px';
    const c = el.querySelector('.wbc');
    if (o.t === 'text') {
      let t = c.firstChild;
      if (!t) { t = document.createElement('div'); t.className = 'wbt'; t.contentEditable = 'true'; t.spellcheck = false; c.appendChild(t); bindText(t, id); }
      t.style.fontSize = o.fs + 'px'; t.style.color = o.c; t.contentEditable = canDraw() ? 'true' : 'false';
      if (document.activeElement !== t && t.innerText !== (o.text || '')) t.innerText = o.text || '';
      if (S.focusNew === id) { S.focusNew = null; t.focus(); setTimeout(() => { if (document.activeElement !== t) t.focus(); }, 60); }
    } else if (el.dataset.sig !== (o.src.length + ':' + o.src.slice(0, 80))) {
      el.dataset.sig = o.src.length + ':' + o.src.slice(0, 80); c.innerHTML = '';
      let n;
      if (o.t === 'img') { n = new Image(); n.src = o.src; n.draggable = false; }
      else if (o.kind === 'iframe') { n = document.createElement('iframe'); n.src = o.src; n.allow = 'autoplay; encrypted-media; fullscreen; picture-in-picture'; }
      else if (o.kind === 'audio') { n = document.createElement('audio'); n.src = o.src; n.controls = true; }
      else if (o.kind === 'video') { n = document.createElement('video'); n.src = o.src; n.controls = true; }
      else { n = document.createElement('a'); n.href = o.src; n.target = '_blank'; n.rel = 'noopener'; n.textContent = '🔗 ' + o.src; n.className = 'wblink'; }
      c.appendChild(n);
    }
    el.classList.toggle('ro', !canDraw());
  }
  function bindText(t, id) {
    let tm;
    const save = () => { const v = t.innerText.replace(/\n$/, ''); fbx.update(OP(id), { text: v }); };
    t.addEventListener('input', () => { clearTimeout(tm); tm = setTimeout(save, 350);
      const el = els[id], o = pageObj(S.page).objs[id]; if (el && o && t.scrollHeight > el.offsetHeight) { el.style.height = t.scrollHeight + 'px'; fbx.update(OP(id), { h: t.scrollHeight }); } });
    t.addEventListener('blur', () => { clearTimeout(tm); if (!t.innerText.trim()) fbx.remove(OP(id)); else save(); });
    t.addEventListener('paste', e => { const txt = e.clipboardData && e.clipboardData.getData('text/plain'); if (txt != null && !hasImage(e)) { e.preventDefault(); document.execCommand('insertText', false, txt); } });
  }
  function bindObj(el, id) {
    const act = () => { layer.querySelectorAll('.wbo.act').forEach(x => x !== el && x.classList.remove('act')); el.classList.add('act'); };
    el.addEventListener('pointerdown', act);
    el.querySelector('.wbx').onclick = () => canDraw() && fbx.remove(OP(id));
    const drag = (handle, onMove, onEnd) => handle.addEventListener('pointerdown', e => {
      if (!canDraw()) return; e.preventDefault(); e.stopPropagation(); handle.setPointerCapture(e.pointerId);
      const sx = e.clientX, sy = e.clientY, o = Object.assign({}, pageObj(S.page).objs[id]);
      const mv = ev => onMove(o, (ev.clientX - sx) / S.k, (ev.clientY - sy) / S.k);
      const end = () => { handle.removeEventListener('pointermove', mv); handle.removeEventListener('pointerup', end); handle.removeEventListener('pointercancel', end); onEnd(); };
      handle.addEventListener('pointermove', mv); handle.addEventListener('pointerup', end); handle.addEventListener('pointercancel', end);
    });
    drag(el.querySelector('.wbg'), (o, dx, dy) => { el.style.left = o.x + dx + 'px'; el.style.top = o.y + dy + 'px'; },
      () => { const x = Math.round(parseInt(el.style.left) / 20) * 20, y = Math.round(parseInt(el.style.top) / 20) * 20; el.style.left = x + 'px'; el.style.top = y + 'px'; fbx.update(OP(id), { x, y }); });
    drag(el.querySelector('.wbr'), (o, dx, dy) => { const w = Math.max(120, o.w + dx); el.style.width = w + 'px'; el.style.height = Math.max(50, o.t === 'img' ? w * o.h / o.w : o.h + dy) + 'px'; },
      () => fbx.update(OP(id), { w: parseInt(el.style.width), h: parseInt(el.style.height) }));
  }
  function renderAllObjs() { layer.innerHTML = ''; els = {}; Object.keys(pageObj(S.page).objs).forEach(renderObj); }
  const hasImage = e => !!(e.clipboardData && [...e.clipboardData.items].some(i => i.type.startsWith('image/')));

  // ---------- страницы ----------
  function goPage(p, fromSync) {
    S.page = Math.max(0, Math.min(p, S.count - 1)); attach(S.page);
    if (S.open) { queueRedraw(); renderAllObjs(); }
    if (isT() && !fromSync) fbx.update(R('meta'), { current: S.page });
    updateUI();
  }
  async function addPage() { if (!isT()) return; const n = S.count; S.count = n + 1; await fbx.update(R('meta'), { count: n + 1, current: n }); goPage(n, true); }
  async function deletePage() {
    if (!isT()) return; const p = S.page, n = S.count;
    if (!confirm(n <= 1 ? 'Это единственная страница — очистить её?' : `Удалить страницу ${p + 1} из ${n} для всех?`)) return;
    if (n <= 1) { await fbx.update(R('meta'), { ['clr0']: fb.serverTimestamp() }); fbx.remove(R('pages/0/strokes')); fbx.remove(R('pages/0/objs')); return; }
    const all = (await fbx.get(R('pages'))).val() || {}, out = {}; let j = 0;
    for (let i = 0; i < n; i++) { if (i === p) continue; if (all[i]) out[j] = all[i]; j++; }
    await fbx.set(R('pages'), Object.keys(out).length ? out : null);
    const meta = { count: n - 1, current: Math.min(p, n - 2), ver: (S.ver || 0) + 1 }; for (let i = 0; i < n; i++) meta['clr' + i] = null;
    await fbx.update(R('meta'), meta);
  }
  function toggleStudents() { if (isT()) fbx.update(R('meta'), { studentsDraw: !S.studentsDraw }); }

  // ---------- PDF ----------
  const loadScript = src => new Promise((ok, no) => { if (window.jspdf) return ok(); const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = no; document.head.appendChild(s); });
  const loadImg = src => new Promise(ok => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ok(null); i.src = src; });
  function wrapText(c, text, x, y, w, lh) {
    String(text || '').split('\n').forEach(par => { let line = '';
      par.split(' ').forEach(wd => { const t = line ? line + ' ' + wd : wd; if (c.measureText(t).width > w && line) { c.fillText(line, x, y); y += lh; line = wd; } else line = t; });
      c.fillText(line, x, y); y += lh; });
  }
  async function renderPageTo(c, data) {
    whiteFill(c); const st = data.strokes || {}; Object.keys(st).sort().forEach(k => drawStroke(c, st[k]));
    const ob = data.objs || {};
    for (const k of Object.keys(ob).sort()) {
      const o = ob[k];
      if (o.t === 'text') { c.fillStyle = o.c || '#111'; c.font = `${o.fs}px Georgia, serif`; c.textBaseline = 'top'; wrapText(c, o.text, o.x + 8, o.y + 4, o.w - 16, o.fs * 1.25); }
      else if (o.t === 'img') { const im = await loadImg(o.src); if (im) c.drawImage(im, o.x, o.y, o.w, o.h); }
      else { c.fillStyle = '#eee'; c.fillRect(o.x, o.y, o.w, Math.min(o.h, 120)); c.strokeStyle = '#999'; c.strokeRect(o.x, o.y, o.w, Math.min(o.h, 120));
        c.fillStyle = '#222'; c.font = '22px Georgia, serif'; c.textBaseline = 'top'; wrapText(c, (o.kind === 'audio' ? '🔊 ' : '▶ ') + (/^data:/.test(o.src) ? (o.name || 'аудиофайл') : o.src), o.x + 10, o.y + 10, o.w - 20, 28); }
    }
  }
  async function exportPDF() {
    const btn = ui.pdf; btn.disabled = true; btn.textContent = '⏳ PDF…';
    try {
      await loadScript(PDFLIB);
      const data = (await fbx.get(R('pages'))).val() || {};
      const pdf = new window.jspdf.jsPDF({ orientation: 'landscape', unit: 'px', format: [W, H], compress: true });
      const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const c = cv.getContext('2d'); let first = true;
      for (let p = 0; p < S.count; p++) {
        const d = data[p] || {}; const empty = !Object.keys(d.strokes || {}).length && !Object.keys(d.objs || {}).length;
        if (empty && !(first && p === S.count - 1)) continue;
        await renderPageTo(c, d);
        if (!first) pdf.addPage([W, H], 'landscape'); first = false;
        pdf.addImage(cv.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, W, H);
        pdf.setFontSize(18); pdf.setTextColor(150); pdf.text(`Board · page ${p + 1}`, 24, H - 18);
      }
      pdf.save(`whiteboard-${rid() || 'room'}-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (e) { alert('Не удалось создать PDF: ' + e.message); }
    btn.disabled = false; btn.textContent = '📄 PDF';
  }

  // ---------- интерфейс ----------
  const css = `
  #wbFab{position:fixed;left:30px;bottom:84px;z-index:9000;background:rgba(20,18,15,.96);border:1px solid #8b3a2a;color:#d4a060;font-family:'Cinzel',serif;padding:9px 16px;border-radius:24px;cursor:pointer;font-size:.8em;display:none;box-shadow:0 4px 14px #000a}
  #wbRoot{position:fixed;inset:0;z-index:10050;background:#0e0c0a;display:none;flex-direction:column;font-family:'Cinzel',serif}
  #wbBar{display:flex;flex-wrap:wrap;gap:6px;align-items:center;padding:8px 10px;background:#1a1411;border-bottom:1px solid #3a2a1a}
  #wbBar button{background:#2a1e17;border:1px solid #4a3425;color:#d4c9a8;border-radius:8px;padding:6px 10px;cursor:pointer;font-size:.8em;font-family:inherit}
  #wbBar button.on{border-color:#d4a060;background:#4a2a1a}#wbBar button:disabled{opacity:.5}
  #wbBar .sw{width:24px;height:24px;border-radius:50%;padding:0;border:2px solid #4a3425}#wbBar .sw.on{border-color:#fff}
  #wbBar .sep{width:1px;height:24px;background:#3a2a1a;margin:0 4px}#wbBar .sp{flex:1}
  #wbStage{flex:1;display:flex;align-items:center;justify-content:center;padding:8px;min-height:0}
  #wbWrap{position:relative;aspect-ratio:16/9;max-width:100%;max-height:100%;height:100%;background:#fff;border-radius:6px;box-shadow:0 0 30px #000}
  #wbWrap>canvas{position:absolute;inset:0;width:100%;height:100%;border-radius:6px;touch-action:none}
  #wbLayer{position:absolute;left:0;top:0;width:${W}px;height:${H}px;transform-origin:0 0;pointer-events:none}
  .wbo{position:absolute;box-sizing:border-box;pointer-events:none}.wbo.media{z-index:1}.wbo.txt{z-index:2}
  #wbWrap.sel .wbo{pointer-events:auto}
  .wbo.txt{border:2px dashed transparent;border-radius:6px}.wbo.txt:hover,.wbo.txt:focus-within,.wbo.act{border-color:#8b3a2a}
  .wbc,.wbc>*{width:100%;height:100%}.wbc img,.wbc iframe,.wbc video{display:block;border:0;object-fit:contain;background:#000}.wbc img{background:none}
  .wbc audio{width:100%;height:60px}.wblink{display:block;padding:10px;color:#2471a3;font:26px Georgia,serif;word-break:break-all}
  .wbt{outline:none;overflow:hidden;white-space:pre-wrap;word-break:break-word;font-family:Georgia,'Lora',serif;line-height:1.25;padding:4px 8px;color:#111;cursor:text}
  .wbh{position:absolute;top:-44px;left:0;height:40px;display:none;gap:14px;align-items:center;background:#2a1e17;border-radius:8px;padding:0 14px;color:#d4c9a8;font-size:26px;cursor:default}
  .wbg{cursor:move}.wbx{cursor:pointer}
  .wbr{position:absolute;right:-14px;bottom:-14px;width:34px;height:34px;background:#8b3a2a;border-radius:50%;cursor:nwse-resize;display:none;touch-action:none}
  .wbo:hover>.wbh,.wbo.act>.wbh{display:flex}.wbo:hover>.wbr,.wbo.act>.wbr{display:block}.wbo.ro>.wbh,.wbo.ro>.wbr{display:none!important}
  #wbHint{color:#8a7a6a;font-size:.7em;padding:0 12px 6px}`;
  function build() {
    const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    const fab = document.createElement('button'); fab.id = 'wbFab'; fab.textContent = '🎨 Доска'; fab.onclick = open; document.body.appendChild(fab); ui.fab = fab;
    root = document.createElement('div'); root.id = 'wbRoot';
    root.innerHTML = `<div id="wbBar"></div><div id="wbStage"><div id="wbWrap"><canvas id="wbMain" width="${W}" height="${H}"></canvas><div id="wbLayer"></div><canvas id="wbOver" width="${W}" height="${H}"></canvas></div></div><div id="wbHint"></div>`;
    document.body.appendChild(root);
    wrap = root.querySelector('#wbWrap'); main = root.querySelector('#wbMain'); over = root.querySelector('#wbOver'); layer = root.querySelector('#wbLayer');
    mctx = main.getContext('2d'); octx = over.getContext('2d');
    new ResizeObserver(() => { S.k = wrap.clientWidth / W; layer.style.transform = `scale(${S.k})`; }).observe(wrap);
    over.addEventListener('pointerdown', down); over.addEventListener('pointermove', move); over.addEventListener('pointerup', up); over.addEventListener('pointercancel', up);
    fileIn = document.createElement('input'); fileIn.type = 'file'; fileIn.accept = 'image/*'; fileIn.style.display = 'none';
    audioIn = document.createElement('input'); audioIn.type = 'file'; audioIn.accept = 'audio/*,.mp3,.m4a,.ogg,.wav'; audioIn.style.display = 'none';
    audioIn.onchange = () => { [...audioIn.files].forEach(addAudioFile); audioIn.value = ''; }; root.appendChild(audioIn);
    fileIn.onchange = () => { [...fileIn.files].forEach(addImageFile); fileIn.value = ''; }; root.appendChild(fileIn);
    wrap.addEventListener('dragover', e => e.preventDefault());
    wrap.addEventListener('drop', e => { e.preventDefault(); [...(e.dataTransfer.files || [])].forEach(addImageFile); });
    document.addEventListener('paste', e => { if (!S.open || !hasImage(e)) return; const it = [...e.clipboardData.items].find(i => i.type.startsWith('image/')); if (it) { e.preventDefault(); addImageFile(it.getAsFile()); } });
    const bar = root.querySelector('#wbBar');
    const mk = (t, f, cls) => { const b = document.createElement('button'); b.innerHTML = t; b.onclick = f; if (cls) b.className = cls; bar.appendChild(b); return b; };
    ui.pen = mk('✏️', () => setTool('pen')); ui.eraser = mk('🧽', () => setTool('eraser'));
    ui.sel = mk('🖐 Выбрать', () => setTool('select')); ui.text = mk('🔤 Текст', () => setTool('text'));
    ui.img = mk('🖼 Фото', () => canDraw() && fileIn.click()); ui.emb = mk('▶ Видео/аудио (ссылка)', addEmbed); ui.aud = mk('🔊 Аудио с компьютера', () => canDraw() && audioIn.click());
    ui.sw = COLORS.map(c => { const b = mk('', () => { S.color = c; if (S.tool === 'eraser' || S.tool === 'select') setTool('pen'); updateUI(); }, 'sw'); b.style.background = c; return b; });
    ui.sz = SIZES.map((s, i) => mk(['•', '●', '⬤'][i], () => { S.size = s; updateUI(); }));
    mk('↶', undoMine).title = 'Отменить мой последний штрих';
    bar.insertAdjacentHTML('beforeend', '<span class="sep"></span>');
    ui.prev = mk('◀', () => goPage(S.page - 1)); ui.pg = document.createElement('span'); ui.pg.style.cssText = 'color:#d4c9a8;font-size:.8em;min-width:46px;text-align:center'; bar.appendChild(ui.pg);
    ui.next = mk('▶', () => goPage(S.page + 1));
    ui.add = mk('＋ стр.', addPage); ui.del = mk('✂ Удалить стр.', deletePage); ui.clear = mk('🗑 Очистить', clearPage); ui.lock = mk('', toggleStudents);
    bar.insertAdjacentHTML('beforeend', '<span class="sp"></span>');
    ui.pdf = mk('📄 PDF', exportPDF); mk('✕', close);
    document.addEventListener('keydown', e => { if (S.open && e.key === 'Escape' && !(document.activeElement && document.activeElement.isContentEditable)) close(); });
  }
  function setTool(t) { S.tool = t; applyMode(); updateUI(); }
  function applyMode() {
    if (!wrap) return; const sel = S.tool === 'select';
    wrap.classList.toggle('sel', sel); over.style.pointerEvents = sel ? 'none' : 'auto';
    over.style.cursor = !canDraw() ? 'not-allowed' : (S.tool === 'text' ? 'text' : 'crosshair');
    layer.querySelectorAll('.wbo').forEach(el => el.classList.toggle('ro', !canDraw()));
    Object.keys(els).forEach(renderObj);
  }
  function updateUI() {
    if (!ui.pen) return; const t = isT();
    [['pen', ui.pen], ['eraser', ui.eraser], ['select', ui.sel], ['text', ui.text]].forEach(([n, b]) => b.classList.toggle('on', S.tool === n));
    ui.sw.forEach((b, i) => b.classList.toggle('on', COLORS[i] === S.color && (S.tool === 'pen' || S.tool === 'text')));
    ui.sz.forEach((b, i) => b.classList.toggle('on', SIZES[i] === S.size));
    ui.pg.textContent = `${S.page + 1} / ${S.count}`; ui.prev.disabled = S.page <= 0; ui.next.disabled = S.page >= S.count - 1;
    ui.add.style.display = ui.del.style.display = ui.clear.style.display = ui.lock.style.display = t ? '' : 'none';
    ui.lock.textContent = S.studentsDraw ? '🔓 Ученики пишут' : '🔒 Только учитель';
    root.querySelector('#wbHint').textContent = t
      ? 'Текст: «🔤 Текст» → клик по доске. Фото: кнопка, перетаскивание или Ctrl+V. Видео/аудио — по ссылке. Страницу, на которой ты, видят ученики. PDF = все страницы.'
      : (S.studentsDraw ? 'Рисуй, пиши («🔤 Текст» → клик), вставляй фото (кнопка, перетаскивание или Ctrl+V). Учитель может сохранить доску в PDF.' : 'Сейчас пишет только учитель.');
  }
  async function open() {
    if (!(await init())) { alert('Нет связи с Firebase'); return; }
    S.open = true; root.style.display = 'flex'; attach(S.page); S.k = wrap.clientWidth / W; layer.style.transform = `scale(${S.k})`;
    redraw(); renderAllObjs(); applyMode(); updateUI();
  }
  function close() { S.open = false; root.style.display = 'none'; }

  function boot() {
    build();
    setInterval(() => {
      if (S.ready && S.room !== rid()) { if (S.open) close(); teardown(); }
      ui.fab.style.display = (!S.open && inRoom()) ? 'block' : 'none';
    }, 1000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  window.SEBoard = { open, close };
})();
