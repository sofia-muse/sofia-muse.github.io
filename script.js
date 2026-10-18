'use strict';
const translate = window.portfolioI18n.t;
const retryExample = document.getElementById('api-demo');
function revealLinkedExample() {
  if (window.location.hash === '#api-demo') retryExample.open = true;
}
revealLinkedExample();
window.addEventListener('hashchange', revealLinkedExample);
document.querySelectorAll('a[href="#api-demo"]').forEach(link => link.addEventListener('click', () => { retryExample.open = true; }));
document.getElementById('year').textContent = new Date().getFullYear();
const copyButton = document.querySelector('[data-copy-email]');
const copyStatus = document.getElementById('copy-status');
let resetTimer;
copyButton.addEventListener('click', async () => {
  clearTimeout(resetTimer);
  try {
    await navigator.clipboard.writeText('sofia.museichuk@gmail.com');
    copyButton.textContent = translate('Copied');
    copyStatus.textContent = translate('Email address copied.');
    resetTimer = setTimeout(() => {
      copyButton.textContent = translate('Copy email');
      copyStatus.textContent = '';
    }, 5000);
  } catch {
    copyStatus.textContent = translate('Copy isn’t available here. Select the email address, or click it to open your email app.');
  }
});
