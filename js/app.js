(function () {
  const pages = Array.from(document.querySelectorAll(".page"));
  const sideItems = Array.from(document.querySelectorAll(".side-nav .nav-item"));
  const tabs = Array.from(document.querySelectorAll(".bottom-nav .tab"));
  const titleEl = document.getElementById("page-title");
  const eyebrowEl = document.getElementById("page-eyebrow");
  const searchInput = document.getElementById("nav-search");
  const stage = document.getElementById("stage");
  const topbar = document.querySelector(".topbar");
  const boot = document.getElementById("boot-overlay");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const labels = {
    about: "About",
    experience: "Experience",
    projects: "Projects",
    skills: "Skills",
    contact: "Contact",
  };

  let current = null;
  let busy = false;

  function markReveals(pageEl) {
    if (!pageEl) return;
    pageEl.querySelectorAll(".reveal").forEach((el, i) => {
      el.classList.add("is-in");
      el.style.transitionDelay = reduceMotion ? "0ms" : i * 55 + "ms";
    });
  }

  function clearReveals(pageEl) {
    if (!pageEl) return;
    pageEl.querySelectorAll(".reveal").forEach((el) => {
      el.classList.remove("is-in");
      el.style.transitionDelay = "0ms";
    });
  }

  function setChrome(page) {
    sideItems.forEach((b) => b.classList.toggle("is-active", b.dataset.page === page));
    tabs.forEach((b) => b.classList.toggle("is-active", b.dataset.page === page));

    const active = document.getElementById("page-" + page);
    const nextTitle = active?.dataset.title || labels[page];
    const nextEyebrow = active?.dataset.eyebrow || "Portfolio";

    if (topbar && !reduceMotion) {
      topbar.classList.add("is-swap");
      window.setTimeout(() => {
        titleEl.textContent = nextTitle;
        eyebrowEl.textContent = nextEyebrow;
        topbar.classList.remove("is-swap");
      }, 140);
    } else {
      titleEl.textContent = nextTitle;
      eyebrowEl.textContent = nextEyebrow;
    }
  }

  function showPage(page, animate) {
    const next = document.getElementById("page-" + page);
    if (!next) return;

    pages.forEach((p) => {
      p.classList.remove("is-active", "is-entering", "is-leaving");
      if (p !== next) clearReveals(p);
    });

    next.classList.add("is-active");
    if (animate && !reduceMotion) next.classList.add("is-entering");
    markReveals(next);

    if (animate && !reduceMotion) {
      window.setTimeout(() => next.classList.remove("is-entering"), 520);
    }
  }

  function setActive(page, opts) {
    if (page === "home" || !labels[page]) page = "about";
    if (busy && current && page !== current) return;
    if (page === current && !(opts && opts.force)) return;

    const animate = !(opts && opts.instant);
    const prev = current ? document.getElementById("page-" + current) : null;
    const nextHash = "#" + page;

    setChrome(page);

    if (stage) stage.scrollTo({ top: 0, behavior: animate ? "smooth" : "auto" });
    window.scrollTo({ top: 0, behavior: animate ? "smooth" : "auto" });

    if (location.hash !== nextHash) {
      history.replaceState(null, "", nextHash);
    }

    if (!prev || reduceMotion || !animate) {
      current = page;
      showPage(page, animate);
      return;
    }

    busy = true;
    prev.classList.remove("is-entering");
    prev.classList.add("is-leaving");
    clearReveals(prev);

    window.setTimeout(() => {
      prev.classList.remove("is-active", "is-leaving");
      current = page;
      showPage(page, true);
      busy = false;
    }, 260);
  }

  function bindNav(nodes) {
    nodes.forEach((node) => {
      node.addEventListener("click", () => setActive(node.dataset.page));
    });
  }

  bindNav(sideItems);
  bindNav(tabs);

  document.querySelectorAll("[data-goto]").forEach((btn) => {
    btn.addEventListener("click", () => setActive(btn.dataset.goto));
  });

  tabs.forEach((tab) => {
    tab.addEventListener("pointerdown", () => {
      tab.style.transform = "scale(0.94)";
    });
    tab.addEventListener("pointerup", () => {
      tab.style.transform = "";
    });
    tab.addEventListener("pointerleave", () => {
      tab.style.transform = "";
    });
  });

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const q = searchInput.value.trim().toLowerCase();
      if (!q) return;
      const order = ["about", "experience", "projects", "skills", "contact"];
      const hit = order.find((id) => {
        const el = document.getElementById("page-" + id);
        return el && el.textContent.toLowerCase().includes(q);
      });
      if (hit) setActive(hit);
    });
  }

  window.addEventListener("hashchange", () => {
    setActive((location.hash || "#about").slice(1));
  });

  setActive((location.hash || "#about").slice(1), { force: true, instant: true });

  if (boot) {
    window.requestAnimationFrame(() => {
      window.setTimeout(() => boot.classList.add("is-done"), reduceMotion ? 0 : 720);
    });
  }
})();
