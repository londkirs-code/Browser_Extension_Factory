import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const iconSizes = [16, 32, 48, 128] as const;
const broadPermissions = new Set([
  "<all_urls>",
  "tabs",
  "debugger",
  "webRequest",
  "webRequestBlocking",
  "history",
  "management",
  "cookies",
  "nativeMessaging",
  "downloads",
  "clipboardRead",
  "clipboardWrite",
]);
const textExtensions = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".mjs",
  ".cjs",
  ".json",
  ".yaml",
  ".yml",
  ".md",
  ".txt",
  ".html",
  ".css",
  ".svg",
]);
const secretPatterns = [
  /gh[pousr]_[A-Za-z0-9_]{20,}/,
  /GOCSPX-[A-Za-z0-9_-]{10,}/,
  /AKIA[0-9A-Z]{16}/,
  /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/,
  /(?:AMO_JWT_SECRET|CHROME_CLIENT_SECRET|CHROME_REFRESH_TOKEN|CHROME_CLIENT_ID|GH_TOKEN)\s*[:=]\s*["']?(?!\$\{\{|\$)[A-Za-z0-9_./+=-]{16,}/i,
];

type ExtensionConfig = {
  slug: string;
  displayName: string;
  description: string;
  geckoId: string;
  minChromeVersion: string;
  minFirefoxVersion: string;
  permissions: string[];
  optionalPermissions: string[];
  hostPermissions: string[];
  optionalHostPermissions: string[];
  permissionJustifications: Record<string, string>;
  features: { popup: boolean; options: boolean; contentScript: boolean; background: boolean };
};

async function walk(directory: string): Promise<string[]> {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch {
    return [];
  }
  const results: string[] = [];
  for (const entry of entries) {
    if (
      [".git", "node_modules", ".output", ".wxt", "coverage", "dist", "artifacts"].includes(
        entry.name,
      )
    )
      continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) results.push(...(await walk(absolute)));
    else results.push(absolute);
  }
  return results;
}

async function scanForSecrets(): Promise<void> {
  const findings: string[] = [];
  for (const file of await walk(rootDir)) {
    if (!textExtensions.has(path.extname(file).toLowerCase())) continue;
    const content = await readFile(file, "utf8");
    if (secretPatterns.some((pattern) => pattern.test(content)))
      findings.push(path.relative(rootDir, file));
  }
  if (findings.length)
    throw new Error("Possible hard-coded secret(s) found in: " + findings.join(", "));
}

function isBroadPattern(value: string): boolean {
  return (
    value === "<all_urls>" ||
    value === "http://*/*" ||
    value === "https://*/*" ||
    value === "*://*/*"
  );
}
function validatePermissionJustifications(config: ExtensionConfig): void {
  const allPermissions = [
    ...config.permissions,
    ...config.optionalPermissions,
    ...config.hostPermissions,
    ...config.optionalHostPermissions,
  ];
  for (const permission of allPermissions) {
    if (
      (broadPermissions.has(permission) || isBroadPattern(permission)) &&
      !config.permissionJustifications?.[permission]?.trim()
    ) {
      throw new Error(
        'Broad permission "' + permission + '" needs a permissionJustifications entry.',
      );
    }
  }
}

async function validateIcons(extensionDir: string): Promise<void> {
  await access(path.join(extensionDir, "public", "icon.svg"));
  for (const size of iconSizes) {
    const iconPath = path.join(extensionDir, "public", "icons", size + ".png");
    const data = await readFile(iconPath);
    const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
    const valid = data.subarray(0, 8).equals(pngSignature);
    const width = data.length >= 24 ? data.readUInt32BE(16) : 0;
    const height = data.length >= 24 ? data.readUInt32BE(20) : 0;
    if (!valid || width !== size || height !== size) {
      throw new Error(iconPath + " must be a valid " + size + "x" + size + " PNG.");
    }
  }
}

async function validateManifest(
  extensionDir: string,
  config: ExtensionConfig,
  packageVersion: string,
  browser: "chrome" | "firefox",
): Promise<void> {
  const outputDir = path.join(
    extensionDir,
    ".output",
    browser === "chrome" ? "chrome-mv3" : "firefox-mv3",
  );
  const manifestPath = path.join(outputDir, "manifest.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as Record<string, unknown>;
  if (manifest.manifest_version !== 3) throw new Error(browser + ": manifest_version must be 3.");
  if (manifest.version !== packageVersion)
    throw new Error(browser + ": generated version differs from package.json.");

  const csp = manifest.content_security_policy as { extension_pages?: string } | undefined;
  const policy = csp?.extension_pages ?? "";
  if (
    !policy.includes("script-src 'self'") ||
    /unsafe-eval|unsafe-inline|https?:\/\//i.test(policy)
  ) {
    throw new Error(browser + ": extension_pages CSP is missing or too permissive.");
  }
  const icons = manifest.icons as Record<string, string> | undefined;
  for (const size of iconSizes) {
    const icon = icons?.[String(size)];
    if (!icon) throw new Error(browser + ": manifest is missing the " + size + "px icon.");
    await access(path.join(outputDir, icon));
  }

  const actualPermissions = (manifest.permissions as string[] | undefined) ?? [];
  const actualOptional = (manifest.optional_permissions as string[] | undefined) ?? [];
  for (const permission of config.permissions) {
    if (!actualPermissions.includes(permission))
      throw new Error(browser + ": required permission missing: " + permission);
  }
  for (const permission of config.optionalPermissions) {
    if (!actualOptional.includes(permission))
      throw new Error(browser + ": optional permission missing: " + permission);
  }

  if (browser === "firefox") {
    const settings = manifest.browser_specific_settings as
      { gecko?: { id?: string; strict_min_version?: string } } | undefined;
    if (settings?.gecko?.id !== config.geckoId)
      throw new Error("Firefox manifest has an incorrect or missing Gecko ID.");
    if (settings.gecko.strict_min_version !== config.minFirefoxVersion)
      throw new Error("Firefox minimum version is inconsistent.");
  } else if (manifest.minimum_chrome_version !== config.minChromeVersion) {
    throw new Error("Chromium minimum version is inconsistent.");
  }
}

export async function validateExtension(
  slug: string,
  options: { requireBuilt?: boolean } = {},
): Promise<void> {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error("Invalid extension slug: " + slug);
  const extensionDir = path.join(rootDir, "extensions", slug);
  const packageJson = JSON.parse(
    await readFile(path.join(extensionDir, "package.json"), "utf8"),
  ) as { name?: string; version?: string };
  const config = JSON.parse(
    await readFile(path.join(extensionDir, "extension.config.json"), "utf8"),
  ) as ExtensionConfig;
  if (config.slug !== slug)
    throw new Error("extension.config.json slug does not match the directory.");
  if (packageJson.name !== "@extensions/" + slug)
    throw new Error("package.json workspace name is incorrect.");
  if (!packageJson.version || !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(packageJson.version)) {
    throw new Error("Each extension needs an independent semantic version in package.json.");
  }
  if (!config.geckoId || !config.geckoId.includes("@"))
    throw new Error("A unique Firefox Gecko ID is required.");
  if (!Array.isArray(config.permissions) || !Array.isArray(config.optionalPermissions)) {
    throw new Error("Required and optional API permission arrays must be present.");
  }
  validatePermissionJustifications(config);
  await validateIcons(extensionDir);

  const requiredEntrypoints: Array<[boolean, string]> = [
    [config.features.popup, "popup/index.html"],
    [config.features.options, "options/index.html"],
    [config.features.contentScript, "content.ts"],
    [config.features.background, "background.ts"],
  ];
  for (const [enabled, relativePath] of requiredEntrypoints) {
    try {
      await access(path.join(extensionDir, "entrypoints", relativePath));
    } catch {
      if (enabled) throw new Error("Selected entrypoint is missing: " + relativePath);
    }
  }
  if (options.requireBuilt) {
    await validateManifest(extensionDir, config, packageJson.version, "chrome");
    await validateManifest(extensionDir, config, packageJson.version, "firefox");
  }
}

async function main(): Promise<void> {
  const requested = process.argv.slice(2).filter((value) => value !== "--");
  const extensionRoot = path.join(rootDir, "extensions");
  const slugs = requested.length
    ? requested
    : (await readdir(extensionRoot, { withFileTypes: true }))
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name);
  for (const slug of slugs) {
    await validateExtension(slug);
    console.log("Validated source configuration: " + slug);
  }
  await scanForSecrets();
  console.log("Secret scan passed.");
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
