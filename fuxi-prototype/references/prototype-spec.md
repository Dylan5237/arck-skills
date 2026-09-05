# Prototype Specification Contract

This reference defines the common contract for a selected prototype specification. The selected specification owns visual language, layout, interaction, content conventions, supported runtimes, and profile selection. Fuxi packaging and delivery rules remain in `fuxi-adapter.md`.

## Selection

```yaml
prototype_spec: <selected-spec>
runtime: <selected-runtime>
runtime_profile: <selected-profile>
output_mode: alignment | implementation-proof
```

- Select exactly one specification and one runtime profile per run.
- For an existing project, preserve a uniquely detected profile unless the user explicitly authorizes migration.
- For a new project, use the selected specification's `preferred_profile`; do not infer a profile from whichever dependency happens to be installed on the machine.
- Record the selection in the generated root README and completion record.

## Output Modes

- `alignment` proves information architecture, visual hierarchy, key states, and interaction intent with the lowest reasonable implementation cost. Native controls and lightweight placeholders are allowed when reported honestly.
- `implementation-proof` proves the selected runtime profile's component implementation. Query the selected profile's real documentation, use documented components when available, and report `COMPONENT_PROFILE_GAP` for missing equivalents.

Never claim one component library's compliance for another profile. Never silently mix component libraries.

## Common Acceptance

- The page follows the selected specification's approved layout, density, spacing, responsive, and state rules.
- Loading, empty, validation, disabled, error, success, confirmation, and permission states are present when the workflow requires them.
- The production build works at the specification's verified viewport and browser baseline.
- Custom interaction placeholders and known limitations are recorded in the handoff README.
- Profile-specific API or icon claims come from the selected profile reference or runtime documentation, not model memory.
