---
name: static-html
description: Minimal static HTML design specification for small demos and linear presentations. Use internally through fuxi-prototype when a no-build static runtime is selected; do not invoke it as a standalone Fuxi delivery workflow.
---

# 静态 HTML 原型规范（Static HTML Prototype Spec）

适用于小型演示、单页落地页、线性汇报场景。规范只规定内容结构与交互约定，平台兼容由 `fuxi-adapter` 负责。

## 规范声明

```yaml
prototype_spec: static-html
supported_runtimes:
  - static-html
preferred_runtime: static-html
requires:
  - fuxi-adapter
```

本规范只定义视觉、布局、组件和交互。若原型需要上传到伏羲平台，必须同时读取 `fuxi-adapter`，以满足入口文件、资源路径、README 和打包约束。

## 核心原则

1. 纯静态 HTML/CSS/JS，可双击 `index.html` 完整运行，不依赖构建服务器。
2. 所有资源使用相对路径，禁止引用 `/assets/xxx`、`http://` CDN 或本地绝对路径。
3. 页面结构清晰：Header → 内容区 → Footer，信息层级明确。
4. 交互以内联事件和原生 DOM 为主；如需更复杂逻辑，允许单个无构建的 ES module `app.js`。

## 快速检查清单（每次生成原型前必读）

- [ ] 存在根入口 `index.html`
- [ ] 所有 `src` / `href` 都是相对路径（如 `./assets/app.css`），不使用绝对 `/assets/` 或外链 CDN
- [ ] 包含根 `README.md`，写明用途、页面、交互、运行方式、已知限制
- [ ] 不包含 `node_modules/`、`.git/`、`src/` 等源码与依赖目录
- [ ] 字体/图片等媒体文件放在 `assets/` 且通过相对路径引用
- [ ] 浏览器 HTML5 规范内可直接预览，无跨域请求

## 页面骨架

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>页面标题</title>
    <link rel="stylesheet" href="./assets/app.css">
  </head>
  <body>
    <header class="top-header">
      <strong class="brand">产品名</strong>
      <nav class="nav-links"><a href="#section-a">模块一</a><a href="#section-b">模块二</a></nav>
    </header>
    <main class="main-content">
      <section id="section-a" class="block">...</section>
      <section id="section-b" class="block">...</section>
    </main>
    <footer class="page-footer">版本信息</footer>
  </body>
</html>
```

## Handoff 字段

生成的 `README.md` 必须包含：

- `prototype_spec: static-html`
- `runtime: static-html`
- `runtime_profile: not-applicable`
- `fuxi_adapter: <adapter 版本或日期>`
- `entry_file: index.html`

## 常见错误规避

1. 不要在 HTML 里写 `src="/assets/app.js"`，必须用 `./assets/app.js`。
2. 不要把资源放在共享临时目录或磁盘绝对路径，伏羲预览只能访问 ZIP 内的相对资源。
3. 不要用浏览器不支持的内置 API 或需要开发服务器的语法，确保直开可运行。
4. 多页场景建议把每页的文件名写小写英文并用相对链接，避免编码差异。
