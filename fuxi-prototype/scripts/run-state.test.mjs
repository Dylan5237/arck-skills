import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { createRun, advanceRun, failRun, readRun, writeAtomic } = require('./run-state.cjs');

test('creates and persists a resumable run record', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'fuxi-run-state-'));
  const file = path.join(root, 'run.json');
  const run = createRun({
    runId: 'run-1', mode: 'create', prototypeSpec: 'tiangong', runtime: 'vite-vue3',
    runtimeProfile: 'vue3-element-plus', riskLevel: 1
  });
  writeAtomic(file, run);
  const selected = advanceRun(readRun(file), 'SELECT_PROFILE', { outputMode: 'implementation-proof' });
  writeAtomic(file, selected);
  const restored = readRun(file);
  assert.equal(restored.state, 'SELECT_PROFILE');
  assert.equal(restored.outputMode, 'implementation-proof');
  assert.equal(restored.history.length, 2);
});

test('rejects skipped state transitions', () => {
  const run = createRun({
    runId: 'run-2', mode: 'local-only', prototypeSpec: 'static-html', runtime: 'static-html',
    runtimeProfile: 'static-html', riskLevel: 0
  });
  assert.throws(() => advanceRun(run, 'GENERATE'), { code: 'INVALID_STATE_TRANSITION' });
});

test('records a failure without pretending the run completed', () => {
  const run = createRun({
    runId: 'run-3', mode: 'update', prototypeSpec: 'tiangong', runtime: 'vite-vue3',
    runtimeProfile: 'vue3-element-plus', riskLevel: 1
  });
  const failed = failRun(run, 'BUILD', 'BUILD_FAILED', 'type check failed');
  assert.equal(failed.state, 'DISCOVER');
  assert.equal(failed.failureStage, 'BUILD');
  assert.equal(failed.failure.code, 'BUILD_FAILED');
  assert.equal(failed.history.at(-1).failureStage, 'BUILD');
});
