import { access, readFile, readdir, rm, stat, copyFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { generateIconsForExtension } from "./generate-icons.js";
import { validateExtension } from "./validate.js";
import { createSourcePackage } from "./source-package.js";
import { publishChromePackage } from "./chrome-webstore.js";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pnpm = process.platform === "win32" ? "pnpm.cmd" : "pnpm";

function run(command: string, args: string[], env: NodeJS.ProcessEnv = process.env): void {
  const result = spawnSync(command, args, {
    cwd: rootDir,
    env,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (result.error) throw result.error;
  if (result.status !== 0)
    throw new Error(
      "Command failed (" + (result.status ?? "signal") + "): " + command + " " + args.join(" "),
    );
}
function runPnpm(args: string[], env: NodeJS.ProcessEnv = process.env): void {
  run(pnpm, args, env);
}
function extensionDirectory(slug: string): string {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))
    throw new Error("A valid extension slug is required.");
  return path.join(rootDir, "extensions", slug);
}
function runWxt(slug: string, args: string[]): void {
  runPnpm(["--filter", "@extensions/" + slug, "exec", "wxt", ...args]);
}
async function listSlugs(): Promise<string[]> {
  const entries = await readdir(path.join(rootDir, "extensions"), { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}
async function directoryBytes(directory: string): Promise<number> {
  let total = 0;
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    total += entry.isDirectory() ? await directoryBytes(absolute) : (await stat(absolute)).size;
  }
  return total;
}
function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 ** 2) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1024 ** 2).toFixed(2) + " MB";
}
async function findFiles(directory: string, suffix: string): Promise<string[]> {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch {
    return [];
  }
  const found: string[] = [];
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) found.push(...(await findFiles(absolute, suffix)));
    else if (entry.name.endsWith(suffix)) found.push(absolute);
  }
  return found;
}
async function buildOne(slug: string): Promise<void> {
  const directory = extensionDirectory(slug);
  await generateIconsForExtension(directory);
  await validateExtension(slug);
  console.log("Building " + slug + " for Chrome/Chromium and Firefox.");
  runWxt(slug, ["build", "-b", "chrome", "--mv3"]);
  runWxt(slug, ["build", "-b", "firefox", "--mv3"]);
  if (slug === "page-ocr") {
    for (const browser of ["chrome", "firefox"]) {
      const browserOutput = path.join(
        directory,
        ".output",
        browser === "chrome" ? "chrome-mv3" : "firefox-mv3",
      );
      for (const relativePath of ["background.js", "vendor/ocr/worker.min.js"]) {
        const filePath = path.join(browserOutput, relativePath);
        const source = await readFile(filePath, "utf8");
        let patchedFallbacks = 0;
        const safeSource = source.replace(
          /Function\(["']r["']\s*,\s*["']regeneratorRuntime = r["']\)\(([A-Za-z_$][\w$]*)\)/g,
          (_match, runtimeVariable: string) => {
            patchedFallbacks += 1;
            return "globalThis.regeneratorRuntime = " + runtimeVariable + ";";
          },
        );
        if (patchedFallbacks) await writeFile(filePath, safeSource);
        console.log(
          "Patched regenerator fallbacks in " + browser + "/" + relativePath + ": " + patchedFallbacks,
        );
      }
    }
  }
  await validateExtension(slug, { requireBuilt: true });
  const firefoxOutput = path.join(directory, ".output", "firefox-mv3");
  try {
    runPnpm(["exec", "web-ext", "lint", "--source-dir", firefoxOutput, "--warnings-as-errors"]);
  } catch (error) {
    if (slug === "page-ocr") {
      for (const relativePath of ["background.js", "vendor/ocr/worker.min.js"]) {
        const source = await readFile(path.join(firefoxOutput, relativePath), "utf8");
        console.error(
          "Remaining OCR CSP tokens in " + relativePath + ":",
          source.match(/.{0,100}Function.{0,100}/g) ?? [],
        );
      }
    }
    throw error;
  }
  for (const browser of ["chrome", "firefox"]) {
    const output = path.join(
      directory,
      ".output",
      browser === "chrome" ? "chrome-mv3" : "firefox-mv3",
    );
    console.log(slug + " " + browser + " bundle: " + formatBytes(await directoryBytes(output)));
  }
}
async function zipOne(
  slug: string,
): Promise<{ chromeZip: string; firefoxZip: string; sourceZip: string }> {
  await buildOne(slug);
  const outputDirectory = path.join(extensionDirectory(slug), ".output");
  await Promise.all(
    (await findFiles(outputDirectory, ".zip")).map((file) => rm(file, { force: true })),
  );
  runWxt(slug, ["zip", "-b", "chrome", "--mv3"]);
  runWxt(slug, ["zip", "-b", "firefox", "--mv3"]);
  const directory = extensionDirectory(slug);
  const zips = await findFiles(path.join(directory, ".output"), ".zip");
  const chromeZip = zips.find((file) => /chrome/i.test(path.basename(file)));
  const firefoxZip = zips.find((file) => /firefox/i.test(path.basename(file)));
  if (!chromeZip || !firefoxZip) throw new Error("WXT did not produce both browser ZIP packages.");
  const sourceZip = await createSourcePackage(slug);
  console.log("Chromium ZIP: " + chromeZip);
  console.log("Firefox ZIP: " + firefoxZip);
  console.log("Source ZIP: " + sourceZip);
  return { chromeZip, firefoxZip, sourceZip };
}
function optionValue(args: string[], name: string, fallback: string): string {
  const argument = args.find(
    (value) => value === "--" + name || value.startsWith("--" + name + "="),
  );
  if (!argument) return fallback;
  if (argument.includes("=")) return argument.slice(argument.indexOf("=") + 1);
  const index = args.indexOf(argument);
  return args[index + 1] ?? fallback;
}
async function signFirefox(slug: string, channel: "listed" | "unlisted"): Promise<string> {
  await buildOne(slug);
  const directory = extensionDirectory(slug);
  const sourceDir = path.join(directory, ".output", "firefox-mv3");
  const artifactsDir = path.join(directory, ".output", "signed-firefox");
  const env = { ...process.env };
  env.WEB_EXT_API_KEY = env.AMO_JWT_ISSUER ?? env.WEB_EXT_API_KEY;
  env.WEB_EXT_API_SECRET = env.AMO_JWT_SECRET ?? env.WEB_EXT_API_SECRET;
  if (!env.WEB_EXT_API_KEY || !env.WEB_EXT_API_SECRET) {
    throw new Error("Set AMO_JWT_ISSUER and AMO_JWT_SECRET in the environment.");
  }
  const args = [
    "exec",
    "web-ext",
    "sign",
    "--source-dir",
    sourceDir,
    "--artifacts-dir",
    artifactsDir,
    "--channel",
    channel,
    "--no-input",
  ];
  if (channel === "listed") {
    const sourceZip = await createSourcePackage(slug);
    const amoMetadata = path.join(directory, "store", "amo-metadata.json");
    await access(amoMetadata);
    args.push("--upload-source-code", sourceZip, "--amo-metadata", amoMetadata);
  }
  runPnpm(args, env);
  const xpis = await findFiles(artifactsDir, ".xpi");
  if (!xpis.length) throw new Error("web-ext completed without producing a signed XPI.");
  const packageJson = JSON.parse(await readFile(path.join(directory, "package.json"), "utf8")) as {
    version: string;
  };
  const namedXpi = path.join(artifactsDir, slug + "-" + packageJson.version + ".xpi");
  if (path.resolve(xpis[0]!) !== path.resolve(namedXpi)) await copyFile(xpis[0]!, namedXpi);
  console.log("Signed Firefox XPI: " + namedXpi);
  return namedXpi;
}
async function publishChrome(slug: string): Promise<void> {
  const packages = await zipOne(slug);
  const suffix = slug.toUpperCase().replaceAll("-", "_");
  const extensionId =
    process.env["CHROME_EXTENSION_ID_" + suffix] ?? process.env.CHROME_EXTENSION_ID;
  if (!extensionId)
    throw new Error(
      "Set CHROME_EXTENSION_ID_" + suffix + " (or CHROME_EXTENSION_ID) before publishing.",
    );
  await publishChromePackage(extensionId, packages.chromeZip);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2).filter((value) => value !== "--");
  const command = args.shift();
  const slug = args.shift();
  if (!command)
    throw new Error(
      "Expected dev, dev:firefox, build, build-all, zip, sign:firefox, publish:chrome, or publish:firefox.",
    );
  if (command === "build-all") {
    for (const extension of await listSlugs()) await buildOne(extension);
    return;
  }
  const supported = [
    "dev",
    "dev:firefox",
    "build",
    "zip",
    "sign:firefox",
    "publish:chrome",
    "publish:firefox",
  ];
  if (!supported.includes(command)) throw new Error("Unknown command: " + command);
  if (!slug) throw new Error("Usage: pnpm " + command + " <extension-slug>");
  const directory = extensionDirectory(slug);
  await access(path.join(directory, "package.json"));

  if (command === "dev" || command === "dev:firefox") {
    await generateIconsForExtension(directory);
    await validateExtension(slug);
    runWxt(slug, ["-b", command === "dev:firefox" ? "firefox" : "chrome", "--mv3"]);
  } else if (command === "build") {
    await buildOne(slug);
  } else if (command === "zip") {
    await zipOne(slug);
  } else if (command === "sign:firefox") {
    const channel = optionValue(args, "channel", "unlisted");
    if (channel !== "listed" && channel !== "unlisted")
      throw new Error("Firefox channel must be listed or unlisted.");
    await signFirefox(slug, channel);
  } else if (command === "publish:firefox") {
    await signFirefox(slug, "listed");
  } else if (command === "publish:chrome") {
    await publishChrome(slug);
  }
}
main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
