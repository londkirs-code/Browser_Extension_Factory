import { describe, expect, it, vi } from "vitest";
import { createStorage, type StorageArea } from "./index.js";

function memoryArea(initial: Record<string, unknown> = {}) {
  const values = { ...initial };
  const area: StorageArea = {
    async get() {
      return { ...values };
    },
    async set(items) {
      Object.assign(values, items);
    },
    async remove(keys) {
      for (const key of Array.isArray(keys) ? keys : [keys]) delete values[key];
    },
  };
  return { area, values };
}

describe("typed storage", () => {
  it("returns defaults and persists changes", async () => {
    const { area, values } = memoryArea();
    const storage = createStorage(area, { defaults: { count: 0, label: "ready" }, version: 1 });
    await expect(storage.get("count")).resolves.toBe(0);
    await storage.set("count", 4);
    await expect(storage.getAll()).resolves.toEqual({ count: 4, label: "ready" });
    expect(values.count).toBe(4);
  });
  it("runs the migration for each new schema version", async () => {
    const migrate = vi.fn((state: { count: number; label: string }) => ({
      ...state,
      label: "migrated",
    }));
    const { area } = memoryArea({ count: 2, __browser_extension_factory_storage_version: 1 });
    const storage = createStorage(area, {
      defaults: { count: 0, label: "default" },
      version: 2,
      migrations: { 2: migrate },
    });
    await expect(storage.get("label")).resolves.toBe("migrated");
    expect(migrate).toHaveBeenCalledOnce();
  });
  it("resets data to declared defaults", async () => {
    const { area } = memoryArea({ count: 9 });
    const storage = createStorage(area, { defaults: { count: 0 }, version: 1 });
    await storage.set("count", 5);
    await storage.reset();
    await expect(storage.get("count")).resolves.toBe(0);
  });
});
