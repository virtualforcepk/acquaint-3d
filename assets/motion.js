/* Scroll-motion layer (TEST, 2026-10-16) — inspired by Framer-style scroll sites.
   1. Lenis smooth scrolling (wheel/trackpad only; touch stays native)
   2. Stacking "How it works" cards: the card pinned on top lights up
   3. Word-by-word reveal for [data-words] paragraphs as they scroll through the viewport
   The service ticker and scroll-linked card rise are pure CSS (see MOTION TEST in styles.css).
   Everything is skipped when the visitor prefers reduced motion. */
(function(){
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce){document.documentElement.classList.add('motion-off');return;}

  /* 1. smooth scrolling */
  if(window.Lenis){
    var lenis=new Lenis({duration:1.15,easing:function(t){return Math.min(1,1.001-Math.pow(2,-10*t));},smoothWheel:true});
    (function raf(t){lenis.raf(t);requestAnimationFrame(raf);})(performance.now());
  }

  /* 2. stacking cards */
  var cards=[].slice.call(document.querySelectorAll('.stack-card'));
  /* 3. word reveal */
  var blocks=[].slice.call(document.querySelectorAll('[data-words]')).map(function(el){
    var words=el.textContent.trim().split(/\s+/);
    el.innerHTML=words.map(function(w){return '<span class="w">'+w.replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</span>';}).join(' ');
    return {el:el,spans:[].slice.call(el.querySelectorAll('.w'))};
  });

  var ticking=false;
  function update(){
    ticking=false;
    var vh=innerHeight;
    if(cards.length){
      var active=0;
      for(var i=0;i<cards.length;i++){
        var top=parseFloat(getComputedStyle(cards[i]).top)||0;
        if(cards[i].getBoundingClientRect().top<=top+2)active=i;
      }
      for(var j=0;j<cards.length;j++)cards[j].classList.toggle('is-active',j===active);
    }
    for(var k=0;k<blocks.length;k++){
      var r=blocks[k].el.getBoundingClientRect();
      var p=Math.max(0,Math.min(1,(vh*0.92-r.top)/(vh*0.55)));
      var n=Math.round(p*blocks[k].spans.length);
      for(var s=0;s<blocks[k].spans.length;s++)blocks[k].spans[s].classList.toggle('on',s<n);
    }
  }
  function onScroll(){if(!ticking){ticking=true;requestAnimationFrame(update);}}
  addEventListener('scroll',onScroll,{passive:true});
  addEventListener('resize',onScroll);
  update();
})();
