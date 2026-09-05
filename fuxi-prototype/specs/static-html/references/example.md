# Static HTML 示例

```text
prototype/
├── index.html
├── assets/
│   ├── app.css
│   └── app.js
└── README.md
```

`index.html` 根入口引用相对资源：

```html
<link rel="stylesheet" href="./assets/app.css">
<script src="./assets/app.js" defer></script>
```

`README.md` 示例：

```markdown
# 我的静态原型

- prototype_spec: static-html
- runtime: static-html
- fuxi_adapter: 2026-08-11
- entry_file: index.html

页面：首页、模块一、模块二。
交互：顶部导航锚点跳转，卡片悬停高亮。
运行方式：直接打开 index.html 或使用任意静态服务器。
限制：不依赖后端接口。
```
