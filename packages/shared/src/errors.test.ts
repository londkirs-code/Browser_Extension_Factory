import { describe, expect, it, vi } from "vitest";
import { errorMessage, runSafely, toError } from "./errors.js";

describe("error helpers", () => {
  it("normalizes unknown values", () => {
    expect(toError("failed").message).toBe("failed");
    expect(errorMessage({ code: 4 })).toBe('{"code":4}');
  });

  it("returns the fallback and reports failures", async () => {
    const onError = vi.fn();
    await expect(
      runSafely(
        () => {
          throw new Error("bad");
        },
        "safe",
        onError,
      ),
    ).resolves.toBe("safe");
    expect(onError).toHaveBeenCalledOnce();
  });
});
