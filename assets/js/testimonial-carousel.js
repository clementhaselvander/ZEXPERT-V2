/* ============================================================
   TESTIMONIAL SHUFFLE CAROUSEL — Z'Expert
   Vanilla JS — pas de dépendances externes
   Pattern inspiré ShuffleCards / 21st.dev
   ============================================================ */

(function () {
  'use strict';

  var stack      = document.getElementById('tsStack');
  var pagination = document.getElementById('tsPagination');
  if (!stack) return;

  var cards      = Array.from(stack.querySelectorAll('.ts-card'));
  var dots       = pagination ? Array.from(pagination.querySelectorAll('.ts-dot')) : [];
  var N          = cards.length;

  /* ── État ── */
  var activeIndex  = 0;
  var isDragging   = false;
  var isFlyingOut  = false;
  var dragStartX   = 0;
  var dragStartY   = 0;
  var dragOffsetX  = 0;
  var dragOffsetY  = 0;
  var autoplayTimer = null;
  var DRAG_THRESHOLD = 80;    /* px pour déclencher le flip */
  var AUTOPLAY_DELAY = 5000;  /* ms entre chaque carte */

  /* ── prefers-reduced-motion ── */
  var prefersReduced = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  /* ── Positions selon l'ordre d'affichage (0 = devant) ──
     On alterne légèrement les rotations des cartes du fond
     pour l'effet "pile de cartes naturelle". */
  function getPositionStyles(displayOrder) {
    if (displayOrder === 0) {
      /* Carte active — devant */
      return {
        transform: 'translateX(0px) translateY(0px) rotate(0deg) scale(1)',
        opacity: '1',
        zIndex: String(N + 2),
        pointerEvents: 'auto'
      };
    } else if (displayOrder === 1) {
      /* 1ère carte derrière — légèrement décalée droite, rotation +4° */
      return {
        transform: 'translateX(9px) translateY(9px) rotate(4deg) scale(0.965)',
        opacity: '0.88',
        zIndex: String(N + 1),
        pointerEvents: 'none'
      };
    } else if (displayOrder === 2) {
      /* 2ème carte derrière — décalée gauche, rotation -2.5° */
      return {
        transform: 'translateX(-5px) translateY(17px) rotate(-2.5deg) scale(0.93)',
        opacity: '0.62',
        zIndex: String(N),
        pointerEvents: 'none'
      };
    } else {
      /* Cartes cachées */
      return {
        transform: 'translateX(0px) translateY(28px) rotate(0deg) scale(0.88)',
        opacity: '0',
        zIndex: '0',
        pointerEvents: 'none'
      };
    }
  }

  /* ── Applique les positions à toutes les cartes ── */
  function applyPositions(dragX, dragY) {
    dragX = dragX || 0;
    dragY = dragY || 0;

    cards.forEach(function (card, index) {
      var displayOrder = (index - activeIndex + N) % N;
      var styles = getPositionStyles(displayOrder);

      if (displayOrder === 0 && (isDragging || dragX !== 0)) {
        /* Pendant le drag : rotation proportionnelle au déplacement */
        var rotDeg   = dragX * 0.07;
        var liftY    = Math.abs(dragX) * -0.06;
        styles.transform = 'translateX(' + dragX + 'px) translateY(' + (dragY * 0.12 + liftY) + 'px) rotate(' + rotDeg + 'deg) scale(1)';
      }

      card.style.transform     = styles.transform;
      card.style.opacity       = styles.opacity;
      card.style.zIndex        = styles.zIndex;
      card.style.pointerEvents = styles.pointerEvents;
    });
  }

  /* ── Met à jour les dots ── */
  function updateDots() {
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === activeIndex);
    });
  }

  /* ── Marque la carte active ── */
  function updateActiveClass() {
    cards.forEach(function (card, i) {
      card.classList.toggle('is-active', i === activeIndex);
    });
  }

  /* ── Navigation vers un index ── */
  function navigate(newIndex) {
    activeIndex = ((newIndex % N) + N) % N;
    applyPositions(0, 0);
    updateDots();
    updateActiveClass();
  }

  /* ── Animation "fly-out" quand drag dépasse le seuil ── */
  function flyOut(direction) {
    if (isFlyingOut) return;
    isFlyingOut = true;

    var card        = cards[activeIndex];
    var flyX        = direction * 130; /* % */
    var flyRotate   = direction * 28;

    pauseAutoplay();

    if (!prefersReduced) {
      card.classList.add('is-flying-out');
      card.style.transform = 'translateX(' + flyX + '%) rotate(' + flyRotate + 'deg) scale(0.92)';
      card.style.opacity   = '0';

      setTimeout(function () {
        card.classList.remove('is-flying-out');
        /* La carte va en fond de pile — on retire la transition pour reset invisible */
        card.style.transition = 'none';
        /* On avance d'abord, puis on replace la carte */
        navigate(activeIndex + 1);

        requestAnimationFrame(function () {
          /* Réactive la transition au prochain frame */
          requestAnimationFrame(function () {
            card.style.transition = '';
            isFlyingOut = false;
            startAutoplay();
          });
        });
      }, 400);
    } else {
      /* Reduced motion : changement immédiat sans animation */
      navigate(activeIndex + 1);
      isFlyingOut = false;
      startAutoplay();
    }
  }

  /* ── Drag / Swipe ── */
  function onDragStart(e) {
    if (isFlyingOut) return;
    var activeCard = cards[activeIndex];
    var target     = e.target.closest ? e.target.closest('.ts-card') : null;
    if (!target || target !== activeCard) return;

    isDragging  = true;
    dragStartX  = e.touches ? e.touches[0].clientX : e.clientX;
    dragStartY  = e.touches ? e.touches[0].clientY : e.clientY;
    dragOffsetX = 0;
    dragOffsetY = 0;

    activeCard.classList.add('is-dragging');
    pauseAutoplay();
  }

  function onDragMove(e) {
    if (!isDragging) return;
    var clientX = e.touches ? e.touches[0].clientX : e.clientX;
    var clientY = e.touches ? e.touches[0].clientY : e.clientY;
    dragOffsetX = clientX - dragStartX;
    dragOffsetY = clientY - dragStartY;
    applyPositions(dragOffsetX, dragOffsetY);
  }

  function onDragEnd() {
    if (!isDragging) return;
    var activeCard = cards[activeIndex];
    activeCard.classList.remove('is-dragging');
    isDragging = false;

    if (Math.abs(dragOffsetX) >= DRAG_THRESHOLD) {
      /* Assez de déplacement : fly-out vers la direction du drag */
      flyOut(dragOffsetX < 0 ? -1 : 1);
    } else {
      /* Pas assez : snap back */
      applyPositions(0, 0);
      startAutoplay();
    }

    dragOffsetX = 0;
    dragOffsetY = 0;
  }

  /* ── Autoplay ── */
  function startAutoplay() {
    if (prefersReduced) return;
    clearTimeout(autoplayTimer);
    autoplayTimer = setTimeout(function () {
      if (!isDragging && !isFlyingOut) {
        flyOut(-1); /* avance vers la gauche */
      }
    }, AUTOPLAY_DELAY);
  }

  function pauseAutoplay() {
    clearTimeout(autoplayTimer);
  }

  /* ── Pause au hover/focus ── */
  stack.addEventListener('mouseenter', pauseAutoplay);
  stack.addEventListener('mouseleave', function () {
    if (!isDragging && !isFlyingOut) startAutoplay();
  });

  /* ── Événements souris ── */
  stack.addEventListener('mousedown',  onDragStart);
  window.addEventListener('mousemove', onDragMove);
  window.addEventListener('mouseup',   onDragEnd);
  stack.addEventListener('dragstart',  function (e) { e.preventDefault(); });

  /* ── Événements tactiles ── */
  stack.addEventListener('touchstart', onDragStart, { passive: true });
  window.addEventListener('touchmove',  onDragMove,  { passive: true });
  window.addEventListener('touchend',   onDragEnd);

  /* ── Clics sur les dots ── */
  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      pauseAutoplay();
      navigate(parseInt(dot.dataset.goto, 10));
      startAutoplay();
    });
  });

  /* ── Boutons prev / next (si présents) ── */
  var btnPrev = document.getElementById('tsPrev');
  var btnNext = document.getElementById('tsNext');
  if (btnPrev) {
    btnPrev.addEventListener('click', function () {
      pauseAutoplay();
      navigate(activeIndex - 1);
      startAutoplay();
    });
  }
  if (btnNext) {
    btnNext.addEventListener('click', function () {
      pauseAutoplay();
      flyOut(-1);
    });
  }

  /* ── Accessibilité clavier sur la carte active ── */
  cards.forEach(function (card) {
    card.setAttribute('tabindex', '0');
    card.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')    { pauseAutoplay(); navigate(activeIndex - 1); startAutoplay(); }
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown')  { pauseAutoplay(); flyOut(-1); }
    });
  });

  /* ── Rendu initial ── */
  applyPositions(0, 0);
  updateDots();
  updateActiveClass();
  startAutoplay();

})();
