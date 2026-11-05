import { createMessenger, type RuntimeMessagingApi } from "@browser-extension-factory/shared";
import type { PageOcrMessages } from "../messages.js";

type ChromeOffscreenApi = {
  hasDocument(): Promise<boolean>;
  createDocument(options: {
    url: string;
    reasons: ["WORKERS"];
    justification: string;
  }): Promise<void>;
};

let offscreenPromise: Promise<void> | undefined;

async function ensureOffscreenDocument(): Promise<void> {
  const offscreen = (
    globalThis as typeof globalThis & {
      chrome?: { offscreen?: ChromeOffscreenApi };
    }
  ).chrome?.offscreen;
  if (!offscreen) throw new Error("Chrome offscreen API is unavailable.");

  if (!offscreenPromise) {
    offscreenPromise = (async () => {
      if (!(await offscreen.hasDocument())) {
        await offscreen.createDocument({
          url: "offscreen.html",
          reasons: ["WORKERS"],
          justification: "Run the bundled local OCR engine outside the service worker.",
        });
      }
    })().catch((error: unknown) => {
      offscreenPromise = undefined;
      throw error;
    });
  }
  await offscreenPromise;
}

export default defineBackground(() => {
  const messenger = createMessenger<PageOcrMessages>(
    browser.runtime as unknown as RuntimeMessagingApi,
  );

  browser.action.onClicked.addListener(async (tab) => {
    if (tab.id === undefined) return;
    try {
      await browser.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content-scripts/content.js"],
      });
      await browser.action.setBadgeText({ text: "" });
    } catch {
      await browser.action.setBadgeText({ text: "!" });
      setTimeout(() => {
        void browser.action.setBadgeText({ text: "" });
      }, 2200);
    }
  });

  messenger.on("page-ocr:capture-visible", async () => {
    try {
      return {
        dataUrl: await browser.tabs.captureVisibleTab(undefined, { format: "png" }),
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Unable to capture this tab.",
      };
    }
  });

  messenger.on("page-ocr:recognize", async ({ imageDataUrl }) => {
    if (import.meta.env.BROWSER === "chrome") {
      await ensureOffscreenDocument();
      return messenger.send("page-ocr:run", { imageDataUrl });
    }
    const { recognizeImage } = await import("../ocr/engine.js");
    return { text: await recognizeImage(imageDataUrl) };
  });
});
