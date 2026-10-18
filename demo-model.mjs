export function createIdempotencyDemo() {
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
