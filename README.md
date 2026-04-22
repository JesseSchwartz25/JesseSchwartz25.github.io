# Jesse Schwartz — Portfolio

A single-page portfolio with a painterly / comic-book / storybook theme
(think *The Wild Robot* × *Spider-Verse* × *Puss in Boots: The Last Wish*).
Pure HTML/CSS/JS — no build step.

## Structure

```
.
├── index.html      ← page markup & all sections
├── styles.css      ← theme (palette, halftones, ink, paper grain)
├── script.js       ← loads news.json, nav highlight
├── news.json       ← the news feed (edit this!)
├── assets/
│   └── cv.pdf      ← drop your resume PDF here
├── .nojekyll       ← tells GitHub Pages to serve files as-is
└── README.md
```

## Deploy to GitHub Pages

1. Create a new repo. The easiest path is to name it **`<your-username>.github.io`**
   — then the site lives at `https://<your-username>.github.io/` with no extra config.
2. Copy every file in this folder into the repo and push.
3. In the repo on GitHub: **Settings → Pages → Build and deployment**, set source to
   `Deploy from a branch`, branch `main`, folder `/ (root)`.
4. Give it a minute — your site will be live.

If you want the site at a project URL instead (e.g.
`https://<username>.github.io/portfolio`), that works too — no changes needed,
all paths are relative.

## Update the site

### Add a news item
Open `news.json`. Entries look like this:

```json
{
  "date": "2026-05",
  "title": "Paper accepted at SIGGRAPH",
  "body": "Our work on painterly real-time shading will appear at SIGGRAPH 2026.",
  "pinned": true
}
```

- `date` — `"YYYY-MM"` or `"YYYY-MM-DD"`. Sorted newest first automatically.
- `title` — short line that goes on the card.
- `body` — one or two sentences.
- `pinned` — optional, `true` floats the entry to the top with a red marker.

Commit, push — the site updates.

### Replace the placeholder names
Search the repo for `YOUR-GITHUB-USERNAME` and `YOUR-LINKEDIN` and swap in
your handles. They appear in `index.html` only.

### Add your CV
Put a PDF named `cv.pdf` at `assets/cv.pdf`. The "Download CV" button already
points there.

### Fill in projects / publications
In `index.html`:
- Projects: duplicate an `<article class="project">` block, swap the thumbnail
  gradient class (`project__thumb--forest` / `--sunset` / `--dusk`) or replace
  the `<div class="project__thumb">` with an `<img>` for a real image.
- Publications: there's a commented-out `<article class="pub">` template inside
  the Research section — uncomment and edit when you have papers.

### Tweak the theme
All colors live as CSS custom properties at the top of `styles.css` (`:root { ... }`).
Change `--magenta`, `--cyan`, `--forest`, etc. and the whole site reflows.

## Local preview

Because the page fetches `news.json`, you need to serve it over http —
double-clicking `index.html` won't load the news list. Easiest:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Credits

- Fonts: [Fraunces](https://fonts.google.com/specimen/Fraunces),
  [Caveat Brush](https://fonts.google.com/specimen/Caveat+Brush),
  [Lora](https://fonts.google.com/specimen/Lora) — all via Google Fonts.
- Inspiration: *The Wild Robot* (DreamWorks), *Spider-Man: Into / Across the Spider-Verse* (Sony),
  *Puss in Boots: The Last Wish* (DreamWorks).
