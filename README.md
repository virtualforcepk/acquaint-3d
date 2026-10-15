# Acquaint Media — site

Marketing site for **Acquaint Media** (Brampton, ON — premium websites and monthly SEO). A fast, multi-page static site with a WebGL particle-shape hero on every page and per-page SEO.

## Pages
| Route | What it is | 3D shape |
|-------|------------|----------|
| `/` | Home: two products, founder pricing, proof, how it works, FAQ | arrow mark |
| `/website` | Product 1 — Premium Website (managed vs one-time build) | dragon |
| `/seo` | Product 2 — SEO Optimization | orb |
| `/pk` | Self-contained offer page priced in PKR (products, plans table, SEO detail, FAQ) | arrow mark |
| `/about` | Founder and track record | arrow mark |
| `/blog` | Posts | orb |
| `/work/*` | Case studies | various |
| `/privacy` | Privacy policy | none |

Removed routes `/lead-gen`, `/app`, `/industries/*`, and `/ads-management-services-mississauga` are 301-redirected in `vercel.json`.

## Prices and the tier counter
`site.config.js` is the **single source of truth** for every price on the site: two independent lists, the founder-pricing counter (`TIER`, `SPOTS_LEFT`), and the optional WhatsApp number. The main site (`/`, `/website`, `/seo`) shows the **CA** list only. The separate `/pk` page shows the **PK** list only, selected by `<body data-prices="PK">`. There is no toggle and no redirect. `assets/pricing.js` fills every `[data-price]` element from the page's list.

The HTML also carries the CA values as a no-JS fallback and inside JSON-LD. After editing `site.config.js`, run:

```bash
python scripts/sync_prices.py
```

It re-stamps the fallbacks, the JSON-LD offer prices, and regenerates the home FAQPage schema from the visible FAQ text. Idempotent.

## Stack
Static HTML + CSS + vanilla JS. The particle engine is `assets/app.js` (Three.js r128, loaded from CDN). Shared `assets/styles.css`. No build step.

## Run locally
Root-relative paths need a real HTTP server (not `file://`):

```bash
python -m http.server 5192
# then open http://localhost:5192
```

## SEO
Every page ships its own `<title>`, meta description, canonical, Open Graph + Twitter, and JSON-LD (Organization, ProfessionalService, Service with CAD offers; FAQPage on the home page only); single `<h1>`; `lang="en-CA"`. `robots.txt` + `sitemap.xml` are at the root.

## Analytics
`assets/analytics.js` loads GA4 and Vercel Web Analytics (the latter stays inert until enabled in the Vercel dashboard).

## Deploy
Hosted on Vercel; every push to `main` is production. Preview deployments build from branches. `docs/` and `scripts/` are excluded from deploys via `.vercelignore`.
