'use strict';
(() => {
 const banner=document.getElementById('cookie-banner');
 const dialog=document.getElementById('cookie-dialog');
 const preferences=document.getElementById('cookie-preferences');
 const status=document.getElementById('cookie-status');
 const t=window.portfolioI18n.t;
 let returnFocus=null;
 function showBanner(){
  banner.hidden=false;document.body.classList.add('has-cookie-banner');
  updateSpace();
 }
 function updateSpace(){document.documentElement.style.setProperty('--cookie-banner-height',`${banner.hidden?0:banner.getBoundingClientRect().height}px`);}
 new ResizeObserver(updateSpace).observe(banner);
 function choose(allow){
  const choice={version:1,preferences:allow};
  try{
   const record=`sofia_portfolio_consent=${encodeURIComponent(JSON.stringify(choice))}`;
   document.cookie=`${record}; Max-Age=15552000; Path=/; SameSite=Lax${location.protocol==='https:'?'; Secure':''}`;
   const saved=document.cookie.split('; ').includes(record);
   if(!saved)throw new Error('Cookie storage unavailable');
  }catch{
   window.portfolioConsent={version:1,preferences:false};window.portfolioStorage.clear();preferences.checked=false;
   window.dispatchEvent(new Event('portfolio-consent-change'));
   const message=t('Your browser could not save this choice. Optional storage remains off.');
   status.textContent=message;document.getElementById('cookie-dialog-status').textContent=message;
   return;
  }
  window.portfolioConsent=choice;
  if(allow)window.portfolioStorage.persistCurrent();else window.portfolioStorage.clear();
  const bannerHadFocus=banner.contains(document.activeElement);
  banner.hidden=true;document.body.classList.remove('has-cookie-banner');updateSpace();
  if(dialog.open)dialog.close();
  if(bannerHadFocus)document.getElementById('main').focus({preventScroll:true});
  window.dispatchEvent(new Event('portfolio-consent-change'));
 }
 document.querySelectorAll('[data-cookie-accept]').forEach(button=>button.addEventListener('click',()=>choose(true)));
 document.querySelectorAll('[data-cookie-reject]').forEach(button=>button.addEventListener('click',()=>choose(false)));
 document.querySelectorAll('[data-cookie-settings]').forEach(button=>button.addEventListener('click',()=>{
  returnFocus=button;preferences.checked=window.portfolioConsent?.preferences===true;dialog.showModal();
 }));
 document.getElementById('cookie-save').addEventListener('click',()=>choose(preferences.checked));
 document.getElementById('cookie-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('close',()=>{
  const target=returnFocus?.checkVisibility()?returnFocus:document.getElementById('main');
  target.focus({preventScroll:true});
 });
 dialog.addEventListener('keydown',event=>{
  if(event.key!=='Tab')return;
  const items=[...dialog.querySelectorAll('button:not([disabled]),input:not([disabled])')];
  if(event.shiftKey&&document.activeElement===items[0]){event.preventDefault();items.at(-1).focus();}
  else if(!event.shiftKey&&document.activeElement===items.at(-1)){event.preventDefault();items[0].focus();}
 });
 document.querySelectorAll('[data-cookie-settings]').forEach(button=>button.hidden=false);
 if(!window.portfolioConsent)showBanner();
})();
