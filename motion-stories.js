'use strict';
(() => {
 const t=window.portfolioI18n.t;
 const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
 const allowed=()=>!reduce.matches&&!document.documentElement.classList.contains('motion-paused')&&!document.hidden;
 const running=new Map();
 const timers=new Map();
 const settle=new Map();
 function stop(key){(running.get(key)||[]).forEach(a=>a.cancel());running.delete(key);(timers.get(key)||[]).forEach(clearTimeout);timers.delete(key);settle.get(key)?.();settle.delete(key);}
 function track(key,animations){stop(key);running.set(key,animations);}
 function drone(kind){
  window.dispatchEvent(new CustomEvent('portfolio-drone-expression',{detail:{face:kind==='scan'?'curious':kind}}));
  stop('drone');if(!allowed())return;
  const poses=kind==='happy'?[{transform:'translateY(0)'},{transform:'translateY(-5px)',offset:.35},{transform:'translateY(-2px)',offset:.7},{transform:'translateY(0)'}]:kind==='think'?[{transform:'translateY(0)'},{transform:'translateY(-3px)',offset:.5},{transform:'translateY(0)'}]:[{filter:'brightness(1)'},{filter:'brightness(1.5) drop-shadow(0 0 10px #52f4ed)',offset:.5},{filter:'brightness(1)'}];
  running.set('drone',[...document.querySelectorAll('.guide-launcher .drone-expression, #guide-art .drone-expression')].map(el=>el.animate(poses,{duration:1600,easing:'ease-in-out'})));
 }
 function flow(id,route,kind='normal'){
  const element=document.getElementById(id);if(!element)return;
  stop(id);const nodes=[...element.querySelectorAll('[data-flow-node]')];nodes.forEach(n=>{n.classList.remove('flow-active');n.removeAttribute('data-result');});
  const last=nodes[route.at(-1)];const finish=()=>{nodes.forEach(node=>node.classList.remove('flow-active'));last.classList.add('flow-active');last.dataset.result=kind;};finish();
  if(!allowed())return;
  settle.set(id,finish);
  const token=element.querySelector('.flow-token');const base=element.getBoundingClientRect();
  const points=route.map(i=>{const box=nodes[i].getBoundingClientRect();return {transform:`translate(${box.left-base.left+box.width/2-5}px,${box.top-base.top+box.height/2-5}px)`,opacity:1};});
  points[0].opacity=0;points.at(-1).opacity=0;
  const duration=route.length*320;
  running.set(id,[token.animate(points,{duration,easing:'ease-in-out'})]);
  const ids=route.map((index,i)=>setTimeout(()=>{nodes.forEach(n=>n.classList.remove('flow-active'));nodes[index].classList.add('flow-active');},i*320));
  timers.set(id,ids);
 }
 const descriptions={logic:'The API validates the request, applies business rules and passes a consistent operation to the database.',data:'The database protects records with constraints and version checks. SQL work also supports responsive client workflows.',interface:'The interface makes the workflow understandable. API calls connect user actions to the server and data.'};
 document.getElementById('system-flow-run').addEventListener('click',()=>{flow('system-flow',[0,1,2,3]);document.getElementById('system-flow-caption').textContent=t('A user action travels from the interface through API checks and business rules to the database.');drone('scan');});
 document.querySelectorAll('[data-skill]').forEach(button=>button.addEventListener('click',()=>{flow('system-flow',[0,1,2,3]);document.getElementById('system-flow-caption').textContent=t(descriptions[button.dataset.skill]);drone('scan');}));
 const workflowButtons=[...document.querySelectorAll('[data-workflow]')];
 workflowButtons.forEach(button=>button.addEventListener('click',()=>{
  const after=button.dataset.workflow==='after';workflowButtons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  const list=document.getElementById('workflow-steps');const texts=after?['Automatic functionality','Optimized jobs & migrations','A cleaner client experience']:['Manual changes','Existing jobs & migrations','An interface to improve'];
  [...list.children].forEach((node,i)=>node.textContent=t(texts[i]));list.dataset.state=after?'after':'before';
  document.getElementById('workflow-caption').textContent=t(after?'Automatic changes, optimized background work and a clearer interface reduce the need for manual intervention.':'An explanatory map of the improvements, not a reconstruction of the original screens.');
  stop('workflow');if(allowed())running.set('workflow',[...list.children].map((node,i)=>node.animate([{opacity:.35,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:400,delay:i*130,easing:'ease-out'})));
  drone(after?'happy':'think');
 }));
 window.addEventListener('portfolio-api-result',event=>{
  const kind=event.detail.kind;
  const routes={created:[0,1,2,3,4],replayed:[0,1,2,3,4],conflict:[0,1,2,4],invalid:[0,1,4]};
  const captions={created:'A new request passes the checks, creates one policy and returns the result.',replayed:'The same key and information reuse the existing result. No second policy is created.',conflict:'The key was reused with different information. A conflict is returned before another policy is created.',invalid:'The input is invalid. The request stops at validation and returns an error.'};
  flow('request-flow',routes[kind]||routes.invalid,kind);document.getElementById('request-flow-caption').textContent=t(captions[kind]||captions.invalid);drone(kind==='created'||kind==='replayed'?'happy':'think');
 });
 window.addEventListener('portfolio-api-reset',()=>{stop('request-flow');document.getElementById('request-flow').querySelectorAll('[data-flow-node]').forEach(node=>{node.classList.remove('flow-active');node.removeAttribute('data-result');});document.getElementById('request-flow-caption').textContent=t('Create a policy, retry or change the premium to follow the result.');});
 document.querySelectorAll('[data-challenge]').forEach(button=>button.addEventListener('click',()=>drone(button.dataset.challenge==='replay'?'happy':'think')));
 document.querySelectorAll('#dashboard-details, #insurance-details').forEach(detail=>detail.addEventListener('toggle',()=>{if(detail.open)drone('scan');}));
 const character=document.getElementById('character-react');
 function halt(){for(const key of new Set([...running.keys(),...timers.keys()]))stop(key);character.classList.remove('show-expression');}
 window.addEventListener('portfolio-motion-change',()=>{if(!allowed())halt();});reduce.addEventListener('change',()=>{if(!allowed())halt();});document.addEventListener('visibilitychange',()=>{if(document.hidden)halt();});window.addEventListener('resize',()=>{stop('system-flow');stop('request-flow');});
})();
