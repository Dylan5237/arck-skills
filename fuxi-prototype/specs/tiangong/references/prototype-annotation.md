# Tiangong Prototype Annotation Contract

Use annotations to make review intent inspectable without coupling the design contract to one component library.

## Elements

- Annotation panel: `340px` on wide screens, pale review surface, numbered title and description items.
- Target regions: meaningful page or dialog regions identified by stable annotation IDs.
- Connection layer: draw a line between the active target and matching description; keep it pointer-transparent.

## Behavior

- Hovering or focusing either side highlights both target and description.
- Page mode keeps the panel beside the main working area.
- Modal mode moves the panel away from dialog content and raises it above the selected runtime's mask.
- Modal annotations are separate from page annotations and restore page state when the modal closes.
- Recalculate connections after resize, scroll, tab changes, modal transitions, and dynamic content changes.

## Markup Contract

Use implementation-neutral attributes:

```html
<section data-proto-target="filters">...</section>
<section data-proto-target="results">...</section>
<aside data-proto-panel>...</aside>
```

Descriptions use the same stable IDs. Runtime profiles may add classes but must not change ID semantics.

## Accessibility And Presentation

- Annotation highlighting must not be the only way to identify a region.
- Keep focus outlines visible and avoid intercepting page interactions.
- On narrow screens, collapse annotations into a toggleable review drawer instead of shrinking the application to an unusable width.
- Allow a clean presentation build to hide annotations without changing the underlying prototype.
