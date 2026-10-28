'use strict';
(() => {
 const t=window.portfolioI18n.t;
 const form=document.getElementById('project-enquiry');
 const service=document.getElementById('enquiry-service');
 const brief=document.getElementById('enquiry-brief');
 const timing=document.getElementById('enquiry-timing');
 const preview=document.getElementById('brief-preview');
 const content=document.getElementById('brief-content');
 const email=document.getElementById('brief-email');
 const status=document.getElementById('enquiry-status');
 function prepare(){
  brief.setCustomValidity(brief.value.trim()?'':t('Please describe the task.'));
  if(!form.reportValidity())return null;
  const subject=`${t('Project enquiry')} — ${service.selectedOptions[0].textContent}`;
  const body=[t('Hello Sofia,'),'',`${t('Service')}: ${service.selectedOptions[0].textContent}`,'',brief.value.trim(),timing.value.trim()?`\n${t('Timing / constraints')}: ${timing.value.trim()}`:'','',t('Please let me know what you need to assess the scope and cost.')].filter(line=>line!==null).join('\n');
  content.textContent=body;
  email.href=`mailto:sofia.museichuk@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  preview.hidden=false;
  return body;
 }
 form.addEventListener('submit',event=>{event.preventDefault();if(prepare()){status.textContent=t('Your draft is ready. Review it below, then open your email app to send it.');preview.focus({preventScroll:true});}});
 brief.addEventListener('invalid',()=>brief.setAttribute('aria-invalid','true'));
 form.addEventListener('input',()=>{brief.setCustomValidity('');brief.removeAttribute('aria-invalid');preview.hidden=true;status.textContent='';});
 document.querySelectorAll('[data-service-choice]').forEach(link=>link.addEventListener('click',()=>{service.value=link.dataset.serviceChoice;preview.hidden=true;status.textContent='';}));
 document.getElementById('copy-brief').addEventListener('click',async()=>{
  const body=prepare();if(!body)return;
  try{await navigator.clipboard.writeText(body);status.textContent=t('Brief copied. Paste it into an email to Sofia.');}
  catch{status.textContent=t('Copy is unavailable. Select the draft text below and copy it manually.');}
 });
})();
