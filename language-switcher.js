'use strict';
(() => {const selector=document.getElementById('language-select');selector?.addEventListener('change',()=>{const link=document.querySelector('[data-language="'+selector.value+'"]');if(!link)return;const destination=new URL(link.href);destination.hash=location.hash;location.assign(destination.href);});})();
