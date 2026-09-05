// Build or check the Fuxi SkyUI capability cache.
//
// The cache distills the skill's static capability + design contract into a
// single contract.md, plus the actual MCP tool schemas (tools.json), and a
// manifest.json carrying content hashes of every source. A fresh session can
// read the cache instead of re-reading the five reference files, then fall
// back to the references when the manifest is stale.
//
// Usage:
//   node scripts/build-capability-cache.cjs build <skillDir> [--server <serverPath>]
//   node scripts/build-capability-cache.cjs check <skillDir>
//
// --server <serverPath> points at the Fuxi MCP server.js whose `tools` array
//   is extracted into cache/tools.json. It is optional for `check` (the stored
//   tools.json mcp hash is compared instead).
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SCHEMA = 'fuxi-prototype-capability-cache/2';
const SOURCE_REFS = [
  'SKILL.md',
  'references/workflow-contract.md',
  'references/prototype-spec.md',
  'references/tiangong-visual-language.md',
  'references/skyui-runtime.md',
  'references/fuxi-adapter.md',
  'specs/tiangong/SKILL.md',
  'specs/tiangong/manifest.json',
  'specs/static-html/SKILL.md',
  'specs/static-html/manifest.json',
  'cache/template-contract.md',
  'scripts/build-capability-cache.cjs',
  'scripts/profile-selection.cjs',
  'scripts/run-state.cjs',
  'scripts/write-gate.cjs',
  'scripts/behavior-harness.cjs',
  'scripts/quality-gate.cjs',
  'scripts/run-golden-samples.cjs'
];

function sha256Text(s) {
  return crypto.createHash('sha256').update(s).digest('hex');
}

function sha256File(p) {
  return sha256Text(fs.readFileSync(p, 'utf8'));
}

function toolsArrayFromServer(serverPath) {
  const src = fs.readFileSync(serverPath, 'utf8');
  const start = src.indexOf('const tools = [');
  if (start < 0) throw new Error('server.js: const tools = [ not found');
  const bodyStart = src.indexOf('[', start);
  const end = src.indexOf('\n];', bodyStart);
  if (end < 0) throw new Error('server.js: tools array end not found');
  const literal = src.slice(bodyStart, end + 2);
  // The literal is a plain JS object array with no runtime side effects.
  return Function(`return (${literal});`)();
}

function toolsJsonContent(tools) {
  const slim = (tools || []).map(t => ({
    name: t.name,
    description: t.description,
    inputSchema: t.inputSchema || {}
  }));
  return JSON.stringify({ schema: 'fuxi-mcp-tools/1', tools: slim }, null, 2);
}

function gatherFiles(skillDir, useServerPath) {
  const files = {};
  for (const rel of SOURCE_REFS) {
    const p = path.join(skillDir, rel);
    if (!fs.existsSync(p)) throw new Error(`missing source: ${rel}`);
    files[rel] = sha256File(p);
  }
  return files;
}

function build(skillDir, serverPath) {
  const cacheDir = path.join(skillDir, 'cache');
  fs.mkdirSync(cacheDir, { recursive: true });

  // contract.md is a copy of the curated template.
  const tpl = path.join(cacheDir, 'template-contract.md');
  if (!fs.existsSync(tpl)) throw new Error('missing cache/template-contract.md');
  fs.copyFileSync(tpl, path.join(cacheDir, 'contract.md'));

  // tools.json is regenerated from the real MCP server when a path is given.
  let mcpToolsHash = null;
  if (serverPath && fs.existsSync(serverPath)) {
    const tools = toolsArrayFromServer(serverPath);
    const content = toolsJsonContent(tools);
    fs.writeFileSync(path.join(cacheDir, 'tools.json'), content);
    mcpToolsHash = sha256Text(content);
  } else if (fs.existsSync(path.join(cacheDir, 'tools.json'))) {
    mcpToolsHash = sha256File(path.join(cacheDir, 'tools.json'));
  }

  const files = gatherFiles(skillDir, serverPath);
  const manifest = {
    schema: SCHEMA,
    skill: 'fuxi-prototype',
    updatedAt: new Date().toISOString(),
    mcpTools: mcpToolsHash ? { hash: mcpToolsHash } : null,
    files
  };
  fs.writeFileSync(path.join(cacheDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  const entry = `${files['cache/template-contract.md'].slice(0, 8)}${serverPath ? '' : ''}`;
  console.log('CACHE_BUILT', JSON.stringify({
    contractBytes: fs.statSync(path.join(cacheDir, 'contract.md')).size,
    toolsJson: mcpToolsHash ? 'present' : 'none',
    sources: Object.keys(files).length,
    mcpToolsHash: mcpToolsHash ? mcpToolsHash.slice(0, 16) : null
  }));
}

function check(skillDir, serverPath = null) {
  const manifestPath = path.join(skillDir, 'cache', 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    console.log('CACHE_MISSING');
    return false;
  }
  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch (e) {
    console.log('CACHE_INVALID', e.message);
    return false;
  }
  if (manifest.schema !== SCHEMA) {
    console.log('CACHE_STALE_SCHEMA');
    return false;
  }
  const currentFiles = gatherFiles(skillDir, manifest.mcpTools ? true : false);
  const stale = Object.keys(manifest.files).some(rel => {
    const want = manifest.files[rel];
    const has = currentFiles[rel];
    if (has !== want) {
      console.log('CACHE_STALE_FILE', rel);
      return true;
    }
    return false;
  });
  if (stale) return false;
  if (manifest.mcpTools && manifest.mcpTools.hash) {
    const toolsPath = path.join(skillDir, 'cache', 'tools.json');
    if (!fs.existsSync(toolsPath) || sha256File(toolsPath) !== manifest.mcpTools.hash) {
      console.log('CACHE_STALE_TOOLS');
      return false;
    }
    if (serverPath) {
      const actualTools = toolsJsonContent(toolsArrayFromServer(serverPath));
      if (sha256Text(actualTools) !== manifest.mcpTools.hash) {
        console.log('MCP_SCHEMA_MISMATCH');
        return false;
      }
    }
  }
  console.log('CACHE_VALID');
  return true;
}

function main() {
  const [cmd, skillDir, , serverPath] = process.argv.slice(2);
  // Accept --server <path> after skillDir.
  let resolvedServer = null;
  const argv = process.argv.slice(2);
  const si = argv.indexOf('--server');
  if (si >= 0 && argv[si + 1]) resolvedServer = path.resolve(argv[si + 1]);
  if (!cmd || !skillDir) {
    console.error('USAGE: node build-capability-cache.cjs build|check <skillDir> [--server <serverPath>]');
    process.exit(2);
  }
  const abs = path.resolve(skillDir);
  let ok = false;
  if (cmd === 'build') {
    build(abs, resolvedServer);
    ok = check(abs, resolvedServer);
  } else if (cmd === 'check') {
    ok = check(abs, resolvedServer);
  } else {
    console.error('unknown command', cmd);
    process.exit(2);
  }
  process.exit(ok ? 0 : 1);
}

main();
