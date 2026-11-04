import { describe, expect, it, vi } from "vitest";
import { asPromise, resolveExtensionApi, sendRuntimeMessage } from "./browser.js";

describe("browser compatibility helpers", () => {
  it("prefers the promise-based browser API when available", () => {
    const browser = { runtime: {} };
    expect(resolveExtensionApi({ browser, chrome: { runtime: {} } })).toBe(browser);
  });
  it("falls back to the Chrome API", () => {
    const chrome = { runtime: {} };
    expect(resolveExtensionApi({ chrome })).toBe(chrome);
  });
  it("normalizes synchronous values to promises", async () => {
    await expect(asPromise("ok")).resolves.toBe("ok");
  });
  it("sends a typed runtime message and returns its response", async () => {
    const sendMessage = vi.fn().mockResolvedValue({ ok: true });
    await expect(sendRuntimeMessage({ kind: "ping" }, { runtime: { sendMessage } })).resolves.toEqual({ ok: true });
    expect(sendMessage).toHaveBeenCalledWith({ kind: "ping" });
  });
});
