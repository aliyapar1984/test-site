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
      menu.setAttribute("data-menu-theme", id);
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

  /* Header arama + üyelik panelleri */
  (function () {
    function ensureCss() {
      if (document.getElementById("headerToolsCss")) return;
      const link = document.createElement("link");
      link.id = "headerToolsCss";
      link.rel = "stylesheet";
      link.href = "css/header-tools.css?v=5";
      document.head.appendChild(link);
    }

    function svgClose() {
      return '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
    }

    function ensureMarkup() {
      if (document.getElementById("headerSearch")) return;

      const search = document.createElement("div");
      search.id = "headerSearch";
      search.className = "header-sheet";
      search.setAttribute("aria-hidden", "true");
      search.innerHTML =
        '<div class="header-sheet__backdrop" data-header-close></div>' +
        '<div class="header-sheet__dialog" role="dialog" aria-modal="true" aria-labelledby="headerSearchTitle">' +
          '<button type="button" class="header-sheet__close" data-header-close aria-label="Kapat">' + svgClose() + "</button>" +
          '<p class="header-sheet__kicker">Hızlı keşfet</p>' +
          '<h2 class="header-sheet__title" id="headerSearchTitle">Ne arıyorsun?</h2>' +
          '<p class="header-sheet__lead">Mama, yatak, tasma veya bakım ürünü yaz — seni doğru ürünlere götürelim.</p>' +
          '<form class="header-sheet__form" data-header-search-form>' +
            '<div class="header-sheet__shell">' +
              '<span class="header-sheet__shell-mark" aria-hidden="true">' +
                '<svg viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="2"/><path d="M16 16l4.5 4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' +
              "</span>" +
              '<input class="header-sheet__input" type="search" name="q" data-header-search-input placeholder="Örn: tahılsız kedi maması" autocomplete="off" enterkeyhint="search" />' +
              '<button type="submit" class="header-sheet__submit"><span>Ara</span><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
            "</div>" +
          "</form>" +
          '<div class="header-sheet__hints" aria-label="Popüler aramalar">' +
            '<button type="button" class="header-sheet__hint" data-header-hint="Kısır kedi maması">Kısır kedi maması</button>' +
            '<button type="button" class="header-sheet__hint" data-header-hint="Tahılsız mama">Tahılsız mama</button>' +
            '<button type="button" class="header-sheet__hint" data-header-hint="Yavru köpek">Yavru köpek</button>' +
            '<button type="button" class="header-sheet__hint" data-header-hint="Yatak">Konforlu yatak</button>' +
          "</div>" +
          '<p class="header-sheet__meta">AI destekli arama ürün listesinde çalışır.</p>' +
        "</div>";

      const auth = document.createElement("div");
      auth.id = "headerAuth";
      auth.className = "header-sheet is-auth";
      auth.setAttribute("aria-hidden", "true");
      auth.innerHTML =
        '<div class="header-sheet__backdrop" data-header-close></div>' +
        '<div class="header-sheet__dialog" role="dialog" aria-modal="true" aria-labelledby="headerAuthTitle">' +
          '<button type="button" class="header-sheet__close" data-header-close aria-label="Kapat">' + svgClose() + "</button>" +
          '<p class="header-sheet__kicker">PETDOSTUM hesabı</p>' +
          '<h2 class="header-sheet__title" id="headerAuthTitle">Hoş geldin</h2>' +
          '<p class="header-sheet__lead">Siparişlerini takip et, favorilerini kaydet.</p>' +
          '<div class="header-sheet__tabs" role="tablist" aria-label="Üyelik">' +
            '<button type="button" class="header-sheet__tab is-on" role="tab" aria-selected="true" data-auth-tab="login">Giriş yap</button>' +
            '<button type="button" class="header-sheet__tab" role="tab" aria-selected="false" data-auth-tab="register">Üye ol</button>' +
          "</div>" +
          '<form class="header-sheet__form" data-auth-panel="login" data-auth-form="login">' +
            '<div class="header-sheet__fields">' +
              '<label class="header-sheet__field"><span class="header-sheet__label">E-posta</span><span class="header-sheet__field-box"><input type="email" name="email" required autocomplete="email" placeholder="ornek@email.com" /></span></label>' +
              '<label class="header-sheet__field"><span class="header-sheet__label">Şifre</span><span class="header-sheet__field-box"><input type="password" name="password" required autocomplete="current-password" placeholder="••••••••" minlength="6" /></span></label>' +
            "</div>" +
            '<div class="header-sheet__row">' +
              '<label class="header-sheet__check"><input type="checkbox" name="remember" /> Beni hatırla</label>' +
              '<button type="button" class="header-sheet__link" data-auth-forgot>Şifremi unuttum</button>' +
            "</div>" +
            '<button type="submit" class="header-sheet__cta">Giriş yap</button>' +
            '<p class="header-sheet__note">Demo arayüz — gerçek üyelik bağlantısı sonra eklenecek.</p>' +
          "</form>" +
          '<form class="header-sheet__form" data-auth-panel="register" data-auth-form="register" hidden>' +
            '<div class="header-sheet__fields">' +
              '<label class="header-sheet__field"><span class="header-sheet__label">Ad soyad</span><span class="header-sheet__field-box"><input type="text" name="name" required autocomplete="name" placeholder="Adınız" /></span></label>' +
              '<label class="header-sheet__field"><span class="header-sheet__label">E-posta</span><span class="header-sheet__field-box"><input type="email" name="email" required autocomplete="email" placeholder="ornek@email.com" /></span></label>' +
              '<label class="header-sheet__field"><span class="header-sheet__label">Şifre</span><span class="header-sheet__field-box"><input type="password" name="password" required autocomplete="new-password" placeholder="En az 6 karakter" minlength="6" /></span></label>' +
            "</div>" +
            '<label class="header-sheet__check"><input type="checkbox" name="terms" required /> <span>Üyelik koşullarını kabul ediyorum</span></label>' +
            '<button type="submit" class="header-sheet__cta">Üye ol</button>' +
            '<p class="header-sheet__note">Demo arayüz — kayıt şu an yalnızca önizleme.</p>' +
          "</form>" +
          '<div class="header-sheet__success" data-auth-success hidden>' +
            '<span class="header-sheet__success-mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M5 12.5 10 17.5 19 7.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>' +
            "<strong>Hazırsın</strong>" +
            '<p data-auth-success-text>Hesabına başarıyla giriş yaptın.</p>' +
            '<button type="button" class="header-sheet__cta" data-header-close>Alışverişe devam</button>' +
          "</div>" +
        "</div>";

      document.body.appendChild(search);
      document.body.appendChild(auth);
    }

    function wireHeaderButtons() {
      const tools = document.querySelectorAll(".menu-tools .menu-action");
      tools.forEach(function (btn) {
        const label = (btn.getAttribute("aria-label") || "").toLocaleLowerCase("tr");
        if (label.indexOf("ara") !== -1 && !btn.hasAttribute("data-header-search")) {
          btn.setAttribute("data-header-search", "");
          btn.setAttribute("aria-haspopup", "dialog");
          btn.setAttribute("aria-controls", "headerSearch");
        }
        if ((label.indexOf("giriş") !== -1 || label.indexOf("uye") !== -1 || label.indexOf("üye") !== -1) &&
            !btn.hasAttribute("data-header-account")) {
          btn.setAttribute("data-header-account", "");
          btn.setAttribute("aria-haspopup", "dialog");
          btn.setAttribute("aria-controls", "headerAuth");
        }
      });
    }

    ensureCss();
    ensureMarkup();
    wireHeaderButtons();

    const searchSheet = document.getElementById("headerSearch");
    const authSheet = document.getElementById("headerAuth");
    if (!searchSheet || !authSheet) return;

    let lastFocus = null;
    let openSheet = null;

    function closeAll(opts) {
      const keepFocus = opts && opts.keepFocus;
      [searchSheet, authSheet].forEach(function (sheet) {
        sheet.classList.remove("is-open");
        sheet.setAttribute("aria-hidden", "true");
      });
      document.body.classList.remove("is-header-sheet-open");
      openSheet = null;
      if (!keepFocus) {
        if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
        lastFocus = null;
      }
    }

    function placeDialog(sheet) {
      const dialog = sheet.querySelector(".header-sheet__dialog");
      if (!dialog) return;
      if (window.matchMedia("(max-width: 720px)").matches) {
        dialog.style.top = "";
        dialog.style.right = "";
        return;
      }
      const anchor = document.getElementById("menuOpen") || document.querySelector(".menu-tools");
      if (!anchor) return;
      const rect = anchor.getBoundingClientRect();
      const inset = parseFloat(window.getComputedStyle(dialog).getPropertyValue("--header-sheet-inset")) || 18;
      /* Çarpı inset kadar içeride; modal kaydırılarak çarpı menü ikonuyla çakışır */
      dialog.style.top = Math.round(rect.top - inset) + "px";
      dialog.style.right = Math.max(8, Math.round(window.innerWidth - rect.right - inset)) + "px";
    }

    function open(sheet, focusSelector, trigger) {
      if (openSheet === sheet) {
        closeAll();
        return;
      }
      const prev = document.activeElement;
      closeAll({ keepFocus: true });
      lastFocus = prev || trigger;
      openSheet = sheet;
      placeDialog(sheet);
      sheet.classList.add("is-open");
      sheet.setAttribute("aria-hidden", "false");
      document.body.classList.add("is-header-sheet-open");
      window.setTimeout(function () {
        const focusEl = sheet.querySelector(focusSelector || "input, button");
        if (focusEl) focusEl.focus();
      }, 40);
    }

    function runSiteSearch(query) {
      const q = String(query || "").trim();
      if (!q) return;
      closeAll();
      try {
        sessionStorage.setItem("petdostum-ai-q", q);
      } catch (err) { /* ignore */ }

      const aiForm = document.querySelector("[data-ai-search]");
      const aiInput = aiForm ? aiForm.querySelector("[data-ai-input]") : null;
      if (aiForm && aiInput) {
        aiInput.value = q;
        if (typeof aiForm.requestSubmit === "function") aiForm.requestSubmit();
        else {
          const ev = document.createEvent("Event");
          ev.initEvent("submit", true, true);
          aiForm.dispatchEvent(ev);
        }
        return;
      }
      window.location.href = "urunler.html";
    }

    document.addEventListener("click", function (e) {
      const searchBtn = e.target.closest("[data-header-search]");
      if (searchBtn) {
        e.preventDefault();
        e.stopPropagation();
        open(searchSheet, "[data-header-search-input]", searchBtn);
        return;
      }
      const authBtn = e.target.closest("[data-header-account]");
      if (authBtn) {
        e.preventDefault();
        e.stopPropagation();
        if (openSheet !== authSheet) showAuthMode("login");
        open(authSheet, '[data-auth-form="login"] input[name="email"]', authBtn);
        return;
      }
      if (e.target.closest("[data-header-close]")) {
        e.preventDefault();
        closeAll();
      }
    });

    addEventListener("resize", function () {
      if (!openSheet) return;
      placeDialog(openSheet);
    });

    searchSheet.querySelector("[data-header-search-form]").addEventListener("submit", function (e) {
      e.preventDefault();
      const input = searchSheet.querySelector("[data-header-search-input]");
      runSiteSearch(input ? input.value : "");
    });

    searchSheet.querySelectorAll("[data-header-hint]").forEach(function (hint) {
      hint.addEventListener("click", function () {
        runSiteSearch(hint.getAttribute("data-header-hint") || hint.textContent);
      });
    });

    const tabs = authSheet.querySelectorAll("[data-auth-tab]");
    const panels = authSheet.querySelectorAll("[data-auth-panel]");
    const success = authSheet.querySelector("[data-auth-success]");
    const successText = authSheet.querySelector("[data-auth-success-text]");
    const tabsWrap = authSheet.querySelector(".header-sheet__tabs");
    const leadEl = authSheet.querySelector(".header-sheet__lead");

    function showAuthMode(mode) {
      tabs.forEach(function (tab) {
        const on = tab.getAttribute("data-auth-tab") === mode;
        tab.classList.toggle("is-on", on);
        tab.setAttribute("aria-selected", on ? "true" : "false");
      });
      panels.forEach(function (panel) {
        const on = panel.getAttribute("data-auth-panel") === mode;
        if (on) panel.removeAttribute("hidden");
        else panel.setAttribute("hidden", "");
      });
      if (success) success.setAttribute("hidden", "");
      if (tabsWrap) tabsWrap.removeAttribute("hidden");
      if (leadEl) leadEl.removeAttribute("hidden");
      const title = authSheet.querySelector("#headerAuthTitle");
      if (title) title.textContent = mode === "register" ? "Aramıza katıl" : "Hoş geldin";
    }

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        showAuthMode(tab.getAttribute("data-auth-tab"));
      });
    });

    authSheet.querySelectorAll("[data-auth-form]").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        const mode = form.getAttribute("data-auth-form");
        panels.forEach(function (panel) { panel.setAttribute("hidden", ""); });
        if (tabsWrap) tabsWrap.setAttribute("hidden", "");
        if (leadEl) leadEl.setAttribute("hidden", "");
        if (successText) {
          successText.textContent = mode === "register"
            ? "Üyeliğin hazır. Favorilerini ve siparişlerini buradan yönetebilirsin."
            : "Hesabına başarıyla giriş yaptın.";
        }
        if (success) success.removeAttribute("hidden");
      });
    });

    const forgot = authSheet.querySelector("[data-auth-forgot]");
    if (forgot) {
      forgot.addEventListener("click", function () {
        const email = authSheet.querySelector('[data-auth-form="login"] input[name="email"]');
        if (email && !email.value) email.focus();
        else window.alert("Şifre sıfırlama demoda kapalı. E-posta adresini yazıp daha sonra deneyebilirsin.");
      });
    }

    addEventListener("keydown", function (e) {
      if (e.key === "Escape" && openSheet) {
        e.preventDefault();
        closeAll();
      }
    });
  })();

  /* AI ürün araması — Pollinations (ücretsiz, anahtarsız) */
  (function () {
    const form = document.querySelector("[data-ai-search]");
    if (!form) return;

    const input = form.querySelector("[data-ai-input]");
    const status = form.querySelector("[data-ai-status]");
    const grid = document.querySelector("[data-product-grid]");
    const hints = form.querySelectorAll("[data-ai-hint]");
    if (!input || !grid) return;

    const tiles = Array.prototype.slice.call(grid.querySelectorAll(".product-tile"));
    const banners = Array.prototype.slice.call(grid.querySelectorAll(".product-banner"));
    let abortCtrl = null;
    let lastCallAt = 0;

    function normalize(s) {
      return String(s || "")
        .toLocaleLowerCase("tr")
        .replace(/ı/g, "i")
        .replace(/İ/g, "i")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
    }

    function setStatus(text) {
      if (!status) return;
      if (!text) {
        status.hidden = true;
        status.textContent = "";
        return;
      }
      status.hidden = false;
      status.textContent = text;
    }

    function catalog() {
      return tiles.map(function (tile, i) {
        const nameEl = tile.querySelector(".product-tile__name");
        const name = nameEl ? nameEl.textContent.trim() : ("Ürün " + (i + 1));
        return { index: i, name: name };
      });
    }

    function clearFilter() {
      tiles.forEach(function (tile) { tile.hidden = false; });
      banners.forEach(function (banner) { banner.hidden = false; });
      grid.classList.remove("is-ai-filtered");
    }

    function applyMatches(indices, note) {
      const matchSet = {};
      (indices || []).forEach(function (i) { matchSet[i] = true; });

      let visible = 0;
      tiles.forEach(function (tile, i) {
        const on = !!matchSet[i];
        tile.hidden = !on;
        if (on) visible += 1;
      });
      banners.forEach(function (banner) { banner.hidden = true; });
      grid.classList.add("is-ai-filtered");
      form.classList.remove("is-busy");

      if (visible === 0) {
        setStatus("Bu aramaya uygun ürün bulamadık. Başka bir şekilde sormayı deneyin.");
      } else {
        const label = visible + " ürün bulundu";
        setStatus(note ? (label + " — " + note) : label);
        grid.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }

    function localFallback(query) {
      const tokens = normalize(query).split(/\s+/).filter(Boolean);
      const hits = [];
      tiles.forEach(function (tile, i) {
        const nameEl = tile.querySelector(".product-tile__name");
        const name = normalize(nameEl ? nameEl.textContent : "");
        if (tokens.every(function (t) { return name.indexOf(t) !== -1; })) hits.push(i);
      });
      applyMatches(hits, hits.length ? ("“" + query.trim() + "”") : "");
    }

    function parseAiJson(text) {
      if (!text) return null;
      const cleaned = String(text)
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();
      const start = cleaned.indexOf("{");
      if (start === -1) return null;
      let depth = 0;
      let end = -1;
      for (let i = start; i < cleaned.length; i += 1) {
        const ch = cleaned.charAt(i);
        if (ch === "{") depth += 1;
        else if (ch === "}") {
          depth -= 1;
          if (depth === 0) {
            end = i;
            break;
          }
        }
      }
      if (end === -1) return null;
      try {
        return JSON.parse(cleaned.slice(start, end + 1));
      } catch (err) {
        return null;
      }
    }

    function askAi(query) {
      const items = catalog();
      const list = items.map(function (item) {
        return item.index + "|" + item.name;
      }).join("\n");

      const system = "PETDOSTUM asistanı. Sadece JSON yanıt ver: {\"indices\":[0,1],\"reason\":\"Konfor ve dinlenme için yatak önerileri\"}. Katalogdaki numaralardan seç, en fazla 10 ürün. reason alanını isteğe özel yaz.";
      const user = "Katalog:\n" + list + "\n\nİstek: " + query;

      const timeout = window.setTimeout(function () {
        if (abortCtrl) abortCtrl.abort();
      }, 55000);

      return fetch("https://text.pollinations.ai/openai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "openai-fast",
          messages: [
            { role: "system", content: system },
            { role: "user", content: user }
          ],
          temperature: 0.1,
          referrer: "https://petdostum.local/urunler"
        }),
        signal: abortCtrl ? abortCtrl.signal : undefined
      }).then(function (res) {
        window.clearTimeout(timeout);
        if (res.status === 429) {
          const err = new Error("rate");
          err.code = "rate";
          throw err;
        }
        if (!res.ok) throw new Error("http-" + res.status);
        return res.json();
      }).then(function (data) {
        const msg = data && data.choices && data.choices[0] && data.choices[0].message
          ? data.choices[0].message
          : {};
        const parsed = parseAiJson(msg.content) || parseAiJson(msg.reasoning);
        if (!parsed || !Array.isArray(parsed.indices)) throw new Error("parse");
        const max = items.length;
        const indices = parsed.indices
          .map(function (n) { return parseInt(n, 10); })
          .filter(function (n) { return !isNaN(n) && n >= 0 && n < max; });
        const reason = parsed.reason ? String(parsed.reason).trim() : "";
        return { indices: indices, reason: reason };
      }).catch(function (err) {
        window.clearTimeout(timeout);
        throw err;
      });
    }

    function runSearch(query) {
      const raw = String(query || "").trim();
      input.value = raw;

      hints.forEach(function (hint) {
        const h = hint.getAttribute("data-ai-hint") || hint.textContent;
        hint.classList.toggle("is-on", normalize(h) === normalize(raw));
      });

      if (!raw) {
        if (abortCtrl) abortCtrl.abort();
        clearFilter();
        setStatus("");
        form.classList.remove("is-busy");
        return;
      }

      const now = Date.now();
      if (now - lastCallAt < 16000 && lastCallAt > 0) {
        setStatus("AI biraz bekliyor (ücretsiz kota). Yerel arama kullanılıyor…");
        localFallback(raw);
        return;
      }

      if (abortCtrl) abortCtrl.abort();
      abortCtrl = typeof AbortController !== "undefined" ? new AbortController() : null;
      form.classList.add("is-busy");
      setStatus("AI ürünleri inceliyor…");

      askAi(raw)
        .then(function (result) {
          lastCallAt = Date.now();
          applyMatches(result.indices, result.reason || ("“" + raw + "”"));
        })
        .catch(function (err) {
          if (err && err.name === "AbortError") return;
          form.classList.remove("is-busy");
          if (err && err.code === "rate") {
            setStatus("Ücretsiz AI kotası doldu, yerel arama yapılıyor…");
          } else {
            setStatus("AI’ye ulaşılamadı, yerel arama yapılıyor…");
          }
          localFallback(raw);
        });
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      runSearch(input.value);
    });

    hints.forEach(function (hint) {
      hint.addEventListener("click", function () {
        runSearch(hint.getAttribute("data-ai-hint") || hint.textContent);
      });
    });

    try {
      const pending = sessionStorage.getItem("petdostum-ai-q");
      if (pending) {
        sessionStorage.removeItem("petdostum-ai-q");
        runSearch(pending);
      }
    } catch (err) { /* ignore */ }
  })();
})();
