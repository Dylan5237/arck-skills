#!/usr/bin/env node

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const ENTRY_CANDIDATES = ['dist/index.html', 'build/index.html', 'index.html', 'public/index.html'];
const REQUIRED_README_FIELDS = ['prototype_spec', 'runtime', 'runtime_profile', 'fuxi_adapter', 'entry_file'];

function parseArgs(argv) {
  const values = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith('--')) continue;
    const key = arg.slice(2);
    values[key] = argv[index + 1] && !argv[index + 1].startsWith('--') ? argv[++index] : true;
  }
  return values;
}

function readMetadata(readme) {
  const text = fs.readFileSync(readme, 'utf8');
  const metadata = {};
  for (const field of REQUIRED_README_FIELDS) {
    const match = text.match(new RegExp(`^${field}\\s*:\\s*(.+)$`, 'mi'));
    if (match) metadata[field] = match[1].trim().replace(/^['"]|['"]$/g, '');
  }
  return { text, metadata };
}

function resolveInside(root, candidate) {
  const base = `${path.resolve(root)}${path.sep}`;
  const resolved = path.resolve(candidate);
  if (resolved !== path.resolve(root) && !resolved.startsWith(base)) return null;
  return resolved;
}

function findEntry(root) {
  for (const relative of ENTRY_CANDIDATES) {
    const absolute = path.join(root, ...relative.split('/'));
    if (fs.existsSync(absolute) && fs.statSync(absolute).isFile()) return { relative, absolute };
  }
  return null;
}

function collectSourceFiles(root) {
  const files = [];
  const stack = [root];
  while (stack.length) {
    const current = stack.pop();
    for (const item of fs.readdirSync(current, { withFileTypes: true })) {
      if (['node_modules', '.git', 'dist', 'build'].includes(item.name)) continue;
      const absolute = path.join(current, item.name);
      if (item.isDirectory()) stack.push(absolute);
      else if (/\.(vue|jsx?|tsx?|html|css)$/.test(item.name)) files.push(absolute);
    }
  }
  return files;
}

function inspectReferences(entry, root, html) {
  const failures = [];
  const references = [];
  const matcher = /(?:src|href)\s*=\s*["']([^"']+)["']/gi;
  let match;
  while ((match = matcher.exec(html))) {
    const reference = match[1].trim();
    if (!reference || reference.startsWith('#') || /^(?:https?:|data:|mailto:|tel:|javascript:)/i.test(reference)) continue;
    references.push(reference);
    if (reference.startsWith('/') || reference.startsWith('file:') || /(?:localhost|127\.0\.0\.1|\/src\/)/i.test(reference)) {
      failures.push({ code: 'NON_DEPLOYABLE_REFERENCE', reference });
      continue;
    }
    const target = resolveInside(root, path.resolve(path.dirname(entry.absolute), reference));
    if (!target || !fs.existsSync(target)) failures.push({ code: 'RESOURCE_MISSING', reference });
  }
  return { references, failures };
}

function runQualityGate({ projectDir, profile, spec, mode = 'alignment', outputMode = mode }) {
  const root = path.resolve(projectDir);
  const failures = [];
  const warnings = [];
  const unverified = [];
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
    return { schema: 'fuxi-prototype-quality-gate/1', status: 'FAIL', failures: [{ code: 'PROJECT_NOT_FOUND' }], warnings, unverified };
  }

  const readmePath = ['README.md', 'readme.md'].map(name => path.join(root, name)).find(file => fs.existsSync(file));
  if (!readmePath) failures.push({ code: 'README_MISSING' });
  const readme = readmePath ? readMetadata(readmePath) : { text: '', metadata: {} };
  for (const field of REQUIRED_README_FIELDS) {
    if (!readme.metadata[field]) failures.push({ code: 'README_FIELD_MISSING', field });
  }
  if (spec && readme.metadata.prototype_spec && readme.metadata.prototype_spec !== spec) {
    failures.push({ code: 'PROFILE_SPEC_MISMATCH', field: 'prototype_spec', expected: spec, actual: readme.metadata.prototype_spec });
  }
  if (profile && readme.metadata.runtime_profile && readme.metadata.runtime_profile !== profile) {
    failures.push({ code: 'PROFILE_MISMATCH', field: 'runtime_profile', expected: profile, actual: readme.metadata.runtime_profile });
  }
  if (readme.metadata.fuxi_adapter && readme.metadata.fuxi_adapter !== 'fuxi-prototype') {
    failures.push({ code: 'ADAPTER_MISMATCH', actual: readme.metadata.fuxi_adapter });
  }

  const entry = findEntry(root);
  if (!entry) failures.push({ code: 'ENTRY_FILE_MISSING' });
  let references = [];
  if (entry) {
    const html = fs.readFileSync(entry.absolute, 'utf8');
    const inspected = inspectReferences(entry, root, html);
    references = inspected.references;
    failures.push(...inspected.failures);
  }

  const sourceFiles = collectSourceFiles(root);
  const sourceText = sourceFiles.map(file => fs.readFileSync(file, 'utf8')).join('\n');
  if (/overflow-x\s*:\s*(?:auto|scroll)/i.test(sourceText)) warnings.push({ code: 'HORIZONTAL_OVERFLOW_REVIEW' });
  if (outputMode === 'implementation-proof' || mode === 'implementation-proof') {
    if (profile === 'vue3-element-plus' && /<(?:button|input|select|textarea)\b/i.test(sourceText) && !/<el-[\w-]+\b/i.test(sourceText)) {
      unverified.push({ code: 'COMPONENT_PROFILE_UNVERIFIED', profile, reason: 'interactive source controls found without a documented Element Plus component usage' });
    }
    if (profile === 'vue3-skyui' && /<(?:button|input|select|textarea)\b/i.test(sourceText) && !/<sky-[\w-]+\b/i.test(sourceText)) {
      unverified.push({ code: 'COMPONENT_PROFILE_UNVERIFIED', profile, reason: 'interactive source controls found without a documented SkyUI component usage' });
    }
  }
  unverified.push({ code: 'BUILD_NOT_PROVEN', reason: 'quality-gate inspects artifacts but does not run the target project build' });
  unverified.push({ code: 'VISUAL_ACCEPTANCE_NOT_PROVEN', reason: 'screenshot and browser evidence are supplied by the caller' });

  const status = failures.length ? 'FAIL' : unverified.length ? 'UNVERIFIED' : 'PASS';
  return {
    schema: 'fuxi-prototype-quality-gate/1',
    runId: `quality-${Date.now()}-${process.pid}`,
    generatedAt: new Date().toISOString(),
    projectDir: root,
    mode: outputMode,
    profile: profile || readme.metadata.runtime_profile || null,
    spec: spec || readme.metadata.prototype_spec || null,
    status,
    entryFile: entry ? entry.relative : null,
    references,
    failures,
    warnings,
    unverified
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.projectDir || args.help) {
    process.stdout.write('USAGE: node quality-gate.cjs --project-dir <dir> [--profile <profile>] [--spec <spec>] [--mode alignment|implementation-proof] [--output <file>]\n');
    process.exitCode = args.help ? 0 : 2;
    return;
  }
  const report = runQualityGate({ projectDir: args.projectDir, profile: args.profile, spec: args.spec, mode: args.mode, outputMode: args.mode });
  if (args.output) {
    fs.mkdirSync(path.dirname(path.resolve(args.output)), { recursive: true });
    fs.writeFileSync(path.resolve(args.output), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  }
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  process.exitCode = report.status === 'FAIL' ? 1 : 0;
}

if (require.main === module) main();

module.exports = { runQualityGate, parseArgs };
