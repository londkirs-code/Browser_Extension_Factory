# Factory run report

Overall: FAILED
Commit before run: 3d4d5c1b0a831b1f20de1db251aeb649a16b4a9f

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
  └─ .output/firefox-mv3/vendor/ocr/lang/heb.traineddata.gz                       580.58 kB
Σ Total size: 48.93 MB
[success] Finished in 407 ms
Validation Summary:

errors          2
notices         0
warnings        0

ERRORS:

Code              Message       Description              File          Line
JS_SYNTAX_ERROR   JavaScript    There is a JavaScript    background…   1
                  syntax        syntax error in your     .js
                  error         code, which might be
                  (Parsing as   related to some
                  module        experimental
                  error:        JavaScript features
                  Unexpected    that aren't an
                  token $ at    official part of the
                  line: 1 and   language specification
                  column:       and therefore not
                  7846)         supported yet. The
                  (Parsing as   validation cannot
                  script        continue on this file.
                  error:
                  Unexpected
                  token $ at
                  line: 1 and
                  column:
                  7846)
JS_SYNTAX_ERROR   JavaScript    There is a JavaScript    vendor/ocr…   2
                  syntax        syntax error in your     /worker.mi…
                  error         code, which might be     n.js
                  (Parsing as   related to some
                  module        experimental
                  error:        JavaScript features
                  Unexpected    that aren't an
                  token use     official part of the
                  at line: 2    language specification
                  and column:   and therefore not
                  6960)         supported yet. The
                  (Parsing as   validation cannot
                  script        continue on this file.
                  error:
                  Unexpected
                  token use
                  at line: 2
                  and column:
                  6960)
$ tsx tools/cli.ts build-all
[warn] The following entrypoints have been skipped:
- offscreen
OCR worker syntax context: {
  line1: '&this.f()}a.prototype.f=function(){var t,e=this.buffer,r=e.length,n=new(o?Uint8Array:Array)(r<<1);if(o)n.set(e);else for(t=0;t<r;++t)n[t]=e[t];return this.buffer=n},a.prototype.d=function(t,e,r){var n',
  line2: ''
}
Command failed (1): pnpm exec web-ext lint --source-dir /home/runner/work/Browser_Extension_Factory/Browser_Extension_Factory/extensions/page-ocr/.output/firefox-mv3 --warnings-as-errors
[ELIFECYCLE] Command failed with exit code 1.

```

## Failure: package page-ocr (Chrome + Firefox + source ZIPs)

```
  └─ .output/firefox-mv3/vendor/ocr/lang/heb.traineddata.gz                       580.58 kB
Σ Total size: 48.93 MB
[success] Finished in 453 ms
Validation Summary:

errors          2
notices         0
warnings        0

ERRORS:

Code              Message       Description              File          Line
JS_SYNTAX_ERROR   JavaScript    There is a JavaScript    background…   1
                  syntax        syntax error in your     .js
                  error         code, which might be
                  (Parsing as   related to some
                  module        experimental
                  error:        JavaScript features
                  Unexpected    that aren't an
                  token $ at    official part of the
                  line: 1 and   language specification
                  column:       and therefore not
                  7846)         supported yet. The
                  (Parsing as   validation cannot
                  script        continue on this file.
                  error:
                  Unexpected
                  token $ at
                  line: 1 and
                  column:
                  7846)
JS_SYNTAX_ERROR   JavaScript    There is a JavaScript    vendor/ocr…   2
                  syntax        syntax error in your     /worker.mi…
                  error         code, which might be     n.js
                  (Parsing as   related to some
                  module        experimental
                  error:        JavaScript features
                  Unexpected    that aren't an
                  token use     official part of the
                  at line: 2    language specification
                  and column:   and therefore not
                  6960)         supported yet. The
                  (Parsing as   validation cannot
                  script        continue on this file.
                  error:
                  Unexpected
                  token use
                  at line: 2
                  and column:
                  6960)
$ tsx tools/cli.ts zip page-ocr
[warn] The following entrypoints have been skipped:
- offscreen
OCR worker syntax context: {
  line1: '&this.f()}a.prototype.f=function(){var t,e=this.buffer,r=e.length,n=new(o?Uint8Array:Array)(r<<1);if(o)n.set(e);else for(t=0;t<r;++t)n[t]=e[t];return this.buffer=n},a.prototype.d=function(t,e,r){var n',
  line2: ''
}
Command failed (1): pnpm exec web-ext lint --source-dir /home/runner/work/Browser_Extension_Factory/Browser_Extension_Factory/extensions/page-ocr/.output/firefox-mv3 --warnings-as-errors
[ELIFECYCLE] Command failed with exit code 1.

```
