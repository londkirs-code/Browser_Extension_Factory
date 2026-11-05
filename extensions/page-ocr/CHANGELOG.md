# Changelog

All notable changes to this extension are documented here.

## [0.1.0] - 2026-11-05

### Fixed

- Report OCR failures with their capture, crop, or recognize stage and the original error name; retain diagnostic stacks in the console.

- Declare the Manifest V3 toolbar action so clicking the extension icon works in Chrome and Firefox.
- Register the Chrome offscreen OCR message handler from the page module and verify that the built Chrome offscreen chunk contains it. Retry message delivery while the offscreen page initializes.
- Explicitly allow local extension workers in the extension-page content security policy for Firefox.

### Added

- Select a visible page area and crop its screenshot locally.
- Recognize Hebrew and English text with a bundled Tesseract.js engine.
- Display OCR results in a localized panel and copy them to the clipboard.
- Provide an error message and a manual-copy fallback when clipboard access is unavailable.
