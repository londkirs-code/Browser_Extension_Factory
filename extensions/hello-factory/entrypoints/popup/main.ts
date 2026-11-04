import { createStorage, getExtensionApi, localize } from "@browser-extension-factory/shared";
import "./style.css";

type Settings = { savedValue: string };
const api = getExtensionApi();
if (!api.storage?.local) throw new Error("The browser local storage API is unavailable.");
const storage = createStorage<Settings>(api.storage.local, { defaults: { savedValue: "" }, version: 1 });

const isHebrew = (api.i18n?.getUILanguage?.() ?? navigator.language).toLowerCase().startsWith("he");
document.documentElement.dir = isHebrew ? "rtl" : "ltr";
document.documentElement.lang = isHebrew ? "he" : "en";

const input = document.querySelector<HTMLInputElement>("#saved-value");
const title = document.querySelector<HTMLHeadingElement>("#popup-title");
const label = document.querySelector<HTMLLabelElement>("#input-label");
const button = document.querySelector<HTMLButtonElement>("#save-button");
const status = document.querySelector<HTMLParagraphElement>("#status");

if (!input || !title || !label || !button || !status) {
  throw new Error("The popup markup is incomplete.");
}
title.textContent = localize("popupTitle", "Hello Factory", api);
label.textContent = localize("inputLabel", "Value to save", api);
button.textContent = localize("saveButton", "Save value", api);

void storage.get("savedValue").then((value) => { input.value = value; });
button.addEventListener("click", async () => {
  await storage.set("savedValue", input.value);
  status.textContent = localize("savedMessage", "Saved on this browser.", api);
});
