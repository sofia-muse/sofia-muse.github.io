'use strict';
(()=>{
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const running=new Set();const timers=new Set();
 const allowed=()=>!reduce.matches&&!document.hidden&&!document.documentElement.classList.contains('motion-paused');
 function play(element,frames,options){if(!allowed()||!element?.animate)return;const animation=element.animate(frames,options);running.add(animation);animation.onfinish=()=>running.delete(animation);return animation;}
 function later(fn,delay){const id=setTimeout(()=>{timers.delete(id);if(allowed())fn();},delay);timers.add(id);}
 const seen=new WeakSet();
 const headings=[...document.querySelectorAll('.section-heading h2,.about-grid h2,.contact-heading h2,.dashboard-intro h3')];
 const stages=[...document.querySelectorAll('.ownership-story li')];
 const result=document.querySelector('.result-avatar');
 function enter(element){if(seen.has(element))return;seen.add(element);if(!allowed())return;
  if(element===result){play(element,[{transform:'translateY(10px)',opacity:.65},{transform:'translateY(0)',opacity:1}],{duration:650,easing:'ease-out'});const face=element.querySelector('.result-face');face.style.backgroundPosition='100% 0';later(()=>face.style.backgroundPosition='100% 100%',650);return;}
  const stage=stages.includes(element);const mobile=innerWidth<=760;const rtl=document.documentElement.dir==='rtl';
  play(element,[{opacity:.15,transform:stage||mobile?'translateY(18px)':`translateX(${rtl?28:-28}px)`},{opacity:1,transform:'translate(0,0)'}],{duration:stage?550:600,delay:stage?stages.indexOf(element)*110:0,easing:'cubic-bezier(.2,.7,.2,1)'});
 }
 if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){enter(entry.target);observer.unobserve(entry.target);}}),{threshold:.2});[...headings,...stages,result].filter(Boolean).forEach(el=>observer.observe(el));}
 const updates=[document.getElementById('change-content'),document.getElementById('workflow-steps')].filter(Boolean);
 const observer=new MutationObserver(records=>{for(const el of updates){if(records.some(record=>el.contains(record.target)))play(el,[{opacity:.45,transform:'translateY(6px)'},{opacity:1,transform:'translateY(0)'}],{duration:320,easing:'ease-out'});}});
 updates.forEach(el=>observer.observe(el,{subtree:true,childList:true,characterData:true}));
 const welcome=document.querySelector('.welcome-guide .welcome-sprite');
 const about=document.getElementById('character-react');
 function lean(el,side){play(el,[{transform:'rotate(0deg)'},{transform:`rotate(${side*3}deg)`,offset:.45},{transform:'rotate(0deg)'}],{duration:750,easing:'ease-in-out'});}
 document.querySelectorAll('.welcome-guide a,.hero-copy .actions a').forEach((button,index)=>{button.addEventListener('pointerenter',()=>lean(welcome,index%2?1:-1));button.addEventListener('focus',()=>lean(welcome,index%2?1:-1));});

 function halt(){running.forEach(animation=>animation.cancel());running.clear();timers.forEach(clearTimeout);timers.clear();if(result)result.querySelector('.result-face').style.backgroundPosition='100% 100%';}
 window.addEventListener('portfolio-motion-change',()=>{if(!allowed())halt();});reduce.addEventListener('change',()=>{if(!allowed())halt();});document.addEventListener('visibilitychange',()=>{if(document.hidden)halt();});
})();
