(function () {
  const escapeHtml = (str) =>
    String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el && value != null) el.textContent = value;
  }

  function setHtml(id, value) {
    const el = document.getElementById(id);
    if (el && value != null) el.innerHTML = value;
  }

  function applyProfile(p) {
    if (!p) return;
    document.querySelectorAll("[data-bind-name]").forEach((el) => {
      el.textContent = p.name || el.textContent;
    });
    document.querySelectorAll("[data-bind-role]").forEach((el) => {
      el.textContent = p.role || el.textContent;
    });

    setText("bind-hero-name", p.name);
    setText("bind-hero-line", (p.role || "") + " · " + (p.location || ""));
    setText("bind-status", p.status);
    setText("bind-bio", p.bio);
    setText("bind-tagline", p.tagline);

    const emailTile = document.getElementById("bind-email-tile");
    if (emailTile) {
      emailTile.href = "mailto:" + (p.email || "");
      const span = emailTile.querySelector(".tile-text span");
      if (span) span.textContent = p.email || "";
    }
    const phoneTile = document.getElementById("bind-phone-tile");
    if (phoneTile) {
      phoneTile.href = "tel:" + (p.phoneHref || p.phone || "");
      const span = phoneTile.querySelector(".tile-text span");
      if (span) span.textContent = p.phone || "";
    }
    const portTile = document.getElementById("bind-portfolio-tile");
    if (portTile) {
      portTile.href = p.portfolioUrl || "#";
      const span = portTile.querySelector(".tile-text span");
      if (span) span.textContent = p.portfolio || "";
    }
    const ghTile = document.getElementById("bind-github-tile");
    if (ghTile) {
      ghTile.href = p.githubUrl || "#";
      const span = ghTile.querySelector(".tile-text span");
      if (span) span.textContent = p.github || "";
    }

    const ghLink = document.getElementById("bind-gh-handle");
    if (ghLink) {
      ghLink.href = p.githubUrl || "#";
      ghLink.textContent = "@" + (p.githubUrl || "").replace(/^https?:\/\/github\.com\//, "") || "@Shafin5556";
    }

    // Contact page tiles
    const map = [
      ["bind-c-email", "mailto:" + (p.email || ""), p.email],
      ["bind-c-phone", "tel:" + (p.phoneHref || ""), p.phone],
      ["bind-c-linkedin", p.linkedinUrl, p.linkedin],
      ["bind-c-github", p.githubUrl, p.github],
      ["bind-c-portfolio", p.portfolioUrl, p.portfolio],
    ];
    map.forEach(([id, href, label]) => {
      const el = document.getElementById(id);
      if (!el) return;
      if (href) el.href = href;
      const span = el.querySelector(".tile-text span");
      if (span && label) span.textContent = label;
    });

  }

  function renderEducation(items) {
    const box = document.getElementById("bind-education");
    if (!box || !Array.isArray(items)) return;
    box.innerHTML = items
      .map((item) => {
        const badge = item.badge
          ? '<span class="badge">' + escapeHtml(item.badge) + "</span>"
          : "";
        return (
          '<div class="list-item"><img src="' +
          escapeHtml(item.logo || "") +
          '" alt="' +
          escapeHtml(item.logoAlt || "") +
          '" width="44" height="44"><div><strong>' +
          escapeHtml(item.title) +
          "</strong><p>" +
          escapeHtml(item.detail) +
          "</p>" +
          badge +
          "</div></div>"
        );
      })
      .join("");
  }

  function renderExperience(items) {
    const box = document.getElementById("bind-experience");
    if (!box || !Array.isArray(items)) return;
    box.innerHTML = items
      .map(
        (job) =>
          '<article class="settings-card reveal is-in"><div class="job"><img src="' +
          escapeHtml(job.logo || "") +
          '" alt="' +
          escapeHtml(job.logoAlt || "") +
          '" width="56" height="56"><div><div class="job-top"><h3>' +
          escapeHtml(job.title) +
          "</h3><span>" +
          escapeHtml(job.dates) +
          '</span></div><p class="org">' +
          escapeHtml(job.org) +
          '</p><p class="muted">' +
          escapeHtml(job.place) +
          "</p><p>" +
          escapeHtml(job.text) +
          "</p></div></div></article>"
      )
      .join("");
  }

  function renderProjects(items) {
    const box = document.getElementById("bind-projects");
    if (!box || !Array.isArray(items)) return;
    box.innerHTML = items
      .map((p) => {
        const tags = (p.tags || [])
          .map((t) => "<span>" + escapeHtml(t) + "</span>")
          .join("");
        return (
          '<article class="settings-card project-card reveal is-in"><div class="project-head"><img src="' +
          escapeHtml(p.logo || "") +
          '" alt="' +
          escapeHtml(p.logoAlt || "") +
          '" width="64" height="64"><div><h3>' +
          escapeHtml(p.title) +
          '</h3><p class="org">' +
          escapeHtml(p.org) +
          '</p><p class="muted">' +
          escapeHtml(p.meta) +
          "</p></div></div><p>" +
          escapeHtml(p.text) +
          '</p><div class="tags">' +
          tags +
          '</div><div class="project-actions"><a class="project-domain" href="' +
          escapeHtml(p.url) +
          '" target="_blank" rel="noopener">' +
          escapeHtml(p.domain) +
          '</a><a class="btn btn-primary" href="' +
          escapeHtml(p.url) +
          '" target="_blank" rel="noopener">Open live project</a></div></article>'
        );
      })
      .join("");
  }

  function renderSkills(skills, technologies) {
    const box = document.getElementById("bind-skills");
    if (!box) return;
    const cards = (skills || [])
      .map(
        (s) =>
          '<article class="settings-card reveal is-in"><h3>' +
          escapeHtml(s.title) +
          "</h3><p>" +
          escapeHtml(s.text) +
          "</p></article>"
      )
      .join("");
    const tech =
      '<article class="settings-card reveal is-in"><h3>Technologies</h3><div class="tags">' +
      (technologies || []).map((t) => "<span>" + escapeHtml(t) + "</span>").join("") +
      "</div></article>";
    box.innerHTML = cards + tech;
  }

  function renderAchievements(items) {
    const box = document.getElementById("bind-achievements");
    if (!box || !Array.isArray(items)) return;
    box.innerHTML = items
      .map(
        (a) =>
          '<div class="list-item"><div><strong>' +
          escapeHtml(a.title) +
          "</strong><p>" +
          escapeHtml(a.detail) +
          "</p></div></div>"
      )
      .join("");
  }

  async function loadContent() {
    try {
      const res = await fetch("data/site.json?t=" + Date.now());
      if (!res.ok) throw new Error("content missing");
      const data = await res.json();
      window.__SITE_CONTENT__ = data;
      applyProfile(data.profile);
      renderEducation(data.education);
      renderExperience(data.experience);
      renderProjects(data.projects);
      renderSkills(data.skills, data.technologies);
      renderAchievements(data.achievements);
      document.dispatchEvent(new CustomEvent("site-content-ready", { detail: data }));
    } catch (err) {
      console.warn("Content load skipped:", err);
    }
  }

  loadContent();
})();
