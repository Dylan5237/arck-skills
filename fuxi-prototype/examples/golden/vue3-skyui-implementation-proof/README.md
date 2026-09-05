# Tiangong SkyUI Implementation-proof Fixture

prototype_spec: tiangong
runtime: vite-vue3
runtime_profile: vue3-skyui
fuxi_adapter: fuxi-prototype
entry_file: dist/index.html
output_mode: implementation-proof
fixture_evidence: hand-maintained-local-golden-sample

Purpose: exercise explicit SkyUI selection and structural proof markers for
the Tiangong implementation-proof path.

Pages: one compact data workspace. Interactions: query and reset through
SkyUI components in source. Runtime/build steps: `npm install && npm run build`.
Known limitations: source component names are fixture evidence only; this run
does not query installed SkyUI docs, build the target, inspect a browser,
validate a ZIP, contact Fuxi, or represent real Agent generation.
