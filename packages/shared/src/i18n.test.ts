import { describe, expect, it, vi } from "vitest";
import { getUiLanguage, localize } from "./i18n.js";

describe("i18n helpers", () => {
  it("returns a translation when available", () => {
    const api = {
      i18n: { getMessage: vi.fn().mockReturnValue("שלום"), getUILanguage: () => "he" },
    };
    expect(localize("title", "Fallback", api)).toBe("שלום");
    expect(getUiLanguage(api)).toBe("he");
  });
  it("uses a fallback for missing messages", () => {
    expect(localize("missing", "Fallback", { i18n: { getMessage: () => "" } })).toBe("Fallback");
  });
});
