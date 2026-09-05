const RISK = { LOCAL: 0, CONTROLLED: 1, HIGH: 2 };

function evaluateWrite({ mode, prototypeId = null, expectedVersion = null, projectId = null, projectPrototypeId = null, production = false, authorized = false, destructive = false }) {
  if (mode === 'local-only') return { status: 'ALLOWED', riskLevel: RISK.LOCAL, authorizationRequired: false, affectedScope: 'local-only' };

  if (!['create', 'update', 'project-bound-update'].includes(mode)) {
    return { status: 'BLOCKED', code: 'WRITE_MODE_UNSUPPORTED', riskLevel: RISK.HIGH };
  }

  const riskLevel = production || destructive ? RISK.HIGH : RISK.CONTROLLED;
  const errors = [];
  if (mode !== 'create' && !prototypeId) errors.push('prototypeId is required for update');
  if (mode !== 'create' && expectedVersion === null) errors.push('expectedVersion is required for update');
  if (mode === 'project-bound-update' && (!projectId || !projectPrototypeId)) errors.push('project binding is required');
  if (riskLevel === RISK.HIGH && !authorized) errors.push('explicit authorization is required for risk-2 writes');
  if (errors.length) return { status: 'BLOCKED', code: riskLevel === RISK.HIGH && !authorized ? 'AUTHORIZATION_REQUIRED' : 'WRITE_SCOPE_INVALID', riskLevel, authorizationRequired: riskLevel === RISK.HIGH, errors };

  return {
    status: 'ALLOWED',
    riskLevel,
    authorizationRequired: riskLevel === RISK.HIGH,
    affectedScope: mode === 'project-bound-update' ? 'target-project-binding-only' : 'target-prototype-only'
  };
}

function main() {
  const [, , input] = process.argv;
  if (!input) {
    console.error('USAGE: node write-gate.cjs <json-input>');
    process.exit(2);
  }
  const result = evaluateWrite(JSON.parse(input));
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.status === 'ALLOWED' ? 0 : 1);
}

module.exports = { RISK, evaluateWrite };

if (require.main === module) main();
