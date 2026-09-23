/* Hızlı satın al modal — ürün kartı verisini data-* ile okur */
(function () {
  const modal = document.getElementById("quickBuy");
  if (!modal) return;

  const dialog = modal.querySelector(".quick-buy__dialog");
  const closeBtns = modal.querySelectorAll("[data-quick-close]");
  const imgEl = modal.querySelector("[data-qb-img]");
  const discEl = modal.querySelector("[data-qb-disc]");
  const flavorEl = modal.querySelector("[data-qb-flavor]");
  const giftEl = modal.querySelector("[data-qb-gift]");
  const giftImgEl = modal.querySelector("[data-qb-gift-img]");
  const giftTextEl = modal.querySelector("[data-qb-gift-text]");
  const titleEl = modal.querySelector("[data-qb-title]");
  const catEl = modal.querySelector("[data-qb-cat]");
  const ratingEl = modal.querySelector("[data-qb-rating]");
  const starsEl = modal.querySelector("[data-qb-stars]");
  const reviewsEl = modal.querySelector("[data-qb-reviews]");
  const sizeWrap = modal.querySelector("[data-qb-size-wrap]");
  const sizeEl = modal.querySelector("[data-qb-size]");
  const oldEl = modal.querySelector("[data-qb-old]");
  const promoEl = modal.querySelector("[data-qb-promo]");
  const nowEl = modal.querySelector("[data-qb-now]");
  const saveEl = modal.querySelector("[data-qb-save]");
  const cartBtn = modal.querySelector("[data-qb-cart]");
  let lastFocus = null;

  function show(el, on) {
    if (!el) return;
    el.hidden = !on;
  }

  function stars(n) {
    const full = Math.max(0, Math.min(5, parseInt(n, 10) || 0));
    return "★★★★★".slice(0, full) + "☆☆☆☆☆".slice(0, 5 - full);
  }

  function openFrom(btn) {
    lastFocus = btn;
    const d = btn.dataset;

    if (imgEl) {
      imgEl.src = d.img || "";
      imgEl.alt = d.name || "";
    }
    if (titleEl) titleEl.textContent = d.name || "";
    if (catEl) {
      catEl.textContent = d.cat || "";
      show(catEl, !!d.cat);
    }

    if (discEl) {
      discEl.textContent = d.disc || "";
      show(discEl, !!d.disc);
    }
    show(flavorEl, d.flavor === "1");

    if (giftEl) {
      const hasGift = !!d.gift;
      show(giftEl, hasGift);
      if (hasGift) {
        if (giftTextEl) giftTextEl.textContent = d.gift;
        if (giftImgEl) {
          giftImgEl.src = d.giftImg || d.img || "";
          show(giftImgEl, !!(d.giftImg || d.img));
        }
      }
    }

    if (ratingEl) {
      const hasRating = !!d.reviews;
      show(ratingEl, hasRating);
      if (hasRating) {
        if (starsEl) starsEl.textContent = stars(d.rating || "5");
        if (reviewsEl) reviewsEl.textContent = "(" + d.reviews + ")";
      }
    }

    if (sizeWrap && sizeEl) {
      const sizes = (d.sizes || "").split("|").map(function (s) { return s.trim(); }).filter(Boolean);
      sizeEl.innerHTML = "";
      if (sizes.length) {
        sizes.forEach(function (s) {
          const opt = document.createElement("option");
          opt.value = s;
          opt.textContent = s;
          if (d.size && d.size === s) opt.selected = true;
          sizeEl.appendChild(opt);
        });
        if (!d.size) sizeEl.selectedIndex = 0;
        show(sizeWrap, true);
      } else {
        show(sizeWrap, false);
      }
    }

    const hasOld = !!d.old;
    const hasPromo = d.promo === "1";
    const hasSave = !!d.save;
    if (oldEl) {
      oldEl.textContent = d.old || "";
      show(oldEl, hasOld);
    }
    if (promoEl) show(promoEl, hasPromo);
    if (nowEl) nowEl.textContent = d.price || "";
    if (saveEl) {
      saveEl.textContent = d.save || "";
      show(saveEl, hasSave);
    }
    if (nowEl) nowEl.classList.toggle("is-now", hasOld || hasPromo);

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-quick-buy-open");
    const focusTarget = modal.querySelector("[data-quick-close].quick-buy__close") || cartBtn;
    if (focusTarget) focusTarget.focus();
  }

  function close() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-quick-buy-open");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.addEventListener("click", function (e) {
    const btn = e.target.closest("[data-quick-buy]");
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    openFrom(btn);
  });

  closeBtns.forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      close();
    });
  });

  addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal.classList.contains("is-open")) close();
  });

  if (cartBtn) {
    cartBtn.addEventListener("click", function () {
      cartBtn.classList.add("is-added");
      cartBtn.textContent = "Sepete eklendi";
      setTimeout(function () {
        cartBtn.classList.remove("is-added");
        cartBtn.innerHTML =
          '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 7h15l-1.4 8.2H7.8L6 7Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M6 7 5 4H2.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="9" cy="19.5" r="1.4" fill="currentColor"/><circle cx="17.5" cy="19.5" r="1.4" fill="currentColor"/></svg> Sepete Ekle';
        close();
      }, 700);
    });
  }

  if (dialog) {
    dialog.addEventListener("click", function (e) {
      e.stopPropagation();
    });
  }
})();
