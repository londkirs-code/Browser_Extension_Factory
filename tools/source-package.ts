import { readFile, readdir, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { strToU8, zipSync } from "fflate";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const excludedDirectories = new Set([
  ".git",
  "node_modules",
  ".output",
  ".wxt",
  "coverage",
  "dist",
  "artifacts",
]);
const excludedFiles = new Set([".env", ".env.local", ".env.production"]);

async function collect(
  directory: string,
  archive: Record<string, Uint8Array>,
  prefix = "",
): Promise<void> {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (
      excludedDirectories.has(entry.name) ||
      excludedFiles.has(entry.name) ||
      entry.name.startsWith(".env.")
    )
      continue;
    const absolute = path.join(directory, entry.name);
    const relative = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) await collect(absolute, archive, relative);
    else archive[relative] = await readFile(absolute);
  }
}

export async function createSourcePackage(slug: string): Promise<string> {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error("Invalid extension slug.");
  const extensionDir = path.join(rootDir, "extensions", slug);
  const packageJson = JSON.parse(
    await readFile(path.join(extensionDir, "package.json"), "utf8"),
  ) as { version: string };
  const archive: Record<string, Uint8Array> = {};
  for (const file of [
    "package.json",
    "pnpm-workspace.yaml",
    "pnpm-lock.yaml",
    "tsconfig.base.json",
    ".npmrc",
    ".nvmrc",
    "LICENSE",
  ]) {
    try {
      archive[file] = await readFile(path.join(rootDir, file));
    } catch {
      /* Optional root files. */
    }
  }
  await collect(path.join(rootDir, "tools"), archive, "tools");
  await collect(path.join(rootDir, "packages", "shared"), archive, "packages/shared");
  await collect(extensionDir, archive, "extensions/" + slug);
  const instructions = [
    "# Reproducible source build",
    "",
    "1. Install Node.js 26 LTS and pnpm 12.",
    "2. Extract this archive into a clean directory.",
    "3. Run pnpm install --no-frozen-lockfile from the archive root.",
    "4. Run pnpm build " + slug + " to build both Chromium and Firefox.",
    "5. Run pnpm test and pnpm validate -- " + slug + ".",
    "",
    "The archive includes the extension source, shared package, and factory scripts needed to reproduce the unsigned builds.",
    "Signing credentials and secrets are intentionally excluded.",
  ].join("\n");
  archive["BUILD.md"] = strToU8(instructions);
  const outputDir = path.join(extensionDir, ".output");
  await mkdir(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, slug + "-" + packageJson.version + "-sources.zip");
  await writeFile(outputPath, zipSync(archive, { level: 9 }));
  return outputPath;
}

async function main(): Promise<void> {
  const slug = process.argv[2];
  if (!slug) throw new Error("Usage: pnpm exec tsx tools/source-package.ts <extension-slug>");
  console.log(await createSourcePackage(slug));
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
