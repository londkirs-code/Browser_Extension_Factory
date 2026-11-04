import type { StorageArea } from "./browser.js";

const VERSION_KEY = "__browser_extension_factory_storage_version";

export type StorageMigration<T extends Record<string, unknown>> = (
  current: T,
) => T | Promise<T>;

export type StorageOptions<T extends Record<string, unknown>> = {
  defaults: T;
  version: number;
  migrations?: Record<number, StorageMigration<T>>;
};

export class TypedStorage<T extends Record<string, unknown>> {
  private state: T;
  private initialized: Promise<void> | undefined;

  constructor(
    private readonly area: StorageArea,
    private readonly options: StorageOptions<T>,
  ) {
    if (!Number.isInteger(options.version) || options.version < 1) {
      throw new Error("Storage schema version must be a positive integer.");
    }
    this.state = { ...options.defaults };
  }

  private async initialize(): Promise<void> {
    const stored = await this.area.get(null);
    const storedVersion = Number(stored[VERSION_KEY] ?? 0);
    const data = { ...this.options.defaults } as T;
    for (const [key, value] of Object.entries(stored)) {
      if (key !== VERSION_KEY && key in this.options.defaults) {
        (data as Record<string, unknown>)[key] = value;
      }
    }

    let migrated = data;
    for (let nextVersion = storedVersion + 1; nextVersion <= this.options.version; nextVersion += 1) {
      const migration = this.options.migrations?.[nextVersion];
      if (migration) migrated = await migration(migrated);
    }
    this.state = migrated;
    await this.area.set({ ...migrated, [VERSION_KEY]: this.options.version });
  }

  private async ready(): Promise<void> {
    this.initialized ??= this.initialize();
    await this.initialized;
  }

  async get<K extends keyof T>(key: K): Promise<T[K]> {
    await this.ready();
    return this.state[key];
  }

  async getAll(): Promise<T> {
    await this.ready();
    return { ...this.state };
  }

  async set<K extends keyof T>(key: K, value: T[K]): Promise<void> {
    await this.ready();
    this.state = { ...this.state, [key]: value };
    await this.area.set({ [key]: value });
  }

  async update(values: Partial<T>): Promise<void> {
    await this.ready();
    this.state = { ...this.state, ...values };
    await this.area.set(values);
  }

  async reset(): Promise<void> {
    await this.ready();
    this.state = { ...this.options.defaults };
    await this.area.set({ ...this.state, [VERSION_KEY]: this.options.version });
  }
}

export function createStorage<T extends Record<string, unknown>>(
  area: StorageArea,
  options: StorageOptions<T>,
): TypedStorage<T> {
  return new TypedStorage(area, options);
}
