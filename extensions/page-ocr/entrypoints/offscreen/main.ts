import { browser } from "wxt/browser";
import { createMessenger, type RuntimeMessagingApi } from "@browser-extension-factory/shared";
import type { PageOcrMessages } from "../../messages.js";
import { serializeError } from "../../errors.js";
import { recognizeImage } from "../../ocr/engine.js";

const messenger = createMessenger<PageOcrMessages>(
  browser.runtime as unknown as RuntimeMessagingApi,
);

messenger.on("page-ocr:run", async ({ imageDataUrl }) => {
  try {
    return { text: await recognizeImage(imageDataUrl) };
  } catch (error) {
    return { error: serializeError(error) };
  }
});
