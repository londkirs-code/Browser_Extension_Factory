# AGENTS.md — Browser Extension Factory

This file is the operational contract for every AI model and developer working in this repository. Read it before changing code.

## Mission and architecture

This repository is a TypeScript pnpm-workspace monorepo for Manifest V3 extensions. Every extension must build for both Chromium (Chrome, Edge, and compatible browsers) and Firefox. WXT owns the browser-specific build and manifest generation.

- `extensions/<slug>/`: an independently versioned extension, with its own WXT config, entrypoints, locales, store copy, and changelog.
- `packages/shared/`: typed reusable browser APIs and utilities. Prefer it over reimplementing common behavior.
- `templates/basic-extension/`: source template used by the generator. Keep it buildable.
- `tools/`: extension generator, icon generator, CLI, validation, source packaging, signing, publishing, release notes, and changed-extension detection.
- `.github/workflows/`: CI, tagged release, manually approved store publishing, and CodeQL.
- `docs/`: human-facing setup, generation, publishing, and store submission instructions.
- `AGENTS.md`: this document.

There is no hand-maintained root `manifest.json`. WXT generates one manifest per browser from `wxt.config.ts` and `extension.config.json`.

## First action in a new extension task

1. Read this file, the root README, and the target extension's README, config, and CHANGELOG.
2. Run `pnpm new` and complete the generator, or use the existing target extension if it already exists.
3. Implement only the feature-specific logic inside that extension's `entrypoints/` and its own modules.
4. Put reusable browser, storage, messaging, i18n, logging, error, and options code in `packages/shared/`.
5. Update the extension README, CHANGELOG, and store disclosures when behavior or permissions change.
6. Build and validate both browsers before committing.

The generator creates `extensions/<slug>/`, a unique Gecko ID, placeholder PNG icons, English/Hebrew locale files, store copy, and selected entrypoints. It then runs `pnpm install --no-frozen-lockfile` so the new workspace is ready to build.

**Lockfile rule (mandatory):** after every `pnpm new` run or any dependency change in a local development workflow, include the updated root `pnpm-lock.yaml` in the same Git commit as that generator/dependency change. Before pushing, run `pnpm install --frozen-lockfile` and confirm it exits successfully.

**Factory Agent exception:** when working on a `factory/**` branch without shell access, the Factory Agent workflow is the authorized lockfile automation path. It runs `pnpm install --no-frozen-lockfile`, commits the synchronized lockfile and generated report to the branch, and then verifies `pnpm install --frozen-lockfile`. Do not require a separate manual lockfile approval or commit for that workflow.

## Commands

Run from repository root:

- `pnpm install`
- `pnpm new`
- `pnpm dev <slug>` — Chrome/Chromium development mode.
- `pnpm dev:firefox <slug>` — Firefox development mode.
- `pnpm build <slug>` — build both browsers, validate both generated manifests, and run Firefox web-ext lint.
- `pnpm build:all` — build every extension for both browsers.
- `pnpm zip <slug>` — produce separate Chromium and Firefox ZIPs plus a reproducible source ZIP.
- `pnpm lint`, `pnpm test`, `pnpm audit`, `pnpm validate`, `pnpm validate:workflows`.
- `pnpm sign:firefox <slug> --channel unlisted` — signed XPI for self-distribution.
- `pnpm sign:firefox <slug> --channel listed` — AMO public listing submission, including source and first-listing metadata.
- `pnpm publish:chrome <slug>` — Chrome Web Store API v2 upload and publish.
- `pnpm publish:firefox <slug>` — listed Firefox submission.

## Non-negotiable compatibility rules

- Never ship a new extension for only one browser. Build Chrome/Chromium **and** Firefox unless the user explicitly requests an exception.
- Always check the actual generated `.output/chrome-mv3/manifest.json` and `.output/firefox-mv3/manifest.json`.
- Use the browser-independent promise API from `@browser-extension-factory/shared`; do not scatter direct `chrome.*` and `browser.*` calls through UI code.
- Store persistent user data through the typed storage helper, with defaults and a schema version. Add a migration for each schema version change.
- Define typed messages between background/content/popup rather than untyped ad-hoc objects.
- Use the i18n helper and locale resources. For Hebrew, set document direction to RTL.
- Keep the extension version in its own `package.json`; that value is the single source of truth for the generated manifest. Bump it for every release and add the same version to `CHANGELOG.md`.
- Never copy one extension's Gecko ID or Chrome Store ID into another extension.

## Security and permissions

- Start with no API or host permissions. Add only what a feature demonstrably needs.
- Prefer `optional_permissions` and `optional_host_permissions` when access can be requested at the point of use.
- Do not add `<all_urls>`, `tabs`, `debugger`, broad host patterns, or other sensitive permissions without explicit user-visible need and a non-empty justification in `extension.config.json`.
- Keep `store/permissions.md` synchronized with the configuration.
- Keep extension-page CSP strict. No `eval`, `new Function`, remote executable code, inline scripts, or remote script imports.
- Do not commit tokens, OAuth credentials, private keys, signing credentials, or local `.env` files. Use GitHub Actions Secrets and environment variables only.
- Do not weaken validators, lint, CSP, or workflow permissions to make a build pass. Find and fix the underlying issue.
- Keep `pnpm-workspace.yaml` security overrides reviewed and minimal. The current `minimatch` override enforces the first patched release range for GHSA-g3hv-75wg-m249. Because `web-ext` resolves `multimatch@6.0.0` with a removed minimatch default import, pin that dependency to compatible `multimatch@8.0.0` in `pnpm-workspace.yaml`.
- The only current audit exception is GHSA-gcqx-w48m-w2h4 for unpatched, build-only `deepmerge` pulled in by `web-ext > addons-linter`. Its rationale is documented beside the ignore entry in `pnpm-workspace.yaml` and in `docs/setup.md`. Remove it when upstream publishes a fix.

## Dependency build-script automation

The Factory Agent workflow discovers pnpm lifecycle scripts before installation. It automatically allows a build script only when the package is a direct dependency declared in a workspace `package.json`, using `tools/approve-direct-builds.ts`. This removes the need for a separate user approval for ordinary direct dependency additions. Unknown transitive build scripts remain blocked and must be reviewed and explicitly listed in `pnpm-workspace.yaml` under `allowBuilds`; never enable all dependency build scripts globally.

## Shared package expectations

Use `packages/shared` for:

- browser/chrome compatibility and promise-based messaging;
- typed storage defaults and migrations;
- typed runtime messages;
- localized strings and UI language;
- production-disabled logger;
- safe error normalization;
- options models based on typed schemas.

Add or update Vitest tests for shared behavior. Extension-specific behavior belongs with that extension and should have focused tests where practical.

## Required checks before every commit

Run and address failures from:

1. `pnpm lint`
2. `pnpm test`
3. `pnpm audit` — the one documented deepmerge advisory is the only allowed temporary exception.
4. `pnpm validate`
5. `pnpm build <slug>` — this always means both target browsers.
6. Confirm Firefox `web-ext lint` passes; this is part of the build command.
7. If workflows changed, run `pnpm validate:workflows`.

Never claim a check passed unless its command actually ran and returned success. Record any check that could not be run and why.

## Changes and commits

- Return full files, never partial snippets or ellipses.
- Keep each change focused and make one commit per logical stage. Commit subjects must be clear English conventional commits.
- Update docs and CHANGELOG with behavior changes.
- Do not touch `tools/`, `.github/workflows/`, root package configuration, or the factory/template infrastructure without telling the user first and explaining why.
- Do not check build output, generated XPI/ZIP files, node_modules, or local secrets into Git.
- Inspect existing source before editing; preserve unrelated user changes.

## Signing and publishing

- Firefox signing uses AMO JWT secrets mapped to `WEB_EXT_API_KEY` and `WEB_EXT_API_SECRET` by the CLI.
- `unlisted` creates a signed XPI for self-distribution.
- `listed` submits to AMO and includes a clean source archive and `store/amo-metadata.json`.
- Chrome distribution uses Chrome Web Store API v2. A publisher ID is required along with OAuth client credentials.
- Store publishing is always a manual workflow with explicit confirmation and the `store-publishing` GitHub Environment. Never add automatic store publication to push or tag events.
- Do not create a local CRX workflow by default. Chrome Web Store distribution is the standard route; discuss enterprise-only CRX needs with the user before adding anything.

## Release convention

Tags use `<extension-slug>-v<semver>`, for example `hello-factory-v1.2.0`. The release workflow builds both browsers, runs validation, signs Firefox as unlisted, and attaches the Chromium ZIP, Firefox ZIP, signed XPI, and source ZIP to a GitHub Release. Store publication is a separate manual action.

## When the execution environment is limited

If shell or network access is unavailable, say so. Do not imply tests or builds ran. Push only reviewed complete files, let GitHub Actions execute the checks, inspect its status and logs, then make corrective commits for real failures.

## Factory Agent workflow

When shell access is unavailable, create a branch named `factory/<topic>`. Every push to that branch runs `tools/factory-run.ts` through GitHub Actions. Read `.factory/report.md` from the same branch to inspect the results. Request a new extension in `.factory/requests/<slug>.json`. This workflow does not run on `main` and never publishes extensions to browser stores.
