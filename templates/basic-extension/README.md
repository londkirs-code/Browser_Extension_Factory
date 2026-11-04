# **DISPLAY_NAME**

**DESCRIPTION**

## Development

Run these commands from the repository root:

- `pnpm dev __SLUG__` — Chromium development.
- `pnpm dev:firefox __SLUG__` — Firefox development.
- `pnpm build __SLUG__` — build both browser targets.
- `pnpm zip __SLUG__` — create ZIP packages for both browser families.
- `pnpm validate -- __SLUG__` — validate metadata, permissions, icons, and manifests.

The extension version is independent and lives only in this directory's `package.json`. WXT reads that version into both browser manifests. Increment it for each release and add the matching section to `CHANGELOG.md`.
