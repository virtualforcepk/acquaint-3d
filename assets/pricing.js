/* CA | PK region toggle + price rendering. Reads window.ACQ_CONFIG from site.config.js.
   - Swaps every [data-price="KEY"] element to the selected region's string.
   - Fills [data-tier] with the founder-pricing counter.
   - Shows [data-wa] (WhatsApp) only for PK and only when a number is configured.
   - Remembers the choice in localStorage ("acq_region"). Never redirects. */
(function(){
  var C=window.ACQ_CONFIG||{},P=C.prices||{},KEY='acq_region';
  var DEF=P[C.defaultRegion]?C.defaultRegion:'CA';
  function saved(){try{var v=localStorage.getItem(KEY);return P[v]?v:null;}catch(e){return null;}}
  function hint(){
    if(!C.GEO_HINT||!P.PK)return null;
    try{
      var tz=(Intl.DateTimeFormat().resolvedOptions().timeZone||'');
      var langs=(navigator.languages&&navigator.languages.length?navigator.languages:[navigator.language||'']).join(' ');
      if(tz==='Asia/Karachi'||/-PK\b/i.test(langs))return 'PK';
    }catch(e){}
    return null;
  }
  function render(r){
    var p=P[r]||P[DEF],i;
    document.documentElement.setAttribute('data-region',r);
    var els=document.querySelectorAll('[data-price]');
    for(i=0;i<els.length;i++){var k=els[i].getAttribute('data-price');if(p&&p[k])els[i].textContent=p[k];}
    var tiers=document.querySelectorAll('[data-tier]');
    for(i=0;i<tiers.length;i++)tiers[i].textContent='Tier '+C.TIER+' pricing \u00b7 '+C.SPOTS_LEFT+' of '+(C.SPOTS_PER_TIER||5)+' spots left';
    var btns=document.querySelectorAll('.geo [data-region]');
    for(i=0;i<btns.length;i++){var on=btns[i].getAttribute('data-region')===r;btns[i].setAttribute('aria-pressed',on?'true':'false');}
    var num=String(C.WHATSAPP_NUMBER||'').replace(/\D/g,''),show=(r==='PK'&&num.length>0),was=document.querySelectorAll('[data-wa]');
    for(i=0;i<was.length;i++){was[i].hidden=!show;if(show)was[i].setAttribute('href','https://wa.me/'+num);}
  }
  function init(){
    render(saved()||hint()||DEF);
    document.addEventListener('click',function(e){
      var b=e.target.closest?e.target.closest('.geo [data-region]'):null;if(!b)return;
      var r=b.getAttribute('data-region');if(!P[r])return;
      try{localStorage.setItem(KEY,r);}catch(e2){}
      render(r);
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
