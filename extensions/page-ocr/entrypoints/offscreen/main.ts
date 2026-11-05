import { createMessenger, type RuntimeMessagingApi } from "@browser-extension-factory/shared";
import type { PageOcrMessages } from "../../messages.js";
import { recognizeImage } from "../../ocr/engine.js";

const messenger = createMessenger<PageOcrMessages>(
  browser.runtime as unknown as RuntimeMessagingApi,
);

// This module is loaded by offscreen/index.html, so register listeners at module
// evaluation time. defineUnlistedScript is for scripts injected by an extension,
// not modules imported by an extension page.
messenger.on("page-ocr:ready", () => ({ ready: true }));
messenger.on("page-ocr:run", async ({ imageDataUrl }) => ({
  text: await recognizeImage(imageDataUrl),
}));
