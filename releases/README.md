# חבילות התקנה לא חתומות

התיקייה מתעדכנת אוטומטית על ידי Factory Agent, ורק אחרי שכל הבדיקות, הבניות לשני הדפדפנים ובדיקת `pnpm install --frozen-lockfile` עברו בהצלחה.

לכל תוסף נשמרת רק הגרסה הנוכחית:

- `<slug>-<version>-chrome.zip` — חבילת התוסף ל-Chrome ולדפדפנים מבוססי Chromium.
- `<slug>-<version>-firefox.zip` — חבילת התוסף ל-Firefox.
- `release-info.json` — גרסת התוסף, שם התצוגה, זמן הבנייה, commit המקור, ושם, גודל ו-SHA-256 של כל ZIP.

**חשוב: הקבצים כאן אינם חתומים.**

## התקנה ב-Chrome

1. חלץ את קובץ ה-ZIP לתיקייה.
2. פתח את `chrome://extensions`.
3. הפעל Developer mode.
4. לחץ על Load unpacked ובחר את התיקייה שחילצת, שבה נמצא `manifest.json`.

## טעינה זמנית ב-Firefox

1. חלץ את קובץ ה-ZIP לתיקייה.
2. פתח את `about:debugging#/runtime/this-firefox`.
3. לחץ על Load Temporary Add-on.
4. בחר את קובץ `manifest.json` מתוך התיקייה שחילצת.

הטעינה ב-Firefox זמנית בלבד; התוסף יוסר עם סגירת הדפדפן.

## גרסה חתומה

הגרסה החתומה של Firefox מגיעה מ-GitHub Release שנוצר מתג גרסה. היא אינה נמצאת בתיקייה הזאת. חתימת Firefox והגשה ל-AMO ממשיכות להתבצע במסלולים הקיימים; אין כאן פרסום אוטומטי לחנויות.
