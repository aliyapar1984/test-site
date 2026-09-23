(function () {
  window.PAGES = window.PAGES || {
    kedi: true,
    kopek: true,
    kus: true,
    balik: true,
    kampanyalar: true
  };

  /* Site menü */
  (function () {
    const menu = document.getElementById("siteMenu");
    const openBtn = document.getElementById("menuOpen");
    const closeBtn = document.getElementById("menuClose");
    if (!menu || !openBtn || !closeBtn) return;

    function setMenuCat(id) {
      if (!window.PAGES || !window.PAGES[id]) id = "kedi";
      document.querySelectorAll("[data-menu-cat]").forEach(function (btn) {
        const cat = btn.getAttribute("data-menu-cat");
        const on = cat === id;
        btn.classList.toggle("is-on", on);
        btn.setAttribute("aria-selected", on ? "true" : "false");
      });
      document.querySelectorAll("[data-menu-panel]").forEach(function (panel) {
        const on = panel.getAttribute("data-menu-panel") === id;
        panel.classList.toggle("is-on", on);
        if (on) panel.removeAttribute("hidden");
        else panel.setAttribute("hidden", "");
      });
    }

    function openMenu() {
      let hash = (location.hash || "#kedi").slice(1);
      if (hash === "kampanyalar") hash = "kedi";
      const params = new URLSearchParams(location.search);
      const cat = params.get("cat");
      if (cat && window.PAGES[cat]) hash = cat;
      setMenuCat(window.PAGES[hash] ? hash : "kedi");
      menu.classList.add("is-open");
      menu.setAttribute("aria-hidden", "false");
      openBtn.setAttribute("aria-expanded", "true");
      document.body.classList.add("is-menu-open");
      closeBtn.focus();
    }

    function closeMenu() {
      menu.classList.remove("is-open");
      menu.setAttribute("aria-hidden", "true");
      openBtn.setAttribute("aria-expanded", "false");
      document.body.classList.remove("is-menu-open");
      openBtn.focus();
    }

    openBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (menu.classList.contains("is-open")) closeMenu();
      else openMenu();
    });

    closeBtn.addEventListener("click", function (e) {
      e.preventDefault();
      closeMenu();
    });

    document.querySelectorAll("[data-menu-cat]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setMenuCat(btn.getAttribute("data-menu-cat"));
      });
    });

    document.querySelectorAll("[data-menu-close]").forEach(function (el) {
      el.addEventListener("click", function () {
        closeMenu();
      });
    });

    addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("is-open")) {
        closeMenu();
      }
    });
  })();

  /* Footer accordion */
  (function () {
    const accordion = document.getElementById("footerAccordion");
    if (!accordion) return;

    const cols = accordion.querySelectorAll(".footer-col");
    const mobileQuery = window.matchMedia("(max-width: 900px)");

    function syncDesktopState() {
      cols.forEach(function (col) {
        col.classList.add("is-open");
        const btn = col.querySelector(".footer-col__head");
        if (btn) btn.setAttribute("aria-expanded", "true");
      });
    }

    function syncMobileState() {
      cols.forEach(function (col, index) {
        const btn = col.querySelector(".footer-col__head");
        const open = index === 0;
        col.classList.toggle("is-open", open);
        if (btn) btn.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    function applyMode() {
      if (mobileQuery.matches) syncMobileState();
      else syncDesktopState();
    }

    cols.forEach(function (col) {
      const btn = col.querySelector(".footer-col__head");
      if (!btn) return;
      btn.addEventListener("click", function () {
        if (!mobileQuery.matches) return;
        const isOpen = col.classList.contains("is-open");
        cols.forEach(function (other) {
          other.classList.remove("is-open");
          const otherBtn = other.querySelector(".footer-col__head");
          if (otherBtn) otherBtn.setAttribute("aria-expanded", "false");
        });
        if (!isOpen) {
          col.classList.add("is-open");
          btn.setAttribute("aria-expanded", "true");
        }
      });
    });

    applyMode();
    if (mobileQuery.addEventListener) mobileQuery.addEventListener("change", applyMode);
    else mobileQuery.addListener(applyMode);
  })();

  /* Newsletter */
  (function () {
    const form = document.getElementById("newsletterForm");
    const block = document.getElementById("footerNewsletter");
    if (!form || !block) return;
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      const input = form.querySelector('input[type="email"]');
      if (!input || !input.value.trim()) {
        if (input) input.focus();
        return;
      }
      block.classList.add("is-success");
    });
  })();

  /* Custom cursor (basit) */
  (function () {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!finePointer.matches) return;
    const cursor = document.getElementById("cursor");
    if (!cursor) return;

    document.documentElement.classList.add("has-custom-cursor");
    let visible = false;
    const HOVER_SEL =
      "a, button, [role='button'], [data-go], .menu-more, .menu-action, .site-menu__nav-btn, .site-menu__links a, .site-menu__cta, input, label, .footer-col__head";

    function setPos(clientX, clientY) {
      cursor.style.transform =
        "translate3d(" + clientX + "px," + clientY + "px,0) translate(-50%,-50%)";
      if (!visible) {
        visible = true;
        cursor.classList.remove("is-hidden");
      }
    }

    window.addEventListener(
      "pointermove",
      function (e) {
        setPos(e.clientX, e.clientY);
        const t = e.target;
        if (t && t.closest && t.closest(HOVER_SEL)) cursor.classList.add("is-hover");
        else cursor.classList.remove("is-hover");
      },
      { passive: true }
    );

    document.addEventListener("mouseleave", function () {
      cursor.classList.add("is-hidden");
      visible = false;
    });

    finePointer.addEventListener("change", function () {
      if (!finePointer.matches) {
        document.documentElement.classList.remove("has-custom-cursor");
        cursor.classList.add("is-hidden");
      } else {
        document.documentElement.classList.add("has-custom-cursor");
      }
    });
  })();

  /* Ürün liste: filtre / sıralama / görünüm */
  (function () {
    const filter = document.querySelector("[data-product-filter]");
    const grid = document.querySelector("[data-product-grid]");
    if (!filter && !grid) return;

    if (filter) {
      const toggle = filter.querySelector("[data-filter-toggle]");
      const panel = filter.querySelector("[data-filter-panel]");
      const clearBtn = filter.querySelector("[data-filter-clear]");
      const applyBtn = filter.querySelector("[data-filter-apply]");
      const closeBtn = filter.querySelector("[data-filter-close]");
      const countBadge = filter.querySelector("[data-filter-count]");

      function updateFilterCount() {
        const count = filter.querySelectorAll('input[type="checkbox"]:checked').length;
        if (!countBadge) return;
        if (count > 0) {
          countBadge.textContent = String(count);
          countBadge.hidden = false;
          countBadge.setAttribute("aria-hidden", "false");
          if (toggle) {
            toggle.setAttribute("aria-label", "Filtrele, " + count + " seçili");
          }
        } else {
          countBadge.textContent = "0";
          countBadge.hidden = true;
          countBadge.setAttribute("aria-hidden", "true");
          if (toggle) {
            toggle.removeAttribute("aria-label");
          }
        }
      }

      function closeFilter() {
        filter.classList.remove("is-open");
        document.documentElement.classList.remove("is-filter-open");
        document.body.classList.remove("is-filter-open");
        if (toggle) toggle.setAttribute("aria-expanded", "false");
        if (panel) panel.setAttribute("aria-hidden", "true");
      }

      function openFilter() {
        filter.classList.add("is-open");
        document.documentElement.classList.add("is-filter-open");
        document.body.classList.add("is-filter-open");
        if (toggle) toggle.setAttribute("aria-expanded", "true");
        if (panel) panel.setAttribute("aria-hidden", "false");
      }

      if (toggle && panel) {
        toggle.addEventListener("click", function (e) {
          e.stopPropagation();
          if (filter.classList.contains("is-open")) closeFilter();
          else openFilter();
        });
      }

      if (closeBtn) {
        closeBtn.addEventListener("click", function (e) {
          e.stopPropagation();
          closeFilter();
        });
      }

      filter.querySelectorAll("[data-filter-group]").forEach(function (group) {
        const btn = group.querySelector(".product-filter__group-btn");
        const body = group.querySelector(".product-filter__group-body");
        if (!btn || !body) return;
        btn.addEventListener("click", function () {
          // Desktop'ta accordion yok
          if (window.matchMedia("(min-width: 901px)").matches) return;
          const open = group.classList.contains("is-open");
          group.classList.toggle("is-open", !open);
          btn.setAttribute("aria-expanded", open ? "false" : "true");
          body.hidden = open;
        });
      });

      filter.addEventListener("change", function (e) {
        if (e.target && e.target.matches('input[type="checkbox"]')) {
          updateFilterCount();
        }
      });

      if (clearBtn) {
        clearBtn.addEventListener("click", function () {
          filter.querySelectorAll('input[type="checkbox"]').forEach(function (input) {
            input.checked = false;
          });
          updateFilterCount();
        });
      }

      if (applyBtn) {
        applyBtn.addEventListener("click", function () {
          updateFilterCount();
          closeFilter();
        });
      }

      updateFilterCount();

      document.addEventListener("click", function (e) {
        if (!filter.classList.contains("is-open")) return;
        if (!filter.contains(e.target)) closeFilter();
      });

      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") closeFilter();
      });
    }

    document.querySelectorAll("[data-cols]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (!grid) return;
        const cols = btn.getAttribute("data-cols");
        grid.classList.remove("is-cols-3", "is-cols-4", "is-cols-5");
        grid.classList.add("is-cols-" + cols);
        document.querySelectorAll("[data-cols]").forEach(function (other) {
          const on = other === btn;
          other.classList.toggle("is-on", on);
          other.setAttribute("aria-pressed", on ? "true" : "false");
        });
      });
    });

    const sort = document.querySelector("[data-product-sort]");
    if (sort && grid) {
      sort.addEventListener("change", function () {
        const tiles = Array.prototype.slice.call(grid.querySelectorAll(".product-tile"));
        const banners = Array.prototype.slice.call(grid.querySelectorAll(".product-banner"));
        const mode = sort.value;

        function priceOf(tile) {
          const sale = tile.querySelector(".product-tile__price.is-sale");
          const normal = tile.querySelector(".product-tile__price:not(.is-old)");
          const el = sale || normal;
          if (!el) return 0;
          return parseFloat(el.textContent.replace(/[^\d,]/g, "").replace(",", ".")) || 0;
        }

        function nameOf(tile) {
          const el = tile.querySelector(".product-tile__name");
          return el ? el.textContent.trim().toLocaleLowerCase("tr") : "";
        }

        if (mode === "price-asc") tiles.sort(function (a, b) { return priceOf(a) - priceOf(b); });
        else if (mode === "price-desc") tiles.sort(function (a, b) { return priceOf(b) - priceOf(a); });
        else if (mode === "name-asc") tiles.sort(function (a, b) { return nameOf(a).localeCompare(nameOf(b), "tr"); });
        else return;

        tiles.forEach(function (tile) { grid.appendChild(tile); });
        banners.forEach(function (banner) { grid.appendChild(banner); });
      });
    }
  })();

  /* Ürün detay — boyut / ölçek seçimi + mobil galeri slide */
  (function () {
    const root = document.querySelector("[data-product-detail]");
    if (!root) return;

    const thumbs = root.querySelectorAll("[data-detail-size]");

    thumbs.forEach(function (thumb) {
      thumb.addEventListener("click", function () {
        thumbs.forEach(function (item) {
          const on = item === thumb;
          item.classList.toggle("is-on", on);
          if (on) item.setAttribute("aria-selected", "true");
          else item.removeAttribute("aria-selected");
        });
      });
    });

    (function initDetailGallery() {
      const gallery = root.querySelector("[data-detail-gallery]");
      const dotsRoot = root.querySelector("[data-detail-dots]");
      if (!gallery) return;

      const shots = Array.prototype.slice.call(gallery.querySelectorAll("[data-detail-shot]"));
      if (!shots.length) return;

      const mq = window.matchMedia("(max-width: 860px)");
      let dots = [];
      let active = 0;
      let scrollLock = false;

      function setActive(index, fromScroll) {
        if (index < 0 || index >= shots.length) return;
        active = index;
        shots.forEach(function (shot, i) {
          shot.classList.toggle("is-on", i === index);
        });
        dots.forEach(function (dot, i) {
          const on = i === index;
          dot.classList.toggle("is-on", on);
          dot.setAttribute("aria-selected", on ? "true" : "false");
        });
        if (!fromScroll && mq.matches) {
          scrollLock = true;
          shots[index].scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
          window.setTimeout(function () { scrollLock = false; }, 420);
        }
      }

      function buildDots() {
        if (!dotsRoot) return;
        dotsRoot.innerHTML = "";
        dots = shots.map(function (shot, i) {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "product-detail__dot" + (i === 0 ? " is-on" : "");
          btn.setAttribute("role", "tab");
          btn.setAttribute("aria-label", "Görsel " + (i + 1));
          btn.setAttribute("aria-selected", i === 0 ? "true" : "false");
          btn.addEventListener("click", function () { setActive(i, false); });
          dotsRoot.appendChild(btn);
          return btn;
        });
      }

      function syncFromScroll() {
        if (scrollLock || !mq.matches) return;
        const left = gallery.scrollLeft;
        const width = gallery.clientWidth || 1;
        const index = Math.round(left / width);
        if (index !== active) setActive(index, true);
      }

      buildDots();
      setActive(0, true);

      gallery.addEventListener("scroll", syncFromScroll, { passive: true });
      window.addEventListener("resize", function () {
        if (!mq.matches) {
          gallery.scrollLeft = 0;
          setActive(0, true);
        } else {
          setActive(active, false);
        }
      });
    })();

    const wish = root.querySelector(".product-detail__wish");
    if (wish) {
      wish.addEventListener("click", function () {
        const on = wish.getAttribute("aria-pressed") === "true";
        wish.setAttribute("aria-pressed", on ? "false" : "true");
      });
    }

    const qtyRoot = root.querySelector("[data-detail-qty]");
    if (qtyRoot) {
      const input = qtyRoot.querySelector("[data-qty-value]");
      const minus = qtyRoot.querySelector("[data-qty-minus]");
      const plus = qtyRoot.querySelector("[data-qty-plus]");

      function clampQty(n) {
        n = parseInt(n, 10);
        if (isNaN(n) || n < 1) n = 1;
        if (n > 99) n = 99;
        return n;
      }

      function setQty(n) {
        input.value = String(clampQty(n));
      }

      if (minus) minus.addEventListener("click", function () { setQty(clampQty(input.value) - 1); });
      if (plus) plus.addEventListener("click", function () { setQty(clampQty(input.value) + 1); });
      if (input) input.addEventListener("change", function () { setQty(input.value); });
    }
  })();

  /* Ürün detay — bilgi sekmeleri */
  (function () {
    const root = document.querySelector("[data-product-info]");
    if (!root) return;

    const tabs = root.querySelectorAll("[data-info-tab]");
    const panels = root.querySelectorAll("[data-info-panel]");

    function activate(id) {
      tabs.forEach(function (tab) {
        const on = tab.getAttribute("data-info-tab") === id;
        tab.classList.toggle("is-on", on);
        tab.setAttribute("aria-selected", on ? "true" : "false");
        tab.tabIndex = on ? 0 : -1;
      });

      panels.forEach(function (panel) {
        const on = panel.getAttribute("data-info-panel") === id;
        panel.classList.toggle("is-on", on);
        if (on) panel.removeAttribute("hidden");
        else panel.setAttribute("hidden", "");
      });
    }

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        activate(tab.getAttribute("data-info-tab"));
      });
    });
  })();

  /* Sıkça sorulan sorular */
  (function () {
    const items = document.querySelectorAll(".faq__item");
    if (!items.length) return;

    items.forEach(function (item) {
      const btn = item.querySelector(".faq__item-q");
      if (!btn) return;

      btn.addEventListener("click", function () {
        const isOpen = item.classList.contains("is-open");

        items.forEach(function (other) {
          other.classList.remove("is-open");
          const otherBtn = other.querySelector(".faq__item-q");
          if (otherBtn) otherBtn.setAttribute("aria-expanded", "false");
        });

        if (!isOpen) {
          item.classList.add("is-open");
          btn.setAttribute("aria-expanded", "true");
        }
      });
    });
  })();
})();
