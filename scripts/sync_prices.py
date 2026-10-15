#!/usr/bin/env python3
"""Keep the HTML in step with site.config.js (the single source of truth for prices).

Re-stamps, in every *.html file under the repo root:
  * every  <... data-price="KEY">...</...>   element -> the CA price string
  * every  <... data-tier>...</...>          element -> "Tier N pricing - S of P spots left"
  * JSON-LD Offer "price"/"priceCurrency" for the named offers
  * the CA prices quoted in the /website and /seo meta descriptions
  * the home FAQPage JSON-LD, regenerated from the visible <details class="faq"> text
    (so schema and visible copy can never drift apart)

Idempotent. Run:  python scripts/sync_prices.py   (prints what changed)
"""
import html, json, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent.parent
cfg = (ROOT / "site.config.js").read_text(encoding="utf-8")

def region(name):
    m = re.search(r"\b" + name + r"\s*:\s*\{([^}]*)\}", cfg)
    return dict(re.findall(r'(\w+)\s*:\s*"([^"]*)"', m.group(1)))

CA = region("CA")
num = lambda key: int(re.search(r"\b" + key + r"\s*:\s*(\d+)", cfg).group(1))
TIER_TEXT = "Tier %d pricing \u00b7 %d of %d spots left" % (num("TIER"), num("SPOTS_LEFT"), num("SPOTS_PER_TIER"))
OFFERS = {"Managed website": "WEB_MONTHLY", "One-time build": "WEB_ONETIME", "SEO Optimization": "SEO_MONTHLY"}
amount = lambda s: re.sub(r"\D", "", s)          # "CAD 1,000" -> "1000"
currency = lambda s: s.split()[0]                # "CAD 1,000" -> "CAD"
strip = lambda s: html.unescape(re.sub(r"<[^>]+>", "", s)).strip()

changed = []
for p in sorted(ROOT.rglob("*.html")):
    if any(part in (".git", "node_modules", "docs") for part in p.parts):
        continue
    t = orig = p.read_text(encoding="utf-8")
    for k, v in CA.items():
        t = re.sub(r'(<[^>]*\bdata-price="' + k + r'"[^>]*>)[^<]*(</)', lambda m: m.group(1) + v + m.group(2), t)
    t = re.sub(r'(<[^>]*\bdata-tier\b[^>]*>)[^<]*(</)', lambda m: m.group(1) + TIER_TEXT + m.group(2), t)
    for name, key in OFFERS.items():
        t = re.sub(r'("name":"' + re.escape(name) + r'"[^}]*?"price":")[^"]*(","priceCurrency":")[^"]*(")',
                   lambda m: m.group(1) + amount(CA[key]) + m.group(2) + currency(CA[key]) + m.group(3), t)
    # meta descriptions that quote CA prices (product pages)
    META = {"website/index.html": [(r"CAD [\d,]+(?= / month)", "WEB_MONTHLY"), (r"CAD [\d,]+(?= one-time)", "WEB_ONETIME")],
            "seo/index.html": [(r"CAD [\d,]+(?= / month)", "SEO_MONTHLY")]}
    for rx, key in META.get(p.relative_to(ROOT).as_posix(), []):
        t = re.sub(r'(<meta name="description" content="[^"]*?)' + rx, lambda m: m.group(1) + CA[key], t, count=1)
    faqs = re.findall(r'<details class="faq"><summary>(.*?)</summary><p>(.*?)</p></details>', t, re.S)
    if faqs and '"FAQPage"' in t:
        obj = {"@context": "https://schema.org", "@type": "FAQPage",
               "mainEntity": [{"@type": "Question", "name": strip(q),
                               "acceptedAnswer": {"@type": "Answer", "text": strip(a)}} for q, a in faqs]}
        t = re.sub(r'\{"@context":"https://schema\.org","@type":"FAQPage".*?\]\}',
                   lambda m: json.dumps(obj, ensure_ascii=False, separators=(",", ":")), t, count=1, flags=re.S)
    if t != orig:
        p.write_text(t, encoding="utf-8")
        changed.append(p.relative_to(ROOT).as_posix())

print("CA prices:", CA, "| counter:", TIER_TEXT.encode("ascii", "replace").decode())
print("updated:", ", ".join(changed) if changed else "nothing (already in sync)")
