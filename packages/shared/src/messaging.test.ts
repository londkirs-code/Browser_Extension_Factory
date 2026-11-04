import { describe, expect, it, vi } from "vitest";
import { createMessenger } from "./messaging.js";

type Messages = { sum: { request: { a: number; b: number }; response: number } };

describe("typed messaging", () => {
  it("sends a message with its typed payload", async () => {
    const sendMessage = vi.fn().mockResolvedValue(7);
    const runtime = { sendMessage, onMessage: { addListener: vi.fn() } };
    const messenger = createMessenger<Messages>(runtime);
    await expect(messenger.send("sum", { a: 3, b: 4 })).resolves.toBe(7);
    expect(sendMessage).toHaveBeenCalledWith({ type: "sum", payload: { a: 3, b: 4 } });
  });
  it("dispatches only matching message types and can unsubscribe", async () => {
    let listener: ((message: unknown, sender: unknown) => unknown) | undefined;
    const removeListener = vi.fn();
    const runtime = {
      sendMessage: vi.fn(),
      onMessage: {
        addListener(value: (message: unknown, sender: unknown) => unknown) { listener = value; },
        removeListener,
      },
    };
    const messenger = createMessenger<Messages>(runtime);
    const handler = vi.fn(({ a, b }: { a: number; b: number }) => a + b);
    const unsubscribe = messenger.on("sum", handler);
    expect(listener?.({ type: "other", payload: { a: 1, b: 2 } }, {})).toBeUndefined();
    expect(listener?.({ type: "sum", payload: { a: 2, b: 5 } }, {})).toBe(7);
    expect(handler).toHaveBeenCalledOnce();
    unsubscribe();
    expect(removeListener).toHaveBeenCalledOnce();
  });
});
