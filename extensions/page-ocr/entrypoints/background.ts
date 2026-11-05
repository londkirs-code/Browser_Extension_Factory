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

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export default defineBackground(() => {
  const messenger = createMessenger<PageOcrMessages>(
    browser.runtime as unknown as RuntimeMessagingApi,
  );

  let offscreenPromise: Promise<void> | undefined;

  const ensureOffscreenDocument = async (): Promise<void> => {
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

        // createDocument() can resolve before the page's module has registered
        // its message listeners. Wait for an explicit ready response instead
        // of sending the OCR request into an uninitialized document.
        let lastError: unknown;
        for (let attempt = 0; attempt < 40; attempt += 1) {
          try {
            const response = await messenger.send("page-ocr:ready", {});
            if (response.ready) return;
          } catch (error) {
            lastError = error;
          }
          await delay(100);
        }

        const detail = lastError instanceof Error ? `: ${lastError.message}` : "";
        throw new Error(`OCR offscreen document did not become ready${detail}`);
      })().catch((error: unknown) => {
        offscreenPromise = undefined;
        throw error;
      });
    }

    await offscreenPromise;
  };

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
