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
  const metaTheme = document.getElementById("meta-theme-color");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const GH_USER = "Shafin5556";
  const GH_API = "https://github-contributions-api.jogruber.de/v4/" + GH_USER;

  const labels = {
    about: "About",
    experience: "Experience",
    projects: "Projects",
    skills: "Skills",
    contact: "Contact",
  };

  let current = null;
  let busy = false;
  let contribCache = { totals: null, byYear: {} };

  /* ---------- Theme ---------- */
  function getTheme() {
    return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("sa-theme", theme);
    } catch (_) {}
    if (metaTheme) metaTheme.content = theme === "dark" ? "#0c1018" : "#f4f7fb";
    const label = document.getElementById("theme-label");
    if (label) label.textContent = theme === "dark" ? "Light" : "Dark";
    const activeYear = document.querySelector(".year-btn.is-active");
    if (activeYear && contribCache.byYear[activeYear.dataset.year]) {
      renderContribGraph(activeYear.dataset.year, contribCache.byYear[activeYear.dataset.year]);
    }
  }

  function toggleTheme() {
    applyTheme(getTheme() === "dark" ? "light" : "dark");
  }

  applyTheme(getTheme() || "light");
  document.getElementById("theme-toggle")?.addEventListener("click", toggleTheme);
  document.getElementById("theme-toggle-mobile")?.addEventListener("click", toggleTheme);

  /* ---------- Print CV ---------- */
  function downloadCv() {
    const sheet = document.getElementById("print-sheet");
    if (sheet) sheet.hidden = false;
    window.print();
    window.setTimeout(() => {
      if (sheet) sheet.hidden = true;
    }, 300);
  }
  document.getElementById("cv-download")?.addEventListener("click", downloadCv);
  document.getElementById("cv-download-mobile")?.addEventListener("click", downloadCv);

  /* ---------- Navigation ---------- */
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

  /* ---------- Custom cursor + magnetic ---------- */
  function initCursor() {
    if (!finePointer || reduceMotion || window.innerWidth < 861) return;
    const dot = document.getElementById("cursor-dot");
    const ring = document.getElementById("cursor-ring");
    if (!dot || !ring) return;

    document.body.classList.add("has-cursor");
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let rx = x;
    let ry = y;

    window.addEventListener("pointermove", (e) => {
      x = e.clientX;
      y = e.clientY;
      dot.style.transform = "translate(" + x + "px," + y + "px) translate(-50%,-50%)";
    });

    function loop() {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      ring.style.transform = "translate(" + rx + "px," + ry + "px) translate(-50%,-50%)";
      requestAnimationFrame(loop);
    }
    loop();

    document.querySelectorAll("a, button, .magnetic, .quick-tile, .nav-item, .tab").forEach((el) => {
      el.addEventListener("pointerenter", () => document.body.classList.add("cursor-hover"));
      el.addEventListener("pointerleave", () => {
        document.body.classList.remove("cursor-hover");
        el.style.transform = "";
      });
    });

    document.querySelectorAll(".magnetic").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const mx = e.clientX - (r.left + r.width / 2);
        const my = e.clientY - (r.top + r.height / 2);
        el.style.transform = "translate(" + mx * 0.18 + "px," + my * 0.22 + "px)";
      });
      el.addEventListener("pointerleave", () => {
        el.style.transform = "";
      });
    });
  }

  /* ---------- Hero canvas ---------- */
  function initHero() {
    const canvas = document.getElementById("hero-canvas");
    if (!canvas || reduceMotion) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let nodes = [];
    let raf = 0;
    let t = 0;

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      w = Math.max(320, Math.floor(rect.width));
      h = Math.max(140, Math.floor(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      nodes = Array.from({ length: 28 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        z: Math.random() * 1.2 + 0.3,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.2,
      }));
    }

    function draw() {
      t += 0.008;
      ctx.clearRect(0, 0, w, h);
      const dark = getTheme() === "dark";

      for (const n of nodes) {
        n.x += n.vx * n.z;
        n.y += n.vy * n.z + Math.sin(t + n.x * 0.01) * 0.05;
        if (n.x < -20) n.x = w + 20;
        if (n.x > w + 20) n.x = -20;
        if (n.y < -20) n.y = h + 20;
        if (n.y > h + 20) n.y = -20;
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 110) {
            const alpha = (1 - dist / 110) * 0.35;
            ctx.strokeStyle = dark
              ? "rgba(56,199,255," + alpha + ")"
              : "rgba(233,30,140," + alpha + ")";
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      for (const n of nodes) {
        const r = 1.6 + n.z * 1.8;
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 4);
        g.addColorStop(0, dark ? "rgba(56,199,255,0.9)" : "rgba(233,30,140,0.9)");
        g.addColorStop(1, "rgba(124,58,237,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(n.x, n.y, r * 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = dark ? "#7dd3fc" : "#fff";
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener("resize", () => {
      cancelAnimationFrame(raf);
      resize();
      draw();
    });
  }

  /* ---------- Contributions graph ---------- */
  function formatCount(n) {
    return Number(n || 0).toLocaleString("en-US");
  }

  function levelColor(level) {
    const map = {
      0: "var(--c0)",
      1: "var(--c1)",
      2: "var(--c2)",
      3: "var(--c3)",
      4: "var(--c4)",
    };
    return map[level] || map[0];
  }

  function setTotalLabel(yearKey, total) {
    const countEl = document.getElementById("gh-total-count");
    const labelEl = document.getElementById("gh-total-label");
    if (countEl) countEl.textContent = formatCount(total);
    if (labelEl) {
      labelEl.textContent =
        yearKey === "last"
          ? "contributions in the last year"
          : "contributions in " + yearKey;
    }
  }

  function renderContribGraph(yearKey, days) {
    const svg = document.getElementById("contrib-graph");
    if (!svg || !days || !days.length) return;

    const cell = 11;
    const gap = 3;
    const step = cell + gap;
    const left = 28;
    const top = 18;

    const sorted = days.slice().sort((a, b) => a.date.localeCompare(b.date));
    const start = new Date(sorted[0].date + "T00:00:00");
    const startPad = start.getDay(); // 0 Sun
    const weeks = Math.ceil((sorted.length + startPad) / 7);

    const width = left + weeks * step + 4;
    const height = top + 7 * step + 4;
    svg.setAttribute("viewBox", "0 0 " + width + " " + height);
    svg.setAttribute("width", String(width));
    svg.setAttribute("height", String(height));

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let html = "";
    const weekdays = ["", "Mon", "", "Wed", "", "Fri", ""];
    weekdays.forEach((label, i) => {
      if (!label) return;
      html +=
        '<text x="0" y="' +
        (top + i * step + cell - 1) +
        '" fill="currentColor" font-size="9" opacity="0.65">' +
        label +
        "</text>";
    });

    let lastMonth = -1;
    sorted.forEach((day, index) => {
      const d = new Date(day.date + "T00:00:00");
      const week = Math.floor((index + startPad) / 7);
      const dow = d.getDay();
      const x = left + week * step;
      const y = top + dow * step;
      const month = d.getMonth();
      if (dow === 0 && month !== lastMonth) {
        lastMonth = month;
        html +=
          '<text x="' +
          x +
          '" y="11" fill="currentColor" font-size="9" opacity="0.7">' +
          monthNames[month] +
          "</text>";
      }
      const title = day.count + " contribution" + (day.count === 1 ? "" : "s") + " on " + day.date;
      html +=
        '<rect x="' +
        x +
        '" y="' +
        y +
        '" width="' +
        cell +
        '" height="' +
        cell +
        '" fill="' +
        levelColor(day.level) +
        '"><title>' +
        title +
        "</title></rect>";
    });

    svg.innerHTML = html;
    svg.style.color = getComputedStyle(document.documentElement).getPropertyValue("--muted").trim() || "#5b6472";
  }

  async function fetchYear(yearKey) {
    if (contribCache.byYear[yearKey]) return contribCache.byYear[yearKey];
    const q = yearKey === "last" ? "y=last" : "y=" + yearKey;
    const res = await fetch(GH_API + "?" + q);
    if (!res.ok) throw new Error("contrib fetch failed");
    const data = await res.json();
    contribCache.byYear[yearKey] = data.contributions || [];
    return contribCache.byYear[yearKey];
  }

  async function selectYear(yearKey) {
    document.querySelectorAll(".year-btn").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.year === yearKey);
    });

    try {
      const days = await fetchYear(yearKey);
      const total =
        yearKey === "last"
          ? contribCache.totals?.lastYear ?? days.reduce((s, d) => s + (d.count || 0), 0)
          : contribCache.totals?.[yearKey] ?? days.reduce((s, d) => s + (d.count || 0), 0);
      setTotalLabel(yearKey, total);
      renderContribGraph(yearKey, days);
    } catch (_) {
      setTotalLabel(yearKey, yearKey === "last" ? 2236 : 0);
    }
  }

  function buildYearToggles(totals) {
    const box = document.getElementById("year-toggles");
    if (!box) return;
    const years = Object.keys(totals)
      .filter((k) => /^\d{4}$/.test(k))
      .sort((a, b) => Number(b) - Number(a));

    const buttons = ['<button class="year-btn magnetic is-active" type="button" data-year="last">Last year</button>']
      .concat(
        years.map(
          (y) =>
            '<button class="year-btn magnetic" type="button" data-year="' +
            y +
            '">' +
            y +
            "</button>"
        )
      )
      .join("");

    box.innerHTML = buttons;
    box.querySelectorAll(".year-btn").forEach((btn) => {
      btn.addEventListener("click", () => selectYear(btn.dataset.year));
    });
  }

  async function loadContributions() {
    try {
      const res = await fetch(GH_API);
      if (!res.ok) throw new Error("totals failed");
      const data = await res.json();
      contribCache.totals = data.total || {};
      if (!contribCache.totals.lastYear) {
        const lastRes = await fetch(GH_API + "?y=last");
        if (lastRes.ok) {
          const lastData = await lastRes.json();
          contribCache.totals.lastYear = lastData.total?.lastYear;
          contribCache.byYear.last = lastData.contributions || [];
        }
      }
      buildYearToggles(contribCache.totals);
      await selectYear("last");
    } catch (_) {
      const box = document.getElementById("year-toggles");
      if (box) {
        box.innerHTML =
          '<button class="year-btn is-active" type="button" data-year="last">Last year</button>';
      }
      setTotalLabel("last", 2236);
    }
  }

  /* ---------- Boot ---------- */
  setActive((location.hash || "#about").slice(1), { force: true, instant: true });
  initCursor();
  initHero();
  loadContributions();

  if (boot) {
    window.requestAnimationFrame(() => {
      window.setTimeout(() => boot.classList.add("is-done"), reduceMotion ? 0 : 720);
    });
  }
})();
