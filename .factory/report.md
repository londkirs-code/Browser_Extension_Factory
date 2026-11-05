# Factory run report

Overall: FAILED
Commit before run: 0fbab8a9008e7daa7bd208f948cff7b3e41f5649

| Step                                                             | Result |
| ---------------------------------------------------------------- | ------ |
| sync lockfile (pnpm install)                                     | PASS   |
| format (prettier --write)                                        | PASS   |
| lint                                                             | PASS   |
| test                                                             | PASS   |
| audit                                                            | PASS   |
| validate                                                         | PASS   |
| validate workflows                                               | PASS   |
| build all (Chrome + Firefox, web-ext lint)                       | FAIL   |
| frozen install check                                             | PASS   |
| export unsigned browser releases (skipped: earlier check failed) | FAIL   |

## Failure: build all (Chrome + Firefox, web-ext lint)

```
  ├─ .output/chrome-mv3/content-scripts/content.js  3.75 kB
  ├─ .output/chrome-mv3/assets/popup-4HrTtUNa.css   560 B
  ├─ .output/chrome-mv3/_locales/en/messages.json   615 B
  ├─ .output/chrome-mv3/_locales/he/messages.json   705 B
  ├─ .output/chrome-mv3/icon.svg                    341 B
  ├─ .output/chrome-mv3/icons/128.png               2.06 kB
  ├─ .output/chrome-mv3/icons/16.png                360 B
  ├─ .output/chrome-mv3/icons/32.png                540 B
  └─ .output/chrome-mv3/icons/48.png                937 B
Σ Total size: 15.71 kB
[success] Finished in 602 ms
[log]
WXT 0.21.5
[info] Building firefox-mv3 for production with Vite 8.3.5
[?25l
⠋ Preparing...[K
⠋ [1/3] background[K
⠋ [2/3] content[K
⠋ [3/3] popup[K
⠙ [3/3] popup[K
[K[?25h
[K[?25h[success] Built extension in 246 ms
  ├─ .output/firefox-mv3/manifest.json               826 B
  ├─ .output/firefox-mv3/popup.html                  681 B
  ├─ .output/firefox-mv3/background.js               819 B
  ├─ .output/firefox-mv3/chunks/popup-DsWQ67JC.js    3.67 kB
  ├─ .output/firefox-mv3/content-scripts/content.js  3.75 kB
  ├─ .output/firefox-mv3/assets/popup-4HrTtUNa.css   560 B
  ├─ .output/firefox-mv3/_locales/en/messages.json   615 B
  ├─ .output/firefox-mv3/_locales/he/messages.json   705 B
  ├─ .output/firefox-mv3/icon.svg                    341 B
  ├─ .output/firefox-mv3/icons/128.png               2.06 kB
  ├─ .output/firefox-mv3/icons/16.png                360 B
  ├─ .output/firefox-mv3/icons/32.png                540 B
  └─ .output/firefox-mv3/icons/48.png                937 B
Σ Total size: 15.86 kB
[success] Finished in 545 ms
Validation Summary:

errors          0
notices         0
warnings        0

hello-factory chrome bundle: 15.3 KB
hello-factory firefox bundle: 15.5 KB
Building page-ocr for Chrome/Chromium and Firefox.
[log]
WXT 0.21.5
[info] Building chrome-mv3 for production with Vite 8.3.5
[?25l
⠋ Preparing...[K
⠋ [1/3] background[K
⠋ [2/3] content[K
⠙ [2/3] content[K
⠙ [3/3] offscreen[K
⠹ [3/3] offscreen[K
[K[?25h
[K[?25h[fail] Command failed after 639 ms
$ tsx tools/cli.ts build-all
[error] Page OCR build verification failed: no chunks/offscreen-*.js files were emitted for chrome-mv3.
  at assertChromeOffscreenRunListener (wxt.config.ts:92:11)
  at async build:done (wxt.config.ts:152:7)
  at async internalBuild (/home/runner/work/Browser_Extension_Factory/Browser_Extension_Factory/node_modules/.pnpm/wxt@0.21.5_@typescript+typescript6@6.0.2_esbuild@0.28.2_eslint@10.14.0_jiti@2.7.0_suppo_b3527d754d373973afc8b162b61d85db/node_modules/wxt/dist/internal/internal-build.mjs:48:2)
  at async build (/home/runner/work/Browser_Extension_Factory/Browser_Extension_Factory/node_modules/.pnpm/wxt@0.21.5_@typescript+typescript6@6.0.2_esbuild@0.28.2_eslint@10.14.0_jiti@2.7.0_suppo_b3527d754d373973afc8b162b61d85db/node_modules/wxt/dist/build.mjs:20:9)
  at async /home/runner/work/Browser_Extension_Factory/Browser_Extension_Factory/node_modules/.pnpm/wxt@0.21.5_@typescript+typescript6@6.0.2_esbuild@0.28.2_eslint@10.14.0_jiti@2.7.0_suppo_b3527d754d373973afc8b162b61d85db/node_modules/wxt/dist/cli/commands.mjs:31:2
  at async CAC.<anonymous> (/home/runner/work/Browser_Extension_Factory/Browser_Extension_Factory/node_modules/.pnpm/wxt@0.21.5_@typescript+typescript6@6.0.2_esbuild@0.28.2_eslint@10.14.0_jiti@2.7.0_suppo_b3527d754d373973afc8b162b61d85db/node_modules/wxt/dist/cli/cli-utils.mjs:22:10)
  at async /home/runner/work/Browser_Extension_Factory/Browser_Extension_Factory/node_modules/.pnpm/wxt@0.21.5_@typescript+typescript6@6.0.2_esbuild@0.28.2_eslint@10.14.0_jiti@2.7.0_suppo_b3527d754d373973afc8b162b61d85db/node_modules/wxt/dist/cli/index.mjs:11:1
Error: ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL

  × "pnpm recursive exec" failed in /home/runner/work/
  │ Browser_Extension_Factory/Browser_Extension_Factory/extensions/page-ocr

Command failed (1): pnpm --filter @extensions/page-ocr exec wxt build -b chrome --mv3
[ELIFECYCLE] Command failed with exit code 1.

```

## Failure: export unsigned browser releases (skipped: earlier check failed)

```
SKIPPED: releases/ was not modified because one or more preceding checks failed.
```
