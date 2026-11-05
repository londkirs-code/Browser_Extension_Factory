# Permission disclosures

Keep this file synchronized with `extension.config.json`.

- `activeTab`: access the currently active tab only after the user clicks the extension action; needed to capture its visible screenshot.
- `scripting`: inject the selection interface into the current tab after the user clicks the extension action.
- `clipboardWrite`: copy recognized text after the user clicks the copy button.

No host permissions are requested. OCR uses bundled local code and language data; selected content is not sent to a remote service.
