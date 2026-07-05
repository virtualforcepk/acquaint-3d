/* Google Analytics 4 — Acquaint Media.
 *
 * TO ACTIVATE: replace G-XXXXXXXXXX below with your real GA4 Measurement ID.
 * Get it at analytics.google.com → Admin → Data Streams → Web → (your stream) → "Measurement ID".
 * It always starts with "G-". Until a real ID is set, this file does nothing —
 * no external requests, no cookies — so it's safe to ship as-is.
 */
(function () {
  var ID = 'G-WH20WVGTE3'; // Acquaint Media — GA4 Measurement ID (acquaintmedia.ai)

  // Guard: stay inert while the placeholder is in place.
  if (ID === 'G-XXXXXXXXXX' || !/^G-[A-Z0-9]{4,}$/.test(ID)) return;

  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', ID);
})();

/* Conversion events — every "Book a call" (Calendly) click, by page + CTA text. */
(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }
  ready(function () {
    document.body.addEventListener('click', function (e) {
      var a = e.target && e.target.closest && e.target.closest('a[href*="calendly.com"]');
      if (!a || typeof window.gtag !== 'function') return;
      window.gtag('event', 'book_call_click', {
        event_category: 'conversion',
        page_path: location.pathname,
        cta_text: (a.textContent || '').trim().slice(0, 40)
      });
    }, true);
  });
})();

/* Vercel Web Analytics — first-party, cookieless traffic + landing-page counts.
 * Served from this domain (/_vercel/insights/…), so ad-blockers/consent banners don't strip it
 * the way they do gtag — you actually count the organic visitors GA4 misses.
 * ACTIVATE: Vercel dashboard → project acquaint-3d → Analytics → Enable Web Analytics.
 * Until then /_vercel/insights/script.js 404s harmlessly and this is inert. Skipped on localhost. */
(function () {
  var h = location.hostname;
  if (h === 'localhost' || h === '127.0.0.1' || h === '') return;
  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
  var s = document.createElement('script');
  s.defer = true;
  s.src = '/_vercel/insights/script.js';
  document.head.appendChild(s);
})();
