## Summary

Describe the change and the user-visible behavior.

## Affected areas

- [ ] Shared package
- [ ] Extension template / generator
- [ ] One or more extensions
- [ ] Build, validation, or publishing tooling
- [ ] GitHub Actions / security configuration

## Verification

- [ ] `pnpm lint`
- [ ] `pnpm test`
- [ ] `pnpm validate`
- [ ] `pnpm build <extension>` (both Chromium and Firefox)
- [ ] Firefox `web-ext lint` passed
- [ ] No secrets or unnecessary permissions added
- [ ] Documentation and CHANGELOG updated where needed

## Permissions

List every added permission and explain why it is necessary. Broad permissions require a matching entry in extension.config.json.
