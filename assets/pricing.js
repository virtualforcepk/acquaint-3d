/* Currency picker + price rendering. Reads window.ACQ_CONFIG from site.config.js.
   - Adds a currency <select> to the nav (before "Book a call") on every page.
   - Page default: <body data-prices="PKR"> (legacy "PK"/"CA" accepted), else ACQ_CONFIG.defaultCurrency.
   - The visitor's pick is remembered in localStorage ("acq_currency") and applied on every page.
   - Fills every [data-price="KEY"] element. Never redirects. */
(function(){
  var C=window.ACQ_CONFIG||{},P=C.prices||{},KEY='acq_currency',codes=Object.keys(P);
  var alias={CA:'CAD',PK:'PKR'};
  function norm(c){c=String(c||'').toUpperCase();c=alias[c]||c;return P[c]?c:null;}
  function pageDefault(){return norm(document.body.getAttribute('data-prices'))||norm(C.defaultCurrency)||codes[0];}
  function saved(){try{return norm(localStorage.getItem(KEY));}catch(e){return null;}}
  function render(cur){
    var p=P[cur]||{},els=document.querySelectorAll('[data-price]'),i;
    for(i=0;i<els.length;i++){var k=els[i].getAttribute('data-price');if(p[k])els[i].textContent=p[k];}
    document.documentElement.setAttribute('data-currency',cur);
    var sels=document.querySelectorAll('select.cur-select');for(i=0;i<sels.length;i++)sels[i].value=cur;
  }
  function addPicker(){
    var links=document.querySelector('.nav .nav-links');if(!links||links.querySelector('.cur'))return;
    var wrap=document.createElement('label');wrap.className='cur';
    var sel=document.createElement('select');sel.className='cur-select';sel.setAttribute('aria-label','Show prices in');
    codes.forEach(function(c){var o=document.createElement('option');o.value=c;o.textContent=c;sel.appendChild(o);});
    sel.addEventListener('change',function(){try{localStorage.setItem(KEY,sel.value);}catch(e){}render(sel.value);});
    wrap.appendChild(sel);
    var cta=links.querySelector('.nav-cta');links.insertBefore(wrap,cta||null);
  }
  function init(){addPicker();render(saved()||pageDefault());}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
