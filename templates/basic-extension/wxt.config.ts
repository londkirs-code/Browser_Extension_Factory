import { readFileSync } from "node:fs";
import { defineConfig } from "wxt";

type ExtensionConfig = {
  displayName: string;
  description: string;
  geckoId: string;
  chromeKey?: string;
  minChromeVersion: string;
  minFirefoxVersion: string;
  permissions: string[];
  optionalPermissions: string[];
  hostPermissions: string[];
  optionalHostPermissions: string[];
  firefoxDataCollectionPermissions: { required: string[]; optional: string[] };
};
const config = JSON.parse(
  readFileSync(new URL("./extension.config.json", import.meta.url), "utf8"),
) as ExtensionConfig;

export default defineConfig({
    srcDir: ".",
    outDir: ".output",
    targetBrowsers: ["chrome", "firefox"],
    zip: {
      artifactTemplate: "{{name}}-{{version}}-{{browser}}.zip",
      sourcesTemplate: "{{name}}-{{version}}-sources.zip",
      compressionLevel: 9,
    },
    manifest: ({ browser }) => ({
      name: "__MSG_extName__",
      description: "__MSG_extDescription__",
      default_locale: "en",
      permissions: config.permissions,
      optional_permissions: config.optionalPermissions,
      host_permissions: config.hostPermissions,
      optional_host_permissions: config.optionalHostPermissions,
      icons: { 16: "icons/16.png", 32: "icons/32.png", 48: "icons/48.png", 128: "icons/128.png" },
      content_security_policy: { extension_pages: "script-src 'self'; object-src 'self';" },
      ...(browser === "firefox"
        ? {
            browser_specific_settings: {
              gecko: {
                id: config.geckoId,
                strict_min_version: config.minFirefoxVersion,
                data_collection_permissions: {
                  required: config.firefoxDataCollectionPermissions.required,
                  ...(config.firefoxDataCollectionPermissions.optional.length
                    ? { optional: config.firefoxDataCollectionPermissions.optional }
                    : {}),
                },
              },
            },
          }
        : {
            minimum_chrome_version: config.minChromeVersion,
            ...(config.chromeKey ? { key: config.chromeKey } : {}),
          }),
    },
});
