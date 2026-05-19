/* ============================================================
   Z'Expert — script.js
   Parallax hero · Stagger grids · Smooth scroll ancres
   ============================================================ */

/* ── Parallax hero ── */
(function () {
  const heroBg = document.getElementById('heroBg');
  if (!heroBg) return;

  let ticking = false;

  function applyParallax() {
    if (window.innerWidth < 768) {
      heroBg.style.transform = '';
    } else {
      heroBg.style.transform = 'translateY(' + (window.scrollY * 0.38) + 'px)';
    }
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(applyParallax);
      ticking = true;
    }
  }, { passive: true });
})();

/* ── Stagger delay sur les grilles de cartes ── */
(function () {
  var grids = [
    { selector: '.services-grid .service-card',    base: 0.06 },
    { selector: '.avantages-grid .avantage-card',  base: 0.06 },
    { selector: '.process-grid .process-card',     base: 0.08 },
    { selector: '.confiance-grid .confiance-bloc', base: 0.10 }
  ];
  grids.forEach(function (g) {
    document.querySelectorAll(g.selector).forEach(function (el, i) {
      var existing = parseFloat(el.style.transitionDelay) || 0;
      if (!existing) el.style.transitionDelay = (i * g.base) + 's';
    });
  });
})();

/* ── Smooth scroll ancres ── */
document.querySelectorAll('a[href^="#"]').forEach(function (link) {
  link.addEventListener('click', function (e) {
    var id = link.getAttribute('href').slice(1);
    var target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    var offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
    var top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: top, behavior: 'smooth' });
  });
});
