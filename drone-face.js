'use strict';
(() => {
 const panel=document.getElementById('guide-panel');
 const launcher=document.getElementById('guide-launcher');
 const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
 const faces={neutral:'0% 0%',curious:'0% 0%',think:'100% 0%',happy:'0% 100%',blink:'100% 100%'};
 const sprites=[];
 let state='neutral',reactionTimer=null,blinkTimer=null;
 const animated=()=>!reduce.matches&&!document.hidden&&!document.documentElement.classList.contains('motion-paused');
 function render(face){state=face;for(const sprite of sprites){sprite.dataset.expression=face;sprite.style.backgroundPosition=faces[face];}}
 function resting(){return panel.hidden?'neutral':'think';}
 function react(face,duration=2400){if(!faces[face])return;clearTimeout(reactionTimer);render(face);scheduleBlink();if(duration)reactionTimer=setTimeout(()=>{render(resting());reactionTimer=null;},duration);}
 function scheduleBlink(){
  clearTimeout(blinkTimer);if(!animated())return;
  blinkTimer=setTimeout(()=>{if(state==='neutral'&&panel.hidden&&!launcher.hidden){render('blink');blinkTimer=setTimeout(()=>{render(resting());scheduleBlink();},170);}else scheduleBlink();},6000+Math.random()*4000);
 }
 function resetMotion(){clearTimeout(blinkTimer);if(state==='blink')render(resting());scheduleBlink();}
 window.addEventListener('portfolio-drone-expression',event=>react(event.detail?.face,event.detail?.duration??2400));
 document.querySelectorAll('main details').forEach(detail=>detail.addEventListener('toggle',()=>{if(detail.open)react('curious');}));
 launcher.addEventListener('pointerenter',()=>react('curious',1800));
 window.addEventListener('portfolio-motion-change',resetMotion);reduce.addEventListener('change',resetMotion);document.addEventListener('visibilitychange',resetMotion);
 const sheet=new Image();
 sheet.onload=()=>{
  for(const image of document.querySelectorAll('.guide-launcher img, #guide-art img')){
   const sprite=document.createElement('span');sprite.className='drone-expression';sprite.setAttribute('aria-hidden','true');
   sprite.style.aspectRatio=`${sheet.naturalWidth} / ${sheet.naturalHeight}`;
   image.parentNode.append(sprite);image.parentNode.classList.add('drone-expressions-ready');sprites.push(sprite);
  }
  render(state);scheduleBlink();
 };
 sheet.src='/assets/drone-expressions.png';
})();
