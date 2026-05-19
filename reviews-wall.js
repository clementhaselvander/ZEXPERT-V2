(function () {
  const wall = document.querySelector("[data-reviews-wall]");

  if (!wall) {
    return;
  }

  const setupTrack = (track) => {
    const originalCards = Array.from(track.children).filter(
      (child) => !child.hasAttribute("data-review-clone")
    );

    if (!originalCards.length) {
      return;
    }

    track.querySelectorAll("[data-review-clone]").forEach((clone) => clone.remove());

    const fragment = document.createDocumentFragment();

    originalCards.forEach((card) => {
      const clone = card.cloneNode(true);
      clone.setAttribute("data-review-clone", "true");
      clone.setAttribute("aria-hidden", "true");
      fragment.appendChild(clone);
    });

    track.appendChild(fragment);

    requestAnimationFrame(() => {
      const firstClone = track.querySelector("[data-review-clone]");
      const distance = firstClone ? firstClone.offsetTop : track.scrollHeight / 2;
      track.style.setProperty("--scroll-distance", `${distance}px`);
    });
  };

  const setupWall = () => {
    wall.querySelectorAll(".zx-reviews-track").forEach(setupTrack);
  };

  const refresh = () => {
    window.requestAnimationFrame(setupWall);
  };

  setupWall();
  window.addEventListener("load", refresh, { once: true });

  let resizeTimer = 0;
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(refresh, 180);
  });

  wall.addEventListener("mouseenter", () => {
    wall.classList.add("is-paused");
  });

  wall.addEventListener("mouseleave", () => {
    wall.classList.remove("is-paused");
  });
})();
