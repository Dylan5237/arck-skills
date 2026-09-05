const fs = require('fs');
const path = require('path');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function collectFiles(root, result = []) {
  if (!fs.existsSync(root)) return result;
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (['node_modules', 'dist', 'build', '.git', 'coverage'].includes(entry.name)) continue;
    const target = path.join(root, entry.name);
    if (entry.isDirectory()) collectFiles(target, result);
    else if (/\.(vue|ts|tsx|js|jsx|html|css)$/.test(entry.name)) result.push(target);
  }
  return result;
}

function readProjectEvidence(projectDir) {
  const evidence = [];
  const readme = path.join(projectDir, 'README.md');
  if (fs.existsSync(readme)) {
    const text = fs.readFileSync(readme, 'utf8');
    const match = text.match(/^runtime_profile:\s*([^\s]+)\s*$/m);
    if (match) evidence.push({ profile: match[1], source: 'README.runtime_profile' });
  }

  const packageJson = path.join(projectDir, 'package.json');
  if (fs.existsSync(packageJson)) {
    const pkg = readJson(packageJson);
    const dependencies = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
    if (dependencies['@sky/sky-ui']) evidence.push({ profile: 'vue3-skyui', source: 'package.@sky/sky-ui' });
    if (dependencies['element-plus']) evidence.push({ profile: 'vue3-element-plus', source: 'package.element-plus' });
  }

  const source = collectFiles(path.join(projectDir, 'src'))
    .map(file => fs.readFileSync(file, 'utf8'))
    .join('\n');
  if (/@sky\/sky-ui|<sky[-:]/i.test(source)) evidence.push({ profile: 'vue3-skyui', source: 'source.skyui' });
  if (/element-plus|<el[-:]/i.test(source)) evidence.push({ profile: 'vue3-element-plus', source: 'source.element-plus' });
  return evidence;
}

function selectProfile({ specDir, projectDir = null, requestedProfile = null }) {
  const manifest = readJson(path.join(specDir, 'manifest.json'));
  const supported = new Set(manifest.supportedProfiles || []);
  if (requestedProfile) {
    if (supported.size && !supported.has(requestedProfile)) {
      return { status: 'BLOCKED', code: 'RUNTIME_PROFILE_UNSUPPORTED', supported: [...supported], requestedProfile };
    }
    return { status: 'SELECTED', profile: requestedProfile, runtime: manifest.preferredRuntime, source: 'requested' };
  }

  if (projectDir && fs.existsSync(projectDir)) {
    const evidence = readProjectEvidence(projectDir);
    const profiles = [...new Set(evidence.map(item => item.profile))];
    if (profiles.length > 1) {
      return { status: 'BLOCKED', code: 'RUNTIME_PROFILE_REQUIRED', reason: 'conflicting project evidence', evidence };
    }
    if (profiles.length === 1) {
      if (supported.size && !supported.has(profiles[0])) {
        return { status: 'BLOCKED', code: 'RUNTIME_PROFILE_UNSUPPORTED', supported: [...supported], detectedProfile: profiles[0], evidence };
      }
      return { status: 'SELECTED', profile: profiles[0], runtime: manifest.preferredRuntime, source: 'project-evidence', evidence };
    }

    const projectFiles = collectFiles(projectDir);
    if (projectFiles.length > 0 || fs.existsSync(path.join(projectDir, 'package.json'))) {
      return { status: 'BLOCKED', code: 'RUNTIME_PROFILE_REQUIRED', reason: 'no unique project evidence', evidence };
    }
  }

  if (manifest.preferredProfile) {
    return { status: 'SELECTED', profile: manifest.preferredProfile, runtime: manifest.preferredRuntime, source: 'spec-preferred' };
  }
  if (supported.size === 0) return { status: 'SELECTED', profile: null, runtime: manifest.preferredRuntime, source: 'spec-runtime' };
  return { status: 'BLOCKED', code: 'RUNTIME_PROFILE_REQUIRED', reason: 'spec has multiple profiles without a preferred profile' };
}

function main() {
  const [, , command, specDir, ...args] = process.argv;
  if (command !== 'select' || !specDir) {
    console.error('USAGE: node profile-selection.cjs select <specDir> [projectDir] [--profile <profile>]');
    process.exit(2);
  }
  const projectArgs = args.filter((value, index) => value !== '--profile' && args[index - 1] !== '--profile');
  const projectDir = projectArgs[0] || null;
  const rest = args;
  const profileIndex = rest.indexOf('--profile');
  const requestedProfile = profileIndex >= 0 ? rest[profileIndex + 1] : null;
  const result = selectProfile({ specDir: path.resolve(specDir), projectDir: projectDir ? path.resolve(projectDir) : null, requestedProfile });
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.status === 'SELECTED' ? 0 : 1);
}

module.exports = { collectFiles, readProjectEvidence, selectProfile };

if (require.main === module) main();
