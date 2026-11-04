# Reproducible build instructions

This source archive is part of the Browser Extension Factory monorepo.

1. Install Node.js 26 LTS and pnpm 12.
2. Extract the archive to a clean directory.
3. Run `pnpm install --no-frozen-lockfile` from the repository root.
4. Run `pnpm build __SLUG__` to build Chromium and Firefox.
5. Run `pnpm test` and `pnpm validate -- __SLUG__`.

Build output is written to `extensions/__SLUG__/.output/`. Unsigned builds do not require store credentials.
