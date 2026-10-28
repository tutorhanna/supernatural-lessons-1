// ============================================================
// ЗАЩИТА ОТ «ВОСКРЕСШИХ» КОМНАТ
// Пока страница знает, что текущую комнату удалили (её meta исчезла), любые записи ВНУТРЬ этой комнаты
// (скролл, видео-команды, ответы, доска, heartbeat) тихо отбрасываются — комната не создаётся заново.
// Создание комнаты (запись rooms/<id>/meta) всегда разрешено.
// ============================================================
(function () {
  const gone = new Set(); let watched = '', unsub = null, seen = false;
  const inside = r => { const m = /\/rooms\/([^\/?#]*)\/./.exec(String(r)); return m ? decodeURIComponent(m[1]) : null; };
  const isMeta = r => /\/rooms\/[^\/?#]+\/meta\/?$/.test(String(r));

  function wrap() {
    const fb = window.__FB; if (!fb) return false; if (fb.__guarded) return true;
    const guard = fn => function (r, ...a) {
      const id = inside(r);
      if (id !== null && (id === '' || (gone.has(id) && !isMeta(r)))) return Promise.resolve();
      const res = fn.call(fb, r, ...a); if (id && isMeta(r)) gone.delete(id); return res;
    };
    const set = fb.set, update = fb.update, push = fb.push;
    fb.set = guard(set); fb.update = guard(update);
    fb.push = function (r, v) { return v === undefined ? push.call(fb, r) : guard(push)(r, v); };
    fb.markGone = id => gone.add(id); fb.__guarded = true;
    setInterval(watch, 1500); watch(); return true;
  }
  function watch() {
    const fb = window.__FB, id = (typeof roomId !== 'undefined' && roomId) || '';
    if (id === watched) return;
    if (typeof unsub === 'function') unsub(); unsub = null; watched = id; seen = false;
    if (!id) return;
    unsub = fb.onValue(fb.ref(fb.db, `rooms/${id}/meta`), s => {
      if (s.exists()) { seen = true; gone.delete(id); } else if (seen) gone.add(id);
    });
  }
  const t = setInterval(() => { if (wrap()) clearInterval(t); }, 100);
})();
