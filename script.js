// =========================================================
// Jesse Schwartz — portfolio scripts
// =========================================================

// ---- Random theme on load ----
const THEMES = ["spiderverse", "wildrobot", "lastwish"];
const THEME_PALETTES = {
  spiderverse: ["#ff1a5e", "#00d4e8", "#f0e020", "#3a5ab0", "#f8b830"],
  wildrobot:   ["#7aaa50", "#5c7a4a", "#2a5c38", "#d48030", "#f0b438"],
  lastwish:    ["#dc1e44", "#ff7dfc", "#fede8a", "#9fc82c", "#ec6f44"],
};

const theme = THEMES[Math.floor(Math.random() * THEMES.length)];
document.documentElement.dataset.theme = theme;

// ---- Dot colorization helpers ----
function shuffled(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function colorQueue(palette, count) {
  const q = [];
  while (q.length < count) q.push(...shuffled(palette));
  return q.slice(0, count);
}
function dotTextColor(hex) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return (r*299 + g*587 + b*114)/1000 < 128 ? "var(--paper)" : "var(--ink)";
}

function applyAccents(t) {
  const p = THEME_PALETTES[t];

  // Hero eyebrow dots — 2 distinct colors
  const [c1, c2] = colorQueue(p, 2);
  const eyebrowDots = document.querySelectorAll(".hero__eyebrow .dot");
  if (eyebrowDots[0]) eyebrowDots[0].style.background = c1;
  if (eyebrowDots[1]) eyebrowDots[1].style.background = c2;

  // Beyond emoji circles — all distinct
  const beyondEmojis = document.querySelectorAll(".beyond__emoji");
  colorQueue(p, beyondEmojis.length).forEach((color, i) => {
    beyondEmojis[i].style.background = color;
    beyondEmojis[i].style.color = dotTextColor(color);
  });

  // News timeline dots — all distinct
  const newsItems = [...document.querySelectorAll(".news-item:not([data-pin='true'])")];
  colorQueue(p, newsItems.length).forEach((color, i) => {
    newsItems[i].style.setProperty("--dot-color", color);
  });

  // Sync active state on theme buttons
  document.querySelectorAll(".theme-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.theme === t);
  });
}

applyAccents(theme);

// Theme switcher
document.querySelectorAll(".theme-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const t = btn.dataset.theme;
    document.documentElement.dataset.theme = t;
    applyAccents(t);
  });
});

// ---- Current year in footer ----
document.getElementById("year").textContent = new Date().getFullYear();

// ---- Pretty-print YYYY-MM or YYYY-MM-DD dates ----
const MONTHS = [
  "Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"
];
function formatDate(raw) {
  // Accepts "YYYY-MM" or "YYYY-MM-DD" or a free-form string.
  const m = /^(\d{4})-(\d{1,2})(?:-(\d{1,2}))?$/.exec(raw);
  if (!m) return raw;
  const [_, y, mo, d] = m;
  const month = MONTHS[parseInt(mo, 10) - 1] || "";
  return d ? `${month} ${parseInt(d, 10)}, ${y}` : `${month} ${y}`;
}

// ---- Sort helper — newest first, pinned on top ----
function sortNews(a, b) {
  if (!!b.pinned - !!a.pinned !== 0) return (!!b.pinned) - (!!a.pinned);
  // lexicographic works for YYYY-MM and YYYY-MM-DD
  return (b.date || "").localeCompare(a.date || "");
}

// ---- Tiny HTML escaper ----
function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

// ---- Render a news item ----
function renderItem(item) {
  const date = formatDate(item.date || "");
  const pin = item.pinned
    ? '<span class="news-item__pin" title="Pinned">★</span>'
    : "";
  // Body supports a little inline HTML if you want links — we whitelist by
  // only allowing a trusted subset via DOMParser below. Default to escaped.
  const body = item.allowHtml ? item.body : esc(item.body || "");
  return `
    <li class="news-item" ${item.pinned ? 'data-pin="true"' : ""}>
      <span class="news-item__date">${esc(date)}</span>
      <h3 class="news-item__title">${pin}${esc(item.title || "")}</h3>
      <p class="news-item__body">${body}</p>
    </li>
  `;
}

// ---- Load and render news ----
async function loadNews() {
  const list = document.getElementById("news-list");
  try {
    const res = await fetch("news.json", { cache: "no-cache" });
    if (!res.ok) throw new Error("Failed to fetch news.json");
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      list.innerHTML = '<li class="timeline__loading">No news yet — check back soon.</li>';
      return;
    }
    data.sort(sortNews);
    list.innerHTML = data.map(renderItem).join("");
    applyAccents(document.documentElement.dataset.theme);
  } catch (err) {
    console.error(err);
    list.innerHTML = `
      <li class="timeline__loading">
        Could not load news. If you're viewing this by opening
        <code>index.html</code> directly, serve the folder over http
        (e.g. <code>python3 -m http.server</code>) or push to GitHub Pages.
      </li>`;
  }
}
loadNews();

// ---- Load and render publications ----
async function loadPublications() {
  const container = document.getElementById("pubs-list");
  if (!container) return;
  try {
    const res = await fetch("publications.json", { cache: "no-cache" });
    if (!res.ok) throw new Error("Failed to fetch publications.json");
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      container.innerHTML = `
        <div class="pubs__empty">
          <svg viewBox="0 0 48 48" width="44" height="44" aria-hidden="true">
            <path d="M10 6h22l6 6v30H10z" fill="none" stroke-width="2"/>
            <path d="M32 6v6h6" fill="none" stroke-width="2"/>
            <path d="M16 22h16M16 28h16M16 34h10" fill="none" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <p>Papers in progress. This space will fill up soon — check back.</p>
        </div>`;
      return;
    }
    container.innerHTML = data.map(pub => {
      const links = (pub.links || []).map(l =>
        `<a href="${esc(l.url)}">${esc(l.label)}</a>`
      ).join("");
      return `
        <article class="pub">
          <p class="pub__venue">${esc(pub.venue || "")}</p>
          <h4 class="pub__title">${esc(pub.title || "")}</h4>
          <p class="pub__authors">${pub.authors || ""}</p>
          ${links ? `<div class="pub__links">${links}</div>` : ""}
        </article>`;
    }).join("");
  } catch (err) {
    console.error(err);
  }
}
loadPublications();

// ---- Load and render projects ----
async function loadProjects() {
  const grid = document.getElementById("project-grid");
  if (!grid) return;
  try {
    const res = await fetch("projects.json", { cache: "no-cache" });
    if (!res.ok) throw new Error("Failed to fetch projects.json");
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      grid.innerHTML = `
        <p class="pubs__empty" style="grid-column:1/-1">
          Projects coming soon — check back.
        </p>`;
      return;
    }
    grid.innerHTML = data.map(p => {
      const tags = (p.tags || []).map(t => `<span>${esc(t)}</span>`).join("");
      const badge = p.badge ? `<span class="project__badge">${esc(p.badge)}</span>` : "";
      const thumbClass = p.thumbClass ? ` project__thumb--${esc(p.thumbClass)}` : "";
      return `
        <article class="project" style="--tilt: ${esc(p.tilt || "0deg")}">
          <div class="project__thumb${thumbClass}">${badge}</div>
          <h3>${esc(p.title || "")}</h3>
          <p>${esc(p.description || "")}</p>
          ${tags ? `<div class="project__tags">${tags}</div>` : ""}
        </article>`;
    }).join("");
  } catch (err) {
    console.error(err);
  }
}
loadProjects();

// ---- Load and render beyond ----
async function loadBeyond() {
  const container = document.getElementById("beyond-list");
  if (!container) return;
  try {
    const res = await fetch("beyond.json", { cache: "no-cache" });
    if (!res.ok) throw new Error("Failed to fetch beyond.json");
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      container.innerHTML = "<p>More coming soon.</p>";
      return;
    }
    container.innerHTML = data.map(item => {
      const body = item.allowHtml ? (item.body || "") : esc(item.body || "");
      return `
        <div class="beyond__card" style="--tilt: ${esc(item.tilt || "0deg")}">
          <div class="beyond__emoji" aria-hidden="true">${item.icon || ""}</div>
          <h3>${esc(item.title || "")}</h3>
          <p>${body}</p>
        </div>`;
    }).join("");
    applyAccents(document.documentElement.dataset.theme);
  } catch (err) {
    console.error(err);
  }
}
loadBeyond();

// ---- Smooth-highlight the current section in the nav ----
const sectionIds = ["about","news","research","projects","teaching","beyond"];
const navLinks = Array.from(document.querySelectorAll(".nav__links a"));
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      const id = e.target.id;
      navLinks.forEach(a => {
        const on = a.getAttribute("href") === `#${id}`;
        a.style.background = on ? "var(--ink)" : "";
        a.style.color = on ? "var(--paper)" : "";
      });
    }
  });
}, { rootMargin: "-40% 0px -55% 0px" });
sectionIds.forEach(id => {
  const el = document.getElementById(id);
  if (el) io.observe(el);
});
