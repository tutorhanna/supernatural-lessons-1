// Высота фиксированной верхней панели → CSS-переменная --bar-h (для точного попадания якорей на заголовок)
(function () {
  function measure() {
    let h = 0;
    document.querySelectorAll('body *').forEach(el => {
      if (el.id === 'wbRoot' || el.id === 'wbFab') return;
      const cs = getComputedStyle(el);
      if (cs.position !== 'fixed' || cs.display === 'none' || cs.visibility === 'hidden') return;
      const r = el.getBoundingClientRect();
      if (r.top <= 8 && r.height > 20 && r.height < 220 && r.width > window.innerWidth * 0.5) h = Math.max(h, r.bottom);
    });
    document.documentElement.style.setProperty('--bar-h', Math.round(h || 90) + 'px');
  }
  window.addEventListener('load', measure); window.addEventListener('resize', measure);
  setInterval(measure, 1500);
  // клик по ссылке меню: ждём, пока картинки/раскладка устаканятся, и докручиваем точно
  document.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a[href^="#"]'); if (!a) return;
    const id = decodeURIComponent(a.getAttribute('href').slice(1)); const el = id && document.getElementById(id); if (!el) return;
    e.preventDefault(); measure();
    const go = () => window.scrollTo({ top: Math.max(0, el.getBoundingClientRect().top + window.scrollY - (parseInt(getComputedStyle(document.documentElement).getPropertyValue('--bar-h')) || 90) - 16), behavior: 'auto' });
    go(); setTimeout(go, 350); setTimeout(go, 1000);
    try { history.replaceState(null, '', '#' + id); } catch (_) {}
  });
})();
