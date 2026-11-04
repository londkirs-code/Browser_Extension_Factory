import { readFile } from "node:fs/promises";

const apiRoot = "https://chromewebstore.googleapis.com/v2";
const uploadRoot = "https://chromewebstore.googleapis.com/upload/v2";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error("Missing required environment variable: " + name);
  return value;
}
async function fail(response: Response): Promise<never> {
  throw new Error("Chrome Web Store API returned HTTP " + response.status + ": " + await response.text());
}
async function obtainAccessToken(): Promise<string> {
  const form = new URLSearchParams({
    client_id: required("CHROME_CLIENT_ID"),
    client_secret: required("CHROME_CLIENT_SECRET"),
    refresh_token: required("CHROME_REFRESH_TOKEN"),
    grant_type: "refresh_token",
  });
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form,
  });
  if (!response.ok) return fail(response);
  const payload = await response.json() as { access_token?: string };
  if (!payload.access_token) throw new Error("OAuth response did not contain an access token.");
  return payload.access_token;
}

export async function publishChromePackage(extensionId: string, packagePath: string): Promise<void> {
  const publisherId = required("CHROME_PUBLISHER_ID");
  const token = await obtainAccessToken();
  const resource = "/publishers/" + encodeURIComponent(publisherId) + "/items/" + encodeURIComponent(extensionId);
  const archive = await readFile(packagePath);
  const upload = await fetch(uploadRoot + resource + ":upload", {
    method: "POST",
    headers: { Authorization: "Bearer " + token, "Content-Type": "application/zip" },
    body: archive,
  });
  if (!upload.ok) return fail(upload);

  const uploadState = await upload.json().catch(() => ({})) as { uploadState?: string };
  if (uploadState.uploadState === "UPLOAD_IN_PROGRESS") {
    let completed = false;
    for (let attempt = 0; attempt < 60; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 5_000));
      const status = await fetch(apiRoot + resource + ":fetchStatus", {
        headers: { Authorization: "Bearer " + token },
      });
      if (!status.ok) return fail(status);
      const result = await status.json() as { uploadState?: string };
      if (result.uploadState === "FAILURE") throw new Error("Chrome Web Store package processing failed.");
      if (result.uploadState !== "UPLOAD_IN_PROGRESS") {
        completed = true;
        break;
      }
    }
    if (!completed) throw new Error("Timed out while waiting for Chrome Web Store package processing.");
  }

  const published = await fetch(apiRoot + resource + ":publish", {
    method: "POST",
    headers: { Authorization: "Bearer " + token },
  });
  if (!published.ok) return fail(published);
  const result = await published.json().catch(() => ({}));
  console.log("Chrome Web Store submission response: " + JSON.stringify(result));
}
