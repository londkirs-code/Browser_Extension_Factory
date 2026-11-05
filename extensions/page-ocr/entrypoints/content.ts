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
          font: 14px/1.4 system-ui, sans-serif; direction: ${rtl ? "rtl" : "ltr"};
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
        await messenger.send("page-ocr:recognize", { imageDataUrl: croppedImage });
      } catch (error) {
        console.error("[Page OCR]", error);
      }
    };

    shade.addEventListener("pointerdown", onPointerDown);
    shade.addEventListener("pointermove", onPointerMove);
    shade.addEventListener("pointerup", onPointerUp);
    shade.addEventListener("pointercancel", cleanup);
    window.addEventListener("keydown", onKeyDown, true);
  },
});
