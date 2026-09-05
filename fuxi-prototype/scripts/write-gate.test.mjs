import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { evaluateWrite } = require('./write-gate.cjs');

test('local-only has no external write risk', () => {
  assert.deepEqual(evaluateWrite({ mode: 'local-only' }), {
    status: 'ALLOWED', riskLevel: 0, authorizationRequired: false, affectedScope: 'local-only'
  });
});

test('ordinary create is a controlled write', () => {
  const result = evaluateWrite({ mode: 'create' });
  assert.equal(result.status, 'ALLOWED');
  assert.equal(result.riskLevel, 1);
  assert.equal(result.authorizationRequired, false);
});

test('update requires exact target and expected version', () => {
  const result = evaluateWrite({ mode: 'update', prototypeId: 'p1' });
  assert.equal(result.status, 'BLOCKED');
  assert.equal(result.code, 'WRITE_SCOPE_INVALID');
});

test('production write requires explicit authorization', () => {
  const blocked = evaluateWrite({ mode: 'create', production: true });
  assert.equal(blocked.code, 'AUTHORIZATION_REQUIRED');
  const allowed = evaluateWrite({ mode: 'create', production: true, authorized: true });
  assert.equal(allowed.status, 'ALLOWED');
  assert.equal(allowed.riskLevel, 2);
});
