(function () {
  const TOKEN_KEY = "sa-admin-gh-token";
  const SITE_JSON = "../data/site.json";

  let data = null;

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  function toast(msg) {
    const el = $("#toast");
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => {
      el.hidden = true;
    }, 3200);
  }

  function escapeAttr(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;");
  }

  function field(label, name, value, type = "text") {
    const v = escapeAttr(value ?? "");
    if (type === "textarea") {
      return `<label>${label}<textarea name="${name}">${v}</textarea></label>`;
    }
    return `<label>${label}<input type="${type}" name="${name}" value="${v}"></label>`;
  }

  function tagsInput(value) {
    const v = Array.isArray(value) ? value.join(", ") : value || "";
    return field("Tags (comma-separated)", "tags", v);
  }

  /* ---------- render panels ---------- */

  function renderProfile() {
    const p = data.profile || {};
    const panel = $('[data-panel="profile"]');
    panel.innerHTML = `
      <article class="card">
        <h2>Basic info</h2>
        <div class="grid-2">
          ${field("Name", "name", p.name)}
          ${field("Role", "role", p.role)}
          ${field("Location", "location", p.location)}
          ${field("Status badge", "status", p.status)}
        </div>
        ${field("Bio", "bio", p.bio, "textarea")}
        ${field("Tagline", "tagline", p.tagline, "textarea")}
      </article>
      <article class="card">
        <h2>Contact links</h2>
        <div class="grid-2">
          ${field("Email", "email", p.email, "email")}
          ${field("Phone (display)", "phone", p.phone)}
          ${field("Phone (tel link, digits)", "phoneHref", p.phoneHref)}
          ${field("Portfolio label", "portfolio", p.portfolio)}
          ${field("Portfolio URL", "portfolioUrl", p.portfolioUrl, "url")}
          ${field("GitHub label", "github", p.github)}
          ${field("GitHub URL", "githubUrl", p.githubUrl, "url")}
          ${field("LinkedIn label", "linkedin", p.linkedin)}
          ${field("LinkedIn URL", "linkedinUrl", p.linkedinUrl, "url")}
        </div>
      </article>`;
  }

  function renderList(key, title, fieldsFn, blank) {
    const panel = $(`[data-panel="${key}"]`);
    const items = data[key] || [];
    panel.innerHTML = `
      <article class="card">
        <div class="item-head">
          <h2>${title}</h2>
          <button type="button" class="btn sm" data-add="${key}">+ Add</button>
        </div>
        <div class="list" data-list="${key}"></div>
      </article>`;
    const list = $(`[data-list="${key}"]`, panel);
    items.forEach((item, i) => {
      list.insertAdjacentHTML(
        "beforeend",
        `<div class="item" data-index="${i}">
          <div class="item-head">
            <strong>#${i + 1}</strong>
            <button type="button" class="btn sm danger" data-remove="${key}" data-i="${i}">Remove</button>
          </div>
          ${fieldsFn(item, i)}
        </div>`
      );
    });
    panel.querySelector(`[data-add="${key}"]`).onclick = () => {
      collectAll();
      data[key] = data[key] || [];
      data[key].push(JSON.parse(JSON.stringify(blank)));
      renderList(key, title, fieldsFn, blank);
    };
    $$("[data-remove]", panel).forEach((btn) => {
      btn.onclick = () => {
        collectAll();
        data[key].splice(Number(btn.dataset.i), 1);
        renderList(key, title, fieldsFn, blank);
      };
    });
  }

  function eduFields(item) {
    return `
      ${field("Title", "title", item.title)}
      ${field("Detail", "detail", item.detail, "textarea")}
      <div class="grid-2">
        ${field("Logo path", "logo", item.logo)}
        ${field("Logo alt", "logoAlt", item.logoAlt)}
        ${field("Badge (optional)", "badge", item.badge)}
      </div>`;
  }

  function expFields(item) {
    return `
      <div class="grid-2">
        ${field("Title", "title", item.title)}
        ${field("Dates", "dates", item.dates)}
        ${field("Organization", "org", item.org)}
        ${field("Place", "place", item.place)}
        ${field("Logo path", "logo", item.logo)}
        ${field("Logo alt", "logoAlt", item.logoAlt)}
      </div>
      ${field("Description", "text", item.text, "textarea")}`;
  }

  function projectFields(item) {
    return `
      <div class="grid-2">
        ${field("Title", "title", item.title)}
        ${field("Organization", "org", item.org)}
        ${field("Meta line", "meta", item.meta)}
        ${field("Domain label", "domain", item.domain)}
        ${field("URL", "url", item.url, "url")}
        ${field("Logo path", "logo", item.logo)}
        ${field("Logo alt", "logoAlt", item.logoAlt)}
      </div>
      ${field("Description", "text", item.text, "textarea")}
      ${tagsInput(item.tags)}`;
  }

  function skillFields(item) {
    return `
      ${field("Title", "title", item.title)}
      ${field("Text", "text", item.text, "textarea")}`;
  }

  function achievementFields(item) {
    return `
      ${field("Title", "title", item.title)}
      ${field("Detail", "detail", item.detail)}`;
  }

  function renderSkillsExtra() {
    const panel = $('[data-panel="skills"]');
    const tech = (data.technologies || []).join(", ");
    panel.insertAdjacentHTML(
      "beforeend",
      `<article class="card">
        <h2>Technology chips</h2>
        ${field("Technologies (comma-separated)", "technologies", tech)}
      </article>`
    );
  }

  function renderAll() {
    renderProfile();
    renderList("education", "Education", eduFields, {
      title: "",
      detail: "",
      logo: "",
      logoAlt: "",
      badge: "",
    });
    renderList("experience", "Experience", expFields, {
      title: "",
      dates: "",
      org: "",
      place: "",
      text: "",
      logo: "",
      logoAlt: "",
    });
    renderList("projects", "Projects", projectFields, {
      title: "",
      org: "",
      meta: "",
      text: "",
      tags: [],
      domain: "",
      url: "",
      logo: "",
      logoAlt: "",
    });
    renderList("skills", "Skills", skillFields, { title: "", text: "" });
    renderSkillsExtra();
    renderList("achievements", "Achievements", achievementFields, {
      title: "",
      detail: "",
    });
  }

  /* ---------- collect form → data ---------- */

  function readFields(root) {
    const out = {};
    $$("input[name], textarea[name]", root).forEach((el) => {
      out[el.name] = el.value.trim();
    });
    return out;
  }

  function collectAll() {
    if (!data) return;

    const profilePanel = $('[data-panel="profile"]');
    Object.assign(data.profile, readFields(profilePanel));

    ["education", "experience", "projects", "skills", "achievements"].forEach(
      (key) => {
        const list = $(`[data-list="${key}"]`);
        if (!list) return;
        data[key] = $$(".item", list).map((item) => {
          const raw = readFields(item);
          if (key === "projects") {
            raw.tags = raw.tags
              ? raw.tags.split(",").map((t) => t.trim()).filter(Boolean)
              : [];
          }
          return raw;
        });
      }
    );

    const techInput = $('[data-panel="skills"] input[name="technologies"]');
    if (techInput) {
      data.technologies = techInput.value
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    }
  }

  /* ---------- GitHub publish ---------- */

  function getToken() {
    return localStorage.getItem(TOKEN_KEY) || "";
  }

  function setToken(token) {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
    updateAuthStatus();
  }

  function updateAuthStatus() {
    const el = $("#auth-status");
    const t = getToken();
    if (t) {
      el.textContent = "Token saved in this browser · ready to publish";
      el.className = "status ok";
    } else {
      el.textContent = "Not connected — add a token above";
      el.className = "status err";
    }
  }

  function utf8ToBase64(str) {
    const bytes = new TextEncoder().encode(str);
    let binary = "";
    bytes.forEach((b) => {
      binary += String.fromCharCode(b);
    });
    return btoa(binary);
  }

  async function githubFetch(path, options = {}) {
    const token = getToken();
    if (!token) throw new Error("No GitHub token. Save one on the Publish tab first.");
    const res = await fetch("https://api.github.com" + path, {
      ...options,
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: "Bearer " + token,
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = body.message || res.statusText || "GitHub API error";
      throw new Error(msg);
    }
    return body;
  }

  async function publish() {
    collectAll();
    const meta = data.meta || {};
    const repo = meta.githubRepo || "Shafin5556/Shafin5556.github.io";
    const branch = meta.publishBranch || "gh-pages";
    const contentPath = meta.contentPath || "data/site.json";
    const message =
      $("#commit-msg").value.trim() || "Update portfolio content from admin";
    const status = $("#publish-status");
    status.textContent = "Publishing…";
    status.className = "status";

    try {
      const encodedPath = contentPath
        .split("/")
        .map(encodeURIComponent)
        .join("/");
      let sha;
      try {
        const existing = await githubFetch(
          `/repos/${repo}/contents/${encodedPath}?ref=${encodeURIComponent(branch)}`
        );
        sha = existing.sha;
      } catch (_) {
        sha = undefined;
      }

      const content = utf8ToBase64(JSON.stringify(data, null, 2) + "\n");
      const payload = {
        message,
        content,
        branch,
      };
      if (sha) payload.sha = sha;

      await githubFetch(`/repos/${repo}/contents/${encodedPath}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      status.textContent =
        "Published. Live site usually updates within ~1 minute. Hard-refresh if needed.";
      status.className = "status ok";
      toast("Published to GitHub Pages");
    } catch (err) {
      status.textContent = "Publish failed: " + err.message;
      status.className = "status err";
      toast("Publish failed");
    }
  }

  /* ---------- tabs ---------- */

  const titles = {
    profile: "Profile",
    education: "Education",
    experience: "Experience",
    projects: "Projects",
    skills: "Skills",
    achievements: "Achievements",
    publish: "Publish",
  };

  function switchTab(tab) {
    collectAll();
    $$(".nav-btn").forEach((b) => b.classList.toggle("is-active", b.dataset.tab === tab));
    $$(".panel").forEach((p) => p.classList.toggle("is-active", p.dataset.panel === tab));
    $("#tab-title").textContent = titles[tab] || tab;
  }

  /* ---------- init ---------- */

  async function init() {
    $$(".nav-btn").forEach((btn) => {
      btn.addEventListener("click", () => switchTab(btn.dataset.tab));
    });
    $("#save-token").onclick = () => {
      setToken($("#gh-token").value.trim());
      toast("Token saved");
    };
    $("#clear-token").onclick = () => {
      $("#gh-token").value = "";
      setToken("");
      toast("Token cleared");
    };
    $("#publish-btn").onclick = publish;
    $("#quick-publish").onclick = () => {
      switchTab("publish");
      publish();
    };

    const saved = getToken();
    if (saved) $("#gh-token").value = saved;
    updateAuthStatus();

    try {
      const res = await fetch(SITE_JSON + "?t=" + Date.now());
      if (!res.ok) throw new Error("Could not load site.json");
      data = await res.json();
      if (!data.meta) {
        data.meta = {
          githubUser: "Shafin5556",
          githubRepo: "Shafin5556/Shafin5556.github.io",
          publishBranch: "gh-pages",
          contentPath: "data/site.json",
        };
      }
      renderAll();
    } catch (err) {
      toast(err.message);
      $('[data-panel="profile"]').innerHTML =
        `<article class="card"><p class="status err">${escapeAttr(err.message)}</p></article>`;
    }
  }

  init();
})();
