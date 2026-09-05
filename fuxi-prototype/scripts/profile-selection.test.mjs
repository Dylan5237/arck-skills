import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { selectProfile } = require('./profile-selection.cjs');
const repoRoot = path.resolve(import.meta.dirname, '..');
const tiangong = path.join(repoRoot, 'specs', 'tiangong');

async function project(files) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'fuxi-profile-selection-'));
  for (const [name, content] of Object.entries(files)) {
    const file = path.join(root, name);
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, content);
  }
  return root;
}

test('new Tiangong projects use the spec preferred profile', () => {
  assert.deepEqual(selectProfile({ specDir: tiangong }), {
    status: 'SELECTED', profile: 'vue3-element-plus', runtime: 'vite-vue3', source: 'spec-preferred'
  });
});

test('existing SkyUI projects preserve their detected profile', async () => {
  const root = await project({
    'README.md': 'runtime_profile: vue3-skyui\n',
    'package.json': JSON.stringify({ dependencies: { '@sky/sky-ui': '2.2.44' } })
  });
  const result = selectProfile({ specDir: tiangong, projectDir: root });
  assert.equal(result.status, 'SELECTED');
  assert.equal(result.profile, 'vue3-skyui');
});

test('conflicting project evidence stops selection', async () => {
  const root = await project({
    'package.json': JSON.stringify({ dependencies: { '@sky/sky-ui': '2.2.44', 'element-plus': '2.11.8' } })
  });
  const result = selectProfile({ specDir: tiangong, projectDir: root });
  assert.equal(result.status, 'BLOCKED');
  assert.equal(result.code, 'RUNTIME_PROFILE_REQUIRED');
});

test('unsupported explicit profile stops selection', () => {
  const result = selectProfile({ specDir: tiangong, requestedProfile: 'static-html' });
  assert.equal(result.status, 'BLOCKED');
  assert.equal(result.code, 'RUNTIME_PROFILE_UNSUPPORTED');
});
