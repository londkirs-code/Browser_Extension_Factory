# Page OCR

Select a rectangular area on the visible page, recognize Hebrew and English text locally, and copy the result to the clipboard.

The OCR engine and language data are bundled with the extension. Selected page content is processed locally; no image or text is sent to a remote service.

## Use

1. Open a page that contains text, including text inside an image.
2. Click the Page OCR toolbar icon.
3. Drag over the area to recognize. Press Esc to cancel the selection.
4. Review the recognized text in the result panel.
5. Click **Copy text** to copy it. If clipboard access is unavailable, select the text in the panel and copy it manually.

The first recognition may take a little longer while the local OCR engine initializes.

## Development

Run these commands from the repository root:

- `pnpm dev page-ocr` — Chromium development.
- `pnpm dev:firefox page-ocr` — Firefox development.
- `pnpm build page-ocr` — build both browser targets and run Firefox web-ext lint.
- `pnpm zip page-ocr` — create ZIP packages for both browser families.
- `pnpm validate -- page-ocr` — validate metadata, permissions, icons, and manifests.

The extension version is independent and lives only in this directory's `package.json`. WXT reads that version into both browser manifests. Increment it for each release and add the matching section to `CHANGELOG.md`.

## Privacy and permissions

OCR runs locally using bundled Tesseract.js and Hebrew/English language data. The extension captures the visible tab only after the user selects an area. It does not request host permissions or transmit page content. `activeTab`, `scripting`, and `clipboardWrite` are used for the user-initiated selection, screenshot capture, content-script injection, and copy action.
