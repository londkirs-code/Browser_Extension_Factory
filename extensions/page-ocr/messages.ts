import type { SerializedOcrError } from "./errors.js";

export type CaptureResponse = { dataUrl: string } | { error: SerializedOcrError };
export type OcrResponse = { text: string } | { error: SerializedOcrError };

export type PageOcrMessages = {
  "page-ocr:capture-visible": {
    request: Record<string, never>;
    response: CaptureResponse;
  };
  "page-ocr:recognize": {
    request: { imageDataUrl: string };
    response: OcrResponse;
  };
  "page-ocr:run": {
    request: { imageDataUrl: string };
    response: OcrResponse;
  };
};
