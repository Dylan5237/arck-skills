import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { runGoldenSamples, validateSampleConfig } = require('./run-golden-samples.cjs');
const skillDir = path.resolve(import.meta.dirname, '..');

test('runs all golden samples with structural PASS while retaining evidence boundaries', () => {
  const report = runGoldenSamples({ skillDir });
  assert.equal(report.status, 'UNVERIFIED');
  assert.equal(report.summary.total, 3);
  assert.equal(report.summary.structuralPass, 3);
  assert.equal(report.summary.build, 'UNVERIFIED');
  assert.equal(report.summary.visual, 'UNVERIFIED');
  assert.equal(report.summary.realAgentGeneration, 'UNVERIFIED');
  assert(report.samples.every(sample => sample.quality.failures.length === 0));
});

test('non-SkyUI golden samples do not read the SkyUI runtime reference', () => {
  const originalRead = fs.readFileSync;
  const reads = [];
  fs.readFileSync = function tracedRead(file, ...args) {
    reads.push(String(file));
    if (String(file).replaceAll('\\', '/').includes('/references/skyui-runtime.md')) {
      throw new Error('SkyUI runtime reference must not be read by golden quality runs');
    }
    return originalRead.call(this, file, ...args);
  };
  try {
    const report = runGoldenSamples({ skillDir });
    const unselected = report.samples.filter(sample => sample.profile !== 'vue3-skyui');
    assert(unselected.every(sample => sample.capabilityReads.length === 0));
    assert(!reads.some(file => file.replaceAll('\\', '/').includes('/references/skyui-runtime.md')));
  } finally {
    fs.readFileSync = originalRead;
  }
});

test('rejects a SkyUI capability plan for an unselected profile', () => {
  assert.throws(() => validateSampleConfig({
    id: 'element-with-skyui-plan',
    projectDir: 'fixture',
    spec: 'tiangong',
    profile: 'vue3-element-plus',
    mode: 'alignment',
    capabilityReads: ['skyui-runtime']
  }), /GOLDEN_SKYUI_CAPABILITY_SCOPE_INVALID/);
});
