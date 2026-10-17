/* ============================================================
   Acquaint Media — site config: prices, founder-pricing tier, contact
   ------------------------------------------------------------
   SINGLE SOURCE OF TRUTH for every price shown on the site.

   - Two INDEPENDENT price lists, never conversions of each other:
       CA  -> the main site (/, /website, /seo)
       PK  -> the separate PKR page (/pk)
     A page picks its list with <body data-prices="PK">; no attribute = CA.
     There is no toggle and no redirect. Never show a converted figure.
   - Keep each string as a plain amount ("CAD 100"). The page copy
     adds "/ month + tax" (monthly) or "one-time" (build) around it.
   - The HTML also carries these values as a no-JS fallback, inside
     JSON-LD and in meta descriptions. After changing anything below, run
         python scripts/sync_prices.py
     to re-stamp them (idempotent, safe to re-run).
   ============================================================ */
window.ACQ_CONFIG = {
  prices: {
    CA: { WEB_MONTHLY: "CAD 100",    WEB_ONETIME: "CAD 1,000",   SEO_MONTHLY: "CAD 400"    },
    PK: { WEB_MONTHLY: "PKR 20,000", WEB_ONETIME: "PKR 200,000", SEO_MONTHLY: "PKR 80,000" }
  },

  /* Founder-pricing ladder RETIRED (owner, 2026-10-16): no price-increase messaging on the site.
     These values are unused and kept only so scripts/sync_prices.py keeps working. */
  TIER: 1,
  SPOTS_LEFT: 5,
  SPOTS_PER_TIER: 5
};
