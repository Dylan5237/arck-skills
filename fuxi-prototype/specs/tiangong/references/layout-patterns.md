# Tiangong Layout Patterns

## Verified Baseline

- Reference display: `2560x1440`; browser zoom: `100%`; approved geometry density: `compact-0.8` (equivalent to the formerly preferred `80%` browser view).
- Reference captures expose approximately `2549x1191` browser content pixels after browser and OS chrome.
- Treat the baseline as a dense desktop application. Do not introduce mobile-first cards or stacked dashboard sections.
- Use the `8px` spacing grid with `4px` half steps. Common gaps are `8`, `12`, `16`, `20`, and `24px`.

## Application Shell

```text
application
|-- product header (48px, solid brand blue)
|   |-- launcher / home / product context
|   |-- open product tabs
|   `-- notifications / user / utilities
`-- desktop body
    |-- module sidebar (174px approved compact baseline)
    `-- workspace (min-width: 0)
        |-- workspace tabs (about 50px band)
        `-- work surface
            |-- business tree or category pane (optional, 288-344px)
            `-- data/editor pane (remaining width, min-width: 0)
```

- Keep panes edge-to-edge. The shell is not a centered canvas and does not use floating cards.
- Use white sidebars and work panes on `shell-background`; separate them with borders.
- Product tabs and workspace tabs are closable document tabs. Preserve the distinction between application navigation, workspace tabs, and in-page tabs.
- Allow sidebars and tree panes to collapse with a narrow handle; do not convert them into dashboard cards.
- Grouped sidebars use functional accordions and may collapse from `174px` to about `48px`; the work area must reclaim the width immediately.

## Standard Dialog Inner Geometry

- For a `960px` standard dialog, use `6-16px` body padding and an inner form of `calc(100% - 32px)` up to `880px`.
- Reserve approximately `110px` for right-aligned labels and give the remaining width to controls. Use about `10px` vertical item rhythm.
- Treat panel width, body padding, form width, label width, control start line, row gap, and footer as one recipe. Setting only panel width is incomplete.
- High-frequency distribution dialogs use a `960px` panel, a compact affected-object summary, and an equal-width native transfer control with an approximately `350px` viewport.

## Data Management Recipe

```text
data pane (height: 100%, flex column, min-height: 0)
|-- local tabs / view tabs (40-48px)
|-- query strip (45-52px, horizontal form)
|-- table viewport (flex: 1, min-height: 0, internal scroll)
|-- pagination strip (42-48px)
`-- bottom action bar (51-58px, optional, right aligned)
```

- Keep query controls in one horizontal row when the baseline width allows it.
- Use approximately `32px` controls by default; keep even stricter compactness
  only inside dense tables and trees.
- Use bordered, non-striped tables. Recommended header height is `37-39px`;
  body rows are `37-40px`.
- Keep the table header, fixed operation column, horizontal scrollbar, pagination, and batch actions reachable.
- Put the empty/loading/error state inside the table viewport so the surrounding layout does not jump.
- Do not insert KPI summaries between page tabs and the query strip unless the product requirement explicitly calls for metrics.

## Tree And Split-Pane Recipe

- Use a search field at the top of the tree pane.
- Indent each level consistently; show expand/collapse affordances only for parents.
- Use distinct but restrained icons for layers, domains, abstract entities, and concrete entities.
- Put add/edit/more actions at the right edge of the tree row and reveal or emphasize them according to the runtime behavior.
- Use a full-row `brand-subtle` selection background. Keep selected text dark; do not turn the whole row into a saturated button.
- Make the tree pane independently scrollable and keep its scrollbar inside the pane.

## Dialog Recipes

| Dialog kind | Baseline width | Use |
|---|---:|---|
| Confirmation / message | `420-560px` | Destructive confirmation, short feedback |
| Standard form | about `960px` | Create/edit forms with one main column |
| Operation form | `960-1150px` | Dense forms with auxiliary actions |
| Large editor | about `1470px` or `72vw` | Tree/table/form composite editing |
| Nested selection | about `1320px` or `65vw` | Available/selected split tables |

- Use an approximately `48px` modal header and a `51-58px` footer; keep the
  body scrollable when necessary.
- Keep dialog titles centered when matching the current Tiangong/SkyUI behavior.
- Standard forms use right-aligned labels and stable label widths. Prefer one readable form column over two cramped columns.
- Large editors may use tabs, left reference panes, and internal tables; keep exactly one dominant vertical scroll region.
- Footer actions are right aligned. Typical order: auxiliary primary action, preview, cancel, save; creation forms may use cancel, save-and-add, save.

## Lower-Width Behavior

- Only the `2560x1440 / 100%` baseline is verified by screenshots.
- Below the verified baseline, preserve density by collapsing optional panes and using internal table scrolling.
- Do not claim mobile support without evidence. Do not stack the entire desktop application into consumer-style cards.
- Keep primary actions visible through a fixed footer or an explicit overflow menu.
