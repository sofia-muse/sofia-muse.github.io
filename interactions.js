'use strict';
(() => {
 const t = window.portfolioI18n.t;
 const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
 window.portfolioMotion = {pulse(element) {
  if (!reduceMotion.matches && !document.documentElement.classList.contains("motion-paused") && element?.animate) element.animate([{opacity:.55,transform:'translateY(5px)'},{opacity:1,transform:'translateY(0)'}],{duration:220,easing:'ease-out'});
 }};
 const activeSignals = new Map();
 function energize(button) {
  activeSignals.forEach(animation => animation.cancel());
  activeSignals.clear();
  if (reduceMotion.matches || document.documentElement.classList.contains("motion-paused")) return;
  const layer = button.closest('li');
  const circuit = layer.querySelector('.layer-circuit');
  const signal = layer.querySelector('.layer-signal');
  if (!circuit?.animate || !signal?.animate) return;
  activeSignals.set('circuit', circuit.animate([
   {clipPath:'inset(0 0 100% 0)',opacity:0},
   {clipPath:'inset(0)',opacity:1,offset:.45},
   {clipPath:'inset(0)',opacity:0}
  ], {duration:780,easing:'ease-out'}));
  activeSignals.set('signal', signal.animate([
   {transform:'scaleX(0)',opacity:0},
   {transform:'scaleX(0)',opacity:1,offset:.25},
   {transform:'scaleX(1)',opacity:1,offset:.7},
   {transform:'scaleX(1)',opacity:0}
  ], {duration:900,easing:'ease-out'}));
 }
 reduceMotion.addEventListener('change', () => {
  if (reduceMotion.matches) { activeSignals.forEach(animation => animation.cancel()); activeSignals.clear(); }
 });
 window.addEventListener('portfolio-motion-change',()=>{if(document.documentElement.classList.contains('motion-paused')){activeSignals.forEach(animation=>animation.cancel());activeSignals.clear();}});
 const skills = {
  logic: ['Backend decisions, visible in code.','Business rules, safe retries and explicit conflicts in my insurance API.','Explore the API case','#insurance-project',null],
  data: ['Database work with a client-facing purpose.','Rewriting stored procedures from 2013 was part of making the client dashboard more responsive.','Explore the SQL work','#work','data'],
  interface: ['Interfaces people can actually use.','Client dashboards, bilingual platforms, Razor templates and dynamic JavaScript interfaces.','Explore interface work','#production-platforms',null]
 };
 const buttons = [...document.querySelectorAll('[data-skill]')];
 const projectLink = document.getElementById('skill-project');
 let focusedChange = null;
 buttons.forEach(button => button.addEventListener('click', () => {
  const skill = skills[button.dataset.skill];
  if (!skill) return;
  buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  document.getElementById('skill-title').textContent = t(skill[0]);
  document.getElementById('skill-description').textContent = t(skill[1]);
  projectLink.textContent = t(skill[2]);
  projectLink.setAttribute('href', skill[3]);
  focusedChange = skill[4];
  energize(button);
  window.portfolioMotion.pulse(document.getElementById('skill-insight'));
 }));
 projectLink.addEventListener('click', () => {
  const target = document.getElementById(projectLink.getAttribute('href').slice(1));
  if (target?.tagName === 'DETAILS') target.open = true;
  if (focusedChange) { document.getElementById('dashboard-details').open = true; document.querySelector(`[data-change="${focusedChange}"]`)?.click(); }
 });
 function revealDetails() {
  const target = document.getElementById(window.location.hash.slice(1));
  if (!target) return;
  let node=target;
  while(node){if(node.tagName==='DETAILS')node.open=true;node=node.parentElement;}
 }
 revealDetails();
 window.addEventListener('hashchange', revealDetails);
 const progress = document.querySelector('.reading-progress');
 const navLinks = [...document.querySelectorAll('nav a[href^="#"]')];
 let queued = false;
 function updateReading() {
  queued = false;
  const maximum = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  progress.style.transform = `scaleX(${Math.min(1,Math.max(0,window.scrollY / maximum))})`;
  let current = '';
  navLinks.forEach(link => {
   const target = document.getElementById(link.getAttribute('href').slice(1));
   if (target && target.getBoundingClientRect().top <= 155) current = link.getAttribute('href');
  });
  navLinks.forEach(link => {
   if (link.getAttribute('href') === current) link.setAttribute('aria-current','location');
   else link.removeAttribute('aria-current');
  });
 }
 window.addEventListener('scroll', () => {
  if (!queued) { queued = true; window.requestAnimationFrame(updateReading); }
 }, {passive:true});
 window.addEventListener('resize', updateReading);
 updateReading();
 if ('IntersectionObserver' in window && !reduceMotion.matches) {
  const observer = new window.IntersectionObserver(entries => entries.forEach(entry => {
   if (entry.isIntersecting) { window.portfolioMotion.pulse(entry.target); observer.unobserve(entry.target); }
  }), {threshold:.15});
  document.querySelectorAll('.timeline').forEach(element => observer.observe(element));
 }
})();
