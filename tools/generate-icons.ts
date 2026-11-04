import { access, mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const iconSizes = [16, 32, 48, 128] as const;

export async function generateIconsForExtension(extensionDir: string): Promise<void> {
  const source = path.join(extensionDir, "public", "icon.svg");
  await access(source);
  const iconDir = path.join(extensionDir, "public", "icons");
  await mkdir(iconDir, { recursive: true });
  for (const size of iconSizes) {
    await sharp(source).resize(size, size, { fit: "contain" }).png().toFile(path.join(iconDir, `${size}.png`));
  }
}

async function main(): Promise<void> {
  const argument = process.argv[2];
  if (argument && argument !== "--all") {
    await generateIconsForExtension(path.resolve(rootDir, argument));
    return;
  }
  const extensionsDir = path.join(rootDir, "extensions");
  let extensions: string[] = [];
  try {
    extensions = (await readdir(extensionsDir, { withFileTypes: true }))
      .filter((entry) => entry.isDirectory()).map((entry) => path.join(extensionsDir, entry.name));
  } catch { /* The template can be prepared before the first extension is created. */ }
  extensions.push(path.join(rootDir, "templates", "basic-extension"));
  for (const extension of extensions) {
    try { await generateIconsForExtension(extension); console.log(`Generated icons: ${path.relative(rootDir, extension)}`); }
    catch (error) { console.warn(`Skipping ${extension}: ${error instanceof Error ? error.message : String(error)}`); }
  }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error: unknown) => { console.error(error); process.exitCode = 1; });
}
