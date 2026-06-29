/* Acquaint 3D particle engine — one shape per page (read from <body data-shape>). */
(function(){
  if(!window.THREE) return;
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cvs=document.getElementById('gl'), pctEl=document.getElementById('pct');
  if(!cvs) return;
  var W=innerWidth,H=innerHeight;
  var renderer=new THREE.WebGLRenderer({canvas:cvs,antialias:true,alpha:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(W,H);
  var scene=new THREE.Scene();
  var camera=new THREE.PerspectiveCamera(55,W/H,0.1,100);camera.position.set(0,0,8);

  function makeSprite(){var c=document.createElement('canvas');c.width=c.height=64;var x=c.getContext('2d');
    var g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,255,255,1)');
    g.addColorStop(0.25,'rgba(255,255,255,0.8)');g.addColorStop(1,'rgba(255,255,255,0)');
    x.fillStyle=g;x.fillRect(0,0,64,64);var t=new THREE.Texture(c);t.needsUpdate=true;return t;}
  var tex=makeSprite();
  var isMobile=W<760, N=isMobile?1200:2300;
  var cG=new THREE.Color(0x34d399), cC=new THREE.Color(0x2dd4ff);
  function shell(r0,r1){var u=Math.random(),v=Math.random();var th=u*6.283,ph=Math.acos(2*v-1),r=r0+Math.random()*(r1-r0);
    return [r*Math.sin(ph)*Math.cos(th),r*Math.cos(ph)*0.85,r*Math.sin(ph)*Math.sin(th)];}
  // Shape is fixed per page (no client router). arrow | orb | eth | diamond
  var shape=(document.body.getAttribute('data-shape')||'arrow');
  var parts=null,geo=null,started=false,arrowCol=null,diamondCol=null,ethCol=null,orbCol=null;
  function makeColors(tyMin,tyMax){var col=new Float32Array(N*3);
    for(var i=0;i<N;i++){var t=(parts[i].ty-tyMin)/(tyMax-tyMin||1);var c2=cG.clone().lerp(cC,t).multiplyScalar(1.12);
      col[i*3]=Math.min(c2.r,1);col[i*3+1]=Math.min(c2.g,1);col[i*3+2]=Math.min(c2.b,1);}return col;}
  function buildDiamond(){
    var rT=1.2,rG=2.4,yT=2.3,yG=0.5,yC=-2.5,Tp=[],Gp=[],i;
    for(i=0;i<8;i++){var a=i/8*6.283;Tp.push([rT*Math.cos(a),yT,rT*Math.sin(a)]);Gp.push([rG*Math.cos(a),yG,rG*Math.sin(a)]);}
    var Cp=[0,yC,0],segs=[];
    for(i=0;i<8;i++)segs.push([Tp[i],Tp[(i+1)%8]]);
    for(i=0;i<8;i++)segs.push([Tp[i],Gp[i]]);
    for(i=0;i<8;i++)segs.push([Tp[i],Gp[(i+1)%8]]);
    for(i=0;i<8;i++)segs.push([Gp[i],Gp[(i+1)%8]]);
    for(i=0;i<8;i++)segs.push([Gp[i],Cp]);
    function L(a,b){return Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2]);}
    var sl=segs.map(function(p){return L(p[0],p[1]);}),tt=sl.reduce(function(a,b){return a+b;},0),dyMin=1e9,dyMax=-1e9,k;
    for(k=0;k<N;k++){var p=parts[k];
      if(p.free){p.dx=p.tx;p.dy=p.ty;p.dz=p.tz;}
      else{var dd=Math.random()*tt,j=0;while(dd>sl[j]){dd-=sl[j];j++;}var t=dd/sl[j],a2=segs[j][0],b2=segs[j][1];
        p.dx=a2[0]+(b2[0]-a2[0])*t+(Math.random()-0.5)*0.04;p.dy=a2[1]+(b2[1]-a2[1])*t+(Math.random()-0.5)*0.04;p.dz=a2[2]+(b2[2]-a2[2])*t+(Math.random()-0.5)*0.04;}
      if(p.dy<dyMin)dyMin=p.dy;if(p.dy>dyMax)dyMax=p.dy;}
    diamondCol=new Float32Array(N*3);
    for(k=0;k<N;k++){var t2=(parts[k].dy-dyMin)/(dyMax-dyMin||1);var c3=cG.clone().lerp(cC,t2).multiplyScalar(1.12);
      diamondCol[k*3]=Math.min(c3.r,1);diamondCol[k*3+1]=Math.min(c3.g,1);diamondCol[k*3+2]=Math.min(c3.b,1);}
  }
  function buildEth(){
    var T=[0,2.5,0],B=[0,-2.7,0],r=1.6,yE=0.3,E=[],i;
    for(i=0;i<4;i++){var a=i/4*6.283;E.push([r*Math.cos(a),yE,r*Math.sin(a)]);}
    var segs=[];
    for(i=0;i<4;i++)segs.push([T,E[i]]);
    for(i=0;i<4;i++)segs.push([B,E[i]]);
    for(i=0;i<4;i++)segs.push([E[i],E[(i+1)%4]]);
    segs.push([E[0],E[2]]);segs.push([E[1],E[3]]);
    function L(a,b){return Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2]);}
    var sl=segs.map(function(p){return L(p[0],p[1]);}),tt=sl.reduce(function(a,b){return a+b;},0),yMin=1e9,yMax=-1e9,k;
    for(k=0;k<N;k++){var p=parts[k];
      if(p.free){p.ex=p.tx;p.ey=p.ty;p.ez=p.tz;}
      else{var dd=Math.random()*tt,j=0;while(dd>sl[j]){dd-=sl[j];j++;}var t=dd/sl[j],a2=segs[j][0],b2=segs[j][1];
        p.ex=a2[0]+(b2[0]-a2[0])*t+(Math.random()-0.5)*0.04;p.ey=a2[1]+(b2[1]-a2[1])*t+(Math.random()-0.5)*0.04;p.ez=a2[2]+(b2[2]-a2[2])*t+(Math.random()-0.5)*0.04;}
      if(p.ey<yMin)yMin=p.ey;if(p.ey>yMax)yMax=p.ey;}
    ethCol=new Float32Array(N*3);
    for(k=0;k<N;k++){var t2=(parts[k].ey-yMin)/(yMax-yMin||1);var c3=cG.clone().lerp(cC,t2).multiplyScalar(1.12);
      ethCol[k*3]=Math.min(c3.r,1);ethCol[k*3+1]=Math.min(c3.g,1);ethCol[k*3+2]=Math.min(c3.b,1);}
  }
  function buildOrb(){
    var R=3.0,k;var g1=new THREE.Color(0x2dd4ff),g2=new THREE.Color(0x34d399);
    for(k=0;k<N;k++){var p=parts[k];
      if(p.free){p.ox=p.tx;p.oy=p.ty;p.oz=p.tz;}
      else{var u=Math.random(),v=Math.random(),th=6.283*u,ph=Math.acos(2*v-1),rr=R+(Math.random()-0.5)*0.24;
        p.ox=rr*Math.sin(ph)*Math.cos(th);p.oy=rr*Math.cos(ph);p.oz=rr*Math.sin(ph)*Math.sin(th);}}
    orbCol=new Float32Array(N*3);
    for(k=0;k<N;k++){var t=(parts[k].oy+R)/(2*R);if(t<0)t=0;if(t>1)t=1;var c=g2.clone().lerp(g1,t).multiplyScalar(1.12);
      orbCol[k*3]=Math.min(c.r,1);orbCol[k*3+1]=Math.min(c.g,1);orbCol[k*3+2]=Math.min(c.b,1);}
  }
  function applyShape(){if(!geo)return;var c=shape==='diamond'?diamondCol:(shape==='eth'?ethCol:(shape==='orb'?orbCol:arrowCol));if(c){geo.attributes.color.array.set(c);geo.attributes.color.needsUpdate=true;}}

  function buildFromImage(img){
    var S=256,oc=document.createElement('canvas');oc.width=oc.height=S;
    var x=oc.getContext('2d');x.drawImage(img,0,0,S,S);
    var d;try{d=x.getImageData(0,0,S,S).data;}catch(e){buildFallback();return;}
    var coords=[],cum=[],tot=0,minx=1e9,maxx=-1e9,miny=1e9,maxy=-1e9;
    for(var py=0;py<S;py++)for(var px=0;px<S;px++){var a=d[(py*S+px)*4+3];
      if(a>40){coords.push([px,py]);tot+=a;cum.push(tot);
        if(px<minx)minx=px;if(px>maxx)maxx=px;if(py<miny)miny=py;if(py>maxy)maxy=py;}}
    if(coords.length<50){buildFallback();return;}
    var cx=(minx+maxx)/2,cy=(miny+maxy)/2,span=Math.max(maxx-minx,maxy-miny),SC=6.6/span;
    function pick(){var r=Math.random()*tot,lo=0,hi=cum.length-1;while(lo<hi){var m=(lo+hi)>>1;if(cum[m]<r)lo=m+1;else hi=m;}return lo;}
    parts=new Array(N);var wire=Math.floor(N*0.88),tyMin=1e9,tyMax=-1e9;
    for(var k=0;k<N;k++){var tx,ty,tz;
      if(k<wire){var c=coords[pick()];
        tx=(c[0]-cx)*SC+(Math.random()-0.5)*0.05;ty=-(c[1]-cy)*SC+(Math.random()-0.5)*0.05;tz=(Math.random()-0.5)*0.45;}
      else{var p=shell(3.4,6.6);tx=p[0];ty=p[1];tz=p[2];}
      if(ty<tyMin)tyMin=ty;if(ty>tyMax)tyMax=ty;
      var st=shell(4.8,8.0);
      parts[k]={sx:st[0],sy:st[1],sz:st[2],tx:tx,ty:ty,tz:tz,ph:Math.random()*6.28,sp:0.22+Math.random()*0.33,free:k>=wire};}
    arrowCol=makeColors(tyMin,tyMax);buildDiamond();buildEth();buildOrb();finish(arrowCol);
  }
  function buildFallback(){
    var segs=[[[-2.3,-2.3,0],[2.3,2.3,0]],[[2.3,2.3,0],[1.0,2.2,0]],[[2.3,2.3,0],[2.2,1.0,0]],
      [[-2.3,-2.3,0],[-2.3,-1.0,0]],[[-2.3,-2.3,0],[-1.0,-2.3,0]],
      [[0.4,0.4,0],[1.5,1.0,0]],[[1.5,1.0,0],[2.0,2.0,0]],[[0.9,1.5,0],[2.0,2.0,0]],[[0.4,0.4,0],[0.9,1.5,0]]];
    function L(a,b){return Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2]);}
    var sl=segs.map(function(p){return L(p[0],p[1]);}),tt=sl.reduce(function(a,b){return a+b;},0);
    parts=new Array(N);var wire=Math.floor(N*0.88),tyMin=1e9,tyMax=-1e9;
    for(var k=0;k<N;k++){var tx,ty,tz;
      if(k<wire){var dd=Math.random()*tt,j=0;while(dd>sl[j]){dd-=sl[j];j++;}var t=dd/sl[j],a=segs[j][0],b=segs[j][1];
        tx=a[0]+(b[0]-a[0])*t;ty=a[1]+(b[1]-a[1])*t;tz=(Math.random()-0.5)*0.4;}
      else{var p=shell(3.4,6.6);tx=p[0];ty=p[1];tz=p[2];}
      if(ty<tyMin)tyMin=ty;if(ty>tyMax)tyMax=ty;
      var st=shell(4.8,8.0);
      parts[k]={sx:st[0],sy:st[1],sz:st[2],tx:tx,ty:ty,tz:tz,ph:Math.random()*6.28,sp:0.22+Math.random()*0.33,free:k>=wire};}
    arrowCol=makeColors(tyMin,tyMax);buildDiamond();buildEth();buildOrb();finish(arrowCol);
  }
  function finish(col){
    var pos=new Float32Array(N*3);
    geo=new THREE.BufferGeometry();
    geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
    geo.setAttribute('color',new THREE.BufferAttribute(col,3));
    scene.add(new THREE.Points(geo,new THREE.PointsMaterial({size:0.5,map:tex,vertexColors:true,transparent:true,opacity:0.15,blending:THREE.AdditiveBlending,depthWrite:false,depthTest:false,sizeAttenuation:true})));
    scene.add(new THREE.Points(geo,new THREE.PointsMaterial({size:0.12,map:tex,vertexColors:true,transparent:true,opacity:0.95,blending:THREE.AdditiveBlending,depthWrite:false,depthTest:false,sizeAttenuation:true})));
    applyShape();
    if(!started){started=true;requestAnimationFrame(frame);}
  }

  var prog=0,sprog=0;
  function onScroll(){var m=document.body.scrollHeight-innerHeight;prog=m>0?Math.min(Math.max(scrollY/m,0),1):0;}
  addEventListener('scroll',onScroll,{passive:true});onScroll();
  var mx=-999,my=-999,down=false;
  function setM(cx,cy){var nx=(cx/W)*2-1,ny=-((cy/H)*2-1),hh=Math.tan(55*Math.PI/360)*8,hw=hh*(W/H);mx=nx*hw;my=ny*hh;}
  addEventListener('mousemove',function(e){setM(e.clientX,e.clientY);},{passive:true});
  addEventListener('mousedown',function(){down=true;});addEventListener('mouseup',function(){down=false;});
  addEventListener('touchmove',function(e){if(e.touches[0])setM(e.touches[0].clientX,e.touches[0].clientY);},{passive:true});
  addEventListener('touchend',function(){down=false;});
  function ease(x){return x<0.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;}
  var t0=performance.now();
  function frame(now){
    requestAnimationFrame(frame);
    var time=(now-t0)*0.001;
    sprog+=(prog-sprog)*(reduce?1:0.05);
    var pp=reduce?1:Math.min(sprog/0.9,1);
    var e=ease(pp);
    var ry,rx;
    if(shape==='diamond'||shape==='eth'||shape==='orb'){ry=reduce?0:Math.sin(time*0.12)*0.6;rx=reduce?0:Math.sin(time*0.16+1)*0.10;}
    else{ry=reduce?0:Math.sin(time*0.14)*0.40;rx=reduce?0:Math.sin(time*0.12+1)*0.10;}
    var cY=Math.cos(ry),sY=Math.sin(ry),cX=Math.cos(rx),sX=Math.sin(rx);
    var rad=down?3.0:1.7, str=down?2.3:0.85;
    var pos=geo.attributes.position.array;
    for(var k=0;k<N;k++){
      var p=parts[k],bx,by,bz;
      if(p.free){bx=p.tx;by=p.ty;bz=p.tz;}
      else{var gx=shape==='orb'?p.ox:(shape==='eth'?p.ex:(shape==='diamond'?p.dx:p.tx)),gy=shape==='orb'?p.oy:(shape==='eth'?p.ey:(shape==='diamond'?p.dy:p.ty)),gz=shape==='orb'?p.oz:(shape==='eth'?p.ez:(shape==='diamond'?p.dz:p.tz));bx=p.sx+(gx-p.sx)*e;by=p.sy+(gy-p.sy)*e;bz=p.sz+(gz-p.sz)*e;}
      var x1=bx*cY-bz*sY, z1=bx*sY+bz*cY, y1=by;
      var y2=y1*cX-z1*sX, z2=y1*sX+z1*cX;
      var X=x1,Y=y2,Z=z2;
      if(!reduce){Y+=Math.sin(time*p.sp+p.ph)*0.04;X+=Math.cos(time*p.sp*0.8+p.ph)*0.03;
        var dx=X-mx,dy=Y-my,d2=dx*dx+dy*dy;
        if(d2<rad*rad){var dd=Math.sqrt(d2)||0.0001,ff=(1-dd/rad)*str;X+=dx/dd*ff;Y+=dy/dd*ff;}}
      pos[k*3]=X;pos[k*3+1]=Y;pos[k*3+2]=Z;
    }
    geo.attributes.position.needsUpdate=true;
    camera.position.x+=((mx*0.04)-camera.position.x)*0.04;
    camera.position.y+=((my*0.04)-camera.position.y)*0.04;
    camera.lookAt(0,0,0);
    renderer.render(scene,camera);
    if(pctEl)pctEl.textContent=Math.round(pp*100)+'%';
  }
  addEventListener('resize',function(){W=innerWidth;H=innerHeight;renderer.setSize(W,H);camera.aspect=W/H;camera.updateProjectionMatrix();onScroll();});
  var img=new Image();
  img.onload=function(){buildFromImage(img);};
  img.onerror=function(){buildFallback();};
  img.src='arrow-mark-t.png';
})();

/* Mobile nav — injected hamburger + slide-in menu (runs on every page) */
(function(){
  var nav=document.querySelector('.nav');
  if(!nav||nav.querySelector('.nav-burger'))return;
  var links=nav.querySelector('.nav-links');
  var burger=document.createElement('button');
  burger.className='nav-burger';burger.type='button';
  burger.setAttribute('aria-label','Menu');burger.setAttribute('aria-expanded','false');
  burger.innerHTML='<span></span><span></span><span></span>';
  var backdrop=document.createElement('div');backdrop.className='nav-backdrop';
  function setOpen(o){nav.classList.toggle('open',o);burger.setAttribute('aria-expanded',o?'true':'false');document.body.style.overflow=o?'hidden':'';}
  burger.addEventListener('click',function(e){e.stopPropagation();setOpen(!nav.classList.contains('open'));});
  backdrop.addEventListener('click',function(){setOpen(false);});
  if(links)links.addEventListener('click',function(e){if(e.target.closest('a'))setOpen(false);});
  addEventListener('keydown',function(e){if(e.key==='Escape')setOpen(false);});
  nav.insertBefore(burger,links||null);
  nav.appendChild(backdrop);
})();
