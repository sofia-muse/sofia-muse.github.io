'use strict';
(() => {
 const t=window.portfolioI18n.t;
 document.getElementById('year').textContent=new Date().getFullYear();
 const copy=document.querySelector('[data-copy-email]');
 copy?.addEventListener('click',async()=>{const status=document.getElementById('copy-status');try{await navigator.clipboard.writeText('sofia.museichuk@gmail.com');status.textContent=t('Email address copied.');}catch{status.textContent=t('Copy isn’t available here. Select the email address, or click it to open your email app.');}});
 function reveal(){const target=document.getElementById(decodeURIComponent(location.hash.slice(1)));for(let node=target;node;node=node.parentElement)if(node.tagName==='DETAILS')node.open=true;}
 reveal();addEventListener('hashchange',reveal);
 document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',()=>{const target=document.getElementById(a.hash.slice(1));for(let node=target;node;node=node.parentElement)if(node.tagName==='DETAILS')node.open=true;}));
 const deferred=document.querySelectorAll('[data-defer-art]');
 if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.dataset.assetReady='true';observer.unobserve(entry.target);}}),{rootMargin:'300px'});deferred.forEach(el=>observer.observe(el));}else deferred.forEach(el=>el.dataset.assetReady='true');
 const progress=document.querySelector('.reading-progress');function update(){const max=document.documentElement.scrollHeight-innerHeight;progress.style.transform=`scaleX(${max>0?scrollY/max:0})`;}
 addEventListener('scroll',update,{passive:true});update();
})();
