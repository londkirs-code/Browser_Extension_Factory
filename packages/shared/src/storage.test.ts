import { describe, expect, it, vi } from "vitest";
import {
  createStorage,
  type StorageArea,
  type StorageChange,
  type StorageChangeEvent,
} from "./index.js";

function memoryArea(initial: Record<string, unknown> = {}) {
  const values = { ...initial };
  const listeners = new Set<
    (changes: Record<string, StorageChange>, areaName: string) => void
  >();
  const changes: StorageChangeEvent = {
    addListener(listener) {
      listeners.add(listener);
    },
    removeListener(listener) {
      listeners.delete(listener);
    },
  };
  const emit = (items: Record<string, unknown>) => {
    const changed: Record<string, StorageChange> = {};
    for (const [key, value] of Object.entries(items)) {
      changed[key] = { oldValue: values[key], newValue: value };
      values[key] = value;
    }
    for (const listener of listeners) listener(changed, "local");
  };
  const area: StorageArea = {
    async get() {
      return { ...values };
    },
    async set(items) {
      emit(items);
    },
    async remove(keys) {
      const removed = Array.isArray(keys) ? keys : [keys];
      const changed: Record<string, StorageChange> = {};
      for (const key of removed) {
        changed[key] = { oldValue: values[key] };
        delete values[key];
      }
      for (const listener of listeners) listener(changed, "local");
    },
  };
  return {
    area,
    values,
    changes,
    externalSet(items: Record<string, unknown>) {
      emit(items);
    },
    externalRemove(keys: string | string[]) {
      const removed = Array.isArray(keys) ? keys : [keys];
      const changed: Record<string, StorageChange> = {};
      for (const key of removed) {
        changed[key] = { oldValue: values[key] };
        delete values[key];
      }
      for (const listener of listeners) listener(changed, "local");
    },
  };
}

describe("typed storage", () => {
  it("returns defaults and persists changes", async () => {
    const { area, values, changes } = memoryArea();
    const storage = createStorage(
      area,
      { defaults: { count: 0, label: "ready" }, version: 1 },
      changes,
    );
    await expect(storage.get("count")).resolves.toBe(0);
    await storage.set("count", 4);
    await expect(storage.getAll()).resolves.toEqual({
      count: 4,
      label: "ready",
    });
    expect(values.count).toBe(4);
  });

  it("runs the migration for each new schema version", async () => {
    const migrate = vi.fn((state: { count: number; label: string }) => ({
      ...state,
      label: "migrated",
    }));
    const { area, changes } = memoryArea({
      count: 2,
      __browser_extension_factory_storage_version: 1,
    });
    const storage = createStorage(
      area,
      {
        defaults: { count: 0, label: "default" },
        version: 2,
        migrations: { 2: migrate },
      },
      changes,
    );
    await expect(storage.get("label")).resolves.toBe("migrated");
    expect(migrate).toHaveBeenCalledOnce();
  });

  it("resets data to declared defaults", async () => {
    const { area, changes } = memoryArea({ count: 9 });
    const storage = createStorage(
      area,
      { defaults: { count: 0 }, version: 1 },
      changes,
    );
    await storage.set("count", 5);
    await storage.reset();
    await expect(storage.get("count")).resolves.toBe(0);
  });

  it("refreshes the in-memory cache when another context changes storage", async () => {
    const { area, changes, externalSet, externalRemove } = memoryArea({
      count: 1,
      label: "initial",
    });
    const storage = createStorage(
      area,
      { defaults: { count: 0, label: "default" }, version: 1 },
      changes,
    );

    await expect(storage.getAll()).resolves.toEqual({
      count: 1,
      label: "initial",
    });
    externalSet({ count: 8, label: "changed elsewhere" });

    await expect(storage.get("count")).resolves.toBe(8);
    await expect(storage.get("label")).resolves.toBe("changed elsewhere");

    externalRemove("label");
    await expect(storage.get("label")).resolves.toBe("default");
  });
});
