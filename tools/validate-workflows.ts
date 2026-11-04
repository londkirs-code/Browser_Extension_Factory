import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { parseDocument } from "yaml";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
async function main(): Promise<void> {
  const directory = path.join(rootDir, ".github", "workflows");
  const files = (await readdir(directory)).filter(
    (file) => file.endsWith(".yml") || file.endsWith(".yaml"),
  );
  if (!files.length) throw new Error("No GitHub Actions workflow files were found.");
  for (const file of files) {
    const document = parseDocument(await readFile(path.join(directory, file), "utf8"), {
      uniqueKeys: true,
    });
    if (document.errors.length)
      throw new Error(file + ": " + document.errors.map((error) => error.message).join("; "));
    const value = document.toJS();
    if (!value || typeof value !== "object")
      throw new Error(file + ": workflow root must be a YAML object.");
    console.log("Workflow YAML valid: " + file);
  }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
