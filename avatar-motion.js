'use strict';
(() => {
 const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
 const actors=[...document.querySelectorAll('[data-character]')].map(el=>({el,portrait:el.dataset.character==='about',ready:false,busy:false,timers:[],visible:false,look:0,frame:0,lastGreeting:-Infinity,tweenTimer:null}));
 const allowed=()=>!reduce.matches&&!document.hidden&&!document.documentElement.classList.contains('motion-paused');
 let queued=false,blinkTimer=null,pointerTimer=null,scrollTimer=null,pointer=null,scrolling=false;
 function position(actor,n){if(actor.portrait)return `${(n%4)*100/3}% ${n<4?0:100}%`;const x=[6.22,55.22,104.98,4.98,54.73,104.48];return `${x[n]}% ${n<3?0:69.3584}%`;}
 function finishTween(actor){clearTimeout(actor.tweenTimer);if(!actor.tween)return;actor.el.style.backgroundPosition=position(actor,actor.frame);actor.tween.style.transition='none';actor.tween.style.opacity='0';}
 function frame(actor,n,smooth=false){
  if(!actor.ready)return;
  if(actor.frame===n)return;
  finishTween(actor);actor.frame=n;actor.el.dataset.avatarFrame=String(n);
  if(!smooth||!allowed()){actor.el.style.backgroundPosition=position(actor,n);return;}
  actor.tween.style.backgroundPosition=position(actor,n);actor.tween.style.transition='none';actor.tween.style.opacity='0';
  void actor.tween.offsetWidth;
  actor.tween.style.transition='opacity 180ms ease-in-out';actor.tween.style.opacity='1';
  actor.tweenTimer=setTimeout(()=>finishTween(actor),185);
 }
 function cancel(actor){actor.timers.forEach(clearTimeout);actor.timers=[];actor.busy=false;finishTween(actor);}
 function play(actor,sequence,step=240,smooth=true){
  if(!actor.ready||!allowed()||!actor.visible)return;
  cancel(actor);actor.busy=true;
  sequence.forEach((n,i)=>actor.timers.push(setTimeout(()=>frame(actor,n,smooth),i*step)));
  actor.timers.push(setTimeout(()=>{actor.busy=false;frame(actor,actor.look,true);},sequence.length*step));
 }
 function greet(actor){const now=performance.now();if(now-actor.lastGreeting<10000)return;actor.lastGreeting=now;play(actor,actor.portrait?[4,5,6,7,4,0]:[0,2,0,2,0],280);}
 function update(){
  queued=false;
  for(const actor of actors){
   const box=actor.el.getBoundingClientRect(),wasVisible=actor.visible;
   actor.visible=box.bottom>90&&box.top<window.innerHeight-20;
   if(!allowed()||!actor.ready||!actor.visible){cancel(actor);actor.el.style.transform='none';frame(actor,0);continue;}
   if(!wasVisible)greet(actor);
   const nearby=pointer&&pointer.x>box.left-180&&pointer.x<box.right+180&&pointer.y>box.top-140&&pointer.y<box.bottom+140;
   // A small head turn responds to nearby visitors; the body remains planted.
   actor.look=actor.portrait&&nearby&&!scrolling?5:0;
   actor.el.style.transform=actor.portrait&&nearby&&!scrolling?'translateY(-1px)':'none';
   if(!actor.busy)frame(actor,actor.look,true);
  }
 }
 function queue(){if(!queued){queued=true;requestAnimationFrame(update);}}
 function scheduleBlink(){clearTimeout(blinkTimer);if(!allowed())return;blinkTimer=setTimeout(()=>{for(const actor of actors)if(actor.visible&&!actor.busy&&actor.look===0)play(actor,actor.portrait?[1,2,1,0]:[1,0],actor.portrait?75:150,false);scheduleBlink();},5500+Math.random()*3500);}
 function reset(){clearTimeout(blinkTimer);clearTimeout(pointerTimer);clearTimeout(scrollTimer);pointer=null;scrolling=false;actors.forEach(actor=>{cancel(actor);actor.look=0;frame(actor,0);actor.el.style.transform='none';});queue();scheduleBlink();}
 window.addEventListener('pointermove',event=>{if(event.pointerType==='touch'||!allowed())return;pointer={x:event.clientX,y:event.clientY};clearTimeout(pointerTimer);pointerTimer=setTimeout(()=>{pointer=null;queue();},1600);queue();},{passive:true});
 document.addEventListener('pointerleave',()=>{pointer=null;queue();});
 window.addEventListener('scroll',()=>{scrolling=true;clearTimeout(scrollTimer);queue();scrollTimer=setTimeout(()=>{scrolling=false;queue();},220);},{passive:true});
 window.addEventListener('resize',queue);
 for(const actor of actors){
  const button=actor.el.closest('button');
  if(button){button.addEventListener('click',()=>play(actor,actor.portrait?[4,5,6,6,7,0]:[5,0],300));button.addEventListener('focus',()=>play(actor,actor.portrait?[4,5,6,5]:[5,0],280));button.addEventListener('blur',()=>{actor.look=0;cancel(actor);frame(actor,0,true);});}
  actor.el.addEventListener('pointerenter',()=>play(actor,actor.portrait?[4,5,6,5]:[2,0],280));
 }
 if('IntersectionObserver' in window){const observer=new IntersectionObserver(()=>queue(),{threshold:[0,.3]});actors.forEach(actor=>observer.observe(actor.el));}
 window.addEventListener('portfolio-motion-change',reset);reduce.addEventListener('change',reset);document.addEventListener('visibilitychange',reset);
 for(const portrait of [false,true]){
  const sheet=new Image();sheet.onload=()=>{for(const actor of actors.filter(a=>a.portrait===portrait)){
   actor.ready=true;actor.visible=false;actor.el.classList.add(portrait?'avatar-bust-ready':'avatar-frames-ready');
   actor.el.style.aspectRatio=portrait?`${sheet.naturalWidth} / ${sheet.naturalHeight*2}`:`${sheet.naturalWidth*450} / ${sheet.naturalHeight*350}`;
   actor.el.style.backgroundPosition=position(actor,0);actor.el.dataset.avatarFrame='0';
   actor.tween=document.createElement('span');actor.tween.className='avatar-tween';actor.tween.setAttribute('aria-hidden','true');actor.el.append(actor.tween);
  }queue();scheduleBlink();};sheet.src=portrait?'/assets/sofia-bust-frames.png':'/assets/sofia-cartoon-frames.png';
 }
})();
