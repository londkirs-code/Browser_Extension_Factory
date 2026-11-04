import { appendFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const rebuildAllPrefixes = [
  "packages/shared/",
  "templates/",
  "tools/",
  "package.json",
  "pnpm-workspace.yaml",
  "pnpm-lock.yaml",
  "tsconfig.base.json",
  "eslint.config.js",
];

async function allSlugs(): Promise<string[]> {
  const entries = await readdir(path.join(rootDir, "extensions"), { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}
function diffFiles(base: string, head: string): string[] {
  if (!base || /^0+$/.test(base)) return [];
  const result = execFileSync("git", ["diff", "--name-only", base + "..." + head], {
    cwd: rootDir,
    encoding: "utf8",
  });
  return result.split(/\r?\n/).filter(Boolean);
}
async function main(): Promise<void> {
  const base = process.env.BASE_SHA ?? "";
  const head = process.env.HEAD_SHA ?? "HEAD";
  let files: string[];
  try {
    files = diffFiles(base, head);
  } catch {
    files = [];
  }
  let slugs = new Set<string>();
  if (
    files.length === 0 ||
    files.some((file) =>
      rebuildAllPrefixes.some((prefix) => file === prefix || file.startsWith(prefix)),
    )
  ) {
    slugs = new Set(await allSlugs());
  } else {
    for (const file of files) {
      const match = /^extensions\/([^/]+)\//.exec(file);
      if (match?.[1]) slugs.add(match[1]);
    }
  }
  const matrix = JSON.stringify({ extension: [...slugs] });
  if (process.env.GITHUB_OUTPUT) {
    await appendFile(
      process.env.GITHUB_OUTPUT,
      "matrix=" + matrix + "\nhas_changes=" + (slugs.size > 0) + "\n",
    );
  }
  console.log("Changed extensions: " + ([...slugs].join(", ") || "none"));
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
