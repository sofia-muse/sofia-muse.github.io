'use strict';
(() => {
function createIdempotencyDemo() {
  let records = new Map();
  let policyCount = 0;
  return {
    issue(key, payload) {
      if (typeof key !== 'string' || !key.trim() || !payload || payload.type !== 'Health' || !Number.isInteger(payload.premium) || payload.premium < 1 || payload.premium > 1000000) {
        return { kind: 'invalid', status: 400, body: { status: 400, code: 'VALIDATION_ERROR', detail: 'Use a whole-number premium between 1 and 1,000,000.' } };
      }
      const canonical = JSON.stringify({ type: payload.type, premium: payload.premium });
      const existing = records.get(key);
      if (existing && existing.fingerprint !== canonical) {
        return { kind: 'conflict', status: 409, body: { status: 409, code: 'IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_PAYLOAD', detail: 'This key already belongs to a different request.' } };
      }
      if (existing) return { kind: 'replayed', status: 201, body: { ...existing.body } };
      policyCount += 1;
      const body = { id: `demo-policy-${String(policyCount).padStart(2, '0')}`, type: payload.type, premium: payload.premium };
      records.set(key, { fingerprint: canonical, body });
      return { kind: 'created', status: 201, body: { ...body } };
    },
    snapshot() { return { policyCount, keyCount: records.size }; },
    reset() { records = new Map(); policyCount = 0; return this.snapshot(); }
  };
}

const translate = window.portfolioI18n.t;

const model = createIdempotencyDemo();
const key = 'portfolio-demo-01';
const form = document.getElementById('demo-form');
const premiumInput = document.getElementById('demo-premium');
const requestOutput = document.getElementById('demo-request');
const responseOutput = document.getElementById('demo-response');
const statusOutput = document.getElementById('demo-status');
const explanation = document.getElementById('demo-explanation');
const countOutput = document.getElementById('demo-count');
const retryButton = document.getElementById('demo-retry');
const conflictButton = document.getElementById('demo-conflict');
let originalPayload = null;

function payloadFromInput() { return { type: 'Health', premium: Number(premiumInput.value) }; }
function showRequest(payload) { requestOutput.textContent = JSON.stringify(payload, null, 2); }
function send(payload) {
  showRequest(payload);
  const result = model.issue(key, payload);
  if (result.kind === 'created') originalPayload = { ...payload };
  const body = { ...result.body };
  if (body.detail) body.detail = translate(body.detail);
  responseOutput.textContent = JSON.stringify(body, null, 2);
  const messages = {
    created: ['201 · Created', 'One policy was created. Retry the same request to return this policy again.'],
    replayed: ['Original result replayed', 'The same policy was returned. The policy count stays at one.'],
    conflict: ['409 · Conflict', 'The premium changed while the key stayed the same. The request was rejected; no extra policy was created.'],
    invalid: ['400 · Invalid request', 'Enter a whole-number premium between 1 and 1,000,000.']
  };
  statusOutput.textContent = translate(messages[result.kind][0]);
  statusOutput.dataset.kind = result.kind;
  explanation.textContent = translate(messages[result.kind][1]);
  countOutput.textContent = String(model.snapshot().policyCount);
  retryButton.disabled = !originalPayload;
  conflictButton.disabled = !originalPayload;
  window.dispatchEvent(new CustomEvent("portfolio-api-result",{detail:{kind:result.kind}}));
  return result;
}

premiumInput.addEventListener('input', () => showRequest(payloadFromInput()));
form.addEventListener('submit', event => {
  event.preventDefault();
  if (form.reportValidity()) send(payloadFromInput());
});
retryButton.addEventListener('click', () => {
  if (!originalPayload) return;
  premiumInput.value = String(originalPayload.premium);
  send({ ...originalPayload });
});
conflictButton.addEventListener('click', () => {
  if (!originalPayload) return;
  const premium = originalPayload.premium === 1000000 ? 999999 : originalPayload.premium + 1;
  premiumInput.value = String(premium);
  send({ ...originalPayload, premium });
});
document.getElementById('demo-reset').addEventListener('click', () => {
  model.reset();
  originalPayload = null;
  premiumInput.value = '100';
  showRequest(payloadFromInput());
  responseOutput.textContent = translate('Send the first request to create a sample policy.');
  statusOutput.textContent = translate('Ready');
  delete statusOutput.dataset.kind;
  explanation.textContent = translate('An identical retry should return the original policy.');
  countOutput.textContent = '0';
  retryButton.disabled = true;
  conflictButton.disabled = true;
  window.dispatchEvent(new CustomEvent('portfolio-api-reset'));
});

// Reuse the same simulation so the challenge and manual demo stay consistent.
document.getElementById('challenge-run').addEventListener('click', () => {
  model.reset();
  originalPayload = null;
  premiumInput.value = '100';
  send(payloadFromInput());
  send({ ...originalPayload });
  const panel=document.getElementById('api-demo');
  panel.open=true;
  const paused=document.documentElement.classList.contains('motion-paused');
  panel.scrollIntoView({behavior:paused||window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
  responseOutput.focus({preventScroll:true});
});

})();