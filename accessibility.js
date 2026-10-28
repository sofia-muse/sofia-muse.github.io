'use strict';
(() => {
 const root=document.documentElement;
 const dialog=document.getElementById('accessibility-dialog');
 const opener=document.getElementById('accessibility-open');
 const size=document.getElementById('accessibility-size');
 const status=document.getElementById('accessibility-status');
 const t=window.portfolioI18n.t;
 const controls={contrast:'a11y-contrast',spacing:'a11y-spacing',links:'a11y-links',drone:'a11y-hide-drone'};
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 const motion=document.getElementById('accessibility-motion');
 function save(){
  const settings={size:root.dataset.textSize||'normal'};
  for(const [key,name] of Object.entries(controls))settings[key]=root.classList.contains(name);
  window.portfolioStorage.set('sofia-accessibility',JSON.stringify(settings));
 }
 function sync(){
  size.value=root.dataset.textSize||'normal';
  for(const [key,name] of Object.entries(controls))document.getElementById(`accessibility-${key}`).checked=root.classList.contains(name);
  motion.checked=reduced.matches||root.classList.contains('motion-paused');
  motion.disabled=reduced.matches;
 }
 function announce(){status.textContent=t(window.portfolioStorage.allowed()?'Settings saved on this device.':'Settings applied for this visit. Allow preference storage in cookie settings to remember them.');}
 opener.hidden=false;
 opener.addEventListener('click',()=>{sync();status.textContent='';dialog.showModal();});
 dialog.addEventListener('close',()=>opener.focus({preventScroll:true}));
 dialog.addEventListener('keydown',event=>{
  if(event.key!=='Tab')return;
  const items=[...dialog.querySelectorAll('button:not([disabled]),input:not([disabled]),select:not([disabled])')].filter(element=>element.checkVisibility());
  const first=items[0],last=items.at(-1);
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
 });
 document.getElementById('accessibility-close').addEventListener('click',()=>dialog.close());
 size.addEventListener('change',()=>{if(size.value==='normal')delete root.dataset.textSize;else root.dataset.textSize=size.value;save();announce();window.dispatchEvent(new Event('resize'));});
 for(const [key,name] of Object.entries(controls))document.getElementById(`accessibility-${key}`).addEventListener('change',event=>{
  root.classList.toggle(name,event.target.checked);save();announce();
 });
 function setMotion(paused){
  root.classList.toggle('motion-paused',paused);
  window.portfolioStorage.set('sofia-motion-paused',String(paused));
  if(paused)document.getAnimations().forEach(animation=>animation.cancel());
  window.dispatchEvent(new Event('portfolio-motion-change'));
 }
 motion.addEventListener('change',()=>{setMotion(motion.checked);announce();});
 window.addEventListener('portfolio-motion-change',sync);
 reduced.addEventListener('change',sync);
 document.getElementById('accessibility-reset').addEventListener('click',()=>{
  Object.values(controls).forEach(name=>root.classList.remove(name));
  delete root.dataset.textSize;setMotion(false);save();sync();
  status.textContent=t('Default settings restored.');window.dispatchEvent(new Event('resize'));
 });
 document.querySelector('.skip-link').addEventListener('click',()=>document.getElementById('main').focus({preventScroll:true}));
 sync();
})();
