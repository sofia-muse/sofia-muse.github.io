'use strict';
(() => {
 const t=window.portfolioI18n.t;
 const buttons=[...document.querySelectorAll('[data-depth]')];
 const details=['dashboard-explorer','dashboard-details','insurance-details'].map(id=>document.getElementById(id)).filter(Boolean);
 function syncDepth(){
  const allOpen=details.every(detail=>detail.open);
  const allClosed=details.every(detail=>!detail.open);
  buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.depth==='technical'?allOpen:allClosed)));
  const status=document.getElementById('depth-status');if(!status)return;status.textContent=t(allOpen?'Technical decisions are open below each project.':allClosed?'Start with the result. Explore the implementation when you want more detail.':'Some technical details are open. Explore what interests you.');
 }
 buttons.forEach(button=>button.addEventListener('click',()=>{const technical=button.dataset.depth==='technical';details.forEach(detail=>{detail.open=technical;});syncDepth();}));
 details.forEach(detail=>detail.addEventListener('toggle',syncDepth));
 syncDepth();
 const answers=[...document.querySelectorAll('[data-challenge]')];
 answers.forEach(button=>button.addEventListener('click',()=>{
  answers.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
  const correct=button.dataset.challenge==='replay';
  document.getElementById('challenge-feedback').textContent=t(correct?'Exactly. The same key and information return the original result. One policy, even after a retry.':button.dataset.challenge==='duplicate'?'That would create a duplicate. The same key and information should return the original result.':'A retry can be legitimate after a lost response. Return the original result; report a conflict if the information changes.');
  document.getElementById('challenge-feedback').dataset.correct=String(correct);
  document.getElementById('challenge-run').hidden=false;
 }));
})();
