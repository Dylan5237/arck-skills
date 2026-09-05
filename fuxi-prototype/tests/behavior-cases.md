# fuxi-prototype 行为用例

这些用例是 Skill Suite 的回归目录。用 `node scripts/behavior-harness.cjs <FuxiPlatform 根目录>` 执行；表格中的 `DESIGNED` 是设计基线，实际结果以 harness 输出为准。

| ID | 场景 | 预期结果 | 状态 |
| --- | --- | --- | --- |
| P-01 | 新建 Tiangong 项目，未指定 UI 运行时 | 选择 `vue3-element-plus`，不安装 SkyUI | DESIGNED |
| P-02 | 已有项目包含 `@sky/sky-ui` | 保留 `vue3-skyui`，不替换已有 profile | DESIGNED |
| P-03 | 项目同时出现 Element Plus 与 SkyUI 证据 | 停止并返回 `RUNTIME_PROFILE_REQUIRED` | DESIGNED |
| P-04 | 显式请求 `vue3-skyui`，项目缺少 SkyUI 文档 | 返回 `SKYUI_DOCS_UNAVAILABLE`，不静默安装 | DESIGNED |
| P-05 | 仅使用 Element Plus 的本地项目 | 不查询 SkyUI 专属能力，继续完成本地验证 | DESIGNED |
| P-06 | Fuxi MCP 工具快照与当前 server 不一致 | 返回 `MCP_SCHEMA_MISMATCH`，阻止外部写入 | DESIGNED |
| P-07 | 更新原型但缺少 `expectedVersion` 或目标不匹配 | 返回 `WRITE_SCOPE_INVALID` | DESIGNED |
| P-08 | 过程在 BUILD/DELIVER 失败后恢复 | 状态记录失败原因，不伪造 COMPLETE，可从 checkpoint 继续 | DESIGNED |

## 执行记录格式

后续回归至少记录：`caseId`、`runId`、选择的 `profile`、命令、环境边界、结果（PASS/FAIL/BLOCKED/UNVERIFIED）和证据路径。未执行的用例保持 `DESIGNED` 或 `UNVERIFIED`，不得改成 PASS。
