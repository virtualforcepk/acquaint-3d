/* ============================================================
   Acquaint Media — site config: prices per currency
   ------------------------------------------------------------
   SINGLE SOURCE OF TRUTH for every price shown on the site.

   - One price list per currency. These are set prices, NOT conversions.
   - Visitors pick their currency in the nav (assets/pricing.js). The choice is
     remembered in localStorage ("acq_currency"). Never a redirect.
   - Each page has a default currency: <body data-prices="PKR"> on /pk,
     otherwise the main default below. The HTML also carries the default
     currency's values as a no-JS fallback, inside JSON-LD and in meta
     descriptions. After changing anything below, run
         python scripts/sync_prices.py
     to re-stamp them (idempotent, safe to re-run).
   - Keep each string as currency code + amount ("USD 100"). The page copy
     adds "/ month + tax" (monthly) or "one-time" (build) around it.
   ============================================================ */
window.ACQ_CONFIG = {
  defaultCurrency: "CAD",

  /* order = order shown in the picker */
  prices: {
    CAD: { WEB_MONTHLY: "CAD 100",    WEB_ONETIME: "CAD 1,000",   SEO_MONTHLY: "CAD 400"    },
    USD: { WEB_MONTHLY: "USD 100",    WEB_ONETIME: "USD 1,000",   SEO_MONTHLY: "USD 400"    },
    GBP: { WEB_MONTHLY: "GBP 100",    WEB_ONETIME: "GBP 1,000",   SEO_MONTHLY: "GBP 400"    },
    AED: { WEB_MONTHLY: "AED 400",    WEB_ONETIME: "AED 4,000",   SEO_MONTHLY: "AED 1,500"  },
    PKR: { WEB_MONTHLY: "PKR 20,000", WEB_ONETIME: "PKR 200,000", SEO_MONTHLY: "PKR 80,000" }
  },

  /* Founder-pricing ladder RETIRED (owner, 2026-10-16): no price-increase messaging on the site.
     These values are unused and kept only so scripts/sync_prices.py keeps working. */
  TIER: 1,
  SPOTS_LEFT: 5,
  SPOTS_PER_TIER: 5
};
