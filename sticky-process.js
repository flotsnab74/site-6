// Подсветка текущего этапа в блоке "Как это работает" (главная
// страница). Пока пользователь прокручивает список из 8 шагов
// справа, слева в закреплённом списке подсвечивается тот шаг,
// который сейчас находится в центре экрана.
//
// Если по какой-то причине скрипт не сработает (старый браузер,
// ошибка) — все шаги остаются полностью видимыми и читаемыми,
// просто без медной подсветки текущего. Ничего не ломается.
document.addEventListener('DOMContentLoaded', function () {
  var steps = document.querySelectorAll('.sticky-step');
  var progressItems = document.querySelectorAll('.sticky-progress-item');
  if (!steps.length || !progressItems.length) return;

  function setActive(stepNumber) {
    progressItems.forEach(function (item) {
      item.classList.toggle('is-active', item.dataset.step === stepNumber);
    });
    steps.forEach(function (step) {
      step.classList.toggle('is-active', step.dataset.step === stepNumber);
    });
  }

  // Подсвечиваем первый шаг сразу, до начала прокрутки.
  setActive('1');

  if (!('IntersectionObserver' in window)) return;

  // Узкая полоса-триггер по центру экрана: активным считается тот
  // шаг, который сейчас её пересекает.
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        setActive(entry.target.dataset.step);
      }
    });
  }, { threshold: 0, rootMargin: '-40% 0px -40% 0px' });

  steps.forEach(function (step) { observer.observe(step); });
});
