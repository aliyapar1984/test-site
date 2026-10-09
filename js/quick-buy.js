/* Hızlı satın al modal — ürün kartı verisini data-* ile okur */
(function () {
  const modal = document.getElementById("quickBuy");
  if (!modal) return;

  const dialog = modal.querySelector(".quick-buy__dialog");
  const closeBtns = modal.querySelectorAll("[data-quick-close]");
  const imgEl = modal.querySelector("[data-qb-img]");
  const campaignsEl = modal.querySelector("[data-qb-campaigns]");
  const factsEl = modal.querySelector("[data-qb-facts]");
  const titleEl = modal.querySelector("[data-qb-title]");
  const catEl = modal.querySelector("[data-qb-cat]");
  const ratingEl = modal.querySelector("[data-qb-rating]");
  const starsEl = modal.querySelector("[data-qb-stars]");
  const reviewsEl = modal.querySelector("[data-qb-reviews]");
  const sizeWrap = modal.querySelector("[data-qb-size-wrap]");
  const sizeEl = modal.querySelector("[data-qb-size]");
  const sizesUi = modal.querySelector("[data-qb-sizes]");
  const oldEl = modal.querySelector("[data-qb-old]");
  const promoEl = modal.querySelector("[data-qb-promo]");
  const nowEl = modal.querySelector("[data-qb-now]");
  const saveEl = modal.querySelector("[data-qb-save]");
  const cartBtn = modal.querySelector("[data-qb-cart]");
  let lastFocus = null;
  let currentDisc = "";

  function show(el, on) {
    if (!el) return;
    el.hidden = !on;
  }

  function stars(n) {
    const full = Math.max(0, Math.min(5, parseInt(n, 10) || 0));
    return "★★★★★".slice(0, full) + "☆☆☆☆☆".slice(0, 5 - full);
  }

  function addCampaign(list, seen, text, soft) {
    const label = (text || "").replace(/\s+/g, " ").trim();
    if (!label || seen[label]) return;
    seen[label] = 1;
    list.push({ text: label, soft: !!soft });
  }

  function fillCampaigns(btn) {
    if (!campaignsEl) return;
    const list = [];
    const seen = {};
    (btn.dataset.campaigns || "").split("|").forEach(function (part) {
      addCampaign(list, seen, part, false);
    });
    const card = btn.closest("article");
    const badge = card && card.querySelector(".product-tile__badge");
    if (badge) addCampaign(list, seen, badge.textContent, true);
    if (btn.dataset.disc) addCampaign(list, seen, "Sepette " + btn.dataset.disc + " indirim", false);
    else if (btn.dataset.promo === "1") addCampaign(list, seen, "Sepette özel fiyat", false);

    campaignsEl.innerHTML = "";
    list.forEach(function (item) {
      const li = document.createElement("li");
      if (item.soft) li.className = "is-soft";
      li.textContent = item.text;
      campaignsEl.appendChild(li);
    });
    show(campaignsEl, list.length > 0);
  }

  function fillFacts(d) {
    if (!factsEl) return;
    const bits = ["Aynı gün kargo", "14 gün kolay iade"];
    if (d.size) bits.unshift(d.size + " paket");
    factsEl.textContent = bits.join(" · ");
    show(factsEl, true);
  }

  function openFrom(btn) {
    lastFocus = btn;
    const d = btn.dataset;
    currentDisc = d.disc || "";

    if (imgEl) {
      imgEl.src = d.img || "";
      imgEl.alt = d.name || "";
    }
    if (titleEl) titleEl.textContent = d.name || "";
    if (catEl) {
      catEl.textContent = d.cat || "";
      show(catEl, !!d.cat);
    }

    fillCampaigns(btn);
    fillFacts(d);

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
      if (sizesUi) sizesUi.innerHTML = "";
      if (sizes.length) {
        sizes.forEach(function (s) {
          const opt = document.createElement("option");
          opt.value = s;
          opt.textContent = s;
          if (d.size && d.size === s) opt.selected = true;
          sizeEl.appendChild(opt);
        });
        if (!d.size) sizeEl.selectedIndex = 0;
        if (sizesUi) {
          sizes.forEach(function (s) {
            const choice = document.createElement("button");
            choice.type = "button";
            choice.className = "quick-buy__size-btn";
            choice.dataset.size = s;
            choice.textContent = s;
            if (sizeEl.value === s) choice.classList.add("is-on");
            choice.addEventListener("click", function () {
              sizeEl.value = s;
              sizesUi.querySelectorAll(".quick-buy__size-btn").forEach(function (btn) {
                btn.classList.toggle("is-on", btn.dataset.size === s);
              });
            });
            sizesUi.appendChild(choice);
          });
        }
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
      if (window.PetdostumCart) {
        const sizeOn = sizeWrap && !sizeWrap.hidden && sizeEl;
        window.PetdostumCart.add({
          name: titleEl ? titleEl.textContent : "",
          img: imgEl ? imgEl.getAttribute("src") : "",
          price: nowEl ? nowEl.textContent : "",
          old: oldEl && !oldEl.hidden ? oldEl.textContent.trim() : "",
          disc: currentDisc,
          size: sizeOn ? sizeEl.value : ""
        });
      }
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
