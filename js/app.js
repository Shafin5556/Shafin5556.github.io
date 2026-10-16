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

  const labels = {
    about: "About",
    experience: "Experience",
    projects: "Projects",
    skills: "Skills",
    contact: "Contact",
  };

  const radarAxes = [
    {
      key: "Backend",
      value: 0.92,
      desc: "Laravel, PHP, Node.js, and REST APIs powering production platforms.",
      tags: ["Laravel", "PHP", "Node.js", "REST"],
    },
    {
      key: "Automation",
      value: 0.86,
      desc: "Queues, background jobs, sync pipelines, and operational workflows.",
      tags: ["Queues", "Jobs", "Pipelines", "Sync"],
    },
    {
      key: "Data",
      value: 0.8,
      desc: "MySQL/NoSQL, SQL tuning, scraping, and cross-system data engines.",
      tags: ["MySQL", "NoSQL", "SQL", "ETL"],
    },
    {
      key: "Delivery",
      value: 0.84,
      desc: "Secure, scalable delivery across campus and national-scale systems.",
      tags: ["Security", "Scale", "MVC", "Git"],
    },
  ];

  let current = null;
  let busy = false;

  /* ---------- Theme ---------- */
  function getTheme() {
    return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("sa-theme", theme);
    } catch (_) {}
    if (metaTheme) metaTheme.content = theme === "dark" ? "#0b1020" : "#f4f7fb";
    const label = document.getElementById("theme-label");
    if (label) label.textContent = theme === "dark" ? "Light" : "Dark";
    const chart = document.getElementById("gh-chart");
    if (chart) {
      const color = theme === "dark" ? "00b4f0" : "e91e8c";
      chart.src = "https://ghchart.rshah.org/" + color + "/" + GH_USER;
    }
  }

  function toggleTheme() {
    applyTheme(getTheme() === "dark" ? "light" : "dark");
  }

  applyTheme(getTheme());
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

    if (page === "skills") initRadar();
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

  /* ---------- Hero canvas (subtle 3D-ish nodes) ---------- */
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
              ? "rgba(0,180,240," + alpha + ")"
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
        g.addColorStop(0, dark ? "rgba(0,180,240,0.9)" : "rgba(233,30,140,0.9)");
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

  /* ---------- Tech radar ---------- */
  let radarReady = false;
  function polar(cx, cy, r, angle) {
    return {
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
    };
  }

  function setRadarDetail(axis) {
    const title = document.getElementById("radar-title");
    const desc = document.getElementById("radar-desc");
    const tags = document.getElementById("radar-tags");
    if (!title || !desc || !tags) return;
    title.textContent = axis.key;
    desc.textContent = axis.desc;
    tags.innerHTML = axis.tags.map((t) => "<span>" + t + "</span>").join("");
  }

  function initRadar() {
    const svg = document.getElementById("tech-radar");
    if (!svg || radarReady) return;
    radarReady = true;

    const cx = 160;
    const cy = 160;
    const maxR = 118;
    const grid = svg.querySelector(".radar-grid");
    const poly = document.getElementById("radar-poly");
    const points = document.getElementById("radar-points");
    const labelsEl = document.getElementById("radar-labels");
    const n = radarAxes.length;

    for (let ring = 1; ring <= 4; ring++) {
      const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      c.setAttribute("cx", cx);
      c.setAttribute("cy", cy);
      c.setAttribute("r", String((maxR / 4) * ring));
      grid.appendChild(c);
    }

    const pts = [];
    radarAxes.forEach((axis, i) => {
      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n;
      const edge = polar(cx, cy, maxR, angle);
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", cx);
      line.setAttribute("y1", cy);
      line.setAttribute("x2", edge.x);
      line.setAttribute("y2", edge.y);
      grid.appendChild(line);

      const labelPos = polar(cx, cy, maxR + 18, angle);
      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("x", labelPos.x);
      text.setAttribute("y", labelPos.y);
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("dominant-baseline", "middle");
      text.textContent = axis.key;
      labelsEl.appendChild(text);

      const p = polar(cx, cy, maxR * axis.value, angle);
      pts.push(p.x + "," + p.y);

      const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      dot.setAttribute("cx", p.x);
      dot.setAttribute("cy", p.y);
      dot.setAttribute("r", "5");
      dot.dataset.index = String(i);
      dot.addEventListener("mouseenter", () => {
        points.querySelectorAll("circle").forEach((c) => c.classList.remove("is-active"));
        dot.classList.add("is-active");
        setRadarDetail(axis);
      });
      dot.addEventListener("focus", () => setRadarDetail(axis));
      points.appendChild(dot);
    });

    poly.setAttribute("points", pts.join(" "));
    setRadarDetail(radarAxes[0]);
  }

  /* ---------- GitHub widgets ---------- */
  async function loadGitHub() {
    const chart = document.getElementById("gh-chart");
    if (chart) {
      const color = getTheme() === "dark" ? "00b4f0" : "e91e8c";
      chart.src = "https://ghchart.rshah.org/" + color + "/" + GH_USER;
    }

    try {
      const [userRes, repoRes] = await Promise.all([
        fetch("https://api.github.com/users/" + GH_USER),
        fetch("https://api.github.com/users/" + GH_USER + "/repos?sort=updated&per_page=100"),
      ]);
      if (!userRes.ok || !repoRes.ok) throw new Error("GitHub API unavailable");
      const user = await userRes.json();
      const repos = await repoRes.json();

      const stars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
      const set = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = String(val);
      };
      set("gh-repos", user.public_repos ?? repos.length);
      set("gh-followers", user.followers ?? "—");
      set("gh-stars", stars);

      const langCount = {};
      repos.forEach((r) => {
        if (r.language) langCount[r.language] = (langCount[r.language] || 0) + 1;
      });
      const langs = Object.entries(langCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
      const total = langs.reduce((s, [, n]) => s + n, 0) || 1;
      const langBox = document.getElementById("gh-langs");
      if (langBox) {
        langBox.innerHTML = langs
          .map(([name, n]) => {
            const pct = Math.round((n / total) * 100);
            return (
              '<div class="lang-row"><span>' +
              name +
              '</span><div class="lang-bar"><i style="width:' +
              pct +
              '%"></i></div><span>' +
              pct +
              "%</span></div>"
            );
          })
          .join("");
      }

      const top = repos
        .filter((r) => !r.fork)
        .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0) || new Date(b.updated_at) - new Date(a.updated_at))
        .slice(0, 4);
      const list = document.getElementById("gh-repos-list");
      if (list) {
        list.innerHTML = top
          .map((r) => {
            return (
              '<a class="gh-repo magnetic" href="' +
              r.html_url +
              '" target="_blank" rel="noopener"><div><strong>' +
              r.name +
              "</strong><span>" +
              (r.description || r.language || "Repository") +
              '</span></div><em>★ ' +
              (r.stargazers_count || 0) +
              "</em></a>"
            );
          })
          .join("");
      }
    } catch (_) {
      const set = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
      };
      set("gh-repos", "—");
      set("gh-followers", "—");
      set("gh-stars", "—");
      const list = document.getElementById("gh-repos-list");
      if (list) {
        list.innerHTML =
          '<p class="muted">Live GitHub stats will appear when the API is reachable. Profile: github.com/' +
          GH_USER +
          "</p>";
      }
    }
  }

  /* ---------- Boot ---------- */
  setActive((location.hash || "#about").slice(1), { force: true, instant: true });
  initCursor();
  initHero();
  loadGitHub();

  if (boot) {
    window.requestAnimationFrame(() => {
      window.setTimeout(() => boot.classList.add("is-done"), reduceMotion ? 0 : 720);
    });
  }
})();
