# 🧰 Arck Skills

Arck 的 AI Skill 合集。每个 Skill 都是可独立安装、复用和迭代的工作说明，按目录收录在仓库根目录。

## 目录

| Skill | 说明 |
| --- | --- |
| [fuxi-prototype](./fuxi-prototype) | 伏羲平台原型创建、修改、校验、打包与交付 |

## 安装

将 Skill 目录地址交给支持 Skill 安装的 AI 工具，例如：

```text
请安装这个 Skill：
https://github.com/Dylan5237/arck-skills/tree/main/fuxi-prototype
```

安装后，AI 工具会读取对应目录中的 `SKILL.md`，并按其中的入口、约束和参考资料执行任务。

## Skills

### 🎨 fuxi-prototype

伏羲平台配套 Skill，覆盖从需求澄清、原型规范选择、页面实现，到验证、打包和交付的完整流程。使用前需要按伏羲平台提供的接入流程安装 MCP，并在新的 AI 会话中使用。

- [查看 Skill 说明](./fuxi-prototype/SKILL.md)
- [查看行为案例](./fuxi-prototype/tests/behavior-cases.md)

## 约定

- 每个 Skill 的 `SKILL.md` 是该 Skill 的入口和当前契约。
- 参考资料、示例和校验脚本应与所属 Skill 一起维护。
- 发布前应完成对应 Skill 自带的静态检查和行为验证。
