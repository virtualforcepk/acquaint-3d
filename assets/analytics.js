/* Google Analytics 4 — Acquaint Media.
 *
 * TO ACTIVATE: replace G-XXXXXXXXXX below with your real GA4 Measurement ID.
 * Get it at analytics.google.com → Admin → Data Streams → Web → (your stream) → "Measurement ID".
 * It always starts with "G-". Until a real ID is set, this file does nothing —
 * no external requests, no cookies — so it's safe to ship as-is.
 */
(function () {
  var ID = 'G-XXXXXXXXXX'; // <-- replace with the real Measurement ID

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
