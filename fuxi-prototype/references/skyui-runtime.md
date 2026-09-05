# SkyUI Runtime

## Optional Runtime Contract

- Use Vue `>=3.2.0`, TypeScript, and Vite.
- Use `@sky/sky-ui >=2.1.145` unless the target project's locked version and its bundled docs establish another approved compatibility baseline.
- Resolve component facts from the target project's `node_modules/@sky/sky-ui/dist/skill-docs` through the bundled deterministic query tool.
- This reference applies only after `vue3-skyui` has been explicitly selected or uniquely detected in the existing project.
- Do not replace an explicitly selected SkyUI profile with Element Plus, Ant Design Vue, Arco Design, Naive UI, or another public component library.
- For a new SkyUI project, start from `assets/vue3-skyui-starter/`. It pins the verified versions and is intended to be copied as an output resource, not loaded into model context.

## Query Gate

Use the bundled CLI with the target application directory:

```text
node <skill-dir>/scripts/sky-ui-docs/run.mjs --project-dir <project-dir> list
node <skill-dir>/scripts/sky-ui-docs/run.mjs --project-dir <project-dir> <component> examples
node <skill-dir>/scripts/sky-ui-docs/run.mjs --project-dir <project-dir> <component> example <section>
node <skill-dir>/scripts/sky-ui-docs/run.mjs --project-dir <project-dir> <component> api
node <skill-dir>/scripts/sky-ui-docs/run.mjs --project-dir <project-dir> <component> api <section>
node <skill-dir>/scripts/sky-ui-docs/run.mjs --project-dir <project-dir> icon search <keyword>
```

Before coding each component:

1. List or resolve the component from real SkyUI docs.
2. Query relevant examples and the selected example body.
3. Query API sections and every API section used by the implementation.
4. Resolve icons through the icon query instead of guessing names.
5. Record a compact lookup summary for implementation evidence.

If the bundled query executable is absent or fails its version/docs checks, stop with `SKYUI_DOCS_UNAVAILABLE`; do not require the user to invoke a second Skill. Missing SkyUI packages are not installed implicitly by the query command; an explicitly authorized setup step may install the pinned dependency before retrying.

The bundled query implementation is adapted from internal `sky-web-skill/sky-ui-docs` commit `92dc88a`. Keep its deterministic query behavior covered by the bundled Node tests when changing it.

## Dependency Safety

- The internal npm registry is a build-time dependency only.
- Do not overwrite an existing project registry configuration without showing the required change.
- Do not automatically upgrade an existing SkyUI dependency merely because docs are missing.
- Exclude `.npmrc`, `node_modules`, registry details, caches, and package-manager credentials from Fuxi packages.
- With pnpm 11, allow required dependency build scripts through the narrow `allowBuilds` map in `pnpm-workspace.yaml`; never enable `dangerouslyAllowAllBuilds`.

## Asset Verification

Verify the production build contains and resolves SkyUI CSS, SVG iconfont JavaScript, iconfont CSS, and fonts locally. A prototype that requires the internal registry, a private CDN, a development server, or an absolute local path at preview time is invalid.
