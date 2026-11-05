# Changelog

All notable changes to this extension are documented here.

## [0.1.0] - 2026-11-05

### Fixed

- Declare the Manifest V3 toolbar action so clicking the extension icon works in Chrome and Firefox.
- Register the Chrome offscreen OCR message handlers when the page module loads and wait for them to become ready before sending OCR requests.
- Explicitly allow local extension workers in the extension-page content security policy for Firefox.

### Added

- Select a visible page area and crop its screenshot locally.
- Recognize Hebrew and English text with a bundled Tesseract.js engine.
- Display OCR results in a localized panel and copy them to the clipboard.
- Provide an error message and a manual-copy fallback when clipboard access is unavailable.
