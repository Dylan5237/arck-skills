# Fuxi Adapter Contract

This is the single platform contract for Fuxi-compatible prototype output. It is independent of the selected design specification and runtime profile.

## Supported Runtime Shapes

- `vite-vue3`: build before packaging; prefer a built `dist/` entry.
- `static-html`: package the source entry directly; no framework server is required.
- `vite-react`: allowed only when the selected specification explicitly supports it.

## Build And Entry

- Vite projects must set `base: './'`.
- Build and type validation must finish before packaging; upload must not hide an unverified build.
- Recognized entries are `dist/index.html`, `build/index.html`, `index.html`, and `public/index.html`.
- When `dist/` exists, package its contents at the ZIP root and preserve the root `README.md`.
- Static assets must use relative paths and must not depend on a private CDN, local absolute path, development server, or developer-machine state at preview time.

## Package Rules

- Keep the ZIP below `100 MB`.
- Exclude `node_modules/`, `src/`, `.git/`, `.svn/`, `.venv/`, tests, coverage, uploads, data, repos, local databases, `.npmrc`, environment files, credentials, logs, and caches.
- Reject path traversal, invalid ZIP structure, missing entry files, and HTML references to source-only paths.
- `node_modules/` and `src/` are hard failures; other forbidden residue must be excluded or reported according to the platform validator.

## README Handoff

Every generated prototype README must include:

```yaml
prototype_spec: <selected-spec>
runtime: <selected-runtime>
runtime_profile: <selected-profile>
fuxi_adapter: fuxi-prototype
entry_file: <entry-file>
```

It must also describe purpose, pages, interactions, runtime/build steps, known limitations, and external dependencies. Never include credentials or private registry configuration.

## Validation Order

1. Build/type validation defined by the generated project.
2. `validate_project` against the project directory.
3. `pack_project` to produce the ZIP.
4. `validate_zip` against the exact ZIP.
5. Upload only when all prior steps pass.
