# 伏羲 SkyUI 原型验收

```yaml
prototype_spec: tiangong
runtime: vite-vue3
runtime_profile: vue3-skyui
fuxi_adapter: fuxi-prototype
entry_file: index.html
```

## 用途

验证真实 SkyUI 组件、图标、样式和字体可以通过 Vite 构建为伏羲可预览的相对路径静态产物。

## 页面与交互

- 原型资产列表、统计和关键字搜索。
- SkyUI Table 状态与操作列。
- SkyUI Modal 新建原型交互。

## 构建

```text
pnpm build
```

## 已知限制

- 使用静态验收数据，不连接业务后端。
