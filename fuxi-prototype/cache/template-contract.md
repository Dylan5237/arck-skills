# Fuxi Prototype - Capability Contract (distilled)

This generated contract is valid only while `cache/manifest.json` reports matching source hashes and MCP server compatibility.

## 1. Identity and scope

- Skill: `fuxi-prototype`.
- One user-facing workflow for create, update, project-bound update, and local-only validation.
- Select exactly one prototype specification and one runtime profile per run.
- SkyUI is optional. Do not install or select `vue3-skyui` implicitly.

## 2. Profile selection

- Existing project: detect from README, package dependencies, and source evidence; preserve a uniquely detected profile.
- New project: use the selected specification's preferred profile. Tiangong prefers `vue3-element-plus`; `vue3-skyui` is opt-in or preserved from an existing project.
- Conflicting or missing evidence: stop with `RUNTIME_PROFILE_REQUIRED`.
- Record `prototype_spec`, `runtime`, and `runtime_profile` in README and completion record.

## 3. Workflow and state

`DISCOVER -> SELECT_PROFILE -> PLAN -> QUERY_RUNTIME -> GENERATE -> BUILD -> VALIDATE -> PREFLIGHT -> DELIVER -> READBACK -> COMPLETE`

- `local-only` ends after `VALIDATE`.
- Persist run state, selected profile, risk, authorization, artifact hashes, failure stage, and next action.
- Do not skip a failed state or silently change operation/profile.

## 4. Output modes

- `alignment` (default): prove layout, content, states, and key interactions; custom lightweight controls are allowed and reported.
- `implementation-proof`: use the selected profile's documented components; report `COMPONENT_PROFILE_GAP` for missing equivalents.

## 5. Runtime capability

- Query only documentation for the selected profile.
- Query SkyUI docs only when `vue3-skyui` is explicitly selected.
- Missing optional SkyUI capability must not block Element Plus or static HTML.
- Missing selected capability: `RUNTIME_CAPABILITY_UNAVAILABLE`.

## 6. Fuxi delivery

- Build/type validation -> `validate_project` -> `pack_project` -> `validate_zip` -> `deliver_project`.
- Use one idempotency key per exact delivery attempt.
- Update requires exact target ID and expected version; project-bound update also requires project binding and owned checkout.
- Accept success only from `status=COMPLETE` plus matching ID, version, README, preview, and affected scope.
- `DELIVERY_PARTIAL_FAILURE` requires readback before any retry.

## 7. Risk and safety

- Classify write risk before external writes and record authorization scope.
- Never fuzzy-match update targets or store credentials in projects/Skill files.
- Never use ordinary generation/update to call delete, rollback, restore, or force-release tools.
- Production acceptance uses a separately named prototype unless the user names the update target.

## 8. Fuxi adapter

- Vite projects use `base: './'` and build before packaging.
- Recognized entry files: `dist/index.html`, `build/index.html`, `index.html`, `public/index.html`.
- Exclude source, dependencies, VCS metadata, tests, local data, credentials, logs, caches, and registry configuration.
- Root README must include specification, runtime, profile, adapter, entry file, purpose, interactions, build steps, and limitations.

## 9. Stop conditions

- Missing/ambiguous profile, missing selected capability, cache/schema mismatch, build/validation/package failure, auth/permission/risk failure, version conflict, target mismatch, checkout conflict, or failed readback.
