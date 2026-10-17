#!/usr/bin/env python3
"""Keep the HTML in step with site.config.js (the single source of truth for prices).

The only set prices are in CAD. Visitors convert them in the browser (assets/pricing.js).
This script stamps each page's DEFAULT currency into the HTML as the no-JS fallback:
<body data-prices="PKR"> -> PKR (converted from CAD with the config's fallback rates,
same rounding as the browser), otherwise CAD.

For every *.html file under the repo root it re-stamps:
  * every  <... data-price="KEY">...</...>   element -> the page-default currency string
  * JSON-LD Offer "price"/"priceCurrency" for the named offers -> always the CAD set price
  * meta descriptions that quote prices (see META below)
  * the FAQPage JSON-LD, regenerated from the visible <details class="faq"> text

Usage:
  python scripts/sync_prices.py           re-stamp the HTML (idempotent)
  python scripts/sync_prices.py --rates   also refresh fallbackRates in site.config.js from the live feed
"""
import html, json, math, pathlib, re, sys, urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
CFG_PATH = ROOT / "site.config.js"
cfg = CFG_PATH.read_text(encoding="utf-8")

if "--rates" in sys.argv:
    url = re.search(r'ratesUrls:\s*\[\s*"([^"]+)"', cfg).group(1)
    data = json.loads(urllib.request.urlopen(url, timeout=20).read())
    live = data["cad"]
    def repl(m):
        keys = re.findall(r"(\w+):", m.group(1))
        return "fallbackRates: { " + ", ".join(f"{k}: {round(live[k], 6)}" for k in keys if k in live) + " }"
    cfg = re.sub(r"fallbackRates:\s*\{([^}]*)\}", repl, cfg)
    cfg = re.sub(r'fallbackRatesDate:\s*"[^"]*"', f'fallbackRatesDate: "{data["date"]}"', cfg)
    CFG_PATH.write_text(cfg, encoding="utf-8")
    print("fallback rates refreshed to", data["date"])

BASE = re.search(r'base:\s*"([A-Z]{3})"', cfg).group(1)
DEFAULT = re.search(r'defaultCurrency:\s*"([A-Z]{3})"', cfg).group(1)
PRICES = {k: float(v) for k, v in re.findall(r"(WEB_MONTHLY|WEB_ONETIME|SEO_MONTHLY):\s*([\d.]+)", re.search(r"prices:\s*\{([^}]*)\}", cfg).group(1))}
RATES = {k.upper(): float(v) for k, v in re.findall(r"(\w+):\s*([\d.]+)", re.search(r"fallbackRates:\s*\{([^}]*)\}", cfg).group(1))}
RATES[BASE] = 1.0
ALIAS = {"CA": "CAD", "PK": "PKR"}

def nice(x):
    """Same rounding as assets/pricing.js: under 100 -> whole number, else 2 significant figures."""
    if x < 100:
        return max(1, round(x))
    p = 10 ** (math.floor(math.log10(x)) - 1)
    return round(x / p) * p

def price_str(cur, key):
    v = PRICES[key] if cur == BASE else nice(PRICES[key] * RATES[cur])
    return f"{cur} {int(v):,}"

OFFERS = {"Managed website": "WEB_MONTHLY", "One-time build": "WEB_ONETIME", "SEO Optimization": "SEO_MONTHLY"}
META = {
    "website/index.html": "Custom, conversion-built, mobile-first website with hosting, SSL, analytics, and weekly updates. From {WEB_MONTHLY} / month + tax, or {WEB_ONETIME} one-time.",
    "seo/index.html": "Monthly keyword work, content, local listings, and clean backlinks so buyers find you on Google and in AI search. {SEO_MONTHLY} / month + tax.",
    "property-management/index.html": "Websites and SEO for property-management companies. Built so owners find you when they search, and book a call when they land. From {WEB_MONTHLY} / month + tax.",
    "pk/index.html": "A website that brings in enquiries. SEO that makes it rank. Website from {WEB_MONTHLY} / month + tax, or {WEB_ONETIME} one-time. SEO {SEO_MONTHLY} / month + tax.",
}
strip = lambda s: html.unescape(re.sub(r"<[^>]+>", "", s)).strip()

changed = []
for p in sorted(ROOT.rglob("*.html")):
    if any(part in (".git", "node_modules", "docs") for part in p.parts):
        continue
    rel = p.relative_to(ROOT).as_posix()
    t = orig = p.read_text(encoding="utf-8")
    m = re.search(r'<body[^>]*\bdata-prices="(\w+)"', t)
    cur = ALIAS.get(m.group(1).upper(), m.group(1).upper()) if m else DEFAULT
    if cur not in RATES:
        cur = BASE
    L = {k: price_str(cur, k) for k in PRICES}
    for k, v in L.items():
        t = re.sub(r'(<[^>]*\bdata-price="' + k + r'"[^>]*>)[^<]*(</)', lambda mm: mm.group(1) + v + mm.group(2), t)
    for name, key in OFFERS.items():
        t = re.sub(r'("name":"' + re.escape(name) + r'"[^}]*?"price":")[^"]*(","priceCurrency":")[^"]*(")',
                   lambda mm: mm.group(1) + str(int(PRICES[key])) + mm.group(2) + BASE + mm.group(3), t)
    if rel in META:
        desc = META[rel].format(**L)
        t = re.sub(r'<meta name="description" content="[^"]*">', lambda mm: '<meta name="description" content="%s">' % desc, t, count=1)
    faqs = re.findall(r'<details class="faq"><summary>(.*?)</summary><p>(.*?)</p></details>', t, re.S)
    if faqs and '"FAQPage"' in t:
        obj = {"@context": "https://schema.org", "@type": "FAQPage",
               "mainEntity": [{"@type": "Question", "name": strip(q),
                               "acceptedAnswer": {"@type": "Answer", "text": strip(a)}} for q, a in faqs]}
        t = re.sub(r'\{"@context":"https://schema\.org","@type":"FAQPage".*?\]\}',
                   lambda mm: json.dumps(obj, ensure_ascii=False, separators=(",", ":")), t, count=1, flags=re.S)
    if t != orig:
        p.write_text(t, encoding="utf-8")
        changed.append(rel)

print(f"set prices ({BASE}):", {k: int(v) for k, v in PRICES.items()}, "| default", DEFAULT)
print("PKR fallback:", {k: price_str("PKR", k) for k in PRICES} if "PKR" in RATES else "n/a")
print("updated:", ", ".join(changed) if changed else "nothing (already in sync)")
