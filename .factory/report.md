# Factory run report

Overall: FAILED
Commit before run: 6fb2f025e760d6a6e5dc3e453e6015c0523d90aa

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
  'neratorFunction`:!1},e.mark=function(e){return Object.setPrototypeOf?Object.setPrototypeOf(e,y):(e.__proto__=y,l(e,',
  'c,`GeneratorFunction`)),e.prototype=Object.create(C),e},e.awrap=function(e){return{__await:e}};function T(e,t){function ',
  'T,e.async=function(t,n,r,i,a){a===void 0&&(a=Promise);var o=new T(u(t,n,r,i),a);return e.isGeneratorFunction(n)?o:o.next().then(function(e){return e.done?e.value:o.next()})};function E(e,t,n){var r=f;return f',
  'orts:{});try{regeneratorRuntime=n}catch{typeof globalThis==`object`?globalThis.regeneratorRuntime=n:Function(`r`,`regeneratorRuntime = r`)(n)}})),g=a(((e,t)=>{t.exports=(e,t)=>`${e}-${t}-${Math.random().toStr'
]
OCR CSP scan vendor/ocr/worker.min.js: [
  'alue:m,configurable:!0}),o(m,"constructor",{value:w,configurable:!0}),w.displayName=f(m,h,"GeneratorFunction"),t.isGeneratorFunction=function(t){var e="function"==typeof t&&t.constructor;return!!e&&(e===w||"G',
  'eneratorFunction"===(e.displayName||e.name))},t.mark=function(t){return Object.setPrototypeOf?Object.setPrototypeOf(',
  't,m):(t.__proto__=m,f(t,h,"GeneratorFunction")),t.prototype=Object.create(k),t},t.awrap=function(t){return{__await:t}},O(I.prototype),f(I.protot',
  'I,t.async=function(e,r,n,i,o){void 0===o&&(o=Promise);var a=new I(c(e,r,n,i),o);return t.isGeneratorFunction(r)?a:a.next().then((function(t){return t.done?t.value:a.next()}))},O(k),f(k,h,"Generator"),f(k,s,(f',
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
Validation Summary:

errors          0
notices         0
warnings        2

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

## Failure: package page-ocr (Chrome + Firefox + source ZIPs)

```
  'neratorFunction`:!1},e.mark=function(e){return Object.setPrototypeOf?Object.setPrototypeOf(e,y):(e.__proto__=y,l(e,',
  'c,`GeneratorFunction`)),e.prototype=Object.create(C),e},e.awrap=function(e){return{__await:e}};function T(e,t){function ',
  'T,e.async=function(t,n,r,i,a){a===void 0&&(a=Promise);var o=new T(u(t,n,r,i),a);return e.isGeneratorFunction(n)?o:o.next().then(function(e){return e.done?e.value:o.next()})};function E(e,t,n){var r=f;return f',
  'orts:{});try{regeneratorRuntime=n}catch{typeof globalThis==`object`?globalThis.regeneratorRuntime=n:Function(`r`,`regeneratorRuntime = r`)(n)}})),g=a(((e,t)=>{t.exports=(e,t)=>`${e}-${t}-${Math.random().toStr'
]
OCR CSP scan vendor/ocr/worker.min.js: [
  'alue:m,configurable:!0}),o(m,"constructor",{value:w,configurable:!0}),w.displayName=f(m,h,"GeneratorFunction"),t.isGeneratorFunction=function(t){var e="function"==typeof t&&t.constructor;return!!e&&(e===w||"G',
  'eneratorFunction"===(e.displayName||e.name))},t.mark=function(t){return Object.setPrototypeOf?Object.setPrototypeOf(',
  't,m):(t.__proto__=m,f(t,h,"GeneratorFunction")),t.prototype=Object.create(k),t},t.awrap=function(t){return{__await:t}},O(I.prototype),f(I.protot',
  'I,t.async=function(e,r,n,i,o){void 0===o&&(o=Promise);var a=new I(c(e,r,n,i),o);return t.isGeneratorFunction(r)?a:a.next().then((function(t){return t.done?t.value:a.next()}))},O(k),f(k,h,"Generator"),f(k,s,(f',
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
Validation Summary:

errors          0
notices         0
warnings        2

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
$ tsx tools/cli.ts zip page-ocr
[warn] The following entrypoints have been skipped:
- offscreen
Command failed (1): pnpm exec web-ext lint --source-dir /home/runner/work/Browser_Extension_Factory/Browser_Extension_Factory/extensions/page-ocr/.output/firefox-mv3 --warnings-as-errors
[ELIFECYCLE] Command failed with exit code 1.

```
