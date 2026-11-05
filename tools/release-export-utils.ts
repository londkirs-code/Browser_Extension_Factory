export type ReleaseBrowser = "chrome" | "firefox";

export type ReleaseFile = {
  name: string;
  size: number;
  sha256: string;
};

export type ReleaseInfo = {
  slug: string;
  displayName: string;
  version: string;
  builtAt: string;
  commitSha: string;
  files: Record<ReleaseBrowser, ReleaseFile>;
};

export function buildReleaseFileName(
  slug: string,
  version: string,
  browser: ReleaseBrowser,
): string {
  return slug + "-" + version + "-" + browser + ".zip";
}

export function isExcludedReleaseSlug(slug: string): boolean {
  return slug === "hello-factory" || slug.startsWith("ocr-test") || slug.startsWith("test-");
}

export function getObsoleteReleaseFiles(existingNames: string[], keepNames: string[]): string[] {
  const keep = new Set(keepNames);
  return existingNames.filter((name) => !keep.has(name));
}

export function buildReleaseInfo(input: ReleaseInfo): ReleaseInfo {
  return {
    slug: input.slug,
    displayName: input.displayName,
    version: input.version,
    builtAt: input.builtAt,
    commitSha: input.commitSha,
    files: {
      chrome: { ...input.files.chrome },
      firefox: { ...input.files.firefox },
    },
  };
}
