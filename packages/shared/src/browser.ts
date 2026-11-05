export interface StorageArea {
  get(keys?: null | string | string[]): Promise<Record<string, unknown>>;
  set(items: Record<string, unknown>): Promise<void>;
  remove(keys: string | string[]): Promise<void>;
}

export interface StorageChange {
  oldValue?: unknown;
  newValue?: unknown;
}

export interface StorageChangeEvent {
  addListener(
    listener: (changes: Record<string, StorageChange>, areaName: string) => void,
  ): void;
  removeListener?(
    listener: (changes: Record<string, StorageChange>, areaName: string) => void,
  ): void;
}

export interface ExtensionApi {
  storage?: { local?: StorageArea; onChanged?: StorageChangeEvent };
  i18n?: {
    getMessage(messageName: string, substitutions?: string | string[]): string;
    getUILanguage?(): string;
  };
  runtime?: {
    sendMessage?(message: unknown): Promise<unknown>;
    onMessage?: {
      addListener(listener: (message: unknown, sender: unknown) => unknown): void;
      removeListener?(listener: (message: unknown, sender: unknown) => unknown): void;
    };
  };
}

export type ExtensionScope = {
  browser?: ExtensionApi;
  chrome?: ExtensionApi;
};

export function resolveExtensionApi(scope: ExtensionScope): ExtensionApi {
  const api = scope.browser ?? scope.chrome;
  if (!api) throw new Error("No WebExtensions browser API is available in this context.");
  return api;
}

export function getExtensionApi(): ExtensionApi {
  return resolveExtensionApi(globalThis as typeof globalThis & ExtensionScope);
}

export function getStorageChangeEvent(): StorageChangeEvent | undefined {
  const scope = globalThis as typeof globalThis & ExtensionScope;
  return (scope.browser ?? scope.chrome)?.storage?.onChanged;
}

export async function asPromise<T>(value: T | Promise<T>): Promise<T> {
  return Promise.resolve(value);
}

export async function sendRuntimeMessage<TResponse = unknown>(
  message: unknown,
  api: ExtensionApi = getExtensionApi(),
): Promise<TResponse> {
  const sendMessage = api.runtime?.sendMessage;
  if (!sendMessage) throw new Error("runtime.sendMessage is not available.");
  return (await sendMessage.call(api.runtime, message)) as TResponse;
}
