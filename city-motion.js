'use strict';
(()=>{
 const reduce=matchMedia('(prefers-reduced-motion: reduce)'),scenes=[...document.querySelectorAll('.hero,.about-section')],visible=new Set();let queued=false;
 const allowed=()=>innerWidth>760&&!reduce.matches&&!document.hidden&&!document.documentElement.classList.contains('motion-paused');
 scenes.forEach(scene=>{const light=document.createElement('span');light.className='city-light';light.setAttribute('aria-hidden','true');scene.append(light);});
 if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)visible.add(entry.target);else{visible.delete(entry.target);entry.target.style.removeProperty('--city-offset');}}));scenes.forEach(scene=>observer.observe(scene));}
 function update(){queued=false;if(!allowed())return;visible.forEach(scene=>{const top=scene.getBoundingClientRect().top;scene.style.setProperty('--city-offset',`${Math.max(-16,Math.min(16,-top*.025))}px`);});}
 window.addEventListener('scroll',()=>{if(allowed()&&visible.size&&!queued){queued=true;requestAnimationFrame(update);}},{passive:true});
 function reset(){scenes.forEach(scene=>scene.style.removeProperty('--city-offset'));}window.addEventListener('resize',reset);window.addEventListener('portfolio-motion-change',reset);reduce.addEventListener('change',reset);
 let active=null,timer=null;document.querySelectorAll('[data-change],[data-skill],main details').forEach(control=>control.addEventListener(control.tagName==='DETAILS'?'toggle':'click',()=>{active?.classList.remove('drone-context-active');clearTimeout(timer);active=control.closest('.dashboard-project,.system-map,.featured-project,.note-card')||control;if(allowed()){active.classList.add('drone-context-active');timer=setTimeout(()=>active?.classList.remove('drone-context-active'),1800);}}));
})();
