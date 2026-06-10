/* ============================================================
   AVIS GALLERY — Z'Expert · pages/faq-avis.html
   Carrousel horizontal premium, inspiré Circular Gallery
   Vanilla JS — aucune dépendance externe
   ============================================================ */

(function () {
  'use strict';

  /* ── Références DOM ── */
  var stage      = document.getElementById('agStage');
  var dotsWrap   = document.getElementById('agDots');
  var counterEl  = document.getElementById('agCounter');
  var btnPrev    = document.getElementById('agPrev');
  var btnNext    = document.getElementById('agNext');
  if (!stage) return;

  var cards = Array.from(stage.querySelectorAll('.ag-card'));
  var N     = cards.length;
  var dots  = dotsWrap ? Array.from(dotsWrap.querySelectorAll('.ag-dot')) : [];

  /* ── Prefers-reduced-motion ── */
  var prefersReduced = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  /* ── Dimensions (recalculées au resize) ── */
  var CARD_W  = 380;  /* largeur carte */
  var CARD_H  = 448;  /* hauteur carte */
  var CARD_GAP = 32;  /* espace entre cartes */
  var CARD_STEP = CARD_W + CARD_GAP; /* pas de défilement par carte */

  function measureDimensions() {
    var sw = stage.offsetWidth;
    if (sw < 480) {
      CARD_W    = Math.round(sw * 0.91);
      CARD_H    = 460;
      CARD_GAP  = 16;
    } else if (sw < 768) {
      CARD_W    = Math.min(340, Math.round(sw * 0.88));
      CARD_H    = 450;
      CARD_GAP  = 16;
    } else if (sw < 1100) {
      CARD_W    = 340;
      CARD_H    = 440;
      CARD_GAP  = 24;
    } else {
      CARD_W    = 380;
      CARD_H    = 448;
      CARD_GAP  = 32;
    }
    CARD_STEP = CARD_W + CARD_GAP;

    /* Ajuster la hauteur CSS des cartes pour correspondre */
    cards.forEach(function (c) {
      c.style.width  = CARD_W + 'px';
      c.style.height = CARD_H + 'px';
    });
  }

  /* ── État du scroll ── */
  var scrollX  = 0;   /* position courante (lissée) */
  var targetX  = 0;   /* position cible */
  var raf      = null;
  var EASE     = prefersReduced ? 1 : 0.085;

  /* ── Déterminer l'index actif ── */
  var activeIndex = 0;

  function getActiveIndex() {
    return Math.round(scrollX / CARD_STEP);
  }

  /* ── Appliquer transforms à chaque carte ── */
  function applyTransforms() {
    var stageW = stage.offsetWidth;
    var stageH = stage.offsetHeight;
    var baseX  = (stageW - CARD_W) / 2; /* X de la carte centrée */
    var baseY  = (stageH - CARD_H) / 2; /* Y de base (centré verticalement) */
    var isMobile = stageW < 768;

    /* Facteurs d'effet selon breakpoint */
    var scaleRate   = isMobile ? 0.10 : 0.26;
    var opacityRate = isMobile ? 0.55 : 0.80;
    var arcRate     = isMobile ? 6    : 24;   /* pixels d'arc quadratique */
    var rotRate     = isMobile ? 4    : 12;   /* degrés de rotateY */
    var minScale    = isMobile ? 0.82 : 0.72;
    var minOpacity  = isMobile ? 0.35 : 0.12;

    cards.forEach(function (card, i) {
      /* Distance en pixels depuis le centre de défilement */
      var offset = i * CARD_STEP - scrollX;
      var normDist = offset / CARD_STEP;   /* distance normalisée (0 = centré) */
      var absNorm  = Math.abs(normDist);

      /* Masquer les cartes trop lointaines */
      if (absNorm > 3.5) {
        card.style.visibility = 'hidden';
        card.style.pointerEvents = 'none';
        return;
      }
      card.style.visibility = 'visible';

      /* Calcul des effets visuels */
      var scale   = Math.max(minScale, 1 - absNorm * scaleRate);
      var opacity = Math.max(minOpacity, 1 - absNorm * opacityRate);
      var rotY    = normDist * -rotRate;            /* degrés */
      var arcY    = absNorm * absNorm * arcRate;    /* px, arc parabolique vers le haut */

      /* Positions en px */
      var tx = baseX + offset;
      var ty = baseY - arcY;

      /* Composer le transform */
      var transform = 'translate(' + tx + 'px, ' + ty + 'px) '
        + 'perspective(1400px) '
        + 'rotateY(' + rotY + 'deg) '
        + 'scale(' + scale + ')';

      card.style.transform  = transform;
      card.style.opacity    = opacity;
      card.style.zIndex     = Math.round((1 - absNorm) * 10);
      card.style.pointerEvents = absNorm < 0.5 ? 'auto' : 'none';

      /* Shadow proportionnelle à l'échelle (CSS custom property) */
      card.style.setProperty('--ag-s', scale.toFixed(3));

      /* Classe is-active sur la carte centrale */
      var isActive = absNorm < 0.5;
      card.classList.toggle('is-active', isActive);
    });
  }

  /* ── RAF loop (lerp + render) ── */
  function tick() {
    var diff = targetX - scrollX;
    if (Math.abs(diff) < 0.05) {
      scrollX = targetX;
    } else {
      scrollX = prefersReduced ? targetX : (scrollX + diff * EASE);
    }
    applyTransforms();

    var newActive = getActiveIndex();
    if (newActive !== activeIndex) {
      activeIndex = Math.max(0, Math.min(N - 1, newActive));
      updateDots();
      updateCounter();
    }

    raf = requestAnimationFrame(tick);
  }

  /* ── Snap : aligner sur la carte la plus proche ── */
  function snap(force) {
    var idx = Math.round(targetX / CARD_STEP);
    idx = Math.max(0, Math.min(N - 1, idx));
    snapToIndex(idx, force);
  }

  function snapToIndex(idx, enableTransition) {
    idx = Math.max(0, Math.min(N - 1, idx));
    targetX = idx * CARD_STEP;
    if (enableTransition && !prefersReduced) {
      cards.forEach(function (c) { c.classList.add('is-snapping'); });
      setTimeout(function () {
        cards.forEach(function (c) { c.classList.remove('is-snapping'); });
      }, 560);
    }
    activeIndex = idx;
    updateDots();
    updateCounter();
  }

  /* ── Mise à jour dots ── */
  function updateDots() {
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === activeIndex);
    });
  }

  function updateCounter() {
    if (counterEl) {
      counterEl.textContent = (activeIndex + 1) + ' / ' + N;
    }
  }

  /* ── Drag / Swipe ── */
  var isDragging  = false;
  var dragStartX  = 0;
  var dragScrollX = 0;
  var lastDragX   = 0;
  var velocity    = 0;
  var lastTime    = 0;
  var DRAG_THRESHOLD = 6; /* px avant de considérer comme drag */
  var hasDragged  = false;

  function onPointerDown(e) {
    if (e.button !== undefined && e.button !== 0) return; /* souris gauche seulement */
    isDragging  = true;
    hasDragged  = false;
    dragStartX  = e.touches ? e.touches[0].clientX : e.clientX;
    dragScrollX = targetX;
    lastDragX   = dragStartX;
    velocity    = 0;
    lastTime    = Date.now();
    stage.classList.add('is-dragging');
    cards.forEach(function (c) { c.classList.remove('is-snapping'); });
  }

  function onPointerMove(e) {
    if (!isDragging) return;
    var clientX = e.touches ? e.touches[0].clientX : e.clientX;
    var delta   = dragStartX - clientX;

    if (!hasDragged && Math.abs(delta) > DRAG_THRESHOLD) {
      hasDragged = true;
    }
    if (!hasDragged) return;

    var now = Date.now();
    var dt  = Math.max(1, now - lastTime);
    velocity = (clientX - lastDragX) / dt;
    lastDragX = clientX;
    lastTime  = now;

    targetX = dragScrollX + delta;
    /* Rubber-band aux extrémités */
    var minX = 0;
    var maxX = (N - 1) * CARD_STEP;
    if (targetX < minX) targetX = minX + (targetX - minX) * 0.3;
    if (targetX > maxX) targetX = maxX + (targetX - maxX) * 0.3;
  }

  function onPointerUp() {
    if (!isDragging) return;
    isDragging = false;
    stage.classList.remove('is-dragging');

    if (!hasDragged) return;

    /* Inertie : projeter le scroll avec la vélocité */
    var projected = targetX - velocity * 80;
    var idx = Math.round(projected / CARD_STEP);
    snapToIndex(idx, true);
  }

  /* ── Événements souris ── */
  stage.addEventListener('mousedown',  onPointerDown);
  window.addEventListener('mousemove', onPointerMove);
  window.addEventListener('mouseup',   onPointerUp);
  stage.addEventListener('dragstart',  function (e) { e.preventDefault(); });

  /* ── Événements tactiles ── */
  stage.addEventListener('touchstart', onPointerDown, { passive: true });
  window.addEventListener('touchmove',  onPointerMove, { passive: true });
  window.addEventListener('touchend',   onPointerUp);

  /* ── Molette souris ── */
  var wheelTimer = null;
  stage.addEventListener('wheel', function (e) {
    e.preventDefault();
    var delta = e.deltaX || e.deltaY;
    targetX += delta * 0.6;
    targetX = Math.max(0, Math.min((N - 1) * CARD_STEP, targetX));
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(function () { snap(true); }, 200);
  }, { passive: false });

  /* ── Boutons prev / next ── */
  if (btnPrev) {
    btnPrev.addEventListener('click', function () {
      snapToIndex(activeIndex - 1, true);
    });
  }
  if (btnNext) {
    btnNext.addEventListener('click', function () {
      snapToIndex(activeIndex + 1, true);
    });
  }

  /* ── Dots ── */
  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      var idx = parseInt(dot.dataset.goto, 10);
      snapToIndex(idx, true);
    });
  });

  /* ── Accessibilité clavier ── */
  stage.setAttribute('tabindex', '0');
  stage.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   { e.preventDefault(); snapToIndex(activeIndex - 1, true); }
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown')  { e.preventDefault(); snapToIndex(activeIndex + 1, true); }
    if (e.key === 'Home')  { e.preventDefault(); snapToIndex(0, true); }
    if (e.key === 'End')   { e.preventDefault(); snapToIndex(N - 1, true); }
  });

  /* ── Resize ── */
  var resizeTimer = null;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      measureDimensions();
      /* Repositionner sans animation */
      scrollX = targetX = activeIndex * CARD_STEP;
      applyTransforms();
    }, 150);
  });

  /* ── Init ── */
  measureDimensions();
  scrollX = 0;
  targetX = 0;
  updateDots();
  updateCounter();
  tick(); /* démarre le RAF loop */

})();
