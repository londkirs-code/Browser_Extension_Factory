import { createWorker } from "tesseract.js";
import { cleanRecognizedText } from "../text.js";

type OcrWorker = Awaited<ReturnType<typeof createWorker>>;
let workerPromise: Promise<OcrWorker> | undefined;

async function getOcrWorker(): Promise<OcrWorker> {
  if (!workerPromise) {
    workerPromise = createWorker("heb+eng", 1, {
      workerPath: browser.runtime.getURL("vendor/ocr/worker.min.js"),
      corePath: browser.runtime.getURL("vendor/ocr/core"),
      langPath: browser.runtime.getURL("vendor/ocr/lang"),
      workerBlobURL: false,
      gzip: true,
      cacheMethod: "none",
    });
    void workerPromise.catch(() => {
      workerPromise = undefined;
    });
  }
  return workerPromise;
}

export async function recognizeImage(imageDataUrl: string): Promise<string> {
  const worker = await getOcrWorker();
  const result = await worker.recognize(imageDataUrl);
  return cleanRecognizedText(result.data.text);
}
