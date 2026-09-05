# Tiangong Visual Language

Use this reference as a low-freedom implementation recipe. It is based on current Tiangong desktop captures at `2560x1440`. Acceptance established that the earlier geometry looked correct only at browser zoom `80%`; render at browser zoom `100%` with the equivalent `compact-0.8` density instead. Do not require reviewers to change browser zoom.

## Tokens

```css
:root {
  --tg-brand-header: #2d5cf6;
  --tg-brand-primary: #2f5cf6;
  --tg-brand-strong: #224ddd;
  --tg-brand-subtle: #ebf0fe;
  --tg-shell-bg: #e9edf3;
  --tg-surface: #ffffff;
  --tg-surface-muted: #f7f8fa;
  --tg-surface-disabled: #f1f3f6;
  --tg-border: #c9d0dc;
  --tg-border-subtle: #dfe3ea;
  --tg-text: #171d2a;
  --tg-text-secondary: #4f5d73;
  --tg-text-muted: #8c98a9;
  --tg-success: #52c41a;
  --tg-warning: #fa8c16;
  --tg-danger: #f04b4b;
}
```

- Use pure white for actual work panes. The observed system does not tint every neutral.
- Separate normal panes with one-pixel borders; do not give them card shadows.
- Reserve `0 8px 24px rgba(23,39,78,.18)` for dialogs and raised menus.
- Use a neutral overlay near `rgba(23,29,42,.28)`; stack another overlay for an intentional nested dialog.
- Use `0-4px` control/pane radii. Modal radii may reach `12px`.

## Desktop Shell Recipe

```text
48px solid-blue product header
|-- launcher / home / product context
|-- closable product tabs
`-- notifications / user / utilities

desktop body
|-- 174px white module sidebar
`-- remaining workspace
    |-- about 50px workspace-tab band
    `-- edge-to-edge work surface
        |-- optional 288-344px tree/category pane
        `-- remaining-width data/editor pane
```

- Do not center the application or wrap the work area in a card.
- Keep every pane full height and assign scrolling to the tree/table/dialog body, not to the whole page.
- Preserve three navigation layers when present: product tab, workspace tab, in-page tab.

## Data Workspace Recipe

```text
local tabs: 40-48px
query strip: 45-52px
table viewport: flex 1, internal x/y scroll
pagination: 42-48px
page action footer: 51-58px, optional
```

- Use approximately `32px` controls, compact only inside tables and trees.
- Keep query and reset adjacent; query is primary, reset is outlined.
- Use a bordered, non-striped table with `37-39px` header and `37-40px` rows.
- Keep fixed operation columns reachable and keep the horizontal scrollbar visible.
- Use blue text row actions, red destructive actions, and a dropdown for uncommon commands.
- Keep create and batch actions at the bottom right for full-height management workspaces; disable batch actions without moving them.
- Keep empty/loading/error/no-permission states inside the same table viewport.
- Do not add metric cards above a CRUD/configuration table unless the requirements explicitly call for metrics.

## Tree Recipe

- Put search at the top of the pane and use a contained scrollbar.
- Use stable indentation, expand icons only on parents, and restrained type icons.
- Put parent add/more and leaf edit/more actions at the right edge.
- Select the full row with `--tg-brand-subtle`; keep text dark.
- Tree selection changes scope; expansion only changes visibility.

## Form Recipe

- Use `sky-form` horizontal layout with right-aligned labels and a stable label width.
- Use `sky-form-item` required, disabled, readonly, help, error, and validation props; do not hard-code required stars.
- Prefer one readable form column for standard dialogs. Keep short radios and checkboxes inline.
- Put name construction, format validation, sort, and auto-generation beside the affected field as text actions.
- Put help directly under the field and examples in placeholders.
- Create footer: cancel, save-and-add, save. Edit footer: cancel, save.
- A `960px` standard panel uses only `6-16px` dialog-body padding. Its form occupies `calc(100% - 32px)` up to `880px`, with an approximately `110px` right-aligned label column, remaining-width controls, `10px` item rhythm, and no decorative blank bands.

## Dialog Recipes

| Kind | Width at verified baseline | Notes |
|---|---:|---|
| Confirmation | `420-560px` | Short message and explicit affected object |
| Standard form | about `960px` | One-column create/edit form with constrained inner width |
| Operation form | `960-1150px` | Dense form with inline utilities |
| Large editor | about `1470px` / `72vw` | Tabs, tree/table/form composite |
| Nested selection | about `1320px` / `65vw` | Available and selected split tables |

- Use about `48px` modal headers and `51-58px` fixed footers.
- The mask must be translucent neutral gray near `rgba(23,29,42,.28)`. Keep the full-screen modal container transparent; apply white background, radius, and shadow only to the actual dialog panel.
- When acceptance shows excessive side margins, prefer the denser `880px` inner form recipe above. The panel, body padding, form width, label width, control start line, item gap, and footer must be treated as one constraint set.
- Keep centered titles when matching SkyUI's current Tiangong behavior.
- Keep exactly one dominant vertical scroll region in a large dialog.
- Preserve the parent dialog when a nested reference-selection dialog opens.

## SkyUI Mapping

### Component Gate By Output Mode

Default output mode is `alignment`; `implementation-proof` is selected only
when the user explicitly asks for SkyUI component compliance.

In `alignment` mode:

- Follow the Tiangong visual recipe. Native HTML/CSS may implement UI chrome
  and lightweight controls; an interaction only needs to prove the
  requirement, not production component compliance.
- When a SkyUI component is actually used, use its documented behavior;
  otherwise code from the visual recipe and the verified tokens.
- Do not claim "严格 SkyUI" and do not spend effort making every native
  control SkyUI-compliant. Record lightweight placeholders explicitly.

In `implementation-proof` mode:

- Every interactive or component-semantic control must use its documented
  SkyUI implementation when available: buttons, menus, tabs, trees, tables,
  forms, inputs, selects, radios, checkboxes, tags, pagination, dialogs,
  dropdowns, messages, notifications, collapse panels, empty states, and
  transfers.
- Native `header`, `aside`, `main`, `section`, `div`, and CSS grid/flex are
  allowed only as non-interactive structural layout containers.
- A custom interactive imitation is forbidden when the installed SkyUI exposes
  the component. Audit the rendered source before delivery.
- If no SkyUI equivalent exists, stop claiming full component compliance and
  report `SKYUI_COMPONENT_GAP` with the exact missing behavior and proposed
  containment.

- Use `sky-tabs`: `style2`/`style5` for product/workspace tasks and `style3` for in-page views.
- Use `sky-tree` block nodes with documented selected/expanded state and built-in add/more behavior when suitable.
- Use `sky-table` with `bordered`, `size="small"`, fixed operation columns, and internal scroll.
- Use `sky-form`, `sky-form-item`, `sky-radio-group`, `sky-checkbox`, `sky-textarea`, and documented disabled/readonly/error states.
- Use `sky-pagination` with total and page-size options `[30, 50, 100]`.
- Use `sky-empty` without removing table headers, pagination, or stable page actions.
- Use `sky-dropdown` for uncommon row actions.
- Resolve all icons through the bundled query tool and verify production font assets.

## Distribution Recipe

- Use native `sky-transfer` for frequent assign/distribute flows such as roles, permissions, users, fields, and data scopes.
- Use equal-width source/target panels, search on both sides, explicit source/target titles with counts, and a stable `350px` list viewport inside a `960px` operation dialog.
- Show the affected object and current selection count above the transfer. Preserve existing assignments when opening; save only on confirmation.
- Do not replace a distribution workflow with a multi-select dropdown when users repeatedly compare available and assigned items.

## Expand And Collapse Contract

- Tree parent chevrons must actually add/remove descendants from the visible tree; selection and expansion remain independent state.
- Module sidebars with grouped navigation must expose functional group accordions and a full-column collapse control. Collapsed width is approximately `48px`, and the workspace must reclaim the released width without page overflow.
- Use `aria-expanded` on expandable controls and keep the chevron direction synchronized with state. Decorative, non-functional chevrons fail acceptance.

## Screenshot Gate

Render and inspect the production build at `2560x1440`, browser zoom `100%`.

Reject the result if it contains:

- dark/gradient header;
- dashboard statistics in a management workspace;
- floating cards on a tinted canvas;
- repeated `8-16px` radii or pill controls;
- oversized page title, avatar, illustration, or marketing copy;
- excessive whitespace that lowers data density;
- breadcrumb-only navigation instead of workspace tabs;
- page-level overflow, double scrolling, covered columns, or overlapping footer;
- custom imitation controls where a documented SkyUI component exists.

Verify one page state and one dialog state. Exercise query/reset, tree scope, create/edit, validation, save feedback, empty/loading/error, and destructive confirmation when those flows are in scope.
