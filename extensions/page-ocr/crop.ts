import { getImageCropRect, type SelectionRect } from "./geometry.js";

export async function cropScreenshot(dataUrl: string, selection: SelectionRect): Promise<string> {
  const image = new Image();
  image.src = dataUrl;
  await image.decode();

  const crop = getImageCropRect(selection, image.naturalWidth, window.innerWidth);
  const sourceWidth = Math.min(crop.sw, image.naturalWidth - crop.sx);
  const sourceHeight = Math.min(crop.sh, image.naturalHeight - crop.sy);
  if (sourceWidth <= 0 || sourceHeight <= 0) {
    throw new Error("The selected area is outside the captured viewport.");
  }

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round((crop.outputWidth / crop.sw) * sourceWidth));
  canvas.height = Math.max(1, Math.round((crop.outputHeight / crop.sh) * sourceHeight));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not prepare the selected image.");

  context.filter = "grayscale(1)";
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(
    image,
    crop.sx,
    crop.sy,
    sourceWidth,
    sourceHeight,
    0,
    0,
    canvas.width,
    canvas.height,
  );
  return canvas.toDataURL("image/png");
}
