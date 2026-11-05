import {
  createMessenger,
  type RuntimeMessagingApi,
} from "@browser-extension-factory/shared";
import type { PageOcrMessages } from "../../messages.js";
import { recognizeImage } from "../../ocr/engine.js";

export default defineUnlistedScript(() => {
  const messenger = createMessenger<PageOcrMessages>(
    browser.runtime as unknown as RuntimeMessagingApi,
  );
  messenger.on("page-ocr:run", async ({ imageDataUrl }) => ({
    text: await recognizeImage(imageDataUrl),
  }));
});
