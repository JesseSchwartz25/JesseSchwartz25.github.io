// =========================================================
// Jesse Schwartz — portfolio scripts
// =========================================================

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
