/* ─────────────────────────────────────────
   THREE.JS — wrapped in try/catch so WebGL
   failure never blocks page load
───────────────────────────────────────── */
(function(){
  try{
    var canvas=document.getElementById('three-canvas');
    if(!canvas||typeof THREE==='undefined') return;
    var w=canvas.offsetWidth,h=canvas.offsetHeight||window.innerHeight;
    var renderer=new THREE.WebGLRenderer({canvas:canvas,alpha:true,antialias:true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
    renderer.setSize(w,h);
    var scene=new THREE.Scene();
    var camera=new THREE.PerspectiveCamera(55,w/h,0.1,1000);
    camera.position.z=5;
    var N=window.innerWidth<768?1200:2800;
    var pos=new Float32Array(N*3),col=new Float32Array(N*3);
    for(var i=0;i<N;i++){
      var i3=i*3,r=Math.random()*8+1,sp=r*2.5,br=((i%3)/3)*Math.PI*2;
      pos[i3]=Math.cos(br+sp)*r+(Math.random()-.5)*.6;
      pos[i3+1]=(Math.random()-.5)*.4;
      pos[i3+2]=Math.sin(br+sp)*r+(Math.random()-.5)*.6;
      var t=Math.random();
      if(t<.33){col[i3]=0.1;col[i3+1]=0.53;col[i3+2]=1;}
      else if(t<.66){col[i3]=0;col[i3+1]=0.85;col[i3+2]=1;}
      else{col[i3]=0.49;col[i3+1]=0.23;col[i3+2]=1;}
    }
    var geo=new THREE.BufferGeometry();
    geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
    geo.setAttribute('color',new THREE.BufferAttribute(col,3));
    var pts=new THREE.Points(geo,new THREE.PointsMaterial({size:.04,sizeAttenuation:true,vertexColors:true,transparent:true,opacity:.75}));
    scene.add(pts);
    var t1=new THREE.Mesh(new THREE.TorusGeometry(1.4,.02,10,100),new THREE.MeshBasicMaterial({color:0x1a6bff,transparent:true,opacity:.12}));
    var t2=new THREE.Mesh(new THREE.TorusGeometry(2.0,.01,10,100),new THREE.MeshBasicMaterial({color:0x7c3aff,transparent:true,opacity:.08}));
    t2.rotation.x=Math.PI/3;
    scene.add(t1);scene.add(t2);
    var mx=0,my=0;
    document.addEventListener('mousemove',function(e){mx=(e.clientX/innerWidth-.5)*2;my=(e.clientY/innerHeight-.5)*2;},{passive:true});
    var clock=new THREE.Clock();
    (function tick(){
      requestAnimationFrame(tick);
      var t=clock.getElapsedTime();
      pts.rotation.y=t*.04;
      t1.rotation.x=t*.25+my*.15;t1.rotation.y=t*.18+mx*.15;
      t2.rotation.y=t*.12;t2.rotation.z=t*.08;
      camera.position.x+=(mx*.4-camera.position.x)*.025;
      camera.position.y+=(-my*.25-camera.position.y)*.025;
      renderer.render(scene,camera);
    })();
    window.addEventListener('resize',function(){
      var w=canvas.offsetWidth,h=canvas.offsetHeight||window.innerHeight;
      camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);
    });
  }catch(err){
    var c=document.getElementById('three-canvas');
    if(c)c.style.display='none';
    console.warn('Three.js unavailable:',err);
  }
})();

/* ─────────────────────────────────────────
   LOADER DISMISS
   Two independent timers — a JS error
   anywhere else can never block this.
───────────────────────────────────────── */
function dismissLoader(){
  var l=document.getElementById('loader');
  if(!l||l._done)return;
  l._done=true;
  l.style.transition='opacity .8s ease';
  l.style.opacity='0';
  l.style.pointerEvents='none';
  setTimeout(function(){if(l.parentNode)l.remove();},850);
}
window.addEventListener('load',function(){setTimeout(dismissLoader,2800);});
setTimeout(dismissLoader,5000); /* hard fallback */

/* ─────────────────────────────────────────
   POINTER LIGHT
───────────────────────────────────────── */
var pLight=document.getElementById('pointer-light');
if(pLight){
  document.addEventListener('mousemove',function(e){
    pLight.style.left=e.clientX+'px';
    pLight.style.top=e.clientY+'px';
  },{passive:true});
}

/* ─────────────────────────────────────────
   CUSTOM CURSOR
───────────────────────────────────────── */
var cursor=document.getElementById('cursor');
var trail=document.getElementById('cursor-trail');
if(cursor&&trail){
  document.addEventListener('mousemove',function(e){
    cursor.style.left=e.clientX+'px';cursor.style.top=e.clientY+'px';
    trail.style.left=e.clientX+'px';trail.style.top=e.clientY+'px';
  },{passive:true});
  document.querySelectorAll('a,button,[role="button"],.skill-tag,.pill,.project-card,.cert-panel,.skill-panel,.exp-panel,.edu-card,.stat-glass,.proj-filter-btn').forEach(function(el){
    el.addEventListener('mouseenter',function(){cursor.classList.add('hovered');});
    el.addEventListener('mouseleave',function(){cursor.classList.remove('hovered');});
  });
}

/* ─────────────────────────────────────────
   SCROLL: progress bar, back-to-top, nav
───────────────────────────────────────── */
var navbar=document.getElementById('navbar');
var btt=document.getElementById('back-to-top');
var progBar=document.getElementById('scroll-progress');
window.addEventListener('scroll',function(){
  var pct=(scrollY/(document.body.scrollHeight-innerHeight))*100;
  if(progBar)progBar.style.width=pct+'%';
  if(btt)btt.classList.toggle('visible',scrollY>500);
  if(navbar)navbar.classList.toggle('scrolled',scrollY>20);
  document.querySelectorAll('section[id]').forEach(function(sec){
    var link=document.querySelector('.nav-links a[href="#'+sec.id+'"]');
    if(!link)return;
    var top=sec.getBoundingClientRect().top;
    link.classList.toggle('active',top<=100&&top>-sec.offsetHeight+100);
  });
},{passive:true});

/* ─────────────────────────────────────────
   REVEAL ON SCROLL
   FIX: observe each Element individually.
   Never pass document/window/null to observe().
───────────────────────────────────────── */
(function initReveal(){
  try{
    var obs=new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting)e.target.classList.add('in');
      });
    },{threshold:0.08,rootMargin:'0px 0px -40px 0px'});
    document.querySelectorAll('.reveal').forEach(function(el){
      if(el instanceof Element)obs.observe(el);
    });
  }catch(err){
    document.querySelectorAll('.reveal').forEach(function(el){el.classList.add('in');});
    console.warn('RevealObserver failed:',err);
  }
})();

/* ─────────────────────────────────────────
   SKILL TAG STAGGER
───────────────────────────────────────── */
(function initSkillTags(){
  try{
    document.querySelectorAll('.skill-tag').forEach(function(t,i){
      if(!(t instanceof Element))return;
      t.style.cssText+=';opacity:0;transform:translateY(8px);transition:opacity .4s '+i*.03+'s,transform .4s '+i*.03+'s ease';
      var obs=new IntersectionObserver(function(entries){
        if(entries[0].isIntersecting){t.style.opacity='1';t.style.transform='translateY(0)';obs.disconnect();}
      },{threshold:.1});
      obs.observe(t);
    });
  }catch(err){
    document.querySelectorAll('.skill-tag').forEach(function(t){t.style.opacity='1';t.style.transform='translateY(0)';});
    console.warn('SkillTag stagger failed:',err);
  }
})();

/* ─────────────────────────────────────────
   TYPING EFFECT
───────────────────────────────────────── */
var phrases=[
  'Building scalable web applications...',
  'Digital marketing & brand growth...',
  'E-commerce marketplace operations...',
  'Video editing & creative design...',
  'ERP systems & database solutions...',
  'BCA Final Year @ Raiganj University...'
];
var pi=0,ci=0,deleting=false;
var typedEl=document.getElementById('typed');
function typeLoop(){
  if(!typedEl)return;
  var p=phrases[pi];
  if(!deleting){
    typedEl.textContent=p.slice(0,++ci);
    if(ci===p.length){deleting=true;setTimeout(typeLoop,2200);return;}
  }else{
    typedEl.textContent=p.slice(0,--ci);
    if(ci===0){deleting=false;pi=(pi+1)%phrases.length;}
  }
  setTimeout(typeLoop,deleting?35:75);
}
setTimeout(typeLoop,4600);

/* ─────────────────────────────────────────
   MOBILE MENU
───────────────────────────────────────── */
function toggleMobile(){
  var m=document.getElementById('mobile-menu');
  var h=document.getElementById('hamburger');
  if(!m||!h)return;
  var open=m.classList.toggle('open');
  h.classList.toggle('open',open);
  h.setAttribute('aria-expanded',open);
}
function closeMobile(){
  var m=document.getElementById('mobile-menu');
  var h=document.getElementById('hamburger');
  if(m)m.classList.remove('open');
  if(h){h.classList.remove('open');h.setAttribute('aria-expanded','false');}
}

/* ─────────────────────────────────────────
   PROJECT CATEGORY FILTER
───────────────────────────────────────── */
document.querySelectorAll('.proj-filter-btn').forEach(function(btn){
  btn.addEventListener('click',function(){
    var filter=this.getAttribute('data-filter');
    document.querySelectorAll('.proj-filter-btn').forEach(function(b){b.classList.remove('active');});
    this.classList.add('active');
    document.querySelectorAll('.project-card').forEach(function(card){
      if(filter==='all'){
        card.classList.remove('hidden');
      }else{
        var cats=card.getAttribute('data-cat')||'';
        card.classList.toggle('hidden',cats.indexOf(filter)===-1);
      }
    });
  });
});

/* ─────────────────────────────────────────
   THEME TOGGLE
───────────────────────────────────────── */
var lightMode=true;
var themeBtn=document.getElementById('theme-btn');
if(themeBtn){
  themeBtn.addEventListener('click',function(){
    lightMode=!lightMode;
    var r=document.documentElement;
    if(lightMode){
      r.style.setProperty('--c-void','#dce8ff');
      r.style.setProperty('--glass-bg','rgba(220,235,255,.7)');
      r.style.setProperty('--glass-bg-hover','rgba(200,220,255,.8)');
      r.style.setProperty('--glass-border','rgba(80,140,255,.25)');
      r.style.setProperty('--glass-border-hi','rgba(60,120,255,.5)');
      r.style.setProperty('--glass-shine','rgba(255,255,255,.5)');
      r.style.setProperty('--c-white','#0a1628');
      r.style.setProperty('--c-muted','rgba(20,60,130,.75)');
      r.style.setProperty('--c-dim','rgba(40,80,160,.5)');
    }else{
      r.style.setProperty('--c-void','#10182b');
      r.style.setProperty('--glass-bg','rgba(18,29,52,.78)');
      r.style.setProperty('--glass-bg-hover','rgba(31,47,78,.88)');
      r.style.setProperty('--glass-border','rgba(90,160,255,.18)');
      r.style.setProperty('--glass-border-hi','rgba(120,200,255,.35)');
      r.style.setProperty('--glass-shine','rgba(180,230,255,.06)');
      r.style.setProperty('--c-white','#f1f6ff');
      r.style.setProperty('--c-muted','rgba(190,210,245,.72)');
      r.style.setProperty('--c-dim','rgba(155,180,225,.55)');
    }
  });
}

/* ─────────────────────────────────────────
   RESUME DOWNLOAD
───────────────────────────────────────── */
function downloadResume(e){
  e.preventDefault();
  var overlay=document.createElement('div');
  overlay.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:9999;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(12px)';
  overlay.innerHTML='<div style="background:rgba(8,18,50,.95);border:1px solid rgba(80,160,255,.3);border-radius:24px;padding:2.5rem;max-width:420px;text-align:center;position:relative;overflow:hidden">'
    +'<div style="position:absolute;top:0;left:15%;right:15%;height:1px;background:linear-gradient(90deg,transparent,rgba(0,216,255,.5),transparent)"></div>'
    +'<div style="font-family:Syne,sans-serif;font-size:1.2rem;font-weight:700;color:#f0f8ff;margin-bottom:.75rem">Resume</div>'
    +'<p style="color:rgba(168,210,255,.6);font-size:.9rem;line-height:1.7;margin-bottom:1.5rem">Resume download coming soon. Please reach out via email to request a copy.</p>'
    +'<a href="mailto:rohanalam402@gmail.com" style="color:#00d8ff;font-family:JetBrains Mono,monospace;font-size:.82rem">rohanalam402@gmail.com</a><br><br>'
    +'<button onclick="this.closest(\'[style]\').remove()" style="background:rgba(26,107,255,.25);border:1px solid rgba(80,160,255,.4);color:#f0f8ff;padding:.6rem 1.5rem;border-radius:999px;cursor:pointer;font-size:.85rem">Close</button>'
    +'</div>';
  document.body.appendChild(overlay);
  overlay.addEventListener('click',function(ev){if(ev.target===overlay)overlay.remove();});
}

/* ─────────────────────────────────────────
   CONTACT FORM
───────────────────────────────────────── */
function sendMessage(){
  var n=document.getElementById('cf-name');
  var em=document.getElementById('cf-email');
  if(!n||!em||!n.value.trim()||!em.value.trim()){alert('Please fill in your name and email.');return;}
  var s=document.getElementById('form-success');
  if(s)s.style.display='block';
  ['cf-name','cf-email','cf-subject','cf-msg'].forEach(function(id){var el=document.getElementById(id);if(el)el.value='';});
  setTimeout(function(){if(s)s.style.display='none';},5000);
}

/* ─────────────────────────────────────────
   GSAP SCROLL ANIMATIONS (non-critical)
───────────────────────────────────────── */
try{
  if(window.gsap&&window.ScrollTrigger){
    gsap.registerPlugin(ScrollTrigger);
    ['.skill-panel','.exp-panel','.edu-card','.cert-panel','.project-card','.extras-panel','.stat-glass','.market-card','.creative-card'].forEach(function(sel){
      gsap.utils.toArray(sel).forEach(function(el,i){
        gsap.from(el,{scrollTrigger:{trigger:el,start:'top 92%'},y:24,opacity:0,duration:.65,delay:i*.05,ease:'power2.out'});
      });
    });
  }
}catch(err){console.warn('GSAP init:',err);}
