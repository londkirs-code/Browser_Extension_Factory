# Factory run report

Overall: FAILED
Commit before run: b27d63672ec3f451dcdd220a213fb2f5bf329ffc

| Step                                              | Result |
| ------------------------------------------------- | ------ |
| sync lockfile (pnpm install)                      | PASS   |
| lint                                              | PASS   |
| test                                              | PASS   |
| audit                                             | PASS   |
| validate                                          | PASS   |
| validate workflows                                | PASS   |
| build all (Chrome + Firefox, web-ext lint)        | FAIL   |
| package page-ocr (Chrome + Firefox + source ZIPs) | FAIL   |
| frozen install check                              | PASS   |

## Failure: build all (Chrome + Firefox, web-ext lint)

```
  ├─ .output/firefox-mv3/vendor/ocr/core/tesseract-core-relaxedsimd-lstm.wasm     2.86 MB
  ├─ .output/firefox-mv3/vendor/ocr/core/tesseract-core-relaxedsimd.wasm          3.46 MB
  ├─ .output/firefox-mv3/vendor/ocr/core/tesseract-core-simd-lstm.wasm            2.86 MB
  ├─ .output/firefox-mv3/vendor/ocr/core/tesseract-core-simd.wasm                 3.45 MB
  ├─ .output/firefox-mv3/vendor/ocr/core/tesseract-core.wasm                      3.45 MB
  ├─ .output/firefox-mv3/vendor/ocr/lang/eng.traineddata.gz                       2.95 MB
  └─ .output/firefox-mv3/vendor/ocr/lang/heb.traineddata.gz                       580.58 kB
Σ Total size: 48.93 MB
[success] Finished in 571 ms
Validation Summary:

errors          0
notices         0
warnings        3

WARNINGS:

Code             Message       Description              File          Line   C
DANGEROUS_EVAL   The           Evaluation of strings    background…   1      7
                 Function      as code can lead to      .js
                 constructor   security
                 is eval.      vulnerabilities and
                               performance issues,
                               even in the most
                               innocuous of
                               circumstances. Please
                               avoid using `eval` and
                               the `Function`
                               constructor when at
                               all possible.
DANGEROUS_EVAL   The           Evaluation of strings    vendor/ocr…   2      6
                 Function      as code can lead to      /worker.mi…
                 constructor   security                 n.js
                 is eval.      vulnerabilities and
                               performance issues,
                               even in the most
                               innocuous of
                               circumstances. Please
                               avoid using `eval` and
                               the `Function`
                               constructor when at
                               all possible.
DANGEROUS_EVAL   The           Evaluation of strings    vendor/ocr…   2      1
                 Function      as code can lead to      /worker.mi…
                 constructor   security                 n.js
                 is eval.      vulnerabilities and
                               performance issues,
                               even in the most
                               innocuous of
                               circumstances. Please
                               avoid using `eval` and
                               the `Function`
                               constructor when at
                               all possible.
$ tsx tools/cli.ts build-all
[warn] The following entrypoints have been skipped:
- offscreen
Command failed (1): pnpm exec web-ext lint --source-dir /home/runner/work/Browser_Extension_Factory/Browser_Extension_Factory/extensions/page-ocr/.output/firefox-mv3 --warnings-as-errors
[ELIFECYCLE] Command failed with exit code 1.

```
