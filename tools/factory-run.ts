// Factory runner: executes inside GitHub Actions (no local shell needed).
// 1. Scaffolds extensions from .factory/requests/*.json using `pnpm new`.
// 2. Syncs the lockfile, formats, then runs every AGENTS.md check.
// 3. Writes .factory/report.md so a model with file access only can read the results.
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const pnpm = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const allowedFlags = new Set([
  "slug",
  "name",
  "description",
  "permissions",
  "optional-permissions",
  "host-permissions",
  "optional-host-permissions",
  "content-matches",
  "firefox-data-collection-required",
  "firefox-data-collection-optional",
  "popup",
  "options",
  "content-script",
  "background",
  "broad-justification",
]);
const ansi = new RegExp(String.fromCharCode(27) + "\\[[0-9;]*m", "g");
type StepResult = { title: string; ok: boolean; tail: string };
const results: StepResult[] = [];

function run(title: string, args: string[], { record = true } = {}): boolean {
  const result = spawnSync(pnpm, args, {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    env: { ...process.env, CI: "true", FORCE_COLOR: "0" },
  });
  const output = ((result.stdout ?? "") + (result.stderr ?? "")).replaceAll(ansi, "");
  const ok = result.status === 0;
  console.log(`\n===== ${title}: ${ok ? "PASS" : "FAIL"} =====`);
  console.log(output.split("\n").slice(-40).join("\n"));
  if (record) results.push({ title, ok, tail: output.split("\n").slice(-60).join("\n") });
  return ok;
}

function scaffold(): void {
  const dir = path.join(root, ".factory", "requests");
  if (!existsSync(dir)) return;
  for (const file of readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .sort()) {
    const request = JSON.parse(readFileSync(path.join(dir, file), "utf8")) as Record<
      string,
      unknown
    >;
    const slug = String(request.slug ?? "");
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      results.push({ title: `scaffold ${file}`, ok: false, tail: "Invalid or missing slug." });
      continue;
    }
    if (existsSync(path.join(root, "extensions", slug))) {
      console.log(`Skipping ${file}: extensions/${slug} already exists.`);
      continue;
    }
    const args = ["new", "--"];
    for (const [key, value] of Object.entries(request)) {
      if (!allowedFlags.has(key)) {
        results.push({ title: `scaffold ${file}`, ok: false, tail: `Flag not allowed: ${key}` });
        args.length = 0;
        break;
      }
      args.push(`--${key}=${Array.isArray(value) ? value.join(",") || "," : String(value)}`);
    }
    if (args.length) run(`scaffold ${slug} (pnpm new)`, args);
  }
}

function writeReport(): boolean {
  mkdirSync(path.join(root, ".factory"), { recursive: true });
  const failed = results.filter((r) => !r.ok);
  const lines: string[] = [
    "# Factory run report",
    "",
    `Overall: ${failed.length ? "FAILED" : "ALL CHECKS PASSED"}`,
    `Commit before run: ${process.env.GITHUB_SHA ?? "unknown"}`,
    "",
    "| Step | Result |",
    "| --- | --- |",
    ...results.map((r) => `| ${r.title} | ${r.ok ? "PASS" : "FAIL"} |`),
    "",
  ];
  for (const r of failed) lines.push(`## Failure: ${r.title}`, "", "```", r.tail, "```", "");
  writeFileSync(path.join(root, ".factory", "report.md"), lines.join("\n"));
  return failed.length === 0;
}

scaffold();
let checksPassed = results.every((result) => result.ok);
checksPassed =
  run("sync lockfile (pnpm install)", ["install", "--no-frozen-lockfile"]) && checksPassed;
checksPassed =
  run("format (prettier --write)", ["exec", "prettier", "--write", "."]) && checksPassed;
checksPassed = run("lint", ["lint"]) && checksPassed;
checksPassed = run("test", ["test"]) && checksPassed;
checksPassed = run("audit", ["audit"]) && checksPassed;
checksPassed = run("validate", ["validate"]) && checksPassed;
checksPassed = run("validate workflows", ["validate:workflows"]) && checksPassed;
checksPassed = run("build all (Chrome + Firefox, web-ext lint)", ["build:all"]) && checksPassed;
checksPassed = run("frozen install check", ["install", "--frozen-lockfile"]) && checksPassed;

if (checksPassed) {
  run("export unsigned browser releases", ["export:releases"]);
} else {
  results.push({
    title: "export unsigned browser releases (skipped: earlier check failed)",
    ok: false,
    tail: "SKIPPED: releases/ was not modified because one or more preceding checks failed.",
  });
}

const allPassed = writeReport();
run("format report", ["exec", "prettier", "--write", ".factory"], { record: false });
process.exitCode = allPassed ? 0 : 1;
