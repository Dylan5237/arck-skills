# Tiangong Color Palette

The reference palette is derived from Tiangong desktop screenshots captured on a `2560x1440` display at browser zoom `100%`. Use semantic tokens; runtime profiles map them to library variables or local CSS.

## Core Tokens

| Token | Value | Purpose |
|---|---|---|
| `brand-header` | `#2d5cf6` | Global product header and strongest primary actions |
| `brand-primary` | `#2f5cf6` | Query, save, add, active underline, links |
| `brand-strong` | `#224ddd` | Pressed state and active product tab |
| `brand-subtle` | `#ebf0fe` | Selected tree row, table header, active module background |
| `shell-background` | `#e9edf3` | Workspace outside white panes |
| `surface-work` | `#ffffff` | Tables, trees, forms, dialogs, main work panes |
| `surface-muted` | `#f7f8fa` | Modal header, secondary strips, disabled regions |
| `surface-disabled` | `#f1f3f6` | Disabled inputs and inactive controls |
| `border-default` | `#c9d0dc` | Pane, control, table, and modal separators |
| `border-subtle` | `#dfe3ea` | Internal rows and quiet dividers |
| `text-primary` | `#171d2a` | Main content and table data |
| `text-secondary` | `#4f5d73` | Labels and supporting information |
| `text-muted` | `#8c98a9` | Placeholders, disabled text, empty descriptions |
| `success` | `#52c41a` | Available, enabled, success |
| `warning` | `#fa8c16` | Pending review and warnings |
| `danger` | `#f04b4b` | Delete, destructive batch action, validation error |
| `annotation` | `#fa8c16` | Prototype annotation border and label |

## Surface Rules

- Keep work panes white. Pure white is part of the observed Tiangong language; do not tint every surface to manufacture a premium SaaS look.
- Use gray-blue only for application scaffolding, selected context, table headers, disabled controls, and secondary strips.
- Separate regions with one-pixel borders before adding shadow. Normal panels and tables have no floating-card shadow.
- Reserve shadow for dialogs, dropdowns, popovers, and raised menus. Use `0 8px 24px rgba(23, 39, 78, 0.18)` for a primary dialog.
- Use a neutral overlay around `rgba(23, 29, 42, 0.28)`; each nested dialog adds another overlay layer.

## Action And State Rules

- Keep primary actions solid blue; secondary actions use white with a blue border; text actions use blue without a container.
- Render destructive text and buttons in red. Do not hide destructive meaning behind an overflow menu when the reference workflow exposes it directly.
- Use semantic green, amber, and red for meaning. Do not recolor semantic states blue merely to unify the palette.
- Use `brand-subtle` for selected rows and active tree items; use a stronger blue band only for an explicitly selected data row.
- Meet WCAG AA where practical; never reduce primary table text to muted gray for visual softness.

## Forbidden Color Treatments

- No dark navy or ornamental gradient header.
- No tinted-neutral system that removes the observed white working surface.
- No large decorative color blocks, glassmorphism, glow, or colored card shadows.
- No blue-only status system.
