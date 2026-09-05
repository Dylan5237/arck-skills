# Tiangong Element Plus Alignment Fixture

prototype_spec: tiangong
runtime: vite-vue3
runtime_profile: vue3-element-plus
fuxi_adapter: fuxi-prototype
entry_file: dist/index.html
output_mode: alignment
fixture_evidence: hand-maintained-local-golden-sample

Purpose: exercise the default Tiangong Element Plus profile and a compact
alignment layout with relative preview assets.

Pages: one project-list workspace. Interactions: a lightweight filter action
in the preview artifact. Runtime/build steps: `npm install && npm run build`.
Known limitations: `dist/` is a deterministic structural fixture, not evidence
that this source was built; no browser review, package validation, MCP call, or
Agent generation happened for this sample.
