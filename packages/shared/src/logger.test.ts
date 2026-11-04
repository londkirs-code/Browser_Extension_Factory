import { describe, expect, it, vi } from "vitest";
import { createLogger } from "./logger.js";

describe("logger", () => {
  it("does not emit logs when disabled", () => {
    const sink = { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() };
    createLogger({ enabled: false, sink }).info("hidden");
    expect(sink.info).not.toHaveBeenCalled();
  });
  it("emits logs when enabled", () => {
    const sink = { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() };
    createLogger({ enabled: true, sink }).info("visible");
    expect(sink.info).toHaveBeenCalledWith("[Extension]", "visible");
  });
});
