'use strict';
(() => {
 const dialog = document.getElementById('screenshot-dialog');
 if (!dialog || typeof dialog.showModal !== 'function') return;
 const t = text => window.portfolioI18n?.t(text) || text;
 const image = dialog.querySelector('.gallery-image');
 const caption = dialog.querySelector('#screenshot-caption');
 const viewport = dialog.querySelector('.gallery-viewport');
 const status = dialog.querySelector('.gallery-status');
 const close = dialog.querySelector('[data-gallery-close]');
 const zoom = dialog.querySelector('[data-gallery-zoom]');
 const previous = dialog.querySelector('[data-gallery-previous]');
 const next = dialog.querySelector('[data-gallery-next]');
 let opener = null;
 let items = [];
 let index = 0;
 let previousOverflow = '';
 let expanded = false;
 dialog.querySelectorAll('[data-gallery-label]').forEach(element => {
  element.textContent = t(element.dataset.galleryLabel);
 });
 viewport.setAttribute('aria-label', t('Screenshot viewing area'));
 function sourceFor(link) {
  try {
   const url = new URL(link.getAttribute('href'), document.baseURI);
   return ['http:', 'https:', 'file:'].includes(url.protocol) && /\.(avif|webp|png|jpe?g|gif|svg)$/i.test(url.pathname) ? url.href : null;
  } catch { return null; }
 }
 function setZoom(value) {
  expanded = value;
  dialog.classList.toggle('gallery-expanded', expanded);
  zoom.setAttribute('aria-pressed', String(expanded));
  zoom.textContent = t(expanded ? 'Fit image' : 'View at full size');
  viewport.scrollTop = 0;
  viewport.scrollLeft = 0;
 }
 function showImage() {
  const link = items[index];
  const description = link.dataset.caption || link.querySelector('img')?.alt || t('Project screenshot');
  caption.textContent = description;
  image.alt = description;
  status.textContent = t('Loading screenshot…');
  zoom.disabled = true;
  setZoom(false);
  image.hidden = true;
  previous.hidden = next.hidden = items.length < 2;
  previous.disabled = index === 0;
  next.disabled = index === items.length - 1;
  if (dialog.open && (document.activeElement===previous && previous.disabled || document.activeElement===next && next.disabled)) close.focus();
  image.onload = () => {
   image.hidden = false;
   zoom.disabled = false;
   status.textContent = '';
  };
  image.onerror = () => {
   status.textContent = t('The screenshot could not be loaded. Close this view and open the image link directly.');
  };
  image.src = sourceFor(link);
 }
 document.addEventListener('click', event => {
  if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  const link = event.target.closest('a[data-gallery]');
  if (!link || !sourceFor(link)) return;
  event.preventDefault();
  if (dialog.open) return;
  items = [...document.querySelectorAll('a[data-gallery]')].filter(item => sourceFor(item));
  opener = link;
  index = items.indexOf(link);
  previousOverflow = document.body.style.overflow;
  showImage();
  dialog.showModal();
  document.body.style.overflow = 'hidden';
  close.focus();
 });
 close.addEventListener('click', () => dialog.close());
 zoom.addEventListener('click', () => setZoom(!expanded));
 previous.addEventListener('click', () => { if (index > 0) { index--; showImage(); } });
 next.addEventListener('click', () => { if (index < items.length - 1) { index++; showImage(); } });
 dialog.addEventListener('keydown', event => {
  if (event.key !== 'Tab') return;
  const focusable = [...dialog.querySelectorAll('button:not(:disabled), [tabindex="0"]')].filter(element => !element.hidden && element.getClientRects().length);
  const first = focusable[0];
  const last = focusable.at(-1);
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
 });
 dialog.addEventListener('close', () => {
  document.body.style.overflow = previousOverflow;
  image.onload = image.onerror = null;
  image.removeAttribute('src');
  status.textContent = '';
  if (opener?.isConnected) opener.focus({preventScroll: true});
 });
})();
