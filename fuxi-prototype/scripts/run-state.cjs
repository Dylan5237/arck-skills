const fs = require('fs');
const path = require('path');

const STATES = [
  'DISCOVER',
  'SELECT_PROFILE',
  'PLAN',
  'QUERY_RUNTIME',
  'GENERATE',
  'BUILD',
  'VALIDATE',
  'PREFLIGHT',
  'DELIVER',
  'READBACK',
  'COMPLETE'
];

function ensureDir(file) {
  fs.mkdirSync(path.dirname(path.resolve(file)), { recursive: true });
}

function writeAtomic(file, value) {
  const target = path.resolve(file);
  ensureDir(target);
  const temp = `${target}.tmp-${process.pid}-${Date.now()}`;
  fs.writeFileSync(temp, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  fs.renameSync(temp, target);
}

function readRun(file) {
  return JSON.parse(fs.readFileSync(path.resolve(file), 'utf8'));
}

function createRun({ runId, mode, prototypeSpec, runtime, runtimeProfile, riskLevel, authorizationScope = 'not-applicable' }) {
  if (!runId || !mode || !prototypeSpec || !runtime || !runtimeProfile) {
    throw new Error('runId, mode, prototypeSpec, runtime, and runtimeProfile are required');
  }
  return {
    schema: 'fuxi-prototype-run/1',
    runId,
    state: 'DISCOVER',
    mode,
    outputMode: 'alignment',
    prototypeSpec,
    runtime,
    runtimeProfile,
    riskLevel,
    authorizationScope,
    artifacts: {},
    checks: {},
    history: [{ state: 'DISCOVER', at: new Date().toISOString() }],
    failureStage: null,
    remainingRisks: []
  };
}

function advanceRun(run, nextState, patch = {}) {
  const currentIndex = STATES.indexOf(run.state);
  const nextIndex = STATES.indexOf(nextState);
  if (currentIndex < 0 || nextIndex !== currentIndex + 1) {
    const error = new Error(`invalid state transition: ${run.state} -> ${nextState}`);
    error.code = 'INVALID_STATE_TRANSITION';
    throw error;
  }
  return {
    ...run,
    ...patch,
    state: nextState,
    history: [...run.history, { state: nextState, at: new Date().toISOString() }]
  };
}

function failRun(run, failureStage, code, detail = null) {
  return {
    ...run,
    failureStage,
    failure: { code, detail },
    history: [...run.history, { state: run.state, at: new Date().toISOString(), failureStage, code }]
  };
}

function main() {
  const [, , command, file, ...args] = process.argv;
  if (!command || !file) {
    console.error('USAGE: node run-state.cjs init|advance|fail <runFile> ...');
    process.exit(2);
  }
  let result;
  if (command === 'init') {
    const [runId, mode, prototypeSpec, runtime, runtimeProfile, riskLevel = '0'] = args;
    result = createRun({ runId, mode, prototypeSpec, runtime, runtimeProfile, riskLevel: Number(riskLevel) });
  } else {
    const run = readRun(file);
    if (command === 'advance') result = advanceRun(run, args[0]);
    else if (command === 'fail') result = failRun(run, args[0], args[1], args.slice(2).join(' ') || null);
    else {
      console.error('USAGE: node run-state.cjs init|advance|fail <runFile> ...');
      process.exit(2);
    }
  }
  writeAtomic(file, result);
  console.log(JSON.stringify(result, null, 2));
}

module.exports = { STATES, createRun, advanceRun, failRun, readRun, writeAtomic };

if (require.main === module) main();
