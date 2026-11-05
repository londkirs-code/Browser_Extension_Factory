export type SelectionRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export function createSelectionRect(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  viewportWidth: number,
  viewportHeight: number,
): SelectionRect {
  const x1 = Math.min(Math.max(startX, 0), viewportWidth);
  const y1 = Math.min(Math.max(startY, 0), viewportHeight);
  const x2 = Math.min(Math.max(endX, 0), viewportWidth);
  const y2 = Math.min(Math.max(endY, 0), viewportHeight);
  return {
    left: Math.min(x1, x2),
    top: Math.min(y1, y2),
    width: Math.abs(x2 - x1),
    height: Math.abs(y2 - y1),
  };
}

export function isUsableSelection(rect: SelectionRect, minimumSize = 8): boolean {
  return rect.width >= minimumSize && rect.height >= minimumSize;
}

export type ImageCropRect = {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
  outputWidth: number;
  outputHeight: number;
};

export function getImageCropRect(
  selection: SelectionRect,
  imageWidth: number,
  viewportWidth: number,
): ImageCropRect {
  if (viewportWidth <= 0 || imageWidth <= 0) {
    throw new Error("Image and viewport widths must be positive.");
  }
  const scale = imageWidth / viewportWidth;
  const sx = Math.round(selection.left * scale);
  const sy = Math.round(selection.top * scale);
  const sw = Math.max(1, Math.round(selection.width * scale));
  const sh = Math.max(1, Math.round(selection.height * scale));
  const enlargement = sh < 40 ? Math.min(3, Math.ceil(40 / sh)) : 1;
  return {
    sx,
    sy,
    sw,
    sh,
    outputWidth: sw * enlargement,
    outputHeight: sh * enlargement,
  };
}
