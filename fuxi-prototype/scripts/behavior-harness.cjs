const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { spawnSync } = require('node:child_process');

const skillDir = path.resolve(__dirname, '..');
const specDir = path.join(skillDir, 'specs', 'tiangong');
const platformRoot = process.argv[2] ? path.resolve(process.argv[2]) : process.env.FUXI_PLATFORM_ROOT;
const { selectProfile } = require('./profile-selection.cjs');
const { createRun, advanceRun, failRun, readRun, writeAtomic } = require('./run-state.cjs');
const { evaluateWrite } = require('./write-gate.cjs');

async function withTempProject(fn) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'fuxi-behavior-project-'));
  try {
    return await fn(root);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

async function runCase(caseId, fn) {
  const startedAt = new Date().toISOString();
  try {
    const detail = await fn();
    return { caseId, status: 'PASS', startedAt, detail };
  } catch (error) {
    return { caseId, status: 'FAIL', startedAt, error: error.message };
  }
}

async function main() {
  const cli = await import(pathToFileURL(path.join(skillDir, 'scripts', 'sky-ui-docs', 'cli.mjs')).href);
  const results = [];

  results.push(await runCase('P-01', () => {
    const selected = selectProfile({ specDir });
    assert.equal(selected.profile, 'vue3-element-plus');
    assert.equal(selected.source, 'spec-preferred');
    return { profile: selected.profile, source: selected.source };
  }));

  results.push(await runCase('P-02', () => withTempProject((root) => {
    fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify({ dependencies: { '@sky/sky-ui': '2.2.44' } }));
    const selected = selectProfile({ specDir, projectDir: root });
    assert.equal(selected.profile, 'vue3-skyui');
    assert.equal(selected.source, 'project-evidence');
    return { profile: selected.profile, source: selected.source };
  })));

  results.push(await runCase('P-03', () => withTempProject((root) => {
    fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify({ dependencies: { '@sky/sky-ui': '2.2.44', 'element-plus': '2.4.4' } }));
    const selected = selectProfile({ specDir, projectDir: root });
    assert.equal(selected.code, 'RUNTIME_PROFILE_REQUIRED');
    return { code: selected.code };
  })));

  results.push(await runCase('P-04', async () => withTempProject(async (root) => {
    await assert.rejects(
      () => cli.list('zh', { projectDir: root, allowInstall: false }),
      error => error.message.includes('SKYUI_DOCS_UNAVAILABLE')
    );
    return { code: 'SKYUI_DOCS_UNAVAILABLE', installAttempted: false };
  })));

  results.push(await runCase('P-05', () => withTempProject((root) => {
    fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify({ dependencies: { 'element-plus': '2.4.4' } }));
    const selected = selectProfile({ specDir, projectDir: root });
    assert.equal(selected.profile, 'vue3-element-plus');
    assert.equal(fs.existsSync(path.join(root, 'node_modules', '@sky', 'sky-ui')), false);
    return { profile: selected.profile, skyuiInstall: false };
  })));

  results.push(await runCase('P-06', () => {
    if (!platformRoot) throw new Error('FUXI_PLATFORM_ROOT is required for P-06');
    const server = path.join(platformRoot, 'mcp-server', 'src', 'server.js');
    assert.equal(fs.existsSync(server), true, `missing MCP server: ${server}`);
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'fuxi-behavior-cache-'));
    try {
      const tempSkill = path.join(root, 'fuxi-prototype');
      const mutatedServer = path.join(root, 'server.js');
      fs.cpSync(skillDir, tempSkill, { recursive: true });
      const source = fs.readFileSync(server, 'utf8');
      fs.writeFileSync(mutatedServer, source.replace('const tools = [', 'const tools = [{ name: "behavior_mismatch", description: "test", inputSchema: {} },'));
      const check = spawnSync(process.execPath, [path.join(skillDir, 'scripts', 'build-capability-cache.cjs'), 'check', tempSkill, '--server', mutatedServer], { encoding: 'utf8' });
      assert.notEqual(check.status, 0);
      assert.match(`${check.stdout}\n${check.stderr}`, /MCP_SCHEMA_MISMATCH/);
      return { code: 'MCP_SCHEMA_MISMATCH' };
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  }));

  results.push(await runCase('P-07', () => {
    const blocked = evaluateWrite({ mode: 'update', prototypeId: 'p-1' });
    assert.equal(blocked.status, 'BLOCKED');
    assert.equal(blocked.code, 'WRITE_SCOPE_INVALID');
    return { code: blocked.code };
  }));

  results.push(await runCase('P-08', () => {
    const runFile = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'fuxi-behavior-run-')), 'run.json');
    const initial = createRun({ runId: 'behavior-run', mode: 'local-only', prototypeSpec: 'tiangong', runtime: 'vite-vue3', runtimeProfile: 'vue3-element-plus', riskLevel: 0 });
    const planned = advanceRun(initial, 'SELECT_PROFILE');
    const failed = failRun(planned, 'SELECT_PROFILE', 'RUNTIME_PROFILE_REQUIRED');
    writeAtomic(runFile, failed);
    const persisted = readRun(runFile);
    assert.equal(persisted.failure.code, 'RUNTIME_PROFILE_REQUIRED');
    assert.notEqual(persisted.state, 'COMPLETE');
    fs.rmSync(path.dirname(runFile), { recursive: true, force: true });
    return { state: persisted.state, failure: persisted.failure.code };
  }));

  const failed = results.filter(result => result.status !== 'PASS');
  console.log(JSON.stringify({ schema: 'fuxi-prototype-behavior-run/1', skill: 'fuxi-prototype', platformRoot: platformRoot || null, results, summary: { total: results.length, passed: results.length - failed.length, failed: failed.length } }, null, 2));
  process.exitCode = failed.length ? 1 : 0;
}

main().catch(error => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
