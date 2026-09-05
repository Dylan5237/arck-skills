# Local Golden Samples

These are hand-maintained, deterministic local fixtures for the
`fuxi-prototype` structural quality gate. They are **not** Agent-generated
prototypes, build evidence, browser/visual acceptance, package validation, or
Fuxi delivery evidence.

| Sample | Spec / profile | Output mode | Purpose |
| --- | --- | --- | --- |
| `vue3-element-plus-alignment` | `tiangong` / `vue3-element-plus` | `alignment` | Default Tiangong profile and an honest lightweight alignment layout. |
| `vue3-skyui-implementation-proof` | `tiangong` / `vue3-skyui` | `implementation-proof` | Explicit SkyUI profile with documented-component-shaped source. |
| `static-html-alignment` | `static-html` / `not-applicable` | `alignment` | No-build, relative-asset static entry. |

Run all fixtures from the Skill root:

```text
node scripts/run-golden-samples.cjs --output <report.json>
```

The JSON report intentionally remains `UNVERIFIED` while its structural gates
pass: only a target-project build, a browser visual review, and a real Agent
generation record can supply those distinct evidence layers.
