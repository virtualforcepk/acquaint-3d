# Acquaint Media — 3D site

Marketing site for **Acquaint Media** (Mississauga, ON — lead-gen systems, conversion websites, and an AI receptionist app). A fast, multi-page static site with a WebGL particle-shape hero on every page and per-page SEO.

## Pages
| Route | 3D shape |
|-------|----------|
| `/` Home | arrow mark |
| `/website` | orb |
| `/app` | Ethereum diamond |
| `/lead-gen` | brilliant-cut diamond |
| `/about` | arrow mark + founder |

## Stack
Static HTML + CSS + vanilla JS. The particle engine is `assets/app.js` (Three.js r128, loaded from CDN). Shared `assets/styles.css`. No build step.

## Run locally
Root-relative paths need a real HTTP server (not `file://`):

```bash
python -m http.server 5192
# then open http://localhost:5192
```

## SEO
Every page ships its own `<title>`, meta description, canonical, Open Graph + Twitter, and JSON-LD (Organization, LocalBusiness, Service); single `<h1>`; `lang="en-CA"`. `robots.txt` + `sitemap.xml` are at the root. Audited at Lighthouse SEO 100 / on-page 100.

## Analytics
`assets/analytics.js` is wired but inert — set a real GA4 Measurement ID in its `ID` constant to activate (no requests or cookies until then).

## Deploy notes
Paths are **root-relative** (`/assets/...`, `/website`, `/founder.jpg`), so the site must be served from a domain **root** — a custom domain (e.g. `acquaintmedia.ai`) or a `*.github.io` root site. A GitHub Pages *project* subpath (`user.github.io/acquaint-3d/`) would break those paths without a base-path adjustment.
