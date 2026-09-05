import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';

// --- Config ---

const SKY_UI_REGISTRY = 'http://192.168.5.47:4873';
const MIN_SKY_UI_VERSION = '2.1.145';

function parseVersion(version) {
  const match = String(version || '').match(/^(\d+)\.(\d+)\.(\d+)/);
  return match ? match.slice(1).map(Number) : null;
}

function isVersionAtLeast(version, minimum) {
  const actual = parseVersion(version);
  const required = parseVersion(minimum);
  if (!actual || !required) return false;

  for (let index = 0; index < required.length; index += 1) {
    if (actual[index] !== required[index]) return actual[index] > required[index];
  }
  return true;
}

async function assertSupportedVersion(packageDir) {
  const packageJsonPath = join(packageDir, 'package.json');
  let packageJson;

  try {
    packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));
  } catch (error) {
    throw new Error(`Cannot read SkyUI package metadata at ${packageJsonPath}: ${error.message}`);
  }

  if (!isVersionAtLeast(packageJson.version, MIN_SKY_UI_VERSION)) {
    throw new Error(
      `Installed @sky/sky-ui version ${packageJson.version || 'unknown'} is below required ${MIN_SKY_UI_VERSION}. Upgrade SkyUI explicitly before generating code.`
    );
  }
}

function detectPackageManager(projectDir) {
  if (existsSync(join(projectDir, 'pnpm-lock.yaml'))) return 'pnpm';
  if (existsSync(join(projectDir, 'yarn.lock'))) return 'yarn';
  if (existsSync(join(projectDir, 'package-lock.json'))) return 'npm';
  return 'pnpm';
}

function getInstallCommand(projectDir) {
  const packageManager = detectPackageManager(projectDir);

  if (packageManager === 'pnpm') {
    return {
      command: 'pnpm',
      args: ['add',  '@sky/sky-ui@latest', '--registry', SKY_UI_REGISTRY],
    };
  }

  if (packageManager === 'yarn') {
    return {
      command: 'yarn',
      args: ['add', '@sky/sky-ui@latest', '--registry', SKY_UI_REGISTRY],
    };
  }

  return {
    command: 'npm',
    args: ['install',  '@sky/sky-ui@latest', '--registry', SKY_UI_REGISTRY],
  };
}

function formatCommand({ command, args }) {
  return [command, ...args].join(' ');
}

function runInstallCommand(projectDir, installCommand) {
  const { command, args } = installCommand;

  return new Promise((resolveInstall, rejectInstall) => {
    const child = spawn(command, args, {
      cwd: projectDir,
      shell: process.platform === 'win32',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const stdout = [];
    const stderr = [];

    child.stdout.on('data', (chunk) => stdout.push(chunk));
    child.stderr.on('data', (chunk) => stderr.push(chunk));
    child.on('error', rejectInstall);
    child.on('close', (code) => {
      if (code === 0) {
        resolveInstall();
        return;
      }

      const output = Buffer.concat([...stdout, ...stderr]).toString('utf8').trim();
      rejectInstall(new Error(`${formatCommand(installCommand)} failed with exit code ${code}${output ? `\n${output}` : ''}`));
    });
  });
}

async function resolveDocs(options = {}) {
  const projectDir = options.projectDir;
  if (!projectDir) {
    throw new Error('--project-dir is required. Usage: sky-ui-docs --project-dir <dir> list');
  }

  const packageDir = resolve(projectDir, 'node_modules/@sky/sky-ui');
  const docsDir = join(packageDir, 'dist', 'skill-docs');

  if (!existsSync(packageDir)) {
    if (!options.allowInstall) {
      throw new Error(
        [
          'SKYUI_DOCS_UNAVAILABLE',
          'The selected vue3-skyui profile is not installed in the target project.',
          `Expected: ${packageDir}`,
          'Install the pinned SkyUI dependency through an explicitly authorized setup step, then retry.'
        ].join('\n')
      );
    }
    const installCommand = getInstallCommand(projectDir);
    const installSkyUi = options.installSkyUi || runInstallCommand;

    try {
      await installSkyUi(projectDir, installCommand);
    } catch (error) {
      throw new Error(
        [
          'Failed to install @sky/sky-ui for this project.',
          `Project: ${projectDir}`,
          `Registry: ${SKY_UI_REGISTRY}`,
          `Command: ${formatCommand(installCommand)}`,
          `Cause: ${error.message}`,
        ].join('\n')
      );
    }
  }

  if (!existsSync(join(docsDir, 'index.json'))) {
    throw new Error(
      [
        'SkyUI docs not found in project installation.',
        `Expected: ${docsDir}`,
        'Please rebuild or upgrade @sky/sky-ui so dist/skill-docs is included.',
      ].join('\n')
    );
  }

  await assertSupportedVersion(packageDir);
  return docsDir;
}

async function runCommand(parsed) {
  const options = { projectDir: parsed.projectDir };
  let output;

  switch (parsed.command) {
    case 'help':
      output = helpText.trimStart();
      break;
    case 'list':
      output = await list(parsed.lang, options);
      break;
    case 'examples':
      output = await examples(parsed.component, parsed.lang, options);
      break;
    case 'example':
      output = await example(parsed.component, parsed.section, parsed.lang, options);
      break;
    case 'api':
      output = await api(parsed.component, parsed.lang, options);
      break;
    case 'api-section':
      output = await apiSection(parsed.component, parsed.section, parsed.lang, options);
      break;
    case 'icon-search':
      output = await iconSearch(parsed.keyword, options);
      break;
    case 'icon-resolve':
      output = await iconResolve(parsed.typeValue, options);
      break;
    case 'icon-list-common':
      output = await iconListCommon(options);
      break;
    case 'icon-list-business':
      output = await iconListBusiness(options);
      break;
    case 'unknown':
      throw new Error(`Unknown command: ${parsed.subcommand}. Use --help for usage.`);
    default:
      throw new Error('Unknown command. Use --help for usage.');
  }

  return output;
}

function getLanguage(cliLang) {
  if (cliLang) return cliLang;
  if (process.env.SKY_UI_DOCS_LANG) return process.env.SKY_UI_DOCS_LANG;
  return 'zh-CN';
}

// --- Store ---

function normalize(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/[\u4e00-\u9fff]/g, '')
    .replace(/[^a-z0-9]+/g, '');
}

function findComponentEntry(index, component) {
  const wanted = normalize(component);
  return index.components.find((entry) => {
    const candidates = [entry.name, entry.slug, entry.title, ...(entry.aliases || [])];
    return candidates.some((candidate) => normalize(candidate) === wanted);
  });
}

async function readIndex(docsDir) {
  try {
    return JSON.parse(await readFile(join(docsDir, 'index.json'), 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error('SkyUI docs not found. Use --project-dir to specify the project.');
    }
    throw error;
  }
}

async function readComponent(component, lang, docsDir) {
  const index = await readIndex(docsDir);
  const entry = findComponentEntry(index, component);
  if (!entry) {
    throw new Error(`Component not found: ${component}. Run sky-ui-docs --project-dir <dir> list.`);
  }
  const filePath = join(docsDir, 'components', `${entry.slug}.${lang}.json`);
  try {
    return JSON.parse(await readFile(filePath, 'utf8'));
  } catch {
    throw new Error(`Documentation for language "${lang}" not found for component "${component}".`);
  }
}

// --- Format ---

function escapeMarkdownCell(value) {
  return String(value ?? '')
    .replace(/\r?\n/g, ' ')
    .replace(/\|/g, '\\|')
    .trim();
}

function sectionMatches(actual, requested) {
  const a = String(actual || '').toLowerCase();
  const r = String(requested || '').toLowerCase();
  if (a === r) return true;
  return a.endsWith(` ${r}`);
}

// --- Icon Resolution ---

async function resolveIconDir(options = {}) {
  const projectDir = options.projectDir;
  if (!projectDir) {
    throw new Error('--project-dir is required. Usage: sky-ui-docs --project-dir <dir> icon search <keyword>');
  }

  const packageDir = resolve(projectDir, 'node_modules/@sky/sky-ui');
  const iconDir = join(packageDir, 'icon');

  if (!existsSync(iconDir)) {
    throw new Error(
      [
        'SkyUI icon directory not found.',
        `Expected: ${iconDir}`,
        'Please install or upgrade @sky/sky-ui first.',
      ].join('\n')
    );
  }

  return iconDir;
}

async function readCommonIcons(iconDir) {
  const filePath = join(iconDir, 'iconfont', 'iconfont.json');
  try {
    const data = JSON.parse(await readFile(filePath, 'utf8'));
    return (data.glyphs || []).map((g) => ({
      name: g.name || '',
      type: g.font_class || '',
      source: 'common',
      component: 'sky-icon',
    }));
  } catch {
    throw new Error(`Failed to read common icons from ${filePath}`);
  }
}

async function readBusinessIcons(iconDir) {
  const filePath = join(iconDir, 'iconIs.json');
  try {
    const categories = JSON.parse(await readFile(filePath, 'utf8'));
    const icons = [];
    for (const cat of categories) {
      const categoryTitle = cat.title || '';
      const categoryType = cat.type || '';
      for (const item of cat.list || []) {
        icons.push({
          name: item.title || '',
          type: item.componentName || '',
          rawName: item.name || '',
          source: 'business',
          component: 'sky-icon-i',
          category: categoryTitle,
          categoryType,
        });
      }
    }
    return icons;
  } catch {
    throw new Error(`Failed to read business icons from ${filePath}`);
  }
}

function iconKeywordMatch(icon, keyword) {
  const kw = keyword.toLowerCase();
  return (
    icon.type.toLowerCase().includes(kw) ||
    icon.name.toLowerCase().includes(kw) ||
    (icon.rawName && icon.rawName.toLowerCase().includes(kw)) ||
    (icon.category && icon.category.toLowerCase().includes(kw))
  );
}

function formatIconResult(icon, fallback) {
  const lines = [];
  if (fallback) {
    lines.push(`⚠ Icon not found. Using the first common icon as fallback.`);
    lines.push('');
  }
  lines.push(`Component: <${icon.component} type="${icon.type}" />`);
  lines.push(`Name: ${icon.name}`);
  if (icon.category) {
    lines.push(`Category: ${icon.category}`);
  }
  lines.push(`Source: ${icon.source === 'common' ? 'Common Icon (通用图标)' : 'Business Icon (业务图标)'}`);
  return lines.join('\n');
}

export async function iconSearch(keyword, options = {}) {
  const iconDir = await resolveIconDir(options);
  const [commonIcons, businessIcons] = await Promise.all([readCommonIcons(iconDir), readBusinessIcons(iconDir)]);

  const commonMatches = commonIcons.filter((icon) => iconKeywordMatch(icon, keyword));
  const businessMatches = businessIcons.filter((icon) => iconKeywordMatch(icon, keyword));

  const lines = [`# Icon Search: "${keyword}"`, ''];

  if (commonMatches.length > 0) {
    lines.push('## Common Icons (通用图标) — <sky-icon type="..." />');
    lines.push('');
    lines.push('| Type | Name |');
    lines.push('|------|------|');
    for (const icon of commonMatches) {
      lines.push(`| ${icon.type} | ${icon.name} |`);
    }
    lines.push('');
  }

  if (businessMatches.length > 0) {
    lines.push('## Business Icons (业务图标) — <sky-icon-i type="..." />');
    lines.push('');
    lines.push('| Type | Name | Category |');
    lines.push('|------|------|----------|');
    for (const icon of businessMatches) {
      lines.push(`| ${icon.type} | ${icon.name} | ${icon.category} |`);
    }
    lines.push('');
  }

  if (commonMatches.length === 0 && businessMatches.length === 0) {
    lines.push('No icons found matching the keyword.');
    lines.push('');
  }

  return lines.join('\n');
}

export async function iconResolve(typeValue, options = {}) {
  const iconDir = await resolveIconDir(options);
  const [commonIcons, businessIcons] = await Promise.all([readCommonIcons(iconDir), readBusinessIcons(iconDir)]);

  // Step 1: Search common icons first
  const commonMatch = commonIcons.find((icon) => icon.type === typeValue);
  if (commonMatch) {
    return formatIconResult(commonMatch, false);
  }

  // Step 2: Search business icons
  const businessMatch = businessIcons.find((icon) => icon.type === typeValue || icon.rawName === typeValue);
  if (businessMatch) {
    return formatIconResult(businessMatch, false);
  }

  // Step 3: Not found — use first common icon as fallback
  if (commonIcons.length > 0) {
    return formatIconResult(commonIcons[0], true);
  }

  return '⚠ Icon not found and no common icons available as fallback.';
}

export async function iconListCommon(options = {}) {
  const iconDir = await resolveIconDir(options);
  const commonIcons = await readCommonIcons(iconDir);

  const lines = ['# Common Icons (通用图标)', '', `Total: ${commonIcons.length}`, '', '| Type | Name |', '|------|------|'];
  for (const icon of commonIcons) {
    lines.push(`| ${icon.type} | ${icon.name} |`);
  }
  lines.push('');
  lines.push('Usage: <sky-icon type="<Type>" />');
  lines.push('');
  return lines.join('\n');
}

export async function iconListBusiness(options = {}) {
  const iconDir = await resolveIconDir(options);
  const businessIcons = await readBusinessIcons(iconDir);

  const lines = ['# Business Icons (业务图标)', '', `Total: ${businessIcons.length}`, ''];

  // Group by category
  const categories = new Map();
  for (const icon of businessIcons) {
    const key = `${icon.category} (${icon.categoryType})`;
    if (!categories.has(key)) categories.set(key, []);
    categories.get(key).push(icon);
  }

  for (const [cat, icons] of categories) {
    lines.push(`## ${cat}`);
    lines.push('');
    lines.push('| Type | Name |');
    lines.push('|------|------|');
    for (const icon of icons) {
      lines.push(`| ${icon.type} | ${icon.name} |`);
    }
    lines.push('');
  }

  lines.push('Usage: <sky-icon-i type="<Type>" />');
  lines.push('');
  return lines.join('\n');
}

// --- Parse Args ---

function extractOptions(args) {
  const options = { lang: null, projectDir: null };
  const positional = [];

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '--lang') {
      options.lang = args[++i] || null;
    } else if (arg === '--project-dir') {
      options.projectDir = args[++i] || null;
    } else {
      positional.push(arg);
    }
  }

  return { positional, options };
}

function parseArgs(args) {
  const { positional, options } = extractOptions(args);

  if (!positional.length || positional[0] === '--help' || positional[0] === '-h') {
    return { command: 'help', ...options };
  }
  if (positional[0] === 'list') {
    return { command: 'list', ...options };
  }

  // Icon commands: icon <subcommand> [args...]
  if (positional[0] === 'icon') {
    const sub = positional[1];
    if (sub === 'search' && positional[2]) {
      return { command: 'icon-search', keyword: positional.slice(2).join(' '), ...options };
    }
    if (sub === 'resolve' && positional[2]) {
      return { command: 'icon-resolve', typeValue: positional[2], ...options };
    }
    if (sub === 'list-common') {
      return { command: 'icon-list-common', ...options };
    }
    if (sub === 'list-business') {
      return { command: 'icon-list-business', ...options };
    }
    throw new Error('Usage: sky-ui-docs icon search <keyword> | icon resolve <type> | icon list-common | icon list-business');
  }

  const [component, subcommand, ...rest] = positional;

  if (subcommand === 'examples') return { command: 'examples', component, ...options };
  if (subcommand === 'example') return { command: 'example', component, section: rest.join(' ').trim(), ...options };
  if (subcommand === 'api' && rest.length > 0) return { command: 'api-section', component, section: rest.join(' ').trim(), ...options };
  if (subcommand === 'api') return { command: 'api', component, ...options };
  return { command: 'unknown', subcommand };
}

// --- Commands ---

export async function list(cliLang, options = {}) {
  const docsDir = await resolveDocs(options);
  const index = await readIndex(docsDir);
  const lines = ['# SkyUI Components', ''];
  for (const component of index.components) {
    lines.push(`- ${component.title || component.name}`);
  }
  lines.push('');
  return lines.join('\n');
}

export async function examples(component, cliLang, options = {}) {
  const docsDir = await resolveDocs(options);
  const lang = getLanguage(cliLang);
  const doc = await readComponent(component, lang, docsDir);
  const lines = [`# ${doc.name} Examples (${lang})`, '', '## Sections', ''];
  for (const ex of doc.examples || []) {
    lines.push(`- ${ex.section}`);
  }
  lines.push('');
  return lines.join('\n');
}

export async function example(component, section, cliLang, options = {}) {
  const docsDir = await resolveDocs(options);
  const lang = getLanguage(cliLang);
  const doc = await readComponent(component, lang, docsDir);
  const ex = (doc.examples || []).find((item) => sectionMatches(item.section, section));
  if (!ex) {
    throw new Error(`Example section not found: ${section}. Run sky-ui-docs ${doc.name} examples.`);
  }
  return `# ${doc.name} - ${ex.section}\n\n\`\`\`vue\n${ex.code || ''}\n\`\`\`\n`;
}

export async function api(component, cliLang, options = {}) {
  const docsDir = await resolveDocs(options);
  const lang = getLanguage(cliLang);
  const doc = await readComponent(component, lang, docsDir);
  const sections = (doc.api || []).map((item) => item.section).filter(Boolean);
  return `${sections.join('\n')}\n`;
}

export async function apiSection(component, section, cliLang, options = {}) {
  const docsDir = await resolveDocs(options);
  const lang = getLanguage(cliLang);
  const doc = await readComponent(component, lang, docsDir);
  const apiData = (doc.api || []).find((item) => sectionMatches(item.section, section));
  if (!apiData) {
    throw new Error(
      `API section not found: ${section}. Run sky-ui-docs ${doc.name} examples first, then sky-ui-docs ${doc.name} api.`
    );
  }
  const lines = [
    `### ${apiData.section}`,
    '',
    '| Name | Description | Type | Default |',
    '|------|-------------|------|---------|'
  ];
  for (const row of apiData.rows || []) {
    lines.push(`| ${escapeMarkdownCell(row.name)} | ${escapeMarkdownCell(row.description)} | ${escapeMarkdownCell(row.type)} | ${escapeMarkdownCell(row.default)} |`);
  }
  lines.push('');
  return lines.join('\n');
}

// --- CLI Entry ---

const helpText = `
SkyUI Docs Tool

Usage:
  sky-ui-docs --project-dir <dir> list
  sky-ui-docs --project-dir <dir> <component> examples
  sky-ui-docs --project-dir <dir> <component> example <section>
  sky-ui-docs --project-dir <dir> <component> api
  sky-ui-docs --project-dir <dir> <component> api <section>

  Icon Commands:
  sky-ui-docs --project-dir <dir> icon search <keyword>
  sky-ui-docs --project-dir <dir> icon resolve <type>
  sky-ui-docs --project-dir <dir> icon list-common
  sky-ui-docs --project-dir <dir> icon list-business

Icon Description:
  SkyUI has two icon types:
  1. Common Icons (通用图标): <sky-icon type="<font_class>" />
     - Source: @sky/sky-ui/icon/iconfont/iconfont.json glyphs[].font_class
     - Name: glyphs[].name
  2. Business Icons (业务图标): <sky-icon-i type="<componentName>" />
     - Source: @sky/sky-ui/icon/iconIs.json [].list[].componentName
     - Name: [].list[].title
  Resolution order: common first, then business. Fallback to first common icon.

Options:
  --project-dir <dir>  Application project directory (required)
  --lang <lang>        Language (zh-CN or en-US), default: zh-CN

Environment:
  SKY_UI_DOCS_LANG  Default language (zh-CN or en-US)
`;

export async function run(argv) {
  const parsed = parseArgs(argv);
  return runCommand(parsed);
}
