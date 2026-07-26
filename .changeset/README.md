# Changesets

This folder holds [changesets](https://github.com/changesets/changesets) — one Markdown
file per set of changes that should ship in a release.

## Cutting a release

1. **Describe your change:** `pnpm changeset`
   Pick a bump (patch / minor / major) and write a one-line summary. This writes a file
   into `.changeset/`. Commit it with your PR.

2. **Apply versions:** `pnpm version-packages`
   Consumes the pending changesets, bumps every `@scottmallin/*` package to the same new
   version (they're a `fixed` group), and updates changelogs. Commit the result.

3. **Publish:** `pnpm release`
   Runs `pnpm -r publish`, which rebuilds each package (`prepack`), rewrites the
   internal `workspace:*` deps to the real version, and pushes to npm. Use pnpm — **not**
   `changeset publish`/`npm publish`, which leave `workspace:*` in the tarball and produce
   packages that can't be installed.

The four published packages — `@scottmallin/core`, `@scottmallin/tokens`,
`@scottmallin/vue`, `@scottmallin/nuxt` — always share a version number. The playground
app and the `eslint-plugin-registry` tooling are `private` and are never published.
