// Плавное появление блоков при прокрутке страницы.
// Работает через IntersectionObserver: как только блок с классом
// "reveal" появляется в зоне видимости, к нему добавляется класс
// "is-visible", который запускает CSS-переход (см. styles.css).
document.addEventListener('DOMContentLoaded', function () {
  var targets = document.querySelectorAll('.reveal');
  if (!targets.length) return;

  // Если у пользователя включена настройка "уменьшить анимацию" —
  // просто показываем всё сразу, без эффекта.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    targets.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }

  // Если браузер совсем старый и не поддерживает IntersectionObserver —
  // тоже просто показываем всё сразу, чтобы контент не потерялся.
  if (!('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  targets.forEach(function (el) { observer.observe(el); });
});
