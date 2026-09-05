# Static HTML Alignment Fixture

prototype_spec: static-html
runtime: static-html
runtime_profile: not-applicable
fuxi_adapter: fuxi-prototype
entry_file: index.html
output_mode: alignment
fixture_evidence: hand-maintained-local-golden-sample

Purpose: exercise the no-build static HTML delivery shape with local relative
assets.

Pages: one linear readiness page. Interactions: a native details toggle.
Runtime/build steps: open `index.html` directly in a browser.
Known limitations: the quality gate verifies only structure and relative asset
resolution; browser visual review, ZIP validation, Fuxi delivery, and real
Agent generation remain unverified.
