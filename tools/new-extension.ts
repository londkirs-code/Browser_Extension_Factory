import { randomUUID } from "node:crypto";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline/promises";
import { spawnSync } from "node:child_process";
import { stdin as input, stdout as output } from "node:process";
import { generateIconsForExtension } from "./generate-icons.js";
import { broadPermissions, isBroadPattern } from "./validate.js";

type Features = { popup: boolean; options: boolean; contentScript: boolean; background: boolean };
type Answers = {
  slug: string;
  displayName: string;
  description: string;
  permissions: string[];
  optionalPermissions: string[];
  hostPermissions: string[];
  optionalHostPermissions: string[];
  contentScriptMatches: string[];
  permissionJustifications: Record<string, string>;
  firefoxDataCollectionPermissions: { required: string[]; optional: string[] };
  features: Features;
};
type CliOptions = Record<string, string | boolean>;

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const templateDir = path.join(rootDir, "templates", "basic-extension");
const extensionsDir = path.join(rootDir, "extensions");

function parseArguments(args: string[]): CliOptions {
  const options: CliOptions = {};
  for (let i = 0; i < args.length; i += 1) {
    const argument = args[i];
    if (!argument) continue;
    if (!argument.startsWith("--")) throw new Error(`Unexpected argument: ${argument}`);
    const [rawKey, inlineValue] = argument.slice(2).split("=", 2);
    if (!rawKey) continue;
    if (rawKey.startsWith("no-")) {
      options[rawKey.slice(3)] = false;
      continue;
    }
    if (inlineValue !== undefined) {
      options[rawKey] = inlineValue;
      continue;
    }
    const next = args[i + 1];
    if (next && !next.startsWith("--")) {
      options[rawKey] = next;
      i += 1;
    } else options[rawKey] = true;
  }
  return options;
}
function stringOption(options: CliOptions, key: string): string | undefined {
  const value = options[key];
  return typeof value === "string" ? value : undefined;
}
function booleanOption(options: CliOptions, key: string): boolean | undefined {
  const value = options[key];
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    if (["true", "yes", "1"].includes(value.toLowerCase())) return true;
    if (["false", "no", "0"].includes(value.toLowerCase())) return false;
  }
  return undefined;
}
function listOption(options: CliOptions, key: string): string[] | undefined {
  const value = stringOption(options, key);
  return value === undefined
    ? undefined
    : value
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean);
}
function splitList(value: string): string[] {
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}
function validSlug(value: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

async function collectAnswers(options: CliOptions): Promise<Answers> {
  const readline = createInterface({ input, output });
  const ask = async (label: string, value?: string): Promise<string> =>
    value?.trim() ? value.trim() : (await readline.question(label)).trim();
  const askBoolean = async (
    label: string,
    value: boolean | undefined,
    fallback: boolean,
  ): Promise<boolean> => {
    if (value !== undefined) return value;
    const answer = (await readline.question(`${label} [${fallback ? "Y/n" : "y/N"}] `))
      .trim()
      .toLowerCase();
    return answer ? ["y", "yes", "true", "1"].includes(answer) : fallback;
  };
  const askList = async (label: string, value?: string[]): Promise<string[]> => {
    if (value !== undefined) return value;
    return splitList(await readline.question(`${label} (comma-separated; blank for none): `));
  };
  try {
    const slug = await ask(
      "Extension slug (lowercase kebab-case): ",
      stringOption(options, "slug"),
    );
    if (!validSlug(slug))
      throw new Error("Slug must use lowercase letters, digits, and single hyphens.");
    const displayName = await ask(
      "Display name: ",
      stringOption(options, "name") ?? stringOption(options, "display-name"),
    );
    const description = await ask("Description: ", stringOption(options, "description"));
    if (!displayName || !description) throw new Error("Display name and description are required.");

    const permissions = await askList(
      "Required API permissions",
      listOption(options, "permissions"),
    );
    const optionalPermissions = await askList(
      "Optional API permissions",
      listOption(options, "optional-permissions"),
    );
    const allowedFirefoxDataTypes = new Set([
      "authenticationInfo",
      "bookmarksInfo",
      "browsingActivity",
      "financialAndPaymentInfo",
      "healthInfo",
      "locationInfo",
      "personalCommunications",
      "personallyIdentifyingInfo",
      "searchTerms",
      "technicalAndInteraction",
      "websiteActivity",
      "websiteContent",
    ]);
    const firefoxRequiredDataTypes = await askList(
      "Firefox required data collection categories (blank means none)",
      listOption(options, "firefox-data-collection-required"),
    );
    const firefoxOptionalDataTypes = await askList(
      "Firefox optional data collection categories (blank means none)",
      listOption(options, "firefox-data-collection-optional"),
    );
    const requiredFirefoxData = firefoxRequiredDataTypes.length
      ? firefoxRequiredDataTypes
      : ["none"];
    if (requiredFirefoxData.includes("none") && requiredFirefoxData.length !== 1) {
      throw new Error(
        'Firefox data category "none" cannot be combined with other required categories.',
      );
    }
    for (const dataType of [...requiredFirefoxData, ...firefoxOptionalDataTypes]) {
      if (dataType !== "none" && !allowedFirefoxDataTypes.has(dataType)) {
        throw new Error("Unsupported Firefox data collection category: " + dataType);
      }
    }
    if (firefoxOptionalDataTypes.includes("none")) {
      throw new Error('Firefox optional data categories cannot contain "none".');
    }
    const features: Features = {
      popup: await askBoolean("Create popup page?", booleanOption(options, "popup"), true),
      options: await askBoolean("Create options page?", booleanOption(options, "options"), false),
      contentScript: await askBoolean(
        "Create content script?",
        booleanOption(options, "content-script"),
        false,
      ),
      background: await askBoolean(
        "Create background service worker?",
        booleanOption(options, "background"),
        true,
      ),
    };
    if (!Object.values(features).some(Boolean)) throw new Error("Select at least one entrypoint.");

    const hostPermissions = await askList(
      "Required host patterns",
      listOption(options, "host-permissions"),
    );
    const optionalHostPermissions = await askList(
      "Optional host patterns",
      listOption(options, "optional-host-permissions"),
    );
    const contentScriptMatches = features.contentScript
      ? await askList(
          "Content script matches",
          listOption(options, "content-matches") ?? ["https://example.com/*"],
        )
      : [];
    if (features.contentScript && contentScriptMatches.length === 0) {
      throw new Error("A content script requires at least one explicit match pattern.");
    }

    const broad = [
      ...permissions,
      ...optionalPermissions,
      ...hostPermissions,
      ...optionalHostPermissions,
    ].filter((permission) => broadPermissions.has(permission) || isBroadPattern(permission));
    const justification = broad.length
      ? await ask(
          `Justification for broad permissions (${broad.join(", ")}): `,
          stringOption(options, "broad-justification"),
        )
      : "";
    const permissionJustifications: Record<string, string> = {};
    if (justification)
      for (const permission of broad) permissionJustifications[permission] = justification;

    return {
      slug,
      displayName,
      description,
      permissions,
      optionalPermissions,
      hostPermissions: [...new Set([...hostPermissions, ...contentScriptMatches])],
      optionalHostPermissions,
      contentScriptMatches,
      permissionJustifications,
      firefoxDataCollectionPermissions: {
        required: requiredFirefoxData,
        optional: firefoxOptionalDataTypes,
      },
      features,
    };
  } finally {
    readline.close();
  }
}

function renderTemplate(source: string, answers: Answers): string {
  return source
    .replaceAll("__SLUG__", answers.slug)
    .replaceAll("__DISPLAY_NAME__", answers.displayName)
    .replaceAll("__DESCRIPTION__", answers.description);
}
async function removeUnselectedEntrypoints(destination: string, features: Features): Promise<void> {
  const entrypoints = path.join(destination, "entrypoints");
  const mapping: Array<[keyof Features, string]> = [
    ["popup", "popup"],
    ["options", "options"],
    ["contentScript", "content.ts"],
    ["background", "background.ts"],
  ];
  for (const [feature, relativePath] of mapping) {
    if (!features[feature])
      await rm(path.join(entrypoints, relativePath), { recursive: true, force: true });
  }
}

async function main(): Promise<void> {
  const options = parseArguments(process.argv.slice(2));
  if (options.help === true) {
    output.write(
      'Usage: pnpm new --slug my-extension --name "My Extension" --description "Description" [--permissions storage] [--firefox-data-collection-required none] [--firefox-data-collection-optional technicalAndInteraction] [--popup true --options false --content-script false --background true]\n',
    );
    return;
  }
  const answers = await collectAnswers(options);
  const destination = path.join(extensionsDir, answers.slug);
  await mkdir(extensionsDir, { recursive: true });
  try {
    await readFile(path.join(destination, "package.json"), "utf8");
    throw new Error(`Extension already exists: ${answers.slug}`);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }

  await cp(templateDir, destination, { recursive: true });
  await removeUnselectedEntrypoints(destination, answers.features);
  const configPath = path.join(destination, "extension.config.json");
  const config = JSON.parse(await readFile(configPath, "utf8")) as Record<string, unknown>;
  Object.assign(config, {
    slug: answers.slug,
    displayName: answers.displayName,
    description: answers.description,
    geckoId: `${randomUUID()}@browser-extension-factory.invalid`,
    permissions: answers.permissions,
    optionalPermissions: answers.optionalPermissions,
    hostPermissions: answers.hostPermissions,
    optionalHostPermissions: answers.optionalHostPermissions,
    contentScriptMatches: answers.contentScriptMatches,
    permissionJustifications: answers.permissionJustifications,
    firefoxDataCollectionPermissions: answers.firefoxDataCollectionPermissions,
    features: answers.features,
  });
  await writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`, "utf8");

  const packagePath = path.join(destination, "package.json");
  const packageJson = JSON.parse(await readFile(packagePath, "utf8")) as Record<string, unknown>;
  packageJson.name = `@extensions/${answers.slug}`;
  await writeFile(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`, "utf8");

  for (const relativePath of [
    "README.md",
    "store/description-short.txt",
    "store/description-long.md",
  ]) {
    const target = path.join(destination, relativePath);
    await writeFile(target, renderTemplate(await readFile(target, "utf8"), answers), "utf8");
  }
  await generateIconsForExtension(destination);
  const pnpm = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
  const install = spawnSync(pnpm, ["install", "--no-frozen-lockfile"], {
    cwd: rootDir,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (install.error) throw install.error;
  if (install.status !== 0)
    throw new Error("Dependency installation failed after generating the extension.");
  console.log(`Created extensions/${answers.slug}. It is ready for pnpm build ${answers.slug}.`);
  console.warn(
    "IMPORTANT: pnpm-lock.yaml was updated. Commit the updated lockfile in the same commit as this new extension, then run pnpm install --frozen-lockfile and verify it succeeds before pushing.",
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
