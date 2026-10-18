'use strict';
(()=>{
 const character=document.getElementById('character-react');if(!character)return;
 const sprite=character.querySelector('.about-sprite'),flash=character.querySelector('.ar-flash');
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');const animations=new Set(),timers=new Set();let visible=false,entered=false,lastAction=-Infinity,idleTimer=null,trackingFrame=0,pointer=null;
 const allowed=()=>visible&&!document.hidden&&!reduce.matches&&!document.documentElement.classList.contains('motion-paused');
 function animate(el,frames,duration){if(!allowed()||!el.animate)return;const animation=el.animate(frames,{duration,easing:'cubic-bezier(.4,0,.2,1)'});animations.add(animation);animation.onfinish=()=>animations.delete(animation);}
 function later(fn,delay){const id=setTimeout(()=>{timers.delete(id);if(allowed())fn();},delay);timers.add(id);}
 function blink(){if(!allowed())return;[1,2,3,0].forEach((frame,index)=>later(()=>{sprite.style.backgroundPosition=`${frame%2*100}% ${Math.floor(frame/2)*100}%`;},index*90));}
 function gesture(kind){if(!allowed()||performance.now()-lastAction<1800)return;lastAction=performance.now();
  if(kind==='hello')animate(character,[{transform:'translateY(5px) rotate(-2deg)'},{transform:'translateY(-2px) rotate(1deg)',offset:.5},{transform:'translateY(0) rotate(0deg)'}],1600);
  else if(kind==='listen')animate(character,[{transform:'rotate(0deg)'},{transform:'rotate(-2.5deg) translateY(-2px)',offset:.4},{transform:'rotate(-1deg)',offset:.75},{transform:'rotate(0deg)'}],1900);
  else animate(character,[{transform:'translateY(0) rotate(0deg)'},{transform:'translateY(3px) rotate(1.5deg)',offset:.35},{transform:'translateY(-1px) rotate(-.5deg)',offset:.65},{transform:'translateY(0) rotate(0deg)'}],1400);
  later(blink,550);
  if(kind==='nod')animate(flash,[{opacity:0},{opacity:.4,offset:.4},{opacity:0}],1000);
 }
 function idle(){clearTimeout(idleTimer);if(!allowed())return;idleTimer=setTimeout(()=>{if(allowed()){blink();animate(character,[{transform:'translateY(0)'},{transform:'translateY(-1.5px)',offset:.5},{transform:'translateY(0)'}],2600);}idle();},9000+Math.random()*4000);}
 const finePointer=matchMedia('(hover: hover) and (pointer: fine)');
 function resetLook(){sprite.style.removeProperty('--look-x');sprite.style.removeProperty('--look-y');sprite.style.removeProperty('--look-turn');}
 function follow(){trackingFrame=0;if(!allowed()||!finePointer.matches||innerWidth<=760||!pointer){resetLook();return;}
  const rect=character.getBoundingClientRect(),dx=pointer.x-(rect.left+rect.width/2),dy=pointer.y-(rect.top+rect.height*.35);
  if(Math.abs(dx)>650||Math.abs(dy)>420){resetLook();return;}
  sprite.style.setProperty('--look-x',`${Math.max(-3,Math.min(3,dx/120))}px`);sprite.style.setProperty('--look-y',`${Math.max(-2,Math.min(2,dy/140))}px`);sprite.style.setProperty('--look-turn',`${Math.max(-3,Math.min(3,dx/160))}deg`);
 }
 document.addEventListener('pointermove',event=>{if(!allowed()||!finePointer.matches||innerWidth<=760)return;pointer={x:event.clientX,y:event.clientY};if(!trackingFrame)trackingFrame=requestAnimationFrame(follow);},{passive:true});
 document.addEventListener('pointerout',event=>{if(!event.relatedTarget){pointer=null;resetLook();}});
 window.addEventListener('resize',resetLook);
 function halt(){if(trackingFrame)cancelAnimationFrame(trackingFrame);trackingFrame=0;resetLook();animations.forEach(a=>a.cancel());animations.clear();timers.forEach(clearTimeout);timers.clear();clearTimeout(idleTimer);sprite.style.backgroundPosition='0% 0%';}
 character.addEventListener('pointerenter',()=>gesture('listen'));character.addEventListener('focus',()=>gesture('listen'));character.addEventListener('click',()=>gesture('nod'));
 if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{visible=entry.isIntersecting;if(visible){if(!entered){entered=true;gesture('hello');}idle();}else halt();}),{threshold:.35});observer.observe(character);}
 function sync(){if(!allowed())halt();else idle();}reduce.addEventListener('change',sync);window.addEventListener('portfolio-motion-change',sync);document.addEventListener('visibilitychange',sync);
})();
