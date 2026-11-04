import { localize } from "@browser-extension-factory/shared";
import "./style.css";

const locale = globalThis.navigator.language.toLowerCase();
document.documentElement.dir = locale.startsWith("he") ? "rtl" : "ltr";
document.documentElement.lang = locale.startsWith("he") ? "he" : "en";

const title = document.querySelector<HTMLHeadingElement>("#popup-title");
const body = document.querySelector<HTMLParagraphElement>("#popup-body");
if (title) title.textContent = localize("popupTitle", "Extension ready");
if (body) body.textContent = localize("popupBody", "Add your extension's behavior here.");
