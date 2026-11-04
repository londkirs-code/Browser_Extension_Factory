import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export function extractReleaseNotes(changelog: string, version: string): string {
  const lines = changelog.split(/\r?\n/);
  const heading = "## [" + version + "]";
  const headingIndex = lines.findIndex((line) => line.trim().startsWith(heading));
  if (headingIndex < 0) throw new Error("CHANGELOG.md has no section for version " + version + ".");
  const body: string[] = [];
  for (const line of lines.slice(headingIndex + 1)) {
    if (/^##\s+/.test(line)) break;
    body.push(line);
  }
  const notes = body.join("\n").trim();
  if (!notes) throw new Error("CHANGELOG.md section for " + version + " is empty.");
  return notes;
}

async function main(): Promise<void> {
  const [slug, version, outputPath] = process.argv.slice(2);
  if (!slug || !version)
    throw new Error("Usage: pnpm exec tsx tools/release-notes.ts <slug> <version> [output-file]");
  const changelog = await readFile(path.join(rootDir, "extensions", slug, "CHANGELOG.md"), "utf8");
  const notes = extractReleaseNotes(changelog, version);
  if (outputPath) await writeFile(outputPath, notes + "\n", "utf8");
  else process.stdout.write(notes + "\n");
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
