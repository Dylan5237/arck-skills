# Workflow Contract

## State Machine

```text
DISCOVER -> SELECT_PROFILE -> PLAN -> QUERY_RUNTIME -> GENERATE -> BUILD -> VALIDATE
                                                                        |
                                                                        v
                                                           PREFLIGHT -> DELIVER -> READBACK -> COMPLETE
```

Do not skip forward after a failed state. `local-only` ends after `VALIDATE`. A run must persist its current state, selected profile, artifact hashes, risk, authorization, and failure stage so the same run can resume safely.

## Establish Fuxi MCP Before MCP Calls

When Fuxi MCP tools are not available, do not call them, emulate them, or report a connection that was not verified. Follow the platform-generated onboarding prompt with the AI host's native HTTP, shell, or Node.js capability:

1. Save the returned `bootstrapManifest` as a temporary file with an absolute path.
2. Download the MCP ZIP once and extract it only far enough to run its bundled `bootstrap.js`; do not download or extract the Skill ZIP manually.
3. Run the bundled setup CLI as the single installation entry point; it validates the local MCP ZIP, downloads the Skill ZIP, performs preflight, backup, configuration, idempotence, locking, and the first MCP self-test:
   `node <mcp-package>/src/bootstrap.js install --manifest <absolute-manifest-path> --client <client-name> --mcp-config <absolute-client-config> --skill-target <absolute-skill-target> --mcp-zip <absolute-mcp-zip> --cleanup-manifest`
4. Do not repeat the install substeps. Accept only `status=COMPLETE` with `mcpConnected=true` and `skillReady=true`, or an idempotent `reason=ALREADY_COMPLETE` result.
5. Restart or reload the selected AI client once. Only then call `check_connection({})` once and require `authentication=verified`.

The bundled runner backs up existing configuration, preserves other MCP entries, validates artifact structure and optional SHA-256/size fields, performs one MCP self-test, removes the one-time connect code from persistent configuration, and writes a machine-readable state file. It is a setup CLI, not an MCP tool and not a Fuxi desktop client.

## Required Inputs

| Input | Create | Update | Project-bound update | Local only |
|---|---:|---:|---:|---:|
| Requirements or requested change | required | required | required | required |
| Prototype specification | required | detect or required | detect or required | required |
| Runtime profile | select or spec default | detect or required | detect or required | select or spec default |
| Local project directory | discover or create | required | required | discover or create |
| Explicit `prototypeId` | no | required | required | no |
| Expected current version | no | required | required | no |
| `projectId` + `projectPrototypeId` | no | no | required | no |
| Current-user checkout | no | no | required | no |
| Delivery idempotency key | required | required | required | no |
| Risk level and authorization scope | required | required | required | no |
| Fuxi MCP connection | required | required | required | no |
| Output mode announced | required | required | required | required |

Conflicting profile evidence, an unsupported profile, or a missing required capability is a hard stop. Do not silently select SkyUI because it is available.

## Runtime Capability Query

1. Select exactly one specification and one runtime profile.
2. Query only the selected profile's real documentation or verified local contract.
3. Query SkyUI docs only for an explicitly selected `vue3-skyui` profile.
4. Missing optional SkyUI capability must not block another supported profile.
5. A component gap in `implementation-proof` is reported as `COMPONENT_PROFILE_GAP`; an alignment placeholder must be marked honestly.

## MCP Sequence

1. If the preceding prerequisite was needed, after the client reload call `check_connection({})` first. Continue only when its result has `ok=true` and `authentication=verified`.
2. Build, then call `validate_project`, `pack_project`, and `validate_zip`.
3. Generate one stable idempotency key for this delivery attempt. Reuse it only when retrying the exact same arguments.
4. Call `deliver_project` once with the selected operation mode:
   - `create`: provide a new name and prove pre-existing prototype versions did not change.
   - `update`: provide exact `prototypeId`, `expectedVersion`, and `expectedEntryFile` when present.
   - `project-bound-update`: also provide exact project binding and a checkout owned by the current MCP user.
5. Read back the returned target. Accept completion only when `status=COMPLETE`, the returned ID matches, the version transition is valid, README/preview readback passed, and the affected scope matches the mode.

Do not use `create_prototype` + `upload_project` as the ordinary delivery sequence. They remain low-level tools for diagnostics and compatibility tests.

## Completion Record

```text
runId:
state:
mode:
outputMode:
prototypeSpec:
runtime:
runtimeProfile:
riskLevel:
authorizationScope:
prototypeId:
versionBefore:
versionAfter:
entryFile:
readmeStatus:
previewUrl:
validation:
artifactHashes:
uploadVerified:
idempotencyKey:
idempotentReplay:
affectedScope:
failureStage:
remainingRisks:
```

Do not populate unknown values with guesses. Use `not-applicable` or `unverified`.

## Output Modes

### alignment (default)

Validate product assumptions with the lowest possible cost. Follow the selected specification's visual and interaction recipe. Native HTML/CSS may implement lightweight controls when the interaction proof is honest. Record custom placeholders explicitly and do not claim production component compliance.

### implementation-proof (strict)

Prove a production implementation against the selected runtime profile. Every interactive or component-semantic control must use the documented selected-profile component when one exists. A missing equivalent is reported with the exact behavior gap and containment; a custom imitation cannot pass as profile compliance.

## Stop Conditions

- More than one possible update target or conflicting profile evidence.
- Missing explicit expected version for an update.
- Missing selected runtime capability or `MCP_SCHEMA_MISMATCH`.
- `IDEMPOTENCY_CONFLICT`, `VERSION_CONFLICT`, `TARGET_MISMATCH`, or `CHECKOUT_REQUIRED`.
- `DELIVERY_PARTIAL_FAILURE`: do not retry blindly; read back the exact returned prototype ID first.
- Build, type check, asset, package, or MCP validation failure.
- Authentication, permission, risk, or authorization failure.
- Readback points to a different prototype ID or version.
- The requested action would modify production data outside the named target.
