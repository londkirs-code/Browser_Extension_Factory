# Permission disclosures

- `storage`: saves the text value entered by the user in the popup.
- `https://example.com/*`: required only for the demonstration content script, which adds a data attribute to the page root.

No `tabs`, `<all_urls>`, debugger, or broad network permissions are requested.


## Firefox data collection disclosure

The extension declares `required: ["none"]` and no optional data categories. It does not collect or transmit user data outside the extension.
