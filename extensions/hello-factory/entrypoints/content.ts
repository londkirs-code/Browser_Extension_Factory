import { createLogger } from "@browser-extension-factory/shared";

export default defineContentScript({
  matches: ["https://example.com/*"],
  main() {
    document.documentElement.dataset.helloFactory = "loaded";
    createLogger({ enabled: import.meta.env.MODE !== "production" }).debug("Hello Factory content script loaded.");
  },
});
