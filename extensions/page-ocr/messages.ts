export type CaptureResponse = { dataUrl: string } | { error: string };

export type PageOcrMessages = {
  "page-ocr:capture-visible": {
    request: Record<string, never>;
    response: CaptureResponse;
  };
  "page-ocr:recognize": {
    request: { imageDataUrl: string };
    response: { text: string };
  };
  "page-ocr:ready": {
    request: Record<string, never>;
    response: { ready: true };
  };
  "page-ocr:run": {
    request: { imageDataUrl: string };
    response: { text: string };
  };
};
