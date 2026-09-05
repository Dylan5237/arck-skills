---
name: tiangong
description: Component-library-independent B-end design specification for dense enterprise management interfaces. Use internally through fuxi-prototype with exactly one supported runtime profile; do not invoke it as a standalone Fuxi delivery workflow.
---

# Tiangong Prototype Specification

Define design intent independently from component APIs and platform packaging. Read one runtime profile only; do not combine SkyUI and Element Plus in the same prototype.

## Metadata

```yaml
prototype_spec: tiangong
supported_runtimes:
  - vite-vue3
preferred_runtime: vite-vue3
supported_profiles:
  - vue3-element-plus
  - vue3-skyui
preferred_profile: vue3-element-plus
requires:
  - fuxi-adapter
```

## Select A Runtime Profile

- Use the selected specification profile for new Fuxi prototypes; Tiangong currently prefers `vue3-element-plus`.
- Use `vue3-skyui` only when the user requests it, the existing project already uses it, or a verified requirement depends on it.
- Preserve an existing project's profile during updates unless the user approves a migration.
- Record `runtime_profile` in the generated root README.
- For legacy projects without metadata, follow [references/profile-migration.md](references/profile-migration.md) before selecting a profile.

## Select An Output Mode

The specification is component-library-aware but not a pure implementation
proof. Two output modes are available through the driving Skill:

- `alignment` (default): the prototype exists to align a requirement. Layout,
  spacing, density, states, and viewport follow the Tiangong recipe; native
  HTML/CSS may implement UI chrome and lightweight controls. Placeholders are
  reported honestly, and component compliance is not claimed.
- `implementation-proof` (strict): every interactive or component-semantic
  control must use the selected runtime component when one exists; native
  HTML/CSS is limited to structural containers; missing components are
  reported as a gap instead of silently imitated.

When a runtime profile is documented below, its component mapping applies only
in `implementation-proof` mode or to controls that are actually implemented
with that runtime. Do not convert a working alignment prototype into a falsely
compliant one.

## Progressive Disclosure

Always read:

- [references/color-palette.md](references/color-palette.md)
- [references/layout-patterns.md](references/layout-patterns.md)
- [references/interaction-patterns.md](references/interaction-patterns.md)
- [references/visual-acceptance.md](references/visual-acceptance.md)
- [references/prototype-annotation.md](references/prototype-annotation.md)

Then read exactly one implementation profile:

- SkyUI: [references/vue3-skyui.md](references/vue3-skyui.md)
- Element Plus: [references/vue3-element-plus.md](references/vue3-element-plus.md)

Read [references/prototype-annotation-element-plus.md](references/prototype-annotation-element-plus.md) only when implementing the annotation system with the Element Plus profile. SkyUI must use the selectors and modal behavior in its own profile.

## Stable Design Contract

- Build flat, dense, work-focused enterprise interfaces that match Tiangong's multi-level workspace grammar.
- Use the verified desktop baseline: `2560x1440`, browser zoom `100%`, with approved `compact-0.8` geometry; the reviewer must not need to zoom the browser to `80%`.
- Prefer product header, product tabs, module sidebar, workspace tabs, optional business tree, and the remaining-width data pane.
- Use bordered compact tables without zebra stripes; keep the operation column fixed right when horizontal scrolling is possible.
- Keep primary and batch page actions in a fixed bottom-right action area when the page is an editor or management workspace.
- Use flat tabs, visible pane borders, restrained status colors, control radii `0-4px`, and modal radii no larger than `12px`.
- Use approximately `960px` form dialogs and `1470px` large editor dialogs at the approved compact baseline; size by recipe, not by generic defaults.
- Provide loading, empty, validation, disabled, error, success, confirmation, and permission states.
- Do not add KPI cards, avatar cards, decorative gradients, oversized headings, dashboard summaries, or generous SaaS whitespace unless the requirements explicitly need them.
- Include the Tiangong prototype annotation system for reviewable prototypes unless the user explicitly requests a clean presentation build.

## Preflight

- [ ] One runtime profile selected and recorded.
- [ ] Component names and props come from the selected profile's real documentation.
- [ ] Output mode selected and recorded. In `alignment`, custom lightweight controls are allowed and reported; in `implementation-proof`, every interactive or component-semantic control uses the selected runtime component when available, and any unavailable component is reported explicitly rather than custom-imitated.
- [ ] Layout has no nested cards, double scrolling, overflow, or overlapping controls.
- [ ] The page uses an approved Tiangong layout recipe and the verified density tokens.
- [ ] Tables are bordered, compact, non-striped, and keep operations reachable.
- [ ] Dialog, form, tree, tabs, bottom action bar, and required states are complete.
- [ ] A `2560x1440` / `100%` production-build screenshot passes `visual-acceptance.md`.
- [ ] Annotation targets and descriptions stay aligned in page and modal modes.
- [ ] Fuxi delivery rules come only from `fuxi-adapter`.
