import { copyFile, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "wxt";

type ExtensionConfig = {
  slug: string;
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
const require = createRequire(import.meta.url);

function resolvePackageRoot(packageName: string): string {
  let directory = path.dirname(require.resolve(packageName));
  while (true) {
    try {
      const packageJson = JSON.parse(
        readFileSync(path.join(directory, "package.json"), "utf8"),
      ) as { name?: string };
      if (packageJson.name === packageName) return directory;
    } catch {
      // Continue walking toward node_modules.
    }
    const parent = path.dirname(directory);
    if (parent === directory) throw new Error("Could not locate package " + packageName);
    directory = parent;
  }
}

async function patchUnsafeFunctionConstructors(filePath: string): Promise<void> {
  let source: string;
  try {
    source = await readFile(filePath, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return;
    throw error;
  }

  let patched = 0;
  let safeSource = source.replace(
    /Function\((["'\x60])r\1\s*,\s*(["'\x60])regeneratorRuntime = r\2\)\(([A-Za-z_$][\w$]*)\)/g,
    (_match, runtimeVariable: string) => {
      patched += 1;
      return "globalThis.regeneratorRuntime = " + runtimeVariable + ";";
    },
  );
  safeSource = safeSource.replace(/new Function\((["'\x60])return this\1\)\(\)/g, () => {
    patched += 1;
    return "globalThis";
  });

  if (/\bFunction\s*\(/.test(safeSource)) {
    throw new Error("Unexpected Function constructor remains in " + filePath);
  }
  if (patched) await writeFile(filePath, safeSource);
}

async function patchBuiltOcrFallbacks(): Promise<void> {
  const outputRoot = fileURLToPath(new URL("./.output", import.meta.url));
  for (const browser of ["chrome-mv3", "firefox-mv3"]) {
    for (const relativePath of ["background.js", "vendor/ocr/worker.min.js"]) {
      await patchUnsafeFunctionConstructors(path.join(outputRoot, browser, relativePath));
    }
  }
}

async function copyOcrAssets(): Promise<void> {
  const target = fileURLToPath(new URL("./public/vendor/ocr", import.meta.url));
  const coreTarget = path.join(target, "core");
  const languageTarget = path.join(target, "lang");
  await mkdir(coreTarget, { recursive: true });
  await mkdir(languageTarget, { recursive: true });

  const tesseractRoot = resolvePackageRoot("tesseract.js");
  const workerTarget = path.join(target, "worker.min.js");
  await copyFile(path.join(tesseractRoot, "dist", "worker.min.js"), workerTarget);

  const coreRoot = resolvePackageRoot("tesseract.js-core");
  const coreFiles = (await readdir(coreRoot)).filter(
    (file) => file.startsWith("tesseract-core") && (file.endsWith(".js") || file.endsWith(".wasm")),
  );
  if (!coreFiles.length) throw new Error("No Tesseract.js core assets were found.");
  await Promise.all(
    coreFiles.map((file) => copyFile(path.join(coreRoot, file), path.join(coreTarget, file))),
  );

  for (const language of ["eng", "heb"]) {
    const languageRoot = resolvePackageRoot("@tesseract.js-data/" + language);
    await copyFile(
      path.join(languageRoot, "4.0.0_best_int", language + ".traineddata.gz"),
      path.join(languageTarget, language + ".traineddata.gz"),
    );
  }
}

export default defineConfig({
  srcDir: ".",
  outDir: ".output",
  targetBrowsers: ["chrome", "firefox"],
  zip: {
    name: config.slug,
    artifactTemplate: "{{name}}-{{version}}-{{browser}}.zip",
    zipSources: false,
    compressionLevel: 9,
  },
  hooks: {
    "build:before": async () => {
      await copyOcrAssets();
    },
    "build:done": async () => {
      await patchBuiltOcrFallbacks();
    },
  },
  manifest: ({ browser }) => ({
    name: "__MSG_extName__",
    description: "__MSG_extDescription__",
    default_locale: "en",
    permissions: browser === "chrome" ? [...config.permissions, "offscreen"] : config.permissions,
    optional_permissions: config.optionalPermissions,
    host_permissions: config.hostPermissions,
    optional_host_permissions: config.optionalHostPermissions,
    icons: { 16: "icons/16.png", 32: "icons/32.png", 48: "icons/48.png", 128: "icons/128.png" },
    content_security_policy: {
      extension_pages: "script-src 'self' 'wasm-unsafe-eval'; object-src 'self';",
    },
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
  }),
});
