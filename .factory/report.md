# Factory run report

Overall: FAILED
Commit before run: 5196e09a312ef2bde41b79e22066429622afd2eb

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
  ├─ .output/chrome-mv3/_locales/en/messages.json                                660 B
  ├─ .output/chrome-mv3/_locales/he/messages.json                                719 B
  ├─ .output/chrome-mv3/icon.svg                                                 341 B
  ├─ .output/chrome-mv3/icons/128.png                                            2.06 kB
  ├─ .output/chrome-mv3/icons/16.png                                             360 B
  ├─ .output/chrome-mv3/icons/32.png                                             540 B
  ├─ .output/chrome-mv3/icons/48.png                                             937 B
  ├─ .output/chrome-mv3/vendor/ocr/core/tesseract-core-lstm.wasm                 2.86 MB
  ├─ .output/chrome-mv3/vendor/ocr/core/tesseract-core-relaxedsimd-lstm.wasm     2.86 MB
  ├─ .output/chrome-mv3/vendor/ocr/core/tesseract-core-relaxedsimd.wasm          3.46 MB
  ├─ .output/chrome-mv3/vendor/ocr/core/tesseract-core-simd-lstm.wasm            2.86 MB
  ├─ .output/chrome-mv3/vendor/ocr/core/tesseract-core-simd.wasm                 3.45 MB
  ├─ .output/chrome-mv3/vendor/ocr/core/tesseract-core.wasm                      3.45 MB
  ├─ .output/chrome-mv3/vendor/ocr/lang/eng.traineddata.gz                       2.95 MB
  └─ .output/chrome-mv3/vendor/ocr/lang/heb.traineddata.gz                       580.58 kB
Σ Total size: 48.92 MB
[success] Finished in 569 ms
[log]
WXT 0.21.5
[info] Building firefox-mv3 for production with Vite 8.3.5
[?25l
⠋ Preparing...[K
⠋ [1/2] background[K
⠋ [2/2] content[K
⠙ [2/2] content[K
[K[?25h
[K[?25h[success] Built extension in 226 ms
  ├─ .output/firefox-mv3/manifest.json                                            701 B
  ├─ .output/firefox-mv3/background.js                                            20.02 kB
  ├─ .output/firefox-mv3/content-scripts/content.js                               7.88 kB
  ├─ .output/firefox-mv3/vendor/ocr/core/tesseract-core-lstm.js                   89.26 kB
  ├─ .output/firefox-mv3/vendor/ocr/core/tesseract-core-lstm.wasm.js              3.90 MB
  ├─ .output/firefox-mv3/vendor/ocr/core/tesseract-core-relaxedsimd-lstm.js       89.36 kB
  ├─ .output/firefox-mv3/vendor/ocr/core/tesseract-core-relaxedsimd-lstm.wasm.js  3.91 MB
  ├─ .output/firefox-mv3/vendor/ocr/core/tesseract-core-relaxedsimd.js            89.07 kB
  ├─ .output/firefox-mv3/vendor/ocr/core/tesseract-core-relaxedsimd.wasm.js       4.70 MB
  ├─ .output/firefox-mv3/vendor/ocr/core/tesseract-core-simd-lstm.js              89.27 kB
  ├─ .output/firefox-mv3/vendor/ocr/core/tesseract-core-simd-lstm.wasm.js         3.90 MB
  ├─ .output/firefox-mv3/vendor/ocr/core/tesseract-core-simd.js                   88.98 kB
  ├─ .output/firefox-mv3/vendor/ocr/core/tesseract-core-simd.wasm.js              4.69 MB
  ├─ .output/firefox-mv3/vendor/ocr/core/tesseract-core.js                        88.97 kB
  ├─ .output/firefox-mv3/vendor/ocr/core/tesseract-core.wasm.js                   4.69 MB
  ├─ .output/firefox-mv3/vendor/ocr/worker.min.js                                 111.31 kB
  ├─ .output/firefox-mv3/_locales/en/messages.json                                660 B
  ├─ .output/firefox-mv3/_locales/he/messages.json                                719 B
  ├─ .output/firefox-mv3/icon.svg                                                 341 B
  ├─ .output/firefox-mv3/icons/128.png                                            2.06 kB
  ├─ .output/firefox-mv3/icons/16.png                                             360 B
  ├─ .output/firefox-mv3/icons/32.png                                             540 B
  ├─ .output/firefox-mv3/icons/48.png                                             937 B
  ├─ .output/firefox-mv3/vendor/ocr/core/tesseract-core-lstm.wasm                 2.86 MB
  ├─ .output/firefox-mv3/vendor/ocr/core/tesseract-core-relaxedsimd-lstm.wasm     2.86 MB
  ├─ .output/firefox-mv3/vendor/ocr/core/tesseract-core-relaxedsimd.wasm          3.46 MB
  ├─ .output/firefox-mv3/vendor/ocr/core/tesseract-core-simd-lstm.wasm            2.86 MB
  ├─ .output/firefox-mv3/vendor/ocr/core/tesseract-core-simd.wasm                 3.45 MB
  ├─ .output/firefox-mv3/vendor/ocr/core/tesseract-core.wasm                      3.45 MB
  ├─ .output/firefox-mv3/vendor/ocr/lang/eng.traineddata.gz                       2.95 MB
  └─ .output/firefox-mv3/vendor/ocr/lang/heb.traineddata.gz                       580.58 kB
Σ Total size: 48.92 MB
[success] Finished in 530 ms
$ tsx tools/cli.ts build-all
[warn] The following entrypoints have been skipped:
- offscreen
chrome: extension_pages CSP is missing or too permissive.
[ELIFECYCLE] Command failed with exit code 1.

```
