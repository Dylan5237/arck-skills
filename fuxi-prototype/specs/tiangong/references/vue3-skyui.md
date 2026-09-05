# Tiangong Profile: Vue 3 + SkyUI

Use Vue 3, TypeScript, Vite, and `@sky/sky-ui >=2.1.145`. Query the installed SkyUI `dist/skill-docs` before coding; do not infer props from Element Plus.

## Semantic Mapping

This mapping is the `implementation-proof` baseline. In the default
`alignment` mode it still applies to controls that are actually implemented
with SkyUI; it is not a requirement to convert every native placeholder.

| Intent | SkyUI implementation |
|---|---|
| Primary/secondary/text action | `sky-button` with documented `type`, `size`, `loading`, `disabled` |
| Text input | `sky-input` with `v-model`, `allow-clear`, validation integration |
| Form | `sky-form` / `sky-form-item` |
| Bordered data grid | `sky-table` with `bordered`, `size="small"`, columns/data arrays |
| Fixed operation column | column object with `fixed: 'right'` and `slotName` |
| Dialog | `sky-modal` with `v-model:visible`, documented size/width and before hooks |
| Product/page/view tabs | `sky-tabs` with documented `type="style2"`, `style3`, or `style5` according to hierarchy |
| Business tree | `sky-tree` with `block-node`, selected/expanded keys, optional excerpt and more actions |
| Form choices | `sky-radio-group` / `sky-checkbox` with documented disabled and readonly states |
| Pagination | `sky-pagination` with total, page size, and `[30, 50, 100]` options |
| Empty data region | `sky-empty` inside the existing table viewport |
| Overflow commands | `sky-dropdown` with click trigger and documented placement |
| Long text | `sky-textarea` with placeholder, error, and bounded auto-size |
| Icons | `sky-icon` or `sky-icon-i`, resolved by the icon query CLI |

## Table Baseline

```vue
<sky-table
  row-key="id"
  size="small"
  bordered
  :columns="columns"
  :data="rows"
/>
```

Use `stripe="false"` only when an explicit prop is required; the documented default is already false. Type fixed columns as string literals so TypeScript preserves `'right'`.

## Modal Baseline

```vue
<sky-modal
  v-model:visible="visible"
  title="编辑"
  width="960px"
  :on-before-ok="submit"
>
  ...
</sky-modal>
```

Use the documented modal mask/container behavior when placing the annotation panel. Do not reuse `.el-dialog__body` or `.el-drawer__body` selectors.

Use approximately `960px` for standard form dialogs at the verified desktop
baseline. Use approximately `1470px`/`72vw` for large composite editors and
approximately `1320px`/`65vw` for nested selection dialogs. Do not apply one
dialog width to every workflow.

## Profile Rules

- Use SkyUI `style2`/`style5` tabs for product or workspace tasks and `style3` for in-page views; do not style every tab manually.
- Use `sky-form` horizontal layout with right-aligned labels and `sky-form-item` required/disabled/readonly/help/error props.
- Use `sky-tree` block nodes and documented selected/expanded state. Prefer its excerpt/more actions over improvised row controls when the documented behavior fits.
- Use `sky-pagination` rather than hand-built page buttons.
- Use `sky-empty` inside the table area so headers, pagination, and bottom actions remain stable.

## Runtime Assets

Import the installed SkyUI plugin, CSS, SVG iconfont JavaScript, iconfont CSS, and verify WOFF2/WOFF/TTF assets are emitted into the Vite build. Set Vite `base: './'` through `fuxi-adapter`.
