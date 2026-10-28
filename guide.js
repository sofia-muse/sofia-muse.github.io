'use strict';
(() => {
 const root=document.getElementById('portfolio-guide');
 const launcher=document.getElementById('guide-launcher');
 const panel=document.getElementById('guide-panel');
 const motionToggle=document.getElementById('guide-motion');
 const t=window.portfolioI18n.t;
 const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
 let paused=document.documentElement.classList.contains("motion-paused");
 motionToggle.setAttribute("aria-pressed",String(paused));
 motionToggle.textContent=t(paused?"Resume motion":"Pause motion");
 const timers=new Map();
 const visible=new Set();
 const characters=[...document.querySelectorAll('[data-character=welcome]')];
 const canMove=()=>!motion.matches&&!paused&&!document.hidden;
 window.addEventListener('portfolio-motion-change',()=>{paused=document.documentElement.classList.contains('motion-paused');motionToggle.setAttribute('aria-pressed',String(paused));motionToggle.textContent=t(paused?'Resume motion':'Pause motion');if(paused)halt();});
 const blends=new Map();
 const lastGreeting=new Map();
 function clearBlend(element){const blend=blends.get(element);if(!blend)return;clearTimeout(blend.timer);element.style.backgroundPosition=blend.target;blend.layer.style.transition='none';blend.layer.style.opacity='0';blends.delete(element);}
 function frame(element,n,smooth=false){
  const cols=element.dataset.character==='welcome'?4:2;
  const target=`${(n%cols)*100/(cols-1)}% ${Math.floor(n/cols)*100}%`;
  clearBlend(element);element.dataset.animationFrame=String(n);
  if(!smooth||!canMove()){element.style.backgroundPosition=target;return;}
  let layer=element.querySelector('.avatar-frame-blend');if(!layer){layer=document.createElement('span');layer.className='avatar-frame-blend';layer.setAttribute('aria-hidden','true');element.append(layer);}
  layer.style.backgroundPosition=target;layer.style.transition='none';layer.style.opacity='0';void layer.offsetWidth;
  layer.style.transition='opacity 110ms ease-in-out';layer.style.opacity='1';
  blends.set(element,{layer,target,timer:setTimeout(()=>clearBlend(element),115)});
 }
 function stop(element){(timers.get(element)||[]).forEach(clearTimeout);timers.delete(element);clearBlend(element);frame(element,0);}
 function animate(element,kind='greeting'){
  stop(element);if(!canMove())return;
  const welcome=element.dataset.character==='welcome';
  if(kind==='greeting'&&welcome){const now=performance.now();if(now-(lastGreeting.get(element)??-Infinity)<12000)return;lastGreeting.set(element,now);}
  const greeting=welcome&&kind==='greeting';
  const sequence=greeting?[0,1,2,3,2,1,0]:welcome?[4,5,6,7,0]:[1,2,3,0];
  const ids=sequence.map((n,i)=>setTimeout(()=>frame(element,n,greeting),greeting?350+i*240:i*85));
  ids.push(setTimeout(()=>timers.delete(element),greeting?2100:sequence.length*85+120));
  timers.set(element,ids);
 }
 function halt(){characters.forEach(stop);}
 motionToggle.addEventListener('click',()=>{paused=!paused;document.documentElement.classList.toggle('motion-paused',paused);window.portfolioStorage.set('sofia-motion-paused',String(paused));window.dispatchEvent(new Event('portfolio-motion-change'));motionToggle.setAttribute('aria-pressed',String(paused));motionToggle.textContent=t(paused?'Resume motion':'Pause motion');if(paused)halt();});
 motion.addEventListener('change',()=>{if(motion.matches)halt();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)halt();});
 characters.forEach(el=>el.addEventListener('pointerenter',()=>{if(!timers.has(el))animate(el,'blink');}));
 if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){visible.add(entry.target);animate(entry.target);}else{visible.delete(entry.target);stop(entry.target);}}),{threshold:.35});characters.forEach(el=>observer.observe(el));}
 setInterval(()=>{if(canMove())visible.forEach(el=>{if(!timers.has(el))animate(el,'blink');});},7500);
 const title=document.getElementById('guide-title');
 const copy=document.getElementById('guide-copy');
 const reaction=document.getElementById('guide-reaction');
 const questions=document.getElementById('guide-questions');
 const explore=document.getElementById('guide-explore');
 const topics={
  services:{title:'How can I help your project?',copy:"Sofia works on .NET and Umbraco fixes, SQL improvements, API integrations and workflow automation. Describe what happens now and what you want to change; scope, timing and cost are agreed after reviewing the task.",target:'services',action:'Freelance services',questions:['projects','contact']},
  projects:{title:'Commercial work and personal projects.',copy:'Start with the client dashboard, Cartograph or Life RPG. Each case explains my contribution and its limitations.',questions:['dashboard','cartograph','life','api'],target:'work',action:'Show me the projects'},
  cartograph:{label:'Cartograph',title:'Understand a system before changing it.',copy:'Explore dependencies between C#, SQL and Umbraco in a local sample.',target:'cartograph-case',action:'Read the case study'},
  life:{label:'Life RPG',title:'Habits become quests.',copy:'See character creation, quests and progress in the local demo.',target:'life-rpg-case',action:'Read the case study'},
  dashboard:{title:'A dashboard worth buying.',copy:'Sofia independently improved SQL, server logic, automation and UI. The result was a dashboard the client wanted to buy, although buying it was not originally planned.',questions:['changes','value','technical'],target:'dashboard-overview',action:'Explore the dashboard'},
  challenge:{label:'What was difficult?',title:'Several layers. One workflow.',copy:'Stored procedures dated back to 2013. Server logic, API calls, manual changes, jobs, migrations and the interface all needed attention. Sofia worked across these layers herself.',questions:['changes','value'],target:'dashboard-overview',action:'Explore the dashboard'},
  changes:{label:'What changed?',title:'From manual changes to automation.',copy:'She rewrote stored procedures, improved server-side logic, reorganized API calls, automated manual changes, optimized jobs and migrations, and made the UI cleaner and easier to use.',questions:['challenge','value','technical'],target:'dashboard-overview',action:'Explore the dashboard'},
  value:{label:'Why does it matter?',title:'The client saw enough value to want ownership.',copy:'The client wanted to buy the entire dashboard, despite that not being part of the original plan. Sofia has no verified purchase outcome or measured performance figures to share.',questions:['challenge','changes','technical'],target:'dashboard-overview',action:'Explore the dashboard'},
  technical:{joke:'Let’s go deeper. Almost nobody reads this far.',label:'Show the technical part',title:'Engineering decisions',copy:'I reorganized API interactions and improved server-side logic so each layer had a clearer responsibility.',target:'dashboard-details',action:'Show the technical part',questions:['changes','value']},
  api:{title:'Reliable operations, explained.',copy:'The insurance API demonstrates how Sofia handles repeated requests, conflicting changes and clear business rules. Choose a situation to see why it matters.',questions:['retry','conflict'],target:'insurance-details',action:'Explore the API decisions'},
  retry:{label:'What if I click twice?',title:'A retry should not create a duplicate.',copy:'If the same request is sent again with the same key and information, the API returns the existing result. Reusing that key with different information produces a conflict.',questions:['conflict'],target:'api-demo',action:'Try the interactive example'},
  conflict:{label:'What if two people edit at once?',title:'Conflicting changes should be visible.',copy:'A version check detects when someone else has already changed a record. The API reports the conflict instead of silently overwriting the newer information.',questions:['retry'],target:'api-demo',action:'Try the interactive example'},
  skills:{title:'The tools behind the work.',copy:'C#, ASP.NET Core, SQL and JavaScript connect business rules, data and the interface. Pick a layer to see how Sofia uses it.',questions:['logic','data','interface'],target:'services',action:'Freelance services'},
  logic:{label:'Business logic',title:'Backend decisions, visible in code.',copy:'C# and ASP.NET Core power business rules, validation and API operations. The insurance project shows safe retries and explicit handling of conflicting changes.',target:'insurance-details',action:'Explore the API decisions',questions:['data','interface']},
  data:{label:'Data & reliability',title:'SQL that supports the workflow.',copy:'Sofia rewrote legacy stored procedures and optimized jobs and migrations in the client dashboard. Her API also uses SQL constraints and version checks to protect consistent records.',target:'dashboard-overview',action:'Explore the dashboard',questions:['logic','interface']},
  interface:{label:'The human interface',title:'Clearer screens. Easier everyday tasks.',copy:'JavaScript, Razor and Umbraco connect the interface to production systems. Sofia improved the dashboard UI and worked with Hebrew and English interfaces.',target:'production-platforms',action:'Read about production work',questions:['logic','data']},
  about:{title:'The person behind the code.',copy:'Sofia is a full-stack developer with production .NET experience. She connects business logic, data and usable interfaces, with room for art and curiosity outside code.',target:'about',action:'Read about Sofia',questions:['skills','contact']},
  contact:{title:'Let’s build something useful.',copy:'Share a task, or get in touch about a .NET role. The project brief prepares an email draft for you to review and send.',target:'contact',action:'View contact options',questions:['projects','skills']}
 };
 const menu=document.getElementById('guide-menu');
 const back=document.getElementById('guide-back');
 const homeButton=document.getElementById('guide-home');
 const location=document.getElementById('guide-location');
 const questionGroup=document.getElementById('guide-followup');
 const labels={services:'Freelance services',technical:'Client dashboard',projects:'Projects',dashboard:'Client dashboard',challenge:'Client dashboard',changes:'Client dashboard',value:'Client dashboard',api:'Insurance API',retry:'Insurance API',conflict:'Insurance API',skills:'Skills',logic:'Skills',data:'Skills',interface:'Skills',about:'About Sofia',contact:'Contact'};
 let current=null,currentEntry={key:null},history=[];
 let returnFocus=launcher;
 let flightContext=null;
 let droneHidden=false;
 let flightLayer=null;
 let flightFrame=0,positionY=null,positionX=null,targetY=0,lastFlightTime=0;
 let crossing=null,flightSide=null,scrollSettled=0,lastScrollAt=0;
 function stopFlight(){cancelAnimationFrame(flightFrame);flightFrame=0;lastFlightTime=0;flightLayer?.style.setProperty('--flight-tilt','0deg');}
 function render(entry){
  currentEntry=entry;
  const topic=topics[entry.key];current=topic?{...topic}:null;
  const isHome=!topic;
  menu.hidden=!isHome;homeButton.hidden=isHome;back.hidden=!history.length;
  location.textContent=t(isHome?'Topics':labels[entry.key]||'This section');
  title.textContent=t(topic?.title||'Where shall we start?');
  copy.textContent=t(topic?.copy||'Choose a topic. I’ll explain Sofia’s work in plain language.');
  reaction.textContent=topic?.joke?t(topic.joke):'';reaction.hidden=!topic?.joke;
  if(entry.detail){
   const detail=document.getElementById(entry.detail);
   if(detail){
    const summary=(detail.querySelector('summary h3')||detail.querySelector('summary'))?.textContent.trim().replace(/\s+/g,' ');title.textContent=detail.querySelector('summary h3')?summary:`${t(labels[entry.key]||'This section')} · ${summary}`;
    const paragraph=[...detail.querySelectorAll('p')].find(p=>!p.closest('summary'))?.textContent.trim();
    if(paragraph)copy.textContent=paragraph.length>360?paragraph.slice(0,360).replace(/\s+\S*$/,'')+'…':paragraph;
    current={...current,target:detail.id,action:'Read this section'};reaction.hidden=true;location.textContent=t('This section');
   }
  }
  questions.replaceChildren();
  for(const child of topic?.questions||[]){
   const button=document.createElement('button');button.type='button';
   button.textContent=t(topics[child].label||labels[child]||topics[child].title);
   button.addEventListener('click',()=>navigate({key:child}));questions.append(button);
  }
  questionGroup.hidden=!questions.children.length;
  explore.hidden=!current?.target;explore.textContent=current?t(current.action||'Read this section'):'';
  panel.dataset.view=isHome?'menu':'topic';
 }
 function navigate(entry){if(entry.key===currentEntry.key&&entry.detail===currentEntry.detail)return;history.push(currentEntry);render(entry);title.focus({preventScroll:true});document.getElementById('guide-body').scrollTop=0;}
 function open(trigger=launcher,entry={key:null}){
  window.dispatchEvent(new CustomEvent('portfolio-drone-expression',{detail:{face:'think',duration:0}}));
  history=entry.key?[{key:null}]:[];render(entry);returnFocus=trigger;
  root.hidden=false;droneHidden=false;stopFlight();launcher.style.transform='none';panel.hidden=false;launcher.hidden=true;
  if(flightLayer)flightLayer.hidden=true;launcher.setAttribute('aria-expanded','true');
  document.getElementById('guide-body').scrollTop=0;document.getElementById('guide-settings').open=false;title.focus({preventScroll:true});
 }
 function close(focus=true){window.dispatchEvent(new CustomEvent('portfolio-drone-expression',{detail:{face:'neutral',duration:0}}));panel.hidden=true;launcher.hidden=false;if(flightLayer)flightLayer.hidden=false;launcher.setAttribute('aria-expanded','false');if(focus)returnFocus.focus({preventScroll:true});queueFlight();}
 launcher.addEventListener('click',()=>{const entry={key:launcher.dataset.context||null};if(flightContext?.detail?.open)entry.detail=flightContext.detail.id;open(launcher,entry);});
 document.getElementById('guide-close').addEventListener('click',()=>close());
 document.getElementById('guide-hide').addEventListener('click',()=>{close(false);droneHidden=true;launcher.hidden=true;if(flightLayer)flightLayer.hidden=true;root.hidden=true;stopFlight();if(flightContext){flightContext.element.setAttribute('tabindex','-1');flightContext.element.focus({preventScroll:true});}});
 homeButton.addEventListener('click',()=>{history=[];render({key:null});title.focus({preventScroll:true});document.getElementById('guide-body').scrollTop=0;});
 back.addEventListener('click',()=>{if(!history.length)return;render(history.pop());title.focus({preventScroll:true});document.getElementById('guide-body').scrollTop=0;});
 document.querySelectorAll('[data-guide-topic]').forEach(button=>button.addEventListener('click',()=>{const entry={key:button.dataset.guideTopic};if(panel.contains(button))navigate(entry);else open(button,entry);}));
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!panel.hidden){event.preventDefault();close();}});
 explore.addEventListener('click',()=>{const target=document.getElementById(current?.target);if(!target){const routes={'cartograph-case':'cartograph','life-rpg-case':'life-rpg','dashboard-overview':'client-dashboard','dashboard-details':'client-dashboard','production-platforms':'client-dashboard','insurance-details':'insurance-api','api-demo':'insurance-api'};const route=routes[current?.target];if(route){const lang=document.documentElement.lang;window.location.assign((lang==='en'?'':'/'+lang)+'/projects/'+route+'/#'+current.target);}return;}for(let node=target;node;node=node.parentElement){if(node.tagName==='DETAILS')node.open=true;}close(false);target.scrollIntoView({behavior:canMove()?'smooth':'auto',block:'start'});target.setAttribute('tabindex','-1');target.focus({preventScroll:true});});
 document.querySelectorAll('[data-skill]').forEach(button=>button.addEventListener('click',()=>{if(!panel.hidden)navigate({key:button.dataset.skill});}));
 render({key:null});
 // Fly inside the reserved side rail, with one continuous motion controller.
 flightLayer=document.createElement('div');flightLayer.className='drone-flight-layer';
 document.body.append(flightLayer);flightLayer.append(launcher);
 const chapters=[
  ['.hero','home'],['#services','services'],['#work','projects'],['#dashboard-title','dashboard'],
  ['#insurance-project','api'],['#skills-map','skills'],['#notes','projects'],
  ['#about','about'],['.stack-section','skills'],['#contact','contact']
 ].map(([selector,topic])=>({element:document.querySelector(selector),topic})).filter(stop=>stop.element);
 let flightQueued=false,lastCrossAt=performance.now();
 function updateFlight(){
  flightQueued=false;if(droneHidden||!panel.hidden)return;
  // Preserve the topic while the visitor is interacting with the launcher.
  if(launcher.matches(':hover, :focus-visible')&&flightContext)return;
  const checkpoint=Math.max(document.querySelector('.site-header').getBoundingClientRect().bottom+40,innerHeight*.35);
  const reached=chapters.filter(stop=>stop.element.getBoundingClientRect().top<=checkpoint);
  flightContext=reached.at(-1)||chapters[0];
  launcher.dataset.context=flightContext.topic==='home'?'':flightContext.topic;
  launcher.setAttribute('aria-label',t('Open portfolio guide'));
  document.getElementById('drone-label').textContent=t('Open portfolio guide');
  launcher.hidden=false;flightLayer.hidden=false;
  if(innerWidth<=760){stopFlight();positionY=null;positionX=null;crossing=null;flightSide=null;['top','left','right'].forEach(name=>flightLayer.style.removeProperty(name));return;}
  const size=flightLayer.offsetHeight;
  const pageWidth=document.documentElement.clientWidth;
  const left=12,right=pageWidth-size-12;
  const initialSide=document.documentElement.dir==='rtl'?'left':'right';
  const desiredSide=chapters.indexOf(flightContext)%2?(initialSide==='left'?'right':'left'):initialSide;
  if(positionX===null){flightSide=initialSide;positionX=initialSide==='left'?left:right;}
  positionX=Math.min(right,Math.max(left,positionX));
  flightLayer.style.left=`${positionX}px`;flightLayer.style.right='auto';
  const top=document.querySelector('.site-header').getBoundingClientRect().bottom+20;
  const bottom=Math.max(top,innerHeight-size-24);
  const box=flightContext.element.getBoundingClientRect();
  const progress=Math.min(1,Math.max(0,(checkpoint-box.top)/Math.max(1,box.height)));
  targetY=Math.min(bottom,Math.max(top,innerHeight*(.28+progress*.4)));
  if(!crossing&&desiredSide!==flightSide&&performance.now()-lastScrollAt>1000&&performance.now()-lastCrossAt>30000&&canMove()){
   const lane=findFlightLane(top,bottom,size);
   if(lane!==null){crossing={side:desiredSide,documentY:lane+scrollY,stage:'lift'};lastCrossAt=performance.now();}
  }
  if(!canMove()){stopFlight();crossing=null;positionX=flightSide==='left'?left:right;flightLayer.style.left=`${positionX}px`;positionY=Math.min(bottom,Math.max(top,innerHeight*.65));flightLayer.style.top=`${positionY}px`;return;}
  if(positionY===null)positionY=targetY;
  positionY=Math.min(bottom,Math.max(top,positionY));
  flightLayer.style.top=`${positionY}px`;
  if(!flightFrame)flightFrame=requestAnimationFrame(fly);
 }
 // Cross through visible whitespace, rather than parking over readable content.
 function findFlightLane(top,bottom,size){
  const occupied=[];
  const walker=document.createTreeWalker(document.querySelector('main'),NodeFilter.SHOW_TEXT);
  const range=document.createRange();
  while(walker.nextNode()){
   const node=walker.currentNode;if(!node.textContent.trim()||!node.parentElement.checkVisibility())continue;
   if(node.parentElement.closest('details:not([open])')&&!node.parentElement.closest('summary'))continue;
   range.selectNodeContents(node);
   for(const box of range.getClientRects())if(box.width&&box.bottom>top&&box.top<innerHeight)occupied.push([box.top-8,box.bottom+8]);
  }
  document.querySelectorAll('main img,main [role=img],main button,main input').forEach(element=>{
   if(!element.checkVisibility())return;
   const box=element.getBoundingClientRect();if(box.width&&box.height&&box.bottom>top&&box.top<innerHeight)occupied.push([box.top-8,box.bottom+8]);
  });
  occupied.sort((a,b)=>a[0]-b[0]);
  let cursor=top;const gaps=[];
  for(const [start,end] of occupied){if(start-cursor>=size+8)gaps.push(cursor+(start-cursor-size)/2);cursor=Math.max(cursor,end);}
  if(innerHeight-24-cursor>=size+8)gaps.push(cursor+(innerHeight-24-cursor-size)/2);
  return gaps.filter(y=>y>=top&&y<=bottom).sort((a,b)=>Math.abs(a-positionY)-Math.abs(b-positionY))[0]??null;
 }
 function fly(time){
  flightFrame=0;
  if(!canMove()||droneHidden||!panel.hidden||launcher.matches(':hover, :focus-visible')){stopFlight();return;}
  const dt=Math.min(.04,Math.max(0,(time-(lastFlightTime||time))/1000));lastFlightTime=time;
  let destinationX=flightSide==='left'?12:document.documentElement.clientWidth-flightLayer.offsetWidth-12;
  let destinationY=targetY;
  if(crossing){
   const lane=crossing.documentY-scrollY;
   const safeTop=document.querySelector('.site-header').getBoundingClientRect().bottom+20;
   const safeBottom=innerHeight-flightLayer.offsetHeight-24;
   destinationY=Math.max(safeTop,Math.min(safeBottom,lane));
   if(crossing.stage==='lift'&&Math.abs(destinationY-positionY)<2)crossing.stage='cross';
   if(crossing.stage==='cross')destinationX=crossing.side==='left'?12:document.documentElement.clientWidth-flightLayer.offsetWidth-12;
  }
  const distance=destinationY-positionY;
  const step=Math.sign(distance)*Math.min(Math.abs(distance)*(1-Math.exp(-1.5*dt)),65*dt);
  const dx=destinationX-positionX;
  const stepX=Math.sign(dx)*Math.min(Math.abs(dx)*(1-Math.exp(-1.3*dt)),90*dt);
  positionY+=step;
  positionX+=stepX;
  flightLayer.style.top=`${positionY}px`;
  flightLayer.style.left=`${positionX}px`;
  flightLayer.classList.toggle('is-left',positionX<document.documentElement.clientWidth/2);
  flightLayer.style.setProperty('--flight-tilt',`${Math.max(-4,Math.min(4,stepX*.4+step*.3))}deg`);
  if(crossing?.stage==='cross'&&Math.abs(dx)<1){flightSide=crossing.side;crossing=null;}
  if(crossing||Math.abs(targetY-positionY)>.3||Math.abs(dx)>.3)flightFrame=requestAnimationFrame(fly);else stopFlight();
 }
 function queueFlight(){if(!flightQueued){flightQueued=true;requestAnimationFrame(updateFlight);}}
 window.addEventListener('scroll',()=>{lastScrollAt=performance.now();clearTimeout(scrollSettled);scrollSettled=setTimeout(queueFlight,1100);queueFlight();},{passive:true});
 window.addEventListener('resize',queueFlight);
 document.addEventListener('toggle',queueFlight,true);
 launcher.addEventListener('pointerenter',stopFlight);
 launcher.addEventListener('focus',stopFlight);
 launcher.addEventListener('pointerleave',queueFlight);
 launcher.addEventListener('blur',queueFlight);
 window.addEventListener('portfolio-motion-change',()=>{stopFlight();queueFlight();});
 motion.addEventListener('change',()=>{stopFlight();queueFlight();});
 document.addEventListener('visibilitychange',()=>{stopFlight();if(!document.hidden)queueFlight();});
 root.hidden=false;
 updateFlight();
})();
