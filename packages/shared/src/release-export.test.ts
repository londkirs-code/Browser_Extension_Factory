import { describe, expect, it } from "vitest";
import {
  buildReleaseFileName,
  buildReleaseInfo,
  getObsoleteReleaseFiles,
  isExcludedReleaseSlug,
} from "../../../tools/release-export-utils.js";

describe("release export helpers", () => {
  it("builds browser-specific release archive names", () => {
    expect(buildReleaseFileName("page-ocr", "0.1.0", "chrome")).toBe("page-ocr-0.1.0-chrome.zip");
    expect(buildReleaseFileName("page-ocr", "0.1.0", "firefox")).toBe("page-ocr-0.1.0-firefox.zip");
  });

  it("excludes demo and test extensions", () => {
    expect(isExcludedReleaseSlug("hello-factory")).toBe(true);
    expect(isExcludedReleaseSlug("ocr-test-case")).toBe(true);
    expect(isExcludedReleaseSlug("test-sample")).toBe(true);
    expect(isExcludedReleaseSlug("page-ocr")).toBe(false);
  });

  it("plans removal of previous-version files while preserving current files", () => {
    expect(
      getObsoleteReleaseFiles(
        ["page-ocr-0.0.9-chrome.zip", "page-ocr-0.1.0-chrome.zip", "release-info.json"],
        ["page-ocr-0.1.0-chrome.zip", "release-info.json"],
      ),
    ).toEqual(["page-ocr-0.0.9-chrome.zip"]);
  });

  it("builds complete release metadata", () => {
    const info = buildReleaseInfo({
      slug: "page-ocr",
      displayName: "Page OCR",
      version: "0.1.0",
      builtAt: "2026-11-05T08:00:00.000Z",
      commitSha: "abc123",
      files: {
        chrome: { name: "page-ocr-0.1.0-chrome.zip", size: 123, sha256: "a".repeat(64) },
        firefox: { name: "page-ocr-0.1.0-firefox.zip", size: 456, sha256: "b".repeat(64) },
      },
    });

    expect(info).toEqual({
      slug: "page-ocr",
      displayName: "Page OCR",
      version: "0.1.0",
      builtAt: "2026-11-05T08:00:00.000Z",
      commitSha: "abc123",
      files: {
        chrome: { name: "page-ocr-0.1.0-chrome.zip", size: 123, sha256: "a".repeat(64) },
        firefox: { name: "page-ocr-0.1.0-firefox.zip", size: 456, sha256: "b".repeat(64) },
      },
    });
  });
});
