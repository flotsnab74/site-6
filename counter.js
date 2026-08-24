// Animated count-up for numeric stat cells. Triggers once, when the
// element scrolls into view, matching the timing feel of reveal.js.
(function () {
  var targets = document.querySelectorAll('[data-count-to]');
  if (!targets.length) return;

  function animate(el) {
    var to = parseFloat(el.getAttribute('data-count-to'));
    var suffix = el.getAttribute('data-count-suffix') || '';
    var duration = 1100;
    var start = null;

    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      var value = Math.round(eased * to);
      el.textContent = value + suffix;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = to + suffix;
      }
    }
    requestAnimationFrame(step);
  }

  if (!('IntersectionObserver' in window)) {
    targets.forEach(function (el) {
      el.textContent = el.getAttribute('data-count-to') + (el.getAttribute('data-count-suffix') || '');
    });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        animate(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  targets.forEach(function (el) {
    el.classList.add('is-counting');
    el.textContent = '0' + (el.getAttribute('data-count-suffix') || '');
    observer.observe(el);
  });
})();
