# Acquaint Media — site

Marketing site for **Acquaint Media** (Brampton, ON — premium websites and monthly SEO). A fast, multi-page static site with a WebGL particle-shape hero on every page and per-page SEO.

## Pages
| Route | What it is | 3D shape |
|-------|------------|----------|
| `/` | Home: two products, founder pricing, proof, how it works, FAQ | arrow mark |
| `/website` | Product 1 — Premium Website (managed vs one-time build) | dragon |
| `/seo` | Product 2 — SEO Optimization | orb |
| `/pk` | Self-contained offer page, defaults to PKR (products, plans table, SEO detail, FAQ) | arrow mark |
| `/property-management` | Landing page for property-management companies (not in the nav) | eth |
| `/about` | Founder and track record | arrow mark |
| `/blog` | Posts | orb |
| `/work/*` | Case studies | various |
| `/privacy` | Privacy policy | none |

Removed routes `/lead-gen`, `/app`, `/industries/*`, and `/ads-management-services-mississauga` are 301-redirected in `vercel.json`.

## Prices and the currency converter
`site.config.js` is the **single source of truth**. The only set prices are in **CAD** (website 100/month or 1,000 one-time, SEO 400/month, all before tax). Visitors pick a currency in the nav (`assets/pricing.js` injects the picker) and see those CAD prices converted at today's exchange rate, rounded to clean figures, with a note that they're converted from CAD. Rates come from the free currency-api feed on jsDelivr (mirror as backup), cached per visitor for 12 hours, with a snapshot in the config as the last resort. The choice is remembered in `localStorage` (`acq_currency`); default CAD, `/pk` defaults to PKR. Search-engine price data (JSON-LD) is always in CAD.

After editing `site.config.js`, run:

```bash
python scripts/sync_prices.py          # re-stamp fallbacks, JSON-LD, meta
python scripts/sync_prices.py --rates  # also refresh the stored rate snapshot
```

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
