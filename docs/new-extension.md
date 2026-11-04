# יצירת תוסף חדש

## הדרך הרגילה

מתיקיית השורש מריצים:

```bash
pnpm new
```

האשף מבקש:

1. slug באותיות קטנות וב־kebab-case, למשל `reading-helper`.
2. שם תצוגה ותיאור.
3. הרשאות API חובה והרשאות אופציונליות.
4. האם ליצור popup, options page, content script ו־background service worker.
5. הרשאות host חובה ואופציונליות, וכן match patterns ל־content script כאשר נבחר.
6. קטגוריות מידע ש־Firefox צריך להצהיר עליהן כאשר התוסף מעביר נתונים מחוץ לתוסף. השארת שתי הרשימות ריקות מגדירה במפורש `required: ["none"]`.

בחר הרשאות מצומצמות ככל האפשר. אם נבחרה הרשאה רחבה כגון `<all_urls>`, `tabs`, `debugger` או host pattern רחב, האשף מבקש הצדקה ושומר אותה ב־`extension.config.json`.

המחולל מעתיק את `templates/basic-extension/`, יוצר Gecko ID ייחודי, משנה את package name, יוצר אייקוני PNG מ־`public/icon.svg`, משאיר רק את ה־entrypoints שנבחרו ומריץ `pnpm install --no-frozen-lockfile`. לכן אפשר לעבור ישירות לבנייה.

## פרמטרים לאשף

אפשר להריץ ללא אינטראקציה:

```bash
pnpm new -- --slug reading-helper --name "Reading Helper" --description "A short extension description" --permissions storage --optional-permissions notifications --popup true --options true --content-script true --background true --content-matches "https://example.com/*"
```

דגלים נוספים:

- `--host-permissions` — host patterns חובה, מופרדים בפסיקים.
- `--optional-host-permissions` — host patterns אופציונליים.
- `--broad-justification` — הצדקה להרשאות רחבות.
- `--no-popup`, `--no-options`, `--no-content-script`, `--no-background` — השבתת entrypoint.
- `--help` — הצגת תחביר.

הערכי `--permissions`, `--optional-permissions`, `--host-permissions`, `--content-matches`, `--firefox-data-collection-required` ו־`--firefox-data-collection-optional` מקבלים רשימה מופרדת בפסיקים. רשימות הנתונים מקבלות את הערכים המוגדרים ב־Mozilla; ברירת המחדל היא `none` ב־required ו־רשימה ריקה ב־optional.

## מה מתקבל

`extensions/<slug>/` כולל:

- `wxt.config.ts` ו־`extension.config.json` עבור שני הדפדפנים, כולל `gecko.data_collection_permissions` חובה ב־Firefox MV3.
- `browser_specific_settings.gecko.id` ו־`strict_min_version` של Firefox.
- `minimum_chrome_version` של Chromium.
- CSP קשיח, הרשאות מינימליות ואפשרות ל־Chrome `key` קבוע.
- entrypoints לפי בחירה.
- אייקוני 16, 32, 48 ו־128 פיקסלים שנוצרים מקובץ SVG אחד.
- locales באנגלית ובעברית, כולל כיוון RTL במסכי הדוגמה.
- README, CHANGELOG, BUILD והודעות/חומרי חנות.

## Chrome extension key קבוע לפיתוח

ברירת המחדל משאירה את `chromeKey` ריק. אם יש צורך במזהה קבוע לתוסף unpacked במהלך פיתוח, אפשר להפיק public key מתהליך האריזה/ההפצה של Chrome Web Store ולהכניס את מחרוזת ה־Base64 לשדה `chromeKey` ב־`extension.config.json`. WXT יוסיף `key` ל־manifest של Chromium בלבד. זהו public key, לא private signing key; אין להכניס private key למאגר.

ה־key אינו מחליף את מזהה הפריט בחנות ואינו נדרש לתהליך הבנייה הרגיל. יש לשמור על אותו key בין גרסאות אם משתמשים בו.

## גרסה ובנייה

הגרסה העצמאית של התוסף נמצאת **רק** ב־`extensions/<slug>/package.json`. WXT מעתיק אותה ל־manifest של שני הדפדפנים. הגדל את `version` שם ועדכן את אותה גרסה ב־`CHANGELOG.md`.

```bash
pnpm dev reading-helper
pnpm dev:firefox reading-helper
pnpm build reading-helper
pnpm zip reading-helper
```

`build` ו־`zip` מייצרים תמיד שתי גרסאות. אין להגדיר יעד דפדפן יחיד ב־WXT אלא אם המשתמש ביקש במפורש חריג.
