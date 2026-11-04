# Hello Factory

A small proof-of-concept extension proving that the shared package, WXT setup, localization, storage, and content scripts are wired together.

## Included behavior

- Popup input saved to browser local storage through the shared typed storage helper.
- A small content script scoped only to `https://example.com/*`.
- A minimal background service worker.
- Hebrew and English locale resources with automatic RTL direction for Hebrew.
- Independent version: `0.1.0`.

Run `pnpm build hello-factory` to build both Chrome/Chromium and Firefox targets.
