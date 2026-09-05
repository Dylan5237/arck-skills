# Tiangong Runtime Profile Compatibility

Read this reference when updating an existing Tiangong prototype or when its README does not declare `runtime_profile`.

## Detect The Existing Profile

Use evidence in this order:

1. A valid `runtime_profile` in the root README.
2. Direct dependencies in `package.json`: `@sky/sky-ui` means `vue3-skyui`; `element-plus` means `vue3-element-plus`.
3. Source imports and component tags when package metadata is incomplete.

Conflicting or missing evidence is a hard stop. Ask the user which profile to preserve; do not choose the new default.

## Compatibility Rules

- New Fuxi prototypes use the selected specification's `preferred_profile`; Tiangong currently prefers `vue3-element-plus`.
- `vue3-skyui` is optional and must not be installed, upgraded, or selected implicitly.
- Existing `vue3-element-plus` prototypes remain Element Plus during ordinary updates.
- Existing `vue3-skyui` prototypes remain SkyUI during ordinary updates.
- Never add both component libraries to one prototype.
- A profile migration is a separate, explicit task. Require user approval, record the before/after profiles, rebuild every affected page, and run the full Fuxi validation and visual regression flow.

## Metadata Backfill

When legacy evidence uniquely identifies a profile, add the detected `runtime_profile` to README as part of the update. This records existing reality; it is not a migration.
