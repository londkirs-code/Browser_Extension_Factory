import { createLogger } from "@browser-extension-factory/shared";

export default defineBackground(() => {
  const logger = createLogger({ enabled: import.meta.env.MODE !== "production" });
  logger.info("Background service worker started.");
});
