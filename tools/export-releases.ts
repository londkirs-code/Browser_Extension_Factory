import { createHash } from "node:crypto";
import {
  access,
  copyFile,
  mkdir,
  readFile,
  readdir,
  rename,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  buildReleaseFileName,
  buildReleaseInfo,
  getObsoleteReleaseFiles,
  isExcludedReleaseSlug,
  type ReleaseBrowser,
  type ReleaseFile,
} from "./release-export-utils.js";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pnpm = process.platform === "win32" ? "pnpm.cmd" : "pnpm";

async function listExtensionSlugs(): Promise<string[]> {
  const entries = await readdir(path.join(rootDir, "extensions"), { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory() && !isExcludedReleaseSlug(entry.name))
    .map((entry) => entry.name)
    .sort();
}

async function findZipFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await findZipFiles(absolute)));
    else if (entry.isFile() && entry.name.toLowerCase().endsWith(".zip")) files.push(absolute);
  }
  return files;
}

function runZip(slug: string): void {
  const result = spawnSync(pnpm, ["zip", slug], {
    cwd: rootDir,
    env: { ...process.env, CI: "true", FORCE_COLOR: "0" },
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error("pnpm zip " + slug + " failed.");
}

async function findBrowserArchive(slug: string, browser: ReleaseBrowser): Promise<string> {
  const outputDir = path.join(rootDir, "extensions", slug, ".output");
  const files = (await findZipFiles(outputDir)).sort();
  const marker = new RegExp("(?:^|[-_.])" + browser + "(?:[-_.]|$)", "i");
  const match = files.find((file) => marker.test(path.basename(file)));
  if (!match)
    throw new Error("Could not find the " + browser + " ZIP produced by pnpm zip " + slug + ".");
  return match;
}

async function describeFile(filePath: string, name: string): Promise<ReleaseFile> {
  const content = await readFile(filePath);
  return {
    name,
    size: (await stat(filePath)).size,
    sha256: createHash("sha256").update(content).digest("hex"),
  };
}

async function cleanupOldReleaseFiles(directory: string, keepNames: string[]): Promise<void> {
  let names: string[];
  try {
    names = await readdir(directory);
  } catch {
    return;
  }
  for (const name of getObsoleteReleaseFiles(names, keepNames)) {
    await rm(path.join(directory, name), { recursive: true, force: true });
  }
}

async function getCommitSha(): Promise<string> {
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA;
  const result = spawnSync("git", ["rev-parse", "HEAD"], { cwd: rootDir, encoding: "utf8" });
  if (result.status !== 0) throw new Error("Unable to determine the current Git commit SHA.");
  return result.stdout.trim();
}

async function exportReleases(requestedSlugs: string[]): Promise<void> {
  const slugs = (requestedSlugs.length ? requestedSlugs : await listExtensionSlugs())
    .filter((slug) => !isExcludedReleaseSlug(slug))
    .sort();
  if (!slugs.length) {
    console.log("No eligible extensions to export.");
    return;
  }

  const commitSha = await getCommitSha();
  const builtAt = new Date().toISOString();
  const stageRoot = path.join(rootDir, ".factory", "releases-stage-" + process.pid);
  const backupRoot = path.join(rootDir, ".factory", "releases-backup-" + process.pid);
  const releasesRoot = path.join(rootDir, "releases");
  const replaced: Array<{ slug: string; hadPrevious: boolean }> = [];

  await rm(stageRoot, { recursive: true, force: true });
  await rm(backupRoot, { recursive: true, force: true });
  await mkdir(stageRoot, { recursive: true });
  await mkdir(backupRoot, { recursive: true });

  try {
    for (const slug of slugs) {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
        throw new Error("Invalid extension slug: " + slug);
      }
      const extensionDir = path.join(rootDir, "extensions", slug);
      await access(path.join(extensionDir, "package.json"));
      const packageJson = JSON.parse(
        await readFile(path.join(extensionDir, "package.json"), "utf8"),
      ) as { version?: string };
      const config = JSON.parse(
        await readFile(path.join(extensionDir, "extension.config.json"), "utf8"),
      ) as { displayName?: string };
      if (!packageJson.version || !config.displayName) {
        throw new Error("Missing version or displayName for extension " + slug + ".");
      }

      console.log("Exporting release packages for " + slug + ".");
      runZip(slug);
      const chromeSource = await findBrowserArchive(slug, "chrome");
      const firefoxSource = await findBrowserArchive(slug, "firefox");
      const targetDir = path.join(stageRoot, slug);
      await mkdir(targetDir, { recursive: true });
      const chromeName = buildReleaseFileName(slug, packageJson.version, "chrome");
      const firefoxName = buildReleaseFileName(slug, packageJson.version, "firefox");
      const chromeTarget = path.join(targetDir, chromeName);
      const firefoxTarget = path.join(targetDir, firefoxName);
      await copyFile(chromeSource, chromeTarget);
      await copyFile(firefoxSource, firefoxTarget);

      const info = buildReleaseInfo({
        slug,
        displayName: config.displayName,
        version: packageJson.version,
        builtAt,
        commitSha,
        files: {
          chrome: await describeFile(chromeTarget, chromeName),
          firefox: await describeFile(firefoxTarget, firefoxName),
        },
      });
      await writeFile(
        path.join(targetDir, "release-info.json"),
        JSON.stringify(info, null, 2) + "\n",
      );
    }

    await mkdir(releasesRoot, { recursive: true });
    for (const slug of slugs) {
      const currentDir = path.join(releasesRoot, slug);
      const backupDir = path.join(backupRoot, slug);
      let hadPrevious = false;
      try {
        await access(currentDir);
        await rename(currentDir, backupDir);
        hadPrevious = true;
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      }
      replaced.push({ slug, hadPrevious });
      if (hadPrevious) {
        const packageJson = JSON.parse(
          await readFile(path.join(rootDir, "extensions", slug, "package.json"), "utf8"),
        ) as { version: string };
        await cleanupOldReleaseFiles(backupDir, [
          buildReleaseFileName(slug, packageJson.version, "chrome"),
          buildReleaseFileName(slug, packageJson.version, "firefox"),
          "release-info.json",
        ]);
      }
      await rename(path.join(stageRoot, slug), currentDir);
    }
    await rm(backupRoot, { recursive: true, force: true });
    console.log("Updated releases for: " + slugs.join(", "));
  } catch (error) {
    for (const entry of replaced.reverse()) {
      const currentDir = path.join(releasesRoot, entry.slug);
      const backupDir = path.join(backupRoot, entry.slug);
      await rm(currentDir, { recursive: true, force: true });
      if (entry.hadPrevious) await rename(backupDir, currentDir);
    }
    throw error;
  } finally {
    await rm(stageRoot, { recursive: true, force: true });
    await rm(backupRoot, { recursive: true, force: true });
  }
}

async function main(): Promise<void> {
  const requested = process.argv.slice(2).filter((value) => value !== "--");
  await exportReleases(requested);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}

export { exportReleases };
