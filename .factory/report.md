# Factory run report

Overall: FAILED
Commit before run: 3fac7b16b133c1efa4b051bca7c206a232c4a2f7

| Step                                                             | Result |
| ---------------------------------------------------------------- | ------ |
| sync lockfile (pnpm install)                                     | PASS   |
| format (prettier --write)                                        | PASS   |
| lint                                                             | FAIL   |
| test                                                             | PASS   |
| audit                                                            | PASS   |
| validate                                                         | PASS   |
| validate workflows                                               | PASS   |
| build all (Chrome + Firefox, web-ext lint)                       | PASS   |
| frozen install check                                             | PASS   |
| export unsigned browser releases (skipped: earlier check failed) | FAIL   |

## Failure: lint

```

/home/runner/work/Browser_Extension_Factory/Browser_Extension_Factory/tools/factory-run.ts
  114:3  error  The value assigned to 'checksPassed' is not used in subsequent statements  no-useless-assignment

✖ 1 problem (1 error, 0 warnings)

$ eslint . && prettier --check .
[ELIFECYCLE] Command failed with exit code 1.

```

## Failure: export unsigned browser releases (skipped: earlier check failed)

```
SKIPPED: releases/ was not modified because one or more preceding checks failed.
```
