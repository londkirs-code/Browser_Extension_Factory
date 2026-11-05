# **DISPLAY_NAME**

**DESCRIPTION**

## Development

Run these commands from the repository root:

- `pnpm dev page-ocr` — Chromium development.
- `pnpm dev:firefox page-ocr` — Firefox development.
- `pnpm build page-ocr` — build both browser targets.
- `pnpm zip page-ocr` — create ZIP packages for both browser families.
- `pnpm validate -- page-ocr` — validate metadata, permissions, icons, and manifests.

The extension version is independent and lives only in this directory's `package.json`. WXT reads that version into both browser manifests. Increment it for each release and add the matching section to `CHANGELOG.md`.
