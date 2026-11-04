# Reproducible build instructions

1. Install Node.js 26 LTS and pnpm 12.
2. From the monorepo root, run `pnpm install --no-frozen-lockfile`.
3. Run `pnpm build hello-factory`.
4. Run `pnpm test` and `pnpm validate -- hello-factory`.

The generated Chrome and Firefox builds are written to `extensions/hello-factory/.output/`. No signing credentials are needed for unsigned builds.
