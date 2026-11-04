# מפעל תוספי דפדפן

תשתית Monorepo ליצירה, פיתוח, בדיקה, בנייה, אריזה ופרסום של תוספי **Manifest V3** ל־Chrome ולדפדפנים מבוססי Chromium (כולל Edge), ובמקביל ל־Firefox.

המאגר משתמש ב־TypeScript, pnpm workspaces, WXT, ESLint, Prettier ו־Vitest. כל תוסף נמצא בתיקייה עצמאית עם גרסה משלו. כל פקודת build ו־zip מייצרת גם Chromium וגם Firefox; אין מסלול בנייה חד־דפדפני כברירת מחדל.

## התחלה מהירה

דרישות: Node.js 26 LTS ו־pnpm 12. גרסת Node מוגדרת ב־`.nvmrc` וב־`engines`.

```bash
pnpm install
pnpm new
pnpm build hello-factory
pnpm test
pnpm lint
pnpm audit
pnpm validate
```

`pnpm new` מפעילה אשף שמבקש slug, שם תצוגה, תיאור, הרשאות ובחירת popup / options / content script / background. אחרי יצירת התוסף המחולל מתקין מחדש את תלויות ה־workspace כדי שאפשר יהיה לבנות אותו מיד.

## פקודות

| פקודה                                         | פעולה                                                               |
| --------------------------------------------- | ------------------------------------------------------------------- |
| `pnpm new`                                    | יצירת תוסף חדש מתוך התבנית                                          |
| `pnpm dev <slug>`                             | פיתוח ב־Chrome / Chromium                                           |
| `pnpm dev:firefox <slug>`                     | פיתוח ב־Firefox                                                     |
| `pnpm build <slug>`                           | בנייה ואימות לשני הדפדפנים + web-ext lint                           |
| `pnpm build:all`                              | בנייה של כל התוספים לשני הדפדפנים                                   |
| `pnpm zip <slug>`                             | ZIP ל־Chromium, ZIP ל־Firefox ו־ZIP של קוד המקור                    |
| `pnpm lint`                                   | ESLint ובדיקת פורמט Prettier                                        |
| `pnpm format`                                 | עיצוב קבצים באמצעות Prettier                                        |
| `pnpm test`                                   | בדיקות Vitest של הקוד המשותף                                        |
| `pnpm audit`                                  | בדיקת חולשות בתלויות; ראו את ההחרגה המנומקת ב־`pnpm-workspace.yaml` |
| `pnpm validate`                               | בדיקת קונפיגורציה, הרשאות, אייקונים וסודות                          |
| `pnpm sign:firefox <slug> --channel unlisted` | חתימת XPI להפצה עצמית                                               |
| `pnpm sign:firefox <slug> --channel listed`   | הגשה לערוץ הציבורי של AMO                                           |
| `pnpm publish:chrome <slug>`                  | העלאה ופרסום לחנות Chrome                                           |
| `pnpm publish:firefox <slug>`                 | קיצור דרך להגשת גרסת Firefox ל־AMO                                  |

## מבנה המאגר

- `extensions/` — כל תוסף בתיקייה עצמאית.
- `packages/shared/` — שכבת תאימות API, אחסון, הודעות, i18n, לוגים, שגיאות ואפשרויות.
- `templates/basic-extension/` — תבנית המקור למחולל.
- `tools/` — מחולל, בנייה, אריזה, ולידציה, חתימה ופרסום.
- `docs/` — הוראות התקנה, יצירת תוסף, חתימה ו־store checklist.
- `.github/workflows/` — CI, Release, פרסום ידני ו־CodeQL.
- `AGENTS.md` — כללי עבודה מחייבים למודלי AI ולמפתחים.

## עקרונות קבועים

1. כל תוסף חדש נבנה לשני הדפדפנים יחד.
2. מבקשים רק הרשאות שנדרשות לתכונה קיימת; הרשאות רחבות דורשות הצדקה מתועדת.
3. אין secrets, מפתחות פרטיים או OAuth tokens בקוד.
4. פרסום לחנויות לא מתרחש אוטומטית בעקבות push או tag. הוא דורש הפעלה ידנית ואישור מפורש.
5. לפני commit מריצים lint, tests, audit, validate ובנייה לשני הדפדפנים.

## מדריכים

- [הקמת סביבת פיתוח](docs/setup.md)
- [יצירת תוסף חדש](docs/new-extension.md)
- [חתימה ופרסום](docs/signing-and-publishing.md)
- [בדיקות לפני שליחה לחנויות](docs/store-checklist.md)

## תוסף הוכחה

`extensions/hello-factory` מדגים popup ששומר ערך ב־storage דרך `shared`, content script מצומצם ל־`https://example.com/*`, ו־background. הוא כולל locales בעברית ובאנגלית.

## רישיון

MIT. ראו [LICENSE](LICENSE).
