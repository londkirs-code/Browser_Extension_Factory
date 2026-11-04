import { createLogger } from "@browser-extension-factory/shared";

export default defineBackground(() => {
  const logger = createLogger({ enabled: import.meta.env.MODE !== "production" });
  logger.info("Hello Factory background worker started.");
});
