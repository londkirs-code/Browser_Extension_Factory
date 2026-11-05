import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { parseDocument } from "yaml";

const root = process.cwd();
const workspacePath = path.join(root, "pnpm-workspace.yaml");
const document = parseDocument(readFileSync(workspacePath, "utf8"));
if (document.errors.length) {
  throw new Error("Could not parse pnpm-workspace.yaml: " + document.errors[0]?.message);
}

function packageManifestPaths(): string[] {
  const paths = [path.join(root, "package.json")];
  for (const parent of ["extensions", "packages", "templates"]) {
    const directory = path.join(root, parent);
    if (!existsSync(directory)) continue;
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const manifest = path.join(directory, entry.name, "package.json");
      if (existsSync(manifest)) paths.push(manifest);
    }
  }
  return paths;
}

const directDependencies = new Set<string>();
for (const manifestPath of packageManifestPaths()) {
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as Record<
    string,
    Record<string, unknown> | undefined
  >;
  for (const section of ["dependencies", "devDependencies", "optionalDependencies"]) {
    for (const name of Object.keys(manifest[section] ?? {})) directDependencies.add(name);
  }
}

const workspace = document.toJS() as {
  allowBuilds?: Record<string, unknown>;
};
const pending = Object.entries(workspace.allowBuilds ?? {}).filter(
  ([, decision]) => decision === "set this to true or false",
);
const approved = pending
  .map(([name]) => name)
  .filter((name) => directDependencies.has(name));

for (const name of approved) document.setIn(["allowBuilds", name], true);

if (approved.length) {
  writeFileSync(workspacePath, document.toString());
  console.log("Automatically approved build scripts for direct workspace dependencies:");
  for (const name of approved.sort()) console.log(" - " + name);
} else {
  console.log("No newly discovered direct dependency build scripts need approval.");
}

const unresolved = pending.map(([name]) => name).filter((name) => !directDependencies.has(name));
if (unresolved.length) {
  console.error(
    "Unapproved transitive build scripts require review: " + unresolved.sort().join(", "),
  );
  process.exitCode = 1;
}
