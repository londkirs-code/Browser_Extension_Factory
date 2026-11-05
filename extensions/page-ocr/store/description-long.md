# Page OCR

Select a rectangular area on the current page and recognize Hebrew or English text with a local OCR engine.

## Features

- Select any visible area by dragging with the mouse.
- Recognize Hebrew and English text, including text inside images.
- Review the recognized text in a result panel.
- Copy the result with one click, or select it and copy manually.
- Run OCR locally with bundled Tesseract.js and language data. Page content is not uploaded to a server.

## How to use

1. Open a page containing the text you want to extract.
2. Click the Page OCR toolbar button.
3. Drag over the text area. Press Esc to cancel.
4. Review the result and click **Copy text**.

The first recognition can take longer while the local OCR engine starts.

## Permissions

The extension uses `activeTab` and `scripting` only after the user clicks its toolbar button, to capture the visible tab and show the selection interface. `clipboardWrite` is used only after the user clicks the copy button. No host permissions are requested.
