/* Ortak ürün slider — anasayfa + ürün detay */
(function () {
  function initProductSlider(viewport) {
    const root =
      viewport.closest("[data-product-slider]") ||
      viewport.closest(".bestsellers") ||
      viewport.closest(".product-detail__more") ||
      document;

    const track = root.querySelector("[data-bestsellers-track]");
    const prevBtn = root.querySelector("[data-bestsellers-prev]");
    const nextBtn = root.querySelector("[data-bestsellers-next]");
    if (!track || !prevBtn || !nextBtn) return;

    const slides = Array.prototype.slice.call(track.querySelectorAll(".bestsellers__slide"));
    if (!slides.length) return;

    function rand(min, max, step) {
      const n = min + Math.random() * (max - min);
      return Math.round(n / step) * step;
    }

    const itemSettings = slides.map(function (slide, index) {
      const el = slide.querySelector(".product-card") || slide;
      const direction = index % 2 === 0 ? -1 : 1;
      el.style.willChange = "transform";
      return {
        slide: slide,
        el: el,
        rotation: rand(1.5, 3, 0.1) * direction,
        yOffset: rand(3, 9, 0.1) * direction
      };
    });

    let current = 0;
    let target = 0;
    let maxScroll = 0;
    let stride = 0;
    let isDragging = false;
    let isPointerDown = false;
    let isTouching = false;
    let dragStartX = 0;
    let dragStartTarget = 0;
    let touchStartX = 0;
    let touchStartY = 0;
    let scrollDirection = null;
    let didDrag = false;
    let lastTs = 0;
    const DRAG_THRESHOLD = 6;
    const lerpAttr = root.getAttribute("data-slider-lerp");
    const LERP = lerpAttr && !isNaN(parseFloat(lerpAttr)) ? parseFloat(lerpAttr) : 0.225;
    const BOUNCE = 40;

    function clamp(v, min, max) {
      return Math.max(min, Math.min(max, v));
    }

    function damp(a, b, lambda, dt) {
      return a + (b - a) * (1 - Math.exp(-lambda * dt));
    }

    function measure() {
      const styles = getComputedStyle(track);
      const gap = parseFloat(styles.columnGap || styles.gap) || 16;
      stride = slides[0].getBoundingClientRect().width + gap;
      let total = 0;
      slides.forEach(function (s, i) {
        total += s.getBoundingClientRect().width;
        if (i < slides.length - 1) total += gap;
      });
      const pad = parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight) || 0;
      maxScroll = Math.max(0, total - (viewport.clientWidth - pad) + 32);
      target = clamp(target, -maxScroll, 0);
      current = clamp(current, -maxScroll - BOUNCE, BOUNCE);
    }

    function applyX() {
      slides.forEach(function (slide) {
        slide.style.transform = "translate3d(" + current.toFixed(2) + "px,0,0)";
      });
    }

    function applyParallax() {
      const wrapRect = viewport.getBoundingClientRect();
      const wrapCenter = wrapRect.left + wrapRect.width / 2;
      const maxDistance = wrapRect.width / 2 || 1;

      itemSettings.forEach(function (item) {
        const rect = item.el.getBoundingClientRect();
        const norm = (rect.left + rect.width / 2 - wrapCenter) / maxDistance;
        const strength = Math.sin(clamp(norm, -2, 2) * 1.2);
        item.el.style.transform =
          "translateY(" + (strength * item.yOffset).toFixed(3) + "%) rotate(" + (strength * item.rotation).toFixed(3) + "deg)";
      });
    }

    function progress() {
      if (maxScroll <= 0) return 1;
      return clamp(-target / maxScroll, 0, 1);
    }

    function updateArrows() {
      prevBtn.disabled = progress() <= 0.02 && target >= -2;
      nextBtn.disabled = progress() >= 0.95;
      prevBtn.classList.toggle("is-disabled", prevBtn.disabled);
      nextBtn.classList.toggle("is-disabled", nextBtn.disabled);
    }

    prevBtn.addEventListener("click", function () {
      target = clamp(Math.round((target + stride) / stride) * stride, -maxScroll, 0);
    });
    nextBtn.addEventListener("click", function () {
      target = clamp(Math.round((target - stride) / stride) * stride, -maxScroll, 0);
    });

    function beginPointer(clientX) {
      isPointerDown = true;
      isDragging = false;
      didDrag = false;
      dragStartX = clientX;
      dragStartTarget = target;
    }

    function movePointer(clientX, event) {
      if (!isPointerDown) return;
      const dx = clientX - dragStartX;
      if (!isDragging && Math.abs(dx) >= DRAG_THRESHOLD) {
        isDragging = true;
        didDrag = true;
        viewport.classList.add("is-dragging");
      }
      if (!isDragging) return;
      if (event) event.preventDefault();
      let next = dragStartTarget + dx;
      if (next > BOUNCE) next = BOUNCE;
      else if (next < -maxScroll - BOUNCE) next = -maxScroll - BOUNCE;
      target = next;
    }

    function endPointer() {
      if (!isPointerDown) return;
      isPointerDown = false;
      if (isDragging) {
        viewport.classList.remove("is-dragging");
        if (target > 0) target = 0;
        else if (target < -maxScroll) target = -maxScroll;
      }
      isDragging = false;
    }

    function isBlockedTarget(el) {
      return !!el.closest("select, button, input, label, textarea");
    }

    track.querySelectorAll("img, a").forEach(function (el) {
      el.setAttribute("draggable", "false");
      if (el.tagName === "IMG") el.draggable = false;
    });

    viewport.addEventListener("mousedown", function (e) {
      if (e.button !== 0) return;
      if (isBlockedTarget(e.target)) return;
      beginPointer(e.clientX);
      if (!e.target.closest("a")) e.preventDefault();
    });

    window.addEventListener("mousemove", function (e) {
      if (!isPointerDown || isTouching) return;
      movePointer(e.clientX, e);
    });

    window.addEventListener("mouseup", function () {
      if (!isTouching) endPointer();
    });

    viewport.addEventListener("click", function (e) {
      if (!didDrag) return;
      if (e.target.closest("a")) {
        e.preventDefault();
        e.stopPropagation();
      }
      didDrag = false;
    }, true);

    viewport.addEventListener("touchstart", function (e) {
      if (isBlockedTarget(e.target)) return;
      const t = e.touches[0];
      touchStartX = t.clientX;
      touchStartY = t.clientY;
      scrollDirection = null;
      isTouching = true;
      beginPointer(t.clientX);
    }, { passive: true });

    window.addEventListener("touchmove", function (e) {
      if (!isTouching || !isPointerDown) return;
      const t = e.touches[0];
      const dx = Math.abs(t.clientX - touchStartX);
      const dy = Math.abs(t.clientY - touchStartY);
      if (!scrollDirection && (dx > 5 || dy > 5)) {
        scrollDirection = dx > dy ? "horizontal" : "vertical";
      }
      if (scrollDirection === "horizontal") {
        movePointer(t.clientX, e);
      } else if (scrollDirection === "vertical") {
        isPointerDown = false;
        isDragging = false;
        didDrag = false;
        viewport.classList.remove("is-dragging");
      }
    }, { passive: false });

    window.addEventListener("touchend", function () {
      isTouching = false;
      scrollDirection = null;
      endPointer();
    });

    addEventListener("resize", function () {
      measure();
      applyX();
      applyParallax();
      updateArrows();
    });

    function tick(ts) {
      const dt = lastTs ? Math.min(0.05, (ts - lastTs) / 1000) : 0.016;
      lastTs = ts;
      current = damp(current, target, 1 / LERP, dt);
      applyX();
      applyParallax();
      updateArrows();
      requestAnimationFrame(tick);
    }

    measure();
    applyX();
    applyParallax();
    updateArrows();
    requestAnimationFrame(tick);
  }

  document.querySelectorAll("[data-bestsellers-slider]").forEach(initProductSlider);
})();
