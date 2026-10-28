'use strict';
(() => {
 const classes={contrast:'a11y-contrast',spacing:'a11y-spacing',links:'a11y-links',drone:'a11y-hide-drone'};
 let choice=null;
 try{
  const value=document.cookie.split('; ').find(item=>item.startsWith('sofia_portfolio_consent='));
  const parsed=value?JSON.parse(decodeURIComponent(value.split('=').slice(1).join('='))):null;
  if(parsed?.version===1&&typeof parsed.preferences==='boolean')choice=parsed;
 }catch{}
 window.portfolioConsent=choice;
 const allowed=()=>window.portfolioConsent?.preferences===true;
 function clear(){try{localStorage.removeItem('sofia-accessibility');localStorage.removeItem('sofia-motion-paused');}catch{}}
 function set(key,value){if(allowed())try{localStorage.setItem(key,value);}catch{}}
 function persistCurrent(){
  const root=document.documentElement,settings={size:root.dataset.textSize||'normal'};
  for(const [key,name] of Object.entries(classes))settings[key]=root.classList.contains(name);
  set('sofia-accessibility',JSON.stringify(settings));
  set('sofia-motion-paused',String(root.classList.contains('motion-paused')));
 }
 window.portfolioStorage={allowed,set,clear,persistCurrent};
 if(!allowed()){clear();return;}
 try{
  if(localStorage.getItem('sofia-motion-paused')==='true')document.documentElement.classList.add('motion-paused');
  const settings=JSON.parse(localStorage.getItem('sofia-accessibility')||'{}');
  if(['large','larger'].includes(settings.size))document.documentElement.dataset.textSize=settings.size;
  for(const [key,name] of Object.entries(classes))if(settings[key]===true)document.documentElement.classList.add(name);
 }catch{}
})();
