# fuxi-prototype Skill 工程契约

## 作用域

- `SKILL.md` 是唯一用户入口；`fuxi-adapter`、`specs/*` 和 `references/*` 是内部协作资产。
- `specs/<name>/manifest.json` 是 profile/runtime 选择的机器可读事实，`SKILL.md` 是对应的人类规则说明。
- `cache/` 是可重建产物，必须由 `scripts/build-capability-cache.cjs` 生成，不手工维护工具快照。

## 运行时边界

- 新 Tiangong 原型默认使用 `vue3-element-plus`。
- `vue3-skyui` 只在用户明确指定、已有项目检测到，或需求/规范明确要求时选择；不得隐式安装或升级 SkyUI。
- 任何 profile 冲突必须停在 `RUNTIME_PROFILE_REQUIRED`，不得猜测并继续生成。
- 外部写入前必须经过 `scripts/write-gate.cjs`；运行过程必须用 `scripts/run-state.cjs` 持久化状态。

## 最小验证

在 Skill 根目录执行：

```text
node --test scripts/profile-selection.test.mjs scripts/run-state.test.mjs scripts/write-gate.test.mjs scripts/sky-ui-docs/cli.test.mjs
node --test scripts/quality-gate.test.mjs
node --test scripts/run-golden-samples.test.mjs
node scripts/run-golden-samples.cjs --output <report.json>
node scripts/behavior-harness.cjs <FuxiPlatform 根目录>
node scripts/build-capability-cache.cjs check . --server <FuxiPlatform>/mcp-server/src/server.js
```

修改 Skill 入口、profile manifest、adapter 或缓存生成器后，必须重建并检查 cache；失败时不得报告可交付。

## 交付边界

- 本目录不保存凭证、token、真实项目数据或生产运行状态。
- 本地测试 PASS 只证明本地逻辑；Fuxi MCP、真实上传、预览和生产验收必须单独记录证据。
- `examples/golden/` 是人工维护的本地结构 fixture；`run-golden-samples.cjs` 必须持续将 BUILD、视觉和真实 Agent 生成标为 `UNVERIFIED`。未选择 `vue3-skyui` 的样例不得读取 SkyUI 专属能力或将它列入 capability plan。
- 旧名称 `fuxi-skyui-prototype` 只允许存在于迁移兼容代码或历史记录中，不得重新成为入口、默认 profile 或缓存事实。
