import extensionConfig from "../extension.config.json";
import { createLogger } from "@browser-extension-factory/shared";

export default defineContentScript({
  matches: extensionConfig.contentScriptMatches,
  main() {
    const logger = createLogger({ enabled: import.meta.env.MODE !== "production" });
    logger.debug("Content script initialized.");
  },
});
