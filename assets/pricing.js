/* Currency converter + price rendering. Reads window.ACQ_CONFIG from site.config.js.
   - The only set prices are in CAD. Other currencies are converted at today's rate.
   - Adds a currency picker to the nav (before "Book a call") on every page: the pill shows the code,
     the native dropdown lists code + currency name.
   - Page default: <body data-prices="PKR"> (legacy "PK"/"CA" accepted), else ACQ_CONFIG.defaultCurrency.
   - The visitor's pick is remembered in localStorage ("acq_currency"). Rates are cached for 12 hours
     ("acq_fx"); if the feeds are unreachable the snapshot in the config is used. Never redirects. */
(function(){
  var C=window.ACQ_CONFIG||{},BASE=C.base||'CAD',PR=C.prices||{},LIST=C.currencies||[[BASE,BASE]];
  var KEY='acq_currency',FXKEY='acq_fx',TTL=12*3600*1000;
  var known={};LIST.forEach(function(c){known[c[0]]=c[1];});
  var alias={CA:'CAD',PK:'PKR'};
  var rates=normRates(C.fallbackRates||{});
  function normRates(r){var o={};for(var k in r)if(Object.prototype.hasOwnProperty.call(r,k))o[k.toUpperCase()]=+r[k];o[BASE]=1;return o;}
  function norm(c){c=String(c||'').toUpperCase();c=alias[c]||c;return known[c]?c:null;}
  function pageDefault(){return norm(document.body.getAttribute('data-prices'))||norm(C.defaultCurrency)||BASE;}
  function saved(){try{return norm(localStorage.getItem(KEY));}catch(e){return null;}}
  /* clean figures: under 100 -> whole number; otherwise 2 significant figures */
  function nice(x){if(x<100)return Math.max(1,Math.round(x));var p=Math.pow(10,Math.floor(Math.log10(x))-1);return Math.round(x/p)*p;}
  function fmt(cur,amountCad){
    var r=cur===BASE?1:rates[cur];if(!r)return null;
    var v=cur===BASE?amountCad:nice(amountCad*r);
    return cur+' '+v.toLocaleString('en-US',{maximumFractionDigits:0});
  }
  var current=null;
  function render(cur){
    if(!rates[cur])cur=BASE;current=cur;
    var els=document.querySelectorAll('[data-price]'),i;
    for(i=0;i<els.length;i++){var k=els[i].getAttribute('data-price');if(PR[k]==null)continue;var s=fmt(cur,PR[k]);if(s)els[i].textContent=s;}
    var notes=document.querySelectorAll('.fx-note');for(i=0;i<notes.length;i++)notes[i].hidden=(cur===BASE);
    document.documentElement.setAttribute('data-currency',cur);
    var codes=document.querySelectorAll('.cur-code');for(i=0;i<codes.length;i++)codes[i].textContent=cur;
    var sels=document.querySelectorAll('select.cur-select');for(i=0;i<sels.length;i++)sels[i].value=cur;
  }
  function addNotes(){
    var text='Converted from Canadian dollars at today’s exchange rate.';
    function after(el){if(!el||(el.nextElementSibling&&el.nextElementSibling.classList.contains('fx-note')))return;var n=document.createElement('p');n.className='fx-note';n.hidden=true;n.textContent=text;el.parentNode.insertBefore(n,el.nextSibling);}
    var subs=document.querySelectorAll('.price-sub');for(var i=0;i<subs.length;i++)after(subs[i]);
    var pbs=document.querySelectorAll('.priceblock .price');for(i=0;i<pbs.length;i++)after(pbs[i]);
    var tbl=document.querySelectorAll('.cmp-wrap');for(i=0;i<tbl.length;i++)after(tbl[i]);
  }
  function addPicker(){
    var links=document.querySelector('.nav .nav-links');if(!links||links.querySelector('.cur'))return;
    var wrap=document.createElement('label');wrap.className='cur';
    var code=document.createElement('span');code.className='cur-code';code.setAttribute('aria-hidden','true');code.textContent=BASE;
    var sel=document.createElement('select');sel.className='cur-select';sel.setAttribute('aria-label','Show prices in');
    LIST.forEach(function(c){var o=document.createElement('option');o.value=c[0];o.textContent=c[0]+' · '+c[1];sel.appendChild(o);});
    sel.addEventListener('change',function(){try{localStorage.setItem(KEY,sel.value);}catch(e){}render(sel.value);});
    wrap.appendChild(code);wrap.appendChild(sel);
    links.insertBefore(wrap,links.querySelector('.nav-cta')||null);
  }
  function loadRates(){
    try{var c=JSON.parse(localStorage.getItem(FXKEY)||'null');if(c&&c.rates&&(Date.now()-c.at)<TTL){rates=normRates(c.rates);if(current&&current!==BASE)render(current);return;}}catch(e){}
    var urls=(C.ratesUrls||[]).slice();
    (function next(){
      var u=urls.shift();if(!u||!window.fetch)return;
      fetch(u,{cache:'no-cache'}).then(function(r){if(!r.ok)throw 0;return r.json();}).then(function(d){
        var r=d&&d[BASE.toLowerCase()];if(!r)throw 0;
        rates=normRates(r);try{localStorage.setItem(FXKEY,JSON.stringify({at:Date.now(),date:d.date,rates:r}));}catch(e){}
        if(current&&current!==BASE)render(current);
      }).catch(next);
    })();
  }
  function init(){addPicker();addNotes();render(saved()||pageDefault());loadRates();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
