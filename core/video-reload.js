// Кнопка «Перезагрузить видео»: пересоздаёт только плеер VK (новый iframe), страница и ответы остаются на месте.
(function () {
  window.reloadVkVideo = function () {
    const old = document.getElementById('vkVideo'); if (!old) return;
    const base = (old.dataset.baseSrc = old.dataset.baseSrc || old.getAttribute('src')).replace(/&_r=\d+/, '');
    const btn = document.querySelector('.video-reload-btn');
    try { vkPlayerReady = false; vkPlayer = null; } catch (e) {}
    if (btn) { btn.disabled = true; btn.textContent = '⏳ Перезагружаю…'; }
    const fresh = old.cloneNode(false);                         // тот же iframe (id, размеры, allow) — но новый, с чистого листа
    fresh.dataset.baseSrc = base; fresh.style.visibility = 'hidden';
    fresh.setAttribute('src', base + '&_r=' + Date.now());      // чтобы браузер не отдал «зависшую» версию из кэша
    let done = false;
    const finish = () => { if (done) return; done = true; fresh.style.visibility = 'visible';
      if (btn) { btn.disabled = false; btn.textContent = '🔄 Перезагрузить видео'; }
      setTimeout(() => { try { initVKPlayer(10); } catch (e) {} }, 700); };
    fresh.addEventListener('load', finish, { once: true }); setTimeout(finish, 9000);
    old.replaceWith(fresh);
  };
})();
