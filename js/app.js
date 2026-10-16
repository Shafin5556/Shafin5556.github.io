(function () {
  const pages = Array.from(document.querySelectorAll(".page"));
  const sideItems = Array.from(document.querySelectorAll(".side-nav .nav-item"));
  const tabs = Array.from(document.querySelectorAll(".bottom-nav .tab"));
  const titleEl = document.getElementById("page-title");
  const eyebrowEl = document.getElementById("page-eyebrow");
  const searchInput = document.getElementById("nav-search");
  const stage = document.getElementById("stage");

  const labels = {
    home: "Home",
    about: "About",
    experience: "Experience",
    projects: "Projects",
    skills: "Skills",
    contact: "Contact",
  };

  function setActive(page) {
    if (!labels[page]) page = "home";

    pages.forEach((p) => p.classList.toggle("is-active", p.id === "page-" + page));
    sideItems.forEach((b) => b.classList.toggle("is-active", b.dataset.page === page));
    tabs.forEach((b) => b.classList.toggle("is-active", b.dataset.page === page));

    const active = document.getElementById("page-" + page);
    titleEl.textContent = active?.dataset.title || labels[page];
    eyebrowEl.textContent = active?.dataset.eyebrow || "Portfolio";

    if (stage) stage.scrollTo({ top: 0, behavior: "smooth" });
    window.scrollTo({ top: 0, behavior: "smooth" });

    const nextHash = "#" + page;
    if (location.hash !== nextHash) {
      history.replaceState(null, "", nextHash);
    }
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

  // Soft haptic-like feedback on mobile tabs
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
      const order = ["home", "about", "experience", "projects", "skills", "contact"];
      const hit = order.find((id) => {
        const el = document.getElementById("page-" + id);
        return el && el.textContent.toLowerCase().includes(q);
      });
      if (hit) setActive(hit);
    });
  }

  window.addEventListener("hashchange", () => {
    setActive((location.hash || "#home").slice(1));
  });

  setActive((location.hash || "#home").slice(1));
})();
