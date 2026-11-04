import { getExtensionApi, type ExtensionApi } from "./browser.js";

export function localize(
  key: string,
  fallback: string,
  api?: ExtensionApi,
): string {
  try {
    const message = (api ?? getExtensionApi()).i18n?.getMessage(key);
    return message?.trim() ? message : fallback;
  } catch {
    return fallback;
  }
}

export function getUiLanguage(api?: ExtensionApi): string {
  try {
    return (api ?? getExtensionApi()).i18n?.getUILanguage?.() ?? "en";
  } catch {
    return "en";
  }
}
