// GTM Autószerviz — közös kliensoldali szkript (defer-rel töltve minden oldalon)
(function () {
  "use strict";

  // ======== ÉLESÍTÉS ELŐTT KITÖLTENDŐ ========
  // Formspree form endpoint. Regisztráció: formspree.io -> új form -> ide az URL.
  var FORMSPREE_ENDPOINT = "https://formspree.io/f/XXXXXXXX"; // [ÜGYFÉL ADATÁRA VÁR – spec 13.3]

  // A kanonikus domain egyetlen helye: domainváltás esetén csak itt kell cserélni,
  // és a sablonokban (canonical, og:url) ugyanezzel a szöveggel kell keresni-cserélni.
  var CANONICAL_ORIGIN = "https://gtmautoszerviz.hu";

  /* ---------- Téma-váltó gomb (a FOUC-mentes kezdeti állapotot a <head>
     inline bootstrap-szkriptje állítja be oldalbetöltéskor, ld. minden .html <head>-je) ---------- */
  function initTheme() {
    var root = document.documentElement;
    var btn = document.getElementById("themeToggle");
    if (!btn) return;
    var icon = btn.querySelector(".theme-icon");
    var label = btn.querySelector(".label");

    function currentTheme() {
      var attr = root.getAttribute("data-theme");
      if (attr === "dark" || attr === "light") return attr;
      return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }

    function applyUI(theme) {
      if (icon) icon.classList.toggle("is-dark", theme === "dark");
      if (label) label.textContent = theme === "dark" ? "Sötét" : "Világos";
      btn.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
    }

    applyUI(currentTheme());

    btn.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try {
        localStorage.setItem("gtm-theme", next);
      } catch (e) {
        /* localStorage nem elérhető (pl. privát böngészés) — a téma csak a munkamenetben marad meg */
      }
      applyUI(next);
    });

    if (window.matchMedia) {
      var mq = window.matchMedia("(prefers-color-scheme: dark)");
      var onChange = function (e) {
        var userChosen = false;
        try {
          userChosen = !!localStorage.getItem("gtm-theme");
        } catch (err) {}
        if (userChosen) return;
        root.setAttribute("data-theme", e.matches ? "dark" : "light");
        applyUI(e.matches ? "dark" : "light");
      };
      if (mq.addEventListener) mq.addEventListener("change", onChange);
      else if (mq.addListener) mq.addListener(onChange);
    }
  }

  /* ---------- Mobilmenü (hamburger) ---------- */
  function initMobileNav() {
    var toggle = document.getElementById("navToggle");
    var nav = document.getElementById("mainNav");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("is-open", !open);
    });
  }

  /* ---------- Szolgáltatások legördülő (desktop hover/focus, mobil kattintás) ---------- */
  function initDropdown() {
    var dropdowns = document.querySelectorAll(".nav-dropdown");
    dropdowns.forEach(function (dd) {
      var btn = dd.querySelector("button.nav-top");
      if (!btn) return;
      btn.addEventListener("click", function () {
        var open = dd.classList.contains("is-open");
        dropdowns.forEach(function (other) {
          other.classList.remove("is-open");
          var otherBtn = other.querySelector("button.nav-top");
          if (otherBtn) otherBtn.setAttribute("aria-expanded", "false");
        });
        if (!open) {
          dd.classList.add("is-open");
          btn.setAttribute("aria-expanded", "true");
        }
      });
    });
    document.addEventListener("click", function (e) {
      dropdowns.forEach(function (dd) {
        if (!dd.contains(e.target)) {
          dd.classList.remove("is-open");
          var btn = dd.querySelector("button.nav-top");
          if (btn) btn.setAttribute("aria-expanded", "false");
        }
      });
    });
  }

  /* ---------- UTM-megőrzés (spec 7.2) ---------- */
  function captureUtm() {
    try {
      var params = new URLSearchParams(window.location.search);
      var keys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
      var hasUtm = keys.some(function (k) { return params.has(k); });
      if (hasUtm) {
        var data = {};
        keys.forEach(function (k) { data[k] = params.get(k) || ""; });
        data.referrer = document.referrer || "";
        sessionStorage.setItem("gtm-utm", JSON.stringify(data));
      } else if (!sessionStorage.getItem("gtm-utm") && document.referrer) {
        sessionStorage.setItem("gtm-utm", JSON.stringify({ referrer: document.referrer }));
      }
    } catch (e) {
      /* sessionStorage nem elérhető — az UTM-mezők üresen mennek tovább */
    }
  }

  function fillHiddenUtmFields(form) {
    try {
      var raw = sessionStorage.getItem("gtm-utm");
      if (!raw) return;
      var data = JSON.parse(raw);
      Object.keys(data).forEach(function (key) {
        var field = form.querySelector('[name="' + key + '"]');
        if (field) field.value = data[key];
      });
    } catch (e) {}
  }

  /* ---------- Kapcsolatfelvételi űrlap (Formspree, fetch + aria-live) ---------- */
  function initForm() {
    var form = document.getElementById("contactForm");
    if (!form) return;

    if (form.getAttribute("action").indexOf("XXXXXXXX") === -1) {
      // élesített endpoint esetén nincs teendő, a sablon action-je már helyes
    }

    fillHiddenUtmFields(form);

    var pageField = form.querySelector('[name="oldal_url"]');
    if (pageField) pageField.value = window.location.href;

    var status = document.getElementById("formStatus");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (status) {
        status.innerHTML = '<span class="spinner" aria-hidden="true"></span>Küldés…';
        status.className = "form-status";
      }
      fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      })
        .then(function (res) {
          if (res.ok) {
            window.location.href = "koszonjuk.html";
          } else {
            if (status) {
              status.textContent = "Hiba történt a küldéskor. Hívjon minket közvetlenül: +36 70 276 9240";
              status.className = "form-status is-error";
            }
          }
        })
        .catch(function () {
          if (status) {
            status.textContent = "Hiba történt a küldéskor. Hívjon minket közvetlenül: +36 70 276 9240";
            status.className = "form-status is-error";
          }
        });
    });
  }

  /* ---------- Úttest-csík kisautója: a navigációt követi, oldalbetöltéskor beáll ----------
     Csak asztali méretnél fut (a .road-strip mobilon úgyis display:none, lásd CSS) — a
     prefers-reduced-motion globális szabálya a gördülést/kipufogófüstöt .001ms-re rövidíti. */
  function initRoadCar() {
    var strip = document.querySelector(".road-strip");
    var car = document.getElementById("roadCar");
    var nav = document.getElementById("mainNav");
    if (!strip || !car || !nav) return;
    if (!window.matchMedia || !window.matchMedia("(min-width: 881px)").matches) return;

    var targets = Array.prototype.slice.call(
      nav.querySelectorAll(":scope > ul > li > a, :scope > ul > li.nav-dropdown > button.nav-top")
    );
    if (!targets.length) return;

    var lastX = null;

    function carWidth() {
      return car.getBoundingClientRect().width || 40;
    }

    function moveTo(targetEl) {
      if (!targetEl) return;
      var stripRect = strip.getBoundingClientRect();
      var elRect = targetEl.getBoundingClientRect();
      var centerX = (elRect.left + elRect.right) / 2 - stripRect.left;
      var x = Math.max(4, Math.min(stripRect.width - carWidth() - 4, centerX - carWidth() / 2));
      if (lastX !== null && x < lastX - 1) {
        car.classList.add("is-facing-left");
      } else if (lastX !== null && x > lastX + 1) {
        car.classList.remove("is-facing-left");
      }
      lastX = x;
      car.classList.add("is-moving");
      car.style.setProperty("--car-x", x + "px");
    }

    function restTarget() {
      var current = nav.querySelector('a[aria-current="page"]');
      if (current) {
        if (targets.indexOf(current) !== -1) return current;
        var dropdown = current.closest(".nav-dropdown");
        if (dropdown) {
          var btn = dropdown.querySelector("button.nav-top");
          if (btn) return btn;
        }
      }
      return targets[0] || null;
    }

    car.addEventListener("transitionend", function (e) {
      if (e.propertyName === "transform") car.classList.remove("is-moving");
    });

    targets.forEach(function (el) {
      el.addEventListener("mouseenter", function () { moveTo(el); });
      el.addEventListener("focus", function () { moveTo(el); });
    });

    nav.addEventListener("mouseleave", function () { moveTo(restTarget()); });
    nav.addEventListener("focusout", function (e) {
      if (nav.contains(e.relatedTarget)) return;
      moveTo(restTarget());
    });

    var resizeTimer = null;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        var rest = restTarget();
        if (!rest) return;
        car.style.transition = "none";
        moveTo(rest);
        /* force reflow, hogy a transition visszaálljon az átméretezés utáni mozgásokra */
        void car.offsetWidth;
        car.style.transition = "";
      }, 150);
    });

    // Kezdő "beguruló" animáció oldalbetöltéskor: a kocsi a bal szélről begördül a helyére.
    setTimeout(function () { moveTo(restTarget()); }, 450);
  }

  document.addEventListener("DOMContentLoaded", function () {
    initTheme();
    initMobileNav();
    initDropdown();
    captureUtm();
    initForm();
    initRoadCar();
  });

  window.GTM_SITE = { canonicalOrigin: CANONICAL_ORIGIN, formspreeEndpoint: FORMSPREE_ENDPOINT };
})();
