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
 motionToggle.addEventListener('click',()=>{paused=!paused;document.documentElement.classList.toggle('motion-paused',paused);try{localStorage.setItem('sofia-motion-paused',String(paused));}catch{}window.dispatchEvent(new Event('portfolio-motion-change'));motionToggle.setAttribute('aria-pressed',String(paused));motionToggle.textContent=t(paused?'Resume motion':'Pause motion');if(paused)halt();});
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
  projects:{title:'Two projects. Different challenges.',copy:'Explore a client dashboard rebuilt across the stack, or a personal API focused on reliable operations.',questions:['dashboard','api']},
  dashboard:{title:'A dashboard worth buying.',copy:'Sofia independently improved SQL, server logic, automation and UI. The result was a dashboard the client wanted to buy, although buying it was not originally planned.',questions:['changes','value','technical'],target:'dashboard-overview',action:'Explore the dashboard'},
  challenge:{label:'What was difficult?',title:'Several layers. One workflow.',copy:'Stored procedures dated back to 2013. Server logic, API calls, manual changes, jobs, migrations and the interface all needed attention. Sofia worked across these layers herself.',questions:['changes','value'],target:'dashboard-overview',action:'Explore the dashboard'},
  changes:{label:'What changed?',title:'From manual changes to automation.',copy:'She rewrote stored procedures, improved server-side logic, reorganized API calls, automated manual changes, optimized jobs and migrations, and made the UI cleaner and easier to use.',questions:['challenge','value','technical'],target:'dashboard-overview',action:'Explore the dashboard'},
  value:{label:'Why does it matter?',title:'The client saw enough value to want ownership.',copy:'The client wanted to buy the entire dashboard, despite that not being part of the original plan. Sofia has no verified purchase outcome or measured performance figures to share.',questions:['challenge','changes','technical'],target:'dashboard-overview',action:'Explore the dashboard'},
  technical:{joke:'Let’s go deeper. Almost nobody reads this far.',label:'Show the technical part',title:'Engineering decisions',copy:'I reorganized API interactions and improved server-side logic so each layer had a clearer responsibility.',target:'dashboard-details',action:'Show the technical part',questions:['changes','value']},
  api:{title:'Reliable operations, explained.',copy:'The insurance API demonstrates how Sofia handles repeated requests, conflicting changes and clear business rules. Choose a situation to see why it matters.',questions:['retry','conflict'],target:'insurance-details',action:'Explore the API decisions'},
  retry:{label:'What if I click twice?',title:'A retry should not create a duplicate.',copy:'If the same request is sent again with the same key and information, the API returns the existing result. Reusing that key with different information produces a conflict.',questions:['conflict'],target:'api-demo',action:'Try the interactive example'},
  conflict:{label:'What if two people edit at once?',title:'Conflicting changes should be visible.',copy:'A version check detects when someone else has already changed a record. The API reports the conflict instead of silently overwriting the newer information.',questions:['retry'],target:'api-demo',action:'Try the interactive example'},
  skills:{title:'The tools behind the work.',copy:'C#, ASP.NET Core, SQL and JavaScript connect business rules, data and the interface. Pick a layer to see how Sofia uses it.',questions:['logic','data','interface'],target:'skill-insight',action:'Explore the skill map'},
  logic:{label:'Business logic',title:'Backend decisions, visible in code.',copy:'C# and ASP.NET Core power business rules, validation and API operations. The insurance project shows safe retries and explicit handling of conflicting changes.',target:'insurance-details',action:'Explore the API decisions',questions:['data','interface']},
  data:{label:'Data & reliability',title:'SQL that supports the workflow.',copy:'Sofia rewrote legacy stored procedures and optimized jobs and migrations in the client dashboard. Her API also uses SQL constraints and version checks to protect consistent records.',target:'dashboard-overview',action:'Explore the dashboard',questions:['logic','interface']},
  interface:{label:'The human interface',title:'Clearer screens. Easier everyday tasks.',copy:'JavaScript, Razor and Umbraco connect the interface to production systems. Sofia improved the dashboard UI and worked with Hebrew and English interfaces.',target:'production-platforms',action:'Read about production work',questions:['logic','data']},
  about:{title:'The person behind the code.',copy:'Sofia is a full-stack developer with production .NET experience. She connects business logic, data and usable interfaces, with room for art and curiosity outside code.',target:'about',action:'Read about Sofia',questions:['skills','contact']},
  contact:{title:'Let’s build something useful.',copy:'Looking for a full-stack developer or help improving an existing system? Download Sofia’s CV, find her on LinkedIn or contact her by email.',target:'contact',action:'View contact options',questions:['projects','skills']}
 };
 const menu=document.getElementById('guide-menu');
 const back=document.getElementById('guide-back');
 const homeButton=document.getElementById('guide-home');
 const location=document.getElementById('guide-location');
 const questionGroup=document.getElementById('guide-followup');
 const labels={technical:'Client dashboard',projects:'Projects',dashboard:'Client dashboard',challenge:'Client dashboard',changes:'Client dashboard',value:'Client dashboard',api:'Insurance API',retry:'Insurance API',conflict:'Insurance API',skills:'Skills',logic:'Skills',data:'Skills',interface:'Skills',about:'About Sofia',contact:'Contact'};
 let current=null,currentEntry={key:null},history=[];
 let returnFocus=launcher;
 let flightContext=null;
 let droneHidden=false;
 let flightLayer=null;
 function stopFlight(){if(!flightLayer)return;const position=getComputedStyle(flightLayer).transform;flightLayer.style.transition='none';if(position!=='none')flightLayer.style.transform=position;}
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
 explore.addEventListener('click',()=>{const target=document.getElementById(current?.target);if(!target)return;if(target.tagName==='DETAILS')target.open=true;close(false);target.scrollIntoView({behavior:canMove()?'smooth':'auto',block:'start'});target.setAttribute('tabindex','-1');target.focus({preventScroll:true});});
 document.querySelectorAll('[data-skill]').forEach(button=>button.addEventListener('click',()=>{if(!panel.hidden)navigate({key:button.dataset.skill});}));
 render({key:null});
 // The launcher stays in a viewport layer so scrolling never removes it.
 flightLayer=document.createElement('div');flightLayer.className='drone-flight-layer';
 document.body.append(flightLayer);flightLayer.append(launcher);
 const chapters=[
  ['#skills-map-title','skills','Ask the drone about the skills'],
  ['#work-title','projects','Ask the drone about the projects'],
  ['.dashboard-intro h3','dashboard','Ask the drone about the dashboard'],
  ['.featured-copy h3','api','Ask the drone about the API'],
  ['#notes-title','projects','Ask the drone about the projects'],
  ['#about-title','about','Ask the drone about Sofia'],
  ['#stack-title','skills','Ask the drone about the skills'],
  ['#contact-title','contact','Ask the drone about contact options']
 ];
 const stops=[];
 chapters.forEach(([selector,topic,label])=>{
  const heading=document.querySelector(selector);if(!heading)return;
  const wrapper=document.createElement('div');wrapper.className='drone-heading-anchor';
  heading.parentNode.insertBefore(wrapper,heading);wrapper.append(heading);
  const dock=document.createElement('div');dock.className='drone-reading-dock';wrapper.append(dock);
  stops.push({element:wrapper,dock,scope:heading.closest('article, section')||wrapper,topic,label});
 });
 document.querySelectorAll('main details').forEach((detail,index)=>{
  const summary=detail.querySelector('summary');if(!summary)return;
  if(!detail.id)detail.id=`reader-detail-${index}`;
  const dock=document.createElement('div');dock.className='drone-reading-dock detail-reading-dock';
  summary.insertAdjacentElement('afterend',dock);
  const topic=detail.id==='dashboard-details'?'changes':detail.id==='api-demo'?'retry':detail.closest('#insurance-project')?'api':detail.classList.contains('work-row')?'interface':detail.classList.contains('note-card')?([...document.querySelectorAll('.note-card')].indexOf(detail)===0?'retry':'changes'):'projects';
  const stop={element:dock,dock,scope:detail,detail,topic,label:'Ask the drone about this section'};stops.push(stop);
  detail.addEventListener('toggle',()=>{if(detail.open&&scopeVisible(stop)){expandedStop=stop;settleScroll();}else{if(expandedStop===stop)expandedStop=null;queueFlight();}});
 });
 let expandedStop=null;
 let flightQueued=false;
 let fastScrolling=false;
 let settleTimer=null;
 let previousScroll=window.scrollY;
 let previousScrollTime=performance.now();
 function settleScroll(){clearTimeout(settleTimer);settleTimer=null;fastScrolling=false;queueFlight();}
 function onScroll(){
  if(window.innerWidth<=760){clearTimeout(settleTimer);settleTimer=null;fastScrolling=false;queueFlight();return;}
  const now=performance.now(),distance=Math.abs(window.scrollY-previousScroll),elapsed=Math.max(16,now-previousScrollTime);
  previousScroll=window.scrollY;previousScrollTime=now;
  if(distance>100||distance/elapsed>1.2){
   if(!fastScrolling&&!droneHidden&&panel.hidden&&!launcher.matches(':hover, :focus-visible')){
    const size=window.innerWidth<=760?90:140;
    const box=flightLayer.getBoundingClientRect();
    const x=document.documentElement.dir==='rtl'?8:window.innerWidth-size-8;
    const y=Math.min(Math.max(readingTop(),window.innerHeight-size-20),Math.max(readingTop(),box.top));
    flightLayer.style.transition=canMove()?'transform 600ms ease-out':'none';
    flightLayer.style.transform=`translate(${x}px,${y}px)`;
   }
   fastScrolling=true;
  }
  clearTimeout(settleTimer);
  if(fastScrolling)settleTimer=setTimeout(settleScroll,300);else queueFlight();
 }
 function readingTop(){return Math.max(16,(document.querySelector('.site-header')?.getBoundingClientRect().bottom||70)+12);}
 function scopeVisible(stop){if(stop.detail&&!stop.detail.open)return false;const box=stop.scope.getBoundingClientRect();return box.bottom>readingTop()&&box.top<window.innerHeight-30;}
 function moveTo(context){
  if(!context||droneHidden||!panel.hidden)return;
  if(window.innerWidth>760&&launcher.matches(':hover, :focus-visible')&&flightContext)return;
  flightContext=context;launcher.dataset.context=context.topic;
  launcher.setAttribute('aria-label',t(context.label));document.getElementById('drone-label').textContent=t(context.label);
  if(window.innerWidth<=760){launcher.hidden=false;flightLayer.hidden=false;flightLayer.style.transition='none';flightLayer.style.transform='none';return;}
  const size=window.innerWidth<=760?90:140;
  const dock=context.dock.getBoundingClientRect();
  const top=readingTop(),bottom=Math.max(top,window.innerHeight-size-20);
  const dockOnscreen=dock.top>=top&&dock.bottom<=window.innerHeight-20;
  // The reading rail is outside the text column, including on narrow screens.
  const x=document.documentElement.dir==='rtl'?8:window.innerWidth-size-8;
  const y=Math.min(bottom,Math.max(top,dock.top));
  const destination=dockOnscreen&&window.innerWidth>760?Math.min(window.innerWidth-size-8,Math.max(8,dock.left)):x;
  launcher.hidden=false;flightLayer.hidden=false;
  flightLayer.style.transition=canMove()?'transform 1600ms cubic-bezier(.22,.68,.25,1)':'none';
  flightLayer.style.transform=`translate(${destination}px,${y}px)`;
 }
 function updateFlight(){
  flightQueued=false;if(fastScrolling||droneHidden||!panel.hidden)return;
  if(!canMove())stopFlight();
  const candidates=stops.filter(scopeVisible);
  const checkpoint=Math.max(readingTop()+40,window.innerHeight*.3);
  if(expandedStop&&scopeVisible(expandedStop)){moveTo(expandedStop);return;}
  expandedStop=null;
  // Prefer the latest heading already reached; retain its whole chapter between headings.
  candidates.sort((a,b)=>{
   const at=a.element.getBoundingClientRect().top,bt=b.element.getBoundingClientRect().top;
   if(at<=checkpoint&&bt>checkpoint)return -1;
   if(bt<=checkpoint&&at>checkpoint)return 1;
   return at<=checkpoint?bt-at:at-bt;
  });
  const context=candidates[0]||flightContext||stops[0];
  if(context)moveTo(context);
 }
 function queueFlight(){if(!flightQueued){flightQueued=true;window.requestAnimationFrame(updateFlight);}}
 window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('resize',()=>{stopFlight();settleScroll();});
 window.addEventListener('portfolio-motion-change',()=>{if(!canMove())stopFlight();queueFlight();});motion.addEventListener('change',()=>{stopFlight();queueFlight();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stopFlight();queueFlight();});
 launcher.addEventListener('pointerenter',stopFlight);launcher.addEventListener('pointerleave',queueFlight);
 launcher.addEventListener('focus',stopFlight);launcher.addEventListener('blur',queueFlight);
 root.hidden=false;
 updateFlight();
})();
