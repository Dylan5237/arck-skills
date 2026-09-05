#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const { runQualityGate } = require('./quality-gate.cjs');

const SCHEMA = 'fuxi-prototype-golden-sample-report/1';

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

function loadManifest(goldenDir) {
  const manifestPath = path.join(goldenDir, 'manifest.json');
  if (!fs.existsSync(manifestPath)) throw new Error(`GOLDEN_MANIFEST_MISSING: ${manifestPath}`);
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  if (manifest.schema !== 'fuxi-prototype-golden-samples/1' || !Array.isArray(manifest.samples)) {
    throw new Error('GOLDEN_MANIFEST_INVALID');
  }
  return manifest;
}

function validateSampleConfig(sample) {
  if (!sample.id || !sample.projectDir || !sample.spec || !sample.mode) {
    throw new Error(`GOLDEN_SAMPLE_INVALID: ${sample.id || 'unknown'}`);
  }
  if (!['alignment', 'implementation-proof'].includes(sample.mode)) {
    throw new Error(`GOLDEN_SAMPLE_MODE_INVALID: ${sample.id}`);
  }
  const capabilityReads = sample.capabilityReads || [];
  if (!Array.isArray(capabilityReads)) throw new Error(`GOLDEN_CAPABILITY_PLAN_INVALID: ${sample.id}`);
  if (sample.profile !== 'vue3-skyui' && capabilityReads.some(value => value === 'skyui-runtime')) {
    throw new Error(`GOLDEN_SKYUI_CAPABILITY_SCOPE_INVALID: ${sample.id}`);
  }
}

function runGoldenSamples({ skillDir = path.resolve(__dirname, '..'), goldenDir = path.join(skillDir, 'examples', 'golden') } = {}) {
  const manifest = loadManifest(goldenDir);
  const samples = manifest.samples.map(sample => {
    validateSampleConfig(sample);
    const quality = runQualityGate({
      projectDir: path.join(goldenDir, sample.projectDir),
      profile: sample.profile || undefined,
      spec: sample.spec,
      mode: sample.mode
    });
    return {
      id: sample.id,
      spec: sample.spec,
      profile: sample.profile,
      mode: sample.mode,
      capabilityReads: sample.capabilityReads || [],
      quality,
      evidence: {
        structural: quality.status === 'FAIL' ? 'FAIL' : 'PASS',
        build: 'UNVERIFIED',
        visual: 'UNVERIFIED',
        realAgentGeneration: 'UNVERIFIED'
      }
    };
  });
  const hasFailure = samples.some(sample => sample.quality.status === 'FAIL');
  return {
    schema: SCHEMA,
    generatedAt: new Date().toISOString(),
    skillDir: path.resolve(skillDir),
    goldenDir: path.resolve(goldenDir),
    status: hasFailure ? 'FAIL' : 'UNVERIFIED',
    summary: {
      total: samples.length,
      structuralPass: samples.filter(sample => sample.evidence.structural === 'PASS').length,
      structuralFail: samples.filter(sample => sample.evidence.structural === 'FAIL').length,
      build: 'UNVERIFIED',
      visual: 'UNVERIFIED',
      realAgentGeneration: 'UNVERIFIED'
    },
    samples
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    process.stdout.write('USAGE: node run-golden-samples.cjs [--golden-dir <dir>] [--output <report.json>]\n');
    return;
  }
  try {
    const report = runGoldenSamples({ goldenDir: args.goldenDir ? path.resolve(args.goldenDir) : undefined });
    const text = `${JSON.stringify(report, null, 2)}\n`;
    if (args.output) {
      fs.mkdirSync(path.dirname(path.resolve(args.output)), { recursive: true });
      fs.writeFileSync(path.resolve(args.output), text, 'utf8');
    }
    process.stdout.write(text);
    process.exitCode = report.status === 'FAIL' ? 1 : 0;
  } catch (error) {
    process.stdout.write(`${JSON.stringify({ schema: SCHEMA, status: 'FAIL', failures: [{ code: error.message }] }, null, 2)}\n`);
    process.exitCode = 1;
  }
}

if (require.main === module) main();

module.exports = { loadManifest, runGoldenSamples, validateSampleConfig };
