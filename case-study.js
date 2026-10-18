'use strict';
const changes = {
  data: ['Stored procedures from 2013', 'Legacy database procedures were part of the dashboard’s existing foundation.', 'Rewritten for responsiveness', 'Rewrote the old stored procedures to improve how responsively the dashboard worked.'],
  logic: ['Server logic & API calls', 'The existing server-side implementation and placement of API calls needed improvement.', 'Clearer responsibilities', 'Improved server-side logic and moved calls and API interactions into appropriate layers, following best practices.'],
  automation: ['Manual changes', 'Some changes required manual intervention in the existing workflow.', 'Automatic functionality', 'Added automatic functionality to replace manual changes and reduce the hands-on work needed.'],
  delivery: ['Existing jobs & migrations', 'Background jobs and migration flows were part of the system being modernized.', 'Optimized execution', 'Optimized jobs and migrations as part of the wider dashboard improvements.'],
  interface: ['An interface to improve', 'The client’s workflow needed a clearer, easier-to-use interface.', 'A cleaner client experience', 'Created a clean UI with functionality that was easier to understand and more comfortable to use.']
};
const changeButtons = [...document.querySelectorAll('[data-change]')];
const changeReasons = {
 data: 'Responsiveness starts below the UI. Database work is part of the user experience.',
 logic: 'Clear responsibility boundaries make server logic easier to follow and maintain.',
 automation: 'Automating a repeated change reduces the need for repeated manual intervention.',
 delivery: 'Background work and migrations belong in the modernization effort alongside interactive features.',
 interface: 'An interface should help clients understand and complete their everyday work.'
};
const changeFields = ['change-before-title', 'change-before-copy', 'change-after-title', 'change-after-copy'].map(id => document.getElementById(id));
changeButtons.forEach(button => button.addEventListener('click', () => {
  const content = changes[button.dataset.change];
  if (!content) return;
  changeButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  changeFields.forEach((field, index) => { field.textContent = window.portfolioI18n.t(content[index]); });
  document.getElementById('change-reason').textContent = window.portfolioI18n.t(changeReasons[button.dataset.change]);
  window.portfolioMotion?.pulse(document.getElementById('change-content'));
}));
const caseLayers = [...document.querySelectorAll('[data-case-layer]')];
function highlightCaseLayers(change) {
 const affected={data:['data'],logic:['interface','logic','data'],automation:['logic','data'],delivery:['logic','data'],interface:['interface','logic']}[change]||[];
 caseLayers.forEach(layer=>{layer.classList.remove('case-signal');layer.dataset.active=String(affected.includes(layer.dataset.caseLayer));});
 const moving=!matchMedia('(prefers-reduced-motion: reduce)').matches&&!document.documentElement.classList.contains('motion-paused');
 if(moving){void document.querySelector('.case-layer-path').offsetWidth;caseLayers.forEach(layer=>{if(layer.dataset.active==='true')layer.classList.add('case-signal');});}
}
changeButtons.forEach(button=>button.addEventListener('click',()=>highlightCaseLayers(button.dataset.change)));
highlightCaseLayers('data');
