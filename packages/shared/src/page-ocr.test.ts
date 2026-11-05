import { describe, expect, it } from "vitest";
import {
  createSelectionRect,
  getImageCropRect,
  isUsableSelection,
} from "../../../extensions/page-ocr/geometry.js";
import { cleanRecognizedText } from "../../../extensions/page-ocr/text.js";

describe("Page OCR geometry", () => {
  it("normalizes a drag in every direction", () => {
    expect(createSelectionRect(90, 80, 10, 20, 100, 100)).toEqual({
      left: 10,
      top: 20,
      width: 80,
      height: 60,
    });
  });

  it("clamps selection coordinates to the viewport", () => {
    expect(createSelectionRect(-5, 10, 120, 110, 100, 100)).toEqual({
      left: 0,
      top: 10,
      width: 100,
      height: 90,
    });
  });

  it("rejects selections smaller than eight CSS pixels", () => {
    expect(isUsableSelection({ left: 0, top: 0, width: 7, height: 20 })).toBe(false);
    expect(isUsableSelection({ left: 0, top: 0, width: 8, height: 8 })).toBe(true);
  });

  it("scales a crop by the screenshot-to-viewport width ratio", () => {
    expect(getImageCropRect({ left: 10, top: 20, width: 50, height: 60 }, 2000, 1000)).toEqual({
      sx: 20,
      sy: 40,
      sw: 100,
      sh: 120,
      outputWidth: 100,
      outputHeight: 120,
    });
  });

  it("enlarges short crops by no more than three times", () => {
    expect(getImageCropRect({ left: 0, top: 0, width: 30, height: 10 }, 1000, 1000)).toMatchObject({
      outputWidth: 90,
      outputHeight: 30,
    });
  });
});

describe("Page OCR text cleanup", () => {
  it("trims lines, collapses excess blank lines, and removes bidi controls", () => {
    expect(cleanRecognizedText("  שלום\u200f  \r\n\r\n\r\n  world  ")).toBe("שלום\n\nworld");
  });

  it("returns an empty string for whitespace-only OCR output", () => {
    expect(cleanRecognizedText(" \n \u202e ")).toBe("");
  });
});
