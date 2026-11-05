# Factory run report

Overall: FAILED
Commit before run: 8ea0131ed5a50ed7e2790ff87e373886559bea9c

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
[success] Finished in 334 ms
Validation Summary:

errors          0
notices         0
warnings        0

hello-factory chrome bundle: 15.3 KB
hello-factory firefox bundle: 15.5 KB
Building page-ocr for Chrome/Chromium and Firefox.
[log]
WXT 0.21.5
[fail] Command failed after 212 ms
$ tsx tools/cli.ts build-all
Tesseract worker Function snippets: [
  'alue:m,configurable:!0}),o(m,"constructor",{value:w,configurable:!0}),w.displayName=f(m,h,"GeneratorFunction"),t.isGeneratorFunction=function(t){var e="function"==typeof t&&t.constructor;return!!e&&(e===w||"G',
  'eneratorFunction"===(e.displayName||e.name))},t.mark=function(t){return Object.setPrototypeOf?Object.setPrototypeOf(',
  't,m):(t.__proto__=m,f(t,h,"GeneratorFunction")),t.prototype=Object.create(k),t},t.awrap=function(t){return{__await:t}},O(I.prototype),f(I.protot',
  'I,t.async=function(e,r,n,i,o){void 0===o&&(o=Promise);var a=new I(c(e,r,n,i),o);return t.isGeneratorFunction(r)?a:a.next().then((function(t){return t.done?t.value:a.next()}))},O(k),f(k,h,"Generator"),f(k,s,(f',
  'bject"===("undefined"==typeof globalThis?"undefined":n(globalThis))?globalThis.regeneratorRuntime=i:Function("r","regeneratorRuntime = r")(i)}},54:t=>{"use strict";t.exports={COLOR:0,GREY:1,BINARY:2}},65:func',
  '1,4,1,96,0,0,3,2,1,0,5,4,1,3,1,1,10,11,1,9,0,65,0,254,16,2,0,26,11])),typeReflection:()=>(async()=>"Function"in WebAssembly)(),typedFunctionReferences:()=>(async()=>{try{return new WebAssembly.Module(Uint8Arr',
  'alue:A,configurable:!0}),o(A,"constructor",{value:m,configurable:!0}),m.displayName=c(A,f,"GeneratorFunction"),e.isGeneratorFunction=function(t){var e="function"==typeof t&&t.constructor;return!!e&&(e===m||"G',
  'eneratorFunction"===(e.displayName||e.name))},e.mark=function(t){return Object.setPrototypeOf?Object.setPrototypeOf(',
  't,A):(t.__proto__=A,c(t,f,"GeneratorFunction")),t.prototype=Object.create(O),t},e.awrap=function(t){return{__await:t}},I(U.prototype),c(U.protot',
  'U,e.async=function(t,r,n,i,o){void 0===o&&(o=Promise);var a=new U(l(t,r,n,i),o);return e.isGeneratorFunction(r)?a:a.next().then((function(t){return t.done?t.value:a.next()}))},I(O),c(O,f,"Generator"),c(O,s,(f',
  'alue:A,configurable:!0}),a(A,"constructor",{value:m,configurable:!0}),m.displayName=c(A,f,"GeneratorFunction"),e.isGeneratorFunction=function(t){var e="function"==typeof t&&t.constructor;return!!e&&(e===m||"G',
  'eneratorFunction"===(e.displayName||e.name))},e.mark=function(t){return Object.setPrototypeOf?Object.setPrototypeOf(',
  't,A):(t.__proto__=A,c(t,f,"GeneratorFunction")),t.prototype=Object.create(O),t},e.awrap=function(t){return{__await:t}},I(U.prototype),c(U.protot',
  'U,e.async=function(t,r,n,i,o){void 0===o&&(o=Promise);var a=new U(l(t,r,n,i),o);return e.isGeneratorFunction(r)?a:a.next().then((function(t){return t.done?t.value:a.next()}))},I(O),c(O,f,"Generator"),c(O,u,(f',
  '!0,get:e[n]})},r.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(t){if("object"==typeof window)return window}}(),r.o=(t,e)=>Object.prototype.'
]
[error] The expected regenerator-runtime fallback was not found in worker.min.js.
  at copyOcrAssets (wxt.config.ts:72:11)
  at async build:before (wxt.config.ts:106:7)
  at async internalBuild (/home/runner/work/Browser_Extension_Factory/Browser_Extension_Factory/node_modules/.pnpm/wxt@0.21.5_@typescript+typescript6@6.0.2_esbuild@0.28.2_eslint@10.14.0_jiti@2.7.0_suppo_b3527d754d373973afc8b162b61d85db/node_modules/wxt/dist/internal/internal-build.mjs:30:2)
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

## Failure: package page-ocr (Chrome + Firefox + source ZIPs)

```
Building page-ocr for Chrome/Chromium and Firefox.
[log]
WXT 0.21.5
[fail] Command failed after 211 ms
$ tsx tools/cli.ts zip page-ocr
Tesseract worker Function snippets: [
  'alue:m,configurable:!0}),o(m,"constructor",{value:w,configurable:!0}),w.displayName=f(m,h,"GeneratorFunction"),t.isGeneratorFunction=function(t){var e="function"==typeof t&&t.constructor;return!!e&&(e===w||"G',
  'eneratorFunction"===(e.displayName||e.name))},t.mark=function(t){return Object.setPrototypeOf?Object.setPrototypeOf(',
  't,m):(t.__proto__=m,f(t,h,"GeneratorFunction")),t.prototype=Object.create(k),t},t.awrap=function(t){return{__await:t}},O(I.prototype),f(I.protot',
  'I,t.async=function(e,r,n,i,o){void 0===o&&(o=Promise);var a=new I(c(e,r,n,i),o);return t.isGeneratorFunction(r)?a:a.next().then((function(t){return t.done?t.value:a.next()}))},O(k),f(k,h,"Generator"),f(k,s,(f',
  'bject"===("undefined"==typeof globalThis?"undefined":n(globalThis))?globalThis.regeneratorRuntime=i:Function("r","regeneratorRuntime = r")(i)}},54:t=>{"use strict";t.exports={COLOR:0,GREY:1,BINARY:2}},65:func',
  '1,4,1,96,0,0,3,2,1,0,5,4,1,3,1,1,10,11,1,9,0,65,0,254,16,2,0,26,11])),typeReflection:()=>(async()=>"Function"in WebAssembly)(),typedFunctionReferences:()=>(async()=>{try{return new WebAssembly.Module(Uint8Arr',
  'alue:A,configurable:!0}),o(A,"constructor",{value:m,configurable:!0}),m.displayName=c(A,f,"GeneratorFunction"),e.isGeneratorFunction=function(t){var e="function"==typeof t&&t.constructor;return!!e&&(e===m||"G',
  'eneratorFunction"===(e.displayName||e.name))},e.mark=function(t){return Object.setPrototypeOf?Object.setPrototypeOf(',
  't,A):(t.__proto__=A,c(t,f,"GeneratorFunction")),t.prototype=Object.create(O),t},e.awrap=function(t){return{__await:t}},I(U.prototype),c(U.protot',
  'U,e.async=function(t,r,n,i,o){void 0===o&&(o=Promise);var a=new U(l(t,r,n,i),o);return e.isGeneratorFunction(r)?a:a.next().then((function(t){return t.done?t.value:a.next()}))},I(O),c(O,f,"Generator"),c(O,s,(f',
  'alue:A,configurable:!0}),a(A,"constructor",{value:m,configurable:!0}),m.displayName=c(A,f,"GeneratorFunction"),e.isGeneratorFunction=function(t){var e="function"==typeof t&&t.constructor;return!!e&&(e===m||"G',
  'eneratorFunction"===(e.displayName||e.name))},e.mark=function(t){return Object.setPrototypeOf?Object.setPrototypeOf(',
  't,A):(t.__proto__=A,c(t,f,"GeneratorFunction")),t.prototype=Object.create(O),t},e.awrap=function(t){return{__await:t}},I(U.prototype),c(U.protot',
  'U,e.async=function(t,r,n,i,o){void 0===o&&(o=Promise);var a=new U(l(t,r,n,i),o);return e.isGeneratorFunction(r)?a:a.next().then((function(t){return t.done?t.value:a.next()}))},I(O),c(O,f,"Generator"),c(O,u,(f',
  '!0,get:e[n]})},r.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(t){if("object"==typeof window)return window}}(),r.o=(t,e)=>Object.prototype.'
]
[error] The expected regenerator-runtime fallback was not found in worker.min.js.
  at copyOcrAssets (wxt.config.ts:72:11)
  at async build:before (wxt.config.ts:106:7)
  at async internalBuild (/home/runner/work/Browser_Extension_Factory/Browser_Extension_Factory/node_modules/.pnpm/wxt@0.21.5_@typescript+typescript6@6.0.2_esbuild@0.28.2_eslint@10.14.0_jiti@2.7.0_suppo_b3527d754d373973afc8b162b61d85db/node_modules/wxt/dist/internal/internal-build.mjs:30:2)
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
