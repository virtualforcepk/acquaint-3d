#!/usr/bin/env python3
"""Keep the HTML in step with site.config.js (the single source of truth for prices).

Each page uses one price list: <body data-prices="PK"> -> PK, otherwise CA.
For every *.html file under the repo root this re-stamps:
  * every  <... data-price="KEY">...</...>   element -> that list's price string
  * every  <... data-tier>...</...>          element -> "Tier N pricing - S of P spots left"
  * JSON-LD Offer "price"/"priceCurrency" for the named offers
  * meta descriptions that quote prices (see META below)
  * the FAQPage JSON-LD, regenerated from the visible <details class="faq"> text
    (so schema and visible copy can never drift apart)

Idempotent. Run:  python scripts/sync_prices.py   (prints what changed)
"""
import html, json, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent.parent
cfg = (ROOT / "site.config.js").read_text(encoding="utf-8")

def price_list(name):
    m = re.search(r"\b" + name + r"\s*:\s*\{([^}]*)\}", cfg)
    return dict(re.findall(r'(\w+)\s*:\s*"([^"]*)"', m.group(1)))

LISTS = {"CA": price_list("CA"), "PK": price_list("PK")}
num = lambda key: int(re.search(r"\b" + key + r"\s*:\s*(\d+)", cfg).group(1))
TIER_TEXT = "Tier %d pricing \u00b7 %d of %d spots left" % (num("TIER"), num("SPOTS_LEFT"), num("SPOTS_PER_TIER"))
OFFERS = {"Managed website": "WEB_MONTHLY", "One-time build": "WEB_ONETIME", "SEO Optimization": "SEO_MONTHLY"}
META = {
    "website/index.html": "Custom, conversion-built, mobile-first website with hosting, SSL, analytics, and weekly updates. From {WEB_MONTHLY} / month + tax, or {WEB_ONETIME} one-time.",
    "seo/index.html": "Monthly keyword work, content, local listings, and clean backlinks so buyers find you on Google and in AI search. {SEO_MONTHLY} / month + tax.",
    "property-management/index.html": "Websites and SEO for property-management companies. Built so owners find you when they search, and book a call when they land. From {WEB_MONTHLY} / month + tax.",
    "pk/index.html": "A website that brings in enquiries. SEO that makes it rank. Website from {WEB_MONTHLY} / month + tax, or {WEB_ONETIME} one-time. SEO {SEO_MONTHLY} / month + tax.",
}
amount = lambda s: re.sub(r"\D", "", s)          # "CAD 1,000" -> "1000"
currency = lambda s: s.split()[0]                # "CAD 1,000" -> "CAD"
strip = lambda s: html.unescape(re.sub(r"<[^>]+>", "", s)).strip()

changed = []
for p in sorted(ROOT.rglob("*.html")):
    if any(part in (".git", "node_modules", "docs") for part in p.parts):
        continue
    rel = p.relative_to(ROOT).as_posix()
    t = orig = p.read_text(encoding="utf-8")
    m = re.search(r'<body[^>]*\bdata-prices="(\w+)"', t)
    L = LISTS.get(m.group(1).upper() if m else "CA", LISTS["CA"])
    for k, v in L.items():
        t = re.sub(r'(<[^>]*\bdata-price="' + k + r'"[^>]*>)[^<]*(</)', lambda mm: mm.group(1) + v + mm.group(2), t)
    t = re.sub(r'(<[^>]*\bdata-tier\b[^>]*>)[^<]*(</)', lambda mm: mm.group(1) + TIER_TEXT + mm.group(2), t)
    for name, key in OFFERS.items():
        t = re.sub(r'("name":"' + re.escape(name) + r'"[^}]*?"price":")[^"]*(","priceCurrency":")[^"]*(")',
                   lambda mm: mm.group(1) + amount(L[key]) + mm.group(2) + currency(L[key]) + mm.group(3), t)
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

print("CA:", LISTS["CA"]); print("PK:", LISTS["PK"])
print("counter:", TIER_TEXT.encode("ascii", "replace").decode())
print("updated:", ", ".join(changed) if changed else "nothing (already in sync)")
