/* ============================================================
   Acquaint Media — site config: prices + currency converter
   ------------------------------------------------------------
   The ONLY set prices are in Canadian dollars (below). Visitors pick a
   currency in the nav (assets/pricing.js) and see these CAD prices converted
   at today's exchange rate, rounded to clean figures. A note under the prices
   says they are converted from CAD whenever another currency is showing.

   - Rates: fetched daily from the free currency-api feed (jsDelivr, with a
     mirror); cached per visitor for 12 hours; fallbackRates below are used if
     both feeds are unreachable. Refresh the snapshot with scripts/sync_prices.py --rates
   - Default currency: CAD; a page can set <body data-prices="PKR"> (the /pk page).
   - The visitor's pick is remembered in localStorage ("acq_currency"). Never a redirect.
   - After changing anything here, run:  python scripts/sync_prices.py
     (re-stamps the no-JS fallback prices, JSON-LD offers in CAD and meta descriptions).
   ============================================================ */
window.ACQ_CONFIG = {
  base: "CAD",
  /* set prices, in CAD, before tax */
  prices: { WEB_MONTHLY: 100, WEB_ONETIME: 1000, SEO_MONTHLY: 400 },
  defaultCurrency: "CAD",

  /* picker order: [code, name] */
  currencies: [
    ["CAD","Canadian dollar"],
    ["USD","US dollar"],
    ["EUR","Euro"],
    ["GBP","British pound"],
    ["AUD","Australian dollar"],
    ["NZD","New Zealand dollar"],
    ["AED","UAE dirham"],
    ["SAR","Saudi riyal"],
    ["QAR","Qatari riyal"],
    ["KWD","Kuwaiti dinar"],
    ["PKR","Pakistani rupee"],
    ["INR","Indian rupee"],
    ["BDT","Bangladeshi taka"],
    ["SGD","Singapore dollar"],
    ["HKD","Hong Kong dollar"],
    ["JPY","Japanese yen"],
    ["CNY","Chinese yuan"],
    ["CHF","Swiss franc"],
    ["ZAR","South African rand"],
    ["NGN","Nigerian naira"],
    ["MXN","Mexican peso"],
    ["BRL","Brazilian real"],
    ["TRY","Turkish lira"],
    ["MYR","Malaysian ringgit"],
    ["PHP","Philippine peso"]
  ],

  ratesUrls: [
    "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/cad.json",
    "https://latest.currency-api.pages.dev/v1/currencies/cad.json"
  ],
  /* 1 CAD = x units; snapshot used only when the feeds are unreachable */
  fallbackRatesDate: "2026-10-17",
  fallbackRates: { usd: 0.707135, eur: 0.629178, gbp: 0.530526, aud: 1.017934, nzd: 1.251168, aed: 2.596953, sar: 2.651756, qar: 2.573971, kwd: 0.219812, pkr: 195.792345, inr: 67.157395, bdt: 86.981512, sgd: 0.904827, hkd: 5.54993, jpy: 111.74671, cny: 4.728826, chf: 0.583055, zar: 11.652925, ngn: 941.480933, mxn: 13.075915, brl: 3.580772, try: 35.058736, myr: 2.888036, php: 44.544808 }
};
