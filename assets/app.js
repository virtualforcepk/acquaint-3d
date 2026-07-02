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
  // Shape is fixed per page (no client router). arrow | orb | eth | diamond | dragon
  var shape=(document.body.getAttribute('data-shape')||'arrow');
  var isMobile=W<760, N=shape==='dragon'?(isMobile?1600:3200):(isMobile?1200:2300);
  var cG=new THREE.Color(0x34d399), cC=new THREE.Color(0x2dd4ff);
  function shell(r0,r1){var u=Math.random(),v=Math.random();var th=u*6.283,ph=Math.acos(2*v-1),r=r0+Math.random()*(r1-r0);
    return [r*Math.sin(ph)*Math.cos(th),r*Math.cos(ph)*0.85,r*Math.sin(ph)*Math.sin(th)];}
  var parts=null,geo=null,started=false,arrowCol=null,diamondCol=null,ethCol=null,orbCol=null,dragonCol=null;
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
  /* Shenron-style dragon: body wraps the frame, front-facing head lowered to center. */
  function buildDragon(){
    var PTS=[[-1.30,-3.75],[0.90,-3.95],[2.70,-3.10],[3.25,-1.20],[2.90,0.90],[1.50,2.50],[-0.60,3.25],[-2.50,2.35],[-3.15,0.40],[-2.50,-1.35],[-0.90,-1.75],[0.55,-0.75]];
    function sp(t){t=Math.min(Math.max(t,0),1);var n=PTS.length-1,ft=t*n,i=Math.min(Math.floor(ft),n-1),u=ft-i;
      var p0=PTS[Math.max(i-1,0)],p1=PTS[i],p2=PTS[i+1],p3=PTS[Math.min(i+2,n)],u2=u*u,u3=u2*u;
      return [0.5*((2*p1[0])+(-p0[0]+p2[0])*u+(2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*u2+(-p0[0]+3*p1[0]-3*p2[0]+p3[0])*u3),
              0.5*((2*p1[1])+(-p0[1]+p2[1])*u+(2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*u2+(-p0[1]+3*p1[1]-3*p2[1]+p3[1])*u3)];}
    function tg(t){var h=1e-3,a=sp(t-h),b=sp(t+h),dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy)||1;return [dx/L,dy/L];}
    function nm(t){var v=tg(t);return [-v[1],v[0]];}
    function wf(t){return 0.12+0.42*Math.pow(t,0.9)*(1-0.25*t);}
    var NS=400,cum=[0],pp=sp(0),i;
    for(i=1;i<NS;i++){var q=sp(i/(NS-1));cum.push(cum[i-1]+Math.hypot(q[0]-pp[0],q[1]-pp[1]));pp=q;}
    var TOT=cum[NS-1];
    function tArc(u){var tgt=u*TOT,lo=0,hi=NS-1;while(lo<hi){var m=(lo+hi)>>1;if(cum[m]<tgt)lo=m+1;else hi=m;}
      if(lo===0)return 0;var f=(tgt-cum[lo-1])/Math.max(cum[lo]-cum[lo-1],1e-9);return (lo-1+f)/(NS-1);}
    function bz(c,u){var p=c.map(function(g){return [g[0],g[1]];}),n=p.length,r,j;
      for(r=1;r<n;r++)for(j=0;j<n-r;j++){p[j][0]=p[j][0]*(1-u)+p[j+1][0]*u;p[j][1]=p[j][1]*(1-u)+p[j+1][1]*u;}return p[0];}
    var TG=[];
    function put(x,y,seg,kind,zj){TG.push({x:x,y:y,z:(Math.random()-0.5)*(zj||0.25),g:seg,k:kind||'b'});}
    function st(ctrls,n,jit,seg,kind,taper,zj){for(var g=0;g<n;g++){var u=Math.random(),b=bz(ctrls,u),j=taper?jit*(1-0.6*u):jit;
      put(b[0]+(Math.random()*2-1)*j,b[1]+(Math.random()*2-1)*j,seg,kind,zj);}}
    var wire=Math.floor(N*0.88), DF=wire/3394, BODY_END=0.985;
    function bodyPt(){var t=tArc(Math.random())*BODY_END,sq=sp(t),n2=nm(t),w=wf(t),r=Math.random(),u;
      if(r<0.34)u=0.92+Math.random()*0.16;else if(r<0.70)u=-(0.95+Math.random()*0.10);else u=(Math.random()*2-1)*0.82;
      put(sq[0]+n2[0]*w*u+(Math.random()*2-1)*0.018,sq[1]+n2[1]*w*u+(Math.random()*2-1)*0.018,t,'b',0.5);}
    for(i=0;i<Math.round(1750*DF);i++)bodyPt();
    var pe=Math.max(3,Math.round(6*DF));
    for(i=0;i<24;i++){var tR=Math.min(tArc(0.04+0.88*i/23),BODY_END);
      var sq2=sp(tR),n3=nm(tR);n3=[-n3[0],-n3[1]];var w2=wf(tR),bx=sq2[0]+n3[0]*w2,by=sq2[1]+n3[1]*w2,tv=tg(tR),
        hg=0.15+0.30*tR,bw=0.10+0.08*tR,ax=bx+n3[0]*hg,ay=by+n3[1]*hg,sg,q2,u2;
      for(sg=-1;sg<=1;sg+=2){var ex=bx+tv[0]*bw*sg,ey=by+tv[1]*bw*sg;
        for(q2=0;q2<pe;q2++){u2=Math.random();put(ex+(ax-ex)*u2+(Math.random()*2-1)*0.013,ey+(ay-ey)*u2+(Math.random()*2-1)*0.013,tR,'b',0.3);}}}
    function legD(t0,far){var sq=sp(t0),n2=nm(t0),w=wf(t0);if(n2[1]>0){n2=[-n2[0],-n2[1]];}
      var ox=far?0.18:0,oy=far?0.11:0,shx=sq[0]+n2[0]*w+ox,shy=sq[1]+n2[1]*w+oy,
        thx=shx-0.24,thy=shy-0.46,anx=thx+0.30,any_=thy-0.38,d=far?0.5:1,CL=[-38,-6,26];
      st([[shx,shy],[shx-0.18,shy-0.26],[thx,thy]],Math.round(40*d*DF),0.032,t0,'b',false,0.3);
      st([[thx,thy],[thx+0.13,thy-0.26],[anx,any_]],Math.round(34*d*DF),0.03,t0,'b',false,0.3);
      for(var g2=0;g2<3;g2++){var a=(-62+CL[g2])*Math.PI/180,
        cx=anx+0.27*Math.cos(a),cy=any_+0.27*Math.sin(a),mx2=anx+0.15*Math.cos(a)+0.03,my2=any_+0.15*Math.sin(a)-0.02;
        st([[anx,any_],[mx2,my2],[cx,cy]],Math.round(13*d*DF),0.013,t0,'b',true,0.25);}}
    legD(0.28,false);legD(0.28,true);legD(0.76,false);legD(0.76,true);
    var s=1.2,he=sp(1.0),HX=he[0],HY=he[1]+0.20*s;
    function mst(ctrls,n,jit,seg,kind,taper,zj){st(ctrls,n,jit,seg,kind,taper,zj);
      st(ctrls.map(function(c){return [2*HX-c[0],c[1]];}),n,jit,seg,kind,taper,zj);}
    st([[HX-0.52*s,HY+0.26*s],[HX,HY+0.60*s],[HX+0.52*s,HY+0.26*s]],Math.round(46*DF),0.014,1,'b',false,0.25);
    mst([[HX-0.52*s,HY+0.26*s],[HX-0.60*s,HY-0.06*s],[HX-0.38*s,HY-0.34*s]],Math.round(30*DF),0.014,1,'b',false,0.25);
    mst([[HX-0.38*s,HY-0.34*s],[HX-0.30*s,HY-0.56*s],[HX-0.16*s,HY-0.64*s]],Math.round(20*DF),0.012,1,'b',false,0.25);
    st([[HX-0.16*s,HY-0.64*s],[HX,HY-0.68*s],[HX+0.16*s,HY-0.64*s]],Math.round(16*DF),0.011,1,'b',false,0.2);
    st([[HX-0.28*s,HY-0.47*s],[HX,HY-0.53*s],[HX+0.28*s,HY-0.47*s]],Math.round(18*DF),0.011,1,'b',false,0.2);
    mst([[HX-0.44*s,HY+0.16*s],[HX-0.24*s,HY+0.30*s],[HX-0.07*s,HY+0.20*s]],Math.round(20*DF),0.011,1,'b',false,0.2);
    mst([[HX-0.11*s,HY-0.36*s],[HX-0.05*s,HY-0.41*s]],Math.round(7*DF),0.009,1,'b',false,0.15);
    var EL=[HX-0.26*s,HY+0.09*s],ER=[HX+0.26*s,HY+0.09*s],nf=0,guard=0,fillN=Math.round(320*DF);
    while(nf<fillN&&guard++<fillN*40){var a2=Math.random()*6.283,r2=Math.sqrt(Math.random()),x2,y2;
      if(Math.random()<0.68){if(Math.random()<0.35)r2=0.90+Math.random()*0.12;
        x2=HX+Math.cos(a2)*0.54*s*r2;y2=HY+0.08*s+Math.sin(a2)*0.42*s*r2;}
      else{x2=HX+Math.cos(a2)*0.28*s*r2;y2=HY-0.42*s+Math.sin(a2)*0.20*s*r2;}
      if((x2-EL[0])*(x2-EL[0])+(y2-EL[1])*(y2-EL[1])<0.13*s*0.13*s)continue;
      if((x2-ER[0])*(x2-ER[0])+(y2-ER[1])*(y2-ER[1])<0.13*s*0.13*s)continue;
      if(Math.abs(x2-HX)<0.26*s&&(y2-HY)>-0.60*s&&(y2-HY)<-0.50*s)continue;
      put(x2+(Math.random()*2-1)*0.013,y2+(Math.random()*2-1)*0.013,1,'b',0.25);nf++;}
    var ee,e2,eN=Math.max(6,Math.round(13*DF));
    for(ee=0;ee<2;ee++){var EC=ee?ER:EL;for(e2=0;e2<eN;e2++){var a3=Math.random()*6.283,r3=Math.sqrt(Math.random())*0.05*s;
      put(EC[0]+Math.cos(a3)*r3,EC[1]+Math.sin(a3)*r3,1,'e',0.08);}}
    mst([[HX-0.30*s,HY+0.46*s],[HX-0.55*s,HY+0.98*s],[HX-1.05*s,HY+1.45*s]],Math.round(42*DF),0.013,1,'b',false,0.25);
    mst([[HX-0.72*s,HY+1.12*s],[HX-0.60*s,HY+1.65*s]],Math.round(14*DF),0.012,1,'b',false,0.2);
    mst([[HX-0.92*s,HY+1.32*s],[HX-1.35*s,HY+1.62*s]],Math.round(10*DF),0.012,1,'b',false,0.2);
    for(i=0;i<3;i++){var dy2=0.02*s*i;
      mst([[HX-0.56*s,HY-0.06*s-dy2],[HX-0.98*s,HY-0.16*s-0.08*s*i]],Math.round(11*DF),0.014,1,'b',true,0.2);}
    st([[HX-0.20*s,HY-0.46*s],[HX-0.90*s,HY-0.72*s],[HX-1.55*s,HY-0.55*s],[HX-1.95*s,HY-1.30*s]],Math.round(72*DF),0.010,1,'b',false,0.18);
    st([[HX+0.20*s,HY-0.46*s],[HX+0.90*s,HY-0.72*s],[HX+1.55*s,HY-0.55*s],[HX+1.95*s,HY-1.30*s]],Math.round(72*DF),0.010,1,'b',false,0.18);
    mst([[HX-0.06*s,HY-0.68*s],[HX-0.10*s,HY-0.88*s]],Math.round(8*DF),0.010,1,'b',true,0.15);
    var t00=sp(0),d0=tg(0),ba=Math.atan2(-d0[1],-d0[0]),TF=[-30,-12,4,20,38],tt2;
    for(tt2=0;tt2<5;tt2++){var a4=ba+TF[tt2]*Math.PI/180,L4=0.55+Math.random()*0.4;
      st([[t00[0],t00[1]],[t00[0]+0.5*L4*Math.cos(a4)+0.05,t00[1]+0.5*L4*Math.sin(a4)+0.08],[t00[0]+L4*Math.cos(a4),t00[1]+L4*Math.sin(a4)]],Math.round(16*DF),0.02,0,'b',true,0.3);}
    while(TG.length<wire)bodyPt();
    while(TG.length>wire)TG.splice((Math.random()*TG.length)|0,1);
    var mnx=1e9,mxx=-1e9,mny=1e9,mxy=-1e9;
    for(i=0;i<wire;i++){var g3=TG[i];if(g3.x<mnx)mnx=g3.x;if(g3.x>mxx)mxx=g3.x;if(g3.y<mny)mny=g3.y;if(g3.y>mxy)mxy=g3.y;}
    var ctx2=(mnx+mxx)/2,cty=(mny+mxy)/2,SC2=7.0/Math.max(mxx-mnx,mxy-mny);
    dragonCol=new Float32Array(N*3);
    var wi=0;
    for(i=0;i<N;i++){var p=parts[i];
      if(p.free){p.gx=p.tx;p.gy=p.ty;p.gz=p.tz;p.gseg=Math.random();
        dragonCol[i*3]=arrowCol[i*3];dragonCol[i*3+1]=arrowCol[i*3+1];dragonCol[i*3+2]=arrowCol[i*3+2];}
      else{var g4=TG[wi++];p.gx=(g4.x-ctx2)*SC2;p.gy=(g4.y-cty)*SC2;p.gz=g4.z*SC2;p.gseg=g4.g;
        if(g4.k==='e'){dragonCol[i*3]=1;dragonCol[i*3+1]=0.96;dragonCol[i*3+2]=0.9;}
        else{var c5=cG.clone().lerp(cC,Math.max(0,Math.min(1,g4.g))).multiplyScalar(1.12);
          dragonCol[i*3]=Math.min(c5.r,1);dragonCol[i*3+1]=Math.min(c5.g,1);dragonCol[i*3+2]=Math.min(c5.b,1);}}}
  }
  function applyShape(){if(!geo)return;var c=shape==='dragon'?dragonCol:(shape==='diamond'?diamondCol:(shape==='eth'?ethCol:(shape==='orb'?orbCol:arrowCol)));if(c){geo.attributes.color.array.set(c);geo.attributes.color.needsUpdate=true;}}

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
    arrowCol=makeColors(tyMin,tyMax);buildDiamond();buildEth();buildOrb();if(shape==='dragon')buildDragon();finish(arrowCol);
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
    arrowCol=makeColors(tyMin,tyMax);buildDiamond();buildEth();buildOrb();if(shape==='dragon')buildDragon();finish(arrowCol);
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
      else{var gx=shape==='dragon'?p.gx:(shape==='orb'?p.ox:(shape==='eth'?p.ex:(shape==='diamond'?p.dx:p.tx))),gy=shape==='dragon'?p.gy:(shape==='orb'?p.oy:(shape==='eth'?p.ey:(shape==='diamond'?p.dy:p.ty))),gz=shape==='dragon'?p.gz:(shape==='orb'?p.oz:(shape==='eth'?p.ez:(shape==='diamond'?p.dz:p.tz)));bx=p.sx+(gx-p.sx)*e;by=p.sy+(gy-p.sy)*e;bz=p.sz+(gz-p.sz)*e;}
      var x1=bx*cY-bz*sY, z1=bx*sY+bz*cY, y1=by;
      var y2=y1*cX-z1*sX, z2=y1*sX+z1*cX;
      var X=x1,Y=y2,Z=z2;
      if(!reduce){Y+=Math.sin(time*p.sp+p.ph)*0.04;X+=Math.cos(time*p.sp*0.8+p.ph)*0.03;
        if(shape==='dragon'&&!p.free){var wp=time*0.9-p.gseg*9.42;Y+=Math.sin(wp)*0.045*e;X+=Math.cos(wp*0.8)*0.028*e;}
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
