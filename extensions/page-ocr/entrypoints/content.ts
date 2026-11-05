import {
  createMessenger,
  getUiLanguage,
  localize,
  type RuntimeMessagingApi,
} from "@browser-extension-factory/shared";
import { cropScreenshot } from "../crop.js";
import { createSelectionRect, isUsableSelection } from "../geometry.js";
import type { PageOcrMessages } from "../messages.js";

type PageWindow = Window & { __pageOcrSelectionActive?: boolean };

function showResult(
  text: string,
  rtl: boolean,
  message: string,
  labels: {
    title: string;
    copy: string;
    copied: string;
    copyFailed: string;
    close: string;
  },
): void {
  document.getElementById("page-ocr-result-host")?.remove();
  const host = document.createElement("div");
  host.id = "page-ocr-result-host";
  host.style.cssText = "all:initial;position:fixed;inset:0;z-index:2147483647;pointer-events:none;";
  const shadow = host.attachShadow({ mode: "closed" });
  shadow.innerHTML = `
    <style>
      .panel {
        position: fixed; right: 20px; bottom: 20px; width: min(460px, calc(100vw - 40px));
        max-height: min(70vh, 620px); box-sizing: border-box; padding: 16px;
        display: flex; flex-direction: column; gap: 12px; pointer-events: auto;
        color: #172033; background: #fff; border: 1px solid #d9dfeb;
        border-radius: 12px; box-shadow: 0 12px 40px rgba(0,0,0,.24);
        font: 14px/1.5 system-ui, sans-serif;
      }
      .header { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
      .title { margin: 0; font-size: 16px; font-weight: 700; }
      .close { border: 0; background: transparent; color: #536078; font-size: 22px; cursor: pointer; }
      .message { margin: 0; color: #536078; white-space: pre-wrap; overflow-wrap: anywhere; }
      textarea {
        box-sizing: border-box; width: 100%; min-height: 130px; max-height: 42vh;
        resize: vertical; padding: 10px; border: 1px solid #c8d0df; border-radius: 8px;
        color: #172033; background: #fff; font: 14px/1.6 system-ui, sans-serif;
      }
      .actions { display: flex; align-items: center; gap: 10px; }
      .copy {
        border: 0; border-radius: 8px; padding: 9px 14px; background: #1769e0;
        color: white; font: 600 14px system-ui, sans-serif; cursor: pointer;
      }
      .status { color: #536078; font-size: 12px; }
      button:focus-visible, textarea:focus-visible { outline: 3px solid #80b5ff; outline-offset: 2px; }
    </style>
    <section class="panel" role="dialog" aria-modal="false" aria-labelledby="page-ocr-title">
      <div class="header">
        <h2 class="title" id="page-ocr-title"></h2>
        <button class="close" type="button" aria-label="Close">×</button>
      </div>
      <p class="message"></p>
      <textarea readonly spellcheck="false"></textarea>
      <div class="actions">
        <button class="copy" type="button"></button>
        <span class="status" role="status" aria-live="polite"></span>
      </div>
    </section>
  `;
  const panel = shadow.querySelector<HTMLElement>(".panel")!;
  const title = shadow.querySelector<HTMLHeadingElement>(".title")!;
  const messageElement = shadow.querySelector<HTMLParagraphElement>(".message")!;
  const output = shadow.querySelector<HTMLTextAreaElement>("textarea")!;
  const copyButton = shadow.querySelector<HTMLButtonElement>(".copy")!;
  const closeButton = shadow.querySelector<HTMLButtonElement>(".close")!;
  const status = shadow.querySelector<HTMLSpanElement>(".status")!;
  panel.dir = rtl ? "rtl" : "ltr";
  title.textContent = labels.title;
  messageElement.textContent = message;
  output.value = text;
  output.dir = rtl ? "rtl" : "ltr";
  copyButton.textContent = labels.copy;
  closeButton.textContent = "×";
  closeButton.setAttribute("aria-label", labels.close);
  copyButton.disabled = !text;
  copyButton.style.opacity = text ? "1" : ".5";
  copyButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(output.value);
      status.textContent = labels.copied;
    } catch {
      output.focus();
      output.select();
      status.textContent = labels.copyFailed;
    }
  });
  closeButton.addEventListener("click", () => host.remove());
  document.documentElement.append(host);
}

export default defineContentScript({
  registration: "runtime",
  matches: [],
  main() {
    const pageWindow = window as PageWindow;
    if (pageWindow.__pageOcrSelectionActive) return;
    pageWindow.__pageOcrSelectionActive = true;

    const messenger = createMessenger<PageOcrMessages>(
      browser.runtime as unknown as RuntimeMessagingApi,
    );
    const language = getUiLanguage().toLowerCase();
    const rtl = language.startsWith("he");
    const labels = {
      title: localize("resultTitle", "Recognized text"),
      copy: localize("copyText", "Copy text"),
      copied: localize("copied", "Copied to clipboard"),
      copyFailed: localize("copyFailed", "Select the text and copy it manually."),
      close: localize("close", "Close"),
    };
    const host = document.createElement("div");
    host.style.cssText =
      "all:initial;position:fixed;inset:0;z-index:2147483647;pointer-events:auto;";
    const shadow = host.attachShadow({ mode: "closed" });
    shadow.innerHTML = `
      <style>
        :host { all: initial; }
        .shade {
          position: fixed; inset: 0; cursor: crosshair;
          background: rgba(12, 16, 24, .16);
          touch-action: none; user-select: none;
        }
        .selection {
          position: fixed; display: none; box-sizing: border-box;
          border: 2px solid #fff; outline: 1px solid #1769e0;
          background: rgba(45, 120, 230, .12);
          box-shadow: 0 0 0 99999px rgba(12, 16, 24, .2);
        }
        .hint {
          position: fixed; top: 18px; left: 50%; transform: translateX(-50%);
          max-width: calc(100vw - 32px); padding: 9px 14px;
          border-radius: 8px; background: #172033; color: white;
          font: 14px/1.4 system-ui, sans-serif; direction: ltr;
          box-shadow: 0 4px 18px rgba(0,0,0,.25); white-space: nowrap;
        }
      </style>
      <div class="shade">
        <div class="hint"></div>
        <div class="selection"></div>
      </div>
    `;
    const shade = shadow.querySelector<HTMLDivElement>(".shade")!;
    const selectionElement = shadow.querySelector<HTMLDivElement>(".selection")!;
    const hint = shadow.querySelector<HTMLDivElement>(".hint")!;
    hint.textContent = localize("selectArea", "Drag to select an area. Press Esc to cancel.");
    hint.dir = rtl ? "rtl" : "ltr";
    document.documentElement.append(host);

    let startX = 0;
    let startY = 0;
    let dragging = false;
    let finished = false;

    const cleanup = () => {
      if (finished) return;
      finished = true;
      window.removeEventListener("keydown", onKeyDown, true);
      host.remove();
      pageWindow.__pageOcrSelectionActive = false;
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") cleanup();
    };

    const drawSelection = (x: number, y: number) => {
      const rect = createSelectionRect(startX, startY, x, y, window.innerWidth, window.innerHeight);
      selectionElement.style.display = "block";
      selectionElement.style.left = `${rect.left}px`;
      selectionElement.style.top = `${rect.top}px`;
      selectionElement.style.width = `${rect.width}px`;
      selectionElement.style.height = `${rect.height}px`;
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0 || finished) return;
      event.preventDefault();
      startX = event.clientX;
      startY = event.clientY;
      dragging = true;
      shade.setPointerCapture(event.pointerId);
      drawSelection(startX, startY);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!dragging || finished) return;
      event.preventDefault();
      drawSelection(event.clientX, event.clientY);
    };

    const onPointerUp = async (event: PointerEvent) => {
      if (!dragging || finished) return;
      event.preventDefault();
      dragging = false;
      const rect = createSelectionRect(
        startX,
        startY,
        event.clientX,
        event.clientY,
        window.innerWidth,
        window.innerHeight,
      );
      cleanup();
      if (!isUsableSelection(rect)) return;

      try {
        await new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        );
        const capture = await messenger.send("page-ocr:capture-visible", {});
        if ("error" in capture) throw new Error(capture.error);
        const croppedImage = await cropScreenshot(capture.dataUrl, rect);
        const result = await messenger.send("page-ocr:recognize", {
          imageDataUrl: croppedImage,
        });
        showResult(
          result.text,
          rtl,
          result.text ? "" : localize("noText", "No readable text was found in that area."),
          labels,
        );
      } catch (error) {
        const detail = error instanceof Error ? error.message : String(error);
        showResult(
          "",
          rtl,
          `${localize("ocrFailed", "OCR failed")}: ${detail}`,
          labels,
        );
      }
    };

    shade.addEventListener("pointerdown", onPointerDown);
    shade.addEventListener("pointermove", onPointerMove);
    shade.addEventListener("pointerup", onPointerUp);
    shade.addEventListener("pointercancel", cleanup);
    window.addEventListener("keydown", onKeyDown, true);
  },
});
