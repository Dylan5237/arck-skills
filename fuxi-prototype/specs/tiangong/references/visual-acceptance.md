# Tiangong Visual Acceptance

Use this checklist for screenshot-driven review and before declaring a Tiangong prototype visually complete.

## Reference Viewport

- Render the production build at `2560x1440`, browser zoom `100%`, using `compact-0.8` geometry. A result that still requires manual browser zoom fails acceptance.
- Capture the full browser content area and at least one representative dialog state.
- If testing another viewport, report it separately; do not substitute it for the verified baseline.

## Output Mode

- `alignment` (default): acceptance focuses on layout, spacing, density,
  states, and honest interaction proof. Custom lightweight controls are
  allowed; label them as alignment placeholders in the report, do not claim
  component compliance.
- `implementation-proof` (strict): the component audit below is mandatory,
  every control uses the runtime component when available, and gaps are
  reported instead of imitated.

## Required Visual Evidence

- Complete component audit: native HTML/CSS is limited to non-interactive structural containers. Menus, tabs, trees, pagination, tags, buttons, feedback, dialogs, and other controls use the selected runtime library whenever available.
- Any missing runtime component is reported as an explicit component gap; a custom imitation cannot pass the gate.

The component audit bullet applies only in `implementation-proof` mode. In
`alignment` mode, replace it with a placeholder audit that names each
custom lightweight control and states that full component compliance was not
claimed.

- Solid `#2d5cf6` product header with product tabs and global utilities.
- White module sidebar and, when needed, a separate white tree/category pane.
- Gray-blue shell background only in structural gaps and tab bands.
- Flat, full-height working surface without KPI cards or decorative containers.
- Horizontal query strip, bordered compact table, pagination, and stable actions.
- At least one selected tree item or data row.
- At least one empty/loading/error state inside an unchanged table region.
- Standard form dialog with required, disabled/readonly, and help states.
- Fixed dialog footer and, where relevant, a bottom-right page action bar.

## Geometry Checks

- Header, sidebar, workspace tabs, tree pane, and data pane align to one-pixel boundaries.
- No page-level horizontal overflow; tables scroll inside their own viewport.
- No double vertical scrolling between page, pane, table, and dialog body.
- Fixed operation columns do not cover data without a reachable horizontal scrollbar.
- Dialog body and footer do not overlap; nested dialog stays inside the viewport.
- Dialog mask is translucent gray; the full-screen container is transparent, while white background and shadow apply only to the actual dialog panel.
- Standard form dialogs use an explicit inner width and one stable column instead of unconstrained fields spanning the panel.
- Verify the label/control start lines and measure body padding; excessive blank bands or side margins fail even when the panel width is correct.
- Exercise one tree parent, one grouped menu, the full-sidebar collapse, and one high-frequency distribution dialog when those controls are in scope.
- Text, icons, badges, and row actions stay vertically centered in compact rows.

## Fidelity Rejections

Reject the result when any of these appear without an explicit requirement:

- Dark navy or gradient header.
- Dashboard statistics inserted into a CRUD/configuration workspace.
- Floating white cards on a wide tinted canvas.
- Rounded `8-16px` cards and pill controls throughout the page.
- Oversized page titles, avatars, illustrations, or marketing copy.
- Generous whitespace that reduces table density.
- Breadcrumb-only navigation replacing product/workspace tabs.
- Custom imitation controls when a documented SkyUI component exists.

## Interaction Evidence

- Query/reset changes the visible dataset or state.
- Tree selection changes scope without reflowing the shell.
- Create/edit opens the correct dialog recipe.
- Validation prevents invalid save and exposes the first error.
- Save produces feedback and preserves the surrounding workspace state.
- Destructive actions require confirmation.
