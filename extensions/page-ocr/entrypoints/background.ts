import {
  createMessenger,
  type RuntimeMessagingApi,
} from "@browser-extension-factory/shared";
import type { PageOcrMessages } from "../messages.js";

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
});
