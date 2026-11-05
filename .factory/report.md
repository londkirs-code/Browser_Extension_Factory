# Factory run report

Overall: FAILED
Commit before run: 67fa43f13dec17a4b44d90443e99c06df6e21f96

| Step                                       | Result |
| ------------------------------------------ | ------ |
| sync lockfile (pnpm install)               | PASS   |
| lint                                       | PASS   |
| test                                       | PASS   |
| audit                                      | PASS   |
| validate                                   | PASS   |
| validate workflows                         | PASS   |
| build all (Chrome + Firefox, web-ext lint) | FAIL   |
| frozen install check                       | PASS   |

## Failure: build all (Chrome + Firefox, web-ext lint)

```

hello-factory chrome bundle: 15.3 KB
hello-factory firefox bundle: 15.5 KB
Building page-ocr for Chrome/Chromium and Firefox.
[log]
WXT 0.21.5
[info] Building chrome-mv3 for production with Vite 8.3.5
[?25l
⠋ Preparing...[K
⠋ [1/2] background[K
⠋ [2/2] content[K
⠙ [2/2] content[K
[K[?25h
[K[?25h[success] Built extension in 195 ms
  ├─ .output/chrome-mv3/manifest.json               523 B
  ├─ .output/chrome-mv3/background.js               1.28 kB
  ├─ .output/chrome-mv3/content-scripts/content.js  7.87 kB
  ├─ .output/chrome-mv3/_locales/en/messages.json   660 B
  ├─ .output/chrome-mv3/_locales/he/messages.json   719 B
  ├─ .output/chrome-mv3/icon.svg                    341 B
  ├─ .output/chrome-mv3/icons/128.png               2.06 kB
  ├─ .output/chrome-mv3/icons/16.png                360 B
  ├─ .output/chrome-mv3/icons/32.png                540 B
  └─ .output/chrome-mv3/icons/48.png                937 B
Σ Total size: 15.29 kB
[success] Finished in 455 ms
[log]
WXT 0.21.5
[info] Building firefox-mv3 for production with Vite 8.3.5
[?25l
⠋ Preparing...[K
⠋ [1/2] background[K
⠋ [2/2] content[K
⠙ [2/2] content[K
[K[?25h
[K[?25h[success] Built extension in 190 ms
  ├─ .output/firefox-mv3/manifest.json               682 B
  ├─ .output/firefox-mv3/background.js               1.28 kB
  ├─ .output/firefox-mv3/content-scripts/content.js  7.87 kB
  ├─ .output/firefox-mv3/_locales/en/messages.json   660 B
  ├─ .output/firefox-mv3/_locales/he/messages.json   719 B
  ├─ .output/firefox-mv3/icon.svg                    341 B
  ├─ .output/firefox-mv3/icons/128.png               2.06 kB
  ├─ .output/firefox-mv3/icons/16.png                360 B
  ├─ .output/firefox-mv3/icons/32.png                540 B
  └─ .output/firefox-mv3/icons/48.png                937 B
Σ Total size: 15.45 kB
[success] Finished in 449 ms
Validation Summary:

errors          0
notices         0
warnings        1

WARNINGS:

Code                    Message      Description              File          Li
UNSAFE_VAR_ASSIGNMENT   Unsafe       Due to both security     content-sc…   1
                        assignment   and performance          ripts/cont…
                        to           concerns, this may not   ent.js
                        innerHTML    be set using dynamic
                                     values which have not
                                     been adequately
                                     sanitized. This can
                                     lead to security
                                     issues or fairly
                                     serious performance
                                     degradation.
$ tsx tools/cli.ts build-all
Command failed (1): pnpm exec web-ext lint --source-dir /home/runner/work/Browser_Extension_Factory/Browser_Extension_Factory/extensions/page-ocr/.output/firefox-mv3 --warnings-as-errors
[ELIFECYCLE] Command failed with exit code 1.

```
