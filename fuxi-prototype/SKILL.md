---
name: fuxi-prototype
description: Generate, validate, package, and deliver frontend prototypes to the Fuxi platform through a selected prototype specification and runtime profile. Use when creating or updating a Fuxi prototype, fixing preview packaging, or performing local-only prototype validation; choose SkyUI only when the request or existing project requires it.
---

# Fuxi Prototype

Use this Skill as the only user-facing entry for Fuxi prototype generation and delivery. Select the design specification and runtime profile before loading component-specific knowledge. Keep design, runtime, platform packaging, and MCP operations separated.

## Capability Cache

Before reading the references, check the local capability cache:

```text
node <skillDir>/scripts/build-capability-cache.cjs check <skillDir>
```

- On `CACHE_VALID`, read `cache/contract.md` and `cache/tools.json`. They are generated views for this Skill version, not substitutes for a failed compatibility check.
- On `CACHE_MISSING`, `CACHE_STALE*`, `MCP_SCHEMA_MISMATCH`, or a non-zero exit, read the required references and stop before external delivery until the relevant capability is resolved.
- The cache contains universal static capability and design knowledge only. Resolve user, project, prototype, version, credentials, MCP connection, and selected profile at runtime.
- Never drop safety, risk, authorization, or stop-condition rules when using the cache.

## MCP Onboarding Prerequisite

If Fuxi MCP tools are unavailable, stop the MCP workflow at that boundary. Use the platform-generated onboarding prompt and the AI host's native HTTP, shell, or Node.js capability to save its `bootstrapManifest`, download and extract only the MCP ZIP needed to obtain `bootstrap.js`, then run the bundled setup CLI as the single installation entry point:

```text
node <mcp-package>/src/bootstrap.js install --manifest <absolute-manifest-path> --client <client-name> --mcp-config <absolute-client-config> --skill-target <absolute-skill-target> --mcp-zip <absolute-mcp-zip> --cleanup-manifest
```

`absolute-skill-target` is the final `fuxi-prototype` directory itself, not its parent directory.
The installer validates the local MCP ZIP, downloads and validates the Skill ZIP, performs backup, configuration, idempotence, locking, and the first MCP self-test. Do not manually download the Skill ZIP, repeat install substeps, or run a separate preflight. Treat `status=COMPLETE` with `mcpConnected=true` and `skillReady=true`, or `reason=ALREADY_COMPLETE`, as the only installation success. Do not claim installation or invoke Fuxi MCP tools before the command returns success. Restart or reload the AI client once, then call `check_connection({})` once and continue only when `ok=true` and `authentication=verified`. `bootstrap.js` is a deterministic setup CLI shipped inside the MCP package; it is not an MCP tool and does not add a Fuxi desktop client.

## Read Required References

Read these from the Skill package before implementation:

- [references/workflow-contract.md](references/workflow-contract.md): always; modes, profile selection, states, tools, risk, and completion evidence.
- [references/prototype-spec.md](references/prototype-spec.md): always before selecting a design specification or writing UI code.
- [references/fuxi-adapter.md](references/fuxi-adapter.md): before build, validation, packaging, or upload.
- [references/tiangong-visual-language.md](references/tiangong-visual-language.md): when the selected specification is Tiangong or a Tiangong visual review is requested.
- [references/skyui-runtime.md](references/skyui-runtime.md): only when the selected profile is `vue3-skyui`.
- `specs/<name>/SKILL.md`: read only for the selected prototype specification; never combine two specifications or two runtime profiles in one run.

Do not ask the user to invoke helper Skills manually. If a selected profile needs a capability that is unavailable, stop at that boundary and report it.

## Select Operation Mode

- `create`: create a new Fuxi prototype; never reuse an existing same or similar name.
- `update`: update one existing prototype; require an explicit `prototypeId` and expected current version, or stop after a unique read-only lookup for user confirmation.
- `project-bound-update`: update one prototype through an exact project binding; require `prototypeId`, `projectId`, `projectPrototypeId`, expected version, and a checkout owned by the current MCP user.
- `local-only`: generate and validate without platform writes when upload is not requested or MCP is unavailable.

Do not silently switch operation modes.

## Select Specification And Runtime Profile

Select the profile before querying component documentation or copying a starter:

1. If the user names a runtime/profile, use it after validating that the selected specification supports it.
2. For an existing project, detect `runtime_profile` from README, package dependencies, and source evidence. Preserve a uniquely detected profile; conflicting or missing evidence is `RUNTIME_PROFILE_REQUIRED`.
3. For a new project, use the selected specification's `preferred_profile`. For Tiangong, the current preferred profile is `vue3-element-plus`; `vue3-skyui` is optional and must not be installed or selected implicitly.
4. Record `prototype_spec`, `runtime`, and `runtime_profile` in the generated root README.
5. Load only the selected profile reference. Never mix component libraries in one prototype.

If no supported profile can be selected, stop with `RUNTIME_PROFILE_REQUIRED`.

Use the deterministic selector when available:

```text
node <skillDir>/scripts/profile-selection.cjs select <skillDir>/specs/<spec> [projectDir] [--profile <profile>]
```

## Select Output Mode

Always select an output mode after selecting the operation and runtime profile:

- `alignment` (default): align the requirement with the lowest possible cost. Follow the selected specification's layout, spacing, density, states, and viewport rules. Native HTML/CSS and lightweight custom controls are allowed when their interaction proof is honest. Do not claim full component compliance.
- `implementation-proof` (strict): prove implementation against the selected runtime profile. Every interactive or component-semantic control must use the documented selected-profile component when one exists. Report `COMPONENT_PROFILE_GAP` for missing equivalents instead of silently imitating them.

Announce the selected output mode before generation and record it in the completion record. Do not silently upgrade an alignment prototype into an implementation proof.

## Execute The Workflow

1. Establish scope: requirements, pages, interactions, target directory, operation mode, output mode, specification, runtime profile, and acceptance criteria.
2. Run `scripts/write-gate.cjs` to classify write risk and authorization scope before any external write. Stop on `AUTHORIZATION_REQUIRED` or `WRITE_SCOPE_INVALID`.
3. Check only the capabilities required by the selected profile. Query SkyUI docs only for a selected `vue3-skyui` profile; missing optional SkyUI capability must not block other profiles.
4. Inspect the target project and preserve unrelated changes. For new projects, copy the selected profile starter. Never copy `.npmrc`, `node_modules`, `dist`, build output, or validation ZIPs.
5. Generate the prototype from the selected specification and profile. Use real profile documentation when implementation-proof is selected.
6. Build and satisfy the Fuxi adapter. Do not hide dependency, type, build, asset, or profile failures.
7. Run `scripts/quality-gate.cjs --project-dir <projectDir> --profile <profile> --spec <spec> --mode <outputMode>` and preserve its PASS/FAIL/UNVERIFIED report; it is a structural gate, not a substitute for build or visual evidence.
8. Visually inspect the production build at the specification's verified baseline when visual acceptance is in scope.
9. Call MCP validation and packaging in order: `validate_project`, `pack_project`, then `validate_zip`.
10. Create one idempotency key and call `deliver_project` with the selected operation mode only after all previous checks pass.
11. Accept success only from `status: COMPLETE` with matching target ID, expected version transition, README/preview readback, and affected scope.
12. Persist a completion record containing operation mode, output mode, profile, risk, authorization, artifact hashes, validation, readback, failure stage, and remaining risks.

Use `scripts/run-state.cjs` to initialize and advance the run record. Never replace a persisted checkpoint with a prose-only status update.

## Regression loop

For a behavior regression pass, run `node <skillDir>/scripts/behavior-harness.cjs <FuxiPlatform root>`. Record its JSON output with the run evidence; the harness covers default profile selection, existing-profile preservation, conflict stops, optional SkyUI non-installation, cache schema mismatch, write scope, and resumable failure state.

For structural quality regression, run `node <skillDir>/scripts/quality-gate.cjs --project-dir <projectDir> ...`. A report with `status: UNVERIFIED` is expected until the caller supplies build and browser evidence; never promote it to PASS by editing the report.

For deterministic local regression, run `node <skillDir>/scripts/run-golden-samples.cjs --output <report.json>`. The three fixtures under `examples/golden/` cover Element Plus alignment, explicitly selected SkyUI implementation-proof structure, and static HTML alignment. They are hand-maintained fixtures, not evidence of a build, visual review, real Agent generation, packaging, or platform delivery; preserve those fields as `UNVERIFIED`.

## Safety And Stop Conditions

- Never store usernames, passwords, tokens, `.npmrc`, or credentials in generated projects or Skill files.
- Never update by fuzzy name match. An ambiguous target is a hard stop.
- Never call `delete_prototype`, `rollback_version`, `restore_snapshot`, or `force_release_checkout` during ordinary generation or update.
- Treat authorization as scoped to one named action and one affected scope, not blanket permission.
- Never run production acceptance against an existing prototype. Use a separately named acceptance prototype unless the user explicitly identifies an update target.
- Never claim upload success until readback confirms the target ID, resulting version, entry file, README, and preview.
- Do not retry `DELIVERY_PARTIAL_FAILURE` blindly; read back the returned target first and reuse an idempotency key only for the exact same arguments.
- Do not fall back to removed packagers, credential files, or direct undocumented HTTP upload scripts.

## Capability Gaps

- Missing selected runtime documentation or starter: report `RUNTIME_CAPABILITY_UNAVAILABLE`.
- Missing SkyUI docs when `vue3-skyui` is explicitly selected: report `SKYUI_DOCS_UNAVAILABLE`; do not install or upgrade it implicitly.
- Missing Fuxi MCP: complete local-only work only when authorized and report `FUXI_MCP_UNAVAILABLE`.
- Authentication or permission failure: report `AUTHENTICATION_FAILED` or `PERMISSION_DENIED`; never request credentials in project files.
- Build, profile, packaging, validation, schema, or readback failure: stop and report the exact stage.

## Keep The User Loop Small

Ask only for information that cannot be discovered safely. The common required input is an explicit target for updates and a profile only when project/spec evidence cannot resolve it. Use short progress updates and keep the completion record machine-readable.
