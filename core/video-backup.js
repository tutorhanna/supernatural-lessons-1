// ============================================================
// ЗАПАСНОЕ ВИДЕО (YouTube): по умолчанию скрыто у всех. Учитель включает его кнопкой — тогда оно появляется
// у всех учеников и команды play/pause/seek идут на YouTube вместо VK (чтобы не звучали оба плеера).
// Состояние синхронизируется через rooms/<roomId>/ui/ytBackup.
// ============================================================
(function () {
  window.ytBackupVisible = false;
  let watched = '', unsub = null;

  function paint() {
    const el = document.getElementById('ytBackupBlock'); if (el) el.style.display = window.ytBackupVisible ? 'block' : 'none';
    const b = document.getElementById('ytBackupBtn');
    if (b) b.textContent = window.ytBackupVisible ? '📺 YouTube-запас: ВКЛ (нажми, чтобы скрыть)' : '📺 Включить запасное видео YouTube для всех';
  }
  function setVisible(v) {
    v = !!v; if (v === window.ytBackupVisible) { paint(); return; }
    window.ytBackupVisible = v;
    if (v) { try { if (typeof vkPlayer !== 'undefined' && vkPlayer && vkPlayer.pause) vkPlayer.pause(); } catch (e) {} }      // VK замолкает
    else { try { if (typeof ytPlayer !== 'undefined' && ytPlayer && ytPlayer.pauseVideo) ytPlayer.pauseVideo(); } catch (e) {} } // YouTube замолкает
    paint();
  }
  window.toggleYtBackup = function () {
    if (typeof isTeacher === 'undefined' || !isTeacher || !window.__FB || typeof roomId === 'undefined' || !roomId) return;
    const v = !window.ytBackupVisible; setVisible(v);
    const fb = window.__FB; fb.set(fb.ref(fb.db, `rooms/${roomId}/ui/ytBackup`), v).catch(() => {});
  };

  // следим за состоянием в текущей комнате (и при её смене)
  setInterval(() => {
    const fb = window.__FB, id = (typeof roomId !== 'undefined' && roomId) || '';
    if (!fb || id === watched) return;
    if (typeof unsub === 'function') unsub(); unsub = null; watched = id; setVisible(false);
    if (id) unsub = fb.onValue(fb.ref(fb.db, `rooms/${id}/ui/ytBackup`), s => setVisible(s.val() === true));
  }, 800);
  document.addEventListener('DOMContentLoaded', paint);
})();
