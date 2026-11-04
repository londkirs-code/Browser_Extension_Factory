import { localize } from "@browser-extension-factory/shared";
import "./style.css";

const locale = globalThis.navigator.language.toLowerCase();
document.documentElement.dir = locale.startsWith("he") ? "rtl" : "ltr";
document.documentElement.lang = locale.startsWith("he") ? "he" : "en";

const title = document.querySelector<HTMLHeadingElement>("#options-title");
const description = document.querySelector<HTMLParagraphElement>("#options-description");
if (title) title.textContent = localize("optionsTitle", "Options");
if (description)
  description.textContent = localize("optionsDescription", "Configure this extension.");
