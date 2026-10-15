/* Price rendering. Reads window.ACQ_CONFIG from site.config.js.
   - The page's price list comes from <body data-prices="PK">; default CA.
   - Fills every [data-price="KEY"] element and the [data-tier] counter. */
(function(){
  var C=window.ACQ_CONFIG||{},P=C.prices||{};
  function init(){
    var r=(document.body.getAttribute('data-prices')||'CA').toUpperCase();
    var p=P[r]||P.CA||{},i;
    var els=document.querySelectorAll('[data-price]');
    for(i=0;i<els.length;i++){var k=els[i].getAttribute('data-price');if(p[k])els[i].textContent=p[k];}
    var tiers=document.querySelectorAll('[data-tier]');
    for(i=0;i<tiers.length;i++)tiers[i].textContent='Tier '+C.TIER+' pricing \u00b7 '+C.SPOTS_LEFT+' of '+(C.SPOTS_PER_TIER||5)+' spots left';
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
