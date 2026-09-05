import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { list, examples, example, api, apiSection, run, iconSearch, iconResolve, iconListCommon, iconListBusiness } from './cli.mjs';

let tempDir;
let savedEnv;

async function createDocsFixture(baseDir, version = '2.1.145') {
  const packageDir = join(baseDir, 'node_modules', '@sky', 'sky-ui');
  const docsDir = join(baseDir, 'node_modules', '@sky', 'sky-ui', 'dist', 'skill-docs');
  await mkdir(join(docsDir, 'components'), { recursive: true });
  await writeFile(join(packageDir, 'package.json'), JSON.stringify({ name: '@sky/sky-ui', version }));

  await writeFile(join(docsDir, 'index.json'), JSON.stringify({
    version,
    generatedAt: '2026-05-08T00:00:00.000Z',
    languages: ['zh-CN', 'en-US'],
    components: [
      { name: 'Table', slug: 'table', title: '表格 Table', category: '数据展示', aliases: ['table', 'Table'] },
      { name: 'Button', slug: 'button', title: '按钮 Button', category: '通用', aliases: ['button', 'Button'] }
    ]
  }));

  const buttonZh = {
    name: 'Button', slug: 'button', title: '按钮 Button',
    description: '按钮是一种命令组件。', language: 'zh-CN',
    examples: [{ section: '基本用法', description: '按钮分为多种类型。', code: '<template><sky-button type="primary">Primary</sky-button></template>' }],
    api: [{
      section: 'Props', target: '<button>',
      rows: [
        { name: 'type', description: '按钮的类型', type: 'ButtonTypes', default: "'secondary'" },
        { name: 'disabled', description: '是否禁用', type: 'boolean', default: 'false' }
      ]
    }]
  };
  const buttonEn = { ...buttonZh, language: 'en-US', title: 'Button', description: 'Button is a command component.' };

  await writeFile(join(docsDir, 'components', 'button.zh-CN.json'), JSON.stringify(buttonZh));
  await writeFile(join(docsDir, 'components', 'button.en-US.json'), JSON.stringify(buttonEn));

  await writeFile(join(docsDir, 'components', 'table.zh-CN.json'), JSON.stringify({
    name: 'Table', slug: 'table', title: '表格 Table',
    description: '数据表格组件。', language: 'zh-CN',
    examples: [{ section: '基本用法', description: '基础表格。', code: '<template><sky-table /></template>' }],
    api: [{
      section: 'Props', target: '<table>',
      rows: [{ name: 'loading', description: '加载状态', type: 'boolean | object', default: 'false' }]
    }]
  }));
  await writeFile(join(docsDir, 'components', 'table.en-US.json'), JSON.stringify({
    name: 'Table', slug: 'table', title: 'Table',
    description: 'Data table component.', language: 'en-US',
    examples: [], api: []
  }));

  return docsDir;
}

async function createIconFixture(baseDir) {
  const iconDir = join(baseDir, 'node_modules', '@sky', 'sky-ui', 'icon');
  await mkdir(join(iconDir, 'iconfont'), { recursive: true });

  // Common icons
  await writeFile(join(iconDir, 'iconfont', 'iconfont.json'), JSON.stringify({
    id: 'test',
    name: 'test icon',
    glyphs: [
      { icon_id: '1', name: '通用图标-天枢AI', font_class: 'commonicon_tianshuAI', unicode: 'ecc8' },
      { icon_id: '2', name: '通用基础-面-引用添加', font_class: 'commonicon_quoteadd_fill', unicode: 'e720' },
      { icon_id: '3', name: '编辑器-筛选模板', font_class: 'editoricon_filter_template', unicode: 'ecc7' }
    ]
  }));

  // Business icons
  await writeFile(join(iconDir, 'iconIs.json'), JSON.stringify([
    {
      title: '患者标识',
      type: 'hzbs',
      list: [
        { name: 'hzbs_bingwei', componentName: 'Hzbs_bingwei', type: 'tab', title: '危重级别_病危' },
        { name: 'hzbs_jizheng', componentName: 'Hzbs_jizheng', type: 'tab', title: '危重级别_急症' }
      ]
    },
    {
      title: '物品标识',
      type: 'wpbs',
      list: [
        { name: 'wpbs_zibeiyao', componentName: 'Wpbs_zibeiyao', type: 'tab', title: '药品类型_自备药' },
        { name: 'wpbs_dierleijingshenyaopin', componentName: 'Wpbs_dierleijingshenyaopin', type: 'svg', title: '药品性质_第二类精神药品' }
      ]
    }
  ]));

  return iconDir;
}

beforeEach(async () => {
  savedEnv = { ...process.env };
  if (tempDir) await rm(tempDir, { recursive: true, force: true });
  tempDir = await mkdtemp(join(tmpdir(), 'sky-ui-docs-test-'));
  await createDocsFixture(tempDir);
});

afterEach(() => {
  process.env = savedEnv;
});

describe('queries', () => {
  it('lists components from index', async () => {
    const output = await list(null, { projectDir: tempDir });
    assert.match(output, /# SkyUI Components/);
    assert.match(output, /- 表格 Table/);
    assert.match(output, /- 按钮 Button/);
  });

  it('lists example sections', async () => {
    const output = await examples('button', null, { projectDir: tempDir });
    assert.match(output, /# Button Examples/);
    assert.match(output, /- 基本用法/);
  });

  it('returns Vue code block for an example', async () => {
    const output = await example('Button', '基本用法', null, { projectDir: tempDir });
    assert.match(output, /```vue/);
    assert.match(output, /sky-button/);
  });

  it('lists API sections', async () => {
    const output = await api('Button', null, { projectDir: tempDir });
    assert.equal(output.trim(), 'Props');
  });

  it('returns API table for a section', async () => {
    const output = await apiSection('Button', 'Props', null, { projectDir: tempDir });
    assert.match(output, /\| type \|/);
    assert.match(output, /\| disabled \|/);
  });

  it('escapes Markdown pipes in API table cells', async () => {
    const output = await apiSection('Table', 'Props', null, { projectDir: tempDir });
    assert.match(output, /boolean \\| object/);
  });

  it('uses English language when specified', async () => {
    const output = await examples('button', 'en-US', { projectDir: tempDir });
    assert.match(output, /en-US/);
  });

  it('throws on missing project-dir', async () => {
    await assert.rejects(() => list(null, {}), /--project-dir is required/);
  });

  it('throws on missing component', async () => {
    await assert.rejects(() => examples('Nonexistent', null, { projectDir: tempDir }), /Component not found: Nonexistent/);
  });

  it('throws on missing example section', async () => {
    await assert.rejects(() => example('Button', 'Nonexistent', null, { projectDir: tempDir }), /Example section not found: Nonexistent/);
  });

  it('throws on missing API section', async () => {
    await assert.rejects(
      () => apiSection('Button', 'Nonexistent', null, { projectDir: tempDir }),
      /API section not found: Nonexistent.*examples first/
    );
  });
});

describe('run (CLI integration)', () => {
  it('handles list command', async () => {
    const output = await run(['--project-dir', tempDir, 'list']);
    assert.match(output, /# SkyUI Components/);
  });

  it('handles examples command', async () => {
    const output = await run(['--project-dir', tempDir, 'Button', 'examples']);
    assert.match(output, /# Button Examples/);
  });

  it('handles api section command', async () => {
    const output = await run(['--project-dir', tempDir, 'Button', 'api', 'Props']);
    assert.match(output, /\| type \|/);
  });

  it('handles --lang flag', async () => {
    const output = await run(['--project-dir', tempDir, 'Button', 'examples', '--lang', 'en-US']);
    assert.match(output, /en-US/);
  });

  it('handles help command', async () => {
    const output = await run(['--help']);
    assert.match(output, /SkyUI Docs Tool/);
  });

  it('throws on unknown subcommand', async () => {
    await assert.rejects(
      () => run(['--project-dir', tempDir, 'Button', 'apii']),
      /Unknown command: apii/
    );
  });

  it('throws when --project-dir is missing', async () => {
    await assert.rejects(() => run(['list']), /--project-dir is required/);
  });
});

describe('resolveDocs (project-dir logic)', () => {
  it('installs SkyUI docs with pnpm when SkyUI is not installed in an empty project', async () => {
    const projectDir = await mkdtemp(join(tmpdir(), 'sky-ui-notinstalled-'));
    let installProjectDir = null;
    let installCommand = null;

    try {
      const output = await list(null, {
        projectDir,
        allowInstall: true,
        installSkyUi: async (targetProjectDir, command) => {
          installProjectDir = targetProjectDir;
          installCommand = command;
          await createDocsFixture(targetProjectDir);
        }
      });

      assert.equal(installProjectDir, projectDir);
      assert.deepEqual(installCommand, {
        command: 'pnpm',
        args: ['add', '@sky/sky-ui@latest', '--registry', 'http://192.168.5.47:4873']
      });
      assert.match(output, /Button/);
    } finally {
      await rm(projectDir, { recursive: true, force: true });
    }
  });

  it('uses npm install command when package-lock.json exists', async () => {
    const projectDir = await mkdtemp(join(tmpdir(), 'sky-ui-npm-'));
    let installCommand = null;

    try {
      await writeFile(join(projectDir, 'package-lock.json'), '{}');
      const output = await list(null, {
        projectDir,
        allowInstall: true,
        installSkyUi: async (targetProjectDir, command) => {
          installCommand = command;
          await createDocsFixture(targetProjectDir);
        }
      });

      assert.deepEqual(installCommand, {
        command: 'npm',
        args: ['install', '@sky/sky-ui@latest', '--registry', 'http://192.168.5.47:4873']
      });
      assert.match(output, /Button/);
    } finally {
      await rm(projectDir, { recursive: true, force: true });
    }
  });

  it('reports install failure when SkyUI cannot be installed', async () => {
    const projectDir = await mkdtemp(join(tmpdir(), 'sky-ui-installfail-'));

    try {
      await assert.rejects(
        () => list(null, {
          projectDir,
          allowInstall: true,
          installSkyUi: async () => {
            throw new Error('registry unreachable');
          }
        }),
        /Failed to install @sky\/sky-ui.*pnpm add @sky\/sky-ui@latest.*registry unreachable/s
      );
    } finally {
      await rm(projectDir, { recursive: true, force: true });
    }
  });

  it('uses project docs when SkyUI and docs exist', async () => {
    const projectDir = await mkdtemp(join(tmpdir(), 'sky-ui-exists-'));
    await createDocsFixture(projectDir);

    try {
      const output = await run(['--project-dir', projectDir, 'list']);
      assert.match(output, /按钮 Button/);
    } finally {
      await rm(projectDir, { recursive: true, force: true });
    }
  });

  it('throws when SkyUI is installed but dist/skill-docs is missing', async () => {
    const projectDir = await mkdtemp(join(tmpdir(), 'sky-ui-nodocs-'));
    const packageDir = join(projectDir, 'node_modules', '@sky', 'sky-ui');
    await mkdir(packageDir, { recursive: true });
    await writeFile(join(packageDir, 'package.json'), JSON.stringify({ name: '@sky/sky-ui', version: '3.0.0' }));

    try {
      await assert.rejects(
        () => run(['--project-dir', projectDir, 'list']),
        /SkyUI docs not found in project installation/
      );
    } finally {
      await rm(projectDir, { recursive: true, force: true });
    }
  });

  it('stops without installing SkyUI when the optional profile is not authorized', async () => {
    const projectDir = await mkdtemp(join(tmpdir(), 'sky-ui-noimplicit-install-'));

    try {
      await assert.rejects(
        () => list(null, { projectDir }),
        /SKYUI_DOCS_UNAVAILABLE.*not installed.*explicitly authorized setup step/s
      );
    } finally {
      await rm(projectDir, { recursive: true, force: true });
    }
  });

  it('throws when the installed SkyUI version is below the supported baseline', async () => {
    const projectDir = await mkdtemp(join(tmpdir(), 'sky-ui-old-version-'));
    await createDocsFixture(projectDir, '2.1.144');

    try {
      await assert.rejects(
        () => run(['--project-dir', projectDir, 'list']),
        /version 2\.1\.144 is below required 2\.1\.145/
      );
    } finally {
      await rm(projectDir, { recursive: true, force: true });
    }
  });
});

describe('icon commands', () => {
  it('iconSearch finds common icons by keyword', async () => {
    const projectDir = await mkdtemp(join(tmpdir(), 'sky-icon-search-'));
    try {
      await createIconFixture(projectDir);
      const output = await iconSearch('tianshu', { projectDir });
      assert.match(output, /# Icon Search: "tianshu"/);
      assert.match(output, /commonicon_tianshuAI/);
      assert.match(output, /通用图标-天枢AI/);
    } finally {
      await rm(projectDir, { recursive: true, force: true });
    }
  });

  it('iconSearch finds business icons by keyword', async () => {
    const projectDir = await mkdtemp(join(tmpdir(), 'sky-icon-biz-'));
    try {
      await createIconFixture(projectDir);
      const output = await iconSearch('药品', { projectDir });
      assert.match(output, /# Icon Search: "药品"/);
      assert.match(output, /Wpbs_zibeiyao/);
      assert.match(output, /药品类型_自备药/);
    } finally {
      await rm(projectDir, { recursive: true, force: true });
    }
  });

  it('iconSearch returns no results when keyword not found', async () => {
    const projectDir = await mkdtemp(join(tmpdir(), 'sky-icon-none-'));
    try {
      await createIconFixture(projectDir);
      const output = await iconSearch('notexist', { projectDir });
      assert.match(output, /No icons found matching the keyword/);
    } finally {
      await rm(projectDir, { recursive: true, force: true });
    }
  });

  it('iconResolve resolves common icon by font_class', async () => {
    const projectDir = await mkdtemp(join(tmpdir(), 'sky-icon-resolve-common-'));
    try {
      await createIconFixture(projectDir);
      const output = await iconResolve('commonicon_tianshuAI', { projectDir });
      assert.match(output, /<sky-icon type="commonicon_tianshuAI" \/>/);
      assert.match(output, /通用图标-天枢AI/);
      assert.match(output, /Common Icon/);
    } finally {
      await rm(projectDir, { recursive: true, force: true });
    }
  });

  it('iconResolve resolves business icon by componentName', async () => {
    const projectDir = await mkdtemp(join(tmpdir(), 'sky-icon-resolve-biz-'));
    try {
      await createIconFixture(projectDir);
      const output = await iconResolve('Hzbs_bingwei', { projectDir });
      assert.match(output, /<sky-icon-i type="Hzbs_bingwei" \/>/);
      assert.match(output, /危重级别_病危/);
      assert.match(output, /Business Icon/);
    } finally {
      await rm(projectDir, { recursive: true, force: true });
    }
  });

  it('iconResolve falls back to first common icon when not found', async () => {
    const projectDir = await mkdtemp(join(tmpdir(), 'sky-icon-fallback-'));
    try {
      await createIconFixture(projectDir);
      const output = await iconResolve('notexist_icon', { projectDir });
      assert.match(output, /Icon not found\. Using the first common icon as fallback/);
      assert.match(output, /<sky-icon type="commonicon_tianshuAI" \/>/);
    } finally {
      await rm(projectDir, { recursive: true, force: true });
    }
  });

  it('iconListCommon lists all common icons', async () => {
    const projectDir = await mkdtemp(join(tmpdir(), 'sky-icon-list-common-'));
    try {
      await createIconFixture(projectDir);
      const output = await iconListCommon({ projectDir });
      assert.match(output, /# Common Icons/);
      assert.match(output, /Total: 3/);
      assert.match(output, /commonicon_tianshuAI.*通用图标-天枢AI/);
      assert.match(output, /Usage: <sky-icon type="<Type>" \/>/);
    } finally {
      await rm(projectDir, { recursive: true, force: true });
    }
  });

  it('iconListBusiness lists all business icons grouped by category', async () => {
    const projectDir = await mkdtemp(join(tmpdir(), 'sky-icon-list-biz-'));
    try {
      await createIconFixture(projectDir);
      const output = await iconListBusiness({ projectDir });
      assert.match(output, /# Business Icons/);
      assert.match(output, /Total: 4/);
      assert.match(output, /## 患者标识.*hzbs/);
      assert.match(output, /Hzbs_bingwei.*危重级别_病危/);
      assert.match(output, /## 物品标识.*wpbs/);
      assert.match(output, /Usage: <sky-icon-i type="<Type>" \/>/);
    } finally {
      await rm(projectDir, { recursive: true, force: true });
    }
  });

  it('icon commands throw when --project-dir is missing', async () => {
    await assert.rejects(() => iconSearch('test', {}), /--project-dir is required/);
    await assert.rejects(() => iconResolve('test', {}), /--project-dir is required/);
    await assert.rejects(() => iconListCommon({}), /--project-dir is required/);
    await assert.rejects(() => iconListBusiness({}), /--project-dir is required/);
  });

  it('handles icon search via CLI run', async () => {
    const projectDir = await mkdtemp(join(tmpdir(), 'sky-icon-cli-'));
    try {
      await createIconFixture(projectDir);
      const output = await run(['--project-dir', projectDir, 'icon', 'search', '编辑器']);
      assert.match(output, /# Icon Search: "编辑器"/);
      assert.match(output, /editoricon_filter_template/);
    } finally {
      await rm(projectDir, { recursive: true, force: true });
    }
  });

  it('handles icon resolve via CLI run', async () => {
    const projectDir = await mkdtemp(join(tmpdir(), 'sky-icon-cli-resolve-'));
    try {
      await createIconFixture(projectDir);
      const output = await run(['--project-dir', projectDir, 'icon', 'resolve', 'commonicon_tianshuAI']);
      assert.match(output, /<sky-icon type="commonicon_tianshuAI" \/>/);
    } finally {
      await rm(projectDir, { recursive: true, force: true });
    }
  });

  it('handles icon list-common via CLI run', async () => {
    const projectDir = await mkdtemp(join(tmpdir(), 'sky-icon-cli-list-common-'));
    try {
      await createIconFixture(projectDir);
      const output = await run(['--project-dir', projectDir, 'icon', 'list-common']);
      assert.match(output, /# Common Icons/);
    } finally {
      await rm(projectDir, { recursive: true, force: true });
    }
  });

  it('handles icon list-business via CLI run', async () => {
    const projectDir = await mkdtemp(join(tmpdir(), 'sky-icon-cli-list-biz-'));
    try {
      await createIconFixture(projectDir);
      const output = await run(['--project-dir', projectDir, 'icon', 'list-business']);
      assert.match(output, /# Business Icons/);
    } finally {
      await rm(projectDir, { recursive: true, force: true });
    }
  });

  it('throws on invalid icon subcommand', async () => {
    const projectDir = await mkdtemp(join(tmpdir(), 'sky-icon-invalid-'));
    try {
      await createIconFixture(projectDir);
      await assert.rejects(
        () => run(['--project-dir', projectDir, 'icon', 'invalid']),
        /Usage: sky-ui-docs icon search/
      );
    } finally {
      await rm(projectDir, { recursive: true, force: true });
    }
  });
});
