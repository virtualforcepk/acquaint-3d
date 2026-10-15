/* ============================================================
   Acquaint Media — site config: prices, founder-pricing tier, contact
   ------------------------------------------------------------
   SINGLE SOURCE OF TRUTH for every price shown on the site.

   - Prices are two INDEPENDENT lists (CA and PK). They are not
     conversions of each other. Never add a third currency,
     never add an "approx." figure.
   - Keep each string as a plain amount ("CAD 100"). The page copy
     adds "/ month + tax" (monthly) or "one-time" (build) around it.
   - The CA | PK toggle in the nav swaps every [data-price] element
     (assets/pricing.js). Default region: CA. The visitor's choice is
     remembered in localStorage under "acq_region". Never a redirect.
   - The HTML files also carry the CA values as a no-JS fallback and
     inside JSON-LD. After changing anything below, run
         python scripts/sync_prices.py
     to re-stamp those fallbacks (idempotent, safe to re-run).
   ============================================================ */
window.ACQ_CONFIG = {
  defaultRegion: "CA",

  prices: {
    CA: { WEB_MONTHLY: "CAD 100",    WEB_ONETIME: "CAD 1,000",   SEO_MONTHLY: "CAD 400"    },
    PK: { WEB_MONTHLY: "PKR 20,000", WEB_ONETIME: "PKR 200,000", SEO_MONTHLY: "PKR 80,000" }
  },

  /* Founder pricing ladder: prices rise 25% every five monthly clients.
     Update TIER and SPOTS_LEFT by hand as clients sign. The home-page
     counter reads: "Tier {TIER} pricing - {SPOTS_LEFT} of {SPOTS_PER_TIER} spots left". */
  TIER: 1,
  SPOTS_LEFT: 5,
  SPOTS_PER_TIER: 5,

  /* WhatsApp CTA, shown only when the PK region is selected.
     Digits only, country code first, e.g. "923001234567".
     Leave "" to hide the button entirely. */
  WHATSAPP_NUMBER: "",

  /* Preselect PK (first visit only) when the browser's time zone is
     Asia/Karachi or its language is a Pakistani locale (en-PK, ur-PK).
     Pure in-browser hint: no network call, no third party, no redirect.
     Set false to always start on CA. */
  GEO_HINT: true
};
